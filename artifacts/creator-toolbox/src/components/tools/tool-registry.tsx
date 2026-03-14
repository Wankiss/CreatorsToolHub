import { YouTubeTagGeneratorTool } from "./youtube-tag-generator";

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
};
