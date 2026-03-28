"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type Lang = "fr" | "en";

// ─── Traductions ───────────────────────────────────────────────────────────────
const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "À propos de Neuriflux",
    title: "On teste.",
    titleAccent: "Vous choisissez.",
    subtitle: "Neuriflux est un média indépendant dédié aux outils IA. Pas de bullshit, pas de liens sponsorisés cachés — juste des tests honnêtes et des comparatifs clairs.",
    manifesto: {
      label: "Notre manifeste",
      blocks: [
        { icon: "⚡", title: "Indépendance totale", text: "Neuriflux n'appartient à aucun éditeur de logiciel. Nos comparatifs et avis sont rédigés sans pression commerciale. Quand un outil est nul, on le dit." },
        { icon: "🔬", title: "Tests réels, pas des démos", text: "Chaque outil est utilisé en conditions réelles, sur des projets concrets, pendant plusieurs semaines. Nos scores reflètent une utilisation quotidienne — pas un screenshot de marketing." },
        { icon: "💰", title: "Transparence sur l'affiliation", text: "Certains liens sont affiliés. Ça nous permet de garder le site gratuit. Mais ça ne change jamais notre avis — un mauvais outil reste un mauvais outil, affilié ou non." },
        { icon: "🇫🇷", title: "Fait en France", text: "Neuriflux est un projet français, bilingue FR/EN, pensé pour les créateurs, indépendants et équipes qui veulent naviguer dans l'écosystème IA sans se perdre." },
      ],
    },
    stats: [
      { value: "120+", label: "Outils testés" },
      { value: "9", label: "Articles publiés" },
      { value: "3200+", label: "Lecteurs newsletter" },
      { value: "2026", label: "Lancé en" },
    ],
    howWeWork: {
      label: "Comment on travaille",
      steps: [
        { num: "01", title: "On sélectionne", text: "On choisit les outils qui font vraiment parler d'eux — nouveautés, mises à jour majeures, tendances du marché." },
        { num: "02", title: "On teste en conditions réelles", text: "Plusieurs semaines d'utilisation intensive sur des projets concrets. Pas de démo, pas de press kit." },
        { num: "03", title: "On score objectivement", text: "Grille d'évaluation fixe sur des critères précis : qualité, prix, ergonomie, support, évolutivité." },
        { num: "04", title: "On publie sans filtre", text: "Verdict honnête, points forts ET faiblesses. Si l'outil est surévalué, on le dit clairement." },
      ],
    },
    mission: {
      label: "Notre mission",
      title: "Rendre l'IA accessible à tous",
      text: "Le marché des outils IA évolue trop vite. De nouveaux outils sortent chaque semaine, les prix changent, les fonctionnalités évoluent. Notre mission : être votre radar — tester en permanence, vous signaler ce qui compte vraiment, et vous faire gagner du temps et de l'argent.",
    },
    contact: {
      label: "Contact",
      title: "On est joignables",
      text: "Une question, une suggestion d'outil à tester, un partenariat ? On répond à tous les messages.",
      email: "contact@neuriflux.com",
      emailLabel: "Écrire un email",
    },
    newsletter: {
      label: "Le radar IA",
      title: "Chaque lundi dans votre boîte",
      text: "Les meilleurs outils IA, les comparatifs qui comptent, les deals à ne pas rater. Gratuit, sans spam.",
      cta: "S'abonner gratuitement →",
    },
    footer: {
      rights: "Tous droits réservés.", madeWith: "Fait avec", inFrance: "en France",
      links: [{ label: "Mentions légales", href: "/legal" }, { label: "Confidentialité", href: "/privacy" }, { label: "Cookies", href: "/cookies" }],
    },
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    badge: "About Neuriflux",
    title: "We test.",
    titleAccent: "You choose.",
    subtitle: "Neuriflux is an independent media dedicated to AI tools. No bullshit, no hidden sponsored links — just honest tests and clear comparisons.",
    manifesto: {
      label: "Our manifesto",
      blocks: [
        { icon: "⚡", title: "Total independence", text: "Neuriflux is not owned by any software publisher. Our comparisons and reviews are written without commercial pressure. When a tool is bad, we say so." },
        { icon: "🔬", title: "Real tests, not demos", text: "Every tool is used in real conditions, on concrete projects, for several weeks. Our scores reflect daily use — not a marketing screenshot." },
        { icon: "💰", title: "Transparent about affiliation", text: "Some links are affiliate links. That's what keeps the site free. But it never changes our opinion — a bad tool stays a bad tool, affiliated or not." },
        { icon: "🇫🇷", title: "Made in France", text: "Neuriflux is a French project, bilingual FR/EN, designed for creators, freelancers and teams who want to navigate the AI ecosystem without getting lost." },
      ],
    },
    stats: [
      { value: "120+", label: "Tools tested" },
      { value: "9", label: "Articles published" },
      { value: "3,200+", label: "Newsletter readers" },
      { value: "2026", label: "Launched in" },
    ],
    howWeWork: {
      label: "How we work",
      steps: [
        { num: "01", title: "We select", text: "We choose tools that are genuinely making waves — new releases, major updates, market trends." },
        { num: "02", title: "We test in real conditions", text: "Several weeks of intensive use on concrete projects. No demo, no press kit." },
        { num: "03", title: "We score objectively", text: "Fixed evaluation grid on precise criteria: quality, price, UX, support, scalability." },
        { num: "04", title: "We publish unfiltered", text: "Honest verdict, strengths AND weaknesses. If a tool is overrated, we say it clearly." },
      ],
    },
    mission: {
      label: "Our mission",
      title: "Making AI accessible to everyone",
      text: "The AI tools market moves too fast. New tools launch every week, prices change, features evolve. Our mission: be your radar — continuously testing, signaling what really matters, saving you time and money.",
    },
    contact: {
      label: "Contact",
      title: "We're reachable",
      text: "A question, a tool suggestion, a partnership? We reply to every message.",
      email: "contact@neuriflux.com",
      emailLabel: "Send an email",
    },
    newsletter: {
      label: "The AI radar",
      title: "Every Monday in your inbox",
      text: "The best AI tools, the comparisons that matter, the deals you don't want to miss. Free, no spam.",
      cta: "Subscribe for free →",
    },
    footer: {
      rights: "All rights reserved.", madeWith: "Made with", inFrance: "in France",
      links: [{ label: "Legal notice", href: "/legal" }, { label: "Privacy", href: "/privacy" }, { label: "Cookies", href: "/cookies" }],
    },
  },
};

