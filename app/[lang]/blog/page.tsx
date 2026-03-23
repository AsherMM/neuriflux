import { use } from "react";
import BlogClient from "./BlogClient";

type Lang = "fr" | "en";

export default function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <BlogClient lang={lang === "en" ? "en" : "fr"} />;
}