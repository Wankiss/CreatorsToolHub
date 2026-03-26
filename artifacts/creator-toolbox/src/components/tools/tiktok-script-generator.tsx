import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Film, ChevronDown, Sparkles, Loader2, TrendingUp, Zap,
  Shield, ListChecks, Search, Copy, Check, RefreshCw, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "educational" | "funny" | "bold" | "storytelling" | "inspirational";
type VideoLength = "15s" | "30s" | "60s";
type ScriptStyle = "mistakes" | "nobody-tells" | "here-is-how" | "if-youre" | "stop-doing" | "changed-everything";
type Niche =
  | "fitness" | "business" | "beauty" | "food" | "travel"
  | "finance" | "tech" | "lifestyle" | "education" | "gaming"
  | "fashion" | "relationships" | "entertainment" | "health" | "other";

interface ScriptSection {
  label: string;
  timing: string;
  lines: string[];
}

interface ScriptResult {
  style: ScriptStyle;
  styleLabel: string;
  hook: ScriptSection;
  body: ScriptSection;
  cta: ScriptSection;
  wordCount: number;
  hookScore: number;
  retentionScore: number;
}

// ─── Niche Defaults ───────────────────────────────────────────────────────────

const NICHE_DATA: Record<Niche, {
  audience: string;
  result: string;
  mistakes: string[];
  tips: string[];
  emoji: string;
}> = {
  fitness:       { audience: "beginners and busy people",        result: "get fit and lose weight",             mistakes: ["skipping warm-ups", "training without a plan", "neglecting nutrition"],                         tips: ["progressive overload", "compound movements", "recovery days"],                    emoji: "💪" },
  business:      { audience: "entrepreneurs and side hustlers",  result: "build and scale a business",          mistakes: ["overcomplicating the offer", "skipping market research", "ignoring cash flow"],                 tips: ["validate before you build", "focus on one channel", "automate early"],            emoji: "💼" },
  beauty:        { audience: "skincare and makeup lovers",       result: "glow up on any budget",               mistakes: ["skipping SPF", "over-exfoliating", "using wrong products for your skin type"],                 tips: ["double cleanse", "layering correctly", "patch test new products"],                emoji: "💄" },
  food:          { audience: "home cooks and food lovers",       result: "cook better faster",                  mistakes: ["not prepping ingredients first", "crowding the pan", "skipping seasoning layers"],              tips: ["mise en place", "high heat for searing", "taste as you go"],                      emoji: "🍕" },
  travel:        { audience: "travelers and adventure seekers",  result: "travel more for less",                mistakes: ["booking last minute", "over-packing", "skipping travel insurance"],                             tips: ["travel shoulder season", "use points and miles", "pack a carry-on only"],         emoji: "✈️" },
  finance:       { audience: "anyone trying to build wealth",    result: "build wealth and financial freedom",  mistakes: ["lifestyle inflation", "not investing early", "keeping money in savings only"],                  tips: ["automate investing", "index funds", "track every dollar"],                        emoji: "💰" },
  tech:          { audience: "creators and developers",          result: "work smarter with technology",        mistakes: ["ignoring AI tools", "manual tasks that should be automated", "no system for files"],           tips: ["AI automation", "build a second brain", "keyboard shortcuts"],                    emoji: "🤖" },
  lifestyle:     { audience: "people wanting to live better",    result: "live better intentionally",           mistakes: ["no morning routine", "reactive scheduling", "comparing to others"],                            tips: ["time blocking", "weekly reviews", "intentional habits"],                          emoji: "✨" },
  education:     { audience: "curious learners and students",    result: "learn faster and retain more",        mistakes: ["passive reading", "cramming before exams", "no spaced repetition"],                            tips: ["active recall", "Pomodoro technique", "teach what you learn"],                    emoji: "📚" },
  gaming:        { audience: "gamers wanting to improve",        result: "level up their game",                 mistakes: ["not reviewing replays", "ignoring fundamentals", "tilting mid-game"],                          tips: ["VOD reviews", "master one role", "stay calm under pressure"],                     emoji: "🎮" },
  fashion:       { audience: "style-conscious people",           result: "dress better for less",               mistakes: ["buying trends that don't suit you", "ignoring fit", "fast fashion overconsumption"],            tips: ["capsule wardrobe", "invest in basics", "fit over brand"],                          emoji: "👗" },
  relationships: { audience: "singles and couples",              result: "build healthier relationships",        mistakes: ["chasing validation", "ignoring red flags", "poor communication under stress"],                  tips: ["active listening", "non-violent communication", "set clear boundaries"],           emoji: "❤️" },
  entertainment: { audience: "pop culture and content fans",     result: "stay informed and entertained",       mistakes: ["doom-scrolling mindlessly", "echo chambers", "missing context"],                               tips: ["curated feeds", "long-form journalism", "media literacy"],                        emoji: "🎬" },
  health:        { audience: "health-conscious people",          result: "feel their best every day",           mistakes: ["chronic sleep deprivation", "skipping hydration", "ignoring stress management"],                tips: ["sleep hygiene", "daily steps", "whole food nutrition"],                           emoji: "🌿" },
  other:         { audience: "people interested in this topic",  result: "reach their goals faster",            mistakes: ["overthinking before starting", "skipping the basics", "no consistency"],                       tips: ["start before you're ready", "master the fundamentals", "show up every day"],      emoji: "🚀" },
};

