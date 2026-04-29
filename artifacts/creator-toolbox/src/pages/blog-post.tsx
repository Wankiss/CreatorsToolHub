import { useParams, Link } from "wouter";
import { useEffect } from "react";
import { useCanonical } from "@/hooks/use-canonical";
import { Layout } from "@/components/layout";
import { useGetBlogPost, useListBlogPosts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Calendar, Clock, ArrowRight, BookOpen, Share2 } from "lucide-react";
import { format } from "date-fns";

const SITE_URL = "https://creatorstoolhub.com";
const SITE_NAME = "creatorsToolHub";

function setMetaTag(selector: string, attrKey: string, attrVal: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrKey, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  useCanonical(slug ? `/blog/${slug}` : "/blog");
  const { data: post, isLoading, error } = useGetBlogPost(slug || "");
  const { data: related } = useListBlogPosts({ limit: 4 });

  const relatedPosts = (related?.posts ?? []).filter(p => p.slug !== slug).slice(0, 3);

  // ── Full SEO: title, meta, OG, Twitter, Article JSON-LD ──
  useEffect(() => {
    if (!post) return;

    const pageTitle = `${post.metaTitle || post.title} | ${SITE_NAME}`;
    const description = post.metaDescription || post.excerpt;
    const postUrl = `${SITE_URL}/blog/${post.slug}`;
    const imageUrl = post.coverImage
      ? (post.coverImage.startsWith("http") ? post.coverImage : `${SITE_URL}${post.coverImage}`)
      : `${SITE_URL}/opengraph.jpg`;

    const prevTitle = document.title;
    document.title = pageTitle;

    setMetaTag('meta[name="description"]',       "name",     "description",        description);
    setMetaTag('meta[property="og:title"]',      "property", "og:title",           pageTitle);
    setMetaTag('meta[property="og:description"]',"property", "og:description",     description);
    setMetaTag('meta[property="og:image"]',      "property", "og:image",           imageUrl);
    setMetaTag('meta[property="og:type"]',       "property", "og:type",            "article");
    setMetaTag('meta[property="og:url"]',        "property", "og:url",             postUrl);
    setMetaTag('meta[property="og:site_name"]',  "property", "og:site_name",       SITE_NAME);
    setMetaTag('meta[name="twitter:card"]',      "name",     "twitter:card",       "summary_large_image");
    setMetaTag('meta[name="twitter:title"]',     "name",     "twitter:title",      pageTitle);
    setMetaTag('meta[name="twitter:description"]',"name",    "twitter:description",description);
    setMetaTag('meta[name="twitter:image"]',     "name",     "twitter:image",      imageUrl);

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": description,
      "image": { "@type": "ImageObject", "url": imageUrl, "width": 1200, "height": 630 },
      "url": postUrl,
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt ?? post.publishedAt,
      "author": {
        "@type": "Person",
        "name": post.author,
        "url": `${SITE_URL}/about`,
        "sameAs": [
          "https://www.linkedin.com/in/immanuels",
          "https://twitter.com/creatorstoolhub"
        ],
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": { "@type": "ImageObject", "url": `${SITE_URL}/favicon.svg` },
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": postUrl },
      "keywords": post.tags.join(", "),
      "articleSection": post.tags[0] ?? "Creator Tips",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".prose > p:first-of-type", "h2"],
      },
    };

    let articleScript = document.getElementById("blog-article-ld");
    if (!articleScript) {
      articleScript = document.createElement("script");
      articleScript.setAttribute("type", "application/ld+json");
      articleScript.id = "blog-article-ld";
      document.head.appendChild(articleScript);
    }
    articleScript.textContent = JSON.stringify(articleSchema);

    return () => {
      document.title = prevTitle;
      document.getElementById("blog-article-ld")?.remove();
    };
  }, [post]);

  // ── FAQ structured data ──
  useEffect(() => {
    if (!post?.faqSchema) return;
    try {
      const faqs = JSON.parse(post.faqSchema);
      if (!Array.isArray(faqs) || faqs.length === 0) return;

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = `faq-schema-${post.slug}`;
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((item: { question: string; answer: string }) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": { "@type": "Answer", "text": item.answer },
        })),
      });
      document.head.appendChild(script);

      return () => {
        document.getElementById(`faq-schema-${post.slug}`)?.remove();
      };
    } catch {
      // invalid JSON — skip
    }
  }, [post?.faqSchema, post?.slug]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 max-w-3xl">
          <Skeleton className="h-6 w-32 mb-10" />
          <Skeleton className="h-14 w-full mb-4 rounded-xl" />
          <Skeleton className="h-14 w-3/4 mb-10 rounded-xl" />
          <Skeleton className="h-6 w-3/4 mb-12" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
          <BookOpen className="w-12 h-12 mx-auto mb-6 text-muted-foreground opacity-30" />
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The post you're looking for might have been removed or doesn't exist.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  const categoryEmoji =
    post.tags.includes("YouTube Growth") ? "▶️" :
    post.tags.includes("TikTok Growth") ? "🎵" :
    post.tags.includes("Instagram Growth") ? "📸" :
    post.tags.includes("AI Tools") ? "🤖" : "✍️";

  return (
    <Layout>
      <article>
        {/* Article Header */}
        <header className="pt-20 pb-14 border-b border-border bg-gradient-to-b from-muted/40 to-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-8">
              <ChevronLeft className="w-4 h-4 mr-1" /> All Articles
            </Link>

            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <img src="/immanuels-avatar.png" alt={post.author} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                <span className="text-foreground font-semibold">{post.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="container mx-auto px-4 max-w-4xl -mt-2 pb-4">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-border/30">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <div className="flex flex-col lg:flex-row gap-14">

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Lead paragraph */}
              <div className="text-xl text-muted-foreground leading-relaxed mb-8 pl-6 border-l-4 border-primary italic">
                {post.excerpt}
              </div>

              {/* Article body */}
              <div
                className="prose prose-lg prose-gray dark:prose-invert max-w-none
                  prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-p:leading-relaxed prose-p:text-foreground/90
                  prose-li:text-foreground/90
                  prose-strong:text-foreground
                  prose-ul:my-4 prose-ol:my-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
                <span className="text-sm font-semibold text-muted-foreground mr-1">Tagged:</span>
                {post.tags.map(tag => (
                  <span key={tag} className="text-sm font-medium bg-muted px-3 py-1 rounded-full text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share */}
              <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="font-bold text-foreground">Found this helpful? Share it:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="bg-card border border-border hover:bg-muted hover:border-primary/30 px-4 py-2 rounded-lg transition-all text-sm font-semibold"
                  >
                    Twitter / X
                  </button>
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="bg-card border border-border hover:bg-muted hover:border-primary/30 px-4 py-2 rounded-lg transition-all text-sm font-semibold"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-card border border-border hover:bg-muted hover:border-primary/30 px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Copy Link
                  </button>
                </div>
              </div>

              {/* Author Bio */}
              <div className="mt-10 bg-muted/40 rounded-2xl border border-border/60 p-6 flex gap-5 items-start">
                <img
                  src="/immanuels-avatar.png"
                  alt="Immanuels"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-border"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">About the Author</p>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{post.author}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Immanuels is a content creator strategist and digital growth enthusiast with hands-on experience growing YouTube channels, TikTok accounts, and Instagram pages across multiple niches. He founded creatorsToolHub to give every creator — regardless of budget — access to the professional-grade AI tools and strategies that actually move the needle. When he's not building tools, he's studying the algorithm, testing content formats, and sharing everything he learns.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 text-center">
                <div className="text-3xl mb-3">{categoryEmoji}</div>
                <h3 className="text-xl font-bold font-display mb-2">Put This Into Practice</h3>
                <p className="text-muted-foreground mb-5 text-sm max-w-lg mx-auto">
                  Use our 34+ free creator tools to implement every strategy in this article — without spending a dollar.
                </p>
                <Link href="/tools" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm">
                  Explore Free Tools <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-14">
                  <h3 className="text-xl font-bold font-display mb-6">More Articles You'll Love</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedPosts.map(rp => (
                      <Link key={rp.id} href={`/blog/${rp.slug}`}>
                        <Card className="group h-full p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all rounded-xl border-border/50">
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {rp.tags.slice(0, 1).map(tag => (
                              <span key={tag} className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                            {rp.title}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {rp.readingTime} min read
                          </p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-[300px] flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Newsletter */}
                <Card className="p-6 rounded-2xl border-border">
                  <h3 className="font-bold font-display text-lg mb-1">Get Weekly Tips</h3>
                  <p className="text-sm text-muted-foreground mb-5">Join 10,000+ creators getting our weekly growth newsletter.</p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    Subscribe Free
                  </button>
                </Card>

                {/* Tools CTA */}
                <Card className="p-6 rounded-2xl border-border bg-gradient-to-br from-primary/5 to-background">
                  <div className="text-2xl mb-3">{categoryEmoji}</div>
                  <h3 className="font-bold font-display text-base mb-2">34+ Free Creator Tools</h3>
                  <p className="text-xs text-muted-foreground mb-4">YouTube, TikTok, Instagram & AI tools — completely free.</p>
                  <Link href="/tools" className="flex items-center gap-1 text-primary text-sm font-bold hover:underline">
                    Browse Tools <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Card>

              </div>
            </aside>
          </div>
        </div>
      </article>
    </Layout>
  );
}
