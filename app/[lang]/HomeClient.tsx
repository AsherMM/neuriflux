"use client";

import Link from "next/link";
import Script from "next/script";
import { useState, useRef, useEffect, useMemo, useId, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNewsletter } from "../../lib/useNewsletter";

type Lang = "fr" | "en";

type HomeComparatif = {
  slug: string; tag: string; color: string; winner: string; winnerScore: number;
  title: string; subtitle: string; tools: { name: string; score: number }[];
  isNew: boolean; isFeat: boolean; updated?: { fr: string; en: string };
};

type HomeArticle = {
  slug: string; tag: string; color: string; t: string; d: string;
  time: string; star: boolean; isNew?: boolean; updated?: { fr: string; en: string };
};

// ─── Données stables hors composant ──────────────────────────────────────────
const COMPARATIFS_FR: HomeComparatif[] = [
  { slug: "n8n-vs-make-vs-zapier-2026", tag: "Productivité", color: "#ff4a00", winner: "Make", winnerScore: 8.9, title: "n8n vs Make vs Zapier 2026 : comparatif complet", subtitle: "On a testé les 3 leaders de l'automatisation sur des projets réels. Tarifs, IA native, facilité d'usage : notre verdict honnête.", tools: [{ name: "Zapier", score: 7.8 }, { name: "Make", score: 8.9 }, { name: "n8n", score: 8.4 }], isNew: true, isFeat: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "runway-vs-kling-vs-pika-2026", tag: "Vidéo IA", color: "#a855f7", winner: "Runway", winnerScore: 9.0, title: "Runway vs Kling vs Pika 2026 : lequel choisir ?", subtitle: "Quel générateur vidéo IA choisir après la fermeture de Sora ? Qualité, cohérence, vitesse, workflow et rapport qualité/prix.", tools: [{ name: "Runway Gen-4", score: 9.0 }, { name: "Kling 2.6", score: 8.7 }, { name: "Pika 2.5", score: 7.8 }], isNew: true, isFeat: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "chatgpt-vs-claude-vs-gemini", tag: "Chatbots", color: "#00e6be", winner: "Claude", winnerScore: 9.2, title: "ChatGPT vs Claude vs Gemini 2026 : lequel choisir ?", subtitle: "50 cas d'usage réels, des prompts concrets, des forces et faiblesses nettes. Le vrai verdict sans filtre.", tools: [{ name: "ChatGPT", score: 8.5 }, { name: "Claude", score: 9.2 }, { name: "Gemini", score: 7.8 }], isNew: false, isFeat: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "midjourney-vs-dalle-vs-stable-diffusion", tag: "Image", color: "#7c3aed", winner: "Midjourney", winnerScore: 9.1, title: "Midjourney vs DALL·E vs Stable Diffusion 2026", subtitle: "300 images, plusieurs styles, vrais prompts et critères visuels. Le vrai gagnant en création d'image IA.", tools: [{ name: "Midjourney", score: 9.1 }, { name: "DALL·E 3", score: 8.0 }, { name: "Stable Diffusion", score: 7.8 }], isNew: false, isFeat: false, updated: { fr: "mars 2026", en: "March 2026" } },
  { slug: "elevenlabs-vs-openai-tts-vs-playht", tag: "Audio", color: "#ef4444", winner: "ElevenLabs", winnerScore: 9.0, title: "ElevenLabs vs OpenAI TTS vs PlayHT 2026", subtitle: "Clonage vocal, qualité, API, stabilité et rendu réel : le meilleur outil voix IA selon ton besoin.", tools: [{ name: "ElevenLabs", score: 9.0 }, { name: "OpenAI TTS", score: 8.0 }, { name: "PlayHT", score: 7.8 }], isNew: false, isFeat: false, updated: { fr: "mars 2026", en: "March 2026" } },
  { slug: "jasper-vs-copyai-vs-claude", tag: "Rédaction", color: "#f59e0b", winner: "Claude", winnerScore: 9.0, title: "Jasper vs Copy.ai vs Claude 2026", subtitle: "20 formats testés, SEO, qualité de texte, rapidité, workflow et rapport qualité/prix pour écrire mieux en 2026.", tools: [{ name: "Jasper", score: 7.5 }, { name: "Copy.ai", score: 7.2 }, { name: "Claude", score: 9.0 }], isNew: false, isFeat: false, updated: { fr: "mars 2026", en: "March 2026" } },
];

const COMPARATIFS_EN: HomeComparatif[] = [
  { slug: "n8n-vs-make-vs-zapier-2026", tag: "Productivity", color: "#ff4a00", winner: "Make", winnerScore: 8.9, title: "n8n vs Make vs Zapier 2026: full comparison", subtitle: "We tested the three automation leaders on real projects. Pricing, native AI, ease of use and where each one actually wins.", tools: [{ name: "Zapier", score: 7.8 }, { name: "Make", score: 8.9 }, { name: "n8n", score: 8.4 }], isNew: true, isFeat: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "runway-vs-kling-vs-pika-2026", tag: "AI Video", color: "#a855f7", winner: "Runway", winnerScore: 9.0, title: "Runway vs Kling vs Pika 2026: which one wins?", subtitle: "Which AI video generator should you pick after Sora's shutdown? Quality, motion consistency, speed and workflow.", tools: [{ name: "Runway Gen-4", score: 9.0 }, { name: "Kling 2.6", score: 8.7 }, { name: "Pika 2.5", score: 7.8 }], isNew: true, isFeat: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "chatgpt-vs-claude-vs-gemini", tag: "Chatbots", color: "#00e6be", winner: "Claude", winnerScore: 9.2, title: "ChatGPT vs Claude vs Gemini 2026: which should you choose?", subtitle: "50 real-world use cases, real prompts, clear strengths and weaknesses. The unfiltered verdict.", tools: [{ name: "ChatGPT", score: 8.5 }, { name: "Claude", score: 9.2 }, { name: "Gemini", score: 7.8 }], isNew: false, isFeat: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "midjourney-vs-dalle-vs-stable-diffusion", tag: "Image", color: "#7c3aed", winner: "Midjourney", winnerScore: 9.1, title: "Midjourney vs DALL·E vs Stable Diffusion 2026", subtitle: "300 images, multiple styles and real prompts. Which image model is actually the strongest right now?", tools: [{ name: "Midjourney", score: 9.1 }, { name: "DALL·E 3", score: 8.0 }, { name: "Stable Diffusion", score: 7.8 }], isNew: false, isFeat: false, updated: { fr: "mars 2026", en: "March 2026" } },
  { slug: "elevenlabs-vs-openai-tts-vs-playht", tag: "Audio", color: "#ef4444", winner: "ElevenLabs", winnerScore: 9.0, title: "ElevenLabs vs OpenAI TTS vs PlayHT 2026", subtitle: "Voice cloning, API quality, workflow and output realism: the best voice AI depending on what you need.", tools: [{ name: "ElevenLabs", score: 9.0 }, { name: "OpenAI TTS", score: 8.0 }, { name: "PlayHT", score: 7.8 }], isNew: false, isFeat: false, updated: { fr: "mars 2026", en: "March 2026" } },
  { slug: "jasper-vs-copyai-vs-claude", tag: "Writing", color: "#f59e0b", winner: "Claude", winnerScore: 9.0, title: "Jasper vs Copy.ai vs Claude 2026", subtitle: "20 writing formats tested across SEO, output quality, workflow and value for money.", tools: [{ name: "Jasper", score: 7.5 }, { name: "Copy.ai", score: 7.2 }, { name: "Claude", score: 9.0 }], isNew: false, isFeat: false, updated: { fr: "avril 2026", en: "April 2026" } },
];

