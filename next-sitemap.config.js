/** @type {import('next-sitemap').IConfig} */

const ARTICLE_SLUGS = [
  "heygen-2026",
  "best-free-ai-tools-2026",
  "claude-code-2026",
  "ai-hallucinations-2026",
  "prompt-engineering-2026",
  "openai-852b-2026",
  "claude-mythos-2026",
  "ai-income-2026",
  "vibe-coding-2026",
  "chatgpt-claude-gemini-market-2026",
  "sora-openai-2026",
  "grok-2026",
  "deepseek-2026",
  "perplexity-ai-2026",
  "jasper-ai-2026",
  "chatgpt-claude-gemini-2026",
  "cursor-ai-2026",
  "chatgpt-alternatives-2026",
  "midjourney-dalle-2026",
  "github-copilot-codeium-2026",
  "notion-ai-2026",
  "elevenlabs-2026",
  "jasper-copyai-2026",
  "stable-diffusion-2026",
];

const COMPARATIF_SLUGS = [
  "perplexity-vs-chatgpt-vs-gemini-2026",
  "n8n-vs-make-vs-zapier-2026",
  "runway-vs-kling-vs-pika-2026",
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

  LANGS.forEach((lang) => {
    urls.push({ loc: `${BASE}/${lang}`, priority: 1.0, changefreq: "daily", lastmod: NOW });
  });

  LANGS.forEach((lang) => {
    urls.push({ loc: `${BASE}/${lang}/blog`, priority: 0.9, changefreq: "daily", lastmod: NOW });
    urls.push({ loc: `${BASE}/${lang}/comparatifs`, priority: 0.9, changefreq: "daily", lastmod: NOW });
  });

  LANGS.forEach((lang) => {
    ARTICLE_SLUGS.forEach((slug) => {
      urls.push({ loc: `${BASE}/${lang}/blog/${slug}`, priority: 0.8, changefreq: "weekly", lastmod: NOW });
    });
  });

  LANGS.forEach((lang) => {
    COMPARATIF_SLUGS.forEach((slug) => {
      urls.push({ loc: `${BASE}/${lang}/comparatifs/${slug}`, priority: 0.85, changefreq: "monthly", lastmod: NOW });
    });
  });

  LANGS.forEach((lang) => {
    urls.push({ loc: `${BASE}/${lang}/newsletter`, priority: 0.7, changefreq: "monthly", lastmod: NOW });
    urls.push({ loc: `${BASE}/${lang}/about`, priority: 0.5, changefreq: "monthly", lastmod: NOW });
    urls.push({ loc: `${BASE}/${lang}/contact`, priority: 0.5, changefreq: "yearly", lastmod: NOW });
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