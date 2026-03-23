import { use } from "react";
import HomeClient from "./HomeClient";

type Lang = "fr" | "en";

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <HomeClient lang={lang === "en" ? "en" : "fr"} />;
}