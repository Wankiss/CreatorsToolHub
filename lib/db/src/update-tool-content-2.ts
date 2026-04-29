import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { toolsTable } from "./schema/index.js";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const tools = [
  {
    slug: "youtube-channel-name-generator",
    howToGuide: `<h2>How to Use the YouTube Channel Name Generator</h2>
<ol>
  <li><strong>Describe your channel</strong> — Enter your niche, content style, and target audience. Example: "fitness for busy moms over 35."</li>
  <li><strong>Pick a style</strong> — Choose from personal brand (your name), niche keyword, brandable word, or creative mashup styles.</li>
  <li><strong>Generate</strong> — Get a list of unique channel name ideas tailored to your niche and tone.</li>
  <li><strong>Check availability</strong> — Search each name on YouTube and also check the matching domain and social handles are available before committing.</li>
  <li><strong>Pick a name you can grow into</strong> — Avoid hyper-specific names that box you in if your content evolves. A name like "BudgetTravels" limits you; "WanderWithAlex" does not.</li>
</ol>`,
    seoContent: `<h2>How to Choose a YouTube Channel Name That Grows With You</h2>
<p>Your channel name is the first thing a viewer reads before deciding whether to click Subscribe. It signals your niche, your personality, and whether you're a person worth following. A strong YouTube channel name is memorable, easy to spell, and searchable — and it still fits your content three years from now when your channel has evolved.</p>
<h3>Personal Brand vs. Niche Name</h3>
<p>Personal brand names (your own name, or a creative personal handle) give you maximum flexibility — you can pivot content without a rebrand. Niche names ("QuickFitness," "TravelHacksPro") rank faster for keyword searches but trap you in a single topic. Most successful long-term YouTubers use personal brands; most fast-growing niche channels start with keyword-rich names.</p>
<h3>What Makes a Name Memorable</h3>
<p>The best channel names are 2–3 syllables, contain no numbers or special characters, are easy to say out loud, and pass the "radio test" — if someone heard your channel name mentioned in a podcast, could they find it on YouTube by spelling it correctly? Names that fail this test lose subscribers before they even visit the channel.</p>
<h3>YouTube Name SEO</h3>
<p>Your channel name appears in YouTube's search results alongside your videos. If your channel name includes a keyword people actually search for ("DIY Home Repairs"), you get a passive SEO boost every time a related video ranks. Our generator balances brandability with search relevance so you don't have to choose between the two.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">Can I change my YouTube channel name later?</dt><dd class="mt-1 text-muted-foreground">Yes. You can change your YouTube channel name at any time in YouTube Studio under Customisation. However, changing a well-established name confuses existing subscribers and resets any brand recognition you've built — get it right early.</dd></div>
  <div><dt class="font-bold text-lg">Should my channel name match my username?</dt><dd class="mt-1 text-muted-foreground">Ideally yes. Consistent branding across YouTube, Instagram, TikTok, and Twitter makes you easier to find and remember. Our generator helps you find names where the handle is likely available across platforms.</dd></div>
  <div><dt class="font-bold text-lg">How long should a YouTube channel name be?</dt><dd class="mt-1 text-muted-foreground">Keep it under 20 characters so it displays fully in search results and on mobile. Shorter names are easier to remember — aim for 2–3 words maximum.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Channel Name Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, 100% free. No sign-up or account required. Generate as many name ideas as you need.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-video-idea-generator",
    howToGuide: `<h2>How to Use the YouTube Video Idea Generator</h2>
<ol>
  <li><strong>Enter your niche or channel topic</strong> — Be specific: "personal finance for college students" gets better ideas than "money."</li>
  <li><strong>Select a content format</strong> — Tutorial, listicle, reaction, vlog, story time, or documentary style.</li>
  <li><strong>Generate</strong> — Get 10 video idea suggestions complete with a suggested title, angle, and why the idea has audience demand.</li>
  <li><strong>Validate with search</strong> — Before filming, search each idea on YouTube to gauge competition and confirm people are looking for that content.</li>
  <li><strong>Build a content calendar</strong> — Pick your 4–6 favourite ideas and schedule them across the next month so you always have a clear plan.</li>
</ol>`,
    seoContent: `<h2>Never Run Out of YouTube Video Ideas Again</h2>
<p>Creator's block is one of the biggest reasons YouTube channels go dormant. You know you should post consistently, but you stare at a blank page with no idea what to make. Our YouTube Video Idea Generator solves that in seconds — giving you a pipeline of validated, audience-relevant ideas you can start filming immediately.</p>
<h3>How to Find Ideas That Actually Get Views</h3>
<p>The best YouTube video ideas sit at the intersection of what your audience is actively searching for and what you're qualified to deliver. Keyword research tells you what people want; your niche expertise tells you what you can make well. Our generator combines both — it surfaces ideas with genuine search demand that fit your stated niche and content style.</p>
<h3>Evergreen vs. Trending Ideas</h3>
<p>Trending ideas can spike your views quickly but decay fast. Evergreen ideas ("How to change a car tyre") keep getting views for years. The healthiest YouTube channel mix is roughly 70% evergreen content that builds long-term traffic, 30% trend-responsive content for spikes and subscriber growth. Our generator flags which type each idea falls into so you can plan your content mix strategically.</p>
<h3>Turning One Idea Into a Content Series</h3>
<p>A single strong idea is often the seed of a full series. "My first month investing $100" naturally leads to "Month 2," "3 things I learned after 6 months," and "My first $1,000." Series content builds watch-time per viewer and trains the algorithm to recommend your videos in sequence. Our generator highlights which ideas have series potential.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How do I know if a video idea will get views?</dt><dd class="mt-1 text-muted-foreground">Search the idea on YouTube before filming. If multiple videos on the same topic have strong view counts from channels similar in size to yours, there's proven audience demand. If only massive channels cover it, the niche may be too competitive for a new channel.</dd></div>
  <div><dt class="font-bold text-lg">How often should I post on YouTube?</dt><dd class="mt-1 text-muted-foreground">Consistency matters more than frequency. One well-researched video per week beats five rushed videos. The YouTube algorithm rewards consistent upload schedules because they signal an active, reliable creator.</dd></div>
  <div><dt class="font-bold text-lg">Can I reuse ideas from other creators?</dt><dd class="mt-1 text-muted-foreground">Yes — YouTube is full of videos on the same topics. What matters is your angle, perspective, and quality. A unique take on a popular idea often outperforms the original. Focus on adding value the existing videos don't offer.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Video Idea Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account required. Generate fresh ideas for any niche whenever you need them.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-keyword-generator",
    howToGuide: `<h2>How to Use the YouTube Keyword Generator</h2>
<ol>
  <li><strong>Enter your seed topic</strong> — Type the broad subject of your video. The tool will expand it into specific keyword variations people actually search for.</li>
  <li><strong>Review keyword suggestions</strong> — The generator returns a mix of short-tail (broad, high-volume) and long-tail (specific, lower-competition) keyword ideas.</li>
  <li><strong>Prioritise long-tail keywords for new channels</strong> — If your channel is under 10,000 subscribers, target long-tail keywords where smaller channels can rank. Competing for "weight loss" will not work; "weight loss meal prep for beginners" might.</li>
  <li><strong>Embed keywords naturally</strong> — Use your chosen keyword in the video title, first 150 characters of the description, and speak it naturally within the first 30 seconds of your video.</li>
  <li><strong>Group related keywords</strong> — If multiple related keywords all have demand, plan a series of videos to dominate that topic cluster rather than trying to fit every keyword into one video.</li>
</ol>`,
    seoContent: `<h2>YouTube Keyword Research: Why It Determines Your Channel's Growth</h2>
<p>YouTube keyword research is the process of finding the exact phrases your target audience types into the YouTube search bar. When you create videos optimised for those phrases, YouTube places your content in front of people already looking for what you make. This is the difference between hoping people find your videos and actively engineering it.</p>
<h3>The Difference Between YouTube and Google Keywords</h3>
<p>YouTube searches tend to be more action-oriented and conversational than Google searches. People type "how to cook rice without a rice cooker" on YouTube, not just "rice cooker." They use YouTube to learn, be entertained, or solve a problem. Your keyword strategy should reflect this — target phrases that start with "how to," "best," "review," "why," or are explicitly instructional.</p>
<h3>Long-Tail Keywords: The New Creator's Best Friend</h3>
<p>A long-tail keyword is a specific search phrase — usually 4 or more words — with lower search volume but far lower competition. New channels that target long-tail keywords start getting views within days of posting because they're not competing against established channels. Over time, ranking for dozens of long-tail keywords builds more cumulative traffic than fighting for a handful of broad terms.</p>
<h3>Using Keywords Across Title, Description, and Tags</h3>
<p>The most effective YouTube SEO uses the same core keyword in three places: the video title (front-loaded), the first sentence of the description, and in the spoken content of the video itself (which YouTube indexes via auto-captions). Reinforcing the keyword across all three touchpoints sends a consistent relevance signal that improves your ranking probability significantly.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What is a YouTube keyword?</dt><dd class="mt-1 text-muted-foreground">A YouTube keyword is a word or phrase that people type into YouTube's search bar. Optimising your videos for these keywords makes YouTube more likely to surface your content when people search for those terms.</dd></div>
  <div><dt class="font-bold text-lg">What is a long-tail keyword and why should I use it?</dt><dd class="mt-1 text-muted-foreground">Long-tail keywords are specific phrases with 4+ words — like "how to lose belly fat in 2 weeks without gym." They have lower search volume but far less competition, making them ideal for new channels that can't yet compete for broad terms.</dd></div>
  <div><dt class="font-bold text-lg">How do I use YouTube keywords effectively?</dt><dd class="mt-1 text-muted-foreground">Place your main keyword in the video title (ideally at the start), in the first 1–2 sentences of the description, and say it naturally in your spoken content within the first 30 seconds. Reinforcing it across all three signals YouTube's ranking system.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Keyword Generator free?</dt><dd class="mt-1 text-muted-foreground">Yes, 100% free. No account or sign-up needed. Generate keyword ideas for any YouTube topic whenever you need them.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-title-analyzer",
    howToGuide: `<h2>How to Use the YouTube Title Analyzer</h2>
<ol>
  <li><strong>Enter your proposed title</strong> — Type or paste the YouTube title you want to analyse.</li>
  <li><strong>Review the score breakdown</strong> — The analyzer checks your title for length, keyword placement, emotional triggers, clarity, and click-through rate potential.</li>
  <li><strong>Read the specific suggestions</strong> — Each scoring factor comes with actionable advice on how to improve that element of your title.</li>
  <li><strong>Revise and re-analyse</strong> — Edit your title based on the feedback and run it through the analyzer again until you're satisfied with the score.</li>
  <li><strong>Compare multiple versions</strong> — Analyse 2–3 title variants to find the strongest option before you publish.</li>
</ol>`,
    seoContent: `<h2>What Makes a YouTube Title Score High (and Get Clicks)</h2>
<p>Not all YouTube titles are equal. A title can be grammatically correct and completely fail to generate clicks. Our YouTube Title Analyzer breaks down the science behind what makes viewers click — so you can fix your titles before they go live rather than after a video underperforms.</p>
<h3>The Five Factors That Determine Title Performance</h3>
<p><strong>Length</strong>: Titles between 50–60 characters display fully in search results. Longer titles get truncated, and the cut-off is often at the worst possible point. <strong>Keyword placement</strong>: Front-loading your main keyword tells YouTube's algorithm exactly what the video is about from the very first word. <strong>Emotional triggers</strong>: Words like "proven," "mistakes," "secret," "fast," and "finally" increase CTR because they promise specific, high-value outcomes. <strong>Clarity</strong>: Clever titles that sacrifice clarity for wit underperform. Viewers skim — they need to understand instantly what they'll get. <strong>Curiosity gap</strong>: Titles that hint at something without fully revealing it create the psychological itch that makes people click.</p>
<h3>Why Title Testing Matters</h3>
<p>YouTube Studio's A/B title testing feature lets you test two versions of a title on the same video. Creators who regularly test titles see 30–50% higher CTR than those who publish one title and leave it. The analyzer gives you the pre-test intelligence — flagging weak spots before you even publish.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What does the YouTube Title Analyzer check for?</dt><dd class="mt-1 text-muted-foreground">It evaluates title length, keyword placement, emotional trigger words, clarity, curiosity gap, and overall click-through rate potential — giving you a score and specific improvement suggestions for each factor.</dd></div>
  <div><dt class="font-bold text-lg">What is a good YouTube title score?</dt><dd class="mt-1 text-muted-foreground">A score above 70% indicates a strong title likely to perform well. Below 50% usually means the title is too long, missing keywords, or lacks emotional hooks. Use the suggestions to revise until you hit at least 70%.</dd></div>
  <div><dt class="font-bold text-lg">Should I change a title after a video is published?</dt><dd class="mt-1 text-muted-foreground">Yes. Changing an underperforming title is one of the most effective ways to revive a video that didn't get traction. YouTube re-indexes the new title and can start recommending the video to new audiences.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Title Analyzer free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account required.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-seo-score-checker",
    howToGuide: `<h2>How to Use the YouTube SEO Score Checker</h2>
<ol>
  <li><strong>Enter your video details</strong> — Input your video title, description, and tags so the tool can analyse all your metadata together.</li>
  <li><strong>Run the check</strong> — The tool scores your video's SEO across the main ranking factors YouTube considers.</li>
  <li><strong>Review each factor</strong> — See exactly which elements are strong, which need work, and what specific changes will improve your score most.</li>
  <li><strong>Fix the flagged issues</strong> — Use our other tools (Title Generator, Description Generator, Tag Generator) to quickly improve each weak element.</li>
  <li><strong>Re-check until 80%+</strong> — Re-run the checker after making changes. Aim for an overall SEO score above 80% before publishing or updating your video metadata.</li>
</ol>`,
    seoContent: `<h2>Why Your YouTube Video's SEO Score Matters</h2>
<p>Every YouTube video competes for position in search results and suggested feeds. The videos that consistently appear at the top aren't always the best content — they're the best-optimised content. YouTube's algorithm can't watch your video to judge its quality; it reads your metadata. An optimised title, description, and tag set tells YouTube exactly what your video is about and who should see it.</p>
<h3>What YouTube's Algorithm Actually Reads</h3>
<p>YouTube's ranking algorithm evaluates your video metadata across multiple touchpoints: the title (highest weight), the description (strong secondary signal), tags (lower but still useful), closed captions/auto-transcripts, chapter markers, end screens, and even the filename of the video you upload. Most creators only optimise the title — leaving significant SEO value on the table.</p>
<h3>Common SEO Mistakes That Hurt Rankings</h3>
<p>The most common YouTube SEO errors are: putting the keyword at the end of the title instead of the beginning, writing a description that's just links and hashtags with no text, using irrelevant tags to chase popular searches, and ignoring chapters (which YouTube indexes individually, effectively giving one video multiple entry points in search). Our SEO checker flags all of these automatically.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What factors does the YouTube SEO Score Checker analyse?</dt><dd class="mt-1 text-muted-foreground">It checks your title (keyword placement, length, CTR potential), description (keyword density, length, link structure), tags (relevance, quantity), and overall metadata consistency — giving a composite SEO score with specific improvement actions.</dd></div>
  <div><dt class="font-bold text-lg">What is a good YouTube SEO score?</dt><dd class="mt-1 text-muted-foreground">Aim for 80% or above. Videos scoring below 60% typically have major metadata gaps — a missing keyword in the title, a description that's too short, or irrelevant tags — that directly limit their searchability.</dd></div>
  <div><dt class="font-bold text-lg">Does better SEO always mean more views?</dt><dd class="mt-1 text-muted-foreground">Better SEO improves discoverability — it helps YouTube surface your video to relevant searches. But views ultimately depend on your thumbnail and title convincing people to click. SEO gets you found; CTR and watch time get you recommended.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube SEO Score Checker free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-money-calculator",
    howToGuide: `<h2>How to Use the YouTube Money Calculator</h2>
<ol>
  <li><strong>Enter your video metrics</strong> — Input your estimated monthly views, average view duration, and your channel's primary country/niche.</li>
  <li><strong>Select your niche</strong> — Different niches have drastically different CPM rates. Finance and business content earns 5–10x more per 1,000 views than gaming or entertainment.</li>
  <li><strong>Review the estimate</strong> — The calculator shows your estimated monthly AdSense earnings based on current average CPM rates for your niche and region.</li>
  <li><strong>Understand the range</strong> — The estimate shows a low, mid, and high scenario because actual earnings depend on your audience's geography, watch time, ad format, and seasonality.</li>
  <li><strong>Factor in non-AdSense revenue</strong> — For most successful creators, AdSense is only 30–50% of total income. Add sponsorships, merch, and memberships to get your real earning potential.</li>
</ol>`,
    seoContent: `<h2>How Much Do YouTubers Actually Make? A Realistic Breakdown</h2>
<p>The numbers you see in "I made $X from YouTube" videos are usually cherry-picked from peak months in high-CPM niches. The reality is more nuanced. YouTube earnings vary enormously based on niche, audience geography, video length, and time of year. Our YouTube Money Calculator gives you an honest, data-driven estimate based on the actual variables that affect your specific channel.</p>
<h3>CPM vs. RPM: What You're Actually Paid</h3>
<p>CPM (Cost Per Mille) is what advertisers pay YouTube per 1,000 ad impressions. RPM (Revenue Per Mille) is what you, the creator, actually receive — typically 45–55% of CPM after YouTube takes its cut. A channel with a $10 CPM earns around $4.50–$5.50 RPM. Most creators quote RPM when discussing earnings because it reflects their actual bank account, not the gross advertising spend.</p>
<h3>Which Niches Earn the Most on YouTube</h3>
<p>Finance, legal, insurance, real estate, and B2B software content consistently commands the highest CPMs ($15–$50+) because advertisers in these categories pay premium rates to reach high-intent audiences. Gaming, entertainment, and lifestyle content typically earns $1–$5 RPM. Knowing your niche's CPM range helps you realistically plan the view counts you need to hit income goals.</p>
<h3>When Does YouTube Pay?</h3>
<p>YouTube pays creators through AdSense, with payments processed between the 21st and 26th of each month for the previous month's earnings. You need a minimum balance of $100 to trigger a payment, and you must have over 1,000 subscribers and 4,000 watch hours (or 10 million Shorts views) to qualify for monetisation.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How much does YouTube pay per 1,000 views?</dt><dd class="mt-1 text-muted-foreground">YouTube RPM (what creators actually receive) typically ranges from $1–$5 for entertainment/lifestyle content, $3–$10 for education and how-to content, and $10–$50+ for finance, legal, and business niches. The wide range reflects differences in advertiser demand by niche and audience geography.</dd></div>
  <div><dt class="font-bold text-lg">How many views do I need to make $1,000 per month on YouTube?</dt><dd class="mt-1 text-muted-foreground">At an average RPM of $3, you'd need roughly 333,000 monthly views. At $5 RPM, around 200,000 views. Higher-CPM niches like finance can hit $1,000/month with as few as 50,000–100,000 views.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Money Calculator accurate?</dt><dd class="mt-1 text-muted-foreground">It provides a realistic range based on average CPM data by niche and region. Actual earnings vary based on your specific audience's ad-click behaviour, ad format mix, and seasonality (Q4 typically earns 30–50% more due to holiday ad spend).</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Money Calculator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free. No account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-shorts-revenue-calculator",
    howToGuide: `<h2>How to Use the YouTube Shorts Revenue Calculator</h2>
<ol>
  <li><strong>Enter your monthly Shorts views</strong> — Input your average monthly view count across all your Shorts content.</li>
  <li><strong>Select your niche</strong> — Shorts RPM varies by content category just like long-form video.</li>
  <li><strong>Review the estimate</strong> — The calculator shows estimated monthly earnings from the YouTube Shorts monetisation program based on current pool allocation rates.</li>
  <li><strong>Compare with long-form RPM</strong> — Use this alongside the standard YouTube Money Calculator to see whether Shorts or long-form content generates better returns per view for your niche.</li>
</ol>`,
    seoContent: `<h2>YouTube Shorts Monetisation: What Creators Actually Earn</h2>
<p>YouTube Shorts monetisation works differently from regular videos. Instead of direct AdSense ads on each video, YouTube pools revenue from ads shown between Shorts and distributes it to eligible creators monthly based on their share of total Shorts views in the pool. This means Shorts RPM is typically lower than long-form — usually $0.03–$0.07 per 1,000 views — but the viral potential of Shorts means view counts can be much higher.</p>
<h3>Shorts vs. Long-Form: Which Earns More?</h3>
<p>On a per-view basis, long-form videos almost always earn significantly more than Shorts. A 10-minute video with 100,000 views might earn $300–$500 at a $3–$5 RPM. The same 100,000 Shorts views might earn $3–$7. However, Shorts can reach millions of views far more easily than long-form — making total Shorts revenue competitive for creators who successfully go viral. The strategic answer is to use Shorts for audience growth and long-form for monetisation.</p>
<h3>Qualifying for YouTube Shorts Monetisation</h3>
<p>To earn from Shorts, you need to be in the YouTube Partner Program. The entry-level YPP tier requires 500 subscribers and 3 million Shorts views in the last 90 days. The full monetisation tier requires 1,000 subscribers and either 4,000 long-form watch hours or 10 million Shorts views in 90 days.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">How much does YouTube pay for Shorts views?</dt><dd class="mt-1 text-muted-foreground">YouTube Shorts RPM typically ranges from $0.03 to $0.07 per 1,000 views — significantly less than long-form video. The exact rate depends on your niche and your monthly share of the Shorts revenue pool.</dd></div>
  <div><dt class="font-bold text-lg">How many Shorts views do I need to make $100?</dt><dd class="mt-1 text-muted-foreground">At $0.05 RPM, you'd need approximately 2 million Shorts views to earn $100 from the Shorts fund. This is why most creators treat Shorts as a growth and audience-building tool rather than a primary revenue stream.</dd></div>
  <div><dt class="font-bold text-lg">Do Shorts views count toward YouTube Partner Program eligibility?</dt><dd class="mt-1 text-muted-foreground">Yes. 10 million Shorts views in the last 90 days counts as an alternative to 4,000 long-form watch hours for full YPP eligibility. Shorts views do not count toward the 4,000 watch hour threshold — they have their own separate pathway.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Shorts Revenue Calculator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-cpm-calculator",
    howToGuide: `<h2>How to Use the YouTube CPM Calculator</h2>
<ol>
  <li><strong>Enter your CPM rate</strong> — Input the CPM figure from your YouTube Analytics dashboard (found under Revenue &gt; CPM).</li>
  <li><strong>Enter your monthly views</strong> — Input the total monetised views (not total views — only views where an ad was shown count).</li>
  <li><strong>Calculate</strong> — The tool returns your estimated gross revenue, YouTube's 45% cut, and your net RPM and earnings.</li>
  <li><strong>Use it for forecasting</strong> — Change the view numbers to model what your earnings would look like at 2x, 5x, or 10x your current views.</li>
</ol>`,
    seoContent: `<h2>CPM, RPM, and YouTube Revenue: What Every Creator Needs to Know</h2>
<p>CPM and RPM are the two most important numbers in a YouTube creator's financial life — and they're often confused. CPM (Cost Per Mille) is the rate advertisers pay per 1,000 ad impressions on your content. RPM (Revenue Per Mille) is what you actually receive after YouTube takes its 45% revenue share. Understanding the gap between these two numbers — and what drives them — is the foundation of building a sustainable YouTube income.</p>
<h3>Why CPM Fluctuates</h3>
<p>CPM rates change based on advertiser demand, which varies by niche, season, and your audience's geography. Finance and business content earns high CPMs because those advertisers pay premium rates. Q4 (October–December) consistently produces the highest CPMs of the year as advertisers compete aggressively for holiday ad space — often 50–100% higher than Q1. Knowing when your CPM peaks lets you plan your upload schedule to maximise earnings.</p>
<h3>How to Increase Your YouTube CPM</h3>
<p>You can't directly control CPM — advertisers set the rates. But you can influence it by producing content in higher-paying niches, targeting US/UK/Australian audiences who command higher ad rates, making longer videos (8+ minutes enables mid-roll ads, which significantly increases revenue per view), and improving your audience's watch time (longer watch time means more ad impressions per view).</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What is the difference between CPM and RPM on YouTube?</dt><dd class="mt-1 text-muted-foreground">CPM is what advertisers pay per 1,000 ad impressions — the gross rate. RPM is what you receive per 1,000 video views after YouTube's 45% revenue share. Your RPM is always lower than your CPM, typically around 45–55% of it.</dd></div>
  <div><dt class="font-bold text-lg">What is a good YouTube CPM?</dt><dd class="mt-1 text-muted-foreground">CPMs above $5 are solid for most niches. Finance, insurance, and B2B content regularly sees $15–$50+ CPM. Entertainment and gaming typically sees $1–$4 CPM. Your niche matters far more than your subscriber count for determining CPM.</dd></div>
  <div><dt class="font-bold text-lg">Why is my YouTube CPM so low in January?</dt><dd class="mt-1 text-muted-foreground">January has the lowest advertiser budgets of the year because Q4 holiday campaigns have ended and new annual budgets haven't ramped up yet. CPMs typically drop 30–50% in January compared to December — this is normal for all channels.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube CPM Calculator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-engagement-calculator",
    howToGuide: `<h2>How to Use the YouTube Engagement Calculator</h2>
<ol>
  <li><strong>Enter your video stats</strong> — Input your view count, like count, comment count, and subscriber count.</li>
  <li><strong>Calculate</strong> — The tool computes your engagement rate as a percentage and benchmarks it against average rates for your subscriber tier.</li>
  <li><strong>Interpret your score</strong> — See whether your engagement is below average, average, above average, or excellent for your channel size.</li>
  <li><strong>Identify weak metrics</strong> — If your likes are strong but comments are low, it signals viewers enjoy the content but aren't prompted to interact. Adjust your CTAs accordingly.</li>
</ol>`,
    seoContent: `<h2>YouTube Engagement Rate: Why It Predicts Growth Better Than Views</h2>
<p>A video with 100,000 views and 200 comments is underperforming compared to a video with 10,000 views and 500 comments. Engagement rate — the ratio of meaningful interactions to total views — is one of YouTube's strongest quality signals. High engagement tells the algorithm your content sparks genuine reaction, which triggers wider recommendation distribution.</p>
<h3>What Counts as Engagement on YouTube</h3>
<p>YouTube tracks several engagement signals: likes (lightweight engagement), comments (strongest signal — requires active effort), shares (most powerful — signals the content is worth spreading), saves to playlists, and subscribe actions from non-subscribers. Our calculator weights these signals to give you a composite engagement score that reflects how the algorithm actually values each interaction type.</p>
<h3>Average YouTube Engagement Rates by Channel Size</h3>
<p>Smaller channels typically see higher engagement rates because their audiences are more tightly connected to the creator. Channels under 10,000 subscribers often see 5–10% engagement. Channels with 100,000+ subscribers average 2–5%. Mega-channels (1M+) often see 1–2%. If you're below average for your tier, focus on ending videos with specific questions to drive comments and adding clear like CTAs within the first 30 seconds.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">What is a good YouTube engagement rate?</dt><dd class="mt-1 text-muted-foreground">For channels under 10,000 subscribers, 5–10% is strong. For 10,000–100,000 subscribers, 3–6% is healthy. Above 100,000 subscribers, 1–3% is typical. Higher engagement at any size signals a loyal, active audience that the algorithm rewards with wider distribution.</dd></div>
  <div><dt class="font-bold text-lg">How do I increase YouTube engagement?</dt><dd class="mt-1 text-muted-foreground">End videos with a specific question that prompts comments. Add a like CTA within the first 30 seconds (viewers who watch to the end often forget to like). Reply to every comment in your first 24 hours — it signals to YouTube that your video is generating conversation and often triggers extra distribution.</dd></div>
  <div><dt class="font-bold text-lg">Does engagement rate affect YouTube search ranking?</dt><dd class="mt-1 text-muted-foreground">Yes. YouTube's algorithm uses engagement signals — especially comments and shares — as quality indicators. Videos with high engagement relative to their view count are more likely to be promoted in suggested feeds and search results.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Engagement Calculator free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free. No account or sign-up required.</dd></div>
</dl>`,
  },
  {
    slug: "youtube-thumbnail-downloader",
    howToGuide: `<h2>How to Use the YouTube Thumbnail Downloader</h2>
<ol>
  <li><strong>Copy the YouTube video URL</strong> — Go to the YouTube video whose thumbnail you want to download, copy the URL from your browser's address bar.</li>
  <li><strong>Paste the URL</strong> — Paste the video URL into the input field on the tool.</li>
  <li><strong>Select resolution</strong> — Choose from maxresdefault (1280×720, best quality), hqdefault (480×360), or mqdefault (320×180) depending on your use case.</li>
  <li><strong>Download</strong> — Click Download to save the thumbnail image directly to your device.</li>
  <li><strong>Use responsibly</strong> — Downloaded thumbnails are useful for competitive research, inspiration, and reference. Do not reuse another creator's thumbnail as your own or for commercial purposes without permission.</li>
</ol>`,
    seoContent: `<h2>Why Creators Download YouTube Thumbnails</h2>
<p>Downloading YouTube thumbnails is a common and legitimate practice in the creator community. Thumbnail research — analysing what works for top-performing videos in your niche — is one of the fastest ways to improve your own CTR. By studying the colour schemes, facial expressions, text placement, and composition of high-performing thumbnails, you can reverse-engineer what drives clicks in your category.</p>
<h3>Thumbnail Research: The Fastest Way to Improve CTR</h3>
<p>Before designing a thumbnail for your next video, search your target keyword on YouTube and download the thumbnails of the top 5 results. Look for patterns: do they use red and yellow? Close-up faces with exaggerated expressions? Bold three-word text? These patterns exist because they've been A/B tested millions of times. Use the research to inform your own design rather than copying directly.</p>
<h3>Technical Thumbnail Specs for YouTube</h3>
<p>YouTube's recommended thumbnail size is 1280×720 pixels (16:9 aspect ratio) with a maximum file size of 2MB. JPG, GIF, BMP, or PNG formats are all supported. Our downloader fetches the highest available resolution so you always get a sharp reference image for your design work.</p>`,
    faqContent: `<dl class="space-y-6">
  <div><dt class="font-bold text-lg">Is it legal to download YouTube thumbnails?</dt><dd class="mt-1 text-muted-foreground">Downloading thumbnails for personal research, competitive analysis, and design inspiration is generally accepted practice. However, thumbnails are copyrighted by their creators — do not reuse or republish another creator's thumbnail without permission.</dd></div>
  <div><dt class="font-bold text-lg">What resolution are YouTube thumbnails?</dt><dd class="mt-1 text-muted-foreground">YouTube's maximum thumbnail resolution is 1280×720 pixels (called maxresdefault). Some older videos only have lower-resolution thumbnails available (hqdefault at 480×360). Our tool automatically fetches the highest available resolution.</dd></div>
  <div><dt class="font-bold text-lg">Why would I download my own YouTube thumbnail?</dt><dd class="mt-1 text-muted-foreground">Creators often download their own thumbnails for social media repurposing, portfolio building, backup purposes, or when they no longer have the original design file and need to recreate or update a thumbnail.</dd></div>
  <div><dt class="font-bold text-lg">Is the YouTube Thumbnail Downloader free?</dt><dd class="mt-1 text-muted-foreground">Yes, completely free with no account or sign-up required.</dd></div>
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
