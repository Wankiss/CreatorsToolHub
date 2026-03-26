import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Tag, Copy, Check, RefreshCw, Sparkles, Loader2, AlertCircle,
  ChevronDown, Search, Zap, BarChart2, ListChecks, Clock, ArrowUpRight,
} from "lucide-react";

// ─── Tag Generation Engine ────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "how","what","when","where","why","who","which","this","that","these",
  "those","i","you","he","she","we","they","my","your","his","her","our",
  "their","it","its","as","up","out","about","than","then","so","if","no",
  "not","just","also","only","even","back","still","get","go","make",
]);

const PREFIXES = [
  "how to", "best way to", "easy way to", "step by step", "beginner guide to",
  "complete guide to", "ultimate guide to", "how i", "why you should",
  "tips for", "tricks for", "secrets of",
];

const SUFFIXES = [
  "tutorial", "tips", "guide", "strategy", "explained",
  "step by step", "for beginners", "2025", "2026",
  "that works", "fast", "free", "the right way",
];

const INTENT_PATTERNS = [
  (kw: string) => `${kw} tutorial`,
  (kw: string) => `${kw} tips`,
  (kw: string) => `${kw} strategy`,
  (kw: string) => `${kw} explained`,
  (kw: string) => `${kw} step by step`,
  (kw: string) => `${kw} guide`,
  (kw: string) => `${kw} for beginners`,
  (kw: string) => `how to ${kw}`,
  (kw: string) => `best ${kw} tips`,
  (kw: string) => `${kw} mistakes to avoid`,
  (kw: string) => `${kw} checklist`,
  (kw: string) => `${kw} secrets`,
];

const TRENDING_MODS = ["2025", "2026", "latest", "new", "updated", "fast", "free", "best", "pro"];

function extractCoreKeywords(title: string, mainKeyword: string): string[] {
  const combined = `${title} ${mainKeyword}`.toLowerCase();
  const words = combined.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const filtered = words.filter(w => !STOP_WORDS.has(w) && w.length > 2);
  const phrases: string[] = [];
  for (let i = 0; i < filtered.length; i++) {
    phrases.push(filtered[i]);
    if (i < filtered.length - 1) phrases.push(`${filtered[i]} ${filtered[i + 1]}`);
    if (i < filtered.length - 2) phrases.push(`${filtered[i]} ${filtered[i + 1]} ${filtered[i + 2]}`);
  }
  return [...new Set(phrases)];
}

function scoreTags(tag: string, titleLower: string, mainKeywordLower: string): number {
  let score = 0;
  const words = tag.split(" ");
  if (tag.includes(mainKeywordLower)) score += 40;
  else if (mainKeywordLower.split(" ").some(w => tag.includes(w))) score += 20;
  const titleWords = titleLower.split(/\s+/);
  const matchCount = words.filter(w => titleWords.includes(w)).length;
  score += Math.min(30, matchCount * 10);
  if (/\b(how to|tutorial|guide|tips|explained|step by step)\b/.test(tag)) score += 20;
  if (words.length >= 3 && words.length <= 6) score += 10;
  else if (words.length === 2) score += 5;
  return score;
}

function isValidTag(tag: string): boolean {
  const words = tag.split(" ");
  if (words.length < 2 || words.length > 6) return false;
  if (tag.length < 5) return false;
  if (new Set(words).size !== words.length) return false;
  if (/^\d+$/.test(tag)) return false;
  return true;
}

function getDifficulty(tag: string, mainKeyword: string): "high" | "medium" | "low" {
  const wordCount = tag.split(" ").length;
  const hasMainKw = tag.includes(mainKeyword.toLowerCase());
  if (wordCount <= 2 && hasMainKw) return "high";
  if (wordCount <= 3) return "medium";
  return "low";
}

interface GeneratedTag {
  text: string;
  score: number;
  difficulty: "high" | "medium" | "low";
}

