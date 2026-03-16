import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Download, Copy, Check, ExternalLink, Image, AlertCircle,
  Loader2, ChevronDown, Search, Zap, TrendingUp, Shield,
  ListChecks, Link2, Maximize2, RefreshCw,
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
    a: "A YouTube thumbnail is the static preview image displayed before a video plays — it is the first visual impression viewers get when browsing YouTube search results, homepages, and suggested videos. Thumbnails are typically 1280×720 pixels (16:9 aspect ratio) and are one of the biggest factors influencing whether someone clicks on a video.",
  },
  {
    q: "How do I download a YouTube thumbnail for free?",
    a: "Paste any YouTube video URL into the downloader above and click 'Get Thumbnails'. The tool instantly shows all available resolution versions — Max Resolution, SD, HQ, MQ, and Default — with individual download buttons. Click 'Download' on any card to save it as a JPG file. No account or software installation is needed.",
  },
  {
    q: "What is the difference between maxresdefault and hqdefault?",
    a: "maxresdefault.jpg is the highest quality thumbnail at 1280×720 pixels — this is the standard HD thumbnail. However, not all videos have this size available (especially older or low-view videos). hqdefault.jpg is always available at 480×360 pixels and is the most reliable fallback. The tool automatically detects which resolutions exist and hides unavailable ones.",
  },
  {
    q: "Why is the Max Resolution thumbnail not showing?",
    a: "YouTube only generates a maxresdefault thumbnail for videos that have been processed for HD playback. Older videos, newly uploaded videos, or videos with very low view counts may only have hqdefault or lower-quality thumbnails available. The downloader checks each resolution and displays only the ones that exist.",
  },
  {
    q: "Can I download thumbnails from private or unlisted YouTube videos?",
    a: "No — YouTube thumbnail images are served from img.youtube.com, which only exposes thumbnails for public and unlisted videos. Private videos are fully restricted and their thumbnail URLs return a 404 error, so the tool cannot retrieve them.",
  },
  {
    q: "Is it legal to download YouTube thumbnails?",
    a: "Thumbnails are typically protected by copyright and belong to the video creator or their rights holders. Downloading them for personal reference, competitive research, or presentation mockups is generally acceptable. However, republishing or using someone else's thumbnail commercially without permission may infringe on their copyright. Always create your own original thumbnails for your videos.",
  },
  {
    q: "What resolution should my YouTube thumbnail be?",
    a: "YouTube's recommended thumbnail resolution is 1280×720 pixels with a 16:9 aspect ratio and a maximum file size of 2MB. Use JPG or PNG format. This size displays correctly across all devices — desktop, mobile, and TV — and is sharp enough that text and faces remain readable even at smaller sizes.",
  },
  {
    q: "What formats does this YouTube thumbnail downloader support?",
    a: "The downloader supports all standard YouTube URL formats: youtube.com/watch?v=VIDEO_ID, youtu.be/VIDEO_ID, youtube.com/shorts/VIDEO_ID, and youtube.com/embed/VIDEO_ID. Paste any of these formats and the tool will automatically extract the video ID and retrieve all available thumbnails.",
  },
  {
    q: "Can I copy the thumbnail URL instead of downloading?",
    a: "Yes — each thumbnail card has a 'Copy URL' button that copies the direct image link to your clipboard. You can then paste the URL directly into Canva, Figma, Photoshop, or any other design tool to pull the thumbnail in without downloading the file locally first.",
  },
  {
    q: "How do I make better YouTube thumbnails?",
    a: "The most effective YouTube thumbnails share four traits: a close-up, expressive face; bold, high-contrast text (3–5 words maximum); a single focal point; and colors that stand out against YouTube's white background. Study your competitors' top-performing thumbnails using this downloader, identify visual patterns that drive clicks, and apply those patterns to your own designs.",
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
              <Zap className="w-4 h-4 text-primary" /> What Are YouTube Thumbnails?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              A YouTube thumbnail is the preview image shown beside every video in YouTube search results,
              the homepage feed, and suggested video panels. It is the single most important visual element
              a creator controls — studies show that over 90% of top-performing YouTube videos have custom
              thumbnails. A compelling thumbnail can increase click-through rate (CTR) from 2% to 10% or
              higher, which directly signals to YouTube's algorithm that your content deserves wider
              distribution.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Content Creators Download YouTube Thumbnails
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              There are many legitimate reasons a YouTube creator or content marketer might need to download
              a thumbnail. The most common use case is competitive research — studying what visual styles,
              color palettes, text placements, and facial expressions drive clicks in a specific niche.
              By downloading and analyzing the top 10 thumbnails in your niche, you can reverse-engineer
              what works and apply those principles to your own designs.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Other common uses include: creating media kits or press releases that feature existing video
              content; embedding thumbnails in blog posts, newsletters, or presentations to preview video
              content; backing up your own channel's thumbnails for archiving; and using thumbnails as
              mood board references when briefing graphic designers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-primary" /> How This YouTube Thumbnail Downloader Works
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube stores thumbnails for every public video on its own content delivery network at
              img.youtube.com. The URLs follow a predictable pattern: the video ID embedded in the path
              followed by the quality key (maxresdefault, sddefault, hqdefault, mqdefault, or default).
              This tool uses a regex to safely extract the video ID from any YouTube URL format you paste —
              including youtube.com/watch, youtu.be short links, Shorts URLs, and embed links — and
              constructs all five thumbnail URLs automatically.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Not every quality level exists for every video. Older videos and freshly uploaded content
              sometimes lack the maxresdefault (1280×720) thumbnail. To handle this gracefully, the
              downloader checks each resolution in real time using native browser image loading — if an
              image returns an error, that card is automatically hidden, so you only see resolutions
              that actually exist. The download button fetches the full image and saves it locally as a
              JPG with a descriptive filename including the video ID and quality level.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This Thumbnail Downloader
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Downloads all 5 YouTube thumbnail resolutions at once",
                "Automatically hides unavailable resolutions — no broken images",
                "Supports all YouTube URL formats including Shorts and embed links",
                "One-click download with descriptive filename (VIDEO_ID-quality.jpg)",
                "Copy thumbnail URL to clipboard for use in design tools",
                "Fullscreen preview before downloading — see every detail",
                "100% client-side — no data sent to any server, completely private",
                "Mobile responsive — works on phones and tablets",
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
