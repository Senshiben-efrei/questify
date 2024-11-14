from datetime import datetime, timedelta
from typing import List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..models import Task, TaskInstance, TaskType, Project, Area
from ..database import get_db

class TaskInstanceGenerator:
    def __init__(self, db: Session):
        self.db = db

    def generate_instances_for_user(self, user_id: str, target_date: datetime) -> dict:
        """Generate instances for a specific user and date"""
        stats = {'created': 0, 'skipped': 0}
        
        # Get all recurring standalone tasks for user
        standalone_tasks = self.db.query(Task).outerjoin(
            Project, Task.project_id == Project.id
        ).outerjoin(
            Area, 
            or_(
                Task.area_id == Area.id,
                Project.area_id == Area.id
            )
        ).filter(
            Task.task_type == TaskType.STANDALONE,
            Task.is_recurring == True,
            or_(
                Area.user_id == user_id,
                and_(  # Handle tasks without area or project
                    Task.area_id.is_(None),
                    Task.project_id.is_(None)
                )
            )
        ).all()

        # Get all placeholder tasks for user
        placeholder_tasks = self.db.query(Task).outerjoin(
            Project, Task.project_id == Project.id
        ).outerjoin(
            Area, 
            or_(
                Task.area_id == Area.id,
                Project.area_id == Area.id
            )
        ).filter(
            Task.task_type == TaskType.PLACEHOLDER,
            Task.is_recurring == True,
            or_(
                Area.user_id == user_id,
                and_(  # Handle tasks without area or project
                    Task.area_id.is_(None),
                    Task.project_id.is_(None)
                )
            )
        ).all()

        # Generate instances for standalone tasks
        for task in standalone_tasks:
            result = self._generate_standalone_instance(task, target_date)
            if result is None:  # Task shouldn't be generated for this date
                continue
            if isinstance(result, bool):  # Instance already existed
                stats['skipped'] += 1
            else:  # New instance was created
                stats['created'] += 1

        # Generate instances for sub-tasks based on placeholder tasks
        for task in placeholder_tasks:
            instances = self._generate_placeholder_guided_instances(task, target_date)
            stats['created'] += len(instances)
            # Count skipped instances for placeholder tasks
            existing_count = self.db.query(TaskInstance).filter(
                TaskInstance.task_id.in_([item.get('sub_task_id') for item in task.queue.get('iterations', [])]),
                TaskInstance.due_date == target_date
            ).count()
            stats['skipped'] += existing_count

        return stats

    def _generate_standalone_instance(self, task: Task, target_date: datetime) -> Optional[Union[TaskInstance, bool]]:
        """Generate instance for a standalone task if it matches frequency"""
        if not self._should_generate_for_date(task, target_date):
            return None

        # Check for existing instance
        existing = self.db.query(TaskInstance).filter(
            TaskInstance.task_id == task.id,
            TaskInstance.due_date == target_date
        ).first()

        if existing:
            return True  # Instance exists

        # Create new instance
        instance = TaskInstance(
            task_id=task.id,
            due_date=target_date,
            status='pending',
            progress=0
        )
        self.db.add(instance)
        self.db.commit()
        return instance

    def _generate_placeholder_guided_instances(self, placeholder_task: Task, target_date: datetime) -> List[TaskInstance]:
        """Generate instances for sub-tasks based on placeholder task schedule"""
        if not self._should_generate_for_date(placeholder_task, target_date):
            return []

        # Get or create placeholder instance to track position
        placeholder_instance = self._get_or_create_placeholder_instance(placeholder_task, target_date)
        if not placeholder_instance:
            return []
        
        # Get current iteration based on position
        iterations = placeholder_task.queue.get('iterations', [])
        if not iterations:
            return []

        # Get the current position from the placeholder instance
        current_position = placeholder_instance.iteration_position % len(iterations)
        current_iteration = iterations[current_position]

        instances = []
        
        # If it's a cooldown day, no sub-task instances needed
        if current_iteration.get('isCooldown'):
            return instances

        # Delete any existing sub-task instances for this date and placeholder
        existing_instances = self.db.query(TaskInstance).filter(
            TaskInstance.due_date == target_date,
            TaskInstance.parent_instance_id == placeholder_instance.id
        ).all()
        
        for instance in existing_instances:
            self.db.delete(instance)
        
        # Create instances ONLY for the sub-tasks in the current iteration
        for item in current_iteration.get('items', []):
            if item.get('type') == 'SUB_TASK':
                sub_task_id = item.get('sub_task_id')
                if not sub_task_id:
                    continue

                instance = TaskInstance(
                    task_id=sub_task_id,
                    due_date=target_date,
                    status='pending',
                    progress=0,
                    parent_instance_id=placeholder_instance.id
                )
                self.db.add(instance)
                instances.append(instance)

        if instances:
            self.db.commit()

        return instances

    def _get_or_create_placeholder_instance(self, placeholder_task: Task, target_date: datetime) -> Optional[TaskInstance]:
        """Get or create a placeholder instance to track position"""
        # First, try to get an existing instance for this date
        instance = self.db.query(TaskInstance).filter(
            TaskInstance.task_id == placeholder_task.id,
            TaskInstance.due_date == target_date
        ).first()

        if not instance:
            # Get the most recent instance before this date
            previous_instance = self.db.query(TaskInstance).filter(
                TaskInstance.task_id == placeholder_task.id,
                TaskInstance.due_date < target_date
            ).order_by(TaskInstance.due_date.desc()).first()

            iterations_length = len(placeholder_task.queue.get('iterations', []))
            if iterations_length == 0:
                return None

            # Calculate the next position
            if previous_instance:
                # If we have a previous instance, increment its position
                next_position = (previous_instance.iteration_position + 1) % iterations_length
            else:
                # If this is the first instance, start at position 0
                next_position = 0

            # Create new instance with the calculated position
            instance = TaskInstance(
                task_id=placeholder_task.id,
                due_date=target_date,
                status='pending',
                progress=0,
                iteration_position=next_position
            )
            
            try:
                self.db.add(instance)
                self.db.commit()
            except Exception as e:
                self.db.rollback()
                print(f"Error creating placeholder instance: {e}")
                return None

        return instance

    def _should_generate_for_date(self, task: Task, target_date: datetime) -> bool:
        """Determine if an instance should be generated for the given date"""
        if not task.is_recurring or not task.frequency:
            return False

        if task.start_date and target_date < task.start_date:
            return False

        if task.end_date and target_date > task.end_date:
            return False

        # Check frequency
        if task.frequency == 'daily':
            return True
        elif task.frequency == 'weekly':
            # Assuming we want to maintain the same day of week as the start_date or created_at
            reference_date = task.start_date or task.created_at
            return target_date.weekday() == reference_date.weekday()
        elif task.frequency == 'monthly':
            # Assuming we want to maintain the same day of month
            reference_date = task.start_date or task.created_at
            return target_date.day == reference_date.day

        return False 