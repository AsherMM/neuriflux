import { use } from "react";
import LegalClient from "./LegalClient";

type Lang = "fr" | "en";

export default function LegalPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <LegalClient lang={lang === "en" ? "en" : "fr"} />;
}