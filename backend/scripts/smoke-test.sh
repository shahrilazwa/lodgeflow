#!/bin/bash
# =============================================================================
# LodgeFlow Smoke Test Script
# =============================================================================
# Exercises the full owner workflow via API calls.
#
# Run: docker compose exec api bash scripts/smoke-test.sh
# Prerequisites: fresh database (docker compose run --rm api php artisan migrate:fresh)
# WARNING: Creates test data. Run against a fresh database only.
# =============================================================================

set -e

BASE="http://localhost:8000/api/v1"
CT="Content-Type: application/json"
AC="Accept: application/json"
PASS=0
FAIL=0

check() {
    local desc="$1" expected="$2" actual="$3"
    if [ "$actual" -eq "$expected" ]; then
        echo "  ✓ $desc (HTTP $actual)"
        PASS=$((PASS + 1))
    else
        echo "  ✗ $desc (expected $expected, got $actual)"
        FAIL=$((FAIL + 1))
    fi
}

echo "============================================="
echo "LodgeFlow Smoke Test"
echo "============================================="

# Step 1: Health
echo ""
echo "--- Step 1: Health Check ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$AC" "$BASE/health")
check "Health endpoint" 200 "$S"

# Step 2: Register
echo ""
echo "--- Step 2: Register Owner ---"
RESP=$(curl -s -H "$CT" -H "$AC" -X POST "$BASE/auth/register" \
    -d '{"name":"Smoke Owner","email":"smoke@test.com","password":"password123","password_confirmation":"password123"}')
S=$(echo "$RESP" | grep -c '"token"' > /dev/null 2>&1 && echo 201 || echo 500)
TOKEN=$(echo "$RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    echo "  ✓ Owner registration (token received)"
    PASS=$((PASS + 1))
else
    echo "  ✗ Owner registration (no token in response)"
    echo "  Response: $RESP"
    FAIL=$((FAIL + 1))
    echo "Aborting."
    exit 1
fi
AUTH="Authorization: Bearer $TOKEN"

# Step 3: Me
echo ""
echo "--- Step 3: Get Profile ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$AC" -H "$AUTH" "$BASE/auth/me")
check "GET /auth/me" 200 "$S"

