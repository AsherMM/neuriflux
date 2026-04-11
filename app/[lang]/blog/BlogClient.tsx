"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ARTICLES, type Article } from "../lib/articles";

type Lang = "fr" | "en";

// ─── Tags normalisés — mapping canonique FR ↔ EN ────────────────────────────
// Chaque tag a une forme canonique FR et une forme EN.
// Le filtre fonctionne sur la forme canonique peu importe la langue affichée.
const TAG_MAP: Record<string, { fr: string; en: string; color: string }> = {
  Chatbots:     { fr: "Chatbots",     en: "Chatbots",     color: "#00e6be" },
  Code:         { fr: "Code",         en: "Code",          color: "#3b82f6" },
  Rédaction:    { fr: "Rédaction",    en: "Writing",       color: "#f59e0b" },
  Writing:      { fr: "Rédaction",    en: "Writing",       color: "#f59e0b" },
  Image:        { fr: "Image",        en: "Image",         color: "#a855f7" },
  Productivité: { fr: "Productivité", en: "Productivity",  color: "#10b981" },
  Productivity: { fr: "Productivité", en: "Productivity",  color: "#10b981" },
  Audio:        { fr: "Audio",        en: "Audio",         color: "#ef4444" },
  Video:        { fr: "Vidéo",        en: "Video",         color: "#a855f7" },
  Vidéo:        { fr: "Vidéo",        en: "Video",         color: "#a855f7" },
};

// Forme canonique d'un tag (toujours FR comme clé interne)
const canonical = (tag: string): string => TAG_MAP[tag]?.fr ?? tag;
// Couleur d'un tag
const gc = (tag: string): string => TAG_MAP[tag]?.color ?? "#00e6be";
// Label d'un tag dans la langue courante
const tagLabel = (tag: string, lang: Lang): string => TAG_MAP[tag]?.[lang] ?? tag;
// Obtenir tous les tags uniques (canonicaux) depuis les articles
const getAllCanonicalTags = (): string[] => {
  const seen = new Set<string>();
  ARTICLES.forEach(a => { const c = canonical(a.tag); if (!seen.has(c)) seen.add(c); });
  return Array.from(seen);
};

