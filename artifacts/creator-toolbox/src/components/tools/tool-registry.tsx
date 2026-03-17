import { YouTubeTagGeneratorTool } from "./youtube-tag-generator";
import { YouTubeTitleGeneratorTool } from "./youtube-title-generator";
import { YouTubeMoneyCalculatorTool } from "./youtube-money-calculator";
import { YouTubeThumbnailDownloaderTool } from "./youtube-thumbnail-downloader";
import { YouTubeDescriptionGeneratorTool } from "./youtube-description-generator";
import { YouTubeChannelNameGeneratorTool } from "./youtube-channel-name-generator";
import { YouTubeHashtagGeneratorTool } from "./youtube-hashtag-generator";
import { YouTubeVideoIdeaGeneratorTool } from "./youtube-video-idea-generator";

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
};
