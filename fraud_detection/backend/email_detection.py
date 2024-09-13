from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fraud_detection.backend.main_file import predict  # Import the predict function

router = APIRouter(
    prefix='/email',
    tags=['phishing_email']
)


# Define the request body for the prediction
class PredictRequest(BaseModel):
    features: str


# Define a prediction route
@router.post("/predict")
async def get_prediction(request: PredictRequest):
    try:
        prediction = predict(request.features)
        return {"prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error making prediction: {str(e)}")
