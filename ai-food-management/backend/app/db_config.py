
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import os

# Load environment variables from backend/.env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

# Get MongoDB settings
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is missing from .env")

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME is missing from .env")

# Connect to MongoDB Atlas
client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000
)

# Select the actual database from .env
db = client[DATABASE_NAME]

# Restaurant collection
restaurants_collection = db["restaurants"]


def check_database_connection():
    try:
        client.admin.command("ping")

        print("========================================")
        print("MongoDB Atlas Connected Successfully!")
        print("Database:", DATABASE_NAME)
        print("Restaurant Collection:", restaurants_collection.name)
        print("========================================")

        return True, "MongoDB Atlas Connected Successfully!"

    except Exception as e:
        return False, str(e)
