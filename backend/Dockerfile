FROM python:3.11-slim
WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y --no-install-recommends build-essential gcc && rm -rf /var/lib/apt/lists/*

# copy requirements first for caching
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r /app/backend/requirements.txt

# copy app
COPY backend /app/backend
WORKDIR /app/backend

ENV PORT=8080
EXPOSE 8080

CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:8080", "--workers", "2"]
