@echo off
echo Starting TruthGuard AI Server...
echo Please ensure Python is installed.
start http://localhost:8000
python -m http.server 8000
pause