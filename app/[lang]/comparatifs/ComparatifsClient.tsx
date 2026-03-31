"use client";

import { useState, useEffect, useRef } from "react";
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
    heroStats: [
      { val: "6+", label: "comparatifs" },
      { val: "3+ sem.", label: "de tests chacun" },
      { val: "0", label: "pub déguisée" },
    ],
    trust: [
      { icon: "🔬", t: "Testés en conditions réelles", d: "Jamais de démo ou de press kit" },
      { icon: "⚖️", t: "Méthode de scoring fixe", d: "5 critères pondérés, appliqués partout" },
      { icon: "💰", t: "Affiliation transparente", d: "Chaque lien sponsorisé est signalé" },
    ],
    search: "Rechercher un comparatif...",
    all: "Tous", featured: "À la une", allLabel: "Tous les comparatifs",
    vs: "vs", winner: "Gagnant", see: "Lire le comparatif →",
    noResults: "Aucun comparatif trouvé.",
    tools: "outils",
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
    badge: "Comparisons & Benchmarks",
    title: "AI", accent: "Comparisons",
    subtitle: "Honest comparisons based on real tests. Detailed scores, clear verdicts, no bullshit.",
    heroStats: [
      { val: "6+", label: "comparisons" },
      { val: "3+ wks", label: "testing each" },
      { val: "0", label: "hidden ads" },
    ],
    trust: [
      { icon: "🔬", t: "Tested in real conditions", d: "No demos, no press kits" },
      { icon: "⚖️", t: "Fixed scoring method", d: "5 weighted criteria, applied consistently" },
      { icon: "💰", t: "Transparent affiliation", d: "Every sponsored link is disclosed" },
    ],
    search: "Search comparisons...",
    all: "All", featured: "Featured", allLabel: "All comparisons",
    vs: "vs", winner: "Winner", see: "Read comparison →",
    noResults: "No comparisons found.",
    tools: "tools",
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

// ─── Couleurs par tag ──────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", Rédaction: "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", Productivité: "#10b981",
  Productivity: "#10b981", Audio: "#ef4444", Video: "#a855f7", Vidéo: "#a855f7",
};
const gc = (tag: string) => TAG_COLORS[tag] || "#00e6be";

// ─── Score pill avec couleur sémantique ───────────────────────────────────────
function ScorePill({ score }: { score: number }) {
  const c = score >= 9 ? "#00e6be" : score >= 7.5 ? "#3b82f6" : score >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <span style={{
      fontFamily: "var(--m)", fontSize: "0.78rem", fontWeight: 700,
      color: c, background: `${c}14`, border: `1px solid ${c}30`,
      borderRadius: 6, padding: "2px 8px", display: "inline-block", lineHeight: 1.4,
    }}>
      {score.toFixed(1)}
    </span>
  );
}

