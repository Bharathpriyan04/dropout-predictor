import os
import uvicorn
import warnings

# Suppress sklearn and xgboost deserialization version warnings in logs
warnings.filterwarnings("ignore", category=UserWarning)

if __name__ == "__main__":
    # Render, Railway, and cloud platforms pass the listening port via PORT env var
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 [AEGIS Engine] Binding to 0.0.0.0:{port}...")
    uvicorn.run("backend.server:app", host="0.0.0.0", port=port, log_level="info")
