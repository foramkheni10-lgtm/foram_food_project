import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import AsyncMongoClient


# =====================================================
# LOAD .ENV FILE
# =====================================================

# Current file:
# backend/app/database.py
#
# .env file:
# backend/.env

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


# =====================================================
# GET MONGODB SETTINGS
# =====================================================

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")


# =====================================================
# CHECK .ENV SETTINGS
# =====================================================

if not MONGODB_URL:
    raise ValueError(
        f"MONGODB_URL is missing in .env file: {ENV_FILE}"
    )

if not DATABASE_NAME:
    raise ValueError(
        f"DATABASE_NAME is missing in .env file: {ENV_FILE}"
    )


# =====================================================
# CREATE MONGODB ATLAS CLIENT
# =====================================================

client = AsyncMongoClient(MONGODB_URL)

# Select your database
database = client[DATABASE_NAME]


# =====================================================
# CHECK MONGODB ATLAS CONNECTION
# =====================================================

async def check_database_connection():
    try:
        await client.admin.command("ping")

        print("========================================")
        print("✅ MongoDB Atlas Connected Successfully!")
        print(f"📁 Database: {DATABASE_NAME}")
        print("========================================")

    except Exception as e:
        print("========================================")
        print("❌ MongoDB Atlas Connection Failed!")
        print(f"Error: {e}")
        print("========================================")


# =====================================================
# CLOSE MONGODB CONNECTION
# =====================================================

async def close_database_connection():
    await client.close()

    print("========================================")
    print("🔴 MongoDB Atlas Connection Closed")
    print("========================================")