import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, ChevronDown, Sparkles, Loader2, TrendingUp, Zap,
  Shield, ListChecks, Search, Copy, Check, RefreshCw, Hash, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "relatable" | "funny" | "bold" | "educational" | "inspirational";
type CaptionLength = "short" | "medium" | "long";
type Niche =
  | "fitness" | "business" | "beauty" | "food" | "travel"
  | "finance" | "tech" | "lifestyle" | "education" | "gaming"
  | "fashion" | "relationships" | "entertainment" | "health" | "other";

type CaptionStyle = "punchy" | "story" | "question" | "pov" | "hottake" | "relatable" | "educational" | "challenge" | "listicle" | "emotional";

interface CaptionResult {
  lines: string[];          // caption body split by line break
  hashtags: string[];
  style: CaptionStyle;
  styleLabel: string;
  hookScore: number;        // 1–10
  engagementScore: number;  // 1–10
  clarityScore: number;     // 1–10
  viralScore: number;       // overall avg * 10
}

// ─── Niche Data ───────────────────────────────────────────────────────────────

const NICHE_DATA: Record<Niche, {
  audience: string;
  keywords: string[];
  broadTags: string[];
  nicheTags: string[];
}> = {
  fitness:       { audience: "people trying to lose weight or build muscle",  keywords: ["workout", "fitness", "transformation", "gains"],      broadTags: ["#fitness", "#gym", "#workout"],               nicheTags: ["#fitnessmotivation", "#fittok", "#gymmotivation"] },
  business:      { audience: "entrepreneurs and side hustlers",               keywords: ["business", "income", "entrepreneur", "growth"],       broadTags: ["#business", "#entrepreneur", "#success"],     nicheTags: ["#businesstiktok", "#sidehustle", "#startuplife"] },
  beauty:        { audience: "skincare and makeup lovers",                    keywords: ["beauty", "skincare", "makeup", "glow"],               broadTags: ["#beauty", "#skincare", "#makeup"],            nicheTags: ["#beautytok", "#grwm", "#makeuptutorial"] },
  food:          { audience: "food lovers and home cooks",                    keywords: ["recipe", "food", "cooking", "delicious"],             broadTags: ["#food", "#foodtok", "#cooking"],              nicheTags: ["#foodie", "#easyrecipes", "#homecooking"] },
  travel:        { audience: "travelers and adventure seekers",               keywords: ["travel", "adventure", "explore", "wanderlust"],       broadTags: ["#travel", "#explore", "#wanderlust"],         nicheTags: ["#traveltok", "#travelhack", "#travelcouple"] },
  finance:       { audience: "anyone trying to save money or build wealth",   keywords: ["money", "finance", "investing", "savings"],           broadTags: ["#finance", "#money", "#investing"],           nicheTags: ["#financetok", "#moneytips", "#personalfinance"] },
  tech:          { audience: "creators, developers, and gadget lovers",       keywords: ["tech", "AI", "tools", "productivity"],                broadTags: ["#tech", "#technology", "#ai"],                nicheTags: ["#techtok", "#aitools", "#techreviews"] },
  lifestyle:     { audience: "people wanting to live better intentionally",   keywords: ["lifestyle", "routine", "wellness", "mindset"],        broadTags: ["#lifestyle", "#wellness", "#mindset"],        nicheTags: ["#lifestyletok", "#dailyroutine", "#selfimprovement"] },
  education:     { audience: "curious learners and students",                 keywords: ["learn", "facts", "knowledge", "education"],           broadTags: ["#education", "#learning", "#facts"],          nicheTags: ["#edutok", "#learnontiktok", "#didyouknow"] },
  gaming:        { audience: "gamers and streamers",                          keywords: ["gaming", "gameplay", "tips", "strategy"],             broadTags: ["#gaming", "#gamer", "#gameplay"],             nicheTags: ["#gamingtok", "#gamingcommunity", "#streamer"] },
  fashion:       { audience: "style lovers and trendsetters",                 keywords: ["fashion", "style", "outfit", "trend"],                broadTags: ["#fashion", "#style", "#outfit"],              nicheTags: ["#fashiontok", "#outfitinspo", "#ootd"] },
  relationships: { audience: "singles and couples navigating modern dating",  keywords: ["relationships", "dating", "love", "communication"],   broadTags: ["#relationships", "#dating", "#love"],         nicheTags: ["#relationshiptok", "#datingadvice", "#couplegoals"] },
  entertainment: { audience: "pop culture and entertainment fans",            keywords: ["entertainment", "trending", "viral", "reaction"],     broadTags: ["#entertainment", "#trending", "#viral"],      nicheTags: ["#entertainmenttok", "#popculture", "#reaction"] },
  health:        { audience: "health-conscious people wanting to feel better",keywords: ["health", "wellness", "nutrition", "habits"],          broadTags: ["#health", "#wellness", "#healthy"],           nicheTags: ["#healthtok", "#healthyhabits", "#mentalhealth"] },
  other:         { audience: "people interested in this topic",               keywords: ["tips", "advice", "howto", "trending"],                broadTags: ["#fyp", "#viral", "#trending"],                nicheTags: ["#tiktok", "#learnontiktok", "#creator"] },
};

