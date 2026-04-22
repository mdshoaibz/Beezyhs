from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import math
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any

import bcrypt
import jwt
import resend
from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr

# ============ CONFIG ============
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-prod")
JWT_ALGO = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24  # 24h — admin dashboard
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@beezy.in")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
ADMIN_NOTIFY_EMAIL = os.environ.get("ADMIN_NOTIFY_EMAIL", ADMIN_EMAIL)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("beezy")

app = FastAPI(title="Beezy Home Services API")
api_router = APIRouter(prefix="/api")
bearer_scheme = HTTPBearer(auto_error=False)


# ============ HELPERS ============
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_admin(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access" or payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Admin not found")
    return user


# ============ EMAIL ============
def _send_email_sync(to: str, subject: str, html: str) -> None:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email send")
        return
    try:
        resend.Emails.send({
            "from": SENDER_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
    except Exception as e:
        logger.error(f"Resend send failed: {e}")


async def send_email(to: str, subject: str, html: str) -> None:
    await asyncio.to_thread(_send_email_sync, to, subject, html)


def _row_html(rows: list) -> str:
    cells = "".join(
        f'<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-family:system-ui,sans-serif;font-size:13px;">{k}</td>'
        f'<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0a0a0a;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;">{v}</td></tr>'
        for k, v in rows
    )
    return (
        '<table style="border-collapse:collapse;width:100%;max-width:560px;border:1px solid #eee;">'
        + cells + '</table>'
    )


def _notification_html(title: str, intro: str, rows: list) -> str:
    return f"""
    <div style="background:#fafafa;padding:32px 16px;font-family:system-ui,-apple-system,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;">
        <div style="background:#FFB800;padding:16px 24px;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#0a0a0a;font-weight:700;">Beezy · New Lead</p>
        </div>
        <div style="padding:24px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#0a0a0a;">{title}</h1>
          <p style="margin:0 0 20px;color:#555;font-size:14px;">{intro}</p>
          {_row_html(rows)}
          <p style="margin:24px 0 0;font-size:12px;color:#999;">Reply via the admin dashboard or directly to the contact's email.</p>
        </div>
      </div>
    </div>
    """


async def notify_admin(title: str, intro: str, rows: list):
    html = _notification_html(title, intro, rows)
    await send_email(ADMIN_NOTIFY_EMAIL, f"[Beezy] {title}", html)


# ============ MODELS ============
class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service: str
    full_name: str
    phone: str
    address: str
    apartment: Optional[str] = ""
    preferred_date: str
    preferred_slot: str
    notes: Optional[str] = ""
    created_at: str = Field(default_factory=_now_iso)


class BookingCreate(BaseModel):
    service: str
    full_name: str
    phone: str
    address: str
    apartment: Optional[str] = ""
    preferred_date: str
    preferred_slot: str
    notes: Optional[str] = ""


class PilotSignup(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone: str
    apartment_complex: str
    service_needed: str
    created_at: str = Field(default_factory=_now_iso)


class PilotSignupCreate(BaseModel):
    full_name: str
    phone: str
    apartment_complex: str
    service_needed: str


class ShieldSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone: str
    email: Optional[str] = ""
    address: str
    plan: str = "Beezy Shield Annual"
    created_at: str = Field(default_factory=_now_iso)


class ShieldSubscriptionCreate(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = ""
    address: str


class InvestorInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: EmailStr
    organization: Optional[str] = ""
    message: str
    created_at: str = Field(default_factory=_now_iso)


class InvestorInquiryCreate(BaseModel):
    full_name: str
    email: EmailStr
    organization: Optional[str] = ""
    message: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    email: str


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    pages: int


# ============ PUBLIC ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "Beezy Home Services API", "status": "live"}


@api_router.get("/services")
async def list_services():
    return {
        "services": [
            {"key": "plumbing", "name": "Emergency Plumbing", "status": "live", "eta": "Day 1", "description": "60-minute response. Verified, ITI-certified plumbers."},
            {"key": "electrical", "name": "Electricians", "status": "month_3", "eta": "July 2026", "description": "Wiring, fittings, safety audits. Launches Month 3."},
            {"key": "cleaning", "name": "Deep Cleaning", "status": "month_6", "eta": "October 2026", "description": "Full-home deep cleans by trained hygiene crews."},
            {"key": "eldercare", "name": "Elder Care Companionship", "status": "roadmap", "eta": "Phase 3", "description": "Non-clinical companionship for Bengaluru families."},
            {"key": "ac", "name": "AC Service", "status": "addon", "eta": "Shield Add-on", "description": "Annual servicing, gas refills, diagnostics."},
            {"key": "painting", "name": "Painting", "status": "addon", "eta": "Shield Add-on", "description": "Interior & exterior, premium finishes."},
            {"key": "pestcontrol", "name": "Pest Control", "status": "addon", "eta": "Shield Add-on", "description": "Safe, kid-and-pet friendly treatment."},
        ]
    }


@api_router.post("/bookings", response_model=Booking, status_code=status.HTTP_201_CREATED)
async def create_booking(payload: BookingCreate, background: BackgroundTasks):
    booking = Booking(**payload.model_dump())
    await db.bookings.insert_one(booking.model_dump())
    background.add_task(
        notify_admin,
        "New Booking",
        f"{booking.full_name} booked <b>{booking.service}</b> for {booking.preferred_date}.",
        [
            ("Name", booking.full_name),
            ("Phone", booking.phone),
            ("Service", booking.service),
            ("Date", booking.preferred_date),
            ("Slot", booking.preferred_slot),
            ("Address", booking.address),
            ("Apartment", booking.apartment or "—"),
            ("Notes", booking.notes or "—"),
        ],
    )
    return booking


@api_router.post("/pilot-signups", response_model=PilotSignup, status_code=status.HTTP_201_CREATED)
async def create_pilot_signup(payload: PilotSignupCreate, background: BackgroundTasks):
    signup = PilotSignup(**payload.model_dump())
    await db.pilot_signups.insert_one(signup.model_dump())
    background.add_task(
        notify_admin,
        "New Pilot Signup",
        f"{signup.full_name} joined the pilot from <b>{signup.apartment_complex}</b>.",
        [
            ("Name", signup.full_name),
            ("Phone", signup.phone),
            ("Apartment", signup.apartment_complex),
            ("Service", signup.service_needed),
        ],
    )
    return signup


@api_router.post("/shield-subscribe", response_model=ShieldSubscription, status_code=status.HTTP_201_CREATED)
async def create_shield(payload: ShieldSubscriptionCreate, background: BackgroundTasks):
    sub = ShieldSubscription(**payload.model_dump())
    await db.shield_subscriptions.insert_one(sub.model_dump())
    background.add_task(
        notify_admin,
        "New Beezy Shield Reservation",
        f"{sub.full_name} reserved <b>Beezy Shield</b> annual plan.",
        [
            ("Name", sub.full_name),
            ("Phone", sub.phone),
            ("Email", sub.email or "—"),
            ("Address", sub.address),
        ],
    )
    return sub


@api_router.post("/investor-contact", response_model=InvestorInquiry, status_code=status.HTTP_201_CREATED)
async def create_investor(payload: InvestorInquiryCreate, background: BackgroundTasks):
    inq = InvestorInquiry(**payload.model_dump())
    await db.investor_inquiries.insert_one(inq.model_dump())
    background.add_task(
        notify_admin,
        "New Investor Inquiry",
        f"<b>{inq.full_name}</b>{' (' + inq.organization + ')' if inq.organization else ''} sent a message.",
        [
            ("Name", inq.full_name),
            ("Email", inq.email),
            ("Organization", inq.organization or "—"),
            ("Message", inq.message),
        ],
    )
    return inq


# ============ AUTH ROUTES ============
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(payload.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(admin["id"], admin["email"])
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_MINUTES * 60,
        email=admin["email"],
    )


@api_router.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin


# ============ PROTECTED ADMIN ROUTES (paginated) ============
async def _paginate(collection, page: int, page_size: int) -> PaginatedResponse:
    page = max(1, page)
    page_size = max(1, min(200, page_size))
    total = await collection.count_documents({})
    cursor = (
        collection.find({}, {"_id": 0})
        .sort("created_at", -1)
        .skip((page - 1) * page_size)
        .limit(page_size)
    )
    items = await cursor.to_list(length=page_size)
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)) if total else 0,
    )


@api_router.get("/admin/bookings", response_model=PaginatedResponse)
async def admin_list_bookings(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), admin=Depends(get_current_admin)):
    return await _paginate(db.bookings, page, page_size)


