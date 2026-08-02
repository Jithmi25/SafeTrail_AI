import type { LucideIcon } from "lucide-react";
import { Bot, MapPin, ShieldAlert, User, UtensilsCrossed } from "lucide-react";

export type TabKey = "map" | "scams" | "companion" | "food" | "profile";

export const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "map", label: "Map", icon: MapPin },
  { key: "scams", label: "Scams & Fare", icon: ShieldAlert },
  { key: "companion", label: "Companion", icon: Bot },
  { key: "food", label: "Food Safety", icon: UtensilsCrossed },
  { key: "profile", label: "Profile", icon: User },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 glass border-t border-slate-200/60 safe-pb">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className="flex flex-col items-center gap-0.5 py-2.5 relative"
            >
              {isActive && (
                <span className="absolute top-0 h-1 w-8 rounded-full bg-brand-500" />
              )}
              <Icon
                size={22}
                className={isActive ? "text-brand-600" : "text-slate-400"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-semibold leading-none ${
                  isActive ? "text-brand-700" : "text-slate-400"
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
