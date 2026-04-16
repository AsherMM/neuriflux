import { use } from "react";
import { Metadata } from "next";
import HomeClient from "./HomeClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const isFR = lang === "fr";

  const title = isFR
    ? "Neuriflux — Meilleurs outils IA 2026 comparés (tests réels)"
    : "Neuriflux — Best AI Tools 2026 Compared (Real Tests)";

  const description = isFR
    ? "Comparatif des meilleurs outils IA en 2026 : ChatGPT, Claude, Gemini, Midjourney, Runway. Tests réels, scores détaillés, verdicts honnêtes."
    : "Compare the best AI tools in 2026: ChatGPT, Claude, Gemini, Midjourney, Runway. Real tests, detailed scores, honest verdicts.";

  return {
    metadataBase: new URL("https://neuriflux.com"),

    title,
    description,

    keywords: [
      "AI tools",
      "comparatif IA",
      "ChatGPT vs Claude",
      "meilleur outil IA",
      "AI comparison 2026",
      "Midjourney vs DALL-E",
      "AI reviews",
    ],

    authors: [{ name: "Neuriflux" }],

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: `https://neuriflux.com/${lang}`,
      languages: {
        fr: "https://neuriflux.com/fr",
        en: "https://neuriflux.com/en",
        "x-default": "https://neuriflux.com/en",
      },
    },

    openGraph: {
      type: "website",
      url: `https://neuriflux.com/${lang}`,
      title,
      description,
      siteName: "Neuriflux",
      locale: isFR ? "fr_FR" : "en_US",
      images: [
        {
          url: "https://neuriflux.com/og-image.png",
          width: 1200,
          height: 630,
          alt: "Neuriflux AI Comparisons",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://neuriflux.com/og-image.png"],
    },
  };
}

export default function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);

  return (
    <>
      {/* 🔥 STRUCTURED DATA SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Neuriflux",
            url: "https://neuriflux.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://neuriflux.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <HomeClient lang={lang === "en" ? "en" : "fr"} />
    </>
  );
}