import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# PayU Test Mode configuration
PAYU_KEY = os.getenv("PAYU_KEY", "")
PAYU_SALT = os.getenv("PAYU_SALT", "")
PAYU_BASE_URL = os.getenv(
    "PAYU_BASE_URL",
    "https://test.payu.in"
)