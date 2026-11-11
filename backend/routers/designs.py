import json
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

try:
    from backend.database import SavedDesign, get_db
except ModuleNotFoundError:  # pragma: no cover - local execution fallback
    from database import SavedDesign, get_db

router = APIRouter()


class DesignPayload(BaseModel):
    room_category: str
    style: str
    color_palette: str
    furniture_detections: str = "[]"
    recommendations: str
    original_image_path: str = ""
    generated_image_path: str = ""


@router.post("/save")
def save_design(payload: DesignPayload, db: Session = Depends(get_db)):
    try:
        json.loads(payload.furniture_detections)
    except json.JSONDecodeError:
        payload.furniture_detections = "[]"

    design = SavedDesign(
        room_category=payload.room_category,
        style=payload.style,
        color_palette=payload.color_palette,
        furniture_detections=payload.furniture_detections,
        recommendations=payload.recommendations,
        original_image_path=payload.original_image_path,
        generated_image_path=payload.generated_image_path,
        created_at=datetime.utcnow(),
    )
    db.add(design)
    db.commit()
    db.refresh(design)
    return {
        "id": design.id,
        "room_category": design.room_category,
        "style": design.style,
        "color_palette": design.color_palette,
        "furniture_detections": design.furniture_detections,
        "recommendations": design.recommendations,
        "original_image_path": design.original_image_path,
        "generated_image_path": design.generated_image_path,
        "created_at": design.created_at.isoformat(),
    }


@router.get("")
def list_designs(db: Session = Depends(get_db)):
    designs = db.query(SavedDesign).order_by(SavedDesign.created_at.desc()).all()
    return [
        {
            "id": item.id,
            "room_category": item.room_category,
            "style": item.style,
            "color_palette": item.color_palette,
            "furniture_detections": item.furniture_detections,
            "recommendations": item.recommendations,
            "original_image_path": item.original_image_path,
            "generated_image_path": item.generated_image_path,
            "created_at": item.created_at.isoformat(),
        }
        for item in designs
    ]
