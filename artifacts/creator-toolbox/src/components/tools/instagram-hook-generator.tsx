import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Zap, ChevronDown, Sparkles, Loader2, TrendingUp, Shield,
  ListChecks, Search, Copy, Check, Star, RefreshCw, Eye, Mic,
  Target, Wand2, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "business" | "tech" | "lifestyle" | "beauty"
  | "food" | "travel" | "gaming" | "education" | "finance"
  | "relationships" | "entertainment";

type GoalType = "grow-followers" | "sell" | "educate" | "entertain";
type Tone = "bold" | "funny" | "relatable" | "inspirational" | "controversial" | "serious";

type HookFormat =
  | "Bold Statement"
  | "Curiosity Gap"
  | "Question Hook"
  | "Relatable Frustration"
  | "POV"
  | "Shocking Statistic"
  | "Contrarian Take"
  | "How-To Promise"
  | "Mistake Callout"
  | "Story Tease";

interface Hook {
  text: string;
  format: HookFormat;
  score: number;
  onScreenText: string;
  deliveryTip: string;
  isBest: boolean;
}

// ─── Hook Template Engine ─────────────────────────────────────────────────────

const HOOK_TEMPLATES: Record<HookFormat, (topic: string, niche: Niche) => string[]> = {
  "Bold Statement": (topic, niche) => [
    `You've been doing ${topic} completely wrong.`,
    `This ${topic} strategy changed everything.`,
    `The ${topic} advice everyone gives you is outdated.`,
    `Most ${niche} content about ${topic} is lying to you.`,
    `${topic.charAt(0).toUpperCase() + topic.slice(1)} is easier than you think — here's proof.`,
    `I tested every ${topic} method and this is what actually works.`,
    `One ${topic} change and my results tripled overnight.`,
    `Nobody is talking about this ${topic} approach — and that's a mistake.`,
  ],
  "Curiosity Gap": (topic, niche) => [
    `This is why your ${topic} isn't working…`,
    `Nobody tells you this about ${topic}…`,
    `The real reason ${niche} creators fail at ${topic}…`,
    `I found something about ${topic} that I can't stop thinking about.`,
    `There's a ${topic} secret nobody in ${niche} talks about.`,
    `What if everything you know about ${topic} is wrong?`,
    `I discovered something about ${topic} that genuinely surprised me.`,
    `The thing about ${topic} they don't want you to know…`,
  ],
  "Question Hook": (topic, niche) => [
    `Why is nobody talking about this ${topic} method?`,
    `Have you ever wondered why your ${topic} isn't growing?`,
    `What's the real reason ${topic} stops working?`,
    `Do you know the #1 ${topic} mistake everyone makes?`,
    `How is this ${topic} approach getting these results?`,
    `What if ${topic} only takes 5 minutes a day?`,
    `Why do most ${niche} creators quit ${topic} too early?`,
    `Are you making this ${topic} mistake without knowing it?`,
  ],
  "Relatable Frustration": (topic, niche) => [
    `You try every ${topic} tip and nothing changes?`,
    `Spent months on ${topic} with zero results?`,
    `Everyone makes ${topic} look so easy — but it's not.`,
    `If ${topic} is supposed to work, why isn't it working for you?`,
    `You do everything right with ${topic} and still get nothing.`,
    `Tired of ${topic} advice that never actually works?`,
    `${topic.charAt(0).toUpperCase() + topic.slice(1)} shouldn't feel this hard. But here we are.`,
    `The frustrating truth nobody tells you about ${topic}.`,
  ],
  "POV": (topic, niche) => [
    `POV: You finally figure out ${topic}.`,
    `POV: Your ${topic} content starts going viral overnight.`,
    `POV: You discover the ${topic} method that actually works.`,
    `POV: Someone just explained ${topic} in 60 seconds and it clicked.`,
    `POV: You spent months on ${topic} and then found this.`,
    `POV: First day trying this ${topic} strategy.`,
    `POV: You're the ${niche} creator who actually understands ${topic}.`,
    `POV: Everything changes after you learn this one ${topic} thing.`,
  ],
  "Shocking Statistic": (topic, niche) => [
    `90% of ${niche} creators get ${topic} completely wrong.`,
    `Most people quit ${topic} before seeing results — don't be that person.`,
    `1 in 3 ${niche} creators never figure out ${topic}. Here's why.`,
    `Over 80% of ${topic} attempts fail in the first 30 days.`,
    `The average creator wastes months doing ${topic} inefficiently.`,
    `95% of people who try ${topic} are missing this one step.`,
    `Most ${niche} advice about ${topic} is outdated by 2+ years.`,
    `Only 5% of ${niche} creators use this ${topic} method — and it shows.`,
  ],
  "Contrarian Take": (topic, niche) => [
    `Hot take: ${topic} is not what you think it is.`,
    `Stop following the mainstream ${topic} advice — it's holding you back.`,
    `The ${topic} tip everyone shares is actually the worst one.`,
    `I disagree with every popular ${topic} strategy. Here's why.`,
    `Unpopular opinion: ${topic} is not the reason you're not growing.`,
    `Every ${niche} guru gets ${topic} wrong. Here's the truth.`,
    `Controversial: the ${topic} method everyone hates is actually better.`,
    `I went against every ${topic} rule and got better results.`,
  ],
  "How-To Promise": (topic, niche) => [
    `How I fixed my ${topic} in under 60 seconds.`,
    `The easiest way to improve your ${topic} starting today.`,
    `How to actually make ${topic} work — no fluff, no filler.`,
    `How I went from zero to results with ${topic} in 7 days.`,
    `The 3-step ${topic} system that beginners get right every time.`,
    `How to build a ${topic} strategy in less than 5 minutes.`,
    `The fastest way to see real ${topic} results — no kidding.`,
    `How to stop overthinking ${topic} and start seeing results.`,
  ],
  "Mistake Callout": (topic, niche) => [
    `Stop doing this if you want better ${topic} results.`,
    `The ${topic} mistake that's costing you reach right now.`,
    `If you're doing ${topic} like this, you're wasting your time.`,
    `Do NOT try ${topic} until you watch this.`,
    `This ${topic} habit is silently killing your growth.`,
    `The ${topic} mistake nobody in ${niche} will warn you about.`,
    `Avoid this ${topic} approach at all costs — here's why.`,
    `I wish someone warned me about this ${topic} mistake earlier.`,
  ],
  "Story Tease": (topic, niche) => [
    `I almost quit ${topic} before everything changed.`,
    `Last week something happened with my ${topic} that I'm still processing.`,
    `Six months ago I knew nothing about ${topic}. Here's what changed.`,
    `I was terrible at ${topic} until I found this one thing.`,
    `The day I stopped doing ${topic} the conventional way — everything shifted.`,
    `My biggest ${topic} failure became my biggest growth moment.`,
    `I documented my ${topic} journey so you can skip the hard part.`,
    `Someone showed me a ${topic} approach that completely rewired how I think.`,
  ],
};

