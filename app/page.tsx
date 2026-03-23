"use client";

import { useState, useEffect, useRef } from "react";

// ─── Translations ────────────────────────────────────────────────────────────
const translations = {
  fr: {
    nav: {
      blog: "Blog",
      comparatifs: "Comparatifs",
      outils: "Outils IA",
      newsletter: "Newsletter",
    },
    hero: {
      badge: "Média indépendant · Tests réels",
      title1: "Les meilleurs",
      title2: "outils IA",
      title3: "enfin comparés honnêtement.",
      subtitle:
        "Neuriflux teste, compare et décortique les outils IA pour vous faire gagner du temps — et de l'argent. Sans bullshit.",
      cta1: "Voir les comparatifs",
      cta2: "Lire le blog",
      stats: [
        { value: "120+", label: "Outils testés" },
        { value: "48h", label: "Délai de test moyen" },
        { value: "100%", label: "Tests indépendants" },
      ],
    },
    categories: {
      title: "Explorez par catégorie",
      subtitle: "Des tests approfondis sur chaque segment du marché IA",
      items: [
        {
          icon: "✍️",
          title: "Rédaction & Contenu",
          desc: "ChatGPT, Claude, Jasper, Copy.ai et tous les autres — comparés sur des cas réels.",
          count: "24 outils",
          href: "/comparatifs/redaction",
        },
        {
          icon: "💻",
          title: "Code & Développement",
          desc: "Cursor, GitHub Copilot, Codeium — quel assistant dev vaut vraiment son prix ?",
          count: "18 outils",
          href: "/comparatifs/code",
        },
        {
          icon: "🎨",
          title: "Image & Design",
          desc: "Midjourney, DALL-E, Stable Diffusion — benchmarks visuels et comparatifs honnêtes.",
          count: "15 outils",
          href: "/comparatifs/image",
        },
        {
          icon: "📊",
          title: "Productivité & Business",
          desc: "Notion AI, Zapier, Make — automatisez votre workflow sans vous ruiner.",
          count: "21 outils",
          href: "/comparatifs/productivite",
        },
        {
          icon: "🤖",
          title: "Chatbots & Assistants",
          desc: "Tous les LLMs sous le capot — vitesse, précision, prix, limites.",
          count: "12 outils",
          href: "/comparatifs/chatbots",
        },
        {
          icon: "🎙️",
          title: "Audio & Voix",
          desc: "ElevenLabs, Murf, Whisper — la synthèse vocale IA à la loupe.",
          count: "9 outils",
          href: "/comparatifs/audio",
        },
      ],
    },
    featured: {
      title: "Comparatifs populaires",
      subtitle: "Les articles les plus lus cette semaine",
      badge: "Populaire",
      readMore: "Lire →",
      articles: [
        {
          tag: "Chatbots",
          title: "ChatGPT vs Claude vs Gemini : lequel choisir en 2026 ?",
          desc: "On a testé les trois sur 50 cas d'usage réels. Les résultats sont surprenants.",
          time: "12 min",
        },
        {
          tag: "Code",
          title: "Cursor AI : le meilleur assistant dev en 2026 ?",
          desc: "6 mois d'utilisation intensive. Notre verdict sans filtre sur l'outil qui affole les devs.",
          time: "9 min",
        },
        {
          tag: "Rédaction",
          title: "Les 7 meilleures alternatives gratuites à ChatGPT",
          desc: "Budget zéro, résultats max. On a testé tout ce qui existe pour vous.",
          time: "7 min",
        },
      ],
    },
    newsletter: {
      title: "Le radar IA de la semaine",
      subtitle:
        "Chaque lundi, les meilleurs outils IA, les comparatifs qui comptent, et les deals à ne pas rater. Aucun spam. Désabonnement en 1 clic.",
      placeholder: "votre@email.com",
      cta: "Je m'abonne",
      social: "Déjà 3 200+ lecteurs",
    },
    footer: {
      tagline: "Le média indépendant des outils IA.",
      links: {
        produit: {
          title: "Contenu",
          items: ["Blog", "Comparatifs", "Newsletter"],
        },
        legal: {
          title: "Légal",
          items: ["Mentions légales", "Confidentialité", "Cookies"],
        },
      },
      rights: "Tous droits réservés.",
    },
  },
  en: {
    nav: {
      blog: "Blog",
      comparatifs: "Comparisons",
      outils: "AI Tools",
      newsletter: "Newsletter",
    },
    hero: {
      badge: "Independent media · Real tests",
      title1: "The best",
      title2: "AI tools",
      title3: "finally compared honestly.",
      subtitle:
        "Neuriflux tests, compares and breaks down AI tools to save you time — and money. No bullshit.",
      cta1: "Browse comparisons",
      cta2: "Read the blog",
      stats: [
        { value: "120+", label: "Tools tested" },
        { value: "48h", label: "Average test time" },
        { value: "100%", label: "Independent tests" },
      ],
    },
    categories: {
      title: "Browse by category",
      subtitle: "In-depth reviews across every AI market segment",
      items: [
        {
          icon: "✍️",
          title: "Writing & Content",
          desc: "ChatGPT, Claude, Jasper, Copy.ai and more — compared on real use cases.",
          count: "24 tools",
          href: "/comparatifs/redaction",
        },
        {
          icon: "💻",
          title: "Code & Development",
          desc: "Cursor, GitHub Copilot, Codeium — which dev assistant is actually worth it?",
          count: "18 tools",
          href: "/comparatifs/code",
        },
        {
          icon: "🎨",
          title: "Image & Design",
          desc: "Midjourney, DALL-E, Stable Diffusion — visual benchmarks and honest comparisons.",
          count: "15 tools",
          href: "/comparatifs/image",
        },
        {
          icon: "📊",
          title: "Productivity & Business",
          desc: "Notion AI, Zapier, Make — automate your workflow without breaking the bank.",
          count: "21 tools",
          href: "/comparatifs/productivite",
        },
        {
          icon: "🤖",
          title: "Chatbots & Assistants",
          desc: "All LLMs under the hood — speed, accuracy, pricing, limits.",
          count: "12 tools",
          href: "/comparatifs/chatbots",
        },
        {
          icon: "🎙️",
          title: "Audio & Voice",
          desc: "ElevenLabs, Murf, Whisper — AI voice synthesis under the microscope.",
          count: "9 tools",
          href: "/comparatifs/audio",
        },
      ],
    },
    featured: {
      title: "Popular comparisons",
      subtitle: "Most read articles this week",
      badge: "Popular",
      readMore: "Read →",
      articles: [
        {
          tag: "Chatbots",
          title: "ChatGPT vs Claude vs Gemini: which to choose in 2026?",
          desc: "We tested all three on 50 real use cases. The results are surprising.",
          time: "12 min",
        },
        {
          tag: "Code",
          title: "Cursor AI: best dev assistant in 2026?",
          desc: "6 months of intensive use. Our unfiltered verdict on the tool every dev is talking about.",
          time: "9 min",
        },
        {
          tag: "Writing",
          title: "7 best free alternatives to ChatGPT",
          desc: "Zero budget, maximum results. We tested everything out there for you.",
          time: "7 min",
        },
      ],
    },
    newsletter: {
      title: "The weekly AI radar",
      subtitle:
        "Every Monday: the best AI tools, comparisons that matter, and deals you don't want to miss. No spam. Unsubscribe anytime.",
      placeholder: "your@email.com",
      cta: "Subscribe",
      social: "3,200+ readers already",
    },
    footer: {
      tagline: "The independent AI tools media.",
      links: {
        produit: {
          title: "Content",
          items: ["Blog", "Comparisons", "Newsletter"],
        },
        legal: {
          title: "Legal",
          items: ["Legal notice", "Privacy", "Cookies"],
        },
      },
      rights: "All rights reserved.",
    },
  },
};

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const num = parseInt(value.replace(/\D/g, ""));
    const suffix = value.replace(/[0-9]/g, "");
    if (isNaN(num)) { setDisplay(value); return; }
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * num) + suffix);
      if (progress < 1) requestAnimationFrame((t) => step(t, startTime));
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame((t) => step(t, t));
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function HomePage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    setLang(browserLang.startsWith("fr") ? "fr" : "en");
  }, []);

  const t = translations[lang];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080c10;
          --bg2: #0d1117;
          --bg3: #111820;
          --border: rgba(255,255,255,0.07);
          --border-glow: rgba(0,230,190,0.25);
          --cyan: #00e6be;
          --cyan-dim: rgba(0,230,190,0.12);
          --cyan-glow: rgba(0,230,190,0.35);
          --text: #f0f4f8;
          --text-muted: #6b7a8d;
          --text-dim: #3d4f61;
          --font-display: 'Syne', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-display);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* Grid background */
        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,230,190,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,230,190,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* Radial glow */
        .radial-glow {
          position: fixed;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(0,230,190,0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* NAV */
        nav {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(8,12,16,0.85);
          border-bottom: 1px solid var(--border);
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.2rem;
          letter-spacing: -0.02em;
          color: var(--text);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-logo span {
          color: var(--cyan);
        }

        .nav-logo-dot {
          width: 7px;
          height: 7px;
          background: var(--cyan);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--cyan);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
          list-style: none;
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-links.open {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 64px;
            left: 0; right: 0;
            background: var(--bg2);
            border-bottom: 1px solid var(--border);
            padding: 1.5rem 2rem;
            gap: 1.2rem;
          }
        }

        .nav-links a {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 400;
          color: var(--text-muted);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: var(--cyan); }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .lang-toggle {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 4px;
          display: flex;
          gap: 2px;
        }

        .lang-btn {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: var(--text-muted);
        }

        .lang-btn.active {
          background: var(--cyan);
          color: var(--bg);
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          padding: 6px;
          background: none;
          border: none;
        }

        @media (max-width: 768px) { .hamburger { display: flex; } }

        .hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--text-muted);
          border-radius: 2px;
          transition: all 0.3s;
        }

        /* HERO */
        .hero {
          position: relative;
          z-index: 1;
          padding: clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 8vw, 7rem);
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: var(--cyan);
          background: var(--cyan-dim);
          border: 1px solid var(--border-glow);
          border-radius: 100px;
          padding: 6px 14px;
          margin-bottom: 2rem;
          animation: fadeDown 0.6s ease both;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-title {
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.7s 0.1s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-title .accent {
          color: var(--cyan);
          position: relative;
          display: inline-block;
        }

        .hero-title .accent::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--cyan);
          opacity: 0.4;
          border-radius: 2px;
        }

        .hero-subtitle {
          font-family: var(--font-mono);
          font-size: clamp(0.9rem, 1.8vw, 1.05rem);
          font-weight: 300;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 580px;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.7s 0.2s ease both;
        }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 4rem;
          animation: fadeUp 0.7s 0.3s ease both;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--cyan);
          color: var(--bg);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
          padding: 14px 28px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          letter-spacing: -0.01em;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px var(--cyan-glow);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          color: var(--text);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 14px 28px;
          border-radius: 8px;
          border: 1px solid var(--border);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          border-color: var(--border-glow);
          background: var(--cyan-dim);
          color: var(--cyan);
        }

        .hero-stats {
          display: flex;
          gap: clamp(2rem, 5vw, 4rem);
          flex-wrap: wrap;
          animation: fadeUp 0.7s 0.4s ease both;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .stat-value {
          font-size: clamp(1.8rem, 4vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text);
          font-family: var(--font-display);
        }

        .stat-value span { color: var(--cyan); }

        .stat-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .stat-divider {
          width: 1px;
          background: var(--border);
          align-self: stretch;
        }

        /* SECTION */
        section {
          position: relative;
          z-index: 1;
          padding: clamp(3rem, 7vw, 6rem) clamp(1.5rem, 5vw, 4rem);
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 3rem;
        }

        .section-tag {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-tag::before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background: var(--cyan);
        }

        .section-title {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 0.75rem;
        }

        .section-subtitle {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 300;
          line-height: 1.6;
        }

        /* CATEGORIES GRID */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .category-card {
          background: var(--bg2);
          padding: 1.75rem;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
          display: block;
          position: relative;
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--cyan);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .category-card:hover { background: var(--bg3); }
        .category-card:hover::before { transform: scaleX(1); }

        .category-icon {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          display: block;
        }

        .category-title {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          color: var(--text);
        }

        .category-desc {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.6;
          font-weight: 300;
          margin-bottom: 1rem;
        }

        .category-count {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--cyan);
          letter-spacing: 0.06em;
          background: var(--cyan-dim);
          border: 1px solid var(--border-glow);
          padding: 3px 10px;
          border-radius: 100px;
          display: inline-block;
        }

        /* FEATURED ARTICLES */
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .article-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.75rem;
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          overflow: hidden;
        }

        .article-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: radial-gradient(circle at 50% 0%, var(--cyan-dim), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .article-card:hover {
          border-color: var(--border-glow);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }

        .article-card:hover::after { opacity: 1; }

        .article-tag {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cyan);
          font-weight: 500;
        }

        .article-title {
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.3;
          color: var(--text);
          position: relative;
          z-index: 1;
        }

        .article-desc {
          font-family: var(--font-mono);
          font-size: 0.77rem;
          color: var(--text-muted);
          line-height: 1.6;
          font-weight: 300;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .article-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border);
          position: relative;
          z-index: 1;
        }

        .article-time {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        .article-read {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--cyan);
          font-weight: 500;
          transition: gap 0.2s;
        }

        .article-card:hover .article-read { letter-spacing: 0.02em; }

        /* NEWSLETTER */
        .newsletter-section {
          margin: 0 clamp(1.5rem, 5vw, 4rem) 6rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .newsletter-inner {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: clamp(2.5rem, 5vw, 4rem);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .newsletter-inner::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
        }

        .newsletter-glow {
          position: absolute;
          top: -40%;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(0,230,190,0.08), transparent 70%);
          pointer-events: none;
        }

        .newsletter-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .newsletter-subtitle {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 300;
          line-height: 1.7;
          max-width: 500px;
          margin: 0 auto 2rem;
          position: relative;
          z-index: 1;
        }

        .newsletter-form {
          display: flex;
          gap: 0.75rem;
          max-width: 440px;
          margin: 0 auto 1rem;
          position: relative;
          z-index: 1;
          flex-wrap: wrap;
          justify-content: center;
        }

        .newsletter-input {
          flex: 1;
          min-width: 200px;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 0.82rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .newsletter-input:focus { border-color: var(--border-glow); }
        .newsletter-input::placeholder { color: var(--text-dim); }

        .newsletter-social {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-dim);
          position: relative;
          z-index: 1;
        }

        .newsletter-social span { color: var(--cyan); }

        .success-msg {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--cyan);
          background: var(--cyan-dim);
          border: 1px solid var(--border-glow);
          border-radius: 8px;
          padding: 12px 20px;
          display: inline-block;
          position: relative;
          z-index: 1;
        }

        /* FOOTER */
        footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid var(--border);
          padding: 3rem clamp(1.5rem, 5vw, 4rem);
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
        }

        @media (max-width: 640px) {
          .footer-inner { grid-template-columns: 1fr; gap: 2rem; }
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-tagline {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 300;
          line-height: 1.6;
          max-width: 240px;
        }

        .footer-col-title {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 1rem;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .footer-links a {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 300;
        }

        .footer-links a:hover { color: var(--cyan); }

        .footer-bottom {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-copy {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-dim);
          font-weight: 300;
        }

        .footer-copy span { color: var(--cyan); }
      `}</style>

      <div className="grid-bg" />
      <div className="radial-glow" />

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">
          <div className="nav-logo-dot" />
          Neuri<span>flux</span>
        </a>

        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href="/blog">{t.nav.blog}</a></li>
          <li><a href="/comparatifs">{t.nav.comparatifs}</a></li>
          <li><a href="/newsletter">{t.nav.newsletter}</a></li>
        </ul>

        <div className="nav-right">
          <div className="lang-toggle">
            <button
              className={`lang-btn${lang === "fr" ? " active" : ""}`}
              onClick={() => setLang("fr")}
            >FR</button>
            <button
              className={`lang-btn${lang === "en" ? " active" : ""}`}
              onClick={() => setLang("en")}
            >EN</button>
          </div>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">
          <span style={{ width: 6, height: 6, background: "var(--cyan)", borderRadius: "50%", display: "inline-block" }} />
          {t.hero.badge}
        </div>

        <h1 className="hero-title">
          {t.hero.title1}{" "}
          <span className="accent">{t.hero.title2}</span>
          <br />
          {t.hero.title3}
        </h1>

        <p className="hero-subtitle">{t.hero.subtitle}</p>

        <div className="hero-ctas">
          <a href="/comparatifs" className="btn-primary">
            {t.hero.cta1} →
          </a>
          <a href="/blog" className="btn-secondary">
            {t.hero.cta2}
          </a>
        </div>

        <div className="hero-stats">
          {t.hero.stats.map((stat, i) => (
            <>
              {i > 0 && <div key={`div-${i}`} className="stat-divider" />}
              <div key={i} className="stat">
                <div className="stat-value">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}

      {/* FEATURED */}
      <section>
        <div className="section-header">
          <div className="section-tag">{t.featured.badge}</div>
          <h2 className="section-title">{t.featured.title}</h2>
          <p className="section-subtitle">{t.featured.subtitle}</p>
        </div>

        <div className="articles-grid">
          {t.featured.articles.map((article, i) => (
            <a key={i} href="/blog" className="article-card">
              <div className="article-tag">{article.tag}</div>
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

      {/* NEWSLETTER */}
      <div className="newsletter-section">
        <div className="newsletter-inner">
          <div className="newsletter-glow" />
          <h2 className="newsletter-title">{t.newsletter.title}</h2>
          <p className="newsletter-subtitle">{t.newsletter.subtitle}</p>

          {subscribed ? (
            <p className="success-msg">✓ {lang === "fr" ? "Bienvenue ! À lundi prochain." : "Welcome! See you next Monday."}</p>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="newsletter-input"
                placeholder={t.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">{t.newsletter.cta}</button>
            </form>
          )}

          <p className="newsletter-social">
            <span>3 200+</span> {lang === "fr" ? "lecteurs cette semaine" : "readers this week"}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="nav-logo" style={{ fontSize: "1rem" }}>
              <div className="nav-logo-dot" />
              Neuri<span>flux</span>
            </a>
            <p className="footer-tagline">{t.footer.tagline}</p>
          </div>

          <div>
            <div className="footer-col-title">{t.footer.links.produit.title}</div>
            <ul className="footer-links">
              {t.footer.links.produit.items.map((item, i) => (
                <li key={i}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-col-title">{t.footer.links.legal.title}</div>
            <ul className="footer-links">
              {t.footer.links.legal.items.map((item, i) => (
                <li key={i}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © 2026 <span>Neuriflux</span>. {t.footer.rights}
          </p>
          <p className="footer-copy">
            {lang === "fr" ? "Fait avec" : "Made with"} <span>♥</span> {lang === "fr" ? "en France" : "in France"}
          </p>
        </div>
      </footer>
    </>
  );
}