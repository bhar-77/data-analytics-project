import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, dashboard, travel, predict, sql_explorer, datasets, assistant, reports

app = FastAPI(
    title="TravelLens AI Backend API",
    description="Intelligent Travel Search and Price Analytics System – Relational SQL Analytics, Random Forest Price Prediction & Gemini AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup for Vite frontend (localhost:3000) and universal local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(travel.router)
app.include_router(predict.router)
app.include_router(sql_explorer.router)
app.include_router(datasets.router)
app.include_router(assistant.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "title": "TravelLens AI – Intelligent Travel Search and Price Analytics System",
        "status": "Online",
        "documentation": "/docs",
        "database": "MySQL 8.x (travellens_db)",
        "ml_model": "Random Forest Regressor (Scikit-Learn)",
        "genai": "Google Gemini API"
    }

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "database_connected": True,
        "api_version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
