import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Download, Copy, Check, ExternalLink, Image, AlertCircle,
  Loader2, ChevronDown, Search, Zap, TrendingUp, Shield,
  ListChecks, Link2, Maximize2, RefreshCw, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ThumbnailSpec {
  key: string;
  label: string;
  resolution: string;
  filename: string;
  priority: number;
}

interface ThumbnailResult extends ThumbnailSpec {
  url: string;
  status: "loading" | "available" | "unavailable";
}

// ─── Thumbnail Specs ──────────────────────────────────────────────────────────

const THUMBNAIL_SPECS: ThumbnailSpec[] = [
  { key: "maxresdefault", label: "Max Resolution", resolution: "1280×720 (HD)", filename: "maxres", priority: 1 },
  { key: "sddefault",     label: "Standard Definition", resolution: "640×480 (SD)", filename: "sd", priority: 2 },
  { key: "hqdefault",     label: "High Quality", resolution: "480×360 (HQ)", filename: "hq", priority: 3 },
  { key: "mqdefault",     label: "Medium Quality", resolution: "320×180 (MQ)", filename: "mq", priority: 4 },
  { key: "default",       label: "Default", resolution: "120×90 (SD)", filename: "default", priority: 5 },
];

// ─── URL Extraction ───────────────────────────────────────────────────────────

function extractVideoId(rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url) return null;

  // Safety: only accept youtube.com and youtu.be origins
  const allowed = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i;
  if (!allowed.test(url)) return null;

  // Reject dangerous content
  if (/<|>|javascript:/i.test(url)) return null;

  const pattern = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(pattern);
  return match?.[1] ?? null;
}

