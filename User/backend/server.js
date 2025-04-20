const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(cors({
    origin: ["http://localhost:5173", "https://admin-web-site.netlify.app"],
    credentials: true,
  }));
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




const uri = "mongodb+srv://visara1327:bp2ZiF4n9Ri7lyD7@mycluster.w0gv3.mongodb.net/myDatabase?retryWrites=true&w=majority";
const db = mongoose.connection;


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected to Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

    // ✅ Schema & Model
const userDetailsSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String },
    coins: { type: Number, default: 0 }
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema, "UserDetails");



const shopProductSchema = new mongoose.Schema({
    shopName: String,
    productName: String,
    price: Number,
    quantity: Number,
    category: String
});

const ShopProduct = mongoose.model("ShopProduct", shopProductSchema);

const userSchema = new mongoose.Schema({
    userID: String,
    username: String,
    coins: Number,
});

const User = mongoose.model("User", userSchema, "UserDetails");





const orderSchema = new mongoose.Schema({
    userID: String,
    shopName: String,
    productName: String,
    quantity: Number,
    price: Number,
    totalAmount: Number,
    orderId: Number,
    timestamp: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false },
    status: { type: String, default: "Pending" },  // ✅ Existing

    viewed: { type: Boolean, default: false } // 👈 NEW
    // ✅ New
}, { collection: "OrderDetails" });

const OrderDetails = mongoose.model("OrderDetails", orderSchema);

// const UserDetails = mongoose.model("UserDetails", userDetailsSchema, "UserDetails");

// ✅ Define Shop Schema and Model inside index.js
const shopSchema = new mongoose.Schema({
    shopName: { type: String, required: true, unique: true },  // ✅ Prevent duplicates
    shopOwnerName: { type: String, required: true },
    password: { type: String, default: "" }
}, { collection: "ShopDetails" });

const ShopDetails = mongoose.model("ShopDetails", shopSchema, "ShopDetails");


// ✅ API to Get Coins for a Specific User
app.get("/api/user-details/:userID", async (req, res) => {
    try {
        const user = await UserDetails.findOne({ userID: req.params.userID });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user coins:", error);
        res.status(500).json({ error: "Error fetching user coins" });
    }
});

app.get("/api/shops", async (req, res) => {
    try {
        const shops = await ShopDetails.find({}, "shopName shopOwnerName");
        res.status(200).json(shops); // response is JSON
    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({ error: "Internal server error" }); //  Return JSON instead of HTML
    }
});


app.get('/api/report', async (req, res) => {
    const { userID, month, year } = req.query;

    if (!userID || !month || !year) {
        return res.status(400).json({ error: "User ID, Month, and Year are required" });
    }

    try {
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(`${year}-${month}-31`);

        const orders = await OrderDetails.find({
            userID: userID,
            delivered: true, //  Only include delivered orders
            timestamp: { $gte: startDate, $lte: endDate }
        }).select("shopName productName quantity totalAmount timestamp");

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Error fetching orders" });
    }
});



app.get("/api/orders/user/:userID", async (req, res) => {
    try {
        const orders = await OrderDetails.aggregate([
            { $match: { userID: req.params.userID, viewed: false } },
            {
                $group: {
                    _id: "$orderId",
                    orderId: { $first: "$orderId" },
                    shopName: { $first: "$shopName" },
                    status: { $first: "$status" },
                    products: {
                        $push: {
                            productName: "$productName",
                            quantity: "$quantity",
                            price: "$price"
                        }
                    },
                    totalAmount: { $sum: "$totalAmount" }, // ✅ Summing all amounts
                    timestamp: { $first: "$timestamp" }
                }
            },
            { $sort: { timestamp: -1 } }
        ]);

        res.json(orders);
    } catch (error) {
        console.error("Error fetching user's unviewed orders:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// PUT /api/orders/viewed/:id
app.put("/api/orders/viewed/:orderId", async (req, res) => {
    try {
        await OrderDetails.updateMany(
            { orderId: req.params.orderId },
            { $set: { viewed: true } }
        );
        res.json({ message: "Order marked as viewed" });
    } catch (error) {
        console.error("Error updating viewed status:", error);
        res.status(500).json({ error: "Failed to update viewed status" });
    }
});




// ✅ API to check if user exists
app.post('/api/check-user-details', async (req, res) => {
    // console.log("Incoming Request Body:", req.body); // Debugging

    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ error: 'UserID is required' });
    }

    try {
        const user = await UserDetails.findOne({ userID });
        // console.log("Found User:", user); // Debugging

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            message: user.password ? 'Password exists' : 'Set new password',
            hasPassword: !!user.password
        });

    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



// ✅ Login API
app.post("/api/login-user-details", async (req, res) => {
    try {
        const { userID, password } = req.body;

        const user = await UserDetails.findOne({ userID });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Include `coins` in the response
        res.json({
            message: "Login successful",
            userID: user.userID,
            username: user.username,
            coins: user.coins
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// ✅ Set Password API
app.post("/api/set-user-password", async (req, res) => {
    const { userID, newPassword, confirmPassword } = req.body;

    if (!userID || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const user = await UserDetails.findOneAndUpdate(
            { userID },
            { password: newPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Password set successfully" });
    } catch (error) {
        console.error("Set password error:", error);
        res.status(500).json({ error: "Failed to set password" });
    }
});



// ✅ API to Register New User
app.post("/api/register", async (req, res) => {
    const { userID, username, password } = req.body;

    if (!userID || !username || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await UserDetails.findOne({ userID });

        if (existingUser) {
            return res.status(400).json({ error: "UserID already exists" });
        }

        const newUser = new UserDetails({ userID, username, password, coins: 0 });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});


app.get("/api/products/:shopName", async (req, res) => {
    try {
        const { shopName } = req.params;

        // Ensure the collection name is correct
        const ShopProducts = mongoose.model(shopName, shopProductSchema, shopName);
        const products = await ShopProducts.find({});

        res.status(200).json(products); //  Return JSON
    } catch (error) {
        console.error(`Error fetching products for ${req.params.shopName}:`, error);
        res.status(500).json({ error: "Internal server error" }); //  Return JSON
    }
});



app.post("/api/buy", async (req, res) => {
    try {
        const { username, cart } = req.body;
        const shopName = cart[0]?.shopName;

        // console.log("Received from client:", req.body);

        if (!username || !cart || cart.length === 0) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const user = await UserDetails.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const userID = user.userID;
        const productCollection = mongoose.connection.collection(shopName);

        let totalCost = 0;

        for (let item of cart) {
            const product = await productCollection.findOne({ productName: item.productName });

            if (!product) {
                return res.status(404).json(`{ message: Product ${item.productName} not found }`);
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json(`{ message: Not enough stock for ${item.productName} }`);
            }

            totalCost += item.price * item.quantity;
        }

        if (user.coins < totalCost) {
            return res.status(400).json({ message: "Not enough coins" });
        }

        user.coins -= totalCost;
        await user.save();

        for (let item of cart) {
            await productCollection.updateOne(
                { productName: item.productName },
                { $inc: { quantity: -item.quantity } }
            );
        }

        const orderId = Math.floor(1000 + Math.random() * 9000);

        const orders = cart.map(item => ({
            userID: user.userID,
            shopName,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            totalAmount: item.quantity * item.price,
            orderId,
            timestamp: new Date()
        }));

        await OrderDetails.insertMany(orders);

        res.json({
            message: "Purchase successful!",
            orderId,
            remainingCoins: user.coins,
            orders
        });

    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//  Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));