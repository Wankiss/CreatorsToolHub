import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { ToolCard } from "@/components/tool-card";
import { useListTools } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, Frown } from "lucide-react";

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || "");
  const query = searchParams.get('q') || "";

  const { data, isLoading } = useListTools({ search: query });

  return (
    <Layout>
      <div className="bg-muted/20 py-12 border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <SearchIcon className="w-8 h-8 text-primary" />
            {query ? `Search Results for "${query}"` : "All Tools"}
          </h1>
          {data && (
            <p className="text-muted-foreground mt-2">Found {data.total} tools matching your search.</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : data?.tools.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-card rounded-3xl border border-border shadow-sm max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Frown className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">No tools found</h2>
            <p className="text-muted-foreground">We couldn't find any tools matching "{query}". Try a different search term or browse our categories.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
