import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Hash,
  ListChecks, ChevronDown, Shield, Zap, ArrowUpRight,
  TrendingUp, Lightbulb, AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What are YouTube hashtags and how do they work?",
    a: "YouTube hashtags are metadata tags prefixed with # that you add to your video title or description. When a viewer clicks a hashtag, they land on a dedicated hashtag search page showing all videos tagged with that term, ranked by relevance and watch time. This creates a secondary discovery pathway alongside standard keyword search — exposing your content to viewers who find topics by browsing hashtags rather than searching. YouTube also uses hashtags as one of the categorization signals it reads when deciding which suggested video slots your content appears in, making accurate hashtags an important part of your overall discoverability strategy.",
  },
  {
    q: "How many hashtags should I use on a YouTube video?",
    a: "The ideal number of YouTube hashtags is between 3 and 15 per video. Using more than 15 hashtags triggers YouTube's spam detection filter, which can cause YouTube to ignore all hashtags on that video entirely — the opposite of what you want. Focus on quality over quantity: 5–10 well-chosen hashtags covering all three tiers (trending, niche, and long-tail) outperform 50 generic tags every time. If you're targeting YouTube Shorts specifically, 3–5 hashtags is the sweet spot, including the #Shorts tag to help YouTube classify your content for the Shorts feed.",
  },
  {
    q: "Where should I put hashtags in my YouTube video?",
    a: "Place hashtags at the very end of your video description, below your main content, links, and calls-to-action. YouTube automatically picks the first three hashtags from your description and displays them above your video title as clickable links — so put your most important hashtags first. You can also add one or two hashtags directly in the video title for maximum visibility, but this is most effective for highly searched terms. Avoid scattering hashtags throughout the description body, as this looks spammy and disrupts the reading flow for viewers who expand the description.",
  },
  {
    q: "Do YouTube hashtags affect SEO rankings?",
    a: "Yes, indirectly but meaningfully. Hashtags don't directly boost your ranking in standard YouTube keyword search results, but they strengthen the content categorization signals YouTube's algorithm uses to decide where to place your video in the suggested video sidebar and home feed. Accurate, relevant hashtags help YouTube correctly identify your content category and serve it to viewers who have engaged with similar content — which is often where the majority of views come from for established creators. They also create a separate hashtag search ranking where your video can appear first even with a small channel, especially for niche and long-tail hashtags.",
  },
  {
    q: "What's the difference between trending, niche, and long-tail YouTube hashtags?",
    a: "Trending hashtags (#YouTube, #ContentCreator, #VideoMarketing) are high-volume platform-wide tags that signal your content belongs in the mainstream creator ecosystem. They rarely rank your video at the top alone because competition is enormous, but they trigger related video suggestions. Niche hashtags (#HomeWorkout, #TechReview, #DigitalMarketing) are category-specific — mid-volume tags with strong audience relevance that offer the best balance of traffic and ranking opportunity. Long-tail hashtags (#HomeWorkoutForBeginners, #YouTubeGrowthTips2026) are highly specific combinations with minimal competition. Small channels can rank first for these tags and attract highly qualified viewers actively looking for exactly what you've made.",
  },
  {
    q: "Should I use the same hashtags on every video?",
    a: "No — using identical hashtag sets on every video is a common mistake that signals low-quality, repetitive optimization to the platform. YouTube's algorithm de-emphasizes channels that use the same hashtags repeatedly across unrelated videos. Your broad trending hashtags (#YouTube, #ContentCreator) can be reused, but your niche and long-tail hashtags should be customized for each video's specific topic, angle, and target audience. This signals to YouTube that each video is a distinct, properly categorized piece of content — which improves hashtag search rankings and suggested video placement for each upload.",
  },
  {
    q: "Can hashtags help my YouTube Shorts get more views?",
    a: "Yes — hashtags are especially effective on YouTube Shorts because the Shorts feed uses hashtags as one of its primary content categorization signals. Using 3–5 relevant hashtags on each Short can significantly improve its placement in the hashtag-browsing section of the Shorts feed. The #Shorts hashtag itself signals to YouTube that the video is formatted as a Short and should be distributed through the Shorts discovery system. Niche-specific hashtags on Shorts work particularly well because the Shorts audience tends to browse by interest category, making topic-specific hashtags a direct path to getting in front of the right viewers.",
  },
  {
    q: "What hashtags should I avoid on YouTube?",
    a: "Avoid irrelevant trending hashtags used to hijack traffic — using #Gaming on a cooking video might drive clicks, but those viewers instantly bounce when they see unrelated content, spiking your bounce rate and suppressing your video across all discovery channels. Never use more than 15 hashtags per video. Avoid banned or restricted hashtag terms. Skip generic spam tags like #viral, #trending, or #fyp that don't describe your actual content and are so oversaturated that they provide zero ranking benefit. Also avoid competitor brand names or misleading terms — YouTube's spam policies can result in reduced visibility or strikes for deliberately deceptive hashtag use.",
  },
  {
    q: "How do I find the best hashtags for my YouTube niche?",
    a: "The fastest method is to use our AI-powered YouTube Hashtag Generator — enter your video topic and select your niche, and the tool generates a complete three-tier hashtag set (trending, niche-specific, and long-tail) tailored to your content in seconds. You can also manually research hashtags by browsing the descriptions of top-performing videos in your niche to see which tags they use, then checking the hashtag search pages to assess how much competition exists for each term. Hashtags where your content quality can genuinely compete with the top 10 results are the sweet spot — big enough to be worth targeting, small enough for a mid-size channel to rank.",
  },
  {
    q: "Is the YouTube Hashtag Generator free to use?",
    a: "Yes — the YouTube Hashtag Generator is completely free with no account required, no signup, and no usage limits. The AI-powered generator creates a full trending, niche, and long-tail hashtag set for any video topic or content category in seconds. Generate as many hashtag sets as you need, select only the most relevant ones using the individual hashtag picker, and copy them directly into YouTube Studio. There are no premium tiers, watermarks, or daily limits — just instant, AI-generated hashtags whenever you need them.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(item => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-200 ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
        aria-expanded={open}>
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function YouTubeHashtagGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("auto");
  const [keywords, setKeywords] = useState("");
  const [quantity, setQuantity] = useState("20");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSelected, setCopiedSelected] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-hashtag-generator");
  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-yt-hashtag-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your video topic or title.", variant: "destructive" });
      return;
    }
    setSelected(new Set());
    run({ topic, niche, keywords, quantity: Number(quantity) });
  };

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(outputs.join(" "));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast({ title: "All hashtags copied!" });
  };

  const copySelectedTags = () => {
    const tags = outputs.filter((_, i) => selected.has(i)).join(" ");
    navigator.clipboard.writeText(tags);
    setCopiedSelected(true);
    setTimeout(() => setCopiedSelected(false), 2000);
    toast({ title: `${selected.size} hashtag${selected.size !== 1 ? "s" : ""} copied!` });
  };

  const charCount = outputs.join(" ").length;

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* AI badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </div>
            <span className="text-xs text-muted-foreground">Generates trending, niche, and long-tail hashtags instantly</span>
          </div>

          {/* Video topic */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Video Topic or Title *
            </label>
            <Input
              placeholder="e.g. Home workout routine for beginners without equipment..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="rounded-xl h-11 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1.5">The more specific your topic, the more targeted your hashtags will be.</p>
          </div>

          {/* Niche + Keywords */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Content Niche</label>
              <select
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                value={niche}
                onChange={e => setNiche(e.target.value)}
              >
                <option value="auto">Auto-Detect</option>
                <option value="youtube">YouTube / Video Creation</option>
                <option value="fitness">Fitness & Health</option>
                <option value="finance">Finance & Investing</option>
                <option value="tech">Tech & Gadgets</option>
                <option value="gaming">Gaming</option>
                <option value="beauty">Beauty & Lifestyle</option>
                <option value="food">Food & Cooking</option>
                <option value="travel">Travel</option>
                <option value="education">Education & Tutorials</option>
                <option value="business">Business & Marketing</option>
                <option value="music">Music & Entertainment</option>
                <option value="fashion">Fashion & Style</option>
                <option value="motivation">Motivation & Self-Help</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">Unlocks curated hashtag pools for your category.</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Target Keywords <span className="font-normal">(optional)</span></label>
              <Input
                placeholder="e.g. YouTube SEO, grow channel, video tips..."
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Comma-separated — each becomes a hashtag automatically.</p>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Number of Hashtags</label>
            <div className="flex gap-3">
              {["10", "20", "30"].map(q => (
                <button key={q} type="button" onClick={() => setQuantity(q)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${quantity === q ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  {q} hashtags
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full h-12 rounded-xl font-semibold text-base gap-2 bg-red-600 hover:bg-red-700">
            {loading
              ? <><Loader2 className="animate-spin w-5 h-5" /> Generating with AI...</>
              : <><Sparkles className="w-5 h-5" /> Generate Hashtags</>}
          </Button>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {outputs.length > 0 && (
        <div className="mt-6 rounded-3xl border border-border bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-foreground">Generated Hashtags</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click to select • {charCount} characters total
                  {selected.size > 0 && ` • ${selected.size} selected`}
                </p>
              </div>
              <div className="flex gap-2">
                {selected.size > 0 && (
                  <Button variant="outline" size="sm" onClick={copySelectedTags} className="gap-1.5 rounded-lg text-xs">
                    {copiedSelected ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    Copy Selected ({selected.size})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={copyAll} className="gap-1.5 rounded-lg text-xs">
                  {copiedAll ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  Copy All
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {outputs.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => { toggleSelect(i); copyItem(tag, i); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    selected.has(i)
                      ? "bg-red-50 border-red-400 text-red-700 dark:bg-red-950/30 dark:border-red-600 dark:text-red-400"
                      : "bg-muted/30 border-border hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-foreground"
                  }`}
                >
                  {tag}
                  {copied === i
                    ? <Check className="w-3 h-3 text-green-500 shrink-0" />
                    : selected.has(i)
                    ? <Check className="w-3 h-3 shrink-0" />
                    : <Copy className="w-3 h-3 text-muted-foreground shrink-0" />}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Paste these at the end of your YouTube video description in YouTube Studio. The first 3 hashtags will appear above your video title.
            </p>
          </div>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Hashtag Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Video Topic or Title",
              desc: "Paste your video title or describe the topic in a sentence. The AI extracts the core keywords from your input and uses them as the foundation for your hashtag set. The more specific your topic, the more targeted the hashtags — 'Home workout for beginners without equipment' will produce better niche hashtags than just 'fitness'.",
            },
            {
              step: 2,
              title: "Select Your Niche and Keywords",
              desc: "Choose your content niche from the dropdown (or leave it on Auto-Detect) to unlock niche-specific hashtag pools tailored to your category. Optionally add comma-separated target keywords — each keyword is automatically converted into an optimized hashtag. For example: 'YouTube SEO, grow channel, video tips' becomes #YouTubeSEO, #GrowChannel, #VideoTips.",
            },
            {
              step: 3,
              title: "Choose Quantity and Generate",
              desc: "Pick 10, 20, or 30 hashtags based on how many suggestions you want to browse. Click Generate Hashtags and your AI-generated, personalized set appears instantly, organized into three groups: Trending (high-volume platform hashtags), Niche (topic-specific), and Long-Tail (highly specific combination hashtags).",
            },
            {
              step: 4,
              title: "Select, Copy, and Paste",
              desc: "Click individual hashtag pills to select your favorites, then hit 'Copy Selected' to grab just those ones. Or use 'Copy All' to copy every hashtag at once. The character counter shows the total length so you can stay within your description budget. Paste directly into your YouTube video description — at the end, below your main content.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">{step}</div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Hash className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Hashtag Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How YouTube Hashtags Improve Discoverability
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube hashtags function as a secondary discovery system that runs parallel to standard keyword search.
              When a viewer clicks a hashtag on any video, they land on a dedicated hashtag search page that displays all
              videos tagged with that term — ordered by relevance and watch time rather than pure keyword match. This
              creates a discovery pathway that can expose your content to viewers who never would have found it through
              search alone, because they were browsing content by topic rather than searching for a specific phrase.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The algorithm uses hashtags as one of the signals it reads when categorizing your video. Accurate, relevant
              hashtags help YouTube understand your content category and serve it to the right suggested video slots —
              the "Up Next" sidebar and the home feed for viewers who have engaged with similar content. Mismatched or
              spammy hashtags (using #viral or #fyp on a finance tutorial) confuse this categorization and can actively
              reduce your reach by placing your video in the wrong audience feed.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our AI-powered generator analyzes your video topic and selected niche to build a hashtag set that accurately
              signals your content category to YouTube's algorithm — improving both hashtag search placement and suggested
              video distribution simultaneously. Use these alongside your{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube description
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                video title
              </Link>{" "}
              to build a fully optimized video page.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> The Three-Layer Hashtag Strategy
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The most effective YouTube hashtag strategies use three layers simultaneously. The first layer is broad
              trending hashtags — tags like #YouTube, #ContentCreator, and #VideoMarketing that have enormous search
              volume. These won't rank your video on their own because the competition is fierce, but they signal to the
              platform that your content belongs in the mainstream creator ecosystem and can trigger related video
              suggestions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The second layer is niche hashtags specific to your content category. A fitness creator using #HomeWorkout
              and #FitnessMotivation reaches people actively browsing fitness content. A tech reviewer using #TechReview
              and #GadgetUnboxing lands in front of technology enthusiasts. These mid-volume hashtags offer the best
              balance of audience relevance and ranking opportunity — large enough to drive meaningful traffic, specific
              enough for your video to rank near the top. Reinforce these same keywords in your{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                video description
              </Link>{" "}
              for compounding SEO value.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The third layer is long-tail hashtags — highly specific combinations like #HomeWorkoutForBeginners or
              #YouTubeGrowthTips2026. These drive low but highly qualified traffic. A viewer clicking
              #HomeWorkoutForBeginners is looking for exactly what you've made. Long-tail hashtags also face far less
              competition, meaning your video can rank first for that tag even with a small channel. Our AI generator
              automatically creates all three layers in one generation — giving you a complete, balanced hashtag strategy
              for every video without manual research.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> Hashtag Mistakes That Kill Your YouTube Reach
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Over-hashtagging is the most common YouTube hashtag mistake. Using more than 15 hashtags triggers YouTube's
              spam filter and can cause YouTube to ignore all hashtags on that video. The irony is that creators who use
              50+ hashtags trying to maximize exposure often get zero hashtag benefit. Keep it between 5–15, focusing on
              quality over quantity.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The second major mistake is using irrelevant trending hashtags to hijack traffic. Using #Gaming on a cooking
              video might drive clicks, but those viewers immediately bounce when they see unrelated content — spiking
              your bounce rate and signaling to YouTube that your video disappoints its audience. This suppresses your
              video across all discovery channels, not just the misused hashtag. Always ensure every hashtag accurately
              describes your actual video content. Combine strong hashtag strategy with keyword-optimized{" "}
              <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                video tags
              </Link>{" "}
              and a high-CTR{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                title
              </Link>{" "}
              for a complete discoverability package.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Hashtag Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "AI-powered generation — produces relevant, properly capitalized hashtags (#YouTubeSEO not #youtubeseo)",
                "Three-tier hashtag strategy: Trending, Niche, and Long-Tail groups in every generation",
                "Niche keyword expansion — 13 content categories with curated hashtag pools",
                "Custom keywords converted to properly formatted hashtags automatically",
                "10, 20, or 30 hashtag generation depending on your browsing preference",
                "Select individual hashtags — copy only the ones that fit your video",
                "Character counter tracks total hashtag length for description planning",
                "One-click Copy All — paste directly into YouTube Studio description",
                "Regenerate cycles fresh AI-generated hashtag combinations on demand",
                "100% free — no account, no limits, instant AI generation",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tips & Best Practices ────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips for a Better YouTube Hashtag Strategy</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Use 5–15 hashtags per video — more than 15 triggers YouTube's spam filter and can cause all your hashtags to be ignored entirely.",
            "Place hashtags at the end of your description — YouTube automatically turns the first 3 into clickable links above your video title.",
            "Mix all three tiers: 2–3 trending hashtags for ecosystem signaling, 4–6 niche hashtags for category placement, and 2–4 long-tail hashtags for qualified traffic.",
            "Customize hashtags for each video — using the same set on every video signals repetitive content to the algorithm and reduces hashtag ranking benefit.",
            "Match your hashtags to your actual content — mismatched hashtags cause audience bounce, which suppresses your video across all discovery channels.",
            "Use the same keywords in both your hashtags and description — the algorithm reads both, so consistent keyword signals strengthen your content category match.",
            "#Shorts is a must-have hashtag for YouTube Shorts content — it signals your video for Shorts feed distribution and unlocks the Shorts discovery system.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related YouTube Tools ─────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related YouTube Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized video tags that complement your hashtag strategy for stronger rankings." },
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Create high-CTR titles that work alongside your hashtags to maximize search visibility." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write keyword-rich descriptions where you can embed your top hashtags for double impact." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your complete title and description SEO package before publishing." },
          ].map(({ name, path, desc }) => (
            <a key={path} href={path} className="group flex items-start gap-4 p-4 rounded-2xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} question={item.q} answer={item.a} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
