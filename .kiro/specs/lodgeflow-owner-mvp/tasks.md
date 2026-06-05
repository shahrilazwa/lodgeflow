# Implementation Plan: LodgeFlow Owner MVP

## Overview

This implementation plan breaks the LodgeFlow Owner MVP into 7 milestones, progressing from project foundation through each domain module to the final release. Each task is a discrete coding step that builds on previous work. CI is phased: initial CI in v0.1.0, quality gates in v0.6.0, and property-based tests after the relevant modules exist.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "1.5"] },
    { "id": 2, "tasks": ["1.6", "1.7", "1.8"] },
    { "id": 3, "tasks": ["1.9", "1.10"] },
    { "id": 4, "tasks": ["2.1", "2.2"] },
    { "id": 5, "tasks": ["2.3", "2.4"] },
    { "id": 6, "tasks": ["2.5", "2.6"] },
    { "id": 7, "tasks": ["2.7", "2.8"] },
    { "id": 8, "tasks": ["2.9", "2.10"] },
    { "id": 9, "tasks": ["2.11", "2.12"] },
    { "id": 10, "tasks": ["3.1", "3.2"] },
    { "id": 11, "tasks": ["3.3", "3.4"] },
    { "id": 12, "tasks": ["3.5", "3.6"] },
    { "id": 13, "tasks": ["3.7", "3.8"] },
    { "id": 14, "tasks": ["4.1", "4.2"] },
    { "id": 15, "tasks": ["4.3", "4.4"] },
    { "id": 16, "tasks": ["4.5", "4.6"] },
    { "id": 17, "tasks": ["4.7", "4.8", "4.9"] },
    { "id": 18, "tasks": ["5.1", "5.2"] },
    { "id": 19, "tasks": ["5.3", "5.4"] },
    { "id": 20, "tasks": ["5.5", "5.6"] },
    { "id": 21, "tasks": ["6.1", "6.2"] },
    { "id": 22, "tasks": ["6.3", "6.4"] },
    { "id": 23, "tasks": ["6.5", "6.6"] },
    { "id": 24, "tasks": ["7.1", "7.2"] },
    { "id": 25, "tasks": ["7.3"] }
  ]
}
```

---

## Milestone: v0.1.0 - Project Foundation


## Task 1.1: Initialize Git Repository and GitHub Remote

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Initialize the Git repository, create `.gitignore` (covering Laravel, Node, IDE, `.env` files), make the initial commit, create the GitHub remote repository, and push `main`. Branch protection will be configured later after CI is working.
- **Acceptance Criteria**:
  - [ ] Git repository initialized with `main` branch
  - [ ] `.gitignore` covers: `vendor/`, `node_modules/`, `.env`, `storage/*.key`, IDE files, OS files
  - [ ] Initial commit pushed to GitHub remote
  - [ ] GitHub remote repository created and accessible
- **Commit reminder**: Commit with message "chore: initialize git repository and github remote"

---

## Task 1.2: Create GitHub Issues, Milestones, Project Board, and Release Plan

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Set up GitHub project management infrastructure. Create milestones v0.1.0 through v1.0.0. Create a GitHub Project board (Kanban: To Do, In Progress, Done). Create placeholder issues for each milestone's major work items. Create labels. Document the workflow in `docs/github-workflow.md`.
- **Acceptance Criteria**:
  - [ ] 7 milestones created: v0.1.0, v0.2.0, v0.3.0, v0.4.0, v0.5.0, v0.6.0, v1.0.0
  - [ ] GitHub Project board created with Kanban columns (To Do, In Progress, Done)
  - [ ] At least one issue per milestone created and assigned to the correct milestone
  - [ ] Labels created: `backend`, `frontend`, `infra`, `testing`, `docs`, `bug`, `enhancement`
  - [ ] `docs/github-workflow.md` created documenting: milestone plan, label definitions, project board columns, release strategy, and branching workflow
- **Commit reminder**: Commit with message "docs: add github workflow documentation and set up project management"

---

## Task 1.3: Create README and Project Documentation Structure

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Write a comprehensive README.md covering project overview, tech stack, prerequisites, setup instructions (Docker Compose), folder structure, and development workflow. Create a `docs/` folder with architecture decision records placeholder.
- **Acceptance Criteria**:
  - [ ] `README.md` at repo root with: project description, tech stack table, prerequisites, quick start guide, folder structure overview
  - [ ] `docs/` directory created with `adr/` subdirectory
  - [ ] `docs/adr/001-modular-monolith.md` placeholder ADR created
  - [ ] Setup instructions reference Docker Compose workflow
- **Commit reminder**: Commit with message "docs: add README and documentation structure"

---

## Task 1.4: Set Up Docker Compose with All Services

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Create `docker-compose.yml` with all 6 services (frontend, api, queue-worker, db, redis, mailpit) and supporting Dockerfiles. Create `.env.example` at repo root with all required environment variables.
- **Acceptance Criteria**:
  - [ ] `docker-compose.yml` defines: frontend, api, queue-worker, db (postgres:16), redis (7-alpine), mailpit
  - [ ] `docker/frontend/Dockerfile` created (Node 20 base, Vite dev server)
  - [ ] `docker/backend/Dockerfile` created (PHP version required by latest stable Laravel, minimum PHP 8.3, with required extensions and Composer)
  - [ ] `.env.example` at repo root with safe defaults for local dev
  - [ ] `.env` files listed in `.gitignore` — real `.env` must never be committed
  - [ ] `docker compose up` starts all services without errors
  - [ ] PostgreSQL accessible on :5432, Redis on :6379, Mailpit UI on :8025
- **Commit reminder**: Commit with message "infra: add docker compose configuration with all services"

---

## Task 1.5: Scaffold Laravel Backend Application

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Create the Laravel application in `backend/` directory using the latest stable version. Configure PostgreSQL connection, Redis for queue/cache, and Mailpit for mail. Set up the modular monolith folder structure under `app/Modules/`.
- **Acceptance Criteria**:
  - [ ] `backend/` contains a fresh Laravel installation (latest stable)
  - [ ] `backend/.env.example` configured for Docker services (DB_HOST=db, REDIS_HOST=redis, MAIL_HOST=mailpit)
  - [ ] `backend/.env.testing` configured for test database
  - [ ] `config/database.php` uses PostgreSQL as default
  - [ ] `config/queue.php` uses Redis as default driver
  - [ ] `app/Modules/` directory created with subdirectories for all 10 domain modules: Property, Unit, Guest, Booking, Payment, Expense, ServiceProvider, CleaningTask, MaintenanceTask, Dashboard
  - [ ] Auth controllers placed in `app/Http/Controllers/Auth/` (standard Laravel location)
  - [ ] `php artisan migrate` runs successfully against PostgreSQL container
  - [ ] `php artisan test` runs with zero failures (default Laravel tests)
- **Commit reminder**: Commit with message "feat: scaffold laravel backend with postgresql and redis config"

---

## Task 1.6: Scaffold React + Vite + TypeScript Frontend

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Create the React + Vite + TypeScript application in `frontend/` directory. Install and configure MYDS packages, TanStack Query, React Router v6, and Axios. Set up the feature-based folder structure.
- **Acceptance Criteria**:
  - [ ] `frontend/` contains a Vite + React + TypeScript project
  - [ ] Dependencies installed: `@govtechmy/myds-react`, `@govtechmy/myds-style`, `@tanstack/react-query`, `react-router-dom`, `axios`
  - [ ] `vite.config.ts` configured with proxy to backend API (:8000)
  - [ ] `src/` folder structure matches design: `features/`, `components/`, `hooks/`, `lib/`, `types/`, `styles/`, `routes/`
  - [ ] MYDS stylesheet imported globally in `main.tsx`
  - [ ] App renders a placeholder page with MYDS button component
  - [ ] `npm run dev` starts without errors
  - [ ] TypeScript strict mode enabled in `tsconfig.json`
- **Commit reminder**: Commit with message "feat: scaffold react vite frontend with myds and tanstack query"

---

## Task 1.7: Configure Axios API Client and Auth Interceptors

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Create the shared Axios instance in `frontend/src/lib/api.ts` with base URL configuration, Bearer token injection interceptor, and 401 response handling (redirect to login).
- **Acceptance Criteria**:
  - [ ] `frontend/src/lib/api.ts` exports configured Axios instance
  - [ ] Base URL reads from environment variable (`VITE_API_URL`)
  - [ ] Request interceptor injects `Authorization: Bearer <token>` from localStorage
  - [ ] Response interceptor catches 401 and clears token / redirects to login
  - [ ] TypeScript types for API error responses defined in `frontend/src/types/api.ts`
- **Commit reminder**: Commit with message "feat: configure axios api client with auth interceptors"

---

## Task 1.8: Set Up React Router with Protected Layout

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Configure React Router v6 with a protected layout wrapper that checks authentication state. Create placeholder route files for all feature modules. Set up a basic app shell with navigation sidebar.
- **Acceptance Criteria**:
  - [ ] `frontend/src/routes/` contains route definitions for all modules
  - [ ] `ProtectedLayout` component checks for auth token, redirects to `/login` if missing
  - [ ] Public routes: `/login`, `/register`
  - [ ] Protected routes: `/dashboard`, `/properties`, `/units`, `/guests`, `/bookings`, `/payments`, `/expenses`, `/service-providers`, `/cleaning-tasks`, `/maintenance-tasks`
  - [ ] Basic app shell with MYDS navigation sidebar and header
  - [ ] Placeholder pages render for each route
- **Commit reminder**: Commit with message "feat: set up react router with protected layout and app shell"

---

## Task 1.9: Set Up Initial CI Pipeline (GitHub Actions)

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Create a GitHub Actions workflow that runs on PR and push to `main`. The initial CI runs: backend tests (`php artisan test`), frontend build (`npm run build`), and TypeScript type check (`npx tsc --noEmit`). Uses PostgreSQL and Redis service containers. After CI passes, enable branch protection on `main` (require PR, require CI to pass).
- **Acceptance Criteria**:
  - [ ] `.github/workflows/ci.yml` created
  - [ ] CI triggers on: push to `main`, pull requests to `main`
  - [ ] Backend job: sets up PHP (8.3+), Composer install, PostgreSQL service container, runs migrations, runs `php artisan test`
  - [ ] Frontend job: sets up Node, npm ci, runs `npx tsc --noEmit`, runs `npm run build`
  - [ ] CI passes on current codebase
  - [ ] Branch protection enabled on `main` (require PR, require CI status checks to pass, no direct push)
- **Commit reminder**: Commit with message "ci: add initial github actions pipeline and enable branch protection"

---

## Task 1.10: Verify Docker Compose Full Stack Boot

- **Milestone**: v0.1.0 - Project Foundation
- **Status**: pending
- **Description**: Verify that `docker compose up` boots all services correctly and they can communicate. Frontend can reach the API, API can reach PostgreSQL and Redis, queue worker starts, Mailpit catches test emails.
- **Acceptance Criteria**:
  - [ ] `docker compose up -d` starts all 6 services
  - [ ] Frontend accessible at http://localhost:5173
  - [ ] API responds at http://localhost:8000/api/v1 (can return a health check JSON)
  - [ ] Queue worker logs show it is listening for jobs
  - [ ] Mailpit UI accessible at http://localhost:8025
  - [ ] Add a `/api/v1/health` endpoint that returns `{"status": "ok"}` to verify API is running
- **Commit reminder**: Commit with message "chore: verify full stack docker compose boot and add health endpoint"

---

## Checkpoint - v0.1.0

- [ ] Ensure all services boot, CI passes, and the project structure matches the design document. Ask the user if questions arise.

---

## Milestone: v0.2.0 - Auth, Properties, and Units


## Task 2.1: Implement Owner Model and Auth Migrations

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Create the `owners` table migration (replacing Laravel's default `users` table), the Owner Eloquent model with Sanctum's `HasApiTokens` trait, and configure the auth guard to use the Owner model.
- **Acceptance Criteria**:
  - [ ] Migration creates `owners` table with columns matching the design schema
  - [ ] `app/Models/Owner.php` model with `HasApiTokens`, `HasFactory`, `Notifiable` traits
  - [ ] `config/auth.php` updated: guards use `sanctum`, providers point to Owner model
  - [ ] Default Laravel `users` migration removed or replaced
  - [ ] Migration runs successfully: `php artisan migrate:fresh`
- **Commit reminder**: Commit with message "feat: add owner model and auth migrations"

---

## Task 2.2: Implement Auth API (Register, Login, Logout, Me)

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Create AuthController with register, login, logout, and me endpoints. Implement form request validation. Register issues a Sanctum token. Login validates credentials and returns token. Logout revokes current token. Me returns authenticated owner profile.
- **Acceptance Criteria**:
  - [ ] `POST /api/v1/auth/register` — creates owner, returns token
  - [ ] `POST /api/v1/auth/login` — validates credentials, returns token
  - [ ] `POST /api/v1/auth/logout` — revokes current token (requires auth)
  - [ ] `GET /api/v1/auth/me` — returns owner profile (requires auth)
  - [ ] Validation: email unique, password min 8 chars, name required
  - [ ] Unauthenticated requests to protected endpoints return 401
  - [ ] Routes registered in `routes/api.php` with `/v1` prefix
- **Commit reminder**: Commit with message "feat: implement auth api with sanctum token authentication"

---

## Task 2.3: Write Feature Tests for Auth API

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Write comprehensive feature tests for all auth endpoints covering happy paths, validation errors, and edge cases.
- **Acceptance Criteria**:
  - [ ] Test: successful registration returns 201 with token
  - [ ] Test: registration with duplicate email returns 422
  - [ ] Test: registration with missing fields returns 422 with field-specific errors
  - [ ] Test: successful login returns 200 with token
  - [ ] Test: login with wrong credentials returns 401
  - [ ] Test: logout revokes token, subsequent requests return 401
  - [ ] Test: `/auth/me` returns owner profile when authenticated
  - [ ] Test: `/auth/me` returns 401 when unauthenticated
  - [ ] All tests pass: `php artisan test --filter=Auth`
- **Commit reminder**: Commit with message "test: add feature tests for auth api endpoints"

---

## Task 2.4: Implement HasOwner Trait and Owner Scoping Foundation

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Create the `HasOwner` trait that automatically sets `owner_id` on model creation from the authenticated user. Create a base Policy class that checks `owner_id` matches the authenticated user and returns 404 for mismatches.
- **Acceptance Criteria**:
  - [ ] `app/Traits/HasOwner.php` trait created
  - [ ] Trait uses `creating` model event to set `owner_id` from `auth()->id()` when available
  - [ ] Trait does NOT set `owner_id` if already explicitly set (for queue job context)
  - [ ] Base `OwnerPolicy` class created with `view`, `update`, `delete` methods checking `$record->owner_id === $user->id`
  - [ ] Policy returns 404 (not 403) via `ModelNotFoundException` for ownership violations
  - [ ] Unit test verifies trait sets `owner_id` automatically
  - [ ] Unit test verifies trait does not override explicitly set `owner_id`
- **Commit reminder**: Commit with message "feat: implement hasowner trait and base owner policy"

---

## Task 2.5: Implement Property Backend Schema, Service, and Ownership

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Create the Property backend module with migration, model, service, form requests, and policy. Add support for optional property galleries and amenities as part of the property schema.
- **Acceptance Criteria**:
  - [ ] Migration creates `properties` table matching design schema
  - [ ] `Property` model with `HasOwner` trait, fillable fields, relationships (belongsTo Owner, hasMany Unit)
  - [ ] `Property` model supports `amenities` and `photo_urls` fields
  - [ ] `PropertyPolicy` extends base policy for ownership checks
  - [ ] `PropertyService` with methods: `listForOwner`, `create`, `show`, `update`, `deactivate`, `activate`
  - [ ] All service queries explicitly filter by `owner_id`
  - [ ] `StorePropertyRequest` validates: name (required, max:100), address (required, max:255), description (nullable, max:1000), amenities (nullable,array), amenities.* (string,max:100), photo_urls (nullable,array), photo_urls.* (url,max:255)
  - [ ] `UpdatePropertyRequest` with same validation rules
- **Commit reminder**: Commit with message "feat: implement property backend schema with gallery and amenities support"

---

## Task 2.6: Implement Property Controller, Routes, and Activation

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Build Property API controllers and route definitions. Implement property activation/deactivation behavior and owner-scoped access control.
- **Acceptance Criteria**:
  - [ ] `PropertyController` with index, store, show, update, deactivate, activate actions
  - [ ] Routes registered: GET/POST `/properties`, GET/PUT `/properties/{id}`, PATCH `/properties/{id}/deactivate`, PATCH `/properties/{id}/activate`
  - [ ] All routes protected by `auth:sanctum` middleware
  - [ ] Deactivate marks property inactive, preserves existing bookings, and prevents future bookings for units under that property
  - [ ] Owner-scoped access returns 404 for other owners' properties
- **Commit reminder**: Commit with message "feat: implement property api controller and activation routes"

---

## Task 2.7: Write Feature Tests for Property API

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Write feature tests for the Property API covering schema validation, owner scoping, activation status, and gallery/amenities support.
- **Acceptance Criteria**:
  - [ ] Test: create property with valid data returns 201
  - [ ] Test: create property without name/address returns 422 with field errors
  - [ ] Test: create property with valid amenities array returns 201
  - [ ] Test: create property with invalid photo_urls returns 422
  - [ ] Test: list properties returns only authenticated owner's properties
  - [ ] Test: show property belonging to another owner returns 404
  - [ ] Test: update property saves changes correctly
  - [ ] Test: deactivate property sets `is_active` to false
  - [ ] Test: activate property sets `is_active` to true
  - [ ] Test: description exceeding 1000 chars returns 422
  - [ ] All tests pass: `php artisan test --filter=Property`
- **Commit reminder**: Commit with message "test: add feature tests for property api"

---

## Task 2.8: Implement Unit Backend Schema, Service, and Ownership

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Create the Unit backend module with migration, model, service, form requests, and policy. Units are nested under properties and require owner scoping.
- **Acceptance Criteria**:
  - [ ] Migration creates `units` table matching design schema with UNIQUE(property_id, name)
  - [ ] `Unit` model with `HasOwner` trait, fillable fields, relationships (belongsTo Owner, belongsTo Property, hasMany Booking)
  - [ ] `UnitPolicy` for ownership checks
  - [ ] `UnitService` with methods: `listForProperty`, `create`, `show`, `update`, `deactivate`, `activate`
  - [ ] Service validates property belongs to owner before creating unit
  - [ ] `StoreUnitRequest` validates: name (required, max:100), type (required, in:room,suite,dormitory_bed,entire_unit), description (nullable, max:500)
- **Commit reminder**: Commit with message "feat: implement unit backend schema with property scoping"

---

## Task 2.9: Implement Unit Controller, Routes, and Activation

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Build Unit API controllers and routes. Implement nested creation under properties, activation/deactivation, and owner-scoped access control.
- **Acceptance Criteria**:
  - [ ] Controller handles nested route: `POST /properties/{propertyId}/units`
  - [ ] Routes: GET/POST `/properties/{propertyId}/units`, GET/PUT `/units/{id}`, PATCH `/units/{id}/deactivate`, PATCH `/units/{id}/activate`
  - [ ] Duplicate name within same property returns 422
  - [ ] Deactivate/activate endpoints update unit status and preserve booking history
  - [ ] Owner-scoped access returns 404 for other owners' units
- **Commit reminder**: Commit with message "feat: implement unit api controller and activation routes"

---

## Task 2.10: Write Feature Tests for Unit API

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Write feature tests for all Unit API endpoints covering CRUD, validation, owner scoping, property nesting, and unique name constraint.
- **Acceptance Criteria**:
  - [ ] Test: create unit with valid data returns 201
  - [ ] Test: create unit without required fields returns 422
  - [ ] Test: create unit with invalid type returns 422
  - [ ] Test: create unit with duplicate name in same property returns 422
  - [ ] Test: same unit name in different properties succeeds
  - [ ] Test: list units returns only units for specified property
  - [ ] Test: show unit belonging to another owner returns 404
  - [ ] Test: deactivate/activate unit works correctly
  - [ ] Test: create unit under another owner's property returns 404/403
  - [ ] All tests pass: `php artisan test --filter=Unit`
- **Commit reminder**: Commit with message "test: add feature tests for unit api"

---

## Task 2.11: Implement Property and Unit Frontend Screens with Gallery and Amenities

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Build the frontend screens for Properties and Units using MYDS components and TanStack Query. Include property gallery and amenities display on detail pages.
- **Acceptance Criteria**:
  - [ ] Properties list page displays all properties with active/inactive badges and first gallery photo if available
  - [ ] Property detail page shows a photo gallery slider or grid and amenities list
  - [ ] Property create/edit form includes name, address, description, amenities, and photo URLs
  - [ ] Units list page (nested under property) displays units with type and status
  - [ ] Unit create/edit form includes name, type dropdown, description
  - [ ] Unit detail page with deactivate/activate button
  - [ ] All API calls use TanStack Query hooks (useQuery, useMutation)
  - [ ] Loading states and error handling displayed using MYDS components
  - [ ] Toast notifications on successful create/update/deactivate actions
- **Commit reminder**: Commit with message "feat: implement property and unit frontend screens with gallery and amenities"

---

## Task 2.12: Implement Frontend Auth Flow (Login, Register, Logout)

- **Milestone**: v0.2.0 - Auth, Properties, and Units
- **Status**: pending
- **Description**: Build the complete authentication flow in the frontend: login page, register page, logout action, and auth state management using TanStack Query.
- **Acceptance Criteria**:
  - [ ] Login page submits credentials to `/api/v1/auth/login`, stores token in localStorage
  - [ ] Register page submits to `/api/v1/auth/register`, stores token, redirects to dashboard
  - [ ] Logout button calls `/api/v1/auth/logout`, clears token, redirects to login
  - [ ] `useAuth` hook provides: `isAuthenticated`, `owner`, `login`, `register`, `logout`
  - [ ] Protected routes redirect to login when token is missing or expired
  - [ ] 401 responses trigger automatic logout and redirect
  - [ ] Form validation errors displayed inline using MYDS form components
- **Commit reminder**: Commit with message "feat: implement frontend auth flow with login register logout"

---

## Checkpoint - v0.2.0

- [ ] Ensure all tests pass, auth flow works end-to-end, properties and units CRUD functional. Ask the user if questions arise.

---

## Milestone: v0.3.0 - Guests and Bookings


## Task 3.1: Implement Guest Module (Model, Migration, Service, Controller)

- **Milestone**: v0.3.0 - Guests and Bookings
- **Status**: pending
- **Description**: Create the Guest module with migration, model, service, form requests, policy, controller, and routes. Implement CRUD with search by name/phone. Enforce unique phone per owner constraint.
- **Acceptance Criteria**:
  - [ ] Migration creates `guests` table matching design schema with UNIQUE(owner_id, phone)
  - [ ] `Guest` model with `HasOwner` trait, fillable fields, relationships (belongsTo Owner, hasMany Booking)
  - [ ] `GuestPolicy` for ownership checks
  - [ ] `GuestService` with methods: `listForOwner` (with search), `create`, `show` (with bookings), `update`
  - [ ] Search supports filtering by `full_name` (LIKE) and `phone` (LIKE)
  - [ ] `StoreGuestRequest` validates: full_name (required, max:100), phone (required, regex:7-15 digits), email (nullable, max:254, email format), address (nullable, max:255), identification_number (nullable, max:50)
  - [ ] `GuestController` with index (search), store, show, update actions
  - [ ] Routes: GET/POST `/guests`, GET/PUT `/guests/{id}`
  - [ ] Show endpoint includes guest's bookings ordered by check_in_date desc
  - [ ] Duplicate phone for same owner returns 422
- **Commit reminder**: Commit with message "feat: implement guest module with crud and search"

---

## Task 3.2: Write Feature Tests for Guest API

- **Milestone**: v0.3.0 - Guests and Bookings
- **Status**: pending
- **Description**: Write feature tests for all Guest API endpoints covering CRUD, search, validation, owner scoping, and unique phone constraint.
- **Acceptance Criteria**:
  - [ ] Test: create guest with valid data returns 201
  - [ ] Test: create guest without name/phone returns 422
  - [ ] Test: create guest with invalid phone format returns 422
  - [ ] Test: create guest with duplicate phone (same owner) returns 422
  - [ ] Test: same phone number for different owners succeeds
  - [ ] Test: search by name returns matching guests
  - [ ] Test: search by phone returns matching guests
  - [ ] Test: search with no matches returns empty array
  - [ ] Test: show guest includes bookings ordered by check_in_date desc
  - [ ] Test: show guest belonging to another owner returns 404
  - [ ] All tests pass: `php artisan test --filter=Guest`
- **Commit reminder**: Commit with message "test: add feature tests for guest api"

---

## Task 3.3: Implement Booking Module - Model, Migration, and Base Service

- **Milestone**: v0.3.0 - Guests and Bookings
- **Status**: pending
- **Description**: Create the Booking module with migration, model, and base service. Implement booking creation with date overlap validation, the CHECK constraint for dates, expected occupancy and special request capture, and initial status of "confirmed". Payment status defaults to "unpaid".
- **Acceptance Criteria**:
  - [ ] Migration creates `bookings` table matching design schema with CHECK(check_out_date > check_in_date)
  - [ ] `Booking` model with `HasOwner` trait, fillable fields, casts (dates, decimals), relationships
  - [ ] `Booking` model supports `expected_occupancy` and `special_requests`
  - [ ] `BookingPolicy` for ownership checks
  - [ ] `BookingService::create()` validates: unit is active, unit's property is active, no date overlap with confirmed/checked_in bookings
  - [ ] Date overlap check: existing booking overlaps if `existing.check_in < new.check_out AND existing.check_out > new.check_in`
  - [ ] `StoreBookingRequest` validates: unit_id (required, exists), guest_id (required, exists), check_in_date (required, date), check_out_date (required, date, after:check_in_date), total_amount (required, decimal, between:0.01,999999999.99), expected_occupancy (required, integer, min:1, max:20), special_requests (nullable, max:1000)
  - [ ] New bookings get status "confirmed" and payment_status "unpaid"
  - [ ] Booking create stores expected occupancy and special requests for later manual expense/payment handling
  - [ ] Overlap conflict returns 409 with details of conflicting booking
- **Commit reminder**: Commit with message "feat: implement booking model migration and creation with overlap validation"

---

## Task 3.4: Implement Booking Status Transitions and Update Logic

- **Milestone**: v0.3.0 - Guests and Bookings
- **Status**: pending
- **Description**: Implement booking status transitions (check-in, check-out, cancel), update logic (only when confirmed), and list/show endpoints with filtering. Check-out dispatches CreateCleaningTaskJob.
- **Acceptance Criteria**:
  - [ ] `BookingService::checkIn()` — only from "confirmed" status
  - [ ] `BookingService::checkOut()` — only from "checked_in" status, dispatches `CreateCleaningTaskJob`
  - [ ] `BookingService::cancel()` — only from "confirmed" or "checked_in" status
  - [ ] `BookingService::update()` — only when status is "confirmed", validates date overlap on date changes
  - [ ] Invalid transitions return 422 with current status and reason
  - [ ] `BookingController` with index, store, show, update, checkIn, checkOut, cancel actions
  - [ ] List endpoint supports filters: status, unit_id, date range (check_in_date)
  - [ ] Show endpoint includes payment records and booking-level expected occupancy / special requests
  - [ ] Routes: GET/POST `/bookings`, GET/PUT `/bookings/{id}`, PATCH `/bookings/{id}/check-in`, PATCH `/bookings/{id}/check-out`, PATCH `/bookings/{id}/cancel`
  - [ ] Booking for inactive unit returns 422
  - [ ] Booking for unit under inactive property returns 422
- **Commit reminder**: Commit with message "feat: implement booking status transitions and filtering"

---

## Task 3.5: Write Feature Tests for Booking API

- **Milestone**: v0.3.0 - Guests and Bookings
- **Status**: pending
- **Description**: Write comprehensive feature tests for all Booking API endpoints covering creation, overlap validation, status transitions, update restrictions, and filtering.
- **Acceptance Criteria**:
  - [ ] Test: create booking with valid data returns 201 with status "confirmed"
  - [ ] Test: create booking with check_out <= check_in returns 422
  - [ ] Test: create booking with overlapping dates returns 409
  - [ ] Test: create booking for inactive unit returns 422
  - [ ] Test: create booking for unit under inactive property returns 422
  - [ ] Test: create booking with expected occupancy and special requests succeeds
  - [ ] Test: check-in from "confirmed" succeeds
  - [ ] Test: check-in from "checked_out" returns 422
  - [ ] Test: check-out from "checked_in" succeeds and dispatches cleaning job
  - [ ] Test: cancel from "confirmed" succeeds
  - [ ] Test: cancel from "checked_out" returns 422
  - [ ] Test: update booking dates when "confirmed" succeeds
  - [ ] Test: update booking when "checked_in" returns 422
  - [ ] Test: list bookings with status filter works
  - [ ] Test: list bookings with date range filter works
  - [ ] Test: bookings scoped to authenticated owner only
  - [ ] All tests pass: `php artisan test --filter=Booking`
- **Commit reminder**: Commit with message "test: add feature tests for booking api with overlap and transition tests"

---

## Task 3.6: Implement Guest Frontend Screens

- **Milestone**: v0.3.0 - Guests and Bookings
- **Status**: pending
- **Description**: Build the frontend screens for Guests using MYDS components. Include list with search, create/edit forms, and profile view with booking history.
- **Acceptance Criteria**:
  - [ ] Guests list page with search input (filters by name or phone)
  - [ ] Guest create form: full_name, phone, email, address, identification_number with validation
  - [ ] Guest edit form with pre-populated fields
  - [ ] Guest profile page showing contact details and booking history (most recent first)
  - [ ] Empty state message when no guests found
  - [ ] Duplicate phone error displayed inline
  - [ ] All API calls use TanStack Query hooks
  - [ ] Loading and error states handled
- **Commit reminder**: Commit with message "feat: implement guest frontend screens with search"

---

## Task 3.7: Implement Booking Frontend Screens

- **Milestone**: v0.3.0 - Guests and Bookings
- **Status**: pending
- **Description**: Build the frontend screens for Bookings using MYDS components. Include list with filters, create/edit forms, detail view with payment summary, and status transition buttons.
- **Acceptance Criteria**:
  - [ ] Bookings list page with filters: status dropdown, unit dropdown, date range picker
  - [ ] Booking create form: guest selector, unit selector, check-in date, check-out date, expected occupancy, special requests, total amount
  - [ ] Booking edit form (only enabled when status is "confirmed")
  - [ ] Booking detail page showing: dates, guest, unit, expected occupancy, special requests, status badge, payment status badge, payment history
  - [ ] Status transition buttons: "Check In", "Check Out", "Cancel" (shown based on current status)
  - [ ] Overlap conflict error displayed as alert
  - [ ] Outstanding balance and overpaid amount displayed on detail page
  - [ ] All API calls use TanStack Query hooks with optimistic updates for status transitions
- **Commit reminder**: Commit with message "feat: implement booking frontend screens with status transitions"

---

## Task 3.8: Write Frontend Component Tests for Auth and Core Screens

- **Milestone**: v0.3.0 - Guests and Bookings
- **Status**: pending
- **Description**: Set up Vitest + React Testing Library for frontend testing. Write component tests for auth flow, property list, and booking list screens.
- **Acceptance Criteria**:
  - [ ] Vitest configured with React Testing Library and jsdom environment
  - [ ] Test: Login form submits credentials and stores token
  - [ ] Test: Protected route redirects to login when unauthenticated
  - [ ] Test: Property list renders properties from API
  - [ ] Test: Booking list renders with status filter
  - [ ] Test: Booking detail shows correct status transition buttons
  - [ ] `npm run test` (or `npx vitest --run`) passes all tests
- **Commit reminder**: Commit with message "test: add frontend component tests with vitest and react testing library"

---

## Checkpoint - v0.3.0

- [ ] Ensure all backend and frontend tests pass, guest and booking flows work end-to-end. Ask the user if questions arise.

---

## Milestone: v0.4.0 - Payments and Expenses


## Task 4.1: Implement Payment Module (Model, Migration, Service, Controller)

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Create the Payment module with migration, model, service, form requests, controller, and routes. Implement payment/refund recording with automatic recalculation of booking payment status and net_paid_amount.
- **Acceptance Criteria**:
  - [ ] Migration creates `payments` table matching design schema with CHECK(amount > 0)
  - [ ] `Payment` model with `HasOwner` trait, fillable fields, relationships (belongsTo Owner, belongsTo Booking)
  - [ ] `PaymentService::create()` records payment, calls `recalculateBookingPaymentStatus()`
  - [ ] `PaymentService::delete()` removes payment, calls `recalculateBookingPaymentStatus()`
  - [ ] `PaymentService::recalculateBookingPaymentStatus()` computes net_paid_amount and derives payment_status per design rules
  - [ ] Payment status derivation: unpaid (net=0), partial (0<net<total), paid (net=total), overpaid (net>total), refunded (net<0)
  - [ ] `StorePaymentRequest` validates: type (required, in:payment,refund), amount (required, decimal, gt:0, max:999999999.99), payment_date (required, date), payment_method (required, in:cash,bank_transfer,other)
  - [ ] Routes: GET/POST `/bookings/{bookingId}/payments`, DELETE `/bookings/{bookingId}/payments/{id}`
  - [ ] Service validates booking belongs to authenticated owner
  - [ ] Amount always stored as positive regardless of type
- **Commit reminder**: Commit with message "feat: implement payment module with status recalculation"

---

## Task 4.2: Write Feature Tests for Payment API

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Write feature tests for Payment API covering recording, deletion, status recalculation, and all payment status transitions.
- **Acceptance Criteria**:
  - [ ] Test: record payment returns 201, updates booking net_paid_amount
  - [ ] Test: record payment that fully covers total sets status to "paid"
  - [ ] Test: partial payment sets status to "partial"
  - [ ] Test: overpayment sets status to "overpaid"
  - [ ] Test: record refund subtracts from net_paid_amount
  - [ ] Test: refunds exceeding payments sets status to "refunded"
  - [ ] Test: delete payment recalculates status correctly
  - [ ] Test: payment with amount <= 0 returns 422
  - [ ] Test: payment without required fields returns 422
  - [ ] Test: payment on another owner's booking returns 404
  - [ ] Test: list payments for a booking returns all records
  - [ ] All tests pass: `php artisan test --filter=Payment`
- **Commit reminder**: Commit with message "test: add feature tests for payment api with status derivation"

---

## Task 4.3: Implement Service Provider Module (Model, Migration, Service, Controller)

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Create the Service Provider module with CRUD. Enforce unique name per owner. Prevent deletion when linked expenses exist.
- **Acceptance Criteria**:
  - [ ] Migration creates `service_providers` table matching design schema with UNIQUE(owner_id, name)
  - [ ] `ServiceProvider` model with `HasOwner` trait, fillable fields, relationships
  - [ ] `ServiceProviderPolicy` for ownership checks
  - [ ] `ServiceProviderService` with CRUD methods, explicit owner_id filtering
  - [ ] `StoreServiceProviderRequest` validates: name (required, max:100), service_type (required, max:100), phone (nullable, max:20), notes (nullable, max:1000)
  - [ ] Delete checks for linked expenses — returns 409 if any exist
  - [ ] Duplicate name for same owner returns 422
  - [ ] Routes: GET/POST `/service-providers`, GET/PUT/DELETE `/service-providers/{id}`
- **Commit reminder**: Commit with message "feat: implement service provider module with crud"

---

## Task 4.4: Write Feature Tests for Service Provider API

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Write feature tests for Service Provider API covering CRUD, unique name constraint, and deletion protection.
- **Acceptance Criteria**:
  - [ ] Test: create service provider with valid data returns 201
  - [ ] Test: create with duplicate name (same owner) returns 422
  - [ ] Test: same name for different owners succeeds
  - [ ] Test: create without name/service_type returns 422
  - [ ] Test: delete service provider with no expenses succeeds
  - [ ] Test: delete service provider with linked expenses returns 409
  - [ ] Test: list/show scoped to authenticated owner
  - [ ] All tests pass: `php artisan test --filter=ServiceProvider`
- **Commit reminder**: Commit with message "test: add feature tests for service provider api"

---

## Task 4.5: Implement Expense Module (Model, Migration, Service, Controller)

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Create the Expense module with migration, model, service, form requests, controller, and routes. Implement multi-link validation (required Property, optional Unit/Booking/ServiceProvider/CleaningTask/MaintenanceTask). Validate all linked entities belong to same owner and property hierarchy.
- **Acceptance Criteria**:
  - [ ] Migration creates `expenses` table matching design schema with CHECK(amount > 0)
  - [ ] `Expense` model with `HasOwner` trait, fillable fields, all belongsTo relationships
  - [ ] `ExpensePolicy` for ownership checks
  - [ ] `ExpenseService` with CRUD methods, explicit owner_id filtering
  - [ ] Validation: property_id required; unit must belong to linked property; booking's unit must belong to linked property
  - [ ] Validation: all optional linked entities must belong to same owner
  - [ ] `StoreExpenseRequest` validates: amount (required, gt:0, max:999999999.99), date (required, date), category (required, in:[11 categories]), property_id (required, exists), description (nullable, max:500)
  - [ ] List endpoint supports filters: category, date range, property_id, unit_id
  - [ ] Routes: GET/POST `/expenses`, GET/PUT/DELETE `/expenses/{id}`
  - [ ] Delete permanently removes the record
- **Commit reminder**: Commit with message "feat: implement expense module with multi-link validation"

---

## Task 4.6: Write Feature Tests for Expense API

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Write feature tests for Expense API covering CRUD, multi-link validation, category validation, and filtering.
- **Acceptance Criteria**:
  - [ ] Test: create expense with required fields returns 201
  - [ ] Test: create expense with all optional links set returns 201
  - [ ] Test: create expense without property_id returns 422
  - [ ] Test: create expense with amount <= 0 returns 422
  - [ ] Test: create expense with invalid category returns 422
  - [ ] Test: create expense with unit not belonging to property returns 422
  - [ ] Test: create expense with entity belonging to different owner returns 422
  - [ ] Test: update expense changes fields correctly
  - [ ] Test: delete expense removes record
  - [ ] Test: delete non-existent expense returns 404
  - [ ] Test: list with category filter works
  - [ ] Test: list with date range filter works
  - [ ] Test: expenses scoped to authenticated owner
  - [ ] All tests pass: `php artisan test --filter=Expense`
- **Commit reminder**: Commit with message "test: add feature tests for expense api with multi-link validation"

---

## Task 4.7: Implement Payment and Expense Frontend Screens

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Build frontend screens for Payments (nested under booking detail) and Expenses (standalone list with filters). Include payment recording form, expense create/edit with multi-link selector.
- **Acceptance Criteria**:
  - [ ] Payment section on Booking detail page: list of payments, "Record Payment" button
  - [ ] Payment form: type (payment/refund) toggle, amount, date, method dropdown
  - [ ] Payment list shows type badge, amount, date, method
  - [ ] Delete payment button with confirmation dialog
  - [ ] Outstanding balance and overpaid amount displayed prominently
  - [ ] Expenses list page with filters: category, date range, property, unit
  - [ ] Expense create form: amount, date, category dropdown, property selector (required), optional entity selectors
  - [ ] Multi-link entity selectors load options filtered by selected property
  - [ ] Expense edit form with pre-populated fields
  - [ ] Delete expense with confirmation dialog
  - [ ] All API calls use TanStack Query hooks
- **Commit reminder**: Commit with message "feat: implement payment and expense frontend screens"

---

## Task 4.8: Implement Service Provider Frontend Screens

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Build frontend screens for Service Providers with list, create/edit forms, and deletion with protection warning.
- **Acceptance Criteria**:
  - [ ] Service Providers list page showing name, service type, phone
  - [ ] Create form: name, service type, phone, notes
  - [ ] Edit form with pre-populated fields
  - [ ] Delete button with confirmation dialog
  - [ ] Error message when deletion blocked by linked expenses
  - [ ] All API calls use TanStack Query hooks
- **Commit reminder**: Commit with message "feat: implement service provider frontend screens"

---

## Task 4.9: Add Booking Special Request Expense Tracking Note

- **Milestone**: v0.4.0 - Payments and Expenses
- **Status**: pending
- **Description**: Add an explicit expense/payment workflow note for special booking requests such as barbeque, late check-in, or other extra services, so the Owner can manually track these requests in expenses and payments without requiring online payment gateway integration.
- **Acceptance Criteria**:
  - [ ] Task documentation includes a note that booking `special_requests` may trigger separate expense/payment handling in MVP
  - [ ] Expense creation supports optional linkage to a Booking and can capture special-request related costs
  - [ ] Payment creation supports recording payments/refunds that correspond to special requests when no online payment gateway exists
  - [ ] UI and API task notes mention that special requests should be visible on booking detail pages for Owner review
- **Commit reminder**: Commit with message "docs: add booking special request expense tracking note"

---

## Checkpoint - v0.4.0

- [ ] Ensure all tests pass, payment status calculation works correctly, expenses with multi-links functional. Ask the user if questions arise.

---

## Milestone: v0.5.0 - Cleaning and Maintenance Workflow


## Task 5.1: Implement CreateCleaningTaskJob with Retry and Failure Handling

- **Milestone**: v0.5.0 - Cleaning and Maintenance Workflow
- **Status**: pending
- **Description**: Create the `CreateCleaningTaskJob` queue job that creates a CleaningTask when a booking is checked out. Implement retry logic (3 attempts, 60s backoff) and failure logging. Job receives `owner_id` as constructor parameter.
- **Acceptance Criteria**:
  - [ ] `CreateCleaningTaskJob` class in `app/Modules/CleaningTask/Jobs/`
  - [ ] Job constructor accepts: `bookingId`, `unitId`, `ownerId`
  - [ ] Job validates booking exists and is in "checked_out" status before creating task
  - [ ] Job creates CleaningTask with status "pending", linked to unit and booking, with explicit `owner_id`
  - [ ] `$tries = 3`, `$backoff = 60`, queue name = "cleaning-tasks"
  - [ ] `failed()` method logs permanent failure with booking_id, unit_id, error message
  - [ ] Job does NOT use `auth()->id()` — uses constructor `$ownerId` directly
  - [ ] Job dispatched from `BookingService::checkOut()` on the "cleaning-tasks" queue
- **Commit reminder**: Commit with message "feat: implement createcleaningtaskjob with retry and failure handling"

---

## Task 5.2: Implement Cleaning Task Module (Model, Migration, Service, Controller)

- **Milestone**: v0.5.0 - Cleaning and Maintenance Workflow
- **Status**: pending
- **Description**: Create the Cleaning Task module with migration, model, service, controller, and routes. Implement status transitions (pending → in_progress → completed), manual creation, notes update, and list with filters.
- **Acceptance Criteria**:
  - [ ] Migration creates `cleaning_tasks` table matching design schema
  - [ ] `CleaningTask` model with `HasOwner` trait, fillable fields, relationships
  - [ ] `CleaningTaskPolicy` for ownership checks
  - [ ] `CleaningTaskService` with methods: `list` (filterable by status, unit), `create` (manual), `show`, `updateStatus`, `updateNotes`
  - [ ] Status transitions enforced: only pending→in_progress and in_progress→completed allowed
  - [ ] Invalid transition returns 422 with current status and reason
  - [ ] Manual creation requires unit_id, optional booking_id, validates unit exists and belongs to owner
  - [ ] Notes validation: max 1000 characters
  - [ ] Routes: GET/POST `/cleaning-tasks`, GET `/cleaning-tasks/{id}`, PATCH `/cleaning-tasks/{id}/status`, PATCH `/cleaning-tasks/{id}/notes`
- **Commit reminder**: Commit with message "feat: implement cleaning task module with status transitions"

---

## Task 5.3: Write Feature Tests for Cleaning Task API and Job

- **Milestone**: v0.5.0 - Cleaning and Maintenance Workflow
- **Status**: pending
- **Description**: Write feature tests for Cleaning Task API and the CreateCleaningTaskJob, covering automatic creation on check-out, manual creation, status transitions, and job retry/failure behavior.
- **Acceptance Criteria**:
  - [ ] Test: check-out booking dispatches CreateCleaningTaskJob
  - [ ] Test: job creates cleaning task with correct unit_id, booking_id, owner_id, status "pending"
  - [ ] Test: job with non-existent booking does not create task
  - [ ] Test: job with booking not in "checked_out" status does not create task
  - [ ] Test: manual create cleaning task returns 201
  - [ ] Test: manual create with non-existent unit returns 404
  - [ ] Test: status transition pending→in_progress succeeds
  - [ ] Test: status transition in_progress→completed succeeds
  - [ ] Test: status transition pending→completed returns 422
  - [ ] Test: status transition completed→pending returns 422
  - [ ] Test: update notes saves correctly
  - [ ] Test: notes exceeding 1000 chars returns 422
  - [ ] Test: list with status filter works
  - [ ] Test: cleaning tasks scoped to authenticated owner
  - [ ] All tests pass: `php artisan test --filter=CleaningTask`
- **Commit reminder**: Commit with message "test: add feature tests for cleaning task api and job"

---

## Task 5.4: Implement Maintenance Task Module (Model, Migration, Service, Controller)

- **Milestone**: v0.5.0 - Cleaning and Maintenance Workflow
- **Status**: pending
- **Description**: Create the Maintenance Task module with migration, model, service, form requests, controller, and routes. Implement CRUD with status management, priority levels, optional links to property/unit/service provider.
- **Acceptance Criteria**:
  - [ ] Migration creates `maintenance_tasks` table matching design schema
  - [ ] `MaintenanceTask` model with `HasOwner` trait, fillable fields, relationships (belongsTo Property, Unit, ServiceProvider optional)
  - [ ] `MaintenanceTaskPolicy` for ownership checks
  - [ ] `MaintenanceTaskService` with CRUD methods, explicit owner_id filtering
  - [ ] `StoreMaintenanceTaskRequest` validates: title (required, max:200), priority (required, in:low,medium,high), property_id or unit_id required (at least one), scheduled_date (nullable, date), service_provider_id (nullable, exists)
  - [ ] Statuses: open, in_progress, completed, cancelled
  - [ ] Initial status on creation: "open"
  - [ ] List supports filters: status, priority, property_id, unit_id
  - [ ] Routes: GET/POST `/maintenance-tasks`, GET/PUT `/maintenance-tasks/{id}`
  - [ ] Validation: if both property_id and unit_id missing, return 422
- **Commit reminder**: Commit with message "feat: implement maintenance task module with crud and filtering"

---

## Task 5.5: Write Feature Tests for Maintenance Task API

- **Milestone**: v0.5.0 - Cleaning and Maintenance Workflow
- **Status**: pending
- **Description**: Write feature tests for Maintenance Task API covering CRUD, validation, filtering, and service provider linking.
- **Acceptance Criteria**:
  - [ ] Test: create maintenance task with valid data returns 201 with status "open"
  - [ ] Test: create without title returns 422
  - [ ] Test: create without property_id and unit_id returns 422
  - [ ] Test: create with invalid priority returns 422
  - [ ] Test: update status to "completed" succeeds
  - [ ] Test: link service provider on create/update works
  - [ ] Test: list with status filter works
  - [ ] Test: list with priority filter works
  - [ ] Test: maintenance tasks scoped to authenticated owner
  - [ ] All tests pass: `php artisan test --filter=MaintenanceTask`
- **Commit reminder**: Commit with message "test: add feature tests for maintenance task api"

---

## Task 5.6: Implement Cleaning and Maintenance Frontend Screens

- **Milestone**: v0.5.0 - Cleaning and Maintenance Workflow
- **Status**: pending
- **Description**: Build frontend screens for Cleaning Tasks and Maintenance Tasks using MYDS components. Include list views with filters, status transition controls, and create/edit forms.
- **Acceptance Criteria**:
  - [ ] Cleaning Tasks list page with filters: status dropdown, unit dropdown
  - [ ] Cleaning Task detail page with status badge and transition buttons (Mark In Progress, Mark Completed)
  - [ ] Cleaning Task notes editor (textarea, max 1000 chars)
  - [ ] Manual "Create Cleaning Task" form: unit selector, optional booking selector
  - [ ] Maintenance Tasks list page with filters: status, priority, property, unit
  - [ ] Maintenance Task create form: title, description, priority dropdown, property/unit selector, service provider selector, scheduled date
  - [ ] Maintenance Task edit form with pre-populated fields
  - [ ] Maintenance Task detail page with status badge and update controls
  - [ ] Priority displayed with color-coded badges (low=green, medium=yellow, high=red)
  - [ ] All API calls use TanStack Query hooks
- **Commit reminder**: Commit with message "feat: implement cleaning and maintenance task frontend screens"

---

## Checkpoint - v0.5.0

- [ ] Ensure all tests pass, cleaning task auto-creation on check-out works, maintenance tasks functional. Ask the user if questions arise.

---

## Milestone: v0.6.0 - Dashboard and Reporting


## Task 6.1: Implement Dashboard API Endpoints

- **Milestone**: v0.6.0 - Dashboard and Reporting
- **Status**: pending
- **Description**: Create the Dashboard module with service and controller. Implement all 7 dashboard endpoints: monthly income, monthly expenses, net profit, outstanding balance, booking counts by status, pending cleaning tasks, pending maintenance tasks. All metrics scoped to authenticated owner.
- **Acceptance Criteria**:
  - [ ] `DashboardService` with methods for each metric, all filtered by `owner_id`
  - [ ] `GET /dashboard/income` — sum of payment-type amounts for current calendar month
  - [ ] `GET /dashboard/expenses` — sum of expense amounts for current calendar month
  - [ ] `GET /dashboard/net-profit` — income minus expenses for current month
  - [ ] `GET /dashboard/outstanding` — total outstanding across bookings with status "unpaid" or "partial" (sum of total_amount - net_paid_amount where payment_status in [unpaid, partial])
  - [ ] `GET /dashboard/booking-counts` — count of bookings by status for current month (based on check_in_date)
  - [ ] `GET /dashboard/pending-cleaning` — list of cleaning tasks with status "pending" or "in_progress"
  - [ ] `GET /dashboard/pending-maintenance` — list of maintenance tasks with status "open" or "in_progress"
  - [ ] All endpoints return JSON with consistent response structure
  - [ ] All queries explicitly filter by authenticated owner's ID
- **Commit reminder**: Commit with message "feat: implement dashboard api endpoints for all metrics"

---

## Task 6.2: Write Feature Tests for Dashboard API

- **Milestone**: v0.6.0 - Dashboard and Reporting
- **Status**: pending
- **Description**: Write feature tests for all Dashboard API endpoints verifying correct calculations, owner scoping, and edge cases (no data, multiple months).
- **Acceptance Criteria**:
  - [ ] Test: income endpoint sums only payment-type amounts in current month
  - [ ] Test: income endpoint excludes refund-type amounts
  - [ ] Test: income endpoint excludes payments from other months
  - [ ] Test: expenses endpoint sums only current month expenses
  - [ ] Test: net-profit equals income minus expenses
  - [ ] Test: outstanding sums correctly across multiple bookings
  - [ ] Test: outstanding excludes "paid" and "overpaid" bookings
  - [ ] Test: booking-counts returns correct counts per status
  - [ ] Test: pending-cleaning returns only pending/in_progress tasks
  - [ ] Test: pending-maintenance returns only open/in_progress tasks
  - [ ] Test: all endpoints return only authenticated owner's data
  - [ ] Test: endpoints return zero/empty when no data exists
  - [ ] All tests pass: `php artisan test --filter=Dashboard`
- **Commit reminder**: Commit with message "test: add feature tests for dashboard api endpoints"

---

## Task 6.3: Implement Dashboard Frontend with Independent Loading

- **Milestone**: v0.6.0 - Dashboard and Reporting
- **Status**: pending
- **Description**: Build the Dashboard frontend page with independent loading for each metric card. Each card fetches its own data and shows a loading skeleton while fetching. Use MYDS cards and custom KPI components.
- **Acceptance Criteria**:
  - [ ] Dashboard page with 7 metric cards arranged in a responsive grid
  - [ ] Each card uses its own TanStack Query hook (independent fetching)
  - [ ] Loading skeleton shown per card while data is being fetched
  - [ ] Income card: displays formatted currency amount
  - [ ] Expenses card: displays formatted currency amount
  - [ ] Net Profit card: displays formatted amount (green if positive, red if negative)
  - [ ] Outstanding card: displays total outstanding balance
  - [ ] Booking Counts card: displays counts by status with badges
  - [ ] Pending Cleaning card: displays list of pending/in-progress tasks with unit names
  - [ ] Pending Maintenance card: displays list of open/in-progress tasks with priority badges
  - [ ] Error state per card (shows retry button if fetch fails)
  - [ ] Dashboard is the default landing page after login
- **Commit reminder**: Commit with message "feat: implement dashboard frontend with independent loading cards"

---

## Task 6.4: Add Quality Gates to CI (Pint, PHPStan, ESLint, TypeScript)

- **Milestone**: v0.6.0 - Dashboard and Reporting
- **Status**: pending
- **Description**: Add code quality tools and integrate them into the CI pipeline. Backend: Laravel Pint (code style) and PHPStan/Larastan (static analysis). Frontend: ESLint and TypeScript strict check. Fix any existing violations.
- **Acceptance Criteria**:
  - [ ] `backend/composer.json` includes `laravel/pint` and `larastan/larastan` as dev dependencies
  - [ ] `backend/pint.json` configured with Laravel preset
  - [ ] `backend/phpstan.neon` configured at level 6 minimum
  - [ ] `frontend/package.json` includes `eslint` with TypeScript and React plugins
  - [ ] `.eslintrc.cjs` or `eslint.config.js` configured for TypeScript + React
  - [ ] CI workflow updated with quality gate jobs: `pint --test`, `phpstan analyse`, `eslint .`, `tsc --noEmit`
  - [ ] All quality gates pass on current codebase (fix any violations)
  - [ ] Quality gates run in parallel with test jobs in CI
- **Commit reminder**: Commit with message "ci: add quality gates - pint, phpstan, eslint, typescript check"

---

## Task 6.5: Add Property-Based Tests for Payment Status Derivation

- **Milestone**: v0.6.0 - Dashboard and Reporting
- **Status**: pending
- **Description**: Install a property-based testing library for PHP and write property tests for the payment status derivation logic. Tests should verify that for any sequence of payments/refunds, the status is correctly derived per the design's Correctness Property 1 and Property 2.
- **Acceptance Criteria**:
  - [ ] Property-based testing library installed (e.g., `phpunit/phpunit` with data providers generating random sequences, or a dedicated PBT library)
  - [ ] `tests/Property/PaymentStatusTest.php` created
  - [ ] **Property 1 test**: For any booking total > 0 and any sequence of payment/refund records (positive amounts), net_paid_amount = sum(payments) - sum(refunds), and status derived correctly (unpaid/partial/paid/overpaid/refunded)
  - [ ] **Property 2 test**: For any booking with total and net_paid, outstanding = max(0, total - net), overpaid = max(0, net - total), and they are mutually exclusive
  - [ ] Tests generate random: total amounts (0.01-999999.99), payment sequences (1-20 records), amounts per record
  - [ ] Tests run with at least 100 random cases each
  - [ ] All property tests pass: `php artisan test --filter=Property`
- **Commit reminder**: Commit with message "test: add property-based tests for payment status derivation"

---

## Task 6.6: Add Property-Based Tests for Booking Date Overlap Logic

- **Milestone**: v0.6.0 - Dashboard and Reporting
- **Status**: pending
- **Description**: Write property-based tests for the booking date overlap validation logic. Tests should verify that for any set of date ranges, overlaps are correctly detected per the design's Correctness Property 3.
- **Acceptance Criteria**:
  - [ ] `tests/Property/BookingOverlapTest.php` created
  - [ ] **Property 3 test**: For any two bookings on the same unit, they overlap if and only if `booking1.check_in < booking2.check_out AND booking1.check_out > booking2.check_in`
  - [ ] **Property 4 test (if defined)**: Non-overlapping bookings are always accepted; overlapping bookings are always rejected
  - [ ] Tests generate random: check-in dates, stay durations (1-30 days), multiple booking sequences
  - [ ] Tests verify both positive (overlap detected) and negative (no overlap, booking accepted) cases
  - [ ] Tests run with at least 100 random cases
  - [ ] All property tests pass: `php artisan test --filter=Property`
- **Commit reminder**: Commit with message "test: add property-based tests for booking date overlap logic"

---

## Checkpoint - v0.6.0

- [ ] Ensure all tests pass (unit, feature, property-based), quality gates pass in CI, dashboard displays correct metrics. Ask the user if questions arise.

---

## Milestone: v1.0.0 - Owner MVP Release


## Task 7.1: Manual Smoke Testing of Full Workflow

- **Milestone**: v1.0.0 - Owner MVP Release
- **Status**: pending
- **Description**: Perform a complete manual smoke test of the full owner workflow: register → create property → create unit → create guest → create booking → check-in → check-out → verify cleaning task created → record payments → create expense → create maintenance task → verify dashboard metrics. Document any bugs found.
- **Acceptance Criteria**:
  - [ ] Complete workflow tested end-to-end in Docker Compose environment
  - [ ] Register new owner account and login
  - [ ] Create property, create unit under property
  - [ ] Create guest, create booking for guest+unit
  - [ ] Check-in booking, check-out booking
  - [ ] Verify cleaning task auto-created with status "pending"
  - [ ] Record payment, verify payment status updates
  - [ ] Record refund, verify status recalculates
  - [ ] Create expense linked to property and optional entities
  - [ ] Create service provider, create maintenance task
  - [ ] Verify dashboard shows correct income, expenses, net profit, outstanding, counts
  - [ ] All bugs documented as GitHub Issues with "bug" label
- **Commit reminder**: Commit with message "test: complete manual smoke testing of full workflow"

---

## Task 7.2: Bug Fixes and Polish

- **Milestone**: v1.0.0 - Owner MVP Release
- **Status**: pending
- **Description**: Fix all bugs discovered during smoke testing. Address any UI polish issues, error message improvements, or edge cases found. Ensure all tests still pass after fixes.
- **Acceptance Criteria**:
  - [ ] All bugs from smoke testing resolved and closed
  - [ ] All backend tests pass: `php artisan test`
  - [ ] All frontend tests pass: `npx vitest --run`
  - [ ] All quality gates pass: Pint, PHPStan, ESLint, TypeScript
  - [ ] CI pipeline passes on main branch
  - [ ] No console errors in browser during normal usage
- **Commit reminder**: Commit with message "fix: resolve bugs from smoke testing"

---

## Task 7.3: Documentation Finalization and GitHub Release v1.0.0

- **Milestone**: v1.0.0 - Owner MVP Release
- **Status**: pending
- **Description**: Finalize all documentation: update README with complete setup instructions, API documentation, and known limitations. Create the GitHub Release v1.0.0 with release notes summarizing all features.
- **Acceptance Criteria**:
  - [ ] README.md updated with: complete setup guide, all environment variables documented, API endpoint summary, tech stack versions
  - [ ] `docs/api.md` created with endpoint reference (or link to auto-generated docs)
  - [ ] `CHANGELOG.md` created with entries for v0.1.0 through v1.0.0
  - [ ] All GitHub milestones closed
  - [ ] GitHub Release v1.0.0 created with: feature summary, setup instructions, known limitations, future roadmap
  - [ ] Release tagged as `v1.0.0` in Git
  - [ ] Project board shows all issues in "Done" column
- **Commit reminder**: Commit with message "docs: finalize documentation and create v1.0.0 release"

---

## Final Checkpoint - v1.0.0

- [ ] Ensure the full application works end-to-end, all tests and quality gates pass, documentation is complete, and the GitHub Release is published. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP (none in this plan — all tasks are required for MVP)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each milestone
- Property-based tests (Tasks 6.5, 6.6) validate universal correctness properties from the design document
- CI is phased: initial pipeline (Task 1.9), quality gates added after tools configured (Task 6.4), property tests after modules exist (Tasks 6.5, 6.6)
- Frontend tests added after first working UI (Task 3.8)
- No Repository layer — Services query Eloquent directly
- Owner scoping via explicit `owner_id` filtering in services (not global scope)
- Queue jobs receive `owner_id` as constructor parameter (never use `auth()->id()` in jobs)
