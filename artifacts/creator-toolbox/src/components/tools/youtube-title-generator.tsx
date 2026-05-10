import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Youtube,
  ChevronDown, ListChecks, Shield, ArrowUpRight, Zap, TrendingUp, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube Title Generator?",
    a: "A YouTube Title Generator is an AI-powered tool that creates optimized title options based on your topic, audience, and tone. It applies proven title frameworks — How-To, Number/List, Curiosity Gap, Speed/Shortcut, Beginner Guide, Warning/Mistake, and Discovery/Trend — and scores each output for keyword placement, CTR potential, clarity, and character length before showing results. This matters because YouTube's recommendation system processes over 80 billion signals per day (per YouTube's official blog) — and your title is the first signal both the algorithm and the viewer evaluate.",
  },
  {
    q: "How do I write a good YouTube title?",
    a: "A strong YouTube title does three things at once: signals relevance to YouTube's algorithm for search and recommended placements, earns a click from a real viewer, and accurately represents the content so watch time holds. YouTube's Help Center warns directly that clickbait — high CTR followed by early drop-off — reduces recommendations. In practice: place your keyword within the first five words, target 47–50 characters (the average length of top-ranking videos per Briggsby's 3.8 million data point study), use a proven formula, and make a specific promise you actually deliver.",
  },
  {
    q: "How long should a YouTube title be?",
    a: "YouTube allows up to 100 characters per title, but Briggsby's analysis of 100,000 YouTube videos found top-performing titles averaged 47–48 characters, with performance degrading beyond 50 characters. Practically: desktop search results truncate at roughly 60–70 characters, mobile home feed at 40–50 characters, and the suggested video sidebar at 50–60. Your keyword and main hook must land within the first 50 characters to remain visible across all surfaces. Shorter isn't always better — vague titles under 30 characters often lack the context the algorithm needs to rank them accurately.",
  },
  {
    q: "What makes a YouTube title get more clicks?",
    a: "YouTube's own Help Center states that clicks are a strong signal the system uses to decide who sees your video next — but only when paired with strong watch time. Four psychological triggers drive clicks: (1) Curiosity gap — the viewer must watch to get the answer. (2) Self-relevance — the title names a problem or goal they have right now. (3) Specificity — concrete numbers and outcomes ('7 frameworks' vs 'some frameworks') are more credible. (4) Urgency or novelty — 'in 2026' or 'nobody talks about this' signals the information is new. All four are weighted in this generator's internal scoring.",
  },
  {
    q: "Should I include numbers in YouTube titles?",
    a: "Yes — and the data backs it. BuzzSumo's analysis of 100 million headlines found that numbered list formats dominated top-performing content, with '10' ranking as the single best-performing number, followed by 5, 15, and 7. Nine of the top 20 best-performing headline numbers in that study were odd. The reason: specific numbers set a concrete expectation ('7 mistakes' is more credible than 'common mistakes'), signal structured consumable content, and stop the eye when scanning a results page. Use numbers when your content is genuinely list-based — don't force them into titles where they feel artificial.",
  },
  {
    q: "What are the best YouTube title formulas?",
    a: "The seven highest-performing YouTube title frameworks are: (1) How-To — 'How to [achieve result] without [drawback]'. (2) Number/List — '[N] [things] that [outcome]'. (3) Curiosity Gap — 'The real reason [common belief is wrong]'. (4) Speed/Shortcut — 'How I [achieved result] in [timeframe]'. (5) Beginner Guide — '[Topic] for beginners: the complete guide'. (6) Warning/Mistake — '[N] mistakes [audience] makes with [topic]'. (7) Discovery/Trend — 'Why [new approach] is replacing [old approach]'. This generator applies all seven to your topic and returns only results that score above the threshold across five optimization factors.",
  },
  {
    q: "Does this YouTube title generator use AI?",
    a: "Yes. The generator produces contextually relevant titles based on your specific topic, audience, and tone — not fill-in-the-blank templates. It applies the seven title frameworks, scores each result across five factors (keyword placement, CTR potential, clarity, curiosity triggers, character length), and returns only the highest-scoring variations. The tool is completely free, with no account required and no generation limits. Backlinko's analysis of 1.3 million YouTube videos confirms that title optimization is one of the few metadata factors with measurable impact on both search rankings and click-through rate.",
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

export function YouTubeTitleGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("engaging");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("youtube-title-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-title-gen";
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
    run({ topic, audience, tone });
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Youtube className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Title Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={11} /> AI Powered
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic / Keyword *</label>
            <Input
              placeholder="e.g. how to make money online, beginner guitar lessons..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input
                placeholder="e.g. beginners, entrepreneurs..."
                value={audience}
                onChange={e => setAudience(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={tone}
                onChange={e => setTone(e.target.value)}
              >
                <option value="engaging">Engaging</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="professional">Professional</option>
                <option value="shocking">Shocking / Clickbait</option>
              </select>
            </div>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate YouTube Titles</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Titles</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All titles copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((title, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <span className="flex-1 text-sm leading-relaxed">{title}</span>
                <button onClick={() => copyItem(title, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
                  {copied === i ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Title Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Video Topic",
              desc: "Type your main topic or target keyword into the first field — for example, 'make money with AI' or 'YouTube SEO tips'. This is the foundation the AI uses to generate all title variations, so be as specific as your keyword allows.",
            },
            {
              step: 2,
              title: "Set Your Preferences",
              desc: "Choose your target audience and tone (Engaging, Educational, Entertaining, Professional, or Shocking). These signals guide the AI title frameworks toward your specific content style and viewer expectations.",
            },
            {
              step: 3,
              title: "Click Generate YouTube Titles",
              desc: "Hit Generate and the AI instantly creates up to 20 SEO-optimized, high-CTR title variations across seven proven viral frameworks. Every title shown scores 70 or above across five optimization factors and is sorted by relevance.",
            },
            {
              step: 4,
              title: "Pick, Copy, and Upload",
              desc: "Browse the generated titles, click any individual title to copy it instantly, or use Copy All to grab the full set. Paste directly into YouTube Studio when publishing your video. Regenerate anytime for a completely fresh batch.",
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
            <Youtube className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Title Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This AI YouTube Title Generator Does
            </h3>
            {/* Citation capsule — answer-first */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                YouTube's recommendation system processes{" "}
                <a href="https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  over 80 billion signals per day
                </a>{" "}
                when deciding which videos to surface — and your title is the first metadata signal both the algorithm and the viewer evaluate.{" "}
                <a href="https://www.briggsby.com/reverse-engineering-youtube-search" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Briggsby's study of 3.8 million data points across 100,000 YouTube videos
                </a>{" "}
                found that top-ranking titles average 47–48 characters and that over 90% use broad-match keyword variations — not just exact-match terms — confirming that relevance and structure matter more than keyword stuffing.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This generator applies seven proven title frameworks — How-To, Number/List, Curiosity Gap,
              Speed/Shortcut, Beginner Guide, Warning/Mistake, and Discovery/Trend — to your specific
              topic, audience, and tone. It doesn't fill in fixed templates; it produces contextually
              relevant variations that match your content angle. Every title is scored across five
              factors (keyword placement, CTR potential, clarity, curiosity triggers, character length)
              and only results hitting the threshold are shown.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Run your best title through the{" "}
              <Link href="/tools/youtube-seo-score-checker" className="text-primary hover:underline font-medium">
                YouTube SEO Score Checker
              </Link>{" "}
              to verify full optimization before publishing, or pair it with a{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                keyword-rich description
              </Link>{" "}
              for a complete upload strategy.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why YouTube Titles Matter for Growth
            </h3>
            {/* Citation capsule — answer-first */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <a href="https://www.tubefilter.com/2018/01/11/youtube-most-watch-time-driven-by-recommendations/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  70% of all YouTube watch time is driven by YouTube's own recommendation algorithm
                </a>{" "}
                — more than search and subscriptions combined, according to YouTube's Chief Product Officer at CES 2018.{" "}
                <a href="https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  YouTube's official blog confirms
                </a>{" "}
                that recommendations drive "even more" viewership than channel subscriptions or search. Your title is the primary text signal the algorithm uses to decide whether your video belongs in that recommendation pool.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's Help Center is explicit that CTR and watch time work together — not independently.
              A title that drives clicks but fails to hold viewers will receive fewer recommendations,
              not more. That's why clickbait is self-defeating:{" "}
              <a href="https://support.google.com/youtube/answer/7628154" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                YouTube's own documentation
              </a>{" "}
              states that the platform "will recommend a video if it is relevant AND if the video's
              average view duration indicates that viewers find it interesting." Your title needs to earn
              the click and set an expectation the video can actually meet.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators spend hours producing a video and minutes writing the title. That imbalance
              is where views are lost.{" "}
              <a href="https://support.google.com/youtube/answer/7628154" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                YouTube's official CTR benchmarks
              </a>{" "}
              show that half of all channels operate between 2% and 10% impressions CTR — a wide band
              where a stronger title can meaningfully shift your position without changing anything
              else about the video.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Titles that rank in YouTube search compound over time — driving organic views for months
              after upload. Use the generator before every upload, and pair each title with targeted{" "}
              <Link href="/tools/youtube-hashtag-generator" className="text-primary hover:underline font-medium">
                hashtags
              </Link>{" "}
              and optimized{" "}
              <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                tags
              </Link>{" "}
              to maximize discoverability across every YouTube surface.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This YouTube Title Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "AI-powered generation using 7 proven viral YouTube title frameworks",
                "Every title scored for SEO strength and CTR potential before being shown",
                "High SEO and High CTR groups for strategic A/B testing before publishing",
                "Curiosity triggers, power words, and numbers included automatically",
                "Tone selector — Educational, Entertaining, Professional, or Shocking",
                "Target audience input — titles speak directly to your viewer demographic",
                "Character count displayed for every title — optimal 50–70 range flagged",
                "Copy individual titles or the full batch with a single click",
                "Instant AI generation — full title bank in seconds, no manual brainstorming",
                "100% free — no account required, no limits, unlimited generation sessions",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Write the Best YouTube Titles</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Put your keyword in the first 5 words. Backlinko's study flags early keyword placement as a 'Power Tip' for a marginal SEO boost, and Briggsby's data shows 38–45% of top-ranking videos use exact-match keywords in titles.",
            "Target 47–50 characters. Briggsby's 3.8 million data point study found top-performing titles averaged 47–48 characters. Desktop search truncates at ~70 characters; mobile home feed at ~50.",
            "Use specific numbers. BuzzSumo's 100 million headline study found numbered list formats dominated top-performing content — '10' is the single best-performing number, followed by 5, 15, and 7.",
            "Never clickbait. YouTube's Help Center states the platform recommends videos where 'average view duration indicates viewers find it interesting' — high CTR with low watch time triggers fewer recommendations.",
            "Try multiple tones. Generate with Engaging, then Shocking, then Educational settings and compare. The same topic often yields a meaningfully higher-CTR title under a different tone instruction.",
            "Match your thumbnail. Visual and title consistency is the strongest CTR signal combination — the thumbnail creates the emotional hook, the title delivers the specific promise.",
            "Add the year for time-sensitive content. 'In 2026' on reviews, comparisons, and guides signals freshness to both viewers and YouTube's algorithm, which uses recency as a relevance signal.",
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
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized tags that reinforce your title keywords for better discoverability." },
            { name: "YouTube Title Analyzer", path: "/tools/youtube-title-analyzer", desc: "Score your generated titles for SEO power, CTR potential, and viral probability." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write keyword-rich descriptions with chapters and CTAs that support your title." },
            { name: "YouTube Hashtag Generator", path: "/tools/youtube-hashtag-generator", desc: "Create niche-targeted hashtags that align with your title for maximum search reach." },
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
