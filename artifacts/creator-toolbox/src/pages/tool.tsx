import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetToolBySlug, useExecuteTool, useTrackToolUsage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Check, Copy, ChevronRight, Home, LayoutGrid,
  Activity, HelpCircle, FileText, Zap, Loader2
} from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { TOOL_REGISTRY, type ToolRegistryEntry } from "@/components/tools/tool-registry";

// ─── Generic Fallback Tool Interface ─────────────────────────────────────────

function GenericToolInterface({ slug }: { slug: string }) {
  const executeMutation = useExecuteTool();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [outputs, setOutputs] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    executeMutation.mutate(
      { slug, data: { inputs: { topic: input, text: input, keyword: input } } },
      {
        onSuccess: (res) => {
          if (res.success && res.outputs.length > 0) {
            setOutputs(res.outputs);
            setTimeout(() => {
              document.getElementById("results-area")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          } else {
            toast({ title: "Generation failed", description: "No outputs were generated. Please try a different prompt.", variant: "destructive" });
          }
        },
        onError: () => {
          toast({ title: "Error", description: "Something went wrong. Try again.", variant: "destructive" });
        },
      }
    );
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({ title: "Copied!", description: "Copied to clipboard.", duration: 2000 });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleExecute} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">
                What is your topic or keyword?
              </label>
              <Textarea
                placeholder="Enter your topic, keyword, or content idea..."
                className="min-h-[140px] text-base resize-y p-4 bg-muted/50 focus-visible:ring-primary/30 border-muted-foreground/20 rounded-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={executeMutation.isPending || !input.trim()}
              className="w-full h-14 text-lg rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              {executeMutation.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Generate Results</>
              )}
            </Button>
          </form>
        </div>
      </Card>

      {outputs.length > 0 && (
        <section id="results-area" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <Sparkles className="text-primary w-6 h-6" /> Generated Results
            </h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
              {outputs.length} results
            </span>
          </div>
          <div className="space-y-4">
            {outputs.map((out, idx) => (
              <Card key={idx} className="p-5 flex items-start gap-4 hover:border-primary/50 transition-colors group bg-card">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {idx + 1}
                </div>
                <p className="flex-1 text-foreground leading-relaxed pt-1 whitespace-pre-wrap">{out}</p>
                <Button
                  variant={copiedIndex === idx ? "default" : "secondary"}
                  size="icon"
                  className="shrink-0 rounded-xl"
                  onClick={() => copyToClipboard(out, idx)}
                >
                  {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Main Tool Page ───────────────────────────────────────────────────────────

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: tool, isLoading, error } = useGetToolBySlug(slug || "", {
    query: {
      retry: (failureCount, err) => {
        const status = (err as { status?: number })?.status;
        if (status === 404) return false;
        return failureCount < 2;
      },
    },
  });
  const trackMutation = useTrackToolUsage();

  useEffect(() => {
    if (tool && slug) {
      trackMutation.mutate({ data: { toolSlug: slug, toolId: tool.id } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool?.id, slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <Skeleton className="h-8 w-64 mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !tool) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Tool not found</h1>
          <p className="text-muted-foreground mb-8">The tool you are looking for doesn't exist.</p>
          <Button asChild><Link href="/">Go Home</Link></Button>
        </div>
      </Layout>
    );
  }

  // Check if there's a custom interface registered for this slug
  const registryEntry: ToolRegistryEntry | undefined = slug ? TOOL_REGISTRY[slug] : undefined;
  const CustomInterface = registryEntry?.component;
  const customOwnsSeoContent = registryEntry?.ownsSeoContent ?? false;

  return (
    <Layout>
      {/* SEO Meta via Helmet-equivalent title */}
      {typeof document !== "undefined" && (
        (() => {
          document.title = `Free ${tool.name} - ${tool.categoryName} | creatorsToolHub`;
          return null;
        })()
      )}

      {/* Breadcrumbs */}
      <div className="bg-muted/30 border-b border-border py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className="flex items-center text-sm font-medium text-muted-foreground space-x-2">
            <Link href="/" className="hover:text-primary transition-colors flex items-center">
              <Home className="w-4 h-4 mr-1" /> Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/category/${tool.categorySlug}`} className="hover:text-primary transition-colors flex items-center">
              <LayoutGrid className="w-4 h-4 mr-1" /> {tool.categoryName}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{tool.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Main Content ── */}
          <div className="flex-1 space-y-10">

            {/* Tool Header */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl shadow-inner border border-primary/20">
                  {tool.icon && tool.icon.length <= 2 ? tool.icon : <Zap />}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
                    {tool.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Activity className="w-4 h-4 mr-1 text-primary" /> {tool.usageCount.toLocaleString()} uses
                    </span>
                    <span>•</span>
                    <span className="text-primary font-medium">Free Tool</span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mb-8 text-balance leading-relaxed">
                {tool.description}
              </p>

              {/* Custom or Generic Tool Interface */}
              {CustomInterface ? (
                <CustomInterface />
              ) : (
                <GenericToolInterface slug={slug || ""} />
              )}
            </section>

            {/* In-article AdSense Placeholder */}
            <div className="adsense-placeholder w-full h-[280px]" />

            {/* SEO Content Sections — skipped when the custom component owns its own content */}
            {!customOwnsSeoContent && (
              <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-display prose-h2:text-2xl prose-h3:text-xl">
                {tool.howToGuide && (
                  <section className="mb-12">
                    <h2 className="flex items-center gap-2 border-b pb-4">
                      <HelpCircle className="text-primary" /> How to use the {tool.name}
                    </h2>
                    <div dangerouslySetInnerHTML={{ __html: tool.howToGuide }} />
                  </section>
                )}
                {tool.seoContent && (
                  <section className="mb-12">
                    <h2 className="flex items-center gap-2 border-b pb-4">
                      <FileText className="text-primary" /> About this Tool
                    </h2>
                    <div dangerouslySetInnerHTML={{ __html: tool.seoContent }} />
                  </section>
                )}
                {tool.faqContent && (
                  <section className="mb-12">
                    <h2 className="flex items-center gap-2 border-b pb-4">
                      <HelpCircle className="text-primary" /> Frequently Asked Questions
                    </h2>
                    <div dangerouslySetInnerHTML={{ __html: tool.faqContent }} />
                  </section>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-[336px] flex-shrink-0 space-y-8">
            <div className="sticky top-24 space-y-8">

              {/* Sidebar AdSense Placeholder */}
              <div className="adsense-placeholder w-[300px] h-[250px] mx-auto lg:mx-0" />

              {tool.relatedTools && tool.relatedTools.length > 0 && (
                <div className="bg-muted/30 rounded-3xl p-6 border border-border">
                  <h3 className="font-bold font-display text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="text-primary w-5 h-5" /> Related Tools
                  </h3>
                  <div className="space-y-4">
                    {tool.relatedTools.map(t => (
                      <Link key={t.id} href={`/tools/${t.slug}`}>
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-background border border-transparent hover:border-border hover:shadow-sm transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm group-hover:text-primary transition-colors text-xl">
                            {t.icon && t.icon.length <= 2 ? t.icon : "🔧"}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                              {t.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{t.shortDescription}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Sidebar AdSense */}
              <div className="adsense-placeholder w-[300px] h-[600px] mx-auto lg:mx-0 hidden lg:flex" />

            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
