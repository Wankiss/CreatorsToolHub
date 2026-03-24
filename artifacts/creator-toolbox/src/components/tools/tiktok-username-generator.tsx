import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  AtSign, Copy, Check, RefreshCw, Sparkles, Loader2,
  ChevronDown, Search, Zap, ListChecks, TrendingUp, Shield,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToneMode = "fun" | "aesthetic" | "bold" | "professional" | "edgy" | "minimal";
type Niche =
  | "fitness" | "business" | "beauty" | "food" | "travel"
  | "finance" | "tech" | "lifestyle" | "education" | "gaming"
  | "fashion" | "relationships" | "entertainment" | "health" | "other";
type StyleCategory =
  | "Personal Brand" | "Niche-Based" | "Keyword Twist"
  | "Aesthetic" | "Bold/Viral" | "Abstract";

interface UsernameResult {
  username: string;
  style: StyleCategory;
  memorable: boolean;
  spellable: boolean;
  brandable: boolean;
}

// ─── Niche Config ─────────────────────────────────────────────────────────────

const NICHE_EMOJIS: Record<Niche, string> = {
  fitness: "💪", business: "💼", beauty: "💄", food: "🍕", travel: "✈️",
  finance: "💰", tech: "🤖", lifestyle: "✨", education: "📚", gaming: "🎮",
  fashion: "👗", relationships: "❤️", entertainment: "🎬", health: "🌿", other: "🚀",
};

