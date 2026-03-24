"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", about: "A propos" },
    badge: "À propos de Neuriflux",
    title: "On teste.",
    titleAccent: "Vous choisissez.",
    subtitle: "Neuriflux est un média indépendant dédié aux outils IA. Pas de bullshit, pas de liens sponsorisés cachés — juste des tests honnêtes et des comparatifs clairs.",
    manifesto: {
      label: "Notre manifeste",
      blocks: [
        {
          icon: "⚡",
          title: "Indépendance totale",
          text: "Neuriflux n'appartient à aucun éditeur de logiciel. Nos comparatifs et avis sont rédigés sans pression commerciale. Quand un outil est nul, on le dit.",
        },
        {
          icon: "🔬",
          title: "Tests réels, pas des démos",
          text: "Chaque outil est utilisé en conditions réelles, sur des projets concrets, pendant plusieurs semaines. Nos scores reflètent une utilisation quotidienne — pas un screenshot de marketing.",
        },
        {
          icon: "💰",
          title: "Transparence sur l'affiliation",
          text: "Certains liens sont affiliés. Ça nous permet de garder le site gratuit. Mais ça ne change jamais notre avis — un mauvais outil reste un mauvais outil, affilié ou non.",
        },
        {
          icon: "🇫🇷",
          title: "Fait en France",
          text: "Neuriflux est un projet français, bilingue FR/EN, pensé pour les créateurs, indépendants et équipes qui veulent naviguer dans l'écosystème IA sans se perdre.",
        },
      ],
    },
    stats: [
      { value: "120+", label: "Outils testés" },
      { value: "5", label: "Comparatifs publiés" },
      { value: "100%", label: "Indépendant" },
      { value: "2026", label: "Lancé en" },
    ],
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
      cta: "S'abonner →",
    },
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", about: "About" },
    badge: "About Neuriflux",
    title: "We test.",
    titleAccent: "You choose.",
    subtitle: "Neuriflux is an independent media dedicated to AI tools. No bullshit, no hidden sponsored links — just honest tests and clear comparisons.",
    manifesto: {
      label: "Our manifesto",
      blocks: [
        {
          icon: "⚡",
          title: "Total independence",
          text: "Neuriflux is not owned by any software publisher. Our comparisons and reviews are written without commercial pressure. When a tool is bad, we say so.",
        },
        {
          icon: "🔬",
          title: "Real tests, not demos",
          text: "Every tool is used in real conditions, on concrete projects, for several weeks. Our scores reflect daily use — not a marketing screenshot.",
        },
        {
          icon: "💰",
          title: "Transparent about affiliation",
          text: "Some links are affiliate links. That's what keeps the site free. But it never changes our opinion — a bad tool stays a bad tool, affiliated or not.",
        },
        {
          icon: "🇫🇷",
          title: "Made in France",
          text: "Neuriflux is a French project, bilingual FR/EN, designed for creators, freelancers and teams who want to navigate the AI ecosystem without getting lost.",
        },
      ],
    },
    stats: [
      { value: "120+", label: "Tools tested" },
      { value: "5", label: "Comparisons published" },
      { value: "100%", label: "Independent" },
      { value: "2026", label: "Launched in" },
    ],
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
      cta: "Subscribe →",
    },
  },
};

