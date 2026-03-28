"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type Lang = "fr" | "en";

// ─── Traductions ───────────────────────────────────────────────────────────────
const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "À propos de Neuriflux",
    title: "On teste.",
    titleAccent: "Vous choisissez.",
    subtitle: "Neuriflux est un média indépendant dédié aux outils IA. Pas de bullshit, pas de liens sponsorisés cachés — juste des tests honnêtes et des comparatifs clairs.",
    stats: [
      { value: "120+", label: "Outils testés" },
      { value: "13", label: "Articles publiés" },
      { value: "3200+", label: "Lecteurs newsletter" },
      { value: "2026", label: "Lancé en" },
    ],
    origin: {
      label: "Pourquoi Neuriflux existe",
      title: "Le marché IA est devenu ingérable.",
      paragraphs: [
        "En 2024, un nouvel outil IA sortait pratiquement chaque jour. ChatGPT, Claude, Gemini, Cursor, Perplexity, Midjourney, Runway, ElevenLabs — chacun promettait de « révolutionner » votre façon de travailler. Chacun avait sa page de landing magnifique, ses témoignages triés sur le volet, ses benchmarks maison.",
        "Le problème : personne ne testait vraiment. Les médias tech repompaient les communiqués de presse. Les influenceurs faisaient des unboxings de 10 minutes. Les sites de comparatifs affichaient des tableaux remplis de checkmarks sans jamais avoir ouvert le produit.",
        "Neuriflux est né de cette frustration. On a décidé de faire les tests nous-mêmes — sur des projets réels, sur plusieurs semaines, avec une grille d'évaluation fixe. Sans presse kit. Sans accès privilégié. Comme n'importe quel utilisateur qui sort sa carte bleue.",
      ],
    },
    manifesto: {
      label: "Notre manifeste",
      blocks: [
        { icon: "⚡", title: "Indépendance totale", text: "Neuriflux n'appartient à aucun éditeur de logiciel, aucun fonds d'investissement, aucune régie publicitaire. Nos comparatifs sont rédigés sans pression commerciale. Quand un outil est nul, on le dit — même si cet outil est affilié." },
        { icon: "🔬", title: "Tests réels, pas des démos", text: "Chaque outil est utilisé en conditions réelles, sur des projets concrets, pendant 3 à 6 semaines minimum. Nos scores reflètent une utilisation quotidienne intensive — pas un screenshot de la page marketing." },
        { icon: "💰", title: "Affiliation transparente", text: "Certains liens sont affiliés — c'est ce qui garde le site gratuit. Chaque lien affilié est signalé explicitement. Notre règle d'or : l'affiliation ne change jamais un verdict. Un outil médiocre reste médiocre, qu'il rapporte de l'argent ou non." },
        { icon: "🌍", title: "Bilingue FR / EN", text: "Tout le contenu de Neuriflux est publié simultanément en français et en anglais. Parce que l'écosystème IA est mondial, et que les bonnes ressources ne devraient pas être réservées aux anglophones." },
        { icon: "📊", title: "Méthode reproductible", text: "Notre grille d'évaluation est identique pour chaque outil testé : qualité, prix, ergonomie, support, évolutivité, intégrations. Chaque score est justifié avec des exemples concrets. Pas de note subjective, pas de « on a bien aimé »." },
        { icon: "🔄", title: "Mise à jour permanente", text: "Les outils IA évoluent vite. Un avis de 2024 peut être complètement obsolète en 2026. On revisite régulièrement nos comparatifs pour refléter les nouvelles versions, les changements de prix, et l'évolution du marché." },
      ],
    },
    forWho: {
      label: "Pour qui",
      title: "Neuriflux est fait pour vous si…",
      profiles: [
        { icon: "👨‍💻", title: "Vous êtes développeur", text: "Vous cherchez le meilleur assistant code, le modèle le plus rapide pour votre API, ou l'outil qui s'intègre le mieux dans votre workflow. On a testé Cursor, Copilot, Codeium, Claude Code — et on dit clairement lequel vaut votre abonnement." },
        { icon: "🎨", title: "Vous êtes créateur", text: "Image, vidéo, voix, rédaction — les outils IA créatifs évoluent à une vitesse folle. On compare Midjourney vs DALL-E, Runway vs Kling, ElevenLabs vs OpenAI TTS. Pour que vous sachiez exactement quoi utiliser pour quel projet." },
        { icon: "📈", title: "Vous êtes marketeur / entrepreneur", text: "Votre temps est limité. Vous n'avez pas 3 semaines pour tester chaque nouveau GPT wrapper. Neuriflux fait le travail de débroussaillage pour vous — on garde les bons outils, on vous épargne les mauvais." },
        { icon: "🏢", title: "Vous êtes en entreprise", text: "Vous évaluez des outils pour déployer à l'échelle. Vous avez besoin de données objectives sur la qualité, la fiabilité, le pricing et les intégrations — pas d'un article de blog rédigé par l'IA de l'outil lui-même." },
      ],
    },
    scoring: {
      label: "Notre méthode de scoring",
      title: "Comment on note un outil",
      intro: "Chaque outil est évalué sur 5 critères, notés de 0 à 10. Le score global est une moyenne pondérée.",
      criteria: [
        { name: "Qualité des outputs", weight: "30%", desc: "Ce que l'outil produit réellement — qualité, cohérence, absence d'hallucinations. Testé sur des cas d'usage réels." },
        { name: "Rapport qualité/prix", weight: "25%", desc: "Ce qu'on obtient pour ce qu'on paie. Comparé aux alternatives directes sur le marché au moment du test." },
        { name: "Expérience utilisateur", weight: "20%", desc: "Ergonomie, vitesse, fiabilité, courbe d'apprentissage. Un bon outil doit être agréable à utiliser au quotidien." },
        { name: "Support & documentation", weight: "15%", desc: "Qualité du support client, documentation, communauté, fréquence des mises à jour." },
        { name: "Intégrations & API", weight: "10%", desc: "Capacité à s'intégrer dans un workflow existant. Qualité de l'API, SDKs disponibles, Zapier/Make, extensions." },
      ],
    },
    howWeWork: {
      label: "Comment on travaille",
      steps: [
        { num: "01", title: "On sélectionne", text: "On choisit les outils qui font vraiment parler d'eux — nouveautés majeures, mises à jour qui changent la donne, tendances de fond sur le marché. On ignore le bruit marketing." },
        { num: "02", title: "On teste sans filet", text: "Plusieurs semaines d'utilisation intensive sur des projets concrets — code, rédaction, génération d'images, analyse de données. Pas de démo, pas de press kit, pas d'accès privilégié. Juste le produit tel qu'il est vendu." },
        { num: "03", title: "On score objectivement", text: "Grille d'évaluation fixe sur 5 critères avec pondération. Chaque note est justifiée par des exemples précis. On documente nos tests pour pouvoir les reproduire et les mettre à jour." },
        { num: "04", title: "On publie sans filtre", text: "Verdict honnête, points forts ET faiblesses. Si l'outil est surévalué par les médias, on le dit. Si un outil moins connu est meilleur, on le met en avant. L'objectif : votre argent et votre temps bien dépensés." },
        { num: "05", title: "On met à jour", text: "Les outils IA changent vite. On revisite chaque test quand une version majeure sort ou quand les prix changent. La date de dernière mise à jour est toujours affichée sur chaque article." },
      ],
    },
    mission: {
      label: "Notre mission",
      title: "Être votre boussole dans l'écosystème IA.",
      text: "Le marché des outils IA est devenu un terrain de jeu pour le marketing agressif. Chaque semaine, un nouveau modèle « révolutionne tout ». Chaque mois, un outil lève des centaines de millions et se retrouve en tête de Product Hunt. Neuriflux est là pour remettre les pendules à l'heure : tester pour de vrai, comparer honnêtement, et vous dire exactement ce qui vaut votre temps et votre argent — et ce qui ne le vaut pas.",
    },
    contact: {
      label: "Contact",
      title: "On est joignables",
      text: "Suggestion d'outil à tester, erreur dans un comparatif, partenariat éditorial — on lit et on répond à tous les messages.",
      email: "contact@neuriflux.com",
      emailLabel: "Écrire un email",
      items: [
        { icon: "🔬", label: "Suggérer un outil à tester" },
        { icon: "✏️", label: "Signaler une erreur ou info obsolète" },
        { icon: "🤝", label: "Proposer un partenariat éditorial" },
        { icon: "💬", label: "Simple retour ou question" },
      ],
    },
    newsletter: {
      label: "Le radar IA",
      title: "Chaque lundi dans votre boîte",
      text: "Les meilleurs outils, les comparatifs qui comptent, les deals à ne pas rater. Gratuit, sans spam.",
      cta: "S'abonner gratuitement →",
      proof: "3 200+ professionnels déjà abonnés",
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
    badge: "About Neuriflux",
    title: "We test.",
    titleAccent: "You choose.",
    subtitle: "Neuriflux is an independent media dedicated to AI tools. No bullshit, no hidden sponsored links — just honest tests and clear comparisons.",
    stats: [
      { value: "120+", label: "Tools tested" },
      { value: "13", label: "Articles published" },
      { value: "3,200+", label: "Newsletter readers" },
      { value: "2026", label: "Launched in" },
    ],
    origin: {
      label: "Why Neuriflux exists",
      title: "The AI market became unmanageable.",
      paragraphs: [
        "In 2024, a new AI tool launched practically every day. ChatGPT, Claude, Gemini, Cursor, Perplexity, Midjourney, Runway, ElevenLabs — each one promised to 'revolutionize' the way you work. Each had a stunning landing page, handpicked testimonials, proprietary benchmarks.",
        "The problem: nobody was actually testing anything. Tech media recycled press releases. Influencers did 10-minute unboxings. Comparison sites showed tables full of checkmarks for products they'd never opened.",
        "Neuriflux was born from that frustration. We decided to run the tests ourselves — on real projects, over several weeks, with a fixed evaluation grid. No press kit. No privileged access. Just like any user pulling out their credit card.",
      ],
    },
    manifesto: {
      label: "Our manifesto",
      blocks: [
        { icon: "⚡", title: "Total independence", text: "Neuriflux is not owned by any software publisher, investment fund, or advertising network. Our comparisons are written without commercial pressure. When a tool is bad, we say so — even if that tool is affiliated." },
        { icon: "🔬", title: "Real tests, not demos", text: "Every tool is used in real conditions, on concrete projects, for at least 3 to 6 weeks. Our scores reflect intensive daily use — not a screenshot from the marketing page." },
        { icon: "💰", title: "Transparent affiliation", text: "Some links are affiliate links — that's what keeps the site free. Every affiliate link is explicitly disclosed. Our golden rule: affiliation never changes a verdict. A mediocre tool stays mediocre, whether it earns us money or not." },
        { icon: "🌍", title: "Bilingual FR / EN", text: "All Neuriflux content is published simultaneously in French and English. Because the AI ecosystem is global, and good resources shouldn't be reserved for English speakers." },
        { icon: "📊", title: "Reproducible method", text: "Our evaluation grid is identical for every tool tested: quality, price, UX, support, scalability, integrations. Every score is justified with concrete examples. No subjective rating, no 'we liked it'." },
        { icon: "🔄", title: "Permanent updates", text: "AI tools evolve fast. A 2024 review can be completely outdated by 2026. We regularly revisit our comparisons to reflect new versions, pricing changes, and market shifts." },
      ],
    },
    forWho: {
      label: "Who it's for",
      title: "Neuriflux is made for you if…",
      profiles: [
        { icon: "👨‍💻", title: "You're a developer", text: "You're looking for the best code assistant, the fastest model for your API, or the tool that fits best into your workflow. We tested Cursor, Copilot, Codeium, Claude Code — and we say clearly which one is worth your subscription." },
        { icon: "🎨", title: "You're a creator", text: "Image, video, voice, writing — creative AI tools are evolving at breakneck speed. We compare Midjourney vs DALL-E, Runway vs Kling, ElevenLabs vs OpenAI TTS. So you know exactly what to use for each project." },
        { icon: "📈", title: "You're a marketer / entrepreneur", text: "Your time is limited. You don't have 3 weeks to test every new GPT wrapper. Neuriflux does the groundwork for you — we keep the good tools, we save you from the bad ones." },
        { icon: "🏢", title: "You're in enterprise", text: "You're evaluating tools to deploy at scale. You need objective data on quality, reliability, pricing and integrations — not a blog post written by the tool's own AI." },
      ],
    },
    scoring: {
      label: "Our scoring method",
      title: "How we rate a tool",
      intro: "Every tool is evaluated on 5 criteria, scored 0 to 10. The global score is a weighted average.",
      criteria: [
        { name: "Output quality", weight: "30%", desc: "What the tool actually produces — quality, consistency, absence of hallucinations. Tested on real use cases." },
        { name: "Value for money", weight: "25%", desc: "What you get for what you pay. Compared to direct alternatives on the market at the time of testing." },
        { name: "User experience", weight: "20%", desc: "Ergonomics, speed, reliability, learning curve. A good tool must be enjoyable to use daily." },
        { name: "Support & documentation", weight: "15%", desc: "Quality of customer support, documentation, community, update frequency." },
        { name: "Integrations & API", weight: "10%", desc: "Ability to integrate into an existing workflow. API quality, available SDKs, Zapier/Make, extensions." },
      ],
    },
    howWeWork: {
      label: "How we work",
      steps: [
        { num: "01", title: "We select", text: "We choose tools genuinely making waves — major releases, game-changing updates, lasting market trends. We ignore the marketing noise." },
        { num: "02", title: "We test without safety nets", text: "Several weeks of intensive use on real projects — coding, writing, image generation, data analysis. No demo, no press kit, no privileged access. Just the product as it's sold." },
        { num: "03", title: "We score objectively", text: "Fixed evaluation grid across 5 weighted criteria. Every rating is backed by specific examples. We document our tests so they can be reproduced and updated." },
        { num: "04", title: "We publish unfiltered", text: "Honest verdict, strengths AND weaknesses. If a tool is overhyped by media, we say so. If a lesser-known tool is better, we put it first. The goal: your money and time well spent." },
        { num: "05", title: "We update", text: "AI tools change fast. We revisit every test when a major version drops or pricing changes. The last update date is always shown on each article." },
      ],
    },
    mission: {
      label: "Our mission",
      title: "Be your compass in the AI ecosystem.",
      text: "The AI tools market has become a playground for aggressive marketing. Every week, a new model 'revolutionizes everything'. Every month, a tool raises hundreds of millions and tops Product Hunt. Neuriflux is here to cut through the noise: test for real, compare honestly, and tell you exactly what's worth your time and money — and what isn't.",
    },
    contact: {
      label: "Contact",
      title: "We're reachable",
      text: "Tool suggestion, error in a comparison, editorial partnership — we read and reply to every message.",
      email: "contact@neuriflux.com",
      emailLabel: "Send an email",
      items: [
        { icon: "🔬", label: "Suggest a tool to test" },
        { icon: "✏️", label: "Report an error or outdated info" },
        { icon: "🤝", label: "Propose an editorial partnership" },
        { icon: "💬", label: "Simple feedback or question" },
      ],
    },
    newsletter: {
      label: "The AI radar",
      title: "Every Monday in your inbox",
      text: "The best tools, the comparisons that matter, the deals you don't want to miss. Free, no spam.",
      cta: "Subscribe for free →",
      proof: "3,200+ professionals already subscribed",
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

const AVATARS = ["👨‍💻", "👩‍💼", "🧑‍🎨", "👩‍💻", "🧑‍🚀"];

// ─── Compteur animé au scroll ─────────────────────────────────────────────────
function Counter({ value }: { value: string }) {
  const [d, setD] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
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
        const p = Math.min((t - t0) / 1300, 1);
        setD(Math.floor((1 - Math.pow(1 - p, 3)) * num) + sfx);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { threshold: 0.2 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [value]);
  return <div ref={ref} className="stat-val">{d}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutClient({ lang }: { lang: Lang }) {
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
        .bg-grid{position:fixed;inset:0;
          background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);
          background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);
          width:900px;height:680px;
          background:radial-gradient(ellipse,rgba(0,230,190,.055) 0%,transparent 68%);
          pointer-events:none;z-index:0}

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
        .hero{padding:clamp(5rem,10vw,8rem) 0 clamp(3rem,6vw,4rem);text-align:center}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.7rem;letter-spacing:.08em;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:6px 14px;margin-bottom:2rem}
        .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
        .hero-title{font-size:clamp(3rem,8vw,5.5rem);font-weight:800;line-height:1.0;letter-spacing:-.04em;margin-bottom:1.5rem}
        .hero-title .ac{color:var(--cyan)}
        .hero-sub{font-family:var(--m);font-size:clamp(.82rem,1.6vw,.96rem);font-weight:300;color:var(--muted);line-height:1.75;max-width:580px;margin:0 auto}

        /* ─────────────────────────────────────────────────────────
           STATS
        ───────────────────────────────────────────────────────── */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:clamp(3rem,6vw,5rem)}
        @media(max-width:580px){.stats{grid-template-columns:repeat(2,1fr)}}
        .stat-box{background:var(--bg2);padding:2rem 1.5rem;text-align:center;transition:background .2s}
        .stat-box:hover{background:var(--bg3)}
        .stat-val{font-size:clamp(1.8rem,4vw,2.4rem);font-weight:800;letter-spacing:-.04em;color:var(--cyan);font-family:var(--d)}
        .stat-lbl{font-family:var(--m);font-size:.65rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:.3rem}

        /* ─────────────────────────────────────────────────────────
           SECTIONS — structure commune
        ───────────────────────────────────────────────────────── */
        .section{padding:clamp(2.5rem,5vw,3.5rem) 0}
        .sec-label{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.5rem;display:flex;align-items:center;gap:.4rem}
        .sec-label::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}
        .sec-title{font-size:clamp(1.5rem,3.5vw,2.1rem);font-weight:800;letter-spacing:-.04em;line-height:1.1;margin-bottom:1.5rem;color:var(--text)}

        /* ─────────────────────────────────────────────────────────
           ORIGINE — texte narratif
        ───────────────────────────────────────────────────────── */
        .origin-paras{display:flex;flex-direction:column;gap:1.1rem;max-width:720px}
        .origin-p{font-family:var(--m);font-size:.82rem;color:var(--muted);line-height:1.9;font-weight:300}
        .origin-p:first-child{font-family:var(--m);font-size:.88rem;color:#c8d5e0;line-height:1.85;font-weight:300}

        /* ─────────────────────────────────────────────────────────
           MANIFESTE — 6 cards 2×3
        ───────────────────────────────────────────────────────── */
        .manifesto-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.15rem}
        .mcard{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1.65rem;transition:all .2s;position:relative;overflow:hidden}
        .mcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--cyan);transform:scaleX(0);transform-origin:left;transition:transform .28s}
        .mcard:hover{border-color:var(--glow);transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,.4)}
        .mcard:hover::before{transform:scaleX(1)}
        .mcard-icon{font-size:1.6rem;margin-bottom:1rem;display:block}
        .mcard-title{font-family:var(--d);font-size:.92rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.55rem;color:var(--text)}
        .mcard-text{font-family:var(--m);font-size:.73rem;color:var(--muted);line-height:1.75;font-weight:300}

        /* ─────────────────────────────────────────────────────────
           POUR QUI — 4 profils en grille
        ───────────────────────────────────────────────────────── */
        .profiles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.15rem}
        .pcard{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1.65rem;transition:all .2s;display:flex;flex-direction:column;gap:.55rem}
        .pcard:hover{border-color:var(--glow);transform:translateY(-2px)}
        .pcard-icon{font-size:1.6rem}
        .pcard-title{font-family:var(--d);font-size:.92rem;font-weight:700;letter-spacing:-.02em;color:var(--text)}
        .pcard-text{font-family:var(--m);font-size:.72rem;color:var(--muted);line-height:1.72;font-weight:300;flex:1}

        /* ─────────────────────────────────────────────────────────
           SCORING — tableau des critères
        ───────────────────────────────────────────────────────── */
        .scoring-intro{font-family:var(--m);font-size:.8rem;color:var(--muted);font-weight:300;line-height:1.7;margin-bottom:1.5rem}
        .criteria-list{display:flex;flex-direction:column;gap:.75rem}
        .criterion{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.35rem;display:grid;grid-template-columns:auto 1fr auto;gap:.75rem 1rem;align-items:start;transition:border-color .18s}
        .criterion:hover{border-color:var(--glow)}
        .crit-weight{font-family:var(--m);font-size:.75rem;font-weight:700;color:var(--cyan);white-space:nowrap;padding-top:.05rem}
        .crit-name{font-family:var(--d);font-size:.88rem;font-weight:700;color:var(--text);letter-spacing:-.01em;margin-bottom:.2rem}
        .crit-desc{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.6}
        .crit-bar-wrap{grid-column:1/-1;height:3px;background:var(--bg3);border-radius:2px;overflow:hidden}
        .crit-bar{height:100%;background:var(--cyan);border-radius:2px;opacity:.45}

        /* ─────────────────────────────────────────────────────────
           TIMELINE
        ───────────────────────────────────────────────────────── */
        .timeline{display:flex;flex-direction:column;gap:0}
        .tl-step{display:grid;grid-template-columns:52px 1fr;gap:1.5rem;position:relative}
        .tl-step:not(:last-child)::after{content:'';position:absolute;left:25px;top:46px;bottom:-1px;width:2px;background:var(--border)}
        .tl-num{width:38px;height:38px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--m);font-size:.65rem;font-weight:600;color:var(--cyan);flex-shrink:0;position:relative;z-index:1;transition:all .2s}
        .tl-step:hover .tl-num{background:var(--cdim);border-color:var(--glow)}
        .tl-content{padding:0 0 2.5rem}
        .tl-title{font-family:var(--d);font-size:.95rem;font-weight:700;letter-spacing:-.02em;color:var(--text);margin-bottom:.4rem}
        .tl-text{font-family:var(--m);font-size:.73rem;color:var(--muted);line-height:1.7;font-weight:300}

        /* ─────────────────────────────────────────────────────────
           MISSION
        ───────────────────────────────────────────────────────── */
        .mission-box{background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:clamp(2rem,4vw,3rem);position:relative;overflow:hidden}
        .mission-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .mission-glow{position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:500px;height:280px;background:radial-gradient(ellipse,rgba(0,230,190,.05),transparent 70%);pointer-events:none}
        .mission-title{font-size:clamp(1.4rem,3vw,1.9rem);font-weight:800;letter-spacing:-.03em;margin-bottom:1rem;position:relative;z-index:1}
        .mission-text{font-family:var(--m);font-size:.82rem;line-height:1.9;color:var(--muted);max-width:700px;position:relative;z-index:1;font-weight:300}

        /* ─────────────────────────────────────────────────────────
           CONTACT + NEWSLETTER — grille basse
        ───────────────────────────────────────────────────────── */
        .bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-top:1.5rem}
        @media(max-width:620px){.bottom-grid{grid-template-columns:1fr}}
        .bcard{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1.75rem;transition:border-color .2s;display:flex;flex-direction:column;gap:.5rem}
        .bcard:hover{border-color:var(--glow)}
        .bcard-label{font-family:var(--m);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
        .bcard-title{font-family:var(--d);font-size:1.05rem;font-weight:700;letter-spacing:-.02em;color:var(--text)}
        .bcard-text{font-family:var(--m);font-size:.73rem;color:var(--muted);line-height:1.65;font-weight:300}
        .contact-items{display:flex;flex-direction:column;gap:.35rem;margin:.4rem 0 .6rem}
        .contact-item{font-family:var(--m);font-size:.68rem;color:var(--muted);display:flex;align-items:center;gap:.4rem}
        .btn-p{display:inline-flex;align-items:center;gap:.4rem;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.82rem;padding:10px 20px;border-radius:8px;text-decoration:none;transition:all .2s;letter-spacing:-.01em}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,230,190,.28)}

        /* Newsletter card */
        .nl-card-proof{display:flex;align-items:center;gap:.6rem;margin:.5rem 0}
        .nl-avs{display:flex}
        .nl-av{width:24px;height:24px;border-radius:50%;background:var(--bg3);border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;font-size:.65rem;margin-left:-6px}
        .nl-av:first-child{margin-left:0}
        .nl-proof-txt{font-family:var(--m);font-size:.65rem;color:var(--muted)}
        .nl-proof-txt strong{color:var(--cyan)}
        .btn-s{display:inline-flex;align-items:center;gap:.4rem;background:transparent;color:var(--cyan);font-family:var(--d);font-weight:700;font-size:.82rem;padding:10px 20px;border-radius:8px;text-decoration:none;transition:all .2s;letter-spacing:-.01em;border:1px solid var(--glow)}
        .btn-s:hover{background:var(--cdim);transform:translateY(-1px)}

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
          <li><a href={l("/contact")}>{t.nav.contact}</a></li>
          <li><a href={l("/about")} className="active">{t.nav.about}</a></li>
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

        {/* ── HERO ── */}
        <div className="hero">
          <div className="badge"><div className="badge-dot" />{t.badge}</div>
          <h1 className="hero-title">{t.title}<br /><span className="ac">{t.titleAccent}</span></h1>
          <p className="hero-sub">{t.subtitle}</p>
        </div>

        {/* ── STATS ── */}
        <div className="stats">
          {t.stats.map((s, i) => (
            <div key={i} className="stat-box">
              <Counter value={s.value} />
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── ORIGINE ── */}
        <div className="section">
          <div className="sec-label">{t.origin.label}</div>
          <h2 className="sec-title">{t.origin.title}</h2>
          <div className="origin-paras">
            {t.origin.paragraphs.map((p, i) => (
              <p key={i} className="origin-p">{p}</p>
            ))}
          </div>
        </div>

        {/* ── MANIFESTE ── */}
        <div className="section">
          <div className="sec-label">{t.manifesto.label}</div>
          <div className="manifesto-grid">
            {t.manifesto.blocks.map((b, i) => (
              <div key={i} className="mcard">
                <span className="mcard-icon">{b.icon}</span>
                <div className="mcard-title">{b.title}</div>
                <p className="mcard-text">{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── POUR QUI ── */}
        <div className="section">
          <div className="sec-label">{t.forWho.label}</div>
          <h2 className="sec-title">{t.forWho.title}</h2>
          <div className="profiles-grid">
            {t.forWho.profiles.map((p, i) => (
              <div key={i} className="pcard">
                <span className="pcard-icon">{p.icon}</span>
                <div className="pcard-title">{p.title}</div>
                <p className="pcard-text">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── MÉTHODE DE SCORING ── */}
        <div className="section">
          <div className="sec-label">{t.scoring.label}</div>
          <h2 className="sec-title">{t.scoring.title}</h2>
          <p className="scoring-intro">{t.scoring.intro}</p>
          <div className="criteria-list">
            {t.scoring.criteria.map((c, i) => {
              const widths = ["30%", "25%", "20%", "15%", "10%"];
              return (
                <div key={i} className="criterion">
                  <div className="crit-weight">{c.weight}</div>
                  <div>
                    <div className="crit-name">{c.name}</div>
                    <div className="crit-desc">{c.desc}</div>
                  </div>
                  <div />
                  <div className="crit-bar-wrap" style={{ gridColumn: "1/-1" }}>
                    <div className="crit-bar" style={{ width: widths[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── COMMENT ON TRAVAILLE ── */}
        <div className="section">
          <div className="sec-label">{t.howWeWork.label}</div>
          <div className="timeline">
            {t.howWeWork.steps.map((s, i) => (
              <div key={i} className="tl-step">
                <div className="tl-num">{s.num}</div>
                <div className="tl-content">
                  <div className="tl-title">{s.title}</div>
                  <p className="tl-text">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MISSION ── */}
        <div className="section">
          <div className="mission-box">
            <div className="mission-glow" />
            <div className="sec-label" style={{ marginBottom: "1.25rem" }}>{t.mission.label}</div>
            <h2 className="mission-title">{t.mission.title}</h2>
            <p className="mission-text">{t.mission.text}</p>
          </div>

          {/* Contact + Newsletter */}
          <div className="bottom-grid">
            <div className="bcard">
              <div className="bcard-label">{t.contact.label}</div>
              <div className="bcard-title">{t.contact.title}</div>
              <p className="bcard-text">{t.contact.text}</p>
              <div className="contact-items">
                {t.contact.items.map((item, i) => (
                  <div key={i} className="contact-item">
                    <span>{item.icon}</span>{item.label}
                  </div>
                ))}
              </div>
              <a href={`mailto:${t.contact.email}`} className="btn-p">✉ {t.contact.emailLabel}</a>
            </div>
            <div className="bcard">
              <div className="bcard-label">{t.newsletter.label}</div>
              <div className="bcard-title">{t.newsletter.title}</div>
              <p className="bcard-text">{t.newsletter.text}</p>
              <div className="nl-card-proof">
                <div className="nl-avs">
                  {AVATARS.map((a, i) => <div key={i} className="nl-av">{a}</div>)}
                </div>
                <div className="nl-proof-txt">
                  <strong>{lang === "fr" ? "3 200+" : "3,200+"}</strong> {lang === "fr" ? "abonnés" : "subscribers"}
                </div>
              </div>
              <a href={l("/newsletter")} className="btn-s">{t.newsletter.cta}</a>
            </div>
          </div>
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