from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="student")
    career_goal = Column(String)
    created_at = Column(DateTime, default=func.now())
    skills = relationship("Skill", back_populates="user")
    roadmaps = relationship("Roadmap", back_populates="user")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    proficiency = Column(Float, default=0.0)
    source = Column(String)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="skills")

class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    goal = Column(String)
    generated_path = Column(Text)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="roadmaps")