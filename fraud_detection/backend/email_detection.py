from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from main_file import predict  # Import the predict function
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Define the request body for the prediction
class PredictRequest(BaseModel):
    features: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
)

# Define a prediction route
@app.post("/predict")
async def get_prediction(request: PredictRequest):
    try:
        prediction = predict(request.features)
        return {"prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error making prediction: {str(e)}")
