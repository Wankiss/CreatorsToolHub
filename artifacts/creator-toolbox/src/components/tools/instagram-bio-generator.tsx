import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, User, ChevronDown,
  Lightbulb, ListChecks, ArrowUpRight, Zap, TrendingUp, RefreshCw,
} from "lucide-react";
import { Link } from "wouter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NICHES = [
  "Fitness", "Beauty", "Business", "Finance", "Tech & AI",
  "Education", "Food", "Travel", "Lifestyle", "Fashion",
  "Relationships", "Health", "Entertainment", "Coaching", "Other",
];

const CTA_GOALS = [
  { value: "follow",   label: "Follow",    desc: "Grow your audience" },
  { value: "dm",       label: "DM",        desc: "Coaching / services" },
  { value: "link",     label: "Link",      desc: "Products / lead magnets" },
  { value: "freegift", label: "Free Gift", desc: "List building" },
  { value: "collab",   label: "Collabs",   desc: "Brand partnerships" },
];

// Tone assignment by index (matches engine prompt order)
const TONE_BY_INDEX: Record<number, "professional" | "bold" | "minimal" | "inspirational"> = {
  0: "professional", 1: "professional", 2: "professional",
  3: "bold",         4: "bold",
  5: "minimal",      6: "minimal",
  7: "inspirational",8: "inspirational",9: "inspirational",
};

const TONE_LABELS: Record<string, string> = {
  professional: "Professional",
  bold: "Bold",
  minimal: "Minimal",
  inspirational: "Inspirational",
};

const TONE_COLORS: Record<string, string> = {
  professional: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
  bold:         "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400",
  minimal:      "bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-400",
  inspirational:"bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400",
};

type ToneFilter = "all" | "professional" | "bold" | "minimal" | "inspirational";

// ─── Scoring ──────────────────────────────────────────────────────────────────

function powerScore(bio: string): number {
  let score = 0;
  if (/\p{Emoji}/u.test(bio)) score += 20;
  if (/follow|dm|link|free|↓|→|grab|get|start|join/i.test(bio)) score += 25;
  if (/\d/.test(bio)) score += 20; // has a number (stat, count, %)
  if (/coach|certif|expert|helped|clients|students|forbes|featured|award/i.test(bio)) score += 20;
  if (bio.length >= 80) score += 15; // enough content
  return Math.min(score, 100);
}