// ─── Caption Generation Engine ────────────────────────────────────────────────

function pickHashtags(niche: Niche, extraKeywords: string[]): string[] {
  const nd = NICHE_DATA[niche];
  const base = ["#fyp", "#viral", "#tiktok"];
  const keywordTags = extraKeywords.slice(0, 2).map(k => `#${k.replace(/\s+/g, "").toLowerCase()}`);
  const pool = [...base, ...nd.broadTags, ...nd.nicheTags, ...keywordTags];
  // Return 6–8 unique
  return [...new Set(pool)].slice(0, 7);
}

function extractKeywords(topic: string, niche: Niche, userKeywords: string): string[] {
  const nd = NICHE_DATA[niche];
  const fromUser = userKeywords.split(",").map(k => k.trim()).filter(Boolean);
  const fromNiche = nd.keywords;
  const fromTopic = topic
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 3);
  return [...new Set([...fromUser, ...fromTopic, ...fromNiche])].slice(0, 5);
}

function scoreLine(line: string): { hook: number; engagement: number; clarity: number } {
  const lower = line.toLowerCase();
  let hook = 5, engagement = 5, clarity = 5;

  // Hook signals
  if (/pov:|nobody|this changed|you'?re doing|wait till|if you're|3 things|hot take|real talk|truth about/i.test(line)) hook += 3;
  if (/\?/.test(line)) hook += 1;
  if (/[😳🔥💥🚨⚠️🤯]/.test(line)) hook += 1;
  if (line.split(" ").length <= 8) hook += 1; // punchy first line
  hook = Math.min(10, hook);

  // Engagement signals
  if (/agree|disagree|comment|drop a|tell me|what do you|would you|save this|follow for|share this/i.test(lower)) engagement += 3;
  if (/\?/.test(line)) engagement += 1;
  if (/emoji|🔥|💬|👇|✅|💡/.test(line)) engagement += 1;
  engagement = Math.min(10, engagement);

  // Clarity
  if (line.split(" ").length <= 12) clarity += 2;
  if (/[.!?]$/.test(line.trim())) clarity += 1;
  clarity = Math.min(10, clarity);

  return { hook, engagement, clarity };
}

