import axios from "axios";
import Prediction from "../models/predictionModel.js";


export const predict = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const userId = req.user.id;

    const mlRes = await axios.post("http://localhost:8000/predict", {
      symptoms,
    });

    const data = mlRes.data;

    // 🔥 DEBUG
    console.log("Saving prediction for user:", userId);

    const saved = await Prediction.create({
      userId,
      symptoms,
      predictions: data.predictions,
      modelPredictions: data.model_predictions,
      metrics: data.metrics,
    });

    console.log("Saved ID:", saved._id);  // 👈 IMPORTANT

    res.json(data);
  } catch (err) {
    console.error("❌ SAVE ERROR:", err.message);
    res.status(500).json({ message: "Prediction failed" });
  }
};

// 📜 GET HISTORY
export const getHistory = async (req, res) => {
  try {
    console.log("USER:", req.user);   // 👈 ADD THIS

    if (!req.user) {
      return res.status(401).json({ message: "No user found" });
    }

    const userId = req.user.id;

    const history = await Prediction.find({ userId })
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.error("❌ HISTORY ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};