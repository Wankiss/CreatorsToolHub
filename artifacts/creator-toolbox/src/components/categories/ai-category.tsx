import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { ToolCard } from "@/components/tool-card";
import { ChevronDown } from "lucide-react";

const YEAR = new Date().getFullYear();

interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  usageCount: number;
  isActive?: boolean;
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tools: Tool[];
}

interface Props {
  category: CategoryData;
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "What is an AI prompt generator and why do content creators need one?",
    a: "An AI prompt generator is a tool that helps you craft structured, specific instructions for AI systems like ChatGPT, Claude, Gemini, and other large language models to produce better outputs. Content creators need them because the quality of any AI output is almost entirely determined by the quality of the prompt — a vague prompt produces a generic result, while a well-engineered prompt produces something specific, usable, and aligned with your voice and goals. Most creators interact with AI tools through trial and error, wasting time refining poor outputs. A prompt generator eliminates that friction by structuring your input with the role, context, audience, format, tone, and constraints that AI models need to deliver professional-quality content on the first attempt.",
  },
  {
    q: "How many content creators actually use AI tools?",
    a: "According to Adobe's October 2025 Creators Survey — a study of 16,000 creators across 8 countries — 86% of creators globally now actively use generative AI, and 76% say it has accelerated their business or follower growth. The top use cases are editing and upscaling (55%), generating new assets like images and video (52%), and ideation and brainstorming (48%). The primary barrier to adoption is not capability — it's cost: 38% of creators cite high cost as the #1 reason they haven't adopted more AI tools. Free AI tools that eliminate the subscription barrier are the fastest-growing segment of creator tool adoption.",
  },
  {
    q: "How big is the AI content creation market?",
    a: "The AI-powered content creation market was valued at $2.15 billion in 2024 and is projected to reach $10.59 billion by 2033, growing at a 19.4% compound annual growth rate, according to The Business Research Company. This growth is driven by creator demand for tools that accelerate production without requiring technical expertise — the highest-adoption segment is free, browser-based AI generators that work without API keys, subscriptions, or software installation. For individual creators, the practical impact is access to production workflows that previously required either expensive software or outsourced freelancers.",
  },
  {
    q: "What is the difference between a ChatGPT prompt and a Midjourney prompt?",
    a: "ChatGPT prompts and Midjourney prompts are structurally and syntactically completely different. ChatGPT prompts (and prompts for other language models) are written in natural language sentences — they include instructions, context, roles, tone directions, format requirements, and examples to guide text generation. A good ChatGPT prompt might read: 'You are an expert copywriter. Write a 3-paragraph Instagram caption for a fitness coach targeting busy moms aged 28–40. Tone: motivational but realistic. Include one question to drive comments.' Midjourney prompts, by contrast, are comma-separated descriptor lists optimized for image generation — they specify subject, art style, lighting, camera angle, color palette, mood, and rendering quality using keyword-dense syntax like: 'a modern home office, golden hour lighting, minimalist design, warm tones, productivity aesthetic, 4K detail, architectural photography.' The two prompt types require completely different structures, knowledge bases, and optimization strategies.",
  },
  {
    q: "How does the AI Prompt Generator work?",
    a: "The AI Prompt Generator on creatorsToolHub lets you select your use case (content creation, email writing, social media, SEO, scripts, business, research, and more), describe what you want to create, specify your target audience, choose your desired tone, and set the output format. The generator then builds a structured, role-based prompt using proven prompt engineering principles — including a system role for the AI, clear context about the task, specific constraints on length and format, audience definition, tone guidance, and example anchors. The result is a ready-to-use prompt that you can copy and paste directly into ChatGPT, Claude, Gemini, or any other AI tool and receive a high-quality output immediately without prompt iteration.",
  },
  {
    q: "How does the Midjourney Prompt Generator work?",
    a: "The Midjourney Prompt Generator takes a simple description of what you want to create and transforms it into an optimized Midjourney-syntax prompt complete with subject description, art style parameters, lighting specifications, color palette direction, mood descriptors, composition guidance, and quality parameters like --ar (aspect ratio), --v (version), and --q (quality). It generates multiple prompt variations across different visual styles — photorealistic, illustrated, cinematic, abstract — so you have options to explore rather than a single output. Each generated prompt follows Midjourney's preferred keyword density and ordering conventions, which directly affects image quality and prompt adherence.",
  },
  {
    q: "What makes a good AI prompt for content creation?",
    a: "A strong content creation AI prompt has six elements: (1) Role — tell the AI who it is ('You are an experienced YouTube scriptwriter who specializes in educational tech content'). (2) Context — describe the situation and background ('I'm creating a 10-minute video for my 50K subscriber channel about productivity tools'). (3) Task — specify exactly what you want ('Write a video script with a hook, 3 main sections, and a CTA'). (4) Audience — define who this is for ('Target audience: remote workers aged 25–40 who are overwhelmed with digital tools'). (5) Format — specify the output structure ('Format as a script with timestamps and speaker notes'). (6) Constraints — set limits and boundaries ('Keep it under 1,500 words, avoid jargon, use a conversational tone'). Prompts that skip any of these elements consistently produce generic output that requires significant editing.",
  },
  {
    q: "What are the best Midjourney prompt styles for social media content?",
    a: "For Instagram and social media content, the highest-performing Midjourney visual styles are: (1) Editorial photography — 'editorial photo, professional photography, clean composition, magazine quality, sharp focus' — for lifestyle and product content. (2) Cinematic — 'cinematic lighting, film grain, moody atmosphere, anamorphic lens, color graded' — for storytelling and personal brand content. (3) Flat design — 'flat design illustration, bold colors, geometric shapes, minimal, vector style' — for educational carousels and infographics. (4) Golden hour — 'golden hour lighting, warm tones, soft shadows, lifestyle photography' — for aspirational content. (5) Studio product — 'studio product photography, white background, professional lighting, commercial quality' — for product showcases. The Midjourney Prompt Generator generates prompts in each of these styles based on your content type and platform.",
  },
  {
    q: "Can I use these AI tools for YouTube, Instagram, and TikTok content?",
    a: "Yes — the AI Prompt Generator is platform-agnostic and built specifically for multi-platform creator workflows. It includes use cases tailored for YouTube (script writing, title brainstorming, description writing, hook generation), Instagram (caption writing, content planning, Story scripts, Reel hooks), and TikTok (video scripts, trend research prompts, viral hook generation, caption writing). You can specify the platform, content format, and desired outcome in the generator's input fields, and it will produce a prompt structured for that specific context. The Midjourney Prompt Generator is primarily used for thumbnail concepts, cover images, social media visuals, and brand identity exploration — all relevant across every major content platform.",
  },
  {
    q: "Is prompt engineering a real skill and is it worth learning?",
    a: `Prompt engineering is one of the most practical and immediately applicable skills for creators and professionals in ${YEAR}. The difference between a beginner and an expert at using AI tools is almost entirely a function of how well they can communicate with the model — and prompt engineering is that communication skill. OpenAI's own prompt engineering documentation identifies role assignment, explicit format requirements, and constraint specification as the three factors most reliably improving output quality across all models. For content creators, this translates directly into production speed: a creator with strong prompting skills consistently produces more usable first drafts than one iterating on vague inputs. The AI Prompt Generator on creatorsToolHub teaches prompting patterns through the outputs it generates — each prompt is an example of professional prompt structure.`,
  },
  {
    q: `What is the best AI tool for content creators in ${YEAR}?`,
    a: `The best AI tools for content creators in ${YEAR} depend on the creation stage: For ideation and writing, ChatGPT (GPT-4o), Claude 3.5 Sonnet, and Gemini 1.5 Pro are the top performers for long-form content, scripts, captions, and copywriting. For image generation, Midjourney v6 leads for stylized and artistic outputs; Ideogram is strong for text-in-image; Flux is emerging as a photorealism leader. For video, Runway Gen-3 and Kling handle short-form video generation. For audio and voiceover, ElevenLabs is the industry standard. The AI Prompt Generator works across all language model tools, and the Midjourney Prompt Generator is specifically optimized for Midjourney's syntax — but the principles of good image prompting apply to Flux, Ideogram, and DALL-E as well.`,
  },
  {
    q: "Are these AI creator tools free to use?",
    a: "Yes — the AI Prompt Generator and Midjourney Prompt Generator on creatorsToolHub are completely free with no account required, no subscription, and no usage limits. Generate as many prompts as you need for any content type, platform, or use case. The generated prompts are designed to work with both free and paid versions of AI tools — ChatGPT Free (GPT-4o mini), Claude Free, and Gemini Free all accept these prompts and produce high-quality outputs. For Midjourney, a paid subscription is required to use the image generation platform itself, but the prompt generator here is free and the prompts work immediately in Midjourney's Discord bot or web interface.",
  },
];

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-foreground hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        ref={bodyRef}
        style={{ maxHeight: open ? (bodyRef.current?.scrollHeight ?? 0) + "px" : "0px" }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{a}</div>
      </div>
    </div>
  );
}

