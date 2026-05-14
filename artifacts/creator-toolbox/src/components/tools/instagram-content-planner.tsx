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
    a: "An Instagram content planner is a structured system that maps out what you will post, when you will post it, and what goal each post is designed to achieve, typically over a 4-week period. Without a plan, most creators fall into reactive posting: creating whatever feels relevant that day, then going silent when inspiration runs out. This burst-and-drought pattern is one of the primary reasons accounts plateau, Instagram's algorithm actively deprioritises accounts that post inconsistently, reducing their reach each time they go quiet. A content planner solves this by eliminating the daily creative decision of what to post and replacing it with execution. When you know every post for the next 4 weeks, the format, the topic, the hook, the goal, and the optimal posting time, you stop spending creative energy on planning and spend it entirely on creating. The result is higher output, more consistent quality, and the algorithmic benefit of sustained posting frequency.",
  },
  {
    q: "How many times should I post on Instagram per week in 2026?",
    a: "The right posting frequency depends on your current stage. For accounts in growth mode (under 10K followers), 5 posts per week, structured as 3 Reels, 1 Carousel, and 1 Static post, provides the optimal balance of Reel-driven discoverability and depth content that earns saves and shares. Posting fewer than 3 times per week at this stage significantly reduces algorithmic distribution opportunities. For accounts in the 10K–100K range, 4–5 posts per week with a higher proportion of Carousels (which generate saves) and Reels (which generate reach) tends to produce stronger engagement rates than pure volume. For larger accounts (100K+), quality and strategy matter more than frequency, 3–4 highly targeted posts per week typically outperform 7 average ones. The planner offers three frequency tiers: 3×/week (2 Reels + 1 Carousel), 5×/week (3 Reels + 1 Carousel + 1 Static), and 7×/week (4 Reels + 2 Carousels + 1 Static).",
  },
  {
    q: "What should be in an Instagram content calendar?",
    a: "A complete Instagram content calendar should include six elements for every post: (1) Day and date, the scheduled publishing day with optimal posting time based on your audience's active hours. (2) Post type, Reel, Carousel, Static, or Story, since each format serves a different stage of the audience funnel. (3) Topic, the specific subject of the post, detailed enough to film or write without additional planning. (4) Hook, the opening line or visual that stops the scroll, the single biggest determinant of whether the content gets distributed. (5) Goal, the primary objective for this post (reach new followers, earn saves, drive comments, generate sales intent, or build authority). (6) Content pillar, the category the post belongs to (Education, Entertainment, Personal, Tips, Promotion) to ensure variety across your posting schedule. This planner generates all six elements for every post across 4 weeks, plus a Story plan and weekly strategic tips.",
  },
  {
    q: "What are content pillars on Instagram and how many should I have?",
    a: "Content pillars are the recurring topic categories that define what your account covers, the repeating subjects that your audience expects and that give your account a predictable identity. Examples include: Education (teaching skills or information), Entertainment (engaging storytelling or humour), Personal (behind-the-scenes, personal journey), Tips (actionable advice in your niche), Promotion (products, services, or offers), Inspiration (motivational or aspirational content), and Behind-the-Scenes (process, workspace, or day-in-the-life content). For most creators, 3–5 pillars is the optimal range. Fewer than 3 makes content feel repetitive; more than 5 makes the account identity unclear. Pillars solve the most common Instagram posting problem, running out of ideas, by creating a recurring structure you draw from rather than starting from zero every time. Select 2–5 pillars in this planner and each will appear in rotation across your 4-week calendar.",
  },
  {
    q: "What is the best Instagram posting time in 2026?",
    a: "The best Instagram posting time depends on your specific audience, not generic industry benchmarks. Instagram's own guidance, documented in the Professional Dashboard, directs creators to check the Audience section under Insights to find when their particular followers are most active. The path is: Professional Dashboard → Total Followers → Most Active Times. This shows you hour-by-hour and day-by-day activity for your account specifically, which is more reliable than any third-party average because it reflects your actual follower base rather than a composite of all Instagram users. Morning windows generally see more deliberate browsing behaviour, while evening windows tend to see higher comment activity, but your own Insights data should always override general guidance. This planner generates goal-optimised posting times as a starting point; adjust them to match your Professional Dashboard data once you have at least 90 days of posting history.",
  },
  {
    q: "What type of content performs best on Instagram in 2026?",
    a: "In 2026, the three highest-performing content types on Instagram serve different objectives and should be used in combination rather than isolation. Reels generate the most reach, they are the primary format through which Instagram distributes content to non-followers via Explore, the Reels tab, and interest-based home feed recommendations, as documented in Meta's Transparency Center Reels ranking documentation. Carousels generate strong saves and shares, they are well-suited for educational content, step-by-step guides, and list posts, and tend to earn meaningfully more saves than static posts on equivalent topics because viewers save them for future reference. Saves are among the engagement signals Instagram uses to determine Explore eligibility. Stories generate the strongest existing-audience relationships, polls, question boxes, and behind-the-scenes updates create daily micro-touchpoints that convert passive followers into engaged community members. This planner distributes your posting schedule across all three formats at ratios optimised for your selected goal.",
  },
  {
    q: "How do I use content pillars to plan an Instagram calendar?",
    a: "Using content pillars to plan a calendar involves three steps: (1) Select 3–5 pillars that reflect the recurring value categories your account delivers, for a fitness account this might be Workout Tips, Nutrition Education, Personal Journey, and Motivation. (2) Assign each week's posts to specific pillars so that no single week is dominated by one category, a week with 5 posts might include 2 Tips, 1 Personal, 1 Education, and 1 Promotion. (3) Match content types to pillars strategically, Educational pillar content works best as Carousels (for saves), Entertainment and Personal pillar content works best as Reels (for reach and connection), and Promotion pillar content works best as either a Reel or Carousel with explicit offer framing. This planner automates all three steps, enter your pillars, and the AI generates a 4-week calendar with posts rotated across your selected categories, balanced across formats, and matched to your goal.",
  },
  {
    q: "How do I batch create Instagram content efficiently?",
    a: "Batch content creation is the production strategy that enables consistent Instagram posting without the daily time investment that burns most creators out. The process has four phases: (1) Plan, use this planner to generate your 4-week calendar before you create anything. (2) Script and write, dedicate one session to writing hooks, captions, and talking points for all posts of the same type. Writing 5 Reel scripts in one sitting takes 45 minutes; writing 1 Reel script per day for 5 days takes the same total time but with 4× more setup and context-switching cost. (3) Film, group all talking-head Reels in one filming session, all B-Roll in another. A 5-Reel filming session takes 60–90 minutes; filming 1 Reel per day across 5 days takes the same footage time but each setup adds 15–20 minutes of preparation. (4) Edit and schedule, edit all content of the same type in a single editing session and schedule through your preferred tool. The planner's Copy Week feature exports formatted weekly plans directly to Notion, Google Docs, or scheduling tools for this exact workflow.",
  },
  {
    q: "What is the difference between Reels, Carousels, and Stories for strategy?",
    a: "Each Instagram format serves a distinct role in the audience relationship funnel and should be used for different strategic objectives. Reels are the top-of-funnel format, their primary job is reach and discoverability. Meta's Transparency Center documents that Instagram surfaces Reels to non-followers through Explore, the Reels tab, and interest-based feed recommendations based on watch-through and engagement signals. Use Reels when your goal is attracting new followers, maximising impressions, or reaching new audiences in your niche. Carousels are the mid-funnel format, their primary job is depth, authority, and save-driving. A well-structured 7–10 slide carousel delivers more value than a single post on the same topic and earns meaningfully more saves because viewers bookmark multi-slide posts for future reference. Use Carousels for educational content, step-by-step guides, and list posts. Stories are the relationship layer, they don't reach non-followers and don't generate saves or shares, but they create something more valuable for retention: daily micro-engagement with your existing audience that builds the sense of a direct relationship. Use Stories for polls, behind-the-scenes, soft CTAs, and community-building that converts passive followers into loyal ones.",
  },
  {
    q: "Is this Instagram content planner free to use?",
    a: "Yes, this Instagram Content Planner is completely free with no account required, no usage limits, and no premium tier. Enter your niche, target audience, posting frequency, primary goal, and content style, and the AI generates a complete 4-week content calendar with day-by-day posting plans, topic suggestions, hooks, post types, goals, and optimal posting times in seconds. The full calendar includes a separate Story plan with 3–5 ideas per week, experience-level-specific growth tips, and a 4-week narrative arc. You can copy any individual week to clipboard as formatted text ready for Notion, Google Docs, or your scheduling tool. Regenerate as many times as needed for fresh topic variations on the same structure, with no limits.",
  },
  {
    q: "What does Instagram officially recommend for content planning and posting frequency?",
    a: "Instagram's official creator guidance is published at creators.instagram.com, a dedicated resource hub maintained by Instagram covering content formats, growth strategy, and monetisation. The platform's consistent position, reinforced through Adam Mosseri (Head of Instagram) in his public communications, is that consistency matters for account growth and that using multiple formats (Reels for reach, Carousels for saves, Stories for relationship-building) serves different distribution surfaces simultaneously. For posting times specifically, Instagram's own recommended method, documented in the Professional Dashboard, is to check the Most Active Times section under Insights → Total Followers rather than relying on third-party averages, because your audience's peak activity hours vary by account, niche, and geography. Instagram does not publish an official recommended posting frequency, but its general guidance for creators focuses on sustainable consistency over volume.",
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
              desc: "Choose your content niche, describe your target audience (the more specific the better), and select 2–5 content pillars, Education, Entertainment, Personal, Tips, Promotion, Inspiration, Behind-the-Scenes, and Motivation. Each pillar will appear in rotation across your 4-week calendar.",
            },
            {
              step: 2,
              title: "Set Your Posting Frequency and Primary Goal",
              desc: "Choose how many posts per week you can realistically sustain: 3× (2 Reels + 1 Carousel), 5× (3 Reels + 1 Carousel + 1 Static), or 7× (4 Reels + 2 Carousels + 1 Static). Select your primary goal, Growth, Engagement, Sales, or Authority, to adjust posting times and content angles.",
            },
            {
              step: 3,
              title: "Get Your Complete 4-Week Calendar",
              desc: "A full 4-week calendar is generated with specific topics, hooks, post types, goals, and optimal posting times for every post. Each week has a strategic theme. A Story plan with 3–5 ideas per week is included separately, plus experience-level-specific growth tips.",
            },
            {
              step: 4,
              title: "Copy Weekly Plans and Use Them Directly",
              desc: "Use the Copy Plan button to export your calendar as formatted text, paste directly into Notion, Google Docs, or your scheduling tool. The format includes day, post type, topic, hook, goal, and time in plain text. Regenerate anytime for fresh topic variations on the same structure.",
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
          <h2 className="text-2xl font-bold font-display text-foreground">About This Instagram Content Planner</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> What This Instagram Content Planner Does
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Creators who post consistently 4–7 times per week see significantly higher reach than
              irregular posters, according to{" "}
              <a href="https://later.com/blog/instagram-stats/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Later's 2024 Instagram Report
              </a>
              . This planner generates a complete 4-week Instagram content calendar with post types,
              hooks, content pillars, goals, and optimal posting times, so you never start a week
              not knowing what you're posting.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Enter your niche, target audience, posting frequency (3, 5, or 7 posts per week), primary
              goal, and content style. The AI builds your full calendar. Every post gets a specific
              topic, a proven hook format, a content type (Reel, Carousel, Static), a goal, and an
              optimal posting time. A separate Story plan with 3–5 ideas per week is included. You can
              copy any week as formatted text, ready to paste into Notion or a scheduling tool.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Use this planner alongside the{" "}
              <Link href="/tools/instagram-reel-idea-generator" className="text-primary hover:underline font-medium">
                Reel Idea Generator
              </Link>{" "}
              to develop filmable Reel concepts for each slot, and the{" "}
              <Link href="/tools/instagram-hashtag-generator" className="text-primary hover:underline font-medium">
                Hashtag Generator
              </Link>{" "}
              to prep your hashtag sets before your batch filming session.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Why Posting Consistency Beats Posting Quality
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              It sounds counterintuitive. But the data is clear. Instagram's algorithm, documented in
              Meta's{" "}
              <a href="https://transparency.fb.com/features/ranking-and-content/type-of-content/instagram-feed/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Transparency Center
              </a>{" "}
             , distributes content based on engagement signals from each post. Accounts that post
              inconsistently receive less initial distribution each time they restart. The algorithm
              treats regular posting as a signal that you're an active, reliable creator worth
              recommending.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Consistency also compounds. Each Reel you post becomes a permanent discovery asset.
              A post that performs well today keeps attracting profile visits next month. A creator
              who posts 5x per week for 6 months has 130 discovery assets working in parallel.
              One who posts 5x total has 5. That difference in surface area is why consistency
              outperforms isolated viral attempts every time.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The practical blocker is planning. Most creators don't fail because they lack ideas.
              They fail because they show up on filming day with no structure and burn creative energy
              deciding what to make instead of making it. A 4-week calendar solves this. You decide
              once, batch-create for a session, and execute without the daily decision tax.
            </p>
          </div>

          {/* YouTube embed */}
          <figure style={{margin:"1rem 0 2rem",position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:"12px"}}>
            <iframe style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}}
              srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href='https://www.youtube.com/embed/6BNMnQOxVWA?autoplay=1'><img src='https://img.youtube.com/vi/6BNMnQOxVWA/maxresdefault.jpg' alt='Instagram Content Planning Strategy 2025'><span>&#9654;</span></a>"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Instagram Content Planning Strategy 2025"
              aria-label="Video tutorial on building an Instagram content planning strategy that drives consistent growth in 2025"
            ></iframe>
            <noscript><a href="https://www.youtube.com/watch?v=6BNMnQOxVWA" target="_blank" rel="noopener">Watch: Instagram Content Planning Strategy 2025 on YouTube</a></noscript>
          </figure>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Benefits of Using This Instagram Content Planner
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "4-week calendar with day-by-day posts, every slot mapped with topic, hook, format, goal, and posting time",
                "3 posting frequency options (3x, 5x, or 7x per week): each with the optimal Reel/Carousel/Static split",
                "8 content pillars to choose from, rotate Education, Tips, Personal, Promotion, Inspiration, and more",
                "4 goal modes (Growth, Engagement, Sales, Authority): each shifts posting times and content angles",
                "Weekly Story plan included, 3–5 specific Story ideas per week with format guidance",
                "4-week narrative arc built in, Foundation, Value, Social Proof, and Engagement Push in sequence",
                "Experience-level tips per week, Beginner, Intermediate, and Advanced guidance built into every plan",
                "Copy-ready week export, paste formatted text straight into Notion, Google Docs, or scheduling tools",
                "15 supported niches, calendar topics calibrated to your specific content category",
                "Free, unlimited, no signup, regenerate for fresh topic variations whenever you start a new content cycle",
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
          Creators who post consistently 4–7 times per week see significantly higher Instagram reach
          than irregular posters, per{" "}
          <a href="https://later.com/blog/instagram-stats/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Later's 2024 Instagram Report
          </a>
          . Meta's{" "}
          <a href="https://transparency.fb.com/features/ranking-and-content/type-of-content/instagram-feed/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Transparency Center
          </a>{" "}
          confirms that Instagram's algorithm uses engagement signals to determine whether to expand
          post distribution beyond the initial audience, meaning posting frequency and format
          strategy directly affect organic reach. Instagram's Professional Dashboard shows audience
          peak-activity hours under Total Followers in Insights.
        </p>
      </div>

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
            "Treat your content calendar as a commitment, not a suggestion, consistency of posting frequency signals to the algorithm that your account is worth distributing, and irregular posting actively reduces your reach.",
            "Use the Copy Week output to build a batching session, write all captions for the week in one sitting, film all Reels in one session, edit and schedule in a third. Three focused sessions produce more than daily fragmented effort.",
            "Start with the 3×/week frequency if you're new to planning, sustainable consistency at lower volume outperforms high-frequency posting that burns you out in week two and creates a posting gap.",
            "Let the 4-week narrative arc guide your content sequencing, don't post a promotional Carousel in Week 1 before you've done the foundation content that earns enough audience trust to make a promotion land.",
            "Generate multiple rounds before choosing your calendar, the second and third generations often produce more targeted topic ideas as the AI draws from different framework combinations.",
            "Build your Story plan in parallel with your feed plan, Stories should complement and extend your feed posts, not duplicate them. Use Stories to share the behind-the-scenes of the content your feed posts are promoting.",
            "Align your posting times with your audience's active hours from Instagram Insights, not generic best-time recommendations, your specific audience may skew earlier or later than industry averages.",
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
            { name: "Instagram Caption Generator", path: "/tools/instagram-caption-generator", desc: "Write the captions for every planned post, faster content execution means a more consistent schedule." },
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
          <p className="text-sm text-foreground font-semibold mb-1">Plan is ready, now fill it with content.</p>
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
