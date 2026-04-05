import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Image as ImageIcon,
  ListChecks, Shield, Lightbulb, ChevronDown, ArrowUpRight, Zap,
} from "lucide-react";

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a Midjourney prompt generator and why do I need one?",
    a: "A Midjourney prompt generator is an AI-powered tool that builds correctly structured, syntax-complete prompts for Midjourney's image generation model — so you can get professional-quality visuals without spending months learning Midjourney's prompt language. Midjourney interprets prompts extremely literally: missing a lighting descriptor, wrong descriptor order, or incorrect parameter syntax all produce noticeably worse results. This generator eliminates that learning curve by applying the correct subject, style, mood, lighting, composition, and parameter combinations automatically — and outputting 4 optimized variations per session for maximum creative exploration.",
  },
  {
    q: "What is the correct Midjourney prompt syntax?",
    a: "A well-structured Midjourney prompt follows this order: Subject → Environment → Style → Mood → Lighting → Composition → Parameters. For example: 'confident entrepreneur at a minimalist glass desk, modern office environment, photorealistic, dramatic cinematic mood, soft golden side lighting, eye-level portrait composition --ar 16:9 --q 2 --v 6'. The commas between descriptors tell Midjourney to treat each element as a distinct modifier. Parameters (--ar, --q, --v) always go at the end and are never separated by commas. Our AI-powered generator handles all of this structure automatically and applies the correct syntax for every prompt it outputs.",
  },
  {
    q: "What do the Midjourney parameters --ar, --q, and --v mean?",
    a: "--ar sets the aspect ratio (e.g. --ar 16:9 for YouTube thumbnails, --ar 9:16 for TikTok/Reels vertical, --ar 1:1 for Instagram square). --q controls render quality: --q 2 produces higher detail and takes slightly longer to generate than the default --q 1. --v specifies the Midjourney model version — --v 6 is the current flagship model with the most realistic outputs and best understanding of natural language prompts. Our generator automatically applies the correct --ar for your chosen visual type, uses --q 2 for maximum quality, and applies --v 6 so every prompt targets Midjourney's best available model.",
  },
  {
    q: "What aspect ratio should I use for different content types?",
    a: "Each platform has an optimal aspect ratio: YouTube thumbnails use --ar 16:9 (1280×720px standard). TikTok covers and Instagram Stories/Reels use --ar 9:16 for full vertical display. Instagram square posts use --ar 1:1. Pinterest pins perform best at --ar 2:3. Course covers and banner images typically use --ar 16:9 or --ar 3:1 for horizontal banners. Logos and brand marks are best generated at --ar 1:1. Our Midjourney Prompt Generator automatically applies the correct --ar parameter for your chosen visual type — you never have to remember these ratios manually.",
  },
  {
    q: "What are the best Midjourney styles for YouTube thumbnails?",
    a: "The most click-worthy YouTube thumbnail styles in Midjourney are: Photorealistic with dramatic lighting (high contrast, cinematic shadows, strong focal subject), Bold Commercial (bright colors, high saturation, clear subject isolation), and Cinematic (movie-poster-style composition, depth of field, dramatic sky or background). For face thumbnails, add 'shot on Sony A7IV, 85mm lens, f/1.8, shallow depth of field' for hyper-realistic portraiture. For concept thumbnails, 'digital art, vibrant, bold graphic style, high contrast' tends to generate eye-catching results. Our AI generates four style variations per session — your chosen style plus photorealistic, clean minimal, and bold commercial alternatives — so you can compare options before committing.",
  },
  {
    q: "How do I generate Instagram-optimized Midjourney prompts?",
    a: "For Instagram posts, select the Instagram Post visual type in our generator — it auto-applies --ar 1:1 for feed posts. For best Instagram aesthetic results, use styles like 'editorial photography', 'lifestyle photography', 'clean minimal', or 'soft pastel illustration' depending on your brand tone. For Reels covers, the generator uses --ar 9:16 automatically. Describe your subject specifically — 'woman in linen outfit at sun-drenched café table, relaxed confident expression' produces far better results than 'woman at café'. Include a color palette like 'warm terracotta, sage green, cream' for brand-consistent outputs that match your Instagram aesthetic.",
  },
  {
    q: "Can I use Midjourney for free?",
    a: "Midjourney no longer offers a free trial as of 2024 — a paid subscription is required to generate images. Plans start at approximately $10/month for ~200 image generations. However, our Midjourney Prompt Generator is completely free to use with no account, no signup, and no usage limits. You can generate, refine, and copy as many Midjourney prompts as you need at no cost — you only need a paid Midjourney account to paste and run those prompts in Midjourney's Discord or web interface.",
  },
  {
    q: "What makes a good Midjourney prompt for professional results?",
    a: "Professional Midjourney prompts share five characteristics: (1) A specific, detailed subject description — 'exhausted tech entrepreneur staring at multiple monitors at 2am, cluttered modern home office' instead of 'person at desk'. (2) Explicit lighting — 'dramatic side lighting', 'soft diffused window light', or 'neon glow backlit' dramatically elevates output quality. (3) Style and mood clarity — 'hyper-realistic', 'cinematic color grade', 'editorial photography'. (4) Composition direction — 'tight close-up', 'rule of thirds composition', 'centered symmetrical'. (5) Correct parameters — --ar for platform, --q 2 for quality, --v 6 for the latest model. Our AI-powered generator applies all five elements automatically in every prompt it creates.",
  },
  {
    q: "How do I generate multiple Midjourney prompt variations?",
    a: "Our generator creates 4 prompt variations per session automatically: your chosen style, a photorealistic alternative, a clean minimal alternative, and a bold commercial alternative — all for the same subject and platform. This gives you immediate creative options to compare in Midjourney without re-entering inputs. For even more variation, click 'Regenerate All' to get a fresh set of 4 prompts from the same inputs. In Midjourney itself, you can also use the V1–V4 variation buttons after each generation to explore variations of any individual result. The 'Copy All' button in our generator lets you grab all 4 prompts at once for batch generation sessions.",
  },
  {
    q: "How do I create a Midjourney prompt for a brand logo?",
    a: "For brand logos in Midjourney, select 'Logo / Brand Asset' in the Visual Type dropdown — the generator applies --ar 1:1 and logo-optimized descriptor combinations. Describe your brand concept specifically (e.g., 'minimalist mountain peak lettermark for outdoor adventure brand'). Use style options like 'clean minimal', 'flat design', or 'geometric illustration'. Add --no text, watermark, photo-realistic to prevent Midjourney from adding unreadable text or photographic elements. Note that Midjourney cannot reliably generate specific text or letterforms — use its logo outputs as a starting visual concept that a designer then refines in vector tools, rather than a production-ready logo file.",
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

export function MidjourneyPromptGeneratorTool() {
  const [visualType, setVisualType] = useState("youtube-thumbnail");
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [mood, setMood] = useState("dramatic");
  const [lighting, setLighting] = useState("cinematic");
  const [perspective, setPerspective] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { outputs, loading, error, run } = useAiTool("midjourney-prompt-generator");
  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-midjourney-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!subject.trim()) {
      toast({ title: "Subject required", description: "Describe what you want to generate.", variant: "destructive" });
      return;
    }
    run({ visualType, subject, style, mood, lighting, perspective, colorPalette });
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(outputs.join("\n\n"));
    setCopiedAll(true);
    toast({ title: "All prompts copied!" });
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="text-violet-500" size={22} />
          <h2 className="font-semibold text-lg">Midjourney Prompt Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full border border-violet-500/20">
            <Sparkles size={11} /> Powered by AI
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Visual Type</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={visualType} onChange={e => setVisualType(e.target.value)}>
              <option value="youtube-thumbnail">YouTube Thumbnail</option>
              <option value="instagram-post">Instagram Post</option>
              <option value="instagram-story">Instagram Story</option>
              <option value="tiktok-cover">TikTok Cover</option>
              <option value="pinterest-pin">Pinterest Pin</option>
              <option value="course-cover">Course Cover</option>
              <option value="logo">Logo / Brand Asset</option>
              <option value="banner">Banner / Header</option>
              <option value="product-photo">Product Photo</option>
              <option value="portrait">Portrait / Headshot</option>
              <option value="background">Background / Scene</option>
              <option value="illustration">Illustration</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Subject / Description *</label>
            <Input placeholder="e.g. confident woman entrepreneur at a minimalist desk, futuristic city at night..." value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Art Style</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={style} onChange={e => setStyle(e.target.value)}>
                <option value="photorealistic">Photorealistic</option>
                <option value="digital-art">Digital Art</option>
                <option value="illustration">Illustration</option>
                <option value="cinematic">Cinematic</option>
                <option value="anime">Anime</option>
                <option value="oil-painting">Oil Painting</option>
                <option value="3d-render">3D Render</option>
                <option value="flat-design">Flat Design</option>
                <option value="editorial">Editorial Photography</option>
                <option value="bold-commercial">Bold Commercial</option>
                <option value="clean-minimal">Clean Minimal</option>
                <option value="watercolor">Watercolor</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mood</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={mood} onChange={e => setMood(e.target.value)}>
                <option value="dramatic">Dramatic</option>
                <option value="vibrant">Vibrant</option>
                <option value="calm">Calm</option>
                <option value="dark">Dark / Moody</option>
                <option value="bright">Bright / Cheerful</option>
                <option value="mysterious">Mysterious</option>
                <option value="energetic">Energetic</option>
                <option value="luxurious">Luxurious</option>
                <option value="nostalgic">Nostalgic</option>
                <option value="futuristic">Futuristic</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Lighting</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={lighting} onChange={e => setLighting(e.target.value)}>
                <option value="cinematic">Cinematic</option>
                <option value="golden-hour">Golden Hour</option>
                <option value="studio">Studio</option>
                <option value="neon">Neon Glow</option>
                <option value="natural">Natural</option>
                <option value="backlit">Backlit</option>
                <option value="dramatic-studio">Dramatic Studio</option>
                <option value="soft-window">Soft Window Light</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Perspective</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={perspective} onChange={e => setPerspective(e.target.value)}>
                <option value="">Any</option>
                <option value="close-up">Close-up</option>
                <option value="wide-angle">Wide Angle</option>
                <option value="bird-eye">Bird's Eye</option>
                <option value="low-angle">Low Angle</option>
                <option value="portrait">Portrait / Front</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Color Palette (optional)</label>
            <Input placeholder="e.g. deep blue and gold, neon pink and black, earth tones..." value={colorPalette} onChange={e => setColorPalette(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Midjourney Prompts</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Midjourney Prompts</h3>
            <Button variant="outline" size="sm" onClick={copyAll} className="gap-1.5">
              {copiedAll ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              Copy All
            </Button>
          </div>
          <div className="space-y-3">
            {outputs.map((prompt, i) => (
              <div key={i} className="group p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed font-mono">{prompt}</p>
                  <button onClick={() => copyItem(prompt, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
                    {copied === i ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Midjourney Prompt Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Choose Your Visual Type", desc: "Select from 12 use cases — YouTube Thumbnail, Instagram Post, Story, TikTok Cover, Course Cover, Logo, Banner, Pinterest Pin, and more. The tool automatically sets the correct aspect ratio for your chosen platform, so you never have to remember --ar parameters manually." },
            { step: 2, title: "Describe Your Subject and Style", desc: "Enter your subject or concept — be specific for better results (e.g. 'confident woman entrepreneur at a minimalist desk' vs. 'woman working'). Select your style, mood, lighting, and optional perspective and color palette. More detail always produces better Midjourney output." },
            { step: 3, title: "Click Generate Midjourney Prompts", desc: "Hit Generate and the AI instantly creates 4 optimized prompt variations — your selected style, plus photorealistic, clean minimal, and bold commercial alternatives — all in correct Midjourney syntax with --ar, --q 2, and --v 6 parameters automatically applied." },
            { step: 4, title: "Copy and Paste Into Midjourney", desc: "Click Copy on any prompt and paste it into Midjourney via the /imagine command in Discord or the Midjourney web interface. Use Copy All to grab all 4 variations for batch exploration. Regenerate at any time to get fresh variations without re-entering your inputs." },
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
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This Midjourney Prompt Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This AI-Powered Midjourney Prompt Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free Midjourney Prompt Generator is powered by AI and builds optimized, syntax-correct
              Midjourney prompts for 12 content creator use cases — from YouTube thumbnails and Instagram
              posts to course covers, logos, Pinterest pins, and brand identity visuals. It applies the
              correct aspect ratio for each platform automatically, generates 4 prompt variations per
              session (your chosen style, photorealistic, clean minimal, and bold commercial), and
              includes all required Midjourney syntax elements: subject description, style modifiers,
              mood, lighting, composition, and parameters.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every prompt includes the essential Midjourney parameters automatically applied: --ar
              (platform-correct aspect ratio), --q 2 (maximum quality rendering), and --v 6 (Midjourney's
              current flagship model). You get copy-paste-ready prompts that target Midjourney's best
              available output quality without needing to memorize parameter syntax or spend hours
              learning which descriptor combinations produce professional results.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> Why Midjourney Prompt Structure Determines Visual Quality
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Midjourney is a remarkably powerful image generation tool, but its output quality is
              entirely dependent on prompt structure. The platform interprets prompts extremely
              literally — missing a lighting descriptor produces flat, uninspired lighting; missing
              a composition term produces random framing; missing style descriptors produces generic
              results that don't match your creative intent. Professional Midjourney users spend
              months learning which descriptor combinations produce specific visual outcomes.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our AI analyzes your inputs — visual type, subject, style, mood, and lighting — and
              constructs prompts using proven descriptor patterns that consistently produce
              professional-quality results in Midjourney. The four variations per session give you
              immediate creative options to compare: your primary style choice alongside photorealistic,
              clean minimal, and bold commercial alternatives that might better suit your actual
              content needs once you see them side-by-side.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The aspect ratio automation alone saves significant time. Each platform has a different
              optimal ratio — 16:9 for YouTube, 9:16 for TikTok and Stories, 1:1 for Instagram feed,
              2:3 for Pinterest — and using the wrong ratio means regenerating everything. Our
              generator selects the correct --ar parameter automatically based on your chosen visual
              type, so every prompt is immediately ready for its intended platform.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Tool
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "12 visual type presets with auto-applied platform aspect ratios",
                "12 style options with professional AI-expanded descriptor combinations",
                "10 mood descriptors and 8 lighting configurations",
                "4 prompt variations per session across different style directions",
                "Correct Midjourney syntax — commas, descriptor order, parameters",
                "--ar, --q 2, --v 6 parameters automatically applied to every prompt",
                "Copy individual prompts or Copy All for batch Midjourney sessions",
                "Regenerate for fresh variations without re-entering inputs",
                "Powered by AI — prompts adapt intelligently to your subject and style",
                "100% free — no account, no limits, copy-paste ready output",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Include lighting in every image prompt — 'golden hour lighting', 'dramatic studio lighting', or 'soft window light' dramatically elevates the quality and mood of AI-generated output.",
            "Use style references: append '--style raw' for more realistic outputs or '--style expressive' for more artistic, painterly results tailored to your creative vision.",
            "Specify the camera/lens type for photography-style prompts — 'shot on Sony A7IV, 85mm lens, f/1.8' produces dramatically more realistic and detailed portrait results.",
            "Use the --ar flag for custom ratios — '--ar 9:16' for vertical TikTok/Reels content, '--ar 16:9' for YouTube thumbnails, '--ar 1:1' for Instagram square posts.",
            "Add negative prompts with --no to exclude unwanted elements — '--no text, watermark, blur, low quality' keeps generations sharp and print-ready for professional use.",
            "Weight your most important concept at the end of the prompt — Midjourney weights later terms more heavily, so put your key visual element last for best results.",
            "Save your best prompts in a prompt library — great prompts are reusable creative assets; a 10-prompt template library can power weeks of consistent content creation.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related AI Creator Tools ──────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related AI Creator Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "AI Prompt Generator", path: "/tools/ai-prompt-generator", desc: "Generate optimized text prompts for ChatGPT, Claude, and other AI tools to supercharge your content workflow." },
            { name: "YouTube Video Idea Generator", path: "/tools/youtube-video-idea-generator", desc: "Generate compelling YouTube video concepts to accompany your AI-crafted thumbnails and visual content." },
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Write scroll-stopping Instagram captions that complement your Midjourney-generated visuals perfectly." },
            { name: "TikTok Hashtag Generator", path: "/tools/tiktok-hashtag-generator", desc: "Discover trending TikTok hashtags to maximize reach when you post your AI-generated visual content." },
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
