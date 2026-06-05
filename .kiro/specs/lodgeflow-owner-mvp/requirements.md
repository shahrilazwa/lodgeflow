# Requirements Document

## Introduction

LodgeFlow is a property operations app for small lodging and short-stay rental businesses. This MVP targets the owner/admin role only and covers the core operational workflow: managing properties and units, recording guests and bookings, tracking payments and expenses, scheduling cleaning and maintenance tasks, and viewing a business performance dashboard.

The MVP is a web application with a React + Vite frontend and a Laravel API backend. There is no guest login, no cleaner login, no online payment gateway, no Airbnb sync, and no mobile app in this phase.

---

## Assumptions

- The MVP supports a single authenticated Owner account per tenant.
- All data is scoped to the authenticated Owner's account and is isolated from other accounts.
- API acceptance criteria describe backend behavior and validation rules. UI/UX details are secondary.
- Booking date ranges use check-in as inclusive and check-out as exclusive for overlap calculations. For example, a booking from 2026-06-01 to 2026-06-05 is considered to occupy nights 1–4 and allows another booking to start on 2026-06-05.

---

## Glossary

- **Owner**: The authenticated admin user who manages the lodging business.
- **Property**: A physical lodging establishment owned or managed by the Owner.
- **Amenities**: A list of facilities or services provided by a Property, such as wifi, air conditioning, parking, breakfast, pool, or laundry.
- **Unit**: A bookable room or space within a Property.
- **Guest**: A person whose contact details are recorded in the system and who may be associated with one or more Bookings.
- **Guest profile**: Optional status, rating, and notes stored with a Guest record to capture recurring customer behavior, blacklist status, damages, and other customer profiling. Status values shall include `recurring`, `blacklisted`, and `neutral`.
- **Booking**: A reservation that links a Guest to a Unit for a defined check-in and check-out date range.
- **Booking status**: One of `pending`, `confirmed`, `checked_in`, `checked_out`, or `cancelled`.
- **Payment**: A monetary transaction recorded against a Booking, with a type of either `payment` (money received) or `refund` (money returned to the Guest). Amounts are always entered as positive values.
- **Payment status**: One of `unpaid`, `partial`, `paid`, `overpaid`, or `refunded`, derived from the Booking's net paid amount.
- **Booking status** and **Payment status** are independent; payment status reflects payment history only and does not change the Booking lifecycle status.
- **Net Paid Amount**: The sum of all payment-type Payment amounts minus the sum of all refund-type Payment amounts for a Booking. It may be negative if refunds exceed payments.
- **Expense**: A cost incurred by the Owner in operating the business. Each Expense is required to link to a Property and may optionally link to a Unit, Booking, Service Provider, Cleaning Task, or Maintenance Task.
- **Cleaning Task**: A task to clean a Unit after a Booking is checked out, created automatically or manually.
- **Maintenance Task**: A task to repair or maintain a Unit or Property, created manually by the Owner.
- **Service Provider**: An external individual or company whose records are stored for reference and expense linking. This may represent a cleaner or maintenance worker who is paid directly for services rendered.
- **Dashboard**: A summary view showing key business metrics for the Owner.
- **System**: The LodgeFlow application as a whole.
- **API**: The Laravel backend that processes requests and enforces business rules.
- **Queue Worker**: The background process that executes deferred jobs such as Cleaning Task creation.

---

## Requirements

### Requirement 1: Property Management

**User Story:** As an Owner, I want to create and manage my properties, so that I can organise my lodging business within the system.

#### Acceptance Criteria

1. WHEN the Owner submits a new Property with a name (1–100 characters), an address (1–255 characters), and an optional description (0–1000 characters), THE System SHALL create the Property and associate it with the Owner's account.
2. WHEN the Owner views the Properties list, THE System SHALL display all Properties belonging to the Owner's account, including active and inactive status.
3. WHEN the Owner updates the name, address, or description of an existing Property, THE System SHALL save the changes, applying the same length constraints as creation.
4. WHEN the Owner submits a Property creation or update request with an amenities list, THE System SHALL store the amenities and expose them in the Property details response.
5. WHEN the Owner submits Property pictures while creating or updating a Property, THE System SHALL store the uploaded images and expose accessible image URLs in the Property details response.
6. WHEN the Owner deactivates a Property, THE System SHALL mark the Property as inactive, preserve all historical data including existing confirmed Bookings, and exclude the Property from active listings.
7. WHEN the Owner activates a previously inactive Property, THE System SHALL mark the Property as active and include it in active listings.
8. IF the Owner submits a Property creation or update request without a name or address, THEN THE API SHALL return a validation error identifying each missing field individually and SHALL reject the request.
9. WHEN a Property is deactivated, THE System SHALL prevent new Bookings from being created against Units belonging to that Property and SHALL return a validation error if such a Booking is attempted.
10. WHEN the Owner deactivates a Property that has confirmed or checked-in Bookings, THE System SHALL complete the deactivation and SHALL NOT automatically cancel those existing Bookings.

