"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNewsletter } from "../../lib/useNewsletter";

type Lang = "fr" | "en";

// ─── Traductions ───────────────────────────────────────────────────────────────
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
      ticker: "🆕 Nouveau : Grok review 2026 · Runway vs Kling vs Pika · DeepSeek V4 analysé · Sora fermé par OpenAI",
    },
    stats: [{ v: "120+", l: "Outils testés" }, { v: "48h", l: "Test moyen" }, { v: "100%", l: "Indépendant" }],
    trust: [
      { icon: "⚡", t: "Indépendant", d: "Aucun éditeur ne finance nos avis." },
      { icon: "🔬", t: "Tests réels", d: "Plusieurs semaines sur des projets concrets." },
      { icon: "💰", t: "Transparent", d: "Liens affiliés toujours signalés." },
    ],
    compTag: "Comparatifs",
    compTitle: "Nos comparatifs",
    compSub: "Scores objectifs · Tests en conditions réelles · Zéro marketing",
    compWinner: "Gagnant", compVoir: "Voir →", compNew: "Nouveau", compFeat: "À la une",
    comparatifs: [
      { slug: "runway-vs-kling-vs-pika-2026", tag: "Vidéo IA", color: "#a855f7", winner: "Runway", winnerScore: 9.0, title: "Runway vs Kling vs Pika", subtitle: "Quel générateur vidéo IA choisir après la mort de Sora ?", tools: [{ name: "Runway Gen-4", score: 9.0 }, { name: "Kling 2.6", score: 8.7 }, { name: "Pika 2.5", score: 7.8 }], isNew: true, isFeat: true },
      { slug: "chatgpt-vs-claude-vs-gemini", tag: "Chatbots", color: "#00e6be", winner: "Claude", winnerScore: 9.2, title: "ChatGPT vs Claude vs Gemini", subtitle: "50 cas d'usage réels. Le verdict sans filtre.", tools: [{ name: "ChatGPT", score: 8.5 }, { name: "Claude", score: 9.2 }, { name: "Gemini", score: 7.8 }], isNew: false, isFeat: true },
      { slug: "cursor-vs-copilot-vs-codeium", tag: "Code", color: "#3b82f6", winner: "Cursor", winnerScore: 9.4, title: "Cursor vs Copilot vs Codeium", subtitle: "L'assistant dev qui booste vraiment la productivité.", tools: [{ name: "Cursor", score: 9.4 }, { name: "GitHub Copilot", score: 8.2 }, { name: "Codeium", score: 7.5 }], isNew: false, isFeat: false },
      { slug: "midjourney-vs-dalle-vs-stable-diffusion", tag: "Image", color: "#7c3aed", winner: "Midjourney", winnerScore: 9.1, title: "Midjourney vs DALL-E vs SD", subtitle: "300 images, 6 critères. Le vrai gagnant.", tools: [{ name: "Midjourney", score: 9.1 }, { name: "DALL-E 3", score: 8.0 }, { name: "Stable Diffusion", score: 7.8 }], isNew: false, isFeat: false },
      { slug: "elevenlabs-vs-openai-tts-vs-playht", tag: "Audio", color: "#ef4444", winner: "ElevenLabs", winnerScore: 9.0, title: "ElevenLabs vs OpenAI TTS vs PlayHT", subtitle: "Clonage vocal, qualité, API. Le meilleur outil voix.", tools: [{ name: "ElevenLabs", score: 9.0 }, { name: "OpenAI TTS", score: 8.0 }, { name: "PlayHT", score: 7.8 }], isNew: false, isFeat: false },
      { slug: "jasper-vs-copyai-vs-claude", tag: "Rédaction", color: "#f59e0b", winner: "Claude", winnerScore: 9.0, title: "Jasper vs Copy.ai vs Claude", subtitle: "20 formats testés. SEO, qualité, workflow.", tools: [{ name: "Jasper", score: 7.5 }, { name: "Copy.ai", score: 7.2 }, { name: "Claude", score: 9.0 }], isNew: false, isFeat: false },
    ],
    artTag: "Populaire",
    artTitle: "Articles les plus lus",
    artSub: "Cette semaine sur Neuriflux",
    read: "min", readMore: "Lire →", featured: "À la une",
    articles: [
      { slug: "sora-fermeture-openai-2026", tag: "Chatbots", color: "#00e6be", t: "Sora est mort : OpenAI abandonne son générateur vidéo IA (et le deal Disney s'effondre)", d: "Le 24 mars 2026, OpenAI a fermé Sora — son app de génération vidéo lancée il y a 6 mois. 15 millions de dollars de coûts par jour, 2,1 millions de revenus au total, 1 milliard Disney envolé. L'autopsie complète.", time: "13", star: true },
      { slug: "grok-review-2026", tag: "Chatbots", color: "#00e6be", t: "Grok : avis 2026, l'IA d'Elon Musk vaut-elle vraiment le coup ?", d: "Grok 3 et 4 promettent données temps réel, 2M tokens et une IA sans censure. On a tout testé pendant 3 semaines.", time: "13", star: true },
      { slug: "deepseek-review-2026", tag: "Chatbots", color: "#00e6be", t: "DeepSeek : avis 2026, le meilleur ChatGPT gratuit venu de Chine ?", d: "DeepSeek a bouleversé le marché IA. Performances, vie privée, cas d'usage — notre verdict complet.", time: "12", star: true },
      { slug: "perplexity-ai-review-2026", tag: "Chatbots", color: "#00e6be", t: "Perplexity AI : vaut-il mieux que ChatGPT et Google ?", d: "Recherche sourcée, Perplexity Pro, Perplexity Computer — notre verdict complet.", time: "13", star: true },
      { slug: "jasper-ai-review-2026", tag: "Rédaction", color: "#f59e0b", t: "Jasper AI : avis 2026", d: "3 semaines de tests sur des projets réels. Notre verdict honnête.", time: "10", star: false },
      { slug: "elevenlabs-review-2026", tag: "Audio", color: "#ef4444", t: "ElevenLabs : meilleure synthèse vocale IA ?", d: "Voix réalistes, prix, API — tout ce qu'il faut savoir.", time: "8", star: false },
    ],
    nlTitle: "Le radar IA · chaque lundi",
    nlSub: "Les meilleurs outils, les comparatifs qui comptent, les deals à ne pas rater. Gratuit. Sans spam.",
    nlCta: "Je m'abonne gratuitement",
    nlLoading: "...", nlPrivacy: "Gratuit · Sans spam · Désabonnement en 1 clic",
    nlSuccess: "✓ Bienvenue ! À lundi prochain.", nlError: "Une erreur s'est produite. Réessayez.",
    nlPh: "votre@email.com",
    ftTagline: "Le média indépendant des outils IA.",
    ftContent: "Contenu", ftLegal: "Légal",
    ftLinks: [{ l: "Blog", h: "/blog" }, { l: "Comparatifs", h: "/comparatifs" }, { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "À propos", h: "/about" }],
    ftLegal2: [{ l: "Mentions légales", h: "/legal" }, { l: "Confidentialité", h: "/privacy" }, { l: "Cookies", h: "/cookies" }],
    ftRights: "Tous droits réservés.", ftMade: "Fait avec ♥ en France",
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
      ticker: "🆕 New: Grok review 2026 · Runway vs Kling vs Pika · DeepSeek V4 analyzed · Sora shut down by OpenAI",
    },
    stats: [{ v: "120+", l: "Tools tested" }, { v: "48h", l: "Avg. test time" }, { v: "100%", l: "Independent" }],
    trust: [
      { icon: "⚡", t: "Independent", d: "No publisher funds our reviews." },
      { icon: "🔬", t: "Real tests", d: "Several weeks on concrete projects." },
      { icon: "💰", t: "Transparent", d: "Affiliate links always disclosed." },
    ],
    compTag: "Comparisons",
    compTitle: "Our comparisons",
    compSub: "Objective scores · Real-world tests · Zero marketing",
    compWinner: "Winner", compVoir: "See →", compNew: "New", compFeat: "Featured",
    comparatifs: [
      { slug: "runway-vs-kling-vs-pika-2026", tag: "AI Video", color: "#a855f7", winner: "Runway", winnerScore: 9.0, title: "Runway vs Kling vs Pika", subtitle: "Which AI video generator after Sora's shutdown?", tools: [{ name: "Runway Gen-4", score: 9.0 }, { name: "Kling 2.6", score: 8.7 }, { name: "Pika 2.5", score: 7.8 }], isNew: true, isFeat: true },
      { slug: "chatgpt-vs-claude-vs-gemini", tag: "Chatbots", color: "#00e6be", winner: "Claude", winnerScore: 9.2, title: "ChatGPT vs Claude vs Gemini", subtitle: "50 real use cases. The unfiltered verdict.", tools: [{ name: "ChatGPT", score: 8.5 }, { name: "Claude", score: 9.2 }, { name: "Gemini", score: 7.8 }], isNew: false, isFeat: true },
      { slug: "cursor-vs-copilot-vs-codeium", tag: "Code", color: "#3b82f6", winner: "Cursor", winnerScore: 9.4, title: "Cursor vs Copilot vs Codeium", subtitle: "The dev assistant that truly boosts productivity.", tools: [{ name: "Cursor", score: 9.4 }, { name: "GitHub Copilot", score: 8.2 }, { name: "Codeium", score: 7.5 }], isNew: false, isFeat: false },
      { slug: "midjourney-vs-dalle-vs-stable-diffusion", tag: "Image", color: "#7c3aed", winner: "Midjourney", winnerScore: 9.1, title: "Midjourney vs DALL-E vs SD", subtitle: "300 images, 6 criteria. The real winner.", tools: [{ name: "Midjourney", score: 9.1 }, { name: "DALL-E 3", score: 8.0 }, { name: "Stable Diffusion", score: 7.8 }], isNew: false, isFeat: false },
      { slug: "elevenlabs-vs-openai-tts-vs-playht", tag: "Audio", color: "#ef4444", winner: "ElevenLabs", winnerScore: 9.0, title: "ElevenLabs vs OpenAI TTS vs PlayHT", subtitle: "Voice cloning, quality, API. The best voice tool.", tools: [{ name: "ElevenLabs", score: 9.0 }, { name: "OpenAI TTS", score: 8.0 }, { name: "PlayHT", score: 7.8 }], isNew: false, isFeat: false },
      { slug: "jasper-vs-copyai-vs-claude", tag: "Writing", color: "#f59e0b", winner: "Claude", winnerScore: 9.0, title: "Jasper vs Copy.ai vs Claude", subtitle: "20 formats tested. SEO, quality, workflow.", tools: [{ name: "Jasper", score: 7.5 }, { name: "Copy.ai", score: 7.2 }, { name: "Claude", score: 9.0 }], isNew: false, isFeat: false },
    ],
    artTag: "Popular",
    artTitle: "Most read articles",
    artSub: "This week on Neuriflux",
    read: "min", readMore: "Read →", featured: "Featured",
    articles: [
      { slug: "sora-fermeture-openai-2026", tag: "Chatbots", color: "#00e6be", t: "Sora Is Dead: OpenAI Kills Its AI Video App (And the Disney Deal Collapses)", d: "On March 24, 2026, OpenAI shut down Sora — the video generation app it launched just 6 months ago. $15 million per day in costs, $2.1 million in total revenue, $1 billion Disney deal gone. The complete post-mortem.", time: "12", star: true },
      { slug: "grok-review-2026", tag: "Chatbots", color: "#00e6be", t: "Grok Review 2026: Is Elon Musk's AI Actually Worth It?", d: "Grok 3 and 4 promise real-time X data, 2M token context, and less filtered AI. We tested everything for 3 weeks.", time: "13", star: true },
      { slug: "deepseek-review-2026", tag: "Chatbots", color: "#00e6be", t: "DeepSeek Review 2026: The Best Free ChatGPT Alternative?", d: "DeepSeek shook the AI industry. Performance, privacy, and real use cases — our complete, unfiltered verdict.", time: "12", star: true },
      { slug: "perplexity-ai-review-2026", tag: "Chatbots", color: "#00e6be", t: "Perplexity AI: Is It Worth It vs ChatGPT & Google?", d: "Sourced search, Perplexity Pro, Perplexity Computer — our complete verdict.", time: "13", star: true },
      { slug: "chatgpt-vs-claude-vs-gemini-2026", tag: "Chatbots", color: "#00e6be", t: "ChatGPT vs Claude vs Gemini: which to choose?", d: "50 real use cases. The results are surprising.", time: "12", star: false },
      { slug: "elevenlabs-review-2026", tag: "Audio", color: "#ef4444", t: "ElevenLabs: best AI voice synthesis?", d: "Realistic voices, pricing, API — everything you need to know.", time: "8", star: false },
    ],
    nlTitle: "The AI Radar · every Monday",
    nlSub: "The best tools, comparisons that matter, deals you don't want to miss. Free. No spam.",
    nlCta: "Subscribe for free",
    nlLoading: "...", nlPrivacy: "Free · No spam · Unsubscribe in 1 click",
    nlSuccess: "✓ Welcome! See you next Monday.", nlError: "Something went wrong. Please try again.",
    nlPh: "your@email.com",
    ftTagline: "The independent AI tools media.",
    ftContent: "Content", ftLegal: "Legal",
    ftLinks: [{ l: "Blog", h: "/blog" }, { l: "Comparisons", h: "/comparatifs" }, { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "About", h: "/about" }],
    ftLegal2: [{ l: "Legal notice", h: "/legal" }, { l: "Privacy", h: "/privacy" }, { l: "Cookies", h: "/cookies" }],
    ftRights: "All rights reserved.", ftMade: "Made with ♥ in France",
  },
};