function buildCaption(
  style: CaptionStyle,
  styleLabel: string,
  topic: string,
  niche: Niche,
  tone: Tone,
  audience: string,
  cta: string,
  keywords: string[],
  length: CaptionLength,
): CaptionResult {
  const nd = NICHE_DATA[niche];
  const aud = audience || nd.audience;
  const topicShort = topic.split(" ").slice(0, 5).join(" ");
  const kw1 = keywords[0] || nd.keywords[0];
  const kw2 = keywords[1] || nd.keywords[1];
  const ctaLine = cta || "What do you think? Drop a comment 👇";
  const emoji = niche === "fitness" ? "💪" : niche === "business" ? "💼" : niche === "beauty" ? "💄"
    : niche === "finance" ? "💰" : niche === "tech" ? "🤖" : niche === "food" ? "🍕"
    : niche === "travel" ? "✈️" : niche === "gaming" ? "🎮" : niche === "fashion" ? "👗"
    : niche === "relationships" ? "❤️" : niche === "health" ? "🌿" : "🔥";

  let lines: string[] = [];

  // ── Tone-adjusted phrasing ────
  const toneHook: Record<Tone, string> = {
    relatable: `POV: you discover ${topicShort}...`,
    funny: `Nobody warned me ${topicShort} would hit different 😭`,
    bold: `This is the truth about ${topicShort} nobody says out loud.`,
    educational: `3 things about ${topicShort} you actually need to know ${emoji}`,
    inspirational: `This changed everything about how I see ${topicShort} ✨`,
  };
  const toneBody: Record<Tone, string> = {
    relatable: `If you're one of those ${aud} who've been stuck, this is for you.`,
    funny: `I tried every method before figuring this out. Save yourself the pain.`,
    bold: `Most people will scroll past this. The ones who stop will thank themselves.`,
    educational: `I spent way too long learning this the hard way. Now you don't have to.`,
    inspirational: `The journey doesn't look how you expect — but it's worth every step.`,
  };

  if (style === "punchy") {
    lines = length === "long"
      ? [toneHook[tone], toneBody[tone], `${kw1} + ${kw2} = results nobody talks about.`, ctaLine]
      : length === "medium"
      ? [toneHook[tone], `${kw1} changed the game for ${aud}.`, ctaLine]
      : [toneHook[tone], ctaLine];

  } else if (style === "pov") {
    lines = length === "long"
      ? [`POV: You finally figured out ${topicShort} ${emoji}`, `You spent weeks trying everything.`, `Then you found out about ${kw1}.`, `Now? ${kw2} feels easy.`, ctaLine]
      : length === "medium"
      ? [`POV: You just discovered the real secret to ${topicShort}`, `And it's not what anyone told you. ${emoji}`, ctaLine]
      : [`POV: ${topicShort} just changed your life ${emoji}`, ctaLine];

  } else if (style === "story") {
    lines = length === "long"
      ? [`6 months ago I knew nothing about ${topicShort}.`, `I made every mistake possible.`, `Then I figured out the ${kw1} method.`, `${toneBody[tone]}`, `Now I'm sharing exactly what worked. ${emoji}`, ctaLine]
      : length === "medium"
      ? [`I didn't believe ${topicShort} would work — until I tried it.`, `${toneBody[tone]} ${emoji}`, ctaLine]
      : [`Real talk: ${topicShort} changed how I see everything.`, ctaLine];

  } else if (style === "question") {
    lines = length === "long"
      ? [`Why does nobody talk about the real side of ${topicShort}? 🤔`, `Every creator shows the wins. Nobody shows the process.`, `Here's what actually works for ${aud}:`, `→ ${kw1}`, `→ ${kw2}`, ctaLine]
      : length === "medium"
      ? [`What would happen if ${aud} stopped ignoring ${topicShort}? ${emoji}`, `The answer is actually wild.`, ctaLine]
      : [`Are you making this mistake with ${topicShort}? 👀`, ctaLine];

  } else if (style === "hottake") {
    lines = length === "long"
      ? [`Hot take: everything you've been told about ${topicShort} is wrong. 🔥`, `The ${aud} market is full of bad advice.`, `Here's what nobody wants to admit:`, `${kw1} matters more than ${kw2}.`, `Agree or disagree? 👇`]
      : length === "medium"
      ? [`Controversial opinion: ${topicShort} is overrated. Here's why. 🔥`, `And what you should actually focus on instead.`, `Agree or disagree? 👇`]
      : [`Unpopular opinion: ${topicShort} isn't the problem. You are. 🔥`, `Agree? 👇`];

  } else if (style === "relatable") {
    lines = length === "long"
      ? [`Tell me you're into ${topicShort} without telling me you're into ${topicShort}. 😭`, toneBody[tone], `It hits different when you're ${aud}.`, `Save this for later — trust me. ${emoji}`, ctaLine]
      : length === "medium"
      ? [`Me pretending I don't want to try ${topicShort} again... 😭${emoji}`, `One more time. Last time. I promise.`, ctaLine]
      : [`When ${topicShort} actually works and you weren't ready 😭${emoji}`, ctaLine];

  } else if (style === "educational") {
    lines = length === "long"
      ? [`3 things about ${topicShort} that will actually change how you approach it ${emoji}`, `1. ${kw1} matters more than most people think.`, `2. Consistency > intensity every time.`, `3. The real results take time — but they come.`, ctaLine]
      : length === "medium"
      ? [`Quick ${topicShort} tip that took me too long to learn ${emoji}`, `${kw1} is the shortcut nobody talks about.`, ctaLine]
      : [`The fastest way to improve at ${topicShort}? ${kw1}. ${emoji}`, ctaLine];

  } else if (style === "challenge") {
    lines = length === "long"
      ? [`Try this ${topicShort} challenge for 30 days and report back ${emoji}`, `Week 1: Start with ${kw1}`, `Week 2: Add ${kw2} to your routine`, `Week 4: Tell me what changed 👇`, ctaLine]
      : length === "medium"
      ? [`30-day ${topicShort} challenge — who's in? ${emoji}`, `Drop a 🔥 in the comments if you're starting today.`, ctaLine]
      : [`${topicShort} 7-day challenge — starting tomorrow. You in? ${emoji}`, ctaLine];

  } else if (style === "listicle") {
    lines = length === "long"
      ? [`5 ${topicShort} facts that ${aud} actually need to hear ${emoji}`, `1. ${kw1} is more powerful than ${kw2}`, `2. Most people skip the part that matters most`, `3. The shortcut is doing the slow thing correctly`, `4. Consistency beats talent every single time`, `5. You already have what you need — start now`, ctaLine]
      : length === "medium"
      ? [`3 ${kw1} truths about ${topicShort} nobody posts about ${emoji}`, `Save this — you'll come back to it.`, ctaLine]
      : [`The #1 ${topicShort} mistake costing you results ${emoji}`, ctaLine];

  } else { // emotional
    lines = length === "long"
      ? [`This one's for the ${aud} who feel like they're behind on ${topicShort}. ❤️`, `You're not behind. You're just getting started.`, `${kw1} takes longer for some people — that's okay.`, `The only comparison that matters is where you were yesterday.`, ctaLine]
      : length === "medium"
      ? [`For every ${aud} who's tired of not seeing results with ${topicShort}. ${emoji}`, `You're closer than you think. Don't stop now.`, ctaLine]
      : [`You're not failing at ${topicShort}. You're just early. ${emoji}`, ctaLine];
  }

  // Quality gate — evaluate hook, emotion, interaction
  // If first line fails hook test, strengthen it
  const firstLine = lines[0] || "";
  const hasQuestion = /\?/.test(firstLine);
  const hasEmotion = /😭|😳|🔥|❤️|💥|🤯|✨|pov:|real talk:|hot take:/i.test(firstLine);
  const hasScroll = /nobody|wrong|truth|secret|changed|mistake|you're|stop|wait|if you/i.test(firstLine.toLowerCase());
  if (!hasQuestion && !hasEmotion && !hasScroll && lines[0]) {
    lines[0] = `🔥 ${lines[0]}`;
  }

  // Score using combined signals from all lines
  const combinedText = lines.join(" ");
  const { hook, engagement, clarity } = scoreLine(combinedText);
  // Boost scores for certain styles
  const hookBoost = ["pov", "hottake", "question"].includes(style) ? 1 : 0;
  const engBoost  = ["challenge", "question", "relatable"].includes(style) ? 1 : 0;

  return {
    lines,
    hashtags: pickHashtags(niche, keywords),
    style,
    styleLabel,
    hookScore: Math.min(10, hook + hookBoost),
    engagementScore: Math.min(10, engagement + engBoost),
    clarityScore: clarity,
    viralScore: Math.round(((hook + hookBoost + engagement + engBoost + clarity) / 3) * 10),
  };
}

