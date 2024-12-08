from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone, timedelta, date
import json

from ..database import get_db
from ..models import Routine, RoutineInstance, TaskInstance, User
from ..schemas import (
    RoutineCreate, Routine as RoutineSchema,
    RoutineWithInstances, RoutineInstanceWithTasks,
    RoutineInstanceRead
)
from ..auth.utils import get_current_user
from .instance_generator import RoutineInstanceGenerator
from . import jobs
from ..utils.json_encoder import CustomJSONEncoder

router = APIRouter(prefix="/routines", tags=["Routines"])

@router.post("/", response_model=RoutineSchema, status_code=status.HTTP_201_CREATED)
async def create_routine(
    routine_data: RoutineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    routine_dict = json.loads(json.dumps(routine_data.dict(), cls=CustomJSONEncoder))
    routine_dict['user_id'] = current_user.id
    
    db_routine = Routine(**routine_dict)
    db.add(db_routine)
    db.commit()
    db.refresh(db_routine)
    return db_routine

@router.get("/", response_model=List[RoutineSchema])
async def get_routines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Routine).filter(Routine.user_id == current_user.id).all()

@router.get("/{routine_id}", response_model=RoutineWithInstances)
async def get_routine(
    routine_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    routine = db.query(Routine).filter(
        Routine.id == routine_id,
        Routine.user_id == current_user.id
    ).first()
    
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    return routine

@router.put("/{routine_id}", response_model=RoutineSchema)
async def update_routine(
    routine_id: UUID,
    routine_data: RoutineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_routine = db.query(Routine).filter(
        Routine.id == routine_id,
        Routine.user_id == current_user.id
    ).first()
    
    if not db_routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    
    update_data = json.loads(json.dumps(routine_data.dict(), cls=CustomJSONEncoder))
    for key, value in update_data.items():
        setattr(db_routine, key, value)
    
    db.commit()
    db.refresh(db_routine)
    return db_routine

@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_routine(
    routine_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    routine = db.query(Routine).filter(
        Routine.id == routine_id,
        Routine.user_id == current_user.id
    ).first()
    
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    
    db.delete(routine)
    db.commit()
    return None

@router.post("/generate-instances")
async def generate_instances(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate instances for a week"""
    generator = RoutineInstanceGenerator(db)
    stats = {
        'today': {'created': 0, 'skipped': 0},
        'week': {'created': 0, 'skipped': 0}
    }
    
    # Generate for today
    today = datetime.now().date()
    today_stats = generator.generate_instances_for_user(current_user.id, today)
    stats['today'] = today_stats
    
    # Generate for next 6 days
    for i in range(1, 7):
        next_day = today + timedelta(days=i)
        day_stats = generator.generate_instances_for_user(current_user.id, next_day)
        stats['week']['created'] += day_stats['created']
        stats['week']['skipped'] += day_stats['skipped']
    
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
            "week": {
                "start_date": (today + timedelta(days=1)).isoformat(),
                "end_date": (today + timedelta(days=6)).isoformat(),
                "instances_created": stats['week']['created'],
                "instances_skipped": stats['week']['skipped']
            }
        }
    }

@router.get("/instances/{date}", response_model=List[RoutineInstanceRead])
async def get_instances_for_date(
    date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_datetime = datetime.combine(date, datetime.min.time())
    next_datetime = datetime.combine(date + timedelta(days=1), datetime.min.time())

    instances = db.query(RoutineInstance).join(
        Routine
    ).options(
        selectinload(RoutineInstance.task_instances),
        selectinload(RoutineInstance.routine)
    ).filter(
        Routine.user_id == current_user.id,
        RoutineInstance.due_date >= target_datetime,
        RoutineInstance.due_date < next_datetime
    ).order_by(
        RoutineInstance.due_date
    ).all()
    
    return instances

@router.get("/instances/range/{start_date}/{end_date}", response_model=List[RoutineInstanceRead])
async def get_instances_for_date_range(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all routine instances within a date range"""
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date + timedelta(days=1), datetime.min.time())

    instances = db.query(RoutineInstance).join(
        Routine
    ).options(
        selectinload(RoutineInstance.task_instances),
        selectinload(RoutineInstance.routine)
    ).filter(
        Routine.user_id == current_user.id,
        RoutineInstance.due_date >= start_datetime,
        RoutineInstance.due_date < end_datetime
    ).order_by(
        RoutineInstance.due_date
    ).all()
    
    return instances

@router.put("/instances/{instance_id}/tasks/{task_id}")
async def update_task_instance(
    instance_id: UUID,
    task_id: str,
    progress: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a task instance's progress"""
    task_instance = db.query(TaskInstance).join(
        RoutineInstance
    ).filter(
        TaskInstance.routine_instance_id == instance_id,
        TaskInstance.task_id == task_id
    ).first()
    
    if not task_instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task instance not found"
        )
    
    task_instance.progress = progress
    if progress >= 100:
        task_instance.status = 'completed'
        task_instance.completion_date = datetime.now(timezone.utc)
    
    db.commit()
    return {"message": "Task instance updated successfully"}

@router.delete("/instances/future")
async def delete_future_instances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete future instances and pending tasks for today"""
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    # Get IDs of routine instances for today
    today_instance_ids = [
        id[0] for id in db.query(RoutineInstance.id).filter(
            RoutineInstance.due_date.between(today_start, today_end)
        ).all()
    ]

    # Delete pending tasks for today
    if today_instance_ids:
        today_pending = db.query(TaskInstance).filter(
            TaskInstance.routine_instance_id.in_(today_instance_ids),
            TaskInstance.status == 'pending'
        )
        pending_count = today_pending.count()
        today_pending.delete(synchronize_session=False)
    else:
        pending_count = 0

    # Delete future instances
    future_instances = db.query(RoutineInstance).filter(
        RoutineInstance.due_date > today_end
    )
    future_count = future_instances.count()
    
    # Delete associated task instances first
    if future_count > 0:
        future_instance_ids = [
            id[0] for id in future_instances.with_entities(RoutineInstance.id).all()
        ]
        db.query(TaskInstance).filter(
            TaskInstance.routine_instance_id.in_(future_instance_ids)
        ).delete(synchronize_session=False)
        
        # Then delete the instances
        future_instances.delete(synchronize_session=False)

    db.commit()

    return {
        "message": "Instances deleted successfully",
        "deleted": {
            "future_instances": future_count,
            "pending_tasks": pending_count
        }
    } 