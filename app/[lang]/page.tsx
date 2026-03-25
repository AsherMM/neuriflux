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
  return {
    title: lang === "fr"
      ? "Neuriflux — Comparatifs honnêtes d'outils IA"
      : "Neuriflux — Honest AI Tools Comparisons",
    description: lang === "fr"
      ? "Neuriflux teste et compare les meilleurs outils IA. Comparatifs honnêtes, scores détaillés, verdicts clairs — sans bullshit."
      : "Neuriflux tests and compares the best AI tools. Honest comparisons, detailed scores, clear verdicts — no bullshit.",
    alternates: {
      canonical: `https://neuriflux.com/${lang}`,
      languages: {
        fr: "https://neuriflux.com/fr",
        en: "https://neuriflux.com/en",
        "x-default": "https://neuriflux.com/en",
      },
    },
    openGraph: {
      title: lang === "fr"
        ? "Neuriflux — Comparatifs honnêtes d'outils IA"
        : "Neuriflux — Honest AI Tools Comparisons",
      locale: lang === "fr" ? "fr_FR" : "en_US",
    },
  };
}

export default function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <HomeClient lang={lang === "en" ? "en" : "fr"} />;
}