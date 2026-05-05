## Arrow Platform

Monorepo:

- `backend/`: FastAPI + PostgreSQL (SQLAlchemy) + Alembic + JWT (access/refresh) + RBAC
- `frontend/`: Next.js (App Router) + role-protected routes
- `docs/`: project docs

### Quick start (dev)

Create `.env` from `.env.example` at repo root:

```bash
cp .env.example .env
```

Start PostgreSQL:

```bash
docker compose up -d
```

Run backend:

```bash
cd backend
python -m venv .venv
# Windows:
.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Run frontend:

```bash
cd frontend
npm install
npm run dev
```

See `docs/RUN.md` for details.

