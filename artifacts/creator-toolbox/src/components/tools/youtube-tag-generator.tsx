import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Tag, ListChecks,
  ChevronDown, Shield, Zap, ArrowUpRight, Info,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube Tag Generator?",
    a: "A YouTube Tag Generator is an AI-powered tool that automatically creates a set of SEO-optimized tags for your YouTube video based on your title and target keyword. Instead of manually brainstorming keywords, the generator analyzes your video topic, identifies relevant search phrases, builds long-tail variations, and surfaces trending keyword modifiers — all in seconds. Our tool is powered by AI, which means it goes beyond simple keyword matching to understand search intent and produce tags that reflect how real viewers describe and search for your type of content.",
  },
  {
    q: "How do YouTube tags help videos rank?",
    a: "YouTube tags are metadata signals that help YouTube's algorithm understand what your video is about and which search queries it should be surfaced for. When you upload a video, YouTube processes your title, description, and tags together to build a content profile. Tags reinforce the topic signals in your title and fill in semantic gaps — for example, if your title mentions 'how to lose weight fast', tags like 'weight loss tips for beginners', 'fat burning exercises', and 'diet for weight loss' clarify the content's depth and breadth. Strong tags improve your chances of appearing in YouTube search results, suggested video feeds, and browse features, especially for newer videos that haven't yet built up watch time authority.",
  },
  {
    q: "How many tags should I use on YouTube?",
    a: "YouTube allows up to 500 characters total for tags, which typically works out to 10–20 tags depending on their length. Most experienced creators use 10–15 well-chosen tags rather than trying to max out the character limit. Quality matters far more than quantity — 12 highly relevant tags will outperform 40 loosely related ones. A good tag set for a single video should include: 2–3 exact-match tags mirroring your title keywords, 4–6 broader topic tags covering the niche, 3–4 long-tail variation tags targeting specific search phrases, and 1–2 branded tags if you have an established channel. Our AI tag generator produces a curated, relevance-ranked set you can paste directly into YouTube Studio.",
  },
  {
    q: "Are YouTube tags still important for SEO?",
    a: "Yes — YouTube tags still matter for SEO in 2026, though their role has evolved. YouTube's public guidance confirms that tags help the platform understand video content and are particularly valuable for videos on topics where the title alone may be ambiguous. Tags are less important than they were five years ago because YouTube's AI has gotten better at inferring context from titles and descriptions, but they still contribute to discoverability — especially for new channels without an established watch history. The biggest mistake creators make is ignoring tags entirely or adding completely irrelevant tags. Well-researched tags that reinforce your title and description keyword strategy remain a consistent ranking signal across YouTube search and suggested videos.",
  },
  {
    q: "What are the best tags for YouTube videos?",
    a: "The best YouTube tags share three characteristics: relevance, specificity, and search volume. Start with exact-match tags that directly mirror your video title keyword — these are your highest-priority tags. Then add long-tail variations that describe what viewers are actually searching for (e.g., 'how to start a YouTube channel with no money', 'YouTube channel ideas for beginners 2026'). Include broad category tags (e.g., 'YouTube tips', 'content creation', 'social media growth') to help YouTube place your video in the right content cluster. Avoid generic tags like 'video' or 'YouTube' — they're too competitive and don't help the algorithm contextualize your content. Always prioritize tags you'd realistically want to rank for in YouTube search.",
  },
  {
    q: "Can I use the same tags on every video?",
    a: "No — you should never copy and paste identical tags across all your videos. YouTube's algorithm expects your tags to reflect the specific content of each individual video. Reusing the exact same tag set signals that your metadata isn't tailored to the content, which can reduce how effectively YouTube distributes each video. That said, you can and should reuse a few core brand or niche tags across your channel (e.g., your channel name, your main topic category) — what you want to avoid is reusing the entire tag set verbatim. Use our AI tag generator to create a fresh, video-specific tag set for each upload. The tool generates tags based on your actual video title and target keyword, ensuring every tag set is unique and relevant.",
  },
  {
    q: "Does this YouTube tag generator use AI?",
    a: "Yes — this YouTube tag generator is fully powered by AI. When you enter your video title and target keyword, our AI analyzes the topic to understand search intent, identifies core keyword phrases, generates long-tail variations targeting niche queries, and surfaces trending modifiers that real viewers use when searching YouTube. The AI produces a curated list of SEO-optimized tags in seconds — no manual keyword research or guesswork required. All tags are ranked by relevance so you can quickly identify which ones to prioritize. The tool is completely free to use with no account or subscription required.",
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
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This AI YouTube Tag Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free YouTube tag generator is powered by AI and analyzes your video title and target
              keyword to produce a curated list of SEO-optimized tags. Unlike basic keyword tools that
              return generic suggestions, our AI understands search intent — it extracts core phrases
              from your title, generates long-tail keyword variations that reflect how real viewers
              search on YouTube, and injects trending modifiers that boost relevance across search,
              suggested videos, and browse features.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The result is a diverse, high-quality tag set that helps YouTube's algorithm understand
              exactly what your video is about — in under a second. Each generated tag is designed to
              complement your title and description, creating a consistent keyword signal that improves
              your video's chances of ranking in search and being recommended to the right audience.
              Use it alongside our{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                YouTube Title Generator
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube Description Generator
              </Link>{" "}
              for a complete, AI-powered SEO workflow for every video you publish.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Why YouTube Tags Matter for SEO
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Tags are one of the signals YouTube uses to categorize your video content and determine
              which search queries it should appear for. When you upload a video, YouTube reads your
              title, description, and tags together to build a content profile. Proper YouTube SEO tags
              help the algorithm match your video to viewer intent, improving your chances of appearing
              in search results, suggested videos, and browse features.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Combined with a strong title and keyword-rich description, well-chosen tags can
              meaningfully boost video discoverability — especially for newer channels that haven't yet
              built the watch time authority needed to rank purely on engagement signals. Tags fill in
              semantic gaps that your title can't cover alone: if your title is "How to Lose Weight
              Fast", tags like "weight loss for beginners", "fat burning at home", and "diet tips 2026"
              expand the range of searches your video is eligible to rank for.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Long-tail tags — specific multi-word phrases with lower competition — are particularly
              valuable for new videos. While broad tags like "weight loss" face enormous competition
              from established channels, a long-tail tag like "weight loss workout at home for beginners
              without equipment" targets a specific query where your video can realistically appear in
              the top results, even with a small channel. Our AI tag generator is specifically designed
              to surface these high-opportunity long-tail variations alongside your core tags. Pair
              strong tags with a great{" "}
              <Link href="/tools/youtube-keyword-generator" className="text-primary hover:underline font-medium">
                keyword strategy
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-seo-score-checker" className="text-primary hover:underline font-medium">
                SEO score check
              </Link>{" "}
              before publishing for best results.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Tool
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Powered by AI — generates relevant, SEO-optimized keyword tags instantly",
                "Creates long-tail YouTube tags that target niche search queries with lower competition",
                "Understands search intent, not just keyword matching — tags reflect how viewers search",
                "Helps improve YouTube video discoverability across search, suggested, and browse feeds",
                "Produces a diverse tag mix: broad category tags, specific topic tags, and long-tail variants",
                "Saves hours of manual keyword research per video upload",
                "Click-to-copy tags individually or copy all tags at once for YouTube Studio",
                "Works for any niche — YouTube growth, cooking, gaming, fitness, tech, finance, and more",
                "No keyword tool subscription needed — free with no account or usage limits",
                "Use it alongside title and description generators for a complete SEO workflow",
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
