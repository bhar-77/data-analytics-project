@echo off
title TravelLens AI - Startup Launcher
echo ======================================================================
echo TravelLens AI - Intelligent Travel Search and Price Analytics System
echo ======================================================================

echo [1/3] Ensuring MySQL database travellens_db is initialized...
call .\.venv\Scripts\python.exe backend\etl\pipeline.py

echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "TravelLens Backend (FastAPI)" .\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

echo [3/3] Starting React Vite Frontend on http://127.0.0.1:3000 ...
cd frontend
start "TravelLens Frontend (Vite)" npm run dev -- --host 127.0.0.1 --port 3000

echo.
echo Application Launched Successfully!
echo Frontend: http://127.0.0.1:3000
echo Backend API Docs: http://127.0.0.1:8000/docs
echo.
pause
