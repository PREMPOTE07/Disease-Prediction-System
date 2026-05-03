import pandas as pd
import joblib
import numpy as np
from pathlib import Path
import random

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# =========================
# 📂 PATH CONFIG
# =========================
BASE = Path("D:/DiseasePredictionSystem/ml-service")
DATA_PATH = BASE / "training/dataset/Training.csv"
MODEL_PATH = BASE / "app/models"

# =========================
# 🔥 LOAD DATA
# =========================
df = pd.read_csv(DATA_PATH)

# =========================
# 🧹 CLEAN DATA
# =========================
df = df.loc[:, ~df.columns.str.contains("^Unnamed")]
df = df.fillna(0)
df = df.drop_duplicates()

# FIX LABEL SPACES (IMPORTANT)
df["prognosis"] = df["prognosis"].str.strip()

# =========================
# 🎯 SPLIT
# =========================
X = df.drop("prognosis", axis=1)
y = df["prognosis"]

print("Features:", len(X.columns))
print("Classes:", len(y.unique()))

# =========================
# 💥 ADD NOISE (VERY IMPORTANT)
# =========================
def add_noise(X, noise_level=0.05):
    X_noisy = X.copy()
    for col in X.columns:
        mask = np.random.rand(len(X)) < noise_level
        X_noisy.loc[mask, col] = 1 - X_noisy.loc[mask, col]
    return X_noisy

X = add_noise(X)

# =========================
# 💾 SAVE SYMPTOMS
# =========================
joblib.dump(list(X.columns), MODEL_PATH / "symptom_list.pkl")

# =========================
# 🔀 TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# =========================
# 🔤 LABEL ENCODER
# =========================
le = LabelEncoder()
y_train_enc = le.fit_transform(y_train)
y_test_enc = le.transform(y_test)

joblib.dump(le, MODEL_PATH / "label_encoder.pkl")

# =========================
# 🤖 MODELS
# =========================

rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=20,
    class_weight="balanced",
    random_state=42
)

lr = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(max_iter=2000))
])

svm = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", SVC(probability=True))
])

xgb = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="mlogloss",
    random_state=42
)

# =========================
# 🚀 TRAIN
# =========================
rf.fit(X_train, y_train)
lr.fit(X_train, y_train)
svm.fit(X_train, y_train)
xgb.fit(X_train, y_train_enc)

# =========================
# 💾 SAVE MODELS
# =========================
joblib.dump(rf, MODEL_PATH / "random_forest.pkl")
joblib.dump(lr, MODEL_PATH / "logistic_regression.pkl")
joblib.dump(svm, MODEL_PATH / "svm.pkl")
joblib.dump(xgb, MODEL_PATH / "xgboost.pkl")

# =========================
# 📊 EVALUATION FUNCTION
# =========================
def evaluate(model, X_test, y_test, encoded=False):
    if encoded:
        preds = le.inverse_transform(model.predict(X_test))
    else:
        preds = model.predict(X_test)

    return {
        "accuracy": round(accuracy_score(y_test, preds) * 100, 2),
        "precision": round(precision_score(y_test, preds, average="weighted") * 100, 2),
        "recall": round(recall_score(y_test, preds, average="weighted") * 100, 2),
        "f1": round(f1_score(y_test, preds, average="weighted") * 100, 2)
    }

# =========================
# 📊 CALCULATE METRICS
# =========================
metrics = {
    "Random Forest": evaluate(rf, X_test, y_test),
    "Logistic Regression": evaluate(lr, X_test, y_test),
    "SVM": evaluate(svm, X_test, y_test),
    "XGBoost": evaluate(xgb, X_test, y_test, encoded=True)
}

# =========================
# 🔁 CROSS VALIDATION (REAL PERFORMANCE)
# =========================
cv_scores = cross_val_score(rf, X, y, cv=5)
print("\nCross-validation accuracy:", round(cv_scores.mean() * 100, 2))

# =========================
# 💾 SAVE METRICS
# =========================
joblib.dump(metrics, MODEL_PATH / "metrics.pkl")

# =========================
# ✅ OUTPUT
# =========================
print("\n✅ FINAL METRICS:")
for model, m in metrics.items():
    print(f"{model}: {m}")