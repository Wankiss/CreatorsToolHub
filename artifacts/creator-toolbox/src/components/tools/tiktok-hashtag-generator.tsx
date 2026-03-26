import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Hash, Copy, Check, RefreshCw, ChevronDown, Sparkles, Loader2,
  TrendingUp, Zap, Shield, ListChecks, Search, Target, BarChart2, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "business" | "tech" | "beauty" | "lifestyle"
  | "food" | "travel" | "gaming" | "education" | "finance"
  | "fashion" | "health" | "relationships" | "entertainment";

type ContentType = "educational" | "entertaining" | "storytelling" | "tutorial" | "funny" | "pov";

interface HashtagSet {
  primary: TagItem[];
  secondary: TagItem[];
  trending: TagItem[];
  longTail: TagItem[];
  strategyExplanation: string;
  postingStrategy: string;
  totalCount: number;
}

interface TagItem {
  tag: string;
  score: number;
  category: "primary" | "secondary" | "trending" | "long-tail";
}

// ─── Niche Data ───────────────────────────────────────────────────────────────

const NICHE_HASHTAGS: Record<Niche, {
  primary: string[];
  secondary: string[];
  trending: string[];
  longTail: string[];
}> = {
  fitness: {
    primary: ["#FitnessTok", "#WorkoutTips", "#FitnessMotivation", "#GymLife", "#FitnessJourney", "#BodyTransformation", "#FitnessHack", "#HomeWorkout"],
    secondary: ["#HealthyLifestyle", "#Wellness", "#ActiveLife", "#FitLife", "#HealthyHabits", "#GetFit", "#ExerciseTips", "#MuscleGain", "#WeightLoss", "#StrengthTraining"],
    trending: ["#GymTok", "#FitTok", "#WorkoutChallenge", "#GRWM", "#DayInMyLife"],
    longTail: ["#BestHomeWorkoutRoutine", "#HowToLoseBellyFat", "#BeginnerWorkoutPlan", "#QuickWorkoutAtHome", "#LoseWeightFast", "#MorningWorkoutRoutine", "#HighProteinMeals"],
  },
  business: {
    primary: ["#EntrepreneurLife", "#BusinessTips", "#StartupLife", "#SmallBusiness", "#BusinessMindset", "#MakeMoneyOnline", "#SideHustle", "#PassiveIncome"],
    secondary: ["#DigitalMarketing", "#OnlineBusiness", "#Freelancing", "#MarketingTips", "#ContentMarketing", "#GrowYourBusiness", "#BusinessStrategy", "#Entrepreneurship", "#SuccessMindset", "#WorkFromHome"],
    trending: ["#BusinessTok", "#HustleCulture", "#MoneyTok", "#GirlBoss", "#Founder"],
    longTail: ["#HowToStartABusinessWithNoMoney", "#SmallBusinessOwnerTips", "#FreelancingForBeginners", "#PassiveIncomeIdeas2026", "#DropshippingTips", "#EcommerceSuccess", "#DigitalProductIdeas"],
  },
  tech: {
    primary: ["#TechTok", "#AITools", "#TechTips", "#ProductivityHacks", "#ChatGPT", "#ArtificialIntelligence", "#SoftwareTips", "#TechLife"],
    secondary: ["#FutureTech", "#Coding", "#AppReview", "#DigitalTools", "#WorkSmarter", "#AutomationTips", "#TechReview", "#Innovation", "#DigitalLife", "#TechHacks"],
    trending: ["#AIGenerated", "#ChatGPTTips", "#TechNews", "#TechInnovation", "#FutureTech"],
    longTail: ["#BestAIToolsFor2026", "#FreeChatGPTTricks", "#ProductivityAppsYouNeedToKnow", "#HowToAutomate", "#AIToolsForCreators", "#BestTechGadgets", "#CodingForBeginners"],
  },
  beauty: {
    primary: ["#BeautyTok", "#MakeupTutorial", "#SkincareRoutine", "#GlowUp", "#MakeupTips", "#SkincareTok", "#BeautyHacks", "#NaturalBeauty"],
    secondary: ["#DrugstoreBeauty", "#MakeupLook", "#BeautyProducts", "#AntiAging", "#GlowUpRoutine", "#BeautySecrets", "#ClearSkin", "#SelfCare", "#BeautyTips", "#MakeupInspo"],
    trending: ["#GRWM", "#GetReadyWithMe", "#SkincareCheck", "#DrugstoreDupe", "#BeautyTrend"],
    longTail: ["#AffordableSkincareRoutine", "#DrugstoreMakeupThatWorks", "#HowToGetClearSkinNaturally", "#AntiAgingSkincareOver30", "#BestDrugstoreDupes", "#MakeupForBeginners", "#SkincareForOilySkın"],
  },
  lifestyle: {
    primary: ["#LifestyleTok", "#DayInMyLife", "#MorningRoutine", "#SelfImprovement", "#PersonalGrowth", "#SlowLiving", "#MindsetShift", "#IntentionalLiving"],
    secondary: ["#Wellness", "#SelfCare", "#LifeHacks", "#HabitTok", "#Minimalism", "#PositiveMindset", "#GoodVibes", "#DailyRoutine", "#LifeGoals", "#Lifestyle"],
    trending: ["#Vlog", "#DayInMyLife", "#MorningVibes", "#SoftLife", "#Romanticize"],
    longTail: ["#HowToBuildBetterHabits", "#MorningRoutineForSuccess", "#SimpleLivingTips", "#MindsetHacksForSuccess", "#HowToBeMoreProductive", "#LifestyleChangesForBetterLife", "#SelfImprovementTips"],
  },
  food: {
    primary: ["#FoodTok", "#EasyRecipes", "#MealPrep", "#CookingHacks", "#FoodIdeas", "#QuickRecipes", "#HomeCooking", "#HealthyEating"],
    secondary: ["#FoodTikTok", "#MealIdeas", "#RecipeIdeas", "#CookingTips", "#FoodLover", "#FoodVideo", "#BudgetMeals", "#HighProteinMeals", "#Foodie", "#CookingInspiration"],
    trending: ["#FoodTrend", "#ViralRecipe", "#Mukbang", "#CookWithMe", "#WhatIEatInADay"],
    longTail: ["#EasyHighProteinMeals", "#MealPrepForBeginnersWeek", "#HealthyMealsOnABudget", "#5IngredientRecipes", "#QuickHealthyDinnerIdeas", "#LowCalorieMeals", "#BudgetFriendlyMealPrep"],
  },
  travel: {
    primary: ["#TravelTok", "#TravelHacks", "#HiddenGems", "#BudgetTravel", "#TravelTips", "#SoloTravel", "#TravelLife", "#Wanderlust"],
    secondary: ["#TravelBlogger", "#ExploreMore", "#AdventureTime", "#TravelVlog", "#TravelInspiration", "#TravelPhotography", "#BackpackerLife", "#RoadTrip", "#TravelGuide", "#TravelContent"],
    trending: ["#TravelWith", "#HiddenGem", "#TravelChallenge", "#TravelDiaries", "#TravelCreator"],
    longTail: ["#BudgetTravelTips2026", "#SoloTravelSafety", "#HiddenGemsInEurope", "#CheapFlightHacks", "#HowToTravelCheap", "#BestBudgetDestinations", "#BackpackingTipsForBeginners"],
  },
  gaming: {
    primary: ["#GamingTok", "#GamingTips", "#GamingLife", "#Gamer", "#GamersOfTikTok", "#Gaming", "#GameTips", "#VideoGames"],
    secondary: ["#GamingCommunity", "#TwitchStreamer", "#GameReview", "#PCGaming", "#ConsolGaming", "#FPS", "#BattleRoyale", "#RPG", "#GamingSetup", "#GameStreamer"],
    trending: ["#GamingMoments", "#ViralGamingClip", "#GameChallenge", "#ProGamer", "#NewGame"],
    longTail: ["#HowToImproveAimFPS", "#BestGamingSetupUnder500", "#GamingTipsForBeginners", "#HowToGetBetterAtFortnite", "#WarzoneTipsAndTricks", "#BestRPGGames2026", "#FreeGamesToPlayOnPC"],
  },
  education: {
    primary: ["#LearnOnTikTok", "#EduTok", "#DidYouKnow", "#Facts", "#MindBlown", "#LifeHack", "#LearningTikTok", "#Knowledge"],
    secondary: ["#StudyTips", "#Psychology", "#Science", "#History", "#FactsYouDidntKnow", "#EverydayScience", "#MathTips", "#LanguageLearning", "#AcademicTok", "#StudyMotivation"],
    trending: ["#LearnOnTikTok", "#MindBlown", "#FactsOnly", "#ThingsSchoolNeverTaughtYou", "#EduTok"],
    longTail: ["#ThingsSchoolNeverTaughtYou", "#FactsThatWillBlowYourMind", "#HowToStudyEffectively", "#BestMemoryTechniques", "#FunScienceFacts", "#PsychologyFactsAboutHumans", "#HistoryFactsYouNeverKnew"],
  },
  finance: {
    primary: ["#FinanceTok", "#MoneyTips", "#PersonalFinance", "#Investing", "#SavingMoney", "#FinancialFreedom", "#MoneyMindset", "#WealthBuilding"],
    secondary: ["#BudgetTips", "#InvestingTips", "#StockMarket", "#CryptoTips", "#DebtFreeJourney", "#FinancialLiteracy", "#MoneyManagement", "#RealEstate", "#RetirementPlanning", "#PassiveIncome"],
    trending: ["#MoneyTok", "#FinanceTok", "#StockTok", "#CryptoTok", "#WealthTok"],
    longTail: ["#HowToSaveMoneyFast", "#InvestingForBeginners2026", "#HowToGetOutOfDebt", "#BudgetingForBeginners", "#StockMarketForNewbies", "#FinancialFreedomTips", "#HowToInvestWithLittleMoney"],
  },
  fashion: {
    primary: ["#FashionTok", "#OOTD", "#StyleTips", "#OutfitIdeas", "#FashionTrends", "#FashionHacks", "#StyleInspo", "#Thrifting"],
    secondary: ["#FashionInspiration", "#OutfitOfTheDay", "#StreetStyle", "#CasualOutfits", "#ThriftFlip", "#BudgetFashion", "#FashionTips", "#CapsuleWardrobe", "#FashionContent", "#Outfit"],
    trending: ["#GRWM", "#OutfitCheck", "#StyleChallenge", "#FashionTrend", "#ThriftWithMe"],
    longTail: ["#AffordableFashionTips", "#HowToStyleAnOutfit", "#ThriftingHauls2026", "#BuildACapsuleWardrobe", "#CheapFashionHacks", "#OutfitIdeasForWomen", "#HowToFindYourPersonalStyle"],
  },
  health: {
    primary: ["#HealthTok", "#GutHealth", "#WellnessTok", "#HealthyHabits", "#MentalHealth", "#NaturalHealth", "#HolisticHealth", "#HealthTips"],
    secondary: ["#SleepTips", "#HormoneHealth", "#ImmuneBoost", "#AntiInflammation", "#MentalWellness", "#WellnessJourney", "#HealthyMindset", "#SelfCare", "#NutritionTips", "#HealthyLiving"],
    trending: ["#GutHealthTok", "#WellnessCheck", "#HealthHack", "#DoctorTok", "#HealthTrend"],
    longTail: ["#HowToImproveGutHealth", "#NaturalRemediesForSleep", "#AntiInflammatoryFoods", "#HowToReduceStressNaturally", "#HormoneHealthTips", "#BestSupplementsForWomen", "#HowToBoostImmuneSystem"],
  },
  relationships: {
    primary: ["#RelationshipTok", "#DatingTips", "#RelationshipAdvice", "#SelfLove", "#RedFlags", "#DatingLife", "#Relationships", "#LoveAdvice"],
    secondary: ["#AttachmentStyle", "#CoupleGoals", "#BreakupAdvice", "#SelfLoveTok", "#DatingRedFlags", "#RelationshipGoals", "#HealthyRelationship", "#LoveTok", "#CommunicationTips", "#SingleLife"],
    trending: ["#RedFlags", "#GreenFlags", "#RelationshipCheck", "#DatingTok", "#LoveTok"],
    longTail: ["#HowToKnowIfHeIsInterested", "#AttachmentStyleExplained", "#RedFlagsInARelationship", "#HowToSetBoundaries", "#HealingFromABreakup", "#DatingTipsForWomen", "#HowToAttractBetterPeople"],
  },
  entertainment: {
    primary: ["#EntertainmentTok", "#Storytime", "#PopCulture", "#Trending", "#Viral", "#Celebrity", "#MovieTok", "#TVTok"],
    secondary: ["#TikTokTrends", "#EntertainmentNews", "#BehindTheScenes", "#MovieReview", "#ShowRecommendations", "#PopCultureTok", "#CelebrityNews", "#Nostalgia", "#FandomTok", "#ReactionTok"],
    trending: ["#Storytime", "#WatchThis", "#FYP", "#ViralMoment", "#TrendingNow"],
    longTail: ["#BestMoviesToWatchOnNetflix", "#TVShowRecommendations2026", "#CelebGossip", "#UnderRatedMovies", "#BestNetflixSeries", "#ViralMomentBreakdown", "#PopCultureExplained"],
  },
};

