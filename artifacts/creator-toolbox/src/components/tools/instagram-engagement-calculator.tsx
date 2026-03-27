import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ChevronDown, Check, BarChart2, TrendingUp, Shield,
  ListChecks, Search, Zap, Heart, MessageCircle,
  Bookmark, Star, Target, DollarSign, ArrowUp, ArrowDown,
  Minus, Users, ToggleLeft, ToggleRight, ArrowUpRight,
} from "lucide-react";

const YEAR = new Date().getFullYear();

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "beauty" | "business" | "tech"
  | "education" | "entertainment" | "lifestyle"
  | "food" | "travel" | "finance";

type ContentType = "reels" | "carousels" | "mixed";

type PerformanceLabel =
  | "Poor" | "Below Average" | "Average" | "Good" | "Excellent" | "Elite";

interface FollowerTier {
  label: string;
  poor: number;
  avg: [number, number];
  good: [number, number];
  excellent: number;
}

interface EngagementResult {
  // Scores
  weightedScore: number;
  engagementRate: number;
  basicRate: number;
  likeRate: number;
  commentRate: number;
  saveRate: number;

  // Rating
  performanceLabel: PerformanceLabel;
  performanceColor: string;
  performanceBg: string;
  topPct: string;

  // Benchmark
  tierLabel: string;
  benchmarkAvgLow: number;
  benchmarkAvgHigh: number;
  benchmarkGoodLow: number;
  benchmarkGoodHigh: number;
  benchmarkExcellent: number;
  vsAverage: number;
  nicheAdjNote: string;

  // Brand deal
  brandAppeal: "Low" | "Moderate" | "Strong" | "Premium";
  sponsorshipMin: number;
  sponsorshipMax: number;
  erMultiplier: number;

  // Insights
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  whatItMeans: { heading: string; body: string }[];
}

// ─── Niche Config ─────────────────────────────────────────────────────────────

const NICHE_CONFIG: Record<Niche, {
  label: string; emoji: string; benchmarkAdj: number; cpmMin: number; cpmMax: number;
}> = {
  fitness:       { label: "Fitness",       emoji: "💪", benchmarkAdj:  0.10, cpmMin: 10, cpmMax: 18 },
  beauty:        { label: "Beauty",        emoji: "💄", benchmarkAdj:  0.05, cpmMin: 9,  cpmMax: 16 },
  business:      { label: "Business",      emoji: "💼", benchmarkAdj: -0.10, cpmMin: 12, cpmMax: 20 },
  tech:          { label: "Tech / AI",     emoji: "🤖", benchmarkAdj: -0.15, cpmMin: 11, cpmMax: 19 },
  education:     { label: "Education",     emoji: "📚", benchmarkAdj: -0.05, cpmMin: 10, cpmMax: 17 },
  entertainment: { label: "Entertainment", emoji: "🎬", benchmarkAdj:  0.15, cpmMin: 6,  cpmMax: 12 },
  lifestyle:     { label: "Lifestyle",     emoji: "✨", benchmarkAdj:  0.00, cpmMin: 7,  cpmMax: 13 },
  food:          { label: "Food",          emoji: "🍕", benchmarkAdj:  0.05, cpmMin: 6,  cpmMax: 12 },
  travel:        { label: "Travel",        emoji: "✈️", benchmarkAdj:  0.00, cpmMin: 8,  cpmMax: 14 },
  finance:       { label: "Finance",       emoji: "💰", benchmarkAdj: -0.10, cpmMin: 13, cpmMax: 22 },
};

// ─── Follower Tier Benchmarks ─────────────────────────────────────────────────

function getFollowerTier(followers: number): FollowerTier {
  if (followers <= 5_000)   return { label: "Nano (1K–5K)",      poor: 2.0, avg: [3.0, 5.0], good: [6.0, 9.0], excellent: 10.0 };
  if (followers <= 20_000)  return { label: "Micro (5K–20K)",     poor: 1.5, avg: [2.0, 4.0], good: [5.0, 7.0], excellent: 8.0 };
  if (followers <= 100_000) return { label: "Mid-Tier (20K–100K)",poor: 1.0, avg: [1.5, 3.0], good: [3.5, 5.0], excellent: 6.0 };
  return                           { label: "Macro (100K+)",      poor: 0.8, avg: [1.0, 2.5], good: [3.0, 4.0], excellent: 5.0 };
}

// ─── Calculation Engine ────────────────────────────────────────────────────────

