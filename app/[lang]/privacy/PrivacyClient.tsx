"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    back: "← Accueil",
    badge: "Conforme RGPD",
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : mars 2026",
    intro: "Neuriflux accorde une importance particulière à la protection de vos données personnelles. Cette politique décrit quelles données nous collectons, pourquoi et comment nous les utilisons.",
    sections: [
      { icon: "🏢", title: "Responsable du traitement", content: `Neuriflux (neuriflux.com) — éditeur particulier domicilié en France.\n\nContact : contact@neuriflux.com` },
      { icon: "📋", title: "Données collectées", content: `Nous collectons uniquement les données suivantes :\n\n• Adresse e-mail — lorsque vous vous inscrivez à notre newsletter via le formulaire du site.\n• Langue de préférence (fr/en) — déduite automatiquement de votre navigateur ou de votre choix.\n• Source d'inscription — page depuis laquelle vous vous êtes inscrit (homepage, blog, comparatif).\n\nNous ne collectons pas de nom, prénom, numéro de téléphone, adresse postale ou données bancaires.` },
      { icon: "🎯", title: "Finalité du traitement", content: `Vos données sont utilisées exclusivement pour :\n\n• L'envoi de notre newsletter hebdomadaire (le "Radar IA") contenant des comparatifs, analyses et recommandations d'outils IA.\n• L'amélioration de notre contenu en analysant les sources d'inscription.\n\nVos données ne sont jamais vendues, louées ou partagées avec des tiers à des fins commerciales.` },
      { icon: "⚖️", title: "Base légale", content: `Le traitement de vos données repose sur votre consentement (article 6.1.a du RGPD), recueilli lors de votre inscription à la newsletter.\n\nVous pouvez retirer votre consentement à tout moment en vous désabonnant via le lien présent dans chaque e-mail.` },
      { icon: "🔒", title: "Stockage des données", content: `Vos données sont stockées dans une base de données sécurisée hébergée par Supabase (supabase.com), un service conforme au RGPD.\n\nServeurs localisés en Europe (région eu-west).\n\nVos données sont conservées aussi longtemps que vous restez abonné à la newsletter. En cas de désabonnement, vos données sont supprimées dans un délai de 30 jours.` },
      { icon: "🍪", title: "Cookies et traceurs", content: `Neuriflux utilise un minimum de traceurs :\n\n• Vercel Analytics — mesure d'audience anonymisée, sans cookie de tracking cross-site, conforme RGPD.\n• Aucun cookie publicitaire ni de retargeting.\n• Aucun partage de données avec des régies publicitaires.\n\nAucun consentement aux cookies n'est requis car nous n'utilisons pas de cookies nécessitant un consentement préalable.` },
      { icon: "✅", title: "Vos droits", content: `Conformément au RGPD, vous disposez des droits suivants :\n\n• Droit d'accès — obtenir une copie de vos données.\n• Droit de rectification — corriger des données inexactes.\n• Droit à l'effacement — demander la suppression de vos données.\n• Droit à la portabilité — recevoir vos données dans un format lisible.\n• Droit d'opposition — vous opposer au traitement.\n\nPour exercer ces droits, contactez-nous à : contact@neuriflux.com\n\nVous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).` },
      { icon: "📝", title: "Modifications", content: `Nous nous réservons le droit de modifier cette politique à tout moment. La date de dernière mise à jour est indiquée en haut de cette page. En cas de modification substantielle, nous vous en informerons par e-mail.` },
    ],
    footer: { rights: "Tous droits réservés.", made: "Fait avec", france: "en France" },
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    back: "← Home",
    badge: "GDPR Compliant",
    title: "Privacy Policy",
    updated: "Last updated: March 2026",
    intro: "Neuriflux takes the protection of your personal data seriously. This policy describes what data we collect, why and how we use it.",
    sections: [
      { icon: "🏢", title: "Data Controller", content: `Neuriflux (neuriflux.com) — individual publisher based in France.\n\nContact: contact@neuriflux.com` },
      { icon: "📋", title: "Data Collected", content: `We only collect the following data:\n\n• Email address — when you subscribe to our newsletter via the site's form.\n• Language preference (fr/en) — automatically inferred from your browser or your choice.\n• Subscription source — the page from which you subscribed (homepage, blog, comparison).\n\nWe do not collect names, phone numbers, postal addresses or banking data.` },
      { icon: "🎯", title: "Purpose of Processing", content: `Your data is used exclusively for:\n\n• Sending our weekly newsletter (the "AI Radar") containing AI tool comparisons, analyses and recommendations.\n• Improving our content by analyzing subscription sources.\n\nYour data is never sold, rented or shared with third parties for commercial purposes.` },
      { icon: "⚖️", title: "Legal Basis", content: `The processing of your data is based on your consent (Article 6.1.a of GDPR), collected when you subscribe to the newsletter.\n\nYou can withdraw your consent at any time by unsubscribing via the link in each email.` },
      { icon: "🔒", title: "Data Storage", content: `Your data is stored in a secure database hosted by Supabase (supabase.com), a GDPR-compliant service.\n\nServers located in Europe (eu-west region).\n\nYour data is retained as long as you remain subscribed to the newsletter. Upon unsubscription, your data is deleted within 30 days.` },
      { icon: "🍪", title: "Cookies and Trackers", content: `Neuriflux uses a minimum of trackers:\n\n• Vercel Analytics — anonymized audience measurement, without cross-site tracking cookies, GDPR compliant.\n• No advertising or retargeting cookies.\n• No data sharing with advertising networks.\n\nNo cookie consent is required as we do not use cookies requiring prior consent.` },
      { icon: "✅", title: "Your Rights", content: `Under GDPR, you have the following rights:\n\n• Right of access — obtain a copy of your data.\n• Right of rectification — correct inaccurate data.\n• Right to erasure — request deletion of your data.\n• Right to portability — receive your data in a readable format.\n• Right to object — object to processing.\n\nTo exercise these rights, contact us at: contact@neuriflux.com\n\nYou may also lodge a complaint with your local data protection authority.` },
      { icon: "📝", title: "Changes", content: `We reserve the right to modify this policy at any time. The date of last update is shown at the top of this page. In case of substantial changes, we will notify you by email.` },
    ],
    footer: { rights: "All rights reserved.", made: "Made with", france: "in France" },
  },
};

export default function PrivacyClient({ lang }: { lang: Lang }) {
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
          <li><a href={l("/cookies")}>Cookies</a></li>
        </ul>
      </footer>
    </>
  );
}