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
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.desc,
    },
  };
}

export default function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = use(params);
  return <ArticleClient lang={lang === "en" ? "en" : "fr"} slug={slug} />;
}