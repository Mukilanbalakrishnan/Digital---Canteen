// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const ShopPage = () => {
//     const [shopData, setShopData] = useState([]);
//     const [productName, setProductName] = useState("");
//     const [quantity, setQuantity] = useState("");
//     const [price, setPrice] = useState("");
//     const [message, setMessage] = useState("");
//     const [orders, setOrders] = useState([]);
//     const [filteredOrders, setFilteredOrders] = useState([]); // Store report data
//     const [category, setCategory] = useState("");
//     const [editIndex, setEditIndex] = useState(null);
//     const [editedProduct, setEditedProduct] = useState({ quantity: '', price: '' });
//     const [shopEarnings, setShopEarnings] = useState(0);
//     const { shopName } = useParams(); // Getting the shop name from the URL
//     const [totalAmount, setTotalAmount] = useState(0);






//     // Fetch shop data
//     useEffect(() => {
//         fetchShopData();
//     }, [shopName]);

//     const fetchShopData = async () => {
//         try {
//             const response = await fetch(`http://localhost:5000/api/shop-details?shopName=${shopName}`);

//             const data = await response.json();
//             setShopData(data);
//         } catch (error) {
//             console.error("Error fetching shop details:", error);
//         }
//     };

//     // Handle adding a new product
//     const handleAddProduct = async (e) => {
//         e.preventDefault();
//         if (!productName || !quantity || !price || !category) {
//             setMessage("All fields are required!");
//             return;
//         }

//         try {
//             const response = await fetch("http://localhost:5000/api/add-product", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ shopName, productName, quantity, price, category }),

//             });



//             const data = await response.json();
//             setMessage(data.message);

//             // Refresh the shop data to show the new product
//             if (data.success) {
//                 fetchShopData();
//                 setProductName("");
//                 setQuantity("");
//                 setPrice("");
//                 setCategory("");
//             }
//         } catch (error) {
//             console.error("Error adding product:", error);
//         }
//     };

//     const fetchOrders = async () => {
//         try {
//             const response = await fetch(`http://localhost:5000/api/orders/${shopName}`);

//             const data = await response.json();
//             setOrders(data);
//         } catch (error) {
//             console.error("Error fetching orders:", error);
//         }
//     };

//     useEffect(() => {
//         fetchOrders(); // Fetch orders when component loads
//         fetchDeliveredOrders();
//         // Polling: Fetch new orders every 3 seconds
//         const interval = setInterval(() => {
//             fetchOrders();
//             fetchDeliveredOrders();
//         }, 3000);
//         return () => clearInterval(interval); // Cleanup on unmount
//     }, [shopName]);



//     const handleDeliver = async (orderId) => {
//         try {
//             const response = await fetch(`http://localhost:5000/api/orders/deliver/${orderId}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" }
//             });

//             if (response.ok) {
//                 // Remove from UI since it is now marked as delivered in DB
//                 setOrders(orders.filter(order => order._id !== orderId));
//                 fetchDeliveredOrders();
//                 fetchShopData();
//                  // new

//             } else {
//                 console.error("Failed to mark order as delivered");
//             }
//         } catch (error) {
//             console.error("Error delivering order:", error);
//         }
//     };

//     const fetchDeliveredOrders = async () => {
//         try {
//             const response = await fetch(`http://localhost:5000/api/delivered-orders/${shopName}`);
//             const data = await response.json();
//             setFilteredOrders(data);

//             // ✅ Calculate total amount from delivered orders
//             const total = data.reduce((sum, order) => sum + order.totalAmount, 0);
//             setTotalAmount(total);
//         } catch (error) {
//             console.error("Failed to fetch delivered orders:", error);
//         }
//     };



//     ;

//     const handleDecline = async (orderId) => {
//         try {
//             console.log("Declining order with ID:", orderId);

//             const response = await fetch(`http://localhost:5000/api/orders/decline/${orderId}`, {
//                 method: "DELETE",
//             });

//             if (response.ok) {
//                 const result = await response.json();
//                 console.log("✅ Order declined:", result.message);

//                 // ✅ Fetch updated orders
//                 fetchOrders();
//                 setMessage("Order declined successfully.");
//             } else {
//                 console.error("Failed to decline the order");
//             }
//         } catch (error) {
//             console.error("Error declining the order:", error);
//         }
//     };





