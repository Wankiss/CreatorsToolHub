import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Lightbulb, Copy, Check, RefreshCw, ChevronDown, Sparkles, Loader2,
  TrendingUp, Zap, Shield, ListChecks, Search, Flame, Target, Clock,
} from "lucide-react";

// ─── Data Engine ─────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "business" | "tech" | "lifestyle" | "fashion"
  | "food" | "travel" | "gaming" | "education" | "finance"
  | "beauty" | "health" | "relationships" | "entertainment";

type ContentGoal = "grow" | "engagement" | "sales" | "brand" | "entertain" | "educate";
type ContentStyle = "storytelling" | "educational" | "funny" | "faceless" | "talking-head" | "pov" | "tutorial" | "before-after";

export interface ViralIdea {
  title: string;
  concept: string;
  hook: string;
  format: string;
  whyViral: string;
  hookVariations: string[];
  angles: { emotional: string; curiosity: string; relatability: string };
  execution: { length: string; pacing: string; posting: string };
  caption: string;
  hashtags: string[];
  viralScore: number;
}

export interface IdeaOutput {
  trendSummary: string[];
  ideas: ViralIdea[];
}

// ─── Niche Configuration ─────────────────────────────────────────────────────

const NICHE_DATA: Record<Niche, {
  trends: string[];
  topics: string[];
  hashtags: string[];
  painPoints: string[];
}> = {
  fitness: {
    trends: [
      "Authentic 'real body' workouts outperform polished gym content by 3× on the FYP",
      "Short 15–30s exercise clips with on-screen reps/sets counters are dominating saves",
      "'I tried this for 7 days' transformation content is getting massive watch time in 2026",
    ],
    topics: ["workout routine", "fat loss", "muscle gain", "home gym", "nutrition hack", "morning routine", "gym mistake", "protein hack", "cardio shortcut", "rest day"],
    hashtags: ["#FitnessMotivation", "#WorkoutTips", "#FitnessHack", "#GymLife", "#HealthyLifestyle", "#FitTok", "#WeightLoss", "#HomeworkOut", "#BodyTransformation", "#FitnessJourney"],
    painPoints: ["never seeing results", "not knowing where to start", "wasting time at the gym", "eating right but not losing weight"],
  },
  business: {
    trends: [
      "Founder 'behind-the-scenes' content drives 5× more engagement than polished brand videos",
      "'Day in my life as a [job]' format is the top-growing content category for business niches",
      "Failure storytelling outperforms success storytelling — authenticity is the new authority",
    ],
    topics: ["starting a business", "passive income", "side hustle", "business mistake", "entrepreneur morning", "client win", "revenue reveal", "freelancing", "dropshipping", "cold email"],
    hashtags: ["#EntrepreneurLife", "#BusinessTips", "#SideHustle", "#MakeMoneyOnline", "#StartupLife", "#BusinessMindset", "#Entrepreneur", "#SmallBusiness", "#PassiveIncome", "#BusinessTok"],
    painPoints: ["not knowing where to start", "fear of failure", "making money online myths", "wasting money on bad advice"],
  },
  tech: {
    trends: [
      "AI tool tutorials are the #1 trending format in tech — 'I replaced my whole workflow with AI' hooks are converting",
      "Reaction-style content ('I tested X so you don't have to') is driving high saves and shares",
      "Tech for non-tech people — simplifying complex tools is a massive untapped opportunity",
    ],
    topics: ["AI tool", "productivity hack", "app nobody knows", "coding shortcut", "tech secret", "software tutorial", "gadget review", "automation tool", "ChatGPT trick", "free tool"],
    hashtags: ["#TechTok", "#AITools", "#ProductivityHacks", "#TechTips", "#ChatGPT", "#ArtificialIntelligence", "#TechLife", "#Coding", "#FutureTech", "#SoftwareTips"],
    painPoints: ["too many tools and not knowing which to use", "wasting time on manual tasks", "being left behind by AI", "paying for things you can get free"],
  },
  lifestyle: {
    trends: [
      "'Soft life' and intentional living content is dominating lifestyle saves in 2026",
      "Morning and evening routine videos with aesthetic transitions are getting massive completion rates",
      "Honest 'what nobody tells you' lifestyle content is outperforming aspirational content",
    ],
    topics: ["morning routine", "evening wind-down", "slow living", "habit change", "minimalism", "life reset", "self-improvement", "daily routine", "mindset shift", "life organization"],
    hashtags: ["#LifestyleTok", "#MorningRoutine", "#SelfImprovement", "#SlowLiving", "#DailyRoutine", "#MindsetShift", "#LifeStyle", "#PersonalGrowth", "#HabitTok", "#Wellness"],
    painPoints: ["feeling overwhelmed", "lack of motivation", "not knowing how to change habits", "comparison to others"],
  },
  fashion: {
    trends: [
      "Outfit-of-the-day videos with 'get ready with me' format are driving record saves",
      "Budget fashion content — high-fashion looks for under $50 — is the fastest-growing format",
      "Honest brand review and 'is it worth it?' content is dominating the fashion FYP",
    ],
    topics: ["outfit idea", "fashion hack", "style mistake", "budget look", "trending outfit", "wardrobe essential", "thrift flip", "capsule wardrobe", "style tip", "fashion secret"],
    hashtags: ["#FashionTok", "#OOTD", "#StyleTips", "#FashionHacks", "#OutfitIdeas", "#Thrifting", "#StyleInspo", "#FashionTrends", "#GRWM", "#BudgetFashion"],
    painPoints: ["not knowing how to style outfits", "overspending on clothes", "not knowing current trends", "feeling unconfident about personal style"],
  },
  food: {
    trends: [
      "3-ingredient 'lazy but delicious' recipe content is getting massive saves in 2026",
      "Honest restaurant and product reviews with unfiltered opinions are outperforming polished cooking videos",
      "High-protein, low-calorie meals presented in under 30 seconds are dominating food saves",
    ],
    topics: ["easy recipe", "meal prep", "kitchen hack", "restaurant secret", "cooking mistake", "protein meal", "budget meal", "5-minute dinner", "food combination", "cooking shortcut"],
    hashtags: ["#FoodTok", "#EasyRecipes", "#MealPrep", "#CookingHacks", "#FoodIdeas", "#HealthyEating", "#FoodTikTok", "#QuickRecipes", "#MealIdeas", "#HomeCooking"],
    painPoints: ["not knowing what to cook", "wasting groceries", "spending too much on food", "struggling to eat healthy on a budget"],
  },
  travel: {
    trends: [
      "'Hidden gem' destination reveals are the top-shared travel content in 2026",
      "Budget travel 'how I did this for $X' content is dominating engagement over luxury travel",
      "Travel mistake and warning content consistently outperforms aspirational travel videos",
    ],
    topics: ["hidden destination", "budget travel hack", "travel mistake", "packing secret", "cheap flight", "solo travel", "travel safety", "travel scam warning", "off-the-beaten-path", "travel planning"],
    hashtags: ["#TravelTok", "#TravelHacks", "#BudgetTravel", "#HiddenGems", "#TravelTips", "#SoloTravel", "#TravelLife", "#AdventureTime", "#TravelBlogger", "#ExploreMore"],
    painPoints: ["travel being too expensive", "being scammed abroad", "not knowing where to travel next", "not knowing how to plan a trip"],
  },
  gaming: {
    trends: [
      "'Unranked to ranked' challenge content is producing the highest engagement rates in gaming",
      "Viral in-game moments with 'I can't believe this happened' hooks are driving massive shares",
      "Gaming tip content for casual players — 'the trick 99% of players don't know' — is a top-growing format",
    ],
    topics: ["gaming secret", "hidden trick", "beginner mistake", "pro strategy", "game hack", "challenge run", "viral moment", "fps tip", "battle royale strategy", "game tier list"],
    hashtags: ["#GamingTok", "#GamingTips", "#Gamer", "#GamersOfTikTok", "#GamingLife", "#GameTips", "#TwitchStreamer", "#Gaming", "#VideoGames", "#GamingCommunity"],
    painPoints: ["not improving despite playing for hours", "losing to hackers/cheaters", "not knowing advanced strategies", "being stuck at the same rank"],
  },
  education: {
    trends: [
      "Micro-learning content — one fact, skill, or concept per video — is dominating education saves",
      "'Things school never taught you' content consistently goes viral regardless of the specific topic",
      "Visual explainer videos with fast-paced editing and text overlays are outperforming talking-head lecture style",
    ],
    topics: ["fact nobody knows", "school lie exposed", "history secret", "psychology trick", "learning hack", "memory technique", "study shortcut", "life skill", "science fact", "mental model"],
    hashtags: ["#LearnOnTikTok", "#DidYouKnow", "#EduTok", "#LearningTikTok", "#MindBlown", "#Facts", "#Psychology", "#StudyTips", "#Knowledge", "#EverydayScience"],
    painPoints: ["feeling like they wasted years in school", "wanting to learn but not knowing where to start", "information overload", "forgetting what they learn"],
  },
  finance: {
    trends: [
      "'I went from broke to saving $X' narrative storytelling content is driving massive reshares",
      "Money mistake confession content — 'I lost $X doing this' — gets huge engagement because of emotional resonance",
      "Simple personal finance explained in under 60 seconds is the fastest-growing finance format on TikTok",
    ],
    topics: ["money mistake", "investing tip", "savings hack", "debt payoff", "budget strategy", "passive income", "stock tip", "credit score hack", "financial freedom", "wealth building"],
    hashtags: ["#FinanceTok", "#MoneyTips", "#PersonalFinance", "#Investing", "#SavingMoney", "#FinancialFreedom", "#MoneyMindset", "#BudgetTips", "#WealthBuilding", "#InvestingTips"],
    painPoints: ["living paycheck to paycheck", "not knowing how to invest", "fear of making wrong money decisions", "feeling behind financially compared to peers"],
  },
  beauty: {
    trends: [
      "'Get ready with me' with honest product reviews embedded mid-routine is the top beauty format in 2026",
      "Skincare 'what I stopped doing' content is getting significantly higher saves than 'what I started doing'",
      "Drugstore vs high-end product comparisons are driving the highest comment counts in beauty",
    ],
    topics: ["skincare routine", "makeup hack", "drugstore dupe", "beauty mistake", "anti-aging tip", "glow-up secret", "affordable beauty", "viral product review", "beauty myth debunked", "quick glam"],
    hashtags: ["#BeautyTok", "#SkincareTok", "#MakeupTips", "#GlowUp", "#SkincareRoutine", "#BeautyHacks", "#MakeupTutorial", "#DrugstoreBeauty", "#Skincare", "#NaturalBeauty"],
    painPoints: ["wasting money on products that don't work", "skin issues that won't go away", "not knowing correct skincare order", "wanting to look good without spending a lot"],
  },
  health: {
    trends: [
      "Gut health and inflammation content is the #1 growing health topic on TikTok in 2026",
      "'Doctors won't tell you this' health content drives massive engagement — controversy + value is the formula",
      "Simple habit content ('I did X every day for 30 days') with visible results is dominating health saves",
    ],
    topics: ["gut health", "inflammation food", "sleep hack", "mental health tip", "stress reduction", "hormone health", "immune boost", "health myth", "doctor secret", "longevity habit"],
    hashtags: ["#HealthTok", "#GutHealth", "#WellnessTok", "#HealthTips", "#MentalHealth", "#SleepTips", "#HealthyHabits", "#HolisticHealth", "#WellnessJourney", "#NaturalHealth"],
    painPoints: ["chronic fatigue with no explanation", "not sleeping well despite trying everything", "inflammation and bloating", "feeling worse despite trying to be healthy"],
  },
  relationships: {
    trends: [
      "'Red flag' and 'green flag' content consistently gets the highest comment rates in relationships",
      "Breakup recovery storytelling content is producing viral moments — vulnerability converts",
      "Dating advice from a psychology lens — explaining the 'why' behind behavior — is dominating saves",
    ],
    topics: ["red flag warning", "relationship mistake", "dating tip", "attachment style", "communication hack", "breakup recovery", "love language", "toxic trait", "relationship standard", "self-love tip"],
    hashtags: ["#RelationshipTok", "#DatingTips", "#RelationshipAdvice", "#RedFlags", "#SelfLove", "#DatingLife", "#Relationships", "#CoupleGoals", "#AttachmentStyle", "#LoveAdvice"],
    painPoints: ["attracting the wrong people", "repeating the same relationship mistakes", "not knowing how to communicate needs", "fear of being single vs fear of wrong relationship"],
  },
  entertainment: {
    trends: [
      "Reaction content and commentary on viral moments is producing the highest share rates in entertainment",
      "'Storytime' with unexpected plot twists is driving the highest completion rates in the category",
      "Ranking content — 'ranking every X from worst to best' — is a consistent FYP driver",
    ],
    topics: ["celebrity story", "viral moment reaction", "movie ranking", "conspiracy theory", "behind the scenes", "shocking fact", "nostalgia throwback", "plot twist story", "pop culture take", "reality TV analysis"],
    hashtags: ["#EntertainmentTok", "#Storytime", "#PopCulture", "#Celebrity", "#Viral", "#Trending", "#MovieTok", "#TikTokTrends", "#EntertainmentNews", "#FYP"],
    painPoints: ["missing context on viral moments", "wanting inside knowledge", "boredom", "keeping up with pop culture"],
  },
};

