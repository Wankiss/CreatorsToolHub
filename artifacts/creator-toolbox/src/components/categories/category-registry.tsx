import { YouTubeCategoryPage } from "./youtube-category";
import { TikTokCategoryPage } from "./tiktok-category";
import { InstagramCategoryPage } from "./instagram-category";
import { AiCategoryPage } from "./ai-category";

export interface CategoryRegistryEntry {
  component: React.ComponentType<{ category: any }>;
  ownsFullLayout: boolean;
}

export const CATEGORY_REGISTRY: Record<string, CategoryRegistryEntry> = {
  "youtube-tools": {
    component: YouTubeCategoryPage,
    ownsFullLayout: true,
  },
  "tiktok-tools": {
    component: TikTokCategoryPage,
    ownsFullLayout: true,
  },
  "instagram-tools": {
    component: InstagramCategoryPage,
    ownsFullLayout: true,
  },
  "ai-creator-tools": {
    component: AiCategoryPage,
    ownsFullLayout: true,
  },
};
