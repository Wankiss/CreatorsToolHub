import {
  Youtube, Instagram, Zap, Sparkles, FolderOpen,
  FileText, Flame, Hash, Tag, Lightbulb, MessageSquare, User,
  DollarSign, BarChart2, Search, Calendar, Film, TrendingUp,
  Image, Download, AtSign, Anchor, Type, ScrollText, Wand2,
  Calculator, Tv, Clock, BookOpen,
} from "lucide-react";

// ── TikTok SVG Icon ───────────────────────────────────────────────────────────
export function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
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
export function getToolIcon(slug: string, categorySlug?: string, iconClass = "w-5 h-5"): React.ReactNode {
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

// ── Category slug → icon ──────────────────────────────────────────────────────
export function getCategoryIcon(slug?: string, iconClass = "w-8 h-8"): React.ReactNode {
  if (slug?.includes("youtube"))   return <Youtube className={iconClass} />;
  if (slug?.includes("tiktok"))    return <TikTokIcon className={iconClass} />;
  if (slug?.includes("instagram")) return <Instagram className={iconClass} />;
  if (slug?.includes("ai"))        return <Zap className={iconClass} />;
  return <FolderOpen className={iconClass} />;
}
