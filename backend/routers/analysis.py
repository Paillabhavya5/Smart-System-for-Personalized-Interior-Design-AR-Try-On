from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image
from io import BytesIO

try:
    from backend.services.furniture_detector import FurnitureDetector
    from backend.services.room_classifier import classify_room
except ModuleNotFoundError:  # pragma: no cover - local execution fallback
    from services.furniture_detector import FurnitureDetector
    from services.room_classifier import classify_room

router = APIRouter()

detector = FurnitureDetector()


@router.post("/analyze")
async def analyze_room(place_image: UploadFile = File(...)):
    try:
        image_bytes = await place_image.read()
        Image.open(BytesIO(image_bytes)).verify()
    except Exception as exc:  # pragma: no cover - validation branch
        raise HTTPException(status_code=400, detail=f"Invalid image upload: {exc}") from exc

    try:
        detection_data = detector.detect(image_bytes)
        rooms = classify_room(image_bytes, detection_data.get("objects", []))
        with Image.open(BytesIO(image_bytes)) as image:
            image_size = {"width": image.width, "height": image.height}

        return {
            "room_category": rooms["room_category"],
            "confidence": rooms["confidence"],
            "label": rooms["label"],
            "model": rooms["model"],
            "detections": detection_data["detections"],
            "image_size": image_size,
        }
    except Exception as exc:  # pragma: no cover - actual runtime guard
        raise HTTPException(status_code=500, detail=f"Room analysis failed: {exc}") from exc
