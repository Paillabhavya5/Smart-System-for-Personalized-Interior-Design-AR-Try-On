from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.routers.analysis import router as analysis_router
    from backend.routers.designs import router as designs_router
    from backend.routers.tryon import router as tryon_router
except ModuleNotFoundError:  # pragma: no cover - local execution fallback
    from routers.analysis import router as analysis_router
    from routers.designs import router as designs_router
    from routers.tryon import router as tryon_router

app = FastAPI(title="Smart Interior Design API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/api")
app.include_router(tryon_router, prefix="/api")
app.include_router(designs_router, prefix="/api/designs")


@app.get("/api/health")
def health_check():
    from dotenv import load_dotenv
    import os

    load_dotenv()
    return {
        "status": "ok",
        "services": {
            "gemini": bool(os.getenv("GEMINI_API_KEY")),
            "image_generation_model": os.getenv("IMAGE_GENERATION_MODEL", "gemini-2.0-flash-preview-image-generation"),
            "room_classifier": "resnet18-imagenet-fallback",
            "furniture_detector": "yolov8n",
        },
    }
