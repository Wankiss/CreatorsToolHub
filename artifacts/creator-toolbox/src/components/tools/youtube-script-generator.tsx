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
    a: "A YouTube Script Generator is an AI-powered tool that creates complete, structured video scripts from your topic, target audience, and style preferences. YouTube's Creator Academy identifies watch time and audience retention as the primary signals YouTube uses to decide how broadly to recommend a video — and scripted videos consistently outperform unscripted ones on both metrics. Our generator produces a ready-to-use script with a psychologically engineered hook, a value-previewing intro, structured body sections with built-in pattern interrupts, mid-video and end-of-video CTAs, and a closing outro — all calibrated to your chosen video length and tone. The result is a tighter, more confident video that holds viewer attention longer and signals higher quality to the algorithm.",
  },
  {
    q: "How do I write a YouTube script that keeps viewers watching?",
    a: "Retention-optimized scripts follow a specific architecture that YouTube's Creator Academy identifies as key to strong performance: (1) A hook in the first 5–15 seconds that creates a curiosity gap or states a specific, credible promise. (2) A concise intro that confirms relevance and previews value — without giving the answer away. (3) Structured main content broken into clearly named sections that signal progress and reduce cognitive load. (4) Pattern interrupts at regular intervals — perspective shifts, rhetorical questions, surprising data, or format changes that reset attention before it drifts. (5) A mid-video CTA that feels like a natural pause rather than an interruption. (6) A strong end CTA tied specifically to what the viewer just learned, linking to the next logical step.",
  },
  {
    q: "How long should a YouTube video script be?",
    a: "Script length should be calibrated to your target video length at approximately 130–150 words per minute for normal conversational delivery — a widely cited speaking rate benchmark across broadcast and presentation coaching. A 5-minute video requires roughly 650–750 words of spoken content; a 10-minute video needs 1,300–1,500 words; a 15-minute video requires 1,950–2,250 words. Our generator automatically calibrates output length to your selected duration. Keep in mind that pauses, b-roll moments, and on-screen demonstrations reduce the actual words-per-minute pace — treat the script length as a framework, not a rigid target. For monetization, YouTube's Help Center confirms videos must be at least 8 minutes long to enable mid-roll ad placements, making that a key script-length threshold for revenue-focused creators.",
  },
  {
    q: "What is a pattern interrupt in a YouTube script?",
    a: "A pattern interrupt is any deliberate shift in content, tone, format, or delivery that disrupts the viewer's passive watching state and re-engages active attention. Viewer attention is not static — it naturally drifts during continuous passive media consumption, which is why the best-performing YouTube scripts are structured to introduce something unexpected at regular intervals: a surprising statistic, a direct question to the audience, a shift from instructional to storytelling mode, a change in pacing, or a brief humorous aside. Pattern interrupts are used deliberately by high-retention channels precisely because YouTube's Creator Academy identifies audience retention as one of the strongest signals driving video distribution. Every script our tool generates includes pattern interrupts at intervals calibrated to your chosen video length.",
  },
  {
    q: "What are the different YouTube script styles and when should I use each?",
    a: "Tutorial scripts work best for how-to content, software walkthroughs, and skill-based topics — they follow a step-by-step structure with numbered sections and transition cues. Listicle scripts ('7 Reasons…', '10 Best…') perform strongly for discovery content because the numbered format sets clear expectations and is highly binge-able. Storytelling scripts open with a narrative arc and work best for personal brand channels, case studies, and motivational content where emotional connection drives retention. Talking head scripts are structured for direct-to-camera delivery with strong conversational pacing, ideal for commentary and education. Documentary scripts use a journalistic evidence-building narrative, best for investigative or deep-dive content. Choose based on your channel's existing style, your audience's expectations, and which format aligns with your video's primary goal.",
  },
  {
    q: "How important is the YouTube video hook?",
    a: "The hook is the highest-leverage element of your entire script. YouTube's Creator Academy explicitly states that 'the first few seconds of your video are critical' — viewer retention curves consistently show the steepest drop-off point is within the first 30 seconds, before the algorithm has collected enough engagement data to confidently recommend the video further. A strong hook does three things simultaneously: creates immediate curiosity or emotional tension that makes stopping feel like a loss, establishes who the video is specifically for, and signals production confidence. The most effective hook formats are: the bold contrarian statement ('Everything you've been told about X is wrong'), the specific promise ('By the end of this video, you'll know exactly how to…'), and the dramatic open — starting mid-action before explaining the context.",
  },
  {
    q: "Should I read my YouTube script word for word?",
    a: "Using your script as a rigid teleprompter read typically produces stiff, low-energy delivery that viewers notice — and that signals low production confidence, which accelerates early drop-off. The better approach: use the script as a framework. Internalize each section's core point and key phrases, then deliver it in your natural voice. Most effective YouTube creators script their hook and CTAs precisely (because these need to land exactly right), then speak the body sections semi-improvised against a detailed outline. The goal is sounding like you're talking to one specific person, not reciting from a document. If you use a teleprompter, practice reading at a genuinely conversational pace with deliberate pauses — pacing is the most common teleprompter mistake.",
  },
  {
    q: "What is the best YouTube video length for views and monetization?",
    a: "The optimal length depends on your goal. For monetization, YouTube's Help Center confirms that videos must be at least 8 minutes long to enable mid-roll ads — the ability to place ads in the middle of the video rather than just at the start. Mid-roll placements can substantially increase ad revenue per video because they generate additional impressions without requiring more views. For algorithmic discovery, shorter videos (4–7 minutes) with very high retention rates can outperform longer videos in recommendations — YouTube distributes based on watch time percentage, not absolute length. The key metric is average view duration as a percentage: a 10-minute video where viewers watch 70% outperforms a 20-minute video at 30%. For most educational channels, 8–12 minutes balances monetization eligibility with retention-friendly length.",
  },
  {
    q: "Does including my keyword in my YouTube script help SEO?",
    a: "Yes — with an important qualifier. YouTube generates automatic captions for every video and its Help Center confirms that captions help viewers and accessibility tools — and YouTube's systems use the transcript data to better understand video content. This means speaking your target keyword naturally within the first 30–60 seconds of your video (which maps to the earliest portion of the transcript) reinforces the topic signals in your title and description. Chapter markers tied to search-relevant phrases add additional indexed entry points. That said, YouTube's Creator Academy is clear that your title and description carry far more direct SEO weight than transcript keywords — script keyword integration is a secondary signal, not a primary ranking driver. The keyword field in our generator automatically weaves your specified keywords into the hook and intro sections where they carry the most transcript weight.",
  },
  {
    q: "What should I say in my YouTube video call-to-action?",
    a: "The most effective CTAs are specific, value-connected, and placed at natural momentum points rather than awkward pauses. YouTube's Creator Academy advises creators to ask viewers to take a specific action that connects directly to what they just watched — generic asks ('like and subscribe') underperform because they're disconnected from the content and interrupt the experience. Our scripts include two CTA placements: a mid-video CTA around the 50–60% mark asking for a low-friction action (typically a like or a topic-specific comment prompt tied to the video's subject), and an end CTA linking the next step to what the viewer just learned ('If you want to go deeper on this, my video on [related topic] covers exactly how to…'). The principle YouTube Creator Academy reinforces: one clear, specific ask beats four simultaneous requests every time.",
  },
  {
    q: "How does a well-structured script affect YouTube revenue?",
    a: "Script quality has a direct revenue impact beyond just views — through mid-roll ad delivery. YouTube's Help Center confirms that mid-roll ads (ads placed mid-video) require a minimum video length of 8 minutes. Scripted videos tend to be longer, more focused, and less likely to trigger early drop-off — meaning more viewers reach mid-roll ad positions. A video where 60% of viewers watch past the midpoint delivers fundamentally more ad impressions per view than one where most viewers leave at 30%. Beyond ad revenue, strong scripts also improve click-through on end screens, which drives more views on subsequent videos, compounds channel watch time, and accelerates the subscriber growth that unlocks additional YPP monetization tiers. Script quality is a revenue multiplier, not just an audience experience improvement.",
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

          {/* Section 1: How the generator works */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Script Structure Directly Drives YouTube Distribution
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's Creator Academy identifies <strong className="text-foreground">watch time and audience retention</strong> as the primary signals the algorithm uses to decide how broadly to recommend a video — across Search, Suggested Videos, and the Home feed. A script isn't a writing exercise; it's the upstream decision that determines your retention curve before you film a single frame. Unscripted videos on the same topic routinely generate early drop-off from rambling, repeated points, and unfocused delivery — all of which suppress distribution. A well-structured script removes those failure points at the source.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our generator produces a complete script framework: a psychologically engineered hook in the first 5–15 seconds, a concise intro that previews value without giving the answer away, structured body sections with named transitions and pattern interrupts to maintain attention, CTAs at the moments where viewer engagement peaks, and an outro that drives the next action. The AI selects the optimal structure for your chosen style — tutorial, listicle, storytelling, talking head, or documentary — and adapts pacing and word count to match your target duration precisely.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              SEO keyword integration is woven into the hook and intro sections — the first 30–60 seconds of spoken content, which maps to the highest-weight portion of YouTube's auto-generated transcript. YouTube's Help Center confirms captions are generated automatically for every video and used to improve content understanding, making natural keyword placement in your early script a genuine (if secondary) SEO signal. Pair your script with an optimized{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                title
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                description
              </Link>{" "}
              for a complete pre-publish workflow.
            </p>
          </div>

          {/* Section 2: The 8-minute threshold + revenue */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The 8-Minute Script Threshold That Changes Your Revenue Model
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's Help Center confirms a hard threshold: videos must be <strong className="text-foreground">at least 8 minutes long</strong> to enable mid-roll ad placements — ads inserted mid-video rather than only at the start. This single structural decision fundamentally changes a video's revenue potential. A well-retained 8-minute video can generate substantially more ad revenue than a 5-minute video with the same view count, because mid-roll placements create additional impression opportunities without requiring additional traffic.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Scripted videos are structurally better suited to hitting and holding this threshold. Unscripted videos tend to run either too short (creators underestimate their speaking time) or artificially long (padding to hit 8 minutes with low-value filler that tanks retention). A script calibrated to 8–12 minutes reaches the mid-roll threshold with content that justifies the length — maintaining the retention curve that signals quality to the algorithm. Our generator includes a 10-minute option specifically designed around this monetization structure, with mid-roll CTA placement timed to the natural engagement peak around the 50–60% mark.
            </p>

            {/* Citation capsule */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">The script-to-revenue connection</strong>
              YouTube's{" "}
              <a href="https://support.google.com/youtube/answer/72857" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Help Center
              </a>{" "}
              confirms that mid-roll ads require a minimum 8-minute video length. YouTube's{" "}
              <a href="https://creatoracademy.youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Creator Academy
              </a>{" "}
              identifies watch time and audience retention as the primary signals driving video distribution across Search, Suggested, and Home feed. A structured script is the upstream decision that determines both: it calibrates video length to the monetization threshold and structures content to sustain the retention that drives algorithmic reach.
            </div>
          </div>

          {/* Section 3: The 5-part architecture */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> The Five-Part Script Architecture Built Into Every Generation
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every script this generator produces follows a five-part architecture validated by YouTube's Creator Academy guidance on audience retention and viewer behavior. Each part has a specific function in the retention curve:
            </p>
            <div className="grid sm:grid-cols-1 gap-3 mb-4">
              {[
                { part: "1. Hook (0–15 sec)", role: "Create a curiosity gap or bold promise that makes stopping feel like a loss. YouTube Creator Academy calls the first seconds 'critical' — the steepest drop-off point is here." },
                { part: "2. Intro (15 sec – 1 min)", role: "Confirm who the video is for, preview the structure, and establish credibility — without giving away the answer. Sets viewer expectation and reduces early exits." },
                { part: "3. Body Sections", role: "Structured, named sections that signal progress. Pattern interrupts built in at regular intervals — perspective shifts, questions, data points, or format changes — to reset attention before it drifts." },
                { part: "4. Mid-Video CTA", role: "Placed at the 50–60% mark where engagement is still high. Topic-specific ask (a comment prompt tied to the video's exact subject) rather than a generic 'like and subscribe'." },
                { part: "5. End CTA + Outro", role: "One specific next-step ask linked directly to what the viewer just learned. YouTube Creator Academy: one clear action outperforms multiple simultaneous requests." },
              ].map(({ part, role }) => (
                <div key={part} className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <div className="font-semibold text-sm text-foreground mb-1">{part}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Feature grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" /> Benefits of Using This YouTube Script Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Five-part retention architecture (hook, intro, body, CTA, outro) based on YouTube Creator Academy guidance",
                "8-minute script option calibrated to YouTube Help Center's mid-roll ad eligibility threshold",
                "5 script styles: tutorial, listicle, storytelling, talking head, documentary — each with distinct structure",
                "Pattern interrupts built in at regular intervals to sustain the retention curve YouTube's algorithm rewards",
                "Keyword integration in hook and intro — the sections that map to the highest-weight transcript portion",
                "Mid-video CTA timed to the 50–60% engagement peak, with topic-specific comment prompt formula",
                "Auto-captions SEO: keywords spoken early in your script reinforce your title and description signals",
                "Bonus B-roll, on-screen text, and thumbnail text suggestions included in every generation",
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
            "Nail your hook first: rewrite it at least 2–3 times before filming. YouTube's Creator Academy calls the first seconds 'critical' — the retention curve drops most steeply before viewers reach the 30-second mark, making the hook the highest-leverage rewrite investment per word.",
            "Target at least 8 minutes per video to enable mid-roll ads — YouTube's Help Center confirms this is the eligibility threshold. Script to this length with content that earns it, not filler: a 10-minute scripted video with genuine depth outperforms an 8-minute padded one on every metric.",
            "Use the keywords field to inject your primary search term naturally into the hook and intro — YouTube generates automatic captions for every video, and keywords spoken early in your transcript reinforce the topic signals in your title and description.",
            "Read your script aloud before filming. Sentences that look fine on the page often sound unnatural when spoken — this is the fastest way to catch stiff phrasing, run-on sentences, and tongue-twisting word combinations before they make it onto film.",
            "Make your mid-video CTA a specific comment prompt tied to the exact topic you just covered — 'Tell me in the comments: which of these three approaches fits your situation?' performs better than 'leave a comment below' because it gives viewers something concrete to respond to.",
            "Generate your title with the YouTube Title Generator before you film — knowing your exact title first ensures your hook and intro language mirrors the specific promise your title makes. A hook-title mismatch confuses viewers and accelerates early drop-off.",
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
