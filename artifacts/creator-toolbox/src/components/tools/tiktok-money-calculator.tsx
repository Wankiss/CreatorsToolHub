import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign, ChevronDown, Sparkles, Loader2, TrendingUp, Zap,
  Shield, ListChecks, Search, Gift, Star, BarChart2, ArrowUpRight,
  Users, Eye, Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche = "finance" | "tech" | "fitness" | "lifestyle" | "beauty" | "food" | "travel" | "gaming" | "education" | "entertainment";
type LiveFreq = "never" | "rare" | "weekly" | "multiple";
type PostFreq = 1 | 2 | 3 | 4 | 5 | 7 | 14;

interface EarningsResult {
  creatorRewardsMin: number;
  creatorRewardsMax: number;
  brandDealsMin: number;
  brandDealsMax: number;
  liveGiftsMin: number;
  liveGiftsMax: number;
  totalMin: number;
  totalMax: number;
  monthlyViews: number;
  engagementRate: number;
  cpmMin: number;
  cpmMax: number;
  tier: "beginner" | "intermediate" | "advanced";
  monetizationScore: number;
  growthProjection: { doubleViews: [number, number]; doublePosts: [number, number] };
  recommendations: string[];
  nicheRateLevel: string;
  assumptions: string[];
}

// ─── Niche Config ─────────────────────────────────────────────────────────────

const NICHE_CONFIG: Record<Niche, {
  label: string; emoji: string; rateLevel: string;
  cpmMin: number; cpmMax: number;
  brandMultiplier: number; nicheDesc: string;
}> = {
  finance:       { label: "Finance",       emoji: "💰", rateLevel: "Very High ($$$$$)", cpmMin: 0.60, cpmMax: 1.00, brandMultiplier: 1.8, nicheDesc: "Finance and investing content commands the highest CPMs and brand deal rates on TikTok." },
  tech:          { label: "Tech / AI",     emoji: "🤖", rateLevel: "High ($$$$)",       cpmMin: 0.50, cpmMax: 0.90, brandMultiplier: 1.6, nicheDesc: "Tech and AI content attracts premium brand deals from SaaS, hardware, and software companies." },
  fitness:       { label: "Fitness",       emoji: "💪", rateLevel: "Medium ($$$)",      cpmMin: 0.30, cpmMax: 0.70, brandMultiplier: 1.3, nicheDesc: "Fitness content earns well from supplement, apparel, and health product sponsorships." },
  education:     { label: "Education",     emoji: "📚", rateLevel: "High ($$$$)",       cpmMin: 0.40, cpmMax: 0.80, brandMultiplier: 1.5, nicheDesc: "Educational content gets higher CPMs from TikTok's algorithm and attracts course/tool sponsorships." },
  lifestyle:     { label: "Lifestyle",     emoji: "✨", rateLevel: "Medium ($$$)",      cpmMin: 0.25, cpmMax: 0.60, brandMultiplier: 1.2, nicheDesc: "Lifestyle content has broad appeal but lower advertiser bids; volume and brand deals drive income." },
  beauty:        { label: "Beauty",        emoji: "💄", rateLevel: "Medium-High",       cpmMin: 0.30, cpmMax: 0.70, brandMultiplier: 1.4, nicheDesc: "Beauty content earns well from product sponsorships, affiliate deals, and brand collaborations." },
  food:          { label: "Food",          emoji: "🍕", rateLevel: "Medium ($$$)",      cpmMin: 0.20, cpmMax: 0.55, brandMultiplier: 1.1, nicheDesc: "Food content has wide reach but moderate CPMs; restaurant and product deals are common." },
  travel:        { label: "Travel",        emoji: "✈️", rateLevel: "Medium ($$$)",      cpmMin: 0.25, cpmMax: 0.60, brandMultiplier: 1.2, nicheDesc: "Travel content earns from tourism brands, hotels, and booking platforms." },
  gaming:        { label: "Gaming",        emoji: "🎮", rateLevel: "Medium ($$$)",      cpmMin: 0.20, cpmMax: 0.50, brandMultiplier: 1.1, nicheDesc: "Gaming earns from hardware, game sponsorships, and affiliate deals; volume is key." },
  entertainment: { label: "Entertainment", emoji: "🎬", rateLevel: "Lower ($$)",        cpmMin: 0.15, cpmMax: 0.40, brandMultiplier: 0.9, nicheDesc: "Entertainment reaches the widest audience but commands lower CPMs and fewer direct brand deals." },
};

