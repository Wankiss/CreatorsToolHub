import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { ToolCard } from "@/components/tool-card";
import { ChevronDown, ExternalLink } from "lucide-react";

const YEAR = new Date().getFullYear();

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
    q: "What TikTok tools do I need to grow my account fast?",
    a: "The highest-impact TikTok tools for rapid growth are a Hook Generator (to stop the scroll in the first 3 seconds), a Viral Idea Generator (to always have trending content angles), a Hashtag Generator (to get discovered on the For You Page), and a Caption Generator (to drive comments and shares). Start with the hook and idea tools — they directly influence whether TikTok's algorithm pushes your video to new audiences.",
  },
  {
    q: "How do TikTok hashtags work and how many should I use?",
    a: "TikTok hashtags categorize your content and signal to the algorithm which audiences to show your video to. You should use 3–5 targeted hashtags per video: 1–2 broad niche hashtags (e.g., #BeautyTips), 1–2 specific content hashtags (e.g., #SkincareRoutine), and optionally 1 trending hashtag if it's relevant. Avoid using #FYP or #ForYouPage — they are too saturated and provide no targeting benefit. Our TikTok Hashtag Generator builds a smart hashtag set for your exact video topic.",
  },
  {
    q: "What makes a TikTok hook effective in the first 3 seconds?",
    a: "An effective TikTok hook does one of five things in the first 3 seconds: (1) States a bold, counter-intuitive claim, (2) Asks a question your viewer desperately wants answered, (3) Teases the payoff ('by the end of this video you'll know…'), (4) Shows something visually unusual or unexpected, or (5) Opens with a story mid-action ('I quit my job and…'). The TikTok Hook Generator produces hooks in all five formats so you can pick the one that fits your video style.",
  },
  {
    q: "How much money can you make on TikTok?",
    a: "TikTok income comes from four streams: (1) TikTok Creator Fund / Creativity Program — pays $0.02–$0.05 per 1,000 views ($20–$50 per million views), (2) Brand sponsorships — micro-influencers (10K–100K followers) earn $100–$500 per post; mid-tier (100K–1M) earn $500–$5,000 per post, (3) TikTok Live gifts — top creators earn thousands per month from live diamonds, (4) Affiliate commissions via TikTok Shop. Use the TikTok Money Calculator to model your exact earnings based on your follower count and engagement rate.",
  },
  {
    q: "What is the ideal TikTok video script structure?",
    a: "The highest-retention TikTok scripts follow a 4-part framework: (1) Hook (0–3s) — an immediate pattern interrupt that stops scrolling, (2) Context (3–8s) — one sentence explaining what the video delivers, (3) Value Delivery (8s to end) — the core content in fast-paced, short bursts with visual changes every 2–3 seconds, (4) CTA (last 3s) — a single clear instruction like 'Follow for part 2' or 'Comment your answer below.' The TikTok Script Generator structures your video in this exact format for 15s, 30s, and 60s lengths.",
  },
  {
    q: "How do I write a TikTok caption that gets more comments?",
    a: "Captions that consistently generate comments either (1) ask a direct question at the end ('Which would you choose?'), (2) make a bold statement that invites debate, (3) use a fill-in-the-blank prompt ('Tag someone who needs to see this'), or (4) tease a follow-up video ('Part 2 coming if this hits 1K likes'). Keep captions under 150 characters so the full text appears without tapping 'more.' Add 2–3 relevant emojis to increase visual scannability. The Caption Generator builds captions around all four engagement triggers.",
  },
  {
    q: "How does the TikTok For You Page algorithm work?",
    a: "TikTok's FYP algorithm evaluates three primary signals to decide who sees your video: (1) Completion Rate — the percentage of viewers who watch your full video (the most important signal; aim for 60%+), (2) Engagement Rate — likes, comments, shares, and saves relative to views, (3) Re-watches — viewers who replay your video signal extremely high quality to the algorithm. Secondary signals include your posting time, caption keywords, hashtags, and audio track. Creating content with a strong hook (high completion) and a debatable CTA (high comments) is the fastest path to consistent FYP reach.",
  },
  {
    q: "Are these TikTok tools free to use?",
    a: "All tools on creatorsToolHub are 100% free with no account or credit card required. You can generate viral ideas, hooks, scripts, captions, hashtags, and earnings estimates as many times as you want — no limits, no paywalls, no subscriptions. Bookmark this page and use it every time you sit down to plan your next TikTok.",
  },
  {
    q: "How do I generate viral TikTok video ideas?",
    a: "The most reliable sources of viral TikTok ideas are: (1) TikTok search autocomplete — type your niche keyword and study the suggestions, (2) the 'Others searched for' section under trending videos, (3) Reddit and Quora threads where your target audience asks questions, and (4) the comments section of your top-performing videos (viewers often ask for the exact follow-up content they want). The TikTok Viral Idea Generator automates this research and returns 10+ ready-to-film concepts with hooks, content angles, and target keywords.",
  },
  {
    q: "What TikTok bio should I write to get more followers?",
    a: "A high-converting TikTok bio answers three questions in 80 characters or less: Who you are, What value you provide, and Why someone should follow you right now. Structure: [Niche keyword] + [Specific promise] + [Social proof or CTA]. Example: 'Fitness coach 🏋️ | 3 workouts/week, no gym needed | New videos every Mon & Wed.' Avoid vague bios like 'Content creator' or 'Living my best life' — they give visitors no reason to tap Follow. The TikTok Bio Generator produces 5 bio variations for your specific niche and content type.",
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
  { name: "YouTube Tools", slug: "youtube-tools", icon: "▶️", desc: "Grow your YouTube channel with title generators, tag tools, and monetization calculators." },
  { name: "Instagram Tools", slug: "instagram-tools", icon: "📸", desc: "Craft perfect captions, find hashtags, and plan your Instagram content strategy." },
  { name: "AI Creator Tools", slug: "ai-creator-tools", icon: "🤖", desc: "AI-powered tools for generating ideas, scripts, and copy across every platform." },
  { name: "Content Creator Tools", slug: "content-creator-tools", icon: "🎨", desc: "All-in-one tools for content ideation, planning, and repurposing across platforms." },
];

