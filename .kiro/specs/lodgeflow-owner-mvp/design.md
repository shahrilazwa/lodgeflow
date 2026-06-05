# Design Document — LodgeFlow Owner MVP

## Overview

LodgeFlow Owner MVP is a web application for small lodging and short-stay rental owners to manage their day-to-day operations. The system provides a single-owner admin interface covering property/unit management, guest records, booking lifecycle, payment tracking, expense recording, service provider contacts, automated cleaning task scheduling, maintenance task tracking, and a business performance dashboard.

The architecture is a monorepo containing a React + Vite SPA frontend and a Laravel modular-monolith API backend. All data is stored in PostgreSQL, background jobs use Laravel queues backed by Redis, and local email testing uses Mailpit. The entire stack runs in Docker Compose for local development.

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Modular monolith (Laravel) | Keeps deployment simple for a learning project while enforcing domain boundaries |
| React + Vite with MYDS | Fast DX; MYDS provides government-standard UI primitives for Malaysian context |
| PostgreSQL | Robust relational DB with good JSON support for future flexibility |
| Redis for queue/cache | Lightweight, well-supported by Laravel out of the box |
| Single owner auth | MVP scope — no multi-tenancy complexity |
| Docker Compose | Reproducible local environment with zero host dependencies |

---

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                            │
│                                                                 │
│  ┌──────────────┐       ┌──────────────────┐    ┌───────────┐  │
│  │  Frontend    │       │  Backend (API)   │    │ PostgreSQL│  │
│  │  React+Vite  │──────▶│  Laravel (latest) │───▶│  :5432    │  │
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

### Service Responsibilities

| Service | Role |
|---------|------|
| Frontend | SPA serving the owner dashboard and all CRUD interfaces |
| Backend (API) | RESTful JSON API, authentication, validation, business logic |
| PostgreSQL | Primary data store for all application data |
| Redis | Queue broker for background jobs; application cache |
| Queue Worker | Processes deferred jobs (e.g., cleaning task creation) |
| Mailpit | Catches outbound emails in local dev (SMTP on :1025, UI on :8025) |

---

## Components and Interfaces

### Monorepo / Folder Structure

```
lodgeflow/
├── docker-compose.yml
├── .env.example
├── README.md
├── frontend/                      # React + Vite SPA
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── routes/
│       ├── components/            # Shared/reusable components
│       ├── features/              # Feature-based modules
│       │   ├── auth/
│       │   ├── properties/
│       │   ├── units/
│       │   ├── guests/
│       │   ├── bookings/
│       │   ├── payments/
│       │   ├── expenses/
│       │   ├── service-providers/
│       │   ├── cleaning-tasks/
│       │   ├── maintenance-tasks/
│       │   └── dashboard/
│       ├── hooks/
│       ├── lib/                   # API client, utilities
│       ├── types/
│       └── styles/
├── backend/                       # Laravel API (latest stable)
│   ├── composer.json
│   ├── artisan
│   ├── app/
│   │   ├── Modules/               # Modular monolith domains
│   │   │   ├── Property/
│   │   │   ├── Booking/
│   │   │   ├── Payment/
│   │   │   ├── Expense/
│   │   │   ├── ServiceProvider/
│   │   │   ├── CleaningTask/
│   │   │   ├── MaintenanceTask/
│   │   │   ├── Guest/
│   │   │   └── Dashboard/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Middleware/
│   │   └── Models/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   ├── tests/
│   │   ├── Unit/
│   │   ├── Feature/
│   │   └── Property/             # Property-based tests
│   └── storage/
└── docker/
    ├── frontend/
    │   └── Dockerfile
    ├── backend/
    │   └── Dockerfile
    └── nginx/                     # Optional reverse proxy config
```

### Backend Module Structure (per module)

Each module under `app/Modules/{ModuleName}/` includes only the Laravel pieces it actually needs. Not every module requires all folders.

```
{ModuleName}/
├── Controllers/
│   └── {ModuleName}Controller.php
├── Requests/                      # Form Requests for validation
│   └── Store{ModuleName}Request.php
│   └── Update{ModuleName}Request.php
├── Services/                      # Only where business logic is non-trivial
│   └── {ModuleName}Service.php
├── Models/
│   └── {ModuleName}.php
├── Policies/                      # Only where authorization checks are needed
│   └── {ModuleName}Policy.php
├── Jobs/                          # Only where background processing is needed (e.g., CleaningTask)
│   └── Create{ModuleName}Job.php
├── Events/                        # Only where needed
└── Routes/
    └── api.php                    # Module-specific route file
```

**Note:** Repository classes are intentionally excluded from the MVP structure. For simple CRUD modules, the Service class can query models directly via Eloquent. Repositories may be introduced later only if a real need appears (e.g., complex query reuse across multiple services, or swapping data sources).

### Docker Compose Services

```yaml
services:
  frontend:
    build: ./docker/frontend
    ports: ["5173:5173"]
    volumes: ["./frontend:/app"]
    depends_on: [api]

  api:
    build: ./docker/backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app"]
    environment:
      DB_HOST: db
      REDIS_HOST: redis
      MAIL_HOST: mailpit
    depends_on: [db, redis, mailpit]

  queue-worker:
    build: ./docker/backend
    command: php artisan queue:work redis --tries=3 --backoff=60
    volumes: ["./backend:/app"]
    depends_on: [api, redis]

  db:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: lodgeflow
      POSTGRES_USER: lodgeflow
      POSTGRES_PASSWORD: secret
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  mailpit:
    image: axllent/mailpit
    ports: ["8025:8025", "1025:1025"]

volumes:
  pgdata:
```

### Environment Configuration

