import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Copy, Check, ChevronDown, Zap, ListChecks,
  TrendingUp, Shield, AlertTriangle, Target, BarChart2,
  FileText, Tag, Image, MousePointerClick, Star, Info,
  ArrowRight, Sparkles, ArrowUpRight,
} from "lucide-react";

// ─── Scoring Engine ───────────────────────────────────────────────────────────

const POWER_WORDS = /\b(best|ultimate|how to|complete|proven|secret|top|free|easy|fast|step.by.step|beginner|guide|tips|tricks|tutorial|master|boost|grow|rank|viral|simple|quick)\b/i;
const CTA_PATTERNS = /subscribe|follow|link in bio|check out|click|comment|share|join|download|grab|get it|visit|watch|learn more/i;
const TIMESTAMP_PATTERNS = /\d+:\d+|timestamps|chapters/i;
const SPAM_PATTERNS = /(.)\1{4,}|(\b\w+\b)(\s+\1){3,}/i;
const EMOTIONAL_PATTERNS = /\b(you need|must.see|shocking|unbelievable|insane|mind.blowing|life.changing|game.changer|never|always|everyone|nobody|secret|truth|lie|exposed|revealed|warning|stop|avoid|mistake|fail|win|hack|cheat)\b/i;

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function normalise(s: string) { return s.toLowerCase().trim(); }

function keywordInText(keyword: string, text: string): boolean {
  return normalise(text).includes(normalise(keyword));
}

function keywordInFirst(keyword: string, text: string, charLimit: number): boolean {
  return normalise(text.slice(0, charLimit)).includes(normalise(keyword));
}

function hasDuplicateWords(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  const counts: Record<string, number> = {};
  for (const w of words) { counts[w] = (counts[w] || 0) + 1; if (counts[w] >= 5) return true; }
  return false;
}

interface CategoryScore {
  name: string;
  score: number;
  icon: React.ReactNode;
  color: string;
  issues: string[];
  wins: string[];
}

interface SeoResult {
  overall: number;
  categories: CategoryScore[];
  titleVariations: string[];
  optimizedDescription: string;
  suggestedTags: string[];
  keywordDensity: string;
  priorityFixes: string[];
  missingOpportunities: string[];
}

