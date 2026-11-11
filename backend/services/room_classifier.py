import io
from typing import Iterable

import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision.models import ResNet18_Weights, resnet18


class RoomClassifier:
    def __init__(self) -> None:
        self.weights = ResNet18_Weights.DEFAULT
        self.model = resnet18(weights=self.weights)
        self.model.eval()
        self.preprocess = self.weights.transforms()

    def _normalize_room_label(self, label: str, detected_objects: Iterable[str]) -> str:
        normalized = label.lower()
        objects = {item.lower() for item in detected_objects}

        if "bed" in objects or "bedroom" in normalized:
            return "bedroom"
        if any(item in objects for item in ["toilet", "bath", "sink", "bathtub"]):
            return "bathroom"
        if any(item in objects for item in ["refrigerator", "fridge", "oven", "stove", "microwave"]):
            return "kitchen"
        if any(item in objects for item in ["dining table", "table", "chair"]) and "sofa" not in objects:
            return "dining room"
        if any(item in objects for item in ["sofa", "couch", "tv", "coffee table", "chair"]) or "living room" in normalized:
            return "living room"
        if "kitchen" in normalized or "counter" in normalized:
            return "kitchen"
        if "bath" in normalized or "toilet" in normalized:
            return "bathroom"
        if "dining" in normalized:
            return "dining room"
        if "bed" in normalized:
            return "bedroom"
        return "living room"

    def predict(self, image_bytes: bytes, detected_objects: Iterable[str] | None = None) -> dict:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.preprocess(image).unsqueeze(0)

        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)
            max_prob, idx = torch.max(probs, dim=1)

        categories = self.weights.meta.get("categories", [])
        label = categories[idx.item()] if idx.item() < len(categories) else "unknown"
        room = self._normalize_room_label(label, detected_objects or [])

        return {
            "room_category": room,
            "confidence": round(float(max_prob.item()), 4),
            "label": label,
            "model": "resnet18-imagenet-fallback",
        }


def classify_room(image_bytes: bytes, detected_objects: Iterable[str] | None = None) -> dict:
    classifier = RoomClassifier()
    return classifier.predict(image_bytes, detected_objects)
