import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.GITHUB_TOKEN
    ? "https://models.inference.ai.azure.com"
    : (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? undefined),
  apiKey: process.env.GITHUB_TOKEN
    ?? process.env.AI_INTEGRATIONS_OPENAI_API_KEY
    ?? process.env.OPENAI_API_KEY
    ?? "missing",
});

export interface ToolInput {
  [key: string]: string | number | boolean;
}

export interface ToolOutput {
  result: Record<string, unknown>;
  outputs: string[];
  success: boolean;
}

async function aiGenerate(systemPrompt: string, userPrompt: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  const text = response.choices[0]?.message?.content?.trim() ?? "";
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[\d\-\*\.\)]+\s*/, "").trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [text];
}

// ─── YouTube Tools ────────────────────────────────────────────────────────────

async function generateYouTubeTitles(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || inputs.keyword || "");
  const tone = String(inputs.tone || inputs.style || "engaging");
  const audience = String(inputs.audience || "");
  return aiGenerate(
    `You are an expert YouTube SEO strategist. Generate compelling, click-worthy YouTube video titles.
Return ONLY a numbered list of 10 titles, one per line, no extra commentary.
Each title should be unique, under 70 characters, and optimized for clicks and search.`,
    `Topic: "${topic}"${audience ? `\nTarget audience: ${audience}` : ""}\nTone: ${tone}\n\nGenerate 10 YouTube video titles.`
  );
}

async function generateYouTubeTags(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || inputs.keyword || "");
  return aiGenerate(
    `You are a YouTube SEO expert. Generate relevant YouTube tags/keywords for videos.
Return ONLY a list of 15 tags, one per line, no numbering, no hashtags, no extra text.
Mix broad and specific tags. Include variations and related terms.`,
    `Video topic: "${topic}"\n\nGenerate 15 YouTube tags.`
  );
}

async function generateYouTubeDescription(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "");
  const topicSummary = String(inputs.topicSummary || "");
  const keywords = String(inputs.keywords || "");
  const channel = String(inputs.channelName || "my channel");
  const callToAction = String(inputs.callToAction || "Subscribe for more videos like this");
  const timestamps = String(inputs.timestamps || "");
  const includeSocialLinks = String(inputs.includeSocialLinks || "no") === "yes";

  const userPrompt = [
    `Video title: "${topic}"`,
    topicSummary ? `Topic summary: "${topicSummary}"` : "",
    keywords ? `Target keywords (weave naturally): ${keywords}` : "",
    `Channel name: ${channel}`,
    `Call-to-action: ${callToAction}`,
    timestamps ? `Timestamps to include:\n${timestamps}` : "",
    includeSocialLinks ? "Include a social links section with placeholder URLs for Website, Instagram, Twitter, and Discord." : "",
    "\nWrite a complete, SEO-optimized YouTube description.",
  ].filter(Boolean).join("\n");

  const lines = await aiGenerate(
    `You are an expert YouTube SEO strategist and copywriter. Write a full, structured YouTube video description following this exact six-section format:

1. HOOK (2-3 sentences): Place the primary keyword from the title in the very first sentence. Immediately communicate what viewers will gain. These first 150 characters are critical — they appear in search results.

2. BODY (2-3 paragraphs): Expand on the video topic. Naturally weave in the target keywords and semantic variations — no stuffing. Write in a conversational, engaging tone that viewers and the algorithm both understand.

3. TIMESTAMPS: If timestamps are provided, format them under an "⏱️ CHAPTERS" header. If none provided, skip this section.

4. CALL TO ACTION: Include a subscribe request with the channel name, a notification bell 🔔 reminder, and the specific CTA provided. Keep it warm and genuine.

5. SOCIAL LINKS: If requested, add a "📱 CONNECT WITH US" section with placeholder URLs for the specified platforms. If not requested, skip this section.

6. HASHTAGS: End with 3–5 highly relevant hashtags based on the video title and keywords.

Use emojis naturally as section headers. Keep the total description between 250–450 words. Return the entire description as one block of text preserving all newlines.`,
    userPrompt
  );
  return [lines.join("\n")];
}

