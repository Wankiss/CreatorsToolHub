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
    a: "With over 115 million YouTube channels on the platform (Statista, 2025), your channel name is the first thing viewers use to decide whether to click, subscribe, or search for you again. A good name passes five practical tests: (1) Say it out loud — if someone can't repeat it after hearing it once, it's too hard. (2) Type it from memory — spelling ambiguity means lost search traffic. (3) Search it on YouTube — if no large channel uses it, you have a clear lane. (4) Check Instagram, TikTok, and Twitter — consistent handles across platforms multiply discovery. (5) Ask if it scales — 'DailyVlog2024' traps you; 'LifeWithMike' grows with you. A TunePocket study of trending channels found 43.31% have names between 10 and 15 characters, suggesting that the mid-length range hits the sweet spot of memorability and clarity. Our generator applies these principles automatically, producing names in three strategic categories: brandable invented words, keyword-rich names, and creative hybrids.",
  },
  {
    q: "Should my YouTube channel name include keywords?",
    a: "Including your niche keyword in your channel name provides a small but real SEO benefit — particularly in the early months before your channel has watch time and subscriber authority. YouTube reads your channel name as a topical signal, so a channel called 'FitnessForge' will appear more often in fitness-adjacent searches than 'QuantumMike' at the same subscriber count. That said, keyword stuffing a channel name is harmful. Names like 'Best Fitness YouTube Channel 2024' look spammy to viewers and the algorithm, and they age badly. The optimal approach: a name that contains the niche keyword naturally (FitnessForge, TechPulse) or strongly implies it (IronLab for fitness, ByteForge for tech). Use the 'Always include niche keyword' toggle in our generator to explore this balance — it produces names that weave in the keyword while maintaining brand strength.",
  },
  {
    q: "How long should a YouTube channel name be?",
    a: "Data from a TunePocket analysis of trending YouTube channels found that 43.31% have names between 10 and 15 characters, and 42.45% use two-word combinations. That puts the practical sweet spot at two words totaling roughly 10-15 characters — long enough to convey a brand identity, short enough to be typed from memory. Real examples match this pattern: MrBeast (7 chars), Veritasium (10), MKBHD (5). Names longer than 20 characters start to look cluttered in the YouTube header and are harder for viewers to recall after a single exposure. Single-word brandable names work well for long-term brand equity; two-word combinations work for niches where one word doesn't convey enough context. Our generator's length selector lets you specify Short (1 word), Medium (2 words), or Invented (brandable) to target the right range.",
  },
  {
    q: "What's the difference between a YouTube channel name and a YouTube handle?",
    a: "YouTube has two distinct identities that most creators confuse. Your channel name is your display name — up to 100 characters, shown on your channel page and in the subscription feed. Your @handle is your unique username — between 3 and 30 characters using only letters, numbers, underscores, hyphens, and periods (per YouTube's Help Center). The handle is what appears in Shorts, comments, search results, and your channel URL (youtube.com/@yourhandle). Crucially, channel names are not unique — multiple channels can share the same display name. Handles are unique: once claimed, no one else can use yours. When choosing a channel name, always check that a matching or near-matching handle is available at the same time. A strong brand has the same identity in both fields. Our generator produces names short enough to work as both a display name and a handle.",
  },
  {
    q: "Can I change my YouTube channel name later?",
    a: "Yes, but YouTube's official rules impose two significant constraints most creators don't know about. First, YouTube's Help Center states you can only change your channel name twice within any 14-day period — after two changes, you're locked out until the window resets. Second — and more important — changing your channel name removes your verification badge (the gray checkmark). If you've earned verification, a name change strips it immediately; you'd need to re-qualify. Beyond the platform rules, there's audience confusion: viewers who found you under the old name may not recognize the new one in their subscription feed. The practical advice: invest 20-30 minutes choosing a name before your first video. Our generator produces 20-50 options per session — use it to shortlist five candidates and pick the strongest before you ever publish.",
  },
  {
    q: "Should my YouTube name match my username on other platforms?",
    a: "Yes — cross-platform handle consistency is one of the most overlooked brand decisions a creator makes. When a viewer discovers your YouTube channel and searches for you on Instagram or TikTok, they'll type your channel name exactly. If your handle is different, you lose that follow entirely. Consistent handles also strengthen Google search: when someone searches your channel name, results from YouTube, Instagram, TikTok, Twitter, and your website all reinforce each other instead of pointing to different identities. Before finalizing any channel name, search for the matching handle on Instagram, TikTok, Twitter/X, and check .com domain availability. Claim all handles simultaneously — they're first-come, first-served and can disappear the moment you start publicly promoting a name.",
  },
  {
    q: "What makes a channel name 'brandable'?",
    a: "A brandable YouTube channel name is unique, ownable, and memorable independent of its literal meaning. Brandable names are not standard dictionary words — they're invented combinations, modified spellings, or evocative words with no pre-existing associations. 'Veritasium' is Latin for 'element of truth,' but viewers don't need to know that: it's completely unique, easy to say, and returns one result when searched. That exclusivity is what makes it brandable. The five criteria: (1) Unique — zero competing channels use it. (2) Pronounceable — works as a spoken word. (3) Spellable — viewers can type it from memory. (4) Domain-available — a matching .com strengthens the brand. (5) Handle-consistent — same name available on Instagram and TikTok. YouTube's largest channels — MrBeast, Kurzgesagt, Veritasium — all use invented or non-descriptive names. Our 'Brandable Names' category generates invented words engineered to meet all five criteria.",
  },
  {
    q: "How many YouTube channel name ideas should I generate before deciding?",
    a: "Generate at least 30-50 name ideas before shortlisting. The first 5-10 names that come to mind are the most obvious — the same ones your competitors already considered. Generating 30+ options pushes into less obvious territory where stronger, more unique names live. From that pool, shortlist your top 5 and run each through four checks: (1) YouTube search — does a major channel already use it? (2) Instagram/TikTok search — is the handle available? (3) Domain check — is the .com available? (4) Pronunciation test — say it aloud to someone who hasn't seen it written. From a shortlist of five, you should find 1-2 names that pass all four checks. Our generator produces 20-50 unique options per session grouped into three strategy categories, making the shortlisting process faster and more structured than manual brainstorming.",
  },
  {
    q: "What YouTube channel name styles work best for different niches?",
    a: "Different niches respond to different naming conventions, and our generator's seven style modes are tuned accordingly. Professional and Educational styles work well for finance, law, health, and business channels where authority and trust drive subscriptions — think 'FinanceClear' or 'LegalEssentials'. Creative and Fun styles fit gaming, lifestyle, comedy, and vlog channels where personality is the draw — think 'ChaosChapters' or 'SparkMode'. Techy style is optimized for software, coding, AI, and gadget channels — names like 'ByteForge' or 'CodeStack'. Minimalist style produces clean, concise names ideal for design, photography, and lifestyle channels. Brandable style generates invented words that work across any niche when long-term brand equity is the priority. Select the style that matches how you want viewers to feel on their first impression of your channel — that reaction shapes whether they click.",
  },
  {
    q: "Is this YouTube channel name generator free?",
    a: "Yes — this YouTube channel name generator is completely free to use with no account, no subscription, and no usage limits. Enter your channel niche, select your preferred style and name length, and generate 20-50 unique name ideas instantly. Save favorites with the heart icon, copy names with one click, search YouTube for availability directly from the results, and regenerate as many times as you need. Every name group — Brandable, Keyword, and Creative — is generated fresh each session, so you get different results even for the same niche. No payment information or sign-up is ever required.",
  },
  {
    q: "How do I check if a YouTube channel name is available?",
    a: "Click the Search icon next to any name in our results to instantly search YouTube for that exact name — you'll see right away whether an existing channel already uses it. A name is effectively available if no channel with significant subscribers (10,000+) uses it identically. Even if a small inactive channel holds the name, you may be able to use it if they have under 1,000 subscribers and haven't posted in years. After checking YouTube, separately verify your intended @handle is unclaimed (handles are unique — channel names are not). Then check Instagram, TikTok, Twitter/X, and the .com domain. Claim all handles simultaneously when a name clears every platform — social handles are first-come, first-served and can disappear overnight once you start promoting publicly.",
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
              desc: "Type your channel topic into the niche field — for example 'fitness', 'tech reviews', 'travel vlog', or 'personal finance'. The more specific your niche, the stronger the name output. 'Budget travel in Southeast Asia' generates better names than just 'travel'.",
            },
            {
              step: 2,
              title: "Choose Your Style and Length",
              desc: "Select one of seven naming styles (Professional, Creative, Fun, Minimalist, Brandable, Techy, or Educational) and your preferred name length (Short single-word, Medium two-word, or Invented brandable). Research shows 42.45% of trending channels use two-word names — Medium is a strong default for most niches.",
            },
            {
              step: 3,
              title: "Generate and Browse by Category",
              desc: "Hit Generate and the AI creates 20-50 unique name ideas grouped into three categories: Brandable Names (invented, ownable words), Keyword Names (niche keyword + brand word), and Creative Names (evocative combinations). Use the filter tabs to compare each group separately.",
            },
            {
              step: 4,
              title: "Check Availability Across All Platforms",
              desc: "Click the Search icon to check YouTube instantly. Then manually verify the same name as a @handle on YouTube, and as a username on Instagram, TikTok, and Twitter/X. Claim all handles simultaneously — once you announce a name publicly, matching handles can be taken within hours.",
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

          {/* Section 1: Why it matters */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Your Channel Name Determines Whether You Get Found
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              There are over 115 million YouTube channels competing for viewer attention (Statista, 2025). In that
              environment, your channel name is the first filter — the thing a viewer searches when they want to
              find you again, the brand they share when recommending you to a friend, and the handle they look up
              on Instagram after discovering you on YouTube. A name that's hard to spell, easy to confuse, or
              cluttered with keywords makes every one of those follow-up moments harder.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Research from TunePocket analyzing trending YouTube channels found that 43.31% have names between
              10 and 15 characters, and 42.45% use two-word combinations. That's not coincidence — two-word names
              hit the practical sweet spot between enough context to convey a brand identity and short enough to
              be typed from memory. Think MrBeast (7 chars), Veritasium (10), or MKBHD (5). Each is unique,
              pronounceable, and completely ownable. Generic names like "BestYouTubeTechChannel2024" signal a
              hobbyist; names like "TechPulse" or "ByteForge" signal a real brand.
            </p>
            {/* Citation capsule */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">By the numbers</strong>
              With{" "}
              <a href="https://www.statista.com/statistics/272014/global-social-networks-ranked-by-number-of-users/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                115 million+ YouTube channels
              </a>{" "}
              (Statista, 2025), a channel name must stand out in search, subscriptions, and cross-platform discovery.
              A{" "}
              <a href="https://www.tunepocket.com/youtube-channel-name-statistics/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                TunePocket study of trending channels
              </a>{" "}
              found 43.31% have names between 10–15 characters and 42.45% use two-word combinations — patterns
              reflecting what audiences find easiest to search, share, and remember.
            </div>
          </div>

          {/* Section 2: Handle vs Channel Name — EXCLUSIVE CONTENT */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Channel Name vs. @Handle: The Distinction Every New Creator Misses
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube gives every channel two separate identities, and most creators don't realize they need to
              manage both from day one.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="font-semibold text-foreground mb-2 text-sm">Channel Name (Display Name)</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Up to 100 characters</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Shown on your channel page and in the subscription feed</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /><strong>Not unique</strong> — multiple channels can share the same name</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Can contain spaces, punctuation, and special characters</li>
                </ul>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="font-semibold text-foreground mb-2 text-sm">@Handle (Unique Username)</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />3–30 characters only</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Letters, numbers, underscores, hyphens, periods</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /><strong>Globally unique</strong> — one handle per creator, first-come, first-served</li>
                  <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Appears in Shorts, comments, search, and your channel URL (youtube.com/@handle)</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              When you pick a channel name, always verify a matching @handle is available at the same time — because
              handles are unique and first-come, first-served. A brand named "TechPulse" with the handle
              @TechPulse2024 instead of @TechPulse looks fragmented. Our generator produces names between 6 and 20
              characters specifically so they work as both a display name and a clean handle without modification.
            </p>
          </div>

          {/* Section 3: Four naming strategies */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> Four Naming Strategies — and When to Use Each
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every successful YouTube channel name fits one of four strategies. Choose based on where you are
              in your creator journey and how much brand-building work you're prepared to do.
            </p>
            <div className="space-y-3">
              {[
                {
                  title: "Personal Brand Names",
                  example: "MrBeast · Mark Rober · Marques Brownlee",
                  desc: "Your real name or a personal nickname. Works best if you're the face of the channel and your niche will evolve over time. Scales with you, never becomes outdated, and builds a genuine parasocial connection. Downside: zero built-in discoverability — search won't surface 'JohnSmith' for fitness queries.",
                },
                {
                  title: "Descriptive / Keyword Names",
                  example: "FitnessBlender · Cooking With Dog · TED-Ed",
                  desc: "Channel name includes the niche keyword directly. Gives YouTube an immediate topical signal and helps with early discovery before you have watch-time authority. Best for educational, instructional, or niche-specific channels. Risk: can feel generic and age poorly if your content scope expands.",
                },
                {
                  title: "Creative / Hybrid Names",
                  example: "IronPulse · CodeNation · FinanceClear",
                  desc: "Evocative words that imply the niche without stating it literally. Balances recognizability with uniqueness. Harder for competitors to copy, easier to trademark. Works for any niche where you want brand strength without being boxed in by a keyword.",
                },
                {
                  title: "Invented / Brandable Names",
                  example: "Veritasium · Kurzgesagt · MKBHD",
                  desc: "Coined words with no pre-existing meaning. Highest long-term brand value — 100% unique, fully ownable, memorable after two exposures. Requires more content-driven brand-building to establish meaning. Best for creators committed to a distinctive, platform-spanning brand identity.",
                },
              ].map(({ title, example, desc }, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="font-semibold text-foreground text-sm mb-0.5">{title}</div>
                  <div className="text-xs text-primary font-medium mb-2">{example}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Name change consequences */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What Happens When You Change Your Channel Name
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              YouTube allows channel name changes, but two official rules catch most creators off guard.
              First, per{" "}
              <a href="https://support.google.com/youtube/answer/2657964" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                YouTube's Help Center
              </a>
              , you can only change your channel name <strong className="text-foreground">twice within any 14-day period</strong> — after two
              changes, the option locks until the window resets. Second — and more costly for established channels —
              <strong className="text-foreground"> changing your channel name removes your verification badge</strong>. The gray checkmark
              that signals a verified creator disappears on name change and requires re-qualification.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Beyond the platform rules, there's audience friction: viewers who subscribed under your old name see
              an unfamiliar brand name in their feed and may not recognize you. Any backlinks, press coverage, or
              social shares pointing to the old name continue referencing a brand that no longer exists. The cleaner
              path is to invest time in the name before your first video. Generate 30-50 options here, shortlist five
              candidates that pass the four-platform availability check, and pick the strongest one before you ever
              publish — that 20-minute decision prevents a costly rebrand later.
            </p>
          </div>

          {/* Section 5: Feature grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Use This YouTube Channel Name Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Powered by AI — generates 20-50 unique names per session with different results every time",
                "Three name groups: Brandable, Keyword, and Creative — each with a distinct branding strategy",
                "Seven naming styles (Professional, Creative, Fun, Minimalist, Brandable, Techy, Educational)",
                "Niche keyword expansion — the AI understands your content area and related vocabulary",
                "Save favorites with the heart icon for shortlist comparison before committing",
                "One-click YouTube search to check name availability directly from any result",
                "Shuffle button randomizes name order for a fresh look at the same results",
                "Names sized for dual use as both a display name and a @handle (6-20 chars)",
                "Works for any niche — gaming, tech, fitness, beauty, business, education, and more",
                "100% free, no account required, unlimited name generation",
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