function computeEngagement(
  followers: number,
  likes: number,
  comments: number,
  saves: number,
  niche: Niche,
  contentType: ContentType,
  useWeighted: boolean,
): EngagementResult {
  const nc = NICHE_CONFIG[niche];
  const tier = getFollowerTier(followers);

  // ── Rates ──────────────────────────────────────────────────
  const likeRate    = (likes    / followers) * 100;
  const commentRate = (comments / followers) * 100;
  const saveRate    = (saves    / followers) * 100;

  // Weighted engagement score (per spec: comments×2, saves×3)
  const weightedScore  = likes + comments * 2 + saves * 3;
  const engagementRate = useWeighted
    ? (weightedScore / followers) * 100
    : likeRate;
  const basicRate = likeRate;

  // ── Niche-adjusted benchmarks ──────────────────────────────
  const adj = nc.benchmarkAdj;
  const adjAvgLow     = parseFloat((tier.avg[0]     * (1 + adj)).toFixed(2));
  const adjAvgHigh    = parseFloat((tier.avg[1]     * (1 + adj)).toFixed(2));
  const adjGoodLow    = parseFloat((tier.good[0]    * (1 + adj)).toFixed(2));
  const adjGoodHigh   = parseFloat((tier.good[1]    * (1 + adj)).toFixed(2));
  const adjExcellent  = parseFloat((tier.excellent  * (1 + adj)).toFixed(2));

  const contentTypeNote: Record<ContentType, string> = {
    reels:     "Reels generate higher reach but naturally lower ER per follower — your score is still highly competitive.",
    carousels: "Carousels drive the highest save rate of any Instagram format — this inflates your weighted ER positively.",
    mixed:     "Mixed content provides a balanced ER — Reels drive reach while carousels drive saves.",
  };

  // ── Performance label ──────────────────────────────────────
  let performanceLabel: PerformanceLabel;
  let performanceColor: string;
  let performanceBg: string;
  let topPct: string;

  if (engagementRate < tier.poor) {
    performanceLabel = "Poor"; topPct = "Bottom 30%";
    performanceColor = "text-red-600 dark:text-red-400";
    performanceBg    = "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  } else if (engagementRate < adjAvgLow) {
    performanceLabel = "Below Average"; topPct = "Bottom 40%";
    performanceColor = "text-orange-600 dark:text-orange-400";
    performanceBg    = "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
  } else if (engagementRate < adjAvgHigh) {
    performanceLabel = "Average"; topPct = "Middle 40%";
    performanceColor = "text-yellow-600 dark:text-yellow-400";
    performanceBg    = "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
  } else if (engagementRate < adjGoodHigh) {
    performanceLabel = "Good"; topPct = "Top 30%";
    performanceColor = "text-blue-600 dark:text-blue-400";
    performanceBg    = "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  } else if (engagementRate < adjExcellent) {
    performanceLabel = "Excellent"; topPct = "Top 20%";
    performanceColor = "text-green-600 dark:text-green-400";
    performanceBg    = "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
  } else {
    performanceLabel = "Elite"; topPct = "Top 10%";
    performanceColor = "text-purple-600 dark:text-purple-400";
    performanceBg    = "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
  }

  // ── Brand deal potential ───────────────────────────────────
  let brandAppeal: EngagementResult["brandAppeal"];
  let erMultiplier: number;

  if (engagementRate >= 6)      { brandAppeal = "Premium";  erMultiplier = 1.8; }
  else if (engagementRate >= 3) { brandAppeal = "Strong";   erMultiplier = 1.4; }
  else if (engagementRate >= 1) { brandAppeal = "Moderate"; erMultiplier = 1.0; }
  else                          { brandAppeal = "Low";      erMultiplier = 0.6; }

  const reach = followers * 0.30;
  const sponsorshipMin = Math.round((reach / 1000) * nc.cpmMin * erMultiplier);
  const sponsorshipMax = Math.round((reach / 1000) * nc.cpmMax * erMultiplier);

  // ── vs average ─────────────────────────────────────────────
  const midAvg    = (adjAvgLow + adjAvgHigh) / 2;
  const vsAverage = parseFloat((engagementRate - midAvg).toFixed(2));

  const nicheAdjNote = adj > 0
    ? `${nc.label} content typically earns ${Math.round(adj * 100)}% higher engagement than general benchmarks due to its highly invested audience.`
    : adj < 0
    ? `${nc.label} content typically earns ${Math.round(Math.abs(adj) * 100)}% lower engagement than general benchmarks — audiences in this niche tend to be more passive consumers.`
    : `${nc.label} content aligns with general Instagram engagement benchmarks.`;

  // ── Strengths ──────────────────────────────────────────────
  const strengths: string[] = [];
  if (saveRate >= 2)    strengths.push(`Strong save rate (${saveRate.toFixed(2)}%) — saves are Instagram's most powerful algorithm signal, pushing your content to new audiences.`);
  if (commentRate >= 1) strengths.push(`Healthy comment rate (${commentRate.toFixed(2)}%) — your content is actively sparking conversation, a signal Instagram prioritizes heavily.`);
  if (likeRate >= 4)    strengths.push(`High like rate (${likeRate.toFixed(2)}%) — your content is clearly resonating with your audience on an emotional level.`);
  if (engagementRate >= adjGoodLow)
    strengths.push(`Your overall engagement rate (${engagementRate.toFixed(2)}%) outperforms the ${nc.label} niche average of ${adjAvgLow}–${adjAvgHigh}%.`);
  if (contentType === "carousels")
    strengths.push("Carousel-heavy strategy is optimized — carousels generate the highest save rates of any Instagram format.");
  if (strengths.length === 0)
    strengths.push("You have an established base — the foundation for improving engagement is in place.");

  // ── Weaknesses ─────────────────────────────────────────────
  const weaknesses: string[] = [];
  if (saveRate < 0.5)   weaknesses.push(`Save rate is low (${saveRate.toFixed(2)}%) — saves are the #1 signal for Explore and Reels reach. Creating carousel posts with actionable takeaways dramatically increases saves.`);
  if (commentRate < 0.3) weaknesses.push(`Comment rate is very low (${commentRate.toFixed(2)}%) — your content isn't triggering conversation. Ending every post/caption with a direct, specific question can double your comment rate.`);
  if (likeRate < 2)     weaknesses.push(`Like rate is below average (${likeRate.toFixed(2)}%) — your content may not be delivering enough emotional impact. Rethink your hooks and visual storytelling.`);
  if (engagementRate < adjAvgLow)
    weaknesses.push(`Your engagement rate (${engagementRate.toFixed(2)}%) is below the ${nc.label} average of ${adjAvgLow}–${adjAvgHigh}% for the ${tier.label} tier.`);
  if (weaknesses.length === 0)
    weaknesses.push("Metrics are solid — focus on scaling what's already working.");

  // ── Improvements ───────────────────────────────────────────
  const improvements: string[] = [
    `Add a "Save this for later" prompt to every educational carousel — creators who add explicit save CTAs see 2–4× higher save rates.`,
    `End every caption with a direct question tied to the content (not 'what do you think?' — instead 'Which of these 3 strategies are you trying first?').`,
    `Reply to every comment within the first 60 minutes of posting — Instagram's algorithm rewards comment velocity and increases distribution to non-followers.`,
    `Post Reels as a carousel companion — publish the same content as both a Reel and a carousel within 24 hours to maximize both reach and saves.`,
    `A/B test your hooks — the first line of your caption is your hook. Strong hooks increase both comment and save rates because they pull readers into the full post.`,
    `Collaborate with creators in adjacent niches — collab posts reach both audiences and typically achieve 40–80% higher engagement on the first 24 hours.`,
  ];

  // ── What It Means ──────────────────────────────────────────
  const whatItMeans: { heading: string; body: string }[] = [
    {
      heading: "Content Quality Signal",
      body: engagementRate >= adjGoodLow
        ? `Your ${engagementRate.toFixed(2)}% engagement rate tells Instagram's algorithm that your content is high-quality and worth distributing beyond your existing followers. This is the primary mechanism that earns you organic reach on the Explore page and Reels tab — both critical for growth.`
        : `Your engagement rate suggests your content is not yet signaling "high quality" to Instagram's algorithm. This limits how broadly your posts are distributed, making it harder to reach new followers through Explore and Reels recommendations.`,
    },
    {
      heading: "Audience Trust and Connection",
      body: saveRate >= 1
        ? `A ${saveRate.toFixed(2)}% save rate indicates your audience genuinely values your content enough to reference it later — a strong trust signal. This is the most credible form of engagement because it's intentional, not passive.`
        : `A low save rate (${saveRate.toFixed(2)}%) suggests your content is being consumed but not deeply valued. Focus on creating content that is educational, actionable, or emotionally resonant enough that followers want to save it for reference.`,
    },
    {
      heading: "Growth and Monetization Potential",
      body: `With your current engagement rate, your estimated Explore and Reels reach multiplier is ${erMultiplier}× — meaning for every 100 followers who see your content, the algorithm distributes it to an estimated ${Math.round(100 * erMultiplier)} non-followers. ${brandAppeal === "Premium" || brandAppeal === "Strong" ? "Your engagement level puts you in the top tier for brand sponsorship pricing, as brands increasingly pay for quality engagement rather than raw follower count." : "Improving your engagement rate to 3%+ would significantly increase your brand deal rates and organic follower growth velocity."}`,
    },
  ];

  return {
    weightedScore, engagementRate, basicRate, likeRate, commentRate, saveRate,
    performanceLabel, performanceColor, performanceBg, topPct,
    tierLabel: tier.label,
    benchmarkAvgLow: adjAvgLow, benchmarkAvgHigh: adjAvgHigh,
    benchmarkGoodLow: adjGoodLow, benchmarkGoodHigh: adjGoodHigh,
    benchmarkExcellent: adjExcellent,
    vsAverage,
    nicheAdjNote,
    brandAppeal, sponsorshipMin, sponsorshipMax, erMultiplier,
    strengths, weaknesses, improvements, whatItMeans,
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is Instagram engagement rate and how is it calculated?",
    a: "Instagram engagement rate is the percentage of followers who actively interact with your content through likes, comments, or saves. The standard formula is: Engagement Rate (%) = (Likes + Comments + Saves) / Followers × 100. However, this tool uses a weighted formula that reflects the actual value each interaction type carries for the Instagram algorithm: Weighted Engagement Rate = (Likes + Comments×2 + Saves×3) / Followers × 100. Comments are weighted 2× because they require significantly more intent than a like. Saves are weighted 3× because they are Instagram's strongest algorithm signal — saves tell Instagram your content is valuable enough for a user to want to reference again, which triggers broader Explore and Reels distribution.",
  },
  {
    q: `What is a good Instagram engagement rate in ${YEAR}?`,
    a: "A good Instagram engagement rate varies significantly by account size. For nano accounts (1K–5K followers): under 2% is poor, 3–5% is average, 6–9% is good, and 10%+ is excellent. For micro accounts (5K–20K followers): under 1.5% is poor, 2–4% is average, 5–7% is good, and 8%+ is excellent. For mid-tier accounts (20K–100K followers): under 1% is poor, 1.5–3% is average, 3.5–5% is good, and 6%+ is excellent. For macro accounts (100K+): under 0.8% is poor, 1–2.5% is average, 3–4% is good, and 5%+ is excellent. Always compare your rate against accounts in your specific niche and follower tier — engagement benchmarks drop naturally as audience size grows.",
  },
  {
    q: "Why do saves matter more than likes for Instagram engagement?",
    a: `Saves are Instagram's strongest engagement signal because they represent the highest level of user intent. When a user saves your post, they are telling Instagram they found it valuable enough to retrieve later — a much more deliberate action than a passive like or scroll-past. Instagram's algorithm uses saves as a primary quality signal for Explore page distribution and Reels reach. In ${YEAR}, posts with high save rates are distributed to 2–5× more non-followers than posts with equivalent likes but few saves. Strategically, carousel posts with educational or actionable content — step-by-step guides, lists, how-to tutorials — generate the highest save rates of any Instagram format.`,
  },
  {
    q: "How does engagement rate affect Instagram brand deal rates?",
    a: "Engagement rate directly multiplies your sponsored post pricing. Brands and agencies calculate value using engagement, not just follower count — a creator with 30K followers and 6% engagement can charge more than one with 100K followers and 0.8% engagement. The industry pricing benchmark is: Low engagement (<1%) = 0.6× base rate; Moderate (1–3%) = 1.0× base rate; Strong (3–6%) = 1.4× base rate; Premium (6%+) = 1.8× base rate. The base rate is derived from your estimated Reels reach (roughly 30% of followers) multiplied by a CPM ranging from $5–$25 depending on niche. Finance and business creators earn the highest CPMs ($12–$22), while entertainment creators earn lower rates ($6–$12) due to less-targeted advertiser demand.",
  },
  {
    q: "What is the difference between weighted and basic Instagram engagement rate?",
    a: "Basic engagement rate counts all interactions equally: (Likes + Comments + Saves) / Followers × 100. Weighted engagement rate assigns different values to each interaction type based on the intent they signal: Likes (1×) are passive, single-tap reactions; Comments (2×) require deliberate effort and indicate real audience connection; Saves (3×) represent the highest intent — a user returning to or referencing the content later. The weighted formula produces a more accurate picture of your true audience quality and algorithm standing. A creator with 1,000 likes, 50 comments, and 30 saves has a basic engagement of (1,000+50+30)/followers but a weighted engagement of (1,000+100+90)/followers — significantly higher due to the high-value comment and save activity.",
  },
  {
    q: "How does content type affect Instagram engagement rate?",
    a: "Content type significantly impacts engagement rate: Carousel posts generate the highest engagement rates because they hold attention across multiple slides, drive the highest save rates of any format, and Instagram boosts them in re-recommendations to followers who didn't engage the first time. Reels generate the widest reach and highest view counts but often produce lower engagement rates as a percentage of total reach — because Reels are shown to many non-followers who have less emotional investment. Stories have the lowest engagement rate by follower count but are most effective for driving direct messages and maintaining connection with existing followers. For maximizing weighted engagement rate, a carousel-first strategy is optimal; for maximizing total reach and follower growth, Reels are most effective.",
  },
  {
    q: "Why is my Instagram engagement rate dropping?",
    a: "Instagram engagement rate drops for several common reasons: (1) Audience growth outpacing content quality — as you gain more followers, some will be less engaged, diluting your rate; (2) Posting frequency changes — posting more often can reduce per-post engagement if your content quality doesn't scale; (3) Algorithm changes — Instagram periodically adjusts how it distributes content, affecting organic reach; (4) Content type shift — moving from carousels to Reels often produces a temporary engagement rate drop because Reels reach more non-followers who engage less; (5) Missing saves — if your content is not generating saves, Instagram gradually reduces its distribution priority. Fix drops by auditing your last 20 posts for save rate, adding explicit save CTAs to educational content, and ensuring your captions include engagement-prompting questions.",
  },
  {
    q: "How do I increase my Instagram comment rate?",
    a: "To meaningfully increase your Instagram comment rate: (1) Ask a specific, opinion-inviting question at the end of every caption — 'Which of these approaches have you tried?' generates more responses than 'What do you think?'; (2) Reply to every comment within the first hour of posting — comment velocity in the first 60 minutes signals to Instagram that your content is generating conversation, triggering broader distribution; (3) Pin a comment on your own post immediately after publishing to seed engagement and set the conversational tone; (4) Create content that takes a clear position or makes a specific claim — content that people agree or disagree with generates significantly more comments than neutral content; (5) Use Instagram's 'Add Yours' sticker in Stories to drive comment-equivalent engagement.",
  },
  {
    q: "How many followers do you need for good Instagram engagement rates?",
    a: "Engagement rate benchmarks decrease as follower count increases — this is a universal Instagram dynamic. Nano creators (1K–5K followers) with tight, niche audiences regularly see 6–15% engagement rates because their followers are early adopters with high personal investment. Micro influencers (5K–50K) typically see 3–8%. Mid-tier creators (50K–200K) average 2–4%. Large accounts (200K+) often see 1–3%, and mega accounts (1M+) frequently operate at 0.5–1.5%. This means a nano creator with 5,000 followers and 8% engagement is performing exceptionally well — even though their raw interaction numbers (400 interactions per post) are far less than a large creator. Brands increasingly understand this and pay nano and micro influencers premium rates relative to their audience size.",
  },
  {
    q: "Is this Instagram engagement calculator free?",
    a: "Yes — the Instagram Engagement Calculator on creatorsToolHub is completely free with no account, subscription, or credit card required. Enter your followers, average likes, comments, and saves, and instantly get your weighted engagement rate, a performance label (Poor to Elite), a benchmark comparison against your follower tier and niche, a brand deal potential estimate with suggested pricing, strengths and weaknesses analysis, and 6 specific improvement recommendations. Toggle between Weighted mode (uses saves×3, comments×2) and Basic mode (standard unweighted calculation) to see how Instagram's algorithm weighs your interactions.",
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
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
        aria-expanded={open}>
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

// ─── Benchmark Bar ─────────────────────────────────────────────────────────────

function BenchmarkBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-bold tabular-nums text-foreground">{value.toFixed(2)}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
    </div>
  );
}

