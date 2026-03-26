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
    q: "What YouTube tools do I need to grow my channel?",
    a: "The most impactful YouTube tools for channel growth are a title generator (to craft click-worthy headlines), a tag generator (to improve discoverability), a description generator (to add SEO-rich context), and a money calculator (to set realistic revenue goals). Start with the title and tag generators — they directly affect how often YouTube recommends your videos.",
  },
  {
    q: "How does the YouTube Tag Generator work?",
    a: "The YouTube Tag Generator analyzes your video topic and keyword and then uses a 5-layer strategy to surface relevant tags: seed keywords, semantic variations, long-tail questions, related topics, and trending phrases. You get up to 30 tags displayed as individual click-to-copy boxes, with a running character counter that warns you before you hit YouTube's 500-character tag limit.",
  },
  {
    q: "What is YouTube CPM and how is it calculated?",
    a: "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions. RPM (Revenue Per Mille) is what you actually earn per 1,000 video views — typically 45–55% of CPM after YouTube's revenue share. CPM varies widely by niche ($2–$30+), geography, and time of year. Use the YouTube Money Calculator to model your exact earnings based on your CPM range, views, and monetized play rate.",
  },
  {
    q: "How many views do I need to make money on YouTube?",
    a: "To qualify for the YouTube Partner Program you need 1,000 subscribers and 4,000 watch hours (or 10 million Shorts views) in the past 12 months. After joining, revenue depends on your CPM and engagement. A channel averaging $3 RPM earns roughly $3 per 1,000 views — so 100,000 monthly views generates about $300/month from ads alone, before factoring in sponsorships or memberships.",
  },
  {
    q: "What YouTube hashtags should I use?",
    a: "YouTube allows up to 15 hashtags per video, but using 3–5 highly targeted hashtags performs best. Include 1–2 broad niche hashtags (e.g., #YouTubeTips), 1–2 topic-specific hashtags (e.g., #VideoEditing), and 1 branded hashtag for your channel. Use our YouTube Hashtag Generator to find trending hashtags by entering your video topic.",
  },
  {
    q: "How do I write a YouTube video script that keeps viewers watching?",
    a: "An effective YouTube script follows a 3-part structure: (1) Hook — grab attention in the first 15 seconds by stating the biggest benefit or asking a compelling question. (2) Body — deliver value in short sections with transitions like 'next' and 'here's why.' (3) Call-to-Action — end with a single clear instruction such as subscribing or watching a related video. Use the YouTube Script Generator for complete, ready-to-read scripts.",
  },
  {
    q: "Does YouTube SEO actually work?",
    a: "Yes — YouTube is the world's second-largest search engine, and roughly 70% of watch time on the platform comes from recommendations powered by search signals. Optimizing your title, description, and tags for relevant keywords directly increases how often your video appears in search results and suggested video panels. The difference between a well-optimized and unoptimized video can be 5–10× in organic views over its lifetime.",
  },
  {
    q: "Are these YouTube tools free to use?",
    a: "All tools on creatorsToolHub are 100% free with no signup required. You can generate titles, tags, hashtags, scripts, video ideas, and revenue estimates as many times as you need without creating an account or entering a credit card.",
  },
  {
    q: "What is a good YouTube engagement rate?",
    a: "YouTube engagement rate (likes + comments ÷ views × 100) typically ranges from 1% to 5% for most channels. A rate above 5% is excellent and signals strong audience connection. Use the YouTube Engagement Calculator to calculate your rate and compare it against niche benchmarks.",
  },
  {
    q: "How do I find good YouTube video ideas?",
    a: "The best video ideas come from three sources: (1) YouTube search autocomplete — type a keyword and note the suggestions. (2) Competitor channel analysis — see which of their videos perform best. (3) Online communities — Reddit, Quora, and niche Facebook groups reveal exactly what your audience is struggling with. The YouTube Video Idea Generator automates this process and returns 10+ ready-to-film ideas tailored to your niche.",
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
  { name: "TikTok Tools", slug: "tiktok-tools", icon: "🎵", desc: "Grow your TikTok presence with hashtag generators, caption tools, and more." },
  { name: "Instagram Tools", slug: "instagram-tools", icon: "📸", desc: "Craft perfect captions, find hashtags, and plan your Instagram content." },
  { name: "AI Writing Tools", slug: "ai-writing-tools", icon: "✍️", desc: "Generate blog posts, emails, and copy with AI writing assistants." },
  { name: "Content Creator Tools", slug: "content-creator-tools", icon: "🎨", desc: "All-in-one tools for content ideation, planning, and repurposing." },
];