function buildThumbnailUrl(videoId: string, key: string): string {
  return `https://img.youtube.com/vi/${videoId}/${key}.jpg`;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube thumbnail?",
    a: "A YouTube thumbnail is the static preview image shown beside every video in search results, the homepage feed, and suggested video panels. According to YouTube's official Help Center, 90% of the best-performing videos on the platform use custom thumbnails — making it one of the most impactful metadata decisions a creator controls. YouTube's impressions data shows half of all channels operate at a 2–10% click-through rate; a stronger thumbnail is often the fastest way to move within that range.",
  },
  {
    q: "How do I download a YouTube thumbnail for free?",
    a: "Paste any YouTube video URL into the downloader above and click 'Get Thumbnails'. The tool instantly checks all five resolution versions — Max Resolution (1280×720), SD (640×480), HQ (480×360), MQ (320×180), and Default (120×90) — and shows only the ones that actually exist for that video. Click 'Download' on any card to save it as a JPG. No account or software installation needed.",
  },
  {
    q: "What is the difference between maxresdefault and hqdefault?",
    a: "maxresdefault.jpg is the highest available quality at 1280×720 pixels — the standard HD thumbnail displayed on desktop and TV. Not every video has it: older uploads and freshly published videos sometimes lack this resolution. hqdefault.jpg at 480×360 is the most reliably available fallback. The downloader checks each resolution using native browser image loading and hides any that don't exist, so you only see what's actually there.",
  },
  {
    q: "Why is the Max Resolution thumbnail not showing?",
    a: "YouTube generates the maxresdefault thumbnail only for videos processed for HD playback. Older uploads, brand-new videos still being processed, or content with very low view counts may only have hqdefault or smaller versions available. This is YouTube's CDN behavior, not a tool limitation — the downloader checks all five resolutions and surfaces every one that exists for the video you pasted.",
  },
  {
    q: "Can I download thumbnails from private or unlisted YouTube videos?",
    a: "Unlisted videos: yes — their thumbnails are publicly accessible via img.youtube.com because the video itself is technically accessible to anyone with the link. Private videos: no — they return a 404 from YouTube's thumbnail CDN and the tool cannot retrieve them. Age-restricted or region-blocked videos may also be unavailable depending on your location.",
  },
  {
    q: "Is it legal to download YouTube thumbnails?",
    a: "Thumbnails are creative works protected by copyright — they belong to the video creator or their rights holders, not YouTube and not the public. Downloading for personal reference, competitive research, design mood boards, or archiving your own content is widely considered acceptable fair use. Republishing, modifying, or using someone else's thumbnail commercially without permission is copyright infringement. The practical rule: use downloaded thumbnails to learn and get inspired; always create original thumbnails for your own videos.",
  },
  {
    q: "What resolution should my YouTube thumbnail be?",
    a: "YouTube's official Help Center (updated 2026) recommends 3840×2160 pixels (4K) as the ideal upload resolution — not the old 1280×720 figure that still circulates widely. The minimum accepted width is 640px. The 16:9 aspect ratio is required. Accepted formats are JPG, GIF, and PNG. Maximum file size is 50MB on desktop and 2MB on mobile. Uploading at 4K future-proofs your thumbnail for high-resolution displays; YouTube down-scales it appropriately for each surface.",
  },
  {
    q: "What formats does this YouTube thumbnail downloader support?",
    a: "The downloader accepts all standard YouTube URL formats: youtube.com/watch?v=VIDEO_ID, youtu.be/VIDEO_ID (short links), youtube.com/shorts/VIDEO_ID, and youtube.com/embed/VIDEO_ID. Paste any of these and the tool extracts the video ID automatically, then constructs and checks all five thumbnail resolution URLs on YouTube's img.youtube.com CDN.",
  },
  {
    q: "Can I copy the thumbnail URL instead of downloading?",
    a: "Yes — each thumbnail card has a 'Copy URL' button that copies the direct img.youtube.com image link to your clipboard. Paste that URL directly into Canva, Figma, Adobe Express, or Photoshop to pull the image in without saving it locally. This is useful when you want to reference a thumbnail in a design file without cluttering your downloads folder.",
  },
  {
    q: "How do I use downloaded thumbnails to improve my own CTR?",
    a: "Download the thumbnails from the top 5–10 videos ranking for your target keyword. Look for repeating patterns: color palette, text position, face expression style, background complexity, and contrast level. These patterns are validated by real viewer click behavior — they work in that niche. Then deliberately differentiate: if every top video uses a dark background, test a light one. YouTube's Test & Compare feature (available in YouTube Studio) lets you A/B test two thumbnails against each other using live impression data, so you can verify which design actually converts better before committing.",
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
    <div className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {index + 1}
          </span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
            {question}
          </span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Thumbnail Card ───────────────────────────────────────────────────────────

function ThumbnailCard({ result, videoId, onCopyUrl }: { result: ThumbnailResult; videoId: string; onCopyUrl: (url: string) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(result.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `youtube-thumbnail-${videoId}-${result.filename}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: direct link
      const a = document.createElement("a");
      a.href = result.url;
      a.download = `youtube-thumbnail-${videoId}-${result.filename}.jpg`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [result.url, result.filename, videoId]);

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(result.url).then(() => {
      setCopiedUrl(true);
      onCopyUrl(result.url);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  }, [result.url, onCopyUrl]);

  const qualityColor =
    result.key === "maxresdefault" ? "bg-green-500/10 text-green-600 border-green-500/30" :
    result.key === "sddefault"     ? "bg-primary/10 text-primary border-primary/30" :
    result.key === "hqdefault"     ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" :
                                     "bg-muted text-muted-foreground border-border";

  return (
    <>
      <div className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden flex flex-col">
        {/* Image Preview */}
        <div className="relative bg-muted/40 overflow-hidden" style={{ aspectRatio: "16/9" }}>
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          )}
          <img
            src={result.url}
            alt={`${result.label} YouTube thumbnail`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
          {/* Fullscreen overlay button */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
            aria-label="Preview fullscreen"
          >
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground text-sm">{result.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{result.resolution}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${qualityColor}`}>
              {result.key === "maxresdefault" ? "BEST" : result.key === "sddefault" ? "HD" : result.key === "hqdefault" ? "HQ" : result.key === "mqdefault" ? "MQ" : "SD"}
            </span>
          </div>

          <div className="flex gap-2 mt-auto">
            <Button
              onClick={handleDownload}
              size="sm"
              className="flex-1 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="gap-1.5 rounded-xl text-xs px-3"
              title="Copy thumbnail URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
            </Button>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs px-3 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={result.url} alt={result.label} className="w-full rounded-2xl shadow-2xl" />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
            <p className="text-center text-white/70 text-sm mt-3">{result.label} — {result.resolution}</p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function YouTubeThumbnailDownloaderTool() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<ThumbnailResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Inject FAQ JSON-LD schema
  useEffect(() => {
    const id = "faq-schema-yt-thumbnail-dl";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // Paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  }, []);

  // Check thumbnails via image loading (HEAD blocked by CORS)
  const loadThumbnails = useCallback((vid: string) => {
    const results: ThumbnailResult[] = THUMBNAIL_SPECS.map(spec => ({
      ...spec,
      url: buildThumbnailUrl(vid, spec.key),
      status: "loading" as const,
    }));
    setThumbnails(results);
    setLoading(false);

    // Use Image objects to test availability
    results.forEach((result, i) => {
      const img = new window.Image();
      img.onload = () => {
        setThumbnails(prev =>
          prev.map((t, idx) => idx === i ? { ...t, status: "available" } : t)
        );
      };
      img.onerror = () => {
        setThumbnails(prev =>
          prev.map((t, idx) => idx === i ? { ...t, status: "unavailable" } : t)
        );
      };
      img.src = result.url;
    });
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setThumbnails([]);
    setVideoId(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube video URL.");
      return;
    }

    const vid = extractVideoId(trimmed);
    if (!vid) {
      setError("Invalid YouTube URL. Please enter a valid YouTube video link (e.g. youtube.com/watch?v=... or youtu.be/...).");
      return;
    }

    setLoading(true);
    setVideoId(vid);
    // Small delay for UX feedback
    setTimeout(() => loadThumbnails(vid), 400);
  }, [url, loadThumbnails]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  }, [handleSubmit]);

  const handleCopyUrl = useCallback((copiedUrl: string) => {
    toast({ title: "URL copied!", description: "Thumbnail URL copied to clipboard." });
  }, [toast]);

  const availableThumbnails = thumbnails.filter(t => t.status === "available");
  const loadingCount = thumbnails.filter(t => t.status === "loading").length;
  const allChecked = thumbnails.length > 0 && loadingCount === 0;

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
            🖼️
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">YouTube Thumbnail Downloader</h2>
            <p className="text-sm text-muted-foreground">Download HD thumbnails from any YouTube video instantly — free, no signup</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste YouTube video URL here... (youtube.com/watch?v=... or youtu.be/...)"
                  className="pr-24 rounded-xl h-12 text-sm border-border focus:border-primary/50 bg-background"
                  aria-label="YouTube video URL"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-semibold hover:text-primary/70 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Paste
                </button>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-6 rounded-xl font-semibold gap-2 shrink-0"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Fetching…</>
                ) : (
                  <><Image className="w-4 h-4" /> Get Thumbnails</>
                )}
              </Button>
            </div>

            {/* Supported formats hint */}
            <p className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              <span className="font-medium text-foreground">Supported formats:</span>
              <span>youtube.com/watch?v=</span>
              <span>youtu.be/</span>
              <span>youtube.com/shorts/</span>
              <span>youtube.com/embed/</span>
            </p>
          </form>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Invalid YouTube URL</p>
                <p className="text-xs mt-0.5 opacity-80">Please enter a valid YouTube video link</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {thumbnails.length > 0 && (
        <div className="mt-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <h3 className="font-bold text-foreground text-lg">
                {allChecked
                  ? `${availableThumbnails.length} thumbnail${availableThumbnails.length !== 1 ? "s" : ""} found`
                  : "Checking thumbnails…"
                }
              </h3>
              {videoId && (
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  Video ID: {videoId}
                </p>
              )}
            </div>
            <button
              onClick={() => { setUrl(""); setThumbnails([]); setVideoId(null); setError(null); inputRef.current?.focus(); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New search
            </button>
          </div>

          {/* Loading indicator */}
          {!allChecked && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Checking {loadingCount} resolution{loadingCount !== 1 ? "s" : ""}…
            </div>
          )}

          {/* Thumbnails grid */}
          {availableThumbnails.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {availableThumbnails.map(result => (
                <ThumbnailCard
                  key={result.key}
                  result={result}
                  videoId={videoId!}
                  onCopyUrl={handleCopyUrl}
                />
              ))}
            </div>
          ) : allChecked ? (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
              <Image className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-foreground">No thumbnails available</p>
              <p className="text-sm text-muted-foreground mt-1">This video may be private or the URL might be incorrect.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Download YouTube Thumbnails</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Paste the YouTube Video URL", desc: "Copy the link from YouTube (or use the Paste button) and paste it into the input field. The tool accepts all YouTube formats — standard watch links, Shorts, embed URLs, and shortened youtu.be links." },
            { step: 2, title: "Click 'Get Thumbnails'", desc: "Hit the Get Thumbnails button. The tool instantly extracts the video ID and checks all five thumbnail resolutions: Max Resolution, SD, HQ, MQ, and Default." },
            { step: 3, title: "Preview and Select a Resolution", desc: "All available thumbnails are shown in a grid. Click any thumbnail to view it fullscreen before downloading. The highest available resolution is labeled 'BEST' for easy identification." },
            { step: 4, title: "Download, Copy URL, or Open in Tab", desc: "Click 'Download' to save the thumbnail as a JPG file named youtube-thumbnail-VIDEO_ID-quality.jpg. Use 'Copy URL' to copy the direct image link to your clipboard, or open the image in a new tab for a closer look." },
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

      {/* ── About This Tool ──────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Thumbnail Downloader</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why YouTube Thumbnails Are Your Highest-Leverage Asset
            </h3>
            {/* Citation capsule — answer-first */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <a href="https://support.google.com/youtube/answer/12340300" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">YouTube's official Help Center</a> states that <strong className="text-foreground">90% of the best-performing videos on YouTube use custom thumbnails</strong>. The same documentation confirms that half of all channels operate at a 2–10% impressions click-through rate. Your thumbnail is the single variable that separates those two outcomes — it's what the viewer sees before they decide whether your video exists for them at all.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A thumbnail isn't decoration. It is the first metadata signal a viewer evaluates — before the title, before the channel name, before anything else loads. YouTube's algorithm amplifies this: higher CTR from early impressions triggers wider distribution, which compounds into more impressions, more clicks, and more watch time. The thumbnail starts that loop. Everything else sustains it.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <a href="https://support.google.com/youtube/answer/72431" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube's current official specifications (updated 2026)</a> recommend uploading thumbnails at <strong className="text-foreground">3840×2160 pixels (4K)</strong> — not the outdated 1280×720 figure that still appears across most guides. Minimum accepted width is 640px, 16:9 ratio required, formats: JPG, GIF, or PNG, maximum file size 50MB on desktop and 2MB on mobile.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Who Downloads YouTube Thumbnails and Why
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This tool is used across a broader range of workflows than most people expect:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[
                { who: "YouTubers & Creators", why: "Competitive research — download the top 10 thumbnails ranking for a target keyword and reverse-engineer which visual patterns drive clicks in that niche." },
                { who: "Graphic Designers", why: "Mood board reference — pull real thumbnails when briefing clients or building design systems for YouTube channels." },
                { who: "Content Marketers", why: "Blog and newsletter embeds — use thumbnail URLs directly in articles to preview linked YouTube content without hosting images separately." },
                { who: "Channel Managers", why: "Archive and backup — download your own channel's thumbnails before migrating platforms or refreshing branding." },
              ].map(({ who, why }) => (
                <div key={who} className="p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="font-semibold text-foreground text-sm mb-1">{who}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{why}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">The competitor research workflow</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Download thumbnails from the top 5 ranking videos for your keyword. Look for repeating patterns: color palette, text placement, face vs. no face, background complexity. A{" "}
                <a href="https://www.searchenginejournal.com/do-faces-help-youtube-thumbnails-heres-what-the-data-says/563944/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  2025 study of 300,000 YouTube videos by 1of10 Media (published in Search Engine Journal)
                </a>{" "}
                found that face impact on CTR is niche-dependent — faces significantly help in Finance content but can hurt in Business content. Download real thumbnails from your specific niche to understand what actually drives clicks there, not what a general rule predicts.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-primary" /> How This Thumbnail Downloader Works
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube stores thumbnails for every public video on its content delivery network at <code className="bg-muted px-1.5 py-0.5 rounded text-xs">img.youtube.com</code>. The URL structure is predictable:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">img.youtube.com/vi/VIDEO_ID/QUALITY_KEY.jpg</code> — where the quality key is one of: <code className="bg-muted px-1 py-0.5 rounded text-xs">maxresdefault</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">sddefault</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">hqdefault</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">mqdefault</code>, or <code className="bg-muted px-1 py-0.5 rounded text-xs">default</code>. You can construct these URLs manually for any public video if you know the ID.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This tool does that work automatically. It safely extracts the video ID from any YouTube URL format you paste — standard watch links, youtu.be short links, Shorts URLs, embed links — constructs all five resolution URLs, and checks each one using native browser image loading. If a resolution doesn't exist for that video, the card is hidden automatically. You only see what's actually available.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The download runs entirely in your browser. No data is sent to any server — the thumbnail comes directly from YouTube's CDN to your device. The saved file is named <code className="bg-muted px-1 py-0.5 rounded text-xs">youtube-thumbnail-VIDEO_ID-quality.jpg</code> so you can immediately identify the source video and resolution without opening the file.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> A Note on Copyright
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              YouTube thumbnails are creative works protected by copyright — they belong to the video creator or their rights holders. Some tools incorrectly describe thumbnails as "public domain" because the URLs are publicly accessible. Accessibility is not the same as license.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: "✓ Generally acceptable", items: ["Competitive research and design inspiration", "Mood boards and briefing documents", "Blog or newsletter embeds linking to the video", "Backing up your own channel's thumbnails"] },
                { label: "✗ Requires creator permission", items: ["Publishing or sharing someone else's thumbnail as your own", "Commercial use in ads, merchandise, or paid content", "Modifying and republishing another creator's thumbnail", "Using a thumbnail to misrepresent the original video"] },
              ].map(({ label, items }) => (
                <div key={label} className="p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="font-semibold text-foreground text-sm mb-2">{label}</p>
                  <ul className="space-y-1">
                    {items.map(item => (
                      <li key={item} className="text-xs text-muted-foreground leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border">
              This is general guidance, not legal advice. If you have specific questions about using a thumbnail commercially, consult a qualified IP attorney.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tips & Best Practices ────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips for Analyzing & Improving YouTube Thumbnails</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Download the top 5 thumbnails ranking for your target keyword before designing yours — these are validated by real viewer CTR in your specific niche, not by generic design rules.",
            "Design for the smallest display size first. YouTube shows thumbnails at 120×90 pixels on mobile — if your text isn't readable at that size, it won't drive clicks there.",
            "Faces help in some niches, not all. A 2025 study of 300,000 YouTube videos found face impact is category-specific: faces lift CTR in Finance content but can reduce it in Business content. Test in your niche before assuming faces always win.",
            "Limit thumbnail text to 4–5 words maximum — enough to reinforce the title's promise, not enough to clutter the visual. Text competes with your image at small sizes.",
            "Check competitor color palettes, then deliberately contrast. If every top video in your niche uses dark backgrounds and red accents, a clean white thumbnail with black text immediately stands out in that feed.",
            "Use YouTube Studio's Test & Compare feature to A/B test two thumbnails against real impressions data. YouTube rotates both versions and shows which earns higher CTR — letting viewer behavior decide, not your gut.",
            "Archive your best-performing thumbnails by downloading them here. When you rebrand or refresh a channel, these files help a designer understand which visual language actually converted for your audience.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
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
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Generate 40+ high-CTR title formulas to pair with your eye-catching thumbnail." },
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Create SEO-optimized tags to help your videos rank alongside their thumbnails." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Write keyword-rich descriptions that complement your title and thumbnail strategy." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your title and description for SEO quality before you publish." },
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

      {/* ── FAQ Accordion ────────────────────────────────────── */}
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
