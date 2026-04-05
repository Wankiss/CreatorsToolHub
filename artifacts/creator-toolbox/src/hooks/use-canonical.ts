import { useEffect } from "react";

const SITE_URL = "https://creatorstoolhub.com";

export function useCanonical(path: string) {
  useEffect(() => {
    const href = `${SITE_URL}${path}`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
    return () => {
      if (link) link.href = "";
    };
  }, [path]);
}
