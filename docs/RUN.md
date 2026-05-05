## Run instructions

### Prerequisites

- Docker Desktop
- Python 3.11+ (backend)
- Node.js 20+ (frontend)

### 1) Configure environment

Copy root env file:

```bash
cp .env.example .env
```

### 2) Start PostgreSQL

```bash
docker compose up -d
```

### 3) Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000` and docs at `http://localhost:8000/docs`.

### 4) Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.