---

### Requirement 2: Unit Management

**User Story:** As an Owner, I want to create and manage units within a property, so that I can track which rooms are available for booking.

#### Acceptance Criteria

1. WHEN the Owner submits a new Unit under a Property with a name or number (1–100 characters), a unit type (one of: Room, Suite, Dormitory Bed, Entire Unit), a bed count (1–20), and an optional description (0–500 characters), THE System SHALL create the Unit and associate it with the specified Property.
2. WHEN the Owner submits a new Unit, THE System SHALL record the bed count and an optional max occupancy. If max occupancy is omitted, THE System SHALL default it to the bed count.
3. WHEN the Owner views the Units list for a given Property, THE System SHALL display all Units belonging to that Property, including bed count, max occupancy, and inactive Units with a visible inactive status indicator.
4. WHEN the Owner updates the name, type, description, bed count, or max occupancy of an existing Unit, THE System SHALL save the changes, applying the same length constraints, valid type enumeration, and numeric limits as creation.
5. WHEN the Owner deactivates a Unit, THE System SHALL mark the Unit as inactive and preserve all historical Booking records. WHEN the Owner reactivates a previously deactivated Unit, THE System SHALL mark the Unit as active while preserving its historical records.
6. IF the Owner submits a Unit creation request with any combination of missing required fields (unit name or parent Property), THEN THE API SHALL return a validation error identifying each missing field individually and SHALL reject the request.
7. IF the Owner attempts to create a Unit with a name that already exists within the same Property, THEN THE API SHALL return a conflict error indicating the duplicate name.
8. IF the Owner attempts to create a Booking for a Unit that is inactive, THEN THE API SHALL return a validation error indicating that the Unit is not available for booking.

---

### Requirement 3: Guest Records

**User Story:** As an Owner, I want to record and manage guest information, so that I can identify guests across multiple bookings and maintain contact records.

#### Acceptance Criteria

1. WHEN the Owner submits a new Guest record with a full name (1–100 characters), a phone number (7–15 numeric digits), and optional email address (max 254 characters), identification number (max 50 characters), address (max 255 characters), status (recurring, blacklisted, or neutral), rating (1–5), and profile notes (max 1000 characters), THE System SHALL create the Guest record.
2. WHEN the Owner searches for Guests by name or phone number, THE System SHALL return all matching Guest records belonging to the authenticated Owner. IF no matches are found, THE System SHALL return an empty result with a message indicating no Guests were found.
3. WHEN the Owner views a Guest's profile, THE System SHALL display the Guest's contact details and all Bookings associated with that Guest, ordered from most recent to oldest by check-in date.
4. WHEN the Owner updates the contact details or profile metadata of an existing Guest, THE System SHALL save the changes, applying the same field length and format constraints as creation.
5. WHEN the Owner filters Guests by profile status, THE System SHALL support filtering by blacklisted, recurring, and neutral status values.
6. IF the Owner submits a Guest creation or update request without a full name or phone number, or with a phone number that does not consist of 7–15 numeric digits, THEN THE API SHALL return a validation error specifically identifying each invalid or missing field.
7. IF the Owner attempts to create or update a Guest record with a phone number that already exists on another Guest record owned by the same Owner, THEN THE API SHALL return a validation error indicating the duplicate phone number.

---

### Requirement 4: Manual Booking Management

**User Story:** As an Owner, I want to create and manage bookings manually, so that I can track which guests are staying in which units and for how long.

#### Acceptance Criteria

1. WHEN the Owner submits a new Booking with a Guest, a Unit, a check-in date, a check-out date, a total booking amount between 0.01 and 999,999,999.99, an expected occupancy count (1–20), optional special requests (max 500 characters), and Guest identity/contact details, THE System SHALL create the Booking and set its initial booking status to `pending`. The security deposit amount, if provided, SHALL be tracked separately from the total booking amount and SHALL not affect payment status calculations.
   - Guest identity/contact details SHALL include either an identification document type and number (e.g. IC or passport) or a valid combination of email, phone, and address.
   - IF the Guest already exists in the system, THE System MAY reuse the existing Guest record, but the booking request SHALL still provide current contact and identity details for the stay.