function runSeoAnalysis(
  title: string,
  description: string,
  tags: string,
  thumbnail: string,
  targetKeyword: string,
  secondaryKeywords: string,
): SeoResult {
  const kw = normalise(targetKeyword);
  const secKws = secondaryKeywords.split(",").map(s => s.trim()).filter(Boolean);
  const tagList = tags.split(",").map(s => s.trim()).filter(Boolean);
  const wordCount = countWords(description);
  const YEAR = new Date().getFullYear();

  // ── Title Score ──────────────────────────────────────────────────────────
  let titleScore = 0;
  const titleIssues: string[] = [];
  const titleWins: string[] = [];

  const titleHasExact = keywordInText(kw, title);
  if (titleHasExact) { titleScore += 30; titleWins.push("Target keyword present in title"); }
  else { titleIssues.push(`Target keyword "${targetKeyword}" is missing from your title`); }

  const kwInFirst60 = keywordInFirst(kw, title, 60);
  if (kwInFirst60) { titleScore += 20; titleWins.push("Keyword appears in first 60 characters"); }
  else if (titleHasExact) titleIssues.push("Move keyword to the first 60 characters for better SEO");

  const titleLen = title.length;
  if (titleLen >= 50 && titleLen <= 70) { titleScore += 15; titleWins.push("Title length is in the optimal 50–70 character range"); }
  else if (titleLen < 50) titleIssues.push(`Title is too short (${titleLen} chars) — aim for 50–70 characters`);
  else titleIssues.push(`Title is too long (${titleLen} chars) — trim to under 70 characters`);

  if (POWER_WORDS.test(title)) { titleScore += 10; titleWins.push("Uses power words that boost CTR"); }
  else titleIssues.push("Add a power word (Best, Ultimate, How to, Complete, Proven) to improve CTR");

  if (EMOTIONAL_PATTERNS.test(title)) { titleScore += 15; titleWins.push("Title uses emotional/curiosity triggers"); }
  else titleIssues.push("Add curiosity or emotional triggers to stop the scroll");

  if (!hasDuplicateWords(title)) { titleScore += 10; titleWins.push("No keyword stuffing detected"); }
  else titleIssues.push("Possible keyword stuffing — avoid repeating the same word multiple times");

  // ── Description Score ────────────────────────────────────────────────────
  let descScore = 0;
  const descIssues: string[] = [];
  const descWins: string[] = [];

  const kwInFirst100Desc = keywordInFirst(kw, description, 100);
  if (kwInFirst100Desc) { descScore += 25; descWins.push("Keyword appears in first 100 characters of description"); }
  else descIssues.push("Place your target keyword in the first 100 characters of your description");

  if (wordCount >= 200) { descScore += 15; descWins.push(`Description is ${wordCount} words — well above the 200-word minimum`); }
  else descIssues.push(`Description is only ${wordCount} words — expand to at least 200 words`);

  const secCount = secKws.filter(sk => keywordInText(sk, description)).length;
  if (secCount > 0) { descScore += 15; descWins.push(`${secCount} secondary keyword(s) found in description`); }
  else if (secKws.length > 0) descIssues.push("Add secondary keywords naturally throughout your description");

  if (TIMESTAMP_PATTERNS.test(description)) { descScore += 10; descWins.push("Includes timestamps or chapter structure"); }
  else descIssues.push("Add timestamps (e.g. 0:00 Intro, 1:30 Topic) to improve engagement");

  if (CTA_PATTERNS.test(description)) { descScore += 10; descWins.push("Includes a call-to-action"); }
  else descIssues.push("Add a CTA (subscribe, check the link, comment below) at the end of your description");

  if (!SPAM_PATTERNS.test(description)) { descScore += 10; descWins.push("No spammy keyword repetition detected"); }
  else descIssues.push("Your description has repeated phrases that look like keyword stuffing — clean it up");

  if (description.length > 0 && wordCount >= 50) { descScore += 15; descWins.push("Description is well-formatted and readable"); }
  else descIssues.push("Write a longer, well-formatted description to signal content depth to YouTube");

  // ── Tags Score ────────────────────────────────────────────────────────────
  let tagsScore = 0;
  const tagsIssues: string[] = [];
  const tagsWins: string[] = [];

  const exactTagMatch = tagList.some(t => normalise(t) === kw || normalise(t).includes(kw));
  if (exactTagMatch) { tagsScore += 25; tagsWins.push("Target keyword found in tags"); }
  else tagsIssues.push(`Add your exact target keyword "${targetKeyword}" as a tag`);

  const longTailTags = tagList.filter(t => t.split(" ").length >= 3);
  if (longTailTags.length >= 3) { tagsScore += 20; tagsWins.push(`${longTailTags.length} long-tail tag variations found`); }
  else tagsIssues.push("Add more long-tail tag variations (3+ word phrases) to reach niche audiences");

  if (tagList.length >= 10 && tagList.length <= 20) { tagsScore += 15; tagsWins.push(`Good number of tags: ${tagList.length} (optimal is 10–20)`); }
  else if (tagList.length < 10) tagsIssues.push(`Only ${tagList.length} tags — use 10–20 tags for best results`);
  else tagsIssues.push(`Too many tags (${tagList.length}) — stick to 10–20 highly relevant ones`);

  const relevantTags = tagList.filter(t => keywordInText(kw.split(" ")[0], t) || secKws.some(sk => keywordInText(sk, t)));
  const relevanceScore = tagList.length > 0 ? (relevantTags.length / tagList.length) * 20 : 0;
  tagsScore += Math.round(relevanceScore);
  if (relevanceScore >= 12) tagsWins.push("Tags are highly relevant to your topic");
  else tagsIssues.push("Some tags may not be relevant to your main topic");

  if (!tagList.some(t => SPAM_PATTERNS.test(t))) { tagsScore += 20; tagsWins.push("No spam or irrelevant tags detected"); }
  else tagsIssues.push("Remove generic or spammy tags that don't relate to your video");

  // ── Thumbnail Score ───────────────────────────────────────────────────────
  let thumbScore = 0;
  const thumbIssues: string[] = [];
  const thumbWins: string[] = [];
  const thumbLower = normalise(thumbnail);

  if (/face|person|people|close.?up|emotion|expression|reaction/.test(thumbLower)) { thumbScore += 20; thumbWins.push("Features human face/emotion — proven to boost CTR"); }
  else thumbIssues.push("Add a human face with a clear emotion — face thumbnails get 38% more clicks");

  if (/contrast|bright|bold|vivid|color|red|yellow|orange|blue/.test(thumbLower)) { thumbScore += 20; thumbWins.push("Uses high-contrast or bold colors"); }
  else thumbIssues.push("Use high-contrast colors (red, yellow, orange on dark backgrounds) to stand out");

  const thumbWords = thumbnail.split(/\s+/).length;
  if (thumbWords >= 2 && thumbWords <= 8) { thumbScore += 15; thumbWins.push("Minimal text overlay keeps it readable"); }
  else if (thumbWords > 8) thumbIssues.push("Too much text in thumbnail — keep it to 3–5 words maximum");
  else if (thumbnail.length > 0) thumbIssues.push("Add 3–5 bold words to your thumbnail to reinforce the title's promise");

  if (/shock|surprise|question|exclamation|amazing|wow|gasp|disbelief/.test(thumbLower)) { thumbScore += 20; thumbWins.push("Creates curiosity or emotional reaction"); }
  else thumbIssues.push("Add an element of surprise, curiosity, or strong emotion to your thumbnail");

  if (keywordInText(kw.split(" ")[0], thumbnail)) { thumbScore += 25; thumbWins.push("Thumbnail visually relates to your target keyword"); }
  else thumbIssues.push("Make sure the thumbnail visually represents your target keyword/topic");

  if (thumbnail.length === 0) {
    thumbScore = 50;
    thumbIssues.length = 0;
    thumbWins.length = 0;
    thumbWins.push("No thumbnail description provided — estimated neutral score (50)");
  }

  // ── Keyword Usage Score ───────────────────────────────────────────────────
  let kwScore = 0;
  const kwIssues: string[] = [];
  const kwWins: string[] = [];

  if (keywordInText(kw, title)) { kwScore += 25; kwWins.push("Keyword in title ✓"); }
  else kwIssues.push("Target keyword missing from title");

  if (keywordInText(kw, description)) { kwScore += 25; kwWins.push("Keyword in description ✓"); }
  else kwIssues.push("Target keyword missing from description");

  if (exactTagMatch) { kwScore += 25; kwWins.push("Keyword in tags ✓"); }
  else kwIssues.push("Target keyword missing from tags");

  if (!hasDuplicateWords(title + " " + description)) { kwScore += 25; kwWins.push("Keyword density looks natural — no stuffing"); }
  else kwIssues.push("Keyword appears too many times — reduce for natural readability");

  // ── CTR Potential Score ───────────────────────────────────────────────────
  let ctrScore = 0;
  const ctrIssues: string[] = [];
  const ctrWins: string[] = [];

  const hasCuriosityGap = /\b(nobody|secret|they don|what happens|you won|truth|hidden|revealed|exposed|surprising|you don|without|before|after)\b/i.test(title);
  if (hasCuriosityGap) { ctrScore += 25; ctrWins.push("Title creates a curiosity gap"); }
  else ctrIssues.push("Add a curiosity gap to your title (e.g. 'Nobody Tells You...', 'The Secret to...')");

  if (thumbnail.length > 0) { ctrScore += 25; ctrWins.push("Thumbnail description provided for alignment analysis"); }
  else ctrIssues.push("No thumbnail described — ensure your thumbnail complements the title promise");

  if (EMOTIONAL_PATTERNS.test(title)) { ctrScore += 20; ctrWins.push("Strong emotional triggers present in title"); }
  else ctrIssues.push("Strengthen emotional triggers in the title to improve viewer response");

  const hasValueProp = /\b(how|why|what|when|step|way|tip|trick|strategy|method|guide|result|earn|make|save|grow|rank)\b/i.test(title);
  if (hasValueProp) { ctrScore += 30; ctrWins.push("Clear value proposition communicated in title"); }
  else ctrIssues.push("Make the video's value clearer — viewers should instantly know what they'll gain");

  // ── Final Score ───────────────────────────────────────────────────────────
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const ts = clamp(titleScore);
  const ds = clamp(descScore);
  const tgs = clamp(tagsScore);
  const ths = clamp(thumbScore);
  const kws = clamp(kwScore);
  const ctrs = clamp(ctrScore);

  const overall = Math.round(ts * 0.2 + ds * 0.2 + tgs * 0.15 + ths * 0.15 + kws * 0.15 + ctrs * 0.15);

  // ── Keyword Density ───────────────────────────────────────────────────────
  const allText = `${title} ${description} ${tags}`;
  const totalWords = countWords(allText);
  const kwWords = kw.split(" ");
  let kwOccurrences = 0;
  const allTextLower = normalise(allText);
  let pos = allTextLower.indexOf(kw);
  while (pos !== -1) { kwOccurrences++; pos = allTextLower.indexOf(kw, pos + 1); }
  const density = totalWords > 0 ? ((kwWords.length * kwOccurrences) / totalWords * 100).toFixed(1) : "0.0";

  // ── Title Variations ──────────────────────────────────────────────────────
  const kwCap = targetKeyword.charAt(0).toUpperCase() + targetKeyword.slice(1);
  const titleVariations = [
    `How to ${kwCap} — The Complete ${YEAR} Guide`,
    `${kwCap}: ${YEAR} Strategy That Actually Works`,
    `The Ultimate ${kwCap} Guide for Beginners (${YEAR})`,
  ];

  // ── Optimised Description ─────────────────────────────────────────────────
  const optimizedDescription = `Want to master ${targetKeyword}? In this video, I'll show you exactly how ${targetKeyword} works and give you step-by-step strategies that get real results in ${YEAR}.

✅ What You'll Learn:
• The fundamentals of ${targetKeyword}
• Advanced ${targetKeyword} strategies top creators use
• Common ${targetKeyword} mistakes to avoid
• How to measure your ${targetKeyword} results

📌 Timestamps:
0:00 – Introduction
1:00 – What is ${targetKeyword}?
3:00 – Step-by-Step Strategy
8:00 – Advanced Tips
12:00 – Final Results

${secKws.length > 0 ? `Topics covered: ${secKws.join(", ")}\n\n` : ""}👇 Subscribe for more ${targetKeyword} tips and creator growth strategies every week!`;

  // ── Suggested Tags ────────────────────────────────────────────────────────
  const baseTags = [
    targetKeyword,
    `${targetKeyword} ${YEAR}`,
    `how to ${targetKeyword}`,
    `${targetKeyword} for beginners`,
    `${targetKeyword} tips`,
    `${targetKeyword} tutorial`,
    `best ${targetKeyword}`,
    `${targetKeyword} strategy`,
    `${targetKeyword} guide`,
    `${targetKeyword} mistakes`,
    `${targetKeyword} step by step`,
    `${targetKeyword} results`,
    `${targetKeyword} fast`,
    `${targetKeyword} tricks`,
    `learn ${targetKeyword}`,
  ];
  const suggestedTags = [...new Set([...baseTags, ...secKws])].slice(0, 20);

  // ── Missing Opportunities ─────────────────────────────────────────────────
  const missingOpportunities: string[] = [];
  if (!keywordInFirst(kw, title, 30)) missingOpportunities.push(`Move "${targetKeyword}" to the very start of your title for maximum SEO impact`);
  if (!TIMESTAMP_PATTERNS.test(description)) missingOpportunities.push("Add timestamps to your description — chapters improve watch time and SEO");
  if (tagList.length < 10) missingOpportunities.push("Add more tags — you're leaving discoverability on the table");
  if (secKws.length > 0 && secCount === 0) missingOpportunities.push("Use secondary keywords in your description to capture related search traffic");
  if (!CTA_PATTERNS.test(description)) missingOpportunities.push("A subscribe CTA in your description drives long-term channel growth");

  // ── Priority Fixes ────────────────────────────────────────────────────────
  const allIssues = [
    ...titleIssues.map(i => ({ text: i, impact: ts })),
    ...descIssues.map(i => ({ text: i, impact: ds })),
    ...tagsIssues.map(i => ({ text: i, impact: tgs })),
  ].sort((a, b) => a.impact - b.impact);
  const priorityFixes = allIssues.slice(0, 3).map(f => f.text);

  return {
    overall,
    categories: [
      { name: "Title Optimization", score: ts, icon: <Type />, color: "blue", issues: titleIssues, wins: titleWins },
      { name: "Description", score: ds, icon: <FileText />, color: "purple", issues: descIssues, wins: descWins },
      { name: "Tags", score: tgs, icon: <Tag />, color: "green", issues: tagsIssues, wins: tagsWins },
      { name: "Thumbnail", score: ths, icon: <Image />, color: "orange", issues: thumbIssues, wins: thumbWins },
      { name: "Keyword Usage", score: kws, icon: <Search />, color: "red", issues: kwIssues, wins: kwWins },
      { name: "CTR Potential", score: ctrs, icon: <MousePointerClick />, color: "pink", issues: ctrIssues, wins: ctrWins },
    ],
    titleVariations,
    optimizedDescription,
    suggestedTags,
    keywordDensity: density,
    priorityFixes,
    missingOpportunities,
  };
}

