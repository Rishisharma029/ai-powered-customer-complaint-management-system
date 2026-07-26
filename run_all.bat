@echo off
echo =========================================================================
echo  Starting AIVOA Pharma QMS Customer Complaint AI System
echo =========================================================================

echo Starting FastAPI Backend Server on http://localhost:8000...
start cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo Starting React Frontend on http://localhost:5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo  - Frontend UI: http://localhost:5173
echo  - Backend API Docs: http://localhost:8000/docs
echo =========================================================================
