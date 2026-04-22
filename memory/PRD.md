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
- **Backend (`/app/backend/server.py`)**: FastAPI with 4 POST + 4 GET endpoints — `/api/bookings`, `/api/pilot-signups`, `/api/shield-subscribe`, `/api/investor-contact`. Plus `/api/services` catalog. Motor + MongoDB, Pydantic models, `_id` excluded on reads.
- **Frontend pages**: `/` (Landing) and `/investors` (BrowserRouter)
- **Landing sections**: Sticky Navbar → Hero + 3-step booking widget → Marquee ticker → Services bento (7 cards, grayscale→color hover) → Why Beezy (4 stats) → Beezy Shield (dark section + reserve form) → Join Pilot form → Footer
- **Investor page**: Hero with 4 stats + Download deck button → Roadmap (3 phases, tracing-beam style) → Revenue model grid → Office Online embed of .pptx → Contact form (name/email/org/message)
- **Design**: Cabinet Grotesk + IBM Plex Sans, rounded-none, honey gold #FFB800 primary, hard borders, hover color inversions, grain texture on dark sections
- **Testing**: 8/8 pytest cases pass, all UI flows verified end-to-end

## Prioritized Backlog

### P0 (next)
- (none — MVP complete)

### P1 (engagement)
- WhatsApp deep-link after booking ("We'll contact you on WhatsApp")
- Email notifications to `beezyassistance@gmail.com` on every booking / pilot signup (SendGrid or Resend)
- Admin dashboard page at `/admin` (protected) to view submissions

### P2 (polish)
- Replace native `<select>` in BookingWidget with shadcn Select for visual consistency
- Add data-testid=`nav-mobile-toggle` (currently `nav-menu-toggle`)
- Return 201 on POST creates
- Migrate FastAPI `on_event('shutdown')` → lifespan handlers
- Add pagination + simple auth to GET list endpoints before production

### P3 (growth)
- SEO meta tags + OG images per page
- Blog / content section for "home maintenance tips" (organic SEO play)
- Integrate payment gateway (Razorpay) for actual Beezy Shield purchases at launch
- Google Maps address picker in booking flow
- SMS OTP phone verification

## API Surface (current)
```
GET    /api/                    health check
GET    /api/services            service catalog
POST   /api/bookings            create booking
GET    /api/bookings            list bookings
POST   /api/pilot-signups       join 30-day pilot
GET    /api/pilot-signups       list pilot signups
POST   /api/shield-subscribe    reserve Beezy Shield
GET    /api/shield-subscribe    list reservations
POST   /api/investor-contact    investor inquiry
GET    /api/investor-contact    list inquiries
```

## Env / Setup
- Backend env: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`
- Frontend env: `REACT_APP_BACKEND_URL`
- No third-party integrations required; no API keys needed for MVP