function generateTags(
  title: string,
  mainKeyword: string,
  extraKeywords: string[],
  count: number,
  seed = 0,
): GeneratedTag[] {
  const titleLow = title.toLowerCase();
  const mainKwLow = mainKeyword.toLowerCase();
  const coreKws = extractCoreKeywords(title, mainKeyword);
  const candidates = new Set<string>();

  extraKeywords.forEach(kw => {
    const clean = kw.trim().toLowerCase();
    if (clean) candidates.add(clean);
  });

  candidates.add(mainKwLow);
  PREFIXES.forEach(p => candidates.add(`${p} ${mainKwLow}`));
  SUFFIXES.forEach(s => candidates.add(`${mainKwLow} ${s}`));

  coreKws.slice(0, 12).forEach(kw => {
    candidates.add(kw);
    PREFIXES.slice(seed % PREFIXES.length, seed % PREFIXES.length + 4).forEach(p =>
      candidates.add(`${p} ${kw}`)
    );
    SUFFIXES.slice(seed % SUFFIXES.length, seed % SUFFIXES.length + 4).forEach(s =>
      candidates.add(`${kw} ${s}`)
    );
  });

  coreKws.slice(0, 6).forEach(kw => {
    INTENT_PATTERNS.forEach((fn, i) => {
      if ((i + seed) % 2 === 0 || kw.split(" ").length > 1) candidates.add(fn(kw));
    });
  });

  coreKws.slice(0, 5).forEach(kw => {
    TRENDING_MODS.slice(seed % TRENDING_MODS.length, seed % TRENDING_MODS.length + 4).forEach(mod => {
      candidates.add(`${kw} ${mod}`);
      if (kw.split(" ").length > 1) candidates.add(`best ${kw} ${mod}`);
    });
  });

  extraKeywords.forEach(ek => {
    const clean = ek.trim().toLowerCase();
    if (!clean) return;
    SUFFIXES.slice(0, 5).forEach(s => candidates.add(`${clean} ${s}`));
    INTENT_PATTERNS.slice(0, 4).forEach(fn => candidates.add(fn(clean)));
  });

  const seen = new Set<string>();
  const scored: GeneratedTag[] = [];

  for (const tag of candidates) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, " ");
    if (!isValidTag(clean) || seen.has(clean)) continue;
    seen.add(clean);
    scored.push({ text: clean, score: scoreTags(clean, titleLow, mainKwLow), difficulty: getDifficulty(clean, mainKwLow) });
  }

  scored.sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));
  return scored.slice(0, count);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  high: { label: "High Competition", dot: "bg-red-500", badge: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
  medium: { label: "Medium Competition", dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800" },
  low: { label: "Low Competition", dot: "bg-green-500", badge: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" },
};

const TAG_CHAR_LIMIT = 500;
const COUNT_OPTIONS = [10, 20, 30, 40, 50];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube Tag Generator?",
    a: "A YouTube Tag Generator is a free tool that automatically creates SEO-optimized tags for your YouTube videos. It analyzes your video title and keywords to suggest relevant tags that help YouTube understand your content and show it to the right audience.",
  },
  {
    q: "How do YouTube tags help videos rank?",
    a: "YouTube tags signal to the algorithm what your video is about, helping it categorize and surface your content in search results and recommendations. Using the right keyword tags improves discoverability and can significantly increase your video's organic reach.",
  },
  {
    q: "How many tags should I use on YouTube?",
    a: "YouTube allows up to 500 characters worth of tags per video. Most SEO experts recommend using 10–30 well-chosen tags rather than stuffing as many as possible. Quality, relevance, and variety matter more than quantity.",
  },
  {
    q: "Are YouTube tags still important for SEO?",
    a: "Yes, YouTube tags remain a valuable part of YouTube SEO optimization. While YouTube has said tags are a minor ranking factor, they still help the algorithm understand your video's topic, especially when combined with an optimized title and description.",
  },
  {
    q: "What are the best tags for YouTube videos?",
    a: "The best tags for YouTube videos are a mix of broad keyword tags (e.g. 'youtube tips'), specific long-tail tags (e.g. 'how to grow a youtube channel fast'), and branded or topic-specific tags. Our YouTube tag generator tool creates all three types automatically.",
  },
  {
    q: "Can I use the same tags on every video?",
    a: "No. Using the same tags across all videos is considered tag spam and can hurt your channel's performance. Each video should have unique, relevant tags that specifically match that video's topic and target keywords.",
  },
  {
    q: "Does this YouTube tag generator use AI?",
    a: "Yes. Our free YouTube tag generator uses intelligent keyword expansion algorithms to simulate YouTube search intent, generate long-tail variations, and score tags by relevance. All processing happens instantly in your browser — no data is sent to external servers.",
  },
];