function clarityScore(bio: string): number {
  const len = bio.length;
  let score = 0;
  if (len >= 60 && len <= 140) score += 40;
  else if (len > 140 && len <= 150) score += 25;
  else if (len < 60) score += 20;
  if (/\|/.test(bio)) score += 20; // structured with pipe
  if (!/I am |I'm a |Hello |Hi,/i.test(bio)) score += 20; // no weak opener
  if (/help|achieve|result|transform|grow|lose|gain|build|earn|create/i.test(bio)) score += 20;
  return Math.min(score, 100);
}

function charBarColor(len: number): string {
  if (len <= 110) return "bg-green-500";
  if (len <= 135) return "bg-yellow-500";
  return "bg-orange-500";
}

function charTextColor(len: number): string {
  if (len <= 110) return "text-green-600 dark:text-green-400";
  if (len <= 135) return "text-yellow-600 dark:text-yellow-400";
  return "text-orange-600 dark:text-orange-400";
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-bold text-foreground shrink-0">{value}</span>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a good Instagram bio?",
    a: "A high-converting Instagram bio answers three questions in under 3 seconds: What is this account about? What do I gain from following? What should I do next? The most effective bios combine four elements: (1) A clear niche signal — who you are and what category of content you create. (2) A specific value proposition — not what you do, but what result the follower receives ('lose 20 lbs without giving up carbs' rather than 'fitness tips'). (3) A credibility marker — a result, credential, or social proof that earns trust instantly. (4) A single clear CTA — one specific next action, whether that's a follow, a DM, or a link click. Bios that include all four elements consistently outperform single-element bios by 3–5× on profile-to-follow conversion rates.",
  },
  {
    q: "How long should an Instagram bio be?",
    a: "Instagram's hard character limit is 150 characters. The optimal bio length for conversions is 100–140 characters — long enough to communicate niche, value, and CTA, but short enough to avoid truncation on mobile profiles, where Instagram folds the bio after the second line. Bios under 80 characters tend to leave value on the table, signaling a creator who hasn't thought carefully about their positioning. Bios over 130 characters risk getting cut off before the CTA on some devices and screen sizes. Our generator enforces the 150-character limit on every bio produced and shows you a live character meter so you can compare bios at a glance.",
  },
  {
    q: "What should I include in my Instagram bio?",
    a: "The most effective Instagram bio structure follows the formula: [Who you help] + [Result you deliver] + [Credibility signal] + [CTA]. Specifically: (1) Niche/audience signal — who your content is for, so visitors can self-identify. (2) Specific result — what transformation or benefit a follower receives, stated as an outcome. (3) Credibility — a quantified achievement ('helped 500+ clients'), a credential ('certified nutritionist'), or a social proof signal ('featured in Forbes'). (4) CTA — one clear next step: follow prompt with a specific benefit, DM instruction, or a link-in-bio reference. Optional additions include emojis (1–3, niche-relevant), a posting frequency claim ('new Reels every Tuesday'), and a location if you serve a local audience.",
  },
  {
    q: "Should I put emojis in my Instagram bio?",
    a: "Yes — strategically. Emojis serve as visual bullets that break up text, add personality, and increase scannability. Research on Instagram profiles shows that bios with 1–3 well-chosen emojis see longer average read times and higher follow conversion rates compared to plain-text equivalents. The most effective approach is using emojis that reinforce your niche or replace words to save characters (🏋️ for fitness, 💰 for finance, ✍️ for writing). The ↓ arrow emoji pointing to your link-in-bio is particularly powerful — it draws the eye and signals more value waiting below. Avoid emoji overload: more than 3 emojis typically makes a bio feel cluttered and reduces the authority signal, particularly in professional or business-focused niches.",
  },
  {
    q: "What is the best Instagram bio CTA?",
    a: "The best Instagram bio CTA is specific and benefit-connected rather than generic. 'Follow for daily fat-loss tips' consistently outperforms 'Follow me!' because it answers the implicit question 'What's in it for me?' Similarly, 'Free macro guide ↓' outperforms 'Link in bio' because it names the specific thing waiting below. Research shows that CTAs with a stated benefit convert profile visitors to the desired action at 2–4× the rate of generic CTAs. The five highest-performing CTA types for Instagram bios are: benefit-driven follow prompts, DM-with-a-keyword triggers, specific link-in-bio references, free resource grabs with the ↓ emoji, and collab/partnership invitation for B2B creators.",
  },
  {
    q: "How often should I update my Instagram bio?",
    a: "Update your Instagram bio whenever your content focus shifts significantly, when you launch a new product, series, or campaign, or when you're A/B testing bio performance. Beyond event-driven updates, refreshing your bio every 6–8 weeks is good practice — a fresh bio signals an active creator to returning profile visitors and often improves conversion from people who've visited before but didn't follow. When testing bios, run each version for at least 14 days and track your profile-visit-to-follow ratio in Instagram Insights (Professional Dashboard → Accounts Reached → Profile Activity). If your visit-to-follow ratio is below 5%, it's a clear signal to regenerate and test a more compelling option.",
  },
  {
    q: "What is the 150-character Instagram bio limit?",
    a: "Instagram's bio section is capped at 150 characters — this includes all text, spaces, emojis (each emoji counts as 1–2 characters depending on complexity), line breaks (each counts as 1 character), and punctuation. Instagram enforces this limit hard: text beyond 150 characters is truncated and not displayed. Our generator validates every bio to the 150-character limit before surfacing it — you'll never see a result that can't be pasted directly into Instagram's profile editor. The live character meter on each bio card shows you how close each option is to the ceiling, colour-coded green (comfortable), yellow (tight but within limit), and orange (near the limit — review carefully).",
  },
  {
    q: "How do I write an Instagram bio for a business?",
    a: "Business Instagram bios require a customer-first framing rather than company-first. Lead with what the business does for the customer ('Handmade leather goods for minimalists') rather than who you are as a company ('We make leather goods'). Include a trust signal — years in business, number of customers served, press mentions, or certifications — if it fits within the character limit. Always end with a clear CTA tied to your primary business goal: 'Shop now ↓' for e-commerce, 'Book a call ↓' for services, 'Get the free guide ↓' for lead generation. Avoid jargon, mission statements, and abstract language — write for a cold prospect who has never heard of you. Use the Professional tone option in our generator for business accounts.",
  },
  {
    q: "How do I write an Instagram bio that gets followers?",
    a: "The bios that consistently convert profile visitors to followers share four characteristics: (1) They communicate a specific, tangible benefit — not 'fitness inspiration' but 'lose your first 10 lbs in 30 days.' (2) They establish immediate relevance — the reader knows within 2 seconds whether this account is for them. (3) They include a social proof or credibility signal that earns trust without explanation. (4) They end with a friction-free follow CTA that gives one more reason to commit — 'Follow for a new workout every Monday.' The generator's Professional and Inspirational tones are optimised for follow conversion; Bold and Minimal tones work better for engagement and DM conversion.",
  },
  {
    q: "Is this Instagram bio generator free?",
    a: "Yes — the Instagram Bio Generator is completely free with no account required, no signup, and no usage limits. Every generation produces 10 bio variations across four distinct tones: 3 Professional, 2 Bold, 2 Minimal, and 3 Inspirational — all validated to Instagram's 150-character limit. Each bio includes a live character meter, Power Score, and Clarity Score to help you quickly identify the strongest options. Use the tone filter tabs to compare within a style, hit Regenerate for fresh variations, and copy any bio in one click. The tool works for personal brands, creators, coaches, businesses, and any niche.",
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

export function InstagramBioGeneratorTool() {
  const [niche,       setNiche]       = useState("Fitness");
  const [valueprop,   setValueprop]   = useState("");
  const [audience,    setAudience]    = useState("");
  const [ctaGoal,     setCtaGoal]     = useState("follow");
  const [credibility, setCredibility] = useState("");
  const [keywords,    setKeywords]    = useState("");
  const [name,        setName]        = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [toneFilter,  setToneFilter]  = useState<ToneFilter>("all");
  const [copied,      setCopied]      = useState<number | null>(null);

  const { outputs, loading, error, run } = useAiTool("instagram-bio-generator");
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = "faq-schema-ig-bio-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!valueprop.trim()) {
      toast({ title: "Value proposition required", description: "Enter what you help people achieve.", variant: "destructive" });
      return;
    }
    run({ niche, valueprop, audience, ctaGoal, credibility, keywords, name });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
  };

  const copyBio = (bio: string, i: number) => {
    navigator.clipboard.writeText(bio);
    setCopied(i);
    toast({ title: "Bio copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  // Filter by tone
  const filteredOutputs = outputs
    .map((bio, i) => ({ bio, i, tone: TONE_BY_INDEX[i] ?? "professional" }))
    .filter(({ tone }) => toneFilter === "all" || tone === toneFilter);

  const toneCounts = outputs.reduce((acc, _, i) => {
    const t = TONE_BY_INDEX[i] ?? "professional";
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const FILTER_TABS: { key: ToneFilter; label: string }[] = [
    { key: "all",           label: `All (${outputs.length})` },
    { key: "professional",  label: `Professional (${toneCounts.professional ?? 0})` },
    { key: "bold",          label: `Bold (${toneCounts.bold ?? 0})` },
    { key: "minimal",       label: `Minimal (${toneCounts.minimal ?? 0})` },
    { key: "inspirational", label: `Inspirational (${toneCounts.inspirational ?? 0})` },
  ];

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="text-purple-500" size={22} />
              <h2 className="font-bold text-lg text-foreground">Instagram Bio Generator</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
              <Sparkles size={12} /> AI-Powered
            </span>
          </div>

          {/* Niche */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Content Niche</label>
            <select value={niche} onChange={e => setNiche(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
              {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Value prop */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">What You Help People Achieve *</label>
            <Input placeholder="e.g. lose 20 lbs without giving up carbs" value={valueprop}
              onChange={e => setValueprop(e.target.value)} className="rounded-xl h-11 text-sm" />
            <p className="text-xs text-muted-foreground mt-1.5">Be specific — 'lose 20 lbs without giving up carbs' beats 'get fit'.</p>
          </div>

          {/* Audience */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Target Audience</label>
            <Input placeholder="e.g. busy moms over 35, early-stage entrepreneurs..."
              value={audience} onChange={e => setAudience(e.target.value)} className="rounded-xl h-11 text-sm" />
          </div>

          {/* CTA goal */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">CTA Goal</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CTA_GOALS.map(g => (
                <button key={g.value} type="button" onClick={() => setCtaGoal(g.value)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${ctaGoal === g.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                  <div className="font-bold text-sm">{g.label}</div>
                  <div className="font-normal opacity-70 mt-0.5 leading-tight">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional toggle */}
          <button type="button" onClick={() => setShowOptional(v => !v)}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? "rotate-180" : ""}`} />
            {showOptional ? "Hide" : "Show"} optional fields (credibility, keywords, name)
          </button>

          {showOptional && (
            <div className="grid sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Credibility Markers</label>
                <Input placeholder="e.g. helped 500+ clients, Forbes featured..."
                  value={credibility} onChange={e => setCredibility(e.target.value)} className="rounded-xl h-11 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Keywords</label>
                <Input placeholder="e.g. fat loss, keto, macro tracking..."
                  value={keywords} onChange={e => setKeywords(e.target.value)} className="rounded-xl h-11 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Your Name <span className="font-normal opacity-60">(optional)</span></label>
                <Input placeholder="e.g. Emma, Coach Sarah..."
                  value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-11 text-sm" />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>}

          <Button onClick={handleGenerate} disabled={loading} size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            {loading
              ? <><Loader2 className="animate-spin" size={18} /> Generating bios with AI…</>
              : <><Sparkles size={18} /> Generate 10 Instagram Bios</>}
          </Button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      {outputs.length > 0 && (
        <div ref={resultsRef} className="mt-6 rounded-3xl border border-border bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 pt-5 pb-0 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Your Bio Options</h3>
              <button onClick={handleGenerate} disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Regenerate
              </button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {FILTER_TABS.map(tab => (
                <button key={tab.key} onClick={() => setToneFilter(tab.key)}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${toneFilter === tab.key ? "bg-background border border-b-background border-border text-foreground -mb-px relative z-10" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-3">
            {filteredOutputs.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-6">No bios for this filter. Try regenerating.</p>
              : filteredOutputs.map(({ bio, i, tone }) => {
                  const len = bio.length;
                  const pwr = powerScore(bio);
                  const clr = clarityScore(bio);
                  return (
                    <div key={i} onClick={() => copyBio(bio, i)}
                      className="group relative p-4 rounded-2xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all duration-200">
                      {/* Tone badge */}
                      <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${TONE_COLORS[tone]}`}>
                        {TONE_LABELS[tone]}
                      </span>
                      {/* Copy button */}
                      <div className="absolute top-3.5 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {copied === i ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted-foreground" />}
                      </div>
                      {/* Bio text */}
                      <p className="text-sm leading-relaxed font-medium text-foreground whitespace-pre-wrap pr-8">{bio}</p>
                      {/* Metrics */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Characters</span>
                          <span className={`text-[11px] font-bold ${charTextColor(len)}`}>{len}/150</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                          <div className={`h-full rounded-full transition-all ${charBarColor(len)}`} style={{ width: `${Math.min((len / 150) * 100, 100)}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <ScoreBar label="Power" value={pwr} color={pwr >= 70 ? "bg-green-500" : pwr >= 40 ? "bg-yellow-500" : "bg-orange-500"} />
                          <ScoreBar label="Clarity" value={clr} color={clr >= 70 ? "bg-green-500" : clr >= 40 ? "bg-yellow-500" : "bg-orange-500"} />
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      )}

      {/* ── How to Use ────────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Bio Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, title: "Select Your Niche and Describe What You Help People Achieve", desc: "Choose your content niche, then enter your core value proposition. Be specific: 'lose 20 lbs without giving up carbs' generates far stronger bios than 'get fit'. The more precise your input, the more targeted your output." },
            { step: 2, title: "Enter Your Target Audience and Choose Your CTA Goal", desc: "Describe your target audience clearly — 'busy moms over 35' or 'early-stage entrepreneurs' converts better than 'everyone'. Then select your CTA goal: Follow (growing your audience), DM (coaching/services), Link (products), Free Gift (list building), or Collabs (partnerships)." },
            { step: 3, title: "Add Optional Credibility Markers and Keywords", desc: "Credibility markers ('helped 500+ clients', '10K students', 'Forbes featured') are injected into the Professional-tone bios. Keywords ensure your specific positioning language appears in the generated bios. Your name is optional for personalisation in certain bio formats." },
            { step: 4, title: "Filter by Tone and Copy Your Best Bio", desc: "Get 10 bios across 4 tones: 3 Professional, 2 Bold, 2 Minimal, 3 Inspirational. Use the tone filter tabs to compare across styles. Every bio shows a live character meter, Power Score, and Clarity Score. Copy to clipboard in one click — paste directly into Instagram's profile edit." },
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

      {/* ── About ─────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Bio Generator — Turn Profile Visitors Into Followers</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Your Instagram Bio Is Your Most Important Conversion Page
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your Instagram bio is the only section of your profile that every visitor reads before making
              the decision to follow or leave. The profile photo catches the eye. The username indicates the
              niche. But the bio — 150 characters of carefully chosen text — is where the conversion happens
              or doesn't. When someone taps your profile from a Reel, a hashtag search, an Explore
              recommendation, or a tagged mention, they spend an average of 3–7 seconds reading your bio
              before deciding whether to follow. That window is your entire opportunity.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The fundamental purpose of an Instagram bio is to answer three questions in a single glance:
              What is this account about? What do I gain from following? What should I do next? Most creators
              answer only the first question well — they communicate their niche clearly but fail to
              articulate specific value ('follow for fitness tips' is niche clarity without value) and skip
              the CTA entirely, leaving the visitor with no directed action. The result is a profile that
              gets views but doesn't convert.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This generator applies the proven bio formula — [Who you help] + [What result you deliver] +
              [Credibility signal] + [CTA] — across 10 variations in four distinct tones. Each bio is
              constructed to communicate maximum value density within the 150-character limit, with every
              word chosen to eliminate ambiguity and drive a clear follow or action. Pair your bio with{" "}
              <Link href="/tools/instagram-hashtag-generator" className="text-primary hover:underline font-medium">
                targeted hashtags
              </Link>{" "}
              and{" "}
              <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
                compelling captions
              </Link>{" "}
              to build a complete profile optimisation stack.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The Four Tone Strategies and When Each Performs Best
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Professional-tone bios are the strongest performers for coaches, consultants, service providers,
              and niche experts where authority and credibility are the primary reasons someone should follow.
              The professional format leads with what the creator delivers, supports it with a credibility
              signal, and closes with a follow or DM CTA. These bios work best in high-competition niches
              like business, finance, and wellness where the target audience is sophisticated enough to
              evaluate credentials before following.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Bold-tone bios are most effective for creators who compete through differentiation — they use
              a contrarian statement, a "no fluff" positioning claim, or a direct challenge to conventional
              wisdom. Bold bios attract followers who are already skeptical of generic advice, generating
              higher-quality engagement but lower follow volume. Minimal bios — clean, short, and instantly
              scannable — outperform longer bios in fashion, travel, photography, and entertainment niches
              where aesthetic identity matters more than detailed positioning.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Inspirational bios perform best for lifestyle, personal development, and wellness creators
              whose audience is primarily motivated by identity — the desire to become a certain type of
              person rather than achieve a specific outcome. They use aspirational language, community
              framing, and forward-looking statements that make the follower feel like following is a step
              toward the version of themselves they want to be.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> How to Maximise the Instagram Bio Character Limit
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram's 150-character bio limit is simultaneously a constraint and a competitive advantage.
              The creators who treat the limit as a discipline — forcing every word to earn its place —
              consistently produce bios that outperform longer, less edited versions. The most common
              character-wasting patterns to eliminate are: opening with your name (your username already
              identifies you), describing what you do rather than what you deliver ('I make fitness content'
              vs 'I help busy moms lose 20 lbs'), and using vague CTAs ('follow for tips') instead of
              specific benefit-led ones ('follow for a new workout every Monday').
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The most effective character-saving techniques are: replacing multi-word phrases with single
              power words ('lose weight effectively' → 'transform'), using the pipe separator (|) to divide
              sections without transition phrases, using line breaks to separate sections visually, and
              placing the CTA on the final line with a directional emoji (↓ or →) instead of a worded
              instruction. The goal is a bio that communicates professional authority and a clear value
              proposition in under 3 seconds of reading time.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" /> What This Instagram Bio Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "10 bio variations simultaneously — 3 Professional, 2 Bold, 2 Minimal, 3 Inspirational",
                "Strict 150-character enforcement — every bio fits Instagram's hard limit with a live character meter",
                "5 CTA goal types — Follow, DM, Link in Bio, Free Gift, Collab — each with natural CTA phrase variations",
                "Credibility marker injection — results or achievements incorporated into Professional bio variations",
                "Power Score and Clarity Score per bio — quickly identify the highest-converting options",
                "Tone filter tabs — view only Professional, Bold, Minimal, or Inspirational variations to compare",
                "4 bio structure formulas: [Result] | [CTA], [Audience] + [Result] + [CTA], and more",
                "15 niches supported — Fitness, Beauty, Business, Finance, Tech, Education, Food, Travel, and more",
                "Keywords field — inject niche-specific terms and positioning language directly into bio variations",
                "One-click copy per bio — paste directly into Instagram's profile edit without reformatting",
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

      {/* ── Tips ──────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Instagram bios are capped at 150 characters — lead with your who/what/why in the first line since the second line is folded on mobile profiles.",
            "Use the Name Field for SEO keywords, not your actual name — 'Fitness Coach | Fat Loss Expert' in the name field appears in Instagram search results.",
            "Add a location if you're a local business or event creator — profiles with location see 3× more calls and visits from nearby discovery searches.",
            "Change your bio link to match your current campaign — static 'link in bio' underperforms; update it every 1–2 weeks with your latest content or offer.",
            "Use a line break (press return on mobile) to create visual separation — a structured 3-line bio is 60% more likely to result in a follow than a run-on paragraph.",
            "Include 1–3 emojis as bullets — they replace periods aesthetically and increase scannability, leading to 20–30% longer bio read times.",
            "State your content posting schedule — 'New reels every Tuesday & Friday' sets expectations and improves follow-to-watch conversion rates significantly.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Tools ─────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related Instagram Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Instagram Caption Generator",     path: "/tools/instagram-caption-generator",     desc: "Write compelling post captions with hooks, CTAs, and the right tone to drive saves, comments, and shares." },
            { name: "Instagram Hashtag Generator",     path: "/tools/instagram-hashtag-generator",     desc: "Generate a targeted mix of hashtags to expand your reach and connect your content with the right audience." },
            { name: "Instagram Username Generator",    path: "/tools/instagram-username-generator",    desc: "Find a memorable, SEO-friendly Instagram handle that's consistent with your brand across all platforms." },
            { name: "Instagram Hook Generator",        path: "/tools/instagram-hook-generator",        desc: "Craft first-line hooks that stop the scroll and compel visitors to tap 'more' on your captions." },
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

      {/* ── FAQ ───────────────────────────────────────────────────── */}
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
