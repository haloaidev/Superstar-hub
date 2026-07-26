# Superstar Broadcast Hub

This repository contains a lightweight scaffold of the Superstar Broadcast Hub UI (static) and a Flask backend API.

What's included:
- Frontend: Next.js app that serves a static Broadcast UI at /broadcast-ui.html (public).
- Backend: Flask app (backend/) exposing small demo API endpoints (/api/channels, /api/chat, /api/stats, /api/connect).
- Dockerfiles for both frontend and backend and a render.yaml to deploy both services on Render using Docker.

Quick start (local):

1) Frontend
   - cd to repo root
   - npm install
   - npm run dev

2) Backend
   - cd backend
   - python -m venv .venv
   - source .venv/bin/activate
   - pip install -r requirements.txt
   - python run.py

Environment & deployment
- The backend reads DATABASE_URL (Postgres or SQLite) — default is sqlite:///./superstar.db
- Use render.yaml to create two services in Render (frontend + backend). The frontend Dockerfile will build the Next.js app; backend Dockerfile will run Flask.

Next steps
- Convert the static UI into React components (the public/broadcast-ui.html is a starting point).
- Implement real-time chat (WebSocket: Socket.IO or WebSocket) and real streaming integrations (RTMP proxy/transcoder).
- Add authentication, migrations, and tests.

