import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Copy, Check, RefreshCw, Download, Sparkles, Loader2,
  ChevronDown, Search, Zap, TrendingUp, Shield, ListChecks,
  Hash, Clock, Link2, MessageSquare, Bell, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  topic: string;
  keywords: string;
  timestamps: string;
  channelName: string;
  cta: string;
  website: string;
  instagram: string;
  twitter: string;
  discord: string;
}

// ─── Generation Engine ────────────────────────────────────────────────────────

const HOOK_TEMPLATES = [
  (title: string, kw: string) =>
    `Want to ${title.toLowerCase().replace(/^how to /i, "").replace(/\?$/, "")}? You're in the right place.\n\nIn this video, we break down exactly how to ${kw ? kw.split(",")[0].trim().toLowerCase() : title.toLowerCase()} so you can get real results faster than you thought possible.`,
  (title: string, kw: string) =>
    `${title.endsWith("?") ? title : title + "."} If you've been struggling to figure this out, this video is made for you.\n\nWe cover everything you need to know about ${kw ? kw.split(",")[0].trim().toLowerCase() : "this topic"} — step by step, with no fluff.`,
  (title: string, kw: string) =>
    `In this video, you'll learn everything about ${kw ? kw.split(",")[0].trim().toLowerCase() : title.toLowerCase()}.\n\nWhether you're a complete beginner or looking to level up, we walk you through proven strategies that actually work in ${new Date().getFullYear()}.`,
];

const BODY_TEMPLATES = [
  (topic: string, kws: string[]) => {
    const k0 = kws[0] || "this topic";
    const k1 = kws[1] || "best practices";
    const k2 = kws[2] || "these strategies";
    return `${topic}\n\nUnderstanding ${k0} is one of the most valuable skills any creator can develop. In this video, we walk through the fundamentals so you can build a strong foundation from day one.\n\nYou'll discover how to apply ${k1} in real scenarios, avoid common mistakes that hold most people back, and use ${k2} to accelerate your results. Every tip in this video is based on what's actually working right now — not outdated advice.`;
  },
  (topic: string, kws: string[]) => {
    const k0 = kws[0] || "this topic";
    const k1 = kws[1] || "these methods";
    const k2 = kws[2] || "this approach";
    return `${topic}\n\nMost people struggle with ${k0} because they're missing a clear, repeatable system. This video gives you exactly that — a practical framework you can apply immediately.\n\nWe cover the key principles behind ${k1}, show you real examples of ${k2} in action, and give you actionable steps you can start using today. By the end of this video, you'll have a clear path forward.`;
  },
  (topic: string, kws: string[]) => {
    const k0 = kws[0] || "this subject";
    const k1 = kws[1] || "proven techniques";
    const k2 = kws[2] || "these skills";
    return `${topic}\n\nIf you want to master ${k0}, the information in this video will save you months of trial and error. We've distilled everything that works into one concise, actionable breakdown.\n\nFrom ${k1} to advanced strategies, we cover it all. You'll learn how to develop ${k2}, measure your progress, and make adjustments that compound over time. Don't skip the tips near the end — they're the ones most people miss.`;
  },
];

function generateHashtags(keywords: string): string {
  if (!keywords.trim()) return "";
  const tags = keywords
    .split(",")
    .map(k => k.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map(k => "#" + k.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, ""));
  return tags.join("\n");
}

function formatTimestamps(raw: string): string {
  const lines = raw.trim().split("\n").filter(Boolean);
  if (!lines.length) return "";
  return `⏱️ Timestamps\n${lines.join("\n")}`;
}

