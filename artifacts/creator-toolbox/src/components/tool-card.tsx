import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Activity, Youtube, Instagram, Zap, Sparkles,
  FileText, Flame, Hash, Tag, Lightbulb, MessageSquare, User,
  DollarSign, BarChart2, Search, Calendar, Film, TrendingUp,
  Image, Download, AtSign, Anchor, Type, ScrollText, Wand2,
  Calculator, Tv, Clock, BookOpen,
} from "lucide-react";
import type { Tool } from "@workspace/api-client-react";

// ── TikTok SVG Icon ───────────────────────────────────────────────────────────
function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.29 6.29 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.18 8.18 0 0 0 4.79 1.52V6.82a4.85 4.85 0 0 1-1.02-.13z" />
    </svg>
  );
}

// ── Slug → Lucide icon map ────────────────────────────────────────────────────
function getToolIcon(slug: string, categorySlug?: string): React.ReactNode {
  const iconClass = "w-5 h-5";

  const slugMap: Record<string, React.ReactNode> = {
    // YouTube tools
    "youtube-script-generator":          <ScrollText className={iconClass} />,
    "youtube-title-generator":           <Flame className={iconClass} />,
    "youtube-description-generator":     <FileText className={iconClass} />,
    "youtube-tag-generator":             <Tag className={iconClass} />,
    "youtube-hashtag-generator":         <Hash className={iconClass} />,
    "youtube-video-idea-generator":      <Lightbulb className={iconClass} />,
    "youtube-channel-name-generator":    <Tv className={iconClass} />,
    "youtube-keyword-generator":         <Search className={iconClass} />,
    "youtube-title-analyzer":            <BarChart2 className={iconClass} />,
    "youtube-seo-score-checker":         <BarChart2 className={iconClass} />,
    "youtube-thumbnail-downloader":      <Download className={iconClass} />,
    "youtube-money-calculator":          <DollarSign className={iconClass} />,
    "youtube-cpm-calculator":            <Calculator className={iconClass} />,
    "youtube-shorts-revenue-calculator": <Calculator className={iconClass} />,
    "youtube-engagement-calculator":     <TrendingUp className={iconClass} />,
    // TikTok tools
    "tiktok-viral-idea-generator":       <TikTokIcon className={iconClass} />,
    "tiktok-script-generator":           <ScrollText className={iconClass} />,
    "tiktok-hook-generator":             <Anchor className={iconClass} />,
    "tiktok-caption-generator":          <MessageSquare className={iconClass} />,
    "tiktok-hashtag-generator":          <Hash className={iconClass} />,
    "tiktok-bio-generator":              <User className={iconClass} />,
    "tiktok-username-generator":         <AtSign className={iconClass} />,
    "tiktok-money-calculator":           <DollarSign className={iconClass} />,
    // Instagram tools
    "instagram-hashtag-generator":       <Hash className={iconClass} />,
    "instagram-caption-generator":       <MessageSquare className={iconClass} />,
    "instagram-bio-generator":           <User className={iconClass} />,
    "instagram-reel-idea-generator":     <Film className={iconClass} />,
    "instagram-hook-generator":          <Anchor className={iconClass} />,
    "instagram-username-generator":      <AtSign className={iconClass} />,
    "instagram-content-planner":         <Calendar className={iconClass} />,
    "instagram-money-calculator":        <DollarSign className={iconClass} />,
    "instagram-engagement-calculator":   <TrendingUp className={iconClass} />,
    // AI Creator tools
    "ai-prompt-generator":               <Wand2 className={iconClass} />,
    "midjourney-prompt-generator":       <Image className={iconClass} />,
    "youtube-tag-extractor":             <Tag className={iconClass} />,
  };

  if (slugMap[slug]) return slugMap[slug];

  // Category fallbacks
  if (categorySlug?.includes("youtube"))   return <Youtube className={iconClass} />;
  if (categorySlug?.includes("tiktok"))    return <TikTokIcon className={iconClass} />;
  if (categorySlug?.includes("instagram")) return <Instagram className={iconClass} />;
  if (categorySlug?.includes("ai"))        return <Zap className={iconClass} />;

  return <Sparkles className={iconClass} />;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ToolCard({ tool }: { tool: Tool }) {
  const icon = getToolIcon(tool.slug, tool.categorySlug);

  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="group relative overflow-hidden bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col border-border/50 rounded-2xl cursor-pointer">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
              {icon}
            </div>
            <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground font-medium rounded-full px-3">
              {tool.categoryName}
            </Badge>
          </div>

          <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {tool.name}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
            {tool.shortDescription || tool.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center text-xs text-muted-foreground font-medium gap-1.5 bg-muted/30 px-2.5 py-1 rounded-full">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>{tool.usageCount.toLocaleString()} uses</span>
            </div>
            <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
              Try it <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
      </Card>
    </Link>
  );
}
