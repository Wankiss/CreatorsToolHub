import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  DollarSign, TrendingUp, Users, ChevronDown, Check,
  Sliders, Globe, Tv, ListChecks, Search, Zap, Shield,
  BadgeDollarSign, ShoppingBag, Heart,
} from "lucide-react";

// ─── Data Tables ──────────────────────────────────────────────────────────────

const NICHES: { label: string; cpmLow: number; cpmHigh: number }[] = [
  { label: "Entertainment",       cpmLow: 2,  cpmHigh: 8  },
  { label: "Gaming",              cpmLow: 2,  cpmHigh: 6  },
  { label: "Vlogs / Lifestyle",   cpmLow: 3,  cpmHigh: 9  },
  { label: "Education",           cpmLow: 8,  cpmHigh: 20 },
  { label: "Finance / Investing", cpmLow: 15, cpmHigh: 35 },
  { label: "Tech",                cpmLow: 10, cpmHigh: 25 },
  { label: "Business / Marketing",cpmLow: 12, cpmHigh: 30 },
  { label: "Health / Fitness",    cpmLow: 6,  cpmHigh: 18 },
  { label: "Luxury / Real Estate",cpmLow: 12, cpmHigh: 40 },
];

const GEO_TIERS: { label: string; sublabel: string; multiplier: number }[] = [
  { label: "Tier 1", sublabel: "USA, UK, Canada, Australia",       multiplier: 1.00 },
  { label: "Tier 2", sublabel: "Europe, UAE, Singapore",           multiplier: 0.70 },
  { label: "Tier 3", sublabel: "India, Philippines, Indonesia",    multiplier: 0.35 },
  { label: "Tier 4", sublabel: "Africa, Pakistan, Bangladesh",     multiplier: 0.25 },
];

// ─── Calculator Core ──────────────────────────────────────────────────────────

interface EarningsResult {
  rpmLow: number;
  rpmAvg: number;
  rpmHigh: number;
  adMonthlyLow: number;
  adMonthlyAvg: number;
  adMonthlyHigh: number;
  adYearlyLow: number;
  adYearlyHigh: number;
  sponsorshipMonthly: number;
  affiliateMonthly: number;
  membershipMonthly: number;
  totalMonthlyLow: number;
  totalMonthlyHigh: number;
  totalYearlyLow: number;
  totalYearlyHigh: number;
}

