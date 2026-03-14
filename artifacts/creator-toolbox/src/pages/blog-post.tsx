import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetBlogPost } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useGetBlogPost(slug || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 max-w-3xl">
          <Skeleton className="h-6 w-32 mb-10" />
          <Skeleton className="h-12 w-full mb-6 rounded-xl" />
          <Skeleton className="h-6 w-3/4 mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The post you are looking for might have been removed or doesn't exist.</p>
          <Link href="/blog" className="text-primary font-bold hover:underline">← Back to Blog</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="pb-24">
        {/* Article Header */}
        <header className="pt-20 pb-16 border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-10">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to all articles
            </Link>
            
            <div className="flex gap-2 justify-center mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-8 text-balance leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-foreground">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </div>
            </div>
          </div>
        </header>

        {/* Content & Sidebar Layout */}
        <div className="container mx-auto px-4 max-w-6xl py-12 flex flex-col lg:flex-row gap-16">
          <div className="flex-1 max-w-3xl prose prose-lg prose-gray dark:prose-invert prose-headings:font-display prose-a:text-primary hover:prose-a:text-primary/80 mx-auto lg:mx-0">
            {/* Lead paragraph */}
            <p className="lead text-xl text-muted-foreground mb-10 border-l-4 border-primary pl-6">
              {post.excerpt}
            </p>

            <div className="adsense-placeholder w-full h-[280px] my-10" />

            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            
            <div className="mt-16 pt-8 border-t border-border">
              <h4 className="font-bold mb-4">Share this article</h4>
              <div className="flex gap-3">
                <button className="bg-card border border-border hover:bg-muted p-2 rounded-lg transition-colors">Twitter</button>
                <button className="bg-card border border-border hover:bg-muted p-2 rounded-lg transition-colors">LinkedIn</button>
                <button className="bg-card border border-border hover:bg-muted p-2 rounded-lg transition-colors">Facebook</button>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Ad */}
          <aside className="w-full lg:w-[300px] flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div className="bg-muted/30 p-6 rounded-2xl border border-border text-center">
                <h3 className="font-bold font-display text-xl mb-3">Want more tips?</h3>
                <p className="text-sm text-muted-foreground mb-6">Join 10,000+ creators getting our weekly growth newsletter.</p>
                <input type="email" placeholder="Your email address" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <button className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
                  Subscribe Free
                </button>
              </div>
              <div className="adsense-placeholder w-[300px] h-[600px]" />
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
}
