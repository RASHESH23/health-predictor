from fastapi import FastAPI
from src.api.diabetes import router as diabetes_router


app = FastAPI(
    title="Health Predictor API",
    description="AI-based health risk prediction API",
    version="1.0.0"
)


app.include_router(diabetes_router)


@app.get("/")
def home():
    return {
        "message": "Health Predictor API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }