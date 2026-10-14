from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.services.diabetes.predict import predict_diabetes


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Health Predictor API",
    description="AI-based health prediction backend",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DIABETES INPUT SCHEMA
# ============================================================

class DiabetesInput(BaseModel):

    HighBP: int = Field(..., ge=0, le=1)
    HighChol: int = Field(..., ge=0, le=1)
    CholCheck: int = Field(..., ge=0, le=1)

    BMI: float = Field(..., ge=10, le=100)

    Smoker: int = Field(..., ge=0, le=1)
    Stroke: int = Field(..., ge=0, le=1)
    HeartDiseaseorAttack: int = Field(..., ge=0, le=1)
    PhysActivity: int = Field(..., ge=0, le=1)
    Fruits: int = Field(..., ge=0, le=1)
    Veggies: int = Field(..., ge=0, le=1)
    HvyAlcoholConsump: int = Field(..., ge=0, le=1)
    AnyHealthcare: int = Field(..., ge=0, le=1)
    NoDocbcCost: int = Field(..., ge=0, le=1)

    GenHlth: int = Field(..., ge=1, le=5)
    MentHlth: int = Field(..., ge=0, le=30)
    PhysHlth: int = Field(..., ge=0, le=30)

    DiffWalk: int = Field(..., ge=0, le=1)
    Sex: int = Field(..., ge=0, le=1)

    Age: int = Field(..., ge=1, le=13)
    Education: int = Field(..., ge=1, le=6)
    Income: int = Field(..., ge=1, le=8)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Health Predictor API is running",
        "status": "success"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# ============================================================
# DIABETES PREDICTION
# ============================================================

@app.post("/predict/diabetes")
def diabetes_prediction(data: DiabetesInput):

    try:

        # Convert validated Pydantic data into dictionary
        input_data = data.model_dump()

        # Send all 21 features to prediction service
        result = predict_diabetes(input_data)

        # Return complete prediction response
        return {
            "success": True,

            # Model result
            "prediction": result["prediction"],
            "probability": result["probability"],

            # Risk interpretation
            "risk_level": result["risk_level"],
            "prediction_message": result["prediction_message"],

            # Explanation
            "key_factors": result["key_factors"],
            "positive_factors": result["positive_factors"],

            # Recommendations
            "recommendations": result["recommendations"],

            # Medical disclaimer
            "disclaimer": (
                "This AI-based result is for screening purposes "
                "only and is not a medical diagnosis."
            )
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )