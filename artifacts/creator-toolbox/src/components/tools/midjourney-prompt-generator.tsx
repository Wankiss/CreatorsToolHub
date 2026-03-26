import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Copy, Check, RefreshCw, Loader2, ChevronDown,
  Zap, TrendingUp, Shield, ListChecks, Search, FileText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type VisualType =
  | "youtube-thumbnail" | "instagram-post" | "instagram-story" | "tiktok-cover"
  | "course-cover" | "logo" | "social-banner" | "linkedin-banner"
  | "pinterest-pin" | "brand-identity" | "facebook-cover" | "product-mockup";

type Style =
  | "photorealistic" | "cinematic" | "digital-illustration" | "cartoon"
  | "minimal" | "abstract" | "3d-render" | "futuristic"
  | "watercolor" | "vintage" | "flat-design" | "dark-fantasy";

type Mood = "dramatic" | "bright" | "vibrant" | "soft" | "cinematic" | "mysterious" | "cheerful" | "bold" | "moody" | "energetic";
type Lighting = "studio" | "natural" | "cinematic" | "backlit" | "softbox" | "golden-hour" | "neon" | "dramatic";
type Perspective = "close-up" | "wide-shot" | "portrait" | "top-down" | "isometric" | "eye-level" | "dynamic" | "none";