function calculate(
  views: number,
  nicheIdx: number,
  geoIdx: number,
  monetizedRate: number,         // 0.30 – 0.80
  cpmOverride: number | null,
  sponsorsPerMonth: number,
  sponsorRate: number,
  affiliateRate: number,
  membershipsEnabled: boolean,
  subscribers: number,
): EarningsResult {
  const niche = NICHES[nicheIdx];
  const geo   = GEO_TIERS[geoIdx];

  const baseCpmLow  = cpmOverride !== null ? cpmOverride * 0.7  : niche.cpmLow;
  const baseCpmHigh = cpmOverride !== null ? cpmOverride * 1.3  : niche.cpmHigh;

  const adjCpmLow  = baseCpmLow  * geo.multiplier;
  const adjCpmHigh = baseCpmHigh * geo.multiplier;
  const adjCpmAvg  = (adjCpmLow + adjCpmHigh) / 2;

  // RPM = CPM × 0.55 × monetizedRate
  const rpmLow  = adjCpmLow  * 0.55 * monetizedRate;
  const rpmHigh = adjCpmHigh * 0.55 * monetizedRate;
  const rpmAvg  = adjCpmAvg  * 0.55 * monetizedRate;

  const adMonthlyLow  = (views / 1000) * rpmLow;
  const adMonthlyHigh = (views / 1000) * rpmHigh;
  const adMonthlyAvg  = (views / 1000) * rpmAvg;

  // Sponsorships: $20–$50 per 1000 views per sponsor
  const sponsorshipMonthly = sponsorsPerMonth > 0
    ? sponsorsPerMonth * (views / 1000) * sponsorRate
    : 0;

  // Affiliate: % of monthly ad earnings as rough proxy
  const affiliateMonthly = affiliateRate > 0
    ? adMonthlyAvg * (affiliateRate / 100) * 2.5
    : 0;

  // Memberships: ~0.5% of subs × $4.99 avg
  const membershipMonthly = membershipsEnabled && subscribers > 0
    ? subscribers * 0.005 * 4.99
    : 0;

  const extras = sponsorshipMonthly + affiliateMonthly + membershipMonthly;

  return {
    rpmLow, rpmAvg, rpmHigh,
    adMonthlyLow, adMonthlyAvg, adMonthlyHigh,
    adYearlyLow:  adMonthlyLow  * 12,
    adYearlyHigh: adMonthlyHigh * 12,
    sponsorshipMonthly,
    affiliateMonthly,
    membershipMonthly,
    totalMonthlyLow:  adMonthlyLow  + extras,
    totalMonthlyHigh: adMonthlyHigh + extras,
    totalYearlyLow:   (adMonthlyLow  + extras) * 12,
    totalYearlyHigh:  (adMonthlyHigh + extras) * 12,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtRange(low: number, high: number): string {
  return `${fmt(low)} – ${fmt(high)}`;
}
function fmtN(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimatedMoney({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  const from = useRef(0);

  useEffect(() => {
    from.current = display;
    start.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    const target = value;
    const duration = 600;
    const step = (ts: number) => {
      if (!start.current) start.current = ts;
      const elapsed = ts - start.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from.current + (target - from.current) * eased);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatted = display >= 1_000_000
    ? `${prefix}${(display / 1_000_000).toFixed(1)}M`
    : display >= 1_000
    ? `${prefix}${(display / 1_000).toFixed(1)}K`
    : `${prefix}${display.toFixed(0)}`;

  return <>{formatted}</>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, low, high, icon, accent }: {
  label: string; low: number; high: number;
  icon: React.ReactNode; accent: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${accent}`}>
      <div className="flex items-center gap-2 text-sm font-semibold opacity-80">{icon}{label}</div>
      <div className="text-2xl font-extrabold tracking-tight font-display">
        <AnimatedMoney value={low} /> – <AnimatedMoney value={high} />
      </div>
    </div>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function SliderInput({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-foreground tracking-wide uppercase">{label}</label>
        <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
          {format(value)}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-2 opacity-0 cursor-pointer"
          style={{ zIndex: 2 }}
        />
        <div
          className="absolute w-5 h-5 rounded-full bg-white border-2 border-primary shadow-md transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)`, zIndex: 1 }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How much does YouTube pay per 1,000 views?",
    a: "YouTube pays creators based on RPM (Revenue per 1,000 views), which typically ranges from $0.50 to $10+ depending on your niche, audience location, and ad engagement. Finance and business channels can earn $5–$15 RPM, while entertainment or gaming channels typically earn $0.50–$3 RPM. YouTube keeps approximately 45% of ad revenue.",
  },
  {
    q: "How much does a YouTuber with 1 million views make?",
    a: "A YouTuber with 1 million monthly views can earn anywhere from $500 to $15,000+ per month from ad revenue alone, depending on niche and audience geography. Finance creators in Tier 1 countries could earn $8,000–$15,000, while entertainment channels with a global audience might earn $700–$2,000 from the same view count.",
  },
  {
    q: "What is the difference between CPM and RPM on YouTube?",
    a: "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions. RPM (Revenue Per Mille) is what creators actually receive per 1,000 video views after YouTube takes its 45% cut and accounting for the monetized play rate. RPM is typically 30–60% lower than CPM.",
  },
  {
    q: "What is a good YouTube RPM?",
    a: "A good YouTube RPM depends on your niche. For most creators, $2–$5 RPM is average. Finance, investing, and business channels can achieve $8–$20 RPM, while gaming or entertainment channels typically see $1–$3 RPM. Tier 1 audience locations significantly boost RPM.",
  },
  {
    q: "How does audience location affect YouTube earnings?",
    a: "Audience location has a massive impact on YouTube earnings. Advertisers pay much more to reach viewers in the USA, UK, Canada, and Australia (Tier 1) than in developing markets. A channel with the same view count can earn 3–4x more revenue with a Tier 1 audience compared to a Tier 3 or Tier 4 audience.",
  },
  {
    q: "Can YouTubers earn money beyond ad revenue?",
    a: "Yes — most successful YouTubers earn the majority of their income outside of ads. Additional revenue streams include brand sponsorships ($20–$50 per 1,000 views), affiliate marketing commissions, channel memberships, merchandise sales, and digital products. Our calculator includes estimates for these income sources.",
  },
  {
    q: "Is this YouTube money calculator accurate?",
    a: "This calculator provides realistic estimates based on industry-standard CPM ranges, YouTube's 45% revenue share, typical monetized play rates, and geographic multipliers. Actual earnings vary based on your specific content, engagement rate, seasonal ad demand, and audience demographics. Use these figures as a planning guide rather than a guarantee.",
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
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Custom Tooltip for Chart ─────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl shadow-xl px-4 py-3 text-sm">
        <p className="font-bold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill }} className="font-semibold">
            {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouTubeMoneyCalculatorTool() {
  // ── Inputs ──
  const [views, setViews]             = useState(100000);
  const [nicheIdx, setNicheIdx]       = useState(0);
  const [geoIdx, setGeoIdx]           = useState(0);
  const [monetizedRate, setMonetizedRate] = useState(50);  // stored as integer 30–80
  const [cpmOverrideStr, setCpmOverrideStr] = useState("");

  // Extra income toggles
  const [sponsorsPerMonth, setSponsorsPerMonth] = useState(0);
  const [sponsorRate, setSponsorRate]           = useState(30);  // $/1000 views
  const [affiliateRate, setAffiliateRate]       = useState(0);   // % of ad earnings
  const [membershipsEnabled, setMembershipsEnabled] = useState(false);
  const [subscribers, setSubscribers]           = useState(10000);

  const [showExtras, setShowExtras] = useState(false);
  const [result, setResult]         = useState<EarningsResult | null>(null);

  // FAQ schema
  useEffect(() => {
    const id = "faq-schema-yt-money-calc";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // Live recalculate on any input change
  useEffect(() => {
    const cpmOverride = cpmOverrideStr !== "" && !isNaN(Number(cpmOverrideStr))
      ? Number(cpmOverrideStr)
      : null;
    setResult(calculate(
      views, nicheIdx, geoIdx,
      monetizedRate / 100,
      cpmOverride,
      sponsorsPerMonth, sponsorRate / 1000,
      affiliateRate,
      membershipsEnabled, subscribers,
    ));
  }, [views, nicheIdx, geoIdx, monetizedRate, cpmOverrideStr, sponsorsPerMonth, sponsorRate, affiliateRate, membershipsEnabled, subscribers]);

  const chartData = result ? [
    { name: "Ad Revenue",   value: result.adMonthlyAvg,       fill: "#7c3aed" },
    { name: "Sponsorships", value: result.sponsorshipMonthly, fill: "#06b6d4" },
    { name: "Affiliate",    value: result.affiliateMonthly,   fill: "#10b981" },
    { name: "Memberships",  value: result.membershipMonthly,  fill: "#f59e0b" },
  ].filter(d => d.value > 0) : [];

  const formatViews = (v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : String(v);

  return (
    <>
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-6 sm:p-8 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold font-display text-foreground mb-1">
              Estimate Your YouTube Channel Earnings
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Adjust the inputs below to get a realistic estimate of your YouTube ad revenue, sponsorship income, and total creator earnings. Updates live as you type.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="text-center px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20">
              <div className="text-xs text-muted-foreground font-medium">Industry</div>
              <div className="font-extrabold text-primary text-lg">RPM</div>
              <div className="text-xs text-muted-foreground">$0.5 – $40</div>
            </div>
            <div className="text-center px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20">
              <div className="text-xs text-muted-foreground font-medium">YT Cut</div>
              <div className="font-extrabold text-primary text-lg">45%</div>
              <div className="text-xs text-muted-foreground">revenue share</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Grid: Inputs + Results ──────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Left: Inputs ────────────────── */}
        <Card className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border-border space-y-6">
          <h3 className="font-bold text-lg font-display flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" /> Calculator Inputs
          </h3>

          {/* Monthly Views */}
          <SliderInput
            label="Monthly Views"
            value={views}
            min={1000}
            max={10_000_000}
            step={1000}
            onChange={setViews}
            format={formatViews}
          />

          {/* Niche */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-primary" /> Channel Niche
            </label>
            <select
              value={nicheIdx}
              onChange={e => setNicheIdx(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-border bg-muted/50 text-foreground text-sm font-medium px-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {NICHES.map((n, i) => (
                <option key={i} value={i}>{n.label} — CPM ${n.cpmLow}–${n.cpmHigh}</option>
              ))}
            </select>
          </div>

          {/* Geo */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary" /> Audience Location
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GEO_TIERS.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGeoIdx(i)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all leading-tight ${
                    geoIdx === i
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <div>{g.label} <span className="font-normal opacity-70">×{g.multiplier}</span></div>
                  <div className={`mt-0.5 font-normal truncate ${geoIdx === i ? "opacity-80" : "opacity-60"}`}>{g.sublabel}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Monetized Play Rate */}
          <SliderInput
            label="Monetized Play Rate"
            value={monetizedRate}
            min={30}
            max={80}
            step={1}
            onChange={setMonetizedRate}
            format={v => `${v}%`}
          />

          {/* CPM Override */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground tracking-wide uppercase">
              CPM Override <span className="text-muted-foreground font-normal normal-case">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <input
                type="number"
                value={cpmOverrideStr}
                onChange={e => setCpmOverrideStr(e.target.value)}
                placeholder={`Auto (${NICHES[nicheIdx].cpmLow}–${NICHES[nicheIdx].cpmHigh})`}
                className="w-full h-11 rounded-xl border border-border bg-muted/50 text-foreground text-sm pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                min={0.1}
              />
            </div>
          </div>

          {/* Extra Income Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowExtras(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 border border-border hover:border-primary/40 transition-all text-sm font-semibold text-foreground"
            >
              <span className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-primary" /> Additional Income Sources
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showExtras ? "rotate-180" : ""}`} />
            </button>

            {showExtras && (
              <div className="mt-3 space-y-5 px-1">
                {/* Subscribers (for memberships) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">Subscribers</label>
                  <input
                    type="number"
                    value={subscribers}
                    onChange={e => setSubscribers(Math.max(0, Number(e.target.value)))}
                    className="w-full h-10 rounded-xl border border-border bg-muted/50 text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    min={0}
                  />
                </div>

                {/* Sponsorships */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-500" /> Sponsorships per Month
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map(n => (
                      <button key={n} type="button" onClick={() => setSponsorsPerMonth(n)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          sponsorsPerMonth === n
                            ? "bg-cyan-500 text-white border-cyan-500"
                            : "bg-muted/60 text-muted-foreground border-border hover:border-cyan-400 hover:text-foreground"
                        }`}
                      >{n === 0 ? "None" : n}</button>
                    ))}
                  </div>
                  {sponsorsPerMonth > 0 && (
                    <SliderInput
                      label="Rate ($ per 1K views)"
                      value={sponsorRate}
                      min={10} max={100} step={5}
                      onChange={setSponsorRate}
                      format={v => `$${v}`}
                    />
                  )}
                </div>

                {/* Affiliate */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-green-500" /> Affiliate Conversion Rate
                  </label>
                  <div className="flex gap-2">
                    {[0, 5, 10, 20, 30].map(n => (
                      <button key={n} type="button" onClick={() => setAffiliateRate(n)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          affiliateRate === n
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-muted/60 text-muted-foreground border-border hover:border-green-400 hover:text-foreground"
                        }`}
                      >{n === 0 ? "Off" : `${n}%`}</button>
                    ))}
                  </div>
                </div>

                {/* Memberships */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 border border-border">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-amber-500" /> Channel Memberships
                  </label>
                  <button
                    type="button"
                    onClick={() => setMembershipsEnabled(v => !v)}
                    className={`w-11 h-6 rounded-full border transition-all ${
                      membershipsEnabled ? "bg-amber-500 border-amber-500" : "bg-muted border-border"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm mx-1 transition-transform ${membershipsEnabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Right: Results ────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {result && (
            <>
              {/* RPM Banner */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Low RPM",  value: result.rpmLow,  color: "text-blue-600 dark:text-blue-400" },
                  { label: "Avg RPM",  value: result.rpmAvg,  color: "text-primary" },
                  { label: "High RPM", value: result.rpmHigh, color: "text-green-600 dark:text-green-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center px-3 py-4 rounded-2xl bg-muted/40 border border-border">
                    <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
                    <div className={`text-xl font-extrabold ${color}`}>${value.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">per 1K views</div>
                  </div>
                ))}
              </div>

              {/* Monthly Ad Revenue */}
              <Card className="p-5 sm:p-6 rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4 text-primary" /> Monthly Ad Revenue
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-display text-foreground tracking-tight">
                  <AnimatedMoney value={result.adMonthlyLow} />
                  <span className="text-muted-foreground font-normal mx-2">–</span>
                  <AnimatedMoney value={result.adMonthlyHigh} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Low",  val: result.adMonthlyLow },
                    { label: "Avg",  val: result.adMonthlyAvg },
                    { label: "High", val: result.adMonthlyHigh },
                  ].map(({ label, val }) => (
                    <div key={label} className="rounded-xl bg-muted/50 border border-border py-2">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="font-bold text-sm text-foreground">{fmt(val)}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Yearly + Total Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <StatCard
                  label="Yearly Ad Revenue"
                  low={result.adYearlyLow}
                  high={result.adYearlyHigh}
                  icon={<TrendingUp className="w-4 h-4" />}
                  accent="border-border bg-card text-foreground"
                />
                <StatCard
                  label="Total Monthly (All Sources)"
                  low={result.totalMonthlyLow}
                  high={result.totalMonthlyHigh}
                  icon={<BadgeDollarSign className="w-4 h-4" />}
                  accent="border-primary/30 bg-primary/5 text-foreground"
                />
                <StatCard
                  label="Total Yearly Estimate"
                  low={result.totalYearlyLow}
                  high={result.totalYearlyHigh}
                  icon={<DollarSign className="w-4 h-4" />}
                  accent="border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100"
                />
                <div className="rounded-2xl border border-border bg-muted/40 p-5 flex flex-col gap-2">
                  <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Breakdown
                  </div>
                  {[
                    { label: "Ad Revenue",   value: result.adMonthlyAvg,       color: "bg-primary" },
                    { label: "Sponsorships", value: result.sponsorshipMonthly,  color: "bg-cyan-500" },
                    { label: "Affiliate",    value: result.affiliateMonthly,    color: "bg-green-500" },
                    { label: "Memberships",  value: result.membershipMonthly,   color: "bg-amber-500" },
                  ].map(({ label, value, color }) => {
                    const total = result.adMonthlyAvg + result.sponsorshipMonthly + result.affiliateMonthly + result.membershipMonthly;
                    const pct = total > 0 ? (value / total) * 100 : 0;
                    return (
                      <div key={label} className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground font-medium">{label}</span>
                          <span className="font-bold text-foreground">{fmt(value)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue Chart */}
              {chartData.length > 0 && (
                <Card className="p-5 sm:p-6 rounded-3xl border-border">
                  <h3 className="font-bold text-base font-display mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Monthly Revenue Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} barSize={40} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", radius: 8 }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center px-2 leading-relaxed">
                These are estimates based on industry CPM ranges and YouTube's 45% revenue share. Actual earnings vary by content, engagement, and seasonality. Use as a planning guide only.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Money Calculator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Monthly Views", desc: "Use the slider to set your current or projected monthly video views. You can also type a custom number. The calculator updates instantly." },
            { step: 2, title: "Select Your Niche", desc: "Choose the category that best matches your content. Each niche has a realistic CPM range based on what advertisers actually pay — Finance and Business channels have the highest CPM." },
            { step: 3, title: "Choose Your Audience Location", desc: "Your audience's geography significantly affects earnings. Tier 1 countries (USA, UK, etc.) generate up to 4× more ad revenue than Tier 4 markets." },
            { step: 4, title: "Add Extra Income Sources", desc: "Expand the 'Additional Income Sources' panel to include sponsorship deals, affiliate commissions, and channel memberships for a full creator income picture." },
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
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Earnings Calculator</h2>
        </div>
        <div className="space-y-7">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How This YouTube Money Calculator Works
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This YouTube CPM calculator uses realistic industry data to estimate creator earnings. It calculates RPM (Revenue per 1,000 views) by combining your channel's niche CPM range, audience geographic multiplier, and monetized play rate — then applies YouTube's standard 45% revenue share. The result is a low, average, and high monthly earnings range that reflects real-world creator income rather than inflated advertiser-side CPM figures.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why RPM Matters More Than CPM
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Most YouTube earnings calculators show CPM — what advertisers pay — which is much higher than what creators actually receive. Our calculator uses RPM (what creators earn after YouTube's cut and accounting for non-monetized plays), giving you a far more accurate estimate of your real YouTube income. Finance and business creators in Tier 1 countries can achieve $8–$20 RPM, while gaming or entertainment channels typically see $1–$3 RPM.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This Tool Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Niche-specific CPM ranges based on real advertiser data",
                "4-tier geographic multiplier for audience location",
                "RPM calculation with YouTube's 45% revenue share",
                "Sponsorship income estimates ($20–$100 per 1K views)",
                "Affiliate marketing revenue projection",
                "Channel membership income estimator",
                "Monthly and yearly earnings with low/average/high ranges",
                "Live interactive bar chart revenue breakdown",
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

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="mt-4">
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
    </>
  );
}
