@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Запускаю пiлюлi на http://localhost:8000 ...
start "" http://localhost:8000
python serve.py 8000
