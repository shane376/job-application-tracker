# Smart Job Application Tracker

Production-focused SaaS starter for tracking job applications, resume analysis, and AI-powered match scoring.

## Phase 1 Scope

This repository includes foundational setup for:

- React frontend (Vite)
- Django REST backend
- PostgreSQL database
- Docker Compose orchestration
- API health endpoint and frontend connectivity check

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
- Backend health: http://localhost:8000/api/health/

## Next Phases

- Phase 2: JWT authentication (register/login/refresh + protected frontend routes)
- Phase 3: Applications CRUD
- Phase 4: Resume upload and parsing
- Phase 5: AI resume/job matching services
- Phase 6: Dashboard analytics and product polish
