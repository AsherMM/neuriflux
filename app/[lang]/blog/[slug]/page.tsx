import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
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

const getLocalizedArticle = (slug: string, lang: Lang) => {
  const article = getArticleBySlug(slug) as (Article & {
    updatedAt?: Partial<Record<Lang, string>>;
  }) | undefined;

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

  const title = cleanText(localized.metaTitle ?? localized.title, 70);
  const description = cleanText(localized.metaDesc ?? localized.desc, 160);

  const canonicalUrl = `${SITE_URL}/${lang}/blog/${slug}`;
  const frUrl = `${SITE_URL}/fr/blog/${slug}`;
  const enUrl = `${SITE_URL}/en/blog/${slug}`;

  const publishedTime = article.date?.en;
  const modifiedTime = article.updatedAt?.en ?? article.date?.en;

  const commonKeywords =
    lang === "fr"
      ? ["IA", "outils IA", "intelligence artificielle", "avis IA", "test IA", String(article.tag)]
      : ["AI", "AI tools", "artificial intelligence", "AI review", "AI test", String(article.tag)];

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
        fr: frUrl,
        "fr-FR": frUrl,
        en: enUrl,
        "en-US": enUrl,
        "x-default": frUrl,
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
          url: OG_DEFAULT,
          width: 1200,
          height: 630,
          alt: title,
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
      images: [OG_DEFAULT],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
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
  const lang = resolveLang(rawLang);

  const data = getLocalizedArticle(slug, lang);
  if (!data) notFound();

  const { article, localized } = data;

  const title = cleanText(localized.metaTitle ?? localized.title, 70);
  const description = cleanText(localized.metaDesc ?? localized.desc, 160);
  const canonicalUrl = `${SITE_URL}/${lang}/blog/${slug}`;
  const publishedTime = article.date?.en;
  const modifiedTime = article.updatedAt?.en ?? article.date?.en;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: title,
    description,
    image: [OG_DEFAULT],
    datePublished: publishedTime,
    dateModified: modifiedTime,
    inLanguage: lang,
    articleSection: String(article.tag),
    timeRequired: `PT${article.timeMin ?? 5}M`,
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
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />

      <Suspense fallback={null}>
        <ArticleClient lang={lang} slug={slug} />
      </Suspense>
    </>
  );
}