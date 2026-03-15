import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Type, Copy, Check, RefreshCw, Sparkles, Loader2,
  ChevronDown, Search, Zap, BarChart2, ListChecks, Clock,
  TrendingUp, Shield, MousePointerClick,
} from "lucide-react";

// ─── Title Generation Engine ──────────────────────────────────────────────────

const POWER_WORDS = [
  "Ultimate", "Secret", "Proven", "Best", "Fast", "Easy", "Insane",
  "New", "Hidden", "Free", "Complete", "Shocking", "Honest", "Real",
];

const YEAR = new Date().getFullYear();

type Tone = "educational" | "entertaining" | "shocking" | "professional";
type VideoType = "tutorial" | "review" | "story" | "case-study" | "list" | "any";

interface TitleCandidate {
  text: string;
  framework: string;
  charCount: number;
  score: number;
  group: "seo" | "ctr";
}

// Seven proven frameworks
function buildFrameworkTitles(
  topic: string,
  audience: string,
  tone: Tone,
  videoType: VideoType,
  includeNumbers: boolean,
  includePowerWords: boolean,
): TitleCandidate[] {
  const t = topic.trim();
  const tCap = t.charAt(0).toUpperCase() + t.slice(1);
  const pw = includePowerWords ? pickPowerWord() : "";
  const audsuffix = audience ? ` for ${audience}` : "";
  const yr = YEAR;

  const candidates: Array<{ text: string; framework: string; group: "seo" | "ctr" }> = [];

  // 1. How-To framework
  candidates.push(
    { text: `How to ${tCap} (${yr} Step-by-Step Guide)`, framework: "How-To", group: "seo" },
    { text: `How to ${tCap}${audsuffix ? ` ${audsuffix}` : ""} (${pw || "Complete"} Guide)`, framework: "How-To", group: "seo" },
    { text: `How I ${tCap} — And You Can Too`, framework: "How-To", group: "ctr" },
  );

  // 2. Number / List framework
  if (includeNumbers) {
    candidates.push(
      { text: `7 Ways to ${tCap} That Actually Work`, framework: "Number/List", group: "ctr" },
      { text: `10 ${tCap} Tips You Need to Know in ${yr}`, framework: "Number/List", group: "seo" },
      { text: `5 ${tCap} Mistakes Beginners Make (Avoid These!)`, framework: "Number/List", group: "ctr" },
      { text: `3 ${tCap} Secrets That Changed Everything`, framework: "Number/List", group: "ctr" },
    );
  } else {
    candidates.push(
      { text: `${tCap} Tips That Actually Work`, framework: "Number/List", group: "ctr" },
      { text: `${tCap} Strategies You Need to Know in ${yr}`, framework: "Number/List", group: "seo" },
      { text: `${tCap} Mistakes Beginners Make (Avoid These)`, framework: "Number/List", group: "ctr" },
    );
  }

  // 3. Curiosity Gap
  candidates.push(
    { text: `The ${tCap} Nobody Tells You About`, framework: "Curiosity Gap", group: "ctr" },
    { text: `What I Wish I Knew Before Starting ${tCap}`, framework: "Curiosity Gap", group: "ctr" },
    { text: `This ${tCap} Secret Will Change How You Think`, framework: "Curiosity Gap", group: "ctr" },
    { text: `Nobody Talks About This ${tCap} Method`, framework: "Curiosity Gap", group: "ctr" },
  );

  // 4. Speed / Shortcut
  if (tone === "entertaining" || tone === "shocking") {
    candidates.push(
      { text: `I Tried ${tCap} for 30 Days — Here's What Happened`, framework: "Speed/Shortcut", group: "ctr" },
      { text: `How I Mastered ${tCap} in 7 Days (You Can Too)`, framework: "Speed/Shortcut", group: "ctr" },
    );
  } else {
    candidates.push(
      { text: `${tCap}: How to Get Results in Half the Time`, framework: "Speed/Shortcut", group: "seo" },
      { text: `The Fastest Way to ${tCap} — Proven Method`, framework: "Speed/Shortcut", group: "seo" },
    );
  }

  // 5. Beginner Friendly
  candidates.push(
    { text: `${tCap} for Beginners — Start Here`, framework: "Beginner Friendly", group: "seo" },
    { text: `${tCap}: The Beginner's Guide (${yr})`, framework: "Beginner Friendly", group: "seo" },
    { text: `Complete Beginner Guide to ${tCap}`, framework: "Beginner Friendly", group: "seo" },
  );

  // 6. Warning / Mistake Titles
  candidates.push(
    { text: `Stop Doing This When You ${tCap} (Big Mistake)`, framework: "Warning/Mistake", group: "ctr" },
    { text: `${tCap} Is Wrong — Here's the ${pw || "Right"} Way`, framework: "Warning/Mistake", group: "ctr" },
    { text: `Why Most People Fail at ${tCap} (And How to Fix It)`, framework: "Warning/Mistake", group: "ctr" },
  );

  // 7. Discovery / Trend
  candidates.push(
    { text: `${tCap}: The ${yr} Strategy That's Working Right Now`, framework: "Discovery/Trend", group: "seo" },
    { text: `New ${tCap} Method Everyone Is Talking About`, framework: "Discovery/Trend", group: "ctr" },
    { text: `This ${tCap} Trend Is Changing Everything in ${yr}`, framework: "Discovery/Trend", group: "ctr" },
    { text: `The Future of ${tCap} — What You Need to Know`, framework: "Discovery/Trend", group: "seo" },
  );

  // Video-type-specific extras
  if (videoType === "review") {
    candidates.push(
      { text: `${tCap} — Honest Review After Using It for Months`, framework: "Review", group: "ctr" },
      { text: `Is ${tCap} Worth It? (Brutally Honest Review)`, framework: "Review", group: "ctr" },
    );
  } else if (videoType === "case-study") {
    candidates.push(
      { text: `How We Used ${tCap} to Get Real Results (Case Study)`, framework: "Case Study", group: "seo" },
      { text: `Real Results: ${tCap} Case Study Breakdown`, framework: "Case Study", group: "seo" },
    );
  } else if (videoType === "story") {
    candidates.push(
      { text: `My ${tCap} Story — From Zero to Success`, framework: "Story", group: "ctr" },
      { text: `This Is What ${tCap} Actually Looks Like (My Story)`, framework: "Story", group: "ctr" },
    );
  }

  // Score every candidate
  const scored: TitleCandidate[] = candidates.map(c => ({
    ...c,
    charCount: c.text.length,
    score: scoreTitle(c.text, t),
  }));

  return scored.filter(c => c.score >= 70).sort((a, b) => b.score - a.score);
}

