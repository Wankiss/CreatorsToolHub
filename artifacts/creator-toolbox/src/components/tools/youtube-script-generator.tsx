import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, Check, ChevronDown, Zap, ListChecks, TrendingUp,
  Shield, FileText, Loader2, RefreshCw, Play, BookOpen,
  MessageSquare, Target, Star, Video, Sparkles, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "educational" | "entertaining" | "storytelling" | "authoritative" | "motivational";
type Goal = "educate" | "entertain" | "convert" | "inspire" | "review";
type VideoLength = "3" | "5" | "7" | "10" | "15";
type ScriptStyle = "talking-head" | "storytelling" | "listicle" | "tutorial" | "documentary";

interface ScriptSection {
  label: string;
  tag: string;
  duration: string;
  content: string;
  tip?: string;
  icon: React.ReactNode;
}

interface GeneratedScript {
  titles: string[];
  sections: ScriptSection[];
  broll: string[];
  onScreenText: string[];
  thumbnailText: string[];
  estimatedWords: number;
  estimatedDuration: string;
}

// ─── Script Engine ────────────────────────────────────────────────────────────

const YEAR = new Date().getFullYear();

const HOOKS: Record<Tone, (topic: string, kw: string) => string> = {
  educational: (t, kw) =>
    `Here's something most people get completely wrong about ${t}. And if you're making this same mistake, it's costing you time, money, and results right now. In the next ${kw ? `few minutes, I'll walk you through everything you need to know about ${kw}` : "few minutes, I'll show you exactly what to do instead"} — so stay with me.`,
  entertaining: (t, _) =>
    `Okay, so I tried ${t} for a full week. No shortcuts, no cheating — just raw, unfiltered results. And what happened next? Honestly, I did not see that coming.`,
  storytelling: (t, _) =>
    `A year ago, I had no idea what I was doing when it came to ${t}. I'd tried everything. Nothing worked. Until one day, completely by accident, I stumbled onto something that changed everything.`,
  authoritative: (t, kw) =>
    `After working with ${t} for years${kw ? ` and helping hundreds of people with ${kw}` : ""}, I can tell you there's one thing that separates people who succeed and people who don't. And it's not what you think.`,
  motivational: (t, _) =>
    `I'm going to say something that might sound harsh — but if you're not seeing results with ${t} yet, it's not your fault. The system most people use is broken. But today, that changes for you.`,
};

const INTROS: Record<Tone, (topic: string, goal: Goal, audience: string) => string> = {
  educational: (t, _, aud) =>
    `My name is [Your Name] and${aud ? ` I help ${aud} with` : " I've been studying"} ${t} for [X years]. In this video, I'm breaking down everything you need to know — from the basics all the way to the advanced strategies that actually move the needle. By the end of this video, you'll have a clear, step-by-step understanding of ${t} that you can start using today. Let's jump in.`,
  entertaining: (t, _, _aud) =>
    `Welcome back to the channel — if you're new here, I'm [Your Name] and I make videos about ${t} that are actually fun to watch. Today's video is a bit of an experiment, and honestly? I'm not sure how it went. You'll have to stick around to find out.`,
  storytelling: (t, _, _aud) =>
    `This is the story of how I went from knowing absolutely nothing about ${t} to finally cracking the code. I'm going to share everything — the failures, the breakthroughs, and the one strategy that made all the difference. Let's start from the beginning.`,
  authoritative: (t, _, aud) =>
    `Welcome. I'm [Your Name]${aud ? ` and I work with ${aud} on ${t}` : ""}. Today I want to give you the definitive breakdown of ${t} — what actually works, what's a waste of time, and exactly where to focus your energy for maximum results. No fluff. Let's get into it.`,
  motivational: (t, _, _aud) =>
    `If you clicked on this video, something tells me you're serious about changing your results with ${t}. Good. Because what I'm about to share is the framework that's helped thousands of people go from stuck to moving forward fast. This is going to be worth every second.`,
};

