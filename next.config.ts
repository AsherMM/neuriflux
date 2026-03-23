import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "neuriflux.com",
      },
      {
        protocol: "https",
        hostname: "**.neuriflux.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // SEO — URLs sans slash final
  trailingSlash: false,

  // Compression automatique
  compress: true,

  // Headers SEO et sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // Cache long pour les assets statiques
      {
        source: "/(.*)\\.(ico|jpg|jpeg|png|svg|webp|avif|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirections utiles
  async redirects() {
    return [
      // Redirige www vers non-www
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.neuriflux.com" }],
        destination: "https://neuriflux.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;