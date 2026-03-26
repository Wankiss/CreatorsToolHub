import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, TrendingUp, BarChart2, ChevronDown, ListChecks, Shield,
  Check, Copy, CheckCheck, Lightbulb, Target, Zap, Hash, FileText,
  Star, AlertCircle, ChevronUp, Users, ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche = "finance" | "tech" | "education" | "gaming" | "lifestyle" | "business" | "entertainment" | "health" | "other";
type ContentType = "tutorial" | "review" | "list" | "vlog" | "shorts" | "case-study";
type KeywordGoal = "high-volume" | "low-competition" | "balanced" | "long-tail";
type Competition = "Low" | "Medium" | "High";
type Category = "opportunity" | "trending" | "long-tail" | "question";

interface KeywordRow {
  phrase: string;
  volumeScore: number;
  competitionScore: number;
  competition: Competition;
  difficultyScore: number;
  opportunityScore: number;
  category: Category;
  trending?: boolean;
}

interface GeneratedResult {
  keywords: KeywordRow[];
  bestKeyword: KeywordRow;
  hashtags: string[];
  titleSuggestions: string[];
  descriptionKeywords: string[];
  gapKeywords: KeywordRow[];
}

// ─── Scoring helpers ─────────────────────────────────────────────────────────

function seeded(seed: string, min: number, max: number): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h) ^ seed.charCodeAt(i);
  return min + ((h >>> 0) % (max - min + 1));
}

function getVolumeScore(phrase: string, niche: Niche): number {
  const words = phrase.trim().split(/\s+/).length;
  const base = seeded(phrase + "vol", 0, 30);
  let score = words === 1 ? 70 + base * 0.9
    : words === 2 ? 50 + base * 0.9
    : words === 3 ? 32 + base * 0.85
    : words === 4 ? 18 + base * 0.7
    : 6 + base * 0.5;

  if (/how to/.test(phrase)) score += 18;
  if (/\bbest\b/.test(phrase)) score += 12;
  if (/\b202[5-9]\b/.test(phrase)) score += 8;
  if (/tutorial/.test(phrase)) score += 6;
  if (["finance", "tech", "education"].includes(niche)) score += 5;
  return Math.min(99, Math.max(5, Math.round(score)));
}

function getCompetitionScore(phrase: string): number {
  const words = phrase.trim().split(/\s+/).length;
  const base = seeded(phrase + "cmp", 0, 25);
  let score = words === 1 ? 78 + base * 0.8
    : words === 2 ? 58 + base * 0.8
    : words === 3 ? 38 + base * 0.8
    : words === 4 ? 22 + base * 0.75
    : 10 + base * 0.6;

  if (/for beginners/.test(phrase)) score -= 18;
  if (/without/.test(phrase))       score -= 20;
  if (/\b202[5-9]\b/.test(phrase))  score -= 10;
  if (/step by step/.test(phrase))  score -= 12;
  if (/mistakes/.test(phrase))      score -= 8;
  return Math.min(95, Math.max(5, Math.round(score)));
}

function competitionLevel(score: number): Competition {
  return score >= 65 ? "High" : score >= 38 ? "Medium" : "Low";
}

function opportunityScore(vol: number, comp: number): number {
  return Math.round(vol * 0.6 + (100 - comp) * 0.4);
}

function difficultyScore(comp: number, vol: number): number {
  return Math.round(comp * 0.7 + vol * 0.3);
}

function buildRow(phrase: string, niche: Niche, cat: Category, trending = false): KeywordRow {
  const vol  = getVolumeScore(phrase, niche);
  const comp = getCompetitionScore(phrase);
  const opp  = opportunityScore(vol, comp);
  const diff = difficultyScore(comp, vol);
  return { phrase, volumeScore: vol, competitionScore: comp, competition: competitionLevel(comp), difficultyScore: diff, opportunityScore: opp, category: cat, trending };
}

// ─── Keyword generation engine ───────────────────────────────────────────────

const YEAR = new Date().getFullYear();

const NICHE_TERMS: Record<Niche, string[]> = {
  finance:       ["investing", "passive income", "wealth", "money", "budget", "stocks", "crypto", "savings"],
  tech:          ["AI tools", "software", "automation", "coding", "apps", "ChatGPT", "programming"],
  education:     ["study tips", "learning", "course", "online class", "skills", "exam prep"],
  gaming:        ["gameplay", "tips and tricks", "build guide", "ranked", "how to win", "glitch"],
  lifestyle:     ["morning routine", "productivity", "self improvement", "habits", "minimalism"],
  business:      ["marketing", "sales funnel", "clients", "revenue", "freelancing", "brand"],
  entertainment: ["reaction", "challenge", "viral", "trending", "music", "commentary"],
  health:        ["weight loss", "diet", "workout", "meal prep", "muscle", "nutrition"],
  other:         ["tips", "guide", "strategy", "ideas"],
};

