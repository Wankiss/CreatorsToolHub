import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { ToolCard } from "@/components/tool-card";
import { ChevronDown, ExternalLink } from "lucide-react";

interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  usageCount: number;
  isActive?: boolean;
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tools: Tool[];
}

interface Props {
  category: CategoryData;
}

const FAQS = [
  {
    q: "What Instagram tools do I need to grow my account?",
    a: "The highest-impact Instagram tools for account growth are a hashtag generator (to expand reach on every post), a caption generator (to drive comments and saves), a hook generator (to stop the scroll on Reels), and an engagement calculator (to benchmark your performance). Start with hashtags and captions — they directly affect how Instagram's algorithm distributes your content to non-followers.",
  },
  {
    q: "How do Instagram hashtags work in 2025?",
    a: "Instagram's algorithm uses hashtags to categorize content and surface it to users who follow or search those tags. When you post with relevant hashtags, your content enters a hashtag feed where users can discover it independently of your follower count. In 2025, hashtag relevance and specificity matter more than sheer volume — a niche hashtag with 50,000 posts is often more effective than a viral one with 50 million because the competition is lower and the audience is more targeted.",
  },
  {
    q: "How many hashtags should I use on Instagram?",
    a: "Instagram officially supports up to 30 hashtags per post, but research consistently shows that 8–15 well-targeted hashtags outperform batches of 30 generic ones. Use a tiered strategy: 3–5 broad niche hashtags (100K–1M posts), 4–6 mid-range hashtags (10K–100K posts), and 2–4 micro hashtags under 10K posts for highly targeted discovery. Our Instagram Hashtag Generator builds this tiered mix automatically based on your content niche.",
  },
  {
    q: "What makes a great Instagram caption in 2025?",
    a: "A high-performing Instagram caption does three things: (1) opens with a hook that forces the viewer to tap 'more' — a bold statement, a surprising fact, or an incomplete thought; (2) delivers value or storytelling in the body that earns a save or share; and (3) ends with a micro-CTA that triggers comments — a question, a poll prompt, or a fill-in-the-blank. Captions that generate comments are weighted heavily by the algorithm, because comments signal deep audience engagement. Our Instagram Caption Generator structures captions around all three elements.",
  },
  {
    q: "How do I write an Instagram bio that converts visitors into followers?",
    a: "An effective Instagram bio answers three questions in 150 characters or fewer: Who are you? What value do I get from following you? Why should I follow you now? Include one clear niche signal (e.g., 'Fitness tips for busy moms'), one unique value proposition (e.g., '15-min workouts only'), and one call-to-action or link prompt (e.g., 'Free workout plan below ↓'). Avoid vague descriptions, excessive emojis with no context, and missing CTAs. The Instagram Bio Generator creates 10 profile-ready variations optimized for the 150-character limit.",
  },
  {
    q: "How much money can I make on Instagram?",
    a: "Instagram income comes from five main streams: brand sponsorships (the largest for most creators), affiliate commissions, subscription content (Instagram Subscriptions), Reels Play bonus programs (where available), and product or service sales. A creator with 10,000 highly-engaged followers in a valuable niche (finance, fitness, business) can realistically earn $500–$2,000/month from brand deals alone. Micro-influencers often earn more per follower than mega-influencers because brands pay a premium for high engagement rates. Use the Instagram Money Calculator to model your specific earning potential.",
  },
  {
    q: "What is a good Instagram engagement rate?",
    a: "Instagram engagement rate (likes + comments + saves ÷ followers × 100) varies by account size. Nano-influencers (1K–10K followers) typically see 4–8% engagement; micro-influencers (10K–100K) see 2–4%; macro-influencers (100K–1M) typically see 1–2%; and mega-influencers (1M+) often see below 1%. An engagement rate above the average for your tier signals strong audience loyalty and is the metric brands use most when vetting creator partnerships. Use the Instagram Engagement Calculator to benchmark your account.",
  },
  {
    q: "How do I get more views on Instagram Reels?",
    a: "Reels views depend primarily on three factors: hook strength (first 1–2 seconds), watch-through rate (how many viewers finish the video), and shares. The algorithm aggressively distributes Reels with high watch-through rates to non-followers. Start every Reel with a pattern-interrupt hook — a bold text overlay, an unexpected action, or a direct address ('Stop scrolling if you...'). Keep Reels under 30 seconds for maximum watch-through, and use trending audio to tap into existing distribution. The Instagram Hook Generator and Reel Idea Generator help with both the content concept and the opening line.",
  },
  {
    q: "What is an Instagram hook and why does it matter?",
    a: "An Instagram hook is the opening element of your Reel or Story — the first 1–3 seconds — that determines whether someone keeps watching or scrolls past. Instagram's algorithm measures 'hook rate' (the percentage of viewers who watch past the first 3 seconds) as a primary signal for Reels distribution. A strong hook creates immediate tension, curiosity, or relevance. Examples: 'I gained 10,000 followers by doing this one thing,' 'The Instagram algorithm just changed — here's what happened,' or 'POV: You just discovered the easiest way to [result].' The Instagram Hook Generator creates hooks in 10 proven formats for any niche.",
  },
  {
    q: "Are these Instagram tools free to use?",
    a: "All tools on Creator Toolbox are 100% free with no signup required. You can generate hashtags, captions, hooks, Reel ideas, story ideas, bio variations, username ideas, engagement reports, and revenue estimates as many times as you need without creating an account or entering a credit card. Every tool runs entirely in your browser with instant results.",
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-foreground hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        ref={bodyRef}
        style={{ maxHeight: open ? (bodyRef.current?.scrollHeight ?? 0) + "px" : "0px" }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
          {a}
        </div>
      </div>
    </div>
  );
}

const RELATED_CATEGORIES = [
  { name: "YouTube Tools", slug: "youtube-tools", icon: "▶️", desc: "Grow your YouTube channel with title generators, SEO tools, and money calculators." },
  { name: "TikTok Tools", slug: "tiktok-tools", icon: "🎵", desc: "Generate TikTok hooks, captions, scripts, and hashtags for viral content." },
  { name: "AI Creator Tools", slug: "ai-creator-tools", icon: "🤖", desc: "AI-powered tools for content ideation, copywriting, and creative workflows." },
  { name: "Text Tools", slug: "text-tools", icon: "✍️", desc: "Word counters, case converters, slug generators, and other text utilities." },
];

export function InstagramCategoryPage({ category }: Props) {
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "ig-category-faq-schema";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
        { "@type": "ListItem", position: 2, name: "Instagram Tools", item: window.location.href },
      ],
    };
    const bc = document.createElement("script");
    bc.type = "application/ld+json";
    bc.id = "ig-category-breadcrumb-schema";
    bc.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(bc);

    return () => {
      document.getElementById("ig-category-faq-schema")?.remove();
      document.getElementById("ig-category-breadcrumb-schema")?.remove();
    };
  }, []);

  const activeTools = category.tools?.filter((t) => t.isActive !== false) ?? [];

  return (
    <>
      {/* Tools Grid */}
      <section className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
              All {category.name}
              <span className="text-sm font-normal bg-muted text-muted-foreground px-3 py-1 rounded-full ml-2">
                {activeTools.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            {/* ─── SEO Article ─── */}
            <article className="mt-20 space-y-10 text-foreground">
              <header>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
                  The Best Free Instagram Tools for Content Creators in 2025
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Growing on Instagram in 2025 is no longer about posting frequently and hoping for the best.
                  The algorithm rewards content that earns engagement within the first hour, profiles that
                  convert visitors into followers, and Reels that hold attention past the 3-second mark. This
                  free Instagram toolkit gives you {activeTools.length} purpose-built tools covering every
                  stage of the Instagram content lifecycle — from Reel ideation and hook writing through to
                  monetization projections and content planning. No subscriptions, no sign-ups, instant results.
                </p>
              </header>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Instagram Hashtag Strategy: Reach New Audiences on Every Post
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Hashtags remain one of the most misunderstood growth levers on Instagram. Most creators
                  either use 30 generic tags that are too competitive to rank in, or avoid hashtags entirely
                  because they've heard conflicting advice. The truth is that a strategically layered hashtag
                  set is still one of the only ways to put your content in front of people who don't already
                  follow you — making it the fastest path to organic follower growth, especially for accounts
                  under 50,000 followers.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/instagram-hashtag-generator" className="text-primary hover:underline font-medium">
                    Instagram Hashtag Generator
                  </Link>{" "}
                  builds a tiered hashtag strategy for every post automatically. For any niche or topic you
                  enter, it returns a curated mix of broad niche hashtags (1M+ posts, for visibility),
                  mid-range hashtags (10K–100K posts, for competitive discoverability), and micro hashtags
                  (under 10K posts, for highly targeted reach where you can rank in the top posts section).
                  This three-tier approach maximizes your total discovery surface without wasting your hashtag
                  slots on oversaturated tags where new accounts can never rank.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Use 8–15 hashtags per post, applied either in the caption or the first comment — both
                  placement strategies perform equivalently. Rotate your hashtag sets across posts to prevent
                  Instagram's algorithm from flagging repetitive patterns. The Hashtag Generator makes it
                  trivial to create a fresh, targeted set for every single post rather than reusing the same
                  30 tags every time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Instagram Content Creation Tools: Captions, Hooks, Reels, and Stories
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Content on Instagram competes across four surfaces simultaneously: the main feed, the Reels
                  tab, Stories, and the Explore page. Each surface has different algorithmic priorities and
                  requires different content strategies. Creators who understand these distinctions and
                  produce content optimized for each surface grow dramatically faster than those treating all
                  Instagram content as interchangeable.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For feed posts, the{" "}
                  <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
                    Instagram Caption Generator
                  </Link>{" "}
                  creates captions that open with a scroll-stopping first line, deliver value or storytelling
                  in the body, and end with a micro-CTA designed to trigger comments. Caption quality
                  directly affects your engagement rate, which is the metric Instagram uses to decide whether
                  to push your post to the Explore page. A caption that earns 50 comments performs
                  categorically better in the algorithm than one that earns 5.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For Reels — Instagram's highest-distribution content format — the first 1–3 seconds
                  determine whether your video reaches non-followers. The{" "}
                  <Link href="/tools/instagram-hook-generator" className="text-primary hover:underline font-medium">
                    Instagram Hook Generator
                  </Link>{" "}
                  creates opening lines across 10 proven hook formats: bold statement, curiosity gap, POV
                  scenario, question hook, relatable frustration, shocking statistic, "stop scrolling" opener,
                  storytelling setup, contrast hook, and challenge hook. Each format is engineered to maximize
                  hook rate — the percentage of viewers who watch past the 3-second mark — which is
                  Instagram's primary signal for Reels distribution.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you need inspiration for what to create, the{" "}
                  <Link href="/tools/instagram-reel-idea-generator" className="text-primary hover:underline font-medium">
                    Instagram Reel Idea Generator
                  </Link>{" "}
                  produces tailored Reel concepts for your niche — each with a content angle, hook suggestion,
                  and format recommendation (talking head, text-on-screen, POV, tutorial, trending audio
                  concept). Never sit in front of a blank screen wondering what to film.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  For Stories — the most intimate Instagram touchpoint and the highest-conversion surface for
                  link clicks and product promotions — the{" "}
                  <Link href="/tools/instagram-story-idea-generator" className="text-primary hover:underline font-medium">
                    Instagram Story Idea Generator
                  </Link>{" "}
                  generates 10+ story concepts per session, including engagement-driving formats like polls,
                  this-or-that sliders, Q&amp;A prompts, countdown timers, and behind-the-scenes frameworks
                  that humanize your brand and deepen audience loyalty.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Instagram Profile Optimization: Convert Every Profile Visit into a Follow
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your Instagram profile is your landing page. Every time someone sees your Reel on the
                  Explore page, watches your Story, or gets tagged in a comment — they visit your profile
                  to decide whether to follow. The conversion rate of that visit is one of the most
                  important metrics on the platform, yet most creators leave it completely unoptimized.
                  A profile that converts 15% of visitors to followers versus 5% grows at 3× the speed
                  with identical content performance.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/instagram-bio-generator" className="text-primary hover:underline font-medium">
                    Instagram Bio Generator
                  </Link>{" "}
                  creates 10 optimized bio variations for your niche, each designed to answer the three
                  questions every profile visitor asks subconsciously: "Who is this person?", "What do I
                  get from following them?", and "Is there a reason to follow now rather than later?"
                  Every variation is validated against Instagram's 150-character limit — the length that
                  displays in full on mobile without truncation. Choose from professional, bold, minimal,
                  funny, or inspirational tones to match your brand voice.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your username is equally important — it's the text that appears in search results,
                  comment sections, Stories reposts, and Reels credits. A clean, memorable username signals
                  a professional brand and makes you easier to find by word of mouth. The{" "}
                  <Link href="/tools/instagram-username-generator" className="text-primary hover:underline font-medium">
                    Instagram Username Generator
                  </Link>{" "}
                  produces 20 username ideas across six naming styles — Personal Brand, Niche-Based,
                  Keyword Twist, Aesthetic, Bold/Viral, and Abstract — each evaluated for memorability,
                  spellability, and brand potential. Enter your name and niche to get personalized
                  combinations that feel like real creator brands, not AI-generated strings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Instagram Monetization: Calculate Your Earning Potential
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Instagram monetization is more nuanced than TikTok or YouTube because it's less
                  reliant on a single revenue stream. Most creators earn across a combination of brand
                  sponsorships, affiliate commissions, digital product sales, Instagram Subscriptions,
                  and — for eligible accounts in supported regions — the Reels Play bonus program.
                  Understanding the revenue potential of each stream at your current follower count and
                  engagement rate is essential for treating your Instagram presence as a real business.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/instagram-money-calculator" className="text-primary hover:underline font-medium">
                    Instagram Money Calculator
                  </Link>{" "}
                  models your income potential across all five streams simultaneously. Enter your follower
                  count, average post engagement rate, niche (which determines advertiser CPM rates and
                  brand deal pricing), and average post reach to see projected monthly earnings from
                  sponsored posts, affiliate content, and passive product sales. The calculator also
                  shows how your income scales as your account grows — from 5K to 500K followers — so
                  you can set specific financial milestones and work toward them systematically.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  To accurately understand your current baseline, use the{" "}
                  <Link href="/tools/instagram-engagement-calculator" className="text-primary hover:underline font-medium">
                    Instagram Engagement Calculator
                  </Link>{" "}
                  first. Enter your followers plus the likes, comments, and saves from your last 10 posts
                  to get your true average engagement rate. This number is the single most important data
                  point brands look at when vetting creator partnerships. Accounts with above-average
                  engagement rates command 20–40% higher sponsorship rates compared to accounts of the
                  same size with below-average engagement — because brands are buying attention, not follower counts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Instagram Content Planner: Build a Consistent Posting System
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Consistency is the most under-discussed Instagram growth factor. Accounts that post on a
                  predictable schedule train the algorithm to distribute their content reliably — because
                  Instagram's recommendation system assigns more distribution weight to accounts with stable
                  posting cadences. More importantly, consistent posting builds audience expectation:
                  followers who know you post every Tuesday and Thursday develop a habit of checking for
                  your content.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/instagram-content-planner" className="text-primary hover:underline font-medium">
                    Instagram Content Planner
                  </Link>{" "}
                  helps you build a structured content calendar for any posting frequency. Select your niche,
                  content pillars (educate, entertain, inspire, sell), and posting schedule, and the planner
                  returns a week-by-week content plan with post types (Reel, carousel, static image, Story),
                  topic suggestions per content pillar, and timing recommendations based on peak audience
                  activity windows.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The most effective Instagram content strategy balances four content types: 40% educational
                  content that earns saves, 30% entertaining content that earns shares, 20% personal or
                  behind-the-scenes content that earns comments, and 10% promotional content that converts
                  to sales. The Content Planner structures your calendar around this proven 40-30-20-10
                  content mix automatically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  How to Build an Instagram Growth System Using All {activeTools.length} Tools Together
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The creators who grow consistently on Instagram don't improvise — they run a repeatable
                  weekly system. Here is a workflow that integrates all {activeTools.length} tools in this
                  collection into a sustainable production pipeline:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm leading-relaxed">
                  <li>
                    <strong className="text-foreground">Monday — Ideation:</strong> Use the Reel Idea
                    Generator and Story Idea Generator to plan 3–5 pieces of content for the week.
                    Reference the Content Planner to ensure your week covers all four content pillars.
                  </li>
                  <li>
                    <strong className="text-foreground">Tuesday — Hook Writing:</strong> For each Reel
                    concept, generate 3 hook variations using the Hook Generator. Pick the one that creates
                    the most immediate tension or curiosity. Write your opening scene around that hook.
                  </li>
                  <li>
                    <strong className="text-foreground">Wednesday — Captions and Hashtags:</strong> Write
                    captions for each piece of content using the Caption Generator. Generate a fresh hashtag
                    set for each post using the Hashtag Generator — aim for 10–15 tags per post using the
                    tiered broad/mid/micro strategy.
                  </li>
                  <li>
                    <strong className="text-foreground">Thursday — Batch Film:</strong> Film all Reels and
                    capture Story content in a single session. Batch filming cuts weekly production time by
                    60–70% and produces more energetic, consistent-quality video.
                  </li>
                  <li>
                    <strong className="text-foreground">Friday — Schedule and Publish:</strong> Edit, add
                    captions, and schedule posts for your audience's peak activity windows (typically
                    7–9am, 12–2pm, and 7–9pm local time). Include your hashtag set and finalized caption.
                  </li>
                  <li>
                    <strong className="text-foreground">Monthly — Profile and Revenue Review:</strong> Update
                    your bio using the Bio Generator if your content focus has shifted. Run your latest
                    metrics through the Engagement Calculator to track your rate. Update your income
                    projections using the Money Calculator with current follower and engagement data.
                  </li>
                </ol>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This system transforms erratic posting into a consistent content engine. Instagram rewards
                  accounts that post regularly, maintain high engagement rates, and produce a diverse mix of
                  content formats. All {activeTools.length} tools in this collection are free, require no
                  account, and generate results instantly. Bookmark this page and make it the first stop in
                  your weekly Instagram workflow.
                </p>
              </section>
            </article>

            {/* ─── FAQ Section ─── */}
            <section className="mt-16" aria-labelledby="ig-faq-heading">
              <h2 id="ig-faq-heading" className="text-2xl font-bold mb-6 text-foreground">
                Frequently Asked Questions About Instagram Tools
              </h2>
              <div className="space-y-3">
                {FAQS.map((faq) => (
                  <AccordionItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </section>

            {/* ─── Related Categories ─── */}
            <section className="mt-16" aria-labelledby="ig-related-heading">
              <h2 id="ig-related-heading" className="text-2xl font-bold mb-6 text-foreground">
                Explore More Creator Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {RELATED_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="group flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <span className="text-3xl flex-shrink-0">{cat.icon}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                        {cat.name}
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* ─── Sidebar ─── */}
          <aside className="w-full lg:w-[336px] flex-shrink-0 space-y-8">
            <div className="sticky top-24 space-y-8">
              <div className="adsense-placeholder w-full h-[280px]" />

              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Why use these Instagram tools?</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-start">
                    <span className="flex-shrink-0">✅</span>
                    <span>100% free — no subscription needed</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="flex-shrink-0">⚡</span>
                    <span>Instant results — no waiting for AI processing</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="flex-shrink-0">🔒</span>
                    <span>No signup or credit card required</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="flex-shrink-0">📈</span>
                    <span>Covers every stage of the Instagram content lifecycle</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="flex-shrink-0">🎯</span>
                    <span>Built specifically for Instagram creators and brands</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="flex-shrink-0">🔄</span>
                    <span>Unlimited usage — generate as many times as you need</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-3 text-foreground">Quick Links</h3>
                <nav className="space-y-2">
                  {activeTools.slice(0, 8).map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      <span>{tool.icon}</span>
                      <span>{tool.name}</span>
                    </Link>
                  ))}
                  {activeTools.length > 8 && (
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                      +{activeTools.length - 8} more tools above
                    </p>
                  )}
                </nav>
              </div>

              <div className="adsense-placeholder w-full h-[600px]" />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
