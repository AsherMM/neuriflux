import type { Metadata } from "next";
import ComparatifsClient from "./ComparatifsClient";
import { COMPARATIFS, getAllComparatifTags } from "../lib/comparatifs";

type Lang = "fr" | "en";

type PageProps = {
  params: Promise<{ lang: Lang }>;
};

const SITE_URL = "https://neuriflux.com";
const SITE_NAME = "Neuriflux";
const DEFAULT_LANG: Lang = "en";
const OG_IMAGE = "/og-image-v4.png";

const getLang = (lang?: string): Lang => (lang === "fr" ? "fr" : "en");
const getUrl = (lang: Lang, path = "") => `${SITE_URL}/${lang}${path}`;
const getComparatifUrl = (lang: Lang, slug: string) => getUrl(lang, `/comparatifs/${slug}`);

const unique = <T,>(items: T[]) => [...new Set(items.filter(Boolean))];

const toIsoDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const getPublishedDate = (comp: (typeof COMPARATIFS)[number]) =>
  toIsoDate(comp.publishedAt ?? comp.date?.en);

const getModifiedDate = (comp: (typeof COMPARATIFS)[number]) =>
  toIsoDate(comp.updatedAtIso ?? comp.publishedAt ?? comp.date?.en);

const getComparisonDescription = (comp: (typeof COMPARATIFS)[number], lang: Lang) =>
  comp[lang].desc ?? comp[lang].intro?.slice(0, 160) ?? "";

const getBestTool = (comp: (typeof COMPARATIFS)[number]) => {
  const winner = comp.tools.find((tool) => tool.name === comp.winner);
  return winner ?? [...comp.tools].sort((a, b) => b.globalScore - a.globalScore)[0];
};