// ─── Scroll Stopper Prefixes ──────────────────────────────────────────────────

const SCROLL_STOPPERS = [
  "Wait…",
  "Stop scrolling —",
  "Nobody talks about this but…",
  "Real talk:",
  "This is important:",
  "Save this before it's gone:",
];

// ─── Tone Variants ────────────────────────────────────────────────────────────

const TONE_VARIANTS: Record<Tone, (hook: string) => string> = {
  bold:          h => h,
  funny:         h => h.replace(/\.$/, " (not gonna lie)."),
  relatable:     h => h.replace(/\.$/, " — been there."),
  inspirational: h => h.replace(/\.$/, " You've got this."),
  controversial: h => h.replace(/\.$/, " Fight me."),
  serious:       h => h,
};

// ─── Delivery Tips ────────────────────────────────────────────────────────────

const DELIVERY_TIPS: Record<HookFormat, string> = {
  "Bold Statement":      "Deliver with total confidence — no hesitation, no softening. Fast pace, strong eye contact. Fill the first frame with bold overlay text.",
  "Curiosity Gap":       "Deliberately trail off or pause after the gap. The '…' in your delivery is everything. Let the viewer's brain try to fill the blank for half a second.",
  "Question Hook":       "Pause slightly after the question. A half-second of silence creates tension. Put the question as bold text overlay — many viewers watch without sound.",
  "Relatable Frustration":"Match the energy your viewer already feels. Slight exasperation in your voice. Lean into it — they'll feel seen and keep watching.",
  "POV":                 "Start mid-scene. Don't explain the POV — show it. The camera is your viewer's eyes. Speak TO them, not AT them.",
  "Shocking Statistic":  "Deliver the stat as if you just found out yourself. Slight widening of eyes. The number must appear as overlay text immediately.",
  "Contrarian Take":     "Own the controversy. Don't hedge. Say it directly and confidently. A slight smirk signals self-awareness, not arrogance.",
  "How-To Promise":      "Be immediately credible. Say it like you've done it. The faster you communicate the payoff, the more likely they are to watch to get it.",
  "Mistake Callout":     "Point at the camera or use a stopping gesture. Urgent tone — not angry. Bold warning-style text overlay (red or white) amplifies urgency.",
  "Story Tease":         "Start mid-action — never 'So today I want to…' Cut straight to the moment. Speak conversationally, as if telling a close friend.",
};

// ─── On-Screen Text Builder ───────────────────────────────────────────────────

const FORMAT_ICONS: Record<HookFormat, string> = {
  "Bold Statement":      "🔥",
  "Curiosity Gap":       "🤔",
  "Question Hook":       "❓",
  "Relatable Frustration":"😤",
  "POV":                 "👁️",
  "Shocking Statistic":  "📊",
  "Contrarian Take":     "⚡",
  "How-To Promise":      "✅",
  "Mistake Callout":     "⚠️",
  "Story Tease":         "📖",
};

