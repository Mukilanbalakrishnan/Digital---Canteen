
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Optional for better icons

const ShopDetails = () => {
    const { shopName } = useParams();
    const [products, setProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/shop-details?shopName=${shopName}`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, [shopName]);

    useEffect(() => {
        const fetchTotalAmount = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/total/${shopName}`);
                const data = await response.json();
                setTotalAmount(data.totalAmount);
            } catch (error) {
                console.error("Error fetching total amount:", error);
            }
        };

        fetchTotalAmount();
    }, [shopName]);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-indigo-800">
                    Products in <br /> <span className="text-orange-700">{shopName}</span>
                </h1>

                <Link to="/shoplist">
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </Link>
            </div>

            {products.length === 0 ? (
                <p className="text-gray-600 text-lg">No products available in this shop.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border-gray-300 rounded-md overflow-hidden">
                        <thead className="bg-indigo-100 text-indigo-800 font-semibold">
                            <tr className="border-b">
                                <th className="px-6 py-3 text-left border-b">Sl.no</th>
                                <th className="px-6 py-3 text-left border-b">Product Name</th>
                                <th className="px-6 py-3 text-left border-b">Quantity</th>
                                <th className="px-6 py-3 text-left border-b">Price</th>
                                <th className="px-6 py-3 text-left border-b">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr
                                    key={index}
                                    className={`${
                                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    } hover:bg-indigo-50 transition`}
                                >
                                    <td className="px-6 py-3 border-b">{index + 1}</td>
                                    <td className="px-6 py-3 border-b">{product.productName}</td>
                                    <td className="px-6 py-3 border-b">{product.quantity}</td>
                                    <td className="px-6 py-3 border-b">₹{product.price}</td>
                                    <td className="px-6 py-3 border-b">{product.category}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6 text-right">
                <p className="inline-block bg-green-100 text-green-800 font-medium px-5 py-2 rounded-md shadow-sm border border-green-600" >
                    Total Earned: ₹ {totalAmount}
                </p>
            </div>
        </div>
    );
};

export default ShopDetails;

