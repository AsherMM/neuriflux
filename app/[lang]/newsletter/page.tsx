import { use } from "react";
import NewsletterClient from "./NewsletterClient";

type Lang = "fr" | "en";

export default function NewsletterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <NewsletterClient lang={lang === "en" ? "en" : "fr"} />;
}