// ─── Calculation Engine ───────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + Math.round(n).toLocaleString();
}

function fmtRange(min: number, max: number): string {
  return `${fmtCurrency(min)} – ${fmtCurrency(max)}`;
}

function calcEngagementRate(likes: number, comments: number, shares: number, views: number): number {
  if (views === 0) return 0;
  return ((likes + comments + shares) / views) * 100;
}

function calcEarnings(
  followers: number,
  avgViews: number,
  engagementRateInput: number | null,
  likes: number,
  comments: number,
  shares: number,
  niche: Niche,
  postsPerWeek: number,
  liveFreq: LiveFreq,
): EarningsResult {
  const nc = NICHE_CONFIG[niche];
  const postsPerMonth = postsPerWeek * 4.33;
  const monthlyViews = avgViews * postsPerMonth;

  // Engagement rate
  let engagementRate = engagementRateInput ?? 0;
  if (!engagementRateInput && (likes || comments || shares) && avgViews > 0) {
    engagementRate = calcEngagementRate(likes, comments, shares, avgViews);
  }
  if (!engagementRate) {
    // Estimate based on follower count
    if (followers < 10_000)       engagementRate = 8;
    else if (followers < 100_000) engagementRate = 5;
    else if (followers < 1_000_000) engagementRate = 3;
    else                           engagementRate = 1.5;
  }

  // Engagement multiplier
  const engMult = engagementRate >= 8 ? 1.3 : engagementRate >= 5 ? 1.15 : engagementRate >= 3 ? 1.0 : 0.85;

  // ── Creator Rewards ──────────────────────────────────────────
  const cpmMin = nc.cpmMin * engMult;
  const cpmMax = nc.cpmMax * engMult;
  const creatorRewardsMin = Math.round((monthlyViews / 1000) * cpmMin * 0.2);
  const creatorRewardsMax = Math.round((monthlyViews / 1000) * cpmMax);

  // ── Brand Deals ──────────────────────────────────────────────
  // Per-follower rate: $0.01–$0.05 × niche multiplier
  const baseRateMin = 0.01 * nc.brandMultiplier;
  const baseRateMax = 0.05 * nc.brandMultiplier;

  // Deals per month: scale with size
  let dealsPerMonthMin = 0.5;
  let dealsPerMonthMax = 1;
  if (followers >= 10_000)    { dealsPerMonthMin = 1; dealsPerMonthMax = 2; }
  if (followers >= 100_000)   { dealsPerMonthMin = 2; dealsPerMonthMax = 4; }
  if (followers >= 1_000_000) { dealsPerMonthMin = 3; dealsPerMonthMax = 6; }

  const singleDealMin = followers * baseRateMin * engMult;
  const singleDealMax = followers * baseRateMax * engMult;

  // Cap single deal by view-based rate: $10–$50 per 10K views
  const viewBasedMin = (avgViews / 10_000) * 10;
  const viewBasedMax = (avgViews / 10_000) * 50;

  const dealMin = Math.max(singleDealMin, viewBasedMin);
  const dealMax = Math.max(singleDealMax, viewBasedMax);

  const brandDealsMin = Math.round(dealMin * dealsPerMonthMin);
  const brandDealsMax = Math.round(dealMax * dealsPerMonthMax);

  // ── LIVE Gifts ───────────────────────────────────────────────
  const liveMultiplier: Record<LiveFreq, [number, number]> = {
    never:    [0, 0],
    rare:     [20, 100],
    weekly:   [50, 250],
    multiple: [150, 600],
  };
  const [liveGiftsMin, liveGiftsMax] = liveMultiplier[liveFreq].map(
    v => Math.round(v * (followers / 10_000) * engMult * 0.5 + v)
  ) as [number, number];

  // ── Totals ───────────────────────────────────────────────────
  const totalMin = creatorRewardsMin + brandDealsMin + liveGiftsMin;
  const totalMax = creatorRewardsMax + brandDealsMax + liveGiftsMax;

  // ── Tier ────────────────────────────────────────────────────
  const tier: EarningsResult["tier"] =
    totalMax >= 5000 ? "advanced" : totalMax >= 500 ? "intermediate" : "beginner";

  // ── Monetization Score (0–100) ───────────────────────────────
  let monetizationScore = 50;
  if (engagementRate >= 5) monetizationScore += 15;
  if (followers >= 100_000) monetizationScore += 15;
  if (postsPerWeek >= 5) monetizationScore += 10;
  if (liveFreq !== "never") monetizationScore += 10;
  if (["finance", "tech", "education"].includes(niche)) monetizationScore += 10;
  monetizationScore = Math.min(monetizationScore, 100);

  // ── Growth Projections ───────────────────────────────────────
  const doubleViews: [number, number] = [Math.round(totalMin * 1.7), Math.round(totalMax * 1.7)];
  const doublePosts: [number, number] = [Math.round(totalMin * 1.4), Math.round(totalMax * 1.4)];

  // ── Recommendations ──────────────────────────────────────────
  const recommendations: string[] = [];
  if (engagementRate < 5)
    recommendations.push("Improve engagement by ending every video with a direct question — higher engagement unlocks better brand deal rates and higher CPMs from TikTok.");
  if (postsPerWeek < 4)
    recommendations.push("Increase your posting frequency to at least 4 videos per week — more content means more monthly views, which directly scales your Creator Rewards.");
  if (liveFreq === "never")
    recommendations.push("Start going LIVE at least once per week — LIVE gifts from engaged followers can add $50–$500+ per session with no extra production work.");
  if (!["finance", "tech", "education"].includes(niche))
    recommendations.push(`Consider adding ${niche === "entertainment" ? "educational or finance-adjacent" : "high-CPM"} content to your mix — ${nc.nicheDesc}`);
  if (followers >= 10_000)
    recommendations.push("Reach out proactively to brands in your niche — at your follower count, inbound brand deals become more likely, but outbound pitching still generates 3–5× more opportunities.");
  recommendations.push("Build an email list or direct community outside TikTok — this increases your leverage in brand deal negotiations and protects your income from algorithm changes.");
  if (followers < 10_000)
    recommendations.push("Focus on reaching 10K followers first — this unlocks TikTok's Creator Marketplace, where brands actively search for creators to sponsor.");

  // ── Assumptions ──────────────────────────────────────────────
  const assumptions = [
    `CPM range used: $${cpmMin.toFixed(2)}–$${cpmMax.toFixed(2)} per 1,000 views (niche: ${nc.label}, engagement-adjusted)`,
    `Monthly posts: ${Math.round(postsPerMonth)} (${postsPerWeek}x/week × 4.33 weeks)`,
    `Monthly views: ${Math.round(monthlyViews).toLocaleString()} (${avgViews.toLocaleString()} avg × ${Math.round(postsPerMonth)} posts)`,
    `Engagement rate: ${engagementRate.toFixed(1)}% (${engagementRateInput ? "provided" : "estimated from follower count"})`,
    `Brand deal rate: $${(baseRateMin).toFixed(3)}–$${(baseRateMax).toFixed(3)} per follower (niche-adjusted)`,
    `Estimated brand deals per month: ${dealsPerMonthMin}–${dealsPerMonthMax}`,
    `LIVE gift estimate scaled by audience size and streaming frequency`,
    `Audience assumed to be primarily US/UK/AU (higher CPM regions). International-heavy audiences may see 20–50% lower figures.`,
  ];

  return {
    creatorRewardsMin, creatorRewardsMax,
    brandDealsMin, brandDealsMax,
    liveGiftsMin, liveGiftsMax,
    totalMin, totalMax,
    monthlyViews: Math.round(monthlyViews),
    engagementRate,
    cpmMin, cpmMax,
    tier,
    monetizationScore,
    growthProjection: { doubleViews, doublePosts },
    recommendations,
    nicheRateLevel: nc.rateLevel,
    assumptions,
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How much do TikTok creators make per 1,000 views?",
    a: "TikTok's Creator Rewards Program pays creators approximately $0.20–$1.00 per 1,000 views in 2026, depending on content quality, audience location, niche, and video length. High-CPM niches like finance, tech, and education earn closer to $0.60–$1.00 per 1,000 views, while entertainment and lifestyle content typically earns $0.15–$0.40 per 1,000 views. However, Creator Rewards are just one income stream — brand deals and LIVE gifts typically generate 5–10× more revenue for creators with engaged audiences.",
  },
  {
    q: "How do TikTok creators actually make money?",
    a: "TikTok creators earn through three primary streams: (1) Creator Rewards — direct payments from TikTok based on views, watch time, and engagement (requires 10K followers and 100K views in 30 days to qualify); (2) Brand Deals and Sponsorships — payments from companies to feature their product or service in a video, which represent 70–90% of total income for most creators; (3) LIVE Gifts — virtual gifts sent by viewers during LIVE streams, which TikTok converts to real money. Additional income comes from affiliate marketing, merchandise, and selling digital products or services.",
  },
  {
    q: "How many TikTok followers do you need to make money?",
    a: "You can technically start earning on TikTok with as few as 1,000 followers through affiliate marketing and small brand deals, but meaningful income typically starts at: 10,000 followers (Creator Rewards Program eligibility + small brand deals, $50–$500/month), 50,000–100,000 followers (consistent brand partnerships, $500–$2,500/month), 500,000–1,000,000 followers (major brand deals + stable Creator Rewards, $2,000–$20,000/month), 1,000,000+ followers (premium brand deals + multiple revenue streams, $5,000–$50,000+/month).",
  },
  {
    q: "How much do TikTok brand deals pay?",
    a: "TikTok brand deals typically pay $0.01–$0.05 per follower per post for creators in standard niches, though high-CPM niches like finance and tech can earn $0.05–$0.10+ per follower. In practice, this means: 10K followers = $100–$500 per sponsored post, 100K followers = $500–$5,000 per post, 1M followers = $5,000–$50,000 per post. View-based rates are also common: $10–$50 per 10,000 average views. Engagement rate significantly affects brand deal rates — a creator with 100K followers and 8% engagement will earn significantly more than one with 100K followers and 1% engagement.",
  },
  {
    q: "What is the TikTok Creator Rewards Program?",
    a: "The TikTok Creator Rewards Program (formerly Creator Fund) is TikTok's direct payment program for creators. To qualify in 2026, you need: 10,000+ followers, 100,000+ video views in the last 30 days, 18+ years old, and account in a supported country. The payout rate is $0.20–$1.00 per 1,000 views, adjusted for content quality, watch time, originality, and audience location. Creators in finance, education, and tech typically earn higher per-view rates because their content attracts higher-value advertiser placements.",
  },
  {
    q: "How much can you earn from TikTok LIVE gifts?",
    a: "TikTok LIVE gifts are virtual gifts purchased by viewers with TikTok Coins and sent during LIVE streams. Creators receive approximately 50% of the gift value in real money after TikTok's commission. Earnings from LIVE gifts range widely: small creators (5K–50K followers) typically earn $20–$150 per LIVE session, mid-size creators (50K–500K) earn $50–$500 per session, and large creators (500K+) can earn $500–$5,000+ per session. The key factors are engagement level, streaming frequency, and how actively the creator interacts with viewers during the LIVE.",
  },
  {
    q: "Which TikTok niche earns the most money?",
    a: "Finance and investing content earns the highest CPMs ($0.60–$1.00/1K views) and commands the most expensive brand deals on TikTok. The full niche ranking from highest to lowest earnings potential is: Finance > Tech/AI > Education > Beauty > Fitness > Lifestyle > Travel > Food > Gaming > Entertainment. High-earning niches share common traits: high-value audiences (professionals, investors, high-income individuals), advertisers willing to pay premium rates to reach those audiences, and content that encourages saving/sharing behavior.",
  },
  {
    q: "Is the TikTok money calculator accurate?",
    a: "This calculator provides realistic estimated ranges based on industry benchmarks for TikTok Creator Rewards CPMs, brand deal market rates, and LIVE gift earnings. Actual earnings vary significantly based on audience location, content quality, posting consistency, engagement rate, and the specific brands you work with. The calculator uses conservative estimates and always returns ranges rather than single figures — real TikTok income is highly variable. Use these numbers as a planning baseline, not a guaranteed income projection. Always verify current rates directly with TikTok and brands you're working with.",
  },
  {
    q: "How do I increase my TikTok earnings?",
    a: "The five most effective ways to increase TikTok earnings are: (1) Improve engagement rate — end every video with a direct question, as engagement above 5% significantly increases brand deal rates; (2) Post more consistently — 5–7 videos per week maximizes monthly views and Creator Rewards; (3) Go LIVE regularly — even weekly LIVE sessions add $50–$500+ per month with no production cost; (4) Pitch brands directly — don't wait for inbound deals, proactive outreach generates 3–5× more sponsorship revenue; (5) Diversify income streams — add affiliate links, a newsletter, or a digital product to reduce dependence on a single revenue source.",
  },
  {
    q: "How does TikTok engagement rate affect earnings?",
    a: "Engagement rate is one of the most important factors in TikTok monetization. High engagement (5%+) increases earnings in two key ways: (1) Creator Rewards — TikTok's algorithm distributes videos with higher engagement more broadly, increasing total monthly views and therefore Creator Rewards payouts; (2) Brand deals — brands calculate value-per-dollar using engagement rate, not just follower count. A creator with 100K followers and 8% engagement can charge 2–3× more per sponsored post than a creator with the same audience but 2% engagement. Engagement rate is calculated as: (Likes + Comments + Shares) ÷ Views × 100.",
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

// ─── Result Display ───────────────────────────────────────────────────────────

function EarningBar({ label, icon: Icon, min, max, color, pct }: {
  label: string; icon: React.ElementType;
  min: number; max: number; color: string; pct: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold text-foreground">{fmtRange(min, max)}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color.replace("text-", "bg-")}`} style={{ width: `${Math.max(pct, 4)}%` }} />
      </div>
    </div>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const cls = score >= 80 ? "text-green-600 dark:text-green-400" : score >= 60 ? "text-primary" : "text-yellow-600 dark:text-yellow-400";
  const bgCls = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-primary" : "bg-yellow-500";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
          <circle
            cx="40" cy="40" r="34"
            stroke="currentColor" strokeWidth="8" fill="none"
            className={bgCls.replace("bg-", "text-")}
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold ${cls}`}>{score}</span>
          <span className="text-[9px] text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      <span className={`text-xs font-bold uppercase tracking-wide ${cls}`}>{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "finance",       label: "Finance",       emoji: "💰" },
  { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
  { value: "fitness",       label: "Fitness",       emoji: "💪" },
  { value: "beauty",        label: "Beauty",        emoji: "💄" },
  { value: "education",     label: "Education",     emoji: "📚" },
  { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
  { value: "food",          label: "Food",          emoji: "🍕" },
  { value: "travel",        label: "Travel",        emoji: "✈️" },
  { value: "gaming",        label: "Gaming",        emoji: "🎮" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
];

const LIVE_OPTIONS: { value: LiveFreq; label: string }[] = [
  { value: "never",    label: "Never" },
  { value: "rare",     label: "Rarely (1–2×/month)" },
  { value: "weekly",   label: "Weekly" },
  { value: "multiple", label: "Multiple/week" },
];

const POST_OPTIONS: { value: PostFreq; label: string }[] = [
  { value: 1,  label: "1×/week" },
  { value: 2,  label: "2×/week" },
  { value: 3,  label: "3×/week" },
  { value: 4,  label: "4×/week" },
  { value: 5,  label: "5×/week" },
  { value: 7,  label: "Daily" },
  { value: 14, label: "2×/day" },
];

const TIER_LABELS = {
  beginner:     { label: "Beginner Creator",     color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" },
  intermediate: { label: "Intermediate Creator", color: "text-primary",                          bg: "bg-primary/5 border-primary/20" },
  advanced:     { label: "Advanced Creator",      color: "text-green-600 dark:text-green-400",   bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
};

function parseNum(v: string): number {
  const clean = v.replace(/[^0-9.]/g, "");
  return parseFloat(clean) || 0;
}

export function TikTokMoneyCalculatorTool() {
  const [followers, setFollowers] = useState("");
  const [avgViews, setAvgViews] = useState("");
  const [engRate, setEngRate] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [niche, setNiche] = useState<Niche>("lifestyle");
  const [postsPerWeek, setPostsPerWeek] = useState<PostFreq>(3);
  const [liveFreq, setLiveFreq] = useState<LiveFreq>("never");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [result, setResult] = useState<EarningsResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "breakdown" | "growth" | "tips">("overview");

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tt-money-calc";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCalculate = useCallback(() => {
    const f = parseNum(followers);
    const v = parseNum(avgViews);
    if (!f || f < 100) { toast({ title: "Enter your follower count", variant: "destructive" }); return; }
    if (!v || v < 10)  { toast({ title: "Enter average views per video", variant: "destructive" }); return; }

    setIsCalculating(true);
    setTimeout(() => {
      const res = calcEarnings(
        f, v,
        engRate ? parseNum(engRate) : null,
        parseNum(likes), parseNum(comments), parseNum(shares),
        niche, postsPerWeek, liveFreq,
      );
      setResult(res);
      setIsCalculating(false);
      setActiveTab("overview");
      setTimeout(() => document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 480);
  }, [followers, avgViews, engRate, likes, comments, shares, niche, postsPerWeek, liveFreq, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleCalculate(); };

  const tierCfg = result ? TIER_LABELS[result.tier] : null;
  const maxEarning = result ? result.totalMax : 1;
  const barPcts = result ? {
    cr: (result.creatorRewardsMax / maxEarning) * 100,
    bd: (result.brandDealsMax    / maxEarning) * 100,
    lg: (result.liveGiftsMax     / maxEarning) * 100,
  } : { cr: 0, bd: 0, lg: 0 };

  return (
    <>
      {/* ── Input Card ──────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Core stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" /> Total Followers <span className="text-red-500">*</span>
                </label>
                <Input value={followers} onChange={e => setFollowers(e.target.value)} placeholder="e.g. 50000" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" /> Avg Views per Video <span className="text-red-500">*</span>
                </label>
                <Input value={avgViews} onChange={e => setAvgViews(e.target.value)} placeholder="e.g. 25000" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Niche <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(({ value, label, emoji }) => (
                  <button
                    key={value} type="button" onClick={() => setNiche(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                      niche === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span>{emoji}</span>{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts per week */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Posting Frequency</label>
              <div className="flex flex-wrap gap-2">
                {POST_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value} type="button" onClick={() => setPostsPerWeek(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      postsPerWeek === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE freq */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">LIVE Streaming Frequency</label>
              <div className="flex flex-wrap gap-2">
                {LIVE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value} type="button" onClick={() => setLiveFreq(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      liveFreq === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                {showAdvanced ? "Hide" : "Show"} Advanced Inputs (Engagement, Likes, Comments, Shares)
              </button>
              {showAdvanced && (
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Engagement Rate (%)</label>
                    <Input value={engRate} onChange={e => setEngRate(e.target.value)} placeholder="e.g. 5.2 (auto-calculated if blank)" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Avg Likes / Comments / Shares</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input value={likes}    onChange={e => setLikes(e.target.value)}    placeholder="Likes"    className="h-12 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                      <Input value={comments} onChange={e => setComments(e.target.value)} placeholder="Comments" className="h-12 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                      <Input value={shares}   onChange={e => setShares(e.target.value)}   placeholder="Shares"   className="h-12 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" disabled={isCalculating} className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              {isCalculating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Calculating...</>
                : <><DollarSign className="w-5 h-5" /> Calculate My TikTok Earnings</>}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────── */}
      {result && tierCfg && (
        <section id="results-section" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Hero earnings card */}
          <div className={`rounded-2xl border p-6 ${tierCfg.bg}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Estimated Monthly Earnings</p>
                <p className={`text-4xl font-black ${tierCfg.color}`}>
                  {fmtRange(result.totalMin, result.totalMax)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className={`font-bold ${tierCfg.color}`}>{tierCfg.label}</span>
                  {" · "}{result.monthlyViews.toLocaleString()} monthly views
                  {" · "}{result.engagementRate.toFixed(1)}% engagement
                </p>
              </div>
              <ScoreMeter score={result.monetizationScore} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {(["overview", "breakdown", "growth", "tips"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase tracking-wide ${
                  activeTab === tab ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {{ overview: "💰 Overview", breakdown: "📊 Breakdown", growth: "📈 Growth", tips: "🚀 Tips" }[tab]}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <h3 className="font-bold text-foreground flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" /> Earnings by Source</h3>
                <EarningBar label="Brand Deals / Sponsorships"  icon={Star}       min={result.brandDealsMin}    max={result.brandDealsMax}    color="text-primary"                                          pct={barPcts.bd} />
                <EarningBar label="Creator Rewards (TikTok Pay)" icon={DollarSign} min={result.creatorRewardsMin} max={result.creatorRewardsMax} color="text-blue-500 dark:text-blue-400"                    pct={barPcts.cr} />
                <EarningBar label="LIVE Gifts"                   icon={Gift}       min={result.liveGiftsMin}     max={result.liveGiftsMax}     color="text-orange-500 dark:text-orange-400"                pct={barPcts.lg} />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "Niche",             value: NICHE_CONFIG[niche].label,         sub: NICHE_CONFIG[niche].rateLevel, icon: TrendingUp },
                  { label: "Monthly Views",     value: result.monthlyViews.toLocaleString(), sub: `${postsPerWeek}×/wk posting`, icon: Eye },
                  { label: "CPM Range",         value: `$${result.cpmMin.toFixed(2)}–$${result.cpmMax.toFixed(2)}`, sub: "per 1,000 views", icon: BarChart2 },
                ].map(({ label, value, sub, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center">
                    <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">{label}</p>
                    <p className="font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown tab */}
          {activeTab === "breakdown" && (
            <div className="space-y-4">
              {[
                {
                  icon: Star, title: "Brand Deals / Sponsorships", range: fmtRange(result.brandDealsMin, result.brandDealsMax),
                  color: "border-primary/30 bg-primary/5",
                  body: `Brand deals are your largest income opportunity. At your follower count, you can realistically earn ${fmtRange(result.brandDealsMin, result.brandDealsMax)} per month from sponsored content. Rate: $${(parseNum(followers) * 0.01 * NICHE_CONFIG[niche].brandMultiplier).toFixed(0)}–$${(parseNum(followers) * 0.05 * NICHE_CONFIG[niche].brandMultiplier).toFixed(0)} per post. Brand deals represent 70–90% of total TikTok income for most mid-to-large creators.`,
                },
                {
                  icon: DollarSign, title: "Creator Rewards (TikTok Direct Pay)", range: fmtRange(result.creatorRewardsMin, result.creatorRewardsMax),
                  color: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10",
                  body: `Based on your ${result.monthlyViews.toLocaleString()} monthly views and a CPM of $${result.cpmMin.toFixed(2)}–$${result.cpmMax.toFixed(2)} (${NICHE_CONFIG[niche].label} niche, engagement-adjusted). Creator Rewards require 10K+ followers and 100K+ views in 30 days to qualify. This is a stable but smaller income stream compared to brand deals.`,
                },
                {
                  icon: Gift, title: "LIVE Gifts", range: fmtRange(result.liveGiftsMin, result.liveGiftsMax),
                  color: "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10",
                  body: liveFreq === "never"
                    ? "You selected 'Never' for LIVE streaming. Adding even 1–2 LIVE sessions per week could add $50–$500+/month with no extra production cost. Viewers who are already fans are most likely to send gifts."
                    : `Estimated based on ${liveFreq} LIVE sessions and your audience size. Creators receive approximately 50% of gift value after TikTok's commission. Engagement rate directly affects gifting behavior — more interactive LIVEs generate more gifts.`,
                },
              ].map(({ icon: Icon, title, range, color, body }) => (
                <div key={title} className={`rounded-2xl border p-5 ${color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-foreground opacity-70" />
                      <h3 className="font-bold text-foreground text-sm">{title}</h3>
                    </div>
                    <span className="text-sm font-black text-foreground">{range}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}

              {/* Assumptions */}
              <div className="rounded-2xl border border-border bg-muted/40 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">📋 Assumptions Used</p>
                <ul className="space-y-1">
                  {result.assumptions.map((a, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary mt-0.5">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Growth tab */}
          {activeTab === "growth" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "If your views double",
                    emoji: "👁️",
                    range: fmtRange(result.growthProjection.doubleViews[0], result.growthProjection.doubleViews[1]),
                    desc: `Doubling your average views per video (to ${(parseNum(avgViews) * 2).toLocaleString()}/video) could increase your monthly earnings by approximately 70%, primarily through higher Creator Rewards and increased brand deal leverage.`,
                    color: "border-primary/30 bg-primary/5",
                  },
                  {
                    title: "If you double your posting",
                    emoji: "📅",
                    range: fmtRange(result.growthProjection.doublePosts[0], result.growthProjection.doublePosts[1]),
                    desc: `Posting ${postsPerWeek * 2}× per week instead of ${postsPerWeek}× would approximately double your monthly view count, increasing Creator Rewards proportionally and improving your negotiating position for brand deals.`,
                    color: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10",
                  },
                ].map(({ title, emoji, range, desc, color }) => (
                  <div key={title} className={`rounded-2xl border p-5 ${color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{emoji}</span>
                      <h3 className="font-bold text-foreground text-sm">{title}</h3>
                    </div>
                    <p className="text-2xl font-black text-foreground mb-2">{range}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-primary" /> Milestone Projections
                </h3>
                <div className="space-y-3">
                  {[
                    { milestone: "100K Followers",  est: "$500–$3,000/month",  tip: "Unlock TikTok Creator Marketplace — brands begin finding you inbound." },
                    { milestone: "500K Followers",  est: "$2,500–$15,000/month", tip: "Major brand deal territory. Consistent sponsorships become reliable income." },
                    { milestone: "1M Followers",    est: "$5,000–$50,000/month", tip: "Premium brand deals, creator programs, and multiple revenue streams at scale." },
                  ].map(({ milestone, est, tip }) => (
                    <div key={milestone} className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground">{milestone}</span>
                          <span className="text-sm font-bold text-primary">{est}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tips tab */}
          {activeTab === "tips" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Personalized recommendations based on your profile:</p>
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                  <div className="w-7 h-7 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Money Calculator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Core Stats", desc: "Input your total follower count and average views per video. These two numbers drive the calculation — followers determine brand deal potential and views determine Creator Rewards. If unsure of average views, check your TikTok Analytics for the past 30 days." },
            { step: 2, title: "Select Your Niche and Frequency", desc: "Choose your content niche — this affects your CPM, brand deal rates, and overall earning potential. Finance and Tech niches earn significantly more than Entertainment. Set your weekly posting frequency and LIVE streaming habits to get an accurate monthly view estimate." },
            { step: 3, title: "Add Optional Engagement Data", desc: "Open the Advanced Inputs to add your actual engagement rate or your average likes, comments, and shares per video. The calculator uses this to fine-tune your earnings estimate — high engagement (5%+) meaningfully increases brand deal rates and Creator Rewards CPMs." },
            { step: 4, title: "Analyze Results and Act", desc: "Review the earnings breakdown across all three income streams. Use the Growth tab to see what doubling views or posts would mean for income. Check the Tips tab for personalized recommendations ranked by impact on your specific profile." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Money Calculator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How TikTok Earnings Are Calculated
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This TikTok Money Calculator estimates monthly earnings across three income streams using
              industry benchmarks updated for 2026. Creator Rewards are calculated by multiplying your
              monthly views (average views × posts per month) by a niche-adjusted CPM rate of $0.15–$1.00
              per 1,000 views. Finance and tech content earns at the higher end of this range due to
              higher-value advertisers, while entertainment content sits at the lower end. Brand deal
              estimates use a per-follower rate of $0.01–$0.05 adjusted by niche multiplier, cross-referenced
              with a view-based rate of $10–$50 per 10,000 average views — whichever is higher. LIVE gift
              estimates are scaled by audience size and streaming frequency. All three streams are adjusted
              by an engagement multiplier: high engagement (8%+) increases estimates by 30%, while low
              engagement (below 3%) reduces them by 15%. Every output is presented as a min–max range
              rather than a single figure to reflect the genuine variability in TikTok creator income.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Understanding TikTok Monetization in 2026
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              TikTok monetization in 2026 is dominated by brand deals, which represent 70–90% of total
              income for most successful creators. The Creator Rewards Program provides stable but smaller
              direct payouts — valuable for predictable baseline income but rarely sufficient as a sole
              revenue stream. LIVE gifts add meaningful supplementary income for creators who stream
              consistently. The most important factor separating high-earning creators from average ones
              is not follower count — it's engagement rate and niche authority. A finance creator with
              50,000 followers and 7% engagement will consistently out-earn a lifestyle creator with
              300,000 followers and 1.5% engagement, both in Creator Rewards CPMs and brand deal rates.
              This calculator reflects that reality by weighting engagement as a core variable across all
              three income streams, giving you a realistic picture of your actual earning potential rather
              than a vanity metric based purely on follower count. Use the niche profitability index and
              monetization score to identify where your specific account has the most room to grow.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This TikTok Earnings Calculator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Three-stream earnings model: Creator Rewards, Brand Deals, and LIVE Gifts",
                "Niche-adjusted CPM rates for 10 content categories (Finance to Entertainment)",
                "Engagement rate adjustment — high engagement increases all earnings estimates",
                "Per-follower AND view-based brand deal calculation (uses whichever is higher)",
                "Monetization score (0–100) rating how well you're currently monetizing your audience",
                "Creator tier classification: Beginner, Intermediate, or Advanced",
                "Growth projections: earnings impact of doubling views or posting frequency",
                "Milestone projections at 100K, 500K, and 1M followers",
                "Personalized recommendations ranked by impact on your specific profile",
                "Conservative, realistic ranges — no inflated promises or misleading estimates",
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
            { name: "TikTok Viral Idea Generator", path: "/tools/tiktok-viral-idea-generator", desc: "Get trending content concepts that drive the high view counts needed to maximize your TikTok earnings." },
            { name: "TikTok Script Generator", path: "/tools/tiktok-script-generator", desc: "Write structured video scripts that maximize watch time and completion rate — the core metrics for TikTok revenue." },
            { name: "TikTok Hook Generator", path: "/tools/tiktok-hook-generator", desc: "Craft opening lines that stop the scroll and keep viewers watching, directly boosting your monetization potential." },
            { name: "TikTok Hashtag Generator", path: "/tools/tiktok-hashtag-generator", desc: "Find the right hashtags to expand your audience reach and attract the brand partnerships that supplement ad revenue." },
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