async function generateChannelNames(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || inputs.topic || "");
  const style = String(inputs.style || "Creative");
  const length = String(inputs.length || "medium");
  const includeKeyword = String(inputs.includeKeyword || "no") === "yes";

  const lengthGuide = length === "short"
    ? "single-word names only (1 word, 4–12 characters)"
    : length === "invented"
    ? "invented/brandable words — made-up but pronounceable, 5–12 characters"
    : "two-word name combinations (2 words max)";

  const keywordRule = includeKeyword
    ? `Every name MUST contain the niche keyword or a direct variation of it.`
    : `Names may or may not contain the niche keyword — prioritise brandability.`;

  const styleGuide: Record<string, string> = {
    Professional: "authoritative, trustworthy, clean — e.g. FinanceClear, LegalPath",
    Creative: "imaginative, vibrant, energetic — e.g. PixelBloom, SparkVibe",
    Fun: "playful, upbeat, friendly — e.g. SnackBytes, BuzzMode",
    Minimalist: "simple, lowercase-aesthetic, elegant — e.g. muse, loom, drift",
    Brandable: "invented ownable words, no dictionary meaning — e.g. Tubora, Streamiq",
    Techy: "tech-forward, coding/AI feel — e.g. ByteForge, CodeStack",
    Educational: "informative, clear, trusted — e.g. LearnLoop, KnowledgeCore",
  };

  const prompt = `You are a YouTube branding expert. Generate 30 unique YouTube channel names for the niche provided.
Name style: ${style} (${styleGuide[style] || style})
Name length: ${lengthGuide}
${keywordRule}

Return names in EXACTLY this format — three sections with section markers, each name on its own line, no numbers, no explanations:

[BRANDABLE]
Name1
Name2
Name3
Name4
Name5
Name6
Name7
Name8
Name9
Name10

[KEYWORD]
Name1
Name2
Name3
Name4
Name5
Name6
Name7
Name8
Name9
Name10

[CREATIVE]
Name1
Name2
Name3
Name4
Name5
Name6
Name7
Name8
Name9
Name10

BRANDABLE = invented words that are ownable and unique.
KEYWORD = niche keyword + branding word combinations.
CREATIVE = evocative combinations that strongly imply the niche without being literal.
Every name must be unique, pronounceable, and suitable as a YouTube channel name.`;

  const lines = await aiGenerate(prompt, `Channel niche: "${niche}"\n\nGenerate 30 unique YouTube channel names in the required format.`);
  return [lines.join("\n")];
}

async function generateYouTubeHashtags(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "");
  const niche = String(inputs.niche || "");
  const keywords = String(inputs.keywords || "");
  const quantity = Number(inputs.quantity || 20);
  return aiGenerate(
    `You are a YouTube SEO expert. Generate high-performing YouTube hashtags.
Return ONLY a list of hashtags (with # symbol), one per line, no extra text.
Mix trending general hashtags with niche-specific ones for maximum reach and discoverability.`,
    `Video topic: "${topic}"${niche ? `\nNiche: ${niche}` : ""}${keywords ? `\nKeywords: ${keywords}` : ""}\n\nGenerate ${quantity} YouTube hashtags.`
  );
}

async function generateYouTubeVideoIdeas(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || inputs.topic || "content creation");
  const audience = String(inputs.audience || "");
  const contentType = String(inputs.contentType || "");
  return aiGenerate(
    `You are a creative YouTube content strategist. Generate fresh, engaging video ideas with high view potential.
Return ONLY a numbered list of 10 video ideas, one per line.
Each idea should include the video angle/hook. Make them specific, actionable, and audience-driven.`,
    `Creator niche: "${niche}"${audience ? `\nTarget audience: ${audience}` : ""}${contentType ? `\nContent type preference: ${contentType}` : ""}\n\nGenerate 10 unique YouTube video ideas.`
  );
}

