from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr

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

# Task schemas
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_recurring: bool = False
    frequency: Optional[str] = None

class TaskCreate(TaskBase):
    project_id: Optional[UUID] = None
    area_id: Optional[UUID] = None

class Task(TaskBase):
    id: UUID
    project_id: Optional[UUID]
    area_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Task Instance schemas
class TaskInstanceBase(BaseModel):
    status: str = "pending"
    progress: Optional[int] = 0
    due_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None

class TaskInstanceCreate(TaskInstanceBase):
    task_id: UUID

class TaskInstance(TaskInstanceBase):
    id: UUID
    task_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 