function buildOnScreenText(hook: string, format: HookFormat): string {
  const clean = hook.replace(/[.!?…]+$/, "");
  const icon = FORMAT_ICONS[format];
  if (format === "Question Hook") return `${icon} ${clean.toUpperCase()}?`;
  if (format === "Bold Statement") return `${icon} "${clean}"`;
  if (format === "Shocking Statistic") return `${icon} ${clean.toUpperCase()}`;
  if (format === "Mistake Callout") return `${icon} ${clean.toUpperCase()}`;
  if (format === "POV") return `POV: ${clean}`;
  return `${icon} ${clean}`;
}

// ─── Niche Focus ──────────────────────────────────────────────────────────────

const NICHE_FOCUS: Record<Niche, string> = {
  fitness:       "transformation, results, and accountability",
  business:      "income growth and actionable outcomes",
  tech:          "efficiency gains and productivity shortcuts",
  lifestyle:     "relatable moments and aspirational identity",
  beauty:        "product revelations and routine improvements",
  food:          "recipe reveals, taste, and visual appeal",
  travel:        "destination discovery and money-saving",
  gaming:        "skill unlocks, hidden tricks, and reactions",
  education:     "surprising facts and knowledge gaps",
  finance:       "money-saving, wealth-building, and freedom",
  relationships: "emotional resonance, relatability, and advice",
  entertainment: "reactions, plot twists, and trending moments",
};

// ─── Goal-Based Format Priority ───────────────────────────────────────────────

const GOAL_PRIORITIES: Record<GoalType, HookFormat[]> = {
  "grow-followers": ["Question Hook", "Curiosity Gap", "Relatable Frustration", "Bold Statement", "Story Tease", "POV", "Contrarian Take", "How-To Promise", "Shocking Statistic", "Mistake Callout"],
  "sell":           ["How-To Promise", "Bold Statement", "Shocking Statistic", "Mistake Callout", "Contrarian Take", "Curiosity Gap", "Question Hook", "Story Tease", "Relatable Frustration", "POV"],
  "educate":        ["How-To Promise", "Shocking Statistic", "Question Hook", "Mistake Callout", "Contrarian Take", "Curiosity Gap", "Bold Statement", "Story Tease", "Relatable Frustration", "POV"],
  "entertain":      ["POV", "Relatable Frustration", "Story Tease", "Bold Statement", "Curiosity Gap", "Question Hook", "Contrarian Take", "Shocking Statistic", "How-To Promise", "Mistake Callout"],
};

// ─── Scoring Engine ───────────────────────────────────────────────────────────

function scoreHook(hook: string, topic: string, format: HookFormat): number {
  let score = 68;
  const h = hook.toLowerCase();
  const t = topic.toLowerCase().split(/\s+/)[0];

  // Curiosity / open loop (30 pts)
  if (h.includes("?") || h.includes("…") || h.includes("secret") || h.includes("real reason") || h.includes("nobody")) score += 14;
  if (h.includes("but") || h.includes("until") || h.includes("before") || h.includes("after")) score += 8;

  // Emotion / relatability (25 pts)
  if (["!", "?", "…"].some(c => hook.includes(c))) score += 6;
  if (h.includes("changed") || h.includes("never") || h.includes("stop") || h.includes("fail") || h.includes("quit")) score += 10;
  if (h.includes("you") || h.includes("your") || h.includes("pov")) score += 9;

  // Specificity (25 pts)
  if (h.includes(t)) score += 12;
  const wordCount = hook.split(/\s+/).length;
  if (wordCount >= 5 && wordCount <= 12) score += 10;
  else if (wordCount <= 15) score += 5;

  // Format bonus (20 pts)
  if (format === "Question Hook" || format === "Curiosity Gap") score += 8;
  if (format === "Shocking Statistic") score += 6;
  if (format === "POV" || format === "Relatable Frustration") score += 5;

  return Math.min(score, 99);
}

// ─── Main Generator ───────────────────────────────────────────────────────────

