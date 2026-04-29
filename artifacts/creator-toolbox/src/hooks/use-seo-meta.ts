import { useEffect } from "react";

const SITE_URL = "https://creatorstoolhub.com";
const SITE_NAME = "creatorsToolHub";

function setMeta(selector: string, attrKey: string, attrVal: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrKey, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

interface SeoMeta {
  title: string;
  description: string;
  path: string;
  type?: string;
  image?: string;
}

export function useSeoMeta({ title, description, path, type = "website", image }: SeoMeta) {
  useEffect(() => {
    const pageTitle = `${title} | ${SITE_NAME}`;
    const imageUrl = image ?? `${SITE_URL}/opengraph.jpg`;
    const fullUrl = `${SITE_URL}${path}`;

    const prevTitle = document.title;
    document.title = pageTitle;

    setMeta('meta[name="description"]',          "name",     "description",        description);
    setMeta('meta[property="og:title"]',         "property", "og:title",           pageTitle);
    setMeta('meta[property="og:description"]',   "property", "og:description",     description);
    setMeta('meta[property="og:url"]',           "property", "og:url",             fullUrl);
    setMeta('meta[property="og:type"]',          "property", "og:type",            type);
    setMeta('meta[property="og:image"]',         "property", "og:image",           imageUrl);
    setMeta('meta[name="twitter:title"]',        "name",     "twitter:title",      pageTitle);
    setMeta('meta[name="twitter:description"]',  "name",     "twitter:description",description);
    setMeta('meta[name="twitter:image"]',        "name",     "twitter:image",      imageUrl);

    return () => { document.title = prevTitle; };
  }, [title, description, path, type, image]);
}
