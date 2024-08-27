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
    MONTHNAME(StartOfMonth) AS Month,
    Address_State AS State,
    CASE
    WHEN Scam_Contact_Mode = "Social media/Online forums" THEN "Social media" ELSE Scam_Contact_Mode
    END AS ScamContactMode,
    Complainant_Gender AS Gender,
    Category_Level_3 AS ScamType,
    ISNULL(SUM(Amount_lost)) = 0 AS AmountLost,
    SUM(Number_of_reports) AS NumberOfReports,
    CASE 
    WHEN COALESCE(SUM(Amount_lost), 0) = 0 THEN '$0'
    WHEN COALESCE(SUM(Amount_lost), 0) BETWEEN 1 AND 10000 THEN '$1 - $10,000'
    WHEN COALESCE(SUM(Amount_lost), 0) BETWEEN 10001 AND 50000 THEN '$10,001 - $50,000'
    WHEN COALESCE(SUM(Amount_lost), 0) BETWEEN 50001 AND 200000 THEN '$50,001 - $200,000'
    WHEN COALESCE(SUM(Amount_lost), 0) BETWEEN 200001 AND 1000000 THEN '$200,001 - $1,000,000'
    WHEN COALESCE(SUM(Amount_lost), 0) > 1000001 THEN '$1,000,001+'
    ELSE 'Unknown'
END AS AmountLostRange

FROM 
    ScamWatch
GROUP BY 
    YEAR(StartOfMonth),
    MONTHNAME(StartOfMonth),
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
# uvicorn scrollytelly.data:app --reload
