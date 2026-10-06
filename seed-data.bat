@echo off
cd /d "%~dp0backend"
call venv\Scripts\activate
echo WARNING: this RESETS categories, products, banners, carts, addresses and orders (demo data).
pause
python -m seed.seed_data
pause
