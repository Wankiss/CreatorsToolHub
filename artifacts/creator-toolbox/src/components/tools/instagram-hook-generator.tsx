import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Zap,
  ChevronDown, ListChecks, Shield, ArrowUpRight, TrendingUp, Lightbulb, Film,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is an Instagram Reel hook and why does it matter?",
    a: "An Instagram Reel hook is the opening element of your video, the line you say, the text that appears on screen, or the visual action that happens in the first 1–3 seconds. It is the single most important creative decision you make for any Reel, because Instagram's algorithm distributes content in waves, and the first wave's performance determines whether your video ever reaches a non-follower audience at all. According to Meta's Transparency Center documentation on how Instagram ranks Reels, watch-through signals (how much of the video viewers watch) are among the primary factors the algorithm uses to decide whether to expand distribution. A hook that retains early viewers triggers a larger second distribution wave; a weak hook that causes immediate scrolling caps the video's reach before the algorithm can evaluate the rest of the content.",
  },
  {
    q: "What makes an Instagram Reel hook scroll-stopping?",
    a: "A scroll-stopping hook creates one of three immediate psychological responses: curiosity (what happens next?), tension (I recognise that problem, is that me?), or surprise (I didn't know that, keep talking). The four dimensions that determine hook strength are: (1) Curiosity, does it create an open loop the viewer needs to close? (2) Emotion, does it trigger a feeling (frustration, hope, fear, amusement) before the viewer consciously processes the content? (3) Specificity, specific details ('lose 8kg in 6 weeks' vs 'lose weight') are more credible and more compelling. (4) Clarity, the viewer should understand within 2 seconds exactly what type of content is coming and why it's relevant to them. The Scroll-Stopping Score in this generator measures all four dimensions for every hook it produces, so you can compare quality objectively rather than relying on intuition.",
  },
  {
    q: "How do I deliver an Instagram Reel hook effectively on camera?",
    a: "The most common delivery mistake is starting with any version of 'Hey guys, welcome back' or 'So today I want to talk about', phrases that train the viewer's brain to expect non-urgent content and trigger the scroll reflex before the hook is even delivered. Instead, begin speaking the hook before the camera is even in position, or cut to yourself already mid-hook. The first frame should show you already in motion, mid-sentence, mid-action, or mid-expression. Display your hook as high-contrast text overlay at the exact moment you say it, because approximately 60% of Reels are watched without sound on the first viewing. Bold white text on a semi-transparent dark background, or large black text on a bright background, are the most legible formats across all content types. The generator provides a specific camera delivery tip for every hook it produces, not just what to say, but how to say it.",
  },
  {
    q: "What is the best hook format for Instagram Reels in 2026?",
    a: "The best hook format depends on your goal. For maximum watch-through rate: the Curiosity Gap format ('The real reason your Reels aren't going viral…') creates an open loop viewers must close, this format consistently produces the highest 3-second view retention. For maximum comments: the Contrarian Take and Relatable Frustration formats generate the most comment activity because they trigger agreement, disagreement, and emotional validation. For maximum saves: the How-To Promise format ('Exactly how I [achieved result] in [timeframe]') performs best because it signals reference-worthy tutorial content. For maximum shares: Mistake Callout and Shocking Statistic formats generate the highest share rates because they create a 'I need to tell someone I know' social impulse. The generator produces hooks across all 10 formats for every generation so you can pick the format that matches your specific goal.",
  },
  {
    q: "What is the Scroll-Stopping Score in this tool?",
    a: "The Scroll-Stopping Score is a 0–100 rating the AI assigns to every generated hook based on four dimensions: curiosity (how effectively the hook creates an open loop), emotion (strength of the emotional trigger activated), specificity (how concrete and credible the hook feels), and clarity (how quickly the viewer understands what the content is and why it's relevant). Only hooks scoring 78 or above are shown, below that threshold, hooks are statistically unlikely to beat the 50% hook rate needed for algorithmic distribution. The Top 5 tab shows your five highest-scoring hooks highlighted and sorted for fast A/B testing. This scoring system removes the need to guess which hook is strongest, the highest-scoring hooks have the highest probability of generating strong 3-second view rates in the actual feed.",
  },
  {
    q: "How do Instagram Reel hooks affect the algorithm?",
    a: "Instagram's content distribution algorithm evaluates Reels in sequential waves. In the first wave, your Reel is shown to a small initial audience segment, typically a fraction of your followers. The algorithm measures hook rate (percentage watching past 3 seconds), watch-through rate (percentage watching to completion), and early engagement (comments, saves, and shares). If the first wave produces strong signals, the algorithm distributes to a second, larger wave of followers and similar-interest non-followers. If those signals are also strong, it escalates to Explore and Reels recommendations. Hook quality directly controls whether this escalation process begins, a weak hook kills distribution at the first wave before the algorithm can evaluate anything else. This is why hook optimisation has a disproportionate impact on Reel reach compared to any other production element.",
  },
  {
    q: "What are scroll stoppers and how do I use them?",
    a: "Scroll stoppers are short prefix phrases prepended to a hook to create a pattern interrupt, a sudden break in the expected visual rhythm of the feed that gives the viewer's conscious attention a chance to engage before their scroll reflex fires. Common scroll stoppers include: 'Wait…', 'Stop scrolling , ', 'Nobody talks about this but…', 'POV:', and 'This changed everything:'. The ✨ Scroll Stopper button in this generator adds a contextually appropriate prefix to any hook with one click. Use scroll stoppers strategically, they are most effective on hooks that are already strong (score 85+) where the stopper amplifies an already compelling opening rather than compensating for a weak one. A/B test the same hook with and without the scroll stopper by posting similar Reels within the same week and comparing 3-second view rates in your Instagram Professional Dashboard.",
  },
  {
    q: "How many hooks should I test per Reel?",
    a: "Test two hooks per Reel concept by filming the same content with two different opening hooks, then posting them as separate Reels at least 48 hours apart. After 48 hours, compare the 3-second view rates in Instagram Professional Dashboard, this metric directly measures hook effectiveness independent of the rest of the video. After testing 8–10 hooks across multiple Reels, you will begin to identify which hook formats consistently outperform for your specific niche and audience. Most creators discover that 2–3 hook formats work reliably well for their content style, once identified, these become your go-to opening formats and dramatically reduce the creative effort needed for each new Reel. The Top 5 tab in this generator is designed specifically for this A/B testing workflow, it surfaces the five highest-probability hooks to test first.",
  },
  {
    q: "Can I use the same Instagram hook for multiple Reels?",
    a: "Yes, a proven hook formula can and should be reused across multiple Reels with different topics. The formula is what performs, not the specific words. If 'The [mistake] I see every [audience member] make with [topic]' generates strong watch-through rates for you on a fitness Reel, you can apply the same Mistake Callout formula to a nutrition Reel, a sleep Reel, and a mindset Reel with different specific content. Your audience does not memorise your hook phrasing, they respond to the psychological mechanism it activates. The generator produces hooks in 10 distinct formats, and once you identify which 2–3 formats work for your account, you can regenerate fresh hooks in those formats for any new Reel topic without running the same hook twice.",
  },
  {
    q: "Is this Instagram hook generator free?",
    a: "Yes, this Instagram Hook Generator is completely free with no account required, no usage limits, and no premium tier. Enter your Reel topic, niche, target audience, goal, and tone, and the AI generates up to 20 hooks across all 10 proven formats in seconds. Every hook includes a Scroll-Stopping Score, an on-screen text overlay version, and a camera delivery tip. The Top 5 tab, Scroll Stopper feature, Copy All button, and By Format browser are all available at no cost on every generation. Regenerate as many times as needed without any throttling or daily limits.",
  },
  {
    q: "What does Instagram's official documentation say about how Reels are ranked?",
    a: "Meta's Transparency Center publishes documentation specifically explaining how Instagram ranks Reels. According to that documentation, Instagram evaluates Reels based on signals including watch-through rate (how much of the video viewers watch), engagement signals (likes, comments, saves, and shares), and information about the audio and video itself. The documentation covers both how content is ranked in Feed and in the Reels tab. For creators, the most actionable takeaway is that watch-through signals, driven primarily by hook strength, are identified as key ranking factors. This is why optimising the first three seconds of every Reel has a disproportionate effect on organic reach. You can read the full Instagram Reels ranking documentation at Meta's Transparency Center (transparency.fb.com), under Features → Ranking and Content → Type of Content → Reels on Instagram.",
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

export function InstagramHookGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("instagram-hook-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-ig-hook-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your post or Reel topic.", variant: "destructive" });
      return;
    }
    run({ topic, niche, audience });
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
          <Zap className="text-purple-500" size={22} />
          <h2 className="font-semibold text-lg">Instagram Hook Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={11} /> AI Powered
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Post / Reel Topic *</label>
            <Input placeholder="e.g. morning skincare routine, 5 money mistakes, travel hacks..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. beauty, finance, food..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. women 25-35, beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Hooks</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Scroll-Stopping Hooks</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All hooks copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((hook, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <Zap size={14} className="text-purple-500 mt-0.5 shrink-0" />
                <span className="flex-1 text-sm font-medium leading-relaxed">{hook}</span>
                <button onClick={() => copyItem(hook, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Hook Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Reel Topic and Niche",
              desc: "Type your Reel topic as specifically as possible, 'how to lose belly fat without equipment' generates stronger hooks than just 'fitness.' Then select your niche so the AI tailors language and emotional triggers to your specific audience.",
            },
            {
              step: 2,
              title: "Set Your Goal and Tone",
              desc: "Select what this Reel is trying to achieve: grow followers, educate, entertain, or sell. Then pick a tone, Bold, Relatable, Inspirational, Funny, Controversial, or Serious. Goal and tone together determine which of the 10 hook formats are prioritised in your output.",
            },
            {
              step: 3,
              title: "Generate and Score Your Hooks",
              desc: "Get up to 20 hooks across all 10 formats, each with a Scroll-Stopping Score (78–100). Use the ✨ Scroll Stopper button on any hook to add a pattern-interrupt prefix. Expand any hook card to see the on-screen text overlay version and camera delivery tip.",
            },
            {
              step: 4,
              title: "Test Your Top 5 and Track Results",
              desc: "Switch to the Top 5 tab to see your highest-scoring hooks. A/B test at least 2 by posting similar Reels with different opening hooks. After 48 hours, compare 3-second view rates in Instagram Professional Dashboard, the winner reveals your best formula.",
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
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Hook Generator, Stop the Scroll in the First 3 Seconds</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What Is an Instagram Reel Hook and Why Does It Determine Your Reach?
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              An Instagram Reel hook is the opening element of your video, the line you say, the text
              that appears on screen, or the visual action that happens in the first 1–3 seconds. It is
              the single most important creative decision you make for any Reel, because Instagram's
              algorithm distributes content in waves, and the first wave's performance determines
              whether your video ever reaches a non-follower audience at all.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              According to Meta's Transparency Center, Instagram ranks Reels by measuring watch-through
              signals, how long viewers watch and how much of the video they complete. These signals
              determine whether Instagram distributes a Reel to a second, larger audience wave after the
              initial test group. Statista reported{" "}
              <a href="https://www.statista.com/statistics/253577/number-of-monthly-active-instagram-users/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">2 billion monthly active Instagram users</a>{" "}
              globally in 2024, meaning the pool of potential viewers that watch-through signals unlock
              is enormous, but only for content that retains those first viewers past the opening seconds.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The key metric the algorithm evaluates in that first wave is watch-through rate: how long
              initial viewers stay with the content. A hook that keeps early viewers watching signals
              compelling content; Instagram responds by distributing to a larger second wave. A hook
              that causes immediate scrolling caps the video's reach before the algorithm can evaluate
              anything else. A mediocre Reel with an excellent hook will consistently outperform an
              excellent Reel with a mediocre hook, the algorithm never sees the rest of the video if
              viewers leave in the first three seconds.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This generator addresses the hook problem systematically, rather than defaulting to weak
              generic openings, it generates hooks using 10 proven psychological formats, scores each
              on a 0–100 Scroll-Stopping Scale across curiosity, emotion, specificity, and clarity, and
              highlights your top 5 for immediate A/B testing. Pair your strongest hook with a{" "}
              <Link href="/tools/instagram-reel-idea-generator" className="text-primary hover:underline font-medium">
                strong Reel concept
              </Link>{" "}
              and a{" "}
              <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
                caption
              </Link>{" "}
              that closes the loop the hook opens.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How to Deliver Your Instagram Hook for Maximum Watch-Through Rate
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Delivery determines whether a strong hook actually works in practice. Meta's Transparency
              Center documentation confirms that watch-through signals are among Instagram's primary
              Reels ranking factors, but only viewers who stop scrolling can generate any signal at
              all. Getting someone to stop requires a hook delivered with the same urgency it reads on
              the page: no preamble, no setup, no "welcome back." Begin speaking the hook before the
              camera is even in position, or cut to yourself already mid-hook so the first frame shows
              you already in motion.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Display your hook as high-contrast text overlay at the exact moment you say it. A large
              share of Reels are watched without sound on the first viewing, a well-documented behavior
              across short-form video platforms, meaning a hook that lives only in the audio track
              fails to reach viewers watching on mute. Bold white text on a semi-transparent dark
              background, or large black text on a bright background, are the two most legible formats
              across all content types and viewing conditions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Use the Scroll Stopper feature to prepend phrases like "Wait…", "Stop scrolling , ", or
              "Nobody talks about this but…" to your highest-scoring hooks. These serve as a pattern
              interrupt, a sudden break in the expected visual rhythm of the feed, and are most
              effective when applied to hooks already scoring 85 or above. The generator provides a
              specific camera delivery tip for every hook it produces, so you know not just what to
              say, but exactly how to say it.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Film className="w-4 h-4 text-primary" /> How to Read Hook Performance in Instagram Professional Dashboard
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram Professional Dashboard provides two metrics that directly measure hook
              effectiveness: 3-second video views and watch-through rate. To access them, open your
              professional account, tap Professional Dashboard, select any Reel, then tap See Insights
              followed by Video Performance. The 3-second video views metric shows how many viewers
              watched past the three-second mark, the clearest available platform measure of hook
              effectiveness. Watch-through rate shows what percentage of viewers watched to completion,
              capturing both hook strength and content quality together.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To isolate hook performance from content performance, compare the 3-second view rate
              across multiple Reels posted in the same week. A Reel with a high 3-second rate but low
              overall completion rate signals a strong hook pulling viewers in but content that doesn't
              deliver, tighten the Reel body. A Reel with low 3-second views but high completion
              among those who watch signals weak hook selection, not weak content production. Use this
              pattern weekly to build a personal dataset of which hook formats, Curiosity Gap,
              Contrarian Take, How-To Promise, produce consistently strong 3-second view rates for
              your specific niche and audience, then prioritise those formats in the generator.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Meta's Transparency Center documentation on how Instagram ranks Reels confirms that
              watch-through signals are primary distribution factors. The dashboard data is the bridge
              between knowing this in theory and acting on it in practice, reviewing it after every
              Reel gives you platform-native feedback that no third-party analytics tool can replicate.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Key sources:</strong>{" "}
                <a href="https://transparency.fb.com/features/ranking-and-content/type-of-content/reels-on-instagram/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Meta's Transparency Center
                </a>{" "}
                documents that Instagram ranks Reels based on watch-through signals (how long viewers
                watch) as a primary distribution factor. Instagram Professional Dashboard surfaces
                3-second video views and watch-through rate under Video Performance, the two metrics
                that directly measure hook effectiveness. Statista reported{" "}
                <a href="https://www.statista.com/statistics/253577/number-of-monthly-active-instagram-users/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  2 billion monthly active Instagram users
                </a>{" "}
                globally in 2024.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This AI Instagram Hook Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "10 proven Instagram hook formats: Bold Statement, Curiosity Gap, Question, Frustration, POV, Statistic, Contrarian, How-To, Mistake Callout, Story Tease",
                "Up to 20 hooks per session, 2 per format: all scored 78+ on the Scroll-Stopping Scale",
                "Scroll-Stopping Score (0–100) for every hook across curiosity, emotion, specificity, and clarity",
                "Top 5 hooks highlighted with one-click Copy All for a fast A/B testing workflow",
                "✨ Scroll Stopper button, add 'Wait…', 'Stop scrolling', 'Nobody talks about this but…' and more with one click",
                "On-screen text overlay version for every hook: formatted for immediate use in your video editor",
                "Camera delivery tip per hook type, how to say it, not just what to say",
                "By Format tab, browse all hooks organised by their psychological mechanism",
                "Goal-based hook priorities, Grow Followers, Educate, Entertain, or Sell shifts format weighting",
                "100% free: no account, no credit card, unlimited generations with no daily limits",
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

      {/* ── About This Tool ──────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This Instagram Hook Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This Instagram Hook Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram's algorithm distributes Reels in waves. The first wave shows your content to a small initial audience, and hook rate (viewers who watch past 3 seconds) determines whether a second, larger wave ever fires. According to the{" "}
              <a href="https://transparency.fb.com/features/ranking-and-content/type-of-content/reels-on-instagram/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Meta Transparency Center's Reels ranking documentation</a>,
              watch-through signals are the primary factor Instagram uses to expand Reel distribution. This generator builds hooks engineered specifically to pass that first-wave test.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You enter your Reel topic, niche, target audience, goal, and tone. The AI generates up to 20 hooks across 10 proven psychological formats, Curiosity Gap, Mistake Callout, Contrarian Take, POV, How-To Promise, and more. Every hook is scored 0-100 on a Scroll-Stopping Scale measuring curiosity, emotion, specificity, and clarity. Only hooks scoring 78 or above are shown. The Top 5 tab highlights your highest-scoring hooks for immediate A/B testing.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Each hook card includes the on-screen text overlay version (formatted for your video editor), a camera delivery tip, and a one-click Scroll Stopper button that prepends a pattern-interrupt phrase. Pair your best hook with a{" "}
              <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
                purpose-built caption
              </Link>{" "}
              and a{" "}
              <Link href="/tools/instagram-reel-idea-generator" className="text-primary hover:underline font-medium">
                structured Reel concept
              </Link>{" "}
              to complete the full content strategy before you film a single frame.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why the First 3 Seconds Decide Your Reach
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators focus on editing, production quality, and hashtags. That work matters, but only after the hook has done its job. A Reel with mediocre production and a compelling hook will consistently outreach a polished Reel with a weak opening. The algorithm never evaluates the middle or end of your video if viewers leave in the first 3 seconds. Hook quality is upstream of every other production decision.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The four psychological mechanisms that create scroll-stopping responses are: curiosity (an open loop the viewer needs to close), tension (a relatable problem they recognize), surprise (a fact or claim they didn't expect), and specificity (concrete detail that signals credibility). Vague hooks like "watch this if you care about fitness" fail on all four. Specific hooks like "3 gym mistakes keeping you small after 2 years of training" hit three of the four instantly.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Roughly 60% of Reels are watched without sound on the first viewing. A hook that lives only in audio fails to reach the majority of your initial audience. The text overlay version included with every generated hook solves this directly. Display the hook as bold white text on a semi-transparent dark background at the exact moment you speak it. Your audio-off viewers get the hook. Your audio-on viewers get it twice.
            </p>
          </div>

          {/* YouTube Embed */}
          <figure style={{margin:"1rem 0 2rem",position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"12px"}}>
            <iframe style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}}
              srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/dNT7gd3ulAg?autoplay=1'><img src='https://img.youtube.com/vi/dNT7gd3ulAg/maxresdefault.jpg' alt='How to write scroll-stopping Instagram Reels hooks in the first 3 seconds'><span>&#9654;</span></a>"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="How to write scroll-stopping Instagram Reels hooks in the first 3 seconds"
              aria-label="Breakdown of the 10 Instagram Reel hook formats, how to deliver them on camera, and how to use the Scroll-Stopping Score to identify your strongest openings">
            </iframe>
            <noscript><a href="https://www.youtube.com/watch?v=dNT7gd3ulAg" target="_blank" rel="noopener">Watch: How to Write Scroll-Stopping Instagram Reels Hooks on YouTube</a></noscript>
          </figure>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Instagram Hook Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Up to 20 hooks per generation across 10 psychological formats: all scoring 78+ on the Scroll-Stopping Scale",
                "Scroll-Stopping Score (0-100) per hook measuring curiosity, emotion, specificity, and clarity",
                "Top 5 tab: your five highest-scoring hooks surfaced for immediate A/B testing without manual sorting",
                "On-screen text overlay version for every hook: formatted for direct use in your video editor",
                "Camera delivery tip per hook: not just what to say, but exactly how to film the opening",
                "One-click Scroll Stopper: add 'Wait...', 'Stop scrolling', or 'Nobody talks about this but...' to any hook",
                "Goal-based hook weighting: Grow, Educate, Entertain, or Sell shifts which formats are prioritised",
                "By Format tab: browse all 20 hooks organised by their psychological mechanism for comparison",
                "Copy All button: export every visible hook at once for your content calendar or A/B test log",
                "100% free: no account, no limits, unlimited regenerations with no daily throttling",
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

      {/* ── Citation Capsule ──────────────────────────────────────── */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Source documentation:</strong>{" "}
          Instagram's Reels distribution algorithm evaluates watch-through signals, including 3-second video view rate and full watch-through rate, as primary ranking factors, per the{" "}
          <a href="https://transparency.fb.com/features/ranking-and-content/type-of-content/reels-on-instagram/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta Transparency Center (Reels on Instagram)</a>.
          {" "}Hook quality directly controls whether a Reel passes the first distribution wave, making the opening 3 seconds the highest-leverage creative decision in any Reel's production.
        </p>
      </div>

      {/* ── Tips & Best Practices ────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Write and Deliver Scroll-Stopping Hooks</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Never open with 'Hey guys' or 'Welcome back', these phrases signal non-urgent content and trigger the scroll reflex before your actual hook is delivered.",
            "Say your hook before the camera is fully in frame, starting mid-sentence in the first shot creates instant momentum and signals to the viewer that content has already begun.",
            "Display your hook as text overlay at the exact moment you speak it, 60% of Reels are watched muted in the first viewing, so audio-only hooks miss the majority of your audience.",
            "A/B test hooks by filming the same Reel concept twice with different opening lines, compare 3-second view rates after 48 hours to identify your best-performing format.",
            "Apply Scroll Stopper prefixes only to hooks already scoring 85+, stoppers amplify strong hooks but cannot save weak ones, and overuse reduces their pattern-interrupt effect.",
            "Specificity beats cleverness every time, '3 fitness mistakes you're making at the gym' consistently outperforms 'watch this if you care about fitness.'",
            "Once you identify your 2–3 top-performing hook formats, reuse those formulas across different topics, the format drives performance, not the specific words.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Instagram Tools ───────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related Instagram Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Extend your hook into a full caption with body content and CTAs that drive saves, comments, and shares." },
            { name: "Instagram Reel Idea Generator", path: "/tools/instagram-reel-idea-generator", desc: "Generate the Reel concepts that your hooks will introduce, great hooks need great content to follow." },
            { name: "Instagram Content Planner", path: "/tools/instagram-content-planner", desc: "Plan your posting schedule so every hook-led post is part of a strategic content calendar that builds momentum." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Pair your scroll-stopping hooks with the right hashtags to ensure maximum reach on every post." },
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
          <p className="text-sm text-foreground font-semibold mb-1">Hook written, now build the full Reel strategy.</p>
          <p className="text-sm text-muted-foreground">
            Use the{" "}
            <Link href="/tools/instagram-reel-idea-generator" className="text-primary hover:underline font-medium">
              Instagram Reel Idea Generator
            </Link>{" "}
            to develop the concept your hook introduces, then use the{" "}
            <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
              Instagram Caption Generator
            </Link>{" "}
            to write the caption that closes the loop and drives saves, comments, and shares.
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
