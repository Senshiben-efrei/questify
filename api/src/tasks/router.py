from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from ..database import get_db
from ..models import Task, TaskInstance, Area, Project
from ..schemas import TaskCreate, Task as TaskSchema, TaskInstance as TaskInstanceSchema
from ..auth.utils import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify that either project_id or area_id is provided, but not both
    if (task_data.project_id is None and task_data.area_id is None) or \
       (task_data.project_id is not None and task_data.area_id is not None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either project_id or area_id must be provided, but not both"
        )
    
    # Verify ownership
    if task_data.project_id:
        project = db.query(Project).join(Area).filter(
            Project.id == task_data.project_id,
            Area.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or doesn't belong to user"
            )
    else:
        area = db.query(Area).filter(
            Area.id == task_data.area_id,
            Area.user_id == current_user.id
        ).first()
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Area not found or doesn't belong to user"
            )
    
    # Create task
    db_task = Task(**task_data.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Create initial task instance if task is recurring
    if db_task.is_recurring:
        task_instance = TaskInstance(
            task_id=db_task.id,
            status="pending",
            due_date=datetime.now(timezone.utc)  # You might want to calculate this based on frequency
        )
        db.add(task_instance)
        db.commit()
    
    return db_task

@router.get("/", response_model=List[TaskSchema])
async def get_tasks(
    project_id: Optional[UUID] = None,
    area_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Base query: get tasks from projects/areas belonging to user
    query = db.query(Task)
    
    if project_id:
        # Filter by project and verify ownership
        query = query.join(Project).join(Area).filter(
            Task.project_id == project_id,
            Area.user_id == current_user.id
        )
    elif area_id:
        # Filter by area and verify ownership
        query = query.join(Area, Task.area_id == Area.id).filter(
            Task.area_id == area_id,
            Area.user_id == current_user.id
        )
    else:
        # Get all tasks belonging to user
        query = query.outerjoin(Project).outerjoin(Area).filter(Area.user_id == current_user.id)
    
    return query.all()

@router.get("/{task_id}", response_model=TaskSchema)
async def get_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    task = db.query(Task).outerjoin(Project).outerjoin(Area).filter(
        Task.id == task_id,
        Area.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task

@router.put("/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: UUID,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify task exists and belongs to user
    task = db.query(Task).outerjoin(Project).outerjoin(Area).filter(
        Task.id == task_id,
        Area.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Verify new project/area belongs to user if being updated
    if task_data.project_id:
        project = db.query(Project).join(Area).filter(
            Project.id == task_data.project_id,
            Area.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="New project not found or doesn't belong to user"
            )
    elif task_data.area_id:
        area = db.query(Area).filter(
            Area.id == task_data.area_id,
            Area.user_id == current_user.id
        ).first()
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="New area not found or doesn't belong to user"
            )
    
    # Update task
    for key, value in task_data.dict().items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    task = db.query(Task).outerjoin(Project).outerjoin(Area).filter(
        Task.id == task_id,
        Area.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    return None 

# Add these new endpoints for task instances
@router.post("/{task_id}/instances", response_model=TaskInstanceSchema)
async def create_task_instance(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify task exists and belongs to user
    task = db.query(Task).outerjoin(Project).outerjoin(Area).filter(
        Task.id == task_id,
        Area.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Create new task instance
    task_instance = TaskInstance(
        task_id=task.id,
        status="pending",
        due_date=datetime.now(timezone.utc)  # You might want to calculate this based on frequency
    )
    db.add(task_instance)
    db.commit()
    db.refresh(task_instance)
    return task_instance

@router.get("/{task_id}/instances", response_model=List[TaskInstanceSchema])
async def get_task_instances(
    task_id: UUID,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify task exists and belongs to user
    task = db.query(Task).outerjoin(Project).outerjoin(Area).filter(
        Task.id == task_id,
        Area.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Query task instances
    query = db.query(TaskInstance).filter(TaskInstance.task_id == task_id)
    if status:
        query = query.filter(TaskInstance.status == status)
    
    return query.all()

@router.put("/instances/{instance_id}", response_model=TaskInstanceSchema)
async def update_task_instance(
    instance_id: UUID,
    status: str,
    progress: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify instance exists and belongs to user's task
    instance = db.query(TaskInstance).join(Task).outerjoin(Project).outerjoin(Area).filter(
        TaskInstance.id == instance_id,
        Area.user_id == current_user.id
    ).first()
    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task instance not found"
        )
    
    # Update instance
    instance.status = status
    if progress is not None:
        instance.progress = progress
    if status == "completed":
        instance.completion_date = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(instance)
    return instance

@router.get("/instances/due", response_model=List[TaskInstanceSchema])
async def get_due_instances(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get all pending instances that are due
    now = datetime.now(timezone.utc)
    instances = db.query(TaskInstance).join(Task).outerjoin(Project).outerjoin(Area).filter(
        Area.user_id == current_user.id,
        TaskInstance.status == "pending",
        TaskInstance.due_date <= now
    ).all()
    return instances

@router.post("/instances/generate", status_code=status.HTTP_201_CREATED)
async def generate_recurring_instances(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate instances for recurring tasks that need them."""
    # Get all recurring tasks belonging to user
    tasks = db.query(Task).outerjoin(Project).outerjoin(Area).filter(
        Area.user_id == current_user.id,
        Task.is_recurring == True
    ).all()
    
    instances_created = 0
    now = datetime.now(timezone.utc)
    
    for task in tasks:
        # Check if task needs new instance
        latest_instance = db.query(TaskInstance).filter(
            TaskInstance.task_id == task.id
        ).order_by(TaskInstance.due_date.desc()).first()
        
        should_create = False
        if not latest_instance:
            should_create = True
        elif task.frequency == "daily" and latest_instance.due_date.date() < now.date():
            should_create = True
        elif task.frequency == "weekly" and (now - latest_instance.due_date).days >= 7:
            should_create = True
        
        if should_create:
            new_instance = TaskInstance(
                task_id=task.id,
                status="pending",
                due_date=now
            )
            db.add(new_instance)
            instances_created += 1
    
    db.commit()
    return {"message": f"Created {instances_created} new task instances"}