import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { toolsTable } from "./schema/index.js";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const tools = [
  {
    slug: "tiktok-viral-idea-generator",
    howToGuide: `<h2>How to Use the TikTok Viral Idea Generator</h2>
<ol>
  <li><strong>Enter your niche</strong> — Type your content category: fitness, cooking, finance, comedy, beauty, etc. Be specific for better results.</li>
  <li><strong>Select a trend format</strong> — Choose from trending audio, challenge, storytelling, POV, day-in-my-life, or educational formats.</li>
  <li><strong>Generate</strong> — Get 10 TikTok video concepts built around proven viral frameworks, tailored to your niche.</li>
  <li><strong>Check trending sounds</strong> — Take your idea to TikTok's Discover tab and pair it with a currently trending sound for maximum FYP push.</li>
  <li><strong>Film within 24 hours</strong> — TikTok trends move fast. An idea that's timely today may be oversaturated in a week. The best time to post a trending concept is now.</li>
</ol>`,
    seoContent: `<h2>What Actually Makes a TikTok Go Viral in 2025</h2>
<p>Virality on TikTok is less random than it looks. Most videos that explode follow a recognisable pattern: they trigger a strong emotion in the first 2 seconds, they have a payoff that makes viewers want to watch again or share, and they fit neatly into an existing content format the algorithm already understands. Our TikTok Viral Idea Generator is trained on these patterns so every idea it produces has a structural advantage before you even press record.</p>
<h3>The Four Emotions That Drive TikTok Shares</h3>
<p>Research on viral content consistently identifies four emotions that drive sharing: awe (something surprising or impressive), amusement (something genuinely funny), anger or disagreement (something that sparks a reaction), and inspiration (something that makes viewers feel they can do it too). Videos that trigger one of these emotions strongly outperform content that feels flat or informational without an emotional hook.</p>
<h3>Trending Formats vs. Original Concepts</h3>
<p>Trending formats (duets, stitches, specific audio challenges) get a distribution boost because TikTok recognises the format and serves it to users already engaging with that trend. Original concepts can go viral too, but they require exceptional execution. For new creators, piggybacking on existing formats while adding a unique niche-specific angle is the fastest path to early viral moments.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What makes a TikTok video go viral?</dt><dd class="mt-1 text-muted-foreground">Viral TikToks typically combine a strong hook in the first 2 seconds, high completion rate (people watch to the end), a shareable or relatable payoff, and alignment with a trending format or sound. The algorithm rewards all four simultaneously.</dd></div>
  <div><dt class="font-bold text-lg">How important is the trending sound for going viral?</dt><dd class="mt-1 text-muted-foreground">Very important for discovery. TikTok actively boosts videos using currently trending sounds because it knows users are already engaging with that audio. Pairing a strong video concept with a trending sound increases FYP distribution significantly.</dd></div>
  <div><dt class="font-bold text-lg">How often should I post on TikTok to grow fast?</dt><dd class="mt-1 text-muted-foreground">Most fast-growing TikTok accounts post 1–3 times per day, especially in the early growth phase. Consistency and volume give the algorithm more opportunities to find your best-performing content and push it to wider audiences.</dd></div>
  <div><dt class="font-bold text-lg">Is the TikTok Viral Idea Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "tiktok-script-generator",
    howToGuide: `<h2>How to Use the TikTok Script Generator</h2>
<ol>
  <li><strong>Enter your video topic</strong> — Describe what your TikTok is about in one sentence. Example: "5 morning habits that changed my productivity."</li>
  <li><strong>Choose your video length</strong> — 15 seconds, 30 seconds, 60 seconds, or 3 minutes. Each length gets a structurally different script.</li>
  <li><strong>Select your delivery style</strong> — Talking-head, voiceover, text-on-screen, or a mix. The script adapts to how you plan to film.</li>
  <li><strong>Generate</strong> — Get a complete script starting with a scroll-stopping hook and ending with a strong CTA or loop-back that boosts completion rate.</li>
  <li><strong>Record immediately</strong> — TikTok scripts work best when delivered naturally. Do one practice read, then film. Over-rehearsed delivery kills authenticity.</li>
</ol>`,
    seoContent: `<h2>Why Scripted TikToks Outperform Unscripted Ones</h2>
<p>The spontaneous, "authentic" TikTok aesthetic is largely an illusion. The most-viewed creators script their content meticulously — they just deliver it in a way that feels off-the-cuff. Every second of a TikTok is real estate. A 30-second video has 30 moments where a viewer can decide to swipe. Scripting ensures every single moment is earning its place.</p>
<h3>TikTok Script Structure That Maximises Completion Rate</h3>
<p>A high-completion TikTok follows a specific structure: <strong>Hook</strong> (seconds 0–3): stop the scroll with a bold claim, question, or visual. <strong>Setup</strong> (seconds 3–10): expand the premise and hint at the payoff. <strong>Delivery</strong> (seconds 10–25): deliver the value, reveal, or punchline. <strong>Loop</strong> (final second): end in a way that makes the viewer want to watch again or share — a surprising twist, a callback to the opening, or an unresolved element that makes them rewatch to catch what they missed. Rewatches are one of TikTok's most powerful distribution signals.</p>
<h3>Text-on-Screen Scripts vs. Spoken Scripts</h3>
<p>About 40% of TikTok is watched without sound. Text-on-screen scripts ensure your message lands for silent viewers while also reinforcing key points for viewers with sound on. Our generator can produce scripts formatted for on-screen text, spoken word, or both simultaneously — so you capture every viewer regardless of how they're watching.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How long should a TikTok script be?</dt><dd class="mt-1 text-muted-foreground">At a natural TikTok speaking pace of 150–180 words per minute: a 15-second script needs 35–45 words; 30 seconds needs 75–90 words; 60 seconds needs 150–180 words. Our generator targets these exact counts by the length you select.</dd></div>
  <div><dt class="font-bold text-lg">What is a TikTok loop and why does it matter?</dt><dd class="mt-1 text-muted-foreground">A loop ending connects your video's last moment back to the first, encouraging viewers to rewatch. TikTok counts replays in its completion metrics, and high completion rate is the #1 signal for FYP distribution — making loop endings one of the most powerful tricks in TikTok scripting.</dd></div>
  <div><dt class="font-bold text-lg">Should TikTok scripts include on-screen text?</dt><dd class="mt-1 text-muted-foreground">Yes, especially if your content is educational or list-based. Around 40% of TikTok viewers watch without sound. On-screen text ensures your message reaches all viewers and also reinforces key points for those watching with audio.</dd></div>
  <div><dt class="font-bold text-lg">Is the TikTok Script Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "tiktok-money-calculator",
    howToGuide: `<h2>How to Use the TikTok Money Calculator</h2>
<ol>
  <li><strong>Enter your average monthly views</strong> — Use your TikTok analytics to find your total views over the last 30 days.</li>
  <li><strong>Enter your follower count</strong> — Your follower count affects your eligibility tier within TikTok's monetisation programs.</li>
  <li><strong>Select your niche</strong> — Different content categories attract different advertiser rates on TikTok's creator marketplace.</li>
  <li><strong>Review the breakdown</strong> — The calculator estimates earnings from TikTok's Creator Rewards Program, brand deal potential, and TikTok LIVE gifts separately.</li>
</ol>`,
    seoContent: `<h2>How Much Do TikTok Creators Actually Earn?</h2>
<p>TikTok monetisation is more complex than YouTube because it operates across multiple separate programs. The Creator Rewards Program pays per view, but the rates are modest. The real money on TikTok comes from brand deals, TikTok LIVE gifts, and driving traffic to external products or services. Understanding each revenue stream helps you build a strategy that maximises your total income rather than relying on any single source.</p>
<h3>TikTok Creator Rewards Program</h3>
<p>TikTok's Creator Rewards Program (the updated version of the Creator Fund) pays creators based on video performance metrics including views, originality, and engagement. Rates typically range from $0.40 to $1.00 per 1,000 views for qualifying content — significantly lower than YouTube AdSense but available at lower follower counts. You need 10,000 followers and 100,000 views in the last 30 days to qualify.</p>
<h3>Brand Deals: Where the Real TikTok Money Is</h3>
<p>For most creators, brand partnerships generate 5–10x more revenue than the Creator Rewards Program. Brands pay between $200 and $2,000+ per sponsored post for mid-tier creators (100K–500K followers), depending on niche and engagement rate. Finance, tech, beauty, and fitness niches command the highest rates. Our calculator includes a brand deal estimate based on your follower count and niche benchmarks.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How much does TikTok pay per 1,000 views?</dt><dd class="mt-1 text-muted-foreground">TikTok's Creator Rewards Program pays approximately $0.40–$1.00 per 1,000 views for qualifying content. This is lower than YouTube RPM but accessible at a lower follower count. Brand deals and LIVE gifts typically earn significantly more per engagement.</dd></div>
  <div><dt class="font-bold text-lg">How many followers do I need to make money on TikTok?</dt><dd class="mt-1 text-muted-foreground">You need 10,000 followers and 100,000 views in the past 30 days to join the Creator Rewards Program. Brand deals can come earlier — some micro-influencers with 5,000–10,000 engaged followers attract sponsorships in niche markets.</dd></div>
  <div><dt class="font-bold text-lg">Is TikTok or YouTube more profitable?</dt><dd class="mt-1 text-muted-foreground">YouTube typically pays more per view through AdSense (usually $1–$5 RPM vs TikTok's $0.40–$1.00 per 1,000 views). However, TikTok's viral reach can generate far higher view counts, and TikTok brand deals are increasingly competitive with YouTube sponsorships.</dd></div>
  <div><dt class="font-bold text-lg">Is the TikTok Money Calculator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "tiktok-bio-generator",
    howToGuide: `<h2>How to Use the TikTok Bio Generator</h2>
<ol>
  <li><strong>Describe yourself and your content</strong> — Enter your niche, what value you provide, and your personality in a few words. Example: "Fitness coach, home workouts, no equipment needed."</li>
  <li><strong>Select a tone</strong> — Professional, casual, funny, inspiring, or direct. Your bio tone should match your content style.</li>
  <li><strong>Generate</strong> — Get multiple bio options written to fit TikTok's 80-character limit while packing in your value proposition.</li>
  <li><strong>Add your link</strong> — TikTok allows one link in bio. Make it your most important destination — your website, Linktree, or lead magnet.</li>
  <li><strong>Include a CTA</strong> — The best TikTok bios tell new visitors what to do next: "Watch my latest video," "DM me for free guide," or "Link below for free resources."</li>
</ol>`,
    seoContent: `<h2>Why Your TikTok Bio Is More Important Than You Think</h2>
<p>Your TikTok bio is the first thing a potential follower reads when they land on your profile after seeing one of your videos. You have 80 characters to answer three questions: who are you, what do you make, and why should I follow you. A weak bio that doesn't answer these questions clearly loses followers that your videos already earned.</p>
<h3>What Belongs in a High-Converting TikTok Bio</h3>
<p>The best TikTok bios follow a simple formula: <strong>Who you help + What you help them do + How often you post or what they can expect</strong>. Example: "Helping busy moms lose weight without the gym 🏃‍♀️ | New workouts every week." In 80 characters or less, this tells exactly who the account is for, what benefit they get, and what to expect — all the information a viewer needs to decide whether to follow.</p>
<h3>Emojis and TikTok Bios</h3>
<p>Strategic emoji use in TikTok bios serves two purposes: they break up text visually, making bios easier to scan, and they convey tone instantly without using characters. A fitness creator using 💪 signals their vibe without explaining it. Use 1–2 emojis maximum — more starts to look cluttered and unprofessional.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How long can a TikTok bio be?</dt><dd class="mt-1 text-muted-foreground">TikTok bios are limited to 80 characters. That's roughly one to two short sentences — every word needs to earn its place. Focus on your value proposition and who your content is for.</dd></div>
  <div><dt class="font-bold text-lg">Should I include keywords in my TikTok bio?</dt><dd class="mt-1 text-muted-foreground">Yes. TikTok's search function indexes bio text, so including your niche keywords (e.g., "fitness coach," "travel tips," "personal finance") helps people find your profile when searching those terms.</dd></div>
  <div><dt class="font-bold text-lg">Can I put a link in my TikTok bio?</dt><dd class="mt-1 text-muted-foreground">Yes. TikTok allows one clickable link in your bio. Use a Linktree or similar landing page to direct followers to multiple destinations — your YouTube, website, shop, or email list.</dd></div>
  <div><dt class="font-bold text-lg">Is the TikTok Bio Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required. Generate as many bio options as you need.</dd></div>
</dl>`,
  },
  {
    slug: "tiktok-username-generator",
    howToGuide: `<h2>How to Use the TikTok Username Generator</h2>
<ol>
  <li><strong>Enter your name or niche keywords</strong> — Type your real name, a nickname, or keywords that describe your content category.</li>
  <li><strong>Select a style</strong> — Personal brand (name-based), niche keyword, creative mashup, or minimalist single word.</li>
  <li><strong>Generate</strong> — Get a list of available-style username ideas that fit TikTok's formatting rules (no spaces, 24 character limit).</li>
  <li><strong>Check availability</strong> — Search each option on TikTok before committing. Also check Instagram and Twitter for brand consistency.</li>
  <li><strong>Claim it everywhere</strong> — Once you pick your TikTok username, immediately claim the same handle on Instagram, YouTube, and Twitter even if you're not active there yet.</li>
</ol>`,
    seoContent: `<h2>How to Pick a TikTok Username That Builds Your Brand</h2>
<p>Your TikTok username follows you everywhere — it appears under every video, in every comment, on every duet and stitch. It's your brand identity on the platform. A strong TikTok username is short, memorable, easy to type, and consistent with how you want to be known across all social media. Getting it right from the start saves you a painful rebrand later.</p>
<h3>TikTok Username Rules and Best Practices</h3>
<p>TikTok usernames can be up to 24 characters, can include letters, numbers, underscores, and periods, but cannot contain spaces or special characters. Avoid numbers that don't mean anything (like birth years) — they make you look like an alt account. Underscores are acceptable but every underscore is one more character a viewer has to remember and type correctly.</p>
<h3>Searchability and Your TikTok Username</h3>
<p>TikTok's search bar indexes usernames. If your niche keyword appears in your username — "@fitnesswithalex," "@cookingwithsam" — people searching for that keyword may find your profile directly. This gives niche-keyword usernames a passive discoverability advantage over purely personal names.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">Can I change my TikTok username?</dt><dd class="mt-1 text-muted-foreground">Yes, but TikTok limits username changes to once every 30 days. You also lose your existing @handle, which means any external links or mentions pointing to your old username will break. Choose carefully from the start.</dd></div>
  <div><dt class="font-bold text-lg">How long can a TikTok username be?</dt><dd class="mt-1 text-muted-foreground">TikTok usernames can be up to 24 characters and can include letters, numbers, underscores, and periods. No spaces or special characters are allowed.</dd></div>
  <div><dt class="font-bold text-lg">Should my TikTok username match my Instagram handle?</dt><dd class="mt-1 text-muted-foreground">Yes, wherever possible. Consistent handles across platforms make you easier to find and strengthen your personal brand. Our generator helps you find names that are likely available across multiple platforms simultaneously.</dd></div>
  <div><dt class="font-bold text-lg">Is the TikTok Username Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "instagram-bio-generator",
    howToGuide: `<h2>How to Use the Instagram Bio Generator</h2>
<ol>
  <li><strong>Describe your account</strong> — Enter your niche, what you post about, who your audience is, and your personality style.</li>
  <li><strong>Choose a tone</strong> — Professional, conversational, inspirational, witty, or minimalist.</li>
  <li><strong>Generate</strong> — Get multiple bio options formatted to fit Instagram's 150-character limit, including a value proposition, niche signal, and CTA.</li>
  <li><strong>Add your link</strong> — Instagram allows one bio link. Use it for your highest-value destination — Linktree, your website, or your latest offer.</li>
  <li><strong>Use your name field strategically</strong> — The name field in Instagram bios is separately searchable. Put a keyword here (e.g., "Fitness Coach | HIIT Expert") for additional discoverability beyond your username.</li>
</ol>`,
    seoContent: `<h2>Your Instagram Bio Has 150 Characters to Convert a Visitor Into a Follower</h2>
<p>When someone lands on your Instagram profile, they take about 3 seconds to decide whether to follow. Your bio is your entire pitch in that window. A high-converting Instagram bio immediately answers: what is this account about, who is it for, and what should I do next? Miss any of these and you lose the follow — even from someone who loved the post that brought them to your profile.</p>
<h3>The Name Field: Instagram's Hidden SEO Tool</h3>
<p>Instagram's search algorithm gives extra weight to text in your name field (the bold text at the top of your bio, separate from your @username). Creators who put keywords in this field — "Sarah | Vegan Recipe Creator" or "James | Stock Market Investing" — show up in search results when users type those terms. This is one of the most underused Instagram growth tactics and our generator reminds you to optimise it.</p>
<h3>Instagram Bio SEO: What Instagram Indexes</h3>
<p>Instagram's search indexes your username and your name field. Your bio text is NOT currently indexed in Instagram's main search (though it affects hashtag and keyword search within the Explore page). This means your bio's job is to convert visitors who already found you — not to bring in new traffic. Focus every word on making a compelling first impression.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How long can an Instagram bio be?</dt><dd class="mt-1 text-muted-foreground">Instagram bios are limited to 150 characters. The name field (the bold text above the bio) adds an additional ~30 characters. Use the name field for keywords since it's indexed in Instagram search.</dd></div>
  <div><dt class="font-bold text-lg">Should I use hashtags in my Instagram bio?</dt><dd class="mt-1 text-muted-foreground">You can use hashtags in your bio — they become clickable links. However, this sends visitors away from your profile. Use hashtags only if they're branded (your own hashtag) or community hashtags that reinforce your niche identity.</dd></div>
  <div><dt class="font-bold text-lg">What should my Instagram bio CTA say?</dt><dd class="mt-1 text-muted-foreground">Point it at your link: "Free guide 👇," "Shop my looks 🔗," "New video every week — link below." Make it specific. Generic CTAs like "Check out my page" provide no reason to click.</dd></div>
  <div><dt class="font-bold text-lg">Is the Instagram Bio Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required. Generate as many bio options as you need.</dd></div>
</dl>`,
  },
  {
    slug: "instagram-username-generator",
    howToGuide: `<h2>How to Use the Instagram Username Generator</h2>
<ol>
  <li><strong>Enter your name or niche</strong> — Type your real name, business name, or the keywords that best describe your content.</li>
  <li><strong>Select a style</strong> — Personal brand, niche keyword, creative hybrid, or minimalist.</li>
  <li><strong>Generate</strong> — Get a list of Instagram-friendly username ideas within the 30-character limit.</li>
  <li><strong>Check availability</strong> — Search each option on Instagram. The generator produces unique combinations that are more likely to be available than common name formats.</li>
  <li><strong>Think cross-platform</strong> — Also check the same username on TikTok, YouTube, and Twitter before committing. Matching handles across all platforms makes your brand instantly recognisable.</li>
</ol>`,
    seoContent: `<h2>Choosing an Instagram Username That Works for Your Brand</h2>
<p>Your Instagram username is your digital address. It appears in every post you're tagged in, every comment you leave, every collaboration, and every time someone mentions you in their stories. A good username is short, clean, and instantly tells people what your account is about or who you are — without them needing to read your bio.</p>
<h3>Instagram Username SEO</h3>
<p>Instagram's search algorithm indexes usernames. Including a niche keyword in your handle — @vegancookingtips, @travelwithjordan — helps people discover your account when searching those terms. This gives keyword usernames a passive traffic advantage over purely name-based handles, especially for accounts in the early growth phase.</p>
<h3>Common Instagram Username Mistakes</h3>
<p>The most common mistakes: using lots of underscores or periods (each one is a character people have to type correctly), including your birth year (makes you look like a secondary account), being too niche-specific (if you pivot content, the name won't fit), and choosing a name that's already trademarked by a brand. Keep it clean, memorable, and future-proof.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How long can an Instagram username be?</dt><dd class="mt-1 text-muted-foreground">Instagram usernames can be up to 30 characters and can include letters, numbers, underscores, and periods. No spaces are allowed. Shorter is better — aim for under 20 characters for maximum memorability.</dd></div>
  <div><dt class="font-bold text-lg">Can I change my Instagram username?</dt><dd class="mt-1 text-muted-foreground">Yes, you can change your Instagram username at any time in Settings. However, your old username becomes available to others immediately — if you built brand recognition around it, changing can confuse existing followers. Consider carefully before changing an established handle.</dd></div>
  <div><dt class="font-bold text-lg">Should I use my real name as my Instagram username?</dt><dd class="mt-1 text-muted-foreground">If you're building a personal brand, your real name is a strong choice for long-term recognition. If your niche is very specific or competitive, adding a niche keyword (e.g., "@alexfitness" instead of just "@alex") improves searchability.</dd></div>
  <div><dt class="font-bold text-lg">Is the Instagram Username Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "instagram-reel-idea-generator",
    howToGuide: `<h2>How to Use the Instagram Reel Idea Generator</h2>
<ol>
  <li><strong>Enter your niche</strong> — Describe your account's focus: beauty, travel, food, fitness, business, lifestyle, etc.</li>
  <li><strong>Select a Reel format</strong> — Tutorial, before/after, trending audio, day-in-my-life, tips list, transformation, or reaction.</li>
  <li><strong>Generate</strong> — Get 10 Reel ideas complete with a concept, suggested hook, and the key visual moment that will make it shareable.</li>
  <li><strong>Pair with a trending audio</strong> — Go to Instagram Reels, browse trending sounds, and match one to your idea. Trending audio significantly boosts Reel distribution.</li>
  <li><strong>Film vertically at 1080×1920</strong> — Reels display full-screen. Horizontal or square video is automatically cropped and looks unprofessional.</li>
</ol>`,
    seoContent: `<h2>Instagram Reels in 2025: Your Fastest Path to New Followers</h2>
<p>Instagram Reels consistently generate 3–5x more reach than static posts for accounts in the early growth phase. Instagram's algorithm actively pushes Reels to non-followers through the Explore page and the Reels feed — making Reels the primary organic discovery mechanism on the platform in 2025. If you're not posting Reels, you're leaving your most powerful growth lever untouched.</p>
<h3>What Types of Reels Get the Most Reach</h3>
<p>Instagram's internal data and creator reports consistently point to the same high-performing Reel formats: educational carousels turned into Reels (high save rate), transformation/before-after content (high share rate), POV and relatable situational content (high comments and shares), and trend-jacking with a niche-specific twist (high reach through trending audio discovery). Our idea generator focuses on formats with proven reach mechanics built in.</p>
<h3>Reels vs. Feed Posts vs. Stories: Where to Focus</h3>
<p>For growth, Reels dominate — they reach non-followers at scale. For engagement with existing followers, carousels outperform both Reels and single images (they get up to 3x more swipes and comments). Stories are best for daily connection and driving conversions. A healthy Instagram strategy includes all three, but if you're starting from zero, prioritise Reels until you hit your follower target.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How long should Instagram Reels be in 2025?</dt><dd class="mt-1 text-muted-foreground">Instagram Reels can be up to 90 seconds. For maximum reach, 15–30 seconds tends to perform best because completion rate (watching the full video) is Instagram's primary Reels ranking signal. Longer Reels work well for tutorials where every second adds value.</dd></div>
  <div><dt class="font-bold text-lg">Do Instagram Reels help you gain followers?</dt><dd class="mt-1 text-muted-foreground">Yes — Reels are Instagram's most powerful organic reach tool. The algorithm shows Reels to non-followers through the Explore page and Reels feed, making them the most effective format for audience growth compared to feed posts or Stories.</dd></div>
  <div><dt class="font-bold text-lg">Should I use trending audio for Instagram Reels?</dt><dd class="mt-1 text-muted-foreground">Yes. Instagram boosts Reels using trending audio to users already engaging with that sound, giving your video a built-in distribution advantage. Check the Reels tab for trending sounds and use them while they're still rising.</dd></div>
  <div><dt class="font-bold text-lg">Is the Instagram Reel Idea Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "instagram-hook-generator",
    howToGuide: `<h2>How to Use the Instagram Hook Generator</h2>
<ol>
  <li><strong>Describe your Reel or post topic</strong> — Enter what your content is about in one sentence.</li>
  <li><strong>Choose a hook type</strong> — Question, bold claim, relatable struggle, surprising statistic, or story opener.</li>
  <li><strong>Generate</strong> — Get multiple hook options for both your spoken opening line and your on-screen text overlay.</li>
  <li><strong>Match hook to visual</strong> — Your opening visual and your hook text should work together. A "before" image with a before/after hook is more powerful than either alone.</li>
  <li><strong>Test two hooks on the same concept</strong> — Post the same Reel concept twice in different weeks with different hooks and compare which generates better 3-second view rate in your analytics.</li>
</ol>`,
    seoContent: `<h2>The Instagram Hook: Winning the 3-Second Test</h2>
<p>Instagram's Reels feed serves your video to users who did not ask for it. Unlike a YouTube search result (where intent is already established), a Reel has to interrupt someone's passive scroll and earn their attention from scratch. The hook — your opening second of visual or text — is what decides whether a viewer pauses or swipes. Everything else in your Reel depends on this single moment working.</p>
<h3>Visual Hooks vs. Text Hooks on Instagram</h3>
<p>On Instagram Reels, the visual hook (what the viewer sees in frame 1) and the text hook (what you write on screen) work together. The strongest Reels combine an arresting visual with a text hook that creates instant curiosity. A split-screen showing a dramatic transformation as the first visual, paired with on-screen text like "I did this for 30 days," creates two complementary hooks simultaneously — one for silent viewers, one for sound-on viewers.</p>
<h3>Why Your Instagram Hook Needs to Be Different From Your TikTok Hook</h3>
<p>Instagram Reels viewers skew slightly older than TikTok's audience and respond better to aspirational and inspirational hooks. TikTok favours raw, edgy, or controversial openers. On Instagram, hooks that lead with lifestyle aspiration ("The morning routine that changed everything for me"), social proof ("After helping 10,000 women..."), or personal relatability ("If you've ever felt overwhelmed by...") tend to outperform aggressive shock-value openers that dominate TikTok.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What is a hook in an Instagram Reel?</dt><dd class="mt-1 text-muted-foreground">A hook is the opening 1–3 seconds of your Reel — the combination of visuals, text, and audio that stops a viewer from scrolling. Instagram measures your "3-second view rate" — the percentage of viewers who watch at least 3 seconds — as a primary Reels ranking signal.</dd></div>
  <div><dt class="font-bold text-lg">What hooks work best on Instagram vs TikTok?</dt><dd class="mt-1 text-muted-foreground">Instagram Reels viewers respond better to aspirational, relatable, and inspirational hooks. TikTok favours edgier, more provocative openers. Our generator calibrates tone based on the platform you select.</dd></div>
  <div><dt class="font-bold text-lg">Should I use text on screen in the first second?</dt><dd class="mt-1 text-muted-foreground">Yes — especially for Reels watched without sound. On-screen text in the first second grabs silent viewers and gives all viewers immediate context for what the video is about. Always have a text hook alongside your visual hook.</dd></div>
  <div><dt class="font-bold text-lg">Is the Instagram Hook Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "instagram-engagement-calculator",
    howToGuide: `<h2>How to Use the Instagram Engagement Calculator</h2>
<ol>
  <li><strong>Enter your post metrics</strong> — Input your like count, comment count, and total reach (or follower count if reach isn't available).</li>
  <li><strong>Calculate</strong> — The tool returns your engagement rate as a percentage and benchmarks it against average rates for your follower tier.</li>
  <li><strong>Diagnose weak areas</strong> — If likes are high but comments low, your content is easy to appreciate but not prompting conversation. If both are low relative to reach, your content isn't resonating at all.</li>
  <li><strong>Use for brand deals</strong> — Brands paying for Instagram sponsorships care far more about engagement rate than raw follower count. Know your number before entering any negotiation.</li>
</ol>`,
    seoContent: `<h2>Instagram Engagement Rate: The Number That Determines Your Earning Power</h2>
<p>Follower count is vanity. Engagement rate is what brands pay for, what the Instagram algorithm rewards, and what actually predicts whether your content influences behaviour. A creator with 20,000 highly engaged followers will consistently outperform — and out-earn — an account with 200,000 passive ones. Understanding your engagement rate gives you the data to diagnose what's working and negotiate your true market rate with sponsors.</p>
<h3>How Instagram Calculates Engagement</h3>
<p>The standard engagement rate formula for Instagram is: (Likes + Comments) ÷ Total Followers × 100. However, using Reach instead of Followers gives a more accurate picture of how engaged your actual audience is (since not all followers see every post). Instagram Insights shows you both — use the reach-based rate when negotiating with brands, as it reflects active engagement more honestly.</p>
<h3>Average Instagram Engagement Rates by Follower Count</h3>
<p>Nano influencers (1K–10K followers) typically see 4–8% engagement. Micro influencers (10K–100K) average 2–4%. Mid-tier (100K–500K) average 1.5–2.5%. Macro (500K+) drops to 0.5–1.5%. These benchmarks mean a nano influencer with 8% engagement has a more valuable audience per post than a mega-influencer with 0.5% engagement — a fact that savvy brands increasingly understand.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What is a good Instagram engagement rate?</dt><dd class="mt-1 text-muted-foreground">For accounts under 10,000 followers, 4–8% is strong. For 10,000–100,000 followers, 2–4% is healthy. Above 100,000 followers, 1–2.5% is competitive. Higher engagement at any size signals genuine audience connection that brands and the algorithm both reward.</dd></div>
  <div><dt class="font-bold text-lg">How do I increase my Instagram engagement rate?</dt><dd class="mt-1 text-muted-foreground">Post consistently at times your audience is active, end every caption with a specific question, reply to all comments within the first hour of posting (this signals activity and often triggers more comments), and use Instagram Stories polls and questions to drive daily micro-engagement.</dd></div>
  <div><dt class="font-bold text-lg">Do brands care about engagement rate for sponsorships?</dt><dd class="mt-1 text-muted-foreground">Yes. Engagement rate is the primary metric most brands use to evaluate creator value for paid partnerships. An engagement rate above your tier's average gives you negotiating power for higher rates. Many brands now use engagement rate calculators before even reaching out.</dd></div>
  <div><dt class="font-bold text-lg">Is the Instagram Engagement Calculator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "instagram-money-calculator",
    howToGuide: `<h2>How to Use the Instagram Money Calculator</h2>
<ol>
  <li><strong>Enter your follower count</strong> — Input your current Instagram follower count.</li>
  <li><strong>Enter your average engagement rate</strong> — Use your recent post average, or calculate it with our Instagram Engagement Calculator.</li>
  <li><strong>Select your niche</strong> — Advertiser rates vary significantly by content category.</li>
  <li><strong>Review the breakdown</strong> — See estimated earnings per sponsored post, per Reel, and per Story, plus your estimated annual earning potential at your current size.</li>
</ol>`,
    seoContent: `<h2>How Much Do Instagram Influencers Actually Earn?</h2>
<p>Instagram influencer earnings are among the most misunderstood topics in the creator economy. You've probably seen outrageous claims from mega-influencers, and you've wondered what's realistic for your size. The answer depends on three things: your follower count, your engagement rate, and your niche. Our Instagram Money Calculator uses real benchmark data from creator marketplace research to give you an honest estimate of your current earning potential.</p>
<h3>Instagram Sponsorship Rates by Tier</h3>
<p>As a rough benchmark: nano influencers (1K–10K) can earn $50–$300 per post; micro influencers (10K–100K) typically charge $200–$1,500 per post; mid-tier (100K–500K) commands $1,500–$10,000 per post; macro creators (500K–1M) earn $5,000–$25,000 per post; mega influencers (1M+) can earn $25,000–$100,000+ per post. These ranges vary widely by niche — finance, tech, and beauty consistently pay more than lifestyle and comedy.</p>
<h3>Beyond Sponsored Posts: All the Ways Instagram Pays</h3>
<p>Sponsored posts are just one revenue stream. Savvy Instagram creators also earn through: affiliate marketing (commission on sales driven through their link), digital products (ebooks, presets, templates sold via the bio link), coaching or consulting services, brand ambassador programs (ongoing partnerships vs. one-off posts), and Instagram's own creator monetisation features including Subscriptions, Badges on Live, and Gifts on Reels.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How much does Instagram pay per sponsored post?</dt><dd class="mt-1 text-muted-foreground">The range is wide: nano influencers (1K–10K followers) typically earn $50–$300 per post; micro influencers (10K–100K) earn $200–$1,500; mid-tier creators (100K–500K) earn $1,500–$10,000. Exact rates depend heavily on your niche and engagement rate.</dd></div>
  <div><dt class="font-bold text-lg">Does Instagram pay you directly for views?</dt><dd class="mt-1 text-muted-foreground">Instagram pays through Gifts on Reels and Badges on Live — both require viewers to purchase and send them. Unlike YouTube AdSense, there's no automatic per-view payment. The majority of Instagram income comes from brand partnerships and creator-sold products.</dd></div>
  <div><dt class="font-bold text-lg">How many followers do I need to make money on Instagram?</dt><dd class="mt-1 text-muted-foreground">You can start earning from as few as 1,000 followers if your engagement rate is strong and your niche is valuable to advertisers. Micro and nano influencers in high-value niches (finance, beauty, fitness) regularly earn brand deals before hitting 10,000 followers.</dd></div>
  <div><dt class="font-bold text-lg">Is the Instagram Money Calculator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "instagram-content-planner",
    howToGuide: `<h2>How to Use the Instagram Content Planner</h2>
<ol>
  <li><strong>Enter your niche and content pillars</strong> — Define 3–5 content themes your account covers. Example for a fitness account: workouts, nutrition, mindset, behind-the-scenes, client results.</li>
  <li><strong>Select your posting frequency</strong> — Daily, 3–4x per week, or weekly. The planner structures your content mix around your schedule.</li>
  <li><strong>Generate your plan</strong> — Get a 30-day content calendar with a specific post idea for each day, the recommended format (Reel, carousel, Story, post), and a suggested caption hook.</li>
  <li><strong>Batch create</strong> — Film and design content for each week in one session rather than creating daily. Batch creation dramatically reduces content fatigue and improves quality consistency.</li>
  <li><strong>Schedule ahead</strong> — Use Instagram's native scheduling tool or a third-party scheduler (Later, Buffer) to queue posts in advance so you never miss a publishing slot.</li>
</ol>`,
    seoContent: `<h2>Why Consistent Instagram Posting Is a Growth Multiplier</h2>
<p>Instagram's algorithm rewards consistent posting because it tells the platform you're a reliable, active creator worth promoting. Accounts that post consistently at 3–5x per week grow followers 2–3x faster than accounts that post sporadically. Our Instagram Content Planner removes the decision fatigue of figuring out what to post next — giving you a complete 30-day roadmap built around your specific niche and audience goals.</p>
<h3>The Content Pillar Strategy</h3>
<p>Content pillars are the 3–5 recurring themes your account is built around. They ensure variety without randomness — every post serves your brand even when you're mixing up formats and topics. A sustainable content pillar mix covers: educational content (builds authority), entertaining content (drives shares and reach), personal/behind-the-scenes content (builds trust), promotional content (drives conversions), and user-generated or community content (builds loyalty). Balance these across your monthly plan for maximum growth and retention.</p>
<h3>Best Times to Post on Instagram in 2025</h3>
<p>Optimal posting times vary by audience, but research consistently shows engagement peaks on Tuesday–Friday between 9am–12pm in your audience's primary timezone. Avoid Sunday mornings and Monday early mornings — engagement is lowest during these windows. Use Instagram Insights to see specifically when your audience is most active and align your schedule accordingly.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How often should I post on Instagram to grow fast?</dt><dd class="mt-1 text-muted-foreground">For fastest growth, post 4–5 times per week — a mix of Reels (for reach), carousels (for engagement), and Stories (for daily connection). Consistency matters more than frequency: 3 posts per week every week beats 7 posts one week and nothing the next.</dd></div>
  <div><dt class="font-bold text-lg">What are content pillars for Instagram?</dt><dd class="mt-1 text-muted-foreground">Content pillars are the 3–5 recurring themes your account covers. They create structure and variety simultaneously — ensuring every post serves your niche while keeping your feed from feeling repetitive. Examples: a travel account might use pillars of destination guides, travel tips, budget hacks, gear reviews, and personal stories.</dd></div>
  <div><dt class="font-bold text-lg">What is the best time to post on Instagram?</dt><dd class="mt-1 text-muted-foreground">Tuesday to Friday between 9am and 12pm in your audience's primary timezone consistently shows the highest engagement. However, your Instagram Insights will show exactly when your specific followers are most active — always prioritise your own data over general benchmarks.</dd></div>
  <div><dt class="font-bold text-lg">Is the Instagram Content Planner free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "ai-prompt-generator",
    howToGuide: `<h2>How to Use the AI Prompt Generator</h2>
<ol>
  <li><strong>Describe what you want to create</strong> — Enter the task, topic, or output you're trying to generate. Be specific about format, tone, length, and purpose.</li>
  <li><strong>Select your target AI tool</strong> — Choose whether you're writing prompts for ChatGPT, Claude, Gemini, or a general-purpose LLM.</li>
  <li><strong>Generate</strong> — Get 5–10 refined prompt variations structured for maximum output quality from your chosen AI.</li>
  <li><strong>Test and iterate</strong> — Run 2–3 prompt variations in your AI tool and compare outputs. The best prompt for your use case is the one that produces the most useful result — which varies by AI model.</li>
  <li><strong>Save your best prompts</strong> — Build a personal prompt library for tasks you repeat regularly. A well-crafted prompt is reusable forever.</li>
</ol>`,
    seoContent: `<h2>Why Prompt Quality Determines AI Output Quality</h2>
<p>The gap between what AI tools can theoretically produce and what most users actually get comes down to prompting. Two users can type the same topic into ChatGPT and get outputs that are worlds apart in quality — purely because of how they phrased their request. Prompt engineering — the skill of communicating precisely with AI — is now one of the most valuable skills a content creator can develop. Our AI Prompt Generator gives you expert-level prompts without needing to study the craft yourself.</p>
<h3>The Anatomy of a High-Quality AI Prompt</h3>
<p>Effective prompts share a common structure: <strong>Role</strong> (tell the AI what persona to adopt: "Act as an expert YouTube SEO strategist"), <strong>Task</strong> (define exactly what to produce: "Write 10 YouTube title options"), <strong>Context</strong> (provide relevant background: "for a video about beginner investing targeting 25–35 year olds"), <strong>Format</strong> (specify output format: "in a numbered list, each under 60 characters"), and <strong>Constraints</strong> (add any rules: "avoid clickbait, no questions as titles"). Our generator builds this structure into every prompt it produces.</p>
<h3>ChatGPT vs. Claude vs. Gemini: Does the Prompt Change?</h3>
<p>Yes. Different AI models respond differently to prompt structures. Claude tends to respond best to detailed context and nuanced instructions. ChatGPT performs well with role-based prompts and step-by-step task breakdowns. Gemini excels with research-oriented prompts that ask for multiple perspectives. Our generator includes model-specific optimisations when you select your target AI tool.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What is a prompt for AI?</dt><dd class="mt-1 text-muted-foreground">An AI prompt is the input you give to an AI language model like ChatGPT, Claude, or Gemini. The quality of your prompt directly determines the quality of the output — a vague prompt produces vague results; a precise, well-structured prompt produces expert-level results.</dd></div>
  <div><dt class="font-bold text-lg">What makes a good AI prompt?</dt><dd class="mt-1 text-muted-foreground">Good prompts include: a specific role for the AI to adopt, a clear task with defined output, relevant context about your audience or goal, a specified format (list, paragraph, table), and any constraints or things to avoid. Our generator builds all five elements into every prompt it creates.</dd></div>
  <div><dt class="font-bold text-lg">Do prompts work differently on ChatGPT vs Claude vs Gemini?</dt><dd class="mt-1 text-muted-foreground">Yes. Each model has different strengths and responds differently to prompt styles. Claude responds well to detailed context; ChatGPT to role-based framing; Gemini to research and multi-perspective requests. Our generator includes model-specific optimisations when you select your target tool.</dd></div>
  <div><dt class="font-bold text-lg">Is the AI Prompt Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required. Generate expert-level prompts for any AI task as many times as you like.</dd></div>
</dl>`,
  },
  {
    slug: "midjourney-prompt-generator",
    howToGuide: `<h2>How to Use the Midjourney Prompt Generator</h2>
<ol>
  <li><strong>Describe your image concept</strong> — Enter what you want to create: subject, mood, setting, style, and any specific elements you need. The more detail, the more accurate the result.</li>
  <li><strong>Choose an art style</strong> — Photorealistic, cinematic, illustration, oil painting, anime, concept art, minimalist, or surrealist. The generator uses the correct Midjourney style parameters for each.</li>
  <li><strong>Select aspect ratio</strong> — Portrait (9:16 for Reels/TikTok), landscape (16:9 for YouTube thumbnails), or square (1:1 for Instagram posts).</li>
  <li><strong>Generate the prompt</strong> — Get a Midjourney-optimised prompt complete with subject description, style keywords, lighting descriptors, and the correct parameter syntax (--ar, --v, --style).</li>
  <li><strong>Paste into Midjourney</strong> — Copy the full prompt and paste it directly into Midjourney's /imagine command. No editing required.</li>
</ol>`,
    seoContent: `<h2>Why Midjourney Prompt Crafting Is Its Own Skill</h2>
<p>Midjourney produces stunning results when given precise, well-structured prompts — and disappointing, generic images when given vague ones. The challenge is that Midjourney's prompt language is highly specific: it responds to particular style keywords, photography terms, lighting descriptions, and parameter syntax that most users have never learned. Our Midjourney Prompt Generator translates your creative vision into the exact language Midjourney understands.</p>
<h3>How Midjourney Reads Your Prompt</h3>
<p>Midjourney weights the beginning of your prompt more heavily than the end. This means your subject and primary concept should come first, followed by style descriptors, then lighting and mood, then any negative prompts or parameters. Getting this order wrong results in the AI emphasising the wrong elements of your request. Our generator automatically structures prompts in the correct priority order.</p>
<h3>Midjourney for Content Creators: Practical Use Cases</h3>
<p>Content creators use Midjourney for: YouTube thumbnail backgrounds (generate a dramatic scene, then add text in Canva), Instagram aesthetic posts and art content, blog post featured images, brand mood boards, product mockups, social media graphics, and TikTok visual content. The generator includes use-case specific prompt patterns for each of these applications so your output is ready to use immediately without extensive post-processing.</p>
<h3>Midjourney Parameters You Need to Know</h3>
<p><code>--ar 16:9</code> sets landscape aspect ratio for YouTube thumbnails. <code>--ar 9:16</code> sets portrait for Reels and TikTok. <code>--v 6</code> uses Midjourney's latest model. <code>--style raw</code> reduces aesthetic processing for more photorealistic results. <code>--no text</code> prevents Midjourney from adding illegible text to images. Our generator includes the correct parameters automatically based on your selections.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What is a Midjourney prompt?</dt><dd class="mt-1 text-muted-foreground">A Midjourney prompt is the text instruction you give to Midjourney's AI image generator via the /imagine command. It describes the subject, style, mood, lighting, and technical parameters of the image you want to create. Better prompts produce dramatically better images.</dd></div>
  <div><dt class="font-bold text-lg">What style keywords work best in Midjourney?</dt><dd class="mt-1 text-muted-foreground">Highly effective Midjourney style keywords include: "cinematic lighting," "golden hour," "shot on Sony A7IV," "8K," "photorealistic," "concept art," "trending on ArtStation," "studio lighting," "bokeh," and specific artist name references. Our generator includes the most effective style descriptors for your chosen art style.</dd></div>
  <div><dt class="font-bold text-lg">What aspect ratio should I use for YouTube thumbnails in Midjourney?</dt><dd class="mt-1 text-muted-foreground">Use --ar 16:9 for YouTube thumbnails. For Instagram posts use --ar 1:1, for Reels and TikTok use --ar 9:16, and for Pinterest use --ar 2:3. Our generator sets the correct aspect ratio parameter automatically based on your selected platform.</dd></div>
  <div><dt class="font-bold text-lg">Is the Midjourney Prompt Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required. Generate Midjourney prompts for any image concept as many times as you like.</dd></div>
</dl>`,
  },
];

async function run() {
  let updated = 0;
  for (const tool of tools) {
    await db.update(toolsTable).set({
      howToGuide: tool.howToGuide,
      seoContent: tool.seoContent,
      faqContent: tool.faqContent,
    }).where(eq(toolsTable.slug, tool.slug));
    console.log(`✓ ${tool.slug}`);
    updated++;
  }
  console.log(`\nDone — ${updated}/${tools.length} tools updated.`);
  await pool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
