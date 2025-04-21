const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(cors({
    origin: ["http://localhost:5173", "https://shopadmin-web-site.netlify.app"],
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



// ============================ SHOPS API ======================================



// TO FETCH SHOPPS
app.get("/api/shops", async (req, res) => {
    try {
        const shops = await ShopDetails.find({}, "shopName shopOwnerName");
        res.status(200).json(shops); // ✅ Ensure response is JSON
    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({ error: "Internal server error" }); // ✅ Return JSON instead of HTML
    }
});




// TO HANDLE SHOP CLICK
app.get("/api/get-shop", async (req, res) => {
    try {
        const { shopName } = req.query;
        const shop = await ShopDetails.findOne({ shopName });

        if (shop) {
            return res.json({
                exists: true,
                shopName: shop.shopName,
                shopOwnerName: shop.shopOwnerName,
                passwordExists: !!shop.password // true if password is set
            });
        } else {
            return res.json({ exists: false, message: "Shop not found" });
        }
    } catch (error) {
        console.error("Error fetching shop:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




// API to validate shop password
app.post("/api/validate-shop", async (req, res) => {
    console.log("🔹 API /validate-shop called");

    // ✅ Debug: Log DB status
    console.log("🔹 DB Object:", db);

    if (!db) {
        console.error("❌ Database not connected!");
        return res.status(500).json({ success: false, message: "Database not connected" });
    }

    try {
        const { shopName, password } = req.body;
        console.log("🔹 Received:", shopName, password);

        const shop = await db.collection("ShopDetails").findOne({ shopName });
        console.log("🔹 Shop Found:", shop);

        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }
        if (shop.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        res.json({ success: true, message: "Shop validated successfully" });
    } catch (error) {
        console.error("❌ Error in /api/validate-shop:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});





// TO HANDLE SETTING NEW PASSWORD
app.post("/api/set-password", async (req, res) => {
    try {
        const { shopName, password } = req.body;

        const shop = await ShopDetails.findOne({ shopName });

        if (!shop) {
            return res.status(404).json({ error: "Shop not found" });
        }

        // Check if password already exists
        if (shop.password) {
            return res.json({ message: "Password already set", success: false });
        }

        // Update password
        shop.password = password;
        await shop.save();

        res.json({ message: "Password set successfully", success: true });
    } catch (error) {
        console.error("Error setting password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});















































// =================================== SHOP PAGE APIs============================
// SHOP DETAILS
app.get("/api/shop-details", async (req, res) => {
    const { shopName } = req.query;
    const products = await db.collection(shopName).find().toArray();

    res.json(products);
});


// TO ADD PRODUCT FOR SHOPS
app.post("/api/add-product", async (req, res) => {
    const { shopName, productName, quantity, price, category } = req.body;

    if (!shopName || !productName || !quantity || !price || !category) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await db.collection(shopName).insertOne({
            productName,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            category
        });

        res.json({ success: true, message: "Product added successfully!" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Error adding product" });
    }
});


// API to place an order (Saves to OrderDetails)
app.post("/api/orders", async (req, res) => {
    try {
        const { shopName, productName, username } = req.body;
        const orderId = Math.floor(1000 + Math.random() * 9000); // Generate order ID

        // ✅ 1. Find product by shop and name
        const product = await ShopProduct.findOne({ shopName, productName });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // ✅ 2. Check stock
        if (product.quantity < 1) {
            return res.status(400).json({ success: false, message: "Out of stock" });
        }

        // ✅ 3. Atomically update stock (avoid race conditions)
        const updated = await ShopProduct.findOneAndUpdate(
            { _id: product._id, quantity: { $gte: 1 } },
            { $inc: { quantity: -1 } },
            { new: true }
        );

        if (!updated) {
            return res.status(409).json({ success: false, message: "Stock was taken by someone else just now" });
        }

        // ✅ 4. Save order
        const newOrder = new OrderDetails({ shopName, productName, username, orderId });
        await newOrder.save();

        res.json({ success: true, message: "✅ Order placed successfully!", orderId });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});




// TO HANDLE ORDER DELIVERY
app.put("/api/orders/deliver/:orderId", async (req, res) => {
    try {
        const updatedOrder = await OrderDetails.findByIdAndUpdate(
            req.params.orderId,
            {
                delivered: true,
                status: "Success" // ✅ update this too
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Order delivered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});




// TO FETCH DELIVERED ORDERS
app.get("/api/delivered-orders/:shopName", async (req, res) => {
    try {
        const orders = await OrderDetails.find({
            shopName: req.params.shopName,
            delivered: true
        }).sort({ timestamp: -1 });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});






// TO HANDLE DECLINE
// app.delete("/api/orders/decline/:orderId", async (req, res) => {
//     try {
//         const orderId = req.params.orderId;

//         // Step 1: Find the order
//         const order = await OrderDetails.findById(orderId);
//         if (!order) {
//             console.log("Order not found");
//             return res.status(404).json({ message: "Order not found" });
//         }

//         const { userID, productName, quantity, totalAmount, shopName } = order;

//         // ✅ Step 2: Save rejected copy BEFORE modifying anything
//         const rejectedOrder = {
//             ...order.toObject(),
//             _id: undefined, // avoid duplicate key error
//             delivered: false,
//             status: "Rejected",
//             viewed: false,
//         };
//         await OrderDetails.create(rejectedOrder);

//         // ✅ Step 3: Restore coins
//         const user = await User.findOne({ userID: userID.trim() });
//         if (user) {
//             user.coins += totalAmount;
//             await user.save();
//         }

//         // ✅ Step 4: Restore product quantity
//         const getShopProductModel = (shopName) => {
//             return mongoose.model(shopName, shopProductSchema, shopName);
//         };
//         const ShopProduct = getShopProductModel(shopName);
//         const product = await ShopProduct.findOne({ productName });
//         if (product) {
//             product.quantity += quantity;
//             await product.save();
//         }

//         // ✅ Step 5: Delete the original pending order
//         await OrderDetails.findByIdAndDelete(orderId);

//         res.status(200).json({ message: "Order declined and stored as rejected" });
//     } catch (error) {
//         console.error("Error in decline route:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });



// PUT /api/products/update
app.put("/api/products/update", async (req, res) => {
    const { shopName, productName, quantity, price } = req.body;

    try {
        const ShopModel = mongoose.model(shopName, shopProductSchema, shopName); // dynamic model by collection
        const updated = await ShopModel.findOneAndUpdate(
            { productName },
            { $set: { quantity, price } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully', updated });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// SHOPPAGE TOTALAMOUNT
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


// TO GENERATE SHOP REPORT
app.get('/api/Shopreport', async (req, res) => {
    const {shopName, month, year} = req.query;
    console.log(shopName);
    

    if (!shopName || !month || !year) {
        return res.status(400).json({error: "Month And year are required"});
    }

    try {
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(`${year}-${month}-31`);

        const orders = await OrderDetails.find({
            // userID: userID,
            shopName: shopName,
            delivered: true,
            timestamp: {$gte: startDate, $lte: endDate}
        }).select("shopName productName quantity totalAmount timestamp delivered status");

        res.json(orders);
    } catch (error) {
        res.status(500).json({error: "Error fetching Orders"})
    }
});









app.get("/api/orders/:shopName", async (req, res) => {
    try {
        const orders = await OrderDetails.find({
            shopName: req.params.shopName,
            delivered: false,
            status: { $ne: "Rejected" } // ⛔ Exclude Rejected orders
        }).sort({ timestamp: -1 });


        // Group by orderId
        const grouped = {};

        orders.forEach(order => {
            const id = order.orderId;
            if (!grouped[id]) {
                grouped[id] = {
                    orderId: order.orderId,
                    userID: order.userID,
                    shopName: order.shopName,
                    timestamp: order.timestamp,
                    products: []
                };
            }

            grouped[id].products.push({
                _id: order._id,
                productName: order.productName,
                quantity: order.quantity,
                totalAmount: order.totalAmount
            });
        });

        res.json(Object.values(grouped)); // send grouped orders
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});













// ✅ Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));