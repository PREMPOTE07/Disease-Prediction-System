from pathlib import Path
import pandas as pd
import numpy as np
import joblib
import json

from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

# ==========================================================
# 1. LOAD DATA
# ==========================================================
BASE_DIR = Path(__file__).resolve().parent

train_path = BASE_DIR / "dataset" / "Training.csv"
test_path = BASE_DIR / "dataset" / "Testing.csv"

train_df = pd.read_csv(train_path)
test_df = pd.read_csv(test_path)

print("Train shape:", train_df.shape)
print("Test shape:", test_df.shape)

# ==========================================================
# 2. CLEAN COLUMN NAMES
# ==========================================================
train_df.columns = train_df.columns.str.strip().str.lower()
test_df.columns = test_df.columns.str.strip().str.lower()

# ==========================================================
# 3. REMOVE USELESS COLUMNS (CRITICAL FIX)
# ==========================================================
train_df = train_df.loc[:, ~train_df.columns.str.contains("^unnamed", case=False)]
test_df = test_df.loc[:, ~test_df.columns.str.contains("^unnamed", case=False)]

# ==========================================================
# 4. ALIGN TRAIN & TEST COLUMNS
# ==========================================================
common_cols = train_df.columns.intersection(test_df.columns)

train_df = train_df[common_cols]
test_df = test_df[common_cols]

print("✅ Columns aligned:", len(common_cols))

# ==========================================================
# 5. TARGET COLUMN
# ==========================================================
target_column = "prognosis"

# ==========================================================
# 6. SPLIT FEATURES & TARGET
# ==========================================================
X_train = train_df.drop(columns=[target_column])
y_train = train_df[target_column]

X_test = test_df.drop(columns=[target_column])
y_test = test_df[target_column]

# ==========================================================
# 7. HANDLE MISSING VALUES
# ==========================================================
print("\n🔍 Handling missing values...")

imputer = SimpleImputer(strategy="constant", fill_value=0)

X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)

print("✅ Missing values handled")

# ==========================================================
# 8. ENCODE TARGET
# ==========================================================
label_encoder = LabelEncoder()

y_train = label_encoder.fit_transform(y_train)
y_test = label_encoder.transform(y_test)

# ==========================================================
# 9. MODELS
# ==========================================================
models = {
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=300),
    "SVM": SVC(probability=True),
    "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric="mlogloss"),
}

metrics = {}
best_model = None
best_accuracy = 0
best_model_name = ""
all_symptoms = []

# ==========================================================
# 10. TRAIN + EVALUATE
# ==========================================================
for name, model in models.items():
    print(f"\n🚀 Training {name}...")

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    metrics[name] = {
        "accuracy": round(acc * 100, 2),
        "precision": round(prec * 100, 2),
        "recall": round(rec * 100, 2),
        "f1_score": round(f1 * 100, 2),
    }

    print(f"{name} → Accuracy: {acc:.4f}")

    if acc > best_accuracy:
        best_accuracy = acc
        best_model = model
        best_model_name = name

# ==========================================================
# 11. SAVE MODEL
# ==========================================================
MODELS_DIR = BASE_DIR.parent / "app" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

joblib.dump(best_model, MODELS_DIR / "disease_model.pkl")
joblib.dump(label_encoder, MODELS_DIR / "label_encoder.pkl")
joblib.dump(all_symptoms, MODELS_DIR / "symptom_list.pkl")

with open(MODELS_DIR / "model_metrics.json", "w") as f:
    json.dump(metrics, f, indent=4)

# ==========================================================
# 12. FINAL OUTPUT
# ==========================================================
print("\n🎉 TRAINING COMPLETED")
print(f"🏆 Best Model: {best_model_name}")
print(f"📊 Accuracy: {round(best_accuracy * 100, 2)}%")

print("\n📊 ALL METRICS:")
for m, v in metrics.items():
    print(m, ":", v)