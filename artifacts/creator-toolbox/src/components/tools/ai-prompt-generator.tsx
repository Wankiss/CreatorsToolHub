import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Copy, Check, RefreshCw, Loader2, ChevronDown,
  Zap, TrendingUp, Shield, ListChecks, Search, FileText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentType =
  | "youtube-script" | "instagram-caption" | "tiktok-script" | "email-newsletter"
  | "blog-post" | "linkedin-post" | "twitter-thread" | "youtube-description"
  | "podcast-script" | "facebook-post" | "tiktok-idea" | "pinterest-description";

type Goal = "engagement" | "sales" | "education" | "awareness" | "branding";
type Tone = "casual" | "formal" | "humorous" | "inspiring" | "bold";
type Platform = "chatgpt" | "claude" | "gemini";

// ─── Config Maps ──────────────────────────────────────────────────────────────

const CONTENT_TYPES: { value: ContentType; label: string; icon: string }[] = [
  { value: "youtube-script", label: "YouTube Script", icon: "📹" },
  { value: "instagram-caption", label: "Instagram Caption", icon: "📸" },
  { value: "tiktok-script", label: "TikTok Script", icon: "🎵" },
  { value: "email-newsletter", label: "Email Newsletter", icon: "📧" },
  { value: "blog-post", label: "Blog Post", icon: "✍️" },
  { value: "linkedin-post", label: "LinkedIn Post", icon: "💼" },
  { value: "twitter-thread", label: "Twitter/X Thread", icon: "🐦" },
  { value: "youtube-description", label: "YouTube Description", icon: "📝" },
  { value: "podcast-script", label: "Podcast Script", icon: "🎙️" },
  { value: "facebook-post", label: "Facebook Post", icon: "👥" },
  { value: "tiktok-idea", label: "TikTok Idea", icon: "💡" },
  { value: "pinterest-description", label: "Pinterest Description", icon: "📌" },
];

const GOALS: { value: Goal; label: string }[] = [
  { value: "engagement", label: "Engagement" },
  { value: "sales", label: "Sales / Conversions" },
  { value: "education", label: "Education" },
  { value: "awareness", label: "Brand Awareness" },
  { value: "branding", label: "Personal Brand" },
];

const TONES: { value: Tone; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "humorous", label: "Humorous" },
  { value: "inspiring", label: "Inspiring" },
  { value: "bold", label: "Bold" },
];

const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: "chatgpt", label: "ChatGPT", color: "text-green-600 dark:text-green-400" },
  { value: "claude", label: "Claude", color: "text-orange-500" },
  { value: "gemini", label: "Gemini", color: "text-blue-600 dark:text-blue-400" },
];

// ─── Prompt Generation Engine ─────────────────────────────────────────────────

function getRole(contentType: ContentType, niche: string): string {
  const n = niche.trim() ? ` specializing in ${niche.trim()} content` : "";
  const roles: Record<ContentType, string> = {
    "youtube-script": `professional YouTube scriptwriter${n}`,
    "instagram-caption": `high-converting social media copywriter specializing in Instagram${n ? ` for the ${niche.trim()} niche` : ""}`,
    "tiktok-script": `viral TikTok content strategist${n}`,
    "tiktok-idea": `TikTok content strategist who specializes in trend-driven${n} video concepts`,
    "email-newsletter": `professional email marketer${n} with expertise in high-open-rate campaigns`,
    "blog-post": `SEO-optimized content writer and blog strategist${n}`,
    "linkedin-post": `LinkedIn thought leadership content strategist${n}`,
    "twitter-thread": `Twitter/X content strategist who writes high-engagement threads${n}`,
    "youtube-description": `YouTube SEO specialist who writes keyword-rich video descriptions${n}`,
    "podcast-script": `professional podcast scriptwriter${n}`,
    "facebook-post": `social media content strategist specializing in Facebook engagement${n}`,
    "pinterest-description": `Pinterest SEO content writer${n}`,
  };
  return roles[contentType];
}

