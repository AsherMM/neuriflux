import { use } from "react";
import { Metadata } from "next";
import ArticleClient from "./ArticleClient";
import { getArticleBySlug } from "../../lib/articles";

type Lang = "fr" | "en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = getArticleBySlug(slug);
  const article = data ? data[lang] : null;

  if (!article || !data) {
    return { title: "Article not found | Neuriflux" };
  }

  const url = `https://neuriflux.com/${lang}/blog/${slug}`;
  const imageUrl = "https://neuriflux.com/og-image-v4.png";

  return {
    title: article.title,
    description: article.desc,
    alternates: {
      canonical: url,
      languages: {
        fr: `https://neuriflux.com/fr/blog/${slug}`,
        en: `https://neuriflux.com/en/blog/${slug}`,
        "x-default": `https://neuriflux.com/en/blog/${slug}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.desc,
      url,
      type: "article",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      siteName: "Neuriflux",
      publishedTime: data.date.en,
      authors: ["Neuriflux"],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.desc,
      images: [imageUrl],
    },
  };
}

export default function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = use(params);
  const fontUrl =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preload" as="style" href={fontUrl} />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${fontUrl}';document.head.appendChild(l);})();`,
        }}
      />
      <ArticleClient lang={lang === "en" ? "en" : "fr"} slug={slug} />
    </>
  );
}