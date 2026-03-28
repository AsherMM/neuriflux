"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ARTICLES, getAllTags, type Article } from "../lib/articles";

type Lang = "fr" | "en";

// ─── Traductions ───────────────────────────────────────────────────────────────
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
  },
};

// ─── Couleurs par tag ──────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", Rédaction: "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", Productivité: "#10b981",
  Productivity: "#10b981", Audio: "#ef4444", Video: "#a855f7", Vidéo: "#a855f7",
};
const gc = (tag: string) => TAG_COLORS[tag] || "#00e6be";

// ─── Card article ─────────────────────────────────────────────────────────────
function Card({ article, lang, readMore, readTime, l }: {
  article: Article; lang: Lang; readMore: string; readTime: string; l: (p: string) => string;
}) {
  const a = article[lang];
  const color = gc(article.tag);
  const [hov, setHov] = useState(false);

  return (
    <a
      href={l(`/blog/${article.slug}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--bg2)",
        border: `1px solid ${hov ? color + "35" : "var(--border)"}`,
        borderRadius: 14, padding: "1.75rem",
        display: "flex", flexDirection: "column" as const, gap: "0.75rem",
        textDecoration: "none", transition: "all 0.22s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 16px 44px rgba(0,0,0,.5), 0 0 0 1px ${color}18` : "none",
        position: "relative" as const, overflow: "hidden",
      }}
    >
      {/* Barre colorée en haut selon le tag */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: color,
        opacity: hov ? 1 : 0.4, transition: "opacity 0.25s",
      }} />

      {/* Glow au hover */}
      {hov && (
        <div style={{
          position: "absolute", top: "-35%", right: "-8%",
          width: 260, height: 180,
          background: `radial-gradient(ellipse,${color}09,transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* Tag + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: "0.4rem" }}>
        <span style={{
          fontFamily: "var(--m)", fontSize: "0.6rem", letterSpacing: "0.1em",
          textTransform: "uppercase" as const, color, fontWeight: 700,
          background: `${color}18`, border: `1px solid ${color}30`,
          padding: "3px 10px", borderRadius: 100,
        }}>{article.tag}</span>
        <span style={{ fontFamily: "var(--m)", fontSize: "0.65rem", color: "var(--dim)" }}>
          {article.date[lang]}
        </span>
      </div>

      {/* Titre */}
      <div style={{
        fontFamily: "var(--d)", fontSize: "1.02rem", fontWeight: 700,
        letterSpacing: "-0.02em", lineHeight: 1.32, color: "var(--text)",
      }}>{a.title}</div>

      {/* Description */}
      <div style={{
        fontFamily: "var(--m)", fontSize: "0.75rem", color: "var(--muted)",
        lineHeight: 1.65, fontWeight: 300, flex: 1,
      }}>{a.desc}</div>

      {/* Footer : temps de lecture + CTA */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: "0.75rem", borderTop: "1px solid var(--border)", marginTop: "auto",
      }}>
        <span style={{ fontFamily: "var(--m)", fontSize: "0.67rem", color: "var(--dim)" }}>
          ⏱ {article.timeMin} {readTime}
        </span>
        <span style={{
          fontFamily: "var(--m)", fontSize: "0.7rem", color,
          fontWeight: 600, opacity: hov ? 1 : 0.7, transition: "opacity 0.2s",
        }}>{readMore}</span>
      </div>
    </a>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function BlogClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const t = T[lang];
  const tags = getAllTags();
  const l = (path: string) => `/${lang}${path}`;

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  const filtered = ARTICLES.filter(a => {
    const matchTag = activeTag === "all" || a.tag === activeTag;
    const s = search.toLowerCase();
    const matchSearch = !s
      || a[lang].title.toLowerCase().includes(s)
      || a[lang].desc.toLowerCase().includes(s);
    return matchTag && matchSearch;
  });

  const featured = filtered.filter(a => a.featured);
  const rest = filtered.filter(a => !a.featured);

  // SEO — Blog + BlogPosting schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: lang === "fr" ? "Blog Neuriflux — Outils IA 2026" : "Neuriflux Blog — AI Tools 2026",
    description: t.subtitle,
    url: `https://neuriflux.com/${lang}/blog`,
    publisher: { "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com", logo: { "@type": "ImageObject", url: "https://neuriflux.com/logo.png" } },
    blogPost: ARTICLES.map(a => ({
      "@type": "BlogPosting",
      headline: a[lang].title,
      description: a[lang].desc,
      url: `https://neuriflux.com/${lang}/blog/${a.slug}`,
      datePublished: a.date.en,
      inLanguage: lang,
      author: { "@type": "Organization", name: "Neuriflux" },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <style>{`
        /* ─────────────────────────────────────────────────────────
           RESET & VARIABLES
        ───────────────────────────────────────────────────────── */
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          /* Fonds */
          --bg:#080c10;
          --bg2:#0d1117;
          --bg3:#111820;
          /* Bordures */
          --border:rgba(255,255,255,.065);
          --glow:rgba(0,230,190,.2);
          /* Couleur accent */
          --cyan:#00e6be;
          --cdim:rgba(0,230,190,.09);
          /* Texte */
          --text:#edf2f7;
          --muted:#5a6a7a;
          --dim:#2a3a4a;
          /* Fonts — système uniquement, zéro requête réseau */
          --d:'Syne',sans-serif;
          --m:'JetBrains Mono',monospace;
          /* Utilitaires */
          --r:10px;
          --pad:clamp(1.5rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{
          background:var(--bg);color:var(--text);
          font-family:var(--d);
          -webkit-font-smoothing:antialiased;
          overflow-x:hidden
        }

        /* ─────────────────────────────────────────────────────────
           FOND : GRILLE + GLOW AMBIANT
        ───────────────────────────────────────────────────────── */
        .bg-grid{
          position:fixed;inset:0;
          background-image:
            linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);
          background-size:72px 72px;
          pointer-events:none;z-index:0
        }
        .bg-glow{
          position:fixed;top:-20%;left:50%;transform:translateX(-50%);
          width:900px;height:680px;
          background:radial-gradient(ellipse,rgba(0,230,190,.055) 0%,transparent 68%);
          pointer-events:none;z-index:0
        }

        /* ─────────────────────────────────────────────────────────
           NAVIGATION
        ───────────────────────────────────────────────────────── */
        nav{
          position:sticky;top:0;z-index:100;
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          background:rgba(8,12,16,.93);
          border-bottom:1px solid var(--border);
          padding:0 var(--pad);height:60px;
          display:flex;align-items:center;justify-content:space-between;
          transition:box-shadow .2s
        }
        /* Ombre subtile après le scroll */
        nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.4)}

        /* Logo */
        .logo{
          font-family:var(--d);font-weight:800;font-size:1.15rem;
          letter-spacing:-.03em;color:var(--text);text-decoration:none;
          display:flex;align-items:center;gap:.45rem
        }
        .logo em{color:var(--cyan);font-style:normal}

        /* Point animé à gauche du logo */
        .logo-dot{
          width:6px;height:6px;background:var(--cyan);border-radius:50%;
          box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite
        }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}

        /* Liens nav desktop */
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
        @media(max-width:720px){
          .nav-links{display:none}
          .nav-links.open{
            display:flex;flex-direction:column;
            position:fixed;top:60px;left:0;right:0;
            background:var(--bg2);border-bottom:1px solid var(--border);
            padding:1.25rem var(--pad);gap:1rem;z-index:99
          }
        }
        .nav-links a{
          font-family:var(--m);font-size:.74rem;color:var(--muted);
          text-decoration:none;letter-spacing:.03em;transition:color .15s
        }
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}

        /* Toggle FR / EN */
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}
        .lb{
          font-family:var(--m);font-size:.67rem;font-weight:500;
          padding:4px 9px;border-radius:4px;border:none;
          cursor:pointer;background:transparent;color:var(--muted);transition:all .15s
        }
        .lb.on{background:var(--cyan);color:#080c10}

        /* Burger mobile */
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}
        @media(max-width:720px){.hb{display:flex}}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}

        /* ─────────────────────────────────────────────────────────
           LAYOUT PRINCIPAL
        ───────────────────────────────────────────────────────── */
        .wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 var(--pad)}

        /* ─────────────────────────────────────────────────────────
           HERO
        ───────────────────────────────────────────────────────── */
        .hero{padding:clamp(4rem,8vw,6.5rem) 0 clamp(2rem,4vw,3rem)}

        /* Badge "Articles & Analyses" */
        .badge{
          display:inline-flex;align-items:center;gap:.5rem;
          font-family:var(--m);font-size:.7rem;letter-spacing:.08em;
          color:var(--cyan);background:var(--cdim);
          border:1px solid var(--glow);border-radius:100px;
          padding:6px 14px;margin-bottom:1.5rem
        }
        .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}

        /* Titre H1 */
        .hero h1{
          font-size:clamp(2.4rem,6vw,4rem);font-weight:800;
          letter-spacing:-.03em;line-height:1.05;margin-bottom:1rem
        }
        .ac{color:var(--cyan)} /* mot accentué en cyan */

        /* Sous-titre */
        .hero-sub{
          font-family:var(--m);font-size:.88rem;color:var(--muted);
          font-weight:300;line-height:1.7;max-width:540px
        }

        /* ─────────────────────────────────────────────────────────
           BARRE D'OUTILS (recherche + filtres)
        ───────────────────────────────────────────────────────── */
        .toolbar{display:flex;flex-direction:column;gap:1rem;padding-bottom:2.5rem}

        /* Champ recherche */
        .search-wrap{position:relative;max-width:420px}
        .search-icon{
          position:absolute;left:14px;top:50%;transform:translateY(-50%);
          color:var(--dim);pointer-events:none;font-size:.85rem
        }
        .search-input{
          width:100%;background:var(--bg2);border:1px solid var(--border);
          border-radius:8px;padding:10px 14px 10px 40px;
          color:var(--text);font-family:var(--m);font-size:.8rem;
          outline:none;transition:border-color .18s
        }
        .search-input:focus{border-color:rgba(0,230,190,.28)}
        .search-input::placeholder{color:var(--dim)}

        /* Filtres par tag */
        .filters{display:flex;gap:.45rem;flex-wrap:wrap}
        .ftag{
          font-family:var(--m);font-size:.7rem;padding:6px 14px;
          border-radius:100px;border:1px solid var(--border);
          background:transparent;color:var(--muted);
          cursor:pointer;transition:all .18s
        }
        .ftag:hover{border-color:rgba(0,230,190,.28);color:var(--cyan)}
        .ftag.on{background:var(--cyan);border-color:var(--cyan);color:#080c10;font-weight:700}

        /* ─────────────────────────────────────────────────────────
           LABELS DE SECTION
        ───────────────────────────────────────────────────────── */
        .sec-tag{
          font-family:var(--m);font-size:.62rem;letter-spacing:.14em;
          text-transform:uppercase;color:var(--cyan);
          margin-bottom:1.25rem;
          display:flex;align-items:center;gap:.4rem
        }
        .sec-tag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}

        /* ─────────────────────────────────────────────────────────
           GRILLES DE CARDS
        ───────────────────────────────────────────────────────── */
        /* Grille featured (cards larges) */
        .grid-featured{
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(340px,1fr));
          gap:1.5rem;margin-bottom:4rem
        }
        /* Grille normale */
        .grid-all{
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(290px,1fr));
          gap:1.25rem;margin-bottom:5rem
        }
        @media(max-width:480px){.grid-featured,.grid-all{grid-template-columns:1fr}}

        /* Aucun résultat */
        .no-results{
          text-align:center;padding:4rem 2rem;
          font-family:var(--m);color:var(--muted);font-size:.85rem
        }

        /* ─────────────────────────────────────────────────────────
           FOOTER
        ───────────────────────────────────────────────────────── */
        footer{
          position:relative;z-index:1;
          border-top:1px solid var(--border);
          padding:1.75rem var(--pad);
          max-width:1160px;margin:0 auto;
          display:flex;justify-content:space-between;align-items:center;
          flex-wrap:wrap;gap:.75rem
        }
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
        .ft-links{display:flex;gap:1.25rem;list-style:none}
        .ft-links a{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none;transition:color .15s}
        .ft-links a:hover{color:var(--muted)}
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── NAVIGATION ── */}
      <nav>
        <a href={l("")} className="logo">
          <div className="logo-dot" />
          Neuri<em>flux</em>
        </a>
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
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── CONTENU ── */}
      <div className="wrap">

        {/* Hero */}
        <div className="hero">
          <div className="badge">
            <div className="badge-dot" />
            {t.badge}
          </div>
          <h1>{t.title} <span className="ac">{t.accent}</span></h1>
          <p className="hero-sub">{t.subtitle}</p>
        </div>

        {/* Barre d'outils */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder={t.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filters">
            <button className={`ftag${activeTag === "all" ? " on" : ""}`} onClick={() => setActiveTag("all")}>
              {t.all}
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                className={`ftag${activeTag === tag ? " on" : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="no-results">{t.noResults}</div>
        ) : (
          <>
            {featured.length > 0 && (
              <section>
                <div className="sec-tag">{t.featured}</div>
                <div className="grid-featured">
                  {featured.map(a => (
                    <Card key={a.slug} article={a} lang={lang} readMore={t.readMore} readTime={t.readTime} l={l} />
                  ))}
                </div>
              </section>
            )}
            {rest.length > 0 && (
              <section>
                {featured.length > 0 && <div className="sec-tag">{t.allLabel}</div>}
                <div className="grid-all">
                  {rest.map(a => (
                    <Card key={a.slug} article={a} lang={lang} readMore={t.readMore} readTime={t.readTime} l={l} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer>
        <span className="ft-copy">© 2026 <em>Neuriflux</em>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</span>
        <ul className="ft-links">
          <li><a href={l("/blog")}>Blog</a></li>
          <li><a href={l("/comparatifs")}>{lang === "fr" ? "Comparatifs" : "Comparisons"}</a></li>
          <li><a href={l("/newsletter")}>Newsletter</a></li>
          <li><a href={l("/legal")}>{lang === "fr" ? "Mentions légales" : "Legal"}</a></li>
        </ul>
        <span className="ft-copy">{lang === "fr" ? "Fait avec" : "Made with"} <em>♥</em> {lang === "fr" ? "en France" : "in France"}</span>
      </footer>
    </>
  );
}