function getOutputType(contentType: ContentType): string {
  const types: Record<ContentType, string> = {
    "youtube-script": "YouTube video script (5–8 minutes, scene-by-scene with timestamps)",
    "instagram-caption": "Instagram caption with hook, body, CTA, and hashtag suggestions",
    "tiktok-script": "TikTok video script (30–60 seconds) with first-3-seconds hook",
    "tiktok-idea": "TikTok video concept with format type, hook, content structure, and trend angle",
    "email-newsletter": "Email newsletter with subject line, preview text, intro, body sections, and CTA",
    "blog-post": "Long-form blog post with SEO title, meta description, H1, H2s, body paragraphs, and CTA",
    "linkedin-post": "LinkedIn post with hook, body, key insights, and call-to-action",
    "twitter-thread": "Twitter/X thread (8–12 tweets) with hook tweet, numbered body tweets, and CTA tweet",
    "youtube-description": "YouTube video description with keyword-rich intro paragraph, timestamps, and CTA",
    "podcast-script": "Podcast episode script with intro, segment-by-segment breakdown, and outro",
    "facebook-post": "Facebook post with story hook, body, engagement question, and CTA",
    "pinterest-description": "Pinterest pin description with SEO keywords, value statement, and CTA",
  };
  return types[contentType];
}

function getFormatting(contentType: ContentType, wordCount: string): string {
  const wc = wordCount.trim();
  const formats: Record<ContentType, string> = {
    "youtube-script": `Markdown format, scene-by-scene structure with [Scene X] labels, timestamps every 60–90 seconds, B-roll notes in italics${wc ? `, target length: ${wc}` : ", target: 900–1,200 words for a 5–7 min video"}`,
    "instagram-caption": `Plain text, 3–5 short paragraphs, line breaks between sections${wc ? `, max ${wc} characters` : ", 150–300 characters for main caption"}, hashtags on a new line at the end`,
    "tiktok-script": `Scene-by-scene script with timestamps, action cues in [brackets]${wc ? `, length: ${wc}` : ", 150–250 words for a 60-second video"}`,
    "tiktok-idea": `Structured concept card: Format Type, Hook Line, Content Beat-by-Beat, Trending Angle, Suggested Audio Type${wc ? ` (${wc})` : ""}`,
    "email-newsletter": `Sections clearly labeled: [Subject Line], [Preview Text], [Intro], [Section 1–3], [CTA], [P.S.]${wc ? ` Target: ${wc} words` : ", target 350–600 words"}`,
    "blog-post": `Full markdown: SEO Title, Meta Description, H1, H2 sections with paragraphs, bullet lists where relevant, internal link placeholders${wc ? `, target: ${wc} words` : ", target 1,200–1,800 words"}`,
    "linkedin-post": `Plain text with line breaks, hook line first, 3–5 short paragraphs, insights formatted as bullet points${wc ? ` (${wc} words)` : " (150–300 words)"}, CTA last line`,
    "twitter-thread": `Numbered tweets (1/, 2/, etc.), each tweet under 280 characters, hook tweet first, CTA last tweet${wc ? ` (${wc} total)` : " (8–12 tweets total)"}`,
    "youtube-description": `3 paragraphs: keyword-rich intro (2–3 sentences), video overview with timestamps, resources + CTA${wc ? ` (${wc} total)` : " (200–350 words total)"}`,
    "podcast-script": `Conversational markdown: [Intro], [Segment 1–4] with talking points, [Outro & CTA]${wc ? `, target: ${wc}` : ", target 800–1,200 words"}`,
    "facebook-post": `2–4 paragraphs, story-driven opening, engagement question before CTA${wc ? ` (${wc} words)` : " (100–250 words)"}`,
    "pinterest-description": `1–2 keyword-rich paragraphs, natural language, benefit-focused${wc ? ` (${wc} characters)` : " (100–200 characters for primary description)"}`,
  };
  return formats[contentType];
}

