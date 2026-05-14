import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Tag, Copy, Check, Loader2, Search, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, Zap,
  ListChecks, HelpCircle, FileText, Shield, TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtractResult {
  videoId: string;
  title: string;
  tags: string[];
  count: number;
}

// ─── URL Helpers ──────────────────────────────────────────────────────────────

function extractVideoId(rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url) return null;
  const allowed = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i;
  if (!allowed.test(url)) return null;
  const pattern = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(pattern);
  return match?.[1] ?? null;
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Do YouTube tags still matter in 2026?",
    a: "Tags play a supporting role, not a starring one. YouTube's own help documentation states they have a \"minimal\" impact on discovery, your title, thumbnail, and description carry far more weight. Where tags still earn their place: they measurably improve rankings for misspelled search queries, and a Briggsby study analyzing 3.8 million data points found videos using 200–300 characters of tags outperformed those with sparse or no tags, particularly in the first three months after upload.",
  },
  {
    q: "Are YouTube tags public? Can anyone see them?",
    a: "Tags have been hidden from the public watch page since August 2012, when YouTube removed them to stop algorithm abuse, their words, not ours. The tags still exist in the page's source code inside YouTube's ytInitialData JavaScript object. This extractor reads that raw source data and returns the full tag list for any public video, the same underlying method used by paid tools like TubeBuddy and vidIQ. You just don't have to pay for it here.",
  },
  {
    q: "Why does this video show zero tags?",
    a: "Zero tags is not an error, it's a valid creator choice. Many large channels skip tags entirely and rely on title keywords, thumbnail click-through rate, and watch time signals to rank. According to a Briggsby study of 100,000 YouTube videos, roughly one-third of top-ranked videos don't include the exact target keyword in their tags at all. If a competitor shows zero tags, their growth engine is elsewhere: check their title structure and thumbnail strategy instead.",
  },
  {
    q: "How do I use competitor tags to grow my channel?",
    a: "Pull tags from the top 3–5 videos ranking for your target keyword. Cross-reference the lists and flag tags appearing in two or more of those videos, those are terms YouTube's algorithm has already validated as relevant to that search query. Add the most accurate ones to your own upload. Don't copy blindly; tags that don't match your actual video content can confuse YouTube's categorization system and hurt rather than help. Use them as a keyword research signal, not a copy-paste shortcut.",
  },
  {
    q: "How many tags should I add to my YouTube video?",
    a: "A Briggsby analysis of 100,000 YouTube videos found the 31–40 distinct tag range correlated with the strongest view performance, with optimal total character usage between 200–300 characters. YouTube Studio enforces a 500-character cap across all tags on a video. In practice: use enough tags to cover your primary keyword, 2–3 variations, 2–3 broader topic terms, and your channel brand, then stop. Padding with loosely related tags does not help and may dilute relevance signals.",
  },
  {
    q: "Does this tool work on YouTube Shorts?",
    a: "Yes. Paste any YouTube Shorts URL (youtube.com/shorts/VIDEO_ID) and the extractor pulls the full tag list the same way it does for long-form videos. Shorts support the same tag system, though many Shorts creators skip tags and use hashtags in the description instead, hashtags function as a separate discovery signal for short-form content. If a Shorts video returns zero tags, look at the first comment and description for hashtags to understand their keyword targeting.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground hover:bg-muted/40 transition-colors gap-3"
      >
        <span>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-primary" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground leading-relaxed text-sm border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouTubeTagExtractorTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    // Client-side validation
    if (!extractVideoId(trimmed)) {
      setError("Please enter a valid YouTube video URL (youtube.com/watch?v=... or youtu.be/...).");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch(
        `/api/scraper/extract-tags?url=${encodeURIComponent(trimmed)}`
      );
      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error ?? data.detail ?? "Extraction failed. Please try again.");
        return;
      }

      setResult(data as ExtractResult);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    toast({ title: "Copied!", description: `"${tag}" copied to clipboard.`, duration: 2000 });
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const copyAllTags = () => {
    if (!result?.tags.length) return;
    navigator.clipboard.writeText(result.tags.join(", "));
    setCopiedAll(true);
    toast({
      title: "All tags copied!",
      description: `${result.count} tags copied as a comma-separated list.`,
      duration: 2500,
    });
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="space-y-10">

      {/* ── Input Card ── */}
      <div className="p-1 border border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleExtract} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="yt-url" className="text-sm font-bold text-foreground tracking-wide uppercase">
                YouTube Video URL
              </label>
              <div className="flex gap-3">
                <Input
                  id="yt-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(null); }}
                  className="flex-1 h-12 text-base bg-muted/50 focus-visible:ring-primary/30 border-muted-foreground/20 rounded-xl"
                  aria-label="YouTube video URL input"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || !url.trim()}
                  className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 shrink-0"
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extracting...</>
                    : <><Search className="mr-2 h-4 w-4" /> Extract Tags</>}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Works with any public YouTube video, Short, or embed link.
              </p>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <div ref={resultsRef} className="scroll-mt-24 space-y-6 animate-in slide-in-from-bottom-6 duration-500">

          {/* Video info bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate max-w-[400px]" title={result.title}>
                  {result.title || "YouTube Video"}
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${result.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Watch on YouTube <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <span className="bg-primary/10 text-primary text-sm font-bold px-4 py-1.5 rounded-full shrink-0">
              {result.count} {result.count === 1 ? "tag" : "tags"} found
            </span>
          </div>

          {result.count === 0 ? (
            /* No tags state */
            <div className="text-center py-14 border-2 border-dashed border-border rounded-2xl">
              <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-foreground mb-1">This video has no tags</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Many creators, including large channels, upload without tags. This is a valid strategy
                for channels that rely on title, thumbnail, and watch signals alone.
              </p>
            </div>
          ) : (
            <>
              {/* Copy all button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Click any tag to copy it individually.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAllTags}
                  className="rounded-xl gap-2 font-semibold border-primary/30 hover:border-primary hover:bg-primary/5"
                >
                  {copiedAll
                    ? <><Check className="w-4 h-4 text-green-500" /> Copied!</>
                    : <><Copy className="w-4 h-4" /> Copy All Tags</>}
                </Button>
              </div>

              {/* Tag chips */}
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => copyTag(tag)}
                    title={`Click to copy: ${tag}`}
                    className={`
                      group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium
                      border transition-all duration-150
                      ${copiedTag === tag
                        ? "bg-green-500/10 border-green-500/30 text-green-600"
                        : "bg-muted/60 border-border text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                      }
                    `}
                  >
                    {copiedTag === tag
                      ? <Check className="w-3 h-3" />
                      : <Tag className="w-3 h-3 opacity-50 group-hover:opacity-100" />}
                    {tag}
                  </button>
                ))}
              </div>

              {/* Copy for YouTube Studio note */}
              <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3 border border-border">
                <strong>Tip:</strong> Use "Copy All Tags" to paste directly into the Tags field in YouTube Studio.
                YouTube accepts comma-separated tags.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── How to Use ── */}
      <section className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="flex items-center gap-2 text-2xl font-bold font-display border-b border-border pb-4 mb-6">
          <HelpCircle className="text-primary w-6 h-6" /> How to Use the YouTube Tag Extractor
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6 not-prose">
          YouTube tags have been hidden from the public watch page since 2012, but they're still
          embedded in every video's source code. This tool reads that data in seconds. Here's
          how to turn a competitor's tag list into a keyword research advantage.
        </p>
        <ol className="space-y-4 not-prose">
          {[
            {
              step: "1",
              title: "Find a top-ranking competitor video",
              desc: "Search YouTube for your target keyword and open one of the top 3–5 results. These are the videos YouTube's algorithm has already decided are the most relevant, their tags are validated signals, not guesses.",
            },
            {
              step: "2",
              title: "Copy the video URL",
              desc: "Copy the URL from your browser's address bar, or right-click the video and choose 'Copy video URL'. The extractor accepts standard watch links (youtube.com/watch?v=...), short links (youtu.be/...), YouTube Shorts URLs, and embed links.",
            },
            {
              step: "3",
              title: "Paste and click Extract Tags",
              desc: "Paste the URL into the field above and click Extract Tags. The tool reads the keyword metadata embedded in YouTube's page source and returns the complete tag list, the same data that powers paid tools like TubeBuddy and vidIQ.",
            },
            {
              step: "4",
              title: "Copy the tags you need",
              desc: "Click any tag chip to copy it individually, or hit 'Copy All Tags' for the full comma-separated list. That format pastes directly into the Tags field in YouTube Studio without any reformatting.",
            },
            {
              step: "5",
              title: "Cross-reference across multiple videos",
              desc: "Run the tool on the top 3–5 ranking videos for your keyword. Tags appearing in two or more of those videos are the terms YouTube has already validated as relevant to that search query, prioritize those when tagging your own upload.",
            },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                {step}
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">{title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Tag Extractor</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This YouTube Tag Extractor Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube tags were hidden from the public watch page in August 2012, but they're still
              embedded in every video's source code inside the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ytInitialData</code> object.{" "}
              <a
                href="https://backlinko.com/youtube-ranking-factors"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Backlinko's analysis of 1.3 million YouTube videos
              </a>{" "}
              confirms keyword-matched tags show a small but measurable correlation with rankings,
              particularly for new channels in their first three months. This tool reads that raw
              source data instantly and gives you the full tag list for any public video, free.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You paste a YouTube URL. The extractor reads the page source and returns every tag
              the creator added. Click a tag chip to copy it individually, or hit "Copy All Tags"
              for the full comma-separated list that pastes directly into YouTube Studio. No
              account, no browser extension, no API key required.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              For a full tagging workflow, use this tool alongside the{" "}
              <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                YouTube Tag Generator
              </Link>{" "}
              to build your own tag list from scratch, and the{" "}
              <Link href="/tools/youtube-keyword-generator" className="text-primary hover:underline font-medium">
                YouTube Keyword Generator
              </Link>{" "}
              to validate search demand before you film.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Extracting Competitor Tags Speeds Up Your Research
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Tags are one of three text signals YouTube uses to understand video content, alongside
              title and description.{" "}
              <a
                href="https://support.google.com/youtube/answer/146402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                YouTube's own Help Center
              </a>{" "}
              states that tags help the platform "understand your video's content and context" and
              associate it with related videos. Seeing what tags a top-ranking competitor uses
              tells you exactly how YouTube is categorizing that content: no guessing required.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Don't just copy a competitor's tag list wholesale. That's the wrong move.{" "}
              <a
                href="https://www.briggsby.com/reverse-engineering-youtube-search"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Briggsby's study of 3.8 million data points across 100,000 YouTube videos
              </a>{" "}
              found videos using 200 to 300 characters of accurate, relevant tags outperformed
              those with sparse or irrelevant tags. Pull tags from the top 3 to 5 ranking videos
              for your target keyword, cross-reference for overlap, and add only the terms that
              genuinely match your video content. Tags that don't fit confuse the algorithm.
            </p>
          </div>

          {/* YouTube Embed */}
          <figure style={{margin:"1rem 0 2rem",position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"12px"}}>
            <iframe style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}}
              srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/WM8FjVjd0F4?autoplay=1'><img src='https://img.youtube.com/vi/WM8FjVjd0F4/maxresdefault.jpg' alt='YouTube SEO: How to Rank YouTube Videos in 2024'><span>&#9654;</span></a>"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube SEO: How to Rank YouTube Videos in 2024"
              aria-label="Backlinko tutorial covering YouTube SEO ranking factors including tags, titles, and descriptions for 2024">
            </iframe>
            <noscript><a href="https://www.youtube.com/watch?v=WM8FjVjd0F4" target="_blank" rel="noopener">Watch: YouTube SEO - How to Rank YouTube Videos in 2024 on YouTube</a></noscript>
          </figure>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This YouTube Tag Extractor
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "See the exact tags any YouTube video uses, copy competitor strategy instantly",
                "Understand which keywords top-ranked videos in your niche are targeting",
                "Build your own tag library from videos that are already performing well",
                "Extract tags from multiple videos to find the overlapping keywords in your niche",
                "Reduce research time from hours to seconds: no YouTube Studio access needed",
                "Spot underused niche tags competitors rank for that you haven't tried yet",
                "Verify whether a video is tag-optimised before using it as a benchmark",
                "Use alongside the YouTube Tag Generator for a complete tagging workflow",
                "Works on any public YouTube video: no API key or account required",
                "100% free, unlimited extractions, copy-paste ready, no signup needed",
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

      {/* ── Citation Capsule ──────────────────────────────────── */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Source documentation:</strong>{" "}
          YouTube tags help the algorithm "understand your video's content and context" and
          associate it with related videos, according to the{" "}
          <a href="https://support.google.com/youtube/answer/146402" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            YouTube Help Center
          </a>
          . Tags are one of three text signals YouTube uses alongside title and description.{" "}
          <a href="https://www.briggsby.com/reverse-engineering-youtube-search" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Briggsby's analysis of 3.8 million data points
          </a>{" "}
          found 200 to 300 characters of relevant tags correlated with stronger view performance,
          especially in the first three months after upload.
        </p>
      </div>

      {/* ── FAQ ── */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-bold font-display border-b border-border pb-4 mb-6">
          <HelpCircle className="text-primary w-6 h-6" /> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

    </div>
  );
}
