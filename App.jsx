import React, { useState, useMemo, useCallback, useRef } from "react";
import Papa from "papaparse";
import {
  LayoutDashboard, UploadCloud, GitCompare, Copy, Hash, Search as SearchIcon,
  BarChart3, ClipboardCheck, History, Settings as SettingsIcon, User,
  Moon, Sun, Check, X, Clock, ChevronRight, ChevronDown, Boxes, Building2,
  TrendingDown, FileText, AlertTriangle, CheckCircle2, PackageSearch
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from "recharts";

/* ============================== THEME ============================== */

const THEME = {
  light: {
    bg: "#F2F4F7",
    surface: "#FFFFFF",
    surfaceAlt: "#F7F9FB",
    border: "#DCE1E7",
    text: "#101828",
    textMuted: "#5A6472",
    sidebar: "#0B2F52",
    sidebarText: "#C7D6E5",
    sidebarActive: "#12446F",
    sidebarActiveText: "#FFFFFF",
    accent: "#0B4E82",
    accentSoft: "#E5EEF6",
    success: "#1B7A4D",
    successSoft: "#E5F4EB",
    warn: "#B7590B",
    warnSoft: "#FBEDE0",
    danger: "#B3261E",
    dangerSoft: "#FBE7E5",
  },
  dark: {
    bg: "#0B1017",
    surface: "#111826",
    surfaceAlt: "#0F1521",
    border: "#22303F",
    text: "#E7ECF2",
    textMuted: "#8C9AAB",
    sidebar: "#080D14",
    sidebarText: "#8FA6BC",
    sidebarActive: "#173350",
    sidebarActiveText: "#FFFFFF",
    accent: "#3E8FD0",
    accentSoft: "#132A3D",
    success: "#4CAF7D",
    successSoft: "#123625",
    warn: "#E1912F",
    warnSoft: "#3A2811",
    danger: "#E2685F",
    dangerSoft: "#3A1815",
  },
};

const CAT_ORDER = ["Mechanical", "Electrical", "Fasteners", "Pipes", "Valves", "Safety Equipment", "Tools", "Industrial Components"];
const CPSES = ["Bharat Energy Corporation", "National Steel Industries", "Indian Mining Corporation"];
const CPSE_SHORT = { "Bharat Energy Corporation": "BEC", "National Steel Industries": "NSI", "Indian Mining Corporation": "IMC" };
function cpseShort(name) {
  if (CPSE_SHORT[name]) return CPSE_SHORT[name];
  const initials = (name || "").split(/\s+/).filter(Boolean).map((w) => w[0]).join("").toUpperCase();
  return initials.slice(0, 4) || "N/A";
}

/* ============================== DEMO DATA ============================== */

const RAW_MATERIALS = [
  ["MAT-101", "SS Bolt M10 x 50", "M10 x 50mm, Hex Head", "Fasteners", "NOS", "Bharat Energy Corporation"],
  ["BLT-202", "Stainless Steel Hex Bolt M10 50mm", "M10, 50 MM Length", "Fasteners", "Numbers", "National Steel Industries"],
  ["FAST-55", "SS Hexagonal Bolt M10x50mm", "Hex Head, M10x50", "Fasteners", "Nos", "Indian Mining Corporation"],

  ["MAT-102", "Gate Valve 50mm CI", "PN16, Flanged", "Valves", "NOS", "Bharat Energy Corporation"],
  ["VLV-310", "Cast Iron Gate Valve DN50", "DN50, PN 16", "Valves", "Numbers", "National Steel Industries"],
  ["VAL-77", "50 MM Gate Valve Cast Iron Body", "Flanged End, PN16", "Valves", "Nos", "Indian Mining Corporation"],

  ["MAT-103", "MS Pipe 100mm Dia", "Sch 40, Seamless", "Pipes", "MTR", "Bharat Energy Corporation"],
  ["PIPE-401", "Mild Steel Pipe 100 MM Diameter", "Schedule 40", "Pipes", "Meter", "National Steel Industries"],
  ["PIP-22", "100mm MS Seamless Pipe", "Sch-40", "Pipes", "Mtr", "Indian Mining Corporation"],

  ["MAT-104", "Safety Helmet Yellow", "ISI Marked, HDPE Shell", "Safety Equipment", "NOS", "Bharat Energy Corporation"],
  ["SAFE-501", "Industrial Safety Helmet Yellow Colour", "HDPE, ISI Marked", "Safety Equipment", "Numbers", "National Steel Industries"],
  ["SFT-11", "Yellow Colour Safety Helmet ISI Marked", "HDPE Shell", "Safety Equipment", "Nos", "Indian Mining Corporation"],

  ["MAT-105", "Copper Cable 2.5 Sq mm", "1100V Grade, Single Core", "Electrical", "MTR", "Bharat Energy Corporation"],
  ["ELEC-601", "2.5 SQMM Copper Wire Cable", "Single Core, 1100 V", "Electrical", "Meter", "National Steel Industries"],
  ["ELE-33", "Copper Conductor Cable 2.5mm2", "1100V, Single Core", "Electrical", "Mtr", "Indian Mining Corporation"],

  ["MAT-106", "Adjustable Wrench 10 inch", "Drop Forged Steel", "Tools", "NOS", "Bharat Energy Corporation"],
  ["TOOL-701", "10 Inch Adjustable Spanner", "Forged Steel Body", "Tools", "Numbers", "National Steel Industries"],

  ["MAT-107", "Ball Bearing 6205", "2RS, Deep Groove", "Mechanical", "NOS", "Bharat Energy Corporation"],
  ["MECH-801", "6205 Deep Groove Ball Bearing", "2RS Sealed", "Mechanical", "Numbers", "National Steel Industries"],
  ["MEC-44", "Bearing 6205 2RS", "Deep Groove Type", "Mechanical", "Nos", "Indian Mining Corporation"],

  ["MAT-108", "Rubber Gasket 50mm", "Flat Type, 3mm Thick", "Industrial Components", "NOS", "Bharat Energy Corporation"],
  ["IND-66", "50 MM Rubber Gasket Flat", "3 MM Thickness", "Industrial Components", "Nos", "Indian Mining Corporation"],

  ["BLT-203", "SS Hex Nut M10", "Stainless Steel, Grade A2", "Fasteners", "Numbers", "National Steel Industries"],
  ["FAST-56", "Stainless Steel Nut M10", "Hex Type, A2 Grade", "Fasteners", "Nos", "Indian Mining Corporation"],

  ["MAT-109", "MS Elbow 100mm 90 Degree", "Sch 40, Butt Weld", "Pipes", "NOS", "Bharat Energy Corporation"],
  ["PIPE-402", "90 Deg Mild Steel Elbow 100 MM", "Schedule 40, BW", "Pipes", "Numbers", "National Steel Industries"],

  ["MAT-110", "Digital Multimeter", "Auto Ranging, True RMS", "Electrical", "NOS", "Bharat Energy Corporation"],
  ["MAT-111", "Fire Extinguisher CO2 4kg", "IS 2878 Compliant", "Safety Equipment", "NOS", "Bharat Energy Corporation"],
  ["MAT-112", "Conveyor Belt Roller", "Steel Shell, Sealed Bearing", "Mechanical", "NOS", "Bharat Energy Corporation"],
  ["MAT-113", "Welding Rod 3.15mm E6013", "Rutile Coated", "Industrial Components", "KG", "Bharat Energy Corporation"],

  ["MECH-802", "Hydraulic Jack 5 Ton", "Bottle Type", "Mechanical", "Numbers", "National Steel Industries"],
  ["TOOL-702", "Pipe Wrench 14 inch", "Drop Forged", "Tools", "Numbers", "National Steel Industries"],
  ["ELEC-602", "MCB 32A Single Pole", "10kA, C Curve", "Electrical", "Numbers", "National Steel Industries"],
  ["PIPE-403", "PVC Pipe 50mm Class 3", "ISI Marked", "Pipes", "Meter", "National Steel Industries"],

  ["MEC-45", "Excavator Bucket Teeth", "Forged Alloy Steel", "Industrial Components", "Nos", "Indian Mining Corporation"],
  ["SFT-12", "Safety Goggles Clear", "Anti-Fog Coating", "Safety Equipment", "Nos", "Indian Mining Corporation"],
  ["VAL-78", "Ball Valve 25mm Brass", "Screwed End", "Valves", "Nos", "Indian Mining Corporation"],
  ["FAST-57", "Washer M10 Stainless Steel", "Flat Type", "Fasteners", "Nos", "Indian Mining Corporation"],
].map(([code, description, specification, category, unit, cpse], i) => ({
  id: `M${String(i + 1).padStart(3, "0")}`,
  code, description, specification, category, unit, cpse,
}));

/* ============================== TEXT NORMALIZATION + MATCHING ============================== */

const ABBR = {
  mm: "mm", mtr: "meter", mts: "meter", nos: "numbers", ci: "cast iron",
  ms: "mild steel", ss: "stainless steel", dia: "diameter", deg: "degree",
  sq: "square", qty: "quantity", sch: "schedule", bw: "butt weld",
};

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ABBR[w] || w)
    .join(" ");
}

