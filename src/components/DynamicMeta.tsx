import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DynamicMeta = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const images = settings?.images as Record<string, string> | undefined;
    const ogImageUrl = images?.og_image;

    if (ogImageUrl) {
      // Update OG image meta tag
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", ogImageUrl);

      // Update Twitter image meta tag
      let twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImage) {
        twitterImage = document.createElement("meta");
        twitterImage.setAttribute("name", "twitter:image");
        document.head.appendChild(twitterImage);
      }
      twitterImage.setAttribute("content", ogImageUrl);
    }

    // Update favicon - prioritize dedicated favicon, then fall back to logo
    const faviconUrl = images?.favicon || images?.logo;
    if (faviconUrl) {
      // Update or create the main favicon link
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.setAttribute("rel", "icon");
        document.head.appendChild(favicon);
      }
      favicon.setAttribute("type", "image/png");
      favicon.setAttribute("href", faviconUrl);

      // Also update apple-touch-icon if exists
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement("link");
        appleTouchIcon.setAttribute("rel", "apple-touch-icon");
        document.head.appendChild(appleTouchIcon);
      }
      appleTouchIcon.setAttribute("href", faviconUrl);
    }
  }, [settings]);

  return null;
};

export default DynamicMeta;
