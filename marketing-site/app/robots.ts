import type { MetadataRoute } from "next"
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/join/",
        "/trial/confirmed",
        "/tour/confirmed",
        "/search",
        "/api/",
      ],
    },
    sitemap: "https://www.cactuspeakathletic.com/sitemap.xml",
  }
}
