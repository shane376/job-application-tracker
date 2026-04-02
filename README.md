# Smart Job Application Tracker

Production-focused SaaS starter for tracking job applications, resume analysis, and AI-powered match scoring.

## Completed Scope

### Phase 1 (Foundation)
- React frontend (Vite)
- Django REST backend
- PostgreSQL database
- Docker Compose orchestration
- API health endpoint and frontend connectivity check

### Phase 2 (Authentication)
- JWT auth endpoints (`register`, `login`, `refresh`, `me`)
- Frontend auth context with token persistence
- Login/Register forms with validation
- Protected routes for authenticated pages

### Phase 3 (Applications CRUD)
- Backend `Application` model with status workflow
- User-scoped CRUD API (`/applications/`)
- Dashboard create/list/status analytics
- Application detail edit/delete page

### Phase 4 (Resume Upload + Parsing)
- Backend `Resume` model with PDF file storage and extracted text persistence
- User-scoped resumes API with upload/list/detail/delete support
- PDF text extraction service (`pypdf`) on upload
- Resume upload page with upload form and uploaded resume history

### Phase 5 (AI Matching)
- Backend `MatchResult` model to persist analysis results
- AI matching service with reusable prompt template and OpenAI integration
- Structured JSON response contract: `match_score`, `missing_skills`, `improvement_suggestions`
- AI match API endpoint to compare selected resume against application/job description
- Frontend AI match workflow on Application Detail page

### Phase 6 (Product Polish + Analytics)
- Analytics overview API for total applications, status distribution, resume count, AI match count, and average score
- Dashboard upgraded with integrated analytics KPIs and recent AI match activity
- Added `.gitignore` and tightened run/setup docs for developers and end users

---

## Prerequisites

### For Docker run (recommended)
- Docker Engine + Docker Compose

### For local non-Docker run
- Python 3.12+
- Node.js 22+
- PostgreSQL 16+

---

## Repository Structure

```text
.
├── backend
├── frontend
├── docker-compose.yml
└── .env.example
```

---

## Quick Start (Docker)

1. Copy environment templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env
```

2. (Optional) Set AI config in `backend/.env`:

```env
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o-mini
```

3. Build and run all services:

```bash
docker compose up --build
```

4. Open the app:
- Frontend: http://localhost:5173
- Backend health: http://localhost:8000/api/v1/health/

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/base.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend defaults to `VITE_API_BASE_URL=http://localhost:8000/api/v1`.

---

## API Summary

Base prefix: `/api/v1/`

### Auth
- `POST /auth/register/`
- `POST /auth/login/`
- `POST /auth/refresh/`
- `GET /auth/me/`

### Applications
- `GET /applications/`
- `POST /applications/`
- `GET /applications/:id/`
- `PUT /applications/:id/`
- `DELETE /applications/:id/`

### Resumes
- `GET /resumes/`
- `POST /resumes/` (multipart form with `title` + `file`)
- `GET /resumes/:id/`
- `DELETE /resumes/:id/`

### AI Matching
- `POST /ai/match/`
  - Input JSON example: `{ "resume_id": 1, "application_id": 2 }`
  - Optional fallback input: `{ "resume_id": 1, "job_description": "..." }`
- `GET /ai/matches/`

### Analytics
- `GET /analytics/overview/`

---

## Next Steps

Potential future enhancements:
- richer analytics charts and time-series trends
- background jobs for parsing/matching
- full test suite (backend + frontend)
- production deployment manifests
