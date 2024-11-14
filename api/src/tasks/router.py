from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone, timedelta, date

from ..database import get_db
from ..models import Task, TaskInstance, Area, Project, TaskType
from ..schemas import (
    SubTaskCreate, PlaceholderTaskCreate, StandaloneTaskCreate,
    Task as TaskSchema, TaskInstance as TaskInstanceSchema
)
from ..auth.utils import get_current_user
from .instance_generator import TaskInstanceGenerator
from . import jobs

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/standalone/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
async def create_standalone_task(
    task_data: StandaloneTaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify project/area ownership
    if task_data.project_id and task_data.area_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task cannot be linked to both project and area"
        )

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
    elif task_data.area_id:
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
    db_task = Task(
        **task_data.dict(),
        task_type=TaskType.STANDALONE
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.post("/placeholder/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
async def create_placeholder_task(
    task_data: PlaceholderTaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Convert task data to dict
    task_dict = task_data.dict()
    
    # Extract queue data
    queue_data = task_dict.pop('queue', None)
    
    # Create placeholder task
    db_task = Task(
        **task_dict,
        task_type=TaskType.PLACEHOLDER,
        queue=queue_data if queue_data else {"items": [], "current_position": 0, "rotation_type": "sequential"}
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.post("/sub-task/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
async def create_sub_task(
    task_data: SubTaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify project/area ownership if provided
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
    elif task_data.area_id:
        area = db.query(Area).filter(
            Area.id == task_data.area_id,
            Area.user_id == current_user.id
        ).first()
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Area not found or doesn't belong to user"
            )

    # Create sub-task
    db_task = Task(
        **task_data.dict(),
        task_type=TaskType.SUB_TASK
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/placeholder/{task_id}/queue", response_model=TaskSchema)
async def update_placeholder_queue(
    task_id: UUID,
    sub_task_ids: List[UUID],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify placeholder task exists
    placeholder_task = db.query(Task).filter(
        Task.id == task_id,
        Task.task_type == TaskType.PLACEHOLDER
    ).first()
    
    if not placeholder_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Placeholder task not found"
        )

    # Verify all sub-tasks exist
    sub_tasks = db.query(Task).filter(
        Task.id.in_(sub_task_ids),
        Task.task_type == TaskType.SUB_TASK
    ).all()

    if len(sub_tasks) != len(sub_task_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more sub-tasks not found"
        )

    # Update queue
    queue = {
        "sub_tasks": [
            {
                "id": str(task_id),
                "position": idx,
                "completed": False
            }
            for idx, task_id in enumerate(sub_task_ids)
        ],
        "current_position": 0,
        "rotation_type": "sequential"
    }
    
    placeholder_task.queue = queue
    db.commit()
    db.refresh(placeholder_task)
    
    return placeholder_task

# Keep existing endpoints but update them to handle task types
@router.get("/", response_model=List[TaskSchema])
async def get_tasks(
    project_id: Optional[UUID] = None,
    area_id: Optional[UUID] = None,
    task_type: Optional[TaskType] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Base query with user ownership check
    query = db.query(Task).outerjoin(
        Project,
        Task.project_id == Project.id
    ).outerjoin(
        Area,
        or_(
            Task.area_id == Area.id,  # Direct area link
            and_(  # Area through project
                Task.project_id == Project.id,
                Project.area_id == Area.id
            )
        )
    ).filter(
        or_(
            Area.user_id == current_user.id,
            and_(  # Handle tasks without area or project
                Task.area_id.is_(None),
                Task.project_id.is_(None)
            )
        )
    )

    # Apply filters
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if area_id:
        query = query.filter(Task.area_id == area_id)
    if task_type:
        query = query.filter(Task.task_type == task_type)
    
    return query.all()

@router.put("/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: UUID,
    task_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify task exists and belongs to user
    task = db.query(Task).outerjoin(
        Project,
        Task.project_id == Project.id
    ).outerjoin(
        Area,
        or_(
            Task.area_id == Area.id,  # Direct area link
            and_(  # Area through project
                Task.project_id == Project.id,
                Project.area_id == Area.id
            )
        )
    ).filter(
        Task.id == task_id,
        or_(
            Area.user_id == current_user.id,
            and_(  # Handle tasks without area or project
                Task.area_id.is_(None),
                Task.project_id.is_(None)
            )
        )
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Verify project/area ownership if provided
    if task_data.get('project_id'):
        project = db.query(Project).join(Area).filter(
            Project.id == task_data['project_id'],
            Area.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or doesn't belong to user"
            )
    elif task_data.get('area_id'):
        area = db.query(Area).filter(
            Area.id == task_data['area_id'],
            Area.user_id == current_user.id
        ).first()
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Area not found or doesn't belong to user"
            )

    # Cannot change task type after creation
    if 'task_type' in task_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task type cannot be changed after creation"
        )

    # Handle task type-specific updates
    if task.task_type == TaskType.SUB_TASK:
        # Sub-tasks can't have timing fields
        task_data.pop('execution_time', None)
        task_data.pop('start_date', None)
        task_data.pop('end_date', None)
        # Sub-tasks can't be recurring
        task_data['is_recurring'] = False
        task_data['frequency'] = None
    elif task.task_type == TaskType.PLACEHOLDER:
        # Placeholder tasks can't have evaluation or relations
        task_data.pop('evaluation_method', None)
        task_data.pop('target_value', None)
        task_data.pop('project_id', None)
        task_data.pop('area_id', None)
    # STANDALONE tasks can have all fields

    # Handle queue update for placeholder tasks
    if task.task_type == TaskType.PLACEHOLDER and 'queue' in task_data:
        queue_data = task_data.pop('queue')
        # Just store the queue definition without validation
        task.queue = queue_data

    # Update task fields
    for key, value in task_data.items():
        if hasattr(task, key):
            setattr(task, key, value)

    try:
        db.commit()
        db.refresh(task)
        return task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify task exists and belongs to user
    task = db.query(Task).outerjoin(
        Project,
        Task.project_id == Project.id
    ).outerjoin(
        Area,
        or_(
            Task.area_id == Area.id,  # Direct area link
            and_(  # Area through project
                Task.project_id == Project.id,
                Project.area_id == Area.id
            )
        )
    ).filter(
        Task.id == task_id,
        or_(
            Area.user_id == current_user.id,
            and_(  # Handle tasks without area or project
                Task.area_id.is_(None),
                Task.project_id.is_(None)
            )
        )
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    try:
        db.delete(task)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/generate-instances")
async def generate_instances(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate instances for today and tomorrow"""
    generator = TaskInstanceGenerator(db)
    stats = {
        'today': {'created': 0, 'skipped': 0},
        'tomorrow': {'created': 0, 'skipped': 0}
    }
    
    # Generate for today
    today = datetime.now().date()
    today_stats = generator.generate_instances_for_user(current_user.id, today)
    stats['today'] = today_stats
    
    # Generate for tomorrow
    tomorrow = today + timedelta(days=1)
    tomorrow_stats = generator.generate_instances_for_user(current_user.id, tomorrow)
    stats['tomorrow'] = tomorrow_stats
    
    # Schedule next automatic generation
    jobs.schedule_instance_generation(background_tasks)
    
    return {
        "message": "Instances generated successfully",
        "statistics": {
            "today": {
                "date": today.isoformat(),
                "instances_created": stats['today']['created'],
                "instances_skipped": stats['today']['skipped']
            },
            "tomorrow": {
                "date": tomorrow.isoformat(),
                "instances_created": stats['tomorrow']['created'],
                "instances_skipped": stats['tomorrow']['skipped']
            },
            "total_created": stats['today']['created'] + stats['tomorrow']['created'],
            "total_skipped": stats['today']['skipped'] + stats['tomorrow']['skipped']
        }
    }

@router.get("/instances/{date}", response_model=List[TaskInstanceSchema])
async def get_instances_for_date(
    date: date,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all task instances for a specific date"""
    instances = db.query(TaskInstance).join(Task).outerjoin(
        Project, Task.project_id == Project.id
    ).outerjoin(
        Area, 
        or_(
            Task.area_id == Area.id,
            Project.area_id == Area.id
        )
    ).filter(
        TaskInstance.due_date == date,
        or_(
            Area.user_id == current_user.id,
            and_(  # Handle tasks without area or project
                Task.area_id.is_(None),
                Task.project_id.is_(None)
            )
        )
    ).all()
    
    return instances

@router.get("/instances/range/{start_date}/{end_date}", response_model=List[TaskInstanceSchema])
async def get_instances_for_date_range(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all task instances within a date range"""
    instances = db.query(TaskInstance).join(Task).outerjoin(
        Project, Task.project_id == Project.id
    ).outerjoin(
        Area, 
        or_(
            Task.area_id == Area.id,
            Project.area_id == Area.id
        )
    ).filter(
        TaskInstance.due_date >= start_date,
        TaskInstance.due_date <= end_date,
        Area.user_id == current_user.id
    ).all()
    
    return instances

@router.delete("/instances/clear")
async def clear_instances(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Clear all instances for the current user"""
    # Get all task instances for user's tasks
    instances = db.query(TaskInstance).join(Task).outerjoin(
        Project, Task.project_id == Project.id
    ).outerjoin(
        Area, 
        or_(
            Task.area_id == Area.id,
            Project.area_id == Area.id
        )
    ).filter(
        or_(
            Area.user_id == current_user.id,
            and_(  # Handle tasks without area or project
                Task.area_id.is_(None),
                Task.project_id.is_(None)
            )
        )
    ).all()

    # Delete all instances
    for instance in instances:
        db.delete(instance)
    
    db.commit()
    
    return {"message": "All instances cleared successfully"}

@router.delete("/instances/{instance_id}")
async def delete_instance(
    instance_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a specific task instance"""
    # Get the instance and verify ownership
    instance = db.query(TaskInstance).join(Task).outerjoin(
        Project, Task.project_id == Project.id
    ).outerjoin(
        Area, 
        or_(
            Task.area_id == Area.id,
            Project.area_id == Area.id
        )
    ).filter(
        TaskInstance.id == instance_id,
        or_(
            Area.user_id == current_user.id,
            and_(  # Handle tasks without area or project
                Task.area_id.is_(None),
                Task.project_id.is_(None)
            )
        )
    ).first()

    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instance not found"
        )

    # Delete the instance
    db.delete(instance)
    db.commit()
    
    return {"message": "Instance deleted successfully"}