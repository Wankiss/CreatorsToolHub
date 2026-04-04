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
    a: "A YouTube Title Generator is an AI-powered tool that creates optimized video title options based on your topic, target audience, and tone. Instead of manually brainstorming titles, you enter your keyword or video concept and the generator applies proven viral title frameworks — How-To, Number/List, Curiosity Gap, Speed/Shortcut, Beginner Guide, Warning/Mistake, and Discovery/Trend — to produce multiple high-performing variations in seconds. Each title is scored internally for keyword placement, CTR potential, clarity, curiosity triggers, and character length. Only titles hitting a threshold score are shown, so every result you see is production-ready.",
  },
  {
    q: "How do I write a good YouTube title?",
    a: "A great YouTube title does three things simultaneously: it tells YouTube's algorithm what the video is about (for search ranking), it convinces a viewer to click (for CTR), and it accurately represents the content (for watch time and retention). Practically, this means: include your target keyword near the beginning, keep the title between 50–70 characters, use a proven formula (number list, how-to, curiosity gap, or warning), and add emotional power words. Avoid clickbait that doesn't deliver — YouTube penalizes videos where high CTR is followed by early viewer drop-off. The best titles make a specific promise and deliver on it.",
  },
  {
    q: "How long should a YouTube title be?",
    a: "The ideal YouTube title length is 50–70 characters. Titles shorter than 50 characters often lack enough keyword context for the algorithm and feel vague to viewers. Titles longer than 70 characters get truncated in search results and on mobile — the most important part of your title, including your keyword and hook, must appear in the first 60 characters to remain visible. Our generator displays the character count for every title it produces and flags titles that fall outside the optimal range, so you never have to count manually.",
  },
  {
    q: "What makes a YouTube title get more clicks?",
    a: "Click-through rate is driven by four psychological triggers: (1) Curiosity gap — the viewer feels compelled to watch because they don't yet know the answer ('The real reason most YouTubers fail'). (2) Self-relevance — the title addresses a problem or goal the viewer has right now ('How to rank on YouTube with zero subscribers'). (3) Specificity — specific numbers, timeframes, or outcomes are more credible than vague promises ('7 title formulas' vs 'some title formulas'). (4) Urgency or novelty — 'in 2026,' 'nobody talks about this,' or 'stop doing this' create a sense that the information is new or time-sensitive. Our AI title generator weights all four triggers when scoring titles for CTR potential.",
  },
  {
    q: "Should I include numbers in YouTube titles?",
    a: "Yes — titles with numbers consistently outperform titles without them across most niches. Numbers work because they set a concrete expectation ('7 mistakes' is more credible than 'many mistakes'), signal structured content that's easy to consume, and stand out visually in a list of search results. Odd numbers — 7, 9, 11 — tend to perform better than even numbers, possibly because they feel less like rounded estimates. Large numbers create authority ('50 YouTube tips') while small numbers create speed ('3 steps'). Use numbers when your content is genuinely list-based or step-based — don't force them into titles where they feel artificial.",
  },
  {
    q: "What are the best YouTube title formulas?",
    a: "The seven highest-performing YouTube title formulas are: (1) How-To — 'How to [achieve result] [without drawback]'. (2) Number/List — '[N] [things] that [result]'. (3) Curiosity Gap — 'The [real/hidden/truth about] [topic]'. (4) Speed/Shortcut — 'How I [achieved result] in [timeframe]'. (5) Beginner Guide — '[Topic] for beginners: [complete/full] guide'. (6) Warning/Mistake — '[N] mistakes [audience] makes with [topic]'. (7) Discovery/Trend — 'Why [new thing] is [changing/replacing] [old thing]'. Our AI title generator applies all seven frameworks to your topic and returns the best-scoring titles from each category, so you can pick the formula that best fits your video's content.",
  },
  {
    q: "Does this YouTube title generator use AI?",
    a: "Yes — our YouTube Title Generator is powered by AI, which means it generates contextually relevant, unique titles rather than filling in a fixed template. When you enter your topic, tone, and target audience, the AI analyzes the combination and produces titles that match your specific content angle. It applies the seven proven title frameworks, scores each result across five optimization factors (keyword placement, CTR potential, clarity, curiosity triggers, and character length), and returns only the highest-scoring variations. The result is a set of titles that feel tailored to your channel — not generic fill-in-the-blank outputs. The tool is 100% free, with no account required and unlimited generation sessions.",
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
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free AI YouTube title generator analyzes your topic and applies seven proven viral
              title frameworks — How-To, Number/List, Curiosity Gap, Speed/Shortcut, Beginner Guide,
              Warning/Mistake, and Discovery/Trend — to create titles optimized for both YouTube search
              ranking and click-through rate. The AI doesn't fill in a fixed template; it generates
              contextually relevant titles that match your specific topic, audience, and tone.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every title is internally scored across five factors: keyword placement, CTR potential,
              clarity, curiosity triggers, and character length. Only titles scoring 70 or above are
              shown — so every result in your output is production-ready. The AI groups titles into
              High SEO and High CTR categories so you can make an informed choice depending on whether
              you're prioritizing search discovery or click-through rate.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Run your best title through the{" "}
              <Link href="/tools/youtube-seo-score-checker" className="text-primary hover:underline font-medium">
                YouTube SEO Score Checker
              </Link>{" "}
              to verify its full optimization before publishing, or pair it with a{" "}
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
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your YouTube title is the single most important factor for both YouTube SEO and viewer
              click-through rate. A well-crafted title tells YouTube's algorithm what your video is
              about — improving search ranking and suggested video placement — while simultaneously
              convincing real viewers to click. Even a 1% improvement in CTR can double your video
              views over time, because YouTube's algorithm amplifies content that earns strong early
              click signals by distributing it to progressively larger audiences.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The title is also the first and often only thing a viewer reads before deciding to click.
              A title that doesn't make a clear, compelling promise — or that buries the keyword — loses
              views to competing videos with identical content but better-crafted metadata. Most creators
              spend hours producing a video and minutes writing the title. Our AI title generator closes
              that gap: enter your topic and get a bank of optimized titles in seconds.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Titles that rank in YouTube search continue driving organic views for months or years —
              making strong title optimization one of the highest-ROI activities a creator can invest in.
              Use the generator before every upload, and pair each title with targeted{" "}
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
            "Put your target keyword in the first 5 words — YouTube weighs early keyword placement heavily for search ranking.",
            "Keep titles between 50–70 characters — long enough to convey value, short enough not to be truncated on mobile.",
            "Use specific numbers whenever your content is list-based — '7 mistakes' outperforms 'common mistakes' consistently.",
            "Test two title options using YouTube's A/B thumbnail and title feature — even a small CTR difference compounds into major view gains.",
            "Generate multiple batches with different tone settings and compare — the Shocking tone often produces higher-CTR titles for the same topic.",
            "Pair your title with a thumbnail that reinforces the same promise — visual and text consistency is the single strongest CTR combination.",
            "Include the year ('in 2026') for reviews, comparisons, and guides where recency matters — it signals freshness and increases clicks.",
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
