import {
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  Modal,
  SectionHeader,
  Select,
  Spinner,
} from "@/components/ui";
import type { ScamEntry } from "@/data/sriLankaData";
import {
  FARE_ROUTES,
  SCAM_DATABASE,
  VERIFIED_PROVIDERS,
} from "@/data/sriLankaData";
import { verifyTicket, type TicketVerification } from "@/lib/aiEngine";
import { calculateFare, type FareEstimate } from "@/lib/safety";
import {
  AlertTriangle,
  Calculator,
  Check,
  ChevronRight,
  MapPin,
  Moon,
  Phone,
  Search,
  ShieldAlert,
  Star,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

type SubTab = "fare" | "scams" | "ticket" | "providers";

const SCAM_LEVEL_COLOR: Record<ScamEntry["warningLevel"], "amber" | "red"> = {
  caution: "amber",
  high: "red",
  critical: "red",
};

const CATEGORY_LABELS: Record<ScamEntry["category"], string> = {
  gems: "Gems & Jewelry",
  spice_garden: "Spice Garden",
  temple_closed: "Temple Trick",
  transport: "Transport",
  fake_ticket: "Fake Tickets",
  gem_shop: "Fake Guide",
  street_scam: "Street Scam",
};

export function ScamsScreen() {
  const [tab, setTab] = useState<SubTab>("fare");

  return (
    <div className="screen max-w-md mx-auto px-4 pt-4">
      <SectionHeader
        title="Scams & Fair Fare"
        subtitle="Know the fair price. Spot the tricks."
        icon={<ShieldAlert size={22} />}
      />

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar -mx-1 px-1">
        {(
          [
            { k: "fare", l: "Fare Calculator", i: Calculator },
            { k: "scams", l: "Scam Alerts", i: AlertTriangle },
            { k: "ticket", l: "Ticket Verify", i: Ticket },
            { k: "providers", l: "Verified Drivers", i: Users },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition ${
              tab === t.k
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <t.i size={15} /> {t.l}
          </button>
        ))}
      </div>

      {tab === "fare" && <FareCalculator />}
      {tab === "scams" && <ScamAlerts />}
      {tab === "ticket" && <TicketVerifier />}
      {tab === "providers" && <ProviderDirectory />}
    </div>
  );
}

// ---------- Fare Calculator ----------
function FareCalculator() {
  const [routeId, setRouteId] = useState("");
  const [km, setKm] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isNight, setIsNight] = useState(false);
  const [estimate, setEstimate] = useState<FareEstimate | null>(null);

  function useRoute(id: string) {
    setRouteId(id);
    const r = FARE_ROUTES.find((x) => x.id === id);
    if (r) {
      setKm(String(r.km));
      setMinutes(String(Math.round(r.km * 2.5)));
    }
  }

  function calc() {
    const k = parseFloat(km) || 0;
    const m = parseFloat(minutes) || 0;
    setEstimate(calculateFare(k, m, isNight));
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-3 text-brand-700">
          <Calculator size={18} />
          <p className="font-semibold">Tuk-Tuk Fare Calculator</p>
        </div>
        <div className="space-y-3">
          <Select
            label="Popular route (optional)"
            value={routeId}
            onChange={(e) => useRoute(e.target.value)}
          >
            <option value="">Choose a route or enter manually</option>
            {FARE_ROUTES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.from} → {r.to} ({r.km} km)
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Distance (km)"
              type="number"
              placeholder="5"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
            <Input
              label="Est. minutes"
              type="number"
              placeholder="15"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsNight((n) => !n)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition ${
              isNight
                ? "bg-slate-800 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Moon size={16} /> Night surcharge (10pm–5am)
            </span>
            <span
              className={`relative h-6 w-11 rounded-full transition ${isNight ? "bg-brand-500" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isNight ? "left-[22px]" : "left-0.5"}`}
              />
            </span>
          </button>
          <Button full onClick={calc}>
            <Calculator size={16} /> Calculate fair fare
          </Button>
        </div>
      </Card>

      {estimate && (
        <Card className="animate-scale-in">
          <div className="text-center mb-3">
            <p className="text-sm muted">Fair fare estimate</p>
            <p className="text-4xl font-bold text-brand-600 font-display">
              {estimate.currency} {estimate.fair.toLocaleString()}
            </p>
            <p className="text-xs muted">Official meter-based rate</p>
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 mb-3">
            <div className="text-center flex-1">
              <p className="text-xs muted">Low end</p>
              <p className="font-bold text-brand-700">
                LKR {estimate.low.toLocaleString()}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center flex-1">
              <p className="text-xs muted">Overcharge ceiling</p>
              <p className="font-bold text-danger-600">
                LKR {estimate.high.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            {estimate.breakdown.map((b, i) => (
              <p key={i} className="flex items-center gap-1.5">
                <ChevronRight size={12} /> {b}
              </p>
            ))}
          </div>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <p>
              If a driver quotes above{" "}
              <strong>LKR {estimate.high.toLocaleString()}</strong>, it's
              overcharging. Walk away or use a verified driver.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------- Scam Alerts ----------
function ScamAlerts() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ScamEntry | null>(null);

  const filtered = SCAM_DATABASE.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase()) ||
      s.commonLocations.some((l) =>
        l.toLowerCase().includes(query.toLowerCase()),
      ),
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="absolute left-3.5 top-3.5 text-slate-400"
          size={18}
        />
        <Input
          placeholder="Search scams, locations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<AlertTriangle size={36} />}
          title="No matching scams"
          hint="Try a different search."
        />
      )}

      {filtered.map((s) => (
        <Card
          key={s.id}
          pad
          className="!p-3.5 cursor-pointer hover:border-slate-200"
        >
          <button onClick={() => setSelected(s)} className="w-full text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{s.title}</p>
                <p className="text-xs muted mt-0.5">
                  {CATEGORY_LABELS[s.category]}
                </p>
              </div>
              <Chip color={SCAM_LEVEL_COLOR[s.warningLevel]}>
                {s.warningLevel === "critical"
                  ? "Critical"
                  : s.warningLevel === "high"
                    ? "High risk"
                    : "Caution"}
              </Chip>
            </div>
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
              {s.description}
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {s.commonLocations.slice(0, 3).map((l) => (
                <Chip key={l} color="slate">
                  <MapPin size={10} /> {l}
                </Chip>
              ))}
            </div>
          </button>
        </Card>
      ))}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        size="md"
      >
        {selected && (
          <div className="space-y-3">
            <Chip color={SCAM_LEVEL_COLOR[selected.warningLevel]}>
              {selected.warningLevel === "critical"
                ? "Critical risk"
                : selected.warningLevel === "high"
                  ? "High risk"
                  : "Use caution"}
            </Chip>
            <p className="text-sm text-slate-700">{selected.description}</p>
            <div className="bg-brand-50 rounded-xl p-3.5">
              <p className="font-semibold text-brand-800 flex items-center gap-2 mb-1">
                <Check size={16} /> How to avoid
              </p>
              <p className="text-sm text-brand-700">{selected.howToAvoid}</p>
            </div>
            <div>
              <p className="text-xs muted mb-1">Common locations</p>
              <div className="flex gap-1.5 flex-wrap">
                {selected.commonLocations.map((l) => (
                  <Chip key={l} color="slate">
                    <MapPin size={10} /> {l}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------- Ticket Verifier ----------
function TicketVerifier() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<TicketVerification | null>(null);
  const [scanning, setScanning] = useState(false);

  const SAMPLES = [
    "SRI LANKA RAILWAYS | EXPRESS | Class: 2ND | Date: 12-AUG-2024 | From: COLOMBO FORT | To: KANDY | PNR: X7T2K9 | Fare: LKR 240 | QR: sha256:a1b2c3",
    "Colombo to Galle ticket | 2nd class | Rs 180 | 14 Aug",
    "COPY TICKET | train to ella | rs 100",
  ];

  function scan() {
    setScanning(true);
    setTimeout(() => {
      setResult(verifyTicket(input));
      setScanning(false);
    }, 1200);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-3 text-ocean-700">
          <Ticket size={18} />
          <p className="font-semibold">Fake Ticket Verification</p>
        </div>
        <p className="text-sm muted mb-3">
          Paste the text from a train or bus ticket (or use the sample). The
          scanner checks for official markers, booking references, and security
          elements.
        </p>
        <textarea
          className="input mb-3 font-mono text-xs"
          rows={4}
          placeholder="Paste ticket text here…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex gap-2 mb-3 flex-wrap">
          {SAMPLES.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(s);
                setResult(null);
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-600"
            >
              Sample {i + 1}
            </button>
          ))}
        </div>
        <Button full onClick={scan} disabled={scanning || !input.trim()}>
          {scanning ? (
            <>
              <Spinner size={16} /> Scanning…
            </>
          ) : (
            <>
              <Ticket size={16} /> Verify ticket
            </>
          )}
        </Button>
      </Card>

      {result && (
        <Card className="animate-scale-in">
          <div
            className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${
              result.authentic ? "bg-brand-50" : "bg-danger-50"
            }`}
          >
            {result.authentic ? (
              <Check className="text-brand-600" size={24} />
            ) : (
              <X className="text-danger-600" size={24} />
            )}
            <div>
              <p
                className={`font-bold ${result.authentic ? "text-brand-700" : "text-danger-700"}`}
              >
                {result.authentic
                  ? "Likely authentic"
                  : "Likely fake — do not trust"}
              </p>
              <p className="text-xs muted">Confidence: {result.confidence}%</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {result.fields.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0"
              >
                <span className="text-slate-600">{f.label}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-slate-800 font-medium">{f.value}</span>
                  {f.status === "ok" ? (
                    <Check size={14} className="text-brand-600" />
                  ) : f.status === "suspicious" ? (
                    <AlertTriangle size={14} className="text-amber-500" />
                  ) : (
                    <X size={14} className="text-slate-400" />
                  )}
                </span>
              </div>
            ))}
          </div>

          {result.flags.length > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="font-semibold text-amber-800 text-sm mb-1">
                Red flags
              </p>
              {result.flags.map((flag, i) => (
                <p
                  key={i}
                  className="text-xs text-amber-700 flex items-start gap-1.5"
                >
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {flag}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ---------- Provider Directory ----------
function ProviderDirectory() {
  const [filter, setFilter] = useState<
    "all" | "tuk_tuk" | "taxi" | "guide" | "tour"
  >("all");
  const list = VERIFIED_PROVIDERS.filter(
    (p) => filter === "all" || p.type === filter,
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {(["all", "tuk_tuk", "taxi", "guide", "tour"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap capitalize transition ${
              filter === f
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {list.map((p) => (
        <Card key={p.id} pad className="!p-3.5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                {p.name}
                {p.verified && <Check size={15} className="text-brand-600" />}
              </p>
              <p className="text-xs muted capitalize mt-0.5">
                {p.type.replace("_", " ")} · {p.area}
              </p>
              <p className="text-sm text-slate-600 mt-1.5">{p.notes}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="font-bold text-slate-800 text-sm">
                  {p.rating}
                </span>
              </div>
              <p className="text-xs muted">{p.reviews} reviews</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <a
              href={`tel:${p.phone.replace(/\s/g, "")}`}
              className="btn-primary flex-1 py-2 text-sm"
            >
              <Phone size={14} /> Call
            </a>
            <Chip color="green" className="self-center">
              <Check size={12} /> Verified
            </Chip>
          </div>
        </Card>
      ))}
    </div>
  );
}
