import type { Metadata } from "next";
import AiToolDirectoryClient from "./AiToolDirectoryClient";

type Lang = "fr" | "en";

type PageProps = {
  params: Promise<{
    lang: Lang;
  }>;
};

const SITE_URL = "https://neuriflux.com";

function normalizeLang(value: unknown): Lang {
  return value === "fr" ? "fr" : "en";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = normalizeLang(rawLang);

  const title =
    lang === "fr"
      ? "Annuaire des outils IA 2026 | Neuriflux"
      : "AI Tools Directory 2026 | Neuriflux";

  const description =
    lang === "fr"
      ? "Explorez les meilleurs outils IA en 2026 : ChatGPT, Claude, Gemini, Cursor, Perplexity, Runway, ElevenLabs, n8n et plus encore. Scores Neuriflux, filtres, favoris et comparaisons."
      : "Explore the best AI tools in 2026: ChatGPT, Claude, Gemini, Cursor, Perplexity, Runway, ElevenLabs, n8n and more. Neuriflux scores, filters, favorites and comparisons.";

  const path = `/${lang}/aitools`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        fr: `${SITE_URL}/fr/aitools`,
        en: `${SITE_URL}/en/aitools`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Neuriflux",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang = normalizeLang(rawLang);

  return <AiToolDirectoryClient lang={lang} />;
}