function generateDescription(form: FormData, variant: number): string {
  const kws = form.keywords.split(",").map(k => k.trim()).filter(Boolean);
  const hookFn = HOOK_TEMPLATES[variant % HOOK_TEMPLATES.length];
  const bodyFn = BODY_TEMPLATES[variant % BODY_TEMPLATES.length];

  const sections: string[] = [];

  // Section 1: Hook
  sections.push(hookFn(form.title || "master this topic", kws[0] || ""));

  // Section 2: Body
  const topicText = form.topic.trim() || "This video covers everything you need to know.";
  sections.push(bodyFn(topicText, kws));

  // Section 3: Timestamps
  if (form.timestamps.trim()) {
    sections.push(formatTimestamps(form.timestamps));
  }

  // Section 4: CTA
  const ctaLine = form.cta.trim()
    ? `👍 If you found this video helpful, ${form.cta}`
    : "👍 If you found this video helpful, make sure to like and subscribe for more content like this.";
  sections.push(
    `${ctaLine}\n\n🔔 Turn on notifications so you never miss our latest videos.\n\n💬 Let us know your thoughts in the comments below — we read every single one.`
  );

  // Section 5: Links
  const links: string[] = [];
  if (form.website)   links.push(`🌐 Website: ${form.website}`);
  if (form.instagram) links.push(`📸 Instagram: ${form.instagram}`);
  if (form.twitter)   links.push(`🐦 Twitter / X: ${form.twitter}`);
  if (form.discord)   links.push(`💬 Discord: ${form.discord}`);
  if (links.length) {
    sections.push(`🔗 Connect with ${form.channelName || "us"}:\n${links.join("\n")}`);
  }

  // Section 6: Hashtags
  const tags = generateHashtags(form.keywords);
  if (tags) sections.push(tags);

  return sections.join("\n\n");
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube description and why does it matter?",
    a: "A YouTube description is the text block below every video that explains what the video is about. YouTube's algorithm reads descriptions to understand a video's topic and rank it in search results. A well-written, keyword-rich description also convinces viewers to click play. Descriptions up to 5,000 characters are allowed, but the most impactful text lives in the first 150 characters — what appears above the 'Show more' fold.",
  },
  {
    q: "How do YouTube descriptions affect SEO?",
    a: "YouTube descriptions are one of the primary signals the YouTube algorithm uses to categorize and rank videos in search results. Including your target keyword in the first 1–2 sentences, the middle of the description, and near the end signals relevance without keyword stuffing. Descriptions also appear in Google search results — a compelling excerpt can drive clicks from both Google and YouTube search simultaneously.",
  },
  {
    q: "How long should a YouTube description be?",
    a: "YouTube allows descriptions up to 5,000 characters, but the optimal length for most videos is 200–350 words (roughly 1,200–2,100 characters). This is long enough to include your target keywords multiple times naturally, add timestamps, a CTA, links, and hashtags — while keeping the content readable and valuable to viewers who expand the description.",
  },
  {
    q: "What keywords should I include in my YouTube description?",
    a: "Include your primary keyword (the phrase people are most likely to search) in the first two sentences. Then weave in 3–5 secondary keywords — semantic variations and related terms — throughout the body paragraphs. Avoid repeating the exact same phrase more than 2–3 times. Tools like YouTube Studio's analytics, Google Trends, and our YouTube Keyword Generator can help you identify high-traffic, low-competition keywords for your niche.",
  },
  {
    q: "Do timestamps in descriptions help YouTube SEO?",
    a: "Yes — timestamps (chapters) improve both SEO and viewer experience. They create chapter links in the YouTube player that let viewers jump to specific sections, reducing the chance of early drop-offs. More importantly, YouTube indexes each chapter title as a separate searchable keyword. A video with well-labeled chapters can rank for multiple search queries simultaneously, compounding your organic reach.",
  },
  {
    q: "Should I add hashtags to my YouTube description?",
    a: "Yes, but strategically. YouTube allows up to 60 hashtags but recommends 3–5. Hashtags appear as clickable links that lead to YouTube hashtag pages — a low-effort discovery channel most creators ignore. Place hashtags at the very end of your description. Use 1–2 broad niche tags, 1–2 specific topic tags, and optionally 1 branded channel tag. Our description generator adds 3–5 hashtags automatically based on your keywords.",
  },
  {
    q: "What makes a good YouTube call-to-action in a description?",
    a: "An effective CTA is specific, emotional, and low-friction. Instead of just 'Subscribe', try 'Subscribe if you want to [specific benefit] every week'. Always pair a subscribe ask with a notification bell reminder. Adding a comment prompt ('Tell me in the comments: which tip are you trying first?') increases engagement signals that boost algorithmic distribution. Include your CTA in the middle-to-end of the description, not at the very top.",
  },
  {
    q: "How do I write a YouTube description that gets more views?",
    a: "Write the first two sentences as a hook — they appear in YouTube search results before the 'Show more' break. State your primary keyword and the specific value viewers will get from watching. In the body, use natural language to explain what the video covers, incorporating secondary keywords. Add timestamps for longer videos, a clear CTA, social links for cross-channel growth, and 3–5 hashtags at the end. Our description generator handles all of this automatically.",
  },
  {
    q: "Can I use the same description for multiple videos?",
    a: "No — duplicating descriptions across videos is strongly discouraged. YouTube can flag duplicate content and reduce a video's ranking. More importantly, each video should have a unique description that specifically explains that video's content and targets the keywords relevant to that individual video. Our generator creates a unique, customized description for every video based on the specific inputs you provide.",
  },
  {
    q: "Is this YouTube description generator free?",
    a: "Yes — the YouTube Description Generator is completely free with no account, no signup, and no usage limits. You can generate as many descriptions as you need, adjust the inputs, and use the Regenerate button to get variations. The tool works entirely in your browser — no data is sent to external servers.",
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

// ─── Character Counter ────────────────────────────────────────────────────────

function CharCounter({ value }: { value: string }) {
  const len = value.length;
  const pct = Math.min(100, (len / 5000) * 100);
  const color = len > 4500 ? "text-red-500" : len > 3500 ? "text-yellow-500" : "text-green-500";
  const barColor = len > 4500 ? "bg-red-500" : len > 3500 ? "bg-yellow-500" : "bg-primary";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${color}`}>{len.toLocaleString()} / 5,000</span>
    </div>
  );
}

// ─── Section Badge ────────────────────────────────────────────────────────────

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
      {icon}
      {label}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_FORM: FormData = {
  title: "", topic: "", keywords: "", timestamps: "",
  channelName: "", cta: "", website: "", instagram: "", twitter: "", discord: "",
};

export function YouTubeDescriptionGeneratorTool() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [variant, setVariant] = useState(0);
  const [showLinks, setShowLinks] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { toast } = useToast();
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Inject FAQ JSON-LD schema
  useEffect(() => {
    const id = "faq-schema-yt-desc-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const set = useCallback((field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    }, [errors]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim()) errs.title = "Video title is required.";
    if (!form.topic.trim()) errs.topic = "Topic / summary is required.";
    if (!form.keywords.trim()) errs.keywords = "At least one keyword is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerate = useCallback((newVariant?: number) => {
    if (!validate()) return;
    setLoading(true);
    const v = newVariant ?? variant;
    setTimeout(() => {
      const desc = generateDescription(form, v);
      setDescription(desc);
      setLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }, 600);
  }, [form, variant]);

  const handleRegenerate = useCallback(() => {
    const nextVariant = (variant + 1) % HOOK_TEMPLATES.length;
    setVariant(nextVariant);
    handleGenerate(nextVariant);
  }, [variant, handleGenerate]);

  const handleCopy = useCallback(() => {
    if (!description) return;
    navigator.clipboard.writeText(description).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: "Description copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [description, toast]);

  const handleDownload = useCallback(() => {
    if (!description) return;
    const safeTitle = (form.title || "description").replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
    const blob = new Blob([description], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-description-${safeTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Description saved as TXT file." });
  }, [description, form.title, toast]);

  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Row 1: Title + Channel Name */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <SectionLabel icon={<FileText className="w-3.5 h-3.5" />} label="Video Title *" />
              <Input
                value={form.title}
                onChange={set("title")}
                placeholder={`e.g. How to Grow on YouTube in ${YEAR}`}
                className={`rounded-xl h-11 text-sm ${errors.title ? "border-destructive" : ""}`}
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>
            <div>
              <SectionLabel icon={<Sparkles className="w-3.5 h-3.5" />} label="Channel Name" />
              <Input
                value={form.channelName}
                onChange={set("channelName")}
                placeholder="e.g. Creator Growth Hub"
                className="rounded-xl h-11 text-sm"
              />
            </div>
          </div>

          {/* Topic */}
          <div>
            <SectionLabel icon={<MessageSquare className="w-3.5 h-3.5" />} label="Video Topic / Summary *" />
            <textarea
              value={form.topic}
              onChange={set("topic")}
              placeholder="Summarize what the video covers. e.g. This video explains how beginners can grow a YouTube channel using SEO, thumbnails, and consistency."
              rows={3}
              className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.topic ? "border-destructive" : "border-border"}`}
            />
            {errors.topic && <p className="text-xs text-destructive mt-1">{errors.topic}</p>}
          </div>

          {/* Keywords */}
          <div>
            <SectionLabel icon={<Hash className="w-3.5 h-3.5" />} label="Target Keywords * (comma-separated)" />
            <Input
              value={form.keywords}
              onChange={set("keywords")}
              placeholder="e.g. YouTube growth, YouTube SEO, grow YouTube channel, YouTube tips"
              className={`rounded-xl h-11 text-sm ${errors.keywords ? "border-destructive" : ""}`}
            />
            {errors.keywords && <p className="text-xs text-destructive mt-1">{errors.keywords}</p>}
            {form.keywords && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.keywords.split(",").map(k => k.trim()).filter(Boolean).slice(0, 8).map((kw, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-medium">{kw}</span>
                ))}
              </div>
            )}
          </div>

          {/* Row: CTA + Timestamps toggle */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <SectionLabel icon={<Bell className="w-3.5 h-3.5" />} label="Call-to-Action" />
              <Input
                value={form.cta}
                onChange={set("cta")}
                placeholder="e.g. Subscribe for more YouTube growth tips"
                className="rounded-xl h-11 text-sm"
              />
            </div>
            <div>
              <SectionLabel icon={<Clock className="w-3.5 h-3.5" />} label="Timestamps (Optional)" />
              <textarea
                value={form.timestamps}
                onChange={set("timestamps")}
                placeholder={"0:00 Introduction\n1:12 Chapter one\n3:30 Chapter two"}
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Social Links toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowLinks(v => !v)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/70 font-semibold transition-colors"
            >
              <Link2 className="w-4 h-4" />
              {showLinks ? "Hide" : "Add"} Social Links
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showLinks ? "rotate-180" : ""}`} />
            </button>

            {showLinks && (
              <div className="grid sm:grid-cols-2 gap-3 mt-3 p-4 rounded-2xl bg-muted/30 border border-border animate-in slide-in-from-top-2 duration-200">
                {([
                  { field: "website" as const, label: "🌐 Website URL" },
                  { field: "instagram" as const, label: "📸 Instagram URL" },
                  { field: "twitter" as const, label: "🐦 Twitter / X URL" },
                  { field: "discord" as const, label: "💬 Discord URL" },
                ] as const).map(({ field, label }) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
                    <Input
                      value={form[field]}
                      onChange={set(field)}
                      placeholder={`https://...`}
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate button */}
          <Button
            onClick={() => handleGenerate()}
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate Description</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Output ───────────────────────────────────────────── */}
      {description && (
        <div ref={resultsRef} className="mt-6 rounded-3xl border border-border bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Generated Description</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                {wordCount} words · {description.length} chars
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={loading}
                className="gap-1.5 rounded-xl text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5 rounded-xl text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download TXT
              </Button>
              <Button
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 rounded-xl text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <textarea
              ref={outputRef}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={18}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 leading-relaxed font-mono"
              aria-label="Generated YouTube description"
            />
            <CharCounter value={description} />
            <p className="text-xs text-muted-foreground">
              You can edit the description directly above before copying. Optimal YouTube description length: 200–350 words.
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Description Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Enter Your Video Details", desc: "Fill in your video title, a brief topic summary, and your target keywords (comma-separated). These are the core inputs that drive keyword placement and the description's focus. The channel name and call-to-action are optional but improve the output significantly." },
            { step: 2, title: "Add Timestamps and Links (Optional)", desc: "If your video has chapters, paste your timestamps in the format '0:00 Introduction'. The tool formats them automatically with the ⏱️ emoji header YouTube creators use. Toggle 'Add Social Links' to include your website, Instagram, Twitter, and Discord URLs." },
            { step: 3, title: "Click 'Generate Description'", desc: "Hit Generate and the tool instantly creates a fully structured, SEO-optimized YouTube description — hook, body paragraphs with keywords, timestamps, call-to-action, social links, and 3–5 hashtags. The whole description appears in an editable textarea below." },
            { step: 4, title: "Edit, Copy, or Download", desc: "Fine-tune the description directly in the output box. Hit 'Copy' to copy it to your clipboard for pasting into YouTube Studio, or 'Download TXT' to save it as a file. If you want a different writing style, hit 'Regenerate' for a new variation." },
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Description Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What YouTube Descriptions Do for Your Channel
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube descriptions are far more than a summary box — they are one of the primary text signals
              the YouTube algorithm reads to understand, categorize, and rank your video. When you upload a
              video, YouTube cannot watch it. It reads your title, description, and tags to determine what
              the video is about, which search queries it should appear for, and which other videos to
              recommend it alongside. A description that naturally includes your target keyword multiple
              times, in the right locations, dramatically improves your video's chances of ranking.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Beyond SEO, descriptions are a direct conversion tool. The first 150 characters appear in
              YouTube search results and on embedded players — this is your hook. A compelling preview
              tells potential viewers exactly what they will gain from watching and gives them a reason
              to click. Most YouTube creators spend 30+ minutes writing a single description. This
              generator produces a complete, optimized draft in under a minute.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How Keywords, Timestamps, and Hashtags Work Together
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A high-performing YouTube description works on three levels simultaneously. First, it targets
              search queries by placing your primary keyword in the first two sentences and repeating
              semantic variations throughout the body — naturally, without stuffing. Second, timestamps
              (chapters) create indexed sections that YouTube reads as additional keyword signals. A video
              chapter titled "YouTube SEO Tips" can rank for that exact phrase independently of the
              video's main title, multiplying your discoverability. Third, hashtags at the bottom link
              your video to hashtag browsing pages, adding a passive discovery channel most creators overlook.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              YouTube creators who implement all three consistently report 20–40% increases in impressions
              from YouTube search. The compound effect is significant: more search traffic sends engagement
              signals that push the video into the suggested feed, and suggested feed traffic compounds
              indefinitely as long as the video retains viewers. Our description generator structures all
              three layers automatically for every video you create.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> The Six-Section Description Structure This Tool Uses
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every description generated by this tool follows a proven six-section structure optimized
              for both YouTube SEO and viewer engagement. Section one is the hook — an opening paragraph
              that places your primary keyword in the first sentence and immediately communicates the
              value of watching. Section two is the body — two to three paragraphs that expand on the
              topic, naturally weave in secondary keywords, and explain the video's content in language
              viewers and the algorithm both understand.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Sections three through six complete the description: timestamps (if provided) give viewers
              navigation and give YouTube extra keyword signals; the call-to-action drives subscriptions,
              notifications, and comment engagement; social links cross-promote your other channels and
              platforms; and hashtags at the very end extend hashtag discovery reach. This structure is
              used by the top YouTube creators in virtually every niche — and this tool applies it
              automatically so every video you publish is optimized from the moment it goes live.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Description Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Places primary keyword in the first 1–2 sentences for maximum SEO impact",
                "Naturally weaves secondary keywords throughout — no keyword stuffing",
                "Formats timestamps with the ⏱️ emoji header in one click",
                "Generates 3–5 relevant hashtags automatically from your keywords",
                "Includes a subscribe CTA and notification bell reminder",
                "Adds social links section for cross-channel promotion",
                "Regenerate button gives you 3 different writing style variations",
                "Download as TXT for archiving your description library",
                "Fully editable output — customize before copying to YouTube Studio",
                "100% free, no signup, unlimited uses",
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
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized tags that reinforce the keywords in your description for better ranking." },
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Create 40+ high-CTR title formulas that work in harmony with your keyword-rich description." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your title and description together for overall SEO quality before publishing." },
            { name: "YouTube Keyword Generator", path: "/tools/youtube-keyword-generator", desc: "Find the best keywords to naturally weave into your video descriptions for search visibility." },
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
