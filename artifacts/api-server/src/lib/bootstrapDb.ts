import { db, categoriesTable, toolsTable, blogPostsTable } from "@workspace/db";
import { sql, count } from "drizzle-orm";

const categories = [
  { name: "YouTube Tools", slug: "youtube-tools", description: "Free YouTube tools to grow your channel, optimize your videos for SEO, and maximize your earnings.", icon: "▶️", color: "red", sortOrder: 1 },
  { name: "TikTok Tools", slug: "tiktok-tools", description: "Free TikTok tools to grow your following, find viral hashtags, and monetize your content.", icon: "🎵", color: "pink", sortOrder: 2 },
  { name: "Instagram Tools", slug: "instagram-tools", description: "Free Instagram tools to grow your followers, create better content, and increase engagement.", icon: "📸", color: "purple", sortOrder: 3 },
  { name: "AI Creator Tools", slug: "ai-creator-tools", description: "AI-powered tools to help content creators generate ideas, write scripts, and create better content faster.", icon: "🤖", color: "blue", sortOrder: 4 },
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
  { name: "TikTok Username Generator", slug: "tiktok-username-generator", categorySlug: "tiktok-tools", description: "Generate creative, memorable, and brandable TikTok usernames that reflect your niche, feel modern, and stand out from the crowd.", shortDescription: "Create unique, memorable TikTok usernames that build your brand identity.", icon: "🎭" },
  { name: "Instagram Hashtag Generator", slug: "instagram-hashtag-generator", categorySlug: "instagram-tools", description: "Generate 30 high-performing Instagram hashtags for your posts using a tiered broad, mid-range, and micro strategy.", shortDescription: "Get 30 optimized Instagram hashtags using a tiered reach strategy.", icon: "📸" },
  { name: "Instagram Caption Generator", slug: "instagram-caption-generator", categorySlug: "instagram-tools", description: "Generate engaging Instagram captions that drive comments, saves, and shares.", shortDescription: "Write scroll-stopping Instagram captions that drive comments and saves.", icon: "💬" },
  { name: "Instagram Bio Generator", slug: "instagram-bio-generator", categorySlug: "instagram-tools", description: "Create a compelling Instagram bio that converts profile visitors into followers.", shortDescription: "Write a profile-converting Instagram bio within 150 characters.", icon: "✨" },
  { name: "Instagram Username Generator", slug: "instagram-username-generator", categorySlug: "instagram-tools", description: "Generate creative, memorable, and brandable Instagram usernames tailored to your niche, name, and content style.", shortDescription: "Create unique, memorable Instagram usernames that build your brand.", icon: "🎭" },
  { name: "Instagram Reel Idea Generator", slug: "instagram-reel-idea-generator", categorySlug: "instagram-tools", description: "Generate viral Instagram Reel ideas tailored to your niche and content style.", shortDescription: "Get viral Instagram Reel ideas with hooks and format recommendations.", icon: "🎬" },
  { name: "Instagram Hook Generator", slug: "instagram-hook-generator", categorySlug: "instagram-tools", description: "Create scroll-stopping Instagram Reel hooks for the first 1–3 seconds of your video.", shortDescription: "Write scroll-stopping Reel hooks that boost Instagram distribution.", icon: "🪝" },
  { name: "Instagram Engagement Calculator", slug: "instagram-engagement-calculator", categorySlug: "instagram-tools", description: "Calculate your true Instagram engagement rate across likes, comments, and saves.", shortDescription: "Calculate your Instagram engagement rate and benchmark it vs. niche averages.", icon: "📊" },
  { name: "Instagram Money Calculator", slug: "instagram-money-calculator", categorySlug: "instagram-tools", description: "Estimate your Instagram earning potential from brand sponsorships, affiliate commissions, and product sales.", shortDescription: "Calculate your Instagram earning potential from sponsorships and more.", icon: "💰" },
  { name: "Instagram Content Planner", slug: "instagram-content-planner", categorySlug: "instagram-tools", description: "Build a structured Instagram content calendar that balances Reels, carousels, static posts, and Stories across your content pillars.", shortDescription: "Plan your Instagram content calendar with a balanced posting strategy.", icon: "📅" },
  { name: "AI Prompt Generator", slug: "ai-prompt-generator", categorySlug: "ai-creator-tools", description: "Generate structured, role-based AI prompts for ChatGPT, Claude, and Gemini that produce professional-quality content on the first attempt.", shortDescription: "Create expert AI prompts for ChatGPT, Claude, and Gemini instantly.", icon: "⚡" },
  { name: "Midjourney Prompt Generator", slug: "midjourney-prompt-generator", categorySlug: "ai-creator-tools", description: "Generate optimized Midjourney prompts with the correct syntax, style descriptors, lighting terms, aspect ratios, and quality parameters.", shortDescription: "Generate optimized Midjourney prompts for stunning AI visuals.", icon: "🎨" },
];

function calcReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

const blogPosts = [
  {
    title: "What Are the Best Free Creator Tools for Beginners in 2026?",
    slug: "best-free-creator-tools-beginners-2026",
    excerpt: "Discover the best free creator tools for beginners in 2026. From YouTube scripts to TikTok hashtags — get everything you need to start creating without spending a dime.",
    tags: ["Creator Tips", "Free Tools", "Beginner Guide"],
    author: "Immanuels",
    metaTitle: "Best Free Creator Tools for Beginners in 2026 | CreatorsToolHub",
    metaDescription: "Discover the best free creator tools for beginners in 2026. YouTube, TikTok, Instagram & AI tools — all free at CreatorsToolHub. Start creating today.",
    content: `<h2>Why the Right Tools Make All the Difference</h2><p>Starting your creator journey feels overwhelming. The most successful creators rely on tools to speed up their workflow, optimize their content, and stay consistent.</p><p>At <strong>CreatorsToolHub</strong>, we've built 34+ free tools across YouTube, TikTok, Instagram, and AI content creation — all designed to help beginner and intermediate creators work smarter.</p>`,
  },
  {
    title: "How to Write a YouTube Script Fast Using a Free Script Generator",
    slug: "how-to-write-youtube-script-fast-free-script-generator",
    excerpt: "Learn how to write a YouTube script in minutes using a free script generator. Get the exact format top creators use — hook, body, CTA — without the writer's block.",
    tags: ["YouTube Growth", "Script Writing", "Free Tools"],
    author: "Immanuels",
    metaTitle: "How to Write a YouTube Script Fast | Free Script Generator",
    metaDescription: "Learn how to write a YouTube script fast using a free script generator. Hook, body, CTA format used by top creators. Try it free at CreatorsToolHub.",
    content: `<h2>Why Your Script Is the Most Important Part of Your Video</h2><p>The quality of your YouTube script directly determines how long viewers stay, whether they subscribe, and whether the algorithm pushes your video further.</p><p>Use our free <a href="/tools/youtube-script-generator">YouTube Script Generator</a> to create structured scripts instantly.</p>`,
  },
  {
    title: "How to Go Viral on YouTube as a Beginner in 2026",
    slug: "how-to-go-viral-on-youtube-beginner-2026",
    excerpt: "Going viral on YouTube as a beginner is possible in 2026 — if you know the right strategies. Learn exactly how to optimize your videos for the YouTube algorithm.",
    tags: ["YouTube Growth", "Viral Content", "Beginner Guide"],
    author: "Immanuels",
    metaTitle: "How to Go Viral on YouTube as a Beginner in 2026",
    metaDescription: "Learn how to go viral on YouTube as a beginner in 2026. Proven strategies for titles, thumbnails, hooks, and the YouTube algorithm. Start growing today.",
    content: `<h2>Going Viral on YouTube Is a System, Not Luck</h2><p>The creators who consistently go viral aren't lucky — they've mastered the YouTube algorithm and optimized every element of their videos.</p><p>Use our <a href="/tools/youtube-title-generator">YouTube Title Generator</a> to create compelling titles that drive clicks.</p>`,
  },
  {
    title: "How to Start a Faceless YouTube Channel: Complete Guide for 2026",
    slug: "how-to-start-faceless-youtube-channel-complete-guide-2026",
    excerpt: "Learn how to start a faceless YouTube channel in 2026 with this complete step-by-step guide. No camera, no face, no problem — just a proven system for building a profitable channel.",
    tags: ["YouTube Growth", "Faceless YouTube", "Beginner Guide"],
    author: "Immanuels",
    metaTitle: "How to Start a Faceless YouTube Channel in 2026 | Complete Guide",
    metaDescription: "Learn how to start a faceless YouTube channel in 2026. No camera required. Step-by-step guide to niche selection, content creation, and monetization.",
    content: `<h2>What Is a Faceless YouTube Channel?</h2><p>A faceless YouTube channel is a channel where you never appear on camera. Instead, you use screen recordings, stock footage, animations, or voiceover narration to deliver content.</p><p>Use our <a href="/tools/youtube-channel-name-generator">YouTube Channel Name Generator</a> to find the perfect name for your new channel.</p>`,
  },
  {
    title: "Best Free AI Tools for Content Creators in 2026 (Zero Cost, Maximum Output)",
    slug: "best-free-ai-tools-content-creators-2026",
    excerpt: "Discover the best free AI tools for content creators in 2026. Generate scripts, captions, hooks, hashtags, and more — all powered by AI and completely free.",
    tags: ["AI Tools", "Free Tools", "Content Creation"],
    author: "Immanuels",
    metaTitle: "Best Free AI Tools for Content Creators in 2026",
    metaDescription: "Discover the best free AI tools for content creators in 2026. Scripts, captions, hashtags, and more — all AI-powered and completely free at CreatorsToolHub.",
    content: `<h2>AI Has Changed Content Creation Forever</h2><p>In 2026, AI tools aren't just helpful — they're essential. Creators who use AI tools consistently produce more content, with higher quality, in less time.</p><p>Try our <a href="/tools/ai-prompt-generator">AI Prompt Generator</a> to create expert prompts for ChatGPT, Claude, and Gemini.</p>`,
  },
  {
    title: "How to Go Viral on TikTok in 2026: Strategies That Actually Work",
    slug: "how-to-go-viral-on-tiktok-2026-strategies-that-work",
    excerpt: "Learn how to go viral on TikTok in 2026 with proven strategies used by top creators. Understand the algorithm, nail your hook, and create content that spreads.",
    tags: ["TikTok Growth", "Viral Content", "Strategy"],
    author: "Immanuels",
    metaTitle: "How to Go Viral on TikTok in 2026: Strategies That Actually Work",
    metaDescription: "Learn how to go viral on TikTok in 2026. Proven strategies for hooks, hashtags, posting times, and the TikTok algorithm. Start growing your account today.",
    content: `<h2>Going Viral on TikTok Is More Accessible Than Ever</h2><p>TikTok's algorithm actively promotes new and small accounts. The For You Page is designed to surface quality content regardless of follower count.</p><p>Use our <a href="/tools/tiktok-hook-generator">TikTok Hook Generator</a> to create scroll-stopping openings for your videos.</p>`,
  },
  {
    title: "How to Get TikTok Video Ideas Every Single Day for Free",
    slug: "how-to-get-tiktok-video-ideas-every-day-free",
    excerpt: "Never run out of TikTok video ideas again. Learn 7 proven methods to generate fresh content ideas every day — including a free AI tool that does it in seconds.",
    tags: ["TikTok Growth", "Content Ideas", "Free Tools"],
    author: "Immanuels",
    metaTitle: "How to Get TikTok Video Ideas Every Day for Free | 7 Proven Methods",
    metaDescription: "Never run out of TikTok video ideas. 7 proven methods to generate fresh ideas every day, including a free AI idea generator. Get unlimited TikTok content ideas.",
    content: `<h2>Why Most Creators Run Out of TikTok Ideas</h2><p>Running out of content ideas is one of the top reasons TikTok creators quit. The solution isn't to be more creative — it's to have a system.</p><p>Use our <a href="/tools/tiktok-viral-idea-generator">TikTok Viral Idea Generator</a> to get fresh ideas for any niche instantly.</p>`,
  },
  {
    title: "How to Grow TikTok Followers Fast in 2026 (No Dancing Required)",
    slug: "how-to-grow-tiktok-followers-fast-2026",
    excerpt: "Want to grow TikTok followers fast in 2026 without dancing? Here's the real strategy — niche focus, consistent posting, optimized hooks, and smart hashtag use.",
    tags: ["TikTok Growth", "Followers", "Strategy"],
    author: "Immanuels",
    metaTitle: "How to Grow TikTok Followers Fast in 2026 (No Dancing Required)",
    metaDescription: "Grow TikTok followers fast in 2026 without dancing. Real strategies for niche content, hooks, hashtags, and consistency. Start growing your TikTok today.",
    content: `<h2>The Truth About Growing TikTok Followers Fast</h2><p>The fastest-growing TikTok accounts in 2026 share one thing in common: they've identified a specific niche and serve it consistently with high-quality, optimized content.</p><p>Use our <a href="/tools/tiktok-hashtag-generator">TikTok Hashtag Generator</a> to find the right hashtags for every video.</p>`,
  },
  {
    title: "How to Create Content Using AI: The Complete Beginner's Guide for 2026",
    slug: "how-to-create-content-using-ai-beginners-guide-2026",
    excerpt: "Learn how to create content using AI in 2026. This complete beginner's guide covers AI tools for YouTube scripts, TikTok captions, Instagram posts, and more.",
    tags: ["AI Tools", "Content Creation", "Beginner Guide"],
    author: "Immanuels",
    metaTitle: "How to Create Content Using AI: Complete Beginner's Guide for 2026",
    metaDescription: "Learn how to create content using AI in 2026. Beginner's guide to AI tools for YouTube, TikTok, and Instagram. Free AI content creation tools at CreatorsToolHub.",
    content: `<h2>AI Content Creation Is the New Competitive Advantage</h2><p>In 2026, creators who use AI tools effectively produce 3-5x more content than those who don't — without sacrificing quality. AI handles the heavy lifting while you focus on your unique perspective and delivery.</p><p>Use our <a href="/tools/ai-prompt-generator">AI Prompt Generator</a> to get started with expert prompts for any AI tool.</p>`,
  },
  {
    title: "50 Viral Content Ideas for Beginners That Actually Get Views in 2026",
    slug: "50-viral-content-ideas-beginners-get-views-2026",
    excerpt: "Stuck on what to post? Here are 50 viral content ideas for beginner creators across YouTube, TikTok, and Instagram that are proven to get views in 2026.",
    tags: ["Content Ideas", "Viral Content", "Beginner Guide"],
    author: "Immanuels",
    metaTitle: "50 Viral Content Ideas for Beginners That Get Views in 2026",
    metaDescription: "50 viral content ideas for beginner creators on YouTube, TikTok, and Instagram that actually get views in 2026. Use these ideas to grow your audience fast.",
    content: `<h2>Why These Ideas Work in 2026</h2><p>Every idea on this list follows proven content formulas that drive views, shares, and follows across platforms. They're designed for beginners who don't have a large audience yet.</p><p>Once you've chosen your ideas, use our <a href="/tools/youtube-video-idea-generator">YouTube Video Idea Generator</a> or <a href="/tools/tiktok-viral-idea-generator">TikTok Viral Idea Generator</a> to develop them further.</p>`,
  },
  {
    title: "Instagram Hashtag Strategy 2026: Get More Reach on Every Post",
    slug: "instagram-hashtag-strategy-2026-get-more-reach",
    excerpt: "Master the Instagram hashtag strategy for 2026 and get more reach on every single post. Learn the tiered approach that top creators use to consistently beat the algorithm.",
    tags: ["Instagram Growth", "Hashtags", "Strategy"],
    author: "Immanuels",
    metaTitle: "Instagram Hashtag Strategy 2026: Get More Reach on Every Post",
    metaDescription: "Master Instagram hashtag strategy in 2026. Learn the tiered approach for maximum reach, which hashtags to avoid, and how to use our free hashtag generator.",
    content: `<h2>Why Instagram Hashtags Still Matter in 2026</h2><p>Despite rumors, hashtags remain one of the most reliable ways to get your content discovered on Instagram — especially for accounts under 10K followers that don't yet have strong algorithmic distribution.</p><p>Use our <a href="/tools/instagram-hashtag-generator">Instagram Hashtag Generator</a> to get 30 optimized hashtags for every post.</p>`,
  },
  {
    title: "YouTube SEO Tips for Beginners That Actually Work in 2026",
    slug: "youtube-seo-tips-beginners-that-work-2026",
    excerpt: "These YouTube SEO tips for beginners will help your videos rank higher in 2026. Learn how to optimize your title, description, tags, and thumbnails for maximum search visibility.",
    tags: ["YouTube Growth", "SEO", "Beginner Guide"],
    author: "Immanuels",
    metaTitle: "YouTube SEO Tips for Beginners That Actually Work in 2026",
    metaDescription: "YouTube SEO tips for beginners that actually work in 2026. Optimize titles, descriptions, tags, and thumbnails to rank higher and get more views organically.",
    content: `<h2>YouTube SEO: The Foundation of Sustainable Growth</h2><p>While viral moments are unpredictable, YouTube SEO delivers consistent, compounding results. Videos that rank in YouTube search continue to get views months and even years after publication.</p><p>Use our <a href="/tools/youtube-keyword-generator">YouTube Keyword Generator</a> to find the best keywords for every video.</p>`,
  },
];

