import { use } from "react";
import type { Metadata } from "next";
import ComparatifsClient from "./ComparatifsClient";
import { COMPARATIFS, getAllComparatifTags } from "../lib/comparatifs";

type Lang = "fr" | "en";

const SITE_URL = "https://neuriflux.com";
const OG_DEFAULT = `${SITE_URL}/og-image-v4.png`;

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const url = `${SITE_URL}/${lang}/comparatifs`;
  const frUrl = `${SITE_URL}/fr/comparatifs`;
  const enUrl = `${SITE_URL}/en/comparatifs`;

  const title = lang === "fr"
    ? "Comparatifs IA 2026 — Tests réels, scores détaillés & verdicts | Neuriflux"
    : "AI Comparisons 2026 — Real Tests, Detailed Scores & Verdicts | Neuriflux";

  const description = lang === "fr"
    ? "Comparatifs complets d'outils IA : ChatGPT vs Claude vs Gemini, Cursor vs Windsurf, Midjourney vs DALL·E, n8n vs Make vs Zapier et plus. Scores objectifs, tests réels, verdicts sans filtre."
    : "Complete AI tool comparisons: ChatGPT vs Claude vs Gemini, Cursor vs Windsurf, Midjourney vs DALL·E, n8n vs Make vs Zapier and more. Objective scores, real-world tests, unfiltered verdicts.";

  // Keywords dynamiques depuis le catalogue réel
  const featuredTools = COMPARATIFS
    .filter((c) => c.featured)
    .flatMap((c) => c.tools.map((t) => t.name))
    .slice(0, 20);

  const tags = getAllComparatifTags(lang).slice(0, 8);

  const keywords = [
    ...featuredTools,
    ...tags,
    lang === "fr" ? "comparatif IA 2026" : "AI comparison 2026",
    lang === "fr" ? "meilleur outil IA" : "best AI tool",
    lang === "fr" ? "test IA" : "AI review",
    lang === "fr" ? "avis outil IA" : "AI tool review",
    "Neuriflux",
    "2026",
  ];

  return {
    title,
    description,

    // ── Canonique + hrefLang ────────────────────────────────────────────────
    alternates: {
      canonical: url,
      languages: {
        fr: frUrl,
        en: enUrl,
        "x-default": frUrl, // FR = version principale
      },
    },

    // ── Open Graph ──────────────────────────────────────────────────────────
    openGraph: {
      title: lang === "fr"
        ? "Comparatifs IA 2026 — Tests & Scores | Neuriflux"
        : "AI Comparisons 2026 — Tests & Scores | Neuriflux",
      description,
      url,
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      alternateLocale: lang === "fr" ? "en_US" : "fr_FR",
      siteName: "Neuriflux",
      images: [
        {
          url: OG_DEFAULT,
          width: 1200,
          height: 630,
          alt: lang === "fr"
            ? "Neuriflux — Comparatifs IA 2026"
            : "Neuriflux — AI Comparisons 2026",
          type: "image/png",
        },
      ],
    },

    // ── Twitter / X Card ────────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image",
      site: "@NeurifluxCom",
      creator: "@NeurifluxCom",
      title: lang === "fr"
        ? "Comparatifs IA 2026 | Neuriflux"
        : "AI Comparisons 2026 | Neuriflux",
      description: lang === "fr"
        ? "Tests réels, scores objectifs, verdicts sans filtre sur les meilleurs outils IA."
        : "Real-world tests, objective scores, unfiltered verdicts on the best AI tools.",
      images: [OG_DEFAULT],
    },

    // ── Keywords ────────────────────────────────────────────────────────────
    keywords,

    // ── Robots ──────────────────────────────────────────────────────────────
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

    authors: [{ name: "Neuriflux", url: SITE_URL }],
    category: lang === "fr" ? "Comparatifs IA" : "AI Comparisons",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ComparatifsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const resolvedLang: Lang = lang === "en" ? "en" : "fr";

  // Données pour les schemas — calculées côté serveur
  const featured = COMPARATIFS.filter((c) => c.featured);
  const totalCount = COMPARATIFS.length;

  // ── Schemas JSON-LD ──────────────────────────────────────────────────────
  const collectionUrl = `${SITE_URL}/${resolvedLang}/comparatifs`;

  // 1. CollectionPage — page de liste
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: resolvedLang === "fr"
      ? "Comparatifs IA 2026 — Neuriflux"
      : "AI Comparisons 2026 — Neuriflux",
    description: resolvedLang === "fr"
      ? "Tous les comparatifs d'outils IA de Neuriflux — scores détaillés, tests réels, verdicts honnêtes."
      : "All Neuriflux AI tool comparisons — detailed scores, real-world tests, honest verdicts.",
    url: collectionUrl,
    inLanguage: resolvedLang,
    numberOfItems: totalCount,
    publisher: {
      "@type": "Organization",
      name: "Neuriflux",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      sameAs: ["https://twitter.com/NeurifluxCom"],
    },
    // Liste des comparatifs featured dans le schema
    hasPart: featured.map((comp) => ({
      "@type": "Article",
      headline: comp[resolvedLang].title,
      url: `${SITE_URL}/${resolvedLang}/comparatifs/${comp.slug}`,
      datePublished: comp.publishedAt ?? comp.date?.en,
      dateModified: comp.updatedAtIso ?? comp.publishedAt ?? comp.date?.en,
      description: comp[resolvedLang].desc ?? comp[resolvedLang].intro?.slice(0, 160),
    })),
  };

  // 2. BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Neuriflux", item: `${SITE_URL}/${resolvedLang}` },
      {
        "@type": "ListItem",
        position: 2,
        name: resolvedLang === "fr" ? "Comparatifs" : "Comparisons",
        item: collectionUrl,
      },
    ],
  };

  // 3. ItemList — les comparatifs featured (rich snippets liste)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: resolvedLang === "fr"
      ? "Meilleurs comparatifs d'outils IA 2026"
      : "Best AI Tool Comparisons 2026",
    url: collectionUrl,
    numberOfItems: featured.length,
    itemListElement: featured.map((comp, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: comp[resolvedLang].title,
      url: `${SITE_URL}/${resolvedLang}/comparatifs/${comp.slug}`,
      item: {
        "@type": "Article",
        headline: comp[resolvedLang].title,
        description: comp[resolvedLang].desc ?? comp[resolvedLang].intro?.slice(0, 160),
        url: `${SITE_URL}/${resolvedLang}/comparatifs/${comp.slug}`,
        datePublished: comp.publishedAt ?? comp.date?.en,
        author: { "@type": "Organization", name: "Neuriflux" },
      },
    })),
  };

  // 4. WebSite SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Neuriflux",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${resolvedLang}/comparatifs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // 5. FAQPage — questions fréquentes sur les comparatifs (static, haute valeur SEO)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: resolvedLang === "fr"
      ? [
          {
            "@type": "Question",
            name: "ChatGPT ou Claude — lequel est le meilleur en 2026 ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Claude 3.7 Sonnet domine sur la rédaction et l'analyse avec un score de 9.2/10. ChatGPT reste le plus polyvalent avec son écosystème de plugins. Notre comparatif complet teste les deux sur 50 cas d'usage réels. Voir notre comparatif ChatGPT vs Claude vs Gemini sur ${SITE_URL}/fr/comparatifs/chatgpt-vs-claude-vs-gemini`,
            },
          },
          {
            "@type": "Question",
            name: "Quel outil d'automatisation choisir entre n8n, Make et Zapier ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Make remporte notre comparatif avec un score de 8.9/10 pour son meilleur rapport qualité/prix. n8n est idéal pour les équipes techniques qui veulent le self-hosting. Zapier reste le plus simple mais le plus cher. Voir notre comparatif n8n vs Make vs Zapier sur ${SITE_URL}/fr/comparatifs/n8n-vs-make-vs-zapier-2026`,
            },
          },
          {
            "@type": "Question",
            name: "Midjourney ou DALL·E pour générer des images IA ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Midjourney obtient 9.1/10 pour la qualité artistique et reste la référence créative. DALL·E 3 (8.0/10) est plus accessible via ChatGPT et suit mieux les instructions précises. Stable Diffusion est gratuit et open source. Voir notre comparatif complet sur ${SITE_URL}/fr/comparatifs/midjourney-vs-dalle-vs-stable-diffusion`,
            },
          },
          {
            "@type": "Question",
            name: "Comment Neuriflux note-t-il les outils IA dans ses comparatifs ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Neuriflux teste chaque outil pendant minimum 3 semaines sur des projets réels. Les scores sont calculés sur 6 critères pondérés spécifiques à chaque catégorie, notés de 0 à 10. Aucun éditeur ne finance nos verdicts — nous sommes 100% indépendants avec des liens affiliés toujours signalés.",
            },
          },
        ]
      : [
          {
            "@type": "Question",
            name: "ChatGPT or Claude — which is better in 2026?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Claude 3.7 Sonnet leads on writing and analysis with a score of 9.2/10. ChatGPT remains the most versatile with its plugin ecosystem. Our full comparison tests both across 50 real-world use cases. See our ChatGPT vs Claude vs Gemini comparison at ${SITE_URL}/en/comparatifs/chatgpt-vs-claude-vs-gemini`,
            },
          },
          {
            "@type": "Question",
            name: "Which automation tool to choose between n8n, Make, and Zapier?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Make wins our comparison with a score of 8.9/10 for its best value for money. n8n is ideal for technical teams wanting self-hosting. Zapier is simplest but most expensive. See our n8n vs Make vs Zapier comparison at ${SITE_URL}/en/comparatifs/n8n-vs-make-vs-zapier-2026`,
            },
          },
          {
            "@type": "Question",
            name: "Midjourney or DALL·E for AI image generation?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Midjourney scores 9.1/10 for artistic quality and remains the creative reference. DALL·E 3 (8.0/10) is more accessible via ChatGPT and follows precise instructions better. Stable Diffusion is free and open source. See our full comparison at ${SITE_URL}/en/comparatifs/midjourney-vs-dalle-vs-stable-diffusion`,
            },
          },
          {
            "@type": "Question",
            name: "How does Neuriflux score AI tools in its comparisons?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Neuriflux tests each tool for a minimum of 3 weeks on real projects. Scores are calculated across 6 weighted criteria specific to each category, rated 0 to 10. No publisher funds our verdicts — we are 100% independent with affiliate links always disclosed.",
            },
          },
        ],
  };

  const fontUrl =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap";

  return (
    <>
      {/* Schemas JSON-LD côté serveur */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Fonts non-bloquants */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preload" as="style" href={fontUrl} />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${fontUrl}';document.head.appendChild(l);})();`,
        }}
      />

      <ComparatifsClient lang={resolvedLang} />
    </>
  );
}