export function TikTokCategoryPage({ category }: Props) {
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
    script.id = "tt-category-faq-schema";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
        { "@type": "ListItem", position: 2, name: "TikTok Tools", item: window.location.href },
      ],
    };
    const bc = document.createElement("script");
    bc.type = "application/ld+json";
    bc.id = "tt-category-breadcrumb-schema";
    bc.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(bc);

    return () => {
      document.getElementById("tt-category-faq-schema")?.remove();
      document.getElementById("tt-category-breadcrumb-schema")?.remove();
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
                  The Best Free TikTok Tools for Content Creators in {YEAR}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  TikTok is the fastest-growing platform for content creators — but going viral isn't
                  luck. It's the result of nailing your hook in the first 3 seconds, choosing the right
                  hashtags to reach new audiences, and writing captions that force engagement. This free
                  TikTok toolkit gives you {activeTools.length} purpose-built tools covering every stage
                  of the TikTok content lifecycle — from viral video ideas through to earnings estimates.
                  No subscriptions, no sign-ups, instant results.
                </p>
              </header>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  TikTok Content Creation Tools: From Idea to Published Video in Minutes
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The biggest obstacle for TikTok creators isn't filming or editing — it's consistently
                  coming up with ideas that the For You Page algorithm wants to push. TikTok's algorithm
                  rewards content that earns high completion rates and engagement within the first hour of
                  posting. That means you need not just any idea, but a video concept with a built-in
                  viral hook, a clear content structure, and an engagement trigger baked into the caption.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/tiktok-viral-idea-generator" className="text-primary hover:underline font-medium">
                    TikTok Viral Idea Generator
                  </Link>{" "}
                  analyzes trending content patterns in your niche and returns 10+ video concepts, each
                  with a suggested title angle, the underlying trend it taps into, and the target
                  audience it will resonate with most. Every idea comes with a hook suggestion so you
                  know exactly how to open the video. This transforms "I don't know what to post" into a
                  fully planned content calendar in under two minutes.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Once you have your idea, use the{" "}
                  <Link href="/tools/tiktok-script-generator" className="text-primary hover:underline font-medium">
                    TikTok Script Generator
                  </Link>{" "}
                  to build 3 complete word-for-word script variations, each using a different proven viral
                  formula: "Stop Doing This," "Nobody Tells You," "Here's How I Did It," "If You're [Audience],"
                  "3 Mistakes," or "This Changed Everything." Scripts are auto-calibrated to your selected
                  video length — 30–50 words for 15-second videos, 60–90 words for 30-second videos, and
                  120–160 words for 60-second videos, matching realistic speaking speed exactly. Every script
                  includes a Hook Score (1–10), Retention Score (1–10), and timestamps for the Hook (0–3s),
                  Body, and CTA — plus separate copy buttons for the hook only, CTA only, or the full script.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every great TikTok also needs a caption that triggers engagement. The{" "}
                  <Link href="/tools/tiktok-caption-generator" className="text-primary hover:underline font-medium">
                    TikTok Caption Generator
                  </Link>{" "}
                  produces 10 caption variations per generation across 10 distinct style formats — Punchy Hook,
                  POV, Storytelling, Question Hook, Hot Take, Relatable, Educational, Challenge, Listicle, and
                  Emotional. Each caption includes a Viral Score (combining Hook Strength, Engagement Potential,
                  and Clarity ratings), 7 curated hashtags, and separate copy buttons for caption body and
                  hashtags. The{" "}
                  <Link href="/tools/tiktok-hashtag-generator" className="text-primary hover:underline font-medium">
                    TikTok Hashtag Generator
                  </Link>{" "}
                  completes the publishing package with a targeted hashtag strategy that puts your video in
                  front of the right viewers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  TikTok Hook Generator: Stop the Scroll in the First 3 Seconds
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The hook is the single most important element of any TikTok video. TikTok data shows
                  that 45% of viewers who watch the first 3 seconds of a video will watch the entire
                  thing. Conversely, a weak or slow-starting video loses 80% of its potential audience
                  before the 3-second mark. Your hook determines whether your video gets shown to 200
                  people or 2 million — the algorithm reads completion rate as its primary quality signal.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/tiktok-hook-generator" className="text-primary hover:underline font-medium">
                    TikTok Hook Generator
                  </Link>{" "}
                  produces hooks in five battle-tested formats for your topic: (1) <strong>Bold Claim</strong> —
                  a counter-intuitive statement that demands attention, (2) <strong>Question Hook</strong> —
                  a question your audience can't resist answering, (3) <strong>Story Hook</strong> — an
                  in-medias-res opener that drops the viewer mid-action, (4) <strong>Shock Hook</strong> —
                  a surprising fact or statistic that reframes their worldview, and (5) <strong>Tease Hook</strong> —
                  a promise of payoff that creates irresistible curiosity. Select the format that matches
                  your video style and copy-paste it directly into your script.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The best TikTok creators test 2–3 hook variants on the same video concept. Generate
                  multiple hooks, film quick variations of your intro, and use TikTok's built-in A/B
                  testing feature to determine which hook drives the highest completion rate. Even a 10%
                  improvement in 3-second view rate can double your FYP distribution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  TikTok Bio Generator: Convert Profile Visitors Into Followers
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Most TikTok creators focus entirely on their videos and ignore their profile — but your
                  bio is the most underleveraged growth asset on TikTok. Every time a viewer watches one of
                  your videos and taps your profile to learn more, your bio is what determines whether they
                  hit Follow or leave. A vague bio ("content creator | fitness | lifestyle 🌿") loses visitors.
                  A specific, benefit-driven bio converts them.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/tiktok-bio-generator" className="text-primary hover:underline font-medium">
                    TikTok Bio Generator
                  </Link>{" "}
                  creates 10 bio variations for your profile using five proven high-converting formula
                  structures — "I help [audience] [result]," "[Emoji] [Value Proposition]," "[Result] | [Niche],"
                  "Follow for [benefit]," and "[USP] + [CTA]" — each validated to TikTok's strict
                  80-character limit. Enter your niche, what you do, and optional details like tone, target
                  audience, and USP to get bios that feel personal and targeted, not generic. Filter results
                  by emoji bios, CTA bios, or ultra-minimal bios to find the style that fits your brand.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Test bios like you test hooks: update your profile bio, wait 7 days, and check your
                  profile-to-follow conversion rate in TikTok Analytics under Profile Visits vs. New Followers.
                  A 5–10% conversion rate is the benchmark for a high-performing bio. If you're below that,
                  regenerate a new set and switch to a more specific or benefit-driven option.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  TikTok Hashtags and Captions: The Discoverability Stack
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Hashtags and captions serve two distinct functions on TikTok — and most creators
                  conflate them. Hashtags are a discoverability signal: they tell the algorithm which
                  topic clusters to test your video against. Captions are an engagement trigger: they
                  give viewers a reason to comment, which is TikTok's strongest algorithmic signal after
                  completion rate.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/tiktok-hashtag-generator" className="text-primary hover:underline font-medium">
                    TikTok Hashtag Generator
                  </Link>{" "}
                  builds a 3-tier hashtag strategy for your video: one broad niche hashtag (high reach,
                  lower precision), one mid-tier content-specific hashtag (balanced reach and relevance),
                  and one micro hashtag (lower competition, highly targeted audience). This tiered
                  approach reaches the maximum number of relevant viewers without diluting your signal by
                  using oversaturated tags like #FYP.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Pair every hashtag set with a caption from the{" "}
                  <Link href="/tools/tiktok-caption-generator" className="text-primary hover:underline font-medium">
                    TikTok Caption Generator
                  </Link>
                  . The generator produces 10 captions per run across 10 style formats — Punchy Hook, POV,
                  Storytelling, Question Hook, Hot Take, Relatable, Educational, Challenge, Listicle, and
                  Emotional — each with a Viral Score and 7 curated hashtags. High-performing captions include
                  a direct question that invites debate, a fill-in-the-blank prompt, or a hot take that viewers
                  feel compelled to respond to. Comments signal to TikTok that your video is generating
                  conversation — the platform responds by pushing it to fresh audiences in a second and third
                  distribution wave.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  TikTok Money Calculator: Understand Your Earning Potential
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  TikTok monetization is more complex than most creators realize — and significantly more
                  lucrative than the Creator Fund alone suggests. The{" "}
                  <Link href="/tools/tiktok-money-calculator" className="text-primary hover:underline font-medium">
                    TikTok Money Calculator
                  </Link>{" "}
                  models all four income streams available to TikTok creators: Creator Fund / Creativity
                  Program payouts (based on your average views and engagement rate), brand sponsorship
                  rates (calculated from your follower count and niche), TikTok Live gift income
                  (estimated from live session frequency and viewership), and affiliate / TikTok Shop
                  commission revenue.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Creator Fund payouts are notoriously low — typically $0.02–$0.05 per 1,000 views. But
                  the Creativity Program, available to accounts with 10,000+ followers who post videos
                  over 1 minute, pays significantly more. A creator averaging 500,000 views per video
                  in the Creativity Program can realistically earn $500–$2,500 per month from the fund
                  alone — before factoring in brand deals.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Brand sponsorships represent the largest income opportunity for most TikTok creators.
                  Micro-influencers (10K–100K followers) typically command $100–$500 per sponsored post,
                  while mid-tier creators (100K–1M) earn $500–$5,000 per integration. Use the calculator
                  to project your income at different follower milestones and understand exactly how many
                  followers you need to make TikTok a full-time income.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  TikTok Profile Optimization: Bio, Branding, and Converting Visitors to Followers
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Every viral video sends a wave of new profile visitors. Whether they convert to
                  followers depends almost entirely on what they see in the first 3 seconds of reading
                  your profile. A weak bio loses 70% of profile visitors without gaining a follow — and
                  every unfollowed profile visit represents a missed opportunity to compound your
                  distribution long-term.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The{" "}
                  <Link href="/tools/tiktok-bio-generator" className="text-primary hover:underline font-medium">
                    TikTok Bio Generator
                  </Link>{" "}
                  generates 10 bio options per generation using five proven high-converting formula
                  structures — "I help [audience] [result]," "[Emoji] [Value Proposition]," "[Result] | [Niche],"
                  "Follow for [benefit]," and "[USP] + [CTA]" — each validated to TikTok's strict 80-character
                  limit. Choose from 15 niches and 5 tone modes, and filter results by style (emoji bios,
                  CTA bios, or ultra-minimal) to find the exact bio that fits your brand. A strong bio answers
                  three visitor questions in 80 characters or fewer: "Who is this person?", "What do I get
                  from following?", and "Why should I follow now?"
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Profile optimization compounds over time. A creator who converts 20% of profile visitors
                  to followers instead of 5% grows 4× faster with identical video performance. Combine a
                  strong bio with a pinned video that immediately demonstrates your content's value —
                  this one-two punch is the most reliable way to sustain follower growth between viral
                  moments.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  How to Build a TikTok Growth System Using These 7 Tools Together
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The TikTok creators who grow consistently don't wing it — they follow a repeatable
                  production system. Here is a weekly workflow that integrates all {activeTools.length} tools
                  into a single pipeline:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm leading-relaxed">
                  <li>
                    <strong className="text-foreground">Monday — Ideation:</strong> Use the Viral Idea Generator
                    to generate 10+ video concepts for the week. Select the 3–5 that align with current
                    trends and your content pillars.
                  </li>
                  <li>
                    <strong className="text-foreground">Tuesday — Hook Writing:</strong> For each selected idea,
                    generate 3 hook variants using the Hook Generator. Pick the one that creates the most
                    immediate tension or curiosity.
                  </li>
                  <li>
                    <strong className="text-foreground">Wednesday — Scripting:</strong> Run each idea through the
                    Script Generator. Refine the CTA to match your current growth goal (followers, comments,
                    or clicks to your link in bio).
                  </li>
                  <li>
                    <strong className="text-foreground">Thursday — Film batch:</strong> Film all 3–5 videos in a
                    single session. Batch filming saves 60–70% of your weekly production time.
                  </li>
                  <li>
                    <strong className="text-foreground">Friday — Publish prep:</strong> For each video, generate
                    a caption (Caption Generator) and a 3-tier hashtag set (Hashtag Generator). Schedule
                    posts for your audience's peak activity windows (typically 6–9am, 12–2pm, 7–10pm local time).
                  </li>
                  <li>
                    <strong className="text-foreground">Monthly — Profile + monetization review:</strong> Update your
                    bio using the Bio Generator if your content focus has shifted. Run your latest metrics through
                    the Money Calculator to track your revenue trajectory and identify when you'll hit the next
                    income milestone.
                  </li>
                </ol>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This system transforms erratic posting into a consistent content engine. Consistency is
                  TikTok's most-rewarded behavior — the algorithm gives systematic preference to accounts
                  that post regularly and maintain high engagement-to-view ratios over time. All{" "}
                  {activeTools.length} tools in this collection are free, require no account, and generate
                  results instantly. Bookmark this page and make it the first stop in your weekly TikTok workflow.
                </p>
              </section>
            </article>

            {/* ─── FAQ Section ─── */}
            <section className="mt-16" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-2xl font-bold mb-6 text-foreground">
                Frequently Asked Questions About TikTok Tools
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
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Why use these TikTok tools?</h3>
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
                    <span>Optimized for TikTok's {YEAR} algorithm</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="flex-shrink-0">🎯</span>
                    <span>Built specifically for TikTok creators</span>
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

            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
