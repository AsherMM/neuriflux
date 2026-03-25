import { use } from "react";
import { Metadata } from "next";
import ComparatifClient from "./ComparatifClient";
import { getComparatifBySlug } from "../../lib/comparatifs";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = getComparatifBySlug(slug);
  const comp = data ? data[lang] : null;

  if (!comp || !data) {
    return { title: "Comparison not found | Neuriflux" };
  }

  const url = `https://neuriflux.com/${lang}/comparatifs/${slug}`;
  const winner = data.tools.find(t => t.name === data.winner);
  const desc = comp.intro || `${lang === "fr" ? "Comparatif" : "Comparison"}: ${data.tools.map(t => t.name).join(" vs ")}`;

  return {
    title: comp.title,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        fr: `https://neuriflux.com/fr/comparatifs/${slug}`,
        en: `https://neuriflux.com/en/comparatifs/${slug}`,
        "x-default": `https://neuriflux.com/en/comparatifs/${slug}`,
      },
    },
    openGraph: {
      title: comp.title,
      description: desc,
      url,
      type: "article",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      siteName: "Neuriflux",
      publishedTime: data.date.en,
      authors: ["Neuriflux"],
    },
    twitter: {
      card: "summary_large_image",
      title: comp.title,
      description: desc,
    },
    keywords: [
      ...data.tools.map(t => t.name),
      ...(winner ? [`best ${winner.name}`, `${winner.name} review`] : []),
      "AI comparison", "AI tools", "Neuriflux",
    ],
  };
}

export default function ComparatifPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = use(params);
  return <ComparatifClient lang={lang === "en" ? "en" : "fr"} slug={slug} />;
}