// ─── Mini barre de score animée ───────────────────────────────────────────────
function MiniScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setW(score * 10), delay);
        ob.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [score, delay]);
  return (
    <div ref={ref} style={{ height: 3, background: "var(--bg3)", borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 2, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 6px ${color}50` }} />
    </div>
  );
}

// ─── Card comparatif — redesignée ─────────────────────────────────────────────
function ComparatifCard({ c, lang, t, l, featured }: {
  c: Comparatif; lang: Lang; t: typeof T["fr"]; l: (p: string) => string; featured?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const cl = c[lang];
  const tagColor = gc(c.tag);
  const winnerTool = c.tools.find(tool => tool.name === c.winner);
  const sorted = [...c.tools].sort((a, b) => b.globalScore - a.globalScore);
  const best = sorted[0]?.globalScore || 10;

  return (
    <a
      href={l(`/comparatifs/${c.slug}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? `linear-gradient(160deg,${tagColor}06,var(--bg2))`
          : "var(--bg2)",
        border: `1px solid ${hov ? tagColor + "30" : "var(--border)"}`,
        borderRadius: 18, padding: "1.85rem",
        display: "flex", flexDirection: "column" as const, gap: "1.25rem",
        textDecoration: "none", transition: "all 0.25s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 24px 56px rgba(0,0,0,.5), 0 0 0 1px ${tagColor}18` : "0 2px 12px rgba(0,0,0,.2)",
        position: "relative" as const, overflow: "hidden",
      }}
    >
      {/* Barre accent en haut */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,${tagColor},${tagColor}60,transparent)`,
        opacity: hov ? 1 : featured ? 0.7 : 0.35,
        transition: "opacity 0.25s",
      }} />

      {/* Glow au hover */}
      {hov && (
        <div style={{
          position: "absolute", top: "-30%", right: "-5%",
          width: 320, height: 220,
          background: `radial-gradient(ellipse,${tagColor}07,transparent 68%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* Ligne 1 : tag + date + compteur d'outils */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            fontFamily: "var(--m)", fontSize: "0.58rem", letterSpacing: "0.1em",
            textTransform: "uppercase" as const, color: tagColor, fontWeight: 700,
            background: `${tagColor}14`, border: `1px solid ${tagColor}28`,
            padding: "3px 9px", borderRadius: 100,
          }}>{c.tag}</span>
          {featured && (
            <span style={{
              fontFamily: "var(--m)", fontSize: "0.55rem", letterSpacing: "0.08em",
              textTransform: "uppercase" as const, color: "#f59e0b", fontWeight: 700,
              background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)",
              padding: "3px 8px", borderRadius: 100,
            }}>★ À la une</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color: "var(--dim)" }}>
            ⚔️ {c.tools.length} {t.tools}
          </span>
          <span style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color: "var(--dim)" }}>{c.date[lang]}</span>
        </div>
      </div>

      {/* Titre */}
      <div style={{
        fontFamily: "var(--d)", fontSize: "1.05rem", fontWeight: 800,
        letterSpacing: "-0.025em", lineHeight: 1.25, color: "var(--text)",
      }}>{cl.title}</div>

      {/* Logos outils avec "vs" */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" as const }}>
        {c.tools.map((tool, i) => (
          <span key={tool.name} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.3rem",
              background: "var(--bg3)", border: `1px solid ${hov ? tool.color + "30" : "var(--border)"}`,
              borderRadius: 9, padding: "5px 10px",
              fontFamily: "var(--m)", fontSize: "0.71rem", color: "var(--muted)",
              transition: "border-color 0.2s",
            }}>
              <span style={{ fontSize: "0.95rem" }}>{tool.logo}</span>
              <span style={{ color: hov ? tool.color : "var(--muted)", transition: "color 0.2s" }}>{tool.name}</span>
            </span>
            {i < c.tools.length - 1 && (
              <span style={{ fontFamily: "var(--m)", fontSize: "0.55rem", color: "var(--dim)", fontWeight: 600, letterSpacing: "0.06em" }}>
                {t.vs}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Barres de scores animées */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.45rem" }}>
        {sorted.map((tool, i) => (
          <div key={tool.name} style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <span style={{
              fontFamily: "var(--m)", fontSize: "0.62rem",
              color: tool.name === c.winner ? tool.color : "var(--muted)",
              fontWeight: tool.name === c.winner ? 700 : 300,
              minWidth: 60, display: "flex", alignItems: "center", gap: "0.2rem",
            }}>
              {tool.name === c.winner && <span style={{ fontSize: "0.6rem" }}>🏆</span>}
              {tool.name}
            </span>
            <MiniScoreBar score={tool.globalScore} color={tool.color} delay={i * 80} />
            <span style={{
              fontFamily: "var(--m)", fontSize: "0.68rem", fontWeight: 700,
              color: tool.color, minWidth: 28, textAlign: "right" as const,
            }}>
              {tool.globalScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer : winner + CTA */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: "1rem", borderTop: `1px solid ${hov ? tagColor + "20" : "var(--border)"}`,
        marginTop: "auto", transition: "border-color 0.25s",
      }}>
        {/* Winner */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <div style={{
            width: 32, height: 32,
            background: `${tagColor}12`, border: `1px solid ${tagColor}28`,
            borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", transition: "all 0.2s",
          }}>
            {winnerTool?.logo}
          </div>
          <div>
            <div style={{ fontFamily: "var(--m)", fontSize: "0.55rem", color: "var(--dim)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: "0.1rem" }}>
              🏆 {t.winner}
            </div>
            <div style={{ fontFamily: "var(--d)", fontSize: "0.82rem", fontWeight: 800, color: tagColor, letterSpacing: "-0.02em", lineHeight: 1 }}>
              {c.winner}
              <span style={{ fontFamily: "var(--m)", fontSize: "0.68rem", color: tagColor, marginLeft: "0.35rem", fontWeight: 700 }}>
                {winnerTool?.globalScore.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <span style={{
          fontFamily: "var(--m)", fontSize: "0.68rem", color: tagColor,
          fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem",
          opacity: hov ? 1 : 0.6, transition: "opacity 0.2s",
          background: hov ? `${tagColor}10` : "transparent",
          border: `1px solid ${hov ? tagColor + "30" : "transparent"}`,
          borderRadius: 7, padding: hov ? "5px 10px" : "5px 0",
        }}>
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
           FOND
        ───────────────────────────────────────────────────────── */
        .bg-grid{position:fixed;inset:0;
          background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);
          background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);
          width:1000px;height:700px;
          background:radial-gradient(ellipse,rgba(0,230,190,.055) 0%,transparent 68%);
          pointer-events:none;z-index:0}

        /* ─────────────────────────────────────────────────────────
           NAVIGATION
        ───────────────────────────────────────────────────────── */
        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(8,12,16,.93);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .25s}
        nav.scrolled{box-shadow:0 4px 28px rgba(0,0,0,.5)}
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
        .wrap{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:0 var(--pad)}

        /* ─────────────────────────────────────────────────────────
           HERO — split avec stats
        ───────────────────────────────────────────────────────── */
        .hero{padding:clamp(4.5rem,9vw,7rem) 0 0}
        .hero-inner{display:grid;grid-template-columns:1fr auto;gap:3rem;align-items:center}
        @media(max-width:720px){.hero-inner{grid-template-columns:1fr}.hero-stats-col{display:none!important}}

        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.68rem;letter-spacing:.07em;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:5px 13px;margin-bottom:1.4rem}
        .badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero h1{font-size:clamp(2.6rem,6vw,4.2rem);font-weight:800;letter-spacing:-.045em;line-height:1.0;margin-bottom:1rem}
        .ac{color:var(--cyan)}
        .hero-sub{font-family:var(--m);font-size:.86rem;color:var(--muted);font-weight:300;line-height:1.72;max-width:480px;margin-bottom:2.5rem}

        /* Stats côté droit dans le hero */
        .hero-stats-col{display:flex;flex-direction:column;gap:.65rem;min-width:200px}
        .hstat{
          background:var(--bg2);border:1px solid var(--border);border-radius:14px;
          padding:1.1rem 1.35rem;display:flex;flex-direction:column;gap:.2rem;
          transition:border-color .2s
        }
        .hstat:hover{border-color:rgba(0,230,190,.18)}
        .hstat-val{font-family:var(--d);font-size:1.5rem;font-weight:800;letter-spacing:-.04em;color:var(--cyan);line-height:1}
        .hstat-lbl{font-family:var(--m);font-size:.6rem;color:var(--muted);font-weight:300;letter-spacing:.06em;text-transform:uppercase}

        /* ─────────────────────────────────────────────────────────
           TRUST STRIP — 3 colonnes
        ───────────────────────────────────────────────────────── */
        .trust-strip{
          margin:2.5rem 0 3rem;
          display:grid;grid-template-columns:repeat(3,1fr);
          gap:1px;background:var(--border);
          border:1px solid var(--border);border-radius:14px;overflow:hidden
        }
        @media(max-width:640px){.trust-strip{grid-template-columns:1fr}}
        .trust-cell{background:var(--bg2);padding:1rem 1.35rem;display:flex;gap:.75rem;align-items:center;transition:background .2s}
        .trust-cell:hover{background:var(--bg3)}
        .trust-icon{font-size:1.1rem;flex-shrink:0}
        .trust-t{font-family:var(--d);font-size:.78rem;font-weight:700;color:var(--text);margin-bottom:.12rem;letter-spacing:-.01em}
        .trust-d{font-family:var(--m);font-size:.65rem;color:var(--muted);font-weight:300;line-height:1.5}

        /* ─────────────────────────────────────────────────────────
           BARRE OUTILS — recherche + filtres
        ───────────────────────────────────────────────────────── */
        .toolbar{
          display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:1rem;
          padding:1.1rem 1.5rem;
          background:var(--bg2);border:1px solid var(--border);border-radius:12px;
          margin-bottom:2.5rem
        }
        .search-wrap{position:relative;flex:1;min-width:200px;max-width:360px}
        .search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none;font-size:.8rem}
        .search-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px 9px 36px;color:var(--text);font-family:var(--m);font-size:.78rem;outline:none;transition:border-color .18s}
        .search-input:focus{border-color:rgba(0,230,190,.28);background:var(--bg2)}
        .search-input::placeholder{color:var(--dim)}
        .filters{display:flex;gap:.4rem;flex-wrap:wrap}
        .ftag{font-family:var(--m);font-size:.67rem;padding:5px 13px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;letter-spacing:.02em}
        .ftag:hover{border-color:rgba(0,230,190,.28);color:var(--cyan);background:var(--cdim)}
        .ftag.on{background:var(--cyan);border-color:var(--cyan);color:#080c10;font-weight:700}

        /* ─────────────────────────────────────────────────────────
           LABELS DE SECTION
        ───────────────────────────────────────────────────────── */
        .sec-label{
          font-family:var(--m);font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;
          color:var(--cyan);margin-bottom:1.35rem;
          display:flex;align-items:center;gap:.45rem
        }
        .sec-label::before{content:'';width:16px;height:1px;background:var(--cyan);display:inline-block}

        /* ─────────────────────────────────────────────────────────
           GRILLES
        ───────────────────────────────────────────────────────── */
        /* Featured — 2 colonnes larges */
        .grid-featured{
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(380px,1fr));
          gap:1.5rem;margin-bottom:4.5rem
        }
        /* All — 3 colonnes compactes */
        .grid-all{
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
          gap:1.25rem;margin-bottom:6rem
        }
        @media(max-width:500px){.grid-featured,.grid-all{grid-template-columns:1fr}}

        .no-results{
          text-align:center;padding:5rem 2rem;
          font-family:var(--m);color:var(--muted);font-size:.85rem;
          background:var(--bg2);border:1px solid var(--border);border-radius:16px;
          margin-bottom:4rem
        }

        /* ─────────────────────────────────────────────────────────
           FOOTER — identique HomeClient
        ───────────────────────────────────────────────────────── */
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.25rem var(--pad);max-width:1200px;margin:0 auto}
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

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-inner">
            <div>
              <div className="badge"><div className="badge-dot" />{t.badge}</div>
              <h1>{t.title} <span className="ac">{t.accent}</span></h1>
              <p className="hero-sub">{t.subtitle}</p>
            </div>
            {/* Stats colonne droite */}
            <div className="hero-stats-col">
              {t.heroStats.map((s, i) => (
                <div key={i} className="hstat">
                  <div className="hstat-val">{s.val}</div>
                  <div className="hstat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div className="trust-strip">
            {t.trust.map((item, i) => (
              <div key={i} className="trust-cell">
                <div className="trust-icon">{item.icon}</div>
                <div>
                  <div className="trust-t">{item.t}</div>
                  <div className="trust-d">{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BARRE OUTILS ── */}
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

        {/* ── CARDS ── */}
        {filtered.length === 0 ? (
          <div className="no-results">
            {lang === "fr" ? "🔍 Aucun comparatif ne correspond à votre recherche." : "🔍 No comparisons match your search."}
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section>
                <div className="sec-label">{t.featured}</div>
                <div className="grid-featured">
                  {featured.map(c => (
                    <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} featured />
                  ))}
                </div>
              </section>
            )}
            {rest.length > 0 && (
              <section>
                {featured.length > 0 && <div className="sec-label">{t.allLabel}</div>}
                <div className="grid-all">
                  {rest.map(c => (
                    <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="ft">
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}>
              <div className="logo-dot" />Neuri<em>flux</em>
            </a>
            <p className="ft-tag">{t.ftTagline}</p>
          </div>
          <div>
            <div className="ft-col">{t.ftContent}</div>
            <ul className="ft-ul">
              {t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}
            </ul>
          </div>
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