// ─── Timing config ────────────────────────────────────────────────────────────

const TIMING: Record<VideoLength, { hookEnd: string; bodyEnd: string; ctaStart: string; wordRange: [number, number] }> = {
  "15s": { hookEnd: "0–3s",  bodyEnd: "3–12s",  ctaStart: "12–15s", wordRange: [30, 50]   },
  "30s": { hookEnd: "0–3s",  bodyEnd: "3–25s",  ctaStart: "25–30s", wordRange: [60, 90]   },
  "60s": { hookEnd: "0–3s",  bodyEnd: "3–52s",  ctaStart: "52–60s", wordRange: [120, 160] },
};

// ─── Quality gate ─────────────────────────────────────────────────────────────

function strengthenHook(line: string): string {
  const lower = line.toLowerCase();
  const stopsScroll = /stop|nobody|wait|this changed|you're doing|if you|mistake|secret|truth|pov:|here's how|3 things|\?|😳|🔥|🚨|⚠️/i.test(lower);
  const hasEmotion  = /feel|imagine|remember|never|always|love|hate|fear|dream|wish|proud|scared|excited/i.test(lower);
  const invites     = /\?|comment|follow|tell me|drop a|save this|share|agree/i.test(lower);
  if (!stopsScroll && !hasEmotion && !invites) return `Wait — ${line}`;
  return line;
}

// ─── Script Generation Engine ─────────────────────────────────────────────────