// Need to add a Type component since it's not in lucide-react with that name
function Type({ className }: { className?: string }) {
  return <span className={className} style={{ fontWeight: 900, fontFamily: "serif", fontSize: "1em" }}>T</span>;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube SEO Score Checker?",
    a: "A YouTube SEO Score Checker analyzes your video's title, description, tags, thumbnail, and keyword usage against YouTube's ranking factors and generates a score from 0 to 100. It identifies gaps in your optimization, shows what's working, and gives you specific fixes that will help your video rank higher in YouTube search results.",
  },
  {
    q: "How is the YouTube SEO score calculated?",
    a: "The score is calculated using six weighted categories: Title Optimization (20%), Description Quality (20%), Tags Optimization (15%), Thumbnail Effectiveness (15%), Keyword Usage (15%), and CTR Potential (15%). Each category is scored based on YouTube's known ranking factors — keyword placement, content depth, tag relevance, and viewer psychology signals.",
  },
  {
    q: "What is a good YouTube SEO score?",
    a: "A score of 80–100 is excellent and means your video is well-optimized for both search ranking and click-through rate. Scores of 60–79 are good but have specific areas to improve. Scores below 60 indicate significant SEO gaps that are likely suppressing your video's reach. Focus on the Priority Fixes section to make the highest-impact changes first.",
  },
  {
    q: "Why is my YouTube video not showing up in search?",
    a: "Low YouTube search visibility is usually caused by a combination of issues: your target keyword isn't in the title or first 100 characters of the description, your tags don't include keyword variations, your title doesn't trigger clicks so your CTR is low, or your description is too short for YouTube to understand the content. Use the SEO Score Checker to identify which of these is hurting you most.",
  },
  {
    q: "How important is the video description for YouTube SEO?",
    a: "Your YouTube description is the second most important ranking signal after the title. YouTube's algorithm reads your description to understand your video's topic and decides which searches to show it for. A strong description is at least 200 words, places the target keyword in the first 100 characters, includes secondary keywords naturally, has timestamps, and ends with a call-to-action.",
  },
  {
    q: "How many YouTube tags should I use?",
    a: "The optimal number of YouTube tags is between 10 and 20. Your first tag should be your exact target keyword. Follow it with 3–5 long-tail variations (3+ word phrases), then 5–10 related topic tags. Avoid using too many tags (over 30) or irrelevant tags — YouTube's algorithm understands relevance and penalizes tag spam by reducing the weight of all your tags.",
  },
  {
    q: "Does YouTube thumbnail affect SEO?",
    a: "Yes — your thumbnail directly affects your click-through rate (CTR), which is one of YouTube's strongest ranking signals. A high CTR tells YouTube that viewers want to see your video, which causes it to show your video to more people and rank it higher. The most effective thumbnails feature a close-up face with an emotion, bold 3–5 word text, and high-contrast colors on a clean background.",
  },
  {
    q: "What is keyword density and how much do I need?",
    a: "Keyword density is how often your target keyword appears relative to total word count across your title, description, and tags. For YouTube, a density of 1–3% is healthy. Below 1% may signal weak relevance; above 3% looks like keyword stuffing and can hurt rankings. Our tool calculates your density and shows whether you're in the optimal range.",
  },
  {
    q: "How do I improve my YouTube CTR?",
    a: "CTR (click-through rate) is improved by optimizing three things: your title, your thumbnail, and the alignment between them. Strong CTR titles use curiosity gaps ('Nobody Tells You This...'), clear value propositions ('How to Get X Result'), emotional triggers, and numbers. Pair that with a thumbnail featuring a face showing emotion and bold text, and you'll see significantly more clicks from the same impressions.",
  },
  {
    q: "Should I include the year in my YouTube title?",
    a: "Yes — including the current year (e.g. 'YouTube SEO Tips 2026') significantly boosts CTR and search relevance. Viewers trust current content, so the year signals freshness. Titles with a year also tend to rank for year-specific searches, which have lower competition. Our SEO checker rewards year inclusion as part of the click-worthiness scoring.",
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

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 54; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Work" : "Poor";
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/50" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs font-semibold text-muted-foreground">/100</span>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function ScoreRingWrapper({ score }: { score: number }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <ScoreRing score={score} />
    </div>
  );
}

