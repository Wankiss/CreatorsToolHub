import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Tv, Heart, Search,
  Shuffle, ListChecks, ChevronDown, Shield, Zap,
  ArrowUpRight, RefreshCw, Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type NameGroup = { brandable: string[]; keyword: string[]; creative: string[] };
type Tab = "all" | "brandable" | "keyword" | "creative" | "favorites";

const STYLES = ["Professional", "Creative", "Fun", "Minimalist", "Brandable", "Techy", "Educational"] as const;
const LENGTHS = [
  { value: "short", label: "Short (1 word)" },
  { value: "medium", label: "Medium (2 words)" },
  { value: "invented", label: "Invented / Brandable" },
] as const;

// ─── FAQ data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How do I choose a good YouTube channel name?",
    a: "Choose a YouTube channel name that passes five tests: (1) Say it out loud — if someone can't repeat it after hearing it once, it's too hard. (2) Type it from memory — if there's ambiguity about how to spell it, that's lost traffic. (3) Search it on YouTube — if the name returns no large channels, you have a clear lane. (4) Check it on Instagram, TikTok, and Twitter — brand consistency across platforms multiplies discovery. (5) Ask if it scales — a channel called 'DailyVlog2024' is trapped by its name; a channel called 'LifeWithMike' grows with you. Our AI generator applies these principles automatically, producing names in three strategic categories: brandable invented words, keyword-rich names, and creative hybrids. Generate 30–50 options, shortlist your top five, run the availability check on YouTube, and claim the matching social handles before you announce the name publicly.",
  },
  {
    q: "Should my YouTube channel name include keywords?",
    a: "Including your niche keyword in your channel name provides a small but real SEO benefit — particularly in the early months when your channel lacks watch time and subscriber authority. YouTube reads your channel name as a topical signal, and a channel called 'FitnessForge' will appear marginally more often in fitness-adjacent searches than 'QuantumMike' at the same subscriber count. That said, keyword stuffing in a channel name is actively harmful. Names like 'Best Fitness YouTube Channel 2024' look spammy to viewers and the algorithm, and they age poorly. The optimal approach is a name that either contains the niche keyword naturally (FitnessForge, TechPulse) or strongly implies the niche (IronLab for fitness, ByteForge for tech). Use the 'Always include niche keyword' toggle in our generator to explore this balance — it generates names that weave in the keyword while maintaining brand strength.",
  },
  {
    q: "How long should a YouTube channel name be?",
    a: "The ideal YouTube channel name is 2–12 characters (1–2 words). Shorter names are more memorable, easier to type from search, and more consistent across social handles. Most of YouTube's biggest channels follow this rule: MrBeast (7 chars), MKBHD (5 chars), Veritasium (10 chars). Names longer than 15 characters start to look cluttered in the YouTube header, and they're harder for viewers to remember after a single discovery. Single-word brandable names (Tubora, ByteForge) are the gold standard for longevity and cross-platform consistency. Two-word combinations (Tech Pulse, Iron Lab) work well for niches where a single word doesn't convey enough context. Avoid three-word names unless one word is very short (The SketchBook). Our generator's length selector lets you specify Short (single-word), Medium (two-word), or Invented (brandable) to focus the output on your preference.",
  },
  {
    q: "What makes a channel name 'brandable'?",
    a: "A brandable YouTube channel name is one that is unique, ownable, and memorable independent of its literal meaning. Brandable names are not dictionary words used in their standard sense — they are invented combinations, modified spellings, or evocative words that carry no pre-existing associations. 'Veritasium' is Latin for 'element of truth' — interesting, but most viewers don't know that. What makes it brandable is that it's completely unique, easy to say, and carries no conflicting meaning. When someone searches 'Veritasium' on YouTube, only one result comes up. That exclusivity is the core of a brandable name. The criteria: (1) Unique — searchable with zero competing results. (2) Pronounceable — works as spoken word. (3) Spellable — viewers can type it from memory. (4) Domain-available — a matching .com or .co strengthens the brand. (5) Handle-consistent — same name available on Instagram and TikTok. Our 'Brandable Names' category generates invented words specifically designed to meet all five criteria.",
  },
  {
    q: "Can I change my YouTube channel name later?",
    a: "Yes — YouTube allows you to change your channel name, but there are meaningful costs to doing so. Viewers who found you under the old name may not recognize the new one when it appears in their subscription feed. Any press mentions, backlinks, or social shares using the old name continue to point to a brand that no longer exists. If you've built more than 1,000 subscribers under a name, changing it creates measurable audience confusion. That said, many successful channels have rebranded — the key is doing it decisively and announcing it across all platforms simultaneously. The best approach is to invest time in your name before you launch. Our generator produces 20–50 options per session; spending 20 minutes generating and shortlisting options before your first video is far less painful than rebranding after 10,000 subscribers.",
  },
  {
    q: "Should my YouTube name match my username on other platforms?",
    a: "Yes — cross-platform handle consistency is one of the most important and most overlooked brand decisions a creator makes. When a viewer discovers your YouTube channel and wants to follow you on Instagram or TikTok, they will type your exact channel name into the search bar. If your handle is different on each platform, you lose that follow. Consistent handles also make your brand much stronger in Google search — when someone searches your channel name, results from YouTube, Instagram, TikTok, Twitter, and your website all reinforce each other instead of pointing to different identities. Before finalizing any channel name, search for the matching handle on Instagram, TikTok, Twitter/X, and check if the .com domain is available. Use our generator's results and immediately run the YouTube search check, then manually verify the social handles before committing.",
  },
  {
    q: "How many YouTube channel name ideas should I generate before deciding?",
    a: "Generate at least 30–50 name ideas before shortlisting. The first 5–10 names that come to mind are the most obvious — they're the same names your competitors considered. Generating 30+ options forces exploration into less obvious territory where stronger, more unique names live. From those 30–50, shortlist your top 5. Then run each through four checks: (1) YouTube search — does a major channel already use it? (2) Instagram/TikTok search — is the handle available? (3) Domain check — is the .com available? (4) Pronunciation test — say it to someone who hasn't seen it written. From your shortlist, you should have 1–2 names that pass all four checks. Our generator produces 20–50 unique options per session, grouped into three strategy categories, making the shortlisting process faster and more structured than brainstorming manually.",
  },
  {
    q: "What YouTube channel name styles work best for different niches?",
    a: "Different niches respond to different naming conventions, and our generator's seven style modes are tuned accordingly. Professional and Educational styles work well for finance, law, health, and business channels where authority and trust drive subscriptions — names like 'FinanceClear' or 'LegalEssentials'. Creative and Fun styles fit gaming, lifestyle, comedy, and vlog channels where personality is the draw — names like 'ChaosChapters' or 'SparkMode'. Techy style is optimized for software, coding, AI, and gadget channels — names like 'ByteForge' or 'CodeStack'. Minimalist style produces clean, concise names ideal for design, photography, and minimalist lifestyle channels. Brandable style generates invented words that work across any niche when long-term brand strength is the priority. Select the style that matches how you want viewers to feel when they first see your channel name — that first impression shapes whether they click.",
  },
  {
    q: "Is this YouTube channel name generator free?",
    a: "Yes — this YouTube channel name generator is completely free to use with no account, no subscription, and no usage limits. Enter your channel niche, select your preferred style and name length, and generate 20–50 unique name ideas instantly. You can save favorites with the heart icon, copy names, search YouTube for availability directly from the results, and regenerate as many times as you need to find the perfect name. Every name group — Brandable, Keyword, and Creative — is generated fresh each session, giving you different results even for the same niche. No payment information or sign-up is ever required.",
  },
  {
    q: "How do I check if a YouTube channel name is available?",
    a: "Click the Search icon next to any name in our results to instantly search YouTube for that exact name — you'll see immediately whether an existing channel already uses it. A channel name is effectively 'available' if no channel with significant subscribers (10,000+) uses the identical name. Even if a small inactive channel has the name, you may be able to use it if they have under 1,000 subscribers and haven't posted in years. After checking YouTube, search for the same name on Instagram, TikTok, and Twitter/X, and check the .com domain availability. Claim all handles simultaneously when you find a name that clears every platform — social handles are first-come, first-served and can disappear overnight once you start promoting a name publicly.",
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

// ─── Parse AI output into groups ─────────────────────────────────────────────

function parseGroups(raw: string[]): NameGroup {
  const text = raw.join("\n");
  const extract = (marker: string) => {
    const re = new RegExp(`\\[${marker}\\]([\\s\\S]*?)(?=\\[|$)`, "i");
    const match = text.match(re);
    if (!match) return [];
    return match[1]
      .split("\n")
      .map(l => l.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter(l => l.length > 1 && l.length < 50);
  };
  return {
    brandable: extract("BRANDABLE"),
    keyword: extract("KEYWORD"),
    creative: extract("CREATIVE"),
  };
}

// ─── Name card ───────────────────────────────────────────────────────────────

function NameCard({ name, isFav, onFav, onCopy, copied }: {
  name: string; isFav: boolean;
  onFav: () => void; onCopy: () => void; copied: boolean;
}) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`;
  return (
    <div className="flex items-center gap-2 group p-3 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors">
      <span className="flex-1 font-semibold text-sm">{name}</span>
      <button
        onClick={onFav}
        title="Save to favorites"
        className={`p-1 rounded transition-colors ${isFav ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}
      >
        <Heart size={14} fill={isFav ? "currentColor" : "none"} />
      </button>
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Search on YouTube"
        className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search size={14} />
      </a>
      <button
        onClick={onCopy}
        title="Copy name"
        className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function YouTubeChannelNameGeneratorTool() {
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState<string>("Creative");
  const [length, setLength] = useState<string>("medium");
  const [includeKeyword, setIncludeKeyword] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [groups, setGroups] = useState<NameGroup>({ brandable: [], keyword: [], creative: [] });

  const { outputs, loading, error, run } = useAiTool("youtube-channel-name-generator");
  const { toast } = useToast();

  useEffect(() => {
    if (outputs.length > 0) setGroups(parseGroups(outputs));
  }, [outputs]);

  useEffect(() => {
    const id = "faq-schema-yt-channel-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Describe your channel niche or topic.", variant: "destructive" });
      return;
    }
    setGroups({ brandable: [], keyword: [], creative: [] });
    run({ niche, style, length, includeKeyword: includeKeyword ? "yes" : "no" });
  };

  const handleShuffle = () => {
    setGroups(prev => ({
      brandable: [...prev.brandable].sort(() => Math.random() - 0.5),
      keyword: [...prev.keyword].sort(() => Math.random() - 0.5),
      creative: [...prev.creative].sort(() => Math.random() - 0.5),
    }));
  };

  const toggleFav = (name: string) => {
    setFavorites(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    toast({ title: "Name copied!" });
    setTimeout(() => setCopiedName(null), 2000);
  };

  const allNames = [...groups.brandable, ...groups.keyword, ...groups.creative];
  const hasResults = allNames.length > 0;

  const tabNames: Record<Tab, string[]> = {
    all: allNames,
    brandable: groups.brandable,
    keyword: groups.keyword,
    creative: groups.creative,
    favorites,
  };
  const visibleNames = tabNames[tab];

  const TAB_LABELS: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: allNames.length },
    { key: "brandable", label: "Brandable", count: groups.brandable.length },
    { key: "keyword", label: "Keyword", count: groups.keyword.length },
    { key: "creative", label: "Creative", count: groups.creative.length },
    { key: "favorites", label: "Favorites ♥", count: favorites.length },
  ];

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Tv className="text-red-500" size={22} />
          <h2 className="font-semibold text-lg">YouTube Channel Name Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            <Sparkles size={11} className="text-primary" /> Powered by AI
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Channel Niche / Topic *</label>
            <Input
              placeholder="e.g. personal finance, fitness for women, tech reviews, travel vlog..."
              value={niche}
              onChange={e => setNiche(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Naming Style</label>
              <select
                value={style}
                onChange={e => setStyle(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Name Length</label>
              <select
                value={length}
                onChange={e => setLength(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setIncludeKeyword(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${includeKeyword ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeKeyword ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm font-medium">Always include niche keyword</span>
            <span className="text-xs text-muted-foreground">(ensures your topic word appears in every name)</span>
          </label>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading
            ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</>
            : <><Sparkles size={16} className="mr-2" />Generate Channel Names</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {hasResults && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold">Channel Name Ideas</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShuffle}>
                <Shuffle size={13} className="mr-1" /> Shuffle
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
                <RefreshCw size={13} className="mr-1" /> Regenerate
              </Button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 flex-wrap">
            {TAB_LABELS.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {label}{(count ?? 0) > 0 ? ` (${count})` : ""}
              </button>
            ))}
          </div>

          {visibleNames.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {tab === "favorites" ? "Heart names to save them here." : "No names in this category."}
            </p>
          ) : (
            <div className="space-y-2">
              {visibleNames.map((name, i) => (
                <NameCard
                  key={`${tab}-${i}-${name}`}
                  name={name}
                  isFav={favorites.includes(name)}
                  onFav={() => toggleFav(name)}
                  onCopy={() => copyName(name)}
                  copied={copiedName === name}
                />
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Click <Search size={10} className="inline" /> to check name availability on YouTube · <Heart size={10} className="inline" /> to save to favorites
          </p>
        </Card>
      )}

      {/* ── How to Use ─────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the YouTube Channel Name Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Channel Niche",
              desc: "Type your channel topic into the niche field — for example 'fitness', 'tech reviews', 'travel vlog', or 'personal finance'. The AI uses your niche to expand related keywords and build names that feel native to your content area and audience.",
            },
            {
              step: 2,
              title: "Choose Your Style and Length",
              desc: "Select one of seven naming styles (Professional, Creative, Fun, Minimalist, Brandable, Techy, or Educational) and your preferred name length (Short single-word, Medium two-word, or Invented brandable). Toggle 'Always include niche keyword' to ensure your niche appears in every generated name.",
            },
            {
              step: 3,
              title: "Generate Channel Names",
              desc: "Hit Generate and the AI instantly creates 20–50 unique name ideas grouped into three categories: Brandable Names (invented, ownable words), Keyword Names (niche keyword + branding word), and Creative Names (evocative combinations). Use the filter tabs to browse each group separately.",
            },
            {
              step: 4,
              title: "Save Favorites, Copy, and Check Availability",
              desc: "Click the heart icon to save names to your Favorites tab. Hit Copy to grab a name to your clipboard. Click Search to instantly check YouTube for that name and see if any channel already uses it. Use Shuffle or Regenerate to discover new combinations.",
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
            <Tv className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This YouTube Channel Name Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Your YouTube Channel Name Is Your Most Important Brand Asset
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your YouTube channel name is the foundation of everything you build as a creator. It's
              the first thing a viewer sees when they discover your content, the name they search when
              they want to find you again, and the brand you carry across every platform where you
              promote your videos. A weak channel name is one of the most common — and most fixable —
              reasons channels struggle to build a loyal audience. A strong channel name makes people
              remember you, trust your brand, and actively recommend you to others.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The best YouTube channel names share five characteristics: they are short and easy to
              pronounce; they clearly imply the content category; they are unique enough to search
              directly; they work as a brand name across Instagram, TikTok, and a website domain; and
              they age well — they sound just as relevant in five years as they do today. Generic,
              keyword-stuffed names like "BestYouTubeTechVideos2024" signal a hobbyist, while names
              like "TechPulse" or "ByteForge" signal a serious brand. Our AI channel name generator
              applies all five criteria automatically across 20–50 unique suggestions per session.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Naming Strategies: From Keyword Names to Brandable Inventions
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              There are three distinct strategies for naming a YouTube channel, each with different
              trade-offs between discoverability and brand strength. <strong className="text-foreground">Keyword names</strong> (like
              "FitnessLab" or "TechExplained") are immediately understood and slightly easier to rank
              for in YouTube search — viewers know exactly what to expect. The downside is crowded
              competition; hundreds of channels may use similar combinations.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Creative hybrid names</strong> (like "IronPulse" or "CodeNation") balance
              recognizability with uniqueness. They use evocative words that suggest the niche without
              being literal — a fitness channel named "IronPulse" communicates strength and energy
              without just saying "fitness". These names are harder for competitors to copy and easier
              to trademark.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Brandable invented names</strong> (like "Tubora", "Streamiq", or "Fitora") are
              the highest-risk, highest-reward strategy. They have no inherent meaning, but they are
              100% unique, completely ownable across all platforms, and effortlessly memorable once a
              viewer encounters your content twice. YouTube's biggest channels — MrBeast, Veritasium,
              Kurzgesagt — all use invented or non-descriptive names that became powerful brands
              through content quality alone. Our generator produces all three categories in every
              session, grouped for easy comparison.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> SEO Tips for YouTube Channel Names
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube treats your channel name as a ranking signal. Including your primary niche
              keyword in your channel name can give a small but measurable SEO boost — particularly
              in early discovery before your channel has enough authority to rank on content alone. A
              fitness channel named "FitnessForge" will appear in fitness-related searches more readily
              than one named "JohnSmith" with no topical signal in the name itself.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              However, avoid making your channel name too keyword-heavy. Names like "Best Fitness
              YouTube Channel 2024" look spammy to both viewers and the algorithm. The sweet spot is
              a 1–2 word name that either contains the niche keyword or strongly implies it. Use our
              generator with the "Always include niche keyword" toggle to explore names that blend
              keyword relevance with brandability. Pair a strong channel name with our{" "}
              <a href="/tools/youtube-description-generator" className="text-primary hover:underline font-medium">
                YouTube Description Generator
              </a>{" "}
              and{" "}
              <a href="/tools/youtube-tag-generator" className="text-primary hover:underline font-medium">
                Tag Generator
              </a>{" "}
              for a complete channel SEO foundation.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This YouTube Channel Name Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Powered by AI — generates 20–50 unique names per session with different results every time",
                "Three name groups: Brandable, Keyword, and Creative — each with a different branding strategy",
                "Seven naming styles (Professional, Creative, Fun, Minimalist, Brandable, Techy, Educational)",
                "Niche keyword expansion — the AI understands your content area and related vocabulary",
                "Save favorites with the heart icon for easy shortlist comparison before committing",
                "One-click YouTube search to check name availability directly from any result",
                "Shuffle button randomizes name order for a fresh perspective on the same results",
                "Regenerate with variation — each session produces different names even for the same niche",
                "Works for any niche — gaming, tech, fitness, beauty, business, education, and more",
                "100% free, no account required, unlimited name generation — use it as many times as you need",
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
            { name: "YouTube Video Idea Generator", path: "/tools/youtube-video-idea-generator", desc: "Generate your first viral video ideas once your channel name and brand are set." },
            { name: "YouTube Script Generator", path: "/tools/youtube-script-generator", desc: "Write full video scripts with hooks, body, and CTAs to bring your channel to life." },
            { name: "YouTube Description Generator", path: "/tools/youtube-description-generator", desc: "Craft SEO-optimized descriptions for every video on your new channel." },
            { name: "YouTube Hashtag Generator", path: "/tools/youtube-hashtag-generator", desc: "Generate niche hashtags that help your new channel's videos get discovered faster." },
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
