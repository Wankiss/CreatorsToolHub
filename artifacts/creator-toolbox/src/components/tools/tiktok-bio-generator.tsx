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
  "Fitness & Health", "Finance & Money", "Food & Cooking", "Beauty & Makeup",
  "Fashion & Style", "Travel", "Business & Entrepreneurship", "Education & Learning",
  "Gaming", "Entertainment & Comedy", "Parenting & Family", "Relationships & Dating",
  "Technology & Gadgets", "DIY & Crafts", "Motivation & Personal Development",
];

const TONES = [
  { value: "professional", label: "Professional", desc: "Credibility-driven, polished" },
  { value: "bold",         label: "Bold",         desc: "No-nonsense, direct authority" },
  { value: "inspirational",label: "Inspirational",desc: "Uplifting, motivational" },
  { value: "funny",        label: "Funny",         desc: "Humor-based, light-hearted" },
  { value: "casual",       label: "Casual",        desc: "Approachable, everyday" },
];

const FORMULA_LABELS: Record<number, string> = {
  0: "I help [audience] [result]",
  1: "I help [audience] [result]",
  2: "Emoji + Value Prop",
  3: "Emoji + Value Prop",
  4: "[Result] | [Niche]",
  5: "[Result] | [Niche]",
  6: "Follow for [benefit]",
  7: "Follow for [benefit]",
  8: "[USP] + [CTA]",
  9: "[USP] + [CTA]",
};

function charColor(len: number) {
  if (len <= 65) return "bg-green-500";
  if (len <= 75) return "bg-yellow-500";
  return "bg-orange-500";
}

