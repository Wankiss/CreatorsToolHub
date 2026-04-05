import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, Calendar,
  ChevronDown, ListChecks, Shield, ArrowUpRight, Zap, TrendingUp, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is an Instagram content planner and why do I need one?",
    a: "An Instagram content planner is a structured system that maps out what you will post, when you will post it, and what goal each post is designed to achieve — typically over a 4-week period. Without a plan, most creators fall into reactive posting: creating whatever feels relevant that day, then going silent when inspiration runs out. This burst-and-drought pattern is one of the primary reasons accounts plateau — Instagram's algorithm actively deprioritises accounts that post inconsistently, reducing their reach each time they go quiet. A content planner solves this by eliminating the daily creative decision of what to post and replacing it with execution. When you know every post for the next 4 weeks — the format, the topic, the hook, the goal, and the optimal posting time — you stop spending creative energy on planning and spend it entirely on creating. The result is higher output, more consistent quality, and the algorithmic benefit of sustained posting frequency.",
  },
  {
    q: "How many times should I post on Instagram per week in 2026?",
    a: "The right posting frequency depends on your current stage. For accounts in growth mode (under 10K followers), 5 posts per week — structured as 3 Reels, 1 Carousel, and 1 Static post — provides the optimal balance of Reel-driven discoverability and depth content that earns saves and shares. Posting fewer than 3 times per week at this stage significantly reduces algorithmic distribution opportunities. For accounts in the 10K–100K range, 4–5 posts per week with a higher proportion of Carousels (which generate saves) and Reels (which generate reach) tends to produce stronger engagement rates than pure volume. For larger accounts (100K+), quality and strategy matter more than frequency — 3–4 highly targeted posts per week typically outperform 7 average ones. The planner offers three frequency tiers: 3×/week (2 Reels + 1 Carousel), 5×/week (3 Reels + 1 Carousel + 1 Static), and 7×/week (4 Reels + 2 Carousels + 1 Static).",
  },
  {
    q: "What should be in an Instagram content calendar?",
    a: "A complete Instagram content calendar should include six elements for every post: (1) Day and date — the scheduled publishing day with optimal posting time based on your audience's active hours. (2) Post type — Reel, Carousel, Static, or Story, since each format serves a different stage of the audience funnel. (3) Topic — the specific subject of the post, detailed enough to film or write without additional planning. (4) Hook — the opening line or visual that stops the scroll, the single biggest determinant of whether the content gets distributed. (5) Goal — the primary objective for this post (reach new followers, earn saves, drive comments, generate sales intent, or build authority). (6) Content pillar — the category the post belongs to (Education, Entertainment, Personal, Tips, Promotion) to ensure variety across your posting schedule. This planner generates all six elements for every post across 4 weeks, plus a Story plan and weekly strategic tips.",
  },
  {
    q: "What are content pillars on Instagram and how many should I have?",
    a: "Content pillars are the recurring topic categories that define what your account covers — the repeating subjects that your audience expects and that give your account a predictable identity. Examples include: Education (teaching skills or information), Entertainment (engaging storytelling or humour), Personal (behind-the-scenes, personal journey), Tips (actionable advice in your niche), Promotion (products, services, or offers), Inspiration (motivational or aspirational content), and Behind-the-Scenes (process, workspace, or day-in-the-life content). For most creators, 3–5 pillars is the optimal range. Fewer than 3 makes content feel repetitive; more than 5 makes the account identity unclear. Pillars solve the most common Instagram posting problem — running out of ideas — by creating a recurring structure you draw from rather than starting from zero every time. Select 2–5 pillars in this planner and each will appear in rotation across your 4-week calendar.",
  },
  {
    q: "What is the best Instagram posting time in 2026?",
    a: "The best Instagram posting time depends on two factors: your audience's location and time zone, and your specific goal. For general guidance, the highest-engagement windows are Tuesday through Friday, 9–11am and 6–9pm in your audience's primary time zone. Morning windows (9–11am) produce higher save rates because users are in a more deliberate browsing mindset. Evening windows (6–9pm) produce higher comment rates because users are more present and conversational. Saturday and Sunday mornings can produce strong reach for accounts with global audiences where weekend behaviour varies. The single most reliable method is to check your Instagram Professional Dashboard under Audience to find when your specific followers are most active, then post 30–60 minutes before the peak to allow the algorithm time to begin distributing before engagement velocity peaks. This planner generates goal-optimised posting times for every scheduled post.",
  },
  {
    q: "What type of content performs best on Instagram in 2026?",
    a: "In 2026, the three highest-performing content types on Instagram serve different objectives and should be used in combination rather than isolation. Reels generate the most reach — they are the primary format through which Instagram distributes content to non-followers via Explore, the Reels tab, and interest-based home feed recommendations. A strong Reel can expose your account to tens of thousands of new potential followers in 48 hours. Carousels generate the most saves and shares — they are the strongest format for educational content, step-by-step guides, and list posts, and consistently earn 3–5× more saves than static posts on equivalent topics. Saves are Instagram's highest-weight ranking signal for Explore placement. Stories generate the strongest existing-audience relationships — polls, question boxes, and behind-the-scenes updates create daily micro-touchpoints that convert passive followers into engaged community members. This planner distributes your posting schedule across all three formats at ratios optimised for your selected goal.",
  },
  {
    q: "How do I use content pillars to plan an Instagram calendar?",
    a: "Using content pillars to plan a calendar involves three steps: (1) Select 3–5 pillars that reflect the recurring value categories your account delivers — for a fitness account this might be Workout Tips, Nutrition Education, Personal Journey, and Motivation. (2) Assign each week's posts to specific pillars so that no single week is dominated by one category — a week with 5 posts might include 2 Tips, 1 Personal, 1 Education, and 1 Promotion. (3) Match content types to pillars strategically — Educational pillar content works best as Carousels (for saves), Entertainment and Personal pillar content works best as Reels (for reach and connection), and Promotion pillar content works best as either a Reel or Carousel with explicit offer framing. This planner automates all three steps — enter your pillars, and the AI generates a 4-week calendar with posts rotated across your selected categories, balanced across formats, and matched to your goal.",
  },
  {
    q: "How do I batch create Instagram content efficiently?",
    a: "Batch content creation is the production strategy that enables consistent Instagram posting without the daily time investment that burns most creators out. The process has four phases: (1) Plan — use this planner to generate your 4-week calendar before you create anything. (2) Script and write — dedicate one session to writing hooks, captions, and talking points for all posts of the same type. Writing 5 Reel scripts in one sitting takes 45 minutes; writing 1 Reel script per day for 5 days takes the same total time but with 4× more setup and context-switching cost. (3) Film — group all talking-head Reels in one filming session, all B-Roll in another. A 5-Reel filming session takes 60–90 minutes; filming 1 Reel per day across 5 days takes the same footage time but each setup adds 15–20 minutes of preparation. (4) Edit and schedule — edit all content of the same type in a single editing session and schedule through your preferred tool. The planner's Copy Week feature exports formatted weekly plans directly to Notion, Google Docs, or scheduling tools for this exact workflow.",
  },
  {
    q: "What is the difference between Reels, Carousels, and Stories for strategy?",
    a: "Each Instagram format serves a distinct role in the audience relationship funnel and should be used for different strategic objectives. Reels are the top-of-funnel format — their primary job is reach and discoverability. Instagram surfaces Reels to non-followers through Explore, the Reels tab, and interest-based feed recommendations. Use Reels when your goal is attracting new followers, going viral in your niche, or maximising overall impressions. Carousels are the mid-funnel format — their primary job is depth, authority, and save-driving. A well-structured 7–10 slide carousel delivers more value than a single post on the same topic and generates 3–5× more saves. Use Carousels for educational content, step-by-step guides, and list posts. Stories are the relationship layer — they don't reach non-followers and don't generate saves or shares, but they create something more valuable for retention: daily micro-engagement with your existing audience that builds the sense of a direct relationship. Use Stories for polls, behind-the-scenes, soft CTAs, and community-building that converts passive followers into loyal ones.",
  },
  {
    q: "Is this Instagram content planner free to use?",
    a: "Yes — this Instagram Content Planner is completely free with no account required, no usage limits, and no premium tier. Enter your niche, target audience, posting frequency, primary goal, and content style, and the AI generates a complete 4-week content calendar with day-by-day posting plans, topic suggestions, hooks, post types, goals, and optimal posting times in seconds. The full calendar includes a separate Story plan with 3–5 ideas per week, experience-level-specific growth tips, and a 4-week narrative arc. You can copy any individual week to clipboard as formatted text ready for Notion, Google Docs, or your scheduling tool. Regenerate as many times as needed for fresh topic variations on the same structure, with no limits.",
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

export function InstagramContentPlannerTool() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [freq, setFreq] = useState("5");
  const [goal, setGoal] = useState("growth");
  const [style, setStyle] = useState("mixed");
  const [copied, setCopied] = useState(false);
  const { outputs, loading, error, run } = useAiTool("instagram-content-planner");
  const { toast } = useToast();

  const plan = outputs.join("\n");

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-ig-content-planner";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your Instagram niche.", variant: "destructive" });
      return;
    }
    run({ niche, audience, freq: Number(freq), goal, style, pillars: "education,entertainment,personal,tips" });
  };

  const copyPlan = () => {
    navigator.clipboard.writeText(plan);
    setCopied(true);
    toast({ title: "Content plan copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ── Tool Card ─────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="text-purple-500" size={22} />
          <h2 className="font-semibold text-lg">Instagram Content Planner</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={11} /> AI Powered
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Your Niche *</label>
            <Input placeholder="e.g. fitness, travel, food, fashion, business..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Target Audience</label>
            <Input placeholder="e.g. women 25-40, entrepreneurs, fitness beginners..." value={audience} onChange={e => setAudience(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Posts per Week</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={freq} onChange={e => setFreq(e.target.value)}>
                <option value="3">3 posts/week</option>
                <option value="5">5 posts/week</option>
                <option value="7">7 posts/week (daily)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Main Goal</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={goal} onChange={e => setGoal(e.target.value)}>
                <option value="growth">Grow Followers</option>
                <option value="engagement">Boost Engagement</option>
                <option value="sales">Drive Sales</option>
                <option value="brand">Build Brand</option>
                <option value="community">Build Community</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content Style</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={style} onChange={e => setStyle(e.target.value)}>
                <option value="mixed">Mixed (Reels + Carousels + Stories)</option>
                <option value="reels">Mostly Reels</option>
                <option value="carousel">Mostly Carousels</option>
                <option value="static">Static Posts</option>
              </select>
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Creating your plan with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Content Plan</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {plan && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your 4-Week Content Plan</h3>
            <Button variant="outline" size="sm" onClick={copyPlan}>
              {copied ? <><Check size={14} className="mr-1 text-green-500" />Copied!</> : <><Copy size={14} className="mr-1" />Copy Plan</>}
            </Button>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border max-h-[600px] overflow-y-auto">
            {plan}
          </pre>
        </Card>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Content Planner</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Select Your Niche, Audience & Content Pillars",
              desc: "Choose your content niche, describe your target audience (the more specific the better), and select 2–5 content pillars — Education, Entertainment, Personal, Tips, Promotion, Inspiration, Behind-the-Scenes, and Motivation. Each pillar will appear in rotation across your 4-week calendar.",
            },
            {
              step: 2,
              title: "Set Your Posting Frequency and Primary Goal",
              desc: "Choose how many posts per week you can realistically sustain: 3× (2 Reels + 1 Carousel), 5× (3 Reels + 1 Carousel + 1 Static), or 7× (4 Reels + 2 Carousels + 1 Static). Select your primary goal — Growth, Engagement, Sales, or Authority — to adjust posting times and content angles.",
            },
            {
              step: 3,
              title: "Get Your Complete 4-Week Calendar",
              desc: "A full 4-week calendar is generated with specific topics, hooks, post types, goals, and optimal posting times for every post. Each week has a strategic theme. A Story plan with 3–5 ideas per week is included separately, plus experience-level-specific growth tips.",
            },
            {
              step: 4,
              title: "Copy Weekly Plans and Use Them Directly",
              desc: "Use the Copy Plan button to export your calendar as formatted text — paste directly into Notion, Google Docs, or your scheduling tool. The format includes day, post type, topic, hook, goal, and time in plain text. Regenerate anytime for fresh topic variations on the same structure.",
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
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Content Planner — The Strategy That Powers Consistent Account Growth</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Content Planning Beats Posting on Inspiration
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram growth is not random. The accounts that grow consistently are almost never the
              ones with the most creative ideas or the most natural talent on camera. They are the ones
              with a system. Content planning is that system. When you know exactly what you're posting
              for the next 4 weeks — the format, the topic, the hook, the goal, and the time — you
              eliminate the two biggest productivity killers in content creation: decision fatigue and
              blank-page paralysis.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The second major benefit is audience trust. Your audience is constantly, subconsciously
              asking themselves whether following you is worth their attention. When your content is
              consistent, varied across formats, and covers predictable value-delivering topic
              categories, the answer stays yes. When your posting is sporadic, repetitive in format, or
              strategically directionless, follower trust erodes — even if individual posts are high
              quality. Instagram's algorithm reinforces this: accounts that post inconsistently receive
              progressively less distribution each time they go quiet and restart.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This planner generates a structured 4-week Instagram calendar that incorporates content
              type distribution, content pillar rotation, posting time optimisation based on goal and
              audience type, and experience-level-specific tips. Use the generated plan alongside the{" "}
              <Link href="/tools/instagram-reel-idea-generator" className="text-primary hover:underline font-medium">
                Reel Idea Generator
              </Link>{" "}
              and{" "}
              <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
                Caption Generator
              </Link>{" "}
              to fully build out each planned post before your batch filming session.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> The Content Type Distribution Strategy — Why 4 Formats Are Better Than 1
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Every Instagram format exists to serve a different stage of the audience relationship
              funnel — optimising only one format means optimising only one part of the funnel. Reels
              are the top-of-funnel format: they reach people who don't follow you through Instagram's
              recommendation algorithm, which surfaces Reels on Explore, in the dedicated Reels tab,
              and in non-followers' home feeds based on interest signals. The job of a Reel is to
              attract and convert new profile visitors into followers.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Carousels are the mid-funnel format — they deliver depth, build authority, and generate
              the two signals Instagram weights most heavily: saves and shares. A well-constructed
              carousel with 7–10 slides consistently achieves 3–5× more saves than a single static
              image on the same topic, and saves are the strongest signal Instagram uses to determine
              Explore eligibility. Stories are an entirely separate layer — they don't appear in feeds
              and aren't distributed to non-followers, but they generate daily micro-engagement with
              your existing audience that builds the sense of a direct relationship.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This planner distributes your posting schedule across Reels, Carousels, Static posts,
              and Stories at ratios optimised for your selected frequency and goal — so you're always
              working all parts of the funnel simultaneously, not accidentally over-indexing on one
              format at the expense of others.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This AI Instagram Content Planner Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "4-week content calendar with day-by-day posting plans — every post mapped with type, topic, hook, goal, and optimal posting time",
                "Smart content type distribution — 3×/week (2 Reels + 1 Carousel), 5×/week (3R + 1C + 1S), or 7×/week (4R + 2C + 1S)",
                "8 content pillars — Education, Entertainment, Personal, Promotion, Inspiration, Tips, Behind-the-Scenes, and Motivation — select 2–5",
                "4 primary goal modes — Growth, Engagement, Sales, Authority — each adjusts posting times, content angles, and week tips",
                "15 niches — Fitness, Beauty, Business, Finance, Tech/AI, Education, Food, Travel, Lifestyle, Fashion, and more",
                "Weekly Story plan — 3–5 specific Story ideas per week with format guidance for polls, Q&As, behind-the-scenes, and CTAs",
                "Experience-level-specific week tips — Beginner (consistency), Intermediate (hook testing), Advanced (funnel strategy)",
                "4-week narrative arc — Foundation (Week 1) → Value (Week 2) → Social Proof (Week 3) → Engagement & Growth Push (Week 4)",
                "Goal-specific growth tips — 5 strategic tips tailored to your selected goal",
                "Copy-ready week export — paste directly into Notion, Google Docs, or scheduling tools as formatted plain text",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips to Get the Most From Your Instagram Content Plan</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Treat your content calendar as a commitment, not a suggestion — consistency of posting frequency signals to the algorithm that your account is worth distributing, and irregular posting actively reduces your reach.",
            "Use the Copy Week output to build a batching session — write all captions for the week in one sitting, film all Reels in one session, edit and schedule in a third. Three focused sessions produce more than daily fragmented effort.",
            "Start with the 3×/week frequency if you're new to planning — sustainable consistency at lower volume outperforms high-frequency posting that burns you out in week two and creates a posting gap.",
            "Let the 4-week narrative arc guide your content sequencing — don't post a promotional Carousel in Week 1 before you've done the foundation content that earns enough audience trust to make a promotion land.",
            "Generate multiple rounds before choosing your calendar — the second and third generations often produce more targeted topic ideas as the AI draws from different framework combinations.",
            "Build your Story plan in parallel with your feed plan — Stories should complement and extend your feed posts, not duplicate them. Use Stories to share the behind-the-scenes of the content your feed posts are promoting.",
            "Align your posting times with your audience's active hours from Instagram Insights, not generic best-time recommendations — your specific audience may skew earlier or later than industry averages.",
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
            { name: "Instagram Reel Idea Generator", path: "/tools/instagram-reel-idea-generator", desc: "Fill your content calendar with high-performing Reel concepts tailored to your niche and audience." },
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Write the captions for every planned post — faster content execution means a more consistent schedule." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Generate the perfect hashtag sets to pair with each content type in your planned posting schedule." },
            { name: "Instagram Hook Generator", path: "/tools/instagram-hook-generator", desc: "Craft scroll-stopping first lines for each planned post to maximise saves, comments, and Explore reach." },
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
          <p className="text-sm text-foreground font-semibold mb-1">Plan is ready — now fill it with content.</p>
          <p className="text-sm text-muted-foreground">
            Use the{" "}
            <Link href="/tools/instagram-reel-idea-generator" className="text-primary hover:underline font-medium">
              Instagram Reel Idea Generator
            </Link>{" "}
            to develop specific filmable concepts for each Reel slot in your calendar, then use the{" "}
            <Link href="/tools/instagram-caption-generator" className="text-primary hover:underline font-medium">
              Instagram Caption Generator
            </Link>{" "}
            to write every caption before your batch filming session begins.
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
