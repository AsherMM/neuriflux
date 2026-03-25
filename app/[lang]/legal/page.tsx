import { use } from "react";
import { Metadata } from "next";
import LegalClient from "./LegalClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `https://neuriflux.com/${lang}/legal`;
  return {
    title: lang === "fr" ? "Mentions légales | Neuriflux" : "Legal Notice | Neuriflux",
    description: lang === "fr"
      ? "Mentions légales de Neuriflux — éditeur, hébergeur, propriété intellectuelle."
      : "Neuriflux legal notice — publisher, host, intellectual property.",
    alternates: {
      canonical: url,
      languages: { fr: "https://neuriflux.com/fr/legal", en: "https://neuriflux.com/en/legal", "x-default": "https://neuriflux.com/en/legal" },
    },
    robots: { index: false, follow: false },
  };
}

export default function LegalPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <LegalClient lang={lang === "en" ? "en" : "fr"} />;
}