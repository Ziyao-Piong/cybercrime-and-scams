from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import scrollytelly.data as data_router
import fraud_detection.backend.email_detection as email_router
import frontend.Quiz.app as quiz_router
import frontend.scamReport.app as report_router


app = FastAPI()

app.include_router(data_router.router)
app.include_router(email_router.router)
app.include_router(quiz_router.router)
app.include_router(report_router.router)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


@app.get('/')
def home():
    return { "message": "You're at home page." }


# Run the server with:
# uvicorn main:app --reload