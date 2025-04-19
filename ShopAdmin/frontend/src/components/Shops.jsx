import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/api/shops")

            .then((response) => response.json())
            .then((data) => setShops(data))
            .catch((error) => console.error("Error fetching shops:", error));
    }, []);

    const handleShopClick = async (shopName) => {
        try {
            const response = await fetch(`http://localhost:5000/api/get-shop?shopName=${shopName}`);
            const data = await response.json();

            if (data.exists) {
                setSelectedShop({
                    shopName: data.shopName,
                    shopOwnerName: data.shopOwnerName,
                    passwordExists: data.passwordExists
                });
                setPassword("");
                setNewPassword("");
                setError("");
                setIsModalOpen(true);
            } else {
                alert("Shop not found");
            }
        } catch (error) {
            console.error("Error checking shop:", error);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/validate-shop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shopName: selectedShop.shopName, password }),
            });

            const data = await response.json();
            if (data.success) {
                alert("Login Successful!");
                setIsModalOpen(false);
                navigate(`/shop/${selectedShop.shopName}`);
            } else {
                setError("Invalid password!");
            }
        } catch (error) {
            console.error("Error validating shop:", error);
        }
    };

    const handleSetPassword = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shopName: selectedShop.shopName, password: newPassword }),
            });

            const data = await response.json();
            alert(data.message);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error setting password:", error);
        }
    };

    return (
        <div className="min-h-screen p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Shop List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop, index) => (
                    <div
                        key={index}
                        onClick={() => handleShopClick(shop.shopName)}
                        className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl cursor-pointer border transition"
                    >
                        <h3 className="text-xl font-semibold text-indigo-800">{shop.shopName}</h3>
                        <p className="text-gray-600 mt-1">Owner: <span className="font-medium text-orange-500">{shop.shopOwnerName}</span></p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && selectedShop && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-[90%] max-w-md relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
                        >
                            &times;
                        </button>

                        <h3 className="text-2xl font-bold mb-4 text-center">
                            {selectedShop.passwordExists ? "Login" : "Set Password"} for{" "}
                            <span className="text-indigo-600">{selectedShop.shopName}</span>
                        </h3>

                        {selectedShop.passwordExists ? (
                            <>
                                <input
                                    type="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleLogin}
                                    className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                >
                                    Login
                                </button>
                                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                            </>
                        ) : (
                            <>
                                <input
                                    type="password"
                                    placeholder="Create Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    onClick={handleSetPassword}
                                    className="w-full mt-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                >
                                    Set Password
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shops;
