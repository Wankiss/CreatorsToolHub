import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, FileText, ListChecks,
  ChevronDown, Shield, Zap, ArrowUpRight, RefreshCw, Download,
  Info, LayoutTemplate, Lightbulb, TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube description and why does it matter?",
    a: "A YouTube description is the text block below your video that serves two distinct purposes. For viewers, YouTube's Help Center confirms that the first few lines of your description appear in YouTube search results before the 'Show more' cutoff — this is your visible preview that determines whether someone clicks. For the algorithm, YouTube's Creator Academy states that 'a detailed description will help viewers find your video in search' — the full description text is one of the primary signals YouTube reads to understand your video's topic, categorize it, and match it to search queries. A well-written description with natural keyword placement in the opening lines, structured body paragraphs, chapters, and a clear CTA directly improves both search discoverability and viewer conversion.",
  },
  {
    q: "How do YouTube descriptions affect SEO?",
    a: "YouTube descriptions affect SEO in three direct ways. First, keyword placement: YouTube's Creator Academy confirms descriptions help the algorithm understand video content — placing your primary keyword in the first sentence gives the clearest possible topical signal. Second, semantic coverage: repeating keyword variations and related phrases throughout the body expands the range of search queries your video can rank for without keyword stuffing. Third, chapters: YouTube's Help Center confirms that timestamps in descriptions create named chapter sections that appear in the video progress bar and in search results. Each chapter title is a separate keyword signal YouTube can index and surface independently. Our AI description generator handles all three automatically, placing keywords strategically and structuring every description for maximum algorithmic impact.",
  },
  {
    q: "How long should a YouTube description be?",
    a: "YouTube allows up to 5,000 characters in descriptions (YouTube Help Center) — but length alone doesn't drive rankings. YouTube's Creator Academy advises that detailed, well-written descriptions improve search visibility, and quality matters far more than character count. A 250-word description with naturally placed keywords and a clear structure outperforms a 1,000-word description full of filler or keyword stuffing. The structural priority is the opening: whatever appears in the first few lines (before 'Show more') is what viewers see in search results — make those lines compelling and keyword-rich. Our AI generator produces descriptions in the 250–400 word range, enough to give YouTube's algorithm sufficient topical context without sacrificing the readability that keeps viewers clicking.",
  },
  {
    q: "What keywords should I include in my YouTube description?",
    a: "YouTube's Creator Academy confirms that descriptions help the algorithm understand what your video covers — which means your keyword strategy directly shapes which search queries you're eligible to rank for. Include three types: (1) Primary keyword — the main search phrase you want to rank for, placed in the first sentence. If your video is about losing weight at home, your opening line should naturally include that phrase. (2) Secondary keywords — related phrases and topic variations that expand your ranking surface; place these in the body paragraphs naturally. (3) Long-tail keywords — specific multi-word search phrases with lower competition. These are especially valuable for newer channels targeting niche queries where they can realistically rank. Our AI generator identifies and places all three types based on your video title and target keywords automatically.",
  },
  {
    q: "Do timestamps in descriptions help YouTube SEO?",
    a: "Yes — and they do it on two platforms simultaneously. YouTube's Help Center confirms that timestamps in descriptions create named chapter sections that appear in the video progress bar and as chapter markers in YouTube search results. Additionally, Google's own documentation confirms that YouTube chapter timestamps can appear as video jump-links in Google Search results — giving your video entry points on the world's largest search engine beyond YouTube itself. Each chapter title is an independent keyword signal: a chapter called 'YouTube SEO Tips for Beginners' can surface for that specific phrase in both YouTube and Google search, multiplying your discoverability from a single video. Our description generator formats timestamps automatically with the proper YouTube chapter syntax when you provide them.",
  },
  {
    q: "Should I add hashtags to my YouTube description?",
    a: "Yes — with a specific structure. YouTube's Help Center confirms you can add up to 15 hashtags to a YouTube description, and the first three hashtags you add will appear above your video title — highly visible real estate that functions as a topic label before viewers even read your title. Clicking a hashtag takes viewers to a hashtag feed where your video competes with others on that topic — a separate discovery surface from search. YouTube's policies specify that hashtags must be relevant to your content; irrelevant hashtag stuffing violates YouTube's spam policy. In practice, 3–5 well-chosen hashtags covering your main topic, niche, and one broad category term consistently outperform padded lists of 15. Our generator produces 3–5 relevant hashtags automatically, placed at the end where YouTube's algorithm expects them.",
  },
  {
    q: "What makes a good YouTube call-to-action in a description?",
    a: "A strong description CTA is specific, benefit-driven, and placed immediately after the main body — before the timestamps and links section. The most effective structure combines a subscription ask with a clear reason ('Subscribe for weekly fitness tips') plus a notification reminder ('Hit the 🔔 to get notified when new videos drop'). Adding a direct subscribe link in the format youtube.com/@yourchannel?sub_confirmation=1 converts passive readers into subscribers without requiring them to navigate to your channel page — this URL format triggers YouTube's subscribe confirmation popup automatically. Secondary CTAs (comment prompt, related video link, playlist) should appear lower in the description. Our AI generator includes a structured CTA section with subscribe link placeholder and notification bell in every description it creates.",
  },
  {
    q: "Do YouTube descriptions appear in Google Search?",
    a: "Partially — and in a more powerful way than most creators realize. Your description text itself doesn't appear verbatim in Google Search results. However, YouTube chapters created from your description timestamps DO appear in Google Search as video jump-links below the video result. Google's own documentation confirms that chapter timestamps help Google index and display specific segments of your video as jump-to links in search results. This means a chapter titled 'How to Lose Weight Without Equipment' can appear as a clickable link in Google Search independently, giving your video traffic from Google for that specific sub-topic even if the main video doesn't rank in the top results. This is one of the strongest SEO arguments for always including well-named timestamps in your descriptions.",
  },
  {
    q: "Can I use the same description for multiple videos?",
    a: "No — and YouTube's own policies explain why. YouTube's spam and deceptive practices policy explicitly states that duplicating metadata (including descriptions) across multiple videos can be treated as spam. Beyond the policy risk, reusing the same description defeats the algorithm's purpose: YouTube reads each video's description as a unique topical signal for that specific piece of content. Identical descriptions create topical ambiguity — the algorithm can't differentiate the videos' content profiles, which reduces how effectively it distributes each one. Always generate a unique description for each upload. Our AI description generator makes this fast — enter your specific video title and keywords and get a fresh, unique description in seconds.",
  },
  {
    q: "How do I write a YouTube description that gets more views?",
    a: "The descriptions that drive the most views execute four elements well: (1) Strong opening — the first few lines (shown in search results before 'Show more') must communicate the video's value immediately. Lead with what the viewer will gain, not a generic intro. YouTube's Help Center confirms these lines appear in search results, making them viewer-facing copy as much as SEO copy. (2) Keyword placement — your primary search term in the first sentence, related keywords naturally throughout the body. (3) Timestamps with well-named chapters — each chapter title is an additional keyword signal for YouTube search and can generate Google Search jump-link traffic. (4) Direct subscribe CTA with a subscribe confirmation link. Use our AI generator to build the complete draft, then refine the opening lines to match your specific channel voice.",
  },
  {
    q: "Is this YouTube description generator free?",
    a: "Yes — completely free with no account, no subscription, and no usage limits. Enter your video details and generate a complete, SEO-optimized description instantly. Every description includes a keyword-rich opening, structured body paragraphs, formatted timestamps (if you provide them), a subscribe CTA with notification reminder, optional social links, and 3–5 relevant hashtags. Regenerate for a different writing style, edit the output directly in the text box, copy to clipboard, or download as a TXT file for your description archive. No payment information or sign-up required.",
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
      <div
        ref={bodyRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 600}px` : "0px" }}
      >
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function YouTubeDescriptionGeneratorTool() {
  const [videoTitle, setVideoTitle] = useState("");
  const [topicSummary, setTopicSummary] = useState("");
  const [keywords, setKeywords] = useState("");
  const [channelName, setChannelName] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [timestamps, setTimestamps] = useState("");
  const [includeSocialLinks, setIncludeSocialLinks] = useState(false);
  const [editedOutput, setEditedOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("youtube-description-generator");
  const { toast } = useToast();

  const description = editedOutput || outputs.join("\n");

  // Sync generated output into editable field
  useEffect(() => {
    if (outputs.length > 0) setEditedOutput(outputs.join("\n"));
  }, [outputs]);

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

  const buildInputs = () => ({
    topic: videoTitle,
    topicSummary,
    keywords,
    channelName,
    callToAction,
    timestamps,
    includeSocialLinks: includeSocialLinks ? "yes" : "no",
  });

  const handleGenerate = () => {
    if (!videoTitle.trim()) {
      toast({ title: "Video title required", description: "Enter your video title to generate a description.", variant: "destructive" });
      return;
    }
    setEditedOutput("");
    run(buildInputs());
  };

  const handleRegenerate = () => {
    setEditedOutput("");
    run(buildInputs());
  };

  const copyAll = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    toast({ title: "Description copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([description], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-description-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Description Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            <Sparkles size={11} className="text-primary" /> Powered by AI
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Video Title *</label>
            <Input
              placeholder="e.g. How to Lose Weight Fast for Beginners (No Equipment Needed)"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Topic Summary <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input
              placeholder="e.g. A 10-minute beginner workout covering cardio and diet tips..."
              value={topicSummary}
              onChange={e => setTopicSummary(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Target Keywords <span className="text-muted-foreground font-normal">(comma-separated, optional)</span></label>
            <Input
              placeholder="e.g. weight loss for beginners, fat burning workout, diet tips 2026"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">The AI weaves these naturally throughout the description for SEO.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Channel Name <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                placeholder="e.g. FitWithJake"
                value={channelName}
                onChange={e => setChannelName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Call to Action <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                placeholder="e.g. Subscribe for weekly fitness tips"
                value={callToAction}
                onChange={e => setCallToAction(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Timestamps / Chapters <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
              placeholder={"0:00 Introduction\n1:30 Warm Up\n5:00 Main Workout\n9:00 Cool Down"}
              value={timestamps}
              onChange={e => setTimestamps(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Formatted automatically with the ⏱️ header YouTube creators use.</p>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setIncludeSocialLinks(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${includeSocialLinks ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeSocialLinks ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm font-medium">Add Social Links section</span>
            <span className="text-xs text-muted-foreground">(website, Instagram, Twitter, Discord placeholders)</span>
          </label>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading
            ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</>
            : <><Sparkles size={16} className="mr-2" />Generate Description</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {description && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold">Generated Description</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading}>
                <RefreshCw size={13} className="mr-1" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={downloadTxt}>
                <Download size={13} className="mr-1" /> Download TXT
              </Button>
              <Button variant="outline" size="sm" onClick={copyAll}>
                {copied
                  ? <><Check size={13} className="mr-1 text-green-500" />Copied!</>
                  : <><Copy size={13} className="mr-1" />Copy</>}
              </Button>
            </div>
          </div>
          <textarea
            className="w-full text-sm leading-relaxed font-sans bg-muted/30 rounded-lg p-4 border resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[300px]"
            value={editedOutput || outputs.join("\n")}
            onChange={e => setEditedOutput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Edit directly above, then copy or download. Hit Regenerate for a different writing style.</p>
        </Card>
      )}

      {/* ── How to Use ─────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Description Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Video Details",
              desc: "Fill in your video title, a brief topic summary, and your target keywords (comma-separated). These are the core inputs that drive keyword placement and the description's focus. The channel name and call-to-action are optional but improve the output significantly — always add them when you have them.",
            },
            {
              step: 2,
              title: "Add Timestamps and Links (Optional)",
              desc: "If your video has chapters, paste your timestamps in the format '0:00 Introduction'. The AI formats them automatically with the ⏱️ emoji header YouTube creators use. Toggle 'Add Social Links' to include your website, Instagram, Twitter, and Discord URL placeholders in the output.",
            },
            {
              step: 3,
              title: "Click Generate Description",
              desc: "Hit Generate and the AI instantly creates a fully structured, SEO-optimized YouTube description — keyword-rich hook, body paragraphs, timestamps, call-to-action, social links, and 3–5 hashtags. The complete description appears in an editable text box below the button.",
            },
            {
              step: 4,
              title: "Edit, Copy, or Download",
              desc: "Fine-tune the description directly in the output box before copying. Hit Copy to copy it to your clipboard for pasting into YouTube Studio, or Download TXT to save it as a file for your description archive. If you want a different writing style, hit Regenerate for a fresh variation.",
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

      {/* ── About ───────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Description Generator</h2>
        </div>
        <div className="space-y-8">

          {/* Section 1: What descriptions do */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What YouTube Descriptions Actually Do for Search Rankings
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube's Creator Academy states directly: <em>"A detailed description will help viewers find your video in search."</em> That's the core mechanism — when you upload a video, YouTube reads your title, description, and tags together to determine what the video is about, which search queries it's eligible to rank for, and which other videos to recommend it alongside. YouTube's Help Center confirms that the first few lines of your description appear in YouTube search results before the "Show more" cutoff — making those opening sentences both an algorithmic keyword signal and viewer-facing copy that determines clicks.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A description with your primary keyword in the first sentence, semantic variations in the body, well-named chapters, and a direct CTA is doing three jobs simultaneously: telling the algorithm what the video covers, showing up in search result previews with a compelling hook, and converting viewers who find you through search into subscribers. This AI generator handles all three — keyword strategy, structure, chapters, hashtags, and CTA — automatically, so every video you upload has a complete, optimized description from day one.
            </p>

            {/* Citation capsule */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">The description signals that move rankings</strong>
              YouTube's{" "}
              <a href="https://creatoracademy.youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Creator Academy
              </a>{" "}
              confirms that detailed descriptions help viewers find videos in search, and that keyword placement in descriptions is one of the primary signals YouTube uses to categorize content. YouTube's{" "}
              <a href="https://support.google.com/youtube/answer/57404" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Help Center
              </a>{" "}
              confirms that the first few lines appear in search results and that chapters from description timestamps can be indexed and surfaced in both YouTube and Google Search — making every well-named chapter an additional search entry point for your video.
            </div>
          </div>

          {/* Section 2: Three-layer description strategy */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The Three-Layer Description Strategy: Keywords, Chapters, and Hashtags
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A high-performing YouTube description operates on three levels simultaneously, each targeting a different discovery surface:
            </p>
            <div className="grid sm:grid-cols-1 gap-3 mb-4">
              {[
                {
                  layer: "Layer 1: Keyword Placement",
                  detail: "Primary keyword in the first sentence — YouTube's Creator Academy confirms descriptions help the algorithm match content to search queries. Secondary keywords woven naturally through the body expand the range of related searches your video is eligible for.",
                },
                {
                  layer: "Layer 2: Timestamps (Chapters)",
                  detail: "YouTube's Help Center confirms chapters appear as named sections in the video progress bar and in YouTube search results. Google's documentation confirms they can also appear as video jump-links in Google Search — giving your video ranked entry points on the world's largest search engine beyond YouTube itself.",
                },
                {
                  layer: "Layer 3: Hashtags",
                  detail: "YouTube's Help Center allows up to 15 hashtags per description. The first three appear above your video title — highly visible topic labels that double as a separate hashtag discovery feed. Relevant hashtags extend reach to viewers browsing by topic rather than searching by keyword.",
                },
              ].map(({ layer, detail }) => (
                <div key={layer} className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <div className="font-semibold text-sm text-foreground mb-1">{layer}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Our AI generator structures all three layers automatically. Pair the description with a keyword-optimized{" "}
              <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                tag set
              </Link>{" "}
              and a high-CTR{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                video title
              </Link>{" "}
              for a complete pre-publish SEO workflow.
            </p>
          </div>

          {/* Section 3: Six-section structure */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-primary" /> The Six-Section Structure Built Into Every Description
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every description this generator produces follows a six-section structure that covers both the SEO and viewer-conversion functions of a well-written description:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[
                { section: "1. Hook (Opening Lines)", role: "Primary keyword in the first sentence. These lines appear in YouTube search results (YouTube Help Center) — they're viewer-facing copy as much as an SEO signal." },
                { section: "2. Body Paragraphs", role: "2–3 paragraphs expanding the topic with secondary keywords woven naturally. Gives YouTube's algorithm topical depth and context for related query matching." },
                { section: "3. Timestamps / Chapters", role: "Named chapters indexed by YouTube search and Google Search as jump-links (per YouTube Help Center + Google documentation). Each chapter title = a separate keyword entry point." },
                { section: "4. Call-to-Action", role: "Subscribe request with a reason + notification bell reminder + subscribe confirmation link (youtube.com/@handle?sub_confirmation=1) that triggers YouTube's subscribe popup." },
                { section: "5. Social Links", role: "Cross-platform links extending reach beyond YouTube. Optional — include when you have established presences to drive to." },
                { section: "6. Hashtags", role: "Up to 15 allowed (YouTube Help Center); first 3 appear above your title. Topic, niche, and discovery hashtags placed at the end where YouTube's algorithm expects them." },
              ].map(({ section, role }) => (
                <div key={section} className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <div className="font-semibold text-sm text-foreground mb-1">{section}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Feature grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Description Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Primary keyword placed in the first sentence — aligned with YouTube Creator Academy description guidance",
                "Secondary keywords woven naturally throughout the body — no stuffing, reads like a human wrote it",
                "Chapters formatted automatically — each title is an additional keyword signal for YouTube and Google Search",
                "Hashtag generation: 3–5 relevant hashtags placed at the end, within YouTube Help Center's 15-tag limit",
                "Subscribe CTA with confirmation link format (sub_confirmation=1) that triggers YouTube's subscribe popup",
                "Chapters in descriptions appear as Google Search jump-links — maximizing cross-platform discoverability",
                "Regenerate button gives a fresh variation with a different writing style and tone",
                "Download as TXT to archive your complete description library for every video",
                "Fully editable output — customize tone and personal details before copying to YouTube Studio",
                "100% free, no account required, unlimited generations",
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

      {/* ── Tips ─────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Write Better YouTube Descriptions</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Put your primary keyword in the very first sentence — YouTube's Creator Academy confirms descriptions help the algorithm match content to search queries, and keyword placement in the opening lines carries the most weight. Don't bury your keyword in the third paragraph.",
            "Name your chapters with searchable phrases, not generic labels — 'Introduction' gives YouTube no keyword signal; 'How to Lose Weight Without a Gym' does. Each chapter title is a separate keyword signal indexed by YouTube search and can appear as a Google Search jump-link.",
            "Use the first three hashtags for your most important topics — YouTube's Help Center confirms the first three hashtags appear above your video title, making them highly visible. Put your most relevant topic hashtags first, not generic ones.",
            "Add a subscribe confirmation link, not just a CTA — the URL format youtube.com/@yourchannel?sub_confirmation=1 triggers YouTube's built-in subscribe popup when clicked. This converts description readers into subscribers more effectively than text alone.",
            "Write the opening lines as search-result copy, not a video summary — YouTube's Help Center confirms these lines appear in search results before 'Show more'. Treat them like a meta description: keyword-rich, benefit-focused, written to earn the click.",
            "Don't duplicate descriptions across videos — YouTube's spam policy flags duplicate metadata. Beyond the policy risk, identical descriptions prevent the algorithm from building distinct topical profiles for each video, reducing how effectively it distributes them.",
            "Generate your description before filming, not after — knowing your keywords and chapter structure before you record ensures your spoken content reinforces the same topical signals. YouTube's auto-captions process your spoken words too, and early keyword mention in your video amplifies the description's SEO signals.",
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
            { name: "YouTube Tag Generator", path: "/tools/youtube-tag-generator", desc: "Generate SEO-optimized tags that reinforce the keywords in your description for better ranking." },
            { name: "YouTube Title Generator", path: "/tools/youtube-title-generator", desc: "Create 40+ high-CTR title formulas that work in harmony with your keyword-rich description." },
            { name: "YouTube SEO Score Checker", path: "/tools/youtube-seo-score-checker", desc: "Score your title and description together for overall SEO quality before publishing." },
            { name: "YouTube Keyword Generator", path: "/tools/youtube-keyword-generator", desc: "Find the best keywords to naturally weave into your video descriptions for search visibility." },
          ].map(({ name, path, desc }) => (
            <a
              key={path}
              href={path}
              className="group flex items-start gap-4 p-4 rounded-2xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
            >
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

      {/* ── FAQ ──────────────────────────────────────────────────── */}
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
