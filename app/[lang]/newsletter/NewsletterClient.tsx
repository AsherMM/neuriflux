"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNewsletter } from "@/lib/useNewsletter";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", about: "À propos" },
    badge: "Gratuit · 3 200+ lecteurs · Chaque lundi",
    title: "Le Radar IA",
    titleAccent: "de la semaine",
    subtitle: "Chaque lundi matin, les outils IA qui comptent vraiment, les comparatifs honnêtes, et les deals à ne pas rater. Zéro spam. Désabonnement en 1 clic.",
    placeholder: "votre@email.com",
    cta: "Je m'abonne gratuitement",
    ctaLoading: "Inscription...",
    success: {
      title: "Bienvenue dans le Radar ! 🎉",
      text: "Vous recevrez votre premier email lundi prochain. En attendant, explorez nos comparatifs.",
      cta: "Voir les comparatifs →",
    },
    error: "Une erreur s'est produite. Réessayez.",
    social: "Rejoignez 3 200+ lecteurs",
    socialSub: "Marketeurs, devs, créateurs — chaque lundi",
    privacy: "Pas de spam. Désabonnement en 1 clic. Données privées.",
    whats_inside: {
      label: "Au programme chaque semaine",
      items: [
        { icon: "🔬", title: "1 outil décortiqué", text: "Fonctionnalités, prix, limites — notre verdict honnête sur l'outil de la semaine." },
        { icon: "⚔️", title: "1 comparatif", text: "Les meilleurs outils face à face. Scores détaillés et notre choix final." },
        { icon: "💸", title: "Les meilleurs deals", text: "Trials gratuits, remises et nouvelles formules à ne pas rater cette semaine." },
        { icon: "📡", title: "Le radar IA", text: "Les lancements et tendances qui vont changer votre façon de travailler." },
      ],
    },
    testimonials: {
      label: "Ce qu'en disent les lecteurs",
      items: [
        { text: "La seule newsletter IA que j'attends chaque lundi. Honnête, sans blabla marketing.", author: "Thomas D.", role: "Freelance développeur" },
        { text: "En 3 mois, j'ai découvert et adopté 4 outils grâce au Radar. ROI immédiat.", author: "Camille R.", role: "Responsable marketing" },
        { text: "Enfin une newsletter qui ne fait pas de la pub déguisée. Les comparatifs sont vraiment objectifs.", author: "Marc L.", role: "Entrepreneur" },
      ],
    },
    faq: {
      label: "Questions fréquentes",
      items: [
        { q: "C'est vraiment gratuit ?", a: "Oui, 100% gratuit. On se finance via des liens d'affiliation sur certains outils — ça ne change jamais nos avis." },
        { q: "À quelle fréquence ?", a: "Un email par semaine, le lundi matin. Pas plus, pas moins. Promis." },
        { q: "Puis-je me désabonner ?", a: "À tout moment, en un clic depuis n'importe quel email. Aucune question posée, aucun formulaire." },
        { q: "Vos données sont-elles partagées ?", a: "Non. Votre email n'est jamais vendu, loué ou partagé avec des tiers. Voir notre politique de confidentialité." },
        { q: "Vous faites de la pub déguisée ?", a: "Non. Quand un lien est affilié, on le dit explicitement. Nos avis restent 100% indépendants — un mauvais outil reste un mauvais outil." },
      ],
    },
    footer: {
      rights: "Tous droits réservés.",
      madeWith: "Fait avec",
      inFrance: "en France",
      links: [
        { label: "Mentions légales", href: "/legal" },
        { label: "Confidentialité", href: "/privacy" },
        { label: "Cookies", href: "/cookies" },
      ],
    },
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", about: "About" },
    badge: "Free · 3,200+ readers · Every Monday",
    title: "The Weekly",
    titleAccent: "AI Radar",
    subtitle: "Every Monday morning: the AI tools that actually matter, honest comparisons, and deals you don't want to miss. Zero spam. Unsubscribe in 1 click.",
    placeholder: "your@email.com",
    cta: "Subscribe for free",
    ctaLoading: "Subscribing...",
    success: {
      title: "Welcome to the Radar! 🎉",
      text: "You'll receive your first email next Monday. In the meantime, browse our comparisons.",
      cta: "See comparisons →",
    },
    error: "Something went wrong. Please try again.",
    social: "Join 3,200+ readers",
    socialSub: "Marketers, devs, creators — every Monday",
    privacy: "No spam. Unsubscribe in 1 click. Data stays private.",
    whats_inside: {
      label: "Every week inside",
      items: [
        { icon: "🔬", title: "1 tool reviewed", text: "Features, pricing, limits — our honest verdict on the tool of the week." },
        { icon: "⚔️", title: "1 comparison", text: "The best tools head-to-head. Detailed scores and our final pick." },
        { icon: "💸", title: "Best deals", text: "Free trials, discounts and new plans you don't want to miss this week." },
        { icon: "📡", title: "AI radar", text: "Launches and trends that will change the way you work." },
      ],
    },
    testimonials: {
      label: "What readers say",
      items: [
        { text: "The only AI newsletter I look forward to every Monday. Honest, no marketing fluff.", author: "Thomas D.", role: "Freelance developer" },
        { text: "In 3 months, I discovered and adopted 4 tools thanks to the Radar. Immediate ROI.", author: "Camille R.", role: "Marketing manager" },
        { text: "Finally a newsletter that doesn't do disguised advertising. The comparisons are genuinely objective.", author: "Marc L.", role: "Entrepreneur" },
      ],
    },
    faq: {
      label: "Frequently asked questions",
      items: [
        { q: "Is it really free?", a: "Yes, 100% free. We fund ourselves through affiliate links on some tools — it never changes our reviews." },
        { q: "How often?", a: "One email per week, Monday morning. No more, no less. Promise." },
        { q: "Can I unsubscribe?", a: "Anytime, in one click from any email. No questions asked, no forms to fill." },
        { q: "Is my data shared?", a: "No. Your email is never sold, rented or shared with third parties. See our privacy policy." },
        { q: "Do you do disguised ads?", a: "No. When a link is affiliated, we say so explicitly. Our reviews stay 100% independent — a bad tool stays a bad tool." },
      ],
    },
    footer: {
      rights: "All rights reserved.",
      madeWith: "Made with",
      inFrance: "in France",
      links: [
        { label: "Legal notice", href: "/legal" },
        { label: "Privacy", href: "/privacy" },
        { label: "Cookies", href: "/cookies" },
      ],
    },
  },
};

