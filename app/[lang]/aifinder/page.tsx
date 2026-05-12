import type { Metadata } from "next";
import AiFinderClient from "./AiFinderClient";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const isFr = lang === "fr";

  return {
    title: isFr
      ? "AI Finder — Trouvez le meilleur outil IA pour vos besoins | Neuriflux"
      : "AI Finder — Find the Best AI Tool for Your Needs | Neuriflux",
    description: isFr
      ? "Répondez à quelques questions et découvrez l’outil IA le plus adapté à votre usage : rédaction, SEO, vidéo, code, recherche, automatisation, business et plus."
      : "Answer a few questions and discover the best AI tool for your workflow: writing, SEO, video, coding, research, automation, business and more.",
    alternates: {
      canonical: `https://neuriflux.com/${lang}/aifinder`,
      languages: {
        fr: "https://neuriflux.com/fr/aifinder",
        en: "https://neuriflux.com/en/aifinder",
      },
    },
    openGraph: {
      title: isFr
        ? "AI Finder — Trouvez l’outil IA parfait"
        : "AI Finder — Find your perfect AI tool",
      description: isFr
        ? "Un assistant interactif pour trouver l’IA la plus utile selon vos besoins, votre budget et votre niveau."
        : "An interactive assistant to find the most useful AI tool based on your needs, budget and skill level.",
      url: `https://neuriflux.com/${lang}/ai-finder`,
      siteName: "Neuriflux",
      type: "website",
      images: [
        {
          url: "https://neuriflux.com/og/og-image-v4.png",
          width: 1200,
          height: 630,
          alt: "Neuriflux AI Finder",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isFr
        ? "AI Finder — Trouvez l’outil IA parfait"
        : "AI Finder — Find your perfect AI tool",
      description: isFr
        ? "Comparez les meilleurs outils IA selon votre vrai besoin."
        : "Compare the best AI tools based on your real use case.",
      images: ["https://neuriflux.com/og/og-image-v4.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;

  return <AiFinderClient lang={lang} />;
}