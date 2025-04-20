import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Store } from "lucide-react"; // optional icon library (e.g., lucide-react)

const ShopList = () => {
    const [shops, setShops] = useState([]);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/shops");
                const data = await res.json();
                setShops(data);
            } catch (err) {
                console.error("Error fetching shops", err);
            }
        };

        fetchShops();
    }, []);

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 to-white">
            <h2 className="text-3xl font-extrabold text-indigo-800 mb-8 text-center">
                Available All Shops
            </h2>

            {shops.length === 0 ? (
                <p className="text-center text-gray-500">No shops available.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {shops.map((shop) => (
                        <Link
                            key={shop.shopName}
                            to={`/shop-details/${encodeURIComponent(shop.shopName)}`}
                            className="block bg-blue-200 border border-indigo-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-full">
                                    <Store className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-indigo-900">
                                    {shop.shopName}
                                </h3>
                            </div>
                            <div className="font-semibold text-indigo-600 pl-[53px]">
                                Ownwer: <span className="font-bold text-orange-700">{shop.shopOwnerName}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <button
                onClick={() => {
                    window.location.href = "/";
                }}
                className="mt-10 bg-indigo-600 text-white font-semibold px-6 py-3 rounded transition"
            >
                Back
            </button>
        </div>
    );
};

export default ShopList;
