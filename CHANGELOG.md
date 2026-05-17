# Changelog

All notable changes to LodgeFlow are documented in this file.

---

## [1.0.0] — 2026-05-17

### Owner MVP Release

The complete Owner MVP is now functional with all 10 modules implemented, tested, and verified.

#### Features
- **Authentication:** Owner registration, login, logout, and profile (Laravel Sanctum)
- **Properties:** CRUD with activate/deactivate
- **Units:** CRUD nested under properties with type enum and unique name per property
- **Guests:** CRUD with search by name/phone, unique phone per owner
- **Bookings:** CRUD with date overlap validation, status transitions (confirmed → checked_in → checked_out, cancel)
- **Payments:** Record payments and refunds, automatic payment status recalculation (unpaid/partial/paid/overpaid/refunded)
- **Expenses:** CRUD with required property link, optional multi-links (unit, booking, service provider, cleaning task, maintenance task)
- **Service Providers:** CRUD with deletion protection when linked expenses exist
- **Cleaning Tasks:** Auto-created via queue job on booking checkout, manual creation, status transitions (pending → in_progress → completed)
- **Maintenance Tasks:** CRUD with priority levels, optional property/unit/service provider links
- **Dashboard:** 7 independent metric endpoints (income, expenses, net profit, outstanding, booking counts, pending cleaning, pending maintenance)

#### Quality & Testing
- 567 automated tests (1191 assertions)
- Property-based tests for payment status derivation and booking overlap logic
- Laravel Pint code style enforcement
- PHPStan/Larastan static analysis (level 5)
- ESLint + TypeScript strict mode for frontend
- Smoke test script for full workflow verification

#### Infrastructure
- Docker Compose with 6 services (frontend, API, queue worker, PostgreSQL, Redis, Mailpit)
- GitHub Actions CI with quality gates
- Branch protection on main

---

## [0.6.0] — 2026-05-17

### Dashboard and Reporting

- Dashboard API endpoints for all 7 metrics
- Dashboard frontend with independent loading cards
- Quality gates added to CI (Pint, PHPStan, ESLint, TypeScript)
- Property-based tests for payment status and booking overlap

---

## [0.5.0] — 2026-05-17

### Cleaning and Maintenance Workflow

- CreateCleaningTaskJob with 3 retries, 60s backoff, failure logging
- Cleaning Task module with status transitions
- Maintenance Task module with priority and filtering
- Cleaning and Maintenance frontend screens
- expenses.cleaning_task_id and maintenance_task_id FK constraints added

---

## [0.4.0] — 2026-05-17

### Payments and Expenses

- Payment module with payment/refund types and status recalculation
- Service Provider module with deletion protection
- Expense module with required property link and optional multi-links
- Payment, Expense, and Service Provider frontend screens

---

## [0.3.0] — 2026-05-17

### Guests and Bookings

- Guest module with search by name/phone
- Booking module with date overlap validation and status transitions
- Guest and Booking frontend screens
- Frontend auth flow (login, register, logout)

---

## [0.2.0] — 2026-05-16

### Auth, Properties, and Units

- Owner model with Laravel Sanctum authentication
- Auth API (register, login, logout, me)
- Property module with CRUD and activate/deactivate
- Unit module with CRUD, property nesting, unique name constraint
- Property and Unit frontend screens

---

## [0.1.0] — 2026-05-16

### Project Foundation

- Git repository and GitHub remote
- Docker Compose with all 6 services
- Laravel backend scaffold with PostgreSQL and Redis
- React + Vite + TypeScript frontend with MYDS
- Axios API client with auth interceptors
- React Router with protected layout
- GitHub Actions initial CI pipeline
- Branch protection on main
- Project documentation structure