function wordSet(text) {
  return new Set(normalize(text).split(" ").filter(Boolean));
}

function bigrams(text) {
  const s = normalize(text).replace(/\s+/g, " ");
  const grams = new Set();
  for (let i = 0; i < s.length - 1; i++) grams.add(s.slice(i, i + 2));
  return grams;
}

function jaccard(a, b) {
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

function dice(a, b) {
  const inter = [...a].filter((x) => b.has(x)).length;
  return a.size + b.size === 0 ? 0 : (2 * inter) / (a.size + b.size);
}

function extractSpecTokens(text) {
  const matches = text.toLowerCase().match(/\d+(\.\d+)?\s*(mm|m|kg|inch|sqmm|ton|deg|v|a|kv|dn|pn)?/g) || [];
  return new Set(matches.map((m) => m.replace(/\s+/g, "")));
}

function computeSimilarity(a, b) {
  const textA = `${a.description} ${a.specification}`;
  const textB = `${b.description} ${b.specification}`;
  const wA = wordSet(textA), wB = wordSet(textB);
  const bA = bigrams(textA), bB = bigrams(textB);
  let score = 0.55 * jaccard(wA, wB) + 0.45 * dice(bA, bB);
  const sA = extractSpecTokens(textA), sB = extractSpecTokens(textB);
  const specOverlap = jaccard(sA, sB);
  score = score * 0.8 + specOverlap * 0.2;
  if (a.category === b.category) score += 0.06;
  return Math.max(0, Math.min(1, score));
}

function matchType(pct) {
  if (pct >= 92) return { label: "Exact Duplicate", tone: "danger" };
  if (pct >= 78) return { label: "Near Duplicate", tone: "warn" };
  return { label: "Functionally Equivalent", tone: "accent" };
}

function recommendStandard(records) {
  const best = [...records].sort((a, b) => (b.description + b.specification).length - (a.description + a.specification).length)[0];
  const specTokens = new Set();
  records.forEach((r) => extractSpecTokens(`${r.description} ${r.specification}`).forEach((t) => specTokens.add(t)));
  const words = normalize(best.description).split(" ").map((w) => (ABBR[w] ? ABBR[w] : w));
  const name = words.join(" ").replace(/\b\w/g, (c) => c.toUpperCase());
  const specs = [...specTokens].join(", ");
  return {
    name,
    description: `${name}${specs ? " (" + specs + ")" : ""}`,
    category: best.category,
    unit: best.unit,
    specification: best.specification,
  };
}

/* ============================== UNION-FIND FOR NMC CLUSTERS ============================== */

function buildClusters(materialIds, approvedPairs) {
  const parent = {};
  materialIds.forEach((id) => (parent[id] = id));
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }
  approvedPairs.forEach(([a, b]) => union(a, b));

  const groups = {};
  materialIds.forEach((id) => {
    const root = find(id);
    if (!groups[root]) groups[root] = [];
    groups[root].push(id);
  });
  const clusters = Object.values(groups).filter((g) => g.length > 1);
  clusters.sort((a, b) => Math.min(...a.map((x) => parseInt(x.slice(1)))) - Math.min(...b.map((x) => parseInt(x.slice(1)))));
  const nmcOf = {};
  clusters.forEach((g, i) => {
    const code = `NMC-${String(i + 1).padStart(6, "0")}`;
    g.forEach((id) => (nmcOf[id] = code));
  });
  return { clusters, nmcOf };
}

/* ============================== SMALL UI PRIMITIVES ============================== */

function Card({ t, children, style, className = "" }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{ background: t.surface, border: `1px solid ${t.border}`, ...style }}
    >
      {children}
    </div>
  );
}

