import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  User, ChevronDown, Sparkles, TrendingUp, Zap,
  Shield, ListChecks, Search, Copy, Check, RefreshCw,
  Target, Star, Minimize2, Briefcase, Heart, Link,
  MessageSquare, UserPlus, AlertCircle, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "beauty" | "business" | "finance" | "tech"
  | "education" | "food" | "travel" | "lifestyle" | "fashion"
  | "relationships" | "health" | "entertainment" | "coaching" | "other";

type BioTone = "professional" | "bold" | "minimal" | "inspirational";
type CtaType = "follow" | "dm" | "link" | "free" | "collab";
type FormatStyle = "single" | "pipe" | "linebreak" | "emoji";

interface BioResult {
  text: string;
  charCount: number;
  tone: BioTone;
  toneLabel: string;
  formatStyle: FormatStyle;
  formula: string;
  powerScore: number;   // 1–10
  clarityScore: number; // 1–10
}

// ─── Niche Data ───────────────────────────────────────────────────────────────

const NICHE_DATA: Record<Niche, {
  label: string; emoji: string;
  audience: string; result: string; benefit: string; verb: string;
}> = {
  fitness:       { label: "Fitness",       emoji: "💪", audience: "busy people",             result: "get fit without the gym",        benefit: "fat loss tips",         verb: "transform" },
  beauty:        { label: "Beauty",        emoji: "💄", audience: "beauty lovers",            result: "glow up on any budget",          benefit: "skincare & beauty tips", verb: "glow" },
  business:      { label: "Business",      emoji: "💼", audience: "entrepreneurs",            result: "build & scale their business",   benefit: "business growth",        verb: "scale" },
  finance:       { label: "Finance",       emoji: "💰", audience: "anyone",                  result: "build wealth & save money",      benefit: "money tips",             verb: "build wealth" },
  tech:          { label: "Tech / AI",     emoji: "🤖", audience: "creators & builders",     result: "work smarter with AI",           benefit: "AI & tech tips",         verb: "automate" },
  education:     { label: "Education",     emoji: "📚", audience: "curious learners",        result: "learn faster & think sharper",   benefit: "daily learning",         verb: "educate" },
  food:          { label: "Food",          emoji: "🍕", audience: "home cooks",              result: "cook delicious meals fast",      benefit: "easy recipes",           verb: "cook" },
  travel:        { label: "Travel",        emoji: "✈️", audience: "travelers",               result: "explore the world for less",     benefit: "travel hacks",           verb: "explore" },
  lifestyle:     { label: "Lifestyle",     emoji: "✨", audience: "everyone",               result: "live better intentionally",      benefit: "lifestyle tips",         verb: "elevate" },
  fashion:       { label: "Fashion",       emoji: "👗", audience: "style lovers",            result: "dress better for less",          benefit: "outfit ideas",           verb: "style" },
  relationships: { label: "Relationships", emoji: "❤️", audience: "singles & couples",       result: "build healthier relationships",  benefit: "relationship advice",    verb: "connect" },
  health:        { label: "Health",        emoji: "🌿", audience: "health-conscious people", result: "feel their best every day",      benefit: "wellness tips",          verb: "heal" },
  entertainment: { label: "Entertainment", emoji: "🎬", audience: "pop culture fans",        result: "stay in the loop",               benefit: "daily drops",            verb: "entertain" },
  coaching:      { label: "Coaching",      emoji: "🎯", audience: "people ready to grow",    result: "reach their next level",         benefit: "coaching insights",      verb: "coach" },
  other:         { label: "Other",         emoji: "🚀", audience: "people like you",         result: "reach their goals faster",       benefit: "tips & insights",        verb: "grow" },
};

// ─── CTA Templates ─────────────────────────────────────────────────────────────

const CTA_TEMPLATES: Record<CtaType, string[]> = {
  follow:  ["Follow for daily tips ↓", "Follow for more ↓", "New tips weekly → follow ↓", "Hit follow for more 🔔"],
  dm:      ["DM me to start", "DM 'READY' to begin ↓", "DM for a free consult", "Message me ↓"],
  link:    ["Get the free guide ↓", "Start here → link ↓", "Download free ↓", "Grab the resource ↓"],
  free:    ["Grab my free guide ↓", "Free resource in link ↓", "Free training ↓", "Link below for free access ↓"],
  collab:  ["Open for collabs → DM ↓", "DM for partnerships", "Business inquiries → DM ↓", "Collabs → link ↓"],
};

