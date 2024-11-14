from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import SessionLocal
from .instance_generator import TaskInstanceGenerator
from ..models import User

async def generate_daily_instances(_: int = None):
    """Generate instances for all users at 6 PM"""
    db = SessionLocal()
    try:
        # Get all users
        users = db.query(User).all()
        
        # Generate tomorrow's instances
        target_date = datetime.now().date() + timedelta(days=1)
        
        for user in users:
            generator = TaskInstanceGenerator(db)
            generator.generate_instances_for_user(user.id, target_date)
            
    finally:
        db.close()

def schedule_instance_generation(background_tasks: BackgroundTasks):
    """Schedule instance generation for the next 6 PM"""
    now = datetime.now()
    target_time = now.replace(hour=18, minute=0, second=0, microsecond=0)
    
    if now >= target_time:
        target_time += timedelta(days=1)
    
    delay = (target_time - now).total_seconds()
    background_tasks.add_task(generate_daily_instances, delay) 