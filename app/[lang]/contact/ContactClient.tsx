"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Lang = "fr" | "en";
type Status = "idle" | "loading" | "success" | "error";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact:"Contact", about: "À propos" },
    badge: "On vous répond",
    title: "Une question ?",
    titleAccent: "Écrivez-nous.",
    subtitle: "Suggestion d'outil, partenariat, erreur dans un article, simple retour — on lit tout et on répond à tous les messages.",
    form: {
      name: "Votre nom",
      namePlaceholder: "Jean Dupont",
      email: "Votre email",
      emailPlaceholder: "vous@email.com",
      subject: "Sujet",
      subjectPlaceholder: "Suggestion d'outil, partenariat...",
      message: "Votre message",
      messagePlaceholder: "Décrivez votre demande en détail...",
      submit: "Envoyer le message",
      submitting: "Envoi en cours...",
    },
    subjects: [
      "Suggestion d'outil à tester",
      "Partenariat / affiliation",
      "Erreur dans un article",
      "Question sur un comparatif",
      "Autre",
    ],
    success: {
      title: "Message envoyé ! ✓",
      text: "On vous répond généralement sous 48h. En attendant, explorez nos derniers comparatifs.",
      cta: "Voir les comparatifs →",
    },
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
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    badge: "We reply to everyone",
    title: "Got a question?",
    titleAccent: "Write to us.",
    subtitle: "Tool suggestion, partnership, error in an article, simple feedback — we read everything and reply to every message.",
    form: {
      name: "Your name",
      namePlaceholder: "John Smith",
      email: "Your email",
      emailPlaceholder: "you@email.com",
      subject: "Subject",
      subjectPlaceholder: "Tool suggestion, partnership...",
      message: "Your message",
      messagePlaceholder: "Describe your request in detail...",
      submit: "Send message",
      submitting: "Sending...",
    },
    subjects: [
      "Tool suggestion",
      "Partnership / affiliation",
      "Error in an article",
      "Question about a comparison",
      "Other",
    ],
    success: {
      title: "Message sent! ✓",
      text: "We usually reply within 48 hours. In the meantime, browse our latest comparisons.",
      cta: "See comparisons →",
    },
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

