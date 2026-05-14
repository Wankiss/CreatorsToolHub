import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, AtSign,
  ChevronDown, ListChecks, Shield, ArrowUpRight, Zap, TrendingUp, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is an Instagram Username Generator?",
    a: "An Instagram Username Generator is an AI-powered tool that creates unique, brand-ready handle ideas based on your name, niche, and tone preferences. Instead of manually brainstorming combinations and repeatedly checking availability, you enter your niche or name, choose a style, and the AI generates up to 20 scored username options across six distinct naming categories: Personal Brand, Niche-Based, Keyword Twist, Aesthetic, Bold/Viral, and Abstract. Every username is rated for memorability, spellability, and brand potential so you can make an informed choice rather than guessing. The generator is free to use with no account required and produces a new batch of ideas every time you regenerate.",
  },
  {
    q: "What makes a good Instagram username?",
    a: "A strong Instagram username satisfies five criteria: (1) Memorable, a visitor who sees it once in a comment section should be able to recall it when searching hours later. Keep it under 14 characters and avoid complex consonant clusters. (2) Spellable, if someone hears your username spoken aloud, they should be able to type it correctly on the first attempt. Unconventional spellings feel creative but cost you followers who can't find you. (3) Brand potential, versatile enough to grow beyond Instagram into a YouTube channel, newsletter, or product line without feeling out of place. (4) Niche signal, even subtly, it communicates the general territory of your content. (5) Shelf life, it should still feel relevant in five years when your following is ten times larger. This generator scores every username it produces against memorability, spellability, and brand potential and displays the ratings as individual badges so you can compare options directly.",
  },
  {
    q: "How many characters can an Instagram username have?",
    a: "Instagram usernames can be between 1 and 30 characters long, and can only contain letters, numbers, periods, and underscores: no spaces, hyphens, or special characters. These rules are documented in the Instagram Help Center under Managing Your Account. However, the practical sweet spot for brand-building is 8–14 characters. Usernames shorter than 8 characters are almost universally taken on a platform with 2 billion monthly active users (Statista, 2024). Usernames longer than 14 characters get truncated in Instagram's comment interface on smaller screens and are harder to remember and type. The generator keeps all suggested usernames within the optimal range and displays character counts so you never have to count manually.",
  },
  {
    q: "Should my Instagram username match my niche?",
    a: "It depends on your long-term content strategy. If you are building a topic-centric resource account, a page dedicated to one specific subject like intermittent fasting, travel photography, or personal finance, a niche-based or keyword-twist handle immediately communicates the value proposition and can accelerate early growth because visitors understand what they'll get before they even read your bio. Topic accounts often grow faster in the early stages because the value proposition is legible from the username alone. However, if you are building a personal brand where you are the face of the content and plan to expand into multiple formats (podcast, newsletter, speaking), a name-based handle gives more flexibility. Your name travels across platforms and content categories without the confusion of a niche label you may outgrow. The generator produces handles in both styles, use the style filter tabs to compare them side by side.",
  },
  {
    q: "Can I change my Instagram username after setting it?",
    a: "Yes, Instagram allows you to change your username at any time from your profile settings, as documented in the Instagram Help Center. However, changing your username has real costs: all existing tagged posts, Story mentions, and external links to your old handle will break immediately. Anyone who tries to use your old tag will reach a dead end or, worse, a different account that claims the handle after you release it. Instagram's discovery systems also need time to re-index your new handle across search and recommendations, which can temporarily affect your visibility. For these reasons, it is worth investing time to choose the right username from the start rather than changing it after you've built an audience. Use the generator to shortlist 5–8 strong options, sleep on it for a day, check availability for each on Instagram, and then commit.",
  },
  {
    q: "Does this tool check if an Instagram username is available?",
    a: "This generator creates AI-powered username ideas based on your niche, name, tone, and style preferences, it does not connect to Instagram's servers to verify live availability in real time. To check whether a generated username is available, visit Instagram directly and search for the handle, or go to instagram.com/[username] in your browser. If the page shows a profile, it's taken; if it shows a 'Page Not Found' error, it's available. We recommend checking availability for your top 5 shortlisted options in one session rather than checking one at a time, this way you have backup options ready if your first choice is taken.",
  },
  {
    q: "What are the best Instagram username ideas for different niches?",
    a: "The best username style varies significantly by niche. For fitness and health creators, Bold/Viral and Keyword Twist handles work best, examples like fitflow, flexora, liftdaily signal the niche immediately and feel energetic. For beauty and lifestyle creators, Aesthetic handles with clean suffixes (glow.co, skinico, beautyly) perform well because they match the visual brand of the content. For business and finance creators, Abstract or Personal Brand handles (nexvest, wealthco, [name]grows) signal authority without being too narrow. For food creators, Niche-Based and Keyword Twist handles (bakewith[name], dailybite, crumbly) perform well. For travel creators, a mix of Personal Brand and Aesthetic styles works, handles that include a name feel personal and trustworthy. Enter your specific niche into the generator to get 20 ideas calibrated to your content category, scored and sorted across all six naming styles.",
  },
  {
    q: "What are Instagram's official rules for usernames according to the Help Center?",
    a: "Instagram's Help Center documents the following official username rules: usernames must be between 1 and 30 characters long; they can only contain letters (A–Z), numbers (0–9), periods (.), and underscores (_); spaces, hyphens, and other special characters are not permitted; usernames are not case-sensitive (so @JohnSmith and @johnsmith are treated as the same handle); each username must be unique across the platform. The Help Center also documents that you can change your username at any time from Settings → Account → Username, but notes that changing it breaks any existing mentions and external links using the old handle. Importantly, Instagram distinguishes the username from the separate Name field (the bold display name on your profile), which supports spaces, emoji, and symbols, and is the field Instagram's search indexes for keyword discovery. You can find these rules at help.instagram.com under the Manage Your Account section.",
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

export function InstagramUsernameGeneratorTool() {
  const [niche, setNiche] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("instagram-username-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-ig-username-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your niche or name for username ideas.", variant: "destructive" });
      return;
    }
    run({ niche });
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
          <AtSign className="text-purple-500" size={22} />
          <h2 className="font-semibold text-lg">Instagram Username Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={11} /> AI Powered
          </span>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Your Niche or Name *</label>
          <Input
            placeholder="e.g. travel photography, baking with Sam, fitness coach..."
            value={niche}
            onChange={e => setNiche(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
          />
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Usernames</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Username Ideas</h3>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outputs.join("\n")); toast({ title: "All usernames copied!" }); }}>
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {outputs.map((name, i) => (
              <div key={i} className="flex items-center gap-2 group p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <span className="flex-1 font-medium text-sm">{name}</span>
                <button onClick={() => copyItem(name, i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                  {copied === i ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                </button>
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Username Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Name & Niche",
              desc: "Type your first name or nickname (optional) and select your content niche, fitness, beauty, business, food, travel, or any of the 15 available categories. The more specific your input, the more targeted and on-brand your username results will be.",
            },
            {
              step: 2,
              title: "Choose Your Tone & Keywords",
              desc: "Pick a tone that matches your brand personality, Aesthetic, Bold, Minimal, Fun, Professional, or Edgy. Add optional keywords to personalise the results further and ensure specific terms appear in your generated handles.",
            },
            {
              step: 3,
              title: "Generate 20 Username Ideas",
              desc: "Click Generate and get 20 Instagram username ideas across 6 naming styles. Each handle is scored for memorability, spellability, and brand potential, displayed as badges so you can compare quality at a glance.",
            },
            {
              step: 4,
              title: "Filter, Copy & Go",
              desc: "Use the style filter tabs to browse by category. Click any username to copy it instantly. Use Copy All to export every visible result at once. Hit Regenerate for a completely fresh batch, unlimited rounds with no account required.",
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
            <AtSign className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Username Generator, Find the Perfect Handle for Your Brand</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What Makes a Perfect Instagram Username?
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram's Help Center documents that usernames can be up to 30 characters long and may
              only contain letters, numbers, periods, and underscores. On a platform with{" "}
              <a href="https://www.statista.com/statistics/253577/number-of-monthly-active-instagram-users/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">2 billion monthly active users</a>{" "}
              globally (Statista, 2024), the username you pick is the single most permanent element of
              your presence, it appears in every comment, Story mention, Reel credit, tagged post, and
              external link anyone ever shares. Getting it right the first time prevents the difficult
              process of rebuilding brand recognition after a change.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A perfect Instagram username satisfies five criteria simultaneously. First, it is memorable
             , a visitor who sees it once in a comment section should be able to recall it when
              searching for you hours later. Second, it is spellable at first glance, if someone hears
              your username spoken aloud, they should be able to type it correctly. Third, it carries
              brand potential, versatile enough to grow beyond Instagram into a YouTube channel name, a
              newsletter, or a business entity. Fourth, it has niche signal, even subtly, it
              communicates the general territory of your content. Fifth, it has shelf life, it will
              still feel relevant in five years.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This generator evaluates every username it creates against memorability, spellability, and
              brand potential, displaying the rating for each result as individual badges so you can
              make an informed choice. Once you have your handle, pair it with a strong{" "}
              <Link href="/tools/instagram-bio-generator" className="text-primary hover:underline font-medium">
                Instagram bio
              </Link>{" "}
              and consistent{" "}
              <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
                caption voice
              </Link>{" "}
              to reinforce the brand identity your username establishes.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Instagram Username Strategy: Choosing a Handle That Grows With You
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram's Help Center advises choosing a username that "represents you or your business"
             , a deliberate distinction that captures the two main strategy paths every creator faces.
              Personal-name handles and niche-keyword handles each have advantages depending on where
              you want your account to be in three to five years, and the right choice determines whether
              your handle helps or limits you as your content evolves.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The decision between a personal-name-based handle and a niche-keyword handle is one of
              the most common dilemmas for new Instagram creators, and the right answer depends entirely
              on your long-term content strategy. If you are building a personal brand where you are the
              face of the content and plan to expand into multiple formats (podcast, newsletter,
              speaking), a name-based handle gives you the most flexibility. Your name travels across
              platforms without the confusion of a niche label you may outgrow.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you are building a topic-centric resource account, a page dedicated to one specific
              subject like intermittent fasting, travel photography, or personal finance, a niche-based
              or keyword-twist handle tells visitors immediately what they'll get, reducing the barrier
              to following. Topic accounts often grow faster in the early stages because the value
              proposition is immediately legible from the username alone.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whichever style you choose, prioritise shortness over cleverness. Aim for 8–14 characters
              in your final handle, test it by imagining you are saying it aloud to someone at a
              conference, and verify that the exact spelling is obvious to anyone who hears it. Use the
              style filter tabs in the generator to compare handles across all six categories
              side-by-side, generate multiple rounds to maximise variety, shortlist 5–8 options, and
              check availability directly on Instagram before committing.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How Instagram's Username and Name Field Work Differently for Search
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram's Help Center distinguishes between two separate identity fields that most
              creators treat as the same thing. Your username (the @handle) is your unique identifier,               it appears in your profile URL, every mention, and every tag. Your Name field (the
              display name that appears in bold above your bio) is a separate 30-character field that
              serves a completely different function: it is the field Instagram's search algorithm
              indexes when deciding which profiles to surface for keyword queries.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This distinction matters for your username strategy. Because the username itself is
              primarily a brand identifier rather than a search-ranking signal, you can optimise it
              for memorability and cross-platform consistency without worrying whether it contains
              the right keywords. Put your searchable keyword phrases in the Name field instead, for
              example, a username like @alexcreates paired with a Name field of "Alex | Travel
              Photography Tips" gets you the discoverability of a keyword handle without locking you
              into a niche your content might outgrow.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Name field allows spaces, symbols, and emoji, unlike the username, which gives you
              room to include niche descriptors, location signals, or specialisation phrases that would
              be impossible in a handle. Instagram's Help Center confirms that the Name field is one of
              the primary places users can search to find your profile. Use this pairing strategy: pick
              a clean, brand-forward username with the generator, then write a keyword-rich Name field
              that does the search discovery work your handle doesn't need to do.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Key sources:</strong>{" "}
                <a href="https://help.instagram.com/1793730484426623" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Instagram Help Center, Edit Your Profile
                </a>{" "}
                documents the distinction between username (alphanumeric, max 30 chars, URL-forming)
                and the Name field (30 chars, supports spaces and symbols, searchable). The Help Center
                on{" "}
                <a href="https://help.instagram.com/271656673175566" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  changing your username
                </a>{" "}
                details the consequences of handle changes. Statista reported{" "}
                <a href="https://www.statista.com/statistics/253577/number-of-monthly-active-instagram-users/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  2 billion monthly active Instagram users
                </a>{" "}
                globally in 2024.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Why Use This Instagram Username Generator?
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "20 unique username ideas generated per session across 6 distinct naming styles",
                "6 proven naming styles: Personal Brand, Niche-Based, Keyword Twist, Aesthetic, Bold/Viral, Abstract",
                "Every username rated for memorability, spellability, and brand potential with visible badges",
                "Personal name integration for truly personalised handles that don't feel generic",
                "Style filter tabs to browse and compare all six categories side-by-side",
                "One-click copy for each individual username: no selecting, no highlighting",
                "Copy All button to export every visible result at once for your shortlist",
                "Regenerate for a fresh batch, unlimited rounds with zero throttling",
                "Works for all niches: fitness, beauty, business, food, travel, finance, and more",
                "100% free: no account, no credit card, no limits",
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

      {/* ── About This Tool ──────────────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <AtSign className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">About This Instagram Username Generator</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This Instagram Username Generator Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram's search algorithm surfaces accounts based on username and Name field keywords, making discoverability a direct function of username quality. On a platform with{" "}
              <a href="https://www.statista.com/statistics/253577/number-of-monthly-active-instagram-users/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">2 billion monthly active users</a>{" "}
              (Statista, 2024), your handle appears in every comment, Story mention, Reel credit, and external link, making it the most permanent branding decision on the platform. This generator creates 20 scored username ideas across 6 naming styles based on your niche, name, tone, and keywords.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The six naming styles are: Personal Brand (name-first, platform-agnostic), Niche-Based (topic-signaling handles), Keyword Twist (creative combinations of your niche terms), Aesthetic (clean, suffix-driven handles popular in beauty and lifestyle), Bold/Viral (high-energy handles built for growth), and Abstract (unique, brandable handles with no literal meaning). Every username is rated for memorability, spellability, and brand potential, displayed as individual badges for easy comparison.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Use the style filter tabs to compare across categories, copy any username in one click, or export your full shortlist with Copy All. Once you have your handle, pair it with a keyword-rich Name field (separate from the username, documented by the{" "}
              <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Instagram Help Center</a>
              ) for search discoverability, and a strong{" "}
              <Link href="/tools/instagram-bio-generator" className="text-primary hover:underline font-medium">
                Instagram bio
              </Link>{" "}
              to convert profile visitors once they find you.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Your Username Is a Search Engine Signal
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Most creators treat their username as a label. It's actually a discoverability asset. The{" "}
              <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Instagram Help Center</a>{" "}
              distinguishes between the username (your @handle, alphanumeric, max 30 characters, forms your profile URL) and the Name field (display name in bold above your bio, 30 characters, supports spaces and symbols). Both are indexed by Instagram's search algorithm, but they serve different functions. Your username is your identity signal. Your Name field is your keyword signal.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This means you don't have to sacrifice brand flexibility for searchability. A clean personal-brand handle like @alexcreates paired with a Name field reading "Alex | Travel Photography Tips" gives you both, a memorable, portable handle and a keyword-optimized display name that appears in search results for "travel photography tips." The generator produces handles optimized for memorability and cross-platform consistency. The Name field does the keyword work separately.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Changing your username after building an audience breaks all existing mentions, Story tags, and external links instantly. Instagram's search and recommendation systems also need time to re-index the new handle, which can temporarily reduce profile visibility. It's worth investing in the right handle from the start. The generator produces 20 options per session across 6 styles, shortlist 5-8, test them by saying each aloud, check availability directly on Instagram, and commit to the strongest one.
            </p>
          </div>

          {/* YouTube Embed */}
          <figure style={{margin:"1rem 0 2rem",position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"12px"}}>
            <iframe style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}}
              srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/sEsU3nEH-bQ?autoplay=1'><img src='https://img.youtube.com/vi/sEsU3nEH-bQ/maxresdefault.jpg' alt='How to choose a great Instagram username for your brand or niche account'><span>&#9654;</span></a>"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="How to choose a great Instagram username for your brand or niche account"
              aria-label="Guide to choosing an Instagram username that is memorable, searchable, and scalable across platforms, covering personal brand vs niche handle strategy and the Name field SEO technique">
            </iframe>
            <noscript><a href="https://www.youtube.com/watch?v=sEsU3nEH-bQ" target="_blank" rel="noopener">Watch: How to Choose a Great Instagram Username on YouTube</a></noscript>
          </figure>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Instagram Username Generator
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "20 username ideas per generation across 6 distinct naming styles, Personal Brand, Niche-Based, Keyword Twist, Aesthetic, Bold/Viral, Abstract",
                "Memorability, spellability, and brand potential ratings displayed as badges on every username card",
                "Personal name integration option: truly personalised handles that don't feel template-generated",
                "Style filter tabs: compare all six naming categories side-by-side without switching screens",
                "Tone selector: Aesthetic, Bold, Minimal, Fun, Professional, or Edgy shifts the style of generated handles",
                "Optional keywords field: inject niche terms directly into username suggestions for topic-signaling handles",
                "One-click copy per username: no selecting, no highlighting, instant clipboard copy",
                "Copy All button: export every visible result at once to build your shortlist",
                "Works across all 15 niches with niche-specific naming patterns, not generic word combinations",
                "100% free: no account required, no usage limits, unlimited regenerations",
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

      {/* ── Citation Capsule ──────────────────────────────────────── */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Source documentation:</strong>{" "}
          Instagram's search algorithm indexes both the username (@handle) and the Name field (display name above bio) for keyword queries, per the{" "}
          <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Instagram Help Center (Edit Your Profile)</a>.
          {" "}With 2 billion monthly active users (
          <a href="https://www.statista.com/statistics/253577/number-of-monthly-active-instagram-users/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Statista, 2024</a>
          ), your username appears in every mention, tag, and external link, making it the most permanent discoverability asset on the platform.
        </p>
      </div>

      {/* ── Tips & Best Practices ────────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices for Instagram Usernames</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Keep your Instagram username under 20 characters, shorter handles fit completely in Reels overlays and Stories mentions without being truncated on any device.",
            "Match your TikTok and YouTube handles exactly where possible, cross-platform brand consistency reduces friction when fans try to find you from other apps.",
            "Use the Name Field (separate from username) for keyword-rich phrases, Instagram searches the Name Field, so 'Travel Photographer | Landscape Tips' beats just your name.",
            "Avoid too many underscores or numbers, handles with 0–1 special characters are significantly easier to remember and type correctly than those with multiple separators or digit substitutions.",
            "Test your handle for unintended readings, say your proposed username out loud multiple times before finalising to catch any awkward combinations.",
            "Claim your handle on all platforms the same day, Instagram, TikTok, YouTube, X, and Pinterest consistency protects your brand from impersonators.",
            "Don't change your username frequently, Instagram's search and recommendation systems need time to re-index your new handle, and existing mentions and external links to your old handle break the moment you change it.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Instagram Tools ───────────────────────────── */}
      <section className="mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Related Instagram Tools</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Instagram Bio Generator", path: "/tools/instagram-bio-generator", desc: "Write a compelling Instagram bio that pairs with your new handle to convert profile visitors into followers." },
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Create on-brand captions in a consistent voice that reinforces the identity behind your new username." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Find the right hashtags to start building visibility under your new handle from your very first posts." },
            { name: "Instagram Hook Generator", path: "/tools/instagram-hook-generator", desc: "Craft scroll-stopping first lines that attract the audience your new username is designed to reach." },
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
          <p className="text-sm text-foreground font-semibold mb-1">Ready to complete your Instagram profile?</p>
          <p className="text-sm text-muted-foreground">
            Once you've locked in your handle, use the{" "}
            <Link href="/tools/instagram-bio-generator" className="text-primary hover:underline font-medium">
              Instagram Bio Generator
            </Link>{" "}
            to write a bio that converts profile visitors into followers, then start your content
            strategy with the{" "}
            <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
              Instagram Caption Generator
            </Link>.
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