const ARTICLES_FR: HomeArticle[] = [
  { slug: "deepseek-review-2026", tag: "Chatbots", color: "#00e6be", t: "DeepSeek : avis 2026, le meilleur ChatGPT gratuit venu de Chine ?", d: "DeepSeek a bouleversé le marché IA. Performances, vie privée, vrais cas d'usage et limites : notre verdict complet.", time: "12", star: true, isNew: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "grok-review-2026", tag: "Chatbots", color: "#00e6be", t: "Grok : avis 2026, l'IA d'Elon Musk vaut-elle vraiment le coup ?", d: "Grok 3 et 4 promettent données temps réel, contexte géant et ton plus brut. On a tout testé pendant 3 semaines.", time: "13", star: true, isNew: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "perplexity-ai-review-2026", tag: "Chatbots", color: "#00e6be", t: "Perplexity AI : vaut-il mieux que ChatGPT et Google ?", d: "Recherche sourcée, Perplexity Pro, Perplexity Computer et limites réelles : notre verdict complet.", time: "13", star: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "chatgpt-vs-claude-vs-gemini-2026", tag: "Chatbots", color: "#00e6be", t: "ChatGPT perd-il du terrain face à Claude et Gemini en 2026 ?", d: "ChatGPT reste massif, Claude monte chez les profils exigeants, Gemini pousse via Google. L'analyse complète.", time: "16", star: false, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "sora-fermeture-openai-2026", tag: "Chatbots", color: "#00e6be", t: "Sora est mort : OpenAI abandonne son générateur vidéo IA", d: "La fermeture de Sora racontée sans filtre : coûts, revenus, stratégie et pourquoi l'échec compte pour tout le marché.", time: "13", star: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "jasper-ai-review-2026", tag: "Rédaction", color: "#f59e0b", t: "Jasper AI : avis 2026, faut-il encore le payer ?", d: "3 semaines de tests sur des projets réels. Notre verdict honnête sur Jasper face à Claude et Copy.ai.", time: "10", star: false, updated: { fr: "mars 2026", en: "March 2026" } },
];

const ARTICLES_EN: HomeArticle[] = [
  { slug: "deepseek-review-2026", tag: "Chatbots", color: "#00e6be", t: "DeepSeek Review 2026: the best free ChatGPT alternative?", d: "DeepSeek shook the AI industry. Performance, privacy, real use cases and limits: our complete verdict.", time: "12", star: true, isNew: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "grok-review-2026", tag: "Chatbots", color: "#00e6be", t: "Grok Review 2026: is Elon Musk's AI actually worth it?", d: "Grok 3 and 4 promise real-time data, giant context and a rougher tone. We tested everything for three weeks.", time: "13", star: true, isNew: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "perplexity-ai-review-2026", tag: "Chatbots", color: "#00e6be", t: "Perplexity AI: is it worth it vs ChatGPT and Google?", d: "Sourced search, Perplexity Pro, Perplexity Computer and the real limits: our complete verdict.", time: "13", star: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "chatgpt-vs-claude-vs-gemini-2026", tag: "Chatbots", color: "#00e6be", t: "ChatGPT vs Claude vs Gemini: which should you pick in 2026?", d: "50 real-world use cases. The results are more nuanced than most people think.", time: "12", star: false, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "sora-fermeture-openai-2026", tag: "Chatbots", color: "#00e6be", t: "Sora is dead: OpenAI kills its AI video app", d: "The shutdown of Sora explained without fluff: costs, revenue, strategy and why this failure matters across AI.", time: "12", star: true, updated: { fr: "avril 2026", en: "April 2026" } },
  { slug: "vibe-coding-tools-2026", tag: "Code", color: "#3b82f6", t: "5 best tools to build an app without coding in 2026", d: "Lovable, Bolt.new, v0, Base44, Replit: we tested the leading vibe coding tools on real projects.", time: "16", star: false, updated: { fr: "mars 2026", en: "March 2026" } },
];

// ─── Spotlight : dernière publication (1er article isNew ou 1er de la liste)
const SPOTLIGHT_FR = ARTICLES_FR.find(a => a.isNew) ?? ARTICLES_FR[0];
const SPOTLIGHT_EN = ARTICLES_EN.find(a => a.isNew) ?? ARTICLES_EN[0];