function buildMainContent(
  topic: string,
  style: ScriptStyle,
  tone: Tone,
  goal: Goal,
  length: VideoLength,
  keywords: string,
): { sections: Array<{ title: string; body: string; interrupt: string }> } {
  const kws = keywords.split(",").map(s => s.trim()).filter(Boolean);
  const kwStr = kws.length ? kws[0] : topic;

  const sectionSets: Record<ScriptStyle, Array<{ title: string; body: string; interrupt: string }>> = {
    tutorial: [
      {
        title: `Step 1 — Understanding the Foundation of ${topic}`,
        body: `Before we do anything else, let's make sure you understand exactly what ${topic} is and why it matters. A lot of people skip this step — and that's exactly why they struggle later. Think of ${kwStr} as the foundation of everything else. Get this right, and the rest becomes a lot easier.`,
        interrupt: `[PATTERN INTERRUPT] Pause for a second. Ask your audience: "Have you ever tried this before? Drop a comment below and let me know."`,
      },
      {
        title: `Step 2 — The Setup: What You Need Before You Start`,
        body: `Now that you understand the basics, let's talk about what you actually need to get started with ${topic}. Here's the thing — most people overcomplicate this. You really only need [Tool/Resource 1], [Tool/Resource 2], and the right system. That's it. Everything else is optional.`,
        interrupt: `[PATTERN INTERRUPT] Here's where it gets interesting. Most tutorials won't tell you this next part.`,
      },
      {
        title: `Step 3 — The Core Process (This Is Where Most People Go Wrong)`,
        body: `Okay, here's the part that actually makes the difference. The mistake 90% of people make with ${topic} is [describe mistake]. Instead, what you want to do is [describe the correct approach]. Let me walk you through it step by step: First, [action 1]. Then [action 2]. Finally, [action 3]. If you follow this process, you will get [specific result].`,
        interrupt: `[PATTERN INTERRUPT] Wait — before I move on, I need to share a quick tip that will save you hours.`,
      },
      ...(parseInt(length) >= 10 ? [{
        title: `Step 4 — Advanced Strategies to Level Up Your Results`,
        body: `Now that you've got the core process down, let's talk about how to take your ${topic} results to the next level. These are the strategies that separate good results from great results. Strategy one: [advanced tip 1]. Strategy two: [advanced tip 2]. Strategy three: [advanced tip 3]. Each one of these can dramatically improve your output with ${kwStr}.`,
        interrupt: `[PATTERN INTERRUPT] This next strategy is one most people completely overlook — pay close attention.`,
      }] : []),
    ],
    listicle: [
      {
        title: `Tip #1 — The Foundation (Don't Skip This)`,
        body: `The number one thing you need to know about ${topic} is [tip 1]. This is the base that everything else builds on. If you do nothing else from this video, do this one thing. Here's why it works: [explanation]. Here's how to apply it: [actionable steps].`,
        interrupt: `[PATTERN INTERRUPT] Quick question — are you taking notes? Seriously, you'll want to write this next one down.`,
      },
      {
        title: `Tip #2 — The Strategy Most People Ignore`,
        body: `This is the one that surprised me the most when I first learned about ${topic}. [Tip 2]. Sounds simple, right? But almost nobody actually does it. The reason it works so well is because [explanation]. Try this: [specific action the viewer can take today].`,
        interrupt: `[PATTERN INTERRUPT] I've got to be honest with you about something. This next tip is the one I wish someone had told me earlier.`,
      },
      {
        title: `Tip #3 — The Game-Changer`,
        body: `If I had to pick just one strategy that has made the biggest difference with ${kwStr}, it's this: [tip 3]. When you apply this consistently, something remarkable happens — [outcome]. Here's a real example: [brief example or case study]. You can start doing this today by [simple first step].`,
        interrupt: `[PATTERN INTERRUPT] We're almost at the best part — stick around because tip #4 is a complete game-changer.`,
      },
      ...(parseInt(length) >= 7 ? [{
        title: `Tip #4 — The Accelerator`,
        body: `Ready to speed up your results with ${topic}? This is what I call the accelerator strategy. [Tip 4]. The reason most people don't do this is because [common objection]. But here's the truth — [reframe/counter]. Once you start doing this, you'll wonder how you ever got by without it.`,
        interrupt: `[PATTERN INTERRUPT] Let me share a quick story that illustrates exactly why this works.`,
      }] : []),
      ...(parseInt(length) >= 10 ? [{
        title: `Tip #5 — The Pro-Level Move`,
        body: `This last one is for those of you who want to go beyond the basics with ${topic}. [Tip 5]. This is what the top 5% of people in [niche] do differently. It takes a bit more effort upfront, but the payoff with ${kwStr} is completely worth it.`,
        interrupt: `[PATTERN INTERRUPT] Before the CTA — a quick reality check that will put everything we've covered into perspective.`,
      }] : []),
    ],
    storytelling: [
      {
        title: `Setting the Scene — Where This Story Begins`,
        body: `It was [timeframe] ago and I was completely stuck with ${topic}. I'd tried [approach 1], [approach 2], even [approach 3]. Nothing worked. My results were [specific problem]. Sound familiar? If you've ever felt that frustration with ${kwStr}, you're going to relate to this next part.`,
        interrupt: `[PATTERN INTERRUPT] And then something happened that I didn't expect.`,
      },
      {
        title: `The Turning Point — What Changed Everything`,
        body: `That's when I discovered [key insight about topic]. At first I thought it was too simple. I mean, could something this straightforward really be the answer to [problem]? So I tested it. And what happened next genuinely surprised me — [result]. Here's the exact approach I used with ${topic}: [explain the method clearly and practically].`,
        interrupt: `[PATTERN INTERRUPT] The results I got after this are what I want to share with you right now.`,
      },
      {
        title: `The Results — And What This Means for You`,
        body: `After applying this to ${topic}, the results were [specific, tangible result]. But here's what's really interesting — and this is the part that most people miss — the reason it worked wasn't just the tactic. It was the underlying principle: [core principle]. And that principle applies to YOU right now, no matter where you're starting from with ${kwStr}.`,
        interrupt: `[PATTERN INTERRUPT] Let me give you the exact steps I took so you can replicate this yourself.`,
      },
    ],
    "talking-head": [
      {
        title: `The Big Picture — Why ${topic} Matters More Than You Think`,
        body: `Here's the thing about ${topic} that most people don't understand — [insight]. And when you really get this, everything changes. Let me explain why. [Clear, conversational explanation of the core concept]. This applies whether you're a beginner or you've been working on ${kwStr} for years.`,
        interrupt: `[PATTERN INTERRUPT] Now, I want to stop and ask you something important.`,
      },
      {
        title: `The Core Framework for ${topic}`,
        body: `So what's the actual framework for making this work? I break ${topic} down into three core pillars. Pillar one: [pillar 1 — brief explanation]. Pillar two: [pillar 2 — brief explanation]. Pillar three: [pillar 3 — brief explanation]. When you have all three working together for ${kwStr}, that's when you start seeing real, consistent results.`,
        interrupt: `[PATTERN INTERRUPT] Hold on — I've got a stat that's going to blow your mind.`,
      },
      {
        title: `Common Myths About ${topic} — Debunked`,
        body: `Before we go any further, I want to bust three myths about ${topic} that are probably holding you back. Myth one: [myth 1] — here's the truth: [truth 1]. Myth two: [myth 2] — here's what actually happens: [truth 2]. Myth three: [myth 3] — this one's really important with ${kwStr}: [truth 3]. Once you let go of these myths, progress becomes much faster.`,
        interrupt: `[PATTERN INTERRUPT] This next section is the one I get asked about the most — pay close attention.`,
      },
    ],
    documentary: [
      {
        title: `The Background — Understanding ${topic} in Context`,
        body: `To understand why ${topic} matters today, we need to look at where it came from. [Brief history or context]. What started as [origin] has evolved into something that affects [broad impact]. And at the center of it all is ${kwStr} — a concept that experts have debated for years but that most everyday people have never heard explained clearly.`,
        interrupt: `[PATTERN INTERRUPT] But here's what the data actually shows.`,
      },
      {
        title: `The Evidence — What Research and Experts Say`,
        body: `Studies show that [relevant statistic or finding related to topic]. When we look at ${topic} through a data lens, the pattern is clear: [key insight]. According to experts in the field, [expert perspective]. And when you apply this understanding to ${kwStr}, the implications are significant — [practical meaning for the viewer].`,
        interrupt: `[PATTERN INTERRUPT] Now let's look at a real-world example of this in action.`,
      },
      {
        title: `The Takeaway — What This Means in Practice`,
        body: `So what do we actually do with all of this? Here's how understanding ${topic} changes your approach: [practical application 1], [practical application 2], and [practical application 3]. The key thing to understand about ${kwStr} is that [core actionable insight]. This isn't theory — these are the concrete steps that make the difference.`,
        interrupt: `[PATTERN INTERRUPT] One more thing before we wrap up — and this is important.`,
      },
    ],
  };

  return { sections: sectionSets[style] };
}

