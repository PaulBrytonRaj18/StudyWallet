# StudyWallet — Study Operating System

> Production-ready personal study management platform. Organize PDFs, links, notes, subjects, chapters, and track study progress.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, shadcn/ui, React Router 6, React Query 5, Zustand |
| **Backend** | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, JWT (jose), bcrypt |
| **Database** | Supabase PostgreSQL (or any PostgreSQL 14+) |
| **File Storage** | Supabase Storage (private bucket, signed URLs) |
| **Infrastructure** | Docker, Docker Compose, Nginx, GitHub Actions CI |

## Architecture

```
Client (Browser)
    │
    ▼
Nginx Reverse Proxy (port 80/443)
    │
    ├── /api/* ──────► FastAPI Backend (port 8000)
    │                      │
    │                      ├── Supabase PostgreSQL
    │                      └── Supabase Storage (PDFs)
    │
    └── /* ──────────► Vite Static Files
```

### PDF Storage Architecture

```
User uploads PDF
    │
    ▼
FastAPI validates: JWT → MIME type → file size (20MB max)
    │
    ├── Uploads to Supabase Storage (private bucket: study-pdfs)
    │   └── Path: users/{user_id}/{userid_timestamp_random.pdf}
    │
    └── Stores metadata in PostgreSQL:
        ├── title, description, pdf_url, file_name, file_size
        ├── user_id, subject_id, chapter_id
        └── tags, status, importance
```

## Quick Start (Development)

### 1. Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase account (free tier)

### 2. Supabase Setup

```bash
# 1. Create a new Supabase project at https://supabase.com
# 2. Go to SQL Editor and paste + run backend/setup.sql
# 3. Create Storage bucket:
#    - Name: study-pdfs
#    - Public: OFF (private bucket)
#    - Add RLS policy:
#      CREATE POLICY "Users access their own files"
#      ON storage.objects FOR ALL USING (
#        auth.role() = 'service_role' OR
#        (storage.foldername(name))[1] = auth.uid()::text
#      );
# 4. Get credentials from Project Settings → API
```

### 3. Backend

```bash
cd backend

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

cp .env.example .env
# Edit .env with your Supabase credentials

pip install -r requirements.txt

# Seed demo data (optional)
python -m scripts.seed

# Start development server
uvicorn app.main:app --reload --port 8000

# API docs: http://localhost:8000/api/docs
# Health:    http://localhost:8000/api/health
```

### 4. Frontend

```bash
cd frontend

cp .env.example .env

npm install
npm run dev

# App: http://localhost:5173
```

## Production Deployment

### Using Docker Compose (Recommended)

```bash
# 1. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with production credentials

# 2. Build and start
docker compose build
docker compose up -d

# 3. Seed database (first time only)
docker compose exec backend python -m scripts.seed

# Application: http://localhost:80
# API:         http://localhost:8000/api/docs
```

### Manual Deployment

```bash
# Backend
cd backend
pip install -r requirements.txt
gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 120 \
    --max-requests 1000

# Frontend
cd frontend
npm run build
# Serve dist/ with Nginx (see infra/nginx/)
```

### Nginx Configuration

See `infra/nginx/api.conf` for the API server configuration and `frontend/nginx.conf` for the SPA configuration with API proxy.

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yml`:

- **Lint Backend**: ruff (lint + format)
- **Lint Frontend**: TypeScript type checking
- **Test Backend**: pytest with PostgreSQL service container
- **Build Frontend**: production build
- **Docker**: compose build validation

## Security Features

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT (access + refresh tokens) |
| Password Policy | Min 8 chars, uppercase, lowercase, digit, special char |
| Rate Limiting | 100 req/hour general, 10/min auth endpoints |
| Security Headers | HSTS, X-Content-Type-Options, X-Frame-Options, XSS Protection |
| Request ID | Every request tracked via X-Request-ID header |
| PDF Access | Signed URLs with 1-hour expiry; user-scoped paths |
| SQL Injection | Prevented by SQLAlchemy ORM |
| XSS | Prevented by React's automatic escaping |
| CORS | Whitelist-based origin restriction |
| File Upload | MIME type validation, size limit, sanitized filenames |

## API Reference

Full interactive docs at `/api/docs` or `/api/redoc` when backend is running.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user profile |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/change-password` | Change password |

