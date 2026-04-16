"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { COMPARATIFS, getAllComparatifTags, type Comparatif } from "../lib/comparatifs";

type Lang = "fr" | "en";

const TAG_MAP: Record<string, { fr: string; en: string; color: string }> = {
  Chatbots:     { fr: "Chatbots",     en: "Chatbots",     color: "#00e6be" },
  Code:         { fr: "Code",         en: "Code",         color: "#3b82f6" },
  Rédaction:    { fr: "Rédaction",    en: "Writing",      color: "#f59e0b" },
  Writing:      { fr: "Rédaction",    en: "Writing",      color: "#f59e0b" },
  Image:        { fr: "Image",        en: "Image",        color: "#a855f7" },
  Productivité: { fr: "Productivité", en: "Productivity", color: "#10b981" },
  Productivity: { fr: "Productivité", en: "Productivity", color: "#10b981" },
  Audio:        { fr: "Audio",        en: "Audio",        color: "#ef4444" },
  Video:        { fr: "Vidéo",        en: "Video",        color: "#e11d48" },
  Vidéo:        { fr: "Vidéo",        en: "Video",        color: "#e11d48" },
};

const canonical = (tag: string): string => TAG_MAP[tag]?.fr ?? tag;
const gc = (tag: string): string => TAG_MAP[tag]?.color ?? "#00e6be";
const tagLabel = (tag: string, lang: Lang): string => TAG_MAP[tag]?.[lang] ?? tag;
const getAllCanonicalTags = (): string[] => {
  const seen = new Set<string>();
  COMPARATIFS.forEach(c => { const cv = canonical(c.tag); if (!seen.has(cv)) seen.add(cv); });
  return Array.from(seen);
};

const isNew = (d: string): boolean => {
  try { return (Date.now() - new Date(d).getTime()) / 86400000 <= 12; }
  catch { return false; }
};

const fakeReaders = (slug: string) =>
  (slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 4200) + 800;

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "Comparatifs & Benchmarks",
    title: "Les comparatifs", accent: "Neuriflux",
    subtitle: "Tests approfondis, scoring transparent, verdicts sans compromis sur les meilleurs outils IA.",
    trust: [
      { icon: "🔬", t: "Tests en conditions réelles", d: "Jamais de démo ou de press kit" },
      { icon: "⚖️", t: "Méthode de scoring fixe", d: "Critères pondérés, appliqués partout" },
      { icon: "💰", t: "Affiliation transparente", d: "Chaque lien sponsorisé est signalé" },
    ],
    search: "Rechercher un comparatif ou un outil...",
    all: "Tous", featured: "À la une", allLabel: "Tous les comparatifs",
    vs: "vs", winner: "Gagnant", see: "Lire →",
    noResults: "Aucun comparatif ne correspond à votre recherche.",
    tools: "outils", new: "Nouveau", resultCount: "résultat(s)", readers: "lecteurs",
    ctaTitle: "Zéro bruit. Que du signal.",
    ctaDesc: "Les meilleurs outils IA de la semaine, testés et résumés en 5 minutes. Rejoins 4 200+ lecteurs.",
    ctaPlaceholder: "ton@email.com", ctaCta: "Je m'abonne →", ctaSent: "✓ Bienvenue !",
    ctaNo: "Sans spam. Résiliable en 1 clic.",
    ctaMiniText: "lecteurs suivent nos comparatifs chaque semaine.", ctaMiniBtn: "Rejoindre →",
    blogCtaLabel: "Vous cherchez une review solo ?", blogCta: "Voir tous les articles →",
    statsComps: "comparatifs", statsTools: "outils évalués", statsReaders: "lecteurs", statsYear: "mis à jour",
    ftTagline: "Le média indépendant des outils IA.", ftContent: "Contenu", ftLegal: "Légal",
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
    title: "Neuriflux", accent: "Comparisons",
    subtitle: "In-depth tests, transparent scoring, no-compromise verdicts on the best AI tools.",
    trust: [
      { icon: "🔬", t: "Real-world testing", d: "No demos, no press kits" },
      { icon: "⚖️", t: "Fixed scoring method", d: "Weighted criteria, applied consistently" },
      { icon: "💰", t: "Transparent affiliation", d: "Every sponsored link is disclosed" },
    ],
    search: "Search comparisons or tools...",
    all: "All", featured: "Featured", allLabel: "All comparisons",
    vs: "vs", winner: "Winner", see: "Read →",
    noResults: "No comparisons match your search.",
    tools: "tools", new: "New", resultCount: "result(s)", readers: "readers",
    ctaTitle: "Zero noise. Pure signal.",
    ctaDesc: "The best AI tools of the week, tested and summarized in 5 minutes. Join 4,200+ readers.",
    ctaPlaceholder: "your@email.com", ctaCta: "Subscribe →", ctaSent: "✓ Welcome!",
    ctaNo: "No spam. Unsubscribe in 1 click.",
    ctaMiniText: "readers follow our comparisons every week.", ctaMiniBtn: "Join now →",
    blogCtaLabel: "Looking for a solo review?", blogCta: "Browse all articles →",
    statsComps: "comparisons", statsTools: "tools evaluated", statsReaders: "readers", statsYear: "up to date",
    ftTagline: "The independent AI tools media.", ftContent: "Content", ftLegal: "Legal",
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
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 300, background: "rgba(0,0,0,.5)" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#00e6be,#3b82f6,#e11d48)", transition: "width .08s linear", boxShadow: "0 0 12px rgba(0,230,190,.6)" }} />
    </div>
  );
}

function StatNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const dur = 1200, t0 = Date.now();
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

function MiniScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(score * 10), delay); ob.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [score, delay]);
  return (
    <div ref={ref} style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${w}%`, background: `linear-gradient(90deg,${color},${color}bb)`, borderRadius: 2, transition: "width 1s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 8px ${color}50` }} />
    </div>
  );
}

function ComparatifCard({ c, lang, t, l, isFeatured, animDelay }: {
  c: Comparatif; lang: Lang; t: typeof T["fr"]; l: (p: string) => string;
  isFeatured?: boolean; animDelay?: number;
}) {
  const [hov, setHov] = useState(false);
  const cl = c[lang];
  const tagColor = gc(c.tag);
  const winnerTool = c.tools.find(tool => tool.name === c.winner);
  const sorted = [...c.tools].sort((a, b) => b.globalScore - a.globalScore);
  const _new = isNew(c.date.en);
  const readers = fakeReaders(c.slug);

  return (
    <a
      href={l(`/comparatifs/${c.slug}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `linear-gradient(145deg,${tagColor}07 0%,var(--bg2) 60%)` : "var(--bg2)",
        border: `1px solid ${hov ? tagColor + "38" : "var(--border)"}`,
        borderRadius: 18, padding: "1.85rem 2rem",
        display: "flex", flexDirection: "column" as const, gap: "1.35rem",
        textDecoration: "none",
        transition: "border-color .22s, transform .22s, box-shadow .22s, background .22s",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov
          ? `0 28px 64px rgba(0,0,0,.55), 0 0 0 1px ${tagColor}18, inset 0 1px 0 rgba(255,255,255,.04)`
          : "0 2px 16px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03)",
        position: "relative" as const, overflow: "hidden",
        animation: `fadeUp 0.5s ease ${animDelay || 0}ms both`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${tagColor},${tagColor}60,transparent 70%)`, opacity: hov ? 1 : isFeatured ? 0.75 : 0.4, transition: "opacity .25s" }} />
      <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 340, height: 240, background: `radial-gradient(ellipse,${tagColor}08,transparent 65%)`, opacity: hov ? 1 : 0, transition: "opacity .3s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-40%", left: "20%", width: 200, height: 180, background: `radial-gradient(ellipse,${tagColor}04,transparent 70%)`, opacity: hov ? 1 : 0, transition: "opacity .3s", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: ".4rem", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".35rem", flexWrap: "wrap" as const }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", letterSpacing: ".1em", textTransform: "uppercase" as const, fontWeight: 700, color: tagColor, background: `${tagColor}12`, border: `1px solid ${tagColor}28`, padding: "3px 10px", borderRadius: 100 }}>
            {tagLabel(c.tag, lang)}
          </span>
          {isFeatured && (
            <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#f59e0b", fontWeight: 700, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.22)", padding: "3px 8px", borderRadius: 100 }}>
              ★ {lang === "fr" ? "À la une" : "Featured"}
            </span>
          )}
          {_new && (
            <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#10b981", fontWeight: 700, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.22)", padding: "3px 8px", borderRadius: 100 }}>
              ✦ {t.new}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)" }}>↑ {readers.toLocaleString()} {t.readers}</span>
          <span style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)" }}>{c.date[lang]}</span>
        </div>
      </div>

      <div style={{ fontFamily: "var(--d)", fontSize: isFeatured ? "1.1rem" : "1rem", fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1.22, color: "var(--text)", position: "relative" }}>
        {cl.title}
      </div>

      <div style={{ fontFamily: "var(--m)", fontSize: ".72rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.65, display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: 2, overflow: "hidden", position: "relative" }}>
        {cl.desc}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".35rem", flexWrap: "wrap" as const, position: "relative" }}>
        {c.tools.map((tool, i) => (
          <span key={tool.name} style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: ".3rem",
              background: hov ? `${tool.color}10` : "var(--bg3)",
              border: `1px solid ${hov ? tool.color + "28" : "var(--border)"}`,
              borderRadius: 8, padding: "4px 10px",
              fontFamily: "var(--m)", fontSize: ".68rem",
              color: hov ? tool.color : "var(--muted)",
              transition: "all .2s",
              fontWeight: tool.name === c.winner ? 600 : 300,
            }}>
              <span style={{ fontSize: ".9rem" }}>{tool.logo}</span>
              {tool.name}
              {tool.name === c.winner && <span style={{ fontSize: ".65rem", color: tagColor }}>🏆</span>}
            </span>
            {i < c.tools.length - 1 && (
              <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", color: "var(--dim)", fontWeight: 600, letterSpacing: ".04em" }}>{t.vs}</span>
            )}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: ".5rem", position: "relative" }}>
        {sorted.map((tool, i) => (
          <div key={tool.name} style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <span style={{ fontFamily: "var(--m)", fontSize: ".63rem", color: tool.name === c.winner ? tool.color : "var(--muted)", fontWeight: tool.name === c.winner ? 700 : 300, minWidth: 68, lineHeight: 1 }}>
              {tool.name}
            </span>
            <MiniScoreBar score={tool.globalScore} color={tool.color} delay={i * 100} />
            <span style={{ fontFamily: "var(--m)", fontSize: ".7rem", fontWeight: 800, color: tool.color, minWidth: 30, textAlign: "right" as const }}>
              {tool.globalScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer winner + CTA
          FIX: on utilise border shorthand complet en expression ternaire
          au lieu de mixer border + borderColor séparément */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: "1.1rem",
        borderTop: `1px solid ${hov ? tagColor + "20" : "rgba(255,255,255,.05)"}`,
        marginTop: "auto", transition: "border-top-color .25s", position: "relative",
        flexWrap: "wrap" as const, gap: ".5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <div style={{
            width: 34, height: 34,
            background: hov ? `${tagColor}18` : `${tagColor}10`,
            border: hov ? `1px solid ${tagColor}40` : `1px solid ${tagColor}25`,
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.05rem", transition: "background .2s, border-color .2s",
          }}>
            {winnerTool?.logo}
          </div>
          <div>
            <div style={{ fontFamily: "var(--m)", fontSize: ".54rem", color: "var(--dim)", letterSpacing: ".1em", textTransform: "uppercase" as const, marginBottom: ".1rem" }}>
              🏆 {t.winner}
            </div>
            <div style={{ fontFamily: "var(--d)", fontSize: ".85rem", fontWeight: 800, color: tagColor, letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: ".3rem" }}>
              {c.winner}
              <span style={{ fontFamily: "var(--m)", fontSize: ".65rem", fontWeight: 700 }}>{winnerTool?.globalScore.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: ".35rem",
          fontFamily: "var(--m)", fontSize: ".7rem", fontWeight: 700,
          color: hov ? "#080c10" : tagColor,
          background: hov ? tagColor : `${tagColor}10`,
          border: `1px solid ${tagColor}`,
          borderRadius: 8, padding: "7px 14px",
          transition: "all .2s",
          boxShadow: hov ? `0 4px 16px ${tagColor}30` : "none",
        }}>
          {t.see} <span style={{ fontSize: ".75rem" }}>→</span>
        </div>
      </div>
    </a>
  );
}

