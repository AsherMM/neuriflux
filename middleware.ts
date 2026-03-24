import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["fr", "en"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. Laisser passer sans toucher ───────────────────────────────────────
  // Tout ce qui commence déjà par /fr ou /en
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }

  // ─── 2. Détecter la langue préférée du navigateur ─────────────────────────
  const acceptLang = request.headers.get("accept-language") ?? "";
  const lang = acceptLang.toLowerCase().startsWith("fr") ? "fr" : "en";

  // ─── 3. Rediriger vers /fr/... ou /en/... ─────────────────────────────────
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Intercepte tout SAUF :
  // - les fichiers _next (build assets)
  // - les routes api
  // - les fichiers SEO : sitemap.xml, robots.txt, site.webmanifest
  // - les fichiers avec extension (.ico, .png, .jpg, .svg, .css, .js, .xml, .txt...)
  matcher: [
    "/((?!_next/static|_next/image|api|favicon\\.ico|sitemap\\.xml|robots\\.txt|site\\.webmanifest|.*\\.[a-z]{2,4}$).*)",
  ],
};