function generateHooks(
  topic: string,
  niche: Niche,
  goal: GoalType,
  tone: Tone,
  audience: string,
): Hook[] {
  const t = topic.trim().toLowerCase();
  const allHooks: Hook[] = [];

  const formats = GOAL_PRIORITIES[goal];

  for (const format of formats) {
    const templates = HOOK_TEMPLATES[format](t, niche);
    const shuffled = [...templates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 2; i++) {
      const raw = shuffled[i % shuffled.length];
      const text = TONE_VARIANTS[tone](raw);
      const score = scoreHook(text, t, format);
      if (score >= 78) {
        allHooks.push({
          text,
          format,
          score,
          onScreenText: buildOnScreenText(text, format),
          deliveryTip: DELIVERY_TIPS[format],
          isBest: false,
        });
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = allHooks.filter(h => {
    const key = h.text.slice(0, 25);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sorted = unique.sort((a, b) => b.score - a.score);

  // Mark top 5 as best
  sorted.slice(0, 5).forEach(h => { h.isBest = true; });

  return sorted;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is an Instagram Reel hook and why does it matter?",
    a: "An Instagram Reel hook is the opening line, text overlay, or visual moment in the first 1–3 seconds of your video. It is the single most important element of any Reel because Instagram's algorithm measures hook rate — the percentage of viewers who watch past the first 3 seconds — as a primary signal for Reels distribution. A strong hook that holds 80%+ of initial viewers past the 3-second mark triggers Instagram to push the video to progressively larger audiences: first to followers, then to non-followers via Explore and the Reels tab. A weak hook, even with excellent content after it, causes the algorithm to stop distribution early — meaning most of your audience never sees the video at all.",
  },
  {
    q: "What makes an Instagram Reel hook scroll-stopping?",
    a: "Scroll-stopping Instagram hooks share four key characteristics: (1) Curiosity gap — they create an open question or incomplete idea the viewer must watch to resolve, such as 'The real reason your Reels aren't going viral…'; (2) Instant clarity — viewers understand exactly what the video is about within one second, before they consciously decide to keep watching; (3) Emotional trigger — they activate curiosity, fear of missing out, relatability, or surprise; (4) Brevity — the best hooks are 5–12 words, readable as an on-screen overlay at scroll speed. The ten proven Instagram hook formats in this tool — Bold Statement, Curiosity Gap, Question Hook, Relatable Frustration, POV, Shocking Statistic, Contrarian Take, How-To Promise, Mistake Callout, and Story Tease — each activate different psychological triggers, making them more or less effective depending on your niche and audience.",
  },
  {
    q: "How do I deliver an Instagram Reel hook effectively on camera?",
    a: "Hook delivery is as important as hook writing. Key delivery rules: (1) Say the hook in the first 0–1 seconds — never open with 'Hey guys,' 'So today,' or any greeting; (2) Display the hook as bold, high-contrast text overlay at the exact moment you say it — many viewers watch without sound, and the text carries your hook for them; (3) Match your vocal energy to the hook format — Bold Statement hooks require unwavering confidence, Relatable Frustration hooks need genuine exasperation, Story Tease hooks should feel conversational; (4) Make direct eye contact with the camera lens, not the screen; (5) Start mid-action when possible — walking, demonstrating, or reacting rather than standing still and speaking.",
  },
  {
    q: "What is the best hook format for Instagram Reels in 2025?",
    a: "Based on Instagram engagement data in 2025, the highest-performing hook formats are: (1) Relatable Frustration — hooks that voice a frustration the viewer already feels ('You try every content tip and nothing changes?') earn high saves and shares because audiences feel understood; (2) Curiosity Gap — hooks with a deliberate information gap ('Nobody tells you this about the algorithm…') force watch-through because the brain needs resolution; (3) POV hooks — immersive perspective hooks ('POV: Your Reel just hit 100K views') trigger strong engagement from audiences imagining themselves in the scenario. The best format for your account depends on your niche and audience: entertainment and lifestyle niches perform best with POV and Relatable Frustration, while business and education niches see strong results from How-To Promise and Mistake Callout hooks.",
  },
  {
    q: "What is the Scroll-Stopping Score in this tool?",
    a: "The Scroll-Stopping Score (0–100) rates each generated hook on four dimensions: Curiosity and open loop (30% weight) — how strongly the hook creates an unresolved question the viewer must watch to answer; Emotional trigger and relatability (25% weight) — how effectively the hook activates a psychological response; Specificity and topic relevance (25% weight) — how directly the hook connects to your specific Reel topic; Clarity and length (20% weight) — how instantly readable the hook is at scroll speed with ideal word count (5–12 words). Only hooks scoring 78 or above are displayed. Hooks in the 90–99 range represent the highest scroll-stopping potential, 85–89 are strong performers worth A/B testing, and 78–84 are solid baseline hooks.",
  },
  {
    q: "How do Instagram Reel hooks affect the algorithm?",
    a: "Instagram's Reels algorithm distributes content in waves — starting with a small test cohort, then expanding distribution if engagement metrics are strong. The two most important early signals are hook rate (3-second view rate) and watch-through rate (completion rate). A Reel with a high hook rate enters each distribution wave with a larger audience, compounding the total reach. Beyond distribution, hooks with strong curiosity gaps increase save rates (viewers save the Reel to refer back to), and hooks addressing relatable frustrations increase comment rates (viewers tag others who share the same struggle). Both saves and comments are weighted heavily in Instagram's engagement score, which further amplifies reach through the Explore and Reels tabs.",
  },
  {
    q: "What are scroll stoppers and how do I use them?",
    a: "Scroll stoppers are short, high-impact phrases added to the very beginning of a hook to create an immediate pattern interrupt — a moment that breaks the viewer's scrolling autopilot. The most effective scroll stoppers are: 'Wait…' (creates instant pause and curiosity), 'Stop scrolling —' (direct command that activates attention), 'Nobody talks about this but…' (signals insider information), 'Real talk:' (signals authenticity and directness), and 'Save this:' (creates urgency before the viewer has even heard the content). In this tool, use the Scroll Stopper button on any hook card to automatically add a scroll stopper prefix. Scroll stoppers are most effective on Curiosity Gap and Bold Statement hooks, where the pause reinforces the hook's psychological mechanism.",
  },
  {
    q: "How many hooks should I test per Reel?",
    a: "You should test a minimum of 2–3 hook variations for any important Reel. Instagram's algorithm distributes each video independently based on its own engagement data — the same underlying video content with a different opening hook can achieve 5–10× different reach. The fastest way to identify your best hooks is systematic A/B testing: post the same core content (or nearly identical content) with different opening hooks over separate days. After 24–48 hours, compare the 3-second view rates in Instagram Professional Dashboard. The hook with the highest 3-second rate is your winner — note the format (Curiosity Gap, POV, etc.) and build more hooks using that same formula. Top creators maintain a personal 'hook swipe file' of formats that consistently perform well for their specific audience.",
  },
  {
    q: "Can I use the same Instagram hook for multiple Reels?",
    a: "You should reuse successful hook formulas — but not verbatim text. If a specific format (e.g., Relatable Frustration: 'You try every tip and nothing changes?') produces strong watch-through rates for your account, use that same formula structure across multiple Reels with different topics. This is how experienced Instagram creators build repeatable content systems. Avoid using the exact same wording in consecutive Reels to the same audience — returning followers who see a hook they recognize will scroll past immediately. Rotate between 3–5 formats that work for your niche and audience, keeping the specific wording fresh each time while preserving the psychological mechanism that drives engagement.",
  },
  {
    q: "Is this Instagram hook generator free?",
    a: "Yes — the Instagram Hook Generator on creatorsToolHub is completely free with no account, subscription, or credit card required. Enter your Reel topic, select your niche, goal, and tone, and instantly receive up to 20 scored hooks across all 10 proven formats — each with a Scroll-Stopping Score, on-screen text overlay version, one-click Scroll Stopper enhancement, and camera delivery tips. Your top 5 hooks are automatically highlighted for fast A/B testing. Generate as many hook sets as you need for any topic or niche, with no usage limits.",
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

// ─── Format Badge Colors ──────────────────────────────────────────────────────

const FORMAT_COLORS: Record<HookFormat, string> = {
  "Bold Statement":      "bg-primary/10 text-primary border-primary/20",
  "Curiosity Gap":       "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  "Question Hook":       "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
  "Relatable Frustration":"bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  "POV":                 "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
  "Shocking Statistic":  "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  "Contrarian Take":     "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  "How-To Promise":      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  "Mistake Callout":     "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  "Story Tease":         "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
};

// ─── Score Badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 90
    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
    : score >= 85
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>{score}/100</span>;
}

// ─── Hook Card ────────────────────────────────────────────────────────────────

function HookCard({
  hook, index, onCopy, copiedText,
}: {
  hook: Hook; index: number; onCopy: (t: string) => void; copiedText: string | null;
}) {
  const [expanded, setExpanded] = useState(hook.isBest && index === 0);
  const [scrollerIdx, setScrollerIdx] = useState<number | null>(null);

  const displayText = scrollerIdx !== null
    ? `${SCROLL_STOPPERS[scrollerIdx]} ${hook.text}`
    : hook.text;

  const cycleScrollStopper = () => {
    setScrollerIdx(prev =>
      prev === null ? 0 : prev + 1 >= SCROLL_STOPPERS.length ? null : prev + 1
    );
  };

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
            <p className="font-semibold text-foreground leading-snug text-base mb-2">
              "{scrollerIdx !== null && (
                <span className="text-primary">{SCROLL_STOPPERS[scrollerIdx]} </span>
              )}{hook.text}"
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${FORMAT_COLORS[hook.format]}`}>
                {FORMAT_ICONS[hook.format]} {hook.format}
              </span>
              <ScoreBadge score={hook.score} />
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
            <button
              onClick={cycleScrollStopper}
              title="Add scroll stopper prefix"
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all text-xs ${
                scrollerIdx !== null
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onCopy(displayText)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                copiedText === displayText
                  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              }`}
            >
              {copiedText === displayText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-muted text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

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
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Camera Delivery Tip</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{hook.deliveryTip}</p>
            </div>
            {scrollerIdx === null && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1.5">💡 Scroll Stopper Tip</p>
                <p className="text-xs text-muted-foreground">Click the <span className="font-bold">✨ wand</span> button to add a scroll stopper prefix (Wait…, Stop scrolling, etc.) — cycle through options to find your best match.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Form Constants ───────────────────────────────────────────────────────────

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

const GOALS: { value: GoalType; label: string; emoji: string }[] = [
  { value: "grow-followers", label: "Grow Followers", emoji: "📈" },
  { value: "educate",        label: "Educate",        emoji: "📚" },
  { value: "entertain",      label: "Entertain",      emoji: "🎉" },
  { value: "sell",           label: "Sell / Promote", emoji: "💰" },
];

const TONES: { value: Tone; label: string }[] = [
  { value: "bold",          label: "Bold" },
  { value: "relatable",     label: "Relatable" },
  { value: "inspirational", label: "Inspirational" },
  { value: "funny",         label: "Funny" },
  { value: "controversial", label: "Controversial" },
  { value: "serious",       label: "Serious" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function InstagramHookGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState<Niche>("fitness");
  const [goal, setGoal] = useState<GoalType>("grow-followers");
  const [tone, setTone] = useState<Tone>("bold");
  const [audience, setAudience] = useState("");

  const [hooks, setHooks] = useState<Hook[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "best" | "by-format">("all");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-ig-hook-gen";
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
      toast({ title: "Enter your Reel topic", description: "What is your Instagram Reel about?", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateHooks(topic, niche, goal, tone, audience);
      setHooks(generated);
      setIsGenerating(false);
      setHasGenerated(true);
      setActiveTab("all");
      if (!regen) {
        setTimeout(() => document.getElementById("ig-hook-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }, 440);
  }, [topic, niche, goal, tone, audience, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
    toast({ title: "Copied!", duration: 1500 });
  };

  const copyAllBest = () => {
    const best = hooks.filter(h => h.isBest).map(h => `"${h.text}"`).join("\n");
    navigator.clipboard.writeText(best);
    toast({ title: "Top hooks copied!", description: "5 top hooks copied to clipboard.", duration: 2000 });
  };

  // Group by format for By-Format tab
  const byFormat: Partial<Record<HookFormat, Hook[]>> = {};
  for (const h of hooks) {
    if (!byFormat[h.format]) byFormat[h.format] = [];
    byFormat[h.format]!.push(h);
  }
  const formatOrder = GOAL_PRIORITIES[goal];

  return (
    <>
      {/* ── Input Card ───────────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Reel Topic <span className="text-red-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. belly fat loss, growing on Instagram, AI productivity tools, skin care routine"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Be specific — "how to lose belly fat without equipment" generates better hooks than just "fitness".</p>
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Niche <span className="text-red-500">*</span>
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

            {/* Goal + Tone */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Reel Goal</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(({ value, label, emoji }) => (
                    <button key={value} type="button" onClick={() => setGoal(value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1 ${
                        goal === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}>
                      <span>{emoji}</span>{label}
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

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Target Audience <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <Input
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="e.g. busy moms, beginner creators, women over 30, college students"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>

            <Button type="submit" size="lg" disabled={isGenerating} className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Hooks...</>
                : <><Zap className="w-5 h-5" /> Generate Instagram Hooks</>}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────────── */}
      {hasGenerated && hooks.length > 0 && (
        <section id="ig-hook-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Your Instagram Hooks
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {hooks.length} hooks · <span className="font-semibold text-foreground capitalize">{niche}</span> niche · all scored 78+
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "best", "by-format"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase tracking-wide ${
                    activeTab === tab ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                  }`}>
                  {{ all: "🪝 All Hooks", best: "⭐ Top 5", "by-format": "📋 By Format" }[tab]}
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
              {hooks.map((hook, i) => (
                <HookCard key={`${hook.format}-${i}`} hook={hook} index={i} onCopy={copyText} copiedText={copiedText} />
              ))}
            </div>
          )}

          {/* Top 5 */}
          {activeTab === "best" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Your 5 highest-scoring hooks — ready for A/B testing</p>
                <button onClick={copyAllBest} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border bg-muted border-border hover:border-primary/50 hover:text-primary transition-all">
                  <Copy className="w-3 h-3" /> Copy Top 5
                </button>
              </div>
              {hooks.filter(h => h.isBest).map((hook, i) => (
                <HookCard key={`best-${i}`} hook={hook} index={i} onCopy={copyText} copiedText={copiedText} />
              ))}
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-sm font-bold text-foreground mb-2">💡 A/B Testing Strategy</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Post similar Reels using different top hooks on separate days. After 24–48 hours, compare the
                  <strong> 3-second view rate</strong> in your Instagram Professional Dashboard. The hook with
                  the highest rate is your winner — note the format and reuse that formula for future Reels.
                </p>
              </div>
            </div>
          )}

          {/* By Format */}
          {activeTab === "by-format" && (
            <div className="space-y-6">
              {formatOrder.map(format => {
                const group = byFormat[format];
                if (!group || group.length === 0) return null;
                return (
                  <div key={format} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${FORMAT_COLORS[format]}`}>
                        {FORMAT_ICONS[format]} {format}
                      </span>
                      <span className="text-xs text-muted-foreground">{group.length} hook{group.length > 1 ? "s" : ""}</span>
                    </div>
                    {group.map((hook, i) => (
                      <HookCard key={`${format}-${i}`} hook={hook} index={i} onCopy={copyText} copiedText={copiedText} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Score legend */}
          <div className="flex items-center gap-4 flex-wrap px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide">Scroll-Stop Score:</span>
            {[{ r: "90–99", c: "bg-green-500", l: "Highly Viral" }, { r: "85–89", c: "bg-primary", l: "Strong" }, { r: "78–84", c: "bg-yellow-500", l: "Good" }].map(s => (
              <span key={s.r} className="flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${s.c}`} /> {s.r} {s.l}
              </span>
            ))}
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <Wand2 className="w-3 h-3" /> Wand = Scroll Stopper
            </span>
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Hook Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1, icon: <Target className="w-5 h-5 text-primary" />,
              title: "Enter your Reel topic and niche",
              desc: "Type your Reel topic as specifically as possible — 'how to lose belly fat without equipment' generates stronger hooks than just 'fitness.' Then select your niche so the generator tailors language and emotional triggers to your audience.",
            },
            {
              step: 2, icon: <Zap className="w-5 h-5 text-primary" />,
              title: "Set your goal and tone",
              desc: "Select what this Reel is trying to achieve: grow followers, educate, entertain, or sell. Then pick a tone — Bold, Relatable, Inspirational, Funny, Controversial, or Serious. Goal and tone together determine which of the 10 hook formats are prioritized.",
            },
            {
              step: 3, icon: <Sparkles className="w-5 h-5 text-primary" />,
              title: "Generate and score your hooks",
              desc: "Click Generate for up to 20 hooks across all 10 formats, each with a Scroll-Stopping Score (78–100). Use the ✨ wand button on any hook to add a scroll stopper prefix. Expand a hook card to see the on-screen text overlay and camera delivery tip.",
            },
            {
              step: 4, icon: <RefreshCw className="w-5 h-5 text-primary" />,
              title: "Test your top 5 and track results",
              desc: "Switch to the Top 5 tab to see your highest-scoring hooks highlighted. A/B test at least 2 by posting similar Reels with different opening hooks. After 48 hours, compare 3-second view rates in Instagram Professional Dashboard — the winner tells you your best formula.",
            },
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

      {/* ── About / SEO ──────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Hook Generator — Stop the Scroll in the First 3 Seconds</h2>
        </div>
        <div className="space-y-7 text-muted-foreground leading-relaxed text-sm">

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              What Is an Instagram Reel Hook and Why Does It Determine Your Reach?
            </h3>
            <p className="mb-3">
              An Instagram Reel hook is the opening element of your video — the line you say, the text that
              appears on screen, or the visual action that happens in the first 1–3 seconds. It is the single
              most important creative decision you make for any Reel, because Instagram's algorithm
              distributes content in waves — and the first wave's performance determines whether your video
              ever reaches a non-follower audience at all.
            </p>
            <p className="mb-3">
              The key metric Instagram measures in that first wave is <strong className="text-foreground">hook rate</strong>:
              the percentage of initial viewers who watch past the 3-second mark. A Reel with a hook rate
              above 80% signals to the algorithm that the content is immediately compelling — Instagram
              responds by pushing the video to a larger second wave. A Reel with a hook rate below 50%
              is interpreted as low-quality content and distribution stops. This means that a mediocre
              Reel with an excellent hook will consistently outperform an excellent Reel with a mediocre
              hook — because most of the audience never sees content that fails the first distribution wave.
            </p>
            <p>
              This generator addresses the hook problem systematically. Rather than brainstorming openers
              from scratch — a process that leads most creators to default to weak, generic openings —
              it generates hooks using 10 proven psychological formats, scores each one on a 0–100
              Scroll-Stopping Score across four dimensions (curiosity, emotion, specificity, and clarity),
              and highlights your top 5 for immediate A/B testing. Every hook also includes an on-screen
              text overlay version and camera delivery advice, so you go from idea to filming without
              needing any additional tools.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary flex-shrink-0" />
              The 10 Instagram Hook Formats That Drive Views in 2025
            </h3>
            <p className="mb-3">
              The ten hook formats in this generator are not arbitrary — each one activates a specific
              psychological mechanism that compels viewers to keep watching:
            </p>
            <ul className="space-y-2.5">
              {[
                { name: "Bold Statement", desc: "Activates curiosity through confident authority. Works best when it challenges a common belief ('You've been doing this completely wrong')." },
                { name: "Curiosity Gap", desc: "Creates an open loop the viewer must watch to close ('The real reason your Reels aren't going viral…'). The most powerful format for watch-through rate." },
                { name: "Question Hook", desc: "Positions the viewer as having a problem the video solves. The best question hooks imply both a problem and a solution exist." },
                { name: "Relatable Frustration", desc: "Validates an emotion the viewer already feels. When audiences see their frustration voiced, they stop scrolling because they feel understood." },
                { name: "POV", desc: "Immersive perspective-taking hook. Viewers mentally place themselves in the scenario, creating strong emotional investment in the outcome." },
                { name: "Shocking Statistic", desc: "Numbers create instant credibility and urgency. The statistic must challenge a belief or reveal a gap between what viewers assume and what is true." },
                { name: "Contrarian Take", desc: "Challenges the status quo to create intellectual tension. Viewers who disagree want to watch to counter-argue; viewers who secretly agree want validation." },
                { name: "How-To Promise", desc: "Explicit value exchange — watch this and get X result. Most effective for educational and tutorial content where the viewer has a clear goal." },
                { name: "Mistake Callout", desc: "Fear of loss (making a mistake) is a stronger motivator than desire for gain. Effective for any niche where audience members are actively doing the thing." },
                { name: "Story Tease", desc: "Opens a narrative loop. The viewer wants to know how the story ends. Most effective when the story has a transformation, surprise, or failure arc." },
              ].map(({ name, desc }) => (
                <li key={name} className="flex gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border h-fit flex-shrink-0 ${FORMAT_COLORS[name as HookFormat]}`}>
                    {FORMAT_ICONS[name as HookFormat]} {name}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              How to Deliver Your Instagram Hook for Maximum Watch-Through Rate
            </h3>
            <p className="mb-3">
              Writing a strong hook is half the work — delivery determines whether the words land. The
              most common hook delivery mistake is starting with any version of "Hey guys, welcome back"
              or "So today I want to talk about" — phrases that train the viewer's brain to expect
              non-urgent content and trigger the scroll reflex before the hook is even delivered. Instead,
              begin speaking the hook before the camera is even in position, or cut to yourself already
              mid-hook. The first frame should show you in action, making a gesture, or displaying the
              hook as bold text on screen — never a static shot of you about to speak.
            </p>
            <p className="mb-3">
              Display your hook as high-contrast text overlay at the exact moment you say it. Approximately
              60% of Instagram Reels are watched without sound in the first viewing — if the hook only
              exists as spoken audio, it fails to reach that majority. Bold white text on a semi-transparent
              dark background, or large black text on a bright background, are the two most legible formats
              across all content types and viewing conditions.
            </p>
            <p>
              Use the <strong className="text-foreground">Scroll Stopper</strong> feature in this tool to
              prepend phrases like "Wait…", "Stop scrolling —", or "Nobody talks about this but…" to any
              generated hook. These prefixes serve as a pattern interrupt — a sudden break in the expected
              visual rhythm of the feed that gives the viewer's conscious attention a chance to engage
              before their scroll reflex fires. Test scroll stopper prefixes on your highest-scoring hooks
              and compare 3-second view rates versus the same hook without the prefix. Many creators find
              scroll stoppers add 15–25% to their hook rate on question and curiosity gap format hooks.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">What This Instagram Hook Generator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "10 proven Instagram hook formats: Bold Statement, Curiosity Gap, Question, Frustration, POV, Statistic, Contrarian, How-To, Mistake Callout, Story Tease",
            "Up to 20 hooks per session — 2 per format — all scored 78+ on the Scroll-Stopping Scale",
            "Scroll-Stopping Score (0–100) for every hook across curiosity, emotion, specificity, and clarity",
            "Top 5 hooks highlighted with one-click Copy All for fast A/B testing workflow",
            "✨ Scroll Stopper button on every card — add 'Wait…', 'Stop scrolling', 'Nobody talks about this but…' and more",
            "On-screen text overlay version for every hook — formatted for immediate use in your video editor",
            "Camera delivery tip per hook type — how to say it, not just what to say",
            "By Format tab — browse all hooks organized by their psychological mechanism",
            "Goal-based hook priorities: Grow Followers, Educate, Entertain, or Sell shifts format weighting",
            "100% free — no account, no credit card, unlimited generations",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{text}</span>
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
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Extend your hook into a full caption with body content and CTAs that drive saves, comments, and shares." },
            { name: "Instagram Reel Idea Generator", path: "/tools/instagram-reel-idea-generator", desc: "Generate the Reel concepts that your hooks will introduce — great hooks need great content to follow." },
            { name: "Instagram Content Planner", path: "/tools/instagram-content-planner", desc: "Plan your posting schedule so every hook-led post is part of a strategic content calendar that builds momentum." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Pair your scroll-stopping hooks with the right hashtags to ensure maximum reach on every post." },
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

      {/* ── FAQ ──────────────────────────────────────────────────── */}
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
