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
const ABSTRACT_SUFFIXES = ["ora", "iq", "ix", "ly", "io", "ify", "ova", "ara", "ex", "ell", "able", "ette"];

// ─── Quality Evaluator ────────────────────────────────────────────────────────

function evaluateUsername(u: string): { memorable: boolean; spellable: boolean; brandable: boolean } {
  const len = u.length;
  const memorable =
    len >= 4 && len <= 14 &&
    !/\d{3,}/.test(u) &&
    !/(.)\1\1/.test(u);

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
        { username: `${nameFirst}gram`, style: "Personal Brand" },
        { username: `${nameFirst}studio`, style: "Personal Brand" },
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
    { username: `${w1}gram`, style: "Niche-Based" },
    { username: `${w1}studio`, style: "Niche-Based" },
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
    { username: `${w1}ify`, style: "Keyword Twist" },
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
    { username: `${w1}edit`, style: "Aesthetic" },
  );
  if (tone === "minimal" || tone === "aesthetic") {
    pool.push(
      { username: `_${w1}_`, style: "Aesthetic" },
      { username: `${w1}.co`, style: "Aesthetic" },
    );
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
    { username: `${w1}squad`, style: "Bold/Viral" },
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
    { username: `${w1}ova`, style: "Abstract" },
    { username: `${ap1}${w3}`, style: "Abstract" },
    { username: `${w2}${as2}`, style: "Abstract" },
    { username: `${ap2}${w1}`, style: "Abstract" },
    { username: `${w1}ara`, style: "Abstract" },
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
    const u = item.username.replace(/[^a-z0-9._]/g, "").slice(0, 30);
    const uClean = u.replace(/[._]/g, "");
    if (!uClean || uClean.length < 4 || seen.has(uClean)) continue;
    seen.add(uClean);
    const { memorable, spellable, brandable } = evaluateUsername(uClean);
    const passCount = [memorable, spellable, brandable].filter(Boolean).length;
    if (passCount >= 2) {
      scored.push({ username: u.replace(/[._]/g, ""), style: item.style, memorable, spellable, brandable });
    }
  }

  const byStyle = new Map<StyleCategory, UsernameResult[]>();
  for (const r of scored) {
    if (!byStyle.has(r.style)) byStyle.set(r.style, []);
    byStyle.get(r.style)!.push(r);
  }

  const styles: StyleCategory[] = ["Personal Brand", "Niche-Based", "Keyword Twist", "Aesthetic", "Bold/Viral", "Abstract"];
  const result: UsernameResult[] = [];

  for (const style of styles) {
    result.push(...(byStyle.get(style) || []).slice(0, 3));
  }

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
    q: "What is an Instagram Username Generator?",
    a: "An Instagram Username Generator is a free tool that creates unique, memorable, and brandable Instagram handle ideas based on your niche, name, content style, and tone. It applies proven naming strategies — including name-based combinations, niche-keyword mashups, aesthetic formats, abstract brand names, and bold viral handles — to help you build a recognizable identity on Instagram without spending hours brainstorming. Each username is evaluated for memorability, spellability, and brand potential so you can choose with confidence.",
  },
  {
    q: "What makes a good Instagram username?",
    a: "A great Instagram username is easy to remember (14 characters or fewer is ideal), easy to spell at first glance without ambiguity, reflects your niche or personal brand, and feels clean enough to scale into a real brand one day. Avoid random numbers like '1234', double underscores, hard-to-spell mashups, and names that are too generic (like 'lifestyle123'). The best Instagram usernames work like a brand — think 'glowco', 'fitlab', 'vibedaily', or 'luxora' — instantly communicating what you're about while remaining uniquely yours.",
  },
  {
    q: "How many characters can an Instagram username have?",
    a: "Instagram allows usernames between 1 and 30 characters, using letters, numbers, underscores, and periods. However, the most effective usernames are 8–16 characters — short enough to be remembered after seeing it once, long enough to feel distinctive and professional. Usernames over 20 characters are often truncated in comment sections on mobile and look cluttered next to the @ symbol. This generator focuses on generating handles in the sweet spot of 6–16 characters for maximum readability.",
  },
  {
    q: "Should my Instagram username match my niche?",
    a: "Yes — a niche-aligned username sends immediate brand signals to every profile visitor. When someone sees '@fitlab' or '@glowco' in a post or story mention, they instantly know what kind of content to expect. This reduces the decision friction for new visitors deciding whether to follow you. That said, a strong abstract brand name — like 'lumora' or 'velglow' — can work equally well if it sounds distinctive and memorable. Many of the most successful Instagram creators use abstract brand names that simply become synonymous with their personality and content style over time.",
  },
  {
    q: "Can I change my Instagram username after setting it?",
    a: "Yes — Instagram allows you to change your username at any time. Unlike TikTok's 30-day cooldown, Instagram places no time restriction on username changes. However, changing your username frequently resets the brand recognition you've built, since your old handle stops resolving and anyone who had it saved in bios or captions will have broken links. Use this generator to find a username you're genuinely excited about before committing. Consider generating several rounds using the Regenerate button, then shortlist 5–8 options before making a final decision.",
  },
  {
    q: "Does this tool check if an Instagram username is available?",
    a: "No — this generator creates username ideas and evaluates them for memorability, spellability, and brand potential, but it does not check live availability on Instagram. To verify availability, open Instagram and attempt to update your username in Settings → Account → Username. We recommend generating 20 ideas, shortlisting 5–8 you genuinely love, and checking each on Instagram directly. If a handle is taken, look for a close variant — adding your niche word, swapping a vowel, or appending a power suffix like '.co', 'hq', or 'daily' often unlocks the same brand feel.",
  },
  {
    q: "What are the best Instagram username ideas for different niches?",
    a: "The best niche-aligned Instagram usernames follow patterns that build instant brand recognition: fitness creators thrive with names like 'fitlab', 'gymhub', 'flexcore', 'liftdaily'; beauty creators with 'glowco', 'lumglow', 'bloomhq', 'glossify'; finance creators with 'cashlab', 'coinzone', 'wealthco', 'stackhq'; lifestyle creators with 'vibedaily', 'myflow', 'livedaily', 'chillco'; food creators with 'eatfresh', 'chefco', 'tastehub', 'bitelab'. The formula is simple: combine a core niche word with a brandable power suffix (lab, co, hq, daily, zone, hub, studio) to create a handle that feels both purposeful and distinctly professional.",
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

// ─── Style Filter ─────────────────────────────────────────────────────────────

const ALL_STYLE_FILTERS: Array<StyleCategory | "All"> = [
  "All", "Personal Brand", "Niche-Based", "Keyword Twist", "Aesthetic", "Bold/Viral", "Abstract",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function InstagramUsernameGeneratorTool() {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState<Niche>("fitness");
  const [contentType, setContentType] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<ToneMode>("aesthetic");
  const [keywords, setKeywords] = useState("");

  const [results, setResults] = useState<UsernameResult[]>([]);
  const [styleFilter, setStyleFilter] = useState<StyleCategory | "All">("All");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-ig-username-gen";
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
        setTimeout(() => document.getElementById("ig-username-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
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

  const styleCounts = ALL_STYLE_FILTERS.reduce((acc, s) => {
    acc[s] = s === "All" ? results.length : results.filter(r => r.style === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* ── Input Card ───────────────────────────────────────────── */}
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
                placeholder="e.g. Emma, Jake, Alex"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Add your name to get personalized username ideas built around it.</p>
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
                  Content Style{" "}
                  <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={contentType}
                  onChange={e => setContentType(e.target.value)}
                  placeholder="e.g. reels, photography, tutorials"
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
                placeholder="e.g. glow, skin, radiant, wellness"
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
                : <><AtSign className="mr-2 h-5 w-5" /> Generate Instagram Usernames</>
              }
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ─────────────────────────────────────────────── */}
      {hasGenerated && results.length > 0 && (
        <section id="ig-username-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

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
          <div className="space-y-3">
            {filtered.map((result, i) => (
              <UsernameCard
                key={result.username}
                result={result}
                index={i}
                copied={copiedIndex === i}
                onCopy={(u) => copyUsername(u, i)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No usernames in this style. Try regenerating or selecting a different filter.
            </div>
          )}
        </section>
      )}

      {/* ── How to Use ──────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-6">
        <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          How to Use the Instagram Username Generator
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              step: "1",
              icon: <AtSign className="w-5 h-5 text-primary" />,
              title: "Enter your name & niche",
              desc: "Type your first name or nickname (optional) and select your content niche — fitness, beauty, business, food, travel, or any of the 15 available categories.",
            },
            {
              step: "2",
              icon: <Zap className="w-5 h-5 text-primary" />,
              title: "Choose your tone & keywords",
              desc: "Pick a tone that matches your brand personality — Aesthetic, Bold, Minimal, Fun, Professional, or Edgy. Add optional keywords to personalize the results further.",
            },
            {
              step: "3",
              icon: <Sparkles className="w-5 h-5 text-primary" />,
              title: "Generate 20 username ideas",
              desc: "Click Generate and get 20 Instagram username ideas across 6 naming styles. Each handle is scored for memorability, spellability, and brand potential.",
            },
            {
              step: "4",
              icon: <Copy className="w-5 h-5 text-primary" />,
              title: "Filter, copy & go",
              desc: "Use the style filter tabs to browse by category. Click any username to copy it instantly. Use Regenerate for a fresh batch if you want more options.",
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Step {step}</p>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / SEO ─────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-8">
        <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Instagram Username Generator — Find the Perfect Handle for Your Brand
        </h2>

        <div className="space-y-6 text-muted-foreground leading-relaxed text-sm">

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">What Makes a Perfect Instagram Username?</h3>
            <p className="mb-3">
              Your Instagram username is the single most permanent element of your presence on the platform.
              It appears in every comment you leave, every Story mention, every Reel credit, every tagged post,
              and every link someone shares. Unlike your bio, your profile photo, or your content style —
              which can evolve freely — your username is the anchor of your entire Instagram identity. Getting
              it right the first time prevents the painful process of rebuilding brand recognition after a change.
            </p>
            <p className="mb-3">
              A perfect Instagram username satisfies five criteria simultaneously. First, it is <strong className="text-foreground">memorable</strong> — a
              visitor who sees it once in a comment section should be able to recall it when searching for you
              hours later. This typically means keeping it under 14 characters and avoiding complex consonant
              clusters. Second, it is <strong className="text-foreground">spellable at first glance</strong> — if
              someone hears your username spoken aloud, they should be able to type it correctly. Unconventional
              spellings might feel creative, but they create constant friction when someone tries to tag you.
            </p>
            <p className="mb-3">
              Third, a great username carries <strong className="text-foreground">brand potential</strong> —
              it should be versatile enough to grow beyond Instagram into a YouTube channel name, a Substack
              newsletter, a product line, or a business entity without feeling out of place. Fourth, it has
              <strong className="text-foreground"> niche signal</strong> — even if subtle, it communicates the
              general territory of your content. And fifth, it has <strong className="text-foreground">shelf life</strong> —
              it will still feel relevant in five years when your following is ten times larger.
            </p>
            <p>
              This generator evaluates every username it creates against three of these five criteria —
              memorability, spellability, and brand potential — and only surfaces handles that pass at least
              two out of three thresholds. You see the rating for each result as individual badges, so you can
              make an informed choice rather than guessing.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">The 6 Instagram Username Styles Explained</h3>
            <p className="mb-3">
              Not all username strategies work equally well for every creator. The generator structures output
              across six proven naming styles, each serving a different brand objective:
            </p>
            <ul className="space-y-3">
              <li>
                <strong className="text-foreground">Personal Brand</strong> — Your name combined with a niche
                word or power suffix. Examples: <em>emmafitco</em>, <em>jakegrows</em>, <em>alexglowhq</em>.
                Best for creators building a personal brand where their name becomes synonymous with their content.
                Ideal if you plan to be the face of your brand long-term and have a name that's easy to spell.
              </li>
              <li>
                <strong className="text-foreground">Niche-Based</strong> — Directly tied to your topic or
                industry. Examples: <em>fitdaily</em>, <em>glowlab</em>, <em>cashzone</em>. Best for content
                accounts that may grow beyond one specific person — think media brands, resource accounts,
                or topic-centric pages that post consistently about one subject.
              </li>
              <li>
                <strong className="text-foreground">Keyword Twist</strong> — Creative mashups or variations
                of keywords from your niche. Examples: <em>flexora</em>, <em>glamify</em>, <em>fitflow</em>.
                Strikes the balance between being niche-aligned and distinctive. Strong for creators who want
                an identity that feels both descriptive and original.
              </li>
              <li>
                <strong className="text-foreground">Aesthetic</strong> — Soft, clean, minimal handles using
                suffixes like .co, ly, io, or hq. Examples: <em>glow.co</em>, <em>fitly</em>, <em>lifehq</em>.
                Best for beauty, lifestyle, fashion, and health creators whose visual brand is clean and minimal.
                These handles photograph well in bios and feel native to Instagram's design language.
              </li>
              <li>
                <strong className="text-foreground">Bold/Viral</strong> — High-energy, action-oriented names
                using prefixes like go, get, just, be, live. Examples: <em>gofit</em>, <em>liveglow</em>,
                <em>getrich</em>. Best for fitness, entertainment, and business coaches whose content is
                high-energy and action-focused. These feel motivating and direct.
              </li>
              <li>
                <strong className="text-foreground">Abstract</strong> — Unique, brandable names that don't
                directly describe the niche but feel premium and scalable. Examples: <em>lumora</em>,
                <em>velglow</em>, <em>nexfit</em>. Best for creators who want a name that can become a true
                brand — one that sounds like it could be a product, a magazine, or a studio with no
                modification required.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Instagram Username Strategy: Choosing a Handle That Grows With You</h3>
            <p className="mb-3">
              The decision between a personal-name-based handle and a niche-keyword handle is one of the most
              common dilemmas for new Instagram creators — and the right answer depends entirely on your long-term
              content strategy. If you are building a personal brand where you are the face of the content and
              you plan to expand into multiple formats (podcast, newsletter, speaking), a name-based handle
              gives you the most flexibility. Your name travels across platforms without the confusion of
              platform-specific keywords.
            </p>
            <p className="mb-3">
              If you are building a topic-centric resource account — a page dedicated to one specific subject
              like intermittent fasting, travel photography, or personal finance — a niche-based or keyword-twist
              handle tells visitors immediately what they'll get, reducing the barrier to following. Topic
              accounts often grow faster in the early stages because the value proposition is immediately
              legible from the username alone.
            </p>
            <p className="mb-3">
              Whichever style you choose, prioritize shortness over cleverness. Instagram's mobile interface
              truncates long usernames in comment sections, and the most recognizable creator brands have handles
              that are short enough to fit inside a single visual glance. Aim for 8–14 characters in your final
              handle, test it by imagining you are saying it aloud to someone at a conference, and verify that
              the exact spelling is obvious to anyone who hears it.
            </p>
            <p>
              Use the style filter tabs in the generator to compare handles across all six categories
              side-by-side. Generate multiple rounds using the Regenerate button to maximize variety. Shortlist
              5–8 options, sleep on it for a day, and check availability for each directly on Instagram. The
              right handle is the one you're still excited about in six months.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits ────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8">
        <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2 mb-6">
          <ListChecks className="w-6 h-6 text-primary" />
          Why Use This Instagram Username Generator?
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "20 unique username ideas generated per session",
            "6 proven naming styles: Personal Brand, Niche-Based, Keyword Twist, Aesthetic, Bold/Viral, Abstract",
            "Every username rated for memorability, spellability, and brand potential",
            "Personal name integration for truly personalized handles",
            "Style filter tabs to browse categories side-by-side",
            "One-click copy for each individual username",
            "Copy All button to export every visible result at once",
            "Regenerate for a fresh batch — unlimited rounds",
            "Works for all niches: fitness, beauty, business, food, travel, finance, and more",
            "100% free — no account, no credit card, no limits",
          ].map((benefit) => (
            <div key={benefit} className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border">
              <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={item.q} question={item.q} answer={item.a} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