// ─── Related Categories ───────────────────────────────────────────────────────

const RELATED_CATEGORIES = [
  { name: "YouTube Tools", slug: "youtube-tools", icon: "▶️", desc: "Grow your YouTube channel with title generators, SEO tools, and revenue calculators." },
  { name: "TikTok Tools", slug: "tiktok-tools", icon: "🎵", desc: "Generate TikTok hooks, captions, scripts, and viral content ideas." },
  { name: "Instagram Tools", slug: "instagram-tools", icon: "📸", desc: "Craft captions, plan content, and generate hashtags for Instagram growth." },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export function AiCategoryPage({ category }: Props) {
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "ai-category-faq-schema";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
        { "@type": "ListItem", position: 2, name: "AI Creator Tools", item: window.location.href },
      ],
    };
    const bc = document.createElement("script");
    bc.type = "application/ld+json";
    bc.id = "ai-category-breadcrumb-schema";
    bc.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(bc);

    return () => {
      document.getElementById("ai-category-faq-schema")?.remove();
      document.getElementById("ai-category-breadcrumb-schema")?.remove();
    };
  }, []);

  const activeTools = category.tools?.filter((t) => t.isActive !== false) ?? [];

  return (
    <>
      {/* ── Tools Grid + Content ─────────────────────────────── */}
      <section className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
              All {category.name}
              <span className="text-sm font-normal bg-muted text-muted-foreground px-3 py-1 rounded-full ml-2">
                {activeTools.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            {/* ─── SEO Article ──────────────────────────────────── */}
            <article className="mt-20 space-y-10 text-foreground">
              <header>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
                  The Best Free AI Tools for Content Creators in {YEAR}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  86% of creators globally now use generative AI — and 76% say it accelerated their business or
                  follower growth, according to{" "}
                  <a href="https://news.adobe.com/news/2025/10/adobe-max-2025-creators-survey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Adobe's October 2025 Creators Survey</a>{" "}
                  (n=16,000 creators, 8 countries). The primary barrier is not capability — it's cost: 38% of
                  creators cite high cost as the #1 adoption barrier. This free AI Creator Toolkit gives you
                  {" "}{activeTools.length} purpose-built prompt generators covering ChatGPT writing to Midjourney
                  visual content creation — no subscriptions, no sign-ups, instant results.
                </p>

                {/* Key Takeaways */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mt-6">
                  <p className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">Key Takeaways</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5 shrink-0">→</span>
                      <span>86% of creators now use generative AI and 76% say it accelerated their growth — the adoption gap is entirely about cost, not access (<a href="https://news.adobe.com/news/2025/10/adobe-max-2025-creators-survey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Adobe, Oct 2025</a>)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5 shrink-0">→</span>
                      <span>Prompt quality is the primary variable determining AI output quality — role assignment, format specification, and audience context are the three elements OpenAI's own documentation identifies as most impactful (<a href="https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Help Center</a>)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5 shrink-0">→</span>
                      <span>The AI content creation market is growing at 19.4% CAGR toward $10.59B by 2033 — free browser-based tools are the fastest-growing entry point for individual creators (<a href="https://www.thebusinessresearchcompany.com/report/ai-powered-content-creation-global-market-report" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Business Research Company, 2024</a>)</span>
                    </li>
                  </ul>
                </div>
              </header>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  AI Prompt Generator: Stop Writing Bad Prompts and Start Getting Usable Output
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ideation and brainstorming is the #3 AI use case among creators at 48% adoption, according
                  to{" "}
                  <a href="https://news.adobe.com/news/2025/10/adobe-max-2025-creators-survey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Adobe's 2025 Creators Survey</a>.
                  Yet most of those creators are getting inconsistent results — because prompt structure, not
                  AI capability, determines output quality.{" "}
                  <a href="https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">OpenAI's own prompt engineering documentation</a>{" "}
                  identifies role assignment, format specification, and explicit constraints as the three
                  elements that most reliably improve output quality across all models. The{" "}
                  <Link href="/tools/ai-prompt-generator" className="text-primary hover:underline font-medium">
                    AI Prompt Generator
                  </Link>{" "}
                  applies all three automatically from a four-field form.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The single biggest problem most creators face with AI tools is not the AI itself — it's the
                  prompts. Vague inputs produce vague outputs. A creator who types "write me a YouTube script
                  about productivity" into ChatGPT will receive something generic that takes as long to edit
                  as writing from scratch. A creator who specifies role, context, audience, format, tone, and
                  constraints gets a first draft that requires significantly less editing. The AI Prompt
                  Generator engineers that structure for you automatically.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The generator covers the full range of creator use cases: YouTube script writing, Instagram
                  caption generation, TikTok content ideation, email newsletter drafting, blog post outlining,
                  social media strategy, SEO content planning, course creation, podcast scripting, and business
                  copywriting. For each use case, it builds a prompt that includes a system role ("You are an
                  expert YouTube scriptwriter who..."), clear task definition, audience specification, format
                  requirements, tone direction, and example anchors. The result is a prompt that any major AI
                  model — ChatGPT, Claude, Gemini — can execute immediately and return professional-quality
                  output.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Beyond eliminating bad prompts, the AI Prompt Generator also teaches prompting technique by
                  example. Every generated prompt shows what a professionally engineered instruction looks like
                  — and creators who use the tool regularly report that their own manual prompting improves
                  significantly within weeks, because they internalize the structure. Better prompting is a
                  compounding skill: the better you get at it, the faster every AI-assisted task becomes.
                </p>
              </section>

              {/* YouTube Embed 1 */}
              <figure style={{margin:"2rem 0",position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"12px"}}>
                <iframe style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}}
                  srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/38MZWUaQyTE?autoplay=1'><img src='https://img.youtube.com/vi/38MZWUaQyTE/maxresdefault.jpg' alt='10 Best AI Tools For Content Creators 2026'><span>&#9654;</span></a>"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="10 Best AI Tools For Content Creators 2026"
                  aria-label="Video tutorial covering the best AI tools for content creators, including prompt generators and image AI tools">
                </iframe>
                <noscript><a href="https://www.youtube.com/watch?v=38MZWUaQyTE" target="_blank" rel="noopener">Watch: 10 Best AI Tools For Content Creators 2026 on YouTube</a></noscript>
              </figure>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Midjourney Prompt Generator: Create Professional Visuals Without Design Skills
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Generating new visual assets ranks as the #2 AI use case among creators at 52%, according
                  to{" "}
                  <a href="https://news.adobe.com/news/2025/10/adobe-max-2025-creators-survey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Adobe's 2025 Creators Survey</a>.
                  The bottleneck is not access to image AI — Midjourney is widely available — it's the
                  prompt syntax. Midjourney uses keyword-dense comma-separated descriptors with specific
                  parameters like{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">--ar</code>,{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">--v</code>, and{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">--q</code>, not natural
                  sentences — and the{" "}
                  <Link href="/tools/midjourney-prompt-generator" className="text-primary hover:underline font-medium">
                    Midjourney Prompt Generator
                  </Link>{" "}
                  translates your creative intent into that syntax without requiring you to learn it.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Midjourney is the leading AI image generation platform for creators who need high-quality,
                  stylized visuals — but it has a steep learning curve. Midjourney prompts are not written in
                  natural sentences; they use a keyword-dense syntax with specific parameters, style
                  descriptors, lighting terms, camera angle specifications, and technical flags like{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">--ar</code>,{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">--v</code>, and{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">--q</code>. Getting
                  these parameters right is the difference between a mediocre, off-brand image and a
                  scroll-stopping visual. The{" "}
                  <Link href="/tools/midjourney-prompt-generator" className="text-primary hover:underline font-medium">
                    Midjourney Prompt Generator
                  </Link>{" "}
                  translates your creative intent into precisely structured Midjourney syntax.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Content creators use Midjourney for YouTube thumbnail concepts, Instagram visual content,
                  product mockups, course cover images, brand identity exploration, blog post headers, and
                  social media graphics. Each of these use cases has a different optimal prompt structure —
                  a YouTube thumbnail prompt optimized for high contrast and readability at small sizes looks
                  completely different from a lifestyle Instagram prompt optimized for aspirational warmth and
                  visual richness. The Midjourney Prompt Generator produces multiple prompt variations per
                  generation across different visual styles: editorial photography, cinematic, flat illustration,
                  golden hour, and studio product — so you can explore options without learning Midjourney's
                  prompt syntax from scratch.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The generator also includes platform-specific aspect ratio recommendations: 16:9 for YouTube
                  thumbnails, 4:5 or 1:1 for Instagram feed posts, 9:16 for Stories and Reels covers, 1:1 for
                  social profile images. Getting the aspect ratio right at the prompt stage prevents crop
                  problems and compositional issues that make images look amateur on specific platforms.
                </p>
              </section>

              {/* YouTube Embed 2 */}
              <figure style={{margin:"2rem 0",position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"12px"}}>
                <iframe style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}}
                  srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/ijAfAHPv4JY?autoplay=1'><img src='https://img.youtube.com/vi/ijAfAHPv4JY/maxresdefault.jpg' alt='20 ChatGPT prompts every content creator needs in 2026'><span>&#9654;</span></a>"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="20 ChatGPT prompts every content creator needs in 2026"
                  aria-label="Tutorial showing 20 essential ChatGPT prompts for content creators covering YouTube, Instagram, and TikTok content">
                </iframe>
                <noscript><a href="https://www.youtube.com/watch?v=ijAfAHPv4JY" target="_blank" rel="noopener">Watch: 20 ChatGPT Prompts Every Content Creator Needs in 2026 on YouTube</a></noscript>
              </figure>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Prompt Engineering for Creators: Why the Input Determines Everything
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <a href="https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">OpenAI's prompt engineering best practices</a>{" "}
                  — published in the official Help Center — identify six techniques that most reliably improve
                  output quality: writing clear instructions, providing reference text, splitting tasks into
                  subtasks, giving the model time to "think," using external tools, and testing changes
                  systematically. Most creators use none of these systematically. That's the gap between
                  getting inconsistent AI output and getting output you can publish.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Prompt engineering is the practice of crafting inputs that reliably produce the outputs you
                  need from AI systems. For content creators, it's one of the highest-leverage skills available
                  in {YEAR} because it affects the output quality of every AI interaction — and creators who
                  interact with AI tools daily see compounding returns on the time they invest in learning it.
                  The core principle is simple: AI models are pattern-matching systems that perform best when
                  given clear role definition, specific context, unambiguous task description, defined
                  constraints, and format requirements.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The most common prompt mistake creators make is treating AI like a search engine — typing a
                  short query and expecting a sophisticated answer. This works for factual lookups but fails for
                  creative and professional output. A creator asking "write a YouTube hook" gets a generic
                  hook. A creator who specifies "write a pattern-interrupt hook for a YouTube video targeting
                  freelancers aged 25–35 who are burned out, in a conversational tone, under 25 words, that
                  creates curiosity without clickbait" gets something immediately usable. The difference is
                  specificity — and the AI Prompt Generator builds that specificity automatically from your
                  input.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  For image generation specifically, the gap between a naive Midjourney prompt and an
                  engineered one is even more dramatic. Midjourney v6 is extraordinarily capable, but it
                  interprets prompts extremely literally — missing a lighting descriptor, art style qualifier,
                  or composition term produces an image that's technically competent but stylistically random.
                  Professional Midjourney users spend years learning which descriptor combinations produce which
                  visual outputs. The Midjourney Prompt Generator packages that expertise into a free tool
                  anyone can use immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  How to Build an AI-Powered Content Workflow for Creators
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  60% of creators now use multiple AI tools simultaneously, according to{" "}
                  <a href="https://news.adobe.com/news/2025/10/adobe-max-2025-creators-survey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Adobe's 2025 Creators Survey</a>.
                  The creators reporting the biggest production gains are not using AI to replace their
                  creative process — they're using it to eliminate the slow, repetitive, or blank-page stages
                  while keeping their authentic voice in the final output. The difference between AI as a
                  time-saver and AI as a crutch is the workflow structure.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Here is a practical weekly AI content workflow that integrates prompt generation
                  into every stage:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm leading-relaxed mb-4">
                  <li>
                    <strong className="text-foreground">Ideation (Monday):</strong> Use the AI Prompt Generator
                    with the "content ideation" use case to generate a prompt, then run it through ChatGPT
                    or Claude to produce 15–20 content ideas for the week. Filter to your 3 best options.
                  </li>
                  <li>
                    <strong className="text-foreground">Scripting and copy (Tuesday–Wednesday):</strong> Generate
                    a script-writing prompt tailored to your platform (YouTube long-form, TikTok 60-second,
                    Instagram Reel) and topic. Use the output as a first draft, then edit for voice and accuracy.
                  </li>
                  <li>
                    <strong className="text-foreground">Visual content (Thursday):</strong> Use the Midjourney
                    Prompt Generator to create thumbnail concepts, post header images, or Instagram visuals.
                    Generate 3–4 variations and pick the strongest visual direction.
                  </li>
                  <li>
                    <strong className="text-foreground">Captions and copy (Friday):</strong> Generate a caption-writing
                    prompt with your audience, tone, and platform specified. Use the AI output as a starting
                    point and add your unique personal touches before publishing.
                  </li>
                  <li>
                    <strong className="text-foreground">Batch scheduling (weekend):</strong> Use a longer-horizon
                    ideation prompt to plan 2–4 weeks of content at once, then schedule the batch to maintain
                    consistency without daily creative decisions.
                  </li>
                </ol>
                <p className="text-muted-foreground leading-relaxed">
                  The key to making this workflow sustainable is using AI for production speed while keeping
                  human judgment in every publishing decision. AI handles the volume; you handle the quality
                  gate. Adobe's data shows 76% of creators who adopted this approach say it accelerated their
                  business or follower growth — the compounding effect of consistent, structured output over
                  weeks is where the real gain comes from.
                </p>
              </section>

              {/* YouTube Embed 3 */}
              <figure style={{margin:"2rem 0",position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"12px"}}>
                <iframe style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}}
                  srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/VwedJBqdUIs?autoplay=1'><img src='https://img.youtube.com/vi/VwedJBqdUIs/maxresdefault.jpg' alt='How I Use AI to Automate Content Creation Full Guide 2025'><span>&#9654;</span></a>"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="How I Use AI to Automate Content Creation | Full Guide 2025"
                  aria-label="Full guide showing how to build an AI-powered content creation workflow for social media creators">
                </iframe>
                <noscript><a href="https://www.youtube.com/watch?v=VwedJBqdUIs" target="_blank" rel="noopener">Watch: How I Use AI to Automate Content Creation — Full Guide 2025 on YouTube</a></noscript>
              </figure>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  AI Visuals for Content Creators: Thumbnails, Graphics, and Brand Identity
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Editing and upscaling is the #1 AI use case among creators at 55%, and generating new visual
                  assets ranks second at 52%, according to{" "}
                  <a href="https://news.adobe.com/news/2025/10/adobe-max-2025-creators-survey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Adobe's October 2025 Creators Survey</a>.
                  Visual content is where AI delivers the largest return for individual creators — because
                  professional photography, graphic design, and brand identity work all previously required
                  either significant budget or significant skill. AI image generation with properly engineered
                  prompts removes both barriers.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Visual content is the highest-impact element of a creator's online presence — and it's
                  historically been the most resource-intensive to produce. Professional photography requires
                  equipment, lighting, and editing time. Graphic design requires software skills. Stock images
                  look generic and fail to communicate a unique brand identity. AI image generation — done
                  with properly engineered prompts — changes this equation entirely. A creator with no design
                  background can now produce professional-quality visuals for every content piece in minutes.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  YouTube thumbnail research consistently shows that high-contrast images with clear focal
                  points and readable text outperform artistic thumbnails at small display sizes. Midjourney
                  prompts for YouTube thumbnails should specify: high contrast composition, bold colors, clear
                  subject isolation, and dramatic lighting — not the softer aesthetic that performs on
                  Instagram. The Midjourney Prompt Generator accounts for platform-specific visual requirements
                  in its output, so the prompts it generates for YouTube thumbnails are structurally different
                  from those it generates for Instagram posts or LinkedIn headers.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  For brand identity exploration — finding a consistent visual language for your content —
                  AI image generation is an exceptionally powerful tool. You can generate dozens of visual
                  directions in an afternoon, test audience response, and establish a cohesive aesthetic before
                  committing to a color palette, photography style, or illustration approach. What used to
                  require a brand designer and weeks of feedback loops now takes hours with the right prompts.
                </p>
              </section>
            </article>

            {/* ─── Citation Capsule ─────────────────────────────── */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Source documentation:</strong>{" "}
                86% of creators globally use generative AI and 76% say it accelerated their business or follower
                growth —{" "}
                <a href="https://news.adobe.com/news/2025/10/adobe-max-2025-creators-survey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Adobe / The Harris Poll Creators Survey, October 2025</a>{" "}
                (n=16,000 creators, 8 countries). Prompt engineering best practices — role assignment, format
                specification, explicit constraints — are documented by{" "}
                <a href="https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI's Help Center</a>.
                The AI-powered content creation market is projected to grow from $2.15B (2024) to $10.59B by
                2033 at 19.4% CAGR —{" "}
                <a href="https://www.thebusinessresearchcompany.com/report/ai-powered-content-creation-global-market-report" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">The Business Research Company, 2024</a>.
              </p>
            </div>

            {/* ─── FAQ ──────────────────────────────────────────── */}
            <div className="mt-16 space-y-4">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQS.map(({ q, a }, i) => (
                  <AccordionItem key={i} q={q} a={a} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="lg:w-72 shrink-0 space-y-8">
            <div className="bg-muted/40 border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-foreground">Why creators use AI tools</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "86% of creators globally now use generative AI (Adobe, Oct 2025)",
                  "76% say AI accelerated their business or follower growth",
                  "38% cite high cost as the #1 barrier — free tools remove it",
                  "Top use: editing/upscaling (55%), new asset generation (52%), ideation (48%)",
                  "60% use multiple AI tools simultaneously",
                  "Works with ChatGPT, Claude, Gemini, and Midjourney",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground/70 pt-1">Source: <a href="https://news.adobe.com/news/2025/10/adobe-max-2025-creators-survey" target="_blank" rel="noopener noreferrer" className="hover:underline">Adobe / Harris Poll, Oct 2025</a></p>
            </div>

            <div className="bg-muted/40 border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-foreground">Explore More Tools</h3>
              <div className="space-y-3">
                {RELATED_CATEGORIES.map(({ name, slug, icon, desc }) => (
                  <Link key={slug} href={`/category/${slug}`}
                    className="block p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{icon}</span>
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
