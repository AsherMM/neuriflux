import { use } from "react";
import { Metadata } from "next";
import CookiesClient from "./CookiesClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `https://neuriflux.com/${lang}/cookies`;
  return {
    title: lang === "fr" ? "Politique de cookies | Neuriflux" : "Cookie Policy | Neuriflux",
    description: lang === "fr"
      ? "Politique de cookies de Neuriflux. Quels cookies nous utilisons et comment les gérer."
      : "Neuriflux cookie policy. Which cookies we use and how to manage them.",
    alternates: {
      canonical: url,
      languages: { fr: "https://neuriflux.com/fr/cookies", en: "https://neuriflux.com/en/cookies", "x-default": "https://neuriflux.com/en/cookies" },
    },
    robots: { index: false, follow: false },
  };
}

export default function CookiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <CookiesClient lang={lang === "en" ? "en" : "fr"} />;
}