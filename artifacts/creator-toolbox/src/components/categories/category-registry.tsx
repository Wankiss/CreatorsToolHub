import { YouTubeCategoryPage } from "./youtube-category";

export interface CategoryRegistryEntry {
  component: React.ComponentType<{ category: any }>;
  ownsFullLayout: boolean;
}

export const CATEGORY_REGISTRY: Record<string, CategoryRegistryEntry> = {
  "youtube-tools": {
    component: YouTubeCategoryPage,
    ownsFullLayout: true,
  },
};