function pickPowerWord(): string {
  return POWER_WORDS[Math.floor(Math.random() * POWER_WORDS.length)];
}

function scoreTitle(title: string, keyword: string): number {
  let score = 0;
  const lower = title.toLowerCase();
  const kwLower = keyword.toLowerCase();

  // Keyword presence (25 pts) — reward early placement
  const kwIdx = lower.indexOf(kwLower);
  if (kwIdx === 0) score += 25;
  else if (kwIdx > 0 && kwIdx < 15) score += 22;
  else if (kwIdx >= 0) score += 18;
  else if (kwLower.split(" ").some(w => lower.includes(w))) score += 12;

  // CTR potential (25 pts)
  if (/\b(how to|how i|i tried|secret|nobody|stop|avoid|mistake|truth|honest|best|ultimate|proven)\b/.test(lower)) score += 25;
  else if (/\b(guide|tips|step|way|method|strategy)\b/.test(lower)) score += 15;

  // Clarity (20 pts)
  const words = title.split(" ").length;
  if (words >= 6 && words <= 12) score += 20;
  else if (words >= 4 && words <= 15) score += 12;
  else score += 5;

  // Curiosity (20 pts)
  if (/\b(nobody|secret|hidden|shocking|truth|changed|reveal|actually|real|honest)\b/.test(lower)) score += 20;
  else if (/\b(this|new|finally|you need|must|should|can)\b/.test(lower)) score += 10;

  // Length optimization (10 pts)
  const len = title.length;
  if (len >= 50 && len <= 65) score += 10;
  else if (len >= 40 && len <= 70) score += 7;
  else if (len < 40) score += 4;

  return Math.min(score, 100);
}