// ─── Traductions ──────────────────────────────────────────────────────────────
const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "Articles & Analyses",
    title: "Le blog", accent: "Neuriflux",
    subtitle: "Tests approfondis, analyses honnêtes et guides pratiques sur les meilleurs outils IA du marché.",
    search: "Rechercher un article...",
    all: "Tous", featured: "À la une", allLabel: "Tous les articles",
    readMore: "Lire →", readTime: "min",
    noResults: "Aucun article trouvé.",
    trending: "Tendance", new: "Nouveau",
    ctaTitle: "Zéro bruit. Que du signal.",
    ctaDesc: "Les meilleurs outils IA de la semaine, testés et résumés en 5 minutes. Rejoins 4 200+ lecteurs.",
    ctaPlaceholder: "ton@email.com",
    ctaCta: "Je m'abonne →", ctaSent: "✓ Bienvenue !",
    ctaNo: "Sans spam. Résiliable en 1 clic.",
    statsArticles: "articles publiés", statsTools: "outils testés",
    statsReaders: "lecteurs", statsUpdated: "mis à jour",
    resultCount: "résultat(s)",
    ctaMiniText: "lecteurs reçoivent nos analyses chaque semaine.", ctaMiniBtn: "Rejoindre →",
    comparatifsLabel: "Voir les comparatifs →", comparatifsDesc: "Scores détaillés, verdicts clairs.",
    ftTagline: "Le média indépendant des outils IA.",
    ftContent: "Contenu", ftLegal: "Légal",
    ftLinks: [
      { l: "Blog", h: "/blog" }, { l: "Comparatifs", h: "/comparatifs" },
      { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "À propos", h: "/about" },
    ],
    ftLegal2: [
      { l: "Mentions légales", h: "/legal" }, { l: "Confidentialité", h: "/privacy" }, { l: "Cookies", h: "/cookies" },
    ],
    ftRights: "Tous droits réservés.", ftMade: "Fait avec ♥ en France",
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    badge: "Articles & Analysis",
    title: "The", accent: "Neuriflux Blog",
    subtitle: "In-depth reviews, honest analysis and practical guides on the best AI tools on the market.",
    search: "Search articles...",
    all: "All", featured: "Featured", allLabel: "All articles",
    readMore: "Read →", readTime: "min",
    noResults: "No articles found.",
    trending: "Trending", new: "New",
    ctaTitle: "Zero noise. Pure signal.",
    ctaDesc: "The best AI tools of the week, tested and summarized in 5 minutes. Join 4,200+ readers.",
    ctaPlaceholder: "your@email.com",
    ctaCta: "Subscribe →", ctaSent: "✓ Welcome!",
    ctaNo: "No spam. Unsubscribe in 1 click.",
    statsArticles: "articles published", statsTools: "tools tested",
    statsReaders: "readers", statsUpdated: "up to date",
    resultCount: "result(s)",
    ctaMiniText: "readers get our weekly AI tool analysis.", ctaMiniBtn: "Join now →",
    comparatifsLabel: "See comparisons →", comparatifsDesc: "Detailed scores, clear verdicts.",
    ftTagline: "The independent AI tools media.",
    ftContent: "Content", ftLegal: "Legal",
    ftLinks: [
      { l: "Blog", h: "/blog" }, { l: "Comparisons", h: "/comparatifs" },
      { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "About", h: "/about" },
    ],
    ftLegal2: [
      { l: "Legal notice", h: "/legal" }, { l: "Privacy", h: "/privacy" }, { l: "Cookies", h: "/cookies" },
    ],
    ftRights: "All rights reserved.", ftMade: "Made with ♥ in France",
  },
};

// ─── Articles récents (< 12 jours) ───────────────────────────────────────────
const isNew = (d: string) => {
  try { return (Date.now() - new Date(d).getTime()) / 86400000 <= 12; }
  catch { return false; }
};

// ─── Articles trending ────────────────────────────────────────────────────────
const TRENDING = new Set([
  "ia-2026", "prompts-ia-2026", "claude-mythos-next-anthropic-2026",
  "vibe-coding-tools-2026", "sora-fermeture-openai-2026",
  "perplexity-ai-review-2026", "grok-review-2026",
]);

// ─── Social proof déterministe ────────────────────────────────────────────────
const fakeViews = (slug: string) =>
  (slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 1800) + 400;

// ─── Scroll progress ──────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct(el.scrollHeight - el.clientHeight > 0 ? Math.min(100, (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100) : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 200 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#00e6be,#3b82f6)", transition: "width .1s linear" }} />
    </div>
  );
}