// ─── Viral Format Templates ───────────────────────────────────────────────────

type ViralFormat = "youre-doing-it-wrong" | "nobody-tells-you" | "before-after" | "storytime" | "trend-remix";

function getFormatName(f: ViralFormat): string {
  const map: Record<ViralFormat, string> = {
    "youre-doing-it-wrong": "You're Doing It Wrong",
    "nobody-tells-you": "Nobody Tells You This",
    "before-after": "Before / After Transformation",
    "storytime": "Storytime / Personal Experience",
    "trend-remix": "Trend Remix",
  };
  return map[f];
}

function buildIdea(
  niche: Niche,
  topic: string,
  format: ViralFormat,
  goal: ContentGoal,
  style: ContentStyle,
  audience: string,
): ViralIdea {
  const nd = NICHE_DATA[niche];
  const audienceStr = audience.trim() || "people interested in " + niche;
  const topicCap = topic.charAt(0).toUpperCase() + topic.slice(1);
  const goalMap: Record<ContentGoal, string> = {
    grow: "follower growth",
    engagement: "high engagement",
    sales: "product/service sales",
    brand: "brand awareness",
    entertain: "entertainment value",
    educate: "educational value",
  };
  const goalLabel = goalMap[goal];

  let title = "";
  let concept = "";
  let hook = "";
  let whyViral = "";
  let hookVariations: string[] = [];
  let emotional = "";
  let curiosity = "";
  let relatability = "";
  let caption = "";
  let length = "";
  let pacing = "";

  switch (format) {
    case "youre-doing-it-wrong":
      title = `You're Doing ${topicCap} Wrong — Here's the Fix`;
      concept = `Call out the single most common ${topic} mistake your audience makes, then show the correct approach. The gap between what people do and what actually works creates instant engagement.`;
      hook = `Stop. You're doing ${topic} completely wrong.`;
      whyViral = `"You're doing it wrong" content triggers a defensive emotional response that forces viewers to keep watching to find out if they're guilty. High completion rate + comment bait ("I do this…") = algorithm push.`;
      hookVariations = [
        `The way you're doing ${topic} is actually hurting you.`,
        `99% of people doing ${topic} are making this mistake.`,
        `I was doing ${topic} wrong for years until I found this.`,
        `Stop what you're doing — this ${topic} mistake is costing you.`,
      ];
      emotional = `Fear of wasted effort — "Am I doing this wrong too?"`;
      curiosity = `What's the wrong way? And what's the right way?`;
      relatability = `Everyone has made the beginner mistake you're exposing.`;
      caption = `Most ${audienceStr} get this wrong. Save this before you make the same mistake. 💡 Comment if this was you 👇`;
      length = "15–30 seconds";
      pacing = "Fast cuts, text overlay on the mistake, then slow reveal of the correct approach";
      break;

    case "nobody-tells-you":
      title = `The ${topicCap} Secret Nobody Tells You`;
      concept = `Share one non-obvious insight about ${topic} that most people in your niche overlook or hide. Position it as insider knowledge that only experienced practitioners know.`;
      hook = `Nobody in the ${niche} space talks about this ${topic} secret.`;
      whyViral = `Information asymmetry is a powerful psychological trigger. When content promises hidden knowledge, viewers must watch to the end to receive it. High saves + "sending this to my friend" shares are the result.`;
      hookVariations = [
        `This ${topic} information is being kept from you.`,
        `I wish someone told me this about ${topic} earlier.`,
        `The ${topic} truth nobody in this niche wants you to know.`,
        `This changed how I think about ${topic} completely.`,
      ];
      emotional = `Excitement of accessing exclusive information`;
      curiosity = `What's the secret? Is it something I've suspected?`;
      relatability = `"I've wondered about this but never had answers"`;
      caption = `I had to share this. The ${topic} secret that took me way too long to figure out. Save for later. 🔑`;
      length = "20–45 seconds";
      pacing = "Slow build-up, pause before the reveal, fast delivery of the insight";
      break;

    case "before-after":
      title = `${topicCap}: My Before and After (Honest Results)`;
      concept = `Document a genuine transformation story related to ${topic} — show a clear before state, the process in fast-forward, and an undeniable after result. Authenticity over polish.`;
      hook = `Here's what ${topic} looked like for me 30 days ago vs today.`;
      whyViral = `Before/After content satisfies the viewer's curiosity in a visually satisfying way. High completion rates because the brain wants to see the resolution. Strong save rate from ${audienceStr} who want to replicate the result.`;
      hookVariations = [
        `I did ${topic} every day for 30 days. Here's what happened.`,
        `Comparing my ${topic} results: week 1 vs week 4.`,
        `This is what ${topic} actually looks like over time.`,
        `The ${topic} transformation nobody is being honest about.`,
      ];
      emotional = `Hope — "If they did it, I can too"`;
      curiosity = `What does the after actually look like?`;
      relatability = `Starting from a place most of your audience recognizes`;
      caption = `Documenting my honest ${topic} journey. Not everything went perfectly but the results speak for themselves. 📊 Save this if you're starting too.`;
      length = "20–60 seconds";
      pacing = "Tight montage for the process, longer hold on the reveal moment";
      break;

    case "storytime":
      title = `The Day ${topicCap} Changed Everything for Me`;
      concept = `Tell a personal story about a pivotal moment related to ${topic}. Include a conflict, a turning point, and a resolution that delivers value to the viewer. Structure it like a mini-movie.`;
      hook = `I'll never forget the moment ${topic} changed my life.`;
      whyViral = `Storytelling triggers mirror neurons — viewers emotionally experience your story as their own. This creates the deepest connection possible with an audience and drives the highest follow rates of any content format.`;
      hookVariations = [
        `This happened to me last ${topic === "fitness" ? "gym session" : "week"} and I'm still thinking about it.`,
        `I almost gave up on ${topic}. Then this happened.`,
        `The ${topic} mistake that cost me everything — and what I learned.`,
        `I was in the worst ${topic} situation of my life when something shifted.`,
      ];
      emotional = `Empathy and shared experience — "I've felt this too"`;
      curiosity = `What happened? How did it resolve?`;
      relatability = `The struggle before the breakthrough is universal`;
      caption = `This is the ${topic} story I've never told publicly. Part 2 coming if this hits 1K likes. 💬 Tell me your story below.`;
      length = "30–60 seconds";
      pacing = "Slower intro to set the scene, fast middle, emotional pause at the turning point";
      break;

    case "trend-remix":
      title = `Day in My Life: ${topicCap} Edition`;
      concept = `Apply the 'day in my life' trend format to your ${niche} niche. Show your authentic daily routine through the lens of ${topic} — make it specific, honest, and unfiltered. Include one surprising or controversial moment.`;
      hook = `This is what a real day doing ${topic} actually looks like.`;
      whyViral = `'Day in my life' content combined with a niche-specific angle is currently the top-growing format on TikTok. Authenticity wins over polish. The candid moments drive the most comments and follows.`;
      hookVariations = [
        `Come spend the day with me doing ${topic} — unfiltered.`,
        `A realistic day in my life: ${topic} version.`,
        `What nobody shows you about a day focused on ${topic}.`,
        `This is what my actual ${topic} day looks like (not what you'd expect).`,
      ];
      emotional = `Connection and aspiration — "I want this life"`;
      curiosity = `What does their day actually look like?`;
      relatability = `Unfiltered moments everyone recognizes from their own experience`;
      caption = `A real, unfiltered day doing ${topic}. Follow to see more of this 📱 Comment the part that surprised you most 👇`;
      length = "30–60 seconds";
      pacing = "Quick scene cuts every 2–3 seconds, text overlay for context, one slow reflective moment";
      break;
  }

  const posting = goal === "grow"
    ? "Post at peak hours (6–9am, 12–2pm, 7–10pm). Consistency over frequency."
    : goal === "engagement"
    ? "Post when your audience is most active. Add a controversial or open-ended question in the caption."
    : goal === "sales"
    ? "Post 3–4 days before any promotions. Use this as a trust-building precursor to your offer."
    : "Post consistently — minimum 4× per week for algorithm momentum.";

  const hashtags = nd.hashtags.slice(0, 5);

  const viralScore = 80 + Math.floor(Math.random() * 15);

  return {
    title,
    concept,
    hook,
    format: getFormatName(format),
    whyViral,
    hookVariations,
    angles: { emotional, curiosity, relatability },
    execution: { length, pacing, posting },
    caption,
    hashtags,
    viralScore,
  };
}

