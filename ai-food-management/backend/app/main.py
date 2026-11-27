
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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
from app.routes.customer import payu
from app.routes.restaurant import feedback as restaurant_feedback

from app.routes import business_recommendations

# Admin routers
from app.routes.admin import dashboard as admin_dashboard
from app.routes.admin import orders as admin_orders
from app.routes.admin import admin as admin_router
from app.routes.admin import ai as admin_ai
from app.routes.admin import deliveries as admin_deliveries
from app.routes.admin import feedback as admin_feedback
from app.routes.admin import foods as admin_foods
from app.routes.admin import ingredients as admin_ingredients
from app.routes.admin import inventory as admin_inventory
from app.routes.admin import kitchen as admin_kitchen
from app.routes.admin import users as admin_users

# Restaurant Side routers
from app.routes.restaurant import restaurant as restaurant_side
from app.routes.restaurant import food as restaurant_food
from app.routes.restaurant import ai as restaurant_ai

# Additional Inventory Module routers
from app.routes import ingredient_routes
from app.routes import inventory_routes
from app.routes import inventory_transaction_routes
from app.routes import kitchen_routes
from app.routes import purchase_order_routes
from app.routes import supplier_routes
from app.routes import ai_routes
# from app.routes.admin import feedback as admin_feedback
from app.routes import notifications


# Application startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    await check_database_connection()
    yield
    await close_database_connection()


# Create FastAPI application
app = FastAPI(
    title="AI Food Management API",
    description="Backend API for Smart FoodCourt",
    version="1.0.0",
    lifespan=lifespan,
)


# Static files
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=str(STATIC_DIR)),
    name="static",
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://foram-food-project-74xf.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register common routers
app.include_router(registration_router)
app.include_router(notifications.router)
app.include_router(login_router)
app.include_router(admin_feedback.router)

# Register Customer routers
app.include_router(restaurant.router)
app.include_router(food.router)
app.include_router(ai_assistant.router)
app.include_router(avatar.router)
app.include_router(profile.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(feedback.router)
app.include_router(favorites.router)
app.include_router(payu.router)
app.include_router(business_recommendations.router)


# Register Admin routers
app.include_router(admin_orders.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_router.router)
app.include_router(admin_ai.router)
app.include_router(admin_deliveries.router)
# app.include_router(admin_feedback.router)
app.include_router(admin_foods.router)
app.include_router(admin_ingredients.router)
app.include_router(admin_inventory.router)
app.include_router(admin_kitchen.router)
app.include_router(admin_users.router)


# Register Restaurant Side routers
app.include_router(restaurant_side.router)
app.include_router(restaurant_food.router)
app.include_router(restaurant_ai.router)



app.include_router(restaurant_feedback.router)


# Additional Inventory Module APIs
app.include_router(ingredient_routes.router)
app.include_router(inventory_routes.router)
app.include_router(inventory_transaction_routes.router)
app.include_router(kitchen_routes.router)
app.include_router(purchase_order_routes.router)
app.include_router(supplier_routes.router)
app.include_router(ai_routes.router)
# Home API
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


# Database test
@app.get("/database-test")
async def database_test():
    return {
        "message": "MongoDB Atlas connection is working",
        "database": "mainfood"
    }
