import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, FileText, ListChecks,
  ChevronDown, Shield, Zap, ArrowUpRight, RefreshCw, Download,
  Info, LayoutTemplate,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a YouTube description and why does it matter?",
    a: "A YouTube description is the text block below your video that tells viewers — and YouTube's algorithm — what your video is about. It serves two distinct purposes. For viewers, the first 150 characters appear in YouTube search results and on embedded players before the 'Show more' cutoff, acting as a preview that convinces people to click and watch. For the algorithm, the full description is one of the primary text signals YouTube reads to understand your video's topic, categorize it, and decide which search queries it should rank for. A well-written description with natural keyword placement, clear structure, and strong calls-to-action directly improves both search discoverability and viewer conversion.",
  },
  {
    q: "How do YouTube descriptions affect SEO?",
    a: "YouTube descriptions affect SEO in three direct ways. First, keyword placement: YouTube reads your description to match your video to relevant search queries. Placing your primary keyword in the first one to two sentences is the single highest-impact SEO action you can take in your description. Second, semantic relevance: repeating keyword variations and related phrases throughout the body signals to the algorithm that your content comprehensively covers the topic, improving ranking potential for a wider range of related searches. Third, timestamps create indexed chapter titles — each chapter name is a separate keyword signal YouTube can surface in search. Our AI description generator handles all three automatically, placing keywords strategically and structuring every description for maximum algorithmic impact.",
  },
  {
    q: "How long should a YouTube description be?",
    a: "The ideal YouTube description length is 200–500 words. YouTube allows up to 5,000 characters, and longer descriptions do provide more keyword surface area — but quality matters far more than length. A 200-word description with naturally placed keywords and a clear structure outperforms a 1,000-word description full of keyword stuffing or filler text. The most important structural rule is the 150-character opening: whatever you write in the first two to three sentences will appear as the preview in search results and on embedded players. Make those sentences compelling and keyword-rich. Our AI generator produces descriptions in the 250–400 word range — enough to satisfy the algorithm's keyword scanning without sacrificing the readability that keeps viewers watching.",
  },
  {
    q: "What keywords should I include in my YouTube description?",
    a: "Every YouTube description should include three types of keywords: (1) Primary keyword — the main search phrase you want to rank for, placed in the first sentence. Example: if your video is about losing weight at home, your first sentence should naturally include 'how to lose weight at home'. (2) Secondary keywords — related phrases and topic variations that expand your ranking surface. These go in the body paragraphs and should feel natural, not forced. (3) Long-tail keywords — specific multi-word search phrases with lower competition. These are particularly valuable for newer channels because they target niche queries where you can realistically rank. Our AI description generator identifies and places all three types based on your video title and target keywords, handling keyword strategy automatically so you don't have to.",
  },
  {
    q: "Do timestamps in descriptions help YouTube SEO?",
    a: "Yes — timestamps (YouTube chapters) are one of the most underused SEO tools available to creators. When you add timestamps to your description, YouTube creates named chapter sections that appear in the video progress bar and in Google search results as video chapters. Each chapter title becomes an independent keyword signal YouTube can index and surface. A chapter titled 'YouTube SEO Tips for Beginners' can rank for that specific phrase in YouTube and Google search, giving your video multiple entry points beyond just the main title. YouTube creators who add well-named chapters consistently report higher impression counts because their videos appear for a broader range of related search queries. Our description generator formats timestamps automatically with the proper YouTube chapter syntax when you provide them.",
  },
  {
    q: "Should I add hashtags to my YouTube description?",
    a: "Yes — hashtags in YouTube descriptions serve two discovery functions. First, YouTube displays the first three hashtags above your video title, making them highly visible to viewers browsing your content. Second, clicking a hashtag takes viewers to a hashtag feed page where your video competes with other videos using the same hashtag — this is an additional discovery surface outside of regular search. Use 3–5 relevant hashtags per video rather than stuffing 15–20. Overstuffed hashtag sections can trigger YouTube's spam filter and actually reduce distribution. Focus on hashtags that match your content: your main topic, your niche, and one broad discovery hashtag. Our generator automatically creates 3–5 relevant hashtags based on your video title and keywords, placed at the end of the description where YouTube expects them.",
  },
  {
    q: "What makes a good YouTube call-to-action in a description?",
    a: "A strong YouTube description call-to-action is specific, benefit-driven, and placed immediately after the main description body — before the timestamps and links section. The most effective CTAs combine a subscription request with a reason to subscribe ('Subscribe for weekly tips on growing your YouTube channel') and a notification reminder ('Hit the 🔔 to be notified when new videos drop'). Adding a direct subscribe link (youtube.com/@yourchannel?sub_confirmation=1) converts passive readers into subscribers without requiring them to click back to your channel page. Secondary CTAs — commenting, sharing, or visiting a related video or playlist — should appear lower in the description. Our AI generator includes a structured CTA section with a subscribe link placeholder and notification bell reminder in every description it creates.",
  },
  {
    q: "How do I write a YouTube description that gets more views?",
    a: "The descriptions that drive the most views do four things well: (1) Hook immediately — the first 150 characters must clearly communicate the video's value before the 'Show more' cutoff. Lead with what the viewer will get, not a generic intro. (2) Keyword placement — your primary search term should appear in the first sentence, with related keywords naturally woven throughout the body. (3) Include timestamps — chapter titles multiply the number of search queries your video can appear for and make longer videos more accessible, improving watch time. (4) Strong CTA — a clear subscribe request with a direct link converts viewers who found you through search into long-term audience members. Use our AI description generator to produce a complete draft hitting all four elements, then edit the first 150 characters to match your specific audience and tone.",
  },
  {
    q: "Can I use the same description for multiple videos?",
    a: "No — copying identical descriptions across multiple videos is one of the most damaging SEO mistakes on YouTube. YouTube's algorithm reads each video's description as a unique signal for that specific piece of content. Reusing the same description tells the algorithm the videos are about the same topic, which creates internal competition between your own videos and reduces how effectively each one is distributed. Additionally, duplicate descriptions are a flag YouTube uses to identify low-quality or spam content, which can reduce distribution for your entire channel. Always generate a unique description for each video. Our AI description generator makes this fast — enter your video's specific title and keywords and get a fresh, unique description in seconds for every upload.",
  },
  {
    q: "Is this YouTube description generator free?",
    a: "Yes — this YouTube description generator is completely free to use with no account, no subscription, and no usage limits. Enter your video details and generate a complete, SEO-optimized description instantly. Every description includes a keyword-rich hook, structured body paragraphs, formatted timestamps (if you provide them), a subscribe call-to-action, social links, and 3–5 hashtags. You can regenerate as many times as you want for different writing style variations, edit the output directly in the text box, copy it to your clipboard, or download it as a TXT file for your description archive. No payment information or sign-up is ever required.",
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
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What YouTube Descriptions Do for Your Channel
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube descriptions are far more than a summary box — they are one of the primary text
              signals the YouTube algorithm reads to understand, categorize, and rank your video. When
              you upload a video, YouTube cannot watch it. It reads your title, description, and tags
              to determine what the video is about, which search queries it should appear for, and which
              other videos to recommend it alongside. A description that naturally includes your target
              keyword in the first sentence, with semantic variations throughout the body, gives the
              algorithm the clearest possible signal — and directly improves your ranking potential
              across YouTube search, suggested videos, and browse features.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Beyond SEO, descriptions are a direct conversion tool. The first 150 characters appear
              in YouTube search results and on embedded players — this is your hook. A compelling
              preview tells potential viewers exactly what they will gain from watching and gives them
              a reason to click. Most creators spend 30+ minutes writing a single description manually.
              This AI-powered generator produces a complete, optimized draft in under a minute — with
              keyword placement, structured sections, and a strong call-to-action all handled automatically.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> How Keywords, Timestamps, and Hashtags Work Together
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A high-performing YouTube description works on three levels simultaneously. First, it
              targets search queries by placing your primary keyword in the first two sentences and
              repeating semantic variations throughout the body — naturally, without stuffing. Second,
              timestamps (chapters) create indexed sections that YouTube reads as additional keyword
              signals. A video chapter titled "YouTube SEO Tips" can rank for that exact phrase
              independently of the video's main title, multiplying your discoverability across multiple
              search queries from a single video.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Third, hashtags at the end of your description extend reach into YouTube's hashtag
              discovery feed — a separate surface where viewers browse content by topic. YouTube
              creators who implement all three consistently report 20–40% increases in impressions
              from YouTube search. The compound effect is significant: more search traffic sends
              engagement signals that push the video into the suggested feed, and suggested feed
              traffic compounds indefinitely as long as the video retains viewers. Our AI description
              generator structures all three layers automatically for every video you create.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-primary" /> The Six-Section Structure This Tool Uses
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every description generated by this tool follows a proven six-section structure optimized
              for both YouTube SEO and viewer engagement. Section one is the <strong className="text-foreground">hook</strong> — an
              opening paragraph that places your primary keyword in the first sentence and immediately
              communicates the value of watching. Section two is the <strong className="text-foreground">body</strong> — two to three
              paragraphs that expand on the topic, naturally weave in secondary keywords, and explain
              the video's content in language both viewers and the algorithm understand.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Sections three through six complete the structure: <strong className="text-foreground">timestamps</strong> give viewers
              navigation and give YouTube extra keyword signals from chapter titles;
              the <strong className="text-foreground">call-to-action</strong> drives subscriptions, notifications, and comment
              engagement; <strong className="text-foreground">social links</strong> cross-promote your platforms and add clickable
              destinations; and <strong className="text-foreground">hashtags</strong> at the very end extend hashtag discovery reach.
              This structure is used by top YouTube creators across virtually every niche — and this
              tool applies it automatically so every video you publish has a professional-grade
              description from day one. Pair it with our{" "}
              <Link href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                YouTube Tag Generator
              </Link>{" "}
              and{" "}
              <Link href="/tools/youtube-title-generator" className="text-primary hover:underline font-medium">
                YouTube Title Generator
              </Link>{" "}
              for a complete AI-powered SEO workflow.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Description Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Powered by AI — places primary keyword in the first 1–2 sentences for maximum SEO impact",
                "Naturally weaves secondary keywords throughout — no keyword stuffing, reads like a human wrote it",
                "Formats timestamps with the ⏱️ emoji header in one click — ready to paste into YouTube Studio",
                "Generates 3–5 relevant hashtags automatically from your keywords and video title",
                "Includes a subscribe CTA with notification bell reminder in every generated description",
                "Adds a social links section for cross-channel promotion with placeholder URLs",
                "Regenerate button gives you a fresh variation with a different writing style",
                "Download as TXT to build and archive your complete description library",
                "Fully editable output — customize tone, add personal details, before copying to YouTube Studio",
                "100% free, no account required, unlimited uses — generate as many descriptions as you need",
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
