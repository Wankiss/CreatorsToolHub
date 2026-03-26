import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Copy, Check, RefreshCw, Search, Heart, Shuffle,
  ChevronDown, Zap, TrendingUp, Shield, ListChecks, ExternalLink, ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Style = "Professional" | "Creative" | "Fun" | "Minimalist" | "Brandable" | "Techy" | "Educational";
type Length = "short" | "medium" | "brandable";
type Group = "Brandable Names" | "Keyword Names" | "Creative Names";

interface NameResult {
  id: string;
  name: string;
  group: Group;
}

interface FormState {
  niche: string;
  style: Style;
  audience: string;
  includeKeyword: boolean;
  length: Length;
}

// ─── Word Banks ───────────────────────────────────────────────────────────────

const STYLE_SUFFIXES: Record<Style, string[]> = {
  Professional: ["Hub", "Studio", "Labs", "Media", "Group", "Pro", "Works", "Experts", "Academy", "HQ"],
  Creative:     ["Pulse", "Nova", "Spark", "Wave", "Forge", "Bloom", "Craft", "Rise", "Flow", "Drift"],
  Fun:          ["Zone", "Squad", "Crew", "World", "Mania", "Party", "Gang", "Ville", "Fam", "Camp"],
  Minimalist:   ["Co", "Lab", "HQ", "Base", "Spot", "Space", "Kit", "Room", "Desk", "Nest"],
  Brandable:    ["ify", "iq", "ux", "ra", "ix", "ora", "elo", "aro", "io", "ly"],
  Techy:        ["Tech", "Digital", "Code", "Byte", "Pixel", "Stack", "Cyber", "Dev", "Net", "AI"],
  Educational:  ["Academy", "Institute", "Class", "Guide", "Mastery", "Learn", "School", "101", "Pro", "Method"],
};

const CREATIVE_PREFIXES = [
  "Pro", "Ultra", "Super", "Mega", "Hyper", "Epic", "Power", "Turbo",
  "Real", "True", "Bold", "Pure", "Raw", "Core", "Next", "Peak",
];

const BRANDABLE_SUFFIXES = ["ify", "iq", "ux", "ra", "ix", "ora", "elo", "aro", "io", "ly", "ova", "zap", "snap", "hub"];
const BRANDABLE_PREFIXES = ["Vid", "Tube", "Stream", "Clip", "Snap", "Viz", "Cre", "Crea", "Pro", "Flex"];

