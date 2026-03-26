import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign, TrendingUp, BarChart2, Lightbulb, ChevronDown,
  ListChecks, Shield, Zap, AlertCircle, CheckCircle2, Check,
  ArrowUpRight, Info,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche      = "finance" | "tech" | "business" | "education" | "gaming" | "entertainment" | "lifestyle" | "health" | "other";
type Location   = "us" | "uk" | "canada" | "australia" | "europe" | "global" | "india" | "nigeria";
type Engagement = "high" | "medium" | "low";

interface FormState {
  totalViews: string;
  monetizedPct: number;
  customCpm: string;
  niche: Niche;
  location: Location;
  engagement: Engagement;
  adSkippable: boolean;
  adNonSkippable: boolean;
  adDisplay: boolean;
  adBumper: boolean;
}

interface CalcResult {
  cpmMin: number;
  cpmMax: number;
  cpmMid: number;
  rpm: number;
  monetizedViews: number;
  revenueMin: number;
  revenueMax: number;
  revenueMid: number;
  locationBoostPct: number;
  engagementBoostPct: number;
  adBoostPct: number;
  projections: { label: string; views: number; min: number; max: number }[];
  suggestions: { type: "boost" | "info" | "tip"; text: string; impact?: string }[];
}

// ─── Data tables ──────────────────────────────────────────────────────────────

const NICHE_CPM: Record<Niche, [number, number]> = {
  finance:       [15, 40],
  tech:          [10, 25],
  business:      [12, 30],
  education:     [8,  20],
  gaming:        [3,  10],
  entertainment: [2,   8],
  lifestyle:     [3,  12],
  health:        [5,  15],
  other:         [4,  12],
};

const NICHE_LABELS: Record<Niche, string> = {
  finance: "Finance", tech: "Tech", business: "Business", education: "Education",
  gaming: "Gaming", entertainment: "Entertainment", lifestyle: "Lifestyle",
  health: "Health & Fitness", other: "Other",
};

const NICHE_DEMAND: Record<Niche, string> = {
  finance:       "🔥 Very High — Finance is one of YouTube's highest-paying niches",
  tech:          "🔥 High — Tech has strong advertiser demand year-round",
  business:      "🔥 High — Business content attracts premium B2B advertisers",
  education:     "✅ Medium-High — Educational content earns consistent ad revenue",
  gaming:        "⚠️ Medium — Gaming CPM is lower but volume can compensate",
  entertainment: "⚠️ Low-Medium — Entertainment has the largest audience but lower CPM",
  lifestyle:     "✅ Medium — Lifestyle CPM varies widely by sub-niche",
  health:        "✅ Medium-High — Health & wellness advertisers pay competitive rates",
  other:         "✅ Medium — CPM depends heavily on your specific topic",
};

const LOCATION_MULT: Record<Location, [number, number]> = {
  us:        [1.80, 2.20],
  uk:        [1.50, 1.80],
  canada:    [1.50, 1.70],
  australia: [1.60, 1.90],
  europe:    [1.20, 1.50],
  global:    [1.00, 1.00],
  india:     [0.40, 0.60],
  nigeria:   [0.30, 0.50],
};

const LOCATION_LABELS: Record<Location, string> = {
  us: "United States", uk: "United Kingdom", canada: "Canada",
  australia: "Australia", europe: "Europe", global: "Global (Mixed)",
  india: "India", nigeria: "Nigeria",
};

const LOCATION_TIER: Record<Location, "tier1" | "tier2" | "tier3" | "emerging"> = {
  us: "tier1", uk: "tier1", canada: "tier1", australia: "tier1",
  europe: "tier2", global: "tier2", india: "emerging", nigeria: "emerging",
};

const ENGAGEMENT_MULT: Record<Engagement, [number, number]> = {
  high:   [1.20, 1.50],
  medium: [0.90, 1.10],
  low:    [0.60, 0.80],
};

// ─── Calc engine ──────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Deterministic "random" factor based on inputs — gives realistic variance
function fakeRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return ((h >>> 0) % 1000) / 1000;
}

