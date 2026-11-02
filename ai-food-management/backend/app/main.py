
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
