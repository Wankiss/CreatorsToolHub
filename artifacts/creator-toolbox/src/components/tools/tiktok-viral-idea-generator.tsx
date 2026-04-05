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
    q: "What is a TikTok Viral Idea Generator?",
    a: "A TikTok Viral Idea Generator is an AI-powered tool that produces complete, ready-to-film video concepts engineered for maximum performance on the For You Page. Unlike basic brainstorming tools, our generator applies five proven viral content formats — 'You're Doing It Wrong,' 'Nobody Tells You This,' Before/After, Storytime, and Trend Remix — to your specific niche. Each idea includes a full concept, a 3-second hook engineered for the scroll-stop window, four hook variations for A/B testing, emotional and curiosity angles, execution tips, a caption, and niche-aligned hashtags. The output is a complete creative brief you can take directly to filming.",
  },
  {
    q: "How do I come up with TikTok video ideas that go viral?",
    a: "Viral TikTok ideas share three structural characteristics: a hook that stops the scroll in under 3 seconds, a format that matches current algorithmic preferences, and a concept that triggers an emotional response strong enough to drive completion, shares, or comments. The most reliable viral formats are relatability ('POV: you're doing X and then this happens'), information gap ('What nobody tells you about Y'), personal proof ('I tried X for 30 days'), and controversy-lite ('Unpopular opinion: Z'). Combining one of these formats with niche-specific language and a timely trend gives you the highest probability of FYP distribution. Our AI generator applies all of these principles simultaneously for your specific niche and goal.",
  },
  {
    q: "What type of TikTok content gets the most views?",
    a: "The TikTok content types that consistently generate the most views in 2026 are: (1) Tutorial and how-to content with a clear information payoff, (2) Relatable POV videos that make viewers feel personally seen, (3) Storytimes with emotional arcs and a clear resolution, (4) Before/after transformations in fitness, finance, or lifestyle niches, and (5) Controversial opinion videos that invite comment engagement. Niche matters significantly — finance, fitness, and relationship content consistently outperforms hobby niches in raw reach. However, within any niche, the hook quality and format match to current trends outweigh production quality as the primary driver of views.",
  },
  {
    q: "How important is the TikTok hook in the first 3 seconds?",
    a: "The 3-second hook is the single most important element of any TikTok video. TikTok's algorithm measures completion rate — the percentage of viewers who watch your entire video — and uses it to decide how many more people to show your content to. If viewers scroll away in the first 3 seconds, your completion rate collapses and the algorithm stops distributing the video. A scroll-stopping hook doesn't just attract viewers — it signals to the algorithm that the content is worth amplifying. Our generator produces a primary hook and four variations for every idea specifically because hook testing is the highest-leverage optimization strategy available to TikTok creators.",
  },
  {
    q: "How many TikTok videos should I post per week?",
    a: "For accounts in the growth phase (under 10K followers), posting 5–7 times per week maximizes the number of algorithmic distribution opportunities and gives you enough data to identify which content formats and hooks perform best. Each post is essentially a test — more posts mean faster learning. For established accounts (10K+ followers), 3–5 quality posts per week is sustainable and effective, since the algorithm continues distributing your content to existing followers between posts. Consistency matters more than raw volume — creators who post 4 times per week every week outperform those who post 20 times one week and go silent the next.",
  },
  {
    q: "What TikTok video length performs best in 2026?",
    a: "In 2026, TikTok's algorithm favors two distinct length ranges: ultra-short (7–15 seconds) for high completion rate and loop potential, and longer-form (60–90 seconds) for watch time signal. Videos in the 15–30 second range perform inconsistently — long enough to have a lower natural completion rate but not long enough to generate significant watch time. For informational and tutorial content, 45–90 seconds works well because viewers self-select into watching the full video. For entertainment, emotion-first, and trend content, 7–20 seconds maximizes loop plays, which is a strong algorithmic signal. Our idea generator includes execution tips that specify optimal length for each content type.",
  },
  {
    q: "How do I choose the right TikTok niche?",
    a: "The right TikTok niche sits at the intersection of three factors: something you can create content about consistently (sustainability), a topic with demonstrated audience demand on TikTok (discoverability), and a subject where you have genuine knowledge or experience (credibility). Avoid choosing a niche purely based on popularity — fitness and finance have enormous audiences but also enormous competition. Micro-niches within popular categories consistently outperform broad niches in the growth phase: 'budgeting for single parents' outperforms 'personal finance,' and 'home workouts for beginners over 40' outperforms 'fitness.' Our generator supports 14 niches and applies trend data specific to each one.",
  },
  {
    q: "What makes TikTok content go viral on the For You Page?",
    a: "TikTok's For You Page algorithm distributes content based on behavioral signals in this order of weight: (1) Completion rate — what percentage of viewers watched the full video, (2) Re-watch rate — how many viewers looped the video at least once, (3) Engagement rate — likes, comments, shares, and saves relative to views, and (4) Profile interactions — profile visits and follows triggered by the video. A video that earns strong completion and re-watch rates in its first 500–1,000 views gets pushed to a progressively wider audience. The most reliable way to earn completion rate is a compelling hook that sets a clear expectation of payoff, and a tight edit that delivers that payoff without padding.",
  },
  {
    q: "How do I use TikTok trends to grow my account?",
    a: "The most effective way to use TikTok trends is the Trend Remix approach: take a trending sound, format, or challenge and apply it to your specific niche content rather than recreating the trend generically. A trending sound used in a finance niche tutorial reaches both the trend's existing audience and your target niche audience simultaneously. Act on trends within 24–72 hours of peak virality — late trend adoption rarely earns organic distribution. Use the trending format as the wrapper but keep your original niche content as the core. This strategy lets you benefit from algorithmic trend distribution without becoming a trend-chasing account with no clear niche identity.",
  },
  {
    q: "Are these TikTok video idea generation tools free?",
    a: "Yes — the TikTok Viral Idea Generator is completely free with no account required, no signup, and no usage limits. Generate as many viral idea sets as you need across any of the 14 supported niches. Every output includes a full concept, 3-second hook, four hook variations, content angles, execution tips, caption, and hashtags — all at zero cost. Our full suite of TikTok tools including the Script Generator, Hook Generator, Caption Generator, and Hashtag Generator are all free with no restrictions.",
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

export function TikTokViralIdeaGeneratorTool() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [trend, setTrend] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("tiktok-viral-idea-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-tiktok-viral-ideas";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your content niche.", variant: "destructive" });
      return;
    }
    run({ niche, audience, trend });
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
            <TrendingUp className="text-pink-500" size={22} />
            <h2 className="font-semibold text-lg">TikTok Viral Idea Generator</h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            <Sparkles size={12} /> Powered by AI
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Your Niche *</label>
            <Input placeholder="e.g. fitness, finance, cooking, fashion, gaming..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. Gen Z, working moms, gym beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Trend / Format to Leverage</label>
              <Input placeholder="e.g. POV, Storytime, Day in my life..." value={trend} onChange={e => setTrend(e.target.value)} />
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Viral Ideas</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Viral Video Ideas</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All ideas copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((idea, i) => (
              <div key={i} className="flex items-start gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <TrendingUp size={14} className="text-pink-500 mt-0.5 shrink-0" />
                <span className="flex-1 text-sm leading-relaxed">{idea}</span>
                <button onClick={() => copyItem(idea, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Viral Idea Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Select Your Niche",
              desc: "Enter your TikTok content niche — from fitness and business to entertainment and relationships. The AI generator uses niche-specific trend data to build ideas that fit your audience and the current content patterns performing best in your category.",
            },
            {
              step: 2,
              title: "Set Your Goal and Style",
              desc: "Add your target audience and preferred format or trend to leverage (e.g. POV, Storytime, Day in my life). These inputs shape the viral format and tone of every idea the AI generates, ensuring each concept is tailored to your specific content goals.",
            },
            {
              step: 3,
              title: "Generate Your Ideas",
              desc: "Hit Generate and the AI instantly produces complete viral ideas — each with a concept, 3-second hook, multiple hook variations, content angles, execution tips, a caption, and hashtags. Every idea is built on a proven viral format with an 80+ virality score threshold.",
            },
            {
              step: 4,
              title: "Film, Post, and Test",
              desc: "Copy any hook or caption directly from the results. Test 2–3 hook variations for the same idea to find the best-performing opener. Use the trend and angle breakdowns to understand exactly why each idea is engineered to go viral before you hit record.",
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Viral Idea Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This TikTok Viral Idea Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free AI-powered TikTok Viral Idea Generator applies five proven viral content formats —
              "You're Doing It Wrong," "Nobody Tells You This," Before/After, Storytime, and Trend Remix —
              to your specific niche using niche-specific trend data, topic seeds, and algorithm insights.
              Every idea includes a concept, an opening hook engineered for the 3-second retention window,
              four hook variations for A/B testing, three content angles (emotional, curiosity, relatability),
              execution tips covering length and pacing, a caption designed to drive comments, and a
              niche-aligned hashtag set optimized for For You Page discovery.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most TikTok idea tools produce generic prompts that could apply to any creator in any niche.
              Our AI generator is different: it applies niche-specific trend data and proven viral formats
              to produce ideas that are structurally built for the TikTok algorithm, not just thematically
              relevant. The difference between "make a cooking video" and a complete AI-generated brief with
              a scroll-stopping hook, content angles, and caption strategy is the difference between
              content that gets 200 views and content that hits the For You Page.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The tool supports 14 content niches and adjusts its viral format selection based on which
              formats are currently outperforming in each category. A fitness account, a finance account,
              and a relationship account each need structurally different viral strategies — our AI applies
              the right format to the right niche automatically, so you never have to guess which approach
              will work before you invest time filming.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why TikTok Video Ideas Matter for Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The TikTok algorithm in 2026 distributes content based on behavioral signals — specifically
              completion rate, engagement rate, and re-watches. But generating those signals starts before
              the camera even turns on. A video built on a weak idea will lose viewers in the first 3
              seconds regardless of production quality. A video built on a strong viral format, with a hook
              engineered to stop the scroll, will outperform polished but strategically weak content every
              time. The creators who grow fastest on TikTok are not necessarily the best editors or the
              most charismatic — they are the ones who consistently produce ideas with the structural
              characteristics the algorithm rewards.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Idea generation is also where most creators waste the most time. Staring at a blank screen
              trying to come up with a concept that might work is the bottleneck that causes inconsistent
              posting — and inconsistent posting is the number one reason TikTok accounts stall. Our AI
              generator eliminates the blank-screen problem entirely: you enter your niche and goal, and
              in seconds you have a complete creative brief ready to film. Pair it with our{" "}
              <Link href="/tools/tiktok-script-generator" className="text-primary hover:underline font-medium">
                TikTok Script Generator
              </Link>{" "}
              to turn any viral idea into a fully structured script in minutes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The four hook variations included with every idea are a critical feature. Hook testing — trying
              different opening lines for the same underlying concept — is the single highest-leverage
              optimization strategy available to TikTok creators. Two videos with identical content but
              different hooks can generate 10x different view counts based on hook alone. By generating
              four hooks with every idea, our tool gives you everything you need to run rapid hook tests
              and identify the opening lines that resonate most with your specific audience. Use our{" "}
              <Link href="/tools/tiktok-hook-generator" className="text-primary hover:underline font-medium">
                TikTok Hook Generator
              </Link>{" "}
              to generate even more hook variations for your strongest concepts.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits / Why Use ────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Benefits of Using This TikTok Idea Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: <BarChart2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "14 niches with niche-specific trend data and topic seeds" },
            { icon: <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "5 proven viral formats applied to every AI-generated idea (80+ virality score threshold)" },
            { icon: <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "3-second hook + 4 A/B test variations for every single idea" },
            { icon: <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Emotional, curiosity, and relatability angles pre-built per idea" },
            { icon: <ArrowUpRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Execution tips covering length, pacing, and posting strategy" },
            { icon: <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Suggested captions designed to maximize comment engagement" },
            { icon: <Search className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Niche-aligned hashtag sets optimized for For You Page discovery" },
            { icon: <BarChart2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Trend summary showing what's working in your niche right now" },
            { icon: <ListChecks className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Content goal and style filtering for tailored AI idea output" },
            { icon: <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "100% free — no account, no limits, instant AI results every time" },
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
              slug: "tiktok-script-generator",
              icon: "📝",
              name: "TikTok Script Generator",
              desc: "Turn your viral idea into a full structured video script with hook, body, and CTA for maximum watch time.",
            },
            {
              slug: "tiktok-hook-generator",
              icon: "🎣",
              name: "TikTok Hook Generator",
              desc: "Craft the perfect opening line for your viral concept — the hook determines whether viewers stay or scroll.",
            },
            {
              slug: "tiktok-caption-generator",
              icon: "✍️",
              name: "TikTok Caption Generator",
              desc: "Write the caption that frames your viral idea and drives comments, shares, and saves after posting.",
            },
            {
              slug: "tiktok-hashtag-generator",
              icon: "#️⃣",
              name: "TikTok Hashtag Generator",
              desc: "Find the ideal hashtag mix to amplify your viral video's reach to the widest relevant audience on TikTok.",
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
