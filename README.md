# 📚 Library Management System

A full-stack Library Management System built with **Next.js 14** (TypeScript + Tailwind CSS) on the frontend and **Django + DRF** (PostgreSQL + JWT) on the backend.

---

## 🏗️ Architecture Overview

```
library-management-system/
├── library_backend/          # Django REST API
│   ├── library_backend/      # Django project config
│   ├── apps/
│   │   ├── users/            # Auth, user management, roles
│   │   ├── books/            # Book CRUD, categories
│   │   └── transactions/     # Borrow, return, fine calculation
│   ├── requirements.txt
│   ├── manage.py
│   ├── Dockerfile
│   └── .env.example
├── library_frontend/         # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/           # Login, Register pages
│   │   └── (dashboard)/      # Protected dashboard pages
│   ├── components/           # Reusable UI components
│   ├── services/             # Axios API service layer
│   ├── types/                # TypeScript type definitions
│   ├── hooks/                # Custom React hooks
│   ├── context/              # Auth context
│   ├── utils/                # Helpers, validation schemas
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🔧 Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, Axios, React Hook Form, Zod |
| Backend    | Django 4.2, Django REST Framework, Simple JWT           |
| Database   | PostgreSQL 15                                           |
| Auth       | JWT (Access + Refresh tokens, blacklisting)             |
| Docs       | drf-spectacular (Swagger / Redoc)                       |

---

## 🚀 Quick Start

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone/enter the project
cd "library management system"

# 2. Create backend .env (copy from example and edit)
cp library_backend/.env.example library_backend/.env

# 3. Create frontend .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > library_frontend/.env.local

# 4. Start all services
docker-compose up --build

# 5. Create a superuser (in a new terminal)
docker-compose exec backend python manage.py createsuperuser
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8000/api
- Swagger Docs → http://localhost:8000/api/docs/
- Django Admin → http://localhost:8000/admin/

---

### Option B — Local Development (Manual)

#### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

---

#### 1. Backend Setup

```bash
cd library_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials and SECRET_KEY
```

**Create PostgreSQL database:**
```sql
CREATE DATABASE library_db;
CREATE USER library_user WITH ENCRYPTED PASSWORD 'library_password';
GRANT ALL PRIVILEGES ON DATABASE library_db TO library_user;
```

```bash
# Run migrations
python manage.py migrate

# Create superuser (Admin)
python manage.py createsuperuser

# Seed sample data (optional)
python manage.py shell -c "
from apps.books.models import Category
Category.objects.bulk_create([
    Category(name='Fiction'),
    Category(name='Non-Fiction'),
    Category(name='Science'),
    Category(name='Technology'),
    Category(name='History'),
])
print('Categories created!')
"

# Start server
python manage.py runserver
```

Backend runs at → http://localhost:8000

---

#### 2. Frontend Setup

```bash
cd library_frontend

# Install dependencies
npm install

# Set up environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start dev server
npm run dev
```

Frontend runs at → http://localhost:3000

---

## 🔐 Authentication & Roles

| Role       | Permissions                                           |
|------------|-------------------------------------------------------|
| Admin      | Full access — manage users, books, all transactions   |
| Librarian  | Manage books, view/handle all transactions            |
| Student    | View & search books, borrow/return, view own history  |

**Default superuser** (created via `createsuperuser`) gets Admin role.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint                      | Access     |
|--------|-------------------------------|------------|
| POST   | /api/auth/register/           | Public     |
| POST   | /api/auth/login/              | Public     |
| POST   | /api/auth/logout/             | Auth       |
| POST   | /api/auth/token/refresh/      | Public     |
| GET    | /api/auth/profile/            | Auth       |
| PATCH  | /api/auth/profile/            | Auth       |
| PUT    | /api/auth/change-password/    | Auth       |

### Books
| Method | Endpoint                      | Access             |
|--------|-------------------------------|--------------------|
| GET    | /api/books/                   | Auth               |
| POST   | /api/books/                   | Librarian / Admin  |
| GET    | /api/books/{id}/              | Auth               |
| PATCH  | /api/books/{id}/              | Librarian / Admin  |
| DELETE | /api/books/{id}/              | Librarian / Admin  |
| GET    | /api/categories/              | Auth               |
| POST   | /api/categories/              | Librarian / Admin  |

### Transactions
| Method | Endpoint                      | Access             |
|--------|-------------------------------|--------------------|
| POST   | /api/borrow/                  | Auth               |
| POST   | /api/return/                  | Auth               |
| GET    | /api/my-transactions/         | Auth               |
| GET    | /api/transactions/            | Librarian / Admin  |
| GET    | /api/transactions/overdue/    | Librarian / Admin  |
| GET    | /api/transactions/stats/      | Admin              |

### Users (Admin only)
| Method | Endpoint                            | Access |
|--------|-------------------------------------|--------|
| GET    | /api/auth/users/                    | Admin  |
| GET    | /api/auth/users/{id}/               | Admin  |
| PATCH  | /api/auth/users/{id}/toggle-status/ | Admin  |
| PATCH  | /api/auth/users/{id}/update-role/   | Admin  |

---

## 💰 Fine Calculation

- Loan period: **14 days** (configurable via `LOAN_PERIOD_DAYS` env var)
- Fine per day: **₹5** (configurable via `FINE_PER_DAY` env var)
- Fine = `FINE_PER_DAY × overdue_days`

---

## 🗄️ Database Schema

```
User                    Book                     Transaction
────────────────        ─────────────────────    ─────────────────────────
id (PK)                 id (PK)                  id (PK)
email (unique)          title                    user_id (FK → User)
first_name              author                   book_id (FK → Book)
last_name               isbn (unique)            issue_date
phone                   category_id (FK)         due_date
role                    description              return_date
is_active               publisher                status
is_staff                publication_year         fine_amount
date_joined             total_copies             notes
                        available_copies         created_at
