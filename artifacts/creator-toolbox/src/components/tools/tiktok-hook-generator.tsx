import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Zap, ChevronDown, Sparkles, Loader2, TrendingUp, Shield,
  ListChecks, Search, Copy, Check, Star, RefreshCw, Eye, Mic, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche = "fitness" | "business" | "tech" | "lifestyle" | "beauty" | "food" | "travel" | "gaming" | "education" | "finance" | "relationships" | "entertainment";
type ContentType = "educational" | "entertaining" | "storytelling" | "tutorial" | "funny";
type Tone = "bold" | "emotional" | "funny" | "dramatic" | "calm";
type HookType = "Question" | "Bold Statement" | "Shock / Surprise" | "Story" | "Mistake / Warning";

interface Hook {
  text: string;
  type: HookType;
  score: number;
  onScreenText: string;
  voiceoverTip: string;
  isBest: boolean;
}

interface HookResult {
  hooks: Hook[];
  bestIndexes: number[];
  deliveryTips: string[];
}

// ─── Hook Template Engine ─────────────────────────────────────────────────────

const HOOK_TEMPLATES: Record<HookType, (topic: string, niche: Niche, tone: Tone) => string[]> = {
  "Question": (topic, niche, tone) => [
    `Why is nobody talking about this ${topic} secret?`,
    `What if everything you know about ${topic} is wrong?`,
    `Have you ever wondered why your ${topic} isn't working?`,
    `Why do most ${niche} creators fail at ${topic}?`,
    `What's the real reason your ${topic} isn't growing?`,
    `Do you know the #1 ${topic} mistake everyone makes?`,
    `How is this ${topic} strategy getting these results?`,
    `What if I told you ${topic} takes less than 5 minutes?`,
  ],
  "Bold Statement": (topic, niche, tone) => [
    `You're doing ${topic} completely wrong.`,
    `This ${topic} strategy changed everything for me.`,
    `The ${topic} advice you've been following is outdated.`,
    `Most ${niche} content about ${topic} is lying to you.`,
    `I went from zero to results with this one ${topic} trick.`,
    `This is the only ${topic} method that actually works in 2026.`,
    `${topic.charAt(0).toUpperCase() + topic.slice(1)} is easier than you think — here's proof.`,
    `I tested every ${topic} strategy so you don't have to.`,
  ],
  "Shock / Surprise": (topic, niche, tone) => [
    `This ${topic} result should be illegal…`,
    `I can't believe this ${topic} actually worked.`,
    `Nobody told me ${topic} could do this.`,
    `This ${topic} changed my life in 7 days. No joke.`,
    `Wait… you've never tried this ${topic} approach?`,
    `The ${topic} secret the ${niche} industry doesn't want you to know.`,
    `I almost quit ${topic} before I discovered this.`,
    `This is not what you think — ${topic} explained differently.`,
  ],
  "Story": (topic, niche, tone) => [
    `This ${topic} thing happened to me last week and I'm still thinking about it.`,
    `I was terrible at ${topic} until I found this one thing.`,
    `Six months ago I knew nothing about ${topic}. Here's what changed.`,
    `The day I stopped doing ${topic} the wrong way was the day everything shifted.`,
    `I tried every ${topic} method for a year. Here's what actually worked.`,
    `Someone sent me a ${topic} tip that completely changed how I think.`,
    `My biggest ${topic} mistake — and how I fixed it in 24 hours.`,
    `I documented my entire ${topic} journey so you can skip the hard part.`,
  ],
  "Mistake / Warning": (topic, niche, tone) => [
    `Stop doing this if you want better ${topic} results.`,
    `The ${topic} mistake that's costing you views right now.`,
    `Do NOT try ${topic} until you watch this.`,
    `If you're doing ${topic} like this, you're wasting your time.`,
    `This ${topic} habit is silently killing your growth.`,
    `The ${topic} red flag nobody in ${niche} will warn you about.`,
    `Avoid this ${topic} approach at all costs — here's why.`,
    `I wish someone warned me about this ${topic} mistake earlier.`,
  ],
};

