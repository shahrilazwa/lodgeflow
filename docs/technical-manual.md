# LodgeFlow Technical Manual

This manual is for developers working on or maintaining the LodgeFlow codebase. It explains how the system works, how data flows, and how to make changes safely.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                            │
│                                                                 │
│  ┌──────────────┐       ┌──────────────────┐    ┌───────────┐  │
│  │  Frontend    │       │  Backend (API)   │    │ PostgreSQL│  │
│  │  React+Vite  │──────▶│  Laravel         │───▶│  :5432    │  │
│  │  :5173       │ HTTP  │  :8000           │    └───────────┘  │
│  └──────────────┘       └────────┬─────────┘                   │
│                                  │                              │
│                          ┌───────┴────────┐                     │
│                          │                │                     │
│                    ┌─────▼─────┐   ┌──────▼──────┐              │
│                    │   Redis   │   │  Queue      │              │
│                    │   :6379   │   │  Worker     │              │
│                    └───────────┘   └─────────────┘              │
│                                                                 │
│                    ┌─────────────┐                               │
│                    │  Mailpit    │                               │
│                    │  :8025/:1025│                               │
│                    └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### Services

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| frontend | React + Vite + TypeScript | 5173 | SPA user interface |
| api | Laravel (PHP 8.3) | 8000 | REST API, business logic |
| queue-worker | Laravel (same image) | — | Processes background jobs |
| db | PostgreSQL 16 | 5432 | Primary data store |
| redis | Redis 7 | 6379 | Queue broker + cache |
| mailpit | Mailpit | 8025/1025 | Local email testing |

---

## Backend Structure

### Modular Monolith

The backend is organized as a modular monolith under `backend/app/Modules/`:

```
app/Modules/
├── Property/          # Property CRUD
├── Unit/              # Unit CRUD (nested under Property)
├── Guest/             # Guest CRUD with search
├── Booking/           # Booking CRUD with status transitions
├── Payment/           # Payment/refund recording
├── Expense/           # Expense CRUD with multi-links
├── ServiceProvider/   # Service provider CRUD
├── CleaningTask/      # Cleaning task + queue job
├── MaintenanceTask/   # Maintenance task CRUD
└── Dashboard/         # Dashboard metrics
```

### Module Structure

Each module contains only what it needs:

```
{Module}/
├── Controllers/       # HTTP request handling
├── Services/          # Business logic
├── Models/            # Eloquent models
├── Requests/          # Form Request validation
├── Jobs/              # Queue jobs (only CleaningTask)
└── Routes/            # (not used — routes in routes/api.php)
```

**No Repository layer.** Services query Eloquent directly.

### Authentication

Auth controllers are in the standard Laravel location: `app/Http/Controllers/Auth/AuthController.php`

---

## Frontend Structure

```
frontend/src/
├── features/          # Feature-based modules (one per domain)
│   ├── auth/          # Login, Register, useAuth hook
│   ├── properties/    # Property pages + API hooks
│   ├── units/         # Unit pages + API hooks
│   ├── guests/        # Guest pages + API hooks
│   ├── bookings/      # Booking pages + API hooks
│   ├── payments/      # Payment section (embedded in booking detail)
│   ├── expenses/      # Expense pages + API hooks
│   ├── service-providers/
│   ├── cleaning-tasks/
│   ├── maintenance-tasks/
│   └── dashboard/     # Dashboard with independent loading cards
├── components/        # Shared components (AppShell, ProtectedLayout)
├── lib/               # Axios API client
├── types/             # Shared TypeScript types
├── routes/            # React Router configuration
└── styles/            # Global CSS
```

### Key Libraries

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 6 | Build tool + dev server |
| TypeScript | Type safety |
| TanStack Query | Server state management (API data fetching/caching) |
| React Router 7 | Client-side routing |
| Axios | HTTP client |
| MYDS | Malaysia Government Design System components |

---

## Database Schema

### Entity Relationship Overview

```
Owner (1) ──── (N) Property (1) ──── (N) Unit (1) ──── (N) Booking
                                                              │
Owner (1) ──── (N) Guest (1) ──────────────────────── (N) Booking
                                                              │
                                                    (1) ──── (N) Payment
                                                              │
Owner (1) ──── (N) Expense ──── (1) Property (required)
                    │              ├── Unit (optional)
                    │              ├── Booking (optional)
                    │              ├── ServiceProvider (optional)
                    │              ├── CleaningTask (optional)
                    │              └── MaintenanceTask (optional)
                    │
Owner (1) ──── (N) ServiceProvider
Owner (1) ──── (N) CleaningTask ──── (1) Unit, (0..1) Booking
Owner (1) ──── (N) MaintenanceTask ──── (0..1) Property, Unit, ServiceProvider
```

### Tables

