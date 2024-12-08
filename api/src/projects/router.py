from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..models import Project, Area
from ..schemas import ProjectCreate, Project as ProjectSchema
from ..auth.utils import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify area belongs to user
    area = db.query(Area).filter(
        Area.id == project_data.area_id,
        Area.user_id == current_user.id
    ).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    
    db_project = Project(**project_data.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectSchema])
async def get_projects(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Project).join(Area).filter(Area.user_id == current_user.id).all()

@router.get("/{project_id}", response_model=ProjectSchema)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = db.query(Project).join(Area).filter(
        Project.id == project_id,
        Area.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectSchema)
async def update_project(
    project_id: UUID,
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify area belongs to user
    area = db.query(Area).filter(
        Area.id == project_data.area_id,
        Area.user_id == current_user.id
    ).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")

    project = db.query(Project).join(Area).filter(
        Project.id == project_id,
        Area.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for key, value in project_data.dict().items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = db.query(Project).join(Area).filter(
        Project.id == project_id,
        Area.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"ok": True} 