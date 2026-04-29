import { Link } from "wouter";
import { useEffect } from "react";
import { useCanonical } from "@/hooks/use-canonical";
import { useSeoMeta } from "@/hooks/use-seo-meta";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Sparkles, Zap, Heart, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://creatorstoolhub.com";

const PILLARS = [
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Free — Always",
    desc: "Every tool on creatorsToolHub is completely free to use, with no subscription, no trial period, and no hidden fees. Our mission is to make professional-grade content tools accessible to every creator, regardless of budget.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    title: "AI-Powered",
    desc: "We use advanced AI to generate high-quality scripts, titles, captions, hashtags, hooks, and ideas — the kind of output that used to require hiring a copywriter or spending hours researching what works.",
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: "Built for Creators",
    desc: "We designed every tool specifically for content creators. Not marketers, not enterprises — YouTubers, TikTokers, Instagram creators, faceless channel builders, and side hustlers trying to turn their content into income.",
  },
  {
    icon: <Heart className="w-6 h-6 text-primary" />,
    title: "No Signup Required",
    desc: "We believe you shouldn't have to hand over your email address just to try a tool. Open any page, use any tool, copy your output and go. No account needed, ever.",
  },
];

const WHO_WE_SERVE = [
  "YouTubers — from first upload to 100K subscribers",
  "Faceless YouTube channel builders looking for profitable niche ideas",
  "TikTok creators who want to post consistently and stay on trend",
  "Instagram content creators building a personal brand or business",
  "Side hustlers monetizing content and growing an online income",
  "Beginner creators who don't know where to start",
  "Busy creators who need to cut their content planning time in half",
];

