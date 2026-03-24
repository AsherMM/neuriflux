/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.neuriflux.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",

  transform: async (config, path) => {
    // Homepages FR/EN
    if (path === "/fr" || path === "/en") {
      return {
        loc: path,
        priority: 1.0,
        changefreq: "daily",
      };
    }

    // Comparatifs FR/EN
    if (
      path.startsWith("/fr/comparatifs/") ||
      path.startsWith("/en/comparatifs/")
    ) {
      return {
        loc: path,
        priority: 0.9,
        changefreq: "monthly",
      };
    }

    // Blog FR/EN
    if (
      path.startsWith("/fr/blog/") ||
      path.startsWith("/en/blog/")
    ) {
      return {
        loc: path,
        priority: 0.8,
        changefreq: "weekly",
      };
    }

    // Reste
    return {
      loc: path,
      priority: 0.5,
      changefreq: "monthly",
    };
  },

  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
    ],
    additionalSitemaps: [
      "https://www.neuriflux.com/sitemap.xml",
    ],
  },
};