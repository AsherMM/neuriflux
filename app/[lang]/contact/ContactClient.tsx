"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type Lang = "fr" | "en";
type Status = "idle" | "loading" | "success" | "error";

// ─── Traductions ───────────────────────────────────────────────────────────────
const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "On vous répond",
    title: "Une question ?",
    titleAccent: "Écrivez-nous.",
    subtitle: "Suggestion d'outil, partenariat, erreur dans un article, simple retour — on lit tout et on répond à tous les messages.",
    form: {
      name: "Votre nom", namePlaceholder: "Jean Dupont",
      email: "Votre email", emailPlaceholder: "vous@email.com",
      subject: "Sujet", subjectPlaceholder: "Suggestion d'outil, partenariat...",
      message: "Votre message", messagePlaceholder: "Décrivez votre demande en détail...",
      submit: "Envoyer le message", submitting: "Envoi en cours...",
    },
    subjects: ["Suggestion d'outil à tester", "Partenariat / affiliation", "Erreur dans un article", "Question sur un comparatif", "Autre"],
    success: { title: "Message envoyé ! ✓", text: "On vous répond généralement sous 48h. En attendant, explorez nos derniers comparatifs.", cta: "Voir les comparatifs →" },
    error: "Une erreur s'est produite. Réessayez ou écrivez-nous directement.",
    reasons: {
      label: "Pour quoi nous contacter ?",
      items: [
        { icon: "🔬", title: "Suggérer un outil", text: "Un outil IA mérite d'être testé ? Dites-nous lequel — on le met sur notre liste." },
        { icon: "🤝", title: "Partenariat", text: "Affiliation, contenu sponsorisé, collaboration éditoriale — discutons." },
        { icon: "✏️", title: "Signaler une erreur", text: "Un prix erroné, une info obsolète ? On met à jour rapidement." },
        { icon: "💬", title: "Simple retour", text: "Vous aimez (ou pas) ce qu'on fait ? On aime les retours honnêtes." },
      ],
    },
    ftTagline: "Le média indépendant des outils IA.",
    ftContent: "Contenu", ftLegal: "Légal",
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
    badge: "We reply to everyone",
    title: "Got a question?",
    titleAccent: "Write to us.",
    subtitle: "Tool suggestion, partnership, error in an article, simple feedback — we read everything and reply to every message.",
    form: {
      name: "Your name", namePlaceholder: "John Smith",
      email: "Your email", emailPlaceholder: "you@email.com",
      subject: "Subject", subjectPlaceholder: "Tool suggestion, partnership...",
      message: "Your message", messagePlaceholder: "Describe your request in detail...",
      submit: "Send message", submitting: "Sending...",
    },
    subjects: ["Tool suggestion", "Partnership / affiliation", "Error in an article", "Question about a comparison", "Other"],
    success: { title: "Message sent! ✓", text: "We usually reply within 48 hours. In the meantime, browse our latest comparisons.", cta: "See comparisons →" },
    error: "Something went wrong. Please try again or email us directly.",
    reasons: {
      label: "Why contact us?",
      items: [
        { icon: "🔬", title: "Suggest a tool", text: "An AI tool deserves to be tested? Tell us which one — we'll add it to our list." },
        { icon: "🤝", title: "Partnership", text: "Affiliation, sponsored content, editorial collaboration — let's talk." },
        { icon: "✏️", title: "Report an error", text: "Wrong price, outdated info? We update quickly." },
        { icon: "💬", title: "Simple feedback", text: "You like (or don't like) what we do? We love honest feedback." },
      ],
    },
    ftTagline: "The independent AI tools media.",
    ftContent: "Content", ftLegal: "Legal",
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContactClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = T[lang];
  const l = (path: string) => `/${lang}${path}`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, lang }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

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
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:900px;height:680px;background:radial-gradient(ellipse,rgba(0,230,190,.055) 0%,transparent 68%);pointer-events:none;z-index:0}

        /* ─────────────────────────────────────────────────────────
           NAVIGATION — identique sur toutes les pages
        ───────────────────────────────────────────────────────── */
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

        /* ─────────────────────────────────────────────────────────
           LAYOUT
        ───────────────────────────────────────────────────────── */
        .wrap{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:0 var(--pad)}

        /* ─────────────────────────────────────────────────────────
           HERO
        ───────────────────────────────────────────────────────── */
        .hero{padding:clamp(4rem,8vw,7rem) 0 clamp(2rem,4vw,3rem)}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.7rem;letter-spacing:.08em;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:6px 14px;margin-bottom:1.75rem}
        .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero-title{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;line-height:1.05;letter-spacing:-.04em;margin-bottom:1rem}
        .hero-title .ac{color:var(--cyan)}
        .hero-sub{font-family:var(--m);font-size:clamp(.82rem,1.5vw,.92rem);font-weight:300;color:var(--muted);line-height:1.75;max-width:560px}

        /* ─────────────────────────────────────────────────────────
           GRILLE PRINCIPALE
        ───────────────────────────────────────────────────────── */
        .main-grid{display:grid;grid-template-columns:1fr 360px;gap:2.5rem;align-items:start;padding-bottom:clamp(4rem,8vw,6rem)}
        @media(max-width:840px){.main-grid{grid-template-columns:1fr}}

        /* ─────────────────────────────────────────────────────────
           FORMULAIRE
        ───────────────────────────────────────────────────────── */
        .form-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:2rem;position:relative;overflow:hidden}
        .form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .form-title{font-family:var(--d);font-size:1.05rem;font-weight:700;letter-spacing:-.02em;color:var(--text);margin-bottom:1.75rem}
        .field{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.2rem}
        .field label{font-family:var(--m);font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
        .field input,.field textarea,.field select{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 13px;color:var(--text);font-family:var(--m);font-size:.8rem;font-weight:300;outline:none;transition:all .2s;width:100%;appearance:none;-webkit-appearance:none}
        .field input:focus,.field textarea:focus,.field select:focus{border-color:rgba(0,230,190,.28);box-shadow:0 0 0 3px rgba(0,230,190,.06)}
        .field input::placeholder,.field textarea::placeholder{color:var(--dim)}
        .field textarea{resize:vertical;min-height:130px;line-height:1.6}
        .field select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235a6a7a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;padding-right:36px;cursor:pointer}
        .field select option{background:var(--bg3);color:var(--text)}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        @media(max-width:520px){.field-row{grid-template-columns:1fr}}
        .btn-submit{width:100%;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.88rem;padding:13px;border-radius:9px;border:none;cursor:pointer;transition:all .2s;letter-spacing:-.01em;margin-top:.5rem;display:flex;align-items:center;justify-content:center;gap:.5rem}
        .btn-submit:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,230,190,.28)}
        .btn-submit:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
        .error-msg{font-family:var(--m);font-size:.75rem;color:#ef4444;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:10px 13px;margin-top:.75rem}

        /* ─────────────────────────────────────────────────────────
           SUCCÈS
        ───────────────────────────────────────────────────────── */
        .success-card{background:var(--cdim);border:1px solid var(--glow);border-radius:16px;padding:2.5rem;text-align:center;position:relative;overflow:hidden}
        .success-card::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .success-icon{font-size:2.5rem;display:block;margin-bottom:1rem}
        .success-title{font-size:1.2rem;font-weight:800;letter-spacing:-.02em;color:var(--cyan);margin-bottom:.75rem}
        .success-text{font-family:var(--m);font-size:.75rem;color:var(--muted);line-height:1.65;margin-bottom:1.5rem;font-weight:300}
        .btn-outline{display:inline-flex;align-items:center;background:transparent;color:var(--cyan);font-family:var(--d);font-weight:700;font-size:.82rem;padding:10px 20px;border-radius:8px;text-decoration:none;border:1px solid var(--glow);transition:all .2s}
        .btn-outline:hover{background:var(--cdim);transform:translateY(-1px)}

        /* ─────────────────────────────────────────────────────────
           SIDEBAR
        ───────────────────────────────────────────────────────── */
        .sidebar{display:flex;flex-direction:column;gap:1rem}
        .sec-label{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.1rem;display:flex;align-items:center;gap:.4rem}
        .sec-label::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}
        .reason-cards{display:flex;flex-direction:column;gap:.65rem}
        .rcard{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.1rem;display:flex;gap:.85rem;align-items:flex-start;transition:border-color .18s}
        .rcard:hover{border-color:var(--glow)}
        .rcard-icon{font-size:1.2rem;flex-shrink:0;margin-top:.05rem}
        .rcard-title{font-family:var(--d);font-size:.86rem;font-weight:700;letter-spacing:-.01em;color:var(--text);margin-bottom:.2rem}
        .rcard-text{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.55}
        .email-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.35rem}
        .email-lbl{font-family:var(--m);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:.45rem}
        .email-addr{font-family:var(--m);font-size:.84rem;color:var(--cyan);font-weight:500;text-decoration:none;display:block;margin-bottom:.85rem;transition:opacity .15s}
        .email-addr:hover{opacity:.75}
        .email-note{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.55;font-weight:300}
        .resp-badge{display:inline-flex;align-items:center;gap:.35rem;margin-top:.75rem;font-family:var(--m);font-size:.62rem;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:3px 10px}

        /* ─────────────────────────────────────────────────────────
           FOOTER — identique à HomeClient (3 colonnes)
        ───────────────────────────────────────────────────────── */
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.25rem var(--pad);max-width:1160px;margin:0 auto}
        .ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
        @media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
        .ft-tag{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.65;max-width:210px;margin-top:.4rem}
        .ft-col{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
        .ft-ul{list-style:none;display:flex;flex-direction:column;gap:.45rem}
        .ft-ul a{font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;transition:color .15s;font-weight:300}
        .ft-ul a:hover{color:var(--cyan)}
        .ft-bot{margin-top:1.75rem;padding-top:1.1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
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
          <li><a href={l("/contact")} className="active">{t.nav.contact}</a></li>
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

        {/* Hero */}
        <div className="hero">
          <div className="badge"><div className="badge-dot" />{t.badge}</div>
          <h1 className="hero-title">
            {t.title}<br /><span className="ac">{t.titleAccent}</span>
          </h1>
          <p className="hero-sub">{t.subtitle}</p>
        </div>

        {/* Grille principale */}
        <div className="main-grid">

          {/* Formulaire ou succès */}
          <div>
            {status === "success" ? (
              <div className="success-card">
                <span className="success-icon">✓</span>
                <div className="success-title">{t.success.title}</div>
                <p className="success-text">{t.success.text}</p>
                <a href={l("/comparatifs")} className="btn-outline">{t.success.cta}</a>
              </div>
            ) : (
              <div className="form-card">
                <div className="form-title">
                  {lang === "fr" ? "Envoyez-nous un message" : "Send us a message"}
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="name">{t.form.name} *</label>
                      <input id="name" type="text" placeholder={t.form.namePlaceholder}
                        value={name} onChange={e => setName(e.target.value)}
                        required disabled={status === "loading"} />
                    </div>
                    <div className="field">
                      <label htmlFor="email">{t.form.email} *</label>
                      <input id="email" type="email" placeholder={t.form.emailPlaceholder}
                        value={email} onChange={e => setEmail(e.target.value)}
                        required disabled={status === "loading"} />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="subject">{t.form.subject}</label>
                    <select id="subject" value={subject} onChange={e => setSubject(e.target.value)} disabled={status === "loading"}>
                      <option value="">{lang === "fr" ? "Choisir un sujet..." : "Choose a subject..."}</option>
                      {t.subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="message">{t.form.message} *</label>
                    <textarea id="message" placeholder={t.form.messagePlaceholder}
                      value={message} onChange={e => setMessage(e.target.value)}
                      required disabled={status === "loading"} />
                  </div>
                  <button type="submit" className="btn-submit"
                    disabled={status === "loading" || !name || !email || !message}>
                    {status === "loading" ? t.form.submitting : <>{t.form.submit} →</>}
                  </button>
                  {status === "error" && <div className="error-msg">⚠ {t.error}</div>}
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <div>
              <div className="sec-label">{t.reasons.label}</div>
              <div className="reason-cards">
                {t.reasons.items.map((item, i) => (
                  <div key={i} className="rcard">
                    <span className="rcard-icon">{item.icon}</span>
                    <div>
                      <div className="rcard-title">{item.title}</div>
                      <p className="rcard-text">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="email-card">
              <div className="email-lbl">{lang === "fr" ? "Ou directement par email" : "Or directly by email"}</div>
              <a href="mailto:contact@neuriflux.com" className="email-addr">contact@neuriflux.com</a>
              <p className="email-note">
                {lang === "fr"
                  ? "On répond à tous les messages, généralement sous 48h ouvrées."
                  : "We reply to every message, usually within 48 business hours."}
              </p>
              <div className="resp-badge">⚡ {lang === "fr" ? "Réponse sous 48h" : "Reply within 48h"}</div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── FOOTER — identique HomeClient ── */}
      <footer>
        <div className="ft">
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}>
              <div className="logo-dot" />Neuri<em>flux</em>
            </a>
            <p className="ft-tag">{t.ftTagline}</p>
          </div>
          <div>
            <div className="ft-col">{t.ftContent}</div>
            <ul className="ft-ul">
              {t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="ft-col">{t.ftLegal}</div>
            <ul className="ft-ul">
              {t.ftLegal2.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}
            </ul>
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