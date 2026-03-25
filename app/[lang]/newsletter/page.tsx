import { use } from "react";
import { Metadata } from "next";
import NewsletterClient from "./NewsletterClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `https://neuriflux.com/${lang}/newsletter`;

  return {
    title: lang === "fr"
      ? "Newsletter IA — Le radar IA chaque lundi | Neuriflux"
      : "AI Newsletter — The weekly AI radar | Neuriflux",
    description: lang === "fr"
      ? "Rejoignez 3 200+ lecteurs. Chaque lundi : les meilleurs outils IA, les comparatifs qui comptent, les deals à ne pas rater. Gratuit, sans spam."
      : "Join 3,200+ readers. Every Monday: the best AI tools, comparisons that matter, deals you don't want to miss. Free, no spam.",
    alternates: {
      canonical: url,
      languages: {
        fr: "https://neuriflux.com/fr/newsletter",
        en: "https://neuriflux.com/en/newsletter",
        "x-default": "https://neuriflux.com/en/newsletter",
      },
    },
    openGraph: {
      title: lang === "fr"
        ? "Newsletter IA — Le radar IA chaque lundi | Neuriflux"
        : "AI Newsletter — The weekly AI radar | Neuriflux",
      description: lang === "fr"
        ? "3 200+ lecteurs. Gratuit, sans spam. Les meilleurs outils IA chaque lundi."
        : "3,200+ readers. Free, no spam. The best AI tools every Monday.",
      url,
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      siteName: "Neuriflux",
    },
    twitter: {
      card: "summary_large_image",
      title: lang === "fr" ? "Newsletter IA | Neuriflux" : "AI Newsletter | Neuriflux",
      description: lang === "fr"
        ? "Rejoignez 3 200+ lecteurs. Gratuit, sans spam."
        : "Join 3,200+ readers. Free, no spam.",
    },
  };
}

export default function NewsletterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <NewsletterClient lang={lang === "en" ? "en" : "fr"} />;
}