import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ChevronDown, Check, BarChart2, TrendingUp, Shield,
  ListChecks, Search, Zap, ThumbsUp, MessageSquare,
  Share2, AlertTriangle, Target, ArrowRight, Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche = "gaming" | "entertainment" | "education" | "tech" | "finance" | "lifestyle" | "health" | "travel" | "food" | "general";

interface NicheConfig {
  label: string;
  avgLow: number;
  avgHigh: number;
  goodThreshold: number;
  viralThreshold: number;
  shareMultiplierLow: number;
  shareMultiplierHigh: number;
}

const NICHE_CONFIG: Record<Niche, NicheConfig> = {
  gaming:        { label: "Gaming",        avgLow: 3,   avgHigh: 6,   goodThreshold: 6,   viralThreshold: 8,  shareMultiplierLow: 0.10, shareMultiplierHigh: 0.15 },
  entertainment: { label: "Entertainment", avgLow: 3,   avgHigh: 7,   goodThreshold: 6,   viralThreshold: 10, shareMultiplierLow: 0.10, shareMultiplierHigh: 0.15 },
  education:     { label: "Education",     avgLow: 2,   avgHigh: 4,   goodThreshold: 4,   viralThreshold: 7,  shareMultiplierLow: 0.05, shareMultiplierHigh: 0.08 },
  tech:          { label: "Tech",          avgLow: 2,   avgHigh: 4,   goodThreshold: 4,   viralThreshold: 7,  shareMultiplierLow: 0.06, shareMultiplierHigh: 0.10 },
  finance:       { label: "Finance",       avgLow: 1.5, avgHigh: 3.5, goodThreshold: 3.5, viralThreshold: 6,  shareMultiplierLow: 0.04, shareMultiplierHigh: 0.07 },
  lifestyle:     { label: "Lifestyle",     avgLow: 2,   avgHigh: 5,   goodThreshold: 5,   viralThreshold: 8,  shareMultiplierLow: 0.07, shareMultiplierHigh: 0.12 },
  health:        { label: "Health",        avgLow: 2,   avgHigh: 4.5, goodThreshold: 4.5, viralThreshold: 7,  shareMultiplierLow: 0.06, shareMultiplierHigh: 0.10 },
  travel:        { label: "Travel",        avgLow: 2,   avgHigh: 5,   goodThreshold: 5,   viralThreshold: 8,  shareMultiplierLow: 0.08, shareMultiplierHigh: 0.12 },
  food:          { label: "Food",          avgLow: 2,   avgHigh: 5,   goodThreshold: 5,   viralThreshold: 8,  shareMultiplierLow: 0.08, shareMultiplierHigh: 0.13 },
  general:       { label: "General",       avgLow: 1,   avgHigh: 3,   goodThreshold: 3,   viralThreshold: 6,  shareMultiplierLow: 0.05, shareMultiplierHigh: 0.10 },
};

interface EngagementResult {
  engagementRate: number;
  likeRate: number;
  commentRate: number;
  shareRate: number;
  estimatedShares: number;
  sharesWereEstimated: boolean;
  performanceRating: "Poor" | "Average" | "Good" | "Excellent" | "Viral";
  performanceColor: string;
  performanceBg: string;
  nicheLabel: string;
  benchmarkLow: number;
  benchmarkHigh: number;
  benchmarkStatus: string;
  strengths: string[];
  weaknesses: string[];
  likeRecs: string[];
  commentRecs: string[];
  shareRecs: string[];
  growthSteps: string[];
}

// ─── Calculation Engine ───────────────────────────────────────────────────────

