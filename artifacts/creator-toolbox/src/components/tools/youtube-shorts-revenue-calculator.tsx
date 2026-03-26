import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign, TrendingUp, BarChart2, Lightbulb, ChevronDown,
  ListChecks, Shield, Zap, Check, ArrowUpRight, Info,
  Flame, Target, Clock, Eye,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Location = "us" | "uk" | "canada" | "australia" | "europe" | "global" | "india" | "nigeria";
type Niche = "entertainment" | "comedy" | "education" | "tech" | "finance" | "lifestyle" | "gaming" | "motivation" | "other";
type Frequency = "daily" | "weekly" | "occasionally";

interface FormState {
  totalViews: string;
  monthlyViews: string;
  engagementRate: number;
  retentionRate: number;
  useRetention: boolean;
  location: Location;
  niche: Niche;
  inYPP: boolean;
  frequency: Frequency;
}

interface CalcResult {
  rpmMin: number;
  rpmMax: number;
  rpmMid: number;
  revenueMin: number;
  revenueMax: number;
  revenueMid: number;
  revenueViralMin: number;
  revenueViralMax: number;
  monthlyMin: number;
  monthlyMax: number;
  yearlyMin: number;
  yearlyMax: number;
  hasMonthly: boolean;
  viewsFor100: number;
  viewsFor1000: number;
  viralBoostFactor: number;
  locationBoostPct: number;
  engagementTier: "high" | "medium" | "low";
  suggestions: { type: "boost" | "info" | "tip"; text: string; impact?: string }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NICHE_RPM: Record<Niche, [number, number]> = {
  entertainment: [0.01, 0.04],
  comedy:        [0.01, 0.04],
  gaming:        [0.02, 0.05],
  motivation:    [0.02, 0.06],
  lifestyle:     [0.02, 0.07],
  education:     [0.03, 0.08],
  tech:          [0.04, 0.10],
  finance:       [0.05, 0.12],
  other:         [0.01, 0.05],
};

const NICHE_LABELS: Record<Niche, string> = {
  entertainment: "Entertainment", comedy: "Comedy", education: "Education",
  tech: "Tech", finance: "Finance", lifestyle: "Lifestyle",
  gaming: "Gaming", motivation: "Motivation", other: "Other",
};

const NICHE_DEMAND: Record<Niche, string> = {
  finance:       "💰 Highest RPM niche — finance Shorts can earn 3–5× entertainment Shorts",
  tech:          "🔥 High RPM — tech content attracts premium advertisers even on Shorts",
  education:     "✅ Above-average — educational content earns more from the Shorts ad pool",
  lifestyle:     "✅ Medium-High — lifestyle's broad appeal drives solid Shorts revenue",
  gaming:        "⚡ Medium — gaming has huge volume but moderate per-view earnings",
  motivation:    "✅ Medium — motivation content earns decent rates with good engagement",
  comedy:        "😄 Lower RPM — comedy Shorts earn less per view but often go viral",
  entertainment: "📱 Lower RPM — entertainment is the most competitive Shorts category",
  other:         "ℹ️ Variable — depends heavily on specific topic and audience",
};

const LOCATION_MULT: Record<Location, [number, number]> = {
  us:        [1.60, 2.00],
  uk:        [1.40, 1.70],
  canada:    [1.40, 1.60],
  australia: [1.50, 1.80],
  europe:    [1.20, 1.50],
  global:    [1.00, 1.00],
  india:     [0.50, 0.70],
  nigeria:   [0.40, 0.60],
};

const LOCATION_LABELS: Record<Location, string> = {
  us: "United States", uk: "United Kingdom", canada: "Canada",
  australia: "Australia", europe: "Europe", global: "Global (Mixed)",
  india: "India", nigeria: "Nigeria",
};

const LOCATION_TIER: Record<Location, string> = {
  us: "tier1", uk: "tier1", canada: "tier1", australia: "tier1",
  europe: "tier2", global: "baseline", india: "emerging", nigeria: "emerging",
};

const FREQUENCY_MULT: Record<Frequency, number> = {
  daily:        1.15,
  weekly:       1.00,
  occasionally: 0.90,
};

// ─── Calc Engine ──────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

function seedRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return ((h >>> 0) % 1000) / 1000;
}

