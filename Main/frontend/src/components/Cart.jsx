import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("userDetails");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            const cartData = JSON.parse(storedCart);
            setCart(cartData);
        }
    }, []);

    const removeFromCart = (product) => {
        const updatedCart = cart.filter(
            (item) => !(item._id === product._id && item.shopName === product.shopName)
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCart(updatedCart);
    };

    const groupedCart = cart.reduce((groups, item) => {
        if (!groups[item.shopName]) {
            groups[item.shopName] = [];
        }
        groups[item.shopName].push(item);
        return groups;
    }, {});

    const handleBuy = async () => {
        if (!user || cart.length === 0) {
            alert("User details or cart is empty!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user.username, cart }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`🎉 Purchase successful! Order ID: ${data.orderId}`);
                localStorage.removeItem("cart");
                setCart([]);
                navigate("/dashboard", {
                    state: {
                        orderDetails: {
                            orderId: data.orderId,
                            cart,
                            status: "Pending",
                        },
                    },
                });
            } else {
                alert(data.message || "Purchase failed");
            }
        } catch (error) {
            console.error("Error purchasing product:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h2 className="text-4xl font-bold text-indigo-800 mb-8">Your Cart</h2>

            {cart.length === 0 ? (
                <p className="text-xl font-semibold text-red-600">Your cart is empty.</p>
            ) : (
                Object.entries(groupedCart).map(([shopName, items]) => {
                    const totalAmount = items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );
                    return (
                        <div key={shopName} className="mb-8 bg-white shadow-md rounded-lg p-6">
                            <h3 className="text-2xl font-semibold text-orange-700 mb-4">
                             {shopName}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-y-2">
                                    <thead className="text-left bg-gray-200">
                                        <tr>
                                            <th className="p-2 text-gray-700">Product</th>
                                            <th className="p-2 text-gray-700">Qty</th>
                                            <th className="p-2 text-gray-700">Price</th>
                                            <th className="p-2 text-gray-700">Total</th>
                                            <th className="p-2 text-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="bg-gray-50 hover:bg-gray-100 transition-all"
                                            >
                                                <td className="p-2 font-medium text-indigo-800">{item.productName}</td>
                                                <td className="p-2 text-indigo-800">{item.quantity}</td>
                                                <td className="p-2 text-indigo-800">₹ {item.price}</td>
                                                <td className="p-2 text-indigo-800">
                                                    ₹ {item.price * item.quantity}
                                                </td>
                                                <td className="p-2">
                                                    <button
                                                        onClick={() => removeFromCart(item)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 text-right text-lg font-semibold text-indigo-900">
                                Total: ₹ {totalAmount}
                            </div>
                        </div>
                    );
                })
            )}

            <div className="flex gap-4 mt-10">
                <Link to="/dashboard">
                    <button className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
                        Continue Shopping
                    </button>
                </Link>
                {cart.length > 0 && (
                    <button
                        onClick={handleBuy}
                        className="px-6 py-2 bg-indigo-800 text-white rounded hover:bg-indigo-900"
                    >
                        Buy Now
                    </button>
                )}
            </div>
        </div>
    );
};

export default Cart;
