/** @type {import("next-sitemap").IConfig} */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = "https://neuriflux.com";
const LANGS = ["fr", "en"];

const fallbackLastmod = new Date().toISOString();

const CONTENT_FILES = {
  articles: {
    file: path.join(__dirname, "app/[lang]/lib/articles.ts"),
    route: "/blog",
    priority: 0.8,
    changefreq: "weekly",
  },
  comparatifs: {
    file: path.join(__dirname, "app/[lang]/lib/comparatifs.ts"),
    route: "/comparatifs",
    priority: 0.85,
    changefreq: "weekly",
  },
};

function safeDate(value) {
  if (!value) return fallbackLastmod;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? fallbackLastmod
    : parsed.toISOString();
}

function extractContentEntries(filePath) {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf8");

  const entries = [];
  const regex =
    /slug:\s*["']([^"']+)["'][\s\S]*?(?:updatedAtIso:\s*["']([^"']+)["']|date:\s*\{[\s\S]*?en:\s*["']([^"']+)["'])/g;

  let match;

  while ((match = regex.exec(content)) !== null) {
    const slug = match[1];
    const updatedAtIso = match[2];
    const englishDate = match[3];

    if (!slug) continue;

    entries.push({
      slug,
      lastmod: safeDate(updatedAtIso || englishDate),
    });
  }

  return [...new Map(entries.map((entry) => [entry.slug, entry])).values()];
}

function alternateRefs(route) {
  return [
    ...LANGS.map((lang) => ({
      hreflang: lang,
      href: `${BASE}/${lang}${route}`,
    })),
    {
      hreflang: "x-default",
      href: `${BASE}/en${route}`,
    },
  ];
}

function addLocalized(urls, route, priority, changefreq, lastmod = fallbackLastmod) {
  LANGS.forEach((lang) => {
    urls.push({
      loc: `${BASE}/${lang}${route}`,
      lastmod,
      priority,
      changefreq,
      alternateRefs: alternateRefs(route),
    });
  });
}

const additionalPaths = async () => {
  const urls = [];

  addLocalized(urls, "", 1.0, "daily");

  [
    ["/blog", 0.9, "daily"],
    ["/comparatifs", 0.9, "daily"],
    ["/aifinder", 0.9, "daily"],
    ["/aitools", 0.9, "daily"],
    ["/newsletter", 0.7, "monthly"],
    ["/about", 0.5, "monthly"],
    ["/contact", 0.5, "yearly"],
  ].forEach(([route, priority, changefreq]) => {
    addLocalized(urls, route, priority, changefreq);
  });

  Object.values(CONTENT_FILES).forEach(({ file, route, priority, changefreq }) => {
    extractContentEntries(file).forEach(({ slug, lastmod }) => {
      addLocalized(urls, `${route}/${slug}`, priority, changefreq, lastmod);
    });
  });

  return urls;
};

const config = {
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

export default config;