async function generateYouTubeScript(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "");
  const audience = String(inputs.audience || "general audience");
  const length = String(inputs.length || "7");
  const tone = String(inputs.tone || "educational");
  const goal = String(inputs.goal || "educate");
  const keywords = String(inputs.keywords || "");
  const style = String(inputs.style || "tutorial");

  const lines = await aiGenerate(
    `You are a professional YouTube scriptwriter. Write a complete, engaging YouTube video script.
Structure: Hook (first 15 seconds), Intro, Main Content (with clear sections), Outro + CTA.
Use natural spoken language, include stage directions in [brackets], and add timestamps.
Be specific, entertaining, and optimised for watch time. Use the tone and style requested.`,
    `Topic: "${topic}"
Target audience: ${audience}
Video length: ~${length} minutes
Tone: ${tone}
Goal: ${goal}
Style: ${style}${keywords ? `\nKeywords to include: ${keywords}` : ""}

Write a complete YouTube video script.`
  );
  return [lines.join("\n")];
}

async function generateYouTubeKeywords(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "");
  const niche = String(inputs.niche || "");
  const audience = String(inputs.audience || "");
  const contentType = String(inputs.contentType || "tutorial");
  const goal = String(inputs.goal || "balanced");
  return aiGenerate(
    `You are a YouTube SEO keyword research expert. Generate high-value YouTube search keywords.
For each keyword, provide: the keyword phrase, estimated search intent (high/medium/low competition), and why it works.
Format each line as: [keyword] | [competition: low/medium/high] | [why it ranks]
Return ONLY the list, no intro or outro text.`,
    `Seed topic: "${topic}"${niche ? `\nNiche: ${niche}` : ""}${audience ? `\nAudience: ${audience}` : ""}
Content type: ${contentType}
Goal: ${goal}

Generate 15 YouTube keyword suggestions.`
  );
}

async function analyzeYouTubeSeoScore(inputs: ToolInput): Promise<string[]> {
  const title = String(inputs.title || "");
  const description = String(inputs.description || "");
  const tags = String(inputs.tags || "");
  const targetKeyword = String(inputs.targetKeyword || "");
  const secondaryKeywords = String(inputs.secondaryKeywords || "");

  const lines = await aiGenerate(
    `You are a YouTube SEO auditor. Analyse the provided video metadata and give a detailed SEO score report.
Score each element out of 100 and explain what's working and what needs improvement.
Format your response as:
OVERALL SCORE: [X/100]
TITLE SCORE: [X/100] — [brief analysis]
DESCRIPTION SCORE: [X/100] — [brief analysis]
TAGS SCORE: [X/100] — [brief analysis]
KEYWORD USAGE: [X/100] — [brief analysis]
TOP 3 IMPROVEMENTS:
1. [specific actionable fix]
2. [specific actionable fix]
3. [specific actionable fix]`,
    `Title: "${title}"
Description: "${description}"
Tags: "${tags}"
Target keyword: "${targetKeyword}"
Secondary keywords: "${secondaryKeywords}"

Analyse this video's SEO and provide a detailed score report.`
  );
  return [lines.join("\n")];
}

async function analyzeYouTubeTitle(inputs: ToolInput): Promise<string[]> {
  const title = String(inputs.title || "");
  const keyword = String(inputs.keyword || "");
  const niche = String(inputs.niche || "");
  const audience = String(inputs.audience || "");

  const lines = await aiGenerate(
    `You are a YouTube title optimisation expert. Analyse the given title and provide a detailed performance report.
Format your response exactly as:
OVERALL SCORE: [X/100]
CTR POTENTIAL: [X/100] — [explanation]
SEO STRENGTH: [X/100] — [explanation]
EMOTIONAL IMPACT: [X/100] — [explanation]
CHARACTER COUNT: [X chars] — [good/too long/too short]
STRENGTHS:
- [strength 1]
- [strength 2]
WEAKNESSES:
- [weakness 1]
- [weakness 2]
IMPROVED VERSIONS:
1. [better title]
2. [better title]
3. [better title]`,
    `Title to analyse: "${title}"${keyword ? `\nTarget keyword: "${keyword}"` : ""}${niche ? `\nNiche: ${niche}` : ""}${audience ? `\nTarget audience: ${audience}` : ""}

Analyse this YouTube title and provide a full performance report.`
  );
  return [lines.join("\n")];
}

