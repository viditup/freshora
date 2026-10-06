@echo off
cd /d "%~dp0backend"
if not exist venv python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
rem Creates .env if missing and replaces a weak JWT_SECRET with a random one (backend refuses to start otherwise).
python setup_env.py --secret-only
if errorlevel 1 (
  echo Could not prepare backend\.env
  pause
  exit /b 1
)
echo Starting API on http://localhost:8000  (docs: /docs)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
