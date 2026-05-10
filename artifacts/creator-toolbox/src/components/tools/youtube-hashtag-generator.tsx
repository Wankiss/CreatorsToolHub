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
    a: "YouTube hashtags are # keywords you add to your video title or description to improve discoverability. According to YouTube's official Help Center, hashtags create a secondary discovery channel: when a viewer clicks one, they reach a dedicated hashtag search page ranking all videos with that tag by relevance and watch time. YouTube also reads hashtags as content categorization signals when deciding which suggested video and home feed slots to place your video in — a distribution pathway that drives more total views than search alone for most established channels.",
  },
  {
    q: "How many hashtags should I use on a YouTube video?",
    a: "YouTube's official documentation states that videos with more than 60 hashtags have all their hashtags ignored entirely. Most industry guides incorrectly repeat a 15-hashtag limit — that figure has no source in YouTube's actual policy pages. In practice, 3–5 well-chosen hashtags in your description outperform a padded list of 20+. YouTube's own policy also warns that over-tagging 'may result in the removal of your video from your uploads or from search' — so quality over quantity is enforced at the platform level.",
  },
  {
    q: "Where should I put hashtags in my YouTube video?",
    a: "YouTube's Help Center confirms that up to three hashtags 'considered most engaging' appear as clickable links above your video title — so your most important hashtags go first in the description. Place all hashtags at the very end of your description, below your main content and links. You can also add one or two in the video title itself for maximum visibility, but this works best for high-search terms where the hashtag doubles as a keyword. Avoid scattering hashtags mid-description — it disrupts the reading experience for viewers who expand the description.",
  },
  {
    q: "Do YouTube hashtags affect SEO rankings?",
    a: "Hashtags don't directly boost standard YouTube keyword search rankings, but they add to the content categorization signals YouTube uses to place your video in suggested video slots and the home feed. YouTube videos appear in Google SERPs for 791.3 million search queries in the US alone, according to Semrush's 2024 analysis — and YouTube is cited in 29.5% of Google AI Overviews, the highest of any domain. Hashtags strengthen the metadata layer that helps YouTube (and Google) categorize your content correctly across all those surfaces.",
  },
  {
    q: "What's the difference between trending, niche, and long-tail YouTube hashtags?",
    a: "Trending hashtags (#YouTube, #ContentCreator) are high-volume platform-wide tags with fierce competition — they signal ecosystem membership and trigger related video suggestions but rarely rank your video alone. Niche hashtags (#HomeWorkout, #TechReview) are category-specific mid-volume tags offering the best balance of relevance and ranking opportunity. Long-tail hashtags (#HomeWorkoutForBeginners, #YouTubeGrowthTips2026) have minimal competition — small channels can rank first for these tags immediately and capture highly qualified viewers looking for exactly what you've created. Use all three tiers together.",
  },
  {
    q: "Should I use the same hashtags on every video?",
    a: "No. YouTube's spam policies flag channels that apply identical metadata repeatedly across unrelated content — misleading hashtags can result in video removal and, with repeat violations, channel strikes (three strikes in 90 days results in channel termination, per YouTube's official Spam Policy). Your broad trending hashtags can be reused, but your niche and long-tail hashtags should be customized for each video's specific topic. Each upload needs hashtags that accurately describe that specific video — not a template pasted from your last one.",
  },
  {
    q: "Can hashtags help my YouTube Shorts get more views?",
    a: "Yes — and the Shorts opportunity is significant. YouTube Shorts reached 200 billion daily views in 2026, up from 70 billion in early 2024, according to YouTube CEO Neal Mohan's annual letters. Todd Sherman, YouTube's Shorts Product Lead, confirmed in a 2024 Creator Insider session that hashtags 'can be helpful' for Shorts — particularly event-based and topic-specific content. Niche hashtags work especially well on Shorts because that audience actively browses by interest category, making accurate topic hashtags a direct route to the right viewers.",
  },
  {
    q: "What hashtags should I avoid on YouTube?",
    a: "YouTube's official Help Center states that misleading or unrelated hashtags — using #Gaming on a cooking video, for example — may result in removal of your video or playlist. Beyond that policy risk, irrelevant hashtags backfire algorithmically: viewers who click an unrelated hashtag and immediately leave spike your bounce rate, signaling to YouTube that your video disappoints its audience, which suppresses your reach across all discovery channels. Also avoid exceeding 60 hashtags, using hashtags with spaces (they won't function), or spamming saturated tags like #viral or #fyp that describe zero specific content.",
  },
  {
    q: "How do I find the best hashtags for my YouTube niche?",
    a: "Start with this tool — enter your video topic, select your niche, and the AI builds a complete three-tier hashtag set (trending, niche, long-tail) in seconds. For manual research: open the top 3–5 ranking videos for your target keyword and read their descriptions for hashtags, then click those hashtag links to assess competition. Hashtags where your video quality can realistically compete with the top 10 results are the sweet spot. Cross-reference hashtags appearing in multiple top videos — those are already validated by YouTube's ranking system.",
  },
  {
    q: "Is the YouTube Hashtag Generator free to use?",
    a: "Yes — completely free, no account required, no usage limits. The AI-powered generator creates a full trending, niche, and long-tail hashtag set for any video topic or content category in seconds. Select individual hashtags or copy the full list as a space-separated block ready to paste into YouTube Studio. No premium tiers, no watermarks, no daily caps. Generate as many sets as your upload schedule demands.",
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
            {/* Answer-first citation capsule */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                YouTube videos appear in Google SERPs for{" "}
                <a href="https://www.semrush.com/blog/youtube-stats/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">791.3 million search queries in the US alone (Semrush, 2024)</a>
                {" "}— and YouTube is cited in{" "}
                <a href="https://searchengineland.com/youtube-ai-search-citations-data-462830" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">29.5% of Google AI Overviews, the highest citation rate of any domain (BrightEdge, 2024–2025)</a>.
                {" "}Hashtags strengthen the metadata layer that helps both YouTube and Google categorize your content correctly across every one of those surfaces.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              According to{" "}
              <a href="https://support.google.com/youtube/answer/6390658" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                YouTube's official Help Center
              </a>
              , hashtags create a dedicated discovery channel: clicking any hashtag opens a search page ranking all videos
              with that tag by relevance and watch time. That's a discovery pathway entirely separate from standard keyword
              search — one that reaches viewers who browse by topic rather than type a query. YouTube also reads hashtags
              as content categorization signals when placing your video in suggested video slots and the home feed.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Mismatched hashtags work against you. Using #viral or #fyp on a finance tutorial confuses YouTube's
              categorization system and can suppress your video across all discovery channels. Accurate hashtags that
              genuinely reflect your video's topic are what drive distribution — not volume. Pair these with a
              keyword-optimized{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube description
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                video title
              </Link>{" "}
              for compounding metadata signals.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> The Three-Layer Hashtag Strategy
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Effective YouTube hashtag strategies stack three layers simultaneously. Layer one: broad trending hashtags
              — #YouTube, #ContentCreator, #VideoMarketing. These won't rank your video alone (competition is enormous)
              but signal platform-wide ecosystem membership and can trigger related video suggestions to the right
              audience pools. Use 2–3 of these per video.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Layer two is niche hashtags specific to your content category. A fitness creator using #HomeWorkout and
              #FitnessMotivation reaches viewers actively browsing fitness content. A tech reviewer using #TechReview
              and #GadgetUnboxing lands in front of the technology enthusiast audience. Mid-volume niche hashtags offer
              the best ranking opportunity — large enough to drive meaningful traffic, specific enough to actually
              compete. Reinforce the same keywords in your{" "}
              <Link href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                video description
              </Link>{" "}
              for compounding SEO value.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Layer three is long-tail hashtags — highly specific combinations like #HomeWorkoutForBeginners or
              #YouTubeGrowthTips2026. Competition is minimal; a new channel can rank first for these immediately.
              A viewer clicking #HomeWorkoutForBeginners is looking for exactly what you made — that intent alignment
              drives both watch time and subscriber conversion. The AI generator builds all three layers in one pass,
              so you get a balanced strategy for every upload without hours of manual research.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> Hashtag Mistakes That Kill Your YouTube Reach
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The most common hashtag mistake — repeated across almost every YouTube SEO guide — is the claim that
              using more than 15 hashtags gets all of them ignored. That figure is wrong.{" "}
              <a href="https://support.google.com/youtube/answer/6390658" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                YouTube's official Help Center
              </a>{" "}
              states the actual threshold is <strong>more than 60 hashtags</strong>, at which point YouTube ignores
              every hashtag on the video. It also warns that over-tagging "may result in the removal of your video
              from your uploads or from search." The practical best practice is still 3–5 focused hashtags — not
              because 15 triggers a filter, but because quality beats quantity every time.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The second critical mistake is using irrelevant trending hashtags to hijack traffic. YouTube's spam
              policy explicitly states that misleading hashtags "may result in the removal of your video or playlist."
              Beyond the policy risk, irrelevant hashtags backfire algorithmically: viewers who click an off-topic
              hashtag and immediately leave spike your bounce rate, signaling to YouTube that your video disappoints
              its audience — which suppresses your reach across every discovery channel, not just the misused hashtag.
              Every hashtag must accurately describe your actual video content. Combine solid hashtag strategy with
              keyword-optimized{" "}
              <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                video tags
              </Link>{" "}
              and a high-CTR{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                title
              </Link>{" "}
              for a complete discoverability stack.
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
            "Keep hashtags between 3–5 per video. YouTube's official limit before all hashtags are ignored is 60 — but quality consistently beats quantity. Five targeted hashtags outperform twenty generic ones.",
            "Place hashtags at the end of your description — YouTube surfaces up to three of the most engaging ones as clickable links above your video title, so lead with your strongest.",
            "Mix all three tiers: 2–3 trending hashtags for ecosystem signaling, 3–5 niche hashtags for category placement, and 2–3 long-tail hashtags for high-intent qualified traffic.",
            "Customize hashtags for each video — applying identical hashtag sets to unrelated videos is flagged as repetitive spam behavior under YouTube's policy and reduces hashtag ranking benefit.",
            "Match your hashtags to your actual content. YouTube's Help Center states that misleading hashtags may result in video removal. Accurate hashtags also prevent bounce-rate damage from mismatched audiences.",
            "Reinforce hashtag keywords in your description — YouTube reads both signals, so consistent keyword usage across hashtags and description text strengthens your content category match.",
            "YouTube Shorts averaged 200 billion daily views in 2026 (YouTube CEO annual letter). Topic-specific hashtags help Shorts surface to the right interest-based audience segments in the feed.",
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
