import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign, ChevronDown, Sparkles, TrendingUp,
  Shield, ListChecks, Search, Star, BarChart2,
  Users, Check, Zap, Target, Gift, ShoppingBag,
  Link as LinkIcon, Calculator, ArrowUpRight,
} from "lucide-react";

const YEAR = new Date().getFullYear();

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "finance" | "business" | "tech" | "fitness" | "beauty"
  | "lifestyle" | "food" | "travel" | "education" | "entertainment";

type AudienceQuality = "premium" | "mixed" | "developing";
type Scenario = "conservative" | "realistic" | "aggressive";
type MonetizationMethod = "sponsorships" | "affiliate" | "subscriptions" | "products";

interface EarningsResult {
  sponsorshipsMin: number; sponsorshipsMax: number;
  affiliateMin: number; affiliateMax: number;
  subscriptionsMin: number; subscriptionsMax: number;
  productsMin: number; productsMax: number;
  totalMin: number; totalMax: number;
  engagementRate: number;
  monetizationScore: number;
  tier: "beginner" | "growing" | "established" | "professional";
  recommendations: string[];
  projections: ProjectionRow[];
  bestStrategy: string;
  assumptions: string[];
}

interface ProjectionRow {
  followers: number;
  monthlyMin: number;
  monthlyMax: number;
  yearlyMin: number;
  yearlyMax: number;
}

// ─── Niche Config ──────────────────────────────────────────────────────────────

const NICHE_CONFIG: Record<Niche, {
  label: string; emoji: string;
  nicheMultiplier: number; cpmMin: number; cpmMax: number; rateLevel: string;
}> = {
  finance:       { label: "Finance",       emoji: "💰", nicheMultiplier: 1.6, cpmMin: 15, cpmMax: 25, rateLevel: "Very High ($$$$$)" },
  business:      { label: "Business",      emoji: "💼", nicheMultiplier: 1.6, cpmMin: 14, cpmMax: 22, rateLevel: "Very High ($$$$$)" },
  tech:          { label: "Tech / AI",     emoji: "🤖", nicheMultiplier: 1.4, cpmMin: 12, cpmMax: 20, rateLevel: "High ($$$$)" },
  fitness:       { label: "Fitness",       emoji: "💪", nicheMultiplier: 1.3, cpmMin: 10, cpmMax: 18, rateLevel: "Medium-High ($$$+)" },
  beauty:        { label: "Beauty",        emoji: "💄", nicheMultiplier: 1.2, cpmMin: 9,  cpmMax: 16, rateLevel: "Medium ($$$)" },
  education:     { label: "Education",     emoji: "📚", nicheMultiplier: 1.4, cpmMin: 11, cpmMax: 19, rateLevel: "High ($$$$)" },
  lifestyle:     { label: "Lifestyle",     emoji: "✨", nicheMultiplier: 1.0, cpmMin: 7,  cpmMax: 13, rateLevel: "Medium ($$$)" },
  food:          { label: "Food",          emoji: "🍕", nicheMultiplier: 1.0, cpmMin: 6,  cpmMax: 12, rateLevel: "Medium ($$$)" },
  travel:        { label: "Travel",        emoji: "✈️", nicheMultiplier: 1.1, cpmMin: 8,  cpmMax: 14, rateLevel: "Medium ($$$)" },
  entertainment: { label: "Entertainment", emoji: "🎬", nicheMultiplier: 0.7, cpmMin: 5,  cpmMax: 10, rateLevel: "Lower ($$)" },
};

const AUDIENCE_MULTIPLIERS: Record<AudienceQuality, number> = {
  premium: 1.5, mixed: 1.0, developing: 0.6,
};

const SCENARIO_FACTORS: Record<Scenario, { label: string; desc: string; factor: [number, number] }> = {
  conservative: { label: "Conservative",  desc: "Cautious, worst-case planning",  factor: [0.6, 0.8] },
  realistic:    { label: "Realistic",     desc: "Average market rates",           factor: [0.9, 1.1] },
  aggressive:   { label: "Aggressive",    desc: "Optimized, best-case scenario",  factor: [1.2, 1.6] },
};

// ─── Format Helpers ───────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + Math.round(n).toLocaleString();
}

function fmtRange(min: number, max: number): string {
  return `${fmtCurrency(min)} – ${fmtCurrency(max)}`;
}

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return n.toLocaleString();
}

// ─── Calculation Engine ────────────────────────────────────────────────────────

function estimateEngagement(followers: number): number {
  if (followers < 10_000)   return 6.5;
  if (followers < 100_000)  return 4.5;
  return 3.0;
}

