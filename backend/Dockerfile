FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Create directories for data persistence
RUN mkdir -p app/data

EXPOSE 8000

# Use production-ready command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
