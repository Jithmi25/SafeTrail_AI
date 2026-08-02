import { X } from "lucide-react";
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
} from "react";

// ---- Button ----
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  full?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary: "btn-primary",
    danger: "btn-danger",
    ghost: "btn-ghost",
    outline: "btn-outline",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// ---- Card ----
export function Card({
  children,
  className = "",
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div className={`${pad ? "card-pad" : "card"} ${className}`}>
      {children}
    </div>
  );
}

// ---- Badge / Chip ----
export function Chip({
  children,
  color = "slate",
  className = "",
}: {
  children: ReactNode;
  color?: "slate" | "green" | "amber" | "red" | "blue";
  className?: string;
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-brand-100 text-brand-700",
    amber: "bg-sand-100 text-sand-800",
    red: "bg-danger-100 text-danger-700",
    blue: "bg-ocean-100 text-ocean-700",
  };
  return (
    <span className={`chip ${colors[color]} ${className}`}>{children}</span>
  );
}

// ---- Input ----
export function Input({
  label,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <input className={`input ${className}`} {...rest} />
    </label>
  );
}

// ---- Textarea ----
export function Textarea({
  label,
  className = "",
  rows = 3,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <textarea className={`input ${className}`} rows={rows} {...rest} />
    </label>
  );
}

// ---- Select ----
export function Select({
  label,
  className = "",
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <select
        className={`input ${className} appearance-none bg-no-repeat`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

// ---- Modal ----
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;
  const widths: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${widths[size]} bg-white rounded-t-3xl sm:rounded-3xl shadow-card-lg p-5 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar`}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ---- Section header ----
export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 text-brand-600">{icon}</div>}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-sm muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ---- Empty state ----
export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {icon && <div className="text-slate-300 mb-3">{icon}</div>}
      <p className="font-semibold text-slate-600">{title}</p>
      {hint && <p className="text-sm muted mt-1">{hint}</p>}
    </div>
  );
}

// ---- Safety level indicator ----
export function SafetyDot({ level }: { level: "safe" | "moderate" | "high" }) {
  const map = {
    safe: "bg-brand-500",
    moderate: "bg-sand-500",
    high: "bg-danger-500",
  };
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${map[level]}`} />
  );
}

// ---- Spinner ----
export function Spinner({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-slate-200 border-t-brand-500 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
