import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, sendOTP, verifyOTP } from "../../services/api";
import { toast } from "react-toastify";
import OTPInput from "../../components/forms/OTPInput";
import { User, Mail, Lock, MapPin } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    city: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      return toast.error("Please enter your email");
    }
    try {
      await sendOTP(formData.email);
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP(formData.email, otp);
      setOtpVerified(true);
      toast.success("Email verified successfully");
    } catch {
      toast.error("Invalid OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      return toast.error("Please verify your email first");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      await registerUser(formData);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-600 text-white p-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Join Our Platform</h1>
          <p className="text-lg">
            Register to access AI-powered disease prediction and healthcare
            insights.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Create an Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Email with OTP */}
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSendOTP}
                className="bg-blue-600 text-white px-4 rounded-lg"
              >
                Send OTP
              </button>
            </div>

            {otpSent && !otpVerified && (
              <div className="flex gap-2">
                <OTPInput otp={otp} setOtp={setOtp} />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  className="bg-green-600 text-white px-4 rounded-lg"
                >
                  Verify
                </button>
              </div>
            )}

            {/* Password Fields */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="age"
                placeholder="Age"
                required
                onChange={handleChange}
                className="px-4 py-3 border rounded-lg"
              />

              <select
                name="gender"
                required
                onChange={handleChange}
                className="px-4 py-3 border rounded-lg"
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <input
              type="text"
              name="city"
              placeholder="City"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <select
              name="role"
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Register
            </button>

            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;    