## PROJECT_BRIEF (source of truth)

Goal: production-ready monorepo for Arrow Platform.

### Structure

- `backend/`: FastAPI API
- `frontend/`: Next.js (App Router)
- `docs/`: documentation

### Backend requirements

- FastAPI project structure: routers, models, schemas, services
- PostgreSQL with SQLAlchemy
- Alembic migrations
- JWT authentication (access + refresh)
- RBAC roles: admin, reseller, customer
- `.env` configuration system

### Frontend requirements

- Next.js App Router
- Basic layout + login page
- Protected routes by role
- Simple admin dashboard (no heavy UI)

### Dev requirements

- `docker-compose` for PostgreSQL
- Clear run instructions

### Repo ignore rules (apply via `.gitignore`)

- `node_modules/`, `.next/`, `dist/`, `build/`
- `.env`, `.env.*`
- `__pycache__/`, `*.pyc`