const AVATARS = ["👨‍💻", "👩‍💼", "🧑‍🎨", "👩‍💻", "🧑‍🚀"];

// ─── Compteur animé au scroll ─────────────────────────────────────────────────
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomeClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = T[lang];
  const l = (p: string) => `/${lang}${p}`;
  const { status, subscribe } = useNewsletter("homepage");

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(email, lang);
  };

  return (
    <>
      <style>{`
        /* ─────────────────────────────────────────────────────────
           RESET & VARIABLES
        ───────────────────────────────────────────────────────── */
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          /* Fonds */
          --bg:#080c10;
          --bg2:#0d1117;
          --bg3:#111820;
          /* Bordures */
          --border:rgba(255,255,255,.065);
          --glow:rgba(0,230,190,.2);
          /* Couleur accent */
          --cyan:#00e6be;
          --cdim:rgba(0,230,190,.09);
          /* Texte */
          --text:#edf2f7;
          --muted:#5a6a7a;
          --dim:#2a3a4a;
          /* Fonts — système uniquement, zéro requête réseau */
          --d:'Syne',sans-serif;
          --m:'JetBrains Mono',monospace;
          /* Utilitaires */
          --r:10px;
          --pad:clamp(1.5rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}

        /* ─────────────────────────────────────────────────────────
           FOND : GRILLE + GLOW AMBIANT
        ───────────────────────────────────────────────────────── */
        .bg-grid{
          position:fixed;inset:0;
          background-image:
            linear-gradient(rgba(0,230,190,.022) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,230,190,.022) 1px,transparent 1px);
          background-size:72px 72px;
          pointer-events:none;z-index:0
        }
        .bg-glow{
          position:fixed;top:-20%;left:50%;transform:translateX(-50%);
          width:800px;height:500px;
          background:radial-gradient(ellipse,rgba(0,230,190,.055) 0%,transparent 65%);
          pointer-events:none;z-index:0
        }

        /* ─────────────────────────────────────────────────────────
           NAVIGATION — identique sur toutes les pages
        ───────────────────────────────────────────────────────── */
        nav{
          position:sticky;top:0;z-index:100;
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          background:rgba(8,12,16,.93);
          border-bottom:1px solid var(--border);
          padding:0 var(--pad);height:60px;
          display:flex;align-items:center;justify-content:space-between;
          transition:box-shadow .25s
        }
        /* Ombre subtile après le scroll */
        nav.scrolled{box-shadow:0 4px 28px rgba(0,0,0,.5)}

        /* Logo */
        .logo{
          font-family:var(--d);font-weight:800;font-size:1.15rem;
          letter-spacing:-.03em;color:var(--text);text-decoration:none;
          display:flex;align-items:center;gap:.45rem
        }
        .logo em{color:var(--cyan);font-style:normal}

        /* Point animé à gauche du logo */
        .logo-dot{
          width:6px;height:6px;background:var(--cyan);border-radius:50%;
          box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite
        }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}

        /* Liens nav desktop */
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
        @media(max-width:720px){
          .nav-links{display:none}
          .nav-links.open{
            display:flex;flex-direction:column;
            position:fixed;top:60px;left:0;right:0;
            background:var(--bg2);border-bottom:1px solid var(--border);
            padding:1.25rem var(--pad);gap:1rem;z-index:99
          }
        }
        .nav-links a{
          font-family:var(--m);font-size:.74rem;color:var(--muted);
          text-decoration:none;letter-spacing:.03em;transition:color .15s
        }
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}

        /* Toggle FR / EN */
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}
        .lb{
          font-family:var(--m);font-size:.67rem;font-weight:500;
          padding:4px 9px;border-radius:4px;border:none;
          cursor:pointer;background:transparent;color:var(--muted);transition:all .15s
        }
        .lb.on{background:var(--cyan);color:#080c10}

        /* Burger mobile */
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}
        @media(max-width:720px){.hb{display:flex}}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}

        /* ─────────────────────────────────────────────────────────
           HERO — centré, grand titre avec underline accent
        ───────────────────────────────────────────────────────── */
        .hero{
          position:relative;z-index:1;
          max-width:1160px;margin:0 auto;
          padding:clamp(4rem,9vw,6.5rem) var(--pad) clamp(2rem,4vw,3rem);
          display:flex;flex-direction:column;align-items:center;text-align:center
        }
        .hero-wrap{max-width:720px;width:100%;display:flex;flex-direction:column;align-items:center}

        /* Badge */
        .badge{
          display:inline-flex;align-items:center;gap:.45rem;
          font-family:var(--m);font-size:.67rem;letter-spacing:.07em;
          color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);
          border-radius:100px;padding:5px 13px;margin-bottom:1.6rem
        }
        .badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}

        /* H1 */
        h1{
          font-size:clamp(2.1rem,5.5vw,3.75rem);font-weight:800;
          line-height:1.07;letter-spacing:-.04em;
          margin-bottom:1.2rem;color:var(--text)
        }
        /* Ligne accentuée sous le deuxième segment du titre */
        h1 em{color:var(--cyan);font-style:normal;position:relative}
        h1 em::after{
          content:'';position:absolute;bottom:2px;left:0;right:0;height:2px;
          background:var(--cyan);opacity:.3;border-radius:2px
        }

        /* Sous-titre */
        .hero-sub{
          font-family:var(--m);font-size:.86rem;font-weight:300;color:var(--muted);
          line-height:1.75;max-width:490px;margin-bottom:2rem;text-align:center
        }

        /* CTAs */
        .ctas{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:2rem;justify-content:center}
        .btn{
          display:inline-flex;align-items:center;gap:.4rem;
          font-family:var(--d);font-weight:700;font-size:.84rem;
          padding:11px 22px;border-radius:8px;text-decoration:none;
          transition:all .2s;letter-spacing:-.01em;border:none;cursor:pointer
        }
        .btn-p{background:var(--cyan);color:var(--bg)}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,230,190,.28)}
        .btn-p:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-s{background:transparent;color:var(--text);border:1px solid var(--border)}
        .btn-s:hover{border-color:var(--glow);background:var(--cdim);color:var(--cyan)}

        /* Stat counters */
        .stats{
          display:flex;gap:clamp(1.5rem,4vw,3.5rem);
          border-top:1px solid var(--border);padding-top:2rem;
          flex-wrap:wrap;justify-content:center
        }
        .st-v{font-family:var(--d);font-size:clamp(1.5rem,3.5vw,2rem);font-weight:800;letter-spacing:-.04em;color:var(--text);text-align:center}
        .st-l{font-family:var(--m);font-size:.63rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:.1rem;text-align:center}

        /* ─────────────────────────────────────────────────────────
           TICKER — bande d'actualité défilante
        ───────────────────────────────────────────────────────── */
        .ticker-wrap{
          position:relative;z-index:1;
          border-top:1px solid var(--border);border-bottom:1px solid var(--border);
          background:var(--bg2);overflow:hidden;height:34px;display:flex;align-items:center;
          margin-top:2rem
        }
        /* Label "ACTUS" / "LATEST" fixe à gauche */
        .ticker-label{
          font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;
          color:var(--bg);background:var(--cyan);padding:0 14px;height:100%;
          display:flex;align-items:center;flex-shrink:0;font-weight:700;white-space:nowrap
        }
        .ticker-inner{display:flex;align-items:center;overflow:hidden;flex:1}
        /* Animation infinie de gauche à droite */
        .ticker-text{
          font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;
          white-space:nowrap;animation:scroll-ticker 22s linear infinite;padding-left:2rem
        }
        @keyframes scroll-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        /* ─────────────────────────────────────────────────────────
           SECTIONS — layout commun pour trust / comparatifs / articles
        ───────────────────────────────────────────────────────── */
        .section{
          position:relative;z-index:1;
          max-width:1160px;margin:0 auto;
          padding:clamp(2.5rem,5vw,3.5rem) var(--pad)
        }

        /* Header de section : titre à gauche, lien "Tous →" à droite */
        .sh{margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem}
        .sh-right{
          font-family:var(--m);font-size:.7rem;color:var(--cyan);
          text-decoration:none;opacity:.65;transition:opacity .2s;white-space:nowrap
        }
        .sh-right:hover{opacity:1}

        /* Label de section (petit texte uppercase au-dessus du titre) */
        .stag{
          font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
          color:var(--cyan);margin-bottom:.45rem;display:flex;align-items:center;gap:.4rem
        }
        .stag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}
        .stitle{font-size:clamp(1.2rem,2.6vw,1.55rem);font-weight:800;letter-spacing:-.03em;line-height:1.1;color:var(--text)}
        .ssub{font-family:var(--m);font-size:.68rem;color:var(--muted);font-weight:300;margin-top:.3rem;letter-spacing:.02em}

        /* ─────────────────────────────────────────────────────────
           TRUST ROW — 3 colonnes "Indépendant / Tests réels / Transparent"
        ───────────────────────────────────────────────────────── */
        .trust-row{
          display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
          background:var(--border);border:1px solid var(--border);
          border-radius:var(--r);overflow:hidden
        }
        @media(max-width:600px){.trust-row{grid-template-columns:1fr}}
        .trust-cell{background:var(--bg2);padding:1rem 1.35rem;display:flex;gap:.7rem;align-items:center}
        .ti{font-size:1.05rem;flex-shrink:0}
        .tt{font-family:var(--d);font-size:.8rem;font-weight:700;color:var(--text);margin-bottom:.12rem}
        .td{font-family:var(--m);font-size:.67rem;color:var(--muted);font-weight:300;line-height:1.5}

        /* ─────────────────────────────────────────────────────────
           GRILLE COMPARATIFS — 3 colonnes, identique à la grille articles
        ───────────────────────────────────────────────────────── */
        .comp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
        @media(max-width:900px){.comp-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:560px){.comp-grid{grid-template-columns:1fr}}

        /* Card comparatif */
        .cmp{
          background:var(--bg2);border:1px solid var(--border);
          border-radius:var(--r);padding:1.35rem;
          display:flex;flex-direction:column;gap:.55rem;
          text-decoration:none;transition:all .2s;overflow:hidden;
          position:relative
        }
        /* Card mise en avant */
        .cmp.star{border-color:rgba(0,230,190,.13);background:linear-gradient(135deg,rgba(0,230,190,.03),var(--bg2))}
        .cmp:hover{border-color:var(--glow);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.35)}

        /* Barre colorée en haut */
        .cmp-bar{position:absolute;top:0;left:0;right:0;height:2px;opacity:.5;transition:opacity .2s}
        .cmp:hover .cmp-bar{opacity:1}

        .cmp-top{display:flex;justify-content:space-between;align-items:center}
        .cmp-tag{font-family:var(--m);font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600}
        .cmp-badge{
          font-family:var(--m);font-size:.56rem;letter-spacing:.06em;text-transform:uppercase;
          color:var(--bg);background:var(--cyan);padding:2px 7px;border-radius:100px;font-weight:700
        }
        .cmp-title{font-family:var(--d);font-size:.88rem;font-weight:700;letter-spacing:-.01em;line-height:1.35;color:var(--text)}
        .cmp-sub{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.6;font-weight:300;flex:1}
        .cmp-foot{
          display:flex;justify-content:space-between;align-items:center;
          padding-top:.55rem;border-top:1px solid var(--border);margin-top:auto
        }
        .cmp-winner{font-family:var(--m);font-size:.62rem;color:var(--muted);display:flex;align-items:center;gap:.3rem}
        .cmp-score{
          font-family:var(--m);font-size:.6rem;font-weight:700;
          padding:1px 7px;border-radius:100px;border:1px solid
        }
        .cmp-more{font-family:var(--m);font-size:.65rem;font-weight:500;opacity:.6;transition:opacity .15s}
        .cmp:hover .cmp-more{opacity:1}

        /* ─────────────────────────────────────────────────────────
           GRILLE ARTICLES — même structure que comparatifs
        ───────────────────────────────────────────────────────── */
        .art-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
        @media(max-width:900px){.art-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:560px){.art-grid{grid-template-columns:1fr}}

        /* Card article */
        .art{
          background:var(--bg2);border:1px solid var(--border);
          border-radius:var(--r);padding:1.35rem;
          display:flex;flex-direction:column;gap:.55rem;
          text-decoration:none;transition:all .2s;overflow:hidden;
          position:relative
        }
        .art.star{border-color:rgba(0,230,190,.13);background:linear-gradient(135deg,rgba(0,230,190,.03),var(--bg2))}
        .art:hover{border-color:var(--glow);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.35)}

        /* Barre colorée en haut (même logique que .cmp-bar) */
        .art-bar{position:absolute;top:0;left:0;right:0;height:2px;opacity:.5;transition:opacity .2s}
        .art:hover .art-bar{opacity:1}

        .art-top{display:flex;justify-content:space-between;align-items:center}
        .art-tag{font-family:var(--m);font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600}
        .feat-badge{font-family:var(--m);font-size:.56rem;letter-spacing:.06em;text-transform:uppercase;color:var(--bg);background:var(--cyan);padding:2px 7px;border-radius:100px;font-weight:700}
        .art-title{font-family:var(--d);font-size:.88rem;font-weight:700;letter-spacing:-.01em;line-height:1.35;color:var(--text)}
        .art-desc{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.6;font-weight:300;flex:1}
        .art-foot{
          display:flex;justify-content:space-between;align-items:center;
          padding-top:.55rem;border-top:1px solid var(--border);margin-top:auto
        }
        .art-time{font-family:var(--m);font-size:.6rem;color:var(--dim)}
        .art-more{font-family:var(--m);font-size:.65rem;font-weight:500;opacity:.6;transition:opacity .15s}
        .art:hover .art-more{opacity:1}

        /* ─────────────────────────────────────────────────────────
           NEWSLETTER — bloc central avec glow et formulaire
        ───────────────────────────────────────────────────────── */
        .nl-wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 var(--pad) clamp(4rem,7vw,5rem)}
        .nl-box{
          background:var(--bg2);border:1px solid var(--glow);border-radius:14px;
          padding:clamp(2rem,4vw,2.75rem);text-align:center;position:relative;overflow:hidden
        }
        /* Barre lumineuse en haut du bloc */
        .nl-box::before{
          content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
          width:45%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)
        }
        .nl-glow{
          position:absolute;top:-50%;left:50%;transform:translateX(-50%);
          width:400px;height:250px;
          background:radial-gradient(ellipse,rgba(0,230,190,.055),transparent 70%);
          pointer-events:none
        }
        .nl-title{font-size:clamp(1.2rem,2.6vw,1.6rem);font-weight:800;letter-spacing:-.03em;margin-bottom:.5rem;position:relative;z-index:1}
        .nl-sub{font-family:var(--m);font-size:.74rem;color:var(--muted);font-weight:300;line-height:1.75;max-width:400px;margin:0 auto 1.2rem;position:relative;z-index:1}
        .nl-sp{display:flex;align-items:center;justify-content:center;gap:.6rem;margin-bottom:1.2rem;position:relative;z-index:1}
        .avs{display:flex}
        .av{width:26px;height:26px;border-radius:50%;background:var(--bg3);border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;font-size:.72rem;margin-left:-7px}
        .av:first-child{margin-left:0}
        .sp-t{font-family:var(--m);font-size:.71rem;color:var(--muted)}
        .sp-t strong{color:var(--cyan)}
        .nl-form{display:flex;gap:.6rem;max-width:390px;margin:0 auto .55rem;position:relative;z-index:1;flex-wrap:wrap;justify-content:center}
        .nl-in{
          flex:1;min-width:175px;background:var(--bg3);border:1px solid var(--border);
          border-radius:7px;padding:9px 13px;color:var(--text);
          font-family:var(--m);font-size:.78rem;outline:none;transition:all .2s
        }
        .nl-in:focus{border-color:var(--glow);box-shadow:0 0 0 3px rgba(0,230,190,.05)}
        .nl-in::placeholder{color:var(--dim)}
        .nl-priv{font-family:var(--m);font-size:.6rem;color:var(--dim);position:relative;z-index:1}
        .nl-ok{font-family:var(--m);font-size:.78rem;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:8px;padding:9px 16px;display:inline-block;position:relative;z-index:1}
        .nl-err{font-family:var(--m);font-size:.74rem;color:#ef4444;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.22);border-radius:8px;padding:9px 13px;margin-bottom:.7rem;position:relative;z-index:1}

        /* ─────────────────────────────────────────────────────────
           FOOTER — 3 colonnes + ligne de bas de page
        ───────────────────────────────────────────────────────── */
        footer{
          position:relative;z-index:1;
          border-top:1px solid var(--border);
          padding:2.25rem var(--pad);
          max-width:1160px;margin:0 auto
        }
        .ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
        @media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
        .ft-tag{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.65;max-width:210px;margin-top:.4rem}
        .ft-col{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
        .ft-ul{list-style:none;display:flex;flex-direction:column;gap:.45rem}
        .ft-ul a{font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;transition:color .15s;font-weight:300}
        .ft-ul a:hover{color:var(--cyan)}
        /* Ligne de copyright */
        .ft-bot{
          margin-top:1.75rem;padding-top:1.1rem;border-top:1px solid var(--border);
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem
        }
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── NAVIGATION ── */}
      <nav className={scrolled ? "scrolled" : ""}>
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
          <button className="hb" onClick={() => setMenu(!menu)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-wrap">
          <div className="badge"><div className="badge-dot" />{t.hero.badge}</div>
          <h1>{t.hero.h1a}<br /><em>{t.hero.h1b}</em></h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="ctas">
            <a href={l("/comparatifs")} className="btn btn-p">{t.hero.cta1}</a>
            <a href={l("/blog")} className="btn btn-s">{t.hero.cta2}</a>
          </div>
          <div className="stats">
            {t.stats.map((s, i) => (
              <div key={i}>
                <div className="st-v"><Counter value={s.v} /></div>
                <div className="st-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker-label">{lang === "fr" ? "Actus" : "Latest"}</div>
        <div className="ticker-inner">
          <div className="ticker-text">
            {t.hero.ticker}&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp;{t.hero.ticker}&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;&nbsp;{t.hero.ticker}
          </div>
        </div>
      </div>

      {/* ── TRUST ── */}
      <div className="section" style={{ paddingTop: "4rem", paddingBottom: "1.25rem" }}>
        <div className="trust-row">
          {t.trust.map((item, i) => (
            <div key={i} className="trust-cell">
              <div className="ti">{item.icon}</div>
              <div><div className="tt">{item.t}</div><div className="td">{item.d}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPARATIFS ── */}
      <div className="section">
        <div className="sh">
          <div>
            <div className="stag">{t.compTag}</div>
            <div className="stitle">{t.compTitle}</div>
            <div className="ssub">{t.compSub}</div>
          </div>
          <a href={l("/comparatifs")} className="sh-right">
            {lang === "fr" ? "Tous les comparatifs →" : "All comparisons →"}
          </a>
        </div>
        <div className="comp-grid">
          {t.comparatifs.map((c, i) => (
            <a key={i} href={l(`/comparatifs/${c.slug}`)} className={`cmp${c.isFeat ? " star" : ""}`}>
              {/* Barre colorée en haut selon la catégorie */}
              <div className="cmp-bar" style={{ background: c.color }} />
              <div className="cmp-top">
                <div className="cmp-tag" style={{ color: c.color }}>{c.tag}</div>
                {c.isFeat && <span className="cmp-badge">{t.compFeat}</span>}
              </div>
              <div className="cmp-title">{c.title}</div>
              <div className="cmp-sub">{c.subtitle}</div>
              <div className="cmp-foot">
                <div className="cmp-winner">
                  🏆 <strong style={{ color: c.color }}>{c.winner}</strong>
                  <span className="cmp-score" style={{ color: c.color, borderColor: `${c.color}50` }}>
                    {c.winnerScore}/10
                  </span>
                </div>
                <span className="cmp-more" style={{ color: c.color }}>{t.compVoir}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── ARTICLES ── */}
      <div className="section">
        <div className="sh">
          <div>
            <div className="stag">{t.artTag}</div>
            <div className="stitle">{t.artTitle}</div>
            <div className="ssub">{t.artSub}</div>
          </div>
          <a href={l("/blog")} className="sh-right">
            {lang === "fr" ? "Tous les articles →" : "All articles →"}
          </a>
        </div>
        <div className="art-grid">
          {t.articles.map((a, i) => (
            <a key={i} href={l(`/blog/${a.slug}`)} className={`art${a.star ? " star" : ""}`}>
              {/* Barre colorée en haut selon le tag */}
              <div className="art-bar" style={{ background: a.color }} />
              <div className="art-top">
                <div className="art-tag" style={{ color: a.color }}>{a.tag}</div>
                {a.star && <span className="feat-badge">{t.featured}</span>}
              </div>
              <div className="art-title">{a.t}</div>
              <div className="art-desc">{a.d}</div>
              <div className="art-foot">
                <span className="art-time">⏱ {a.time} {t.read}</span>
                <span className="art-more" style={{ color: a.color }}>{t.readMore}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <div className="nl-wrap">
        <div className="nl-box">
          <div className="nl-glow" />
          <h2 className="nl-title">{t.nlTitle}</h2>
          <p className="nl-sub">{t.nlSub}</p>
          <div className="nl-sp">
            <div className="avs">{AVATARS.map((a, i) => <div key={i} className="av">{a}</div>)}</div>
            <span className="sp-t">
              <strong>{lang === "fr" ? "3 200+" : "3,200+"}</strong>{" "}
              {lang === "fr" ? "lecteurs" : "readers"}
            </span>
          </div>
          {status === "success" ? (
            <div className="nl-ok">{t.nlSuccess}</div>
          ) : (
            <>
              {status === "error" && <div className="nl-err">{t.nlError}</div>}
              <form className="nl-form" onSubmit={submit}>
                <input className="nl-in" type="email" placeholder={t.nlPh}
                  value={email} onChange={e => setEmail(e.target.value)}
                  required disabled={status === "loading"} />
                <button type="submit" className="btn btn-p" disabled={status === "loading"}>
                  {status === "loading" ? t.nlLoading : t.nlCta}
                </button>
              </form>
              <p className="nl-priv">🔒 {t.nlPrivacy}</p>
            </>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="ft">
          {/* Colonne 1 : logo + tagline */}
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}>
              <div className="logo-dot" />Neuri<em>flux</em>
            </a>
            <p className="ft-tag">{t.ftTagline}</p>
          </div>
          {/* Colonne 2 : liens de contenu */}
          <div>
            <div className="ft-col">{t.ftContent}</div>
            <ul className="ft-ul">
              {t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}
            </ul>
          </div>
          {/* Colonne 3 : liens légaux */}
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