// Avatars emoji pour la social proof
const AVATARS = ["👨‍💻", "👩‍💼", "🧑‍🎨", "👩‍💻", "🧑‍🚀"];

export default function NewsletterClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = T[lang];
  const l = (path: string) => `/${lang}${path}`;
  const { status, subscribe } = useNewsletter("newsletter-page");

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(email, lang);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--border:rgba(255,255,255,0.07);--border-glow:rgba(0,230,190,0.25);--cyan:#00e6be;--cyan-dim:rgba(0,230,190,0.12);--cyan-glow:rgba(0,230,190,0.35);--text:#f0f4f8;--text-muted:#6b7a8d;--text-dim:#3d4f61;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace;--font-body:'Lora',serif}
        html{scroll-behavior:smooth}body{background:var(--bg);color:var(--text);font-family:var(--font-display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,0.02) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
        .glow{position:fixed;top:-10%;left:50%;transform:translateX(-50%);width:900px;height:700px;background:radial-gradient(ellipse,rgba(0,230,190,0.08) 0%,transparent 70%);pointer-events:none;z-index:0}

        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(8,12,16,0.85);border-bottom:1px solid var(--border);padding:0 clamp(1.5rem,5vw,4rem);height:64px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:-0.02em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.5rem}
        .logo span{color:var(--cyan)}
        .dot{width:7px;height:7px;background:var(--cyan);border-radius:50%;box-shadow:0 0 10px var(--cyan);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none}
        @media(max-width:768px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.5rem 2rem;gap:1.2rem}}
        .nav-links a{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);text-decoration:none;letter-spacing:.04em;transition:color .2s}
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        .lang-toggle{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px;display:flex;gap:2px}
        .lb{font-family:var(--font-mono);font-size:.7rem;padding:4px 10px;border-radius:4px;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--text-muted)}
        .lb.active{background:var(--cyan);color:var(--bg);font-weight:600}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}
        @media(max-width:768px){.hb{display:flex}}
        .hb span{display:block;width:20px;height:2px;background:var(--text-muted);border-radius:2px}

        /* HERO */
        .hero{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem) clamp(2rem,4vw,3rem);text-align:center}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-mono);font-size:.7rem;letter-spacing:.06em;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:100px;padding:6px 16px;margin-bottom:2rem}
        .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:pulse 2s infinite}
        .hero-title{font-size:clamp(2.8rem,7vw,5rem);font-weight:800;line-height:1.05;letter-spacing:-.04em;margin-bottom:1.25rem}
        .accent{color:var(--cyan)}
        .hero-subtitle{font-family:var(--font-mono);font-size:clamp(.88rem,1.6vw,1rem);font-weight:300;color:var(--text-muted);line-height:1.7;max-width:540px;margin:0 auto 2.5rem}

        /* SOCIAL PROOF AVATARS */
        .social-row{display:flex;align-items:center;justify-content:center;gap:.75rem;margin-bottom:2rem}
        .avatars{display:flex;align-items:center}
        .avatar-item{width:32px;height:32px;border-radius:50%;background:var(--bg3);border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;font-size:.9rem;margin-left:-8px}
        .avatar-item:first-child{margin-left:0}
        .social-text{font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted)}
        .social-text strong{color:var(--cyan);font-weight:600}

        /* FORM */
        .form-wrap{max-width:500px;margin:0 auto}
        .form-row{display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;margin-bottom:.75rem}
        .nl-input{flex:1;min-width:220px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px 18px;color:var(--text);font-family:var(--font-mono);font-size:.88rem;outline:none;transition:all .2s}
        .nl-input:focus{border-color:var(--border-glow);box-shadow:0 0 0 3px rgba(0,230,190,0.08)}
        .nl-input::placeholder{color:var(--text-dim)}
        .btn-primary{display:inline-flex;align-items:center;gap:.5rem;background:var(--cyan);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:.9rem;padding:14px 24px;border-radius:10px;border:none;cursor:pointer;text-decoration:none;transition:all .2s;letter-spacing:-.01em;white-space:nowrap}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--cyan-glow)}
        .btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
        .form-note{font-family:var(--font-mono);font-size:.68rem;color:var(--text-dim);text-align:center;line-height:1.5}

        /* SUCCESS */
        .success-box{background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:16px;padding:2.5rem;text-align:center;max-width:480px;margin:0 auto;position:relative;overflow:hidden}
        .success-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .success-icon{font-size:2.5rem;margin-bottom:1rem;display:block}
        .success-title{font-size:1.4rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.75rem}
        .success-text{font-family:var(--font-mono);font-size:.82rem;color:var(--text-muted);line-height:1.6;margin-bottom:1.5rem}
        .btn-outline{display:inline-flex;align-items:center;background:transparent;color:var(--cyan);font-family:var(--font-display);font-weight:700;font-size:.85rem;padding:10px 20px;border-radius:8px;text-decoration:none;border:1px solid var(--border-glow);transition:all .2s}
        .btn-outline:hover{background:var(--cyan-dim);transform:translateY(-1px)}
        .error-msg{font-family:var(--font-mono);font-size:.82rem;color:#ef4444;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 16px;text-align:center;max-width:480px;margin:0 auto 1rem}

        /* SECTIONS */
        .section{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)}
        .section-label{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:2rem;display:flex;align-items:center;gap:.5rem}
        .section-label::before{content:'';display:inline-block;width:20px;height:1px;background:var(--cyan)}

        /* INSIDE GRID */
        .inside-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.25rem}
        .inside-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.5rem;transition:all .2s;position:relative;overflow:hidden}
        .inside-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--cyan);transform:scaleX(0);transform-origin:left;transition:transform .3s ease}
        .inside-card:hover{border-color:var(--border-glow);transform:translateY(-2px)}
        .inside-card:hover::before{transform:scaleX(1)}
        .inside-icon{font-size:1.6rem;margin-bottom:.75rem;display:block}
        .inside-title{font-size:.95rem;font-weight:700;letter-spacing:-.01em;margin-bottom:.5rem;color:var(--text)}
        .inside-text{font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);line-height:1.6;font-weight:300}

        /* TESTIMONIALS */
        .testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem}
        .testi-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.75rem;transition:border-color .2s;display:flex;flex-direction:column;gap:.75rem}
        .testi-card:hover{border-color:var(--border-glow)}
        .testi-stars{color:#f59e0b;font-size:.8rem;letter-spacing:2px}
        .testi-text{font-family:var(--font-body);font-size:.9rem;line-height:1.7;color:#d4dde8;font-style:italic;flex:1}
        .testi-footer{display:flex;align-items:center;gap:.6rem;padding-top:.75rem;border-top:1px solid var(--border)}
        .testi-avatar{width:32px;height:32px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0}
        .testi-author{font-family:var(--font-mono);font-size:.75rem;color:var(--text);font-weight:500}
        .testi-role{font-family:var(--font-mono);font-size:.68rem;color:var(--text-dim);font-weight:300}

        /* FAQ */
        .faq-list{display:flex;flex-direction:column;gap:.75rem}
        .faq-item{background:var(--bg2);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .2s}
        .faq-item.open{border-color:var(--border-glow)}
        .faq-q{width:100%;background:none;border:none;padding:1.25rem 1.5rem;display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;gap:1rem}
        .faq-q:hover .faq-q-text{color:var(--cyan)}
        .faq-q-text{font-family:var(--font-display);font-size:.95rem;font-weight:600;color:var(--text);letter-spacing:-.01em;transition:color .2s}
        .faq-icon{width:22px;height:22px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:1rem;color:var(--cyan);flex-shrink:0;transition:all .2s}
        .faq-item.open .faq-icon{background:var(--cyan-dim);border-color:var(--border-glow);transform:rotate(45deg)}
        .faq-a{font-family:var(--font-mono);font-size:.8rem;color:var(--text-muted);line-height:1.7;font-weight:300;padding:0 1.5rem 1.25rem;display:none}
        .faq-a.open{display:block}

        /* BOTTOM CTA */
        .bottom-cta{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:0 clamp(1.5rem,5vw,4rem) clamp(3rem,6vw,5rem)}
        .bottom-cta-inner{background:var(--bg2);border:1px solid var(--border-glow);border-radius:16px;padding:clamp(2rem,4vw,3rem);text-align:center;position:relative;overflow:hidden}
        .bottom-cta-inner::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .bottom-cta-glow{position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:500px;height:300px;background:radial-gradient(ellipse,rgba(0,230,190,.06),transparent 70%);pointer-events:none}
        .bottom-cta-title{font-size:clamp(1.3rem,3vw,1.8rem);font-weight:800;letter-spacing:-.03em;margin-bottom:.75rem;position:relative;z-index:1}
        .bottom-cta-text{font-family:var(--font-mono);font-size:.82rem;color:var(--text-muted);line-height:1.6;margin-bottom:2rem;position:relative;z-index:1}
        .bottom-form-row{display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;max-width:440px;margin:0 auto 1rem;position:relative;z-index:1}

        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2rem clamp(1.5rem,5vw,4rem);max-width:1000px;margin:0 auto}
        .footer-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
        .cp{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim)}.cp span{color:var(--cyan)}
        .footer-links{display:flex;gap:1.5rem;flex-wrap:wrap}
        .footer-links a{font-family:var(--font-mono);font-size:.68rem;color:var(--text-dim);text-decoration:none;transition:color .2s}
        .footer-links a:hover{color:var(--cyan)}
      `}</style>

      <div className="grid-bg" /><div className="glow" />

      <nav>
        <a href={l("")} className="logo"><div className="dot" />Neuri<span>flux</span></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")}>{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")} className="active">{t.nav.newsletter}</a></li>
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

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="hero">
        <div className="badge">
          <div className="badge-dot" />
          {t.badge}
        </div>
        <h1 className="hero-title">
          {t.title} <span className="accent">{t.titleAccent}</span>
        </h1>
        <p className="hero-subtitle">{t.subtitle}</p>

        {/* Social proof avec avatars */}
        <div className="social-row">
          <div className="avatars">
            {AVATARS.map((a, i) => (
              <div key={i} className="avatar-item">{a}</div>
            ))}
          </div>
          <div className="social-text">
            <strong>{t.social.split(" ")[1]} {t.social.split(" ")[2]}</strong> {lang === "fr" ? "lecteurs" : "readers"}<br />
            <span style={{ fontSize: "0.68rem" }}>{t.socialSub}</span>
          </div>
        </div>

        {/* Formulaire */}
        {status === "success" ? (
          <div className="success-box">
            <span className="success-icon">🎉</span>
            <div className="success-title">{t.success.title}</div>
            <p className="success-text">{t.success.text}</p>
            <a href={l("/comparatifs")} className="btn-outline">{t.success.cta}</a>
          </div>
        ) : (
          <div className="form-wrap">
            {status === "error" && <p className="error-msg">{t.error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="email"
                  className="nl-input"
                  placeholder={t.placeholder}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
                <button type="submit" className="btn-primary" disabled={status === "loading"}>
                  {status === "loading" ? t.ctaLoading : t.cta}
                </button>
              </div>
              <p className="form-note">🔒 {t.privacy}</p>
            </form>
          </div>
        )}
      </div>

      {/* ─── AU PROGRAMME ─────────────────────────────────────────────────── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-label">{t.whats_inside.label}</div>
        <div className="inside-grid">
          {t.whats_inside.items.map((item, i) => (
            <div key={i} className="inside-card">
              <span className="inside-icon">{item.icon}</span>
              <div className="inside-title">{item.title}</div>
              <p className="inside-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-label">{t.testimonials.label}</div>
        <div className="testi-grid">
          {t.testimonials.items.map((item, i) => (
            <div key={i} className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"{item.text}"</p>
              <div className="testi-footer">
                <div className="testi-avatar">👤</div>
                <div>
                  <div className="testi-author">{item.author}</div>
                  <div className="testi-role">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-label">{t.faq.label}</div>
        <div className="faq-list">
          {t.faq.items.map((item, i) => (
            <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="faq-q-text">{item.q}</span>
                <span className="faq-icon">+</span>
              </button>
              <div className={`faq-a${openFaq === i ? " open" : ""}`}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── BOTTOM CTA ───────────────────────────────────────────────────── */}
      {status !== "success" && (
        <div className="bottom-cta">
          <div className="bottom-cta-inner">
            <div className="bottom-cta-glow" />
            <h2 className="bottom-cta-title">
              {lang === "fr" ? "Prêt à rejoindre le Radar ?" : "Ready to join the Radar?"}
            </h2>
            <p className="bottom-cta-text">
              {lang === "fr"
                ? "3 200+ professionnels reçoivent déjà leur dose d'IA chaque lundi. Gratuit, toujours."
                : "3,200+ professionals already get their AI dose every Monday. Free, always."}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="bottom-form-row">
                <input
                  type="email"
                  className="nl-input"
                  placeholder={t.placeholder}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                  style={{ borderRadius: 10 }}
                />
                <button type="submit" className="btn-primary" disabled={status === "loading"}>
                  {status === "loading" ? t.ctaLoading : (lang === "fr" ? "S'abonner →" : "Subscribe →")}
                </button>
              </div>
              <p className="form-note" style={{ position: "relative", zIndex: 1 }}>🔒 {t.privacy}</p>
            </form>
          </div>
        </div>
      )}

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer>
        <div className="footer-inner">
          <p className="cp">© 2026 <span>Neuriflux</span>. {t.footer.rights} {t.footer.madeWith} <span>♥</span> {t.footer.inFrance}</p>
          <div className="footer-links">
            {t.footer.links.map((link, i) => (
              <a key={i} href={l(link.href)}>{link.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}