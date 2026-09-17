@echo off
cd backend
pip install -r requirements.txt -q
python importer.py          REM Only runs if DB doesn't exist yet
start /B uvicorn main:app --host 0.0.0.0 --port 8000
cd ../
npm install -q
npm run build
echo.
echo ✅ App is running! Open your browser:
echo    http://localhost:3000
pause
