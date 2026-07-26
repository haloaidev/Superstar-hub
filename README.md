# Superstar Broadcast Hub

This commit adds a Flask backend (backend/run.py), a Dockerfile (backend/Dockerfile), requirements and an updated UI (templates/index.html) wired to a small API.

How it works:
- The Flask app serves the UI and exposes simple REST endpoints under /api
  - GET /api/channels
  - POST /api/channel/<key>/connect
  - POST /api/channel/<key>/test
  - GET/POST /api/chat
  - POST /api/platform/connect

Run locally:

1) python -m venv .venv
2) source .venv/bin/activate
3) pip install -r backend/requirements.txt
4) python backend/run.py

Docker / Render:
- The backend/Dockerfile builds an image that runs gunicorn on port 8080.
- You can point Render to that Dockerfile and deploy the service.
