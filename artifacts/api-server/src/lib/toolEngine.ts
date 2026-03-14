export interface ToolInput {
  [key: string]: string | number | boolean;
}

export interface ToolOutput {
  result: Record<string, unknown>;
  outputs: string[];
  success: boolean;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateYouTubeTitles(inputs: ToolInput): string[] {
  const topic = String(inputs.topic || inputs.keyword || "your content");
  const style = String(inputs.style || "engaging");
  const titles = [
    `${topic} - The Complete Guide (${new Date().getFullYear()})`,
    `I Tried ${topic} For 30 Days - Here's What Happened`,
    `The Truth About ${topic} Nobody Tells You`,
    `${topic}: Everything You Need to Know`,
    `How I Mastered ${topic} in 7 Days`,
    `${topic} Tips That Will Change Your Life`,
    `Why ${topic} Is The Best Thing You Can Do`,
    `The Ultimate ${topic} Tutorial For Beginners`,
    `${topic} Secrets The Pros Don't Share`,
    `Stop Making These ${topic} Mistakes`,
  ];
  return titles;
}

function generateYouTubeTags(inputs: ToolInput): string[] {
  const topic = String(inputs.topic || inputs.keyword || "content");
  const words = topic.split(" ");
  const tags = [
    topic,
    `${topic} tutorial`,
    `how to ${topic}`,
    `${topic} tips`,
    `${topic} guide`,
    `${topic} ${new Date().getFullYear()}`,
    `best ${topic}`,
    `${topic} for beginners`,
    words[0] || topic,
    `${topic} strategy`,
  ];
  return tags;
}

function generateYouTubeDescription(inputs: ToolInput): string[] {
  const topic = String(inputs.topic || "this video");
  const channel = String(inputs.channelName || "our channel");
  const desc = `🎯 In this video, we're diving deep into ${topic}.

📌 What you'll learn:
• Everything you need to know about ${topic}
• Pro tips and strategies that actually work
• Common mistakes to avoid
• Step-by-step actionable advice

⏱️ Timestamps:
0:00 - Introduction
1:30 - Getting Started
5:00 - Main Content
12:00 - Pro Tips
18:00 - Q&A
20:00 - Conclusion

👋 Welcome to ${channel}! If you're new here, make sure to subscribe for weekly content on this topic.

🔔 Subscribe: https://youtube.com/@yourchannel
📸 Instagram: https://instagram.com/yourchannel
🐦 Twitter: https://twitter.com/yourchannel

#${topic.replace(/\s+/g, "")} #Tutorial #HowTo

📧 Business inquiries: business@yourchannel.com`;
  return [desc];
}

function generateChannelNames(inputs: ToolInput): string[] {
  const niche = String(inputs.niche || inputs.topic || "content");
  const words = niche.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const word = words[0] || "Create";
  return [
    `${word}WithMe`,
    `The${word}Hub`,
    `${word}Academy`,
    `${word}Mastery`,
    `${word}Life`,
    `${word}Universe`,
    `Quick${word}`,
    `${word}Pro`,
    `Daily${word}`,
    `${word}Decoded`,
  ];
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

function generateTikTokHashtags(inputs: ToolInput): string[] {
  const topic = String(inputs.topic || inputs.niche || "trending");
  const word = topic.replace(/\s+/g, "").toLowerCase();
  return [
    `#${word}`,
    `#${word}tok`,
    `#fyp`,
    `#foryou`,
    `#foryoupage`,
    `#viral`,
    `#trending`,
    `#${word}tips`,
    `#${word}tutorial`,
    `#explore`,
    `#tiktok`,
    `#${word}life`,
  ];
}

function generateTikTokUsernames(inputs: ToolInput): string[] {
  const niche = String(inputs.niche || inputs.name || "creator");
  const clean = niche.replace(/\s+/g, "").toLowerCase();
  return [
    `@${clean}_official`,
    `@the${clean}`,
    `@${clean}daily`,
    `@${clean}vibes`,
    `@real${clean}`,
    `@${clean}world`,
    `@${clean}hub`,
    `@just${clean}`,
    `@${clean}life`,
    `@${clean}pro`,
  ];
}

function generateTikTokBio(inputs: ToolInput): string[] {
  const niche = String(inputs.niche || "content");
  const name = String(inputs.name || "Creator");
  const emoji = inputs.emoji || "🔥";
  return [
    `${emoji} ${name} | ${niche} Creator\n📱 New videos daily\n💬 DM for collabs\n👇 Check my latest video`,
    `✨ Sharing ${niche} tips & tricks\n🎯 Follow for daily inspiration\n📩 Business: email@domain.com`,
    `🚀 ${niche.charAt(0).toUpperCase() + niche.slice(1)} enthusiast\n💡 Teaching you what I know\n📲 New content every day`,
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

function generateInstagramHashtags(inputs: ToolInput): string[] {
  const topic = String(inputs.topic || inputs.niche || "lifestyle");
  const word = topic.replace(/\s+/g, "").toLowerCase();
  return [
    `#${word}`,
    `#${word}gram`,
    `#${word}life`,
    `#${word}photography`,
    `#${word}community`,
    `#${word}inspo`,
    `#${word}daily`,
    `#${word}vibes`,
    `#best${word}`,
    `#${word}lovers`,
    `#instagram${word}`,
    `#${word}blog`,
    `#${word}goals`,
    `#${word}tips`,
    `#love${word}`,
    `#explore`,
    `#explorepage`,
    `#instadaily`,
    `#photooftheday`,
    `#instagood`,
    `#follow`,
    `#like4like`,
    `#picoftheday`,
    `#photography`,
    `#instagram`,
    `#followme`,
    `#viral`,
    `#trending`,
    `#reels`,
    `#reelsinstagram`,
  ];
}

function generateInstagramBio(inputs: ToolInput): string[] {
  const niche = String(inputs.niche || "lifestyle");
  const name = String(inputs.name || "Creator");
  return [
    `✨ ${name}\n📍 Content Creator | ${niche.charAt(0).toUpperCase() + niche.slice(1)}\n💫 Sharing my journey\n👇 Link below`,
    `🌟 ${niche.charAt(0).toUpperCase() + niche.slice(1)} Enthusiast\n📸 New posts every week\n💌 DM for collabs`,
    `🔥 ${name} | ${niche} tips & inspiration\n📲 Follow for daily content\n🔗 Shop my favorites ↓`,
  ];
}

function generateInstagramCaptions(inputs: ToolInput): string[] {
  const topic = String(inputs.topic || "this moment");
  const mood = String(inputs.mood || "positive");
  return [
    `✨ ${topic} is everything right now! Drop a 🔥 if you agree!\n\n#${topic.replace(/\s+/g, "")} #${mood} #explore #viral`,
    `Embracing every moment of ${topic} 💫 Life is too short not to enjoy the journey!\n\n#${topic.replace(/\s+/g, "")} #lifestyle #inspo`,
    `Can we talk about how amazing ${topic} is? 👇 Tell me your thoughts!\n\n#${topic.replace(/\s+/g, "")} #community #reels`,
  ];
}

function generateAITitle(inputs: ToolInput): string[] {
  const topic = String(inputs.topic || inputs.keyword || "your content");
  return [
    `The Future of ${topic}: What You Need to Know`,
    `${topic} Mastery: From Beginner to Pro`,
    `Why ${topic} Will Transform Your Life`,
    `The Science Behind ${topic}`,
    `${topic}: A Complete Step-by-Step Guide`,
    `How to Dominate ${topic} in ${new Date().getFullYear()}`,
    `The Hidden Truth About ${topic}`,
    `${topic} Hacks That Actually Work`,
    `What I Learned After 1 Year of ${topic}`,
    `The ${topic} Blueprint: Steal My Strategy`,
  ];
}

function generateHooks(inputs: ToolInput): string[] {
  const topic = String(inputs.topic || "this topic");
  return [
    `"Wait until you see what happens when you try ${topic}..."`,
    `"Nobody is talking about this ${topic} secret..."`,
    `"I made $10,000 with ${topic} — here's how"`,
    `"Stop scrolling — this ${topic} tip will change everything"`,
    `"The ${topic} mistake everyone makes (and how to fix it)"`,
    `"If you do ONE thing today, make it this ${topic} tip"`,
    `"The viral ${topic} formula that's taken over the internet"`,
    `"I tested every ${topic} strategy so you don't have to"`,
    `"This ${topic} hack has 50M views for a reason"`,
    `"You've been doing ${topic} wrong your whole life"`,
  ];
}

function generateVideoIdeas(inputs: ToolInput): string[] {
  const niche = String(inputs.niche || inputs.topic || "content creation");
  return [
    `"Day in the life of a ${niche} creator"`,
    `"I tried ${niche} for 30 days — honest review"`,
    `"${niche} starter guide for complete beginners"`,
    `"Top 10 ${niche} tools that changed my workflow"`,
    `"The biggest ${niche} mistakes beginners make"`,
    `"How I earn money with ${niche} content"`,
    `"${niche} trends that are dominating in ${new Date().getFullYear()}"`,
    `"Answering your ${niche} questions (FAQ)"`,
    `"${niche} challenge: 7-day transformation"`,
    `"Behind the scenes: my ${niche} setup tour"`,
  ];
}

function generatePrompts(inputs: ToolInput): string[] {
  const task = String(inputs.task || inputs.topic || "creative writing");
  const style = String(inputs.style || "professional");
  return [
    `Act as an expert in ${task}. Provide a comprehensive, ${style} analysis with actionable insights. Include examples and step-by-step guidance.`,
    `You are a world-class ${task} specialist. Create a detailed guide for beginners that covers fundamentals, common pitfalls, and advanced techniques.`,
    `Generate a ${style} ${task} strategy for someone starting from scratch. Include a 30-day action plan with daily milestones.`,
    `Write a compelling ${task} narrative that explains complex concepts in simple terms. Use metaphors, examples, and a conversational tone.`,
    `As a ${task} consultant, audit the following situation and provide specific recommendations, prioritized by impact and effort required.`,
  ];
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

export function executeTool(slug: string, inputs: ToolInput): ToolOutput {
  let outputs: string[] = [];

  switch (slug) {
    case "youtube-title-generator": outputs = generateYouTubeTitles(inputs); break;
    case "youtube-tag-generator": outputs = generateYouTubeTags(inputs); break;
    case "youtube-description-generator": outputs = generateYouTubeDescription(inputs); break;
    case "youtube-channel-name-generator": outputs = generateChannelNames(inputs); break;
    case "youtube-money-calculator": outputs = calculateYouTubeMoney(inputs); break;
    case "youtube-thumbnail-downloader": outputs = downloadThumbnail(inputs); break;
    case "tiktok-hashtag-generator": outputs = generateTikTokHashtags(inputs); break;
    case "tiktok-username-generator": outputs = generateTikTokUsernames(inputs); break;
    case "tiktok-bio-generator": outputs = generateTikTokBio(inputs); break;
    case "tiktok-money-calculator": outputs = calculateTikTokMoney(inputs); break;
    case "instagram-hashtag-generator": outputs = generateInstagramHashtags(inputs); break;
    case "instagram-bio-generator": outputs = generateInstagramBio(inputs); break;
    case "instagram-caption-generator": outputs = generateInstagramCaptions(inputs); break;
    case "ai-title-generator": outputs = generateAITitle(inputs); break;
    case "hook-generator": outputs = generateHooks(inputs); break;
    case "video-idea-generator": outputs = generateVideoIdeas(inputs); break;
    case "prompt-generator": outputs = generatePrompts(inputs); break;
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
