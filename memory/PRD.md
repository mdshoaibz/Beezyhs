# Beezy Home Services — PRD

## Original Problem Statement
"lets a create an webpage for my startup beezy home services and logo is bellow with my pitch deck tempalte"

## User Choices (Dec 2025)
- Site type: Full site — marketing landing + functional booking flow + investor-focused page + pilot waitlist
- Design vibe: Let the designer decide → Swiss Brutalist / High-Contrast (Stark White + Black + Beezy Honey Gold)
- Tagline: "Your Trusted Partner for Home Solutions, Delivered with Speed & Care."
- Contact email: beezyassistance@gmail.com
- Fonts: Cabinet Grotesk (headings) + IBM Plex Sans (body) + IBM Plex Mono (labels)

## User Personas
1. **Bengaluru homeowner** — needs emergency plumbing/electrician, wants 60-min response, verified pros
2. **Apartment resident in Koramangala** — signs up for 30-day free pilot
3. **Beezy Shield subscriber** — wants bundled annual maintenance
4. **Pre-seed investor / incubator** — reviews pitch deck, stats, roadmap

## Core Requirements
- One-click service booking (plumbing, electrical, cleaning, elder care, AC, painting, pest control)
- Beezy Shield ₹2,999/yr subscription reservation
- Pilot waitlist capture (Koramangala first)
- Investor-facing page with pitch deck embed + contact form
- Lead storage in MongoDB with UUID IDs

## Implemented (Dec 2025)
- **Backend (`/app/backend/server.py`)**: FastAPI with 4 public POSTs (bookings, pilot-signups, shield-subscribe, investor-contact), `/api/services` catalog, `/api/auth/login` + `/api/auth/me`, and 5 JWT-protected `/api/admin/*` endpoints (stats + 4 paginated lists). Motor + MongoDB, Pydantic v2, `_id` excluded on reads, bcrypt password hashing, HS256 JWT (24h), idempotent admin seed on startup.
- **Email notifications**: Resend SDK integrated. Every public POST triggers `BackgroundTasks.notify_admin()` (fire-and-forget, non-blocking) that emails a styled lead summary to `ADMIN_NOTIFY_EMAIL`. Sender: `onboarding@resend.dev` (sandbox).
- **Frontend pages**: `/` (Landing), `/investors` (Investor page), `/admin/login`, `/admin` (protected)
- **Landing sections**: Sticky Navbar → Hero + 3-step booking widget → Marquee ticker → Services bento (7 cards) → Why Beezy (4 stats) → Beezy Shield (dark section + reserve form) → Join Pilot form → Footer
- **Investor page**: Hero + 4 stats + deck download → 3-phase roadmap → Revenue model grid → Pitch deck embed → Contact form
- **Admin dashboard (`/admin`)**: AuthContext with localStorage token, axios interceptor with 401-auto-redirect, ProtectedRoute, stats cards (total/bookings/pilot/shield/investors), 4 tabs with row counts, paginated table (20/50/100 per page), client-side search on current page, CSV export, click-to-WhatsApp + click-to-call + click-to-email shortcuts, refresh + logout.
- **Design**: Cabinet Grotesk + IBM Plex Sans, rounded-none, honey gold #FFB800 primary, hard borders, hover color inversions, grain texture on dark sections
- **Testing**: Iteration 1 — 8/8 pytest + all UI flows. Iteration 2 — 28/28 pytest + 15/15 UI checks (auth, pagination, 401 gating, BG email tasks, CSV export).

## Prioritized Backlog

### P0 (next)
- (none — MVP + admin console complete)

### P1 (launch-readiness)
- Verify a domain on Resend (e.g., `beezy.in`) so notifications can be sent `from: noreply@beezy.in` to any recipient, not just the account owner
- Razorpay integration for real Beezy Shield purchases at launch
- Brute-force lockout on login (5 fails → 15-min block)

### P2 (polish)
- Tighten CORS from `*` to explicit frontend origin before production
- Migrate FastAPI `on_event` → lifespan context manager
- Replace native `<select>` in BookingWidget with shadcn Select
- Server-side search across all leads (not just current page)

### P3 (growth)
- WhatsApp click-to-chat button on public landing (not just admin)
- SEO meta tags + OG images
- Blog / home maintenance tips
- Google Maps address picker in booking flow
- SMS OTP phone verification

## API Surface (current)
```
Public
GET    /api/                           health check
GET    /api/services                   service catalog
POST   /api/bookings                   create booking (+ email admin)
POST   /api/pilot-signups              join 30-day pilot (+ email admin)
POST   /api/shield-subscribe           reserve Beezy Shield (+ email admin)
POST   /api/investor-contact           investor inquiry (+ email admin)

Auth
POST   /api/auth/login                 { email, password } → { access_token, expires_in }
GET    /api/auth/me                    Bearer → admin profile

Admin (Bearer <token> required, paginated)
GET    /api/admin/stats
GET    /api/admin/bookings              ?page=1&page_size=50
GET    /api/admin/pilot-signups         ?page=1&page_size=50
GET    /api/admin/shield-subscriptions  ?page=1&page_size=50
GET    /api/admin/investor-inquiries    ?page=1&page_size=50
```

## Env / Setup
- Backend env: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `RESEND_API_KEY`, `SENDER_EMAIL`, `ADMIN_NOTIFY_EMAIL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`
- Frontend env: `REACT_APP_BACKEND_URL`
- Admin login URL: `/admin/login`