# Step 4: Create Property
echo ""
echo "--- Step 4: Create Property ---"
RESP=$(curl -s -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/properties" \
    -d '{"name":"Sunrise Homestay","address":"123 Jalan Bunga","description":"Cozy homestay"}')
PROPERTY_ID=$(echo "$RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -n "$PROPERTY_ID" ]; then
    echo "  ✓ Create property (ID: $PROPERTY_ID)"
    PASS=$((PASS + 1))
else
    echo "  ✗ Create property (no ID)"
    FAIL=$((FAIL + 1))
fi

# Step 5: Create Unit
echo ""
echo "--- Step 5: Create Unit ---"
RESP=$(curl -s -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/properties/$PROPERTY_ID/units" \
    -d '{"name":"Room 101","type":"room","description":"Standard room"}')
UNIT_ID=$(echo "$RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -n "$UNIT_ID" ]; then
    echo "  ✓ Create unit (ID: $UNIT_ID)"
    PASS=$((PASS + 1))
else
    echo "  ✗ Create unit (no ID)"
    FAIL=$((FAIL + 1))
fi

# Step 6: Create Guest
echo ""
echo "--- Step 6: Create Guest ---"
RESP=$(curl -s -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/guests" \
    -d '{"full_name":"Ahmad bin Ali","phone":"0123456789","email":"ahmad@example.com"}')
GUEST_ID=$(echo "$RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -n "$GUEST_ID" ]; then
    echo "  ✓ Create guest (ID: $GUEST_ID)"
    PASS=$((PASS + 1))
else
    echo "  ✗ Create guest (no ID)"
    FAIL=$((FAIL + 1))
fi

# Step 7: Create Booking
echo ""
echo "--- Step 7: Create Booking ---"
RESP=$(curl -s -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/bookings" \
    -d "{\"unit_id\":$UNIT_ID,\"guest_id\":$GUEST_ID,\"check_in_date\":\"2026-06-01\",\"check_out_date\":\"2026-06-03\",\"total_amount\":500}")
BOOKING_ID=$(echo "$RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -n "$BOOKING_ID" ]; then
    echo "  ✓ Create booking (ID: $BOOKING_ID)"
    PASS=$((PASS + 1))
else
    echo "  ✗ Create booking (no ID). Response: $RESP"
    FAIL=$((FAIL + 1))
fi

# Step 8: Check In
echo ""
echo "--- Step 8: Check In ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$CT" -H "$AC" -H "$AUTH" -X PATCH "$BASE/bookings/$BOOKING_ID/check-in")
check "Check in" 200 "$S"

# Step 9: Record Payment
echo ""
echo "--- Step 9: Record Payment ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/bookings/$BOOKING_ID/payments" \
    -d '{"type":"payment","amount":300,"payment_date":"2026-06-01","payment_method":"cash"}')
check "Record payment" 201 "$S"

# Verify payment status recalculated to partial (300 of 500 paid)
BOOKING_BODY=$(curl -s -H "$AC" -H "$AUTH" "$BASE/bookings/$BOOKING_ID")
if echo "$BOOKING_BODY" | grep -q '"payment_status":"partial"'; then
    echo "  ✓ Payment status recalculated to partial"
    PASS=$((PASS + 1))
else
    echo "  ✗ Payment status not partial after RM300 on RM500 booking"
    echo "  Response: $BOOKING_BODY"
    FAIL=$((FAIL + 1))
fi

# Step 10: Check Out
echo ""
echo "--- Step 10: Check Out ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$CT" -H "$AC" -H "$AUTH" -X PATCH "$BASE/bookings/$BOOKING_ID/check-out")
check "Check out" 200 "$S"

# Step 11: Cleaning Tasks
echo ""
echo "--- Step 11: Verify Cleaning Task Auto-Created ---"
# Allow queue worker time to process the job (async via Redis)
sleep 3
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$AC" -H "$AUTH" "$BASE/cleaning-tasks")
check "List cleaning tasks" 200 "$S"

# Verify a cleaning task was actually created with status pending
CT_BODY=$(curl -s -H "$AC" -H "$AUTH" "$BASE/cleaning-tasks")
if echo "$CT_BODY" | grep -q '"status":"pending"'; then
    echo "  ✓ Cleaning task auto-created with status pending"
    PASS=$((PASS + 1))
else
    echo "  ✗ No cleaning task with status pending found after checkout"
    echo "    (Queue worker may not have processed the job yet)"
    echo "  Response: $CT_BODY"
    FAIL=$((FAIL + 1))
fi

# Step 12: Create Expense
echo ""
echo "--- Step 12: Create Expense ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/expenses" \
    -d "{\"amount\":75,\"date\":\"2026-06-02\",\"category\":\"cleaning_services\",\"property_id\":$PROPERTY_ID}")
check "Create expense" 201 "$S"

# Step 13: Service Provider
echo ""
echo "--- Step 13: Service Provider ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/service-providers" \
    -d '{"name":"CleanPro","service_type":"cleaning","phone":"0198765432"}')
check "Create service provider" 201 "$S"

# Step 13b: Record Refund and verify status recalculation
echo ""
echo "--- Step 13b: Record Refund ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/bookings/$BOOKING_ID/payments" \
    -d '{"type":"refund","amount":300,"payment_date":"2026-06-03","payment_method":"cash"}')
check "Record refund" 201 "$S"

# Verify payment status recalculated to unpaid (net = 300 - 300 = 0)
BOOKING_BODY=$(curl -s -H "$AC" -H "$AUTH" "$BASE/bookings/$BOOKING_ID")
if echo "$BOOKING_BODY" | grep -q '"payment_status":"unpaid"'; then
    echo "  ✓ Refund recalculates status to unpaid (net=0)"
    PASS=$((PASS + 1))
else
    echo "  ✗ Refund did not recalculate status correctly"
    echo "  Response: $BOOKING_BODY"
    FAIL=$((FAIL + 1))
fi

# Step 14: Maintenance Task
echo ""
echo "--- Step 14: Maintenance Task ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/maintenance-tasks" \
    -d "{\"title\":\"Fix tap\",\"priority\":\"medium\",\"property_id\":$PROPERTY_ID}")
check "Create maintenance task" 201 "$S"

# Step 15: Dashboard
echo ""
echo "--- Step 15: Dashboard ---"
for ep in income expenses net-profit outstanding booking-counts pending-cleaning pending-maintenance; do
    S=$(curl -s -o /dev/null -w "%{http_code}" -H "$AC" -H "$AUTH" "$BASE/dashboard/$ep")
    check "Dashboard /$ep" 200 "$S"
done

# Step 16: Logout
echo ""
echo "--- Step 16: Logout ---"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$CT" -H "$AC" -H "$AUTH" -X POST "$BASE/auth/logout")
check "Logout" 200 "$S"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "$AC" -H "$AUTH" "$BASE/auth/me")
check "Token revoked" 401 "$S"

# Summary
echo ""
echo "============================================="
echo "RESULTS: $PASS passed, $FAIL failed (total $((PASS + FAIL)))"
echo "============================================="
[ "$FAIL" -eq 0 ] && echo "STATUS: ALL PASSED" || echo "STATUS: FAILED"
[ "$FAIL" -eq 0 ]