// ─── Brand Readiness Badge ─────────────────────────────────────────────────────

const BRAND_APPEAL_CONFIG = {
  Low:      { color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20 border-red-200",    icon: "⚠️" },
  Moderate: { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200", icon: "📊" },
  Strong:   { color: "text-blue-600 dark:text-blue-400",  bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200",  icon: "✅" },
  Premium:  { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200", icon: "⭐" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(/,/g, ""));
  return isNaN(n) || n < 0 ? null : n;
}

function fmtCurrency(n: number): string {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return "$" + Math.round(n).toLocaleString();
}

const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "fitness",       label: "Fitness",       emoji: "💪" },
  { value: "beauty",        label: "Beauty",        emoji: "💄" },
  { value: "business",      label: "Business",      emoji: "💼" },
  { value: "finance",       label: "Finance",       emoji: "💰" },
  { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
  { value: "education",     label: "Education",     emoji: "📚" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
  { value: "food",          label: "Food",          emoji: "🍕" },
  { value: "travel",        label: "Travel",        emoji: "✈️" },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export function InstagramEngagementCalculatorTool() {
  const [followers,  setFollowers]  = useState("");
  const [likes,      setLikes]      = useState("");
  const [comments,   setComments]   = useState("");
  const [saves,      setSaves]      = useState("");
  const [niche,      setNiche]      = useState<Niche>("lifestyle");
  const [contentType,setContentType]= useState<ContentType>("mixed");
  const [useWeighted,setUseWeighted]= useState(true);
  const [error,      setError]      = useState("");
  const [result,     setResult]     = useState<EngagementResult | null>(null);
  const [activeTab,  setActiveTab]  = useState<"overview" | "benchmark" | "brand" | "improve">("overview");

  useEffect(() => {
    const id = "faq-schema-ig-engagement-calc";
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
    const f  = parseNum(followers);
    const l  = parseNum(likes);
    const c  = parseNum(comments);
    const s  = parseNum(saves);
    if (!f || f < 100) { setError("Enter a valid follower count (minimum 100)."); return; }
    if (l === null)    { setError("Enter a valid average likes value."); return; }
    if (c === null)    { setError("Enter a valid average comments value."); return; }
    if (s === null)    { setError("Enter a valid average saves value (enter 0 if unknown)."); return; }
    const res = computeEngagement(f, l, c, s, niche, contentType, useWeighted);
    setResult(res);
    setActiveTab("overview");
    setTimeout(() => document.getElementById("ig-engagement-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  return (
    <>
      {/* ── Input Card ─────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleCalculate} className="space-y-5">

            {/* Followers */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" /> Followers <span className="text-red-500">*</span>
              </label>
              <Input value={followers} onChange={e => setFollowers(e.target.value)}
                placeholder="e.g. 25000" inputMode="numeric"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
            </div>

            {/* Likes / Comments / Saves */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-500" /> Avg Likes <span className="text-red-500">*</span>
                </label>
                <Input value={likes} onChange={e => setLikes(e.target.value)}
                  placeholder="e.g. 800" inputMode="numeric"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-blue-500" /> Avg Comments <span className="text-red-500">*</span>
                </label>
                <Input value={comments} onChange={e => setComments(e.target.value)}
                  placeholder="e.g. 45" inputMode="numeric"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-yellow-500" /> Avg Saves <span className="text-red-500">*</span>
                </label>
                <Input value={saves} onChange={e => setSaves(e.target.value)}
                  placeholder="e.g. 120" inputMode="numeric"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                <p className="text-xs text-muted-foreground">Enter 0 if you don't track saves.</p>
              </div>
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Niche</label>
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

            {/* Content Type + Mode toggle */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Type</label>
                <div className="flex gap-2">
                  {([
                    { value: "reels" as ContentType,    label: "Reels",     emoji: "🎬" },
                    { value: "carousels" as ContentType, label: "Carousels", emoji: "📸" },
                    { value: "mixed" as ContentType,    label: "Mixed",     emoji: "🔀" },
                  ] as const).map(({ value, label, emoji }) => (
                    <button key={value} type="button" onClick={() => setContentType(value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1 ${
                        contentType === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      <span>{emoji}</span>{label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Calculation Mode</label>
                <button type="button" onClick={() => setUseWeighted(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/40 hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-2.5">
                    {useWeighted
                      ? <ToggleRight className="w-5 h-5 text-primary" />
                      : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">{useWeighted ? "Weighted Mode" : "Basic Mode"}</p>
                      <p className="text-xs text-muted-foreground">{useWeighted ? "Saves×3, Comments×2 (recommended)" : "Standard unweighted formula"}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${useWeighted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {useWeighted ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                <span>⚠️</span>{error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              <BarChart2 className="w-5 h-5" /> Calculate My Engagement Rate
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {result && (
        <section id="ig-engagement-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["overview", "benchmark", "brand", "improve"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border uppercase tracking-wide transition-all ${
                  activeTab === tab ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                }`}>
                {{ overview: "📊 Overview", benchmark: "📈 Benchmark", brand: "💰 Brand Value", improve: "🚀 Improve" }[tab]}
              </button>
            ))}
          </div>

          {/* ── Overview ──────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Main score card */}
              <Card className={`p-6 rounded-2xl border-2 ${result.performanceBg}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                      {useWeighted ? "Weighted" : "Basic"} Engagement Rate
                    </p>
                    <p className={`text-5xl font-black ${result.performanceColor}`}>
                      {result.engagementRate.toFixed(2)}%
                    </p>
                    {useWeighted && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Weighted score: <span className="font-bold text-foreground">{result.weightedScore.toLocaleString()} interactions</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`flex flex-col items-center px-5 py-3 rounded-2xl border-2 ${result.performanceBg}`}>
                      <span className={`text-2xl font-black ${result.performanceColor}`}>{result.performanceLabel}</span>
                      <span className="text-xs font-bold text-muted-foreground mt-0.5">{result.topPct}</span>
                      <span className="text-xs text-muted-foreground">{result.tierLabel}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      {result.vsAverage >= 0
                        ? <ArrowUp className="w-5 h-5 text-green-500" />
                        : <ArrowDown className="w-5 h-5 text-red-500" />}
                      <span className={`text-sm font-bold ${result.vsAverage >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {result.vsAverage >= 0 ? "+" : ""}{result.vsAverage}%
                      </span>
                      <span className="text-xs text-muted-foreground text-center">vs niche avg</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Metric breakdown */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: <Heart className="w-4 h-4 text-pink-500" />, label: "Like Rate", value: result.likeRate, weight: useWeighted ? "1×" : null, color: "border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/20" },
                  { icon: <MessageCircle className="w-4 h-4 text-blue-500" />, label: "Comment Rate", value: result.commentRate, weight: useWeighted ? "2×" : null, color: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20" },
                  { icon: <Bookmark className="w-4 h-4 text-yellow-500" />, label: "Save Rate", value: result.saveRate, weight: useWeighted ? "3×" : null, color: "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20" },
                ].map(({ icon, label, value, weight, color }) => (
                  <div key={label} className={`rounded-2xl border p-4 ${color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {icon}
                      <span className="text-sm font-bold text-foreground">{label}</span>
                      {weight && <span className="ml-auto text-xs font-bold bg-white/60 dark:bg-black/30 px-1.5 py-0.5 rounded-lg text-muted-foreground">{weight}</span>}
                    </div>
                    <p className="text-2xl font-black text-foreground">{value.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">per follower</p>
                  </div>
                ))}
              </div>

              {/* What it means */}
              <div className="space-y-3">
                {result.whatItMeans.map(({ heading, body }, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="font-bold text-foreground text-sm mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />{heading}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>

              {/* Strengths / Weaknesses */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5">
                  <h3 className="font-bold text-green-700 dark:text-green-400 text-sm mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-green-500 font-bold shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-5">
                  <h3 className="font-bold text-orange-700 dark:text-orange-400 text-sm mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Growth Areas
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-orange-500 font-bold shrink-0">→</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Benchmark ─────────────────────────── */}
          {activeTab === "benchmark" && (
            <div className="space-y-4">
              <Card className="p-6 rounded-2xl">
                <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> Your Performance vs {NICHES.find(n => n.value === niche)?.emoji} {NICHE_CONFIG[niche].label} Niche Benchmarks
                </h3>
                <p className="text-xs text-muted-foreground mb-5">{result.tierLabel} · {result.nicheAdjNote}</p>
                <div className="space-y-4">
                  <BenchmarkBar label="Your Engagement Rate" value={result.engagementRate} max={Math.max(result.benchmarkExcellent * 1.5, result.engagementRate * 1.2)} color="bg-primary" />
                  <div className="h-px bg-border" />
                  <BenchmarkBar label={`Average (${result.benchmarkAvgLow}–${result.benchmarkAvgHigh}%) — midpoint`} value={(result.benchmarkAvgLow + result.benchmarkAvgHigh) / 2} max={Math.max(result.benchmarkExcellent * 1.5, result.engagementRate * 1.2)} color="bg-yellow-400" />
                  <BenchmarkBar label={`Good (${result.benchmarkGoodLow}–${result.benchmarkGoodHigh}%) — midpoint`} value={(result.benchmarkGoodLow + result.benchmarkGoodHigh) / 2} max={Math.max(result.benchmarkExcellent * 1.5, result.engagementRate * 1.2)} color="bg-blue-400" />
                  <BenchmarkBar label={`Excellent (${result.benchmarkExcellent}%+)`} value={result.benchmarkExcellent} max={Math.max(result.benchmarkExcellent * 1.5, result.engagementRate * 1.2)} color="bg-green-400" />
                </div>
              </Card>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Full Benchmark Table — {result.tierLabel}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Label", "Rate Range", "Your Status"].map(h => (
                          <th key={h} className="text-left py-2 px-3 font-bold text-xs uppercase text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Poor",         range: `< ${result.benchmarkAvgLow}%`,                                      match: result.performanceLabel === "Poor" || result.performanceLabel === "Below Average" },
                        { label: "Average",      range: `${result.benchmarkAvgLow}–${result.benchmarkAvgHigh}%`,             match: result.performanceLabel === "Average" },
                        { label: "Good",         range: `${result.benchmarkGoodLow}–${result.benchmarkGoodHigh}%`,           match: result.performanceLabel === "Good" },
                        { label: "Excellent",    range: `${result.benchmarkGoodHigh}–${result.benchmarkExcellent}%`,         match: result.performanceLabel === "Excellent" },
                        { label: "Elite (Top 10%)", range: `${result.benchmarkExcellent}%+`,                                 match: result.performanceLabel === "Elite" },
                      ].map(row => (
                        <tr key={row.label} className={`border-b border-border last:border-0 ${row.match ? "bg-primary/5" : ""}`}>
                          <td className="py-3 px-3 font-semibold text-foreground">{row.label}</td>
                          <td className="py-3 px-3 text-muted-foreground font-mono">{row.range}</td>
                          <td className="py-3 px-3">
                            {row.match
                              ? <span className="flex items-center gap-1.5 text-primary font-bold text-xs"><Star className="w-3 h-3 fill-primary" /> You are here</span>
                              : <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Weighted breakdown */}
              {useWeighted && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> Weighted Score Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Likes × 1", value: parseNum(likes) ?? 0, color: "text-pink-500" },
                      { label: "Comments × 2", value: (parseNum(comments) ?? 0) * 2, color: "text-blue-500" },
                      { label: "Saves × 3", value: (parseNum(saves) ?? 0) * 3, color: "text-yellow-500" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/40 border border-border">
                        <span className="font-semibold text-foreground">{label}</span>
                        <span className={`font-bold ${color}`}>{value.toLocaleString()} pts</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30">
                      <span className="font-bold text-foreground">Total Weighted Score</span>
                      <span className="font-black text-primary">{result.weightedScore.toLocaleString()} pts</span>
                    </div>
                    <p className="text-xs text-muted-foreground px-1 pt-1">
                      ER = {result.weightedScore.toLocaleString()} ÷ {(parseNum(followers) ?? 0).toLocaleString()} followers × 100 = <strong className="text-foreground">{result.engagementRate.toFixed(2)}%</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Brand Value ────────────────────────── */}
          {activeTab === "brand" && (
            <div className="space-y-4">
              <Card className={`p-6 rounded-2xl border-2 ${BRAND_APPEAL_CONFIG[result.brandAppeal].bg}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Sponsorship Readiness</p>
                    <p className={`text-3xl font-black ${BRAND_APPEAL_CONFIG[result.brandAppeal].color}`}>
                      {BRAND_APPEAL_CONFIG[result.brandAppeal].icon} {result.brandAppeal}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Engagement multiplier: <span className="font-bold text-foreground">{result.erMultiplier}×</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Est. Price per Sponsored Post</p>
                    <p className="text-2xl font-black text-foreground">
                      {fmtCurrency(result.sponsorshipMin)} – {fmtCurrency(result.sponsorshipMax)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">based on Reels reach × niche CPM</p>
                  </div>
                </div>
              </Card>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" /> Sponsorship Price Breakdown
                </h3>
                {[
                  { label: "Estimated Reels Reach", value: `${Math.round((parseNum(followers) ?? 0) * 0.30).toLocaleString()} users` },
                  { label: "Niche CPM Range", value: `$${NICHE_CONFIG[niche].cpmMin}–$${NICHE_CONFIG[niche].cpmMax} per 1,000 reach` },
                  { label: "Engagement Multiplier", value: `${result.erMultiplier}× (${result.performanceLabel} tier)` },
                  { label: "Niche", value: `${NICHE_CONFIG[niche].emoji} ${NICHE_CONFIG[niche].label}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 border border-border text-sm">
                    <span className="font-semibold text-foreground">{label}</span>
                    <span className="text-muted-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> To Reach the Next Sponsorship Tier
                </h3>
                {[
                  { tier: "Moderate",  er: "1–3%",  mult: "1.0×", desc: "Start pitching micro-deals to small businesses in your niche — product gifting + small fees" },
                  { tier: "Strong",    er: "3–6%",  mult: "1.4×", desc: "Mid-tier brand partnerships accessible — outbound pitch to brands with $1K–$5K creator budgets" },
                  { tier: "Premium",   er: "6%+",   mult: "1.8×", desc: "Top-tier rates unlock — brands pay premium for highly engaged audiences" },
                ].map(({ tier, er, mult, desc }) => {
                  const isCurrent = result.brandAppeal === tier;
                  return (
                    <div key={tier} className={`flex gap-3 p-3.5 rounded-xl border transition-colors ${isCurrent ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg h-fit ${isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{tier}</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{er} ER → {mult} multiplier {isCurrent && <span className="text-primary text-xs font-bold ml-1">← You are here</span>}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Improve ────────────────────────────── */}
          {activeTab === "improve" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                  <Bookmark className="w-4 h-4 text-primary" /> Priority: Increase Your Save Rate
                </h3>
                <p className="text-xs text-muted-foreground">Saves are weighted 3× in the engagement formula and are Instagram's strongest Explore distribution signal. Even a 0.5% save rate improvement significantly raises your overall ER.</p>
                <ul className="space-y-2">
                  {["Create carousels with step-by-step educational content — '5 steps to X' format drives the highest save rate of any Instagram format.",
                    "Add explicit save CTAs: 'Save this post before you need it' or 'Bookmark this for your next [task]'.",
                    "Design slides that are worth referencing again — checklists, templates, comparisons, and resource lists are saved far more than opinion content.",
                    "Create a 'starter guide' carousel for your niche — these are consistently among the most-saved post formats.",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2.5 p-3 rounded-xl bg-muted/40 border border-border text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4 text-primary" /> Priority: Drive More Comments
                </h3>
                <ul className="space-y-2">
                  {["End every caption with a specific, opinion-inviting question ('Which of these 3 would you try first?') — generic CTAs generate 5× fewer comments than specific ones.",
                    "Reply to every comment within the first 60 minutes of posting — comment velocity in the first hour is one of Instagram's key distribution triggers.",
                    "Pin your own comment immediately after publishing to seed the conversation and set the engagement tone.",
                    "Take a clear position or make a specific claim in your content — content that invites agreement or disagreement generates 3× more comments than neutral content.",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2.5 p-3 rounded-xl bg-muted/40 border border-border text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Full Action Plan ({result.improvements.length} Tactics)
                </h3>
                {result.improvements.map((tip, i) => (
                  <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                    <div className="w-7 h-7 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── How to Use ────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Engagement Calculator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, icon: <Users className="w-5 h-5 text-primary" />,
              title: "Enter your followers and engagement metrics",
              desc: "Enter your total follower count, then your average likes, comments, and saves per post. Use data from your last 5–10 posts for the most accurate result. You can find these in Instagram Insights — go to any post and tap 'View Insights'." },
            { step: 2, icon: <BarChart2 className="w-5 h-5 text-primary" />,
              title: "Select your niche and content type",
              desc: "Choose your niche so the calculator applies the correct benchmark adjustments — fitness and entertainment creators naturally see higher engagement than business or tech creators. Select whether you primarily post Reels, Carousels, or Mixed content." },
            { step: 3, icon: <Target className="w-5 h-5 text-primary" />,
              title: "Choose weighted or basic mode",
              desc: "Weighted mode uses the Instagram-aligned formula (saves×3, comments×2) which reflects how Instagram's algorithm actually values interactions. Basic mode calculates standard unweighted ER — useful for comparing with other tools that use the basic formula." },
            { step: 4, icon: <TrendingUp className="w-5 h-5 text-primary" />,
              title: "Review your 4-tab results report",
              desc: "See your engagement rate, performance label, and benchmark comparison in Overview. Switch to Benchmark for a visual comparison against niche averages. Check Brand Value for your sponsorship pricing estimate. Use the Improve tab for a personalized action plan." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Engagement Calculator — Know Your True Audience Quality</h2>
        </div>
        <div className="space-y-7 text-muted-foreground leading-relaxed text-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              Why the Weighted Engagement Formula Produces More Accurate Results
            </h3>
            <p className="mb-3">
              The standard Instagram engagement rate formula — (Likes + Comments + Saves) / Followers × 100 — treats all three interaction types equally. But they are not equal. A like takes one tap and less than a second of decision time. A comment requires a viewer to stop, think, and type a response — a deliberate act of engagement that signals genuine connection with the content. A save represents the highest level of engagement intent: the viewer found your content valuable enough to deliberately store for future reference.
            </p>
            <p className="mb-3">
              This calculator uses the weighted formula: <strong className="text-foreground">(Likes × 1 + Comments × 2 + Saves × 3) / Followers × 100</strong>. The weighting reflects both user intent and algorithmic value. Instagram's internal distribution algorithm weights saves most heavily — content with high save rates is pushed more aggressively to non-followers through Explore and Reels recommendations. By calculating engagement the way Instagram's algorithm sees it, you get a more accurate picture of your account's true algorithmic standing.
            </p>
            <p>
              You can toggle between Weighted and Basic modes to see both calculations side-by-side. If you're using engagement rate for brand pitching, the Basic mode gives you the standard figure that most media kits report. If you're using it to optimize your content strategy, Weighted mode gives you the more actionable signal.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary flex-shrink-0" />
              How Follower Tier and Niche Both Affect Your Engagement Benchmark
            </h3>
            <p className="mb-3">
              A 3% engagement rate means very different things for different accounts. For a nano creator with 2,000 followers, 3% is below average — their tight, personally connected audience should generate 6–9%. For a macro creator with 500,000 followers, 3% is exceptional — well above the 1–2.5% average for their tier. This calculator applies follower-tier-specific benchmarks that reflect these real-world differences: Nano (1K–5K), Micro (5K–20K), Mid-Tier (20K–100K), and Macro (100K+) each have separate performance thresholds.
            </p>
            <p className="mb-3">
              Niche also shifts the benchmark significantly. Fitness and entertainment content naturally generates higher engagement rates — fitness audiences are highly motivated and interactive; entertainment audiences share and comment impulsively. Business and tech content generates lower average engagement because audiences in these niches tend to be more passive consumers — they save and read carefully, but comment and like less. This calculator applies niche adjustment factors (+10% to +15% for high-engagement niches, -10% to -15% for lower-engagement niches) to the benchmark thresholds so your rating reflects realistic expectations for your specific category.
            </p>
            <p>
              The combination of follower tier × niche adjustment produces the most accurate benchmark comparison available without direct access to your Instagram Analytics data. Use the Benchmark tab to see your full performance table with all tier thresholds clearly labeled so you understand exactly where your account stands and what the next performance level requires.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              How This Calculator Estimates Your Brand Sponsorship Value
            </h3>
            <p className="mb-3">
              The Brand Value section estimates your per-post sponsorship rate using the same methodology that brand agencies use internally: estimated reach (followers × 30% for Reels distribution rate) × niche CPM range ($5–$22 depending on advertiser demand in your category) × an engagement multiplier that scales with your engagement tier. Low engagement accounts (under 1% ER) earn a 0.6× multiplier on base rates; premium engagement accounts (6%+ ER) earn a 1.8× multiplier.
            </p>
            <p>
              In practice, this means that improving your engagement rate from 2% to 4% doesn't just double your engagement metrics — it increases your per-post sponsorship rate by approximately 40% (from 1.0× to 1.4× multiplier) for the same follower count. For a creator with 50,000 followers in the fitness niche, this difference is approximately $500–$800 per sponsored Reel. The Brand Value tab shows you exactly which inputs are driving your current rate and what you would need to change to reach the next sponsorship tier.
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
          <h2 className="text-2xl font-bold font-display text-foreground">What This Instagram Engagement Calculator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Weighted engagement formula (saves×3, comments×2) — matches how Instagram's algorithm actually values interactions",
            "Toggle between Weighted and Basic modes to see both calculations and compare against other tools",
            "Performance label across 6 tiers: Poor, Below Average, Average, Good, Excellent, Elite — with percentile ranking",
            "Follower-tier benchmarks: Nano (1K–5K), Micro (5K–20K), Mid-Tier (20K–100K), and Macro (100K+)",
            "10-niche adjustment factors — benchmarks are calibrated for fitness, beauty, business, tech, entertainment, and 6 more",
            "Visual benchmark bar chart comparing your ER against Average, Good, and Excellent thresholds",
            "Brand Deal Value estimate — estimated per-post sponsorship price range using reach × CPM × engagement multiplier",
            "Sponsorship tier roadmap — shows exactly what ER you need to reach Moderate, Strong, and Premium brand appeal",
            "Strengths and Growth Areas analysis — personalized to your specific like, comment, and save rates",
            "6-tactic improvement plan with prioritized, Instagram-specific recommendations for saves, comments, and likes",
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
            { tip: "Instagram benchmarks engagement at 1–3% for accounts under 100K — if your rate is below 1%, prioritize niche content over growth until engagement recovers." },
            { tip: "Saves are Instagram's most powerful engagement signal — content that earns saves gets distributed to non-followers through the Explore page algorithm." },
            { tip: "Post consistently to 3–5 formats (Feed, Reels, Stories, Carousels) — multi-format accounts see 60% higher overall engagement than single-format creators." },
            { tip: "Reply to every comment within the first hour of posting — early comment velocity signals quality to Instagram's algorithm and extends your organic reach." },
            { tip: "Carousel posts get 3× more reach than single-image posts — use carousels for educational content, before/afters, and step-by-step guides." },
            { tip: "Track your engagement rate over time, not just per post — a declining trend over 30+ posts signals a content strategy issue worth addressing proactively." },
            { tip: "Run a 'Save this' CTA test vs. 'Comment below' across 10 posts — the winner reveals what action your specific audience is most likely to take." },
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
            { name: "Instagram Money Calculator", path: "/tools/instagram-money-calculator", desc: "Estimate your Instagram earnings potential based on follower count, engagement rate, and niche category." },
            { name: "Instagram Content Planner", path: "/tools/instagram-content-planner", desc: "Plan a strategic posting schedule to maintain the consistent output that keeps engagement rates high." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Find the optimal hashtags to expand your reach — more impressions means more data for engagement analysis." },
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Write high-engagement captions with proven CTAs that drive the saves, comments, and shares that lift your rate." },
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
