#!/bin/bash
cd backend && pip install -r requirements.txt -q
python importer.py
uvicorn main:app --host 0.0.0.0 --port 8000 &
cd ../ && npm install -q && npm run build
echo "✅ Open: http://localhost:3000"
