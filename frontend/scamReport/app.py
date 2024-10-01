from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator, ValidationInfo
from typing import Literal
import pymysql
from pymysql import MySQLError
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import uuid
import uvicorn

# Create FastAPI app instance
app = FastAPI(docs_url="/docs", redoc_url="/redoc")

# Enable CORS (comment it out if unnecessary)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for security in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection configuration
DB_CONFIG = {
    'host': 'seniorscamsafe.cdu48eiyg8cf.ap-southeast-2.rds.amazonaws.com',
    'database': 'SeniorSafeScam',
    'user': 'admin',
    'password': 'MonashTA0620241!'
}

# Pydantic model for ScamWatch table with input validation
class ScamReport(BaseModel):
    StartOfMonth: datetime
    Address_State: Literal[
        'Australian Capital Territory', 'New South Wales', 'Northern Territory',
        'Outside of Australia', 'Queensland', 'South Australia', 'Tasmania',
        'Victoria', 'Western Australia', 'Unspecified'
    ]
    Scam_Contact_Mode: Literal[
        'Email', 'Phone Call', 'Text message', 'In person', 'Internet',
        'Mail', 'Social media', 'Mobile apps', 'Unspecified', 'Fax'
    ]
    Complainant_Age: Literal['Under 18', '18 - 24', '25 - 34', '35 - 44', '45 - 54', '55 - 64', '65 and over']
    Complainant_Gender: Literal['Male', 'Female']
    Category_Level_2: Literal[
        'Attempts to gain your personal information', 'Buying or selling', 'Investment scams'
    ]
    Category_Level_3: Literal['False billing', 'Phishing', 'Investment scams']
    Amount_lost: float = Field(..., ge=0)
    Number_of_reports: int = Field(default=1)
    user_email: str = Field(..., example="lukasnsteel@gmail.com", pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    verify_email: str = Field(..., example="lukasnsteel@gmail.com", pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

    @field_validator('StartOfMonth', mode='before')
    def set_first_day_of_month(cls, v):
        if isinstance(v, str):
            # Parse the string into a datetime object
            v = datetime.fromisoformat(v)
        return v.replace(day=1)

    # Validate that user_email and verify_email are the same
    @field_validator('verify_email', mode='before')
    def emails_match(cls, v, info: ValidationInfo):
        if v != info.data['user_email']:
            raise ValueError('Emails do not match')
        return v

# Function to get database connection
def get_db_connection():
    try:
        connection = pymysql.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database'],
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except MySQLError as e:
        print(f"Error connecting to MySQL database: {e}")
        return None

# Function to send a thank-you email
def send_thank_you_email(email: str, receipt_number: str):
    sender_email = "seniorsafeta06@gmail.com"  # Replace with your email
    sender_password = "MonashTA06!"  # Replace with your email password

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = "Thank You for Your Phishing Scam Report"

    body = f"""
    Dear User,

    Thank you for submitting a phishing scam report. Your contribution helps us improve our detection and prevention efforts.

    Your report receipt number is: {receipt_number}

    If you have any questions, please don't hesitate to contact us.

    Best regards,
    The Phishing Scam Reporting Team
    """

    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())
        print(f"Thank you email sent to {email}")
    except Exception as e:
        print(f"Error sending email: {str(e)}")

# Root endpoint to test if the API is running
@app.get("/")
async def root():
    return {"message": "Phishing Scam Reporting API"}

# API endpoint for handling form submissions and database operations
@app.post("/submit_report")
async def submit_report(report: ScamReport):
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection error")

    try:
        with connection.cursor() as cursor:
            query = """
            INSERT INTO ScamWatch
            (StartOfMonth, Address_State, Scam_Contact_Mode, Complainant_Age,
            Complainant_Gender, Category_Level_2, Category_Level_3, Amount_lost, Number_of_reports)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                report.StartOfMonth,
                report.Address_State,
                report.Scam_Contact_Mode,
                report.Complainant_Age,
                report.Complainant_Gender,
                report.Category_Level_2,
                report.Category_Level_3,
                report.Amount_lost,
                report.Number_of_reports
            )
            cursor.execute(query, values)
            connection.commit()

        # Generate unique receipt number
        receipt_number = str(uuid.uuid4())

        # Send thank you email
        send_thank_you_email(report.user_email, receipt_number)

        return {"message": "Report submitted successfully", "receipt_number": receipt_number}
    except MySQLError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        connection.close()

if __name__ == "__main__":
    # Use uvicorn to run the API, capturing any startup issues
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    except Exception as e:
        print(f"Failed to start API: {e}")

        # uvicorn app:app --reload
