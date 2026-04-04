import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Lightbulb,
  ChevronDown, ListChecks, Shield, ArrowUpRight, Zap, TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How do I come up with good YouTube video ideas consistently?",
    a: "The most reliable system is to stop waiting for inspiration and start using structured frameworks. Every successful YouTube niche has a finite set of proven content formulas — beginner guides, common mistakes, product comparisons, experiments, trending topic reactions, and personal story formats. Apply those formulas to your niche's keyword space on a weekly basis rather than brainstorming from scratch. Our AI-powered generator does this automatically: enter your niche and it applies 12 proven video formulas to produce a full idea bank in seconds. Aim to keep at least 4 weeks of approved ideas ready before you start filming — a full content pipeline means production delays never stall your publishing schedule.",
  },
  {
    q: "What makes a YouTube video idea 'viral'?",
    a: "Viral ideas share three characteristics: a strong psychological trigger (curiosity gap, loss aversion, social proof, or controversy), a clear promise in the title that creates an expectation the video delivers on, and relevance to something the audience already cares about. The virality score in our generator (1–10) rates each idea based on formula strength and niche match — formulas like 'Stop Doing X' (loss aversion), 'The Truth About X' (controversy), and 'I Tried X for 30 Days' (experiment suspense) consistently outperform generic tutorial formats across nearly every niche. The opening hook is equally important — the first 10 seconds must justify why the viewer clicked or they'll leave and signal to YouTube's algorithm that your video underperformed.",
  },
  {
    q: "How often should I post new YouTube videos?",
    a: "Consistency matters more than frequency. Posting one video per week and never missing a week will outperform posting three videos in one week and then going silent for three. YouTube's algorithm rewards predictable upload schedules because they build subscriber expectations and create regular re-engagement signals. For most creators, one to two videos per week is the optimal balance between production quality and output volume. Whatever schedule you choose, commit to it — use a content calendar built from generated ideas so you're never scrambling for what to film next. The 90-Day Content Calendar framework described in our generator (immediate uploads, evergreen anchors, future experiments) gives you a structured system for maintaining consistency.",
  },
  {
    q: "Should I choose trending topics or evergreen topics for my channel?",
    a: "The winning strategy combines both. Trending topics generate immediate views and algorithm distribution — YouTube actively promotes content covering current events and trending searches. But trending views fade fast. Evergreen topics — beginner guides, complete tutorials, definitive comparisons — build a library of videos that continue driving search traffic for months or years. A balanced content calendar should have roughly 30% trending or timely content and 70% evergreen anchors. Our generator separates ideas into high-virality trending formats and search-optimized evergreen ideas so you can build this balance intentionally rather than posting randomly.",
  },
  {
    q: "How do I know if a video idea will perform well before I film it?",
    a: "Look at three signals before committing to a video idea: (1) Search demand — does the title phrase have existing searches on YouTube? Check YouTube's autocomplete and look at competing videos' view counts. (2) Formula strength — is the idea based on a proven content formula (curiosity gap, experiment, common mistakes, comparison) or is it a generic take? Proven formulas have documented click-through rate advantages. (3) Audience alignment — does the idea match what your existing subscribers came to your channel for? Our generator displays a virality score and the psychological reason why each idea works, giving you a pre-production signal before you invest time filming.",
  },
  {
    q: "What content goal should I focus on first: subscribers, views, or engagement?",
    a: "Focus on engagement first. YouTube's algorithm distributes content based primarily on watch time and click-through rate — videos with strong engagement reach larger audiences organically, which drives both views and subscribers as downstream effects. A channel with 10,000 highly engaged subscribers consistently outperforms a channel with 100,000 passive subscribers in terms of reach and revenue. Our generator lets you select 'Increase Engagement' as your content goal — when selected, it weights your idea output toward storytelling, experiment, and educational formats that have documented watch-time advantages over viral clickbait formats, which tend to have high click-through rates but low retention.",
  },
  {
    q: "How long should my YouTube videos be?",
    a: "Video length should match the content's natural scope, but there are strategic thresholds worth understanding. Videos over 8 minutes can include mid-roll ads, which significantly increases revenue per video — this is worth targeting if you're monetized. Videos between 10–20 minutes tend to perform well because they're long enough for YouTube to promote but short enough to maintain high average view duration percentages. Longer videos (30+ minutes) work well for tutorials, deep dives, and educational content where viewers are committed to learning. Shorter videos (3–7 minutes) suit news commentary, quick tips, and list formats. Match length to format rather than padding content — YouTube's algorithm penalizes low audience retention regardless of length.",
  },
  {
    q: "Can I generate video ideas for any niche with this tool?",
    a: "Yes — our AI-powered YouTube Video Idea Generator works across all niches. The generator includes 14 pre-built keyword pools covering the most popular YouTube categories (finance, fitness, gaming, cooking, tech, beauty, business, travel, and more) plus smart auto-detection for niches you type in manually. The AI applies the same 12 proven video formulas to whichever niche you enter, weighting them based on your selected content goal and tone. Niche-specific ideas feel native to your channel rather than generic because the generator expands your niche input into related content angles and keyword clusters specific to your category before generating ideas.",
  },
  {
    q: "Should my video titles be questions or statements?",
    a: "Both formats work — the choice should be driven by the formula you're using, not personal preference. Statement titles work best for controversy, warning, and authority formats: 'Stop Making These 7 Thumbnail Mistakes,' 'The Truth About Passive Income on YouTube,' 'I Made $10,000 in 30 Days — Here's How.' Question titles work best for curiosity-gap and validation formats: 'Is YouTube Still Worth It in 2025?', 'Can a New Creator Hit 1,000 Subscribers in 30 Days?', 'What Actually Happens When You Post Every Day?' The opening hook our generator provides for each idea matches the title format — so a statement title gets a declarative hook and a question title gets a suspense-building hook designed to delay the answer long enough to create engagement.",
  },
  {
    q: "Is this YouTube Video Idea Generator free to use?",
    a: "Yes — the YouTube Video Idea Generator is completely free with no account required, no signup, and unlimited generation sessions. The generator is powered by AI and runs entirely in your browser session. Generate as many ideas as you need — use the 5–30 idea count slider to control your output batch size, and hit Regenerate anytime you want a completely fresh set. Your saved ideas persist in localStorage between browser sessions so your idea bank is always available without an account.",
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

export function YouTubeVideoIdeaGeneratorTool() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [contentType, setContentType] = useState("tutorial");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("youtube-video-idea-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-idea-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your channel niche.", variant: "destructive" });
      return;
    }
    run({ niche, audience, contentType });
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
          <Lightbulb className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Video Idea Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={11} /> AI Powered
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Channel Niche *</label>
            <Input
              placeholder="e.g. personal finance, cooking, fitness, gaming..."
              value={niche}
              onChange={e => setNiche(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input
                placeholder="e.g. college students, beginners..."
                value={audience}
                onChange={e => setAudience(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content Type</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={contentType}
                onChange={e => setContentType(e.target.value)}
              >
                <option value="tutorial">Tutorial</option>
                <option value="review">Review</option>
                <option value="vlog">Vlog</option>
                <option value="list">List / Roundup</option>
                <option value="story">Story / Case Study</option>
                <option value="challenge">Challenge</option>
                <option value="any">Any type</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Video Ideas</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Video Ideas</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All ideas copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((idea, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <span className="text-red-500 font-bold text-sm mt-0.5 shrink-0">{i + 1}.</span>
                <span className="flex-1 text-sm leading-relaxed">{idea}</span>
                <button onClick={() => copyItem(idea, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Video Idea Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Niche and Audience",
              desc: "Type your channel niche (e.g. 'fitness', 'personal finance', 'gaming') and optionally your target audience (e.g. 'beginners', 'entrepreneurs', 'teens'). The AI generator expands your niche into related content angles and keyword clusters specific to your category, producing ideas that feel native to your channel rather than generic.",
            },
            {
              step: 2,
              title: "Choose Your Content Type",
              desc: "Select the content format driving your next batch of videos — Tutorial, Review, Vlog, List/Roundup, Story/Case Study, Challenge, or Any type. The AI weights proven video formulas based on your selection, giving you ideas that match your production style and publishing strategy.",
            },
            {
              step: 3,
              title: "Generate Your AI-Powered Idea Bank",
              desc: "Hit Generate Video Ideas and your personalized idea bank appears in seconds — powered by AI. Each idea is grounded in a formula with a documented track record for click-through rate and watch time. Toggle content types freely and regenerate to explore different angles whenever you want fresh options.",
            },
            {
              step: 4,
              title: "Save Favorites and Build Your Content Calendar",
              desc: "Copy any idea directly to your clipboard with a single click. Use the Copy All button to grab your full idea batch at once. Regenerate freely to explore variations and find angles you hadn't considered. Aim to always have at least 4 weeks of approved ideas ready before filming begins so your publishing schedule never stalls.",
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
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Video Idea Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why YouTube Creators Run Out of Ideas — And How to Fix It
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The single biggest reason YouTube channels stall or die is not poor video quality, bad editing, or
              inconsistent thumbnails — it's running out of ideas. When creators can't figure out what to film
              next, they delay uploading, the algorithm stops distributing their content, and audience growth
              stalls. The irony is that this happens even in niches with genuinely infinite content potential.
              The problem isn't a shortage of possible ideas — it's not having a system to surface those ideas
              on demand.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The most prolific YouTube creators treat content ideation like a muscle, not a mood. They use
              structured brainstorming frameworks — proven video formulas applied to their niche's keyword
              space — rather than waiting for inspiration to strike. Our AI-powered generator brings this same
              systematic approach to any creator: enter your niche, and a bank of ready-to-execute video ideas
              appears in seconds, each grounded in a formula with a documented track record for click-through
              rate, watch time, and subscriber growth.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The AI doesn't generate random suggestions — it applies the same 12 video formulas used by the
              highest-performing channels in every category, weighted to your chosen content type and niche.
              The result is an idea bank that feels like it was written by a creator who knows your channel,
              not a generic list that could apply to anyone.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The 12 Video Formulas Behind Every Successful YouTube Channel
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every viral YouTube video — regardless of niche — uses one of a finite set of proven content
              formulas. Controversy videos challenge conventional wisdom and trigger immediate emotional
              engagement. Stop-warning videos use loss aversion psychology to compel immediate clicks.
              Curiosity-gap videos create an information void that viewers feel psychologically driven to fill.
              Personal story videos generate emotional investment and watch-time through authentic narrative.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Experiment videos document a structured challenge with an uncertain outcome, creating natural
              suspense that boosts completion rate — YouTube's most heavily weighted ranking signal.
              Mistakes-listicle videos combine self-assessment anxiety with the relief of a clear solution.
              Comparison videos attract viewers at the decision stage, who are more engaged and more likely to
              click affiliate links. Trending topic videos receive algorithmic momentum when they're first to
              cover a viral moment in your niche.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The AI generator applies all twelve formulas to your specific niche keywords and presents the
              best matches ranked by potential. Each idea also includes the core concept — the promise your
              video must deliver on to retain viewers past the first 30 seconds. Pair your ideas with an{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                optimized YouTube title
              </Link>{" "}
              and a keyword-rich{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                video description
              </Link>{" "}
              for a complete upload strategy.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How to Build a 90-Day Content Calendar from Generated Ideas
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Generate a large batch of ideas, then sort them into three buckets: immediate uploads (trending
              ideas and high-virality formulas that benefit from timing), evergreen anchors (beginner guides,
              complete tutorials, comparison videos that drive consistent long-term search traffic), and future
              experiments (ideas that require more production planning like 30-day challenges or case studies).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Aim to always have at least 4 weeks of approved ideas ready before filming begins, so content
              production never blocks your publishing schedule. Use Regenerate freely to explore variations
              and find angles you hadn't considered. A creator who publishes consistently from a well-organized
              idea bank will always outgrow a more talented creator who waits for inspiration. Build your
              channel brand around a{" "}
              <Link href="/tools/youtube-hashtag-generator" className="text-primary hover:underline font-medium">
                consistent hashtag strategy
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-script-generator" className="text-primary hover:underline font-medium">
                structured scripts
              </Link>{" "}
              to turn every idea into a polished, high-retention video.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Video Idea Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Powered by AI — not template fill-in-the-blank, but genuinely personalized idea generation",
                "12 proven video formulas applied to your niche — psychologically grounded content templates",
                "Works for any niche — finance, fitness, gaming, beauty, tech, cooking, and more",
                "Content type selector — tailor output to tutorials, reviews, vlogs, lists, or challenges",
                "Target audience input — ideas speak directly to your specific viewer demographic",
                "Copy All button — grab your full idea batch to paste into any content calendar tool",
                "Instant AI generation — full idea bank in seconds, not hours of manual brainstorming",
                "Unlimited regeneration — fresh batches on demand, no daily limits or paywalls",
                "Related tool links — go from idea to title, script, hashtags, and description in one workflow",
                "100% free, no account required, unlimited generation sessions",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Get the Best Video Ideas</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Be specific with your niche — 'personal finance for college students' produces more targeted ideas than just 'finance'.",
            "Generate multiple batches — each generation uses different formula weightings, so three runs gives you 3× the creative range to choose from.",
            "Use your best ideas as YouTube title prompts — take any generated concept straight into the YouTube Title Generator for 40+ headline variations.",
            "Mix evergreen and trending ideas in your calendar — 70% evergreen anchors for long-term search traffic, 30% timely topics for algorithmic momentum.",
            "The opening hook is as important as the idea itself — the first 10 seconds of your video must justify why the viewer clicked or they'll leave.",
            "Pair high-virality ideas with strong thumbnails — a great idea with a poor thumbnail will underperform a mediocre idea with a compelling visual.",
            "Use generated ideas to validate your niche — if strong ideas feel forced for your channel, that's a signal your niche may need refinement.",
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
            { name: "YouTube Script Generator", path: "/tools/youtube-script-generator", desc: "Turn your best video ideas into full scripts with hooks, body, and strong CTAs." },
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Generate 40+ high-CTR title formulas for the video ideas you want to pursue." },
            { name: "YouTube Hashtag Generator", path: "/tools/youtube-hashtag-generator", desc: "Find the perfect hashtags for each video idea to maximize discovery at upload." },
            { name: "YouTube Channel Name Generator", path: "/tools/youtube-channel-name-generator", desc: "Generate a memorable brand name that matches your video content niche." },
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
