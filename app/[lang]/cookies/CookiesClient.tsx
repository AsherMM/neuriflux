"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    back: "← Accueil",
    badge: "Zéro cookie publicitaire",
    title: "Politique de cookies",
    updated: "Dernière mise à jour : mars 2026",
    intro: "Cette page explique comment Neuriflux utilise les cookies et traceurs sur son site. On va droit au but : on utilise uniquement des outils d'analyse d'audience, aucun cookie publicitaire.",
    sections: [
      { icon: "❓", title: "Qu'est-ce qu'un cookie ?", content: `Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, téléphone, tablette) lorsque vous visitez un site web. Il permet au site de mémoriser certaines informations sur votre visite.` },
      { icon: "🍪", title: "Les cookies que nous utilisons", content: `Neuriflux utilise trois types de cookies :\n\n🔧 Cookies techniques (essentiels)\nCes cookies permettent la navigation sur le site et l'utilisation de ses fonctionnalités de base. Ils ne nécessitent pas votre consentement.\n\n• Session / authentification — gestion des sessions utilisateurs\n• __vercel_live_feedback — outil interne Vercel (développement uniquement)\n\n📊 Vercel Analytics (mesure d'audience anonymisée)\nVercel Analytics mesure l'audience de manière anonymisée. Aucun cookie cross-site n'est déposé. Aucune donnée personnelle identifiable n'est collectée. Ce service est conforme au RGPD et ne nécessite pas de consentement préalable.\n\n📈 Google Analytics via Google Tag Manager\nNous utilisons Google Analytics 4 (via GTM) pour analyser le trafic et comprendre comment les visiteurs utilisent notre site. Google Analytics collecte des données anonymisées sur votre navigation (pages visitées, durée de session, pays d'origine) afin de nous aider à améliorer le contenu.\n\nLes données collectées sont transmises à Google et stockées sur leurs serveurs. Vous pouvez désactiver Google Analytics via l'extension officielle : https://tools.google.com/dlpage/gaoptout` },
      { icon: "❌", title: "Ce que nous n'utilisons PAS", content: `Neuriflux n'utilise pas :\n\n❌ Cookies de retargeting (Facebook Pixel, etc.)\n❌ Cookies de personnalisation publicitaire\n❌ Partage de données avec des régies publicitaires\n❌ Fingerprinting ou identification cross-site\n❌ Publicités affichées sur le site\n\nNotre objectif est de vous proposer un site respectueux de votre vie privée, financé uniquement par des liens affiliés transparents.` },
      { icon: "✅", title: "Consentement", content: `Nous utilisons Google Analytics à des fins statistiques uniquement. Conformément aux recommandations de la CNIL, nous avons configuré Google Analytics en mode anonymisé (anonymizeIp activé, pas de partage de données avec Google Ads).\n\nSi vous souhaitez refuser le tracking analytique, vous pouvez :\n• Installer l'extension de refus Google Analytics : https://tools.google.com/dlpage/gaoptout\n• Utiliser le mode navigation privée de votre navigateur\n• Désactiver les cookies tiers dans les paramètres de votre navigateur` },
      { icon: "⚙️", title: "Gérer vos cookies", content: `Vous pouvez contrôler et supprimer les cookies depuis les paramètres de votre navigateur :\n\n• Chrome : Paramètres → Confidentialité → Cookies\n• Firefox : Paramètres → Vie privée → Cookies\n• Safari : Préférences → Confidentialité → Gérer les données\n• Edge : Paramètres → Confidentialité → Cookies\n\nAttention : désactiver certains cookies peut affecter le fonctionnement du site.` },
      { icon: "✉️", title: "Contact", content: `Pour toute question concernant notre utilisation des cookies :\ncontact@neuriflux.com` },
    ],
    footer: { rights: "Tous droits réservés.", made: "Fait avec", france: "en France" },
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    back: "← Home",
    badge: "Zero advertising cookies",
    title: "Cookie Policy",
    updated: "Last updated: March 2026",
    intro: "This page explains how Neuriflux uses cookies and trackers on its site. Straight to the point: we only use audience analytics tools — zero advertising cookies.",
    sections: [
      { icon: "❓", title: "What is a cookie?", content: `A cookie is a small text file placed on your device (computer, phone, tablet) when you visit a website. It allows the site to remember certain information about your visit.` },
      { icon: "🍪", title: "Cookies we use", content: `Neuriflux uses three types of cookies:\n\n🔧 Technical cookies (essential)\nThese cookies enable navigation on the site and use of its basic features. They do not require your consent.\n\n• Session / authentication — user session management\n• __vercel_live_feedback — internal Vercel tool (development only)\n\n📊 Vercel Analytics (anonymized audience measurement)\nVercel Analytics measures audience in an anonymized way. No cross-site cookie is placed. No personally identifiable data is collected. This service is GDPR compliant and does not require prior consent.\n\n📈 Google Analytics via Google Tag Manager\nWe use Google Analytics 4 (via GTM) to analyze traffic and understand how visitors use our site. Google Analytics collects anonymized data about your browsing (pages visited, session duration, country of origin) to help us improve our content.\n\nData collected is transmitted to Google and stored on their servers. You can disable Google Analytics via the official opt-out extension: https://tools.google.com/dlpage/gaoptout` },
      { icon: "❌", title: "What we do NOT use", content: `Neuriflux does not use:\n\n❌ Retargeting cookies (Facebook Pixel, etc.)\n❌ Advertising personalization cookies\n❌ Data sharing with advertising networks\n❌ Fingerprinting or cross-site identification\n❌ Ads displayed on the site\n\nOur goal is to offer you a privacy-respecting site, funded solely by transparent affiliate links.` },
      { icon: "✅", title: "Consent", content: `We use Google Analytics for statistical purposes only. Google Analytics is configured in anonymized mode (anonymizeIp enabled, no data sharing with Google Ads).\n\nIf you wish to opt out of analytics tracking, you can:\n• Install the Google Analytics opt-out extension: https://tools.google.com/dlpage/gaoptout\n• Use your browser's private browsing mode\n• Disable third-party cookies in your browser settings` },
      { icon: "⚙️", title: "Managing your cookies", content: `You can control and delete cookies from your browser settings:\n\n• Chrome: Settings → Privacy → Cookies\n• Firefox: Settings → Privacy → Cookies\n• Safari: Preferences → Privacy → Manage Data\n• Edge: Settings → Privacy → Cookies\n\nNote: disabling certain cookies may affect how the site works.` },
      { icon: "✉️", title: "Contact", content: `For any questions about our use of cookies:\ncontact@neuriflux.com` },
    ],
    footer: { rights: "All rights reserved.", made: "Made with", france: "in France" },
  },
};