function fmt(n: number, digits = 3): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtDollar(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}K`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

function calculate(form: FormState): CalcResult | null {
  const totalViews  = parseFloat(form.totalViews.replace(/,/g, ""));
  const monthlyViews = form.monthlyViews ? parseFloat(form.monthlyViews.replace(/,/g, "")) : 0;
  if (!totalViews || totalViews <= 0) return null;

  const seed = `${form.niche}-${form.location}-${form.engagementRate}`;
  const r = seedRandom(seed);

  // ── Base RPM ────────────────────────────────────────────────────────────────
  let [baseMin, baseMax] = NICHE_RPM[form.niche];

  // ── Location multiplier ─────────────────────────────────────────────────────
  const [locMin, locMax] = LOCATION_MULT[form.location];
  const locMult = lerp(locMin, locMax, r);
  const locationBoostPct = Math.round((lerp(locMin, locMax, 0.5) - 1) * 100);

  // ── Engagement multiplier ────────────────────────────────────────────────────
  const eng = form.engagementRate;
  let engMultMin: number, engMultMax: number;
  let engagementTier: "high" | "medium" | "low";
  if (eng > 10)         { engMultMin = 1.30; engMultMax = 1.70; engagementTier = "high"; }
  else if (eng >= 5)    { engMultMin = 0.90; engMultMax = 1.10; engagementTier = "medium"; }
  else                  { engMultMin = 0.60; engMultMax = 0.80; engagementTier = "low"; }
  const engMult = lerp(engMultMin, engMultMax, (r + 0.3) % 1);

  // ── Retention multiplier (optional) ─────────────────────────────────────────
  let retentionMult = 1.0;
  if (form.useRetention) {
    const ret = form.retentionRate;
    if (ret >= 80) retentionMult = 1.20;
    else if (ret >= 60) retentionMult = 1.00;
    else if (ret >= 40) retentionMult = 0.90;
    else retentionMult = 0.80;
  }

  // ── Posting frequency ───────────────────────────────────────────────────────
  const freqMult = FREQUENCY_MULT[form.frequency];

  // ── Viral boost factor ───────────────────────────────────────────────────────
  let viralBoostFactor = 1.0;
  if (eng > 15)      viralBoostFactor = 1.50;
  else if (eng > 10) viralBoostFactor = 1.25;
  else if (eng > 7)  viralBoostFactor = 1.10;

  // ── Final RPM ────────────────────────────────────────────────────────────────
  const rpmMin = baseMin * locMin * engMultMin * retentionMult * freqMult;
  const rpmMax = baseMax * locMax * engMultMax * retentionMult * freqMult;
  const rpmMid = lerp(rpmMin, rpmMax, 0.5);

  // ── Revenue ─────────────────────────────────────────────────────────────────
  const revenueMin = (totalViews / 1000) * rpmMin;
  const revenueMax = (totalViews / 1000) * rpmMax;
  const revenueMid = (revenueMin + revenueMax) / 2;

  // ── With viral boost ─────────────────────────────────────────────────────────
  const revenueViralMin = revenueMin * viralBoostFactor;
  const revenueViralMax = revenueMax * viralBoostFactor;

  // ── Monthly / Yearly projection ──────────────────────────────────────────────
  const hasMonthly = monthlyViews > 0;
  const monthlyMin = hasMonthly ? (monthlyViews / 1000) * rpmMin : 0;
  const monthlyMax = hasMonthly ? (monthlyViews / 1000) * rpmMax : 0;
  const yearlyMin  = monthlyMin * 12;
  const yearlyMax  = monthlyMax * 12;

  // ── Views needed ──────────────────────────────────────────────────────────────
  const viewsFor100  = rpmMid > 0 ? Math.ceil(100  / rpmMid * 1000) : 0;
  const viewsFor1000 = rpmMid > 0 ? Math.ceil(1000 / rpmMid * 1000) : 0;

  // ── Suggestions ───────────────────────────────────────────────────────────────
  const suggestions: CalcResult["suggestions"] = [];
  const tier = LOCATION_TIER[form.location];

  if (tier === "emerging") {
    const usMid = lerp(baseMin * 1.6, baseMax * 2.0, 0.5);
    const currentMid = lerp(baseMin * locMin, baseMax * locMax, 0.5);
    const boostPct = Math.round(((usMid - currentMid) / currentMid) * 100);
    suggestions.push({
      type: "boost",
      text: `Creating content that attracts US or UK viewers could increase your Shorts RPM by approximately ${boostPct}% — consider English-language content targeting global trends`,
      impact: `+~${boostPct}% RPM`,
    });
  }

  if (tier === "tier1" || tier === "tier2") {
    suggestions.push({
      type: "info",
      text: `Your ${LOCATION_LABELS[form.location]} audience is in a premium ad market — your RPM is already ${locationBoostPct > 0 ? `${locationBoostPct}%` : "at baseline"} above the global average`,
    });
  }

  if (form.niche === "entertainment" || form.niche === "comedy") {
    suggestions.push({
      type: "tip",
      text: `Entertainment and comedy Shorts have the lowest RPM ($0.01–$0.04) but the highest viral potential — compensate with posting frequency and focus on watch-through rate to maximize algorithmic reach`,
    });
    suggestions.push({
      type: "boost",
      text: "Adding educational or finance crossover content to your mix could raise your blended Shorts RPM by 2–3×",
      impact: "+2–3× RPM potential",
    });
  }

  if (form.niche === "finance" || form.niche === "tech") {
    suggestions.push({
      type: "info",
      text: `${NICHE_LABELS[form.niche]} Shorts are in the highest-paying niche — your RPM ceiling of ~$0.12 is among the best achievable on Shorts`,
    });
  }

  if (form.engagementRate < 5) {
    suggestions.push({
      type: "boost",
      text: "Raising engagement rate from Low (<5%) to Medium (5–10%) could boost your RPM by 30–50% — use strong hooks in the first 2 seconds and always end with a question to drive comments",
      impact: "+30–50% RPM",
    });
  } else if (form.engagementRate >= 10) {
    suggestions.push({
      type: "boost",
      text: `Your ${form.engagementRate}% engagement rate triggers the Viral Boost Factor (${viralBoostFactor}×) — high-engagement Shorts receive disproportionately more impressions from YouTube's distribution algorithm`,
      impact: `${viralBoostFactor}× Viral Boost`,
    });
  }

  if (form.frequency === "occasionally") {
    suggestions.push({
      type: "boost",
      text: "Increasing upload frequency to weekly or daily is the single highest-leverage move for Shorts creators — the algorithm rewards consistency with significantly more impression distribution",
      impact: "+10–15% RPM + more total views",
    });
  }

  if (!form.inYPP) {
    suggestions.push({
      type: "tip",
      text: "To earn ad revenue from Shorts, you must join the YouTube Partner Program (YPP) — requirements are 500 subscribers + 3,000 watch hours on long-form OR 3 million Shorts views in the last 90 days",
    });
  }

  suggestions.push({
    type: "tip",
    text: `At your current RPM, you need approximately ${fmtViews(viewsFor100)} views to earn $100 and ${fmtViews(viewsFor1000)} views to earn $1,000 — posting ${form.frequency === "daily" ? "daily" : form.frequency === "weekly" ? "weekly" : "more consistently"} would reach these milestones faster`,
  });

  return {
    rpmMin, rpmMax, rpmMid, revenueMin, revenueMax, revenueMid,
    revenueViralMin, revenueViralMax, monthlyMin, monthlyMax,
    yearlyMin, yearlyMax, hasMonthly, viewsFor100, viewsFor1000,
    viralBoostFactor, locationBoostPct, engagementTier, suggestions,
  };
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How much does YouTube Shorts pay per 1,000 views?",
    a: "YouTube Shorts earnings per 1,000 views are significantly lower than long-form video CPM. Shorts RPM typically ranges from $0.01 to $0.12 per 1,000 views depending on your content niche, audience location, and engagement rate. Finance and tech Shorts earn the most ($0.04–$0.12), while entertainment and comedy earn the least ($0.01–$0.04). These rates are lower than regular YouTube videos because Shorts revenue comes from a shared ad revenue pool distributed among creators based on their share of total watched Shorts in a given country and period — rather than ads served directly on individual videos like in long-form content.",
  },
  {
    q: "How does YouTube Shorts monetization actually work?",
    a: "YouTube Shorts monetization works fundamentally differently from regular video ads. Instead of ads playing before or during individual Shorts, YouTube pools all ad revenue generated between Shorts in the feed, subtracts a portion for music licensing costs (if applicable), then distributes the remainder among eligible creators based on their share of total Shorts views in each country. You receive 45% of your allocated share (YouTube keeps 55%). This pooled model means your earnings aren't directly tied to a CPM on your specific video — they're determined by your percentage of total Shorts views in your audience's region during that payment period.",
  },
  {
    q: "What are the requirements to earn money from YouTube Shorts?",
    a: "To earn ad revenue from YouTube Shorts, you must be accepted into the YouTube Partner Program (YPP). There are two tiers: the basic YPP tier requires 500 subscribers and either 3,000 valid watch hours on long-form videos in the past 12 months or 3 million valid Shorts views in the last 90 days. The expanded YPP tier (required for Shorts monetization) requires 1,000 subscribers and 4,000 watch hours on long-form OR 10 million Shorts views in 90 days. Without YPP membership, your Shorts generate no ad revenue regardless of view count. Creators can also earn from Shorts through channel memberships, Super Thanks, and merchandise shelf — which don't require the same view thresholds.",
  },
  {
    q: "Why is Shorts RPM so much lower than regular YouTube video CPM?",
    a: "Shorts RPM is dramatically lower than long-form CPM for three structural reasons: (1) No pre-roll or mid-roll ads — traditional YouTube videos can run multiple ads per video; Shorts show ads between videos in the feed, which is less intrusive but also less targeted and lower-value per impression. (2) The pooled revenue model dilutes earnings across all creators rather than paying per-video ad rates. (3) Shorts are designed for rapid consumption — a viewer might watch 50 Shorts in 10 minutes compared to 2 long-form videos, which means individual Shorts receive a fraction of the RPM a long video generates. The trade-off is viral reach: Shorts get distributed algorithmically to non-subscribers at far higher rates than regular videos.",
  },
  {
    q: "How does audience location affect YouTube Shorts earnings?",
    a: "Audience location has a major impact on Shorts RPM because the revenue pool size varies dramatically by country. US, UK, Canadian, and Australian viewers are part of the largest and highest-value ad markets — your Shorts earn 60–100% more per view from these audiences compared to the global baseline. European audiences earn 20–50% above baseline. Indian and Nigerian viewers, while representing enormous Shorts audiences, contribute to lower-value regional ad pools — earning 30–60% below baseline RPM. This doesn't mean you should avoid large emerging market audiences (volume can compensate), but it explains why two creators with identical view counts can earn dramatically different amounts.",
  },
  {
    q: "What is the viral boost factor in this Shorts calculator?",
    a: "The viral boost factor models the algorithmic amplification that happens when a Short performs exceptionally well. YouTube's algorithm distributes Shorts based on engagement signals — watch-through rate, likes, comments, and shares. When a Short consistently earns above-average engagement (especially above 10–15%), the algorithm pushes it to dramatically more non-subscribers, creating a viral loop of views that earns significantly more total revenue than the base RPM calculation would suggest. Our calculator applies a viral boost multiplier of 1.10–1.50× to the base revenue estimate when engagement rates are high, reflecting the real-world earnings acceleration that high-engagement Shorts creators report in their analytics.",
  },
  {
    q: "How many views do I need to make $100 from YouTube Shorts?",
    a: "The views required to earn $100 from YouTube Shorts varies enormously by niche and audience. At the lowest RPM rates (entertainment/comedy targeting emerging markets at ~$0.005 RPM), you would need approximately 20 million views to earn $100. At the highest RPM rates (finance/tech targeting US audiences at ~$0.12–$0.20 RPM), you would need only about 500,000–800,000 views. For most creators with a mixed global audience in middle-tier niches, earning $100 typically requires 2–5 million Shorts views. Our calculator shows your specific views-to-earn target based on your exact niche and audience location combination.",
  },
  {
    q: "Does engagement rate affect YouTube Shorts revenue?",
    a: "Engagement rate significantly affects Shorts revenue through two mechanisms. Direct impact: high-engagement Shorts receive higher weighting in YouTube's algorithm, earning more impression distribution and therefore more total views — which directly increases total earnings even at the same RPM. Indirect impact: engagement signals (especially watch-through rate, which isn't captured in public engagement metrics) influence how YouTube allocates the Shorts revenue pool among creators. Creators whose Shorts drive viewer satisfaction — measured by watch-through rate and post-Short behavior — receive a larger share of the pool. Our calculator models both effects through the engagement multiplier (±20–70% RPM adjustment) and the viral boost factor for engagement rates above 10%.",
  },
  {
    q: "How can I increase my YouTube Shorts RPM?",
    a: "The most effective Shorts RPM improvement strategies are: (1) Shift toward higher-paying niches — finance and tech Shorts earn 3–5× more per view than entertainment content. (2) Create content that attracts US/UK/Australian viewers — publish at times when American viewers are awake (9am–3pm EST) and use topic angles relevant to high-value markets. (3) Maximize watch-through rate — the first 2 seconds must hook viewers completely; YouTube reports that Shorts with high completion rates receive more algorithmic distribution. (4) Post consistently daily or near-daily — frequent posting gives the algorithm more content to distribute and establishes channel authority. (5) Build long-form parallels — creators who post both Shorts and long-form videos typically earn more from both because cross-traffic boosts overall channel RPM.",
  },
  {
    q: "Is this YouTube Shorts Revenue Calculator free to use?",
    a: "Yes — the YouTube Shorts Revenue Calculator is completely free with no account, no signup, and no usage limits. Calculate your estimated Shorts RPM, revenue range, monthly and yearly projections, and views-to-earn milestones for any combination of niche, audience location, and engagement level. The viral boost simulation and retention rate adjustments are all included at no cost. For a complete Shorts growth strategy, pair this calculator with our free YouTube Hashtag Generator and YouTube Video Idea Generator to optimize both earnings and discovery.",
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
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${open ? "border-primary/40 shadow-md shadow-primary/10" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none rounded-2xl">
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

function MetricCard({ label, value, sub, icon, accent = false, warn = false }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent?: boolean; warn?: boolean;
}) {
  const bg = accent ? "bg-primary/5 border-primary/30" : warn ? "bg-amber-500/5 border-amber-500/30" : "bg-card border-border";
  const iconBg = accent ? "bg-primary/15 text-primary" : warn ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground";
  const textColor = accent ? "text-primary" : warn ? "text-amber-600 dark:text-amber-400" : "text-foreground";
  return (
    <div className={`rounded-2xl p-5 border ${bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold font-display ${textColor}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string }[] = [
  { value: "entertainment", label: "Entertainment" }, { value: "comedy", label: "Comedy" },
  { value: "education", label: "Education" }, { value: "tech", label: "Tech" },
  { value: "finance", label: "Finance" }, { value: "lifestyle", label: "Lifestyle" },
  { value: "gaming", label: "Gaming" }, { value: "motivation", label: "Motivation" },
  { value: "other", label: "Other" },
];

const LOCATIONS: { value: Location; label: string }[] = [
  { value: "us", label: "United States" }, { value: "uk", label: "United Kingdom" },
  { value: "canada", label: "Canada" }, { value: "australia", label: "Australia" },
  { value: "europe", label: "Europe" }, { value: "global", label: "Global (Mixed)" },
  { value: "india", label: "India" }, { value: "nigeria", label: "Nigeria" },
];

const FREQUENCIES: { value: Frequency; label: string; desc: string }[] = [
  { value: "daily",        label: "Daily",        desc: "+15% RPM boost from algorithmic consistency" },
  { value: "weekly",       label: "Weekly",       desc: "Baseline — solid consistency signal" },
  { value: "occasionally", label: "Occasionally", desc: "Lower algorithmic priority" },
];

export function YouTubeShortsRevenueCalculatorTool() {
  const [form, setForm] = useState<FormState>({
    totalViews: "1000000",
    monthlyViews: "500000",
    engagementRate: 8,
    retentionRate: 65,
    useRetention: false,
    location: "us",
    niche: "lifestyle",
    inYPP: true,
    frequency: "weekly",
  });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = "faq-schema-yt-shorts-rev";
    const s = document.createElement("script");
    s.type = "application/ld+json"; s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleCalculate = () => {
    const views = parseFloat(form.totalViews.replace(/,/g, ""));
    if (!form.totalViews || isNaN(views) || views <= 0) {
      setError("Please enter a valid number of Shorts views."); return;
    }
    setError("");
    const res = calculate(form);
    setResult(res);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  };

  const engTierColor = form.engagementRate > 10 ? "text-green-600 dark:text-green-400" :
    form.engagementRate >= 5 ? "text-amber-500" : "text-red-500";

  return (
    <>
      {/* ── Not in YPP warning ─── */}
      {!form.inYPP && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground">Not in YouTube Partner Program:</span>
            <span className="text-muted-foreground ml-1">You must join YPP to earn from Shorts ads. Requirements: 1,000 subscribers + 4,000 watch hours OR 10M Shorts views in 90 days. Toggle YPP on below to see estimated earnings once eligible.</span>
          </div>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">

          {/* Views row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Total Shorts Views *
              </label>
              <Input value={form.totalViews} onChange={e => { setField("totalViews", e.target.value); setError(""); }}
                placeholder="e.g. 1000000" className="rounded-xl h-11 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                Average Monthly Views <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full">Optional — for projections</span>
              </label>
              <Input value={form.monthlyViews} onChange={e => setField("monthlyViews", e.target.value)}
                placeholder="e.g. 500000" className="rounded-xl h-11 text-sm" />
            </div>
          </div>

          {/* Engagement slider */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between">
              <span>Engagement Rate (likes, comments, shares / views)</span>
              <span className={`font-bold text-base ${engTierColor}`}>{form.engagementRate}%</span>
            </label>
            <input type="range" min={0} max={20} step={0.5} value={form.engagementRate}
              onChange={e => setField("engagementRate", Number(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span className="text-red-500">0% (Low)</span>
              <span className="text-amber-500">5–10% (Medium)</span>
              <span className="text-green-600 dark:text-green-400">10%+ (High + Viral Boost)</span>
            </div>
            {form.engagementRate > 10 && (
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
                <Flame className="w-3.5 h-3.5" />
                Viral Boost Factor active: ×{form.engagementRate > 15 ? "1.50" : "1.25"}
              </div>
            )}
          </div>

          {/* Niche + Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Content Niche</label>
              <select value={form.niche} onChange={e => setField("niche", e.target.value as Niche)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
                {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">{NICHE_DEMAND[form.niche]}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Primary Audience Location</label>
              <select value={form.location} onChange={e => setField("location", e.target.value as Location)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
                {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">
                {LOCATION_TIER[form.location] === "tier1" && "✅ Tier 1 market — premium ad pool"}
                {LOCATION_TIER[form.location] === "tier2" && "✅ Tier 2 — above-average RPM"}
                {LOCATION_TIER[form.location] === "baseline" && "ℹ️ Global baseline RPM"}
                {LOCATION_TIER[form.location] === "emerging" && "⚠️ Emerging market — lower ad pool value"}
              </p>
            </div>
          </div>

          {/* Posting frequency */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Posting Frequency</label>
            <div className="grid grid-cols-3 gap-3">
              {FREQUENCIES.map(f => (
                <button key={f.value} type="button" onClick={() => setField("frequency", f.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${form.frequency === f.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <div className="font-bold text-sm">{f.label}</div>
                  <div className="font-normal opacity-70 mt-0.5 text-[10px]">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Retention rate (optional) */}
          <div className={`rounded-2xl border p-4 transition-all ${form.useRetention ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Average Retention Rate</p>
                <p className="text-xs text-muted-foreground">% of your Short viewers watch to completion — from YouTube Studio</p>
              </div>
              <button type="button" onClick={() => setField("useRetention", !form.useRetention)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.useRetention ? "bg-primary" : "bg-muted-foreground/30"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${form.useRetention ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
            {form.useRetention && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Retention rate</span>
                  <span className={`font-bold ${form.retentionRate >= 60 ? "text-green-600 dark:text-green-400" : form.retentionRate >= 40 ? "text-amber-500" : "text-red-500"}`}>
                    {form.retentionRate}%
                  </span>
                </div>
                <input type="range" min={10} max={100} step={5} value={form.retentionRate}
                  onChange={e => setField("retentionRate", Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10%</span><span>60% avg</span><span>100%</span>
                </div>
              </div>
            )}
          </div>

          {/* YPP toggle */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${form.inYPP ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
            <div>
              <p className="text-sm font-semibold text-foreground">YouTube Partner Program (YPP)</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.inYPP ? "✅ YPP member — Shorts ads revenue enabled" : "⚠️ Not in YPP — Shorts earn $0 in ad revenue without this"}
              </p>
            </div>
            <button type="button" onClick={() => setField("inYPP", !form.inYPP)}
              className={`w-12 h-6 rounded-full transition-all relative ${form.inYPP ? "bg-green-500" : "bg-muted-foreground/30"}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${form.inYPP ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <Button onClick={handleCalculate} size="lg" className="w-full h-12 rounded-xl font-semibold text-base gap-2"
            disabled={!form.inYPP}>
            <BarChart2 className="w-5 h-5" />
            {form.inYPP ? "Estimate Revenue" : "Enable YPP to Estimate"}
          </Button>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────── */}
      {result && form.inYPP && (
        <div ref={resultsRef} className="mt-6 space-y-5 animate-in slide-in-from-bottom-4 duration-500">

          {/* Key metrics */}
          <div className="grid sm:grid-cols-3 gap-4">
            <MetricCard label="Shorts RPM Range" value={`$${fmt(result.rpmMin)} – $${fmt(result.rpmMax)}`}
              sub={`Mid estimate: $${fmt(result.rpmMid)} per 1K views`}
              icon={<DollarSign className="w-4 h-4" />} />
            <MetricCard label="Revenue per 1,000 Views" value={`$${fmt(result.rpmMid)}`}
              sub="After YouTube's 45% revenue share"
              icon={<TrendingUp className="w-4 h-4" />} />
            <MetricCard label="Estimated Earnings" value={`${fmtDollar(result.revenueMin)} – ${fmtDollar(result.revenueMax)}`}
              sub={`Mid estimate: ${fmtDollar(result.revenueMid)}`}
              icon={<DollarSign className="w-4 h-4" />} accent />
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Revenue Breakdown
            </h3>
            <div className="space-y-3">
              {[
                { label: "Low Estimate", value: fmtDollar(result.revenueMin), desc: "Conservative — low end of RPM range" },
                { label: "Average Estimate", value: fmtDollar(result.revenueMid), desc: "Mid-point estimate — realistic target" },
                { label: "High Estimate", value: fmtDollar(result.revenueMax), desc: "Best case — high end of RPM range" },
                ...(result.viralBoostFactor > 1 ? [{
                  label: `With Viral Boost (×${result.viralBoostFactor.toFixed(2)})`,
                  value: `${fmtDollar(result.revenueViralMin)} – ${fmtDollar(result.revenueViralMax)}`,
                  desc: `Projected if your Short goes viral (${form.engagementRate}% engagement triggers ${result.viralBoostFactor}× boost)`,
                }] : []),
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${i === 3 ? "border-green-500/30 bg-green-500/5" : i === 1 ? "border-primary/20 bg-primary/5" : "border-border bg-muted/20"}`}>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.desc}</p>
                  </div>
                  <p className={`text-lg font-bold font-display ${i === 3 ? "text-green-600 dark:text-green-400" : i === 1 ? "text-primary" : "text-foreground"}`}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly / Yearly projection */}
          {result.hasMonthly && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Monthly & Yearly Projection
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Monthly Estimate</p>
                  <p className="text-2xl font-bold font-display text-primary">{fmtDollar(result.monthlyMin)} – {fmtDollar(result.monthlyMax)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on {Number(form.monthlyViews.replace(/,/g, "")).toLocaleString()} monthly views</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Yearly Estimate</p>
                  <p className="text-2xl font-bold font-display text-primary">{fmtDollar(result.yearlyMin)} – {fmtDollar(result.yearlyMax)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Monthly projection × 12 months</p>
                </div>
              </div>
            </div>
          )}

          {/* Views needed milestones */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" /> Views Needed to Hit Earnings Milestones
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { goal: "$100", views: result.viewsFor100, icon: <Target className="w-5 h-5" /> },
                { goal: "$1,000", views: result.viewsFor1000, icon: <Zap className="w-5 h-5" /> },
              ].map(({ goal, views, icon }) => (
                <div key={goal} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">{icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To earn {goal}</p>
                    <p className="text-xl font-bold font-display text-foreground">{fmtViews(views)} views</p>
                    <p className="text-xs text-muted-foreground">at mid RPM of ${fmt(result.rpmMid)}/1K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart insights */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" /> Smart Revenue Insights
            </h3>
            <div className="space-y-3">
              {result.suggestions.map((s, i) => (
                <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                  s.type === "boost" ? "bg-green-500/5 border-green-500/20" :
                  s.type === "info"  ? "bg-primary/5 border-primary/20" :
                  "bg-muted/40 border-border"}`}>
                  {s.type === "boost" ? <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" /> :
                   s.type === "info"  ? <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" /> :
                   <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm text-foreground leading-relaxed">{s.text}</p>
                    {s.impact && (
                      <span className="inline-block mt-1.5 text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                        Potential impact: {s.impact}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Shorts Revenue Calculator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Shorts Views", desc: "Input your total Shorts view count from YouTube Studio Analytics. Optionally add your average monthly views to unlock the monthly and yearly revenue projection section. The calculator adjusts for realistic RPM ranges — not inflated estimates — based on actual Shorts creator earnings data." },
            { step: 2, title: "Set Engagement Rate and Niche", desc: "Move the engagement slider to match your typical Shorts performance (likes + comments + shares ÷ total views). Channels above 10% engagement trigger the Viral Boost Factor. Select your content niche — finance and tech Shorts earn 3–5× more per view than entertainment content due to the ad pool weighting system." },
            { step: 3, title: "Configure Location and Posting Habits", desc: "Select where most of your viewers are located — audience geography is one of the biggest determinants of Shorts RPM. Choose your posting frequency; daily posting earns a 15% RPM boost from algorithmic favorability. Optionally enable the retention rate slider if you know your average completion percentage from Studio." },
            { step: 4, title: "Review Results and Apply Insights", desc: "Results show your realistic earnings range (low/mid/high), RPM, and monthly projections. The Views Needed section shows exactly how many views reach your $100 and $1,000 earnings milestones. Smart Revenue Insights flag your biggest specific opportunities — with exact impact percentages where applicable." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">{step}</div>
              <div><h3 className="font-bold text-foreground mb-1">{title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Shorts Revenue Calculator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> How YouTube Shorts Monetization Really Works
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube Shorts monetization is fundamentally different from regular video monetization, and
              most calculators get this wrong by applying long-form CPM rates to Shorts views. Shorts don't
              serve ads before or during individual videos — instead, YouTube displays ads between Shorts in
              the feed, pools all the revenue from those ads in each country, and distributes a share to
              eligible creators based on their percentage of total Shorts views in that region during the
              payment period. YouTube keeps 55% and creators receive 45% of their allocated share — compared
              to 55% for regular videos. This pooled structure means Shorts RPM is not fixed and varies based
              on total creator activity in your country's pool during any given month.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The practical result is that Shorts RPM typically falls between $0.01 and $0.12 per 1,000
              views — dramatically lower than long-form video RPM of $1–15. However, Shorts compensate
              through volume: the algorithmic reach of Shorts is massively higher than regular videos, with
              the Short Feed distributing content to non-subscribers at rates that long-form videos rarely
              achieve. A Shorts creator averaging 5 million views per month on entertainment content at $0.02
              RPM earns approximately $100/month — but those same 5 million views would be nearly impossible
              to achieve monthly on long-form content without a massive existing audience.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" /> The Four Variables That Determine Your Shorts Earnings
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our calculator uses a multiplicative scoring formula across four variables: Niche Base RPM ×
              Location Multiplier × Engagement Multiplier × Posting Frequency Multiplier. Each variable has
              documented real-world impact on Shorts revenue, and the interaction between them creates the
              wide earnings range you see between different creators at the same view count.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Content niche</strong> sets your RPM ceiling. Finance and
              tech Shorts benefit from the same premium advertiser pool that makes long-form finance videos
              high-earning — even though the mechanism is different (pooled vs. direct), the composition of
              the ad pool in your country still reflects advertiser category spend. Entertainment and comedy
              Shorts have the broadest algorithmic reach but the thinnest ad revenue per view. The strategic
              move for many creators is a hybrid approach: combine high-engagement entertainment Shorts with
              occasional finance, career, or tech crossover content to raise your blended channel RPM.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Audience location</strong> creates multipliers from 0.4× to
              2.0× over the global baseline. US viewers are in the world's highest-value ad pool; Indian
              viewers, despite being YouTube's single largest national audience by volume, contribute to a
              much lower-value pool. This matters specifically for Shorts because the pooled payment model
              means your country earnings are determined by which pool your viewers participate in, making
              geographic targeting more impactful for Shorts creators than for long-form creators.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Engagement rate and the Viral Boost Factor</strong> capture
              the non-linear revenue acceleration that happens when a Short performs exceptionally well.
              Above 10% engagement, YouTube's algorithm distributes content to dramatically more non-subscribers —
              creating a compounding views effect that our viral boost multiplier (1.25–1.50×) models
              realistically. This is why two creators with the same 1M views and the same niche can earn
              very different amounts: the one whose Short got algorithmic distribution to high-value US
              audiences earns 3–5× more than the one whose views came organically from existing subscribers.
              Combine Shorts revenue optimization with a strong{" "}
              <Link href="/tools/youtube-hashtag-generator" className="text-primary hover:underline font-medium">
                hashtag strategy
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-video-idea-generator" className="text-primary hover:underline font-medium">
                video ideas optimized for virality
              </Link>.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Shorts Revenue Calculator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Accurate Shorts-specific RPM ranges — not misleading long-form CPM rates",
                "Variability simulation: randomized RPM within niche range for realistic min/max",
                "Viral Boost Factor: 1.10–1.50× multiplier for high-engagement Shorts",
                "Retention rate toggle: adjusts earnings based on completion percentage",
                "Views needed to earn $100 and $1,000 — personalized to your exact RPM",
                "Monthly and yearly projections when average monthly views are provided",
                "Dynamic revenue insights ranked by specific impact with exact percentages",
                "YPP toggle with clear eligibility requirements for non-partner channels",
                "Posting frequency impact: daily posting earns +15% from algorithmic favorability",
                "100% free, instant calculations, no account required",
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
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Maximize Your YouTube Shorts Revenue</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Shorts RPM averages $0.03–$0.07 per 1,000 views vs. $3–$7 for long-form — use Shorts primarily for audience growth, not as your main income source.",
            "Post Shorts daily for 30 consecutive days to build algorithmic momentum — consistency matters far more than production quality for Shorts distribution.",
            "Hook viewers in the first 0.5 seconds — Shorts with 90%+ loop-through rate get aggressively distributed to new audiences by YouTube's algorithm.",
            "Use Shorts to funnel viewers to your long-form content — even a 0.5% conversion to long-form subscribers builds compounding channel revenue over time.",
            "Trending audio clips can increase Shorts reach 3–8× — check YouTube's built-in trending audio library before recording each Short for maximum reach.",
            "Peak Shorts performance windows are 6–9 AM and 7–10 PM local time — scheduling within these windows improves initial distribution significantly.",
            "Repurpose your best long-form moments as Shorts — this doubles your content output with minimal effort and cross-promotes your full videos to Shorts viewers.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
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
            { name: "YouTube Money Calculator", path: "/tools/youtube-money-calculator", desc: "Estimate your full YouTube revenue including ads, sponsorships, and memberships." },
            { name: "YouTube CPM Calculator", path: "/tools/youtube-cpm-calculator", desc: "Calculate estimated CPM and RPM for your long-form videos by niche and location." },
            { name: "YouTube Engagement Calculator", path: "/tools/youtube-engagement-calculator", desc: "Measure likes, comments, and share rates to understand your audience engagement." },
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized tags to help your Shorts and videos rank in search." },
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

      {/* ── FAQ ──────────────────────────────────────────────── */}
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