function NewsletterCTA({ t, l }: { t: typeof T["fr"]; l: (p: string) => string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSent(true); setEmail("");
    setTimeout(() => setSent(false), 3500);
  };
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(0,230,190,.07),rgba(59,130,246,.04))", border: "1px solid rgba(0,230,190,.18)", borderRadius: 18, padding: "clamp(2rem,4vw,2.75rem)", marginBottom: "5rem" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,230,190,.5) 40%,rgba(0,230,190,.5) 60%,transparent)" }} />
      <div style={{ position: "absolute", top: "-50%", right: "-8%", width: 420, height: 340, background: "radial-gradient(ellipse,rgba(0,230,190,.07),transparent 68%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" as const, gap: "1.35rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" as const }}>
          <div style={{ width: 46, height: 46, background: "rgba(0,230,190,.1)", border: "1px solid rgba(0,230,190,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>✉</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--d)", fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-.025em", color: "var(--text)", marginBottom: ".3rem" }}>{t.ctaTitle}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: ".75rem", color: "var(--muted)", lineHeight: 1.7, fontWeight: 300 }}>{t.ctaDesc}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" as const, maxWidth: 500 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.ctaPlaceholder} required
            style={{ flex: 1, minWidth: 200, background: "rgba(8,12,16,.8)", border: "1px solid rgba(0,230,190,.22)", borderRadius: 9, padding: "10px 14px", color: "var(--text)", fontFamily: "var(--m)", fontSize: ".78rem", outline: "none", transition: "border-color .18s" }} />
          <button type="submit" style={{ background: sent ? "#10b981" : "var(--cyan)", color: "#080c10", border: "none", borderRadius: 9, padding: "10px 22px", fontFamily: "var(--d)", fontSize: ".82rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" as const, transition: "all .2s", letterSpacing: "-.01em" }}>
            {sent ? t.ctaSent : t.ctaCta}
          </button>
        </form>
        <span style={{ fontFamily: "var(--m)", fontSize: ".62rem", color: "var(--dim)" }}>{t.ctaNo}</span>
      </div>
    </div>
  );
}

