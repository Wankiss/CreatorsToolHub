import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { categoriesTable, toolsTable } from "./schema/index.js";
import { sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const categories = [
  { name: "YouTube Tools", slug: "youtube-tools", description: "Free YouTube tools to grow your channel, optimize your videos for SEO, and maximize your earnings.", icon: "▶️", color: "red", sortOrder: 1 },
  { name: "TikTok Tools", slug: "tiktok-tools", description: "Free TikTok tools to grow your following, find viral hashtags, and monetize your content.", icon: "🎵", color: "pink", sortOrder: 2 },
  { name: "Instagram Tools", slug: "instagram-tools", description: "Free Instagram tools to grow your followers, create better content, and increase engagement.", icon: "📸", color: "purple", sortOrder: 3 },
  { name: "AI Creator Tools", slug: "ai-creator-tools", description: "AI-powered tools to help content creators generate ideas, write scripts, and create better content faster.", icon: "🤖", color: "blue", sortOrder: 4 },
  { name: "Image Tools", slug: "image-tools", description: "Free image tools for content creators to resize, compress, and optimize images for social media.", icon: "🖼️", color: "green", sortOrder: 5 },
  { name: "Text Tools", slug: "text-tools", description: "Free text tools for content creators to clean up text, count words, and format content.", icon: "📝", color: "orange", sortOrder: 6 },
];

const tools = [
  { name: "YouTube Title Generator", slug: "youtube-title-generator", categorySlug: "youtube-tools", description: "Generate SEO-optimized YouTube video titles that attract clicks and rank higher in search results. Our AI-powered title generator creates compelling, keyword-rich titles tailored to your content niche.", shortDescription: "Create clickable, SEO-optimized YouTube video titles instantly", icon: "📺" },
  { name: "YouTube Tag Generator", slug: "youtube-tag-generator", categorySlug: "youtube-tools", description: "Generate the perfect YouTube tags to help your videos rank higher in search results. Get keyword-optimized tags that increase discoverability and reach the right audience.", shortDescription: "Get keyword-rich YouTube tags to boost your video discoverability", icon: "🏷️" },
  { name: "YouTube Description Generator", slug: "youtube-description-generator", categorySlug: "youtube-tools", description: "Create professional YouTube video descriptions with timestamps, relevant keywords, and calls-to-action that improve search rankings and viewer engagement.", shortDescription: "Write SEO-optimized YouTube descriptions with timestamps and keywords", icon: "📝" },
  { name: "YouTube Channel Name Generator", slug: "youtube-channel-name-generator", categorySlug: "youtube-tools", description: "Generate creative, memorable YouTube channel names for your niche. Get unique name ideas that are brandable, searchable, and available.", shortDescription: "Create unique, brandable YouTube channel name ideas for your niche", icon: "🎬" },
  { name: "YouTube Money Calculator", slug: "youtube-money-calculator", categorySlug: "youtube-tools", description: "Calculate how much money you can earn from YouTube based on your video views, niche, and audience demographics. Get realistic income estimates for your channel.", shortDescription: "Estimate your YouTube earnings based on views and niche CPM rates", icon: "💰" },
  { name: "YouTube Thumbnail Downloader", slug: "youtube-thumbnail-downloader", categorySlug: "youtube-tools", description: "Download YouTube video thumbnails in the highest quality available. Get HD thumbnail images from any YouTube video URL instantly and for free.", shortDescription: "Download HD thumbnails from any YouTube video instantly", icon: "🖼️" },
  { name: "YouTube Hashtag Generator", slug: "youtube-hashtag-generator", categorySlug: "youtube-tools", description: "Generate the best YouTube hashtags for your videos based on your topic and niche. Find trending hashtags that improve discoverability and help your content reach a wider audience on YouTube.", shortDescription: "Generate trending YouTube hashtags to boost your video reach and discoverability.", icon: "#️⃣" },
  { name: "YouTube Shorts Revenue Calculator", slug: "youtube-shorts-revenue-calculator", categorySlug: "youtube-tools", description: "Estimate your YouTube Shorts earnings based on views and engagement. Get realistic revenue projections for your short-form content and the YouTube Shorts monetization program.", shortDescription: "Estimate how much you can earn from YouTube Shorts views and monetization.", icon: "⚡" },
  { name: "YouTube Video Idea Generator", slug: "youtube-video-idea-generator", categorySlug: "youtube-tools", description: "Generate fresh, engaging YouTube video ideas based on your channel niche, audience, and trending topics. Never run out of content ideas with our AI-powered YouTube video idea generator.", shortDescription: "Generate viral YouTube video ideas tailored to your niche and target audience.", icon: "💡" },
  { name: "YouTube SEO Score Checker", slug: "youtube-seo-score-checker", categorySlug: "youtube-tools", description: "Analyze your YouTube video for SEO optimization and get a detailed score with actionable recommendations. Improve your title, description, tags, and thumbnails to rank higher in YouTube search results.", shortDescription: "Check your YouTube video SEO score and get tips to rank higher in search.", icon: "📈" },
  { name: "YouTube CPM Calculator", slug: "youtube-cpm-calculator", categorySlug: "youtube-tools", description: "Calculate your YouTube CPM (Cost Per Mille) and RPM to understand advertiser rates and maximize your ad earnings. See exactly what you earn per 1000 views based on your niche and location.", shortDescription: "Calculate your exact YouTube CPM rate and see what advertisers pay per 1000 views.", icon: "📊" },
  { name: "YouTube Title Analyzer", slug: "youtube-title-analyzer", categorySlug: "youtube-tools", description: "Score and analyze your YouTube video title for SEO effectiveness, click-through rate potential, keyword placement, and character length. Get actionable tips to improve your titles and rank higher.", shortDescription: "Analyze your YouTube title for SEO strength, CTR potential, and click-worthiness.", icon: "🔍" },
  { name: "YouTube Keyword Generator", slug: "youtube-keyword-generator", categorySlug: "youtube-tools", description: "Discover the best YouTube keywords for your videos with our free keyword generator. Find high-volume, low-competition keywords to improve your YouTube SEO and attract more organic views.", shortDescription: "Find high-traffic YouTube keywords to rank your videos higher in search results.", icon: "🔑" },
  { name: "YouTube Script Generator", slug: "youtube-script-generator", categorySlug: "youtube-tools", description: "Create compelling YouTube video scripts for any topic. Generate professional scripts with attention-grabbing hooks, structured body content, and strong calls-to-action that keep viewers watching.", shortDescription: "Generate engaging YouTube video scripts with hooks, body, and call-to-action sections.", icon: "📝" },
  { name: "YouTube Engagement Calculator", slug: "youtube-engagement-calculator", categorySlug: "youtube-tools", description: "Calculate your YouTube engagement rate from likes, comments, and shares relative to your views. Understand how your audience interacts with your content and benchmark against top creators in your niche.", shortDescription: "Calculate your YouTube channel engagement rate and see how you compare.", icon: "💬" },
  { name: "TikTok Viral Idea Generator", slug: "tiktok-viral-idea-generator", categorySlug: "tiktok-tools", description: "Generate trending TikTok video ideas tailored to your niche. Discover viral concepts, hooks, and content angles that the For You Page algorithm loves — so you never run out of content ideas again.", shortDescription: "Generate viral TikTok video ideas tailored to your niche and audience.", icon: "💡" },
  { name: "TikTok Hook Generator", slug: "tiktok-hook-generator", categorySlug: "tiktok-tools", description: "Create attention-grabbing TikTok hooks for the first 3 seconds of your video. Choose from proven hook formulas — question, bold statement, shock, story — to stop the scroll and keep viewers watching.", shortDescription: "Write scroll-stopping TikTok hooks that capture attention in the first 3 seconds.", icon: "🪝" },
  { name: "TikTok Script Generator", slug: "tiktok-script-generator", categorySlug: "tiktok-tools", description: "Generate complete TikTok video scripts with a viral hook, structured content body, and a strong call-to-action. Optimized for 15s, 30s, and 60s formats across any niche.", shortDescription: "Generate full TikTok video scripts with hook, body, and CTA for any niche.", icon: "📝" },
  { name: "TikTok Caption Generator", slug: "tiktok-caption-generator", categorySlug: "tiktok-tools", description: "Create engaging TikTok captions that drive comments, shares, and follows. Generate captions with the perfect mix of keywords, emojis, and calls-to-action to maximize your video's reach.", shortDescription: "Write engaging TikTok captions with keywords, emojis, and calls-to-action.", icon: "💬" },
  { name: "TikTok Hashtag Generator", slug: "tiktok-hashtag-generator", categorySlug: "tiktok-tools", description: "Generate trending TikTok hashtags to boost your video visibility and reach more viewers on the For You Page. Get the most relevant hashtags for your content niche.", shortDescription: "Find viral TikTok hashtags to reach the For You Page.", icon: "🏷️" },
  { name: "TikTok Money Calculator", slug: "tiktok-money-calculator", categorySlug: "tiktok-tools", description: "Calculate your potential TikTok earnings from the Creator Fund, brand deals, and live gifts based on your followers and average views. Estimate your monthly income as your account grows.", shortDescription: "Estimate your TikTok earnings from the Creator Fund and brand deals.", icon: "💰" },
  { name: "TikTok Bio Generator", slug: "tiktok-bio-generator", categorySlug: "tiktok-tools", description: "Create a compelling TikTok bio that tells visitors who you are, what you do, and why they should follow you. Maximize your profile conversion rate with a bio that works 24/7.", shortDescription: "Write an engaging TikTok profile bio that converts visitors to followers.", icon: "✨" },
  { name: "TikTok Username Generator", slug: "tiktok-username-generator", categorySlug: "tiktok-tools", description: "Generate creative, memorable, and brandable TikTok usernames that reflect your niche, feel modern, and stand out from the crowd. Get 20 username ideas across 6 naming styles — Personal Brand, Niche-Based, Keyword Twist, Aesthetic, Bold/Viral, and Abstract — each evaluated for memorability, spellability, and brand potential.", shortDescription: "Create unique, memorable TikTok usernames that build your brand identity.", icon: "🎭" },
  { name: "Instagram Hashtag Generator", slug: "instagram-hashtag-generator", categorySlug: "instagram-tools", description: "Generate 30 high-performing Instagram hashtags for your posts using a tiered broad, mid-range, and micro strategy. Maximize reach, discoverability, and engagement for every post without repeating the same overused tags.", shortDescription: "Get 30 optimized Instagram hashtags using a tiered reach strategy.", icon: "📸" },
  { name: "Instagram Caption Generator", slug: "instagram-caption-generator", categorySlug: "instagram-tools", description: "Generate engaging Instagram captions that drive comments, saves, and shares. Each caption opens with a scroll-stopping first line, delivers value in the body, and ends with a micro call-to-action designed to trigger algorithm-boosting engagement.", shortDescription: "Write scroll-stopping Instagram captions that drive comments and saves.", icon: "💬" },
  { name: "Instagram Bio Generator", slug: "instagram-bio-generator", categorySlug: "instagram-tools", description: "Create a compelling Instagram bio that converts profile visitors into followers. Generate 10 bio variations optimized for the 150-character limit across professional, bold, minimal, and inspirational tones — each designed to communicate your niche, value, and CTA instantly.", shortDescription: "Write a profile-converting Instagram bio within 150 characters.", icon: "✨" },
  { name: "Instagram Username Generator", slug: "instagram-username-generator", categorySlug: "instagram-tools", description: "Generate creative, memorable, and brandable Instagram usernames tailored to your niche, name, and content style. Get 20 username ideas across 6 naming styles — Personal Brand, Niche-Based, Keyword Twist, Aesthetic, Bold/Viral, and Abstract — each evaluated for memorability, spellability, and brand potential.", shortDescription: "Create unique, memorable Instagram usernames that build your brand.", icon: "🎭" },
  { name: "Instagram Reel Idea Generator", slug: "instagram-reel-idea-generator", categorySlug: "instagram-tools", description: "Generate viral Instagram Reel ideas tailored to your niche and content style. Each idea includes a content angle, hook suggestion, format recommendation, and target audience — so you always know exactly what to film next.", shortDescription: "Get viral Instagram Reel ideas with hooks and format recommendations.", icon: "🎬" },
  { name: "Instagram Hook Generator", slug: "instagram-hook-generator", categorySlug: "instagram-tools", description: "Create scroll-stopping Instagram Reel hooks for the first 1–3 seconds of your video. Choose from 10 proven hook formats — bold statement, curiosity gap, POV, question, relatable frustration, shocking stat, and more — to maximize your hook rate and Reels distribution.", shortDescription: "Write scroll-stopping Reel hooks that boost Instagram distribution.", icon: "🪝" },
  { name: "Instagram Story Idea Generator", slug: "instagram-story-idea-generator", categorySlug: "instagram-tools", description: "Generate engaging Instagram Story ideas that boost views, replies, and profile visits. Get concepts for polls, Q&As, behind-the-scenes, product teasers, countdowns, and interactive formats that deepen audience connection and drive DM conversations.", shortDescription: "Get Instagram Story ideas that drive views, replies, and profile visits.", icon: "📖" },
  { name: "Instagram Engagement Calculator", slug: "instagram-engagement-calculator", categorySlug: "instagram-tools", description: "Calculate your true Instagram engagement rate across likes, comments, and saves, then benchmark it against niche averages. Know exactly where you stand and understand what your engagement rate means for brand sponsorship potential.", shortDescription: "Calculate your Instagram engagement rate and benchmark it vs. niche averages.", icon: "📊" },
  { name: "Instagram Money Calculator", slug: "instagram-money-calculator", categorySlug: "instagram-tools", description: "Estimate your Instagram earning potential from brand sponsorships, affiliate commissions, Instagram Subscriptions, and product sales. Model your income across follower milestones from 5K to 500K and set realistic financial targets for your creator business.", shortDescription: "Calculate your Instagram earning potential from sponsorships and more.", icon: "💰" },
  { name: "Instagram Content Planner", slug: "instagram-content-planner", categorySlug: "instagram-tools", description: "Build a structured Instagram content calendar that balances Reels, carousels, static posts, and Stories across your content pillars. Generate a week-by-week plan with post type recommendations, topic suggestions, and timing guidance based on your niche and posting frequency.", shortDescription: "Plan your Instagram content calendar with a balanced posting strategy.", icon: "📅" },
  { name: "AI Title Generator", slug: "ai-title-generator", categorySlug: "ai-creator-tools", description: "Generate powerful, AI-crafted titles for YouTube videos, blog posts, podcast episodes, and social media content that maximize clicks and engagement.", shortDescription: "Create compelling titles for any content format using AI", icon: "🤖" },
  { name: "Hook Generator", slug: "hook-generator", categorySlug: "ai-creator-tools", description: "Generate attention-grabbing hooks for your videos, reels, and short-form content that stop the scroll and keep viewers watching until the end.", shortDescription: "Create scroll-stopping hooks for videos and short-form content", icon: "🎣" },
  { name: "Video Idea Generator", slug: "video-idea-generator", categorySlug: "ai-creator-tools", description: "Generate unique, trending video ideas for YouTube, TikTok, and Instagram Reels based on your niche. Never run out of content ideas again.", shortDescription: "Get unlimited video content ideas for your niche", icon: "💡" },
  { name: "Prompt Generator", slug: "prompt-generator", categorySlug: "ai-creator-tools", description: "Generate detailed, effective AI prompts for ChatGPT, Midjourney, DALL-E, and other AI tools. Get better results from every AI interaction.", shortDescription: "Create powerful AI prompts for ChatGPT, Midjourney, and more", icon: "⚡" },
  { name: "Word Counter", slug: "word-counter", categorySlug: "text-tools", description: "Count words, characters, sentences, paragraphs, and estimate reading time for any text. Essential tool for writers, SEO specialists, and content creators.", shortDescription: "Count words, characters and estimate reading time for any text", icon: "📊" },
  { name: "Case Converter", slug: "case-converter", categorySlug: "text-tools", description: "Convert text between different cases: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case instantly.", shortDescription: "Convert text between uppercase, lowercase, title case, camelCase and more", icon: "🔤" },
  { name: "Slug Generator", slug: "slug-generator", categorySlug: "text-tools", description: "Convert any text into a clean URL slug for blog posts, pages, and products. Removes special characters and creates SEO-friendly URLs automatically.", shortDescription: "Generate clean, SEO-friendly URL slugs from any text", icon: "🔗" },
  { name: "Remove Line Breaks", slug: "remove-line-breaks", categorySlug: "text-tools", description: "Remove unwanted line breaks and extra whitespace from text. Perfect for cleaning up text copied from PDFs, emails, or other documents.", shortDescription: "Clean up text by removing unwanted line breaks and extra whitespace", icon: "✂️" },
  { name: "Text Sorter", slug: "text-sorter", categorySlug: "text-tools", description: "Sort lines of text alphabetically, reverse alphabetically, or by length. Remove duplicate lines and clean up lists instantly.", shortDescription: "Sort lines alphabetically and remove duplicate entries from any list", icon: "📋" },
];

async function seed() {
  console.log("Seeding database...");

  // Upsert categories
  console.log("Inserting categories...");
  await db
    .insert(categoriesTable)
    .values(categories)
    .onConflictDoUpdate({
      target: categoriesTable.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        icon: sql`excluded.icon`,
        color: sql`excluded.color`,
        sortOrder: sql`excluded.sort_order`,
      },
    });

  // Fetch inserted categories to build slug→id map
  const insertedCategories = await db.select().from(categoriesTable);
  const categoryMap = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]));

  // Upsert tools
  console.log("Inserting tools...");
  const toolRows = tools.map(({ categorySlug, ...t }) => ({
    ...t,
    categoryId: categoryMap[categorySlug]!,
  }));

  await db
    .insert(toolsTable)
    .values(toolRows)
    .onConflictDoUpdate({
      target: toolsTable.slug,
      set: {
        name: sql`excluded.name`,
        categoryId: sql`excluded.category_id`,
        description: sql`excluded.description`,
        shortDescription: sql`excluded.short_description`,
        icon: sql`excluded.icon`,
        isActive: sql`excluded.is_active`,
      },
    });

  console.log(`Seeded ${categories.length} categories and ${tools.length} tools.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
