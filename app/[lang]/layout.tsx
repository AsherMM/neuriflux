import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // ─── Titre & Description ───────────────────────────────────────────────────
  title: {
    default: "Neuriflux — Comparatifs honnêtes d'outils IA",
    template: "%s | Neuriflux",
  },
  description:
    "Neuriflux teste et compare les meilleurs outils IA du marché. Comparatifs honnêtes, scores détaillés, verdicts clairs — sans bullshit.",

  // ─── Mots-clés ─────────────────────────────────────────────────────────────
  keywords: [
    "outils IA",
    "comparatif IA",
    "ChatGPT",
    "Claude",
    "Gemini",
    "Cursor AI",
    "intelligence artificielle",
    "AI tools",
    "AI comparison",
    "meilleur outil IA",
  ],

  // ─── Auteur & Editeur ──────────────────────────────────────────────────────
  authors: [{ name: "Neuriflux", url: "https://neuriflux.com" }],
  creator: "Neuriflux",
  publisher: "Neuriflux",

  // ─── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    siteName: "Neuriflux",
    title: "Neuriflux — Comparatifs honnêtes d'outils IA",
    description:
      "Neuriflux teste et compare les meilleurs outils IA du marché. Comparatifs honnêtes, scores détaillés, verdicts clairs.",
    url: "https://neuriflux.com",
    locale: "fr_FR",
    alternateLocale: "en_US",
    images: [
      {
        url: "https://neuriflux.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neuriflux — Comparatifs honnêtes d'outils IA",
      },
    ],
  },

  // ─── Twitter / X ───────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@neuriflux",
    creator: "@neuriflux",
    title: "Neuriflux — Comparatifs honnêtes d'outils IA",
    description:
      "Comparatifs honnêtes, scores détaillés, verdicts clairs sur les meilleurs outils IA.",
    images: ["https://neuriflux.com/og-image.png"],
  },

  // ─── Robots & Indexation ───────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ─── Canonique & hreflang ──────────────────────────────────────────────────
  alternates: {
    canonical: "https://neuriflux.com",
    languages: {
      "fr": "https://neuriflux.com/fr",
      "en": "https://neuriflux.com/en",
      "x-default": "https://neuriflux.com",
    },
  },

  // ─── Icônes ────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  // ─── Manifest ──────────────────────────────────────────────────────────────
  manifest: "/site.webmanifest",

  // ─── Verification ──────────────────────────────────────────────────────────
  // À remplir quand tu auras vérifié dans Google Search Console
  // verification: {
  //   google: "VOTRE_CODE_GOOGLE",
  // },

  // ─── Métadonnées supplémentaires ───────────────────────────────────────────
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Schema.org JSON-LD — Organisation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Neuriflux",
              url: "https://neuriflux.com",
              logo: "https://neuriflux.com/logo.png",
              description:
                "Média indépendant qui teste et compare les meilleurs outils IA du marché.",
              sameAs: [
                "https://twitter.com/neuriflux",
              ],
            }),
          }}
        />
        {/* Schema.org JSON-LD — WebSite + SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Neuriflux",
              url: "https://neuriflux.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://neuriflux.com/fr/blog?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}