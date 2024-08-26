import pymysql
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Database connection function
def get_connection():
    try:
        connection = pymysql.connect(
            host='seniorscamsafe.cdu48eiyg8cf.ap-southeast-2.rds.amazonaws.com',
            user='admin',
            password='MonashTA0620241!',
            database='SeniorSafeScam',
            port=3306
        )
        return connection
    except pymysql.MySQLError as e:
        raise HTTPException(status_code=500, detail="Database connection failed")

# Data retrieval function
def fetch_scam_by_year_data():
    query = """
    SELECT 
        YEAR(StartOfMonth) AS Year,
        Address_State AS State,
        Scam_Contact_Mode AS ScamContactMode,
        Complainant_Gender AS Gender,
        Category_Level_3 AS ScamType,
        SUM(Amount_lost) AS AmountLost,
        SUM(Number_of_reports) AS NumberOfReports
    FROM 
        ScamWatch
    GROUP BY 
        YEAR(StartOfMonth),
        Address_State,
        Scam_Contact_Mode,
        Complainant_Gender,
        Category_Level_3
    ORDER BY 
        YEAR(StartOfMonth);
    """

    try:
        connection = get_connection()
        df = pd.read_sql(query, connection)
    finally:
        connection.close()

    # Handle NaN and infinite values
    df = df.fillna(0).replace([float('inf'), float('-inf')], 0)
    return df

# FastAPI app initialization
app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# API endpoint to get scam data by year
@app.get("/scam-by-year")
def get_scam_by_year():
    try:
        df = fetch_scam_by_year_data()
        return JSONResponse(df.to_dict(orient="records"))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Data retrieval failed")

# Run the server with:
# uvicorn scrollytelly.data2:app --reload
