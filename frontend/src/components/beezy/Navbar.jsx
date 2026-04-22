import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BRAND } from "@/lib/beezy";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink =
    "font-heading text-sm uppercase tracking-[0.18em] font-bold text-black/80 hover:text-black transition-colors";

  const isHome = pathname === "/";

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="px-4 sm:px-8 md:px-12 lg:px-20 h-16 md:h-20 flex items-center justify-between">
        <Link
          to="/"
          data-testid="nav-logo"
          className="flex items-center gap-3"
        >
          <img
            src={BRAND.logoUrl}
            alt="Beezy Home Services"
            className="h-10 md:h-12 w-auto object-contain"
          />
          <span className="sr-only">Beezy Home Services</span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {isHome ? (
            <>
              <a href="#services" data-testid="nav-services-link" className={navLink}>
                Services
              </a>
              <a href="#shield" data-testid="nav-shield-link" className={navLink}>
                Beezy Shield
              </a>
              <a href="#pilot" data-testid="nav-pilot-link" className={navLink}>
                Pilot
              </a>
            </>
          ) : (
            <Link to="/" className={navLink}>
              Home
            </Link>
          )}
          <Link to="/investors" data-testid="nav-investors-link" className={navLink}>
            Investors
          </Link>
          <a
            href="#booking"
            data-testid="nav-book-cta"
            className="font-heading text-sm uppercase tracking-[0.16em] font-bold bg-[#FFB800] text-black px-5 py-3 hover:bg-black hover:text-white transition-colors duration-300"
          >
            Book Now →
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          data-testid="nav-menu-toggle"
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div
          data-testid="nav-mobile-menu"
          className="md:hidden bg-white border-t border-black/10 px-4 py-6 space-y-4"
        >
          <a href="#services" onClick={() => setOpen(false)} className={`${navLink} block`}>
            Services
          </a>
          <a href="#shield" onClick={() => setOpen(false)} className={`${navLink} block`}>
            Beezy Shield
          </a>
          <a href="#pilot" onClick={() => setOpen(false)} className={`${navLink} block`}>
            Pilot
          </a>
          <Link to="/investors" onClick={() => setOpen(false)} className={`${navLink} block`}>
            Investors
          </Link>
          <a
            href="#booking"
            onClick={() => setOpen(false)}
            className="block text-center font-heading text-sm uppercase tracking-[0.16em] font-bold bg-[#FFB800] text-black px-5 py-3"
          >
            Book Now →
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
