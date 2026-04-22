import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SERVICES, SLOTS } from "@/lib/beezy";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const today = () => {
  const d = new Date();
  d.setDate(d.getDate());
  return d.toISOString().split("T")[0];
};

export const BookingWidget = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    service: "plumbing",
    preferred_date: today(),
    preferred_slot: SLOTS[0],
    full_name: "",
    phone: "",
    address: "",
    apartment: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.full_name || !form.phone || !form.address) {
      toast.error("Please fill name, phone, and address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/bookings`, form);
      if (res.status === 200 || res.status === 201) {
        setDone(true);
        toast.success("Booking confirmed — our team will WhatsApp you shortly.");
      }
    } catch (e) {
      toast.error("Could not submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        data-testid="booking-success"
        className="bg-white border border-black p-8 md:p-10"
      >
        <CheckCircle2 className="w-10 h-10 text-[#FFB800]" />
        <p className="mt-4 text-xs font-mono uppercase tracking-[0.2em] text-black/60">
          / Confirmed
        </p>
        <h3 className="font-heading font-black text-3xl md:text-4xl tracking-tight mt-2">
          You're on the list.
        </h3>
        <p className="mt-3 text-black/70">
          A verified Beezy pro will be dispatched within 60 minutes of your
          slot. We'll WhatsApp you shortly on {form.phone}.
        </p>
        <button
          type="button"
          data-testid="booking-reset-btn"
          onClick={() => {
            setDone(false);
            setStep(1);
          }}
          className="mt-6 font-heading text-xs uppercase tracking-[0.2em] font-bold border-b-2 border-black pb-1"
        >
          Book Another →
        </button>
      </div>
    );
  }

  return (
    <div
      data-testid="hero-book-widget"
      className="bg-white border border-black p-6 md:p-8 shadow-[8px_8px_0_0_#0a0a0a]"
    >
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-black/60">
          / Book a Pro · Step {step}/3
        </p>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1.5 w-6 ${
                step >= s ? "bg-[#FFB800]" : "bg-black/10"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-widest text-black/60">
              Service
            </span>
            <select
              data-testid="booking-service-select"
              value={form.service}
              onChange={(e) => update("service", e.target.value)}
              className="beezy-input mt-1 appearance-none cursor-pointer font-heading font-bold text-lg"
            >
              {SERVICES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.name} — {s.status}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-widest text-black/60">
                Date
              </span>
              <input
                type="date"
                data-testid="booking-date-picker"
                min={today()}
                value={form.preferred_date}
                onChange={(e) => update("preferred_date", e.target.value)}
                className="beezy-input mt-1 font-heading font-bold"
              />
            </label>
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-widest text-black/60">
                Slot
              </span>
              <select
                data-testid="booking-slot-select"
                value={form.preferred_slot}
                onChange={(e) => update("preferred_slot", e.target.value)}
                className="beezy-input mt-1 font-heading font-bold cursor-pointer"
              >
                {SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            data-testid="booking-next-1"
            onClick={() => setStep(2)}
            className="w-full mt-4 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-[#FFB800] text-black px-6 py-4 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-widest text-black/60">
              Full Name
            </span>
            <input
              type="text"
              data-testid="booking-name-input"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              className="beezy-input mt-1"
              placeholder="Aarav Sharma"
            />
          </label>
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-widest text-black/60">
              Phone
            </span>
            <input
              type="tel"
              data-testid="booking-phone-input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="beezy-input mt-1"
              placeholder="+91 9XXXX XXXXX"
            />
          </label>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              data-testid="booking-back-2"
              onClick={() => setStep(1)}
              className="font-heading text-sm uppercase tracking-[0.2em] font-bold border-2 border-black px-6 py-4 hover:bg-black hover:text-white transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              data-testid="booking-next-2"
              onClick={() => setStep(3)}
              className="flex-1 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-[#FFB800] text-black px-6 py-4 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-widest text-black/60">
              Address
            </span>
            <input
              type="text"
              data-testid="booking-address-input"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="beezy-input mt-1"
              placeholder="Flat 402, Prestige Tower, Koramangala"
            />
          </label>
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-widest text-black/60">
              Apartment Complex (optional)
            </span>
            <input
              type="text"
              data-testid="booking-apartment-input"
              value={form.apartment}
              onChange={(e) => update("apartment", e.target.value)}
              className="beezy-input mt-1"
              placeholder="Prestige Tower"
            />
          </label>
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-widest text-black/60">
              Notes (optional)
            </span>
            <input
              type="text"
              data-testid="booking-notes-input"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="beezy-input mt-1"
              placeholder="Leaking sink in kitchen…"
            />
          </label>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              data-testid="booking-back-3"
              onClick={() => setStep(2)}
              className="font-heading text-sm uppercase tracking-[0.2em] font-bold border-2 border-black px-6 py-4 hover:bg-black hover:text-white transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              data-testid="booking-submit-btn"
              onClick={submit}
              disabled={submitting}
              className="flex-1 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-black text-white px-6 py-4 hover:bg-[#FFB800] hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Confirm Booking"} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