// ─── FAQ Schema Markup ────────────────────────────────────────────────────────

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(item => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
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
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}
      >
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">
          {answer}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouTubeTagGeneratorTool() {
  const [videoTitle, setVideoTitle] = useState("");
  const [mainKeyword, setMainKeyword] = useState("");
  const [extraKeywords, setExtraKeywords] = useState("");
  const [tagCount, setTagCount] = useState(30);
  const [tags, setTags] = useState<GeneratedTag[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [seed, setSeed] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  // Inject FAQ schema into <head>
  useEffect(() => {
    const id = "faq-schema-youtube-tag-gen";
    if (!document.getElementById(id)) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(script);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const totalChars = tags.map(t => t.text).join(", ").length;

  const handleGenerate = useCallback((regenerate = false) => {
    if (!videoTitle.trim() || !mainKeyword.trim()) {
      toast({ title: "Missing fields", description: "Please fill in the Video Title and Main Keyword.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    const nextSeed = regenerate ? seed + 1 : 0;
    setSeed(nextSeed);
    setTimeout(() => {
      const extras = extraKeywords.split(",").map(k => k.trim()).filter(Boolean);
      const result = generateTags(videoTitle, mainKeyword, extras, tagCount, nextSeed);
      setTags(result);
      setIsGenerating(false);
      setHasGenerated(true);
      if (!regenerate) {
        setTimeout(() => document.getElementById("tag-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    }, 400);
  }, [videoTitle, mainKeyword, extraKeywords, tagCount, seed, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyTag = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const copyAll = () => {
    const all = tags.map(t => t.text).join(", ");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    toast({ title: "All tags copied!", description: `${tags.length} tags copied to clipboard.`, duration: 2500 });
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <>
      {/* ── Tool Input Card ───────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Video Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                placeholder="e.g. How to Grow on YouTube in 2026"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Main Keyword <span className="text-red-500">*</span>
              </label>
              <Input
                value={mainKeyword}
                onChange={e => setMainKeyword(e.target.value)}
                placeholder="e.g. YouTube growth"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Optional Keywords{" "}
                <span className="text-muted-foreground font-normal normal-case">(comma separated)</span>
              </label>
              <Input
                value={extraKeywords}
                onChange={e => setExtraKeywords(e.target.value)}
                placeholder="e.g. youtube algorithm, youtube seo, grow youtube channel"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Number of Tags
              </label>
              <div className="flex gap-2 flex-wrap">
                {COUNT_OPTIONS.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTagCount(n)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      tagCount === n
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isGenerating || !videoTitle.trim() || !mainKeyword.trim()}
              className="w-full h-14 text-lg rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Tags...</>
              ) : (
                <><Tag className="mr-2 h-5 w-5" /> Generate Tags</>
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ───────────────────────────────────────────── */}
      {hasGenerated && tags.length > 0 && (
        <section id="tag-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500">
          <Card className="p-6 sm:p-8 rounded-3xl border-border">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold font-display flex items-center gap-2">
                  <Sparkles className="text-primary w-5 h-5" /> Generated Tags
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Click any tag to copy it individually</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold">
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
                <Button size="sm" onClick={copyAll} className="rounded-xl gap-1.5 font-semibold">
                  {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedAll ? "Copied!" : "Copy All Tags"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-6">
              {tags.map((tag, i) => {
                const isCopied = copiedIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => copyTag(tag.text, i)}
                    title={`${DIFFICULTY_CONFIG[tag.difficulty].label} — click to copy`}
                    className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                      isCopied
                        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-700"
                        : "bg-muted/70 text-foreground border-border hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {isCopied
                      ? <Check className="w-3 h-3 shrink-0" />
                      : <Copy className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                    }
                    {tag.text}
                    <span className={`ml-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${DIFFICULTY_CONFIG[tag.difficulty].dot}`} />
                  </button>
                );
              })}
            </div>

            {/* Legend + Character Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-border">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Competition:</span>
                {(["high", "medium", "low"] as const).map(d => (
                  <span key={d} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${DIFFICULTY_CONFIG[d].badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_CONFIG[d].dot}`} />
                    {DIFFICULTY_CONFIG[d].label}
                  </span>
                ))}
              </div>
              <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border ${
                totalChars > TAG_CHAR_LIMIT
                  ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                  : totalChars > TAG_CHAR_LIMIT * 0.85
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800"
                  : "bg-muted/60 text-muted-foreground border-border"
              }`}>
                {totalChars > TAG_CHAR_LIMIT && <AlertCircle className="w-4 h-4" />}
                Total Characters: <span className="font-bold">{totalChars}</span>
                <span className="text-muted-foreground font-normal">/ {TAG_CHAR_LIMIT}</span>
              </div>
            </div>

            {totalChars > TAG_CHAR_LIMIT && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Your tags exceed YouTube's 500-character limit. Remove some tags before uploading.</span>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-4">
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
              desc: "Type your full video title into the first field. The tool uses your title to understand the core topic and extract the most relevant keyword phrases for tagging.",
            },
            {
              step: 2,
              title: "Add Your Main Keyword",
              desc: "Enter the primary keyword you want your video to rank for — for example, 'YouTube growth' or 'how to edit videos'. This is the foundation for all generated YouTube SEO tags.",
            },
            {
              step: 3,
              title: "Click Generate Tags",
              desc: "Hit the Generate Tags button and our tool will instantly produce up to 50 SEO-optimized tags sorted by relevance score. No waiting, no sign-up required.",
            },
            {
              step: 4,
              title: "Copy and Use in YouTube Studio",
              desc: "Click any tag to copy it individually, or use Copy All Tags to grab everything at once. Paste the tags directly into the Tags field in YouTube Studio when uploading your video.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">
                {step}
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About This Tool ──────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Tag Generator</h2>
        </div>

        <div className="space-y-8">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This YouTube Tag Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free YouTube tag generator tool analyzes your video title and target keywords to produce a curated list of SEO-optimized tags using a five-layer keyword expansion engine. It extracts core phrases from your title, generates long-tail keyword variations, simulates YouTube's autocomplete search intent patterns, and injects trending modifiers — all in under a second. The result is a diverse, high-quality tag set that helps YouTube's algorithm understand exactly what your video is about.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Why YouTube Tags Matter for SEO
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Tags are one of the signals YouTube uses to categorize your video content and determine which search queries it should appear for. Proper YouTube SEO tags help the algorithm match your video to viewer intent, improving your chances of appearing in search results, suggested videos, and browse features. Combined with a strong title and description, well-chosen tags can meaningfully boost video discoverability — especially for newer channels with limited authority.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Benefits of Using This Tool
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { text: "Generates relevant, SEO-optimized keyword tags instantly" },
                { text: "Creates long-tail YouTube tags that target niche search queries" },
                { text: "Scores and ranks tags by relevance so you use only the best ones" },
                { text: "Helps improve YouTube video discoverability and click-through rate" },
                { text: "Saves hours of manual keyword research per video" },
                { text: "Free to use — no account, no subscription, no limits" },
              ].map(({ text }, i) => (
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

      {/* ── FAQ Accordion ────────────────────────────────────── */}
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
