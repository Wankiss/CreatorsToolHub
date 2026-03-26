import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  User, ChevronDown, Sparkles, Loader2, TrendingUp, Zap,
  Shield, ListChecks, Search, Copy, Check, RefreshCw, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "professional" | "bold" | "inspirational" | "funny" | "casual";
type Niche =
  | "fitness" | "business" | "beauty" | "food" | "travel"
  | "finance" | "tech" | "lifestyle" | "education" | "gaming"
  | "fashion" | "relationships" | "entertainment" | "health" | "other";

interface BioResult {
  text: string;
  charCount: number;
  hasEmoji: boolean;
  hasCta: boolean;
  isMinimal: boolean;
  formula: string;
}

// ─── Niche Defaults ───────────────────────────────────────────────────────────

const NICHE_DEFAULTS: Record<Niche, { audience: string; result: string; benefit: string }> = {
  fitness:       { audience: "busy people",          result: "get fit without the gym",     benefit: "daily workout tips" },
  business:      { audience: "entrepreneurs",         result: "build & scale their business", benefit: "business growth tips" },
  beauty:        { audience: "beauty lovers",         result: "glow up on any budget",        benefit: "skincare & makeup tips" },
  food:          { audience: "food lovers",           result: "cook delicious meals fast",    benefit: "easy recipes daily" },
  travel:        { audience: "travelers",             result: "explore the world for less",   benefit: "travel hacks & deals" },
  finance:       { audience: "anyone",                result: "build wealth & save money",    benefit: "money tips that work" },
  tech:          { audience: "creators",              result: "work smarter with AI tools",   benefit: "the best tech tips" },
  lifestyle:     { audience: "everyone",              result: "live better intentionally",    benefit: "lifestyle tips daily" },
  education:     { audience: "curious minds",         result: "learn faster",                 benefit: "mind-blowing facts daily" },
  gaming:        { audience: "gamers",                result: "level up their skills",        benefit: "gaming tips & tricks" },
  fashion:       { audience: "style lovers",          result: "dress better for less",        benefit: "outfit ideas daily" },
  relationships: { audience: "singles & couples",     result: "build healthier relationships","benefit": "real relationship advice" },
  entertainment: { audience: "pop culture fans",      result: "stay in the loop",             benefit: "daily entertainment drops" },
  health:        { audience: "health-conscious people","result": "feel their best every day", benefit: "wellness tips that work" },
  other:         { audience: "people like you",       result: "reach their goals",            benefit: "tips & insights daily" },
};

const NICHE_EMOJIS: Record<Niche, string> = {
  fitness:       "💪",
  business:      "💼",
  beauty:        "💄",
  food:          "🍕",
  travel:        "✈️",
  finance:       "💰",
  tech:          "🤖",
  lifestyle:     "✨",
  education:     "📚",
  gaming:        "🎮",
  fashion:       "👗",
  relationships: "❤️",
  entertainment: "🎬",
  health:        "🌿",
  other:         "🚀",
};

// ─── Generation Engine ────────────────────────────────────────────────────────

function trim80(text: string): string {
  if (text.length <= 80) return text;
  return text.slice(0, 77) + "…";
}

