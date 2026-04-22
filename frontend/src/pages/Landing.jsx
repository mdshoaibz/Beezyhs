import Navbar from "@/components/beezy/Navbar";
import Footer from "@/components/beezy/Footer";
import BookingWidget from "@/components/beezy/BookingWidget";
import PilotForm from "@/components/beezy/PilotForm";
import { BRAND, SERVICES, STATS } from "@/lib/beezy";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Zap, ShieldCheck, Clock, Wallet } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_COLOR = {
  LIVE: "bg-[#FFB800] text-black",
  "MONTH 3": "bg-black text-white",
  "MONTH 6": "bg-black text-white",
  ROADMAP: "bg-white text-black border border-black",
  "ADD-ON": "bg-white text-black border border-black",
};

const ICONS = { "01": Clock, "02": ShieldCheck, "03": Zap, "04": Wallet };

const ShieldSection = () => {
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.address) {
      toast.error("Name, phone and address are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/shield-subscribe`, form);
      toast.success("Shield reservation confirmed. We'll onboard you at launch.");
      setForm({ full_name: "", phone: "", email: "", address: "" });
    } catch {
      toast.error("Could not reserve. Try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="shield"
      data-testid="shield-section"
      className="relative bg-black text-white px-4 sm:px-8 md:px-12 lg:px-20 py-28 md:py-36 overflow-hidden grain"
    >
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB800] mb-6">
            / New · Beezy Shield™
          </p>
          <h2 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.88]">
            A home<br />that takes<br />care of itself.
          </h2>
          <p className="mt-8 max-w-xl text-white/70 text-lg leading-relaxed">
            One annual plan replaces every ad-hoc repair call. Bundled visits, guaranteed
            same-day emergency response, predictable price — for the way Bengaluru
            actually lives.
          </p>

          <div className="mt-12 flex items-end gap-4">
            <p className="font-heading font-black text-[22vw] md:text-[11vw] leading-none tracking-tighter text-[#FFB800]"
              data-testid="shield-pricing">
              ₹2,999
            </p>
            <p className="pb-4 md:pb-8 font-mono text-sm uppercase tracking-widest text-white/70">
              / year
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 max-w-xl">
            {[
              "4 plumber visits",
              "2 electrical safety checks",
              "1 annual deep clean",
              "Same-day emergency guarantee",
              "3× upsell credits on add-ons",
              "Priority scheduling 24/7",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 text-white/85">
                <span className="mt-2 h-1.5 w-1.5 bg-[#FFB800]" />
                <span className="text-base">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={submit}
          data-testid="shield-subscribe-form"
          className="lg:col-span-5 bg-white text-black border-2 border-[#FFB800] p-8 md:p-10 self-start mt-8 lg:mt-20"
        >
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/60">
            / Reserve Shield · Launch-Day Pricing
          </p>
          <h3 className="font-heading font-black text-3xl tracking-tighter mt-2">
            Lock your price.
          </h3>
          <p className="text-sm text-black/70 mt-2">
            Reserve now — no charge until Beezy Shield goes live in Q3 2026.
          </p>

          <div className="mt-8 space-y-5">
            <input
              type="text"
              required
              data-testid="shield-name-input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Full name"
              className="beezy-input"
            />
            <input
              type="tel"
              required
              data-testid="shield-phone-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="beezy-input"
            />
            <input
              type="email"
              data-testid="shield-email-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email (optional)"
              className="beezy-input"
            />
            <input
              type="text"
              required
              data-testid="shield-address-input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Home address"
              className="beezy-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="shield-subscribe-btn"
            className="mt-8 w-full font-heading text-sm uppercase tracking-[0.2em] font-bold bg-[#FFB800] text-black px-6 py-4 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Reserving…" : "Reserve My Shield"} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
};

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-black">
      <Navbar />

      {/* HERO */}
      <section
        id="top"
        data-testid="hero-section"
        className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-4 sm:px-8 md:px-12 lg:px-20 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-[640px] h-[640px] bg-[#FFB800] blur-[180px] opacity-30 pointer-events-none" />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-black/50">
                / Home Services · Bengaluru · 2026
              </span>
            </div>
            <h1
              data-testid="hero-heading"
              className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] leading-[0.88] tracking-[-0.03em]"
            >
              Your trusted<br />
              partner for <span className="relative inline-block">
                <span className="bg-[#FFB800] text-black px-2">home</span>
              </span><br />
              solutions.
            </h1>
            <p className="mt-8 max-w-xl text-lg md:text-xl text-black/70 leading-relaxed">
              One app. Every home service. Verified pros at your door in under 60 minutes —
              delivered with speed & care across Bengaluru.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#booking"
                data-testid="hero-cta-book"
                className="font-heading text-sm uppercase tracking-[0.2em] font-bold bg-black text-white px-8 py-4 hover:bg-[#FFB800] hover:text-black transition-colors inline-flex items-center gap-2"
              >
                Book a Pro <ArrowRight size={16} />
              </a>
              <Link
                to="/investors"
                data-testid="hero-cta-investors"
                className="font-heading text-sm uppercase tracking-[0.2em] font-bold border-2 border-black px-8 py-4 hover:bg-black hover:text-white transition-colors inline-flex items-center gap-2"
              >
                Investor Deck <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl border-t border-black/15 pt-8">
              <div>
                <p className="font-heading font-black text-3xl md:text-4xl">₹1.5L Cr</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/60 mt-1">Market by 2026</p>
              </div>
              <div>
                <p className="font-heading font-black text-3xl md:text-4xl">60 min</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/60 mt-1">Response SLA</p>
              </div>
              <div>
                <p className="font-heading font-black text-3xl md:text-4xl">2M+</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/60 mt-1">Bengaluru homes</p>
              </div>
            </div>
          </div>

          <div id="booking" className="lg:col-span-5 lg:pt-8">
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section
        data-testid="marquee-section"
        className="relative bg-black text-white py-6 overflow-hidden border-y border-black"
      >
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex items-center gap-14 pr-14">
              {["EMERGENCY PLUMBING", "VERIFIED PROS", "60-MIN SLA", "BEEZY SHIELD™", "TRANSPARENT PRICING", "KORAMANGALA → HSR → WHITEFIELD"].map((t, i) => (
                <span key={`${dup}-${i}`} className="inline-flex items-center gap-14">
                  <span className="font-heading font-black text-2xl md:text-3xl tracking-tight">
                    {t}
                  </span>
                  <span className="h-2 w-2 bg-[#FFB800]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        data-testid="services-section"
        className="px-4 sm:px-8 md:px-12 lg:px-20 py-28 md:py-36"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end mb-14">
          <div className="md:col-span-8">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60 mb-4">/ 02 · Services</p>
            <h2 className="font-heading font-black text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.9]">
              One platform.<br />Every home need.
            </h2>
          </div>
          <div className="md:col-span-4 text-black/70 text-base leading-relaxed">
            We launch with emergency plumbing — the hardest wedge to crack — and expand
            service-by-service, only when NPS is above 70. No shortcuts on quality.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(260px,auto)] gap-4 md:gap-6">
          {SERVICES.map((s, i) => {
            const spans = [
              "md:col-span-6 lg:col-span-7 md:row-span-2",
              "md:col-span-6 lg:col-span-5",
              "md:col-span-3 lg:col-span-5",
              "md:col-span-3 lg:col-span-4",
              "md:col-span-3 lg:col-span-4",
              "md:col-span-3 lg:col-span-4",
              "md:col-span-6 lg:col-span-12",
            ];
            return (
              <article
                key={s.key}
                data-testid={`service-card-${s.key}`}
                className={`group relative overflow-hidden border border-black bg-white ${spans[i] || "md:col-span-6 lg:col-span-4"}`}
              >
                <div className="absolute inset-0">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="relative h-full p-6 md:p-8 flex flex-col justify-between text-white">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 ${STATUS_COLOR[s.status] || "bg-white text-black"}`}
                    >
                      {s.status}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                      {s.eta}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-3xl md:text-4xl tracking-tighter leading-[0.95]">
                      {s.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/85 max-w-md">
                      {s.blurb}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* WHY BEEZY */}
      <section
        id="why"
        data-testid="trust-section"
        className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 md:py-32 bg-white border-y border-black/10"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60 mb-6">/ 03 · Why Beezy</p>
        <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tighter leading-[0.9] max-w-4xl">
          The anti-urban-company. Built for trust, not for scale.
        </h2>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {STATS.map((m) => {
            const Icon = ICONS[m.k];
            return (
              <div
                key={m.k}
                data-testid={`trust-metric-${m.k}`}
                className="border-t-2 border-black pt-6 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="font-mono text-xs text-black/50">{m.k}</p>
                  {Icon && <Icon size={20} className="text-black/70 group-hover:text-[#FFB800] transition-colors" />}
                </div>
                <p className="font-heading font-black text-4xl md:text-5xl tracking-tighter leading-none">
                  {m.value}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/60 mt-3">
                  {m.label}
                </p>
                <p className="text-sm text-black/70 mt-4">{m.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      <ShieldSection />

      {/* PILOT */}
      <section
        id="pilot"
        data-testid="pilot-section"
        className="px-4 sm:px-8 md:px-12 lg:px-20 py-28 md:py-36 bg-[#FAFAFA]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60 mb-4">/ 05 · Pilot Program</p>
            <h2 className="font-heading font-black text-5xl md:text-6xl tracking-tighter leading-[0.9]">
              Free for the<br />first 50 homes<br />in Koramangala.
            </h2>
            <p className="mt-6 text-black/70 text-lg max-w-md">
              We're running a 30-day live pilot. Zero cost, zero commitment — help us shape the
              most trusted home services platform in India.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-black/75">
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 bg-[#FFB800]" /> Priority WhatsApp dispatch</li>
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 bg-[#FFB800]" /> Founder-led service reviews</li>
              <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 bg-[#FFB800]" /> Lifetime Shield discount for founding members</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <PilotForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
