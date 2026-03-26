"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", about: "À propos" },
    back: "← Retour",
    title: "Politique de cookies",
    updated: "Dernière mise à jour : mars 2026",
    intro: "Cette page explique comment Neuriflux utilise les cookies et traceurs sur son site. On va droit au but : on utilise uniquement des outils d'analyse d'audience, aucun cookie publicitaire.",
    sections: [
      {
        title: "Qu'est-ce qu'un cookie ?",
        content: `Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, téléphone, tablette) lorsque vous visitez un site web. Il permet au site de mémoriser certaines informations sur votre visite.`,
      },
      {
        title: "Les cookies que nous utilisons",
        content: `Neuriflux utilise trois types de cookies :

🔧 Cookies techniques (essentiels)
Ces cookies permettent la navigation sur le site et l'utilisation de ses fonctionnalités de base. Ils ne nécessitent pas votre consentement.

• Session / authentification — gestion des sessions utilisateurs
• __vercel_live_feedback — outil interne Vercel (développement uniquement)

📊 Vercel Analytics (mesure d'audience anonymisée)
Vercel Analytics mesure l'audience de manière anonymisée. Aucun cookie cross-site n'est déposé. Aucune donnée personnelle identifiable n'est collectée. Ce service est conforme au RGPD et ne nécessite pas de consentement préalable.

📈 Google Analytics via Google Tag Manager
Nous utilisons Google Analytics 4 (via GTM) pour analyser le trafic et comprendre comment les visiteurs utilisent notre site. Google Analytics collecte des données anonymisées sur votre navigation (pages visitées, durée de session, pays d'origine) afin de nous aider à améliorer le contenu.

Les données collectées sont transmises à Google et stockées sur leurs serveurs. Vous pouvez désactiver Google Analytics via l'extension officielle : https://tools.google.com/dlpage/gaoptout`,
      },
      {
        title: "Ce que nous n'utilisons PAS",
        content: `Neuriflux n'utilise pas :

❌ Cookies de retargeting (Facebook Pixel, etc.)
❌ Cookies de personnalisation publicitaire
❌ Partage de données avec des régies publicitaires
❌ Fingerprinting ou identification cross-site
❌ Publicités affichées sur le site

Notre objectif est de vous proposer un site respectueux de votre vie privée, financé uniquement par des liens affiliés transparents.`,
      },
      {
        title: "Consentement",
        content: `Nous utilisons Google Analytics à des fins statistiques uniquement. Conformément aux recommandations de la CNIL, nous avons configuré Google Analytics en mode anonymisé (anonymizeIp activé, pas de partage de données avec Google Ads).

Si vous souhaitez refuser le tracking analytique, vous pouvez :
• Installer l'extension de refus Google Analytics : https://tools.google.com/dlpage/gaoptout
• Utiliser le mode navigation privée de votre navigateur
• Désactiver les cookies tiers dans les paramètres de votre navigateur`,
      },
      {
        title: "Gérer vos cookies",
        content: `Vous pouvez contrôler et supprimer les cookies depuis les paramètres de votre navigateur :

• Chrome : Paramètres → Confidentialité → Cookies
• Firefox : Paramètres → Vie privée → Cookies
• Safari : Préférences → Confidentialité → Gérer les données
• Edge : Paramètres → Confidentialité → Cookies

Attention : désactiver certains cookies peut affecter le fonctionnement du site.`,
      },
      {
        title: "Contact",
        content: `Pour toute question concernant notre utilisation des cookies :
contact@neuriflux.com`,
      },
    ],
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", about: "About" },
    back: "← Back",
    title: "Cookie Policy",
    updated: "Last updated: March 2026",
    intro: "This page explains how Neuriflux uses cookies and trackers on its site. Straight to the point: we only use audience analytics tools — zero advertising cookies.",
    sections: [
      {
        title: "What is a cookie?",
        content: `A cookie is a small text file placed on your device (computer, phone, tablet) when you visit a website. It allows the site to remember certain information about your visit.`,
      },
      {
        title: "Cookies we use",
        content: `Neuriflux uses three types of cookies:

🔧 Technical cookies (essential)
These cookies enable navigation on the site and use of its basic features. They do not require your consent.

• Session / authentication — user session management
• __vercel_live_feedback — internal Vercel tool (development only)

📊 Vercel Analytics (anonymized audience measurement)
Vercel Analytics measures audience in an anonymized way. No cross-site cookie is placed. No personally identifiable data is collected. This service is GDPR compliant and does not require prior consent.

📈 Google Analytics via Google Tag Manager
We use Google Analytics 4 (via GTM) to analyze traffic and understand how visitors use our site. Google Analytics collects anonymized data about your browsing (pages visited, session duration, country of origin) to help us improve our content.

Data collected is transmitted to Google and stored on their servers. You can disable Google Analytics via the official opt-out extension: https://tools.google.com/dlpage/gaoptout`,
      },
      {
        title: "What we do NOT use",
        content: `Neuriflux does not use:

❌ Retargeting cookies (Facebook Pixel, etc.)
❌ Advertising personalization cookies
❌ Data sharing with advertising networks
❌ Fingerprinting or cross-site identification
❌ Ads displayed on the site

Our goal is to offer you a privacy-respecting site, funded solely by transparent affiliate links.`,
      },
      {
        title: "Consent",
        content: `We use Google Analytics for statistical purposes only. Google Analytics is configured in anonymized mode (anonymizeIp enabled, no data sharing with Google Ads).

If you wish to opt out of analytics tracking, you can:
• Install the Google Analytics opt-out extension: https://tools.google.com/dlpage/gaoptout
• Use your browser's private browsing mode
• Disable third-party cookies in your browser settings`,
      },
      {
        title: "Managing your cookies",
        content: `You can control and delete cookies from your browser settings:

• Chrome: Settings → Privacy → Cookies
• Firefox: Settings → Privacy → Cookies
• Safari: Preferences → Privacy → Manage Data
• Edge: Settings → Privacy → Cookies

Note: disabling certain cookies may affect how the site works.`,
      },
      {
        title: "Contact",
        content: `For any questions about our use of cookies:
contact@neuriflux.com`,
      },
    ],
  },
};