2. WHEN the Owner creates a new Booking, THE System SHALL set the initial payment status to `unpaid`.
3. WHEN the Owner views the Bookings list, THE System SHALL display all Bookings belonging to the authenticated Owner, filterable by booking status, Unit, and a date range applied against the check-in date, and SHALL expose expected occupancy on each booking preview.
4. WHEN the Owner views a Booking's details, THE System SHALL display the expected occupancy and any special requests entered for that Booking.
> NOTE: special requests such as barbeque may trigger separate expense or payment handling in MVP; the system will record the request details but will not automatically calculate or bill extra charges.
5. WHEN the Owner updates the check-in date, check-out date, total booking amount, expected occupancy, or special requests of a Booking whose booking status is `pending` or `confirmed`, THE System SHALL save the changes.
6. WHEN the Owner confirms a Booking whose booking status is `pending`, THE System SHALL update the booking status to `confirmed`.
7. WHEN the Owner transitions a Booking from `confirmed` to `checked_in`, THE System SHALL update the booking status to `checked_in`.
8. WHEN the Owner transitions a Booking from `checked_in` to `checked_out`, THE System SHALL update the booking status to `checked_out`.
9. WHEN the Owner cancels a Booking whose booking status is `pending`, `confirmed`, or `checked_in`, THE System SHALL update the booking status to `cancelled`.
10. IF the Owner attempts to create or update a Booking for a Unit that already has a `confirmed` or `checked_in` Booking overlapping the requested date range, THEN THE System SHALL return a conflict error indicating the overlapping Booking.
11. IF the Owner attempts to create or update a Booking with a check-out date on or before the check-in date, THEN THE API SHALL return a validation error indicating the invalid date range.
12. IF the Owner attempts to perform a status transition that is not allowed from the current booking status, THEN THE System SHALL return an error indicating the current status and why the transition is not permitted. Allowed booking status transitions are: `pending` → `confirmed`, `confirmed` → `checked_in`, `checked_in` → `checked_out`, `pending` → `cancelled`, `confirmed` → `cancelled`, and `checked_in` → `cancelled`.
13. WHEN a Booking status is updated to `checked_out`, THE System SHALL automatically create a Cleaning Task for the associated Unit.

---

### Requirement 5: Booking Payment Tracking

**User Story:** As an Owner, I want to record payments and refunds against bookings, so that I can track outstanding balances and payment status accurately.

#### Acceptance Criteria

1. WHEN the Owner records a Payment against a Booking, THE System SHALL require a payment type (`payment` or `refund`), a positive amount (0.01–999,999,999.99), a payment date, a payment method (`cash`, `bank transfer`, or `other`), and an optional note (max 500 characters) describing the payment purpose, such as a late checkout fee, damage deduction, or security deposit refund. THE System SHALL save the record and associate it with the Booking.
2. WHEN the Owner records additional Payments or refunds against a Booking, THE System SHALL accept each record and add it to the Booking's payment history.
3. WHEN a Payment is created, updated, or deleted, THE System SHALL recalculate the Booking's net paid amount and update the payment status according to criterion 4.
4. THE System SHALL derive the payment status of a Booking according to the following rules:
   - IF the net paid amount is zero, THEN THE System SHALL set the payment status to `unpaid`.
   - IF the net paid amount is greater than zero and less than the total booking amount, THEN THE System SHALL set the payment status to `partial`.
   - IF the net paid amount equals the total booking amount, THEN THE System SHALL set the payment status to `paid`.
   - IF the net paid amount exceeds the total booking amount, THEN THE System SHALL set the payment status to `overpaid`.
   - IF the net paid amount is less than zero, THEN THE System SHALL set the payment status to `refunded`.
5. WHEN the Owner records a refund by selecting type `refund` and entering a positive amount, THE System SHALL subtract that amount from the net paid amount and update the payment status according to criterion 4.
6. WHEN the Owner views a specific Booking, THE System SHALL display all Payment records associated with that Booking, including each record's type, amount, date, and payment method.
7. IF the Owner submits a Payment record without a type, without an amount, with an amount of zero or below, or without a payment date, THEN THE API SHALL return a validation error identifying each invalid or missing field individually.
8. THE System SHALL display the outstanding balance for each Booking, calculated as the total booking amount minus the net paid amount. IF the net paid amount exceeds the total booking amount, THE System SHALL display the overpaid amount separately as a positive value alongside a zero outstanding balance.

