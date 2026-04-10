"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { COMPARATIFS, getAllComparatifTags, type Comparatif } from "../lib/comparatifs";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "Comparatifs & Benchmarks",
    title: "Comparatifs", accent: "IA",
    subtitle: "Des comparatifs honnêtes basés sur des tests réels. Scores détaillés, verdicts clairs, sans bullshit.",
    heroStats: [
      { val: "7+", label: "comparatifs" },
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
    noResults: "Aucun comparatif ne correspond à votre recherche.",
    tools: "outils", new: "Nouveau", resultCount: "résultat(s)",
    ctaTitle: "Zéro bruit. Que du signal.",
    ctaDesc: "Les meilleurs outils IA de la semaine, testés et résumés en 5 minutes. Rejoins 4 200+ lecteurs.",
    ctaPlaceholder: "ton@email.com", ctaCta: "Je m'abonne →", ctaSent: "✓ Bienvenue !",
    ctaNo: "Sans spam. Résiliable en 1 clic.",
    ctaMiniText: "lecteurs suivent nos comparatifs chaque semaine.", ctaMiniBtn: "Rejoindre →",
    blogCtaLabel: "Vous cherchez une review solo ?",
    blogCta: "Lire tous les articles →",
    statsComps: "comparatifs", statsTools: "outils évalués", statsReaders: "lecteurs", statsYear: "mis à jour",
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
      { val: "7+", label: "comparisons" },
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
    noResults: "No comparisons match your search.",
    tools: "tools", new: "New", resultCount: "result(s)",
    ctaTitle: "Zero noise. Pure signal.",
    ctaDesc: "The best AI tools of the week, tested and summarized in 5 minutes. Join 4,200+ readers.",
    ctaPlaceholder: "your@email.com", ctaCta: "Subscribe →", ctaSent: "✓ Welcome!",
    ctaNo: "No spam. Unsubscribe in 1 click.",
    ctaMiniText: "readers follow our comparisons every week.", ctaMiniBtn: "Join now →",
    blogCtaLabel: "Looking for a solo review?",
    blogCta: "Read all articles →",
    statsComps: "comparisons", statsTools: "tools evaluated", statsReaders: "readers", statsYear: "up to date",
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

const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", Rédaction: "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", Productivité: "#10b981",
  Productivity: "#10b981", Audio: "#ef4444", Video: "#a855f7", Vidéo: "#a855f7",
};
const gc = (tag: string) => TAG_COLORS[tag] || "#00e6be";

const isNew = (d: string): boolean => {
  try { return (Date.now() - new Date(d).getTime()) / 86400000 <= 12; }
  catch { return false; }
};

// ─── Scroll progress ──────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
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

// ─── StatNumber animé ─────────────────────────────────────────────────────────
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

// ─── Mini barre de score animée ───────────────────────────────────────────────
function MiniScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(score * 10), delay); ob.disconnect(); }
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

