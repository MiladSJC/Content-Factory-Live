@echo off
:: ==========================================
:: UNIFIED DEMO PORTAL LAUNCHER
:: Starts Main Dashboard (Includes All AI)
:: ==========================================

echo ========================================
echo 1. Starting Unified Backend (Port 5001)...
echo ========================================

:: Navigate to the main folder
cd /d "C:\Users\milad.moradi\Desktop\Demo Portal\ReactVideo\api"

:: Start app.py (which now holds all the server logic)
:: We use cmd /k to keep the window open so you can see if python crashes
start "Unified Backend" cmd /k "python app.py"

:: Wait for Python to load
timeout /t 3 >nul

echo ========================================
echo 2. Starting Frontend (Vite Port 5173)...
echo ========================================

:: Navigate to the React folder
cd "ReactVideo"

:: Start the React dev server
start "Unified Frontend" npm run dev

:: Wait for Vite to bundle
timeout /t 5 >nul

echo ========================================
echo 3. Launching Chrome...
echo ========================================

start chrome http://localhost:5173

exit