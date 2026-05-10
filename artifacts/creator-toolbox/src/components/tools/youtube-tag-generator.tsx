import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Tag, ListChecks,
  ChevronDown, Shield, Zap, ArrowUpRight, Info, Lightbulb, TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube Tag Generator?",
    a: "A YouTube Tag Generator is an AI-powered tool that creates a set of SEO-optimized tags for your YouTube video based on your title and target keyword. YouTube has 2.7 billion monthly active users (Statista, 2024) searching across the world's second-largest search engine, and its algorithm processes over 80 billion signals daily (YouTube Blog, 2024) to determine which videos surface for each query. Tags are part of those signals — they help the algorithm understand your video's topic when the title alone is ambiguous. Our generator analyzes your video topic, identifies relevant search phrases, builds long-tail variations, and surfaces topical modifiers — all in seconds, at no cost.",
  },
  {
    q: "How do YouTube tags help videos rank?",
    a: "YouTube's Help Center confirms that tags help the algorithm understand your video's content — particularly useful when your keyword has common misspellings or when the title alone doesn't fully convey the topic. When you upload a video, YouTube reads your title, description, and tags together to build a content profile. Tags reinforce the topicality signals in your title and fill semantic gaps — for example, a title like 'How to Lose Weight Fast' paired with tags like 'weight loss for beginners', 'fat burning at home', and 'diet tips for women' clarifies the content's depth and audience. This is especially valuable for new videos that haven't yet built watch time authority — strong tags give the algorithm more to work with while early engagement data accumulates.",
  },
  {
    q: "How many tags should I use on YouTube?",
    a: "YouTube allows up to 500 characters total for all tags combined (YouTube Help Center) — which typically works out to 10–20 tags depending on phrase length. A Backlinko study of 1.3 million YouTube videos found no strong correlation between tag count and rankings — relevance matters far more than volume. In practice, 8–15 focused, relevant tags consistently outperform both too-few and too-many approaches. Structure your tag set in three tiers: (1) 2–3 exact-match tags mirroring your title keyword verbatim, (2) 4–6 broader topic or category tags, and (3) 3–4 long-tail phrase tags targeting specific search queries. One more critical detail: Backlinko's research found that YouTube weights the first tag most heavily as the primary keyword signal — always lead with your most important keyword phrase as tag number one.",
  },
  {
    q: "Are YouTube tags still important for SEO in 2026?",
    a: "Yes — with an important caveat that most tag guides won't tell you. YouTube's Help Center says directly: 'Tags can be useful if the content of your video is commonly misspelled. Otherwise, tags play a minimal role in your video's discovery.' That's an honest admission from YouTube itself. Tags matter most in three specific scenarios: (1) your keyword is frequently misspelled or has multiple accepted phrasings, (2) your title is short or ambiguous and doesn't give the algorithm enough topic context on its own, and (3) you're a new channel without established watch time history and need every metadata signal working for you. For established channels with strong watch time and CTR, tags have less marginal impact — but they never hurt when relevant, and irrelevant tags can actively confuse the algorithm.",
  },
  {
    q: "What are the best tags for YouTube videos?",
    a: "The best YouTube tags are relevant, specific, and layered across three categories. YouTube's Creator Academy advises using tags that accurately reflect your video's content — avoid tags designed to game the algorithm with irrelevant popular keywords. Start with exact-match tags that directly mirror your title keyword — place this as your first tag, since Backlinko's 1.3M video study found YouTube weights the first tag most heavily. Add long-tail variations describing what viewers actually search for (e.g., 'how to start a YouTube channel with no money', 'YouTube ideas for beginners 2026'). Include 2–3 broad category tags (e.g., 'YouTube tips', 'content creation') to help YouTube cluster your video in the right topic neighborhood. Avoid ultra-generic tags like 'video' or 'YouTube' — too competitive, no contextual value.",
  },
  {
    q: "Can I use the same tags on every video?",
    a: "No — reusing identical tags across all your videos reduces how effectively YouTube distributes each one. YouTube's algorithm expects tags to reflect the specific content of each video — a uniform tag set signals that your metadata isn't tailored to the content. That said, 2–3 evergreen channel tags (your channel name, your core niche) can appropriately appear on every video. What to avoid is copying the entire tag set verbatim from one video to the next. YouTube's Creator Academy guidance emphasizes accurate, content-specific metadata — and tags are part of that. Use the AI generator to create a fresh tag set for each upload based on its specific title and keyword, keeping only your channel-level brand tags constant.",
  },
  {
    q: "What does YouTube's own guidance say about tags?",
    a: "YouTube's Help Center is more candid about tags than most SEO guides acknowledge. The official text states: 'Tags can be useful if the content of your video is commonly misspelled. Otherwise, tags play a minimal role in your video's discovery.' YouTube also advises against using tags that aren't relevant to your content — irrelevant tags can be penalized. This doesn't mean tags are useless — it means their primary value is topical reinforcement (for ambiguous or short titles) and misspelling coverage, not as a primary ranking driver. Your title and description carry far more ranking weight. Use tags to complete your metadata picture — they're one piece of a six-category optimization, not the whole strategy.",
  },
  {
    q: "Should I copy the tags from competitor videos?",
    a: "No — directly copying competitor tags is a low-value strategy and potentially counterproductive. YouTube's algorithm evaluates tag relevance against your specific video's content — tags pulled from a competitor's video may not match your video's actual topic well enough to help, and irrelevant tags can confuse the algorithm. YouTube's Help Center explicitly states: 'We recommend using tags that are relevant to your content.' The better approach: use competitor videos to understand the keyword territory, then build a tag set around your video's specific title and angle. Long-tail tags where your video has a differentiated angle or specific audience focus will outperform generic tags copied from the highest-view video in your niche. Our AI generator builds tags from your actual title and keyword — not from guessing what another video used.",
  },
  {
    q: "Does this YouTube tag generator use AI?",
    a: "Yes — this tag generator is fully powered by AI. When you enter your video title and target keyword, the AI analyzes the topic to understand search intent, identifies core keyword phrases, generates long-tail variations targeting niche queries, and surfaces topical modifiers that real viewers use when searching YouTube. It's designed to produce a first-tag-priority set — meaning the most important exact-match keyword appears first in the output, aligned with Backlinko's finding that YouTube weights the first tag most heavily. The output is a curated, relevance-ranked list ready to paste directly into YouTube Studio. Completely free, no account required.",
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
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {index + 1}
          </span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
            {question}
          </span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div
        ref={bodyRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}
      >
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function YouTubeTagGeneratorTool() {
  const [videoTitle, setVideoTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("youtube-tag-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD schema
  useEffect(() => {
    const id = "faq-schema-yt-tag-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!videoTitle.trim()) {
      toast({ title: "Video title required", description: "Enter your video title to generate tags.", variant: "destructive" });
      return;
    }
    run({ topic: videoTitle, keyword });
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
          <Tag className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Tag Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            <Sparkles size={11} className="text-primary" /> Powered by AI
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Title *</label>
            <Input
              placeholder="e.g. How to Lose Weight Fast for Beginners (No Equipment)"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Main Keyword <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input
              placeholder="e.g. weight loss for beginners, YouTube growth..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
            />
            <p className="text-xs text-muted-foreground mt-1">The primary keyword you want your video to rank for — strengthens tag relevance.</p>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading
            ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</>
            : <><Sparkles size={16} className="mr-2" />Generate Tags</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Tags</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(outputs.join(", "));
                toast({ title: "All tags copied!" });
              }}
            >
              Copy All Tags
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {outputs.map((tag, i) => (
              <button
                key={i}
                onClick={() => copyItem(tag, i)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm bg-muted/30 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
              >
                {tag}
                {copied === i
                  ? <Check size={12} className="text-green-500" />
                  : <Copy size={12} className="text-muted-foreground" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Click any tag to copy it, or use <strong>Copy All Tags</strong> to paste everything directly into YouTube Studio.
          </p>
        </Card>
      )}

      {/* ── How to Use ─────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Tag Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Video Title",
              desc: "Type your full video title into the first field. The AI uses your title to understand the core topic and extract the most relevant keyword phrases for tagging. A specific, descriptive title produces the most accurate tag set.",
            },
            {
              step: 2,
              title: "Add Your Main Keyword",
              desc: "Enter the primary keyword you want your video to rank for — for example, 'YouTube growth' or 'how to edit videos'. This is the foundation for all generated YouTube SEO tags and helps the AI focus on your highest-priority search phrase.",
            },
            {
              step: 3,
              title: "Click Generate Tags",
              desc: "Hit the Generate Tags button and our AI-powered tool will instantly produce a curated set of SEO-optimized tags. The AI analyzes search intent, generates long-tail variations, and surfaces trending modifiers — all in seconds. No waiting, no sign-up required.",
            },
            {
              step: 4,
              title: "Copy and Use in YouTube Studio",
              desc: "Click any tag to copy it individually, or use Copy All Tags to grab everything at once. Paste the tags directly into the Tags field in YouTube Studio when uploading or editing your video. All tags are ready to use with no editing needed.",
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

      {/* ── About ───────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Tag Generator</h2>
        </div>
        <div className="space-y-8">

          {/* Section 1: What the tool does */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How This AI YouTube Tag Generator Works
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's algorithm processes over <strong className="text-foreground">80 billion signals every day</strong> (YouTube Blog, 2024) to match videos to search queries — and tags are one of those signals. YouTube's Help Center confirms tags help the algorithm understand video content, especially when the title alone is short or ambiguous. This AI generator analyzes your video title and target keyword, extracts core search phrases, builds long-tail variations that reflect how real viewers search, and outputs a relevance-ranked tag set ready to paste into YouTube Studio.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              One design detail that separates this generator from basic tag tools: it outputs the most important exact-match keyword as the first tag — aligned with{" "}
              <a href="https://backlinko.com/youtube-ranking-factors" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Backlinko's study of 1.3 million YouTube videos
              </a>
              , which found that YouTube weights the first tag most heavily as the primary keyword signal. Every other tag in the set is structured around it — broad category tags to cluster the content, long-tail variations to capture specific queries, and niche modifiers to reach the right audience. Use it alongside our{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                YouTube Title Generator
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube Description Generator
              </Link>{" "}
              for a full pre-publish SEO workflow.
            </p>
          </div>

          {/* Section 2: When tags matter (honest take with YouTube Help Center source) */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> What YouTube Actually Says About Tags (And When They Matter Most)
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most tag guides overstate how much tags drive rankings. YouTube's own Help Center is more direct: <em>"Tags can be useful if the content of your video is commonly misspelled. Otherwise, tags play a minimal role in your video's discovery."</em> That's YouTube's own characterization — and understanding it is the difference between a smart tag strategy and one based on outdated advice.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Tags matter most in three situations: (1) your keyword has common spelling variations or alternate phrasings that viewers type differently, (2) your title is short or doesn't fully convey the topic's depth, and (3) you're a newer channel without an established watch time history — in which case every metadata signal carries more weight. A{" "}
              <a href="https://backlinko.com/youtube-ranking-factors" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Backlinko analysis of 1.3 million YouTube videos
              </a>{" "}
              confirmed that relevance matters far more than tag count — 8–12 highly relevant tags consistently outperform 40 loosely related ones. YouTube caps tags at <strong className="text-foreground">500 total characters</strong> (YouTube Help Center), reinforcing that quality over quantity is the intended approach.
            </p>

            {/* Citation capsule */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">The tag hierarchy that actually moves rankings</strong>
              YouTube's{" "}
              <a href="https://support.google.com/youtube/answer/2797468" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Help Center
              </a>{" "}
              confirms tags help the algorithm understand video content, with a 500-character total cap. A{" "}
              <a href="https://backlinko.com/youtube-ranking-factors" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Backlinko study of 1.3 million YouTube videos
              </a>{" "}
              found that YouTube treats the first tag as the primary keyword signal — making your first tag the highest-impact tagging decision you make. Relevance to the video's actual content, not tag volume, is the variable that moves the needle.
            </div>
          </div>

          {/* Section 3: The first tag rule — exclusive content */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The First Tag Rule: Why Tag Order Matters
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators treat all their tags as equal — they're not. Backlinko's study of 1.3 million YouTube videos found a consistent pattern: YouTube appears to weight the <strong className="text-foreground">first tag</strong> most heavily, treating it as the primary keyword signal for the video. This means your first tag should always be your exact target keyword, phrased exactly as you'd want to rank for it — not a variation, not a broad category, the precise search phrase.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800/30 p-4">
                <div className="font-semibold text-sm text-foreground mb-2">Common Mistake</div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {[
                    "First tag: 'how to lose weight' (too broad)",
                    "Random order with no keyword hierarchy",
                    "Generic category tags placed first",
                    "Channel name as the first tag",
                    "Copying competitor tags without relevance check",
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5 shrink-0 font-bold">✕</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="font-semibold text-sm text-foreground mb-2">Best Practice</div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {[
                    "First tag: exact keyword phrase verbatim",
                    "Second tag: closest long-tail variation",
                    "Third–sixth: broad topic/category tags",
                    "Seventh–tenth: niche long-tail phrases",
                    "Last 1–2: channel brand tags (if established)",
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Feature grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Tool
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "First-tag-priority output — exact keyword appears first, aligned with Backlinko's 1.3M video study finding",
                "Generates long-tail tags targeting niche queries where new channels can realistically rank",
                "Understands search intent: tags reflect how real viewers phrase searches, not just keyword matching",
                "Three-tier tag structure: exact-match, broad category, and long-tail variations per video",
                "500-character limit awareness — tag sets are designed to fit YouTube's tag field budget",
                "Honest tag strategy: built on YouTube Help Center guidance, not outdated SEO myths",
                "Click-to-copy individual tags or copy all tags at once for YouTube Studio",
                "Works for any niche — fitness, gaming, finance, cooking, tech, beauty, and more",
                "No subscription or keyword tool needed — free with no account or usage limits",
                "Pairs with title and description generators for a complete metadata SEO workflow",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Get the Most from Your YouTube Tags</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Always place your exact target keyword as the first tag — Backlinko's 1.3M video study found YouTube weights the first tag most heavily as the primary keyword signal. Every other tag in your set should be built around that anchor.",
            "Keep your total tags under 400 characters even though YouTube allows 500 — leaving buffer room ensures you're using only your highest-relevance phrases rather than padding with marginal tags that add no topical value.",
            "Include your keyword's most common misspellings as a tag — YouTube's Help Center cites this as the primary use case where tags directly impact discovery. If your niche keyword is commonly typed wrong, a misspelling tag can capture those searches.",
            "Use long-tail tags (3–5 word phrases) for new videos — broad single-word tags like 'fitness' or 'cooking' face massive competition from established channels. A long-tail tag like 'home workout for beginners no equipment' targets a specific query where a new video can realistically rank.",
            "Don't copy tags from competitor videos — YouTube's algorithm evaluates tag relevance against your specific video's content. Tags from a competitor's different angle or audience will likely be misaligned with your content, reducing their effectiveness.",
            "Generate a fresh tag set for every upload — reusing identical tags across videos signals to YouTube that your metadata isn't tailored to the content. Keep 1–2 brand tags consistent, but regenerate the rest for each new video's specific topic.",
            "Pair tags with a keyword-optimized title and description — YouTube Help Center confirms tags play a 'minimal role' outside of specific scenarios. Your title and description carry far more ranking weight; tags complete the picture but don't compensate for weak metadata elsewhere.",
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
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Generate 40+ high-CTR title formulas that pair perfectly with your tags for maximum reach." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write SEO-optimized descriptions with chapters, hashtags, and keyword-rich text." },
            { name: "YouTube Keyword Generator", path: "/tools/youtube-keyword-generator", desc: "Find high-traffic, low-competition keywords to target with your tags and descriptions." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your title and description for discoverability before you publish your video." },
          ].map(({ name, path, desc }) => (
            <a
              key={path}
              href={path}
              className="group flex items-start gap-4 p-4 rounded-2xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
            >
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
      </section>
    </>
  );
}
