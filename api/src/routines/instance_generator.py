from datetime import datetime, timedelta, date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, exists

from ..models import Routine, RoutineInstance, TaskInstance, EvaluationMethod

class RoutineInstanceGenerator:
    def __init__(self, db: Session):
        self.db = db

    def generate_instances_for_user(self, user_id: str, target_date: date) -> dict:
        """Generate instances for a specific user and date"""
        stats = {'created': 0, 'skipped': 0}
        
        # Get all recurring routines for user
        routines = self.db.query(Routine).filter(
            Routine.is_recurring == True,
            Routine.user_id == user_id
        ).all()

        # Generate instances for each routine
        for routine in routines:
            result = self._generate_routine_instance(routine, target_date)
            if result is None:  # Routine shouldn't be generated for this date
                continue
            if isinstance(result, bool):  # Instance already existed
                stats['skipped'] += 1
            else:  # New instance was created
                stats['created'] += 1

        return stats

    def _generate_routine_instance(self, routine: Routine, target_date: date) -> Optional[RoutineInstance]:
        """Generate instance for a routine if it matches frequency"""
        if not self._should_generate_for_date(routine, target_date):
            return None

        # Convert target_date to datetime for database
        target_datetime = datetime.combine(target_date, datetime.min.time())

        # Check for any existing instance for this date
        existing_instance = self.db.query(RoutineInstance).filter(
            RoutineInstance.routine_id == routine.id,
            RoutineInstance.due_date == target_datetime
        ).first()

        if existing_instance:
            # Check if instance has any tasks
            has_tasks = self.db.query(TaskInstance).filter(
                TaskInstance.routine_instance_id == existing_instance.id
            ).first() is not None

            if has_tasks:
                # If instance has tasks, skip it
                return True
            else:
                # If instance exists but has no tasks, reuse it
                routine_instance = existing_instance
        else:
            # Create new instance if none exists
            # Get the most recent instance to determine next position
            previous_instance = self.db.query(RoutineInstance).filter(
                RoutineInstance.routine_id == routine.id,
                RoutineInstance.due_date < target_datetime
            ).order_by(RoutineInstance.due_date.desc()).first()

            # Calculate next position
            iterations = routine.queue.get('iterations', [])
            if not iterations:
                return None

            next_position = ((previous_instance.iteration_position + 1) if previous_instance 
                            else 0) % len(iterations)

            routine_instance = RoutineInstance(
                routine_id=routine.id,
                iteration_position=next_position,
                due_date=target_datetime
            )
            self.db.add(routine_instance)
            self.db.flush()

        # Get the current iteration
        iterations = routine.queue.get('iterations', [])
        if not iterations:
            return None

        current_iteration = iterations[routine_instance.iteration_position]

        # Create task instances for current iteration
        for item in current_iteration.get('items', []):
            if item.get('type') == 'TASK':  # Skip cooldown periods
                task_instance = TaskInstance(
                    routine_instance_id=routine_instance.id,
                    task_id=item['id'],
                    name=item['name'],
                    evaluation_method=item['evaluation_method'],
                    target_value=item.get('target_value'),
                    execution_time=item.get('execution_time'),
                    duration=item.get('duration'),
                    status='pending',
                    progress=0
                )
                self.db.add(task_instance)

        try:
            self.db.commit()
            return routine_instance
        except Exception as e:
            self.db.rollback()
            raise e

    def _should_generate_for_date(self, routine: Routine, target_date: date) -> bool:
        """Determine if an instance should be generated for the given date"""
        if not routine.is_recurring or not routine.frequency:
            return False

        # Convert datetime fields to date for comparison
        start_date = routine.start_date.date() if routine.start_date else None
        end_date = routine.end_date.date() if routine.end_date else None

        if start_date and target_date < start_date:
            return False

        if end_date and target_date > end_date:
            return False

        # Check frequency
        if routine.frequency == 'daily':
            return True
        elif routine.frequency == 'weekly':
            # Maintain the same day of week as the start_date
            reference_date = (start_date or routine.created_at.date())
            return target_date.weekday() == reference_date.weekday()
        elif routine.frequency == 'monthly':
            # Maintain the same day of month
            reference_date = (start_date or routine.created_at.date())
            return target_date.day == reference_date.day

        return False 