const getToolNames = (comp: (typeof COMPARATIFS)[number]) =>
  comp.tools.map((tool) => tool.name).join(" vs ");

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = getLang(rawLang);
  const isFR = lang === "fr";

  const url = getUrl(lang, "/comparatifs");
  const frUrl = getUrl("fr", "/comparatifs");
  const enUrl = getUrl("en", "/comparatifs");

  const title = isFR
    ? "Comparatifs IA 2026 — Tests réels, scores détaillés & verdicts | Neuriflux"
    : "AI Comparisons 2026 — Real Tests, Detailed Scores & Verdicts | Neuriflux";

  const description = isFR
    ? "Comparez les meilleurs outils IA en 2026 : ChatGPT, Claude, Gemini, Cursor, Midjourney, Runway, n8n, Make, Zapier et plus. Tests réels, scores objectifs, verdicts clairs."
    : "Compare the best AI tools in 2026: ChatGPT, Claude, Gemini, Cursor, Midjourney, Runway, n8n, Make, Zapier and more. Real tests, objective scores, clear verdicts.";

  const featuredTools = COMPARATIFS
    .filter((comparatif) => comparatif.featured)
    .flatMap((comparatif) => comparatif.tools.map((tool) => tool.name))
    .slice(0, 24);

  const tags = getAllComparatifTags(lang).slice(0, 12);

  const keywords = unique([
    ...featuredTools,
    ...tags,
    isFR ? "comparatifs IA" : "AI comparisons",
    isFR ? "comparatif IA 2026" : "AI comparison 2026",
    isFR ? "meilleurs outils IA" : "best AI tools",
    isFR ? "meilleur outil IA" : "best AI tool",
    isFR ? "tests outils IA" : "AI tool testing",
    isFR ? "avis outils IA" : "AI tool reviews",
    isFR ? "benchmark IA" : "AI benchmarks",
    "ChatGPT vs Claude vs Gemini",
    "Cursor vs Copilot",
    "Midjourney vs DALL-E",
    "Runway vs Kling",
    "n8n vs Make vs Zapier",
    SITE_NAME,
    "2026",
  ]);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: isFR ? "Comparatifs IA" : "AI Comparisons",
    classification: "Technology",
    keywords,
    alternates: {
      canonical: url,
      languages: {
        fr: frUrl,
        en: enUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      type: "website",
      url,
      title: isFR
        ? "Comparatifs IA 2026 — Tests & Scores | Neuriflux"
        : "AI Comparisons 2026 — Tests & Scores | Neuriflux",
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
            ? "Neuriflux — Comparatifs des meilleurs outils IA"
            : "Neuriflux — Best AI tools comparisons",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@NeurifluxCom",
      creator: "@NeurifluxCom",
      title: isFR ? "Comparatifs IA 2026 | Neuriflux" : "AI Comparisons 2026 | Neuriflux",
      description: isFR
        ? "Tests réels, scores objectifs et verdicts clairs sur les meilleurs outils IA."
        : "Real-world tests, objective scores and clear verdicts on the best AI tools.",
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

export default async function ComparatifsPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang = getLang(rawLang);
  const isFR = lang === "fr";

  const collectionUrl = getUrl(lang, "/comparatifs");
  const featured = COMPARATIFS.filter((comparatif) => comparatif.featured);
  const highlighted = featured.length > 0 ? featured : COMPARATIFS.slice(0, 8);

  const organization = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
    },
    sameAs: ["https://twitter.com/NeurifluxCom"],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isFR ? "Comparatifs IA 2026 — Neuriflux" : "AI Comparisons 2026 — Neuriflux",
    description: isFR
      ? "Tous les comparatifs d'outils IA de Neuriflux : scores détaillés, tests réels et verdicts honnêtes."
      : "All Neuriflux AI tool comparisons: detailed scores, real-world tests and honest verdicts.",
    url: collectionUrl,
    inLanguage: lang,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: organization,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: COMPARATIFS.length,
      itemListElement: COMPARATIFS.map((comparatif, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getComparatifUrl(lang, comparatif.slug),
        name: comparatif[lang].title,
      })),
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
        item: getUrl(lang),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isFR ? "Comparatifs" : "Comparisons",
        item: collectionUrl,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isFR ? "Meilleurs comparatifs d'outils IA 2026" : "Best AI tool comparisons 2026",
    url: collectionUrl,
    numberOfItems: highlighted.length,
    itemListElement: highlighted.map((comparatif, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: comparatif[lang].title,
      url: getComparatifUrl(lang, comparatif.slug),
      item: {
        "@type": "Article",
        headline: comparatif[lang].title,
        description: getComparisonDescription(comparatif, lang),
        url: getComparatifUrl(lang, comparatif.slug),
        datePublished: getPublishedDate(comparatif),
        dateModified: getModifiedDate(comparatif),
        author: organization,
        publisher: organization,
      },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: isFR
      ? [
          {
            "@type": "Question",
            name: "Comment choisir le meilleur outil IA en 2026 ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Le meilleur outil IA dépend du cas d'usage : rédaction, code, image, vidéo, automatisation ou productivité. Neuriflux compare les outils avec des tests réels, des scores détaillés et un verdict clair pour chaque catégorie.",
            },
          },
          {
            "@type": "Question",
            name: "Les comparatifs Neuriflux sont-ils indépendants ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui. Les comparatifs sont construits autour de tests pratiques, de critères visibles et de limites clairement expliquées. Les liens affiliés peuvent exister, mais ils ne déterminent pas le verdict éditorial.",
            },
          },
          {
            "@type": "Question",
            name: "Quels types d'outils IA sont comparés ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Neuriflux compare des chatbots IA, assistants de code, générateurs d'images, outils vidéo, outils vocaux, plateformes d'automatisation, outils de rédaction et solutions de productivité.",
            },
          },
          {
            "@type": "Question",
            name: "Comment Neuriflux note-t-il les outils IA ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Chaque comparaison repose sur des critères adaptés à la catégorie : qualité des résultats, facilité d'utilisation, prix, fiabilité, intégrations, confidentialité et limites réelles observées pendant les tests.",
            },
          },
        ]
      : [
          {
            "@type": "Question",
            name: "How do I choose the best AI tool in 2026?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The best AI tool depends on the use case: writing, coding, image generation, video, automation or productivity. Neuriflux compares tools with real-world tests, detailed scores and clear verdicts for each category.",
            },
          },
          {
            "@type": "Question",
            name: "Are Neuriflux comparisons independent?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Comparisons are based on practical tests, visible criteria and clearly explained limitations. Affiliate links may exist, but they do not determine the editorial verdict.",
            },
          },
          {
            "@type": "Question",
            name: "What types of AI tools does Neuriflux compare?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Neuriflux compares AI chatbots, coding assistants, image generators, video tools, voice tools, automation platforms, writing tools and productivity solutions.",
            },
          },
          {
            "@type": "Question",
            name: "How does Neuriflux score AI tools?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Each comparison uses criteria adapted to the category: output quality, ease of use, pricing, reliability, integrations, privacy and real limitations observed during testing.",
            },
          },
        ],
  };

  const comparisonSchema = highlighted.slice(0, 6).map((comparatif) => {
    const bestTool = getBestTool(comparatif);

    return {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@type": "SoftwareApplication",
        name: getToolNames(comparatif),
        applicationCategory: "AIApplication",
        operatingSystem: "Web",
      },
      name: comparatif[lang].title,
      reviewBody: getComparisonDescription(comparatif, lang),
      url: getComparatifUrl(lang, comparatif.slug),
      author: organization,
      publisher: organization,
      datePublished: getPublishedDate(comparatif),
      dateModified: getModifiedDate(comparatif),
      reviewRating: bestTool
        ? {
            "@type": "Rating",
            ratingValue: bestTool.globalScore.toFixed(1),
            bestRating: "10",
            worstRating: "1",
          }
        : undefined,
    };
  });

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {comparisonSchema.map((schema) => (
        <script
          key={schema.url}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <ComparatifsClient lang={lang} />
    </>
  );
}
