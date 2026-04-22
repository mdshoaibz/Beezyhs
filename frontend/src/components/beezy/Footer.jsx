import { BRAND } from "@/lib/beezy";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer
    data-testid="site-footer"
    className="relative bg-black text-white px-4 sm:px-8 md:px-12 lg:px-20 pt-24 pb-10 overflow-hidden"
  >
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      <div className="md:col-span-7">
        <p className="font-heading text-xs uppercase tracking-[0.24em] text-[#FFB800] mb-6">
          / Beezy · Bengaluru · 2026
        </p>
        <h3 className="font-heading font-black text-[16vw] md:text-[13vw] leading-[0.85] tracking-tighter">
          BEEZY.
        </h3>
      </div>
      <div className="md:col-span-5 grid grid-cols-2 gap-10 pt-4 md:pt-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Contact</p>
          <a
            href={`mailto:${BRAND.email}`}
            data-testid="footer-email-link"
            className="block text-lg md:text-2xl font-heading font-bold text-[#FFB800] hover:underline break-all"
          >
            {BRAND.email}
          </a>
          <p className="mt-3 text-white/70 text-sm">{BRAND.location}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Navigate</p>
          <ul className="space-y-2 text-sm" data-testid="footer-social-links">
            <li>
              <Link to="/" className="hover:text-[#FFB800] transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/investors" className="hover:text-[#FFB800] transition-colors">Investors</Link>
            </li>
            <li>
              <a href="#services" className="hover:text-[#FFB800] transition-colors">Services</a>
            </li>
            <li>
              <a href="#shield" className="hover:text-[#FFB800] transition-colors">Beezy Shield</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div className="mt-16 pt-6 border-t border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <p className="text-xs text-white/50 tracking-wider uppercase">
        © 2026 Beezy Home Services · Made in Bengaluru with speed & care.
      </p>
      <p className="font-mono text-xs text-white/40">
        v1.0 · Pilot Pre-Seed 2026
      </p>
    </div>
  </footer>
);

export default Footer;
