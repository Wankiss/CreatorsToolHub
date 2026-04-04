import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, ScrollText, ChevronDown,
  Lightbulb, ListChecks, ArrowUpRight, Zap, TrendingUp, FileText,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube Script Generator?",
    a: "A YouTube Script Generator is an AI-powered tool that creates complete, structured video scripts from your topic, target audience, and style preferences. Instead of facing a blank page, you receive a ready-to-use script with a psychologically optimized hook, intro, structured body sections with pattern interrupts, mid-video call-to-action, and a closing outro — all calibrated to your target video length. Our generator uses proven frameworks from high-retention channels to produce scripts designed to maximize average view duration, which directly impacts YouTube's recommendation algorithm.",
  },
  {
    q: "How do I write a YouTube script that keeps viewers watching?",
    a: "Retention-optimized scripts follow a specific architecture: (1) An irresistible hook in the first 5–15 seconds that creates a curiosity gap or states a bold promise. (2) A concise intro that establishes relevance and previews value without giving everything away. (3) Structured main content broken into clear, named sections that signal progress. (4) Pattern interrupts every 20–40 seconds — perspective shifts, rhetorical questions, surprising data, or format changes that reset attention. (5) A mid-video CTA that feels natural rather than forced. (6) A strong end card with a specific next-step ask tied directly to what they just watched.",
  },
  {
    q: "How long should a YouTube video script be?",
    a: "Script length should be calibrated to your target video length at approximately 130–150 words per minute for normal conversational delivery. A 5-minute video requires roughly 650–750 words of spoken content; a 10-minute video needs 1,300–1,500 words; a 15-minute video requires 1,950–2,250 words. Our generator automatically calibrates output length to your selected video duration. Keep in mind that pauses, b-roll moments, and on-screen demonstrations reduce the actual words-per-minute pace, so the script length is always a starting framework rather than an exact target.",
  },
  {
    q: "What is a pattern interrupt in a YouTube script?",
    a: "A pattern interrupt is any deliberate shift in content, tone, format, or delivery that disrupts the viewer's passive watching state and re-engages their attention. YouTube's research shows that viewer attention naturally drifts every 20–40 seconds. Pattern interrupts counteract this by introducing something unexpected: a surprising statistic, a direct question to the audience, a shift from instructional to storytelling mode, a sudden change in pacing, or a humorous aside. Every script our tool generates includes pattern interrupts at intervals calibrated to your chosen video length, because channels that consistently achieve 55%+ average view duration universally use this technique.",
  },
  {
    q: "What are the different YouTube script styles and when should I use each?",
    a: "Tutorial scripts work best for how-to content, software walkthroughs, and skill-based topics — they follow a step-by-step structure with numbered sections. Listicle scripts ('7 Reasons…', '10 Best…') perform strongly for discovery because the format is clear and binge-able. Storytelling scripts open with a narrative arc and are most effective for personal brand channels, case studies, and inspirational content. Talking head scripts are structured for direct-to-camera delivery with strong conversational pacing, ideal for commentary and education. Documentary scripts use a journalistic framework with evidence-building narrative, best for investigative or deep-dive content. Choose based on your channel's existing style and what your audience expects.",
  },
  {
    q: "How important is the YouTube video hook?",
    a: "The hook is the single most important 15 seconds of your entire video. YouTube Analytics data consistently shows that 30–60% of viewers abandon a video within the first 30 seconds — the drop-off curve is steepest at the very beginning. A powerful hook does three things simultaneously: creates immediate curiosity or emotional tension, tells viewers exactly who the video is for, and signals production quality and creator confidence. The most effective hook formats are: the bold contrarian statement ('Everything you've been told about X is wrong'), the specific promise ('By the end of this video, you'll know exactly how to…'), and the dramatic open — starting mid-action before explaining how you got there.",
  },
  {
    q: "Should I read my YouTube script word for word?",
    a: "Using your script as a rigid teleprompter read typically produces stiff, low-energy delivery that viewers notice negatively. The better approach is to use the script as a framework — internalize each section's core point and key phrases, then deliver it in your natural voice. Most successful YouTube creators use their script to prepare the logical structure and key lines (especially the hook and CTAs, which should be precise), then speak semi-improvised sentences that hit those beats naturally. The goal is sounding like you're talking to one person, not reading from a document. If you use a teleprompter, practice reading at a conversational pace with intentional pauses.",
  },
  {
    q: "What is the best YouTube video length for views and monetization?",
    a: "The optimal length depends on your goal. For maximum monetization, videos of 8+ minutes allow mid-roll ads, which can double or triple your ad revenue per video compared to videos under 8 minutes. The sweet spot for most educational and entertainment channels is 8–15 minutes — long enough for multiple ad slots but short enough to maintain high average view duration percentages. For algorithmic discovery, shorter videos (4–7 minutes) with very high retention rates can outperform longer videos in recommendations. The key metric is not length but average view duration as a percentage — a 10-minute video where viewers watch 70% on average outperforms a 20-minute video at 30%.",
  },
  {
    q: "How do I add keywords to my YouTube script for SEO?",
    a: "YouTube's algorithm partially analyzes video transcripts (auto-generated captions) and chapter markers for topic context, so natural keyword integration in your script provides marginal SEO benefit. The most impactful placements are: the first 30 seconds of your script (which maps to the auto-generated description excerpt), chapter titles that align with search queries, and natural repetition of the main topic keyword throughout. The keyword field in our generator automatically weaves your specified keywords into the hook and intro sections. For maximum SEO impact, complement your script with an optimized title and description using our YouTube Title Generator and YouTube Description Generator — these have far more direct algorithmic weight.",
  },
  {
    q: "What should I say in my YouTube video call-to-action?",
    a: "The most effective CTAs are specific, value-connected, and placed at natural momentum points. Our scripts include two CTA placements: a mid-video CTA around the 50–60% mark that asks for a low-friction action (typically a like or a specific comment about the current topic), and an end CTA that links the next step to what the viewer just learned ('If you want to take this further, my video on [related topic] shows you exactly how to…'). Research consistently shows that asking for one specific action outperforms asking for likes, comments, subscriptions, and shares simultaneously. Choose the single action most important to your channel right now and make that the primary ask.",
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

export function YouTubeScriptGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [length, setLength] = useState("7");
  const [tone, setTone] = useState("educational");
  const [goal, setGoal] = useState("educate");
  const [style, setStyle] = useState("tutorial");
  const [keywords, setKeywords] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSection, setCopiedSection] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"script" | "bonus">("script");
  const { outputs, loading, error, run } = useAiTool("youtube-script-generator");
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-script-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const script = outputs.join("\n");

  // Split script into sections for individual copying
  const scriptSections = outputs.filter(Boolean);

  // Attempt to find bonus content (B-roll, thumbnails) if present
  const bonusStartIdx = scriptSections.findIndex(s =>
    /b.?roll|on.?screen|thumbnail/i.test(s)
  );
  const mainSections = bonusStartIdx > 0 ? scriptSections.slice(0, bonusStartIdx) : scriptSections;
  const bonusSections = bonusStartIdx > 0 ? scriptSections.slice(bonusStartIdx) : [];

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic.", variant: "destructive" });
      return;
    }
    run({ topic, audience, length, tone, goal, style, keywords });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(script);
    setCopiedAll(true);
    toast({ title: "Full script copied!" });
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copySection = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(idx);
    toast({ title: "Section copied!" });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <>
      {/* ── Tool Card ────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Header with AI badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="text-red-500" size={22} />
              <h2 className="font-bold text-lg text-foreground">YouTube Script Generator</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
              <Sparkles size={12} /> AI-Powered
            </span>
          </div>

          {/* Topic */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Video Topic *
            </label>
            <Input
              placeholder="e.g. how to grow on YouTube, keto diet for beginners..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="rounded-xl h-11 text-sm"
            />
          </div>

          {/* Audience + Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Target Audience
              </label>
              <Input
                placeholder="e.g. beginners, busy parents..."
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                SEO Keywords to Include
              </label>
              <Input
                placeholder="e.g. budget, savings, tips..."
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
            </div>
          </div>

          {/* Length / Tone / Goal / Style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Length
              </label>
              <select
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                value={length}
                onChange={e => setLength(e.target.value)}
              >
                <option value="3">~3 min</option>
                <option value="5">~5 min</option>
                <option value="7">~7 min</option>
                <option value="10">~10 min</option>
                <option value="15">~15 min</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Tone
              </label>
              <select
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                value={tone}
                onChange={e => setTone(e.target.value)}
              >
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="authoritative">Authoritative</option>
                <option value="storytelling">Storytelling</option>
                <option value="motivational">Motivational</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Goal
              </label>
              <select
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                value={goal}
                onChange={e => setGoal(e.target.value)}
              >
                <option value="educate">Educate</option>
                <option value="entertain">Entertain</option>
                <option value="inspire">Inspire</option>
                <option value="sell">Convert / Sell</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Style
              </label>
              <select
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                value={style}
                onChange={e => setStyle(e.target.value)}
              >
                <option value="tutorial">Tutorial</option>
                <option value="list">Listicle</option>
                <option value="story">Storytelling</option>
                <option value="talkinghead">Talking Head</option>
                <option value="documentary">Documentary</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2 bg-red-600 hover:bg-red-700"
          >
            {loading
              ? <><Loader2 className="animate-spin" size={18} /> Writing script with AI…</>
              : <><Sparkles size={18} /> Generate YouTube Script</>}
          </Button>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      {script && (
        <div ref={resultsRef} className="mt-6 rounded-3xl border border-border bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          {/* Tabs */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-border">
            <div className="flex gap-1">
              {(["script", "bonus"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-background border border-b-background border-border text-foreground -mb-px relative z-10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "script" ? "📄 Script" : "🎬 Bonus"}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={copyAll} className="mb-2 rounded-xl gap-1.5">
              {copiedAll ? <><Check size={14} className="text-green-500" />Copied!</> : <><Copy size={14} />Copy All</>}
            </Button>
          </div>

          <div className="p-6">
            {activeTab === "script" && (
              <div className="space-y-3">
                {mainSections.length > 0 ? mainSections.map((section, i) => (
                  <div key={i} className="relative group rounded-2xl bg-muted/30 border border-border p-4 hover:border-primary/30 transition-colors">
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans pr-10">{section}</pre>
                    <button
                      onClick={() => copySection(i, section)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-background border border-border hover:border-primary/40"
                      title="Copy section"
                    >
                      {copiedSection === i ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="text-muted-foreground" />}
                    </button>
                  </div>
                )) : (
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-2xl p-4 border max-h-[600px] overflow-y-auto">
                    {script}
                  </pre>
                )}
              </div>
            )}

            {activeTab === "bonus" && (
              <div className="space-y-3">
                {bonusSections.length > 0 ? bonusSections.map((section, i) => (
                  <div key={i} className="relative group rounded-2xl bg-muted/30 border border-border p-4 hover:border-primary/30 transition-colors">
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans pr-10">{section}</pre>
                    <button
                      onClick={() => copySection(100 + i, section)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-background border border-border hover:border-primary/40"
                    >
                      {copiedSection === 100 + i ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="text-muted-foreground" />}
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>Generate a script first to see B-roll suggestions, on-screen text ideas, and thumbnail text here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Script Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Topic and Audience",
              desc: "Type your video topic or main keyword into the first field — for example, 'how to grow on YouTube' or 'keto diet for beginners'. Optionally add your target audience and SEO keywords to make the script even more targeted and search-optimized from the first sentence.",
            },
            {
              step: 2,
              title: "Choose Your Style and Tone",
              desc: "Select your video length (3 to 15 minutes), tone (educational, entertaining, storytelling, authoritative, or motivational), video goal, and script style. Each combination produces a uniquely structured script optimized for that format and your audience's expectations.",
            },
            {
              step: 3,
              title: "Generate and Review",
              desc: "Click Generate YouTube Script and the AI creates a complete, section-by-section script with hook, intro, structured main content, pattern interrupts, mid-video CTA, end CTA, and outro — all tuned for your chosen length and tone.",
            },
            {
              step: 4,
              title: "Copy and Film",
              desc: "Copy individual sections or the entire script with one click. Check the Bonus tab for B-roll suggestions, on-screen text ideas, and thumbnail text you can apply immediately. Then open the script in your teleprompter or notes app and hit record.",
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

      {/* ── About ────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Script Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How the Script Generator Works
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free YouTube Script Generator creates complete, professionally structured video scripts
              using proven frameworks developed by top-performing YouTube creators and audience retention
              specialists. Every script follows the same foundational architecture used by channels with
              millions of subscribers: a psychologically-engineered hook in the first 5–15 seconds that
              creates a curiosity gap or emotional tension, a concise intro that establishes relevance and
              previews value, main content broken into clearly-titled sections for easy navigation, pattern
              interrupts every 20–40 seconds to sustain attention, and CTAs placed at the exact moments
              where viewer engagement peaks.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our AI doesn't just generate generic text — it selects the optimal structural framework for
              your chosen style (tutorial, listicle, storytelling, talking head, or documentary) and adapts
              pacing, tone, and word count to match your target video duration precisely. A 5-minute
              tutorial script looks and reads fundamentally differently from a 15-minute storytelling script,
              and the generator accounts for that at every level: section length, number of pattern
              interrupts, CTA placement timing, and outro depth.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              SEO keyword integration is woven naturally into the hook and intro sections — the parts of
              your video that YouTube's caption-based indexing weighs most heavily — so your script
              simultaneously optimizes for viewer retention and algorithmic discoverability without keyword
              stuffing or unnatural phrasing.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why a Good Script Dramatically Improves YouTube Performance
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's algorithm ranks videos primarily on watch time and audience retention — specifically
              the percentage of the video that average viewers watch. A well-scripted video routinely
              achieves 50–70% average view duration, while an unscripted video on the same topic might see
              25–35%. That difference is enormous: higher retention signals to YouTube that your video is
              valuable, which causes it to be recommended more aggressively in Suggested Videos, Home feed,
              and YouTube Search. This compounding effect means a single well-scripted video can generate
              10–20× more total views than a poorly structured video on the same topic, simply because the
              algorithm distributes it far more broadly.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Beyond the algorithm, scripting directly impacts revenue. Scripted videos tend to be longer,
              more focused, and less likely to trigger viewer drop-off before mid-roll ad placements.
              Keeping viewers engaged past the 50% mark — where mid-roll ads are typically inserted — can
              double or triple your ad revenue per video compared to a video where most viewers leave early.
              Pair strong scripting with an optimized{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                title
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                description
              </Link>{" "}
              to maximize both click-through rate and post-click retention simultaneously.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Scripting also eliminates one of the most damaging unscripted video habits: rambling. When
              creators speak without a structure, they over-explain, repeat themselves, and lose the thread —
              all of which drive viewer drop-off. A script holds you accountable to every sentence having a
              purpose, which produces a tighter, more confident delivery that audiences respond to with
              longer watch sessions and higher subscriber conversion rates.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" /> Benefits of Using This YouTube Script Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Generates complete scripts with hook, intro, body, CTA, and outro",
                "5 tone options to match your channel style and audience personality",
                "5 script styles: tutorial, listicle, storytelling, talking head, documentary",
                "Pattern interrupts built in every 20–40 seconds for maximum retention",
                "Calibrated word counts matched to your target video duration",
                "SEO keyword integration woven naturally into hook and intro sections",
                "Mid-video and end-video CTAs designed to drive likes, subs, and watch time",
                "Bonus B-roll, on-screen text, and thumbnail text suggestions included",
                "Copy individual sections or the entire script with one click",
                "100% free — no account required, unlimited script generations",
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

      {/* ── Tips ─────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Write Better YouTube Scripts</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Use the Bonus tab after generating your script — the B-roll suggestions and on-screen text ideas are built to complement each section and save hours of editing planning.",
            "Nail your hook first: rewrite it at least 2–3 times before filming. The first 15 seconds determine whether viewers stay, and a 10% improvement in 30-second retention compounds across every video.",
            "Make videos at least 8 minutes long to enable mid-roll ad placements — this single change can double your ad revenue per video without requiring more views.",
            "Use the keywords field to inject your primary search term naturally into the hook and intro — these sections are transcribed first by YouTube and carry the most SEO weight.",
            "Read your script aloud before filming. Sentences that look fine on the page often sound unnatural when spoken — this is the fastest way to catch stiff phrasing.",
            "Add a mid-video CTA asking a specific question in the comments (tied to the video topic) rather than a generic 'leave a comment below' — topic-specific prompts generate 3–5× more responses.",
            "After scripting, generate your title with the YouTube Title Generator before you film — knowing your exact title first ensures your hook and intro language mirrors the promise your title makes.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related YouTube Tools ────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related YouTube Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              name: "YouTube Video Idea Generator",
              path: "/tools/youtube-video-idea-generator",
              desc: "Generate the video concept and angle before writing your script for stronger content.",
            },
            {
              name: "YouTube Title Generator",
              path: "/tools/youtube-title-generator",
              desc: "Create a high-CTR title that matches the hook and promise in your generated script.",
            },
            {
              name: "YouTube Description Generator",
              path: "/tools/youtube-description-generator",
              desc: "Write an SEO-optimized description that mirrors your script's key points and keywords.",
            },
            {
              name: "YouTube Hashtag Generator",
              path: "/tools/youtube-hashtag-generator",
              desc: "Add the right hashtags to amplify every video you script and publish.",
            },
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

      {/* ── FAQ ──────────────────────────────────────────────────── */}
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
        <div className="mt-6 p-5 rounded-2xl bg-muted/40 border border-border text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Complete your video optimization workflow — </strong>
            After scripting, generate your title with the{" "}
            <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">YouTube Title Generator</Link>,
            write your description with the{" "}
            <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">YouTube Description Generator</Link>,
            and check your overall SEO with the{" "}
            <Link href="/tools/youtube-seo-score-checker" className="text-primary hover:underline font-medium">YouTube SEO Score Checker</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
