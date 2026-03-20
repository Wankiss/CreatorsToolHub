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
  { name: "TikTok Hashtag Generator", slug: "tiktok-hashtag-generator", categorySlug: "tiktok-tools", description: "Generate trending TikTok hashtags to boost your video visibility and reach more viewers on the For You Page. Get the most relevant hashtags for your content niche.", shortDescription: "Find viral TikTok hashtags to reach the For You Page", icon: "🎵" },
  { name: "TikTok Username Generator", slug: "tiktok-username-generator", categorySlug: "tiktok-tools", description: "Generate creative, unique TikTok usernames that reflect your personal brand and content niche. Find a memorable handle that sets you apart.", shortDescription: "Create a unique, memorable TikTok username for your brand", icon: "👤" },
  { name: "TikTok Bio Generator", slug: "tiktok-bio-generator", categorySlug: "tiktok-tools", description: "Create a compelling TikTok bio that tells visitors who you are, what you do, and why they should follow you. Maximize your profile conversion rate.", shortDescription: "Write an engaging TikTok profile bio that converts visitors to followers", icon: "✨" },
  { name: "TikTok Money Calculator", slug: "tiktok-money-calculator", categorySlug: "tiktok-tools", description: "Calculate your potential TikTok earnings from the Creator Fund, brand deals, and live gifts based on your followers and average views.", shortDescription: "Estimate your TikTok earnings from the Creator Fund and brand deals", icon: "💰" },
  { name: "Instagram Hashtag Generator", slug: "instagram-hashtag-generator", categorySlug: "instagram-tools", description: "Generate 30 high-performing Instagram hashtags for your posts to maximize reach, engagement, and follower growth. Mix of trending and niche-specific tags.", shortDescription: "Get 30 optimized Instagram hashtags to maximize your post reach", icon: "📸" },
  { name: "Instagram Bio Generator", slug: "instagram-bio-generator", categorySlug: "instagram-tools", description: "Create a professional Instagram bio that attracts followers and communicates your personal brand clearly. Optimized for the 150-character limit.", shortDescription: "Write a compelling Instagram bio within the 150-character limit", icon: "✨" },
  { name: "Instagram Caption Generator", slug: "instagram-caption-generator", categorySlug: "instagram-tools", description: "Generate engaging Instagram captions that boost likes, comments, and shares. Create captions that tell stories, ask questions, and include relevant hashtags.", shortDescription: "Write engaging Instagram captions that drive likes and comments", icon: "💬" },
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
