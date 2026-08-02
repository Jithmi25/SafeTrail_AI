import {
  Button,
  Card,
  Chip,
  Modal,
  SectionHeader,
  Spinner,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  ALLERGENS,
  analyzeDish,
  DIET_OPTIONS,
  runOcr,
  SAMPLE_MENUS,
  SPICE_COLORS,
  type AnalysisResult,
  type MenuDish,
} from "@/lib/aiEngine";
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronRight,
  Flame,
  Leaf,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useState } from "react";

export function FoodScreen() {
  const { profile, updateProfile } = useAuth();
  const [menu, setMenu] = useState<MenuDish[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<{
    dish: MenuDish;
    analysis: AnalysisResult;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const userAllergens = profile?.allergies ?? [];
  const userDiet = profile?.dietary_restrictions ?? [];

  async function scan(menuId: string) {
    setSelectedMenu(menuId);
    setScanning(true);
    setMenu(null);
    const result = await runOcr(menuId);
    setMenu(result);
    setScanning(false);
  }

  const menuOptions = Object.keys(SAMPLE_MENUS).map((k) => ({
    id: k,
    label:
      k === "kandy-restaurant"
        ? "Kandy Restaurant Menu"
        : "Colombo Restaurant Menu",
  }));

  return (
    <div className="screen max-w-md mx-auto px-4 pt-4">
      <SectionHeader
        title="Food Safety Scanner"
        subtitle="Scan menus & ingredients. Get allergen & spice alerts."
        icon={<UtensilsCrossed size={22} />}
        action={
          <button
            onClick={() => setShowSettings(true)}
            className="btn-ghost px-3 py-2 text-sm"
          >
            <ShieldCheck size={16} /> Rules
          </button>
        }
      />

      {/* User dietary summary */}
      <Card className="mb-4 !p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Leaf size={16} className="text-brand-600" />
          <p className="font-semibold text-sm">Your dietary profile</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {userDiet.length === 0 && userAllergens.length === 0 ? (
            <p className="text-sm muted">
              No restrictions set. Tap "Rules" to configure.
            </p>
          ) : (
            <>
              {userDiet.map((d) => (
                <Chip key={d} color="green">
                  <Leaf size={11} /> {d}
                </Chip>
              ))}
              {userAllergens.map((a) => (
                <Chip key={a} color="red">
                  <AlertTriangle size={11} /> {a}
                </Chip>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Scanner */}
      <Card>
        <div className="flex items-center gap-2 mb-3 text-ocean-700">
          <Camera size={18} />
          <p className="font-semibold">OCR Menu Scanner</p>
        </div>
        <p className="text-sm muted mb-3">
          Point your camera at a menu or ingredient label in Sinhala, Tamil, or
          English. Choose a sample to simulate the scan.
        </p>

        {/* Camera viewport mock */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] mb-3 flex items-center justify-center">
          {scanning ? (
            <div className="text-center text-white">
              <div className="relative mx-auto w-20 h-20 mb-3">
                <ScanLine
                  className="absolute inset-0 m-auto text-brand-400 animate-pulse"
                  size={48}
                />
              </div>
              <p className="text-sm font-semibold">Scanning…</p>
              <p className="text-xs text-slate-400">Recognizing text</p>
            </div>
          ) : menu ? (
            <div className="text-center text-white px-6">
              <Check className="mx-auto text-brand-400 mb-2" size={32} />
              <p className="text-sm font-semibold">Menu recognized</p>
              <p className="text-xs text-slate-400">
                {menu.length} dishes found
              </p>
            </div>
          ) : (
            <div className="text-center text-slate-400 px-6">
              <Camera size={36} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">Select a sample menu to scan</p>
            </div>
          )}
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-brand-400/60 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-brand-400/60 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-brand-400/60 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-brand-400/60 rounded-br-lg" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {menuOptions.map((m) => (
            <button
              key={m.id}
              onClick={() => scan(m.id)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                selectedMenu === m.id
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Camera size={14} className="inline mr-1" /> {m.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Results */}
      {scanning && (
        <Card className="mt-4 flex items-center justify-center py-8">
          <Spinner size={28} />{" "}
          <span className="ml-3 muted">Analyzing menu…</span>
        </Card>
      )}

      {menu && !scanning && (
        <div className="mt-4 space-y-2 animate-slide-up">
          <p className="font-semibold text-slate-700 text-sm flex items-center gap-1.5">
            <Sparkles size={15} className="text-brand-600" /> Analyzed dishes
          </p>
          {menu.map((dish) => {
            const analysis = analyzeDish(dish, userAllergens, userDiet);
            return (
              <DishCard
                key={dish.name}
                dish={dish}
                analysis={analysis}
                onClick={() => setSelectedDish({ dish, analysis })}
              />
            );
          })}
        </div>
      )}

      {/* Dish detail modal */}
      <Modal
        open={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        title={selectedDish?.dish.name}
        size="md"
      >
        {selectedDish && (
          <div className="space-y-3">
            {selectedDish.dish.nameLocal && (
              <p className="text-sm muted" lang="si">
                {selectedDish.dish.nameLocal}
              </p>
            )}
            <p className="text-sm text-slate-700">
              {selectedDish.dish.description}
            </p>

            {/* Verdict */}
            <div
              className={`flex items-center gap-3 rounded-xl p-3 ${
                selectedDish.analysis.verdict === "safe"
                  ? "bg-brand-50"
                  : selectedDish.analysis.verdict === "caution"
                    ? "bg-sand-50"
                    : "bg-danger-50"
              }`}
            >
              {selectedDish.analysis.verdict === "safe" ? (
                <Check className="text-brand-600" size={22} />
              ) : selectedDish.analysis.verdict === "caution" ? (
                <AlertTriangle className="text-sand-600" size={22} />
              ) : (
                <X className="text-danger-600" size={22} />
              )}
              <div>
                <p
                  className={`font-bold capitalize ${
                    selectedDish.analysis.verdict === "safe"
                      ? "text-brand-700"
                      : selectedDish.analysis.verdict === "caution"
                        ? "text-sand-800"
                        : "text-danger-700"
                  }`}
                >
                  {selectedDish.analysis.verdict}
                </p>
                <p className="text-xs muted">For your dietary profile</p>
              </div>
            </div>

            {/* Reasons */}
            {selectedDish.analysis.reasons.length > 0 && (
              <div>
                <p className="text-xs font-semibold muted uppercase tracking-wide mb-1.5">
                  Notes
                </p>
                <div className="space-y-1">
                  {selectedDish.analysis.reasons.map((r, i) => (
                    <p
                      key={i}
                      className="text-sm text-slate-600 flex items-start gap-1.5"
                    >
                      <ChevronRight
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />{" "}
                      {r}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Spice level */}
            <div>
              <p className="text-xs font-semibold muted uppercase tracking-wide mb-1.5">
                Spice level
              </p>
              <div className="flex items-center gap-2">
                <Flame
                  size={18}
                  style={{ color: selectedDish.analysis.spiceColor }}
                />
                <span
                  className="font-semibold"
                  style={{ color: selectedDish.analysis.spiceColor }}
                >
                  {selectedDish.analysis.spiceLabel}
                </span>
                <div className="flex gap-1 ml-auto">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-5 rounded-full"
                      style={{
                        background:
                          i <= selectedDish.dish.spiceLevel
                            ? SPICE_COLORS[selectedDish.dish.spiceLevel]
                            : "#e2e8f0",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <p className="text-xs font-semibold muted uppercase tracking-wide mb-1.5">
                Ingredients
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedDish.dish.ingredients.map((ing) => {
                  const isAllergen = userAllergens.some((a) =>
                    ing.toLowerCase().includes(a.toLowerCase()),
                  );
                  return (
                    <Chip key={ing} color={isAllergen ? "red" : "slate"}>
                      {ing}
                    </Chip>
                  );
                })}
              </div>
            </div>

            {/* Diet tags */}
            <div className="flex flex-wrap gap-1.5">
              {selectedDish.dish.dietTags.map((t) => (
                <Chip key={t} color="green">
                  {t.replace("_", " ")}
                </Chip>
              ))}
              {selectedDish.dish.allergens.length > 0 && (
                <Chip color="amber">
                  Contains: {selectedDish.dish.allergens.join(", ")}
                </Chip>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-800">
              LKR {selectedDish.dish.priceLKR.toLocaleString()}
            </p>
          </div>
        )}
      </Modal>

      {/* Dietary settings modal */}
      <DietarySettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

function DishCard({
  dish,
  analysis,
  onClick,
}: {
  dish: MenuDish;
  analysis: AnalysisResult;
  onClick: () => void;
}) {
  const verdictConfig = {
    safe: {
      bg: "bg-brand-50",
      border: "border-brand-200",
      icon: Check,
      color: "text-brand-600",
      label: "Safe",
    },
    caution: {
      bg: "bg-sand-50",
      border: "border-sand-200",
      icon: AlertTriangle,
      color: "text-sand-600",
      label: "Caution",
    },
    avoid: {
      bg: "bg-danger-50",
      border: "border-danger-200",
      icon: X,
      color: "text-danger-600",
      label: "Avoid",
    },
  };
  const v = verdictConfig[analysis.verdict];
  const VIcon = v.icon;

  return (
    <button
      onClick={onClick}
      className={`card w-full text-left p-3.5 border ${v.border} hover:shadow-card-lg transition`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{dish.name}</p>
          <p className="text-xs muted mt-0.5 line-clamp-1">
            {dish.description}
          </p>
        </div>
        <div className={`flex items-center gap-1 ${v.color}`}>
          <VIcon size={16} />
          <span className="text-xs font-bold">{v.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 text-xs"
          style={{ color: analysis.spiceColor }}
        >
          <Flame size={12} /> {analysis.spiceLabel}
        </span>
        {analysis.matchedAllergens.length > 0 && (
          <Chip color="red">
            <AlertTriangle size={10} /> {analysis.matchedAllergens.length}{" "}
            allergen match
          </Chip>
        )}
        <span className="text-xs muted ml-auto">
          LKR {dish.priceLKR.toLocaleString()}
        </span>
      </div>
    </button>
  );
}

function DietarySettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { profile, updateProfile } = useAuth();
  const [allergens, setAllergens] = useState<string[]>(
    profile?.allergies ?? [],
  );
  const [diet, setDiet] = useState<string[]>(
    profile?.dietary_restrictions ?? [],
  );
  const [saving, setSaving] = useState(false);

  function toggle(list: string[], item: string): string[] {
    return list.includes(item)
      ? list.filter((x) => x !== item)
      : [...list, item];
  }

  async function save() {
    setSaving(true);
    await updateProfile({ allergies: allergens, dietary_restrictions: diet });
    setSaving(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dietary rules & allergens"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <p className="label">Dietary preferences</p>
          <div className="flex flex-wrap gap-2">
            {DIET_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDiet((l) => toggle(l, d))}
                className={`chip capitalize ${diet.includes(d) ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <Leaf size={12} /> {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Allergens to avoid</p>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((a) => (
              <button
                key={a}
                onClick={() => setAllergens((l) => toggle(l, a))}
                className={`chip capitalize ${allergens.includes(a) ? "bg-danger-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <AlertTriangle size={12} /> {a.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
        <Button full onClick={save} disabled={saving}>
          {saving ? (
            <Spinner size={16} />
          ) : (
            <>
              <Check size={16} /> Save rules
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
