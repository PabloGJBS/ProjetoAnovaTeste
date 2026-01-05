from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.session import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    document = Column(String(20), nullable=False, unique=True, index=True)
    email = Column(String(120), nullable=True, unique=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    allocations = relationship("Allocation", back_populates="client", cascade="all, delete-orphan")


class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)

    title_id = Column(String(64), nullable=False, index=True)
    amount = Column(Float, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    client = relationship("Client", back_populates="allocations")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False, unique=True, index=True)
    password_hash = Column(String(128), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