interface GeneratedPrompt {
  label: string;
  prompt: string;
  explanation: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const VISUAL_TYPES: { value: VisualType; label: string; icon: string; ar: string }[] = [
  { value: "youtube-thumbnail", label: "YouTube Thumbnail", icon: "▶️", ar: "16:9" },
  { value: "instagram-post", label: "Instagram Post", icon: "📸", ar: "1:1" },
  { value: "instagram-story", label: "Instagram Story", icon: "📱", ar: "9:16" },
  { value: "tiktok-cover", label: "TikTok Cover", icon: "🎵", ar: "9:16" },
  { value: "course-cover", label: "Course Cover", icon: "🎓", ar: "16:9" },
  { value: "logo", label: "Logo", icon: "✨", ar: "1:1" },
  { value: "social-banner", label: "Social Media Banner", icon: "🖼️", ar: "3:1" },
  { value: "linkedin-banner", label: "LinkedIn Banner", icon: "💼", ar: "4:1" },
  { value: "pinterest-pin", label: "Pinterest Pin", icon: "📌", ar: "2:3" },
  { value: "brand-identity", label: "Brand Identity", icon: "🎨", ar: "1:1" },
  { value: "facebook-cover", label: "Facebook Cover", icon: "👥", ar: "16:9" },
  { value: "product-mockup", label: "Product Mockup", icon: "📦", ar: "1:1" },
];

const STYLES: { value: Style; label: string; descriptors: string }[] = [
  { value: "photorealistic", label: "Photorealistic", descriptors: "photorealistic, ultra-detailed, 8K resolution, sharp focus, professional photography" },
  { value: "cinematic", label: "Cinematic", descriptors: "cinematic photography, film grain, anamorphic lens, dramatic depth of field, movie-quality" },
  { value: "digital-illustration", label: "Digital Illustration", descriptors: "digital painting, smooth brush strokes, detailed linework, concept art, professional illustration" },
  { value: "cartoon", label: "Cartoon", descriptors: "cartoon illustration, bold outlines, vibrant flat colors, expressive character design, animated style" },
  { value: "minimal", label: "Minimalist", descriptors: "minimalist design, clean composition, generous negative space, simple geometric forms, refined elegance" },
  { value: "abstract", label: "Abstract", descriptors: "abstract art, dynamic geometric shapes, bold color fields, fluid forms, contemporary fine art style" },
  { value: "3d-render", label: "3D Render", descriptors: "3D render, octane render, ray tracing, subsurface scattering, photorealistic materials, studio lighting" },
  { value: "futuristic", label: "Futuristic", descriptors: "futuristic design, cyberpunk aesthetic, holographic elements, neon accents, sci-fi atmosphere, ultra-modern" },
  { value: "watercolor", label: "Watercolor", descriptors: "watercolor painting, soft washes, translucent layers, organic edges, artistic texture, hand-painted quality" },
  { value: "vintage", label: "Vintage", descriptors: "vintage photography, film grain, muted desaturated tones, retro color palette, aged texture, nostalgic aesthetic" },
  { value: "flat-design", label: "Flat Design", descriptors: "flat design illustration, bold solid colors, geometric shapes, vector art style, clean iconographic" },
  { value: "dark-fantasy", label: "Dark Fantasy", descriptors: "dark fantasy art, dramatic shadows, epic atmosphere, intricate details, gothic elements, otherworldly lighting" },
];

const MOODS: { value: Mood; label: string; descriptors: string }[] = [
  { value: "dramatic", label: "Dramatic", descriptors: "dramatic mood, high contrast, deep shadows, intense atmosphere, powerful composition" },
  { value: "bright", label: "Bright", descriptors: "bright and airy, high key lighting, clean and fresh, optimistic energy" },
  { value: "vibrant", label: "Vibrant", descriptors: "vibrant colors, energetic composition, bold saturation, eye-catching palette" },
  { value: "soft", label: "Soft", descriptors: "soft and dreamy, pastel tones, gentle gradients, ethereal quality, delicate atmosphere" },
  { value: "cinematic", label: "Cinematic", descriptors: "cinematic mood, movie-quality composition, story-driven atmosphere, epic scale" },
  { value: "mysterious", label: "Mysterious", descriptors: "mysterious atmosphere, low key lighting, moody and enigmatic, deep shadows, unknown narrative" },
  { value: "cheerful", label: "Cheerful", descriptors: "cheerful and uplifting, warm inviting colors, positive energy, welcoming composition" },
  { value: "bold", label: "Bold", descriptors: "bold statement, high impact visuals, strong contrast, commanding presence, graphic power" },
  { value: "moody", label: "Moody", descriptors: "moody atmosphere, desaturated tones, emotional depth, contemplative feeling, rich shadows" },
  { value: "energetic", label: "Energetic", descriptors: "dynamic composition, energetic movement, high impact energy, motion blur, kinetic force" },
];

const LIGHTINGS: { value: Lighting; label: string; descriptors: string }[] = [
  { value: "studio", label: "Studio", descriptors: "professional studio lighting, clean controlled light, even illumination" },
  { value: "natural", label: "Natural Light", descriptors: "natural daylight, soft organic shadows, realistic ambient illumination" },
  { value: "cinematic", label: "Cinematic", descriptors: "cinematic lighting, dramatic rim light, three-point lighting setup, motivated light sources" },
  { value: "backlit", label: "Backlit", descriptors: "backlit silhouette, rim lighting, glowing edges, halo effect, contre-jour" },
  { value: "softbox", label: "Soft Box", descriptors: "soft box lighting, even diffused illumination, professional portrait lighting, flattering shadows" },
  { value: "golden-hour", label: "Golden Hour", descriptors: "golden hour lighting, warm sunset tones, long soft shadows, magical atmospheric glow" },
  { value: "neon", label: "Neon Glow", descriptors: "neon lighting, glowing neon signs, vibrant colored light reflections, cyberpunk glow, LED ambiance" },
  { value: "dramatic", label: "Dramatic", descriptors: "dramatic chiaroscuro lighting, deep directional shadows, high contrast, Rembrandt lighting" },
];

const PERSPECTIVES: { value: Perspective; label: string }[] = [
  { value: "none", label: "Auto" },
  { value: "close-up", label: "Close-up" },
  { value: "wide-shot", label: "Wide Shot" },
  { value: "portrait", label: "Portrait" },
  { value: "top-down", label: "Top-Down" },
  { value: "isometric", label: "Isometric" },
  { value: "eye-level", label: "Eye-Level" },
  { value: "dynamic", label: "Dynamic Angle" },
];

// ─── Prompt Generation Engine ─────────────────────────────────────────────────

function getDefaultPerspective(visualType: VisualType, override: Perspective): string {
  if (override !== "none") {
    const perspMap: Record<Perspective, string> = {
      "none": "",
      "close-up": "close-up shot, tight crop, detailed focus",
      "wide-shot": "wide shot, expansive composition, environmental context",
      "portrait": "portrait orientation, vertical composition, centered subject",
      "top-down": "top-down view, flat lay composition, overhead perspective",
      "isometric": "isometric perspective, 45-degree angle, balanced geometry",
      "eye-level": "eye-level perspective, direct frontal view, natural viewpoint",
      "dynamic": "dynamic angle, dramatic perspective, diagonal composition, motion energy",
    };
    return perspMap[override];
  }
  const defaults: Record<VisualType, string> = {
    "youtube-thumbnail": "close-up, dynamic composition, bold subject placement",
    "instagram-post": "eye-level, centered balanced composition",
    "instagram-story": "portrait orientation, vertical full-bleed composition",
    "tiktok-cover": "portrait orientation, centered vertical composition",
    "course-cover": "clean centered layout, professional composition",
    "logo": "centered composition, isolated subject, minimal surroundings",
    "social-banner": "wide horizontal composition, left-to-right flow",
    "linkedin-banner": "wide horizontal composition, professional layout",
    "pinterest-pin": "vertical portrait composition, tall format",
    "brand-identity": "centered composition, symmetrical layout",
    "facebook-cover": "wide horizontal composition, atmospheric depth",
    "product-mockup": "three-quarter view, product hero shot",
  };
  return defaults[visualType];
}

function getVisualTypeDescriptor(visualType: VisualType): string {
  const map: Record<VisualType, string> = {
    "youtube-thumbnail": "YouTube thumbnail, high-contrast click-worthy visual",
    "instagram-post": "Instagram post visual, square format social content",
    "instagram-story": "Instagram Story graphic, vertical social media content",
    "tiktok-cover": "TikTok video cover, vertical social media visual",
    "course-cover": "online course cover image, professional educational visual",
    "logo": "brand logo design, professional identity mark",
    "social-banner": "social media banner, horizontal promotional graphic",
    "linkedin-banner": "LinkedIn profile banner, professional background cover",
    "pinterest-pin": "Pinterest pin image, vertical lifestyle or informational graphic",
    "brand-identity": "brand identity visual, cohesive brand design element",
    "facebook-cover": "Facebook cover photo, wide banner social media graphic",
    "product-mockup": "product mockup, commercial product showcase visual",
  };
  return map[visualType];
}

function getQualityParams(visualType: VisualType, ar: string): string {
  const arOverride = ar.trim() ? ar.trim().replace(":", ":") : null;
  const defaultAr = VISUAL_TYPES.find(v => v.value === visualType)?.ar ?? "1:1";
  const finalAr = arOverride || defaultAr;
  return `--ar ${finalAr} --q 2 --v 6`;
}

function buildVariations(
  subject: string,
  styleEntry: typeof STYLES[0],
  moodEntry: typeof MOODS[0],
  lightingEntry: typeof LIGHTINGS[0],
  visualType: VisualType,
  perspective: Perspective,
  colorPalette: string,
  extra: string,
  ar: string,
): GeneratedPrompt[] {
  const typeDesc = getVisualTypeDescriptor(visualType);
  const perspDesc = getDefaultPerspective(visualType, perspective);
  const params = getQualityParams(visualType, ar);
  const colorStr = colorPalette.trim() ? `, ${colorPalette.trim()} color palette` : "";
  const extraStr = extra.trim() ? `, ${extra.trim()}` : "";

  const compositionVariants = [
    "highly detailed, sharp focus",
    "intricate textures, refined composition",
    "clean professional finish, polished render",
    "award-winning composition, visually striking",
  ];

  const styleVariants: string[] = [
    styleEntry.descriptors,
    "photorealistic, ultra-detailed, 8K resolution, professional photography",
    "clean minimalist aesthetic, refined negative space, graphic design quality",
    "bold high-impact visual, strong graphic statement, commercial quality",
  ];

  const explanations: Record<string, (s: string, m: string) => string> = {
    "youtube-thumbnail": (s, m) => `A ${m} YouTube thumbnail featuring ${s} — optimized for high contrast and maximum click-through rate at small display sizes.`,
    "instagram-post": (s, m) => `A ${m} Instagram feed post visual centered on ${s}, designed for strong scroll-stopping impact in a square format.`,
    "instagram-story": (s, m) => `A ${m} Instagram Story graphic with ${s} at the focal point, optimized for the full vertical screen format.`,
    "tiktok-cover": (s, m) => `A ${m} TikTok video cover featuring ${s}, vertical composition optimized for the TikTok browse grid.`,
    "course-cover": (s, m) => `A clean, professional course cover image for ${s} with a ${m} feel, designed for credibility on learning platforms.`,
    "logo": (s, m) => `A ${m} logo design concept for ${s}, with professional mark characteristics ready for brand use.`,
    "social-banner": (s, m) => `A ${m} social media banner centered on ${s}, wide horizontal format optimized for cross-platform use.`,
    "linkedin-banner": (s, m) => `A professional LinkedIn banner with a ${m} tone featuring ${s}, designed to make a strong first impression on profile views.`,
    "pinterest-pin": (s, m) => `A ${m} Pinterest Pin featuring ${s} in a tall vertical format that performs well in Pinterest's discovery feed.`,
    "brand-identity": (s, m) => `A ${m} brand identity visual for ${s}, establishing a cohesive visual language and professional brand presence.`,
    "facebook-cover": (s, m) => `A ${m} Facebook cover photo with ${s} as the central theme, wide horizontal format with atmospheric depth.`,
    "product-mockup": (s, m) => `A commercial-quality product mockup of ${s} with ${m} mood and professional hero-shot composition.`,
  };

  const getExplanation = (styleLabel: string, idx: number) => {
    const moodLabel = moodEntry.label.toLowerCase();
    const base = explanations[visualType]?.(subject, moodLabel) ?? `A ${moodLabel} visual featuring ${subject}.`;
    const suffixes = [
      ` Style: ${styleLabel}.`,
      ` Photorealistic variation with ultra-detailed rendering and 8K quality.`,
      ` Minimalist variation — clean, refined, and graphic design-forward.`,
      ` Bold commercial variation — high-impact and attention-commanding.`,
    ];
    return base + (suffixes[idx] || "");
  };

  return styleVariants.slice(0, 4).map((styleDesc, idx) => {
    const comp = compositionVariants[idx];
    const perspective_part = perspDesc ? `, ${perspDesc}` : "";
    const fullPrompt =
      `${subject}, ${typeDesc}, ${styleDesc}, ${moodEntry.descriptors}, ${lightingEntry.descriptors}${colorStr}, ${comp}${perspective_part}${extraStr} ${params}`;

    const label = idx === 0
      ? `Variation 1 — ${styleEntry.label} Style`
      : idx === 1
      ? "Variation 2 — Photorealistic"
      : idx === 2
      ? "Variation 3 — Clean & Minimal"
      : "Variation 4 — Bold & Commercial";

    return {
      label,
      prompt: fullPrompt,
      explanation: getExplanation(styleEntry.label, idx),
    };
  });
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a Midjourney prompt generator and why do I need one?",
    a: "A Midjourney prompt generator creates optimized, syntax-correct prompts for the Midjourney AI image generation platform. Midjourney prompts are not written in natural sentences — they use a specific comma-separated syntax with style descriptors, lighting terms, composition guidance, and technical parameters like --ar (aspect ratio), --q (quality), and --v (version). Getting this syntax right determines whether your generated image looks amateur or professional. The Midjourney Prompt Generator on Creator Toolbox translates your creative intent into properly structured prompts that produce high-quality visuals on the first attempt — no design experience or Midjourney expertise required.",
  },
  {
    q: "What is the correct Midjourney prompt syntax?",
    a: "A properly structured Midjourney prompt follows this order: [Subject/Concept], [Style descriptors], [Mood/Atmosphere], [Lighting], [Composition/Details], [Color palette if needed], [Perspective/Angle], then parameters at the end: --ar [aspect ratio] --q [quality] --v [version]. For example: 'futuristic city skyline, cyberpunk aesthetic, neon accents, cinematic lighting, dramatic mood, volumetric fog, wide-angle lens, vibrant neon colors --ar 16:9 --q 2 --v 6'. Parameters are always last, never in the middle of descriptors. Commas separate descriptors — do not use periods or semicolons.",
  },
  {
    q: "What do the Midjourney parameters --ar, --q, and --v mean?",
    a: "--ar controls the aspect ratio of the generated image (e.g., --ar 16:9 for YouTube thumbnails, --ar 1:1 for Instagram posts, --ar 9:16 for Stories and TikTok). --q controls render quality (--q 1 is standard, --q 2 is higher quality and takes longer). --v specifies the Midjourney model version — --v 6 is the current latest version with the best prompt adherence and image quality. --style 4a was used in older versions for specific stylization. Our prompt generator automatically applies the correct --ar for your chosen visual type and uses --q 2 --v 6 by default for maximum quality.",
  },
  {
    q: "What aspect ratio should I use for different content types?",
    a: "The optimal aspect ratios for each platform are: YouTube thumbnails → --ar 16:9, Instagram feed posts → --ar 1:1 (square), Instagram Stories and TikTok covers → --ar 9:16 (vertical), Pinterest pins → --ar 2:3 (tall), LinkedIn banners → --ar 4:1 (ultra-wide), course covers → --ar 16:9, logos and brand identity → --ar 1:1. The Midjourney Prompt Generator automatically applies the correct aspect ratio based on your selected visual type — you can also override it manually in the Aspect Ratio field.",
  },
  {
    q: "What are the best Midjourney styles for YouTube thumbnails?",
    a: "YouTube thumbnails perform best with high-contrast, visually bold styles that read clearly at small sizes. The most effective Midjourney thumbnail approaches are: (1) Cinematic — dramatic lighting with strong subject-background separation. (2) Photorealistic — ultra-detailed photography-style with extreme clarity. (3) Bold Graphic — high-impact color contrast with a dominant focal point. For thumbnails specifically, always use --ar 16:9, include 'high contrast' and 'bold composition' in your descriptors, and specify warm or electric colors that stand out in YouTube's white-dominant interface. Avoid soft, pastel, or detailed abstract styles — they lose impact at thumbnail size.",
  },
  {
    q: "How do I generate Instagram-optimized Midjourney prompts?",
    a: "For Instagram posts, use --ar 1:1 for feed posts and --ar 9:16 for Stories. Instagram visuals perform best when they have clear visual hierarchy, a dominant focal point, and either a cohesive color palette that matches brand identity or high-contrast content that pops in a scrolling feed. Strong Instagram Midjourney styles include editorial photography (for lifestyle content), flat design (for quote or informational graphics), and cinematic (for storytelling content). For Reels covers, portrait orientation (9:16) with centered subject placement and text-safe composition is key.",
  },
  {
    q: "Can I use Midjourney for free?",
    a: "Midjourney requires a paid subscription to generate images — free trials are no longer available as of 2024. Subscription plans start at $10/month for basic access with limited generations per month, $30/month for standard with more generations, and $60/month for pro with fast GPU access. However, the Midjourney Prompt Generator on Creator Toolbox is completely free with no account required — you can generate and refine as many prompts as you need, then use those prompts in your Midjourney subscription when you're ready to generate images.",
  },
  {
    q: "What makes a good Midjourney prompt for professional results?",
    a: "Professional Midjourney prompts have five key characteristics: (1) Specific subject description — not just 'woman' but 'confident business woman in her 30s wearing a tailored navy suit'. (2) Style and medium clarity — 'cinematic photography' tells Midjourney far more than just 'realistic'. (3) Lighting specification — lighting is the most underused element in amateur prompts; 'golden hour backlight with lens flare' produces dramatically better results than no lighting at all. (4) Composition guidance — 'close-up portrait, shallow depth of field, subject centered in frame'. (5) Correct parameters — always end with --ar, --q 2, and --v 6 for best results.",
  },
  {
    q: "How do I generate multiple Midjourney prompt variations?",
    a: "The Midjourney Prompt Generator produces 4 prompt variations for every generation: your chosen style, a photorealistic variant, a clean minimal variant, and a bold commercial variant. This gives you four different visual directions to explore from the same inputs without having to manually adjust descriptors. In Midjourney itself, you can also generate variations by: (1) Clicking the V1–V4 buttons under any image to create variations of specific results. (2) Adding slight descriptor changes — swapping 'cinematic' for 'editorial' or 'dramatic' for 'ethereal' — to explore different directions. (3) Using the 'Regenerate All' button in Creator Toolbox to generate a completely different set of prompts for the same visual type.",
  },
  {
    q: "How do I create a Midjourney prompt for a brand logo?",
    a: "Logo generation in Midjourney works best with these elements: (1) Select Logo as your visual type for the correct 1:1 aspect ratio. (2) Describe the brand name, industry, and desired personality (e.g., 'tech startup logo, modern and bold, geometric mark'). (3) Style: use 'flat design' or 'minimal vector illustration' — complex photorealistic styles don't translate well to actual logo files. (4) Add 'isolated on white background, clean edges' to ensure the logo is extractable. (5) Include 'simple, memorable, scalable design, professional mark' as quality descriptors. Note: Midjourney generates logo concepts and visual references — the final logo will need to be traced in vector software (Adobe Illustrator, Figma) for actual brand use.",
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

// ─── Prompt Result Card ───────────────────────────────────────────────────────

function PromptCard({ result, onCopy, copied }: { result: GeneratedPrompt; onCopy: () => void; copied: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
          {result.label}
        </span>
        <button
          onClick={onCopy}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
            copied
              ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
              : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
          }`}
        >
          {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
        </button>
      </div>
      <div className="p-5 space-y-3">
        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-foreground bg-muted/40 rounded-xl p-4 border border-border overflow-x-auto">
          {result.prompt}
        </pre>
        <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span><strong className="text-foreground">Expected visual:</strong> {result.explanation}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MidjourneyPromptGeneratorTool() {
  const [visualType, setVisualType] = useState<VisualType>("youtube-thumbnail");
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState<Style>("photorealistic");
  const [mood, setMood] = useState<Mood>("dramatic");
  const [lighting, setLighting] = useState<Lighting>("cinematic");
  const [perspective, setPerspective] = useState<Perspective>("none");
  const [colorPalette, setColorPalette] = useState("");
  const [arOverride, setArOverride] = useState("");
  const [extra, setExtra] = useState("");

  const [results, setResults] = useState<GeneratedPrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [error, setError] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-mj-prompt-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = (regen = false) => {
    if (!subject.trim()) {
      setError("Please describe your subject or concept.");
      return;
    }
    setError("");
    setIsGenerating(true);
    setTimeout(() => {
      const styleEntry = STYLES.find(s => s.value === style)!;
      const moodEntry = MOODS.find(m => m.value === mood)!;
      const lightingEntry = LIGHTINGS.find(l => l.value === lighting)!;
      const prompts = buildVariations(
        subject, styleEntry, moodEntry, lightingEntry,
        visualType, perspective, colorPalette, extra, arOverride,
      );
      setResults(prompts);
      setIsGenerating(false);
      setHasGenerated(true);
      if (!regen) {
        setTimeout(() => document.getElementById("mj-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }, 520);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleGenerate(false); };

  const copyPrompt = (idx: number) => {
    navigator.clipboard.writeText(results[idx].prompt);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(results.map((r, i) => `--- ${r.label} ---\n${r.prompt}`).join("\n\n"));
    setCopiedAll(true);
    toast({ title: "All prompts copied!", description: `${results.length} Midjourney prompts copied to clipboard.`, duration: 2500 });
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const currentAr = VISUAL_TYPES.find(v => v.value === visualType)?.ar ?? "1:1";

  return (
    <>
      {/* ── Input Card ───────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Visual Type */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Visual Type / Use Case <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {VISUAL_TYPES.map(({ value, label, icon, ar }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVisualType(value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all text-left ${
                      visualType === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: <strong className="text-foreground">{VISUAL_TYPES.find(v => v.value === visualType)?.label}</strong> — default aspect ratio: <code className="font-mono bg-muted px-1 rounded">--ar {arOverride || currentAr}</code>
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Subject / Concept / Theme <span className="text-red-500">*</span>
              </label>
              <Input
                value={subject}
                onChange={e => { setSubject(e.target.value); if (error) setError(""); }}
                placeholder="e.g. confident entrepreneur at a laptop, futuristic city skyline, minimalist coffee brand"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
              />
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Style</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {STYLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStyle(value)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all text-center ${
                      style === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood + Lighting */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Mood / Tone</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMood(value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        mood === value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Lighting</label>
                <div className="flex flex-wrap gap-2">
                  {LIGHTINGS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLighting(value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        lighting === value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Perspective */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                Perspective / Angle <span className="text-muted-foreground font-normal normal-case">(optional — Auto matches your visual type)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PERSPECTIVES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPerspective(value)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      perspective === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional fields row */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Color Palette <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={colorPalette}
                  onChange={e => setColorPalette(e.target.value)}
                  placeholder="e.g. deep navy and gold, neon purple and teal"
                  className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Aspect Ratio Override <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={arOverride}
                  onChange={e => setArOverride(e.target.value)}
                  placeholder={`Default: ${currentAr} — e.g. 16:9, 1:1, 9:16`}
                  className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                  Extra Instructions <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <Input
                  value={extra}
                  onChange={e => setExtra(e.target.value)}
                  placeholder="e.g. bold typography, no text overlay, brand logo placement"
                  className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isGenerating}
              className="w-full h-14 text-lg rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              {isGenerating
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Prompts...</>
                : <><Sparkles className="mr-2 h-5 w-5" />Generate Midjourney Prompts</>
              }
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {hasGenerated && results.length > 0 && (
        <section id="mj-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" />
                Your Midjourney Prompts
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">{results.length} variations — copy-paste ready for Midjourney</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </button>
              <button
                onClick={copyAll}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-xl border transition-all ${
                  copiedAll
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                    : "bg-primary text-primary-foreground border-primary hover:opacity-90"
                }`}
              >
                {copiedAll ? <><Check className="w-3 h-3" />Copied All</> : <><Copy className="w-3 h-3" />Copy All</>}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((result, i) => (
              <PromptCard
                key={i}
                result={result}
                onCopy={() => copyPrompt(i)}
                copied={copiedIndex === i}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>Copy any prompt and paste directly into <strong className="text-foreground">Midjourney</strong> via Discord (/imagine) or the Midjourney web interface. Use <strong className="text-foreground">Regenerate All</strong> to get fresh variations with different descriptor combinations.</span>
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Midjourney Prompt Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Choose Your Visual Type", desc: "Select from 12 use cases — YouTube Thumbnail, Instagram Post, Story, TikTok Cover, Course Cover, Logo, Banner, Pinterest Pin, and more. The tool automatically sets the correct aspect ratio for your chosen platform." },
            { step: 2, title: "Describe Your Subject and Style", desc: "Enter your subject or concept — be specific for better results (e.g., 'confident woman entrepreneur at a minimalist desk' vs. 'woman working'). Select your style, mood, lighting, and optional perspective and color palette." },
            { step: 3, title: "Click Generate Midjourney Prompts", desc: "Hit Generate and the tool instantly creates 4 optimized prompt variations — your selected style, plus photorealistic, clean minimal, and bold commercial alternatives — all in correct Midjourney syntax with parameters." },
            { step: 4, title: "Copy and Paste Into Midjourney", desc: "Click Copy on any prompt and paste it into Midjourney via the /imagine command in Discord or the Midjourney web interface. Use Copy All to grab all 4 variations for batch exploration." },
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
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This Midjourney Prompt Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This Midjourney Prompt Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This free Midjourney Prompt Generator builds optimized, syntax-correct Midjourney prompts for 12 content creator use cases — from YouTube thumbnails and Instagram posts to course covers, logos, Pinterest pins, and brand identity visuals. It applies the correct aspect ratio for each platform automatically, generates 4 prompt variations per session (your chosen style, photorealistic, clean minimal, and bold commercial), and includes all required Midjourney syntax elements: subject descriptors, style keywords, mood and lighting terms, composition guidance, and parameters (--ar, --q 2, --v 6). Every prompt is ready to paste into Midjourney with no editing required.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Midjourney Prompt Structure Determines Visual Quality
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Midjourney is a remarkably powerful image generation tool, but its output quality is entirely dependent on prompt structure. The platform interprets prompts extremely literally — missing a lighting descriptor produces flat, uninspired lighting; missing a composition term produces random framing; missing style descriptors produces generic results that don't match your creative intent. Professional Midjourney users spend months learning which descriptor combinations produce specific visual outputs. The order of descriptors matters too — Midjourney weights earlier descriptors more heavily than later ones, so subject and style come first, with secondary descriptors following. This generator packages expert prompt engineering knowledge into a free tool that produces professional results regardless of your Midjourney experience level.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Tool
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "12 visual type presets with auto-applied platform aspect ratios",
                "12 style options with professional descriptor expansions",
                "10 mood descriptors and 8 lighting configurations",
                "4 prompt variations per session across different style directions",
                "Correct Midjourney syntax — commas, descriptor order, parameters",
                "--ar, --q 2, --v 6 parameters automatically applied",
                "Copy individual prompts or Copy All for batch Midjourney sessions",
                "Explanation preview shows expected visual before generating",
                "Regenerate All for fresh variations without re-entering inputs",
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

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => <AccordionItem key={i} question={item.q} answer={item.a} index={i} />)}
        </div>
      </section>
    </>
  );
}