//     const handleSave = async (shopName, productName) => {
//         try {
//             const res = await fetch("http://localhost:5000/api/products/update", {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     shopName,
//                     productName,
//                     quantity: Number(editedProduct.quantity),
//                     price: Number(editedProduct.price)
//                 }),
//             });

//             if (!res.ok) throw new Error("Failed to update");

//             const updatedProduct = await res.json();

//             const updatedData = [...shopData];
//             updatedData[editIndex] = {
//                 ...updatedData[editIndex],
//                 quantity: editedProduct.quantity,
//                 price: editedProduct.price,
//             };

//             setShopData(updatedData);
//             setEditIndex(null);
//             setEditedProduct({ quantity: "", price: "" });
//         } catch (err) {
//             console.error("Failed to update product", err);
//         }
//     };


    

//     const handleGroupedDeliver = async (orderIds) => {
//         for (const orderId of orderIds) {
//             await handleDeliver(orderId);
//         }
//     };

//     const handleGroupedDecline = async (orderIds) => {
//         try {
//             const responses = await Promise.all(orderIds.map(orderId =>
//                 fetch(`http://localhost:5000/api/orders/decline/${orderId}`, {
//                     method: "DELETE",
//                 })
//             ));

//             const allSuccessful = responses.every(res => res.ok);

//             if (allSuccessful) {
//                 setOrders(prevOrders =>
//                     prevOrders.filter(group =>
//                         !orderIds.includes(group.products[0]._id) // remove the whole group if one of its orderId matches
//                     )
//                 );
//                 setMessage("Order group declined successfully.");
//             } else {
//                 console.error("One or more decline requests failed.");
//             }
//         } catch (error) {
//             console.error("Error declining grouped orders:", error);
//         }
//     };




// useEffect(() => {
//         const fetchTotalAmount = async () => {
//             try {
//                 const response = await fetch(`http://localhost:5000/api/orders/total/${shopName}`);
//                 const data = await response.json();
//                 setTotalAmount(data.totalAmount);
//             } catch (error) {
//                 console.error("Error fetching total amount:", error);
//             }
//         };

//         fetchTotalAmount();
//     }, [shopName]);// Re-fetch when shopName changes




//     const [shopReportData, setShopReportData] = useState([]);
//     const [showShopReport, setShowShopReport] = useState(false);

//     // // 📝 Handle Report Generation
//     const handleGenerateReport = async () => {
//         if (!shopName) {
//             alert("Login to shop");
//             return;
//         }
    
//         const month = prompt("Enter Month(MM):");
//         const year = prompt("Enter Year(YYYY):");
    
//         if (!month || !year) {
//             alert("Please Enter month and year");
//             return;
//         }
    
//         try {
//             const response = await fetch(
//                 `http://localhost:5000/api/Shopreport?shopName=${shopName}&month=${month}&year=${year}`
//             );
    
//             if (!response.ok) {
//                 throw new Error(`Http Error: ${response.status}`);
//             }
    
//             const data = await response.json();
//             setShopReportData(data);
//             setShowShopReport(true);
//         } catch (error) {
//             console.error("Error fetching report:", error);
//             alert("Failed to fetch report. Please try again.");
//         }
//     };








//     return (
//         <div className="mx-auto max-w-5xl p-6 bg-white shadow-lg rounded-lg mt-10">
//             <h2 className="text-3xl font-bold text-indigo-800 mb-6">Welcome to <span className="text-orange-600">{shopName}</span></h2>

//             {/* Add Product Form */}
//             <div className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-4">Add a Product</h3>
//                 <form onSubmit={handleAddProduct} className="space-y-4">
//                     <input
//                         type="text"
//                         placeholder="Product Name"
//                         value={productName}
//                         onChange={(e) => setProductName(e.target.value)}
//                         required
//                         className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                     <input
//                         type="number"
//                         placeholder="Quantity"
//                         value={quantity}
//                         onChange={(e) => setQuantity(e.target.value)}
//                         required
//                         className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                     <input
//                         type="number"
//                         placeholder="Price"
//                         value={price}
//                         onChange={(e) => setPrice(e.target.value)}
//                         required
//                         className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                     <input
//                         type="text"
//                         placeholder="Category"
//                         value={category}
//                         onChange={(e) => setCategory(e.target.value)}
//                         required
//                         className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                     <button
//                         type="submit"
//                         className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
//                     >
//                         Add Product
//                     </button>
//                 </form>
//                 {message && <p className="text-green-600 mt-2">{message}</p>}
//             </div>

