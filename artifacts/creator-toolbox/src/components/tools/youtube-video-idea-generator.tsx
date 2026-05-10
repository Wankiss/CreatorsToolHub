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
    a: "The most reliable system is to stop waiting for inspiration and start using structured frameworks. YouTube has 2.7 billion monthly active users (Statista, 2024) searching across its platform daily — every successful niche has a finite set of proven content formulas that tap into what those viewers are already looking for. YouTube's Creator Academy recommends creating content that your audience is actively searching for rather than content you assume they want. Apply proven video formulas — beginner guides, common mistakes, product comparisons, experiments — to your niche's keyword space consistently rather than brainstorming from scratch. Our AI generator does this automatically: enter your niche and it produces a full idea bank in seconds. Aim to always have at least 4 weeks of approved ideas ready before filming, so production delays never stall your schedule.",
  },
  {
    q: "What makes a YouTube video idea work?",
    a: "High-performing video ideas share three characteristics: a strong psychological trigger (curiosity gap, loss aversion, social proof, or controversy), a clear promise the video actually delivers on, and relevance to a topic the audience is already actively searching for. YouTube's Creator Academy identifies audience retention — the percentage of the video viewers watch — as a primary performance signal. That means the idea and its execution need to work together: a great concept with a weak hook or misleading title generates clicks but poor retention, which suppresses distribution. Formats like 'I Tried X for 30 Days' (experiment suspense), 'Stop Doing X' (loss aversion), and 'The Truth About X' (curiosity + controversy) tend to drive both high CTR and strong retention because they set a specific expectation and deliver on it.",
  },
  {
    q: "How often should I post new YouTube videos?",
    a: "YouTube's Creator Academy advises maintaining a consistent publishing schedule — it builds subscriber expectations and creates regular re-engagement opportunities. Consistency matters more than raw frequency. Publishing one video per week without gaps outperforms bursting three videos in one week then going silent for a month. For most creators, one to two videos per week balances production quality against output volume sustainably. What matters equally is having your ideas ready before you need them — scrambling for content at upload time leads to weaker ideas, rushed execution, and inconsistent schedules. Use a content calendar built from generated ideas so the decision of what to film next is always answered weeks in advance.",
  },
  {
    q: "Should I choose trending topics or evergreen topics for my channel?",
    a: "The strongest channels combine both deliberately. Trending topics — reactions to current events, timely news in your niche, YouTube's own trending searches — generate immediate algorithmic distribution because YouTube actively promotes content that aligns with what viewers are searching for right now. But trending views fade. Evergreen topics — beginner guides, complete tutorials, definitive comparisons — build a library that continues driving YouTube Search traffic for months or years with no additional effort. Many successful channels aim for roughly 70% evergreen content to compound long-term search traffic, with 30% trending or timely content for algorithmic momentum. Think of it as building an asset library alongside a discovery engine. YouTube Studio's Inspiration tab surfaces trending topics in your niche directly — use it to identify timely opportunities before generating your evergreen anchors.",
  },
  {
    q: "How do I know if a video idea will perform well before I film it?",
    a: "Check three signals before committing: (1) Search demand — type your title phrase into YouTube's search bar and observe the autocomplete suggestions. YouTube's autocomplete reflects real searches by real viewers; if your phrase doesn't autocomplete, search volume may be too low. (2) Competitor view counts — look at the top 5 videos on your topic. If similar videos have strong view counts relative to the channel's subscriber count, demand is validated. (3) Formula strength — is the idea built on a proven content structure (curiosity gap, experiment, common mistakes, comparison, definitive guide) or is it a generic take? Proven formulas have click-through rate advantages because viewers recognize and respond to familiar content signals. YouTube's Creator Academy recommends reviewing your own Analytics to identify which of your past videos' topics and formats drove the highest watch time — your historical data is your best predictor.",
  },
  {
    q: "What content goal should I focus on first: subscribers, views, or engagement?",
    a: "Prioritize watch time and audience retention. YouTube's Creator Academy is explicit: 'audience retention — the percentage of a video that people watch — is one of the most important metrics on YouTube.' High retention signals value to the algorithm, which drives broader distribution, which generates views and subscribers as downstream results. A channel that optimizes for watch time first builds compounding organic reach — each well-retained video seeds the next one through YouTube's recommendation engine. Content types with the strongest retention track records are educational tutorials with clear structure, experiment videos with genuine suspense, and storytelling formats with personal narrative. Focus your idea selection on formats that match what your audience came to your channel for — relevance to existing viewers drives retention better than chasing trend volume.",
  },
  {
    q: "How long should my YouTube videos be?",
    a: "Match video length to the content's natural scope — but there's one hard threshold worth planning around. YouTube's Help Center confirms that videos must be at least 8 minutes long to enable mid-roll ad placements, which are ads inserted mid-video rather than only at the start. For monetized creators, this threshold is worth targeting deliberately. Beyond that, the principle YouTube Creator Academy reinforces is that audience retention percentage matters more than absolute length — a 10-minute video where viewers watch 70% drives more distribution than a 20-minute video at 30%. Educational and tutorial content tends to support longer videos naturally. Short-form commentary and quick tips suit 4–7 minutes. Match the format to the idea, then check whether the natural length clears the mid-roll threshold if monetization is a priority.",
  },
  {
    q: "Does YouTube Studio help with video idea research?",
    a: "Yes — and most creators underuse it. YouTube Studio includes an Inspiration tab (under the Content section) that surfaces trending topics in your specific niche based on your channel's content history and audience. It shows what topics are gaining search momentum, what viewers on channels similar to yours are watching, and what types of videos are performing well in your category right now. This is first-party data from YouTube's own algorithm — more reliable than third-party trend tools because it reflects actual platform activity in your specific niche. Use it alongside YouTube's search autocomplete (which reflects real search queries) and your own Analytics section (which shows which of your past videos drove the highest watch time) to build a data-informed idea pipeline before generating creative angles with this tool.",
  },
  {
    q: "Can I generate video ideas for any niche with this tool?",
    a: "Yes — the AI-powered YouTube Video Idea Generator works across all niches. Enter any niche — finance, fitness, gaming, cooking, tech, beauty, business, travel, parenting, education, or anything else — and the AI expands your input into related content angles and keyword clusters specific to your category before generating ideas. The tool applies proven video formulas to whatever niche you enter, weighting them based on your selected content type. The result feels native to your channel rather than generic because the AI understands topic adjacency — it doesn't just keyword-match, it contextualizes ideas within the broader content landscape of your niche.",
  },
  {
    q: "Should my video titles be questions or statements?",
    a: "Both formats work — the choice should follow the formula, not personal preference. Statement titles suit controversy, warning, and authority formats: 'Stop Making These 7 Thumbnail Mistakes,' 'The Truth About Passive Income on YouTube.' Question titles suit curiosity-gap and validation formats: 'Is YouTube Still Worth It in 2026?', 'Can a New Creator Hit 1,000 Subscribers in 30 Days?' YouTube's Creator Academy notes that your title is a direct signal to viewers about what to expect — mismatching the title format to the content format creates a promise-delivery gap that drives early drop-off. Pick the format that naturally reflects what the video delivers, then use the YouTube Title Generator to refine the exact wording for maximum CTR.",
  },
  {
    q: "Is this YouTube Video Idea Generator free to use?",
    a: "Yes — completely free with no account required, no signup, and unlimited generation sessions. The generator is powered by AI and produces a full idea bank in seconds. Generate as many batches as you need, choosing different content types and niches freely. Hit Generate again for a completely fresh set of ideas whenever you want new options.",
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

          {/* Section 1: Why systematized ideation matters */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why YouTube's 2.7 Billion Users Create an Idea Problem — Not an Opportunity
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube has <strong className="text-foreground">2.7 billion monthly active users</strong> (Statista, 2024) and over 800 million videos indexed on the platform. That scale means every niche is competitive, every generic topic is already covered, and the ideas that perform are the ones that find a specific angle, formula, or audience gap that others have missed. YouTube's Creator Academy frames this directly: it recommends creating content that your audience is actively searching for — which requires knowing both what they search and what's already well-covered before you film.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The creators who publish consistently don't wait for inspiration — they use systematic frameworks. Every niche has a finite set of proven content formulas: beginner guides, common mistakes, product comparisons, 30-day experiments, controversial takes, definitive rankings. Apply those formulas to your niche's specific keyword space weekly, and you never face a blank calendar. Our generator does this automatically: enter your niche, choose your content type, and a bank of targeted ideas appears in seconds — each grounded in a formula with a documented track record for click-through rate and audience retention.
            </p>

            {/* Citation capsule */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">What YouTube's own data says about ideation</strong>
              YouTube's{" "}
              <a href="https://creatoracademy.youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Creator Academy
              </a>{" "}
              identifies audience retention — the percentage of a video that people watch — as one of the most important metrics on the platform, and explicitly recommends creating content your audience is actively searching for. With{" "}
              <a href="https://www.statista.com/statistics/272014/global-social-networks-ranked-by-number-of-users/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                2.7 billion monthly users
              </a>{" "}
              (Statista, 2024) and 800M+ videos on the platform, the ideas that win aren't the most creative — they're the ones matched to proven formulas and aligned with what viewers are already searching for.
            </div>
          </div>

          {/* Section 2: The content formulas */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The Video Formulas Behind High-Retention YouTube Content
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's Creator Academy identifies audience retention as a primary ranking signal — which means the ideas that drive the most distribution are the ones that keep viewers watching, not just the ones that get clicked. High-retention ideas consistently use one of a set of proven psychological structures that set a clear expectation and deliver on it fully. Our generator applies these formulas to your specific niche:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[
                { formula: "Curiosity Gap", example: "'What Actually Happens When You Post Every Day'", driver: "Creates an information void viewers feel compelled to fill — strong CTR and completion" },
                { formula: "Loss Aversion", example: "'Stop Making These 5 YouTube Mistakes'", driver: "Activates the psychological pain of potential loss — high CTR from urgency" },
                { formula: "Experiment / Challenge", example: "'I Tried X for 30 Days — Here's What Happened'", driver: "Uncertain outcome creates natural suspense that boosts average view duration" },
                { formula: "Contrarian Take", example: "'The Truth About Passive Income on YouTube'", driver: "Challenges existing beliefs — strong click-through from viewers seeking validation" },
                { formula: "Definitive Guide", example: "'The Complete Beginner's Guide to X in 2026'", driver: "High search volume, long-term traffic, high trust signal for new audiences" },
                { formula: "Comparison / Ranking", example: "'Best Budget Cameras for YouTube in 2026 (Ranked)'", driver: "Attracts decision-stage viewers with high purchase and engagement intent" },
              ].map(({ formula, example, driver }) => (
                <div key={formula} className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <div className="font-semibold text-sm text-foreground mb-1">{formula}</div>
                  <div className="text-xs text-primary mb-1 italic">{example}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{driver}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Pair your idea with an{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">optimized YouTube title</Link>{" "}
              and a{" "}
              <Link href="/tools/youtube-script-generator" className="text-primary hover:underline font-medium">structured script</Link>{" "}
              to convert each formula into a video that delivers on its promise and drives the retention YouTube's algorithm rewards.
            </p>
          </div>

          {/* Section 3: YouTube Studio Inspiration tab — exclusive Tier 1 content */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How to Use YouTube Studio's Inspiration Tab Alongside This Generator
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators don't know that YouTube Studio includes a built-in idea research tool. The <strong className="text-foreground">Inspiration tab</strong> — found in YouTube Studio under the Content section — surfaces trending topics in your specific niche based on your channel's content history and audience. It shows which topics are gaining search momentum in your category right now, pulled directly from YouTube's own algorithm data. This is first-party trend data that no third-party tool can replicate.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Use the Inspiration tab to identify timely topics with algorithmic momentum, then use this generator to build the creative angle — the formula, hook, and content structure — that turns a trending topic into a high-retention video. YouTube's own autocomplete search bar provides a second first-party signal: type your niche keyword into YouTube Search and observe what completions appear. Those completions represent real search queries from real viewers, making them the most reliable demand-validation tool available before you invest time in production.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Combine three layers: YouTube Studio Inspiration (trend data), YouTube autocomplete (demand validation), and this generator (formula + angle). Together they give you ideas that are timely, searched-for, and structured to retain viewers — the three variables that matter most to YouTube's distribution algorithm. Build your calendar with at least 4 weeks of approved ideas ready, turn them into scripts with the{" "}
              <Link href="/tools/youtube-script-generator" className="text-primary hover:underline font-medium">Script Generator</Link>
              , and optimize each upload with the{" "}
              <Link href="/tools/youtube-seo-score-checker" className="text-primary hover:underline font-medium">SEO Score Checker</Link>.
            </p>
          </div>

          {/* Section 4: Feature grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Video Idea Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "AI-powered idea generation grounded in proven content formulas — not generic brainstorming prompts",
                "Content type selector — tutorial, review, vlog, list, story, challenge — each applies different formula weighting",
                "Target audience input — ideas are framed for your specific viewer demographic, not a generic creator audience",
                "Sourced to YouTube Creator Academy: ideas aligned with what audiences actively search for",
                "Pairs with YouTube Studio Inspiration tab — use both together for trend + formula coverage",
                "Works for any niche: finance, fitness, gaming, beauty, tech, cooking, education, business, and more",
                "Copy All — grab your full idea batch to paste into any content calendar or project management tool",
                "Unlimited regeneration — fresh batches on demand, no daily limits or paywalls",
                "Full workflow integration: go from idea to title, script, tags, description, and SEO check in one session",
                "100% free — no account, no signup, unlimited generation sessions",
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
            "Be specific with your niche input — 'personal finance for college students' produces far more targeted ideas than just 'finance'. The more precisely you describe your audience and niche, the more the AI can match ideas to what that specific group is searching for.",
            "Validate ideas using YouTube's own autocomplete — type your generated idea's title phrase into YouTube Search and observe the completions. Autocomplete reflects real viewer searches; if your phrase autocompletes with variations, search demand is confirmed before you film a single frame.",
            "Check YouTube Studio's Inspiration tab before each filming batch — it surfaces trending topics in your niche based on your channel's history. First-party trend data from YouTube's algorithm is more reliable than any third-party tool for identifying what your specific audience is watching right now.",
            "Mix evergreen and timely ideas in your calendar — many successful creators aim for roughly 70% evergreen content (tutorials, guides, comparisons) to compound search traffic long-term, with 30% timely or trending content for immediate algorithmic momentum. Treat this as a strategic guideline, not a rigid rule.",
            "The opening hook is as important as the idea itself — YouTube's Creator Academy calls the first seconds 'critical.' An idea with a weak hook generates clicks but low retention, which suppresses distribution. Once you've chosen an idea, spend as much time on the hook as on the content plan.",
            "Pair high-virality ideas with strong thumbnails — YouTube's Creator Academy explicitly calls thumbnails 'the most powerful marketing tool you have.' A great idea with a weak thumbnail underperforms a mediocre idea with a compelling visual. Idea selection and thumbnail concept should be planned together.",
            "Use generated ideas to diagnose your niche fit — if strong content formulas feel forced or off-brand for your channel, that's a signal your niche definition may need narrowing. The best-performing channels have a clear, specific content promise that every video reinforces.",
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
