import io
from pathlib import Path

from PIL import Image
from ultralytics import YOLO


ALLOWED_CLASSES = {
    "bed",
    "chair",
    "sofa",
    "couch",
    "dining table",
    "tv",
    "tvmonitor",
    "refrigerator",
    "fridge",
    "oven",
    "toilet",
    "sink",
    "bathtub",
    "microwave",
    "bench",
    "desk",
}


class FurnitureDetector:
    def __init__(self) -> None:
        model_path = Path(__file__).resolve().parents[1] / "yolov8n.pt"
        self.model = YOLO(str(model_path))

    def detect(self, image_bytes: bytes) -> dict:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = self.model(image, imgsz=640, conf=0.25, iou=0.45, verbose=False)

        detections = []
        objects = []

        for result in results:
            names = result.names
            for box in result.boxes:
                cls_id = int(box.cls.item())
                name = names.get(cls_id, str(cls_id)).lower()
                confidence = float(box.conf.item())
                normalized_name = "couch" if name == "sofa" else name
                normalized_name = "sofa" if normalized_name == "couch" else normalized_name
                if normalized_name not in ALLOWED_CLASSES:
                    continue
                bounding_box = [
                    round(float(box.xyxy[0][0].item()), 2),
                    round(float(box.xyxy[0][1].item()), 2),
                    round(float(box.xyxy[0][2].item()), 2),
                    round(float(box.xyxy[0][3].item()), 2),
                ]
                detections.append(
                    {
                        "class_name": normalized_name,
                        "confidence": round(confidence, 4),
                        "bbox": bounding_box,
                    }
                )
                objects.append(normalized_name)

        return {"detections": detections, "objects": objects}