function calcForFollowers(
  followers: number,
  niche: Niche,
  audienceQuality: AudienceQuality,
  methods: MonetizationMethod[],
  engagementRate: number,
  postsPerWeek: number,
  productPrice: number,
  subscriptionPrice: number,
  affiliateProductPrice: number,
  affiliateCommission: number,
  scenario: Scenario,
): { min: number; max: number; byStream: Record<MonetizationMethod, [number, number]> } {
  const nc = NICHE_CONFIG[niche];
  const engMult = engagementRate >= 8 ? 1.6 : engagementRate >= 4 ? 1.3 : engagementRate >= 2 ? 1.0 : 0.7;
  const audMult = AUDIENCE_MULTIPLIERS[audienceQuality];
  const [sFactorMin, sFactorMax] = SCENARIO_FACTORS[scenario].factor;

  const postsPerMonth = postsPerWeek * 4.33;
  const byStream: Record<MonetizationMethod, [number, number]> = {
    sponsorships: [0, 0], affiliate: [0, 0], subscriptions: [0, 0], products: [0, 0],
  };

  // ── Brand Sponsorships ───────────────────────────────────────
  if (methods.includes("sponsorships")) {
    const reach = followers * 0.30;
    const priceMin = (reach / 1000) * nc.cpmMin * engMult * nc.nicheMultiplier * audMult;
    const priceMax = (reach / 1000) * nc.cpmMax * engMult * nc.nicheMultiplier * audMult;
    const dealsMin = followers < 10_000 ? 0.5 : followers < 100_000 ? 1 : followers < 500_000 ? 2 : 3;
    const dealsMax = followers < 10_000 ? 1 : followers < 100_000 ? 2 : followers < 500_000 ? 4 : 6;
    byStream.sponsorships = [
      Math.round(priceMin * dealsMin * sFactorMin),
      Math.round(priceMax * dealsMax * sFactorMax),
    ];
  }

  // ── Affiliate Marketing ──────────────────────────────────────
  if (methods.includes("affiliate")) {
    const clicks = followers * 0.02 * engMult;
    const convRateMin = 0.005;
    const convRateMax = 0.03;
    const commRate = Math.min(affiliateCommission / 100, 0.30);
    byStream.affiliate = [
      Math.round(clicks * convRateMin * affiliateProductPrice * commRate * sFactorMin),
      Math.round(clicks * convRateMax * affiliateProductPrice * commRate * sFactorMax),
    ];
  }

  // ── Instagram Subscriptions ──────────────────────────────────
  if (methods.includes("subscriptions")) {
    const subRateMin = 0.005;
    const subRateMax = 0.05 * (followers >= 50_000 ? 1.2 : 1.0);
    const subPrice = Math.max(subscriptionPrice, 0.99);
    byStream.subscriptions = [
      Math.round(followers * subRateMin * subPrice * engMult * sFactorMin),
      Math.round(followers * subRateMax * subPrice * engMult * sFactorMax),
    ];
  }

  // ── Digital / Physical Product Sales ────────────────────────
  if (methods.includes("products")) {
    const buyRateMin = 0.005;
    const buyRateMax = 0.025;
    const price = Math.max(productPrice, 1);
    byStream.products = [
      Math.round(followers * buyRateMin * price * engMult * audMult * sFactorMin),
      Math.round(followers * buyRateMax * price * engMult * audMult * sFactorMax),
    ];
  }

  const totalMin = Object.values(byStream).reduce((s, [mn]) => s + mn, 0);
  const totalMax = Object.values(byStream).reduce((s, [, mx]) => s + mx, 0);

  return { min: totalMin, max: totalMax, byStream };
}

function buildProjections(
  niche: Niche,
  audienceQuality: AudienceQuality,
  methods: MonetizationMethod[],
  postsPerWeek: number,
  productPrice: number,
  subscriptionPrice: number,
  affiliateProductPrice: number,
  affiliateCommission: number,
  scenario: Scenario,
): ProjectionRow[] {
  const milestones = [5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000];
  return milestones.map(followers => {
    const er = estimateEngagement(followers);
    const { min, max } = calcForFollowers(
      followers, niche, audienceQuality, methods, er,
      postsPerWeek, productPrice, subscriptionPrice,
      affiliateProductPrice, affiliateCommission, scenario,
    );
    return { followers, monthlyMin: min, monthlyMax: max, yearlyMin: min * 12, yearlyMax: max * 12 };
  });
}