function getRequiredComponents(contentType: ContentType, goal: Goal): string[] {
  const goalComponents: Record<Goal, string[]> = {
    engagement: ["Engagement question or poll prompt", "Relatable hook or story opener", "Comment-driving CTA"],
    sales: ["Pain point identification", "Solution/benefit framing", "Clear CTA with urgency or value anchor"],
    education: ["Key actionable takeaways (3+ tips)", "Simple, jargon-free explanations", "Summary or recap section"],
    awareness: ["Brand voice consistency", "Value proposition statement", "Social proof or credibility signal"],
    branding: ["Authentic personal voice", "Unique perspective or opinion", "Brand tagline or signature phrase"],
  };

  const typeComponents: Record<ContentType, string[]> = {
    "youtube-script": ["15-second pattern-interrupt hook", "Problem-Solution-CTA narrative arc", "Subscribe/like CTA", "B-roll suggestions"],
    "instagram-caption": ["First-line scroll-stopper hook", "Hashtag block (15–20 relevant)", "Story or value body", "Engagement CTA"],
    "tiktok-script": ["First 3-second scroll-stopping hook", "Trending audio or sound suggestion", "On-screen text cues", "End-screen CTA"],
    "tiktok-idea": ["Hook concept", "Format type (POV, tutorial, day-in-life, etc.)", "Content beats (3–5)", "Trend angle"],
    "email-newsletter": ["Attention-grabbing subject line (under 50 chars)", "Preview text (under 90 chars)", "Personalization placeholder", "Primary CTA button copy"],
    "blog-post": ["SEO title (55–65 characters)", "Meta description (150–160 characters)", "Intro with search intent match", "Internal link placeholders", "Conclusion + CTA"],
    "linkedin-post": ["Hook line (first 2–3 words stop the scroll)", "Key professional insight or story", "Bullet-point takeaways", "Connection-building CTA"],
    "twitter-thread": ["Thread hook tweet (most compelling)", "Numbered tweet structure", "Value-dense middle tweets", "CTA final tweet with follow prompt"],
    "youtube-description": ["Primary keyword in first 2 sentences", "Timestamps for each section", "Channel subscription CTA", "Links to related resources"],
    "podcast-script": ["Show intro with value promise", "Guest introduction (if applicable)", "Segment transitions", "Sponsor mention slot", "Outro with subscribe CTA"],
    "facebook-post": ["Story-driven hook", "Emotional resonance point", "Community engagement question", "Link or CTA placement"],
    "pinterest-description": ["Primary keyword in first sentence", "Secondary keyword variation", "Direct benefit statement", "Call-to-action to save or visit"],
  };

  return [...(typeComponents[contentType] || []), ...(goalComponents[goal] || [])];
}

function getSteps(contentType: ContentType, tone: Tone, audience: string, platform: Platform): string[] {
  const toneInstructions: Record<Tone, string> = {
    casual: "Use a conversational, friendly tone — write like you're talking to a friend. Use contractions, short sentences, and relatable language.",
    formal: "Use professional, authoritative language. Complete sentences, no slang, industry-appropriate terminology.",
    humorous: "Incorporate wit, wordplay, and light humor where appropriate. Keep it clever and relatable — funny but never off-brand.",
    inspiring: "Use motivational, aspirational language. Paint a vision of success and use emotionally resonant phrases that drive action.",
    bold: "Make strong, confident statements. Use direct language, powerful verbs, and don't hedge. Bold opinions are welcome.",
  };

  const platformTweaks: Record<Platform, string> = {
    chatgpt: "Format your output in conversational markdown with clear section headers and readable spacing.",
    claude: "Use precise, structured output with clearly labeled sections and consistent formatting throughout.",
    gemini: "Produce a concise, professional output. Be direct and organized — use headers and bullet points for clarity.",
  };

  const audienceSuffix = audience.trim() ? ` The audience is: ${audience.trim()}.` : "";

  return [
    `Take on the role as described in the Role/Persona above.`,
    `${toneInstructions[tone]}${audienceSuffix}`,
    `Follow the exact Output Type format and Formatting instructions provided.`,
    `Include every Required Component listed — do not skip any element.`,
    `Ensure the content achieves the stated goal — every line should serve that purpose.`,
    `Write as if this is the final, publish-ready version. No placeholder text, no "insert X here" — generate real, specific content.`,
    `${platformTweaks[platform]}`,
    `Do not explain what you're doing — just produce the output. No preamble or meta-commentary.`,
  ];
}

