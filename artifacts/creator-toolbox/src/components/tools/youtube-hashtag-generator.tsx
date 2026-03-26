import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Copy, Check, RefreshCw, ChevronDown,
  Hash, TrendingUp, Target, Layers, ListChecks, Shield, Zap, ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "Trending" | "Niche" | "Long-Tail";
type Quantity = 10 | 20 | 30;

interface HashtagResult {
  id: string;
  tag: string;       // e.g. "#YouTubeSEO"
  category: Category;
}

// ─── Niche word banks ─────────────────────────────────────────────────────────

const NICHE_HASHTAGS: Record<string, string[]> = {
  youtube:     ["YouTubeGrowth", "YouTubeSEO", "GrowOnYouTube", "YouTubeTips", "YouTubeAlgorithm", "ContentStrategy", "VideoSEO", "SubscriberGrowth", "YouTubeChannel", "VideoMarketing"],
  gaming:      ["Gaming", "GamerLife", "VideoGames", "Gameplay", "GamingCommunity", "PCGaming", "MobileGaming", "GamingSetup", "GameReview", "Twitch"],
  tech:        ["Technology", "TechReview", "TechTips", "Gadgets", "Innovation", "AI", "TechNews", "Smartphone", "Software", "CyberSecurity"],
  education:   ["Learning", "Education", "StudyTips", "OnlineLearning", "Knowledge", "Tutorial", "HowTo", "StudyWithMe", "SkillBuilding", "ELearning"],
  fitness:     ["FitnessMotivation", "WorkoutRoutine", "HealthyLiving", "Gym", "FitnessJourney", "HomeWorkout", "WeightLoss", "FitLife", "Exercise", "NutritionTips"],
  finance:     ["PersonalFinance", "MoneyTips", "Investing", "FinancialFreedom", "BudgetTips", "StockMarket", "PassiveIncome", "Crypto", "WealthBuilding", "SavingMoney"],
  travel:      ["TravelVlog", "TravelTips", "Wanderlust", "Adventure", "ExploreTheWorld", "TravelPhotography", "Backpacking", "TravelGuide", "DigitalNomad", "BucketList"],
  cooking:     ["CookingTips", "RecipeIdeas", "FoodLover", "HomeCooking", "EasyRecipes", "MealPrep", "Foodie", "HealthyEating", "CookingVideo", "FoodPhotography"],
  beauty:      ["BeautyTips", "MakeupTutorial", "Skincare", "GlowUp", "BeautyHacks", "NaturalBeauty", "MakeupLook", "HairCare", "BeautyRoutine", "FashionStyle"],
  business:    ["Entrepreneurship", "StartupLife", "BusinessTips", "Marketing", "Branding", "SmallBusiness", "DigitalMarketing", "SideHustle", "Leadership", "BusinessGrowth"],
  music:       ["MusicVideo", "NewMusic", "MusicProducer", "SongCover", "OriginalMusic", "MusicTips", "BeatMaking", "Singer", "MusicProduction", "IndieMusic"],
  diy:         ["DIY", "DIYProject", "Crafts", "Handmade", "HomeDecor", "DIYTips", "MakeIt", "Upcycle", "Creative", "HomeDIY"],
  sports:      ["Sports", "Athlete", "Training", "SportsTips", "FitnessGoals", "TeamSports", "SportLife", "CoachingTips", "Competition", "WinMindset"],
};

const BROAD_HASHTAGS = [
  "YouTube", "YouTuber", "ContentCreator", "VideoContent", "CreatorEconomy",
  "ContentCreation", "DigitalCreator", "VideoCreator", "OnlineVideo", "CreatorTips",
];

const LONG_TAIL_MODIFIERS = [
  "Tips", "Guide", "Tutorial", "Strategy", "Hacks", "Ideas", "ForBeginners",
  "In2025", "In2026", "HowTo", "Step By Step", "Explained", "Secrets", "Mistakes",
];

// ─── Keyword extraction ───────────────────────────────────────────────────────

function extractKeywords(topic: string): string[] {
  const stopWords = new Set(["a", "an", "the", "is", "in", "on", "at", "to", "for", "of", "and", "or", "but", "how", "why", "what", "when", "where", "with", "my", "your", "i", "you", "we"]);
  const words = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  return [...new Set(words)];
}

