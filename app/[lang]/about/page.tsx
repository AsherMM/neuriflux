import { use } from "react";
import { Metadata } from "next";
import AboutClient from "./AboutClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `https://neuriflux.com/${lang}/about`;
  return {
    title: lang === "fr" ? "À propos — Neuriflux, média indépendant IA" : "About — Neuriflux, independent AI media",
    description: lang === "fr"
      ? "Neuriflux est un média indépendant dédié aux outils IA. Tests réels, avis honnêtes, zéro conflit d'intérêt. Découvrez notre équipe et notre méthode."
      : "Neuriflux is an independent media dedicated to AI tools. Real tests, honest reviews, zero conflict of interest. Discover our team and methodology.",
    alternates: {
      canonical: url,
      languages: { fr: "https://neuriflux.com/fr/about", en: "https://neuriflux.com/en/about", "x-default": "https://neuriflux.com/en/about" },
    },
    openGraph: {
      title: lang === "fr" ? "À propos | Neuriflux" : "About | Neuriflux",
      description: lang === "fr"
        ? "Média indépendant IA. Tests réels, avis honnêtes, zéro bullshit."
        : "Independent AI media. Real tests, honest reviews, zero bullshit.",
      url,
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      siteName: "Neuriflux",
    },
    twitter: {
      card: "summary",
      title: lang === "fr" ? "À propos | Neuriflux" : "About | Neuriflux",
      description: lang === "fr" ? "Média indépendant IA. Tests réels, avis honnêtes." : "Independent AI media. Real tests, honest reviews.",
    },
  };
}

export default function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <AboutClient lang={lang === "en" ? "en" : "fr"} />;
}