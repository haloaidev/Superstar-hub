from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///./superstar.db'

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith('sqlite') else {})
SessionLocal = sessionmaker(bind=engine)

from .models import Base

def init_db():
    # create tables
    Base.metadata.create_all(bind=engine)
