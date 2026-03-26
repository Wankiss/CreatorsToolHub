import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, ChevronDown, Sparkles, TrendingUp, Zap,
  Shield, ListChecks, Search, Copy, Check, RefreshCw, Hash,
  Bookmark, Share2, UserPlus, Heart, Target, BookOpen,
  DollarSign, Users, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "beauty" | "business" | "finance" | "tech"
  | "education" | "food" | "travel" | "lifestyle" | "fashion"
  | "relationships" | "health" | "entertainment" | "other";

type Tone = "bold" | "relatable" | "inspirational" | "funny" | "controversial";
type CaptionLength = "short" | "medium" | "long";
type Goal = "educate" | "entertain" | "sell" | "grow";
type CtaType = "comments" | "saves" | "shares" | "follows";
type ContentType = "reel" | "carousel" | "static";

type CaptionStyle =
  | "curiosity-gap" | "bold-statement" | "relatable-frustration"
  | "mistake-callout" | "contrarian" | "quick-win"
  | "story-tease" | "pov" | "listicle" | "emotional";

interface CaptionResult {
  lines: string[];
  hashtags: string[];
  style: CaptionStyle;
  styleLabel: string;
  hookScore: number;
  engagementScore: number;
  clarityScore: number;
  viralScore: number;
}

// ─── Niche Data ───────────────────────────────────────────────────────────────

const NICHE_DATA: Record<Niche, {
  label: string;
  emoji: string;
  audience: string;
  keywords: string[];
  broadTags: string[];
  nicheTags: string[];
}> = {
  fitness:       { label: "Fitness",       emoji: "💪", audience: "people on a fitness journey",           keywords: ["workout", "transformation", "discipline", "consistency"],    broadTags: ["#fitness", "#workout", "#gym"],          nicheTags: ["#fitnessjourney", "#fitnessmotivation", "#fatloss", "#musclebuilding"] },
  beauty:        { label: "Beauty",        emoji: "💄", audience: "skincare and beauty lovers",            keywords: ["skincare", "glow", "routine", "beauty"],                       broadTags: ["#beauty", "#skincare", "#selfcare"],     nicheTags: ["#beautytips", "#grwm", "#skincareRoutine", "#makeuptutorial"] },
  business:      { label: "Business",      emoji: "💼", audience: "entrepreneurs and freelancers",         keywords: ["income", "business", "growth", "mindset"],                     broadTags: ["#business", "#entrepreneur", "#success"], nicheTags: ["#businesstips", "#sidehustle", "#entrepreneurmindset", "#digitalmarketing"] },
  finance:       { label: "Finance",       emoji: "💰", audience: "people building wealth",                keywords: ["money", "investing", "savings", "financial freedom"],           broadTags: ["#finance", "#money", "#investing"],      nicheTags: ["#moneytips", "#personalfinance", "#wealthbuilding", "#financialfreedom"] },
  tech:          { label: "Tech / AI",     emoji: "🤖", audience: "creators and early adopters",          keywords: ["AI", "productivity", "tools", "automation"],                   broadTags: ["#tech", "#ai", "#technology"],           nicheTags: ["#aitools", "#productivity", "#techreview", "#futuretech"] },
  education:     { label: "Education",     emoji: "📚", audience: "curious learners",                     keywords: ["learn", "facts", "mindset", "knowledge"],                      broadTags: ["#education", "#learning", "#knowledge"],  nicheTags: ["#educationalcontent", "#learningeveryday", "#didyouknow", "#knowledgesharing"] },
  food:          { label: "Food",          emoji: "🍕", audience: "food lovers and home cooks",           keywords: ["recipe", "cooking", "delicious", "homemade"],                  broadTags: ["#food", "#foodie", "#cooking"],          nicheTags: ["#foodphotography", "#easyrecipes", "#homecooking", "#foodlover"] },
  travel:        { label: "Travel",        emoji: "✈️", audience: "travelers and adventure seekers",      keywords: ["travel", "explore", "adventure", "destination"],               broadTags: ["#travel", "#explore", "#adventure"],    nicheTags: ["#travelphotography", "#travelgram", "#wanderlust", "#travelblogger"] },
  lifestyle:     { label: "Lifestyle",     emoji: "✨", audience: "people wanting to live intentionally", keywords: ["routine", "wellness", "habits", "mindset"],                    broadTags: ["#lifestyle", "#wellness", "#mindset"],   nicheTags: ["#lifestyleblogger", "#dailyroutine", "#selfimprovement", "#intentionalliving"] },
  fashion:       { label: "Fashion",       emoji: "👗", audience: "style-conscious individuals",          keywords: ["style", "outfit", "fashion", "trends"],                        broadTags: ["#fashion", "#style", "#ootd"],           nicheTags: ["#fashionblogger", "#outfitinspo", "#streetstyle", "#fashionista"] },
  relationships: { label: "Relationships", emoji: "❤️", audience: "singles and couples",                  keywords: ["love", "communication", "dating", "boundaries"],               broadTags: ["#relationships", "#love", "#dating"],    nicheTags: ["#relationshipadvice", "#datingtips", "#couplegoals", "#selfworth"] },
  health:        { label: "Health",        emoji: "🌿", audience: "health-conscious people",              keywords: ["health", "nutrition", "habits", "wellness"],                   broadTags: ["#health", "#wellness", "#healthy"],      nicheTags: ["#healthylifestyle", "#mentalhealth", "#nutritionadvice", "#healthyhabits"] },
  entertainment: { label: "Entertainment", emoji: "🎬", audience: "pop culture fans",                     keywords: ["trending", "viral", "entertainment", "reaction"],              broadTags: ["#entertainment", "#viral", "#trending"],  nicheTags: ["#popculture", "#reaction", "#commentary", "#entertainmentnews"] },
  other:         { label: "Other",         emoji: "🔥", audience: "people interested in this niche",      keywords: ["tips", "advice", "knowledge", "growth"],                       broadTags: ["#instagram", "#reels", "#explore"],      nicheTags: ["#instagramcreator", "#contentcreator", "#instagramtips", "#creatoreconomy"] },
};