| Table | Key Columns | Notes |
|-------|-------------|-------|
| owners | id, name, email, password | Auth user |
| properties | id, owner_id, name, address, is_active | |
| units | id, owner_id, property_id, name, type, is_active | UNIQUE(property_id, name) |
| guests | id, owner_id, full_name, phone | UNIQUE(owner_id, phone) |
| bookings | id, owner_id, unit_id, guest_id, dates, total_amount, status, payment_status, net_paid_amount | CHECK(check_out > check_in) |
| payments | id, owner_id, booking_id, type, amount, payment_date, payment_method | CHECK(amount > 0) |
| expenses | id, owner_id, property_id, + optional FKs, amount, date, category | CHECK(amount > 0) |
| service_providers | id, owner_id, name, service_type | UNIQUE(owner_id, name) |
| cleaning_tasks | id, owner_id, unit_id, booking_id, status, notes | |
| maintenance_tasks | id, owner_id, property_id, unit_id, service_provider_id, title, priority, status | |

---

## Authentication Flow

```
1. User submits login form (email + password)
2. Frontend Axios sends POST /api/v1/auth/login
3. Laravel validates credentials against owners table
4. Sanctum creates a personal_access_token
5. API returns plain text token
6. Frontend stores token in localStorage
7. All subsequent requests include: Authorization: Bearer <token>
8. Laravel Sanctum middleware validates token on each request
9. On logout: token is deleted from personal_access_tokens table
10. On 401 response: frontend clears localStorage and redirects to /login
```

---

## Owner Scoping

**Every record belongs to an owner.** All tables have an `owner_id` column.

### How it works:

1. **Service-layer filtering:** Every service method explicitly includes `->where('owner_id', $ownerId)` in queries
2. **Automatic assignment:** Records get `owner_id` set from the authenticated user on creation
3. **404 for cross-account access:** If owner A tries to access owner B's record, they get 404 (not 403)
4. **Queue jobs:** Receive `owner_id` as a constructor parameter (never use `auth()->id()` in jobs)

### Why not a Global Scope?

- Global scopes rely on `auth()->id()` which doesn't exist in queue/console contexts
- Explicit filtering is transparent and testable
- Better for a learning project where understanding data flow is important

---

## API Request Lifecycle

```
HTTP Request
    │
    ▼
Middleware: auth:sanctum (validates token, identifies owner)
    │
    ▼
Route matching (routes/api.php)
    │
    ▼
Form Request validation (if applicable)
    │ Returns 422 with field errors if invalid
    ▼
Controller method
    │ Calls service with validated data + owner ID
    ▼
Service (business logic)
    │ Queries database with explicit owner_id filtering
    │ Validates business rules (overlap, transitions, etc.)
    ▼
Eloquent Model → PostgreSQL
    │
    ▼
JSON Response returned to frontend
```

---

## Frontend Data Flow

```
User navigates to /bookings
    │
    ▼
React Router renders BookingsPage
    │
    ▼
useBookings() hook (TanStack Query)
    │ Checks cache → if stale, fetches
    ▼
Axios GET /api/v1/bookings
    │ Request interceptor adds Bearer token
    ▼
Laravel API processes request
    │
    ▼
JSON response received by Axios
    │ Response interceptor checks for 401
    ▼
TanStack Query caches response
    │
    ▼
React re-renders with data
```

---

## Booking Overlap Validation

Two bookings overlap if they're on the same unit and:
```
existing.check_in_date < new.check_out_date AND existing.check_out_date > new.check_in_date
```

Only `confirmed` and `checked_in` bookings are considered for overlap. Cancelled and checked-out bookings don't block new bookings.

Adjacent bookings (new starts on the day old ends) are allowed — they don't overlap.

---

## Booking Status Transitions

```
confirmed ──→ checked_in ──→ checked_out
    │              │
    └──→ cancelled ←┘
```

| From | To | Action |
|------|----|--------|
| confirmed | checked_in | Check In |
| confirmed | cancelled | Cancel |
| checked_in | checked_out | Check Out (dispatches cleaning job) |
| checked_in | cancelled | Cancel |

Invalid transitions return 422 with the current status and reason.

---

## Payment Status Derivation

```
net_paid_amount = SUM(payment amounts) - SUM(refund amounts)
```

| Condition | Status |
|-----------|--------|
| net = 0 | unpaid |
| 0 < net < total | partial |
| net = total | paid |
| net > total | overpaid |
| net < 0 | refunded |

Recalculated atomically on every payment create/delete via `PaymentService::recalculateBookingPaymentStatus()`.

Uses `bcmath` for decimal precision (no floating-point errors).

---

## Expense Multi-Link Validation

- **Property:** Required. Must belong to the authenticated owner.
- **Unit:** Optional. Must belong to the linked property AND the owner.
- **Booking:** Optional. Must belong to the owner.
- **Service Provider:** Optional. Must belong to the owner.
- **Cleaning Task:** Optional. FK constraint exists but validation deferred.
- **Maintenance Task:** Optional. FK constraint exists but validation deferred.

Multiple optional links can be set simultaneously on a single expense.

