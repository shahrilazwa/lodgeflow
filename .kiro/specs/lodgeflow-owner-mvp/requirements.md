# Requirements Document

## Introduction

LodgeFlow is a property operations app for small lodging and short-stay rental businesses. This MVP targets the owner/admin role only and covers the core operational workflow: managing properties and units, recording guests and bookings, tracking payments and expenses, scheduling cleaning and maintenance tasks, and viewing a business performance dashboard.

The MVP is a web application with a React + Vite frontend and a Laravel API backend. There is no guest login, no cleaner login, no online payment gateway, no Airbnb sync, and no mobile app in this phase.

---

## Glossary

- **Owner**: The authenticated admin user who manages the lodging business.
- **Property**: A physical lodging establishment (e.g., a guesthouse or homestay) owned or managed by the Owner.
- **Unit**: A bookable room or space within a Property (e.g., Room 1, Deluxe Suite).
- **Guest**: A person whose contact details are recorded in the system and who may be associated with one or more Bookings.
- **Booking**: A reservation that links a Guest to a Unit for a defined check-in and check-out date range.
- **Payment**: A monetary transaction recorded against a Booking, with a type of either "payment" (money received) or "refund" (money returned to the Guest). The amount is always a positive value.
- **Net Paid Amount**: The sum of all payment-type Payment amounts minus the sum of all refund-type Payment amounts recorded against a Booking.
- **Expense**: A cost incurred by the Owner in operating the business. Each Expense must be linked to a Property and may additionally be linked to a Unit, Booking, Service Provider, Cleaning_Task, or Maintenance_Task.
- **Cleaning_Task**: A scheduled task to clean a Unit after a Guest checks out, created automatically by the system.
- **Maintenance_Task**: A task to repair or maintain a Unit or Property, created manually by the Owner.
- **Service_Provider**: An external individual or company (e.g., cleaner, plumber, electrician) whose records are stored for reference and expense linking.
- **Dashboard**: A summary view showing key business metrics for the Owner.
- **System**: The LodgeFlow application as a whole.
- **API**: The Laravel backend that processes requests and enforces business rules.
- **Queue_Worker**: The background process that executes deferred jobs such as Cleaning_Task creation.

---

## Requirements

### Requirement 1: Property Management

**User Story:** As an Owner, I want to create and manage my properties, so that I can organise my lodging business within the system.

#### Acceptance Criteria

1. WHEN the Owner submits a new Property with a name (1–100 characters), an address (1–255 characters), and an optional description (0–1000 characters), THE System SHALL create the Property and associate it with the Owner's account.
2. WHEN the Owner views the Properties list, THE System SHALL display all Properties belonging to the Owner's account, including their active or inactive status.
3. WHEN the Owner updates the name, address, or description of an existing Property, THE System SHALL save the changes, applying the same length constraints as creation.
4. WHEN the Owner deactivates a Property, THE System SHALL mark the Property as inactive, preserve all historical data including existing confirmed Bookings, and exclude the Property from active listings.
5. IF the Owner submits a Property creation or update form without a name or address, THEN THE API SHALL return a validation error identifying each missing field individually and SHALL reject the request.
6. WHEN a Property is deactivated, THE System SHALL prevent new Bookings from being created against Units belonging to that Property and SHALL return a validation error if such a Booking is attempted.
7. WHEN the Owner deactivates a Property that has active confirmed or checked-in Bookings, THE System SHALL complete the deactivation and SHALL NOT automatically cancel those existing Bookings.

---

### Requirement 2: Unit / Room Management

**User Story:** As an Owner, I want to create and manage units within a property, so that I can track which rooms are available for booking.

#### Acceptance Criteria

1. WHEN the Owner submits a new Unit under a Property with a unit name or number (1–100 characters), a unit type (one of: Room, Suite, Dormitory Bed, Entire Unit), and an optional description (0–500 characters), THE System SHALL create the Unit and associate it with the specified Property.
2. WHEN the Owner views the Units list for a given Property, THE System SHALL display all Units belonging to that Property, including deactivated Units with a visible inactive status indicator.
3. WHEN the Owner updates the name, type, or description of an existing Unit, THE System SHALL save the changes, applying the same length bounds and valid type enumeration as creation.
4. WHEN the Owner deactivates a Unit, THE System SHALL mark the Unit as inactive and preserve all historical Booking records. WHEN the Owner reactivates a previously deactivated Unit, THE System SHALL mark the Unit as active, also preserving all historical records.
5. IF the Owner submits a Unit creation form with any combination of missing required fields (unit name, parent Property, or both), THEN THE API SHALL return a validation error identifying each missing field individually and SHALL reject the creation request.
6. IF the Owner attempts to create a Unit with a name that already exists within the same Property, THEN THE API SHALL return a validation error indicating the duplicate name conflict.
7. IF the Owner attempts to create a Booking for a Unit that is inactive, THEN THE API SHALL return a validation error indicating that the Unit is not available for booking.