const TONE_VARIANTS: Record<Tone, (hook: string) => string> = {
  bold:      h => h,
  emotional: h => h.replace(/\.$/, " and it hit differently."),
  funny:     h => h.replace(/\.$/, " (seriously though)."),
  dramatic:  h => h.replace(/\.$/, "…"),
  calm:      h => h,
};

const NICHE_FOCUS: Record<Niche, string> = {
  fitness:       "transformation and results",
  business:      "income and growth outcomes",
  tech:          "efficiency and productivity gains",
  lifestyle:     "relatable everyday moments",
  beauty:        "product discoveries and routines",
  food:          "recipe reveals and taste",
  travel:        "destination reveals and savings",
  gaming:        "skill unlocks and hidden tricks",
  education:     "surprising facts and knowledge gaps",
  finance:       "money-saving and wealth-building",
  relationships: "emotional resonance and advice",
  entertainment: "reactions and plot twists",
};

const DELIVERY_TIPS_BY_TYPE: Record<HookType, string> = {
  "Question":         "Pause after the question — a half-second silence creates tension. Lean slightly forward toward camera. Put the question as bold overlay text.",
  "Bold Statement":   "Deliver with total confidence, no hesitation. Fast pace, strong eye contact. The statement should fill the screen in large text.",
  "Shock / Surprise": "Widen eyes slightly, speak with genuine disbelief. A dramatic pause after the shock statement amplifies impact.",
  "Story":            "Start mid-action — never 'So today I want to talk about…' Cut straight to the moment. Speak conversationally, like telling a friend.",
  "Mistake / Warning":"Point directly at camera or use pointing gesture. Urgent tone, not angry. Bold red warning-style text overlay reinforces urgency.",
};

function scoreHook(hook: string, topic: string, type: HookType): number {
  let score = 70;
  const h = hook.toLowerCase();
  const t = topic.toLowerCase();

  // Curiosity gap (40%)
  if (h.includes("?") || h.includes("secret") || h.includes("truth") || h.includes("real reason")) score += 12;
  if (h.includes("nobody") || h.includes("no one") || h.includes("most people")) score += 8;

  // Clarity (20%)
  const words = hook.split(/\s+/).length;
  if (words >= 5 && words <= 12) score += 8;
  else if (words <= 15) score += 4;

  // Emotional trigger (20%)
  if (["?", "!", "…"].some(c => hook.includes(c))) score += 5;
  if (h.includes("changed") || h.includes("shocked") || h.includes("never") || h.includes("stop")) score += 5;

  // Relevance (20%)
  if (h.includes(t.split(/\s+/)[0])) score += 8;

  // Type bonuses
  if (type === "Question" || type === "Shock / Surprise") score += 3;

  return Math.min(score, 99);
}

function buildOnScreenText(hook: string, type: HookType): string {
  const clean = hook.replace(/[.!?…]+$/, "");
  if (type === "Question") return `❓ ${clean.toUpperCase()}?`;
  if (type === "Bold Statement") return `🔥 "${clean.toUpperCase()}"`;
  if (type === "Shock / Surprise") return `😱 ${clean}…`;
  if (type === "Story") return `📖 ${clean}`;
  return `⚠️ ${clean.toUpperCase()}`;
}

function buildVoiceoverTip(hook: string, type: HookType, tone: Tone): string {
  const tips: Record<Tone, string> = {
    bold:      "Confident and direct. No vocal fry, no uptalk. Speak like you've seen proof.",
    emotional: "Let your voice carry genuine feeling — slight pause on the emotional words.",
    funny:     "Slight smirk in your voice, punchy delivery, land on the punchline word hard.",
    dramatic:  "Slow down on the key words. Dramatic pause before the reveal or ellipsis.",
    calm:      "Conversational and measured. Like you're sharing with a close friend.",
  };
  return tips[tone];
}

