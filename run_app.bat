@echo off
echo =======================================================================
echo   AEGIS RETENTION INTELLIGENCE — STARTUP SCRIPT
echo   Student Dropout Risk Prediction & Retention Platform
echo =======================================================================
echo.

echo [1/3] Checking dependencies...
pip install -r requirements.txt

echo.
echo [2/3] Checking model bundle...
if not exist "models\dropout_model_bundle_advanced.pkl" (
    echo Model bundle not found. Training advanced multi-model ensemble...
    python train_advanced_models.py
)

echo.
echo [3/3] Launching Unified Web Application on http://127.0.0.1:8000 ...
start http://127.0.0.1:8000
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000
