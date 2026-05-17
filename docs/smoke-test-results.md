# Smoke Test Results — LodgeFlow Owner MVP

**Date:** 2026-05-17
**Environment:** Docker Compose (local development)
**Database:** PostgreSQL 16 (fresh migration)

---

## Summary

| Metric | Value |
|--------|-------|
| Total checks | 27 |
| Passed | 27 |
| Failed | 0 |
| Status | **ALL PASSED** |

---

## Workflow Tested

The smoke test exercises the complete owner workflow end-to-end:

1. ✓ Health endpoint responds
2. ✓ Owner registration (creates account, returns token)
3. ✓ Get owner profile (/auth/me)
4. ✓ Create property
5. ✓ Create unit under property
6. ✓ Create guest
7. ✓ Create booking (guest + unit + dates + amount)
8. ✓ Check in booking (confirmed → checked_in)
9. ✓ Record payment (RM 300 partial on RM 500 booking)
10. ✓ **Payment status recalculated to "partial"**
11. ✓ Check out booking (checked_in → checked_out, dispatches cleaning job)
12. ✓ List cleaning tasks endpoint responds
13. ✓ **Cleaning task auto-created with status "pending"** (via queue worker)
14. ✓ Create expense (linked to property)
15. ✓ Create service provider
16. ✓ Record refund (RM 300 refund)
17. ✓ **Refund recalculates payment status to "unpaid" (net = 0)**
18. ✓ Create maintenance task (linked to property)
19. ✓ Dashboard income endpoint
20. ✓ Dashboard expenses endpoint
21. ✓ Dashboard net-profit endpoint
22. ✓ Dashboard outstanding endpoint
23. ✓ Dashboard booking-counts endpoint
24. ✓ Dashboard pending-cleaning endpoint
25. ✓ Dashboard pending-maintenance endpoint
26. ✓ Logout (revokes token)
27. ✓ Token revoked (subsequent request returns 401)

---

## Key Verifications

| Criterion | Verified |
|-----------|----------|
| Cleaning task auto-created on checkout | ✓ Status "pending", linked to unit |
| Payment status recalculation (partial) | ✓ RM 300 of RM 500 → "partial" |
| Refund recalculation (unpaid) | ✓ RM 300 payment - RM 300 refund = net 0 → "unpaid" |
| Token revocation on logout | ✓ Subsequent request returns 401 |
| Owner scoping (implicit) | ✓ All operations use authenticated owner's token |

---

## How to Run

```bash
# 1. Ensure Docker services are running
docker compose up -d

# 2. Fresh database
docker compose run --rm api php artisan migrate:fresh

# 3. Set up .env (if not already done)
docker compose exec api bash -c "cp .env.example .env && php artisan key:generate"

# 4. Restart queue worker (to pick up fresh config)
docker compose restart queue-worker

# 5. Run smoke test
docker compose exec api bash scripts/smoke-test.sh
```

---

## Bugs Found

None. All 27 checks passed.

---

## Known Limitations

- The smoke test includes a 3-second sleep after checkout to allow the queue worker to process the cleaning task job. In slow environments, this may need to be increased.
- The smoke test verifies API responses but does not verify frontend rendering.
- The smoke test creates data in the database. Always run against a fresh database.
- The container's `.env` must be set up from `.env.example` before running (not an application bug — it's a local development setup step).