- A `.env.example` file is provided at the repository root with all required environment variables and safe default values for local Docker development.
- Developers copy `.env.example` to `.env` for local use. The real `.env` file is listed in `.gitignore` and must never be committed.
- The backend also has its own `.env.example` under `backend/` with Laravel-specific variables (DB, Redis, Mail, Queue settings).
- A `.env.testing` file is provided for CI and test environments with test-specific database credentials.

### Frontend Structure Details

**Routing**: React Router v6 with a protected layout wrapper that checks auth state.

**State Management**: TanStack Query (React Query) for server state (API data fetching, caching, mutations). Local UI state managed with React `useState`/`useReducer`. No global state library needed for MVP.

**API Client**: Axios instance with base URL pointing to the Laravel API, interceptors for auth token injection and 401 handling.

### MYDS Frontend Usage Approach

MYDS (Malaysia Government Design System) provides React components via `@govtechmy/myds-react` and styles via `@govtechmy/myds-style`.

**Use MYDS for:**
- Buttons, form inputs, selects, checkboxes, radio buttons
- Typography and spacing tokens
- Alerts and toast notifications
- Navigation bar / header
- Cards and containers
- Pagination
- Badges and status indicators
- Modal dialogs

**Build custom (using MYDS tokens/styles):**
- Dashboard summary cards with KPI metrics
- Calendar/date-range pickers (if MYDS doesn't provide one, use a compatible library styled with MYDS tokens)
- Data tables with sorting/filtering (wrap a headless table library with MYDS styling)
- Booking timeline/calendar view
- Property photo galleries and amenities display on listing and detail pages
- Multi-link entity selector for Expenses

**Approach:**
1. Import MYDS stylesheet globally in `main.tsx`
2. Use MYDS React components as primary building blocks
3. Extend with Tailwind CSS utility classes where MYDS doesn't cover a specific layout need
4. Keep custom components visually consistent with MYDS design tokens (colors, spacing, typography)

---

## Data Models

### Database Schema — Main Tables

All tenant-scoped tables include `owner_id` as a foreign key to the `owners` table.

#### owners

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(254) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL |
| email_verified_at | TIMESTAMP | NULLABLE |
| remember_token | VARCHAR(100) | NULLABLE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### properties

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| name | VARCHAR(100) | NOT NULL |
| address | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE (max 1000 chars enforced at app level) |
| amenities | JSON | NULLABLE (array of strings enforced at app level) |
| is_active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### property_images

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| property_id | BIGINT (FK → properties) | NOT NULL, INDEX |
| url | VARCHAR(255) | NOT NULL |
| caption | VARCHAR(255) | NULLABLE |
| is_primary | BOOLEAN | NOT NULL, DEFAULT false |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### units

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| property_id | BIGINT (FK → properties) | NOT NULL, INDEX |
| name | VARCHAR(100) | NOT NULL |
| type | VARCHAR(20) | NOT NULL (enum: room, suite, dormitory_bed, entire_unit) |
| bed_count | SMALLINT | NOT NULL, DEFAULT 1 |
| max_occupancy | SMALLINT | NOT NULL, DEFAULT 1 |
| description | TEXT | NULLABLE (max 500 chars at app level) |
| is_active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| | | UNIQUE(property_id, name) |

#### guests

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| full_name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(15) | NOT NULL |
| email | VARCHAR(254) | NULLABLE |
| address | VARCHAR(255) | NULLABLE |
| identification_number | VARCHAR(50) | NULLABLE |
| rating | SMALLINT | NULLABLE, CHECK(rating BETWEEN 1 AND 5) |
| profile_notes | TEXT | NULLABLE (max 1000 chars at app level) |
| profile_status | VARCHAR(20) | NOT NULL, DEFAULT 'neutral' (enum: neutral, recurring, blacklisted) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| | | UNIQUE(owner_id, phone) |

#### bookings

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| unit_id | BIGINT (FK → units) | NOT NULL, INDEX |
| guest_id | BIGINT (FK → guests) | NOT NULL, INDEX |
| check_in_date | DATE | NOT NULL |
| check_out_date | DATE | NOT NULL |
| total_amount | DECIMAL(12,2) | NOT NULL |
| expected_occupancy | SMALLINT | NOT NULL, DEFAULT 1 |
| special_requests | TEXT | NULLABLE (max 500 chars at app level) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' (enum: pending, confirmed, checked_in, checked_out, cancelled) |
| payment_status | VARCHAR(20) | NOT NULL, DEFAULT 'unpaid' (enum: unpaid, partial, paid, overpaid, refunded) |
| net_paid_amount | DECIMAL(12,2) | NOT NULL, DEFAULT 0.00 |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| | | CHECK(check_out_date > check_in_date) |

#### payments

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| booking_id | BIGINT (FK → bookings) | NOT NULL, INDEX |
| type | VARCHAR(10) | NOT NULL (enum: payment, refund) |
| amount | DECIMAL(12,2) | NOT NULL, CHECK(amount > 0) |
| payment_date | DATE | NOT NULL |
| payment_method | VARCHAR(20) | NOT NULL (enum: cash, bank_transfer, other) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### expenses

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| property_id | BIGINT (FK → properties) | NOT NULL, INDEX |
| unit_id | BIGINT (FK → units) | NULLABLE, INDEX |
| booking_id | BIGINT (FK → bookings) | NULLABLE, INDEX |
| service_provider_id | BIGINT (FK → service_providers) | NULLABLE, INDEX |
| cleaning_task_id | BIGINT (FK → cleaning_tasks) | NULLABLE, INDEX |
| maintenance_task_id | BIGINT (FK → maintenance_tasks) | NULLABLE, INDEX |
| amount | DECIMAL(12,2) | NOT NULL, CHECK(amount > 0) |
| date | DATE | NOT NULL |
| category | VARCHAR(30) | NOT NULL |
| description | TEXT | NULLABLE (max 500 chars at app level) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**Expense categories** (enforced at app level): utility_bills, maintenance, cleaning_services, laundry_services, supplies, internet, platform_fees, repairs, insurance, tax, other.

#### service_providers

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| name | VARCHAR(100) | NOT NULL |
| service_type | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | NULLABLE |
| notes | TEXT | NULLABLE (max 1000 chars at app level) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| | | UNIQUE(owner_id, name) |

*Represents a contractor, vendor, or individual paid directly by the owner. Service provider records are used for expense tracking and maintenance task assignment.*

#### cleaning_tasks

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| unit_id | BIGINT (FK → units) | NOT NULL, INDEX |
| booking_id | BIGINT (FK → bookings) | NULLABLE, INDEX |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' (enum: pending, in_progress, completed) |
| notes | TEXT | NULLABLE (max 1000 chars at app level) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### maintenance_tasks

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT (PK) | auto-increment |
| owner_id | BIGINT (FK → owners) | NOT NULL, INDEX |
| property_id | BIGINT (FK → properties) | NULLABLE, INDEX |
| unit_id | BIGINT (FK → units) | NULLABLE, INDEX |
| service_provider_id | BIGINT (FK → service_providers) | NULLABLE, INDEX |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULLABLE |
| priority | VARCHAR(10) | NOT NULL (enum: low, medium, high) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'open' (enum: open, in_progress, completed, cancelled) |
| scheduled_date | DATE | NULLABLE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### Main Model Relationships (Eloquent)

```
Owner
  ├── hasMany → Property
  ├── hasMany → Unit
  ├── hasMany → Guest
  ├── hasMany → Booking
  ├── hasMany → Payment
  ├── hasMany → Expense
  ├── hasMany → ServiceProvider
  ├── hasMany → CleaningTask
  └── hasMany → MaintenanceTask

Property
  ├── belongsTo → Owner
  ├── hasMany → Unit
  ├── hasMany → Expense
  └── hasMany → MaintenanceTask

Unit
  ├── belongsTo → Owner
  ├── belongsTo → Property
  ├── hasMany → Booking
  ├── hasMany → CleaningTask
  ├── hasMany → MaintenanceTask
  └── hasMany → Expense

Guest
  ├── belongsTo → Owner
  └── hasMany → Booking

Booking
  ├── belongsTo → Owner
  ├── belongsTo → Unit
  ├── belongsTo → Guest
  ├── hasMany → Payment
  ├── hasMany → Expense
  └── hasOne → CleaningTask

Payment
  ├── belongsTo → Owner
  └── belongsTo → Booking

Expense
  ├── belongsTo → Owner
  ├── belongsTo → Property (required)
  ├── belongsTo → Unit (optional)
  ├── belongsTo → Booking (optional)
  ├── belongsTo → ServiceProvider (optional)
  ├── belongsTo → CleaningTask (optional)
  └── belongsTo → MaintenanceTask (optional)

ServiceProvider
  ├── belongsTo → Owner
  ├── hasMany → Expense
  └── hasMany → MaintenanceTask

CleaningTask
  ├── belongsTo → Owner
  ├── belongsTo → Unit
  ├── belongsTo → Booking (optional)
  └── hasMany → Expense

MaintenanceTask
  ├── belongsTo → Owner
  ├── belongsTo → Property (optional)
  ├── belongsTo → Unit (optional)
  ├── belongsTo → ServiceProvider (optional)
  └── hasMany → Expense
```

---

## API Endpoint Plan

All endpoints are prefixed with `/api/v1` and require authentication (except login/register).

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new owner account |
| POST | /auth/login | Login, returns API token |
| POST | /auth/logout | Revoke current token |
| GET | /auth/me | Get authenticated owner profile |

### Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /properties | List all owner's properties |
| POST | /properties | Create a new property (supports amenities and image upload) |
| GET | /properties/{id} | Get property details, including amenities and image URLs |
| PUT | /properties/{id} | Update property details, amenities, and images |
| POST | /properties/{id}/images | Upload a property image |
| DELETE | /properties/{id}/images/{imageId} | Delete a property image |
| PATCH | /properties/{id}/deactivate | Deactivate property |
| PATCH | /properties/{id}/activate | Reactivate property |

### Units

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /properties/{propertyId}/units | List units for a property |
| POST | /properties/{propertyId}/units | Create a unit under a property (includes bed count and occupancy) |
| GET | /units/{id} | Get unit details (includes bed count and max occupancy) |
| PUT | /units/{id} | Update unit details, including bed count and occupancy |
| PATCH | /units/{id}/deactivate | Deactivate unit |
| PATCH | /units/{id}/activate | Reactivate unit |

### Guests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /guests | List/search/filter guests by name, phone, and profile status |
| POST | /guests | Create guest record |
| GET | /guests/{id} | Get guest profile with bookings |
| PUT | /guests/{id} | Update guest |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /bookings | List bookings filterable by status, unit, and check-in date range |
| POST | /bookings | Create booking (includes expected occupancy, special requests, and guest identity/contact details) |
| GET | /bookings/{id} | Get booking details with payments, expected occupancy, and special requests |
| PUT | /bookings/{id} | Update booking dates, amount, occupancy, and requests |
| PATCH | /bookings/{id}/check-in | Transition to checked_in |
| PATCH | /bookings/{id}/check-out | Transition to checked_out |
| PATCH | /bookings/{id}/cancel | Transition to cancelled |

> Note: special requests such as barbeque are captured on the booking and may require manual expense/payment follow-up. MVP does not automatically calculate extra service charges from these requests.

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /bookings/{bookingId}/payments | List payments for a booking |
| POST | /bookings/{bookingId}/payments | Record a payment/refund |
| DELETE | /bookings/{bookingId}/payments/{id} | Delete a payment record |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /expenses | List expenses filterable by category, date range, property, and unit |
| POST | /expenses | Create expense |
| GET | /expenses/{id} | Get expense details |
| PUT | /expenses/{id} | Update expense |
| DELETE | /expenses/{id} | Delete expense |

### Service Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /service-providers | List service providers |
| POST | /service-providers | Create service provider |
| GET | /service-providers/{id} | Get service provider details |
| PUT | /service-providers/{id} | Update service provider |
| DELETE | /service-providers/{id} | Delete service provider |

### Cleaning Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /cleaning-tasks | List cleaning tasks filterable by status and unit |
| POST | /cleaning-tasks | Manually create cleaning task |
| GET | /cleaning-tasks/{id} | Get cleaning task details |
| PATCH | /cleaning-tasks/{id}/status | Update status (pending→in_progress→completed) |
| PATCH | /cleaning-tasks/{id}/notes | Update notes |

### Maintenance Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /maintenance-tasks | List maintenance tasks filterable by status, priority, property, and unit |
| POST | /maintenance-tasks | Create maintenance task |
| GET | /maintenance-tasks/{id} | Get maintenance task details |
| PUT | /maintenance-tasks/{id} | Update maintenance task |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/income | Monthly income total |
| GET | /dashboard/expenses | Monthly expenses total |
| GET | /dashboard/net-profit | Monthly net profit |
| GET | /dashboard/outstanding | Total outstanding balance |
| GET | /dashboard/booking-counts | Booking counts by status |
| GET | /dashboard/pending-cleaning | Pending/in-progress cleaning tasks |
| GET | /dashboard/pending-maintenance | Open/in-progress maintenance tasks |

---

## Queue/Job Design for Cleaning Task Creation

### Job Class: `CreateCleaningTaskJob`

**Dispatch Point:** When `BookingService::checkOut()` successfully transitions a booking to `checked_out` status, it dispatches `CreateCleaningTaskJob`.

```php
// Dispatched in BookingService after status update
CreateCleaningTaskJob::dispatch($booking->id, $booking->unit_id, $booking->owner_id)
    ->onQueue('cleaning-tasks');
```

**Job Responsibilities:**
1. Validate that the booking exists and is in `checked_out` status
2. Create a `CleaningTask` record with status `pending`, linked to the unit and booking
3. Log success

**Retry Configuration:**
- Max retries: 3
- Backoff: 60 seconds between retries (fixed interval)
- Queue: `cleaning-tasks` (dedicated queue name for priority control)

**Failure Handling:**
- On each retry failure: Laravel logs the exception with booking_id and unit_id
- After max retries exhausted: The job moves to the `failed_jobs` table. A `failed()` method on the job logs a permanent failure record including booking_id, unit_id, error message, and timestamp for manual investigation.

```php
class CreateCleaningTaskJob implements ShouldQueue
{
    public $tries = 3;
    public $backoff = 60;

    public function __construct(
        public int $bookingId,
        public int $unitId,
        public int $ownerId
    ) {}

    public function handle(): void { /* create CleaningTask */ }

    public function failed(Throwable $exception): void
    {
        Log::error('Permanent failure creating cleaning task', [
            'booking_id' => $this->bookingId,
            'unit_id' => $this->unitId,
            'error' => $exception->getMessage(),
        ]);
    }
}
```

---

## Payment/Refund Calculation Rules

### Core Formulas

```
net_paid_amount = SUM(payments WHERE type='payment') - SUM(payments WHERE type='refund')
outstanding_balance = total_booking_amount - net_paid_amount
overpaid_amount = MAX(0, net_paid_amount - total_booking_amount)
```

### Payment Status Derivation

| Condition | Status |
|-----------|--------|
| net_paid_amount = 0 | unpaid |
| 0 < net_paid_amount < total_amount | partial |
| net_paid_amount = total_amount | paid |
| net_paid_amount > total_amount | overpaid |
| net_paid_amount < 0 | refunded |

### Implementation Approach

- `PaymentService::recalculateBookingPaymentStatus(Booking $booking)` is called after every payment create/delete operation.
- The method queries all payments for the booking, computes `net_paid_amount`, derives `payment_status`, and updates the booking record atomically.
- The `net_paid_amount` is stored denormalized on the `bookings` table for fast reads (dashboard, listing).
- All monetary values use `DECIMAL(12,2)` — no floating point.

### Display Rules

- Outstanding balance shown as: `max(0, total_amount - net_paid_amount)`
- If overpaid: outstanding balance = 0, overpaid amount = `net_paid_amount - total_amount` (shown separately)
- Payment amounts are always stored as positive values regardless of type

---

## Expense Linking Model

### Required Link
- **Property** — every Expense MUST be linked to exactly one Property (`property_id NOT NULL`)

### Optional Links (multiple may be set simultaneously)
- **Unit** — `unit_id` (nullable FK)
- **Booking** — `booking_id` (nullable FK)
- **Service Provider** — `service_provider_id` (nullable FK)
- **Cleaning Task** — `cleaning_task_id` (nullable FK)
- **Maintenance Task** — `maintenance_task_id` (nullable FK)

### Validation Rules
- All optional linked entities must belong to the same owner
- If `unit_id` is provided, the unit must belong to the linked property
- If `booking_id` is provided, the booking's unit must belong to the linked property
- If `cleaning_task_id` is provided, the cleaning task's unit must belong to the linked property
- If `maintenance_task_id` is provided, the task must be linked to the same property or a unit within it

### Design Rationale
Using nullable foreign keys directly on the `expenses` table (rather than a polymorphic pivot table) keeps the schema simple and queryable with standard JOINs. For MVP with a known, fixed set of linkable entities, this is the most straightforward approach.

---

## Owner Account Scoping and Authorization Approach

### Authorization Strategy (MVP)

The MVP uses a simple, layered authorization approach without any RBAC package:

1. **Authentication** — Laravel Sanctum `auth:sanctum` middleware verifies the API token
2. **Explicit owner_id filtering** — Service-layer queries explicitly filter by the authenticated owner's ID
3. **Policies** — Model Policies verify record-level ownership as a defense-in-depth layer
4. **Automatic owner_id assignment** — A `HasOwner` trait sets `owner_id` on record creation when an authenticated owner exists

No roles or permissions table exists in the MVP. All authenticated users are treated as the Owner/admin of their own data.

**Important:** Queue jobs and console/artisan contexts do not have an authenticated user. In these contexts, `owner_id` must be passed explicitly as a job constructor parameter and used directly in queries. Do not rely on `auth()->id()` in background jobs.

### Authentication
- Laravel Sanctum for API token authentication
- Token issued on login, sent as `Bearer` token in `Authorization` header
- Middleware `auth:sanctum` applied to all API routes except login/register

### Service-Layer Owner Filtering
- All service methods that query data explicitly include `->where('owner_id', auth()->id())` or accept an `$ownerId` parameter
- This is the primary mechanism for owner scoping in the MVP
- Explicit filtering is preferred over a global scope because it is transparent, testable, and works correctly in all contexts (HTTP, queue, console)

```php
// Example: PropertyService
public function listForOwner(int $ownerId): Collection
{
    return Property::where('owner_id', $ownerId)->get();
}
```

### Automatic Owner Assignment
- A `HasOwner` trait is applied to all tenant models
- The trait uses a `creating` model event to automatically set `owner_id` from the authenticated user when one exists
- In queue job contexts where no authenticated user exists, the job must set `owner_id` explicitly before saving
- Controllers never need to manually set `owner_id` for HTTP requests

### Policy-Based Authorization
- Each model has a corresponding Policy class
- Policies verify that the record's `owner_id` matches the authenticated user
- Used as a defense-in-depth layer alongside service-layer filtering
- Returns 404 (not 403) for records belonging to other owners — prevents enumeration

### Middleware Stack (per HTTP request)
1. `auth:sanctum` — verify token
2. Service-layer explicit `owner_id` filtering on all queries
3. Policy check on controller actions (via `$this->authorize()`)

### Queue Job Context
- Queue jobs receive `owner_id` as a constructor parameter
- Jobs use the explicit `owner_id` value for all queries and record creation
- Jobs do NOT call `auth()->id()` — there is no authenticated user in queue context

### Future Consideration: Global Scope
A Laravel Global Scope (`OwnerScope`) that automatically adds `WHERE owner_id = ...` to all queries may be considered in a future iteration for convenience. It is not used in the MVP because:
- It relies on `auth()->id()` which is unavailable in queue/console contexts
- Implicit query modification can mask bugs and make debugging harder
- Explicit filtering is more appropriate for a learning project where understanding the data flow is important

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Payment status derivation correctness

*For any* booking with a total amount > 0 and *for any* sequence of payment and refund records (each with a positive amount), the system SHALL compute `net_paid_amount` as the sum of payment-type amounts minus the sum of refund-type amounts, and SHALL derive the payment status as: "unpaid" if net = 0, "partial" if 0 < net < total, "paid" if net = total, "overpaid" if net > total, "refunded" if net < 0.

**Validates: Requirements 5.3, 5.4, 5.5**

### Property 2: Outstanding balance and overpaid amount calculation

*For any* booking with a total amount and a net paid amount, the outstanding balance SHALL equal `max(0, total_amount - net_paid_amount)` and the overpaid amount SHALL equal `max(0, net_paid_amount - total_amount)`. These two values are mutually exclusive (at most one is non-zero).

**Validates: Requirements 5.8**

### Property 3: Booking date overlap rejection

*For any* unit with an existing confirmed or checked-in booking covering date range [A, B), and *for any* new booking request with date range [C, D) where the ranges overlap (C < B AND D > A), the system SHALL reject the new booking with a conflict error.

**Validates: Requirements 4.7**

### Property 4: Invalid date range rejection

*For any* booking creation or update request where the check-out date is on or before the check-in date, the system SHALL reject the request with a validation error.

**Validates: Requirements 4.8**

### Property 5: Booking status transition enforcement

*For any* booking in a given status, the system SHALL only permit the following transitions: pending → confirmed, pending → cancelled, confirmed → checked_in, confirmed → cancelled, checked_in → checked_out, checked_in → cancelled. *For any* transition not in this set, the system SHALL reject the request with an error indicating the current status and why the transition is not allowed.

**Validates: Requirements 4.9**

### Property 6: Owner data isolation

*For any* two distinct owner accounts A and B, and *for any* record (Property, Unit, Guest, Booking, Payment, Expense, ServiceProvider, CleaningTask, MaintenanceTask) created by owner A, when owner B queries, updates, or deletes that record by ID, the system SHALL return a not-found response as if the record does not exist.

**Validates: Requirements 11.1, 11.3, 11.4**

### Property 7: Automatic owner association on record creation

*For any* authenticated owner and *for any* record creation request, the system SHALL automatically set the `owner_id` of the created record to the authenticated owner's ID, regardless of any owner_id value provided in the request body.

**Validates: Requirements 11.2**

### Property 8: Validation error specificity for missing required fields

*For any* model creation or update request with one or more missing required fields, the API SHALL return a validation error response that identifies each missing field individually. The number of error messages SHALL be greater than or equal to the number of missing required fields.

**Validates: Requirements 1.5, 2.5, 3.5, 5.7, 6.7, 7.6, 9.7**

### Property 9: Inactive property/unit prevents new bookings

*For any* property that is inactive or *for any* unit that is inactive, the system SHALL reject any booking creation request targeting that unit with a validation error indicating the unit is not available.

**Validates: Requirements 1.6, 2.7**

### Property 10: Deactivation preserves historical data

*For any* property or unit with existing bookings, payments, expenses, or tasks, when the property or unit is deactivated, all associated historical records SHALL remain unchanged and accessible.

**Validates: Requirements 1.4, 1.7, 2.4**

### Property 11: Cleaning task status transition enforcement

*For any* cleaning task, the system SHALL only permit the following status transitions: pending → in_progress, in_progress → completed. *For any* other transition attempt, the system SHALL reject the request with a validation error.

**Validates: Requirements 8.4**

### Property 12: Duplicate name/phone uniqueness enforcement

*For any* owner account, the system SHALL reject creation of: (a) a unit with a name that already exists within the same property, (b) a guest with a phone number that already exists for that owner, (c) a service provider with a name that already exists for that owner. Each rejection SHALL return a validation error indicating the duplicate conflict.

**Validates: Requirements 2.6, 3.6, 7.7**

### Property 13: Guest search returns only matching records

*For any* search query (by name or phone) against the guest records, every returned result SHALL contain the search term as a substring in either the full_name or phone field. If no records match, the result set SHALL be empty.

**Validates: Requirements 3.2**

### Guest profile status and blacklist filtering

*For any* guest record, the system SHALL expose a `profile_status` field with values `neutral`, `recurring`, or `blacklisted`. The guest list endpoint SHALL allow filtering by this status, and the guest profile endpoint SHALL return the current status with related bookings.

### Property 14: Expense requires Property link and validates optional links

*For any* expense creation or update, the system SHALL require a valid property_id. *For any* optional link (unit_id, booking_id, service_provider_id, cleaning_task_id, maintenance_task_id), if provided, the linked entity SHALL belong to the same owner and be associated with the linked property. If any link is invalid, the system SHALL reject the request.

**Validates: Requirements 6.1, 6.3**

### Property 15: Service provider deletion blocked by linked expenses

*For any* service provider that has one or more linked expense records, the system SHALL reject deletion with an error indicating linked expenses exist. *For any* service provider with zero linked expenses, deletion SHALL succeed.

**Validates: Requirements 7.4, 7.5**

### Property 16: Dashboard financial aggregation accuracy

*For any* set of payment records in the current calendar month belonging to an owner, the dashboard income SHALL equal the sum of all payment-type amounts. *For any* set of expense records in the current month, the dashboard expenses total SHALL equal the sum of all expense amounts. The net profit SHALL equal income minus expenses.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 17: Dashboard outstanding balance aggregation

*For any* set of bookings belonging to an owner with payment_status of "unpaid" or "partial", the dashboard outstanding balance SHALL equal the sum of `(total_amount - net_paid_amount)` across those bookings.

### Property 18: Maintenance task requires a Property or Unit link

*For any* maintenance task creation or update, the system SHALL require a valid `property_id` or `unit_id`. If neither is provided, the system SHALL reject the request with a validation error identifying both fields. If a provided link belongs to a different owner, the system SHALL reject the request with a not-found or ownership validation error.

**Validates: Requirements 10.4**

---

## Error Handling

### API Error Response Format

All API errors follow a consistent JSON structure:

```json
{
  "message": "Human-readable error summary",
  "errors": {
    "field_name": ["Specific validation message"]
  }
}
```

### Error Categories

| HTTP Status | Usage |
|-------------|-------|
| 400 | Malformed request body |
| 401 | Missing or invalid authentication token |
| 403 | Authenticated but not authorized (not used in MVP — return 404 instead) |
| 404 | Record not found OR record belongs to another owner |
| 409 | Conflict (e.g., overlapping booking dates) |
| 422 | Validation errors (missing/invalid fields) |
| 500 | Unexpected server error |

### Validation Error Handling

- Laravel Form Requests handle field-level validation
- All required-field violations are returned simultaneously (not fail-fast)
- Custom validation rules for: date range validity, booking overlap, uniqueness within scope
- Business rule violations (e.g., inactive unit, invalid status transition) return 422 with descriptive message

### Queue Job Error Handling

- Jobs implement `failed()` method for permanent failure logging
- Failed jobs stored in `failed_jobs` table with full payload for replay
- Transient errors (DB timeout, Redis connection) handled by retry mechanism
- Non-retryable errors (e.g., booking no longer exists) fail immediately without retry

### Frontend Error Handling

- Global Axios interceptor catches 401 → redirect to login
- TanStack Query `onError` callbacks display toast notifications for API errors
- Form validation errors mapped to individual field error messages
- Network errors show a generic "connection lost" banner with retry option

---

## Testing Strategy

### Backend Testing

#### Unit Tests (PHPUnit/Pest) — Primary MVP Focus
- **Service layer**: Test business logic in isolation (payment calculation, status derivation, date overlap detection)
- **Model tests**: Test Eloquent relationships, scopes, accessors
- **Policy tests**: Test authorization rules
- **Job tests**: Test job logic with mocked dependencies
- Coverage target: all service methods, all validation rules

#### Feature Tests (PHPUnit/Pest) — Primary MVP Focus
- **API endpoint tests**: Full HTTP request/response cycle through Laravel's test client
- **Authentication tests**: Token issuance, rejection of unauthenticated requests
- **Owner scoping tests**: Verify cross-account isolation
- **Status transition tests**: Verify booking and task state machines
- **Filter/search tests**: Verify query parameter handling, including guest status filtering, booking status/unit/date filters, and expense/task filters
- **Property image and amenities tests**: Verify property creation/update supports amenities lists, image upload/association, and property details response includes image URLs
- **Guest blacklist tests**: Verify guest profile status filtering and guest profile payload includes status
- **Maintenance task validation tests**: Verify required property/unit linkage and valid owner scoping for linked entities

#### Property-Based Tests — Advanced Correctness (Added Incrementally)
- **Library**: Use a PHP property-based testing library (e.g., `eris/eris` or custom generators with PHPUnit/Pest)
- **When to add**: After the relevant module's unit and feature tests are passing. Not required during initial skeleton setup.
- **Minimum iterations**: 100 per property test
- **Tag format**: `Feature: lodgeflow-owner-mvp, Property {N}: {title}`
- **Focus areas** (add when each module is implemented):
  - Payment status derivation (Property 1)
  - Outstanding balance calculation (Property 2)
  - Date overlap detection (Property 3)
  - Invalid date range rejection (Property 4)
  - Status transition enforcement (Properties 5, 11)
  - Owner isolation (Property 6)
  - Validation error specificity (Property 8)
  - Uniqueness enforcement (Property 12)
  - Guest status and blacklist filtering
  - Maintenance task linked entity validation
  - Dashboard aggregation (Properties 16, 17)

### Frontend Testing

#### Component Tests (Vitest + React Testing Library) — Added After First Working UI
- Test form validation behavior
- Test component rendering with various data states
- Test loading/error states for dashboard components

#### Integration Tests (Vitest) — Added After First Working UI
- Test API client interceptors
- Test route guards (auth redirect)
- Test TanStack Query hook behavior with mocked API

### Manual Smoke Testing
- Required throughout development
- Verify end-to-end workflows via the browser (create property → create unit → create booking → record payment → checkout → verify cleaning task created)
- Verify dashboard displays correct aggregated data

### Test Infrastructure
- Backend tests run against a dedicated PostgreSQL test database (in-memory SQLite not used due to PostgreSQL-specific features)
- Redis mocked or use a test Redis instance
- Queue jobs tested synchronously via `Queue::fake()` for dispatch verification and direct invocation for logic testing
- Frontend tests use MSW (Mock Service Worker) for API mocking

---

## GitHub CI Strategy

### Phased CI Approach

CI checks are introduced incrementally as the project matures. The task list should introduce checks in the correct order so CI does not fail before tools are configured.

### Phase 1: Initial CI (Once Backend and Frontend Skeletons Exist)

Minimal checks to verify the project builds and basic tests pass:

**Backend (initial):**
1. `composer install --no-interaction`
2. Copy `.env.testing` → `.env`
3. `php artisan migrate --force`
4. `php artisan test`

**Frontend (initial):**
1. `npm ci`
2. `npm run build`

### Phase 2: Quality Gates (Once Linting and Static Analysis Are Configured)

**Backend quality gate:**
1. Laravel Pint (PSR-12 code style)
2. PHPStan or Larastan (static analysis, level 6+)
3. PHPUnit/Pest unit and feature tests

**Frontend quality gate:**
1. ESLint
2. TypeScript strict type check (`npm run type-check`)
3. Vitest tests (where applicable)
4. Vite production build

### Phase 3: Advanced Correctness Gate (Once Relevant Modules Are Implemented)

**Property-based tests** for:
- Payment/refund calculations (Properties 1, 2)
- Booking overlap detection (Property 3)
- Status transitions (Properties 5, 11)
- Owner data isolation (Property 6)
- Dashboard financial aggregation (Properties 16, 17)

These are added when the relevant modules exist, not during the initial project skeleton setup.

### Target CI Workflow (Final State)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: lodgeflow_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]

    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: "8.3"
          extensions: pdo_pgsql, redis
      - name: Install dependencies
        run: composer install --no-interaction
        working-directory: backend
      - name: Copy env
        run: cp .env.testing .env
        working-directory: backend
      - name: Run migrations
        run: php artisan migrate --force
        working-directory: backend
      - name: Lint (Pint)
        run: vendor/bin/pint --test
        working-directory: backend
      - name: Static analysis (PHPStan)
        run: vendor/bin/phpstan analyse
        working-directory: backend
      - name: Run tests
        run: php artisan test --coverage-text
        working-directory: backend

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - name: Install dependencies
        run: npm ci
        working-directory: frontend
      - name: Lint (ESLint)
        run: npm run lint
        working-directory: frontend
      - name: Type check
        run: npm run type-check
        working-directory: frontend
      - name: Run tests
        run: npm run test -- --run
        working-directory: frontend
      - name: Build
        run: npm run build
        working-directory: frontend
```

### CI Pipeline Summary (Target State)

| Stage | Backend | Frontend |
|-------|---------|----------|
| Lint | Laravel Pint (PSR-12) | ESLint |
| Static Analysis | PHPStan/Larastan (level 6+) | TypeScript strict mode |
| Unit/Feature Tests | PHPUnit/Pest | Vitest |
| Property Tests | PHPUnit/Pest (tagged, added incrementally) | N/A |
| Build | N/A | Vite build |

---

## Architecture Decision Records (ADRs)

### ADR-1: Modular Monolith Backend

**Decision:** Structure the Laravel backend as a modular monolith with domain modules under `app/Modules/`.

**Context:** The project is a learning project with a single developer. Microservices would add deployment complexity without benefit at this scale.

**Rationale:**
- Single deployment unit — simple Docker setup
- Clear domain boundaries via module folders prepare for future extraction if needed
- Shared database simplifies transactions and referential integrity
- No inter-service communication overhead

**Consequences:** All modules share the same database and deployment. Cross-module dependencies must be managed through service interfaces.

---

### ADR-2: MYDS (Malaysia Government Design System) for Frontend

**Decision:** Use MYDS React components (`@govtechmy/myds-react`) as the primary UI component library.

**Context:** The application targets Malaysian lodging businesses. Using the government design system provides familiar, accessible UI patterns.

**Rationale:**
- Consistent with Malaysian digital standards
- Provides accessible, tested React components out of the box
- Reduces custom UI development effort
- Professional appearance without custom design work

**Consequences:** Some components (data tables, date pickers) may need custom implementation or third-party libraries styled to match MYDS tokens. MYDS is relatively new and may have fewer components than mature libraries like MUI.

---

### ADR-3: PostgreSQL as Primary Database

**Decision:** Use PostgreSQL 16 as the sole database.

**Context:** The application needs relational data with strong integrity constraints, decimal precision for financial data, and date range operations.

**Rationale:**
- Excellent support for CHECK constraints, UNIQUE constraints, and date range operations
- DECIMAL type for accurate financial calculations
- Mature, well-supported by Laravel/Eloquent
- Free and open source
- Good performance for the expected data volume

**Consequences:** Requires PostgreSQL-specific testing (not SQLite). Docker Compose handles local provisioning.

---

### ADR-4: Redis for Queue and Cache

**Decision:** Use Redis as the queue broker and application cache backend.

**Context:** The application needs background job processing (cleaning task creation) and may benefit from caching dashboard queries.

**Rationale:**
- Native Laravel support for both queue and cache drivers
- Lightweight single-binary deployment via Docker
- Fast in-memory operations suitable for job dispatch and result caching
- No need for a heavier message broker (RabbitMQ) at this scale

**Consequences:** Redis is an additional service to run but is lightweight. Data in Redis is ephemeral — acceptable for queue jobs and cache.

---

### ADR-5: No RabbitMQ, Kubernetes, or MongoDB

**Decision:** Exclude RabbitMQ, Kubernetes, and MongoDB from the MVP stack.

**Context:** These technologies add operational complexity without proportional benefit for a single-owner learning project.

**Rationale:**
- RabbitMQ: Redis queue is sufficient for the job volume (cleaning task creation on checkout)
- Kubernetes: Docker Compose is adequate for local development; single-server deployment is fine for MVP
- MongoDB: All data is relational; PostgreSQL handles all storage needs including optional JSON fields if needed later

**Consequences:** If the application scales significantly, these decisions can be revisited. The modular monolith structure makes future migration feasible.

---

### ADR-6: Laravel Sanctum for Authentication (No RBAC Package)

**Decision:** Use Laravel Sanctum for API token authentication. Do not use Spatie Laravel Permission or any RBAC package in the MVP.

**Context:** The MVP has a single owner role with no OAuth/social login requirements. Multi-user roles are out of scope.

**Rationale:**
- Simple token-based auth built into Laravel
- No external auth service needed
- Supports SPA authentication pattern
- Easy to extend to multiple users later

**Consequences:** No refresh token rotation in MVP. Token expiry can be configured later.

---

### ADR-7: TanStack Query for Frontend Server State

**Decision:** Use TanStack Query (React Query) for all API data fetching and caching.

**Context:** The frontend needs to fetch, cache, and synchronize server state across many list/detail views.

**Rationale:**
- Handles caching, background refetching, and optimistic updates
- Reduces boilerplate compared to manual fetch + useState
- Built-in loading/error states align with dashboard independent-loading requirement
- No need for a global state library (Redux, Zustand) for server state

**Consequences:** Adds a dependency but significantly simplifies data fetching patterns. Local UI state still uses React built-ins.

---

### ADR-8: Denormalized net_paid_amount on Bookings Table

**Decision:** Store `net_paid_amount` and `payment_status` directly on the `bookings` table rather than computing them on every read.

**Context:** The dashboard and booking list need to display payment status without joining and aggregating the payments table on every request.

**Rationale:**
- Fast reads for listing and dashboard queries
- Recalculated atomically on every payment create/delete (write frequency is low)
- Avoids N+1 queries on booking lists
- Single source of truth maintained by PaymentService

**Consequences:** Must ensure recalculation happens on every payment mutation. A database trigger could be added as a safety net but is not required for MVP.

---

### ADR-9: Simple Authorization Without RBAC Package

**Decision:** For MVP, use Laravel Sanctum authentication combined with explicit `owner_id` filtering in service-layer queries, model Policies for record-level authorization, and automatic `owner_id` assignment on creation. Do not introduce Spatie Laravel Permission or any RBAC package. Do not use a global scope for owner filtering.

**Context:** The MVP supports only a single Owner/admin role. There is no need for role or permission management at this stage. Queue jobs and console commands do not have an authenticated user, making `auth()->id()`-based global scopes unreliable.

**Rationale:**
- Only one role exists (Owner) — a full RBAC system adds unnecessary complexity
- Explicit `owner_id` filtering in services is transparent, testable, and works in all contexts (HTTP, queue, console)
- Policies provide defense-in-depth without requiring a permissions table
- Sanctum token authentication is sufficient for single-role access control
- Keeps the dependency footprint minimal for a learning project
- Avoids premature abstraction that would need rework when real roles are introduced

**Future consideration:** When the system supports multiple user roles (e.g., owner, manager, cleaner, accountant, maintenance provider), introduce Spatie Laravel Permission to manage role-based access control. A global owner scope may also be reconsidered at that point. This is planned for a future milestone beyond the MVP.

**Consequences:** Authorization logic is simple and explicit in Services and Policies. Adding roles later will require installing Spatie Laravel Permission, creating a roles/permissions migration, and refactoring Policies to check permissions instead of just `owner_id` matching.

---

### ADR-10: No Repository Layer in MVP

**Decision:** Do not include a Repository layer in the MVP module structure. Services query Eloquent models directly.

**Context:** The MVP is a learning project with straightforward CRUD operations. Adding a Repository abstraction layer increases boilerplate without providing immediate benefit.

**Rationale:**
- Eloquent already provides a rich query interface — wrapping it in repositories adds indirection without value for simple queries
- Services can use Eloquent directly for MVP-scale complexity
- Fewer files per module reduces cognitive overhead for a learning project
- Repository pattern can be introduced later if complex query reuse or data source swapping becomes necessary

**Consequences:** Services are coupled to Eloquent, which is acceptable for a single-database Laravel application. If a module's query logic becomes complex or needs reuse across multiple services, a Repository can be extracted at that point.
