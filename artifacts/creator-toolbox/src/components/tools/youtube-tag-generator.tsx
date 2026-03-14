import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tag, Copy, Check, RefreshCw, Sparkles, Loader2, AlertCircle } from "lucide-react";

// ─── Tag Generation Engine ────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "how","what","when","where","why","who","which","this","that","these",
  "those","i","you","he","she","we","they","my","your","his","her","our",
  "their","it","its","as","up","out","about","than","then","so","if","no",
  "not","just","also","only","even","back","still","get","go","make"
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

  // Extract bigrams and trigrams
  const phrases: string[] = [];
  for (let i = 0; i < filtered.length; i++) {
    phrases.push(filtered[i]);
    if (i < filtered.length - 1) phrases.push(`${filtered[i]} ${filtered[i + 1]}`);
    if (i < filtered.length - 2) phrases.push(`${filtered[i]} ${filtered[i + 1]} ${filtered[i + 2]}`);
  }
  return [...new Set(phrases)];
}

function scoreTags(
  tag: string,
  titleLower: string,
  mainKeywordLower: string
): number {
  let score = 0;
  const words = tag.split(" ");

  // Keyword match
  if (tag.includes(mainKeywordLower)) score += 40;
  else if (mainKeywordLower.split(" ").some(w => tag.includes(w))) score += 20;

  // Title similarity
  const titleWords = titleLower.split(/\s+/);
  const matchCount = words.filter(w => titleWords.includes(w)).length;
  score += Math.min(30, matchCount * 10);

  // Search intent patterns
  if (/\b(how to|tutorial|guide|tips|explained|step by step)\b/.test(tag)) score += 20;

  // Long-tail bonus (3–6 words)
  if (words.length >= 3 && words.length <= 6) score += 10;
  else if (words.length === 2) score += 5;

  return score;
}

function isValidTag(tag: string): boolean {
  const words = tag.split(" ");
  if (words.length < 2 || words.length > 6) return false;
  if (tag.length < 5) return false;
  // No repeating words
  if (new Set(words).size !== words.length) return false;
  // No all-numeric tags
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
  seed: number = 0
): GeneratedTag[] {
  const titleLow = title.toLowerCase();
  const mainKwLow = mainKeyword.toLowerCase();

  // Step 1: Extract core keywords
  const coreKws = extractCoreKeywords(title, mainKeyword);

  // Step 2+3: Prefix & suffix variations + long-tail
  const candidates = new Set<string>();

  // Add extra keywords directly
  extraKeywords.forEach(kw => {
    const clean = kw.trim().toLowerCase();
    if (clean) candidates.add(clean);
  });

  // Add main keyword combos
  candidates.add(mainKwLow);
  PREFIXES.forEach(p => candidates.add(`${p} ${mainKwLow}`));
  SUFFIXES.forEach(s => candidates.add(`${mainKwLow} ${s}`));

  // Add core keyword combos
  coreKws.slice(0, 12).forEach(kw => {
    candidates.add(kw);
    PREFIXES.slice(seed % PREFIXES.length, seed % PREFIXES.length + 4).forEach(p =>
      candidates.add(`${p} ${kw}`)
    );
    SUFFIXES.slice(seed % SUFFIXES.length, seed % SUFFIXES.length + 4).forEach(s =>
      candidates.add(`${kw} ${s}`)
    );
  });

  // Step 4: Intent simulation
  coreKws.slice(0, 6).forEach(kw => {
    INTENT_PATTERNS.forEach((fn, i) => {
      if ((i + seed) % 2 === 0 || kw.split(" ").length > 1) {
        candidates.add(fn(kw));
      }
    });
  });

  // Step 5: Trending modifiers
  coreKws.slice(0, 5).forEach(kw => {
    TRENDING_MODS.slice(seed % TRENDING_MODS.length, seed % TRENDING_MODS.length + 4).forEach(mod => {
      candidates.add(`${kw} ${mod}`);
      if (kw.split(" ").length > 1) candidates.add(`best ${kw} ${mod}`);
    });
  });

  // Extra combinations with extra keywords
  extraKeywords.forEach(ek => {
    const clean = ek.trim().toLowerCase();
    if (!clean) return;
    SUFFIXES.slice(0, 5).forEach(s => candidates.add(`${clean} ${s}`));
    INTENT_PATTERNS.slice(0, 4).forEach(fn => candidates.add(fn(clean)));
  });

  // Score, filter, deduplicate
  const seen = new Set<string>();
  const scored: GeneratedTag[] = [];

  for (const tag of candidates) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, " ");
    if (!isValidTag(clean)) continue;
    if (seen.has(clean)) continue;
    seen.add(clean);

    scored.push({
      text: clean,
      score: scoreTags(clean, titleLow, mainKwLow),
      difficulty: getDifficulty(clean, mainKwLow),
    });
  }

  // Sort by score descending, then slice to count
  scored.sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));

  return scored.slice(0, count);
}

