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
  // ─── Titre & Description (EN par défaut) ──────────────────────────────────
  // Le [lang]/layout.tsx overridera avec les bonnes valeurs FR/EN par page
  title: {
    default: "Neuriflux — Honest AI Tools Comparisons",
    template: "%s | Neuriflux",
  },
  description:
    "Neuriflux tests and compares the best AI tools on the market. Honest comparisons, detailed scores, clear verdicts — no bullshit.",

  // ─── Mots-clés ─────────────────────────────────────────────────────────────
  keywords: [
    "AI tools",
    "AI comparison",
    "ChatGPT",
    "Claude",
    "Gemini",
    "Cursor AI",
    "artificial intelligence",
    "best AI tool",
    "outils IA",
    "comparatif IA",
  ],

  // ─── Auteur & Editeur ──────────────────────────────────────────────────────
  authors: [{ name: "Neuriflux", url: "https://neuriflux.com" }],
  creator: "Neuriflux",
  publisher: "Neuriflux",

  // ─── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    siteName: "Neuriflux",
    title: "Neuriflux — Honest AI Tools Comparisons",
    description:
      "Neuriflux tests and compares the best AI tools. Honest comparisons, detailed scores, clear verdicts.",
    url: "https://neuriflux.com",
    locale: "en_US",
    alternateLocale: "fr_FR",
    images: [
      {
        url: "https://neuriflux.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neuriflux — Honest AI Tools Comparisons",
      },
    ],
  },

  // ─── Twitter / X ───────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@neuriflux",
    creator: "@neuriflux",
    title: "Neuriflux — Honest AI Tools Comparisons",
    description:
      "Honest comparisons, detailed scores, clear verdicts on the best AI tools.",
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
    canonical: "https://neuriflux.com/en",
    languages: {
      fr: "https://neuriflux.com/fr",
      en: "https://neuriflux.com/en",
      "x-default": "https://neuriflux.com/en", // EN comme langue principale
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

  // ─── Google Search Console — décommenter après vérification ───────────────
  // verification: {
  //   google: "VOTRE_CODE_GOOGLE",
  // },

  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="en" par défaut — le [lang]/layout.tsx overridera dynamiquement
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Schema.org — Organisation */}
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
                "Independent media testing and comparing the best AI tools on the market.",
              sameAs: ["https://twitter.com/neuriflux"],
            }),
          }}
        />
        {/* Schema.org — WebSite + SearchAction */}
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
                    "https://neuriflux.com/en/blog?q={search_term_string}",
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