---

## Queue/Job Flow (Cleaning Task)

```
1. Owner checks out booking (PATCH /bookings/{id}/check-out)
2. BookingService updates status to checked_out
3. BookingService dispatches CreateCleaningTaskJob to Redis queue "cleaning-tasks"
4. API returns 200 immediately (user doesn't wait)
5. Queue worker picks up job from Redis
6. Job validates booking is still checked_out
7. Job checks no duplicate cleaning task exists for this booking
8. Job creates CleaningTask with status "pending"
9. If job fails: retries up to 3 times at 60-second intervals
10. After max retries: logs permanent failure for manual investigation
```

### Job Safety

- **Idempotent:** Checks for existing cleaning task before creating (prevents duplicates on retry)
- **Validates state:** Skips if booking is no longer checked_out
- **Explicit owner_id:** Passed as constructor parameter, never uses auth()

---

## CI Quality Gates

The GitHub Actions CI runs on every PR to main:

### Backend Job
1. Composer install
2. Migrations (PostgreSQL service container)
3. **Pint** — code style (Laravel preset)
4. **PHPStan** — static analysis (level 5 with Larastan)
5. **Tests** — all 567 tests (unit + feature + property-based)

### Frontend Job
1. npm ci
2. **ESLint** — linting
3. **TypeScript** — strict type check
4. **Build** — Vite production build

---

## Testing Strategy

| Type | Count | Location | Purpose |
|------|-------|----------|---------|
| Unit | 2 | tests/Unit/ | Model relationships |
| Feature | 215 | tests/Feature/ | API endpoint testing |
| Property-Based | 350 | tests/Property/ | Correctness properties with random inputs |
| Smoke | 27 checks | backend/scripts/smoke-test.sh | End-to-end workflow |

### Running Tests

```bash
# All tests
docker compose run --rm api php artisan test

# Specific suite
docker compose run --rm api php artisan test --testsuite=Feature
docker compose run --rm api php artisan test --testsuite=Property

# Specific module
docker compose run --rm api php artisan test --filter=Booking

# Quality gates
docker compose run --rm --no-deps api vendor/bin/pint --test
docker compose run --rm --no-deps api vendor/bin/phpstan analyse --memory-limit=512M
docker compose run --rm --no-deps frontend sh -c "npm run lint"
docker compose run --rm --no-deps frontend sh -c "npm run type-check"
docker compose run --rm --no-deps frontend sh -c "npm run build"
```

---

## Local Setup

```bash
# 1. Clone
git clone <repo-url>
cd lodgeflow

# 2. Start services
docker compose up -d

# 3. Set up backend .env
docker compose exec api bash -c "cp .env.example .env && php artisan key:generate"

# 4. Run migrations
docker compose run --rm api php artisan migrate:fresh

# 5. Restart queue worker
docker compose restart queue-worker

# 6. Access
# Frontend: http://localhost:5173
# API: http://localhost:8000/api/v1/health
# Mailpit: http://localhost:8025
```

---

## Common Developer Troubleshooting

### "Database file at path database.sqlite does not exist"
The container's `.env` has SQLite configured. Fix: `docker compose exec api bash -c "cp .env.example .env && php artisan key:generate"`

### Tests fail with "relation does not exist"
Run migrations: `docker compose run --rm api php artisan migrate:fresh`

### Queue worker not processing jobs
Check it's running: `docker compose ps`. Restart: `docker compose restart queue-worker`

### Frontend build fails with TypeScript errors
Run `docker compose run --rm --no-deps frontend sh -c "npm run type-check"` to see specific errors.

### PHPStan errors after adding new code
Run `docker compose run --rm --no-deps api vendor/bin/phpstan analyse --memory-limit=512M` and fix reported issues.

### Port conflicts
Change ports in `.env` at repo root (e.g., `API_PORT=8001`).

---

## GitHub Workflow

1. Pull latest main: `git checkout main && git pull`
2. Create feature branch: `git checkout -b feature/<name>`
3. Make changes, test locally
4. Commit: `git add -A && git commit -m "type: description"`
5. Push: `git push -u origin feature/<name>`
6. Open PR on GitHub
7. CI must pass (tests + quality gates)
8. Merge via squash merge
9. Delete branch

---

## Release Process (v1.0.0)

1. Ensure all milestones are closed on GitHub
2. Ensure CI is green on main
3. Tag the release: `git tag -a v1.0.0 -m "Release v1.0.0 - Owner MVP"`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub Release from the tag with release notes
6. Close the v1.0.0 milestone

---

## Known Limitations (MVP)

- Single owner role only (no multi-user, no cleaner/manager roles)
- No online payment gateway integration
- No guest self-service portal
- No mobile app
- No Airbnb/OTA sync
- No automated financial reports or tax exports
- No MongoDB (planned for future activity logs)
- No RabbitMQ or Kubernetes
- Cleaning/maintenance task validation for expense links is basic (FK only, no ownership check)
