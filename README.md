# LodgeFlow

LodgeFlow is a property operations app for managing bookings, guests, payments, expenses, cleaning tasks, maintenance work, and business performance for small lodging or short-stay rental businesses.

This is the **Owner MVP** — a single-owner admin interface covering the complete operational workflow.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 6 + TypeScript |
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

## Quick Start

```bash
# 1. Clone the repository
git clone <your-github-repo-url>
cd lodgeflow

# 2. Start all services
docker compose up -d

# 3. Set up backend environment
docker compose exec api bash -c "cp .env.example .env && php artisan key:generate"

# 4. Run database migrations
docker compose run --rm api php artisan migrate:fresh

# 5. Restart queue worker
docker compose restart queue-worker

# 6. Access the application
# Frontend:  http://localhost:5173
# API:       http://localhost:8000/api/v1/health
# Mailpit:   http://localhost:8025
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [User Manual](docs/user-manual.md) | Step-by-step guide for homestay owners using the app |
| [Technical Manual](docs/technical-manual.md) | Developer guide: architecture, data flow, implementation details |
| [API Reference](docs/api.md) | All API endpoints with request/response examples |
| [GitHub Workflow](docs/github-workflow.md) | Milestones, labels, branching, and release strategy |
| [Architecture Decision Records](docs/adr/) | Key technical decisions and rationale |
| [Smoke Test Results](docs/smoke-test-results.md) | End-to-end workflow verification |
| [Changelog](CHANGELOG.md) | Version history with all changes |

---

## MVP Modules

| Module | Description |
|--------|-------------|
| Properties | Manage lodging establishments |
| Units | Manage rooms/spaces within properties |
| Guests | Record guest contact information |
| Bookings | Manage reservations with status transitions |
| Payments | Record payments and refunds, track payment status |
| Expenses | Track business costs with multi-entity linking |
| Service Providers | Manage external vendors |
| Cleaning Tasks | Auto-created on checkout, track cleaning progress |
| Maintenance Tasks | Track repairs and upkeep |
| Dashboard | Business performance summary |

---

## Development Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Run backend tests
docker compose run --rm api php artisan test

# Run quality gates
docker compose run --rm --no-deps api vendor/bin/pint --test
docker compose run --rm --no-deps api vendor/bin/phpstan analyse --memory-limit=512M
docker compose run --rm --no-deps frontend sh -c "npm run lint"
docker compose run --rm --no-deps frontend sh -c "npm run type-check"
docker compose run --rm --no-deps frontend sh -c "npm run build"

# Run smoke test
docker compose exec api bash scripts/smoke-test.sh

# Fresh database
docker compose run --rm api php artisan migrate:fresh
```

---

## Project Structure

```
lodgeflow/
├── backend/                    # Laravel API (modular monolith)
│   ├── app/Modules/           # Domain modules (10 modules)
│   ├── database/migrations/   # Database schema
│   ├── routes/api.php         # All API routes
│   ├── tests/                 # Unit, Feature, Property-based tests
│   └── scripts/               # Smoke test script
├── frontend/                   # React + Vite + TypeScript SPA
│   └── src/features/          # Feature-based UI modules
├── docker/                     # Dockerfiles
├── docs/                       # Documentation
├── .github/workflows/          # CI pipeline
├── docker-compose.yml          # Service definitions
└── CHANGELOG.md               # Version history
```

---

## Testing

| Type | Count | Purpose |
|------|-------|---------|
| Unit Tests | 2 | Model relationships |
| Feature Tests | 215 | API endpoint testing |
| Property-Based Tests | 350 | Correctness with random inputs |
| Smoke Test | 27 checks | End-to-end workflow |
| **Total** | **567 automated + 27 smoke** | |

---

## Out of Scope (MVP)

- Guest self-service portal
- Cleaner/manager login
- Online payment gateway (Stripe, FPX)
- Airbnb/OTA sync
- Mobile app
- Multi-user roles
- MongoDB
- RabbitMQ / Kubernetes

---

## License

Private project. All rights reserved.
