import express from "express";
import { getSymptoms } from "../controllers/symptomController.js";

const router = express.Router();

router.get("/", getSymptoms);

export default router;