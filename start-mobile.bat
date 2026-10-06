@echo off
cd /d "%~dp0mobile"
if not exist node_modules (
  call npm install
  call npx expo install --fix
)
echo Reminder: set HOST in src\config.js (10.0.2.2 for emulator, your PC IPv4 for a real phone)
call npx expo start
