/** @type {import('next-sitemap').IConfig} */

const ARTICLE_SLUGS = [
  "jasper-ai-review-2026",
  "chatgpt-vs-claude-vs-gemini-2026",
  "cursor-ai-review-2026",
  "alternatives-gratuites-chatgpt",
  "midjourney-vs-dalle-2026",
  "github-copilot-vs-codeium",
  "notion-ai-review",
  "elevenlabs-review-2026",
  "jasper-vs-copyai",
  "stable-diffusion-guide",
];

const COMPARATIF_SLUGS = [
  "chatgpt-vs-claude-vs-gemini",
  "cursor-vs-copilot-vs-codeium",
  "midjourney-vs-dalle-vs-stable-diffusion",
  "jasper-vs-copyai-vs-claude",
  "elevenlabs-vs-openai-tts-vs-playht",
];

const LANGS = ["fr", "en"];
const BASE = "https://neuriflux.com";
const NOW = new Date().toISOString();

const additionalPaths = async () => {
  const urls = [];

  // Homepages
  LANGS.forEach(lang => {
    urls.push({ loc: `${BASE}/${lang}`, priority: 1.0, changefreq: "daily", lastmod: NOW });
  });

  // Listes blog et comparatifs
  LANGS.forEach(lang => {
    urls.push({ loc: `${BASE}/${lang}/blog`, priority: 0.9, changefreq: "daily", lastmod: NOW });
    urls.push({ loc: `${BASE}/${lang}/comparatifs`, priority: 0.9, changefreq: "daily", lastmod: NOW });
  });

  // Articles de blog
  LANGS.forEach(lang => {
    ARTICLE_SLUGS.forEach(slug => {
      urls.push({ loc: `${BASE}/${lang}/blog/${slug}`, priority: 0.8, changefreq: "weekly", lastmod: NOW });
    });
  });

  // Comparatifs individuels
  LANGS.forEach(lang => {
    COMPARATIF_SLUGS.forEach(slug => {
      urls.push({ loc: `${BASE}/${lang}/comparatifs/${slug}`, priority: 0.85, changefreq: "monthly", lastmod: NOW });
    });
  });

  // Newsletter, About et Contact
  LANGS.forEach(lang => {
    urls.push({ loc: `${BASE}/${lang}/newsletter`, priority: 0.7, changefreq: "monthly", lastmod: NOW });
    urls.push({ loc: `${BASE}/${lang}/about`, priority: 0.5, changefreq: "monthly", lastmod: NOW });
    urls.push({ loc: `${BASE}/${lang}/contact`, priority: 0.5, changefreq: "yearly", lastmod: NOW });
  });

  // Pages légales
  LANGS.forEach(lang => {
    ["legal", "privacy", "cookies"].forEach(page => {
      urls.push({ loc: `${BASE}/${lang}/${page}`, priority: 0.3, changefreq: "yearly", lastmod: NOW });
    });
  });

  return urls;
};

module.exports = {
  siteUrl: BASE,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: "public",
  exclude: ["/*"],
  additionalPaths,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "Omgilibot", disallow: "/" },
    ],
  },
};