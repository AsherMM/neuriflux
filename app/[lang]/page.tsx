import type { Metadata } from "next";
import HomeClient from "./HomeClient";

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

  const title = isFR
    ? "Neuriflux — Meilleurs outils IA 2026 comparés avec tests réels"
    : "Neuriflux — Best AI Tools 2026 Compared With Real Tests";

  const description = isFR
    ? "Comparez les meilleurs outils IA en 2026 : ChatGPT, Claude, Gemini, Midjourney, Runway, Cursor et plus. Tests réels, scores détaillés, verdicts honnêtes."
    : "Compare the best AI tools in 2026: ChatGPT, Claude, Gemini, Midjourney, Runway, Cursor and more. Real tests, detailed scores, honest verdicts.";

  const url = `${SITE_URL}/${lang}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: [
      "AI tools",
      "AI tools 2026",
      "AI comparison",
      "AI reviews",
      "best AI tools",
      "ChatGPT",
      "Claude",
      "Gemini",
      "Midjourney",
      "Runway",
      "Cursor AI",
      "outils IA",
      "comparatif IA",
      "meilleurs outils IA",
      "avis IA",
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: url,
      languages: {
        fr: `${SITE_URL}/fr`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: isFR ? "fr_FR" : "en_US",
      alternateLocale: isFR ? "en_US" : "fr_FR",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: isFR
            ? "Neuriflux — Comparatifs d'outils IA"
            : "Neuriflux — AI tools comparisons",
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
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["en", "fr"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${lang}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <HomeClient lang={lang === "en" ? "en" : "fr"} />
    </>
  );
}