function computeEngagement(
  views: number,
  likes: number,
  comments: number,
  sharesRaw: number | null,
  niche: Niche,
  videoLengthMin: number | null,
  uploadAgeDays: number | null,
): EngagementResult {
  const cfg = NICHE_CONFIG[niche];
  const sharesWereEstimated = sharesRaw === null;
  const estimatedShares = sharesWereEstimated
    ? Math.round(likes * ((cfg.shareMultiplierLow + cfg.shareMultiplierHigh) / 2))
    : sharesRaw!;
  const shares = estimatedShares;

  const total = likes + comments + shares;
  const engagementRate = views > 0 ? (total / views) * 100 : 0;
  const likeRate = views > 0 ? (likes / views) * 100 : 0;
  const commentRate = views > 0 ? (comments / views) * 100 : 0;
  const shareRate = views > 0 ? (shares / views) * 100 : 0;

  // Performance rating (general + niche-adjusted)
  let performanceRating: EngagementResult["performanceRating"];
  let performanceColor: string;
  let performanceBg: string;

  if (engagementRate < 1) {
    performanceRating = "Poor"; performanceColor = "text-red-600 dark:text-red-400"; performanceBg = "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  } else if (engagementRate < cfg.avgLow) {
    performanceRating = "Average"; performanceColor = "text-amber-600 dark:text-amber-400"; performanceBg = "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
  } else if (engagementRate < cfg.goodThreshold) {
    performanceRating = "Good"; performanceColor = "text-blue-600 dark:text-blue-400"; performanceBg = "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  } else if (engagementRate < cfg.viralThreshold) {
    performanceRating = "Excellent"; performanceColor = "text-green-600 dark:text-green-400"; performanceBg = "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
  } else {
    performanceRating = "Viral"; performanceColor = "text-purple-600 dark:text-purple-400"; performanceBg = "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
  }

  // Benchmark status
  const benchmarkLow = cfg.avgLow;
  const benchmarkHigh = cfg.avgHigh;
  let benchmarkStatus = "";
  if (engagementRate >= cfg.viralThreshold) benchmarkStatus = `Your ${engagementRate.toFixed(2)}% engagement is viral-level for ${cfg.label} (threshold: ${cfg.viralThreshold}%+)`;
  else if (engagementRate >= cfg.goodThreshold) benchmarkStatus = `Your ${engagementRate.toFixed(2)}% is excellent — above the ${cfg.label} niche average of ${benchmarkLow}–${benchmarkHigh}%`;
  else if (engagementRate >= benchmarkLow) benchmarkStatus = `Your ${engagementRate.toFixed(2)}% is within the ${cfg.label} average range of ${benchmarkLow}–${benchmarkHigh}%`;
  else benchmarkStatus = `Your ${engagementRate.toFixed(2)}% is below the ${cfg.label} average of ${benchmarkLow}–${benchmarkHigh}% — focus on the recommendations below`;

  // Context adjustments
  const isNew = uploadAgeDays !== null && uploadAgeDays <= 3;
  const isLong = videoLengthMin !== null && videoLengthMin > 20;

  // Strengths
  const strengths: string[] = [];
  if (likeRate >= 3) strengths.push(`Strong like rate (${likeRate.toFixed(2)}%) — viewers clearly find this content valuable and appealing`);
  if (commentRate >= 0.5) strengths.push(`Healthy comment rate (${commentRate.toFixed(2)}%) — content is sparking genuine conversation`);
  if (shareRate >= 0.3) strengths.push(`Good share rate (${shareRate.toFixed(2)}%) — people are recommending this video to others`);
  if (engagementRate >= benchmarkHigh) strengths.push(`Overall engagement rate (${engagementRate.toFixed(2)}%) outperforms the ${cfg.label} niche average`);
  if (isNew && engagementRate >= 2) strengths.push("Strong early engagement for a recently uploaded video — the algorithm will push this further");
  if (strengths.length === 0) strengths.push("Views are being generated — the foundation for improving engagement is there");

  // Weaknesses
  const weaknesses: string[] = [];
  if (likeRate < 1.5) weaknesses.push(`Like rate is low (${likeRate.toFixed(2)}%) — content may not be motivating viewers to react`);
  if (commentRate < 0.2) weaknesses.push(`Comment rate is very low (${commentRate.toFixed(2)}%) — no strong interaction trigger is present in the video`);
  if (shareRate < 0.1) weaknesses.push(`Share rate is low (${shareRate.toFixed(2)}%) — content isn't "share-worthy" enough yet`);
  if (views > 10000 && engagementRate < 1) weaknesses.push(`Despite ${views.toLocaleString()} views, engagement rate is under 1% — possible audience-content mismatch`);
  if (isLong && commentRate < 0.3) weaknesses.push("Long-form video with low comments — add a discussion question mid-video to drive interaction");
  if (weaknesses.length === 0) weaknesses.push("Metrics look healthy — focus on scaling what's already working");

  // Recommendations
  const likeRecs = [
    "Ask viewers to like at the start ('If you find this useful, smash that like button') and remind once at the end",
    "Deliver your best value in the first 60 seconds to build goodwill before asking for engagement",
    "Create an emotional moment — humor, surprise, or inspiration significantly boosts like rate",
    "Improve your hook — viewers who stay past 30 seconds are 3× more likely to like the video",
  ];
  const commentRecs = [
    `End each section with a direct question (e.g., "What's your experience with this? Let me know below")`,
    "Pin a comment immediately after publishing to seed the conversation and signal community activity",
    "Introduce a slightly controversial or debatable point that invites opinions",
    "Reply to the first 10–20 comments within 1 hour of publishing to boost comment velocity",
  ];
  const shareRecs = [
    `Add a "share this with someone who needs to see it" prompt at the peak value moment of your video`,
    "Create content that solves a specific, relatable problem — people share solutions, not just information",
    "Include a shareable stat, insight, or quote that viewers want to send to friends",
    "Produce topic-specific content that targets a specific audience who are likely to share within their community",
  ];

  // Growth strategy
  const growthSteps: string[] = [];
  if (likeRate < 2) growthSteps.push("Reposition your like CTA — add it at the 30-second mark when viewers are already invested, not just at the end");
  if (commentRate < 0.3) growthSteps.push("Script a specific discussion question into your outro and reference it once mid-video to plant the seed");
  if (shareRate < 0.2) growthSteps.push("Reframe your topic as a problem-solution for a specific person — 'Send this to someone who...' dramatically increases shares");
  growthSteps.push("Analyze your first 30 seconds in YouTube Analytics — if retention drops early, rewrite the hook and test a new intro");
  growthSteps.push(`Study the top 3 videos with high engagement in the ${cfg.label} niche and reverse-engineer their structure, pacing, and CTA placement`);

  return {
    engagementRate,
    likeRate,
    commentRate,
    shareRate,
    estimatedShares,
    sharesWereEstimated,
    performanceRating,
    performanceColor,
    performanceBg,
    nicheLabel: cfg.label,
    benchmarkLow,
    benchmarkHigh,
    benchmarkStatus,
    strengths,
    weaknesses,
    likeRecs,
    commentRecs,
    shareRecs,
    growthSteps,
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is YouTube engagement rate and how is it calculated?",
    a: "YouTube engagement rate is the percentage of viewers who actively interacted with your video through likes, comments, or shares. It is calculated using the formula: Engagement Rate (%) = ((Likes + Comments + Shares) / Total Views) × 100. For example, if a video has 10,000 views, 300 likes, 50 comments, and 20 shares, the engagement rate is ((300 + 50 + 20) / 10,000) × 100 = 3.7%. This metric tells you how actively your audience is engaging with your content beyond just watching it.",
  },
  {
    q: "What is a good YouTube engagement rate?",
    a: "A good YouTube engagement rate varies by niche, but the general benchmarks are: under 1% is poor, 1–3% is average, 3–6% is good, 6–10% is excellent, and above 10% is viral. For niche-specific benchmarks: Gaming and Entertainment channels typically see 3–7%; Education and Tech channels average 2–4%; Finance and Business channels average 1.5–3.5% due to the more passive nature of their viewers. Always compare your engagement rate against your specific niche rather than a universal standard.",
  },
  {
    q: "Why does my YouTube video have high views but low engagement?",
    a: "High views with low engagement usually signals one of three problems: (1) an audience-content mismatch where people clicked but the content didn't match the title's promise; (2) weak calls-to-action — the video never explicitly asked viewers to like, comment, or share; or (3) passive viewers arriving through suggested video recommendations rather than active search, meaning they're less invested. Fix this by ensuring your hook delivers on the title's promise, adding explicit engagement CTAs at 30 seconds and at the end, and asking a specific question that invites comments.",
  },
  {
    q: "Does YouTube engagement rate affect search rankings?",
    a: "Yes — engagement metrics are among the strongest ranking signals in YouTube's algorithm. Specifically, YouTube's algorithm weighs likes as positive sentiment signals, comments as community engagement indicators, shares as external reach amplifiers, and overall engagement rate as a quality-of-content signal. Higher engagement tells YouTube that real viewers found the video valuable, which causes it to be recommended more aggressively in Suggested Videos, the Home feed, and YouTube Search. Even a modest improvement in engagement rate from 2% to 4% can dramatically increase organic reach.",
  },
  {
    q: "How do I increase my YouTube like rate?",
    a: "To increase your YouTube like rate: (1) Ask for likes explicitly at two points — around the 30-second mark when viewers are already invested, and again at the end; (2) Deliver high value in the first 60 seconds to build goodwill before asking; (3) Create an emotional moment — humor, surprise, or a useful revelation — that naturally makes viewers want to respond; (4) Improve your hook so more viewers watch past 30 seconds, since viewers who stay are significantly more likely to like. A 1% like rate means 1 in 100 viewers liked — setting a simple target of 3–5% with strategic CTAs is achievable for most channels.",
  },
  {
    q: "How do I get more comments on my YouTube videos?",
    a: "To increase your YouTube comment rate: (1) End every major section with a direct, specific question — 'What's your take on this? Tell me in the comments' is too generic; instead try 'Comment below: which of these 3 methods have you tried?' (2) Pin a comment immediately after publishing to seed the conversation; (3) Reply to every comment in the first hour of publishing — comment velocity signals YouTube to push the video to more people; (4) Introduce a debatable or polarizing point that invites multiple perspectives; (5) Ask viewers to share their own experience or results, which is more compelling than asking for a generic opinion.",
  },
  {
    q: "What is a YouTube share rate and why does it matter?",
    a: "YouTube share rate is the percentage of viewers who shared your video on other platforms or via direct link, calculated as (Shares / Views) × 100. It matters because shares are the strongest organic growth signal — each share exposes your video to a new audience that hasn't discovered your channel yet. Even a 0.5% share rate on a video with 100,000 views generates 500 new distribution events. Shares also help YouTube's algorithm understand that your content is high-value, which increases its recommendations. A share rate of 0.3%+ is generally considered good, and 1%+ is excellent.",
  },
  {
    q: "How does video length affect YouTube engagement rate?",
    a: "Video length has a significant effect on engagement metrics. Short videos (under 5 minutes) typically achieve higher engagement rates because viewers who watch to the end are more likely to interact — but they reach fewer retention milestones. Long videos (over 20 minutes) naturally see lower like and comment rates as a percentage of views, but generate more total watch time per view, which is also an important ranking signal. For engagement rate optimization, videos in the 7–15 minute range tend to balance watch time, like rate, and comment rate most effectively for most niches.",
  },
  {
    q: "How soon after uploading should I expect engagement on YouTube?",
    a: "YouTube videos typically receive 50–70% of their total engagement within the first 48–72 hours of publication. This early engagement window is critical because YouTube's algorithm uses it to determine how broadly to distribute the video. A strong first 48 hours of likes, comments, and shares signals that the video is resonating and causes YouTube to push it to more people. To maximize early engagement: publish during your audience's peak hours, send the video to your email list or community, reply to every comment quickly, and run a poll or community post to drive traffic to the new video.",
  },
  {
    q: "What is the difference between YouTube engagement rate and view rate?",
    a: "View rate (or click-through rate) measures how many people clicked on your video after seeing the thumbnail — it's about attracting viewers. Engagement rate measures how many of those viewers actively interacted with the video through likes, comments, or shares — it's about connecting with viewers. A video can have a high view rate (lots of clicks from a compelling thumbnail) but a low engagement rate (viewers didn't connect with the content). Both matter: view rate drives volume, engagement rate drives quality signals. Our engagement calculator focuses on measuring and improving the engagement rate, which is the deeper indicator of audience connection.",
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
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

function MetricCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className={`rounded-2xl p-5 border ${color} flex flex-col gap-2`}>
      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">{icon}{label}</div>
      <div className="text-3xl font-black text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function RateBar({ label, rate, maxRate = 10, color }: { label: string; rate: number; maxRate?: number; color: string }) {
  const pct = Math.min((rate / maxRate) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-bold tabular-nums text-foreground">{rate.toFixed(2)}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Niches ───────────────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string }[] = [
  { value: "gaming", label: "Gaming" },
  { value: "entertainment", label: "Entertainment" },
  { value: "education", label: "Education" },
  { value: "tech", label: "Tech" },
  { value: "finance", label: "Finance" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "health", label: "Health" },
  { value: "travel", label: "Travel" },
  { value: "food", label: "Food" },
  { value: "general", label: "General" },
];

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(/,/g, ""));
  return isNaN(n) || n < 0 ? null : n;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouTubeEngagementCalculatorTool() {
  const [views, setViews] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [niche, setNiche] = useState<Niche>("general");
  const [videoLength, setVideoLength] = useState("");
  const [uploadAge, setUploadAge] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<EngagementResult | null>(null);

  useEffect(() => {
    const id = "faq-schema-yt-engagement-calc";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const v = parseNum(views);
    const l = parseNum(likes);
    const c = parseNum(comments);
    if (!v || v === 0) { setError("Enter a valid number of views greater than 0."); return; }
    if (l === null) { setError("Enter a valid number of likes (0 or more)."); return; }
    if (c === null) { setError("Enter a valid number of comments (0 or more)."); return; }
    const sh = shares.trim() ? parseNum(shares) : null;
    const vl = videoLength.trim() ? parseNum(videoLength) : null;
    const ua = uploadAge.trim() ? parseNum(uploadAge) : null;
    const res = computeEngagement(v, l, c, sh, niche, vl, ua);
    setResult(res);
    setTimeout(() => document.getElementById("engagement-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  return (
    <>
      {/* ── Input Card ──────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleCalculate} className="space-y-5">

            {/* Row 1: Views + Likes */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  Total Views <span className="text-red-500">*</span>
                </label>
                <Input value={views} onChange={e => setViews(e.target.value)} placeholder="e.g. 50000" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  Likes <span className="text-red-500">*</span>
                </label>
                <Input value={likes} onChange={e => setLikes(e.target.value)} placeholder="e.g. 2500" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" inputMode="numeric" />
              </div>
            </div>

            {/* Row 2: Comments + Shares */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  Comments <span className="text-red-500">*</span>
                </label>
                <Input value={comments} onChange={e => setComments(e.target.value)} placeholder="e.g. 180" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Shares <span className="text-muted-foreground font-normal normal-case">(optional — estimated if blank)</span>
                </label>
                <Input value={shares} onChange={e => setShares(e.target.value)} placeholder="e.g. 120" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" inputMode="numeric" />
              </div>
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Channel Niche</label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(n => (
                  <button
                    key={n.value}
                    type="button"
                    onClick={() => setNiche(n.value)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      niche === n.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Video Length + Upload Age */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Video Length (minutes) <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input value={videoLength} onChange={e => setVideoLength(e.target.value)} placeholder="e.g. 12" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Upload Age (days) <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input value={uploadAge} onChange={e => setUploadAge(e.target.value)} placeholder="e.g. 7" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" inputMode="numeric" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-14 text-base font-bold rounded-2xl gap-2 shadow-lg shadow-primary/20">
              <BarChart2 className="w-5 h-5" /> Calculate Engagement Rate
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {result && (
        <section id="engagement-results" className="space-y-5 mt-2">

          {/* Hero Score */}
          <Card className={`p-6 sm:p-8 rounded-3xl border ${result.performanceBg}`}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center">
                <div className="text-7xl font-black" style={{ color: "inherit" }} className={result.performanceColor}>
                  {result.engagementRate.toFixed(2)}%
                </div>
                <div className="text-sm font-semibold text-muted-foreground mt-1">Engagement Rate</div>
              </div>
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <span className={`text-2xl font-black ${result.performanceColor}`}>{result.performanceRating}</span>
                  <span className="text-sm text-muted-foreground">for {result.nicheLabel}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.benchmarkStatus}</p>
                {result.sharesWereEstimated && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-amber-500 shrink-0">⚠</span>
                    Shares were estimated ({result.estimatedShares.toLocaleString()}) based on your like count and {result.nicheLabel} niche patterns. Enter actual shares for more accurate results.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              icon={<BarChart2 className="w-4 h-4 text-primary" />}
              label="Engagement Rate"
              value={`${result.engagementRate.toFixed(2)}%`}
              sub={`${result.performanceRating} for ${result.nicheLabel}`}
              color="border-primary/20 bg-primary/5"
            />
            <MetricCard
              icon={<ThumbsUp className="w-4 h-4 text-blue-500" />}
              label="Like Rate"
              value={`${result.likeRate.toFixed(2)}%`}
              sub={result.likeRate >= 3 ? "Strong" : result.likeRate >= 1.5 ? "Average" : "Needs work"}
              color="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
            />
            <MetricCard
              icon={<MessageSquare className="w-4 h-4 text-green-500" />}
              label="Comment Rate"
              value={`${result.commentRate.toFixed(2)}%`}
              sub={result.commentRate >= 0.5 ? "Strong" : result.commentRate >= 0.2 ? "Average" : "Needs work"}
              color="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
            />
            <MetricCard
              icon={<Share2 className="w-4 h-4 text-orange-500" />}
              label="Share Rate"
              value={`${result.shareRate.toFixed(2)}%`}
              sub={`${result.estimatedShares.toLocaleString()} shares${result.sharesWereEstimated ? " (est.)" : ""}`}
              color="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20"
            />
          </div>

          {/* Breakdown Bars */}
          <Card className="p-6 rounded-3xl border-border">
            <h3 className="font-bold text-lg text-foreground mb-5 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" /> Engagement Breakdown
            </h3>
            <div className="space-y-4">
              <RateBar label="Like Rate" rate={result.likeRate} maxRate={8} color="bg-blue-500" />
              <RateBar label="Comment Rate" rate={result.commentRate} maxRate={2} color="bg-green-500" />
              <RateBar label="Share Rate" rate={result.shareRate} maxRate={2} color="bg-orange-500" />
              <RateBar label="Overall Engagement" rate={result.engagementRate} maxRate={12} color="bg-primary" />
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{result.nicheLabel} Niche Benchmark</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-muted relative">
                  <div className="absolute inset-y-0 rounded-full bg-muted-foreground/30" style={{ left: `${(result.benchmarkLow / 12) * 100}%`, width: `${((result.benchmarkHigh - result.benchmarkLow) / 12) * 100}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background shadow" style={{ left: `${Math.min((result.engagementRate / 12) * 100, 98)}%` }} />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{result.benchmarkLow}–{result.benchmarkHigh}% avg</span>
              </div>
            </div>
          </Card>

          {/* Strengths + Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-6 rounded-3xl border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" /> Strengths
              </h3>
              <div className="space-y-2.5">
                {result.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" /> {s}
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6 rounded-3xl border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Areas to Improve
              </h3>
              <div className="space-y-2.5">
                {result.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" /> {w}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6 rounded-3xl border-border">
            <h3 className="font-bold text-lg text-foreground mb-5 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Actionable Recommendations
            </h3>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: <ThumbsUp className="w-4 h-4 text-blue-500" />, label: "Increase Likes", color: "border-blue-200 dark:border-blue-800", recs: result.likeRecs },
                { icon: <MessageSquare className="w-4 h-4 text-green-500" />, label: "Increase Comments", color: "border-green-200 dark:border-green-800", recs: result.commentRecs },
                { icon: <Share2 className="w-4 h-4 text-orange-500" />, label: "Increase Shares", color: "border-orange-200 dark:border-orange-800", recs: result.shareRecs },
              ].map(group => (
                <div key={group.label} className={`rounded-2xl border p-4 space-y-3 ${group.color}`}>
                  <div className="flex items-center gap-2 font-bold text-foreground text-sm">{group.icon} {group.label}</div>
                  {group.recs.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" /> {rec}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>

          {/* Growth Strategy */}
          <Card className="p-6 rounded-3xl border-border bg-gradient-to-br from-primary/5 to-muted/30">
            <h3 className="font-bold text-lg text-foreground mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Your Growth Strategy
            </h3>
            <div className="space-y-3">
              {result.growthSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Score legend */}
          <div className="flex items-center gap-3 flex-wrap px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide">Rating:</span>
            {[
              { label: "Poor", color: "bg-red-500", range: "<1%" },
              { label: "Average", color: "bg-amber-500", range: "1–3%" },
              { label: "Good", color: "bg-blue-500", range: "3–6%" },
              { label: "Excellent", color: "bg-green-500", range: "6–10%" },
              { label: "Viral", color: "bg-purple-500", range: ">10%" },
            ].map(r => (
              <span key={r.label} className="flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${r.color}`} /> {r.range} {r.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Engagement Calculator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Video Metrics", desc: "Find your video's stats in YouTube Studio under Analytics. Enter the total views, likes, and comments for the video you want to analyze. Shares are optional — if you leave the field blank, the tool will estimate shares based on your like count and niche." },
            { step: 2, title: "Select Your Channel Niche", desc: "Choose the niche that best describes your channel. The engagement calculator uses niche-specific benchmarks — for example, Finance channels typically see 1.5–3.5% engagement while Gaming channels average 3–6%. This ensures your score is compared fairly." },
            { step: 3, title: "Add Optional Context", desc: "Optionally enter your video length in minutes and the number of days since you uploaded the video. These context factors help the tool give more accurate insights — a 3-day-old video and a 6-month-old video should be interpreted differently." },
            { step: 4, title: "Analyze and Act on Results", desc: "Click Calculate Engagement Rate to instantly see your overall engagement rate, breakdown by likes/comments/shares, performance rating, niche benchmark comparison, strengths, weaknesses, and a personalized 5-step growth strategy." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Engagement Calculator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How the Engagement Rate Is Calculated
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free YouTube Engagement Calculator uses the industry-standard engagement rate formula: <strong className="text-foreground">Engagement Rate (%) = ((Likes + Comments + Shares) / Total Views) × 100</strong>. The tool then breaks this down into three individual rate metrics: <strong className="text-foreground">Like Rate</strong> (Likes / Views × 100), <strong className="text-foreground">Comment Rate</strong> (Comments / Views × 100), and <strong className="text-foreground">Share Rate</strong> (Shares / Views × 100). If shares aren't available — which is common since YouTube Studio doesn't always display share counts directly — the tool estimates shares using niche-specific multipliers based on industry research: Entertainment channels typically see shares of 10–15% of likes, Education channels 5–8%, Tech channels 6–10%, and Finance channels 4–7%. This estimated value is clearly flagged in your results. The performance rating system then adjusts the thresholds based on your selected niche, since a 3% engagement rate is considered good for Education but only average for Gaming.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why YouTube Engagement Rate Matters for Channel Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              YouTube's algorithm uses engagement signals as one of its primary ranking factors for both search rankings and suggested video placement. When viewers like, comment on, or share your video, it sends a direct quality signal to YouTube's algorithm that real people found the content valuable — which causes it to be shown to progressively larger audiences. High engagement rates also directly improve your video's long-term performance: videos with engagement rates above 4% tend to continue accumulating views for months or years after publication because the algorithm keeps recommending them. In contrast, videos with views but very low engagement often get "de-ranked" over time as the algorithm interprets the lack of interaction as a sign that viewers didn't actually enjoy the content. Beyond the algorithm, a high comment rate builds community and increases the likelihood that engaged viewers will return for future videos, subscribe, and become loyal fans. Tracking your engagement rate for each video — rather than just raw view counts — gives you the clearest signal of which topics, formats, and presentation styles actually resonate with your audience.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This YouTube Engagement Calculator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Calculates exact engagement rate using the industry-standard likes + comments + shares formula",
                "Compares your results against niche-specific benchmarks, not generic averages",
                "Estimates share counts based on niche patterns when actual data isn't available",
                "Detects specific strengths (strong like rate, high comment rate) tied to your exact numbers",
                "Identifies precise weaknesses with context-aware explanations, not generic advice",
                "Generates tailored recommendations for increasing likes, comments, and shares separately",
                "Accounts for video age — a 3-day-old video is interpreted differently than a 6-month-old one",
                "Accounts for video length — longer videos naturally see lower but deeper engagement",
                "Provides a 5-step personalized growth strategy based on your specific metric gaps",
                "100% free — no account, no limits, instant calculations for any video",
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

      {/* ── FAQ Accordion ────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => <AccordionItem key={i} question={item.q} answer={item.a} index={i} />)}
        </div>
      </section>

      {/* Internal links */}
      <div className="mt-4 p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-4">
        <Star className="w-8 h-8 text-primary shrink-0" />
        <div>
          <p className="font-bold text-foreground text-sm">Improve the metrics that drive your engagement score</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Boost your like rate by optimizing your title with the <a href="/tools/youtube-title-generator" className="text-primary font-semibold hover:underline">YouTube Title Generator</a>, increase comments with better content using the <a href="/tools/youtube-script-generator" className="text-primary font-semibold hover:underline">YouTube Script Generator</a>, and check your full SEO with the <a href="/tools/youtube-seo-score-checker" className="text-primary font-semibold hover:underline">YouTube SEO Score Checker</a>.
          </p>
        </div>
      </div>
    </>
  );
}