function getLengthLabel(len: number): { label: string; className: string } {
  if (len >= 50 && len <= 65) return { label: "Optimal", className: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800" };
  if (len > 65 && len <= 70) return { label: "Slightly Long", className: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800" };
  if (len > 70) return { label: "Too Long", className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800" };
  return { label: "Short", className: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube Title Generator?",
    a: "A YouTube Title Generator is a free tool that creates high-CTR, SEO-optimized titles for your YouTube videos based on your topic and keyword. It uses proven viral title frameworks — like How-To, Curiosity Gap, and Number titles — to help your videos rank in search and get more clicks.",
  },
  {
    q: "How do I write a good YouTube title?",
    a: "A great YouTube title places your main keyword early, stays between 50–65 characters, and uses one of the seven proven title frameworks: How-To, list/number, curiosity gap, speed/shortcut, beginner guide, warning/mistake, or discovery trend. Combine SEO optimization with a strong click trigger for the best results.",
  },
  {
    q: "How long should a YouTube title be?",
    a: "The optimal YouTube title length is 50–65 characters. This ensures the full title displays in YouTube search results without being cut off. Titles under 40 characters often lack keyword depth, while titles over 70 characters get truncated on most devices.",
  },
  {
    q: "What makes a YouTube title get more clicks?",
    a: "High-CTR YouTube titles use curiosity triggers (nobody tells you this, the secret to), concrete numbers (7 ways, 10 tips), power words (ultimate, proven, honest), and clearly communicate the video's value in the first few words. Our title generator scores each title for CTR potential before showing it to you.",
  },
  {
    q: "Should I include numbers in YouTube titles?",
    a: "Yes — numbers significantly improve click-through rates. Titles like '7 AI Tools That Make Money' or '5 YouTube SEO Mistakes' create a clear expectation of value and perform better in A/B tests. Our tool has a toggle to automatically add numbers to your generated titles.",
  },
  {
    q: "What are the best YouTube title formulas?",
    a: "The seven highest-performing YouTube title formulas are: (1) How to [Result], (2) X Ways/Tips, (3) Curiosity Gap (The Secret Nobody...), (4) Speed/Shortcut (I Did X in Y Days), (5) Beginner Guide, (6) Warning/Mistake (Stop Doing This), and (7) Discovery/Trend. This tool generates titles using all seven.",
  },
  {
    q: "Does this YouTube title generator use AI?",
    a: "Yes — our YouTube title generator uses intelligent scoring algorithms that analyze keyword placement, CTR signals, curiosity triggers, clarity, and character length for every title. All results are generated instantly in your browser with no data sent to external servers.",
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
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-500" : score >= 80 ? "bg-primary" : score >= 70 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${score >= 90 ? "text-green-600 dark:text-green-400" : score >= 80 ? "text-primary" : score >= 70 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500"}`}>
        {score}
      </span>
    </div>
  );
}

// ─── Title Card ───────────────────────────────────────────────────────────────

function TitleCard({ title, index, onCopy, copied }: { title: TitleCandidate; index: number; onCopy: (t: string, i: number) => void; copied: boolean }) {
  const len = getLengthLabel(title.charCount);
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group">
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground leading-snug mb-2">{title.text}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium border border-primary/20">
            {title.framework}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${len.className}`}>
            {title.charCount} chars · {len.label}
          </span>
          <ScoreBar score={title.score} />
        </div>
      </div>
      <button
        onClick={() => onCopy(title.text, index)}
        title="Copy title"
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
          copied
            ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
            : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TONES: { value: Tone; label: string }[] = [
  { value: "educational", label: "Educational" },
  { value: "entertaining", label: "Entertaining" },
  { value: "shocking", label: "Shocking" },
  { value: "professional", label: "Professional" },
];

const VIDEO_TYPES: { value: VideoType; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "tutorial", label: "Tutorial" },
  { value: "list", label: "List / Top X" },
  { value: "review", label: "Review" },
  { value: "story", label: "Story" },
  { value: "case-study", label: "Case Study" },
];

type OutputMode = "both" | "seo" | "ctr";

export function YouTubeTitleGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<Tone>("educational");
  const [videoType, setVideoType] = useState<VideoType>("any");
  const [titleCount, setTitleCount] = useState(10);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includePowerWords, setIncludePowerWords] = useState(true);
  const [outputMode, setOutputMode] = useState<OutputMode>("both");

  const [seoCandidates, setSeoCandidates] = useState<TitleCandidate[]>([]);
  const [ctrCandidates, setCtrCandidates] = useState<TitleCandidate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [copiedAllSeo, setCopiedAllSeo] = useState(false);
  const [copiedAllCtr, setCopiedAllCtr] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-yt-title-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = useCallback((regen = false) => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic or main keyword.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const all = buildFrameworkTitles(topic, audience, tone, videoType, includeNumbers, includePowerWords);
      const half = Math.ceil(titleCount / 2);
      const seo = all.filter(t => t.group === "seo").slice(0, half);
      const ctr = all.filter(t => t.group === "ctr").slice(0, titleCount - seo.length);
      setSeoCandidates(seo);
      setCtrCandidates(ctr);
      setIsGenerating(false);
      setHasGenerated(true);
      if (!regen) setTimeout(() => document.getElementById("title-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 420);
  }, [topic, audience, tone, videoType, titleCount, includeNumbers, includePowerWords, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyTitle = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const copyAll = (list: TitleCandidate[], setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(list.map(t => t.text).join("\n"));
    setFn(true);
    toast({ title: "Titles copied!", description: `${list.length} titles copied to clipboard.`, duration: 2000 });
    setTimeout(() => setFn(false), 2500);
  };

  const allVisible = outputMode === "both"
    ? [...seoCandidates, ...ctrCandidates]
    : outputMode === "seo" ? seoCandidates : ctrCandidates;

  return (
    <>
      {/* ── Input Card ──────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Video Topic / Main Keyword <span className="text-red-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. make money with AI, YouTube SEO tips, keto diet for beginners"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                required
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Target Audience <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <Input
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="e.g. beginners, entrepreneurs, college students"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>

            {/* Tone + Video Type row */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTone(value)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        tone === value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Video Type</label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setVideoType(value)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        videoType === value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Options row */}
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Number of Titles</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n} type="button" onClick={() => setTitleCount(n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        titleCount === n
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >{n}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Include Numbers?</label>
                <div className="flex gap-2">
                  {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(({ v, l }) => (
                    <button key={l} type="button" onClick={() => setIncludeNumbers(v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        includeNumbers === v
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Power Words?</label>
                <div className="flex gap-2">
                  {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(({ v, l }) => (
                    <button key={l} type="button" onClick={() => setIncludePowerWords(v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        includePowerWords === v
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isGenerating || !topic.trim()}
              className="w-full h-14 text-lg rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              {isGenerating
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Titles...</>
                : <><Type className="mr-2 h-5 w-5" /> Generate YouTube Titles</>
              }
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {hasGenerated && (seoCandidates.length > 0 || ctrCandidates.length > 0) && (
        <section id="title-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-6">

          {/* Output mode toggle + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Generated Titles
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Scored 70+ • Sorted by relevance</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* A/B Mode toggle */}
              {(["both", "seo", "ctr"] as OutputMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setOutputMode(m)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase tracking-wide ${
                    outputMode === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {m === "both" ? "All" : m === "seo" ? "🔍 SEO" : "⚡ CTR"}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold">
                <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>

          {/* SEO Titles Group */}
          {(outputMode === "both" || outputMode === "seo") && seoCandidates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-foreground">High SEO Titles</h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold border border-blue-200 dark:border-blue-800">{seoCandidates.length}</span>
                </div>
                <button
                  onClick={() => copyAll(seoCandidates, setCopiedAllSeo)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    copiedAllSeo
                      ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {copiedAllSeo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy All
                </button>
              </div>
              <div className="space-y-2">
                {seoCandidates.map((title, i) => (
                  <TitleCard
                    key={`seo-${i}`}
                    title={title}
                    index={i}
                    onCopy={(t, idx) => copyTitle(t, `seo-${idx}`)}
                    copied={copiedIndex === `seo-${i}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTR Titles Group */}
          {(outputMode === "both" || outputMode === "ctr") && ctrCandidates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <MousePointerClick className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-bold text-foreground">High CTR Titles</h3>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold border border-orange-200 dark:border-orange-800">{ctrCandidates.length}</span>
                </div>
                <button
                  onClick={() => copyAll(ctrCandidates, setCopiedAllCtr)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    copiedAllCtr
                      ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {copiedAllCtr ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy All
                </button>
              </div>
              <div className="space-y-2">
                {ctrCandidates.map((title, i) => (
                  <TitleCard
                    key={`ctr-${i}`}
                    title={title}
                    index={i}
                    onCopy={(t, idx) => copyTitle(t, `ctr-${idx}`)}
                    copied={copiedIndex === `ctr-${i}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Score legend */}
          <div className="flex items-center gap-4 flex-wrap px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide">Score:</span>
            {[{ range: "90–100", color: "bg-green-500", label: "Excellent" }, { range: "80–89", color: "bg-primary", label: "Great" }, { range: "70–79", color: "bg-yellow-500", label: "Good" }].map(s => (
              <span key={s.range} className="flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.range} {s.label}
              </span>
            ))}
            <span className="ml-auto">Optimal title length: 50–65 characters</span>
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Title Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Video Topic", desc: "Type your main topic or target keyword into the first field — for example, 'make money with AI' or 'YouTube SEO tips'. This is the foundation for all generated titles." },
            { step: 2, title: "Set Your Preferences", desc: "Choose your target audience, tone (educational, entertaining, professional, or shocking), and video type. These signals guide the title frameworks toward your specific content style." },
            { step: 3, title: "Click Generate YouTube Titles", desc: "Hit Generate and the tool instantly creates up to 20 SEO-optimized, high-CTR title variations scored 70 or above, sorted by relevance." },
            { step: 4, title: "Pick, Copy, and Upload", desc: "Browse the High SEO and High CTR groups, click any title to copy it, or use Copy All to grab the full set. Paste directly into YouTube Studio when publishing your video." },
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

      {/* ── About This Tool ──────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Title Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This YouTube Title Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free YouTube title generator analyzes your topic and applies seven proven viral title frameworks — How-To, Number/List, Curiosity Gap, Speed/Shortcut, Beginner Guide, Warning/Mistake, and Discovery/Trend — to create titles optimized for both YouTube search ranking and click-through rate. Every title is internally scored across five factors: keyword placement, CTR potential, clarity, curiosity triggers, and character length. Only titles scoring 70 or above are shown.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why YouTube Titles Matter for Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Your YouTube title is the single most important factor for both YouTube SEO and viewer click-through rate. A well-crafted title tells YouTube's algorithm what your video is about — improving search ranking and suggested video placement — while simultaneously convincing real viewers to click. Even a 1% improvement in CTR can double your video views over time. Our title generator is designed to maximize both simultaneously.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Tool
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Generates titles using 7 proven viral YouTube frameworks",
                "Scores every title for SEO strength and CTR potential",
                "Splits output into High SEO and High CTR groups for A/B testing",
                "Includes curiosity triggers, power words, and numbers automatically",
                "Shows character count and length quality for each title",
                "100% free — no account, no limits, instant results",
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

      {/* ── FAQ Accordion ────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => <AccordionItem key={i} question={item.q} answer={item.a} index={i} />)}
        </div>
      </section>
    </>
  );
}
