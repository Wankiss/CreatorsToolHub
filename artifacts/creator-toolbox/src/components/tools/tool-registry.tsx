import { lazy } from "react";

export interface ToolRegistryEntry {
  component: React.LazyExoticComponent<React.ComponentType>;
  /**
   * When true the custom component renders its own How-to / About / FAQ
   * sections so tool.tsx should NOT render the DB-driven content blocks.
   */
  ownsSeoContent: boolean;
}

/**
 * Registry of custom tool interfaces keyed by tool slug.
 * All components are lazy-loaded so each tool gets its own chunk —
 * the visitor only downloads the code for the tool they visit.
 */
export const TOOL_REGISTRY: Record<string, ToolRegistryEntry> = {
  "youtube-tag-generator": {
    component: lazy(() => import("./youtube-tag-generator").then(m => ({ default: m.YouTubeTagGeneratorTool }))),
    ownsSeoContent: true,
  },
  "youtube-title-generator": {
    component: lazy(() => import("./youtube-title-generator").then(m => ({ default: m.YouTubeTitleGeneratorTool }))),
    ownsSeoContent: true,
  },
  "youtube-money-calculator": {
    component: lazy(() => import("./youtube-money-calculator").then(m => ({ default: m.YouTubeMoneyCalculatorTool }))),
    ownsSeoContent: true,
  },
  "youtube-thumbnail-downloader": {
    component: lazy(() => import("./youtube-thumbnail-downloader").then(m => ({ default: m.YouTubeThumbnailDownloaderTool }))),
    ownsSeoContent: true,
  },
  "youtube-description-generator": {
    component: lazy(() => import("./youtube-description-generator").then(m => ({ default: m.YouTubeDescriptionGeneratorTool }))),
    ownsSeoContent: true,
  },
  "youtube-channel-name-generator": {
    component: lazy(() => import("./youtube-channel-name-generator").then(m => ({ default: m.YouTubeChannelNameGeneratorTool }))),
    ownsSeoContent: true,
  },
  "youtube-hashtag-generator": {
    component: lazy(() => import("./youtube-hashtag-generator").then(m => ({ default: m.YouTubeHashtagGeneratorTool }))),
    ownsSeoContent: true,
  },
  "youtube-video-idea-generator": {
    component: lazy(() => import("./youtube-video-idea-generator").then(m => ({ default: m.YouTubeVideoIdeaGeneratorTool }))),
    ownsSeoContent: true,
  },
  "youtube-cpm-calculator": {
    component: lazy(() => import("./youtube-cpm-calculator").then(m => ({ default: m.YouTubeCpmCalculatorTool }))),
    ownsSeoContent: true,
  },
  "youtube-title-analyzer": {
    component: lazy(() => import("./youtube-title-analyzer").then(m => ({ default: m.YouTubeTitleAnalyzerTool }))),
    ownsSeoContent: true,
  },
  "youtube-shorts-revenue-calculator": {
    component: lazy(() => import("./youtube-shorts-revenue-calculator").then(m => ({ default: m.YouTubeShortsRevenueCalculatorTool }))),
    ownsSeoContent: true,
  },
  "youtube-keyword-generator": {
    component: lazy(() => import("./youtube-keyword-generator").then(m => ({ default: m.YouTubeKeywordGeneratorTool }))),
    ownsSeoContent: true,
  },
  "youtube-seo-score-checker": {
    component: lazy(() => import("./youtube-seo-score-checker").then(m => ({ default: m.YouTubeSeoScoreCheckerTool }))),
    ownsSeoContent: true,
  },
  "youtube-script-generator": {
    component: lazy(() => import("./youtube-script-generator").then(m => ({ default: m.YouTubeScriptGeneratorTool }))),
    ownsSeoContent: true,
  },
  "youtube-engagement-calculator": {
    component: lazy(() => import("./youtube-engagement-calculator").then(m => ({ default: m.YouTubeEngagementCalculatorTool }))),
    ownsSeoContent: true,
  },
  "tiktok-viral-idea-generator": {
    component: lazy(() => import("./tiktok-viral-idea-generator").then(m => ({ default: m.TikTokViralIdeaGeneratorTool }))),
    ownsSeoContent: true,
  },
  "tiktok-hashtag-generator": {
    component: lazy(() => import("./tiktok-hashtag-generator").then(m => ({ default: m.TikTokHashtagGeneratorTool }))),
    ownsSeoContent: true,
  },
  "tiktok-money-calculator": {
    component: lazy(() => import("./tiktok-money-calculator").then(m => ({ default: m.TikTokMoneyCalculatorTool }))),
    ownsSeoContent: true,
  },
  "tiktok-hook-generator": {
    component: lazy(() => import("./tiktok-hook-generator").then(m => ({ default: m.TikTokHookGeneratorTool }))),
    ownsSeoContent: true,
  },
  "tiktok-bio-generator": {
    component: lazy(() => import("./tiktok-bio-generator").then(m => ({ default: m.TikTokBioGeneratorTool }))),
    ownsSeoContent: true,
  },
  "tiktok-caption-generator": {
    component: lazy(() => import("./tiktok-caption-generator").then(m => ({ default: m.TikTokCaptionGeneratorTool }))),
    ownsSeoContent: true,
  },
  "tiktok-script-generator": {
    component: lazy(() => import("./tiktok-script-generator").then(m => ({ default: m.TikTokScriptGeneratorTool }))),
    ownsSeoContent: true,
  },
  "tiktok-username-generator": {
    component: lazy(() => import("./tiktok-username-generator").then(m => ({ default: m.TikTokUsernameGeneratorTool }))),
    ownsSeoContent: true,
  },
  "instagram-username-generator": {
    component: lazy(() => import("./instagram-username-generator").then(m => ({ default: m.InstagramUsernameGeneratorTool }))),
    ownsSeoContent: true,
  },
  "instagram-hook-generator": {
    component: lazy(() => import("./instagram-hook-generator").then(m => ({ default: m.InstagramHookGeneratorTool }))),
    ownsSeoContent: true,
  },
  "instagram-money-calculator": {
    component: lazy(() => import("./instagram-money-calculator").then(m => ({ default: m.InstagramMoneyCalculatorTool }))),
    ownsSeoContent: true,
  },
  "instagram-engagement-calculator": {
    component: lazy(() => import("./instagram-engagement-calculator").then(m => ({ default: m.InstagramEngagementCalculatorTool }))),
    ownsSeoContent: true,
  },
  "instagram-caption-generator": {
    component: lazy(() => import("./instagram-caption-generator").then(m => ({ default: m.InstagramCaptionGeneratorTool }))),
    ownsSeoContent: true,
  },
  "instagram-bio-generator": {
    component: lazy(() => import("./instagram-bio-generator").then(m => ({ default: m.InstagramBioGeneratorTool }))),
    ownsSeoContent: true,
  },
  "instagram-hashtag-generator": {
    component: lazy(() => import("./instagram-hashtag-generator").then(m => ({ default: m.InstagramHashtagGeneratorTool }))),
    ownsSeoContent: true,
  },
  "instagram-content-planner": {
    component: lazy(() => import("./instagram-content-planner").then(m => ({ default: m.InstagramContentPlannerTool }))),
    ownsSeoContent: true,
  },
  "instagram-reel-idea-generator": {
    component: lazy(() => import("./instagram-reel-idea-generator").then(m => ({ default: m.InstagramReelIdeaGeneratorTool }))),
    ownsSeoContent: true,
  },
  "ai-prompt-generator": {
    component: lazy(() => import("./ai-prompt-generator").then(m => ({ default: m.AiPromptGeneratorTool }))),
    ownsSeoContent: true,
  },
  "midjourney-prompt-generator": {
    component: lazy(() => import("./midjourney-prompt-generator").then(m => ({ default: m.MidjourneyPromptGeneratorTool }))),
    ownsSeoContent: true,
  },
};