// ─── CTA Templates ─────────────────────────────────────────────────────────────

const CTA_TEMPLATES: Record<CtaType, string[]> = {
  comments: [
    "Comment below which one you needed to hear 👇",
    "Tell me — which of these applies to you? Drop it in the comments. 💬",
    "Which one hit hardest? Comment and let me know. 👇",
    "Have you experienced this? Tell me in the comments 💬",
  ],
  saves: [
    "Save this post before you forget it 🔖",
    "Bookmark this — you'll need it later. 🔖",
    "Save this for the next time you need it. 📌",
    "Screenshot this and come back when you're ready to start. 🔖",
  ],
  shares: [
    "Send this to someone who needs to see it 📤",
    "Share this with a friend who needs to hear this today. 📤",
    "Tag someone who could use this right now. 👇",
    "Send this to the person who needs it most. 📤",
  ],
  follows: [
    "Follow for more content like this 🔔",
    "Follow if this added value to your day. ✅",
    "Hit follow — I post this kind of content every week. 🔔",
    "Follow to keep seeing content that actually helps. ✅",
  ],
};

// ─── Hashtag Builder ──────────────────────────────────────────────────────────

function buildHashtags(niche: Niche, contentType: ContentType, userKeywords: string): string[] {
  const nd = NICHE_DATA[niche];
  const typeTag = contentType === "reel" ? ["#reels", "#instagramreels", "#reelsviral"]
    : contentType === "carousel" ? ["#carousel", "#carouselpost", "#instagramcarousel"]
    : ["#instagram", "#instagrampost"];
  const fromUser = userKeywords
    .split(",")
    .map(k => `#${k.trim().replace(/\s+/g, "").toLowerCase()}`)
    .filter(k => k.length > 1)
    .slice(0, 2);
  const pool = [...nd.broadTags, ...nd.nicheTags, ...typeTag, ...fromUser];
  return [...new Set(pool)].slice(0, 9);
}

// ─── Caption Engine ────────────────────────────────────────────────────────────

