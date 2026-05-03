import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔐 Login
export const loginUser = (data) => API.post("/auth/login", data);

// 📝 Register
export const registerUser = (data) => API.post("/auth/register", data);

// 📧 Send OTP
export const sendOTP = (email) => API.post("/auth/send-otp", { email });

// ✅ Verify OTP
export const verifyOTP = (email, otp) =>
  API.post("/auth/verify-otp", { email, otp });

// Send OTP
export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });

// Reset Password
export const resetPassword = (data) =>
  API.post("/auth/reset-password", data);

// predition
export const predictDisease = (data) =>
  API.post("/prediction", data);

//symptoms
export const getSymptoms = () =>
  API.get("/symptoms");

export const getHistory = () =>
  API.get("/prediction/history");

// Optional: Export the axios instance
export default API;