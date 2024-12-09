from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .auth.router import router as auth_router
from .areas.router import router as areas_router
from .projects.router import router as projects_router
from .routines.router import router as routines_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Questify API",
    description="API for Questify - A Gamified Self-Improvement App",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(areas_router)
app.include_router(projects_router)
app.include_router(routines_router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Questify API",
        "docs": "/docs",  # Swagger UI
        "redoc": "/redoc"  # ReDoc UI
    } 