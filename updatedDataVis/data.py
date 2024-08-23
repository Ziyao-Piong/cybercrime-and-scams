import pymysql
import pandas as pd
import json
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Database connection function
def get_connection():
    return pymysql.connect(
        host='seniorscamsafe.cdu48eiyg8cf.ap-southeast-2.rds.amazonaws.com',
        user='admin',
        password='MonashTA0620241!',
        database='SeniorSafeScam',
        port=3306
    )

# Function to retrieve GeoJSON formatted map data
def get_geojson_data():
    query = """
    SELECT 
        state_code as id, 
        state_name as name, 
        geometry_type,
        coordinates
    FROM map;
    """
    
    connection = get_connection()
    df = pd.read_sql(query, connection)
    connection.close()

    # Construct GeoJSON format
    features = []
    for _, row in df.iterrows():
        feature = {
            "type": "Feature",
            "geometry": {
                "type": row["geometry_type"],
                "coordinates": json.loads(row["coordinates"])
            },
            "properties": {
                "STATE_CODE": row["id"],
                "STATE_NAME": row["name"]
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    return geojson


# Data aggregation functions
def aggregate_reports_by_state():
    query = """
    SELECT Address_State, COUNT(*) as ReportCount
    FROM ScamWatch
    GROUP BY Address_State;
    """
    connection = get_connection()
    df = pd.read_sql(query, connection)
    connection.close()
    return df

def split_date_and_aggregate():
    query = """
    SELECT 
        YEAR(StartOfMonth) as Year, 
        MONTH(StartOfMonth) as Month, 
        COUNT(*) as ReportCount
    FROM ScamWatch
    GROUP BY Year, Month;
    """
    connection = get_connection()
    df = pd.read_sql(query, connection)
    connection.close()
    return df

def aggregate_by_state_and_scam_type():
    query = """
    SELECT Address_State, Scam_Contact_Mode, SUM(Number_of_reports) as ReportCount
    FROM ScamWatch
    GROUP BY Address_State, Scam_Contact_Mode;
    """
    connection = get_connection()
    df = pd.read_sql(query, connection)
    df_pivot = df.pivot(index='Address_State', columns='Scam_Contact_Mode', values='ReportCount').fillna(0)
    connection.close()
    return df_pivot

def transform_gender_data():
    query = """
    SELECT Scam_Contact_Mode AS ScamType, 
           SUM(CASE WHEN Complainant_Gender = 'Female' THEN Number_of_reports ELSE 0 END) AS Female,
           SUM(CASE WHEN Complainant_Gender = 'Male' THEN Number_of_reports ELSE 0 END) AS Male,
           SUM(CASE WHEN Complainant_Gender = 'X (Indeterminate/Intersex/Unspecified)' THEN Number_of_reports ELSE 0 END) AS `X (Indeterminate/Intersex/Unspecified)`
    FROM ScamWatch
    GROUP BY Scam_Contact_Mode;
    """
    connection = get_connection()
    df = pd.read_sql(query, connection)
    connection.close()
    return df

# FastAPI app
app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/aggregate-reports-by-state")
def get_aggregate_reports_by_state():
    df = aggregate_reports_by_state()
    return JSONResponse(df.to_dict(orient="records"))

@app.get("/split-date-and-aggregate")
def get_split_date_and_aggregate():
    df = split_date_and_aggregate()
    return JSONResponse(df.to_dict(orient="records"))

@app.get("/aggregate-by-state-and-scam-type")
def get_aggregate_by_state_and_scam_type():
    df = aggregate_by_state_and_scam_type()
    return JSONResponse(df.to_dict(orient="index"))

@app.get("/aggregate-by-gender")
def get_aggregate_by_gender():
    df = transform_gender_data()
    return JSONResponse(df.to_dict(orient="records"))

@app.get("/map")
def get_map_data():
    geojson_data = get_geojson_data()
    return JSONResponse(content=geojson_data)

# cd /workspaces/cybercrime-and-scams
# uvicorn updatedDataVis.data:app --reload


