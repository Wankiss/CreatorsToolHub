import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Hash, ChevronDown,
  ListChecks, Info, Shield, ArrowUpRight, Zap, TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok Hashtag Generator?",
    a: "A TikTok Hashtag Generator is an AI-powered tool that automatically creates a strategic set of hashtags for your TikTok videos based on your content topic, niche, and video style. Instead of guessing which tags to use, the generator analyzes your input and produces a tiered mix of primary niche hashtags, broader secondary hashtags, trending format hashtags, and long-tail search hashtags — all calibrated to maximize your video's reach across both the For You Page algorithm and TikTok Search.",
  },
  {
    q: "How many hashtags should I use on TikTok?",
    a: "Current best practice in 2026 is to use between 3 and 7 hashtags per video. TikTok's creator guidance and community benchmarking consistently point to focused, relevant hashtag sets over mass-hashtag approaches — using 15+ hashtags can dilute the algorithm's understanding of your content category and make your caption feel cluttered without a meaningful reach benefit. A targeted set of 5–7 tags — mixing one or two broad niche hashtags, two or three mid-range topic hashtags, and one or two long-tail search hashtags — gives the algorithm clear categorization signals while keeping your caption readable. Our generator is built around this tiered approach for every set it produces.",
  },
  {
    q: "Do TikTok hashtags still work in 2026?",
    a: "Yes — TikTok hashtags are more important in 2026 than they were in previous years, but their role has evolved. TikTok now functions as both a social platform and a search engine, with a significant percentage of younger users using TikTok Search instead of Google to find recommendations, tutorials, and reviews. Hashtags serve two distinct purposes: (1) they help TikTok's algorithm categorize your video during the initial distribution wave, and (2) they make your content indexable in TikTok Search for direct discovery. Niche-specific hashtags are particularly effective for the second purpose, which is why our generator includes a dedicated long-tail hashtag tier optimized for TikTok's search behavior.",
  },
  {
    q: "Should I use #FYP or #ForYouPage on TikTok?",
    a: "Using #FYP or #ForYouPage does not meaningfully increase your chances of reaching the For You Page. These tags are used by hundreds of millions of videos, which means they provide virtually no targeting signal to TikTok's algorithm. The algorithm places videos on the FYP based on engagement signals — watch time, replays, comments, shares, and profile clicks — not on whether you used a generic viral hashtag. Your time is better spent on niche-specific primary hashtags that tell the algorithm exactly what your content is about and who should see it. Our generator intentionally excludes mass-market hashtags like #FYP in favor of tags with real targeting value.",
  },
  {
    q: "What are long-tail hashtags on TikTok and why do they matter?",
    a: "Long-tail hashtags on TikTok are specific, multi-word tags that describe exactly what your video is about — for example, #budgetmealprep or #beginneryogaforflexibility rather than just #food or #yoga. They matter because TikTok Search has grown substantially as a discovery channel: an Adobe 2022 survey found that 40% of Gen Z users prefer TikTok or Instagram over Google for everyday searches including tutorials, reviews, and how-to content. Long-tail hashtags match the exact phrases these users type into TikTok Search, making your videos discoverable to high-intent audiences actively looking for your specific content. The competition on long-tail hashtags is also much lower than on broad tags, which means smaller and newer accounts can realistically appear in search results for them.",
  },
  {
    q: "What is the difference between primary, secondary, and trending hashtags?",
    a: "Our AI TikTok Hashtag Generator uses a four-tier strategy: Primary hashtags (5–8 niche-specific tags) are the most important — they signal exactly what your content is about and who should see it. These are your core targeting tags. Secondary hashtags (8–12 broader tags) extend your reach to related audiences without diluting the algorithm's understanding of your content. Trending hashtags are format-specific tags (#pov, #storytime, #tutorial) that align your video with high-performing content styles the algorithm currently favors. Long-tail hashtags are precise, search-optimized tags that make your video discoverable through TikTok Search months or years after posting. Using all four tiers together creates a complete discoverability system rather than relying on a single tag type.",
  },
  {
    q: "How do TikTok hashtags affect the For You Page algorithm?",
    a: "TikTok's algorithm uses hashtags as one of several signals during the initial distribution phase of a new video. According to TikTok's Newsroom documentation ('How TikTok recommends videos for you'), the system evaluates video information — including captions and hashtags — alongside user interaction signals to categorize and route content to relevant audiences. When you post, TikTok shows your video to a small initial audience and watches how they respond. If watch time, completion rate, and engagement are strong, the video gets pushed to a broader audience. Niche-specific hashtags help TikTok route your video to users already engaging with your content category — increasing the likelihood of strong early signals that drive wider distribution. Without relevant hashtags, TikTok has to infer your content category from video analysis alone, which can slow or limit initial distribution.",
  },
  {
    q: "How do I find trending TikTok hashtags for my niche?",
    a: "The fastest way is to use an AI TikTok hashtag generator like this one — enter your topic and niche, and the AI instantly surfaces relevant trending hashtags calibrated to your content type. You can also find trending niche hashtags by: (1) searching your niche topic in TikTok Search and noting the auto-suggested hashtags, (2) looking at the hashtags used by top-performing creators in your niche, (3) checking TikTok's Discover or Trending tab for format-specific trending tags, and (4) using TikTok's Creative Center to see hashtag view counts and growth trends. The advantage of our generator is that it combines all of these approaches into a single output, saving you 20–30 minutes of manual research per video.",
  },
  {
    q: "Should I put hashtags in the caption or comments on TikTok?",
    a: "Put your hashtags in the caption, not the comments. TikTok's official recommendation is to include hashtags in your caption as part of your video's metadata — captions are read by the algorithm as video information signals used for classification and audience matching (TikTok Newsroom). The caption limit on TikTok is 2,200 characters, which is more than enough for a strong opening hook or description plus 5–7 targeted hashtags. A good caption structure is: attention-grabbing opening line or question, brief description or CTA, then your hashtag set at the end. Integrating hashtags naturally at the end of your caption — rather than as a separate line — is the most common approach among high-performing creators in 2026.",
  },
  {
    q: "How do I use TikTok's Creative Center to research hashtags?",
    a: "TikTok's Creative Center is TikTok's own free hashtag research tool, available at ads.tiktok.com/business/creativecenter/hashtag/home — no advertising account required to browse hashtag data. To use it: go to TikTok Creative Center → Inspiration → Hashtag, then search your niche keyword or content topic. The tool shows each hashtag's total view count, 7-day and 30-day trend trajectory, related hashtags, and the regional audience breakdown using that tag. Filter by country to see which hashtags are trending specifically in your target audience's location — a hashtag trending in the US may have entirely different competition levels than the same tag in the UK or Australia. The Creative Center is the most authoritative source of hashtag trend data available because it's TikTok's own platform — use it to validate and supplement the hashtags generated by this tool before posting.",
  },
  {
    q: "Are these TikTok hashtag tools free to use?",
    a: "Yes — this AI TikTok Hashtag Generator is 100% free with no account required, no signup, and no usage limits. Enter your video topic and niche, click Generate, and get a complete four-tier hashtag strategy instantly. You can generate as many hashtag sets as you need for different videos, niches, and content styles without any restrictions. The tool is powered by AI and updates its hashtag database continuously to reflect current TikTok trends and search behavior patterns.",
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

// ─── Niche & Content-Type Data ────────────────────────────────────────────────

const NICHES = [
  "Fitness & Health", "Beauty & Makeup", "Business & Finance", "Food & Cooking",
  "Fashion & Style", "Gaming", "Travel", "Education & Learning",
  "Comedy & Entertainment", "Productivity & AI", "Pets & Animals", "Parenting",
  "Music & Dance", "DIY & Crafts",
];

const CONTENT_TYPES = [
  { value: "tutorial", label: "Tutorial / How-To" },
  { value: "storytelling", label: "Storytelling" },
  { value: "pov", label: "POV" },
  { value: "tips", label: "Tips & Hacks" },
  { value: "review", label: "Review / Reaction" },
  { value: "vlog", label: "Vlog / Day-in-Life" },
  { value: "challenge", label: "Challenge / Trend" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function TikTokHashtagGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("Fitness & Health");
  const [contentType, setContentType] = useState("tutorial");
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { outputs, loading, error, run } = useAiTool("tiktok-hashtag-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-tiktok-hashtag";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic or keyword.", variant: "destructive" });
      return;
    }
    run({ topic, niche, contentType });
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(outputs.join(" "));
    setCopiedAll(true);
    toast({ title: "All hashtags copied!" });
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <>
      {/* ── Tool Card ──────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Topic input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Video Topic or Keyword *
            </label>
            <Input
              placeholder="e.g. how to lose belly fat, AI tools for productivity, beginner makeup tutorial..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              className="rounded-xl h-11 text-sm"
            />
          </div>

          {/* Niche + Content Type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Your TikTok Niche</label>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Content Style</label>
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {CONTENT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
              </select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          >
            {loading
              ? <><Loader2 className="animate-spin w-5 h-5" /> Generating with AI...</>
              : <><Sparkles className="w-5 h-5" /> Generate Hashtags</>}
          </Button>

          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────── */}
      {outputs.length > 0 && (
        <div className="mt-5 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> Generated Hashtags
              </h3>
              <Button variant="outline" size="sm" onClick={copyAll} className="rounded-xl gap-1.5">
                {copiedAll ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {outputs.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => copyItem(tag, i)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm bg-muted/30 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {tag}
                  {copied === i
                    ? <Check className="w-3 h-3 text-green-500" />
                    : <Copy className="w-3 h-3 text-muted-foreground" />}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── How to Use ─────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Hashtag Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Video Topic",
              desc: "Type your video topic or main keyword — for example, 'how to lose belly fat,' 'AI tools for productivity,' or 'beginner makeup tutorial.' This is the foundation the AI uses to build topic-specific hashtags tailored to your exact content.",
            },
            {
              step: 2,
              title: "Select Your Niche and Content Type",
              desc: "Choose your TikTok niche (fitness, business, beauty, etc.) and content style (tutorial, storytelling, POV). These inputs shape the niche-specific primary hashtags and the trending format hashtags included in your generated set.",
            },
            {
              step: 3,
              title: "Generate Your Hashtag Set",
              desc: "Click Generate and the AI instantly creates a hashtag strategy tailored to your video topic and niche — covering primary niche tags, broader reach tags, trending format tags, and long-tail search hashtags optimized for TikTok's growing search feature.",
            },
            {
              step: 4,
              title: "Copy and Paste to TikTok",
              desc: "Click 'Copy All' to grab your complete hashtag set in one click, or copy individual hashtags by clicking them. Paste directly into your TikTok caption before publishing. For best results, combine your hashtags with a strong opening hook in your caption.",
            },
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

      {/* ── About ──────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Hashtag Generator</h2>
        </div>
        <div className="space-y-8">

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This AI TikTok Hashtag Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TikTok's Newsroom documentation confirms that "video information" — including captions, sounds, and hashtags — is one of the three main signal categories the algorithm uses to categorize and route content to relevant audiences. On a platform with 1.7 billion monthly active users as of 2024 (Statista), hashtags directly affect which of those users your video reaches during the critical initial distribution phase, making them one of the few variables a creator can control before posting.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free AI TikTok Hashtag Generator builds a multi-tier hashtag strategy for your video
              using niche-specific data, content-type signals, and search behavior patterns. The tiers
              work together as a complete discoverability system: Primary hashtags signal to TikTok's
              algorithm exactly what your content is about and who should see it. Secondary hashtags
              extend your reach to related audiences without diluting relevance. Trending hashtags align
              your video with high-performing content styles the algorithm currently favors. Long-tail
              hashtags are optimized for TikTok Search — the fastest-growing discovery channel on the
              platform — making your content findable for months after posting.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The generator is powered by AI and takes into account your specific video topic, niche,
              and content style to produce hashtags that are relevant to your exact video rather than
              generic tags anyone in your category might use. This specificity is what separates a
              hashtag strategy that drives real discoverability from one that blends into the noise.
              Pair your hashtags with a strong{" "}
              <Link href="/tools/tiktok-hook-generator" className="text-primary hover:underline font-medium">
                TikTok hook
              </Link>{" "}
              and an engaging{" "}
              <Link href="/tools/tiktok-caption-generator" className="text-primary hover:underline font-medium">
                caption
              </Link>{" "}
              to maximize reach from every video you post.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why TikTok Hashtags Matter for Your Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              An Adobe 2022 survey found that 40% of Gen Z users now prefer TikTok or Instagram over Google for everyday searches — tutorials, product recommendations, how-to content, and local discovery. This behavioral shift means TikTok hashtags in 2026 serve a dual function: helping the algorithm categorize your video for For You Page distribution, and indexing your content in TikTok Search for long-term organic discovery.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A video posted with well-chosen niche hashtags gets categorized more precisely during the algorithm's initial distribution phase. According to TikTok's published recommendation documentation (TikTok Newsroom), the system uses video information — including hashtags — to match content to the audiences most likely to engage with it. That early audience match directly determines whether your video earns the completion rate and engagement signals needed for broader distribution. Without relevant hashtags, TikTok infers your content category from video analysis alone, which can slow or limit how precisely it routes your content.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Long-tail hashtags serve the search function specifically. Viewers who find your video through a TikTok search query are actively looking for your exact content — they arrive with intent rather than passive scroll behavior. This means they tend to watch more of the video, engage at higher rates, and are more likely to follow your account than a viewer who encountered the same video passively on the FYP. Combining FYP-targeted primary hashtags with search-optimized long-tail hashtags gives every video both immediate distribution reach and sustained long-term discoverability.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How to Research and Validate Hashtags Using TikTok's Own Tools
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TikTok's Creative Center (ads.tiktok.com/business/creativecenter/hashtag/home) is TikTok's own free hashtag research platform — no advertising account required. It shows real-time view counts, 7-day and 30-day trend trajectories, related hashtags, and regional audience data for any hashtag you search. It's the most authoritative source of TikTok hashtag data available because it draws directly from TikTok's own platform analytics rather than third-party estimates.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use it effectively: navigate to TikTok Creative Center → Inspiration → Hashtag, then search your niche keyword. Filter results by region to see which hashtags are actually trending in your target audience's country — a hashtag with massive views globally may have saturated competition in your specific market, while a region-specific tag might have strong engagement with far less competition. Check the 7-day trend line: a hashtag with rising view counts over the past week is a better target than one with a flat or declining curve regardless of total view count.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The workflow that produces the best hashtag sets combines both tools: use this AI generator to get a complete tiered strategy instantly, then cross-check your top 3–5 hashtags in TikTok Creative Center to confirm they're trending positively in your region before you post. This takes under two minutes per video and gives you a strategy built on both AI-powered relevance matching and real-time TikTok trend data.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Sources:</strong>{" "}
                <a href="https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TikTok Newsroom — How TikTok Recommends Videos (video information signals)</a>{" · "}
                <a href="https://ads.tiktok.com/business/creativecenter/hashtag/home" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TikTok Creative Center — Official Hashtag Trend Research Tool</a>{" · "}
                <a href="https://business.adobe.com/blog/perspectives/adobe-2022-future-of-creativity-study" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Adobe 2022 — 40% of Gen Z Prefer TikTok/Instagram Over Google for Search</a>{" · "}
                <a href="https://www.statista.com/statistics/1327116/number-of-monthly-active-tiktok-users-worldwide/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Statista 2024 — TikTok Monthly Active Users (1.7B)</a>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This TikTok Hashtag Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "14 niches with niche-specific hashtag databases tailored to each content category",
                "Multi-tier strategy: Primary, Secondary, Trending, and Long-Tail hashtags per video",
                "AI-powered generation — hashtags are tailored to your exact topic, not just your niche",
                "Content-type matching: hashtags adjusted for tutorial, storytelling, POV, and more",
                "Copy All gives you the complete set in one click — paste directly into TikTok",
                "Long-tail hashtags optimized for TikTok Search — the fastest-growing discovery channel",
                "Topic-derived hashtags generated from your exact video keyword for precision targeting",
                "Format-aware trending hashtags that align your video with high-performing content styles",
                "Covers every major creator niche — fitness, beauty, business, food, gaming, and more",
                "100% free — no account, no signup, no limits — generate unlimited hashtag sets",
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

      {/* ── Related TikTok Tools ───────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related TikTok Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "TikTok Caption Generator", path: "/tools/tiktok-caption-generator", desc: "Write captions that pair perfectly with your hashtag strategy to maximize reach and drive more comments." },
            { name: "TikTok Hook Generator", path: "/tools/tiktok-hook-generator", desc: "Craft opening lines that stop the scroll — combine great hooks with targeted hashtags for explosive growth." },
            { name: "TikTok Bio Generator", path: "/tools/tiktok-bio-generator", desc: "Build a compelling profile that converts visitors who discover you through your hashtagged content." },
            { name: "TikTok Viral Idea Generator", path: "/tools/tiktok-viral-idea-generator", desc: "Get trending content concepts to create videos worth hashtagging — viral ideas that deserve viral tags." },
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

      {/* ── FAQ ────────────────────────────────────────────────── */}
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
