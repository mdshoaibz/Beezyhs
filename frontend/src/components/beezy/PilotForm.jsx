import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SERVICES } from "@/lib/beezy";
import { ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PilotForm = () => {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    apartment_complex: "",
    service_needed: "plumbing",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.apartment_complex) {
      toast.error("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/pilot-signups`, form);
      setDone(true);
      toast.success("You're on the pilot list. We'll reach out on WhatsApp.");
      setForm({ full_name: "", phone: "", apartment_complex: "", service_needed: "plumbing" });
    } catch (err) {
      toast.error("Could not join pilot. Try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      data-testid="pilot-form"
      className="bg-[#F0F0F0] border-2 border-black p-8 md:p-12"
    >
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/60">
        / 30-Day Free Pilot · Koramangala First
      </p>
      <h3 className="font-heading font-black text-3xl md:text-5xl tracking-tighter mt-4">
        Join the Beezy Pilot.
      </h3>
      <p className="mt-3 text-black/70 max-w-xl">
        First 50 homes get complimentary emergency plumbing + priority slot for
        Beezy Shield™ at launch. No card, no catch.
      </p>

      {done && (
        <div
          data-testid="pilot-success"
          className="mt-6 border-l-4 border-[#FFB800] bg-white px-4 py-3 text-sm"
        >
          ✓ You're in. We'll WhatsApp you before launch.
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <label className="block">
          <span className="text-xs font-mono uppercase tracking-widest text-black/60">
            Full Name
          </span>
          <input
            type="text"
            required
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            data-testid="pilot-name-input"
            className="beezy-input mt-1 bg-transparent"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-xs font-mono uppercase tracking-widest text-black/60">
            Phone
          </span>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            data-testid="pilot-phone-input"
            className="beezy-input mt-1 bg-transparent"
            placeholder="+91 9XXXX XXXXX"
          />
        </label>
        <label className="block">
          <span className="text-xs font-mono uppercase tracking-widest text-black/60">
            Apartment Complex
          </span>
          <input
            type="text"
            required
            value={form.apartment_complex}
            onChange={(e) => update("apartment_complex", e.target.value)}
            data-testid="pilot-apartment-input"
            className="beezy-input mt-1 bg-transparent"
            placeholder="e.g. Prestige Acropolis"
          />
        </label>
        <label className="block">
          <span className="text-xs font-mono uppercase tracking-widest text-black/60">
            Service You Need
          </span>
          <select
            value={form.service_needed}
            onChange={(e) => update("service_needed", e.target.value)}
            data-testid="pilot-service-select"
            className="beezy-input mt-1 bg-transparent cursor-pointer font-heading font-bold"
          >
            {SERVICES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        data-testid="pilot-submit-btn"
        className="mt-10 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-black text-white px-8 py-4 hover:bg-[#FFB800] hover:text-black transition-colors inline-flex items-center gap-2 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Claim My Pilot Spot"} <ArrowRight size={16} />
      </button>
    </form>
  );
};

export default PilotForm;
