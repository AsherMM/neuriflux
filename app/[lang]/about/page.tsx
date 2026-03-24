import { use } from "react";
import AboutClient from "./AboutClient";
 
type Lang = "fr" | "en";
 
export default function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <AboutClient lang={lang === "en" ? "en" : "fr"} />;
}