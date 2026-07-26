from flask import Flask, jsonify, request
from flask_cors import CORS
from .database import get_db, init_db, engine, SessionLocal
from .models import Channel, Listener, Base
import os


def create_app():
    app = Flask(__name__)
    CORS(app)

    # initialize DB (sqlite by default unless DATABASE_URL provided)
    init_db()

    @app.route('/api/health')
    def health():
        return jsonify({'status':'ok'})

    @app.route('/api/channels')
    def channels():
        session = SessionLocal()
        chans = session.query(Channel).all()
        out = []
        for c in chans:
            out.append({
                'id': c.id,
                'name': c.name,
                'type': c.type,
                'status': c.status,
                'listeners': c.listeners
            })
        session.close()
        return jsonify(out)

    @app.route('/api/stats')
    def stats():
        session = SessionLocal()
        listeners = session.query(Listener).count()
        session.close()
        return jsonify({'total_listeners': listeners, 'uptime':'0 days'})

    @app.route('/api/chat', methods=['GET','POST'])
    def chat():
        # lightweight demo: echo
        if request.method == 'POST':
            data = request.get_json() or {}
            return jsonify({'status':'ok','message':data.get('message','')})
        else:
            return jsonify([{'user':'Host_Alex','text':'Welcome to the demo chat'}])

    @app.route('/api/connect', methods=['POST'])
    def connect():
        data = request.get_json() or {}
        platform = data.get('platform')
        return jsonify({'status':'connected','platform':platform})

    return app
