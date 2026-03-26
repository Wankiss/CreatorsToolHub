import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Copy, Check, RefreshCw, ChevronDown, Bookmark,
  BookmarkCheck, Flame, Lightbulb, TrendingUp, Zap, Target,
  ListChecks, Shield, Mic, Star, Play, BarChart3, Trash2, ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type GoalType   = "subscribers" | "engagement" | "viral" | "educate" | "monetize";
type ToneType   = "educational" | "entertaining" | "controversial" | "storytelling" | "motivational";
type TabType    = "generated" | "trending" | "saved";

interface IdeaResult {
  id: string;
  title: string;
  concept: string;
  viralityScore: number;
  whyItWorks: string;
  hook: string;
  formula: string;
  isTrending?: boolean;
}

interface FormState {
  niche: string;
  audience: string;
  goal: GoalType;
  tone: ToneType;
  trending: boolean;
  count: number;
}

// ─── Niche keyword expansion ──────────────────────────────────────────────────

const NICHE_KW_MAP: Record<string, string[]> = {
  gaming:     ["gaming setup", "gameplay tips", "game review", "stream setup", "top games", "beginner gaming guide", "esports career", "game controller tips"],
  tech:       ["smartphone review", "laptop comparison", "AI productivity tools", "best apps", "coding tips", "smart home setup", "tech mistakes", "software review"],
  fitness:    ["workout plan", "weight loss journey", "home workout", "gym mistakes", "nutrition guide", "building muscle", "fitness for beginners", "protein intake"],
  finance:    ["budgeting tips", "investing for beginners", "passive income ideas", "money mistakes", "stock market basics", "saving money fast", "financial freedom", "credit score"],
  travel:     ["travel on a budget", "solo travel guide", "travel mistakes", "hidden destinations", "travel hacks", "travel essentials", "packing guide", "travel vlog tips"],
  cooking:    ["easy meal prep", "cooking mistakes", "kitchen essentials", "quick recipes", "meal planning", "healthy eating", "cooking for beginners", "grocery guide"],
  beauty:     ["skincare routine", "makeup mistakes", "beauty hacks", "glow up journey", "natural beauty tips", "foundation guide", "skincare on a budget", "drugstore picks"],
  business:   ["startup mistakes", "side hustle ideas", "marketing tips", "online business", "client acquisition", "brand building", "social media strategy", "freelancing guide"],
  education:  ["study tips", "learning faster", "exam preparation", "productivity hacks", "note-taking system", "online course review", "focus techniques", "new skill guide"],
  youtube:    ["YouTube growth tips", "thumbnail design", "video editing mistakes", "YouTube SEO", "monetization guide", "growing from zero", "content strategy", "video scripting"],
  music:      ["music production tips", "home recording studio", "songwriting guide", "beat making basics", "music gear review", "growing music channel", "cover song strategy", "music marketing"],
  diy:        ["home improvement project", "DIY mistakes", "tool guide for beginners", "upcycling ideas", "budget home decor", "woodworking basics", "craft project ideas", "renovation tips"],
  sports:     ["training routine", "sports nutrition", "athlete recovery tips", "sports gear review", "coaching advice", "performance improvement", "beginner sports guide", "competition prep"],
  photography: ["camera settings guide", "photography mistakes", "editing tutorial", "composition tips", "gear for beginners", "lighting setup", "portrait photography", "photo editing speed"],
};