export default function CookiesClient({ lang }: { lang: Lang }) {
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
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:800px;height:500px;background:radial-gradient(ellipse,rgba(0,230,190,.045) 0%,transparent 68%);pointer-events:none;z-index:0}

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

        .wrap{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:4rem var(--pad) 7rem}
        .back{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;margin-bottom:2.5rem;transition:color .15s;letter-spacing:.03em}
        .back:hover{color:var(--cyan)}
        .page-badge{display:inline-flex;align-items:center;gap:.45rem;font-family:var(--m);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:5px 13px;margin-bottom:1.25rem}
        .page-badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .page-title{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-.04em;line-height:1.05;margin-bottom:.6rem;color:var(--text)}
        .page-updated{font-family:var(--m);font-size:.7rem;color:var(--dim);font-weight:300;margin-bottom:2rem;display:flex;align-items:center;gap:.4rem}
        .page-updated::before{content:'';display:inline-block;width:10px;height:1px;background:var(--dim)}
        .page-intro{font-family:var(--m);font-size:.8rem;color:var(--muted);line-height:1.8;font-weight:300;margin-bottom:2.5rem;padding:1.1rem 1.4rem;border-left:2px solid var(--cyan);background:var(--bg2);border-radius:0 10px 10px 0}

        .sections{display:flex;flex-direction:column;gap:1rem}
        .section{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1.75rem 2rem;position:relative;overflow:hidden;transition:border-color .2s}
        .section:hover{border-color:rgba(0,230,190,.12)}
        .section::before{content:'';position:absolute;top:0;left:0;bottom:0;width:2px;background:var(--cyan);opacity:0;transition:opacity .2s}
        .section:hover::before{opacity:.5}
        .section-header{display:flex;align-items:center;gap:.75rem;margin-bottom:1.1rem}
        .section-icon{width:34px;height:34px;background:var(--cdim);border:1px solid rgba(0,230,190,.18);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0}
        .section-title{font-family:var(--d);font-size:1rem;font-weight:700;letter-spacing:-.02em;color:var(--text)}
        .section-content{font-family:var(--m);font-size:.77rem;color:var(--muted);line-height:1.9;font-weight:300;white-space:pre-line;padding-left:calc(34px + .75rem)}

        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:1.75rem var(--pad);max-width:760px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
        .ft-links{display:flex;gap:1.25rem;list-style:none}
        .ft-links a{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none;transition:color .15s}
        .ft-links a:hover{color:var(--muted)}
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow" />

      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></a>
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

      <div className="wrap">
        <a href={l("")} className="back">{t.back}</a>
        <div className="page-badge"><div className="page-badge-dot" />{t.badge}</div>
        <h1 className="page-title">{t.title}</h1>
        <div className="page-updated">{t.updated}</div>
        <p className="page-intro">{t.intro}</p>
        <div className="sections">
          {t.sections.map((s, i) => (
            <div key={i} className="section">
              <div className="section-header">
                <div className="section-icon">{s.icon}</div>
                <div className="section-title">{s.title}</div>
              </div>
              <p className="section-content">{s.content}</p>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <span className="ft-copy">© 2026 <em>Neuriflux</em>. {t.footer.rights} {t.footer.made} <em>♥</em> {t.footer.france}</span>
        <ul className="ft-links">
          <li><a href={l("/legal")}>{lang === "fr" ? "Mentions légales" : "Legal"}</a></li>
          <li><a href={l("/privacy")}>{lang === "fr" ? "Confidentialité" : "Privacy"}</a></li>
        </ul>
      </footer>
    </>
  );
}