// ─── TikTok Tools ─────────────────────────────────────────────────────────────

async function generateTikTokHashtags(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || inputs.niche || "");
  const niche = String(inputs.niche || "");
  const contentType = String(inputs.contentType || "tutorial");
  return aiGenerate(
    `You are a TikTok SEO and hashtag strategy expert. Generate a high-performing, tiered hashtag set for TikTok.
Return ONLY a list of 15 hashtags (with # symbol), one per line, no extra text, no numbering.
Mix: 4-5 niche-specific primary hashtags, 4-5 broader secondary hashtags, 3 trending format hashtags relevant to the content style, and 2-3 long-tail search-optimized hashtags.
Prioritize discoverability via both the For You Page algorithm and TikTok Search.`,
    `Video topic: "${topic}"\nCreator niche: "${niche || topic}"\nContent style: "${contentType}"\n\nGenerate 15 strategic TikTok hashtags.`
  );
}

async function generateTikTokUsernames(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || "");
  const name = String(inputs.name || "");
  const tone = String(inputs.tone || "fun");
  const keywords = String(inputs.keywords || "");
  return aiGenerate(
    `You are a social media branding expert specializing in TikTok creator identity. Generate creative, brandable TikTok usernames.
Return ONLY a list of 10 usernames (with @ symbol), one per line, no explanations, no numbering.
Usernames must be: short (under 20 characters), memorable, easy to spell, and relevant to the creator's niche.
Vary the styles: include personal brand names (e.g. @MiaFit), niche-based names (e.g. @FitLab), keyword twists, aesthetic names, bold names, and abstract single-word brands.
Tone style: ${tone}. Do NOT use underscores or numbers unless essential.`,
    `Creator niche: "${niche}"\nCreator name: "${name || "not specified"}"\nTone: "${tone}"\nKeywords to weave in: "${keywords || "none"}"\n\nGenerate 10 unique TikTok usernames.`
  );
}

async function generateTikTokBio(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || "content");
  const name = String(inputs.name || "Creator");
  return aiGenerate(
    `You are a social media copywriter. Write short, punchy TikTok bios (max 80 characters each).
Return ONLY 3 bio options, numbered 1-3, each on its own line.
Each bio should include emojis, convey personality, and have a clear call to action.`,
    `Creator name: "${name}"\nNiche: "${niche}"\n\nWrite 3 TikTok bio options.`
  );
}

async function generateTikTokHooks(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "");
  const niche = String(inputs.niche || "");
  const audience = String(inputs.audience || "");
  const tone = String(inputs.tone || "bold");
  const count = Number(inputs.count || 10);
  return aiGenerate(
    `You are a viral TikTok hook writer. Create scroll-stopping opening hooks for TikTok videos.
Return ONLY a numbered list of hooks, one per line, no extra commentary.
Hooks must grab attention in the first 2 seconds. Use bold statements, shocking facts, questions, or challenges.
Keep each hook under 15 words. Make them feel urgent and personal.`,
    `Topic: "${topic}"${niche ? `\nNiche: ${niche}` : ""}${audience ? `\nAudience: ${audience}` : ""}\nTone: ${tone}\n\nGenerate ${count} viral TikTok hooks.`
  );
}

async function generateTikTokCaptions(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "");
  const niche = String(inputs.niche || "");
  const goal = String(inputs.goal || "grow-followers");
  const tone = String(inputs.tone || "bold");
  const audience = String(inputs.audience || "");
  return aiGenerate(
    `You are a TikTok caption expert. Write engaging TikTok captions that drive comments, shares, and follows.
Return ONLY 3 caption options, numbered 1-3.
Each caption should have: a strong opening line, main body with value or story, a call to action, and 5-8 relevant hashtags.`,
    `Topic: "${topic}"${niche ? `\nNiche: ${niche}` : ""}${audience ? `\nAudience: ${audience}` : ""}
Goal: ${goal}
Tone: ${tone}

Write 3 TikTok captions.`
  );
}