const NICHES: { value: Niche; label: string }[] = [
  { value: "fitness", label: "Fitness" },
  { value: "business", label: "Business" },
  { value: "beauty", label: "Beauty" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "finance", label: "Finance" },
  { value: "tech", label: "Tech / AI" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "education", label: "Education" },
  { value: "gaming", label: "Gaming" },
  { value: "fashion", label: "Fashion" },
  { value: "relationships", label: "Relationships" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

const TONES: { value: ToneMode; label: string }[] = [
  { value: "fun", label: "Fun" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "bold", label: "Bold" },
  { value: "professional", label: "Professional" },
  { value: "edgy", label: "Edgy" },
  { value: "minimal", label: "Minimal" },
];

const NICHE_WORDS: Record<Niche, string[]> = {
  fitness:       ["fit", "gym", "flex", "lift", "gains", "body", "active", "grind", "core", "beast"],
  business:      ["biz", "boss", "build", "grow", "scale", "hustle", "launch", "rise", "exec", "brand"],
  beauty:        ["glow", "glam", "bloom", "lush", "shine", "glo", "radiate", "petal", "gloss", "beam"],
  food:          ["eat", "chef", "cook", "taste", "bite", "feast", "dish", "fresh", "yum", "grub"],
  travel:        ["roam", "trek", "globe", "jet", "nomad", "wander", "drift", "cross", "camp", "coast"],
  finance:       ["cash", "coin", "wealth", "invest", "stack", "fund", "earn", "rich", "save", "bills"],
  tech:          ["tech", "code", "smart", "dev", "data", "build", "bytes", "ai", "click", "hack"],
  lifestyle:     ["life", "vibe", "flow", "daily", "thrive", "spark", "mood", "chill", "balance", "glow"],
  education:     ["learn", "mind", "know", "think", "grow", "teach", "wise", "deep", "sharp", "study"],
  gaming:        ["game", "play", "quest", "level", "pro", "rank", "grind", "pixel", "boss", "clutch"],
  fashion:       ["style", "chic", "drip", "trend", "look", "slay", "mode", "fits", "glam", "wear"],
  relationships: ["love", "heart", "bond", "soul", "date", "match", "link", "care", "pair", "connect"],
  entertainment: ["pop", "hype", "buzz", "viral", "trend", "fun", "wave", "drop", "reel", "show"],
  health:        ["well", "heal", "vital", "pure", "clean", "zen", "renew", "thrive", "calm", "glow"],
  other:         ["create", "build", "share", "make", "daily", "rise", "flow", "craft", "spark", "pro"],
};

const POWER_WORDS = ["lab", "hub", "daily", "zone", "hq", "co", "pro", "spot", "world", "club", "base", "den", "works"];
const ABSTRACT_PREFIXES = ["lum", "kin", "sol", "nex", "aur", "vel", "clar", "mox", "zyn", "flex", "lux", "vex"];
const ABSTRACT_SUFFIXES = ["ora", "iq", "ix", "ly", "io", "ify", "ova", "ara", "ex", "ell", "ify", "able"];

// ─── Quality Evaluator ────────────────────────────────────────────────────────

function evaluateUsername(u: string): { memorable: boolean; spellable: boolean; brandable: boolean } {
  const len = u.length;
  const memorable =
    len >= 4 && len <= 14 &&
    !/\d{3,}/.test(u) &&
    !/(.)\1\1/.test(u); // no triple repeated char

  const spellable =
    !(/[aeiou]{3}/.test(u)) &&
    !(/[^aeiouyw]{5}/.test(u)) &&
    len <= 18;

  const brandable =
    !/^\d|\d$/.test(u) &&
    /[aeiou]/.test(u) &&
    len >= 4 &&
    len <= 16 &&
    !/\d{2,}/.test(u);

  return { memorable, spellable, brandable };
}

// ─── Generation Engine ────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function buildPool(
  name: string,
  niche: Niche,
  tone: ToneMode,
  keywords: string,
): Array<{ username: string; style: StyleCategory }> {
  const words = NICHE_WORDS[niche];
  const [w1, w2, w3, w4] = words;
  const nameFirst = name.trim().toLowerCase().replace(/\s+.*$/, "").replace(/[^a-z]/g, "").slice(0, 10);
  const kws = keywords.trim().toLowerCase().split(/[\s,]+/).filter(k => k.length >= 3 && k.length <= 8);
  const kwMain = kws[0] || words[4];

  const pool: Array<{ username: string; style: StyleCategory }> = [];

  // ── Style 1: Personal Brand ──
  if (nameFirst.length >= 2) {
    pool.push(
      { username: `${nameFirst}${w1}`, style: "Personal Brand" },
      { username: `${nameFirst}${w2}`, style: "Personal Brand" },
      { username: `${nameFirst}daily`, style: "Personal Brand" },
      { username: `${nameFirst}vibes`, style: "Personal Brand" },
      { username: `${nameFirst}creates`, style: "Personal Brand" },
      { username: `${nameFirst}hub`, style: "Personal Brand" },
      { username: `${nameFirst}hq`, style: "Personal Brand" },
      { username: `${nameFirst}${w3}`, style: "Personal Brand" },
    );
    if (nameFirst.length <= 5) {
      pool.push(
        { username: `${nameFirst}zone`, style: "Personal Brand" },
        { username: `${nameFirst}co`, style: "Personal Brand" },
      );
    }
  }

  // ── Style 2: Niche-Based ──
  for (const pw of pickN(POWER_WORDS, 5)) {
    pool.push({ username: `${w1}${pw}`, style: "Niche-Based" });
  }
  pool.push(
    { username: `${w2}hub`, style: "Niche-Based" },
    { username: `${w1}central`, style: "Niche-Based" },
    { username: `the${w1}hub`, style: "Niche-Based" },
    { username: `${w3}zone`, style: "Niche-Based" },
    { username: `${w2}world`, style: "Niche-Based" },
    { username: `${w4}daily`, style: "Niche-Based" },
  );

  // ── Style 3: Keyword Twist ──
  pool.push(
    { username: `${w1}${w2}`, style: "Keyword Twist" },
    { username: `${w1}mind`, style: "Keyword Twist" },
    { username: `${kwMain}${pick(ABSTRACT_SUFFIXES)}`, style: "Keyword Twist" },
    { username: `${w2}${w3}`, style: "Keyword Twist" },
    { username: `${kwMain}lab`, style: "Keyword Twist" },
    { username: `${w3}hub`, style: "Keyword Twist" },
    { username: `${w1}${w4}`, style: "Keyword Twist" },
  );
  if (kws[1]) pool.push({ username: `${kws[1]}${w1}`, style: "Keyword Twist" });
  if (kws[0] && kws[0] !== w1) pool.push({ username: `${kws[0]}lab`, style: "Keyword Twist" });

  // ── Style 4: Aesthetic / Minimal ──
  pool.push(
    { username: `${w1}co`, style: "Aesthetic" },
    { username: `${w1}ly`, style: "Aesthetic" },
    { username: `${w2}co`, style: "Aesthetic" },
    { username: `my${w1}`, style: "Aesthetic" },
    { username: `${w1}hq`, style: "Aesthetic" },
    { username: `${w1}io`, style: "Aesthetic" },
    { username: `${w2}ly`, style: "Aesthetic" },
    { username: `${w3}co`, style: "Aesthetic" },
  );
  if (tone === "minimal") {
    pool.push({ username: `${w1}`, style: "Aesthetic" });
  }

  // ── Style 5: Bold / Viral ──
  pool.push(
    { username: `go${w1}`, style: "Bold/Viral" },
    { username: `get${w1}`, style: "Bold/Viral" },
    { username: `${w1}mode`, style: "Bold/Viral" },
    { username: `just${w1}`, style: "Bold/Viral" },
    { username: `${w1}life`, style: "Bold/Viral" },
    { username: `be${w1}`, style: "Bold/Viral" },
    { username: `${w1}wave`, style: "Bold/Viral" },
    { username: `live${w1}`, style: "Bold/Viral" },
  );

  // ── Style 6: Abstract / Brandable ──
  const ap1 = pick(ABSTRACT_PREFIXES);
  const ap2 = pick(ABSTRACT_PREFIXES.filter(x => x !== ap1));
  const as1 = pick(ABSTRACT_SUFFIXES);
  const as2 = pick(ABSTRACT_SUFFIXES.filter(x => x !== as1));
  pool.push(
    { username: `${ap1}${w1}`, style: "Abstract" },
    { username: `${w1}${as1}`, style: "Abstract" },
    { username: `${ap2}${w2}`, style: "Abstract" },
    { username: `${w1}ify`, style: "Abstract" },
    { username: `${ap1}${w3}`, style: "Abstract" },
    { username: `${w2}${as2}`, style: "Abstract" },
    { username: `${ap2}${w1}`, style: "Abstract" },
  );

  return pool;
}

function generateUsernames(
  name: string,
  niche: Niche,
  contentType: string,
  audience: string,
  tone: ToneMode,
  keywords: string,
): UsernameResult[] {
  const raw = buildPool(name, niche, tone, keywords);
  const seen = new Set<string>();
  const scored: UsernameResult[] = [];

  for (const item of raw) {
    const u = item.username.replace(/[^a-z0-9]/g, "").slice(0, 20);
    if (!u || u.length < 4 || seen.has(u)) continue;
    seen.add(u);
    const { memorable, spellable, brandable } = evaluateUsername(u);
    const passCount = [memorable, spellable, brandable].filter(Boolean).length;
    if (passCount >= 2) {
      scored.push({ username: u, style: item.style, memorable, spellable, brandable });
    }
  }

  // Ensure variety: up to 4 per style, then fill to 20
  const byStyle = new Map<StyleCategory, UsernameResult[]>();
  for (const r of scored) {
    if (!byStyle.has(r.style)) byStyle.set(r.style, []);
    byStyle.get(r.style)!.push(r);
  }

  const styles: StyleCategory[] = ["Personal Brand", "Niche-Based", "Keyword Twist", "Aesthetic", "Bold/Viral", "Abstract"];
  const result: UsernameResult[] = [];

  // First pass: 3 per style
  for (const style of styles) {
    result.push(...(byStyle.get(style) || []).slice(0, 3));
  }

  // Fill remaining up to 20
  let slots = 20 - result.length;
  for (const style of styles) {
    if (slots <= 0) break;
    const already = result.filter(r => r.style === style).length;
    const extra = (byStyle.get(style) || []).slice(already, already + slots);
    result.push(...extra);
    slots -= extra.length;
  }

  return result.slice(0, 20);
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok Username Generator?",
    a: "A TikTok Username Generator is a free tool that creates unique, memorable, and brandable username ideas based on your niche, name, content style, and tone. It applies proven naming strategies — including word combinations, abstract branding, and niche-specific patterns — to help you build a recognizable identity on TikTok without spending hours brainstorming.",
  },
  {
    q: "What makes a good TikTok username?",
    a: "A great TikTok username is easy to remember (under 14 characters if possible), easy to pronounce and spell at first glance, reflects your niche or brand, and feels clean enough to become a real brand one day. Avoid random numbers like '1234', excessive underscores, and hard-to-spell word combos. The best TikTok usernames sound like they could be a product — think 'fitlab', 'glowco', or 'lumflex'.",
  },
  {
    q: "How many characters can a TikTok username have?",
    a: "TikTok allows usernames between 2 and 24 characters, using letters, numbers, underscores, and periods. However, the most effective usernames are 6–14 characters — short enough to remember in one look, long enough to be distinctive. Avoid usernames that exceed 16 characters as they often appear truncated in comment sections and on mobile devices.",
  },
  {
    q: "Should my TikTok username match my niche?",
    a: "Yes — a niche-aligned username sends immediate brand signals to potential followers. When someone sees a username like 'fitdaily' or 'glowhub', they instantly know what kind of content to expect. This reduces the friction of a new visitor deciding whether to follow you. That said, a strong abstract brand name (like 'lumiq' or 'flexora') can work equally well if it's unique and memorable — many successful TikTok creators use abstract names that become synonymous with their personality.",
  },
  {
    q: "Can I change my TikTok username after setting it?",
    a: "Yes — TikTok allows you to change your username once every 30 days. This makes it important to choose a username you plan to stick with long-term, since changing it too often resets any brand recognition you've built. Use this generator to test multiple options before committing. Consider using the style filter tabs to compare Personal Brand vs. Niche-Based vs. Abstract options side-by-side.",
  },
  {
    q: "Does this tool check if a TikTok username is available?",
    a: "No — this generator creates username ideas and evaluates them for memorability, spellability, and brand potential, but it doesn't check live availability on TikTok. To check availability, open TikTok and try to create an account or edit your profile with the username. We recommend generating 20 ideas, shortlisting 5–8 you love, and then checking availability on TikTok directly.",
  },
  {
    q: "What are the best TikTok username ideas for different niches?",
    a: "The best TikTok usernames follow patterns proven to build strong niche brands: fitness creators do well with names like 'fitlab', 'gymhub', 'flexcore'; beauty creators with 'glowco', 'lumglow', 'bloomhq'; finance creators with 'cashlab', 'coinzone', 'wealthco'; lifestyle creators with 'vibedaily', 'myflow', 'livedaily'. The key is combining a niche core word (fit, glow, cash, vibe) with a brandable power word (lab, co, hq, daily, zone) to create a name that feels both purposeful and professional.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(item => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {index + 1}
          </span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
            {question}
          </span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Style Config ─────────────────────────────────────────────────────────────

const STYLE_COLORS: Record<StyleCategory, { badge: string; dot: string }> = {
  "Personal Brand": { badge: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800", dot: "bg-violet-500" },
  "Niche-Based":   { badge: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800", dot: "bg-blue-500" },
  "Keyword Twist": { badge: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800", dot: "bg-orange-500" },
  "Aesthetic":     { badge: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800", dot: "bg-pink-500" },
  "Bold/Viral":    { badge: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800", dot: "bg-red-500" },
  "Abstract":      { badge: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800", dot: "bg-teal-500" },
};

// ─── Username Card ────────────────────────────────────────────────────────────

function UsernameCard({
  result, index, copied, onCopy,
}: {
  result: UsernameResult;
  index: number;
  copied: boolean;
  onCopy: (u: string) => void;
}) {
  const colors = STYLE_COLORS[result.style];
  const qualityCount = [result.memorable, result.spellable, result.brandable].filter(Boolean).length;
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group">
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono font-bold text-lg text-foreground mb-2">@{result.username}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${colors.badge}`}>
            {result.style}
          </span>
          <span className="text-xs text-muted-foreground border border-border bg-muted/40 px-2 py-0.5 rounded-md font-medium">
            {result.username.length} chars
          </span>
          {result.memorable && (
            <span className="text-xs text-green-700 dark:text-green-400 flex items-center gap-0.5 font-medium">
              <Check className="w-3 h-3" /> Memorable
            </span>
          )}
          {result.spellable && (
            <span className="text-xs text-green-700 dark:text-green-400 flex items-center gap-0.5 font-medium">
              <Check className="w-3 h-3" /> Easy to Spell
            </span>
          )}
          {result.brandable && (
            <span className="text-xs text-green-700 dark:text-green-400 flex items-center gap-0.5 font-medium">
              <Check className="w-3 h-3" /> Brandable
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onCopy(result.username)}
        title={`Copy @${result.username}`}
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
          copied
            ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
            : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── All Styles Filter ────────────────────────────────────────────────────────

const ALL_STYLE_FILTERS: Array<StyleCategory | "All"> = [
  "All", "Personal Brand", "Niche-Based", "Keyword Twist", "Aesthetic", "Bold/Viral", "Abstract",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function TikTokUsernameGeneratorTool() {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState<Niche>("fitness");
  const [contentType, setContentType] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<ToneMode>("bold");
  const [keywords, setKeywords] = useState("");

  const [results, setResults] = useState<UsernameResult[]>([]);
  const [styleFilter, setStyleFilter] = useState<StyleCategory | "All">("All");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tiktok-username-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = useCallback((regen = false) => {
    if (!niche) {
      toast({ title: "Niche required", description: "Select your content niche to generate usernames.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateUsernames(name, niche, contentType, audience, tone, keywords);
      setResults(generated);
      setStyleFilter("All");
      setIsGenerating(false);
      setHasGenerated(true);
      if (!regen) {
        setTimeout(() => document.getElementById("username-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }, 480);
  }, [name, niche, contentType, audience, tone, keywords, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyUsername = (username: string, index: number) => {
    navigator.clipboard.writeText(`@${username}`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const copyAll = () => {
    const visible = filtered.map(r => `@${r.username}`).join("\n");
    navigator.clipboard.writeText(visible);
    setCopiedAll(true);
    toast({ title: "Usernames copied!", description: `${filtered.length} usernames copied to clipboard.`, duration: 2000 });
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const filtered = styleFilter === "All" ? results : results.filter(r => r.style === styleFilter);

  // Count per style for tab badges
  const styleCounts = ALL_STYLE_FILTERS.reduce((acc, s) => {
    acc[s] = s === "All" ? results.length : results.filter(r => r.style === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* ── Input Card ──────────────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Your Name / Nickname{" "}
                <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sarah, Mike, Alex"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Add your name to get personalized username ideas based on it.</p>
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Niche / Industry <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNiche(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      niche === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {NICHE_EMOJIS[value]} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type + Audience */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Content Type{" "}
                  <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={contentType}
                  onChange={e => setContentType(e.target.value)}
                  placeholder="e.g. tips, vlogs, reviews, tutorials"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Target Audience{" "}
                  <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. beginners, moms, students"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Username Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTone(value)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      tone === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Keywords{" "}
                <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <Input
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="e.g. gains, strength, nutrition, workout"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Enter 1–3 keywords to weave into your username variations.</p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isGenerating}
              className="w-full h-14 text-lg rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              {isGenerating
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Usernames...</>
                : <><AtSign className="mr-2 h-5 w-5" /> Generate TikTok Usernames</>
              }
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ────────────────────────────────────────────────── */}
      {hasGenerated && results.length > 0 && (
        <section id="username-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Header + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Generated Usernames
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {results.length} ideas · Evaluated for memorability, spellability &amp; brand potential
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyAll}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  copiedAll
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                }`}
              >
                {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy All
              </button>
              <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold">
                <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Style filter tabs */}
          <div className="flex flex-wrap gap-2">
            {ALL_STYLE_FILTERS.map(s => {
              const count = styleCounts[s] || 0;
              if (s !== "All" && count === 0) return null;
              const isActive = styleFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStyleFilter(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {s !== "All" && <span className={`w-2 h-2 rounded-full ${STYLE_COLORS[s as StyleCategory].dot}`} />}
                  {s}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Username list */}
          <div className="space-y-2">
            {filtered.map((result, i) => (
              <UsernameCard
                key={`${result.username}-${i}`}
                result={result}
                index={i}
                copied={copiedIndex === i}
                onCopy={(u) => copyUsername(u, i)}
              />
            ))}
          </div>

          {/* Quality legend */}
          <div className="flex items-center gap-4 flex-wrap px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide">Quality:</span>
            <span className="flex items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
              <Check className="w-3 h-3" /> Memorable — under 14 chars, no clutter
            </span>
            <span className="flex items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
              <Check className="w-3 h-3" /> Easy to Spell — no hard letter combos
            </span>
            <span className="flex items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
              <Check className="w-3 h-3" /> Brandable — could be a real company
            </span>
          </div>
        </section>
      )}

      {/* ── How to Use ─────────────────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Username Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Details",
              desc: "Add your name or nickname (optional), and select your niche from the 15 available categories — fitness, beauty, finance, tech, lifestyle, and more. This is the foundation of every username suggestion.",
            },
            {
              step: 2,
              title: "Customize Your Style",
              desc: "Choose your tone (Fun, Aesthetic, Bold, Professional, Edgy, or Minimal) and optionally add keywords, content type, and target audience. Each input guides the naming engine toward ideas that match your brand personality.",
            },
            {
              step: 3,
              title: "Generate 20 Username Ideas",
              desc: "Click Generate and instantly get 20 username ideas across 6 style categories: Personal Brand, Niche-Based, Keyword Twist, Aesthetic, Bold/Viral, and Abstract. Every username is scored for memorability, spellability, and brand potential.",
            },
            {
              step: 4,
              title: "Filter, Copy, and Claim",
              desc: "Use the style filter tabs to narrow results by category. Click any username to copy it with the @ symbol included. Check availability on TikTok directly and claim your favorite before someone else does.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">{step}</div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About This Tool ────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Username Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What Makes a TikTok Username Great
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A TikTok username is the single piece of text that follows you everywhere on the platform — in search results, comment sections, Duets, Stitches, and on your profile. Most creators make the mistake of choosing a username based on availability alone, settling for something like "user847261" or "johnsmith_official_2023". These usernames are invisible. They're impossible to remember after one glance, they don't communicate your niche, and they actively hurt your ability to build a recognizable brand.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The best TikTok usernames pass three instant tests. First, can someone remember it the next day without writing it down? Second, can they spell it correctly on their first try without autocorrect? Third, does it sound like a real brand — something that could appear on a product, a website, or a business card? If a username fails even one of these tests, it will leak follower conversions and slow your growth, even if your content is excellent.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The most effective naming strategy combines a strong niche signal with a modern branding pattern. Names like "fitlab", "glowco", "cashzone", "devhub", or "lumglow" are short (under 10 characters), immediately communicate a niche identity, and feel polished enough to scale into a full creator brand. This generator applies those same principles systematically across six naming style categories to give you 20 curated options every time you run it.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Your Username Directly Affects TikTok Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TikTok is a discovery platform. Unlike Instagram, where most of your audience comes from followers you've already converted, TikTok pushes content to people who have never heard of you — and when they see your video, the very first thing they look at after the content itself is your username. A strong username creates an instant subconscious response: "I know what this person does, and I want to see more." A weak username creates friction: "Who is this?" That fraction-of-a-second decision is the difference between a follower and a missed opportunity.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your username also affects searchability. When someone hears about you from a friend and tries to find you, they'll search your username. If it's long, has numbers, or is hard to spell, they'll give up after a failed search. A clean, memorable username like "sarahfitdaily" or "glowlab" is effectively a word-of-mouth SEO asset — every person who recommends you verbally becomes a growth channel when your name is easy to say and spell.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Brand longevity is the third dimension. The creators who build multi-million-dollar businesses from TikTok almost always have usernames that work equally well as business names. "Gymshark" started as a TikTok/social presence. "Duolingo" became a TikTok sensation partly because its name is a clean, memorable brand. If you want to eventually build a product, course, newsletter, or merchandise line, your username should be something you'd be proud to put on a logo. This generator's Abstract and Niche-Based categories are specifically designed to produce names with that kind of scalability.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This TikTok Username Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Generates 20 unique username ideas in under a second",
                "Covers 6 naming style categories for maximum variety",
                "Evaluates every username for memorability, spellability, and brand potential",
                "Personalizes suggestions when you enter your name",
                "15 niche presets with niche-specific word banks built in",
                "6 tone settings: Fun, Aesthetic, Bold, Professional, Edgy, Minimal",
                "Style filter tabs to sort by Personal Brand, Aesthetic, Bold, and more",
                "Keyword field to weave your own words into username combinations",
                "One-click copy with @ symbol included for instant use",
                "100% free — no account, no limits, results in seconds",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Accordion ──────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} question={item.q} answer={item.a} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
