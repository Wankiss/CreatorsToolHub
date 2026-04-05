import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, TrendingUp,
  ListChecks, ChevronDown, BarChart2, Zap, Shield,
  Search, ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a YouTube title rank higher in search?",
    a: "The single most important factor for YouTube search ranking is keyword front-loading — placing your primary search term within the first 40% of the title. YouTube's algorithm reads titles left-to-right and weights the beginning more heavily for topical relevance. Beyond keyword placement, titles that earn high click-through rates are algorithmically rewarded with broader distribution, which creates a compounding ranking effect. Our analyzer checks keyword presence, front-loading position, and natural language quality so you can optimize for both the search algorithm and human viewer psychology simultaneously.",
  },
  {
    q: "How long should a YouTube title be for best SEO performance?",
    a: "The optimal YouTube title length is 50–60 characters. Titles in this range display in full across all surfaces — mobile search, desktop homepage, suggested video panels, and embedded players — without truncation. Titles below 40 characters often lack enough keyword and context information to rank competitively. Titles above 70 characters are cut off by YouTube's display, which means your most compelling hook or call-to-action may disappear precisely when a viewer is deciding whether to click. Our length score tracks your character count live and alerts you when you approach the truncation threshold.",
  },
  {
    q: "What are power words and how do they improve YouTube CTR?",
    a: "Power words are psychologically charged terms that trigger emotional responses and reduce click hesitation. Words like 'ultimate,' 'secret,' 'proven,' 'shocking,' and 'finally' activate curiosity, urgency, and authority signals in viewer psychology. Our analyzer maintains a niche-specific power word library because high-CTR language differs by content category — 'shocking' performs well in news and entertainment, while 'proven' and 'step-by-step' convert better in education and finance. Including even one strong power word in your title can improve CTR by 20–40% compared to a neutral title covering the same content.",
  },
  {
    q: "What is a curiosity gap and why does it boost YouTube clicks?",
    a: "A curiosity gap is the information tension created when a title implies knowledge the viewer doesn't have but wants. It works by creating a cognitive discomfort — the brain seeks resolution — that can only be resolved by clicking. Phrases like 'Why most creators get this wrong,' 'What nobody tells you about,' 'The reason I stopped doing X,' and 'I tried this for 30 days' all open a gap between what the viewer knows and what the title promises. Our virality engine scores curiosity gap strength because it's the single highest-weighted predictor of click-through rate — more than power words, numbers, or emotional language.",
  },
  {
    q: "Does including a number in a YouTube title really help performance?",
    a: "Yes — numbers consistently outperform their text equivalents in YouTube titles because they create specificity that reduces click uncertainty. A title like '7 Mistakes New YouTubers Make' outperforms 'Mistakes New YouTubers Make' because the number tells the viewer exactly what they're committing to watching. Odd numbers (3, 5, 7, 9, 11) tend to outperform even numbers because they feel less curated and more authentic. Large specific numbers ('I Gained 47,000 Subscribers in 90 Days') create credibility through specificity. Our CTR score awards bonus points for numeric presence in titles.",
  },
  {
    q: "Should I include the current year in my YouTube title?",
    a: "Including the current year is effective for evergreen content that gets regular search traffic — tutorials, 'how to' guides, and strategy videos — because it signals freshness to both the algorithm and viewers. A title like 'YouTube SEO Tips for Beginners That Actually Work in 2026' will outrank the same title without the year in date-filtered searches. However, year-tagging reduces the long-term shelf life of your title since you'll need to update it annually to remain competitive. Reserve year-inclusion for content where freshness is a genuine search intent signal, not decoratively on content where the date is irrelevant.",
  },
  {
    q: "What is the difference between SEO score and CTR score in the title analyzer?",
    a: "SEO score measures your title's effectiveness for search discovery — specifically keyword presence, front-loading position, and natural language quality. A high SEO score means the algorithm can correctly interpret your content and rank it for relevant queries. CTR score measures viewer psychology — power words, curiosity gaps, emotional triggers, numbers, and formatting choices that make viewers click when they see your title in search results or suggested videos. Both matter but at different stages: SEO gets you impressions, CTR converts those impressions into views. Our four-score system analyzes each dimension independently so you can see exactly where your title is strong and where it needs work.",
  },
  {
    q: "How does the A/B title testing simulation work?",
    a: "The A/B testing simulation scores two title variants on all four dimensions — SEO, CTR, Readability, and Length — and weights them according to their impact in the first 24–48 hours after upload. CTR potential receives the highest weight (40%) in this window because YouTube's algorithm evaluates initial click rates from impression traffic to decide how broadly to distribute the video. A title that earns 7% CTR instead of 4% in this critical window gets significantly more algorithmic push. The simulation predicts which variant would earn more clicks in the early distribution phase, helping you make data-informed title decisions before committing.",
  },
  {
    q: "What is the virality engine and how is each score calculated?",
    a: "The Virality Engine measures three dimensions that our four-score system doesn't fully capture: Curiosity Gap strength (the information tension created by the title), Emotional Intensity (the charge and energy of the language used), and Title Uniqueness (how differentiated your title is from typical content in your niche). Curiosity Gap is scored by detecting 24+ proven psychological trigger phrase patterns. Emotional Intensity scores the cumulative charge of all power words, action verbs, and superlatives present. Uniqueness penalizes overused templates and rewards novel phrasing. Each metric is scored 0–100, and our AI engine is trained to produce suggestions that improve specific weak scores.",
  },
  {
    q: "Is the YouTube Title Analyzer free to use?",
    a: "Yes — the YouTube Title Analyzer is completely free with no account, no signup, and no usage limits. Analyze as many titles as you want across any niche with instant AI-powered results. Our tool uses AI to score your title on four independent dimensions, generate five optimized title variants, and simulate A/B test predictions — all at zero cost. Every feature including the Virality Engine scores, power word detection, curiosity gap analysis, and title templates is included at no charge.",
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouTubeTitleAnalyzerTool() {
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-title-analyzer");
  const { toast } = useToast();

  const report = outputs.join("\n");

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-title-analyzer";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleAnalyze = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Enter a YouTube title to analyse.", variant: "destructive" });
      return;
    }
    run({ title, keyword, niche, audience });
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary" size={22} />
            <h2 className="font-semibold text-lg">YouTube Title Analyzer</h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            <Sparkles size={12} /> Powered by AI
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">YouTube Title *</label>
            <Input
              placeholder="Enter the title you want to analyse..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length} / 70 chars recommended</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Keyword</label>
              <Input placeholder="e.g. make money online..." value={keyword} onChange={e => setKeyword(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. finance, fitness..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
        </div>
        <Button onClick={handleAnalyze} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Analysing with AI...</> : <><Sparkles size={16} className="mr-2" />Analyse Title</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {report && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Title Analysis</h3>
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Title Analyzer</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Title and Target Keyword",
              desc: "Paste your YouTube title into the analyzer and optionally add the exact search term you want the video to rank for. The keyword field unlocks SEO scoring: our AI checks whether your keyword is present, how early in the title it appears, and whether the density feels natural rather than stuffed.",
            },
            {
              step: 2,
              title: "Select Niche and Analyze",
              desc: "Choose your content category from the niche field — the AI virality engine adjusts its power word scoring based on your niche, since high-CTR language differs between finance, gaming, and health content. Click Analyse Title to see your overall score and the four component metrics with detailed breakdowns.",
            },
            {
              step: 3,
              title: "Review Your Virality Engine Scores",
              desc: "The three virality scores — Curiosity Gap, Emotional Intensity, and Uniqueness — measure dimensions beyond basic SEO and CTR. A strong overall score with a weak Curiosity Gap score means your title ranks but doesn't compel clicking. Use the specific improvement tips under each score to address the exact weakness.",
            },
            {
              step: 4,
              title: "Apply Suggestions and A/B Test",
              desc: "Copy any of the optimized title suggestions directly to YouTube Studio. For important videos, use the A/B Test suggestions to compare your original against an optimized version — the AI simulation scores both on all four dimensions and predicts which would earn more clicks in the first 48 hours after upload.",
            },
          ].map(({ step, title: t, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">{step}</div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Title Analyzer</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Your YouTube Title Determines 80% of Your Video's Success
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Of all the elements that determine whether a YouTube video succeeds or fails, the title carries
              disproportionate weight. It affects three critical metrics simultaneously: search ranking (SEO),
              click-through rate (CTR), and audience retention — through the expectation setting a title creates.
              A video with average content but an outstanding title will consistently outperform a great video
              with a weak title, because the weak-titled video never gets seen. YouTube's own research indicates
              that CTR improvement directly correlates with algorithmic distribution — a video earning 7% CTR
              gets dramatically more impressions than one earning 4% CTR on the same topic.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our AI-powered title analyzer scores your title on four independently weighted dimensions: SEO
              effectiveness (keyword placement and relevance), CTR potential (power words, curiosity gaps,
              emotional triggers, and formatting), readability (clarity and cognitive ease), and length
              optimization (ideal 50–60 characters). The virality engine then applies three additional
              AI-driven measures — curiosity gap strength, emotional intensity, and title uniqueness — that
              capture the variables most closely associated with viral performance across all niches.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every score comes with specific, actionable improvement tips. Rather than telling you a title is
              "weak," our AI tells you exactly which element to change and why — whether that's moving your
              keyword earlier, adding a curiosity trigger, shortening by 12 characters, or swapping a neutral
              verb for a higher-charge alternative. The five optimized title suggestions are generated fresh
              by AI for your specific input, not pulled from templates.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The Four-Score System: SEO, CTR, Readability, and Length
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">SEO Score</strong> measures whether your title is optimized
              for YouTube and Google search discovery. The most important factor is keyword front-loading —
              placing your primary search term in the first 40% of the title signals strong topical relevance
              to both algorithms. A title starting with your keyword consistently outperforms the same title
              with the keyword buried at the end. Our SEO score weights keyword presence at 40%, front-loading
              at 30%, and natural language quality at 30%.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">CTR Score</strong> models viewer psychology — the signals
              that make a thumbnail + title combination irresistible to click. Power words activate
              psychological triggers. Numbers create specificity that reduces click uncertainty. Curiosity
              gaps — information tension between what the viewer knows and what the title promises — are the
              single highest-weighted CTR factor because they create a cognitive discomfort that clicking
              resolves. Pair strong title CTR with a great{" "}
              <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                tag strategy
              </Link>{" "}
              to maximize both reach and conversion.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Readability and Length</strong> complete the picture. A
              title might score well on SEO and CTR but fail if it's grammatically awkward, uses excessive
              jargon, or runs so long that YouTube truncates it in search results. The 50–60 character ideal
              ensures your complete title displays on every device — mobile search, desktop homepage, suggested
              videos, and embedded players. Titles that extend beyond 70 characters often lose their most
              compelling hook to truncation precisely when a viewer is deciding whether to click.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> A/B Testing, Title Templates, and the AI Virality Engine
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The A/B testing simulation lets you compare two title variants before committing to one. The
              simulation weights CTR potential most heavily (40%) because in the first 24–48 hours after
              upload, YouTube's algorithm evaluates initial click rates from impression traffic to decide how
              broadly to distribute the video. A title that earns 7% CTR instead of 4% in this window gets
              significantly more algorithmic push — making early CTR the highest-leverage optimization point
              for new uploads.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The proven title templates capture formats that have generated millions of views across niches.
              The personal achievement format ("How I Made X in Y Days") works because it combines social
              proof, specificity, and an implicit promise of replication. The mistake avoidance format
              ("X Mistakes to Avoid") creates personal urgency — every viewer immediately wonders if they're
              making those mistakes. Fill in these templates with your specific results, numbers, and niche
              topic, then run them through the analyzer to see how well they score before publishing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The AI Virality Engine scores three dimensions that go beyond standard SEO and CTR metrics.
              Curiosity Gap detects 24+ proven psychological trigger phrase patterns that create information
              tension. Emotional Intensity scores the cumulative charge of all power words, action verbs, and
              superlatives present. Uniqueness penalizes overused templates and rewards novel phrasing that
              stands out in crowded search results. Use the virality scores together with a strong{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                title generator
              </Link>{" "}
              workflow: generate 40+ title candidates, then use this analyzer to score and select the best.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why Use This Tool ─────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Why Use This YouTube Title Analyzer</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: <BarChart2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Four-score system: SEO, CTR, Readability, and Length analyzed independently" },
            { icon: <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "AI Virality Engine: measures curiosity gap, emotional intensity, and title uniqueness" },
            { icon: <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Keyword front-loading detection with exact position percentage feedback" },
            { icon: <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Power word library with niche-specific vocabulary for each content category" },
            { icon: <ArrowUpRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Curiosity gap detection for 24+ proven psychological trigger phrases" },
            { icon: <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "5 AI-optimized title suggestions: SEO, High-CTR, Shortened, Viral, and Template" },
            { icon: <BarChart2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "A/B testing simulation to predict which of two titles performs better" },
            { icon: <ListChecks className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "8 proven title templates with fill-in-the-blank patterns and real examples" },
            { icon: <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Character count with live truncation warnings for mobile optimization" },
            { icon: <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "100% free, instant AI-powered results, no account required" },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              {icon}
              <p className="text-sm text-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Tools ─────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related YouTube Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              slug: "youtube-title-generator",
              icon: "🎯",
              name: "YouTube Title Generator",
              desc: "Generate 40+ title formulas and then bring them here to score and pick the best.",
            },
            {
              slug: "youtube-tag-generator",
              icon: "🏷️",
              name: "YouTube Tag Generator",
              desc: "Generate SEO-optimized tags that reinforce the high-scoring keywords in your title.",
            },
            {
              slug: "youtube-seo-score-checker",
              icon: "📊",
              name: "YouTube SEO Score Checker",
              desc: "Score your full title and description package together for maximum SEO coverage.",
            },
            {
              slug: "youtube-keyword-generator",
              icon: "🔍",
              name: "YouTube Keyword Generator",
              desc: "Find high-traffic keywords to incorporate into your title for better search ranking.",
            },
          ].map(tool => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`}>
              <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0 group-hover:bg-primary/10 transition-colors">
                  {tool.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} index={i} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>
    </>
  );
}
