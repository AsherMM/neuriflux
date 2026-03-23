/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://neuriflux.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  transform: async (config, path) => {
    // Homepage
    if (path === "/") {
      return { loc: path, priority: 1.0, changefreq: "daily" }
    }
    // Comparatifs = pages qui convertissent → priorité max
    if (path.startsWith("/comparatifs/")) {
      return { loc: path, priority: 0.9, changefreq: "monthly" }
    }
    // Articles blog
    if (path.startsWith("/blog/")) {
      return { loc: path, priority: 0.8, changefreq: "weekly" }
    }
    // Reste
    return { loc: path, priority: 0.5, changefreq: "monthly" }
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", disallow: "/" },        // Bloque OpenAI
      { userAgent: "CCBot", disallow: "/" },          // Bloque Common Crawl
      { userAgent: "anthropic-ai", disallow: "/" },   // Bloque Anthropic 😄
    ],
    additionalSitemaps: [
      "https://neuriflux.com/sitemap.xml",
    ],
  },
};