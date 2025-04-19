import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [shops, setShops] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const navigate = useNavigate();
    const [currentOrder, setCurrentOrder] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("userDetails"));
        if (storedUser) {
            setUser(storedUser);
            fetchUserDetails(storedUser.userID);
        }
    }, []);

    const fetchUserDetails = async (userID) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user-details/${userID}`);
            const data = await response.json();
            if (response.ok) {
                setUser(data);
                localStorage.setItem("userDetails", JSON.stringify(data));
            } else {
                console.error("Error fetching user details:", data.error);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (user?.userID) {
                fetchUserDetails(user.userID);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        fetch("http://localhost:5000/api/shops")
            .then(res => res.json())
            .then(data => setShops(data))
            .catch(error => console.error("Error fetching shops:", error));
    }, []);

    const handleShopClick = (shopName) => {
        localStorage.setItem("shopName", shopName);
        navigate(`/dashboard/purchase/${shopName}`);
    };

    const handleGenerateReport = async () => {
        if (!user?.userID) {
            alert("User not logged in!");
            return;
        }

        const month = prompt("Enter Month (MM):");
        const year = prompt("Enter Year (YYYY):");

        if (!month || !year) {
            alert("Please enter a valid month and year.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/report?userID=${user.userID}&month=${month}&year=${year}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setReportData(data);
            setShowReport(true);
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("Failed to fetch report. Please try again.");
        }
    };

    useEffect(() => {
        const fetchUnviewedOrder = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/user/${user.userID}`);
                const data = await response.json();
                if (data.length > 0) {
                    setCurrentOrder(data[0]);
                }
            } catch (error) {
                console.error("Error fetching unviewed orders:", error);
            }
        };
        if (user) fetchUnviewedOrder();
    }, [user]);

    const handleOk = async () => {
        try {
            await fetch(`http://localhost:5000/api/orders/viewed/${currentOrder.orderId}`, {
                method: "PUT",
            });
            setCurrentOrder(null);
        } catch (error) {
            console.error("Failed to mark order as viewed", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-3xl font-bold text-indigo-800 mb-4">Dashboard</h2>

            {user ? (
                <div className="mb-6 space-y-2">
                    <p className="text-xl text-indigo-600 font-semibold">
                        Welcome, <span className="text-orange-700">{user.username}!</span>
                    </p>
                    <p className="text-xl text-indigo-600 font-semibold">
                        Your Balance: <span className="text-orange-700">₹ {user.coins}</span>
                    </p>
                </div>
            ) : (
                <p className="text-green-600">Loading...</p>
            )}

            <div className="mt-8">
                <h3 className="text-2xl font-bold text-indigo-800 mb-4">Shop List</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {shops.map((shop) => (
                        <li key={shop.shopName}>
                            <button
                                className="w-full bg-blue-200 rounded-xl shadow-md p-4 hover:shadow-lg transition"
                                onClick={() => handleShopClick(shop.shopName)}
                            >
                                <span className="block text-2xl font-bold text-indigo-700">{shop.shopName}</span>
                                <span className="block text-orange-700 text-sm font-semibold mt-1">{shop.shopOwnerName}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
                <Link to="/cart">
                    <button className="bg-indigo-700 text-white px-6 py-3 rounded-md shadow hover:bg-indigo-800 transition">
                        Go to Cart
                    </button>
                </Link>
                <button
                    className="bg-indigo-700 text-white px-6 py-3 rounded-md shadow hover:bg-indigo-800 transition"
                    onClick={handleGenerateReport}
                >
                    Generate Report
                </button>
            </div>

            {currentOrder && (
                <div className="relative bg-gradient-to-br from-green-50 to-white border border-green-200 p-8 rounded-3xl shadow-xl mt-10">
                    <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        {currentOrder.status}
                    </div>

                    <div className="mb-6">
                        <h3 className="text-2xl font-extrabold text-green-700 flex items-center gap-2">
                            <span>✅ Order Confirmation</span>
                            <span className="text-sm bg-green-200 text-green-800 px-2 py-0.5 rounded-lg mt-3">{currentOrder.shopName}</span>
                        </h3>
                        <p className="text-gray-500 mt-1 text-sm">Thank you for your purchase!</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-gray-700"><span className="font-semibold">Order ID:</span> {currentOrder.orderId}</p>
                            <p className="text-gray-700"><span className="font-semibold">Placed On:</span> {new Date(currentOrder.timestamp).toLocaleString()}</p>
                            <p className="text-gray-700"><span className="font-semibold">Total:</span> ₹{currentOrder.totalAmount}</p>
                        </div>

                        <div>
                            <h4 className="text-md font-bold mb-2 text-gray-800">🛍️ Items in your order:</h4>
                            <ul className="space-y-1 text-gray-700 list-inside list-disc">
                                {Object.entries(
                                    currentOrder.products.reduce((acc, product) => {
                                        const key = product.productName;
                                        if (!acc[key]) {
                                            acc[key] = { quantity: product.quantity, price: product.price };
                                        } else {
                                            acc[key].quantity += product.quantity;
                                            acc[key].price += product.price;
                                        }
                                        return acc;
                                    }, {})
                                ).map(([productName, { quantity, price }], index) => (
                                    <li key={index}>
                                        {productName} <span className="text-sm text-gray-500">({quantity} × ₹{price})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 text-right">
                        <button
                            onClick={handleOk}
                            className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg transition-all"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}


            {showReport && (
                <div className="mt-10">
                    <h3 className="text-xl font-bold text-indigo-800 mb-4">Monthly Report</h3>
                    {reportData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 rounded-lg">
                                <thead className="bg-indigo-100">
                                    <tr>
                                        <th className="p-3 border">Shop</th>
                                        <th className="p-3 border">Product</th>
                                        <th className="p-3 border">Quantity</th>
                                        <th className="p-3 border">Total ₹</th>
                                        <th className="p-3 border">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((order, index) => (
                                        <tr key={index} className="text-center">
                                            <td className="p-3 border">{order.shopName}</td>
                                            <td className="p-3 border">{order.productName}</td>
                                            <td className="p-3 border">{order.quantity}</td>
                                            <td className="p-3 border">{order.totalAmount}</td>
                                            <td className="p-3 border">{new Date(order.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600">No orders found for this period.</p>
                    )}
                </div>
            )}

            <button
                onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                }}
                className="mt-10 bg-red-600 text-white font-semibold px-6 py-3 rounded hover:bg-red-700 transition"
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