function buildPrompt(
  contentType: ContentType,
  niche: string,
  audience: string,
  goal: Goal,
  tone: Tone,
  platform: Platform,
  wordCount: string,
  roleOverride: string,
  keywords: string,
  extraInstructions: string,
  includeExample: boolean,
): string {
  const role = roleOverride.trim() || getRole(contentType, niche);
  const outputType = getOutputType(contentType);
  const formatting = getFormatting(contentType, wordCount);
  const components = getRequiredComponents(contentType, goal);
  const steps = getSteps(contentType, tone, audience, platform);
  const goalLabels: Record<Goal, string> = {
    engagement: "maximize engagement and audience interaction",
    sales: "drive conversions and sales",
    education: "educate and deliver actionable value",
    awareness: "build brand awareness and reach",
    branding: "strengthen personal brand and authority",
  };
  const toneLabels: Record<Tone, string> = {
    casual: "casual, conversational, and relatable",
    formal: "formal, professional, and authoritative",
    humorous: "witty, playful, and entertaining",
    inspiring: "inspiring, motivational, and aspirational",
    bold: "bold, direct, and opinionated",
  };
  const platformLabels: Record<Platform, string> = {
    chatgpt: "ChatGPT (GPT-4o)",
    claude: "Claude (Anthropic)",
    gemini: "Gemini (Google)",
  };

  const kwSection = keywords.trim() ? `\nKeywords / Key Messages to Include: ${keywords.trim()}` : "";
  const extraSection = extraInstructions.trim() ? `\nExtra Instructions: ${extraInstructions.trim()}` : "";

  const exampleMap: Record<ContentType, string> = {
    "youtube-script": `[Hook — 0:00–0:15]\n"You've been doing this wrong — and it's costing you views every single day. Here's what actually works in ${new Date().getFullYear()}..."\n\n[Section 1 — 0:15–2:00]\nIntroduce the core problem with a relatable scenario...\n\n[CTA — 6:45–7:00]\n"If this helped you, smash subscribe — I post strategies like this every week."`,
    "instagram-caption": `Most people don't realize this until it's too late.\n\nHere's what the top 1% of [niche] creators do differently every single day:\n\n→ They [actionable tip 1]\n→ They [actionable tip 2]\n→ They [actionable tip 3]\n\nWhich one are you starting with today? Comment below 👇\n\n#[hashtag1] #[hashtag2] #[hashtag3]`,
    "tiktok-script": `[Hook — 0:00–0:03]\n"POV: You just discovered the [niche] secret nobody talks about"\n\n[Content — 0:03–0:45]\nStep 1: [tip]... Step 2: [tip]... Step 3: [tip]...\n\n[CTA — 0:45–0:60]\n"Follow for more [niche] tips that actually work."`,
    "tiktok-idea": `Format: POV / Tutorial hybrid\nHook: "I tried [niche technique] for 30 days — here's what happened"\nBeat 1: Relatable struggle intro (3s)\nBeat 2: The experiment reveal (10s)\nBeat 3: Results + reaction (20s)\nBeat 4: Key takeaway (10s)\nTrending angle: Before/After + Storytime`,
    "email-newsletter": `Subject: You're 1 step away from [desired outcome]\nPreview: Most [audience] never do this...\n\nHey [First Name],\n\nI want to show you something that changed everything for me...\n\n[Body section 1: Hook story]\n[Body section 2: Key insight]\n[Body section 3: Actionable tip]\n\nCTA: [Button: "Get Started Today →"]`,
    "blog-post": `SEO Title: How to [Topic]: The Complete [Year] Guide for [Audience]\nMeta: Learn how to [topic] with our step-by-step guide. Discover proven strategies to [benefit] in [year].\n\nH1: How to [Topic]: The Definitive Guide\n\nIntro paragraph matching search intent...\n\nH2: What Is [Topic]?\nH2: 5 Proven Ways to [Topic]\nH2: Common Mistakes to Avoid\nH2: Final Thoughts`,
    "linkedin-post": `Most [audience] spend years trying to [goal] the hard way.\n\nHere's the shortcut nobody teaches:\n\n• [Insight 1]\n• [Insight 2]\n• [Insight 3]\n\nThe real secret? [Key takeaway in one sentence.]\n\nWhat's your approach? Drop it in the comments — I read every one.`,
    "twitter-thread": `1/ [Shocking or bold hook statement that makes people want to read more]\n\n2/ Here's what most people get wrong about [topic]:\n[Counterintuitive insight]\n\n3–8/ [Value-dense body tweets with one insight per tweet]\n\n9/ The bottom line: [Key takeaway]\n\n10/ If this was useful, follow @[handle] — I tweet about [topic] daily.`,
    "youtube-description": `Learn how to [main keyword] in this complete step-by-step guide for [audience]. In this video, I cover the exact [niche] strategies that helped [social proof or benefit].\n\n⏱️ TIMESTAMPS\n0:00 – Introduction\n1:30 – [Section 1]\n...\n\n🔔 Subscribe for weekly [niche] tips → [channel link]`,
    "podcast-script": `[INTRO — 0:00]\nHost: "Welcome back to [Show Name]. I'm [Host], and today we're diving into [topic] — something that [audience] keeps asking me about..."\n\n[SEGMENT 1 — 3:00]\nKey point 1 with supporting story or data...\n\n[OUTRO]\n"That's a wrap on today's episode. If this resonated, subscribe and leave a review — it helps more than you know."`,
    "facebook-post": `I never thought [relatable scenario] would teach me something this important.\n\nBut then [turning point happened].\n\nHere's what I learned:\n→ [Key lesson 1]\n→ [Key lesson 2]\n→ [Key lesson 3]\n\nHave you ever experienced this? Tell me in the comments.`,
    "pinterest-description": `Discover [main benefit] with these proven [niche] strategies. Perfect for [audience] who want to [desired outcome]. Save this pin to [action]. Visit [website] for the full guide on [keyword].`,
  };

  const exampleSection = includeExample
    ? `\nExample Content (for style reference only — do not copy, use as alignment):\n\n${exampleMap[contentType] || ""}`
    : "";

  return `AI Prompt for ${platformLabels[platform]}:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Role / Persona:
You are a ${role}.

Output Type:
${outputType}

Goal:
${goalLabels[goal]}

Tone & Style:
${toneLabels[tone]}${niche.trim() ? ` Tailored for the ${niche.trim()} niche.` : ""}

Length / Formatting:
${formatting}${kwSection}

Required Components:
${components.map(c => `• ${c}`).join("\n")}${extraSection}

Step-by-Step Instructions for AI:
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${exampleSection}

[This prompt is ready to paste into ${platformLabels[platform]}. Do not modify the role or formatting instructions — just paste and run.]`;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is an AI prompt generator and how does it work?",
    a: "An AI prompt generator creates structured, role-based instructions for AI systems like ChatGPT, Claude, and Gemini that produce professional-quality content on the first attempt. Instead of writing a vague instruction and editing the AI's output for an hour, you fill in your content type, niche, audience, goal, and tone — and the generator builds a complete prompt with role assignment, format specifications, required components, and step-by-step AI instructions. The resulting prompt is ready to copy and paste directly into any AI tool.",
  },
  {
    q: "What content types does the AI Prompt Generator support?",
    a: "The AI Prompt Generator supports 12 content types: YouTube scripts, Instagram captions, TikTok scripts, TikTok ideas, email newsletters, blog posts, LinkedIn posts, Twitter/X threads, YouTube descriptions, podcast scripts, Facebook posts, and Pinterest descriptions. Each content type generates a structurally different prompt optimized for that format's specific conventions, character limits, and required components.",
  },
  {
    q: "What is the difference between ChatGPT, Claude, and Gemini prompts?",
    a: "ChatGPT, Claude, and Gemini each respond best to slightly different prompt structures. ChatGPT performs best with conversational, markdown-formatted prompts that use readable section headers. Claude responds well to precise, structured instructions with consistent formatting and explicit requirements. Gemini works best with concise, direct prompts that use organized bullet points and clear labels. The AI Prompt Generator tailors the formatting and instruction style of each generated prompt for the platform you select.",
  },
  {
    q: "What makes a good AI prompt for content creation?",
    a: "A strong content creation AI prompt has six key elements: (1) Role — a clear professional persona for the AI ('You are a professional YouTube scriptwriter'). (2) Output Type — the exact format and structure required. (3) Tone & Style — explicit tone direction throughout the entire output. (4) Length and Formatting — word count, character limits, and structural rules. (5) Required Components — a checklist of mandatory elements like CTAs, hooks, and hashtags. (6) Step-by-step Instructions — sequential guidance so the AI knows exactly what to do. Missing any element reliably degrades output quality.",
  },
  {
    q: "Can I customize the generated prompt before using it?",
    a: "Yes — and you're encouraged to. The generated prompt is a starting point engineered for quality. After copying it, you can add specific examples from your brand, include references to recent content you've published, add competitor URLs for context, or specify stylistic nuances unique to your voice. The more specific context you add, the more tailored the AI's output will be to your exact needs.",
  },
  {
    q: "Does the AI Prompt Generator work with free versions of ChatGPT and Claude?",
    a: "Yes — the generated prompts work with both free and paid versions of ChatGPT (GPT-4o mini and GPT-4o), Claude (Free and Pro), and Gemini (Free and Advanced). Paid versions typically produce higher-quality outputs for complex prompts like full video scripts or long-form blog posts, but free versions handle shorter formats like Instagram captions, LinkedIn posts, and TikTok ideas very well. The prompt structure ensures you get the best possible output regardless of the AI tier you use.",
  },
  {
    q: "What is a role-based AI prompt and why does it matter?",
    a: "A role-based prompt tells the AI what professional persona to inhabit before generating content — for example, 'You are a professional YouTube scriptwriter specializing in fitness content.' This role assignment has a significant effect on output quality because AI language models adjust their vocabulary, structure, expertise level, and content conventions when given a specific professional context. A script written by a 'professional scriptwriter' will reliably be better structured than one written without role context, because the model activates a different set of patterns and knowledge for each role.",
  },
  {
    q: "How many prompts can I generate for free?",
    a: "There is no limit — the AI Prompt Generator is completely free with no account required and no usage caps. You can generate prompts for as many content types, niches, platforms, and goals as you need. Use the Regenerate button to create alternate prompt structures for the same inputs, or adjust individual fields to generate variants for A/B testing across different AI platforms.",
  },
  {
    q: "What is the 'Include Example' toggle for?",
    a: "The Include Example toggle adds a style-reference snippet to your generated prompt — a short content example that shows the AI the exact style, voice, and format you want. Style examples are one of the most powerful prompting techniques because they give AI models a concrete anchor rather than relying on abstract descriptions of tone. When AI can match a pattern it sees rather than interpret instructions it reads, output quality and style consistency improve significantly.",
  },
  {
    q: "Can I use the generated prompts for client work or commercial projects?",
    a: "Yes — all prompts generated by creatorsToolHub are yours to use however you need, including for client projects, commercial content, and agency workflows. The prompts are not copyrighted and there is no license restriction on their use. For agency workflows, use the Keywords / Key Messages field to embed client-specific terminology, brand voice notes, and messaging frameworks so every generated prompt is pre-configured for that client's standards.",
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

// ─── Main Tool ─────────────────────────────────────────────────────────────────

export function AiPromptGeneratorTool() {
  const [contentType, setContentType] = useState<ContentType>("youtube-script");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState<Goal>("engagement");
  const [tone, setTone] = useState<Tone>("casual");
  const [platform, setPlatform] = useState<Platform>("chatgpt");
  const [wordCount, setWordCount] = useState("");
  const [roleOverride, setRoleOverride] = useState("");
  const [keywords, setKeywords] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [includeExample, setIncludeExample] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-ai-prompt-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = (regen = false) => {
    if (!niche.trim()) {
      setError("Please enter your niche or industry.");
      return;
    }
    setError("");
    setIsGenerating(true);
    setTimeout(() => {
      const result = buildPrompt(
        contentType, niche, audience, goal, tone, platform,
        wordCount, roleOverride, keywords, extraInstructions, includeExample,
      );
      setPrompt(result);
      setIsGenerating(false);
      setHasGenerated(true);
      if (!regen) {
        setTimeout(() => document.getElementById("prompt-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }, 480);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast({ title: "Prompt copied!", description: "Paste it into ChatGPT, Claude, or Gemini.", duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ── Input Card ───────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Content Type */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Content Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {CONTENT_TYPES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setContentType(value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all text-left ${
                      contentType === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Niche + Audience */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Niche / Industry <span className="text-red-500">*</span>
                </label>
                <Input
                  value={niche}
                  onChange={e => { setNiche(e.target.value); if (error) setError(""); }}
                  placeholder="e.g. fitness, personal finance, travel, SaaS"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Target Audience <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. busy moms aged 28–40, beginner entrepreneurs"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Goal</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGoal(value)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
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

            {/* Tone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTone(value)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      tone === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">AI Platform</label>
              <div className="flex gap-3">
                {PLATFORMS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPlatform(value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      platform === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional fields row */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Word Count / Length <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={wordCount}
                  onChange={e => setWordCount(e.target.value)}
                  placeholder="e.g. 500 words, 1,200 words, 60 seconds"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Custom Role / Persona <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={roleOverride}
                  onChange={e => setRoleOverride(e.target.value)}
                  placeholder="e.g. award-winning health copywriter"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Keywords / Key Messages <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="e.g. passive income, beginner-friendly, no experience needed"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Extra Instructions <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={extraInstructions}
                  onChange={e => setExtraInstructions(e.target.value)}
                  placeholder="e.g. include SEO keywords, add affiliate disclaimer"
                  className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            {/* Include Example Toggle */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <button
                type="button"
                onClick={() => setIncludeExample(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${includeExample ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${includeExample ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <div>
                <p className="text-sm font-semibold text-foreground">Include Style Example</p>
                <p className="text-xs text-muted-foreground">Adds a sample snippet to the prompt so the AI can match your style</p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isGenerating}
              className="w-full h-14 text-lg rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              {isGenerating
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Building Your Prompt...</>
                : <><Sparkles className="mr-2 h-5 w-5" />Generate AI Prompt</>
              }
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Result ───────────────────────────────────────────── */}
      {hasGenerated && prompt && (
        <section id="prompt-result" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" />
                Your AI Prompt
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Ready to paste into {PLATFORMS.find(p => p.value === platform)?.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </button>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-xl border transition-all ${
                  copied
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                    : "bg-primary text-primary-foreground border-primary hover:opacity-90"
                }`}
              >
                {copied ? <><Check className="w-3 h-3" />Copied!</> : <><Copy className="w-3 h-3" />Copy Prompt</>}
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed bg-muted/50 border border-border rounded-2xl p-6 text-foreground overflow-x-auto">
              {prompt}
            </pre>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>Paste this prompt directly into <strong className="text-foreground">{PLATFORMS.find(p => p.value === platform)?.label}</strong> — no editing needed. Adjust fields above and regenerate for variations.</span>
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the AI Prompt Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Choose Your Content Type", desc: "Select from 12 content formats — YouTube scripts, Instagram captions, TikTok scripts, blog posts, email newsletters, LinkedIn posts, and more. Each type generates a structurally different prompt tailored to that format's conventions." },
            { step: 2, title: "Fill In Your Details", desc: "Enter your niche, target audience, content goal, tone, and preferred AI platform (ChatGPT, Claude, or Gemini). Optional fields let you set word count, add a custom role, specify keywords, and include extra instructions." },
            { step: 3, title: "Click Generate AI Prompt", desc: "Hit Generate and the tool instantly builds a fully structured, role-based prompt — complete with persona assignment, format specifications, required components, and step-by-step AI instructions." },
            { step: 4, title: "Copy and Paste Into Your AI Tool", desc: "Click Copy Prompt and paste it directly into ChatGPT, Claude, or Gemini. No editing needed — the prompt is engineered to produce professional-quality output on the first attempt. Use Regenerate for alternative structures." },
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
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This AI Prompt Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This AI Prompt Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free AI Prompt Generator builds structured, role-based prompts for ChatGPT, Claude, and Gemini that produce professional-quality content on the first attempt. It covers 12 content types — from YouTube scripts and Instagram captions to email newsletters and blog posts — and applies proven prompt engineering principles: role assignment, format specification, tone direction, required component checklists, and sequential AI instructions. Every generated prompt is copy-paste ready with no editing required before running in your preferred AI tool.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Prompt Quality Determines AI Output Quality
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              The quality of any AI output is almost entirely determined by the quality of the prompt it receives. A vague input like "write me a YouTube script about fitness" produces a generic, unusable first draft. A structured prompt that specifies role, audience, tone, format, and required components produces a first draft that's 70–80% ready to publish. This generator applies the same prompt engineering framework used by professional AI consultants — role-based persona assignment, explicit output type definitions, mandatory component lists, and platform-specific formatting rules — to every prompt it creates.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Tool
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Supports 12 content types across all major creator platforms",
                "Role-based prompts that activate professional AI output quality",
                "Tailored formatting rules for each content type and AI platform",
                "Required component checklists ensure no key element is missing",
                "Platform-specific output style for ChatGPT, Claude, and Gemini",
                "Include Example toggle for style-anchored prompts",
                "Optional keyword and extra instruction fields for full customization",
                "Regenerate for alternative prompt structures and variations",
                "100% free — no account, no limits, copy-paste ready output",
                "Works with free and paid versions of all major AI platforms",
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

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => <AccordionItem key={i} question={item.q} answer={item.a} index={i} />)}
        </div>
      </section>
    </>
  );
}
