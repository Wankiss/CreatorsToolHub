import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
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
    model: "gpt-5-mini",
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

async function generateYouTubeTitles(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || inputs.keyword || "");
  const style = String(inputs.style || "engaging");
  return aiGenerate(
    `You are an expert YouTube SEO strategist. Generate compelling, click-worthy YouTube video titles. 
Return ONLY a numbered list of 10 titles, one per line, no extra commentary. 
Each title should be unique, under 70 characters, and optimized for clicks and search.`,
    `Topic: "${topic}"\nStyle: ${style}\n\nGenerate 10 YouTube video titles.`
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
  const channel = String(inputs.channelName || "my channel");
  const lines = await aiGenerate(
    `You are a YouTube content expert. Write a full, SEO-optimised YouTube video description.
Include: a compelling intro paragraph, bullet points of what viewers will learn, placeholder timestamps, 
social media links section, relevant hashtags at the end. Use emojis naturally. Be specific and engaging.
Return the entire description as one block of text.`,
    `Video topic: "${topic}"\nChannel name: "${channel}"\n\nWrite a complete YouTube description.`
  );
  return [lines.join("\n")];
}

async function generateChannelNames(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || inputs.topic || "");
  return aiGenerate(
    `You are a branding expert specialising in YouTube channels. Generate creative, memorable YouTube channel names.
Return ONLY a numbered list of 10 channel names, one per line, no explanations.
Names should be catchy, easy to remember, brandable, and relevant to the niche.`,
    `Channel niche: "${niche}"\n\nGenerate 10 creative YouTube channel names.`
  );
}

async function generateTikTokHashtags(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || inputs.niche || "");
  return aiGenerate(
    `You are a TikTok growth expert. Generate high-performing TikTok hashtags.
Return ONLY a list of 15 hashtags (with # symbol), one per line, no extra text.
Mix viral general hashtags with niche-specific ones for maximum reach.`,
    `Content topic/niche: "${topic}"\n\nGenerate 15 TikTok hashtags.`
  );
}

async function generateTikTokUsernames(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || inputs.name || "");
  return aiGenerate(
    `You are a social media branding expert. Generate creative, catchy TikTok usernames.
Return ONLY a numbered list of 10 usernames (with @ symbol), one per line, no explanations.
Usernames should be short, memorable, and relevant to the creator's niche.`,
    `Creator niche/name: "${niche}"\n\nGenerate 10 unique TikTok usernames.`
  );
}

async function generateTikTokBio(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || "content");
  const name = String(inputs.name || "Creator");
  return aiGenerate(
    `You are a social media copywriter. Write short, punchy TikTok bios (max 80 characters each).
Return ONLY 3 bio options separated by a blank line, no numbering or labels.
Each bio should include emojis, convey personality, and have a clear call to action.`,
    `Creator name: "${name}"\nNiche: "${niche}"\n\nWrite 3 TikTok bio options.`
  );
}

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
Return ONLY 3 bio options separated by a blank line, no numbering or labels.
Use emojis, line breaks for readability, include a value proposition and call to action.`,
    `Name: "${name}"\nNiche: "${niche}"\n\nWrite 3 Instagram bio options.`
  );
}

async function generateInstagramCaptions(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "this moment");
  const mood = String(inputs.mood || "positive");
  return aiGenerate(
    `You are an Instagram copywriter. Write engaging Instagram captions that drive comments and saves.
Return ONLY 3 caption options separated by a blank line, no numbering or labels.
Each caption should have: a strong opening line, body with value/story, call to action, and relevant hashtags.`,
    `Post topic: "${topic}"\nMood/tone: "${mood}"\n\nWrite 3 Instagram captions.`
  );
}

async function generateAITitle(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || inputs.keyword || "");
  return aiGenerate(
    `You are a viral content strategist. Generate attention-grabbing titles for blog posts, videos, and social content.
