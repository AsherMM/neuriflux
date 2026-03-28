"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { COMPARATIFS, getAllComparatifTags, type Comparatif } from "../lib/comparatifs";

type Lang = "fr" | "en";

// ─── Traductions ───────────────────────────────────────────────────────────────
const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "Comparatifs & Benchmarks",
    title: "Comparatifs", accent: "IA",
    subtitle: "Des comparatifs honnêtes basés sur des tests réels. Scores détaillés, verdicts clairs, sans bullshit.",
    search: "Rechercher un comparatif...",
    all: "Tous", featured: "À la une", allLabel: "Tous les comparatifs",
    vs: "vs", winner: "Gagnant", see: "Voir →",
    noResults: "Aucun comparatif trouvé.",
    tools: "outils testés",
    ftTagline: "Le média indépendant des outils IA.",
    ftContent: "Contenu", ftLegal: "Légal",
    ftLinks: [
      { l: "Blog", h: "/blog" },
      { l: "Comparatifs", h: "/comparatifs" },
      { l: "Newsletter", h: "/newsletter" },
      { l: "Contact", h: "/contact" },
      { l: "À propos", h: "/about" },
    ],
    ftLegal2: [
      { l: "Mentions légales", h: "/legal" },
      { l: "Confidentialité", h: "/privacy" },
      { l: "Cookies", h: "/cookies" },
    ],
    ftRights: "Tous droits réservés.",
    ftMade: "Fait avec ♥ en France",
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    badge: "Comparisons & Benchmarks",
    title: "AI", accent: "Comparisons",
    subtitle: "Honest comparisons based on real tests. Detailed scores, clear verdicts, no bullshit.",
    search: "Search comparisons...",
    all: "All", featured: "Featured", allLabel: "All comparisons",
    vs: "vs", winner: "Winner", see: "See →",
    noResults: "No comparisons found.",
    tools: "tools tested",
    ftTagline: "The independent AI tools media.",
    ftContent: "Content", ftLegal: "Legal",
    ftLinks: [
      { l: "Blog", h: "/blog" },
      { l: "Comparisons", h: "/comparatifs" },
      { l: "Newsletter", h: "/newsletter" },
      { l: "Contact", h: "/contact" },
      { l: "About", h: "/about" },
    ],
    ftLegal2: [
      { l: "Legal notice", h: "/legal" },
      { l: "Privacy", h: "/privacy" },
      { l: "Cookies", h: "/cookies" },
    ],
    ftRights: "All rights reserved.",
    ftMade: "Made with ♥ in France",
  },
};

// ─── Couleurs par tag ──────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", Rédaction: "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", Productivité: "#10b981",
  Productivity: "#10b981", Audio: "#ef4444", Video: "#a855f7", Vidéo: "#a855f7",
};
const gc = (tag: string) => TAG_COLORS[tag] || "#00e6be";

// ─── Score pill ────────────────────────────────────────────────────────────────
function ScorePill({ score, color }: { score: number; color: string }) {
  const bg = score >= 9 ? "#00e6be" : score >= 7.5 ? "#3b82f6" : score >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <span style={{
      fontFamily: "var(--m)", fontSize: "0.8rem", fontWeight: 700,
      color: bg, background: `${bg}18`, border: `1px solid ${bg}38`,
      borderRadius: 6, padding: "2px 9px", display: "inline-block",
    }}>
      {score.toFixed(1)}
    </span>
  );
}

