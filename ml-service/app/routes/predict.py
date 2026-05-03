from fastapi import APIRouter
import joblib
import numpy as np

router = APIRouter()

model = joblib.load("app/models/disease_model.pkl")
encoder = joblib.load("app/models/label_encoder.pkl")

@router.post("/")
def predict(data: dict):
    symptoms = data["symptoms"]

    # convert symptoms → vector (you map here)
    input_vector = np.zeros(132)  # based on dataset

    # TODO: map symptoms to index

    probs = model.predict_proba([input_vector])[0]
    top = probs.argsort()[-3:][::-1]

    results = [
        {
            "disease": encoder.inverse_transform([i])[0],
            "probability": round(probs[i] * 100, 2)
        }
        for i in top
    ]

    return {"predictions": results}