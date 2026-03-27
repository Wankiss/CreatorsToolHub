import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Clock, TrendingUp, Zap, Star } from "lucide-react";
import { format } from "date-fns";

const ALL_TAGS = [
  "All",
  "YouTube Growth",
  "TikTok Growth",
  "Instagram Growth",
  "AI Tools",
  "Content Ideas",
  "Free Tools",
  "Beginner Guide",
  "Strategy",
  "SEO",
  "Viral Content",
];

const TAG_ICONS: Record<string, React.ReactNode> = {
  "YouTube Growth": <TrendingUp className="w-3 h-3" />,
  "TikTok Growth": <Zap className="w-3 h-3" />,
  "AI Tools": <Star className="w-3 h-3" />,
};

export default function BlogList() {
  const [activeTag, setActiveTag] = useState("All");
  const { data, isLoading } = useListBlogPosts({ limit: 50 });

  const filtered = activeTag === "All"
    ? (data?.posts ?? [])
    : (data?.posts ?? []).filter(p => p.tags.includes(activeTag));

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/8 via-primary/4 to-background pt-24 pb-14 border-b border-border/60">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-primary/20">
            <BookOpen className="w-3.5 h-3.5" /> Creator Growth Blog
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4 text-foreground">
            Strategies & Tips to <span className="gradient-text">Grow Faster</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            In-depth guides on YouTube SEO, TikTok growth, Instagram strategy, and AI tools — written to help creators at every level get more views, more followers, and more income.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-12">
        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {TAG_ICONS[tag]} {tag}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No articles in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`}>
                <Card className="group mb-10 overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl bg-card cursor-pointer">
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {featured.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                          <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                            ⭐ Featured
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground group-hover:text-primary transition-colors mb-4 leading-tight">
                          {featured.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                          {featured.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium pt-6 border-t border-border/50">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <img src="/immanuels-avatar.png" alt="Immanuels" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                            {featured.author}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {featured.readingTime} min read
                          </span>
                          <span className="hidden sm:block">
                            {format(new Date(featured.publishedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <span className="text-primary flex items-center font-bold group-hover:translate-x-1 transition-transform">
                          Read Article <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                    {/* Decorative side panel */}
                    <div className="w-full lg:w-72 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center p-10 text-center border-t lg:border-t-0 lg:border-l border-border/30">
                      <div>
                        <div className="text-6xl mb-3">
                          {featured.tags.includes("YouTube Growth") ? "▶️" :
                           featured.tags.includes("TikTok Growth") ? "🎵" :
                           featured.tags.includes("Instagram Growth") ? "📸" :
                           featured.tags.includes("AI Tools") ? "🤖" : "✍️"}
                        </div>
                        <div className="text-sm font-semibold text-muted-foreground">{featured.tags[0]}</div>
                        <div className="mt-3 text-xs text-muted-foreground/70">{featured.readingTime} min read</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {/* Post Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="h-full flex flex-col group cursor-pointer overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl bg-card">
                      <div className="p-6 flex flex-col h-full">
                        {/* Category emoji accent */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {post.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-xl flex-shrink-0 ml-2">
                            {post.tags.includes("YouTube Growth") ? "▶️" :
                             post.tags.includes("TikTok Growth") ? "🎵" :
                             post.tags.includes("Instagram Growth") ? "📸" :
                             post.tags.includes("AI Tools") ? "🤖" : "✍️"}
                          </span>
                        </div>

                        <h2 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors mb-3 leading-snug line-clamp-2">
                          {post.title}
                        </h2>

                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs font-medium pt-4 border-t border-border/50 mt-auto text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {post.readingTime} min
                            </span>
                            <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                          </div>
                          <span className="text-primary flex items-center group-hover:translate-x-1 transition-transform text-sm font-semibold">
                            Read <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-16 text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-12">
              <h3 className="text-2xl font-bold font-display mb-3">Ready to Grow Your Channel?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Put these strategies into action with our 34+ free creator tools — built for YouTube, TikTok, Instagram, and AI content creation.
              </p>
              <Link href="/tools" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors">
                Explore Free Tools <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
