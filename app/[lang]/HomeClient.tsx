"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNewsletter } from "../../lib/useNewsletter";

type Lang = "fr" | "en";

const translations = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact:"Contact", about: "A propos" },
    hero: {
      badge: "Média indépendant · Tests réels",
      title1: "Les meilleurs", title2: "outils IA", title3: "enfin comparés honnêtement.",
      subtitle: "Neuriflux teste, compare et décortique les outils IA pour vous faire gagner du temps — et de l'argent. Sans bullshit.",
      cta1: "Voir les comparatifs", cta2: "Lire le blog",
      stats: [{ value: "120+", label: "Outils testés" }, { value: "48h", label: "Délai de test moyen" }, { value: "100%", label: "Tests indépendants" }],
    },
    categories: {
      title: "Explorez par catégorie", subtitle: "Des tests approfondis sur chaque segment du marché IA", tag: "Catégories",
      items: [
        { icon: "✍️", title: "Rédaction & Contenu", desc: "ChatGPT, Claude, Jasper, Copy.ai et tous les autres — comparés sur des cas réels.", count: "24 outils", href: "/comparatifs" },
        { icon: "💻", title: "Code & Développement", desc: "Cursor, GitHub Copilot, Codeium — quel assistant dev vaut vraiment son prix ?", count: "18 outils", href: "/comparatifs" },
        { icon: "🎨", title: "Image & Design", desc: "Midjourney, DALL-E, Stable Diffusion — benchmarks visuels et comparatifs honnêtes.", count: "15 outils", href: "/comparatifs" },
        { icon: "📊", title: "Productivité & Business", desc: "Notion AI, Zapier, Make — automatisez votre workflow sans vous ruiner.", count: "21 outils", href: "/comparatifs" },
        { icon: "🤖", title: "Chatbots & Assistants", desc: "Tous les LLMs sous le capot — vitesse, précision, prix, limites.", count: "12 outils", href: "/comparatifs" },
        { icon: "🎙️", title: "Audio & Voix", desc: "ElevenLabs, Murf, Whisper — la synthèse vocale IA à la loupe.", count: "9 outils", href: "/comparatifs" },
      ],
    },
    featured: {
      title: "Comparatifs populaires", subtitle: "Les articles les plus lus cette semaine", badge: "Populaire", readMore: "Lire →",
      articles: [
        { slug: "chatgpt-vs-claude-vs-gemini-2026", tag: "Chatbots", title: "ChatGPT vs Claude vs Gemini : lequel choisir en 2026 ?", desc: "On a testé les trois sur 50 cas d'usage réels. Les résultats sont surprenants.", time: "12 min" },
        { slug: "cursor-ai-review-2026", tag: "Code", title: "Cursor AI : le meilleur assistant dev en 2026 ?", desc: "6 mois d'utilisation intensive. Notre verdict sans filtre sur l'outil qui affole les devs.", time: "9 min" },
        { slug: "alternatives-gratuites-chatgpt", tag: "Chatbots", title: "Les 7 meilleures alternatives gratuites à ChatGPT", desc: "Budget zéro, résultats max. On a testé tout ce qui existe pour vous.", time: "7 min" },
      ],
    },
    newsletter: {
      title: "Le radar IA de la semaine",
      subtitle: "Chaque lundi, les meilleurs outils IA, les comparatifs qui comptent, et les deals à ne pas rater. Aucun spam. Désabonnement en 1 clic.",
      placeholder: "votre@email.com",
      cta: "Je m'abonne",
      ctaLoading: "...",
      social: "Déjà 3 200+ lecteurs",
      success: "✓ Bienvenue ! À lundi prochain.",
      error: "Une erreur s'est produite. Réessayez.",
    },
    footer: {
      tagline: "Le média indépendant des outils IA.",
      links: {
        produit: { title: "Contenu", items: [{ label: "Blog", href: "/blog" }, { label: "Comparatifs", href: "/comparatifs" }, { label: "Newsletter", href: "/newsletter" }, { label: "Contact", href: "/contact" }, { label: "A propos", href: "/about" }] },
        legal: { title: "Légal", items: [{ label: "Mentions légales", href: "/legal" }, { label: "Confidentialité", href: "/privacy" }, { label: "Cookies", href: "/cookies" }] },
      },
      rights: "Tous droits réservés.", madeWith: "Fait avec", inFrance: "en France",
    },
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    hero: {
      badge: "Independent media · Real tests",
      title1: "The best", title2: "AI tools", title3: "finally compared honestly.",
      subtitle: "Neuriflux tests, compares and breaks down AI tools to save you time — and money. No bullshit.",
      cta1: "Browse comparisons", cta2: "Read the blog",
      stats: [{ value: "120+", label: "Tools tested" }, { value: "48h", label: "Average test time" }, { value: "100%", label: "Independent tests" }],
    },
    categories: {
      title: "Browse by category", subtitle: "In-depth reviews across every AI market segment", tag: "Categories",
      items: [
        { icon: "✍️", title: "Writing & Content", desc: "ChatGPT, Claude, Jasper, Copy.ai and more — compared on real use cases.", count: "24 tools", href: "/comparatifs" },
        { icon: "💻", title: "Code & Development", desc: "Cursor, GitHub Copilot, Codeium — which dev assistant is actually worth it?", count: "18 tools", href: "/comparatifs" },
        { icon: "🎨", title: "Image & Design", desc: "Midjourney, DALL-E, Stable Diffusion — visual benchmarks and honest comparisons.", count: "15 tools", href: "/comparatifs" },
        { icon: "📊", title: "Productivity & Business", desc: "Notion AI, Zapier, Make — automate your workflow without breaking the bank.", count: "21 tools", href: "/comparatifs" },
        { icon: "🤖", title: "Chatbots & Assistants", desc: "All LLMs under the hood — speed, accuracy, pricing, limits.", count: "12 tools", href: "/comparatifs" },
        { icon: "🎙️", title: "Audio & Voice", desc: "ElevenLabs, Murf, Whisper — AI voice synthesis under the microscope.", count: "9 tools", href: "/comparatifs" },
      ],
    },
    featured: {
      title: "Popular comparisons", subtitle: "Most read articles this week", badge: "Popular", readMore: "Read →",
      articles: [
        { slug: "chatgpt-vs-claude-vs-gemini-2026", tag: "Chatbots", title: "ChatGPT vs Claude vs Gemini: which to choose in 2026?", desc: "We tested all three on 50 real use cases. The results are surprising.", time: "12 min" },
        { slug: "cursor-ai-review-2026", tag: "Code", title: "Cursor AI: best dev assistant in 2026?", desc: "6 months of intensive use. Our unfiltered verdict on the tool every dev is talking about.", time: "9 min" },
        { slug: "alternatives-gratuites-chatgpt", tag: "Chatbots", title: "7 best free alternatives to ChatGPT", desc: "Zero budget, maximum results. We tested everything out there for you.", time: "7 min" },
      ],
    },
    newsletter: {
      title: "The weekly AI radar",
      subtitle: "Every Monday: the best AI tools, comparisons that matter, and deals you don't want to miss. No spam. Unsubscribe anytime.",
      placeholder: "your@email.com",
      cta: "Subscribe",
      ctaLoading: "...",
      social: "3,200+ readers already",
      success: "✓ Welcome! See you next Monday.",
      error: "Something went wrong. Please try again.",
    },
    footer: {
      tagline: "The independent AI tools media.",
      links: {
        produit: { title: "Content", items: [{ label: "Blog", href: "/blog" }, { label: "Comparisons", href: "/comparatifs" }, { label: "Newsletter", href: "/newsletter" }, { label: "Contact", href: "/contact" }, { label: "About", href: "/about" }] },
        legal: { title: "Legal", items: [{ label: "Legal notice", href: "/legal" }, { label: "Privacy", href: "/privacy" }, { label: "Cookies", href: "/cookies" }] },
      },
      rights: "All rights reserved.", madeWith: "Made with", inFrance: "in France",
    },
  },
};