//             {/* Shop Inventory */}
//             <div className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-4">Shop Inventory</h3>
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full border border-gray-300">
//                         <thead className="bg-gray-200">

//                             <tr>

//                                 <th className="p-3 border">Product Name</th>
//                                 <th className="p-3 border">Quantity</th>
//                                 <th className="p-3 border">Price</th>
//                                 <th className="p-3 border">Category</th>
//                                 <th className="p-3 border">Action</th>

//                             </tr>

//                         </thead>
//                         <tbody>
//                             {shopData.map((item, index) => (
//                                 <tr key={index} className="border-b border-gray-300">
//                                     <td className="p-3 text-center">{item.productName}</td>
//                                     <td className="p-3 text-center">
//                                         {editIndex === index ? (
//                                             <input
//                                                 type="number"
//                                                 value={editedProduct.quantity}
//                                                 onChange={(e) =>
//                                                     setEditedProduct({ ...editedProduct, quantity: e.target.value })
//                                                 }
//                                                 className="w-20 p-1 border rounded"
//                                             />
//                                         ) : (
//                                             item.quantity
//                                         )}
//                                     </td>
//                                     <td className="p-3 text-center">
//                                         {editIndex === index ? (
//                                             <input
//                                                 type="number"
//                                                 value={editedProduct.price}
//                                                 onChange={(e) =>
//                                                     setEditedProduct({ ...editedProduct, price: e.target.value })
//                                                 }
//                                                 className="w-20 p-1 border rounded"
//                                             />
//                                         ) : (
//                                             item.price
//                                         )}
//                                     </td>

//                                     <td className="p-3 text-center">{item.category}</td>
//                                     <td className="p-3 border">
//                                         {editIndex === index ? (
//                                             <button
//                                                 className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
//                                                 onClick={() => handleSave(shopName, item.productName)}
//                                             >
//                                                 Save
//                                             </button>
//                                         ) : (
//                                             <button
//                                                 className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
//                                                 onClick={() => {
//                                                     setEditIndex(index);
//                                                     setEditedProduct({ quantity: item.quantity, price: item.price });
//                                                 }}
//                                             >
//                                                 Update
//                                             </button>
//                                         )}
//                                     </td>

//                                 </tr>
//                             ))}

//                         </tbody>
//                     </table>
//                 </div>
//             </div>

            

//             {/* Shop Orders */}
//             <div className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Orders</h2>
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full border border-gray-300">
//                         <thead className="bg-gray-200">
//                             <tr>
//                                 <th className="p-3 border">Order ID</th>
//                                 <th className="p-3 border">UserID</th>
//                                 <th className="p-3 border">Product Name</th>
//                                 <th className="p-3 border">Quantity</th>
//                                 <th className="p-3 border">Total Amount</th>
//                                 <th className="p-3 border">Timestamp</th>
//                                 <th className="p-3 border">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {orders.map((groupedOrder) => (
//                                 <React.Fragment key={groupedOrder.orderId}>
//                                     {groupedOrder.products.map((item, idx) => (
//                                         <tr key={item._id} className="text-center border-b">
//                                             {idx === 0 && (
//                                                 <>
//                                                     <td rowSpan={groupedOrder.products.length} className="p-3 border font-bold">{groupedOrder.orderId}</td>
//                                                     <td rowSpan={groupedOrder.products.length} className="p-3 border">{groupedOrder.userID}</td>
//                                                 </>
//                                             )}
//                                             <td className="p-3 border">{item.productName}</td>
//                                             <td className="p-3 border">{item.quantity}</td>
//                                             <td className="p-3 border">₹{item.totalAmount}</td>
//                                             <td className="p-3 border">{new Date(groupedOrder.timestamp).toLocaleString()}</td>
//                                             {idx === 0 && (
//                                                 <>
//                                                     <td rowSpan={groupedOrder.products.length} className="p-3 border">
//                                                         <button
//                                                             onClick={() => handleGroupedDeliver(groupedOrder.products.map(p => p._id))}
//                                                             className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
//                                                         >
//                                                             Deliver
//                                                         </button>
//                                                     </td>
//                                                     <td rowSpan={groupedOrder.products.length} className="p-3 border">
//                                                         <button
//                                                             onClick={() => handleGroupedDecline(groupedOrder.products.map(p => p._id), groupedOrder.orderId)}