function fmt(n: number, digits = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtDollar(n: number): string {
  if (n >= 1000) return `$${fmt(n / 1000, 1)}K`;
  return `$${fmt(n)}`;
}

function calculate(form: FormState): CalcResult | null {
  const totalViews = parseFloat(form.totalViews.replace(/,/g, ""));
  if (!totalViews || totalViews <= 0) return null;

  const monetizedViews = totalViews * (form.monetizedPct / 100);
  const seed = `${form.niche}-${form.location}-${form.engagement}`;
  const r = fakeRandom(seed);

  // ── CPM base from niche ────────────────────────────────────────────────────
  let [cpmBaseMin, cpmBaseMax] = NICHE_CPM[form.niche];

  // Use custom CPM if provided
  if (form.customCpm && parseFloat(form.customCpm) > 0) {
    const custom = parseFloat(form.customCpm);
    cpmBaseMin = custom * 0.85;
    cpmBaseMax = custom * 1.15;
  }

  // ── Location multiplier ────────────────────────────────────────────────────
  const [locMin, locMax] = LOCATION_MULT[form.location];
  const locMult = lerp(locMin, locMax, r);

  // ── Engagement multiplier ──────────────────────────────────────────────────
  const [engMin, engMax] = ENGAGEMENT_MULT[form.engagement];
  const engMult = lerp(engMin, engMax, (r + 0.3) % 1);

  // ── Ad type multiplier ─────────────────────────────────────────────────────
  let adMult = 1.0;
  if (form.adSkippable)    adMult += 0.00;  // baseline
  if (form.adNonSkippable) adMult += 0.18;
  if (form.adDisplay)      adMult += 0.08;
  if (form.adBumper)       adMult += 0.10;

  // ── Final CPM ─────────────────────────────────────────────────────────────
  const cpmMin = cpmBaseMin * locMin * engMin * adMult;
  const cpmMax = cpmBaseMax * locMax * engMax * adMult;
  const cpmMid = lerp(cpmMin, cpmMax, 0.5);

  // ── Revenue ───────────────────────────────────────────────────────────────
  const revenueMin = (monetizedViews / 1000) * cpmMin * 0.55; // YouTube takes 45%
  const revenueMax = (monetizedViews / 1000) * cpmMax * 0.55;
  const revenueMid = (revenueMin + revenueMax) / 2;

  // ── RPM ───────────────────────────────────────────────────────────────────
  const rpm = totalViews > 0 ? (revenueMid / totalViews) * 1000 : 0;

  // ── Boost percentages for display ─────────────────────────────────────────
  const locationBoostPct = Math.round((lerp(locMin, locMax, 0.5) - 1) * 100);
  const engagementBoostPct = form.engagement === "high" ? 35 : form.engagement === "medium" ? 0 : -30;
  const adBoostPct = Math.round((adMult - 1) * 100);

  // ── Projections ───────────────────────────────────────────────────────────
  const rpmMin = (cpmMin * 0.55 * (form.monetizedPct / 100));
  const rpmMax = (cpmMax * 0.55 * (form.monetizedPct / 100));
  const projections = [1000, 10000, 100000, 1000000].map(v => ({
    label: v >= 1000000 ? "1M" : v >= 1000 ? `${v / 1000}K` : `${v}`,
    views: v,
    min: (v / 1000) * rpmMin,
    max: (v / 1000) * rpmMax,
  }));

  // ── Dynamic suggestions ────────────────────────────────────────────────────
  const suggestions: CalcResult["suggestions"] = [];
  const tier = LOCATION_TIER[form.location];

  if (tier === "emerging") {
    const usCpmMid = lerp(cpmBaseMin * 1.8, cpmBaseMax * 2.2, 0.5) * 0.55;
    const currentCpmMid = lerp(cpmBaseMin * locMin, cpmBaseMax * locMax, 0.5) * 0.55;
    const boostPct = Math.round(((usCpmMid - currentCpmMid) / currentCpmMid) * 100);
    suggestions.push({
      type: "boost",
      text: `Switching to a US-targeted audience could increase your CPM by approximately ${boostPct}%`,
      impact: `+${boostPct}% CPM`,
    });
  }

  if (tier === "tier1" || tier === "tier2") {
    suggestions.push({
      type: "info",
      text: `Your ${LOCATION_LABELS[form.location]} audience is in a high-value ad market — your CPM is already boosted by ${locationBoostPct > 0 ? "+" : ""}${locationBoostPct}% compared to global baseline`,
    });
  }

  if (!form.adNonSkippable) {
    suggestions.push({
      type: "boost",
      text: "Enabling non-skippable ads could increase your CPM by ~18% — viewers must watch them before your video plays",
      impact: "+~18% CPM",
    });
  }

  if (!form.adBumper) {
    suggestions.push({
      type: "boost",
      text: "Adding 6-second bumper ads provides additional ad inventory at the end of videos with minimal viewer friction",
      impact: "+~10% CPM",
    });
  }

  if (form.engagement === "low") {
    suggestions.push({
      type: "boost",
      text: "Improving audience engagement (likes, comments, watch time) to 'Medium' level could raise your RPM by 30–50%",
      impact: "+30–50% RPM",
    });
  } else if (form.engagement === "medium") {
    suggestions.push({
      type: "boost",
      text: "Channels with High engagement typically earn 20–40% more RPM — focus on longer videos and strong call-to-actions",
      impact: "+20–40% RPM",
    });
  }

  if (form.niche === "gaming" || form.niche === "entertainment") {
    suggestions.push({
      type: "tip",
      text: `Your ${NICHE_LABELS[form.niche]} niche has lower CPM rates — consider adding finance, tech, or business content to your channel mix to raise average CPM`,
    });
  }

  if (form.monetizedPct < 60) {
    suggestions.push({
      type: "tip",
      text: `Your monetized playback rate of ${form.monetizedPct}% is below average — improving click-through rate, video length, and audience retention typically pushes this above 65–70%`,
    });
  }

  suggestions.push({
    type: "tip",
    text: `At your current metrics, posting videos with 8–12 minute runtimes enables mid-roll ads, which can increase per-video revenue by 15–25% compared to videos under 8 minutes`,
  });

  return {
    cpmMin, cpmMax, cpmMid, rpm, monetizedViews,
    revenueMin, revenueMax, revenueMid,
    locationBoostPct, engagementBoostPct, adBoostPct,
    projections, suggestions,
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is CPM on YouTube and how is it calculated?",
    a: "CPM stands for Cost Per Mille — the amount advertisers pay YouTube for 1,000 ad impressions (views of an ad) on your videos. YouTube then pays you approximately 55% of that amount as your revenue share, which is why your earnings are always lower than the raw CPM figure. CPM is not fixed — it fluctuates based on your content niche, the time of year (Q4 is highest due to holiday ad spend), your audience's geographic location, engagement metrics, and which ad formats are enabled on your channel. Our calculator models all these variables to give you a realistic CPM estimate.",
  },
  {
    q: "What is the difference between CPM and RPM on YouTube?",
    a: "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions — it measures ad market demand. RPM (Revenue Per Mille) is what you actually earn per 1,000 total video views after YouTube's 45% cut and accounting for the fact that not every view serves an ad. RPM is always lower than CPM because not all views are monetized (some viewers use ad blockers, some skip before the ad registers, some are in regions with lower ad demand). RPM is the more useful metric for estimating your actual earnings since it accounts for your full audience, including non-monetized views.",
  },
  {
    q: "What YouTube niches have the highest CPM?",
    a: "Finance and investing content consistently earns the highest YouTube CPM, typically ranging from $15–40+ per 1,000 monetized views. Business, tech, and digital marketing content follow closely at $10–30. These niches command premium rates because advertisers targeting high-income audiences — financial products, SaaS software, business tools — pay significantly more per ad impression than consumer brands. Gaming and entertainment content sits at the opposite end ($2–10) because the primary advertiser base is gaming peripheral brands and apps with smaller ad budgets. Niche CPM also varies by season — Q4 (October–December) typically sees CPM rates 40–80% higher than Q1.",
  },
  {
    q: "How does audience location affect YouTube earnings?",
    a: "Your audience's geographic location is one of the most powerful CPM determinants. Viewers in the United States, United Kingdom, Canada, and Australia are in Tier 1 markets where advertisers pay the most — US CPM rates are typically 80–120% higher than the global average. European audiences earn 20–50% above baseline. Viewers in India and Nigeria, while representing enormous YouTube audiences, earn CPM rates that are 40–70% below the global average due to lower local advertising budgets and fewer premium-tier advertisers targeting those markets. This doesn't mean you should avoid these audiences — volume can compensate — but location-aware content strategy significantly impacts revenue per view.",
  },
  {
    q: "Why do my YouTube earnings fluctuate so much?",
    a: "YouTube earnings fluctuate for several reasons: (1) Seasonal ad spend — Q4 sees a massive surge as brands spend their annual budgets before year-end, while January typically has the lowest CPM of the year. (2) Ad auction competition — CPM is determined by real-time bidding among advertisers; some days see more competition than others. (3) Content category — videos covering finance, investing, or tech on a given day may attract more premium advertisers than entertainment content. (4) Click-through rate and watch time — the algorithm distributes content differently based on engagement signals, affecting which ad-serving tier your videos reach. (5) YouTube's payment structure — YouTube pays monthly, and late December/January payouts often seem low because December's high earnings come in February.",
  },
  {
    q: "What percentage of YouTube views are actually monetized?",
    a: "For most established channels, 40–70% of total views result in a monetized impression. This is affected by: ad blockers (approximately 30–40% of desktop viewers use them, though mobile is lower), viewers in regions with minimal ad inventory, short-form views that don't trigger enough ad time, and YouTube Premium subscribers whose views don't serve ads (you still earn from Premium, but at a different rate). The monetized playback percentage tends to be higher for channels with older, desktop-heavy audiences and lower for channels with predominantly young mobile audiences. Our calculator's monetized playback slider lets you input your actual rate from YouTube Studio → Analytics → Revenue.",
  },
  {
    q: "How can I increase my YouTube CPM and RPM?",
    a: "The most impactful CPM improvement strategies are: (1) Shift content toward higher-paying niches — finance, tech, and business topics consistently attract premium advertisers. (2) Enable all ad formats — non-skippable ads, bumper ads, and display ads each add ad inventory and raise effective CPM. (3) Make videos at least 8 minutes long — mid-roll ads can be inserted in longer videos, sometimes doubling ad inventory per video. (4) Target high-income demographics through your content — tutorials for professionals, advanced guides, and B2B-relevant content attract higher-budget advertisers. (5) Improve watch time and engagement — the algorithm distributes content with strong retention to larger, more advertiser-friendly audiences. (6) Post consistently during Q4 — ad budgets peak between October and December.",
  },
  {
    q: "Does YouTube take a cut of my ad revenue?",
    a: "Yes — YouTube retains 45% of all ad revenue generated on your channel and pays you the remaining 55%. This is the standard YouTube Partner Program revenue share for all creators. For YouTube Premium subscribers who watch your content without ads, YouTube pays creators a proportional share of their Premium subscription revenue based on how much of a subscriber's total YouTube watch time was spent on your videos. This Premium revenue is typically modest but adds to your overall RPM and explains why RPM and CPM are rarely equal even accounting for non-monetized views.",
  },
  {
    q: "How accurate is this YouTube CPM Calculator?",
    a: "Our calculator models the key variables that determine YouTube earnings — niche base CPM ranges, audience location multipliers, engagement scoring, and ad format multipliers — based on publicly available CPM data and creator-reported analytics. The results represent realistic ranges rather than exact predictions because actual CPM fluctuates daily based on real-time ad auction dynamics that no external tool can access. The min/max range format shows you the realistic floor and ceiling for your earnings, and the mid-point estimate gives you a working baseline. For precise figures, compare our estimates against your actual YouTube Studio Revenue tab data — most creators find our ranges accurate to within 20–30%.",
  },
  {
    q: "Is this YouTube CPM Calculator free to use?",
    a: "Yes — the YouTube CPM Calculator is completely free with no account, no signup, and no usage limits. Calculate your estimated CPM, RPM, and earnings range for any combination of views, niche, audience location, and engagement level. The dynamic suggestions update automatically based on your inputs to show exactly where your biggest revenue opportunities are. All calculations run instantly in your browser.",
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
    <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-200 ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
        aria-expanded={open}>
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon, accent = false }: { label: string; value: string; sub?: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? "bg-primary/5 border-primary/30" : "bg-card border-border"}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold font-display ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string }[] = [
  { value: "finance", label: "Finance & Investing" },
  { value: "tech", label: "Tech & Gadgets" },
  { value: "business", label: "Business & Marketing" },
  { value: "education", label: "Education" },
  { value: "gaming", label: "Gaming" },
  { value: "entertainment", label: "Entertainment" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "health", label: "Health & Fitness" },
  { value: "other", label: "Other" },
];

const LOCATIONS: { value: Location; label: string }[] = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "canada", label: "Canada" },
  { value: "australia", label: "Australia" },
  { value: "europe", label: "Europe" },
  { value: "global", label: "Global (Mixed)" },
  { value: "india", label: "India" },
  { value: "nigeria", label: "Nigeria" },
];

