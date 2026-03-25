import { use } from "react";
import { Metadata } from "next";
import BlogClient from "./BlogClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `https://neuriflux.com/${lang}/blog`;

  return {
    title: lang === "fr"
      ? "Blog IA 2026 — Tests, avis et guides sur les meilleurs outils | Neuriflux"
      : "AI Blog 2026 — Reviews, Tests & Guides on the Best Tools | Neuriflux",
    description: lang === "fr"
      ? "Tests approfondis, avis honnêtes et guides pratiques sur les meilleurs outils IA : ChatGPT, Claude, Cursor, ElevenLabs, Jasper et plus."
      : "In-depth reviews, honest tests and practical guides on the best AI tools: ChatGPT, Claude, Cursor, ElevenLabs, Jasper and more.",
    alternates: {
      canonical: url,
      languages: {
        fr: "https://neuriflux.com/fr/blog",
        en: "https://neuriflux.com/en/blog",
        "x-default": "https://neuriflux.com/en/blog",
      },
    },
    openGraph: {
      title: lang === "fr"
        ? "Blog IA 2026 | Neuriflux"
        : "AI Blog 2026 | Neuriflux",
      description: lang === "fr"
        ? "Tests approfondis et avis honnêtes sur les meilleurs outils IA du marché."
        : "In-depth reviews and honest tests on the best AI tools on the market.",
      url,
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      siteName: "Neuriflux",
    },
    twitter: {
      card: "summary_large_image",
      title: lang === "fr" ? "Blog IA 2026 | Neuriflux" : "AI Blog 2026 | Neuriflux",
      description: lang === "fr"
        ? "Tests honnêtes, avis détaillés, guides pratiques."
        : "Honest tests, detailed reviews, practical guides.",
    },
  };
}

export default function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <BlogClient lang={lang === "en" ? "en" : "fr"} />;
}