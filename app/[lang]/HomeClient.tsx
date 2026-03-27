"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNewsletter } from "../../lib/useNewsletter";

type Lang = "fr" | "en";

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    hero: {
      badge: "Indépendant · Tests réels · Sans bullshit",
      h1a: "Les meilleurs outils IA,",
      h1b: "enfin comparés honnêtement.",
      sub: "Neuriflux teste, compare et décortique les outils IA pour vous faire gagner du temps et de l'argent.",
      cta1: "Voir les comparatifs →",
      cta2: "Lire le blog",
    },
    stats: [{ v: "120+", l: "Outils testés" }, { v: "48h", l: "Test moyen" }, { v: "100%", l: "Indépendant" }],
    social: "lecteurs · chaque lundi",
    trust: [
      { icon: "⚡", t: "Indépendant", d: "Aucun éditeur ne finance nos avis." },
      { icon: "🔬", t: "Tests réels", d: "Plusieurs semaines sur des projets concrets." },
      { icon: "💰", t: "Transparent", d: "Liens affiliés toujours signalés." },
    ],
    catTag: "Catégories",
    catTitle: "Explorer par catégorie",
    cats: [
      { icon: "✍️", t: "Rédaction & Contenu", d: "ChatGPT, Claude, Jasper — cas réels", n: "24", isNew: false },
      { icon: "💻", t: "Code & Dev", d: "Cursor, Copilot, Codeium — comparés", n: "18", isNew: true },
      { icon: "🎨", t: "Image & Design", d: "Midjourney, DALL-E, Stable Diffusion", n: "15", isNew: false },
      { icon: "📊", t: "Productivité", d: "Notion AI, Zapier, Make", n: "21", isNew: false },
      { icon: "🤖", t: "Chatbots", d: "Tous les LLMs sous le capot", n: "12", isNew: false },
      { icon: "🎙️", t: "Audio & Voix", d: "ElevenLabs, Murf, Whisper", n: "9", isNew: true },
    ],
    artTag: "Populaire",
    artTitle: "Articles les plus lus",
    artSub: "Cette semaine sur Neuriflux",
    read: "min de lecture",
    readMore: "Lire →",
    featured: "À la une",
    articles: [
      { slug: "grok-review-2026", tag: "Chatbots", color: "#00e6be", t: "Grok : avis 2026, l'IA d'Elon Musk vaut-elle vraiment le coup ?", d: "Grok 3 et 4 promettent données temps réel, 2 millions de tokens de contexte et une IA sans censure. On a tout testé pendant 3 semaines. Verdict honnête, controverse incluse.", time: "13", star: true },
      { slug: "deepseek-review-2026", tag: "Chatbots", color: "#00e6be", t: "DeepSeek : avis 2026, le meilleur ChatGPT gratuit venu de Chine ?", d: "DeepSeek a bouleversé le marché IA en janvier 2025. On a testé R1, V3 et l'API pendant des semaines. Performances, vie privée, cas d'usage — notre verdict complet et honnête.", time: "12", star: true },
      { slug: "perplexity-ai-review-2026", tag: "Chatbots", color: "#00e6be", t: "Perplexity AI : vaut-il mieux que ChatGPT et Google ?", d: "Recherche sourcée, Perplexity Pro, Perplexity Computer — notre verdict complet.", time: "13", star: true },
      { slug: "jasper-ai-review-2026", tag: "Rédaction", color: "#f59e0b", t: "Jasper AI : avis 2026 (test & prix)", d: "3 semaines de tests sur des projets réels. Notre verdict honnête.", time: "10", star: false },
      { slug: "chatgpt-vs-claude-vs-gemini-2026", tag: "Chatbots", color: "#00e6be", t: "ChatGPT vs Claude vs Gemini : lequel choisir ?", d: "50 cas d'usage réels. Les résultats sont surprenants.", time: "12", star: false },
      { slug: "elevenlabs-review-2026", tag: "Audio", color: "#ef4444", t: "ElevenLabs : meilleure synthèse vocale IA ?", d: "Voix réalistes, prix, API — tout ce qu'il faut savoir.", time: "8", star: false },
    ],
    nlTitle: "Le radar IA · chaque lundi",
    nlSub: "Les meilleurs outils, les comparatifs qui comptent, les deals à ne pas rater. Gratuit. Sans spam.",
    nlCta: "Je m'abonne gratuitement",
    nlLoading: "...",
    nlPrivacy: "Gratuit · Sans spam · Désabonnement en 1 clic",
    nlSuccess: "✓ Bienvenue ! À lundi prochain.",
    nlError: "Une erreur s'est produite. Réessayez.",
    nlPh: "votre@email.com",
    ftTagline: "Le média indépendant des outils IA.",
    ftContent: "Contenu",
    ftLegal: "Légal",
    ftLinks: [{ l: "Blog", h: "/blog" }, { l: "Comparatifs", h: "/comparatifs" }, { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "À propos", h: "/about" }],
    ftLegal2: [{ l: "Mentions légales", h: "/legal" }, { l: "Confidentialité", h: "/privacy" }, { l: "Cookies", h: "/cookies" }],
    ftRights: "Tous droits réservés.",
    ftMade: "Fait avec ♥ en France",
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    hero: {
      badge: "Independent · Real tests · No bullshit",
      h1a: "The best AI tools,",
      h1b: "finally compared honestly.",
      sub: "Neuriflux tests, compares and breaks down AI tools to save you time and money.",
      cta1: "Browse comparisons →",
      cta2: "Read the blog",
    },
    stats: [{ v: "120+", l: "Tools tested" }, { v: "48h", l: "Avg. test time" }, { v: "100%", l: "Independent" }],
    social: "readers · every Monday",
    trust: [
      { icon: "⚡", t: "Independent", d: "No publisher funds our reviews." },
      { icon: "🔬", t: "Real tests", d: "Several weeks on concrete projects." },
      { icon: "💰", t: "Transparent", d: "Affiliate links always disclosed." },
    ],
    catTag: "Categories",
    catTitle: "Browse by category",
    cats: [
      { icon: "✍️", t: "Writing & Content", d: "ChatGPT, Claude, Jasper — real use cases", n: "24", isNew: false },
      { icon: "💻", t: "Code & Dev", d: "Cursor, Copilot, Codeium — compared", n: "18", isNew: true },
      { icon: "🎨", t: "Image & Design", d: "Midjourney, DALL-E, Stable Diffusion", n: "15", isNew: false },
      { icon: "📊", t: "Productivity", d: "Notion AI, Zapier, Make", n: "21", isNew: false },
      { icon: "🤖", t: "Chatbots", d: "All LLMs under the hood", n: "12", isNew: false },
      { icon: "🎙️", t: "Audio & Voice", d: "ElevenLabs, Murf, Whisper", n: "9", isNew: true },
    ],
    artTag: "Popular",
    artTitle: "Most read articles",
    artSub: "This week on Neuriflux",
    read: "min read",
    readMore: "Read →",
    featured: "Featured",
    articles: [ 
      { slug: "grok-review-2026", tag: "Chatbots", color: "#00e6be", t: "Grok Review 2026: Is Elon Musk's AI Actually Worth It?", d: "Grok 3 and 4 promise real-time X data, a 2 million token context window, and less filtered AI. We tested everything for 3 weeks. Honest verdict, controversy included.", time: "13", star: true },
      { slug: "deepseek-review-2026", tag: "Chatbots", color: "#00e6be", t: "DeepSeek Review 2026: The Best Free ChatGPT Alternative?", d: "DeepSeek shook the AI industry in January 2025. We tested R1, V3, and the API for weeks. Performance, privacy, and real use cases — our complete, unfiltered verdict.", time: "12", star: true },
      { slug: "perplexity-ai-review-2026", tag: "Chatbots", color: "#00e6be", t: "Perplexity AI: Is It Worth It vs ChatGPT & Google?", d: "Sourced search, Perplexity Pro, Perplexity Computer — our complete verdict.", time: "13", star: true },
      { slug: "jasper-ai-review-2026", tag: "Writing", color: "#f59e0b", t: "Jasper AI Review 2026: Is It Worth It?", d: "3 weeks of real-project testing. Our honest verdict.", time: "10", star: false },
      { slug: "chatgpt-vs-claude-vs-gemini-2026", tag: "Chatbots", color: "#00e6be", t: "ChatGPT vs Claude vs Gemini: which to choose?", d: "50 real use cases. The results are surprising.", time: "12", star: false },
      { slug: "elevenlabs-review-2026", tag: "Audio", color: "#ef4444", t: "ElevenLabs: best AI voice synthesis?", d: "Realistic voices, pricing, API — everything you need to know.", time: "8", star: false },
    ],
    nlTitle: "The AI Radar · every Monday",
    nlSub: "The best tools, comparisons that matter, deals you don't want to miss. Free. No spam.",
    nlCta: "Subscribe for free",
    nlLoading: "...",
    nlPrivacy: "Free · No spam · Unsubscribe in 1 click",
    nlSuccess: "✓ Welcome! See you next Monday.",
    nlError: "Something went wrong. Please try again.",
    nlPh: "your@email.com",
    ftTagline: "The independent AI tools media.",
    ftContent: "Content",
    ftLegal: "Legal",
    ftLinks: [{ l: "Blog", h: "/blog" }, { l: "Comparisons", h: "/comparatifs" }, { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "About", h: "/about" }],
    ftLegal2: [{ l: "Legal notice", h: "/legal" }, { l: "Privacy", h: "/privacy" }, { l: "Cookies", h: "/cookies" }],
    ftRights: "All rights reserved.",
    ftMade: "Made with ♥ in France",
  },
};