export default function ContactClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--border:rgba(255,255,255,0.07);--border-glow:rgba(0,230,190,0.25);--cyan:#00e6be;--cyan-dim:rgba(0,230,190,0.12);--cyan-glow:rgba(0,230,190,0.35);--text:#f0f4f8;--text-muted:#6b7a8d;--text-dim:#3d4f61;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace;--font-body:'Lora',serif}
        html{scroll-behavior:smooth}body{background:var(--bg);color:var(--text);font-family:var(--font-display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,0.02) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
        .glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(ellipse,rgba(0,230,190,0.06) 0%,transparent 70%);pointer-events:none;z-index:0}

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

        .hero{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem) clamp(2rem,4vw,3rem)}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-mono);font-size:.7rem;letter-spacing:.08em;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:100px;padding:6px 14px;margin-bottom:1.75rem}
        .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:pulse 2s infinite}
        .hero-title{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;line-height:1.05;letter-spacing:-.04em;margin-bottom:1rem}
        .accent{color:var(--cyan)}
        .hero-sub{font-family:var(--font-mono);font-size:clamp(.85rem,1.5vw,.95rem);font-weight:300;color:var(--text-muted);line-height:1.7;max-width:560px}

        .main-grid{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:0 clamp(1.5rem,5vw,4rem) clamp(4rem,8vw,6rem);display:grid;grid-template-columns:1fr 380px;gap:3rem;align-items:start}
        @media(max-width:860px){.main-grid{grid-template-columns:1fr}}

        /* FORM */
        .form-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:2rem;position:relative;overflow:hidden}
        .form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .form-title{font-family:var(--font-display);font-size:1.1rem;font-weight:700;letter-spacing:-.02em;color:var(--text);margin-bottom:1.75rem}
        .field{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.25rem}
        .field label{font-family:var(--font-mono);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--text-dim)}
        .field input,.field textarea,.field select{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);font-family:var(--font-mono);font-size:.84rem;font-weight:300;outline:none;transition:all .2s;width:100%;appearance:none;-webkit-appearance:none}
        .field input:focus,.field textarea:focus,.field select:focus{border-color:var(--border-glow);box-shadow:0 0 0 3px rgba(0,230,190,0.07)}
        .field input::placeholder,.field textarea::placeholder{color:var(--text-dim)}
        .field textarea{resize:vertical;min-height:130px;line-height:1.6}
        .field select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7a8d' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;cursor:pointer}
        .field select option{background:var(--bg3);color:var(--text)}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        @media(max-width:540px){.field-row{grid-template-columns:1fr}}
        .btn-submit{width:100%;background:var(--cyan);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:.9rem;padding:13px;border-radius:10px;border:none;cursor:pointer;transition:all .2s;letter-spacing:-.01em;margin-top:.5rem;display:flex;align-items:center;justify-content:center;gap:.5rem}
        .btn-submit:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--cyan-glow)}
        .btn-submit:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
        .error-msg{font-family:var(--font-mono);font-size:.78rem;color:#ef4444;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 14px;margin-top:1rem}

        /* SUCCESS */
        .success-card{background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:16px;padding:2.5rem;text-align:center;position:relative;overflow:hidden}
        .success-card::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .success-icon{font-size:2.5rem;margin-bottom:1rem;display:block}
        .success-title{font-size:1.25rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.75rem;color:var(--cyan)}
        .success-text{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);line-height:1.6;margin-bottom:1.5rem;font-weight:300}
        .btn-outline{display:inline-flex;align-items:center;background:transparent;color:var(--cyan);font-family:var(--font-display);font-weight:700;font-size:.85rem;padding:10px 20px;border-radius:8px;text-decoration:none;border:1px solid var(--border-glow);transition:all .2s}
        .btn-outline:hover{background:var(--cyan-dim);transform:translateY(-1px)}

        /* SIDEBAR */
        .sidebar{display:flex;flex-direction:column;gap:1rem}
        .section-label{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.5rem}
        .section-label::before{content:'';display:inline-block;width:20px;height:1px;background:var(--cyan)}

        .reason-cards{display:flex;flex-direction:column;gap:.75rem}
        .reason-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.25rem;display:flex;gap:1rem;align-items:flex-start;transition:border-color .2s}
        .reason-card:hover{border-color:var(--border-glow)}
        .reason-icon{font-size:1.3rem;flex-shrink:0;margin-top:.1rem}
        .reason-title{font-family:var(--font-display);font-size:.9rem;font-weight:700;letter-spacing:-.01em;color:var(--text);margin-bottom:.3rem}
        .reason-text{font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted);font-weight:300;line-height:1.5}

        .email-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.5rem}
        .email-label{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:.5rem}
        .email-addr{font-family:var(--font-mono);font-size:.85rem;color:var(--cyan);font-weight:500;text-decoration:none;transition:opacity .2s;display:block;margin-bottom:1rem}
        .email-addr:hover{opacity:.8}
        .email-note{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim);line-height:1.5;font-weight:300}
        .resp-badge{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-mono);font-size:.65rem;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:100px;padding:3px 10px;margin-top:.75rem}

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
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/contact")} className="active">{lang === "fr" ? "Contact" : "Contact"}</a></li>          
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
          {t.title}<br /><span className="accent">{t.titleAccent}</span>
        </h1>
        <p className="hero-sub">{t.subtitle}</p>
      </div>

      {/* ─── MAIN GRID ────────────────────────────────────────────────────── */}
      <div className="main-grid">

        {/* ─── FORM ───────────────────────────────────────────────────────── */}
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
                    <input
                      id="name"
                      type="text"
                      placeholder={t.form.namePlaceholder}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      disabled={status === "loading"}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">{t.form.email} *</label>
                    <input
                      id="email"
                      type="email"
                      placeholder={t.form.emailPlaceholder}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      disabled={status === "loading"}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="subject">{t.form.subject}</label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={status === "loading"}
                  >
                    <option value="">{lang === "fr" ? "Choisir un sujet..." : "Choose a subject..."}</option>
                    {t.subjects.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="message">{t.form.message} *</label>
                  <textarea
                    id="message"
                    placeholder={t.form.messagePlaceholder}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    disabled={status === "loading"}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={status === "loading" || !name || !email || !message}
                >
                  {status === "loading" ? (
                    <>{t.form.submitting}</>
                  ) : (
                    <>{t.form.submit} →</>
                  )}
                </button>

                {status === "error" && (
                  <div className="error-msg">⚠ {t.error}</div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* ─── SIDEBAR ────────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div>
            <div className="section-label">{t.reasons.label}</div>
            <div className="reason-cards">
              {t.reasons.items.map((item, i) => (
                <div key={i} className="reason-card">
                  <span className="reason-icon">{item.icon}</span>
                  <div>
                    <div className="reason-title">{item.title}</div>
                    <p className="reason-text">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="email-card">
            <div className="email-label">
              {lang === "fr" ? "Ou directement par email" : "Or directly by email"}
            </div>
            <a href="mailto:contact@neuriflux.com" className="email-addr">
              contact@neuriflux.com
            </a>
            <p className="email-note">
              {lang === "fr"
                ? "On répond à tous les messages, généralement sous 48h ouvrées."
                : "We reply to every message, usually within 48 business hours."}
            </p>
            <div className="resp-badge">
              ⚡ {lang === "fr" ? "Réponse sous 48h" : "Reply within 48h"}
            </div>
          </div>
        </aside>
      </div>

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