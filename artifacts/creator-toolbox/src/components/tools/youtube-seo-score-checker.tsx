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
    a: "A YouTube SEO Score Checker is a tool that analyzes your video's metadata — title, description, tags, and keywords — and gives you a numerical score that reflects how well-optimized your video is for YouTube search. Our AI-powered checker evaluates six weighted categories: title optimization, description quality, tag relevance, thumbnail effectiveness, keyword usage, and CTR potential. The score out of 100 tells you exactly how competitive your video is in YouTube's search algorithm before you publish, so you can fix issues while it's still easy rather than after the video has already been indexed.",
  },
  {
    q: "How is the YouTube SEO score calculated?",
    a: "Our AI analyzes your video metadata against six weighted ranking factors that mirror YouTube's actual algorithm. Title Optimization (20%) checks for keyword presence, placement in the first 60 characters, title length between 50–70 characters, and power word usage. Description Quality (20%) evaluates keyword placement in the first 100 characters, word count above 200, and secondary keyword integration. Tag Relevance (15%) assesses whether your tags match your target keyword, include long-tail variations, and cover enough territory. Keyword Usage (20%) measures keyword density and placement across all fields. CTR Potential (15%) rates emotional triggers, curiosity gaps, and number usage in your title. Thumbnail Effectiveness (10%) scores your thumbnail description for visual contrast, face presence, and text overlay. Each category is scored independently and combined into the overall score.",
  },
  {
    q: "What is a good YouTube SEO score?",
    a: "A score of 80 or above is considered well-optimized and gives your video a strong chance to rank for its target keyword. Scores between 60–79 indicate moderate optimization — your video may rank but will likely underperform against fully optimized competing videos. Scores below 60 signal significant gaps that are actively limiting your video's discoverability. The most impactful improvements are almost always in the title and description — these two categories account for 40% of the total score and are also the easiest to fix. After running the checker, prioritize the top 3 issues it identifies, as these are ranked by their potential impact on your overall score.",
  },
  {
    q: "Why is my YouTube video not showing up in search?",
    a: "There are several common reasons a video fails to appear in search results: (1) Your title doesn't contain the exact keyword phrase people are typing into YouTube. (2) Your description is too short or doesn't include the target keyword in the first 100 characters. (3) Your tags are too broad or don't match your keyword. (4) Your video is too new — YouTube takes days to weeks to fully index and rank new videos. (5) Competition is too high — you're targeting a keyword where the top results have millions of views. (6) Low watch time and CTR signals — even if your metadata is optimized, poor early engagement tells YouTube your content isn't satisfying viewers. Run your video through the SEO checker to identify which of these factors is limiting your ranking.",
  },
  {
    q: "How important is the video description for YouTube SEO?",
    a: "The description is critical — it accounts for 20% of your SEO score and is one of the most underutilized ranking levers on YouTube. YouTube's algorithm reads your description to understand your video's topic, and descriptions with 200+ words that naturally repeat the target keyword give the algorithm more context to rank your video accurately. The first 100 characters of your description are especially important because they appear in search results below your title — this visible snippet influences click-through rate. Include your primary keyword in the first sentence, add secondary keywords throughout, and aim for a structured description with timestamps, related links, and a call to action to maximize both SEO value and viewer engagement.",
  },
  {
    q: "How many YouTube tags should I use?",
    a: "Use 10–20 tags per video for optimal coverage without diluting relevance. Structure your tags in three tiers: (1) Exact match tags — your precise target keyword, exactly as you want to rank for it. (2) Broad match tags — variations, synonyms, and related phrases that capture related searches. (3) Long-tail tags — three to five word phrases that are less competitive but highly relevant. Avoid stuffing tags with unrelated keywords — YouTube's algorithm is sophisticated enough to detect irrelevant tags and may penalize videos that appear to be keyword stuffing. Our SEO checker analyzes your tag relevance score and our tag generator can suggest 15–20 optimized tags matched specifically to your video's topic.",
  },
  {
    q: "Does YouTube thumbnail affect SEO?",
    a: "Thumbnails don't directly influence YouTube's indexing or keyword ranking, but they have a powerful indirect effect on SEO through click-through rate (CTR). A compelling thumbnail increases the percentage of users who click your video when it appears in search results — and CTR is one of YouTube's strongest ranking signals. A video with a higher CTR than its competitors will gradually rank higher even if its keyword optimization is equal. Our SEO checker includes a Thumbnail Effectiveness category (10% of your score) that evaluates your thumbnail description for high-contrast visuals, emotional face expressions, readable text overlays, and visual contrast against YouTube's dark interface — the factors that drive the highest click-through rates.",
  },
  {
    q: "What is keyword density and how much do I need?",
    a: "Keyword density is the percentage of your text that consists of your target keyword. For YouTube descriptions, a density of 1–2% is optimal — enough to clearly signal your topic to the algorithm without triggering spam filters. In practice this means for a 300-word description, your keyword should appear 3–6 times. More importantly than raw density is keyword placement: your keyword should appear in the first sentence of your description, within the first 5 words of your title, and at least once in your tags. Our SEO checker calculates keyword density across your title, description, and tags simultaneously and flags both under-optimization (too sparse) and over-optimization (keyword stuffing).",
  },
  {
    q: "How do I improve my YouTube CTR?",
    a: "YouTube CTR (click-through rate) is improved by three elements working together: (1) Title — use power words, numbers, and curiosity gaps. Titles with specific numbers ('7 Mistakes,' '30-Day Results') consistently outperform generic titles. Include your keyword near the beginning. Keep length between 50–70 characters so it doesn't get cut off in search results. (2) Thumbnail — use high contrast, a single clear focal point, minimal text, and an expressive face when relevant. Test multiple thumbnail options using YouTube's A/B thumbnail testing feature. (3) Relevance match — the closer your title and thumbnail promise matches what searchers expect, the higher the CTR because you're attracting the right audience. Our SEO checker scores your CTR Potential and identifies the specific changes that will improve it most.",
  },
  {
    q: "Should I include the year in my YouTube title?",
    a: "Including the year in your title (e.g. 'Best Budget Laptops 2026') is a high-impact tactic for certain video types. It works best for: reviews and comparisons ('Best X in [Year]'), annual updates ('Complete Guide to [Topic] [Year]'), and time-sensitive how-to content. The year signals freshness and relevance — viewers searching for current information are more likely to click a titled dated video over an undated one, improving CTR. It also helps your video appear in searches that include the year. However, it's not appropriate for evergreen tutorials, instructional content, or topics where recency doesn't add value — adding a year to a cooking tutorial, for example, creates unnecessary urgency. Our SEO checker's CTR Potential category accounts for freshness signals like year inclusion when appropriate.",
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
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How the YouTube SEO Score Is Calculated
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This AI-powered YouTube SEO Score Checker evaluates your video's optimization across six
              weighted categories that mirror YouTube's actual ranking algorithm. Title Optimization (20%)
              checks for target keyword presence, keyword placement in the first 60 characters, title
              length between 50–70 characters, power word usage, and click-worthiness signals.
              Description Quality (20%) analyzes keyword placement in the first 100 characters, word
              count (minimum 200), and secondary keyword integration throughout the body.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Tag Relevance (15%) assesses whether your tags include exact-match, broad-match, and
              long-tail variations of your target keyword. Keyword Usage (20%) measures density and
              placement across title, description, and tags simultaneously. CTR Potential (15%) scores
              your title for emotional triggers, curiosity gaps, and number usage. Thumbnail
              Effectiveness (10%) rates your thumbnail description for high-contrast visuals, face
              expressions, and text overlay quality.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Each category is scored independently by the AI and combined into an overall score out of
              100. The report also surfaces your top 3 highest-impact fixes — ranked by how much each
              improvement would lift your overall score — so you're never left guessing what to fix first.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why YouTube SEO Matters More Than Ever in 2026
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube processes over 3 billion searches every month, making it the second largest search
              engine in the world after Google. Unlike social platforms that distribute content through a
              feed algorithm, YouTube is a search-driven discovery platform — your video's metadata is
              the primary signal YouTube uses to decide when and to whom to show your content. A
              well-optimized video with a score of 80+ can rank for competitive keywords, appear in
              Google search results, and continue driving views for years after publication.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A poorly optimized video — even one with excellent production quality — will be invisible
              in search and dependent entirely on the algorithm's browse feature for distribution. The
              difference between a video that ranks on page one and one that never gets found is almost
              always in the metadata. Our AI checker removes the guesswork by scoring every optimization
              factor simultaneously and telling you exactly which changes will have the biggest impact
              on your ranking.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pairing your SEO analysis with an{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                optimized title
              </Link>{" "}
              and a{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                structured description
              </Link>{" "}
              gives your video the best possible chance to rank from day one — before the algorithm has
              had a chance to collect engagement data.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Checking Your YouTube SEO Before Publishing
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "AI-powered scoring using the exact same criteria YouTube uses for ranking decisions",
                "Identifies the highest-impact SEO issues first so you fix what matters most",
                "Generates rewritten title variations optimized for both search and clicks",
                "Provides an SEO-structured description template with your keyword pre-inserted",
                "Suggests 15–20 targeted tags including long-tail and trending variations",
                "Calculates keyword density across title, description, and tags simultaneously",
                "Analyzes your thumbnail description for CTR-boosting visual elements",
                "Shows keyword placement analysis with exact character position data",
                "100% free — no account required, unlimited analyses, instant results",
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
            "Place your target keyword in the first 5 words of your title — this is the single highest-impact SEO change you can make.",
            "Write descriptions of at least 250 words — longer descriptions give YouTube more context to rank your video accurately for related searches.",
            "Use your exact target keyword as one of your tags, plus 5–8 long-tail variations that are 3–5 words each.",
            "Include timestamps in your description — they create indexed chapters that give you additional keyword placement opportunities.",
            "Keep your title between 50–70 characters so it displays fully in search results and doesn't get truncated on mobile.",
            "Add secondary keywords naturally in the second and third paragraphs of your description, not just at the top.",
            "Run the SEO checker before every upload — even experienced creators miss optimization opportunities in routine videos.",
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
