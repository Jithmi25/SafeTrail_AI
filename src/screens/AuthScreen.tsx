import { Button, Spinner } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
    IS_SUPABASE_CONFIGURED,
    SUPABASE_MISSING_MESSAGE,
} from "@/lib/supabase";
import {
    ArrowRight,
    Bell,
    Languages,
    Lock,
    Mail,
    MapPin,
    Shield,
    Sparkles,
    User as UserIcon,
    type LucideIcon,
} from "lucide-react";
import { useState } from "react";

export function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    if (mode === "signin") {
      const { error } = await signInWithEmail(email, password);
      if (error) setError(error);
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setBusy(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password, fullName);
      if (error) setError(error);
    }
    setBusy(false);
  }

  async function handleGoogle() {
    if (!IS_SUPABASE_CONFIGURED) {
      setError(SUPABASE_MISSING_MESSAGE);
      return;
    }
    setError(null);
    setBusy(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-brand-700 via-brand-800 to-brand-950">
      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg" />
            <div className="relative bg-white/15 backdrop-blur rounded-2xl p-2.5 ring-1 ring-white/30">
              <Shield className="text-white" size={28} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">SafeTrail AI</h1>
            <p className="text-brand-100 text-sm">
              Smart Tourism Safety · Sri Lanka
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold font-display leading-tight text-balance max-w-sm">
          Travel Sri Lanka with a guardian in your pocket.
        </h2>
        <p className="text-brand-100/90 mt-3 max-w-sm">
          Live safety maps, scam alerts, one-tap SOS, AI translation, and food
          safety — built for foreign travelers.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6 max-w-sm">
          {[
            { icon: MapPin, label: "Live safety map" },
            { icon: Bell, label: "Instant SOS" },
            { icon: Languages, label: "AI translation" },
            { icon: Sparkles, label: "Food allergen scan" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 ring-1 ring-white/15"
            >
              <f.icon size={16} className="text-brand-100" />
              <span className="text-sm text-brand-50">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auth card */}
      <div className="bg-white rounded-t-[2rem] px-6 pt-6 pb-10 shadow-card-lg">
        <div className="flex gap-2 mb-5 p-1 bg-slate-100 rounded-xl">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                mode === m
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <AuthField
              icon={UserIcon}
              label="Full name"
              placeholder="Jane Traveler"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <AuthField
            icon={Mail}
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AuthField
            icon={Lock}
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-sm text-danger-700 bg-danger-50 border border-danger-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" full size="lg" disabled={busy}>
            {busy ? (
              <Spinner size={18} />
            ) : (
              <>
                {mode === "signin" ? "Sign In" : "Create Account"}
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs muted">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          variant="outline"
          full
          size="lg"
          className="text-sm font-semibold disabled:opacity-50"
        >
          <GoogleIcon /> Continue with Google
        </Button>

        <p className="text-xs muted text-center mt-4 leading-relaxed">
          By continuing you agree to use SafeTrail AI responsibly. Your profile,
          contacts, and safety reports are stored securely.
        </p>
      </div>
    </div>
  );
}

function AuthField({
  icon: Icon,
  label,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input className={`input pl-11 ${className}`} {...rest} />
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.9 6.9 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
