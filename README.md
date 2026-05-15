# LodgeFlow

LodgeFlow is a property operations app for managing bookings, guests, payments, expenses, cleaning tasks, maintenance work, and business performance for small lodging or short-stay rental businesses.

This MVP targets a single owner/admin user managing their own properties.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Design System | MYDS (Malaysia Government Design System) |
| Backend | Laravel (latest stable) — modular monolith |
| Database | PostgreSQL 16 |
| Queue / Cache | Redis 7 |
| Queue Worker | Laravel queue worker container |
| Local Email | Mailpit |
| Containerisation | Docker Compose |
| CI | GitHub Actions |
| Auth | Laravel Sanctum (token-based) |

---

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git
- A GitHub account (for remote repository and project management)

No need to install PHP, Composer, Node, or npm directly on your machine — everything runs inside containers.

---

## Quick Start

```bash
# 1. Clone the repository
git clone <your-github-repo-url>
cd lodgeflow

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker compose up -d

# 4. Run backend migrations (first time only)
docker compose exec api php artisan migrate

# 5. Access the application
# Frontend:  http://localhost:5173
# API:       http://localhost:8000
# Mailpit:   http://localhost:8025
```

To stop all services:

```bash
docker compose down
```

---

## Folder Structure

```
lodgeflow/
├── .github/                       # GitHub Actions CI workflows
├── .kiro/specs/                   # Kiro spec files (requirements, design, tasks)
├── docs/                          # Project documentation
│   ├── adr/                       # Architecture Decision Records
│   └── github-workflow.md         # GitHub project management workflow
├── frontend/                      # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── features/             # Feature-based modules
│   │   ├── components/           # Shared/reusable components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # API client, utilities
│   │   ├── types/                # TypeScript type definitions
│   │   ├── routes/               # Route definitions
│   │   └── styles/               # Global styles
│   └── ...
├── backend/                       # Laravel API (modular monolith)
│   ├── app/
│   │   ├── Modules/              # Domain modules
│   │   │   ├── Property/
│   │   │   ├── Unit/
│   │   │   ├── Guest/
│   │   │   ├── Booking/
│   │   │   ├── Payment/
│   │   │   ├── Expense/
│   │   │   ├── ServiceProvider/
│   │   │   ├── CleaningTask/
│   │   │   ├── MaintenanceTask/
│   │   │   └── Dashboard/
│   │   ├── Http/Controllers/Auth/ # Authentication controllers
│   │   ├── Models/
│   │   └── Traits/
│   └── ...
├── docker/                        # Dockerfiles for each service
│   ├── frontend/
│   └── backend/
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Development Workflow

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/<issue-number>-<short-name>
   ```

2. **Start services** (if not already running):
   ```bash
   docker compose up -d
   ```

3. **Backend development** — code changes in `backend/` are volume-mounted and reflected immediately.

4. **Frontend development** — Vite hot-reloads on file changes in `frontend/`.

5. **Run backend tests**:
   ```bash
   docker compose exec api php artisan test
   ```

6. **Run frontend build check**:
   ```bash
   docker compose exec frontend npm run build
   ```

7. **Commit and push**, then open a PR to `main`.

8. **CI runs automatically** on PR — must pass before merge.

---

## Documentation

- [GitHub Workflow](docs/github-workflow.md) — milestones, labels, project board, branching, and release strategy
- [Architecture Decision Records](docs/adr/) — key technical decisions and rationale

---

## MVP Scope

The MVP covers:
- Property and unit management
- Guest records
- Manual booking management with status transitions
- Payment and refund tracking
- Expense tracking with multi-entity linking
- Service provider records
- Automated cleaning task creation on checkout (via queue)
- Maintenance task tracking
- Business performance dashboard

**Out of scope for MVP:** guest portal, cleaner portal, online payment gateway, Airbnb sync, mobile app, RabbitMQ, Kubernetes, MongoDB.

---

## License

No open-source license has been selected. All rights reserved.
