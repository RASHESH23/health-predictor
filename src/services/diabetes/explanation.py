# ============================================================
# DIABETES MODEL EXPLANATION
# ============================================================

def generate_diabetes_explanation(data):
    """
    Generate a human-readable explanation based on
    the user's input features.

    IMPORTANT:
    This is an explanation layer for the screening result.
    It does NOT change the machine learning prediction.
    """

    risk_factors = []
    positive_factors = []
    suggestions = []


    # ========================================================
    # RISK FACTORS
    # ========================================================

    if data["HighBP"] == 1:
        risk_factors.append(
            "High blood pressure was reported."
        )
        suggestions.append(
            "Consider monitoring your blood pressure regularly."
        )

    if data["HighChol"] == 1:
        risk_factors.append(
            "High cholesterol was reported."
        )
        suggestions.append(
            "Consider monitoring cholesterol levels and discussing them with a healthcare professional."
        )

    if data["BMI"] >= 30:
        risk_factors.append(
            f"BMI is {data['BMI']:.1f}, which is in the obesity range."
        )
        suggestions.append(
            "Maintaining a healthy body weight through appropriate diet and physical activity may be beneficial."
        )

    elif data["BMI"] >= 25:
        risk_factors.append(
            f"BMI is {data['BMI']:.1f}, which is above the healthy BMI range."
        )

    if data["PhysActivity"] == 0:
        risk_factors.append(
            "No physical activity was reported during the previous 30 days."
        )
        suggestions.append(
            "Consider incorporating regular physical activity when appropriate."
        )

    if data["DiffWalk"] == 1:
        risk_factors.append(
            "Difficulty walking or climbing stairs was reported."
        )

    if data["HeartDiseaseorAttack"] == 1:
        risk_factors.append(
            "A history of heart disease or heart attack was reported."
        )

    if data["Stroke"] == 1:
        risk_factors.append(
            "A history of stroke was reported."
        )

    if data["Smoker"] == 1:
        risk_factors.append(
            "A history of smoking was reported."
        )
        suggestions.append(
            "Avoiding tobacco use can support overall health."
        )

    if data["GenHlth"] >= 4:
        risk_factors.append(
            "General health was rated as below average."
        )

    if data["PhysHlth"] >= 15:
        risk_factors.append(
            "A relatively high number of physically unhealthy days was reported."
        )

    if data["MentHlth"] >= 15:
        risk_factors.append(
            "A relatively high number of mentally unhealthy days was reported."
        )

    if data["Age"] >= 9:
        risk_factors.append(
            "The reported age category is associated with an increased diabetes risk in the dataset."
        )


    # ========================================================
    # POSITIVE / PROTECTIVE FACTORS
    # ========================================================

    if data["PhysActivity"] == 1:
        positive_factors.append(
            "Regular physical activity was reported."
        )

    if data["Fruits"] == 1:
        positive_factors.append(
            "Regular fruit consumption was reported."
        )

    if data["Veggies"] == 1:
        positive_factors.append(
            "Regular vegetable consumption was reported."
        )

    if data["HvyAlcoholConsump"] == 0:
        positive_factors.append(
            "No heavy alcohol consumption was reported."
        )

    if data["Smoker"] == 0:
        positive_factors.append(
            "No smoking history was reported."
        )

    if data["Stroke"] == 0:
        positive_factors.append(
            "No history of stroke was reported."
        )

    if data["HeartDiseaseorAttack"] == 0:
        positive_factors.append(
            "No history of heart disease or heart attack was reported."
        )


    # ========================================================
    # DEFAULT MESSAGES
    # ========================================================

    if not risk_factors:
        risk_factors.append(
            "No major risk-related factors were identified from the provided information."
        )

    if not positive_factors:
        positive_factors.append(
            "No specific positive lifestyle factors were identified from the provided information."
        )

    if not suggestions:
        suggestions.append(
            "Continue maintaining healthy lifestyle habits and regular health check-ups."
        )


    # ========================================================
    # RETURN EXPLANATION
    # ========================================================

    return {
        "risk_factors": risk_factors,
        "positive_factors": positive_factors,
        "suggestions": suggestions
    }