const FORMATS: ViralFormat[] = [
  "youre-doing-it-wrong",
  "nobody-tells-you",
  "before-after",
  "storytime",
  "trend-remix",
];

export function generateViralIdeas(
  niche: Niche,
  audience: string,
  goal: ContentGoal,
  style: ContentStyle,
  count: number,
): IdeaOutput {
  const nd = NICHE_DATA[niche];
  const ideas: ViralIdea[] = [];
  const usedTopics = new Set<string>();

  for (let i = 0; i < count; i++) {
    const format = FORMATS[i % FORMATS.length];
    let topic: string;
    do {
      topic = nd.topics[Math.floor(Math.random() * nd.topics.length)];
    } while (usedTopics.has(topic) && usedTopics.size < nd.topics.length);
    usedTopics.add(topic);
    ideas.push(buildIdea(niche, topic, format, goal, style, audience));
  }

  return { trendSummary: nd.trends, ideas };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok Viral Idea Generator?",
    a: "A TikTok Viral Idea Generator is a free tool that creates trend-aligned, niche-specific video concepts for TikTok based on your content niche, target audience, and content goal. It applies proven viral format patterns — like 'You're Doing It Wrong,' 'Nobody Tells You This,' and Before/After — to generate scroll-stopping ideas with complete hooks, content angles, execution tips, captions, and hashtags.",
  },
  {
    q: "How do I come up with TikTok video ideas that go viral?",
    a: "Viral TikTok ideas come from combining a trending content format with a niche-specific topic that creates emotional resonance. The five most reliable viral formats in 2026 are: (1) calling out a common mistake, (2) revealing hidden information, (3) showing a before/after transformation, (4) telling a personal story, and (5) applying a trending format to your niche. Every idea this tool generates uses one of these proven formulas.",
  },
  {
    q: "What type of TikTok content gets the most views?",
    a: "Content with high completion rates gets the most views on TikTok. The algorithm uses watch time as its primary ranking signal — videos where more than 60% of viewers watch to the end get pushed to wider audiences in successive distribution waves. Content that hooks viewers in the first 3 seconds (strong hook), delivers on its promise (strong concept), and ends with a CTA that drives comments (strong engagement signal) consistently outperforms polished but slow-starting videos.",
  },
  {
    q: "How important is the TikTok hook in the first 3 seconds?",
    a: "The hook is the single most important element of a TikTok video. TikTok data shows that 45% of viewers who watch the first 3 seconds will watch the entire video. A weak hook loses 80% of potential viewers before they see any of your content. Strong hooks either (1) make a bold counter-intuitive claim, (2) ask a question the viewer needs answered, (3) open a story mid-action, (4) reveal a shocking fact, or (5) tease the payoff. Every idea generated by this tool includes multiple hook variations for you to test.",
  },
  {
    q: "How many TikTok videos should I post per week?",
    a: "Posting 4–7 times per week is the optimal TikTok posting frequency for algorithm momentum. However, consistency matters more than volume — TikTok's algorithm systematically rewards accounts that maintain a regular posting schedule over accounts that post in bursts. More important than post frequency is content quality: one strong video per day beats three weak ones. Use batch filming to produce a week of content in a single session.",
  },
  {
    q: "What TikTok video length performs best in 2026?",
    a: "TikTok's algorithm currently distributes three video lengths most aggressively: 7–15 seconds (highest completion rate, best for hooks and quick tips), 30–60 seconds (best for storytelling and tutorial content with strong retention incentives), and 1–3 minutes (best for detailed content on the Creativity Program — pays creators per view). Avoid the 15–30 second range unless your content specifically demands it — TikTok's data shows this length has the lowest relative completion rate.",
  },
  {
    q: "How do I choose the right TikTok niche?",
    a: "Choose a TikTok niche that intersects three things: (1) what you know well enough to create consistent content, (2) what your target audience actively searches for, and (3) what has an existing content ecosystem you can remix and improve. Niche specificity beats broad appeal — a channel about 'budget fitness for college students' outgrows a generic 'fitness' channel because it speaks directly to a specific audience's exact situation.",
  },
  {
    q: "What makes TikTok content go viral on the For You Page?",
    a: "TikTok's For You Page (FYP) algorithm distributes content based on four signals: completion rate (how many viewers watch the full video), engagement rate (likes, comments, shares, saves), re-watch rate (how many viewers replay the video), and relevance to the viewer's interest profile. The fastest path to the FYP is a strong hook that maximizes completion rate, paired with a CTA that drives comments — typically an open-ended question or a debatable statement that viewers feel compelled to respond to.",
  },
  {
    q: "How do I use TikTok trends to grow my account?",
    a: "Trend-jacking (applying a viral format to your niche) is the most reliable growth strategy on TikTok. When a content format is trending platform-wide (e.g., 'Day in My Life,' 'POV,' 'Get Ready With Me'), applying it to your specific niche creates a powerful combination: trend discoverability + niche relevance + a proven format that viewers already enjoy. This tool's Trend Remix format applies exactly this strategy by combining the top trending TikTok formats with your niche topics.",
  },
  {
    q: "Are these TikTok video idea generation tools free?",
    a: "Yes — the TikTok Viral Idea Generator on Creator Toolbox is 100% free with no account, subscription, or credit card required. You can generate ideas for any niche, with any goal, unlimited times. Each generation produces complete ideas with hooks, content angles, captions, and hashtags — everything you need to go from zero to filming in under 5 minutes.",
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

// ─── Idea Card ────────────────────────────────────────────────────────────────

function IdeaCard({ idea, index, onCopy, copiedHook }: {
  idea: ViralIdea;
  index: number;
  onCopy: (text: string) => void;
  copiedHook: boolean;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const scoreColor = idea.viralScore >= 90 ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
    : idea.viralScore >= 85 ? "text-primary bg-primary/10 border-primary/20"
    : "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";

  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden ${expanded ? "border-primary/30 shadow-primary/5 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left group"
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${expanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold leading-snug transition-colors ${expanded ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
            {idea.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-medium border border-border">
              {idea.format}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold border ${scoreColor}`}>
              🔥 {idea.viralScore}/100
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {/* Concept */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">💡 Concept</p>
            <p className="text-sm text-foreground leading-relaxed">{idea.concept}</p>
          </div>

          {/* Hook */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1.5">🪝 Opening Hook (First 3 Seconds)</p>
                <p className="text-sm font-semibold text-foreground">"{idea.hook}"</p>
              </div>
              <button
                onClick={() => onCopy(idea.hook)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                  copiedHook
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                }`}
              >
                {copiedHook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Hook Variations */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">🔄 Hook Variations (A/B Test These)</p>
            <div className="space-y-2">
              {idea.hookVariations.map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border group hover:border-primary/30 transition-colors">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-muted-foreground flex-1">"{h}"</p>
                  <button onClick={() => onCopy(h)} className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Why Viral */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1.5">🚀 Why This Will Go Viral</p>
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{idea.whyViral}</p>
          </div>

          {/* Content Angles */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">🧠 Content Angles</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {[
                { label: "Emotional", value: idea.angles.emotional, color: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400" },
                { label: "Curiosity", value: idea.angles.curiosity, color: "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400" },
                { label: "Relatability", value: idea.angles.relatability, color: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400" },
              ].map(a => (
                <div key={a.label} className={`rounded-xl border p-3 ${a.color}`}>
                  <p className="text-xs font-bold mb-1">{a.label}</p>
                  <p className="text-xs leading-relaxed opacity-90">{a.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Execution */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">⚙️ Execution Tips</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {[
                { icon: Clock, label: "Video Length", value: idea.execution.length },
                { icon: Zap, label: "Pacing", value: idea.execution.pacing },
                { icon: Target, label: "Posting Strategy", value: idea.execution.posting },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl bg-muted/40 border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <p className="text-xs font-bold text-foreground">{label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Caption + Hashtags */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/40 border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Suggested Caption</p>
                <button onClick={() => onCopy(idea.caption)} className="text-muted-foreground hover:text-primary transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">"{idea.caption}"</p>
            </div>
            <div className="rounded-xl bg-muted/40 border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Hashtags</p>
                <button onClick={() => onCopy(idea.hashtags.join(" "))} className="text-muted-foreground hover:text-primary transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {idea.hashtags.map(h => (
                  <span key={h} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-medium">{h}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "fitness", label: "Fitness", emoji: "💪" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "tech", label: "Tech / AI", emoji: "🤖" },
  { value: "lifestyle", label: "Lifestyle", emoji: "✨" },
  { value: "fashion", label: "Fashion", emoji: "👗" },
  { value: "food", label: "Food", emoji: "🍕" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "beauty", label: "Beauty", emoji: "💄" },
  { value: "health", label: "Health", emoji: "🏥" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
];

const GOALS: { value: ContentGoal; label: string }[] = [
  { value: "grow", label: "Grow Followers" },
  { value: "engagement", label: "Boost Engagement" },
  { value: "sales", label: "Drive Sales" },
  { value: "brand", label: "Build Brand" },
  { value: "entertain", label: "Entertain" },
  { value: "educate", label: "Educate" },
];

const STYLES: { value: ContentStyle; label: string }[] = [
  { value: "storytelling", label: "Storytelling" },
  { value: "educational", label: "Educational" },
  { value: "funny", label: "Funny / Comedy" },
  { value: "faceless", label: "Faceless" },
  { value: "talking-head", label: "Talking Head" },
  { value: "pov", label: "POV" },
  { value: "tutorial", label: "Tutorial" },
  { value: "before-after", label: "Before / After" },
];

export function TikTokViralIdeaGeneratorTool() {
  const [niche, setNiche] = useState<Niche>("fitness");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState<ContentGoal>("grow");
  const [style, setStyle] = useState<ContentStyle>("storytelling");
  const [count, setCount] = useState(7);

  const [output, setOutput] = useState<IdeaOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"trends" | "ideas">("ideas");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tt-viral-idea";
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
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateViralIdeas(niche, audience, goal, style, count);
      setOutput(result);
      setIsGenerating(false);
      setActiveTab("ideas");
      if (!regen) {
        setTimeout(() => document.getElementById("idea-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }, 480);
  }, [niche, audience, goal, style, count]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
    toast({ title: "Copied!", duration: 1500 });
  };

  return (
    <>
      {/* ── Input Card ──────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Your Niche <span className="text-red-500">*</span>
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

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Target Audience <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <Input
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="e.g. college students, new moms, beginner entrepreneurs, gym beginners"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>

            {/* Goal + Style row */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Goal</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGoal(value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        goal === value
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
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStyle(value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        style === value
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

            {/* Number of Ideas */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Number of Ideas</label>
              <div className="flex gap-2">
                {[5, 7, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all ${
                      count === n
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={isGenerating}
              className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20"
            >
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Viral Ideas...</>
                : <><Sparkles className="w-5 h-5" /> Generate Viral TikTok Ideas</>
              }
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────── */}
      {output && (
        <section id="idea-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Tab header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Your Viral Ideas
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {count} ideas for <span className="font-semibold capitalize text-foreground">{niche}</span> — scored 80+
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["trends", "ideas"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase tracking-wide ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {tab === "trends" ? "📡 Trend Summary" : "💡 Viral Ideas"}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold">
                <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Trend Summary Tab */}
          {activeTab === "trends" && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-foreground text-lg capitalize">What's Working in {niche} Right Now</h3>
              </div>
              <div className="space-y-3">
                {output.trendSummary.map((trend, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{trend}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  💡 These trend insights are baked into every idea generated below — click "Viral Ideas" to see them in action.
                </p>
              </div>
            </div>
          )}

          {/* Ideas Tab */}
          {activeTab === "ideas" && (
            <div className="space-y-3">
              {output.ideas.map((idea, i) => (
                <IdeaCard
                  key={`${niche}-${i}`}
                  idea={idea}
                  index={i}
                  onCopy={copyText}
                  copiedHook={copiedText === idea.hook}
                />
              ))}
            </div>
          )}

          {/* Score legend */}
          <div className="flex items-center gap-4 flex-wrap px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide">Viral Score:</span>
            {[{ range: "90+", color: "bg-green-500", label: "Extremely Viral" }, { range: "85–89", color: "bg-primary", label: "Highly Viral" }, { range: "80–84", color: "bg-yellow-500", label: "Strong Viral Potential" }].map(s => (
              <span key={s.range} className="flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.range} {s.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Viral Idea Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Select Your Niche", desc: "Pick your TikTok content niche from the 14 options — from fitness and business to entertainment and relationships. The generator uses niche-specific trend data to build ideas that fit your audience." },
            { step: 2, title: "Set Your Goal and Style", desc: "Choose your content goal (grow followers, boost engagement, drive sales) and preferred style (storytelling, educational, POV, before/after). These inputs shape the viral format and tone of every idea." },
            { step: 3, title: "Generate Your Ideas", desc: "Hit Generate and the tool instantly produces 5, 7, or 10 complete viral ideas — each with a concept, 3-second hook, 4 hook variations, content angles, execution tips, a caption, and hashtags." },
            { step: 4, title: "Film, Post, and Test", desc: "Copy any hook or caption directly from the results. Test 2–3 hook variations for the same idea to find the best-performing opener. Use the Trend Summary tab to understand why each idea is built to go viral." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Viral Idea Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This TikTok Viral Idea Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free TikTok Viral Idea Generator applies five proven viral content formats —
              "You're Doing It Wrong," "Nobody Tells You This," Before/After, Storytime, and Trend Remix
              — to your specific niche using niche-specific trend data, topic seeds, and algorithm insights.
              Every idea includes a concept, an opening hook engineered for the 3-second retention window,
              four hook variations for A/B testing, three content angles (emotional, curiosity, relatability),
              execution tips covering video length, pacing, and posting strategy, a suggested caption designed
              to drive comments, and a hashtag set built for the For You Page. Each idea is scored on a 0–100
              virality scale based on retention potential, relatability, shareability, and trend alignment —
              only ideas scoring 80 or above are shown.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why TikTok Video Ideas Matter for Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              The TikTok algorithm in 2026 distributes content based on behavioral signals — specifically
              completion rate, engagement rate, and re-watches. But generating those signals starts before
              the camera even turns on. A video built on a weak idea will lose viewers in the first 3 seconds
              regardless of production quality. A video built on a strong viral format, with a hook engineered
              to stop the scroll, will outperform polished but strategically weak content every time. The
              creators growing fastest on TikTok are not those with the best cameras or editing — they're the
              ones who consistently choose ideas with built-in virality, execute them authentically, and test
              hook variations to optimize their distribution. This tool gives you the first and most important
              part of that process: a bank of niche-specific ideas that are algorithmically designed to perform.
              Never use generic content ideas again. Every idea generated here is built around what's actually
              working in your niche right now — combining current trend formats with the psychological triggers
              that consistently drive TikTok's FYP distribution.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This TikTok Idea Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "14 niches with niche-specific trend data and topic seeds",
                "5 proven viral formats applied to every idea (80+ virality score threshold)",
                "3-second hook + 4 A/B test variations for every single idea",
                "Emotional, curiosity, and relatability angles pre-built per idea",
                "Execution tips covering length, pacing, and posting strategy",
                "Suggested captions designed to maximize comment engagement",
                "Niche-aligned hashtag sets optimized for For You Page discovery",
                "Trend summary showing what's working in your niche right now",
                "Content goal and style filtering for tailored idea output",
                "100% free — no account, no limits, instant results every time",
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