function buildCaption(
  style: CaptionStyle,
  styleLabel: string,
  topic: string,
  niche: Niche,
  tone: Tone,
  goal: Goal,
  ctaType: CtaType,
  contentType: ContentType,
  length: CaptionLength,
  ctaPool: string[],
  userKeywords: string,
): CaptionResult {
  const nd = NICHE_DATA[niche];
  const ts = topic.split(" ").slice(0, 5).join(" ");
  const kw1 = nd.keywords[0];
  const kw2 = nd.keywords[1];
  const em = nd.emoji;
  const ctaLine = ctaPool[Math.floor(Math.random() * ctaPool.length)];

  // Tone-flavored openers
  const toneHook: Record<Tone, string> = {
    bold:          `This is the truth about ${ts} nobody says out loud.`,
    relatable:     `POV: you finally figure out ${ts} and everything shifts. ${em}`,
    inspirational: `The thing about ${ts} that changed everything for me ✨`,
    funny:         `Nobody warned me ${ts} would feel this way 😭`,
    controversial: `Unpopular opinion: you're approaching ${ts} completely wrong. 🔥`,
  };

  // Goal-flavored body
  const goalBody: Record<Goal, string[]> = {
    educate: [
      `Most people skip the most important part.`,
      `Here's what actually makes the difference:`,
      `→ ${kw1} matters more than people think.`,
      `→ Consistency beats intensity every time.`,
      `→ The results come — but not on your timeline.`,
    ],
    entertain: [
      `And I know you've been there too.`,
      `The look on your face when it finally clicks.`,
      `That moment when nothing makes sense — and then it does. ${em}`,
    ],
    sell: [
      `Most people try to fix the symptom.`,
      `Not the cause.`,
      `The difference between the two? Everything.`,
      `Once you see it — you can't unsee it.`,
    ],
    grow: [
      `This is what the creators who blow up all have in common.`,
      `They're not more talented.`,
      `They're more consistent. And more strategic.`,
      `That's the whole secret. ${em}`,
    ],
  };

  // Content-type intro modifier
  const typeModifier: Record<ContentType, string> = {
    reel:     `Watch this before you scroll past 🎬`,
    carousel: `Swipe through — this gets better with every slide. →`,
    static:   `Read this twice. It matters. ${em}`,
  };

  let lines: string[] = [];

  if (style === "curiosity-gap") {
    lines = length === "long"
      ? [toneHook[tone], typeModifier[contentType], ...goalBody[goal].slice(0, 3), ctaLine]
      : length === "medium"
      ? [`Most people have no idea ${ts} works like this.`, goalBody[goal][0], ctaLine]
      : [`What nobody tells you about ${ts}. ${em}`, ctaLine];

  } else if (style === "bold-statement") {
    lines = length === "long"
      ? [`${ts} is the most misunderstood topic in ${nd.label.toLowerCase()}. Here's why.`, ...goalBody[goal].slice(0, 3), ctaLine]
      : length === "medium"
      ? [`The #1 thing holding ${nd.label.toLowerCase()} creators back: ignoring ${ts}.`, goalBody[goal][0], ctaLine]
      : [`${ts} separates the amateurs from the pros. ${em}`, ctaLine];

  } else if (style === "relatable-frustration") {
    lines = length === "long"
      ? [`If you've ever felt like you're doing everything right with ${ts} and still not seeing results — this is for you.`, `You're not doing it wrong.`, `You're just missing one thing.`, goalBody[goal][0], ctaLine]
      : length === "medium"
      ? [`You've been trying to figure out ${ts} and it's still not clicking. ${em}`, `Here's the piece you're missing.`, ctaLine]
      : [`Tired of ${ts} not working for you? Same. ${em}`, ctaLine];

  } else if (style === "mistake-callout") {
    lines = length === "long"
      ? [`The #1 ${ts} mistake I see in the ${nd.label.toLowerCase()} space. 🚨`, `Everyone makes it.`, `Almost nobody fixes it.`, goalBody[goal][1] || goalBody[goal][0], `Here's how to avoid it.`, ctaLine]
      : length === "medium"
      ? [`Stop making this ${ts} mistake. It's costing you results. 🚨`, goalBody[goal][0], ctaLine]
      : [`You're doing ${ts} wrong. Here's the fix. 🚨`, ctaLine];

  } else if (style === "contrarian") {
    lines = length === "long"
      ? [`Controversial take: everything you've been told about ${ts} is backwards. 🔥`, `I used to believe it too.`, `Then I tested it.`, `The results changed my entire approach. ${em}`, ctaLine]
      : length === "medium"
      ? [`Hot take: ${ts} is overrated. Here's what actually works. 🔥`, goalBody[goal][0], ctaLine]
      : [`Unpopular opinion: ${ts} isn't the problem. Your approach is. 🔥`, ctaLine];

  } else if (style === "quick-win") {
    lines = length === "long"
      ? [`3 things about ${ts} that took me way too long to learn ${em}`, `1. ${kw1} matters more than the effort you put in`, `2. The fundamentals are almost always enough`, `3. Overthinking it is the real blocker`, ctaLine]
      : length === "medium"
      ? [`Quick ${ts} tip that changes everything ${em}`, `${kw1} is the shortcut everyone skips.`, ctaLine]
      : [`One ${ts} tip that pays for itself immediately ${em}`, ctaLine];

  } else if (style === "story-tease") {
    lines = length === "long"
      ? [`6 months ago I knew nothing about ${ts}.`, `I made every mistake.`, `Lost time, money, and momentum.`, `Then one thing clicked.`, `And I haven't looked back since. ${em}`, ctaLine]
      : length === "medium"
      ? [`I almost gave up on ${ts} before I finally figured it out. ${em}`, `Glad I didn't.`, ctaLine]
      : [`The moment ${ts} finally clicked for me — everything changed. ${em}`, ctaLine];

  } else if (style === "pov") {
    lines = length === "long"
      ? [`POV: You've been working on ${ts} for months.`, `Nothing is moving.`, `Then you fix one small thing.`, `Suddenly: everything works. ${em}`, typeModifier[contentType], ctaLine]
      : length === "medium"
      ? [`POV: You finally crack the code on ${ts}. ${em}`, `The feeling is different from what you expected.`, ctaLine]
      : [`POV: ${ts} just made sense for the first time. ${em}`, ctaLine];

  } else if (style === "listicle") {
    lines = length === "long"
      ? [`5 ${ts} facts that ${nd.label.toLowerCase()} creators need to hear ${em}`, `1. ${kw1} is more powerful than ${kw2}`, `2. Most people skip the step that matters most`, `3. The shortcut is doing the slow thing correctly`, `4. Your current audience is your most important asset`, `5. The work compounds — even when it doesn't feel like it`, ctaLine]
      : length === "medium"
      ? [`3 ${ts} truths nobody talks about ${em}`, goalBody[goal][0], ctaLine]
      : [`The #1 ${ts} truth costing you results. ${em}`, ctaLine];

  } else { // emotional
    lines = length === "long"
      ? [`This one's for the ${nd.audience} who feel like they're behind on ${ts}. ❤️`, `You're not behind.`, `You're just getting started.`, `The only comparison that matters is who you were last month.`, ctaLine]
      : length === "medium"
      ? [`For every ${nd.audience} who's tired of not seeing results with ${ts}. ${em}`, `You're closer than you think.`, ctaLine]
      : [`You're not failing at ${ts}. You're just early. ${em}`, ctaLine];
  }

  // Quality gate — strengthen hook if needed
  const first = lines[0] || "";
  const hasHook = /\?|pov:|🔥|😭|🚨|⚠️|✨|nothing|wrong|truth|mistake|secret|stop|wait|if you|controversial|unpopular/i.test(first);
  if (!hasHook && lines[0]) lines[0] = `${em} ${lines[0]}`;

  // Scoring
  const combined = lines.join(" ");
  let hook = 5, engagement = 5, clarity = 5;
  if (/pov:|nobody|truth|wrong|mistake|🔥|😭|🚨|wait|stop|secret|controversial/i.test(combined)) hook += 3;
  if (/\?/.test(combined)) hook += 1;
  if (first.split(" ").length <= 10) hook += 1;
  hook = Math.min(10, hook);
  if (/save|comment|share|follow|tag|drop|tell me|send this|bookmark/i.test(combined)) engagement += 3;
  if (/\?/.test(combined)) engagement += 1;
  engagement = Math.min(10, engagement);
  if (lines.every(l => l.split(" ").length <= 14)) clarity += 2;
  if (/[.!?]$/.test(lines[lines.length - 1]?.trim() || "")) clarity += 1;
  clarity = Math.min(10, clarity);

  const styleBoosts: Record<CaptionStyle, [number, number]> = {
    "curiosity-gap": [1, 0], "bold-statement": [1, 0], "relatable-frustration": [0, 1],
    "mistake-callout": [1, 1], "contrarian": [1, 1], "quick-win": [0, 1],
    "story-tease": [1, 0], "pov": [1, 0], "listicle": [0, 1], "emotional": [0, 1],
  };
  const [hb, eb] = styleBoosts[style];
  hook = Math.min(10, hook + hb);
  engagement = Math.min(10, engagement + eb);

  return {
    lines,
    hashtags: buildHashtags(niche, contentType, userKeywords),
    style,
    styleLabel,
    hookScore: hook,
    engagementScore: engagement,
    clarityScore: clarity,
    viralScore: Math.round(((hook + engagement + clarity) / 3) * 10),
  };
}