const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    hero: {
      badge: "Indépendant · Tests réels · Sans bullshit",
      h1a: "Les meilleurs outils IA,",
      h1b: "enfin comparés honnêtement.",
      sub: "Neuriflux teste, compare et décortique les outils IA pour vous faire gagner du temps, éviter les mauvais choix et trouver les vraies solutions qui valent le coup.",
      extraSeo: "Comparez ChatGPT, Claude, Gemini, Midjourney, Runway, n8n, Make et les meilleurs outils IA 2026 avec des tests réels, des scores détaillés et des verdicts honnêtes.",
      freshLabel: "✦ Dernière mise à jour : avril 2026",
      cta1: "Voir les comparatifs →",
      cta2: "Lire le blog",
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
    spotlightLabel: "✦ Nouveau",
    spotlightCta: "Lire l'article →",
    compTag: "Comparatifs", compTitle: "Nos comparatifs phares",
    compSub: "Scores objectifs · Tests en conditions réelles · Zéro bullshit",
    compVoir: "Voir →", compFeat: "À la une", compAll: "Tous les comparatifs →", compFresh: "Mis à jour",
    artTag: "Populaire", artTitle: "Articles les plus lus", artSub: "Cette semaine sur Neuriflux",
    read: "min", readMore: "Lire →", featured: "À la une", artAll: "Tous les articles →", artFresh: "Mis à jour",
    badgeNew: "Nouveau",
    clustersTitle: "Explorer par thème",
    clustersSub: "Des portes d'entrée rapides vers les sujets qui comptent vraiment.",
    clusters: [
      { href: "/comparatifs/chatgpt-vs-claude-vs-gemini", title: "Chatbots IA", sub: "ChatGPT, Claude, Gemini, Grok, DeepSeek et les meilleures alternatives.", count: "7 comparatifs & avis", icon: "🤖", color: "#00e6be" },
      { href: "/comparatifs/runway-vs-kling-vs-pika-2026", title: "Vidéo IA", sub: "Runway, Kling, Pika et la nouvelle génération de génération vidéo.", count: "3 comparatifs & tests", icon: "🎬", color: "#a855f7" },
      { href: "/comparatifs/midjourney-vs-dalle-vs-stable-diffusion", title: "Image IA", sub: "Midjourney, DALL·E et Stable Diffusion testés sur qualité et usage réel.", count: "4 comparatifs & guides", icon: "🖼️", color: "#7c3aed" },
      { href: "/comparatifs/n8n-vs-make-vs-zapier-2026", title: "Automatisation", sub: "n8n, Make, Zapier et les outils qui font gagner de vraies heures.", count: "3 comparatifs & workflows", icon: "⚙️", color: "#ff4a00" },
    ],
    faqTitle: "Questions fréquentes",
    faqSub: "Les réponses courtes aux grandes questions IA de 2026.",
    faqs: [
      { q: "ChatGPT ou Claude en 2026 — lequel choisir ?", a: "Claude 3.7 Sonnet domine sur la rédaction et la cohérence longue durée. ChatGPT reste le plus polyvalent avec son écosystème de plugins. Pour le code, les deux sont excellents. Notre verdict complet dans le comparatif ChatGPT vs Claude vs Gemini.", href: "/comparatifs/chatgpt-vs-claude-vs-gemini" },
      { q: "Quel outil IA gratuit vaut vraiment le coup en 2026 ?", a: "Perplexity (recherche), Claude.ai (rédaction), Gamma (présentations) et Bolt.new (prototypage) offrent des plans gratuits réellement utiles. DeepSeek reste la meilleure alternative gratuite à ChatGPT pour la plupart des usages.", href: "/blog/alternatives-gratuites-chatgpt" },
      { q: "L'IA va-t-elle remplacer les rédacteurs en 2026 ?", a: "Non — elle transforme leur travail. Les rédacteurs qui utilisent l'IA comme assistant produisent 4 à 8 fois plus avec une qualité maintenue. Ceux qui l'ignorent perdent en compétitivité. La valeur se déplace vers le jugement éditorial et l'expertise métier.", href: "/blog/ia-2026" },
      { q: "Midjourney ou DALL·E 3 pour créer des images IA ?", a: "Midjourney pour la qualité artistique et les visuels complexes (9.1/10). DALL·E 3 pour la précision des instructions textuelles et l'intégration ChatGPT (8.0/10). Stable Diffusion si vous voulez contrôle total et usage local sans abonnement.", href: "/comparatifs/midjourney-vs-dalle-vs-stable-diffusion" },
    ],
    nlTitle: "Le radar IA · chaque lundi",
    nlSub: "1 email utile par semaine pour éviter 3 heures de veille : outils qui valent le coup, comparatifs qui comptent, nouveautés à ne pas rater.",
    nlBullets: ["Comparatifs honnêtes", "Nouveautés IA utiles", "Aucun spam"],
    nlCta: "Je m'abonne gratuitement", nlLoading: "...", nlPrivacy: "Gratuit · Sans spam · Désabonnement en 1 clic",
    nlSuccess: "✓ Bienvenue ! À lundi prochain.", nlError: "Une erreur s'est produite. Réessayez.", nlPh: "votre@email.com",
    hiddenSeo: "Comparatifs IA, avis IA 2026, ChatGPT vs Claude, meilleurs outils IA, tests réels, Midjourney, Runway, Gemini, Perplexity, DeepSeek.",
    srSkip: "Aller au contenu principal", menu: "Menu principal", closeMenu: "Fermer le menu", langSwitch: "Changer de langue",
    ftTagline: "Le média indépendant des outils IA.", ftContent: "Contenu", ftLegal: "Légal",
    ftLinks: [{ l: "Blog", h: "/blog" }, { l: "Comparatifs", h: "/comparatifs" }, { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "À propos", h: "/about" }],
    ftLegal2: [{ l: "Mentions légales", h: "/legal" }, { l: "Confidentialité", h: "/privacy" }, { l: "Cookies", h: "/cookies" }],
    ftRights: "Tous droits réservés.", ftMade: "Fait avec ♥ en France",
    twitterHandle: "@NeurifluxCom",
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    hero: {
      badge: "Independent · Real tests · No bullshit",
      h1a: "The best AI tools,",
      h1b: "finally compared honestly.",
      sub: "Neuriflux tests, compares and breaks down AI tools to help you save time, avoid bad picks, and find what is actually worth using.",
      extraSeo: "Compare ChatGPT, Claude, Gemini, Midjourney, Runway, n8n, Make and the best AI tools of 2026 with real tests, detailed scores and honest verdicts.",
      freshLabel: "✦ Last updated: April 2026",
      cta1: "Browse comparisons →",
      cta2: "Read the blog",
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
    spotlightLabel: "✦ New",
    spotlightCta: "Read article →",
    compTag: "Comparisons", compTitle: "Featured comparisons",
    compSub: "Objective scores · Real-world tests · Zero fluff",
    compVoir: "View →", compFeat: "Featured", compAll: "All comparisons →", compFresh: "Updated",
    artTag: "Popular", artTitle: "Most read articles", artSub: "This week on Neuriflux",
    read: "min", readMore: "Read →", featured: "Featured", artAll: "All articles →", artFresh: "Updated",
    badgeNew: "New",
    clustersTitle: "Explore by topic",
    clustersSub: "Fast entry points into the topics that actually matter.",
    clusters: [
      { href: "/comparatifs/chatgpt-vs-claude-vs-gemini", title: "AI Chatbots", sub: "ChatGPT, Claude, Gemini, Grok, DeepSeek and the strongest alternatives.", count: "7 comparisons & reviews", icon: "🤖", color: "#00e6be" },
      { href: "/comparatifs/runway-vs-kling-vs-pika-2026", title: "AI Video", sub: "Runway, Kling, Pika and the new generation of AI video tools.", count: "3 comparisons & tests", icon: "🎬", color: "#a855f7" },
      { href: "/comparatifs/midjourney-vs-dalle-vs-stable-diffusion", title: "AI Image", sub: "Midjourney, DALL·E and Stable Diffusion tested on quality and real usage.", count: "4 comparisons & guides", icon: "🖼️", color: "#7c3aed" },
      { href: "/comparatifs/n8n-vs-make-vs-zapier-2026", title: "Automation", sub: "n8n, Make, Zapier and the tools that save real hours.", count: "3 comparisons & workflows", icon: "⚙️", color: "#ff4a00" },
    ],
    faqTitle: "Frequently asked questions",
    faqSub: "Short answers to the big AI questions of 2026.",
    faqs: [
      { q: "ChatGPT or Claude in 2026 — which should you choose?", a: "Claude 3.7 Sonnet leads on writing quality and long-form coherence. ChatGPT remains the most versatile with its plugin ecosystem. For code, both are excellent. Our full breakdown is in the ChatGPT vs Claude vs Gemini comparison.", href: "/comparatifs/chatgpt-vs-claude-vs-gemini" },
      { q: "Which free AI tool is actually worth using in 2026?", a: "Perplexity (research), Claude.ai (writing), Gamma (presentations) and Bolt.new (prototyping) have genuinely useful free plans. DeepSeek remains the best free ChatGPT alternative for most everyday tasks.", href: "/blog/alternatives-gratuites-chatgpt" },
      { q: "Will AI replace writers in 2026?", a: "No — it's transforming their work. Writers who use AI as an assistant produce 4 to 8x more content at maintained quality. Those who ignore it lose competitiveness. Value is shifting toward editorial judgment and domain expertise.", href: "/blog/ia-2026" },
      { q: "Midjourney or DALL·E 3 for AI image creation?", a: "Midjourney for artistic quality and complex visuals (9.1/10). DALL·E 3 for text instruction precision and ChatGPT integration (8.0/10). Stable Diffusion if you want full control and local usage without a subscription.", href: "/comparatifs/midjourney-vs-dalle-vs-stable-diffusion" },
    ],
    nlTitle: "The AI Radar · every Monday",
    nlSub: "One useful email each week to save yourself three hours of scrolling: tools worth using, comparisons that matter, and launches worth noticing.",
    nlBullets: ["Honest comparisons", "Useful AI updates", "No spam"],
    nlCta: "Subscribe for free", nlLoading: "...", nlPrivacy: "Free · No spam · Unsubscribe in 1 click",
    nlSuccess: "✓ Welcome! See you next Monday.", nlError: "Something went wrong. Please try again.", nlPh: "your@email.com",
    hiddenSeo: "AI tools comparison, AI reviews 2026, ChatGPT vs Claude, best AI tools, real tests, Midjourney, Runway, Gemini, Perplexity, DeepSeek.",
    srSkip: "Skip to main content", menu: "Main navigation", closeMenu: "Close menu", langSwitch: "Change language",
    ftTagline: "The independent AI tools media.", ftContent: "Content", ftLegal: "Legal",
    ftLinks: [{ l: "Blog", h: "/blog" }, { l: "Comparisons", h: "/comparatifs" }, { l: "Newsletter", h: "/newsletter" }, { l: "Contact", h: "/contact" }, { l: "About", h: "/about" }],
    ftLegal2: [{ l: "Legal notice", h: "/legal" }, { l: "Privacy", h: "/privacy" }, { l: "Cookies", h: "/cookies" }],
    ftRights: "All rights reserved.", ftMade: "Made with ♥ in France",
    twitterHandle: "@NeurifluxCom",
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

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct(el.scrollHeight - el.clientHeight > 0 ? Math.min(100, (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100) : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 300, background: "rgba(0,0,0,.4)" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#00e6be,#3b82f6,#a855f7)", transition: "width .08s linear", boxShadow: "0 0 10px rgba(0,230,190,.5)" }} />
    </div>
  );
}

function Counter({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    const num = parseInt(value.replace(/\D/g, ""), 10);
    const suffix = value.replace(/[0-9]/g, "");
    if (Number.isNaN(num)) { setDisplay(value); return; }
    if (reducedMotion) { setDisplay(`${num}${suffix}`); return; }
    const run = () => {
      if (done.current) return;
      done.current = true;
      const start = performance.now();
      const tick = (time: number) => {
        const p = Math.min((time - start) / 1100, 1);
        setDisplay(`${Math.floor((1 - Math.pow(1 - p, 3)) * num)}${suffix}`);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [reducedMotion, value]);
  return <span ref={ref}>{display}</span>;
}

function ScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(score * 10), delay); ob.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [score, delay]);
  return (
    <div ref={ref} style={{ height: 3, background: "rgba(255,255,255,.07)", borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 2, transition: "width .9s cubic-bezier(.4,0,.2,1)", boxShadow: `0 0 6px ${color}50` }} />
    </div>
  );
}

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } }, { threshold: 0.06 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(22px)", transition: `opacity .6s ${delay}ms ease, transform .6s ${delay}ms ease` }}>
      {children}
    </div>
  );
}

