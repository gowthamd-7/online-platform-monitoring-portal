# Online Platform Monitoring Portal - Backend

This folder is prepared for FastAPI integration.

## Setup Instructions (for backend developer)

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install FastAPI and dependencies:

```bash
pip install fastapi uvicorn python-multipart pydantic
```

4. Create your FastAPI application in `main.py`

5. Run the server:

```bash
uvicorn main:app --reload --port 8000
```

## Expected API Endpoints

The frontend is configured to proxy `/api` requests to `http://localhost:8000`

Suggested endpoints:

- POST `/api/auth/login` - Authentication
- GET `/api/student/dashboard` - Student data
- GET `/api/teacher/dashboard` - Teacher data
- POST `/api/content/upload` - Content upload
- GET `/api/analytics` - Analytics data

## CORS Configuration

Make sure to add CORS middleware in FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
