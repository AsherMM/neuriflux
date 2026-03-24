"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter" },
    back: "← Retour",
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : mars 2026",
    intro: "Neuriflux accorde une importance particulière à la protection de vos données personnelles. Cette politique décrit quelles données nous collectons, pourquoi et comment nous les utilisons.",
    sections: [
      {
        title: "Responsable du traitement",
        content: `Neuriflux (neuriflux.com) — éditeur particulier domicilié en France.
Contact : contact@neuriflux.com`,
      },
      {
        title: "Données collectées",
        content: `Nous collectons uniquement les données suivantes :

• Adresse e-mail — lorsque vous vous inscrivez à notre newsletter via le formulaire du site.
• Langue de préférence (fr/en) — déduite automatiquement de votre navigateur ou de votre choix.
• Source d'inscription — page depuis laquelle vous vous êtes inscrit (homepage, blog, comparatif).

Nous ne collectons pas de nom, prénom, numéro de téléphone, adresse postale ou données bancaires.`,
      },
      {
        title: "Finalité du traitement",
        content: `Vos données sont utilisées exclusivement pour :

• L'envoi de notre newsletter hebdomadaire (le "Radar IA") contenant des comparatifs, analyses et recommandations d'outils IA.
• L'amélioration de notre contenu en analysant les sources d'inscription.

Vos données ne sont jamais vendues, louées ou partagées avec des tiers à des fins commerciales.`,
      },
      {
        title: "Base légale",
        content: `Le traitement de vos données repose sur votre consentement (article 6.1.a du RGPD), recueilli lors de votre inscription à la newsletter.

Vous pouvez retirer votre consentement à tout moment en vous désabonnant via le lien présent dans chaque e-mail.`,
      },
      {
        title: "Stockage des données",
        content: `Vos données sont stockées dans une base de données sécurisée hébergée par Supabase (supabase.com), un service conforme au RGPD.

Serveurs localisés en Europe (région eu-west).

Vos données sont conservées aussi longtemps que vous restez abonné à la newsletter. En cas de désabonnement, vos données sont supprimées dans un délai de 30 jours.`,
      },
      {
        title: "Cookies et traceurs",
        content: `Neuriflux utilise un minimum de traceurs :

• Vercel Analytics — mesure d'audience anonymisée, sans cookie de tracking cross-site, conforme RGPD.
• Aucun cookie publicitaire ni de retargeting.
• Aucun partage de données avec des régies publicitaires.

Aucun consentement aux cookies n'est requis car nous n'utilisons pas de cookies nécessitant un consentement préalable.`,
      },
      {
        title: "Vos droits",
        content: `Conformément au RGPD, vous disposez des droits suivants :

• Droit d'accès — obtenir une copie de vos données.
• Droit de rectification — corriger des données inexactes.
• Droit à l'effacement — demander la suppression de vos données.
• Droit à la portabilité — recevoir vos données dans un format lisible.
• Droit d'opposition — vous opposer au traitement.

Pour exercer ces droits, contactez-nous à : contact@neuriflux.com

Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).`,
      },
      {
        title: "Modifications",
        content: `Nous nous réservons le droit de modifier cette politique à tout moment. La date de dernière mise à jour est indiquée en haut de cette page. En cas de modification substantielle, nous vous en informerons par e-mail.`,
      },
    ],
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter" },
    back: "← Back",
    title: "Privacy Policy",
    updated: "Last updated: March 2026",
    intro: "Neuriflux takes the protection of your personal data seriously. This policy describes what data we collect, why and how we use it.",
    sections: [
      {
        title: "Data Controller",
        content: `Neuriflux (neuriflux.com) — individual publisher based in France.
Contact: contact@neuriflux.com`,
      },
      {
        title: "Data Collected",
        content: `We only collect the following data:

• Email address — when you subscribe to our newsletter via the site's form.
• Language preference (fr/en) — automatically inferred from your browser or your choice.
• Subscription source — the page from which you subscribed (homepage, blog, comparison).

We do not collect names, phone numbers, postal addresses or banking data.`,
      },
      {
        title: "Purpose of Processing",
        content: `Your data is used exclusively for:

• Sending our weekly newsletter (the "AI Radar") containing AI tool comparisons, analyses and recommendations.
• Improving our content by analyzing subscription sources.

Your data is never sold, rented or shared with third parties for commercial purposes.`,
      },
      {
        title: "Legal Basis",
        content: `The processing of your data is based on your consent (Article 6.1.a of GDPR), collected when you subscribe to the newsletter.

You can withdraw your consent at any time by unsubscribing via the link in each email.`,
      },
      {
        title: "Data Storage",
        content: `Your data is stored in a secure database hosted by Supabase (supabase.com), a GDPR-compliant service.

Servers located in Europe (eu-west region).

Your data is retained as long as you remain subscribed to the newsletter. Upon unsubscription, your data is deleted within 30 days.`,
      },
      {
        title: "Cookies and Trackers",
        content: `Neuriflux uses a minimum of trackers:

• Vercel Analytics — anonymized audience measurement, without cross-site tracking cookies, GDPR compliant.
• No advertising or retargeting cookies.
• No data sharing with advertising networks.

No cookie consent is required as we do not use cookies requiring prior consent.`,
      },
      {
        title: "Your Rights",
        content: `Under GDPR, you have the following rights:

• Right of access — obtain a copy of your data.
• Right of rectification — correct inaccurate data.
• Right to erasure — request deletion of your data.
• Right to portability — receive your data in a readable format.
• Right to object — object to processing.

To exercise these rights, contact us at: contact@neuriflux.com

You may also lodge a complaint with your local data protection authority.`,
      },
      {
        title: "Changes",
        content: `We reserve the right to modify this policy at any time. The date of last update is shown at the top of this page. In case of substantial changes, we will notify you by email.`,
      },
    ],
  },
};

export default function PrivacyClient({ lang }: { lang: Lang }) {
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
        .page-updated{font-family:var(--font-mono);font-size:.75rem;color:var(--text-dim);margin-bottom:1rem;font-weight:300}
        .page-intro{font-family:var(--font-body);font-size:.95rem;color:var(--text-muted);line-height:1.7;margin-bottom:3rem;padding:1.25rem 1.5rem;border-left:3px solid var(--cyan);background:var(--bg2);border-radius:0 8px 8px 0}
        .section{margin-bottom:1.5rem;padding:1.75rem;background:var(--bg2);border:1px solid var(--border);border-radius:12px;transition:border-color .2s}
        .section:hover{border-color:rgba(0,230,190,0.15)}
        .section-title{font-size:1.05rem;font-weight:700;letter-spacing:-.02em;margin-bottom:1rem;color:var(--text);display:flex;align-items:center;gap:.75rem}
        .section-title::before{content:'';display:inline-block;width:16px;height:2px;background:var(--cyan);border-radius:2px;flex-shrink:0}
        .section-content{font-family:var(--font-body);font-size:.9rem;line-height:1.85;color:#d4dde8;white-space:pre-line}
        .rgpd-badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-mono);font-size:.68rem;letter-spacing:.08em;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:100px;padding:5px 12px;margin-bottom:2rem}
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
        <div className="rgpd-badge">
          <span style={{ width: 6, height: 6, background: "var(--cyan)", borderRadius: "50%", display: "inline-block" }} />
          {lang === "fr" ? "Conforme RGPD" : "GDPR Compliant"}
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