async function generateTikTokScript(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "");
  const niche = String(inputs.niche || "");
  const audience = String(inputs.audience || "general audience");
  const duration = String(inputs.duration || inputs.length || "60");
  const tone = String(inputs.tone || "engaging");

  const lines = await aiGenerate(
    `You are a professional TikTok scriptwriter. Write a complete, viral TikTok video script.
Structure: Hook (first 3 seconds), Problem/Intrigue setup, Main value/content, Twist or payoff, CTA.
Use short punchy sentences. Write exactly as it would be spoken on camera. Add [visual cue] directions.
Optimise for watch time - make every second count.`,
    `Topic: "${topic}"${niche ? `\nNiche: ${niche}` : ""}
Target audience: ${audience}
Video duration: ~${duration} seconds
Tone: ${tone}

Write a complete TikTok video script.`
  );
  return [lines.join("\n")];
}

async function generateTikTokViralIdeas(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || inputs.topic || "");
  const audience = String(inputs.audience || "");
  const trend = String(inputs.trend || "");
  return aiGenerate(
    `You are a TikTok viral content strategist. Generate high-potential TikTok video ideas that are likely to go viral.
Return ONLY a numbered list of 10 ideas, one per line.
Each idea should include the format (e.g., POV, Storytime, Tutorial, Trend), the hook, and why it will go viral.`,
    `Niche: "${niche}"${audience ? `\nTarget audience: ${audience}` : ""}${trend ? `\nTrend to leverage: ${trend}` : ""}\n\nGenerate 10 viral TikTok video ideas.`
  );
}

// ─── Instagram Tools ───────────────────────────────────────────────────────────

async function generateInstagramHashtags(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || inputs.niche || "");
  return aiGenerate(
    `You are an Instagram growth expert. Generate a strategic mix of Instagram hashtags.
Return ONLY a list of 30 hashtags (with # symbol), one per line, no extra text.
Include a mix of: 5 mega hashtags (1M+ posts), 10 large (100K-1M), 10 medium (10K-100K), 5 niche (under 10K).`,
    `Post topic/niche: "${topic}"\n\nGenerate 30 Instagram hashtags.`
  );
}

async function generateInstagramBio(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || "lifestyle");
  const name = String(inputs.name || "Creator");
  return aiGenerate(
    `You are an Instagram branding expert. Write compelling Instagram bios (max 150 characters each).
Return ONLY 3 bio options, numbered 1-3, each on its own line.
Use emojis, line breaks for readability, include a value proposition and call to action.`,
    `Name: "${name}"\nNiche: "${niche}"\n\nWrite 3 Instagram bio options.`
  );
}

async function generateInstagramCaptions(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "this moment");
  const mood = String(inputs.mood || "positive");
  return aiGenerate(
    `You are an Instagram copywriter. Write engaging Instagram captions that drive comments and saves.
Return ONLY 3 caption options, numbered 1-3.
Each caption should have: a strong opening line, body with value/story, call to action, and relevant hashtags.`,
    `Post topic: "${topic}"\nMood/tone: "${mood}"\n\nWrite 3 Instagram captions.`
  );
}

async function generateInstagramUsernames(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || inputs.name || "");
  return aiGenerate(
    `You are a social media branding expert. Generate creative, catchy Instagram usernames.
Return ONLY a numbered list of 10 usernames (with @ symbol), one per line, no explanations.
Usernames should be short (under 20 chars), memorable, spell-able, and relevant to the creator's niche.`,
    `Creator niche/name: "${niche}"\n\nGenerate 10 unique Instagram usernames.`
  );
}

async function generateInstagramHooks(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "");
  const niche = String(inputs.niche || "");
  const audience = String(inputs.audience || "");
  return aiGenerate(
    `You are an Instagram Reels and caption hook expert. Create scroll-stopping opening lines.
Return ONLY a numbered list of 10 hooks, one per line.
Hooks should stop the scroll in the first 2 seconds. Use bold claims, relatable statements, or surprising facts.
Each hook must be under 10 words and create immediate curiosity or emotion.`,
    `Topic: "${topic}"${niche ? `\nNiche: ${niche}` : ""}${audience ? `\nAudience: ${audience}` : ""}\n\nGenerate 10 Instagram hooks.`
  );
}

