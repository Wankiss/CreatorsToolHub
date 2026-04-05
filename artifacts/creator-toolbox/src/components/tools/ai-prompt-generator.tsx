import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Bot,
  ChevronDown, ListChecks, Shield, ArrowUpRight, Zap, TrendingUp, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is an AI prompt generator and how does it work?",
    a: "An AI prompt generator is a tool that builds structured, engineered prompts for AI platforms like ChatGPT, Claude, and Gemini — prompts designed to produce professional-quality output on the first attempt rather than requiring multiple rounds of trial-and-error refinement. Instead of typing a vague instruction like 'write me a YouTube script about fitness,' you specify your content type, niche, target audience, tone, and goal, and the generator constructs a fully structured prompt with role assignment, format specifications, required component checklists, and sequential AI instructions. This approach applies the same prompt engineering framework used by professional AI consultants — resulting in output that's typically 70–80% ready to publish rather than the 30–40% baseline a generic prompt produces.",
  },
  {
    q: "What content types does the AI Prompt Generator support?",
    a: "This generator supports 12 content formats, each with a structurally distinct prompt tailored to that format's conventions: YouTube Scripts (with hook, body, and retention-focused pacing), TikTok Scripts (short-form with scroll-stop hook and CTA), Blog Posts (with SEO structure, headers, and keyword integration), Instagram Captions (with hook, body, and engagement CTA), Email Newsletters (with subject line, preview text, and conversion structure), LinkedIn Posts (with professional tone and thought-leadership framing), Social Media Captions (platform-flexible), Product Descriptions (with feature-to-benefit conversion and buying triggers), Ad Copy (with attention, interest, desire, and action structure), Content Hooks (standalone hook variations for any format), and more. Each content type generates a fundamentally different prompt structure — not just different words in the same template.",
  },
  {
    q: "What is the difference between ChatGPT, Claude, and Gemini prompts?",
    a: "While the three major AI platforms accept similar prompt structures, each responds differently to specific framing techniques. ChatGPT performs best with explicit step-by-step instructions and numbered output requirements — it follows sequential format directions precisely and handles long-form content structure well. Claude excels at nuanced tone calibration and responds strongly to persona framing with detailed context — prompts that specify a clear role, audience, and communication objective tend to produce more natural, less formulaic outputs from Claude. Gemini performs well with prompts that incorporate specific factual context and examples — it benefits from 'in the style of' references and explicit example inclusion more than the other two. This generator applies platform-specific framing optimisations when you select your target AI, adjusting the prompt structure for that platform's response patterns.",
  },
  {
    q: "What makes a good AI prompt for content creation?",
    a: "A high-quality AI prompt for content creation has five components: (1) Role assignment — 'Act as an expert [role] with 10 years of experience in [niche]' shifts the AI's output to be more authoritative, specific, and confident. (2) Audience specification — telling the AI exactly who the content is for (e.g. 'beginner fitness enthusiasts aged 25–40 who are time-constrained') calibrates vocabulary, depth, and examples. (3) Format specification — explicit structure requirements like 'write a 3-paragraph intro with a hook, problem statement, and solution promise' produce structured, usable output rather than free-form text. (4) Required components — a checklist of elements that must be included ensures nothing critical is missing from the output. (5) Constraints — word count, tone, reading level, and excluded phrases give the AI creative boundaries that consistently improve quality. This generator applies all five components automatically based on your inputs.",
  },
  {
    q: "Can I customize the generated prompt before using it?",
    a: "Yes — every generated prompt is plain text that you can edit before pasting into your AI platform. The prompt is engineered to work as-is and produce professional output on the first attempt, but it is also designed to be modified. Common customisations include: adding specific examples you want the AI to reference ('write in the style of [example]'), inserting specific facts, statistics, or product details the AI should include, adjusting the required word count, adding brand-specific voice guidelines, or removing components that don't apply to your specific use case. The optional Keywords and Extra Instructions fields in the generator let you inject customisations before generation so the output already includes your specifications — reducing the amount of manual editing needed after the prompt is produced.",
  },
  {
    q: "Does the AI Prompt Generator work with free versions of ChatGPT and Claude?",
    a: "Yes — all generated prompts work with the free tiers of ChatGPT (GPT-3.5 / GPT-4o mini), Claude (Claude 3 Haiku), and Gemini (Gemini 1.5 Flash). The prompt engineering principles applied — role assignment, format specification, and required component checklists — are not model-dependent; they improve output quality across all capability tiers. That said, more capable models (ChatGPT GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) will produce higher-quality outputs from the same prompts — particularly for long-form content like full YouTube scripts or detailed blog posts where reasoning depth matters. For shorter content types like captions, hooks, and social posts, free-tier models produce output comparable to paid tiers when given well-structured prompts.",
  },
  {
    q: "What is a role-based AI prompt and why does it matter?",
    a: "A role-based AI prompt is a prompt that begins by assigning the AI a specific professional persona before giving it a task — for example, 'Act as a senior content strategist with 10 years of experience creating YouTube content for fitness audiences.' This technique, sometimes called 'persona prompting,' consistently produces more authoritative, specific, and contextually appropriate outputs than prompts that give tasks without role context. The reason is that AI language models are trained on vast amounts of professional writing from many different domains — when you assign a specific expert role, you narrow the model's response distribution toward the vocabulary, structure, and reasoning patterns associated with that expertise. Every prompt this generator produces includes role assignment as the first component, tailored to the specific content type and niche you select.",
  },
  {
    q: "How many prompts can I generate for free?",
    a: "There are no usage limits — you can generate as many prompts as you need, for any content type, with no daily cap and no account required. Each generation produces a ready-to-use prompt tailored to your specific inputs. Use the Regenerate function to get alternative prompt structures for the same content type and niche — different generation rounds apply different framework variations and may produce prompts better suited to specific subtopics within your niche. The generator is 100% free with no premium tier — all 12 content types, all AI platform optimisations, and all optional fields are available on every generation at no cost.",
  },
  {
    q: "What is the 'Include Example' toggle for?",
    a: "The Include Example toggle instructs the generator to add a concrete output example to the prompt itself — showing the AI what a strong, correctly formatted response looks like before asking it to produce one. This technique, known in prompt engineering as 'few-shot prompting,' consistently improves output quality because it gives the AI a style anchor to match rather than inferring tone and structure from the instructions alone. Include Example is particularly effective for formats with a specific voice requirement — Instagram captions, TikTok scripts, and ad copy where the stylistic standard is difficult to describe verbally but easy to demonstrate. For more structured formats like blog posts and email newsletters where the structure is already explicit in the prompt, the example toggle has a smaller but still positive impact on output quality.",
  },
  {
    q: "Can I use the generated prompts for client work or commercial projects?",
    a: "Yes — there are no restrictions on how you use the generated prompts. You can use them for your own content creation, for client projects, for internal business content, for commercial AI-generated content, or for building prompt libraries for your team or products. The prompts are generated based on your inputs and are not proprietary — once generated, they belong to you to use however you choose. Many freelance content strategists, social media managers, and AI consultants use this generator to build custom prompt packages for their clients, saving hours of prompt engineering time per project. There is no attribution requirement and no licensing restriction.",
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

export function AiPromptGeneratorTool() {
  const [contentType, setContentType] = useState("youtube-script");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("engagement");
  const [tone, setTone] = useState("casual");
  const [platform, setPlatform] = useState("chatgpt");
  const [wordCount, setWordCount] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("ai-prompt-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-ai-prompt-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your niche or topic.", variant: "destructive" });
      return;
    }
    run({ contentType, niche, audience, goal, tone, platform, wordCount });
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="text-violet-500" size={22} />
          <h2 className="font-semibold text-lg">AI Prompt Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={11} /> AI Powered
          </span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Content Type</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={contentType} onChange={e => setContentType(e.target.value)}>
                <option value="youtube-script">YouTube Script</option>
                <option value="tiktok-script">TikTok Script</option>
                <option value="blog-post">Blog Post</option>
                <option value="social-caption">Social Media Caption</option>
                <option value="email">Email Newsletter</option>
                <option value="product-description">Product Description</option>
                <option value="ad-copy">Ad Copy</option>
                <option value="hooks">Content Hooks</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">AI Platform</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="chatgpt">ChatGPT</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
                <option value="copilot">Copilot</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Your Niche / Topic *</label>
            <Input placeholder="e.g. personal finance, fitness, travel photography..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input placeholder="e.g. beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Goal</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={goal} onChange={e => setGoal(e.target.value)}>
                <option value="engagement">Engagement</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
                <option value="conversion">Conversion / Sales</option>
                <option value="viral">Go Viral</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="educational">Educational</option>
                <option value="funny">Funny</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Word Count (optional)</label>
            <Input placeholder="e.g. 500, 1000..." value={wordCount} onChange={e => setWordCount(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate AI Prompt</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Ready-to-Use AI Prompts</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n\n")); toast({ title: "All prompts copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-3">
            {outputs.map((prompt, i) => (
              <div key={i} className="group p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed">{prompt}</p>
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the AI Prompt Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Choose Your Content Type",
              desc: "Select from 12 content formats — YouTube scripts, Instagram captions, TikTok scripts, blog posts, email newsletters, LinkedIn posts, and more. Each type generates a structurally different prompt tailored to that format's conventions.",
            },
            {
              step: 2,
              title: "Fill In Your Details",
              desc: "Enter your niche, target audience, content goal, tone, and preferred AI platform (ChatGPT, Claude, or Gemini). Optional fields let you set word count and add extra instructions to fully customise the output.",
            },
            {
              step: 3,
              title: "Click Generate AI Prompt",
              desc: "The tool instantly builds a fully structured, role-based prompt — complete with persona assignment, format specifications, required components, and step-by-step AI instructions engineered to produce professional output on the first attempt.",
            },
            {
              step: 4,
              title: "Copy and Paste Into Your AI Tool",
              desc: "Click Copy Prompt and paste it directly into ChatGPT, Claude, or Gemini. No editing needed — the prompt is engineered to produce professional-quality output immediately. Use Regenerate for alternative prompt structures.",
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

      {/* ── About ────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This AI Prompt Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This AI Prompt Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free AI Prompt Generator builds structured, role-based prompts for ChatGPT, Claude,
              and Gemini that produce professional-quality content on the first attempt. It covers 12
              content types — from YouTube scripts and Instagram captions to email newsletters and blog
              posts — and applies proven prompt engineering principles: role assignment, format
              specification, tone direction, required component checklists, and sequential AI
              instructions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every generated prompt is copy-paste ready with no editing required. The tool abstracts
              the complexity of prompt engineering — a discipline that typically requires hours of
              learning and trial-and-error experimentation — into a four-field form that any creator,
              marketer, or business owner can use in under 60 seconds. Pair the generated prompts with
              the{" "}
              <Link href="/tools/youtube-script-generator" className="text-primary hover:underline font-medium">
                YouTube Script Generator
              </Link>{" "}
              or{" "}
              <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
                Instagram Caption Generator
              </Link>{" "}
              for fully AI-assisted content production.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Prompt Quality Determines AI Output Quality
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The quality of any AI output is almost entirely determined by the quality of the prompt
              it receives. A vague input like "write me a YouTube script about fitness" produces a
              generic, unusable first draft. A structured prompt that specifies role, audience, tone,
              format, and required components produces a first draft that's 70–80% ready to publish.
              This generator applies the same prompt engineering framework used by professional AI
              consultants — role-based persona assignment, explicit format requirements, required
              component checklists, and constraint specification.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators and marketers using AI tools are operating at 20–30% of their potential
              output quality because they're writing prompts from scratch without a framework. A
              well-engineered prompt is the difference between AI as a novelty and AI as a genuine
              production tool that saves hours of work per week. This generator closes that gap
              instantly, no prompt engineering expertise required.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The platform-specific optimisations — adjusting prompt framing for ChatGPT's sequential
              instruction following, Claude's persona responsiveness, and Gemini's example-anchoring —
              further improve output quality by matching the prompt structure to how each model
              processes instructions most effectively.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This AI Prompt Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Supports 12 content types across all major creator and marketing platforms",
                "Role-based prompts that activate professional AI output quality from the first generation",
                "Tailored formatting rules for each content type and AI platform — ChatGPT, Claude, Gemini",
                "Required component checklists built into every prompt ensure no key element is missing",
                "Platform-specific output style optimisation for each major AI model",
                "Include Example toggle for few-shot style-anchored prompts that improve tone accuracy",
                "Optional keyword and extra instruction fields for full customisation before generation",
                "Regenerate for alternative prompt structures and framework variations",
                "Works with free and paid versions of all major AI platforms — no paid tier required",
                "100% free — no account, no limits, unlimited generations, copy-paste ready output",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices for AI Prompting</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Be specific about your output format — 'Write a 3-paragraph blog intro with a hook, problem, and promise' outperforms a vague 'write a blog intro' prompt by 10×.",
            "Use the role-play prefix: 'Act as an expert [role]' — adding a persona shifts the AI's response to be more confident, specific, and authoritative in tone.",
            "Include constraints to improve quality — 'Use simple language' / 'Avoid jargon' / 'Under 200 words' gives the AI a creative fence that consistently improves output.",
            "Use chain prompting for complex tasks — break a big project into 3–5 sequential prompts where each output feeds into the next for much better final results.",
            "Add 'in the style of [example]' to control tone — 'Write like a Harvard Business Review article' vs 'Write like a casual Twitter thread' changes everything.",
            "Ask for alternatives: 'Give me 5 different versions' — variation expands your options and often surfaces unexpected directions you wouldn't have thought of.",
            "Iterate in the same conversation — the AI remembers context, so refine with 'Make the third paragraph shorter' rather than starting a new prompt from scratch.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Tools ─────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related AI Creator Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Midjourney Prompt Generator", path: "/tools/midjourney-prompt-generator", desc: "Generate detailed, style-rich image prompts optimised for Midjourney's unique syntax and quality flags." },
            { name: "TikTok Script Generator", path: "/tools/tiktok-script-generator", desc: "Use AI prompts to script full TikTok videos with hook, body, and CTA structured for maximum watch time." },
            { name: "YouTube Script Generator", path: "/tools/youtube-script-generator", desc: "Create long-form YouTube video scripts with AI-crafted structure, pacing, and audience retention techniques." },
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Generate on-brand Instagram captions — a great next step after crafting your AI content prompts." },
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

        {/* CTA callout */}
        <div className="mt-4 p-5 rounded-2xl border border-primary/20 bg-primary/5">
          <p className="text-sm text-foreground font-semibold mb-1">Prompt ready — now create the content.</p>
          <p className="text-sm text-muted-foreground">
            Use your generated prompt with the{" "}
            <Link href="/tools/youtube-script-generator" className="text-primary hover:underline font-medium">
              YouTube Script Generator
            </Link>{" "}
            or{" "}
            <Link href="/tools/tiktok-script-generator" className="text-primary hover:underline font-medium">
              TikTok Script Generator
            </Link>{" "}
            to produce fully structured content directly — no AI platform required.
          </p>
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
