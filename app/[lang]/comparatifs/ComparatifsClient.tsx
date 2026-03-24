"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { COMPARATIFS, getAllComparatifTags, type Comparatif } from "../lib/comparatifs";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", about: "A propos" },
    badge: "Comparatifs & Benchmarks",
    title: "Comparatifs", accent: "IA",
    subtitle: "Des comparatifs honnêtes basés sur des tests réels. Scores détaillés, verdicts clairs, sans bullshit.",
    search: "Rechercher un comparatif...",
    all: "Tous",
    featured: "À la une",
    allLabel: "Tous les comparatifs",
    vs: "vs",
    winner: "Gagnant",
    see: "Voir le comparatif →",
    noResults: "Aucun comparatif trouvé.",
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", about: "About" },
    badge: "Comparisons & Benchmarks",
    title: "AI", accent: "Comparisons",
    subtitle: "Honest comparisons based on real tests. Detailed scores, clear verdicts, no bullshit.",
    search: "Search comparisons...",
    all: "All",
    featured: "Featured",
    allLabel: "All comparisons",
    vs: "vs",
    winner: "Winner",
    see: "See comparison →",
    noResults: "No comparisons found.",
  },
};

const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", "Rédaction": "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", "Productivité": "#10b981",
  Productivity: "#10b981", Audio: "#ef4444",
};
function gc(tag: string) { return TAG_COLORS[tag] || "#00e6be"; }

function ScorePill({ score }: { score: number }) {
  const color = score >= 9 ? "#00e6be" : score >= 8 ? "#3b82f6" : score >= 7 ? "#f59e0b" : "#ef4444";
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 6, padding: "3px 10px" }}>
      {score.toFixed(1)}
    </span>
  );
}

function ComparatifCard({ c, lang, t, l }: {
  c: Comparatif; lang: Lang; t: typeof T["fr"]; l: (p: string) => string;
}) {
  const [hov, setHov] = useState(false);
  const cl = c[lang];
  const tagColor = gc(c.tag);
  const winner = c.tools.find(tool => tool.name === c.winner);

  return (
    <a
      href={l(`/comparatifs/${c.slug}`)}
      style={{ background: "var(--bg2)", border: `1px solid ${hov ? "rgba(0,230,190,0.25)" : "var(--border)"}`, borderRadius: 16, padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem", textDecoration: "none", transition: "all 0.25s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 16px 50px rgba(0,0,0,0.5)" : "none", position: "relative", overflow: "hidden" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${tagColor}, transparent)`, opacity: hov ? 1 : 0.5, transition: "opacity 0.3s" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: tagColor, fontWeight: 500, background: `${tagColor}18`, border: `1px solid ${tagColor}30`, padding: "3px 10px", borderRadius: 100 }}>{c.tag}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-dim)" }}>{c.date[lang]}</span>
      </div>

      <div style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, color: "var(--text)", fontFamily: "var(--font-display)" }}>{cl.title}</div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        {c.tools.map((tool, i) => (
          <span key={tool.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span style={{ color: tool.color }}>{tool.logo}</span> {tool.name}
            </span>
            {i < c.tools.length - 1 && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-dim)" }}>{t.vs}</span>}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {c.tools.map(tool => (
          <div key={tool.name} style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center" }}>
            <ScorePill score={tool.globalScore} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-dim)" }}>{tool.name}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{t.winner}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--cyan)", fontWeight: 600 }}>
            {winner?.logo} {c.winner}
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--cyan)", fontWeight: 500 }}>{t.see}</span>
      </div>
    </a>
  );
}