// ─── Card comparatif ──────────────────────────────────────────────────────────
function ComparatifCard({ c, lang, t, l, isFeatured }: {
  c: Comparatif; lang: Lang; t: typeof T["fr"]; l: (p: string) => string; isFeatured?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const cl = c[lang];
  const tagColor = gc(c.tag);
  const winnerTool = c.tools.find(tool => tool.name === c.winner);
  const sorted = [...c.tools].sort((a, b) => b.globalScore - a.globalScore);
  const _new = isNew(c.date.en);

  return (
    <a
      href={l(`/comparatifs/${c.slug}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `linear-gradient(160deg,${tagColor}06,var(--bg2))` : "var(--bg2)",
        border: `1px solid ${hov ? tagColor + "32" : "var(--border)"}`,
        borderRadius: 18, padding: "1.85rem",
        display: "flex", flexDirection: "column" as const, gap: "1.2rem",
        textDecoration: "none", transition: "all 0.25s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 24px 56px rgba(0,0,0,.5), 0 0 0 1px ${tagColor}18` : "0 2px 12px rgba(0,0,0,.2)",
        position: "relative" as const, overflow: "hidden",
      }}
    >
      {/* Barre top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${tagColor},${tagColor}55,transparent)`, opacity: hov ? 1 : isFeatured ? 0.7 : 0.35, transition: "opacity 0.25s" }} />
      {/* Glow hover */}
      <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 320, height: 220, background: `radial-gradient(ellipse,${tagColor}07,transparent 68%)`, opacity: hov ? 1 : 0, transition: "opacity 0.25s", pointerEvents: "none" }} />

      {/* Ligne 1 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: ".5rem", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" as const }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", letterSpacing: ".1em", textTransform: "uppercase" as const, color: tagColor, fontWeight: 700, background: `${tagColor}14`, border: `1px solid ${tagColor}28`, padding: "3px 9px", borderRadius: 100 }}>{c.tag}</span>
          {isFeatured && <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", letterSpacing: ".07em", textTransform: "uppercase" as const, color: "#f59e0b", fontWeight: 700, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", padding: "3px 8px", borderRadius: 100 }}>★ À la une</span>}
          {_new && <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", letterSpacing: ".07em", textTransform: "uppercase" as const, color: "#10b981", fontWeight: 700, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", padding: "3px 8px", borderRadius: 100 }}>✦ {t.new}</span>}
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)" }}>⚔️ {c.tools.length} {t.tools}</span>
          <span style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)" }}>{c.date[lang]}</span>
        </div>
      </div>

      {/* Titre */}
      <div style={{ fontFamily: "var(--d)", fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1.25, color: "var(--text)", position: "relative" }}>{cl.title}</div>

      {/* Outils */}
      <div style={{ display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" as const, position: "relative" }}>
        {c.tools.map((tool, i) => (
          <span key={tool.name} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: ".3rem", background: "var(--bg3)", border: `1px solid ${hov ? tool.color + "30" : "var(--border)"}`, borderRadius: 9, padding: "5px 10px", fontFamily: "var(--m)", fontSize: ".71rem", color: hov ? tool.color : "var(--muted)", transition: "color 0.2s, border-color 0.2s" }}>
              <span style={{ fontSize: ".95rem" }}>{tool.logo}</span>{tool.name}
            </span>
            {i < c.tools.length - 1 && <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", color: "var(--dim)", fontWeight: 600, letterSpacing: ".06em" }}>{t.vs}</span>}
          </span>
        ))}
      </div>

      {/* Barres scores */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: ".45rem", position: "relative" }}>
        {sorted.map((tool, i) => (
          <div key={tool.name} style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
            <span style={{ fontFamily: "var(--m)", fontSize: ".62rem", color: tool.name === c.winner ? tool.color : "var(--muted)", fontWeight: tool.name === c.winner ? 700 : 300, minWidth: 64, display: "flex", alignItems: "center", gap: ".2rem" }}>
              {tool.name === c.winner && <span style={{ fontSize: ".6rem" }}>🏆</span>}{tool.name}
            </span>
            <MiniScoreBar score={tool.globalScore} color={tool.color} delay={i * 80} />
            <span style={{ fontFamily: "var(--m)", fontSize: ".68rem", fontWeight: 700, color: tool.color, minWidth: 28, textAlign: "right" as const }}>{tool.globalScore.toFixed(1)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: `1px solid ${hov ? tagColor + "20" : "var(--border)"}`, marginTop: "auto", transition: "border-color 0.25s", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
          <div style={{ width: 32, height: 32, background: `${tagColor}12`, border: `1px solid ${tagColor}28`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{winnerTool?.logo}</div>
          <div>
            <div style={{ fontFamily: "var(--m)", fontSize: ".55rem", color: "var(--dim)", letterSpacing: ".08em", textTransform: "uppercase" as const, marginBottom: ".1rem" }}>🏆 {t.winner}</div>
            <div style={{ fontFamily: "var(--d)", fontSize: ".82rem", fontWeight: 800, color: tagColor, letterSpacing: "-.02em", lineHeight: 1 }}>
              {c.winner}<span style={{ fontFamily: "var(--m)", fontSize: ".68rem", color: tagColor, marginLeft: ".35rem", fontWeight: 700 }}>{winnerTool?.globalScore.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
        <span style={{ fontFamily: "var(--m)", fontSize: ".68rem", color: tagColor, fontWeight: 600, opacity: hov ? 1 : 0.6, transition: "opacity 0.2s, background 0.2s, padding 0.2s, border-color 0.2s", background: hov ? `${tagColor}10` : "transparent", border: `1px solid ${hov ? tagColor + "30" : "transparent"}`, borderRadius: 7, padding: hov ? "5px 10px" : "5px 0" }}>{t.see}</span>
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
    <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(0,230,190,.07) 0%,rgba(59,130,246,.05) 100%)", border: "1px solid rgba(0,230,190,.2)", borderRadius: 16, padding: "clamp(1.75rem,4vw,2.5rem)", margin: "0 0 5rem" }}>
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

// ─── Page principale ───────────────────────────────────────────────────────────
export default function ComparatifsClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolbarSticky, setToolbarSticky] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarTop = useRef(0);

  const t = T[lang];
  const tags = getAllComparatifTags();
  const l = (path: string) => `/${lang}${path}`;

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 60);
      if (toolbarRef.current) {
        if (!toolbarTop.current) toolbarTop.current = toolbarRef.current.getBoundingClientRect().top + window.scrollY;
        setToolbarSticky(window.scrollY > toolbarTop.current - 62);
      }
    };
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
  const totalTools = COMPARATIFS.reduce((acc, c) => acc + c.tools.length, 0);

  // ── JSON-LD : ItemList + FAQPage pour les rich snippets
  const schema = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: lang === "fr" ? "Comparatifs IA 2026 — Neuriflux" : "AI Comparisons 2026 — Neuriflux",
    description: t.subtitle,
    url: `https://neuriflux.com/${lang}/comparatifs`,
    numberOfItems: COMPARATIFS.length,
    itemListElement: COMPARATIFS.map((c, i) => ({
      "@type": "ListItem", position: i + 1,
      name: c[lang].title, url: `https://neuriflux.com/${lang}/comparatifs/${c.slug}`,
      description: c[lang].desc,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: COMPARATIFS.slice(0, 5).map(c => {
      const w = c.tools.find(tool => tool.name === c.winner);
      return {
        "@type": "Question",
        name: lang === "fr"
          ? `Quel est le meilleur outil parmi ${c.tools.map(tool => tool.name).join(", ")} ?`
          : `Which is the best tool among ${c.tools.map(tool => tool.name).join(", ")}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: lang === "fr"
            ? `D'après nos tests approfondis, ${c.winner} est le meilleur avec un score global de ${w?.globalScore.toFixed(1)}/10. ${c[lang].verdict}`
            : `Based on our in-depth testing, ${c.winner} is the best with a global score of ${w?.globalScore.toFixed(1)}/10. ${c[lang].verdict}`,
        },
      };
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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

        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(8,12,16,.94);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .25s}
        nav.scrolled{box-shadow:0 4px 28px rgba(0,0,0,.5)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite;flex-shrink:0}
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

        .wrap{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:0 var(--pad)}

        .hero{padding:clamp(4rem,8vw,6.5rem) 0 0}
        .hero-inner{display:grid;grid-template-columns:1fr auto;gap:3rem;align-items:center}
        @media(max-width:720px){.hero-inner{grid-template-columns:1fr}.stats-col{display:none!important}}
        .hero-badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.68rem;letter-spacing:.07em;color:var(--cyan);background:var(--cdim);border:1px solid rgba(0,230,190,.22);border-radius:100px;padding:5px 13px;margin-bottom:1.4rem}
        .hero-badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero h1{font-size:clamp(2.5rem,6vw,4.2rem);font-weight:800;letter-spacing:-.045em;line-height:1.0;margin-bottom:1rem}
        .ac{color:var(--cyan)}
        .hero-sub{font-family:var(--m);font-size:.86rem;color:var(--muted);font-weight:300;line-height:1.72;max-width:480px}

        .stats-col{display:flex;flex-direction:column;gap:.65rem;min-width:200px}
        .hstat{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1.1rem 1.35rem;display:flex;flex-direction:column;gap:.2rem;transition:border-color .2s}
        .hstat:hover{border-color:rgba(0,230,190,.18)}
        .hstat-val{font-family:var(--d);font-size:1.5rem;font-weight:800;letter-spacing:-.04em;color:var(--cyan);line-height:1}
        .hstat-lbl{font-family:var(--m);font-size:.6rem;color:var(--muted);font-weight:300;letter-spacing:.06em;text-transform:uppercase}

        .trust-strip{margin:2.5rem 0 0;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:14px;overflow:hidden}
        @media(max-width:640px){.trust-strip{grid-template-columns:1fr}}
        .trust-cell{background:var(--bg2);padding:1rem 1.35rem;display:flex;gap:.75rem;align-items:center;transition:background .2s}
        .trust-cell:hover{background:var(--bg3)}
        .trust-icon{font-size:1.1rem;flex-shrink:0}
        .trust-t{font-family:var(--d);font-size:.78rem;font-weight:700;color:var(--text);margin-bottom:.12rem;letter-spacing:-.01em}
        .trust-d{font-family:var(--m);font-size:.65rem;color:var(--muted);font-weight:300;line-height:1.5}

        .stats-strip{display:flex;gap:2.5rem;padding:2rem 0 0;flex-wrap:wrap;border-top:1px solid var(--border);margin-top:2rem}
        .stat-item{display:flex;flex-direction:column;gap:.2rem}
        .stat-num{font-family:var(--d);font-size:1.5rem;font-weight:800;letter-spacing:-.04em;color:var(--cyan)}
        .stat-label{font-family:var(--m);font-size:.62rem;color:var(--muted);letter-spacing:.05em;text-transform:uppercase}

        .toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding:.85rem 0;transition:all .2s}
        .toolbar.sticky{position:sticky;top:60px;z-index:90;background:rgba(8,12,16,.96);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--border);padding:.7rem var(--pad);margin:0 calc(-1 * var(--pad));box-shadow:0 4px 24px rgba(0,0,0,.4)}
        .search-wrap{position:relative;flex:1;min-width:200px;max-width:360px}
        .search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none;font-size:.8rem}
        .search-input{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 12px 9px 36px;color:var(--text);font-family:var(--m);font-size:.78rem;outline:none;transition:border-color .18s}
        .search-input:focus{border-color:rgba(0,230,190,.3)}
        .search-input::placeholder{color:var(--dim)}
        .result-count{font-family:var(--m);font-size:.67rem;color:var(--dim)}
        .filters{display:flex;gap:.4rem;flex-wrap:wrap}
        .ftag{font-family:var(--m);font-size:.67rem;padding:5px 13px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;white-space:nowrap}
        .ftag:hover{border-color:rgba(0,230,190,.28);color:var(--cyan);background:var(--cdim)}
        .ftag.on{background:var(--cyan);border-color:var(--cyan);color:#080c10;font-weight:700}

        .sec-label{font-family:var(--m);font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.35rem;display:flex;align-items:center;gap:.45rem}
        .sec-label::before{content:'';width:16px;height:1px;background:var(--cyan);display:inline-block}

        .grid-featured{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:1.5rem;margin-bottom:1rem}
        .grid-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.25rem;margin-bottom:3rem}
        @media(max-width:500px){.grid-featured,.grid-all{grid-template-columns:1fr}}

        .cta-mini{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:1rem 1.5rem;margin:1.5rem 0 3rem}
        .cta-mini-text{font-family:var(--m);font-size:.74rem;color:var(--muted)}
        .cta-mini-text strong{color:var(--cyan);font-weight:700}
        .cta-mini-btn{font-family:var(--m);font-size:.73rem;font-weight:700;color:#080c10;background:var(--cyan);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;white-space:nowrap;text-decoration:none;transition:opacity .18s;display:inline-block}
        .cta-mini-btn:hover{opacity:.85}

        .blog-crosslink{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.5rem;margin-bottom:2.5rem;background:var(--bg2);transition:border-color .2s;text-decoration:none}
        .blog-crosslink:hover{border-color:rgba(0,230,190,.2)}
        .blog-crosslink-text{font-family:var(--m);font-size:.73rem;color:var(--muted)}
        .blog-crosslink-text strong{color:var(--text);font-weight:600}
        .blog-crosslink-btn{font-family:var(--m);font-size:.72rem;font-weight:600;color:var(--cyan);display:flex;align-items:center;gap:.3rem;white-space:nowrap;transition:opacity .18s}
        .blog-crosslink:hover .blog-crosslink-btn{opacity:.75}

        .no-results{text-align:center;padding:4.5rem 2rem;font-family:var(--m);color:var(--muted);font-size:.85rem;background:var(--bg2);border:1px solid var(--border);border-radius:16px;margin-bottom:4rem}

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

      <ScrollProgress />
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></a>
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
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>

      <div className="wrap">

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-badge"><div className="hero-badge-dot" />{t.badge}</div>
              <h1>{t.title} <span className="ac">{t.accent}</span></h1>
              <p className="hero-sub">{t.subtitle}</p>
            </div>
            <div className="stats-col">
              {t.heroStats.map((s, i) => (
                <div key={i} className="hstat">
                  <div className="hstat-val">{s.val}</div>
                  <div className="hstat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div className="trust-strip">
            {t.trust.map((item, i) => (
              <div key={i} className="trust-cell">
                <div className="trust-icon">{item.icon}</div>
                <div><div className="trust-t">{item.t}</div><div className="trust-d">{item.d}</div></div>
              </div>
            ))}
          </div>

          {/* Stats animées */}
          <div className="stats-strip">
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={COMPARATIFS.length} suffix="+" /></span>
              <span className="stat-label">{t.statsComps}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={totalTools} /></span>
              <span className="stat-label">{t.statsTools}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={4200} suffix="+" /></span>
              <span className="stat-label">{t.statsReaders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={2026} /></span>
              <span className="stat-label">{t.statsYear}</span>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR STICKY ── */}
        <div style={{ height: "2.5rem" }} />
        <div ref={toolbarRef} className={`toolbar${toolbarSticky ? " sticky" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flex: 1, flexWrap: "wrap" as const }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" type="text" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(search || activeTag !== "all") && (
              <span className="result-count">{filtered.length} {t.resultCount}</span>
            )}
          </div>
          <div className="filters">
            <button className={`ftag${activeTag === "all" ? " on" : ""}`} onClick={() => setActiveTag("all")}>{t.all}</button>
            {tags.map(tag => (
              <button key={tag} className={`ftag${activeTag === tag ? " on" : ""}`} onClick={() => setActiveTag(tag)}>{tag}</button>
            ))}
          </div>
        </div>
        <div style={{ height: "2rem" }} />

        {/* ── CARDS ── */}
        {filtered.length === 0 ? (
          <div className="no-results">🔍 {t.noResults}</div>
        ) : (
          <>
            {featured.length > 0 && (
              <section style={{ marginBottom: "3rem" }}>
                <div className="sec-label">{t.featured}</div>
                <div className="grid-featured">
                  {featured.map(c => <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} isFeatured />)}
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

            {rest.length > 0 && (
              <section>
                {featured.length > 0 && <div className="sec-label">{t.allLabel}</div>}
                <div className="grid-all">
                  {rest.map((c, i) => <ComparatifCard key={`${c.slug}-${i}`} c={c} lang={lang} t={t} l={l} />)}
                </div>
              </section>
            )}

            {/* Lien croisé blog */}
            {!search && (
              <a href={l("/blog")} className="blog-crosslink">
                <span className="blog-crosslink-text">
                  {t.blogCtaLabel} <strong>{lang === "fr" ? "Retrouvez nos reviews individuelles sur le blog." : "Find our individual reviews on the blog."}</strong>
                </span>
                <span className="blog-crosslink-btn">{t.blogCta}</span>
              </a>
            )}

            {/* Newsletter */}
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