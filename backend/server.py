from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Beezy Home Services API")
api_router = APIRouter(prefix="/api")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============ MODELS ============
class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service: str
    full_name: str
    phone: str
    address: str
    apartment: Optional[str] = ""
    preferred_date: str  # ISO date string YYYY-MM-DD
    preferred_slot: str  # e.g. "Morning (8–11 AM)"
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


# ============ ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "Beezy Home Services API", "status": "live"}


@api_router.get("/services")
async def list_services():
    # Static catalog driven by pitch deck roadmap
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


@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    booking = Booking(**payload.model_dump())
    await db.bookings.insert_one(booking.model_dump())
    return booking


@api_router.get("/bookings", response_model=List[Booking])
async def list_bookings():
    rows = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.post("/pilot-signups", response_model=PilotSignup)
async def create_pilot_signup(payload: PilotSignupCreate):
    signup = PilotSignup(**payload.model_dump())
    await db.pilot_signups.insert_one(signup.model_dump())
    return signup


@api_router.get("/pilot-signups", response_model=List[PilotSignup])
async def list_pilot_signups():
    rows = await db.pilot_signups.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.post("/shield-subscribe", response_model=ShieldSubscription)
async def create_shield(payload: ShieldSubscriptionCreate):
    sub = ShieldSubscription(**payload.model_dump())
    await db.shield_subscriptions.insert_one(sub.model_dump())
    return sub


@api_router.get("/shield-subscribe", response_model=List[ShieldSubscription])
async def list_shield():
    rows = await db.shield_subscriptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


@api_router.post("/investor-contact", response_model=InvestorInquiry)
async def create_investor(payload: InvestorInquiryCreate):
    inq = InvestorInquiry(**payload.model_dump())
    await db.investor_inquiries.insert_one(inq.model_dump())
    return inq


@api_router.get("/investor-contact", response_model=List[InvestorInquiry])
async def list_investor():
    rows = await db.investor_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rows


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
