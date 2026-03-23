import { use } from "react";
import ArticleClient from "./ArticleClient";

type Lang = "fr" | "en";

export default function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = use(params);
  return <ArticleClient lang={lang === "en" ? "en" : "fr"} slug={slug} />;
}