function generateHooks(
  topic: string,
  niche: Niche,
  _audience: string,
  contentType: ContentType,
  tone: Tone,
  count: number,
): HookResult {
  // Determine type priority based on content type
  const typePriority: HookType[] = contentType === "educational"
    ? ["Mistake / Warning", "Question", "Bold Statement", "Shock / Surprise", "Story"]
    : contentType === "storytelling"
    ? ["Story", "Shock / Surprise", "Question", "Bold Statement", "Mistake / Warning"]
    : contentType === "funny"
    ? ["Shock / Surprise", "Story", "Question", "Bold Statement", "Mistake / Warning"]
    : contentType === "tutorial"
    ? ["Mistake / Warning", "Bold Statement", "Question", "Story", "Shock / Surprise"]
    : ["Question", "Bold Statement", "Shock / Surprise", "Story", "Mistake / Warning"];

  const allHooks: Hook[] = [];

  // Generate hooks cycling through types
  for (let i = 0; i < count + 3; i++) {
    const type = typePriority[i % typePriority.length];
    const templates = HOOK_TEMPLATES[type](topic, niche, tone);
    const raw = templates[(i + Math.floor(Math.random() * 3)) % templates.length];
    const text = TONE_VARIANTS[tone](raw);
    const score = scoreHook(text, topic, type);
    if (score >= 80) {
      allHooks.push({
        text,
        type,
        score,
        onScreenText: buildOnScreenText(text, type),
        voiceoverTip: buildVoiceoverTip(text, type, tone),
        isBest: false,
      });
    }
  }

  // Deduplicate and take top N by score
  const seen = new Set<string>();
  const unique = allHooks.filter(h => {
    const key = h.type + h.text.slice(0, 20);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sorted = unique.sort((a, b) => b.score - a.score);
  const final = sorted.slice(0, count);

  // Mark top 3 as best
  const top3Scores = [...final].sort((a, b) => b.score - a.score).slice(0, 3).map(h => h.text);
  const bestIndexes: number[] = [];
  final.forEach((h, i) => {
    if (top3Scores.includes(h.text)) { h.isBest = true; bestIndexes.push(i); }
  });

  // Delivery tips
  const typesCovered = [...new Set(final.map(h => h.type))];
  const deliveryTips: string[] = [
    `Say your hook within the first 1–2 seconds of the video — never start with an intro, greeting, or context.`,
    `Display the hook as bold, high-contrast text on screen at the exact moment you say it aloud.`,
    `Use a ${tone} delivery for your ${niche} audience: ${DELIVERY_TIPS_BY_TYPE[typePriority[0]]}`,
    `A/B test at least 2 of your top hooks — post the same video with different openers and compare 3-second retention in Analytics.`,
    `Focus on ${NICHE_FOCUS[niche]} — your ${niche} audience responds best to hooks that promise this.`,
  ];

  return { hooks: final, bestIndexes, deliveryTips };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok hook and why does it matter?",
    a: "A TikTok hook is the opening line, statement, or visual that appears in the first 1–3 seconds of your video. It is the single most important element of any TikTok video because TikTok's algorithm uses 3-second view rate as a primary distribution signal — if viewers don't watch past your first few seconds, the video stops being promoted. A strong hook stops the scroll by triggering curiosity, emotion, or pattern interruption. A weak hook, even with excellent content after it, will cause the algorithm to deprioritize your video before most of your audience ever sees it.",
  },
  {
    q: "What makes a TikTok hook go viral?",
    a: "Viral TikTok hooks share four characteristics: (1) Curiosity gap — they create an open question the viewer must watch to resolve, (2) Instant clarity — the viewer understands exactly what the video is about within one second, (3) Emotional trigger — they activate curiosity, fear of missing out, surprise, or excitement, (4) Brevity — the best hooks are 5–12 words, readable as an on-screen overlay in under a second. The five proven viral hook formulas are: Question Hooks ('Why is nobody talking about this?'), Bold Statement Hooks ('You're doing this wrong'), Shock/Surprise Hooks ('This should be illegal'), Story Hooks ('This happened to me yesterday'), and Mistake/Warning Hooks ('Stop doing this if you want to grow').",
  },
  {
    q: "How do I deliver a TikTok hook effectively on camera?",
    a: "Hook delivery is as important as hook writing. Key delivery rules: (1) Say the hook within the first 1 second — never start with 'Hey guys,' 'So today,' or any greeting, (2) Display the hook as bold, high-contrast text overlay on screen at the exact moment you say it aloud — this serves viewers who watch without sound, (3) Match your vocal energy to the hook type — Bold Statement hooks require confidence, Story hooks need conversational warmth, Shock hooks need genuine surprise, (4) Use direct eye contact with the camera lens, not the screen, (5) Start mid-action when possible — walking, doing something, or already in the middle of a demonstration.",
  },
  {
    q: "How many TikTok hooks should I test?",
    a: "You should always test at minimum 2–3 hook variations for any important piece of content. TikTok's algorithm distributes each video independently, so the same underlying content with a different hook can perform 5–10× better. The fastest way to find your best hooks is A/B testing: post the same video (or very similar videos) with different opening hooks and compare the 3-second retention rate in TikTok Analytics after 24–48 hours. The hook with the highest 3-second view rate is your winner — reuse that hook formula for future videos in the same niche.",
  },
  {
    q: "What is the TikTok Scroll-Stopping Score?",
    a: "The Scroll-Stopping Score (0–100) in this tool rates each generated hook on four dimensions: Curiosity gap (40% weight) — how strongly the hook creates an unanswered question the viewer wants resolved; Clarity (20% weight) — how instantly understandable the hook is at scroll speed; Emotional trigger (20% weight) — how strongly the hook activates a psychological response; Topic relevance (20% weight) — how directly the hook connects to your specific video topic. Hooks scoring 90–100 have the highest viral potential, 80–89 are strong performers, and the tool filters out hooks below 80.",
  },
  {
    q: "What is the best TikTok hook formula for educational content?",
    a: "For educational content, the most effective hook formulas are: (1) Mistake/Warning Hooks — 'Stop doing this if you want [result]' creates urgency and makes the viewer feel they may be making the highlighted mistake, (2) Question Hooks — 'Why is nobody talking about this [topic] secret?' signals insider knowledge, (3) Bold Statement Hooks — 'The [topic] advice everyone gives you is wrong' directly challenges existing beliefs. Educational hooks should always imply a clear value exchange: 'Watch this and you will learn X.' Avoid starting educational videos with definitions, history, or context — lead with the most surprising or counter-intuitive element first.",
  },
  {
    q: "How do TikTok hooks affect the For You Page algorithm?",
    a: "TikTok's algorithm uses the 3-second view rate (the percentage of viewers who watch past the first 3 seconds) as one of its strongest early signals for content quality and distribution. Videos with a high 3-second view rate get pushed to progressively larger audiences in waves — first a small test cohort, then larger ones if each wave engages. A strong hook that maximizes 3-second retention doesn't just help in the first distribution wave; it compounds by increasing completion rate, which is the second key algorithm signal. Improving your hook quality is therefore the highest-leverage single change you can make to your TikTok content strategy.",
  },
  {
    q: "Can I use the same hook for multiple TikTok videos?",
    a: "You should absolutely reuse successful hook formulas — but not verbatim text. If a specific hook type (e.g., Bold Statement with 'You're doing X wrong') produces strong 3-second retention for you, use that same formula across multiple videos with different topics. This is how top TikTok creators build systematic content strategies. What you should avoid is using the exact same opening words in consecutive videos to the same audience — returning viewers who see the same hook they've seen before will scroll immediately. Rotate between 3–5 hook formulas and keep the specific wording fresh.",
  },
  {
    q: "What is an open loop hook and how does it work?",
    a: "An open loop hook is a statement that starts a story or presents a mystery without resolving it immediately — forcing the viewer to keep watching to get the resolution. Examples: 'I tested this for 30 days and the result shocked me' (viewers must keep watching to see the result) or 'The one thing that changed everything for me was...' (pause, then continue). Open loops work because of the Zeigarnik Effect — the human brain is psychologically driven to seek closure on unfinished stories. TikTok's algorithm rewards the extended watch time that open loops generate.",
  },
  {
    q: "Is this TikTok hook generator free?",
    a: "Yes — the TikTok Hook Generator on creatorsToolHub is completely free with no account, subscription, or credit card required. Enter your video topic and niche, select your content type and tone, and instantly receive 5–10 scored hooks with on-screen text versions, voiceover delivery tips, a breakdown by hook type, and your top 3 best hooks highlighted. Generate as many hook sets as you need for any topic or niche, with no limits or usage caps.",
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

// ─── Hook Type Badge ──────────────────────────────────────────────────────────

const TYPE_COLORS: Record<HookType, string> = {
  "Question":         "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  "Bold Statement":   "bg-primary/10 text-primary border-primary/20",
  "Shock / Surprise": "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  "Story":            "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  "Mistake / Warning":"bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const TYPE_ICONS: Record<HookType, string> = {
  "Question":         "❓",
  "Bold Statement":   "🔥",
  "Shock / Surprise": "😱",
  "Story":            "📖",
  "Mistake / Warning":"⚠️",
};

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 90
    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
    : score >= 85
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>{score}/100</span>;
}

// ─── Hook Card ────────────────────────────────────────────────────────────────

function HookCard({ hook, index, onCopy, copiedText }: {
  hook: Hook; index: number; onCopy: (t: string) => void; copiedText: string | null;
}) {
  const [expanded, setExpanded] = useState(hook.isBest && index === 0);
  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-card ${
      hook.isBest ? "border-primary/40 shadow-primary/5 shadow-md" : "border-border hover:border-muted-foreground/30"
    }`}>
      {hook.isBest && (
        <div className="bg-primary/10 px-5 py-1.5 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wide">Top Hook</span>
        </div>
      )}
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${hook.isBest ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground leading-snug text-base mb-2">"{hook.text}"</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[hook.type]}`}>
                {TYPE_ICONS[hook.type]} {hook.type}
              </span>
              <ScoreBadge score={hook.score} />
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onCopy(hook.text)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                copiedText === hook.text
                  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              }`}
            >
              {copiedText === hook.text ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-muted text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="rounded-xl bg-muted/40 border border-border p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">On-Screen Text Overlay</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{hook.onScreenText}</p>
                <button onClick={() => onCopy(hook.onScreenText)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-muted/40 border border-border p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Mic className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Voiceover Delivery Tip</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{hook.voiceoverTip}</p>
            </div>
            <div className="rounded-xl bg-muted/40 border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">📹 Camera Delivery</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{DELIVERY_TIPS_BY_TYPE[hook.type]}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "fitness",       label: "Fitness",       emoji: "💪" },
  { value: "business",      label: "Business",      emoji: "💼" },
  { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
  { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
  { value: "beauty",        label: "Beauty",        emoji: "💄" },
  { value: "food",          label: "Food",          emoji: "🍕" },
  { value: "travel",        label: "Travel",        emoji: "✈️" },
  { value: "gaming",        label: "Gaming",        emoji: "🎮" },
  { value: "education",     label: "Education",     emoji: "📚" },
  { value: "finance",       label: "Finance",       emoji: "💰" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
];

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "educational",  label: "Educational" },
  { value: "entertaining", label: "Entertaining" },
  { value: "storytelling", label: "Storytelling" },
  { value: "tutorial",     label: "Tutorial" },
  { value: "funny",        label: "Funny / Comedy" },
];

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "bold",      label: "Bold",      desc: "Confident, direct, no hedging" },
  { value: "emotional", label: "Emotional", desc: "Genuine feeling, vulnerability" },
  { value: "funny",     label: "Funny",     desc: "Light, witty, self-aware" },
  { value: "dramatic",  label: "Dramatic",  desc: "High stakes, suspenseful" },
  { value: "calm",      label: "Calm",      desc: "Conversational, approachable" },
];

const COUNT_OPTIONS = [5, 7, 10];

export function TikTokHookGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState<Niche>("fitness");
  const [audience, setAudience] = useState("");
  const [contentType, setContentType] = useState<ContentType>("educational");
  const [tone, setTone] = useState<Tone>("bold");
  const [count, setCount] = useState(10);

  const [result, setResult] = useState<HookResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "best" | "tips">("all");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tt-hook-gen";
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
    if (!topic.trim()) {
      toast({ title: "Enter your video topic", description: "What is your TikTok video about?", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const res = generateHooks(topic, niche, audience, contentType, tone, count);
      setResult(res);
      setIsGenerating(false);
      setActiveTab("all");
      if (!regen) setTimeout(() => document.getElementById("hook-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 420);
  }, [topic, niche, audience, contentType, tone, count, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
    toast({ title: "Copied!", duration: 1500 });
  };

  const copyAllBest = () => {
    if (!result) return;
    const best = result.hooks.filter(h => h.isBest).map(h => h.text).join("\n");
    navigator.clipboard.writeText(best);
    toast({ title: "Top 3 hooks copied!", duration: 2000 });
  };

  return (
    <>
      {/* ── Input Card ──────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Video Topic <span className="text-red-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. how to lose belly fat, AI productivity tools, starting a business with no money"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Niche <span className="text-red-500">*</span></label>
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

            {/* Content Type + Tone */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Type</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setContentType(value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        contentType === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
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
            </div>

            {/* Target Audience + Count */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Target Audience <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. beginner creators, women over 30, college students"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Number of Hooks</label>
                <div className="flex gap-2">
                  {COUNT_OPTIONS.map(n => (
                    <button key={n} type="button" onClick={() => setCount(n)}
                      className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all ${
                        count === n ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={isGenerating} className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Hooks...</>
                : <><Zap className="w-5 h-5" /> Generate TikTok Hooks</>}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────── */}
      {result && (
        <section id="hook-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Your TikTok Hooks
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {result.hooks.length} hooks • <span className="font-semibold text-foreground capitalize">{niche}</span> niche • all scored 80+
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "best", "tips"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase tracking-wide ${
                    activeTab === tab ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                  }`}>
                  {{ all: "🪝 All Hooks", best: "⭐ Top 3", tips: "🎬 Delivery Tips" }[tab]}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold">
                <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>

          {/* All Hooks */}
          {activeTab === "all" && (
            <div className="space-y-3">
              {result.hooks.map((hook, i) => (
                <HookCard key={`${hook.type}-${i}`} hook={hook} index={i} onCopy={copyText} copiedText={copiedText} />
              ))}
            </div>
          )}

          {/* Top 3 */}
          {activeTab === "best" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Your 3 highest-scoring hooks, ready to A/B test</p>
                <button onClick={copyAllBest} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border bg-muted border-border hover:border-primary/50 hover:text-primary transition-all">
                  <Copy className="w-3 h-3" /> Copy All 3
                </button>
              </div>
              {result.hooks.filter(h => h.isBest).map((hook, i) => (
                <HookCard key={`best-${i}`} hook={hook} index={i} onCopy={copyText} copiedText={copiedText} />
              ))}
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-sm font-bold text-foreground mb-2">💡 A/B Testing Strategy</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Post your video {result.hooks.filter(h => h.isBest).length > 1 ? "two or three times" : "with different hooks"} using different opening hooks.
                  After 24–48 hours, compare the <strong>3-second view rate</strong> in TikTok Analytics.
                  The hook with the highest 3-second rate wins — reuse that formula for future videos.
                </p>
              </div>
            </div>
          )}

          {/* Delivery Tips */}
          {activeTab === "tips" && (
            <div className="space-y-4">
              <div className="space-y-3">
                {result.deliveryTips.map((tip, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                    <div className="w-7 h-7 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
              {/* Hook type guide */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary" /> Camera Delivery by Hook Type
                </h3>
                {(Object.entries(DELIVERY_TIPS_BY_TYPE) as [HookType, string][]).map(([type, tip]) => (
                  <div key={type} className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border h-fit ${TYPE_COLORS[type]}`}>{TYPE_ICONS[type]} {type}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score legend */}
          <div className="flex items-center gap-4 flex-wrap px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide">Scroll-Stop Score:</span>
            {[{ r: "90–100", c: "bg-green-500", l: "Highly Viral" }, { r: "85–89", c: "bg-primary", l: "Strong" }, { r: "80–84", c: "bg-yellow-500", l: "Good" }].map(s => (
              <span key={s.r} className="flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${s.c}`} /> {s.r} {s.l}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Hook Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Video Topic", desc: "Type your video topic as specifically as possible — for example, 'how to lose belly fat at home without equipment' rather than just 'fitness.' The more specific your topic, the more targeted and relevant the generated hooks will be for your audience." },
            { step: 2, title: "Choose Your Niche, Type, and Tone", desc: "Select your content niche (fitness, business, beauty, etc.), content type (educational, storytelling, tutorial), and delivery tone (bold, emotional, dramatic). These three inputs shape the hook formula, language style, and psychological angle of every hook generated." },
            { step: 3, title: "Generate and Review Scored Hooks", desc: "Click Generate to instantly produce 5, 7, or 10 hooks — each scored on scroll-stopping potential (0–100) with a hook type label. Expand any hook card to see the on-screen text overlay version, voiceover delivery tips, and camera presence advice." },
            { step: 4, title: "Test Your Top 3 and Track Results", desc: "Switch to the Top 3 tab to see your highest-scoring hooks highlighted. A/B test at least 2 of them by posting the same content with different openers. After 48 hours, compare 3-second view rates in TikTok Analytics — the hook with the highest rate wins." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Hook Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This TikTok Hook Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free TikTok Hook Generator produces scroll-stopping video openers using five proven
              viral hook formulas: Question Hooks (curiosity gap), Bold Statement Hooks (confident authority),
              Shock/Surprise Hooks (pattern interruption), Story Hooks (narrative tension), and
              Mistake/Warning Hooks (urgency trigger). Every hook is scored on a 0–100 Scroll-Stopping
              Score — only hooks scoring 80 or above are shown, ensuring every result is genuinely
              worth testing. The score is weighted across four dimensions: curiosity gap (40%),
              clarity (20%), emotional trigger (20%), and topic relevance (20%). Hook generation is
              personalized by your content niche, content type, and delivery tone — a Bold tone applied
              to a business niche produces results-driven, authority-forward hooks, while an Emotional
              tone applied to the same topic produces vulnerability-centered, relatable openers.
              Each hook comes with an on-screen text overlay version formatted for immediate use in
              your video editor, a voiceover delivery tip, and camera presence advice specific to that
              hook type — so you get everything you need from idea to filming in one step.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why TikTok Hooks Are Your Most Important Content Asset
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              TikTok's algorithm uses the 3-second view rate as one of its strongest early distribution
              signals. If fewer than 60% of viewers watch past the first three seconds of your video,
              the algorithm interprets this as a quality signal and reduces distribution in subsequent
              waves. The inverse is equally true: a video with a strong hook that holds 80%+ of viewers
              past the 3-second mark gets pushed to progressively larger audiences — first hundreds,
              then thousands, then potentially millions of new viewers. This means the hook is not just
              the opening of your video — it's the lever that determines whether the rest of your content
              is ever seen at all. A mediocre video with an excellent hook will consistently outperform
              an excellent video with a mediocre hook. The most successful TikTok creators in every
              niche share one common practice: they treat hook writing as a dedicated skill, test multiple
              variations, and iterate based on data. This tool gives you a systematic way to apply that
              process — producing scientifically structured hooks, scoring them before you film, and
              providing a testing framework so you can identify winning formulas and build on them
              across your entire content library.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This TikTok Hook Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "5 proven viral hook formulas: Question, Bold Statement, Shock, Story, Mistake/Warning",
                "Scroll-Stopping Score (0–100) for every hook — only 80+ scores are shown",
                "Hook type labels so you understand the psychological mechanism behind each opener",
                "Top 3 hooks highlighted with one-click copy for fast A/B testing",
                "On-screen text overlay version for every hook — formatted for video editors",
                "Voiceover delivery tip and camera presence advice per hook type",
                "12 niche options with niche-specific hook personalization",
                "5 content types (educational, storytelling, tutorial, funny, entertaining) that shift hook priorities",
                "5 tone options (bold, emotional, funny, dramatic, calm) that adjust language and framing",
                "A/B testing strategy guide — how to use 3-second retention data to find your best hook",
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
            { name: "TikTok Caption Generator", path: "/tools/tiktok-caption-generator", desc: "Pair your scroll-stopping hook with a well-crafted caption to keep viewers engaged and drive comments." },
            { name: "TikTok Script Generator", path: "/tools/tiktok-script-generator", desc: "Extend your hook into a full video script with structured body content and a closing CTA that converts." },
            { name: "TikTok Viral Idea Generator", path: "/tools/tiktok-viral-idea-generator", desc: "Get the trending content ideas that deserve your best hooks — great concepts need great opening lines." },
            { name: "TikTok Hashtag Generator", path: "/tools/tiktok-hashtag-generator", desc: "Find the right hashtags to amplify the reach of videos that open with a hook strong enough to hold attention." },
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
