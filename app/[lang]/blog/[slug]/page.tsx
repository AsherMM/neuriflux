import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ArticleClient from "./ArticleClient";
import { ARTICLES, getArticleBySlug, type Article } from "../../lib/articles";

type Lang = "fr" | "en";

type PageParams = {
  lang: string;
  slug: string;
};

type ArticleLocaleSeo = {
  title: string;
  desc: string;
  metaTitle?: string;
  metaDesc?: string;
};

type LocalizedArticleData = {
  article: Article;
  localized: ArticleLocaleSeo;
};

const SITE_URL = "https://neuriflux.com";
const SITE_NAME = "Neuriflux";
const TWITTER_HANDLE = "@NeurifluxCom";
const OG_DEFAULT = `${SITE_URL}/og-image-v4.png`;

const isLang = (value: string): value is Lang => value === "fr" || value === "en";
const resolveLang = (value: string): Lang => (value === "en" ? "en" : "fr");

const cleanText = (value: string, max = 160) =>
  value.replace(/\s+/g, " ").trim().slice(0, max);

const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

const absoluteUrl = (pathOrUrl?: string | null) => {
  if (!pathOrUrl) return OG_DEFAULT;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
};

const getArticleImageUrl = (article: Article) => {
  if (article.heroImage?.src) return absoluteUrl(article.heroImage.src);
  if (article.image) return absoluteUrl(article.image);
  return OG_DEFAULT;
};

const getIsoDate = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const getPublishedTime = (article: Article) =>
  getIsoDate(article.publishedAt) ?? getIsoDate(article.updatedAtIso) ?? undefined;

const getModifiedTime = (article: Article) =>
  getIsoDate(article.updatedAtIso) ?? getPublishedTime(article);

const getCanonicalSlug = (article: Article) => article.slug;

const getCanonicalUrl = (lang: Lang, article: Article) =>
  `${SITE_URL}/${lang}/blog/${getCanonicalSlug(article)}`;

const getLanguageUrls = (article: Article) => {
  const canonicalSlug = getCanonicalSlug(article);

  return {
    fr: `${SITE_URL}/fr/blog/${canonicalSlug}`,
    en: `${SITE_URL}/en/blog/${canonicalSlug}`,
  };
};

const getLocalizedArticle = (slug: string, lang: Lang): LocalizedArticleData | null => {
  const article = getArticleBySlug(slug);

  if (!article) return null;

  return {
    article,
    localized: article[lang] as ArticleLocaleSeo,
  };
};

export async function generateStaticParams(): Promise<PageParams[]> {
  return ARTICLES.flatMap((article) => [
    { lang: "fr", slug: article.slug },
    { lang: "en", slug: article.slug },
  ]);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080c10",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;

  if (!isLang(rawLang)) {
    return {
      title: "Article not found | Neuriflux",
      robots: { index: false, follow: false },
    };
  }

  const lang = rawLang;
  const data = getLocalizedArticle(slug, lang);

  if (!data) {
    return {
      title: "Article not found | Neuriflux",
      robots: { index: false, follow: false },
    };
  }

  const { article, localized } = data;
  const canonicalSlug = getCanonicalSlug(article);
  const canonicalUrl = getCanonicalUrl(lang, article);
  const languageUrls = getLanguageUrls(article);
  const title = cleanText(localized.metaTitle ?? localized.title, 70);
  const description = cleanText(localized.metaDesc ?? localized.desc, 160);
  const publishedTime = getPublishedTime(article);
  const modifiedTime = getModifiedTime(article);
  const imageUrl = getArticleImageUrl(article);

  const commonKeywords = [
    ...(article.keywords ?? []),
    ...(lang === "fr"
      ? ["IA", "outils IA", "intelligence artificielle", "avis IA", "test IA"]
      : ["AI", "AI tools", "artificial intelligence", "AI review", "AI test"]),
    String(article.tag),
  ].filter(Boolean);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: commonKeywords,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: String(article.tag),

    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: languageUrls.fr,
        "fr-FR": languageUrls.fr,
        en: languageUrls.en,
        "en-US": languageUrls.en,
        "x-default": languageUrls.en,
      },
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      alternateLocale: lang === "fr" ? "en_US" : "fr_FR",
      publishedTime,
      modifiedTime,
      authors: [SITE_NAME],
      section: String(article.tag),
      tags: commonKeywords,
      images: [
        {
          url: imageUrl,
          width: article.heroImage?.width ?? 1200,
          height: article.heroImage?.height ?? 630,
          alt: article.heroImage?.alt?.[lang] ?? title,
          type: "image/png",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [imageUrl],
    },

    robots: {
      index: slug === canonicalSlug,
      follow: true,
      googleBot: {
        index: slug === canonicalSlug,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { lang: rawLang, slug } = await params;

  if (!isLang(rawLang)) notFound();

  const lang = resolveLang(rawLang);
  const data = getLocalizedArticle(slug, lang);

  if (!data) notFound();

  const { article, localized } = data;
  const canonicalSlug = getCanonicalSlug(article);

  if (slug !== canonicalSlug) {
    permanentRedirect(`/${lang}/blog/${canonicalSlug}`);
  }

  const title = cleanText(localized.metaTitle ?? localized.title, 110);
  const description = cleanText(localized.metaDesc ?? localized.desc, 220);
  const canonicalUrl = getCanonicalUrl(lang, article);
  const languageUrls = getLanguageUrls(article);
  const publishedTime = getPublishedTime(article);
  const modifiedTime = getModifiedTime(article);
  const imageUrl = getArticleImageUrl(article);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: title,
    description,
    image: [imageUrl],
    datePublished: publishedTime,
    dateModified: modifiedTime,
    inLanguage: lang === "fr" ? "fr-FR" : "en-US",
    articleSection: String(article.tag),
    keywords: article.keywords?.join(", "),
    timeRequired: `PT${article.timeMin ?? "5"}M`,
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: `${SITE_URL}/${lang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "fr" ? "Blog" : "Blog",
        item: `${SITE_URL}/${lang}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: canonicalUrl,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: lang === "fr" ? "fr-FR" : "en-US",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: imageUrl,
    },
    breadcrumb: {
      "@id": `${canonicalUrl}#breadcrumb`,
    },
  };

  const hreflangSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["fr-FR", "en-US"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${lang}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    sameAs: [languageUrls.fr, languageUrls.en],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(hreflangSchema) }}
      />

      <Suspense fallback={null}>
        <ArticleClient lang={lang} slug={canonicalSlug} />
      </Suspense>

        </>
  ); 
}
