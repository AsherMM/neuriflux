import { use } from "react";
import ComparatifClient from "./ComparatifClient";

type Lang = "fr" | "en";

export default function ComparatifPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = use(params);
  return <ComparatifClient lang={lang === "en" ? "en" : "fr"} slug={slug} />;
}