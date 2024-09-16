from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import APIRouter
import pymysql
from typing import List
import random


# Set up Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Database connection settings
DB_HOST = 'seniorscamsafe.cdu48eiyg8cf.ap-southeast-2.rds.amazonaws.com'
DB_USER = 'admin'
DB_PASSWORD = 'MonashTA0620241!'
DB_NAME = 'SeniorSafeScam'


router = APIRouter(
    prefix='/data',
    tags=['quiz']
)


# API endpoint to get scam data by year
@router.get("/api/quiz-questions", response_model=List[dict])
async def get_quiz_questions():
    # Connect to the database
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=3306
    )
    
    # Define the target email types and how many emails to select
    email_types = [
        "Smishing Phishing Scam",
        "Safe Email",
        "Spear Phishing Scam",
        "Business Email Compromise Phishing Scam",
        "Clone Phishing Scam"
    ]
    questions = []
    
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            for email_type in email_types:
                # Fetch all emails for the given type from the database
                sql = f"SELECT EmailContent, Classification, TypeOfEmail, Reason, Recommendation FROM PhishingQuiz WHERE TypeOfEmail = %s"
                cursor.execute(sql, (email_type,))
                emails = cursor.fetchall()

                # Randomly select two emails for this type
                selected_emails = random.sample(emails, 2) if len(emails) >= 2 else emails
                
                # Format the selected emails into the desired structure
                for email in selected_emails:
                    questions.append({
                        "content": email['EmailContent'],
                        "is_phishing": email['Classification'] == "Phishing",
                        "reason": email['Reason'],
                        "recommendation": email['Recommendation'],
                        "TypeOfEmail":email['TypeOfEmail']
                    })
    
    except Exception as e:
        print(f"Error fetching quiz questions: {e}")
    finally:
        connection.close()

    random.shuffle(questions)

    return questions

# cd /Users/lukassteel/Desktop/SeniorSafe
# uvicorn cybercrime-and-scams.frontend.Quiz.app:app --reload

