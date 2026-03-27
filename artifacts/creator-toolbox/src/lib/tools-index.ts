export interface ToolIndexEntry {
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  desc: string;
  icon: string;
}

export const TOOLS_INDEX: ToolIndexEntry[] = [
  // YouTube Tools
  { name: "YouTube Title Generator", slug: "youtube-title-generator", category: "YouTube", categorySlug: "youtube-tools", desc: "Create clickable, SEO-optimized YouTube video titles instantly", icon: "📺" },
  { name: "YouTube Tag Generator", slug: "youtube-tag-generator", category: "YouTube", categorySlug: "youtube-tools", desc: "Get keyword-rich YouTube tags to boost your video discoverability", icon: "🏷️" },
  { name: "YouTube Description Generator", slug: "youtube-description-generator", category: "YouTube", categorySlug: "youtube-tools", desc: "Write SEO-optimized YouTube descriptions with timestamps and keywords", icon: "📝" },
  { name: "YouTube Money Calculator", slug: "youtube-money-calculator", category: "YouTube", categorySlug: "youtube-tools", desc: "Estimate your YouTube earnings based on views and niche", icon: "💰" },
  { name: "YouTube CPM Calculator", slug: "youtube-cpm-calculator", category: "YouTube", categorySlug: "youtube-tools", desc: "Calculate your YouTube CPM and RPM to understand advertiser rates", icon: "📊" },
  { name: "YouTube Thumbnail Downloader", slug: "youtube-thumbnail-downloader", category: "YouTube", categorySlug: "youtube-tools", desc: "Download any YouTube video thumbnail in full HD quality", icon: "🖼️" },
  { name: "YouTube Channel Name Generator", slug: "youtube-channel-name-generator", category: "YouTube", categorySlug: "youtube-tools", desc: "Generate unique, memorable YouTube channel name ideas for your niche", icon: "📡" },
  { name: "YouTube Hashtag Generator", slug: "youtube-hashtag-generator", category: "YouTube", categorySlug: "youtube-tools", desc: "Generate trending YouTube hashtags to increase your video reach", icon: "#️⃣" },
  { name: "YouTube Video Idea Generator", slug: "youtube-video-idea-generator", category: "YouTube", categorySlug: "youtube-tools", desc: "Generate trending YouTube video ideas tailored to your niche", icon: "💡" },
  { name: "YouTube Title Analyzer", slug: "youtube-title-analyzer", category: "YouTube", categorySlug: "youtube-tools", desc: "Analyze your YouTube title for SEO strength and click-through potential", icon: "🔍" },
  { name: "YouTube Shorts Revenue Calculator", slug: "youtube-shorts-revenue-calculator", category: "YouTube", categorySlug: "youtube-tools", desc: "Calculate your YouTube Shorts earnings and monetization potential", icon: "📱" },
  { name: "YouTube Keyword Generator", slug: "youtube-keyword-generator", category: "YouTube", categorySlug: "youtube-tools", desc: "Find high-traffic YouTube keywords to rank your videos higher", icon: "🔑" },
  { name: "YouTube SEO Score Checker", slug: "youtube-seo-score-checker", category: "YouTube", categorySlug: "youtube-tools", desc: "Check and improve your YouTube video SEO score instantly", icon: "⭐" },
  { name: "YouTube Script Generator", slug: "youtube-script-generator", category: "YouTube", categorySlug: "youtube-tools", desc: "Generate full YouTube video scripts with structured hooks and CTAs", icon: "🎬" },
  { name: "YouTube Engagement Calculator", slug: "youtube-engagement-calculator", category: "YouTube", categorySlug: "youtube-tools", desc: "Calculate your YouTube channel engagement rate and benchmarks", icon: "📈" },

  // TikTok Tools
  { name: "TikTok Viral Idea Generator", slug: "tiktok-viral-idea-generator", category: "TikTok", categorySlug: "tiktok-tools", desc: "Generate viral TikTok content ideas tailored to your niche", icon: "🔥" },
  { name: "TikTok Hashtag Generator", slug: "tiktok-hashtag-generator", category: "TikTok", categorySlug: "tiktok-tools", desc: "Find trending TikTok hashtags to maximize your video reach", icon: "#️⃣" },
  { name: "TikTok Money Calculator", slug: "tiktok-money-calculator", category: "TikTok", categorySlug: "tiktok-tools", desc: "Estimate your TikTok earnings from views and Creator Fund", icon: "💵" },
  { name: "TikTok Hook Generator", slug: "tiktok-hook-generator", category: "TikTok", categorySlug: "tiktok-tools", desc: "Generate scroll-stopping TikTok hooks that keep viewers watching", icon: "🎣" },
  { name: "TikTok Bio Generator", slug: "tiktok-bio-generator", category: "TikTok", categorySlug: "tiktok-tools", desc: "Create a compelling TikTok bio that converts visitors to followers", icon: "✍️" },
  { name: "TikTok Caption Generator", slug: "tiktok-caption-generator", category: "TikTok", categorySlug: "tiktok-tools", desc: "Write engaging TikTok captions with hooks, hashtags, and CTAs", icon: "💬" },
  { name: "TikTok Script Generator", slug: "tiktok-script-generator", category: "TikTok", categorySlug: "tiktok-tools", desc: "Generate full TikTok video scripts with hooks, body, and CTAs", icon: "🎥" },
  { name: "TikTok Username Generator", slug: "tiktok-username-generator", category: "TikTok", categorySlug: "tiktok-tools", desc: "Generate memorable TikTok usernames for your brand or niche", icon: "@" },

  // Instagram Tools
  { name: "Instagram Username Generator", slug: "instagram-username-generator", category: "Instagram", categorySlug: "instagram-tools", desc: "Create unique Instagram usernames that stand out and get found", icon: "@" },
  { name: "Instagram Hook Generator", slug: "instagram-hook-generator", category: "Instagram", categorySlug: "instagram-tools", desc: "Write scroll-stopping Reel hooks that stop users mid-scroll", icon: "🪝" },
  { name: "Instagram Money Calculator", slug: "instagram-money-calculator", category: "Instagram", categorySlug: "instagram-tools", desc: "Estimate your Instagram earnings and influencer rates", icon: "💰" },
  { name: "Instagram Engagement Calculator", slug: "instagram-engagement-calculator", category: "Instagram", categorySlug: "instagram-tools", desc: "Calculate your Instagram engagement rate and compare to benchmarks", icon: "📊" },
  { name: "Instagram Caption Generator", slug: "instagram-caption-generator", category: "Instagram", categorySlug: "instagram-tools", desc: "Write compelling Instagram captions that drive saves and shares", icon: "📸" },
  { name: "Instagram Bio Generator", slug: "instagram-bio-generator", category: "Instagram", categorySlug: "instagram-tools", desc: "Create a standout Instagram bio that converts profile visitors to followers", icon: "🌟" },
  { name: "Instagram Hashtag Generator", slug: "instagram-hashtag-generator", category: "Instagram", categorySlug: "instagram-tools", desc: "Generate 30 optimized Instagram hashtags to boost post reach", icon: "#️⃣" },
  { name: "Instagram Content Planner", slug: "instagram-content-planner", category: "Instagram", categorySlug: "instagram-tools", desc: "Plan your Instagram content calendar for consistent growth", icon: "📅" },
  { name: "Instagram Reel Idea Generator", slug: "instagram-reel-idea-generator", category: "Instagram", categorySlug: "instagram-tools", desc: "Generate viral Instagram Reel ideas with hooks and formats", icon: "🎬" },

  // AI Creator Tools
  { name: "AI Prompt Generator", slug: "ai-prompt-generator", category: "AI Tools", categorySlug: "ai-creator-tools", desc: "Generate powerful AI prompts for ChatGPT, Claude, and other AI tools", icon: "🤖" },
  { name: "Midjourney Prompt Generator", slug: "midjourney-prompt-generator", category: "AI Tools", categorySlug: "ai-creator-tools", desc: "Create detailed Midjourney prompts for stunning AI-generated images", icon: "🎨" },
];

export function searchTools(query: string): ToolIndexEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return TOOLS_INDEX.filter(
    t =>
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.slug.replace(/-/g, " ").includes(q)
  );
}
