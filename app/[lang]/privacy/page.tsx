import { use } from "react";
import PrivacyClient from "./PrivacyClient";

type Lang = "fr" | "en";

export default function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <PrivacyClient lang={lang === "en" ? "en" : "fr"} />;
}