// ─── UI Component ─────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  high: { label: "High Competition", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  medium: { label: "Medium Competition", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  low: { label: "Low Competition", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" },
};

const TAG_CHAR_LIMIT = 500;
const COUNT_OPTIONS = [10, 20, 30, 40, 50];

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

  const totalChars = tags.map(t => t.text).join(", ").length;

  const handleGenerate = useCallback((regenerate = false) => {
    if (!videoTitle.trim() || !mainKeyword.trim()) {
      toast({ title: "Missing fields", description: "Please fill in the Video Title and Main Keyword.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    const nextSeed = regenerate ? seed + 1 : 0;
    setSeed(nextSeed);

    // Simulate slight async feel (client-side is instant)
    setTimeout(() => {
      const extras = extraKeywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean);

      const result = generateTags(videoTitle, mainKeyword, extras, tagCount, nextSeed);
      setTags(result);
      setIsGenerating(false);
      setHasGenerated(true);

      if (!regenerate) {
        setTimeout(() => {
          document.getElementById("tag-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }, 400);
  }, [videoTitle, mainKeyword, extraKeywords, tagCount, seed, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(false);
  };

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
    <div className="space-y-8">
      {/* Input Card */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Video Title */}
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

            {/* Main Keyword */}
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

            {/* Optional Keywords */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Optional Keywords <span className="text-muted-foreground font-normal normal-case">(comma separated)</span>
              </label>
              <Input
                value={extraKeywords}
                onChange={e => setExtraKeywords(e.target.value)}
                placeholder="e.g. youtube algorithm, youtube seo, grow youtube channel"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>

            {/* Tag Count */}
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

            {/* Generate Button */}
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

      {/* Results */}
      {hasGenerated && tags.length > 0 && (
        <section id="tag-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500">
          <Card className="p-6 sm:p-8 rounded-3xl border-border">

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold font-display flex items-center gap-2">
                  <Sparkles className="text-primary w-5 h-5" /> Generated Tags
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Click any tag to copy it individually
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating}
                  className="rounded-xl gap-1.5 font-semibold"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={copyAll}
                  className="rounded-xl gap-1.5 font-semibold"
                >
                  {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedAll ? "Copied!" : "Copy All Tags"}
                </Button>
              </div>
            </div>

            {/* Tag Boxes Grid */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              {tags.map((tag, i) => {
                const diff = DIFFICULTY_CONFIG[tag.difficulty];
                const isCopied = copiedIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => copyTag(tag.text, i)}
                    title={`${diff.label} — click to copy`}
                    className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                      isCopied
                        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-700"
                        : "bg-muted/70 text-foreground border-border hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                    )}
                    {tag.text}
                    <span className={`ml-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      tag.difficulty === "high" ? "bg-red-500" :
                      tag.difficulty === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Legend + Character Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-border">
              {/* Difficulty Legend */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Competition:</span>
                {(["high", "medium", "low"] as const).map(d => (
                  <span key={d} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${DIFFICULTY_CONFIG[d].className}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      d === "high" ? "bg-red-500" : d === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                    {DIFFICULTY_CONFIG[d].label}
                  </span>
                ))}
              </div>

              {/* Character Counter */}
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
    </div>
  );
}