---

### Requirement 3: Guest Records

**User Story:** As an Owner, I want to record and manage guest information, so that I can identify guests across multiple bookings and maintain contact records.

#### Acceptance Criteria

1. WHEN the Owner submits a new Guest record with a full name (1–100 characters), a phone number (7–15 numeric digits), and optional email address (max 254 characters) and identification number (max 50 characters), THE System SHALL create the Guest record.
2. WHEN the Owner searches for Guests by name or phone number, THE System SHALL return all matching Guest records. IF no matches are found, THE System SHALL display an empty result with a message indicating no Guests were found.
3. WHEN the Owner views a Guest's profile, THE System SHALL display the Guest's contact details and all Bookings associated with that Guest, ordered from most recent to oldest by check-in date.
4. WHEN the Owner updates the contact details of an existing Guest record, THE System SHALL save the changes, applying the same field length and format constraints as creation.
5. IF the Owner submits a Guest creation form without a full name or phone number, or with a phone number that does not consist of 7–15 numeric digits, THEN THE API SHALL return a validation error specifically identifying each invalid or missing field.
6. IF the Owner attempts to create or update a Guest record with a phone number that already exists on another Guest record, THEN THE API SHALL return a validation error indicating the duplicate phone number conflict.

---

### Requirement 4: Manual Booking Management

**User Story:** As an Owner, I want to create and manage bookings manually, so that I can track which guests are staying in which units and for how long.

#### Acceptance Criteria

1. WHEN the Owner submits a new Booking with a Guest, a Unit, a check-in date, a check-out date, and a total booking amount between 0.01 and 999,999,999.99, THE System SHALL create the Booking and set its initial status to "confirmed".
2. WHEN the Owner views the Bookings list, THE System SHALL display all Bookings filterable by status, Unit, and a date range applied against the check-in date.
3. WHEN the Owner updates the check-in date, check-out date, or total booking amount of a Booking whose status is "confirmed", THE System SHALL save the changes.
4. WHEN the Owner marks a Booking whose status is "confirmed" as "checked in", THE System SHALL update the Booking status to "checked in".
5. WHEN the Owner marks a Booking whose status is "checked in" as "checked out", THE System SHALL update the Booking status to "checked out".
6. WHEN the Owner cancels a Booking whose status is "confirmed" or "checked in", THE System SHALL update the Booking status to "cancelled".
7. IF the Owner attempts to create or update a Booking for a Unit that already has a "confirmed" or "checked in" Booking overlapping the requested date range, THEN THE System SHALL return a conflict error indicating the overlapping Booking.
8. IF the Owner attempts to create or update a Booking with a check-out date on or before the check-in date, THEN THE System SHALL return a validation error indicating the invalid date range.
9. IF the Owner attempts to perform a status transition on a Booking whose current status does not permit that transition, THEN THE System SHALL return an error indicating the Booking's current status and the reason the transition is not allowed.
10. WHEN a Booking status is updated to "checked out", THE System SHALL automatically create a Cleaning Task for the associated Unit.

---

### Requirement 5: Booking Payment Tracking

**User Story:** As an Owner, I want to record payments and refunds against bookings, so that I can track outstanding balances and payment status accurately.

#### Acceptance Criteria

1. WHEN the Owner records a Payment against a Booking, THE System SHALL require a payment type (payment or refund), a positive amount (0.01–999,999,999.99), a payment date, and a payment method (cash, bank transfer, or other), and SHALL save the record and associate it with the Booking.
2. WHEN the Owner records a second or subsequent Payment or refund against a Booking, THE System SHALL accept the record and add it to the Booking's payment history.
3. WHEN a Payment is recorded or deleted, THE System SHALL recalculate the Booking's net paid amount and update the payment status according to the rules in criterion 4. The net paid amount is the sum of all payment-type amounts minus the sum of all refund-type amounts for that Booking.
4. THE System SHALL derive the payment status of a Booking according to the following rules:
   - IF the net paid amount is zero, THEN THE System SHALL set the status to "unpaid".
   - IF the net paid amount is greater than zero and less than the total booking amount, THEN THE System SHALL set the status to "partial".
   - IF the net paid amount equals the total booking amount, THEN THE System SHALL set the status to "paid".
   - IF the net paid amount exceeds the total booking amount, THEN THE System SHALL set the status to "overpaid".
   - IF the net paid amount is less than zero, THEN THE System SHALL set the status to "refunded".
