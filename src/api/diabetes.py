from fastapi import APIRouter
from pydantic import BaseModel

from src.services.diabetes.predict import predict_diabetes


router = APIRouter(
    prefix="/api/diabetes",
    tags=["Diabetes"]
)


class DiabetesInput(BaseModel):
    HighBP: float
    HighChol: float
    CholCheck: float
    BMI: float
    Smoker: float
    Stroke: float
    HeartDiseaseorAttack: float
    PhysActivity: float
    Fruits: float
    Veggies: float
    HvyAlcoholConsump: float
    AnyHealthcare: float
    NoDocbcCost: float
    GenHlth: float
    MentHlth: float
    PhysHlth: float
    DiffWalk: float
    Sex: float
    Age: float
    Education: float
    Income: float


@router.post("/predict")
def diabetes_prediction(data: DiabetesInput):

    result = predict_diabetes(data.model_dump())

    return result