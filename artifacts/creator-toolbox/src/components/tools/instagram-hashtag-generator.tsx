import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Hash, ChevronDown,
  Lightbulb, ListChecks, ArrowUpRight, Zap, TrendingUp, BarChart2,
} from "lucide-react";
import { Link } from "wouter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NICHES = [
  "Fitness", "Beauty", "Business", "Finance", "Tech & AI",
  "Education", "Food", "Travel", "Lifestyle", "Fashion",
  "Relationships", "Health", "Entertainment", "Coaching", "Photography",
];

const CONTENT_TYPES = [
  { value: "reel",     label: "Reel",     desc: "More broad discovery tags" },
  { value: "carousel", label: "Carousel", desc: "More micro niche tags" },
  { value: "static",   label: "Static",   desc: "Balanced tier mix" },
];

const GOALS = [
  { value: "reach",       label: "Reach",       desc: "Impressions & visibility" },
  { value: "engagement",  label: "Engagement",  desc: "Comments & saves" },
  { value: "growth",      label: "Growth",      desc: "New followers" },
  { value: "sales",       label: "Sales",       desc: "Buyer-intent tags" },
];

const TIER_CONFIG = [
  { label: "Broad",     count: 5,  start: 0,  color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400",   badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400",   desc: "500K–5M+ posts · Wide discovery, brief visibility window" },
  { label: "Mid-Range", count: 10, start: 5,  color: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400", badge: "bg-purple-500/15 text-purple-700 dark:text-purple-400", desc: "50K–500K posts · Sustained reach, strong ranking potential" },
  { label: "Micro",     count: 15, start: 15, color: "bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-400",   badge: "bg-pink-500/15 text-pink-700 dark:text-pink-400",   desc: "1K–50K posts · Niche community, high engagement & ranking" },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How many hashtags should I use on Instagram in 2026?",
    a: "Instagram officially allows up to 30 hashtags per post. Current best practice for most niches is 15–25 hashtags — enough to capture multiple discovery channels without triggering spam signals. For Reels specifically, 5–10 highly relevant hashtags tend to outperform using all 30, because the Reels algorithm prioritises content signals (audio, visual, engagement) over hashtag volume. For carousels and static posts, using 20–30 hashtags in the tiered broad/mid/micro distribution typically delivers the best balance of reach and ranking potential. Our generator produces all 30 per set so you have the full pool to work with — you can always use a subset of 15–25 for each post.",
  },
  {
    q: "What is a tiered Instagram hashtag strategy?",
    a: "A tiered hashtag strategy means deliberately mixing three categories of hashtags in fixed proportions: Broad (5 tags, 500K+ posts), Mid-Range (10 tags, 50K–500K posts), and Micro (15 tags, 1K–50K posts). Each tier serves a different function: Broad tags create a visibility burst by placing your content in high-volume feeds for a short window. Mid-range tags provide sustained discoverability over hours or days in moderately competitive feeds. Micro tags allow you to rank on the first page of a niche hashtag feed and stay there for days or weeks, reaching the most engaged, niche-specific audience. The 5+10+15 distribution captures all three effects simultaneously — this is the formula used by Instagram growth consultants managing accounts with hundreds of thousands of followers.",
  },
  {
    q: "What is the difference between broad, mid-range, and micro hashtags?",
    a: "Broad hashtags (500K–5M+ posts, e.g. #fitness, #travel) have enormous reach but intense competition — your post typically appears in the feed for minutes before being pushed down by newer content. Mid-range hashtags (50K–500K posts, e.g. #fitnessmotivation2026, #budgettravel) are the highest-leverage tier: enough competition to validate relevance, but small enough that a post with strong early engagement can rank for hours or days. Micro hashtags (1K–50K posts, e.g. #kettlebellmomworkout, #solotravel europe) are the most valuable for community building — they reach a smaller but hyper-relevant audience, generate higher engagement rates per impression, and allow your post to rank on the first page for days to weeks. The mathematical advantage of combining all three is simultaneous reach across different audience segments with different discovery behaviors.",
  },
  {
    q: "Should I use the same hashtags on every Instagram post?",
    a: "No — using identical hashtags on consecutive posts is one of the most common Instagram growth mistakes. Instagram's spam detection system monitors repetitive behavior patterns, and accounts that copy-paste the same 20–30 hashtags on every post are flagged as potentially inauthentic, which reduces post distribution. Beyond the spam risk, using the same hashtags on every post means you're only ever testing one hashtag set, which gives you no data on which tags are actually driving reach and engagement. The correct approach is to rotate between 3 distinct sets — using Set A on your first post, Set B on your second, Set C on your third — which both avoids the repetition penalty and gives you real performance data to identify which set works best for your account.",
  },
  {
    q: "Do hashtags still work on Instagram in 2026?",
    a: "Yes — hashtags remain one of Instagram's primary content classification and discovery mechanisms, but their function has shifted. In 2026, hashtags work differently across content formats: for Reels, Instagram's algorithm uses content signals (audio, visual elements, caption keywords) as the primary classification tool, with hashtags serving as secondary confirmation — meaning fewer, more precise hashtags outperform spraying 30 generic tags. For carousels and static posts, hashtag feeds remain a meaningful traffic channel, especially in the micro and mid-range tiers where well-performing posts can rank for extended periods. The creators who see the best hashtag ROI in 2026 are those using topic-specific, niche-appropriate tags rather than chasing trending or oversaturated broad tags.",
  },
  {
    q: "What are the best hashtags for Instagram Reels?",
    a: "For Instagram Reels, the optimal hashtag approach is 5–10 highly relevant tags weighted toward broad and mid-range rather than micro, because Reels distribution is driven by the algorithm's content classification rather than hashtag feed browsing. The most effective Reels hashtags are: (1) 2–3 broad niche-category tags that confirm your content type to the algorithm, (2) 3–5 mid-range tags with 50K–300K posts that are highly specific to your Reel's topic, and (3) 1–2 trending or seasonal tags that align with current platform activity. Avoid using all 30 hashtags on Reels — this can signal spam behavior and dilute the algorithm's ability to classify your content precisely. Our generator's Reel mode automatically weights the output toward broader and mid-range tags.",
  },
  {
    q: "What are the best hashtags for Instagram Carousels?",
    a: "Carousels are browse-and-save content where users spend 30–90 seconds swiping through slides — Instagram distributes carousels through both hashtag feeds and Explore, and they continue receiving saves for days after posting. This makes micro hashtags critically important for carousels: ranking on a niche hashtag feed means your carousel is discovered by users actively browsing that specific topic, who are predisposed to save valuable reference content. For carousels, aim for the full 25–30 hashtags with the complete 5+10+15 tiered distribution. The micro tier (15 hashtags) is your primary ranking vehicle — focus these on highly specific sub-topic terms that match exactly what your carousel teaches or shows. Our generator's Carousel mode automatically weights toward the micro tier.",
  },
  {
    q: "How do I find the right hashtags for my niche?",
    a: "The most reliable method for finding high-performing niche hashtags is a combination of: (1) Competitor research — browse the hashtags used by accounts in your niche with 10K–100K followers (not mega accounts, who use different strategies) and note which mid-range and micro tags appear consistently in their best-performing posts. (2) Hashtag feed analysis — search a candidate hashtag on Instagram and check whether the top posts in that feed have similar content quality and engagement to yours; if top posts have millions of likes, your post won't compete. (3) AI-powered generation using topic-specific inputs — this is what our tool does, converting your specific post topic and niche into camelCase, PascalCase, and long-tail hashtag variants that map to real Instagram communities. (4) Instagram's hashtag suggestion feature in the caption editor, which surfaces related tags based on your input.",
  },
  {
    q: "Should I put hashtags in the caption or the first comment on Instagram?",
    a: "Functionally, hashtags work identically whether placed in the caption or the first comment — Instagram confirmed this and tests have consistently shown no ranking difference between the two placements. The practical choice comes down to aesthetic preference and content strategy. Placing hashtags in the caption keeps everything in one place and is easier to manage, but it can make long captions feel cluttered. Placing hashtags in the first comment immediately after posting keeps your caption clean and focused on the content copy. If your caption strategy relies on a hook-body-CTA format where whitespace and clean copy matter (especially for carousels), first-comment hashtags are the better choice. If you want simplicity and speed, caption hashtags are equally effective and easier to manage at scale.",
  },
  {
    q: "Is this Instagram hashtag generator free?",
    a: "Yes — the Instagram Hashtag Generator is completely free with no account required, no signup, and no usage limits. Every generation produces 3 rotating sets of 30 hashtags each (90 unique hashtags total), distributed across the proven 5 Broad + 10 Mid-Range + 15 Micro tier structure. Use a different set on each post to avoid Instagram's repetition penalty and gather real performance data. Copy individual tiers (Broad, Mid, Micro) for testing specific hashtag strategies, or copy all 30 in one click for immediate use. Regenerate as many times as you need to find the perfect hashtag mix for your niche, topic, and content goals.",
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

// ─── Main component ───────────────────────────────────────────────────────────

type ActiveSet = "A" | "B" | "C";

export function InstagramHashtagGeneratorTool() {
  const [topic,       setTopic]       = useState("");
  const [niche,       setNiche]       = useState("Fitness");
  const [contentType, setContentType] = useState("static");
  const [goal,        setGoal]        = useState("reach");
  const [keywords,    setKeywords]    = useState("");
  const [activeSet,   setActiveSet]   = useState<ActiveSet>("A");
  const [copiedTier,  setCopiedTier]  = useState<string | null>(null);
  const [copiedTag,   setCopiedTag]   = useState<number | null>(null);

  const { outputs, loading, error, run } = useAiTool("instagram-hashtag-generator");
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = "faq-schema-ig-hashtag-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your post topic.", variant: "destructive" });
      return;
    }
    run({ topic, niche, contentType, goal, keywords });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
  };

  // Split outputs into 3 sets of 30
  const setA = outputs.slice(0,  30);
  const setB = outputs.slice(30, 60);
  const setC = outputs.slice(60, 90);
  const sets: Record<ActiveSet, string[]> = { A: setA, B: setB, C: setC };
  const currentSet = sets[activeSet];
  const hasResults = outputs.length >= 30;

  const copyTier = (tier: typeof TIER_CONFIG[0], label: string) => {
    const tags = currentSet.slice(tier.start, tier.start + tier.count);
    navigator.clipboard.writeText(tags.join(" "));
    setCopiedTier(label);
    toast({ title: `${label} hashtags copied!` });
    setTimeout(() => setCopiedTier(null), 2000);
  };

  const copyAll = (setKey: ActiveSet) => {
    navigator.clipboard.writeText(sets[setKey].join(" "));
    toast({ title: `Set ${setKey} — all 30 hashtags copied!` });
  };

  const copyTag = (tag: string, idx: number) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(idx);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="text-purple-500" size={22} />
              <h2 className="font-bold text-lg text-foreground">Instagram Hashtag Generator</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
              <Sparkles size={12} /> AI-Powered
            </span>
          </div>

          {/* Topic + Niche */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Post Topic *</label>
              <Input
                placeholder="e.g. weight loss tips for busy moms"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Be specific — better topic = better hashtags.</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Content Niche</label>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Content Type</label>
            <div className="grid grid-cols-3 gap-3">
              {CONTENT_TYPES.map(ct => (
                <button key={ct.value} type="button" onClick={() => setContentType(ct.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${contentType === ct.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <div className="font-bold text-sm">{ct.label}</div>
                  <div className="font-normal opacity-70 mt-0.5">{ct.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Goal</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GOALS.map(g => (
                <button key={g.value} type="button" onClick={() => setGoal(g.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${goal === g.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <div className="font-bold text-sm">{g.label}</div>
                  <div className="font-normal opacity-70 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Keywords <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full">Optional</span>
            </label>
            <Input
              placeholder="e.g. ketogenic, macro tracking, home workout..."
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              className="rounded-xl h-11 text-sm"
            />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>}

          <Button onClick={handleGenerate} disabled={loading} size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            {loading
              ? <><Loader2 className="animate-spin" size={18} /> Generating 3 hashtag sets…</>
              : <><Sparkles size={18} /> Generate 3 Hashtag Sets (90 Tags)</>}
          </Button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      {hasResults && (
        <div ref={resultsRef} className="mt-6 space-y-4 animate-in slide-in-from-bottom-4 duration-500">

          {/* Set tabs */}
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-0 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-foreground">Your Hashtag Sets</h3>
                <span className="text-xs text-muted-foreground">Rotate A → B → C across posts</span>
              </div>
              <div className="flex gap-1">
                {(["A", "B", "C"] as ActiveSet[]).map(s => (
                  <button key={s} onClick={() => setActiveSet(s)}
                    className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${activeSet === s ? "bg-background border border-b-background border-border text-foreground -mb-px relative z-10" : "text-muted-foreground hover:text-foreground"}`}>
                    Set {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Tier cards */}
              {TIER_CONFIG.map(tier => {
                const tags = currentSet.slice(tier.start, tier.start + tier.count);
                return (
                  <div key={tier.label} className={`rounded-2xl border p-4 ${tier.color}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${tier.badge}`}>
                          {tier.label} · {tier.count} tags
                        </span>
                        <p className="text-[11px] mt-1 opacity-70">{tier.desc}</p>
                      </div>
                      <button onClick={() => copyTier(tier, tier.label)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-background border border-border hover:border-primary/40 transition-colors text-foreground">
                        {copiedTier === tier.label ? <><Check size={12} className="text-green-500" />Copied</> : <><Copy size={12} />Copy {tier.label}</>}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag, i) => {
                        const globalIdx = (activeSet === "A" ? 0 : activeSet === "B" ? 30 : 60) + tier.start + i;
                        return (
                          <button key={i} onClick={() => copyTag(tag, globalIdx)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-border text-xs font-medium hover:border-primary/40 transition-colors text-foreground">
                            {tag}
                            {copiedTag === globalIdx ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-muted-foreground" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Copy all button */}
              <button onClick={() => copyAll(activeSet)}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">
                <Copy size={15} /> Copy all 30 hashtags from Set {activeSet}
              </button>
            </div>
          </div>

          {/* Rotation guide */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Hashtag Rotation Guide
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {(["A", "B", "C"] as ActiveSet[]).map(s => (
                <div key={s} className="rounded-xl bg-background border border-border p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Set {s}</div>
                  <div className="text-sm font-semibold text-foreground mb-2">{sets[s].length} hashtags</div>
                  <button onClick={() => copyAll(s)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mx-auto">
                    <Copy size={11} /> Copy Set {s}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use Set A on Post 1, Set B on Post 2, Set C on Post 3, then rotate back to Set A or regenerate for fresh variations.
              Rotating hashtag sets avoids Instagram's repetition penalty and lets you track which set drives the most reach.
            </p>
          </div>
        </div>
      )}

      {/* ── How to Use ────────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Hashtag Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Post Topic and Select Your Niche", desc: "Type your specific post topic — 'weight loss tips for busy moms' generates more targeted hashtags than 'fitness'. Then select your content niche so the generator applies the correct hashtag pools, keyword variations, and tier-appropriate tags for your category." },
            { step: 2, title: "Choose Content Type and Your Goal", desc: "Select Reel, Carousel, or Static Post — each content type adjusts the tier weighting. Reels get more broad discovery tags; carousels get more micro-niche tags. Then choose your goal: Reach (impressions), Engagement (comments and saves), Growth (follows), or Sales (buyer-intent tags)." },
            { step: 3, title: "Get 3 Rotating Sets — 30 Hashtags Each", desc: "Three distinct 30-hashtag sets are generated per click — Sets A, B, and C. Each contains 5 Broad, 10 Mid-Range, and 15 Micro hashtags. Use a different set on each post to avoid Instagram's repetition penalty and gather data on which sets drive the most reach and engagement." },
            { step: 4, title: "Copy Tiers Individually or All 30 at Once", desc: "Switch between Set A, B, and C using the tabs. Copy any individual tier (Broad, Mid, Micro) for testing specific hashtag strategies, or copy all 30 in one click. Use the Rotation Guide to prepare hashtag sets for multiple posts in advance." },
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

      {/* ── About ─────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Hash className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Hashtag Generator — The Tiered Strategy That Actually Grows Accounts</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why the 5 Broad + 10 Mid + 15 Micro Formula Works
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The tiered hashtag strategy generates more reach and engagement than random hashtag selection
              because it simultaneously targets three different audience segments with three different
              discovery behaviors. Broad hashtags with 500K+ posts function as visibility tools — they
              generate a brief burst of impressions from users browsing high-volume feeds, putting your
              content in front of a large general audience for seconds to minutes. Mid-range hashtags with
              50K–500K posts are the strategic core: competitive enough to validate relevance, but small
              enough that a post with strong early engagement can rank for hours or days. Micro hashtags
              with 1K–50K posts are the most valuable long-term asset — they reach a smaller but
              hyper-relevant audience who are actively searching that specific topic, generate higher
              engagement rates per impression, and allow your post to rank on the first page of that
              hashtag feed for days or even weeks.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The mathematical advantage is clear: a post using only broad hashtags gets brief impressions
              but rarely converts to follows or saves because the audience is too general. A post using
              only micro hashtags reaches a small but highly engaged niche — high conversion but low
              volume. The 5+10+15 distribution captures all three effects simultaneously, optimizing for
              impressions (broad), discoverability (mid), and community connection (micro). This is the
              same framework used by Instagram growth consultants managing accounts with hundreds of
              thousands of followers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The generator produces exactly 30 hashtags per set — historically the maximum Instagram
              allows. All 30 are provided so you can test different subset sizes and combinations
              systematically. Pair your hashtag strategy with a{" "}
              <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
                strong caption
              </Link>{" "}
              and an optimised{" "}
              <Link href="/tools/instagram-bio-generator" className="text-primary hover:underline font-medium">
                profile bio
              </Link>{" "}
              to convert the reach your hashtags generate into lasting followers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How Content Type and Goal Change Your Optimal Hashtag Mix
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram Reels are distributed primarily through the recommendation algorithm rather than
              hashtag feeds — this means broad and mid-range discovery tags matter more than micro
              hashtags for Reel reach. Reels benefit from 5–8 highly relevant hashtags rather than all
              30, because Instagram's algorithm for Reels uses content signals (audio, visual, caption)
              as primary classification — hashtags serve as secondary confirmation. For Reels, the broad
              tier tags signal content category to the algorithm, and mid-range tags confirm topic
              specificity.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Carousels are fundamentally different — they are browse-and-save content where users spend
              30–90 seconds swiping through each slide. The Instagram algorithm distributes carousels
              through both hashtag feeds and Explore, and carousels continue receiving saves for days
              after posting. This makes the micro hashtag tier critically important for carousels —
              ranking on a niche hashtag feed means your carousel is discovered by users actively browsing
              that specific topic, who are predisposed to save valuable reference content.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Goal selection adjusts which supplementary tags are added to each tier. Reach-optimized
              sets add broader discovery tags. Engagement-optimized sets add niche community tags.
              Growth-optimized sets add follow-oriented tags. Sales-optimized sets add buyer-intent
              hashtags used by people in a research or purchasing mindset. The goal adjustment is a
              secondary layer on top of the niche and topic matching — it fine-tunes each set's audience
              quality rather than changing the fundamental structure.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> The Hashtag Rotation System and Why It Matters
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Using identical hashtags on every post is one of the most common Instagram growth mistakes
              — and one that actively harms account performance over time. Instagram's spam detection
              system monitors repetitive behavior patterns, and accounts that use the same 20–30 hashtags
              on every consecutive post are flagged as potentially inauthentic, which reduces post
              distribution. The three sets generated by this tool are specifically designed to be
              non-overlapping — each pulls from different segments of the niche hashtag pool with
              different topic and keyword expansions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Use Set A on your first post, Set B on your second, Set C on your third, then either return
              to Set A or regenerate fresh sets. After 6–8 posts per set, regenerate to introduce new
              hashtag variations and keep the rotation fresh. Tracking which set delivers the most reach,
              saves, and profile visits in Instagram Insights gives you real data to identify which
              hashtag combinations resonate most with your audience — a compounding advantage that
              creators who copy-paste the same tags every time never develop.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" /> What This Instagram Hashtag Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "30 hashtags per set in the proven 5 Broad + 10 Mid-Range + 15 Micro tier distribution",
                "3 rotating sets (A, B, C) generated simultaneously — use a different set on each post",
                "4 goal types — Reach, Engagement, Growth, Sales — each adds goal-specific supplementary tags",
                "3 content type optimisations — Reel (broad-weighted), Carousel (micro-weighted), Static (balanced)",
                "15 supported niches with niche-specific hashtag pools and keyword expansions",
                "Topic-specific generation — your post topic converted into camelCase, PascalCase, and long-tail variants",
                "Keywords field — inject your specific niche terms into the micro tier for precise audience targeting",
                "Copy individual tiers (Broad, Mid, Micro) for testing — or copy all 30 hashtags at once",
                "Tier descriptions with usage guidance — post-volume range, visibility window, and best-use case",
                "Batch rotation guide — shows all 3 sets side by side with posting schedule for content batching",
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

      {/* ── Tips ──────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Use 15–25 of the 30 generated hashtags per post — using all 30 on every post can appear spammy; test different subset sizes to find your account's sweet spot.",
            "For Instagram Reels, use only 5–8 of the most relevant hashtags from the Broad and Mid tiers — the Reels algorithm classifies content primarily through visual and audio signals, not hashtag volume.",
            "Track performance in Instagram Insights → Content → Reach from Hashtags after each post — this tells you which set and which tier is driving the most discovery for your account.",
            "Rotate hashtag sets every post (A → B → C) to avoid Instagram's repetition penalty and to gather comparative performance data across different hashtag combinations.",
            "Add your own niche keywords in the keywords field — these get woven into the micro tier and make your hashtags more specific and more likely to rank in your exact content category.",
            "Use carousels with the full 30 hashtags — carousels have the longest discovery window of any Instagram format and benefit the most from a complete tiered hashtag stack.",
            "Regenerate sets every 3–4 weeks or when starting a new content series — fresh hashtag sets prevent staleness and expose your content to new corners of your niche community.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Tools ─────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related Instagram Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Write the captions that your hashtags will amplify — great copy combined with great tags maximizes every post." },
            { name: "Instagram Hook Generator",    path: "/tools/instagram-hook-generator",    desc: "Craft first-line hooks that stop the scroll and drive the engagement that powers your hashtag rankings." },
            { name: "Instagram Reel Idea Generator", path: "/tools/instagram-reel-idea-generator", desc: "Generate Reel concepts worth hashtagging — high-quality content + targeted hashtags = maximum organic reach." },
            { name: "Instagram Bio Generator",     path: "/tools/instagram-bio-generator",     desc: "Optimize your profile bio to convert the new followers your hashtagged posts attract to your page." },
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

      {/* ── FAQ ───────────────────────────────────────────────────── */}
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