Category                created_at               updated_at
────────────────        updated_at
id (PK)
name (unique)
description
```

---

## 🔑 Environment Variables

### Backend (`library_backend/.env`)
```
SECRET_KEY=your-very-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=library_db
DB_USER=library_user
DB_PASSWORD=library_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
FINE_PER_DAY=5
LOAN_PERIOD_DAYS=14
```

### Frontend (`library_frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 📦 Production Build

```bash
# Backend
gunicorn library_backend.wsgi:application --bind 0.0.0.0:8000 --workers 4

# Frontend
npm run build
npm start
```

---

## 🧪 Testing the API (Swagger)

After starting the backend, visit:
- **Swagger UI** → http://localhost:8000/api/docs/
- **Redoc** → http://localhost:8000/api/redoc/

Use the "Authorize" button to add your JWT Bearer token.

---

## 🐙 GitHub Setup

### 1. Initialize and push to GitHub

```bash
# From the project root
git init
git add .
git commit -m "feat: initial commit — Library Management System"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/library-management-system.git
git branch -M main
git push -u origin main
```

> **Note:** The `.gitignore` already excludes `.env`, `node_modules/`, `.next/`, `staticfiles/`, and `media/`. Migration files **are** tracked intentionally.

### 2. GitHub Actions CI

Every push to `main` or `develop` automatically triggers three parallel CI jobs:

| Job | What it does |
|-----|-------------|
| **Backend (Django)** | Spins up PostgreSQL, runs `manage.py test` |
| **Frontend (Next.js)** | TypeScript type-check (`tsc --noEmit`) + production build |
| **Docker Build Check** | Builds both Docker images (runs after both above pass) |

Workflow file: `.github/workflows/ci.yml`

Add this badge to the top of your README to show CI status:

```markdown
![CI](https://github.com/YOUR_USERNAME/library-management-system/actions/workflows/ci.yml/badge.svg)
```

---

## ☁️ Deploy to Render (Free Tier)

The `render.yaml` blueprint at the project root defines all three services. Render will read it automatically and provision everything for you.

### Step-by-step

**1. Push your code to GitHub** (see above).

**2. Sign up / log in at [render.com](https://render.com).**

**3. Create a new Blueprint:**
- Dashboard → **New** → **Blueprint**
- Connect your GitHub account and select the `library-management-system` repo
- Render detects `render.yaml` and shows the three services: `library-postgres`, `library-backend`, `library-frontend`
- Click **Apply** — Render creates and deploys all three automatically

**4. Wait for the first deploy** (~5–10 min on free tier). Watch the logs in the Render dashboard.

**5. Update CORS after deploy:**

Once your frontend URL is known (e.g. `https://library-frontend.onrender.com`), update the backend service's `CORS_ALLOWED_ORIGINS` env var in the Render dashboard:

```
CORS_ALLOWED_ORIGINS = https://library-frontend.onrender.com
```

Then trigger a manual redeploy of the backend service.

**6. Create the first Admin user:**

In the Render dashboard, open the `library-backend` service → **Shell** tab:

```bash
python manage.py createsuperuser
```

### Live URLs (after deploy)

| Service | URL |
|---------|-----|
| Frontend | `https://library-frontend.onrender.com` |
| Backend API | `https://library-backend.onrender.com/api` |
| Swagger Docs | `https://library-backend.onrender.com/api/docs/` |

> **Free tier note:** Render free services spin down after 15 minutes of inactivity and take ~30 seconds to wake on the next request. Upgrade to a paid plan for always-on services.

### Environment variables managed by Render

| Variable | How it's set |
|----------|-------------|
| `SECRET_KEY` | Auto-generated by Render (`generateValue: true`) |
| `DB_*` (host, port, user, password, name) | Auto-injected from the `library-postgres` database |
| `NEXT_PUBLIC_API_URL` | Set in `render.yaml` — update if your backend slug differs |

---

## 🔄 CI → Auto-Deploy Flow

```
git push origin main
      │
      ▼
GitHub Actions CI
  ├── Backend tests pass ✓
  ├── Frontend build pass ✓
  └── Docker images build ✓
      │
      ▼
Render detects push → auto-deploys backend & frontend
```

Render watches your `main` branch by default. Every successful push that passes CI will trigger an automatic redeploy on Render.
