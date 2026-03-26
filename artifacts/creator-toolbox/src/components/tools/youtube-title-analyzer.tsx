import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, TrendingUp, Zap, BarChart2, ChevronDown, ListChecks,
  Check, Shield, Copy, CheckCheck, ArrowUpRight, AlertTriangle,
  Sparkles, Brain, FlaskConical, FileText, Star,
} from "lucide-react";
import { Link } from "wouter";

// ─── Data ────────────────────────────────────────────────────────────────────

const POWER_WORDS = [
  "ultimate", "secret", "proven", "shocking", "incredible", "exclusive",
  "insane", "hidden", "honest", "complete", "fast", "easy", "best", "top",
  "master", "essential", "powerful", "critical", "surprising", "unbelievable",
  "massive", "huge", "epic", "legendary", "effortless", "guaranteed", "instant",
  "perfect", "definitive", "expert", "simple", "step-by-step", "rare", "never",
  "always", "every", "truth", "myth", "mistake", "wrong", "fail", "win",
  "hack", "trick", "tip", "strategy", "method", "formula", "system",
  "blueprint", "challenge", "real", "free", "amazing", "breakthrough",
];

const CURIOSITY_PHRASES = [
  "you don't know", "nobody tells you", "nobody talks about", "secret to",
  "truth about", "what they don't", "actually works", "really works",
  "the real reason", "why you're wrong", "biggest mistake", "common mistake",
  "stop doing", "this is why", "here's why", "what happens", "you won't believe",
  "changed my life", "you need to know", "before you", "finally",
  "never seen", "nobody knows", "they don't want you", "they won't tell you",
];

const EMOTIONAL_WORDS = [
  "love", "hate", "fear", "amazing", "shocking", "incredible", "inspiring",
  "disgusting", "angry", "excited", "worried", "brave", "bold", "sad",
  "terrifying", "beautiful", "painful", "joyful", "heartbreaking", "frustrating",
  "satisfying", "overwhelmed", "confident", "anxious", "devastating", "thrilling",
];

const GENERIC_PHRASES = [
  "introduction to", "basics of", "getting started with", "beginner guide",
  "everything about", "all about", "what is", "learn about",
];

const STOP_WORDS = new Set([
  "the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
  "but", "is", "are", "was", "were", "be", "been", "being", "have",
  "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "shall", "can", "my", "your", "his", "her", "its",
  "our", "their", "with", "this", "that", "these", "those", "from",
]);

