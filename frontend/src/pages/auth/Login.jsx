import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api.js";
import { toast } from "react-toastify";
import { Mail, Lock } from "lucide-react";


const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(formData);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      navigate("/patient/dashboard");

      toast.success("Login successful!");
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
  // Navigate to the Forgot Password page
  navigate("/forgot-password", {
    state: { email: formData.email }, // Optional: pre-fill email
  });
};

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-600 text-white p-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Disease Prediction System
          </h1>
          <p className="text-lg">
            AI-powered healthcare to predict diseases early and accurately.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Welcome Back 👋
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
               type="button"
               onClick={handleForgotPassword}
               className="text-sm text-blue-600 hover:underline"
              >
                 Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Register Link */}
            <p className="text-center text-gray-600 mt-4">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;