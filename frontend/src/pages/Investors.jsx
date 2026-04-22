import Navbar from "@/components/beezy/Navbar";
import Footer from "@/components/beezy/Footer";
import { ROADMAP, REVENUE_STREAMS, BRAND } from "@/lib/beezy";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight, Download } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DECK_URL = "https://customer-assets.emergentagent.com/job_169ae0c9-ce4a-4a81-8065-3cce09f0ee5a/artifacts/j82d47c0_Beezy_Pitch_Deck_2026.pptx";

export default function Investors() {
  const [form, setForm] = useState({ full_name: "", email: "", organization: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.message) {
      toast.error("Name, email and message are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/investor-contact`, form);
      toast.success("Thank you — we'll be in touch within 48 hours.");
      setForm({ full_name: "", email: "", organization: "", message: "" });
    } catch {
      toast.error("Could not send message. Try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-black">
      <Navbar />

      {/* HERO */}
      <section
        data-testid="investor-hero"
        className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-4 sm:px-8 md:px-12 lg:px-20 bg-black text-white overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/14845309/pexels-photo-14845309.jpeg"
            alt="Bengaluru skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        </div>

        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB800] mb-6">
            / Pre-Seed 2026 · ₹15 Lakhs · Bengaluru
          </p>
          <h1 className="font-heading font-black text-5xl sm:text-6xl md:text-8xl tracking-tighter leading-[0.88] max-w-5xl">
            Help us build<br />India's most<br />trusted home<br />services platform.
          </h1>
          <p className="mt-8 max-w-2xl text-white/70 text-lg">
            Beezy is raising ₹15 Lakhs pre-seed to dominate hyperlocal home services in
            Bengaluru — starting with emergency plumbing and scaling through the
            Beezy Shield™ subscription.
          </p>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/20 pt-10 max-w-4xl">
            <div data-testid="investor-market-stat">
              <p className="font-heading font-black text-4xl md:text-5xl text-[#FFB800]">₹1.5L Cr</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 mt-2">Market by 2026</p>
            </div>
            <div data-testid="investor-ask-stat">
              <p className="font-heading font-black text-4xl md:text-5xl text-[#FFB800]">₹15 L</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 mt-2">Pre-seed ask</p>
            </div>
            <div>
              <p className="font-heading font-black text-4xl md:text-5xl text-[#FFB800]">₹2L</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 mt-2">Phase 2 MRR target</p>
            </div>
            <div>
              <p className="font-heading font-black text-4xl md:text-5xl text-[#FFB800]">500</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 mt-2">Shield subs · Q4</p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href="#contact"
              data-testid="investor-contact-cta"
              className="font-heading text-sm uppercase tracking-[0.2em] font-bold bg-[#FFB800] text-black px-8 py-4 hover:bg-white transition-colors inline-flex items-center gap-2"
            >
              Talk To Us <ArrowRight size={16} />
            </a>
            <a
              href={DECK_URL}
              target="_blank"
              rel="noreferrer"
              data-testid="investor-deck-download"
              className="font-heading text-sm uppercase tracking-[0.2em] font-bold border-2 border-white text-white px-8 py-4 hover:bg-white hover:text-black transition-colors inline-flex items-center gap-2"
            >
              <Download size={16} /> Download Deck
            </a>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section
        data-testid="investor-roadmap"
        className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 md:py-32"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60 mb-4">/ Go-to-market</p>
        <h2 className="font-heading font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] max-w-4xl">
          Focused.<br />Phased.<br />Fundable.
        </h2>

        <div className="relative mt-16 pl-6 md:pl-10">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-black/15" />
          <div className="space-y-14">
            {ROADMAP.map((p, i) => (
              <div
                key={p.phase}
                data-testid={`roadmap-phase-${i + 1}`}
                className="relative grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                <span className="absolute -left-[27px] md:-left-[43px] top-2 h-3 w-3 bg-[#FFB800] border-2 border-black" />
                <div className="md:col-span-4">
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-black/60">
                    {p.window}
                  </p>
                  <h3 className="font-heading font-black text-3xl md:text-4xl tracking-tighter mt-2">
                    {p.phase}
                  </h3>
                  <p className="font-heading font-bold text-xl text-[#FFB800] mt-1">
                    {p.title}
                  </p>
                </div>
                <ul className="md:col-span-8 space-y-3">
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-3 text-base md:text-lg border-b border-black/10 pb-3"
                    >
                      <span className="font-mono text-black/50 text-xs pt-1.5">—</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVENUE */}
      <section
        data-testid="investor-revenue"
        className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 md:py-32 bg-white border-y border-black/10"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60 mb-4">/ Revenue model</p>
        <h2 className="font-heading font-black text-5xl md:text-6xl tracking-tighter leading-[0.9]">
          Multiple streams.<br />Recurring core.
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-black/20">
          {REVENUE_STREAMS.map((r) => (
            <div
              key={r.label}
              className="p-8 border-r border-b border-black/20 bg-white hover:bg-[#FFB800] transition-colors duration-500"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-black/60 mb-6">
                {r.label}
              </p>
              <p className="font-heading font-black text-4xl md:text-5xl tracking-tighter leading-none">
                {r.value}
              </p>
              <p className="text-sm text-black/70 mt-4">{r.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DECK EMBED */}
      <section
        data-testid="investor-deck-embed"
        className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 md:py-32 bg-[#FAFAFA]"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60 mb-4">/ The deck</p>
        <h2 className="font-heading font-black text-5xl md:text-6xl tracking-tighter leading-[0.9] max-w-3xl">
          Read the full<br />Beezy story.
        </h2>
        <p className="mt-6 text-black/70 max-w-xl">
          Problem, solution, gap analysis, strategy, moat and ask — our 10-slide pitch
          is embedded below. You can also download the original .pptx.
        </p>

        <div className="mt-12 border-2 border-black bg-white">
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(DECK_URL)}`}
            title="Beezy Pitch Deck 2026"
            className="w-full h-[520px] md:h-[640px]"
            frameBorder="0"
          />
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        data-testid="investor-contact"
        className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 md:py-32 bg-black text-white"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB800] mb-4">/ The ask</p>
            <h2 className="font-heading font-black text-5xl md:text-6xl tracking-tighter leading-[0.9]">
              Let's build India's<br />most trusted<br />home brand.
            </h2>
            <div className="mt-10 space-y-6 text-white/80">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Email</p>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="text-xl md:text-2xl font-heading font-bold text-[#FFB800] hover:underline"
                >
                  {BRAND.email}
                </a>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Based in</p>
                <p className="text-lg">{BRAND.location}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Looking for</p>
                <ul className="text-lg space-y-1">
                  <li>— ₹15 Lakhs pre-seed</li>
                  <li>— Incubator mentorship (NASSCOM 10K, T-Hub, NSRCEL)</li>
                  <li>— 2 housing society / PG pilot partners</li>
                </ul>
              </div>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="lg:col-span-7 bg-white text-black p-8 md:p-12 border border-[#FFB800]"
          >
            <h3 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">
              Get in touch.
            </h3>
            <p className="mt-2 text-black/60 text-sm">
              We respond to every inbound within 48 hours.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <input
                type="text"
                required
                data-testid="investor-name-input"
                placeholder="Full name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="beezy-input"
              />
              <input
                type="email"
                required
                data-testid="investor-email-input"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="beezy-input"
              />
              <input
                type="text"
                data-testid="investor-org-input"
                placeholder="Organization (optional)"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="beezy-input md:col-span-2"
              />
              <textarea
                required
                data-testid="investor-message-input"
                placeholder="Your note — investment interest, partnership, press…"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="beezy-input md:col-span-2 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="investor-submit-btn"
              className="mt-10 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-black text-white px-8 py-4 hover:bg-[#FFB800] hover:text-black transition-colors inline-flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Message"} <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
