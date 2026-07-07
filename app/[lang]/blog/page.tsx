import type { Metadata } from "next";
import BlogClient from "./BlogClient";

type Lang = "fr" | "en";

const SITE_URL = "https://neuriflux.com";
const SITE_NAME = "Neuriflux";
const OG_IMAGE = "/og-image-v4.png";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isFR = lang === "fr";
  const url = `${SITE_URL}/${lang}/blog`;

  const title = isFR
    ? "Blog IA 2026 — Tests, avis et guides sur les meilleurs outils IA"
    : "AI Blog 2026 — Reviews, Tests and Guides on the Best AI Tools";

  const description = isFR
    ? "Découvrez nos tests approfondis, avis honnêtes et guides pratiques sur les meilleurs outils IA : ChatGPT, Claude, Gemini, Cursor, ElevenLabs, Midjourney, Runway et plus."
    : "Read in-depth reviews, honest tests and practical guides on the best AI tools: ChatGPT, Claude, Gemini, Cursor, ElevenLabs, Midjourney, Runway and more.";

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,

    keywords: [
      "AI blog",
      "AI reviews",
      "AI tools",
      "AI tools 2026",
      "best AI tools",
      "ChatGPT",
      "Claude",
      "Gemini",
      "Cursor AI",
      "Midjourney",
      "Runway",
      "ElevenLabs",
      "blog IA",
      "avis IA",
      "outils IA",
      "meilleurs outils IA",
      "intelligence artificielle",
    ],

    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "technology",

    alternates: {
      canonical: url,
      languages: {
        fr: `${SITE_URL}/fr/blog`,
        en: `${SITE_URL}/en/blog`,
        "x-default": `${SITE_URL}/en/blog`,
      },
    },

    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: isFR ? "fr_FR" : "en_US",
      alternateLocale: isFR ? "en_US" : "fr_FR",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: isFR
            ? "Neuriflux — Blog IA, tests et guides"
            : "Neuriflux — AI blog, reviews and guides",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: "@NeurifluxCom",
      creator: "@NeurifluxCom",
      title,
      description,
      images: [OG_IMAGE],
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

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const resolvedLang: Lang = lang === "en" ? "en" : "fr";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: resolvedLang === "fr" ? "Blog IA — Neuriflux" : "AI Blog — Neuriflux",
    description:
      resolvedLang === "fr"
        ? "Tests, avis, guides et analyses sur les meilleurs outils IA."
        : "Reviews, guides and analysis on the best AI tools.",
    url: `${SITE_URL}/${resolvedLang}/blog`,
    inLanguage: resolvedLang,
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: `${SITE_URL}/${resolvedLang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: resolvedLang === "fr" ? "Blog" : "Blog",
        item: `${SITE_URL}/${resolvedLang}/blog`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <BlogClient lang={resolvedLang} />
    </>
  );
}