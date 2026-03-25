import { use } from "react";
import { Metadata } from "next";
import ComparatifsClient from "./ComparatifsClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `https://neuriflux.com/${lang}/comparatifs`;

  return {
    title: lang === "fr"
      ? "Comparatifs IA 2026 — Tests & Scores détaillés | Neuriflux"
      : "AI Comparisons 2026 — Tests & Detailed Scores | Neuriflux",
    description: lang === "fr"
      ? "Tous nos comparatifs d'outils IA : ChatGPT vs Claude, Cursor vs Copilot, Midjourney vs DALL-E et plus. Scores détaillés, verdicts honnêtes."
      : "All our AI tool comparisons: ChatGPT vs Claude, Cursor vs Copilot, Midjourney vs DALL-E and more. Detailed scores, honest verdicts.",
    alternates: {
      canonical: url,
      languages: {
        fr: "https://neuriflux.com/fr/comparatifs",
        en: "https://neuriflux.com/en/comparatifs",
        "x-default": "https://neuriflux.com/en/comparatifs",
      },
    },
    openGraph: {
      title: lang === "fr"
        ? "Comparatifs IA 2026 | Neuriflux"
        : "AI Comparisons 2026 | Neuriflux",
      description: lang === "fr"
        ? "Tous nos comparatifs d'outils IA avec scores détaillés et verdicts honnêtes."
        : "All our AI tool comparisons with detailed scores and honest verdicts.",
      url,
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      siteName: "Neuriflux",
    },
    twitter: {
      card: "summary_large_image",
      title: lang === "fr" ? "Comparatifs IA 2026 | Neuriflux" : "AI Comparisons 2026 | Neuriflux",
      description: lang === "fr"
        ? "Tests honnêtes, scores détaillés, verdicts clairs."
        : "Honest tests, detailed scores, clear verdicts.",
    },
  };
}

export default function ComparatifsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <ComparatifsClient lang={lang === "en" ? "en" : "fr"} />;
}