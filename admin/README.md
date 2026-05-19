# Arrow Bilişim — Lisans Admin Paneli

Next.js yönetim arayüzü (`http://localhost:3001`).

## Gereksinimler

- Backend API: `http://127.0.0.1:9000`
- Node.js 20+

## Çalıştırma (Windows)

```powershell
# Terminal 1 — API
cd C:\arrow-platform\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 9000 --reload

# Terminal 2 — Admin panel
cd C:\arrow-platform\admin
copy .env.local.example .env.local
npm install
npm run dev
```

Tarayıcı: http://localhost:3001/login

## Ekranlar

- Login — JWT `localStorage.access_token`
- Dashboard — özet istatistikler
- Müşteriler — liste / oluştur / düzenle
- Lisanslar — liste / oluştur / detay (yenile, askıya al, iptal, cihaz sıfırla)
- Cihazlar — tüm kayıtlı cihazlar

## API

`NEXT_PUBLIC_API_URL` (varsayılan: `http://127.0.0.1:9000/api`)

Backend CORS’ta `http://localhost:3001` tanımlı olmalı (`backend/.env` → `CORS_ORIGINS`).