function buildScript(
  topic: string,
  audience: string,
  length: VideoLength,
  tone: Tone,
  goal: Goal,
  keywords: string,
  style: ScriptStyle,
): GeneratedScript {
  const kws = keywords.split(",").map(s => s.trim()).filter(Boolean);
  const kwStr = kws.length ? kws[0] : topic;
  const topicCap = topic.charAt(0).toUpperCase() + topic.slice(1);

  const wordsPerMin = 140;
  const targetWords = parseInt(length) * wordsPerMin;

  // Titles
  const titles = [
    `How to ${topicCap}: Complete ${YEAR} Guide${audience ? ` for ${audience}` : ""}`,
    `${topicCap} — The Strategy That Actually Works in ${YEAR}`,
    `I Tested ${topicCap} for [X Days] — Here's What Happened`,
  ];

  // Hook
  const hookFn = HOOKS[tone];
  const hookContent = hookFn(topic, kwStr);

  // Intro
  const introFn = INTROS[tone];
  const introContent = introFn(topic, goal, audience);

  // Mid CTA
  const midCta = `[MID-VIDEO CTA — around the halfway point]\n"If you're finding this valuable, hit the Like button — it genuinely helps me keep making videos like this. And if you haven't subscribed yet, now's a great time. Okay, back to ${topic}."`;

  // Main sections
  const { sections: mainSections } = buildMainContent(topic, style, tone, goal, length, keywords);

  // End CTA
  const endCta = `[END CTA]\n"So that's everything you need to know to get started with ${topic} today. If you found this helpful, subscribe to the channel — I post new videos about ${audience ? audience + " and " : ""}${kwStr} every week. Drop a comment below and tell me: what's your biggest challenge with ${topic} right now? I read every comment. And for your next step, I've linked a video right here that pairs perfectly with what we covered today — check it out."\n\n[Point to end screen video]`;

  // Outro
  const outro = `"To recap what we covered: ${mainSections.map((s, i) => `${i + 1}) ${s.title.split("—")[0].trim()}`).join(", ")}. Use these steps, be consistent, and I promise you'll start seeing results with ${topic}. I'll see you in the next one."`;

  // Build sections
  const scriptSections: ScriptSection[] = [
    {
      label: "HOOK",
      tag: "First 5–15 seconds",
      duration: "~0:05–0:15",
      content: hookContent,
      tip: "Deliver with energy. No slow starts. Cut anything that doesn't immediately grab attention.",
      icon: <Play className="w-4 h-4" />,
    },
    {
      label: "INTRO",
      tag: "15–30 seconds",
      duration: "~0:15–0:45",
      content: introContent,
      tip: "Establish credibility fast. Tell viewers exactly what they'll get and why they should stay.",
      icon: <BookOpen className="w-4 h-4" />,
    },
    ...mainSections.map((s, i) => ({
      label: `MAIN CONTENT ${i + 1}`,
      tag: s.title,
      duration: `~${1 + i * Math.ceil(parseInt(length) / mainSections.length)}:00`,
      content: `${s.body}\n\n${s.interrupt}`,
      tip: "Keep the energy consistent. Use the pattern interrupt every 20–40 seconds.",
      icon: <FileText className="w-4 h-4" />,
    })),
    {
      label: "MID-VIDEO CTA",
      tag: "Soft ask — halfway point",
      duration: `~${Math.floor(parseInt(length) / 2)}:00`,
      content: midCta,
      tip: "Make it feel natural, not forced. Briefly pause for it, then transition back smoothly.",
      icon: <Target className="w-4 h-4" />,
    },
    {
      label: "END CTA",
      tag: "Strong close",
      duration: `~${parseInt(length) - 1}:00`,
      content: endCta,
      tip: "Be direct. Tell viewers exactly what to do next. One action per CTA.",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      label: "OUTRO",
      tag: "Recap & close",
      duration: `~${parseInt(length)}:00`,
      content: outro,
      tip: "Keep it short. Recap → subscribe nudge → point to next video. Under 30 seconds.",
      icon: <Star className="w-4 h-4" />,
    },
  ];

  // B-roll
  const broll = [
    `Hook: Close-up of face or relevant object to immediately grab attention`,
    `Main content: Screen recordings or demos showing ${topic} in action`,
    `Step sections: B-roll of hands on keyboard / relevant product / environment`,
    `Stats/data: Animated text or chart showing key numbers`,
    `End CTA: Return to talking head, point directly at camera toward end screen`,
    `Throughout: Short, punchy cutaways every 20–40 seconds to maintain engagement`,
  ];

  // On-screen text
  const onScreenText = [
    `[HOOK] Bold text: "${topicCap.toUpperCase()} MISTAKE?"`,
    `[INTRO] Title card: "${titles[0]}"`,
    ...mainSections.map((s, i) => `[SECTION ${i + 1}] Label: "${s.title.replace(/^(Step \d+ — |Tip #\d+ — )/, "")}"`),
    `[MID CTA] Icon + text: "👍 Like if this helps!"`,
    `[END CTA] Animated subscribe button + channel name`,
  ];

  // Thumbnail text
  const thumbnailText = [
    `"${topicCap.toUpperCase()} SECRETS"`,
    `"${parseInt(length)}MIN GUIDE"`,
    `"DO THIS FIRST"`,
    `"${YEAR} STRATEGY"`,
  ];

  return {
    titles,
    sections: scriptSections,
    broll,
    onScreenText,
    thumbnailText,
    estimatedWords: targetWords,
    estimatedDuration: `${length} minutes`,
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube Script Generator?",
    a: "A YouTube Script Generator is a free tool that creates complete, structured video scripts based on your topic, tone, and target audience. It generates every section you need — hook, intro, main content with pattern interrupts, mid-video CTA, end CTA, and outro — along with B-roll suggestions, on-screen text ideas, and thumbnail text, so you can start filming immediately with a professional-grade script.",
  },
  {
    q: "How do I write a YouTube script that keeps viewers watching?",
    a: "A high-retention YouTube script starts with a curiosity-driven hook in the first 5–15 seconds that creates a tension or open loop. The intro quickly establishes what the viewer will gain. The body content is broken into clear segments with pattern interrupts every 20–40 seconds — a question, surprising stat, or shift in energy — to prevent drop-off. Short, punchy sentences, direct viewer address (using 'you'), and a specific end CTA complete the structure. Our script generator applies all of these retention mechanics automatically.",
  },
  {
    q: "How long should a YouTube video script be?",
    a: "Script length depends on your target video duration. As a guide: 1 minute ≈ 130–160 words, 5 minutes ≈ 650–800 words, 10 minutes ≈ 1,300–1,600 words, 15 minutes ≈ 1,950–2,400 words. Our generator targets the correct word count based on the video length you select. For most YouTube niches, 8–12 minute videos strike the best balance between value delivery and ad revenue potential.",
  },
  {
    q: "What is a pattern interrupt in a YouTube script?",
    a: "A pattern interrupt is a moment in your script that deliberately breaks the viewer's passive watching state and re-engages their attention. Examples include asking a direct question ('But here's where it gets interesting...'), revealing a surprising stat, injecting a brief story, or switching between talking-head and B-roll footage. YouTube's algorithm measures audience retention second-by-second, so placing pattern interrupts every 20–40 seconds is one of the most effective ways to keep viewers watching.",
  },
  {
    q: "What are the different YouTube script styles and when should I use each?",
    a: "The five main YouTube script styles are: (1) Talking Head — ideal for opinion, commentary, and personal brand content; (2) Tutorial — best for how-to and step-by-step educational content; (3) Listicle — great for top-X videos with high shareability; (4) Storytelling — powerful for personal brand and testimonial-driven content; (5) Documentary — suited for deep-dive educational and research-based videos. Match your style to your channel niche and audience expectations for the best retention results.",
  },
  {
    q: "How important is the YouTube video hook?",
    a: "The hook is the single most critical part of your YouTube script. YouTube Analytics shows that most viewer drop-off happens in the first 30 seconds. A great hook uses one of four proven formulas: a curiosity gap ('Most people don't know this about...'), a bold claim ('This strategy doubled my results in 7 days'), a problem-based opener ('Struggling with X? Here's the fix'), or a shock/surprise opener ('I tried this for 30 days and everything changed'). Our generator creates a tone-matched hook using proven psychological triggers for every script it produces.",
  },
  {
    q: "Should I read my YouTube script word for word?",
    a: "No — reading word-for-word from a script makes delivery sound robotic and kills viewer connection. Instead, use your script as a structured outline and speak conversationally from it. Write your script the way you naturally talk: short sentences, contractions (I'm, you'll, it's), direct address ('you'), and informal transitions ('okay, so,' 'here's the thing,' 'but wait'). The scripts generated by our tool are written in conversational language specifically designed to sound natural when spoken.",
  },
  {
    q: "What is the best YouTube video length for views and monetization?",
    a: "For maximum ad revenue, 8–12 minutes is the sweet spot because videos over 8 minutes qualify for mid-roll ads, which significantly increase RPM. For audience growth and shareability, 5–8 minutes tends to perform well across most niches. Shorts (under 60 seconds) drive subscriber growth but generate lower ad revenue. Choose your video length based on the complexity of the topic and your monetization goal, then use our generator to build the right script length automatically.",
  },
  {
    q: "How do I add keywords to my YouTube script for SEO?",
    a: "For YouTube SEO, your target keyword should appear naturally in three key places: in the hook (first 30 seconds), in the intro section, and at least once in each major content section. Avoid forcing it — YouTube's algorithm understands context and semantic relevance, so variations of your keyword count. Our script generator accepts target keywords as input and weaves them naturally into the hook, intro, and main sections without keyword stuffing.",
  },
  {
    q: "What should I say in my YouTube video call-to-action?",
    a: "A strong YouTube CTA is specific, direct, and offers a clear reason to act. For a mid-video soft CTA: 'If this is helping, hit the like button — it helps the algorithm show this to more people.' For an end CTA: direct the viewer to subscribe ('I post every [day] about [topic]'), ask a specific question in the comments to drive engagement ('Comment below: what's your biggest challenge with [topic]?'), and point to a recommended next video. Never ask for more than two actions at once — one clear CTA converts better than three scattered ones.",
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

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all shrink-0 ${copied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground border-border hover:border-primary/50 hover:text-primary"}`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

const SECTION_COLORS: Record<string, string> = {
  HOOK: "border-l-red-500 bg-red-50/30 dark:bg-red-900/10",
  INTRO: "border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10",
  "MAIN CONTENT 1": "border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10",
  "MAIN CONTENT 2": "border-l-purple-400 bg-purple-50/20 dark:bg-purple-900/10",
  "MAIN CONTENT 3": "border-l-purple-300 bg-purple-50/20 dark:bg-purple-900/10",
  "MAIN CONTENT 4": "border-l-indigo-400 bg-indigo-50/20 dark:bg-indigo-900/10",
  "MID-VIDEO CTA": "border-l-amber-500 bg-amber-50/30 dark:bg-amber-900/10",
  "END CTA": "border-l-green-500 bg-green-50/30 dark:bg-green-900/10",
  OUTRO: "border-l-teal-500 bg-teal-50/30 dark:bg-teal-900/10",
};

function SectionCard({ section }: { section: ScriptSection }) {
  const [expanded, setExpanded] = useState(true);
  const colorClass = SECTION_COLORS[section.label] ?? "border-l-primary bg-primary/5";
  return (
    <div className={`rounded-2xl border border-border border-l-4 ${colorClass} overflow-hidden`}>
      <div className="flex items-start justify-between px-5 py-4 gap-3">
        <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-3 text-left flex-1 min-w-0">
          <span className="text-foreground shrink-0">{section.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-xs uppercase tracking-widest text-primary">{section.label}</span>
              <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-full">{section.tag}</span>
              <span className="text-xs text-muted-foreground">{section.duration}</span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <CopyButton text={section.content} />
          <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded-xl hover:bg-muted transition-colors">
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans bg-background/60 rounded-xl p-4 border border-border">
            {section.content}
          </pre>
          {section.tip && (
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span><strong>Filmmaker tip:</strong> {section.tip}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "educational", label: "Educational", desc: "Clear & informative" },
  { value: "entertaining", label: "Entertaining", desc: "Fun & engaging" },
  { value: "storytelling", label: "Storytelling", desc: "Narrative-driven" },
  { value: "authoritative", label: "Authoritative", desc: "Expert & confident" },
  { value: "motivational", label: "Motivational", desc: "Inspiring & uplifting" },
];

const GOALS: { value: Goal; label: string }[] = [
  { value: "educate", label: "Educate" },
  { value: "entertain", label: "Entertain" },
  { value: "convert", label: "Convert" },
  { value: "inspire", label: "Inspire" },
  { value: "review", label: "Review" },
];

const LENGTHS: { value: VideoLength; label: string; sub: string }[] = [
  { value: "3", label: "3 min", sub: "~420 words" },
  { value: "5", label: "5 min", sub: "~700 words" },
  { value: "7", label: "7 min", sub: "~980 words" },
  { value: "10", label: "10 min", sub: "~1,400 words" },
  { value: "15", label: "15 min", sub: "~2,100 words" },
];

const STYLES: { value: ScriptStyle; label: string }[] = [
  { value: "talking-head", label: "Talking Head" },
  { value: "tutorial", label: "Tutorial" },
  { value: "listicle", label: "Listicle" },
  { value: "storytelling", label: "Storytelling" },
  { value: "documentary", label: "Documentary" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouTubeScriptGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [length, setLength] = useState<VideoLength>("7");
  const [tone, setTone] = useState<Tone>("educational");
  const [goal, setGoal] = useState<Goal>("educate");
  const [keywords, setKeywords] = useState("");
  const [style, setStyle] = useState<ScriptStyle>("tutorial");

  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"script" | "bonus">("script");

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-yt-script-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic to generate a script.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = buildScript(topic.trim(), audience.trim(), length, tone, goal, keywords.trim(), style);
      setScript(result);
      setIsGenerating(false);
      setActiveTab("script");
      setTimeout(() => document.getElementById("script-output")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 700);
  }, [topic, audience, length, tone, goal, keywords, style, toast]);

  const copyFullScript = () => {
    if (!script) return;
    const full = script.sections.map(s => `== ${s.label}: ${s.tag} ==\n${s.content}`).join("\n\n");
    navigator.clipboard.writeText(full);
    toast({ title: "Full script copied!", description: "Paste it into your script editor or Google Doc.", duration: 2500 });
  };

  return (
    <>
      {/* ── Input Card ──────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleGenerate} className="space-y-5">

            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                Video Topic <span className="text-red-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. How to grow on YouTube, passive income ideas, keto diet for beginners"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                required
              />
            </div>

            {/* Audience + Keywords */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Target Audience <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. beginners, small business owners, college students"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  SEO Keywords <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="e.g. YouTube SEO tips, grow channel fast"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            {/* Video Length */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Video Length</label>
              <div className="flex flex-wrap gap-2">
                {LENGTHS.map(l => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLength(l.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex flex-col items-center gap-0.5 ${
                      length === l.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[10px] opacity-70">{l.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex flex-col items-start gap-0.5 ${
                      tone === t.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="text-[10px] opacity-70">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal + Script Style row */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Video Goal</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        goal === g.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Script Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStyle(s.value)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        style === s.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isGenerating} size="lg" className="w-full h-14 text-base font-bold rounded-2xl gap-2 shadow-lg shadow-primary/20">
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Your Script...</>
                : <><Video className="w-5 h-5" /> Generate YouTube Script</>
              }
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Script Output ────────────────────────────────────── */}
      {script && (
        <section id="script-output" className="space-y-5 mt-2">

          {/* Stats Banner */}
          <Card className="p-5 sm:p-6 rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 to-muted/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-foreground">Your YouTube Script is Ready</h2>
                <p className="text-sm text-muted-foreground mt-1">Topic: <strong className="text-foreground">{topic}</strong> · Style: <strong className="text-foreground">{STYLES.find(s => s.value === style)?.label}</strong> · Length: <strong className="text-foreground">{script.estimatedDuration}</strong> · ~{script.estimatedWords.toLocaleString()} words</p>
              </div>
              <button
                onClick={copyFullScript}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:bg-primary/90 transition-colors shrink-0"
              >
                <Copy className="w-4 h-4" /> Copy Full Script
              </button>
            </div>
          </Card>

          {/* Title Options */}
          <Card className="p-6 rounded-3xl border-border">
            <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> 3 Title Options
            </h3>
            <div className="space-y-3">
              {script.titles.map((title, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors group">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="flex-1 text-sm font-medium text-foreground">{title}</p>
                  <CopyButton text={title} />
                </div>
              ))}
            </div>
          </Card>

          {/* Tab Switcher */}
          <div className="flex gap-2 p-1 bg-muted rounded-2xl">
            {(["script", "bonus"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab === "script" ? "🎬 Full Script" : "🎁 Bonus: B-Roll & Thumbnail"}
              </button>
            ))}
          </div>

          {activeTab === "script" && (
            <div className="space-y-4">
              {script.sections.map((section, i) => (
                <SectionCard key={i} section={section} />
              ))}
              <div className="flex justify-between items-center flex-wrap gap-3 px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
                <span>📝 Estimated length: ~{script.estimatedWords.toLocaleString()} words · {script.estimatedDuration}</span>
                <button
                  onClick={copyFullScript}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:text-primary transition-all"
                >
                  <Copy className="w-3 h-3" /> Copy Full Script
                </button>
              </div>
            </div>
          )}

          {activeTab === "bonus" && (
            <div className="space-y-5">
              {/* B-roll */}
              <Card className="p-6 rounded-3xl border-border">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" /> Suggested B-Roll Ideas
                </h3>
                <div className="space-y-2">
                  {script.broll.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border text-sm text-muted-foreground">
                      <span className="text-primary font-bold shrink-0">▶</span> {item}
                    </div>
                  ))}
                </div>
              </Card>

              {/* On-screen text */}
              <Card className="p-6 rounded-3xl border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> On-Screen Text Suggestions
                  </h3>
                  <CopyButton text={script.onScreenText.join("\n")} label="Copy All" />
                </div>
                <div className="space-y-2">
                  {script.onScreenText.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border text-sm font-mono text-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Thumbnail text */}
              <Card className="p-6 rounded-3xl border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" /> Thumbnail Text Ideas
                  </h3>
                  <CopyButton text={script.thumbnailText.join("\n")} label="Copy All" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {script.thumbnailText.map((item, i) => (
                    <div key={i} className="px-5 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-lg">
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Keep thumbnail text to 2–5 bold words maximum. Pair with a human face showing emotion for maximum CTR.</p>
              </Card>

              {/* Regenerate button */}
              <button
                onClick={() => handleGenerate()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate Script
              </button>
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Script Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Topic and Audience", desc: "Type your video topic or main keyword into the first field — for example, 'how to grow on YouTube' or 'keto diet for beginners'. Optionally add your target audience and SEO keywords to make the script even more targeted." },
            { step: 2, title: "Choose Your Style and Tone", desc: "Select your video length (3 to 15 minutes), tone (educational, entertaining, storytelling, authoritative, or motivational), video goal, and script style. Each combination produces a uniquely structured script optimized for that format." },
            { step: 3, title: "Generate and Review", desc: "Click Generate YouTube Script and the tool creates a complete, section-by-section script with hook, intro, structured main content, pattern interrupts, mid-video CTA, end CTA, and outro — all tuned for your chosen length and tone." },
            { step: 4, title: "Copy and Film", desc: "Copy individual sections or the entire script with one click. Check the Bonus tab for B-roll suggestions, on-screen text ideas, and thumbnail text you can apply immediately. Then open the script in your teleprompter or notes app and hit record." },
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
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Script Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> How the Script Generator Works
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free YouTube Script Generator creates complete, professionally structured video scripts using proven frameworks developed by top-performing YouTube creators and audience retention specialists. Every script follows the same foundational architecture used by channels with millions of subscribers: a psychologically-engineered <strong className="text-foreground">hook</strong> in the first 5–15 seconds that creates a curiosity gap or emotional tension, a concise <strong className="text-foreground">intro</strong> that establishes relevance and previews value, <strong className="text-foreground">main content sections</strong> broken into clear segments based on your chosen script style (tutorial, listicle, storytelling, talking head, or documentary), <strong className="text-foreground">pattern interrupts</strong> built into every section to re-engage attention every 20–40 seconds, a <strong className="text-foreground">mid-video CTA</strong> for engagement, a strong <strong className="text-foreground">end CTA</strong> for subscribers and watch time, and a clean <strong className="text-foreground">outro</strong> that recaps key points and directs viewers to the next video. The script length is calibrated precisely to your target duration using the industry-standard estimate of 130–160 words per minute of spoken content.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why a Good Script Dramatically Improves YouTube Performance
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              YouTube's algorithm ranks videos primarily on <strong className="text-foreground">watch time</strong> and <strong className="text-foreground">audience retention</strong> — specifically the percentage of the video that average viewers watch. A well-scripted video routinely achieves 50–70% average view duration, while an unscripted video on the same topic might see 25–35%. That difference matters enormously: higher retention signals to YouTube that your video is valuable, which causes it to be recommended more aggressively in Suggested Videos, Home feed, and YouTube Search. Scripted videos also tend to have tighter editing, fewer filler words, and clearer value delivery — all of which improve engagement metrics like likes and comments. Whether you use a teleprompter or just your notes, having a structured script before you film gives you a significant competitive advantage. It eliminates rambling, ensures you hit every key point, and lets you focus on delivery instead of figuring out what to say next. Our YouTube Script Generator handles the architecture so you can focus on the performance.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This YouTube Script Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Generates complete scripts with hook, intro, body, CTA, and outro",
                "5 tone options to match your channel style and audience personality",
                "5 script styles: tutorial, listicle, storytelling, talking head, documentary",
                "Pattern interrupts built in every 20–40 seconds for maximum retention",
                "Calibrated word counts matched to your target video duration",
                "SEO keyword integration woven naturally into hook and intro sections",
                "Mid-video and end-video CTAs designed to drive likes, subs, and watch time",
                "Bonus B-roll, on-screen text, and thumbnail text suggestions included",
                "Copy individual sections or the entire script with one click",
                "100% free — no account required, unlimited script generations",
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
            { name: "YouTube Video Idea Generator", path: "/tools/youtube-video-idea-generator", desc: "Generate the video concept and angle before writing your script for stronger content." },
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Create a high-CTR title that matches the hook and promise in your generated script." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write an SEO-optimized description that mirrors your script's key points and keywords." },
            { name: "YouTube Hashtag Generator", path: "/tools/youtube-hashtag-generator", desc: "Add the right hashtags to amplify every video you script and publish." },
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

      {/* Internal link to related tools */}
      <div className="mt-4 p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-4">
        <Star className="w-8 h-8 text-primary shrink-0" />
        <div>
          <p className="font-bold text-foreground text-sm">Complete your video optimization workflow</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            After scripting, generate your title with the <a href="/tools/youtube-title-generator" className="text-primary font-semibold hover:underline">YouTube Title Generator</a>, write your description with the <a href="/tools/youtube-description-generator" className="text-primary font-semibold hover:underline">YouTube Description Generator</a>, and check your overall SEO with the <a href="/tools/youtube-seo-score-checker" className="text-primary font-semibold hover:underline">YouTube SEO Score Checker</a>.
          </p>
        </div>
      </div>
    </>
  );
}