---

### Requirement 6: Expense Tracking

**User Story:** As an Owner, I want to record and categorise business expenses, so that I can monitor costs and calculate net profit.

#### Acceptance Criteria

1. WHEN the Owner submits a new Expense with an amount (0.01–999,999,999.99), a date, a category, a linked Property (required), and an optional description (max 500 characters), THE System SHALL create the Expense record.
2. THE System SHALL support the following expense categories: utility bills, maintenance, cleaning services, laundry services, supplies, internet, platform fees, repairs, insurance, tax, and other.
3. WHEN the Owner creates or updates an Expense, THE System SHALL require a linked Property and SHALL optionally accept additional links to a Unit, a Booking, a Cleaning Task, or a Maintenance Task belonging to that Property, and an optional link to a Service Provider (individual or company). Cleaning Task and Maintenance Task are defined in Requirements 8 and 9. All linked entities other than Service Provider must belong to the same Property.
4. WHEN the Owner views the Expenses list, THE System SHALL display all Expenses belonging to the authenticated Owner, filterable by category, date range, Property, and Unit, sorted by date descending by default.
5. WHEN the Owner updates the amount, date, category, description, linked Property, or any optional linked entity of an existing Expense, THE System SHALL save the changes, applying the same constraints as creation.
6. WHEN the Owner deletes an Expense record, THE System SHALL permanently remove it.
7. IF the Owner submits an Expense without an amount, without a date, or without a linked Property, THEN THE API SHALL return a validation error identifying each missing field individually.
8. IF the Owner submits an Expense with an amount of zero or a negative value, THEN THE API SHALL return a validation error indicating that the amount must be greater than zero.
9. IF the Owner attempts to update or delete an Expense that does not exist, THEN THE API SHALL return a not-found error.

---

### Requirement 7: Service Provider Records

**User Story:** As an Owner, I want to maintain a list of service providers, so that I can link expenses to the correct vendor and have their contact details on hand.

#### Acceptance Criteria

1. WHEN the Owner submits a new Service Provider record with a name (1–100 characters), a service type (1–100 characters), and optional phone number (max 20 characters) and notes (max 1000 characters), THE System SHALL create the Service Provider record. The Service Provider may represent an individual or a company whose services are paid directly to the person or vendor.
2. WHEN the Owner views the Service Providers list, THE System SHALL display all Service Provider records belonging to the authenticated Owner.
3. WHEN the Owner updates the details of an existing Service Provider record, THE System SHALL save the changes, applying the same field length constraints as creation.
4. WHEN the Owner deletes a Service Provider record that has no linked Expenses, THE System SHALL permanently remove the record.
5. IF the Owner attempts to delete a Service Provider that has linked Expenses, THEN THE API SHALL return an error indicating that the record cannot be deleted while linked Expenses exist.
6. IF the Owner submits a Service Provider creation or update request without a name or without a service type, THEN THE API SHALL return a validation error identifying each missing field individually.
7. IF the Owner attempts to create a Service Provider with a name that already exists for the same Owner, THEN THE API SHALL return a conflict error indicating the duplicate name.

---

### Requirement 8: Cleaning Task Schedule

**User Story:** As an Owner, I want the system to automatically create a cleaning task when a guest checks out, so that I can track which units need to be cleaned without manual entry.

#### Acceptance Criteria

1. WHEN a Booking status is set to `checked_out`, THE System SHALL dispatch a background job to the Queue Worker to create a Cleaning Task for the associated Unit.
2. WHEN the Queue Worker processes the background job successfully, THE Queue Worker SHALL create a Cleaning Task record linked to the Unit and the checked-out Booking, with a default status of `pending`.
3. WHEN the Owner views the Cleaning Tasks list, THE System SHALL display all Cleaning Tasks belonging to the authenticated Owner, filterable by status and Unit.
4. WHEN the Owner updates the status of a Cleaning Task, THE System SHALL only permit the following transitions: `pending` → `in progress`, and `in progress` → `completed`. THE System SHALL reject any other status transition and return a validation error.
5. WHEN the Owner adds notes to a Cleaning Task, THE System SHALL save the notes, which SHALL not exceed 1000 characters.
6. IF the Queue Worker fails to process the Cleaning Task creation job for any reason, THE System SHALL log the failure with the Booking ID and Unit ID, retry the job up to 3 times at 60-second intervals, and, if all retries fail, log a permanent failure record for manual investigation.
7. WHEN the Owner manually creates a Cleaning Task with a required Unit and an optional linked Booking, THE System SHALL create the Cleaning Task with a default status of `pending`. IF the specified Unit does not exist, THE API SHALL return a not-found error. IF the specified Unit already has a pending Cleaning Task, THEN THE API SHALL return a conflict error indicating the existing pending task.