// ─── Category Bar ─────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500", purple: "bg-purple-500", green: "bg-green-500",
  orange: "bg-orange-500", red: "bg-red-500", pink: "bg-pink-500",
};
const TEXT_COLOR_MAP: Record<string, string> = {
  blue: "text-blue-600 dark:text-blue-400", purple: "text-purple-600 dark:text-purple-400",
  green: "text-green-600 dark:text-green-400", orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400", pink: "text-pink-600 dark:text-pink-400",
};

function CategoryBar({ cat }: { cat: CategoryScore }) {
  const bar = COLOR_MAP[cat.color] ?? "bg-primary";
  const text = TEXT_COLOR_MAP[cat.color] ?? "text-primary";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{cat.name}</span>
        <span className={`font-bold tabular-nums ${text}`}>{cat.score}/100</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${cat.score}%` }} />
      </div>
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
        copied
          ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
          : "bg-muted text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
      }`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouTubeSeoScoreCheckerTool() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [result, setResult] = useState<SeoResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "optimized">("analysis");
  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-yt-seo-checker";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetKeyword.trim()) {
      toast({ title: "Required fields missing", description: "Enter your video title and target keyword to run the analysis.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = runSeoAnalysis(title, description, tags, thumbnail, targetKeyword, secondaryKeywords);
      setResult(res);
      setIsAnalyzing(false);
      setTimeout(() => document.getElementById("seo-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 600);
  };

  return (
    <>
      {/* ── Input Card ──────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleAnalyze} className="space-y-5">

            {/* Row 1: Title + Target Keyword */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. How to Grow on YouTube Fast in 2026" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" required />
                <p className="text-xs text-muted-foreground">{title.length} characters {title.length >= 50 && title.length <= 70 ? "✅ optimal" : title.length > 70 ? "⚠️ too long" : title.length > 0 ? "⚠️ too short" : ""}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                  Target Keyword <span className="text-red-500">*</span>
                </label>
                <Input value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)} placeholder="e.g. YouTube SEO tips" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" required />
                <p className="text-xs text-muted-foreground">The main keyword you're trying to rank for</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Video Description <span className="text-muted-foreground font-normal normal-case">(optional but recommended)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Paste your full video description here..."
                rows={5}
                className="w-full rounded-xl border border-muted-foreground/20 bg-muted/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 resize-none leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">{countWords(description)} words {countWords(description) >= 200 ? "✅" : countWords(description) > 0 ? `— aim for 200+` : ""}</p>
            </div>

            {/* Tags + Secondary Keywords */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Tags <span className="text-muted-foreground font-normal normal-case">(comma-separated)</span>
                </label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="youtube seo, grow on youtube, youtube tips 2026" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                <p className="text-xs text-muted-foreground">{tags ? tags.split(",").filter(t => t.trim()).length : 0} tags (optimal: 10–20)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Secondary Keywords <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input value={secondaryKeywords} onChange={e => setSecondaryKeywords(e.target.value)} placeholder="youtube growth, video SEO, channel growth" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Thumbnail Description <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <Input value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="e.g. Close-up face with shocked expression, bold red text '10X GROWTH', dark blue background" className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
            </div>

            <Button type="submit" disabled={isAnalyzing} size="lg" className="w-full h-14 text-base font-bold rounded-2xl gap-2 shadow-lg shadow-primary/20">
              {isAnalyzing ? (
                <><span className="animate-spin text-lg">⚙</span> Analyzing Your Video SEO...</>
              ) : (
                <><BarChart2 className="w-5 h-5" /> Check SEO Score</>
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {result && (
        <section id="seo-results" className="space-y-6 mt-2">

          {/* Overall Score Banner */}
          <Card className="p-6 sm:p-8 rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 to-muted/30">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreRingWrapper score={result.overall} />
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h2 className="text-2xl font-black text-foreground">Your YouTube SEO Score</h2>
                  <p className="text-muted-foreground mt-1">Based on title, description, tags, thumbnail, keyword usage, and CTR potential</p>
                </div>
                {result.priorityFixes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Top Priority Fixes</p>
                    {result.priorityFixes.map((fix, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                        <span>{fix}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Tab switcher */}
          <div className="flex gap-2 p-1 bg-muted rounded-2xl">
            {(["analysis", "optimized"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab === "analysis" ? "📊 Analysis & Recommendations" : "✨ Optimized Output"}
              </button>
            ))}
          </div>

          {activeTab === "analysis" && (
            <div className="space-y-6">
              {/* Category Scores */}
              <Card className="p-6 rounded-3xl border-border">
                <h3 className="font-bold text-lg text-foreground mb-5 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary" /> Category Scores</h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  {result.categories.map(cat => <CategoryBar key={cat.name} cat={cat} />)}
                </div>
              </Card>

              {/* Per-category breakdown */}
              <div className="grid sm:grid-cols-2 gap-4">
                {result.categories.map(cat => (
                  <Card key={cat.name} className="p-5 rounded-2xl border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-foreground">{cat.name}</h4>
                      <span className={`text-lg font-black ${cat.score >= 80 ? "text-green-600" : cat.score >= 60 ? "text-amber-500" : "text-red-500"}`}>{cat.score}</span>
                    </div>
                    {cat.wins.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {cat.wins.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-green-700 dark:text-green-400">
                            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {cat.issues.length > 0 && (
                      <div className="space-y-1.5">
                        {cat.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Keyword Insights */}
              <Card className="p-6 rounded-3xl border-border">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Keyword Insights</h3>
                <div className="grid sm:grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Keyword Density", value: `${result.keywordDensity}%`, note: "Optimal: 1–3%", ok: parseFloat(result.keywordDensity) >= 1 && parseFloat(result.keywordDensity) <= 3 },
                    { label: "In Title", value: result.categories[0].score >= 30 ? "✅ Yes" : "❌ No", note: "Critical ranking factor", ok: result.categories[0].score >= 30 },
                    { label: "In Description (first 100 chars)", value: result.categories[1].score >= 25 ? "✅ Yes" : "❌ No", note: "Important for relevance", ok: result.categories[1].score >= 25 },
                  ].map(item => (
                    <div key={item.label} className={`rounded-2xl p-4 border ${item.ok ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20" : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"}`}>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{item.label}</p>
                      <p className="text-xl font-black text-foreground mt-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                    </div>
                  ))}
                </div>
                {result.missingOpportunities.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5"><Info className="w-4 h-4 text-blue-500" /> Missing Keyword Opportunities</p>
                    <div className="space-y-2">
                      {result.missingOpportunities.map((opp, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/40 rounded-xl px-4 py-2.5">
                          <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" /> <span>{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === "optimized" && (
            <div className="space-y-5">
              {/* Title Variations */}
              <Card className="p-6 rounded-3xl border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> 3 SEO-Optimized Title Variations</h3>
                </div>
                <div className="space-y-3">
                  {result.titleVariations.map((tv, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors group">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="flex-1 text-sm font-medium text-foreground leading-relaxed">{tv}</p>
                      <CopyButton text={tv} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Optimized Description */}
              <Card className="p-6 rounded-3xl border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> SEO-Optimized Description</h3>
                  <CopyButton text={result.optimizedDescription} label="Copy Description" />
                </div>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans bg-muted/40 rounded-2xl p-4 border border-border">
                  {result.optimizedDescription}
                </pre>
              </Card>

              {/* Suggested Tags */}
              <Card className="p-6 rounded-3xl border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><Tag className="w-5 h-5 text-primary" /> Suggested Tags ({result.suggestedTags.length})</h3>
                  <CopyButton text={result.suggestedTags.join(", ")} label="Copy All Tags" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedTags.map((tag, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-medium">{tag}</span>
                  ))}
                </div>
              </Card>

              {/* Score Legend */}
              <div className="flex items-center gap-4 flex-wrap px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wide">Score:</span>
                {[{ range: "80–100", color: "bg-green-500", label: "Excellent" }, { range: "60–79", color: "bg-amber-500", label: "Good" }, { range: "0–59", color: "bg-red-500", label: "Needs Work" }].map(s => (
                  <span key={s.range} className="flex items-center gap-1.5 font-medium">
                    <span className={`w-2 h-2 rounded-full ${s.color}`} /> {s.range} {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube SEO Score Checker</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Video Details", desc: "Paste your video title, description, and tags into the tool. Add your target keyword — the main search term you want your video to rank for. Secondary keywords and a thumbnail description are optional but improve accuracy." },
            { step: 2, title: "Click Check SEO Score", desc: "The tool instantly analyzes your video against six key YouTube ranking factors — title optimization, description quality, tag relevance, thumbnail effectiveness, keyword usage, and CTR potential — using YouTube's actual scoring criteria." },
            { step: 3, title: "Review Your Score & Analysis", desc: "See your overall SEO score out of 100, individual category scores with specific wins and issues, keyword placement analysis, and your top 3 priority fixes sorted by impact." },
            { step: 4, title: "Copy the Optimized Output", desc: "Switch to the Optimized Output tab to get three rewritten title variations, a fully structured description template with your keyword, suggested tags, and actionable improvements you can apply immediately." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube SEO Score Checker</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How the YouTube SEO Score Is Calculated
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free YouTube SEO Score Checker evaluates your video's optimization across six weighted categories that mirror YouTube's actual ranking algorithm. <strong className="text-foreground">Title Optimization (20%)</strong> checks for target keyword presence, keyword placement in the first 60 characters, title length between 50–70 characters, power word usage, and click-worthiness signals. <strong className="text-foreground">Description Quality (20%)</strong> analyzes keyword placement in the first 100 characters, word count (minimum 200), secondary keyword integration, timestamp structure, call-to-action presence, and overall readability. <strong className="text-foreground">Tags Optimization (15%)</strong> rewards exact keyword match, long-tail variations, the ideal 10–20 tag count, and relevance to your main topic. <strong className="text-foreground">Thumbnail Effectiveness (15%)</strong> evaluates your thumbnail description for human faces, high-contrast colors, minimal text, and emotional triggers. <strong className="text-foreground">Keyword Usage (15%)</strong> verifies that your target keyword appears naturally across all three key locations — title, description, and tags — without stuffing. <strong className="text-foreground">CTR Potential (15%)</strong> scores your title for curiosity gaps, emotional triggers, clear value proposition, and thumbnail-title alignment. The final score is a weighted average: (Title × 0.20) + (Description × 0.20) + (Tags × 0.15) + (Thumbnail × 0.15) + (Keyword × 0.15) + (CTR × 0.15).
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why YouTube SEO Matters More Than Ever in 2026
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              YouTube processes over 3 billion searches every month, making it the second largest search engine in the world after Google. Unlike social platforms that primarily distribute content through a feed, YouTube is a search-driven discovery platform — which means your video's metadata is the primary signal YouTube uses to decide when and to whom to show your content. A well-optimized video with a score of 80+ can rank for competitive keywords, appear in Google search results (which now show YouTube videos prominently), and continue generating views and revenue for years after publication. A poorly optimized video with the same quality content may get almost no organic reach. The difference isn't talent or production value — it's SEO. Our YouTube SEO Score Checker ensures you don't leave organic visibility on the table. The tool checks every optimization layer that YouTube's algorithm weighs, from keyword density and placement to psychological CTR triggers, and generates an optimized version of your title, description, and tags that you can apply immediately.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Checking Your YouTube SEO Before Publishing
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Scores your video using the exact same criteria YouTube uses for ranking decisions",
                "Identifies the highest-impact SEO issues first so you fix what matters most",
                "Generates 3 rewritten title variations optimized for both search and clicks",
                "Provides an SEO-structured description template with your keyword pre-inserted",
                "Suggests 15–20 targeted tags including long-tail and trending variations",
                "Calculates keyword density across title, description, and tags simultaneously",
                "Analyzes your thumbnail description for CTR-boosting visual elements",
                "Shows keyword placement analysis with exact character position data",
                "100% free — no account required, unlimited analyses, instant results",
                "Works for any video topic, niche, language, or channel size",
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
            { name: "YouTube Title Analyzer", path: "/tools/youtube-title-analyzer", desc: "Dive deeper into your title's CTR power, emotional score, and viral probability." },
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized tags that match the keywords in your scored title and description." },
            { name: "YouTube Keyword Generator", path: "/tools/youtube-keyword-generator", desc: "Find the high-opportunity keywords your title and description should be targeting." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write a keyword-rich description that passes the SEO checker with a top score." },
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
          {FAQ_ITEMS.map((item, i) => <AccordionItem key={i} question={item.q} answer={item.a} index={i} />)}
        </div>
      </section>

      {/* Internal link to related tool */}
      <div className="mt-4 p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-4">
        <Star className="w-8 h-8 text-primary shrink-0" />
        <div>
          <p className="font-bold text-foreground text-sm">Want to also optimize your title?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Use our <a href="/tools/youtube-title-analyzer" className="text-primary font-semibold hover:underline">YouTube Title Analyzer</a> to score and improve your title before running it through the SEO checker, or generate brand-new titles with the <a href="/tools/youtube-title-generator" className="text-primary font-semibold hover:underline">YouTube Title Generator</a>.</p>
        </div>
      </div>
    </>
  );
}