const AVATARS = ["👨‍💻", "👩‍💼", "🧑‍🎨", "👩‍💻", "🧑‍🚀"];

function Counter({ value }: { value: string }) {
  const [d, setD] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const num = parseInt(value.replace(/\D/g, ""));
    const sfx = value.replace(/[0-9]/g, "");
    if (isNaN(num)) { setD(value); return; }
    const run = () => {
      if (done.current) return;
      done.current = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / 1100, 1);
        setD(Math.floor((1 - Math.pow(1 - p, 3)) * num) + sfx);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { threshold: 0.1 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [value]);
  return <span ref={ref}>{d}</span>;
}

export default function HomeClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [menu, setMenu] = useState(false);
  const t = T[lang];
  const l = (p: string) => `/${lang}${p}`;
  const { status, subscribe } = useNewsletter("homepage");

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(email, lang);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,0.06);--glow:rgba(0,230,190,0.2);
          --cyan:#00e6be;--cdim:rgba(0,230,190,0.1);
          --text:#edf2f7;--muted:#5a6a7a;--dim:#2d3d4d;
          --d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;
          --r:12px;--pad:clamp(1.5rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}

        /* grid bg */
        .bg-grid{position:fixed;inset:0;
          background-image:linear-gradient(rgba(0,230,190,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,230,190,.025) 1px,transparent 1px);
          background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-25%;left:50%;transform:translateX(-50%);
          width:700px;height:500px;
          background:radial-gradient(ellipse,rgba(0,230,190,.065) 0%,transparent 65%);
          pointer-events:none;z-index:0}

        /* NAV */
        nav{position:sticky;top:0;z-index:100;
          backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
          background:rgba(8,12,16,.9);border-bottom:1px solid var(--border);
          padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;
          color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;
          box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.5}}
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
        @media(max-width:720px){
          .nav-links{display:none}
          .nav-links.open{display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;
            background:var(--bg2);border-bottom:1px solid var(--border);padding:1.25rem var(--pad);gap:1rem}
        }
        .nav-links a{font-family:var(--m);font-size:.75rem;color:var(--muted);
          text-decoration:none;letter-spacing:.03em;transition:color .15s}
        .nav-links a:hover{color:var(--text)}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}
        .lb{font-family:var(--m);font-size:.68rem;font-weight:500;padding:4px 9px;border-radius:4px;
          border:none;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s}
        .lb.on{background:var(--cyan);color:var(--bg)}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}
        @media(max-width:720px){.hb{display:flex}}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}

        /* HERO */
        .hero{position:relative;z-index:1;max-width:1160px;margin:0 auto;
          padding:clamp(4rem,9vw,7rem) var(--pad) clamp(3rem,5vw,4.5rem)}
        .hero-wrap{max-width:680px}
        .badge{display:inline-flex;align-items:center;gap:.45rem;
          font-family:var(--m);font-size:.68rem;letter-spacing:.07em;
          color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);
          border-radius:100px;padding:5px 13px;margin-bottom:1.75rem}
        .badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        h1{font-size:clamp(2.2rem,5.5vw,3.8rem);font-weight:800;line-height:1.08;
          letter-spacing:-.04em;margin-bottom:1.25rem;color:var(--text)}
        h1 em{color:var(--cyan);font-style:normal;position:relative}
        h1 em::after{content:'';position:absolute;bottom:2px;left:0;right:0;height:2px;
          background:var(--cyan);opacity:.35;border-radius:2px}
        .hero-sub{font-family:var(--m);font-size:.88rem;font-weight:300;color:var(--muted);
          line-height:1.7;max-width:520px;margin-bottom:2rem}
        .ctas{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:2.5rem}
        .btn{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--d);
          font-weight:700;font-size:.85rem;padding:11px 22px;border-radius:8px;
          text-decoration:none;transition:all .2s;letter-spacing:-.01em;border:none;cursor:pointer}
        .btn-p{background:var(--cyan);color:var(--bg)}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,230,190,.3)}
        .btn-p:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-s{background:transparent;color:var(--text);border:1px solid var(--border)}
        .btn-s:hover{border-color:var(--glow);background:var(--cdim);color:var(--cyan)}

        /* social proof */
        .sp{display:flex;align-items:center;gap:.75rem;margin-bottom:2.5rem}
        .avs{display:flex}
        .av{width:26px;height:26px;border-radius:50%;background:var(--bg3);
          border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;
          font-size:.72rem;margin-left:-7px}
        .av:first-child{margin-left:0}
        .sp-t{font-family:var(--m);font-size:.72rem;color:var(--muted)}
        .sp-t strong{color:var(--cyan)}

        /* stats bar */
        .stats{display:flex;gap:0;border-top:1px solid var(--border);padding-top:2rem;
          flex-wrap:wrap;gap:clamp(1.5rem,4vw,3.5rem)}
        .st{display:flex;flex-direction:column;gap:.15rem}
        .stv{font-family:var(--d);font-size:clamp(1.5rem,3.5vw,2rem);
          font-weight:800;letter-spacing:-.04em;color:var(--text)}
        .stl{font-family:var(--m);font-size:.65rem;color:var(--muted);
          letter-spacing:.08em;text-transform:uppercase}

        /* SECTION SHARED */
        .section{position:relative;z-index:1;max-width:1160px;margin:0 auto;
          padding:clamp(2.5rem,5vw,4rem) var(--pad)}
        .sh{margin-bottom:2rem}
        .stag{font-family:var(--m);font-size:.65rem;letter-spacing:.12em;
          text-transform:uppercase;color:var(--cyan);margin-bottom:.6rem;
          display:flex;align-items:center;gap:.4rem}
        .stag::before{content:'';width:16px;height:1px;background:var(--cyan);display:inline-block}
        .stitle{font-size:clamp(1.25rem,2.8vw,1.75rem);font-weight:800;
          letter-spacing:-.03em;line-height:1.1;color:var(--text)}
        .ssub{font-family:var(--m);font-size:.78rem;color:var(--muted);
          font-weight:300;margin-top:.4rem}

        /* TRUST ROW */
        .trust-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
          background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
        @media(max-width:600px){.trust-row{grid-template-columns:1fr}}
        .trust-cell{background:var(--bg2);padding:1.25rem 1.5rem;display:flex;gap:.85rem;align-items:flex-start}
        .ti{font-size:1.25rem;flex-shrink:0;margin-top:.05rem}
        .tt{font-family:var(--d);font-size:.88rem;font-weight:700;color:var(--text);margin-bottom:.2rem}
        .td{font-family:var(--m);font-size:.72rem;color:var(--muted);font-weight:300;line-height:1.5}

        /* CATEGORIES */
        .cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
          background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
        @media(max-width:860px){.cat-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:540px){.cat-grid{grid-template-columns:1fr}}
        .cat{background:var(--bg2);padding:1.4rem 1.5rem;text-decoration:none;
          display:flex;flex-direction:column;gap:.5rem;
          position:relative;overflow:hidden;transition:background .18s}
        .cat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:var(--cyan);transform:scaleX(0);transform-origin:left;transition:transform .25s}
        .cat:hover{background:var(--bg3)}.cat:hover::before{transform:scaleX(1)}
        .cat-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem}
        .cat-icon{font-size:1.3rem}
        .new{font-family:var(--m);font-size:.58rem;letter-spacing:.06em;
          text-transform:uppercase;color:var(--bg);background:var(--cyan);
          padding:2px 7px;border-radius:100px;font-weight:600}
        .cat-title{font-family:var(--d);font-size:.9rem;font-weight:700;
          letter-spacing:-.01em;color:var(--text)}
        .cat-desc{font-family:var(--m);font-size:.7rem;color:var(--muted);
          font-weight:300;line-height:1.5}
        .cat-n{font-family:var(--m);font-size:.62rem;color:var(--cyan);
          background:var(--cdim);border:1px solid var(--glow);
          padding:2px 9px;border-radius:100px;align-self:flex-start;margin-top:.25rem}

        /* ARTICLES */
        .art-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
        @media(max-width:900px){.art-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:560px){.art-grid{grid-template-columns:1fr}}
        .art{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);
          padding:1.4rem;display:flex;flex-direction:column;gap:.6rem;
          text-decoration:none;transition:all .2s;position:relative;overflow:hidden}
        .art.star{border-color:rgba(0,230,190,.18);background:linear-gradient(135deg,rgba(0,230,190,.04),var(--bg2))}
        .art:hover{border-color:var(--glow);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.35)}
        .art-top{display:flex;justify-content:space-between;align-items:center}
        .art-tag{font-family:var(--m);font-size:.62rem;letter-spacing:.07em;
          text-transform:uppercase;font-weight:500}
        .feat-badge{font-family:var(--m);font-size:.58rem;letter-spacing:.05em;
          text-transform:uppercase;color:var(--bg);background:var(--cyan);
          padding:2px 7px;border-radius:100px;font-weight:600}
        .art-title{font-family:var(--d);font-size:.92rem;font-weight:700;
          letter-spacing:-.01em;line-height:1.35;color:var(--text)}
        .art-desc{font-family:var(--m);font-size:.7rem;color:var(--muted);
          line-height:1.55;font-weight:300;flex:1}
        .art-foot{display:flex;justify-content:space-between;align-items:center;
          padding-top:.6rem;border-top:1px solid var(--border)}
        .art-time{font-family:var(--m);font-size:.65rem;color:var(--dim)}
        .art-more{font-family:var(--m);font-size:.68rem;color:var(--cyan);font-weight:500}

        /* NEWSLETTER */
        .nl-wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;
          padding:0 var(--pad) clamp(4rem,7vw,5.5rem)}
        .nl-box{background:var(--bg2);border:1px solid var(--glow);
          border-radius:16px;padding:clamp(2rem,4vw,3rem);
          text-align:center;position:relative;overflow:hidden}
        .nl-box::before{content:'';position:absolute;top:0;left:50%;
          transform:translateX(-50%);width:50%;height:1px;
          background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .nl-glow{position:absolute;top:-50%;left:50%;transform:translateX(-50%);
          width:400px;height:250px;
          background:radial-gradient(ellipse,rgba(0,230,190,.06),transparent 70%);
          pointer-events:none}
        .nl-title{font-size:clamp(1.25rem,2.8vw,1.75rem);font-weight:800;
          letter-spacing:-.03em;margin-bottom:.6rem;position:relative;z-index:1}
        .nl-sub{font-family:var(--m);font-size:.78rem;color:var(--muted);font-weight:300;
          line-height:1.7;max-width:440px;margin:0 auto 1.4rem;position:relative;z-index:1}
        .nl-sp{display:flex;align-items:center;justify-content:center;gap:.65rem;
          margin-bottom:1.4rem;position:relative;z-index:1}
        .nl-form{display:flex;gap:.65rem;max-width:420px;margin:0 auto .6rem;
          position:relative;z-index:1;flex-wrap:wrap;justify-content:center}
        .nl-in{flex:1;min-width:190px;background:var(--bg3);border:1px solid var(--border);
          border-radius:8px;padding:10px 14px;color:var(--text);font-family:var(--m);
          font-size:.8rem;outline:none;transition:all .2s}
        .nl-in:focus{border-color:var(--glow);box-shadow:0 0 0 3px rgba(0,230,190,.06)}
        .nl-in::placeholder{color:var(--dim)}
        .nl-priv{font-family:var(--m);font-size:.64rem;color:var(--dim);
          position:relative;z-index:1}
        .nl-ok{font-family:var(--m);font-size:.82rem;color:var(--cyan);
          background:var(--cdim);border:1px solid var(--glow);border-radius:8px;
          padding:10px 18px;display:inline-block;position:relative;z-index:1}
        .nl-err{font-family:var(--m);font-size:.78rem;color:#ef4444;
          background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);
          border-radius:8px;padding:9px 14px;margin-bottom:.75rem;
          position:relative;z-index:1}

        /* FOOTER */
        footer{position:relative;z-index:1;border-top:1px solid var(--border);
          padding:2.5rem var(--pad);max-width:1160px;margin:0 auto}
        .ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
        @media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.75rem}}
        .ft-brand{display:flex;flex-direction:column;gap:.6rem}
        .ft-tag{font-family:var(--m);font-size:.73rem;color:var(--muted);
          font-weight:300;line-height:1.6;max-width:230px}
        .ft-col{font-family:var(--m);font-size:.62rem;letter-spacing:.1em;
          text-transform:uppercase;color:var(--dim);margin-bottom:.85rem}
        .ft-ul{list-style:none;display:flex;flex-direction:column;gap:.5rem}
        .ft-ul a{font-family:var(--m);font-size:.74rem;color:var(--muted);
          text-decoration:none;transition:color .15s;font-weight:300}
        .ft-ul a:hover{color:var(--cyan)}
        .ft-bot{margin-top:2rem;padding-top:1.25rem;border-top:1px solid var(--border);
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.65rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* NAV */}
      <nav>
        <a href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></a>
        <ul className={`nav-links${menu ? " open" : ""}`}>
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
          <button className="hb" onClick={() => setMenu(!menu)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-wrap">
          <div className="badge"><div className="badge-dot" />{t.hero.badge}</div>
          <h1>{t.hero.h1a}<br /><em>{t.hero.h1b}</em></h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="ctas">
            <a href={l("/comparatifs")} className="btn btn-p">{t.hero.cta1}</a>
            <a href={l("/blog")} className="btn btn-s">{t.hero.cta2}</a>
          </div>
          <div className="sp">
            <div className="avs">{AVATARS.map((a, i) => <div key={i} className="av">{a}</div>)}</div>
            <span className="sp-t"><strong>{lang === "fr" ? "3 200+" : "3,200+"}</strong> {t.social}</span>
          </div>
          <div className="stats">
            {t.stats.map((s, i) => (
              <div key={i} className="st">
                <div className="stv"><Counter value={s.v} /></div>
                <div className="stl">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRUST */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="trust-row">
          {t.trust.map((item, i) => (
            <div key={i} className="trust-cell">
              <div className="ti">{item.icon}</div>
              <div>
                <div className="tt">{item.t}</div>
                <div className="td">{item.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="section">
        <div className="sh">
          <div className="stag">{t.catTag}</div>
          <div className="stitle">{t.catTitle}</div>
        </div>
        <div className="cat-grid">
          {t.cats.map((c, i) => (
            <a key={i} href={l("/comparatifs")} className="cat">
              <div className="cat-top">
                <div className="cat-icon">{c.icon}</div>
                {c.isNew && <span className="new">{lang === "fr" ? "Nouveau" : "New"}</span>}
              </div>
              <div className="cat-title">{c.t}</div>
              <div className="cat-desc">{c.d}</div>
              <div className="cat-n">{c.n} {lang === "fr" ? "outils" : "tools"}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ARTICLES */}
      <div className="section">
        <div className="sh">
          <div className="stag">{t.artTag}</div>
          <div className="stitle">{t.artTitle}</div>
          <div className="ssub">{t.artSub}</div>
        </div>
        <div className="art-grid">
          {t.articles.map((a, i) => (
            <a key={i} href={l(`/blog/${a.slug}`)} className={`art${a.star ? " star" : ""}`}>
              <div className="art-top">
                <div className="art-tag" style={{ color: a.color }}>{a.tag}</div>
                {a.star && <span className="feat-badge">{t.featured}</span>}
              </div>
              <div className="art-title">{a.t}</div>
              <div className="art-desc">{a.d}</div>
              <div className="art-foot">
                <span className="art-time">⏱ {a.time} {t.read}</span>
                <span className="art-more">{t.readMore}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* NEWSLETTER */}
      <div className="nl-wrap">
        <div className="nl-box">
          <div className="nl-glow" />
          <h2 className="nl-title">{t.nlTitle}</h2>
          <p className="nl-sub">{t.nlSub}</p>
          <div className="nl-sp">
            <div className="avs">{AVATARS.map((a, i) => <div key={i} className="av">{a}</div>)}</div>
            <span className="sp-t"><strong>{lang === "fr" ? "3 200+" : "3,200+"}</strong> {lang === "fr" ? "lecteurs" : "readers"}</span>
          </div>
          {status === "success" ? (
            <div className="nl-ok">{t.nlSuccess}</div>
          ) : (
            <>
              {status === "error" && <div className="nl-err">{t.nlError}</div>}
              <form className="nl-form" onSubmit={submit}>
                <input className="nl-in" type="email" placeholder={t.nlPh} value={email}
                  onChange={e => setEmail(e.target.value)} required disabled={status === "loading"} />
                <button type="submit" className="btn btn-p" disabled={status === "loading"}>
                  {status === "loading" ? t.nlLoading : t.nlCta}
                </button>
              </form>
              <p className="nl-priv">🔒 {t.nlPrivacy}</p>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="ft">
          <div className="ft-brand">
            <a href={l("")} className="logo" style={{ fontSize: ".95rem" }}><div className="logo-dot" />Neuri<em>flux</em></a>
            <p className="ft-tag">{t.ftTagline}</p>
          </div>
          <div>
            <div className="ft-col">{t.ftContent}</div>
            <ul className="ft-ul">{t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}</ul>
          </div>
          <div>
            <div className="ft-col">{t.ftLegal}</div>
            <ul className="ft-ul">{t.ftLegal2.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}</ul>
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