// ─── Card comparatif ───────────────────────────────────────────────────────────
function ComparatifCard({ c, lang, t, l }: {
  c: Comparatif; lang: Lang; t: typeof T["fr"]; l: (p: string) => string;
}) {
  const [hov, setHov] = useState(false);
  const cl = c[lang];
  const tagColor = gc(c.tag);
  const winnerTool = c.tools.find(tool => tool.name === c.winner);

  return (
    <a
      href={l(`/comparatifs/${c.slug}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--bg2)",
        border: `1px solid ${hov ? tagColor + "35" : "var(--border)"}`,
        borderRadius: 16, padding: "1.75rem",
        display: "flex", flexDirection: "column" as const, gap: "1.1rem",
        textDecoration: "none", transition: "all 0.22s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 20px 50px rgba(0,0,0,.5), 0 0 0 1px ${tagColor}20` : "none",
        position: "relative" as const, overflow: "hidden",
      }}
    >
      {/* Barre colorée */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${tagColor},${tagColor}50,transparent)`, opacity: hov ? 1 : 0.55, transition: "opacity 0.25s" }} />
      {/* Glow hover */}
      {hov && (
        <div style={{ position: "absolute", top: "-40%", right: "-10%", width: 280, height: 200, background: `radial-gradient(ellipse,${tagColor}08,transparent 70%)`, pointerEvents: "none" }} />
      )}
      {/* Tag + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: "0.4rem" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: tagColor, fontWeight: 700, background: `${tagColor}18`, border: `1px solid ${tagColor}30`, padding: "3px 10px", borderRadius: 100 }}>{c.tag}</span>
        <span style={{ fontFamily: "var(--m)", fontSize: "0.65rem", color: "var(--dim)" }}>{c.date[lang]}</span>
      </div>
      {/* Titre */}
      <div style={{ fontFamily: "var(--d)", fontSize: "1.02rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, color: "var(--text)" }}>{cl.title}</div>
      {/* Outils */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" as const }}>
        {c.tools.map((tool, i) => (
          <span key={tool.name} style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", fontFamily: "var(--m)", fontSize: "0.72rem", color: "var(--muted)" }}>
              <span style={{ color: tool.color }}>{tool.logo}</span> {tool.name}
            </span>
            {i < c.tools.length - 1 && (
              <span style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color: "var(--dim)", fontWeight: 500 }}>{t.vs}</span>
            )}
          </span>
        ))}
      </div>
      {/* Scores */}
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" as const, alignItems: "center" }}>
        {c.tools.map(tool => (
          <div key={tool.name} style={{ display: "flex", flexDirection: "column" as const, gap: "0.2rem", alignItems: "center" }}>
            <ScorePill score={tool.globalScore} color={tool.color} />
            <span style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color: "var(--dim)" }}>{tool.name}</span>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: "0.62rem", color: "var(--dim)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>🏆 {t.winner}</span>
          <span style={{ fontFamily: "var(--m)", fontSize: "0.76rem", color: tagColor, fontWeight: 700 }}>{winnerTool?.logo} {c.winner}</span>
          {winnerTool && <ScorePill score={winnerTool.globalScore} color={tagColor} />}
        </div>
        <span style={{ fontFamily: "var(--m)", fontSize: "0.7rem", color: tagColor, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", opacity: hov ? 1 : 0.7, transition: "opacity 0.2s" }}>
          {t.see}
        </span>
      </div>
    </a>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function ComparatifsClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = T[lang];
  const tags = getAllComparatifTags();
  const l = (path: string) => `/${lang}${path}`;

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const filtered = COMPARATIFS.filter(c => {
    const matchTag = activeTag === "all" || c.tag === activeTag;
    const s = search.toLowerCase();
    const matchSearch = !s || c[lang].title.toLowerCase().includes(s) || c.tools.some(tool => tool.name.toLowerCase().includes(s));
    return matchTag && matchSearch;
  });

  const featured = filtered.filter(c => c.featured);
  const rest = filtered.filter(c => !c.featured);

  const schema = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: lang === "fr" ? "Comparatifs IA 2026 — Neuriflux" : "AI Comparisons 2026 — Neuriflux",
    description: t.subtitle,
    url: `https://neuriflux.com/${lang}/comparatifs`,
    numberOfItems: COMPARATIFS.length,
    itemListElement: COMPARATIFS.map((c, i) => ({
      "@type": "ListItem", position: i + 1,
      name: c[lang].title, url: `https://neuriflux.com/${lang}/comparatifs/${c.slug}`,
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
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,.065);--glow:rgba(0,230,190,.2);
          --cyan:#00e6be;--cdim:rgba(0,230,190,.09);
          --text:#edf2f7;--muted:#5a6a7a;--dim:#2a3a4a;
          --d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;
          --r:10px;--pad:clamp(1.5rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}

        /* ─────────────────────────────────────────────────────────
           FOND : GRILLE + GLOW
        ───────────────────────────────────────────────────────── */
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:900px;height:700px;background:radial-gradient(ellipse,rgba(0,230,190,.055) 0%,transparent 68%);pointer-events:none;z-index:0}

        /* ─────────────────────────────────────────────────────────
           NAVIGATION — identique sur toutes les pages
        ───────────────────────────────────────────────────────── */
        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(8,12,16,.93);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .2s}
        nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.4)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
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

        /* ─────────────────────────────────────────────────────────
           LAYOUT
        ───────────────────────────────────────────────────────── */
        .wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 var(--pad)}

        /* ─────────────────────────────────────────────────────────
           HERO
        ───────────────────────────────────────────────────────── */
        .hero{padding:clamp(4rem,8vw,6.5rem) 0 clamp(2rem,4vw,3rem)}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.7rem;letter-spacing:.08em;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:6px 14px;margin-bottom:1.5rem}
        .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero h1{font-size:clamp(2.4rem,6vw,4rem);font-weight:800;letter-spacing:-.03em;line-height:1.05;margin-bottom:1rem}
        .ac{color:var(--cyan)}
        .hero-sub{font-family:var(--m);font-size:.88rem;color:var(--muted);font-weight:300;line-height:1.7;max-width:540px}

        /* ─────────────────────────────────────────────────────────
           BARRE OUTILS
        ───────────────────────────────────────────────────────── */
        .toolbar{display:flex;flex-direction:column;gap:1rem;padding-bottom:2.5rem}
        .search-wrap{position:relative;max-width:420px}
        .search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none;font-size:.85rem}
        .search-input{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 14px 10px 40px;color:var(--text);font-family:var(--m);font-size:.8rem;outline:none;transition:border-color .18s}
        .search-input:focus{border-color:rgba(0,230,190,.28)}
        .search-input::placeholder{color:var(--dim)}
        .filters{display:flex;gap:.45rem;flex-wrap:wrap}
        .ftag{font-family:var(--m);font-size:.7rem;padding:6px 14px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s}
        .ftag:hover{border-color:rgba(0,230,190,.28);color:var(--cyan)}
        .ftag.on{background:var(--cyan);border-color:var(--cyan);color:#080c10;font-weight:700}

        /* ─────────────────────────────────────────────────────────
           LABELS DE SECTION
        ───────────────────────────────────────────────────────── */
        .sec-tag{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.4rem}
        .sec-tag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}

        /* ─────────────────────────────────────────────────────────
           GRILLES
        ───────────────────────────────────────────────────────── */
        .grid-featured{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:1.5rem;margin-bottom:4rem}
        .grid-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.25rem;margin-bottom:5rem}
        @media(max-width:480px){.grid-featured,.grid-all{grid-template-columns:1fr}}
        .no-results{text-align:center;padding:4rem 2rem;font-family:var(--m);color:var(--muted);font-size:.85rem}

        /* ─────────────────────────────────────────────────────────
           FOOTER — identique à HomeClient
        ───────────────────────────────────────────────────────── */
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

      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── NAVIGATION ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo">
          <div className="logo-dot" />
          Neuri<em>flux</em>
        </a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")} className="active">{t.nav.comparatifs}</a></li>
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
            <input className="search-input" type="text" placeholder={t.search}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filters">
            <button className={`ftag${activeTag === "all" ? " on" : ""}`} onClick={() => setActiveTag("all")}>
              {t.all}
            </button>
            {tags.map(tag => (
              <button key={tag} className={`ftag${activeTag === tag ? " on" : ""}`} onClick={() => setActiveTag(tag)}>
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
                  {featured.map(c => <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} />)}
                </div>
              </section>
            )}
            {rest.length > 0 && (
              <section>
                {featured.length > 0 && <div className="sec-tag">{t.allLabel}</div>}
                <div className="grid-all">
                  {rest.map(c => <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER — identique HomeClient ── */}
      <footer>
        <div className="ft">
          {/* Colonne 1 : logo + tagline */}
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}>
              <div className="logo-dot" />Neuri<em>flux</em>
            </a>
            <p className="ft-tag">{t.ftTagline}</p>
          </div>
          {/* Colonne 2 : contenu */}
          <div>
            <div className="ft-col">{t.ftContent}</div>
            <ul className="ft-ul">
              {t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}
            </ul>
          </div>
          {/* Colonne 3 : légal */}
          <div>
            <div className="ft-col">{t.ftLegal}</div>
            <ul className="ft-ul">
              {t.ftLegal2.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}
            </ul>
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