import base64
import io
import os
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image


class ImageGenerator:
    def __init__(self) -> None:
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("IMAGE_GENERATION_MODEL", "gemini-2.0-flash-preview-image-generation")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    def generate(self, image_bytes: bytes, room_category: str, style: str, background_color: str, foreground_color: str, instructions: str) -> dict[str, Any]:
        if self.client is None:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        png_buffer = io.BytesIO()
        image.save(png_buffer, format="PNG")
        png_bytes = png_buffer.getvalue()

        prompt = f"""
        You are an interior redesign assistant. Preserve the room layout and architecture while improving it.
        Room Type: {room_category}
        Style: {style}
        Preferred background color: {background_color}
        Preferred foreground color: {foreground_color}
        Additional guidance: {instructions}

        Requirements:
        1. Keep the structure and open spaces realistic.
        2. Improve furnishings, colors, textures, lighting, and decor.
        3. Stay interior-focused and avoid exterior or unrealistic transformations.
        4. Return a clear, polished redesign with a refined and coherent palette.
        5. Provide concise design recommendations in markdown after the image.
        """

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[
                prompt,
                types.Part.from_bytes(data=png_bytes, mime_type="image/png"),
            ],
            config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
        )

        image_b64 = None
        text_output = "AI redesign completed."

        if response and getattr(response, "candidates", None):
            for part in response.candidates[0].content.parts:
                if getattr(part, "inline_data", None):
                    image_b64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                elif getattr(part, "text", None):
                    text_output = part.text

        if image_b64 is None:
            raise RuntimeError("No image was returned by Gemini")

        return {
            "mode": "gemini-ai",
            "image_base64": image_b64,
            "text": text_output,
        }
