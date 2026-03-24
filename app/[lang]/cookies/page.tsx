import { use } from "react";
import CookiesClient from "./CookiesClient";

type Lang = "fr" | "en";

export default function CookiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <CookiesClient lang={lang === "en" ? "en" : "fr"} />;
}