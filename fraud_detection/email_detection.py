from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.main_file import predict  # Import the predict function

app = FastAPI()

# Define the request body for the prediction
class PredictRequest(BaseModel):
    features: str

# Define a prediction route
@app.post("/predict")
async def get_prediction(request: PredictRequest):
    try:
        prediction = predict(request.features)
        return {"prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error making prediction: {str(e)}")