export async function bootstrapDb(): Promise<void> {
  try {
    console.log("[bootstrap] Checking database...");

    // Ensure schema tables exist by running a simple query
    // If the table doesn't exist this will throw, which we catch below
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL UNIQUE,
        "description" text DEFAULT '',
        "icon" varchar(50) DEFAULT '',
        "color" varchar(50) DEFAULT 'blue',
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "tools" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL UNIQUE,
        "category_id" integer REFERENCES "categories"("id"),
        "description" text DEFAULT '',
        "short_description" text DEFAULT '',
        "icon" varchar(50) DEFAULT '',
        "usage_count" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" serial PRIMARY KEY,
        "title" varchar(500) NOT NULL,
        "slug" varchar(500) NOT NULL UNIQUE,
        "excerpt" text NOT NULL DEFAULT '',
        "content" text NOT NULL DEFAULT '',
        "author" varchar(255) NOT NULL DEFAULT 'Creator Toolbox Team',
        "tags" text NOT NULL DEFAULT '[]',
        "meta_title" varchar(500) NOT NULL DEFAULT '',
        "meta_description" text NOT NULL DEFAULT '',
        "cover_image" text DEFAULT '',
        "faq_schema" text DEFAULT '',
        "reading_time" integer NOT NULL DEFAULT 5,
        "is_published" boolean NOT NULL DEFAULT false,
        "published_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "tool_usage" (
        "id" serial PRIMARY KEY,
        "tool_id" integer REFERENCES "tools"("id"),
        "tool_slug" varchar(255),
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "subject" varchar(500),
        "message" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Seed categories + tools
    console.log("[bootstrap] Seeding categories...");
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

    const insertedCategories = await db.select().from(categoriesTable);
    const categoryMap = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]));

    console.log("[bootstrap] Seeding tools...");
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

    // Seed blog posts
    console.log("[bootstrap] Seeding blog posts...");
    for (const post of blogPosts) {
      const readingTime = calcReadTime(post.content);
      await db
        .insert(blogPostsTable)
        .values({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          tags: JSON.stringify(post.tags),
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          readingTime,
          isPublished: true,
          publishedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: blogPostsTable.slug,
          set: {
            title: sql`excluded.title`,
            excerpt: sql`excluded.excerpt`,
            content: sql`excluded.content`,
            isPublished: sql`excluded.is_published`,
            publishedAt: sql`excluded.published_at`,
          },
        });
    }

    console.log("[bootstrap] Database bootstrap complete.");
  } catch (err) {
    console.error("[bootstrap] Database bootstrap failed:", err);
  }
}