export default function ComparatifsClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const t = T[lang];
  const tags = getAllComparatifTags();

  const l = (path: string) => `/${lang}${path}`;
  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  const filtered = COMPARATIFS.filter(c => {
    const matchTag = activeTag === "all" || c.tag === activeTag;
    const s = search.toLowerCase();
    const matchSearch = !s || c[lang].title.toLowerCase().includes(s) || c.tools.some(tool => tool.name.toLowerCase().includes(s));
    return matchTag && matchSearch;
  });

  const featured = filtered.filter(c => c.featured);
  const rest = filtered.filter(c => !c.featured);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--border:rgba(255,255,255,0.07);--border-glow:rgba(0,230,190,0.25);--cyan:#00e6be;--cyan-dim:rgba(0,230,190,0.12);--text:#f0f4f8;--text-muted:#6b7a8d;--text-dim:#3d4f61;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace}
        html{scroll-behavior:smooth}body{background:var(--bg);color:var(--text);font-family:var(--font-display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
        .glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:900px;height:700px;background:radial-gradient(ellipse,rgba(0,230,190,0.06) 0%,transparent 70%);pointer-events:none;z-index:0}
        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(8,12,16,0.85);border-bottom:1px solid var(--border);padding:0 clamp(1.5rem,5vw,4rem);height:64px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:-0.02em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.5rem}
        .logo span{color:var(--cyan)}
        .dot{width:7px;height:7px;background:var(--cyan);border-radius:50%;box-shadow:0 0 10px var(--cyan);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none}
        @media(max-width:768px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.5rem 2rem;gap:1.2rem}}
        .nav-links a{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);text-decoration:none;letter-spacing:.04em;transition:color .2s}
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px;display:flex;gap:2px}
        .lb{font-family:var(--font-mono);font-size:.7rem;padding:4px 10px;border-radius:4px;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--text-muted)}
        .lb.active{background:var(--cyan);color:var(--bg);font-weight:600}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}
        @media(max-width:768px){.hb{display:flex}}
        .hb span{display:block;width:20px;height:2px;background:var(--text-muted);border-radius:2px}
        .wrap{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:0 clamp(1.5rem,5vw,4rem)}
        .hero{padding:clamp(4rem,8vw,7rem) 0 clamp(2rem,4vw,3rem)}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-mono);font-size:.72rem;letter-spacing:.08em;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:100px;padding:6px 14px;margin-bottom:1.5rem}
        h1{font-size:clamp(2.4rem,6vw,4rem);font-weight:800;letter-spacing:-.03em;line-height:1.05;margin-bottom:1rem}
        .ac{color:var(--cyan)}
        .sub{font-family:var(--font-mono);font-size:.92rem;color:var(--text-muted);font-weight:300;line-height:1.7;max-width:560px}
        .toolbar{display:flex;flex-direction:column;gap:1rem;padding:1.5rem 0 2.5rem}
        .sw{position:relative;max-width:420px}
        .si{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-dim);pointer-events:none;font-size:.85rem}
        .sinput{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:11px 16px 11px 40px;color:var(--text);font-family:var(--font-mono);font-size:.82rem;outline:none;transition:border-color .2s}
        .sinput:focus{border-color:var(--border-glow)}.sinput::placeholder{color:var(--text-dim)}
        .filters{display:flex;gap:.5rem;flex-wrap:wrap}
        .ft{font-family:var(--font-mono);font-size:.72rem;padding:6px 14px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--text-muted);cursor:pointer;transition:all .2s}
        .ft:hover{border-color:var(--border-glow);color:var(--cyan)}.ft.active{background:var(--cyan);border-color:var(--cyan);color:var(--bg);font-weight:600}
        .stag{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.5rem}
        .stag::before{content:'';display:inline-block;width:20px;height:1px;background:var(--cyan)}
        .gf{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:1.5rem;margin-bottom:4rem}
        .ga{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.25rem;margin-bottom:5rem}
        @media(max-width:500px){.gf,.ga{grid-template-columns:1fr}}
        .nr{text-align:center;padding:4rem;font-family:var(--font-mono);color:var(--text-muted);font-size:.85rem}
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2rem clamp(1.5rem,5vw,4rem);max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
        .cp{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim)}.cp span{color:var(--cyan)}
      `}</style>

      <div className="grid-bg" /><div className="glow" />

      <nav>
        <a href={l("")} className="logo"><div className="dot" />Neuri<span>flux</span></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")} className="active">{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/about")}>{t.nav.about}</a></li>
        </ul>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div className="lt">
            <button className={`lb${lang === "fr" ? " active" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " active" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
        </div>
      </nav>

      <div className="wrap">
        <div className="hero">
          <div className="badge">
            <span style={{ width: 6, height: 6, background: "var(--cyan)", borderRadius: "50%", display: "inline-block" }} />
            {t.badge}
          </div>
          <h1>{t.title} <span className="ac">{t.accent}</span></h1>
          <p className="sub">{t.subtitle}</p>
        </div>

        <div className="toolbar">
          <div className="sw">
            <span className="si">🔍</span>
            <input className="sinput" type="text" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filters">
            <button className={`ft${activeTag === "all" ? " active" : ""}`} onClick={() => setActiveTag("all")}>{t.all}</button>
            {tags.map(tag => (
              <button key={tag} className={`ft${activeTag === tag ? " active" : ""}`} onClick={() => setActiveTag(tag)}>{tag}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="nr">{t.noResults}</div>
        ) : (
          <>
            {featured.length > 0 && (
              <div>
                <div className="stag">{t.featured}</div>
                <div className="gf">{featured.map(c => <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} />)}</div>
              </div>
            )}
            {rest.length > 0 && (
              <div>
                {featured.length > 0 && <div className="stag">{t.allLabel}</div>}
                <div className="ga">{rest.map(c => <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} />)}</div>
              </div>
            )}
          </>
        )}
      </div>

      <footer>
        <p className="cp">© 2026 <span>Neuriflux</span>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
        <p className="cp">{lang === "fr" ? "Fait avec" : "Made with"} <span>♥</span> {lang === "fr" ? "en France" : "in France"}</p>
      </footer>
    </>
  );
}