Return ONLY a numbered list of 10 titles, one per line, no extra commentary.
Use proven formulas: curiosity gaps, numbers, how-tos, contrarian takes, and emotional triggers.`,
    `Topic: "${topic}"\n\nGenerate 10 compelling content titles.`
  );
}

async function generateHooks(inputs: ToolInput): Promise<string[]> {
  const topic = String(inputs.topic || "this topic");
  return aiGenerate(
    `You are a viral content hook writer. Create scroll-stopping opening hooks for videos and posts.
Return ONLY a numbered list of 10 hooks, one per line, no extra commentary.
Hooks should create curiosity, urgency, or strong emotion. Avoid clichés. Be specific and surprising.`,
    `Topic: "${topic}"\n\nGenerate 10 viral content hooks.`
  );
}

async function generateVideoIdeas(inputs: ToolInput): Promise<string[]> {
  const niche = String(inputs.niche || inputs.topic || "content creation");
  return aiGenerate(
    `You are a creative content strategist for social media creators. Generate fresh, engaging video ideas.
Return ONLY a numbered list of 10 video ideas, one per line, no extra commentary.
Ideas should be specific, actionable, and have clear audience appeal. Include the video angle/hook.`,
    `Creator niche: "${niche}"\n\nGenerate 10 unique video ideas.`
  );
}

async function generatePrompts(inputs: ToolInput): Promise<string[]> {
  const task = String(inputs.task || inputs.topic || "creative writing");
  const style = String(inputs.style || "professional");
  return aiGenerate(
    `You are a prompt engineering expert. Create highly effective AI prompts that produce excellent results.
Return ONLY a numbered list of 5 prompts, one per line, no extra commentary.
Each prompt should be detailed, include role-playing, context, format instructions, and specific constraints.`,
    `Task/use case: "${task}"\nStyle: "${style}"\n\nGenerate 5 high-quality AI prompts.`
  );
}

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

export async function executeTool(slug: string, inputs: ToolInput): Promise<ToolOutput> {
  let outputs: string[] = [];

  switch (slug) {
    case "youtube-title-generator": outputs = await generateYouTubeTitles(inputs); break;
    case "youtube-tag-generator": outputs = await generateYouTubeTags(inputs); break;
    case "youtube-description-generator": outputs = await generateYouTubeDescription(inputs); break;
    case "youtube-channel-name-generator": outputs = await generateChannelNames(inputs); break;
    case "youtube-money-calculator": outputs = calculateYouTubeMoney(inputs); break;
    case "youtube-thumbnail-downloader": outputs = downloadThumbnail(inputs); break;
    case "tiktok-hashtag-generator": outputs = await generateTikTokHashtags(inputs); break;
    case "tiktok-username-generator": outputs = await generateTikTokUsernames(inputs); break;
    case "tiktok-bio-generator": outputs = await generateTikTokBio(inputs); break;
    case "tiktok-money-calculator": outputs = calculateTikTokMoney(inputs); break;
    case "instagram-hashtag-generator": outputs = await generateInstagramHashtags(inputs); break;
    case "instagram-bio-generator": outputs = await generateInstagramBio(inputs); break;
    case "instagram-caption-generator": outputs = await generateInstagramCaptions(inputs); break;
    case "ai-title-generator": outputs = await generateAITitle(inputs); break;
    case "hook-generator": outputs = await generateHooks(inputs); break;
    case "video-idea-generator": outputs = await generateVideoIdeas(inputs); break;
    case "prompt-generator": outputs = await generatePrompts(inputs); break;
    case "word-counter": outputs = countWords(inputs); break;
    case "case-converter": outputs = convertCase(inputs); break;
    case "slug-generator": outputs = generateSlug(inputs); break;
    case "remove-line-breaks": outputs = removeLineBreaks(inputs); break;
    case "text-sorter": outputs = sortText(inputs); break;
    default:
      outputs = [`Tool "${slug}" executed successfully. Results would appear here.`];
  }

  return { result: { outputs }, outputs, success: true };
}
