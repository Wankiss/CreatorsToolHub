/**
 * update-blog-seo.ts
 * Updates metaTitle, metaDescription, and faqSchema for the top 7 blog posts
 * ordered by GSC impression volume (highest-traffic posts first).
 *
 * Run with:
 *   DATABASE_URL=... npx tsx lib/db/src/update-blog-seo.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { blogPostsTable } from "./schema/index.js";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// ── FAQ helper type ────────────────────────────────────────────────────────────
interface FaqItem {
  question: string;
  answer: string;
}

// ── Per-post SEO data, ordered by GSC impressions (desc) ─────────────────────
const BLOG_SEO_UPDATES: Array<{
  slug: string;
  impressions: number;
  metaTitle: string;
  metaDescription: string;
  faq: FaqItem[];
}> = [
  // ── 1. YouTube Tags (2,322 imp) ─────────────────────────────────────────────
  {
    slug: "youtube-tags-in-2026-what-they-do-how-to-use-them-and-which-tools-work-best",
    impressions: 2322,
    metaTitle: "YouTube Tags in 2026: Do They Still Matter?",
    metaDescription:
      "YouTube tags still influence SEO in 2026. Learn what they do, how to use them correctly, and which free tools generate the best tags for your videos instantly.",
    faq: [
      {
        question: "Do YouTube tags still matter in 2026?",
        answer:
          "Yes, YouTube tags still influence how YouTube categorizes your video and can help you surface for misspelled or alternative keyword searches. While title and description carry more weight, tags remain a useful supplementary SEO signal.",
      },
      {
        question: "How many tags should I use on YouTube?",
        answer:
          "Use 5–10 highly relevant tags per video. Include your exact target keyword, 2–3 close variations, and 1–2 broader category tags. Avoid keyword stuffing — quality and relevance beat quantity every time.",
      },
      {
        question: "What is the best free YouTube tag generator?",
        answer:
          "creatorsToolHub's free YouTube Tag Generator instantly creates SEO-optimized tags for any video topic. No signup or account required — just enter your topic and get tags in seconds.",
      },
      {
        question: "Where do I add tags on YouTube?",
        answer:
          "Go to YouTube Studio → select your video → click 'Details' → scroll down to 'More options' → find the 'Tags' field. Enter your tags separated by commas and click Save.",
      },
    ],
  },

  // ── 2. How to Go Viral on TikTok (1,490 imp) ────────────────────────────────
  {
    slug: "how-to-go-viral-on-tiktok-2026-strategies-that-work",
    impressions: 1490,
    metaTitle: "How to Go Viral on TikTok in 2026 (7 Strategies)",
    metaDescription:
      "Discover 7 proven strategies to go viral on TikTok in 2026. From crafting scroll-stopping hooks to mastering posting times, learn what the algorithm rewards right now.",
    faq: [
      {
        question: "How do you go viral on TikTok in 2026?",
        answer:
          "To go viral on TikTok in 2026, hook viewers within the first 2 seconds, use trending audio, post 1–3 times per day, and create content with high completion rates. The algorithm rewards watch time and shares above all other signals.",
      },
      {
        question: "What is the best time to post on TikTok to go viral?",
        answer:
          "The best posting times on TikTok are 6–9 AM, 12–3 PM, and 7–11 PM in your audience's primary time zone. Tuesday, Thursday, and Friday tend to generate the highest engagement rates.",
      },
      {
        question: "How many hashtags should I use on TikTok?",
        answer:
          "Use 3–5 targeted hashtags per TikTok post — one broad, two niche-specific, and one trending. Flooding your caption with dozens of tags looks spammy and can suppress your organic reach.",
      },
      {
        question: "Does posting every day help you go viral on TikTok?",
        answer:
          "Yes. Consistent daily posting signals to the TikTok algorithm that you're an active creator, which increases your chances of appearing on the For You Page and reaching new audiences faster.",
      },
    ],
  },

  // ── 3. Faceless YouTube Channel Ideas (1,145 imp) ───────────────────────────
  {
    slug: "faceless-youtube-channel-ideas-proven-niches-2026",
    impressions: 1145,
    metaTitle: "Best Faceless YouTube Channel Ideas 2026 (Profitable)",
    metaDescription:
      "Looking for faceless YouTube channel ideas that actually make money? These 15 proven niches generate passive income without you ever showing your face in 2026.",
    faq: [
      {
        question: "What are the best faceless YouTube channel ideas in 2026?",
        answer:
          "The most profitable faceless niches in 2026 include: personal finance & investing, AI tutorials, meditation & sleep content, history documentaries, gaming commentary, book summaries, and motivational compilations. These all have high CPMs and don't require on-camera presence.",
      },
      {
        question: "Can a faceless YouTube channel make money?",
        answer:
          "Absolutely. Many faceless channels earn $3–$15 CPM through AdSense alone. Top faceless creators in finance and tech niches make $10,000+/month through a combination of ad revenue, sponsorships, and affiliate marketing — without ever showing their face.",
      },
      {
        question: "How do I start a faceless YouTube channel?",
        answer:
          "Pick a high-CPM niche, create a channel name with our free YouTube Channel Name Generator, film using screen recordings or stock footage, add an AI voiceover with ElevenLabs or Eleven AI, and upload 2–3 times per week for the first 90 days to build momentum.",
      },
      {
        question: "What equipment do I need for a faceless YouTube channel?",
        answer:
          "Very little. A laptop, a free video editor (CapCut or DaVinci Resolve), a screen recorder, and an AI voice tool are all you need to start. Most successful faceless channels launched with $0 in equipment costs.",
      },
    ],
  },

  // ── 4. Grow TikTok Followers Fast (1,128 imp) ───────────────────────────────
  {
    slug: "how-to-grow-tiktok-followers-fast-2026",
    impressions: 1128,
    metaTitle: "How to Grow TikTok Followers Fast in 2026",
    metaDescription:
      "Want more TikTok followers fast? These 10 proven growth tactics have helped creators go from 0 to 10K in 30 days. Start growing your TikTok account today for free.",
    faq: [
      {
        question: "How can I grow my TikTok followers fast in 2026?",
        answer:
          "The fastest way to grow TikTok followers is: post 1–3 times daily, hook viewers in the first 2 seconds, use trending audio, engage with every comment, duet viral videos in your niche, and use 3–5 niche-targeted hashtags on every post.",
      },
      {
        question: "How long does it take to grow on TikTok?",
        answer:
          "Most consistent creators reach 1K–10K followers within 30–90 days of daily posting. A single viral video can dramatically accelerate this timeline — some creators hit 10K followers in under a week.",
      },
      {
        question: "Does buying TikTok followers work?",
        answer:
          "No. Purchased followers don't engage with your content, which tanks your engagement rate and signals poor quality to the TikTok algorithm. This actively suppresses your organic reach. Focus on authentic growth strategies instead.",
      },
      {
        question: "What type of TikTok content gets the most followers?",
        answer:
          "Tutorial content, before-and-after transformations, relatable comedy skits, and trending challenges consistently drive the most follower growth on TikTok. Niche-specific educational content also builds a loyal, fast-growing audience that sticks around.",
      },
    ],
  },

  // ── 5. Instagram Hashtag Strategy (615 imp) ─────────────────────────────────
  {
    slug: "instagram-hashtag-strategy-2026-get-more-reach",
    impressions: 615,
    metaTitle: "Instagram Hashtag Strategy 2026: Get More Reach",
    metaDescription:
      "Use the proven 3-tier hashtag strategy to grow your Instagram reach in 2026. Mix broad, niche, and micro hashtags for maximum visibility on every post and Reel.",
    faq: [
      {
        question: "How many hashtags should I use on Instagram in 2026?",
        answer:
          "Instagram recommends using 3–5 hashtags in 2026, but many creators still see strong reach with 8–15 targeted tags. Test both approaches — what matters most is relevance and specificity, not raw quantity.",
      },
      {
        question: "What is the 3-tier hashtag strategy for Instagram?",
        answer:
          "The 3-tier strategy combines: broad hashtags (1M+ posts) for wide exposure, mid-range hashtags (100K–1M posts) for targeted reach, and micro hashtags (under 100K posts) for niche community engagement. Use 2–3 tags from each tier per post.",
      },
      {
        question: "Do Instagram hashtags still work in 2026?",
        answer:
          "Yes, but Instagram's algorithm now prioritizes content quality and watch time over hashtag volume. Strategic hashtag use still boosts discoverability — especially for smaller accounts trying to break out of their existing audience.",
      },
      {
        question: "How do I find the best hashtags for Instagram?",
        answer:
          "Use creatorsToolHub's free Instagram Hashtag Generator to instantly get 30 tiered hashtags for any niche or post topic. No signup required — just enter your content description and get strategy-optimized hashtags in seconds.",
      },
    ],
  },

  // ── 6. YouTube SEO Tips for Beginners (297 imp) ─────────────────────────────
  {
    slug: "youtube-seo-tips-beginners-that-work-2026",
    impressions: 297,
    metaTitle: "YouTube SEO Tips for Beginners That Work in 2026",
    metaDescription:
      "New to YouTube SEO? These beginner-friendly tips will help your videos rank higher on YouTube in 2026. Start optimizing today with free tools and proven tactics.",
    faq: [
      {
        question: "What is YouTube SEO and why does it matter?",
        answer:
          "YouTube SEO is the process of optimizing your videos so they rank higher in YouTube search results and recommendations. Better SEO means more organic views, faster subscriber growth, and higher ad revenue — all without paying for promotion.",
      },
      {
        question: "How do I do keyword research for YouTube as a beginner?",
        answer:
          "Use creatorsToolHub's free YouTube Keyword Generator to find high-volume, low-competition keywords for any niche. Also check YouTube's autocomplete suggestions by typing your topic and reviewing what appears — these are real searches people are making.",
      },
      {
        question: "Does the YouTube video description help with SEO?",
        answer:
          "Yes. YouTube reads your description to understand your video's topic. Place your main keyword in the first 2–3 sentences, include 3–5 related keywords naturally throughout, and add timestamps for chapter navigation to improve viewer experience and session time.",
      },
      {
        question: "How long does it take to rank on YouTube?",
        answer:
          "New channels typically start ranking within 3–6 months of consistent uploading. Videos that target low-competition, specific keywords with strong SEO signals (title, description, tags, thumbnail CTR) can rank within days of publishing.",
      },
    ],
  },

  // ── 7. How to Start a Faceless YouTube Channel (296 imp) ────────────────────
  {
    slug: "how-to-start-faceless-youtube-channel-complete-guide-2026",
    impressions: 296,
    metaTitle: "How to Start a Faceless YouTube Channel in 2026",
    metaDescription:
      "Step-by-step guide to starting a profitable faceless YouTube channel in 2026. Choose a niche, set up your workflow, and start earning — no camera or face required.",
    faq: [
      {
        question: "Can you start a YouTube channel without showing your face?",
        answer:
          "Yes — faceless YouTube channels are one of the fastest-growing content formats. You can create professional videos using screen recordings, stock footage, AI voiceovers, or animations without ever appearing on camera.",
      },
      {
        question: "What are the most profitable niches for a faceless YouTube channel?",
        answer:
          "The most profitable faceless niches include: personal finance & investing, AI and tech tutorials, meditation & sleep, history, gaming commentary, book summaries, and true crime. These all have high CPMs and a massive existing audience.",
      },
      {
        question: "How do I make videos for a faceless YouTube channel?",
        answer:
          "Common workflows include: (1) Write a script → record an AI voiceover with ElevenLabs → add stock footage in CapCut or Premiere Pro. (2) Record your screen for tutorial content. (3) Create animated explainer videos using Canva or Adobe Express.",
      },
      {
        question: "How much money can a faceless YouTube channel make?",
        answer:
          "Faceless channels in high-CPM niches like finance can earn $10–$30 per 1,000 views. A channel generating 100K monthly views could earn $1,000–$3,000/month from AdSense alone, plus additional income from sponsorships and affiliate deals.",
      },
    ],
  },
];

// ── Runner ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n📝 Updating SEO metadata for ${BLOG_SEO_UPDATES.length} blog posts...\n`);
  let updated = 0;

  for (const post of BLOG_SEO_UPDATES) {
    // blog-post.tsx reads faqSchema as [{ question, answer }] and wraps it in FAQPage schema
    const faqSchemaJson = JSON.stringify(
      post.faq.map((item) => ({ question: item.question, answer: item.answer }))
    );

    const result = await db
      .update(blogPostsTable)
      .set({
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        faqSchema: faqSchemaJson,
        updatedAt: new Date(),
      })
      .where(eq(blogPostsTable.slug, post.slug))
      .returning({ id: blogPostsTable.id, title: blogPostsTable.title });

    if (result.length > 0) {
      console.log(`  ✓ [${post.impressions.toLocaleString()} imp] "${result[0].title}"`);
      updated++;
    } else {
      console.log(`  ⚠ No post found for slug: ${post.slug}`);
    }
  }

  console.log(`\n✅ Done — updated ${updated}/${BLOG_SEO_UPDATES.length} posts.\n`);
  await pool.end();
}

run().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