const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", "Rédaction": "#f59e0b", Writing: "#f59e0b",
};

function AnimatedCounter({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const num = parseInt(value.replace(/\D/g, ""));
    const suffix = value.replace(/[0-9]/g, "");
    if (isNaN(num)) { setDisplay(value); return; }
    const duration = 1200;
    const step = (ts: number, t0: number) => {
      const p = Math.min((ts - t0) / duration, 1);
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * num) + suffix);
      if (p < 1) requestAnimationFrame((t) => step(t, t0));
    };
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { requestAnimationFrame((t) => step(t, t)); obs.disconnect(); }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{display}</span>;
}

export default function HomeClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = translations[lang];
  const l = (path: string) => `/${lang}${path}`;

  // ─── Hook newsletter → Supabase ───────────────────────────────────────────
  const { status, subscribe } = useNewsletter("homepage");

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(email, lang);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--border:rgba(255,255,255,0.07);--border-glow:rgba(0,230,190,0.25);--cyan:#00e6be;--cyan-dim:rgba(0,230,190,0.12);--cyan-glow:rgba(0,230,190,0.35);--text:#f0f4f8;--text-muted:#6b7a8d;--text-dim:#3d4f61;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace}
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--font-display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
        .radial-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:800px;height:600px;background:radial-gradient(ellipse,rgba(0,230,190,0.07) 0%,transparent 70%);pointer-events:none;z-index:0}
        nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(8,12,16,0.85);border-bottom:1px solid var(--border);padding:0 clamp(1.5rem,5vw,4rem);height:64px;display:flex;align-items:center;justify-content:space-between}
        .nav-logo{font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:-0.02em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.5rem}
        .nav-logo span{color:var(--cyan)}
        .nav-logo-dot{width:7px;height:7px;background:var(--cyan);border-radius:50%;box-shadow:0 0 10px var(--cyan);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none}
        @media(max-width:768px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.5rem 2rem;gap:1.2rem}}
        .nav-links a{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);text-decoration:none;letter-spacing:.04em;transition:color .2s}
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        .lang-toggle{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px;display:flex;gap:2px}
        .lang-btn{font-family:var(--font-mono);font-size:.7rem;font-weight:500;padding:4px 10px;border-radius:4px;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--text-muted)}
        .lang-btn.active{background:var(--cyan);color:var(--bg)}
        .hamburger{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}
        @media(max-width:768px){.hamburger{display:flex}}
        .hamburger span{display:block;width:20px;height:2px;background:var(--text-muted);border-radius:2px}
        .hero{position:relative;z-index:1;padding:clamp(5rem,12vw,9rem) clamp(1.5rem,5vw,4rem) clamp(4rem,8vw,7rem);max-width:1200px;margin:0 auto}
        .hero-badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-mono);font-size:.72rem;letter-spacing:.08em;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:100px;padding:6px 14px;margin-bottom:2rem;animation:fadeDown .6s ease both}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        .hero-title{font-size:clamp(2.8rem,7vw,5.5rem);font-weight:800;line-height:1.05;letter-spacing:-.03em;margin-bottom:1.5rem;animation:fadeUp .7s .1s ease both}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hero-title .accent{color:var(--cyan);position:relative;display:inline-block}
        .hero-title .accent::after{content:'';position:absolute;bottom:4px;left:0;right:0;height:3px;background:var(--cyan);opacity:.4;border-radius:2px}
        .hero-subtitle{font-family:var(--font-mono);font-size:clamp(.9rem,1.8vw,1.05rem);font-weight:300;color:var(--text-muted);line-height:1.7;max-width:580px;margin-bottom:2.5rem;animation:fadeUp .7s .2s ease both}
        .hero-ctas{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:4rem;animation:fadeUp .7s .3s ease both}
        .btn-primary{display:inline-flex;align-items:center;gap:.5rem;background:var(--cyan);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:.9rem;padding:14px 28px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;transition:all .2s;letter-spacing:-.01em}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px var(--cyan-glow)}
        .btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-secondary{display:inline-flex;align-items:center;gap:.5rem;background:transparent;color:var(--text);font-family:var(--font-display);font-weight:600;font-size:.9rem;padding:14px 28px;border-radius:8px;border:1px solid var(--border);cursor:pointer;text-decoration:none;transition:all .2s}
        .btn-secondary:hover{border-color:var(--border-glow);background:var(--cyan-dim);color:var(--cyan)}
        .hero-stats{display:flex;gap:clamp(2rem,5vw,4rem);flex-wrap:wrap;animation:fadeUp .7s .4s ease both}
        .stat{display:flex;flex-direction:column;gap:.2rem}
        .stat-value{font-size:clamp(1.8rem,4vw,2.4rem);font-weight:800;letter-spacing:-.04em;color:var(--text);font-family:var(--font-display)}
        .stat-label{font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted);letter-spacing:.06em;text-transform:uppercase}
        .stat-divider{width:1px;background:var(--border);align-self:stretch}
        section{position:relative;z-index:1;padding:clamp(3rem,7vw,6rem) clamp(1.5rem,5vw,4rem);max-width:1200px;margin:0 auto}
        .section-header{margin-bottom:3rem}
        .section-tag{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem}
        .section-tag::before{content:'';display:inline-block;width:20px;height:1px;background:var(--cyan)}
        .section-title{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:.75rem}
        .section-subtitle{font-family:var(--font-mono);font-size:.85rem;color:var(--text-muted);font-weight:300;line-height:1.6}
        .categories-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden}
        .category-card{background:var(--bg2);padding:1.75rem;cursor:pointer;transition:background .2s;text-decoration:none;display:block;position:relative;overflow:hidden}
        .category-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--cyan);transform:scaleX(0);transform-origin:left;transition:transform .3s ease}
        .category-card:hover{background:var(--bg3)}.category-card:hover::before{transform:scaleX(1)}
        .category-icon{font-size:1.8rem;margin-bottom:1rem;display:block}
        .category-title{font-size:1rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.5rem;color:var(--text)}
        .category-desc{font-family:var(--font-mono);font-size:.76rem;color:var(--text-muted);line-height:1.6;font-weight:300;margin-bottom:1rem}
        .category-count{font-family:var(--font-mono);font-size:.68rem;color:var(--cyan);letter-spacing:.06em;background:var(--cyan-dim);border:1px solid var(--border-glow);padding:3px 10px;border-radius:100px;display:inline-block}
        .articles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
        .article-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.75rem;cursor:pointer;transition:all .25s;text-decoration:none;display:flex;flex-direction:column;gap:.75rem;position:relative;overflow:hidden}
        .article-card::after{content:'';position:absolute;inset:0;border-radius:12px;background:radial-gradient(circle at 50% 0%,var(--cyan-dim),transparent 70%);opacity:0;transition:opacity .3s}
        .article-card:hover{border-color:var(--border-glow);transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.4)}
        .article-card:hover::after{opacity:1}
        .article-tag{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;font-weight:500}
        .article-title{font-size:1.05rem;font-weight:700;letter-spacing:-.02em;line-height:1.3;color:var(--text);position:relative;z-index:1}
        .article-desc{font-family:var(--font-mono);font-size:.77rem;color:var(--text-muted);line-height:1.6;font-weight:300;flex:1;position:relative;z-index:1}
        .article-footer{display:flex;justify-content:space-between;align-items:center;padding-top:.75rem;border-top:1px solid var(--border);position:relative;z-index:1}
        .article-time{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim)}
        .article-read{font-family:var(--font-mono);font-size:.72rem;color:var(--cyan);font-weight:500}
        .newsletter-section{margin:0 auto 6rem;max-width:1200px;padding:0 clamp(1.5rem,5vw,4rem)}
        .newsletter-inner{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:clamp(2.5rem,5vw,4rem);text-align:center;position:relative;overflow:hidden}
        .newsletter-inner::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .newsletter-glow{position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:500px;height:300px;background:radial-gradient(ellipse,rgba(0,230,190,.08),transparent 70%);pointer-events:none}
        .newsletter-title{font-size:clamp(1.5rem,3vw,2rem);font-weight:800;letter-spacing:-.03em;margin-bottom:.75rem;position:relative;z-index:1}
        .newsletter-subtitle{font-family:var(--font-mono);font-size:.82rem;color:var(--text-muted);font-weight:300;line-height:1.7;max-width:500px;margin:0 auto 2rem;position:relative;z-index:1}
        .newsletter-form{display:flex;gap:.75rem;max-width:440px;margin:0 auto 1rem;position:relative;z-index:1;flex-wrap:wrap;justify-content:center}
        .newsletter-input{flex:1;min-width:200px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px 16px;color:var(--text);font-family:var(--font-mono);font-size:.82rem;outline:none;transition:border-color .2s}
        .newsletter-input:focus{border-color:var(--border-glow)}.newsletter-input::placeholder{color:var(--text-dim)}
        .newsletter-social{font-family:var(--font-mono);font-size:.72rem;color:var(--text-dim);position:relative;z-index:1}
        .newsletter-social span{color:var(--cyan)}
        .success-msg{font-family:var(--font-mono);font-size:.85rem;color:var(--cyan);background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:8px;padding:12px 20px;display:inline-block;position:relative;z-index:1}
        .error-msg{font-family:var(--font-mono);font-size:.85rem;color:#ef4444;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:12px 20px;display:inline-block;position:relative;z-index:1}
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:3rem clamp(1.5rem,5vw,4rem);max-width:1200px;margin:0 auto}
        .footer-inner{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem}
        @media(max-width:640px){.footer-inner{grid-template-columns:1fr;gap:2rem}}
        .footer-brand{display:flex;flex-direction:column;gap:.75rem}
        .footer-tagline{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);font-weight:300;line-height:1.6;max-width:240px}
        .footer-col-title{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:1rem}
        .footer-links{list-style:none;display:flex;flex-direction:column;gap:.6rem}
        .footer-links a{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);text-decoration:none;transition:color .2s;font-weight:300}
        .footer-links a:hover{color:var(--cyan)}
        .footer-bottom{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
        .footer-copy{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim);font-weight:300}
        .footer-copy span{color:var(--cyan)}
      `}</style>

      <div className="grid-bg" />
      <div className="radial-glow" />

      <nav>
        <a href={l("")} className="nav-logo"><div className="nav-logo-dot" />Neuri<span>flux</span></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")}>{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/contact")}>{t.nav.contact}</a></li>
          <li><a href={l("/about")}>{t.nav.about}</a></li>
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="lang-toggle">
            <button className={`lang-btn${lang === "fr" ? " active" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lang-btn${lang === "en" ? " active" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-badge">
          <span style={{ width: 6, height: 6, background: "var(--cyan)", borderRadius: "50%", display: "inline-block" }} />
          {t.hero.badge}
        </div>
        <h1 className="hero-title">
          {t.hero.title1} <span className="accent">{t.hero.title2}</span><br />{t.hero.title3}
        </h1>
        <p className="hero-subtitle">{t.hero.subtitle}</p>
        <div className="hero-ctas">
          <a href={l("/comparatifs")} className="btn-primary">{t.hero.cta1} →</a>
          <a href={l("/blog")} className="btn-secondary">{t.hero.cta2}</a>
        </div>
        <div className="hero-stats">
          {t.hero.stats.map((stat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "stretch", gap: "inherit" }}>
              {i > 0 && <div className="stat-divider" />}
              <div className="stat">
                <div className="stat-value"><AnimatedCounter value={stat.value} /></div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section>
        <div className="section-header">
          <div className="section-tag">{t.categories.tag}</div>
          <h2 className="section-title">{t.categories.title}</h2>
          <p className="section-subtitle">{t.categories.subtitle}</p>
        </div>
        <div className="categories-grid">
          {t.categories.items.map((cat, i) => (
            <a key={i} href={l(cat.href)} className="category-card">
              <span className="category-icon">{cat.icon}</span>
              <div className="category-title">{cat.title}</div>
              <div className="category-desc">{cat.desc}</div>
              <span className="category-count">{cat.count}</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div className="section-tag">{t.featured.badge}</div>
          <h2 className="section-title">{t.featured.title}</h2>
          <p className="section-subtitle">{t.featured.subtitle}</p>
        </div>
        <div className="articles-grid">
          {t.featured.articles.map((article, i) => (
            <a key={i} href={l(`/blog/${article.slug}`)} className="article-card">
              <div className="article-tag" style={{ color: TAG_COLORS[article.tag] || "var(--cyan)" }}>{article.tag}</div>
              <div className="article-title">{article.title}</div>
              <div className="article-desc">{article.desc}</div>
              <div className="article-footer">
                <span className="article-time">⏱ {article.time} read</span>
                <span className="article-read">{t.featured.readMore}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER → Supabase */}
      <div className="newsletter-section">
        <div className="newsletter-inner">
          <div className="newsletter-glow" />
          <h2 className="newsletter-title">{t.newsletter.title}</h2>
          <p className="newsletter-subtitle">{t.newsletter.subtitle}</p>

          {status === "success" ? (
            <p className="success-msg">{t.newsletter.success}</p>
          ) : status === "error" ? (
            <>
              <p className="error-msg">{t.newsletter.error}</p>
              <br /><br />
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input type="email" className="newsletter-input" placeholder={t.newsletter.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit" className="btn-primary">
                  {t.newsletter.cta}
                </button>
              </form>
            </>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="newsletter-input"
                placeholder={t.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
              />
              <button type="submit" className="btn-primary" disabled={status === "loading"}>
                {status === "loading" ? t.newsletter.ctaLoading : t.newsletter.cta}
              </button>
            </form>
          )}

          <p className="newsletter-social"><span>3 200+</span> {lang === "fr" ? "lecteurs cette semaine" : "readers this week"}</p>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <a href={l("")} className="nav-logo" style={{ fontSize: "1rem" }}>
              <div className="nav-logo-dot" />Neuri<span>flux</span>
            </a>
            <p className="footer-tagline">{t.footer.tagline}</p>
          </div>
          <div>
            <div className="footer-col-title">{t.footer.links.produit.title}</div>
            <ul className="footer-links">
              {t.footer.links.produit.items.map((item, i) => <li key={i}><a href={l(item.href)}>{item.label}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">{t.footer.links.legal.title}</div>
            <ul className="footer-links">
              {t.footer.links.legal.items.map((item, i) => <li key={i}><a href={l(item.href)}>{item.label}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 <span>Neuriflux</span>. {t.footer.rights}</p>
          <p className="footer-copy">{t.footer.madeWith} <span>♥</span> {t.footer.inFrance}</p>
        </div>
      </footer>
    </>
  );
}