// ─── FAQ accordéon ─────────────────────────────────────────────────────────────
function FaqItem({ q, a, href, lang }: { q: string; a: string; href: string; lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{q}</span>
        <span className="faq-icon" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="faq-a">
          {a}{" "}
          <Link href={`/${lang}${href}`} className="faq-link" onClick={() => trackEvent("homepage_faq_link", { href, lang })}>
            {lang === "fr" ? "En savoir plus →" : "Learn more →"}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function HomeClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavCta, setShowNavCta] = useState(false);
  const t = T[lang];
  const rawMenuId = useId();
  const menuId = `menu-${rawMenuId.replace(/:/g, "")}`;

  const comparatifs = lang === "fr" ? COMPARATIFS_FR : COMPARATIFS_EN;
  const articles = lang === "fr" ? ARTICLES_FR : ARTICLES_EN;
  const spotlight = lang === "fr" ? SPOTLIGHT_FR : SPOTLIGHT_EN;

  const l = useCallback((p: string) => `/${lang}${p}`, [lang]);
  const { status, subscribe } = useNewsletter("homepage");

  const itemListSchema = useMemo(() => ({
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: lang === "fr" ? "Neuriflux — meilleurs outils IA comparés" : "Neuriflux — best AI tools compared",
    url: `https://neuriflux.com/${lang}`,
    mainEntity: [
      { "@type": "ItemList", name: lang === "fr" ? "Comparatifs IA à la une" : "Featured AI comparisons",
        itemListElement: comparatifs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: `https://neuriflux.com/${lang}/comparatifs/${c.slug}` })) },
      { "@type": "ItemList", name: lang === "fr" ? "Articles IA populaires" : "Popular AI articles",
        itemListElement: articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.t, url: `https://neuriflux.com/${lang}/blog/${a.slug}` })) },
    ],
  }), [lang, comparatifs, articles]);

  const organizationSchema = useMemo(() => ({
    "@context": "https://schema.org", "@type": "Organization",
    name: "Neuriflux", url: "https://neuriflux.com",
    logo: "https://neuriflux.com/logo.png",
    sameAs: ["https://twitter.com/NeurifluxCom"],
    description: lang === "fr" ? "Média indépendant de comparatifs et avis sur les outils IA." : "Independent media for AI tools comparisons and reviews.",
  }), [lang]);

  const websiteSchema = useMemo(() => ({
    "@context": "https://schema.org", "@type": "WebSite",
    name: "Neuriflux", url: "https://neuriflux.com",
    potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `https://neuriflux.com/${lang}/blog?q={search_term_string}` }, "query-input": "required name=search_term_string" },
  }), [lang]);

  // ─── FAQ schema ──────────────────────────────────────────────────────────────
  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: t.faqs.map(f => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }), [t.faqs]);

  const switchLang = useCallback((next: Lang) => {
    if (next === lang) return;
    trackEvent("homepage_language_switch", { from: lang, to: next });
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  }, [lang, router, pathname]);

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 60); setShowNavCta(window.scrollY > 350); };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onEscape); document.body.style.overflow = prev; };
  }, [menuOpen]);

  useEffect(() => {
    if (status === "success") { setEmail(""); trackEvent("homepage_newsletter_success", { lang }); }
    else if (status === "error") trackEvent("homepage_newsletter_error", { lang });
  }, [status, lang]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("homepage_newsletter_submit", { lang, placement: "homepage" });
    await subscribe(email, lang);
  };

  return (
    <>
      <Script id="home-collection-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <Script id="home-organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <Script id="home-website-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <Script id="home-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <style>{`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080c10;--bg2:#0d1117;--bg3:#111820;--bg4:#151e29;
  --border:rgba(255,255,255,.065);--glow:rgba(0,230,190,.2);
  --cyan:#00e6be;--cdim:rgba(0,230,190,.09);
  --text:#edf2f7;--muted:#7a8a9a;--dim:#405164;
  --d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;
  --r:14px;--pad:clamp(1.25rem,5vw,4rem)
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}
.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.skip-link{position:absolute;left:12px;top:-100px;z-index:500;background:var(--cyan);color:#071018;padding:10px 14px;border-radius:8px;font-family:var(--m);font-size:.72rem;font-weight:700;text-decoration:none;transition:top .2s}
.skip-link:focus{top:12px}
.bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
.bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:min(900px,92vw);height:560px;background:radial-gradient(ellipse,rgba(0,230,190,.06) 0%,transparent 68%);pointer-events:none;z-index:0}
/* ── NAV ── */
nav{position:sticky;top:0;z-index:200;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);background:rgba(8,12,16,.9);border-bottom:1px solid var(--border);padding:0 var(--pad);height:64px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .25s,background .25s}
nav.scrolled{box-shadow:0 8px 32px rgba(0,0,0,.42);background:rgba(8,12,16,.97)}
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
.nav-cta{display:flex;align-items:center;gap:.4rem;font-family:var(--d);font-weight:700;font-size:.72rem;padding:6px 14px;border-radius:7px;text-decoration:none;white-space:nowrap;color:#080c10;background:var(--cyan);animation:slideDown .3s ease both;transition:all .18s}
.nav-cta:hover{transform:translateY(-1px);filter:brightness(1.1)}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@media(max-width:560px){.nav-cta span{display:none}}
/* ── HERO ── */
.hero{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:clamp(4rem,9vw,7rem) var(--pad) clamp(2.5rem,4vw,3.2rem);display:flex;flex-direction:column;align-items:center;text-align:center}
.hero-wrap{max-width:820px;width:100%;display:flex;flex-direction:column;align-items:center}
.badge{display:inline-flex;align-items:center;gap:.45rem;font-family:var(--m);font-size:.67rem;letter-spacing:.07em;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:100px;padding:6px 14px;margin-bottom:1.35rem}
.badge-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite}
h1{font-size:clamp(2.15rem,5.6vw,4.1rem);font-weight:800;line-height:1.04;letter-spacing:-.045em;margin-bottom:.75rem;color:var(--text)}
h1 em{color:var(--cyan);font-style:normal;position:relative}
h1 em::after{content:'';position:absolute;bottom:2px;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);opacity:.45;border-radius:2px}
.hero-fresh{font-family:var(--m);font-size:.65rem;color:var(--dim);letter-spacing:.06em;margin-bottom:.85rem}
.hero-sub{font-family:var(--m);font-size:.86rem;font-weight:300;color:var(--muted);line-height:1.85;max-width:680px;margin-bottom:1rem;text-align:center}
.hero-proof{font-family:var(--m);font-size:.72rem;color:var(--cyan);margin-bottom:1.55rem;background:rgba(0,230,190,.06);border:1px solid rgba(0,230,190,.12);padding:7px 14px;border-radius:999px;display:inline-flex;align-items:center;gap:.4rem}
.ctas{display:flex;gap:.7rem;flex-wrap:wrap;margin-bottom:1.2rem;justify-content:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;font-family:var(--d);font-weight:700;font-size:.84rem;padding:12px 22px;border-radius:10px;text-decoration:none;transition:all .2s;letter-spacing:-.01em;border:none;cursor:pointer}
.btn-p{background:var(--cyan);color:var(--bg)}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,230,190,.26)}
.btn-p:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
.btn-s{background:transparent;color:var(--text);border:1px solid var(--border)}
.btn-s:hover{border-color:var(--glow);background:var(--cdim);color:var(--cyan)}
.hero-links{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin-bottom:2rem}
.hero-link{font-family:var(--m);font-size:.68rem;color:var(--muted);text-decoration:none;padding:6px 10px;border:1px solid var(--border);border-radius:999px;transition:all .15s}
.hero-link:hover{color:var(--cyan);border-color:rgba(0,230,190,.25);background:rgba(0,230,190,.04)}
.stats{display:flex;gap:clamp(1.25rem,4vw,3rem);border-top:1px solid var(--border);padding-top:1.75rem;flex-wrap:wrap;justify-content:center;width:100%}
.st-box{min-width:110px}
.st-v{font-family:var(--d);font-size:clamp(1.45rem,3.4vw,2rem);font-weight:800;letter-spacing:-.04em;color:var(--text);text-align:center}
.st-l{font-family:var(--m);font-size:.63rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:.18rem;text-align:center}
/* ── TICKER ── */
.ticker-wrap{position:relative;z-index:1;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg2);overflow:hidden;min-height:40px;display:flex;align-items:stretch;margin-top:1rem}
.ticker-label{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--bg);background:var(--cyan);padding:0 14px;display:flex;align-items:center;flex-shrink:0;font-weight:700;white-space:nowrap}
.ticker-inner{display:flex;align-items:center;overflow:hidden;flex:1;position:relative}
.ticker-track{display:flex;gap:2.5rem;align-items:center;white-space:nowrap;padding-left:2rem;animation:scroll-ticker 28s linear infinite}
.ticker-item{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;text-decoration:none;display:inline-flex;align-items:center;gap:.45rem;transition:color .15s}
.ticker-item:hover{color:var(--cyan)}
.ticker-item::before{content:"•";color:var(--dim)}
@keyframes scroll-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.ticker-wrap:hover .ticker-track{animation-play-state:paused}
/* ── SECTIONS ── */
.section{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:clamp(2.4rem,5vw,3.5rem) var(--pad)}
.sh{margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem}
.sh-right{font-family:var(--m);font-size:.7rem;color:var(--cyan);text-decoration:none;opacity:.72;transition:opacity .2s;white-space:nowrap}
.sh-right:hover{opacity:1}
.stag{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:.45rem;display:flex;align-items:center;gap:.4rem}
.stag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}
.stitle{font-size:clamp(1.2rem,2.6vw,1.62rem);font-weight:800;letter-spacing:-.03em;line-height:1.1;color:var(--text)}
.ssub{font-family:var(--m);font-size:.68rem;color:var(--muted);font-weight:300;margin-top:.3rem;letter-spacing:.02em}
/* ── TRUST ── */
.trust-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
@media(max-width:600px){.trust-row{grid-template-columns:1fr}}
.trust-cell{background:var(--bg2);padding:1rem 1.35rem;display:flex;gap:.7rem;align-items:flex-start;transition:background .18s}
.trust-cell:hover{background:var(--bg3)}
.ti{font-size:1.05rem;flex-shrink:0}
.tt{font-family:var(--d);font-size:.82rem;font-weight:700;color:var(--text);margin-bottom:.12rem}
.td{font-family:var(--m);font-size:.67rem;color:var(--muted);font-weight:300;line-height:1.6}
/* ── SPOTLIGHT — dernière publication ── */
.spotlight{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 var(--pad) 0}
.spotlight-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:1.5rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;position:relative;overflow:hidden;transition:border-color .2s,box-shadow .2s}
.spotlight-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cyan),#3b82f6,transparent);opacity:.8}
.spotlight-card:hover{border-color:rgba(0,230,190,.25);box-shadow:0 8px 32px rgba(0,0,0,.3)}
.spotlight-left{display:flex;align-items:center;gap:1.2rem;flex:1;min-width:200px}
.spotlight-badge{font-family:var(--m);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:#080c10;background:var(--cyan);padding:3px 9px;border-radius:100px;font-weight:700;white-space:nowrap;flex-shrink:0}
.spotlight-title{font-family:var(--d);font-size:.95rem;font-weight:700;color:var(--text);letter-spacing:-.015em;line-height:1.3}
.spotlight-meta{font-family:var(--m);font-size:.62rem;color:var(--muted);margin-top:.2rem}
.spotlight-cta{font-family:var(--m);font-size:.72rem;font-weight:700;color:var(--cyan);text-decoration:none;white-space:nowrap;padding:8px 16px;border:1px solid rgba(0,230,190,.3);border-radius:8px;transition:all .18s;flex-shrink:0}
.spotlight-cta:hover{background:var(--cdim);border-color:var(--cyan)}
/* ── GRILLES ── */
.comp-grid,.art-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
@media(max-width:900px){.comp-grid,.art-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.comp-grid,.art-grid{grid-template-columns:1fr}}
.cmp,.art{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem;display:flex;flex-direction:column;gap:.65rem;text-decoration:none;transition:border-color .2s,transform .2s,box-shadow .2s;overflow:hidden;position:relative;min-height:100%}
.cmp.feat,.art.star{border-color:rgba(0,230,190,.16);background:linear-gradient(140deg,rgba(0,230,190,.04),var(--bg2) 65%)}
.cmp:hover,.art:hover{border-color:var(--glow);transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.38)}
.cmp-bar,.art-bar{position:absolute;top:0;left:0;right:0;height:2px;opacity:.6;transition:opacity .2s}
.cmp:hover .cmp-bar,.art:hover .art-bar{opacity:1}
.cmp-top,.art-top{display:flex;justify-content:space-between;align-items:center;gap:.5rem}
.cmp-tag,.art-tag{font-family:var(--m);font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700}
.cmp-badges,.art-badges{display:flex;align-items:center;gap:.3rem;flex-wrap:wrap}
.cmp-badge,.feat-badge{font-family:var(--m);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:var(--bg);background:var(--cyan);padding:2px 7px;border-radius:100px;font-weight:700;white-space:nowrap}
.badge-new{font-family:var(--m);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:#10b981;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);padding:2px 7px;border-radius:100px;font-weight:700;white-space:nowrap}
/* Pill temps de lecture en haut des art cards */
.art-time-pill{font-family:var(--m);font-size:.56rem;color:var(--dim);background:var(--bg3);border:1px solid var(--border);border-radius:100px;padding:2px 7px;white-space:nowrap}
.cmp-title,.art-title{font-family:var(--d);font-size:.92rem;font-weight:700;letter-spacing:-.015em;line-height:1.34;color:var(--text)}
.cmp-sub,.art-desc{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.7;font-weight:300;flex:1}
.cmp-scores{display:flex;flex-direction:column;gap:.35rem}
.cmp-score-row{display:flex;align-items:center;gap:.5rem}
.cmp-score-name{font-family:var(--m);font-size:.6rem;color:var(--muted);min-width:70px}
.cmp-score-val{font-family:var(--m);font-size:.6rem;font-weight:700;min-width:24px;text-align:right}
.cmp-foot,.art-foot{display:flex;justify-content:space-between;align-items:flex-end;gap:.75rem;padding-top:.65rem;border-top:1px solid var(--border);margin-top:auto}
.cmp-meta,.art-meta{display:flex;flex-direction:column;gap:.28rem}
.cmp-winner,.art-time-foot{font-family:var(--m);font-size:.62rem;color:var(--muted);display:flex;align-items:center;gap:.3rem;flex-wrap:wrap}
.cmp-updated,.art-updated{font-family:var(--m);font-size:.56rem;color:var(--dim)}
.cmp-wscore{font-family:var(--m);font-size:.6rem;font-weight:700;padding:1px 7px;border-radius:100px;border:1px solid}
.cmp-more,.art-more{font-family:var(--m);font-size:.65rem;font-weight:600;opacity:.7;transition:opacity .15s;white-space:nowrap}
.cmp:hover .cmp-more,.art:hover .art-more{opacity:1}
/* ── CLUSTERS avec couleur et icône ── */
.cluster-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
@media(max-width:900px){.cluster-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.cluster-grid{grid-template-columns:1fr}}
.cluster-card{border:1px solid var(--border);border-radius:14px;padding:1.1rem 1.1rem 1.2rem;text-decoration:none;transition:border-color .18s,transform .18s,background .18s;display:flex;flex-direction:column;gap:.45rem;position:relative;overflow:hidden}
.cluster-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;opacity:.7;transition:opacity .2s}
.cluster-card:hover::before{opacity:1}
.cluster-card:hover{transform:translateY(-2px)}
.cluster-icon{font-size:1.35rem;margin-bottom:.1rem;line-height:1}
.cluster-title{font-family:var(--d);font-size:.88rem;font-weight:700;color:var(--text)}
.cluster-sub{font-family:var(--m);font-size:.64rem;color:var(--muted);line-height:1.55}
.cluster-count{font-family:var(--m);font-size:.58rem;margin-top:.1rem}
/* ── FAQ accordéon ── */
.faq-list{display:flex;flex-direction:column;gap:.6rem}
.faq-item{background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color .18s}
.faq-item.open{border-color:rgba(0,230,190,.2)}
.faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.9rem 1.2rem;background:none;border:none;cursor:pointer;font-family:var(--d);font-size:.88rem;font-weight:700;color:var(--text);text-align:left;transition:color .15s;letter-spacing:-.01em}
.faq-q:hover{color:var(--cyan)}
.faq-icon{font-family:var(--m);font-size:1rem;color:var(--cyan);flex-shrink:0;font-weight:300;line-height:1;transition:transform .2s}
.faq-item.open .faq-icon{transform:rotate(0deg)}
.faq-a{padding:.1rem 1.2rem .9rem;font-family:var(--m);font-size:.73rem;color:var(--muted);line-height:1.75;font-weight:300}
.faq-link{color:var(--cyan);text-decoration:none;font-weight:600;transition:opacity .15s}
.faq-link:hover{opacity:.75}
/* ── NEWSLETTER ── */
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
.nl-in{flex:1;min-width:175px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 13px;color:var(--text);font-family:var(--m);font-size:.78rem;outline:none;transition:border-color .2s,box-shadow .2s}
.nl-in:focus{border-color:var(--glow);box-shadow:0 0 0 3px rgba(0,230,190,.06)}
.nl-in::placeholder{color:var(--dim)}
.nl-priv{font-family:var(--m);font-size:.6rem;color:var(--dim);position:relative;z-index:1}
.nl-ok{font-family:var(--m);font-size:.78rem;color:var(--cyan);background:var(--cdim);border:1px solid var(--glow);border-radius:10px;padding:9px 16px;display:inline-block;position:relative;z-index:1}
.nl-err{font-family:var(--m);font-size:.74rem;color:#ef4444;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.22);border-radius:10px;padding:9px 13px;margin-bottom:.7rem;position:relative;z-index:1}
/* ── FOOTER ── */
footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.25rem var(--pad);max-width:1160px;margin:0 auto}
.ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
@media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
.ft-tag{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.7;max-width:260px;margin-top:.4rem}
.ft-social{display:flex;gap:.5rem;margin-top:.65rem}
.ft-social-link{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none;border:1px solid var(--border);border-radius:6px;padding:3px 9px;transition:all .15s}
.ft-social-link:hover{color:var(--cyan);border-color:rgba(0,230,190,.25)}
.ft-col{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
.ft-ul{list-style:none;display:flex;flex-direction:column;gap:.45rem}
.ft-ul a{font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;transition:color .15s;font-weight:300}
.ft-ul a:hover{color:var(--cyan)}
.ft-bot{margin-top:1.75rem;padding-top:1.1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
.ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
.ft-copy em{color:var(--cyan);font-style:normal}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .logo-dot,.badge-dot{animation:none}
  .ticker-track{animation:none;transform:none}
  .cmp,.art,.cluster-card,.btn,.trust-cell,.spotlight-card{transition:none}
  .nav-cta{animation:none}
  *{transition-duration:.01ms!important}
}
`}</style>

      <ScrollProgress />
      <a href="#main-content" className="skip-link">{t.srSkip}</a>
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""} aria-label={t.menu}>
        <Link href={l("")} className="logo" onClick={() => trackEvent("homepage_nav_click", { location: "logo", lang })}>
          <div className="logo-dot" />Neuri<em>flux</em>
        </Link>
        <ul id={menuId} className={`nav-links${menuOpen ? " open" : ""}`} role="list">
          <li><Link href={l("/blog")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_blog", lang })}>{t.nav.blog}</Link></li>
          <li><Link href={l("/comparatifs")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_comparatifs", lang })}>{t.nav.comparatifs}</Link></li>
          <li><Link href={l("/newsletter")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_newsletter", lang })}>{t.nav.newsletter}</Link></li>
          <li><Link href={l("/contact")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_contact", lang })}>{t.nav.contact}</Link></li>
          <li><Link href={l("/about")} onClick={() => trackEvent("homepage_nav_click", { location: "nav_about", lang })}>{t.nav.about}</Link></li>
        </ul>
        <div style={{ display: "flex", gap: ".65rem", alignItems: "center" }}>
          {showNavCta && (
            <Link href={l("/newsletter")} className="nav-cta" onClick={() => trackEvent("homepage_nav_cta_click", { lang })}>
              <span>{lang === "fr" ? "Newsletter gratuite" : "Free newsletter"}</span> →
            </Link>
          )}
          <div className="lt" aria-label={t.langSwitch}>
            <button className={`lb${lang === "fr" ? " on" : ""}`} aria-pressed={lang === "fr"} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " on" : ""}`} aria-pressed={lang === "en"} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => { setMenuOpen(p => !p); trackEvent("homepage_menu_toggle", { lang, open: !menuOpen }); }} aria-label={menuOpen ? t.closeMenu : t.menu} aria-expanded={menuOpen} aria-controls={menuId}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <main id="main-content">

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-wrap">
            <FadeSection>
              <div className="badge"><div className="badge-dot" aria-hidden="true" />{t.hero.badge}</div>
              <h1>{t.hero.h1a}<br /><em>{t.hero.h1b}</em></h1>
              {/* Indicateur de fraîcheur — signal SEO + confiance visiteur */}
              <div className="hero-fresh" aria-label={lang === "fr" ? "Date de mise à jour" : "Last update date"}>{t.hero.freshLabel}</div>
              <p className="hero-sub">{t.hero.sub}</p>
              <p className="sr-only">{t.hero.extraSeo}</p>
              <div className="hero-proof"><span aria-hidden="true">⭐</span> {t.hero.socialProof}</div>
              {/* 2 CTAs seulement — règle de conversion */}
              <div className="ctas">
                <Link href={l("/comparatifs")} className="btn btn-p" onClick={() => trackEvent("homepage_cta_click", { location: "hero_primary", lang })}>{t.hero.cta1}</Link>
                <Link href={l("/blog")} className="btn btn-s" onClick={() => trackEvent("homepage_cta_click", { location: "hero_secondary", lang })}>{t.hero.cta2}</Link>
              </div>
              <div className="hero-links" aria-label="Top topics">
                <Link href={l("/comparatifs/chatgpt-vs-claude-vs-gemini")} className="hero-link">ChatGPT vs Claude</Link>
                <Link href={l("/comparatifs/runway-vs-kling-vs-pika-2026")} className="hero-link">Runway vs Kling</Link>
                <Link href={l("/blog/deepseek-review-2026")} className="hero-link">DeepSeek review</Link>
                <Link href={l("/blog/grok-review-2026")} className="hero-link">Grok review</Link>
              </div>
            </FadeSection>
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

        {/* ── TICKER ── */}
        <div className="ticker-wrap" aria-label={t.hero.tickerLabel} role="marquee" aria-live="off">
          <div className="ticker-label" aria-hidden="true">{t.hero.tickerLabel}</div>
          <div className="ticker-inner">
            <div className="ticker-track">
              {t.hero.tickerItems.map((item) => (
                <Link key={item.href} href={l(item.href)} className="ticker-item" onClick={() => trackEvent("homepage_ticker_click", { href: item.href, lang })}>{item.label}</Link>
              ))}
              {t.hero.tickerItems.map((item) => (
                <Link key={`dup-${item.href}`} href={l(item.href)} className="ticker-item" aria-hidden="true" tabIndex={-1}>{item.label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── TRUST ── */}
        <FadeSection delay={60}>
          <div className="section" style={{ paddingTop: "3.2rem", paddingBottom: "1.5rem" }}>
            <div className="trust-row" role="list">
              {t.trust.map((item) => (
                <div key={item.t} className="trust-cell" role="listitem">
                  <div className="ti" aria-hidden="true">{item.icon}</div>
                  <div><div className="tt">{item.t}</div><div className="td">{item.d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* ── SPOTLIGHT — Dernière publication ── */}
        <FadeSection delay={80}>
          <div className="spotlight" style={{ paddingBottom: "1rem" }}>
            <Link
              href={l(`/blog/${spotlight.slug}`)}
              className="spotlight-card"
              onClick={() => trackEvent("homepage_spotlight_click", { slug: spotlight.slug, lang })}
            >
              <div className="spotlight-left">
                <span className="spotlight-badge">{t.spotlightLabel}</span>
                <div>
                  <div className="spotlight-title">{spotlight.t}</div>
                  <div className="spotlight-meta">
                    <span aria-hidden="true">⏱</span> {spotlight.time} {t.read}
                    {spotlight.updated && <span style={{ marginLeft: ".5rem", color: "var(--dim)" }}>· {spotlight.updated[lang]}</span>}
                  </div>
                </div>
              </div>
              <span className="spotlight-cta">{t.spotlightCta}</span>
            </Link>
          </div>
        </FadeSection>

        {/* ── COMPARATIFS ── */}
        <FadeSection delay={100}>
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
              {comparatifs.map((c) => (
                <Link key={c.slug} href={l(`/comparatifs/${c.slug}`)} className={`cmp${c.isFeat ? " feat" : ""}`} aria-label={c.title} onClick={() => trackEvent("homepage_card_click", { type: "comparatif", slug: c.slug, lang })}>
                  <div className="cmp-bar" style={{ background: c.color }} aria-hidden="true" />
                  <div className="cmp-top">
                    <div className="cmp-tag" style={{ color: c.color }}>{c.tag}</div>
                    <div className="cmp-badges">
                      {c.isFeat && <span className="cmp-badge">{t.compFeat}</span>}
                      {c.isNew && <span className="badge-new">{t.badgeNew}</span>}
                    </div>
                  </div>
                  <div className="cmp-title">{c.title}</div>
                  <div className="cmp-sub">{c.subtitle}</div>
                  <div className="cmp-scores" aria-label="Scores">
                    {[...c.tools].sort((a, b) => b.score - a.score).map((tool, i) => (
                      <div key={tool.name} className="cmp-score-row">
                        <span className="cmp-score-name" style={{ color: tool.name === c.winner ? c.color : undefined, fontWeight: tool.name === c.winner ? 700 : 300 }}>{tool.name}</span>
                        <ScoreBar score={tool.score} color={c.color} delay={i * 80} />
                        <span className="cmp-score-val" style={{ color: c.color }}>{tool.score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cmp-foot">
                    <div className="cmp-meta">
                      <div className="cmp-winner">🏆 <strong style={{ color: c.color }}>{c.winner}</strong> <span className="cmp-wscore" style={{ color: c.color, border: `1px solid ${c.color}50` }}>{c.winnerScore}/10</span></div>
                      {c.updated && <div className="cmp-updated">{t.compFresh} {c.updated[lang]}</div>}
                    </div>
                    <span className="cmp-more" style={{ color: c.color }}>{t.compVoir}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </FadeSection>

        {/* ── ARTICLES ── */}
        <FadeSection delay={100}>
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
              {articles.map((a) => (
                <Link key={a.slug} href={l(`/blog/${a.slug}`)} className={`art${a.star ? " star" : ""}`} aria-label={a.t} onClick={() => trackEvent("homepage_card_click", { type: "article", slug: a.slug, lang })}>
                  <div className="art-bar" style={{ background: a.color }} aria-hidden="true" />
                  <div className="art-top">
                    <div className="art-tag" style={{ color: a.color }}>{a.tag}</div>
                    <div className="art-badges" style={{ display: "flex", gap: ".3rem", alignItems: "center" }}>
                      {/* Pill temps de lecture en haut — bien plus visible */}
                      <span className="art-time-pill"><span aria-hidden="true">⏱</span> {a.time} {t.read}</span>
                      {a.star && <span className="feat-badge">{t.featured}</span>}
                      {a.isNew && <span className="badge-new">{t.badgeNew}</span>}
                    </div>
                  </div>
                  <div className="art-title">{a.t}</div>
                  <div className="art-desc">{a.d}</div>
                  <div className="art-foot">
                    <div className="art-meta">
                      {a.updated && <span className="art-updated">{t.artFresh} {a.updated[lang]}</span>}
                    </div>
                    <span className="art-more" style={{ color: a.color }}>{t.readMore}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </FadeSection>

        {/* ── CLUSTERS avec couleur et icône ── */}
        <FadeSection delay={80}>
          <section className="section" aria-labelledby="clusters-heading">
            <div className="sh">
              <div>
                <div className="stag">Clusters</div>
                <h2 id="clusters-heading" className="stitle">{t.clustersTitle}</h2>
                <div className="ssub">{t.clustersSub}</div>
              </div>
            </div>
            <div className="cluster-grid">
              {t.clusters.map((c) => (
                <Link
                  key={c.href} href={l(c.href)} className="cluster-card"
                  style={{ background: `linear-gradient(145deg,${c.color}08,var(--bg2) 70%)`, border: `1px solid ${c.color}18` }}
                  onClick={() => trackEvent("homepage_cluster_click", { href: c.href, lang })}
                >
                  {/* Barre top colorée */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${c.color},${c.color}60,transparent)`, opacity: .7 }} />
                  <div className="cluster-icon" aria-hidden="true">{c.icon}</div>
                  <div className="cluster-title">{c.title}</div>
                  <div className="cluster-sub">{c.sub}</div>
                  <div className="cluster-count" style={{ color: c.color }}>{c.count}</div>
                </Link>
              ))}
            </div>
          </section>
        </FadeSection>

        {/* ── FAQ avec schema FAQPage ── */}
        <FadeSection delay={60}>
          <section className="section" aria-labelledby="faq-heading" style={{ paddingTop: "1rem" }}>
            <div className="sh" style={{ marginBottom: "1.25rem" }}>
              <div>
                <div className="stag">FAQ</div>
                <h2 id="faq-heading" className="stitle">{t.faqTitle}</h2>
                <div className="ssub">{t.faqSub}</div>
              </div>
            </div>
            <div className="faq-list" role="list">
              {t.faqs.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} href={f.href} lang={lang} />
              ))}
            </div>
          </section>
        </FadeSection>

        {/* ── NEWSLETTER ── */}
        <div className="nl-wrap">
          <FadeSection delay={60}>
            <section className="nl-box" aria-labelledby="newsletter-heading">
              <div className="nl-glow" aria-hidden="true" />
              <h2 id="newsletter-heading" className="nl-title">{t.nlTitle}</h2>
              <p className="nl-sub">{t.nlSub}</p>
              <div className="nl-sp">
                <div className="avs" aria-hidden="true">{AVATARS.map((a, i) => <div key={`${a}-${i}`} className="av">{a}</div>)}</div>
                <span className="sp-t"><strong>{lang === "fr" ? "3 200+" : "3,200+"}</strong> {lang === "fr" ? "lecteurs" : "readers"}</span>
              </div>
              <div className="nl-bullets" aria-label={lang === "fr" ? "Avantages" : "Benefits"}>
                {t.nlBullets.map((b) => <span key={b} className="nl-bullet">✓ {b}</span>)}
              </div>
              <div aria-live="polite" aria-atomic="true">
                {status === "success" ? (
                  <div className="nl-ok" role="status">{t.nlSuccess}</div>
                ) : (
                  <>
                    {status === "error" && <div className="nl-err" role="alert">{t.nlError}</div>}
                    <form className="nl-form" onSubmit={submit} noValidate>
                      <input className="nl-in" type="email" placeholder={t.nlPh} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" disabled={status === "loading"} aria-label={lang === "fr" ? "Adresse e-mail" : "Email address"} />
                      <button type="submit" className="btn btn-p" disabled={status === "loading"} aria-busy={status === "loading"}>
                        {status === "loading" ? t.nlLoading : t.nlCta}
                      </button>
                    </form>
                    <p className="nl-priv"><span aria-hidden="true">🔒</span> {t.nlPrivacy}</p>
                  </>
                )}
              </div>
            </section>
          </FadeSection>
        </div>

        {/* ── FOOTER ── */}
        <footer>
          <div className="ft">
            <div>
              <Link href={l("")} className="logo" style={{ fontSize: ".93rem" }}><div className="logo-dot" />Neuri<em>flux</em></Link>
              <p className="ft-tag">{t.ftTagline}</p>
              <div className="ft-social">
                <a href="https://twitter.com/NeurifluxCom" className="ft-social-link" target="_blank" rel="noopener noreferrer" aria-label="Neuriflux sur Twitter/X">𝕏 {t.twitterHandle}</a>
              </div>
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

        <div className="sr-only" aria-hidden="true">{t.hiddenSeo}</div>
      </main>
    </>
  );
}