function toHashtag(words: string | string[]): string {
  const arr = Array.isArray(words) ? words : words.split(/\s+/);
  return "#" + arr.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function detectNiche(text: string, selectedNiche: string): string {
  if (selectedNiche && selectedNiche !== "auto") return selectedNiche;
  const lower = text.toLowerCase();
  for (const key of Object.keys(NICHE_HASHTAGS)) {
    if (lower.includes(key)) return key;
  }
  return "youtube";
}

function generateHashtags(topic: string, niche: string, extraKeywords: string, quantity: Quantity, seed: number): HashtagResult[] {
  const results: HashtagResult[] = [];
  const seen = new Set<string>();

  const add = (raw: string, category: Category) => {
    const tag = raw.startsWith("#") ? raw : `#${raw}`;
    if (seen.has(tag.toLowerCase()) || tag.length < 4 || tag.length > 30) return;
    if (/[^a-zA-Z0-9#]/.test(tag)) return;
    seen.add(tag.toLowerCase());
    results.push({ id: `${tag}-${category}`, tag, category });
  };

  const detectedNiche = detectNiche(topic + " " + extraKeywords, niche);
  const topicKws = extractKeywords(topic);

  // ── Trending ──────────────────────────────────────────────────────────────
  const trendingPool = [...BROAD_HASHTAGS];
  for (let i = 0; i < Math.min(5, trendingPool.length); i++) {
    add(trendingPool[(i + seed) % trendingPool.length], "Trending");
  }
  // Add niche-based trending
  const nichePool = NICHE_HASHTAGS[detectedNiche] || NICHE_HASHTAGS.youtube;
  for (let i = 0; i < 4; i++) {
    add(nichePool[(i + seed) % nichePool.length], "Trending");
  }

  // ── Niche hashtags ────────────────────────────────────────────────────────
  topicKws.forEach((kw, i) => {
    add(toHashtag(kw), "Niche");
    // pair with niche word
    const nicheWord = nichePool[(i + seed + 1) % nichePool.length];
    add(nicheWord, "Niche");
  });

  // Extra keywords → niche hashtags
  if (extraKeywords.trim()) {
    extraKeywords.split(",").forEach(kw => {
      const cleaned = kw.trim().replace(/\s+/g, "");
      if (cleaned) add(toHashtag(cleaned.split(/\s+/)), "Niche");
    });
  }

  // More niche picks
  for (let i = 4; i < Math.min(nichePool.length, 10); i++) {
    add(nichePool[(i + seed) % nichePool.length], "Niche");
  }

  // ── Long-tail ─────────────────────────────────────────────────────────────
  topicKws.forEach((kw, i) => {
    const mod = LONG_TAIL_MODIFIERS[(i + seed) % LONG_TAIL_MODIFIERS.length];
    const mod2 = LONG_TAIL_MODIFIERS[(i + seed + 3) % LONG_TAIL_MODIFIERS.length];
    add(toHashtag([kw, mod]), "Long-Tail");
    add(toHashtag([kw, mod2]), "Long-Tail");
  });

  // Topic-level long-tail combinations
  if (topicKws.length >= 2) {
    add(toHashtag([topicKws[0], topicKws[1]]), "Long-Tail");
    add(toHashtag([topicKws[0], topicKws[1], LONG_TAIL_MODIFIERS[(seed + 1) % LONG_TAIL_MODIFIERS.length]]), "Long-Tail");
  }

  const order: Record<Category, number> = { Trending: 0, Niche: 1, "Long-Tail": 2 };
  return results
    .sort((a, b) => order[a.category] - order[b.category])
    .slice(0, quantity);
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What are YouTube hashtags and how do they work?",
    a: "YouTube hashtags are clickable labels prefixed with the # symbol that appear in video titles, descriptions, and above video titles on YouTube. When you add a hashtag to your video, it creates a link that takes viewers to a search results page showing all videos tagged with that same hashtag. This gives your video an additional discovery surface beyond standard keyword search — viewers browsing a hashtag can find your content even if they never searched your exact title or channel name.",
  },
  {
    q: "How many hashtags should I use on a YouTube video?",
    a: "YouTube recommends using no more than 15 hashtags per video. More importantly, YouTube's spam policies state that if you use more than 15 hashtags, YouTube may ignore ALL hashtags on that video entirely. The sweet spot most creators use is 3–8 hashtags: 2–3 broad trending hashtags, 3–4 niche-specific hashtags, and 1–2 long-tail hashtags. Our generator produces 10–30 suggestions so you can hand-pick the best ones for your video rather than using all of them.",
  },
  {
    q: "Where should I put hashtags in my YouTube video?",
    a: "The best place for hashtags depends on your strategy. If you put hashtags in your video title, only up to 3 will display above the video title — this is prime real estate. If you put hashtags in your video description, YouTube shows up to 3 from the description above the title. Most creators use both: a clean title without hashtags, and 5–10 hashtags at the very end of the video description. Avoid placing hashtags in the middle of your description text — they break the reading flow and look unprofessional.",
  },
  {
    q: "Do YouTube hashtags affect SEO rankings?",
    a: "YouTube hashtags have a modest but real impact on discoverability. They create clickable category pages that expose your video to viewers actively browsing that hashtag. For newer channels, niche hashtags with moderate volume (not massive generic tags like #YouTube with billions of views) tend to be most effective — your video has a real chance of appearing near the top of a niche hashtag page. Broad trending hashtags drive awareness but are extremely competitive. Long-tail hashtags target specific audiences and often convert better even with lower volume.",
  },
  {
    q: "What's the difference between trending, niche, and long-tail YouTube hashtags?",
    a: "Trending hashtags (#YouTube, #ContentCreator) have massive search volume and are used by millions of videos — they drive broad awareness but your video competes against an enormous pool. Niche hashtags (#YouTubeSEO, #GamingTips) are category-specific with moderate volume — they reach people actively interested in your topic and offer better ranking opportunities. Long-tail hashtags (#YouTubeGrowthTips2026, #HomeWorkoutForBeginners) are hyper-specific with low volume but high intent — viewers clicking these tags know exactly what they want and are more likely to watch, like, and subscribe.",
  },
  {
    q: "Should I use the same hashtags on every video?",
    a: "No — using identical hashtags on every video is a pattern YouTube's algorithm recognizes and potentially penalizes as spammy behavior. Your hashtags should always be specific to the individual video's content. Broad brand hashtags (like your channel name as a hashtag) are the exception — those can appear consistently across your videos as a brand identifier. Always include at least 3–5 video-specific hashtags tailored to the exact topic, keyword, and audience of each upload.",
  },
  {
    q: "Can hashtags help my YouTube Shorts get more views?",
    a: "Yes — hashtags are particularly valuable for YouTube Shorts because Shorts have their own dedicated browse feed where hashtags help with categorization. For Shorts, use #Shorts as one of your hashtags (YouTube actually recommends this for proper Shorts classification), plus 2–4 niche-specific hashtags. Keep total hashtags even lower for Shorts — 3–5 is ideal. The character limit pressure is also less for Shorts since the description is often minimal.",
  },
  {
    q: "What hashtags should I avoid on YouTube?",
    a: "Avoid spam hashtags that are irrelevant to your content (#viral, #fyp, #follow4follow, #like4like) — they signal low-quality content to both YouTube's algorithm and viewers who click them. Avoid hashtags with no real YouTube community behind them. Don't use competitor channel names as hashtags. Steer clear of hashtags associated with community guideline violations. And never add sexual, offensive, or misleading hashtags — YouTube can remove your video or restrict its reach even if the video content itself is fine.",
  },
  {
    q: "How do I find the best hashtags for my YouTube niche?",
    a: "Start by researching which hashtags top-performing channels in your niche use — watch their videos and check descriptions. Search your primary hashtag on YouTube (e.g. #TechReview) and see how many views the top videos have and how many recent videos exist under that tag. You want hashtags where top videos get decent views but the total pool isn't dominated by channels with millions of subscribers. Our generator handles this research automatically, building niche-matched hashtag sets based on your topic, niche, and keywords.",
  },
  {
    q: "Is the YouTube Hashtag Generator free to use?",
    a: "Yes — this YouTube Hashtag Generator is completely free with no registration, no account, and no usage limits. Enter your video topic and keywords, generate 10–30 hashtag suggestions in seconds, copy them all with one click, and paste directly into your video description. Use Regenerate to get a fresh set whenever you want different combinations. All generation happens instantly in your browser.",
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

// ─── Category badge ───────────────────────────────────────────────────────────

const CAT_STYLES: Record<Category, string> = {
  Trending:   "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Niche:      "bg-primary/10 text-primary border-primary/20",
  "Long-Tail":"bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
};

const CAT_ICONS: Record<Category, React.ReactNode> = {
  Trending:    <TrendingUp className="w-3 h-3" />,
  Niche:       <Target className="w-3 h-3" />,
  "Long-Tail": <Layers className="w-3 h-3" />,
};

// ─── Hashtag pill ─────────────────────────────────────────────────────────────

function HashtagPill({
  result,
  selected,
  copiedId,
  onToggle,
  onCopy,
}: {
  result: HashtagResult;
  selected: boolean;
  copiedId: string | null;
  onToggle: (id: string) => void;
  onCopy: (tag: string, id: string) => void;
}) {
  return (
    <div
      className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${
        selected
          ? "border-primary/50 bg-primary/8 shadow-sm"
          : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
      }`}
      onClick={() => onToggle(result.id)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm font-bold text-foreground truncate ${selected ? "text-primary" : ""}`}>
          {result.tag}
        </span>
        <span className={`hidden sm:flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${CAT_STYLES[result.category]}`}>
          {CAT_ICONS[result.category]}
          {result.category}
        </span>
      </div>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onCopy(result.tag, result.id); }}
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        title="Copy"
      >
        {copiedId === result.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NICHES = ["auto", "youtube", "gaming", "tech", "education", "fitness", "finance", "travel", "cooking", "beauty", "business", "music", "diy", "sports"];
const NICHE_LABELS: Record<string, string> = {
  auto: "Auto-Detect from Topic", youtube: "YouTube Growth", gaming: "Gaming", tech: "Tech & Gadgets",
  education: "Education", fitness: "Fitness & Health", finance: "Finance & Investing",
  travel: "Travel", cooking: "Cooking & Food", beauty: "Beauty & Fashion",
  business: "Business & Marketing", music: "Music", diy: "DIY & Crafts", sports: "Sports & Athletics",
};

export function YouTubeHashtagGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("auto");
  const [keywords, setKeywords] = useState("");
  const [quantity, setQuantity] = useState<Quantity>(20);
  const [results, setResults] = useState<HashtagResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [topicError, setTopicError] = useState("");
  const [activeFilter, setActiveFilter] = useState<Category | "All">("All");
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = "faq-schema-yt-hashtag-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const runGenerate = useCallback((currentSeed: number) => {
    if (!topic.trim()) { setTopicError("Video topic is required."); return; }
    setTopicError("");
    setLoading(true);
    setSelected(new Set());
    setTimeout(() => {
      setResults(generateHashtags(topic, niche, keywords, quantity, currentSeed));
      setLoading(false);
      setActiveFilter("All");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }, 450);
  }, [topic, niche, keywords, quantity]);

  const handleGenerate = () => runGenerate(seed);

  const handleRegenerate = () => {
    const next = seed + 1;
    setSeed(next);
    runGenerate(next);
  };

  const handleCopyOne = useCallback((tag: string, id: string) => {
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedId(id);
      toast({ title: "Copied!", description: `${tag} copied to clipboard.` });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [toast]);

  const handleCopyAll = () => {
    const all = results.map(r => r.tag).join(" ");
    navigator.clipboard.writeText(all).then(() => {
      setCopiedAll(true);
      toast({ title: "All hashtags copied!", description: `${results.length} hashtags copied to clipboard.` });
      setTimeout(() => setCopiedAll(false), 2500);
    });
  };

  const handleCopySelected = () => {
    const tags = results.filter(r => selected.has(r.id)).map(r => r.tag).join(" ");
    if (!tags) { toast({ title: "Nothing selected", description: "Click hashtags to select them first." }); return; }
    navigator.clipboard.writeText(tags).then(() => {
      toast({ title: "Copied selected!", description: `${selected.size} hashtags copied.` });
    });
  };

  const toggleSelected = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const filteredResults = activeFilter === "All" ? results : results.filter(r => r.category === activeFilter);
  const allTagsText = results.map(r => r.tag).join(" ");
  const charCount = allTagsText.length;
  const charMax = 500; // YouTube description practical limit for hashtags

  const catCounts: Record<string, number> = {
    All: results.length,
    Trending: results.filter(r => r.category === "Trending").length,
    Niche: results.filter(r => r.category === "Niche").length,
    "Long-Tail": results.filter(r => r.category === "Long-Tail").length,
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Video Topic */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Video Topic / Title *
            </label>
            <Input
              value={topic}
              onChange={e => { setTopic(e.target.value); setTopicError(""); }}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. How to grow on YouTube in 2026, Home workout for beginners…"
              className={`rounded-xl h-11 text-sm ${topicError ? "border-destructive" : ""}`}
            />
            {topicError && <p className="text-xs text-destructive mt-1">{topicError}</p>}
          </div>

          {/* Niche + Keywords */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Video Niche
              </label>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {NICHES.map(n => (
                  <option key={n} value={n}>{NICHE_LABELS[n]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Target Keywords (Optional)
              </label>
              <Input
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="e.g. YouTube SEO, grow channel, video tips"
                className="rounded-xl h-11 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated — each becomes a hashtag</p>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Number of Hashtags
            </label>
            <div className="flex gap-3">
              {([10, 20, 30] as Quantity[]).map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`flex-1 h-11 rounded-xl border text-sm font-bold transition-all ${
                    quantity === q
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">YouTube recommends using 3–15 hashtags per video. Generate more, then pick your best ones.</p>
          </div>

          {/* Generate */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          >
            {loading ? (
              <><span className="animate-spin">✦</span> Generating…</>
            ) : (
              <><Hash className="w-5 h-5" /> Generate Hashtags</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {results.length > 0 && (
        <div ref={resultsRef} className="mt-6 animate-in slide-in-from-bottom-4 duration-500 space-y-4">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(["All", "Trending", "Niche", "Long-Tail"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f as Category | "All")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {f === "Trending" && <TrendingUp className="w-3 h-3 inline mr-1" />}
                  {f === "Niche" && <Target className="w-3 h-3 inline mr-1" />}
                  {f === "Long-Tail" && <Layers className="w-3 h-3 inline mr-1" />}
                  {f} <span className="opacity-70 ml-1">{catCounts[f]}</span>
                </button>
              ))}
            </div>
            <Button
              variant="outline" size="sm" onClick={handleRegenerate}
              disabled={loading} className="gap-1.5 rounded-xl text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Regenerate
            </Button>
          </div>

          {/* Hashtag grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredResults.map(r => (
              <HashtagPill
                key={r.id}
                result={r}
                selected={selected.has(r.id)}
                copiedId={copiedId}
                onToggle={toggleSelected}
                onCopy={handleCopyOne}
              />
            ))}
          </div>

          {/* Character counter */}
          <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">All hashtags character count</span>
              <span className={`text-xs font-bold tabular-nums ${charCount > charMax * 0.8 ? (charCount > charMax ? "text-destructive" : "text-orange-500") : "text-primary"}`}>
                {charCount} / {charMax}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${charCount > charMax ? "bg-destructive" : charCount > charMax * 0.8 ? "bg-orange-500" : "bg-primary"}`}
                style={{ width: `${Math.min(100, (charCount / charMax) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {selected.size > 0 ? `${selected.size} selected · ` : ""}
              Click hashtag pills to select specific ones, then Copy Selected.
            </p>
          </div>

          {/* Copy buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCopyAll} className="gap-2 rounded-xl" size="sm">
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedAll ? "Copied All!" : `Copy All ${results.length} Hashtags`}
            </Button>
            <Button
              variant="outline" onClick={handleCopySelected}
              disabled={selected.size === 0}
              className="gap-2 rounded-xl" size="sm"
            >
              <Check className="w-4 h-4" />
              Copy Selected ({selected.size})
            </Button>
          </div>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Hashtag Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Video Topic or Title", desc: "Paste your video title or describe the topic in a sentence. The generator extracts the core keywords from your input and uses them as the foundation for your hashtag set. The more specific your topic, the more targeted the hashtags — 'Home workout for beginners without equipment' will produce better niche hashtags than just 'fitness'." },
            { step: 2, title: "Select Your Niche and Keywords", desc: "Choose your content niche from the dropdown (or leave it on Auto-Detect) to unlock niche-specific hashtag pools tailored to your category. Optionally add comma-separated target keywords — each keyword is automatically converted into an optimized hashtag. For example: 'YouTube SEO, grow channel, video tips' becomes #YouTubeSEO, #GrowChannel, #VideoTips." },
            { step: 3, title: "Choose Quantity and Generate", desc: "Pick 10, 20, or 30 hashtags based on how many suggestions you want to browse. Click Generate Hashtags and your personalized set appears instantly, organized into three groups: Trending (high-volume platform hashtags), Niche (topic-specific), and Long-Tail (highly specific combination hashtags)." },
            { step: 4, title: "Select, Copy, and Paste", desc: "Click individual hashtag pills to select your favorites, then hit 'Copy Selected' to grab just those ones. Or use 'Copy All' to copy every hashtag at once. The character counter shows the total length so you can stay within your description budget. Paste directly into your YouTube video description — at the end, below your main content." },
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

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Hash className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Hashtag Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How YouTube Hashtags Improve Discoverability
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube hashtags function as a secondary discovery system that runs parallel to standard
              keyword search. When a viewer clicks a hashtag on any video, they land on a dedicated
              hashtag search page that displays all videos tagged with that term — ordered by relevance
              and watch time rather than pure keyword match. This creates a discovery pathway that can
              expose your content to viewers who never would have found it through search alone, because
              they were browsing content by topic rather than searching for a specific answer.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The algorithm uses hashtags as one of the signals it reads when categorizing your video.
              Accurate, relevant hashtags help YouTube understand your content category and serve it to
              the right suggested video slots — the "Up Next" sidebar and the home feed for viewers
              who have engaged with similar content. Mismatched or spammy hashtags (using #viral or
              #fyp on a finance tutorial) confuse this categorization and can actively reduce your
              reach by placing your video in the wrong audience feed.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The Three-Layer Hashtag Strategy
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The most effective YouTube hashtag strategies use three layers simultaneously. The first
              layer is broad trending hashtags — tags like #YouTube, #ContentCreator, and #VideoMarketing
              that have enormous search volume. These won't rank your video on their own because the
              competition is fierce, but they signal to the platform that your content belongs in the
              mainstream creator ecosystem and can trigger related video suggestions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The second layer is niche hashtags specific to your content category. A fitness creator
              using #HomeWorkout and #FitnessMotivation reaches people actively browsing fitness
              content. A tech reviewer using #TechReview and #GadgetUnboxing lands in front of
              technology enthusiasts. These mid-volume hashtags offer the best balance of audience
              relevance and ranking opportunity — large enough to drive meaningful traffic, specific
              enough for your video to rank near the top.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The third layer is long-tail hashtags — highly specific combinations like
              #HomeWorkoutForBeginners or #YouTubeGrowthTips2026. These drive low but highly qualified
              traffic. A viewer clicking #HomeWorkoutForBeginners is looking for exactly what you've
              made. Long-tail hashtags also face far less competition, meaning your video can rank
              first for that tag even with a small channel. Use our{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube Description Generator
              </Link>{" "}
              to craft descriptions that reinforce these same keywords through the description text,
              multiplying their SEO effect.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Hashtag Mistakes That Kill Your YouTube Reach
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Over-hashtagging is the most common YouTube hashtag mistake. Using more than 15 hashtags
              triggers YouTube's spam filter and can cause YouTube to ignore all hashtags on that
              video. The irony is that creators who use 50+ hashtags trying to maximize exposure often
              get zero hashtag benefit. Keep it between 5–15, focusing on quality over quantity.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The second major mistake is using irrelevant trending hashtags to hijack traffic. Using
              #Gaming on a cooking video might drive clicks, but those viewers immediately bounce when
              they see unrelated content — spiking your bounce rate and signaling to YouTube that your
              video disappoints its audience. This suppresses your video across all discovery channels,
              not just the misused hashtag. Always ensure every hashtag accurately describes your
              actual video content. Combine strong hashtags with an optimized{" "}
              <Link href="/tools/youtube-channel-name-generator" className="text-primary hover:underline font-medium">
                channel name
              </Link>,{" "}
              compelling{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                video titles
              </Link>, and eye-catching{" "}
              <Link href="/tools/youtube-thumbnail-downloader" className="text-primary hover:underline font-medium">
                thumbnails
              </Link>{" "}
              for a complete YouTube SEO strategy.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Hashtag Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Three-tier hashtag strategy: Trending, Niche, and Long-Tail groups",
                "Niche keyword expansion — 13 content categories with curated hashtag pools",
                "Custom keywords converted to properly formatted hashtags automatically",
                "10, 20, or 30 hashtag generation depending on your browsing preference",
                "Select individual hashtags — copy only the ones that fit your video",
                "Character counter tracks total hashtag length for description planning",
                "One-click Copy All — paste directly into YouTube Studio description",
                "Regenerate button cycles fresh hashtag combinations on demand",
                "Properly capitalized formatting (#YouTubeSEO not #youtubeseo)",
                "100% free — no account, no limits, instant generation",
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
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized video tags that complement your hashtag strategy for stronger rankings." },
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Create high-CTR titles that work alongside your hashtags to maximize search visibility." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write keyword-rich descriptions where you can embed your top hashtags for double impact." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your complete title and description SEO package before publishing." },
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
