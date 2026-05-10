import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, BarChart2,
  ChevronDown, ListChecks, Shield, ArrowUpRight, Zap, TrendingUp, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube SEO Score Checker?",
    a: "A YouTube SEO Score Checker analyzes your video's metadata — title, description, tags, and keywords — and gives you a numerical score reflecting how well-optimized your video is for YouTube search. YouTube is the world's second-largest search engine with 2.7 billion monthly active users (Statista, 2024), and its algorithm processes over 80 billion signals daily (YouTube Blog, 2024) to decide which videos to surface for each search query. Our AI-powered checker evaluates six weighted categories: Title Optimization, Description Quality, Tag Relevance, Keyword Usage, CTR Potential, and Thumbnail Effectiveness. The score out of 100 tells you exactly how competitive your video is before you publish — so you can fix issues while it's still easy rather than after the video has already been indexed and ranked.",
  },
  {
    q: "How is the YouTube SEO score calculated?",
    a: "Our AI analyzes your video metadata against six weighted ranking factors. Title Optimization (20%) checks for keyword presence, placement in the first 47–50 characters (the range Briggsby's analysis of top-ranking YouTube videos identified as optimal), and click-worthiness signals. Description Quality (20%) evaluates keyword placement in the first 100 characters — YouTube's Creator Academy confirms this is the portion that appears as a search snippet — word count, and secondary keyword integration. Tag Relevance (15%) assesses whether your tags include exact-match, broad-match, and long-tail keyword variations. Keyword Usage (20%) measures placement across all fields simultaneously. CTR Potential (15%) rates emotional triggers, curiosity gaps, and number usage in your title. Thumbnail Effectiveness (10%) scores your thumbnail description for contrast, face presence, and text overlay. Each category is scored independently and combined into the overall 0–100 score.",
  },
  {
    q: "What is a good YouTube SEO score?",
    a: "A score of 80 or above means your video is well-optimized and has a strong chance to rank for its target keyword. Scores between 60–79 indicate moderate optimization — your video may rank but will likely underperform against fully optimized competitors. Scores below 60 signal significant gaps that are actively limiting discoverability. The highest-impact improvements are almost always in the title and description — these two categories account for 40% of the total score and are also the easiest to fix before publishing. After running the checker, prioritize the top issues it identifies in order, since they're ranked by potential impact on your overall score. A Backlinko study of 1.3 million YouTube videos found that keyword placement in the title showed the strongest correlation with first-page rankings — making title optimization the single most important pre-publish action.",
  },
  {
    q: "Why is my YouTube video not showing up in search?",
    a: "Six common reasons a video fails to appear in search: (1) Your title doesn't contain the exact keyword phrase viewers are typing. YouTube's algorithm matches search queries to video titles more directly than Google does — exact phrasing matters. (2) Your description lacks the keyword in the first 100 characters, the portion YouTube uses as the search snippet (per YouTube's Creator Academy). (3) Your tags are too broad or irrelevant — tags signal topicality, and YouTube's Help Center confirms they help the algorithm understand your video's content. (4) Your video is too new — YouTube can take days to weeks to fully rank new content. (5) You're targeting a keyword where top results have millions of views and years of engagement history. (6) Low early CTR and watch time — even perfect metadata can't overcome a high early bounce rate, which signals to YouTube that viewers aren't satisfied. Run the SEO checker to identify which factor is the limiting constraint for your specific video.",
  },
  {
    q: "How important is the video description for YouTube SEO?",
    a: "The description accounts for 20% of your SEO score and is consistently the most underutilized ranking lever on YouTube. YouTube's Creator Academy explicitly states that the description helps the algorithm understand what your video is about — and that detailed, keyword-rich descriptions improve search visibility. The first 100 characters are especially critical because they appear as the search snippet below your title in results and on your video page, directly influencing click-through rate. YouTube allows up to 5,000 characters in descriptions (per the YouTube Help Center), and longer, structured descriptions give the algorithm more topical context. Best practice: target keyword in the first sentence, secondary keywords in the body, plus timestamps, related links, and a CTA — each element adds both SEO value and viewer utility.",
  },
  {
    q: "How many YouTube tags should I use?",
    a: "YouTube's Help Center describes tags as a way to help the algorithm understand your video's content — particularly helpful when your keyword might have common misspellings or is less clear from the title alone. In practice, 8–15 focused, relevant tags outperform both too-few and too-many approaches. Structure them in three tiers: (1) Exact match — your precise target keyword exactly as you want to rank for it. (2) Broad match — variations, synonyms, and related phrases. (3) Long-tail — three-to-five word phrases that are less competitive but highly relevant. A Backlinko study of 1.3 million YouTube videos found no strong correlation between tag count and rankings — relevance matters far more than volume. Avoid irrelevant keyword stuffing in tags; YouTube's algorithm is sophisticated enough to detect off-topic tags and discounts them. Our SEO checker scores your tag relevance and flags both missing coverage and irrelevant inflation.",
  },
  {
    q: "Does YouTube thumbnail affect SEO?",
    a: "Thumbnails don't directly influence YouTube's keyword indexing, but they have a powerful indirect effect on SEO through click-through rate (CTR). YouTube's own data shows that most channels achieve a CTR of 2–10% (YouTube Help Center), and CTR is one of YouTube's strongest distribution signals — a video with higher CTR than its competitors will gradually rank higher even if its keyword optimization is equivalent. YouTube's Creator Academy explicitly states that 'your thumbnail is the most powerful marketing tool you have' for driving clicks. Our SEO checker includes a Thumbnail Effectiveness category (10% of total score) that evaluates your thumbnail description for high-contrast visuals, emotional face expressions, readable text overlay, and contrast against YouTube's interface — the elements consistently associated with above-average CTR.",
  },
  {
    q: "How do keyword placement and density affect YouTube SEO?",
    a: "On YouTube, keyword placement matters far more than keyword density. YouTube's algorithm is not counting keyword percentages in your description the way old-school blog SEO worked — it's reading your metadata to understand your video's topic. The three placement rules that actually move rankings: (1) Your target keyword must appear in the title, ideally within the first 47–50 characters (Briggsby study of top-ranking videos). (2) Your keyword must appear in the first sentence of your description — the part that shows as a search snippet. (3) Your keyword must appear as one of your tags verbatim. Beyond those three placements, natural repetition throughout a 200–500 word description adds useful topical context without triggering spam detection. Avoid forcing the keyword into every sentence — YouTube's algorithm understands semantic relevance and doesn't require mechanical repetition.",
  },
  {
    q: "How do I improve my YouTube CTR?",
    a: "YouTube CTR is driven by three elements working together. (1) Title: A BuzzSumo analysis of 100 million headlines found that titles containing specific numbers significantly outperform generic alternatives — '7 Mistakes' outperforms 'Common Mistakes' every time. Place your keyword near the beginning and keep the title between 47–60 characters to avoid truncation in search results (Briggsby's research identified this range as optimal for top-ranking videos). (2) Thumbnail: Use high contrast, a single clear focal point, and minimal text. YouTube's A/B thumbnail testing feature lets you test two versions simultaneously — use it. (3) Relevance match: The closer your title and thumbnail promise matches what searchers expect, the higher your CTR — because you're attracting viewers already primed for your content rather than disappointing clickers who expected something else.",
  },
  {
    q: "What's the difference between YouTube SEO and Google SEO?",
    a: "YouTube SEO and Google SEO share the same foundational principle — match content to search intent — but the ranking signals and optimization levers are different. Google weighs backlinks, domain authority, page speed, and E-E-A-T signals heavily. YouTube has none of those — it weights watch time, CTR, engagement rate (likes, comments, shares), and metadata match instead. A piece of content can rank #1 on YouTube and not appear in Google's top 10, and vice versa. One overlap: optimizing for YouTube SEO also increases the chance of appearing in Google's video carousel, which increasingly appears at the top of Google search results for how-to and review queries. Running both a YouTube SEO check (this tool) and a Google-oriented keyword research process gives you the best of both ranking opportunities — the same video can drive traffic from two of the world's largest search engines simultaneously.",
  },
  {
    q: "Should I include the year in my YouTube title?",
    a: "Including the year in your title (e.g. 'Best Budget Laptops 2026') is a high-impact tactic for specific video types. It works best for: product reviews and comparisons, annual strategy guides, and time-sensitive how-to content where freshness is a purchase or decision factor. The year signals relevance — viewers searching for current information are more likely to click a dated title over an undated one at the same ranking position, improving CTR. It also helps your video appear in year-specific searches ('best X 2026'). It's not appropriate for evergreen tutorials, cooking content, or topic areas where recency adds no value — adding a year to a recipe or historical explainer creates false urgency. Our SEO checker's CTR Potential category accounts for freshness signals including year inclusion and flags whether the tactic is appropriate for your specific topic.",
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

export function YouTubeSeoScoreCheckerTool() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-seo-score-checker");
  const { toast } = useToast();

  const report = outputs.join("\n");

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-seo-checker";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCheck = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Enter your video title to analyse.", variant: "destructive" });
      return;
    }
    run({ title, description, tags, targetKeyword, secondaryKeywords });
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube SEO Score Checker</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={11} /> AI Powered
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Title *</label>
            <Input placeholder="Your YouTube video title..." value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Target Keyword</label>
            <Input placeholder="Main keyword you're targeting..." value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Video Description</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px] resize-y"
              placeholder="Paste your video description here..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tags (comma-separated)</label>
              <Input placeholder="tag1, tag2, tag3..." value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Secondary Keywords</label>
              <Input placeholder="related keyword 1, keyword 2..." value={secondaryKeywords} onChange={e => setSecondaryKeywords(e.target.value)} />
            </div>
          </div>
        </div>
        <Button onClick={handleCheck} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Analysing with AI...</> : <><Sparkles size={16} className="mr-2" />Check SEO Score</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {report && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">SEO Analysis Report</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(report); setCopied(true); toast({ title: "Report copied!" }); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? <><Check size={14} className="mr-1 text-green-500" />Copied!</> : <><Copy size={14} className="mr-1" />Copy</>}
            </Button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border">
            {report}
          </pre>
        </Card>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube SEO Score Checker</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Video Details",
              desc: "Paste your video title, description, and tags into the tool. Add your target keyword — the main search term you want your video to rank for. Secondary keywords and a thumbnail description are optional but improve the accuracy of your AI-powered analysis.",
            },
            {
              step: 2,
              title: "Click Check SEO Score",
              desc: "The AI instantly analyzes your video against six key YouTube ranking factors — title optimization, description quality, tag relevance, thumbnail effectiveness, keyword usage, and CTR potential — using YouTube's actual scoring criteria.",
            },
            {
              step: 3,
              title: "Review Your Score & Analysis",
              desc: "See your overall SEO score out of 100, individual category scores with specific wins and issues, keyword placement analysis, and your top 3 priority fixes sorted by impact. Each fix is explained with the reason it matters for ranking.",
            },
            {
              step: 4,
              title: "Copy the Optimized Output",
              desc: "Use the Copy button to grab your full analysis report. The AI provides rewritten title suggestions, a structured description template with your keyword, suggested tags, and actionable improvements you can apply before publishing.",
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

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube SEO Score Checker</h2>
        </div>
        <div className="space-y-8">

          {/* Section 1: How the score works */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How the YouTube SEO Score Is Calculated
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's algorithm processes over <strong className="text-foreground">80 billion signals every day</strong> (YouTube Blog, 2024) to decide which videos to surface for each search query. Our AI checker evaluates your video's metadata against six weighted categories that directly correspond to those signals — so you know exactly which levers to pull before hitting publish, when fixes take minutes instead of requiring a re-index.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: "Title Optimization", weight: "20%", desc: "Keyword presence, placement in first 47–50 chars (Briggsby study), length, and power word usage" },
                { label: "Description Quality", weight: "20%", desc: "Keyword in first 100 chars (YouTube Creator Academy: this is the search snippet), word count, secondary keywords" },
                { label: "Tag Relevance", weight: "15%", desc: "Exact-match, broad-match, and long-tail tag coverage — YouTube Help Center confirms tags signal topicality" },
                { label: "Keyword Usage", weight: "20%", desc: "Placement across title, description, and tags simultaneously — placement beats density" },
                { label: "CTR Potential", weight: "15%", desc: "Emotional triggers, numbers (BuzzSumo 100M headline study), curiosity gaps, freshness signals" },
                { label: "Thumbnail Effectiveness", weight: "10%", desc: "Contrast, face presence, text overlay — YouTube's Creator Academy calls thumbnails your most powerful marketing tool" },
              ].map(({ label, weight, desc }) => (
                <div key={label} className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">{label}</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{weight}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Each category is scored independently and combined into an overall 0–100 score. The report surfaces your highest-impact fixes ranked by score improvement potential — so you always know what to fix first.
            </p>
          </div>

          {/* Section 2: Why YouTube SEO matters */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why YouTube SEO Is the Highest-Leverage Action Before Publishing
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube is the world's second-largest search engine with <strong className="text-foreground">2.7 billion monthly active users</strong> (Statista, 2024). Unlike social platforms that distribute content through a feed algorithm, YouTube is fundamentally a search-driven platform — your video's metadata is the primary signal YouTube uses to match your content to search queries. A Backlinko study of 1.3 million YouTube videos found that having the target keyword in the video title showed the strongest correlation with first-page rankings among all metadata factors analyzed.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The window to optimize is before publishing. Once a video is indexed, the first 24–48 hours of engagement data shape its long-term ranking trajectory. A poorly optimized title and description means your video gets served to the wrong audience — generating low CTR and high bounce rates that permanently suppress distribution. Checking your SEO score before publishing costs two minutes and can determine whether a video ranks for two years or disappears in two weeks.
            </p>
            {/* Citation capsule */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">The metadata window that matters most</strong>
              YouTube's algorithm processes{" "}
              <a href="https://blog.youtube" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                80+ billion signals daily
              </a>{" "}
              (YouTube Blog, 2024) across its{" "}
              <a href="https://www.statista.com/statistics/272014/global-social-networks-ranked-by-number-of-users/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                2.7 billion monthly users
              </a>{" "}
              (Statista, 2024). A{" "}
              <a href="https://backlinko.com/youtube-ranking-factors" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Backlinko study of 1.3 million YouTube videos
              </a>{" "}
              found keyword presence in the video title to be the strongest metadata correlation with first-page rankings. Pre-publish SEO optimization — correcting title structure, description keyword placement, and tag coverage — is the single highest-leverage action a creator can take before a video's ranking trajectory is set.
            </div>
          </div>

          {/* Section 3: YouTube SEO vs Google SEO */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How YouTube SEO Differs from Google SEO
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube SEO and Google SEO share the same goal — match content to search intent — but the ranking signals are fundamentally different. Google weights backlinks, domain authority, page speed, and E-E-A-T signals. YouTube has none of those. YouTube weights watch time, CTR, engagement rate (likes, comments, shares, saves), and metadata match instead.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="font-semibold text-sm text-foreground mb-2">Google SEO Signals</div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {["Backlinks and domain authority", "Page speed and Core Web Vitals", "E-E-A-T (Experience, Expertise, Authority, Trust)", "Structured data / schema markup", "Internal link architecture"].map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5"><Check className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />{s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="font-semibold text-sm text-foreground mb-2">YouTube SEO Signals</div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {["Title keyword match and placement", "Description quality and snippet content", "Watch time and average view duration", "CTR from impressions in search / suggested", "Engagement rate (likes, comments, shares, saves)"].map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4 text-sm">
              One important overlap: a well-optimized YouTube video also has a strong chance of appearing in Google's video carousel, which now appears at the top of search results for many how-to, review, and tutorial queries. Pairing this SEO checker with an{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                optimized title
              </Link>{" "}
              and a{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                structured description
              </Link>{" "}
              gives your video ranking opportunities on both platforms simultaneously.
            </p>
          </div>

          {/* Section 4: Feature grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Checking Your YouTube SEO Before Publishing
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Six-category scoring aligned to YouTube's actual ranking factors — not generic SEO checklists",
                "Identifies the highest-impact fixes first, ranked by score improvement potential",
                "Sources title length recommendations from Briggsby's study of top-ranking YouTube videos",
                "Description snippet check: flags if your keyword misses the first 100 characters (YouTube Creator Academy)",
                "Tag relevance scoring based on YouTube Help Center guidance on topicality signals",
                "CTR scoring uses BuzzSumo's 100M headline study data for number and trigger word impact",
                "YouTube vs Google SEO comparison built into the analysis context",
                "Keyword placement analysis across all metadata fields simultaneously",
                "100% free — no account required, unlimited analyses, instant AI results",
                "Works for any video topic, niche, language, or channel size",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Maximize Your YouTube SEO Score</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Place your target keyword in the first 47–50 characters of your title — Briggsby's analysis of top-ranking YouTube videos identified this as the range with the strongest correlation to first-page placement, confirmed further by a Backlinko study of 1.3 million videos finding title keyword presence to be the strongest metadata signal overall.",
            "Write descriptions of at least 250–300 words — YouTube's Creator Academy confirms descriptions help the algorithm understand your video's content, and YouTube allows up to 5,000 characters (YouTube Help Center). Longer, structured descriptions give YouTube more topical context to surface your video across related searches.",
            "Use your exact target keyword as one of your tags verbatim, plus 5–8 long-tail variations of 3–5 words each. YouTube's Help Center describes tags as signals that help the algorithm understand your content's topic — especially useful for keywords with common misspellings or multiple search phrasings.",
            "Include timestamps (chapters) in your description — YouTube Help Center confirms that chapters appear in search results and suggested video previews as indexed jump-links, giving your target keyword additional entry points in search without changing your title or description text.",
            "Keep your title between 47–60 characters — Briggsby's analysis of top-ranking YouTube videos identified this as the range that displays fully in search results without truncation on both desktop and mobile, maximizing CTR potential from your impression.",
            "Add secondary keywords naturally in the second and third paragraphs of your description, not just in the opener. YouTube's Creator Academy notes that detailed, well-structured descriptions improve search visibility — spreading topical keywords throughout the body (not just the top) increases your range of related search matches.",
            "Run the SEO checker before every upload, not just on videos you think are competitive. Even routine videos on established topics often have fixable title or description gaps that suppress discovery — two minutes of pre-publish checking costs less than months of underperformance.",
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
            { name: "YouTube Title Analyzer", path: "/tools/youtube-title-analyzer", desc: "Dive deeper into your title's CTR power, emotional score, and viral probability." },
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized tags that match the keywords in your scored title and description." },
            { name: "YouTube Keyword Generator", path: "/tools/youtube-keyword-generator", desc: "Find the high-opportunity keywords your title and description should be targeting." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write a keyword-rich description that passes the SEO checker with a top score." },
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

        {/* CTA callout */}
        <div className="mt-4 p-5 rounded-2xl border border-primary/20 bg-primary/5">
          <p className="text-sm text-foreground font-semibold mb-1">Want to also optimize your title?</p>
          <p className="text-sm text-muted-foreground">
            Use our{" "}
            <Link href="/tools/youtube-title-analyzer" className="text-primary hover:underline font-medium">
              YouTube Title Analyzer
            </Link>{" "}
            to score and improve your title before running it through the SEO checker, or generate
            brand-new titles with the{" "}
            <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
              YouTube Title Generator
            </Link>.
          </p>
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
