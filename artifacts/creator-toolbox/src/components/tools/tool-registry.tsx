import { YouTubeTagGeneratorTool } from "./youtube-tag-generator";
import { YouTubeTitleGeneratorTool } from "./youtube-title-generator";
import { YouTubeMoneyCalculatorTool } from "./youtube-money-calculator";
import { YouTubeThumbnailDownloaderTool } from "./youtube-thumbnail-downloader";
import { YouTubeDescriptionGeneratorTool } from "./youtube-description-generator";
import { YouTubeChannelNameGeneratorTool } from "./youtube-channel-name-generator";
import { YouTubeHashtagGeneratorTool } from "./youtube-hashtag-generator";
import { YouTubeVideoIdeaGeneratorTool } from "./youtube-video-idea-generator";
import { YouTubeCpmCalculatorTool } from "./youtube-cpm-calculator";
import { YouTubeTitleAnalyzerTool } from "./youtube-title-analyzer";
import { YouTubeShortsRevenueCalculatorTool } from "./youtube-shorts-revenue-calculator";
import { YouTubeKeywordGeneratorTool } from "./youtube-keyword-generator";
import { YouTubeSeoScoreCheckerTool } from "./youtube-seo-score-checker";
import { YouTubeScriptGeneratorTool } from "./youtube-script-generator";
import { YouTubeEngagementCalculatorTool } from "./youtube-engagement-calculator";
import { TikTokViralIdeaGeneratorTool } from "./tiktok-viral-idea-generator";
import { TikTokHashtagGeneratorTool } from "./tiktok-hashtag-generator";
import { TikTokMoneyCalculatorTool } from "./tiktok-money-calculator";
import { TikTokHookGeneratorTool } from "./tiktok-hook-generator";
import { TikTokBioGeneratorTool } from "./tiktok-bio-generator";
import { TikTokCaptionGeneratorTool } from "./tiktok-caption-generator";
import { TikTokScriptGeneratorTool } from "./tiktok-script-generator";
import { TikTokUsernameGeneratorTool } from "./tiktok-username-generator";
import { InstagramUsernameGeneratorTool } from "./instagram-username-generator";
import { InstagramHookGeneratorTool } from "./instagram-hook-generator";
import { InstagramMoneyCalculatorTool } from "./instagram-money-calculator";
import { InstagramEngagementCalculatorTool } from "./instagram-engagement-calculator";
import { InstagramCaptionGeneratorTool } from "./instagram-caption-generator";
import { InstagramBioGeneratorTool } from "./instagram-bio-generator";

export interface ToolRegistryEntry {
  component: React.ComponentType;
  /**
   * When true the custom component renders its own How-to / About / FAQ
   * sections so tool.tsx should NOT render the DB-driven content blocks.
   */
  ownsSeoContent: boolean;
}

/**
 * Registry of custom tool interfaces keyed by tool slug.
 * Add new entries here as each tool gets a custom implementation.
 */
export const TOOL_REGISTRY: Record<string, ToolRegistryEntry> = {
  "youtube-tag-generator": {
    component: YouTubeTagGeneratorTool,
    ownsSeoContent: true,
  },
  "youtube-title-generator": {
    component: YouTubeTitleGeneratorTool,
    ownsSeoContent: true,
  },
  "youtube-money-calculator": {
    component: YouTubeMoneyCalculatorTool,
    ownsSeoContent: true,
  },
  "youtube-thumbnail-downloader": {
    component: YouTubeThumbnailDownloaderTool,
    ownsSeoContent: true,
  },
  "youtube-description-generator": {
    component: YouTubeDescriptionGeneratorTool,
    ownsSeoContent: true,
  },
  "youtube-channel-name-generator": {
    component: YouTubeChannelNameGeneratorTool,
    ownsSeoContent: true,
  },
  "youtube-hashtag-generator": {
    component: YouTubeHashtagGeneratorTool,
    ownsSeoContent: true,
  },
  "youtube-video-idea-generator": {
    component: YouTubeVideoIdeaGeneratorTool,
    ownsSeoContent: true,
  },
  "youtube-cpm-calculator": {
    component: YouTubeCpmCalculatorTool,
    ownsSeoContent: true,
  },
  "youtube-title-analyzer": {
    component: YouTubeTitleAnalyzerTool,
    ownsSeoContent: true,
  },
  "youtube-shorts-revenue-calculator": {
    component: YouTubeShortsRevenueCalculatorTool,
    ownsSeoContent: true,
  },
  "youtube-keyword-generator": {
    component: YouTubeKeywordGeneratorTool,
    ownsSeoContent: true,
  },
  "youtube-seo-score-checker": {
    component: YouTubeSeoScoreCheckerTool,
    ownsSeoContent: true,
  },
  "youtube-script-generator": {
    component: YouTubeScriptGeneratorTool,
    ownsSeoContent: true,
  },
  "youtube-engagement-calculator": {
    component: YouTubeEngagementCalculatorTool,
    ownsSeoContent: true,
  },
  "tiktok-viral-idea-generator": {
    component: TikTokViralIdeaGeneratorTool,
    ownsSeoContent: true,
  },
  "tiktok-hashtag-generator": {
    component: TikTokHashtagGeneratorTool,
    ownsSeoContent: true,
  },
  "tiktok-money-calculator": {
    component: TikTokMoneyCalculatorTool,
    ownsSeoContent: true,
  },
  "tiktok-hook-generator": {
    component: TikTokHookGeneratorTool,
    ownsSeoContent: true,
  },
  "tiktok-bio-generator": {
    component: TikTokBioGeneratorTool,
    ownsSeoContent: true,
  },
  "tiktok-caption-generator": {
    component: TikTokCaptionGeneratorTool,
    ownsSeoContent: true,
  },
  "tiktok-script-generator": {
    component: TikTokScriptGeneratorTool,
    ownsSeoContent: true,
  },
  "tiktok-username-generator": {
    component: TikTokUsernameGeneratorTool,
    ownsSeoContent: true,
  },
  "instagram-username-generator": {
    component: InstagramUsernameGeneratorTool,
    ownsSeoContent: true,
  },
  "instagram-hook-generator": {
    component: InstagramHookGeneratorTool,
    ownsSeoContent: true,
  },
  "instagram-money-calculator": {
    component: InstagramMoneyCalculatorTool,
    ownsSeoContent: true,
  },
  "instagram-engagement-calculator": {
    component: InstagramEngagementCalculatorTool,
    ownsSeoContent: true,
  },
  "instagram-caption-generator": {
    component: InstagramCaptionGeneratorTool,
    ownsSeoContent: true,
  },
  "instagram-bio-generator": {
    component: InstagramBioGeneratorTool,
    ownsSeoContent: true,
  },
};
