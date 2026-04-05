import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, ScrollText,
  ListChecks, ChevronDown, BarChart2, Zap, Shield,
  Search, TrendingUp, ArrowUpRight, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok script and why do you need one?",
    a: "A TikTok script is a structured written plan for your video that outlines every spoken line, visual cue, and section timing before you start filming. Scripting your TikTok videos is one of the highest-leverage improvements most creators can make because it eliminates filler words, ensures you hit your key point within the attention window, and allows you to engineer the hook, body, and CTA for maximum retention. Unscripted videos typically run 20–40% longer than necessary, and that extra length directly reduces completion rate — TikTok's most important content quality signal. A tight script keeps you on time, on message, and on algorithm.",
  },
  {
    q: "How long should a TikTok video script be?",
    a: "Script length should match your video's target duration. For a 15-second video, write 30–50 words (2.5–3 words per second at a comfortable speaking pace). For a 30-second video, write 60–90 words. For a 60-second video, write 120–160 words. For a 90-second video, write 180–240 words. The most common scripting mistake is writing too much — a 200-word script for a 30-second video forces rushed delivery, which hurts watch time. Our generator auto-calibrates word count to your selected duration so you always have a script that fits. For monetization eligibility on TikTok's creator program, aim for 60–90 second videos consistently.",
  },
  {
    q: "What makes a TikTok hook go viral?",
    a: "A viral TikTok hook combines three elements: pattern interruption (it visually or auditorily breaks the scrolling expectation), an information gap (it creates tension between what the viewer knows and what the video promises), and personal relevance (the viewer feels the video is directly addressing them). The opening line should ideally name a specific pain point, result, or identity that your target viewer immediately recognizes. Hooks that begin with 'If you [specific identity],' 'The reason most people [fail at X],' or 'I tried X for Y days and [unexpected result]' consistently outperform generic topic introductions because they immediately signal to the viewer that what follows is relevant to them specifically.",
  },
  {
    q: "What is a re-hook and why does it matter for 60-second TikToks?",
    a: "A re-hook is a secondary attention-retention line placed at approximately the 15–20 second mark of a longer video to recapture viewers who survived the opening hook but are considering scrolling away. Viewer dropout on TikTok is highest in the first 3 seconds, drops sharply, and then peaks again around the 15–20 second mark as viewers evaluate whether the video is delivering on its hook's promise. A re-hook at this point — typically a preview of the most valuable or surprising information coming later in the video — resets engagement and pushes completion rate significantly higher. For 60-second scripts, our generator includes at least one re-hook in the body section automatically.",
  },
  {
    q: "What is the best TikTok video structure?",
    a: "The highest-performing TikTok video structure is Hook (0–3 seconds) → Re-hook or first value point (3–15 seconds) → Body with 2–3 key points or story beats (15–50 seconds) → CTA (final 5–10 seconds). The hook stops the scroll. The re-hook confirms the promise. The body delivers value quickly without padding. The CTA tells the viewer exactly what to do next — follow, comment, visit a link, or save the video. The most common structural mistake is burying the best information too late in the video. Viewers decide whether a video is worth watching within the first 5 seconds — the hook and opening body content need to signal value immediately.",
  },
  {
    q: "How do I write TikTok scripts for different video lengths?",
    a: "Each video length on TikTok requires a different structural approach. 15-second scripts should contain only a hook and a single sharp point — no body development, no lengthy CTA. 30-second scripts can include a hook, one key insight, and a brief CTA. 60-second scripts support the full Hook → Body → CTA structure with a re-hook and 2–3 value points. 90-second scripts can include a brief story or case study with a stronger proof element before the CTA. For each length, the hook-to-content ratio stays constant — the first 3 seconds must always be your strongest line regardless of total length. Our generator adjusts word count and section lengths automatically when you change the duration setting.",
  },
  {
    q: "How do I write a TikTok CTA that actually works?",
    a: "An effective TikTok CTA is specific, low-friction, and immediately relevant to what the viewer just watched. The three highest-converting CTA formats are: (1) The follow promise ('Follow me for part 2 tomorrow'), which works because it delivers anticipation rather than a generic follow request; (2) The comment prompt ('Comment 'yes' if this happened to you'), which generates engagement that boosts the video algorithmically; and (3) The save instruction ('Save this for when you need it'), which signals long-term value and improves the video's ranking signal. Avoid vague CTAs like 'follow me for more content' — they convert at a fraction of the rate of specific, benefit-driven alternatives.",
  },
  {
    q: "Can I use TikTok scripts for Instagram Reels and YouTube Shorts?",
    a: "Yes — TikTok scripts are directly transferable to Instagram Reels and YouTube Shorts with minimal modification. All three platforms use short-form vertical video and share the same core algorithmic mechanics: completion rate, engagement rate, and re-watch rate. The hook formula, body structure, and CTA approach that perform well on TikTok translate directly. The only adjustments needed are platform-specific CTA language (Instagram uses 'save' and 'follow,' YouTube uses 'subscribe' and 'like') and minor caption differences. Many creators film one video from a single script and post it across all three platforms, making scripting even more valuable as a content multiplier.",
  },
  {
    q: "What is the 'open loop' technique in TikTok scripts?",
    a: "The open loop technique is a scriptwriting method where you introduce a question, promise, or story setup early in the video but deliberately withhold the resolution until near the end. For example: opening with 'I made one change to my morning routine and it increased my productivity by 40% — I'll tell you exactly what it was in a second' creates an unresolved cognitive loop that the viewer's brain is uncomfortable leaving open. The psychological discomfort of unanswered questions — known as the Zeigarnik effect — drives viewers to watch longer in search of resolution, pushing completion rate higher. Our script generator builds open loops into the hook and re-hook sections for 60-second and longer scripts automatically.",
  },
  {
    q: "Is this TikTok Script Generator free?",
    a: "Yes — the TikTok Script Generator is completely free with no account, no signup, and no usage limits. Generate as many scripts as you need across any niche, duration, and tone combination. Every script output includes a full 3-section structure (Hook, Body, CTA) with auto-calculated timestamps, word count, Hook Score, and Retention Score — all at zero cost. You can also copy the hook only, CTA only, or the full script with one click. Our full suite of TikTok tools including the Hook Generator, Viral Idea Generator, Caption Generator, and Hashtag Generator are all free with no restrictions.",
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

export function TikTokScriptGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [duration, setDuration] = useState("60");
  const [tone, setTone] = useState("engaging");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("tiktok-script-generator");
  const { toast } = useToast();

  const script = outputs.join("\n");

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-tiktok-script-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic, niche, audience, duration, tone });
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast({ title: "Script copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ScrollText className="text-pink-500" size={22} />
            <h2 className="font-semibold text-lg">TikTok Script Generator</h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            <Sparkles size={12} /> Powered by AI
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input placeholder="e.g. 3 signs you're bad with money, how I lost 10kg..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. fitness, finance, lifestyle..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. young adults, beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={duration} onChange={e => setDuration(e.target.value)}>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
                <option value="90">90 seconds</option>
                <option value="180">3 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="engaging">Engaging</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="motivational">Motivational</option>
                <option value="funny">Funny</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Writing script with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Script</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {script && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your TikTok Script</h3>
            <Button variant="outline" size="sm" onClick={copyScript}>
              {copied ? <><Check size={14} className="mr-1 text-green-500" />Copied!</> : <><Copy size={14} className="mr-1" />Copy Script</>}
            </Button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border max-h-[500px] overflow-y-auto">
            {script}
          </pre>
        </Card>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Script Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Video Idea",
              desc: "Type your video topic or idea — the more specific the better. 'How I lost 10kg without the gym' generates sharper AI scripts than 'weight loss.' Include the core result, story, or insight your video will deliver.",
            },
            {
              step: 2,
              title: "Choose Niche, Tone, and Length",
              desc: "Select your niche, target audience, and tone: Educational for how-to content, Motivational for inspiration, or Entertaining for fun content. Then choose your duration — the AI calibrates word count and structure automatically to match realistic speaking speed.",
            },
            {
              step: 3,
              title: "Review the Timing Breakdown",
              desc: "Each AI-generated script is broken into labeled sections: HOOK (with timestamp), BODY (with timestamp), and CTA (with timestamp). The Hook section is the most important part — review it first and ensure it's compelling before filming.",
            },
            {
              step: 4,
              title: "Copy, Film, and Test",
              desc: "Copy the full script directly into your notes app or teleprompter. Film your video, then post it. Compare 3-second retention rate and completion rate in TikTok Analytics. The script format with the best retention becomes your template for future content.",
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Script Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How This TikTok Script Generator Works
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free AI-powered TikTok Script Generator produces complete script variations per generation,
              each using a different proven viral formula: "Stop Doing This," "Nobody Tells You," "Here's
              How I Did It," "If You're [Audience]," "3 Mistakes," and "This Changed Everything." Scripts
              are selected based on your chosen tone — Educational tone prioritizes structured teaching
              formats, Storytelling tone uses narrative-first approaches, Inspirational tone leads with
              transformation, Funny tone uses humor and relatability triggers. Each formula is chosen
              because it maps to a proven viewer psychology pattern that consistently drives the completion
              rate and engagement rate TikTok's algorithm rewards.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every AI-generated script includes a Hook Score (1–10) and Retention Score (1–10) so you can
              immediately identify which script to prioritize. An internal quality gate evaluates hooks and
              auto-strengthens any that fail scroll-stop criteria before showing them in results. The
              generator also includes word count calibrated to your chosen duration — 15s (30–50 words),
              30s (60–90 words), 60s (120–160 words) — and section timestamps to guide your delivery
              pacing when filming.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The 15 supported niches each have niche-specific mistake lists, proven tips, audience
              language, and emoji anchors built into the AI prompt — so a finance script uses the vocabulary
              and framing that finance audiences respond to, while a fitness script uses the language
              patterns that resonate with workout audiences. This niche customization is what separates
              scripts that feel generic from scripts that feel written for a specific community.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Script Structure Determines TikTok Performance
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TikTok's algorithm has one primary objective: maximize total time spent on the platform. To
              achieve this, it uses completion rate — the percentage of viewers who watch your video to the
              end — as its most important content quality signal. A video that 60% of viewers watch to
              completion will be distributed exponentially wider than a video that 30% complete, even if
              both videos have the same total view count.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This is why structure matters more than production quality on TikTok. A well-scripted video
              filmed on a phone will consistently outperform a poorly structured video shot on professional
              equipment. The script determines where value is delivered, how quickly the hook pays off,
              whether there are pacing gaps that trigger scroll behavior, and whether the CTA converts
              viewers into followers or commenters. Pair your scripts with our{" "}
              <Link href="/tools/tiktok-hook-generator" className="text-primary hover:underline font-medium">
                TikTok Hook Generator
              </Link>{" "}
              to generate even more opening line options for any script's hook section.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The three-script variation approach in our generator solves the A/B testing problem that most
              creators ignore. Posting the same content with three different script structures across three
              days gives you direct data on which format — storytelling, educational, or list-based — your
              specific audience responds to most. After 2–3 weeks of testing, most creators identify a
              dominant format that becomes their default template. Start your ideation process upstream
              with our{" "}
              <Link href="/tools/tiktok-viral-idea-generator" className="text-primary hover:underline font-medium">
                TikTok Viral Idea Generator
              </Link>{" "}
              to find the trending concepts worth scripting.
            </p>
          </div>
        </div>
      </section>

      {/* ── What This Tool Includes ───────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">What This TikTok Script Generator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: <ScrollText className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "3 complete AI script variations per generation across 6 distinct viral formula styles" },
            { icon: <ListChecks className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Full 3-section structure per script: Hook, Body, and CTA with auto-generated timestamps" },
            { icon: <BarChart2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Word count calibrated to 15s (30–50w), 30s (60–90w), or 60s (120–160w) speaking speed" },
            { icon: <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Hook Score (1–10) and Retention Score (1–10) for every AI script to identify the strongest option" },
            { icon: <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Internal quality gate: hooks are evaluated and auto-strengthened if they fail scroll-stop criteria" },
            { icon: <Search className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "15 niche options with niche-specific mistake lists, proven tips, and audience language" },
            { icon: <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "5 tone modes (Educational, Funny, Bold, Storytelling, Inspirational) shaping script structure" },
            { icon: <Copy className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Copy buttons: Hook only, CTA only, and Full Script — paste directly into TikTok or notes app" },
            { icon: <ArrowUpRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Optional fields: target audience, key message, and custom CTA for script personalization" },
            { icon: <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Regenerate for unlimited fresh AI script variations on any topic — 100% free" },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              {icon}
              <p className="text-sm text-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tips & Best Practices ─────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices</h2>
        </div>
        <div className="space-y-3">
          {[
            { n: 1, tip: "Hook in the first 0.5 seconds — TikTok data shows 45% of viewers drop off in the first 3 seconds; your opening line is the single most important part of the script." },
            { n: 2, tip: "Script 60–90 second videos as your sweet spot — this length gets full credit in TikTok's monetization program and maintains strong completion rates." },
            { n: 3, tip: "Use a pattern interrupt every 15 seconds — a visual change, cut, or new point resets viewer attention and pushes completion rates above 80%." },
            { n: 4, tip: "Write scripts in second-person ('You need to know this') — direct address keeps viewers engaged and drives more saves and shares than third-person narration." },
            { n: 5, tip: "End every script with a loop-back to the opening hook — viewers who watch to the end and replay count as double-weight for the algorithm." },
            { n: 6, tip: "Prep a 'Part 2 bait' ending — 'I'll share the second step tomorrow' drives anticipation comments that boost your video for 24–48 hours after posting." },
            { n: 7, tip: "Script your pitch or CTA at the 80% mark — viewers who make it that far are your most engaged fans and far more likely to click, follow, or buy." },
          ].map(({ n, tip }) => (
            <div key={n} className="flex gap-4 p-4 rounded-xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{n}</div>
              <p className="text-sm text-foreground leading-relaxed">{tip}</p>
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
          <h2 className="text-2xl font-bold font-display text-foreground">Related TikTok Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              slug: "tiktok-hook-generator",
              icon: "🎣",
              name: "TikTok Hook Generator",
              desc: "Generate scroll-stopping opening lines to pair with your scripts and ensure viewers stay past the first 3 seconds.",
            },
            {
              slug: "tiktok-caption-generator",
              icon: "✍️",
              name: "TikTok Caption Generator",
              desc: "Write compelling captions with hooks and CTAs to complement your video script and drive comments and shares.",
            },
            {
              slug: "tiktok-viral-idea-generator",
              icon: "💡",
              name: "TikTok Viral Idea Generator",
              desc: "Get niche-specific viral content concepts to plan your next script around proven trending formats.",
            },
            {
              slug: "tiktok-hashtag-generator",
              icon: "#️⃣",
              name: "TikTok Hashtag Generator",
              desc: "Find the optimal hashtag mix to maximize reach once your scripted video is published.",
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