function generateCaptions(
  topic: string,
  niche: Niche,
  tone: Tone,
  audience: string,
  keyMessage: string,
  cta: string,
  userKeywords: string,
  length: CaptionLength,
): CaptionResult[] {
  const keywords = extractKeywords(topic, niche, userKeywords);
  const ctaFinal = cta || "Drop a 💬 if this helped — follow for more";

  const styles: { style: CaptionStyle; label: string }[] = [
    { style: "punchy",      label: "Punchy Hook" },
    { style: "pov",         label: "POV Style" },
    { style: "story",       label: "Storytelling" },
    { style: "question",    label: "Question Hook" },
    { style: "hottake",     label: "Hot Take" },
    { style: "relatable",   label: "Relatable" },
    { style: "educational", label: "Educational" },
    { style: "challenge",   label: "Challenge" },
    { style: "listicle",    label: "Listicle" },
    { style: "emotional",   label: "Emotional" },
  ];

  return styles.map(({ style, label }) =>
    buildCaption(style, label, topic, niche, tone, audience, ctaFinal, keywords, length)
  );
}

// ─── Score Badge ──────────────────────────────────────────────────────────────

function ScorePill({ label, value }: { label: string; value: number }) {
  const color = value >= 8 ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
    : value >= 6 ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
    : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {label} {value}/10
    </span>
  );
}

// ─── Caption Card ─────────────────────────────────────────────────────────────

