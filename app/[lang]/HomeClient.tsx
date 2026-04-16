
"use client";

import Link from "next/link";
import Script from "next/script";
import { useState, useRef, useEffect, useMemo, useId } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNewsletter } from "../../lib/useNewsletter";

type Lang = "fr" | "en";

type HomeComparatif = {
  slug: string;
  tag: string;
  color: string;
  winner: string;
  winnerScore: number;
  title: string;
  subtitle: string;
  tools: { name: string; score: number }[];
  isNew: boolean;
  isFeat: boolean;
  updated?: { fr: string; en: string };
};

type HomeArticle = {
  slug: string;
  tag: string;
  color: string;
  t: string;
  d: string;
  time: string;
  star: boolean;
  updated?: { fr: string; en: string };
};

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    hero: {
      badge: "Indépendant · Tests réels · Sans bullshit",
      h1a: "Les meilleurs outils IA,",
      h1b: "enfin comparés honnêtement.",
      sub: "Neuriflux teste, compare et décortique les outils IA pour vous faire gagner du temps, éviter les mauvais choix et trouver les vraies solutions qui valent le coup.",
      extraSeo: "Comparez ChatGPT, Claude, Gemini, Midjourney, Runway, n8n, Make et les meilleurs outils IA 2026 avec des tests réels, des scores détaillés et des verdicts honnêtes.",
      cta1: "Voir les comparatifs →",
      cta2: "Lire le blog",
      cta3: "Recevoir le radar IA",
      socialProof: "Déjà lu par 3 200+ passionnés, freelances, marketeurs et créateurs.",
      tickerLabel: "Actus",
      tickerItems: [
        { label: "Grok review 2026", href: "/blog/grok-review-2026" },
        { label: "Runway vs Kling vs Pika", href: "/comparatifs/runway-vs-kling-vs-pika-2026" },
        { label: "DeepSeek V4 analysé", href: "/blog/deepseek-review-2026" },
        { label: "Sora fermé par OpenAI", href: "/blog/sora-fermeture-openai-2026" },
      ],
    },
    stats: [
      { v: "120+", l: "Outils analysés" },
      { v: "48h", l: "Temps moyen de test" },
      { v: "100%", l: "Indépendant" },
    ],
    trust: [
      { icon: "⚡", t: "Indépendant", d: "Aucun éditeur ne finance nos avis ni nos classements." },
      { icon: "🔬", t: "Tests réels", d: "Comparatifs basés sur des usages concrets, pas sur du blabla marketing." },
      { icon: "💰", t: "Transparent", d: "Liens affiliés toujours signalés, verdicts jamais vendus." },
    ],
    compTag: "Comparatifs",
    compTitle: "Nos comparatifs phares",
    compSub: "Scores objectifs · Tests en conditions réelles · Zéro bullshit",
    compVoir: "Voir →",
    compFeat: "À la une",
    compAll: "Tous les comparatifs →",
    compFresh: "Mis à jour",
    comparatifs: [
      {
        slug: "n8n-vs-make-vs-zapier-2026",
        tag: "Productivité",
        color: "#ff4a00",
        winner: "Make",
        winnerScore: 8.9,
        title: "n8n vs Make vs Zapier 2026 : comparatif complet",
        subtitle: "On a testé les 3 leaders de l'automatisation sur des projets réels. Tarifs, IA native, facilité d'usage : notre verdict honnête pour choisir le bon outil en 2026.",
        tools: [{ name: "Zapier", score: 7.8 }, { name: "Make", score: 8.9 }, { name: "n8n", score: 8.4 }],
        isNew: true,
        isFeat: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "runway-vs-kling-vs-pika-2026",
        tag: "Vidéo IA",
        color: "#a855f7",
        winner: "Runway",
        winnerScore: 9.0,
        title: "Runway vs Kling vs Pika 2026 : lequel choisir ?",
        subtitle: "Quel générateur vidéo IA choisir après la fermeture de Sora ? Qualité, cohérence, vitesse, workflow et rapport qualité/prix.",
        tools: [{ name: "Runway Gen-4", score: 9.0 }, { name: "Kling 2.6", score: 8.7 }, { name: "Pika 2.5", score: 7.8 }],
        isNew: true,
        isFeat: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "chatgpt-vs-claude-vs-gemini",
        tag: "Chatbots",
        color: "#00e6be",
        winner: "Claude",
        winnerScore: 9.2,
        title: "ChatGPT vs Claude vs Gemini 2026 : lequel choisir ?",
        subtitle: "50 cas d'usage réels, des prompts concrets, des forces et faiblesses nettes. Le vrai verdict sans filtre.",
        tools: [{ name: "ChatGPT", score: 8.5 }, { name: "Claude", score: 9.2 }, { name: "Gemini", score: 7.8 }],
        isNew: false,
        isFeat: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "midjourney-vs-dalle-vs-stable-diffusion",
        tag: "Image",
        color: "#7c3aed",
        winner: "Midjourney",
        winnerScore: 9.1,
        title: "Midjourney vs DALL·E vs Stable Diffusion 2026",
        subtitle: "300 images, plusieurs styles, vrais prompts et critères visuels. Le vrai gagnant en création d'image IA.",
        tools: [{ name: "Midjourney", score: 9.1 }, { name: "DALL·E 3", score: 8.0 }, { name: "Stable Diffusion", score: 7.8 }],
        isNew: false,
        isFeat: false,
        updated: { fr: "mars 2026", en: "March 2026" },
      },
      {
        slug: "elevenlabs-vs-openai-tts-vs-playht",
        tag: "Audio",
        color: "#ef4444",
        winner: "ElevenLabs",
        winnerScore: 9.0,
        title: "ElevenLabs vs OpenAI TTS vs PlayHT 2026",
        subtitle: "Clonage vocal, qualité, API, stabilité et rendu réel : le meilleur outil voix IA selon ton besoin.",
        tools: [{ name: "ElevenLabs", score: 9.0 }, { name: "OpenAI TTS", score: 8.0 }, { name: "PlayHT", score: 7.8 }],
        isNew: false,
        isFeat: false,
        updated: { fr: "mars 2026", en: "March 2026" },
      },
      {
        slug: "jasper-vs-copyai-vs-claude",
        tag: "Rédaction",
        color: "#f59e0b",
        winner: "Claude",
        winnerScore: 9.0,
        title: "Jasper vs Copy.ai vs Claude 2026",
        subtitle: "20 formats testés, SEO, qualité de texte, rapidité, workflow et rapport qualité/prix pour écrire mieux en 2026.",
        tools: [{ name: "Jasper", score: 7.5 }, { name: "Copy.ai", score: 7.2 }, { name: "Claude", score: 9.0 }],
        isNew: false,
        isFeat: false,
        updated: { fr: "mars 2026", en: "March 2026" },
      },
    ] as HomeComparatif[],
    artTag: "Populaire",
    artTitle: "Articles les plus lus",
    artSub: "Cette semaine sur Neuriflux",
    read: "min",
    readMore: "Lire →",
    featured: "À la une",
    artAll: "Tous les articles →",
    artFresh: "Mis à jour",
    articles: [
      {
        slug: "deepseek-review-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "DeepSeek : avis 2026, le meilleur ChatGPT gratuit venu de Chine ?",
        d: "DeepSeek a bouleversé le marché IA. Performances, vie privée, vrais cas d'usage et limites : notre verdict complet.",
        time: "12",
        star: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "grok-review-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "Grok : avis 2026, l'IA d'Elon Musk vaut-elle vraiment le coup ?",
        d: "Grok 3 et 4 promettent données temps réel, contexte géant et ton plus brut. On a tout testé pendant 3 semaines.",
        time: "13",
        star: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "perplexity-ai-review-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "Perplexity AI : vaut-il mieux que ChatGPT et Google ?",
        d: "Recherche sourcée, Perplexity Pro, Perplexity Computer et limites réelles : notre verdict complet.",
        time: "13",
        star: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "chatgpt-claude-gemini-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "ChatGPT perd-il du terrain face à Claude et Gemini en 2026 ?",
        d: "ChatGPT reste massif, Claude monte chez les profils exigeants, Gemini pousse via Google. L'analyse complète du basculement.",
        time: "16",
        star: false,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "sora-fermeture-openai-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "Sora est mort : OpenAI abandonne son générateur vidéo IA",
        d: "La fermeture de Sora racontée sans filtre : coûts, revenus, stratégie et pourquoi l'échec compte pour tout le marché IA.",
        time: "13",
        star: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "jasper-ai-review-2026",
        tag: "Rédaction",
        color: "#f59e0b",
        t: "Jasper AI : avis 2026, faut-il encore le payer ?",
        d: "3 semaines de tests sur des projets réels. Notre verdict honnête sur Jasper face à Claude et Copy.ai.",
        time: "10",
        star: false,
        updated: { fr: "mars 2026", en: "March 2026" },
      },
    ] as HomeArticle[],
    nlTitle: "Le radar IA · chaque lundi",
    nlSub: "1 email utile par semaine pour éviter 3 heures de veille : outils qui valent le coup, comparatifs qui comptent, nouveautés à ne pas rater.",
    nlBullets: ["Comparatifs honnêtes", "Nouveautés IA utiles", "Aucun spam"],
    nlCta: "Je m'abonne gratuitement",
    nlLoading: "...",
    nlPrivacy: "Gratuit · Sans spam · Désabonnement en 1 clic",
    nlSuccess: "✓ Bienvenue ! À lundi prochain.",
    nlError: "Une erreur s'est produite. Réessayez.",
    nlPh: "votre@email.com",
    hiddenSeo: "Comparatifs IA, avis IA 2026, ChatGPT vs Claude, meilleurs outils IA, tests réels, Midjourney, Runway, Gemini, Perplexity, DeepSeek.",
    srSkip: "Aller au contenu principal",
    menu: "Menu principal",
    closeMenu: "Fermer le menu",
    langSwitch: "Changer de langue",
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
      sub: "Neuriflux tests, compares and breaks down AI tools to help you save time, avoid bad picks, and find what is actually worth using.",
      extraSeo: "Compare ChatGPT, Claude, Gemini, Midjourney, Runway, n8n, Make and the best AI tools of 2026 with real tests, detailed scores and honest verdicts.",
      cta1: "Browse comparisons →",
      cta2: "Read the blog",
      cta3: "Get the AI radar",
      socialProof: "Already read by 3,200+ makers, freelancers, marketers and creators.",
      tickerLabel: "Latest",
      tickerItems: [
        { label: "Grok review 2026", href: "/blog/grok-review-2026" },
        { label: "Runway vs Kling vs Pika", href: "/comparatifs/runway-vs-kling-vs-pika-2026" },
        { label: "DeepSeek V4 analyzed", href: "/blog/deepseek-review-2026" },
        { label: "Sora shut down by OpenAI", href: "/blog/sora-fermeture-openai-2026" },
      ],
    },
    stats: [
      { v: "120+", l: "Tools analyzed" },
      { v: "48h", l: "Average test time" },
      { v: "100%", l: "Independent" },
    ],
    trust: [
      { icon: "⚡", t: "Independent", d: "No vendor funds our reviews or rankings." },
      { icon: "🔬", t: "Real tests", d: "Comparisons based on real usage, not recycled marketing copy." },
      { icon: "💰", t: "Transparent", d: "Affiliate links are always disclosed, verdicts are never sold." },
    ],
    compTag: "Comparisons",
    compTitle: "Featured comparisons",
    compSub: "Objective scores · Real-world tests · Zero fluff",
    compVoir: "View →",
    compFeat: "Featured",
    compAll: "All comparisons →",
    compFresh: "Updated",
    comparatifs: [
      {
        slug: "n8n-vs-make-vs-zapier-2026",
        tag: "Productivity",
        color: "#ff4a00",
        winner: "Make",
        winnerScore: 8.9,
        title: "n8n vs Make vs Zapier 2026: full comparison",
        subtitle: "We tested the three automation leaders on real projects. Pricing, native AI, ease of use and where each one actually wins.",
        tools: [{ name: "Zapier", score: 7.8 }, { name: "Make", score: 8.9 }, { name: "n8n", score: 8.4 }],
        isNew: true,
        isFeat: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "runway-vs-kling-vs-pika-2026",
        tag: "AI Video",
        color: "#a855f7",
        winner: "Runway",
        winnerScore: 9.0,
        title: "Runway vs Kling vs Pika 2026: which one wins?",
        subtitle: "Which AI video generator should you pick after Sora's shutdown? Quality, motion consistency, speed and workflow.",
        tools: [{ name: "Runway Gen-4", score: 9.0 }, { name: "Kling 2.6", score: 8.7 }, { name: "Pika 2.5", score: 7.8 }],
        isNew: true,
        isFeat: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "chatgpt-vs-claude-vs-gemini",
        tag: "Chatbots",
        color: "#00e6be",
        winner: "Claude",
        winnerScore: 9.2,
        title: "ChatGPT vs Claude vs Gemini 2026: which should you choose?",
        subtitle: "50 real-world use cases, real prompts, clear strengths and weaknesses. The unfiltered verdict.",
        tools: [{ name: "ChatGPT", score: 8.5 }, { name: "Claude", score: 9.2 }, { name: "Gemini", score: 7.8 }],
        isNew: false,
        isFeat: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "midjourney-vs-dalle-vs-stable-diffusion",
        tag: "Image",
        color: "#7c3aed",
        winner: "Midjourney",
        winnerScore: 9.1,
        title: "Midjourney vs DALL·E vs Stable Diffusion 2026",
        subtitle: "300 images, multiple styles and real prompts. Which image model is actually the strongest right now?",
        tools: [{ name: "Midjourney", score: 9.1 }, { name: "DALL·E 3", score: 8.0 }, { name: "Stable Diffusion", score: 7.8 }],
        isNew: false,
        isFeat: false,
        updated: { fr: "mars 2026", en: "March 2026" },
      },
      {
        slug: "elevenlabs-vs-openai-tts-vs-playht",
        tag: "Audio",
        color: "#ef4444",
        winner: "ElevenLabs",
        winnerScore: 9.0,
        title: "ElevenLabs vs OpenAI TTS vs PlayHT 2026",
        subtitle: "Voice cloning, API quality, workflow and output realism: the best voice AI depending on what you need.",
        tools: [{ name: "ElevenLabs", score: 9.0 }, { name: "OpenAI TTS", score: 8.0 }, { name: "PlayHT", score: 7.8 }],
        isNew: false,
        isFeat: false,
        updated: { fr: "mars 2026", en: "March 2026" },
      },
      {
        slug: "jasper-vs-copyai-vs-claude",
        tag: "Writing",
        color: "#f59e0b",
        winner: "Claude",
        winnerScore: 9.0,
        title: "Jasper vs Copy.ai vs Claude 2026",
        subtitle: "20 writing formats tested across SEO, output quality, workflow and value for money.",
        tools: [{ name: "Jasper", score: 7.5 }, { name: "Copy.ai", score: 7.2 }, { name: "Claude", score: 9.0 }],
        isNew: false,
        isFeat: false,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
    ] as HomeComparatif[],
    artTag: "Popular",
    artTitle: "Most read articles",
    artSub: "This week on Neuriflux",
    read: "min",
    readMore: "Read →",
    featured: "Featured",
    artAll: "All articles →",
    artFresh: "Updated",
    articles: [
      {
        slug: "deepseek-review-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "DeepSeek Review 2026: the best free ChatGPT alternative?",
        d: "DeepSeek shook the AI industry. Performance, privacy, real use cases and limits: our complete verdict.",
        time: "12",
        star: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "grok-review-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "Grok Review 2026: is Elon Musk's AI actually worth it?",
        d: "Grok 3 and 4 promise real-time data, giant context and a rougher tone. We tested everything for three weeks.",
        time: "13",
        star: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "perplexity-ai-review-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "Perplexity AI: is it worth it vs ChatGPT and Google?",
        d: "Sourced search, Perplexity Pro, Perplexity Computer and the real limits: our complete verdict.",
        time: "13",
        star: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "chatgpt-vs-claude-vs-gemini-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "ChatGPT vs Claude vs Gemini: which should you pick in 2026?",
        d: "50 real-world use cases. The results are more nuanced than most people think.",
        time: "12",
        star: false,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "sora-fermeture-openai-2026",
        tag: "Chatbots",
        color: "#00e6be",
        t: "Sora is dead: OpenAI kills its AI video app",
        d: "The shutdown of Sora explained without fluff: costs, revenue, strategy and why this failure matters across AI.",
        time: "12",
        star: true,
        updated: { fr: "avril 2026", en: "April 2026" },
      },
      {
        slug: "vibe-coding-tools-2026",
        tag: "Code",
        color: "#3b82f6",
        t: "5 best tools to build an app without coding in 2026",
        d: "Lovable, Bolt.new, v0, Base44, Replit: we tested the leading vibe coding tools on real projects.",
        time: "16",
        star: false,
        updated: { fr: "mars 2026", en: "March 2026" },
      },
    ] as HomeArticle[],
    nlTitle: "The AI Radar · every Monday",
    nlSub: "One useful email each week to save yourself three hours of scrolling: tools worth using, comparisons that matter, and launches worth noticing.",
    nlBullets: ["Honest comparisons", "Useful AI updates", "No spam"],
    nlCta: "Subscribe for free",
    nlLoading: "...",
    nlPrivacy: "Free · No spam · Unsubscribe in 1 click",
    nlSuccess: "✓ Welcome! See you next Monday.",
    nlError: "Something went wrong. Please try again.",
    nlPh: "your@email.com",
    hiddenSeo: "AI tools comparison, AI reviews 2026, ChatGPT vs Claude, best AI tools, real tests, Midjourney, Runway, Gemini, Perplexity, DeepSeek.",
    srSkip: "Skip to main content",
    menu: "Main navigation",
    closeMenu: "Close menu",
    langSwitch: "Change language",
    ftTagline: "The independent AI tools media.",
    ftContent: "Content",
    ftLegal: "Legal",
    ftLinks: [{ l: "Blog", h: "/blog" }, { l: "Comparisons", h: "/comparatifs" }, { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "About", h: "/about" }],
    ftLegal2: [{ l: "Legal notice", h: "/legal" }, { l: "Privacy", h: "/privacy" }, { l: "Cookies", h: "/cookies" }],
    ftRights: "All rights reserved.",
    ftMade: "Made with ♥ in France",
  },
} as const;

