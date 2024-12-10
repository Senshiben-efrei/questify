FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create src directory and copy files
RUN mkdir -p /app/src
COPY src/ /app/src/

# Copy any other necessary files
COPY *.py .

# Create logs directory
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Command to run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"] 