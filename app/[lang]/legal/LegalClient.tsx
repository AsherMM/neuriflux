"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    back: "← Accueil",
    title: "Mentions légales",
    updated: "Dernière mise à jour : mars 2026",
    sections: [
      {
        icon: "🏢",
        title: "Éditeur du site",
        content: `Le site Neuriflux (neuriflux.com) est édité par un particulier domicilié en France.\n\nContact : contact@neuriflux.com`,
      },
      {
        icon: "⚡",
        title: "Hébergement",
        content: `Le site est hébergé par :\n\nVercel Inc.\n440 N Barranca Ave #4133\nCovina, CA 91723, États-Unis\nhttps://vercel.com`,
      },
      {
        icon: "©",
        title: "Propriété intellectuelle",
        content: `L'ensemble du contenu de ce site (textes, comparatifs, scores, analyses) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.\n\nLes marques et logos des outils présentés (ChatGPT, Claude, Cursor, etc.) appartiennent à leurs propriétaires respectifs. Leur mention sur ce site est effectuée à titre informatif et comparatif, sans lien commercial direct sauf indication contraire.`,
      },
      {
        icon: "🔗",
        title: "Liens d'affiliation",
        content: `Neuriflux participe à des programmes d'affiliation. Certains liens vers des outils tiers sont des liens affiliés — si vous achetez un produit via ces liens, nous percevons une commission sans coût supplémentaire pour vous.\n\nLes comparatifs et avis publiés sur ce site restent indépendants et reflètent notre opinion honnête, indépendamment des liens d'affiliation.`,
      },
      {
        icon: "⚠️",
        title: "Responsabilité",
        content: `Neuriflux s'efforce de fournir des informations exactes et à jour. Toutefois, nous ne pouvons garantir l'exactitude, l'exhaustivité ou l'actualité des informations publiées.\n\nLes prix et fonctionnalités des outils comparés peuvent évoluer. Nous recommandons de vérifier les informations directement auprès des éditeurs concernés avant toute décision d'achat.`,
      },
      {
        icon: "⚖️",
        title: "Droit applicable",
        content: `Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.`,
      },
    ],
    footer: { rights: "Tous droits réservés.", made: "Fait avec", france: "en France" },
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    back: "← Home",
    title: "Legal Notice",
    updated: "Last updated: March 2026",
    sections: [
      {
        icon: "🏢",
        title: "Publisher",
        content: `The Neuriflux website (neuriflux.com) is published by an individual based in France.\n\nContact: contact@neuriflux.com`,
      },
      {
        icon: "⚡",
        title: "Hosting",
        content: `This website is hosted by:\n\nVercel Inc.\n440 N Barranca Ave #4133\nCovina, CA 91723, United States\nhttps://vercel.com`,
      },
      {
        icon: "©",
        title: "Intellectual Property",
        content: `All content on this site (texts, comparisons, scores, analyses) is protected by copyright. Any reproduction, even partial, is prohibited without prior authorization.\n\nTrademarks and logos of the tools featured (ChatGPT, Claude, Cursor, etc.) belong to their respective owners. Their mention on this site is for informational and comparative purposes only, without direct commercial relationship unless otherwise stated.`,
      },
      {
        icon: "🔗",
        title: "Affiliate Links",
        content: `Neuriflux participates in affiliate programs. Some links to third-party tools are affiliate links — if you purchase a product through these links, we receive a commission at no additional cost to you.\n\nThe comparisons and reviews published on this site remain independent and reflect our honest opinion, regardless of affiliate relationships.`,
      },
      {
        icon: "⚠️",
        title: "Liability",
        content: `Neuriflux strives to provide accurate and up-to-date information. However, we cannot guarantee the accuracy, completeness or timeliness of published information.\n\nPrices and features of compared tools may change. We recommend verifying information directly with the relevant publishers before any purchase decision.`,
      },
      {
        icon: "⚖️",
        title: "Applicable Law",
        content: `These legal notices are governed by French law. In the event of a dispute, French courts shall have sole jurisdiction.`,
      },
    ],
    footer: { rights: "All rights reserved.", made: "Made with", france: "in France" },
  },
};