function expandNicheKeywords(niche: string): string[] {
  const lower = niche.toLowerCase();
  for (const [key, kws] of Object.entries(NICHE_KW_MAP)) {
    if (lower.includes(key) || key.includes(lower.split(" ")[0])) return kws;
  }
  // Generic fallback
  const words = lower.split(/\s+/).filter(Boolean);
  return [
    `${words[0]} tips for beginners`,
    `${words[0]} mistakes to avoid`,
    `complete ${words[0]} guide`,
    `${words[0]} journey`,
    `best ${words[0]} strategies`,
    `${words[0]} for beginners`,
    `${words[0]} review and comparison`,
    `${words[0]} secrets revealed`,
  ];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Formula templates ────────────────────────────────────────────────────────

interface FormulaTemplate {
  name: string;
  viralityBase: number;
  viralityVariance: number;
  buildTitle: (kw: string, audience: string, niche: string, tone: ToneType, goal: GoalType) => string;
  buildConcept: (kw: string, niche: string, audience: string) => string;
  whyItWorks: string;
  buildHook: (kw: string, audience: string) => string;
  bestTones: ToneType[];
  bestGoals: GoalType[];
}

const FORMULAS: FormulaTemplate[] = [
  {
    name: "Controversy",
    viralityBase: 9, viralityVariance: 1,
    buildTitle: (kw, aud) => `Why Everything You Know About ${cap(kw)} Is Wrong${aud ? ` (${cap(aud)} Listen Up)` : ""}`,
    buildConcept: (kw, niche) => `Challenge the most common beliefs around ${kw} in the ${niche} space. Share data, personal experience, or expert-backed evidence that flips conventional wisdom — then present what actually works.`,
    whyItWorks: "Controversy triggers an instant emotional response — viewers either rush to defend their existing belief or feel compelled to hear the opposing view. Both reactions drive exceptional CTR and comment engagement.",
    buildHook: (kw) => `"I've been doing ${kw} for years — and I recently discovered that almost everything I was taught is completely backwards. In this video, I'm going to prove it with real numbers."`,
    bestTones: ["controversial", "entertaining"],
    bestGoals: ["viral", "engagement"],
  },
  {
    name: "Stop Warning",
    viralityBase: 9, viralityVariance: 1,
    buildTitle: (kw, aud, niche, tone, goal) => `Stop ${cap(kw.split(" ")[0])}ing ${goal === "subscribers" ? "If You Want to Grow" : goal === "viral" ? "Before It's Too Late" : "Right Now (Here's Why)"}`,
    buildConcept: (kw, niche) => `Use the power of loss aversion by identifying the single most damaging mistake people make with ${kw} and framing the entire video around why stopping that behavior is the fastest path to results in ${niche}.`,
    whyItWorks: "Loss aversion is one of the strongest psychological forces — people are more motivated to avoid losing something than to gain something new. 'Stop' commands trigger immediate attention and action.",
    buildHook: (kw) => `"If you're still doing ${kw} this way in ${new Date().getFullYear()}, this video could save you months of wasted effort. Because what I'm about to show you changes everything."`,
    bestTones: ["controversial", "motivational"],
    bestGoals: ["engagement", "viral"],
  },
  {
    name: "Curiosity Gap",
    viralityBase: 9, viralityVariance: 0,
    buildTitle: (kw, aud) => `The ${cap(kw)} Secret Nobody Talks About${aud ? ` (Especially for ${cap(aud)})` : ""}`,
    buildConcept: (kw, niche) => `Reveal an under-discussed insight, technique, or strategy related to ${kw} that most creators in the ${niche} niche overlook. The key is that the 'secret' must deliver genuine value — not clickbait.`,
    whyItWorks: "The curiosity gap is the most reliable CTR driver in YouTube history. By implying hidden knowledge, you create an information void that viewers feel psychologically compelled to fill by clicking.",
    buildHook: (kw) => `"There's one thing about ${kw} that the biggest creators in this space don't talk about — probably because they don't want you to know. I'm going to break it down in the next few minutes."`,
    bestTones: ["entertaining", "educational"],
    bestGoals: ["viral", "subscribers"],
  },
  {
    name: "Personal Story",
    viralityBase: 8, viralityVariance: 1,
    buildTitle: (kw, aud, niche) => `How I ${cap(kw)} From Zero (${new Date().getFullYear()} Honest Results)`,
    buildConcept: (kw, niche) => `Share your authentic personal journey with ${kw} — including the failures, the turning points, and the final results. Viewers in the ${niche} niche connect deeply with real experiences over polished advice.`,
    whyItWorks: "Personal narratives activate mirror neurons and create emotional investment. Viewers see themselves in your story and stay to find out how it ends — dramatically improving watch time and retention metrics.",
    buildHook: (kw) => `"Twelve months ago, I knew absolutely nothing about ${kw}. Today, I'm going to show you exactly what happened — the good, the bad, and the mistakes I wish I could undo."`,
    bestTones: ["storytelling", "motivational"],
    bestGoals: ["subscribers", "engagement"],
  },
  {
    name: "Experiment",
    viralityBase: 8, viralityVariance: 1,
    buildTitle: (kw) => `I Tried ${cap(kw)} for 30 Days — Here's What Actually Happened`,
    buildConcept: (kw, niche) => `Run a structured 30-day experiment applying ${kw} consistently and document every result with honest metrics. The ${niche} audience craves real data over theoretical advice — this format delivers exactly that.`,
    whyItWorks: "Experiment videos combine story structure with scientific credibility. The time constraint ('30 days') creates a natural narrative arc, and viewers stay to see the final result — boosting average view duration.",
    buildHook: (kw) => `"On day one, I committed to ${kw} every single day for 30 days — no excuses, no skipping. I'm about to show you the before, the during, and the final results that I honestly did not expect."`,
    bestTones: ["entertaining", "educational"],
    bestGoals: ["viral", "engagement"],
  },
  {
    name: "Mistakes Listicle",
    viralityBase: 8, viralityVariance: 1,
    buildTitle: (kw, aud) => `${aud ? `${cap(aud)} Make` : "Everyone Makes"} These ${cap(kw)} Mistakes (Fix Them Now)`,
    buildConcept: (kw, niche) => `Identify the 5–10 most common, costly mistakes people make when starting or improving their ${kw} journey in the ${niche} space. For each mistake, explain why it happens and give a clear fix.`,
    whyItWorks: "Mistake-framed content triggers both curiosity (Am I making these mistakes?) and relief (I can fix this). The listicle structure sets viewer expectations upfront, reducing drop-off in the first 30 seconds.",
    buildHook: (kw, aud) => `"Most ${aud || "people"} starting with ${kw} make the same five mistakes — and these mistakes are costing them months of progress. Let me show you what they are and exactly how to fix each one."`,
    bestTones: ["educational", "motivational"],
    bestGoals: ["educate", "subscribers"],
  },
  {
    name: "Beginner Complete Guide",
    viralityBase: 7, viralityVariance: 1,
    buildTitle: (kw, aud) => `Complete ${cap(kw)} Guide for ${aud ? cap(aud) : "Beginners"} in ${new Date().getFullYear()} (Step by Step)`,
    buildConcept: (kw, niche) => `Create the definitive beginner-friendly walkthrough for ${kw} — covering everything from the very basics through to first results. This evergreen format ranks well in YouTube search and drives consistent long-term traffic to your ${niche} channel.`,
    whyItWorks: "How-to and guide content dominates YouTube search rankings. 'Beginner' signals low barrier to entry, expanding your potential audience, while 'complete' and 'step by step' signal thoroughness that justifies a longer watch time.",
    buildHook: (kw) => `"If you're completely new to ${kw} and have no idea where to start — this is the video I wish I had when I was beginning. By the end of this, you'll know exactly what to do first."`,
    bestTones: ["educational"],
    bestGoals: ["educate", "subscribers"],
  },
  {
    name: "Comparison",
    viralityBase: 7, viralityVariance: 1,
    buildTitle: (kw) => {
      const parts = kw.split(" ");
      const half = Math.ceil(parts.length / 2);
      const a = parts.slice(0, half).join(" ");
      const b = parts.slice(half).join(" ") || "the alternative";
      return `${cap(a)} vs ${cap(b)}: The Truth Nobody Tells You`;
    },
    buildConcept: (kw, niche) => `Objectively compare the two most debated approaches, tools, or methods within ${kw} in your ${niche} niche. Don't just list features — give a verdict backed by real testing so viewers feel the comparison is genuinely useful.`,
    whyItWorks: "Comparison videos attract viewers at the decision stage of research — people who are ready to commit and just need a final recommendation. These viewers watch longer, trust more, and convert better for affiliate revenue.",
    buildHook: (kw) => `"I've tested both sides of the ${kw} debate extensively — and I finally have a clear answer about which one actually wins. The result surprised me, and it might surprise you too."`,
    bestTones: ["educational", "entertaining"],
    bestGoals: ["educate", "monetize"],
  },
  {
    name: "Trending Reaction",
    viralityBase: 9, viralityVariance: 0,
    buildTitle: (kw, aud, niche) => `Why Everyone in ${cap(niche)} Is Obsessed With ${cap(kw)} Right Now`,
    buildConcept: (kw, niche) => `Capitalize on current momentum around ${kw} by explaining the trend, why it's exploding in the ${niche} space, and what viewers should know about it now — before it peaks. Position yourself as the go-to source for timely analysis.`,
    whyItWorks: "Trending content gets a significant algorithmic boost during its peak window. The 'right now' framing triggers FOMO and gives viewers a reason to watch immediately rather than saving for later.",
    buildHook: (kw) => `"In the last few weeks, ${kw} has completely taken over — and if you haven't paid attention yet, you need to watch this right now. Because this trend is changing everything."`,
    bestTones: ["entertaining", "controversial"],
    bestGoals: ["viral", "engagement"],
  },
  {
    name: "Case Study",
    viralityBase: 8, viralityVariance: 0,
    buildTitle: (kw, aud) => `How ${aud ? `${cap(aud)} Use` : "Creators Use"} ${cap(kw)} to Get Real Results (Case Study)`,
    buildConcept: (kw, niche) => `Deep-dive into a real example — either your own channel/client or a well-known creator in ${niche} — showing exactly how they applied ${kw} strategies to get measurable results. Use real numbers, screenshots, and before/after data.`,
    whyItWorks: "Case studies provide social proof with specificity — the most persuasive combination in content marketing. Real numbers and real results are far more credible than general advice, driving trust and subscription intent.",
    buildHook: (kw) => `"I'm going to show you the exact ${kw} strategy that generated real, measurable results — with actual numbers, actual screenshots, and zero fluff. This case study breaks down every step."`,
    bestTones: ["educational", "storytelling"],
    bestGoals: ["monetize", "educate"],
  },
  {
    name: "Ultimate List",
    viralityBase: 7, viralityVariance: 1,
    buildTitle: (kw, aud) => `${new Date().getFullYear()}'s Best ${cap(kw)} Tips${aud ? ` for ${cap(aud)}` : ""} (That Actually Work)`,
    buildConcept: (kw, niche) => `Curate the most effective, up-to-date tips specifically for ${kw} — filtering out outdated advice and focusing on what's working right now in the ${niche} niche. Add your own experience to each tip to avoid a generic listicle feel.`,
    whyItWorks: "List-based titles set a clear content expectation that reduces viewer hesitation. The current year signals freshness and relevance, while 'that actually work' implies others have been wasting your time — creating urgency.",
    buildHook: (kw) => `"I've tested and filtered through dozens of ${kw} tips to find the ones that are actually producing results in ${new Date().getFullYear()} — not three years ago. Here are the only ones worth your time."`,
    bestTones: ["educational", "motivational"],
    bestGoals: ["educate", "subscribers"],
  },
  {
    name: "Viral Challenge",
    viralityBase: 8, viralityVariance: 1,
    buildTitle: (kw) => `I Challenged Myself to Master ${cap(kw)} in One Week (Did It Work?)`,
    buildConcept: (kw, niche) => `Set an ambitious, time-constrained challenge around ${kw} with a specific measurable goal. Document the process honestly with a genuine outcome — the uncertainty of 'will they succeed' is what keeps viewers watching in the ${niche} space.`,
    whyItWorks: "Challenge videos create natural suspense and story structure. The uncertain outcome keeps viewers watching until the end, dramatically boosting completion rate — one of YouTube's most heavily weighted ranking signals.",
    buildHook: (kw) => `"One week. That's all I gave myself to go from zero to actually competent at ${kw}. This is the unfiltered, real-time breakdown of what happened — and whether it's actually possible."`,
    bestTones: ["entertaining", "motivational"],
    bestGoals: ["viral", "engagement"],
  },
];

const TRENDING_FORMULAS: FormulaTemplate[] = [
  {
    name: "AI Tools",
    viralityBase: 9, viralityVariance: 0,
    buildTitle: (kw, aud, niche) => `The AI Tools Every ${cap(niche)} Creator Needs in ${new Date().getFullYear()}`,
    buildConcept: (kw, niche) => `Showcase the most impactful AI tools currently transforming the ${niche} content creation workflow — from research and scripting to editing and thumbnails. Position yourself as the guide to navigating the AI revolution.`,
    whyItWorks: "AI content is currently in its highest search volume period. Niche-specific AI breakdowns attract both existing creators and newcomers who see AI as the shortcut they've been looking for.",
    buildHook: (kw, aud) => `"AI just changed the game for ${aud || "creators"} — and if you're not using these tools yet, your competitors already are. Let me show you what's actually worth your time."`,
    bestTones: ["educational", "entertaining"],
    bestGoals: ["subscribers", "educate"],
  },
  {
    name: "Algorithm Change",
    viralityBase: 9, viralityVariance: 0,
    buildTitle: (kw, aud, niche) => `YouTube Algorithm Just Changed — Here's What ${cap(niche)} Creators Need to Know`,
    buildConcept: (kw, niche) => `Break down the latest shifts in how YouTube is distributing content in the ${niche} category. Explain what signals are being weighted more heavily, what strategies are now outdated, and what to do immediately.`,
    whyItWorks: "Algorithm change content triggers fear of falling behind — every creator immediately clicks to protect their channel. It's reliably high-intent traffic that converts well for subscribers because it signals authoritative knowledge.",
    buildHook: () => `"YouTube just made a change that most creators haven't noticed yet — and it's already affecting how videos get recommended. If you're creating content right now, this affects you directly."`,
    bestTones: ["educational", "controversial"],
    bestGoals: ["subscribers", "engagement"],
  },
  {
    name: "Income Report",
    viralityBase: 8, viralityVariance: 0,
    buildTitle: (kw, aud, niche) => `My Honest ${cap(niche)} Channel Income Report (Real Numbers Revealed)`,
    buildConcept: (kw, niche) => `Transparency video revealing your actual channel revenue across all sources — AdSense, sponsorships, affiliate income, and digital products. The ${niche} audience is hungry for honest monetization data from creators at various stages.`,
    whyItWorks: "Income transparency videos consistently outperform because they satisfy deep viewer curiosity about money while positioning the creator as authentic. The 'real numbers' angle builds trust faster than almost any other format.",
    buildHook: () => `"I'm about to show you every dollar this channel made last month — AdSense, brand deals, affiliate links, everything. No rounding up, no vague percentages. Just real numbers."`,
    bestTones: ["storytelling", "educational"],
    bestGoals: ["monetize", "engagement"],
  },
];

// ─── Generation function ──────────────────────────────────────────────────────

function generateIdeas(form: FormState, seed: number): IdeaResult[] {
  const { niche, audience, goal, tone, trending, count } = form;
  const keywords = expandNicheKeywords(niche);
  const results: IdeaResult[] = [];
  const seen = new Set<string>();

  const addIdea = (formula: FormulaTemplate, kw: string, isTrending = false) => {
    const title = formula.buildTitle(kw, audience, niche, tone, goal);
    if (seen.has(title.toLowerCase()) || results.length >= count) return;
    seen.add(title.toLowerCase());
    const scoreVariance = Math.floor(((seed + results.length) % 3) - 1); // -1, 0, or 1
    const viralityScore = Math.min(10, Math.max(1, formula.viralityBase + scoreVariance * formula.viralityVariance));
    results.push({
      id: `${formula.name}-${kw}-${seed}`.replace(/\s/g, "-"),
      title,
      concept: formula.buildConcept(kw, niche, audience),
      viralityScore,
      whyItWorks: formula.whyItWorks,
      hook: formula.buildHook(kw, audience),
      formula: formula.name,
      isTrending,
    });
  };

  // Sort formulas by preference for selected goal/tone
  const sortedFormulas = [...FORMULAS].sort((a, b) => {
    const aScore = (a.bestGoals.includes(goal) ? 2 : 0) + (a.bestTones.includes(tone) ? 1 : 0);
    const bScore = (b.bestGoals.includes(goal) ? 2 : 0) + (b.bestTones.includes(tone) ? 1 : 0);
    return bScore - aScore;
  });

  // Generate ideas by cycling through formulas × keywords
  for (let round = 0; results.length < count && round < 4; round++) {
    for (const formula of sortedFormulas) {
      if (results.length >= count) break;
      const kw = keywords[(sortedFormulas.indexOf(formula) + round + seed) % keywords.length];
      addIdea(formula, kw, false);
    }
  }

  return results;
}

function generateTrendingIdeas(niche: string, seed: number): IdeaResult[] {
  const results: IdeaResult[] = [];
  const seen = new Set<string>();
  const keywords = expandNicheKeywords(niche);

  const addIdea = (formula: FormulaTemplate, kw: string) => {
    const title = formula.buildTitle(kw, "", niche, "entertaining", "viral");
    if (seen.has(title.toLowerCase())) return;
    seen.add(title.toLowerCase());
    results.push({
      id: `trending-${formula.name}-${kw}`.replace(/\s/g, "-"),
      title,
      concept: formula.buildConcept(kw, niche, ""),
      viralityScore: formula.viralityBase,
      whyItWorks: formula.whyItWorks,
      hook: formula.buildHook(kw, ""),
      formula: formula.name,
      isTrending: true,
    });
  };

  TRENDING_FORMULAS.forEach((f, i) => addIdea(f, keywords[(i + seed) % keywords.length]));

  // Fill with high-virality regular formulas
  const highVirality = FORMULAS.filter(f => f.viralityBase >= 8);
  highVirality.forEach((f, i) => {
    if (results.length >= 10) return;
    addIdea(f, keywords[(i + seed + 2) % keywords.length]);
  });

  return results.slice(0, 10);
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How do I come up with good YouTube video ideas consistently?",
    a: "Consistent idea generation comes from having a system rather than waiting for inspiration. The most reliable methods are: (1) Keyword research — identify what your audience actively searches for on YouTube and build videos around those exact queries. (2) Comment mining — read your existing comments and community questions; your audience is telling you exactly what they want next. (3) Competitor analysis — examine top-performing videos in your niche and create a better, more comprehensive version. (4) Trend spotting — use Google Trends and YouTube's own trending page to find rising topics in your category before they peak. Our generator combines all four approaches into a single tool, giving you a structured bank of video ideas you can execute immediately.",
  },
  {
    q: "What makes a YouTube video idea 'viral'?",
    a: "Viral YouTube videos share five common traits: a curiosity-gap title that creates an information void viewers feel compelled to fill; an emotionally charged thumbnail that complements the title; a hook in the first 15 seconds that immediately delivers on the title's promise; a content structure that maintains pacing and prevents drop-off; and a topic that triggers sharing behavior — either because viewers want to show others something surprising, helpful, funny, or relatable. The virality score in our generator rates each idea on how well it checks these boxes based on proven psychological triggers and algorithmic signals.",
  },
  {
    q: "How often should I post new YouTube videos?",
    a: "Consistency matters more than frequency. One high-quality video per week is significantly better than four mediocre videos — YouTube's algorithm rewards watch time and audience retention far more than upload frequency. The minimum viable publishing cadence for channel growth is one video every two weeks; anything less makes it difficult for the algorithm to learn your audience. If you're struggling to maintain consistency, the real problem is usually idea generation — having a full content calendar ready before you need it removes the creative block that causes inconsistent posting.",
  },
  {
    q: "Should I choose trending topics or evergreen topics for my channel?",
    a: "Both have distinct roles in a healthy content strategy. Trending content drives short bursts of high traffic when uploaded during the trend's peak window, builds channel authority by positioning you as timely and relevant, and can expose your channel to entirely new audiences. Evergreen content (tutorials, guides, comparisons) accumulates views steadily over months and years, drives consistent subscriber growth, and provides long-term search traffic. The ideal strategy is roughly 70% evergreen and 30% trending content — the evergreen videos sustain your baseline traffic while trending videos create periodic spikes. Our generator's Trending Ideas tab focuses specifically on formats with high current momentum.",
  },
  {
    q: "How do I know if a video idea will perform well before I film it?",
    a: "The most reliable pre-production signals are: (1) YouTube search volume — search your title keywords directly in YouTube and look at the number and quality of existing videos; high volume with weak existing content is a gap you can fill. (2) Community interest — ask your existing audience in a Community post which idea they want next; high engagement on a specific option is a green light. (3) Title click-through prediction — show your proposed thumbnail and title combination to people unfamiliar with your channel and ask if they'd click it. (4) Competitor validation — if a similar video from a comparable channel performed well, the idea has proven demand. The virality scores and 'Why It Works' explanations in our generator help you evaluate ideas before committing production time.",
  },
  {
    q: "What content goal should I focus on first: subscribers, views, or engagement?",
    a: "The answer depends on your current stage. If you have under 1,000 subscribers, focus on views from search-optimized evergreen content — this builds the audience base that feeds subscriber growth. If you're between 1,000–10,000 subscribers, shift toward engagement (community, comments, CTR) because the algorithm starts using these signals to determine how broadly to distribute your content. Above 10,000 subscribers, monetization content becomes viable. Our tool's Content Goal dropdown adjusts the idea formulas accordingly — subscriber-focused ideas favor searchable evergreen formats while viral ideas prioritize engagement-driving formats.",
  },
  {
    q: "How long should my YouTube videos be?",
    a: "Video length should be determined by content requirements, not target duration. YouTube's algorithm cares about absolute watch time and retention percentage — a 5-minute video with 70% retention outperforms a 20-minute video with 30% retention. That said, videos over 8 minutes allow mid-roll ads, which is significant for monetization. For tutorials and educational content, 8–15 minutes is a reliable sweet spot. For entertainment and vlogs, 8–12 minutes. For in-depth case studies and guides, 15–25 minutes can work if every minute earns its place. The golden rule: never pad your content to hit a target length. Viewer drop-off is the single most damaging metric for algorithmic reach.",
  },
  {
    q: "Can I generate video ideas for any niche with this tool?",
    a: "Yes — the YouTube Video Idea Generator works across all content categories. It has pre-built keyword pools for gaming, tech, fitness, finance, travel, cooking, beauty, business, education, music, photography, DIY, sports, and YouTube growth itself. For niches outside these categories, the auto-detection system pulls keywords from your input text and applies the same proven formula templates to generate tailored ideas. Every niche has variations on the same core content types — tutorials, controversies, experiments, case studies — and the generator adapts these to whatever topic you enter.",
  },
  {
    q: "Should my video titles be questions or statements?",
    a: "Both formats work, but for different psychological reasons. Question titles (How do I grow on YouTube? What is the best camera for beginners?) mirror the exact phrasing viewers use in search, making them powerful for SEO-driven content. Statement titles with curiosity gaps (The YouTube growth secret nobody talks about / I tried this for 30 days and here's what happened) perform better for suggested and browse traffic because they feel more like compelling headlines than search queries. The best channels use a mix: question-format titles for search-optimized content and statement/curiosity titles for content targeting the algorithm's suggested video distribution.",
  },
  {
    q: "Is this YouTube Video Idea Generator free to use?",
    a: "Yes — the YouTube Video Idea Generator is completely free with no account, no signup, and unlimited uses. Generate as many idea sets as you need, save your favorites to your browser, and regenerate any idea for variations. Every idea includes a full concept description, virality score, psychological explanation, and a ready-to-use opening hook script — everything you need to go from idea to filming. There are no limits on how many ideas you can generate or save.",
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
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Virality Score Bar ───────────────────────────────────────────────────────

function ViralityBar({ score }: { score: number }) {
  const color = score >= 9 ? "bg-red-500" : score >= 7 ? "bg-orange-500" : score >= 5 ? "bg-yellow-500" : "bg-green-500";
  const label = score >= 9 ? "Viral Potential" : score >= 7 ? "High Potential" : score >= 5 ? "Good Potential" : "Steady";
  return (
    <div className="flex items-center gap-2">
      <Flame className={`w-4 h-4 ${score >= 9 ? "text-red-500" : score >= 7 ? "text-orange-500" : "text-yellow-500"}`} />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${score >= 9 ? "text-red-500" : score >= 7 ? "text-orange-500" : "text-yellow-500"}`}>
        {score}/10
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Idea Card ────────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  isSaved,
  copiedId,
  onCopy,
  onSave,
}: {
  idea: IdeaResult;
  isSaved: boolean;
  copiedId: string | null;
  onCopy: (title: string, id: string) => void;
  onSave: (idea: IdeaResult) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-2xl border bg-card overflow-hidden transition-all duration-200 ${idea.isTrending ? "border-orange-500/30" : "border-border"} hover:border-primary/30 hover:shadow-sm`}>
      {idea.isTrending && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 border-b border-orange-500/20">
          <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Trending Format</span>
        </div>
      )}
      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <Play className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <h3 className="font-bold text-foreground text-sm leading-snug">{idea.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onSave(idea)}
              className={`p-1.5 rounded-lg transition-colors ${isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"}`}
              title={isSaved ? "Saved" : "Save idea"}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onCopy(idea.title, idea.id)}
              className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Copy title"
            >
              {copiedId === idea.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Virality score */}
        <ViralityBar score={idea.viralityScore} />

        {/* Formula badge */}
        <div className="mt-2.5 mb-3">
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/8 text-primary border border-primary/20">
            {idea.formula} Formula
          </span>
        </div>

        {/* Concept — always visible */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          <span className="font-semibold text-foreground">💡 Concept: </span>{idea.concept}
        </p>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Hide details" : "Show hook + why it works"}
        </button>

        {/* Expanded section */}
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-[600px] mt-3" : "max-h-0"}`}>
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" /> Why It Works
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{idea.whyItWorks}</p>
            </div>
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-primary" /> Suggested Hook (First 10 seconds)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{idea.hook}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SAVED_KEY = "yt-video-idea-saved";

const GOAL_OPTIONS: { value: GoalType; label: string; desc: string }[] = [
  { value: "subscribers", label: "Grow Subscribers", desc: "Attract new audience" },
  { value: "engagement", label: "Increase Engagement", desc: "Drive comments & likes" },
  { value: "viral", label: "Go Viral", desc: "Maximum reach & shares" },
  { value: "educate", label: "Educate Audience", desc: "Build authority & trust" },
  { value: "monetize", label: "Monetize", desc: "Revenue-focused content" },
];

const TONE_OPTIONS: { value: ToneType; label: string }[] = [
  { value: "educational", label: "Educational" },
  { value: "entertaining", label: "Entertaining" },
  { value: "controversial", label: "Controversial" },
  { value: "storytelling", label: "Storytelling" },
  { value: "motivational", label: "Motivational" },
];

export function YouTubeVideoIdeaGeneratorTool() {
  const [form, setForm] = useState<FormState>({
    niche: "", audience: "", goal: "subscribers", tone: "educational", trending: true, count: 10,
  });
  const [results, setResults] = useState<IdeaResult[]>([]);
  const [trendingResults, setTrendingResults] = useState<IdeaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<IdeaResult[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("generated");
  const [nicheError, setNicheError] = useState("");
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load saved ideas from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-yt-video-idea-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const persistSaved = (ideas: IdeaResult[]) => {
    setSaved(ideas);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(ideas)); } catch {}
  };

  const handleSave = useCallback((idea: IdeaResult) => {
    setSaved(prev => {
      const exists = prev.some(s => s.id === idea.id);
      const next = exists ? prev.filter(s => s.id !== idea.id) : [idea, ...prev];
      try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch {}
      toast({ title: exists ? "Removed from saved" : "Idea saved!", description: exists ? "" : "Find it in the Saved Ideas tab." });
      return next;
    });
  }, [toast]);

  const handleDeleteSaved = (id: string) => {
    persistSaved(saved.filter(s => s.id !== id));
  };

  const handleCopy = useCallback((title: string, id: string) => {
    navigator.clipboard.writeText(title).then(() => {
      setCopiedId(id);
      toast({ title: "Copied!", description: "Title copied to clipboard." });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [toast]);

  const runGenerate = useCallback((currentSeed: number) => {
    if (!form.niche.trim()) { setNicheError("Channel niche is required."); return; }
    setNicheError("");
    setLoading(true);
    setTimeout(() => {
      const newResults = generateIdeas(form, currentSeed);
      const tResults = generateTrendingIdeas(form.niche, currentSeed);
      setResults(newResults);
      setTrendingResults(tResults);
      setLoading(false);
      setActiveTab("generated");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }, 600);
  }, [form]);

  const handleGenerate = () => runGenerate(seed);

  const handleRegenerate = () => {
    const next = seed + 1;
    setSeed(next);
    runGenerate(next);
  };

  const savedSet = new Set(saved.map(s => s.id));
  const displayResults = activeTab === "trending" ? trendingResults : results;

  return (
    <>
      {/* ── Tool Card ───────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Niche + Audience */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Channel Niche *
              </label>
              <Input
                value={form.niche}
                onChange={e => { setForm(f => ({ ...f, niche: e.target.value })); setNicheError(""); }}
                placeholder="e.g. Tech Reviews, Fitness, Personal Finance…"
                className={`rounded-xl h-11 text-sm ${nicheError ? "border-destructive" : ""}`}
              />
              {nicheError && <p className="text-xs text-destructive mt-1">{nicheError}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Target Audience (Optional)
              </label>
              <Input
                value={form.audience}
                onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                placeholder="e.g. Beginners, Teens, Entrepreneurs…"
                className="rounded-xl h-11 text-sm"
              />
            </div>
          </div>

          {/* Content Goal */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Content Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {GOAL_OPTIONS.map(g => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    form.goal === g.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="font-bold">{g.label}</div>
                  <div className="font-normal opacity-70 mt-0.5 text-[10px]">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone + Trending + Count */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Tone / Style
              </label>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, tone: t.value }))}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      form.tone === t.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer group mt-4">
                <div
                  onClick={() => setForm(f => ({ ...f, trending: !f.trending }))}
                  className={`flex items-center rounded-full border-2 transition-colors`}
                  style={{ width: "40px", height: "22px", backgroundColor: form.trending ? "hsl(var(--primary))" : "hsl(var(--muted))", borderColor: form.trending ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)" }}
                  role="checkbox"
                  aria-checked={form.trending}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${form.trending ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Include trending topic angles
                </span>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Number of Ideas: <span className="text-primary font-bold">{form.count}</span>
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={form.count}
                onChange={e => setForm(f => ({ ...f, count: Number(e.target.value) }))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
              </div>
            </div>
          </div>

          {/* Generate */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          >
            {loading ? (
              <><Sparkles className="w-5 h-5 animate-pulse" /> Generating Ideas…</>
            ) : (
              <><Lightbulb className="w-5 h-5" /> Generate Video Ideas</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────── */}
      {(results.length > 0 || saved.length > 0) && (
        <div ref={resultsRef} className="mt-6 animate-in slide-in-from-bottom-4 duration-500 space-y-4">

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-muted/40 rounded-2xl p-1">
            {([
              { key: "generated" as TabType, label: "Generated Ideas", count: results.length, icon: <Lightbulb className="w-3.5 h-3.5" /> },
              { key: "trending"  as TabType, label: "Trending Formats", count: trendingResults.length, icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { key: "saved"     as TabType, label: "Saved Ideas", count: saved.length, icon: <Bookmark className="w-3.5 h-3.5" /> },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-card text-primary shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Regenerate bar (only for generated/trending tabs) */}
          {activeTab !== "saved" && results.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading} className="gap-1.5 rounded-xl text-xs">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Regenerate
              </Button>
            </div>
          )}

          {/* Results grid */}
          {activeTab === "saved" ? (
            saved.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{saved.length} saved idea{saved.length !== 1 ? "s" : ""} — stored in your browser</p>
                  <button onClick={() => { persistSaved([]); }} className="text-xs text-destructive hover:text-destructive/80 font-medium flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                  </button>
                </div>
                {saved.map(idea => (
                  <div key={idea.id} className="relative">
                    <IdeaCard idea={idea} isSaved={true} copiedId={copiedId} onCopy={handleCopy} onSave={handleSave} />
                    <button onClick={() => handleDeleteSaved(idea.id)} className="absolute top-3 right-12 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold text-foreground">No saved ideas yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click the bookmark icon on any idea card to save it here.</p>
              </div>
            )
          ) : displayResults.length > 0 ? (
            <div className="space-y-3">
              {displayResults.map(idea => (
                <IdeaCard key={idea.id} idea={idea} isSaved={savedSet.has(idea.id)} copiedId={copiedId} onCopy={handleCopy} onSave={handleSave} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
              <p className="text-sm font-semibold">Generate ideas first</p>
              <p className="text-xs text-muted-foreground mt-1">Enter your niche and click Generate Video Ideas above.</p>
            </div>
          )}
        </div>
      )}

      {/* ── How to Use ─────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Video Idea Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Niche and Audience", desc: "Type your channel niche (e.g. 'fitness', 'personal finance', 'gaming') and optionally your target audience (e.g. 'beginners', 'entrepreneurs', 'teens'). The generator expands your niche into related content angles and keyword clusters specific to your category, producing ideas that feel native to your channel rather than generic." },
            { step: 2, title: "Choose Your Content Goal and Tone", desc: "Select the goal driving your next batch of content — growing subscribers, increasing engagement, going viral, educating your audience, or monetizing. Then pick your preferred tone (Educational, Entertaining, Controversial, Storytelling, or Motivational). The algorithm weights proven video formulas based on which combination you select, giving you ideas that match your strategy." },
            { step: 3, title: "Set Your Idea Count and Generate", desc: "Use the slider to choose how many ideas you want (5–30). Hit Generate Video Ideas and your personalized idea bank appears in seconds — each card shows a clickable title, concept description, virality score, the psychological reason it works, and a ready-to-use opening hook script. Toggle 'Include trending angles' to mix in currently trending content formats." },
            { step: 4, title: "Save Favorites and Build Your Content Calendar", desc: "Click the bookmark icon on any idea to save it to your Saved Ideas tab — your saved ideas persist in your browser between sessions. Copy any title directly to your clipboard. Use the Trending Formats tab to explore high-momentum content angles. Regenerate to get a completely fresh batch whenever you want different options." },
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

      {/* ── About ──────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Video Idea Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why YouTube Creators Run Out of Ideas — And How to Fix It
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The single biggest reason YouTube channels stall or die is not poor video quality, bad
              editing, or inconsistent thumbnails — it's running out of ideas. When creators can't
              figure out what to film next, they delay uploading, the algorithm stops distributing
              their content, and audience growth stalls. The irony is that this happens even in niches
              with genuinely infinite content potential. The problem isn't a shortage of possible ideas
              — it's not having a system to surface those ideas on demand.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The most prolific YouTube creators treat content ideation like a muscle, not a mood.
              They use structured brainstorming frameworks — proven video formulas applied to their
              niche's keyword space — rather than waiting for inspiration to strike. Our generator
              brings this same systematic approach to any creator: enter your niche, and a bank of
              ready-to-execute video ideas appears in seconds, each grounded in a formula with a
              documented track record for click-through rate, watch time, and engagement.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> The 12 Video Formulas Behind Every Successful YouTube Channel
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every viral YouTube video — regardless of niche — uses one of a finite set of proven
              content formulas. Controversy videos challenge conventional wisdom and trigger immediate
              emotional engagement. Stop-warning videos use loss aversion psychology to compel
              immediate clicks. Curiosity-gap videos create an information void that viewers feel
              psychologically driven to fill. Personal story videos generate emotional investment and
              watch-time through authentic narrative.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Experiment videos document a structured challenge with an uncertain outcome, creating
              natural suspense that boosts completion rate — YouTube's most heavily weighted ranking
              signal. Mistakes-listicle videos combine self-assessment anxiety (Am I making these
              mistakes?) with the relief of a clear solution. Comparison videos attract viewers at the
              decision stage, who are more engaged, more trusting, and more likely to click affiliate
              links. Trending topic videos receive algorithmic boosts during their relevance window
              and expose channels to entirely new audience segments.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The generator applies all twelve formulas to your specific niche keywords, weights them
              according to your chosen goal and tone, and presents the best matches ranked by virality
              potential. Each idea also includes the opening hook — the first 10-second script that
              must immediately justify why the viewer clicked. Pair your ideas with an optimized{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                YouTube title
              </Link>,{" "}
              keyword-rich{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                video description
              </Link>, and strategic{" "}
              <Link href="/tools/youtube-hashtag-generator" className="text-primary hover:underline font-medium">
                hashtags
              </Link>{" "}
              for a complete upload strategy.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> How to Build a 90-Day Content Calendar from Generated Ideas
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Generate a large batch (20–30 ideas), then sort them into three buckets: immediate
              uploads (trending ideas and high-virality formulas that benefit from timing), evergreen
              anchors (beginner guides, complete tutorials, comparison videos that drive consistent
              long-term search traffic), and future experiments (ideas that require more production
              planning like 30-day challenges or case studies).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Save your favorites to the Saved Ideas tab — your idea bank persists across sessions.
              Aim to always have at least 4 weeks of approved ideas ready before filming begins, so
              content production never blocks your publishing schedule. Use Regenerate freely to
              explore variations and find angles you hadn't considered. A creator who publishes
              consistently from a well-organized idea bank will always outgrow a more talented creator
              who waits for inspiration. Build your{" "}
              <Link href="/tools/youtube-channel-name-generator" className="text-primary hover:underline font-medium">
                channel brand
              </Link>{" "}
              alongside your content calendar for a complete creator strategy.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Video Idea Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "12 proven video formulas — not generic suggestions, but psychologically grounded templates",
                "Virality score (1–10) for each idea based on formula strength and niche match",
                "'Why It Works' explanation for every idea — understand the psychology before you film",
                "Suggested hook for every idea — your first 10 seconds written before you open a script doc",
                "5 content goals and 5 tone settings — tailored output for your specific strategy",
                "Trending Formats tab — formats with current algorithmic momentum built in",
                "Saved Ideas tab with localStorage persistence — your idea bank survives browser refresh",
                "5–30 idea count slider — generate as few or as many as your content calendar needs",
                "Works for any niche — 14 pre-built keyword pools plus smart auto-detection",
                "100% free, no account required, unlimited generation sessions",
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
            { name: "YouTube Script Generator", path: "/tools/youtube-script-generator", desc: "Turn your best video ideas into full scripts with hooks, body, and strong CTAs." },
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Generate 40+ high-CTR title formulas for the video ideas you want to pursue." },
            { name: "YouTube Hashtag Generator", path: "/tools/youtube-hashtag-generator", desc: "Find the perfect hashtags for each video idea to maximize discovery at upload." },
            { name: "YouTube Channel Name Generator", path: "/tools/youtube-channel-name-generator", desc: "Generate a memorable brand name that matches your video content niche." },
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

      {/* ── FAQ Accordion ───────────────────────────────────── */}
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