//                                                             className="px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
//                                                         >
//                                                             Decline
//                                                         </button>
//                                                     </td>
//                                                 </>
//                                             )}
//                                         </tr>
//                                     ))}
//                                 </React.Fragment>
//                             ))}
//                         </tbody>

//                     </table>
//                 </div>
//             </div>

            

//             <button className="bg-indigo-700 text-white p-3 rounded mt-5" onClick={handleGenerateReport}> 
//                 Generate Report 📊
//             </button>

//             <div>
//                 {showShopReport && (
//                     <div style={{ marginTop: "20px" }}>
//                         <h3>Report for Selected Month and Year</h3>
//                         {shopReportData.length > 0 ? (
//                             <table border="1">
//                                 <thead>
//                                     <tr>
//                                         <th>Shop Name</th>
//                                         <th>Product Name</th>
//                                         <th>Quantity</th>
//                                         <th>Price</th>
//                                         <th>Timestamp</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {shopReportData.map((order, index) => (
//                                         <tr key={index}>
//                                             <td>{order.shopName}</td>
//                                             <td>{order.productName}</td>
//                                             <td>{order.quantity}</td>
//                                             <td>{order.totalAmount}</td>
//                                             <td>{new Date(order.timestamp).toLocaleString()}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         ) : (
//                             <p>No orders found for this period.</p>
//                         )}
//                     </div>
//                 )}
//             </div>



            

//             <p className="mb-2">Total Earned: ₹{totalAmount}</p>

//         </div>
//     );

// };

// export default ShopPage;










