import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, MessageSquare,
  ListChecks, ChevronDown, BarChart2, Zap, Shield,
  Search, TrendingUp, ArrowUpRight, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a TikTok caption go viral?",
    a: "A viral TikTok caption does three things simultaneously: it stops the scroll with a strong opening hook line, it creates a reason for the viewer to engage (comment, share, or save), and it reinforces the topic signal so TikTok's algorithm can classify and distribute the video correctly. The most viral captions use an open loop in the first line — a statement that's cut off by TikTok's 2-line preview, forcing the viewer to tap to expand. This tap-to-expand action is registered as an engagement signal by the algorithm. Pair this with a direct question CTA ('Which one are you? Comment below') and niche-specific keywords that help TikTok place your content in the right audience segment.",
  },
  {
    q: "How long should a TikTok caption be?",
    a: "The optimal TikTok caption length depends on your content type. For high-energy, fast-paced content (dance, comedy, quick tips), keep captions to 1–2 punchy lines (under 150 characters) and let the video carry the message. For educational and storytelling content, Medium length (2–4 lines) works best — enough to provide context and a CTA without overwhelming the viewer. For long-form educational content, a fuller caption with a hook, value promise, and CTA can boost saves and profile visits significantly. The critical rule for all lengths: TikTok shows only the first 2 lines in the feed, so those 2 lines must function as a standalone hook even if the viewer never taps to expand.",
  },
  {
    q: "Should I put hashtags in TikTok captions?",
    a: "Yes — hashtags in TikTok captions serve two distinct functions. First, they help TikTok's algorithm categorize your content and match it to the right audience clusters during initial distribution. Second, they allow your video to appear in hashtag search results, providing ongoing discoverability beyond the For You Page. The most effective hashtag strategy combines 1–2 broad hashtags (high volume, like #fitness or #money), 3–4 niche-specific hashtags that match your specific community (#homeworkout, #budgetfinance), and 1 keyword-based hashtag that matches your video's exact topic (#10kgweightloss). Avoid using only trending hashtags — they expose your content to an audience that isn't your target viewer, which hurts your engagement rate and signals poor content quality to the algorithm.",
  },
  {
    q: "What is the best call-to-action for TikTok captions?",
    a: "The three highest-converting TikTok caption CTAs are: (1) The opinion prompt — 'Agree or disagree? 👇' — which generates debate-style comments that dramatically boost engagement and algorithmic reach; (2) The follow promise — 'Follow for Part 2 tomorrow' — which converts viewers who found value into followers by tying the follow action to a specific future benefit; and (3) The save instruction — 'Save this for later' — which signals long-term value and improves your video's placement in TikTok's recommendation system. The least effective CTA is the generic 'follow me for more content' — it converts at a fraction of the rate of specific, benefit-driven alternatives because it offers no clear reason to follow.",
  },
  {
    q: "How do I write TikTok captions for different niches?",
    a: "Each TikTok niche has an established vocabulary, audience psychology, and engagement pattern that captions should reflect. Fitness captions perform best with transformation language and direct challenges ('Do this for 30 days. Tag me when you finish.'). Finance captions convert best with specificity and authority ('The exact spreadsheet I used to save £12,000 in 8 months — link in bio'). Beauty captions drive the most saves with product-specific language and benefit statements ('This is the only [product type] you need this winter'). Food content performs best with sensory language and recipe callouts ('Full recipe in the comments'). Our generator applies niche-specific keyword pools, language patterns, and hashtag sets for each of the 15 supported niches to produce captions that feel native to each community.",
  },
  {
    q: "Can I use the same caption on TikTok and Instagram Reels?",
    a: "Yes, with minor modifications. TikTok and Instagram Reels share the same short-form vertical video format and similar algorithmic mechanics (completion rate, engagement rate, save rate), so a well-written caption transfers effectively between platforms. The main adjustments needed are: replace TikTok-specific trend language ('POV:', 'Tell me why', 'The way') with Instagram equivalents where appropriate; adjust hashtag strategy (Instagram supports up to 30 hashtags and they're more effective than TikTok's 3–7 optimal range); and modify the CTA ('Follow' on TikTok vs 'Save' on Instagram performs differently for growth). The hook structure, question CTAs, and niche-specific language work identically on both platforms.",
  },
  {
    q: "What are the best TikTok caption formulas?",
    a: "The 10 highest-performing TikTok caption formulas, all of which our generator produces, are: (1) Punchy Hook — a bold one-liner that challenges the viewer; (2) POV Style — 'POV: you finally decided to [action]'; (3) Storytelling — a mini narrative that sets up the video; (4) Question Hook — a direct question that demands an answer; (5) Hot Take — a controversial opinion that invites debate; (6) Relatable — 'Me watching [situation] like…'; (7) Educational — 'Here's what nobody tells you about [topic]'; (8) Challenge — 'Try this for 7 days and comment your results'; (9) Listicle — 'The 3 things I wish I knew before [action]'; (10) Emotional — a vulnerability statement that drives saves and shares. Each formula maps to a different psychological trigger and engagement type.",
  },
  {
    q: "Do TikTok captions affect views and reach?",
    a: "Yes — TikTok captions directly influence both initial reach and sustained distribution in two ways. First, the algorithm reads caption text alongside audio transcription and hashtags to classify content into topic clusters and determine which audiences to test your video against. A caption with clear topical keywords helps TikTok place your content in front of the right initial test audience, which leads to higher engagement rates in the first distribution wave. Second, captions drive comment volume — and comment rate is one of TikTok's strongest indicators of content quality. A caption with an effective question CTA can generate 3–5× more comments than a caption without one, and that comment volume directly signals to the algorithm that the video deserves wider distribution.",
  },
  {
    q: "How many emojis should I use in a TikTok caption?",
    a: "For most TikTok captions, 2–4 emojis placed strategically outperform both zero-emoji and high-emoji captions. Zero-emoji captions can feel corporate or formal for most TikTok niches — they work well for finance and B2B content but underperform for lifestyle, beauty, and entertainment. High-emoji captions (7+) reduce text readability and can signal low-quality content in authority niches. The most effective placement is: one emoji in the opening hook line to add visual punctuation, one or two emojis mid-caption to break up text and add personality, and one directional emoji (👇) before the CTA to draw the eye down. Niche also matters — fitness, food, and beauty captions benefit from more emojis than finance, business, and educational content.",
  },
  {
    q: "Is this TikTok Caption Generator free?",
    a: "Yes — the TikTok Caption Generator is completely free with no account, no signup, and no usage limits. Generate as many caption sets as you need across any niche, goal, tone, and audience combination. Every generation produces 10 caption variations across 10 distinct style formats, each with a Viral Score (Hook, Engagement, Clarity), 7 curated hashtags, and individual copy buttons — all at zero cost. Our full suite of TikTok tools including the Hook Generator, Script Generator, Viral Idea Generator, and Hashtag Generator are all free with no restrictions.",
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

export function TikTokCaptionGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("grow-followers");
  const [tone, setTone] = useState("bold");
  const [audience, setAudience] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("tiktok-caption-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-tiktok-caption-gen";
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
    run({ topic, niche, goal, tone, audience });
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
            <MessageSquare className="text-pink-500" size={22} />
            <h2 className="font-semibold text-lg">TikTok Caption Generator</h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            <Sparkles size={12} /> Powered by AI
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Topic *</label>
            <Input placeholder="e.g. morning routine, 3 cooking hacks, my fitness journey..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Niche</label>
              <Input placeholder="e.g. fitness, food, beauty..." value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. beginners, moms, entrepreneurs..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Goal</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={goal} onChange={e => setGoal(e.target.value)}>
                <option value="grow-followers">Grow Followers</option>
                <option value="increase-engagement">Increase Engagement</option>
                <option value="drive-traffic">Drive Traffic</option>
                <option value="build-community">Build Community</option>
                <option value="go-viral">Go Viral</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="bold">Bold</option>
                <option value="relatable">Relatable</option>
                <option value="funny">Funny</option>
                <option value="educational">Educational</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Captions</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold">Caption Options</h3>
          <div className="space-y-3">
            {outputs.map((caption, i) => (
              <div key={i} className="group p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{caption}</p>
                  <button onClick={() => copyItem(caption, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
                    {copied === i ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                  </button>
                </div>
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Caption Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Describe Your Video Topic",
              desc: "Enter what your TikTok video is about as specifically as possible — 'How I lost 10kg without the gym' generates far more targeted AI captions than 'weight loss tips.' Include the key result or insight your video delivers for the strongest hook generation.",
            },
            {
              step: 2,
              title: "Select Your Niche and Tone",
              desc: "Choose the niche that best matches your content category — the AI uses niche-specific keywords, hashtag pools, and audience language. Then pick a tone: Relatable, Funny, Bold, Educational, or Inspirational to shape the language and emotional direction of your captions.",
            },
            {
              step: 3,
              title: "Set Caption Length and Goal",
              desc: "Choose Short (1–2 lines) for punchy visual content, Medium (2–4 lines) for most TikTok content, or Long for educational and storytelling videos. Select your goal — growing followers, increasing engagement, driving traffic, building community, or going viral.",
            },
            {
              step: 4,
              title: "Filter, Score, Copy, and Post",
              desc: "Review all AI-generated caption options across different styles — each scored on Hook, Engagement, and Clarity. Copy the caption body, hashtags, or both with one click. Test 2–3 different captions over 7 days and track which drives the most comments and profile visits.",
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Caption Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How This TikTok Caption Generator Works
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free AI-powered TikTok Caption Generator produces 10 caption variations across 10
              distinct style formats: Punchy Hook, POV Style, Storytelling, Question Hook, Hot Take,
              Relatable, Educational, Challenge, Listicle, and Emotional. Each caption is built using your
              topic, niche, tone, and optional inputs — and every caption passes an internal quality
              evaluation before being returned. The quality gate checks three criteria: does the first line
              stop scrolling? Does it drive a specific engagement behavior (comment, save, or share)? Does
              it clearly reinforce the topic signal that TikTok's algorithm reads for content classification?
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every AI-generated caption is scored across three dimensions: Hook Score (1–10, measuring how
              effectively the first line stops the scroll), Engagement Score (1–10, predicting comment and
              save likelihood), and Clarity Score (1–10, assessing how clearly the caption communicates the
              video's value). Each caption also includes 7 curated hashtags drawn from the appropriate
              niche pool — a blend of broad reach hashtags, niche-specific community tags, and keyword-based
              tags for topic discoverability.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The 15 supported niches each have their own keyword vocabularies, audience language patterns,
              and hashtag sets. This means a fitness caption feels native to the fitness community, while a
              finance caption uses the authority language that finance audiences respond to. The optional
              fields — target audience, key message, custom CTA, and keywords — feed directly into the AI
              prompt to make every caption more specific and targeted to your exact content and community.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why TikTok Captions Directly Impact Your Reach
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TikTok's algorithm evaluates content across multiple signals, and captions contribute to two
              of the most important: content classification and engagement volume. The algorithm reads
              caption text alongside hashtags and audio to determine which audience segments to test your
              video against. A caption that clearly signals your topic — using specific keywords and
              niche-appropriate language — helps TikTok place your content in the right topic clusters,
              which means your video gets tested against an audience that's already interested in that
              content category. This improves your initial engagement rate, which is the signal that
              determines whether TikTok pushes the video to wider audiences.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The second way captions drive reach is through comment volume. Comment rate is one of TikTok's
              strongest content quality signals — a video that generates 50 comments tells the algorithm
              something different from a video with 2 comments, even if both have the same view count. A
              caption with an effective question CTA or opinion prompt can generate 3–5× more comments than
              a caption without one. Complement your caption strategy with our{" "}
              <Link href="/tools/tiktok-hook-generator" className="text-primary hover:underline font-medium">
                TikTok Hook Generator
              </Link>{" "}
              to ensure the video opening delivers on the caption's promise.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Save rate is the third caption-driven signal. Captions that contain value promises — 'Save
              this for when you need it,' 'Bookmark this before it gets buried,' or 'You'll want this for
              later' — consistently drive higher save rates, which TikTok interprets as a strong indicator
              of content value and rewards with extended distribution. Building a complete content workflow?
              Pair your captions with full video scripts from our{" "}
              <Link href="/tools/tiktok-script-generator" className="text-primary hover:underline font-medium">
                TikTok Script Generator
              </Link>{" "}
              for maximum cohesion between your opening hook, content body, and caption.
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
          <h2 className="text-2xl font-bold font-display text-foreground">What This TikTok Caption Generator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "10 AI caption variations per generation across 10 distinct style formats" },
            { icon: <BarChart2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Viral Score per caption — Hook (1–10), Engagement (1–10), Clarity (1–10)" },
            { icon: <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Quality gate: every caption's first line is evaluated and improved if the hook is weak" },
            { icon: <Search className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "7 curated hashtags per caption: broad + niche-specific + keyword-based" },
            { icon: <Copy className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Separate copy buttons: caption body only, hashtags only, or caption + hashtags combined" },
            { icon: <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "15 niche options with niche-specific keywords, audience language, and hashtag pools" },
            { icon: <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "5 tone modes (Relatable, Funny, Bold, Educational, Inspirational) shaping all language" },
            { icon: <ListChecks className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "3 caption length options: Short (1–2 lines), Medium (2–4 lines), Long (story style)" },
            { icon: <ArrowUpRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Optional fields: target audience, key message, custom CTA, and keywords for personalization" },
            { icon: <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />, text: "Filter tabs to view AI captions by style category (Hook/POV, Hot Take, Educational, All)" },
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
            { n: 1, tip: "Start captions with a hook sentence that cuts off mid-thought — TikTok truncates after 2 lines, so a cliffhanger forces the tap-to-expand that boosts engagement." },
            { n: 2, tip: "Use 3–5 niche hashtags (not just trending ones) — niche hashtags help TikTok's algorithm categorize your content and deliver it to interested audiences." },
            { n: 3, tip: "Ask a question at the end — 'Which one would you pick?' or 'Have you tried this?' drives comments, which is TikTok's strongest ranking signal." },
            { n: 4, tip: "Keep captions short and punchy (under 150 characters) — the best-performing TikToks often have minimal caption text, letting the video speak first." },
            { n: 5, tip: "Include a CTA every 3–4 posts — 'Follow for part 2' and 'Link in bio for the full guide' work best when tied to genuine value." },
            { n: 6, tip: "Use 'POV:', 'Tell me why', or 'The way' trends in captions to signal participation in trending formats and boost algorithmic reach." },
            { n: 7, tip: "Time-stamp your series episodes in captions ('Part 3 of 5') — serialized content drives 2–3× more profile visits and follow conversions." },
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
              desc: "Generate powerful opening lines that stop the scroll and keep viewers watching past the critical first 3 seconds.",
            },
            {
              slug: "tiktok-hashtag-generator",
              icon: "#️⃣",
              name: "TikTok Hashtag Generator",
              desc: "Find the perfect mix of trending and niche hashtags to maximize reach and help TikTok place your content.",
            },
            {
              slug: "tiktok-script-generator",
              icon: "📝",
              name: "TikTok Script Generator",
              desc: "Write full video scripts with hook, body, and CTA structured to maximize watch time and algorithm performance.",
            },
            {
              slug: "tiktok-viral-idea-generator",
              icon: "💡",
              name: "TikTok Viral Idea Generator",
              desc: "Get trending content concepts tailored to your niche so you always have high-potential video ideas ready.",
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
