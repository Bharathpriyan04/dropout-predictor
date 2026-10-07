FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and assets
COPY . .

# Expose ports (Render uses $PORT, defaults to 8000 or 10000)
EXPOSE 8000
EXPOSE 10000

# Start unified web application with dynamic port detection
CMD ["python", "run_server.py"]
