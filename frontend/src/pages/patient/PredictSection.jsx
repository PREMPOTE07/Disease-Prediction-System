import React, { useEffect, useState } from "react";
import { getSymptoms, predictDisease } from "../../services/api.js";
import { toast } from "react-toastify";
import ModelChart from "../../components/charts/ModelChart.jsx"; 

const PredictSection = () => {
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [modelPredictions, setModelPredictions] = useState({});

  // ADD STATES
  const [predictions, setPredictions] = useState([]);
  
  const [loading, setLoading] = useState(false);

  const [metrics, setMetrics] = useState({});
  const [showTable, setShowTable] = useState(false);

  // Load symptoms from backend
  useEffect(() => {
    const fetchSymptoms = async () => {
      const res = await getSymptoms();
      setAllSymptoms(res.data);
    };
    fetchSymptoms();
  }, []);

  // Filter search
  useEffect(() => {
    if (!search) return setFiltered([]);

    const filteredData = allSymptoms.filter((s) =>
      s.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(filteredData.slice(0, 8));
  }, [search, allSymptoms]);

  // Add symptom
  const addSymptom = (symptom) => {
    if (!selected.includes(symptom)) {
      setSelected([...selected, symptom]);
    }
    setSearch("");
    setFiltered([]);
  };

  // Remove symptom
  const removeSymptom = (symptom) => {
    setSelected(selected.filter((s) => s !== symptom));
  };

  // Predict
  const handlePredict = async () => {
    if (selected.length === 0) {
      return toast.error("Select symptoms first");
    }

    try {
      setLoading(true);

      const res = await predictDisease({ symptoms: selected });

      console.log("FULL RESPONSE:", res.data);

      setPredictions(res.data.predictions || []);
      setMetrics(res.data.metrics || {});
      console.log("METRICS:", res.data.metrics);
      
      setModelPredictions(res.data.model_predictions || {});

      toast.success("Prediction success");



    } catch {
      toast.error("Prediction failed");
    } finally {
      setLoading(false);
    }
  };
   

  
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Disease Prediction</h1>

      {/* 🔍 SEARCH SECTION */}
      <div className="bg-white p-6 rounded-xl shadow relative mb-6">
        <input
          type="text"
          placeholder="Search symptoms..."
          className="w-full p-3 border rounded mb-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* DROPDOWN */}
        {filtered.length > 0 && (
          <div className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10 rounded shadow">
            {filtered.map((symptom, i) => (
              <div
                key={i}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => addSymptom(symptom)}
              >
                {symptom}
              </div>
            ))}
          </div>
        )}

        {/* SELECTED TAGS */}
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((symptom, i) => (
            <div
              key={i}
              className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center text-sm"
            >
              {symptom}
              <button
                className="ml-2"
                onClick={() => removeSymptom(symptom)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <button
          onClick={handlePredict}
          className="mt-4 bg-blue-600 text-white px-5 py-2 rounded w-full md:w-auto"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {predictions.length > 0 &&
  predictions.map((item, index) => {
    const disease = item.disease;

    const chartData = Object.entries(modelPredictions[disease] || {}).map(
      ([model, prob]) => ({
        model,
        probability: prob,
      })
    );

    return (
      <div key={index} className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {disease} - Model Comparison
        </h2>

        <ModelChart data={chartData} />
      </div>
    );
  })}

  <button
  onClick={() => setShowTable(!showTable)}
  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
  {showTable ? "Hide Details" : "Show Model Details"}
  </button>
    
    {showTable && metrics && Object.keys(metrics).length > 0 && (
  <div className="mt-6 bg-white p-6 rounded-xl shadow overflow-x-auto">
    <h2 className="text-xl font-semibold mb-4 text-center">
      Model Performance Comparison
    </h2>

    <table className="min-w-full border border-gray-200 text-sm">
      <thead className="bg-blue-600 text-white">
        <tr>
          <th className="px-4 py-2">Algorithm</th>
          <th className="px-4 py-2">Accuracy</th>
          <th className="px-4 py-2">Precision</th>
          <th className="px-4 py-2">Recall</th>
          <th className="px-4 py-2">F1 Score</th>
          <th className="px-4 py-2">Probability</th>
        </tr>
      </thead>

      <tbody>
        {Object.entries(metrics).map(([model, m], index) => {
          // 👉 Get probability from top predicted disease
          const topDisease = predictions[0]?.disease;
          const probability =
          modelPredictions[topDisease]?.[model] ||
          modelPredictions[topDisease?.trim()]?.[model] ||
          0;

          return (
            <tr
              key={index}
              className="text-center border-b hover:bg-gray-50"
            >
              <td className="px-4 py-2 font-medium">{model}</td>
              <td className="px-4 py-2">{m.accuracy}%</td>
              <td className="px-4 py-2">{m.precision}%</td>
              <td className="px-4 py-2">{m.recall}%</td>
              <td className="px-4 py-2">{m.f1}%</td>
              <td className="px-4 py-2 text-blue-600 font-semibold">
                {probability}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

    </div>
  );
};

export default PredictSection;