---

### Requirement 9: Maintenance Task Tracking

**User Story:** As an Owner, I want to record and track maintenance tasks for my properties and units, so that I can manage repairs and upkeep systematically.

#### Acceptance Criteria

1. WHEN the Owner submits a new Maintenance Task with a title (1–200 characters), a description (max 1000 characters), a priority (low, medium, or high), a linked Property or Unit, and an optional scheduled date, THE System SHALL create the Maintenance Task with an initial status of `open`.
2. WHEN the Owner views the Maintenance Tasks list, THE System SHALL display all Maintenance Tasks belonging to the authenticated Owner, filterable by status, priority, Property, and Unit.
3. WHEN the Owner updates the title, description, priority, scheduled date, or status of an existing Maintenance Task, THE System SHALL save the changes, applying the same field constraints as creation.
4. THE System SHALL support the following Maintenance Task statuses: `open`, `in progress`, `completed`, and `cancelled`.
5. WHEN the Owner links a Maintenance Task to a Service Provider, THE System SHALL save the association.
6. WHEN the Owner links an Expense to a Maintenance Task, THE System SHALL save the association.
7. IF the Owner submits a Maintenance Task without a title, THEN THE API SHALL return a validation error specifically stating that the title is required. IF the Owner submits a Maintenance Task without a linked Property or Unit, THEN THE API SHALL return a validation error specifically stating that a Property or Unit must be linked. IF both fields are missing, THE API SHALL return both errors simultaneously.

---

### Requirement 10: Basic Dashboard Summary

**User Story:** As an Owner, I want to see a summary of my business performance on a dashboard, so that I can quickly understand income, expenses, and outstanding balances.

#### Acceptance Criteria

1. THE Dashboard SHALL display the total income for the current calendar month, calculated as the sum of all payment-type Payment amounts recorded in that month.
2. THE Dashboard SHALL display the total expenses (sum of all Expense amounts) for the current calendar month.
3. THE Dashboard SHALL display the net profit for the current calendar month, calculated as total income minus total expenses.
4. THE Dashboard SHALL display the total outstanding balance across all Bookings with a payment status of `unpaid` or `partial`.
5. THE Dashboard SHALL display the count of Bookings by status (`confirmed`, `checked_in`, `checked_out`, `cancelled`) for the current calendar month.
6. THE Dashboard SHALL display a list of the authenticated Owner's Cleaning Tasks with a status of `pending` or `in progress`.
7. THE Dashboard SHALL display a list of the authenticated Owner's Maintenance Tasks with a status of `open` or `in progress`.
8. WHEN the Owner navigates to the Dashboard, THE System SHALL render each summary component independently so partial data is visible while other components load.

---

### Requirement 11: Owner Account Scoping

**User Story:** As an Owner, I want all records in the system to be scoped to my account, so that my business data is private and isolated from any other accounts.

#### Acceptance Criteria

1. WHEN the Owner is authenticated, THE System SHALL scope all data access to records belonging to the Owner's account only. THE API SHALL not return, modify, or delete records belonging to a different account under any circumstance.
2. WHEN the Owner creates any record (Property, Unit, Guest, Booking, Payment, Expense, Service Provider, Cleaning Task, or Maintenance Task), THE System SHALL automatically associate that record with the authenticated Owner's account.
3. IF an authenticated Owner attempts to read, update, or delete a record that belongs to a different account, THEN THE API SHALL return a not-found error.
4. WHEN the Dashboard is rendered, THE System SHALL calculate all summary metrics using only records belonging to the authenticated Owner's account.
5. IF a request is made to any API endpoint without valid authentication, THEN THE API SHALL return an authentication error and SHALL not process the request.

---

## Out of Scope for MVP

The following capabilities are explicitly excluded from this MVP and may be considered in future phases:

- Guest self-service login or portal
- Cleaner login or task assignment portal
- Online payment gateway integration (e.g., Stripe, FPX, GrabPay)
- Airbnb or OTA channel synchronisation
- Mobile application (iOS or Android)
- Multi-user roles beyond the single Owner/admin account
- Automated financial reporting or tax exports
- MongoDB-based activity logs or audit events (future option)
- Kubernetes or RabbitMQ infrastructure
