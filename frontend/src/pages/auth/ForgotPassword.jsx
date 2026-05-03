import React, { useState } from "react";
import { forgotPassword, resetPassword } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, KeyRound } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await forgotPassword(formData.email);
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      await resetPassword({
        email: formData.email,
        otp: formData.otp,
        password: formData.password,
      });
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-200 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Forgot Password
        </h2>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="flex items-center border rounded-lg px-3">
              <Mail className="text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full p-3 outline-none"
                onChange={handleChange}
                required
              />
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg">
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center border rounded-lg px-3">
              <KeyRound className="text-gray-400" size={18} />
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                className="w-full p-3 outline-none"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center border rounded-lg px-3">
              <Lock className="text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                placeholder="New Password"
                className="w-full p-3 outline-none"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center border rounded-lg px-3">
              <Lock className="text-gray-400" size={18} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full p-3 outline-none"
                onChange={handleChange}
                required
              />
            </div>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg">
              Reset Password
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;