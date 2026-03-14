import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function BlogList() {
  const { data, isLoading } = useListBlogPosts({ limit: 20 });

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background pt-24 pb-16 border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 text-primary shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4 text-foreground">
            Creator <span className="gradient-text">Growth Blog</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, strategies, and tips to grow your audience and build a sustainable creator business.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
          ) : data?.posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full flex flex-col group cursor-pointer overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl bg-card">
                <div className="p-6 sm:p-8 flex flex-col h-full relative">
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h2 className="text-2xl font-bold font-display text-foreground group-hover:text-primary transition-colors mb-4 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm font-medium pt-5 border-t border-border/50 mt-auto">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-400" />
                      {post.author}
                    </div>
                    <span className="text-primary flex items-center group-hover:translate-x-1 transition-transform">
                      Read <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
