import { notFound } from "next/navigation";
import ContactClient from "./ContactClient";

type Lang = "fr" | "en";

export function generateStaticParams() {
  return [{ lang: "fr" }, { lang: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  return {
    title: "Contact — Neuriflux",
    description: lang === "fr"
      ? "Une question, une suggestion d'outil à tester, un partenariat ? On répond à tous les messages."
      : "A question, a tool suggestion, a partnership? We reply to every message.",
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  if (lang !== "fr" && lang !== "en") notFound();
  return <ContactClient lang={lang} />;
}