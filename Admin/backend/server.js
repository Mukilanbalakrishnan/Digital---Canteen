const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(
    cors({
        origin: [
            "http://localhost:5173",                        // Vite dev server
            "http://localhost:3000",                        // CRA dev server
            "https://radiant-meerkat-5f7312.netlify.app"      // ✅ your actual Netlify domain
        ],
        credentials: true,
    })
);

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

// ✅ Define Shop Schema and Model inside index.js
const shopSchema = new mongoose.Schema({
    shopName: { type: String, required: true, unique: true },  // ✅ Prevent duplicates
    shopOwnerName: { type: String, required: true },
    password: { type: String, default: "" }
}, { collection: "ShopDetails" });

const ShopDetails = mongoose.model("ShopDetails", shopSchema, "ShopDetails");


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



app.get("/api/shops", async (req, res) => {
    try {
        const shops = await ShopDetails.find({}, "shopName shopOwnerName");
        res.status(200).json(shops); // response is JSON
    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({ error: "Internal server error" }); //  Return JSON instead of HTML
    }
});

// ✅ API to get all users with coins
app.get("/api/user-details", async (req, res) => {
    try {
        const users = await UserDetails.find({}, "userID username coins");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
});

// ✅ API to Update Coins
app.post("/api/update-coins", async (req, res) => {
    const { userID, amount } = req.body;

    if (!userID || amount === undefined) {
        return res.status(400).json({ error: "Missing userID or amount" });
    }

    try {
        const user = await UserDetails.findOne({ userID });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.coins += amount;
        await user.save();

        res.json({ success: true, coins: user.coins });
    } catch (error) {
        console.error("Error updating coins:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/api/add-shop", async (req, res) => {
    try {
        const { shopName, shopOwnerName } = req.body;

        if (!shopName || !shopOwnerName) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const sanitizedShopName = shopName.replace(/\s+/g, '_').toLowerCase();

        const existingShop = await ShopDetails.findOne({ shopName });

        if (existingShop) {
            return res.status(400).json({ error: "Shop name already exists" });
        }

        const newShop = new ShopDetails({ shopName, shopOwnerName });
        await newShop.save();

        const shopSchema = new mongoose.Schema({
            productName: String,
            quantity: Number,
            price: Number,
            category: String
        }, { timestamps: true });

        const ShopModel = mongoose.models[sanitizedShopName] ||
            mongoose.model(sanitizedShopName, shopSchema, sanitizedShopName);

        await ShopModel.create({
            productName: "Sample Product",
            quantity: 0,
            price: 0,
            category: "Sample Category"
        });

        res.status(201).json({ success: true, message: "Shop added successfully and collection created" });

    } catch (error) {
        console.error("Error adding shop:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get("/api/shop-details", async (req, res) => {
    const { shopName } = req.query;
    const products = await db.collection(shopName).find().toArray();

    res.json(products);
});

app.get("/api/orders/total/:shopName", async (req, res) => {
    try {
        const totalAmount = await OrderDetails.aggregate([
            {
                $match: {
                    shopName: req.params.shopName,
                    delivered: true // Only consider orders where deliver is true
                }
            },
            {
                $group: {
                    _id: "$shopName",
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        if (totalAmount.length > 0) {
            res.json(totalAmount[0]);
        } else {
            res.json({ totalAmount: 0 });
        }
    } catch (error) {
        console.error("Error fetching total amount for shop:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



//  Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));