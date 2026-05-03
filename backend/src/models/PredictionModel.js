import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symptoms: [String],

    predictions: [
      {
        disease: String,
        probability: Number,
      },
    ],

    modelPredictions: Object, // per-disease per-model probs
    metrics: Object,          // RF, LR, SVM, XGB metrics

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", predictionSchema);