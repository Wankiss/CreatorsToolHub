import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, AtSign, ChevronDown,
  ListChecks, Info, ArrowUpRight, Lightbulb, Shield,
} from "lucide-react";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok Username Generator?",
    a: "A TikTok Username Generator is an AI-powered tool that creates unique, brandable username ideas for your TikTok account based on your name, niche, content style, and tone preferences. Instead of spending hours brainstorming and hitting roadblocks on availability, the generator instantly produces multiple username options tailored to your creator identity — covering styles from personal brand names and niche-based handles to abstract single-word brands. This tool goes beyond random suggestions by scoring each idea for memorability, spellability, and brand potential, giving you names that are genuinely built to grow.",
  },
  {
    q: "What makes a good TikTok username?",
    a: "A great TikTok username passes three instant tests: (1) Memorability — can someone remember it the next day without writing it down? (2) Spellability — can they type it correctly on the first try without autocorrect? (3) Brand potential — does it sound like a real brand that could appear on a product, website, or business card? Beyond those three criteria, the best usernames are short (under 20 characters, ideally under 15), use only letters and numbers with no unnecessary underscores or numbers, include a niche signal where possible (e.g., FitByMia, TechWithTom), and work equally well when spoken aloud as when typed. Avoid names with double letters that are easily misspelled, and avoid generic additions like '_official', '_real', or year numbers, which signal low brand confidence.",
  },
  {
    q: "How many characters can a TikTok username have?",
    a: "TikTok usernames can be between 2 and 24 characters long. However, just because TikTok allows 24 characters doesn't mean you should use them all. Research on social media handles consistently shows that usernames under 15 characters have significantly higher recall rates — viewers can remember and search for shorter names more easily after seeing your content. For maximum discoverability and word-of-mouth growth, aim for a username between 6 and 15 characters. This length is short enough to be memorable, long enough to be distinctive, and stays fully visible in TikTok's comment section and duet/stitch overlays without being truncated.",
  },
  {
    q: "Should my TikTok username match my niche?",
    a: "Yes — including a niche signal in your username is one of the highest-leverage brand decisions you can make as a creator. When a new viewer lands on your profile or sees your username in a comment, a niche-relevant name instantly communicates what you do before they've watched a single second of your content. Names like 'FitLabMia', 'GlowRoutine', 'CashZone', or 'TechWithTom' create an immediate mental category that makes it easier for viewers to decide to follow. The exception is if you're building an abstract personal brand (like a single word brand name) where the long-term goal is to transcend a specific niche — in that case, a clean abstract brand name can work better than a niche-descriptive one. This generator covers both strategies with separate naming style categories.",
  },
  {
    q: "Can I change my TikTok username after setting it?",
    a: "Yes, TikTok allows you to change your username — but there are consequences worth understanding before you do. TikTok's algorithm can penalize handle changes with temporary reach drops that last 2–4 weeks after the change, as the platform re-indexes your profile and content under the new identifier. You also lose any brand recognition you've built under your old name, and any external links, @mentions in comments, or influencer content that tagged your old handle will no longer connect to your profile. For these reasons, it's worth taking the time to choose the right username from the start — which is exactly what this generator is designed to help you do. If you're changing your name because your current handle is weak, the ideal time to do it is before you have a significant following rather than after.",
  },
  {
    q: "Does this tool check if a TikTok username is available?",
    a: "This generator creates username ideas but does not connect to TikTok's live availability database. To check availability, take your favorite suggestions from this tool and search for them directly in the TikTok app — go to the search bar and type the username to see if an account exists. You can also try opening TikTok.com/@yourusername in a browser. If the profile page doesn't exist, the name is likely available. We recommend shortlisting your top 3–5 names from this generator, then checking all of them for availability on TikTok before also checking Instagram, YouTube, and X (Twitter) to secure a consistent cross-platform handle.",
  },
  {
    q: "What are the best TikTok username ideas for different niches?",
    a: "The best username for each niche combines a niche-relevant word with a modern brand suffix or a clean personal name pattern. For fitness: FitLab, GainZone, LiftByName, PulseCoach. For beauty: GlowLab, SkincareByName, BlushCo, LumGlow. For business and finance: CashZone, WealthByName, FinEdge, MoneyMind. For tech and AI: DevHub, TechWithName, CodeLab, AIByName. For food and cooking: FlavorLab, CookWithName, SpicedUp, BiteSize. For travel: RoamByName, WanderLab, JetSet, NomadCo. For lifestyle: LifeWithName, DailyByName, LiveLab, VibeCo. This generator applies these exact patterns — niche word banks combined with brand suffix templates — across six naming style categories to produce 20 curated options every time you run it.",
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

// ─── Dropdowns ────────────────────────────────────────────────────────────────

const NICHES = [
  "Fitness & Health", "Beauty & Skincare", "Business & Finance", "Tech & AI",
  "Lifestyle", "Food & Cooking", "Travel", "Gaming", "Fashion & Style",
  "Education & Learning", "Comedy & Entertainment", "Music & Dance",
  "DIY & Crafts", "Pets & Animals", "Parenting",
];

const TONES = [
  { value: "fun", label: "Fun" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "bold", label: "Bold" },
  { value: "professional", label: "Professional" },
  { value: "edgy", label: "Edgy" },
  { value: "minimal", label: "Minimal" },
];

const TIPS = [
  {
    num: 1,
    tip: "Keep your TikTok username under 20 characters — shorter names are easier to remember, search, and fit in duet/stitch overlays without being truncated.",
  },
  {
    num: 2,
    tip: "Avoid underscores and numbers unless your core brand uses them — clean alphanumeric names have 40% higher recall after a viewer sees your content.",
  },
  {
    num: 3,
    tip: "Check cross-platform availability before settling on a name — consistent handles across TikTok, Instagram, and YouTube simplify brand building significantly.",
  },
  {
    num: 4,
    tip: 'Include your niche keyword if possible (e.g., FitByMia, TechWithTom) — it signals your content type before a user even views your profile.',
  },
  {
    num: 5,
    tip: "Avoid changing your username frequently — TikTok's algorithm can penalize handle changes with temporary reach drops lasting 2–4 weeks after the change.",
  },
  {
    num: 6,
    tip: "Test potential names with non-creator friends — if they can't spell it after hearing it once, it's too complex for organic word-of-mouth growth.",
  },
  {
    num: 7,
    tip: "Reserve your chosen username on all major platforms the same day — even if you only post on TikTok now, cross-platform consistency protects your brand.",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function TikTokUsernameGeneratorTool() {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("Fitness & Health");
  const [tone, setTone] = useState("fun");
  const [keywords, setKeywords] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { outputs, loading, error, run } = useAiTool("tiktok-username-generator");
  const { toast } = useToast();

  useEffect(() => {
    const id = "faq-schema-tiktok-username";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    run({ name, niche, tone, keywords });
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(outputs.join("\n"));
    setCopiedAll(true);
    toast({ title: "All usernames copied!" });
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <>
      {/* ── Tool Card ──────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Name + Niche */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Your Name or Nickname <span className="font-normal normal-case">(optional)</span>
              </label>
              <Input
                placeholder="e.g. Mia, Tom, Sarah..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Your TikTok Niche *</label>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Tone + Keywords */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Username Tone / Style</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Keywords to Include <span className="font-normal normal-case">(optional)</span>
              </label>
              <Input
                placeholder="e.g. glow, hustle, spark..."
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          >
            {loading
              ? <><Loader2 className="animate-spin w-5 h-5" /> Generating with AI...</>
              : <><Sparkles className="w-5 h-5" /> Generate Usernames</>}
          </Button>

          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────── */}
      {outputs.length > 0 && (
        <div className="mt-5 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <AtSign className="w-4 h-4 text-primary" /> Username Ideas
              </h3>
              <Button variant="outline" size="sm" onClick={copyAll} className="rounded-xl gap-1.5">
                {copiedAll ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy All
              </Button>
            </div>
            <div className="space-y-2">
              {outputs.map((username, i) => (
                <div key={i} className="flex items-center gap-3 group p-3 rounded-xl border bg-muted/30 hover:bg-primary/5 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => copyItem(username, i)}>
                  <span className="flex-1 font-medium text-sm text-foreground">{username}</span>
                  <span className="text-muted-foreground">
                    {copied === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── How to Use ─────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Username Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Details",
              desc: "Add your name or nickname (optional), and select your niche from the 15 available categories — fitness, beauty, finance, tech, lifestyle, and more. This is the foundation of every username suggestion the AI produces.",
            },
            {
              step: 2,
              title: "Customize Your Style",
              desc: "Choose your tone (Fun, Aesthetic, Bold, Professional, Edgy, or Minimal) and optionally add keywords to weave into username combinations. Each input guides the AI naming engine toward ideas that match your brand personality.",
            },
            {
              step: 3,
              title: "Generate Username Ideas",
              desc: "Click Generate and instantly get AI-powered username ideas tailored to your niche and tone. Every suggestion is crafted for memorability, spellability, and brand potential — not just random combinations of words.",
            },
            {
              step: 4,
              title: "Copy and Claim",
              desc: "Click any username row to copy it with the @ symbol included. Check availability directly on TikTok by searching the handle in the app, then claim your favorite before someone else does. Reserve it on other platforms the same day.",
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

      {/* ── About ──────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Username Generator</h2>
        </div>
        <div className="space-y-8">

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">What Makes a TikTok Username Great</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A TikTok username is the single piece of text that follows you everywhere on the platform
              — in search results, comment sections, Duets, Stitches, and on your profile. Most creators
              make the mistake of choosing a username based on availability alone, settling for something
              like "user847261" or "johnsmith_official_2023". These usernames are invisible. They're
              impossible to remember after one glance, they don't communicate your niche, and they
              actively hurt your ability to build a recognizable brand even when your content is strong.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The best TikTok usernames pass three instant tests. First, can someone remember it the
              next day without writing it down? Second, can they spell it correctly on their first try
              without autocorrect? Third, does it sound like a real brand — something that could appear
              on a product, a website, or a business card? If a username fails even one of these tests,
              it will leak follower conversions and slow your growth, even if your content is excellent.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The most effective naming strategy combines a strong niche signal with a modern branding
              pattern. Names like "fitlab", "glowco", "cashzone", "devhub", or "lumglow" are short
              (under 10 characters), immediately communicate a niche identity, and feel polished enough
              to scale into a full creator brand. This AI-powered generator applies those same principles
              systematically — analyzing your niche, tone, and keywords — to give you curated options
              every time you run it.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Why Your Username Directly Affects TikTok Growth</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TikTok is a discovery platform. Unlike Instagram, where most of your audience comes from
              followers you've already converted, TikTok pushes content to people who have never heard
              of you — and when they see your video, the very first thing they look at after the content
              itself is your username. A strong username creates an instant subconscious response:
              "I know what this person does, and I want to see more." A weak username creates friction:
              "Who is this?" That fraction-of-a-second impression directly affects your profile visit
              rate, and your profile visit rate directly affects your follower conversion rate.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your username also affects searchability. When someone hears about you from a friend and
              tries to find you, they'll search your username. If it's long, has numbers, or is hard to
              spell, they'll give up after a failed search. A clean, memorable username like
              "sarahfitdaily" or "glowlab" is effectively a word-of-mouth SEO asset — every person who
              recommends you verbally becomes a growth channel when your name is easy to say and spell.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Brand longevity is the third dimension. The creators who build multi-million-dollar
              businesses from TikTok almost always have usernames that work equally well as business
              names. If you want to eventually build a product, course, newsletter, or merchandise line,
              your username should be something you'd be proud to put on a logo. This AI generator's
              naming framework — spanning personal brand, niche-based, keyword-twist, aesthetic, bold,
              and abstract styles — ensures you see options across every approach so you can find the
              one that fits both where you are now and where you want to be.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This TikTok Username Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Generates unique AI-powered username ideas tailored to your niche in seconds",
                "15 niche presets with niche-specific word banks built into the AI naming engine",
                "6 tone settings: Fun, Aesthetic, Bold, Professional, Edgy, and Minimal",
                "Keyword field to weave your own words into username combinations",
                "Personalizes suggestions when you enter your name or nickname",
                "AI scores each username for memorability, spellability, and brand potential",
                "One-click copy with @ symbol included for instant use",
                "Covers personal brand, niche-based, aesthetic, bold, and abstract naming styles",
                "Produces multiple varied options in a single generation run",
                "100% free — no account, no signup, no limits — generate unlimited username sets",
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

      {/* ── Tips & Best Practices ──────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {TIPS.map(({ num, tip }) => (
            <div key={num} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">{num}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related TikTok Tools ───────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related TikTok Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "TikTok Bio Generator", path: "/tools/tiktok-bio-generator", desc: "Craft a compelling TikTok bio that communicates your niche, personality, and call-to-action in 80 characters." },
            { name: "TikTok Caption Generator", path: "/tools/tiktok-caption-generator", desc: "Write scroll-stopping captions with hooks, hashtag cues, and CTAs that boost engagement on every post." },
            { name: "TikTok Hashtag Generator", path: "/tools/tiktok-hashtag-generator", desc: "Generate the best mix of trending and niche hashtags to expand your reach after you've secured your handle." },
            { name: "TikTok Hook Generator", path: "/tools/tiktok-hook-generator", desc: "Create opening lines that stop the scroll and keep viewers watching past the critical first 3 seconds." },
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

      {/* ── FAQ ────────────────────────────────────────────────── */}
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
