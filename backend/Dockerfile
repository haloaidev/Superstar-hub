FROM python:3.11-slim
WORKDIR /app

# install dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip && pip install -r /app/requirements.txt

COPY backend /app

ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["python", "run.py"]
