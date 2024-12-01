# Task System Revamp Plan

## Overview
Converting the current 3-type task system (standalone, placeholder, sub-tasks) into a simplified routine-based system where routines contain directly defined tasks in their queue.

## Database Changes

### 1. Schema Cleanup
- Remove task_type enum
- Drop constraints related to sub-tasks and standalone tasks
- Simplify the tasks table to only handle routines
- Update task_instances table structure
- Remove any sub-task related foreign keys

### 2. New Schema Setup
- Rename 'tasks' table to 'routines'
- Create new structure for queue JSONB field to include full task definitions
- Update constraints to match new routine-only system
- Add new validation checks for queue structure

## API Changes

### 3. Router Cleanup
- Remove standalone and sub-task related endpoints
- Remove task type checking from middleware
- Clean up imports and unused code

### 4. New Routine Endpoints
- Create new routine creation endpoint with comprehensive queue handling
- Update routine modification endpoints
- Implement new validation for routine queue items
- Update instance generation logic for new queue structure

### 5. Instance Generator Rework
- Remove sub-task specific logic
- Update instance generation to handle new queue structure
- Modify position tracking for queue items
- Update cooldown period handling

### 6. Schema Updates
- Create new Pydantic models for routines
- Create new models for queue items
- Update response models
- Remove old task-related models

## Frontend Changes

### 7. Component Cleanup
- Remove standalone and sub-task related components
- Clean up task type references in shared components
- Update type definitions

### 8. New Routine Components
- Create new RoutineModal component
- Implement enhanced QueueManager component
- Create TaskDefinitionForm component for queue items
- Update routine list and detail views

### 9. Form Updates
- Create new form structure for routine creation
- Implement task definition within queue items
- Add validation for new queue structure
- Update area/project selection logic

### 10. API Integration
- Update API service calls
- Implement new routine creation flow
- Update instance handling
- Modify progress tracking

## Testing & Validation

### 11. API Testing
- Create new test suite for routine endpoints
- Test queue validation
- Test instance generation
- Test recurrence handling

### 12. Frontend Testing
- Test routine creation flow
- Test queue management
- Test form validation
- Test instance display and management

## Documentation

### 13. API Documentation
- Update OpenAPI documentation
- Document new queue structure
- Update endpoint descriptions
- Add new examples

### 14. Frontend Documentation
- Update component documentation
- Document new props and interfaces
- Update usage examples
- Document new form structure

## Implementation Order
1. Database changes (1-2)
2. Core API changes (3-4)
3. Instance generator rework (5)
4. Schema updates (6)
5. Frontend cleanup (7)
6. New components (8)
7. Form implementation (9)
8. API integration (10)
9. Testing (11-12)
10. Documentation (13-14)

## Notes
- Each step should be implemented and tested independently
- Old code should be removed rather than commented out
- New features should be added only after basic functionality is confirmed
- Regular testing throughout implementation
- Consider backwards compatibility only if absolutely necessary 