async function generateInstagramContentPlan(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || "lifestyle");
  const audience = String(inputs.audience || "");
  const pillars = String(inputs.pillars || "education,entertainment,personal,tips");
  const freq = String(inputs.freq || "5");
  const goal = String(inputs.goal || "growth");
  const style = String(inputs.style || "mixed");

  const lines = await aiGenerate(
    `You are an Instagram content strategist. Create a detailed 1-week Instagram content plan.
For each post include: Day, Content type (Reel/Carousel/Story/Static), Topic, Hook, Caption idea, Hashtag strategy, Best posting time.
Make the plan realistic, varied, and aligned with the creator's goal and niche.
Format each day clearly with all the details.`,
    `Niche: "${niche}"${audience ? `\nTarget audience: ${audience}` : ""}
Content pillars: ${pillars}
Posts per week: ${freq}
Main goal: ${goal}
Content style: ${style}

Create a 7-day Instagram content plan.`
  );
  return [lines.join("\n")];
}

async function generateInstagramReelIdeas(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || "");
  const audience = String(inputs.audience || "");
  const goal = String(inputs.goal || "growth");
  const tone = String(inputs.tone || "relatable");
  return aiGenerate(
    `You are an Instagram Reels content strategist. Generate high-potential Reel ideas that drive reach and followers.
Return ONLY a numbered list of 10 Reel ideas, one per line.
Each idea should include: the Reel format (tutorial/POV/trend/storytime etc), the hook, and the value it delivers to viewers.`,
    `Niche: "${niche}"${audience ? `\nTarget audience: ${audience}` : ""}
Goal: ${goal}
Tone: ${tone}

Generate 10 Instagram Reel ideas.`
  );
}

// ─── AI Tools ─────────────────────────────────────────────────────────────────

async function generateAIPrompts(inputs: ToolInput): Promise<string[]> {
  const contentType = String(inputs.contentType || "youtube-script");
  const niche = String(inputs.niche || "");
  const audience = String(inputs.audience || "");
  const goal = String(inputs.goal || "engagement");
  const tone = String(inputs.tone || "casual");
  const platform = String(inputs.platform || "chatgpt");
  const wordCount = String(inputs.wordCount || "");
  return aiGenerate(
    `You are a prompt engineering expert for content creators. Create highly effective AI prompts that produce excellent results.
Return ONLY a numbered list of 5 prompts, one per line.
Each prompt should be detailed, include role context, format instructions, specific constraints, and be ready to paste into an AI tool.`,
    `Content type: ${contentType}${niche ? `\nNiche: ${niche}` : ""}${audience ? `\nTarget audience: ${audience}` : ""}
Goal: ${goal}
Tone: ${tone}
Platform: ${platform}${wordCount ? `\nWord count: ${wordCount}` : ""}

Generate 5 high-quality AI prompts for this use case.`
  );
}

async function generateMidjourneyPrompts(inputs: ToolInput): Promise<string[]> {
  const visualType = String(inputs.visualType || "youtube-thumbnail");
  const subject = String(inputs.subject || "");
  const style = String(inputs.style || "photorealistic");
  const mood = String(inputs.mood || "dramatic");
  const lighting = String(inputs.lighting || "cinematic");
  const perspective = String(inputs.perspective || "");
  const colorPalette = String(inputs.colorPalette || "");
  return aiGenerate(
    `You are a Midjourney prompt expert for content creators. Generate detailed, effective Midjourney image generation prompts.
Return ONLY a numbered list of 5 prompts, one per line.
Each prompt should be a complete Midjourney-ready prompt including: subject description, style, lighting, mood, camera angle, and parameters like --ar 16:9 --v 6.
Make them specific and highly detailed for best image quality.`,
    `Visual type: ${visualType}
Subject: "${subject}"
Art style: ${style}
Mood: ${mood}
Lighting: ${lighting}${perspective ? `\nPerspective: ${perspective}` : ""}${colorPalette ? `\nColor palette: ${colorPalette}` : ""}

Generate 5 Midjourney prompts.`
  );
}