function buildScript(
  style: ScriptStyle,
  styleLabel: string,
  topic: string,
  niche: Niche,
  tone: Tone,
  audience: string,
  cta: string,
  length: VideoLength,
): ScriptResult {
  const nd = NICHE_DATA[niche];
  const aud = audience || nd.audience;
  const topicShort = topic.split(" ").slice(0, 5).join(" ");
  const ctaFinal = cta || "Follow for more tips like this.";
  const t = TIMING[length];
  const em = nd.emoji;

  // Tone intros
  const toneIntro: Record<Tone, string> = {
    educational:   "Here's what most people get wrong.",
    funny:         "Okay I was NOT prepared for this.",
    bold:          "I'm just going to say what nobody else will.",
    storytelling:  "Let me tell you exactly how this happened.",
    inspirational: "This is the thing that changed everything for me.",
  };

  // Hook lines by style
  let hookLines: string[] = [];
  let bodyLines: string[] = [];
  let ctaLines: string[] = [];

  if (style === "stop-doing") {
    hookLines = [`Stop doing ${nd.mistakes[0]} if you want to ${nd.result}. ${em}`];
    if (length === "15s") {
      bodyLines = [
        `Most ${aud} do this every single day.`,
        `It's actually the #1 thing holding you back.`,
        `${nd.tips[0]} is what actually works.`,
      ];
    } else if (length === "30s") {
      bodyLines = [
        `I see it all the time.`,
        `${aud} put in the work — but still get zero results.`,
        `The problem isn't effort. It's ${nd.mistakes[0]}.`,
        `Here's what to do instead:`,
        `→ ${nd.tips[0]}`,
        `→ ${nd.tips[1]}`,
        `That's it. Two changes. Massive difference.`,
      ];
    } else {
      bodyLines = [
        `I used to do it too.`,
        `I was putting in hours — seeing nothing.`,
        `Then I figured out the real problem: ${nd.mistakes[0]}.`,
        `It sounds simple. But almost nobody does it right.`,
        toneIntro[tone],
        `Here's the exact framework that works:`,
        `Step 1: ${nd.tips[0]}.`,
        `Step 2: ${nd.tips[1]}.`,
        `Step 3: ${nd.tips[2]}.`,
        `And the results? Completely different.`,
      ];
    }
    ctaLines = [ctaFinal, `Have you been making this mistake? Drop a 💬 below.`];

  } else if (style === "nobody-tells") {
    hookLines = [`Nobody tells you this about ${topicShort}. ${em}`];
    if (length === "15s") {
      bodyLines = [
        `The secret is ${nd.tips[0]}.`,
        `Every successful ${aud} knows this.`,
        `Start today.`,
      ];
    } else if (length === "30s") {
      bodyLines = [
        `${toneIntro[tone]}`,
        `The biggest thing I wish I knew earlier:`,
        `${nd.tips[0]} is more important than anything else.`,
        `Most people skip it.`,
        `The ones who don't? They see results.`,
        `Don't skip it.`,
      ];
    } else {
      bodyLines = [
        `Everyone's talking about ${topicShort}.`,
        `But they're leaving out the most important part.`,
        `${toneIntro[tone]}`,
        `Here's what I mean:`,
        `Most ${aud} focus on ${nd.mistakes[0]}.`,
        `But the real lever? ${nd.tips[0]}.`,
        `It feels counterintuitive at first.`,
        `But once it clicks, everything changes.`,
        `And here's the part that really matters:`,
        `${nd.tips[1]} doesn't take as long as you think.`,
        `You just have to start.`,
      ];
    }
    ctaLines = [ctaFinal, `What's one thing nobody told YOU? 👇`];

  } else if (style === "here-is-how") {
    hookLines = [`Here's exactly how I achieved ${nd.result} — and how you can too. ${em}`];
    if (length === "15s") {
      bodyLines = [
        `Step one: ${nd.tips[0]}.`,
        `Step two: ${nd.tips[1]}.`,
        `That's the whole formula.`,
      ];
    } else if (length === "30s") {
      bodyLines = [
        `I didn't have a secret advantage.`,
        `I just followed a simple system.`,
        `${toneIntro[tone]}`,
        `Here are the 3 things that made the difference:`,
        `1. ${nd.tips[0]}`,
        `2. ${nd.tips[1]}`,
        `3. Consistency. Every single day.`,
      ];
    } else {
      bodyLines = [
        `I'm going to break this down step by step.`,
        `Because I wasted months doing it wrong.`,
        `${toneIntro[tone]}`,
        `Month 1: I focused entirely on ${nd.tips[0]}.`,
        `It felt slow. But I trusted the process.`,
        `Month 2: I added ${nd.tips[1]}.`,
        `That's when things started to shift.`,
        `Month 3: I locked in ${nd.tips[2]}.`,
        `And that was the turning point.`,
        `The compound effect is real.`,
        `Small actions. Repeated daily. = massive results.`,
      ];
    }
    ctaLines = [ctaFinal, `Save this — you'll want to come back to it. 🔖`];

  } else if (style === "if-youre") {
    hookLines = [`If you're ${aud}, you need to watch this. ${em}`];
    if (length === "15s") {
      bodyLines = [
        `You're making ${nd.mistakes[0]} without realizing it.`,
        `Switch to ${nd.tips[0]} instead.`,
        `Thank me later.`,
      ];
    } else if (length === "30s") {
      bodyLines = [
        `I've seen so many ${aud} struggle with this.`,
        `And every time, it's the same three mistakes:`,
        `→ ${nd.mistakes[0]}`,
        `→ ${nd.mistakes[1]}`,
        `→ ${nd.mistakes[2]}`,
        `Fix those, and everything changes.`,
      ];
    } else {
      bodyLines = [
        `Let me save you the trial and error I went through.`,
        `Because I spent way too long making these mistakes:`,
        `Mistake #1: ${nd.mistakes[0]}.`,
        `I thought I was doing the right thing. I wasn't.`,
        `Mistake #2: ${nd.mistakes[1]}.`,
        `This one cost me the most time.`,
        `Mistake #3: ${nd.mistakes[2]}.`,
        `Fixed this last — biggest difference.`,
        `Once I stopped all three? Results came fast.`,
        `Don't make the same mistakes I did.`,
      ];
    }
    ctaLines = [ctaFinal, `Which of these have you been doing? Be honest 👇`];

  } else if (style === "mistakes") {
    hookLines = [`3 mistakes ${aud} make with ${topicShort} — and how to fix them. ${em}`];
    if (length === "15s") {
      bodyLines = [
        `Mistake 1: ${nd.mistakes[0]}.`,
        `Mistake 2: ${nd.mistakes[1]}.`,
        `Fix both. See results.`,
      ];
    } else if (length === "30s") {
      bodyLines = [
        `Let's go through them fast.`,
        `Mistake 1: ${nd.mistakes[0]}.`,
        `Fix: ${nd.tips[0]}.`,
        `Mistake 2: ${nd.mistakes[1]}.`,
        `Fix: ${nd.tips[1]}.`,
        `Mistake 3: ${nd.mistakes[2]}.`,
        `Start with these three. Everything else follows.`,
      ];
    } else {
      bodyLines = [
        `These are costing you more than you realize.`,
        `I've coached dozens of ${aud}. Same mistakes. Every time.`,
        `Mistake 1: ${nd.mistakes[0]}.`,
        `Why it hurts you: it slows progress by 50%.`,
        `The fix: ${nd.tips[0]}.`,
        `Mistake 2: ${nd.mistakes[1]}.`,
        `Why it hurts you: sets you up for burnout.`,
        `The fix: ${nd.tips[1]}.`,
        `Mistake 3: ${nd.mistakes[2]}.`,
        `This one is the hardest to break.`,
        `The fix: ${nd.tips[2]}.`,
        `Fix these three. Your results will surprise you.`,
      ];
    }
    ctaLines = [ctaFinal, `Save this and fix one today. 👇 Which one?`];

  } else { // changed-everything
    hookLines = [`This changed everything about how I approach ${topicShort}. ${em}`];
    if (length === "15s") {
      bodyLines = [
        `I discovered ${nd.tips[0]}.`,
        `Sounds too simple.`,
        `It isn't.`,
      ];
    } else if (length === "30s") {
      bodyLines = [
        `${toneIntro[tone]}`,
        `I'd been doing everything the "right" way.`,
        `And still — nothing was working.`,
        `Then I tried ${nd.tips[0]}.`,
        `One week later, the difference was undeniable.`,
        `I'm not going back.`,
      ];
    } else {
      bodyLines = [
        `${toneIntro[tone]}`,
        `I was doing all the right things.`,
        `The advice, the routines, the habits.`,
        `But I was stuck. Nothing was clicking.`,
        `Then I made one change: ${nd.tips[0]}.`,
        `Within two weeks, everything shifted.`,
        `I added ${nd.tips[1]} after that.`,
        `Then ${nd.tips[2]}.`,
        `Each one compounded on the last.`,
        `I didn't do more. I did the right things.`,
        `That's the difference.`,
      ];
    }
    ctaLines = [ctaFinal, `What's the one change that changed everything for you? 💬`];
  }

  // Quality gate on hook
  hookLines[0] = strengthenHook(hookLines[0]);

  const allWords = [...hookLines, ...bodyLines, ...ctaLines].join(" ").split(/\s+/).length;

  // Scoring
  const hookText = hookLines.join(" ");
  let hookScore = 6;
  if (/stop|nobody|wait|mistake|secret|if you're|here's how|\?/.test(hookText.toLowerCase())) hookScore += 2;
  if (/😳|🔥|💪|💼|✨|🚀|em/.test(hookText) || nd.emoji) hookScore += 1;
  if (hookLines[0].split(" ").length <= 12) hookScore += 1;
  hookScore = Math.min(10, hookScore);

  let retentionScore = 6;
  if (bodyLines.length >= 4) retentionScore += 1;
  if (bodyLines.some(l => /→|step|first|second|third|mistake|fix/i.test(l))) retentionScore += 2;
  if (ctaLines.some(l => /\?|comment|drop|save|follow/.test(l.toLowerCase()))) retentionScore += 1;
  retentionScore = Math.min(10, retentionScore);

  return {
    style,
    styleLabel,
    hook: { label: "HOOK",  timing: t.hookEnd,   lines: hookLines },
    body: { label: "BODY",  timing: t.bodyEnd,    lines: bodyLines },
    cta:  { label: "CTA",   timing: t.ctaStart,   lines: ctaLines  },
    wordCount: allWords,
    hookScore,
    retentionScore,
  };
}