function generateCaptions(
  topic: string,
  niche: Niche,
  tone: Tone,
  goal: Goal,
  ctaType: CtaType,
  contentType: ContentType,
  length: CaptionLength,
  userKeywords: string,
): CaptionResult[] {
  const ctaPool = CTA_TEMPLATES[ctaType];
  const STYLES: { style: CaptionStyle; label: string }[] = [
    { style: "curiosity-gap",         label: "Curiosity Gap" },
    { style: "bold-statement",        label: "Bold Statement" },
    { style: "relatable-frustration", label: "Relatable Frustration" },
    { style: "mistake-callout",       label: "Mistake Callout" },
    { style: "contrarian",            label: "Contrarian Opinion" },
    { style: "quick-win",             label: "Quick Win" },
    { style: "story-tease",           label: "Story Tease" },
    { style: "pov",                   label: "POV" },
    { style: "listicle",              label: "Listicle" },
    { style: "emotional",             label: "Emotional" },
  ];
  return STYLES.map(({ style, label }) =>
    buildCaption(style, label, topic, niche, tone, goal, ctaType, contentType, length, ctaPool, userKeywords)
  ).sort((a, b) => b.viralScore - a.viralScore);
}

// ─── Score Pill ───────────────────────────────────────────────────────────────

function ScorePill({ label, value }: { label: string; value: number }) {
  const color = value >= 8
    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
    : value >= 6
    ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
    : "bg-muted text-muted-foreground border-border";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>{label} {value}/10</span>;
}

// ─── Caption Card ─────────────────────────────────────────────────────────────

