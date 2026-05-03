import React, { useEffect, useState } from "react";
import { getHistory } from "../../services/api.js";
import jsPDF from "jspdf";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
  try {
    const res = await getHistory();
    console.log("HISTORY DATA:", res.data);  // 👈 ADD THIS
    setHistory(res.data);
  } catch (err) {
    console.error(err);
  }
};


const downloadReport = (item) => {
  const doc = new jsPDF();

  doc.text("Disease Prediction Report", 20, 20);

  doc.text(`Date: ${new Date(item.createdAt).toLocaleString()}`, 20, 30);

  doc.text("Symptoms:", 20, 40);
  doc.text(item.symptoms.join(", "), 20, 50);

  doc.text("Predictions:", 20, 70);

  item.predictions.forEach((p, i) => {
    doc.text(
      `${p.disease} - ${p.probability}%`,
      20,
      80 + i * 10
    );
  });

  doc.save("report.pdf");
};


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Prediction History</h1>

      {history.map((item, i) => (
        <div key={i} className="bg-white p-4 rounded shadow mb-4">
          <p className="text-sm text-gray-500">
            {new Date(item.createdAt).toLocaleString()}
          </p>

          <p className="font-semibold">Symptoms:</p>
          <p className="text-sm mb-2">
            {item.symptoms.join(", ")}
          </p>

          <p className="font-semibold">Top Diseases:</p>
          {item.predictions.map((p, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{p.disease}</span>
              <span>{p.probability}%</span>
            </div>
          ))}

          {/* Download Button */}
          <button
            onClick={() => downloadReport(item)}
            className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
          >
            Download Report
          </button>
        </div>
      ))}
    </div>
  );
};

export default History;