function Badge({ t, tone = "accent", children }) {
  const map = {
    accent: [t.accentSoft, t.accent],
    success: [t.successSoft, t.success],
    warn: [t.warnSoft, t.warn],
    danger: [t.dangerSoft, t.danger],
    muted: [t.surfaceAlt, t.textMuted],
  };
  const [bg, fg] = map[tone] || map.accent;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

function StatCard({ t, label, value, sub, icon: Icon, tone = "accent" }) {
  const map = { accent: t.accent, success: t.success, warn: t.warn, danger: t.danger };
  return (
    <Card t={t} className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: t.textMuted }}>{label}</span>
        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: t.accentSoft }}>
          <Icon size={16} color={map[tone]} />
        </div>
      </div>
      <div className="text-2xl font-semibold" style={{ color: t.text, fontFamily: "IBM Plex Mono, monospace" }}>{value}</div>
      {sub && <span className="text-xs" style={{ color: t.textMuted }}>{sub}</span>}
    </Card>
  );
}

function Btn({ t, children, onClick, tone = "default", size = "md", disabled }) {
  const styles = {
    default: { bg: t.surfaceAlt, fg: t.text, border: t.border },
    accent: { bg: t.accent, fg: "#FFFFFF", border: t.accent },
    success: { bg: t.success, fg: "#FFFFFF", border: t.success },
    danger: { bg: t.danger, fg: "#FFFFFF", border: t.danger },
    ghost: { bg: "transparent", fg: t.textMuted, border: "transparent" },
  };
  const s = styles[tone];
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded font-medium inline-flex items-center gap-1.5 transition-opacity ${pad} ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-85"}`}
      style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}
    >
      {children}
    </button>
  );
}

/* ============================== MAIN APP ============================== */

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "upload", label: "Material Upload", icon: UploadCloud },
  { key: "matching", label: "AI Matching", icon: GitCompare },
  { key: "duplicates", label: "Duplicate Detection", icon: Copy },
  { key: "codes", label: "National Codes", icon: Hash },
  { key: "search", label: "Material Search", icon: SearchIcon },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "approval", label: "Approval Center", icon: ClipboardCheck },
  { key: "audit", label: "Audit Trail", icon: History },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const ROLES = ["Admin", "Data Analyst", "Reviewer"];
const PIE_COLORS = ["#1B7A4D", "#B3261E", "#B7590B", "#8C9AAB"];

