# StudyOS - Study Operating System

A modern, production-ready personal study management platform. Organize PDFs, links, notes, subjects, chapters, and track study progress — all in one place.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, shadcn/ui, React Router, Axios, React Query, Zustand  
**Backend:** FastAPI, SQLAlchemy, Alembic, Pydantic, JWT Auth  
**Database:** Supabase PostgreSQL  
**Storage:** Supabase Storage (private bucket for PDFs)

---

## Features

- **Authentication** — JWT-based register/login, persistent sessions
- **Dashboard** — Analytics, progress charts, recent uploads, stats widgets
- **Subject Management** — Create/edit/delete subjects with color coding
- **Chapter Management** — Organize subjects into chapters
- **Resource Management** — Track PDFs, YouTube links, ChatGPT links, and notes
- **PDF Management** — Upload to Supabase Storage, signed URLs, secure access
- **Notes System** — Markdown editor with preview
- **Search + Filters** — Full-text search across all resources with type/status/importance filters
- **Study Progress** — Track status (Not Started, Studying, Completed, Revision Pending)
- **Dark Mode** — Full dark/light theme support
- **Responsive Design** — Mobile, tablet, desktop

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- Supabase account (free tier works)

---

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `backend/setup.sql`
3. Create a **Storage bucket** named `study-pdfs`:
   - Go to **Storage** → **New Bucket**
   - Name: `study-pdfs`
   - Public: **disabled** (private bucket)
   - Enable RLS
4. Create a storage policy for the bucket:
   - Go to **Storage** → **study-pdfs** → **Policies**
   - Add policy: `Allow authenticated users to read their own files: (auth.uid() = (storage.foldername(name))[1]::uuid)`
   - Add policy: `Allow authenticated users to upload their own files: (auth.uid() = (storage.foldername(name))[1]::uuid)`
   - Add policy: `Allow authenticated users to delete their own files: (auth.uid() = (storage.foldername(name))[1]::uuid)`
5. Get your credentials from **Project Settings** → **API**:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET_KEY=generate-a-random-secret-key
```

Run the backend:

```bash
# Tables are created automatically on startup
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/api/docs`

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
```

Edit `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`

---

## Project Structure

```
studyos/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic layer
│   │   ├── routers/         # API endpoints
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── utils/          # Security, Supabase helpers
│   │   ├── config.py       # Settings via env vars
│   │   ├── database.py     # DB connection
│   │   └── main.py         # FastAPI app entry
│   ├── alembic/            # DB migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── setup.sql           # Schema for Supabase
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   └── layout/     # Sidebar, Navbar, AppLayout
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # React Query hooks
│   │   ├── services/       # API service layer
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # cn() helper
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/subjects` | Create subject |
| GET | `/api/subjects` | List subjects |
| GET | `/api/subjects/{id}` | Get subject |
| PUT | `/api/subjects/{id}` | Update subject |
| DELETE | `/api/subjects/{id}` | Delete subject |
| POST | `/api/subjects/{id}/chapters` | Create chapter |
| GET | `/api/subjects/{id}/chapters` | List chapters |
| GET | `/api/subjects/{id}/chapters/{cid}` | Get chapter |
| PUT | `/api/subjects/{id}/chapters/{cid}` | Update chapter |
| DELETE | `/api/subjects/{id}/chapters/{cid}` | Delete chapter |
| POST | `/api/subjects/{id}/resources` | Create resource |
| GET | `/api/subjects/{id}/resources` | List resources |
| PUT | `/api/subjects/{id}/resources/{rid}` | Update resource |
| DELETE | `/api/subjects/{id}/resources/{rid}` | Delete resource |
| POST | `/api/pdfs/upload` | Upload PDF |
| GET | `/api/pdfs/{id}/signed-url` | Get signed PDF URL |
| DELETE | `/api/pdfs/{id}` | Delete PDF |
| POST | `/api/notes` | Create note |
| GET | `/api/notes` | List notes |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |
| GET | `/api/search` | Search resources |
| GET | `/api/analytics/dashboard` | Dashboard analytics |
| GET | `/api/health` | Health check |

---

## Running in Production

```bash
# Backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend
npm run build
# Serve dist/ with nginx or similar
```

## License

MIT
# StudyWallet
