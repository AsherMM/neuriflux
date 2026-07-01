import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AiToolDirectoryClient from "./AiToolDirectoryClient";

type Lang = "fr" | "en";
type PageProps = { params: Promise<{ lang: string }> | { lang: string } };

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://neuriflux.com").replace(/\/$/, "");

const META: Record<Lang, { title: string; description: string; keywords: string[] }> = {
  fr: {
    title: "Annuaire outils IA 2026 : meilleurs outils IA, scores, filtres et comparatifs | Neuriflux",
    description: "Explorez les meilleurs outils IA 2026 sur une seule page : ChatGPT, Claude, Gemini, Cursor, Claude Code, Kilo Code, Cline, Runway, Veo, Perplexity, ElevenLabs, n8n, Flux et plus. Scores Neuriflux, filtres avancés, alternatives et comparatifs.",
    keywords: ["outils IA", "annuaire IA", "meilleurs outils IA 2026", "AI tools", "comparatif IA", "ChatGPT", "Claude", "Cursor", "Claude Code", "Kilo Code", "Cline", "Perplexity", "Runway", "Veo", "n8n"],
  },
  en: {
    title: "AI Tools Directory 2026: Best AI Tools, Scores, Filters and Comparisons | Neuriflux",
    description: "Explore the best AI tools in 2026 on one page: ChatGPT, Claude, Gemini, Cursor, Claude Code, Kilo Code, Cline, Runway, Veo, Perplexity, ElevenLabs, n8n, Flux and more. Neuriflux scores, advanced filters, alternatives and comparisons.",
    keywords: ["AI tools directory", "best AI tools 2026", "AI software", "AI tools list", "AI comparisons", "ChatGPT", "Claude", "Cursor", "Claude Code", "Kilo Code", "Cline", "Perplexity", "Runway", "Veo", "n8n"],
  },
};

async function resolveLang(params: PageProps["params"]): Promise<Lang> {
  const resolved = await params;
  if (resolved.lang !== "fr" && resolved.lang !== "en") notFound();
  return resolved.lang;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = await resolveLang(params);
  const meta = META[lang];
  const url = `${SITE_URL}/${lang}/ai-tools`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: url,
      languages: {
        fr: `${SITE_URL}/fr/ai-tools`,
        en: `${SITE_URL}/en/ai-tools`,
        "x-default": `${SITE_URL}/en/ai-tools`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: "Neuriflux",
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      images: [{ url: `${SITE_URL}/og/ai-tools-directory.png`, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: [`${SITE_URL}/og/ai-tools-directory.png`] },
    robots: { index: true, follow: true },
  };
}

export default async function AiToolsDirectoryPage({ params }: PageProps) {
  const lang = await resolveLang(params);
  const url = `${SITE_URL}/${lang}/ai-tools`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        name: lang === "fr" ? "Annuaire des outils IA Neuriflux" : "Neuriflux AI Tools Directory",
        description: META[lang].description,
        url,
        inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Neuriflux",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/${lang}/ai-tools?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Neuriflux",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${lang}` },
          { "@type": "ListItem", position: 2, name: lang === "fr" ? "Outils IA" : "AI Tools", item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AiToolDirectoryClient lang={lang} />
    </>
  );
}
