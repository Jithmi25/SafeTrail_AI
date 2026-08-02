import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { EMERGENCY_NUMBERS } from "@/data/sriLankaData";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  Check,
  MapPin,
  Mic,
  Phone,
  Siren,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const COUNTDOWN_SECONDS = 5;

export function SosButton() {
  const { user, profile } = useAuth();
  const [armed, setArmed] = useState(false);
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [active, setActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [contactsNotified, setContactsNotified] = useState(0);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancel = useCallback(() => {
    setArmed(false);
    setActive(false);
    setRecording(false);
    setCount(COUNTDOWN_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!armed) return;
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          triggerSos();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed]);

  async function triggerSos() {
    setActive(true);
    // Best-effort geolocation
    let lat: number | null = null;
    let lng: number | null = null;
    let label = "Location unavailable";
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 }),
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      /* use fallback */
    }
    setLocation({ lat: lat ?? 6.9271, lng: lng ?? 79.8612, label });

    // Record an incident in the database
    if (user) {
      const { data } = await supabase
        .from("sos_incidents")
        .insert({
          user_id: user.id,
          status: "triggered",
          lat,
          lng,
          location_label: label,
        })
        .select("id")
        .maybeSingle();
      if (data) setIncidentId(data.id);
    }

    // Simulate notifying emergency contacts
    const count = profile?.emergency_contacts?.length ?? 0;
    setContactsNotified(count);
    setRecording(true);
  }

  async function resolveIncident() {
    if (incidentId && user) {
      await supabase
        .from("sos_incidents")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", incidentId);
    }
    cancel();
  }

  const progress = ((COUNTDOWN_SECONDS - count) / COUNTDOWN_SECONDS) * 100;

  return (
    <>
      {/* Floating SOS trigger — always visible when not active */}
      {!armed && !active && (
        <button
          onClick={() => setArmed(true)}
          className="fixed bottom-24 right-4 z-40 h-16 w-16 rounded-full bg-danger-600 text-white shadow-glow-danger flex items-center justify-center animate-sos-pulse active:scale-95"
          aria-label="Emergency SOS"
        >
          <Siren size={26} />
        </button>
      )}

      {/* Countdown modal */}
      {armed && !active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-danger-950/70 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center text-center px-6">
            <div className="relative h-44 w-44">
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-5xl font-bold font-display">{count}</span>
                <span className="text-xs uppercase tracking-widest mt-1">
                  Sending SOS
                </span>
              </div>
            </div>
            <p className="text-white font-semibold mt-6 text-lg">
              Alerting in {count} seconds
            </p>
            <p className="text-danger-100 text-sm mt-1 max-w-xs">
              GPS location and emergency alerts will be sent to your contacts.
            </p>
            <button
              onClick={cancel}
              className="mt-6 flex items-center gap-2 bg-white text-danger-700 font-bold px-8 py-3 rounded-2xl shadow-lg active:scale-95"
            >
              <X size={20} /> Cancel SOS
            </button>
          </div>
        </div>
      )}

      {/* Active SOS modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-danger-950/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-danger-100 rounded-full p-2.5 animate-pulse-ring">
                <Siren className="text-danger-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-danger-700">
                  SOS Active
                </h3>
                <p className="text-sm muted">Emergency alert sent</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 bg-brand-50 rounded-xl p-3">
                <Check className="text-brand-600 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-semibold text-brand-800">
                    Contacts notified
                  </p>
                  <p className="text-brand-700">
                    {contactsNotified} emergency contact
                    {contactsNotified !== 1 ? "s" : ""} alerted via SMS
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-ocean-50 rounded-xl p-3">
                <MapPin className="text-ocean-600 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-semibold text-ocean-800">
                    GPS location shared
                  </p>
                  <p className="text-ocean-700 font-mono text-xs">
                    {location?.label}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-sand-50 rounded-xl p-3">
                <Video className="text-sand-700 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="font-semibold text-sand-800">
                    {recording ? "Emergency recording active" : "Recording"}
                  </p>
                  <p className="text-sand-700">
                    Audio/video saved to secure storage
                  </p>
                </div>
                {recording && (
                  <span className="ml-auto h-2.5 w-2.5 rounded-full bg-danger-500 animate-pulse" />
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {EMERGENCY_NUMBERS.map((n) => (
                <a
                  key={n.number}
                  href={`tel:${n.number}`}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-2.5 text-sm transition"
                >
                  <Phone size={15} className="text-danger-600" />
                  <div className="leading-tight">
                    <p className="font-semibold text-slate-800">{n.number}</p>
                    <p className="text-xs muted">{n.label}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
              <AlertTriangle size={15} className="text-amber-600" />
              <p className="text-xs text-amber-800">
                Demo mode: no real SMS or calls are sent.
              </p>
            </div>

            <div className="flex gap-2 mt-5">
              <Button
                variant="ghost"
                full
                onClick={() => setRecording((r) => !r)}
              >
                <Mic size={16} /> {recording ? "Pause" : "Resume"}
              </Button>
              <Button variant="danger" full onClick={resolveIncident}>
                <Check size={16} /> I'm Safe
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Voice-triggered emergency activation hook (used in Companion screen).
export function useVoiceSos(onTrigger: () => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const start = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ")
        .toLowerCase();
      if (
        ["help me", "emergency", "sos", "i'm in danger"].some((k) =>
          transcript.includes(k),
        )
      ) {
        onTrigger();
        rec.stop();
      }
    };
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [onTrigger]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop };
}
