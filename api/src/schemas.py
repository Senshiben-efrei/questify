from datetime import datetime
from typing import Optional, List, Dict, Union, Literal
from uuid import UUID
from pydantic import BaseModel, EmailStr, UUID4, validator, Field
from enum import Enum

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Area schemas
class AreaBase(BaseModel):
    name: str
    description: Optional[str] = None

class AreaCreate(AreaBase):
    pass

class Area(AreaBase):
    id: UUID
    xp: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    area_id: UUID

class Project(ProjectBase):
    id: UUID
    area_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Enums
class EvaluationMethod(str, Enum):
    YES_NO = "YES_NO"
    NUMERIC = "NUMERIC"

class QueueItemType(str, Enum):
    TASK = "TASK"
    COOLDOWN = "COOLDOWN"

class TaskDifficulty(str, Enum):
    TRIVIAL = 'TRIVIAL'
    EASY = 'EASY'
    MEDIUM = 'MEDIUM'
    HARD = 'HARD'

# Task Definition Schemas
class TaskDefinitionBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class TaskDefinition(TaskDefinitionBase):
    type: Literal["TASK"]
    evaluation_method: EvaluationMethod
    target_value: Optional[float] = None
    has_specific_time: bool = False
    execution_time: Optional[str] = None  # HH:MM format
    duration: Optional[int] = None  # minutes
    area_id: Optional[UUID4] = None
    project_id: Optional[UUID4] = None
    difficulty: TaskDifficulty = TaskDifficulty.MEDIUM

    @validator('target_value')
    def validate_target_value(cls, v, values):
        if values.get('evaluation_method') == EvaluationMethod.NUMERIC and v is None:
            raise ValueError('Target value is required for numeric evaluation')
        return v

    @validator('execution_time', 'duration')
    def validate_time_fields(cls, v, values):
        if values.get('has_specific_time'):
            if v is None:
                raise ValueError('Execution time and duration are required when has_specific_time is true')
        return v

class CooldownDefinition(TaskDefinitionBase):
    type: Literal["COOLDOWN"]
    duration: str  # e.g., "1d", "2h"
    description: str

# Queue Structure Schemas
class QueueIteration(BaseModel):
    id: str
    position: int
    items: List[Union[TaskDefinition, CooldownDefinition]]

class Queue(BaseModel):
    iterations: List[QueueIteration]
    rotation_type: Literal["sequential"] = "sequential"

# Routine Schemas
class RoutineBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_recurring: bool = False
    frequency: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class RoutineCreate(RoutineBase):
    queue: Queue

    @validator('end_date')
    def validate_dates(cls, v, values):
        if v and values.get('start_date'):
            if v < values['start_date']:
                raise ValueError('End date must be after start date')
        return v

    @validator('frequency')
    def validate_frequency(cls, v, values):
        if values.get('is_recurring') and not v:
            raise ValueError('Frequency is required for recurring routines')
        if v and v not in ['daily', 'weekly', 'monthly']:
            raise ValueError('Invalid frequency value')
        return v

class Routine(RoutineBase):
    id: UUID4
    queue: Queue
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Instance Schemas
class RoutineInstance(BaseModel):
    id: UUID4
    routine_id: UUID4
    iteration_position: int
    due_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskInstance(BaseModel):
    id: UUID4
    routine_instance_id: UUID4
    task_id: str
    name: str
    status: str
    progress: int
    evaluation_method: EvaluationMethod
    target_value: Optional[float]
    execution_time: Optional[str]
    duration: Optional[int]
    completion_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    difficulty: TaskDifficulty

    class Config:
        from_attributes = True

# Response Models
class RoutineWithInstances(Routine):
    instances: List[RoutineInstance] = []
    task_instances: List[TaskInstance] = []

class RoutineInstanceWithTasks(RoutineInstance):
    tasks: List[TaskInstance] = []

# Add these new schemas for displaying instances
class TaskInstanceRead(BaseModel):
    id: UUID
    task_id: str
    name: str
    status: str
    progress: int
    evaluation_method: EvaluationMethod
    target_value: Optional[float] = None
    execution_time: Optional[str] = None
    duration: Optional[int] = None
    completion_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoutineInstanceRead(BaseModel):
    id: UUID
    routine_id: UUID
    routine_name: str = Field(alias='routine_name')
    iteration_position: int
    due_date: datetime
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskInstanceRead] = Field(alias='task_instances')

    class Config:
        from_attributes = True
        populate_by_name = True 