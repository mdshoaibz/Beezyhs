import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { BRAND } from "@/lib/beezy";
import { ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back.");
      nav("/admin", { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      data-testid="admin-login"
      className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-3 mb-12">
          <img src={BRAND.logoUrl} alt="Beezy" className="h-12 w-auto" />
        </Link>

        <div className="border border-black bg-white p-8 md:p-10 shadow-[8px_8px_0_0_#0a0a0a]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60">
            / Admin Access
          </p>
          <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tighter mt-2">
            Sign in.
          </h1>
          <p className="mt-2 text-sm text-black/60">
            For Beezy operators only. Lead data & pipeline inside.
          </p>

          <form onSubmit={submit} className="mt-10 space-y-6">
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-widest text-black/60">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="beezy-input mt-1"
                placeholder="you@beezy.in"
                data-testid="admin-email-input"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-widest text-black/60">
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="beezy-input mt-1"
                placeholder="••••••••"
                data-testid="admin-password-input"
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-btn"
              className="w-full mt-4 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-black text-white px-6 py-4 hover:bg-[#FFB800] hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-black/50 font-mono text-center">
          © 2026 Beezy Home Services · Bengaluru
        </p>
      </div>
    </main>
  );
}
