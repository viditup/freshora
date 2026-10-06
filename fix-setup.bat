@echo off
rem Fixes: weak JWT_SECRET (backend will not start), PUBLIC_BASE_URL and mobile HOST (login "Network error", images).
rem Usage: double-click, or  fix-setup.bat 192.168.1.23  to force an IP.
cd /d "%~dp0backend"
if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat)
python setup_env.py %*
echo.
pause
