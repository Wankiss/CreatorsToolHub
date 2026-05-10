import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ChevronDown, Check, BarChart2, TrendingUp, Shield,
  ListChecks, Search, Zap, ThumbsUp, MessageSquare,
  Share2, AlertTriangle, Target, ArrowRight, Star, ArrowUpRight,
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
    a: "YouTube engagement rate measures the percentage of viewers who actively interacted with your video — through likes, comments, or shares — rather than just watching passively. The formula is: Engagement Rate (%) = ((Likes + Comments + Shares) ÷ Total Views) × 100. Example: a video with 10,000 views, 300 likes, 50 comments, and 20 shares has an engagement rate of ((300 + 50 + 20) ÷ 10,000) × 100 = 3.7%. YouTube's recommendation engine processes over 80 billion signals daily to decide what to show each viewer (YouTube Blog, 2024). Engagement metrics are among the strongest of those signals — they directly tell YouTube's algorithm whether real viewers found your content worth reacting to, which determines how broadly it gets recommended beyond your existing subscribers.",
  },
  {
    q: "What is a good YouTube engagement rate?",
    a: "A 2024 Influencer Marketing Hub analysis found the average YouTube engagement rate across all niches is approximately 3.48%. Using that as the baseline: under 1% is poor, 1–3% is below average, 3–5% is average to good, 5–8% is excellent, and above 8% is top-performer territory. Benchmarks vary meaningfully by niche — Gaming and Entertainment channels typically see 3–6%; Education and Tech average 2–4%; Finance channels average 1.5–3.5% because finance viewers tend to consume passively rather than interact. Always benchmark against your specific niche. A 2.5% engagement rate in Finance is genuinely strong; the same 2.5% in Gaming suggests there's significant room to improve.",
  },
  {
    q: "Why does my YouTube video have high views but low engagement?",
    a: "High views with low engagement almost always signals one of three problems: (1) Audience-content mismatch — viewers clicked based on the thumbnail or title, but the video didn't deliver what they expected. When that happens, they scroll away without engaging. (2) No calls-to-action — the video never explicitly asked viewers to like, comment, or share. YouTube's own Creator Academy notes that direct CTAs meaningfully improve engagement rates. (3) Passive discovery traffic — viewers arriving through Shorts recommendations or broad suggested feeds are less invested than viewers who searched specifically for your topic. Fix: ensure your hook delivers on your title's promise within the first 30 seconds, add explicit engagement prompts at 30–60 seconds and again at the end, and ask a specific question that invites a comment rather than a generic 'comment below.'",
  },
  {
    q: "Does YouTube engagement rate affect search rankings?",
    a: "Yes — engagement signals directly influence how YouTube distributes your video. YouTube's official Creator Academy states that likes, comments, shares, and saves all factor into how the algorithm recommends content. Specifically: likes signal positive sentiment, comments indicate active community engagement, shares signal external reach value, and saves (playlist adds) signal that viewers considered the content worth returning to. Together, these engagement signals tell YouTube's algorithm that real people found the video valuable — which triggers broader distribution in Suggested Videos, the Home feed, and YouTube Search. YouTube processes over 80 billion of these signals daily (YouTube Blog, 2024), which is why even a modest improvement in engagement rate — especially in the first 24–48 hours after publishing — meaningfully affects how far a video travels.",
  },
  {
    q: "How do I increase my YouTube like rate?",
    a: "To increase your YouTube like rate: (1) Ask explicitly at two moments — around 30–60 seconds in, when viewers are already invested enough to stay, and again at the end. Asking once at the very end misses viewers who leave early. (2) Deliver your highest-value insight in the first 90 seconds — viewers who feel they've already gotten something useful are more likely to like the video. (3) Create an emotional moment — humor, a surprising reveal, or a genuinely useful tip — that triggers a positive reaction before you ask. (4) Improve your hook so more people watch past the 30-second mark; viewers who stay longer are dramatically more likely to like. A like rate below 1.5% usually means the CTA is missing or poorly positioned, not that viewers disliked the content.",
  },
  {
    q: "How do I get more comments on my YouTube videos?",
    a: "Comment rate is the hardest engagement metric to move — most videos average well under 0.5% comment rate. The highest-leverage tactics: (1) Ask a specific, answerable question mid-video and again in the outro. 'Let me know in the comments' is too generic; 'Comment your #1 challenge with X' gives viewers a clear prompt to respond to. (2) Pin a comment immediately after publishing that seeds the conversation — it signals to new viewers that discussion is happening here. (3) Respond to early comments within the first few hours of publishing; comment velocity (how quickly comments come in) is a signal YouTube uses to assess whether to push a video further. (4) Introduce a debatable point or share a contrarian opinion — content that sparks mild disagreement generates significantly more comments than content that everyone nods along to.",
  },
  {
    q: "What is a YouTube share rate and why does it matter?",
    a: "Share rate is the percentage of viewers who shared your video elsewhere, calculated as (Shares ÷ Views) × 100. It's the most powerful organic growth signal in the engagement mix — each share exposes your video to an audience that's never heard of your channel, without any algorithmic gatekeeping. A 0.3% share rate on a video with 100,000 views generates 300 organic distribution events; at 1%, that's 1,000. Shares also carry weight in YouTube's recommendation algorithm because they indicate external validation — viewers thought the content was good enough to stake their own credibility on by recommending it. A share rate above 0.3% is solid; above 1% indicates content with genuine viral characteristics. Content that solves a specific, shareable problem — or contains a memorable stat or insight — consistently outperforms general content on share rate.",
  },
  {
    q: "What are the most underrated YouTube engagement signals?",
    a: "Most creators focus only on likes and comments, but two engagement signals consistently get overlooked. First: saves (adding a video to a playlist). YouTube's Creator Academy identifies saves as an engagement signal because they indicate a viewer considered the content worth revisiting — a stronger intent signal than a like. Videos with high save rates tend to have longer algorithmic lifespans. Second: watch-through rate (the percentage of the video viewers actually watch). While not a traditional 'engagement' metric, YouTube weights it heavily because it indicates whether viewers stayed for the content rather than just clicking. A video with 4% engagement but 65% average watch-through outperforms a video with 6% engagement but 25% watch-through in long-term recommendations. Track both in YouTube Studio alongside your like and comment rates.",
  },
  {
    q: "How does video length affect YouTube engagement rate?",
    a: "Video length has a direct, measurable effect on each engagement sub-metric. Shorter videos (under 5 minutes) tend to produce higher like and comment rates as a percentage of views because viewers who stay to the end are self-selected and motivated — but they generate less total watch time per view. Longer videos (over 20 minutes) naturally see lower engagement rates because more passive viewers who drop off early pull the percentage down, even if the absolute number of engaged viewers is higher. For most niches, videos in the 8–15 minute range balance watch time accumulation, like rate, and comment rate most effectively — long enough to build rapport and deliver real value, short enough to keep completion rates healthy. Check your average view duration in YouTube Studio: if most viewers leave before your CTA, shorten the video first.",
  },
  {
    q: "How soon after uploading should I expect engagement on YouTube?",
    a: "The first 24–48 hours after publishing are the most critical window for engagement. YouTube's algorithm uses early signal density — how quickly likes, comments, and shares accumulate — to determine the video's initial distribution radius. A video that gets strong engagement in the first day signals to YouTube that the content is resonating with existing subscribers, which prompts the algorithm to test it with non-subscriber audiences. To maximize this window: publish during your audience's peak activity hours (check YouTube Studio Analytics → Audience for your channel's specific peak), send an email or community post to notify subscribers immediately, and respond to early comments quickly to keep comment velocity high. A video that fails to generate early traction often gets limited algorithmic distribution even if the content quality is high.",
  },
  {
    q: "What is the difference between YouTube engagement rate and click-through rate?",
    a: "Click-through rate (CTR) measures how many people clicked your video after seeing the thumbnail in their feed — it's about attracting attention at the point of discovery. Engagement rate measures what percentage of those viewers actively interacted with the video after watching — it's about whether the content connected. A high CTR with low engagement means your thumbnail and title are strong but the content isn't delivering on the promise. A low CTR with high engagement means your content is excellent but you're not getting enough impressions to grow. Both matter for different reasons: CTR determines how many viewers you attract; engagement rate determines how YouTube values those viewers' reaction. YouTube's algorithm uses both — CTR to test initial reach, engagement rate to determine sustained distribution. Improving engagement rate almost always has a larger long-term impact on channel growth than optimizing CTR alone.",
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
                <div className={`text-7xl font-black ${result.performanceColor}`}>
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
            { step: 1, title: "Enter Your Video Metrics", desc: "Open YouTube Studio → Analytics → select your video → Overview tab. Enter total views, likes, and comments. Shares are optional — if left blank, the tool estimates shares using niche-calibrated ratios. The cross-niche average engagement rate is 3.48% (IMH, 2024) — use that as your starting baseline." },
            { step: 2, title: "Select Your Channel Niche", desc: "Choose your niche carefully — it determines which benchmark your score is measured against. Finance channels average 1.5–3.5%; Gaming and Entertainment average 3–6%. A 2.5% rate is excellent in Finance and below average in Gaming. Niche context is everything." },
            { step: 3, title: "Add Optional Context", desc: "Enter your video length in minutes and days since upload for more accurate interpretation. A 2-day-old video with 3% engagement is performing very differently from a 6-month-old video with the same rate — the tool accounts for both when generating insights." },
            { step: 4, title: "Analyze and Act on Results", desc: "Click Calculate to see your engagement rate, per-metric breakdown (like rate, comment rate, share rate), niche benchmark comparison, strengths, weaknesses, and a personalized growth strategy. Focus on whichever sub-metric is furthest below its benchmark first." },
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

          {/* Section 1: How it's calculated */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How the Engagement Rate Is Calculated
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The industry-standard formula is: <strong className="text-foreground">Engagement Rate (%) = ((Likes + Comments + Shares) ÷ Total Views) × 100</strong>. A 2024 Influencer Marketing Hub analysis of YouTube channels found the cross-niche average sits at approximately 3.48% — meaning roughly 35 out of every 1,000 viewers interact with a video in some way. Most creators only track likes, missing the full picture.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This tool breaks the overall rate into three sub-metrics: <strong className="text-foreground">Like Rate</strong> (Likes ÷ Views × 100), <strong className="text-foreground">Comment Rate</strong> (Comments ÷ Views × 100), and <strong className="text-foreground">Share Rate</strong> (Shares ÷ Views × 100). Each tells a different story: like rate reflects immediate positive sentiment; comment rate reflects whether the content triggered enough of a reaction for someone to type a response; share rate reflects whether viewers thought the content was worth their personal reputation to distribute.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If shares aren't available — YouTube Studio doesn't always display share counts in an easily accessible view — the tool estimates shares using niche-specific ratios based on published channel data: Entertainment channels typically see shares at 10–15% of their like count, Education 5–8%, Tech 6–10%, Finance 4–7%. Any estimated value is clearly flagged in your results. Performance ratings adjust by niche: a 3% rate is good for Education, only average for Gaming, where the benchmark sits at 3–6%.
            </p>
          </div>

          {/* Section 2: Why it matters */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Engagement Rate Is a More Honest Metric Than Views
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's recommendation engine processes over <strong className="text-foreground">80 billion signals every day</strong> to decide what to recommend to each viewer (YouTube Blog, 2024). Engagement metrics — likes, comments, shares, and saves — are among the strongest signals in that system. A video with 100,000 views and 2% engagement tells YouTube something very different from a video with 100,000 views and 0.4% engagement: the first is actively resonating with viewers; the second suggests people clicked but didn't connect.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              High engagement directly expands distribution. When a video's engagement rate is strong relative to its niche benchmark, YouTube's algorithm tests it with progressively larger non-subscriber audiences — which compounds into more views, more subscribers, and higher RPM over time. Low engagement, even on a video with high initial views, tends to suppress long-term distribution as the algorithm interprets the lack of interaction as a signal that the content didn't satisfy viewers. Tracking engagement rate per video — not just total views — is the clearest diagnostic tool for understanding which topics, formats, and presentation styles are actually building your channel versus just filling time.
            </p>
            {/* Citation capsule */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">Engagement by the numbers</strong>
              YouTube processes{" "}
              <a href="https://blog.youtube" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                80+ billion recommendation signals daily
              </a>{" "}
              (YouTube Blog, 2024), with likes, comments, shares, and saves among the strongest. The{" "}
              <a href="https://influencermarketinghub.com/youtube-engagement-rate/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                cross-niche average YouTube engagement rate is approximately 3.48%
              </a>{" "}
              (Influencer Marketing Hub, 2024), with top performers in high-engagement niches like Gaming and Entertainment reaching 6–10%. Finance and Education channels consistently benchmark lower (1.5–4%) due to more passive viewer behavior — making niche-adjusted scoring essential for accurate performance assessment.
            </div>
          </div>

          {/* Section 3: The signal most creators ignore */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> The Engagement Signal Most Creators Ignore: Saves
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators optimize only for likes and comments. But YouTube's Creator Academy identifies <strong className="text-foreground">saves (adding a video to a playlist)</strong> as a distinct engagement signal — and arguably the strongest one. A save indicates that a viewer considered the content worth returning to, which is a higher-intent signal than a like. Videos with strong save rates tend to have longer algorithmic distribution windows because they signal "reference content" rather than "one-time entertainment."
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You can see your save rate in YouTube Studio under Analytics → Engagement. If your like rate is healthy but your save rate is low, it usually means your content is enjoyable but not perceived as reference material worth keeping. Fixing this means creating content with lasting utility — tutorials, ranked lists, reference guides — rather than content that's valuable once. Pair high-save content with a strong{" "}
              <a href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                title strategy
              </a>{" "}
              and{" "}
              <a href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                optimized tags
              </a>{" "}
              to maximize both initial discovery and long-term algorithmic reach.
            </p>
          </div>

          {/* Section 4: Feature grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This YouTube Engagement Calculator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Calculates exact engagement rate using the industry-standard likes + comments + shares formula",
                "Benchmarks against niche-specific averages — not a single universal threshold that ignores niche context",
                "Estimates share counts using niche-calibrated ratios when actual data isn't available",
                "Breaks results into like rate, comment rate, and share rate so you know which metric to fix first",
                "Identifies specific strengths and weaknesses tied to your exact numbers — not generic advice",
                "Generates separate recommendations for increasing likes, comments, and shares independently",
                "Accounts for video age — early-stage and mature videos are benchmarked differently",
                "Accounts for video length — longer videos are expected to have lower but deeper engagement",
                "Produces a personalized growth strategy based on your specific metric gaps",
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

      {/* ── Tips & Best Practices ────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Improve Your YouTube Engagement Rate</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "The average YouTube engagement rate across all niches is 3.48% (Influencer Marketing Hub, 2024). If you're below this, focus on your like CTA first — it's the fastest metric to move with a simple script change.",
            "Place your like CTA at two points: around 30–60 seconds in (when invested viewers are still watching) and at the end. Asking only at the end misses every viewer who drops off before the outro.",
            "Save rate (adds to playlist) is the most underrated engagement metric. YouTube's Creator Academy identifies saves as a distinct quality signal — content that gets saved has longer algorithmic distribution than content that only gets liked.",
            "Respond to early comments within the first few hours of publishing. Comment velocity — how quickly comments accumulate — is a signal YouTube uses to assess whether to expand a video's initial distribution radius.",
            "Ask a specific, answerable question in your video — not 'let me know what you think' but 'which of these 3 approaches would you try first?' Specific prompts generate 3–5× more comment responses than open-ended ones.",
            "Check average view duration in YouTube Studio before assuming your engagement strategy is the problem. If most viewers leave before 30 seconds, fix the hook first — engagement CTAs can't reach viewers who've already left.",
            "End screens linking to related videos keep viewers in session — longer session watch time is a YouTube ranking factor per the YouTube Creator Academy, and it compounds over time as your content library grows.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
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
            { name: "YouTube Money Calculator", path: "/tools/youtube-money-calculator", desc: "Estimate total revenue from ads, sponsorships, affiliates, and memberships." },
            { name: "YouTube CPM Calculator", path: "/tools/youtube-cpm-calculator", desc: "Calculate your estimated earnings based on niche, location, and ad formats." },
            { name: "YouTube Shorts Revenue Calculator", path: "/tools/youtube-shorts-revenue-calculator", desc: "Calculate earnings from Shorts views with Shorts-specific RPM rates." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your video title and description for SEO quality before publishing." },
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
