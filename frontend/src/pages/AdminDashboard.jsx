import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BRAND } from "@/lib/beezy";
import {
  LogOut,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";

const TABS = [
  { key: "bookings", label: "Bookings", endpoint: "/admin/bookings" },
  { key: "pilot", label: "Pilot Signups", endpoint: "/admin/pilot-signups" },
  { key: "shield", label: "Beezy Shield", endpoint: "/admin/shield-subscriptions" },
  { key: "investors", label: "Investors", endpoint: "/admin/investor-inquiries" },
];

const COLUMNS = {
  bookings: [
    { key: "created_at", label: "When" },
    { key: "full_name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "service", label: "Service" },
    { key: "preferred_date", label: "Date" },
    { key: "preferred_slot", label: "Slot" },
    { key: "address", label: "Address" },
    { key: "notes", label: "Notes" },
  ],
  pilot: [
    { key: "created_at", label: "When" },
    { key: "full_name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "apartment_complex", label: "Apartment" },
    { key: "service_needed", label: "Service" },
  ],
  shield: [
    { key: "created_at", label: "When" },
    { key: "full_name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
  ],
  investors: [
    { key: "created_at", label: "When" },
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "organization", label: "Org" },
    { key: "message", label: "Message" },
  ],
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

const toCSV = (rows, cols) => {
  const head = cols.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((r) =>
      cols
        .map((c) => {
          const v = r[c.key] ?? "";
          const safe = String(v).replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(",")
    )
    .join("\n");
  return `${head}\n${body}`;
};

const downloadCSV = (filename, text) => {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const StatCard = ({ label, value, testId, accent }) => (
  <div
    data-testid={testId}
    className={`border border-black bg-white p-6 ${accent ? "bg-[#FFB800]" : ""}`}
  >
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
      {label}
    </p>
    <p className="font-heading font-black text-4xl md:text-5xl mt-2 tracking-tighter leading-none">
      {value ?? "—"}
    </p>
  </div>
);

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const nav = useNavigate();

  const [activeTab, setActiveTab] = useState("bookings");
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const activeTabCfg = useMemo(
    () => TABS.find((t) => t.key === activeTab),
    [activeTab]
  );

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch (e) {
      /* handled by interceptor */
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!activeTabCfg) return;
    setLoading(true);
    try {
      const { data } = await api.get(activeTabCfg.endpoint, {
        params: { page, page_size: pageSize },
      });
      setData(data);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [activeTabCfg, page, pageSize]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => { setPage(1); }, [activeTab]);

  const doLogout = () => {
    logout();
    toast.success("Signed out.");
    nav("/admin/login", { replace: true });
  };

  const cols = COLUMNS[activeTab];

  const filteredItems = useMemo(() => {
    if (!search) return data.items;
    const q = search.toLowerCase();
    return data.items.filter((row) =>
      cols.some((c) => String(row[c.key] ?? "").toLowerCase().includes(q))
    );
  }, [data.items, cols, search]);

  const exportCSV = () => {
    if (!filteredItems.length) {
      toast.error("No rows to export");
      return;
    }
    const rows = filteredItems.map((r) => ({
      ...r,
      created_at: fmtDate(r.created_at),
    }));
    const csv = toCSV(rows, cols);
    downloadCSV(`beezy-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`, csv);
    toast.success(`Exported ${rows.length} ${activeTab}`);
  };

  return (
    <main data-testid="admin-dashboard" className="min-h-screen bg-[#FAFAFA] text-black">
      {/* Header */}
      <header className="border-b border-black/10 bg-white sticky top-0 z-30">
        <div className="px-4 sm:px-8 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="admin-nav-logo">
            <img src={BRAND.logoUrl} alt="Beezy" className="h-10 w-auto" />
            <span className="font-heading font-bold uppercase tracking-wider text-sm hidden sm:inline">
              Admin Console
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-xs font-mono text-black/60">
              {admin?.email}
            </span>
            <button
              onClick={doLogout}
              data-testid="admin-logout-btn"
              className="font-heading text-xs uppercase tracking-[0.2em] font-bold border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-8 md:px-12 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60">
              / Dashboard
            </p>
            <h1 className="font-heading font-black text-4xl md:text-5xl tracking-tighter mt-2">
              Pipeline.
            </h1>
          </div>
          <button
            onClick={() => { loadStats(); loadData(); }}
            data-testid="admin-refresh-btn"
            className="font-heading text-xs uppercase tracking-[0.2em] font-bold border border-black px-4 py-2 hover:bg-[#FFB800] transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatCard label="Total leads" value={stats?.total_leads} accent testId="stat-total" />
          <StatCard label="Bookings" value={stats?.bookings} testId="stat-bookings" />
          <StatCard label="Pilot" value={stats?.pilot_signups} testId="stat-pilot" />
          <StatCard label="Shield" value={stats?.shield_subscriptions} testId="stat-shield" />
          <StatCard label="Investors" value={stats?.investor_inquiries} testId="stat-investors" />
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          data-testid="admin-tabs"
          className="flex flex-wrap gap-0 border-b border-black/20"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={activeTab === t.key}
              data-testid={`tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 font-heading text-sm uppercase tracking-[0.16em] font-bold border-t border-l border-r -mb-px ${
                activeTab === t.key
                  ? "bg-black text-white border-black"
                  : "bg-transparent text-black/60 border-transparent hover:text-black"
              }`}
            >
              {t.label}
              {stats && (
                <span className="ml-2 text-xs font-mono opacity-70">
                  {t.key === "bookings" ? stats.bookings :
                   t.key === "pilot" ? stats.pilot_signups :
                   t.key === "shield" ? stats.shield_subscriptions :
                   stats.investor_inquiries}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
          <input
            type="text"
            placeholder="Search this page…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="admin-search"
            className="beezy-input max-w-xs"
          />
          <div className="flex gap-2 items-center">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              data-testid="admin-pagesize"
              className="font-mono text-xs uppercase border border-black px-3 py-2 bg-white cursor-pointer"
            >
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
            <button
              onClick={exportCSV}
              data-testid="admin-export-btn"
              className="font-heading text-xs uppercase tracking-[0.2em] font-bold bg-[#FFB800] text-black px-4 py-2 hover:bg-black hover:text-white transition-colors flex items-center gap-2"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 border border-black bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black text-white">
                {cols.map((c) => (
                  <th
                    key={c.key}
                    className="text-left font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-3 whitespace-nowrap"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody data-testid="admin-table-body">
              {loading ? (
                <tr>
                  <td colSpan={cols.length + 1} className="text-center py-12 text-black/50 font-mono text-xs uppercase tracking-[0.2em]">
                    Loading…
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={cols.length + 1} className="text-center py-12 text-black/50 font-mono text-xs uppercase tracking-[0.2em]">
                    No {activeTab} yet.
                  </td>
                </tr>
              ) : (
                filteredItems.map((row) => (
                  <tr
                    key={row.id}
                    data-testid={`row-${activeTab}-${row.id}`}
                    className="border-t border-black/10 hover:bg-[#FFF5D6] transition-colors"
                  >
                    {cols.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-top max-w-[280px] break-words">
                        {c.key === "created_at" ? (
                          <span className="font-mono text-xs text-black/60">
                            {fmtDate(row[c.key])}
                          </span>
                        ) : c.key === "phone" ? (
                          <a
                            href={`tel:${row[c.key]}`}
                            className="inline-flex items-center gap-1 text-black hover:text-[#FFB800] transition-colors font-mono text-xs"
                          >
                            <Phone size={12} /> {row[c.key]}
                          </a>
                        ) : c.key === "email" && row[c.key] ? (
                          <a
                            href={`mailto:${row[c.key]}`}
                            className="inline-flex items-center gap-1 text-black hover:text-[#FFB800] transition-colors"
                          >
                            <Mail size={12} /> {row[c.key]}
                          </a>
                        ) : (
                          <span>{row[c.key] || "—"}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.phone && (
                        <a
                          href={`https://wa.me/${String(row.phone).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-heading text-[10px] uppercase tracking-[0.16em] font-bold border border-black px-3 py-1 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
                        >
                          WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
          <p className="font-mono text-xs text-black/60 uppercase tracking-widest">
            Showing {filteredItems.length} of {data.total} · Page {data.page} of {data.pages || 1}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              data-testid="admin-prev-btn"
              className="font-heading text-xs uppercase tracking-[0.2em] font-bold border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.pages || 1, p + 1))}
              disabled={page >= (data.pages || 1) || loading}
              data-testid="admin-next-btn"
              className="font-heading text-xs uppercase tracking-[0.2em] font-bold border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