### Subjects

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subjects` | Create subject |
| GET | `/api/subjects` | List all subjects |
| GET | `/api/subjects/{id}` | Get subject details |
| PUT | `/api/subjects/{id}` | Update subject |
| DELETE | `/api/subjects/{id}` | Delete subject |

### Chapters

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subjects/{id}/chapters` | Create chapter |
| GET | `/api/subjects/{id}/chapters` | List chapters |
| PUT | `/api/subjects/{id}/chapters/{cid}` | Update chapter |
| DELETE | `/api/subjects/{id}/chapters/{cid}` | Delete chapter |

### Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subjects/{id}/resources` | Create resource |
| GET | `/api/subjects/{id}/resources` | List resources (with filters) |
| PUT | `/api/subjects/{id}/resources/{rid}` | Update resource |
| DELETE | `/api/subjects/{id}/resources/{rid}` | Delete resource |

### PDFs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pdfs/upload` | Upload PDF (multipart) |
| GET | `/api/pdfs/{id}/signed-url` | Get secure PDF URL |
| DELETE | `/api/pdfs/{id}` | Delete PDF |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notes` | Create note |
| GET | `/api/notes` | List notes |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |

### Search & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Full-text search with filters |
| GET | `/api/analytics/dashboard` | Dashboard stats & charts |

## Project Structure

```
studyos/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── services/        # Business logic layer
│   │   ├── routers/         # FastAPI route handlers
│   │   ├── middleware/      # Auth, logging, security, error handling
│   │   ├── utils/           # JWT, bcrypt, Supabase storage
│   │   ├── config.py        # Environment-based settings
│   │   ├── database.py      # Engine + session factory
│   │   └── main.py          # App entry point
│   ├── alembic/             # Database migrations
│   ├── tests/               # pytest integration tests
│   ├── scripts/             # seed.py for demo data
│   ├── Dockerfile
│   ├── pyproject.toml       # Ruff, mypy, pytest config
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui primitives
│   │   │   └── layout/      # Sidebar, Navbar, AppLayout
│   │   ├── pages/           # Route-level components
│   │   ├── hooks/           # React Query hooks
│   │   ├── services/        # Axios API layer
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript definitions
│   ├── Dockerfile
│   ├── nginx.conf           # Production Nginx config
│   └── package.json
├── infra/nginx/             # Production Nginx configs
├── .github/workflows/       # GitHub Actions CI
├── docker-compose.yml       # Production orchestration
└── .pre-commit-config.yaml
```

## Database Schema

```
users (id, email, username, hashed_password, full_name, ...)
  │
  ├── subjects (id, name, description, color, user_id)
  │     │
  │     ├── chapters (id, name, description, order, subject_id)
  │     │     │
  │     │     └── resources (id, title, type, status, importance, chapter_id)
  │     │
  │     └── resources (id, title, type, status, importance, subject_id)
  │
  ├── resource_tags (id, resource_id, tag)
  │
  └── notes (id, title, content, is_markdown, subject_id, chapter_id)
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | — | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | — | Supabase service_role key |
| `JWT_SECRET_KEY` | Yes | — | Random 64+ char secret |

Full list in `backend/.env.example`.

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | API base URL |

## Maintenance

### Database Migrations

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "description"

# Apply pending migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1

# View history
alembic history
```

### Backup

```bash
# Database backup
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d).sql

# Storage backup (using Supabase CLI)
npx supabase storage download study-pdfs ./backup_pdfs/
```

## License

MIT