// ─── Bio Engine ───────────────────────────────────────────────────────────────

const MAX_CHARS = 150;

function trimTo(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

function scoreBio(text: string): { power: number; clarity: number } {
  let power = 5, clarity = 5;
  // Power words
  if (/help|transform|build|grow|scale|earn|lose|free|proven|fast|expert|best|top|elite|no[- ]fluff/i.test(text)) power += 2;
  if (/\d/.test(text)) power += 1; // specificity with numbers
  if (/↓|→|•|💡|🔥|⚡|🎯/.test(text)) power += 1;
  if (/\||\n/.test(text)) clarity += 2; // formatted
  if (text.length <= 100) clarity += 2; // concise
  if (text.length <= 130) clarity += 1;
  if (/follow|DM|link|get|grab|start|join/i.test(text)) clarity += 1; // has CTA
  return { power: Math.min(10, power), clarity: Math.min(10, clarity) };
}

function makeBio(
  raw: string,
  tone: BioTone,
  toneLabel: string,
  formula: string,
  format: FormatStyle,
): BioResult {
  const text = trimTo(raw, MAX_CHARS);
  const { power, clarity } = scoreBio(text);
  return {
    text,
    charCount: text.length,
    tone,
    toneLabel,
    formatStyle: format,
    formula,
    powerScore: power,
    clarityScore: clarity,
  };
}

function generateBios(
  niche: Niche,
  whatYouDo: string,
  audience: string,
  ctaType: CtaType,
  credibility: string,
  keywords: string,
  name: string,
): BioResult[] {
  const nd = NICHE_DATA[niche];
  const em = nd.emoji;

  const aud   = audience.trim()    || nd.audience;
  const what  = whatYouDo.trim()   || `Helping ${nd.audience} ${nd.result}`;
  const cred  = credibility.trim();
  const kws   = keywords.split(",").map(k => k.trim()).filter(Boolean);
  const kw1   = kws[0] || nd.result.split(" ").slice(0, 3).join(" ");
  const ctaOpts = CTA_TEMPLATES[ctaType];
  const cta0 = ctaOpts[0];
  const cta1 = ctaOpts[1] || ctaOpts[0];
  const cta2 = ctaOpts[2] || ctaOpts[0];
  const cta3 = ctaOpts[3] || ctaOpts[0];

  // Short verb form
  const shortWhat = what.length > 40 ? what.slice(0, 37) + "…" : what;

  // Credibility prefix
  const credPrefix = cred ? `${cred} | ` : "";
  const credLine   = cred ? `${cred}\n` : "";

  const results: BioResult[] = [];

  // ── 3 Professional ────────────────────────────────────────────────────────
  results.push(makeBio(
    `${credPrefix}${shortWhat} | ${cta0}`,
    "professional", "Professional",
    "[Credibility] + [What you do] | [CTA]",
    "pipe",
  ));

  results.push(makeBio(
    `${em} ${nd.verb.charAt(0).toUpperCase() + nd.verb.slice(1)} specialist helping ${aud} ${nd.result} | ${cta1}`,
    "professional", "Professional",
    "[Emoji] [Specialist] helping [audience] [result] | [CTA]",
    "pipe",
  ));

  results.push(makeBio(
    `Helping ${aud} ${nd.result}.\n${cred ? cred + "\n" : ""}${cta2}`,
    "professional", "Professional",
    "Helping [audience] [result] + Credibility + CTA",
    "linebreak",
  ));

  // ── 2 Bold ────────────────────────────────────────────────────────────────
  results.push(makeBio(
    `Your ${nd.result.split(" ").slice(0, 3).join(" ")} starts here.\n${cred ? cred + "\n" : ""}${cta0}`,
    "bold", "Bold",
    "[Your result starts here] + CTA",
    "linebreak",
  ));

  results.push(makeBio(
    `No fluff. Just ${kw1}.\n${cred ? cred + "\n" : ""}${cta1}`,
    "bold", "Bold",
    "No fluff. Just [keyword]. + CTA",
    "linebreak",
  ));

  // ── 2 Minimal ─────────────────────────────────────────────────────────────
  results.push(makeBio(
    `${nd.result.charAt(0).toUpperCase() + nd.result.slice(1)} for ${aud} | ${cta0}`,
    "minimal", "Minimal",
    "[Result] for [audience] | [CTA]",
    "pipe",
  ));

  results.push(makeBio(
    `${em} ${kw1.charAt(0).toUpperCase() + kw1.slice(1)} made simple | ${cta2}`,
    "minimal", "Minimal",
    "[Emoji] [Topic] made simple | [CTA]",
    "pipe",
  ));

  // ── 3 Inspirational ───────────────────────────────────────────────────────
  results.push(makeBio(
    `Become the version of yourself that ${nd.result}.\n${cta3}`,
    "inspirational", "Inspirational",
    "Become the version who [result] + CTA",
    "linebreak",
  ));

  results.push(makeBio(
    `${em} You already have what it takes to ${nd.result}.\n${cta0}`,
    "inspirational", "Inspirational",
    "[Emoji] You already have what it takes + CTA",
    "linebreak",
  ));

  results.push(makeBio(
    `The best time to ${nd.verb} was yesterday.\nThe second best time is now ${em}\n${cta1}`,
    "inspirational", "Inspirational",
    "The best time... quote + CTA",
    "linebreak",
  ));

  return results;
}

// ─── Character Meter ──────────────────────────────────────────────────────────

function CharMeter({ count }: { count: number }) {
  const pct = Math.min((count / MAX_CHARS) * 100, 100);
  const color = count > MAX_CHARS ? "bg-red-500"
    : count > 130 ? "bg-yellow-500"
    : count > 90  ? "bg-blue-500"
    : "bg-green-500";
  const textColor = count > MAX_CHARS ? "text-red-600 dark:text-red-400"
    : count > 130 ? "text-yellow-600 dark:text-yellow-400"
    : "text-muted-foreground";
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs font-bold ${textColor}`}>{count}/150 characters</p>
    </div>
  );
}

// ─── Tone Badge ───────────────────────────────────────────────────────────────

const TONE_COLORS: Record<BioTone, string> = {
  professional: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  bold:         "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  minimal:      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  inspirational:"bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
};

// ─── Bio Card ─────────────────────────────────────────────────────────────────

function BioCard({ bio, index, onCopy, copiedId }: {
  bio: BioResult; index: number; onCopy: (id: string, text: string) => void; copiedId: string | null;
}) {
  const id = `igbio-${index}`;
  const copied = copiedId === id;
  const overLimit = bio.charCount > MAX_CHARS;

  return (
    <div className={`rounded-2xl border bg-card hover:border-primary/30 transition-colors group overflow-hidden ${overLimit ? "border-red-200 dark:border-red-800" : "border-border"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/50 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {index + 1}
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${TONE_COLORS[bio.tone]}`}>
            {bio.toneLabel}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block">{bio.formula}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            bio.powerScore >= 8 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
            : bio.powerScore >= 6 ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "bg-muted text-muted-foreground border-border"
          }`}>Power {bio.powerScore}/10</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            bio.clarityScore >= 8 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
            : bio.clarityScore >= 6 ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "bg-muted text-muted-foreground border-border"
          }`}>Clarity {bio.clarityScore}/10</span>
        </div>
      </div>

      {/* Bio Text */}
      <div className="px-5 py-4">
        <div className="rounded-xl bg-muted/40 border border-border p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm font-medium text-foreground leading-relaxed break-words">
            {bio.text}
          </pre>
        </div>
        <div className="mt-2">
          <CharMeter count={bio.charCount} />
        </div>
        {overLimit && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
            <AlertCircle className="w-3 h-3" /> This bio exceeds 150 characters — trim before using on Instagram.
          </div>
        )}
      </div>

      {/* Copy */}
      <div className="px-5 pb-4">
        <button onClick={() => onCopy(id, bio.text)}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
            copied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                   : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied to clipboard!" : "Copy Bio"}
        </button>
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a good Instagram bio?",
    a: "A high-converting Instagram bio does four things in 150 characters or fewer: immediately communicates your niche so visitors know exactly what you're about, states a clear value proposition that answers 'what's in it for me if I follow you?', includes a specific call-to-action (follow, DM, or link click), and projects a consistent personality that attracts your target audience and repels the wrong one. The most common mistake creators make is being vague — generic phrases like 'helping you succeed' tell the visitor nothing. Strong bios use specific outcomes ('helping busy moms lose 20 lbs without cutting carbs'), concrete numbers when available ('500+ clients coached'), and direct CTAs that feel like a natural next step, not a sales push. Your bio is your profile's conversion page — it has approximately 3 seconds to communicate your value before a visitor scrolls away.",
  },
  {
    q: "How long should an Instagram bio be?",
    a: "Instagram allows a maximum of 150 characters for the bio section — this is a strict platform limit that cannot be exceeded. However, the optimal Instagram bio length is 90–140 characters, leaving enough room to be comprehensive while ensuring the entire bio is visible without a 'more' expansion required on mobile. Bios under 80 characters can feel incomplete and miss the opportunity to communicate full value. Bios that hit exactly 150 characters often feel cramped and are hard to read quickly. The ideal approach is to maximize information density within a clean structure — use line breaks (which count as one character each) to improve readability, keep each section to its essential words, and eliminate filler phrases like 'I am passionate about' that consume characters without adding positioning value.",
  },
  {
    q: "What should I include in my Instagram bio?",
    a: "Every Instagram bio should contain five core elements: (1) Niche clarity — the first line or first phrase should make your topic unmistakably clear to any profile visitor; (2) Value proposition — what specific outcome or benefit does following you deliver? Be concrete rather than generic; (3) Credibility signal — if you have results, achievements, or numbers that validate your expertise, include them ('500+ clients', '10K students', 'Forbes featured'); (4) Call-to-action — one clear action you want visitors to take: follow, DM, click the link. Only one CTA — multiple CTAs create decision paralysis; (5) Personality signal — a word, phrase, or emoji that gives a sense of who you are beyond the professional positioning. The bio should read like a sharply edited elevator pitch, not a resume or a vague mission statement.",
  },
  {
    q: "Should I put emojis in my Instagram bio?",
    a: "Emojis in Instagram bios are effective when used strategically — they add visual separation, personality, and draw the eye to key elements without consuming much character space. The most effective emoji uses are: one niche-relevant emoji at the start of the bio or a key section (💪 for fitness, 💰 for finance) to create instant visual categorization, arrow emojis (↓ or →) as CTA pointers that feel native to Instagram, and bullet-point emojis (•, ✓, ⚡) to break up list-style bios into scannable lines. Avoid using more than 3–4 emojis total, avoid using irrelevant emojis for decoration, and avoid placing emojis mid-sentence where they interrupt reading flow. Minimal and professional bios can perform equally well or better without emojis — the question is whether emojis match your personal brand tone.",
  },
  {
    q: "What is the best Instagram bio CTA?",
    a: "The best Instagram bio CTA is the one that matches your current business or content goal. For content creators focused on growing followers: 'Follow for [specific content type] every week' outperforms the generic 'Follow me' because it gives a reason to follow. For coaches and service providers: 'DM me [specific word] to [specific outcome]' (e.g., 'DM me READY for a free audit') is the highest-converting DM CTA because it sets a specific, low-friction action. For digital products and lead magnets: 'Grab the free [resource] ↓' with a link drives the highest click-through rate. For brand partnerships: 'Business inquiries → link ↓' signals professionalism. The most important rule: use only one CTA per bio. Two CTAs create choice paralysis and lower total conversion rate significantly.",
  },
  {
    q: "How often should I update my Instagram bio?",
    a: "Your Instagram bio should be updated whenever your positioning, offers, or primary CTA changes — not on a fixed schedule. However, there are specific moments that always require a bio update: when you launch a new product or lead magnet (update the CTA and link in bio), when you shift your content focus or niche, when you achieve a significant credibility milestone worth adding ('just crossed 50K' or '1,000 students'), when you run a time-limited promotion or event (temporarily swap in a specific CTA), and when you notice a significant drop in follower conversion rate from profile visits. A useful benchmark: if more than 5% of your profile visitors follow you, your bio is working. If it drops below 2–3%, the bio is likely the issue and needs reworking.",
  },
  {
    q: "What is the 150-character Instagram bio limit?",
    a: "Instagram enforces a hard 150-character limit for the bio field — any text beyond 150 characters is cut off when you try to save. This limit counts every character including spaces, line breaks (each line break counts as one character), emojis (emojis count as 1–2 characters depending on the specific emoji), and punctuation. Line breaks within the bio are allowed and are one of the most effective formatting tools — they create visual separation between the niche statement, value proposition, and CTA, making the bio scannable at a glance. The 150-character bio does not include the name field (up to 30 characters), the website URL field, or the Instagram category label — these are separate fields that add positioning information without reducing your bio character budget.",
  },
  {
    q: "How do I write an Instagram bio for a business?",
    a: "A business Instagram bio should prioritize clarity and conversion over personality expression — the goal is to tell potential customers or clients exactly what you offer and what they should do next. The most effective business bio structure is: Category/niche in the first line (make it immediately obvious what type of business you are), core value proposition in the second line ('helping [audience] achieve [specific outcome]'), social proof if available in the third line ('trusted by 2,000+ clients'), and a direct CTA in the final line ('Shop now ↓' or 'Book a free call ↓'). Avoid mission statements, taglines that require context to understand, and vague descriptors like 'innovative' or 'passionate'. Business bios perform best when they read like a value proposition from the customer's perspective — what they gain — rather than a description of what the business does.",
  },
  {
    q: "How do I write an Instagram bio that gets followers?",
    a: "An Instagram bio that converts profile visitors into followers needs to answer one question instantly: 'Why should I follow this person specifically?' The most follower-converting bios combine four elements: a clear niche identity that the visitor immediately recognizes themselves in, a specific ongoing value promise ('weekly tips on X', 'daily Y content'), a reason to follow now rather than later (implied by specificity and timeliness), and a personality signal that makes the account feel worth following beyond the information value. Creators often underestimate how much niche specificity matters — 'fitness tips for busy moms over 35' converts dramatically better than 'fitness content' because the specific target recognizes themselves and feels the account is directly relevant to them.",
  },
  {
    q: "Is this Instagram bio generator free?",
    a: "Yes — the Instagram Bio Generator on creatorsToolHub is completely free with no account, subscription, or credit card required. Enter your niche, what you help people achieve, target audience, CTA type, and optional credibility markers or keywords, then instantly generate 10 Instagram bios across four tones: Professional (3 variations), Bold (2 variations), Minimal (2 variations), and Inspirational (3 variations). Every bio is generated to fit within Instagram's 150-character limit, includes a live character meter, and shows a Power Score and Clarity Score. Copy any bio to your clipboard in one click. Use the Keywords field to ensure your niche-specific terms and positioning language appear in the generated bios.",
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

// ─── Accordion ─────────────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl" aria-expanded={open}>
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function InstagramBioGeneratorTool() {
  const { toast } = useToast();
  const [niche,       setNiche]       = useState<Niche>("lifestyle");
  const [whatYouDo,   setWhatYouDo]   = useState("");
  const [audience,    setAudience]    = useState("");
  const [ctaType,     setCtaType]     = useState<CtaType>("follow");
  const [credibility, setCredibility] = useState("");
  const [keywords,    setKeywords]    = useState("");
  const [name,        setName]        = useState("");
  const [error,       setError]       = useState("");
  const [bios,        setBios]        = useState<BioResult[]>([]);
  const [copiedId,    setCopiedId]    = useState<string | null>(null);
  const [activeFilter,setActiveFilter]= useState<"all" | "professional" | "bold" | "minimal" | "inspirational">("all");

  useEffect(() => {
    const id = "faq-schema-ig-bio-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast({ title: "Copied!", description: "Bio copied to clipboard." });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [toast]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!niche) { setError("Select a niche."); return; }
    const results = generateBios(niche, whatYouDo, audience, ctaType, credibility, keywords, name);
    setBios(results);
    setActiveFilter("all");
    setTimeout(() => document.getElementById("ig-bio-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  const displayed = activeFilter === "all" ? bios : bios.filter(b => b.tone === activeFilter);

  const NICHES: { value: Niche; label: string; emoji: string }[] = [
    { value: "fitness",       label: "Fitness",       emoji: "💪" },
    { value: "beauty",        label: "Beauty",        emoji: "💄" },
    { value: "business",      label: "Business",      emoji: "💼" },
    { value: "finance",       label: "Finance",       emoji: "💰" },
    { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
    { value: "education",     label: "Education",     emoji: "📚" },
    { value: "food",          label: "Food",          emoji: "🍕" },
    { value: "travel",        label: "Travel",        emoji: "✈️" },
    { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
    { value: "fashion",       label: "Fashion",       emoji: "👗" },
    { value: "relationships", label: "Relationships", emoji: "❤️" },
    { value: "health",        label: "Health",        emoji: "🌿" },
    { value: "entertainment", label: "Entertainment", emoji: "🎬" },
    { value: "coaching",      label: "Coaching",      emoji: "🎯" },
    { value: "other",         label: "Other",         emoji: "🚀" },
  ];

  return (
    <>
      {/* ── Input Card ─────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleGenerate} className="space-y-5">

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Your Niche <span className="text-red-500">*</span>
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

            {/* What you do + Audience */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-primary" /> What You Help People Achieve
                </label>
                <Input value={whatYouDo} onChange={e => setWhatYouDo(e.target.value)}
                  placeholder="e.g. lose weight without strict diets"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                <p className="text-xs text-muted-foreground">Be specific — "lose 20 lbs in 90 days" beats "get healthy"</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" /> Target Audience
                </label>
                <Input value={audience} onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. busy moms, entrepreneurs, 20s women"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
            </div>

            {/* CTA Type */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">CTA Goal</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {([
                  { value: "follow" as CtaType,  label: "Follow",   icon: <UserPlus className="w-3.5 h-3.5" /> },
                  { value: "dm" as CtaType,      label: "DM Me",    icon: <MessageSquare className="w-3.5 h-3.5" /> },
                  { value: "link" as CtaType,    label: "Link Bio", icon: <Link className="w-3.5 h-3.5" /> },
                  { value: "free" as CtaType,    label: "Free Gift",icon: <Star className="w-3.5 h-3.5" /> },
                  { value: "collab" as CtaType,  label: "Collabs",  icon: <Heart className="w-3.5 h-3.5" /> },
                ] as const).map(({ value, label, icon }) => (
                  <button key={value} type="button" onClick={() => setCtaType(value)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      ctaType === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                    }`}>
                    {icon}{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Credibility + Keywords + Name */}
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase text-muted-foreground">
                  Credibility <span className="font-normal normal-case text-xs">(optional)</span>
                </label>
                <Input value={credibility} onChange={e => setCredibility(e.target.value)}
                  placeholder="e.g. helped 500+ clients"
                  className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase text-muted-foreground">
                  Keywords <span className="font-normal normal-case text-xs">(optional, comma-sep)</span>
                </label>
                <Input value={keywords} onChange={e => setKeywords(e.target.value)}
                  placeholder="e.g. fat loss, morning routine"
                  className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase text-muted-foreground">
                  Your Name <span className="font-normal normal-case text-xs">(optional)</span>
                </label>
                <Input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                <span>⚠️</span>{error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5" /> Generate 10 Instagram Bios
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {bios.length > 0 && (
        <section id="ig-bio-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">{bios.length} bios generated across 4 tones</p>
              <p className="text-xs text-muted-foreground mt-0.5">{NICHE_DATA[niche].label} · {ctaType} CTA · all within 150 characters</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {([
                { value: "all",           label: "All 10" },
                { value: "professional",  label: "Professional" },
                { value: "bold",          label: "Bold" },
                { value: "minimal",       label: "Minimal" },
                { value: "inspirational", label: "Inspirational" },
              ] as const).map(({ value, label }) => (
                <button key={value} onClick={() => setActiveFilter(value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    activeFilter === value ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}>
                  {label}
                </button>
              ))}
              <button onClick={() => { setBios([]); setWhatYouDo(""); setAudience(""); }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-border bg-muted text-muted-foreground hover:border-primary/50 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Tone legend */}
          <div className="flex flex-wrap gap-2">
            {([
              { tone: "professional" as BioTone,  label: "3 Professional — clear, authoritative, result-focused" },
              { tone: "bold" as BioTone,           label: "2 Bold — direct, confident, contrarian" },
              { tone: "minimal" as BioTone,        label: "2 Minimal — clean, short, straight to the point" },
              { tone: "inspirational" as BioTone,  label: "3 Inspirational — motivational, future-focused" },
            ]).map(({ tone, label }) => (
              <div key={tone} className={`text-xs font-medium px-3 py-1.5 rounded-xl border ${TONE_COLORS[tone]}`}>
                {label}
              </div>
            ))}
          </div>

          {displayed.map((bio, i) => (
            <BioCard key={`${bio.tone}-${i}`} bio={bio} index={i} onCopy={handleCopy} copiedId={copiedId} />
          ))}
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Bio Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, icon: <User className="w-5 h-5 text-primary" />,
              title: "Select your niche and describe what you help people achieve",
              desc: "Choose your content niche, then enter your core value proposition in the 'What You Help People Achieve' field. Be specific: 'lose 20 lbs without giving up carbs' generates far stronger bios than 'get fit'. The more precise your input, the more targeted your output." },
            { step: 2, icon: <Target className="w-5 h-5 text-primary" />,
              title: "Enter your target audience and choose your CTA goal",
              desc: "Describe your target audience clearly — 'busy moms over 35' or 'early-stage entrepreneurs' converts better than 'everyone'. Then select your CTA goal: Follow (growing your audience), DM (coaching/services), Link (products/lead magnets), Free Gift (list building), or Collabs (partnerships)." },
            { step: 3, icon: <Star className="w-5 h-5 text-primary" />,
              title: "Add optional credibility markers and keywords",
              desc: "Credibility markers ('helped 500+ clients', '10K students', 'Forbes featured') are injected into the Professional-tone bios. Keywords ensure your specific positioning language appears in the generated bios. Your name is optional for personalization in certain bio formats." },
            { step: 4, icon: <Copy className="w-5 h-5 text-primary" />,
              title: "Filter by tone and copy your best bio",
              desc: "Get 10 bios across 4 tones: 3 Professional, 2 Bold, 2 Minimal, 3 Inspirational. Use the tone filter tabs to compare across styles. Every bio shows a live character meter, Power Score, and Clarity Score. Copy to clipboard in one click — paste directly into Instagram's profile edit." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">{icon}</div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Step {step}</p>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / SEO ──────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Bio Generator — Turn Profile Visitors Into Followers</h2>
        </div>
        <div className="space-y-7 text-muted-foreground leading-relaxed text-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              Why Your Instagram Bio Is Your Most Important Conversion Page
            </h3>
            <p className="mb-3">
              Your Instagram bio is the only section of your profile that every visitor reads before making the decision to follow or leave. The profile photo catches the eye. The username indicates the niche. But the bio — 150 characters of carefully chosen text — is where the conversion happens or doesn't. When someone taps your profile from a Reel, a hashtag search, a Explore page recommendation, or a tagged mention, they spend an average of 3–7 seconds reading your bio before deciding whether your account is worth following.
            </p>
            <p className="mb-3">
              The fundamental purpose of an Instagram bio is to answer three questions in a single glance: What is this account about? What do I gain from following? What should I do next? Most creators answer only the first question well — they communicate their niche clearly but fail to articulate specific value ('follow for fitness tips' is niche clarity without value) and skip the CTA entirely, leaving the visitor with no directed action. The result is a profile that gets views but doesn't convert.
            </p>
            <p>
              This generator applies the proven bio formula — [Who you help] + [What result you deliver] + [Credibility signal] + [CTA] — across 10 variations in four distinct tones. Each bio is constructed to communicate maximum value density within the 150-character limit, with every word chosen to eliminate ambiguity and drive a clear follow or action.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary flex-shrink-0" />
              The Four Tone Strategies and When Each Performs Best
            </h3>
            <p className="mb-3">
              Professional-tone bios are the strongest performers for coaches, consultants, service providers, and niche experts where authority and credibility are the primary reasons someone should follow. The professional format is typically results-forward: it leads with what the creator delivers, supports it with a credibility signal, and closes with a follow or DM CTA. These bios work best in high-competition niches like business, finance, and wellness where the target audience is sophisticated and vetting multiple creators before choosing to follow any.
            </p>
            <p className="mb-3">
              Bold-tone bios are most effective for creators who compete through differentiation rather than authority — they use a contrarian statement, a "no fluff" positioning claim, or a direct challenge to conventional wisdom. Bold bios attract a specific type of follower — one who is already skeptical of generic advice and is actively looking for a perspective worth trusting. They generate higher-quality follows (followers who are more engaged) but lower total volume, making them better suited to creators building tight communities than those prioritizing raw follower growth.
            </p>
            <p>
              Minimal bios — clean, short, and instantly scannable — outperform longer bios in fashion, travel, photography, and entertainment niches where aesthetic identity matters more than detailed positioning. Minimal bios work because they signal confidence: the creator doesn't need to over-explain because the visual content does the selling. Inspirational bios perform best for lifestyle, personal development, and wellness creators whose audience is primarily motivated by identity — they follow accounts that represent who they want to become, not just accounts that deliver information.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              How to Maximize the Instagram Bio Character Limit
            </h3>
            <p className="mb-3">
              Instagram's 150-character bio limit is simultaneously a constraint and a competitive advantage. The creators who treat the limit as a discipline — forcing every word to earn its place — consistently produce bios that outperform longer, less edited versions. The most common character-wasting patterns to eliminate are: opening with your name (your username already identifies you), describing what you do rather than what you deliver for the follower ('I make fitness content' vs 'helping busy people get fit in 20 minutes'), using filler phrases like 'passionate about' or 'love to share', and listing credentials without connecting them to audience benefit.
            </p>
            <p>
              The most effective character-saving techniques are: replacing multi-word phrases with single power words ('lose weight effectively' → 'transform'), using the pipe separator (|) to divide sections without spending characters on transition phrases, using line breaks to separate sections visually (each line break is one character), and placing the CTA on the final line with a directional emoji (↓ or →) instead of a worded instruction. The goal is a bio that communicates professional authority, specific value, and a clear next action in under 130 characters — leaving a small buffer for edits and ensuring the full bio is readable without truncation on any device.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">What This Instagram Bio Generator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "10 bio variations generated simultaneously — 3 Professional, 2 Bold, 2 Minimal, 3 Inspirational — all calibrated for your specific niche and audience",
            "Strict 150-character enforcement — every bio is generated to fit Instagram's hard character limit with a live character meter per bio",
            "5 CTA goal types — Follow, DM, Link in Bio, Free Gift, and Collab — each with 4 natural CTA phrase variations",
            "Credibility marker injection — your results or achievements are incorporated into the Professional bio variations for authority positioning",
            "Power Score and Clarity Score per bio — helps you quickly identify the highest-converting options before testing",
            "Tone filter tabs — instantly view only Professional, Bold, Minimal, or Inspirational variations to compare within a style",
            "4 bio structure formulas: [Result] | [CTA], [Audience] + [Result] + [CTA], [Statement] + line break + [CTA], [Emoji] + [Result] | [CTA]",
            "15 niches supported — Fitness, Beauty, Business, Finance, Tech/AI, Education, Food, Travel, Lifestyle, Fashion, Relationships, Health, Entertainment, Coaching, Other",
            "Keywords field — inject niche-specific terms and personal positioning language directly into bio variations and hashtag suggestions",
            "One-click copy per bio — paste directly into Instagram's profile edit without reformatting",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
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
            { tip: "Instagram bios are capped at 150 characters — lead with your who/what/why in the first line since the second line is folded on mobile profiles." },
            { tip: "Use the Name Field for SEO keywords, not your actual name — 'Fitness Coach | Fat Loss Expert' in the name field appears in Instagram search results." },
            { tip: "Add a location if you're a local business or event creator — profiles with location see 3× more calls and visits from nearby discovery searches." },
            { tip: "Change your bio link to match your current campaign — static 'link in bio' underperforms; update it every 1–2 weeks with your latest content or offer." },
            { tip: "Use a line break (press return on mobile) to create visual separation — a structured 3-line bio is 60% more likely to result in a follow than a run-on paragraph." },
            { tip: "Include 1–3 emojis as bullets — they replace periods aesthetically and increase scannability, leading to 20–30% longer bio read times." },
            { tip: "State your content posting schedule — 'New reels every Tuesday & Friday' sets expectations and improves follow-to-watch conversion rates significantly." },
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

      {/* ── Related Instagram Tools ─────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related Instagram Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Write compelling post captions with hooks, CTAs, and the right tone to drive saves, comments, and shares." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Generate a targeted mix of hashtags to expand your reach and connect your content with the right audience." },
            { name: "Instagram Username Generator", path: "/tools/instagram-username-generator", desc: "Find a memorable, SEO-friendly Instagram handle that's consistent with your brand across all platforms." },
            { name: "Instagram Hook Generator", path: "/tools/instagram-hook-generator", desc: "Craft first-line hooks that stop the scroll and compel visitors to tap 'more' on your captions." },
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

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
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
