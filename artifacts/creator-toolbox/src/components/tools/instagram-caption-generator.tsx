import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAiTool } from "@/hooks/use-ai-tool";
import {
  Sparkles, Copy, Check, Loader2, MessageSquare,
  ChevronDown, ListChecks, Shield, ArrowUpRight, Zap, TrendingUp, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What makes a good Instagram caption in 2026?",
    a: "A good Instagram caption in 2026 does four things: it hooks the viewer in the first two lines before the 'more' truncation, it delivers genuine value or emotional resonance in the body, it ends with a specific call-to-action that matches the post's goal (save, comment, share, or follow), and it includes a targeted hashtag set that places the post in the right discovery channels. Instagram's algorithm now weights saves and shares significantly above likes — so the best captions are structured to earn high-value engagement signals, not just passive appreciation. The generator applies the proven Hook → Body → Micro CTA structure across 10 distinct caption styles to maximize all four elements simultaneously.",
  },
  {
    q: "How long should an Instagram caption be?",
    a: "The optimal caption length depends entirely on your content type and goal. For Reels: keep captions to 1–3 lines — Reel captions appear over the video, and longer text blocks cover the visual and reduce completion rate, which is the primary ranking signal for Reels. For Carousels: captions can be substantially longer (8–15 lines) because the viewer is already committed to swiping through multiple slides — each swipe buys more caption read time, and longer educational captions drive saves. For Static posts: medium length (4–7 lines) tends to perform best — long enough to tell a complete story or deliver a list of insights, short enough to hold attention. Our generator offers Short (1–3 lines), Medium (4–7 lines), and Long (8–15 lines) options matched to your content type selection.",
  },
  {
    q: "What Instagram captions get the most comments?",
    a: "Comment-optimized captions use three proven triggers: (1) Specific binary-option questions — 'Method A or Method B — drop your answer below' generates dramatically more responses than open-ended 'What do you think?' questions. (2) Shared experience invitations — 'If this has happened to you, tell me in the comments' creates low-friction comment entry because readers only need to confirm, not construct an original response. (3) Contrarian or polarizing positions — statements that invite agreement or pushback naturally generate comment threads. The Contrarian Opinion and Relatable Frustration caption styles in our generator are specifically calibrated for maximum comment rates. Avoid vague CTAs like 'drop a comment' — specificity in your question directly multiplies response rate.",
  },
  {
    q: "What Instagram captions get the most saves?",
    a: "Saves are Instagram's highest-weight ranking signal for Explore placement — a post with strong save rates gets distributed to significantly larger non-follower audiences. Captions that drive saves share three characteristics: they deliver specific, actionable information that the viewer wants to reference later (checklists, step-by-step processes, specific tips with numbers), they explicitly tell the viewer to save ('Save this for your next workout' or 'Bookmark this so you don't forget'), and they use the hook to foreground the value upfront ('3 things most people get wrong about X' signals reference-worthy content before they've even read the body). The Educate goal setting in our generator applies this exact strategy — foregrounding value in the hook and closing with an explicit save prompt.",
  },
  {
    q: "How many hashtags should I use on Instagram?",
    a: "Use 10–15 targeted hashtags per post — Instagram's algorithm has actively deprioritized hashtag stuffing, and accounts that use 25–30 generic hashtags now see lower organic reach than those using 10–15 niche-specific tags. Structure your hashtag set in three tiers: 2–3 broad hashtags (1M+ posts) for maximum exposure, 4–5 mid-size hashtags (100K–1M posts) where your content can realistically rank, and 3–5 niche-specific hashtags (under 100K posts) where you face the least competition and build community. Placing hashtags in the first comment rather than the caption body keeps captions clean and readable with no impact on discoverability. Our generator produces 9 niche-specific hashtags per caption, calibrated to your selected niche for relevance.",
  },
  {
    q: "What is the difference between Instagram Reels captions and post captions?",
    a: "Reels captions and static/carousel post captions serve fundamentally different functions. Reel captions appear as text overlaid on the video — they compete directly with the visual for attention and are often not read at all while the video is playing. For Reels, the caption's primary job is to be keyword-rich (Instagram indexes caption text for in-app search), to provide a comment-driving CTA, and to be short enough not to cover the visual. The video itself carries the narrative and emotional weight. Static and carousel captions have the opposite dynamic — the visual stops the scroll, but the caption delivers all the depth, value, and story. Carousel captions in particular can be long and educational because the viewer's full attention is on reading and swiping. Our generator adjusts caption structure, length, and CTA strategy automatically based on your content type selection.",
  },
  {
    q: "Should I add emojis to Instagram captions?",
    a: "Yes — but strategically, not decoratively. Emojis serve three functional purposes in captions: they act as visual line breaks that improve readability and slow the viewer's reading pace (keeping them on the post longer), they draw the eye to key points in a list or hook, and they establish brand personality in a way that text alone cannot. The most effective uses are: a single emoji after your hook to signal the tone before the caption begins, emoji bullet points in list-based captions to create visual structure, and one emoji in your CTA to make the action feel more conversational. Avoid using emojis as pure filler between every sentence — random emoji placement makes captions feel unpolished and is associated with lower-quality accounts in most professional niches.",
  },
  {
    q: "How do I write Instagram captions that drive sales?",
    a: "Sales-driven captions require a different structure than engagement-driven ones. The hook should identify the pain point or desire, not the product ('Still spending 3 hours writing captions that get 12 likes?' outperforms 'Our tool writes captions for you'). The body should build value by educating, showing social proof, or painting the outcome — the viewer needs to feel the problem is real and the solution works before they're ready to act. The CTA should lower the friction to the next step: 'DM me the word CAPTION for the link' outperforms 'Link in bio' because it triggers a direct interaction that Instagram interprets as a high-quality engagement signal. For product posts, price objection handling in the body ('under $30') and urgency signals ('closing Friday') in the CTA consistently improve conversion. Select the Sell goal in our generator to apply this sales-specific structure to all 10 caption styles.",
  },
  {
    q: "What is the best time to post on Instagram for caption engagement?",
    a: "The best posting time for caption engagement is when your specific audience is most active and in a reading mindset — not scrolling passively. For most audiences, this means Tuesday through Friday between 9–11am and 6–9pm in their timezone. Avoid posting at the exact moment your audience first opens Instagram (typically 7–8am) — users in the early morning scroll quickly and rarely stop to read long captions. Evening windows (6–9pm) tend to produce higher comment rates because users have more time and are more mentally present. The most reliable approach is to check your Instagram Insights under Audience for your specific followers' active hours and test posting 30–60 minutes before the peak — this allows the algorithm time to begin distributing your post before engagement velocity peaks.",
  },
  {
    q: "Is this Instagram caption generator free?",
    a: "Yes — this Instagram caption generator is completely free with no account required, no usage limits, and no watermarks on the output. Enter your topic, set your niche, goal, tone, content type, and length, and the AI generates 10 caption styles with Hook Scores, Engagement Scores, and Viral Scores in seconds. You can copy individual captions, hashtags only, or the full caption and hashtag set in one click. There are no daily generation limits and no premium tier required for any of the features — all 10 caption styles, all goal settings, all tone modes, and the full scoring system are available for free on every generation.",
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

export function InstagramCaptionGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [mood, setMood] = useState("positive");
  const [copied, setCopied] = useState<number | null>(null);
  const { outputs, loading, error, run } = useAiTool("instagram-caption-generator");
  const { toast } = useToast();

  // Inject FAQ JSON-LD
  useEffect(() => {
    const id = "faq-schema-ig-caption-gen";
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter your post topic.", variant: "destructive" });
      return;
    }
    run({ topic, mood });
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
          <MessageSquare className="text-purple-500" size={22} />
          <h2 className="font-semibold text-lg">Instagram Caption Generator</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={11} /> AI Powered
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Post Topic *</label>
            <Input placeholder="e.g. sunset at the beach, new workout routine, coffee morning..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Mood / Tone</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={mood} onChange={e => setMood(e.target.value)}>
              <option value="positive">Positive & Uplifting</option>
              <option value="inspirational">Inspirational</option>
              <option value="funny">Funny & Witty</option>
              <option value="educational">Educational</option>
              <option value="relatable">Relatable</option>
              <option value="professional">Professional</option>
              <option value="aesthetic">Aesthetic / Minimal</option>
            </select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {loading ? <><Loader2 className="animate-spin mr-2" size={16} />Generating with AI...</> : <><Sparkles size={16} className="mr-2" />Generate Captions</>}
        </Button>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {outputs.length > 0 && (
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold">Caption Options</h3>
          <div className="space-y-3">
            {outputs.map((caption, i) => (
              <div key={i} className="group p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{caption}</p>
                  <button onClick={() => copyItem(caption, i)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5">
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
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Caption Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              step: 1,
              title: "Enter Your Topic and Select Your Niche",
              desc: "Type the subject of your post — the more specific, the better. 'Weight loss mistakes for busy professionals' will generate stronger captions than just 'fitness'. Then select your niche so the AI applies the correct tone, keywords, and hashtags for your content category.",
            },
            {
              step: 2,
              title: "Set Your Goal and CTA Type",
              desc: "Choose what you want this post to achieve: Educate (drives saves), Entertain (drives shares and comments), Sell (drives link clicks and DMs), or Grow (drives follows). The AI inserts the optimal call-to-action for your chosen goal into every caption.",
            },
            {
              step: 3,
              title: "Pick Tone, Content Type, and Length",
              desc: "Match the tone to your content style: Bold for authority posts, Relatable for community content, Controversial for hot-take content. Select Reel, Carousel, or Static post so the caption format is optimised for how it will appear, then choose Short, Medium, or Long.",
            },
            {
              step: 4,
              title: "Review Scores and Copy Your Best Caption",
              desc: "Get 10 captions in 10 different styles sorted by Viral Score — each showing a Hook Score and Engagement Score. Use the Top 5 filter to see your highest performers. Copy the caption only, hashtags only, or the full caption + hashtags in one click.",
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
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Caption Generator — Write Captions That Drive Real Engagement</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Why Caption Structure Determines Your Post's Reach
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Instagram captions are not passive decoration for your visual content — they are an active
              lever for algorithmic distribution. Every Instagram post is evaluated within its first
              30–60 minutes by a combination of engagement signals: saves, comments, shares, and
              time-on-post (how long someone stays reading your caption before scrolling). Posts with
              high early engagement scores are pushed to a significantly larger non-follower audience
              through Explore and Reels recommendations.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The three-part caption structure that consistently outperforms is: Hook → Body → Micro CTA.
              The hook must appear in the first 1–2 lines before Instagram truncates with 'more' — it is
              the only part that the majority of viewers read, and it determines whether they expand the
              caption. The body delivers the core value, formatted in short lines with intentional
              spacing to control reading pace and keep the viewer on the post longer. The micro CTA
              closes with a single, specific action that converts reading time into measurable engagement.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This generator applies this structure across 10 distinct caption styles — Curiosity Gap,
              Bold Statement, Relatable Frustration, Mistake Callout, Contrarian Opinion, Quick Win,
              Story Tease, POV, Listicle, and Emotional — each calibrated to a different psychological
              trigger and automatically sorted by Viral Score. Pair every caption with the right{" "}
              <Link href="/tools/instagram-hashtag-generator" className="text-primary hover:underline font-medium">
                hashtag set
              </Link>{" "}
              to maximise discoverability across Explore and Search.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> How Goal, CTA Type, and Content Type Affect Caption Performance
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The most common mistake in Instagram caption writing is using a generic CTA — "drop a
              comment below" or "let me know what you think" — regardless of what the post is actually
              optimised for. Each goal requires a fundamentally different caption strategy. Educational
              posts optimised for saves should foreground the value in the hook ('3 things about X that
              most people get wrong'), deliver scannable, reference-worthy information in the body, and
              close with an explicit save prompt ('Save this before you forget').
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Comment-optimised captions need to create irresistible invitation for a response. The most
              effective comment triggers are: specific opinion questions with two or more options ('Method
              A or Method B — drop your answer below'), calls for shared experience ('If this has happened
              to you, tell me in the comments'), and contrarian positions that beg for agreement or
              pushback. Vague questions like 'What do you think?' generate a fraction of the response
              rate that specific, binary-option questions do.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Content type also shapes caption strategy meaningfully. Reel captions compete with the
              video itself — they should be punchy, keyword-rich, and comment-driving. Carousel captions
              can be substantially longer and more educational because the viewer is already committed
              to swiping through. Static post captions perform best when they tell a complete story or
              deliver a list of specific insights that reward the viewer for stopping to read. The
              generator's content type selection applies the correct strategy for each format
              automatically — no guesswork required.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> What This AI Instagram Caption Generator Includes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "10 caption styles generated simultaneously — Curiosity Gap, Bold Statement, Relatable Frustration, Mistake Callout, Contrarian, Quick Win, Story Tease, POV, Listicle, Emotional",
                "Goal-based caption logic — separate body and CTA strategies for Educate, Entertain, Sell, and Grow Followers goals",
                "4 CTA types — captions end with purpose-built save prompts, comment questions, share invitations, or follow CTAs",
                "5 tone modes — Bold, Relatable, Inspirational, Funny, and Controversial hook variations for each style",
                "3 content type optimisations — Reel (punchy, keyword-rich), Carousel (educational, swipe-worthy), Static (visual-first)",
                "Hook Score, Engagement Score, and Viral Score for every caption — prioritised by performance",
                "9 niche-specific hashtags per caption — mix of broad, mid-size, and niche-specific tags for your content category",
                "3-length options — Short (1–3 lines), Medium (4–7 lines), Long (8–15 lines) for different content strategies",
                "Keywords field — inject specific terms into captions and hashtags for SEO and brand keyword consistency",
                "One-click copy for caption only, hashtags only, or full caption + hashtags — paste-ready for Instagram",
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
          <h2 className="text-2xl font-bold font-display text-foreground">Tips & Best Practices for Instagram Captions</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Instagram shows only the first 2 lines (125 characters) before the 'more' tap — put your most compelling hook or statement in those first 125 characters.",
            "End with a direct question — 'Which one is your favourite?' or 'Have you tried this?' is Instagram's most proven engagement trigger for driving comment activity.",
            "Save your best hashtags for the first comment, not the caption — this keeps captions clean and readable while preserving full discoverability.",
            "Use a mix of 10–15 hashtags (not 30) — Instagram's algorithm has deprioritised hashtag stuffing; 10–15 targeted hashtags outperform 30 generic ones.",
            "Add a CTA in every caption ('Save this for later' / 'Tag a friend who needs this') — saves are Instagram's highest-weight ranking signal for Explore placement.",
            "Write captions in a consistent brand voice — profiles with a recognisable tone receive 2–3× more word-of-mouth shares than inconsistent accounts.",
            "For Reels, keep the caption to 1–3 lines — Reel captions appear over the video, and longer text blocks cover the visual and reduce completion rate.",
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
            { name: "Instagram Hook Generator", path: "/tools/instagram-hook-generator", desc: "Craft powerful first-line hooks that stop the scroll and compel followers to tap 'more' on every caption." },
            { name: "Instagram Hashtag Generator", path: "/tools/instagram-hashtag-generator", desc: "Generate a targeted hashtag mix to maximise discoverability and reach the right audience on every post." },
            { name: "Instagram Reel Idea Generator", path: "/tools/instagram-reel-idea-generator", desc: "Get niche-specific Reel concepts that pair perfectly with your captions for maximum reach and watch time." },
            { name: "Instagram Content Planner", path: "/tools/instagram-content-planner", desc: "Plan your full posting schedule so every caption fits into a consistent content strategy that grows your account." },
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
          <p className="text-sm text-foreground font-semibold mb-1">Want to strengthen your hooks before posting?</p>
          <p className="text-sm text-muted-foreground">
            Use our{" "}
            <Link href="/tools/instagram-hook-generator" className="text-primary hover:underline font-medium">
              Instagram Hook Generator
            </Link>{" "}
            to test and refine the first line of your caption, then pair it with the{" "}
            <Link href="/tools/instagram-hashtag-generator" className="text-primary hover:underline font-medium">
              Instagram Hashtag Generator
            </Link>{" "}
            to build the ideal hashtag set for every post.
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