// ─── Compteur animé ───────────────────────────────────────────────────────────
function StatNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const dur = 1100, t0 = Date.now();
        const tick = () => {
          const p = Math.min(1, (Date.now() - t0) / dur);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Card featured ────────────────────────────────────────────────────────────
function CardFeatured({ article, lang, t, l }: {
  article: Article; lang: Lang; t: typeof T["fr"]; l: (p: string) => string;
}) {
  const a = article[lang];
  const color = gc(article.tag);
  const [hov, setHov] = useState(false);
  const _new = isNew(article.date.en);
  const _trend = TRENDING.has(article.slug);
  const views = fakeViews(article.slug);

  return (
    <a href={l(`/blog/${article.slug}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", overflow: "hidden", background: "var(--bg2)",
        border: `1px solid ${hov ? color + "40" : "var(--border)"}`,
        borderRadius: 14, padding: "1.85rem",
        display: "flex", flexDirection: "column" as const, gap: ".85rem",
        textDecoration: "none", transition: "border-color .22s,transform .22s,box-shadow .22s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 20px 60px rgba(0,0,0,.55), 0 0 0 1px ${color}20` : "none",
      }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: hov ? 1 : 0.5, transition: "opacity .25s" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top right,${color}10,transparent 65%)`, opacity: hov ? 1 : 0, transition: "opacity .25s", pointerEvents: "none" }} />

      {/* Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: ".45rem", flexWrap: "wrap" as const, position: "relative" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: ".62rem", letterSpacing: ".08em", textTransform: "uppercase" as const, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}30`, padding: "3px 10px", borderRadius: 100 }}>
          {tagLabel(article.tag, lang)}
        </span>
        {_new && <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", color: "#f59e0b", background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.25)", padding: "3px 9px", borderRadius: 100, fontWeight: 600 }}>✦ {t.new}</span>}
        {_trend && !_new && <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", color: "#a855f7", background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.25)", padding: "3px 9px", borderRadius: 100, fontWeight: 600 }}>↑ {t.trending}</span>}
      </div>

      <div style={{ fontFamily: "var(--d)", fontSize: "1.06rem", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.3, color: "var(--text)", position: "relative" }}>{a.title}</div>
      <div style={{ fontFamily: "var(--m)", fontSize: ".74rem", color: "var(--muted)", lineHeight: 1.68, fontWeight: 300, flex: 1, display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: 4, overflow: "hidden" }}>{a.desc}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ".85rem", borderTop: "1px solid var(--border)", marginTop: "auto", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".63rem", color: "var(--dim)" }}>{article.date[lang]}</span>
          <span style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)" }}>↑ {views.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".65rem", color: "var(--dim)" }}>⏱ {article.timeMin} {t.readTime}</span>
          <span style={{ fontFamily: "var(--m)", fontSize: ".7rem", fontWeight: 600, color, opacity: hov ? 1 : 0.7, transition: "opacity .2s" }}>{t.readMore}</span>
        </div>
      </div>
    </a>
  );
}

