# LodgeFlow User Manual

Welcome to LodgeFlow! This manual will guide you through using the application to manage your short-stay lodging or homestay business.

---

## What is LodgeFlow?

LodgeFlow is a property operations app designed for small lodging businesses. It helps you:

- Track which rooms are available and booked
- Record guest information for repeat visitors
- Manage bookings from check-in to check-out
- Track how much guests owe and have paid
- Record business expenses
- Automatically create cleaning tasks when guests check out
- Track maintenance work on your properties
- See your business performance on a dashboard

**Who is this for?** If you own or manage a homestay, guesthouse, or small rental property and want to keep track of your operations digitally, LodgeFlow is for you.

---

## Accessing the App

LodgeFlow runs locally on your computer using Docker. Once set up:

- **Frontend (what you see):** http://localhost:5173
- **API (backend):** http://localhost:8000
- **Email testing:** http://localhost:8025

To start the app:
```bash
docker compose up -d
```

To stop the app:
```bash
docker compose down
```

---

## Getting Started

### Registering Your Account

1. Open http://localhost:5173 in your browser
2. Click "Register" (or navigate to http://localhost:5173/register)
3. Fill in:
   - **Name:** Your full name
   - **Email:** Your email address (used for login)
   - **Password:** At least 8 characters
   - **Confirm Password:** Type the same password again
4. Click "Register"
5. You'll be redirected to the Dashboard

**Important:** Your email must be unique. You cannot register two accounts with the same email.

### Logging In

1. Open http://localhost:5173/login
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the Dashboard

### Logging Out

1. Click the "Logout" button at the bottom of the sidebar
2. You'll be redirected to the login page
3. Your session token is revoked — no one can use it again

---

## Understanding the Dashboard

The Dashboard is your home page after logging in. It shows 7 summary cards:

| Card | What it shows |
|------|---------------|
| Monthly Income | Total payments received this month |
| Monthly Expenses | Total expenses recorded this month |
| Net Profit | Income minus expenses (green = profit, red = loss) |
| Outstanding Balance | Total amount guests still owe you |
| Bookings This Month | Count of bookings by status |
| Pending Cleaning | Rooms that need cleaning |
| Open Maintenance | Repair/maintenance tasks that need attention |

Each card loads independently — you'll see data appear as each section loads.

---

## Managing Properties

### What is a Property?

A property is a physical location you manage — for example, "Sunrise Homestay" or "Beach Villa KK". You might have one property or several.

### Creating a Property

1. Click "Properties" in the sidebar
2. Click "+ New Property"
3. Fill in:
   - **Name:** The property name (e.g., "Sunrise Homestay")
   - **Address:** The full address
   - **Description:** Optional notes about the property
4. Click "Create"

### Deactivating a Property

If you temporarily stop operating a property:
1. Go to the Properties list
2. Click "Deactivate" on the property
3. The property will show as "Inactive"
4. No new bookings can be made for units in this property
5. Existing bookings are NOT cancelled

To reactivate, click "Activate".

---

## Managing Units (Rooms)

### What is a Unit?

A unit is a bookable space within a property — a room, suite, or entire unit. For example, "Room 101" or "Deluxe Suite A".

### Creating a Unit

1. Go to Properties → click "Units" on a property
2. Click "+ New Unit"
3. Fill in:
   - **Name:** Room name or number (e.g., "Room 101")
   - **Type:** Choose from Room, Suite, Dormitory Bed, or Entire Unit
   - **Description:** Optional notes
4. Click "Create"

**Important:** Unit names must be unique within the same property. You can have "Room 101" in Property A and "Room 101" in Property B, but not two "Room 101" in the same property.

### Unit Types

| Type | Use for |
|------|---------|
| Room | A standard private room |
| Suite | A larger room or room with living area |
| Dormitory Bed | A single bed in a shared room |
| Entire Unit | The whole property is one bookable unit |

---

## Managing Guests

### What is a Guest?

A guest is a person who stays at your property. You record their contact details so you can identify them across multiple bookings.

### Creating a Guest

1. Click "Guests" in the sidebar
2. Click "+ New Guest"
3. Fill in:
   - **Full Name:** The guest's name
   - **Phone:** 7 to 15 digits (e.g., 0123456789)
   - **Email:** Optional
   - **ID Number:** Optional (IC or passport number)
4. Click "Create"

**Important:** Each guest must have a unique phone number. If you try to add a guest with a phone number that already exists, you'll get an error.

### Searching for Guests

Use the search box on the Guests page to find guests by name or phone number. The search filters as you type.

---

## Managing Bookings

### What is a Booking?

A booking links a guest to a unit for specific dates. It tracks the stay from reservation through checkout.

### Creating a Booking

1. Click "Bookings" in the sidebar
2. Click "+ New Booking"
3. Fill in:
   - **Guest:** Select from your guest list
   - **Unit ID:** Enter the unit's ID number (visible on the Units page)
   - **Check-in Date:** When the guest arrives
   - **Check-out Date:** When the guest leaves (must be after check-in)
   - **Total Amount:** How much the guest should pay (in RM)
4. Click "Create Booking"

**What can go wrong:**
- If the unit already has a booking for overlapping dates, you'll see a conflict error
- If the unit or its property is inactive, you'll see a validation error
- Check-out date must be after check-in date

### Understanding Booking Statuses

| Status | Meaning |
|--------|---------|
| Confirmed | Booking is reserved but guest hasn't arrived yet |
| Checked In | Guest has arrived and is staying |
| Checked Out | Guest has left |
| Cancelled | Booking was cancelled |

### Check-In

When the guest arrives:
1. Go to the booking detail page
2. Click "Check In"
3. Status changes from "Confirmed" to "Checked In"

**You can only check in a "Confirmed" booking.**

### Check-Out

When the guest leaves:
1. Go to the booking detail page
2. Click "Check Out"
3. Status changes from "Checked In" to "Checked Out"
4. A cleaning task is automatically created for the room

**You can only check out a "Checked In" booking.**

### Cancellation

To cancel a booking:
1. Go to the booking detail page
2. Click "Cancel Booking"
3. Confirm the cancellation

**You can cancel a "Confirmed" or "Checked In" booking. You cannot cancel a booking that's already checked out.**

### Editing a Booking

You can only edit a booking when its status is "Confirmed". Once checked in, the dates and amount are locked.

---

## Recording Payments and Refunds

### What is a Payment?

A payment records money received from a guest for a booking. A refund records money returned to the guest.

### Recording a Payment

1. Go to a booking's detail page
2. In the "Payments" section, click "+ Record Payment"
3. Fill in:
   - **Type:** Payment (money received) or Refund (money returned)
   - **Amount:** Always a positive number (e.g., 300.00)
   - **Date:** When the payment was made
   - **Method:** Cash, Bank Transfer, or Other
4. Click "Record"

### Understanding Payment Statuses

After each payment or refund, the system automatically recalculates the booking's payment status:

| Status | Meaning | Example (RM 500 booking) |
|--------|---------|--------------------------|
| Unpaid | No money received (net = 0) | No payments recorded |
| Partial | Some money received but not full amount | RM 300 paid (net = 300) |
| Paid | Full amount received | RM 500 paid (net = 500) |
| Overpaid | More than the full amount received | RM 600 paid (net = 600) |
| Refunded | More refunded than paid (net < 0) | RM 200 paid, RM 300 refunded (net = -100) |

### How Net Paid Amount Works

```
Net Paid = Total Payments - Total Refunds
Outstanding = Total Booking Amount - Net Paid (minimum 0)
Overpaid = Net Paid - Total Booking Amount (only if net > total)
```

### Example

Booking total: RM 500

1. Record payment RM 300 → Status: Partial, Outstanding: RM 200
2. Record payment RM 200 → Status: Paid, Outstanding: RM 0
3. Record refund RM 100 → Status: Partial, Outstanding: RM 100

### Deleting a Payment

Click the × button next to a payment record to delete it. The payment status will be recalculated.

---

## Managing Expenses

### What is an Expense?

An expense is a cost you incur in running your business — utility bills, cleaning fees, repairs, etc.

### Creating an Expense

1. Click "Expenses" in the sidebar
2. Click "+ New Expense"
3. Fill in:
   - **Amount:** The cost (must be greater than 0)
   - **Date:** When the expense occurred
   - **Category:** Choose from the list
   - **Property:** Which property this expense is for (required)
   - **Service Provider:** Optional — who provided the service
   - **Description:** Optional notes
4. Click "Create"

### Expense Categories

| Category | Examples |
|----------|----------|
| Utility Bills | Electricity, water, gas |
| Maintenance | General upkeep costs |
| Cleaning Services | Professional cleaning fees |
| Laundry Services | Linen washing, towel service |
| Supplies | Toiletries, cleaning products |
| Internet | WiFi subscription |
| Platform Fees | Airbnb/Booking.com commissions |
| Repairs | Fixing broken items |
| Insurance | Property insurance |
| Tax | Property tax, business tax |
| Other | Anything else |

### Filtering Expenses

Use the filters at the top of the Expenses page to narrow down by:
- Category
- Date range (from/to)

---

## Managing Service Providers

### What is a Service Provider?

A service provider is an external person or company you hire — cleaners, plumbers, electricians, laundry services, etc.

### Creating a Service Provider

1. Click "Service Providers" in the sidebar
2. Click "+ New Provider"
3. Fill in:
   - **Name:** Company or person name
   - **Service Type:** What they do (e.g., "cleaning", "plumbing")
   - **Phone:** Optional contact number
   - **Notes:** Optional notes
4. Click "Create"

### Deleting a Service Provider

You can only delete a service provider if they have no linked expenses. If you try to delete one with linked expenses, you'll see an error message.

---

## Cleaning Tasks

### How Cleaning Tasks Work

When you check out a guest, the system automatically creates a cleaning task for that room. This reminds you (or your cleaner) that the room needs to be cleaned before the next guest.

### Automatic Creation

1. You check out a booking
2. The system queues a background job
3. Within seconds, a cleaning task appears with status "Pending"
4. The task is linked to the unit and the booking

### Manual Creation

You can also create cleaning tasks manually:
1. Click "Cleaning Tasks" in the sidebar
2. Click "+ Manual Task"
3. Enter the Unit ID
4. Click "Create"

### Cleaning Task Statuses

| Status | Meaning | Next Action |
|--------|---------|-------------|
| Pending | Room needs cleaning | Click "Mark In Progress" |
| In Progress | Cleaning is happening | Click "Mark Completed" |
| Completed | Room is clean | No further action |

**You can only move forward:** Pending → In Progress → Completed. You cannot go backwards.

### Adding Notes

Click "Add Notes" on a cleaning task to record special instructions (e.g., "Extra towels needed" or "Deep clean bathroom").

---

## Maintenance Tasks

### What is a Maintenance Task?

A maintenance task tracks repair or upkeep work — fixing a leaky tap, replacing an air conditioner, repainting a wall, etc.

### Creating a Maintenance Task

1. Click "Maintenance Tasks" in the sidebar
2. Click "+ New Task"
3. Fill in:
   - **Title:** What needs to be done (e.g., "Fix bathroom tap")
   - **Priority:** Low, Medium, or High
   - **Property:** Which property (required — or provide a unit)
   - **Service Provider:** Optional — who will do the work
   - **Scheduled Date:** Optional — when it should be done
   - **Description:** Optional details
4. Click "Create"

### Maintenance Task Statuses

| Status | Meaning |
|--------|---------|
| Open | Task identified, not started |
| In Progress | Work is being done |
| Completed | Work is finished |
| Cancelled | Task no longer needed |

### Priority Levels

| Priority | When to use |
|----------|-------------|
| Low | Not urgent, can wait (e.g., repaint wall) |
| Medium | Should be done soon (e.g., fix dripping tap) |
| High | Urgent, affects guest experience (e.g., broken AC, no hot water) |

---

## Typical End-to-End Workflow

Here's a complete example of managing a guest stay:

### 1. Set Up (One-time)

1. Create your property: "Sunrise Homestay"
2. Create units: "Room 101", "Room 102", "Deluxe Suite"
3. Add service providers: "CleanPro Services", "Ali Plumbing"

### 2. New Booking

1. Guest calls to book Room 101 for June 1-3
2. Create guest record: "Ahmad bin Ali", phone 0123456789
3. Create booking: Ahmad, Room 101, Jun 1-3, RM 500

### 3. Guest Arrives (Check-In)

1. Ahmad arrives on June 1
2. Go to the booking, click "Check In"
3. Record payment: RM 300 cash deposit
4. Booking status: Checked In, Payment: Partial

### 4. Guest Leaves (Check-Out)

1. Ahmad leaves on June 3
2. Go to the booking, click "Check Out"
3. Record remaining payment: RM 200 bank transfer
4. Booking status: Checked Out, Payment: Paid
5. Cleaning task auto-created for Room 101

### 5. After Checkout

1. Mark cleaning task as "In Progress" when cleaner starts
2. Mark as "Completed" when done
3. Record expense: RM 50 cleaning fee, linked to property and service provider
4. If tap is broken, create maintenance task: "Fix Room 101 tap", priority High

### 6. Check Dashboard

- Income: RM 500 (Ahmad's payment)
- Expenses: RM 50 (cleaning)
- Net Profit: RM 450
- Outstanding: RM 0 (Ahmad fully paid)
- Pending Cleaning: 0 (completed)
- Open Maintenance: 1 (tap repair)

---

## Common Mistakes and Troubleshooting

### "The selected unit id is invalid"
The unit ID you entered doesn't exist. Check the Units page for the correct ID number.

### "Booking dates overlap with an existing booking"
Another booking already exists for that unit on those dates. Check the bookings list to see what's already booked.

### "The check-out date must be after the check-in date"
Check-out must be at least one day after check-in. Same-day checkout is not allowed.

### "A guest with this phone number already exists"
You already have a guest with that phone number. Search for them instead of creating a new record.

### "Cannot delete service provider while linked expenses exist"
You have expenses linked to this provider. Remove the links first, or keep the provider record.

### "Booking can only be updated when status is confirmed"
Once a booking is checked in, you can't change the dates or amount. Cancel and create a new booking if needed.

### "Cannot transition from 'checked_out' to 'cancelled'"
You can't cancel a booking after the guest has already left. The checkout is final.

### Dashboard shows RM 0 for everything
Make sure your payments and expenses have dates within the current calendar month. The dashboard only shows the current month's data.

### Cleaning task not appearing after checkout
The cleaning task is created by a background worker. Wait a few seconds and refresh the page. If it still doesn't appear, the queue worker may not be running — check with `docker compose ps`.