@api_router.get("/admin/pilot-signups", response_model=PaginatedResponse)
async def admin_list_pilot(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), admin=Depends(get_current_admin)):
    return await _paginate(db.pilot_signups, page, page_size)


@api_router.get("/admin/shield-subscriptions", response_model=PaginatedResponse)
async def admin_list_shield(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), admin=Depends(get_current_admin)):
    return await _paginate(db.shield_subscriptions, page, page_size)


@api_router.get("/admin/investor-inquiries", response_model=PaginatedResponse)
async def admin_list_investor(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), admin=Depends(get_current_admin)):
    return await _paginate(db.investor_inquiries, page, page_size)


@api_router.get("/admin/stats")
async def admin_stats(admin=Depends(get_current_admin)):
    bookings = await db.bookings.count_documents({})
    pilot = await db.pilot_signups.count_documents({})
    shield = await db.shield_subscriptions.count_documents({})
    investors = await db.investor_inquiries.count_documents({})
    return {
        "bookings": bookings,
        "pilot_signups": pilot,
        "shield_subscriptions": shield,
        "investor_inquiries": investors,
        "total_leads": bookings + pilot + shield + investors,
    }


# ============ STARTUP ============
async def seed_admin():
    existing = await db.admins.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        doc = {
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": _now_iso(),
        }
        await db.admins.insert_one(doc)
        logger.info(f"Seeded admin: {ADMIN_EMAIL}")
    else:
        # Keep password in sync with env on restart
        if not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
            await db.admins.update_one(
                {"email": ADMIN_EMAIL.lower()},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info("Admin password re-synced with env")


@app.on_event("startup")
async def on_startup():
    await db.admins.create_index("email", unique=True)
    await seed_admin()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
