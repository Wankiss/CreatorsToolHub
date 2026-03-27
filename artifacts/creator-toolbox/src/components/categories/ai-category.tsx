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
    a: `Prompt engineering is one of the most practical and immediately applicable skills for creators and professionals in ${YEAR}. The difference between a beginner and an expert at using AI tools is almost entirely a function of how well they can communicate with the model — and prompt engineering is that communication skill. Studies and practitioner reports consistently show that well-engineered prompts produce outputs that require 70–80% less editing than basic prompts for the same task. For content creators, this translates directly into production speed: a creator with strong prompting skills can produce a week's worth of content drafts in the time an unpracticed creator spends editing a single AI output. The AI Prompt Generator on creatorsToolHub teaches prompting patterns through the outputs it generates — each prompt is an example of professional prompt structure.`,
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
                  AI has fundamentally changed the content creation workflow — but only for creators who know
                  how to use it well. The difference between an AI that saves you hours and an AI that produces
                  generic, unusable output is almost entirely in the quality of the instructions you give it.
                  This free AI Creator Toolkit gives you {activeTools.length} purpose-built prompt generators
                  that turn your content goals into structured, AI-ready instructions — covering everything from
                  ChatGPT-powered writing to Midjourney visual content creation. No subscriptions, no
                  sign-ups, instant results.
                </p>
              </header>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  AI Prompt Generator: Stop Writing Bad Prompts and Start Getting Usable Output
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The single biggest problem most creators face with AI tools is not the AI itself — it's the
                  prompts. Vague inputs produce vague outputs. A creator who types "write me a YouTube script
                  about productivity" into ChatGPT will receive something generic that takes as long to edit
                  as writing from scratch. A creator who specifies role, context, audience, format, tone, and
                  constraints gets a first draft that's 80% ready to use. The{" "}
                  <Link href="/tools/ai-prompt-generator" className="text-primary hover:underline font-medium">
                    AI Prompt Generator
                  </Link>{" "}
                  engineers that structure for you automatically.
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

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Midjourney Prompt Generator: Create Professional Visuals Without Design Skills
                </h2>
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

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  Prompt Engineering for Creators: Why the Input Determines Everything
                </h2>
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
                  The creators seeing the biggest productivity gains from AI in {YEAR} aren't using it to
                  replace their creative process — they're using it to eliminate the slow, repetitive, or
                  blank-page stages of content production while keeping their authentic voice in the final
                  output. Here is a practical weekly AI content workflow that integrates prompt generation
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
                  gate. Creators who follow this model consistently report saving 8–12 hours per week on
                  content production tasks that used to require either more time or outsourcing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  AI Visuals for Content Creators: Thumbnails, Graphics, and Brand Identity
                </h2>
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
              <h3 className="font-bold text-foreground">Why use AI tools?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Save 8–12 hours per week on content production",
                  "Eliminate blank-page paralysis instantly",
                  "Generate professional-quality prompts without trial and error",
                  "Create stunning visuals with no design skills",
                  "Scale content output without sacrificing quality",
                  "Works with ChatGPT, Claude, Gemini, and Midjourney",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