function TitlePage({ t, dark, setDark, onOpen }) {
  const stats = [
    { label: "CPSEs Onboarded", value: CPSES.length },
    { label: "Material Records", value: RAW_MATERIALS.length },
    { label: "Categories Tracked", value: CAT_ORDER.length },
  ];
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative"
      style={{ background: t.bg, color: t.text, fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <button
        onClick={() => setDark((d) => !d)}
        className="absolute top-5 right-5 w-9 h-9 rounded flex items-center justify-center"
        style={{ border: `1px solid ${t.border}`, background: t.surface }}
      >
        {dark ? <Sun size={16} color={t.textMuted} /> : <Moon size={16} color={t.textMuted} />}
      </button>

      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: dark
            ? "radial-gradient(circle at 20% 15%, rgba(62,143,208,0.14), transparent 45%), radial-gradient(circle at 85% 80%, rgba(76,175,125,0.10), transparent 45%)"
            : "radial-gradient(circle at 20% 15%, rgba(11,78,130,0.08), transparent 45%), radial-gradient(circle at 85% 80%, rgba(27,122,77,0.07), transparent 45%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center max-w-xl">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ background: t.accent }}>
          <Boxes size={30} color="#fff" />
        </div>

        <div className="text-[11px] font-semibold tracking-[0.14em] mb-3" style={{ color: t.accent }}>
          GOVERNMENT OF INDIA · MINISTRY OF PUBLIC ENTERPRISES
        </div>

        <h1 className="text-3xl md:text-[34px] font-semibold leading-tight mb-3" style={{ color: t.text }}>
          National Unified Material Master Platform
        </h1>

        <p className="text-[15px] mb-1" style={{ color: t.accent }}>
          "One Nation – One Material Code"
        </p>

        <p className="text-[13px] leading-relaxed mb-8" style={{ color: t.textMuted }}>
          An AI-assisted platform that identifies duplicate, near-duplicate, and functionally
          equivalent materials across CPSEs, and consolidates them under a single Common
          National Material Code — while preserving every original CPSE mapping.
        </p>

        <button
          onClick={onOpen}
          className="rounded-lg font-medium text-[14px] px-7 py-2.5 inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: t.accent, color: "#fff" }}
        >
          Open Platform <ChevronRight size={16} />
        </button>

        <div className="flex items-center gap-6 mt-10 pt-6" style={{ borderTop: `1px solid ${t.border}` }}>
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <div className="text-lg font-semibold" style={{ color: t.text, fontFamily: "IBM Plex Mono, monospace" }}>{s.value}</div>
              <div className="text-[11px]" style={{ color: t.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 text-[11px]" style={{ color: t.textMuted }}>
        Prototype build — client-side demo data preloaded
      </div>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const t = dark ? THEME.dark : THEME.light;
  const [started, setStarted] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [role, setRole] = useState("Admin");
  const [records, setRecords] = useState(RAW_MATERIALS);
  const [decisions, setDecisions] = useState({}); // matchKey -> 'approved'|'rejected'|'review'
  const [standardized, setStandardized] = useState({}); // clusterRootId -> {name, description, category, unit, specification}
  const [approvedStandards, setApprovedStandards] = useState({}); // clusterRootId -> true
  const [audit, setAudit] = useState([
    { id: "A001", ts: "2026-08-24 09:12", actor: "Data Analyst", action: "Uploaded dataset", detail: "Bharat Energy Corporation — 14 records" },
    { id: "A002", ts: "2026-08-24 09:14", actor: "Data Analyst", action: "Uploaded dataset", detail: "National Steel Industries — 13 records" },
    { id: "A003", ts: "2026-08-24 09:15", actor: "Data Analyst", action: "Uploaded dataset", detail: "Indian Mining Corporation — 11 records" },
  ]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [threshold, setThreshold] = useState(55);
  const [uploadLog, setUploadLog] = useState([]);

  const logAudit = useCallback((action, detail) => {
    setAudit((prev) => [
      { id: `A${String(prev.length + 1).padStart(3, "0")}`, ts: new Date().toISOString().slice(0, 16).replace("T", " "), actor: role, action, detail },
      ...prev,
    ]);
  }, [role]);

  /* ---- pairwise candidate matches (cross-CPSE only) ---- */
  const allMatches = useMemo(() => {
    const out = [];
    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const a = records[i], b = records[j];
        if (a.cpse === b.cpse) continue;
        const score = computeSimilarity(a, b);
        const pct = Math.round(score * 100);
        if (pct >= threshold) {
          out.push({ key: `${a.id}__${b.id}`, a, b, pct, type: matchType(pct) });
        }
      }
    }
    out.sort((x, y) => y.pct - x.pct);
    return out;
  }, [records, threshold]);

  const pendingMatches = allMatches.filter((m) => !decisions[m.key]);
  const approvedMatches = allMatches.filter((m) => decisions[m.key] === "approved");
  const rejectedMatches = allMatches.filter((m) => decisions[m.key] === "rejected");
  const reviewMatches = allMatches.filter((m) => decisions[m.key] === "review");

  const approvedPairs = approvedMatches.map((m) => [m.a.id, m.b.id]);
  const { clusters, nmcOf } = useMemo(
    () => buildClusters(records.map((r) => r.id), approvedPairs),
    [records, approvedMatches.length]
  );
  const clusterByRoot = useMemo(() => {
    const map = {};
    clusters.forEach((ids) => {
      const rootId = ids.slice().sort()[0];
      map[rootId] = ids;
    });
    return map;
  }, [clusters]);

  function decide(m, decision) {
    setDecisions((prev) => ({ ...prev, [m.key]: decision }));
    const verb = decision === "approved" ? "Approved match" : decision === "rejected" ? "Rejected match" : "Marked for review";
    logAudit(verb, `${a_code(m.a)} ↔ ${a_code(m.b)} — similarity ${m.pct}%`);
  }
  function a_code(r) { return `${cpseShort(r.cpse)}:${r.code}`; }

  const canApprove = role === "Admin" || role === "Reviewer";

  const recordsByCategory = useMemo(() => {
    const map = {};
    CAT_ORDER.forEach((c) => (map[c] = 0));
    records.forEach((r) => (map[r.category] = (map[r.category] || 0) + 1));
    return Object.entries(map).map(([category, count]) => ({ category, count }));
  }, [records]);

  const uniqueCpses = useMemo(() => [...new Set(records.map((r) => r.cpse))], [records]);

  const recordsByCpse = useMemo(
    () => uniqueCpses.map((c) => ({ cpse: cpseShort(c), count: records.filter((r) => r.cpse === c).length })),
    [records, uniqueCpses]
  );

  const duplicateStats = [
    { name: "Approved", value: approvedMatches.length },
    { name: "Rejected", value: rejectedMatches.length },
    { name: "Under Review", value: reviewMatches.length },
    { name: "Pending", value: pendingMatches.length },
  ].filter((d) => d.value > 0);

  const consolidatedCount = records.length - clusters.reduce((sum, c) => sum + (c.length - 1), 0);

  const pageTitle = NAV.find((n) => n.key === page)?.label || "";

  if (!started) {
    return <TitlePage t={t} dark={dark} setDark={setDark} onOpen={() => { setStarted(true); setPage("dashboard"); }} />;
  }

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100%", fontFamily: "Inter, ui-sans-serif, system-ui" }} className="flex w-full min-h-screen text-sm">
      {/* SIDEBAR */}
      <aside style={{ background: t.sidebar, width: 232, flexShrink: 0 }} className="hidden md:flex flex-col py-5">
        <div className="px-5 pb-5 flex items-center gap-2" style={{ borderBottom: `1px solid ${dark ? "#1b2733" : "#173250"}` }}>
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: t.accent }}>
            <Boxes size={17} color="#fff" />
          </div>
          <div>
            <div className="text-white text-[13px] font-semibold leading-tight">NUMMP</div>
            <div style={{ color: t.sidebarText }} className="text-[10px] leading-tight">One Nation · One Material Code</div>
          </div>
        </div>
        <nav className="flex-1 mt-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = page === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setPage(n.key)}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium text-left"
                style={{
                  background: active ? t.sidebarActive : "transparent",
                  color: active ? t.sidebarActiveText : t.sidebarText,
                }}
              >
                <Icon size={15} />
                {n.label}
                {n.key === "duplicates" && pendingMatches.length > 0 && (
                  <span className="ml-auto text-[10px] rounded-full px-1.5 py-0.5" style={{ background: t.warn, color: "#fff" }}>
                    {pendingMatches.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="px-5 pt-4 text-[10px]" style={{ color: t.sidebarText, borderTop: `1px solid ${dark ? "#1b2733" : "#173250"}` }}>
          Ministry of Public Enterprises — Prototype
        </div>
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header
          className="flex items-center gap-3 px-4 md:px-6 py-3 flex-shrink-0"
          style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}
        >
          <div className="md:hidden font-semibold" style={{ color: t.text }}>NUMMP</div>
          <div className="flex-1 max-w-md relative hidden sm:block">
            <SearchIcon size={14} style={{ position: "absolute", left: 10, top: 9, color: t.textMuted }} />
            <input
              value={globalSearch}
              onChange={(e) => { setGlobalSearch(e.target.value); setPage("search"); }}
              placeholder="Search material name, code, or NMC…"
              className="w-full pl-8 pr-3 py-1.5 rounded text-[13px] outline-none"
              style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text }}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-[12px] rounded px-2 py-1.5 outline-none"
              style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, color: t.text }}
            >
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button onClick={() => setDark((d) => !d)} className="w-8 h-8 rounded flex items-center justify-center" style={{ border: `1px solid ${t.border}` }}>
              {dark ? <Sun size={15} color={t.textMuted} /> : <Moon size={15} color={t.textMuted} />}
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: t.accentSoft, border: profileOpen ? `1px solid ${t.accent}` : "1px solid transparent" }}
              >
                <User size={15} color={t.accent} />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div
                    className="absolute right-0 top-10 z-20 w-52 rounded-lg overflow-hidden"
                    style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                  >
                    <div className="px-3.5 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                      <div className="text-[13px] font-medium" style={{ color: t.text }}>Prototype User</div>
                      <div className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>Signed in as {role}</div>
                    </div>
                    <button
                      onClick={() => { setPage("settings"); setProfileOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-[13px] flex items-center gap-2"
                      style={{ color: t.text }}
                    >
                      <SettingsIcon size={14} color={t.textMuted} /> Settings
                    </button>
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-[13px]"
                      style={{ color: t.danger, borderTop: `1px solid ${t.border}` }}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* PAGE HEADER */}
        <div className="px-4 md:px-6 pt-5 pb-1 flex-shrink-0">
          <h1 className="text-lg font-semibold" style={{ color: t.text }}>{pageTitle}</h1>
        </div>

        {/* PAGE BODY */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-4">
          {page === "dashboard" && (
            <DashboardPage
              t={t} records={records} clusters={clusters} approvedMatches={approvedMatches}
              pendingMatches={pendingMatches} recordsByCpse={recordsByCpse} recordsByCategory={recordsByCategory}
              duplicateStats={duplicateStats} consolidatedCount={consolidatedCount} approvedStandardsCount={Object.keys(approvedStandards).length}
              cpseCount={uniqueCpses.length}
            />
          )}
          {page === "upload" && (
            <UploadPage t={t} records={records} setRecords={setRecords} logAudit={logAudit} uploadLog={uploadLog} setUploadLog={setUploadLog} />
          )}
          {(page === "matching" || page === "duplicates") && (
            <MatchingPage
              t={t} matches={page === "matching" ? allMatches : pendingMatches} decisions={decisions}
              onDecide={decide} canApprove={canApprove} threshold={threshold} setThreshold={setThreshold}
              showAll={page === "matching"}
            />
          )}
          {page === "codes" && (
            <CodesPage t={t} clusters={clusters} nmcOf={nmcOf} records={records} standardized={standardized} setStandardized={setStandardized} approvedStandards={approvedStandards} setApprovedStandards={setApprovedStandards} logAudit={logAudit} canApprove={canApprove} />
          )}
          {page === "search" && (
            <SearchPage t={t} records={records} nmcOf={nmcOf} clusters={clusters} query={globalSearch} setQuery={setGlobalSearch} />
          )}
          {page === "analytics" && (
            <AnalyticsPage t={t} records={records} clusters={clusters} approvedMatches={approvedMatches} rejectedMatches={rejectedMatches} recordsByCategory={recordsByCategory} consolidatedCount={consolidatedCount} />
          )}
          {page === "approval" && (
            <ApprovalPage t={t} reviewMatches={reviewMatches} onDecide={decide} canApprove={canApprove} />
          )}
          {page === "audit" && <AuditPage t={t} audit={audit} />}
          {page === "settings" && <SettingsPage t={t} dark={dark} setDark={setDark} role={role} threshold={threshold} setThreshold={setThreshold} />}
        </main>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

function DashboardPage({ t, records, clusters, approvedMatches, pendingMatches, recordsByCpse, recordsByCategory, duplicateStats, consolidatedCount, approvedStandardsCount, cpseCount }) {
  const nearDup = approvedMatches.filter((m) => m.pct < 92 && m.pct >= 78).length;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard t={t} label="Total Materials" value={records.length} icon={PackageSearch} />
        <StatCard t={t} label="Total CPSEs" value={cpseCount} icon={Building2} />
        <StatCard t={t} label="Duplicates Found" value={approvedMatches.length} icon={Copy} tone="danger" />
        <StatCard t={t} label="Near-Duplicates" value={nearDup} icon={GitCompare} tone="warn" />
        <StatCard t={t} label="Standardized" value={approvedStandardsCount} icon={CheckCircle2} tone="success" />
        <StatCard t={t} label="National Codes" value={clusters.length} icon={Hash} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card t={t} className="p-4">
          <div className="text-sm font-medium mb-3" style={{ color: t.text }}>Materials by CPSE</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={recordsByCpse}>
              <CartesianGrid stroke={t.border} vertical={false} />
              <XAxis dataKey="cpse" tick={{ fill: t.textMuted, fontSize: 12 }} axisLine={{ stroke: t.border }} tickLine={false} />
              <YAxis tick={{ fill: t.textMuted, fontSize: 12 }} axisLine={{ stroke: t.border }} tickLine={false} />
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, fontSize: 12 }} />
              <Bar dataKey="count" fill={t.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card t={t} className="p-4">
          <div className="text-sm font-medium mb-3" style={{ color: t.text }}>Duplicate Detection Statistics</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={duplicateStats} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {duplicateStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: t.textMuted }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card t={t} className="p-4">
          <div className="text-sm font-medium mb-3" style={{ color: t.text }}>Materials by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={recordsByCategory} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid stroke={t.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: t.textMuted, fontSize: 12 }} axisLine={{ stroke: t.border }} tickLine={false} />
              <YAxis type="category" dataKey="category" width={110} tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={{ stroke: t.border }} tickLine={false} />
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, fontSize: 12 }} />
              <Bar dataKey="count" fill={t.success} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card t={t} className="p-4">
          <div className="text-sm font-medium mb-3" style={{ color: t.text }}>Data Quality Improvement</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ label: "Before Consolidation", count: records.length }, { label: "After Consolidation", count: consolidatedCount }]}>
              <CartesianGrid stroke={t.border} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={{ stroke: t.border }} tickLine={false} />
              <YAxis tick={{ fill: t.textMuted, fontSize: 12 }} axisLine={{ stroke: t.border }} tickLine={false} />
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, fontSize: 12 }} />
              <Bar dataKey="count" fill={t.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ============================== UPLOAD ============================== */

function UploadPage({ t, records, setRecords, logAudit, uploadLog, setUploadLog }) {
  const [dragOver, setDragOver] = useState(false);
  const [parseErrors, setParseErrors] = useState([]);
  const fileInputRef = useRef(null);

  const COLUMN_ALIASES = {
    code: ["material code", "code", "cpse material code"],
    description: ["material description", "description", "material name"],
    specification: ["specification", "spec", "technical specification"],
    category: ["category", "material category"],
    unit: ["unit of measurement", "unit", "uom"],
    cpse: ["cpse name", "cpse", "cpse name / organization"],
  };

  function getField(row, aliases) {
    const keys = Object.keys(row);
    for (const alias of aliases) {
      const found = keys.find((k) => k.trim().toLowerCase() === alias);
      if (found && String(row[found]).trim() !== "") return String(row[found]).trim();
    }
    return "";
  }

  function handleFiles(fileList) {
    Array.from(fileList).forEach((file) => {
      const isCsv = /\.csv$/i.test(file.name);
      if (!isCsv) {
        setParseErrors((prev) => [`${file.name}: only .csv files can be parsed in this prototype — export Excel sheets as CSV first.`, ...prev]);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const parsed = Papa.parse(e.target.result, { header: true, skipEmptyLines: true });
        const validRows = parsed.data.filter((row) => getField(row, COLUMN_ALIASES.description));
        setRecords((prev) => {
          const newRecords = validRows.map((row, idx) => ({
            id: `M${String(prev.length + idx + 1).padStart(4, "0")}`,
            code: getField(row, COLUMN_ALIASES.code) || `UNCODED-${idx + 1}`,
            description: getField(row, COLUMN_ALIASES.description),
            specification: getField(row, COLUMN_ALIASES.specification),
            category: getField(row, COLUMN_ALIASES.category) || "Industrial Components",
            unit: getField(row, COLUMN_ALIASES.unit) || "Numbers",
            cpse: getField(row, COLUMN_ALIASES.cpse) || "Unspecified CPSE",
          }));
          return [...prev, ...newRecords];
        });
        setUploadLog((prev) => [{ name: file.name, rows: validRows.length, ts: new Date().toLocaleTimeString() }, ...prev]);
        logAudit("Uploaded dataset", `${file.name} — ${validRows.length} records parsed and added`);
        if (parsed.errors && parsed.errors.length > 0) {
          setParseErrors((prev) => [`${file.name}: ${parsed.errors.length} row(s) had formatting issues and were skipped.`, ...prev]);
        }
      };
      reader.onerror = () => setParseErrors((prev) => [`${file.name}: could not be read.`, ...prev]);
      reader.readAsText(file);
    });
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <Card t={t} className="p-8 flex flex-col items-center justify-center text-center gap-3"
        style={{ borderStyle: "dashed", borderColor: dragOver ? t.accent : t.border, background: dragOver ? t.accentSoft : t.surface }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: t.accentSoft }}>
          <UploadCloud size={22} color={t.accent} />
        </div>
        <div className="text-sm font-medium" style={{ color: t.text }}>Drop CSV files here</div>
        <div className="text-xs" style={{ color: t.textMuted }}>Expected columns: Material Code, Material Description, Specification, Category, Unit of Measurement, CPSE Name</div>
        <input
          type="file" multiple accept=".csv" ref={fileInputRef} className="hidden"
          onChange={(e) => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = ""; }}
        />
        <Btn t={t} tone="accent" onClick={() => fileInputRef.current && fileInputRef.current.click()}>Browse Files</Btn>
      </Card>

      {parseErrors.length > 0 && (
        <Card t={t} className="p-3.5 flex flex-col gap-1.5" style={{ borderColor: t.warn }}>
          {parseErrors.map((err, i) => (
            <div key={i} className="text-[12px] flex items-center gap-2" style={{ color: t.warn }}>
              <AlertTriangle size={13} /> {err}
            </div>
          ))}
        </Card>
      )}

      <Card t={t} className="p-4">
        <div className="text-sm font-medium mb-2" style={{ color: t.text }}>Loaded CPSE Datasets</div>
        <div className="flex flex-col gap-2">
          {[...new Set(records.map((r) => r.cpse))].map((c) => {
            const count = records.filter((r) => r.cpse === c).length;
            return (
              <div key={c} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: t.surfaceAlt }}>
                <div className="flex items-center gap-2">
                  <Building2 size={14} color={t.accent} />
                  <span className="text-[13px]" style={{ color: t.text }}>{c}</span>
                </div>
                <Badge t={t} tone="muted">{count} records</Badge>
              </div>
            );
          })}
          {uploadLog.map((u, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: t.surfaceAlt }}>
              <div className="flex items-center gap-2">
                <FileText size={14} color={t.success} />
                <span className="text-[13px]" style={{ color: t.text }}>{u.name}</span>
              </div>
              <Badge t={t} tone="success">Parsed · {u.rows} records added</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card t={t} className="p-4">
        <div className="text-sm font-medium mb-2" style={{ color: t.text }}>Standardization Rules Applied</div>
        <ul className="text-[13px] flex flex-col gap-1.5" style={{ color: t.textMuted }}>
          <li>• Units normalized — MM → mm, MTR → meter, NOS → numbers</li>
          <li>• Abbreviations expanded — SS → stainless steel, MS → mild steel, CI → cast iron</li>
          <li>• Special characters and inconsistent casing removed from descriptions</li>
          <li>• Technical attributes (dimensions, ratings) extracted for spec-level comparison</li>
        </ul>
      </Card>
    </div>
  );
}