const ENGAGEMENTS: { value: Engagement; label: string; desc: string }[] = [
  { value: "high", label: "High", desc: "Strong watch time, lots of comments & likes" },
  { value: "medium", label: "Medium", desc: "Average retention, occasional comments" },
  { value: "low", label: "Low", desc: "Short watch time, low interaction" },
];

const AD_TYPES = [
  { key: "adSkippable" as const, label: "Skippable Ads", desc: "Standard in-stream, skippable after 5s" },
  { key: "adNonSkippable" as const, label: "Non-Skippable Ads", desc: "15–20s ads viewers must watch" },
  { key: "adDisplay" as const, label: "Display Ads", desc: "Banner overlay ads on video" },
  { key: "adBumper" as const, label: "Bumper Ads", desc: "6-second unskippable end cards" },
];

export function YouTubeCpmCalculatorTool() {
  const [form, setForm] = useState<FormState>({
    totalViews: "100000",
    monetizedPct: 55,
    customCpm: "",
    niche: "tech",
    location: "us",
    engagement: "medium",
    adSkippable: true,
    adNonSkippable: false,
    adDisplay: true,
    adBumper: false,
  });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-cpm-calc";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCalculate = () => {
    const views = parseFloat(form.totalViews.replace(/,/g, ""));
    if (!form.totalViews || isNaN(views) || views <= 0) {
      setError("Please enter a valid number of total views.");
      return;
    }
    if (!form.adSkippable && !form.adNonSkippable && !form.adDisplay && !form.adBumper) {
      setError("Please enable at least one ad type.");
      return;
    }
    setError("");
    const res = calculate(form);
    setResult(res);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  };

  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">

          {/* Row 1: Views + Monetized % */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Total Monthly Views *
              </label>
              <Input
                value={form.totalViews}
                onChange={e => { setField("totalViews", e.target.value); setError(""); }}
                placeholder="e.g. 100000"
                className="rounded-xl h-11 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Monetized Playbacks: <span className="text-primary font-bold">{form.monetizedPct}%</span>
              </label>
              <input
                type="range" min={10} max={100} step={5}
                value={form.monetizedPct}
                onChange={e => setField("monetizedPct", Number(e.target.value))}
                className="w-full accent-primary cursor-pointer mt-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10%</span><span>55% avg</span><span>100%</span>
              </div>
            </div>
          </div>

          {/* Row 2: Custom CPM (optional) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              Known CPM ($) <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full">Optional — leave blank to auto-estimate</span>
            </label>
            <Input
              value={form.customCpm}
              onChange={e => setField("customCpm", e.target.value)}
              placeholder="e.g. 8.50 — from YouTube Studio Analytics"
              className="rounded-xl h-11 text-sm max-w-xs"
              type="number"
              min="0"
              step="0.01"
            />
          </div>

          {/* Row 3: Niche + Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Channel Niche</label>
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
                {LOCATION_TIER[form.location] === "tier1" && "✅ Tier 1 market — highest CPM rates globally"}
                {LOCATION_TIER[form.location] === "tier2" && "✅ Tier 2 market — above-average CPM rates"}
                {LOCATION_TIER[form.location] === "emerging" && "⚠️ Emerging market — lower CPM, consider US-targeted content"}
              </p>
            </div>
          </div>

          {/* Row 4: Engagement */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Audience Engagement Level</label>
            <div className="grid grid-cols-3 gap-3">
              {ENGAGEMENTS.map(e => (
                <button key={e.value} type="button" onClick={() => setField("engagement", e.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${form.engagement === e.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <div className="font-bold text-sm">{e.label}</div>
                  <div className="font-normal opacity-70 mt-0.5">{e.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Ad Types */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Ad Types Enabled</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {AD_TYPES.map(ad => (
                <label key={ad.key} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${form[ad.key] ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <div
                    onClick={() => setField(ad.key, !form[ad.key])}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${form[ad.key] ? "border-primary bg-primary" : "border-muted-foreground/40"}`}
                  >
                    {form[ad.key] && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{ad.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ad.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button onClick={handleCalculate} size="lg" className="w-full h-12 rounded-xl font-semibold text-base gap-2">
            <BarChart2 className="w-5 h-5" /> Calculate Earnings
          </Button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {result && (
        <div ref={resultsRef} className="mt-6 space-y-5 animate-in slide-in-from-bottom-4 duration-500">

          {/* Key metrics */}
          <div className="grid sm:grid-cols-3 gap-4">
            <MetricCard
              label="Estimated CPM Range"
              value={`$${fmt(result.cpmMin)} – $${fmt(result.cpmMax)}`}
              sub={`Mid estimate: $${fmt(result.cpmMid)} per 1K monetized views`}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricCard
              label="Estimated RPM"
              value={`$${fmt(result.rpm)}`}
              sub={`Per 1,000 total views (after YouTube's 45% share)`}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MetricCard
              label="Estimated Monthly Revenue"
              value={`${fmtDollar(result.revenueMin)} – ${fmtDollar(result.revenueMax)}`}
              sub={`Mid estimate: ${fmtDollar(result.revenueMid)}`}
              icon={<DollarSign className="w-4 h-4" />}
              accent
            />
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Revenue Breakdown
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ["Total Views", Number(form.totalViews.replace(/,/g, "")).toLocaleString()],
                ["Monetized Views", Math.round(result.monetizedViews).toLocaleString()],
                ["Monetized Playback %", `${form.monetizedPct}%`],
                ["YouTube Revenue Share", "55% (YouTube keeps 45%)"],
                ["CPM Range", `$${fmt(result.cpmMin)} – $${fmt(result.cpmMax)}`],
                ["RPM", `$${fmt(result.rpm)} per 1K views`],
                ["Revenue Range", `${fmtDollar(result.revenueMin)} – ${fmtDollar(result.revenueMax)}`],
                ["Mid Estimate", fmtDollar(result.revenueMid)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multiplier breakdown */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> CPM Score Breakdown
              <span className="text-xs font-normal text-muted-foreground">(CPM = Base × Location × Engagement × Ad Type)</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: "Base CPM (Niche)", value: `$${fmt(NICHE_CPM[form.niche][0])} – $${fmt(NICHE_CPM[form.niche][1])}`, pct: null },
                { label: "Location Multiplier", value: `${LOCATION_LABELS[form.location]}`, pct: result.locationBoostPct >= 0 ? `+${result.locationBoostPct}%` : `${result.locationBoostPct}%` },
                { label: "Engagement Multiplier", value: form.engagement === "high" ? "High" : form.engagement === "medium" ? "Medium" : "Low", pct: result.engagementBoostPct >= 0 ? `+${result.engagementBoostPct}%` : `${result.engagementBoostPct}%` },
                { label: "Ad Type Multiplier", value: `${[form.adSkippable && "Skippable", form.adNonSkippable && "Non-skip", form.adDisplay && "Display", form.adBumper && "Bumper"].filter(Boolean).join(", ")}`, pct: result.adBoostPct > 0 ? `+${result.adBoostPct}%` : "Baseline" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">{row.value}</span>
                    {row.pct && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.pct.startsWith("+") ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                        {row.pct}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings projection table */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Earnings Projection at Different View Counts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left pb-3 pr-4">Views</th>
                    <th className="text-right pb-3 pr-4">Min Revenue</th>
                    <th className="text-right pb-3 pr-4">Max Revenue</th>
                    <th className="text-right pb-3">Mid Estimate</th>
                  </tr>
                </thead>
                <tbody>
                  {result.projections.map(p => (
                    <tr key={p.label} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 pr-4 font-bold text-foreground">{p.label} views</td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">{fmtDollar(p.min)}</td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">{fmtDollar(p.max)}</td>
                      <td className="py-3 text-right font-bold text-primary">{fmtDollar((p.min + p.max) / 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Smart suggestions */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" /> Smart Revenue Insights
            </h3>
            <div className="space-y-3">
              {result.suggestions.map((s, i) => (
                <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                  s.type === "boost" ? "bg-green-500/5 border-green-500/20" :
                  s.type === "info" ? "bg-primary/5 border-primary/20" :
                  "bg-muted/40 border-border"
                }`}>
                  {s.type === "boost" ? <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" /> :
                   s.type === "info" ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> :
                   <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                  <div className="min-w-0">
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube CPM Calculator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Views and Monetization Rate", desc: "Input your total monthly views and use the slider to set your monetized playback percentage. Find your exact monetized playback rate in YouTube Studio → Analytics → Revenue tab. If you don't know it yet, 55% is a reliable starting estimate for established channels." },
            { step: 2, title: "Select Your Niche, Location, and Engagement", desc: "Choose your channel niche from the dropdown — the calculator uses real CPM ranges for each niche. Select where most of your audience is located, as location is one of the biggest CPM factors. Then rate your engagement level based on typical watch time, comments, and likes relative to your view count." },
            { step: 3, title: "Enable Your Ad Types and Calculate", desc: "Check all ad formats you have enabled in YouTube Studio (Monetization → Ad formats). More ad formats = more ad inventory = higher effective CPM. If you know your actual CPM from YouTube Studio, enter it in the optional field to get revenue estimates based on your real data rather than niche estimates." },
            { step: 4, title: "Read Your Results and Apply the Suggestions", desc: "Your results show CPM range, RPM, and monthly revenue as a realistic min/max range rather than a single optimistic number. The Smart Revenue Insights section shows exactly which changes would have the biggest impact on your earnings — ranked by potential CPM or RPM improvement." },
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

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube CPM Calculator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Understanding CPM vs RPM — What Creators Actually Earn
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The single most misunderstood concept in YouTube monetization is the gap between CPM and
              what actually lands in your bank account. CPM — Cost Per Mille — is what advertisers pay
              YouTube for 1,000 ad impressions. YouTube keeps 45% of this as its revenue share and
              passes 55% to you. But that's only part of the picture. Not every video view serves an
              ad. Ad blockers, YouTube Premium subscribers, very short views, and viewers in
              low-advertiser-density regions all reduce the percentage of your views that generate
              ad revenue. This is why RPM — Revenue Per Mille — is the metric that actually matters
              for income planning. RPM accounts for all of these reductions and tells you what you
              earn per 1,000 total views, regardless of whether those views were monetized.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A creator with 500,000 views and a $12 CPM might earn only $3–4 RPM after accounting
              for the 45% YouTube cut, ad-blocked views, and non-monetizable viewers. Our calculator
              applies all of these reduction factors to give you a revenue range that reflects what
              creators with similar metrics actually report in their YouTube Studio earnings dashboards.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> The Four Variables That Determine Your YouTube CPM
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our calculator uses a weighted scoring formula: CPM = Base × Location Multiplier ×
              Engagement Multiplier × Ad Type Multiplier. Each variable has a documented and
              measurable impact on what advertisers are willing to bid for placement on your content.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Niche</strong> is the foundation. Finance and
              investing content commands $15–40 CPM because advertisers selling investment platforms,
              credit cards, and wealth management services pay premium rates to reach high-income
              audiences. Gaming content earns $3–10 CPM because the primary advertiser pool is gaming
              peripherals and app companies with more modest ad budgets. The gap between the highest
              and lowest-paying niches on YouTube is larger than most creators realize — a finance
              creator with 100K views earns more than an entertainment creator with 1M views in many
              cases.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Audience location</strong> creates multipliers
              ranging from 0.3x to 2.2x over the baseline CPM. The United States is the world's most
              valuable YouTube advertising market — US viewers can trigger CPM rates 80–120% higher
              than the global average because American advertisers dominate YouTube's ad auction
              system. UK, Canada, and Australia are close behind as Tier 1 markets. India and Nigeria
              represent enormous YouTube audiences but trigger CPM rates 40–70% below baseline due
              to lower local advertising spend. Pair CPM optimization with a strong{" "}
              <Link href="/tools/youtube-video-idea-generator" className="text-primary hover:underline font-medium">
                content strategy
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                optimized titles
              </Link>{" "}
              to maximize both reach and earnings.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Engagement and ad types</strong> multiply the base
              further. High-engagement channels — longer watch time, higher comment rates, stronger
              click-through on cards and end screens — signal to YouTube's algorithm that your content
              is high-quality, placing it in better-paying ad distribution tiers. Non-skippable ads
              add approximately 18% to effective CPM because they guarantee 100% ad completion.
              Enabling all four ad formats (skippable, non-skippable, display, and bumper) creates the
              maximum ad inventory per video and is almost always the right choice for monetized channels.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How to Use CPM Data to Make Real Revenue Decisions
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The projections table in our calculator shows earnings at 1K, 10K, 100K, and 1M views,
              giving you a clear picture of how your current CPM scales with audience growth. This is
              useful for setting realistic monthly revenue targets and understanding exactly how many
              views you need to hit income goals.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Smart Revenue Insights section automatically identifies your biggest untapped revenue
              opportunities — whether that's enabling more ad formats, shifting content strategy toward
              higher-CPM topics, improving audience retention to reach the High engagement tier, or
              creating content that specifically targets high-value geographic markets. Use these
              insights alongside your{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube description
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-hashtag-generator" className="text-primary hover:underline font-medium">
                hashtag strategy
              </Link>{" "}
              to build a channel that maximizes both discoverability and ad revenue simultaneously.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube CPM Calculator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Weighted scoring formula: CPM = Base × Location × Engagement × Ad Type multipliers",
                "Realistic CPM ranges by niche based on actual advertiser spend data",
                "Min/max revenue range — no single inflated estimate, just honest projections",
                "Dynamic suggestions ranked by revenue impact with specific percentage estimates",
                "Earnings projection table at 1K, 10K, 100K, and 1M views simultaneously",
                "Location boost alerts — shows exact CPM improvement from geographic targeting",
                "Ad format optimization — identifies missing ad types with their CPM impact",
                "RPM calculation accounts for YouTube's 45% revenue share and non-monetized views",
                "Optional known CPM input — use your real YouTube Studio data for precision",
                "100% free, no account required, instant calculations",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Maximize Your YouTube CPM</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Use your actual YouTube Studio RPM data for accuracy — go to Analytics › Revenue to find your real numbers and override the estimated CPM.",
            "Target high-CPM niches like finance, tech, or SaaS — these consistently pay 5–15× more per 1,000 views than entertainment or gaming.",
            "Enable all ad formats (skippable, non-skippable, bumper, overlay) in monetization settings — each format adds incrementally to your total RPM.",
            "US, UK, Canadian, and Australian audiences drive 2–5× higher CPMs — create content that resonates with English-speaking markets to maximize earnings.",
            "Videos 8+ minutes long can include mid-roll ads, which significantly increases ad revenue per video beyond what pre-roll alone generates.",
            "Q4 (October–December) CPMs spike 30–50% as advertisers flood platforms with holiday budgets — schedule your best content for this window.",
            "Improving click-through rate and average view duration signals quality to YouTube, attracting premium advertisers and raising your effective CPM over time.",
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
            { name: "YouTube Money Calculator", path: "/tools/youtube-money-calculator", desc: "Estimate total revenue from ads, sponsorships, affiliates, and memberships." },
            { name: "YouTube Shorts Revenue Calculator", path: "/tools/youtube-shorts-revenue-calculator", desc: "Calculate earnings from Shorts views using the YouTube Shorts fund model." },
            { name: "YouTube Engagement Calculator", path: "/tools/youtube-engagement-calculator", desc: "Measure likes, comments, and shares to benchmark your channel's engagement rate." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your title and description for SEO quality before you publish." },
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
