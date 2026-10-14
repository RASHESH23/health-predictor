import os
import joblib
import pandas as pd

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../.."
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "raw",
    "diabetes_binary_health_indicators_BRFSS2015.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models",
    "diabetes"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "diabetes_model.pkl"
)

FEATURE_PATH = os.path.join(
    MODEL_DIR,
    "feature_columns.pkl"
)


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading diabetes dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Original dataset shape: {df.shape}")


# ============================================================
# REMOVE DUPLICATES
# ============================================================

before = len(df)

df = df.drop_duplicates().reset_index(drop=True)

after = len(df)

print(f"Duplicates removed: {before - after}")
print(f"Clean dataset shape: {df.shape}")


# ============================================================
# FEATURES AND TARGET
# ============================================================

TARGET = "Diabetes_binary"

X = df.drop(columns=[TARGET])
y = df[TARGET]


print(f"X shape: {X.shape}")
print(f"y shape: {y.shape}")

print("\nTarget distribution:")
print(y.value_counts())

print("\nTarget percentage:")
print(y.value_counts(normalize=True).mul(100).round(2))


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\nTraining data:", X_train.shape)
print("Testing data:", X_test.shape)


# ============================================================
# GRADIENT BOOSTING MODEL
# ============================================================

print("\nTraining Gradient Boosting...")

model = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)

model.fit(X_train, y_train)

print("Training completed!")


# ============================================================
# PREDICTIONS
# ============================================================

y_pred = model.predict(X_test)

y_probability = model.predict_proba(X_test)[:, 1]


# ============================================================
# MODEL EVALUATION
# ============================================================

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    y_probability
)

pr_auc = average_precision_score(
    y_test,
    y_probability
)


print("\n" + "=" * 60)
print("FINAL GRADIENT BOOSTING MODEL")
print("=" * 60)

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")
print(f"PR-AUC   : {pr_auc:.4f}")


print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(model, MODEL_PATH)

print("\nModel saved successfully:")
print(MODEL_PATH)


# ============================================================
# SAVE FEATURE COLUMN ORDER
# ============================================================

feature_columns = list(X.columns)

joblib.dump(
    feature_columns,
    FEATURE_PATH
)

print("\nFeature columns saved successfully:")
print(FEATURE_PATH)

print("\n" + "=" * 60)
print("DIABETES MODEL TRAINING COMPLETE")
print("=" * 60)
