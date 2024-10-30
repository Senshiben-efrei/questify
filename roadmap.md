# Roadmap: Real-Life RPG Gamified Self-Improvement App

This roadmap outlines the phased development of a self-improvement application designed as a real-life RPG. The application will allow users to create areas for self-improvement, track projects and tasks, and level up through task completion. 

## Overview

### Stack
- **API**: FastAPI (Python)
- **Client**: React + Tailwind CSS
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose

### Main Tables
- **Users**: Manage user data and authentication.
- **Areas**: Self-improvement areas (e.g., Health, Finance).
- **Projects**: Specific goals within areas (e.g., "Nutrition" under "Health").
- **Tasks**: Actions to achieve within projects.
- **Task Instances**: Individual instances of recurring tasks for completion tracking.

---

## Phase 1: Foundation Setup & Basic Functionalities

### 1. Infrastructure Setup
1. **Docker Compose Configuration**:
   - Create a `docker-compose.yml` file for defining services:
     - **API Service**: Runs FastAPI
     - **Client Service**: Runs React
     - **Database Service**: Uses PostgreSQL image
   - Configure environment variables, volume bindings, network settings, and persistence.

2. **Database Setup**:
   - Define schema for five primary tables:
     - `Users`: Fields - `id`, `username`, `email`, `hashed_password`
     - `Areas`: Fields - `id`, `name`, `description`, `xp`, `user_id`
     - `Projects`: Fields - `id`, `name`, `description`, `area_id`
     - `Tasks`: Fields - `id`, `name`, `description`, `project_id`, `area_id`, `is_recurring`, `frequency`
     - `TaskInstances`: Fields - `id`, `task_id`, `status`, `progress`, `due_date`, `completion_date`
   - Set up ORM models using SQLAlchemy.

3. **API Setup**:
   - Scaffold FastAPI project with the following endpoints:
     - **User Authentication**:
       - `/register`: Register new users with email and password hashing
       - `/login`: User login using JWT for session management
     - **CRUD Operations for Core Entities**:
       - **Areas**: Create, retrieve, update, delete areas
       - **Projects**: Create, retrieve, update, delete projects linked to areas
       - **Tasks**: Create, retrieve, update, delete tasks (with link to areas or projects)
     - **TaskInstance Generator**:
       - Logic for generating task instances on set recurrence frequencies (daily, weekly, etc.)

4. **Frontend Setup**:
   - Initialize a React project with Tailwind CSS.
   - Basic components and pages:
     - **Authentication**: Login and registration forms with client-side validation.
     - **Dashboard Layout**: Display user’s areas, projects, and tasks.

5. **Testing**:
   - Write unit tests for backend endpoints (authentication, CRUD operations).
   - Basic integration tests for API (e.g., session validation, task creation).

---

## Phase 2: Gamification & User Engagement

### 1. Advanced Task Management
1. **Task Types**:
   - **Single Task**: Simple tasks with a binary (yes/no) or numeric goal (e.g., "Drink 2 liters of water").
   - **Placeholder Task**: Holds a series of sub-tasks (e.g., "Workout" includes "Back Day", "Chest Day").
   - **Sub-Tasks**: Subordinate to a placeholder task, inherits scheduling from the parent task.

2. **Task Completion & Rewards**:
   - Completion of task instances grants XP to the associated area and coins based on task type.
   - Define backend logic for calculating XP and coins based on task difficulty and frequency.

### 2. Habit Tracking and Health Points (HP) System
1. **Habit & HP System**:
   - Track negative habits, e.g., "Scrolling too much."
   - Missing recurring tasks or maintaining bad habits results in HP reduction; completing tasks consistently heals HP.

2. **Experience & Leveling System**:
   - XP in an area increases user level within that area. Implement a level-calculation formula based on cumulative XP.
   - Display levels and XP needed for next level on the dashboard.

3. **Coins & Rewards System**:
   - Coins awarded per completed task.
   - **Coin Usage**: Allow users to spend coins as “real-life budget” or use them on vouchers to catch up on missed tasks.

4. **Testing**:
   - Write tests for XP and HP logic, including edge cases for streaks and negative habits.
   - Create user scenarios to test task instance creation and completion behavior.

---

## Phase 3: Routine Management & Calendar Integration

### 1. Routine Creation
1. **Routine System**:
   - Users can define routines by grouping tasks (e.g., Morning Routine, Evening Routine).
   - A routine appears on the calendar if tasks within it are scheduled for the day.

2. **Routine Execution**:
   - Check scheduled routines and display tasks in order.
   - Track and update XP for each task in the routine, providing a streak bonus for routine completion.

### 2. Calendar Integration
1. **Calendar Display**:
   - Integrate a calendar view showing tasks and routines for each day.
   - Sync the task schedule and routines to provide an organized daily view.

2. **Notifications & Reminders**:
   - Integrate reminders for upcoming tasks, routines, and recurring tasks.

3. **Testing**:
   - Test the routine display on the calendar and ensure tasks update with progress.
   - Verify correct reminder and notification timings based on scheduled tasks.

---

## Phase 4: Social, Competitive, and Additional Gamified Elements

### 1. Friends System & Competition
1. **Friendship System**:
   - Add the ability for users to add friends, view their progress and areas.
   - Option for collaborative projects or tasks shared with friends.

2. **Leaderboard and Challenges**:
   - Implement a leaderboard to show top users by XP or tasks completed.
   - Add challenges (e.g., "Complete 30 tasks in a month") for competitive engagement.

### 2. Additional Features & Future Enhancements
1. **Negative Balance & Damage System**:
   - Users in negative XP/coin balance lose HP daily until balanced.
   
2. **Catch-up Vouchers**:
   - Allow users to spend coins to cover missed tasks with a catch-up system.

3. **Nutrition and Health Tracking**:
   - Introduce counters for food categories (e.g., weekly intake of fish) and hydration (e.g., water intake tracking).

4. **Testing**:
   - Tests for social interactions (e.g., sending and accepting friend requests).
   - Integrate tests for leaderboard and challenge tracking.

---

## Final Testing & Deployment

- **End-to-End Testing**: Comprehensive testing for every phase and component.
- **User Acceptance Testing (UAT)**: Validate features with a sample user group.
- **Deployment**:
   - Prepare Docker images for production and deploy to a cloud service (e.g., AWS, Azure).
   - Set up continuous integration and deployment (CI/CD) pipelines.


