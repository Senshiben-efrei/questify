from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..models import Area
from ..schemas import AreaCreate, Area as AreaSchema
from ..auth.utils import get_current_user

router = APIRouter(prefix="/areas", tags=["Areas"])

@router.post("/", response_model=AreaSchema, status_code=status.HTTP_201_CREATED)
async def create_area(
    area_data: AreaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    area_dict = area_data.dict()
    area_dict['user_id'] = current_user.id
    
    db_area = Area(**area_dict)
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area

@router.get("/", response_model=List[AreaSchema])
async def get_areas(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Area).filter(Area.user_id == current_user.id).all()

@router.get("/{area_id}", response_model=AreaSchema)
async def get_area(
    area_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    area = db.query(Area).filter(
        Area.id == area_id,
        Area.user_id == current_user.id
    ).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Area not found"
        )
    return area

@router.put("/{area_id}", response_model=AreaSchema)
async def update_area(
    area_id: UUID,
    area_data: AreaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    area = db.query(Area).filter(
        Area.id == area_id,
        Area.user_id == current_user.id
    ).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Area not found"
        )
    
    for key, value in area_data.dict().items():
        setattr(area, key, value)
    
    db.commit()
    db.refresh(area)
    return area

@router.delete("/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_area(
    area_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    area = db.query(Area).filter(
        Area.id == area_id,
        Area.user_id == current_user.id
    ).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Area not found"
        )
    
    db.delete(area)
    db.commit()
    return None 