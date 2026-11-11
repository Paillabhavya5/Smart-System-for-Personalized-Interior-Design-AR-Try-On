# Smart Interior Design Studio

This project is an independently developed AI-powered interior design and AR-style room visualization application built to meet the requirements of a smart interior redesign workflow.

It uses:
- FastAPI backend
- SQLite persistence
- ResNet18-based room classification fallback
- YOLOv8 furniture detection
- Gemini image generation when configured
- Vite + React frontend
- Three.js 3D preview

## Reference and attribution
The project was inspired by the public reference repository:
https://github.com/tanguturiharsha-1810/A-Smart-System-for-Personalized-Interior-Design-AR-Try-On

No explicit software license was found in the reference repository metadata. This implementation is therefore built independently and does not copy source code from that project. The reference was used only as a conceptual and feature benchmark.

## Features
- Upload a room image
- Detect room type and furniture objects
- Choose style, room type, and palette
- Generate AI-assisted redesign output
- View before/after comparison and an interactive 3D furniture planner
- Add, remove, and drag furniture items in room-specific starter layouts
- Save designs to SQLite and browse previous sessions
- Health endpoint and structured API responses

## Local setup

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy ..\.env.example .env
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## Environment variables
Create a `.env` file in the repo root or backend folder with values similar to:
```env
GEMINI_API_KEY=
IMAGE_GENERATION_MODEL=gemini-2.0-flash-preview-image-generation
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

## API endpoints
- `POST /api/analyze`
- `POST /api/try-on`
- `POST /api/designs/save`
- `GET /api/designs`
- `GET /api/health`

## Testing notes
- The AI redesign path is enabled when a valid Gemini key is configured.
- When no Gemini key is available, the system falls back to the original image with recommendations in a clearly labeled mode.
- The 3D furniture planner is a procedural, editable layout preview; it is not a reconstruction of the uploaded photo and its edits are not saved to design history.
- Room classification uses a ResNet18 ImageNet-based fallback because a Places365 checkpoint is not guaranteed to be present or legally bundled.

## Deployment
- Frontend: Vercel
- Backend: Render / Railway / Azure App Service
- Database: SQLite for local use; a production-grade managed database should replace it for persistent deployments

## Screenshots
Add screenshots here after running the app locally.
