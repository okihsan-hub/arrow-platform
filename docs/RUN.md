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

### Auth: JSON login (Swagger / API)

`POST /api/auth/login` expects **JSON** (`application/json`):

```json
{ "email": "admin@example.com", "password": "123456" }
```

Response:

```json
{ "access_token": "...", "refresh_token": "...", "token_type": "bearer" }
```

Protected routes use **HTTP Bearer**: in Swagger, use **Authorize** and paste only the `access_token` value (not `Bearer ` prefix if the UI adds it for you).

### 4) Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### License activation signing

`POST /api/licenses/activate` requires request signing headers:

- `X-Timestamp` (unix seconds)
- `X-Nonce` (unique, cannot repeat within 5 minutes)
- `X-Signature` (hex)

Signature:

\[
\text{HMAC\_SHA256}(\text{LICENSE\_SIGNING\_SECRET},\; license\_key + device\_id + timestamp + nonce)
\]

Rules:

- timestamp within ±60 seconds
- nonce cannot repeat within 5 minutes
- invalid signature returns `reason: "invalid_signature"`

### Offline validation fallback (client-side)

If you have a client app that calls the license API, you can use `frontend/lib/licenseValidation.ts`:

- Caches last successful validation locally (`localStorage`)
- If server is unreachable, allows usage for up to **24 hours** since last validation
- Blocks usage after that
- **Activation never works offline**