function calcEarnings(
  followers: number,
  engagementRateInput: number | null,
  niche: Niche,
  audienceQuality: AudienceQuality,
  methods: MonetizationMethod[],
  postsPerWeek: number,
  productPrice: number,
  subscriptionPrice: number,
  affiliateProductPrice: number,
  affiliateCommission: number,
  scenario: Scenario,
): EarningsResult {
  const engagementRate = engagementRateInput ?? estimateEngagement(followers);
  const nc = NICHE_CONFIG[niche];

  const { min: totalMin, max: totalMax, byStream } = calcForFollowers(
    followers, niche, audienceQuality, methods, engagementRate,
    postsPerWeek, productPrice, subscriptionPrice,
    affiliateProductPrice, affiliateCommission, scenario,
  );

  const tier: EarningsResult["tier"] =
    totalMax >= 10_000 ? "professional"
    : totalMax >= 2_000 ? "established"
    : totalMax >= 300   ? "growing"
    : "beginner";

  let monetizationScore = 40;
  if (engagementRate >= 4)                            monetizationScore += 15;
  if (followers >= 50_000)                            monetizationScore += 12;
  if (postsPerWeek >= 4)                              monetizationScore += 10;
  if (methods.length >= 3)                            monetizationScore += 10;
  if (audienceQuality === "premium")                  monetizationScore += 10;
  if (["finance", "business", "tech"].includes(niche)) monetizationScore += 8;
  if (methods.includes("products"))                   monetizationScore += 5;
  monetizationScore = Math.min(monetizationScore, 100);

  const recommendations: string[] = [];
  if (engagementRate < 3)
    recommendations.push("Improve engagement by ending every Reel with a direct question or call-to-action, higher engagement unlocks better sponsorship rates and affiliate clicks.");
  if (postsPerWeek < 3)
    recommendations.push("Post at least 3–5 times per week, more content means more sponsored post slots and more affiliate link exposures per month.");
  if (!methods.includes("sponsorships") && followers >= 10_000)
    recommendations.push("You're eligible for brand sponsorships, start pitching to brands in your niche directly. At your follower count, a single post can earn $200–$2,000.");
  if (!methods.includes("affiliate") && followers >= 5_000)
    recommendations.push("Add affiliate marketing, even 1–2 affiliate links in your bio or Stories can generate passive income from your existing audience with zero extra work.");
  if (!methods.includes("products") && followers >= 25_000)
    recommendations.push("Consider creating a digital product (e-book, preset, template, mini-course), product sales let you earn directly from your audience without relying on brand budgets or outreach.");
  if (!methods.includes("subscriptions") && followers >= 50_000)
    recommendations.push("Launch Instagram Subscriptions, exclusive content at $2.99–$9.99/month provides predictable recurring revenue, even at 0.5% subscriber conversion.");
  if (audienceQuality !== "premium")
    recommendations.push("Create content that appeals to US, UK, or Canadian audiences, premium audience locations increase sponsorship CPMs by up to 150%.");
  if (followers < 10_000)
    recommendations.push("Focus on reaching 10K followers, this is the threshold where brand deals, affiliate traffic, and algorithm distribution improve significantly.");
  recommendations.push("Build an email list or community outside Instagram to diversify revenue and gain leverage in brand deal negotiations.");

  const projections = buildProjections(
    niche, audienceQuality, methods, postsPerWeek,
    productPrice, subscriptionPrice, affiliateProductPrice, affiliateCommission, scenario,
  );

  const bestStrategy =
    followers < 10_000
      ? "Focus on Affiliate Marketing + rapid content growth. With under 10K followers, affiliate links in bio and Reels descriptions generate income with no minimum audience requirement. Pair this with consistent Reels to grow toward the 10K brand deal threshold."
      : followers < 50_000
      ? "Combine Brand Sponsorships + Affiliate Marketing. You're in the micro-influencer sweet spot, brands pay premium rates for your engagement levels. Add affiliate links to every sponsored post to earn a second revenue stream from the same content."
      : followers < 200_000
      ? "Prioritize Brand Sponsorships + Digital Products. At this tier, a well-positioned digital product (e-book, course, templates) can generate $1,000–$5,000/month from a single launch, while sponsorships provide consistent monthly income."
      : "Scale with Brand Deals + Subscriptions + Products. Your audience size justifies launching Instagram Subscriptions for recurring income. Combine with premium brand deals and a high-ticket product to build a diversified, resilient income model.";

  const engMult = engagementRate >= 8 ? 1.6 : engagementRate >= 4 ? 1.3 : engagementRate >= 2 ? 1.0 : 0.7;
  const audMult = AUDIENCE_MULTIPLIERS[audienceQuality];

  const assumptions = [
    `Sponsorship CPM range: $${nc.cpmMin}–$${nc.cpmMax} per 1,000 reach (${nc.rateLevel})`,
    `Instagram Reels reach estimated at 30% of followers per post`,
    `Niche value multiplier: ${nc.nicheMultiplier}× (${nc.label})`,
    `Audience quality multiplier: ${audMult}× (${audienceQuality})`,
    `Engagement rate: ${engagementRate.toFixed(1)}% (${engagementRateInput ? "provided" : "auto-estimated"}) → ${engMult}× multiplier`,
    `Affiliate: 2% link click-through rate, ${affiliateCommission}% commission, $${affiliateProductPrice} avg product price`,
    `Subscriptions: 0.5%–5% conversion of followers at $${subscriptionPrice}/month`,
    `Products: 0.5%–2.5% conversion of followers at $${productPrice} product price`,
    `Scenario: ${SCENARIO_FACTORS[scenario].label}, factor range ${SCENARIO_FACTORS[scenario].factor[0]}×–${SCENARIO_FACTORS[scenario].factor[1]}×`,
  ];

  return {
    sponsorshipsMin: byStream.sponsorships[0], sponsorshipsMax: byStream.sponsorships[1],
    affiliateMin:    byStream.affiliate[0],    affiliateMax:    byStream.affiliate[1],
    subscriptionsMin:byStream.subscriptions[0],subscriptionsMax:byStream.subscriptions[1],
    productsMin:     byStream.products[0],     productsMax:     byStream.products[1],
    totalMin, totalMax,
    engagementRate,
    monetizationScore,
    tier,
    recommendations: recommendations.slice(0, 5),
    projections,
    bestStrategy,
    assumptions,
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: `How do Instagram creators make money in ${YEAR}?`,
    a: "Instagram creators earn through four primary revenue streams: (1) Brand Sponsorships, companies pay creators to feature their products in Reels, carousels, or Stories; this represents the majority of income for most established creators; (2) Affiliate Marketing, creators earn a commission (typically 5–30%) on sales generated through unique tracking links in their bio, Stories, or Reels descriptions; (3) Instagram Subscriptions, creators charge followers a monthly fee ($2.99–$9.99) for exclusive content, subscriber-only Stories, and direct access; (4) Digital or Physical Product Sales, creators sell e-books, presets, courses, merchandise, or coaching directly to their audience. The most successful creators combine all four streams to reduce dependence on any single platform or brand.",
  },
  {
    q: "How much does Instagram pay per 1,000 followers?",
    a: "Instagram does not pay creators directly per follower, unlike TikTok's Creator Rewards, there's no per-view or per-follower payment program from Instagram itself. Income comes from brand sponsorships, subscriptions, affiliate marketing, and product sales. For brand deals, the industry benchmark is roughly $10–$100 per 1,000 followers per sponsored post, depending heavily on niche, engagement rate, and audience quality. Finance and business creators earn at the high end ($50–$100 per 1K followers), while entertainment creators earn less ($5–$20 per 1K followers). Engagement rate is more important than follower count, a creator with 10K followers and 8% engagement can outperform one with 100K followers and 1% engagement.",
  },
  {
    q: "How many Instagram followers do you need to make money?",
    a: "You can start earning on Instagram with as few as 1,000 followers through affiliate marketing and micro-deals, but meaningful income appears at these thresholds: 5,000–10,000 followers, first brand deals from small businesses ($50–$300/post), affiliate income from engaged niche audiences; 25,000–50,000 followers, consistent brand partnerships ($300–$1,500/post), Instagram Subscriptions launch, affiliate income of $200–$800/month; 100,000 followers, mid-tier brand deals ($1,000–$5,000/post), multiple income streams generating $2,000–$8,000/month; 500,000+ followers, premium brand partnerships ($5,000–$25,000/post), subscription revenue of $1,000–$10,000/month, product launches generating $5,000–$50,000+.",
  },
  {
    q: "What is the best niche for making money on Instagram?",
    a: `The highest-earning niches on Instagram in ${YEAR} are: (1) Finance and Business, highest CPMs ($15–$25), premium brand deals, high-intent affiliate audiences; (2) Tech / AI, strong brand demand from SaaS and software companies, highly engaged early-adopter audience; (3) Education, high content value signals to the algorithm, strong course and coaching monetization; (4) Fitness, supplement, apparel, and health product deals are abundant, strong affiliate product ecosystem; (5) Beauty, large brand budget, reliable affiliate commissions, strong subscription potential. The common thread in high-earning niches is an audience with purchasing intent and disposable income, creators who serve professionals, investors, or health-conscious buyers earn significantly more per follower than broad entertainment creators.`,
  },
  {
    q: "How much do Instagram brand deals pay?",
    a: `Instagram brand deal rates in ${YEAR} follow this general structure: Nano-influencers (1K–10K followers), $50–$500 per Reel or carousel post, often paid in product; Micro-influencers (10K–100K), $300–$3,000 per post, sometimes including Stories packages; Mid-tier (100K–500K), $1,500–$10,000 per post with multi-deliverable packages; Macro (500K–1M), $5,000–$25,000 per post; Celebrity tier (1M+), $25,000–$500,000+ per post. Engagement rate significantly adjusts these rates, brands increasingly use cost-per-engagement rather than cost-per-follower, meaning a creator with high engagement can command meaningfully higher rates than one with the same follower count at low engagement. Niche also matters significantly: finance and business creators typically earn higher per-post rates than lifestyle or entertainment creators with equivalent audiences, because advertisers in those categories pay higher CPMs for more targeted, purchase-intent audiences.`,
  },
  {
    q: "How do Instagram Subscriptions work for creators?",
    a: "Instagram Subscriptions allow creators to charge followers a monthly fee for exclusive content. Creators can set prices ranging from $0.99 to $99.99 per month (most effective range is $2.99–$9.99 for broad audiences). Subscribers get access to subscriber-only Stories, exclusive Lives, subscriber badges in comments, and any other exclusive content the creator designates. Instagram takes a commission (currently 30% in-app on iOS/Android). Even at conservative conversion rates, 0.5–1% of followers converting to paid subscribers, a creator with 100K followers can generate $1,500–$3,000/month in subscription revenue. Subscriptions work best for creators with highly engaged niche audiences who consume content regularly and want deeper access to the creator.",
  },
  {
    q: "What is engagement rate and why does it matter for Instagram income?",
    a: `Engagement rate on Instagram is calculated as: (Likes + Comments + Saves + Shares) ÷ Reach × 100. A good engagement rate varies by account size: under 10K followers, 5–8% is healthy; 10K–100K, 3–6% is solid; 100K+, 2–4% is good for larger accounts. Engagement rate directly impacts income in three ways: (1) Brand deal rates, brands calculate value using engagement, not just follower count; a 6% engagement rate can double your sponsorship fee; (2) Affiliate conversions, engaged followers click links and buy; (3) Instagram's Reels algorithm, higher engagement triggers broader distribution, increasing your organic reach to potential new followers and brand partners. Saves are weighted particularly heavily by Instagram's algorithm in ${YEAR}.`,
  },
  {
    q: "How much can Instagram affiliate marketing earn?",
    a: "Instagram affiliate marketing income depends on three factors: (1) Audience size and engagement, clicks are estimated at 1–3% of followers for Reels/Stories with affiliate links; (2) Commission rate, ranges from 5% for physical products to 30%+ for digital products and SaaS tools; (3) Average order value, promoting a $200 supplement generates more per sale than a $15 product. Realistic ranges: 5K–25K followers, $50–$500/month with consistent affiliate link placement; 50K–100K followers, $200–$2,000/month; 250K–500K followers, $1,000–$8,000/month. Affiliate marketing is particularly powerful for Instagram creators because it earns passively on every video that includes a link, unlike brand deals, there's no per-post limit.",
  },
  {
    q: "What is a good monetization score on this calculator?",
    a: "The Monetization Score (0–100) in this calculator rates how well your profile is set up to generate Instagram income. It factors in: engagement rate (high engagement = higher multiplier on all revenue streams), follower count (more followers = more deal opportunities and subscription revenue), posting frequency (consistent posting = more sponsored post slots), number of active monetization methods (diversification reduces risk), and audience quality (premium locations earn higher CPM rates). A score of 80–100 is excellent, your profile is optimized across all earning dimensions. 60–79 is good, you have strong fundamentals with clear growth areas. Below 60 indicates 1–2 significant levers you should focus on before expecting consistent income.",
  },
  {
    q: "Is this Instagram money calculator accurate?",
    a: "This calculator provides realistic estimated ranges based on current Instagram industry benchmarks for brand sponsorship CPMs, affiliate conversion rates, subscription conversion rates, and product sales rates. Actual earnings vary significantly based on specific brand partnerships you secure, your audience's purchasing behavior, content quality, posting consistency, and how aggressively you promote affiliate and product links. The calculator always returns ranges rather than fixed numbers, real Instagram income is highly variable. Use the Conservative scenario for minimum planning, the Realistic scenario as your baseline target, and the Aggressive scenario as your ceiling under optimized conditions. Verify current market rates with Instagram's Creator Marketplace and in creator economy communities.",
  },
  {
    q: "How do I join Instagram's Creator Marketplace to get brand deals?",
    a: "Instagram's Creator Marketplace is documented in the Instagram Help Center as the platform's official tool for connecting creators with brand partners. To access it, you need: a professional account (Business or Creator type), to be at least 18 years old, to comply with Instagram's Partner Monetization Policies, and to be located in a supported country (the list is expanding). Once eligible, go to Professional Dashboard → Monetization Tools → Creator Marketplace in the Instagram app to set up your creator portfolio, add your rate card, and indicate the brand categories you work with. Brands can then discover and message you directly within the platform, and you can apply to open brand campaigns. The Creator Marketplace is separate from Instagram's native Affiliate tool, which allows creators to earn commissions on product sales by tagging shoppable products in posts and Reels, also accessible under Professional Dashboard → Monetization Tools.",
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

// ─── Score Meter ──────────────────────────────────────────────────────────────

function ScoreMeter({ score }: { score: number }) {
  const cls    = score >= 80 ? "text-green-600 dark:text-green-400" : score >= 60 ? "text-primary" : "text-yellow-600 dark:text-yellow-400";
  const bgCls  = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-primary" : "bg-yellow-500";
  const label  = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="none"
            className={bgCls.replace("bg-", "text-")}
            strokeDasharray={`${(score / 100) * 213.6} 213.6`} strokeLinecap="round" />
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

// ─── Earnings Bar ─────────────────────────────────────────────────────────────

function EarningBar({ label, icon: Icon, min, max, color, pct }: {
  label: string; icon: React.ElementType; min: number; max: number; color: string; pct: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold text-foreground">
          {fmtRange(min, max)}<span className="text-xs text-muted-foreground font-normal">/mo</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color.replace("text-", "bg-")}`}
          style={{ width: `${Math.max(pct, 4)}%` }} />
      </div>
    </div>
  );
}

// ─── Number Input ─────────────────────────────────────────────────────────────

function NumberInput({ value, onChange, min, max, step, placeholder, prefix }: {
  value: string; onChange: (v: string) => void;
  min?: number; max?: number; step?: number; placeholder?: string; prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min} max={max} step={step}
        placeholder={placeholder}
        className={`w-full h-11 rounded-xl border border-muted-foreground/20 bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors ${prefix ? "pl-7 pr-4" : "px-4"}`}
      />
    </div>
  );
}

// ─── Follower Slider ──────────────────────────────────────────────────────────

const FOLLOWER_STEPS = [
  1000, 2500, 5000, 7500, 10000, 15000, 20000, 25000,
  35000, 50000, 75000, 100000, 150000, 250000, 500000,
  750000, 1000000, 2000000, 5000000,
];

function FollowerSlider({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const idx = FOLLOWER_STEPS.indexOf(value) !== -1
    ? FOLLOWER_STEPS.indexOf(value)
    : FOLLOWER_STEPS.findIndex(s => s >= value) || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-foreground tracking-wide uppercase">Followers</label>
        <span className="text-lg font-bold text-primary">{fmtFollowers(value)}</span>
      </div>
      <input
        type="range" min={0} max={FOLLOWER_STEPS.length - 1}
        value={Math.max(0, idx)}
        onChange={e => onChange(FOLLOWER_STEPS[Number(e.target.value)])}
        className="w-full accent-primary h-2 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1K</span><span>10K</span><span>100K</span><span>1M</span><span>5M</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "finance",       label: "Finance",       emoji: "💰" },
  { value: "business",      label: "Business",      emoji: "💼" },
  { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
  { value: "fitness",       label: "Fitness",       emoji: "💪" },
  { value: "beauty",        label: "Beauty",        emoji: "💄" },
  { value: "education",     label: "Education",     emoji: "📚" },
  { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
  { value: "food",          label: "Food",          emoji: "🍕" },
  { value: "travel",        label: "Travel",        emoji: "✈️" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
];

const METHOD_CONFIG: { value: MonetizationMethod; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "sponsorships",   label: "Brand Sponsorships",      icon: Star,        desc: "Paid posts & brand deals" },
  { value: "affiliate",      label: "Affiliate Marketing",     icon: LinkIcon,    desc: "Commission on product sales" },
  { value: "subscriptions",  label: "Instagram Subscriptions", icon: Gift,        desc: "Monthly subscriber fee" },
  { value: "products",       label: "Product Sales",           icon: ShoppingBag, desc: "Digital / physical products" },
];

export function InstagramMoneyCalculatorTool() {
  const [followers, setFollowers]         = useState(25000);
  const [niche, setNiche]                 = useState<Niche>("lifestyle");
  const [audienceQuality, setAudienceQuality] = useState<AudienceQuality>("mixed");
  const [methods, setMethods]             = useState<MonetizationMethod[]>(["sponsorships", "affiliate"]);
  const [engagementStr, setEngagementStr] = useState("");
  const [postsPerWeek, setPostsPerWeek]   = useState(4);
  const [productPrice, setProductPriceStr]   = useState("49");
  const [subscriptionPrice, setSubscriptionPriceStr] = useState("4.99");
  const [affiliateProductPrice, setAffiliateProductPriceStr] = useState("80");
  const [affiliateCommission, setAffiliateCommissionStr]    = useState("15");
  const [scenario, setScenario]           = useState<Scenario>("realistic");
  const [result, setResult]               = useState<EarningsResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"overview" | "projection" | "strategy">("overview");
  const [showAssumptions, setShowAssumptions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-ig-money-calc";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const toggleMethod = (m: MonetizationMethod) => {
    setMethods(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const handleCalculate = useCallback(() => {
    if (methods.length === 0) {
      toast({ title: "Select at least one monetization method", variant: "destructive" });
      return;
    }
    const erInput = parseFloat(engagementStr) || null;
    const pp    = parseFloat(productPrice)           || 49;
    const sp    = parseFloat(subscriptionPrice)      || 4.99;
    const app   = parseFloat(affiliateProductPrice)  || 80;
    const ac    = parseFloat(affiliateCommission)    || 15;

    const res = calcEarnings(followers, erInput, niche, audienceQuality, methods, postsPerWeek, pp, sp, app, ac, scenario);
    setResult(res);
    setActiveResultTab("overview");
    setTimeout(() => document.getElementById("ig-money-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }, [followers, niche, audienceQuality, methods, engagementStr, postsPerWeek, productPrice, subscriptionPrice, affiliateProductPrice, affiliateCommission, scenario, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleCalculate(); };

  const tierConfig = {
    beginner:     { label: "Beginner Creator",    color: "text-muted-foreground", bg: "bg-muted" },
    growing:      { label: "Growing Creator",     color: "text-yellow-600",       bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    established:  { label: "Established Creator", color: "text-primary",          bg: "bg-primary/10" },
    professional: { label: "Professional Creator",color: "text-green-600",        bg: "bg-green-100 dark:bg-green-900/30" },
  };

  return (
    <>
      {/* ── Input Card ─────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Followers */}
            <FollowerSlider value={followers} onChange={setFollowers} />

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

            {/* Monetization Methods */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Monetization Methods</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {METHOD_CONFIG.map(({ value, label, icon: Icon, desc }) => {
                  const active = methods.includes(value);
                  return (
                    <button key={value} type="button" onClick={() => toggleMethod(value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        active ? "bg-primary/10 border-primary/40 text-foreground" : "bg-muted/40 border-border text-muted-foreground hover:border-primary/40"
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${active ? "text-foreground" : ""}`}>{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      {active && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional inputs */}
            <div className="grid sm:grid-cols-2 gap-4">
              {methods.includes("products") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Avg Product Price</label>
                  <NumberInput value={productPrice} onChange={setProductPriceStr} min={1} step={1} placeholder="49" prefix="$" />
                </div>
              )}
              {methods.includes("subscriptions") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Subscription Price / mo</label>
                  <NumberInput value={subscriptionPrice} onChange={setSubscriptionPriceStr} min={0.99} step={0.01} placeholder="4.99" prefix="$" />
                </div>
              )}
              {methods.includes("affiliate") && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Avg Affiliate Product Price</label>
                    <NumberInput value={affiliateProductPrice} onChange={setAffiliateProductPriceStr} min={1} step={1} placeholder="80" prefix="$" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Commission Rate</label>
                    <NumberInput value={affiliateCommission} onChange={setAffiliateCommissionStr} min={1} max={60} step={1} placeholder="15" prefix="%" />
                  </div>
                </>
              )}
            </div>

            {/* Engagement + Posts */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  Engagement Rate <span className="text-muted-foreground font-normal normal-case text-xs">(optional, auto-estimated if blank)</span>
                </label>
                <NumberInput value={engagementStr} onChange={setEngagementStr} min={0} max={100} step={0.1} placeholder={`Auto: ${estimateEngagement(followers).toFixed(1)}%`} prefix="%" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Posts per Week</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 7].map(n => (
                    <button key={n} type="button" onClick={() => setPostsPerWeek(n)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        postsPerWeek === n ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audience Quality */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Primary Audience Location</label>
              <div className="flex gap-2">
                {([
                  { value: "premium" as AudienceQuality,   label: "US / UK / CA / AU",    desc: "Premium" },
                  { value: "mixed" as AudienceQuality,     label: "Mixed International",   desc: "Average" },
                  { value: "developing" as AudienceQuality,label: "Developing Countries",  desc: "Lower CPM" },
                ] as const).map(({ value, label, desc }) => (
                  <button key={value} type="button" onClick={() => setAudienceQuality(value)}
                    className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      audienceQuality === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                    }`}>
                    <span className="block font-bold">{desc}</span>
                    <span className="block opacity-80 text-[11px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Income Scenario</label>
              <div className="flex gap-2">
                {(Object.entries(SCENARIO_FACTORS) as [Scenario, typeof SCENARIO_FACTORS[Scenario]][]).map(([key, { label, desc }]) => (
                  <button key={key} type="button" onClick={() => setScenario(key)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      scenario === key ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                    }`}>
                    <span className="block font-bold">{label}</span>
                    <span className="block opacity-75 text-[11px]">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              <Calculator className="w-5 h-5" /> Calculate My Instagram Earnings
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ─────────────────────────────────────────── */}
      {result && (
        <section id="ig-money-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["overview", "projection", "strategy"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveResultTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border uppercase tracking-wide transition-all ${
                  activeResultTab === tab ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                }`}>
                {{ overview: "💰 Earnings", projection: "📊 Projections", strategy: "🎯 Strategy" }[tab]}
              </button>
            ))}
          </div>

          {/* ── Overview ─────────────────────────── */}
          {activeResultTab === "overview" && (
            <div className="space-y-4">
              <Card className="p-6 rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Monthly Earnings Estimate</p>
                    <p className="text-3xl font-bold text-foreground">{fmtRange(result.totalMin, result.totalMax)}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Yearly: <span className="font-semibold text-foreground">{fmtRange(result.totalMin * 12, result.totalMax * 12)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <ScoreMeter score={result.monetizationScore} />
                    <div className="space-y-1 text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${tierConfig[result.tier].bg} ${tierConfig[result.tier].color}`}>
                        <Star className="w-3 h-3" />{tierConfig[result.tier].label}
                      </div>
                      <p className="text-xs text-muted-foreground">ER: {result.engagementRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground capitalize">{scenario} scenario</p>
                    </div>
                  </div>
                </div>

                {/* Earnings bars */}
                <div className="space-y-4">
                  {[
                    { id: "sponsorships" as MonetizationMethod, label: "Brand Sponsorships", icon: Star, color: "text-primary",
                      min: result.sponsorshipsMin, max: result.sponsorshipsMax },
                    { id: "affiliate" as MonetizationMethod, label: "Affiliate Marketing", icon: LinkIcon, color: "text-blue-500",
                      min: result.affiliateMin, max: result.affiliateMax },
                    { id: "subscriptions" as MonetizationMethod, label: "Instagram Subscriptions", icon: Gift, color: "text-purple-500",
                      min: result.subscriptionsMin, max: result.subscriptionsMax },
                    { id: "products" as MonetizationMethod, label: "Product Sales", icon: ShoppingBag, color: "text-green-500",
                      min: result.productsMin, max: result.productsMax },
                  ].filter(s => methods.includes(s.id) && (s.max > 0)).map(stream => (
                    <EarningBar
                      key={stream.id}
                      label={stream.label} icon={stream.icon} color={stream.color}
                      min={stream.min} max={stream.max}
                      pct={result.totalMax > 0 ? (stream.max / result.totalMax) * 100 : 0}
                    />
                  ))}
                </div>
              </Card>

              {/* Recommendations */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary" /> Income Growth Recommendations
                </h3>
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>

              {/* Assumptions toggle */}
              <button
                onClick={() => setShowAssumptions(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border border-border bg-muted/30 hover:border-primary/40 transition-all text-left"
              >
                <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Search className="w-4 h-4" /> Calculation Assumptions & Methodology
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showAssumptions ? "rotate-180" : ""}`} />
              </button>
              {showAssumptions && (
                <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-2">
                  {result.assumptions.map((a, i) => (
                    <div key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                      <span className="text-primary font-bold shrink-0">·</span>{a}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Projections ──────────────────────── */}
          {activeResultTab === "projection" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Estimated earnings at each follower milestone using your current niche, methods, and
                <span className="font-semibold text-foreground"> {scenario}</span> scenario.
              </p>
              <div className="rounded-2xl border border-border overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/60">
                        <th className="text-left px-5 py-3 font-bold text-foreground text-xs uppercase tracking-wide">Followers</th>
                        <th className="text-right px-5 py-3 font-bold text-foreground text-xs uppercase tracking-wide">Monthly</th>
                        <th className="text-right px-5 py-3 font-bold text-foreground text-xs uppercase tracking-wide">Yearly</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.projections.map((row, i) => {
                        const isCurrentTier = row.followers <= followers && (i === result.projections.length - 1 || result.projections[i + 1].followers > followers);
                        return (
                          <tr key={row.followers}
                            className={`border-b border-border last:border-0 transition-colors ${isCurrentTier ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                            <td className="px-5 py-3.5 font-semibold text-foreground flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-muted-foreground" />
                              {fmtFollowers(row.followers)}
                              {isCurrentTier && <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">You</span>}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="font-semibold text-foreground">{fmtRange(row.monthlyMin, row.monthlyMax)}</span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-muted-foreground">{fmtRange(row.yearlyMin, row.yearlyMax)}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Projections assume engagement rate decreases slightly as audiences grow (8% at 5K → 3% at 500K+) and Reels reach scales with follower count.
              </p>
            </div>
          )}

          {/* ── Strategy ─────────────────────────── */}
          {activeResultTab === "strategy" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Best Monetization Strategy for Your Profile
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.bestStrategy}</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                  <BarChart2 className="w-4 h-4 text-primary" /> Revenue Stream Comparison
                </h3>
                {[
                  { label: "Brand Sponsorships",       pct: 70, best: "100K+ followers", icon: Star },
                  { label: "Affiliate Marketing",       pct: 55, best: "5K+ followers",   icon: LinkIcon },
                  { label: "Instagram Subscriptions",   pct: 45, best: "50K+ followers",  icon: Gift },
                  { label: "Digital Product Sales",     pct: 65, best: "25K+ followers",  icon: ShoppingBag },
                ].map(({ label, pct, best, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 border border-border">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">Best from: {best}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">{pct}%</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-primary" /> Action Plan to Increase Income
                </h3>
                {[
                  { action: "Increase engagement rate above 4%", impact: "Boosts all revenue streams simultaneously, especially brand deal rates and affiliate click-through", icon: TrendingUp },
                  { action: "Post Reels 4–5x per week", impact: "More Reels = more reach = more organic follower growth and more sponsored post slots per month", icon: BarChart2 },
                  { action: "Add at least one affiliate link to bio", impact: "Passive income from every video: no extra work required after the initial link setup", icon: LinkIcon },
                  { action: "Pitch 3 brands per week directly", impact: "Outbound brand pitching generates far more sponsorship income than waiting for inbound inquiries, most creators at the micro tier only get deals through their own outreach", icon: Star },
                  { action: "Create one digital product this month", impact: "Even a $29 e-book or preset pack at 1% conversion of 50K followers generates $1,450 on launch day", icon: ShoppingBag },
                ].map(({ action, impact, icon: Icon }, i) => (
                  <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                    <div className="w-7 h-7 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</div>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-primary" />{action}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{impact}</p>
                    </div>
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Money Calculator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, icon: <Users className="w-5 h-5 text-primary" />, title: "Enter your follower count and niche",
              desc: "Drag the follower slider to your current count, then select your niche. Niche is critical, finance and business creators earn up to 2× more than lifestyle creators with the same audience size due to higher advertiser demand." },
            { step: 2, icon: <DollarSign className="w-5 h-5 text-primary" />, title: "Select your monetization methods",
              desc: "Choose the revenue streams you use or plan to use: Brand Sponsorships, Affiliate Marketing, Instagram Subscriptions, or Product Sales. Select all that apply, the calculator estimates each stream independently and totals them." },
            { step: 3, icon: <Target className="w-5 h-5 text-primary" />, title: "Set your engagement rate and scenario",
              desc: "Enter your engagement rate for a more accurate result (leave blank for auto-estimate). Select your income scenario: Conservative for worst-case planning, Realistic for baseline targets, or Aggressive for optimized best-case projections." },
            { step: 4, icon: <BarChart2 className="w-5 h-5 text-primary" />, title: "Review your earnings and projections",
              desc: "See your estimated monthly and yearly income broken down by stream. Switch to the Projections tab to see income at 7 follower milestones (5K to 500K), and the Strategy tab for a personalized monetization plan and action steps." },
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

      {/* ── About ────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This Instagram Money Calculator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" /> What This Instagram Money Calculator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram influencer rates range from $100–$500 per post for nano-influencers (1K–10K
              followers) to $10,000+ for accounts over 1 million followers, according to{" "}
              <a href="https://influencermarketinghub.com/influencer-marketing-benchmark-report/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Influencer Marketing Hub's 2025 Benchmark Report
              </a>
              . This calculator estimates your potential monthly income across all four Instagram
              revenue streams, brand sponsorships, affiliate marketing, subscriptions, and product
              sales, using your follower count, niche, engagement rate, and audience quality.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Set your follower count with the slider, choose your niche, select the monetization
              methods you use or plan to use, and pick an income scenario (Conservative, Realistic,
              or Aggressive). The calculator estimates each stream independently and totals them.
              You also get income projections at 7 follower milestones, from 5K to 500K, so you
              can see what your income trajectory looks like as you grow.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Pair these estimates with the{" "}
              <a href="/tools/instagram-engagement-calculator" className="text-primary hover:underline font-medium">
                Instagram Engagement Calculator
              </a>{" "}
              to understand how improving your engagement rate directly affects your brand deal
              pricing. Cross-platform creators can compare earnings using the{" "}
              <a href="/tools/youtube-money-calculator" className="text-primary hover:underline font-medium">
                YouTube Money Calculator
              </a>
              .
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" /> How Instagram Creator Rates Are Actually Calculated
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators assume Instagram pays per view. It doesn't. Instagram has no per-view ad
              revenue program equivalent to YouTube's Partner Program.{" "}
              <a href="https://help.instagram.com/1216478198750997" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Instagram's Help Center
              </a>{" "}
              documents four official monetization paths: Brand Partnerships via Creator Marketplace,
              Subscriptions, the native Affiliate tool, and Instagram Shopping. Every dollar you earn
              comes from one of these four buckets.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Brand deal pricing follows a CPM model. Brands estimate your Reels reach (typically
              30% of followers), multiply by a niche-specific CPM rate ($5–$25 per 1,000 reach), and
              apply an engagement multiplier. Finance and business creators earn CPMs of $14–$25.
              Entertainment creators earn $5–$10. That difference is why niche matters more than
              follower count when negotiating sponsorship rates. The influencer marketing industry
              hit an estimated{" "}
              <a href="https://influencermarketinghub.com/influencer-marketing-benchmark-report/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                $24 billion globally in 2024 (Influencer Marketing Hub)
              </a>
              , and brands are paying premium rates for niche creators with high engagement.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Engagement rate is the multiplier on everything. It's not just a vanity metric. A
              creator with a 6% engagement rate earns a 1.8× multiplier on their base sponsorship
              rate versus 1.0× for someone at 2%. For a creator with 50,000 fitness followers, that
              difference equals roughly $500–$800 more per sponsored Reel. This is why tracking and
              improving engagement rate pays directly.
            </p>
          </div>

          {/* YouTube embed */}
          <figure style={{margin:"1rem 0 2rem",position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"12px"}}>
            <iframe style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}}
              srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/wrGfPA0djFg?autoplay=1'><img src='https://img.youtube.com/vi/wrGfPA0djFg/maxresdefault.jpg' alt='How Much Does Instagram Pay, Creator Monetization Guide 2025'><span>&#9654;</span></a>"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="How Much Does Instagram Pay, Creator Monetization Guide 2025"
              aria-label="Video explaining how Instagram creators actually get paid, what brand deal rates look like, and how to maximize earnings in 2025"
            ></iframe>
            <noscript><a href="https://www.youtube.com/watch?v=wrGfPA0djFg" target="_blank" rel="noopener">Watch: How Much Does Instagram Pay, Creator Monetization Guide 2025 on YouTube</a></noscript>
          </figure>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" /> Benefits of Using This Instagram Money Calculator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "4 independent revenue stream estimates: Brand Sponsorships, Affiliate Marketing, Subscriptions, and Product Sales",
                "Monthly and yearly earnings ranges, not misleading single-number estimates",
                "Income projections at 7 follower milestones: 5K, 10K, 25K, 50K, 100K, 250K, and 500K",
                "3 income scenarios (Conservative, Realistic, Aggressive), match your planning style",
                "Monetization Score (0-100) rating how well your profile is positioned to earn across all streams",
                "Personalized best strategy recommendation tailored to your follower tier and active revenue methods",
                "5-step income action plan with specific tactics for your current follower count and niche",
                "Engagement rate auto-estimation if you don't know yours, based on proven follower-count benchmarks",
                "Audience location multiplier: Premium (US/UK/CA), Mixed, or Developing, adjusts CPMs and deal rates",
                "Full calculation assumptions panel, see exactly how every number is derived, no black boxes",
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

      {/* ── Citation Capsule ──────────────────────────────────────── */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Source documentation:</strong>{" "}
          Instagram influencer rates range from $100–$500 per post for nano-influencers to $10,000+
          for accounts over 1 million followers, per the{" "}
          <a href="https://influencermarketinghub.com/influencer-marketing-benchmark-report/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Influencer Marketing Hub 2025 Benchmark Report
          </a>
          , which estimated the global influencer marketing industry at $24 billion in 2024.{" "}
          <a href="https://help.instagram.com/1216478198750997" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Instagram's Help Center
          </a>{" "}
          documents four official creator monetization paths: Brand Partnerships (Creator Marketplace),
          Subscriptions, the native Affiliate tool, and Instagram Shopping. Instagram does not offer
          per-view ad revenue: all creator income is business-activity-dependent.
        </p>
      </div>

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
            { tip: "Nano-influencers (1K–10K followers) often earn 2–5% engagement vs 0.5–1% for mega-influencers, higher engagement rates can command equal or better sponsorship rates." },
            { tip: "Brand deal rates on Instagram typically run $100–$500 per 10,000 followers for a feed post, negotiate based on your engagement rate and niche authority." },
            { tip: "Diversify monetization beyond brand deals, digital products, affiliate commissions, LTK/Amazon storefronts, and subscriptions add reliable non-deal income." },
            { tip: "Instagram's Creator Marketplace is the platform's official tool for connecting creators with brands, complete your creator profile and set your rates to be discoverable by brand partners searching in your niche." },
            { tip: "Performance-based programs and bonuses fluctuate, Q4 historically sees higher advertiser spend as brands push holiday campaigns, so prioritize your best content for that period." },
            { tip: "Document your results data (reach, conversions, story swipe-ups), case studies in your media kit give brands concrete evidence of ROI, which improves your negotiating position." },
            { tip: "Package your services in tiers, offer a Basic (1 story), Standard (1 feed post), and Premium (reel + story + feed) to upsell brands automatically." },
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
            { name: "Instagram Engagement Calculator", path: "/tools/instagram-engagement-calculator", desc: "Calculate your engagement rate, the metric brands use most to evaluate and price sponsorship deals." },
            { name: "Instagram Content Planner", path: "/tools/instagram-content-planner", desc: "Build a consistent posting schedule that keeps your engagement high and brand partnerships attractive." },
            { name: "Instagram Reel Idea Generator", path: "/tools/instagram-reel-idea-generator", desc: "Generate high-performing Reel concepts that drive views and follower growth to boost your earnings potential." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Find the right hashtags to expand your reach and attract the right brand partners to your profile." },
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