export function YouTubeCategoryPage({ category }: Props) {
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
    script.id = "yt-category-faq-schema";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
        { "@type": "ListItem", position: 2, name: "YouTube Tools", item: window.location.href },
      ],
    };
    const bc = document.createElement("script");
    bc.type = "application/ld+json";
    bc.id = "yt-category-breadcrumb-schema";
    bc.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(bc);

    return () => {
      document.getElementById("yt-category-faq-schema")?.remove();
      document.getElementById("yt-category-breadcrumb-schema")?.remove();
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
                  The Best Free YouTube Tools for Content Creators in 2025
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Growing a YouTube channel in 2025 is equal parts creativity and strategy. Every viral video
                  starts with a compelling title, ranks through smart keyword optimization, and earns through
                  ad revenue that smart creators calculate before they even hit record. This free YouTube
                  toolkit gives you {activeTools.length} purpose-built tools that cover every stage of the
                  content lifecycle — from the spark of a video idea all the way to monetization projections.
                  No subscriptions, no sign-ups, just instant results.
                </p>
              </header>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  YouTube SEO Tools: Get Found in Search and Suggested Videos
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  YouTube processes more than 500 hours of video uploaded every minute, which means your
                  video competes for attention the moment it goes live. The platform's algorithm uses title
                  keywords, tags, descriptions, and early engagement signals to decide who sees your content.
                  YouTube SEO isn't optional — it's the mechanism that separates videos that plateau at a few
                  hundred views from those that compound to hundreds of thousands.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tool/youtube-tag-generator" className="text-primary hover:underline font-medium">
                    YouTube Tag Generator
                  </Link>{" "}
                  builds a 30-tag strategy across five semantic layers: your primary keyword, synonyms,
                  long-tail questions, related topics, and trending phrases. Tags are displayed as individual
                  click-to-copy boxes with a live 500-character counter so you never accidentally exceed
                  YouTube's tag limit. Similarly, the{" "}
                  <Link href="/tool/youtube-keyword-generator" className="text-primary hover:underline font-medium">
                    YouTube Keyword Generator
                  </Link>{" "}
                  surfaces high-traffic, low-competition search terms tailored to your niche — exactly the
                  foundation you need before writing a single word of your title or description.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Once you have your keywords, run your title through the{" "}
                  <Link href="/tool/youtube-title-analyzer" className="text-primary hover:underline font-medium">
                    YouTube Title Analyzer
                  </Link>{" "}
                  to receive a 0–100 SEO score, click-through-rate prediction, character-length warning, and
                  actionable suggestions for power words and emotional triggers. Strong titles routinely
                  improve CTR by 20–40%, which is the fastest way to signal to the algorithm that your
                  video deserves to be recommended.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Complete your optimization stack with the{" "}
                  <Link href="/tool/youtube-hashtag-generator" className="text-primary hover:underline font-medium">
                    YouTube Hashtag Generator
                  </Link>{" "}
                  and the{" "}
                  <Link href="/tool/youtube-seo-score-checker" className="text-primary hover:underline font-medium">
                    YouTube SEO Score Checker
                  </Link>
                  . Hashtags appear as clickable links below your video and in YouTube's hashtag search — a
                  low-effort discovery channel that most creators ignore. The SEO Score Checker audits your
                  entire video setup (title, description, tags, thumbnail) and returns a composite score with
                  prioritized fixes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  YouTube Title Generator: Craft Click-Worthy Headlines with Proven Formulas
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your title is the most high-leverage element of any YouTube video. Research consistently
                  shows that changing a title can swing click-through rate by 30–50% without touching a
                  single frame of video. The{" "}
                  <Link href="/tool/youtube-title-generator" className="text-primary hover:underline font-medium">
                    YouTube Title Generator
                  </Link>{" "}
                  gives you two complete title options — one optimized for search ranking (SEO mode) and one
                  optimized for emotional pull and click-through rate (CTR mode) — generated from seven
                  proven frameworks: How-To, Number/List, Curiosity Gap, Speed/Shortcut, Beginner Guide,
                  Warning/Mistake, and Discovery/Trend.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Each generated title displays a score from 0–100 based on keyword placement, title length
                  (ideal: 55–70 characters), power word density, and specificity. You can adjust the tone
                  slider (educational → entertaining), toggle video type (tutorial, vlog, review, shorts),
                  and enable power-word mode for more emotionally charged language. With instant A/B
                  comparison built in, you can test both outputs against each other and pick the one your
                  audience will click first.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Pair the title generator with the{" "}
                  <Link href="/tool/youtube-description-generator" className="text-primary hover:underline font-medium">
                    YouTube Description Generator
                  </Link>{" "}
                  to create the complete above-the-fold package. Descriptions that expand on the title keyword
                  with natural language variations help YouTube understand your video's topic and rank it for a
                  wider cluster of related searches.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  YouTube Monetization Calculators: Know Your Revenue Before You Post
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Experienced creators treat their channel like a business — and every business needs
                  revenue forecasting. The{" "}
                  <Link href="/tool/youtube-money-calculator" className="text-primary hover:underline font-medium">
                    YouTube Money Calculator
                  </Link>{" "}
                  is the most comprehensive free earnings estimator available. Enter your daily views, select
                  your niche (Finance, Gaming, Beauty, Tech, etc.), choose your audience's geographic
                  distribution across four global tiers, and adjust the monetized play rate. The calculator
                  models ad revenue in real time — animated counters update as you move sliders — and adds
                  sponsorship, affiliate, and membership income streams to produce a full monthly projection.
                  A Recharts bar chart lets you visualize revenue growth as your channel scales.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For short-form creators, the{" "}
                  <Link href="/tool/youtube-shorts-revenue-calculator" className="text-primary hover:underline font-medium">
                    YouTube Shorts Revenue Calculator
                  </Link>{" "}
                  accounts for the separate monetization model that applies to videos under 60 seconds.
                  Shorts RPM is typically lower than long-form RPM, but the volume potential is dramatically
                  higher — some Shorts reach tens of millions of views in days. Understanding the difference
                  helps you make smart decisions about your content mix.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Dive deeper into advertiser economics with the{" "}
                  <Link href="/tool/youtube-cpm-calculator" className="text-primary hover:underline font-medium">
                    YouTube CPM Calculator
                  </Link>
                  . CPM — the amount advertisers bid per 1,000 ad impressions — varies enormously by niche
                  ($2–$4 for gaming, $15–$30 for finance) and season (Q4 CPMs can be 2–3× higher than Q1).
                  The CPM Calculator lets you model these variables and see exactly how much a CPM change
                  impacts your monthly income.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Content Creation Tools: From Idea to Upload in Less Time
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The hardest part of running a YouTube channel consistently is not the editing or the
                  filming — it's coming up with a steady stream of ideas that your audience actually wants to
                  watch. The{" "}
                  <Link href="/tool/youtube-video-idea-generator" className="text-primary hover:underline font-medium">
                    YouTube Video Idea Generator
                  </Link>{" "}
                  solves this by generating 10+ tailored video concepts from your niche and target audience
                  description. Each idea includes a suggested title angle, content hook, and target keyword
                  so you can go from "what should I make next?" to a fully outlined video plan in under two
                  minutes.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Once you have an idea, the{" "}
                  <Link href="/tool/youtube-script-generator" className="text-primary hover:underline font-medium">
                    YouTube Script Generator
                  </Link>{" "}
                  writes a complete video script with a pattern-interrupt hook, structured body segments
                  with timed transitions, and a call-to-action that drives subscriptions or watch time.
                  Scripts follow the proven retention framework: open with a promise (the "what you'll get"),
                  deliver value in escalating chunks, and close with a compelling reason to watch another
                  video. Batch-script a week of content in an afternoon.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  For creators who prefer to start with research, the{" "}
                  <Link href="/tool/youtube-channel-name-generator" className="text-primary hover:underline font-medium">
                    YouTube Channel Name Generator
                  </Link>{" "}
                  helps new and rebranding creators find a memorable, SEO-friendly channel name that reflects
                  their niche. A strong channel name improves brand recall and makes it easier for viewers to
                  recommend you to others — word of mouth is still one of the highest-quality traffic sources
                  on YouTube.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  YouTube Analytics and Growth Tools: Make Data-Driven Decisions
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Intuition gets you started on YouTube, but data keeps you growing. The{" "}
                  <Link href="/tool/youtube-engagement-calculator" className="text-primary hover:underline font-medium">
                    YouTube Engagement Calculator
                  </Link>{" "}
                  computes your engagement rate (likes + comments divided by views) and benchmarks it against
                  niche averages. High engagement signals to the algorithm that your audience is genuinely
                  invested, which increases how aggressively YouTube recommends your content to new viewers.
                  Channels with above-average engagement typically see 2–3× higher suggested video traffic.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  Finally, the{" "}
                  <Link href="/tool/youtube-thumbnail-downloader" className="text-primary hover:underline font-medium">
                    YouTube Thumbnail Downloader
                  </Link>{" "}
                  lets you save any YouTube video thumbnail in high resolution for competitive research,
                  presentation mockups, or inspiration boards. Studying the thumbnails of top-performing
                  videos in your niche reveals the visual patterns — colors, fonts, facial expressions — that
                  consistently earn the click.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  How to Build a YouTube Growth System Using These Tools Together
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The creators who grow fastest don't use tools in isolation — they build systems. Here is a
                  repeatable workflow that integrates every tool in this collection into a weekly production
                  pipeline:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm leading-relaxed">
                  <li>
                    <strong className="text-foreground">Monday — Ideation:</strong> Use the Video Idea Generator
                    and Keyword Generator to plan three video topics for the week. Pick the one with the best
                    keyword opportunity.
                  </li>
                  <li>
                    <strong className="text-foreground">Tuesday — Scripting:</strong> Run the chosen topic through
                    the Script Generator. Refine the hook and CTA based on your channel's style.
                  </li>
                  <li>
                    <strong className="text-foreground">Wednesday — Optimization prep:</strong> Generate 5 title
                    options with the Title Generator. Analyze each with the Title Analyzer. Lock in your
                    keyword list using the Tag Generator and Hashtag Generator.
                  </li>
                  <li>
                    <strong className="text-foreground">Thursday — Film and edit.</strong>
                  </li>
                  <li>
                    <strong className="text-foreground">Friday — Upload and SEO:</strong> Write your description
                    using the Description Generator. Paste your final title, tags, and hashtags. Run the SEO
                    Score Checker for a last-minute audit.
                  </li>
                  <li>
                    <strong className="text-foreground">Monthly — Analytics:</strong> Check your Engagement
                    Calculator score. Update your growth projections. Revisit your CPM and revenue estimates
                    using the Money Calculator with your latest data.
                  </li>
                </ol>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This system turns sporadically posting creators into consistent channels — and consistency is
                  the single biggest predictor of long-term YouTube success. All {activeTools.length} tools in
                  this collection are free, require no account, and generate results instantly. Bookmark this
                  page and make it the first stop in your weekly YouTube workflow.
                </p>
              </section>
            </article>

            {/* ─── FAQ Section ─── */}
            <section className="mt-16" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-2xl font-bold mb-6 text-foreground">
                Frequently Asked Questions About YouTube Tools
              </h2>
              <div className="space-y-3">
                {FAQS.map((faq) => (
                  <AccordionItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </section>

            {/* ─── Related Categories ─── */}
            <section className="mt-16" aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-2xl font-bold mb-6 text-foreground">
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
                <h3 className="font-bold text-lg mb-4">Why use these YouTube tools?</h3>
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
                    <span>SEO-optimized outputs ready to copy-paste</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="flex-shrink-0">🎯</span>
                    <span>Built specifically for YouTube creators</span>
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
                      href={`/tool/${tool.slug}`}
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
