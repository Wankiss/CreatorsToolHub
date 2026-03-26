import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Search, Sparkles, Youtube, Instagram, Music, Zap, ArrowRight, TrendingUp,
  CheckCircle2, Star, Clock, Lightbulb, BarChart2, Flame, ChevronRight, Quote
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolCard } from "@/components/tool-card";
import { useGetPopularTools, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const FEATURED_TOOLS = [
  {
    icon: <Youtube className="w-7 h-7" />,
    label: "YouTube",
    name: "YouTube Script Generator — Free",
    slug: "youtube-script-generator",
    benefit: "Stop staring at a blank page. Get a full, hook-to-CTA video script in seconds — structured for maximum watch time and designed to keep viewers hooked till the end.",
    outcome: "Scripts that retain viewers",
    tag: "Most popular",
  },
  {
    icon: <Flame className="w-7 h-7" />,
    label: "YouTube",
    name: "Viral Title Generator",
    slug: "youtube-title-generator",
    benefit: "Your title is the first thing the algorithm and your viewer judge. Generate click-worthy, SEO-optimized titles that actually get clicked — free, unlimited, instant.",
    outcome: "Higher click-through rates",
    tag: "Top pick",
  },
  {
    icon: <Lightbulb className="w-7 h-7" />,
    label: "YouTube",
    name: "Faceless YouTube Ideas Generator",
    slug: "youtube-video-idea-generator",
    benefit: "Find profitable faceless channel ideas in any niche — from finance to fitness. Get complete video concepts with hooks, titles, and monetization angles, all for free.",
    outcome: "Ready-to-film ideas instantly",
    tag: "For faceless channels",
  },
  {
    icon: <Music className="w-7 h-7" />,
    label: "TikTok",
    name: "TikTok Video Idea Generator",
    slug: "tiktok-viral-idea-generator",
    benefit: "Never run dry on TikTok content again. Generate scroll-stopping video concepts tailored to your niche, complete with hooks, captions, and trending hashtag strategies.",
    outcome: "Viral-ready TikTok content",
    tag: "Trending",
  },
];

const BENEFITS = [
  { icon: <Clock className="w-5 h-5 text-primary" />, text: "Save 5–10 hours every week on content planning and writing" },
  { icon: <Lightbulb className="w-5 h-5 text-primary" />, text: "Never run out of video ideas — generate unlimited concepts for any niche" },
  { icon: <Flame className="w-5 h-5 text-primary" />, text: "Create viral-ready content optimized for YouTube, TikTok, and Instagram" },
  { icon: <TrendingUp className="w-5 h-5 text-primary" />, text: "Grow your channel faster without hiring writers or spending on subscriptions" },
  { icon: <Zap className="w-5 h-5 text-primary" />, text: "Get AI-quality output instantly — no prompt engineering or learning curve" },
  { icon: <BarChart2 className="w-5 h-5 text-primary" />, text: "Stay consistent with content calendars, caption generators, and hashtag tools" },
  { icon: <CheckCircle2 className="w-5 h-5 text-primary" />, text: "100% free — no hidden fees, no subscriptions, no credit card, ever" },
  { icon: <Star className="w-5 h-5 text-primary" />, text: "Built for beginner creators — works on day one, no experience needed" },
];

const TESTIMONIALS = [
  {
    name: "Jordan K.",
    handle: "@jordancreates",
    platform: "YouTube · 24K subscribers",
    avatar: "J",
    color: "bg-red-500",
    text: "I was spending 3 hours planning each video. Now I use the YouTube Script Generator free tool and I'm done in 20 minutes. Honestly the best free creator tool I've found — and I've tried a lot.",
    stars: 5,
  },
  {
    name: "Priya M.",
    handle: "@priyaontiktok",
    platform: "TikTok · 61K followers",
    avatar: "P",
    color: "bg-pink-500",
    text: "The TikTok content generator on here is insane. I went from posting twice a week to posting every day — because planning takes me like 10 minutes now. And it's completely free, no signup. I tell every creator I know about this.",
    stars: 5,
  },
  {
    name: "Marcus T.",
    handle: "@facelessmarkus",
    platform: "Faceless YouTube · 8K subscribers",
    avatar: "M",
    color: "bg-violet-500",
    text: "I started a faceless YouTube channel 3 months ago. creatorsToolHub gave me all my channel ideas, titles, and scripts. I didn't know what niche to pick — the faceless YouTube ideas tool sorted that out in minutes. Free AI tools for creators don't get better than this.",
    stars: 5,
  },
];

const PAIN_POINTS = [
  { icon: "😩", text: "You've been staring at a blank page for an hour with no idea what to post." },
  { icon: "📉", text: "Your last 10 videos barely got views — and you're not sure why." },
  { icon: "⏳", text: "You spend more time planning and writing than actually creating." },
  { icon: "🔄", text: "You keep posting but feel stuck in the same loop — inconsistent, unmotivated, invisible." },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const { data: popularTools, isLoading: toolsLoading } = useGetPopularTools({ limit: 6 });
  const { data: categoriesData, isLoading: catsLoading } = useListCategories();
  const { data: blogData } = useListBlogPosts({ limit: 3 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  const getCategoryIcon = (slug: string) => {
    if (slug.includes('youtube')) return <Youtube className="w-6 h-6" />;
    if (slug.includes('tiktok')) return <Music className="w-6 h-6" />;
    if (slug.includes('instagram')) return <Instagram className="w-6 h-6" />;
    if (slug.includes('ai')) return <Zap className="w-6 h-6" />;
    return <Sparkles className="w-6 h-6" />;
  };

  return (
    <Layout>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background pt-20 pb-28">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="creatorsToolHub background"
            className="w-full h-full object-cover opacity-[0.12] mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/75 to-background" />
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>30+ Free Creator Tools — No Signup Required</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 leading-[1.1] text-balance">
              The Best <span className="gradient-text">Free Creator Tools</span> for YouTube, TikTok & Instagram
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed text-balance">
              Free AI tools for creators who want to grow faster — generate scripts, viral titles, hooks, captions, hashtags, and content ideas instantly. No subscription. No credit card. Ever.
            </p>

            <p className="text-sm font-semibold text-primary mb-10 tracking-wide uppercase">
              ✓ 100% Free &nbsp;·&nbsp; ✓ No Signup Required &nbsp;·&nbsp; ✓ Unlimited Use
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group flex items-center shadow-2xl shadow-primary/10 rounded-full bg-background border-2 border-primary/20 focus-within:border-primary transition-all p-2 mb-6">
              <Search className="absolute left-6 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search free creator tools (e.g. YouTube Script Generator)"
                className="w-full pl-14 pr-40 h-14 bg-transparent border-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" size="lg" className="absolute right-2 h-12 rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                Search Tools
              </Button>
            </form>

            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              {["YouTube Title Generator", "TikTok Viral Ideas", "AI Prompt Generator", "Instagram Hashtags", "Faceless YouTube Ideas"].map(q => (
                <button
                  key={q}
                  onClick={() => setLocation(`/search?q=${encodeURIComponent(q)}`)}
                  className="px-3 py-1.5 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border/50"
                >
                  {q}
                </button>
              ))}
            </div>

          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────── */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: "30+", label: "Free Content Creation Tools" },
              { stat: "100%", label: "Free — Always, No Exceptions" },
              { stat: "4", label: "Creator Platforms Covered" },
              { stat: "0", label: "Signup or Credit Card Required" },
            ].map(({ stat, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-3xl font-display font-bold text-primary">{stat}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ──────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5">
              Sound familiar?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every creator hits the same wall. The good news? It's not a talent problem — it's a tools problem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PAIN_POINTS.map(({ icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 bg-muted/40 rounded-2xl p-6 border border-border/50"
              >
                <span className="text-3xl mt-0.5 flex-shrink-0">{icon}</span>
                <p className="text-base text-foreground leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted-foreground mt-10 text-lg"
          >
            If any of that hit close to home — you're in the right place. Let's fix it.
          </motion.p>
        </div>
      </section>

      {/* ── SOLUTION SECTION ─────────────────────────────────── */}
      <section className="py-24 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary font-semibold text-sm mb-6 border border-primary/25">
              <Zap className="w-4 h-4" />
              <span>Meet your unfair advantage</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              Free AI Tools for Creators — <br className="hidden md:block" />
              <span className="gradient-text">Built for Growth</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              creatorsToolHub is your all-in-one hub of free AI-powered content creation tools. Whether you're building a faceless YouTube channel, growing on TikTok, or scaling your Instagram — every tool here is designed to help you create better content in a fraction of the time. And it's completely free — no plans, no paywalls, no limits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
              {[
                { icon: <Zap className="w-6 h-6 text-primary" />, title: "AI-Powered Results", desc: "Every tool uses advanced AI to generate professional-quality outputs instantly." },
                { icon: <CheckCircle2 className="w-6 h-6 text-primary" />, title: "Actually Free", desc: "No trial periods, no subscriptions, no hidden fees. Free today, free tomorrow." },
                { icon: <Sparkles className="w-6 h-6 text-primary" />, title: "Beginner-Friendly", desc: "Works from day one. No learning curve, no tech skills required." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-background rounded-2xl p-6 border border-border/60 shadow-sm">
                  <div className="mb-3">{icon}</div>
                  <h3 className="font-bold text-base mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED TOOLS ───────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5">
              Powerful Free Content Creation Tools
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              YouTube automation tools, TikTok content generators, and AI-powered prompts — all free, all instant.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {FEATURED_TOOLS.map((tool, i) => (
              <motion.div
                key={tool.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/tools/${tool.slug}`}>
                  <div className="group h-full bg-card border border-border/50 hover:border-primary/50 rounded-2xl p-7 flex flex-col gap-4 cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                        {tool.icon}
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex-shrink-0 self-start">
                        {tool.tag}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">{tool.label}</p>
                      <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors mb-3">{tool.name}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{tool.benefit}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1 rounded-full">
                          ✓ {tool.outcome}
                        </span>
                        <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Try free <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href="/search">Browse All Free Creator Tools <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES GRID ──────────────────────────────────── */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold font-display tracking-tight mb-2">Free Tools by Platform</h2>
            <p className="text-muted-foreground">Pick your platform and start creating — every tool is free and ready to use right now</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {catsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
              : categoriesData?.categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/category/${cat.slug}`}>
                    <div className="group bg-card border border-border/50 hover:border-primary/50 rounded-2xl p-6 flex items-center gap-5 cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                        {getCategoryIcon(cat.slug)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{cat.toolCount} free tools</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* ── AD SLOT ──────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-7xl py-10 flex justify-center">
        <div className="adsense-placeholder w-[728px] h-[90px]" />
      </div>

      {/* ── BENEFITS SECTION ─────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5">
                What changes when you use free AI tools for creators
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Content creators who use creatorsToolHub don't just save time — they create better content, more consistently, and grow faster. Here's the transformation:
              </p>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/search">Start Using Free Tools <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {BENEFITS.map(({ icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border/40"
                >
                  <div className="mt-0.5 flex-shrink-0">{icon}</div>
                  <p className="text-sm text-foreground leading-relaxed">{text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── POPULAR TOOLS ────────────────────────────────────── */}
      <section className="py-12 pb-24 bg-muted/20 border-y border-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold font-display tracking-tight mb-2 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-primary" /> Most Popular Free Creator Tools Right Now
              </h2>
              <p className="text-muted-foreground">The free content creation tools thousands of creators are using today</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex rounded-full">
              <Link href="/search">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
              : popularTools?.tools.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
          </div>

          <div className="mt-10 sm:hidden">
            <Button variant="outline" asChild className="w-full rounded-xl">
              <Link href="/search">View All Free Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5">
              Creators love these free tools
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Real feedback from real creators using creatorsToolHub every day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {TESTIMONIALS.map(({ name, handle, platform, avatar, color, text, stars }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-card border border-border/50 rounded-2xl p-7 flex flex-col gap-5 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <Quote className="w-8 h-8 text-primary/30" />
                <p className="text-sm text-foreground leading-relaxed flex-1">"{text}"</p>
                <div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: stars }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${color} text-white font-bold flex items-center justify-center text-sm flex-shrink-0`}>
                      {avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{name} <span className="text-muted-foreground font-normal">{handle}</span></p>
                      <p className="text-xs text-muted-foreground">{platform}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6 text-white">
              Start using free creator tools now
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              No signup. No credit card. No subscription. Just pick a tool and start creating viral-ready YouTube, TikTok, and Instagram content — completely free, right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-10 text-base font-bold h-14">
                <Link href="/category/youtube-tools">YouTube Tools — Free <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-10 text-base font-bold h-14 border-white/40 text-white hover:bg-white/10">
                <Link href="/category/tiktok-tools">TikTok Tools — Free <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
            </div>
            <p className="text-white/50 text-sm mt-8">
              Join thousands of content creators using creatorsToolHub at creatorstoolhub.com — 100% free, always.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── BLOG SECTION ─────────────────────────────────────── */}
      {blogData && blogData.posts.length > 0 && (
        <section className="py-24 bg-muted/20 border-y border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold font-display tracking-tight mb-2">Creator Growth Hub</h2>
                <p className="text-muted-foreground">Free guides on YouTube automation, TikTok content strategy, and growing your channel faster</p>
              </div>
              <Button variant="link" asChild className="text-primary hidden sm:flex">
                <Link href="/blog">Read more articles <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogData.posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all group cursor-pointer h-full flex flex-col">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex gap-2 mb-4">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold font-display mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4 mt-auto">
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span>{post.readingTime} min read</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SEO TEXT SECTION ─────────────────────────────────── */}
      <section className="py-16 bg-background border-t border-border/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-sm text-muted-foreground max-w-none space-y-4 text-center">
            <h2 className="text-xl font-bold font-display text-foreground not-prose">
              creatorsToolHub — Your Free AI Tools for Content Creation
            </h2>
            <p className="leading-relaxed">
              creatorsToolHub (creatorstoolhub.com) is the leading hub of free creator tools built for YouTubers, TikTok creators, Instagram influencers, and side hustlers who want to grow their audience without breaking the bank. Our platform offers 30+ free AI-powered tools including a YouTube script generator free to use, a viral title generator, TikTok content generator, faceless YouTube ideas generator, Instagram hashtag generator, AI prompt generator, Midjourney prompt generator, and many more content creation tools — all completely free with no signup required.
            </p>
            <p className="leading-relaxed">
              Whether you're searching for free AI tools for video creators, YouTube automation tools, free AI video creator tools, or TikTok viral content generators, creatorsToolHub has everything in one place. Our tools are designed for beginner and intermediate creators who want to save time, stay consistent, and create high-performing content across all major platforms. Use our free creator tools today and join thousands of creators who are growing faster with creatorsToolHub.
            </p>
          </div>
        </div>
      </section>

    </Layout>
  );
}
