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
    q: "What are YouTube tags and do they still matter in 2026?",
    a: "YouTube tags are keywords you add when uploading a video to help YouTube understand the topic and context of your content. In 2026, tags carry less algorithmic weight than your title and description, but they still help with discovery in two specific ways: they improve rankings for misspelled search queries and help YouTube's system categorize niche content where the title alone is ambiguous. Seeing a competitor's tags lets you understand their full keyword strategy — not just what's in their title.",
  },
  {
    q: "Are YouTube tags public? Can anyone see them?",
    a: "YouTube removed visible tags from the public video page in 2021, so viewers cannot see them by scrolling the page. However, the tags are still embedded in the page's source code inside YouTube's ytInitialData JavaScript object. This tool reads that source data and surfaces the tags for any public video — the same method used by professional SEO tools like TubeBuddy and vidIQ.",
  },
  {
    q: "Why does this video show zero tags?",
    a: "Many YouTube creators — including some of the largest channels — choose not to add any tags to their videos. This is a deliberate strategy: channels with strong brand recognition rely on titles, thumbnails, and watch signals rather than keyword tags. A zero-tag result is not an error. It means the creator uploaded that video without adding keywords in YouTube Studio.",
  },
  {
    q: "How do I use competitor tags to grow my channel?",
    a: "Extract tags from the top 3–5 videos ranking for your target keyword. Look for tags that appear across multiple competitor videos — these are the keywords YouTube's system has already validated as relevant to that topic. Add the most relevant ones to your own video. Do not copy every tag verbatim; use them as a research signal to identify the keyword variations and related topics you should be targeting.",
  },
  {
    q: "How many tags should I add to my YouTube video?",
    a: "YouTube allows up to 500 characters across all tags combined. Most high-performing videos use 8–15 tags covering: the exact target keyword, 2–3 keyword variations, 2–3 broader topic tags, and 1–2 channel-brand tags. Fewer focused tags outperform a long list of loosely related ones — YouTube's system weighs tag relevance against your video's actual content.",
  },
  {
    q: "Does this tool work on YouTube Shorts?",
    a: "Yes. Paste any YouTube Shorts URL (youtube.com/shorts/VIDEO_ID) into the extractor. Shorts support the same tag system as regular videos, though many Shorts creators rely on hashtags in the description instead. If a Shorts video shows zero tags, check the description for hashtags — those serve a similar discovery function for short-form content.",
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
                Many creators — including large channels — upload without tags. This is a valid strategy
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
        <ol className="space-y-4 not-prose">
          {[
            { step: "1", title: "Copy the YouTube video URL", desc: "Go to any YouTube video — including a competitor's video. Copy the URL from the address bar, or right-click the video and select 'Copy video URL'." },
            { step: "2", title: "Paste it into the tool", desc: "Paste the URL into the input field above. The extractor accepts youtube.com/watch?v=..., youtu.be/... short links, YouTube Shorts URLs, and embed links." },
            { step: "3", title: "Click Extract Tags", desc: "The tool fetches the video's page and reads the hidden keyword data embedded in YouTube's source code. Results appear in under 3 seconds for most videos." },
            { step: "4", title: "Copy the tags you want to use", desc: "Click any individual tag chip to copy it, or use 'Copy All Tags' to get the full list as a comma-separated string ready to paste into YouTube Studio." },
            { step: "5", title: "Use the tags as keyword research", desc: "Look for tags that appear across multiple top-ranking videos for your target keyword. Those are the terms YouTube's algorithm has already validated as relevant. Use the most fitting ones in your own videos." },
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

      {/* ── About ── */}
      <section className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="flex items-center gap-2 text-2xl font-bold font-display border-b border-border pb-4 mb-6">
          <FileText className="text-primary w-6 h-6" /> About the YouTube Tag Extractor
        </h2>
        <div className="space-y-4 not-prose">
          <p className="text-muted-foreground leading-relaxed">
            YouTube removed visible tags from the public video interface in 2021, making it
            impossible for creators to see a competitor's full keyword strategy just by watching
            their videos. The tags are still there — embedded in the page's source code inside
            YouTube's <code className="bg-muted px-1.5 py-0.5 rounded text-sm">ytInitialData</code> object —
            but reading them requires a tool that can access and parse that raw data.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This extractor reads that source data directly and returns the complete tag list for
            any public YouTube video. No browser extension needed, no account required, and no
            limit on how many videos you can check. The same underlying data powers paid tools
            like TubeBuddy and vidIQ — this tool gives you that same extraction for free.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              { icon: <Zap className="w-5 h-5" />, title: "Instant Results", desc: "Tags extracted from YouTube's page source in under 3 seconds — no waiting, no queues." },
              { icon: <Shield className="w-5 h-5" />, title: "No Account Needed", desc: "Paste any public YouTube URL and get the tags. No sign-up, no extension, no API key." },
              { icon: <TrendingUp className="w-5 h-5" />, title: "Real Competitor Data", desc: "See the exact keywords your top-ranking competitors are targeting — not AI guesses." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-muted/40 rounded-2xl p-5 border border-border">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  {icon}
                </div>
                <p className="font-semibold text-foreground mb-1 text-sm">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/40 border border-border rounded-2xl p-5 mt-2">
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" /> When to use this tool
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Before uploading a new video — extract tags from the top 3 ranking videos for your target keyword</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Auditing older videos — check if your tags still match how YouTube categorises similar content</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Competitor research — understand the full keyword scope of channels growing faster than yours</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Finding keyword variations — tags often reveal long-tail phrases not visible in a video's title</li>
            </ul>
          </div>

          <p className="text-muted-foreground leading-relaxed text-sm">
            For a complete YouTube SEO workflow, pair this tool with the{" "}
            <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
              YouTube Tag Generator
            </Link>{" "}
            (to build your own tag list from scratch),{" "}
            <Link href="/tools/youtube-keyword-generator" className="text-primary hover:underline font-medium">
              YouTube Keyword Generator
            </Link>{" "}
            (to validate search demand), and the{" "}
            <Link href="/tools/youtube-seo-score-checker" className="text-primary hover:underline font-medium">
              YouTube SEO Score Checker
            </Link>{" "}
            (to grade your video's full metadata before upload).
          </p>
        </div>
      </section>

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
