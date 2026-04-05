import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Zap,
  ListChecks, ChevronDown, BarChart2, TrendingUp, Shield,
  Search, ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok hook and why does it matter?",
    a: "A TikTok hook is the opening line, visual, or statement that appears in the first 1–3 seconds of your video. It is the single most important element of any TikTok video because TikTok's algorithm measures what percentage of viewers watch past the first three seconds — and uses that 3-second view rate as one of its primary distribution signals. A strong hook that holds 80%+ of viewers past the opening gets pushed to progressively larger audiences. A weak hook that loses viewers immediately causes the algorithm to stop distributing the video, regardless of how good the rest of the content is. Your hook is not just a creative choice — it is an algorithmic lever.",
  },
  {
    q: "What makes a TikTok hook go viral?",
    a: "Viral TikTok hooks share four characteristics: (1) Pattern interruption — they break the visual or auditory expectation of the scroll so the brain pauses instead of continuing; (2) Information gap — they create a tension between what the viewer knows and what the hook promises, making clicking away feel uncomfortable; (3) Personal relevance — they use language that makes the viewer feel the video is specifically about them ('If you do X, you need to see this'); and (4) Implied payoff — they promise a clear value, transformation, or reveal that only watching the full video will deliver. Our AI hook generator applies all four of these mechanisms using five proven hook formulas tuned to your specific niche and content type.",
  },
  {
    q: "How do I deliver a TikTok hook effectively on camera?",
    a: "Hook delivery is as important as hook writing. The highest-performing delivery technique is to start speaking before the camera starts recording so you're already mid-sentence when the video begins — this creates immediacy and eliminates the awkward opening pause that signals to viewers they can safely scroll. Maintain direct eye contact with the lens for the entire hook. Speak with 20–30% more energy than feels natural — camera compression reduces perceived energy. For bold and statement hooks, lean slightly toward camera. For emotional or story hooks, use a softer tone with a brief pause before the key word. Our generator includes voiceover delivery tips for each hook type.",
  },
  {
    q: "How many TikTok hooks should I test?",
    a: "For any important video concept, test a minimum of 2–3 hooks before concluding which format works best for your audience. The fastest testing method is to film the same core video content three times with different opening hooks, then post them across different days or as separate videos. After 48 hours, compare the 3-second view rates in TikTok Analytics (Creator Tools → Analytics → Videos). The hook with the highest 3-second retention rate is your winner — use that formula as your baseline for future videos in the same content category. Most creators are surprised to find that the hook they thought would perform best rarely wins the A/B test.",
  },
  {
    q: "What is the TikTok Scroll-Stopping Score?",
    a: "The Scroll-Stopping Score is a 0–100 metric our AI assigns to each generated hook based on four weighted factors: pattern interruption strength (does the opening break expected scroll behavior?), information gap intensity (how much cognitive tension does the hook create?), personal relevance signals (does it use language that feels directed at the individual viewer?), and specificity (does it contain concrete details rather than vague generalities?). Only hooks scoring 80 or above are shown in results — lower-scoring hooks are filtered out automatically. A score of 80–89 indicates a strong hook. 90–100 indicates an exceptional hook that combines multiple high-leverage mechanisms.",
  },
  {
    q: "What is the best TikTok hook formula for educational content?",
    a: "For educational TikTok content, the two highest-performing hook formulas are the Mistake/Warning hook ('The biggest mistake people make when doing X is…') and the Information Gap hook ('What nobody tells you about X'). Both formulas work for educational content because they signal an information asymmetry — the viewer assumes they're about to learn something they didn't know, which creates a strong pull to watch. A close third is the Bold Statement hook ('X is not what you think it is') which challenges an assumption the viewer holds and creates cognitive dissonance that only watching resolves. Our generator applies niche-specific language to these formulas to maximize relevance.",
  },
  {
    q: "How do TikTok hooks affect the For You Page algorithm?",
    a: "TikTok's For You Page algorithm runs multiple distribution waves after a video is posted. In the first wave (typically 200–500 views), the algorithm shows your video to a small test audience and measures behavioral signals — primarily 3-second view rate, completion rate, and engagement rate. If the 3-second view rate exceeds approximately 60–70%, the algorithm considers the hook effective and pushes the video to a second, larger wave. Each wave uses progressively better signals, but the first wave data is critical because it determines whether the video ever reaches a significant audience. A hook that fails the first wave effectively caps the video's potential reach.",
  },
  {
    q: "Can I use the same hook for multiple TikTok videos?",
    a: "Yes — hook formulas can and should be reused across different video topics, but the specific wording should be adapted each time. If you discover that Question hooks consistently outperform Bold Statement hooks with your audience, use the Question format as your default structure and fill it with topic-specific language for each new video. What you should avoid is using the exact same opening line repeatedly, as returning viewers will recognize it and may perceive it as formulaic. The underlying psychological mechanism (curiosity gap, urgency, pattern interruption) can be consistent while the surface language stays fresh. Track which hook types perform best in your analytics and weight your generation toward those formulas.",
  },
  {
    q: "What is an open loop hook and how does it work?",
    a: "An open loop hook is a hook that deliberately withholds the resolution of a question or statement, forcing the viewer to keep watching to get closure. Examples include: 'I tried this for 30 days and the results were unexpected…', 'There's one thing I wish someone told me before I started…', and 'The reason most people fail at X has nothing to do with what you think.' The human brain has a documented psychological discomfort with unresolved questions — known as the Zeigarnik effect — which makes open loop hooks extremely effective at driving completion rate. Our generator produces open loop variants for every hook type, labeled clearly so you can identify and test them.",
  },
  {
    q: "Is this TikTok hook generator free?",
    a: "Yes — the TikTok Hook Generator is completely free with no account, no signup, and no usage limits. Generate as many hooks as you need across any niche, content type, and tone combination. Every output includes the hook text, a Scroll-Stopping Score, hook type label, on-screen text overlay version, voiceover delivery tips, and camera presence advice — all at zero cost. Our full suite of TikTok tools including the Viral Idea Generator, Script Generator, Caption Generator, and Hashtag Generator are all free with no restrictions.",
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

export function TikTokHookGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("bold");
  const [count, setCount] = useState("10");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("tiktok-hook-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-tiktok-hook-gen";
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
    run({ topic, niche, audience, tone, count: Number(count) });
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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Zap className="text-pink-500" size={22} />
            <h2 className="font-semibold text-lg">TikTok Hook Generator</h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            <Sparkles size={12} /> Powered by AI
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input placeholder="e.g. how to lose weight fast, 5 money habits..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. fitness, finance, beauty..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. women 25-35, college students..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="bold">Bold</option>
                <option value="shocking">Shocking</option>
                <option value="relatable">Relatable</option>
                <option value="curious">Curious</option>
                <option value="funny">Funny</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Number of Hooks</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={count} onChange={e => setCount(e.target.value)}>
                <option value="5">5 hooks</option>
                <option value="10">10 hooks</option>
                <option value="15">15 hooks</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Hooks</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Viral Hooks</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All hooks copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((hook, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <Zap size={14} className="text-pink-500 mt-0.5 shrink-0" />
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Hook Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Video Topic",
              desc: "Type your video topic as specifically as possible — for example, 'how to lose belly fat at home without equipment' rather than just 'fitness.' The more specific your topic, the more targeted and relevant the AI-generated hooks will be for your audience.",
            },
            {
              step: 2,
              title: "Choose Your Niche, Type, and Tone",
              desc: "Enter your content niche (fitness, business, beauty, etc.), target audience, and delivery tone (bold, shocking, relatable, curious, funny). These inputs shape the hook formula, language style, and psychological angle of every hook the AI generates.",
            },
            {
              step: 3,
              title: "Generate and Review Scored Hooks",
              desc: "Click Generate to instantly produce your chosen number of hooks — each scored on scroll-stopping potential with a hook type label. Every result is a high-quality opener engineered specifically for the 3-second TikTok retention window.",
            },
            {
              step: 4,
              title: "Test Your Top Hooks and Track Results",
              desc: "Copy your strongest hooks and A/B test at least 2 of them by posting the same content with different openers. After 48 hours, compare 3-second view rates in TikTok Analytics — the hook with the highest rate wins and becomes your template.",
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Hook Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This TikTok Hook Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free AI-powered TikTok Hook Generator produces scroll-stopping video openers using five
              proven viral hook formulas: Question Hooks (curiosity gap), Bold Statement Hooks (confident
              authority), Shock/Surprise Hooks (pattern interruption), Story Hooks (narrative tension), and
              Mistake/Warning Hooks (urgency trigger). Every hook is scored on a 0–100 Scroll-Stopping
              Score — only hooks scoring 80 or above are shown, ensuring every result is genuinely worth
              testing. The score is weighted across four factors: pattern interruption strength, information
              gap intensity, personal relevance signals, and specificity.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Beyond the hook text itself, each result includes an on-screen text overlay version formatted
              for video editors, voiceover delivery tips, and camera presence advice specific to that hook
              type. These additions bridge the gap between writing a strong hook and actually executing it
              on camera — because the same hook delivered flatly versus with the right energy and framing
              can produce dramatically different 3-second retention rates. The AI tailors all of this to
              your specific niche, content type, and audience.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The generator supports 12 niche options with niche-specific hook personalization, 5 content
              types (educational, storytelling, tutorial, funny, entertaining) that shift hook priorities,
              and 5 tone options (bold, emotional, funny, dramatic, calm) that adjust language and framing.
              This means a fitness hook for bold educational content reads completely differently from a
              relationship hook for emotional storytelling — and both are more effective than a generic
              hook that could apply to any topic.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why TikTok Hooks Are Your Most Important Content Asset
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TikTok's algorithm uses the 3-second view rate as one of its strongest early distribution
              signals. If fewer than 60% of viewers watch past the first three seconds of your video, the
              algorithm interprets this as a quality signal and reduces distribution in subsequent waves.
              The inverse is equally true: a video with a strong hook that holds 80%+ of viewers past the
              3-second mark gets pushed to progressively larger audiences — first hundreds, then thousands,
              then potentially millions through the For You Page cascade.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators spend 90% of their time on the video content and 10% on the hook. The
              highest-growth creators invert this ratio — they spend as much time crafting and testing
              their hook as they do producing the rest of the video, because the hook determines whether
              anyone sees the content at all. Our AI hook generator compresses the ideation time from
              minutes to seconds, giving you a bank of high-quality, scored hooks to test against your
              audience without the blank-screen creative block. Pair your best hooks with complete video
              scripts using our{" "}
              <Link href="/tools/tiktok-script-generator" className="text-primary hover:underline font-medium">
                TikTok Script Generator
              </Link>{" "}
              to build fully structured videos from opening line to closing CTA.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The A/B testing strategy built into our results tab gives you a clear process: generate 3–5
              hooks, post the same video with different openers on different days, and compare 3-second
              retention rates after 48 hours. Two videos with identical content but different hooks
              regularly show 3–10x differences in view counts — this is the clearest evidence that hook
              quality is the primary driver of TikTok performance, not production quality, posting time,
              or follower count. Use our{" "}
              <Link href="/tools/tiktok-viral-idea-generator" className="text-primary hover:underline font-medium">
                TikTok Viral Idea Generator
              </Link>{" "}
              to find the trending concepts that deserve your best hooks.
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
          <h2 className="text-2xl font-bold font-display text-foreground">What This TikTok Hook Generator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "5 proven viral hook formulas: Question, Bold Statement, Shock, Story, Mistake/Warning" },
            { icon: <BarChart2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Scroll-Stopping Score (0–100) for every AI-generated hook — only 80+ scores are shown" },
            { icon: <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Hook type labels so you understand the psychological mechanism behind each opener" },
            { icon: <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Top hooks highlighted with one-click copy for fast A/B testing" },
            { icon: <ArrowUpRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "On-screen text overlay version for every hook — formatted for video editors" },
            { icon: <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Voiceover delivery tip and camera presence advice per hook type" },
            { icon: <Search className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "12 niche options with niche-specific hook personalization" },
            { icon: <ListChecks className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "5 content types (educational, storytelling, tutorial, funny, entertaining) that shift hook priorities" },
            { icon: <BarChart2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "5 tone options (bold, emotional, funny, dramatic, calm) that adjust language and framing" },
            { icon: <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "A/B testing strategy guide — how to use 3-second retention data to find your best hook" },
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
          <h2 className="text-2xl font-bold font-display text-foreground">Related TikTok Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              slug: "tiktok-caption-generator",
              icon: "✍️",
              name: "TikTok Caption Generator",
              desc: "Pair your scroll-stopping hook with a well-crafted caption to keep viewers engaged and drive comments.",
            },
            {
              slug: "tiktok-script-generator",
              icon: "📝",
              name: "TikTok Script Generator",
              desc: "Extend your hook into a full video script with structured body content and a closing CTA that converts.",
            },
            {
              slug: "tiktok-viral-idea-generator",
              icon: "💡",
              name: "TikTok Viral Idea Generator",
              desc: "Get the trending content ideas that deserve your best hooks — great concepts need great opening lines.",
            },
            {
              slug: "tiktok-hashtag-generator",
              icon: "#️⃣",
              name: "TikTok Hashtag Generator",
              desc: "Find the right hashtags to amplify the reach of videos that open with a hook strong enough to hold attention.",
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