// Semantic keyword expansion
function expandNiche(niche: string): string[] {
  const base = niche.trim().toLowerCase();
  const wordMap: Record<string, string[]> = {
    gaming:   ["game", "gamer", "play", "pixel", "quest", "level", "arcade", "console"],
    tech:     ["tech", "digital", "code", "byte", "data", "cyber", "future", "smart", "ai"],
    fitness:  ["fit", "gym", "workout", "muscle", "power", "train", "iron", "strength", "health"],
    travel:   ["travel", "wander", "explore", "adventure", "journey", "roam", "globe", "voyage"],
    cooking:  ["cook", "food", "kitchen", "chef", "recipe", "taste", "flavor", "eat"],
    finance:  ["finance", "money", "invest", "wealth", "budget", "cash", "dollar", "profit"],
    beauty:   ["beauty", "glow", "style", "glam", "skin", "fashion", "look", "radiant"],
    music:    ["music", "sound", "beat", "rhythm", "tune", "audio", "melody", "vibe"],
    education:["learn", "study", "knowledge", "mind", "smart", "skill", "brain", "edu"],
    business: ["biz", "brand", "market", "growth", "startup", "hustle", "venture", "empire"],
    sports:   ["sport", "athlete", "play", "win", "champion", "compete", "team", "elite"],
    art:      ["art", "create", "design", "draw", "paint", "visual", "craft", "studio"],
    photography: ["photo", "shot", "lens", "frame", "capture", "snap", "image", "pixel"],
    pets:     ["pet", "dog", "cat", "animal", "paw", "fur", "wild", "nature"],
    diy:      ["diy", "build", "make", "craft", "create", "build", "hand", "fix"],
  };

  // Look for matching keys
  for (const [key, synonyms] of Object.entries(wordMap)) {
    if (base.includes(key) || key.includes(base)) {
      return [base, ...synonyms].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
    }
  }

  // Generic fallback: split words and return them
  const words = base.split(/\s+/).filter(Boolean);
  return [...new Set([...words, `${words[0]}er`, `${words[0]}s`])].slice(0, 6);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toTitleCase(s: string): string {
  return s.split(" ").map(capitalize).join("");
}

// ─── Name Generator ───────────────────────────────────────────────────────────

function generateNames(form: FormState, seed: number): NameResult[] {
  const { niche, style, includeKeyword, length } = form;
  if (!niche.trim()) return [];

  const keywords = expandNiche(niche);
  const primaryKw = capitalize(keywords[0]);
  const suffixes = STYLE_SUFFIXES[style];
  const results: NameResult[] = [];
  const seen = new Set<string>();

  const add = (name: string, group: Group) => {
    if (!name || seen.has(name.toLowerCase()) || name.length < 4 || name.length > 18) return;
    if (/[^a-zA-Z0-9\s]/.test(name)) return;
    seen.add(name.toLowerCase());
    results.push({ id: `${name}-${group}`, name, group });
  };

  // ── Keyword Names ──────────────────────────────────────────────────────────
  keywords.forEach((kw, i) => {
    const kwCap = capitalize(kw);
    const suf = suffixes[(i + seed) % suffixes.length];
    const suf2 = suffixes[(i + seed + 1) % suffixes.length];
    if (length === "short") {
      add(`${kwCap}${suf}`, "Keyword Names");
    } else if (length === "medium") {
      add(`${kwCap} ${suf}`, "Keyword Names");
      add(`The ${kwCap} ${suf2}`, "Keyword Names");
    } else {
      add(`${kwCap}${suf}`, "Keyword Names");
    }
  });

  // With include-keyword toggle, always include primary keyword in some names
  if (includeKeyword) {
    suffixes.forEach((suf, i) => {
      if (i > 5) return;
      add(length === "medium" ? `${primaryKw} ${suf}` : `${primaryKw}${suf}`, "Keyword Names");
    });
  }

  // ── Brandable Names ────────────────────────────────────────────────────────
  keywords.forEach((kw, i) => {
    const kwRoot = kw.slice(0, Math.min(5, kw.length));
    const suf = BRANDABLE_SUFFIXES[(i + seed) % BRANDABLE_SUFFIXES.length];
    const suf2 = BRANDABLE_SUFFIXES[(i + seed + 3) % BRANDABLE_SUFFIXES.length];
    const pre = BRANDABLE_PREFIXES[(i + seed) % BRANDABLE_PREFIXES.length];

    add(`${capitalize(kwRoot)}${suf}`, "Brandable Names");
    add(`${capitalize(kwRoot)}${suf2}`, "Brandable Names");
    add(`${pre}${capitalize(kwRoot)}`, "Brandable Names");
  });

  // Additional brandable from niche root
  const root = keywords[0].slice(0, 4);
  BRANDABLE_SUFFIXES.forEach((suf, i) => {
    if (i >= 6) return;
    add(`${capitalize(root)}${suf}`, "Brandable Names");
  });

  // ── Creative Names ─────────────────────────────────────────────────────────
  keywords.forEach((kw, i) => {
    const kwCap = capitalize(kw);
    const pre = CREATIVE_PREFIXES[(i + seed) % CREATIVE_PREFIXES.length];
    const pre2 = CREATIVE_PREFIXES[(i + seed + 2) % CREATIVE_PREFIXES.length];
    const suf = suffixes[(i + seed + 2) % suffixes.length];

    if (length === "medium") {
      add(`${pre} ${kwCap}`, "Creative Names");
      add(`${kwCap} ${pre2}`, "Creative Names");
    } else {
      add(`${pre}${kwCap}`, "Creative Names");
      add(`${kwCap}${suf}`, "Creative Names");
    }
  });

  // Ensure we have at least 20 names total — fill from keyword combos
  if (results.length < 20) {
    const extraSuffixes = ["Central", "Nation", "Universe", "Network", "Society", "Motion", "Vault", "Force", "Stream", "Vision"];
    keywords.forEach((kw, i) => {
      const kwCap = capitalize(kw);
      const es = extraSuffixes[(i + seed) % extraSuffixes.length];
      add(length === "medium" ? `${kwCap} ${es}` : `${kwCap}${es}`, "Creative Names");
    });
  }

  // Sort by group for display
  const order: Record<Group, number> = { "Brandable Names": 0, "Keyword Names": 1, "Creative Names": 2 };
  return results.sort((a, b) => order[a.group] - order[b.group]).slice(0, 50);
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How do I choose a good YouTube channel name?",
    a: "A great YouTube channel name is short (5–15 characters), easy to spell and pronounce, relevant to your niche, and unique enough to stand out. It should work as a brand — someone should be able to hear it once and remember it. Avoid numbers, special characters, and generic phrases like 'Best Videos Ever'. Test your shortlisted names by saying them out loud and asking friends if they can spell them correctly after hearing them once.",
  },
  {
    q: "Should my YouTube channel name include keywords?",
    a: "Including a niche keyword in your channel name can improve discoverability — when people search for 'fitness tips', a channel named 'FitnessForge' appears more relevant than 'JohnSmith123'. However, pure keyword names like 'YouTubeFitnessVideos2024' look spammy and damage brand credibility. The best approach is a hybrid: a brandable name that contains or implies the niche keyword, like 'FitPulse' or 'IronCraft'.",
  },
  {
    q: "How long should a YouTube channel name be?",
    a: "The ideal YouTube channel name is 5–15 characters for a single word, or 2–4 words if using a multi-word name. Shorter names are easier to remember, type, and fit in YouTube search results without being truncated. YouTube displays channel names in constrained spaces across search, subscriptions, and notifications — names over 20 characters often get cut off.",
  },
  {
    q: "What makes a channel name 'brandable'?",
    a: "A brandable channel name feels like a real brand rather than a description. It has a distinct sound, is easy to pronounce, and evokes positive associations with the niche without being a literal description. Invented words like 'Tubora', 'Streamiq', and 'Fitora' are highly brandable — they're unique, ownable, and impossible to confuse with competitors. Brandable names also make better usernames across other social platforms when you expand beyond YouTube.",
  },
  {
    q: "Can I change my YouTube channel name later?",
    a: "Yes — you can change your YouTube channel name at any time in YouTube Studio under Settings → Channel → Basic Info. However, changing your name after building an audience creates confusion and can temporarily affect your search rankings as YouTube updates its index. Choose a name you're comfortable growing into for several years. If you're early-stage, experiment freely — but once you hit 1,000+ subscribers, stability matters more.",
  },
  {
    q: "Should my YouTube name match my username on other platforms?",
    a: "Ideally, yes. Consistent branding across YouTube, Instagram, TikTok, Twitter, and your website makes it easier for fans to find you everywhere and strengthens brand recognition. Before committing to a channel name, check that the username is available on the platforms you plan to use. A name that's free on YouTube but taken on Instagram forces you to use inconsistent handles, which fragments your brand.",
  },
  {
    q: "How many YouTube channel name ideas should I generate before deciding?",
    a: "Generate at least 20–30 candidates, then narrow to 5–10 favorites. For each finalist, check: (1) Is it taken on YouTube? (2) Is the domain available? (3) Is the username available on Instagram, TikTok, and Twitter? (4) Does it pass the 'radio test' — can someone spell it after hearing it once? (5) Does it still feel right for your niche in 3–5 years? Our generator creates 20–50 names per session — use the Regenerate button to get fresh variations.",
  },
  {
    q: "What YouTube channel name styles work best for different niches?",
    a: "Tech and business channels benefit from professional or techy styles (names like 'ByteForge', 'CodeStack', 'StartupLabs'). Fitness and lifestyle channels work well with energetic, motivational names ('IronPulse', 'FitNova', 'PowerCraft'). Entertainment and gaming channels suit fun, playful names ('GameSquad', 'PlayZone', 'LevelCrew'). Educational channels often use authority-signaling words ('MasterClass', 'ExpertHub', 'KnowledgeBase'). Use the Style dropdown in our generator to match name tone to your content.",
  },
  {
    q: "Is this YouTube channel name generator free?",
    a: "Yes — the YouTube Channel Name Generator is completely free with no account, no signup, and unlimited uses. Generate as many name ideas as you need, save your favorites, and use the Shuffle and Regenerate buttons to explore different combinations. All name generation happens instantly in your browser.",
  },
  {
    q: "How do I check if a YouTube channel name is available?",
    a: "Click the 'Search YouTube' button next to any generated name to instantly search YouTube for that name. If no channel with that exact name appears in the results, it's likely available. For a complete availability check, also verify the name as a domain (e.g. channelname.com) and as a username on Instagram and TikTok. You can also type the name directly into YouTube's search bar — if no exact-match channel appears, you're clear to use it.",
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

// ─── Name Card ────────────────────────────────────────────────────────────────

const GROUP_COLORS: Record<Group, string> = {
  "Brandable Names": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "Keyword Names":   "bg-primary/10 text-primary border-primary/20",
  "Creative Names":  "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
};

function NameCard({
  result,
  favorited,
  copiedId,
  onCopy,
  onFavorite,
}: {
  result: NameResult;
  favorited: boolean;
  copiedId: string | null;
  onCopy: (name: string, id: string) => void;
  onFavorite: (id: string) => void;
}) {
  return (
    <div className="group flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => onFavorite(result.id)}
          className={`flex-shrink-0 transition-colors ${favorited ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}
          aria-label="Save to favorites"
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
        </button>
        <div className="min-w-0">
          <p className="font-bold text-foreground text-sm truncate">{result.name}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${GROUP_COLORS[result.group]}`}>
            {result.group.replace(" Names", "")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onCopy(result.name, result.id)}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
          title="Copy name"
        >
          {copiedId === result.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copiedId === result.id ? "Copied" : "Copy"}</span>
        </button>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(result.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Search on YouTube"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STYLES: Style[] = ["Professional", "Creative", "Fun", "Minimalist", "Brandable", "Techy", "Educational"];

const STYLE_DESCRIPTIONS: Record<Style, string> = {
  Professional: "Studio · Hub · Labs · Pro",
  Creative:     "Pulse · Nova · Forge · Bloom",
  Fun:          "Zone · Squad · Crew · Mania",
  Minimalist:   "Co · Lab · HQ · Spot",
  Brandable:    "Invented · Unique · Ownable",
  Techy:        "Tech · Digital · Code · Byte",
  Educational:  "Academy · Guide · Mastery",
};

export function YouTubeChannelNameGeneratorTool() {
  const [form, setForm] = useState<FormState>({
    niche: "", style: "Creative", audience: "", includeKeyword: true, length: "medium",
  });
  const [results, setResults] = useState<NameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [nicheError, setNicheError] = useState("");
  const [activeGroup, setActiveGroup] = useState<Group | "All" | "Favorites">("All");
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Inject FAQ JSON-LD schema
  useEffect(() => {
    const id = "faq-schema-yt-channel-name-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const runGenerate = useCallback((currentSeed: number) => {
    if (!form.niche.trim()) { setNicheError("Channel niche is required."); return; }
    setNicheError("");
    setLoading(true);
    setTimeout(() => {
      setResults(generateNames(form, currentSeed));
      setLoading(false);
      setActiveGroup("All");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }, 500);
  }, [form]);

  const handleGenerate = () => { const s = seed; runGenerate(s); };

  const handleRegenerate = () => {
    const next = seed + 1;
    setSeed(next);
    runGenerate(next);
  };

  const handleShuffle = () => {
    setResults(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleCopy = useCallback((name: string, id: string) => {
    navigator.clipboard.writeText(name).then(() => {
      setCopiedId(id);
      toast({ title: "Copied!", description: `"${name}" copied to clipboard.` });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [toast]);

  const handleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const groups: Group[] = ["Brandable Names", "Keyword Names", "Creative Names"];
  const filteredResults =
    activeGroup === "Favorites" ? results.filter(r => favorites.has(r.id)) :
    activeGroup === "All" ? results :
    results.filter(r => r.group === activeGroup);

  const groupCounts = {
    All: results.length,
    "Brandable Names": results.filter(r => r.group === "Brandable Names").length,
    "Keyword Names": results.filter(r => r.group === "Keyword Names").length,
    "Creative Names": results.filter(r => r.group === "Creative Names").length,
    Favorites: favorites.size,
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Niche */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Channel Niche *
            </label>
            <Input
              value={form.niche}
              onChange={e => { setForm(f => ({ ...f, niche: e.target.value })); setNicheError(""); }}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. gaming, fitness, tech reviews, cooking, travel…"
              className={`rounded-xl h-11 text-sm ${nicheError ? "border-destructive" : ""}`}
            />
            {nicheError && <p className="text-xs text-destructive mt-1">{nicheError}</p>}
          </div>

          {/* Style + Length */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Channel Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, style: s }))}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      form.style === s
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <div className="font-bold">{s}</div>
                    <div className="font-normal text-[10px] opacity-70 mt-0.5 truncate">{STYLE_DESCRIPTIONS[s]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Name Length
                </label>
                <div className="flex gap-2">
                  {(["short", "medium", "brandable"] as Length[]).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, length: l }))}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        form.length === l
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {l === "short" ? "Short" : l === "medium" ? "Medium" : "Invented"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {form.length === "short" ? "Single-word names (e.g. VidForge, Streamly)" :
                   form.length === "medium" ? "Two-word names (e.g. Creator Hub, Tech Lab)" :
                   "Invented brand names (e.g. Vidara, Tubora)"}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Target Audience (Optional)
                </label>
                <Input
                  value={form.audience}
                  onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                  placeholder="e.g. beginners, entrepreneurs, gamers…"
                  className="rounded-xl h-9 text-sm"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setForm(f => ({ ...f, includeKeyword: !f.includeKeyword }))}
                  className={`w-10 h-5.5 rounded-full border-2 transition-colors flex items-center ${
                    form.includeKeyword ? "bg-primary border-primary" : "bg-muted border-muted-foreground/30"
                  }`}
                  style={{ height: "22px" }}
                  role="checkbox"
                  aria-checked={form.includeKeyword}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${form.includeKeyword ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Always include niche keyword in names
                </span>
              </label>
            </div>
          </div>

          {/* Generate */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          >
            {loading ? (
              <><span className="animate-spin">✦</span> Generating…</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate Channel Names</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {results.length > 0 && (
        <div ref={resultsRef} className="mt-6 animate-in slide-in-from-bottom-4 duration-500 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(["All", ...groups, "Favorites"] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    activeGroup === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {g} <span className="opacity-70 ml-1">{groupCounts[g]}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShuffle} className="gap-1.5 rounded-xl text-xs">
                <Shuffle className="w-3.5 h-3.5" /> Shuffle
              </Button>
              <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading} className="gap-1.5 rounded-xl text-xs">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Regenerate
              </Button>
            </div>
          </div>

          {/* Results list */}
          {filteredResults.length > 0 ? (
            <div className="space-y-2">
              {filteredResults.map(r => (
                <NameCard
                  key={r.id}
                  result={r}
                  favorited={favorites.has(r.id)}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                  onFavorite={handleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border">
              <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-foreground">No favorites saved yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click the heart icon next to any name to save it here.</p>
            </div>
          )}
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Channel Name Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Channel Niche", desc: "Type your channel topic into the niche field — for example 'fitness', 'tech reviews', 'travel vlog', or 'personal finance'. The generator uses your niche to expand related keywords and build names that feel native to your content area." },
            { step: 2, title: "Choose Your Style and Length", desc: "Select one of seven naming styles (Professional, Creative, Fun, Minimalist, Brandable, Techy, or Educational) and your preferred name length (Short single-word, Medium two-word, or Invented brandable). Toggle 'Always include niche keyword' to ensure your niche appears in every generated name." },
            { step: 3, title: "Click 'Generate Channel Names'", desc: "Hit Generate and the tool instantly creates 20–50 unique name ideas grouped into three categories: Brandable Names (invented, ownable words), Keyword Names (niche keyword + branding word), and Creative Names (evocative combinations). Use the filter tabs to browse each group separately." },
            { step: 4, title: "Save Favorites, Copy, and Check Availability", desc: "Click the heart icon to save names you love to your Favorites tab. Hit Copy to grab a name to your clipboard. Click Search to instantly search YouTube for that name and check if any channel already uses it. Use Shuffle or Regenerate to discover new combinations." },
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

      {/* ── About This Tool ──────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Channel Name Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Your YouTube Channel Name Is Your Most Important Brand Asset
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your YouTube channel name is the foundation of everything you build as a creator. It's
              the first thing a viewer sees when they discover your content, the name they search when
              they want to find you again, and the brand you carry across every platform where you promote
              your videos. A weak channel name is one of the most common and most fixable reasons channels
              struggle to build a loyal audience. A strong channel name makes people remember you, trust
              your brand, and actively recommend you to others.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The best YouTube channel names share five characteristics: they are short and easy to
              pronounce; they clearly imply the content category; they are unique enough to search for
              directly; they work as a brand name across Instagram, TikTok, and your website domain;
              and they age well — they sound just as relevant in five years as they do today. Generic,
              keyword-stuffed names like "BestYouTubeTechVideos2024" signal a hobbyist, while names
              like "TechPulse" or "ByteForge" signal a serious creator with a real brand.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Naming Strategies: From Keyword Names to Brandable Inventions
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              There are three distinct strategies for naming a YouTube channel, each with different
              trade-offs between discoverability and brand strength. Keyword names (like "FitnessLab"
              or "TechExplained") are immediately understood and slightly easier to rank for in YouTube
              search — viewers know exactly what to expect. The downside is that keyword names are
              crowded spaces; hundreds of channels may use similar combinations.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Creative hybrid names (like "IronPulse" or "CodeNation") balance recognizability with
              uniqueness. They use evocative words that suggest the niche without being literal — a
              fitness channel named "IronPulse" communicates strength and energy without just saying
              "fitness". These names are harder for competitors to copy and easier to trademark.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Brandable invented names (like "Tubora", "Streamiq", or "Fitora") are the highest-risk,
              highest-reward strategy. They have no inherent meaning, but they are 100% unique,
              completely ownable across all platforms, and effortlessly memorable once a viewer
              encounters your content twice. YouTube's biggest channels — MrBeast, Veritasium,
              Kurzgesagt — all use invented or non-descriptive names that have become powerful brands
              through content quality alone.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> SEO Tips for YouTube Channel Names
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube treats your channel name as a ranking signal. Including your primary niche keyword
              in your channel name can give a small but measurable SEO boost — particularly in early
              discovery before your channel has enough authority to rank on content alone. A fitness
              channel named "FitnessForge" will appear in fitness-related searches more readily than
              one named "JohnSmith" with no topical signal in the name itself.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              However, avoid making your channel name too keyword-heavy. Names like "Best Fitness
              YouTube Channel 2024" look spammy to both viewers and the algorithm. The sweet spot is
              a 1–2 word name that either contains the niche keyword or strongly implies it. Use our
              generator with the "Always include niche keyword" toggle to explore names that blend
              keyword relevance with brandability. Pair a strong channel name with an optimized
              channel description and{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                keyword-rich video descriptions
              </Link>{" "}
              generated by our{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube Description Generator
              </Link>{" "}
              for the best SEO results. Then craft compelling{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                video titles
              </Link>{" "}
              and optimized{" "}
              <Link href="/tools/youtube-thumbnail-downloader" className="text-primary hover:underline font-medium">
                thumbnails
              </Link>{" "}
              to complete your channel's professional presence.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Channel Name Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Generates 20–50 unique names per session — never run out of ideas",
                "Three name groups: Brandable, Keyword, and Creative for different strategies",
                "Seven naming styles to match your content tone and audience",
                "Niche keyword expansion — the generator understands your content area",
                "Save favorites with the heart icon for easy shortlist comparison",
                "One-click YouTube search to check name availability instantly",
                "Shuffle button randomizes name order for fresh perspective",
                "Regenerate with variation — each session produces different results",
                "Works for any niche — gaming, tech, fitness, beauty, business, and more",
                "100% free, no account required, unlimited name generation",
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

      {/* ── Related YouTube Tools ─────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related YouTube Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "YouTube Video Idea Generator", path: "/tools/youtube-video-idea-generator", desc: "Generate your first viral video ideas once your channel name and brand are set." },
            { name: "YouTube Script Generator", path: "/tools/youtube-script-generator", desc: "Write full video scripts with hooks, body, and CTAs to bring your channel to life." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Craft SEO-optimized descriptions for every video on your new channel." },
            { name: "YouTube Hashtag Generator", path: "/tools/youtube-hashtag-generator", desc: "Generate niche hashtags that help your new channel's videos get discovered faster." },
          ].map(({ name, path, desc }) => (
            <a key={path} href={path} className="group flex items-start gap-4 p-4 rounded-2xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ Accordion ────────────────────────────────────── */}
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
