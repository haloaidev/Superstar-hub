from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

class Channel(Base):
    __tablename__ = 'channels'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    type = Column(String, default='podcast')
    status = Column(String, default='offline')
    listeners = Column(Integer, default=0)

class Listener(Base):
    __tablename__ = 'listeners'
    id = Column(Integer, primary_key=True)
    username = Column(String)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
