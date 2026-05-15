# ADR-001: Modular Monolith Backend Architecture

## Status

Accepted

## Date

2026-05-15

## Context

LodgeFlow is a learning project built by a single developer. The backend needs clear domain boundaries to keep the codebase organised as it grows, but the deployment and operational complexity of microservices is not justified at this scale.

## Decision

Structure the Laravel backend as a modular monolith with domain modules under `app/Modules/`. Each module encapsulates its own controllers, services, models, policies, form requests, jobs, and routes.

### Modules

- Property
- Unit
- Guest
- Booking
- Payment
- Expense
- ServiceProvider
- CleaningTask
- MaintenanceTask
- Dashboard

Authentication controllers remain in the standard Laravel location (`app/Http/Controllers/Auth/`).

## Rationale

- **Single deployment unit** — simple Docker setup, no inter-service communication
- **Clear domain boundaries** — each module owns its data and logic, preparing for future extraction if needed
- **Shared database** — simplifies transactions and referential integrity across modules
- **No Repository layer** — services query Eloquent directly to reduce boilerplate; repositories can be introduced later if needed
- **Suitable for learning** — the developer can understand the full system without distributed systems complexity

## Consequences

- All modules share the same database and deployment artifact
- Cross-module dependencies must be managed through service interfaces (not direct model access across modules where possible)
- If the application scales significantly, individual modules can be extracted into separate services later
- No microservice overhead (service discovery, API gateways, distributed tracing) in the MVP

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|-----------------|
| Microservices | Too complex for a single-developer learning project |
| Standard Laravel (no modules) | Becomes disorganised as the codebase grows |
| Domain-Driven Design (full DDD) | Overkill for MVP; modular monolith captures the key benefit (bounded contexts) without the ceremony |
