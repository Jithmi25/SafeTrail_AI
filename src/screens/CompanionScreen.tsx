import {
  Button,
  Card,
  Chip,
  Modal,
  SectionHeader,
  Select,
  Spinner,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import type { Phrase } from "@/data/phrases";
import { PHRASES, PHRASE_CATEGORIES } from "@/data/phrases";
import { CHECKIN_PROMPTS, generateReply } from "@/lib/companion";
import { detectFallOrSuddenStop, simulateMotionStream } from "@/lib/safety";
import { supabase, type ChatMessage } from "@/lib/supabase";
import {
  LANG_LABELS,
  speak,
  startListening,
  translate,
  type Lang,
} from "@/lib/translation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Check,
  ChevronRight,
  Footprints,
  Hand,
  HeartPulse,
  Languages,
  Mic,
  MicOff,
  Moon,
  Navigation,
  Send,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Siren,
  Sparkles,
  UtensilsCrossed,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SubTab = "companion" | "translate" | "nightwalk";

export function CompanionScreen() {
  const [tab, setTab] = useState<SubTab>("companion");

  return (
    <div className="screen max-w-md mx-auto px-4 pt-4">
      <SectionHeader
        title="AI Companion"
        subtitle="Walk With Me — your solo-travel safety buddy"
        icon={<Bot size={22} />}
      />

      <div className="flex gap-2 mb-4">
        {(
          [
            { k: "companion", l: "Walk With Me", i: Bot },
            { k: "translate", l: "Translator", i: Languages },
            { k: "nightwalk", l: "Night Walk", i: Moon },
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

      {tab === "companion" && <ChatCompanion />}
      {tab === "translate" && <Translator />}
      {tab === "nightwalk" && <NightWalk />}
    </div>
  );
}

// ---------- Chat Companion ----------
function ChatCompanion() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("context", "companion")
        .order("created_at", { ascending: true })
        .limit(50);
      setMessages((data ?? []) as ChatMessage[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || !user) return;
    setSending(true);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: "user",
      content: text,
      context: "companion",
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: text,
      context: "companion",
    });

    const reply = generateReply(text);
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: "assistant",
      content: reply,
      context: "companion",
      created_at: new Date().toISOString(),
    };
    setTimeout(async () => {
      setMessages((m) => [...m, aiMsg]);
      setSending(false);
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: reply,
        context: "companion",
      });
    }, 700);
  }

  function handleMic() {
    setListening(true);
    startListening(
      "en",
      (t) => {
        send(t);
        setListening(false);
      },
      () => setListening(false),
    );
  }

  const SUGGESTIONS = [
    "Is it safe to walk at night in Kandy?",
    "How do I avoid tuk-tuk scams?",
    "Temple etiquette tips",
    "I feel nervous traveling alone",
  ];

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "calc(100dvh - 220px)" }}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-3"
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center bg-brand-100 rounded-2xl p-4 mb-3">
              <Sparkles className="text-brand-600" size={28} />
            </div>
            <p className="font-semibold text-slate-700">
              Hi, I'm your Walk With Me companion
            </p>
            <p className="text-sm muted mt-1 max-w-xs mx-auto">
              Ask me about safety, scams, etiquette, food, or just chat if you
              want company on your walk.
            </p>
          </div>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} message={m} />)
        )}
      </div>

      {messages.length === 0 && !loading && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="whitespace-nowrap rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="sticky bottom-0 bg-white pt-2">
        <div className="flex items-end gap-2">
          <button
            onClick={handleMic}
            className={`btn rounded-xl p-3 shrink-0 ${listening ? "bg-danger-600 text-white animate-pulse" : "bg-slate-100 text-slate-600"}`}
          >
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="input flex-1 resize-none py-3"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || sending}
            className="btn-primary rounded-xl p-3 shrink-0"
          >
            {sending ? <Spinner size={18} /> : <Send size={18} />}
          </button>
        </div>
        {listening && (
          <p className="text-xs muted text-center mt-1.5">
            Listening… speak your message
          </p>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}
    >
      {!isUser && (
        <div className="bg-brand-600 rounded-full p-2 h-8 w-8 shrink-0 flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-brand-600 text-white rounded-br-md"
            : "bg-slate-100 text-slate-800 rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

// ---------- Translator ----------
function Translator() {
  const [from, setFrom] = useState<Lang>("en");
  const [to, setTo] = useState<Lang>("si");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<{
    translated: string;
    romanized?: string;
    source: string;
    confidence: number;
  } | null>(null);
  const [listening, setListening] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);

  function swap() {
    setFrom(to);
    setTo(from);
    setInput(output?.translated ?? "");
    setOutput(null);
  }

  function doTranslate() {
    if (!input.trim()) return;
    const r = translate(input, from, to);
    setOutput({
      translated: r.translated,
      romanized: r.romanized,
      source: r.source,
      confidence: r.confidence,
    });
  }

  function handleMic() {
    setListening(true);
    startListening(
      from,
      (t) => {
        setInput(t);
        setListening(false);
      },
      () => setListening(false),
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Select
            className="flex-1"
            value={from}
            onChange={(e) => setFrom(e.target.value as Lang)}
          >
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <option key={l} value={l}>
                {LANG_LABELS[l]}
              </option>
            ))}
          </Select>
          <button
            onClick={swap}
            className="btn-ghost rounded-xl p-2.5 shrink-0"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <Select
            className="flex-1"
            value={to}
            onChange={(e) => setTo(e.target.value as Lang)}
          >
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <option key={l} value={l}>
                {LANG_LABELS[l]}
              </option>
            ))}
          </Select>
        </div>

        <textarea
          className="input mb-2"
          rows={2}
          placeholder={`Enter ${LANG_LABELS[from]} text…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex gap-2 mb-3">
          <Button variant="ghost" onClick={handleMic} className="flex-1">
            {listening ? (
              <>
                <Spinner size={14} /> Listening…
              </>
            ) : (
              <>
                <Mic size={15} /> Speak
              </>
            )}
          </Button>
          <Button
            onClick={doTranslate}
            className="flex-1"
            disabled={!input.trim()}
          >
            <Languages size={15} /> Translate
          </Button>
        </div>

        {output && (
          <div className="bg-brand-50 rounded-xl p-3.5 animate-scale-in">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">
                {LANG_LABELS[to]}
              </p>
              <button
                onClick={() => speak(output.translated, to)}
                className="text-brand-600 hover:text-brand-700"
              >
                <Volume2 size={16} />
              </button>
            </div>
            <p className="text-lg font-semibold text-slate-900" lang={to}>
              {output.translated}
            </p>
            {output.romanized && to !== "en" && (
              <p className="text-sm text-slate-500 italic mt-1">
                {output.romanized}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Chip color={output.source === "dictionary" ? "green" : "slate"}>
                {output.source === "dictionary"
                  ? "Verified phrase"
                  : "AI translated"}
              </Chip>
              <span className="text-xs muted">
                {Math.round(output.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        )}
      </Card>

      <Button variant="outline" full onClick={() => setShowPhrases(true)}>
        <Sparkles size={16} /> Browse offline essential phrases
      </Button>

      <Modal
        open={showPhrases}
        onClose={() => setShowPhrases(false)}
        title="Essential phrases"
        size="lg"
      >
        <PhraseBrowser
          onPick={(p) => {
            setInput(p.en);
            setFrom("en");
            const r = translate(p.en, "en", to);
            setOutput({
              translated: r.translated,
              romanized: r.romanized,
              source: "dictionary",
              confidence: 0.99,
            });
            setShowPhrases(false);
          }}
        />
      </Modal>
    </div>
  );
}

const PHRASE_ICONS: Record<Phrase["category"], LucideIcon> = {
  emergency: Siren,
  medical: HeartPulse,
  police: Shield,
  directional: Navigation,
  food: UtensilsCrossed,
  greeting: Hand,
  shopping: ShoppingBag,
};

function PhraseBrowser({ onPick }: { onPick: (p: Phrase) => void }) {
  const [cat, setCat] = useState<Phrase["category"] | "all">("all");
  const list = PHRASES.filter((p) => cat === "all" || p.category === cat);

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1">
        <button
          onClick={() => setCat("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${cat === "all" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          All
        </button>
        {PHRASE_CATEGORIES.map((c) => {
          const Icon = PHRASE_ICONS[c.key];
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${cat === c.key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              <Icon size={12} /> {c.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar">
        {list.map((p) => {
          const Icon = PHRASE_ICONS[p.category];
          return (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-3 transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="text-brand-600" />
                <p className="font-semibold text-sm text-slate-800">{p.en}</p>
              </div>
              <p className="text-sm text-slate-700" lang="si">
                {p.si} <span className="text-xs muted">· {p.siLatn}</span>
              </p>
              <p className="text-sm text-slate-700" lang="ta">
                {p.ta} <span className="text-xs muted">· {p.taLatn}</span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Night Walk Mode ----------
function NightWalk() {
  const [active, setActive] = useState(false);
  const [checkinIdx, setCheckinIdx] = useState(0);
  const [awaitingCheckin, setAwaitingCheckin] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [motionStatus, setMotionStatus] = useState<
    "idle" | "walking" | "alert"
  >("idle");
  const [motionEvent, setMotionEvent] = useState<string | null>(null);
  const [showIncident, setShowIncident] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setActive(false);
    setAwaitingCheckin(false);
    setMotionStatus("idle");
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Periodic check-in + motion simulation while active
  useEffect(() => {
    if (!active) return;
    setMotionStatus("walking");
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      // Motion sensor simulation every ~4s
      if (elapsed % 4 === 0) {
        const samples = simulateMotionStream(8000, Math.random() < 0.08);
        const ev = detectFallOrSuddenStop(samples);
        if (ev.event === "fall") {
          setMotionEvent("Fall detected!");
          setShowIncident(true);
        } else if (ev.event === "sudden_stop") {
          setMotionEvent("Sudden stop detected");
        }
      }
      // Check-in every 30s (demo; spec says periodic)
      if (elapsed % 30 === 0) {
        setAwaitingCheckin(true);
        setSecondsLeft(120);
      }
      if (awaitingCheckin) {
        setSecondsLeft((s) => {
          if (s <= 1) {
            setShowIncident(true);
            setAwaitingCheckin(false);
            return 0;
          }
          return s - 1;
        });
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, awaitingCheckin]);

  function confirmCheckin() {
    setAwaitingCheckin(false);
    setCheckinIdx((i) => (i + 1) % CHECKIN_PROMPTS.length);
  }

  return (
    <div className="space-y-4">
      <Card
        className={active ? "bg-slate-900 text-white border-slate-800" : ""}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`rounded-2xl p-3 ${active ? "bg-sand-500/20" : "bg-sand-100"}`}
          >
            <Moon
              size={24}
              className={active ? "text-sand-300" : "text-sand-600"}
            />
          </div>
          <div>
            <p className="font-bold text-lg">Night-Walk Mode</p>
            <p className={`text-sm ${active ? "text-slate-300" : "muted"}`}>
              {active
                ? "Active — enhanced vigilance on"
                : "Periodic check-ins & fall detection"}
            </p>
          </div>
        </div>

        {active ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-sm text-slate-300">
                Tracking your walk…
              </span>
              <Footprints size={16} className="text-brand-400 ml-auto" />
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Motion sensor
                </p>
                <Activity size={14} className="text-brand-400" />
              </div>
              <p className="font-semibold capitalize">{motionStatus}</p>
              {motionEvent && (
                <p className="text-xs text-sand-300 mt-1">{motionEvent}</p>
              )}
            </div>

            {awaitingCheckin ? (
              <div className="bg-sand-500/20 border border-sand-500/40 rounded-xl p-4 text-center animate-scale-in">
                <p className="font-semibold text-sand-200">
                  {CHECKIN_PROMPTS[checkinIdx]}
                </p>
                <p className="text-3xl font-bold mt-2 text-white">
                  {secondsLeft}s
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Auto-alert if no response in 2 min
                </p>
                <button
                  onClick={confirmCheckin}
                  className="mt-3 bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl active:scale-95"
                >
                  <Check size={16} className="inline mr-1" /> I'm Safe
                </button>
              </div>
            ) : (
              <div className="bg-brand-500/15 rounded-xl p-3 text-center">
                <ShieldCheck
                  size={20}
                  className="text-brand-300 mx-auto mb-1"
                />
                <p className="text-sm text-slate-200">
                  Next check-in coming up…
                </p>
              </div>
            )}

            <button onClick={stop} className="btn-danger w-full py-3">
              <X size={16} /> End Night-Walk Mode
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm muted mb-3">
              Start enhanced vigilance: you'll get periodic check-in prompts. If
              you don't confirm within 2 minutes, the Emergency Guardian is
              triggered automatically. Sudden stops and falls are detected from
              motion sensors.
            </p>
            <Button full size="lg" onClick={() => setActive(true)}>
              <Moon size={18} /> Start Night-Walk Mode
            </Button>
          </>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Card pad className="!p-3 text-center">
          <HeartPulse className="mx-auto text-brand-600 mb-1" size={20} />
          <p className="text-xs muted">Fall detection</p>
        </Card>
        <Card pad className="!p-3 text-center">
          <AlertTriangle className="mx-auto text-sand-600 mb-1" size={20} />
          <p className="text-xs muted">Auto SOS</p>
        </Card>
        <Card pad className="!p-3 text-center">
          <Check className="mx-auto text-brand-600 mb-1" size={20} />
          <p className="text-xs muted">Check-ins</p>
        </Card>
      </div>

      <Modal
        open={showIncident}
        onClose={() => setShowIncident(false)}
        size="sm"
      >
        <div className="text-center">
          <div className="bg-danger-100 rounded-full p-4 w-fit mx-auto mb-3 animate-pulse-ring">
            <AlertTriangle className="text-danger-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-danger-700">
            Safety Alert Triggered
          </h3>
          <p className="text-sm muted mt-1.5 mb-4">
            {motionEvent ?? "No check-in within 2 minutes"}. Your emergency
            contacts are being notified with your GPS location.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" full onClick={() => setShowIncident(false)}>
              Dismiss
            </Button>
            <Button
              variant="danger"
              full
              onClick={() => setShowIncident(false)}
            >
              I'm Safe
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