const CONTENT_TYPE_TRENDING: Record<ContentType, string[]> = {
  educational: ["#LearnOnTikTok", "#EduTok", "#DidYouKnow", "#Facts"],
  entertaining: ["#Relatable", "#Funny", "#Comedy", "#Trending"],
  storytelling: ["#Storytime", "#PersonalStory", "#RealTalk", "#MyStory"],
  tutorial: ["#HowTo", "#Tutorial", "#StepByStep", "#DIY"],
  funny: ["#Relatable", "#Funny", "#Comedy", "#Humor"],
  pov: ["#POV", "#POVTikTok", "#Perspective", "#Relatable"],
};

// ─── Generation Engine ────────────────────────────────────────────────────────

function scoreTag(tag: string, topic: string, niche: Niche): number {
  let score = 60;
  const tagLower = tag.toLowerCase();
  const topicLower = topic.toLowerCase();
  const topicWords = topicLower.split(/\s+/);

  // Relevance to topic
  if (topicWords.some(w => w.length > 3 && tagLower.includes(w))) score += 20;

  // Niche alignment
  if (tagLower.includes(niche)) score += 10;

  // Length quality (not too short, not too long)
  const tagWord = tag.replace(/^#/, "");
  if (tagWord.length >= 8 && tagWord.length <= 25) score += 10;

  return Math.min(score, 99);
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildTopicTag(topic: string): string[] {
  const words = topic.trim().split(/\s+/).filter(w => w.length > 2);
  const tags: string[] = [];

  if (words.length === 1) {
    tags.push(`#${words[0].charAt(0).toUpperCase() + words[0].slice(1)}Tips`);
    tags.push(`#${words[0].charAt(0).toUpperCase() + words[0].slice(1)}Hack`);
  } else {
    const camel = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join("");
    tags.push(`#${camel}`);
    const joined = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    if (joined !== camel) tags.push(`#${joined}Tips`);
  }

  return tags;
}

function generateHashtags(
  topic: string,
  niche: Niche,
  audience: string,
  contentType: ContentType,
  keywords: string,
): HashtagSet {
  const nd = NICHE_HASHTAGS[niche];
  const contentTrending = CONTENT_TYPE_TRENDING[contentType];

  // Build topic-derived tags
  const topicTags = buildTopicTag(topic);

  // Primary: niche-specific + topic tags (5–8)
  const primaryPool = [...topicTags, ...nd.primary];
  const primaryTags = pickN(primaryPool, 6).map(tag => ({
    tag,
    score: scoreTag(tag, topic, niche),
    category: "primary" as const,
  }));

  // Secondary: broader (8–10)
  const secondaryTags = pickN(nd.secondary, 9).map(tag => ({
    tag,
    score: scoreTag(tag, topic, niche),
    category: "secondary" as const,
  }));

  // Trending: mix of niche trending + content-type trending (4–5)
  const trendPool = [...nd.trending, ...contentTrending];
  const trendingTags = pickN(trendPool, 4).map(tag => ({
    tag,
    score: scoreTag(tag, topic, niche),
    category: "trending" as const,
  }));

  // Long-tail: niche-specific low competition (5–6)
  const longTailPool = [...nd.longTail];
  if (keywords) {
    const kws = keywords.split(",").map(k => k.trim()).filter(Boolean);
    kws.forEach(kw => {
      const words = kw.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
      longTailPool.unshift(`#HowTo${words}`);
    });
  }
  const longTailTags = pickN(longTailPool, 6).map(tag => ({
    tag,
    score: scoreTag(tag, topic, niche),
    category: "long-tail" as const,
  }));

  const totalCount = primaryTags.length + trendingTags.length + longTailTags.length;

  const audienceStr = audience.trim() || `${niche} enthusiasts`;

  const strategyExplanation =
    `These hashtags are structured in four tiers to maximize your video's reach across TikTok's discovery systems. ` +
    `The primary hashtags (#${primaryTags[0]?.tag.replace("#", "") ?? ""}, ` +
    `#${primaryTags[1]?.tag.replace("#", "") ?? ""}) are highly niche-specific, ` +
    `signaling to TikTok's algorithm exactly what your video is about and which audience — ` +
    `${audienceStr} — it should be shown to. ` +
    `The secondary hashtags broaden distribution to related audiences without diluting your core relevance signal. ` +
    `The trending and format hashtags (${contentTrending.slice(0, 2).join(", ")}) align your video with ` +
    `content formats currently performing well on the For You Page, giving the algorithm additional ` +
    `context about your video's style. The long-tail hashtags target low-competition search queries — ` +
    `these are the hashtags your ideal viewer is actively searching, making them your best tool ` +
    `for search-based discovery as TikTok continues to function more like a search engine in 2026.`;

  const postingStrategy =
    `Use 5–8 hashtags total — this is TikTok's optimal range based on current algorithm behavior. ` +
    `More than 10 hashtags can dilute your relevance signal and reduce the algorithm's ability to ` +
    `categorize your content accurately. Recommended combination: 2–3 primary + 2–3 secondary + ` +
    `1 long-tail + 1 trending format tag. Place hashtags at the end of your caption rather than ` +
    `in the comment section — TikTok's algorithm reads caption hashtags before comment hashtags. ` +
    `Avoid using #FYP or #ForYouPage as your only hashtags — they are oversaturated and provide ` +
    `no audience-targeting value. Instead, let the niche-specific hashtags do the targeting, ` +
    `and use one format hashtag (like #${contentTrending[0]?.replace("#", "") ?? "Storytime"}) ` +
    `to signal your content style.`;

  return {
    primary: primaryTags,
    secondary: secondaryTags,
    trending: trendingTags,
    longTail: longTailTags,
    strategyExplanation,
    postingStrategy,
    totalCount,
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok Hashtag Generator?",
    a: "A TikTok Hashtag Generator is a free tool that creates a structured set of niche-specific, trend-aware hashtags for your TikTok videos based on your topic, niche, and content type. It produces four hashtag tiers — Primary (high relevance), Secondary (broader reach), Trending (format-based), and Long-Tail (low competition, search-optimized) — with an explanation of why each was chosen and how they improve your reach.",
  },
  {
    q: "How many hashtags should I use on TikTok?",
    a: "The optimal TikTok hashtag count in 2026 is 5–8 hashtags per video. Using too many hashtags (10+) dilutes your relevance signal and makes it harder for the algorithm to accurately categorize your content. Using too few (1–2) limits discoverability. The ideal combination is 2–3 niche-specific primary hashtags + 2–3 secondary hashtags + 1 long-tail search hashtag + 1 trending format tag. This tool automatically produces the optimal mix for your video.",
  },
  {
    q: "Do TikTok hashtags still work in 2026?",
    a: "Yes — but the strategy has evolved. TikTok now functions more like a search engine, so hashtags serve two purposes: (1) helping the algorithm understand and categorize your content so it shows it to the right audience, and (2) making your videos discoverable via TikTok Search. Generic hashtags like #FYP or #Viral alone no longer provide meaningful reach. Niche-specific hashtags (e.g., #FitnessTok, #FinanceTok) and long-tail search hashtags (e.g., #HowToSaveMoneyFast) are what drive real discoverability in 2026.",
  },
  {
    q: "Should I use #FYP or #ForYouPage on TikTok?",
    a: "Using #FYP or #ForYouPage as your primary hashtag strategy is ineffective in 2026. These tags are so oversaturated that they provide virtually no targeting value — they cannot help TikTok's algorithm understand what your content is about or who should see it. You can include them sparingly (maximum 1 per post) as a supplementary tag, but they should never be the foundation of your hashtag strategy. Niche and topic-specific hashtags are far more effective.",
  },
  {
    q: "What are long-tail hashtags on TikTok and why do they matter?",
    a: "Long-tail hashtags are specific, multi-word hashtags that match exactly what your target viewer is searching for — for example, #HowToLoseBellyFatFast or #BudgetMealPrepForBeginners. They have lower competition than broad hashtags, meaning your video is more likely to rank at the top for those specific searches. As TikTok Search grows more prominent, long-tail hashtags have become one of the most reliable ways to drive consistent, targeted views — especially for new accounts that can't yet compete on high-volume tags.",
  },
  {
    q: "What is the difference between primary, secondary, and trending hashtags?",
    a: "Primary hashtags are highly niche-specific tags that tell TikTok exactly what your video is about (e.g., #FitnessTok, #WorkoutTips). They are the algorithm's main categorization signal. Secondary hashtags are broader and extend your reach to related audiences without diluting relevance (e.g., #HealthyLifestyle, #Wellness). Trending hashtags are format or moment-based tags that align your video with currently popular content styles (e.g., #Storytime, #DayInMyLife) — these help the algorithm group your content with high-performing videos in the same style.",
  },
  {
    q: "How do TikTok hashtags affect the For You Page algorithm?",
    a: "TikTok's For You Page algorithm uses hashtags as one of several signals to determine your video's topic category and ideal audience. When you use relevant niche hashtags, you help the algorithm make an accurate categorization decision faster — which means your video gets distributed to the right viewers in the first distribution wave (typically the first 1–2 hours after posting). Faster categorization leads to better early engagement, which triggers broader FYP distribution. Irrelevant or overly generic hashtags slow this process, reducing your initial reach.",
  },
  {
    q: "How do I find trending TikTok hashtags for my niche?",
    a: "The best ways to find trending niche hashtags are: (1) TikTok's Discover tab — shows trending hashtags updated daily, (2) TikTok Search — type your niche keyword and look at the suggested hashtag results, (3) Competitor analysis — look at the hashtags used by top-performing videos in your niche, (4) This TikTok Hashtag Generator — which simulates niche-specific trend data to produce a ready-to-use hashtag set with trending format tags already included.",
  },
  {
    q: "Should I put hashtags in the caption or comments on TikTok?",
    a: "Place hashtags in your caption, not in the comments. TikTok's algorithm reads caption text (including hashtags) as part of video indexing before reading comments. Adding hashtags to comments means they may not be processed before your video's initial distribution window closes — which reduces their impact on reach. Keep your caption concise: one engaging sentence or question, followed by 5–8 well-chosen hashtags.",
  },
  {
    q: "Are these TikTok hashtag tools free to use?",
    a: "Yes — the TikTok Hashtag Generator on creatorsToolHub is 100% free with no account, subscription, or credit card required. You can generate hashtag sets for any niche and topic as many times as you need. Each generation produces a full four-tier hashtag strategy (primary, secondary, trending, long-tail) plus a posting strategy explanation — everything you need to optimize your TikTok discoverability instantly.",
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

// ─── Score Badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 85
    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
    : score >= 70
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md border ${cls}`}>{score}</span>
  );
}

// ─── Tag Chip ─────────────────────────────────────────────────────────────────

function TagChip({ item, onCopy, copied }: { item: TagItem; onCopy: (tag: string) => void; copied: boolean }) {
  return (
    <button
      onClick={() => onCopy(item.tag)}
      title="Click to copy"
      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
        copied
          ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
          : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100" />}
      {item.tag.replace("#", "")}
      <ScoreBadge score={item.score} />
    </button>
  );
}

// ─── Hashtag Group ────────────────────────────────────────────────────────────

type GroupConfig = {
  label: string;
  icon: string;
  desc: string;
  colorClass: string;
  borderClass: string;
  countLabel: string;
};

const GROUP_CONFIG: Record<string, GroupConfig> = {
  primary: {
    label: "Primary Hashtags",
    icon: "🎯",
    desc: "High-relevance, niche-specific — your core discoverability signal",
    colorClass: "bg-primary/10 text-primary border-primary/20",
    borderClass: "border-primary/30",
    countLabel: "5–8",
  },
  secondary: {
    label: "Secondary Hashtags",
    icon: "📡",
    desc: "Broader reach — extends your audience without diluting relevance",
    colorClass: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    borderClass: "border-blue-200 dark:border-blue-800",
    countLabel: "8–12",
  },
  trending: {
    label: "Trending / Format Hashtags",
    icon: "🔥",
    desc: "Format and moment-based — aligns your video with high-performing styles",
    colorClass: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    borderClass: "border-orange-200 dark:border-orange-800",
    countLabel: "3–5",
  },
  "long-tail": {
    label: "Long-Tail Hashtags",
    icon: "🔍",
    desc: "Low competition, search-optimized — targets viewers actively searching for your content",
    colorClass: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    borderClass: "border-green-200 dark:border-green-800",
    countLabel: "5–8",
  },
};

function HashtagGroup({
  groupKey,
  tags,
  onCopyTag,
  onCopyAll,
  copiedTag,
  copiedAll,
}: {
  groupKey: string;
  tags: TagItem[];
  onCopyTag: (tag: string) => void;
  onCopyAll: (tags: TagItem[]) => void;
  copiedTag: string | null;
  copiedAll: boolean;
}) {
  const cfg = GROUP_CONFIG[groupKey];
  return (
    <div className={`rounded-2xl border bg-card p-5 space-y-3 ${cfg.borderClass}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>{cfg.icon}</span>
          <div>
            <h3 className="font-bold text-foreground text-sm">{cfg.label}</h3>
            <p className="text-xs text-muted-foreground">{cfg.desc}</p>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.colorClass}`}>
            {tags.length}
          </span>
        </div>
        <button
          onClick={() => onCopyAll(tags)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
            copiedAll
              ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
          }`}
        >
          {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          Copy All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((item) => (
          <TagChip
            key={item.tag}
            item={item}
            onCopy={onCopyTag}
            copied={copiedTag === item.tag}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "fitness", label: "Fitness", emoji: "💪" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "tech", label: "Tech / AI", emoji: "🤖" },
  { value: "beauty", label: "Beauty", emoji: "💄" },
  { value: "lifestyle", label: "Lifestyle", emoji: "✨" },
  { value: "food", label: "Food", emoji: "🍕" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "fashion", label: "Fashion", emoji: "👗" },
  { value: "health", label: "Health", emoji: "🏥" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
];

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "educational", label: "Educational" },
  { value: "entertaining", label: "Entertaining" },
  { value: "storytelling", label: "Storytelling" },
  { value: "tutorial", label: "Tutorial" },
  { value: "funny", label: "Funny / Comedy" },
  { value: "pov", label: "POV" },
];

export function TikTokHashtagGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState<Niche>("fitness");
  const [audience, setAudience] = useState("");
  const [contentType, setContentType] = useState<ContentType>("educational");
  const [keywords, setKeywords] = useState("");

  const [result, setResult] = useState<HashtagSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedGroupKey, setCopiedGroupKey] = useState<string | null>(null);
  const [copiedAllTags, setCopiedAllTags] = useState(false);
  const [activeTab, setActiveTab] = useState<"hashtags" | "strategy">("hashtags");

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tt-hashtag-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = useCallback((regen = false) => {
    if (!topic.trim()) {
      toast({ title: "Video topic required", description: "Enter your video topic or main keyword.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const res = generateHashtags(topic, niche, audience, contentType, keywords);
      setResult(res);
      setIsGenerating(false);
      setActiveTab("hashtags");
      if (!regen) {
        setTimeout(() => document.getElementById("hashtag-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }, 420);
  }, [topic, niche, audience, contentType, keywords, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const copyGroup = (tags: TagItem[], groupKey: string) => {
    navigator.clipboard.writeText(tags.map(t => t.tag).join(" "));
    setCopiedGroupKey(groupKey);
    toast({ title: "Hashtags copied!", description: `${tags.length} hashtags copied to clipboard.`, duration: 2000 });
    setTimeout(() => setCopiedGroupKey(null), 2500);
  };

  const copyAllHashtags = () => {
    if (!result) return;
    const recommended = [
      ...result.primary.slice(0, 3),
      ...result.secondary.slice(0, 2),
      result.longTail[0],
      result.trending[0],
    ].filter(Boolean).map(t => t!.tag);
    navigator.clipboard.writeText(recommended.join(" "));
    setCopiedAllTags(true);
    toast({ title: "Optimal set copied!", description: "7 best hashtags copied to clipboard.", duration: 2500 });
    setTimeout(() => setCopiedAllTags(false), 2500);
  };

  const allHashtagsText = result
    ? [...result.primary, ...result.secondary, ...result.trending, ...result.longTail].map(t => t.tag).join(" ")
    : "";

  return (
    <>
      {/* ── Input Card ──────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Video Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Video Topic <span className="text-red-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. how to lose belly fat, AI tools for productivity, beginner makeup tutorial"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                required
              />
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Niche <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNiche(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                      niche === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span>{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type + Target Audience row */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Type</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setContentType(value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        contentType === value
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
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Target Audience <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. beginners, entrepreneurs, women over 30"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Additional Keywords <span className="text-muted-foreground font-normal normal-case">(optional — comma separated)</span>
              </label>
              <Input
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="e.g. morning routine, fat loss, meal prep"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={isGenerating}
              className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20"
            >
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Hashtags...</>
                : <><Hash className="w-5 h-5" /> Generate TikTok Hashtags</>
              }
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────── */}
      {result && (
        <section id="hashtag-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Header + tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Your TikTok Hashtags
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5 capitalize">
                {result.primary.length + result.secondary.length + result.trending.length + result.longTail.length} hashtags across 4 tiers • <span className="font-semibold text-foreground">{niche}</span> niche
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["hashtags", "strategy"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase tracking-wide ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {tab === "hashtags" ? "🏷️ Hashtags" : "📋 Strategy"}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold">
                <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Quick Copy Banner */}
          {activeTab === "hashtags" && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">⚡ Optimal Set (7 hashtags — ready to paste)</p>
                <p className="text-xs text-muted-foreground mt-0.5">2 primary + 2 secondary + 1 long-tail + 1 trending — the ideal TikTok combination</p>
              </div>
              <button
                onClick={copyAllHashtags}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border transition-all ${
                  copiedAllTags
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-primary text-primary-foreground border-primary hover:opacity-90"
                }`}
              >
                {copiedAllTags ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedAllTags ? "Copied!" : "Copy Optimal Set"}
              </button>
            </div>
          )}

          {/* Hashtags Tab */}
          {activeTab === "hashtags" && (
            <div className="space-y-4">
              <HashtagGroup
                groupKey="primary"
                tags={result.primary}
                onCopyTag={copyTag}
                onCopyAll={(tags) => copyGroup(tags, "primary")}
                copiedTag={copiedTag}
                copiedAll={copiedGroupKey === "primary"}
              />
              <HashtagGroup
                groupKey="secondary"
                tags={result.secondary}
                onCopyTag={copyTag}
                onCopyAll={(tags) => copyGroup(tags, "secondary")}
                copiedTag={copiedTag}
                copiedAll={copiedGroupKey === "secondary"}
              />
              <HashtagGroup
                groupKey="trending"
                tags={result.trending}
                onCopyTag={copyTag}
                onCopyAll={(tags) => copyGroup(tags, "trending")}
                copiedTag={copiedTag}
                copiedAll={copiedGroupKey === "trending"}
              />
              <HashtagGroup
                groupKey="long-tail"
                tags={result.longTail}
                onCopyTag={copyTag}
                onCopyAll={(tags) => copyGroup(tags, "long-tail")}
                copiedTag={copiedTag}
                copiedAll={copiedGroupKey === "long-tail"}
              />
            </div>
          )}

          {/* Strategy Tab */}
          {activeTab === "strategy" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">Hashtag Strategy Explanation</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.strategyExplanation}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">Posting Strategy</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.postingStrategy}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">📋 All Hashtags (Copy Everything)</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(allHashtagsText);
                      toast({ title: "All hashtags copied!", duration: 2000 });
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border bg-card border-border hover:border-primary/50 hover:text-primary transition-all"
                  >
                    <Copy className="w-3 h-3" /> Copy All
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words">{allHashtagsText}</p>
              </div>
            </div>
          )}

          {/* Score legend */}
          <div className="flex items-center gap-4 flex-wrap px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide">Relevance Score:</span>
            {[
              { range: "85+", color: "bg-green-500", label: "Highly Relevant" },
              { range: "70–84", color: "bg-primary", label: "Relevant" },
              { range: "60–69", color: "bg-yellow-500", label: "Moderately Relevant" },
            ].map(s => (
              <span key={s.range} className="flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.range} {s.label}
              </span>
            ))}
            <span className="ml-auto">Click any hashtag to copy it</span>
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Hashtag Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Video Topic", desc: "Type your video topic or main keyword — for example, 'how to lose belly fat,' 'AI tools for productivity,' or 'beginner makeup tutorial.' This is the foundation the generator uses to build topic-specific hashtags." },
            { step: 2, title: "Select Your Niche and Content Type", desc: "Choose your TikTok niche (fitness, business, beauty, etc.) and content style (tutorial, storytelling, POV). These inputs shape the niche-specific primary hashtags and the trending format hashtags included in your set." },
            { step: 3, title: "Generate Your Hashtag Set", desc: "Click Generate and the tool instantly creates a four-tier hashtag strategy — Primary, Secondary, Trending, and Long-Tail — tailored to your video topic and niche, with a relevance score for each hashtag." },
            { step: 4, title: "Copy and Paste to TikTok", desc: "Use 'Copy Optimal Set' to grab the ideal 7-hashtag combination in one click, or copy individual hashtags or entire tiers. Switch to the Strategy tab for a full explanation of why each hashtag was chosen and how to post them." },
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

      {/* ── About This Tool ──────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Hashtag Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This TikTok Hashtag Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free TikTok Hashtag Generator builds a four-tier hashtag strategy for your video
              using niche-specific data, content-type signals, and search behavior patterns. The four
              tiers work together as a complete discoverability system: Primary hashtags (5–8 niche-specific
              tags) signal to TikTok's algorithm exactly what your content is about and who should see it.
              Secondary hashtags (8–12 broader tags) extend your reach to related audiences without
              diluting relevance. Trending / Format hashtags (3–5 tags) align your video with currently
              high-performing content styles — like #Storytime, #Tutorial, or #POV — giving the algorithm
              additional behavioral context. Long-Tail hashtags (5–8 specific, low-competition tags) target
              viewers who are actively searching for your exact topic via TikTok Search. Every hashtag is
              scored for relevance (0–100) based on alignment with your topic, niche specificity, and
              length quality. A "Copy Optimal Set" button delivers the ideal 7-hashtag combination in
              one click — ready to paste directly into your caption.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why TikTok Hashtags Matter for Your Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              TikTok's algorithm has evolved significantly — in 2026, the platform functions increasingly
              like a search engine alongside its For You Page recommendation system. This means hashtags
              now serve two distinct purposes: helping the algorithm categorize your video for FYP
              distribution, and making your content discoverable through TikTok Search. A video posted
              with well-chosen niche hashtags gets categorized faster in the algorithm's initial
              distribution wave (typically the first 1–2 hours after posting), which leads to better
              early engagement signals, which in turn triggers broader FYP distribution to new audiences.
              Long-tail hashtags create a compounding discovery effect — videos that rank at the top of
              specific search queries continue to receive views weeks and months after posting, long after
              the initial FYP push fades. Creators who use both niche hashtags (for FYP categorization)
              and long-tail hashtags (for sustained search traffic) consistently outperform those using
              only generic trending tags like #FYP or #Viral. The difference is not just in immediate
              reach — it's in the long-term discoverability that compounds into consistent channel growth.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This TikTok Hashtag Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "14 niches with niche-specific hashtag databases tailored to each content category",
                "Four-tier strategy: Primary, Secondary, Trending, and Long-Tail hashtags per video",
                "Relevance scoring (0–100) for every hashtag — see which tags are worth using",
                "Content-type matching: hashtags adjusted for tutorial, storytelling, POV, and more",
                "'Copy Optimal Set' gives you the ideal 7-hashtag combination in one click",
                "Strategy tab explains why each hashtag was chosen and how to post them",
                "Long-tail hashtags optimized for TikTok Search — the fastest-growing discovery channel",
                "Topic-derived hashtags generated from your exact video keyword",
                "Format-aware trending hashtags that align your video with high-performing styles",
                "100% free — no account, no signup, no limits — generate unlimited hashtag sets",
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

      {/* ── Related TikTok Tools ────────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related TikTok Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "TikTok Caption Generator", path: "/tools/tiktok-caption-generator", desc: "Write captions that pair perfectly with your hashtag strategy to maximize reach and drive more comments." },
            { name: "TikTok Hook Generator", path: "/tools/tiktok-hook-generator", desc: "Craft opening lines that stop the scroll — combine great hooks with targeted hashtags for explosive growth." },
            { name: "TikTok Bio Generator", path: "/tools/tiktok-bio-generator", desc: "Build a compelling profile that converts visitors who discover you through your hashtagged content." },
            { name: "TikTok Viral Idea Generator", path: "/tools/tiktok-viral-idea-generator", desc: "Get trending content concepts to create videos worth hashtagging — viral ideas that deserve viral tags." },
          ].map(({ name, path, desc }) => (
            <a key={path} href={path} className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
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