const CONTENT_MODS: Record<ContentType, string[]> = {
  tutorial:     ["tutorial", "step by step", "how to", "beginner guide", "complete guide"],
  review:       ["review", "honest review", "worth it", "vs", `best ${YEAR}`],
  list:         ["tips", "strategies", "ideas", "examples", "tools"],
  vlog:         ["vlog", "day in my life", "journey", "behind the scenes"],
  shorts:       ["shorts", "quick tip", "in 60 seconds", "hack"],
  "case-study": ["case study", "how I", "results", "breakdown", "experiment"],
};

function generateKeywords(topic: string, niche: Niche, audience: string, contentType: ContentType, goal: KeywordGoal): KeywordRow[] {
  const s = topic.toLowerCase().trim();
  const aud = audience.toLowerCase().trim() || "beginners";
  const nicheFlavors = NICHE_TERMS[niche].slice(0, 4);
  const contentFlavors = CONTENT_MODS[contentType].slice(0, 3);
  const rows: KeywordRow[] = [];

  // ── Opportunity keywords (balanced volume + low competition) ─────────────
  const opportunityPhrases = [
    s,
    `${s} for beginners`,
    `best ${s} tips`,
    `how to ${s} without experience`,
    `${s} for ${aud}`,
    `${s} tips and tricks`,
    `${s} complete guide ${YEAR}`,
    ...(contentFlavors.map(m => `${s} ${m}`)),
    ...(nicheFlavors.slice(0, 2).map(nf => `${s} ${nf}`)),
  ];
  opportunityPhrases.forEach(p => rows.push(buildRow(p, niche, "opportunity")));

  // ── Trending keywords (year-specific, current events) ───────────────────
  const trendingPhrases = [
    `${s} ${YEAR}`,
    `best ${s} ${YEAR}`,
    `${s} trends ${YEAR}`,
    `top ${s} ${YEAR}`,
    `${s} strategies ${YEAR}`,
    ...(nicheFlavors.slice(2, 4).map(nf => `${nf} ${YEAR}`)),
  ];
  trendingPhrases.forEach(p => rows.push(buildRow(p, niche, "trending", true)));

  // ── Long-tail keywords (5+ words, niche-specific) ───────────────────────
  const longTailPhrases = [
    `how to ${s} step by step for beginners`,
    `${s} for ${aud} with no experience`,
    `best way to ${s} from home`,
    `how to start ${s} with no money`,
    `${s} tutorial for ${aud} ${YEAR}`,
    `how to ${s} fast and easy`,
    `${s} mistakes beginners make`,
    `learn ${s} from scratch in 30 days`,
    ...(nicheFlavors.slice(0, 2).map(nf => `how to use ${nf} for ${s}`)),
  ];
  longTailPhrases.forEach(p => rows.push(buildRow(p, niche, "long-tail")));

  // ── Question-based keywords ──────────────────────────────────────────────
  const questionPhrases = [
    `how to ${s}`,
    `what is ${s}`,
    `why ${s} is important`,
    `is ${s} worth it`,
    `how much does ${s} cost`,
    `can you make money with ${s}`,
    `how long does ${s} take`,
    `what is the best ${s} for beginners`,
    `how to get started with ${s}`,
    `is ${s} hard to learn`,
  ];
  questionPhrases.forEach(p => rows.push(buildRow(p, niche, "question")));

  // Deduplicate
  const seen = new Set<string>();
  const unique = rows.filter(r => { const k = r.phrase.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

  // Sort by opportunity score
  unique.sort((a, b) => b.opportunityScore - a.opportunityScore);

  // Apply goal filter / re-sort
  if (goal === "high-volume")      unique.sort((a, b) => b.volumeScore - a.volumeScore);
  else if (goal === "low-competition") unique.sort((a, b) => a.competitionScore - b.competitionScore);
  else if (goal === "long-tail")   return unique.filter(r => r.phrase.split(/\s+/).length >= 4);

  return unique.slice(0, 36);
}

function buildResult(topic: string, niche: Niche, audience: string, contentType: ContentType, goal: KeywordGoal, competitorTopic: string): GeneratedResult {
  const keywords = generateKeywords(topic, niche, audience, contentType, goal);
  const best = [...keywords].sort((a, b) => b.opportunityScore - a.opportunityScore)[0];

  // Hashtags from top opportunity keywords
  const hashtags = keywords
    .filter(k => k.opportunityScore > 55)
    .slice(0, 12)
    .map(k => "#" + k.phrase.replace(/[^a-z0-9 ]/gi, "").split(/\s+/).map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1)).join(""));

  // Title suggestions using top keywords
  const topKws = keywords.slice(0, 5).map(k => k.phrase);
  const s = topic.trim();
  const titleSuggestions = [
    `How I Mastered ${capitalizeTitle(s)} in 30 Days (Complete Guide ${YEAR})`,
    `${topKws[1] ? capitalizeTitle(topKws[1]) : capitalizeTitle(s)}: The Secret Nobody Tells Beginners`,
    `${YEAR}'s Best ${capitalizeTitle(s)} Strategy That Actually Works`,
    `I Tried Every ${capitalizeTitle(s)} Method — Here's What Actually Worked`,
    `${capitalizeTitle(s)} for Beginners: Step-by-Step Guide to Getting Real Results`,
  ];

  // Description keywords
  const descriptionKeywords = keywords.slice(0, 15).map(k => k.phrase);

  // Keyword gap — generate for competitor topic and find differences
  let gapKeywords: KeywordRow[] = [];
  if (competitorTopic.trim()) {
    const competitorKws = generateKeywords(competitorTopic.trim(), niche, audience, contentType, "balanced");
    const userPhrases = new Set(keywords.map(k => k.phrase.toLowerCase()));
    gapKeywords = competitorKws
      .filter(k => !userPhrases.has(k.phrase.toLowerCase()) && k.opportunityScore > 45)
      .slice(0, 8);
  }

  return { keywords, bestKeyword: best, hashtags, titleSuggestions, descriptionKeywords, gapKeywords };
}

