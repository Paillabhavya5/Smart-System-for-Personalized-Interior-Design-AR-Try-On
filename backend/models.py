from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    room_category: str
    confidence: float
    label: str = ""
    detections: List[dict[str, Any]] = Field(default_factory=list)
    image_size: dict[str, int] = Field(default_factory=dict)
    model: str = "resnet18-image-fallback"


class DesignSaveRequest(BaseModel):
    room_category: str
    style: str
    color_palette: str
    furniture_detections: str = "[]"
    recommendations: str
    original_image_path: str = ""
    generated_image_path: str = ""


class DesignSaveResponse(BaseModel):
    id: int
    room_category: str
    style: str
    color_palette: str
    furniture_detections: str
    recommendations: str
    original_image_path: str = ""
    generated_image_path: str = ""
    created_at: datetime


class TryOnResponse(BaseModel):
    mode: str
    image: Optional[str] = None
    text: str = ""
    success_rate: float = 0.0
    analysis: Optional[AnalysisResult] = None
    generated_analysis: Optional[AnalysisResult] = None