export default function AboutClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = T[lang];
  const l = (path: string) => `/${lang}${path}`;

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--border:rgba(255,255,255,0.07);--border-glow:rgba(0,230,190,0.25);--cyan:#00e6be;--cyan-dim:rgba(0,230,190,0.12);--cyan-glow:rgba(0,230,190,0.35);--text:#f0f4f8;--text-muted:#6b7a8d;--text-dim:#3d4f61;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace;--font-body:'Lora',serif}
        html{scroll-behavior:smooth}body{background:var(--bg);color:var(--text);font-family:var(--font-display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,0.02) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
        .glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:800px;height:600px;background:radial-gradient(ellipse,rgba(0,230,190,0.06) 0%,transparent 70%);pointer-events:none;z-index:0}
        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(8,12,16,0.85);border-bottom:1px solid var(--border);padding:0 clamp(1.5rem,5vw,4rem);height:64px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:-0.02em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.5rem}
        .logo span{color:var(--cyan)}
        .dot{width:7px;height:7px;background:var(--cyan);border-radius:50%;box-shadow:0 0 10px var(--cyan);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none}
        @media(max-width:768px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.5rem 2rem;gap:1.2rem}}
        .nav-links a{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);text-decoration:none;letter-spacing:.04em;transition:color .2s}
        .nav-links a:hover{color:var(--cyan)}
        .lang-toggle{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px;display:flex;gap:2px}
        .lb{font-family:var(--font-mono);font-size:.7rem;padding:4px 10px;border-radius:4px;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--text-muted)}
        .lb.active{background:var(--cyan);color:var(--bg);font-weight:600}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}
        @media(max-width:768px){.hb{display:flex}}
        .hb span{display:block;width:20px;height:2px;background:var(--text-muted);border-radius:2px}

        /* HERO */
        .hero{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem) clamp(3rem,6vw,5rem);text-align:center}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-mono);font-size:.72rem;letter-spacing:.08em;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:100px;padding:6px 14px;margin-bottom:2rem}
        .hero-title{font-size:clamp(3rem,8vw,6rem);font-weight:800;line-height:1.0;letter-spacing:-.04em;margin-bottom:1.5rem}
        .hero-title .accent{color:var(--cyan)}
        .hero-subtitle{font-family:var(--font-mono);font-size:clamp(.9rem,1.8vw,1.05rem);font-weight:300;color:var(--text-muted);line-height:1.7;max-width:600px;margin:0 auto}

        /* STATS */
        .stats{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:0 clamp(1.5rem,5vw,4rem) clamp(3rem,6vw,5rem);display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden}
        @media(max-width:640px){.stats{grid-template-columns:repeat(2,1fr)}}
        .stat-box{background:var(--bg2);padding:2rem 1.5rem;text-align:center}
        .stat-val{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;letter-spacing:-.04em;color:var(--cyan);font-family:var(--font-display)}
        .stat-lbl{font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted);letter-spacing:.06em;text-transform:uppercase;margin-top:.3rem}

        /* SECTIONS */
        .section{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)}
        .section-label{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
        .section-label::before{content:'';display:inline-block;width:20px;height:1px;background:var(--cyan)}

        /* MANIFESTO */
        .manifesto-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;margin-top:2.5rem}
        .manifesto-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:2rem;transition:border-color .2s}
        .manifesto-card:hover{border-color:var(--border-glow)}
        .manifesto-icon{font-size:2rem;margin-bottom:1.25rem;display:block}
        .manifesto-title{font-size:1.05rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.75rem;color:var(--text)}
        .manifesto-text{font-family:var(--font-body);font-size:.9rem;line-height:1.75;color:#d4dde8}

        /* MISSION */
        .mission-box{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:clamp(2rem,4vw,3.5rem);position:relative;overflow:hidden}
        .mission-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .mission-glow{position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:500px;height:300px;background:radial-gradient(ellipse,rgba(0,230,190,.05),transparent 70%);pointer-events:none}
        .mission-title{font-size:clamp(1.5rem,3vw,2rem);font-weight:800;letter-spacing:-.03em;margin-bottom:1rem;position:relative;z-index:1}
        .mission-text{font-family:var(--font-body);font-size:1rem;line-height:1.8;color:#d4dde8;max-width:680px;position:relative;z-index:1}

        /* BOTTOM GRID */
        .bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:2rem}
        @media(max-width:640px){.bottom-grid{grid-template-columns:1fr}}
        .bottom-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:2rem;transition:border-color .2s}
        .bottom-card:hover{border-color:var(--border-glow)}
        .bottom-card-label{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:1rem}
        .bottom-card-title{font-size:1.1rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.75rem;color:var(--text)}
        .bottom-card-text{font-family:var(--font-mono);font-size:.8rem;color:var(--text-muted);line-height:1.6;font-weight:300;margin-bottom:1.5rem}
        .btn-cyan{display:inline-flex;align-items:center;gap:.4rem;background:var(--cyan);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:.85rem;padding:10px 20px;border-radius:8px;text-decoration:none;transition:all .2s;letter-spacing:-.01em;border:none;cursor:pointer}
        .btn-cyan:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--cyan-glow)}
        .btn-outline{display:inline-flex;align-items:center;gap:.4rem;background:transparent;color:var(--cyan);font-family:var(--font-display);font-weight:700;font-size:.85rem;padding:10px 20px;border-radius:8px;text-decoration:none;transition:all .2s;letter-spacing:-.01em;border:1px solid var(--border-glow)}
        .btn-outline:hover{background:var(--cyan-dim)}

        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2rem clamp(1.5rem,5vw,4rem);max-width:1000px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
        .cp{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim)}.cp span{color:var(--cyan)}
      `}</style>

      <div className="grid-bg" /><div className="glow" />

      <nav>
        <a href={l("")} className="logo"><div className="dot" />Neuri<span>flux</span></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")}>{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/about")}>{t.nav.about}</a></li>
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="lang-toggle">
            <button className={`lb${lang === "fr" ? " active" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " active" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="badge">
          <span style={{ width: 6, height: 6, background: "var(--cyan)", borderRadius: "50%", display: "inline-block" }} />
          {t.badge}
        </div>
        <h1 className="hero-title">
          {t.title}<br /><span className="accent">{t.titleAccent}</span>
        </h1>
        <p className="hero-subtitle">{t.subtitle}</p>
      </div>

      {/* STATS */}
      <div className="stats">
        {t.stats.map((s, i) => (
          <div key={i} className="stat-box">
            <div className="stat-val">{s.value}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* MANIFESTO */}
      <div className="section">
        <div className="section-label">{t.manifesto.label}</div>
        <div className="manifesto-grid">
          {t.manifesto.blocks.map((block, i) => (
            <div key={i} className="manifesto-card">
              <span className="manifesto-icon">{block.icon}</span>
              <div className="manifesto-title">{block.title}</div>
              <p className="manifesto-text">{block.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MISSION */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="mission-box">
          <div className="mission-glow" />
          <div className="section-label" style={{ marginBottom: "1.5rem" }}>{t.mission.label}</div>
          <h2 className="mission-title">{t.mission.title}</h2>
          <p className="mission-text">{t.mission.text}</p>
        </div>

        {/* CONTACT + NEWSLETTER */}
        <div className="bottom-grid">
          <div className="bottom-card">
            <div className="bottom-card-label">{t.contact.label}</div>
            <div className="bottom-card-title">{t.contact.title}</div>
            <p className="bottom-card-text">{t.contact.text}</p>
            <a href={`mailto:${t.contact.email}`} className="btn-cyan">
              ✉ {t.contact.emailLabel}
            </a>
          </div>
          <div className="bottom-card">
            <div className="bottom-card-label">{t.newsletter.label}</div>
            <div className="bottom-card-title">{t.newsletter.title}</div>
            <p className="bottom-card-text">{t.newsletter.text}</p>
            <a href={l("/newsletter")} className="btn-outline">
              {t.newsletter.cta}
            </a>
          </div>
        </div>
      </div>

      <footer>
        <p className="cp">© 2026 <span>Neuriflux</span>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
        <p className="cp">{lang === "fr" ? "Fait avec" : "Made with"} <span>♥</span> {lang === "fr" ? "en France" : "in France"}</p>
      </footer>
    </>
  );
}