export default function LegalClient({ lang }: { lang: Lang }) {
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
          width:800px;height:500px;
          background:radial-gradient(ellipse,rgba(0,230,190,.045) 0%,transparent 68%);
          pointer-events:none;z-index:0}

        /* ─────────────────────────────────────────────────────────
           NAVIGATION — identique sur toutes les pages
        ───────────────────────────────────────────────────────── */
        nav{
          position:sticky;top:0;z-index:100;
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          background:rgba(8,12,16,.93);border-bottom:1px solid var(--border);
          padding:0 var(--pad);height:60px;
          display:flex;align-items:center;justify-content:space-between;
          transition:box-shadow .2s
        }
        nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.4)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;
          letter-spacing:-.03em;color:var(--text);text-decoration:none;
          display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;
          box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
        @media(max-width:720px){
          .nav-links{display:none}
          .nav-links.open{display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;
            background:var(--bg2);border-bottom:1px solid var(--border);
            padding:1.25rem var(--pad);gap:1rem;z-index:99}
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
           CONTENU
        ───────────────────────────────────────────────────────── */
        .wrap{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:4rem var(--pad) 7rem}

        /* Lien retour */
        .back{
          display:inline-flex;align-items:center;gap:.4rem;
          font-family:var(--m);font-size:.7rem;color:var(--muted);
          text-decoration:none;margin-bottom:2.5rem;
          transition:color .15s;letter-spacing:.03em
        }
        .back:hover{color:var(--cyan)}

        /* Hero titre */
        .page-badge{
          display:inline-flex;align-items:center;gap:.45rem;
          font-family:var(--m);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;
          color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);
          border-radius:100px;padding:5px 13px;margin-bottom:1.25rem
        }
        .page-badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .page-title{
          font-size:clamp(2rem,5vw,3rem);font-weight:800;
          letter-spacing:-.04em;line-height:1.05;margin-bottom:.6rem;color:var(--text)
        }
        .page-updated{
          font-family:var(--m);font-size:.7rem;color:var(--dim);
          font-weight:300;margin-bottom:3rem;
          display:flex;align-items:center;gap:.4rem
        }
        .page-updated::before{content:'';display:inline-block;width:10px;height:1px;background:var(--dim)}

        /* Cards sections */
        .sections{display:flex;flex-direction:column;gap:1rem}
        .section{
          background:var(--bg2);border:1px solid var(--border);border-radius:14px;
          padding:1.75rem 2rem;position:relative;overflow:hidden;
          transition:border-color .2s
        }
        .section:hover{border-color:rgba(0,230,190,.12)}
        /* Barre accent gauche au hover */
        .section::before{
          content:'';position:absolute;top:0;left:0;bottom:0;width:2px;
          background:var(--cyan);opacity:0;transition:opacity .2s
        }
        .section:hover::before{opacity:.5}

        /* Header section */
        .section-header{display:flex;align-items:center;gap:.75rem;margin-bottom:1.1rem}
        .section-icon{
          width:34px;height:34px;background:var(--cdim);border:1px solid rgba(0,230,190,.18);
          border-radius:8px;display:flex;align-items:center;justify-content:center;
          font-size:.95rem;flex-shrink:0
        }
        .section-title{
          font-family:var(--d);font-size:1rem;font-weight:700;
          letter-spacing:-.02em;color:var(--text)
        }

        /* Contenu texte */
        .section-content{
          font-family:var(--m);font-size:.78rem;color:var(--muted);
          line-height:1.85;font-weight:300;white-space:pre-line;
          padding-left:calc(34px + .75rem)
        }

        /* ─────────────────────────────────────────────────────────
           FOOTER
        ───────────────────────────────────────────────────────── */
        footer{
          position:relative;z-index:1;
          border-top:1px solid var(--border);
          padding:1.75rem var(--pad);
          max-width:760px;margin:0 auto;
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
        <a href={l("")} className="back">{t.back}</a>

        <div className="page-badge">
          <div className="page-badge-dot" />
          {lang === "fr" ? "Informations légales" : "Legal information"}
        </div>
        <h1 className="page-title">{t.title}</h1>
        <div className="page-updated">{t.updated}</div>

        <div className="sections">
          {t.sections.map((section, i) => (
            <div key={i} className="section">
              <div className="section-header">
                <div className="section-icon">{section.icon}</div>
                <div className="section-title">{section.title}</div>
              </div>
              <p className="section-content">{section.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <span className="ft-copy">© 2026 <em>Neuriflux</em>. {t.footer.rights} {t.footer.made} <em>♥</em> {t.footer.france}</span>
        <ul className="ft-links">
          <li><a href={l("/privacy")}>{lang === "fr" ? "Confidentialité" : "Privacy"}</a></li>
          <li><a href={l("/cookies")}>Cookies</a></li>
        </ul>
      </footer>
    </>
  );
}