function generateScripts(
  topic: string,
  niche: Niche,
  tone: Tone,
  audience: string,
  _keyMessage: string,
  cta: string,
  _keywords: string,
  length: VideoLength,
): ScriptResult[] {
  const styles: { style: ScriptStyle; label: string }[] = [
    { style: "stop-doing",        label: "Stop Doing This" },
    { style: "nobody-tells",      label: "Nobody Tells You" },
    { style: "here-is-how",       label: "Here's How I Did It" },
    { style: "if-youre",          label: "If You're [Audience]" },
    { style: "mistakes",          label: "3 Mistakes" },
    { style: "changed-everything",label: "This Changed Everything" },
  ];
  // Pick 3 varied styles
  const chosen = [styles[0], styles[1], styles[2]];
  // Rotate based on tone for variety
  if (tone === "funny" || tone === "storytelling") chosen[2] = styles[5];
  if (tone === "educational") chosen[1] = styles[4];
  if (tone === "inspirational") chosen[0] = styles[5];

  return chosen.map(({ style, label }) =>
    buildScript(style, label, topic, niche, tone, audience, cta, length)
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────

function SectionBlock({ section, isHook, isCta }: {
  section: ScriptSection; isHook?: boolean; isCta?: boolean;
}) {
  const bg = isHook ? "bg-primary/5 border-primary/20"
    : isCta  ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/40"
    : "bg-muted/40 border-border";
  const labelColor = isHook ? "text-primary" : isCta ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground";

  return (
    <div className={`rounded-xl border p-4 space-y-2 ${bg}`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-black uppercase tracking-wider ${labelColor}`}>{section.label}</span>
        <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-background/60 border border-border">
          <Clock className="w-2.5 h-2.5 inline mr-1" />{section.timing}
        </span>
      </div>
      <div className="space-y-1">
        {section.lines.map((line, i) => (
          <p key={i} className={`text-sm leading-relaxed ${
            isHook ? "font-semibold text-foreground" : isCta ? "font-medium text-foreground" : "text-foreground"
          }`}>{line}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Script Card ──────────────────────────────────────────────────────────────

function ScriptCard({ script, index, onCopy, copiedId }: {
  script: ScriptResult; index: number; onCopy: (id: string, text: string) => void; copiedId: string | null;
}) {
  const fullText = [
    `HOOK:\n${script.hook.lines.join("\n")}`,
    `\nBODY:\n${script.body.lines.join("\n")}`,
    `\nCTA:\n${script.cta.lines.join("\n")}`,
  ].join("\n");

  const hookText = script.hook.lines.join("\n");
  const ctaText  = script.cta.lines.join("\n");

  const isFull    = copiedId === `s${index}-full`;
  const isHookCp  = copiedId === `s${index}-hook`;
  const isCtaCp   = copiedId === `s${index}-cta`;

  const hookBadge = script.hookScore >= 9 ? "🔥 Elite Hook" : script.hookScore >= 7 ? "⚡ Strong Hook" : "Hook";
  const retBadge  = script.retentionScore >= 9 ? "🎯 High Retention" : script.retentionScore >= 7 ? "✅ Solid" : "Retention";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {index + 1}
          </div>
          <span className="font-bold text-foreground">{script.styleLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {hookBadge} {script.hookScore}/10
          </span>
          <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            {retBadge}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{script.wordCount}w</span>
        </div>
      </div>

      {/* Script sections */}
      <div className="px-5 py-4 space-y-3">
        <SectionBlock section={script.hook} isHook />
        <SectionBlock section={script.body} />
        <SectionBlock section={script.cta}  isCta />
      </div>

      {/* Copy actions */}
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        {[
          { id: `s${index}-hook`, text: hookText, label: "Copy Hook", copied: isHookCp },
          { id: `s${index}-cta`,  text: ctaText,  label: "Copy CTA",  copied: isCtaCp  },
          { id: `s${index}-full`, text: fullText,  label: "Copy Full Script", copied: isFull },
        ].map(({ id, text, label, copied }) => (
          <button key={id} onClick={() => onCopy(id, text)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              copied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                     : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            }`}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok script and why do you need one?",
    a: "A TikTok script is a pre-written guide for what you will say, show, and do during your video — broken into a hook (first 1–3 seconds), body (main content), and CTA (call-to-action at the end). Most creators who consistently produce viral content don't free-style — they script. Scripting solves three problems: (1) it forces you to front-load your best content in the hook, which is what the algorithm measures; (2) it keeps the body of your video tight and fast-paced with no dead air or filler; and (3) it ensures every video ends with a specific action prompt that drives comments, follows, or saves. Creators who script their content typically see 30–50% higher completion rates than those who improvise, because a well-structured script naturally reduces rambling and keeps viewers watching.",
  },
  {
    q: "How long should a TikTok video script be?",
    a: "TikTok video scripts are calibrated by realistic speaking speed, which averages 130–150 words per minute for conversational content. For a 15-second TikTok, your script should be 30–50 words — a single hook, one or two sharp points, and a quick CTA. For a 30-second TikTok, aim for 60–90 words — a hook, 2–3 clear steps or insights, and a strong CTA. For a 60-second TikTok, your script should run 120–160 words — enough room for a hook, a detailed breakdown or short story with a mid-video re-hook to prevent drop-off, and a specific CTA. Every script generated by this tool is calibrated to these word count targets to ensure it fits naturally within the selected video duration without feeling rushed or padded.",
  },
  {
    q: "What makes a TikTok hook go viral?",
    a: "A viral TikTok hook does three things simultaneously in the first 1–3 seconds: it stops the scroll (interrupts the viewer's automatic swiping behavior), creates an open loop (tease information the viewer needs to stick around to learn), and signals relevance (tells the viewer this video is specifically for them). The highest-performing hook formulas are: 'Stop doing [X] if you want [result]' — stakes a claim and signals authority; 'Nobody tells you this about [topic]' — creates exclusivity and curiosity; 'If you're [specific audience], watch this' — immediate relevance trigger; '3 mistakes you're making with [topic]' — threatens loss and promises a fix; and 'This changed everything for me' — signals transformation payoff. The critical rule: the hook must deliver a specific emotional trigger (curiosity, fear of missing out, or recognition of a personal struggle) in the first 5–8 words — before most viewers decide whether to keep watching.",
  },
  {
    q: "What is a re-hook and why does it matter for 60-second TikToks?",
    a: "A re-hook is a secondary hook placed mid-video (typically at the 15–25 second mark in a 60-second video) designed to prevent viewer drop-off. TikTok completion rate drops significantly at two points: the first 3 seconds (the hook window) and around the 20–30 second mark (the mid-video abandonment zone). A re-hook at the midpoint re-engages viewers who are starting to drift by: teasing the best part of the video that's still coming ('And the last tip is the one that most people get completely wrong…'), raising the stakes ('Wait — the third mistake is the biggest one. Don't skip this.'), or looping back to the opening promise with partial delivery. Re-hooks are a key technique used by creators with consistently high 75%+ completion rates on longer videos.",
  },
  {
    q: "What is the best TikTok video structure?",
    a: "The highest-converting TikTok video structure for most content types is: (1) Hook (0–3 seconds): a pattern interrupt that stops scrolling and creates an open loop with a specific promise; (2) Credibility bridge (3–8 seconds): a single sentence that establishes why you're qualified to deliver on that promise — personal experience, a result, or a relatable struggle; (3) Body (8–50 seconds): the content itself delivered in short, fast sentences with clear structure (numbered steps, before/after, or story arc); (4) Re-hook if 60s (25–30 seconds): a mid-video engagement trigger that teases what's coming; (5) CTA (final 5–8 seconds): a specific, low-friction action prompt — a question to answer, content to save, or a follow to earn. Scripts that skip the credibility bridge and jump straight from hook to content often feel abrupt and see higher early drop-off than those that include a brief setup.",
  },
  {
    q: "How do I write TikTok scripts for different video lengths?",
    a: "Each TikTok length requires a fundamentally different structural approach. For 15-second videos: the hook must be a single killer line (under 8 words), the body delivers one tight insight or action, and the CTA is a single sentence. There's no room for setup — every word must earn its place. For 30-second videos: add a 2–3 second credibility bridge after the hook, then deliver 2–3 structured points (numbered or bulleted when spoken) before the CTA. This is the most versatile format and works for almost any niche. For 60-second videos: you have room for storytelling, a proper setup, detailed steps, and a mid-video re-hook. The risk is mid-video drop-off — structure your body so the most interesting or surprising content is either first or teased early ('and the last tip is the one that surprised me most').",
  },
  {
    q: "How do I write a TikTok CTA that actually works?",
    a: "The most effective TikTok CTAs are specific, low-effort, and tied to the video content. Generic CTAs like 'Like and subscribe' or 'Follow for more content' perform poorly because they give the viewer no specific reason to act. High-converting CTAs give the viewer a clear, opinion-based prompt: 'Which of these mistakes have you been making? Drop the number below.' Or a save trigger: 'Save this — you'll want to come back to it when you're stuck.' Or a follow justification: 'Follow if you want more tips like this every day.' The CTA should feel like a natural continuation of the video, not an abrupt pivot. End your script body one line before the CTA so the CTA feels earned — the viewer has received value, and now you're asking for something small in return.",
  },
  {
    q: "Can I use TikTok scripts for Instagram Reels and YouTube Shorts?",
    a: "Yes — TikTok scripts translate directly to Instagram Reels and YouTube Shorts with minimal adjustment. All three platforms are short-form vertical video formats that reward the same structural elements: a front-loaded hook in the first 3 seconds, fast-paced content delivery, and a specific CTA at the end. The 15s/30s/60s word count targets in this generator (30–50 / 60–90 / 120–160 words) apply equally to Reels and Shorts. The primary differences are cultural tone: TikTok captions and delivery tend to be more informal and trend-native, while Instagram Reels allows slightly more polished presentation, and YouTube Shorts benefits from slightly longer payoff explanations. The script framework — hook, body, CTA — is platform-agnostic.",
  },
  {
    q: "What is the 'open loop' technique in TikTok scripts?",
    a: "An open loop is a storytelling technique where you tease a piece of information early in the video that you don't reveal until later — creating tension that keeps viewers watching until the resolution. In TikTok scripts, open loops appear most often in: the hook ('I made one change that completely transformed my results — and I'll tell you exactly what it was at the end'), the body as a re-hook ('Before I get to step 3, I want to make sure you catch this…'), and in question-based hooks ('What do the top 1% of [niche] know that nobody talks about?'). The psychological mechanism is the Zeigarnik Effect — humans are wired to remember and fixate on incomplete information until it's resolved. Open loops created in the hook are the most powerful retention tool available in short-form content.",
  },
  {
    q: "Is this TikTok Script Generator free?",
    a: "Yes — the TikTok Script Generator on creatorsToolHub is 100% free with no account, credit card, or subscription required. Enter your video topic and select your niche, tone (Funny, Educational, Bold, Storytelling, Inspirational), and video length (15s, 30s, or 60s), and receive 3 complete script variations — each with a full Hook, Body, and CTA section, auto-generated timestamps, Hook Score (1–10), Retention Score (1–10), and word count calibrated to realistic speaking speed. Optional fields (target audience, key message, CTA, keywords) let you personalize scripts further. Copy the full script, hook only, or CTA only with one click. Regenerate for a fresh set of 3 scripts any time.",
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
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl" aria-expanded={open}>
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

// ─── Niche / Tone / Length pills ──────────────────────────────────────────────

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
  { value: "educational",   label: "Educational"   },
  { value: "funny",         label: "Funny"         },
  { value: "bold",          label: "Bold"          },
  { value: "storytelling",  label: "Storytelling"  },
  { value: "inspirational", label: "Inspirational" },
];

const LENGTHS: { value: VideoLength; label: string; words: string }[] = [
  { value: "15s", label: "15 sec", words: "30–50 words" },
  { value: "30s", label: "30 sec", words: "60–90 words" },
  { value: "60s", label: "60 sec", words: "120–160 words" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function TikTokScriptGeneratorTool() {
  const [topic, setTopic]         = useState("");
  const [niche, setNiche]         = useState<Niche>("business");
  const [tone, setTone]           = useState<Tone>("educational");
  const [length, setLength]       = useState<VideoLength>("30s");
  const [audience, setAudience]   = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [cta, setCta]             = useState("");
  const [keywords, setKeywords]   = useState("");
  const [showOptional, setShowOptional] = useState(false);

  const [scripts, setScripts]     = useState<ScriptResult[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId]   = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tt-script-gen";
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
      toast({ title: "Enter your video idea", description: "Tell us what your TikTok video is about.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateScripts(topic, niche, tone, audience, keyMessage, cta, keywords, length);
      setScripts(result);
      setIsGenerating(false);
      if (!regen) setTimeout(() => document.getElementById("script-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 450);
  }, [topic, niche, tone, audience, keyMessage, cta, keywords, length, toast]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
    toast({ title: "Copied to clipboard!", duration: 1500 });
  };

  const t = TIMING[length];

  return (
    <>
      {/* ── Input Card ──────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Video Idea / Topic <span className="text-red-500">*</span>
              </label>
              <Textarea value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. How I grew my TikTok from 0 to 10k in 60 days, 3 mistakes beginners make when investing, Morning routine that doubled my productivity"
                className="min-h-[80px] text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl resize-none" />
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

            {/* Tone + Length */}
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
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Video Length</label>
                <div className="flex gap-2">
                  {LENGTHS.map(({ value, label, words }) => (
                    <button key={value} type="button" onClick={() => setLength(value)}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-all text-center ${
                        length === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}>
                      <div>{label}</div>
                      <div className={`text-xs font-normal ${length === value ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{words}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timing preview */}
            <div className="rounded-xl bg-muted/40 border border-border px-4 py-3 flex flex-wrap gap-3">
              {[
                { label: "Hook",  time: t.hookEnd  },
                { label: "Body",  time: t.bodyEnd  },
                { label: "CTA",   time: t.ctaStart },
              ].map(({ label, time }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-foreground">{label}</span>
                  <span className="text-muted-foreground">{time}</span>
                </div>
              ))}
              <div className="ml-auto text-xs text-muted-foreground font-medium">
                <Clock className="w-3 h-3 inline mr-1" />Target: {TIMING[length].wordRange[0]}–{TIMING[length].wordRange[1]} words
              </div>
            </div>

            {/* Optional fields */}
            <div>
              <button type="button" onClick={() => setShowOptional(v => !v)}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? "rotate-180" : ""}`} />
                {showOptional ? "Hide" : "Show"} Optional Fields (Audience, Key Message, CTA, Keywords)
              </button>
              {showOptional && (
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Target Audience</label>
                    <Input value={audience} onChange={e => setAudience(e.target.value)}
                      placeholder="e.g. beginners, entrepreneurs, busy moms"
                      className="h-11 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Key Message</label>
                    <Input value={keyMessage} onChange={e => setKeyMessage(e.target.value)}
                      placeholder="e.g. consistency beats shortcuts, start before you're ready"
                      className="h-11 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Call-to-Action</label>
                    <Input value={cta} onChange={e => setCta(e.target.value)}
                      placeholder="e.g. Save this for later, Comment your thoughts"
                      className="h-11 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wide">Keywords</label>
                    <Input value={keywords} onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. TikTok growth, content strategy, viral tips"
                      className="h-11 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" disabled={isGenerating} className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Scripts...</>
                : <><Film className="w-5 h-5" /> Generate TikTok Scripts</>}
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────── */}
      {scripts && (
        <section id="script-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> Your TikTok Scripts
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                3 script variations • {length} format • copy hook, CTA, or full script
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={isGenerating} className="rounded-xl gap-1.5 font-semibold w-fit">
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          </div>
          <div className="space-y-5">
            {scripts.map((script, i) => (
              <ScriptCard key={`${script.style}-${i}`} script={script} index={i} onCopy={copyText} copiedId={copiedId} />
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Script Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Video Idea", desc: "Type your video topic or idea — the more specific the better. 'How I lost 10kg without the gym' generates sharper scripts than 'weight loss.' Include the core result, story, or insight your video will deliver. The generator uses your topic to power the hook formula, body structure, and CTA across all 3 script styles." },
            { step: 2, title: "Choose Niche, Tone, and Length", desc: "Select your niche from 15 options — each has niche-specific tips, mistakes, audience language, and emoji anchors built in. Pick your tone: Educational for how-to content, Bold for authority-driven delivery, Storytelling for narrative videos, Funny for entertainment, or Inspirational for motivational content. Then choose 15s, 30s, or 60s — the generator calibrates word count and structure automatically to match realistic speaking speed." },
            { step: 3, title: "Review the Timing Breakdown", desc: "Each script is broken into labeled sections: HOOK (with timestamp), BODY (with timestamp), and CTA (with timestamp). The Hook section is highlighted — it's the most important part. Each script also shows a Hook Score (1–10) and Retention Score (1–10) so you can immediately identify which script to prioritize. The word count shows whether the script will fit your selected duration." },
            { step: 4, title: "Copy, Film, and Test", desc: "Use the per-script copy buttons to copy the Hook only (for testing hooks before filming), the CTA only (for refining your endings), or the full script at once. Film all 3 script variations and test them — post each on different days and watch which one gets the highest 3-second retention rate and completion rate in TikTok Analytics. The script with the best retention becomes your template for future content in that format." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Script Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How This TikTok Script Generator Works
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free TikTok Script Generator produces 3 complete script variations per generation, each
              using a different proven viral formula: "Stop Doing This," "Nobody Tells You," "Here's How I
              Did It," "If You're [Audience]," "3 Mistakes," and "This Changed Everything." Scripts are
              selected based on your chosen tone — Educational tone prioritizes structured teaching formats,
              Storytelling tone uses narrative-first approaches, Inspirational tone leads with transformation,
              Funny tone uses pattern interrupts and self-aware openers, and Bold tone stakes a controversial
              claim from the first word. Every script is auto-calibrated to your selected video length:
              30–50 words for 15-second videos, 60–90 words for 30-second videos, and 120–160 words for
              60-second videos — matching realistic conversational speaking speed. Each script passes an
              internal quality gate that evaluates the hook on three criteria: does the first line stop
              scrolling? Does it create curiosity or emotion? Does it invite interaction? Hooks that fail
              are automatically rewritten with a stronger pattern interrupt before being returned. Every
              result shows a Hook Score (1–10), Retention Score (1–10), and word count at a glance.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Script Structure Determines TikTok Performance
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              TikTok's algorithm has one primary objective: maximize total time spent on the platform.
              To achieve this, it uses completion rate — the percentage of viewers who watch your video
              to the end — as its most important content quality signal. A video that 60% of viewers
              watch to completion will be distributed exponentially wider than a video that 30% complete,
              even if both videos have the same total view count. This is why structure matters more than
              production quality on TikTok. A perfectly scripted video filmed on a phone will outperform
              a beautifully produced but poorly structured video every time. The hook determines whether
              a viewer watches past 3 seconds — which TikTok tracks as its primary distribution trigger.
              The body structure determines whether they watch to 75% — the threshold at which TikTok
              considers a video "highly retained." The CTA determines whether they comment or save —
              secondary signals that push the video into the next audience testing phase. Every element
              of a script is a metric. This generator builds scripts with each metric in mind: front-loaded
              hooks for 3-second retention, structured bodies for watch-through, and engagement-driven
              CTAs for the comment and save signals that unlock broader distribution.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This TikTok Script Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "3 complete script variations per generation across 6 distinct viral formula styles",
                "Full 3-section structure per script: Hook, Body, and CTA with auto-generated timestamps",
                "Word count calibrated to 15s (30–50w), 30s (60–90w), or 60s (120–160w) speaking speed",
                "Hook Score (1–10) and Retention Score (1–10) for every script to identify the strongest option",
                "Internal quality gate: hooks are evaluated and auto-strengthened if they fail scroll-stop criteria",
                "15 niche options with niche-specific mistake lists, proven tips, and audience language",
                "5 tone modes (Educational, Funny, Bold, Storytelling, Inspirational) shaping script structure",
                "Copy buttons: Hook only, CTA only, and Full Script — paste directly into TikTok or notes app",
                "Optional fields: target audience, key message, custom CTA, and keywords for script personalization",
                "Regenerate button for unlimited fresh script variations on any topic",
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
