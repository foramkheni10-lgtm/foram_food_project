from pathlib import Path
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import (
    check_database_connection,
    close_database_connection,
)

from .registration import router as registration_router
from .login import router as login_router

# Customer routers
from app.routes.customer import restaurant
from app.routes.customer import food
from app.routes.customer import ai_assistant
from app.routes.customer import avatar
from app.routes.customer import profile
from app.routes.customer import cart
from app.routes.customer import orders
from app.routes.customer import feedback
from app.routes.customer import favorites
# -------------------------------------------------
# Application startup and shutdown
# -------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check MongoDB when server starts
    await check_database_connection()

    yield

    # Close MongoDB when server stops
    await close_database_connection()


# -------------------------------------------------
# Create FastAPI application
# -------------------------------------------------

app = FastAPI(
    title="AI Food Management API",
    description="Backend API for AI Food Management System",
    version="1.0.0",
    lifespan=lifespan,
)

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
# -------------------------------------------------
# CORS Configuration
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# Registration routes
# -------------------------------------------------

app.include_router(registration_router)


# -------------------------------------------------
# Login routes
# -------------------------------------------------

app.include_router(login_router)


# -------------------------------------------------
# Restaurant routes
# -------------------------------------------------

app.include_router(restaurant.router)


# -------------------------------------------------
# Food routes
# -------------------------------------------------

app.include_router(food.router)

app.include_router(ai_assistant.router)
app.include_router(avatar.router)
app.include_router(profile.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(feedback.router)
app.include_router(favorites.router)
# -------------------------------------------------
# Home API
# -------------------------------------------------

@app.get("/")
async def root():
    return {
        "title": "AI Food Management System",
        "subtitle": "Your Smart AI Food Ordering Assistant",
        "welcome_message": "Welcome to our AI-powered food ordering system!",
        "order_now": {
            "text": "Order Now",
            "next_page": "/register"
        }
    }


# -------------------------------------------------
# Database test
# -------------------------------------------------

@app.get("/database-test")
async def database_test():
    return {
        "message": "MongoDB Atlas connection is working",
        "database": "mainfood"
    }