// ─── Utility Tools (deterministic) ────────────────────────────────────────────

function countWords(inputs: ToolInput): string[] {
  const text = String(inputs.text || "");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\n+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return [
    `📝 Words: ${words}`,
    `🔤 Characters (with spaces): ${chars}`,
    `🔡 Characters (without spaces): ${charsNoSpaces}`,
    `💬 Sentences: ${sentences}`,
    `📄 Paragraphs: ${paragraphs || 1}`,
    `⏱️ Reading time: ~${readingTime} min`,
  ];
}

function convertCase(inputs: ToolInput): string[] {
  const text = String(inputs.text || "");
  const type = String(inputs.caseType || "title");
  let result = "";
  switch (type) {
    case "upper": result = text.toUpperCase(); break;
    case "lower": result = text.toLowerCase(); break;
    case "title": result = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()); break;
    case "sentence": result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); break;
    case "camel": result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()); break;
    case "snake": result = text.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""); break;
    case "kebab": result = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); break;
    default: result = text;
  }
  return [result];
}

function generateSlug(inputs: ToolInput): string[] {
  const text = String(inputs.text || inputs.title || "");
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return [slug];
}

function removeLineBreaks(inputs: ToolInput): string[] {
  const text = String(inputs.text || "");
  const mode = String(inputs.mode || "single");
  let result = "";
  if (mode === "all") {
    result = text.replace(/\n+/g, " ").trim();
  } else {
    result = text.replace(/\n{2,}/g, "\n").trim();
  }
  return [result];
}

function sortText(inputs: ToolInput): string[] {
  const text = String(inputs.text || "");
  const order = String(inputs.order || "asc");
  const removeDups = inputs.removeDuplicates === "true" || inputs.removeDuplicates === true;
  let lines = text.split("\n").filter(Boolean);
  if (removeDups) lines = [...new Set(lines)];
  lines.sort((a, b) => order === "desc" ? b.localeCompare(a) : a.localeCompare(b));
  return [lines.join("\n")];
}

function calculateYouTubeMoney(inputs: ToolInput): string[] {
  const views = Number(inputs.views || inputs.monthlyViews || 100000);
  const cpm = Number(inputs.cpm || 4);
  const rpm = cpm * 0.55;
  const monthly = (views / 1000) * rpm;
  const yearly = monthly * 12;
  return [
    `💰 Estimated Monthly Revenue: $${monthly.toFixed(2)}`,
    `📅 Estimated Yearly Revenue: $${yearly.toFixed(2)}`,
    `📊 RPM (Revenue Per Mille): $${rpm.toFixed(2)}`,
    `👁️ Views: ${views.toLocaleString()}`,
    `📈 CPM Used: $${cpm.toFixed(2)}`,
    `⚠️ Note: Actual earnings vary by niche, audience location, and monetization status.`,
  ];
}

function calculateTikTokMoney(inputs: ToolInput): string[] {
  const followers = Number(inputs.followers || 100000);
  const views = Number(inputs.avgViews || followers * 0.1);
  const tikTokFund = views * 0.02 / 1000;
  const sponsorRate = followers / 1000 * 0.01;
  return [
    `💰 TikTok Creator Fund (estimated): $${tikTokFund.toFixed(2)}/month`,
    `🤝 Sponsored post rate: $${sponsorRate.toFixed(0)}-$${(sponsorRate * 3).toFixed(0)} per post`,
    `👥 Followers: ${followers.toLocaleString()}`,
    `👁️ Avg Views: ${views.toLocaleString()}`,
    `⚠️ Note: Earnings vary by region, engagement rate, and niche.`,
  ];
}