import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ShopPage = () => {
    const [shopData, setShopData] = useState([]);
    const [productName, setProductName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [message, setMessage] = useState("");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]); // Store report data
    const [category, setCategory] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editedProduct, setEditedProduct] = useState({ quantity: '', price: '' });
    const [shopEarnings, setShopEarnings] = useState(0);
    const { shopName } = useParams(); // Getting the shop name from the URL
    const [totalAmount, setTotalAmount] = useState(0);
    const [shopReportData, setShopReportData] = useState([]);
    const [showShopReport, setShowShopReport] = useState(false);


    // Fetch shop data
    useEffect(() => {
        fetchShopData();
    }, [shopName]);

    const fetchShopData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shop-details?shopName=${shopName}`);

            const data = await response.json();
            setShopData(data);
        } catch (error) {
            console.error("Error fetching shop details:", error);
        }
    };

    // Handle adding a new product
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!productName || !quantity || !price || !category) {
            setMessage("All fields are required!");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/add-product`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shopName, productName, quantity, price, category }),

            });

            const data = await response.json();
            setMessage(data.message);

            // Refresh the shop data to show the new product
            if (data.success) {
                fetchShopData();
                setProductName("");
                setQuantity("");
                setPrice("");
                setCategory("");
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${shopName}`);

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders(); // Fetch orders when component loads
        fetchDeliveredOrders();
        // Polling: Fetch new orders every 3 seconds
        const interval = setInterval(() => {
            fetchOrders();
            fetchDeliveredOrders();
        }, 3000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, [shopName]);



    const handleDeliver = async (orderId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/deliver/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                // Remove from UI since it is now marked as delivered in DB
                setOrders(orders.filter(order => order._id !== orderId));
                fetchDeliveredOrders();
                fetchShopData();
                // new

            } else {
                console.error("Failed to mark order as delivered");
            }
        } catch (error) {
            console.error("Error delivering order:", error);
        }
    };

    const fetchDeliveredOrders = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/delivered-orders/${shopName}`);
            const data = await response.json();
            setFilteredOrders(data);

            // ✅ Calculate total amount from delivered orders
            const total = data.reduce((sum, order) => sum + order.totalAmount, 0);
            setTotalAmount(total);
        } catch (error) {
            console.error("Failed to fetch delivered orders:", error);
        }
    };

    const handleDecline = async (orderId) => {
        try {
            console.log("Declining order with ID:", orderId);

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/decline/${orderId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                const result = await response.json();
                console.log("✅ Order declined:", result.message);

                // ✅ Fetch updated orders
                fetchOrders();
                setMessage("Order declined successfully.");
            } else {
                console.error("Failed to decline the order");
            }
        } catch (error) {
            console.error("Error declining the order:", error);
        }
    };


    const handleSave = async (shopName, productName) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shopName,
                    productName,
                    quantity: Number(editedProduct.quantity),
                    price: Number(editedProduct.price)
                }),
            });

            if (!res.ok) throw new Error("Failed to update");

            const updatedProduct = await res.json();

            const updatedData = [...shopData];
            updatedData[editIndex] = {
                ...updatedData[editIndex],
                quantity: editedProduct.quantity,
                price: editedProduct.price,
            };

            setShopData(updatedData);
            setEditIndex(null);
            setEditedProduct({ quantity: "", price: "" });
        } catch (err) {
            console.error("Failed to update product", err);
        }
    };




    const handleGroupedDeliver = async (orderIds) => {
        for (const orderId of orderIds) {
            await handleDeliver(orderId);
        }
    };

    const handleGroupedDecline = async (orderIds) => {
        try {
            const responses = await Promise.all(orderIds.map(orderId =>
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/decline/${orderId}`, {
                    method: "DELETE",
                })
            ));

            const allSuccessful = responses.every(res => res.ok);

            if (allSuccessful) {
                setOrders(prevOrders =>
                    prevOrders.filter(group =>
                        !orderIds.includes(group.products[0]._id) // remove the whole group if one of its orderId matches
                    )
                );
                setMessage("Order group declined successfully.");
            } else {
                console.error("One or more decline requests failed.");
            }
        } catch (error) {
            console.error("Error declining grouped orders:", error);
        }
    };




    useEffect(() => {
        const fetchTotalAmount = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/total/${shopName}`);
                const data = await response.json();
                setTotalAmount(data.totalAmount); // Set the total amount for the shop
            } catch (error) {
                console.error("Error fetching total amount for the shop:", error);
            }
        };

        fetchTotalAmount();
    }, [shopName]); // Re-fetch when shopName changes


    // Handle Report Generation
    const handleGenerateReport = async () => {
        if (!shopName) {
            alert("Login to shop");
            return;
        }

        const month = prompt("Enter Month(MM):");
        const year = prompt("Enter Year(YYYY):");

        if (!month || !year) {
            alert("Please Enter month and year");
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/Shopreport?shopName=${shopName}&month=${month}&year=${year}`
            );

            if (!response.ok) {
                throw new Error(`Http Error: ${response.status}`);
            }

            const data = await response.json();
            setShopReportData(data);
            setShowShopReport(true);
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("Failed to fetch report. Please try again.");
        }
    };


    return (

        <div className="max-w-6xl mx-auto p-6 bg-white shadow-2xl rounded-2xl mt-12 cursor-default">

            <p className="text-xl border rounded border-green-500 bg-gray-100 absolute top-4 right-4 font-semibold px-4 py-2  text-green-600 transition z-10 cursor-default">
                Total Earned: <span className="text-green-700 font-bold">₹ {totalAmount}</span>
            </p>

            {/* Logout Button at Top Right */}
            <button
                onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                }}
                className="absolute mt-20 top-0 right-4 font-semibold px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition z-10"
            >
                Logout
            </button>

            {/* Header */}
            <h2 className="text-4xl font-bold text-indigo-800 mb-8 text-center"> <br /> <br />
                Welcome to <span className="text-orange-600">{shopName}</span>
            </h2>

            {/* Add Product Section */}
            <section className="bg-gray-50 p-6 rounded-xl shadow mb-10">
                <h3 className="text-2xl font-semibold text-gray-800 mb-5">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="md:col-span-2 mt-2 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
                    >
                        Add Product
                    </button>
                </form>
                {message && <p className="text-green-600 mt-3 font-medium">{message}</p>}
            </section>

            {/* Inventory Section */}
            <section className="bg-gray-50 p-6 rounded-xl shadow mb-10">
                <h3 className="text-2xl font-semibold text-gray-800 mb-5">Inventory</h3>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border border-gray-300">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr>
                                <th className="p-3 border">Product</th>
                                <th className="p-3 border">Quantity</th>
                                <th className="p-3 border">Price</th>
                                <th className="p-3 border">Category</th>
                                <th className="p-3 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shopData.map((item, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="p-3">{item.productName}</td>
                                    <td className="p-3">
                                        {editIndex === index ? (
                                            <input
                                                type="number"
                                                value={editedProduct.quantity}
                                                onChange={(e) =>
                                                    setEditedProduct({ ...editedProduct, quantity: e.target.value })
                                                }
                                                className="w-20 p-1 border rounded"
                                            />
                                        ) : (
                                            item.quantity
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {editIndex === index ? (
                                            <input
                                                type="number"
                                                value={editedProduct.price}
                                                onChange={(e) =>
                                                    setEditedProduct({ ...editedProduct, price: e.target.value })
                                                }
                                                className="w-20 p-1 border rounded"
                                            />
                                        ) : (
                                            item.price
                                        )}
                                    </td>
                                    <td className="p-3">{item.category}</td>
                                    <td className="p-3">
                                        {editIndex === index ? (
                                            <button
                                                onClick={() => handleSave(shopName, item.productName)}
                                                className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditIndex(index);
                                                    setEditedProduct({ quantity: item.quantity, price: item.price });
                                                }}
                                                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Update
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Orders Section */}
            <section className="bg-gray-50 p-6 rounded-xl shadow mb-10">
                <h3 className="text-2xl font-semibold text-gray-800 mb-5">Orders</h3>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border border-gray-300">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr>
                                <th className="p-3 border">Order ID</th>
                                <th className="p-3 border">UserID</th>
                                <th className="p-3 border">Product</th>
                                <th className="p-3 border">Qty</th>
                                <th className="p-3 border">Total</th>
                                <th className="p-3 border">Time</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((groupedOrder) => (
                                <React.Fragment key={groupedOrder.orderId}>
                                    {groupedOrder.products.map((item, idx) => (
                                        <tr key={item._id} className="text-center border-t">
                                            {idx === 0 && (
                                                <>
                                                    <td rowSpan={groupedOrder.products.length} className="p-3 font-bold">
                                                        {groupedOrder.orderId}
                                                    </td>
                                                    <td rowSpan={groupedOrder.products.length} className="p-3">
                                                        {groupedOrder.userID}
                                                    </td>
                                                </>
                                            )}
                                            <td className="p-3">{item.productName}</td>
                                            <td className="p-3">{item.quantity}</td>
                                            <td className="p-3">₹{item.totalAmount}</td>
                                            <td className="p-3">{new Date(groupedOrder.timestamp).toLocaleString()}</td>
                                            {idx === 0 && (
                                                <td rowSpan={groupedOrder.products.length} className="p-3 space-y-2">
                                                    <button
                                                        onClick={() =>
                                                            handleGroupedDeliver(groupedOrder.products.map((p) => p._id))
                                                        }
                                                        className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
                                                    >
                                                        Deliver
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleGroupedDecline(
                                                                groupedOrder.products.map((p) => p._id),
                                                                groupedOrder.orderId
                                                            )
                                                        }
                                                        className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
                                                    >
                                                        Decline
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Report & Earnings Section */}
            <section className="mb-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* <p className="text-xl font-medium text-gray-800">
                        Total Earned: <span className="text-green-700 font-semibold">₹{totalAmount}</span>
                    </p> */}
                    <button
                        className="bg-indigo-700 text-white py-2 px-4 rounded-md hover:bg-indigo-800"
                        onClick={handleGenerateReport}
                    >
                        Generate Report
                    </button>
                </div>

                {showShopReport && (
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">
                            Report for Selected Month and Year
                        </h4>
                        {shopReportData.length > 0 ? (
                            <table className="w-full border border-gray-300 table-auto">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 border">Shop</th>
                                        <th className="p-2 border">Product</th>
                                        <th className="p-2 border">Qty</th>
                                        <th className="p-2 border">Price</th>
                                        <th className="p-2 border">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shopReportData.map((order, index) => (
                                        <tr key={index} className="text-center">
                                            <td className="p-2 border">{order.shopName}</td>
                                            <td className="p-2 border">{order.productName}</td>
                                            <td className="p-2 border">{order.quantity}</td>
                                            <td className="p-2 border">₹{order.totalAmount}</td>
                                            <td className="p-2 border">
                                                {new Date(order.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-600">No orders found for this period.</p>
                        )}
                    </div>
                )}
            </section>
        </div>

    );

};

export default ShopPage;