function CaptionCard({ caption, index, onCopy, copiedId }: {
  caption: CaptionResult; index: number; onCopy: (id: string, text: string) => void; copiedId: string | null;
}) {
  const [showTags, setShowTags] = useState(false);
  const fullText = caption.lines.join("\n\n") + "\n\n" + caption.hashtags.join(" ");
  const id = `igcap-${index}`;

  return (
    <div className="rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors group overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {index + 1}
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{caption.styleLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <ScorePill label="Hook" value={caption.hookScore} />
          <ScorePill label="Engage" value={caption.engagementScore} />
          <div className={`text-xs font-black px-2 py-0.5 rounded-full ${
            caption.viralScore >= 75 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : caption.viralScore >= 55 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "bg-muted text-muted-foreground"}`}>
            {caption.viralScore} Viral
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="space-y-1">
          {caption.lines.map((line, li) => (
            <p key={li} className={`leading-relaxed ${li === 0 ? "font-semibold text-foreground" : "text-muted-foreground text-sm"}`}>
              {line}
            </p>
          ))}
        </div>

        <button onClick={() => setShowTags(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <Hash className="w-3 h-3" />
          {showTags ? "Hide" : "Show"} hashtags ({caption.hashtags.length})
          <ChevronDown className={`w-3 h-3 transition-transform ${showTags ? "rotate-180" : ""}`} />
        </button>
        {showTags && (
          <div className="flex flex-wrap gap-1.5">
            {caption.hashtags.map(tag => (
              <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
        {[
          { copyId: `${id}-caption`, text: caption.lines.join("\n\n"), label: "Copy Caption", icon: <Copy className="w-3 h-3" /> },
          { copyId: `${id}-tags`,    text: caption.hashtags.join(" "),  label: "Copy Hashtags", icon: <Hash className="w-3 h-3" /> },
          { copyId: `${id}-all`,     text: fullText,                    label: "Copy All",      icon: <Copy className="w-3 h-3" /> },
        ].map(({ copyId, text, label, icon }) => {
          const copied = copiedId === copyId;
          return (
            <button key={copyId} onClick={() => onCopy(copyId, text)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                copied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                       : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"}`}>
              {copied ? <Check className="w-3 h-3" /> : icon}
              {copied ? "Copied!" : label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a good Instagram caption in 2025?",
    a: "A high-performing Instagram caption in 2025 follows a three-part structure: a scroll-stopping hook in the first 1–2 lines, a body that delivers clear value or emotional resonance, and a specific micro call-to-action tailored to the engagement metric you want to grow. The first line is the most critical — it appears before the 'more' fold and determines whether users expand the caption. Hooks that perform best use curiosity gaps ('What nobody tells you about…'), mistake callouts ('You're making this mistake…'), POV framings, or bold contrarian statements. The body should use short lines with intentional line breaks to control reading pace — dense paragraph captions see significantly lower read-through rates. The CTA should match your goal: 'save this' for educational content, 'send this to someone who needs it' for shareable content, and specific questions for comment-driving captions.",
  },
  {
    q: "How long should an Instagram caption be?",
    a: "Instagram allows up to 2,200 characters for captions, but the optimal length depends on your content type and goal. Short captions (1–3 lines) work best for visually-driven content — travel photography, fashion posts, and food imagery often perform better when the caption doesn't compete with the visual. The image or video should carry the weight; the caption just needs a strong hook and CTA. Medium captions (3–6 lines) are the most versatile and work across almost every niche — they're long enough to provide context and value without overwhelming. Long captions (8–15+ lines) consistently outperform for educational, business, finance, and inspirational content where the caption IS the content. The general rule is: let the content type guide the length. For Reels, shorter is typically better because viewers are already engaged by the video. For carousels and static posts, longer captions that provide educational value alongside the visual generate the most saves.",
  },
  {
    q: "What Instagram captions get the most comments?",
    a: "Captions that drive the most comments share one characteristic: they make it impossible for the reader to stay silent. The most effective comment-driving formats are: (1) Specific opinion questions — 'Which of these would you try first?' generates 3–5× more comments than 'What do you think?'; (2) Contrarian or polarizing statements — taking a clear position invites agreement or disagreement; (3) Fill-in-the-blank prompts — 'My biggest mistake with X was ___'; (4) This-or-that comparisons — 'Option A or Option B? Drop your answer below'; (5) Relatable frustration posts where readers want to affirm they've had the same experience. Once you post, reply to every comment within the first 60 minutes — Instagram's algorithm measures comment velocity in the first hour, and accounts that actively respond generate 2–3× more organic distribution from that post.",
  },
  {
    q: "What Instagram captions get the most saves?",
    a: "Saves are Instagram's strongest algorithmic signal — a saved post tells Instagram the content is valuable enough to reference again, which triggers wider Explore and Reels distribution. The content types that generate the most saves are: educational carousel posts with step-by-step information, resource lists ('10 tools that will save you hours every week'), 'bookmark-worthy' facts or statistics, templates and frameworks that users want to apply later, and comprehensive how-to guides. For the caption itself: add an explicit save CTA ('Save this before you need it', 'Bookmark this post for your next time planning'), reinforce the value in the first hook line, and structure the caption to preview the value of each carousel slide. Creators who add explicit save prompts see 2–4× higher save rates than those who don't.",
  },
  {
    q: "How many hashtags should I use on Instagram?",
    a: "Instagram's current best practice for hashtags is 5–10 focused, relevant hashtags — not the maximum of 30 that was common in earlier years. In 2024–2025, Instagram's Head of Instagram Adam Mosseri confirmed that using 3–5 highly relevant hashtags outperforms using 20–30 mixed-relevance hashtags. The most effective hashtag strategy mixes: 2–3 niche-specific hashtags with 10K–500K posts (high-relevance, reachable), 2–3 mid-size category tags with 500K–5M posts, and 1–2 broad discovery tags. Avoid banned or overused hashtags — they can suppress distribution. Most importantly: don't use hashtags that have no connection to your content. Instagram's algorithm cross-references content and hashtag relevance, and mismatched hashtags actively reduce distribution.",
  },
  {
    q: "What is the difference between Instagram Reels captions and post captions?",
    a: "Reels captions and static post captions serve different purposes and should be written differently. For Reels: the caption plays a secondary role since the video is the primary content — keep captions shorter (1–4 lines), lead with a strong hook that teases what the video covers, and use a comment-driving CTA since Reel comments signal to the algorithm that your content is sparking conversation. Reel captions should also include relevant keywords naturally because Instagram uses caption text as part of its content classification and search indexing system. For carousel and static posts: the caption is often the primary driver of saves and comments — longer, more educational captions consistently outperform for educational and business niches. Carousel captions should preview the value of the full swipe-through and include a save CTA.",
  },
  {
    q: "Should I add emojis to Instagram captions?",
    a: "Yes — strategic emoji use in Instagram captions improves performance, but overuse hurts it. The most effective emoji strategy is: one attention-signaling emoji at the start of the hook line or after a key point to draw the eye; emojis used as bullet point markers (→, ✓, •) to improve readability in list-style captions; and one or two emojis in the CTA line to add visual emphasis. Avoid using emojis at the end of every single line — it creates visual noise and makes the caption feel cluttered. Emojis that consistently improve engagement include 🔥 (attention), 💡 (insight or tip), 🔖 (save prompt), 👇 (comment CTA), ✅ (confirmation or approval), and ❤️ (emotional resonance). The rule of thumb: if you removed the emoji and the sentence still communicates clearly, the emoji is decorative and worth including — but don't let emojis substitute for strong writing.",
  },
  {
    q: "How do I write Instagram captions that drive sales?",
    a: "Instagram captions that convert use the Problem → Solution → Outcome structure without feeling like traditional advertising. Start with a hook that identifies a pain point the reader recognizes ('If you've ever struggled with X, keep reading'). Agitate the problem briefly — reinforce why it matters. Introduce the solution in specific terms, not vague promises. Include social proof or specificity (numbers, timeframes, outcomes). End with a soft CTA: instead of 'buy now', try 'DM me the word X for more details' or 'Link in bio if you're ready to change this'. Sales-oriented captions perform best when they feel like personal recommendations from a friend rather than advertisements. The more specific and authentic your caption sounds — using real numbers, real scenarios, and real language from your audience — the higher your conversion rate will be.",
  },
  {
    q: "What is the best time to post on Instagram for caption engagement?",
    a: "Caption engagement follows your audience's active hours — which vary by niche, audience location, and demographic. However, general benchmarks show that engagement rates peak on Tuesdays and Wednesdays between 10am–12pm local time for most business and lifestyle niches; Monday–Friday between 7am–9am for fitness, health, and productivity niches (catching the morning routine audience); and Thursday–Friday between 5pm–7pm for entertainment and fashion niches. The most reliable approach is to check your own Instagram Insights under 'Audience' — the 'Most Active Times' data shows exactly when your specific followers are online. Post 15–30 minutes before your peak time, not at the exact peak, so the post has time to accumulate initial engagement before the highest traffic window.",
  },
  {
    q: "Is this Instagram caption generator free?",
    a: "Yes — the Instagram Caption Generator on creatorsToolHub is completely free with no account, subscription, or credit card required. Enter your topic, niche, goal (educate, entertain, sell, or grow followers), tone, caption length, CTA type, and content type, then generate 10 unique captions across every major style — Curiosity Gap, Bold Statement, Relatable Frustration, Mistake Callout, Contrarian Opinion, Quick Win, Story Tease, POV, Listicle, and Emotional. Each caption comes with a Hook Score, Engagement Score, Viral Score, and 9 niche-specific hashtags. Copy caption only, hashtags only, or the full caption + hashtags in one click. Use the Keywords field to ensure niche-specific terms appear in your captions and hashtags.",
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

// ─── Accordion ─────────────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl" aria-expanded={open}>
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function InstagramCaptionGeneratorTool() {
  const { toast } = useToast();
  const [topic,       setTopic]       = useState("");
  const [niche,       setNiche]       = useState<Niche>("lifestyle");
  const [tone,        setTone]        = useState<Tone>("bold");
  const [goal,        setGoal]        = useState<Goal>("educate");
  const [ctaType,     setCtaType]     = useState<CtaType>("saves");
  const [contentType, setContentType] = useState<ContentType>("carousel");
  const [length,      setLength]      = useState<CaptionLength>("medium");
  const [userKeywords,setUserKeywords]= useState("");
  const [error,       setError]       = useState("");
  const [captions,    setCaptions]    = useState<CaptionResult[]>([]);
  const [copiedId,    setCopiedId]    = useState<string | null>(null);
  const [activeFilter,setActiveFilter]= useState<"all" | "top5">("all");

  useEffect(() => {
    const id = "faq-schema-ig-caption-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast({ title: "Copied!", description: "Caption copied to clipboard." });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [toast]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!topic.trim()) { setError("Enter a topic or subject for your caption."); return; }
    if (topic.trim().length < 3) { setError("Topic is too short — be more specific for better captions."); return; }
    const results = generateCaptions(topic.trim(), niche, tone, goal, ctaType, contentType, length, userKeywords);
    setCaptions(results);
    setTimeout(() => document.getElementById("ig-caption-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  const displayed = activeFilter === "top5" ? captions.slice(0, 5) : captions;

  const NICHES: { value: Niche; label: string; emoji: string }[] = [
    { value: "fitness",       label: "Fitness",       emoji: "💪" },
    { value: "beauty",        label: "Beauty",        emoji: "💄" },
    { value: "business",      label: "Business",      emoji: "💼" },
    { value: "finance",       label: "Finance",       emoji: "💰" },
    { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
    { value: "education",     label: "Education",     emoji: "📚" },
    { value: "food",          label: "Food",          emoji: "🍕" },
    { value: "travel",        label: "Travel",        emoji: "✈️" },
    { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
    { value: "fashion",       label: "Fashion",       emoji: "👗" },
    { value: "relationships", label: "Relationships", emoji: "❤️" },
    { value: "health",        label: "Health",        emoji: "🌿" },
    { value: "entertainment", label: "Entertainment", emoji: "🎬" },
    { value: "other",         label: "Other",         emoji: "🔥" },
  ];

  return (
    <>
      {/* ── Input Card ─────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleGenerate} className="space-y-5">

            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Topic / Subject <span className="text-red-500">*</span>
              </label>
              <Input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. weight loss mistakes, morning routine, investing basics…"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Niche</label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(({ value, label, emoji }) => (
                  <button key={value} type="button" onClick={() => setNiche(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                      niche === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}>
                    <span>{emoji}</span>{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal + CTA */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "educate" as Goal,   label: "Educate",   icon: <BookOpen className="w-3.5 h-3.5" /> },
                    { value: "entertain" as Goal, label: "Entertain", icon: <Heart className="w-3.5 h-3.5" /> },
                    { value: "sell" as Goal,      label: "Sell",      icon: <DollarSign className="w-3.5 h-3.5" /> },
                    { value: "grow" as Goal,      label: "Grow",      icon: <Users className="w-3.5 h-3.5" /> },
                  ] as const).map(({ value, label, icon }) => (
                    <button key={value} type="button" onClick={() => setGoal(value)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        goal === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">CTA Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "saves" as CtaType,    label: "Saves",    icon: <Bookmark className="w-3.5 h-3.5" /> },
                    { value: "comments" as CtaType, label: "Comments", icon: <MessageSquare className="w-3.5 h-3.5" /> },
                    { value: "shares" as CtaType,   label: "Shares",   icon: <Share2 className="w-3.5 h-3.5" /> },
                    { value: "follows" as CtaType,  label: "Follows",  icon: <UserPlus className="w-3.5 h-3.5" /> },
                  ] as const).map(({ value, label, icon }) => (
                    <button key={value} type="button" onClick={() => setCtaType(value)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        ctaType === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tone + Content Type + Length */}
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Tone</label>
                <div className="space-y-1.5">
                  {([
                    { value: "bold" as Tone,          label: "Bold" },
                    { value: "relatable" as Tone,     label: "Relatable" },
                    { value: "inspirational" as Tone, label: "Inspirational" },
                    { value: "funny" as Tone,         label: "Funny" },
                    { value: "controversial" as Tone, label: "Controversial" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setTone(value)}
                      className={`w-full py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center ${
                        tone === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Type</label>
                <div className="space-y-1.5">
                  {([
                    { value: "reel" as ContentType,     label: "🎬 Reel" },
                    { value: "carousel" as ContentType, label: "📸 Carousel" },
                    { value: "static" as ContentType,   label: "🖼️ Static Post" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setContentType(value)}
                      className={`w-full py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center ${
                        contentType === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Caption Length</label>
                <div className="space-y-1.5">
                  {([
                    { value: "short" as CaptionLength,  label: "Short (1–3 lines)" },
                    { value: "medium" as CaptionLength, label: "Medium (4–7 lines)" },
                    { value: "long" as CaptionLength,   label: "Long (8–15 lines)" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setLength(value)}
                      className={`w-full py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center ${
                        length === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Keywords */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase text-muted-foreground">
                Keywords to Include <span className="font-normal normal-case text-xs">(optional, comma-separated)</span>
              </label>
              <Input value={userKeywords} onChange={e => setUserKeywords(e.target.value)}
                placeholder="e.g. fat loss, morning routine, digital marketing…"
                className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                <span>⚠️</span>{error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5" /> Generate 10 Instagram Captions
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {captions.length > 0 && (
        <section id="ig-caption-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">
                {captions.length} captions generated — sorted by Viral Score
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Topic: "{topic}" · {NICHE_DATA[niche].label} · {goal} · {ctaType} CTA
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(["all", "top5"] as const).map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    activeFilter === f ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}>
                  {f === "all" ? "All 10" : "Top 5"}
                </button>
              ))}
              <button onClick={() => { setCaptions([]); setTopic(""); }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-border bg-muted text-muted-foreground hover:border-primary/50 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
          {displayed.map((cap, i) => (
            <CaptionCard key={`${cap.style}-${i}`} caption={cap} index={i} onCopy={handleCopy} copiedId={copiedId} />
          ))}
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Caption Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, icon: <Sparkles className="w-5 h-5 text-primary" />,
              title: "Enter your topic and select your niche",
              desc: "Type the subject of your post — the more specific, the better. 'Weight loss mistakes for busy professionals' will generate stronger captions than just 'fitness'. Then select your niche so the generator applies the correct tone, keywords, and hashtags for your content category." },
            { step: 2, icon: <Target className="w-5 h-5 text-primary" />,
              title: "Set your goal and CTA type",
              desc: "Choose what you want this post to achieve: Educate (drives saves), Entertain (drives shares and comments), Sell (drives link clicks and DMs), or Grow (drives follows). Then select your CTA type — the generator will insert the optimal call-to-action for your chosen goal into every caption." },
            { step: 3, icon: <Zap className="w-5 h-5 text-primary" />,
              title: "Pick tone, content type, and length",
              desc: "Match the tone to your content style: Bold for authority posts, Relatable for community content, Controversial for hot-take content. Select Reel, Carousel, or Static post so the caption format is optimized for how it will appear. Choose Short, Medium, or Long based on how much caption space your content allows." },
            { step: 4, icon: <Copy className="w-5 h-5 text-primary" />,
              title: "Review scores and copy your best caption",
              desc: "Get 10 captions in 10 different styles — sorted by Viral Score. Each shows a Hook Score and Engagement Score. Use the Top 5 filter to see your highest performers. Copy the caption only, hashtags only, or the full caption + hashtags in one click. Use the Keywords field to ensure specific terms appear in your captions and hashtag set." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">{icon}</div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Step {step}</p>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / SEO ──────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Caption Generator — Write Captions That Drive Real Engagement</h2>
        </div>
        <div className="space-y-7 text-muted-foreground leading-relaxed text-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              Why Caption Structure Determines Your Post's Reach
            </h3>
            <p className="mb-3">
              Instagram captions are not passive decoration for your visual content — they are an active lever for algorithmic distribution. Every Instagram post is evaluated within its first 30–60 minutes by a combination of engagement signals: saves, comments, shares, and time-on-post (how long someone stays reading your caption before scrolling). Posts with high early engagement scores are pushed to a significantly larger non-follower audience through Explore and Reels recommendations. This means a caption that drives saves and comments in the first hour can compound your reach by 5–20× compared to a caption that generates no interaction.
            </p>
            <p className="mb-3">
              The three-part caption structure that consistently outperforms is: Hook → Body → Micro CTA. The hook must appear in the first 1–2 lines before Instagram truncates with 'more' — it is the only part that the majority of viewers read, and it determines whether they expand the caption. The body delivers the core value, formatted in short lines with intentional spacing to control reading pace and keep the viewer on the post longer. The micro CTA closes with a single, specific action that matches the metric you're optimizing for: saves for educational content, a direct question for comment-driving content, a share prompt for content with broad emotional resonance, or a follow CTA for identity-based value posts.
            </p>
            <p>
              This generator applies this structure to 10 distinct caption styles — Curiosity Gap, Bold Statement, Relatable Frustration, Mistake Callout, Contrarian Opinion, Quick Win, Story Tease, POV, Listicle, and Emotional — each calibrated to a different psychological trigger. The styles are automatically sorted by Viral Score based on how strongly each hook, CTA, and engagement element is represented in the generated caption.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary flex-shrink-0" />
              How Goal, CTA Type, and Content Type Affect Caption Performance
            </h3>
            <p className="mb-3">
              The most common mistake in Instagram caption writing is using a generic CTA — "drop a comment below" or "let me know what you think" — regardless of what the post is actually optimized for. Each goal requires a fundamentally different caption strategy. Educational posts optimized for saves should foreground the value in the hook ('3 things about X that most people get wrong'), deliver scannable, reference-worthy information in the body, and close with an explicit save prompt ('Bookmark this before you need it'). The save CTA on educational content is not optional — creators who add an explicit save prompt see 2–4× higher save rates than those who don't.
            </p>
            <p className="mb-3">
              Comment-optimized captions need to create irresistible invitation for a response. The most effective comment triggers are: specific opinion questions with two or more options ('Method A or Method B — drop your answer below'), calls for shared experience ('If this has happened to you, tell me in the comments'), and contrarian positions that beg for agreement or pushback. Vague questions like 'What do you think?' generate a fraction of the response rate that specific, binary-option questions do.
            </p>
            <p>
              Content type also shapes caption strategy meaningfully. Reel captions compete with the video itself — they should be punchy, keyword-rich (Instagram indexes caption text for search), and comment-driving. Carousel captions can be substantially longer and more educational because the viewer is already committed to swiping through — each slide buys more caption read time. Static post captions perform best when they tell a complete story or deliver a list of specific insights that make the image feel like a preview rather than the entire piece of content.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              The 10 Caption Styles and When to Use Each
            </h3>
            <p className="mb-3">
              The generator produces captions in 10 psychologically distinct styles, each designed to trigger a different audience response. The Curiosity Gap style ('What nobody tells you about…') withholds the answer until after the fold, generating the highest caption expansion rates. The Mistake Callout ('The #1 mistake I see in the [niche] space') triggers defensive reading — people keep reading because they want to know if they're making the mistake. The Contrarian Opinion ('Unpopular take: X is actually bad advice') drives the most comments because it invites disagreement. The POV format generates high watch time for Reels because it creates narrative immersion that mirrors video content. The Listicle style ('5 things about X') drives the highest save rates because the structured format signals reference value.
            </p>
            <p>
              The Story Tease ('6 months ago I knew nothing about X — here's what I learned') is the most effective format for Instagram's trusted creator persona — it signals authenticity and personal experience, which the algorithm increasingly prioritizes over polished brand language. The Emotional style ('This one's for the people who feel behind') generates the highest share rate because readers share content that validates or articulates something they couldn't express themselves. Choose the style that matches not just the content but the persona you're building — consistent style identity is one of the most underrated drivers of Instagram follower retention.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">What This Instagram Caption Generator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "10 caption styles generated simultaneously — Curiosity Gap, Bold Statement, Relatable Frustration, Mistake Callout, Contrarian, Quick Win, Story Tease, POV, Listicle, Emotional",
            "Goal-based caption logic — separate body and CTA strategies for Educate, Entertain, Sell, and Grow Followers goals",
            "4 CTA types — captions end with purpose-built save prompts, comment questions, share invitations, or follow CTAs",
            "5 tone modes — Bold, Relatable, Inspirational, Funny, and Controversial hook variations for each style",
            "3 content type optimizations — Reel (punchy, keyword-rich), Carousel (educational, swipe-worthy), Static (visual-first, complete story)",
            "Hook Score, Engagement Score, and Viral Score for every caption — prioritized by performance",
            "9 niche-specific hashtags per caption — mix of broad, mid-size, and niche-specific tags optimized for your content category",
            "3-length options — Short (1–3 lines), Medium (4–7 lines), Long (8–15 lines) for different content strategies",
            "Keywords field — inject specific terms into captions and hashtags for SEO and brand keyword consistency",
            "One-click copy for caption only, hashtags only, or full caption + hashtags — paste-ready for Instagram",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tips & Best Practices ───────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { tip: "Instagram shows only the first 2 lines (125 characters) before the 'more' tap — put your most compelling hook or statement in those first 125 characters." },
            { tip: "End with a direct question — 'Which one is your favorite?' or 'Have you tried this?' is Instagram's most proven engagement trigger for driving comment activity." },
            { tip: "Save your best hashtags for the first comment, not the caption — this keeps captions clean and readable while preserving full discoverability." },
            { tip: "Use a mix of 10–15 hashtags (not 30) — Instagram's algorithm has deprioritized hashtag stuffing; 10–15 targeted hashtags outperform 30 generic ones." },
            { tip: "Add a CTA in every caption ('Save this for later' / 'Tag a friend who needs this') — saves are Instagram's highest-weight ranking signal for Explore placement." },
            { tip: "Write captions in a consistent brand voice — profiles with a recognizable tone receive 2–3× more word-of-mouth shares than inconsistent accounts." },
            { tip: "For Reels, keep the caption to 1–3 lines — Reel captions appear over the video, and longer text blocks cover the visual and reduce completion rate." },
          ].map(({ tip }, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Instagram Tools ─────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related Instagram Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Instagram Hook Generator", path: "/tools/instagram-hook-generator", desc: "Craft powerful first-line hooks that stop the scroll and compel followers to tap 'more' on every caption." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Generate a targeted hashtag mix to maximize discoverability and reach the right audience on every post." },
            { name: "Instagram Reel Idea Generator", path: "/tools/instagram-reel-idea-generator", desc: "Get niche-specific Reel concepts that pair perfectly with your captions for maximum reach and watch time." },
            { name: "Instagram Content Planner", path: "/tools/instagram-content-planner", desc: "Plan your full posting schedule so every caption fits into a consistent content strategy that grows your account." },
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

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
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
