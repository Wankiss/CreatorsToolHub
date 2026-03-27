import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Search as SearchIcon, Frown, ArrowRight, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchTools, TOOLS_INDEX, type ToolIndexEntry } from "@/lib/tools-index";

function getCategoryColor(categorySlug: string) {
  if (categorySlug.includes("youtube")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (categorySlug.includes("tiktok")) return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
  if (categorySlug.includes("instagram")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
}

function ToolResultCard({ tool }: { tool: ToolIndexEntry }) {
  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex items-start gap-4">
        <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center bg-muted rounded-xl">
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{tool.name}</h3>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(tool.categorySlug)}`}>
            {tool.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

const POPULAR_TOOLS = TOOLS_INDEX.filter(t =>
  ["youtube-title-generator", "tiktok-viral-idea-generator", "instagram-hashtag-generator", "ai-prompt-generator",
   "youtube-tag-generator", "tiktok-hook-generator", "instagram-bio-generator", "midjourney-prompt-generator"].includes(t.slug)
);

export default function Search() {
  const [location] = useLocation();

  // Wouter v3 useLocation only returns pathname — read query from window.location.search
  const getQueryFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  };

  const [query, setQuery] = useState(getQueryFromUrl);
  const [inputValue, setInputValue] = useState(getQueryFromUrl);

  // Re-read query when wouter location changes (navigation event)
  useEffect(() => {
    const q = getQueryFromUrl();
    setQuery(q);
    setInputValue(q);
  }, [location]);

  const results = query.trim().length >= 2 ? searchTools(query) : [];
  const showEmpty = query.trim().length >= 2 && results.length === 0;
  const showPopular = query.trim().length < 2;

  const [, setWouterLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setWouterLocation(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  return (
    <Layout>
      {/* Hero search bar */}
      <div className="bg-gradient-to-b from-muted/40 to-background py-12 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <SearchIcon className="w-8 h-8 text-primary flex-shrink-0" />
            <h1 className="text-3xl font-display font-bold">
              {query ? `Results for "${query}"` : "Search Free Creator Tools"}
            </h1>
          </div>
          <p className="text-muted-foreground mb-6 ml-11">
            {results.length > 0
              ? `Found ${results.length} tool${results.length === 1 ? "" : "s"} matching your search`
              : query.trim().length < 2
              ? "Search across 34 free tools for YouTubers, TikTokers, Instagram creators, and AI content."
              : `No tools match "${query}" — try different keywords`
            }
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder='Try "hashtag generator", "money calculator", "bio"...'
                className="pl-11 h-12 rounded-xl text-base border-muted focus-visible:ring-primary/30"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
                autoComplete="off"
              />
            </div>
            <Button type="submit" size="lg" className="rounded-xl px-6 h-12 font-semibold">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-10">
        {/* Popular / browse all (no query) */}
        {showPopular && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Popular Tools</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {POPULAR_TOOLS.map(tool => (
                <ToolResultCard key={tool.slug} tool={tool} />
              ))}
            </div>

            <h2 className="text-lg font-semibold mb-6">All {TOOLS_INDEX.length} Free Creator Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TOOLS_INDEX.map(tool => (
                <ToolResultCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {results.length > 0 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map(tool => (
                <ToolResultCard key={tool.slug} tool={tool} />
              ))}
            </div>

            {results.length < TOOLS_INDEX.length && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">Not finding what you need?</p>
                <button
                  onClick={() => { setInputValue(""); setWouterLocation("/search"); }}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Browse all {TOOLS_INDEX.length} free tools →
                </button>
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {showEmpty && (
          <div className="text-center py-24 bg-card rounded-3xl border border-border shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Frown className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">No tools found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any tools matching "{query}". Try searching for "hashtag", "bio", "script", or "money calculator".
            </p>
            <button
              onClick={() => { setInputValue(""); setWouterLocation("/search"); }}
              className="text-primary font-medium hover:underline"
            >
              Browse all {TOOLS_INDEX.length} free tools →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