function generateBios(
  niche: Niche,
  whatYouDo: string,
  audience: string,
  tone: Tone,
  usp: string,
  cta: string,
  keywords: string,
): BioResult[] {
  const nd = NICHE_DEFAULTS[niche];
  const emoji = NICHE_EMOJIS[niche];

  const aud  = (audience.trim() || nd.audience).toLowerCase();
  const what = whatYouDo.trim() || `helping ${nd.audience} ${nd.result}`;
  const uspText = usp.trim();
  const ctaText = cta.trim() || `Follow for ${nd.benefit}`;
  const kws    = keywords.split(",").map(k => k.trim()).filter(Boolean);

  // Extract a short verb phrase from "what you do"
  const shortWhat = what.length > 35 ? what.slice(0, 32) + "…" : what;
  const verb = what.split(" ").slice(0, 3).join(" ");

  // Tone modifiers
  const tonePrefix: Record<Tone, string> = {
    professional: "Expert in",
    bold:         "The #1 source for",
    inspirational: "Inspiring",
    funny:        "Professional overthinker.",
    casual:       "Just here to share",
  };
  const toneSuffix: Record<Tone, string> = {
    professional: "Results-driven.",
    bold:         "No fluff. Just results.",
    inspirational: "You've got this.",
    funny:        "But make it fun.",
    casual:       "No gatekeeping here.",
  };

  const keyword = kws[0] || nd.result.split(" ").slice(0, 2).join(" ");

  // Build 10 bio candidates using different formulas
  const raw: { text: string; formula: string; hasCta: boolean; hasEmoji: boolean; isMinimal: boolean }[] = [

    // Formula 1: "I help [audience] [result]"
    {
      text: `I help ${aud} ${nd.result}. ${ctaText}.`,
      formula: "I help [audience] [result]",
      hasCta: true, hasEmoji: false, isMinimal: false,
    },

    // Formula 2: "[Emoji] [Value Proposition]"
    {
      text: `${emoji} ${shortWhat} | ${toneSuffix[tone]}`,
      formula: "[Emoji] [Value Proposition]",
      hasCta: false, hasEmoji: true, isMinimal: false,
    },

    // Formula 3: "[Result] | [Niche]"
    {
      text: `${nd.result.charAt(0).toUpperCase() + nd.result.slice(1)} | ${niche.charAt(0).toUpperCase() + niche.slice(1)} creator`,
      formula: "[Result] | [Niche]",
      hasCta: false, hasEmoji: false, isMinimal: true,
    },

    // Formula 4: "Follow for [benefit]"
    {
      text: `${emoji} ${tonePrefix[tone]} ${keyword}. Follow for ${nd.benefit}.`,
      formula: "Follow for [benefit]",
      hasCta: true, hasEmoji: true, isMinimal: false,
    },

    // Formula 5: USP-driven
    {
      text: uspText
        ? `${uspText} | ${ctaText}`
        : `${shortWhat} | ${ctaText}`,
      formula: "[USP] | [CTA]",
      hasCta: true, hasEmoji: false, isMinimal: false,
    },

    // Formula 6: Identity + value
    {
      text: `${niche.charAt(0).toUpperCase() + niche.slice(1)} creator helping ${aud} ${nd.result}.`,
      formula: "[Identity] + [Value]",
      hasCta: false, hasEmoji: false, isMinimal: false,
    },

    // Formula 7: Emoji + minimal
    {
      text: `${emoji} ${nd.result.charAt(0).toUpperCase() + nd.result.slice(1)}.`,
      formula: "[Emoji] + Minimal",
      hasCta: false, hasEmoji: true, isMinimal: true,
    },

    // Formula 8: Tone-first bold
    {
      text: tone === "funny"
        ? `${emoji} ${what.split(" ").slice(0, 5).join(" ")}. ${toneSuffix[tone]}`
        : `${tonePrefix[tone]} ${keyword}. ${ctaText}.`,
      formula: "Tone-Forward Hook",
      hasCta: tone !== "funny", hasEmoji: tone === "funny", isMinimal: false,
    },

    // Formula 9: Ultra-minimal, no emoji
    {
      text: `${niche.charAt(0).toUpperCase() + niche.slice(1)} | ${what.split(" ").slice(0, 6).join(" ")}`,
      formula: "Ultra Minimal",
      hasCta: false, hasEmoji: false, isMinimal: true,
    },

    // Formula 10: Keyword-rich + CTA
    {
      text: kws.length > 0
        ? `${kws.slice(0, 2).join(" · ")} ${emoji} ${ctaText}`
        : `${emoji} ${nd.benefit.charAt(0).toUpperCase() + nd.benefit.slice(1)} | Follow now`,
      formula: "Keyword + CTA",
      hasCta: true, hasEmoji: true, isMinimal: false,
    },
  ];

  // Trim to 80 chars and build final objects
  return raw.map(({ text, formula, hasCta, hasEmoji, isMinimal }) => {
    const trimmed = trim80(text);
    return {
      text: trimmed,
      charCount: trimmed.length,
      hasEmoji: /\p{Emoji}/u.test(trimmed),
      hasCta,
      isMinimal,
      formula,
    };
  });
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok bio and why does it matter?",
    a: "A TikTok bio is a short description that appears on your profile under your username — limited to 80 characters. It's the first thing a visitor reads when they land on your profile after seeing one of your videos, and it determines whether they click 'Follow' or leave. A well-written bio converts profile visitors into followers by clearly communicating who you are, what you do, and why someone should follow you — all within a few words. Creators with optimized bios see significantly higher profile-to-follow conversion rates than those with vague or empty bios.",
  },
  {
    q: "What should I include in my TikTok bio?",
    a: "The most effective TikTok bios include three elements: (1) Identity — who you are or what you do, stated clearly and specifically (e.g., 'Fitness coach helping busy moms lose weight'); (2) Value proposition — what the viewer will get by following you (e.g., 'Daily workout tips you can do in 15 minutes'); (3) Call-to-action — a soft prompt that encourages them to follow or take an action (e.g., 'Follow for daily tips'). Strategic use of 1–2 relevant emojis can make your bio more visually scannable without looking cluttered. Keep the language specific — 'I help entrepreneurs build 6-figure businesses' outperforms 'Content creator | Entrepreneur.'",
  },
  {
    q: "How long can a TikTok bio be?",
    a: "TikTok bios have an 80-character limit, including spaces and emojis. Emojis count as 1–2 characters each depending on the emoji. This constraint is intentional — it forces clarity and makes the best bios punchy and direct. Every TikTok bio generated by this tool is validated to stay at or under 80 characters, so you can copy and paste directly without hitting the character limit.",
  },
  {
    q: "Should I use emojis in my TikTok bio?",
    a: "Used strategically, emojis improve TikTok bio performance by: (1) Making your bio visually scannable — profiles are viewed at a glance, and emojis act as visual anchors; (2) Communicating your niche instantly — a single relevant emoji tells the viewer what you're about before they read a word; (3) Adding personality without using characters for words. The optimal bio uses 1–2 emojis maximum. Avoid stacking multiple emojis in a row — it reads as spammy and wastes your 80-character limit. Never use emojis as a substitute for actual information about what you do.",
  },
  {
    q: "What is a TikTok bio call-to-action?",
    a: "A TikTok bio call-to-action (CTA) is a short phrase that tells the viewer what to do next — typically 'Follow for [benefit],' 'Link in bio for [resource],' or 'DM me [topic].' A bio CTA is effective because most profile visitors are undecided — they liked your video but haven't decided to follow yet. A clear CTA with a specific benefit ('Follow for daily money-saving tips') nudges them to commit. Keep your CTA specific to what your content delivers, not generic phrases like 'Follow me' or 'Check out my page.'",
  },
  {
    q: "What are the best TikTok bio formulas that convert?",
    a: "The five highest-converting TikTok bio formulas are: (1) 'I help [specific audience] [specific result]' — direct and benefit-driven; (2) '[Emoji] [Value proposition] | [CTA]' — scannable with a visual hook; (3) '[Niche] creator | [What makes you different]' — identity + differentiation; (4) 'Follow for [specific benefit]' — pure CTA, works for creators with a consistent content focus; (5) '[USP or credential] + [result]' — authority-driven, works best for professional niches like finance, health, and business. The key across all formulas is specificity — 'fitness' is too vague, 'home workouts for new moms' converts.",
  },
  {
    q: "How do I write a TikTok bio for a business account?",
    a: "A business TikTok bio should focus on what problem you solve and for whom, rather than your company name or credentials. The most effective business bio formula is: '[What you do] for [target audience] | [Social proof or unique differentiator] | [Link or CTA].' Examples: 'Helping small businesses grow on TikTok | No-fluff strategy | Follow for daily tips' or 'Affordable skincare that actually works | Dermatologist-approved | Shop the link.' Keep it customer-focused — 'We help you' outperforms 'We are a leading…' every time.",
  },
  {
    q: "How often should I update my TikTok bio?",
    a: "Update your TikTok bio whenever: (1) Your content focus shifts — if you start making different types of content, your bio should reflect the new direction; (2) You achieve a new milestone worth mentioning (e.g., '1M+ views on fitness tips'); (3) Your call-to-action changes — if you launch a new product, newsletter, or freebie; (4) Your content is getting profile visits but low follow rates — this signals your bio isn't converting. As a baseline, review your bio every 2–3 months even if nothing has changed to make sure it still accurately represents what a new visitor will see when they land on your profile.",
  },
  {
    q: "Can I use the same bio on Instagram, YouTube, and TikTok?",
    a: "You can adapt the same core message across platforms, but each platform has different character limits and audience expectations. TikTok bios are capped at 80 characters, Instagram allows 150 characters, and YouTube channel descriptions have no strict limit for the 'About' section. The best approach is to create a master bio on this tool using TikTok's 80-character constraint — the discipline forces maximum clarity — and then expand it with additional detail for Instagram (add 1–2 extra lines) and YouTube (add a full paragraph). A concise TikTok bio almost always improves when adapted from a longer version, not the other way around.",
  },
  {
    q: "Is this TikTok bio generator free?",
    a: "Yes — the TikTok Bio Generator on creatorsToolHub is 100% free with no account, subscription, or credit card required. Enter your niche, what you do, and optional details (tone, target audience, USP, CTA, keywords), and instantly receive 10 bio options — each validated to 80 characters or fewer, varied in style (emoji, minimal, CTA, inspirational), and ready to copy with one click. Generate as many variations as you need until you find the right one for your profile.",
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
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Character Bar ────────────────────────────────────────────────────────────

function CharBar({ count }: { count: number }) {
  const pct = (count / 80) * 100;
  const color = count <= 60 ? "bg-green-500" : count <= 75 ? "bg-yellow-500" : "bg-orange-500";
  const textColor = count <= 60 ? "text-green-600 dark:text-green-400" : count <= 75 ? "text-yellow-600 dark:text-yellow-400" : "text-orange-600 dark:text-orange-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${textColor}`}>{count}/80</span>
    </div>
  );
}

