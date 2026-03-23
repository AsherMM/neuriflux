import { use } from "react";
import ComparatifsClient from "./ComparatifsClient";

type Lang = "fr" | "en";

export default function ComparatifsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  return <ComparatifsClient lang={lang === "en" ? "en" : "fr"} />;
}