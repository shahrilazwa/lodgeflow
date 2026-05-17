# API Reference — LodgeFlow v1.0.0

Base URL: `http://localhost:8000/api/v1`

All endpoints except auth/register and auth/login require a Bearer token in the `Authorization` header.

---

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Register new owner | No |
| POST | /auth/login | Login, returns token | No |
| POST | /auth/logout | Revoke current token | Yes |
| GET | /auth/me | Get authenticated owner profile | Yes |

### POST /auth/register

```json
{
  "name": "Owner Name",
  "email": "owner@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Response (201):
```json
{
  "data": {
    "owner": { "id": 1, "name": "Owner Name", "email": "owner@example.com" },
    "token": "1|abc123..."
  }
}
```

### POST /auth/login

```json
{ "email": "owner@example.com", "password": "password123" }
```

Response (200): Same structure as register.

---

## Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /properties | List all owner's properties |
| POST | /properties | Create property |
| GET | /properties/{id} | Get property details |
| PUT | /properties/{id} | Update property |
| PATCH | /properties/{id} | Partial update |
| DELETE | /properties/{id} | Delete property |
| PATCH | /properties/{id}/deactivate | Deactivate |
| PATCH | /properties/{id}/activate | Activate |

### POST /properties

```json
{
  "name": "Sunrise Homestay",
  "address": "123 Jalan Bunga, KL",
  "description": "Optional description"
}
```

---

## Units

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /properties/{propertyId}/units | List units for property |
| POST | /properties/{propertyId}/units | Create unit |
| GET | /units/{id} | Get unit details |
| PUT | /units/{id} | Update unit |
| PATCH | /units/{id}/deactivate | Deactivate |
| PATCH | /units/{id}/activate | Activate |

### POST /properties/{propertyId}/units

```json
{
  "name": "Room 101",
  "type": "room",
  "description": "Optional"
}
```

Valid types: `room`, `suite`, `dormitory_bed`, `entire_unit`

---

## Guests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /guests?search= | List/search guests |
| POST | /guests | Create guest |
| GET | /guests/{id} | Get guest details |
| PUT | /guests/{id} | Update guest |

### POST /guests

```json
{
  "full_name": "Ahmad bin Ali",
  "phone": "0123456789",
  "email": "ahmad@example.com",
  "identification_number": "901234567890"
}
```

Phone: 7-15 numeric digits. Unique per owner.

---

## Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /bookings?status=&unit_id=&from_date=&to_date= | List bookings |
| POST | /bookings | Create booking |
| GET | /bookings/{id} | Get booking details |
| PUT | /bookings/{id} | Update (confirmed only) |
| PATCH | /bookings/{id}/check-in | confirmed → checked_in |
| PATCH | /bookings/{id}/check-out | checked_in → checked_out |
| PATCH | /bookings/{id}/cancel | confirmed/checked_in → cancelled |

### POST /bookings

```json
{
  "unit_id": 1,
  "guest_id": 1,
  "check_in_date": "2026-06-01",
  "check_out_date": "2026-06-03",
  "total_amount": 500.00
}
```

### Status Transitions

- confirmed → checked_in (check-in)
- confirmed → cancelled (cancel)
- checked_in → checked_out (check-out, triggers cleaning task)
- checked_in → cancelled (cancel)

---

## Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /bookings/{bookingId}/payments | List payments for booking |
| POST | /bookings/{bookingId}/payments | Record payment/refund |
| DELETE | /bookings/{bookingId}/payments/{id} | Delete payment |

### POST /bookings/{bookingId}/payments

```json
{
  "type": "payment",
  "amount": 300.00,
  "payment_date": "2026-06-01",
  "payment_method": "cash"
}
```

Types: `payment`, `refund`. Amount always positive.
Methods: `cash`, `bank_transfer`, `other`.

### Payment Status Rules

- net_paid = sum(payments) - sum(refunds)
- unpaid: net = 0
- partial: 0 < net < total
- paid: net = total
- overpaid: net > total
- refunded: net < 0

---

## Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /expenses?category=&property_id=&from_date=&to_date= | List expenses |
| POST | /expenses | Create expense |
| GET | /expenses/{id} | Get expense details |
| PUT | /expenses/{id} | Update expense |
| DELETE | /expenses/{id} | Delete expense |

### POST /expenses

```json
{
  "amount": 75.00,
  "date": "2026-06-02",
  "category": "cleaning_services",
  "property_id": 1,
  "description": "Optional",
  "unit_id": 1,
  "booking_id": 1,
  "service_provider_id": 1
}
```

Categories: `utility_bills`, `maintenance`, `cleaning_services`, `laundry_services`, `supplies`, `internet`, `platform_fees`, `repairs`, `insurance`, `tax`, `other`

Property is required. Other links are optional (multiple allowed simultaneously).

---

## Service Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /service-providers | List service providers |
| POST | /service-providers | Create |
| GET | /service-providers/{id} | Get details |
| PUT | /service-providers/{id} | Update |
| DELETE | /service-providers/{id} | Delete (blocked if linked expenses) |

### POST /service-providers

```json
{
  "name": "CleanPro Services",
  "service_type": "cleaning",
  "phone": "0198765432",
  "notes": "Optional notes"
}
```

---

## Cleaning Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /cleaning-tasks?status=&unit_id= | List cleaning tasks |
| POST | /cleaning-tasks | Manual create |
| GET | /cleaning-tasks/{id} | Get details |
| PATCH | /cleaning-tasks/{id}/status | Update status |
| PATCH | /cleaning-tasks/{id}/notes | Update notes |

### Status Transitions

- pending → in_progress
- in_progress → completed

### PATCH /cleaning-tasks/{id}/status

```json
{ "status": "in_progress" }
```

---

## Maintenance Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /maintenance-tasks?status=&priority=&property_id=&unit_id= | List |
| POST | /maintenance-tasks | Create |
| GET | /maintenance-tasks/{id} | Get details |
| PUT | /maintenance-tasks/{id} | Update |

### POST /maintenance-tasks

```json
{
  "title": "Fix bathroom tap",
  "priority": "medium",
  "property_id": 1,
  "service_provider_id": 1,
  "scheduled_date": "2026-07-01",
  "description": "Optional"
}
```

Priorities: `low`, `medium`, `high`
Statuses: `open`, `in_progress`, `completed`, `cancelled`

---

## Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/income | Monthly income (payment-type amounts) |
| GET | /dashboard/expenses | Monthly expenses total |
| GET | /dashboard/net-profit | Income minus expenses |
| GET | /dashboard/outstanding | Outstanding across unpaid/partial bookings |
| GET | /dashboard/booking-counts | Counts by status for current month |
| GET | /dashboard/pending-cleaning | Pending/in-progress cleaning tasks |
| GET | /dashboard/pending-maintenance | Open/in-progress maintenance tasks |

---

## Error Responses

### 401 Unauthorized
```json
{ "message": "Unauthenticated." }
```

### 404 Not Found
```json
{ "message": "Resource not found." }
```

### 409 Conflict
```json
{
  "message": "Booking dates overlap with an existing booking.",
  "conflicting_booking": { "id": 1, "check_in_date": "...", "check_out_date": "..." }
}
```

### 422 Validation Error
```json
{
  "message": "The name field is required. (and 1 more error)",
  "errors": {
    "name": ["The name field is required."],
    "address": ["The address field is required."]
  }
}
```

---

## Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Returns `{"status":"ok"}` |
