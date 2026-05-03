from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import joblib
from pathlib import Path

app = FastAPI()

# 🔒 Robust paths
BASE = Path(__file__).resolve().parent           # .../ml-service/app
MODELS = BASE / "models"

try:
    rf_model = joblib.load(MODELS / "random_forest.pkl")
    lr_model = joblib.load(MODELS / "logistic_regression.pkl")
    svm_model = joblib.load(MODELS / "svm.pkl")
    xgb_model = joblib.load(MODELS / "xgboost.pkl")
    symptom_list = joblib.load(MODELS / "symptom_list.pkl")
    label_encoder = joblib.load(MODELS / "label_encoder.pkl")
    metrics = joblib.load(MODELS /"metrics.pkl")
except Exception as e:
    print("❌ Model load error:", e)
    raise

symptom_index = {s: i for i, s in enumerate(symptom_list)}

class InputData(BaseModel):
    symptoms: list[str]

@app.get("/")
def home():
    return {"message": "ML API is running"}

@app.post("/predict")
def predict(data: InputData):
    try:
        symptoms = data.symptoms or []
        if not symptoms:
            raise HTTPException(status_code=400, detail="No symptoms provided")

        # ✅ Build vector correctly
        vec = np.zeros(len(symptom_list))
        for s in symptoms:
            if s in symptom_index:
                vec[symptom_index[s]] = 1
        vec = vec.reshape(1, -1)

        # ✅ Predict
        rf = rf_model.predict_proba(vec)[0]
        lr = lr_model.predict_proba(vec)[0]
        svm = svm_model.predict_proba(vec)[0]
        xgb = xgb_model.predict_proba(vec)[0]

        # ✅ IMPORTANT: use label_encoder classes (XGB was trained with encoded y)
        classes = label_encoder.classes_

        model_predictions = {}
        for i, d in enumerate(classes):
            model_predictions[d] = {
                "Random Forest": round(float(rf[i]) * 100, 2),
                "Logistic Regression": round(float(lr[i]) * 100, 2),
                "SVM": round(float(svm[i]) * 100, 2),
                "XGBoost": round(float(xgb[i]) * 100, 2),
            }

        # Top-3 summary (by RF)
        top_idx = np.argsort(rf)[-3:][::-1]
        predictions = [
            {"disease": classes[i], "probability": round(float(rf[i]) * 100, 2)}
            for i in top_idx
        ]

        return {
            "predictions": predictions,
            "model_predictions": model_predictions,
            "metrics": metrics
        }

    except Exception as e:
        print("❌ Predict error:", e)
        raise HTTPException(status_code=500, detail=str(e))