const AVATARS = ["👨‍💻", "👩‍💼", "🧑‍🎨", "👩‍💻", "🧑‍🚀"];

function trackEvent(eventName: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: eventName, ...payload });
  if (typeof w.gtag === "function") w.gtag("event", eventName, payload);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function Counter({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const num = parseInt(value.replace(/\D/g, ""), 10);
    const suffix = value.replace(/[0-9]/g, "");
    if (Number.isNaN(num)) {
      setDisplay(value);
      return;
    }
    if (reducedMotion) {
      setDisplay(`${num}${suffix}`);
      return;
    }
    const run = () => {
      if (done.current) return;
      done.current = true;
      const start = performance.now();
      const tick = (time: number) => {
        const progress = Math.min((time - start) / 1100, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(`${Math.floor(eased * num)}${suffix}`);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) run();
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reducedMotion, value]);

  return <span ref={ref}>{display}</span>;
}

export default function HomeClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = T[lang];
  const menuId = useId();
  const l = (p: string) => `/${lang}${p}`;
  const { status, subscribe } = useNewsletter("homepage");

  const itemListSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: lang === "fr" ? "Neuriflux — meilleurs outils IA comparés" : "Neuriflux — best AI tools compared",
    url: `https://neuriflux.com/${lang}`,
    mainEntity: [
      {
        "@type": "ItemList",
        name: lang === "fr" ? "Comparatifs IA à la une" : "Featured AI comparisons",
        itemListElement: t.comparatifs.map((c, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: c.title,
          url: `https://neuriflux.com/${lang}/comparatifs/${c.slug}`,
        })),
      },
      {
        "@type": "ItemList",
        name: lang === "fr" ? "Articles IA populaires" : "Popular AI articles",
        itemListElement: t.articles.map((a, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: a.t,
          url: `https://neuriflux.com/${lang}/blog/${a.slug}`,
        })),
      },
    ],
  }), [lang, t.articles, t.comparatifs]);

  const organizationSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Neuriflux",
    url: "https://neuriflux.com",
    logo: "https://neuriflux.com/logo.png",
    description: lang === "fr"
      ? "Média indépendant de comparatifs et avis sur les outils IA."
      : "Independent media for AI tools comparisons and reviews.",
  }), [lang]);

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    trackEvent("homepage_language_switch", { from: lang, to: next });
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenu(false); }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    document.addEventListener("keydown", onEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menu]);

  useEffect(() => {
    if (status === "success") {
      setEmail("");
      trackEvent("homepage_newsletter_success", { lang });
    } else if (status === "error") {
      trackEvent("homepage_newsletter_error", { lang });
    }
  }, [lang, status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("homepage_newsletter_submit", { lang, placement: "homepage" });
    await subscribe(email, lang);
  };

  return (
    <>
      <Script id="home-collection-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <Script id="home-organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <style>{`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080c10;
  --bg2:#0d1117;
  --bg3:#111820;
  --bg4:#151e29;
  --border:rgba(255,255,255,.065);
  --glow:rgba(0,230,190,.2);
  --cyan:#00e6be;
  --cdim:rgba(0,230,190,.09);
  --text:#edf2f7;
  --muted:#7a8a9a;
  --dim:#405164;
  --d:'Syne',sans-serif;
  --m:'JetBrains Mono',monospace;
  --r:14px;
  --pad:clamp(1.25rem,5vw,4rem)
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}
.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.skip-link{position:absolute;left:12px;top:-100px;z-index:500;background:var(--cyan);color:#071018;padding:10px 14px;border-radius:8px;font-family:var(--m);font-size:.72rem;font-weight:700;text-decoration:none;transition:top .2s}
.skip-link:focus{top:12px}
.bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.02) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
.bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:min(820px,92vw);height:520px;background:radial-gradient(ellipse,rgba(0,230,190,.06) 0%,transparent 68%);pointer-events:none;z-index:0}
nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(8,12,16,.9);border-bottom:1px solid var(--border);padding:0 var(--pad);height:64px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .25s, background .25s}
nav.scrolled{box-shadow:0 8px 32px rgba(0,0,0,.42);background:rgba(8,12,16,.96)}
.logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
.logo em{color:var(--cyan);font-style:normal}
.logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.45}}
.nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
@media(max-width:720px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;align-items:flex-start;position:fixed;top:64px;left:0;right:0;background:rgba(13,17,23,.98);border-bottom:1px solid var(--border);padding:1.2rem var(--pad) 1.4rem;gap:1rem;z-index:99}}
.nav-links a{font-family:var(--m);font-size:.74rem;color:var(--muted);text-decoration:none;letter-spacing:.03em;transition:color .15s}
.nav-links a:hover,.nav-links a.active{color:var(--cyan)}
.lt{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:3px;display:flex;gap:2px}
.lb{font-family:var(--m);font-size:.67rem;font-weight:600;padding:4px 9px;border-radius:6px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s}
.lb.on{background:var(--cyan);color:#080c10}
.hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}
@media(max-width:720px){.hb{display:flex}}
.hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}
.hero{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:clamp(4rem,9vw,6.8rem) var(--pad) clamp(2.5rem,4vw,3.2rem);display:flex;flex-direction:column;align-items:center;text-align:center}
.hero-wrap{max-width:810px;width:100%;display:flex;flex-direction:column;align-items:center}
.badge{display:inline-flex;align-items:center;gap:.45rem;font-family:var(--m);font-size:.67rem;letter-spacing:.07em;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:6px 14px;margin-bottom:1.35rem}
.badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
h1{font-size:clamp(2.15rem,5.6vw,4rem);font-weight:800;line-height:1.04;letter-spacing:-.045em;margin-bottom:1rem;color:var(--text)}
h1 em{color:var(--cyan);font-style:normal;position:relative}
h1 em::after{content:'';position:absolute;bottom:2px;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);opacity:.42;border-radius:2px}
.hero-sub{font-family:var(--m);font-size:.86rem;font-weight:300;color:var(--muted);line-height:1.85;max-width:700px;margin-bottom:1rem;text-align:center}
.hero-seo{font-family:var(--m);font-size:.73rem;font-weight:300;color:var(--dim);line-height:1.8;max-width:760px;margin-bottom:1.45rem;text-align:center}
.hero-proof{font-family:var(--m);font-size:.72rem;color:var(--cyan);margin-bottom:1.55rem;background:rgba(0,230,190,.06);border:1px solid rgba(0,230,190,.12);padding:7px 12px;border-radius:999px}
.ctas{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1.2rem;justify-content:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;font-family:var(--d);font-weight:700;font-size:.84rem;padding:12px 22px;border-radius:10px;text-decoration:none;transition:all .2s;letter-spacing:-.01em;border:none;cursor:pointer}
.btn-p{background:var(--cyan);color:var(--bg)}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,230,190,.24)}
.btn-p:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
.btn-s{background:transparent;color:var(--text);border:1px solid var(--border)}
.btn-s:hover{border-color:var(--glow);background:var(--cdim);color:var(--cyan)}
.hero-links{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin-bottom:2rem}
.hero-link{font-family:var(--m);font-size:.68rem;color:var(--muted);text-decoration:none;padding:6px 10px;border:1px solid var(--border);border-radius:999px;transition:all .15s}
.hero-link:hover{color:var(--cyan);border-color:rgba(0,230,190,.25);background:rgba(0,230,190,.04)}
.stats{display:flex;gap:clamp(1.25rem,4vw,3rem);border-top:1px solid var(--border);padding-top:1.75rem;flex-wrap:wrap;justify-content:center;width:100%}
.st-box{min-width:120px}
.st-v{font-family:var(--d);font-size:clamp(1.45rem,3.4vw,2rem);font-weight:800;letter-spacing:-.04em;color:var(--text);text-align:center}
.st-l{font-family:var(--m);font-size:.63rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:.18rem;text-align:center}
.ticker-wrap{position:relative;z-index:1;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg2);overflow:hidden;min-height:40px;display:flex;align-items:stretch;margin-top:1rem}
.ticker-label{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--bg);background:var(--cyan);padding:0 14px;display:flex;align-items:center;flex-shrink:0;font-weight:700;white-space:nowrap}
.ticker-inner{display:flex;align-items:center;overflow:hidden;flex:1;position:relative}
.ticker-track{display:flex;gap:2.5rem;align-items:center;white-space:nowrap;padding-left:2rem;animation:scroll-ticker 28s linear infinite}
.ticker-item{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;text-decoration:none;display:inline-flex;align-items:center;gap:.45rem;transition:color .15s}
.ticker-item:hover{color:var(--cyan)}
.ticker-item::before{content:"•";color:var(--dim)}
@keyframes scroll-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.ticker-wrap:hover .ticker-track{animation-play-state:paused}
.section{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:clamp(2.4rem,5vw,3.5rem) var(--pad)}
.sh{margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem}
.sh-right{font-family:var(--m);font-size:.7rem;color:var(--cyan);text-decoration:none;opacity:.72;transition:opacity .2s;white-space:nowrap}
.sh-right:hover{opacity:1}
.stag{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:.45rem;display:flex;align-items:center;gap:.4rem}
.stag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}
.stitle{font-size:clamp(1.2rem,2.6vw,1.62rem);font-weight:800;letter-spacing:-.03em;line-height:1.1;color:var(--text)}
.ssub{font-family:var(--m);font-size:.68rem;color:var(--muted);font-weight:300;margin-top:.3rem;letter-spacing:.02em}
.trust-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
@media(max-width:600px){.trust-row{grid-template-columns:1fr}}
.trust-cell{background:var(--bg2);padding:1rem 1.35rem;display:flex;gap:.7rem;align-items:flex-start}
.ti{font-size:1.05rem;flex-shrink:0}
.tt{font-family:var(--d);font-size:.82rem;font-weight:700;color:var(--text);margin-bottom:.12rem}
.td{font-family:var(--m);font-size:.67rem;color:var(--muted);font-weight:300;line-height:1.6}
.comp-grid,.art-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
@media(max-width:900px){.comp-grid,.art-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.comp-grid,.art-grid{grid-template-columns:1fr}}
.cmp,.art{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem;display:flex;flex-direction:column;gap:.65rem;text-decoration:none;transition:all .2s;overflow:hidden;position:relative;min-height:100%}
.cmp.star,.art.star{border-color:rgba(0,230,190,.13);background:linear-gradient(135deg,rgba(0,230,190,.03),var(--bg2))}
.cmp:hover,.art:hover{border-color:var(--glow);transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,0,0,.34)}
.cmp-bar,.art-bar{position:absolute;top:0;left:0;right:0;height:2px;opacity:.65;transition:opacity .2s}
.cmp:hover .cmp-bar,.art:hover .art-bar{opacity:1}
.cmp-top,.art-top{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem}
.cmp-tag,.art-tag{font-family:var(--m);font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700}
.cmp-badge,.feat-badge{font-family:var(--m);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:var(--bg);background:var(--cyan);padding:2px 7px;border-radius:100px;font-weight:700;white-space:nowrap}
.cmp-title,.art-title{font-family:var(--d);font-size:.92rem;font-weight:700;letter-spacing:-.015em;line-height:1.34;color:var(--text)}
.cmp-sub,.art-desc{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.7;font-weight:300;flex:1}
.cmp-tools{display:flex;flex-wrap:wrap;gap:.35rem}
.tool-chip{font-family:var(--m);font-size:.56rem;color:var(--dim);padding:3px 8px;border:1px solid var(--border);border-radius:999px;background:var(--bg3)}
.cmp-foot,.art-foot{display:flex;justify-content:space-between;align-items:flex-end;gap:.75rem;padding-top:.65rem;border-top:1px solid var(--border);margin-top:auto}
.cmp-meta,.art-meta{display:flex;flex-direction:column;gap:.28rem}
.cmp-winner,.art-time{font-family:var(--m);font-size:.62rem;color:var(--muted);display:flex;align-items:center;gap:.3rem;flex-wrap:wrap}
.cmp-updated,.art-updated{font-family:var(--m);font-size:.56rem;color:var(--dim)}
.cmp-score{font-family:var(--m);font-size:.6rem;font-weight:700;padding:1px 7px;border-radius:100px;border:1px solid}
.cmp-more,.art-more{font-family:var(--m);font-size:.65rem;font-weight:600;opacity:.7;transition:opacity .15s;white-space:nowrap}
.cmp:hover .cmp-more,.art:hover .art-more{opacity:1}
.cluster-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
@media(max-width:900px){.cluster-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.cluster-grid{grid-template-columns:1fr}}
.cluster-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1rem 1rem 1.1rem;text-decoration:none;transition:all .18s;display:flex;flex-direction:column;gap:.5rem}
.cluster-card:hover{border-color:rgba(0,230,190,.2);transform:translateY(-2px)}
.cluster-title{font-family:var(--d);font-size:.9rem;font-weight:700;color:var(--text)}
.cluster-sub{font-family:var(--m);font-size:.66rem;color:var(--muted);line-height:1.55}
.cluster-count{font-family:var(--m);font-size:.58rem;color:var(--cyan)}
.nl-wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 var(--pad) clamp(4rem,7vw,5rem)}
.nl-box{background:var(--bg2);border:1px solid var(--glow);border-radius:16px;padding:clamp(2rem,4vw,2.8rem);text-align:center;position:relative;overflow:hidden}
.nl-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:45%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
.nl-glow{position:absolute;top:-50%;left:50%;transform:translateX(-50%);width:420px;height:250px;background:radial-gradient(ellipse,rgba(0,230,190,.055),transparent 70%);pointer-events:none}
.nl-title{font-size:clamp(1.2rem,2.6vw,1.62rem);font-weight:800;letter-spacing:-.03em;margin-bottom:.5rem;position:relative;z-index:1}
.nl-sub{font-family:var(--m);font-size:.74rem;color:var(--muted);font-weight:300;line-height:1.8;max-width:540px;margin:0 auto 1rem;position:relative;z-index:1}
.nl-sp{display:flex;align-items:center;justify-content:center;gap:.6rem;margin-bottom:1rem;position:relative;z-index:1;flex-wrap:wrap}
.avs{display:flex}
.av{width:26px;height:26px;border-radius:50%;background:var(--bg3);border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;font-size:.72rem;margin-left:-7px}
.av:first-child{margin-left:0}
.sp-t{font-family:var(--m);font-size:.71rem;color:var(--muted)}
.sp-t strong{color:var(--cyan)}
.nl-bullets{display:flex;justify-content:center;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;position:relative;z-index:1}
.nl-bullet{font-family:var(--m);font-size:.58rem;color:var(--cyan);background:rgba(0,230,190,.08);border:1px solid rgba(0,230,190,.12);border-radius:999px;padding:4px 8px}
.nl-form{display:flex;gap:.6rem;max-width:460px;margin:0 auto .55rem;position:relative;z-index:1;flex-wrap:wrap;justify-content:center}
.nl-in{flex:1;min-width:175px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 13px;color:var(--text);font-family:var(--m);font-size:.78rem;outline:none;transition:all .2s}
.nl-in:focus{border-color:var(--glow);box-shadow:0 0 0 3px rgba(0,230,190,.05)}
.nl-in::placeholder{color:var(--dim)}
.nl-priv{font-family:var(--m);font-size:.6rem;color:var(--dim);position:relative;z-index:1}
.nl-ok{font-family:var(--m);font-size:.78rem;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:10px;padding:9px 16px;display:inline-block;position:relative;z-index:1}
.nl-err{font-family:var(--m);font-size:.74rem;color:#ef4444;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.22);border-radius:10px;padding:9px 13px;margin-bottom:.7rem;position:relative;z-index:1}
footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.25rem var(--pad);max-width:1160px;margin:0 auto}
.ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
@media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
.ft-tag{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.7;max-width:260px;margin-top:.4rem}
.ft-col{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
.ft-ul{list-style:none;display:flex;flex-direction:column;gap:.45rem}
.ft-ul a{font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;transition:color .15s;font-weight:300}
.ft-ul a:hover{color:var(--cyan)}
.ft-bot{margin-top:1.75rem;padding-top:1.1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
.ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
.ft-copy em{color:var(--cyan);font-style:normal}
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto}
  .logo-dot,.badge-dot{animation:none}
  .ticker-track{animation:none;transform:none}
  .cmp,.art,.cluster-card,.btn,.btn-s,.btn-p{transition:none}
}
`}</style>

      <a href="#main-content" className="skip-link">{t.srSkip}</a>

      <div className="bg-grid" />
      <div className="bg-glow" />

      <nav className={scrolled ? "scrolled" : ""} aria-label={t.menu}>
        <Link href={l("")} className="logo" onClick={() => trackEvent("homepage_nav_click", { location: "logo", lang })}>
          <div className="logo-dot" />Neuri<em>flux</em>
        </Link>

        <ul id={menuId} className={`nav-links${menu ? " open" : ""}`}>
          <li><Link href={l("/blog")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_blog", lang })}>{t.nav.blog}</Link></li>
          <li><Link href={l("/comparatifs")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_comparatifs", lang })}>{t.nav.comparatifs}</Link></li>
          <li><Link href={l("/newsletter")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_newsletter", lang })}>{t.nav.newsletter}</Link></li>
          <li><Link href={l("/contact")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_contact", lang })}>{t.nav.contact}</Link></li>
          <li><Link href={l("/about")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_about", lang })}>{t.nav.about}</Link></li>
        </ul>

        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
          <div className="lt" aria-label={t.langSwitch}>
            <button className={`lb${lang === "fr" ? " on" : ""}`} aria-pressed={lang === "fr"} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " on" : ""}`} aria-pressed={lang === "en"} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button
            className="hb"
            onClick={() => {
              setMenu((prev) => !prev);
              trackEvent("homepage_menu_toggle", { lang, open: !menu });
            }}
            aria-label={menu ? t.closeMenu : t.menu}
            aria-expanded={menu}
            aria-controls={menuId}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <main id="main-content">
        <div className="hero">
          <div className="hero-wrap">
            <div className="badge"><div className="badge-dot" />{t.hero.badge}</div>
            <h1>{t.hero.h1a}<br /><em>{t.hero.h1b}</em></h1>
            <p className="hero-sub">{t.hero.sub}</p>
            <p className="hero-seo">{t.hero.extraSeo}</p>
            <div className="hero-proof">⭐ {t.hero.socialProof}</div>

            <div className="ctas">
              <Link href={l("/comparatifs")} className="btn btn-p" onClick={() => trackEvent("homepage_cta_click", { location: "hero_primary", lang })}>{t.hero.cta1}</Link>
              <Link href={l("/blog")} className="btn btn-s" onClick={() => trackEvent("homepage_cta_click", { location: "hero_secondary", lang })}>{t.hero.cta2}</Link>
              <Link href={l("/newsletter")} className="btn btn-s" onClick={() => trackEvent("homepage_cta_click", { location: "hero_newsletter", lang })}>{t.hero.cta3}</Link>
            </div>

            <div className="hero-links" aria-label="Top topics">
              <Link href={l("/comparatifs/chatgpt-vs-claude-vs-gemini")} className="hero-link">ChatGPT vs Claude</Link>
              <Link href={l("/comparatifs/runway-vs-kling-vs-pika-2026")} className="hero-link">Runway vs Kling</Link>
              <Link href={l("/blog/deepseek-review-2026")} className="hero-link">DeepSeek review</Link>
              <Link href={l("/blog/grok-review-2026")} className="hero-link">Grok review</Link>
            </div>

            <div className="stats">
              {t.stats.map((s) => (
                <div key={s.l} className="st-box">
                  <div className="st-v"><Counter value={s.v} /></div>
                  <div className="st-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ticker-wrap" aria-label={t.hero.tickerLabel}>
          <div className="ticker-label">{t.hero.tickerLabel}</div>
          <div className="ticker-inner">
            <div className="ticker-track">
              {[...t.hero.tickerItems, ...t.hero.tickerItems].map((item, i) => (
                <Link key={`${item.href}-${i}`} href={l(item.href)} className="ticker-item" onClick={() => trackEvent("homepage_ticker_click", { href: item.href, lang })}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="section" style={{ paddingTop: "3.2rem", paddingBottom: "1.25rem" }}>
          <div className="trust-row">
            {t.trust.map((item) => (
              <div key={item.t} className="trust-cell">
                <div className="ti">{item.icon}</div>
                <div><div className="tt">{item.t}</div><div className="td">{item.d}</div></div>
              </div>
            ))}
          </div>
        </div>

        <section className="section" aria-labelledby="comparatifs-heading">
          <div className="sh">
            <div>
              <div className="stag">{t.compTag}</div>
              <h2 id="comparatifs-heading" className="stitle">{t.compTitle}</h2>
              <div className="ssub">{t.compSub}</div>
            </div>
            <Link href={l("/comparatifs")} className="sh-right" onClick={() => trackEvent("homepage_section_click", { section: "comparatifs_all", lang })}>{t.compAll}</Link>
          </div>
          <div className="comp-grid">
            {t.comparatifs.map((c) => (
              <Link
                key={c.slug}
                href={l(`/comparatifs/${c.slug}`)}
                className={`cmp${c.isFeat ? " star" : ""}`}
                title={c.title}
                aria-label={c.title}
                onClick={() => trackEvent("homepage_card_click", { type: "comparatif", slug: c.slug, lang })}
              >
                <div className="cmp-bar" style={{ background: c.color }} />
                <div className="cmp-top">
                  <div className="cmp-tag" style={{ color: c.color }}>{c.tag}</div>
                  {c.isFeat && <span className="cmp-badge">{t.compFeat}</span>}
                </div>
                <div className="cmp-title">{c.title}</div>
                <div className="cmp-sub">{c.subtitle}</div>
                <div className="cmp-tools">{c.tools.map((tool) => <span key={tool.name} className="tool-chip">{tool.name}</span>)}</div>
                <div className="cmp-foot">
                  <div className="cmp-meta">
                    <div className="cmp-winner">
                      🏆 <strong style={{ color: c.color }}>{c.winner}</strong>
                      <span className="cmp-score" style={{ color: c.color, borderColor: `${c.color}50` }}>{c.winnerScore}/10</span>
                    </div>
                    {c.updated && <div className="cmp-updated">{t.compFresh} {c.updated[lang]}</div>}
                  </div>
                  <span className="cmp-more" style={{ color: c.color }}>{t.compVoir}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="articles-heading">
          <div className="sh">
            <div>
              <div className="stag">{t.artTag}</div>
              <h2 id="articles-heading" className="stitle">{t.artTitle}</h2>
              <div className="ssub">{t.artSub}</div>
            </div>
            <Link href={l("/blog")} className="sh-right" onClick={() => trackEvent("homepage_section_click", { section: "articles_all", lang })}>{t.artAll}</Link>
          </div>
          <div className="art-grid">
            {t.articles.map((a) => (
              <Link
                key={a.slug}
                href={l(`/blog/${a.slug}`)}
                className={`art${a.star ? " star" : ""}`}
                title={a.t}
                aria-label={a.t}
                onClick={() => trackEvent("homepage_card_click", { type: "article", slug: a.slug, lang })}
              >
                <div className="art-bar" style={{ background: a.color }} />
                <div className="art-top">
                  <div className="art-tag" style={{ color: a.color }}>{a.tag}</div>
                  {a.star && <span className="feat-badge">{t.featured}</span>}
                </div>
                <div className="art-title">{a.t}</div>
                <div className="art-desc">{a.d}</div>
                <div className="art-foot">
                  <div className="art-meta">
                    <span className="art-time">⏱ {a.time} {t.read}</span>
                    {a.updated && <span className="art-updated">{t.artFresh} {a.updated[lang]}</span>}
                  </div>
                  <span className="art-more" style={{ color: a.color }}>{t.readMore}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="clusters-heading">
          <div className="sh">
            <div>
              <div className="stag">Clusters</div>
              <h2 id="clusters-heading" className="stitle">{lang === "fr" ? "Explorer par thème" : "Explore by topic"}</h2>
              <div className="ssub">{lang === "fr" ? "Des portes d'entrée rapides vers les sujets qui comptent vraiment." : "Fast entry points into the topics that actually matter."}</div>
            </div>
          </div>
          <div className="cluster-grid">
            <Link href={l("/comparatifs/chatgpt-vs-claude-vs-gemini")} className="cluster-card">
              <div className="cluster-title">{lang === "fr" ? "Chatbots IA" : "AI Chatbots"}</div>
              <div className="cluster-sub">{lang === "fr" ? "ChatGPT, Claude, Gemini, Grok, DeepSeek et les meilleures alternatives." : "ChatGPT, Claude, Gemini, Grok, DeepSeek and the strongest alternatives."}</div>
              <div className="cluster-count">{lang === "fr" ? "Comparatifs et avis clés" : "Key comparisons and reviews"}</div>
            </Link>
            <Link href={l("/comparatifs/runway-vs-kling-vs-pika-2026")} className="cluster-card">
              <div className="cluster-title">{lang === "fr" ? "Vidéo IA" : "AI Video"}</div>
              <div className="cluster-sub">{lang === "fr" ? "Runway, Kling, Pika et la nouvelle génération de génération vidéo." : "Runway, Kling, Pika and the new generation of AI video tools."}</div>
              <div className="cluster-count">{lang === "fr" ? "Benchmarks et tests réels" : "Benchmarks and real tests"}</div>
            </Link>
            <Link href={l("/comparatifs/midjourney-vs-dalle-vs-stable-diffusion")} className="cluster-card">
              <div className="cluster-title">{lang === "fr" ? "Image IA" : "AI Image"}</div>
              <div className="cluster-sub">{lang === "fr" ? "Midjourney, DALL·E et Stable Diffusion testés sur qualité, prompt et usage réel." : "Midjourney, DALL·E and Stable Diffusion tested on quality, prompts and real usage."}</div>
              <div className="cluster-count">{lang === "fr" ? "Création visuelle et prompts" : "Visual creation and prompts"}</div>
            </Link>
            <Link href={l("/comparatifs/n8n-vs-make-vs-zapier-2026")} className="cluster-card">
              <div className="cluster-title">{lang === "fr" ? "Automatisation & productivité" : "Automation & productivity"}</div>
              <div className="cluster-sub">{lang === "fr" ? "n8n, Make, Zapier et les outils qui font gagner de vraies heures." : "n8n, Make, Zapier and the tools that save real hours."}</div>
              <div className="cluster-count">{lang === "fr" ? "Workflows et gains réels" : "Workflows and real gains"}</div>
            </Link>
          </div>
        </section>

        <div className="nl-wrap">
          <section className="nl-box" aria-labelledby="newsletter-heading">
            <div className="nl-glow" />
            <h2 id="newsletter-heading" className="nl-title">{t.nlTitle}</h2>
            <p className="nl-sub">{t.nlSub}</p>
            <div className="nl-sp">
              <div className="avs">{AVATARS.map((a, i) => <div key={`${a}-${i}`} className="av">{a}</div>)}</div>
              <span className="sp-t"><strong>{lang === "fr" ? "3 200+" : "3,200+"}</strong> {lang === "fr" ? "lecteurs" : "readers"}</span>
            </div>
            <div className="nl-bullets">{t.nlBullets.map((bullet) => <span key={bullet} className="nl-bullet">✓ {bullet}</span>)}</div>
            {status === "success" ? (
              <div className="nl-ok">{t.nlSuccess}</div>
            ) : (
              <>
                {status === "error" && <div className="nl-err">{t.nlError}</div>}
                <form className="nl-form" onSubmit={submit}>
                  <input
                    className="nl-in"
                    type="email"
                    placeholder={t.nlPh}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputMode="email"
                    disabled={status === "loading"}
                  />
                  <button type="submit" className="btn btn-p" disabled={status === "loading"}>
                    {status === "loading" ? t.nlLoading : t.nlCta}
                  </button>
                </form>
                <p className="nl-priv">🔒 {t.nlPrivacy}</p>
              </>
            )}
          </section>
        </div>

        <footer>
          <div className="ft">
            <div>
              <Link href={l("")} className="logo" style={{ fontSize: ".93rem" }}>
                <div className="logo-dot" />Neuri<em>flux</em>
              </Link>
              <p className="ft-tag">{t.ftTagline}</p>
            </div>
            <div>
              <div className="ft-col">{t.ftContent}</div>
              <ul className="ft-ul">{t.ftLinks.map((x) => <li key={x.h}><Link href={l(x.h)}>{x.l}</Link></li>)}</ul>
            </div>
            <div>
              <div className="ft-col">{t.ftLegal}</div>
              <ul className="ft-ul">{t.ftLegal2.map((x) => <li key={x.h}><Link href={l(x.h)}>{x.l}</Link></li>)}</ul>
            </div>
          </div>
          <div className="ft-bot">
            <span className="ft-copy">© 2026 <em>Neuriflux</em>. {t.ftRights}</span>
            <span className="ft-copy">{t.ftMade}</span>
          </div>
        </footer>

        <div className="sr-only">{t.hiddenSeo}</div>
      </main>
    </>
  );
}
