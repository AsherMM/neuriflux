import { notFound } from "next/navigation";
import { Metadata } from "next";
import ContactClient from "./ContactClient";

type Lang = "fr" | "en";

export function generateStaticParams() {
  return [{ lang: "fr" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `https://neuriflux.com/${lang}/contact`;
  return {
    title: lang === "fr" ? "Contact — Neuriflux" : "Contact — Neuriflux",
    description: lang === "fr"
      ? "Une question, une suggestion d'outil à tester, un partenariat ? On répond à tous les messages sous 48h."
      : "A question, a tool suggestion, a partnership? We reply to every message within 48 hours.",
    alternates: {
      canonical: url,
      languages: { fr: "https://neuriflux.com/fr/contact", en: "https://neuriflux.com/en/contact", "x-default": "https://neuriflux.com/en/contact" },
    },
    openGraph: {
      title: lang === "fr" ? "Contact | Neuriflux" : "Contact | Neuriflux",
      description: lang === "fr" ? "On répond à tous les messages sous 48h." : "We reply to every message within 48 hours.",
      url,
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      siteName: "Neuriflux",
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  if (lang !== "fr" && lang !== "en") notFound();
  return <ContactClient lang={lang} />;
}