export default function CookiesClient({ lang }: { lang: Lang }) {
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
        .logo{font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:-0.02em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.5rem}.logo span{color:var(--cyan)}
        .dot{width:7px;height:7px;background:var(--cyan);border-radius:50%;box-shadow:0 0 10px var(--cyan);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none}
        @media(max-width:768px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.5rem 2rem;gap:1.2rem}}
        .nav-links a{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);text-decoration:none;letter-spacing:.04em;transition:color .2s}.nav-links a:hover{color:var(--cyan)}
        .lang-toggle{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px;display:flex;gap:2px}
        .lb{font-family:var(--font-mono);font-size:.7rem;padding:4px 10px;border-radius:4px;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--text-muted)}.lb.active{background:var(--cyan);color:var(--bg);font-weight:600}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}@media(max-width:768px){.hb{display:flex}}.hb span{display:block;width:20px;height:2px;background:var(--text-muted);border-radius:2px}
        .wrap{position:relative;z-index:1;max-width:800px;margin:0 auto;padding:4rem clamp(1.5rem,5vw,4rem) 6rem}
        .back{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);text-decoration:none;margin-bottom:2rem;transition:color .2s}.back:hover{color:var(--cyan)}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-mono);font-size:.68rem;letter-spacing:.08em;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:100px;padding:5px 12px;margin-bottom:2rem}
        .page-title{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-.03em;margin-bottom:.5rem}
        .page-updated{font-family:var(--font-mono);font-size:.75rem;color:var(--text-dim);margin-bottom:1rem;font-weight:300}
        .page-intro{font-family:var(--font-body);font-size:.95rem;color:var(--text-muted);line-height:1.7;margin-bottom:3rem;padding:1.25rem 1.5rem;border-left:3px solid var(--cyan);background:var(--bg2);border-radius:0 8px 8px 0}
        .section{margin-bottom:1.5rem;padding:1.75rem;background:var(--bg2);border:1px solid var(--border);border-radius:12px;transition:border-color .2s}
        .section:hover{border-color:rgba(0,230,190,0.15)}
        .section-title{font-size:1.05rem;font-weight:700;letter-spacing:-.02em;margin-bottom:1rem;color:var(--text);display:flex;align-items:center;gap:.75rem}
        .section-title::before{content:'';display:inline-block;width:16px;height:2px;background:var(--cyan);border-radius:2px;flex-shrink:0}
        .section-content{font-family:var(--font-body);font-size:.9rem;line-height:1.85;color:#d4dde8;white-space:pre-line}
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
        <div className="badge">
          <span style={{ width: 6, height: 6, background: "var(--cyan)", borderRadius: "50%", display: "inline-block" }} />
          {lang === "fr" ? "Zéro cookie publicitaire" : "Zero advertising cookies"}
        </div>
        <h1 className="page-title">{t.title}</h1>
        <p className="page-updated">{t.updated}</p>
        <p className="page-intro">{t.intro}</p>

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