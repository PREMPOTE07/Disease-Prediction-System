import fs from "fs";
import csv from "csv-parser";
import path from "path";

export const getSymptoms = async (req, res) => {
  try {
    const filePath = path.join(
      process.cwd(),
      "..", // go outside backend
      "ml-service",
      "training",
      "dataset",
      "Training.csv"
    );

    console.log("Reading file from:", filePath);

    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        Object.keys(row).forEach((key) => {
          if (key !== "prognosis") {
            results.push(key);
          }
        });
      })
      .on("end", () => {
        const unique = [...new Set(results)];
        res.json(unique);
      })
      .on("error", (err) => {
        console.error("File read error:", err);
        res.status(500).json({ message: "File read failed" });
      });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};