function downloadThumbnail(inputs: ToolInput): string[] {
  const url = String(inputs.url || inputs.youtubeUrl || "");
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
  if (!videoId) return ["❌ Could not extract YouTube video ID from URL. Please enter a valid YouTube URL."];
  return [
    `✅ Thumbnail URLs for video ID: ${videoId}`,
    `🖼️ Max Quality (1280x720): https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `🖼️ High Quality (480x360): https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `🖼️ Medium Quality (320x180): https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `🖼️ Standard (480x360): https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `🖼️ Default (120x90): https://img.youtube.com/vi/${videoId}/default.jpg`,
    `💡 Right-click on any URL above and choose "Save link as" to download the thumbnail.`,
  ];
}

// ─── Router ───────────────────────────────────────────────────────────────────

export async function executeTool(slug: string, inputs: ToolInput): Promise<ToolOutput> {
  let outputs: string[] = [];

  switch (slug) {
    // YouTube — generative
    case "youtube-title-generator":        outputs = await generateYouTubeTitles(inputs); break;
    case "youtube-tag-generator":          outputs = await generateYouTubeTags(inputs); break;
    case "youtube-description-generator":  outputs = await generateYouTubeDescription(inputs); break;
    case "youtube-channel-name-generator": outputs = await generateChannelNames(inputs); break;
    case "youtube-hashtag-generator":      outputs = await generateYouTubeHashtags(inputs); break;
    case "youtube-video-idea-generator":   outputs = await generateYouTubeVideoIdeas(inputs); break;
    case "youtube-script-generator":       outputs = await generateYouTubeScript(inputs); break;
    case "youtube-keyword-generator":      outputs = await generateYouTubeKeywords(inputs); break;
    case "youtube-seo-score-checker":      outputs = await analyzeYouTubeSeoScore(inputs); break;
    case "youtube-title-analyzer":         outputs = await analyzeYouTubeTitle(inputs); break;
    // YouTube — calculators / utilities
    case "youtube-money-calculator":       outputs = calculateYouTubeMoney(inputs); break;
    case "youtube-thumbnail-downloader":   outputs = downloadThumbnail(inputs); break;
    // TikTok — generative
    case "tiktok-hashtag-generator":       outputs = await generateTikTokHashtags(inputs); break;
    case "tiktok-username-generator":      outputs = await generateTikTokUsernames(inputs); break;
    case "tiktok-bio-generator":           outputs = await generateTikTokBio(inputs); break;
    case "tiktok-hook-generator":          outputs = await generateTikTokHooks(inputs); break;
    case "tiktok-caption-generator":       outputs = await generateTikTokCaptions(inputs); break;
    case "tiktok-script-generator":        outputs = await generateTikTokScript(inputs); break;
    case "tiktok-viral-idea-generator":    outputs = await generateTikTokViralIdeas(inputs); break;
    // TikTok — calculators
    case "tiktok-money-calculator":        outputs = calculateTikTokMoney(inputs); break;
    // Instagram — generative
    case "instagram-hashtag-generator":    outputs = await generateInstagramHashtags(inputs); break;
    case "instagram-bio-generator":        outputs = await generateInstagramBio(inputs); break;
    case "instagram-caption-generator":    outputs = await generateInstagramCaptions(inputs); break;
    case "instagram-username-generator":   outputs = await generateInstagramUsernames(inputs); break;
    case "instagram-hook-generator":       outputs = await generateInstagramHooks(inputs); break;
    case "instagram-content-planner":      outputs = await generateInstagramContentPlan(inputs); break;
    case "instagram-reel-idea-generator":  outputs = await generateInstagramReelIdeas(inputs); break;
    // AI tools
    case "ai-prompt-generator":
    case "prompt-generator":               outputs = await generateAIPrompts(inputs); break;
    case "midjourney-prompt-generator":    outputs = await generateMidjourneyPrompts(inputs); break;
    // Utility tools
    case "word-counter":                   outputs = countWords(inputs); break;
    case "case-converter":                 outputs = convertCase(inputs); break;
    case "slug-generator":                 outputs = generateSlug(inputs); break;
    case "remove-line-breaks":             outputs = removeLineBreaks(inputs); break;
    case "text-sorter":                    outputs = sortText(inputs); break;
    default:
      outputs = [`Tool "${slug}" executed successfully.`];
  }

  return { result: { outputs }, outputs, success: true };
}