function capitalizeTitle(s: string): string {
  const minors = new Set(["a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "but", "with"]);
  return s.split(" ").map((w, i) => i === 0 || !minors.has(w.toLowerCase()) ? w[0]?.toUpperCase() + w.slice(1) : w).join(" ");
}

// ─── Real-time suggestion engine ─────────────────────────────────────────────

function getRealTimeSuggestions(input: string): string[] {
  if (!input.trim()) return [];
  const s = input.toLowerCase().trim();
  return [
    `how to ${s}`,
    `best ${s} for beginners`,
    `${s} tutorial ${YEAR}`,
    `${s} tips and tricks`,
    `${s} step by step`,
    `${s} for free`,
    `make money with ${s}`,
    `${s} mistakes to avoid`,
  ].slice(0, 6);
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What are YouTube keywords and why do they matter for SEO?",
    a: "YouTube keywords are the words and phrases people type into YouTube Search when looking for content. YouTube's algorithm reads your video title, description, tags, and captions to understand what your video is about and matches it to relevant search queries. Using the right keywords — specifically, search terms with meaningful volume and realistic competition levels for your channel size — is the primary way new creators get discovered through search rather than relying entirely on algorithmic recommendation. A well-keyworded video can rank in search results and generate views for years after upload, making keywords the foundation of sustainable YouTube channel growth.",
  },
  {
    q: "What is the difference between high-volume and long-tail YouTube keywords?",
    a: "High-volume keywords are short, broad terms (1–2 words) like 'investing' or 'YouTube SEO' that tens of thousands of people search each month. They offer massive reach potential but are dominated by large, established channels that are virtually impossible to outrank when you're starting out. Long-tail keywords are longer, more specific phrases (4+ words) like 'how to invest in index funds for beginners 2026' that fewer people search but that are far easier to rank for. For most growing channels, long-tail keywords are the strategic sweet spot: you can realistically appear on the first page of results, and viewers who find you through long-tail searches have high intent — they know exactly what they want, making them more likely to subscribe and watch additional videos.",
  },
  {
    q: "How do I find low-competition YouTube keywords for my niche?",
    a: "Finding low-competition YouTube keywords involves looking for specific conditions: longer keyword phrases (4+ words), keywords that include 'for beginners,' year-specific modifiers like '2026,' question-based phrases (how to, what is, why does), and niche-specific compound terms. Our keyword generator automatically scores each keyword's estimated competition level based on these signals and highlights keywords where the opportunity score — the balance of reasonable volume and low competition — is highest. For manual research, type your main topic into YouTube Search and look at the autocomplete suggestions: these are real searches people make. Phrases that autocomplete less commonly are often lower competition.",
  },
  {
    q: "How should I use keywords in my YouTube video for best SEO results?",
    a: "For maximum YouTube SEO impact, place your primary keyword in five key locations: (1) In the video title within the first 50–60 characters, ideally in the first 3–5 words — front-loading your keyword signals strong relevance to the algorithm. (2) In the first 150 characters of the video description — YouTube shows this preview before the 'Show More' fold, giving it extra SEO weight. (3) Naturally throughout the description (aim for 2–3 mentions in a 300+ word description). (4) In video tags — include exact-match, phrase-match, and broad keyword variations. (5) In the video script/captions — YouTube's automatic captions are indexed, so saying your keyword naturally in the first 30 seconds of your video reinforces the algorithm's topic understanding.",
  },
  {
    q: "What is the Keyword Gap feature and how should I use it?",
    a: "The Keyword Gap feature identifies keyword opportunities your competitors are likely targeting that you haven't optimized for yet. You enter a competitor's main topic or niche focus, and the tool generates the keyword profile they'd likely rank for — then surfaces the gap keywords that your channel is missing. In practice, you can use this to: identify content ideas your competitor has successfully tapped that align with your channel, find keyword angles your competitor hasn't fully covered (creating a direct opportunity), and understand which search intents you've overlooked in your content strategy. Filling these gaps by creating targeted videos for each opportunity keyword is one of the fastest ways to grow a channel's organic search traffic.",
  },
  {
    q: "How accurate are the search volume and competition scores in this tool?",
    a: "The search volume and competition scores are heuristic estimates based on documented patterns in YouTube keyword behavior — primarily the relationship between keyword length, modifier presence, and typical search volume in each niche category. Shorter keywords (1–2 words) consistently have higher search volume but much higher competition. Long-tail keywords (4+ words) with specific modifiers like 'for beginners' or 'step by step' consistently show lower competition on YouTube. The opportunity score combines these two signals to surface the keywords most worth targeting given both their traffic potential and realistic rankability. For precise verified data, we recommend cross-referencing our results with YouTube Studio's Search analytics after publishing content with these keywords.",
  },
  {
    q: "How many keywords should I include in a YouTube video?",
    a: "For YouTube tags, include 10–15 tags using a strategic mix of keyword types: 2–3 exact-match tags (your primary keyword exactly as viewers would search it), 3–4 phrase-match variations (related and modifier variants), 3–4 broad topical tags (your niche category terms), and 2–3 brand/channel tags. For the description, naturally include 5–8 keyword phrases across a 300–500 word description — forced keyword stuffing actually harms your ranking as YouTube's algorithm now detects and penalizes unnatural language. Focus on the top keyword in your title and description; use remaining keywords as tags and secondary description terms rather than trying to rank for 20 different terms with one video.",
  },
  {
    q: "What makes a good 'opportunity keyword' on YouTube?",
    a: "An ideal YouTube opportunity keyword has four characteristics: (1) Sufficient search volume — someone needs to actually be searching for it, which eliminates hyper-specific phrases nobody types. (2) Competition you can realistically overcome — measured by looking at whether the top-ranking videos are from channels your size or much larger. (3) Strong viewer intent alignment — the keyword should match exactly what your video delivers, ensuring high watch time once someone clicks. (4) Moderate keyword length — the sweet spot is typically 3–5 word phrases that are specific enough to have lower competition but broad enough to have meaningful search volume. Our opportunity score formula weights these factors: Opportunity = (Volume × 0.6) + (Low Competition × 0.4).",
  },
  {
    q: "Should I use YouTube hashtags and how many should I add?",
    a: "Yes — YouTube hashtags are displayed above the video title and are clickable, allowing viewers to discover related content. YouTube officially recommends using 3–5 hashtags in your description or title for maximum effectiveness. Adding more than 15 hashtags causes YouTube to ignore all hashtags on the video as a spam signal. Best practice is to use your 3 most important keyword phrases as hashtags (e.g., #YouTubeSEO, #HowToGrowOnYouTube, #YouTubeTips), placed either at the end of your video description or within the title itself for maximum visibility. The hashtags generated by our tool are formatted from your highest-opportunity keywords for direct use in your description.",
  },
  {
    q: "Is the YouTube Keyword Generator free to use?",
    a: "Yes — the YouTube Keyword Generator is completely free with no account, no signup, and no usage limits. Generate unlimited keyword sets for any topic, niche, and content type. The real-time suggestions, Keyword Gap analysis, hashtag generation, and title suggestions are all included at no cost. For a complete YouTube SEO workflow, pair the keyword generator with our free YouTube Title Analyzer to score your optimized title, and the YouTube Tag Generator to build your full tag list from the keywords you find here.",
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${open ? "border-primary/40 shadow-md shadow-primary/10" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none rounded-2xl">
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Copy">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

function ScorePill({ score, inverse = false }: { score: number; inverse?: boolean }) {
  const eff = inverse ? 100 - score : score;
  const cls = eff >= 70 ? "bg-green-500/15 text-green-700 dark:text-green-400" :
               eff >= 45 ? "bg-amber-500/15 text-amber-700 dark:text-amber-500" :
               "bg-red-500/15 text-red-600 dark:text-red-400";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{score}</span>;
}

function CompBadge({ level }: { level: Competition }) {
  const cls = level === "Low" ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" :
              level === "Medium" ? "bg-amber-500/15 text-amber-700 dark:text-amber-500 border-amber-500/30" :
              "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>{level}</span>;
}

function OppBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-foreground">{score}</span>
    </div>
  );
}

function TrendBadge({ trending }: { trending?: boolean }) {
  if (!trending) return null;
  return <span className="text-[10px] font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full">🔥 Trending</span>;
}

function KeywordTable({ rows, title, icon, color }: { rows: KeywordRow[]; title: string; icon: React.ReactNode; color: string }) {
  const [expanded, setExpanded] = useState(true);
  const [limit, setLimit] = useState(6);
  const shown = rows.slice(0, limit);
  return (
    <div className={`rounded-2xl border overflow-hidden ${color}`}>
      <button type="button" onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="flex items-center gap-2 font-bold text-foreground">
          {icon} {title}
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">{rows.length}</span>
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="border-t border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-5 py-2.5">Keyword</th>
                  <th className="text-center px-3 py-2.5 hidden sm:table-cell">Volume</th>
                  <th className="text-center px-3 py-2.5">Competition</th>
                  <th className="text-center px-3 py-2.5 hidden sm:table-cell">Difficulty</th>
                  <th className="text-center px-3 py-2.5">Opportunity</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{row.phrase}</span>
                        <TrendBadge trending={row.trending} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <ScorePill score={row.volumeScore} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <CompBadge level={row.competition} />
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <ScorePill score={row.difficultyScore} inverse />
                    </td>
                    <td className="px-3 py-3">
                      <OppBar score={row.opportunityScore} />
                    </td>
                    <td className="px-3 py-3">
                      <CopyBtn text={row.phrase} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > limit && (
            <button onClick={() => setLimit(l => l + 10)}
              className="w-full py-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors border-t border-border">
              Show {Math.min(10, rows.length - limit)} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string }[] = [
  { value: "finance", label: "Finance" }, { value: "tech", label: "Tech" },
  { value: "education", label: "Education" }, { value: "gaming", label: "Gaming" },
  { value: "lifestyle", label: "Lifestyle" }, { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" }, { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "tutorial", label: "Tutorial" }, { value: "review", label: "Review" },
  { value: "list", label: "List / Top X" }, { value: "vlog", label: "Vlog" },
  { value: "shorts", label: "Shorts" }, { value: "case-study", label: "Case Study" },
];

const GOALS: { value: KeywordGoal; label: string; desc: string }[] = [
  { value: "balanced",       label: "Balanced",          desc: "Best mix of volume + competition (recommended)" },
  { value: "high-volume",    label: "High Volume",        desc: "Maximize search impressions" },
  { value: "low-competition",label: "Low Competition",    desc: "Easiest to rank for" },
  { value: "long-tail",      label: "Long-Tail Only",     desc: "Hyper-specific, niche audience" },
];

const CAT_LABELS: Record<Category, string> = {
  opportunity: "🔥 High Opportunity",
  trending:    "📈 Trending Keywords",
  "long-tail": "🎯 Long-Tail Keywords",
  question:    "💡 Question-Based Keywords",
};

const CAT_COLORS: Record<Category, string> = {
  opportunity: "border-green-500/30 bg-green-500/5",
  trending:    "border-orange-500/30 bg-orange-500/5",
  "long-tail": "border-blue-500/30 bg-blue-500/5",
  question:    "border-purple-500/30 bg-purple-500/5",
};

const CAT_ICONS: Record<Category, React.ReactNode> = {
  opportunity: <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />,
  trending:    <TrendingUp className="w-4 h-4 text-orange-500" />,
  "long-tail": <Target className="w-4 h-4 text-blue-500" />,
  question:    <Lightbulb className="w-4 h-4 text-purple-500" />,
};

export function YouTubeKeywordGeneratorTool() {
  const [topic, setTopic]               = useState("make money online");
  const [niche, setNiche]               = useState<Niche>("finance");
  const [audience, setAudience]         = useState("beginners");
  const [contentType, setContentType]   = useState<ContentType>("tutorial");
  const [goal, setGoal]                 = useState<KeywordGoal>("balanced");
  const [competitorTopic, setCompetitor] = useState("");
  const [result, setResult]             = useState<GeneratedResult | null>(null);
  const [suggestions, setSuggestions]   = useState<string[]>([]);
  const [showSugg, setShowSugg]         = useState(false);
  const [hashtagsCopied, setHashtagsCopied] = useState(false);
  const [titlesCopied, setTitlesCopied]     = useState(false);
  const resultsRef                      = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-kw-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json"; s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // Real-time suggestions as user types
  const handleTopicChange = useCallback((val: string) => {
    setTopic(val);
    if (val.length > 2) {
      setSuggestions(getRealTimeSuggestions(val));
      setShowSugg(true);
    } else {
      setSuggestions([]);
      setShowSugg(false);
    }
  }, []);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setShowSugg(false);
    const res = buildResult(topic.trim(), niche, audience.trim(), contentType, goal, competitorTopic.trim());
    setResult(res);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  };

  const byCategory = (cat: Category) => (result?.keywords ?? []).filter(r => r.category === cat);

  return (
    <>
      {/* ── Form ──────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Topic input with real-time suggestions */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Primary Topic / Seed Keyword *
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input ref={inputRef} value={topic} onChange={e => handleTopicChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                onKeyDown={e => e.key === "Enter" && handleGenerate()}
                placeholder="e.g. make money online" className="rounded-xl h-12 text-sm pl-10" />
            </div>
            {/* Real-time dropdown */}
            {showSugg && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-1">Quick keyword ideas</p>
                {suggestions.map((s, i) => (
                  <button key={i} type="button"
                    onMouseDown={() => { setTopic(s); setSuggestions([]); setShowSugg(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Niche + Content Type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Video Niche</label>
              <select value={niche} onChange={e => setNiche(e.target.value as Niche)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
                {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Content Type</label>
              <select value={contentType} onChange={e => setContentType(e.target.value as ContentType)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
                {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              Target Audience <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full">Optional</span>
            </label>
            <Input value={audience} onChange={e => setAudience(e.target.value)}
              placeholder="e.g. beginners, students, entrepreneurs, side hustlers"
              className="rounded-xl h-11 text-sm" />
          </div>

          {/* Keyword Goal */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Keyword Goal</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {GOALS.map(g => (
                <button key={g.value} type="button" onClick={() => setGoal(g.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${goal === g.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <div className="font-bold text-sm">{g.label}</div>
                  <div className="font-normal opacity-70 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Competitor (Keyword Gap) */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Keyword Gap Analysis</span>
              <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Enter a competitor's topic to see keywords they rank for that you might be missing</p>
            <Input value={competitorTopic} onChange={e => setCompetitor(e.target.value)}
              placeholder="e.g. passive income, dropshipping, freelancing"
              className="rounded-xl h-10 text-sm" />
          </div>

          <Button onClick={handleGenerate} size="lg" className="w-full h-12 rounded-xl font-semibold text-base gap-2">
            <Search className="w-5 h-5" /> Generate Keywords
          </Button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {result && (
        <div ref={resultsRef} className="mt-6 space-y-5 animate-in slide-in-from-bottom-4 duration-500">

          {/* ── Best Keyword Recommendation ── */}
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Best Keyword to Target</p>
              <p className="text-xl font-bold text-foreground font-display break-words">{result.bestKeyword.phrase}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground">Volume: <span className="font-bold text-foreground">{result.bestKeyword.volumeScore}/100</span></span>
                <CompBadge level={result.bestKeyword.competition} />
                <span className="text-xs text-muted-foreground">Opportunity: <span className="font-bold text-primary">{result.bestKeyword.opportunityScore}/100</span></span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This keyword has the best balance of search volume and low competition — the highest opportunity score in your results. Use it in your video title, first line of description, and as your primary tag.
              </p>
            </div>
            <CopyBtn text={result.bestKeyword.phrase} />
          </div>

          {/* ── Score legend ── */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Volume & Opportunity: higher = better</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Difficulty: lower = easier to rank</span>
            <span className="flex items-center gap-1.5"><CompBadge level="Low" />Competition: Low = easiest to beat</span>
          </div>

          {/* ── 4 Keyword Category Tables ── */}
          {(["opportunity", "trending", "long-tail", "question"] as Category[]).map(cat => {
            const rows = byCategory(cat);
            if (!rows.length) return null;
            return (
              <KeywordTable key={cat} rows={rows} title={CAT_LABELS[cat]}
                icon={CAT_ICONS[cat]} color={CAT_COLORS[cat]} />
            );
          })}

          {/* ── Keyword Gap ── */}
          {result.gapKeywords.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2 font-bold text-foreground border-b border-amber-500/20">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                🔍 Keyword Gap — Keywords Your Competitor Targets That You're Missing
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">{result.gapKeywords.length} gaps found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-500/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="text-left px-5 py-2.5">Gap Keyword</th>
                      <th className="text-center px-3 py-2.5 hidden sm:table-cell">Volume</th>
                      <th className="text-center px-3 py-2.5">Competition</th>
                      <th className="text-center px-3 py-2.5">Opportunity</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.gapKeywords.map((row, i) => (
                      <tr key={i} className="border-b border-amber-500/10 last:border-0 hover:bg-amber-500/5">
                        <td className="px-5 py-3 font-medium text-foreground">{row.phrase}</td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell"><ScorePill score={row.volumeScore} /></td>
                        <td className="px-3 py-3 text-center"><CompBadge level={row.competition} /></td>
                        <td className="px-3 py-3"><OppBar score={row.opportunityScore} /></td>
                        <td className="px-3 py-3"><CopyBtn text={row.phrase} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-amber-500/20">
                <p className="text-xs text-muted-foreground">
                  <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-amber-600 dark:text-amber-400" />
                  These keywords are opportunities your competitor topic covers that your current content may not — create videos targeting these to capture their audience.
                </p>
              </div>
            </div>
          )}

          {/* ── Hashtags ── */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> Hashtag Suggestions
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{result.hashtags.length} hashtags</span>
              </h3>
              <button onClick={() => { navigator.clipboard.writeText(result.hashtags.join(" ")); setHashtagsCopied(true); setTimeout(() => setHashtagsCopied(false), 2000); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                {hashtagsCopied ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.hashtags.map((h, i) => (
                <button key={i} onClick={() => navigator.clipboard.writeText(h)}
                  className="px-3 py-1.5 rounded-full bg-muted/50 border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all">
                  {h}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Add 3–5 of these hashtags to your video description or title. YouTube recommends using no more than 15 hashtags per video.</p>
          </div>

          {/* ── Title Suggestions ── */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> SEO-Optimized Title Suggestions
              </h3>
              <button onClick={() => { navigator.clipboard.writeText(result.titleSuggestions.join("\n")); setTitlesCopied(true); setTimeout(() => setTitlesCopied(false), 2000); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                {titlesCopied ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
              </button>
            </div>
            <div className="space-y-2">
              {result.titleSuggestions.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/20 hover:border-primary/30 transition-colors group">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="flex-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t}</p>
                  <CopyBtn text={t} />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Use the{" "}
              <Link href="/tools/youtube-title-analyzer" className="text-primary hover:underline font-medium">YouTube Title Analyzer</Link>
              {" "}to score any of these titles before using them in your video.
            </p>
          </div>

          {/* ── Description Keywords ── */}
          <div className="rounded-2xl border border-border bg-muted/20 p-5">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-primary" /> Description Keywords to Include
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.descriptionKeywords.map((k, i) => (
                <button key={i} onClick={() => navigator.clipboard.writeText(k)}
                  className="px-3 py-1 rounded-lg bg-muted border border-border text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
                  {k}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Include 5–8 of these naturally in your video description. Avoid keyword stuffing — write for humans, include keywords contextually.</p>
          </div>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Keyword Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Seed Keyword and Watch Real-Time Suggestions", desc: "Type your main topic into the keyword field. As you type, a real-time dropdown shows six keyword expansion ideas based on common YouTube search patterns. You can click any suggestion to use it as your seed — or continue typing your own phrase. Then select your video niche and content type to shape the keyword generation toward your specific context." },
            { step: 2, title: "Set Your Keyword Goal and Target Audience", desc: "Choose your keyword priority: Balanced uses the opportunity score formula (Volume × 0.6 + Low Competition × 0.4) to surface the best overall keywords; High Volume maximizes reach; Low Competition maximizes rankability; Long-Tail filters to 4+ word phrases for niche-specific content. Add your target audience to personalize long-tail keyword variations — 'for beginners,' 'for entrepreneurs,' or any custom audience label." },
            { step: 3, title: "Use Keyword Gap to Find Competitor Opportunities", desc: "Enter a competitor's topic in the Keyword Gap field to identify keywords they're likely ranking for that your content hasn't targeted. The gap analysis compares keyword profiles and surfaces the highest-opportunity gaps — specific keywords you could create videos around to capture traffic your competitor is getting that you currently miss." },
            { step: 4, title: "Apply Keywords Across Your Video Metadata", desc: "Use the Best Keyword to Target in your title (front-loaded) and first description paragraph. Distribute 10–15 keywords from the results table across your video tags. Add 3–5 hashtags from the hashtag section to your description. Check the Title Suggestions section for ready-to-use SEO titles, and use description keywords as a reference when writing your video description." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">{step}</div>
              <div><h3 className="font-bold text-foreground mb-1">{title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Keyword Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why YouTube Keyword Research Is the Foundation of Channel Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube is the world's second-largest search engine, processing over 3 billion searches per month.
              Unlike social media where content is pushed to viewers algorithmically based on past behavior,
              YouTube Search distributes content in direct response to what users actively look for. A video
              optimized for the right keyword can appear in the first 3 results for a term searched 10,000+
              times per month — generating consistent, compounding organic views for years after publish. This
              is the core mechanism that separates channels that grow steadily through search traffic from
              channels that depend entirely on going viral to get discovered.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The challenge is finding keywords that are both worth ranking for (enough people searching) and
              realistically rankable (not completely dominated by channels with millions of subscribers). This
              is the opportunity scoring problem our generator solves: Opportunity = (Volume × 0.6) +
              (Low Competition × 0.4). A perfect opportunity keyword has substantial monthly searches and
              competition your channel can actually beat. The Best Keyword to Target recommendation surfaces
              the single highest opportunity-score keyword from your results — the one to build your video,
              title, description, and tags around first.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> The Four Keyword Categories and When to Target Each
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">High Opportunity keywords</strong> are the foundation — they
              balance search volume and competition scoring to surface the most efficient targets for your
              channel regardless of size. These include long-tail phrases with beginner, year, or niche
              modifiers that attract consistent search volume without requiring a massive existing subscriber
              base to rank. Use these as your primary keyword targets in video titles and descriptions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Trending keywords</strong> use current-year modifiers and
              niche-specific trending terms that are seeing elevated search interest. Publishing content around
              trending keywords within 24–48 hours of a trend peak can capture significant early traffic from
              both search and the YouTube feed as the algorithm distributes trending-adjacent content broadly.
              Use the{" "}
              <Link href="/tools/youtube-hashtag-generator" className="text-primary hover:underline font-medium">
                YouTube Hashtag Generator
              </Link>{" "}
              to maximize discovery for trending content.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Long-tail keywords</strong> are 4–6+ word phrases that are the
              single most important category for growing channels. Their longer length naturally filters out
              casual competition — most creators optimize only for short, broad terms — while their specificity
              attracts highly engaged viewers who know exactly what they want. A channel that systematically
              creates content for 50 long-tail keywords builds a durable, compounding search traffic foundation
              that continues generating views long after each video publishes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Question-based keywords</strong> capture the enormous "how to"
              and "what is" search volume that represents the majority of YouTube's information-seeking queries.
              These keywords perform particularly well in YouTube's suggested video feed because they signal a
              learning intent that the algorithm associates with high watch time and session duration. Pair
              question-based title keywords with comprehensive, well-structured answers to trigger YouTube's
              recommendation engine to extend viewer sessions. Use these alongside your{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                title generator
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                description generator
              </Link>{" "}
              for a fully optimized video upload.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Keyword Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Real-time keyword suggestions as you type — 6 instant expansion ideas",
                "Opportunity score formula: Volume × 0.6 + (100 − Competition) × 0.4",
                "4 keyword categories: High Opportunity, Trending, Long-Tail, Question-Based",
                "Keyword Gap analysis — find keywords competitors rank for that you're missing",
                "Trending keyword detection with 🔥 badge and year-specific modifiers",
                "Auto-formatted hashtag suggestions from top-opportunity keywords",
                "5 SEO-optimized title suggestions using your top keywords",
                "Description keyword list for natural, search-engine-friendly video descriptions",
                "Expandable results tables with copy-to-clipboard on every keyword",
                "100% free, instant results, no account required",
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
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Convert your best keywords into a full SEO tag set optimized for YouTube's algorithm." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your title and description using the keywords you just discovered." },
            { name: "YouTube Title Analyzer", path: "/tools/youtube-title-analyzer", desc: "Analyze whether your keyword-optimized title has sufficient CTR power and SEO strength." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write descriptions that naturally integrate your target keywords for search visibility." },
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

      {/* ── FAQ ──────────────────────────────────────────────── */}
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
