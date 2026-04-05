import { useState } from "react";
import { Link } from "wouter";
import { useCanonical } from "@/hooks/use-canonical";
import { Layout } from "@/components/layout";
import { useListBlogPosts } from "@workspace/api-client-react";
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

const TAG_GRADIENT: Record<string, string> = {
  "YouTube Growth":   "from-red-500/20 via-rose-500/10 to-orange-400/10",
  "TikTok Growth":    "from-pink-500/20 via-fuchsia-500/10 to-purple-400/10",
  "Instagram Growth": "from-purple-500/20 via-pink-500/10 to-rose-400/10",
  "AI Tools":         "from-blue-500/20 via-indigo-500/10 to-violet-400/10",
  "SEO":              "from-green-500/20 via-emerald-500/10 to-teal-400/10",
  "Viral Content":    "from-amber-500/20 via-orange-500/10 to-yellow-400/10",
};

const TAG_EMOJI: Record<string, string> = {
  "YouTube Growth":   "▶️",
  "TikTok Growth":    "🎵",
  "Instagram Growth": "📸",
  "AI Tools":         "🤖",
  "SEO":              "🔍",
  "Viral Content":    "🚀",
  "Strategy":         "🎯",
  "Content Ideas":    "💡",
  "Free Tools":       "🛠️",
  "Beginner Guide":   "🌱",
};

function getPostEmoji(tags: string[]) {
  for (const tag of tags) {
    if (TAG_EMOJI[tag]) return TAG_EMOJI[tag];
  }
  return "✍️";
}

function getPostGradient(tags: string[]) {
  for (const tag of tags) {
    if (TAG_GRADIENT[tag]) return TAG_GRADIENT[tag];
  }
  return "from-primary/15 via-primary/8 to-background";
}

function PostCoverFallback({ tags, className = "" }: { tags: string[]; className?: string }) {
  const gradient = getPostGradient(tags);
  const emoji = getPostEmoji(tags);
  return (
    <div className={`bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="relative text-center">
        <div className="text-5xl mb-2 drop-shadow-sm">{emoji}</div>
        <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{tags[0] ?? "Article"}</div>
      </div>
    </div>
  );
}

export default function BlogList() {
  useCanonical("/blog");
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
          <div className="space-y-8">
            <Skeleton className="h-80 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No articles in this category yet.</p>
          </div>
        ) : (
          <>
            {/* ── Featured Post ── */}
            {featured && (
              <Link href={`/blog/${featured.slug}`}>
                <div className="group mb-10 overflow-hidden rounded-2xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/8 transition-all duration-300 cursor-pointer">
                  <div className="flex flex-col md:flex-row min-h-[280px]">
                    {/* Image — left on md+, top on mobile */}
                    <div className="w-full md:w-[340px] lg:w-[420px] flex-shrink-0 order-first">
                      {featured.coverImage ? (
                        <img
                          src={featured.coverImage}
                          alt={featured.title}
                          className="w-full h-56 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <PostCoverFallback tags={featured.tags} className="h-56 md:h-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-7 sm:p-9 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {featured.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                            ⭐ Featured
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground group-hover:text-primary transition-colors mb-4 leading-tight">
                          {featured.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3 text-base">
                          {featured.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm font-medium pt-6 mt-6 border-t border-border/50">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <img src="/immanuels-avatar.png" alt={featured.author} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
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
                        <span className="text-primary flex items-center font-bold group-hover:translate-x-1 transition-transform whitespace-nowrap">
                          Read Article <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Post Grid ── */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <div className="group h-full flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer">

                      {/* Cover image */}
                      <div className="flex-shrink-0 h-48 overflow-hidden">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <PostCoverFallback tags={post.tags} className="h-full" />
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h2 className="text-lg font-bold font-display text-foreground group-hover:text-primary transition-colors mb-2.5 leading-snug line-clamp-2">
                          {post.title}
                        </h2>

                        <p className="text-muted-foreground text-sm line-clamp-3 flex-1 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs font-medium pt-4 mt-4 border-t border-border/50 text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {post.readingTime} min
                            </span>
                            <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                          </div>
                          <span className="text-primary flex items-center gap-0.5 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
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
