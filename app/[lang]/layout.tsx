import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Syne, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const SITE_URL = "https://neuriflux.com";
const SITE_NAME = "Neuriflux";
const DEFAULT_OG = "/og-image-v4.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Neuriflux",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  title: {
    default: "Neuriflux — Honest AI Tools Comparisons",
    template: "%s | Neuriflux",
  },

  description:
    "Neuriflux tests and compares the best AI tools with real-world reviews, transparent scores, practical benchmarks and clear verdicts.",

  keywords: [
  // Global
  "AI",
  "Artificial Intelligence",
  "AI tools",
  "AI software",
  "AI apps",
  "AI platform",

  // Intent
  "AI reviews",
  "AI comparisons",
  "AI benchmarks",
  "best AI tools",
  "best AI software",
  "AI buying guide",
  "AI tutorial",
  "AI guide",

  // Chatbots
  "ChatGPT",
  "Claude",
  "Gemini",
  "Grok",
  "Perplexity",
  "DeepSeek",

  // Coding
  "Cursor",
  "Claude Code",
  "GitHub Copilot",
  "Windsurf",
  "Cline",
  "Codeium",
  "Lovable",
  "Bolt.new",
  "v0",

  // Image
  "Midjourney",
  "DALL-E",
  "Stable Diffusion",
  "Flux AI",
  "Ideogram",

  // Video
  "Runway",
  "Kling",
  "Sora",
  "Pika",
  "HeyGen",

  // Voice
  "ElevenLabs",
  "PlayHT",

  // Automation
  "Zapier",
  "Make",
  "n8n",

  // Productivity
  "Notion AI",
  "Jasper",
  "Copy.ai",

  // French
  "outils IA",
  "comparatif IA",
  "meilleure IA",
  "avis IA",
  "intelligence artificielle",
],

  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",

  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      fr: "/fr",
      "x-default": "/en",
    },
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Neuriflux — Honest AI Tools Comparisons",
    description:
      "Real-world AI tools reviews, transparent scores, practical benchmarks and clear verdicts.",
    url: "/en",
    locale: "en_US",
    alternateLocale: "fr_FR",
    images: [
      {
        url: DEFAULT_OG,
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
      "Real-world AI tools reviews, transparent scores, practical benchmarks and clear verdicts.",
    images: [DEFAULT_OG],
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

  other: {
  "theme-color": "#080c10",
  "color-scheme": "dark",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Independent media testing and comparing the best AI tools on the market.",
  sameAs: ["https://twitter.com/NeurifluxCom"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ["en", "fr"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/en/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="impact-site-verification"
          content="9f80294a-9aa2-488e-8537-06ae286b64b8"
        />

        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),
              dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MZ8VRX38');
          `}
        </Script>

        <Script
          id="schema-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        <Script
          id="schema-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4277358857919775"
          crossOrigin="anonymous"
        />
      </head>

      <body className="min-h-full flex flex-col">
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