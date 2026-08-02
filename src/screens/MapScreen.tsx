import {
  Button,
  Card,
  Chip,
  Input,
  Modal,
  SafetyDot,
  SectionHeader,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import type { MapMarker, SafetyZone } from "@/data/sriLankaData";
import { MAP_MARKERS, SAFE_ROUTES, SAFETY_ZONES } from "@/data/sriLankaData";
import { supabase, type SafetyReport } from "@/lib/supabase";
import {
  AlertTriangle,
  Building2,
  Eye,
  EyeOff,
  Filter,
  Landmark,
  MapPin,
  Plus,
  Route,
  Shield,
  Siren,
} from "lucide-react";
import { useMemo, useState } from "react";

type LayerKey =
  | "zones"
  | "scam_hotspot"
  | "hospital"
  | "police"
  | "embassy"
  | "tourist_center"
  | "routes";

const LAYERS: { key: LayerKey; label: string; color: string }[] = [
  { key: "zones", label: "Safety heatmap", color: "#1bb277" },
  { key: "scam_hotspot", label: "Scam hotspots", color: "#ef4444" },
  { key: "hospital", label: "Hospitals", color: "#338dff" },
  { key: "police", label: "Police", color: "#1556e1" },
  { key: "embassy", label: "Embassies", color: "#a855f7" },
  { key: "tourist_center", label: "Tourist centers", color: "#1bb277" },
  { key: "routes", label: "Safe routes", color: "#0e734f" },
];

const MARKER_ICON: Record<MapMarker["type"], typeof Shield> = {
  scam_hotspot: AlertTriangle,
  hospital: Siren,
  police: Shield,
  embassy: Building2,
  tourist_center: Landmark,
};

const MARKER_COLOR: Record<MapMarker["type"], string> = {
  scam_hotspot: "#ef4444",
  hospital: "#338dff",
  police: "#1556e1",
  embassy: "#a855f7",
  tourist_center: "#1bb277",
};

const ZONE_COLOR: Record<SafetyZone["level"], string> = {
  safe: "rgba(27,178,119,0.32)",
  moderate: "rgba(226,148,27,0.32)",
  high: "rgba(239,68,68,0.34)",
};

const ZONE_STROKE: Record<SafetyZone["level"], string> = {
  safe: "#1bb277",
  moderate: "#e2941b",
  high: "#ef4444",
};

export function MapScreen() {
  const { user } = useAuth();
  const [layers, setLayers] = useState<Set<LayerKey>>(
    new Set(["zones", "scam_hotspot", "hospital", "police"]),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  async function loadReports() {
    setLoadingReports(true);
    const { data } = await supabase
      .from("safety_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setReports((data ?? []) as SafetyReport[]);
    setLoadingReports(false);
  }
  useMemo(() => {
    loadReports();
  }, []);

  function toggleLayer(k: LayerKey) {
    setLayers((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }

  const visibleMarkers = MAP_MARKERS.filter((m) => layers.has(m.type));

  // Convert community reports to map coordinates (normalize 6.0-9.5N, 79.5-81.9E)
  function reportToXY(r: SafetyReport): { x: number; y: number } {
    const x = ((r.lng - 79.5) / (81.9 - 79.5)) * 100;
    const y = ((9.5 - r.lat) / (9.5 - 5.0)) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  }

  const legend = [
    { label: "Safe", color: "#1bb277" },
    { label: "Moderate", color: "#e2941b" },
    { label: "High caution", color: "#ef4444" },
  ];

  return (
    <div className="screen max-w-md mx-auto px-4 pt-4">
      <SectionHeader
        title="Smart Safety Map"
        subtitle="Live safety zones, scam hotspots & essential services"
        icon={<MapPin size={22} />}
        action={
          <button
            onClick={() => setShowFilters(true)}
            className="btn-ghost px-3 py-2 text-sm"
          >
            <Filter size={16} /> Layers
          </button>
        }
      />

      {/* Map */}
      <div className="relative rounded-3xl overflow-hidden shadow-card-lg bg-gradient-to-b from-ocean-50 to-brand-50 border border-slate-200">
        <svg viewBox="0 0 100 100" className="w-full aspect-square block">
          {/* Water + island base */}
          <rect x="0" y="0" width="100" height="100" fill="#d9edff" />
          {/* Sri Lanka silhouette (stylized teardrop) */}
          <path
            d="M 30 12 C 38 6, 52 8, 58 16 C 66 22, 72 32, 74 44 C 76 58, 70 76, 58 86 C 48 93, 36 92, 28 84 C 18 74, 12 60, 12 44 C 12 28, 20 18, 30 12 Z"
            fill="#eefcf6"
            stroke="#aee0c0"
            strokeWidth="0.5"
          />
          {/* Inner terrain shading */}
          <path
            d="M 40 30 C 50 26, 60 34, 60 46 C 60 58, 50 70, 42 68 C 34 64, 34 50, 38 40 C 39 35, 40 32, 40 30 Z"
            fill="#d6f7e8"
            opacity="0.7"
          />

          {/* Safety heatmap zones */}
          {layers.has("zones") &&
            SAFETY_ZONES.map((z) => (
              <circle
                key={z.id}
                cx={z.x}
                cy={z.y}
                r={z.r}
                fill={ZONE_COLOR[z.level]}
                stroke={ZONE_STROKE[z.level]}
                strokeWidth="0.4"
                opacity="0.85"
                onClick={() => setSelectedZone(z)}
                className="cursor-pointer"
              />
            ))}

          {/* Safe routes */}
          {layers.has("routes") &&
            SAFE_ROUTES.filter(
              (r) => !selectedRoute || r.id === selectedRoute,
            ).map((r) => (
              <g
                key={r.id}
                onClick={() => setSelectedRoute(null)}
                className="cursor-pointer"
              >
                <polyline
                  points={r.pathX.map((x, i) => `${x},${r.pathY[i]}`).join(" ")}
                  fill="none"
                  stroke="#0e734f"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2 1.5"
                  opacity="0.9"
                />
                {r.pathX.map((x, i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={r.pathY[i]}
                    r="1.1"
                    fill="#0e734f"
                  />
                ))}
              </g>
            ))}

          {/* Markers */}
          {visibleMarkers.map((m) => {
            const Icon = MARKER_ICON[m.type];
            const color = MARKER_COLOR[m.type];
            return (
              <g
                key={m.id}
                transform={`translate(${m.x},${m.y})`}
                onClick={() => setSelectedMarker(m)}
                className="cursor-pointer"
              >
                <circle r="2.6" fill="white" stroke={color} strokeWidth="0.5" />
                <circle r="1.8" fill={color} />
              </g>
            );
          })}

          {/* Community reports */}
          {reports.map((r) => {
            const { x, y } = reportToXY(r);
            const color =
              r.severity === "critical" || r.severity === "high"
                ? "#ef4444"
                : r.severity === "moderate"
                  ? "#e2941b"
                  : r.severity === "safe"
                    ? "#1bb277"
                    : "#64748b";
            return (
              <g
                key={r.id}
                transform={`translate(${x},${y})`}
                className="cursor-pointer"
              >
                <circle
                  r="1.4"
                  fill={color}
                  opacity="0.9"
                  stroke="white"
                  strokeWidth="0.3"
                />
              </g>
            );
          })}

          {/* User location (simulated Colombo) */}
          <g transform="translate(23,42)">
            <circle
              r="3"
              fill="#338dff"
              opacity="0.25"
              className="animate-ripple"
            />
            <circle r="1.6" fill="#338dff" stroke="white" strokeWidth="0.4" />
          </g>
        </svg>

        {/* Legend overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl px-2.5 py-2 shadow-card text-xs">
          <p className="font-bold text-slate-700 mb-1">Safety zones</p>
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-slate-600">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Report button overlay */}
        <button
          onClick={() => setShowReport(true)}
          className="absolute bottom-3 right-3 bg-white shadow-card-lg rounded-full pl-3 pr-4 py-2 flex items-center gap-1.5 text-sm font-semibold text-brand-700 active:scale-95"
        >
          <Plus size={16} /> Report
        </button>

        {loadingReports && (
          <div className="absolute top-3 right-3 bg-white/90 rounded-lg px-2 py-1 text-xs muted flex items-center gap-1">
            <Spinner size={12} /> Loading reports
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Card pad className="text-center !p-3">
          <p className="text-2xl font-bold text-brand-600">
            {SAFETY_ZONES.filter((z) => z.level === "safe").length}
          </p>
          <p className="text-xs muted">Safe zones</p>
        </Card>
        <Card pad className="text-center !p-3">
          <p className="text-2xl font-bold text-danger-600">
            {MAP_MARKERS.filter((m) => m.type === "scam_hotspot").length}
          </p>
          <p className="text-xs muted">Scam hotspots</p>
        </Card>
        <Card pad className="text-center !p-3">
          <p className="text-2xl font-bold text-ocean-600">{reports.length}</p>
          <p className="text-xs muted">Community reports</p>
        </Card>
      </div>

      {/* Safe routes */}
      <div className="mt-5">
        <SectionHeader
          title="Safe Route Suggestions"
          subtitle="Routes prioritizing lighting and safety over shortest distance"
          icon={<Route size={20} />}
        />
        <div className="space-y-2">
          {SAFE_ROUTES.map((r) => (
            <Card key={r.id} pad className="!p-3.5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{r.name}</p>
                  <p className="text-sm muted">
                    {r.from} → {r.to}
                  </p>
                  <p className="text-xs muted mt-1">{r.reason}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedRoute(r.id);
                    setLayers((p) => new Set(p).add("routes"));
                  }}
                  className="btn-ghost px-2.5 py-1.5 text-xs shrink-0"
                >
                  <Eye size={13} /> Show
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Chip color="green">
                  <SafetyDot level="safe" /> Score {r.safetyScore}
                </Chip>
                <Chip color="slate">{r.distanceKm} km</Chip>
                <Chip color="slate">~{r.estMinutes} min</Chip>
                {r.lit ? (
                  <Chip color="amber">Well-lit</Chip>
                ) : (
                  <Chip color="red">Dark stretches</Chip>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Layers modal */}
      <Modal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        title="Map layers"
      >
        <div className="space-y-2">
          {LAYERS.map((l) => {
            const on = layers.has(l.key);
            return (
              <button
                key={l.key}
                onClick={() => toggleLayer(l.key)}
                className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: l.color }}
                  />
                  {l.label}
                </span>
                {on ? (
                  <Eye size={16} className="text-brand-600" />
                ) : (
                  <EyeOff size={16} className="text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
        <Button full className="mt-4" onClick={() => setShowFilters(false)}>
          Done
        </Button>
      </Modal>

      {/* Marker detail modal */}
      <Modal
        open={!!selectedMarker}
        onClose={() => setSelectedMarker(null)}
        size="sm"
      >
        {selectedMarker && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="rounded-xl p-2.5 text-white"
                style={{ background: MARKER_COLOR[selectedMarker.type] }}
              >
                {(() => {
                  const I = MARKER_ICON[selectedMarker.type];
                  return <I size={20} />;
                })()}
              </div>
              <div>
                <h3 className="font-bold">{selectedMarker.label}</h3>
                <p className="text-xs muted capitalize">
                  {selectedMarker.type.replace("_", " ")}
                </p>
              </div>
            </div>
            {selectedMarker.detail && (
              <p className="text-sm text-slate-600">{selectedMarker.detail}</p>
            )}
          </div>
        )}
      </Modal>

      {/* Zone detail modal */}
      <Modal
        open={!!selectedZone}
        onClose={() => setSelectedZone(null)}
        size="sm"
      >
        {selectedZone && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="rounded-xl p-2.5 text-white"
                style={{ background: ZONE_STROKE[selectedZone.level] }}
              >
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold">{selectedZone.label}</h3>
                <p className="text-xs muted capitalize">
                  {selectedZone.level} caution zone
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {selectedZone.level === "safe" &&
                "Tourist-friendly area with good lighting, services, and low incident reports."}
              {selectedZone.level === "moderate" &&
                "Exercise normal caution. Stay on main roads after dark and keep valuables secure."}
              {selectedZone.level === "high" &&
                "High caution. Avoid after dark, watch for scams and pickpockets, travel in groups."}
            </p>
          </div>
        )}
      </Modal>

      {/* Report form modal */}
      <ReportFormModal
        open={showReport}
        onClose={() => setShowReport(false)}
        userId={user?.id}
        onSubmitted={loadReports}
      />
    </div>
  );
}

function ReportFormModal({
  open,
  onClose,
  userId,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  userId?: string;
  onSubmitted: () => void;
}) {
  const [category, setCategory] =
    useState<SafetyReport["category"]>("unsafe_area");
  const [severity, setSeverity] =
    useState<SafetyReport["severity"]>("moderate");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [lat, setLat] = useState("6.9271");
  const [lng, setLng] = useState("79.8612");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("safety_reports").insert({
      user_id: userId,
      category,
      severity,
      description,
      location_label: locationLabel,
      lat: parseFloat(lat) || 6.9271,
      lng: parseFloat(lng) || 79.8612,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDescription("");
    setLocationLabel("");
    onSubmitted();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Report a safety incident">
      <div className="space-y-3">
        <Select
          label="Category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as SafetyReport["category"])
          }
        >
          <option value="unsafe_area">Unsafe area</option>
          <option value="scam">Scam</option>
          <option value="bad_lighting">Bad lighting</option>
          <option value="suspicious_activity">Suspicious activity</option>
          <option value="safe_area">Safe area (positive)</option>
        </Select>
        <Select
          label="Severity"
          value={severity}
          onChange={(e) =>
            setSeverity(e.target.value as SafetyReport["severity"])
          }
        >
          <option value="safe">Safe</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
        <Input
          label="Location label"
          placeholder="e.g. Galle Face, Colombo"
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
          <Input
            label="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />
        </div>
        <Textarea
          label="Description"
          placeholder="What happened? Add details to help other travelers…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && (
          <p className="text-sm text-danger-700 bg-danger-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <Button full onClick={submit} disabled={submitting}>
          {submitting ? (
            <Spinner size={16} />
          ) : (
            <>
              <Plus size={16} /> Submit report
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
