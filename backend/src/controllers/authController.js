import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../services/emailService.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ===================== SEND OTP ===================== */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
        isVerified: false,
        $setOnInsert: { password: "Temp@123" },
      },
      { upsert: true, new: true }
    );

    await sendEmail(
      email,
      "Your OTP for Disease Prediction System",
      `<h2>Your OTP is: <b>${otp}</b></h2>`
    );

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ===================== VERIFY OTP ===================== */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Compare OTPs as strings
    if (user.otp.toString() !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

/* ===================== REGISTER ===================== */
export const register = async (req, res) => {
  try {
    const { fullName, email, password, age, gender, city, role } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    user.fullName = fullName;
    user.password = password;
    user.age = age;
    user.gender = gender;
    user.city = city;
    user.role = role || "patient";

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "Registration successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ===================== LOGIN ===================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ===================== FORGOT PASSWORD ===================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP via email (NO LINK)
    await sendEmail(
      email,
      "Password Reset OTP - Disease Prediction System",
      `
        <h2>Password Reset Request</h2>
        <p>Your OTP for resetting the password is:</p>
        <h1 style="color:#2E86DE;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    );

    res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

/* ===================== RESET PASSWORD ===================== */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate OTP
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Update password (hashed via pre-save middleware)
    user.password = password;

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({
      message: "Password reset failed",
    });
  }
};