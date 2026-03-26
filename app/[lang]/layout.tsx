import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Neuriflux — Honest AI Tools Comparisons",
    template: "%s | Neuriflux",
  },
  description:
    "Neuriflux tests and compares the best AI tools on the market. Honest comparisons, detailed scores, clear verdicts — no bullshit.",

  keywords: [
    "AI tools", "AI comparison", "ChatGPT", "Claude", "Gemini",
    "Cursor AI", "artificial intelligence", "best AI tool",
    "outils IA", "comparatif IA",
  ],

  metadataBase: new URL("https://neuriflux.com"),
  authors: [{ name: "Neuriflux", url: "https://neuriflux.com" }],
  creator: "Neuriflux",
  publisher: "Neuriflux",
  
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
        url: "https://neuriflux.com/og-image-v3.png",
        width: 1200,
        height: 630,
        alt: "Neuriflux — Honest AI Tools Comparisons",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@Neurifluxcom",
    creator: "@NeurifluxCom",
    title: "Neuriflux — Honest AI Tools Comparisons",
    description:
      "Honest comparisons, detailed scores, clear verdicts on the best AI tools.",
    images: ["https://neuriflux.com/og-image-v3.png"],
  },

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

  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png" }],
},

  manifest: "/site.webmanifest",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ─── Google Tag Manager ──────────────────────────────────────────── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MZ8VRX38');`,
          }}
        />

        {/* ─── Schema.org — Organisation ───────────────────────────────────── */}
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
              sameAs: ["https://twitter.com/NeurifluxCom"],
            }),
          }}
        />

        {/* ─── Schema.org — WebSite + SearchAction ─────────────────────────── */}
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
        {/* ─── GTM noscript fallback ────────────────────────────────────────── */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MZ8VRX38"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}