# Arrow Bilişim — Lisans Platformu

Arrow Restaurant için `license.arrowbilisim.com` üzerinde çalışacak lisans yönetim API’si.

## Teknoloji

- FastAPI, SQLAlchemy 2, Alembic
- PostgreSQL (üretim) / SQLite (geliştirme)
- JWT admin oturumu
- API öneki: `/api`

## Hızlı başlangıç (Windows)

```powershell
cd C:\arrow-platform\backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

copy .env.example .env
# .env içinde ADMIN_EMAIL ve ADMIN_PASSWORD düzenleyin

mkdir -Force data
python -m app.seed_admin

python -m uvicorn app.main:app --host 127.0.0.1 --port 9000 --reload
```

- Sağlık: http://127.0.0.1:9000/api/health  
- Swagger: http://127.0.0.1:9000/docs  

## Alembic

```powershell
cd C:\arrow-platform\backend
.\.venv\Scripts\Activate.ps1

# SQLite (varsayılan)
alembic upgrade head

# PostgreSQL
$env:DATABASE_URL = "postgresql+psycopg://arrow:arrow@localhost:5432/arrow_license"
alembic upgrade head
```

> **Not:** `0006_license_platform` revizyonu eski `licenses` tablosunu kaldırıp yeni şemayı oluşturur. Mevcut üretim verisi varsa yedek alın.

## Docker Compose

```powershell
cd C:\arrow-platform

copy backend\.env.example .env
# JWT_SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD ayarlayın

docker compose up -d --build
```

API: http://localhost:9000/api/health

## İlk admin

`.env`:

```
ADMIN_EMAIL=admin@arrowbilisim.com
ADMIN_PASSWORD=GucluSifre123!
```

```powershell
python -m app.seed_admin
```

## Örnek akış (PowerShell)

```powershell
$base = "http://127.0.0.1:9000/api"

# Giriş
$login = Invoke-RestMethod -Method Post -Uri "$base/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@arrowbilisim.com","password":"GucluSifre123!"}'
$token = $login.access_token
$h = @{ Authorization = "Bearer $token" }

# Müşteri
$cust = Invoke-RestMethod -Method Post -Uri "$base/customers" -Headers $h `
  -ContentType "application/json" `
  -Body '{"company_name":"Demo Restoran","contact_name":"Ali"}'

# Demo lisans (7 gün otomatik)
$lic = Invoke-RestMethod -Method Post -Uri "$base/licenses" -Headers $h `
  -ContentType "application/json" `
  -Body (@{
    customer_id = $cust.id
    plan = "demo"
    max_devices = 2
    features = @{ pos = $true }
  } | ConvertTo-Json)

# Aktivasyon (public)
Invoke-RestMethod -Method Post -Uri "$base/public/licenses/activate" `
  -ContentType "application/json" `
  -Body (@{
    license_key = $lic.license_key
    device_id = "PC-001"
    device_name = "Kasa-1"
    app_version = "1.0.0"
  } | ConvertTo-Json)

# Doğrulama (public)
Invoke-RestMethod -Method Post -Uri "$base/public/licenses/validate" `
  -ContentType "application/json" `
  -Body (@{
    license_key = $lic.license_key
    device_id = "PC-001"
  } | ConvertTo-Json)
```

## Endpoint özeti

| Alan | Endpoint |
|------|----------|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/login`, `GET /api/auth/me` |
| Müşteri | `POST/GET/PUT /api/customers` |
| Lisans (admin) | `POST/GET/PUT /api/licenses`, suspend/cancel/renew/reset-device |
| Public | `POST /api/public/licenses/activate`, `POST /api/public/licenses/validate` |

## Testler

```powershell
cd C:\arrow-platform\backend
.\.venv\Scripts\Activate.ps1
pytest tests/test_platform_api.py -v
```

## Klasör yapısı

```
backend/
  app/
    main.py
    config.py
    database.py
    models.py
    schemas.py
    security.py
    auth_routes.py
    license_routes.py   # müşteri + lisans + public
    license_utils.py
    seed_admin.py
  alembic/
  requirements.txt
  .env.example
```