function charTextColor(len: number) {
  if (len <= 65) return "text-green-600 dark:text-green-400";
  if (len <= 75) return "text-yellow-600 dark:text-yellow-400";
  return "text-orange-600 dark:text-orange-400";
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is a TikTok bio and why does it matter?",
    a: "Your TikTok bio is the 80-character description that appears on your profile page beneath your username and profile photo. It's the single piece of text a curious viewer reads after discovering one of your videos — and its job is to convert that visitor into a follower. Unlike other platforms where users browse profiles organically, TikTok's algorithm drives content discovery, so your profile visit is almost always earned: someone watched your video, liked it enough to tap your name, and is now evaluating whether to follow. A strong bio answers three questions in under three seconds: Who are you? What do I get from following you? Why should I follow now? A weak bio — or a blank one — sends those earned visitors away.",
  },
  {
    q: "What should I include in my TikTok bio?",
    a: "The most effective TikTok bios pack three elements into 80 characters: (1) A niche signal — what topic or category you cover, so visitors immediately self-select as your audience. (2) A value proposition — the specific benefit a follower receives, stated as a result rather than a description ('lose weight without the gym' rather than 'fitness tips'). (3) A call-to-action — a single next-step ask, whether that's a follow prompt, a link-in-bio reference, or a posting frequency claim ('5 videos/week') that signals consistency. Optional but powerful additions include a credential or USP ('certified nutritionist', '10M views'), a relevant emoji for visual personality, and a keyword that makes you discoverable in TikTok's creator search.",
  },
  {
    q: "How long can a TikTok bio be?",
    a: "TikTok allows a maximum of 80 characters in your bio — this includes spaces, emojis (which count as 1–2 characters each depending on the emoji), punctuation, and line breaks. TikTok truncates any bio longer than 80 characters and may not display the overflow text on some devices. Our generator enforces this limit on every bio it produces — each option is validated to 80 characters or fewer before being shown, so every result is safe to copy and paste directly into your TikTok profile without risk of truncation.",
  },
  {
    q: "Should I use emojis in my TikTok bio?",
    a: "Yes — strategically. Emojis serve three functions in a TikTok bio: they add visual personality, break up text for faster scanning, and can replace words (saving precious characters). Research on social profiles consistently shows that bios with 1–3 well-chosen emojis see higher engagement from profile visitors than plain-text equivalents. The optimal approach is using emojis that reinforce your niche (🏋️ for fitness, 💰 for finance, 🍳 for food) rather than decorative emojis that add no meaning. Avoid emoji overload — more than 3 emojis typically feels cluttered and reduces readability. Our generator produces a mix of emoji-rich and minimal bios so you can test both styles against your audience.",
  },
  {
    q: "What is a TikTok bio call-to-action?",
    a: "A TikTok bio call-to-action (CTA) is a short instruction that tells profile visitors what to do next. The most effective CTAs are specific and benefit-connected: 'Follow for daily money tips,' 'Free guide in bio ↓,' or 'New recipe every Sunday.' Generic CTAs like 'Follow me!' significantly underperform compared to benefit-driven alternatives that answer 'what's in it for me?' Research shows that bios with a specific CTA convert profile visitors to followers at 2–4× the rate of bios without one. The ↓ arrow emoji pointing to the link-in-bio is a particularly effective CTA trigger because it draws the eye downward and signals there's more value waiting.",
  },
  {
    q: "What are the best TikTok bio formulas that convert?",
    a: "The five highest-converting TikTok bio formulas are: (1) 'I help [specific audience] [specific result]' — the most direct benefit communication, e.g., 'I help busy moms lose 20 lbs without the gym.' (2) '[Emoji] [Value Proposition]' — visual and scannable, e.g., '💰 Turning 9-5ers into side hustlers.' (3) '[Result] | [Niche]' — identity and niche in one line, e.g., 'Debt-free at 28 | Personal Finance.' (4) 'Follow for [specific benefit]' — CTA-first conversion, e.g., 'Follow for free meal plans every week.' (5) '[USP/Credential] + [CTA]' — authority-driven with next step, e.g., 'Certified dietitian. Free macros guide ↓.' Our generator produces at least 2 bios per formula type per generation so you can compare and test.",
  },
  {
    q: "How do I write a TikTok bio for a business account?",
    a: "Business TikTok bios require a slightly different approach than personal creator bios. Lead with what the business does and who it serves rather than personal identity: 'Handmade jewelry for minimalist women ↓' outperforms 'We make jewelry.' Include a trust signal (years in business, customer count, certification, or press mention) if you can fit it within the character limit. Always end with a link-in-bio CTA since business accounts are more likely to have a direct conversion goal (purchase, booking, email sign-up). Use a professional or bold tone rather than casual or funny — unless humor is central to your brand. Avoid jargon or industry terminology that your customer might not recognise — write for a cold audience who has never heard of you.",
  },
  {
    q: "How often should I update my TikTok bio?",
    a: "Update your TikTok bio whenever your content focus shifts significantly, when you launch a new series or product, or when you're testing a new positioning angle. Beyond those event-driven updates, refreshing your bio quarterly is a good practice — a fresh bio signals an active creator to profile visitors and often improves follow conversion rates from people who've visited your profile before. When testing bios, run each version for at least 7 days and monitor your profile-to-follow conversion rate in TikTok Analytics (Profile → Analytics → Followers → Profile Views). A high-performing bio typically achieves a 5–15% conversion rate; anything below 3% is a signal to regenerate and test a new approach.",
  },
  {
    q: "Can I use the same bio on Instagram, YouTube, and TikTok?",
    a: "You can use the same core messaging, but each platform has different character limits and bio conventions that require adaptation. TikTok's 80-character limit is the most restrictive, so a TikTok bio tends to be the most compressed and punchy. Instagram allows 150 characters and supports line breaks, making multi-line bios with separate niche, value, and CTA lines more effective. YouTube allows up to 1,000 characters in the channel description, which functions more like a short About page than a bio. The underlying value proposition and audience targeting should be consistent across platforms, but the format, emoji usage, and CTA should be optimised for each platform's conventions and character limits separately.",
  },
  {
    q: "Is this TikTok bio generator free?",
    a: "Yes — the TikTok Bio Generator is completely free to use with no account required, no signup, and no usage limits. Every generation produces 10 bio variations across 5 proven high-converting formula types, all validated to TikTok's 80-character limit. Filter results by emoji bios, CTA bios, or minimal bios to find exactly the style that fits your brand. Use the Regenerate button to get a fresh set of 10 bios any time you want more options. The character count bar on each bio shows you instantly how close each option is to the 80-character limit, colour-coded green, yellow, and orange for readability.",
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

type FilterTab = "all" | "emoji" | "cta" | "minimal";

export function TikTokBioGeneratorTool() {
  const [niche, setNiche]         = useState("Fitness & Health");
  const [whatYouDo, setWhatYouDo] = useState("");
  const [tone, setTone]           = useState("casual");
  const [audience, setAudience]   = useState("");
  const [usp, setUsp]             = useState("");
  const [cta, setCta]             = useState("");
  const [keywords, setKeywords]   = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [filter, setFilter]       = useState<FilterTab>("all");
  const [copied, setCopied]       = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("tiktok-bio-generator");
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-tiktok-bio-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!whatYouDo.trim()) {
      toast({ title: "Description required", description: "Tell us what you do in one sentence.", variant: "destructive" });
      return;
    }
    run({ niche, whatYouDo, tone, audience, usp, cta, keywords });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
  };

  const copyItem = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    toast({ title: "Bio copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  // Filter logic
  const hasEmoji = (s: string) => /\p{Emoji}/u.test(s);
  const hasCta   = (s: string) => /follow|↓|link|free|join|subscribe|check|grab|get|download/i.test(s);

  const filteredOutputs = outputs.filter((bio, _i) => {
    if (filter === "emoji")   return hasEmoji(bio);
    if (filter === "cta")     return hasCta(bio);
    if (filter === "minimal") return !hasEmoji(bio) && !hasCta(bio);
    return true;
  });

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all",     label: `All (${outputs.length})` },
    { key: "emoji",   label: `With Emoji (${outputs.filter(hasEmoji).length})` },
    { key: "cta",     label: `With CTA (${outputs.filter(hasCta).length})` },
    { key: "minimal", label: `Minimal (${outputs.filter(b => !hasEmoji(b) && !hasCta(b)).length})` },
  ];

  return (
    <>
      {/* ── Tool Card ────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="text-pink-500" size={22} />
              <h2 className="font-bold text-lg text-foreground">TikTok Bio Generator</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
              <Sparkles size={12} /> AI-Powered
            </span>
          </div>

          {/* Niche */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Content Niche
            </label>
            <select
              value={niche}
              onChange={e => setNiche(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            >
              {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* What you do */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              What You Do *
            </label>
            <Input
              placeholder="e.g. help busy moms lose weight without the gym"
              value={whatYouDo}
              onChange={e => setWhatYouDo(e.target.value)}
              className="rounded-xl h-11 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1.5">One clear sentence — the more specific, the better your bios will be.</p>
          </div>

          {/* Tone */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TONES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${tone === t.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}
                >
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="font-normal opacity-70 mt-0.5 leading-tight">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional fields toggle */}
          <button
            type="button"
            onClick={() => setShowOptional(v => !v)}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? "rotate-180" : ""}`} />
            {showOptional ? "Hide" : "Show"} optional fields (target audience, USP, CTA, keywords)
          </button>

          {showOptional && (
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Target Audience</label>
                <Input placeholder="e.g. busy moms, college students..." value={audience} onChange={e => setAudience(e.target.value)} className="rounded-xl h-11 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Unique Selling Point (USP)</label>
                <Input placeholder="e.g. certified nutritionist, 10M views..." value={usp} onChange={e => setUsp(e.target.value)} className="rounded-xl h-11 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Preferred Call-to-Action</label>
                <Input placeholder="e.g. Follow for free weekly meal plans" value={cta} onChange={e => setCta(e.target.value)} className="rounded-xl h-11 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Keywords to Include</label>
                <Input placeholder="e.g. fitness, weight loss, nutrition..." value={keywords} onChange={e => setKeywords(e.target.value)} className="rounded-xl h-11 text-sm" />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {loading
              ? <><Loader2 className="animate-spin" size={18} /> Generating bios with AI…</>
              : <><Sparkles size={18} /> Generate 10 TikTok Bios</>}
          </Button>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      {outputs.length > 0 && (
        <div ref={resultsRef} className="mt-6 rounded-3xl border border-border bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 pt-5 pb-0 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Your Bio Options</h3>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Regenerate
              </button>
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1 flex-wrap pb-0">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                    filter === tab.key
                      ? "bg-background border border-b-background border-border text-foreground -mb-px relative z-10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-3">
            {filteredOutputs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No bios match this filter. Try regenerating or switching to All.</p>
            ) : (
              filteredOutputs.map((bio, i) => {
                const origIdx = outputs.indexOf(bio);
                const len = bio.length;
                const pct = Math.min((len / 80) * 100, 100);
                return (
                  <div
                    key={i}
                    onClick={() => copyItem(bio, origIdx)}
                    className="group relative p-4 rounded-2xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex-1 text-sm leading-relaxed font-medium text-foreground pr-8">{bio}</p>
                      <div className="absolute top-3.5 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {copied === origIdx
                          ? <Check size={16} className="text-green-500" />
                          : <Copy size={16} className="text-muted-foreground" />}
                      </div>
                    </div>
                    {/* Character count bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                          {FORMULA_LABELS[origIdx] ?? "Custom Formula"}
                        </span>
                        <span className={`text-[11px] font-bold ${charTextColor(len)}`}>
                          {len}/80 chars
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${charColor(len)}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the TikTok Bio Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Choose Your Niche and Enter What You Do",
              desc: "Select your content niche from the 15 options and describe what you do in one clear sentence — for example, 'help busy moms lose weight without the gym' or 'share daily money-saving tips for millennials.' The more specific your description, the more targeted and effective your bios will be.",
            },
            {
              step: 2,
              title: "Select Your Tone",
              desc: "Pick the tone that matches your TikTok personality — Professional for credibility-driven content, Bold for no-nonsense authority, Inspirational for motivational content, Funny for humor-based niches, or Casual for approachable everyday creators. The tone shapes the language and structure of every bio generated.",
            },
            {
              step: 3,
              title: "Add Optional Details for Better Bios",
              desc: "Open the optional fields to enter your target audience, unique selling point (USP), preferred call-to-action, and keywords. These inputs significantly improve bio quality — a USP like 'certified nutritionist' or a specific CTA like 'Follow for free weekly meal plans' makes your bios more specific and more likely to convert.",
            },
            {
              step: 4,
              title: "Filter, Copy, and Test",
              desc: "Use the filter tabs to view bios with emojis, CTAs, or minimal styles. Click any bio card to copy it instantly. Test 2–3 different bio styles by updating your profile and tracking your follow rate over 7 days in TikTok Analytics. The bio with the highest profile-to-follow conversion rate is your winner.",
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

      {/* ── About ────────────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This TikTok Bio Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This TikTok Bio Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This free TikTok Bio Generator produces 10 bio variations for your profile using five proven
              high-converting formula structures: "I help [audience] [result]" for direct benefit
              communication, "[Emoji] [Value Proposition]" for visual scannability, "[Result] | [Niche]"
              for identity clarity, "Follow for [benefit]" for direct CTA conversion, and "[USP] + [CTA]"
              for authority-driven profiles. Every bio is validated to TikTok's strict 80-character limit
              before being shown — nothing over the limit is ever surfaced, so every result is safe to
              copy and paste directly into your profile.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The AI uses your niche, what you do, tone preference, and optional audience and USP details
              to generate bios that feel specific to your brand rather than generic templates. The formula
              label on each bio tells you exactly which structure is being used, so you understand the
              strategic reasoning behind every option. The character count bar shows you at a glance how
              close each bio is to the 80-character ceiling — colour-coded green for comfortable, yellow
              for tight, and orange for borderline — so you can make informed choices about which to test.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Filter tabs let you instantly sort your 10 bios by style: view only emoji bios for a
              personality-forward selection, only CTA bios for conversion-optimised options, or only
              minimal bios for a clean professional look. Hit Regenerate any time to get a fresh set of
              10 without losing your inputs. This is a genuine testing tool — use multiple generations
              across different tones and formulas to build a shortlist, then A/B test the top 2–3 against
              your real TikTok analytics.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Your TikTok Bio Directly Affects Your Follower Growth
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TikTok's growth model is fundamentally different from other platforms. Most new followers
              don't find you through your profile — they find a video first and then visit your profile
              to decide whether to follow. This means your bio has one job: convert a curious viewer who
              already likes your content into a committed follower. A profile visit that doesn't convert
              to a follow is a missed growth opportunity — and at scale, that gap becomes enormous.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Research consistently shows that creators with a clear, benefit-driven bio convert profile
              visitors at 5–15%, while vague or blank bios convert at 1–3%. At 10,000 profile visits per
              month, the difference between a 3% and 10% conversion rate is 700 additional followers every
              single month — entirely from the same traffic, with no extra content creation required. Pair
              a strong bio with a{" "}
              <Link href="/tools/tiktok-hook-generator" className="text-primary hover:underline font-medium">
                high-retention hook strategy
              </Link>{" "}
              and{" "}
              <Link href="/tools/tiktok-hashtag-generator" className="text-primary hover:underline font-medium">
                optimised hashtags
              </Link>{" "}
              to maximise both discoverability and profile conversion simultaneously.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A great bio also impacts your link-in-bio click rate. Creators who pair a specific CTA in
              their bio ("Free guide ↓") with a link-in-bio landing page see 3–5× more link clicks than
              creators who leave the bio CTA vague or absent. If you're monetising through a newsletter,
              product, or affiliate offer, your bio is the primary driver of off-platform traffic — and
              optimising it costs nothing beyond the 2 minutes it takes to update your profile.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" /> What This TikTok Bio Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "10 bio options per generation using 5 distinct high-converting bio formulas",
                "Strict 80-character limit validation — every bio is safe to paste directly to TikTok",
                "Guaranteed variety: 3+ with CTA, 3+ with emojis, 2+ ultra-minimal per set",
                "Character count bar per bio — colour-coded green/yellow/orange for instant readability check",
                "15 niche options with niche-specific defaults for audience, result, and benefit language",
                "5 tone options (Professional, Bold, Inspirational, Funny, Casual) that shape language and structure",
                "Optional fields: target audience, USP, custom CTA, and keywords for bio personalisation",
                "Filter tabs to view all bios or filter by Emoji, CTA, or Minimal style instantly",
                "Formula label on each bio so you understand which structure is being used",
                "Regenerate button for unlimited variations — test until you find the perfect bio",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Keep your TikTok bio to 80 characters — users see only the first 80 on mobile before it truncates; front-load your value proposition.",
            "Include a niche-specific keyword in the first sentence (e.g., 'Fitness coach helping busy moms') — this makes you searchable in TikTok's creator discovery.",
            "Add a clear call-to-action with your link — 'New videos daily ↓' or 'Free guide in bio' consistently drive 3–5× more link clicks than plain descriptions.",
            "Use 1–3 relevant emojis to add personality without clutter — emojis can increase profile engagement by up to 20% vs plain text bios.",
            "Update your bio seasonally or when launching a new series — a fresh bio signals an active creator and increases follow conversions from profile visits.",
            "Add your content posting frequency ('5× per week') — consistency claims like this increase follow rates from profile visitors by up to 30%.",
            "If you have a link, make it a link-in-bio tool that aggregates your top offers — single links with a landing page convert far better than a bare URL.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Tools ────────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related TikTok Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "TikTok Caption Generator", path: "/tools/tiktok-caption-generator", desc: "Write scroll-stopping captions with hooks, hashtag cues, and CTAs that boost engagement on every post." },
            { name: "TikTok Hashtag Generator", path: "/tools/tiktok-hashtag-generator", desc: "Find the best mix of trending and niche hashtags to expand your reach and help TikTok categorise your content." },
            { name: "TikTok Username Generator", path: "/tools/tiktok-username-generator", desc: "Generate memorable, brand-consistent TikTok handles that are short, searchable, and available across platforms." },
            { name: "TikTok Hook Generator", path: "/tools/tiktok-hook-generator", desc: "Craft high-retention opening lines that stop the scroll and keep viewers watching past the critical first 3 seconds." },
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
