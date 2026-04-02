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

## Repository Structure

```text
.
├── backend
├── frontend
├── docker-compose.yml
└── .env.example
```

## Local Setup

1. Copy environment templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env
```

2. Build and run services:

```bash
docker compose up --build
```

3. Verify services:

- Frontend: http://localhost:5173
- Backend health (v1): http://localhost:8000/api/v1/health/

## API Routing Convention

- Stable base path for frontend API calls: `/api/v1/`
- Compatibility path also available during bootstrap: `/api/`

## Auth API (Phase 2)

- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/refresh/`
- `GET /api/v1/auth/me/`

## Applications API (Phase 3)

- `GET /api/v1/applications/`
- `POST /api/v1/applications/`
- `GET /api/v1/applications/:id/`
- `PUT /api/v1/applications/:id/`
- `DELETE /api/v1/applications/:id/`

## Resumes API (Phase 4)

- `GET /api/v1/resumes/`
- `POST /api/v1/resumes/` (multipart form with `title` + `file`)
- `GET /api/v1/resumes/:id/`
- `DELETE /api/v1/resumes/:id/`

## AI Matching API (Phase 5)

- `POST /api/v1/ai/match/`
  - Input JSON: `{ "resume_id": number, "application_id": number? , "job_description": string? }`
  - Output JSON fields include: `match_score`, `missing_skills`, `improvement_suggestions`
- `GET /api/v1/ai/matches/`

## Next Phase

- Phase 6: Dashboard analytics and product polish