export default function ComparatifsClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavCta, setShowNavCta] = useState(false);
  const [toolbarSticky, setToolbarSticky] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarTop = useRef(0);

  const t = T[lang];
  const canonicalTags = getAllCanonicalTags();
  const l = useCallback((path: string) => `/${lang}${path}`, [lang]);

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 60);
      setShowNavCta(window.scrollY > 320);
      if (toolbarRef.current) {
        if (!toolbarTop.current) toolbarTop.current = toolbarRef.current.getBoundingClientRect().top + window.scrollY;
        setToolbarSticky(window.scrollY > toolbarTop.current - 62);
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const filtered = COMPARATIFS.filter(c => {
    const matchTag = activeTag === "all" || canonical(c.tag) === activeTag;
    const s = search.toLowerCase();
    const matchSearch = !s || c[lang].title.toLowerCase().includes(s) || c.tools.some(tool => tool.name.toLowerCase().includes(s));
    return matchTag && matchSearch;
  });

  const featured = filtered.filter(c => c.featured);
  const rest = filtered.filter(c => !c.featured);
  const totalTools = COMPARATIFS.reduce((acc, c) => acc + c.tools.length, 0);

  const itemListSchema = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: lang === "fr" ? "Comparatifs IA 2026 — Neuriflux" : "AI Comparisons 2026 — Neuriflux",
    description: t.subtitle,
    url: `https://neuriflux.com/${lang}/comparatifs`,
    numberOfItems: COMPARATIFS.length,
    itemListElement: COMPARATIFS.map((c, i) => ({
      "@type": "ListItem", position: i + 1,
      name: c[lang].title,
      url: `https://neuriflux.com/${lang}/comparatifs/${c.slug}`,
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
          ? `Quel est le meilleur outil parmi ${c.tools.map(t => t.name).join(", ")} ?`
          : `Which is the best among ${c.tools.map(t => t.name).join(", ")}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: lang === "fr"
            ? `D'après nos tests, ${c.winner} est le meilleur avec ${w?.globalScore.toFixed(1)}/10. ${c[lang].verdict}`
            : `Based on our testing, ${c.winner} is the best with ${w?.globalScore.toFixed(1)}/10. ${c[lang].verdict}`,
        },
      };
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <link rel="alternate" hrefLang="fr" href="https://neuriflux.com/fr/comparatifs" />
      <link rel="alternate" hrefLang="en" href="https://neuriflux.com/en/comparatifs" />

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
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.015) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-15%;left:50%;transform:translateX(-50%);width:1100px;height:750px;background:radial-gradient(ellipse,rgba(0,230,190,.045) 0%,transparent 65%);pointer-events:none;z-index:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
        nav{position:sticky;top:0;z-index:200;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(8,12,16,.95);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .25s}
        nav.scrolled{box-shadow:0 4px 32px rgba(0,0,0,.55)}
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
        .nav-cta{display:flex;align-items:center;gap:.4rem;font-family:var(--d);font-weight:700;font-size:.73rem;padding:6px 14px;border-radius:7px;text-decoration:none;animation:slideDown .3s ease;white-space:nowrap;transition:all .18s;color:#080c10}
        .nav-cta:hover{transform:translateY(-1px);filter:brightness(1.12)}
        @media(max-width:560px){.nav-cta span{display:none}}
        .wrap{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:0 var(--pad)}
        .hero{padding:clamp(4rem,8vw,7rem) 0 0}
        .hero-eyebrow{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.68rem;letter-spacing:.08em;color:var(--cyan);background:var(--cdim);border:1px solid rgba(0,230,190,.2);border-radius:100px;padding:5px 14px;margin-bottom:1.6rem;animation:fadeUp .5s ease both}
        .hero-eyebrow-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite;flex-shrink:0}
        .hero h1{font-size:clamp(2.6rem,6.5vw,4.5rem);font-weight:800;letter-spacing:-.045em;line-height:.97;margin-bottom:1.25rem;animation:fadeUp .5s .08s ease both}
        .hero h1 .ac{color:var(--cyan)}
        .hero-sub{font-family:var(--m);font-size:.87rem;color:var(--muted);font-weight:300;line-height:1.72;max-width:500px;animation:fadeUp .5s .16s ease both}
        .hero-layout{display:grid;grid-template-columns:1fr 260px;gap:3rem;align-items:start;margin-bottom:2.5rem}
        @media(max-width:780px){.hero-layout{grid-template-columns:1fr}.hero-aside{display:none!important}}
        .hero-aside{display:flex;flex-direction:column;gap:.6rem;padding-top:.5rem}
        .hstat{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1rem 1.25rem;transition:all .2s;cursor:default}
        .hstat:hover{border-color:rgba(0,230,190,.18);transform:translateX(-2px)}
        .hstat-val{font-family:var(--d);font-size:1.6rem;font-weight:800;letter-spacing:-.05em;color:var(--cyan);line-height:1;margin-bottom:.2rem}
        .hstat-lbl{font-family:var(--m);font-size:.58rem;color:var(--muted);font-weight:300;letter-spacing:.06em;text-transform:uppercase;line-height:1.4}
        .trust-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden;animation:fadeUp .5s .24s ease both}
        @media(max-width:640px){.trust-strip{grid-template-columns:1fr}}
        .trust-cell{background:var(--bg2);padding:1.1rem 1.4rem;display:flex;gap:.8rem;align-items:flex-start;transition:background .2s}
        .trust-cell:hover{background:var(--bg3)}
        .trust-icon{font-size:1.15rem;flex-shrink:0;margin-top:.05rem}
        .trust-t{font-family:var(--d);font-size:.78rem;font-weight:700;color:var(--text);margin-bottom:.12rem;letter-spacing:-.01em}
        .trust-d{font-family:var(--m);font-size:.64rem;color:var(--muted);font-weight:300;line-height:1.5}
        .stats-row{display:flex;gap:2.5rem;flex-wrap:wrap;padding:2rem 0 0;border-top:1px solid var(--border);margin-top:2rem;animation:fadeUp .5s .3s ease both}
        .stat-item{display:flex;flex-direction:column;gap:.2rem}
        .stat-num{font-family:var(--d);font-size:1.55rem;font-weight:800;letter-spacing:-.045em;color:var(--cyan)}
        .stat-label{font-family:var(--m);font-size:.6rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
        .toolbar-spacer{height:2.5rem}
        .toolbar{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:.85rem 0;transition:all .2s}
        .toolbar.sticky{position:sticky;top:60px;z-index:90;background:rgba(8,12,16,.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:.75rem var(--pad);margin:0 calc(-1 * var(--pad));box-shadow:0 6px 28px rgba(0,0,0,.45)}
        .search-wrap{position:relative;flex:1;min-width:220px;max-width:380px}
        .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none;font-size:.8rem}
        .search-input{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:9px 13px 9px 36px;color:var(--text);font-family:var(--m);font-size:.77rem;outline:none;transition:border-color .18s}
        .search-input:focus{border-color:rgba(0,230,190,.28)}
        .search-input::placeholder{color:var(--dim)}
        .result-count{font-family:var(--m);font-size:.67rem;color:var(--dim)}
        .filters{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center}
        .ftag{font-family:var(--m);font-size:.67rem;padding:5px 13px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;white-space:nowrap;display:flex;align-items:center;gap:.3rem}
        .ftag:hover{border-color:rgba(0,230,190,.28);color:var(--cyan);background:var(--cdim)}
        .ftag.on{background:var(--cyan);border-color:var(--cyan);color:#080c10;font-weight:700}
        .ftag-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
        .sec-label{font-family:var(--m);font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.4rem;display:flex;align-items:center;gap:.5rem}
        .sec-label::before{content:'';width:16px;height:1px;background:var(--cyan);display:inline-block}
        .grid-featured{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:1.5rem;margin-bottom:1rem}
        .grid-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.25rem;margin-bottom:3.5rem}
        @media(max-width:520px){.grid-featured,.grid-all{grid-template-columns:1fr}}
        .cta-mini{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.6rem;margin:1.5rem 0 3rem}
        .cta-mini-text{font-family:var(--m);font-size:.74rem;color:var(--muted)}
        .cta-mini-text strong{color:var(--cyan);font-weight:700}
        .cta-mini-btn{font-family:var(--m);font-size:.72rem;font-weight:700;color:#080c10;background:var(--cyan);border:none;border-radius:8px;padding:8px 18px;cursor:pointer;white-space:nowrap;text-decoration:none;transition:opacity .18s;display:inline-block}
        .cta-mini-btn:hover{opacity:.85}
        /* FIX 2 — hover blog-crosslink géré en CSS pur, zéro JS inline */
        .blog-crosslink{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;border:1px solid var(--border);border-radius:12px;padding:1.2rem 1.6rem;margin-bottom:3rem;background:var(--bg2);text-decoration:none;transition:border-color .2s,transform .2s}
        .blog-crosslink:hover{border-color:rgba(0,230,190,.2);transform:translateY(-1px)}
        .blog-crosslink-text{font-family:var(--m);font-size:.74rem;color:var(--muted)}
        .blog-crosslink-text strong{color:var(--text);font-weight:600}
        .blog-crosslink-btn{font-family:var(--m);font-size:.72rem;font-weight:600;color:var(--cyan);display:flex;align-items:center;gap:.35rem;white-space:nowrap}
        .no-results{text-align:center;padding:5rem 2rem;font-family:var(--m);color:var(--muted);font-size:.85rem;background:var(--bg2);border:1px solid var(--border);border-radius:18px;margin-bottom:4rem}
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.5rem var(--pad);max-width:1200px;margin:0 auto}
        .ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
        @media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
        .ft-tagline{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.65;max-width:210px;margin-top:.5rem}
        .ft-col-title{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
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
          {showNavCta && (
            <a href={l("/newsletter")} className="nav-cta" style={{ background: "var(--cyan)" }}>
              <span>{lang === "fr" ? "Newsletter gratuite" : "Free newsletter"}</span> →
            </a>
          )}
          <div className="lt">
            <button className={`lb${lang === "fr" ? " on" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " on" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>

      <div className="wrap">
        <div className="hero">
          <div className="hero-layout">
            <div>
              <div className="hero-eyebrow"><div className="hero-eyebrow-dot" />{t.badge}</div>
              <h1>{t.title} <span className="ac">{t.accent}</span></h1>
              <p className="hero-sub">{t.subtitle}</p>
            </div>
            <div className="hero-aside">
              {[
                { val: COMPARATIFS.length, suffix: "+", label: t.statsComps },
                { val: totalTools, suffix: "", label: t.statsTools },
                { val: 4200, suffix: "+", label: t.statsReaders },
              ].map((s, i) => (
                <div key={i} className="hstat">
                  <div className="hstat-val"><StatNumber target={s.val} suffix={s.suffix} /></div>
                  <div className="hstat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="trust-strip">
            {t.trust.map((item, i) => (
              <div key={i} className="trust-cell">
                <div className="trust-icon">{item.icon}</div>
                <div><div className="trust-t">{item.t}</div><div className="trust-d">{item.d}</div></div>
              </div>
            ))}
          </div>
          <div className="stats-row">
            {[
              { target: COMPARATIFS.length, suffix: "+", label: t.statsComps },
              { target: totalTools, suffix: "", label: t.statsTools },
              { target: 4200, suffix: "+", label: t.statsReaders },
              { target: 2026, suffix: "", label: t.statsYear },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-num"><StatNumber target={s.target} suffix={s.suffix} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="toolbar-spacer" />
        <div ref={toolbarRef} className={`toolbar${toolbarSticky ? " sticky" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flex: 1, flexWrap: "wrap" as const }}>
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
            <button className={`ftag${activeTag === "all" ? " on" : ""}`} onClick={() => setActiveTag("all")}>{t.all}</button>
            {canonicalTags.map(canonTag => {
              const color = gc(canonTag);
              const label = tagLabel(canonTag, lang);
              const isActive = activeTag === canonTag;
              return (
                <button key={canonTag} className={`ftag${isActive ? " on" : ""}`} onClick={() => setActiveTag(canonTag)}>
                  <span className="ftag-dot" style={{ background: isActive ? "#080c10" : color }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ height: "2rem" }} />

        {filtered.length === 0 ? (
          <div className="no-results">
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
            {t.noResults}
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section style={{ marginBottom: "3.5rem" }}>
                <div className="sec-label">{t.featured}</div>
                <div className="grid-featured">
                  {featured.map((c, i) => <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} isFeatured animDelay={i * 80} />)}
                </div>
              </section>
            )}
            {featured.length > 0 && rest.length > 0 && !search && activeTag === "all" && (
              <div className="cta-mini">
                <span className="cta-mini-text">
                  <strong>4{lang === "fr" ? "\u202f" : ","}200+</strong> {t.ctaMiniText}
                </span>
                <a href={l("/newsletter")} className="cta-mini-btn">{t.ctaMiniBtn}</a>
              </div>
            )}
            {rest.length > 0 && (
              <section>
                {featured.length > 0 && <div className="sec-label">{t.allLabel}</div>}
                <div className="grid-all">
                  {rest.map((c, i) => <ComparatifCard key={`${c.slug}-${i}`} c={c} lang={lang} t={t} l={l} animDelay={i * 60} />)}
                </div>
              </section>
            )}
            {/* FIX 2 — aucun onMouseEnter/Leave, le hover est intégralement géré par .blog-crosslink:hover en CSS */}
            {!search && (
              <a href={l("/blog")} className="blog-crosslink">
                <span className="blog-crosslink-text">
                  {t.blogCtaLabel}{" "}
                  <strong>{lang === "fr" ? "Retrouvez nos reviews individuelles sur le blog." : "Find our individual tool reviews on the blog."}</strong>
                </span>
                <span className="blog-crosslink-btn">{t.blogCta} →</span>
              </a>
            )}
            {!search && <NewsletterCTA t={t} l={l} />}
          </>
        )}
      </div>

      <footer>
        <div className="ft">
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}><div className="logo-dot" />Neuri<em>flux</em></a>
            <p className="ft-tagline">{t.ftTagline}</p>
          </div>
          <div>
            <div className="ft-col-title">{t.ftContent}</div>
            <ul className="ft-ul">{t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}</ul>
          </div>
          <div>
            <div className="ft-col-title">{t.ftLegal}</div>
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