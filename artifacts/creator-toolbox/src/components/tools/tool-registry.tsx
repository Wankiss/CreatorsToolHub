import { YouTubeTagGeneratorTool } from "./youtube-tag-generator";

/**
 * Registry of custom tool interfaces keyed by tool slug.
 * Add new entries here as each tool gets a custom implementation.
 */
export const TOOL_REGISTRY: Record<string, React.ComponentType> = {
  "youtube-tag-generator": YouTubeTagGeneratorTool,
};
