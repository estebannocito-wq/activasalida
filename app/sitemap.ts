import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://activasalida.com", lastModified: new Date() },
    { url: "https://activasalida.com/registro", lastModified: new Date() },
    { url: "https://activasalida.com/login", lastModified: new Date() },
    { url: "https://activasalida.com/feed", lastModified: new Date() },
  ];
}
