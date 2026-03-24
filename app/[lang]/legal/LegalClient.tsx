"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", about: "A propos" },
    back: "← Retour",
    title: "Mentions légales",
    updated: "Dernière mise à jour : mars 2026",
    sections: [
      {
        title: "Éditeur du site",
        content: `Le site Neuriflux (neuriflux.com) est édité par un particulier domicilié en France.

Contact : contact@neuriflux.com`,
      },
      {
        title: "Hébergement",
        content: `Le site est hébergé par :

Vercel Inc.
440 N Barranca Ave #4133
Covina, CA 91723, États-Unis
https://vercel.com`,
      },
      {
        title: "Propriété intellectuelle",
        content: `L'ensemble du contenu de ce site (textes, comparatifs, scores, analyses) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.

Les marques et logos des outils présentés (ChatGPT, Claude, Cursor, etc.) appartiennent à leurs propriétaires respectifs. Leur mention sur ce site est effectuée à titre informatif et comparatif, sans lien commercial direct sauf indication contraire.`,
      },
      {
        title: "Liens d'affiliation",
        content: `Neuriflux participe à des programmes d'affiliation. Certains liens vers des outils tiers sont des liens affiliés — si vous achetez un produit via ces liens, nous percevons une commission sans coût supplémentaire pour vous.

Les comparatifs et avis publiés sur ce site restent indépendants et reflètent notre opinion honnête, indépendamment des liens d'affiliation.`,
      },
      {
        title: "Responsabilité",
        content: `Neuriflux s'efforce de fournir des informations exactes et à jour. Toutefois, nous ne pouvons garantir l'exactitude, l'exhaustivité ou l'actualité des informations publiées.

Les prix et fonctionnalités des outils comparés peuvent évoluer. Nous recommandons de vérifier les informations directement auprès des éditeurs concernés avant toute décision d'achat.`,
      },
      {
        title: "Droit applicable",
        content: `Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.`,
      },
    ],
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", about: "About" },
    back: "← Back",
    title: "Legal Notice",
    updated: "Last updated: March 2026",
    sections: [
      {
        title: "Publisher",
        content: `The Neuriflux website (neuriflux.com) is published by an individual based in France.

Contact: contact@neuriflux.com`,
      },
      {
        title: "Hosting",
        content: `This website is hosted by:

Vercel Inc.
440 N Barranca Ave #4133
Covina, CA 91723, United States
https://vercel.com`,
      },
      {
        title: "Intellectual Property",
        content: `All content on this site (texts, comparisons, scores, analyses) is protected by copyright. Any reproduction, even partial, is prohibited without prior authorization.

Trademarks and logos of the tools featured (ChatGPT, Claude, Cursor, etc.) belong to their respective owners. Their mention on this site is for informational and comparative purposes only, without direct commercial relationship unless otherwise stated.`,
      },
      {
        title: "Affiliate Links",
        content: `Neuriflux participates in affiliate programs. Some links to third-party tools are affiliate links — if you purchase a product through these links, we receive a commission at no additional cost to you.

The comparisons and reviews published on this site remain independent and reflect our honest opinion, regardless of affiliate relationships.`,
      },
      {
        title: "Liability",
        content: `Neuriflux strives to provide accurate and up-to-date information. However, we cannot guarantee the accuracy, completeness or timeliness of published information.

Prices and features of compared tools may change. We recommend verifying information directly with the relevant publishers before any purchase decision.`,
      },
      {
        title: "Applicable Law",
        content: `These legal notices are governed by French law. In the event of a dispute, French courts shall have sole jurisdiction.`,
      },
    ],
  },
};

export default function LegalClient({ lang }: { lang: Lang }) {
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
        :root{--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--border:rgba(255,255,255,0.07);--border-glow:rgba(0,230,190,0.25);--cyan:#00e6be;--cyan-dim:rgba(0,230,190,0.12);--text:#f0f4f8;--text-muted:#6b7a8d;--text-dim:#3d4f61;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace;--font-body:'Lora',serif}
        html{scroll-behavior:smooth}body{background:var(--bg);color:var(--text);font-family:var(--font-display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,0.02) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
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
        .wrap{position:relative;z-index:1;max-width:800px;margin:0 auto;padding:4rem clamp(1.5rem,5vw,4rem) 6rem}
        .back{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);text-decoration:none;margin-bottom:2rem;transition:color .2s}
        .back:hover{color:var(--cyan)}
        .page-title{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-.03em;margin-bottom:.5rem}
        .page-updated{font-family:var(--font-mono);font-size:.75rem;color:var(--text-dim);margin-bottom:3rem;font-weight:300}
        .section{margin-bottom:2.5rem;padding:1.75rem;background:var(--bg2);border:1px solid var(--border);border-radius:12px}
        .section-title{font-size:1.1rem;font-weight:700;letter-spacing:-.02em;margin-bottom:1rem;color:var(--text)}
        .section-title::before{content:'';display:inline-block;width:16px;height:2px;background:var(--cyan);margin-right:.75rem;vertical-align:middle;border-radius:2px}
        .section-content{font-family:var(--font-body);font-size:.92rem;line-height:1.8;color:#d4dde8;white-space:pre-line}
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2rem clamp(1.5rem,5vw,4rem);max-width:800px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
        .cp{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim)}.cp span{color:var(--cyan)}
      `}</style>

      <div className="grid-bg" />

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

      <div className="wrap">
        <a href={l("")} className="back">{t.back}</a>
        <h1 className="page-title">{t.title}</h1>
        <p className="page-updated">{t.updated}</p>

        {t.sections.map((section, i) => (
          <div key={i} className="section">
            <h2 className="section-title">{section.title}</h2>
            <p className="section-content">{section.content}</p>
          </div>
        ))}
      </div>

      <footer>
        <p className="cp">© 2026 <span>Neuriflux</span>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
        <p className="cp">{lang === "fr" ? "Fait avec" : "Made with"} <span>♥</span> {lang === "fr" ? "en France" : "in France"}</p>
      </footer>
    </>
  );
}