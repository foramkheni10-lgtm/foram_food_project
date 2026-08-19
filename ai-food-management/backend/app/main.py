# from contextlib import asynccontextmanager

# from fastapi import FastAPI

# from .database import (
#     check_database_connection,
#     close_database_connection,
# )


# # -------------------------------------------------
# # Application startup and shutdown
# # -------------------------------------------------

# @asynccontextmanager
# async def lifespan(app: FastAPI):

#     # Check MongoDB when server starts
#     await check_database_connection()

#     yield

#     # Close MongoDB when server stops
#     await close_database_connection()


# # -------------------------------------------------
# # Create FastAPI application
# # -------------------------------------------------

# app = FastAPI(
#     title="AI Food Management API",
#     description="Backend API for AI Food Management System",
#     version="1.0.0",
#     lifespan=lifespan,
# )


# # -------------------------------------------------
# # Home route
# # -------------------------------------------------

# @app.get("/")
# async def root():
#     return {
#         "message": "AI Food Management API is running"
#     }


# # -------------------------------------------------
# # Database test route
# # -------------------------------------------------

# @app.get("/database-test")
# async def database_test():
#     return {
#         "message": "MongoDB Atlas connection is working",
#         "database": "mainfood"
#     }

# from contextlib import asynccontextmanager
# from .registration import router as registration_router

# from fastapi import FastAPI

# from .database import (
#     check_database_connection,
#     close_database_connection,
# )


# # -------------------------------------------------
# # Application startup and shutdown
# # -------------------------------------------------

# @asynccontextmanager
# async def lifespan(app: FastAPI):

#     # Check MongoDB when server starts
#     await check_database_connection()

#     yield

#     # Close MongoDB when server stops
#     await close_database_connection()


# # -------------------------------------------------
# # Create FastAPI application
# # -------------------------------------------------

# app = FastAPI(
#     title="AI Food Management API",
#     description="Backend API for AI Food Management System",
#     version="1.0.0",
#     lifespan=lifespan,
# )


# # -------------------------------------------------
# # Home route
# # -------------------------------------------------

# @app.get("/")
# async def root():
#     return {
#         "title": "AI Food Management System",
#         "subtitle": "Your Smart AI Food Ordering Assistant",
#         "welcome_message": "Welcome to our AI-powered food ordering system!",
#         "order_now": {
#             "text": "Order Now",
#             "next_page": "/register"
#         }
#     }


# # -------------------------------------------------
# # Database test route
# # -------------------------------------------------

# @app.get("/database-test")
# async def database_test():
#     return {
#         "message": "MongoDB Atlas connection is working",
#         "database": "mainfood"
#     }

# from contextlib import asynccontextmanager

# from fastapi import FastAPI

# from .database import (
#     check_database_connection,
#     close_database_connection,
# )

# from .registration import router as registration_router


# # -------------------------------------------------
# # Application startup and shutdown
# # -------------------------------------------------

# @asynccontextmanager
# async def lifespan(app: FastAPI):

#     await check_database_connection()

#     yield

#     await close_database_connection()


# # -------------------------------------------------
# # Create FastAPI application
# # -------------------------------------------------

# app = FastAPI(
#     title="AI Food Management API",
#     description="Backend API for AI Food Management System",
#     version="1.0.0",
#     lifespan=lifespan,
# )


# # -------------------------------------------------
# # Registration routes
# # -------------------------------------------------

# app.include_router(registration_router)


# # -------------------------------------------------
# # Home route
# # -------------------------------------------------

# @app.get("/")
# async def root():
#     return {
#         "title": "AI Food Management System",
#         "subtitle": "Your Smart AI Food Ordering Assistant",
#         "welcome_message": "Welcome to our AI-powered food ordering system!",
#         "order_now": {
#             "text": "Order Now",
#             "next_page": "/register"
#         }
#     }


# # -------------------------------------------------
# # Database test route
# # -------------------------------------------------

# @app.get("/database-test")
# async def database_test():
#     return {
#         "message": "MongoDB Atlas connection is working",
#         "database": "mainfood"
#     }



# from contextlib import asynccontextmanager

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from .database import (
#     check_database_connection,
#     close_database_connection,
# )

# from .registration import router as registration_router


# # -------------------------------------------------
# # Application startup and shutdown
# # -------------------------------------------------

# @asynccontextmanager
# async def lifespan(app: FastAPI):

#     # Check MongoDB when server starts
#     await check_database_connection()

#     yield

#     # Close MongoDB when server stops
#     await close_database_connection()


# # -------------------------------------------------
# # Create FastAPI application
# # -------------------------------------------------

# app = FastAPI(
#     title="AI Food Management API",
#     description="Backend API for AI Food Management System",
#     version="1.0.0",
#     lifespan=lifespan,
# )


# # -------------------------------------------------
# # CORS Configuration
# # -------------------------------------------------

# app.add_middleware(
#     CORSMiddleware,

#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173",
#     ],

#     allow_credentials=True,

#     allow_methods=["*"],

#     allow_headers=["*"],
# )


# # -------------------------------------------------
# # Registration routes
# # -------------------------------------------------

# app.include_router(registration_router)


# # -------------------------------------------------
# # Home route
# # -------------------------------------------------

# @app.get("/")
# async def root():
#     return {
#         "title": "AI Food Management System",
#         "subtitle": "Your Smart AI Food Ordering Assistant",
#         "welcome_message": "Welcome to our AI-powered food ordering system!",
#         "order_now": {
#             "text": "Order Now",
#             "next_page": "/register"
#         }
#     }


# # -------------------------------------------------
# # Database test route
# # -------------------------------------------------

# @app.get("/database-test")
# async def database_test():
#     return {
#         "message": "MongoDB Atlas connection is working",
#         "database": "mainfood"
#     }


from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import (
    check_database_connection,
    close_database_connection,
)

from .registration import router as registration_router
from .login import router as login_router

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
# CORS
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
#login routes
# -------------------------------------------------

app.include_router(login_router)

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