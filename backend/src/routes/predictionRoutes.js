import express from "express";
import { predict, getHistory } from "../controllers/predictionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// router.post("/", predict);
router.post("/", authMiddleware, predict);
router.get("/history", authMiddleware, getHistory);

export default router;