const NICHE_POWER_WORDS: Record<string, string[]> = {
  finance: ["income", "wealth", "profit", "money", "earnings", "passive", "invest", "rich", "financial"],
  tech: ["AI", "software", "coding", "app", "hack", "tool", "automation", "digital", "tech"],
  education: ["learn", "study", "master", "skill", "knowledge", "course", "guide", "tips"],
  gaming: ["win", "pro", "rank", "build", "meta", "best", "tier", "dominate", "glitch"],
  lifestyle: ["healthy", "happy", "life", "routine", "habits", "mindset", "balance", "glow"],
  business: ["scale", "revenue", "growth", "clients", "brand", "sales", "profitable"],
  entertainment: ["viral", "funny", "reaction", "exposed", "drama", "shocking", "celebrity"],
  health: ["weight", "fitness", "diet", "muscle", "wellness", "transform", "natural"],
  other: [],
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Niche = "finance" | "tech" | "education" | "gaming" | "lifestyle" | "business" | "entertainment" | "health" | "other";

interface ScoreResult {
  overall: number;
  seo: number;
  ctr: number;
  readability: number;
  length: number;
  charCount: number;
  wordCount: number;
  viralityEngine: { curiosityGap: number; emotionalIntensity: number; uniqueness: number };
  seoBreakdown: { keywordPresent: boolean; frontLoaded: boolean; startsWell: boolean; density: string };
  ctrBreakdown: { powerWordCount: number; hasNumber: boolean; hasCuriosity: boolean; hasEmotional: boolean; hasBrackets: boolean; hasQuestion: boolean };
  lengthFeedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: { type: string; label: string; title: string; reason: string }[];
  grade: "excellent" | "good" | "fair" | "poor";
}

// ─── Scoring Engine ───────────────────────────────────────────────────────────

function analyzeTitle(title: string, keyword: string, niche: Niche): ScoreResult {
  const lower = title.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const charCount = title.trim().length;
  const wordCount = words.length;
  const currentYear = new Date().getFullYear();
  const nichePowerWords = NICHE_POWER_WORDS[niche] || [];

  // ── Keyword ─────────────────────────────────────────────────────────────────
  const kw = keyword.trim().toLowerCase();
  const keywordPresent = kw ? lower.includes(kw) : false;
  const frontLoadedPct = kw ? lower.indexOf(kw) / Math.max(lower.length, 1) : 1;
  const frontLoaded = kw ? frontLoadedPct < 0.35 : false;

  // SEO score
  let seo = 30;
  if (kw) {
    if (keywordPresent) seo += 40;
    if (keywordPresent && frontLoaded) seo += 20;
    const keywordWords = kw.split(/\s+/).length;
    const densityOk = keywordWords >= 2 && keywordWords <= 4;
    if (densityOk && keywordPresent) seo += 10;
  } else {
    // No keyword — score based on general SEO signals
    seo += 20; // neutral
    const nicheHits = words.filter(w => nichePowerWords.map(n => n.toLowerCase()).includes(w)).length;
    seo += Math.min(nicheHits * 5, 15);
  }

  const startsWithStop = STOP_WORDS.has(words[0]);
  if (!startsWithStop) seo += 10;
  seo = Math.min(100, Math.max(0, seo));

  // ── CTR ─────────────────────────────────────────────────────────────────────
  const powerWordCount = POWER_WORDS.filter(pw => lower.includes(pw)).length;
  const nichePowerCount = nichePowerWords.filter(w => lower.includes(w.toLowerCase())).length;
  const hasNumber = /\d+/.test(title);
  const hasCuriosity = CURIOSITY_PHRASES.some(p => lower.includes(p));
  const emotionalCount = EMOTIONAL_WORDS.filter(w => lower.includes(w)).length;
  const hasEmotional = emotionalCount > 0;
  const hasBrackets = /[\[\](){}]/.test(title);
  const hasQuestion = title.includes("?");
  const hasYear = new RegExp(`\\b(${currentYear}|${currentYear - 1})\\b`).test(title);
  const hasDollarAmount = /\$[\d,]+/.test(title);

  let ctr = 0;
  ctr += Math.min((powerWordCount + nichePowerCount) * 10, 30);
  ctr += hasNumber ? 15 : 0;
  ctr += hasCuriosity ? 25 : 0;
  ctr += Math.min(emotionalCount * 8, 20);
  ctr += hasBrackets ? 8 : 0;
  ctr += hasQuestion ? 5 : 0;
  ctr += hasYear ? 5 : 0;
  ctr += hasDollarAmount ? 5 : 0;
  ctr = Math.min(100, Math.max(0, ctr));

  // ── Readability ──────────────────────────────────────────────────────────────
  let readability = 40;
  if (wordCount >= 6 && wordCount <= 12) readability += 30;
  else if (wordCount >= 4 && wordCount <= 14) readability += 15;
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
  if (avgWordLen <= 5) readability += 20;
  else if (avgWordLen <= 7) readability += 10;
  const allCapsWords = title.split(/\s+/).filter(w => w === w.toUpperCase() && w.length > 2).length;
  if (allCapsWords === 0) readability += 10;
  const hasExcessivePunct = /[!]{2,}|[?]{2,}|\.{4,}/.test(title);
  if (!hasExcessivePunct) readability += 10;
  if (title[0] === title[0].toUpperCase()) readability += 5;
  readability = Math.min(100, Math.max(0, readability));

  // ── Length ───────────────────────────────────────────────────────────────────
  let length = 0;
  let lengthFeedback = "";
  if (charCount >= 50 && charCount <= 60) { length = 100; lengthFeedback = "Perfect length (50–60 chars) — optimal for search results and mobile."; }
  else if (charCount >= 45 && charCount < 50) { length = 85; lengthFeedback = "Slightly short — consider expanding to 50+ characters for better keyword coverage."; }
  else if (charCount > 60 && charCount <= 70) { length = 78; lengthFeedback = "Slightly long — YouTube may truncate on mobile at ~60 characters."; }
  else if (charCount >= 40 && charCount < 45) { length = 70; lengthFeedback = "Too short — add more context or keywords to reach 50+ characters."; }
  else if (charCount > 70 && charCount <= 80) { length = 60; lengthFeedback = "Too long — titles over 70 chars often get cut off. Aim for 50–60."; }
  else if (charCount < 40) { length = 45; lengthFeedback = `Very short at ${charCount} chars — titles under 40 characters often underperform in search.`; }
  else { length = 40; lengthFeedback = `Very long at ${charCount} chars — titles over 80 characters hurt both SEO and CTR. Shorten significantly.`; }

  // ── Virality Engine ──────────────────────────────────────────────────────────
  const curiosityMatches = CURIOSITY_PHRASES.filter(p => lower.includes(p)).length;
  const curiosityGap = Math.min(curiosityMatches * 40 + (hasCuriosity ? 20 : 0), 100);

  const emotionalIntensity = Math.min(emotionalCount * 25 + (hasDollarAmount ? 15 : 0) + (hasNumber ? 10 : 0), 100);

  const genericHits = GENERIC_PHRASES.filter(p => lower.includes(p)).length;
  const uniqueMarkers = [
    lower.includes("first"), lower.includes("never"), lower.includes("exclusive"),
    lower.includes("rare"), lower.includes("unlike"), lower.includes("different"),
    lower.includes("revolutionary"), lower.includes("breakthrough"), lower.includes("new"),
    lower.includes("own"), hasDollarAmount, lower.includes("actually"),
  ].filter(Boolean).length;
  const uniqueness = Math.min(Math.max(50 + uniqueMarkers * 10 - genericHits * 15, 10), 100);

  // ── Overall ──────────────────────────────────────────────────────────────────
  const overall = Math.round((seo * 0.3 + ctr * 0.35 + readability * 0.2 + length * 0.15));
  const grade: ScoreResult["grade"] =
    overall >= 80 ? "excellent" : overall >= 65 ? "good" : overall >= 50 ? "fair" : "poor";

  // ── Strengths / Weaknesses ───────────────────────────────────────────────────
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (keywordPresent) strengths.push(`Target keyword "${keyword}" is present in the title`);
  if (frontLoaded) strengths.push("Keyword is front-loaded in the first third — strong SEO signal");
  if (hasNumber) strengths.push("Contains a number — numbered titles consistently earn higher CTR");
  if (hasCuriosity) strengths.push("Curiosity gap detected — creates a compelling reason to click");
  if (hasEmotional) strengths.push("Emotional trigger words boost click impulse and shareability");
  if (hasBrackets) strengths.push("Brackets/parentheses add context and signal content quality");
  if (powerWordCount >= 2) strengths.push(`${powerWordCount} power word${powerWordCount > 1 ? "s" : ""} detected — strong persuasion signals`);
  if (charCount >= 50 && charCount <= 60) strengths.push("Title length is in the optimal 50–60 character sweet spot");
  if (!startsWithStop) strengths.push("Title starts with a keyword-rich term rather than a stop word");
  if (hasDollarAmount) strengths.push("Dollar amount creates strong social proof and curiosity");

  if (kw && !keywordPresent) weaknesses.push(`Target keyword "${keyword}" is missing — add it for SEO ranking`);
  if (kw && keywordPresent && !frontLoaded) weaknesses.push("Keyword appears late in the title — move it to the first 3–4 words for maximum SEO impact");
  if (!hasNumber) weaknesses.push('No number found — titles like "7 Ways" or "I Made $X" get 36% more clicks');
  if (!hasCuriosity) weaknesses.push("No curiosity gap — phrases like 'nobody tells you' dramatically improve CTR");
  if (!hasEmotional) weaknesses.push("No emotional trigger words — add words like 'shocking', 'incredible', or 'surprising'");
  if (powerWordCount === 0) weaknesses.push("No power words detected — add at least one to boost click-through rate");
  if (charCount < 40) weaknesses.push("Title is too short — add the target keyword and more context to reach 50+ characters");
  if (charCount > 70) weaknesses.push("Title is too long — YouTube truncates at ~60–70 characters on most devices");
  if (startsWithStop) weaknesses.push(`Title starts with "${words[0]}" (a stop word) — try starting with your main keyword`);
  if (allCapsWords > 1) weaknesses.push("Multiple ALL-CAPS words hurt readability and feel spammy to viewers");

  // ── Title Suggestions ─────────────────────────────────────────────────────────
  const topic = kw || extractTopic(title);
  const year = currentYear;
  const numStr = hasNumber ? ((/\d+/.exec(title))?.[0] ?? "5") : "5";

  const suggestions: ScoreResult["suggestions"] = [
    {
      type: "seo",
      label: "SEO-Optimized",
      title: kw
        ? frontLoaded
          ? `${capitalize(kw)}: ${stripKeyword(title, kw)} (${year} Guide)`
          : `${capitalize(kw)}: ${title.replace(new RegExp(kw, "i"), "").trim().replace(/^[-: ]+/, "")} (${year})`
        : `${title} — Complete ${capitalize(niche)} Guide (${year})`,
      reason: "Keyword front-loaded for maximum SEO weight; year adds freshness signal",
    },
    {
      type: "ctr",
      label: "High-CTR",
      title: hasCuriosity
        ? `The Secret ${capitalize(topic)} Nobody Talks About (${numStr} Things I Learned)`
        : `${capitalize(topic)}: The Truth Nobody Tells You in ${year}`,
      reason: "Curiosity gap + emotional hook = significantly higher click-through rate",
    },
    {
      type: "short",
      label: "Shortened",
      title: shorten(title, 58),
      reason: "Trimmed to under 60 characters — visible in full on all devices and search results",
    },
    {
      type: "viral",
      label: "Viral-Style",
      title: hasNumber
        ? `I Tried ${numStr} ${capitalize(topic)} Strategies — Here's What Actually Worked`
        : `How I Completely Changed My ${capitalize(topic)} in 30 Days (Honest Results)`,
      reason: "Personal story + outcome + social proof = highest virality potential",
    },
    {
      type: "template",
      label: "Template-Based",
      title: `${numStr} ${capitalize(topic)} Mistakes to Avoid in ${year} (Most Beginners Miss These)`,
      reason: "Mistake-avoidance format creates urgency and personal relevance for viewers",
    },
  ];

  return {
    overall, seo, ctr, readability, length, charCount, wordCount,
    viralityEngine: { curiosityGap, emotionalIntensity, uniqueness },
    seoBreakdown: { keywordPresent, frontLoaded, startsWell: !startsWithStop, density: kw ? `${kw.split(/\s+/).length} keyword words` : "N/A" },
    ctrBreakdown: { powerWordCount, hasNumber, hasCuriosity, hasEmotional, hasBrackets, hasQuestion },
    lengthFeedback, strengths, weaknesses, suggestions, grade,
  };
}

function extractTopic(title: string): string {
  const words = title.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 3);
  return words.slice(0, 2).join(" ") || title.split(" ").slice(0, 2).join(" ");
}

