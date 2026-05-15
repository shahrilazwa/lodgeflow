# GitHub Workflow — LodgeFlow Owner MVP

This document defines the GitHub project management setup for LodgeFlow, including milestones, labels, project board, issue workflow, branching strategy, and release plan.

---

## Milestones

Each milestone represents a shippable increment of the application.

| Milestone | Title | Description |
|-----------|-------|-------------|
| v0.1.0 | Project Foundation | Git/GitHub setup, Docker Compose, Laravel skeleton, React+Vite+MYDS skeleton, initial CI |
| v0.2.0 | Auth, Properties, and Units | Sanctum auth, owner scoping, Property CRUD, Unit CRUD, frontend screens |
| v0.3.0 | Guests and Bookings | Guest CRUD, Booking CRUD with status transitions and overlap validation, frontend screens |
| v0.4.0 | Payments and Expenses | Payment/refund recording, expense multi-link CRUD, service provider CRUD, frontend screens |
| v0.5.0 | Cleaning and Maintenance Workflow | Cleaning task queue job, maintenance task CRUD, frontend screens |
| v0.6.0 | Dashboard and Reporting | Dashboard API and frontend, quality gates (Pint, PHPStan, ESLint, TS), property-based tests |
| v1.0.0 | Owner MVP Release | Manual smoke testing, bug fixes, documentation, GitHub Release |

---

## Labels

Labels categorise issues by type and area.

| Label | Color | Description |
|-------|-------|-------------|
| `backend` | #0E8A16 (green) | Backend Laravel API work |
| `frontend` | #1D76DB (blue) | Frontend React/Vite work |
| `infra` | #D93F0B (orange) | Docker, CI, deployment, environment |
| `testing` | #FBCA04 (yellow) | Tests, quality gates, property-based tests |
| `docs` | #C5DEF5 (light blue) | Documentation, README, ADRs |
| `bug` | #D73A4A (red) | Something is broken |
| `enhancement` | #A2EEEF (teal) | New feature or improvement |
| `good first issue` | #7057FF (purple) | Simple task suitable for getting started |

---

## Project Board

Use a GitHub Project (Projects v2) with a Board view.

### Columns

| Column | Purpose |
|--------|---------|
| Backlog | Issues not yet planned for the current milestone |
| To Do | Issues planned for the current milestone, ready to start |
| In Progress | Issues actively being worked on |
| In Review | Issues with a PR open awaiting review |
| Done | Issues completed and merged |

### Automation (optional)

- When an issue is assigned → move to "To Do"
- When a PR is opened linking an issue → move to "In Progress"
- When a PR is merged → move to "Done"

---

## Issue Workflow

### Creating Issues

Each major task from `tasks.md` maps to one GitHub Issue. Use this template:

```
**Title**: [Task ID] Short description
**Milestone**: vX.Y.Z
**Labels**: backend, frontend, infra, testing, docs (as applicable)

**Description**:
[Copy the task description from tasks.md]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- ...
```

### Issue Lifecycle

1. **Open** — Issue created, assigned to milestone, placed in Backlog or To Do
2. **In Progress** — Developer starts work, creates a feature branch
3. **In Review** — PR opened, linked to issue
4. **Closed** — PR merged, issue auto-closed via commit message or PR link

### Linking PRs to Issues

Use closing keywords in PR descriptions:
- `Closes #123` or `Fixes #123`

---

## Branching Workflow

### Branch Strategy: GitHub Flow (simplified)

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Protected. All merges via PR. |
| `feature/<issue-number>-<short-name>` | Feature branches for individual tasks |
| `fix/<issue-number>-<short-name>` | Bug fix branches |

### Rules

- All work happens on feature/fix branches off `main`
- PRs require CI to pass before merge
- Branch protection on `main`: require PR, require CI status checks
- Squash merge preferred for clean history
- Delete branch after merge

### Branch Naming Examples

```
feature/12-docker-compose-setup
feature/15-property-crud-api
feature/22-booking-status-transitions
fix/45-payment-status-calculation
```

---

## Release Strategy

### Versioning

Follow Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): MVP release
- **MINOR** (0.x.0): Each milestone completion
- **PATCH** (0.x.y): Bug fixes within a milestone

### Release Process

1. Complete all issues in the milestone
2. Close the milestone on GitHub
3. Create a Git tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
4. Push the tag: `git push origin vX.Y.Z`
5. Create a GitHub Release from the tag with:
   - Release title: `vX.Y.Z - [Milestone Title]`
   - Release notes: summary of features, fixes, and known issues
   - Link to closed milestone

### Release Schedule

| Release | Trigger |
|---------|---------|
| v0.1.0 | Project foundation complete, all services boot, CI passes |
| v0.2.0 | Auth + Properties + Units functional end-to-end |
| v0.3.0 | Guests + Bookings with status transitions working |
| v0.4.0 | Payments + Expenses + Service Providers working |
| v0.5.0 | Cleaning + Maintenance workflow complete |
| v0.6.0 | Dashboard + quality gates + property-based tests |
| v1.0.0 | Full MVP smoke-tested, documented, and released |

---

## Initial Issues to Create

Create at least one issue per milestone to seed the project board:

| Issue Title | Milestone | Labels |
|-------------|-----------|--------|
| Set up Docker Compose with all services | v0.1.0 | infra |
| Scaffold Laravel backend with PostgreSQL and Redis | v0.1.0 | backend, infra |
| Scaffold React + Vite + MYDS frontend | v0.1.0 | frontend |
| Set up initial CI pipeline | v0.1.0 | infra, testing |
| Implement Sanctum auth API | v0.2.0 | backend |
| Implement Property CRUD API | v0.2.0 | backend |
| Implement Unit CRUD API | v0.2.0 | backend |
| Implement Property and Unit frontend screens | v0.2.0 | frontend |
| Implement Guest CRUD API | v0.3.0 | backend |
| Implement Booking API with status transitions | v0.3.0 | backend |
| Implement Payment/refund recording and status calculation | v0.4.0 | backend |
| Implement Expense CRUD with multi-link validation | v0.4.0 | backend |
| Implement CreateCleaningTaskJob with retry | v0.5.0 | backend |
| Implement Dashboard API endpoints | v0.6.0 | backend |
| Implement Dashboard frontend with independent loading | v0.6.0 | frontend |
| Add quality gates to CI (Pint, PHPStan, ESLint, TS) | v0.6.0 | testing, infra |
| Manual smoke testing of full workflow | v1.0.0 | testing |
| Create GitHub Release v1.0.0 | v1.0.0 | docs |