5. WHEN the Owner records a refund by selecting type "refund" and entering a positive amount, THE System SHALL subtract that amount from the net paid amount and update the payment status according to the rules in criterion 4.
6. WHEN the Owner views a specific Booking, THE System SHALL display all Payment records associated with that Booking, showing each record's type, amount, date, and payment method.
7. IF the Owner submits a Payment record without a type, without an amount, with an amount of zero or below, or without a payment date, THEN THE API SHALL return a validation error identifying each invalid or missing field individually.
8. THE System SHALL display the outstanding balance for each Booking, calculated as the total booking amount minus the net paid amount. IF the net paid amount exceeds the total booking amount, THE System SHALL display the overpaid amount separately as a positive value alongside a zero outstanding balance.

---

### Requirement 6: Expense Tracking

**User Story:** As an Owner, I want to record and categorise business expenses, so that I can monitor costs and calculate net profit.

#### Acceptance Criteria

1. WHEN the Owner submits a new Expense with an amount (0.01–999,999,999.99), a date, a category, a linked Property (required), and an optional description (max 500 characters), THE System SHALL create the Expense record.
2. THE System SHALL support the following expense categories: utility bills, maintenance, cleaning services, laundry services, supplies, internet, platform fees, repairs, insurance, tax, and other.
3. WHEN the Owner creates or updates an Expense, THE System SHALL require a linked Property and SHALL optionally accept additional links to a Unit, a Booking, a Service Provider, a Cleaning_Task, or a Maintenance_Task belonging to that Property. Multiple optional links may be set on a single Expense simultaneously.
4. WHEN the Owner views the Expenses list, THE System SHALL display all Expenses filterable by category, date range, Property, and Unit, sorted by date descending by default.
5. WHEN the Owner updates the amount, date, category, description, linked Property, or any optional linked entity of an existing Expense, THE System SHALL save the changes, applying the same constraints as creation.
6. WHEN the Owner deletes an Expense record, THE System SHALL permanently remove it.
7. IF the Owner submits an Expense without an amount, without a date, or without a linked Property, THEN THE API SHALL return a validation error identifying each missing field individually, regardless of how many required fields are absent simultaneously.
8. IF the Owner submits an Expense with an amount of zero or a negative value, THEN THE API SHALL return a validation error indicating that the amount must be greater than zero.
9. IF the Owner attempts to update or delete an Expense that does not exist, THEN THE API SHALL return a not-found error.

---

### Requirement 7: Service Provider Records

**User Story:** As an Owner, I want to maintain a list of service providers, so that I can link expenses to the correct vendor and have their contact details on hand.

#### Acceptance Criteria

1. WHEN the Owner submits a new Service Provider record with a name (1–100 characters), a service type (1–100 characters), and optional phone number (max 20 characters) and notes (max 1000 characters), THE System SHALL create the Service Provider record.
2. WHEN the Owner views the Service Providers list, THE System SHALL display all Service Provider records.
3. WHEN the Owner updates the details of an existing Service Provider record, THE System SHALL save the changes, applying the same field length constraints as creation.
4. WHEN the Owner deletes a Service Provider record that has no linked Expenses, THE System SHALL permanently remove the record.
5. IF the Owner attempts to delete a Service Provider that has linked Expenses, THEN THE API SHALL return an error indicating that the record cannot be deleted while linked Expenses exist.
6. IF the Owner submits a Service Provider creation or update form without a name or without a service type, THEN THE API SHALL return a validation error identifying each missing field individually.
7. IF the Owner attempts to create a Service Provider with a name that already exists in the system, THEN THE API SHALL return a validation error indicating the duplicate name conflict.

---

### Requirement 8: Cleaning Task Schedule

**User Story:** As an Owner, I want the system to automatically create a cleaning task when a guest checks out, so that I can track which units need to be cleaned without manual entry.

#### Acceptance Criteria

