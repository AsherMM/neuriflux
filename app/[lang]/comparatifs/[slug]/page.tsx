import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ComparatifClient from "./ComparatifClient";
import { COMPARATIFS, getComparatifBySlug } from "../../lib/comparatifs";

type Lang = "fr" | "en";

type PageParams = {
  lang: string;
  slug: string;
};

const SITE_URL = "https://neuriflux.com";
const SITE_NAME = "Neuriflux";
const TWITTER_HANDLE = "@NeurifluxCom";
const OG_DEFAULT = `${SITE_URL}/og-image-v4.png`;

const isLang = (value: string): value is Lang => value === "fr" || value === "en";
const resolveLang = (value: string): Lang => (value === "en" ? "en" : "fr");

const cleanText = (value?: string, max = 160) =>
  (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

const extractPrice = (price?: string) => {
  const value = price?.match(/[0-9]+(?:[.,][0-9]+)?/)?.[0]?.replace(",", ".");
  return value ?? "0";
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080c10",
};

export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = [];

  for (const comp of COMPARATIFS) {
    params.push({ lang: "fr", slug: comp.slug });
    params.push({ lang: "en", slug: comp.slug });

    for (const legacy of comp.legacySlugs ?? []) {
      if (legacy !== comp.slug) {
        params.push({ lang: "fr", slug: legacy });
        params.push({ lang: "en", slug: legacy });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;

  if (!isLang(rawLang)) {
    return {
      title: "Comparatif introuvable | Neuriflux",
      robots: { index: false, follow: false },
    };
  }

  const lang = rawLang;
  const data = getComparatifBySlug(slug);

  if (!data) {
    return {
      title: "Comparatif introuvable | Neuriflux",
      robots: { index: false, follow: false },
    };
  }

  const comp = data[lang];
  const canonicalSlug = data.canonicalSlug ?? data.slug;
  const canonicalUrl = `${SITE_URL}/${lang}/comparatifs/${canonicalSlug}`;
  const frUrl = `${SITE_URL}/fr/comparatifs/${canonicalSlug}`;
  const enUrl = `${SITE_URL}/en/comparatifs/${canonicalSlug}`;
  const ogImage = `${SITE_URL}/og/comparatifs/${canonicalSlug}.png`;

  const title = cleanText(comp.metaTitle ?? comp.title, 70);
  const description = cleanText(comp.metaDesc ?? comp.desc ?? comp.intro, 160);

  const toolNames = data.tools.map((tool) => tool.name);
  const winner = data.tools.find((tool) => tool.name === data.winner);

  const keywords = [
    ...toolNames,
    ...toolNames.map((name) => `${name} avis`),
    ...toolNames.map((name) => `${name} review 2026`),
    `${toolNames.join(" vs ")}`,
    data.tag,
    lang === "fr" ? "comparatif IA 2026" : "AI comparison 2026",
    lang === "fr" ? "meilleur outil IA" : "best AI tool",
    "Neuriflux",
    "2026",
    winner ? `${winner.name} review` : "",
    winner ? `${winner.name} avis` : "",
  ].filter(Boolean);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: data.tag,

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
      type: "article",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      alternateLocale: lang === "fr" ? "en_US" : "fr_FR",
      siteName: SITE_NAME,
      publishedTime: data.publishedAt ?? data.date?.en,
      modifiedTime: data.updatedAtIso ?? data.publishedAt ?? data.date?.en,
      authors: [SITE_NAME],
      section: data.tag,
      tags: keywords,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
        {
          url: OG_DEFAULT,
          width: 1200,
          height: 630,
          alt: "Neuriflux — comparatifs IA",
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
      images: [ogImage],
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

export default async function ComparatifPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang = resolveLang(rawLang);

  const data = getComparatifBySlug(slug);
  if (!data) notFound();

  const canonicalSlug = data.canonicalSlug ?? data.slug;

  if (slug !== canonicalSlug) {
    permanentRedirect(`/${lang}/comparatifs/${canonicalSlug}`);
  }

  const comp = data[lang];
  const canonicalUrl = `${SITE_URL}/${lang}/comparatifs/${canonicalSlug}`;
  const frUrl = `${SITE_URL}/fr/comparatifs/${canonicalSlug}`;
  const enUrl = `${SITE_URL}/en/comparatifs/${canonicalSlug}`;
  const ogImage = `${SITE_URL}/og/comparatifs/${canonicalSlug}.png`;

  const title = cleanText(comp.metaTitle ?? comp.title, 70);
  const description = cleanText(comp.metaDesc ?? comp.desc ?? comp.intro, 160);
  const publishedTime = data.publishedAt ?? data.date?.en;
  const modifiedTime = data.updatedAtIso ?? data.publishedAt ?? data.date?.en;
  const winner = data.tools.find((tool) => tool.name === data.winner);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: canonicalUrl,
    image: [ogImage, OG_DEFAULT],
    datePublished: publishedTime,
    dateModified: modifiedTime,
    inLanguage: lang,
    articleSection: data.tag,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
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
      sameAs: [`https://twitter.com/${TWITTER_HANDLE.replace("@", "")}`],
    },
    about: data.tools.map((tool) => ({
      "@type": "SoftwareApplication",
      name: tool.name,
      applicationCategory: "BusinessApplication",
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
        name: lang === "fr" ? "Comparatifs" : "Comparisons",
        item: `${SITE_URL}/${lang}/comparatifs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: canonicalUrl,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description,
    url: canonicalUrl,
    numberOfItems: data.tools.length,
    itemListElement: [...data.tools]
      .sort((a, b) => b.globalScore - a.globalScore)
      .map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: tool.affiliate ?? canonicalUrl,
        item: {
          "@type": "SoftwareApplication",
          name: tool.name,
          applicationCategory: "BusinessApplication",
          description: tool.verdict?.[lang] ?? "",
          offers: {
            "@type": "Offer",
            price: extractPrice(tool.price),
            priceCurrency: "USD",
            url: tool.affiliate ?? canonicalUrl,
            availability: "https://schema.org/InStock",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: tool.globalScore.toFixed(1),
            bestRating: "10",
            worstRating: "0",
            ratingCount: "1",
          },
        },
      })),
  };

  const winnerSchema = winner
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: winner.name,
        applicationCategory: "BusinessApplication",
        description: winner.verdict?.[lang] ?? comp.verdict ?? description,
        url: winner.affiliate ?? canonicalUrl,
        offers: {
          "@type": "Offer",
          price: extractPrice(winner.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: winner.affiliate ?? canonicalUrl,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: winner.globalScore.toFixed(1),
          bestRating: "10",
          worstRating: "0",
          ratingCount: "1",
        },
      }
    : null;

  const faqMatches =
    comp.content?.match(/^### (.+)\n\n([\s\S]+?)(?=\n###|\n##|$)/gm) ?? [];

  const faqSchema =
    faqMatches.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqMatches.slice(0, 8).map((block) => {
            const lines = block.trim().split("\n\n");
            const question = lines[0].replace(/^### /, "").trim();
            const answer = lines
              .slice(1)
              .join(" ")
              .replace(/\*\*/g, "")
              .replace(/\*/g, "")
              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
              .replace(/\s+/g, " ")
              .trim();

            return {
              "@type": "Question",
              name: question,
              acceptedAnswer: {
                "@type": "Answer",
                text: answer,
              },
            };
          }),
        }
      : null;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${lang}/comparatifs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const schemas = [
    articleSchema,
    breadcrumbSchema,
    itemListSchema,
    winnerSchema,
    faqSchema,
    websiteSchema,
  ].filter(Boolean);

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      ))}

      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="fr" href={frUrl} />
      <link rel="alternate" hrefLang="fr-FR" href={frUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="en-US" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={frUrl} />

      <Suspense fallback={null}>
        <ComparatifClient lang={lang} slug={canonicalSlug} />
      </Suspense>
    </>
  );
}