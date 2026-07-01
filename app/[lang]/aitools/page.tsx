import type { Metadata } from "next";
import AiToolDirectoryClient from "./AiToolDirectoryClient";

type PageProps = {
  params: Promise<{ lang: "fr" | "en" }> | { lang: "fr" | "en" };
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://neuriflux.com").replace(/\/$/, "");

const META = {
  fr: {
    title: "Annuaire IA 2026 : les meilleurs outils IA comparés | Neuriflux",
    description:
      "Explorez l'annuaire IA Neuriflux : meilleurs outils IA 2026, scores Neuriflux, favoris, comparaisons, filtres par prix, catégorie, plateforme, API, open source et cas d'usage.",
    keywords: [
      "annuaire IA",
      "outils IA",
      "meilleurs outils IA 2026",
      "comparatif IA",
      "ChatGPT",
      "Claude",
      "Cursor",
      "Perplexity",
      "AI tools directory",
      "Neuriflux",
    ],
  },
  en: {
    title: "AI Tools Directory 2026: Best AI Tools Ranked | Neuriflux",
    description:
      "Explore the Neuriflux AI Tools Directory: best AI tools in 2026, Neuriflux scores, favorites, comparisons, filters by price, category, platform, API, open source and use case.",
    keywords: [
      "AI tools directory",
      "best AI tools",
      "AI tools 2026",
      "AI software directory",
      "AI comparison",
      "ChatGPT",
      "Claude",
      "Cursor",
      "Perplexity",
      "Neuriflux",
    ],
  },
} as const;

async function getLang(params: PageProps["params"]): Promise<"fr" | "en"> {
  const resolved = await params;
  return resolved?.lang === "en" ? "en" : "fr";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = await getLang(params);
  const meta = META[lang];
  const path = `/${lang}/ai-tools`;
  const url = `${SITE_URL}${path}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        fr: `${SITE_URL}/fr/ai-tools`,
        en: `${SITE_URL}/en/ai-tools`,
        "x-default": `${SITE_URL}/en/ai-tools`,
      },
    },
    openGraph: {
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      url,
      siteName: "Neuriflux",
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: `${SITE_URL}/og/ai-tools-directory.png`,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [`${SITE_URL}/og/ai-tools-directory.png`],
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

export default async function AiToolsDirectoryPage({ params }: PageProps) {
  const lang = await getLang(params);
  const url = `${SITE_URL}/${lang}/ai-tools`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: META[lang].title,
        description: META[lang].description,
        inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}#website` },
        about: [
          { "@type": "Thing", name: "AI tools" },
          { "@type": "Thing", name: "Artificial intelligence software" },
          { "@type": "Thing", name: "AI comparison" },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Neuriflux",
            item: `${SITE_URL}/${lang}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: lang === "fr" ? "Annuaire IA" : "AI Tools Directory",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: lang === "fr" ? "Comment choisir le bon outil IA ?" : "How do I choose the right AI tool?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                lang === "fr"
                  ? "Comparez votre cas d'usage, votre budget, votre niveau technique, les plateformes compatibles, la disponibilité d'une API, les limites de confidentialité et le score Neuriflux."
                  : "Compare your use case, budget, technical level, supported platforms, API availability, privacy limits and the Neuriflux score.",
            },
          },
          {
            "@type": "Question",
            name: lang === "fr" ? "L'annuaire Neuriflux remplace-t-il l'AI Finder ?" : "Does the Neuriflux directory replace the AI Finder?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                lang === "fr"
                  ? "Non. L'annuaire sert à explorer et comparer les outils IA. L'AI Finder sert à obtenir une recommandation personnalisée en fonction de votre besoin."
                  : "No. The directory helps you explore and compare AI tools. The AI Finder gives you a personalized recommendation based on your needs.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AiToolDirectoryClient lang={lang} />
    </>
  );
}