// ─── Card standard ────────────────────────────────────────────────────────────
function Card({ article, lang, t, l }: {
  article: Article; lang: Lang; t: typeof T["fr"]; l: (p: string) => string;
}) {
  const a = article[lang];
  const color = gc(article.tag);
  const [hov, setHov] = useState(false);
  const _new = isNew(article.date.en);
  const _trend = TRENDING.has(article.slug);

  return (
    <a href={l(`/blog/${article.slug}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", overflow: "hidden", background: "var(--bg2)",
        border: `1px solid ${hov ? color + "35" : "var(--border)"}`,
        borderRadius: 12, padding: "1.5rem",
        display: "flex", flexDirection: "column" as const, gap: ".7rem",
        textDecoration: "none", transition: "border-color .22s,transform .22s,box-shadow .22s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 14px 40px rgba(0,0,0,.5), 0 0 0 1px ${color}15` : "none",
      }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: hov ? 1 : 0.35, transition: "opacity .25s" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top right,${color}08,transparent 70%)`, opacity: hov ? 1 : 0, transition: "opacity .25s", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" as const, position: "relative" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", letterSpacing: ".08em", textTransform: "uppercase" as const, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}30`, padding: "3px 9px", borderRadius: 100 }}>
          {tagLabel(article.tag, lang)}
        </span>
        {_new && <span style={{ fontFamily: "var(--m)", fontSize: ".56rem", color: "#f59e0b", background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.25)", padding: "3px 8px", borderRadius: 100, fontWeight: 600 }}>✦ {t.new}</span>}
        {_trend && !_new && <span style={{ fontFamily: "var(--m)", fontSize: ".56rem", color: "#a855f7", background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.25)", padding: "3px 8px", borderRadius: 100, fontWeight: 600 }}>↑ {t.trending}</span>}
      </div>

      <div style={{ fontFamily: "var(--d)", fontSize: ".96rem", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.3, color: "var(--text)", position: "relative" }}>{a.title}</div>
      <div style={{ fontFamily: "var(--m)", fontSize: ".72rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300, flex: 1, display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: 3, overflow: "hidden" }}>{a.desc}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ".75rem", borderTop: "1px solid var(--border)", marginTop: "auto", position: "relative" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: ".63rem", color: "var(--dim)" }}>⏱ {article.timeMin} {t.readTime}</span>
        <span style={{ fontFamily: "var(--m)", fontSize: ".7rem", fontWeight: 600, color, opacity: hov ? 1 : 0.65, transition: "opacity .2s" }}>{t.readMore}</span>
      </div>
    </a>
  );
}

// ─── Newsletter CTA ────────────────────────────────────────────────────────────
function NewsletterCTA({ t }: { t: typeof T["fr"] }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSent(true); setEmail("");
    setTimeout(() => setSent(false), 3500);
  };
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(0,230,190,.07) 0%,rgba(59,130,246,.05) 100%)", border: "1px solid rgba(0,230,190,.2)", borderRadius: 16, padding: "clamp(1.75rem,4vw,2.5rem)", margin: "2.5rem 0 4rem" }}>
      <div style={{ position: "absolute", top: "-60%", right: "-10%", width: 400, height: 320, background: "radial-gradient(ellipse,rgba(0,230,190,.08),transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" as const, gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" as const }}>
          <span style={{ fontSize: "1.5rem", opacity: .8, flexShrink: 0 }}>✉</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--d)", fontSize: "1.12rem", fontWeight: 700, letterSpacing: "-.02em", color: "var(--text)", marginBottom: ".3rem" }}>{t.ctaTitle}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: ".73rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300 }}>{t.ctaDesc}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" as const }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.ctaPlaceholder} required
            style={{ flex: 1, minWidth: 180, background: "rgba(8,12,16,.7)", border: "1px solid rgba(0,230,190,.25)", borderRadius: 8, padding: "9px 13px", color: "var(--text)", fontFamily: "var(--m)", fontSize: ".78rem", outline: "none" }} />
          <button type="submit" style={{ background: sent ? "#10b981" : "var(--cyan)", color: "#080c10", border: "none", borderRadius: 8, padding: "9px 20px", fontFamily: "var(--m)", fontSize: ".78rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const, transition: "background .2s" }}>
            {sent ? t.ctaSent : t.ctaCta}
          </button>
        </form>
        <span style={{ fontFamily: "var(--m)", fontSize: ".62rem", color: "var(--dim)" }}>{t.ctaNo}</span>
      </div>
    </div>
  );
}

// ─── Cross-link comparatifs ───────────────────────────────────────────────────
function ComparatifsCrossLink({ t, l }: { t: typeof T["fr"]; l: (p: string) => string }) {
  return (
    <a href={l("/comparatifs")}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "1rem", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.5rem", margin: "0 0 2.5rem", textDecoration: "none", transition: "all .2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,230,190,.25)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}>
      <div>
        <div style={{ fontFamily: "var(--m)", fontSize: ".62rem", letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--cyan)", marginBottom: ".25rem" }}>⚔️ Neuriflux Comparatifs</div>
        <div style={{ fontFamily: "var(--m)", fontSize: ".73rem", color: "var(--muted)" }}>{t.comparatifsDesc}</div>
      </div>
      <span style={{ fontFamily: "var(--m)", fontSize: ".73rem", fontWeight: 600, color: "var(--cyan)", whiteSpace: "nowrap" as const }}>{t.comparatifsLabel}</span>
    </a>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function BlogClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTag, setActiveTag] = useState("all"); // valeur = forme canonique FR
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filtersSticky, setFiltersSticky] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const filtersTop = useRef(0);

  const t = T[lang];
  const canonicalTags = getAllCanonicalTags();
  const l = (path: string) => `/${lang}${path}`;

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 60);
      if (filtersRef.current) {
        if (!filtersTop.current) filtersTop.current = filtersRef.current.getBoundingClientRect().top + window.scrollY;
        setFiltersSticky(window.scrollY > filtersTop.current - 62);
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Filtrage : on compare les tags canonicaux
  const filtered = ARTICLES.filter(a => {
    const matchTag = activeTag === "all" || canonical(a.tag) === activeTag;
    const s = search.toLowerCase();
    const matchSearch = !s || a[lang].title.toLowerCase().includes(s) || a[lang].desc.toLowerCase().includes(s);
    return matchTag && matchSearch;
  });

  const featured = filtered.filter(a => a.featured);
  const rest = filtered.filter(a => !a.featured);

  // ── JSON-LD
  const schema = {
    "@context": "https://schema.org", "@type": "Blog",
    name: lang === "fr" ? "Blog Neuriflux — Outils IA 2026" : "Neuriflux Blog — AI Tools 2026",
    description: t.subtitle,
    url: `https://neuriflux.com/${lang}/blog`,
    publisher: {
      "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com",
      logo: { "@type": "ImageObject", url: "https://neuriflux.com/logo.png" },
      sameAs: ["https://twitter.com/NeurifluxCom"],
    },
    blogPost: ARTICLES.map(a => ({
      "@type": "BlogPosting",
      headline: a[lang].title, description: a[lang].desc,
      url: `https://neuriflux.com/${lang}/blog/${a.slug}`,
      datePublished: a.date.en, dateModified: a.date.en,
      inLanguage: lang, timeRequired: `PT${a.timeMin}M`,
      author: { "@type": "Organization", name: "Neuriflux" },
      publisher: { "@type": "Organization", name: "Neuriflux" },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <link rel="alternate" hrefLang="fr" href={`https://neuriflux.com/fr/blog`} />
      <link rel="alternate" hrefLang="en" href={`https://neuriflux.com/en/blog`} />

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,.065);--glow:rgba(0,230,190,.2);
          --cyan:#00e6be;--cdim:rgba(0,230,190,.09);
          --text:#edf2f7;--muted:#5a6a7a;--dim:#2a3a4a;
          --d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;
          --pad:clamp(1.25rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.016) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:1000px;height:700px;background:radial-gradient(ellipse,rgba(0,230,190,.05) 0%,transparent 68%);pointer-events:none;z-index:0}

        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(8,12,16,.94);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .2s}
        nav.scrolled{box-shadow:0 4px 28px rgba(0,0,0,.45)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite;flex-shrink:0}
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
        @media(max-width:720px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.25rem var(--pad);gap:1rem;z-index:99}}
        .nav-links a{font-family:var(--m);font-size:.74rem;color:var(--muted);text-decoration:none;letter-spacing:.03em;transition:color .15s}
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}
        .lb{font-family:var(--m);font-size:.67rem;font-weight:500;padding:4px 9px;border-radius:4px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s}
        .lb.on{background:var(--cyan);color:#080c10}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}
        @media(max-width:720px){.hb{display:flex}}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}

        .wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 var(--pad)}

        /* ── HERO ── */
        .hero{padding:clamp(3.5rem,7vw,6rem) 0 clamp(1.5rem,3vw,2rem)}
        .hero-badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.7rem;letter-spacing:.08em;color:var(--cyan);background:var(--cdim);border:1px solid rgba(0,230,190,.22);border-radius:100px;padding:6px 14px;margin-bottom:1.5rem;animation:fadeUp .5s ease both}
        .hero-badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero h1{font-size:clamp(2.2rem,5.5vw,3.8rem);font-weight:800;letter-spacing:-.03em;line-height:1.06;margin-bottom:1rem;animation:fadeUp .5s .1s ease both}
        .ac{color:var(--cyan)}
        .hero-sub{font-family:var(--m);font-size:.86rem;color:var(--muted);font-weight:300;line-height:1.75;max-width:520px;margin-bottom:2rem;animation:fadeUp .5s .2s ease both}

        /* Stats */
        .stats-strip{display:flex;gap:2.5rem;padding:.5rem 0 2rem;flex-wrap:wrap;border-top:1px solid var(--border)}
        .stat-item{display:flex;flex-direction:column;gap:.2rem;padding-top:1.25rem}
        .stat-num{font-family:var(--d);font-size:1.6rem;font-weight:800;letter-spacing:-.04em;color:var(--cyan)}
        .stat-label{font-family:var(--m);font-size:.62rem;color:var(--muted);letter-spacing:.05em;text-transform:uppercase}

        /* Filtres sticky */
        .toolbar{padding:.85rem 0;display:flex;flex-direction:column;gap:.8rem;transition:all .2s}
        .toolbar.sticky{
          position:sticky;top:60px;z-index:90;
          background:rgba(8,12,16,.96);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
          border-bottom:1px solid var(--border);
          padding:.7rem var(--pad);margin:0 calc(-1 * var(--pad));
          box-shadow:0 4px 24px rgba(0,0,0,.4)
        }
        .toolbar-row{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap}
        .search-wrap{position:relative;flex:1;max-width:380px;min-width:180px}
        .search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none;font-size:.82rem}
        .search-input{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 13px 9px 38px;color:var(--text);font-family:var(--m);font-size:.78rem;outline:none;transition:border-color .18s}
        .search-input:focus{border-color:rgba(0,230,190,.3)}
        .search-input::placeholder{color:var(--dim)}
        .result-count{font-family:var(--m);font-size:.67rem;color:var(--dim)}
        .filters{display:flex;gap:.4rem;flex-wrap:wrap}
        .ftag{font-family:var(--m);font-size:.69rem;padding:5px 13px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;white-space:nowrap;display:flex;align-items:center;gap:.3rem}
        .ftag:hover{border-color:rgba(0,230,190,.28);color:var(--cyan)}
        .ftag.on{background:var(--cyan);border-color:var(--cyan);color:#080c10;font-weight:700}
        .ftag-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

        /* Sections */
        .sec-tag{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.2rem;display:flex;align-items:center;gap:.45rem}
        .sec-tag::before{content:'';width:16px;height:1px;background:var(--cyan);display:inline-block}

        /* Grilles */
        .grid-featured{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.5rem;margin-bottom:1rem}
        .grid-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.2rem;margin-bottom:3rem}
        @media(max-width:520px){.grid-featured,.grid-all{grid-template-columns:1fr}}

        /* CTA mini */
        .cta-mini{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:1rem 1.5rem;margin:1.5rem 0 3rem}
        .cta-mini-text{font-family:var(--m);font-size:.74rem;color:var(--muted)}
        .cta-mini-text strong{color:var(--cyan);font-weight:700}
        .cta-mini-btn{font-family:var(--m);font-size:.73rem;font-weight:700;color:#080c10;background:var(--cyan);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;white-space:nowrap;text-decoration:none;transition:opacity .18s;display:inline-block}
        .cta-mini-btn:hover{opacity:.85}

        /* No results */
        .no-results{text-align:center;padding:4rem 2rem;font-family:var(--m);color:var(--muted);font-size:.85rem;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:3rem}

        /* Footer */
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.25rem var(--pad);max-width:1160px;margin:0 auto}
        .ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
        @media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
        .ft-tag{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.65;max-width:210px;margin-top:.4rem}
        .ft-col{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
        .ft-ul{list-style:none;display:flex;flex-direction:column;gap:.45rem}
        .ft-ul a{font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;transition:color .15s;font-weight:300}
        .ft-ul a:hover{color:var(--cyan)}
        .ft-bot{margin-top:1.75rem;padding-top:1.1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
      `}</style>

      <ScrollProgress />
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")} className="active">{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")}>{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/contact")}>{t.nav.contact}</a></li>
          <li><a href={l("/about")}>{t.nav.about}</a></li>
        </ul>
        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
          <div className="lt">
            <button className={`lb${lang === "fr" ? " on" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " on" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>

      <div className="wrap">

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-badge"><div className="hero-badge-dot" />{t.badge}</div>
          <h1>{t.title} <span className="ac">{t.accent}</span></h1>
          <p className="hero-sub">{t.subtitle}</p>
          <div className="stats-strip">
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={ARTICLES.length} /></span>
              <span className="stat-label">{t.statsArticles}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={42} /></span>
              <span className="stat-label">{t.statsTools}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={4200} suffix="+" /></span>
              <span className="stat-label">{t.statsReaders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={2026} /></span>
              <span className="stat-label">{t.statsUpdated}</span>
            </div>
          </div>
        </div>

        {/* ── FILTRES STICKY avec tags localisés ── */}
        <div ref={filtersRef} className={`toolbar${filtersSticky ? " sticky" : ""}`}>
          <div className="toolbar-row">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" type="text" placeholder={t.search}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(search || activeTag !== "all") && (
              <span className="result-count">{filtered.length} {t.resultCount}</span>
            )}
          </div>
          <div className="filters">
            {/* Filtre "Tous" */}
            <button className={`ftag${activeTag === "all" ? " on" : ""}`} onClick={() => setActiveTag("all")}>
              {t.all}
            </button>
            {/* Filtres par tag — label localisé, dot coloré */}
            {canonicalTags.map(canonTag => {
              const color = gc(canonTag);
              const label = tagLabel(canonTag, lang);
              const isActive = activeTag === canonTag;
              return (
                <button key={canonTag}
                  className={`ftag${isActive ? " on" : ""}`}
                  onClick={() => setActiveTag(canonTag)}>
                  <span className="ftag-dot" style={{ background: isActive ? "#080c10" : color }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CONTENT ── */}
        {filtered.length === 0 ? (
          <div className="no-results">{t.noResults}</div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <section style={{ marginBottom: "3rem" }}>
                <div className="sec-tag">{t.featured}</div>
                <div className="grid-featured">
                  {featured.map(a => <CardFeatured key={a.slug} article={a} lang={lang} t={t} l={l} />)}
                </div>
              </section>
            )}

            {/* CTA mini entre featured et rest */}
            {featured.length > 0 && rest.length > 0 && !search && activeTag === "all" && (
              <div className="cta-mini">
                <span className="cta-mini-text">
                  <strong>4{lang === "fr" ? " " : ","}200+</strong> {t.ctaMiniText}
                </span>
                <a href={l("/newsletter")} className="cta-mini-btn">{t.ctaMiniBtn}</a>
              </div>
            )}

            {/* Cross-link comparatifs — visible uniquement sans filtre ni recherche */}
            {!search && activeTag === "all" && rest.length > 0 && (
              <ComparatifsCrossLink t={t} l={l} />
            )}

            {/* Tous les articles */}
            {rest.length > 0 && (
              <section>
                {featured.length > 0 && <div className="sec-tag">{t.allLabel}</div>}
                <div className="grid-all">
                  {rest.map((a, i) => <Card key={`${a.slug}-${i}`} article={a} lang={lang} t={t} l={l} />)}
                </div>
              </section>
            )}

            {/* Newsletter CTA */}
            {!search && <NewsletterCTA t={t} />}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="ft">
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}><div className="logo-dot" />Neuri<em>flux</em></a>
            <p className="ft-tag">{t.ftTagline}</p>
          </div>
          <div>
            <div className="ft-col">{t.ftContent}</div>
            <ul className="ft-ul">{t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}</ul>
          </div>
          <div>
            <div className="ft-col">{t.ftLegal}</div>
            <ul className="ft-ul">{t.ftLegal2.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}</ul>
          </div>
        </div>
        <div className="ft-bot">
          <span className="ft-copy">© 2026 <em>Neuriflux</em>. {t.ftRights}</span>
          <span className="ft-copy">{t.ftMade}</span>
        </div>
      </footer>
    </>
  );
}