1. WHEN a Booking status is set to "checked out", THE System SHALL dispatch a background job to the Queue_Worker to create a Cleaning_Task for the associated Unit.
2. WHEN the Queue_Worker processes the background job successfully, THE Queue_Worker SHALL create a Cleaning_Task record linked to the Unit and the checked-out Booking, with a default status of "pending".
3. WHEN the Owner views the Cleaning_Tasks list, THE System SHALL display all Cleaning_Tasks filterable by status and Unit.
4. WHEN the Owner updates the status of a Cleaning_Task, THE System SHALL only permit the following transitions: pending → in progress, and in progress → completed. THE System SHALL reject any other status transition and return a validation error.
5. WHEN the Owner adds notes to a Cleaning_Task, THE System SHALL save the notes, which SHALL not exceed 1000 characters.
6. IF the Queue_Worker fails to process the Cleaning_Task creation job for any reason (including database timeouts, validation failures, or non-fatal errors), THE System SHALL log the failure with the Booking ID and Unit ID, and SHALL retry the job up to 3 times at 60-second intervals. IF the job fails after all retries, THE System SHALL log a permanent failure record for manual investigation.
7. WHEN the Owner manually creates a Cleaning_Task by providing a Unit (required) and an optional linked Booking, THE System SHALL create the Cleaning_Task with a default status of "pending". IF the specified Unit does not exist, THE API SHALL return a not-found error.

---

### Requirement 9: Maintenance Task Tracking

**User Story:** As an Owner, I want to record and track maintenance tasks for my properties and units, so that I can manage repairs and upkeep systematically.

#### Acceptance Criteria

1. WHEN the Owner submits a new Maintenance_Task with a title (1–200 characters), a description, a priority (low, medium, or high), a linked Property or Unit, and an optional scheduled date, THE System SHALL create the Maintenance_Task with an initial status of "open".
2. WHEN the Owner views the Maintenance_Tasks list, THE System SHALL display all Maintenance_Tasks filterable by status, priority, Property, and Unit.
3. WHEN the Owner updates the title, description, priority, scheduled date, or status of an existing Maintenance_Task, THE System SHALL save the changes, applying the same field constraints as creation.
4. THE System SHALL support the following Maintenance_Task statuses: open, in progress, completed, and cancelled.
5. WHEN the Owner links a Maintenance_Task to a Service Provider, THE System SHALL save the association.
6. WHEN the Owner links an Expense to a Maintenance_Task, THE System SHALL save the association.
7. IF the Owner submits a Maintenance_Task without a title, THEN THE API SHALL return a validation error specifically stating that the title is required. IF the Owner submits a Maintenance_Task without a linked Property or Unit, THEN THE API SHALL return a validation error specifically stating that a Property or Unit must be linked. IF both fields are missing, THE API SHALL return both errors simultaneously.

---

### Requirement 10: Basic Dashboard Summary

**User Story:** As an Owner, I want to see a summary of my business performance on a dashboard, so that I can quickly understand income, expenses, and outstanding balances.

#### Acceptance Criteria

1. THE Dashboard SHALL display the total income for the current calendar month, calculated as the sum of all payment-type Payment amounts recorded in that month.
2. THE Dashboard SHALL display the total expenses (sum of all Expense amounts) for the current calendar month.
3. THE Dashboard SHALL display the net profit for the current calendar month, calculated as total income minus total expenses.
4. THE Dashboard SHALL display the total outstanding balance across all Bookings with a payment status of "unpaid" or "partial".
5. THE Dashboard SHALL display the count of Bookings by status (confirmed, checked in, checked out, cancelled) for the current calendar month.
6. THE Dashboard SHALL display a list of Cleaning_Tasks with a status of "pending" or "in progress".
7. THE Dashboard SHALL display a list of Maintenance_Tasks with a status of "open" or "in progress".
8. WHEN the Owner navigates to the Dashboard, THE System SHALL render each summary component independently and SHALL display a loading indicator for each component while its data is being fetched, so that available data is visible immediately without waiting for all components to finish loading.

---

### Requirement 11: Owner Account Scoping

**User Story:** As an Owner, I want all records in the system to be scoped to my account, so that my business data is private and isolated from any other accounts.

#### Acceptance Criteria

1. WHEN the Owner is authenticated, THE System SHALL scope all data access to records belonging to the Owner's account only. THE API SHALL not return, modify, or delete records belonging to a different account under any circumstance.
2. WHEN the Owner creates any record (Property, Unit, Guest, Booking, Payment, Expense, Service Provider, Cleaning_Task, or Maintenance_Task), THE System SHALL automatically associate that record with the authenticated Owner's account.
3. IF an authenticated Owner attempts to read, update, or delete a record that belongs to a different account, THEN THE API SHALL return a not-found error, as if the record does not exist.
4. WHEN the Dashboard is rendered, THE System SHALL calculate all summary metrics (income, expenses, net profit, outstanding balances, booking counts, task lists) using only records belonging to the authenticated Owner's account.
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
