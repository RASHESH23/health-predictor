import os
import joblib
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../.."
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "diabetes",
    "diabetes_model.pkl"
)

FEATURE_PATH = os.path.join(
    BASE_DIR,
    "models",
    "diabetes",
    "feature_columns.pkl"
)


# ============================================================
# LOAD MODEL
# ============================================================

model = joblib.load(MODEL_PATH)
feature_columns = joblib.load(FEATURE_PATH)


# ============================================================
# DIABETES PREDICTION
# ============================================================

def predict_diabetes(input_data: dict):

    # --------------------------------------------------------
    # Create DataFrame
    # --------------------------------------------------------

    input_df = pd.DataFrame([input_data])

    # Make sure feature order is exactly the same
    input_df = input_df[feature_columns]

    # --------------------------------------------------------
    # Get probability
    # --------------------------------------------------------

    probability = model.predict_proba(input_df)[0][1]

    # --------------------------------------------------------
    # Prediction threshold
    # --------------------------------------------------------

    threshold = 0.25

    prediction = int(probability >= threshold)

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    if probability < 0.20:
        risk_level = "Low"

    elif probability < 0.40:
        risk_level = "Moderate"

    else:
        risk_level = "High"

    # --------------------------------------------------------
    # Prediction message
    # --------------------------------------------------------

    if prediction == 1:
        prediction_message = "Higher likelihood detected"
    else:
        prediction_message = "Lower likelihood detected"

    # --------------------------------------------------------
    # Key factors
    # --------------------------------------------------------

    key_factors = []

    if input_data["HighBP"] == 1:
        key_factors.append(
            "High blood pressure was reported."
        )

    if input_data["HighChol"] == 1:
        key_factors.append(
            "High cholesterol was reported."
        )

    if input_data["BMI"] >= 30:
        key_factors.append(
            "BMI is in the obesity range."
        )

    elif input_data["BMI"] >= 25:
        key_factors.append(
            "BMI is in the overweight range."
        )

    if input_data["HeartDiseaseorAttack"] == 1:
        key_factors.append(
            "History of heart disease or heart attack was reported."
        )

    if input_data["Stroke"] == 1:
        key_factors.append(
            "History of stroke was reported."
        )

    if input_data["PhysActivity"] == 0:
        key_factors.append(
            "No physical activity was reported during the previous 30 days."
        )

    if input_data["DiffWalk"] == 1:
        key_factors.append(
            "Difficulty walking or climbing stairs was reported."
        )

    if input_data["GenHlth"] >= 4:
        key_factors.append(
            "General health was reported as poor or very poor."
        )

    if input_data["PhysHlth"] >= 15:
        key_factors.append(
            "A high number of physically unhealthy days was reported."
        )

    if input_data["Age"] >= 9:
        key_factors.append(
            "The selected age category is associated with increased risk."
        )

    # --------------------------------------------------------
    # Positive factors
    # --------------------------------------------------------

    positive_factors = []

    if input_data["PhysActivity"] == 1:
        positive_factors.append(
            "Regular physical activity was reported."
        )

    if input_data["Fruits"] == 1:
        positive_factors.append(
            "Regular fruit consumption was reported."
        )

    if input_data["Veggies"] == 1:
        positive_factors.append(
            "Regular vegetable consumption was reported."
        )

    if input_data["HighBP"] == 0:
        positive_factors.append(
            "No high blood pressure was reported."
        )

    if input_data["HighChol"] == 0:
        positive_factors.append(
            "No high cholesterol was reported."
        )

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    recommendations = [
        "Maintain a balanced diet.",
        "Stay physically active regularly.",
        "Monitor blood pressure and cholesterol.",
        "Attend routine health checkups."
    ]

    if input_data["PhysActivity"] == 0:
        recommendations.insert(
            0,
            "Consider increasing regular physical activity."
        )

    if input_data["BMI"] >= 25:
        recommendations.insert(
            0,
            "Consider maintaining a healthy weight through balanced nutrition and physical activity."
        )

    # --------------------------------------------------------
    # Return complete result
    # --------------------------------------------------------

    return {
        "prediction": prediction,
        "probability": round(float(probability), 4),
        "risk_level": risk_level,
        "prediction_message": prediction_message,
        "key_factors": key_factors,
        "positive_factors": positive_factors,
        "recommendations": recommendations
    }