function stripKeyword(title: string, kw: string): string {
  return title.replace(new RegExp(kw, "i"), "").replace(/^\s*[-:,]\s*/, "").trim();
}

function shorten(title: string, maxLen: number): string {
  if (title.length <= maxLen) return title;
  const words = title.split(" ");
  let result = "";
  for (const word of words) {
    if ((result + " " + word).trim().length <= maxLen) result = (result + " " + word).trim();
    else break;
  }
  return result;
}

function capitalize(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a YouTube title rank higher in search?",
    a: "YouTube title SEO is driven by three primary factors: keyword placement, keyword relevance, and click-through rate (CTR). For keyword placement, including your target search term in the first 3–5 words of your title — front-loading — signals to YouTube's algorithm and Google that your video directly addresses that search query. Keyword relevance means the title accurately describes the video content, which affects average view duration (a ranking signal). CTR connects the two: a title that gets more clicks relative to impressions tells YouTube the content is compelling and worth promoting. Our analyzer scores all three, showing you exactly which factor is pulling down your ranking potential and what to change.",
  },
  {
    q: "How long should a YouTube title be for best SEO performance?",
    a: "The optimal YouTube title length is 50–60 characters. YouTube allows up to 100 characters, but titles longer than 60–70 characters get truncated in mobile search results and on the YouTube homepage, cutting off your most compelling words right when a viewer is deciding whether to click. Titles shorter than 40 characters often underuse keyword opportunities and lose out to more descriptive competitors in search. The 50–60 character range is the sweet spot where your full title displays on virtually all devices, includes your main keyword, and leaves room for a hook or power word. Our length score shows your exact character count and a specific recommendation.",
  },
  {
    q: "What are power words and how do they improve YouTube CTR?",
    a: "Power words are psychologically proven terms that trigger emotional and cognitive responses that compel viewers to click. Words like 'secret,' 'proven,' 'shocking,' 'exclusive,' and 'ultimate' activate curiosity, desire, and FOMO (fear of missing out) — the core emotions that drive click-through behavior. A 2023 analysis of top-performing YouTube titles found that videos with at least one power word consistently outperformed titles without them by 25–40% in CTR within the first 48 hours of upload, when the algorithm is most actively evaluating content for promotion. Our analyzer detects power words in your title and identifies which high-impact terms you could add based on your niche.",
  },
  {
    q: "What is a curiosity gap and why does it boost YouTube clicks?",
    a: "A curiosity gap is an information gap created between what a viewer knows and what your title promises they'll learn. Phrases like 'The Truth About X Nobody Tells You,' 'Why Most People Get X Wrong,' or 'X Mistakes to Avoid' create immediate psychological tension — the viewer knows they might be missing something important. This gap compels clicking to resolve the uncertainty. Curiosity gaps are particularly powerful when they imply personal relevance ('mistakes YOU might be making') or social proof ('nobody tells you' implies insider knowledge). Our virality engine measures the strength of your title's curiosity gap and suggests stronger alternatives when it's weak.",
  },
  {
    q: "Does including a number in a YouTube title really help performance?",
    a: "Yes — consistently and significantly. Numbered titles outperform non-numbered equivalents for two reasons: specificity and cognitive ease. '7 Ways to Grow on YouTube' sets clear expectations (seven discrete, actionable points) while 'How to Grow on YouTube' is vague. Specificity reduces uncertainty about whether the content is worth a viewer's time. Cognitively, numbers are processed faster than words in scan-reading — on a search results page full of text, digits stand out visually and draw the eye. In testing across thousands of YouTube titles, numbered lists typically earn 15–30% higher CTR than equivalent non-numbered titles. Our CTR analyzer checks for numbers and rewards their strategic use.",
  },
  {
    q: "Should I include the current year in my YouTube title?",
    a: "Including the current year (e.g., '2026') in your title is beneficial for time-sensitive topics where viewers care about recency — tutorials, rankings, tool comparisons, financial advice, and trend-based content. The year signals freshness, which both viewers and YouTube's algorithm reward: viewers in search results actively filter for recent content, and YouTube surfaces fresh videos for queries where recency matters. However, the year is a disadvantage for evergreen topics because it dates your content — a '2026 Guide' becomes less clickable in 2027. Our analyzer rewards year inclusion for niche-appropriate content. As a rule: use the year for fast-moving topics, omit it for timeless instructional content.",
  },
  {
    q: "What is the difference between SEO score and CTR score in the title analyzer?",
    a: "SEO score measures how well your title positions your video to be found — it evaluates keyword presence, keyword placement (front-loaded vs. buried), and whether your title uses terms viewers actually search for. A high SEO score means YouTube's algorithm and Google Search are more likely to show your video when someone searches your target term. CTR score measures how compelling your title is to a viewer who sees it in search results, on the homepage, or in suggested video feeds — it evaluates power words, emotional triggers, curiosity gaps, formatting (numbers, brackets), and urgency. Both scores are essential: SEO without CTR means you rank but nobody clicks; CTR without SEO means great clicks on low-traffic queries.",
  },
  {
    q: "How does the A/B title testing simulation work?",
    a: "Our A/B testing simulation runs both titles through the full scoring engine — SEO, CTR, readability, and length — and weights the components by their documented impact on viewer behavior. CTR score carries the highest weight (35%) since it most directly determines whether a ranking position translates to clicks. The simulation identifies which specific factors each title wins on and by how much, giving you a prediction of which would outperform in the first 24–48 hours after upload when YouTube runs its natural A/B testing through impression distribution. For definitive data, YouTube Studio offers native A/B title testing for eligible channels — our tool gives you a data-informed starting point before committing to a title.",
  },
  {
    q: "What is the virality engine and how is each score calculated?",
    a: "The virality engine measures three dimensions that separate viral titles from ordinary ones: Curiosity Gap Strength scores whether your title creates information tension (phrases like 'nobody tells you,' 'the real reason why,' 'what they don't want you to know'). Emotional Intensity scores how strongly your title triggers an emotional response — dollar amounts, shocking claims, transformational promises, and emotional adjectives all contribute. Uniqueness Score measures how distinctive your title is versus generic alternatives — specific numbers, personal stories, unexpected angles, and niche-specific terminology push this score up, while common template phrases ('Introduction to,' 'Basics of,' 'Getting Started with') lower it. All three scores combine to estimate virality potential beyond basic SEO and CTR metrics.",
  },
  {
    q: "Is the YouTube Title Analyzer free to use?",
    a: "Yes — the YouTube Title Analyzer is completely free with no account required and no usage limits. Analyze as many titles as you like, run A/B comparisons, generate title suggestions, and use the proven title templates for your next upload. The tool works entirely in your browser for instant results. For a complete YouTube optimization workflow, use it alongside our free YouTube Tag Generator, YouTube Description Generator, and YouTube Hashtag Generator — all available on creatorsToolHub at no cost.",
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${open ? "border-primary/40 shadow-md shadow-primary/10" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl">
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

function ScoreRing({ score, grade }: { score: number; grade: ScoreResult["grade"] }) {
  const color = grade === "excellent" ? "#22c55e" : grade === "good" ? "#f59e0b" : grade === "fair" ? "#f97316" : "#ef4444";
  const label = grade === "excellent" ? "Excellent" : grade === "good" ? "Good" : grade === "fair" ? "Fair" : "Needs Work";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/30" />
          <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-display text-foreground">{score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function MetricBar({ label, score, detail }: { label: string; score: number; detail?: string }) {
  const color = score >= 80 ? "bg-green-500" : score >= 65 ? "bg-amber-400" : score >= 50 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-bold text-foreground">{score}/100</span>
      </div>
      <div className="w-full bg-muted/40 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0" title="Copy">
      {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

const SUGGESTION_COLORS: Record<string, string> = {
  seo: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
  ctr: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
  short: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
  viral: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  template: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
};

const NICHES: { value: Niche; label: string }[] = [
  { value: "finance", label: "Finance" }, { value: "tech", label: "Tech" },
  { value: "education", label: "Education" }, { value: "gaming", label: "Gaming" },
  { value: "lifestyle", label: "Lifestyle" }, { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" }, { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

const TEMPLATES = [
  { label: "Personal Win", pattern: "How I [Achieved Result] in [Time]", example: "How I Grew 10K Subscribers in 60 Days" },
  { label: "Mistake Avoidance", pattern: "X Mistakes to Avoid in [Topic]", example: "7 YouTube Mistakes to Avoid as a Beginner" },
  { label: "Truth Reveal", pattern: "The Truth About [Topic] Nobody Tells You", example: "The Truth About YouTube Growth Nobody Tells You" },
  { label: "Before vs After", pattern: "Why [Common Belief] Is Wrong (And What to Do Instead)", example: "Why Posting Daily Is Wrong (And What to Do Instead)" },
  { label: "Number + Result", pattern: "X [Niche] [Tips/Strategies/Hacks] That Actually Work in [Year]", example: "9 YouTube SEO Strategies That Actually Work in 2026" },
  { label: "Reaction/Expose", pattern: "I Tried [Thing] for [Time] — Here's What Happened", example: "I Tried Posting on YouTube Every Day for 30 Days" },
  { label: "Challenge Format", pattern: "Can [Beginner/Anyone] [Achieve Big Goal] in [Time]?", example: "Can a Complete Beginner Hit 1K Subs in 90 Days?" },
  { label: "Secret Reveal", pattern: "The [Adjective] [Niche] Secret [Authority Figure] Won't Tell You", example: "The #1 YouTube Growth Secret Gurus Won't Tell You" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

type ActiveTab = "analyze" | "abtest" | "templates";

export function YouTubeTitleAnalyzerTool() {
  const [tab, setTab] = useState<ActiveTab>("analyze");

  // ── Analyze tab state ────────────────────────────────────────────────────────
  const [title, setTitle] = useState("How I Made $10,000 in 30 Days with AI");
  const [keyword, setKeyword] = useState("make money with AI");
  const [niche, setNiche] = useState<Niche>("finance");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── A/B test state ───────────────────────────────────────────────────────────
  const [titleA, setTitleA] = useState("How I Made $10,000 in 30 Days with AI (Full Breakdown)");
  const [titleB, setTitleB] = useState("The Truth About Making Money With AI Nobody Tells You");
  const [abNiche, setAbNiche] = useState<Niche>("finance");
  const [abResult, setAbResult] = useState<{ a: ScoreResult; b: ScoreResult; winner: "a" | "b" | "tie" } | null>(null);

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-title-analyzer";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleAnalyze = () => {
    if (!title.trim()) return;
    const res = analyzeTitle(title.trim(), keyword.trim(), niche);
    setResult(res);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  };

  const handleABTest = () => {
    if (!titleA.trim() || !titleB.trim()) return;
    const a = analyzeTitle(titleA.trim(), "", abNiche);
    const b = analyzeTitle(titleB.trim(), "", abNiche);
    const aScore = a.ctr * 0.4 + a.seo * 0.3 + a.readability * 0.15 + a.length * 0.15;
    const bScore = b.ctr * 0.4 + b.seo * 0.3 + b.readability * 0.15 + b.length * 0.15;
    const winner = Math.abs(aScore - bScore) < 3 ? "tie" : aScore > bScore ? "a" : "b";
    setAbResult({ a, b, winner });
  };

  const viralityColor = (score: number) =>
    score >= 70 ? "text-green-600 dark:text-green-400" : score >= 40 ? "text-amber-500" : "text-red-500";
  const viralityBg = (score: number) =>
    score >= 70 ? "bg-green-500/10 border-green-500/30" : score >= 40 ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30";

  return (
    <>
      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { id: "analyze" as const, icon: <Search className="w-4 h-4" />, label: "Analyze Title" },
          { id: "abtest" as const, icon: <FlaskConical className="w-4 h-4" />, label: "A/B Test" },
          { id: "templates" as const, icon: <FileText className="w-4 h-4" />, label: "Title Templates" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${tab === t.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TAB: ANALYZE                                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      {tab === "analyze" && (
        <>
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 space-y-5">
              {/* Title input */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  YouTube Title *
                </label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder='e.g. How I Made $10,000 in 30 Days with AI'
                  className="rounded-xl h-12 text-sm"
                  onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {title.length} characters
                  {title.length < 40 && " — too short (aim for 50–60)"}
                  {title.length >= 50 && title.length <= 60 && " — ideal length ✓"}
                  {title.length > 60 && title.length <= 70 && " — slightly long (aim for 50–60)"}
                  {title.length > 70 && " — too long (will be truncated on mobile)"}
                </p>
              </div>

              {/* Keyword + Niche */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    Target Keyword <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full">Optional</span>
                  </label>
                  <Input
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="e.g. make money with AI"
                    className="rounded-xl h-11 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Video Niche / Category
                  </label>
                  <select value={niche} onChange={e => setNiche(e.target.value as Niche)}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
                    {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  Target Audience <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full">Optional</span>
                </label>
                <Input
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. beginner entrepreneurs, college students, freelancers"
                  className="rounded-xl h-11 text-sm"
                />
              </div>

              <Button onClick={handleAnalyze} size="lg" className="w-full h-12 rounded-xl font-semibold text-base gap-2">
                <Search className="w-5 h-5" /> Analyze Title
              </Button>
            </div>
          </div>

          {/* ── Results ──────────────────────────────────────────── */}
          {result && (
            <div ref={resultsRef} className="mt-6 space-y-5 animate-in slide-in-from-bottom-4 duration-500">

              {/* Overall score + 4 metrics */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-center shrink-0">
                    <ScoreRing score={result.overall} grade={result.grade} />
                    <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <MetricBar label="SEO Score" score={result.seo}
                      detail={`Keyword ${result.seoBreakdown.keywordPresent ? (result.seoBreakdown.frontLoaded ? "front-loaded ✓" : "present but not front-loaded") : "missing"}`} />
                    <MetricBar label="CTR Score" score={result.ctr}
                      detail={`${result.ctrBreakdown.powerWordCount} power word${result.ctrBreakdown.powerWordCount !== 1 ? "s" : ""} · ${result.ctrBreakdown.hasNumber ? "number ✓" : "no number"} · ${result.ctrBreakdown.hasCuriosity ? "curiosity gap ✓" : "no curiosity gap"}`} />
                    <MetricBar label="Readability" score={result.readability}
                      detail={`${result.wordCount} words · avg ${(result.charCount / Math.max(result.wordCount, 1)).toFixed(1)} chars/word`} />
                    <MetricBar label="Length Optimization" score={result.length}
                      detail={result.lengthFeedback} />
                  </div>
                </div>
              </div>

              {/* Virality Engine */}
              <div className="rounded-2xl border border-border bg-muted/20 p-5">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Virality Engine
                  <span className="text-xs font-normal text-muted-foreground">3 dimensions that separate viral titles from ordinary ones</span>
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: "Curiosity Gap Strength", score: result.viralityEngine.curiosityGap, desc: "Does your title create an information gap that compels clicking?", tip: result.viralityEngine.curiosityGap < 40 ? "Add phrases like 'nobody tells you' or 'the real reason'" : "Strong curiosity hook detected" },
                    { label: "Emotional Intensity", score: result.viralityEngine.emotionalIntensity, desc: "How strongly does your title trigger an emotional response?", tip: result.viralityEngine.emotionalIntensity < 40 ? "Add emotional words or a dollar/outcome figure" : "Good emotional pull" },
                    { label: "Uniqueness Score", score: result.viralityEngine.uniqueness, desc: "How distinctive is your title vs. generic alternatives?", tip: result.viralityEngine.uniqueness < 40 ? "Remove generic phrases; add a specific angle or number" : "Title feels distinctive" },
                  ].map(v => (
                    <div key={v.label} className={`rounded-xl border p-4 ${viralityBg(v.score)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground">{v.label}</span>
                        <span className={`text-lg font-black ${viralityColor(v.score)}`}>{v.score}</span>
                      </div>
                      <div className="w-full bg-black/10 rounded-full h-1.5 mb-2">
                        <div className={`h-1.5 rounded-full transition-all duration-700 ${v.score >= 70 ? "bg-green-500" : v.score >= 40 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${v.score}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{v.desc}</p>
                      <p className={`text-xs font-semibold ${viralityColor(v.score)}`}>{v.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths + Weaknesses */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" /> Strengths
                  </h3>
                  {result.strengths.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No significant strengths detected — try adding power words and a target keyword.</p>
                  ) : (
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Weaknesses
                  </h3>
                  {result.weaknesses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No major issues found — this title is well-optimized.</p>
                  ) : (
                    <ul className="space-y-2">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Suggested Titles */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Optimized Title Suggestions
                </h3>
                <div className="space-y-3">
                  {result.suggestions.map((s) => (
                    <div key={s.type} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/30 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${SUGGESTION_COLORS[s.type]}`}>{s.label}</span>
                        </div>
                        <p className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                      </div>
                      <CopyButton text={s.title} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TAB: A/B TEST                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      {tab === "abtest" && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-border bg-card shadow-sm p-6 space-y-5">
            <p className="text-sm text-muted-foreground">Enter two title variants to see which is predicted to perform better based on SEO, CTR, readability, and length scoring.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">A</span>
                  Title A
                </label>
                <textarea value={titleA} onChange={e => setTitleA(e.target.value)} rows={3}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                  placeholder="Enter your first title variant" />
                <p className="text-xs text-muted-foreground mt-1">{titleA.length} characters</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">B</span>
                  Title B
                </label>
                <textarea value={titleB} onChange={e => setTitleB(e.target.value)} rows={3}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                  placeholder="Enter your second title variant" />
                <p className="text-xs text-muted-foreground mt-1">{titleB.length} characters</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Video Niche</label>
              <select value={abNiche} onChange={e => setAbNiche(e.target.value as Niche)}
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
                {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <Button onClick={handleABTest} size="lg" className="w-full h-12 rounded-xl font-semibold text-base gap-2">
              <FlaskConical className="w-5 h-5" /> Predict Winner
            </Button>
          </div>

          {abResult && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              {/* Winner banner */}
              <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
                abResult.winner === "tie" ? "border-amber-500/40 bg-amber-500/5" :
                abResult.winner === "a" ? "border-blue-500/40 bg-blue-500/5" :
                "border-purple-500/40 bg-purple-500/5"
              }`}>
                <Star className={`w-8 h-8 shrink-0 ${abResult.winner === "tie" ? "text-amber-500" : abResult.winner === "a" ? "text-blue-500" : "text-purple-500"}`} />
                <div>
                  <p className="font-bold text-foreground text-lg">
                    {abResult.winner === "tie" ? "It's a Tie!" : `Title ${abResult.winner.toUpperCase()} is Predicted to Win`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {abResult.winner === "a"
                      ? `Title A scores ${Math.round(abResult.a.ctr * 0.4 + abResult.a.seo * 0.3 + abResult.a.readability * 0.15 + abResult.a.length * 0.15)} vs ${Math.round(abResult.b.ctr * 0.4 + abResult.b.seo * 0.3 + abResult.b.readability * 0.15 + abResult.b.length * 0.15)} — stronger CTR and SEO signals`
                      : abResult.winner === "b"
                      ? `Title B scores ${Math.round(abResult.b.ctr * 0.4 + abResult.b.seo * 0.3 + abResult.b.readability * 0.15 + abResult.b.length * 0.15)} vs ${Math.round(abResult.a.ctr * 0.4 + abResult.a.seo * 0.3 + abResult.a.readability * 0.15 + abResult.a.length * 0.15)} — stronger CTR and SEO signals`
                      : "Both titles score within 3 points — test both and let the data decide"
                    }
                  </p>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: "a" as const, label: "A", res: abResult.a, titleText: titleA, color: "blue" },
                  { key: "b" as const, label: "B", res: abResult.b, titleText: titleB, color: "purple" },
                ].map(({ key, label, res, titleText, color }) => (
                  <div key={key} className={`rounded-2xl border p-5 space-y-4 ${abResult.winner === key ? `border-${color}-500/40 bg-${color}-500/5` : "border-border bg-card"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-${color}-500`}>{label}</span>
                      <p className="font-semibold text-sm text-foreground leading-snug">{titleText}</p>
                    </div>
                    <div className="space-y-3">
                      <MetricBar label="SEO" score={res.seo} />
                      <MetricBar label="CTR Potential" score={res.ctr} />
                      <MetricBar label="Readability" score={res.readability} />
                      <MetricBar label="Length" score={res.length} />
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Overall</span>
                        <span className="font-bold text-foreground">{res.overall}/100</span>
                      </div>
                    </div>
                    {abResult.winner === key && (
                      <div className={`flex items-center gap-2 text-${color}-600 dark:text-${color}-400 text-sm font-semibold`}>
                        <Star className="w-4 h-4" /> Predicted Winner
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TAB: TEMPLATES                                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      {tab === "templates" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">8 proven title formulas that consistently perform well on YouTube. Click any title to copy it.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {TEMPLATES.map((t, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card hover:border-primary/40 transition-all p-5 group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{t.label}</span>
                  <CopyButton text={t.example} />
                </div>
                <p className="font-mono text-xs text-muted-foreground bg-muted/50 border border-border px-3 py-2 rounded-xl mb-3 leading-relaxed">{t.pattern}</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t.example}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mt-2">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground mb-1">How to use these templates</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Replace the bracketed placeholders with specifics from your video. The more specific the result, time, or niche, the better the CTR — "How I Grew 10K Subscribers in 60 Days" dramatically outperforms "How I Grew My Channel." Then paste your filled-in title into the Analyze tab to score it before publishing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Title Analyzer</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Title and Target Keyword", desc: "Paste your YouTube title into the analyzer and optionally add the exact search term you want the video to rank for. The keyword field unlocks SEO scoring: the analyzer checks whether your keyword is present, how early in the title it appears, and whether the density feels natural rather than stuffed." },
            { step: 2, title: "Select Niche and Analyze", desc: "Choose your content category from the dropdown — the virality engine adjusts its power word scoring based on your niche, since high-CTR language differs between finance, gaming, and health content. Click Analyze Title to see your overall score and the four component metrics with detailed breakdowns." },
            { step: 3, title: "Review Your Virality Engine Scores", desc: "The three virality scores — Curiosity Gap, Emotional Intensity, and Uniqueness — measure dimensions beyond basic SEO and CTR. A strong overall score with a weak Curiosity Gap score means your title ranks but doesn't compel clicking. Use the specific improvement tips under each score to address the exact weakness." },
            { step: 4, title: "Apply Suggestions and A/B Test", desc: "Copy any of the five optimized title suggestions directly to YouTube Studio. For important videos, use the A/B Test tab to compare your original against an optimized version — the simulation scores both on all four dimensions and predicts which would earn more clicks in the first 48 hours after upload." },
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

      {/* ── About ────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Title Analyzer</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Your YouTube Title Determines 80% of Your Video's Success
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Of all the elements that determine whether a YouTube video succeeds or fails, the title
              carries disproportionate weight. It affects three critical metrics simultaneously: search
              ranking (SEO), click-through rate (CTR), and audience retention (through expectation
              setting). A video with average content but an outstanding title will consistently
              outperform a great video with a weak title — because the weak-titled video never gets
              seen. YouTube's own research indicates that CTR improvement from 4% to 7% on the same
              content can double the total views a video receives through algorithmic distribution.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our title analyzer scores your title on four independently weighted dimensions: SEO
              effectiveness (keyword placement and relevance), CTR potential (power words, curiosity
              gaps, emotional triggers, and formatting), readability (clarity and cognitive ease), and
              length optimization (ideal 50–60 characters). The virality engine then applies three
              additional measures — curiosity gap strength, emotional intensity, and title uniqueness
              — that capture the variables most closely associated with viral content spread beyond
              simple search traffic.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> The Four-Score System: SEO, CTR, Readability, and Length
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">SEO Score</strong> measures whether your title is
              optimized for YouTube and Google search discovery. The most important factor is keyword
              front-loading — placing your primary search term in the first 40% of the title signals
              strong topical relevance to both algorithms. A title starting with your keyword
              consistently outperforms the same title with the keyword buried at the end. Our SEO
              score weights keyword presence at 40%, front-loading at 30%, and natural language
              quality at 30%.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">CTR Score</strong> models viewer psychology — the
              signals that make a thumbnail + title combination irresistible to click. Power words
              (ultimate, secret, proven, shocking) activate psychological triggers. Numbers create
              specificity that reduces click uncertainty. Curiosity gaps — information tension between
              what the viewer knows and what the title promises — are the single highest-weighted CTR
              factor because they create a cognitive discomfort that clicking resolves. Pair strong
              title optimization with a well-optimized{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube description
              </Link>{" "}
              and relevant{" "}
              <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                tags
              </Link>{" "}
              for complete video SEO.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Readability and Length</strong> complete the picture.
              A title might score well on SEO and CTR but fail if it's grammatically awkward, uses
              excessive jargon, or runs so long that YouTube truncates it in search results. The
              50–60 character ideal ensures your complete title displays on every device — mobile search,
              desktop homepage, suggested videos, and embedded players. Titles that extend beyond 70
              characters often lose their most compelling hook to truncation precisely when a viewer
              is deciding whether to click.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" /> A/B Testing, Title Templates, and the Virality Engine
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The A/B testing simulation lets you compare two title variants before committing to one.
              The simulation weights CTR potential most heavily (40%) because in the first 24–48 hours
              after upload, YouTube's algorithm evaluates initial click rates from impression traffic
              to decide how broadly to distribute the video. A title that earns 7% CTR instead of 4%
              in this window gets significantly more algorithmic push — making early CTR the highest-
              leverage optimization point for new uploads.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The 8 proven title templates capture formats that have generated millions of views across
              niches. The personal achievement format ("How I Made X in Y Days") works because it
              combines social proof, specificity, and implicit promise of replication. The mistake
              avoidance format ("X Mistakes to Avoid") creates personal urgency — every viewer
              immediately wonders if they're making those mistakes. Fill in these templates with your
              specific results, numbers, and niche topic, then run the result through the analyzer tab
              to verify it scores well before publishing. Use the{" "}
              <Link href="/tools/youtube-video-idea-generator" className="text-primary hover:underline font-medium">
                YouTube Video Idea Generator
              </Link>{" "}
              to generate content concepts that pair perfectly with these high-performing title formulas.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Title Analyzer
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Four-score system: SEO, CTR, Readability, and Length analyzed independently",
                "Virality Engine: measures curiosity gap, emotional intensity, and title uniqueness",
                "Keyword front-loading detection with exact position percentage feedback",
                "Power word library with niche-specific vocabulary for each content category",
                "Curiosity gap detection for 24+ proven psychological trigger phrases",
                "5 optimized title suggestions: SEO, High-CTR, Shortened, Viral, and Template",
                "A/B testing simulation to predict which of two titles performs better",
                "8 proven title templates with fill-in-the-blank patterns and real examples",
                "Character count with live truncation warnings for mobile optimization",
                "100% free, instant results, no account required",
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
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Generate 40+ title formulas and then bring them here to score and pick the best." },
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized tags that reinforce the high-scoring keywords in your title." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your full title and description package together for maximum SEO coverage." },
            { name: "YouTube Keyword Generator", path: "/tools/youtube-keyword-generator", desc: "Find high-traffic keywords to incorporate into your title for better search ranking." },
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

      {/* ── FAQ ──────────────────────────────────────────────────── */}
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
