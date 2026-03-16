import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { ToolCard } from "@/components/tool-card";
import { useGetCategoryBySlug } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FolderOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CATEGORY_REGISTRY } from "@/components/categories/category-registry";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading, error } = useGetCategoryBySlug(slug || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-muted/30 py-16 border-b border-border">
          <div className="container mx-auto px-4 max-w-7xl">
            <Skeleton className="h-12 w-64 mb-4 rounded-xl" />
            <Skeleton className="h-6 w-96 rounded-lg" />
          </div>
        </div>
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 max-w-3xl py-24">
          <Alert variant="destructive" className="rounded-2xl border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">Category not found</AlertTitle>
            <AlertDescription className="text-sm mt-2">
              The category "{slug}" doesn't exist or has been removed.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const registryEntry = slug ? CATEGORY_REGISTRY[slug] : undefined;

  return (
    <Layout>
      {/* Hero — always shown */}
      <div className="bg-gradient-to-br from-muted/50 via-background to-primary/5 pt-20 pb-16 border-b border-border relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-primary/5 blur-3xl rounded-full" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl shadow-inner border border-primary/20">
              {category.icon || <FolderOpen />}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-2 text-foreground">
                {category.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl text-balance">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom category layout or generic fallback */}
      {registryEntry ? (
        <registryEntry.component category={category} />
      ) : (
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                All {category.name} Tools
                <span className="text-sm font-normal bg-muted text-muted-foreground px-3 py-1 rounded-full ml-2">
                  {category.tools?.length || 0}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.tools?.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>

              {(!category.tools || category.tools.length === 0) && (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-foreground">No tools yet</h3>
                  <p className="text-muted-foreground mt-2">Tools for this category are coming soon.</p>
                </div>
              )}

              {/* Category SEO Content Area */}
              {category.seoContent && (
                <div className="mt-20 prose prose-gray dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary hover:prose-a:text-primary/80">
                  <div dangerouslySetInnerHTML={{ __html: category.seoContent }} />
                </div>
              )}
            </div>

            <aside className="w-full lg:w-[336px] flex-shrink-0 space-y-8">
              <div className="sticky top-24 space-y-8">
                <div className="adsense-placeholder w-full h-[280px]" />

                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Why use our {category.name}?</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">✅ 100% Free forever</li>
                    <li className="flex gap-2">⚡ Instant AI generation</li>
                    <li className="flex gap-2">🔒 No signup required</li>
                    <li className="flex gap-2">📈 SEO optimized results</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </Layout>
  );
}
