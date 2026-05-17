# OLÉ — Frontend

React + Vite app for booking sports fields. Built with React Router v6, Axios, and plain CSS.

---

## Stack

| Tech | Version |
|---|---|
| React | 18 |
| Vite | 5 |
| React Router | v6 |
| Axios | 1.x |

---

## Routes

| Path | Page | Auth required |
|---|---|---|
| `/` | Home — sport carousel | No |
| `/fields` | Fields list with filters | No |
| `/fields/:id` | Field detail + schedule preview | No |
| `/bookings/new?field=:id` | New booking — calendar + time slots | Yes |
| `/bookings/new?field=:id&edit=:bookingId&...` | Edit existing booking | Yes |
| `/bookings` | All bookings (admin view) | Yes |
| `/mybookings` | My bookings | Yes |
| `/login` | Login | No |
| `/register` | Register | No |

---

## Pages

### `/` — Home
Fullscreen carousel cycling through sports (Fútbol, Volleyball, Basketball, etc.).
Autoplay every 4 s. Swipe/drag supported. Clicking the main card navigates to `/fields?sport=:id`.

### `/fields` — Fields
Grid of field cards. Filterable by sport (URL param `?sport=:id`) and searchable by name.

### `/fields/:id` — Field Detail
Shows field info, schedule table for the week, and a "Reservar" button to `/bookings/new?field=:id`.

### `/bookings/new` — New / Edit Booking
URL params:
- `field` — field UUID (required)
- `date` — pre-selected date (optional)
- `edit` — booking UUID to edit (optional)
- `dateStart`, `dateEnd`, `amount` — pre-filled values when editing

Loads field availability, renders a time-slot grid, lets the user pick start/end, then POSTs or PUTs.

### `/bookings` — All Bookings (admin)
Table/card list of every booking. Can cancel any booking.

### `/mybookings` — My Bookings
Cards for the logged-in user's bookings. Edit navigates back to `/bookings/new` with edit params. Cancel hits the PUT cancel endpoint.

---

## API calls

Base URL is read from `VITE_API_URL` in `.env`. All authenticated requests send `Authorization: Bearer <token>` via an Axios interceptor.

| Method | Endpoint | Used in | Auth |
|---|---|---|---|
| GET | `/fields` | Home, Fields | No |
| GET | `/fields/:id` | FieldDetail, NewBooking | No |
| GET | `/fields/:id/availability?start=...&end=...` | NewBooking | No |
| GET | `/bookings` | Bookings (admin) | Yes |
| GET | `/bookings/my` | MyBookings | Yes |
| POST | `/bookings` | NewBooking | Yes |
| PUT | `/bookings/:id` | NewBooking (edit) | Yes |
| PUT | `/bookings/:id/cancel` | Bookings, MyBookings | Yes |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/register` | Register | No |

### Datetime format

All datetimes are sent as **local time strings** with no UTC offset: `YYYY-MM-DDTHH:MM:00`

Example: `2026-05-16T18:00:00`

`toISOString()` must NOT be used — it outputs UTC and causes the wrong slot to be saved.

---

## Auth

Token is stored in `localStorage` under key `cliente`:

```json
{ "token": "...", "name": "Juan", "lastname": "Perez", "email": "juan@example.com" }
```

`src/api/axios.js` reads it in a request interceptor and attaches the `Authorization` header automatically. On 401 responses the interceptor clears `localStorage` and redirects to `/login`.

---

## File structure

```
src/
├── api/
│   └── axios.js          # Axios instance + auth interceptor + all API functions
├── components/
│   ├── Navbar.jsx         # Sticky/transparent navbar + slide-in drawer
│   └── UserPopup.jsx      # Avatar button with logout dropdown
├── css/
│   ├── Navbar.css
│   ├── Home.css
│   ├── Fields.css
│   ├── FieldDetail.css
│   ├── NewBooking.css
│   ├── Bookings.css
│   └── MyBookings.css
├── pages/
│   ├── Home.jsx
│   ├── Fields.jsx
│   ├── FieldDetail.jsx
│   ├── NewBooking.jsx
│   ├── Bookings.jsx
│   ├── MyBookings.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── App.jsx                # Router + routes
└── main.jsx
```

---

## Responsive breakpoints

| Breakpoint | Changes |
|---|---|
| 900px | Home cards shrink, layout stacks vertically |
| 768px | Navbar collapses — links hidden, hamburger shown, padding reduced |
| 640px | Fields grid becomes 1 column, search bar full width |
| 600px | NewBooking layout stacks, schedule grid becomes 1 column |
| 480px | Home hero further compressed, inner navbar CTA hidden |

---

## Environment variables

Create a `.env` file at the project root:

```
VITE_API_URL=http://localhost:8080
```
