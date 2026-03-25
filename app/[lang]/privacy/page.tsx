import { use } from "react";
import { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `https://neuriflux.com/${lang}/privacy`;
  return {
    title: lang === "fr" ? "Politique de confidentialité | Neuriflux" : "Privacy Policy | Neuriflux",
    description: lang === "fr"
      ? "Politique de confidentialité de Neuriflux. Comment nous collectons, utilisons et protégeons vos données personnelles."
      : "Neuriflux privacy policy. How we collect, use and protect your personal data.",
    alternates: {
      canonical: url,
      languages: { fr: "https://neuriflux.com/fr/privacy", en: "https://neuriflux.com/en/privacy", "x-default": "https://neuriflux.com/en/privacy" },
    },
    robots: { index: false, follow: false },
  };
}

export default function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <PrivacyClient lang={lang === "en" ? "en" : "fr"} />;
}