/* ============================== MATCHING / DUPLICATE DETECTION ============================== */

function MatchTag({ t, type }) {
  const toneMap = { danger: "danger", warn: "warn", accent: "accent" };
  return <Badge t={t} tone={toneMap[type.tone]}>{type.label}</Badge>;
}

function ScoreBar({ t, pct }) {
  const color = pct >= 92 ? t.danger : pct >= 78 ? t.warn : t.accent;
  return (
    <div className="flex items-center gap-2 w-32">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: t.surfaceAlt }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%" }} />
      </div>
      <span className="text-xs font-medium" style={{ color, fontFamily: "IBM Plex Mono, monospace" }}>{pct}%</span>
    </div>
  );
}

function MatchRow({ t, m, decisions, onDecide, canApprove }) {
  const status = decisions[m.key];
  return (
    <Card t={t} className="p-3.5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <MatchTag t={t} type={m.type} />
          <ScoreBar t={t} pct={m.pct} />
        </div>
        {status ? (
          <Badge t={t} tone={status === "approved" ? "success" : status === "rejected" ? "danger" : "warn"}>
            {status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Review Later"}
          </Badge>
        ) : (
          <div className="flex items-center gap-1.5">
            <Btn t={t} size="sm" tone="success" disabled={!canApprove} onClick={() => onDecide(m, "approved")}><Check size={13} /> Approve Match</Btn>
            <Btn t={t} size="sm" tone="danger" onClick={() => onDecide(m, "rejected")}><X size={13} /> Reject</Btn>
            <Btn t={t} size="sm" tone="default" onClick={() => onDecide(m, "review")}><Clock size={13} /> Review Later</Btn>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[m.a, m.b].map((r) => (
          <div key={r.id} className="rounded p-2.5" style={{ background: t.surfaceAlt }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium" style={{ color: t.accent, fontFamily: "IBM Plex Mono, monospace" }}>{r.code}</span>
              <span className="text-[11px]" style={{ color: t.textMuted }}>{cpseShort(r.cpse)}</span>
            </div>
            <div className="text-[13px]" style={{ color: t.text }}>{r.description}</div>
            <div className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>{r.specification} · {r.category} · {r.unit}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MatchingPage({ t, matches, decisions, onDecide, canApprove, threshold, setThreshold, showAll }) {
  return (
    <div className="flex flex-col gap-4">
      <Card t={t} className="p-3.5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: t.textMuted }}>Similarity threshold</span>
          <input type="range" min={40} max={95} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
          <span className="text-[12px] font-medium" style={{ color: t.text, fontFamily: "IBM Plex Mono, monospace" }}>{threshold}%</span>
        </div>
        <div className="ml-auto text-[12px]" style={{ color: t.textMuted }}>
          {showAll ? `${matches.length} candidate pairs across CPSEs` : `${matches.length} pending decisions`}
        </div>
      </Card>
      {matches.length === 0 && (
        <Card t={t} className="p-8 text-center text-sm" style={{ color: t.textMuted }}>No candidate matches at this threshold.</Card>
      )}
      <div className="flex flex-col gap-3">
        {matches.map((m) => <MatchRow key={m.key} t={t} m={m} decisions={decisions} onDecide={onDecide} canApprove={canApprove} />)}
      </div>
    </div>
  );
}

/* ============================== NATIONAL CODES ============================== */

function CodesPage({ t, clusters, nmcOf, records, standardized, setStandardized, approvedStandards, setApprovedStandards, logAudit, canApprove }) {
  const byId = useMemo(() => Object.fromEntries(records.map((r) => [r.id, r])), [records]);
  const [expanded, setExpanded] = useState({});

  if (clusters.length === 0) {
    return <Card t={t} className="p-8 text-center text-sm" style={{ color: t.textMuted }}>No National Material Codes generated yet — approve a match in AI Matching to create one.</Card>;
  }

  return (
    <div className="flex flex-col gap-3">
      {clusters.map((ids, i) => {
        const code = `NMC-${String(i + 1).padStart(6, "0")}`;
        const recs = ids.map((id) => byId[id]);
        const isOpen = expanded[code] !== false;
        const rec = standardized[code] || recommendStandard(recs);
        return (
          <Card t={t} key={code} className="p-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded((p) => ({ ...p, [code]: !isOpen }))}>
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown size={15} color={t.textMuted} /> : <ChevronRight size={15} color={t.textMuted} />}
                <Hash size={15} color={t.accent} />
                <span className="font-semibold text-[14px]" style={{ color: t.text, fontFamily: "IBM Plex Mono, monospace" }}>{code}</span>
              </div>
              <Badge t={t} tone="muted">{recs.length} CPSE codes mapped</Badge>
            </div>
            {isOpen && (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2 pl-6">
                  {recs.map((r) => (
                    <div key={r.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded" style={{ background: t.surfaceAlt, border: `1px solid ${t.border}` }}>
                      <span className="text-[11px] font-medium" style={{ color: t.accent, fontFamily: "IBM Plex Mono, monospace" }}>{r.code}</span>
                      <span className="text-[11px]" style={{ color: t.textMuted }}>({cpseShort(r.cpse)})</span>
                    </div>
                  ))}
                </div>
                <div className="pl-6 rounded p-3" style={{ background: t.accentSoft }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-medium" style={{ color: t.accent }}>AI-Recommended Standard Description</div>
                    {approvedStandards[code] && <Badge t={t} tone="success"><Check size={11} /> Approved</Badge>}
                  </div>
                  <textarea
                    value={rec.description}
                    readOnly={approvedStandards[code]}
                    onChange={(e) => setStandardized((p) => ({ ...p, [code]: { ...rec, description: e.target.value } }))}
                    className="w-full text-[13px] rounded p-2 outline-none resize-none"
                    rows={2}
                    style={{ background: approvedStandards[code] ? t.surfaceAlt : t.surface, border: `1px solid ${t.border}`, color: t.text }}
                  />
                  <div className="flex flex-wrap gap-3 mt-2 text-[11px]" style={{ color: t.textMuted }}>
                    <span>Category: <b style={{ color: t.text }}>{rec.category}</b></span>
                    <span>Unit: <b style={{ color: t.text }}>{rec.unit}</b></span>
                  </div>
                  <div className="mt-2">
                    {approvedStandards[code] ? (
                      <Btn t={t} size="sm" tone="default" disabled={!canApprove} onClick={() => setApprovedStandards((p) => { const n = { ...p }; delete n[code]; return n; })}>
                        Revise
                      </Btn>
                    ) : (
                      <Btn
                        t={t} size="sm" tone="success" disabled={!canApprove}
                        onClick={() => {
                          setStandardized((p) => ({ ...p, [code]: rec }));
                          setApprovedStandards((p) => ({ ...p, [code]: true }));
                          logAudit("Approved standardized description", `${code} — "${rec.description}"`);
                        }}
                      >
                        <Check size={13} /> Approve Standard
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ============================== SEARCH ============================== */

function SearchPage({ t, records, nmcOf, clusters, query, setQuery }) {
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return records.filter((r) =>
      r.description.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.cpse.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (nmcOf[r.id] || "").toLowerCase().includes(q)
    );
  }, [q, records, nmcOf]);

  const byId = useMemo(() => Object.fromEntries(records.map((r) => [r.id, r])), [records]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-lg">
        <SearchIcon size={14} style={{ position: "absolute", left: 10, top: 10, color: t.textMuted }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by material name, code, NMC, CPSE, or category…"
          className="w-full pl-8 pr-3 py-2 rounded text-[13px] outline-none"
          style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text }}
        />
      </div>
      {!q && <div className="text-sm" style={{ color: t.textMuted }}>Start typing to search across all CPSE material records.</div>}
      {q && results.length === 0 && <Card t={t} className="p-6 text-center text-sm" style={{ color: t.textMuted }}>No materials match "{query}".</Card>}
      <div className="flex flex-col gap-2">
        {results.map((r) => {
          const nmc = nmcOf[r.id];
          const group = nmc ? clusters.find((c) => c.includes(r.id)) : null;
          return (
            <Card t={t} key={r.id} className="p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[13px] font-medium" style={{ color: t.text }}>{r.description}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>
                    <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>{r.code}</span> · {r.cpse} · {r.category} · {r.unit}
                  </div>
                </div>
                {nmc && <Badge t={t} tone="success"><Hash size={11} /> {nmc}</Badge>}
              </div>
              {group && group.length > 1 && (
                <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: `1px solid ${t.border}` }}>
                  <span className="text-[11px] mr-1" style={{ color: t.textMuted }}>Equivalent to:</span>
                  {group.filter((id) => id !== r.id).map((id) => (
                    <Badge key={id} t={t} tone="muted">{byId[id].code} ({cpseShort(byId[id].cpse)})</Badge>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== ANALYTICS ============================== */

function AnalyticsPage({ t, records, clusters, approvedMatches, rejectedMatches, recordsByCategory, consolidatedCount }) {
  const dupPct = records.length ? Math.round(((records.length - consolidatedCount) / records.length) * 100) : 0;
  const catDupCounts = useMemo(() => {
    const map = {};
    clusters.forEach((ids) => {
      const cats = ids.map((id) => records.find((r) => r.id === id)?.category);
      const cat = cats[0];
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([category, groups]) => ({ category, groups })).sort((a, b) => b.groups - a.groups);
  }, [clusters, records]);

  const cpseInvolvement = useMemo(() => {
    const map = {};
    [...new Set(records.map((r) => r.cpse))].forEach((c) => (map[c] = 0));
    clusters.forEach((ids) => {
      const cpses = new Set(ids.map((id) => records.find((r) => r.id === id)?.cpse));
      cpses.forEach((c) => (map[c] = (map[c] || 0) + 1));
    });
    return Object.entries(map).map(([cpse, count]) => ({ cpse: cpseShort(cpse), count })).sort((a, b) => b.count - a.count);
  }, [clusters, records]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard t={t} label="Duplicate Rate" value={`${dupPct}%`} icon={TrendingDown} tone="danger" sub="of total records approved as duplicates" />
        <StatCard t={t} label="Records After Consolidation" value={consolidatedCount} icon={PackageSearch} tone="success" />
        <StatCard t={t} label="National Codes Created" value={clusters.length} icon={Hash} />
        <StatCard t={t} label="Rejected Candidates" value={rejectedMatches.length} icon={AlertTriangle} tone="warn" />
      </div>

      <Card t={t} className="p-4">
        <div className="text-sm font-medium mb-3" style={{ color: t.text }}>Most Common Duplicate Categories</div>
        {catDupCounts.length === 0 ? (
          <div className="text-sm" style={{ color: t.textMuted }}>No approved duplicate groups yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catDupCounts}>
              <CartesianGrid stroke={t.border} vertical={false} />
              <XAxis dataKey="category" tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={{ stroke: t.border }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fill: t.textMuted, fontSize: 12 }} axisLine={{ stroke: t.border }} tickLine={false} />
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, fontSize: 12 }} />
              <Bar dataKey="groups" fill={t.warn} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card t={t} className="p-4">
        <div className="text-sm font-medium mb-3" style={{ color: t.text }}>CPSEs With Highest Duplicate Involvement</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={cpseInvolvement}>
            <CartesianGrid stroke={t.border} vertical={false} />
            <XAxis dataKey="cpse" tick={{ fill: t.textMuted, fontSize: 12 }} axisLine={{ stroke: t.border }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: t.textMuted, fontSize: 12 }} axisLine={{ stroke: t.border }} tickLine={false} />
            <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, fontSize: 12 }} />
            <Bar dataKey="count" fill={t.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card t={t} className="p-4 flex items-start gap-3">
        <TrendingDown size={18} color={t.success} className="flex-shrink-0 mt-0.5" />
        <div className="text-[13px]" style={{ color: t.text }}>
          Consolidating <b>{records.length - consolidatedCount}</b> duplicate records into <b>{clusters.length}</b> National Material Codes represents a potential
          <b> {dupPct}%</b> reduction in redundant catalogue entries across the {new Set(records.map((r) => r.cpse)).size} onboarded CPSEs, directly supporting collaborative procurement and lower inventory carrying cost.
        </div>
      </Card>
    </div>
  );
}

/* ============================== APPROVAL CENTER ============================== */

function ApprovalPage({ t, reviewMatches, onDecide, canApprove }) {
  return (
    <div className="flex flex-col gap-4">
      <Card t={t} className="p-3.5 text-[12px]" style={{ color: t.textMuted }}>
        Items marked "Review Later" from AI Matching are queued here for a second pass by an Admin or Reviewer.
      </Card>
      {reviewMatches.length === 0 ? (
        <Card t={t} className="p-8 text-center text-sm" style={{ color: t.textMuted }}>Nothing queued for review.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {reviewMatches.map((m) => <MatchRow key={m.key} t={t} m={m} decisions={{}} onDecide={onDecide} canApprove={canApprove} />)}
        </div>
      )}
    </div>
  );
}

/* ============================== AUDIT TRAIL ============================== */

function AuditPage({ t, audit }) {
  return (
    <Card t={t} className="overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ background: t.surfaceAlt, color: t.textMuted }}>
            {["ID", "Timestamp", "Actor", "Action", "Detail"].map((h) => (
              <th key={h} className="text-left font-medium px-3.5 py-2.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {audit.map((a) => (
            <tr key={a.id} style={{ borderTop: `1px solid ${t.border}` }}>
              <td className="px-3.5 py-2.5" style={{ color: t.textMuted, fontFamily: "IBM Plex Mono, monospace" }}>{a.id}</td>
              <td className="px-3.5 py-2.5" style={{ color: t.textMuted, fontFamily: "IBM Plex Mono, monospace" }}>{a.ts}</td>
              <td className="px-3.5 py-2.5" style={{ color: t.text }}>{a.actor}</td>
              <td className="px-3.5 py-2.5" style={{ color: t.text }}>{a.action}</td>
              <td className="px-3.5 py-2.5" style={{ color: t.textMuted }}>{a.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ============================== SETTINGS ============================== */

function SettingsPage({ t, dark, setDark, role, threshold, setThreshold }) {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Card t={t} className="p-4 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium" style={{ color: t.text }}>Appearance</div>
          <div className="text-[12px]" style={{ color: t.textMuted }}>Toggle between light and dark interface theme.</div>
        </div>
        <Btn t={t} onClick={() => setDark((d) => !d)}>{dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? "Light mode" : "Dark mode"}</Btn>
      </Card>
      <Card t={t} className="p-4">
        <div className="text-[13px] font-medium mb-1" style={{ color: t.text }}>Default Matching Threshold</div>
        <div className="text-[12px] mb-2" style={{ color: t.textMuted }}>Minimum similarity score for a pair to surface as a candidate match.</div>
        <div className="flex items-center gap-2">
          <input type="range" min={40} max={95} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
          <span className="text-[13px] font-medium" style={{ color: t.text, fontFamily: "IBM Plex Mono, monospace" }}>{threshold}%</span>
        </div>
      </Card>
      <Card t={t} className="p-4">
        <div className="text-[13px] font-medium mb-2" style={{ color: t.text }}>Current Role</div>
        <Badge t={t}>{role}</Badge>
        <div className="text-[12px] mt-2" style={{ color: t.textMuted }}>Admin and Reviewer roles can approve matches and standardized descriptions; Data Analyst can upload data and reject or flag matches for review.</div>
      </Card>
      <Card t={t} className="p-4">
        <div className="text-[13px] font-medium mb-1" style={{ color: t.text }}>About</div>
        <div className="text-[12px]" style={{ color: t.textMuted }}>National Unified Material Master Platform — prototype build. Matching engine uses word/character-level similarity with numeric specification extraction as a stand-in for a production sentence-transformer + cosine similarity pipeline.</div>
      </Card>
    </div>
  );
}