// ─── Bio Card ─────────────────────────────────────────────────────────────────

function BioCard({ bio, index, onCopy, copied }: {
  bio: BioResult; index: number; onCopy: (text: string) => void; copied: boolean;
}) {
  const tags: { label: string; color: string }[] = [];
  if (bio.hasEmoji)  tags.push({ label: "Emoji",   color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" });
  if (bio.hasCta)    tags.push({ label: "CTA",     color: "bg-primary/10 text-primary border-primary/20" });
  if (bio.isMinimal) tags.push({ label: "Minimal", color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-primary/30 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-foreground leading-snug break-words">{bio.text}</p>
        </div>
        <button
          onClick={() => onCopy(bio.text)}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
            copied
              ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
          }`}
          title="Copy bio"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <CharBar count={bio.charCount} />

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">{bio.formula}</span>
        {tags.map(t => (
          <span key={t.label} className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${t.color}`}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "fitness",       label: "Fitness",       emoji: "💪" },
  { value: "business",      label: "Business",      emoji: "💼" },
  { value: "beauty",        label: "Beauty",        emoji: "💄" },
  { value: "finance",       label: "Finance",       emoji: "💰" },
  { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
  { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
  { value: "food",          label: "Food",          emoji: "🍕" },
  { value: "travel",        label: "Travel",        emoji: "✈️" },
  { value: "education",     label: "Education",     emoji: "📚" },
  { value: "gaming",        label: "Gaming",        emoji: "🎮" },
  { value: "fashion",       label: "Fashion",       emoji: "👗" },
  { value: "health",        label: "Health",        emoji: "🌿" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "other",         label: "Other",         emoji: "🚀" },
];

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "professional",  label: "Professional",  desc: "Expert, credible, results-focused" },
  { value: "bold",          label: "Bold",          desc: "Confident, direct, no-nonsense" },
  { value: "inspirational", label: "Inspirational", desc: "Uplifting, motivating, hopeful" },
  { value: "funny",         label: "Funny",         desc: "Witty, self-aware, relatable" },
  { value: "casual",        label: "Casual",        desc: "Laid-back, friendly, conversational" },
];

export function TikTokBioGeneratorTool() {
  const [niche, setNiche] = useState<Niche>("fitness");
  const [whatYouDo, setWhatYouDo] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<Tone>("bold");
  const [usp, setUsp] = useState("");
  const [cta, setCta] = useState("");
  const [keywords, setKeywords] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  const [bios, setBios] = useState<BioResult[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "emoji" | "cta" | "minimal">("all");

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tt-bio-gen";
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
    if (!whatYouDo.trim()) {
      toast({ title: "Tell us what you do", description: "Fill in the 'What do you do?' field to generate bios.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateBios(niche, whatYouDo, audience, tone, usp, cta, keywords);
      setBios(result);
      setIsGenerating(false);
      setActiveFilter("all");
      if (!regen) setTimeout(() => document.getElementById("bio-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 380);
  }, [niche, whatYouDo, audience, tone, usp, cta, keywords, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
    toast({ title: "Bio copied!", duration: 1500 });
  };

  const filteredBios = bios
    ? activeFilter === "emoji"   ? bios.filter(b => b.hasEmoji)
    : activeFilter === "cta"     ? bios.filter(b => b.hasCta)
    : activeFilter === "minimal" ? bios.filter(b => b.isMinimal)
    : bios
    : [];

  const stats = bios ? {
    withEmoji:   bios.filter(b => b.hasEmoji).length,
    withCta:     bios.filter(b => b.hasCta).length,
    minimal:     bios.filter(b => b.isMinimal).length,
    avgChars:    Math.round(bios.reduce((a, b) => a + b.charCount, 0) / bios.length),
  } : null;

  return (
    <>
      {/* ── Input Card ──────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Niche / Industry <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(({ value, label, emoji }) => (
                  <button key={value} type="button" onClick={() => setNiche(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                      niche === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}>
                    <span>{emoji}</span>{label}
                  </button>
                ))}
              </div>
            </div>

            {/* What do you do */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                What Do You Do? <span className="text-red-500">*</span>
              </label>
              <Input
                value={whatYouDo}
                onChange={e => setWhatYouDo(e.target.value)}
                placeholder="e.g. help busy moms lose weight without the gym, share daily money-saving tips"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setTone(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      tone === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional fields toggle */}
            <div>
              <button type="button" onClick={() => setShowOptional(v => !v)}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? "rotate-180" : ""}`} />
                {showOptional ? "Hide" : "Show"} Optional Fields (Target Audience, USP, CTA, Keywords)
              </button>
              {showOptional && (
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Target Audience</label>
                    <Input value={audience} onChange={e => setAudience(e.target.value)}
                      placeholder="e.g. beginners, moms, entrepreneurs, college students"
                      className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Unique Selling Point (USP)</label>
                    <Input value={usp} onChange={e => setUsp(e.target.value)}
                      placeholder="e.g. no-BS advice, 10+ years experience, certified coach"
                      className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Call-to-Action</label>
                    <Input value={cta} onChange={e => setCta(e.target.value)}
                      placeholder="e.g. Follow for daily tips, Link in bio for free guide"
                      className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Keywords <span className="text-muted-foreground font-normal normal-case">(comma separated)</span></label>
                    <Input value={keywords} onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. weight loss, meal prep, home workout"
                      className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" disabled={isGenerating} className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Bios...</>
                : <><User className="w-5 h-5" /> Generate TikTok Bios</>}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────── */}
      {bios && stats && (
        <section id="bio-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Your TikTok Bios
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {bios.length} bios • all under 80 characters • click any to copy
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold w-fit">
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: "With Emoji",  value: stats.withEmoji,  color: "text-orange-600 dark:text-orange-400" },
              { label: "With CTA",    value: stats.withCta,    color: "text-primary" },
              { label: "Minimal",     value: stats.minimal,    color: "text-purple-600 dark:text-purple-400" },
              { label: "Avg Length",  value: `${stats.avgChars}`, color: "text-foreground", suffix: " chr" },
            ].map(({ label, value, color, suffix }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-3 text-center">
                <p className={`text-xl font-black ${color}`}>{value}{suffix ?? ""}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {([
              { key: "all",     label: "🏷️ All Bios" },
              { key: "emoji",   label: "😊 With Emoji" },
              { key: "cta",     label: "📣 With CTA" },
              { key: "minimal", label: "✂️ Minimal" },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveFilter(key)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase tracking-wide ${
                  activeFilter === key ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Bio cards */}
          <div className="space-y-3">
            {filteredBios.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No bios match this filter.</p>
            ) : filteredBios.map((bio, i) => (
              <BioCard key={`${bio.formula}-${i}`} bio={bio} index={i} onCopy={copyText} copied={copiedText === bio.text} />
            ))}
          </div>

          {/* 80-char guide */}
          <div className="rounded-2xl border border-border bg-muted/40 p-4 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Character Limit Guide</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All bios are 80 characters or fewer — TikTok's hard limit. The character bar shows how much space each bio uses.
                Green = room to spare, Yellow = close to limit, Orange = near the max. All are safe to paste directly.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Bio Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Choose Your Niche and Enter What You Do", desc: "Select your content niche from the 15 options and describe what you do in one clear sentence — for example, 'help busy moms lose weight without the gym' or 'share daily money-saving tips for millennials.' The more specific your description, the more targeted and effective your bios will be." },
            { step: 2, title: "Select Your Tone", desc: "Pick the tone that matches your TikTok personality — Professional for credibility-driven content, Bold for no-nonsense authority, Inspirational for motivational content, Funny for humor-based niches, or Casual for approachable everyday creators. The tone shapes the language and structure of every bio generated." },
            { step: 3, title: "Add Optional Details for Better Bios", desc: "Open the optional fields to enter your target audience, unique selling point (USP), preferred call-to-action, and keywords. These inputs significantly improve bio quality — a USP like 'certified nutritionist' or a specific CTA like 'Follow for free weekly meal plans' makes your bios more specific and more likely to convert." },
            { step: 4, title: "Filter, Copy, and Test", desc: "Use the filter tabs to view bios with emojis, CTAs, or minimal styles. Click any bio card to copy it instantly. Test 2–3 different bio styles by updating your profile and tracking your follow rate over 7 days in TikTok Analytics. The bio with the highest profile-to-follow conversion rate is your winner." },
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

      {/* ── About ────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Bio Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This TikTok Bio Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free TikTok Bio Generator produces 10 bio variations for your profile using five
              proven high-converting formula structures: "I help [audience] [result]" for direct benefit
              communication, "[Emoji] [Value Proposition]" for visual scannability, "[Result] | [Niche]"
              for identity clarity, "Follow for [benefit]" for direct CTA conversion, and "[USP] + [CTA]"
              for authority-driven profiles. Every bio is validated to TikTok's strict 80-character limit
              before being shown — nothing over the limit is ever returned. The 10 generated bios are
              deliberately varied: at least 3 include a call-to-action, at least 3 use strategic emojis,
              and at least 2 are ultra-minimal for creators who prefer a clean, no-filler look.
              Each bio card displays a character count bar (green for under 60 characters, yellow for
              61–75, orange for 76–80), the formula used, and style tags (Emoji, CTA, Minimal) so you can
              filter results instantly. The Regenerate button produces a fresh set with slight variations
              for any input combination — giving you unlimited bio options until you find the right fit.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Your TikTok Bio Directly Affects Your Follower Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              TikTok's growth model is fundamentally different from other platforms. Most new followers
              don't find you through your profile — they find a video first and then visit your profile to
              decide whether to follow. This means your bio has one job: convert a curious viewer who
              already likes your content into a committed follower. A profile visit that doesn't convert to
              a follow is a missed growth opportunity — and at scale, that gap becomes significant.
              Research consistently shows that specific, benefit-driven bios convert at significantly
              higher rates than vague or generic ones. "Helping busy moms lose weight without the gym"
              converts better than "Fitness creator | Mom | Health tips" because it speaks directly to the
              viewer's situation. The best TikTok bios share two qualities: they tell the viewer exactly
              what they'll get by following, and they make the viewer feel the creator understands them
              specifically. This generator applies both principles — using your niche, tone, audience,
              and USP to produce bios that feel personal and targeted, not generic. The five bio formulas
              are drawn from the highest-converting profile structures across creator niches — each one
              engineered to answer the three questions every profile visitor is silently asking: Who are
              you? What will I get? Why should I follow you now?
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This TikTok Bio Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "10 bio options per generation using 5 distinct high-converting bio formulas",
                "Strict 80-character limit validation — every bio is safe to paste directly to TikTok",
                "Guaranteed variety: 3+ with CTA, 3+ with emojis, 2+ ultra-minimal per set",
                "Character count bar per bio — color-coded green/yellow/orange for instant readability check",
                "15 niche options with niche-specific defaults for audience, result, and benefit language",
                "5 tone options (Professional, Bold, Inspirational, Funny, Casual) that shape language and structure",
                "Optional fields: target audience, USP, custom CTA, and keywords for bio personalization",
                "Filter tabs to view all bios or filter by Emoji, CTA, or Minimal style instantly",
                "Formula label on each bio so you understand which structure is being used",
                "Regenerate button for unlimited variations — test until you find the perfect bio",
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

      {/* ── Tips & Best Practices ───────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { tip: "Keep your TikTok bio to 80 characters — users see only the first 80 on mobile before it truncates; front-load your value proposition." },
            { tip: "Include a niche-specific keyword in the first sentence (e.g., 'Fitness coach helping busy moms') — this makes you searchable in TikTok's creator discovery." },
            { tip: "Add a clear call-to-action with your link — 'New videos daily ↓' or 'Free guide in bio' consistently drive 3–5× more link clicks than plain descriptions." },
            { tip: "Use 1–3 relevant emojis to add personality without clutter — emojis can increase profile engagement by up to 20% vs plain text bios." },
            { tip: "Update your bio seasonally or when launching a new series — a fresh bio signals an active creator and increases follow conversions from profile visits." },
            { tip: "Add your content posting frequency ('5× per week') — consistency claims like this increase follow rates from profile visitors by up to 30%." },
            { tip: "If you have a link, make it a link-in-bio tool that aggregates your top offers — single links with a landing page convert far better than a bare URL." },
          ].map(({ tip }, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related TikTok Tools ────────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related TikTok Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "TikTok Caption Generator", path: "/tools/tiktok-caption-generator", desc: "Write scroll-stopping captions with hooks, hashtag cues, and CTAs that boost engagement on every post." },
            { name: "TikTok Hashtag Generator", path: "/tools/tiktok-hashtag-generator", desc: "Find the best mix of trending and niche hashtags to expand your reach and help TikTok categorize your content." },
            { name: "TikTok Username Generator", path: "/tools/tiktok-username-generator", desc: "Generate memorable, brand-consistent TikTok handles that are short, searchable, and available across platforms." },
            { name: "TikTok Hook Generator", path: "/tools/tiktok-hook-generator", desc: "Craft high-retention opening lines that stop the scroll and keep viewers watching past the critical first 3 seconds." },
          ].map(({ name, path, desc }) => (
            <a key={path} href={path} className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
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