// ─── Compteur animé au scroll ─────────────────────────────────────────────────
function Counter({ value }: { value: string }) {
  const [d, setD] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const num = parseInt(value.replace(/\D/g, ""));
    const sfx = value.replace(/[0-9]/g, "");
    if (isNaN(num)) { setD(value); return; }
    const run = () => {
      if (done.current) return;
      done.current = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / 1300, 1);
        setD(Math.floor((1 - Math.pow(1 - p, 3)) * num) + sfx);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { threshold: 0.2 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [value]);
  return <div ref={ref} className="stat-val">{d}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = T[lang];
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

  return (
    <>
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
          /* Fonts */
          --d:'Syne',sans-serif;
          --m:'JetBrains Mono',monospace;
          /* Utilitaires */
          --r:10px;
          --pad:clamp(1.5rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}

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
           NAVIGATION — identique sur toutes les pages
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
        nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.4)}
        .logo{
          font-family:var(--d);font-weight:800;font-size:1.15rem;
          letter-spacing:-.03em;color:var(--text);text-decoration:none;
          display:flex;align-items:center;gap:.45rem
        }
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{
          width:6px;height:6px;background:var(--cyan);border-radius:50%;
          box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite
        }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
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
        .nav-links a{font-family:var(--m);font-size:.74rem;color:var(--muted);text-decoration:none;letter-spacing:.03em;transition:color .15s}
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}
        .lb{font-family:var(--m);font-size:.67rem;font-weight:500;padding:4px 9px;border-radius:4px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s}
        .lb.on{background:var(--cyan);color:#080c10}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}
        @media(max-width:720px){.hb{display:flex}}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}

        /* ─────────────────────────────────────────────────────────
           LAYOUT PRINCIPAL
        ───────────────────────────────────────────────────────── */
        .wrap{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:0 var(--pad)}

        /* ─────────────────────────────────────────────────────────
           HERO
        ───────────────────────────────────────────────────────── */
        .hero{padding:clamp(5rem,10vw,8rem) 0 clamp(3rem,6vw,4rem);text-align:center}
        .badge{
          display:inline-flex;align-items:center;gap:.5rem;
          font-family:var(--m);font-size:.7rem;letter-spacing:.08em;
          color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);
          border-radius:100px;padding:6px 14px;margin-bottom:2rem
        }
        .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero-title{
          font-size:clamp(3rem,8vw,5.5rem);font-weight:800;
          line-height:1.0;letter-spacing:-.04em;margin-bottom:1.5rem
        }
        .hero-title .ac{color:var(--cyan)}
        .hero-sub{
          font-family:var(--m);font-size:clamp(.82rem,1.6vw,.96rem);
          font-weight:300;color:var(--muted);line-height:1.75;
          max-width:580px;margin:0 auto
        }

        /* ─────────────────────────────────────────────────────────
           STATS — 4 colonnes avec compteurs animés
        ───────────────────────────────────────────────────────── */
        .stats{
          display:grid;grid-template-columns:repeat(4,1fr);
          gap:1px;background:var(--border);
          border:1px solid var(--border);border-radius:14px;overflow:hidden;
          margin-bottom:clamp(3rem,6vw,5rem)
        }
        @media(max-width:580px){.stats{grid-template-columns:repeat(2,1fr)}}
        .stat-box{background:var(--bg2);padding:2rem 1.5rem;text-align:center;transition:background .2s}
        .stat-box:hover{background:var(--bg3)}
        .stat-val{font-size:clamp(1.8rem,4vw,2.4rem);font-weight:800;letter-spacing:-.04em;color:var(--cyan);font-family:var(--d)}
        .stat-lbl{font-family:var(--m);font-size:.65rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:.3rem}

        /* ─────────────────────────────────────────────────────────
           SECTION — layout commun
        ───────────────────────────────────────────────────────── */
        .section{padding:clamp(2.5rem,5vw,3.5rem) 0}
        .sec-label{
          font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
          color:var(--cyan);margin-bottom:1.5rem;
          display:flex;align-items:center;gap:.4rem
        }
        .sec-label::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}

        /* ─────────────────────────────────────────────────────────
           MANIFESTE — 4 cards en grille
        ───────────────────────────────────────────────────────── */
        .manifesto-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.25rem}
        .mcard{
          background:var(--bg2);border:1px solid var(--border);border-radius:14px;
          padding:1.75rem;transition:all .2s;position:relative;overflow:hidden
        }
        /* Barre cyan apparaît au hover */
        .mcard::before{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:var(--cyan);transform:scaleX(0);transform-origin:left;transition:transform .3s
        }
        .mcard:hover{border-color:var(--glow);transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,.4)}
        .mcard:hover::before{transform:scaleX(1)}
        .mcard-icon{font-size:1.75rem;margin-bottom:1.1rem;display:block}
        .mcard-title{font-family:var(--d);font-size:.95rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.6rem;color:var(--text)}
        .mcard-text{font-family:var(--m);font-size:.75rem;color:var(--muted);line-height:1.75;font-weight:300}

        /* ─────────────────────────────────────────────────────────
           TIMELINE — comment on travaille
        ───────────────────────────────────────────────────────── */
        .timeline{display:flex;flex-direction:column;gap:0}
        .tl-step{display:grid;grid-template-columns:56px 1fr;gap:1.5rem;position:relative}
        /* Ligne verticale reliant les étapes */
        .tl-step:not(:last-child)::after{
          content:'';position:absolute;left:27px;top:48px;bottom:-1px;
          width:2px;background:var(--border)
        }
        .tl-num{
          width:40px;height:40px;border-radius:10px;
          background:var(--bg2);border:1px solid var(--border);
          display:flex;align-items:center;justify-content:center;
          font-family:var(--m);font-size:.68rem;font-weight:600;color:var(--cyan);
          flex-shrink:0;position:relative;z-index:1;transition:all .2s
        }
        .tl-step:hover .tl-num{background:var(--cdim);border-color:var(--glow)}
        .tl-content{padding:0 0 2.5rem}
        .tl-title{font-family:var(--d);font-size:.98rem;font-weight:700;letter-spacing:-.02em;color:var(--text);margin-bottom:.4rem}
        .tl-text{font-family:var(--m);font-size:.75rem;color:var(--muted);line-height:1.7;font-weight:300}

        /* ─────────────────────────────────────────────────────────
           MISSION — bloc centré avec glow
        ───────────────────────────────────────────────────────── */
        .mission-box{
          background:var(--bg2);border:1px solid var(--border);border-radius:16px;
          padding:clamp(2rem,4vw,3rem);position:relative;overflow:hidden
        }
        .mission-box::before{
          content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
          width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)
        }
        .mission-glow{
          position:absolute;top:-40%;left:50%;transform:translateX(-50%);
          width:500px;height:280px;
          background:radial-gradient(ellipse,rgba(0,230,190,.05),transparent 70%);
          pointer-events:none
        }
        .mission-title{
          font-size:clamp(1.4rem,3vw,1.9rem);font-weight:800;letter-spacing:-.03em;
          margin-bottom:1rem;position:relative;z-index:1
        }
        .mission-text{
          font-family:var(--m);font-size:.82rem;line-height:1.85;color:var(--muted);
          max-width:640px;position:relative;z-index:1;font-weight:300
        }

        /* ─────────────────────────────────────────────────────────
           GRILLE BAS — contact + newsletter
        ───────────────────────────────────────────────────────── */
        .bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-top:1.5rem}
        @media(max-width:600px){.bottom-grid{grid-template-columns:1fr}}
        .bcard{
          background:var(--bg2);border:1px solid var(--border);border-radius:14px;
          padding:1.75rem;transition:border-color .2s;display:flex;flex-direction:column;gap:.5rem
        }
        .bcard:hover{border-color:var(--glow)}
        .bcard-label{font-family:var(--m);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
        .bcard-title{font-family:var(--d);font-size:1.05rem;font-weight:700;letter-spacing:-.02em;color:var(--text)}
        .bcard-text{font-family:var(--m);font-size:.75rem;color:var(--muted);line-height:1.65;font-weight:300;flex:1}
        .btn-p{
          display:inline-flex;align-items:center;gap:.4rem;
          background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;
          font-size:.82rem;padding:10px 20px;border-radius:8px;
          text-decoration:none;transition:all .2s;letter-spacing:-.01em;margin-top:.5rem
        }
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,230,190,.28)}
        .btn-s{
          display:inline-flex;align-items:center;gap:.4rem;
          background:transparent;color:var(--cyan);font-family:var(--d);font-weight:700;
          font-size:.82rem;padding:10px 20px;border-radius:8px;
          text-decoration:none;transition:all .2s;letter-spacing:-.01em;
          border:1px solid var(--glow);margin-top:.5rem
        }
        .btn-s:hover{background:var(--cdim);transform:translateY(-1px)}

        /* ─────────────────────────────────────────────────────────
           FOOTER
        ───────────────────────────────────────────────────────── */
        footer{
          position:relative;z-index:1;
          border-top:1px solid var(--border);
          padding:1.75rem var(--pad);
          max-width:1000px;margin:0 auto;
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem
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
      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo">
          <div className="logo-dot" />
          Neuri<em>flux</em>
        </a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")}>{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/contact")}>{t.nav.contact}</a></li>
          <li><a href={l("/about")} className="active">{t.nav.about}</a></li>
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
          <h1 className="hero-title">
            {t.title}<br /><span className="ac">{t.titleAccent}</span>
          </h1>
          <p className="hero-sub">{t.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="stats">
          {t.stats.map((s, i) => (
            <div key={i} className="stat-box">
              <Counter value={s.value} />
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Manifeste */}
        <div className="section">
          <div className="sec-label">{t.manifesto.label}</div>
          <div className="manifesto-grid">
            {t.manifesto.blocks.map((b, i) => (
              <div key={i} className="mcard">
                <span className="mcard-icon">{b.icon}</span>
                <div className="mcard-title">{b.title}</div>
                <p className="mcard-text">{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comment on travaille */}
        <div className="section">
          <div className="sec-label">{t.howWeWork.label}</div>
          <div className="timeline">
            {t.howWeWork.steps.map((s, i) => (
              <div key={i} className="tl-step">
                <div className="tl-num">{s.num}</div>
                <div className="tl-content">
                  <div className="tl-title">{s.title}</div>
                  <p className="tl-text">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="section">
          <div className="mission-box">
            <div className="mission-glow" />
            <div className="sec-label" style={{ marginBottom: "1.25rem" }}>{t.mission.label}</div>
            <h2 className="mission-title">{t.mission.title}</h2>
            <p className="mission-text">{t.mission.text}</p>
          </div>

          {/* Contact + Newsletter */}
          <div className="bottom-grid">
            <div className="bcard">
              <div className="bcard-label">{t.contact.label}</div>
              <div className="bcard-title">{t.contact.title}</div>
              <p className="bcard-text">{t.contact.text}</p>
              <a href={`mailto:${t.contact.email}`} className="btn-p">✉ {t.contact.emailLabel}</a>
            </div>
            <div className="bcard">
              <div className="bcard-label">{t.newsletter.label}</div>
              <div className="bcard-title">{t.newsletter.title}</div>
              <p className="bcard-text">{t.newsletter.text}</p>
              <a href={l("/newsletter")} className="btn-s">{t.newsletter.cta}</a>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer>
        <span className="ft-copy">© 2026 <em>Neuriflux</em>. {t.footer.rights} {t.footer.madeWith} <em>♥</em> {t.footer.inFrance}</span>
        <ul className="ft-links">
          {t.footer.links.map((x, i) => (
            <li key={i}><a href={l(x.href)}>{x.label}</a></li>
          ))}
        </ul>
      </footer>
    </>
  );
}