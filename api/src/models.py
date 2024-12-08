import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text, Float, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    areas = relationship("Area", back_populates="user", cascade="all, delete-orphan")
    routines = relationship("Routine", back_populates="user", cascade="all, delete-orphan")

class Area(Base):
    __tablename__ = "areas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    xp = Column(Integer, default=0)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="areas")
    projects = relationship("Project", back_populates="area", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    area_id = Column(UUID(as_uuid=True), ForeignKey('areas.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    area = relationship("Area", back_populates="projects")

class EvaluationMethod(str, enum.Enum):
    YES_NO = "YES_NO"
    NUMERIC = "NUMERIC"

class Routine(Base):
    __tablename__ = "routines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Scheduling
    is_recurring = Column(Boolean, default=False)
    frequency = Column(String(50))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    # Queue for tasks
    queue = Column(JSONB, nullable=False, default={
        "iterations": [],
        "rotation_type": "sequential"
    })
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    instances = relationship("RoutineInstance", back_populates="routine", cascade="all, delete-orphan")
    user = relationship("User", back_populates="routines")

class RoutineInstance(Base):
    __tablename__ = "routine_instances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    routine_id = Column(UUID(as_uuid=True), ForeignKey('routines.id', ondelete='CASCADE'), nullable=False)
    iteration_position = Column(Integer, default=0)
    due_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    routine = relationship("Routine", back_populates="instances")
    task_instances = relationship("TaskInstance", back_populates="routine_instance", cascade="all, delete-orphan")

    @property
    def routine_name(self) -> str:
        """Get the name of the associated routine"""
        return self.routine.name if self.routine else "Unknown Routine"

class TaskInstance(Base):
    __tablename__ = "task_instances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    routine_instance_id = Column(UUID(as_uuid=True), ForeignKey('routine_instances.id', ondelete='CASCADE'), nullable=False)
    task_id = Column(String(100), nullable=False)  # References the task ID in the routine's queue
    name = Column(String(100), nullable=False)
    status = Column(String(20), default='pending')
    progress = Column(Integer, default=0)
    evaluation_method = Column(SQLEnum(EvaluationMethod), nullable=False)
    target_value = Column(Float)
    execution_time = Column(String(5))  # HH:MM format
    duration = Column(Integer)  # in minutes
    completion_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    routine_instance = relationship("RoutineInstance", back_populates="task_instances")