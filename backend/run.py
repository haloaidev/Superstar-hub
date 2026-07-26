from flask import Flask, jsonify, request, render_template, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'db.sqlite')

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Channel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='offline')
    listeners = db.Column(db.Integer, default=0)
    description = db.Column(db.Text, default='')

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    channel_key = db.Column(db.String(80), nullable=False, index=True)
    username = db.Column(db.String(80), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Platform(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    connected = db.Column(db.Boolean, default=False)

@app.before_first_request
def init_db():
    if not os.path.exists(DB_PATH):
        db.create_all()
        seed()

def seed():
    channels = [
        Channel(key='podcast1', name='Podcast Channel 1', type='podcast', status='live', listeners=127,
                description='Connect your first podcast channel here. Professional audio streaming with real-time chat interaction and listener analytics.'),
        Channel(key='podcast2', name='Podcast Channel 2', type='podcast', status='offline', listeners=0,
                description='Backup stream with automatic failover and synchronized broadcasting capabilities.'),
        Channel(key='youtube1', name='YouTube Channel', type='youtube', status='scheduled', listeners=0,
                description='Stream directly to YouTube with our professional integration.'),
        Channel(key='bigo1', name='Bigo Live', type='bigo', status='offline', listeners=0,
                description="Connect to Bigo Live for global reach.")
    ]
    for c in channels:
        db.session.add(c)
    platforms = [Platform(name='podcast'), Platform(name='youtube'), Platform(name='bigo')]
    for p in platforms:
        db.session.add(p)
    # sample messages
    db.session.add(Message(channel_key='podcast1', username='System', text='Welcome to Podcast Channel 1! Stream has started.'))
    db.session.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/channels', methods=['GET'])
def get_channels():
    channels = Channel.query.all()
    return jsonify([{
        'key': c.key,
        'name': c.name,
        'type': c.type,
        'status': c.status,
        'listeners': c.listeners,
        'description': c.description
    } for c in channels])

@app.route('/api/channel/<key>/connect', methods=['POST'])
def connect_channel(key):
    c = Channel.query.filter_by(key=key).first_or_404()
    c.status = 'live'
    # simulate some listeners
    c.listeners = max(1, c.listeners if c.listeners > 0 else random.randint(20, 150))
    db.session.commit()
    return jsonify({'ok': True, 'channel': c.key, 'status': c.status, 'listeners': c.listeners})

@app.route('/api/channel/<key>/test', methods=['POST'])
def test_channel(key):
    # simple endpoint to say audio test ok
    return jsonify({'ok': True, 'channel': key, 'result': 'audio_ok'})

@app.route('/api/platform/connect', methods=['POST'])
def connect_platform():
    data = request.json or {}
    name = data.get('platform')
    if not name:
        return jsonify({'ok': False, 'error': 'missing platform name'}), 400
    p = Platform.query.filter_by(name=name).first()
    if not p:
        p = Platform(name=name, connected=True)
        db.session.add(p)
    else:
        p.connected = True
    db.session.commit()
    return jsonify({'ok': True, 'platform': name})

@app.route('/api/chat', methods=['GET','POST'])
def chat():
    if request.method == 'GET':
        channel = request.args.get('channel', 'podcast1')
        msgs = Message.query.filter_by(channel_key=channel).order_by(Message.timestamp.asc()).all()
        return jsonify([{
            'username': m.username,
            'text': m.text,
            'timestamp': m.timestamp.isoformat()
        } for m in msgs])
    else:
        data = request.json or {}
        channel = data.get('channel')
        username = data.get('username', 'Viewer')
        text = data.get('text')
        if not channel or not text:
            return jsonify({'ok': False, 'error': 'missing fields'}), 400
        msg = Message(channel_key=channel, username=username, text=text)
        db.session.add(msg)
        db.session.commit()
        return jsonify({'ok': True, 'message': {
            'username': username,
            'text': text,
            'timestamp': msg.timestamp.isoformat()
        }})

@app.route('/api/stats', methods=['GET'])
def stats():
    # simple aggregated stats
    total_listeners = sum([c.listeners for c in Channel.query.all()])
    total_streams = Channel.query.filter(Channel.status=='live').count()
    return jsonify({'total_listeners': total_listeners, 'total_streams': total_streams})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=True)
