from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .auth.router import router as auth_router
from .areas.router import router as areas_router
from .projects.router import router as projects_router
from .tasks.router import router as tasks_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RPG Life API",
    description="API for RPG Life - A Gamified Self-Improvement App",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React client
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(areas_router)
app.include_router(projects_router)
app.include_router(tasks_router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to RPG Life API",
        "docs": "/docs",  # Swagger UI
        "redoc": "/redoc"  # ReDoc UI
    } 