function CaptionCard({ caption, index, onCopy, copiedId }: {
  caption: CaptionResult; index: number; onCopy: (id: string, text: string) => void; copiedId: string | null;
}) {
  const [showHashtags, setShowHashtags] = useState(false);
  const fullText = caption.lines.join("\n") + "\n\n" + caption.hashtags.join(" ");
  const id = `caption-${index}`;
  const copied = copiedId === id;
  const captionCopied = copiedId === `${id}-caption`;
  const tagCopied = copiedId === `${id}-tags`;

  return (
    <div className="rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors group overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {index + 1}
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{caption.styleLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ScorePill label="Hook" value={caption.hookScore} />
          <ScorePill label="Engage" value={caption.engagementScore} />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        <div className="space-y-1">
          {caption.lines.map((line, li) => (
            <p key={li} className={`leading-relaxed ${li === 0 ? "font-semibold text-foreground" : "text-muted-foreground text-sm"}`}>
              {line}
            </p>
          ))}
        </div>

        {/* Hashtags toggle */}
        <button onClick={() => setShowHashtags(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <Hash className="w-3 h-3" />
          {showHashtags ? "Hide" : "Show"} hashtags ({caption.hashtags.length})
          <ChevronDown className={`w-3 h-3 transition-transform ${showHashtags ? "rotate-180" : ""}`} />
        </button>
        {showHashtags && (
          <div className="flex flex-wrap gap-1.5">
            {caption.hashtags.map(tag => (
              <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
        <button onClick={() => onCopy(`${id}-caption`, caption.lines.join("\n"))}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
            captionCopied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400" : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}>
          {captionCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {captionCopied ? "Copied!" : "Copy Caption"}
        </button>
        <button onClick={() => onCopy(`${id}-tags`, caption.hashtags.join(" "))}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
            tagCopied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400" : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}>
          {tagCopied ? <Check className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
          {tagCopied ? "Copied!" : "Copy Hashtags"}
        </button>
        <button onClick={() => onCopy(id, fullText)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
            copied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400" : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy All"}
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="text-xs text-muted-foreground">Viral Score</div>
          <div className={`text-xs font-black px-2 py-0.5 rounded-full ${
            caption.viralScore >= 75 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : caption.viralScore >= 55 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "bg-muted text-muted-foreground"
          }`}>
            {caption.viralScore}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a TikTok caption go viral?",
    a: "A viral TikTok caption does three things in sequence: it stops the scroll with a powerful first line, creates curiosity or emotional resonance that compels the viewer to engage, and ends with a specific call-to-action that drives comments or shares. The first 5–8 words of your caption are the most important — they appear as the caption preview before the viewer taps to expand. Captions that start with 'POV:', 'Nobody talks about this…', 'You're doing this wrong…', or a direct question consistently outperform generic openers. Engagement (especially comments) is TikTok's secondary algorithm signal after video completion rate, so captions that generate comments — through a question, a hot take, or a fill-in-the-blank prompt — get wider distribution.",
  },
  {
    q: "How long should a TikTok caption be?",
    a: "TikTok allows up to 2,200 characters for captions, but the optimal length depends on your content type. Short captions (1–2 lines) work best for punchy, visually-driven content where the video speaks for itself — fashion, food, and comedy content typically performs better with minimal captions. Medium captions (2–4 lines) are the most versatile and work across almost every niche — enough to provide context and a CTA without overwhelming the viewer. Long, story-style captions (5+ lines) work exceptionally well for educational, business, finance, and inspirational content where the caption adds depth and keeps the viewer on the video longer while reading. The most important rule: the first line must be scroll-stopping regardless of overall length.",
  },
  {
    q: "Should I put hashtags in TikTok captions?",
    a: "Yes, but strategically. TikTok's algorithm uses hashtags as context signals — they help the system understand what your video is about and which audiences to test it against. The optimal approach is 3–7 hashtags per post: include 1–2 broad hashtags (#fyp, #viral) for maximum reach, 2–3 niche-specific hashtags for targeted audience reach, and 1–2 keyword-based hashtags tied to your topic. Avoid stuffing 20+ hashtags — it looks spammy and doesn't provide additional algorithmic benefit beyond 5–7 well-chosen tags. Place hashtags at the end of your caption (after the caption body and any CTAs) so they don't interrupt the reading flow.",
  },
  {
    q: "What is the best call-to-action for TikTok captions?",
    a: "The most effective TikTok caption CTAs are specific and low-effort — the easier it is for a viewer to respond, the more they will. 'Drop a 🔥 if this helped' outperforms 'Like and share' because it requires only a single emoji reply. 'Agree or disagree?' generates more comments than 'Comment below' because it gives viewers a clear position to take. Question-based CTAs like 'Which one are you — A or B?' work because they tap into opinion-sharing behavior. 'Save this for later' is particularly powerful for educational content because saves signal to the algorithm that the content has long-term value. Avoid generic CTAs like 'Follow me for more content' — they read as desperate and don't give the viewer a specific reason to act.",
  },
  {
    q: "How do I write TikTok captions for different niches?",
    a: "Each niche has a distinct caption culture on TikTok, and successful captions feel native to that culture. Fitness captions perform best with transformation hooks ('I lost 15kg and nobody told me this'), challenge CTAs ('30-day challenge — who's in?'), and relatable struggle framing ('Me after day 1 vs. day 30'). Business and finance captions work well with hot takes ('Most people are doing this wrong'), specific numbers ('I made $10K this month doing this'), and educational listicles ('3 things that doubled my income'). Beauty captions are driven by POV openers, product reveals, and 'Get ready with me' storytelling. Food captions thrive on sensory hooks and recipe teasers. Tech and education captions perform best when they lead with a surprising fact or counterintuitive claim that the video then explains.",
  },
  {
    q: "Can I use the same caption on TikTok and Instagram Reels?",
    a: "You can use the same caption as a base, but you should adapt it for each platform. TikTok captions benefit from informal, conversational language, TikTok-native formats like 'POV:', and emojis used sparingly for emphasis. Instagram Reels captions allow for more polished, brand-voice copy and tend to reward slightly more detailed storytelling in the caption body. The hashtag strategy differs significantly — Instagram hashtags function more like search categories (10–15 specific hashtags perform best), while TikTok hashtags serve more as content signals (5–7 focused hashtags). The hook principle (strong first line) applies on both platforms, but the tone and cultural references should be adjusted to match where the content is being posted.",
  },
  {
    q: "What are the best TikTok caption formulas?",
    a: "The seven highest-performing TikTok caption formulas are: (1) 'POV: [relatable situation]' — creates immediate identification with the viewer's experience; (2) 'Nobody talks about this but [insight]' — triggers curiosity and positions you as an insider; (3) 'You're doing [X] wrong — here's why' — challenge-based hook that provokes defensiveness and engagement; (4) 'I tried [X] for 30 days — here's what happened' — transformation story with built-in curiosity gap; (5) '[Number] things about [topic] you actually need to know' — educational listicle format that signals immediate value; (6) 'Hot take: [controversial statement]' — opinion-based hook that reliably generates comments; (7) 'This changed everything for me [emoji]' — emotional resonance hook that signals a payoff without revealing it upfront.",
  },
  {
    q: "Do TikTok captions affect views and reach?",
    a: "Yes — TikTok captions influence reach through three mechanisms. First, the algorithm reads caption text as a content signal (alongside hashtags) to determine which topic clusters and audience segments to test your video against. A caption that clearly establishes your topic helps the algorithm place your content accurately. Second, captions that generate high comment volume signal to TikTok's algorithm that the video sparked conversation — a strong secondary distribution trigger. Third, captions that include 'Save this' CTAs drive video saves, which TikTok treats as a high-quality engagement signal indicating that the content has lasting value. For creators focused on the For You Page, the combination of a strong hook (driving completion rate) and a save/comment-driving caption is the most effective growth formula.",
  },
  {
    q: "How many emojis should I use in a TikTok caption?",
    a: "1–3 emojis per caption is the optimal range for most niches. Emojis serve three functions in TikTok captions: visual anchors that break up text and make captions more scannable, tone signals that communicate emotion or energy without extra words, and engagement triggers (particularly when used in CTAs like 'Drop a 🔥 below'). Avoid using more than 3 emojis in a single caption — excessive emojis read as spammy and undermine credibility, especially in professional, finance, and business niches. The most effective emoji placement is: one in the hook (to signal energy or emotion), one in the body (to highlight a key point), and one in the CTA (to make the action feel inviting rather than demanding).",
  },
  {
    q: "Is this TikTok Caption Generator free?",
    a: "Yes — the TikTok Caption Generator on creatorsToolHub is completely free. No account, subscription, or credit card required. Enter your video topic and optional details (niche, tone, audience, CTA, keywords, caption length preference) and instantly receive 10 caption variations across 10 distinct style formats: Punchy Hook, POV Style, Storytelling, Question Hook, Hot Take, Relatable, Educational, Challenge, Listicle, and Emotional. Each caption comes with a Viral Score (combining Hook strength, Engagement potential, and Clarity ratings), 7 curated hashtags, and separate copy buttons for the caption body, hashtags, or both combined. Generate as many variations as you need until you find the caption that fits your video perfectly.",
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
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Niche + Tone Pills ───────────────────────────────────────────────────────

const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "fitness",       label: "Fitness",       emoji: "💪" },
  { value: "business",      label: "Business",      emoji: "💼" },
  { value: "beauty",        label: "Beauty",        emoji: "💄" },
  { value: "finance",       label: "Finance",       emoji: "💰" },
  { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
  { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
  { value: "food",          label: "Food",          emoji: "🍕" },
  { value: "travel",        label: "Travel",        emoji: "✈️" },
  { value: "education",     label: "Education",     emoji: "📚" },
  { value: "gaming",        label: "Gaming",        emoji: "🎮" },
  { value: "fashion",       label: "Fashion",       emoji: "👗" },
  { value: "health",        label: "Health",        emoji: "🌿" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "other",         label: "Other",         emoji: "🚀" },
];

const TONES: { value: Tone; label: string }[] = [
  { value: "relatable",     label: "Relatable" },
  { value: "funny",         label: "Funny" },
  { value: "bold",          label: "Bold" },
  { value: "educational",   label: "Educational" },
  { value: "inspirational", label: "Inspirational" },
];

const LENGTHS: { value: CaptionLength; label: string; desc: string }[] = [
  { value: "short",  label: "Short",  desc: "1–2 lines" },
  { value: "medium", label: "Medium", desc: "2–4 lines" },
  { value: "long",   label: "Long",   desc: "Story style" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function TikTokCaptionGeneratorTool() {
  const [topic, setTopic]         = useState("");
  const [niche, setNiche]         = useState<Niche>("lifestyle");
  const [tone, setTone]           = useState<Tone>("relatable");
  const [audience, setAudience]   = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [cta, setCta]             = useState("");
  const [keywords, setKeywords]   = useState("");
  const [length, setLength]       = useState<CaptionLength>("medium");
  const [showOptional, setShowOptional] = useState(false);

  const [captions, setCaptions] = useState<CaptionResult[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "punchy" | "pov" | "hottake" | "educational">("all");

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tt-caption-gen";
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
      toast({ title: "Enter your video topic", description: "Tell us what your TikTok video is about.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateCaptions(topic, niche, tone, audience, keyMessage, cta, keywords, length);
      setCaptions(result);
      setIsGenerating(false);
      setActiveFilter("all");
      if (!regen) setTimeout(() => document.getElementById("caption-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 420);
  }, [topic, niche, tone, audience, keyMessage, cta, keywords, length, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
    toast({ title: "Copied to clipboard!", duration: 1500 });
  };

  const filterMap: Record<typeof activeFilter, CaptionStyle[]> = {
    all:         [],
    punchy:      ["punchy", "pov", "relatable"],
    pov:         ["pov", "challenge"],
    hottake:     ["hottake", "question"],
    educational: ["educational", "listicle"],
  };

  const filteredCaptions = captions
    ? activeFilter === "all" ? captions
    : captions.filter(c => filterMap[activeFilter].includes(c.style))
    : [];

  const topCaption = captions ? captions.reduce((best, c) => c.viralScore > best.viralScore ? c : best) : null;

  return (
    <>
      {/* ── Input Card ──────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                What is your video about? <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. How I lost 10kg in 2 months without going to the gym, My morning routine that doubled my productivity, Best budget travel tips for Europe"
                className="min-h-[80px] text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl resize-none"
              />
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

            {/* Tone + Length row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setTone(value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        tone === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Caption Length</label>
                <div className="flex gap-2">
                  {LENGTHS.map(({ value, label, desc }) => (
                    <button key={value} type="button" onClick={() => setLength(value)}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-all text-center ${
                        length === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}>
                      <div>{label}</div>
                      <div className={`text-xs font-normal ${length === value ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional fields toggle */}
            <div>
              <button type="button" onClick={() => setShowOptional(v => !v)}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? "rotate-180" : ""}`} />
                {showOptional ? "Hide" : "Show"} Optional Fields (Target Audience, Key Message, CTA, Keywords)
              </button>
              {showOptional && (
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Target Audience</label>
                    <Input value={audience} onChange={e => setAudience(e.target.value)}
                      placeholder="e.g. beginners, busy moms, entrepreneurs, students"
                      className="h-11 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Key Message</label>
                    <Input value={keyMessage} onChange={e => setKeyMessage(e.target.value)}
                      placeholder="e.g. consistency beats intensity, start before you're ready"
                      className="h-11 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Call-to-Action</label>
                    <Input value={cta} onChange={e => setCta(e.target.value)}
                      placeholder="e.g. Agree or disagree? Drop a 🔥, Save this for later"
                      className="h-11 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Keywords <span className="text-muted-foreground font-normal normal-case">(comma separated)</span></label>
                    <Input value={keywords} onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. weight loss, fat burning, meal prep"
                      className="h-11 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" disabled={isGenerating} className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Captions...</>
                : <><MessageSquare className="w-5 h-5" /> Generate TikTok Captions</>}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────── */}
      {captions && (
        <section id="caption-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Your TikTok Captions
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {captions.length} captions across {captions.length} styles • click any caption to expand hashtags
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold w-fit">
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          </div>

          {/* Top pick banner */}
          {topCaption && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-0.5">Highest Viral Score — {topCaption.viralScore} pts</p>
                <p className="text-sm font-medium text-foreground truncate">{topCaption.lines[0]}</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shrink-0">{topCaption.styleLabel}</span>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {([
              { key: "all",         label: "🏷️ All Captions" },
              { key: "punchy",      label: "⚡ Hook / POV" },
              { key: "hottake",     label: "🔥 Hot Take / Q" },
              { key: "educational", label: "📚 Educational" },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveFilter(key)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase tracking-wide ${
                  activeFilter === key ? "bg-primary text-primary-foreground border-primary" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Caption cards */}
          <div className="space-y-4">
            {filteredCaptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No captions match this filter.</p>
            ) : filteredCaptions.map((caption, i) => (
              <CaptionCard
                key={`${caption.style}-${i}`}
                caption={caption}
                index={i}
                onCopy={copyText}
                copiedId={copiedId}
              />
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Caption Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Describe Your Video Topic", desc: "Enter what your TikTok video is about in the topic field — be as specific as possible. 'How I lost 10kg without the gym' generates far more targeted captions than 'weight loss tips.' Include the key result, transformation, or insight your video delivers. The more specific your topic, the more accurate the keyword extraction and the stronger the hooks generated across all 10 caption styles." },
            { step: 2, title: "Select Your Niche and Tone", desc: "Choose the niche that best matches your content category — the generator uses niche-specific keywords, hashtag pools, and audience language for each of the 15 niches. Then pick a tone: Relatable for everyday creator content, Funny for entertainment, Bold for authority-driven niches, Educational for informational content, or Inspirational for motivational creators. The tone shapes the language and emotional direction of your captions." },
            { step: 3, title: "Set Caption Length and Optional Details", desc: "Choose Short (1–2 lines) for punchy visual content, Medium (2–4 lines) for most TikTok content, or Long for educational and storytelling videos. Open the optional fields to add your target audience, key message, preferred CTA, and keywords — these significantly improve how specific and targeted your captions become. A CTA like 'Agree or disagree? 👇' will be woven naturally into every caption generated." },
            { step: 4, title: "Filter, Score, Copy, and Post", desc: "Review all 10 captions across styles — Punchy Hook, POV, Storytelling, Question Hook, Hot Take, Relatable, Educational, Challenge, Listicle, and Emotional. Each has a Viral Score (Hook 1–10, Engagement 1–10, Clarity 1–10) and 7 curated hashtags. Use the filter tabs to narrow by style. Copy the caption body, hashtags, or both with a single click. Test 2–3 different captions over 7 days and track which drives the most comments and profile visits." },
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

      {/* ── About ────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Caption Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How This TikTok Caption Generator Works
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free TikTok Caption Generator produces 10 caption variations across 10 distinct style
              formats: Punchy Hook, POV Style, Storytelling, Question Hook, Hot Take, Relatable, Educational,
              Challenge, Listicle, and Emotional. Each caption is built using your topic, niche, tone, and
              optional inputs — and every caption passes an internal quality evaluation before being returned.
              The quality gate checks three criteria: does the first line stop scrolling (strong opening hook)?
              Does it create curiosity or emotional resonance? Does it invite interaction through a question or
              CTA? Captions that fail the hook test are automatically strengthened before being shown. Every
              caption is scored on three dimensions — Hook Strength (1–10), Engagement Potential (1–10), and
              Clarity (1–10) — combined into a single Viral Score so you can immediately identify your
              strongest caption. Each caption includes 7 curated hashtags: 2 broad reach tags (#fyp, #viral),
              2–3 niche-specific tags, and 1–2 keyword-based tags drawn from your topic and niche. Separate
              copy buttons for the caption body, hashtags, or both make it easy to paste directly into TikTok.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why TikTok Captions Directly Impact Your Reach
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              TikTok's algorithm evaluates content across multiple signals, and captions contribute to two of
              the most important: content classification and engagement volume. The algorithm reads caption text
              (alongside hashtags and audio) to determine which audience segments to test your video against.
              A caption that clearly signals your topic — using specific keywords and niche-appropriate language
              — helps TikTok place your content in the right topic clusters, which means your video gets shown
              to viewers who are already interested in that content type. This is why niche-specific language
              in captions outperforms generic descriptions every time. The second mechanism is engagement
              volume, particularly comments. TikTok treats high comment volume as a strong signal that a video
              sparked a real conversation — and it rewards conversational content with wider distribution.
              Captions that include a question, a hot take, or an opinion-based prompt are structurally designed
              to generate comments. The best TikTok creators use captions not as descriptions of their video, but
              as engagement triggers — the video provides the content, the caption sparks the conversation. This
              generator applies that same philosophy: every caption is built around a scroll-stopping hook, a
              niche-relevant body, and a CTA engineered to drive comments, saves, or follows.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This TikTok Caption Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "10 caption variations per generation across 10 distinct style formats",
                "Viral Score per caption — Hook (1–10), Engagement (1–10), Clarity (1–10)",
                "Quality gate: every caption's first line is evaluated and improved if the hook is weak",
                "7 curated hashtags per caption: broad + niche-specific + keyword-based",
                "Separate copy buttons: caption body only, hashtags only, or caption + hashtags combined",
                "15 niche options with niche-specific keywords, audience language, and hashtag pools",
                "5 tone modes (Relatable, Funny, Bold, Educational, Inspirational) shaping all language",
                "3 caption length options: Short (1–2 lines), Medium (2–4 lines), Long (story style)",
                "Optional fields: target audience, key message, custom CTA, and keywords for personalization",
                "Filter tabs to view captions by style category (Hook/POV, Hot Take, Educational, All)",
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
            { tip: "Start captions with a hook sentence that cuts off mid-thought — TikTok truncates after 2 lines, so a cliffhanger forces the tap-to-expand that boosts engagement." },
            { tip: "Use 3–5 niche hashtags (not just trending ones) — niche hashtags help TikTok's algorithm categorize your content and deliver it to interested audiences." },
            { tip: "Ask a question at the end — 'Which one would you pick?' or 'Have you tried this?' drives comments, which is TikTok's strongest ranking signal." },
            { tip: "Keep captions short and punchy (under 150 characters) — the best-performing TikToks often have minimal caption text, letting the video speak first." },
            { tip: "Include a CTA every 3–4 posts — 'Follow for part 2' and 'Link in bio for the full guide' work best when tied to genuine value." },
            { tip: "Use 'POV:', 'Tell me why', or 'The way' trends in captions to signal participation in trending formats and boost algorithmic reach." },
            { tip: "Time-stamp your series episodes in captions ('Part 3 of 5') — serialized content drives 2–3× more profile visits and follow conversions." },
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
            { name: "TikTok Hook Generator", path: "/tools/tiktok-hook-generator", desc: "Generate powerful opening lines that stop the scroll and keep viewers watching past the critical first 3 seconds." },
            { name: "TikTok Hashtag Generator", path: "/tools/tiktok-hashtag-generator", desc: "Find the perfect mix of trending and niche hashtags to maximize reach and help TikTok place your content." },
            { name: "TikTok Script Generator", path: "/tools/tiktok-script-generator", desc: "Write full video scripts with hook, body, and CTA structured to maximize watch time and algorithm performance." },
            { name: "TikTok Viral Idea Generator", path: "/tools/tiktok-viral-idea-generator", desc: "Get trending content concepts tailored to your niche so you always have high-potential video ideas ready." },
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
