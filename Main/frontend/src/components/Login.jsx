import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


const Login = () => {
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [step, setStep] = useState('enterUserID'); // Steps: enterUserID, enterPassword, setNewPassword
    const [hasPassword, setHasPassword] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const navigate = useNavigate(); // For redirection

    const handleUserIDSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/check-user-details`, { userID });


            if (response.data.hasPassword) {
                setHasPassword(true);
                setStep('enterPassword'); // Show password field
            } else {
                setHasPassword(false);
                setStep('setNewPassword'); // Show new password fields
            }
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error checking user');
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login-user-details`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID, password }),
            });


            const data = await response.json();
            console.log("Full API Response:", data);

            if (data.username) {
                console.log("Login Successful:", data);

                // ✅ Store user details in localStorage
                localStorage.setItem(
                    "userDetails",
                    JSON.stringify({
                        message: "Login successful",
                        username: data.username,
                        userID: data.userID,  // ✅ Make sure this is included
                        coins: data.coins
                    })
                );

                navigate("/dashboard");  // Redirect to dashboard
            } else {
                console.error("Error: User not found in response");
            }
        } catch (error) {
            console.error("Login Fetch Error:", error);
        }
    };




    const handleSetPassword = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/set-user-password`, {
                userID,
                newPassword,
                confirmPassword
            });

            setMessage('Password set successfully! Please login.');
            setStep('enterPassword'); // Now user can log in
            setPassword('');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Failed to set password');
        }
    };

   


    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-200 p-4">
            <div className="bg-white shadow-sm rounded-2xl w-full max-w-md p-8">
                <h2 className="text-2xl font-bold text-indigo-800 mb-6 text-center">
                    {step === 'enterUserID'
                        ? 'Enter User ID'
                        : step === 'enterPassword'
                        ? 'Login'
                        : 'Set New Password'}
                </h2>
    
                {step === 'enterUserID' && (
                    <form onSubmit={handleUserIDSubmit} className="space-y-6">
                        <div>
                            <label className="block text-indigo-800 font-semibold text-lg mb-2">User ID:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-indigo-500 rounded-md text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={userID}
                                onChange={(e) => setUserID(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition duration-200"
                        >
                            Next
                        </button>
                    </form>
                )}
    
                {step === 'enterPassword' && (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-indigo-800 font-semibold text-lg mb-2">Password:</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full p-2 border border-indigo-500 rounded-md text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-700"
                                >
                                    {/* {showPassword ? 'Hide' : 'Show'} */}
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition duration-200"
                        >
                            Login
                        </button>
                    </form>
                )}
    
                {step === 'setNewPassword' && (
                    <form onSubmit={handleSetPassword} className="space-y-6">
                        <div>
                            <label className="block text-indigo-800 font-semibold text-lg mb-2">New Password:</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    className="w-full p-2 border border-indigo-500 rounded-md text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-700"
                                >
                                    {/* {showNewPassword ? 'Hide' : 'Show'} */}
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-indigo-800 font-semibold text-lg mb-2">Confirm Password:</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full p-2 border border-indigo-500 rounded-md text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-700"
                                >
                                    {/* {showConfirmPassword ? 'Hide' : 'Show'} */}
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition duration-200"
                        >
                            Save Password
                        </button>
                    </form>
                )}
    
                {message && <p className="mt-6 text-center text-red-500">{message}</p>}
            </div>
        </div>
    );
    
};

export default Login;