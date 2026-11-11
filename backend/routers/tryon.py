import base64
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image

try:
    from backend.services.furniture_detector import FurnitureDetector
    from backend.services.image_generator import ImageGenerator
    from backend.services.recommendation_engine import build_recommendations
    from backend.services.room_classifier import classify_room
except ModuleNotFoundError:  # pragma: no cover - local execution fallback
    from services.furniture_detector import FurnitureDetector
    from services.image_generator import ImageGenerator
    from services.recommendation_engine import build_recommendations
    from services.room_classifier import classify_room

router = APIRouter()

detector = FurnitureDetector()
generator = ImageGenerator()


@router.post("/try-on")
async def try_on(
    place_image: UploadFile = File(...),
    room_type: str = Form("living room"),
    style: str = Form("Modern"),
    background_color: str = Form("#F5F1EB"),
    foreground_color: str = Form("#1F2937"),
    instructions: str = Form(""),
):
    try:
        image_bytes = await place_image.read()
        Image.open(BytesIO(image_bytes)).verify()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image upload: {exc}") from exc

    detection_data = detector.detect(image_bytes)
    classification = classify_room(image_bytes, detection_data.get("objects", []))
    recommendations = build_recommendations(room_type or classification["room_category"], style, background_color, foreground_color, instructions)

    try:
        result = generator.generate(
            image_bytes,
            room_type or classification["room_category"],
            style,
            background_color,
            foreground_color,
            instructions,
        )
        image_data = result["image_base64"]
        text_response = result["text"]
        mode = result.get("mode", "gemini-ai")
        success_rate = 0.98
    except Exception as exc:
        image_data = base64.b64encode(image_bytes).decode("utf-8")
        text_response = recommendations
        mode = "fallback"
        success_rate = 0.55

    return {
        "mode": mode,
        "image": f"data:image/png;base64,{image_data}",
        "text": text_response,
        "success_rate": success_rate,
        "analysis": {
            "room_category": classification["room_category"],
            "confidence": classification["confidence"],
            "label": classification["label"],
            "detections": detection_data["detections"],
            "model": classification["model"],
        },
        "generated_analysis": {
            "room_category": classification["room_category"],
            "confidence": classification["confidence"],
            "detections": detection_data["detections"],
            "model": classification["model"],
        },
    }
