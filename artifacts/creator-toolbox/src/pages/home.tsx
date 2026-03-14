import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Sparkles, Youtube, Instagram, Music, Zap, Image as ImageIcon, Type, ArrowRight, TrendingUp } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolCard } from "@/components/tool-card";
import { useGetPopularTools, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    switch (slug) {
      case 'youtube': return <Youtube className="w-6 h-6" />;
      case 'tiktok': return <Music className="w-6 h-6" />;
      case 'instagram': return <Instagram className="w-6 h-6" />;
      case 'ai': return <Zap className="w-6 h-6" />;
      case 'image': return <ImageIcon className="w-6 h-6" />;
      case 'text': return <Type className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Abstract Background" 
            className="w-full h-full object-cover opacity-[0.15] dark:opacity-30 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-5xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>30+ Free Tools for Content Creators</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 text-balance leading-tight">
              Grow your audience with <span className="gradient-text">AI-Powered</span> Creator Tools
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
              Generate titles, descriptions, scripts, and ideas instantly. Everything you need to optimize your YouTube, TikTok, and Instagram content.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group flex items-center shadow-2xl shadow-primary/10 rounded-full bg-background border-2 border-primary/20 focus-within:border-primary transition-all p-2">
              <Search className="absolute left-6 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="text" 
                placeholder="What do you want to create? (e.g. YouTube Title Generator)" 
                className="w-full pl-14 pr-32 h-14 bg-transparent border-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" size="lg" className="absolute right-2 h-12 rounded-full px-8 font-semibold text-md shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                Search Tools
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold font-display tracking-tight mb-2">Browse by Platform</h2>
              <p className="text-muted-foreground">Find the perfect tool for your favorite network</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catsLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            ) : categoriesData?.categories.map((cat, i) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/category/${cat.slug}`}>
                  <div className="group bg-card border border-border/50 hover:border-primary/50 rounded-2xl p-6 flex items-center gap-6 cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      {getCategoryIcon(cat.slug)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cat.toolCount} tools available</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* In-feed AdSense Placeholder */}
      <div className="container mx-auto px-4 max-w-7xl py-12 flex justify-center">
        <div className="adsense-placeholder w-[728px] h-[90px]" />
      </div>

      {/* Popular Tools */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold font-display tracking-tight mb-2 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-primary" /> Most Popular Tools
              </h2>
              <p className="text-muted-foreground">The tools creators are using right now</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex rounded-full">
              <Link href="/search">View All Tools <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
            ) : popularTools?.tools.map((tool, i) => (
              <motion.div 
                key={tool.id}
                initial={{ opacity: 0, scale: 0.95 }}
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
              <Link href="/search">View All Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Teaser */}
      {blogData && blogData.posts.length > 0 && (
        <section className="py-24 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold font-display tracking-tight mb-2">Creator Growth Hub</h2>
                <p className="text-muted-foreground">Tips, tricks, and strategies to go viral</p>
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
                        {post.tags.slice(0,2).map(tag => (
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
    </Layout>
  );
}