export default function About() {
  useCanonical("/about");

  useSeoMeta({
    title: "About creatorsToolHub — Free AI Tools for Content Creators",
    description:
      "creatorsToolHub is built by Immanuels — a content creator strategist who made 35+ free AI tools for YouTube, TikTok, and Instagram creators. No signup, no cost, ever.",
    path: "/about",
  });

  // Person + AboutPage JSON-LD schema
  useEffect(() => {
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Immanuels",
      "url": `${SITE_URL}/about`,
      "image": `${SITE_URL}/immanuels-avatar.png`,
      "jobTitle": "Founder & Content Creator Strategist",
      "description":
        "Content creator strategist and digital growth enthusiast. Founder of creatorsToolHub — a free AI-powered tools platform for YouTube, TikTok, and Instagram creators.",
      "worksFor": {
        "@type": "Organization",
        "name": "creatorsToolHub",
        "url": SITE_URL,
      },
      "sameAs": [
        "https://www.linkedin.com/in/immanuels",
        "https://twitter.com/creatorstoolhub",
      ],
      "knowsAbout": [
        "YouTube SEO",
        "TikTok growth strategies",
        "Instagram content marketing",
        "AI content creation",
        "Content creator monetization",
      ],
    };

    const aboutPageSchema = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About creatorsToolHub",
      "url": `${SITE_URL}/about`,
      "description":
        "creatorsToolHub is a free AI tools platform for content creators built by Immanuels, a content creator strategist and digital growth enthusiast.",
      "mainEntity": {
        "@type": "Person",
        "name": "Immanuels",
        "url": `${SITE_URL}/about`,
      },
    };

    const personScript = document.createElement("script");
    personScript.type = "application/ld+json";
    personScript.id = "about-person-ld";
    personScript.textContent = JSON.stringify(personSchema);
    document.head.appendChild(personScript);

    const pageScript = document.createElement("script");
    pageScript.type = "application/ld+json";
    pageScript.id = "about-page-ld";
    pageScript.textContent = JSON.stringify(aboutPageSchema);
    document.head.appendChild(pageScript);

    return () => {
      document.getElementById("about-person-ld")?.remove();
      document.getElementById("about-page-ld")?.remove();
    };
  }, []);

  return (
    <Layout>
      <div className="bg-background">
        {/* Hero */}
        <section className="py-20 bg-primary/5 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                <Sparkles className="w-4 h-4" />
                <span>Our Story</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
                About creatorsToolHub
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                I built the free creator tools platform I always wished existed. One place where any creator can generate professional content in minutes, completely free, with no subscription needed.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">
                  My Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  I built creatorsToolHub for one reason: to level the playing field for content creators. For too long, the best AI writing tools, title optimizers, and content generators have been locked behind expensive subscriptions that most beginner creators simply cannot afford.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  I believe every creator, whether you have 0 subscribers or 100,000, deserves access to the same powerful AI tools that help professionals create faster, smarter, and more consistently.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  creatorsToolHub now offers 35+ free AI-powered tools covering YouTube, TikTok, Instagram, and AI content creation. Every single one is free, unlimited, and requires no signup.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                  <p className="text-xl font-display font-bold text-foreground mb-4 leading-snug">
                    "Great content shouldn't be a privilege reserved for creators with big budgets."
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Nnaemeka Immanuels, Founder of creatorsToolHub
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-20 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">What We Stand For</h2>
              <p className="text-muted-foreground text-lg">Four principles that shape every decision we make</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PILLARS.map(({ icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-7 border border-border/50 flex gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">Who creatorsToolHub Is For</h2>
              <p className="text-muted-foreground text-lg">Our free AI tools for content creators are built for anyone making content online</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WHO_WE_SERVE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/40"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Overview */}
        <section className="py-20 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6 text-center">What creatorsToolHub Offers</h2>
            <div className="prose prose-slate max-w-none text-muted-foreground space-y-4">
              <p className="text-center text-lg leading-relaxed">
                creatorsToolHub (creatorstoolhub.com) is a free creator tools platform offering 30+ AI-powered tools across four major content categories:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8 not-prose">
                {[
                  { platform: "YouTube Tools", tools: "Title generator, script generator, description generator, tag generator, keyword generator, video idea generator, engagement calculator, money calculator, title analyzer, and more." },
                  { platform: "TikTok Tools", tools: "Viral idea generator, hook generator, script generator, caption generator, hashtag generator, bio generator, and more." },
                  { platform: "Instagram Tools", tools: "Caption generator, hashtag generator, hook generator, bio generator, reel idea generator, content planner, engagement calculator, and more." },
                  { platform: "AI Creator Tools", tools: "AI prompt generator for ChatGPT, Claude, and Gemini; Midjourney prompt generator for stunning AI visuals." },
                ].map(({ platform, tools }) => (
                  <div key={platform} className="bg-card rounded-2xl p-6 border border-border/50">
                    <h3 className="font-bold text-base mb-2 text-foreground">{platform}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tools}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">The Person Behind creatorsToolHub</h2>
              <p className="text-muted-foreground text-lg">Built by a creator, for creators.</p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl border border-border/50 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start"
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <img
                  src="/immanuels-avatar.png"
                  alt="Nnaemeka Immanuels, Founder of creatorsToolHub"
                  className="w-28 h-28 rounded-full object-cover border-4 border-primary/20"
                />
                <div className="text-center">
                  <p className="font-display font-bold text-foreground text-lg">Nnaemeka Immanuels</p>
                  <p className="text-xs text-muted-foreground font-medium">Founder, creatorsToolHub</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Hi, I'm Nnaemeka Immanuels. I've spent years studying the YouTube algorithm, TikTok's For You page, and Instagram's Reels distribution system. I've been deep in the data, testing what actually grows channels versus what creators only think works. There's a big difference, and most of the advice online gets it wrong.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  I built creatorsToolHub because I was genuinely frustrated. Every tool that actually helped, from scriptwriters to title optimisers to hashtag generators, was locked behind a subscription most beginner creators simply cannot afford. I knew the AI to build these tools existed, so I built them myself, made them completely free, and put them all in one place.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every tool on this platform is something I personally use or wish I'd had when I was starting out. The blog is where I share everything I've tested and learned. No filler, no recycled tips you've already read a hundred times. Just honest strategy from someone who has been in the trenches and knows what actually moves the needle.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-3xl font-display font-bold mb-5">Ready to create better content, for free?</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              No signup. No subscription. Just open a tool and start creating. creatorsToolHub is here whenever you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/search">Browse All Free Tools <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
