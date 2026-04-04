import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Search,
  ListChecks, ChevronDown, Shield, Zap, ArrowUpRight,
  TrendingUp, Lightbulb, AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What are YouTube keywords and why do they matter for SEO?",
    a: "YouTube keywords are the specific words and phrases that viewers type into YouTube's search bar when looking for content. YouTube — the world's second-largest search engine — processes over 3 billion searches per month, and its algorithm uses the keywords in your video's title, description, and tags to decide which search queries your video should appear for. A video optimized for the right keyword can rank in the top 3 results for a term searched thousands of times per month, generating consistent organic views for years after publishing. Without keyword optimization, even excellent content gets buried — the algorithm has no clear signal about what your video is about or who should see it.",
  },
  {
    q: "What is the difference between high-volume and long-tail YouTube keywords?",
    a: "High-volume keywords are broad, short phrases with thousands or tens of thousands of monthly searches — terms like 'workout routine' or 'how to invest.' They attract enormous traffic but are dominated by established channels with millions of subscribers, making them nearly impossible for new or mid-size channels to rank for. Long-tail keywords are 4–6+ word phrases like 'home workout routine for beginners without equipment' or 'how to invest in index funds with $100.' They have lower individual search volume but far less competition, meaning a smaller channel can genuinely rank first or second. More importantly, long-tail viewers are highly specific in their intent — they know exactly what they want and are far more likely to watch your full video and subscribe.",
  },
  {
    q: "How do I find low-competition YouTube keywords for my niche?",
    a: "The most reliable method is to use our AI-powered YouTube Keyword Generator — set your keyword priority to 'Low Competition' and enter your topic, niche, and target audience. The tool generates keywords using an opportunity scoring formula that weights competition level heavily. To validate manually: search your keyword on YouTube and look at the view counts on the first-page results. If the top 3–5 videos have under 50K views, competition is genuinely low. Also look at the channel sizes ranking for that keyword — if small channels are in the top results, that's a signal you can compete. Niche-specific long-tail phrases (with audience modifiers like 'for beginners', 'for seniors', or 'without equipment') almost always have lower competition than their broad counterparts.",
  },
  {
    q: "How should I use keywords in my YouTube video for best SEO results?",
    a: "Place your primary keyword at the very beginning of your video title — front-loading the keyword gives it the strongest SEO signal. Include it naturally in the first 2–3 sentences of your video description, then use secondary keywords throughout the rest of the description without forcing them. Add 10–15 keywords from your research as video tags in YouTube Studio (go to Tags → Add tags). Use 3–5 relevant hashtags at the end of your description. Most importantly, say your main keyword in the first 30 seconds of your video — YouTube's auto-caption system reads speech, and spoken keywords reinforce the algorithm's understanding of your content topic.",
  },
  {
    q: "What is the Keyword Gap feature and how should I use it?",
    a: "Keyword Gap analysis identifies keywords that competitor channels are likely ranking for that your content hasn't targeted yet. Enter a competitor's channel topic or niche in the Keyword Gap field to surface high-opportunity keywords you're currently missing. These represent direct content opportunities — topics you can create videos around to capture traffic your competitor is getting. The most effective use is to identify 5–10 gap keywords per competitor and build a content calendar around them, systematically targeting terms that are already proven to drive traffic in your niche but that you haven't covered yet.",
  },
  {
    q: "How accurate are the search volume and competition scores in this tool?",
    a: "Our AI-generated volume and competition scores are directional estimates based on keyword patterns, niche demand signals, and YouTube's documented search behavior — not live data pulled from YouTube's private API (which is not publicly available). They are designed to give you a reliable ranking of which keywords are worth targeting relative to each other, not precise monthly search numbers. The opportunity score formula (Volume × 0.6 + Low Competition × 0.4) consistently surfaces the best keyword targets regardless of the exact underlying numbers. For the most accurate data, cross-reference our suggestions with YouTube Studio's Search Insights feature, which shows actual search volume for your existing content's keywords.",
  },
  {
    q: "How many keywords should I include in a YouTube video?",
    a: "For video tags, include 10–15 keywords total — one primary keyword, 4–6 closely related secondary keywords, and 3–5 broader category terms. For your description, naturally integrate 5–8 keywords rather than cramming in as many as possible (keyword stuffing is penalized by YouTube's quality filters). For hashtags, use 5–10 at the end of your description. The key principle is that every keyword you use should accurately describe your actual video content — the algorithm cross-references your metadata against viewer behavior signals like watch time and click-through rate. If viewers click your video based on a keyword and immediately leave, the algorithm reduces your ranking for that term.",
  },
  {
    q: "What makes a good 'opportunity keyword' on YouTube?",
    a: "An opportunity keyword balances three factors: sufficient search volume (people are actually looking for it), low-to-moderate competition (your channel can realistically rank for it), and strong content-view alignment (viewers who find your video through this keyword are likely to watch it fully). Our generator scores each keyword using the formula: Opportunity = (Volume × 0.6) + (Low Competition × 0.4), giving more weight to search volume while ensuring competition remains manageable. The best opportunity keywords often include specificity modifiers — year references (2026), difficulty levels (beginner, advanced), niche qualifiers (for students, for small business), or format signals (how to, tutorial, guide) — that simultaneously attract the right audience and filter out casual competition.",
  },
  {
    q: "Should I use YouTube hashtags and how many should I add?",
    a: "Yes — hashtags are a separate but complementary discovery system to keyword search. Add 5–10 hashtags at the end of your video description (never in the title, and never more than 15 total). YouTube displays the first 3 hashtags above your video title as clickable links, so put your most important hashtags first. The ideal mix includes 2–3 broad trending hashtags (#YouTube, #ContentCreator), 3–5 niche-specific hashtags (#HomeWorkout, #FinanceTips), and 2–3 long-tail hashtags matching your primary keyword. Use our YouTube Hashtag Generator to build a complete three-tier set for each video — it pairs directly with the keywords you discover here.",
  },
  {
    q: "Is the YouTube Keyword Generator free to use?",
    a: "Yes — the YouTube Keyword Generator is completely free with no account required, no signup, and no usage limits. The AI-powered tool generates keyword suggestions, opportunity scores, trending keywords, long-tail phrases, question-based keywords, hashtag suggestions, and SEO title ideas for any topic or niche in seconds. Generate as many keyword sets as you need — for every video, every niche, and every content format. There are no premium tiers or daily limits.",
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

const KEYWORD_GOALS = [
  { value: "balanced", label: "Balanced", desc: "Best opportunity score (Volume × 0.6 + Low Competition × 0.4)" },
  { value: "high_volume", label: "High Volume", desc: "Maximize reach and total search traffic" },
  { value: "low_competition", label: "Low Competition", desc: "Maximize rankability for smaller channels" },
  { value: "long_tail", label: "Long-Tail", desc: "4+ word phrases for niche-specific content" },
];

const CONTENT_TYPES = [
  { value: "tutorial", label: "Tutorial / How-To" },
  { value: "review", label: "Review" },
  { value: "list", label: "List / Tips" },
  { value: "vlog", label: "Vlog" },
  { value: "shorts", label: "Shorts" },
  { value: "comparison", label: "Comparison" },
  { value: "case_study", label: "Case Study" },
];

export function YouTubeKeywordGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [contentType, setContentType] = useState("tutorial");
  const [keywordGoal, setKeywordGoal] = useState("balanced");
  const [competitorTopic, setCompetitorTopic] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-keyword-generator");
  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-yt-keyword-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your seed topic or keyword.", variant: "destructive" });
      return;
    }
    run({ topic, niche, audience, contentType, keywordGoal, competitorTopic });
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(outputs.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast({ title: "All keywords copied!" });
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* AI badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </div>
            <span className="text-xs text-muted-foreground">Generates opportunity-scored keywords, hashtags, and SEO titles</span>
          </div>

          {/* Seed keyword */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Seed Topic / Keyword *
            </label>
            <Input
              placeholder="e.g. how to invest, beginner workout, vegan meal prep..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              className="rounded-xl h-11 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1.5">The more specific your topic, the more targeted the keyword results.</p>
          </div>

          {/* Keyword Goal */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Keyword Priority</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {KEYWORD_GOALS.map(g => (
                <button key={g.value} type="button" onClick={() => setKeywordGoal(g.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-xs transition-all ${keywordGoal === g.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <div className="font-bold text-sm">{g.label}</div>
                  <div className="font-normal opacity-80 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Niche + Audience + Content Type */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Niche</label>
              <Input
                placeholder="e.g. finance, fitness..."
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Target Audience <span className="font-normal">(optional)</span></label>
              <Input
                placeholder="e.g. beginners, entrepreneurs..."
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Content Type</label>
              <select
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                value={contentType}
                onChange={e => setContentType(e.target.value)}
              >
                {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Keyword Gap */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              Keyword Gap — Competitor Topic <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full">Optional — finds keywords they rank for that you're missing</span>
            </label>
            <Input
              placeholder="e.g. personal finance for beginners, home workout tips..."
              value={competitorTopic}
              onChange={e => setCompetitorTopic(e.target.value)}
              className="rounded-xl h-11 text-sm"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full h-12 rounded-xl font-semibold text-base gap-2 bg-red-600 hover:bg-red-700">
            {loading
              ? <><Loader2 className="animate-spin w-5 h-5" /> Researching with AI...</>
              : <><Sparkles className="w-5 h-5" /> Generate Keywords</>}
          </Button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {outputs.length > 0 && (
        <div className="mt-6 rounded-3xl border border-border bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Keyword Suggestions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{outputs.length} keywords generated — click any row to copy</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyAll} className="gap-1.5 rounded-lg text-xs">
                {copiedAll ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                Copy All
              </Button>
            </div>
            <div className="space-y-2">
              {outputs.map((kw, i) => (
                <div
                  key={i}
                  onClick={() => copyItem(kw, i)}
                  className="flex items-start gap-3 group p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <span className="flex-1 text-sm leading-relaxed">{kw}</span>
                  <span className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                    {copied === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Use the Best Keyword in your video title (front-loaded). Distribute secondary keywords across your description and tags.
            </p>
          </div>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Keyword Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Seed Keyword and Select Your Niche",
              desc: "Type your main topic into the keyword field. The AI analyzes common YouTube search patterns around your topic to generate targeted keyword ideas. Select your video niche and content type to shape the keyword generation toward your specific context — a 'fitness tutorial for beginners' produces different keyword opportunities than a 'fitness review.'",
            },
            {
              step: 2,
              title: "Set Your Keyword Goal and Target Audience",
              desc: "Choose your keyword priority: Balanced uses the opportunity score formula (Volume × 0.6 + Low Competition × 0.4) to surface the best overall keywords; High Volume maximizes reach; Low Competition maximizes rankability for smaller channels; Long-Tail filters to 4+ word phrases for niche-specific content. Add your target audience to personalize long-tail variations — 'for beginners,' 'for entrepreneurs,' or any custom audience label.",
            },
            {
              step: 3,
              title: "Use Keyword Gap to Find Competitor Opportunities",
              desc: "Enter a competitor's topic in the Keyword Gap field to identify keywords they're likely ranking for that your content hasn't targeted. The AI compares keyword profiles and surfaces the highest-opportunity gaps — specific keywords you could create videos around to capture traffic your competitor is getting that you currently miss.",
            },
            {
              step: 4,
              title: "Apply Keywords Across Your Video Metadata",
              desc: "Use the top keyword in your title (front-loaded) and first description paragraph. Distribute 10–15 keywords from the results as your video tags. Add 3–5 hashtags from the results to your description. Use the generated keywords as a reference when writing your video description — work them in naturally for compounding SEO value.",
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
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Keyword Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why YouTube Keyword Research Is the Foundation of Channel Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube is the world's second-largest search engine, processing over 3 billion searches per month. Unlike
              social media where content is pushed to viewers algorithmically based on past behavior, YouTube Search
              distributes content in direct response to what users actively look for. A video optimized for the right
              keyword can appear in the first 3 results for a term searched 10,000+ times per month — generating
              consistent, compounding organic views for years after publishing. This is what separates channels that
              grow through search from channels entirely dependent on the volatile algorithmic feed.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The challenge is finding keywords that are both worth ranking for (enough people searching) and
              realistically rankable (not completely dominated by channels with millions of subscribers). This is the
              opportunity scoring problem our AI generator solves: Opportunity = (Volume × 0.6) + (Low Competition × 0.4).
              A perfect opportunity keyword has substantial monthly searches and competition your channel can actually beat.
              The Best Keyword recommendation surfaces the single highest-scoring target for your exact topic, niche,
              and content type combination.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Once you have your keywords, reinforce them across every piece of video metadata — pair your keyword
              research with a strong{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                video description
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                optimized title
              </Link>{" "}
              to maximize the SEO signal YouTube reads when categorizing your content.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> The Four Keyword Categories and When to Target Each
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">High Opportunity keywords</strong> are the foundation — they balance
              search volume and competition scoring to surface the most efficient targets for your channel regardless of
              size. These include long-tail phrases with beginner, year, or niche modifiers that attract consistent search
              volume without requiring a massive existing subscriber base to rank. Use these as your primary keyword
              targets in video titles and descriptions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Trending keywords</strong> use current-year modifiers and
              niche-specific terms that are seeing elevated search interest. Publishing content around trending keywords
              within 24–48 hours of a trend peak can capture significant early traffic from both search and the YouTube
              feed. Use the{" "}
              <Link href="/tools/youtube-hashtag-generator" className="text-primary hover:underline font-medium">
                YouTube Hashtag Generator
              </Link>{" "}
              to maximize discovery for trending content.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Long-tail keywords</strong> are 4–6+ word phrases that are the single
              most important category for growing channels. Their longer length naturally filters out casual competition —
              most creators optimize only for short, broad terms — while their specificity attracts highly engaged viewers
              who know exactly what they want. A channel that systematically creates content for 50 long-tail keywords
              builds a durable, compounding search traffic foundation that continues generating views long after publish.
              Validate your long-tail keyword choices with our{" "}
              <Link href="/tools/youtube-seo-score-checker" className="text-primary hover:underline font-medium">
                YouTube SEO Score Checker
              </Link>{" "}
              to confirm your title and description are properly optimized.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Question-based keywords</strong> capture the enormous "how to" and
              "what is" search volume that represents the majority of YouTube's information-seeking queries. These
              keywords perform particularly well in YouTube's suggested video feed because they signal a learning intent
              that the algorithm associates with high watch time and session duration. Pair question-based title keywords
              with comprehensive, well-structured answers to trigger YouTube's recommendation engine to extend viewer
              sessions — one of the strongest growth signals on the platform.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Keyword Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "AI-powered keyword research — generates opportunity-scored suggestions tailored to your topic and niche",
                "Opportunity score formula: Volume × 0.6 + (100 − Competition) × 0.4 for balanced targeting",
                "4 keyword priority modes: High Opportunity, Trending, Long-Tail, and Question-Based",
                "Keyword Gap analysis — surface competitor keywords your content is missing",
                "Trending keyword detection with year-specific modifiers for timely content",
                "Auto-formatted hashtag suggestions derived from top-opportunity keywords",
                "SEO-optimized title suggestions using your highest-scoring keywords",
                "Description keyword list for natural, search-engine-friendly video descriptions",
                "Full results with copy-to-clipboard on every individual keyword",
                "100% free, instant results, no account required",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Get the Most from YouTube Keyword Research</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Front-load your primary keyword in the video title — put the keyword in the first 3–4 words for the strongest SEO signal.",
            "Use 'Long-Tail' mode if your channel is under 10K subscribers — you'll get far better ranking results targeting specific 5–6 word phrases than competing for broad terms.",
            "Say your primary keyword in the first 30 seconds of your video — YouTube's auto-captions are indexed by the algorithm and reinforce your metadata keywords.",
            "Run Keyword Gap analysis against your top 3 competitors once per month to discover new content opportunities before they get saturated.",
            "Add 10–15 of your generated keywords as video tags in YouTube Studio — use your primary keyword first, then secondary and related terms.",
            "Combine this tool with the YouTube Hashtag Generator — the keyword research here and the hashtag generation complement each other to cover both search and browsing discovery.",
            "Publish keyword-optimized content within 48 hours of a trending topic's peak — the algorithm distributes trending-adjacent content broadly during that window.",
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
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Convert your best keywords into a full SEO tag set optimized for YouTube's algorithm." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your title and description using the keywords you just discovered." },
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Generate high-CTR titles using your top keywords for maximum search visibility." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write descriptions that naturally integrate your target keywords for search visibility." },
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
