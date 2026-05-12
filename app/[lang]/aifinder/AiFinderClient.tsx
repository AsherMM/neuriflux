"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Lang = "fr" | "en";

type Goal =
  | "writing"
  | "seo"
  | "video"
  | "image"
  | "coding"
  | "research"
  | "automation"
  | "business"
  | "social"
  | "audio"
  | "presentation"
  | "avatar"
  | "local"
  | "agents";

type Budget = "free" | "low" | "pro" | "team";
type Level = "beginner" | "intermediate" | "advanced";
type Priority = "quality" | "speed" | "price" | "creative" | "privacy" | "team" | "api";
type StepId = "goal" | "budget" | "level" | "priority";
type AnswerKey = Goal | Budget | Level | Priority;
type ToolBadge = "New" | "Trending" | "Best Value" | "Pro Pick" | "Open Source" | "Enterprise" | "Free Pick";

type Answers = Partial<Record<StepId, AnswerKey>>;

type Tool = {
  id: string;
  name: string;
  category: string;
  badge?: ToolBadge;
  short: Record<Lang, string>;
  desc: Record<Lang, string>;
  verdict: Record<Lang, string>;
  goals: Goal[];
  budgets: Budget[];
  levels: Level[];
  priorities: Priority[];
  price: string;
  rating: number;
  bestFor: Record<Lang, string[]>;
  limits: Record<Lang, string[]>;
  review: string;
  affiliate: string;
  logos: string[];
  fallback: string;
  accent: string;
};

type ScoredTool = Tool & {
  score: number;
  reasons: string[];
  breakdown: {
    goal: number;
    budget: number;
    level: number;
    priority: number;
    authority: number;
  };
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

const icon = (slug: string) => `https://cdn.simpleicons.org/${slug}/FFFFFF`;
const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

function trackEvent(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });

  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
}

const TOOLS: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "All-in-one AI",
    badge: "Pro Pick",
    short: {
      fr: "Le meilleur choix généraliste pour la majorité des utilisateurs.",
      en: "The best overall AI assistant for most users.",
    },
    desc: {
      fr: "Excellent point de départ pour écrire, chercher, coder, brainstormer, résumer, analyser des documents et travailler plus vite au quotidien.",
      en: "A strong default choice for writing, research, coding, brainstorming, summarizing, document analysis and everyday productivity.",
    },
    verdict: {
      fr: "À choisir si vous voulez un assistant unique, fiable, polyvalent et facile à intégrer dans presque tous les workflows.",
      en: "Choose it if you want one reliable, versatile assistant that fits almost every workflow.",
    },
    goals: ["writing", "coding", "research", "business", "seo", "automation", "agents", "presentation"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["quality", "speed", "team", "api"],
    price: "Free / Plus / Team",
    rating: 4.8,
    bestFor: {
      fr: ["Productivité générale", "rédaction", "code", "analyse de documents"],
      en: ["General productivity", "writing", "coding", "document analysis"],
    },
    limits: {
      fr: ["Pas toujours le meilleur spécialiste", "Les fonctions les plus avancées sont souvent payantes"],
      en: ["Not always the best specialist", "The most advanced features often require paid plans"],
    },
    review: "/blog/chatgpt-review-2026",
    affiliate: "https://chatgpt.com/",
    logos: [fav("chatgpt.com"), fav("openai.com"), icon("openai")],
    fallback: "C",
    accent: "#00e6be",
  },
  {
    id: "claude",
    name: "Claude",
    category: "Writing & reasoning",
    badge: "Pro Pick",
    short: {
      fr: "Excellent pour la rédaction longue, l’analyse et le ton naturel.",
      en: "Excellent for long-form writing, analysis and natural tone.",
    },
    desc: {
      fr: "Très bon choix pour les contenus longs, la réflexion structurée, les documents professionnels, la synthèse et les réponses nuancées.",
      en: "A strong pick for long-form content, structured reasoning, professional documents, synthesis and nuanced answers.",
    },
    verdict: {
      fr: "À choisir si la qualité d’écriture, la cohérence et la nuance sont prioritaires.",
      en: "Choose it when writing quality, coherence and nuance matter most.",
    },
    goals: ["writing", "research", "business", "coding", "seo"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["quality", "privacy", "team"],
    price: "Free / Pro / Team",
    rating: 4.8,
    bestFor: {
      fr: ["Rédaction longue", "analyse", "documents", "ton professionnel"],
      en: ["Long-form writing", "analysis", "documents", "professional tone"],
    },
    limits: {
      fr: ["Moins orienté image/vidéo", "Certaines fonctions dépendent du plan"],
      en: ["Less image/video focused", "Some features depend on the plan"],
    },
    review: "/blog/claude-review-2026",
    affiliate: "https://claude.ai/",
    logos: [fav("claude.ai"), icon("claude")],
    fallback: "A",
    accent: "#d97757",
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "Google AI",
    badge: "Trending",
    short: {
      fr: "Très solide pour recherche, productivité Google, multimodal et image.",
      en: "Very strong for research, Google productivity, multimodal work and image.",
    },
    desc: {
      fr: "Pertinent si vous travaillez dans l’écosystème Google : recherche, analyse, image, documents, productivité et usages multimodaux.",
      en: "Useful if you work in the Google ecosystem: research, analysis, image, documents, productivity and multimodal workflows.",
    },
    verdict: {
      fr: "À choisir si vous voulez une IA connectée à Google et utile en productivité quotidienne.",
      en: "Choose it if you want AI connected to Google and useful for everyday productivity.",
    },
    goals: ["research", "business", "image", "writing", "coding"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["speed", "quality", "team", "price"],
    price: "Free / Advanced",
    rating: 4.5,
    bestFor: {
      fr: ["Recherche", "productivité Google", "image", "analyse multimodale"],
      en: ["Research", "Google productivity", "image", "multimodal analysis"],
    },
    limits: {
      fr: ["Moins naturel que Claude en rédaction longue", "Fonctions variables selon les pays"],
      en: ["Less natural than Claude for long writing", "Features vary by region"],
    },
    review: "/blog/gemini-review-2026",
    affiliate: "https://gemini.google.com/",
    logos: [fav("gemini.google.com"), icon("googlegemini"), fav("google.com")],
    fallback: "G",
    accent: "#4285f4",
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    category: "Productivity AI",
    badge: "Enterprise",
    short: {
      fr: "Excellent pour les utilisateurs Microsoft 365 et les équipes.",
      en: "Excellent for Microsoft 365 users and teams.",
    },
    desc: {
      fr: "Pertinent pour les entreprises, documents Office, emails, réunions, présentations et productivité dans l’écosystème Microsoft.",
      en: "Relevant for companies, Office documents, emails, meetings, presentations and productivity inside the Microsoft ecosystem.",
    },
    verdict: {
      fr: "À choisir si votre travail tourne autour de Microsoft 365, Teams, Word, Excel ou PowerPoint.",
      en: "Choose it if your work revolves around Microsoft 365, Teams, Word, Excel or PowerPoint.",
    },
    goals: ["business", "writing", "presentation", "research"],
    budgets: ["pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["team", "speed", "quality"],
    price: "Paid / Microsoft 365",
    rating: 4.3,
    bestFor: {
      fr: ["Microsoft 365", "documents", "emails", "équipes"],
      en: ["Microsoft 365", "documents", "emails", "teams"],
    },
    limits: {
      fr: ["Moins attractif hors Microsoft", "Prix plus adapté aux pros"],
      en: ["Less attractive outside Microsoft", "Pricing is more business-oriented"],
    },
    review: "/blog/microsoft-copilot-review-2026",
    affiliate: "https://copilot.microsoft.com/",
    logos: [fav("copilot.microsoft.com"), icon("microsoft")],
    fallback: "M",
    accent: "#00a4ef",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    category: "AI search",
    badge: "Best Value",
    short: {
      fr: "Très fort pour la recherche rapide avec sources.",
      en: "Great for fast research with sources.",
    },
    desc: {
      fr: "Idéal pour réponses sourcées, exploration de sujets, veille, SEO research et analyse de marché.",
      en: "Ideal for sourced answers, topic exploration, monitoring, SEO research and market scans.",
    },
    verdict: {
      fr: "À choisir si vous cherchez surtout des réponses fiables, rapides et sourcées.",
      en: "Choose it if you mainly need fast, reliable, sourced answers.",
    },
    goals: ["research", "seo", "business", "writing"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["speed", "price", "quality"],
    price: "Free / Pro",
    rating: 4.6,
    bestFor: {
      fr: ["Recherche sourcée", "veille", "analyse rapide", "SEO research"],
      en: ["Sourced research", "monitoring", "fast analysis", "SEO research"],
    },
    limits: {
      fr: ["Moins créatif qu’un assistant de rédaction", "Pas une suite d’automatisation"],
      en: ["Less creative than writing-first assistants", "Not an automation suite"],
    },
    review: "/blog/perplexity-ai-review-2026",
    affiliate: "https://www.perplexity.ai/",
    logos: [fav("perplexity.ai"), icon("perplexity")],
    fallback: "P",
    accent: "#20b8cd",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    category: "AI assistant",
    badge: "Free Pick",
    short: {
      fr: "Très intéressant pour un usage gratuit, le code et le raisonnement.",
      en: "Very interesting for free usage, coding and reasoning.",
    },
    desc: {
      fr: "Option solide pour tester une IA performante sans budget élevé, notamment sur code, logique, raisonnement et usage technique.",
      en: "A strong option to test capable AI without a high budget, especially for coding, logic, reasoning and technical usage.",
    },
    verdict: {
      fr: "À choisir si vous voulez maximiser la valeur gratuite et tester une alternative performante.",
      en: "Choose it if you want to maximize free value and test a capable alternative.",
    },
    goals: ["writing", "coding", "research", "business", "agents"],
    budgets: ["free", "low"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["price", "quality", "speed"],
    price: "Free / Paid API",
    rating: 4.4,
    bestFor: {
      fr: ["Usage gratuit", "code", "raisonnement", "tests IA"],
      en: ["Free usage", "coding", "reasoning", "AI testing"],
    },
    limits: {
      fr: ["Questions de confidentialité à évaluer", "Écosystème moins complet"],
      en: ["Privacy should be evaluated", "Less complete ecosystem"],
    },
    review: "/blog/deepseek-review-2026",
    affiliate: "https://www.deepseek.com/",
    logos: [fav("deepseek.com"), icon("deepseek")],
    fallback: "D",
    accent: "#4f8cff",
  },
  {
    id: "grok",
    name: "Grok",
    category: "Realtime AI",
    badge: "Trending",
    short: {
      fr: "Utile pour actualité, recherche rapide et ton plus direct.",
      en: "Useful for news, fast research and a more direct tone.",
    },
    desc: {
      fr: "Pertinent pour suivre des sujets récents, tendances sociales, actualité et obtenir des réponses plus directes selon votre usage de X.",
      en: "Relevant for tracking recent topics, social trends, news and getting more direct answers, especially if you use X.",
    },
    verdict: {
      fr: "À choisir si l’actualité, les tendances et le temps réel comptent beaucoup.",
      en: "Choose it if news, trends and real-time context matter.",
    },
    goals: ["research", "social", "business", "writing"],
    budgets: ["low", "pro"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["speed", "creative", "quality"],
    price: "Paid / X plans",
    rating: 4.2,
    bestFor: {
      fr: ["Actualité", "réseaux sociaux", "veille", "réponses directes"],
      en: ["News", "social media", "monitoring", "direct answers"],
    },
    limits: {
      fr: ["Dépend de l’écosystème X", "Moins neutre dans le ton"],
      en: ["Depends on X ecosystem", "Less neutral tone"],
    },
    review: "/blog/grok-review-2026",
    affiliate: "https://grok.com/",
    logos: [fav("grok.com"), icon("x")],
    fallback: "G",
    accent: "#ffffff",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    category: "European AI",
    badge: "Pro Pick",
    short: {
      fr: "Très bon choix européen pour modèles, API et usages professionnels.",
      en: "Strong European option for models, API and professional workflows.",
    },
    desc: {
      fr: "Intéressant pour entreprises, développeurs et produits IA qui veulent une alternative européenne sérieuse avec API et modèles performants.",
      en: "Interesting for companies, developers and AI products that want a serious European alternative with API and strong models.",
    },
    verdict: {
      fr: "À choisir pour API, souveraineté européenne, intégrations et usage technique.",
      en: "Choose it for API, European positioning, integrations and technical usage.",
    },
    goals: ["coding", "business", "agents", "automation", "research", "local"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["api", "privacy", "quality"],
    price: "Free / Pro / API",
    rating: 4.5,
    bestFor: {
      fr: ["API", "LLM européen", "agents", "produits IA"],
      en: ["API", "European LLM", "agents", "AI products"],
    },
    limits: {
      fr: ["Moins grand public que ChatGPT", "Demande plus de configuration"],
      en: ["Less mainstream than ChatGPT", "Requires more setup"],
    },
    review: "/blog/mistral-ai-review-2026",
    affiliate: "https://mistral.ai/",
    logos: [fav("mistral.ai"), icon("mistralai")],
    fallback: "M",
    accent: "#ff7000",
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "AI coding",
    badge: "Trending",
    short: {
      fr: "Un des meilleurs éditeurs IA pour coder plus vite.",
      en: "One of the best AI editors for faster coding.",
    },
    desc: {
      fr: "Pensé pour comprendre, modifier, générer et refactorer du code directement dans l’éditeur.",
      en: "Built to understand, edit, generate and refactor code directly inside the editor.",
    },
    verdict: {
      fr: "À choisir si le code est votre priorité principale et que vous voulez accélérer un vrai projet.",
      en: "Choose it if coding is your main priority and you want to speed up real projects.",
    },
    goals: ["coding", "automation", "business", "agents"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["speed", "quality", "api"],
    price: "Free / Pro / Business",
    rating: 4.7,
    bestFor: {
      fr: ["Code", "refactor", "debug", "projets complexes"],
      en: ["Coding", "refactoring", "debugging", "complex projects"],
    },
    limits: {
      fr: ["Moins adapté aux non-développeurs", "Demande de relire le code"],
      en: ["Less suited for non-developers", "Requires code review"],
    },
    review: "/blog/cursor-review-2026",
    affiliate: "https://www.cursor.com/",
    logos: [fav("cursor.com"), icon("cursor")],
    fallback: "C",
    accent: "#ffffff",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "AI coding",
    badge: "Enterprise",
    short: {
      fr: "Référence pour l’assistance code intégrée aux IDE.",
      en: "A reference for AI coding assistance inside IDEs.",
    },
    desc: {
      fr: "Très bon pour développeurs et équipes qui veulent accélérer l’écriture de code sans changer tout leur workflow.",
      en: "Great for developers and teams that want faster coding without changing their workflow.",
    },
    verdict: {
      fr: "À choisir si vous êtes déjà dans GitHub, VS Code ou un workflow dev professionnel.",
      en: "Choose it if you already use GitHub, VS Code or a professional dev workflow.",
    },
    goals: ["coding", "business"],
    budgets: ["low", "pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["speed", "team", "quality"],
    price: "Paid / Business",
    rating: 4.5,
    bestFor: {
      fr: ["Autocomplétion", "IDE", "équipes dev", "productivité code"],
      en: ["Autocomplete", "IDE", "dev teams", "coding productivity"],
    },
    limits: {
      fr: ["Moins agentique que certains outils récents", "Nécessite relecture"],
      en: ["Less agentic than newer tools", "Still needs review"],
    },
    review: "/blog/github-copilot-review-2026",
    affiliate: "https://github.com/features/copilot",
    logos: [fav("github.com"), icon("githubcopilot"), icon("github")],
    fallback: "G",
    accent: "#7c3aed",
  },
  {
    id: "v0",
    name: "v0",
    category: "UI generation",
    badge: "Trending",
    short: {
      fr: "Excellent pour générer rapidement des interfaces React propres.",
      en: "Excellent for quickly generating clean React interfaces.",
    },
    desc: {
      fr: "Très pratique pour créer des UI, composants, landing pages et prototypes frontend modernes.",
      en: "Useful for creating UI, components, landing pages and modern frontend prototypes.",
    },
    verdict: {
      fr: "À choisir si vous voulez accélérer le design frontend et produire des interfaces propres.",
      en: "Choose it if you want to speed up frontend design and produce clean interfaces.",
    },
    goals: ["coding", "business", "presentation"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["speed", "creative", "quality"],
    price: "Free / Premium",
    rating: 4.4,
    bestFor: {
      fr: ["UI React", "landing pages", "composants", "prototypes"],
      en: ["React UI", "landing pages", "components", "prototypes"],
    },
    limits: {
      fr: ["Nécessite intégration propre", "Pas un backend builder"],
      en: ["Needs clean integration", "Not a backend builder"],
    },
    review: "/blog/v0-review-2026",
    affiliate: "https://v0.dev/",
    logos: [fav("v0.dev"), icon("vercel")],
    fallback: "v0",
    accent: "#ffffff",
  },
  {
    id: "bolt",
    name: "Bolt.new",
    category: "AI app builder",
    badge: "Trending",
    short: {
      fr: "Rapide pour créer des prototypes web avec IA.",
      en: "Fast for creating AI-powered web prototypes.",
    },
    desc: {
      fr: "Utile pour générer apps, composants et prototypes directement dans le navigateur.",
      en: "Useful for generating apps, components and prototypes directly in the browser.",
    },
    verdict: {
      fr: "À choisir si vous voulez prototyper vite côté web.",
      en: "Choose it if you want fast web prototyping.",
    },
    goals: ["coding", "business", "agents"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["speed", "creative", "price"],
    price: "Free / Paid plans",
    rating: 4.3,
    bestFor: {
      fr: ["Prototypes web", "interfaces", "MVP", "tests rapides"],
      en: ["Web prototypes", "interfaces", "MVPs", "fast tests"],
    },
    limits: {
      fr: ["Moins adapté aux gros backends", "Résultats à nettoyer"],
      en: ["Less suited for large backends", "Outputs need cleanup"],
    },
    review: "/blog/bolt-new-review-2026",
    affiliate: "https://bolt.new/",
    logos: [fav("bolt.new"), icon("stackblitz")],
    fallback: "B",
    accent: "#facc15",
  },
  {
    id: "lovable",
    name: "Lovable",
    category: "Vibe coding",
    badge: "New",
    short: {
      fr: "Très bon pour transformer une idée en interface ou app rapidement.",
      en: "Great for turning an idea into an interface or app quickly.",
    },
    desc: {
      fr: "Vise créateurs, fondateurs et profils non-tech qui veulent générer une app ou interface sans repartir de zéro.",
      en: "Targets creators, founders and non-technical users who want to generate an app or interface without starting from scratch.",
    },
    verdict: {
      fr: "À choisir si vous voulez passer de l’idée à une app visible rapidement.",
      en: "Choose it if you want to go from idea to visible app quickly.",
    },
    goals: ["coding", "business", "presentation", "agents"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "creative", "price"],
    price: "Free / Paid plans",
    rating: 4.2,
    bestFor: {
      fr: ["Landing pages", "MVP", "interfaces", "prototypes"],
      en: ["Landing pages", "MVPs", "interfaces", "prototypes"],
    },
    limits: {
      fr: ["Pas idéal pour architecture complexe", "Code à vérifier"],
      en: ["Not ideal for complex architecture", "Code should be reviewed"],
    },
    review: "/blog/lovable-review-2026",
    affiliate: "https://lovable.dev/",
    logos: [fav("lovable.dev"), icon("lovable")],
    fallback: "L",
    accent: "#ff5a8a",
  },
  {
    id: "replit",
    name: "Replit",
    category: "AI app builder",
    badge: "Best Value",
    short: {
      fr: "Très bon pour prototyper des apps rapidement dans le navigateur.",
      en: "Great for prototyping apps quickly in the browser.",
    },
    desc: {
      fr: "Pratique pour créer, tester et héberger rapidement des projets sans grosse configuration locale.",
      en: "Useful for creating, testing and hosting projects quickly without heavy local setup.",
    },
    verdict: {
      fr: "À choisir pour prototyper vite un MVP ou une petite app.",
      en: "Choose it to prototype an MVP or small app quickly.",
    },
    goals: ["coding", "business", "agents"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["speed", "price", "team"],
    price: "Free / Paid plans",
    rating: 4.4,
    bestFor: {
      fr: ["MVP", "prototypes", "apps web", "hébergement rapide"],
      en: ["MVPs", "prototypes", "web apps", "quick hosting"],
    },
    limits: {
      fr: ["Moins puissant qu’un setup complet", "Peut limiter les gros projets"],
      en: ["Less powerful than full dev setup", "May limit large projects"],
    },
    review: "/blog/replit-ai-review-2026",
    affiliate: "https://replit.com/",
    logos: [fav("replit.com"), icon("replit")],
    fallback: "R",
    accent: "#f26207",
  },
  {
    id: "runway",
    name: "Runway",
    category: "AI video",
    badge: "Pro Pick",
    short: {
      fr: "Le choix premium pour la génération vidéo IA.",
      en: "The premium pick for AI video generation.",
    },
    desc: {
      fr: "Plateforme créative sérieuse pour générer, éditer et prototyper des contenus vidéo avec rendu professionnel.",
      en: "A serious creative platform to generate, edit and prototype AI video content with a professional feel.",
    },
    verdict: {
      fr: "À choisir si la qualité vidéo compte plus que le prix.",
      en: "Choose it if video quality matters more than price.",
    },
    goals: ["video", "social", "business"],
    budgets: ["low", "pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["quality", "creative", "team"],
    price: "Free trial / Paid plans",
    rating: 4.5,
    bestFor: {
      fr: ["Vidéo IA", "pubs", "shorts", "concepts créatifs"],
      en: ["AI video", "ads", "shorts", "creative concepts"],
    },
    limits: {
      fr: ["Peut coûter cher", "Demande plusieurs itérations"],
      en: ["Can become expensive", "Requires iteration"],
    },
    review: "/comparatifs/runway-vs-kling-vs-pika-2026",
    affiliate: "https://runwayml.com/",
    logos: [fav("runwayml.com"), icon("runway")],
    fallback: "R",
    accent: "#a855f7",
  },
  {
    id: "kling",
    name: "Kling AI",
    category: "AI video",
    badge: "Trending",
    short: {
      fr: "Très compétitif pour la vidéo IA réaliste et les mouvements.",
      en: "Very competitive for realistic AI video and motion.",
    },
    desc: {
      fr: "Intéressant pour générer clips vidéo, scènes réalistes et contenus courts à fort impact visuel.",
      en: "Interesting for generating video clips, realistic scenes and high-impact short content.",
    },
    verdict: {
      fr: "À choisir si vous testez sérieusement la génération vidéo IA.",
      en: "Choose it if you are seriously testing AI video generation.",
    },
    goals: ["video", "social", "business"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["quality", "creative", "price"],
    price: "Free credits / Paid",
    rating: 4.4,
    bestFor: {
      fr: ["Vidéo réaliste", "shorts", "plans cinématiques", "tests créatifs"],
      en: ["Realistic video", "shorts", "cinematic shots", "creative tests"],
    },
    limits: {
      fr: ["Contrôle parfois irrégulier", "Temps de génération variable"],
      en: ["Control can vary", "Generation time can vary"],
    },
    review: "/comparatifs/runway-vs-kling-vs-pika-2026",
    affiliate: "https://klingai.com/",
    logos: [fav("klingai.com")],
    fallback: "K",
    accent: "#38bdf8",
  },
  {
    id: "pika",
    name: "Pika",
    category: "AI video",
    badge: "Best Value",
    short: {
      fr: "Bon choix créatif pour vidéos courtes, rapides et sociales.",
      en: "Good creative pick for short, fast and social videos.",
    },
    desc: {
      fr: "Intéressant pour tester des idées vidéo, créer des clips sociaux et générer rapidement des variantes.",
      en: "Useful for testing video ideas, creating social clips and generating quick variations.",
    },
    verdict: {
      fr: "À choisir pour des vidéos sociales rapides et créatives.",
      en: "Choose it for fast, creative social videos.",
    },
    goals: ["video", "social"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "creative", "price"],
    price: "Free / Paid plans",
    rating: 4.1,
    bestFor: {
      fr: ["Shorts", "contenu social", "tests vidéo", "créativité"],
      en: ["Shorts", "social content", "video tests", "creativity"],
    },
    limits: {
      fr: ["Moins premium que Runway", "Résultats parfois variables"],
      en: ["Less premium than Runway", "Results can vary"],
    },
    review: "/comparatifs/runway-vs-kling-vs-pika-2026",
    affiliate: "https://pika.art/",
    logos: [fav("pika.art")],
    fallback: "P",
    accent: "#f97316",
  },
  {
    id: "luma",
    name: "Luma AI",
    category: "AI video",
    badge: "Trending",
    short: {
      fr: "Très intéressant pour vidéo, scènes réalistes et rendu cinématique.",
      en: "Very interesting for video, realistic scenes and cinematic output.",
    },
    desc: {
      fr: "Utile pour générer des plans vidéo, scènes créatives, visuels animés et tests cinématiques.",
      en: "Useful for generating video shots, creative scenes, animated visuals and cinematic tests.",
    },
    verdict: {
      fr: "À choisir si vous voulez tester des rendus vidéo plus cinématiques.",
      en: "Choose it if you want to test more cinematic video outputs.",
    },
    goals: ["video", "social", "image"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["creative", "quality", "speed"],
    price: "Free / Paid",
    rating: 4.3,
    bestFor: {
      fr: ["Vidéo IA", "plans cinématiques", "animation", "créativité"],
      en: ["AI video", "cinematic shots", "animation", "creativity"],
    },
    limits: {
      fr: ["Contrôle variable", "Peut nécessiter plusieurs essais"],
      en: ["Control varies", "May need multiple attempts"],
    },
    review: "/blog/luma-ai-review-2026",
    affiliate: "https://lumalabs.ai/",
    logos: [fav("lumalabs.ai")],
    fallback: "L",
    accent: "#38bdf8",
  },
  {
    id: "heygen",
    name: "HeyGen",
    category: "AI avatar video",
    badge: "Trending",
    short: {
      fr: "Très bon pour avatars vidéo, doublage et contenus facecam IA.",
      en: "Great for AI avatar videos, dubbing and facecam-style content.",
    },
    desc: {
      fr: "Utile pour créer des vidéos avec avatars, traductions, messages commerciaux et contenus marketing personnalisés.",
      en: "Useful for avatar videos, translations, sales messages and personalized marketing content.",
    },
    verdict: {
      fr: "À choisir si vous voulez produire des vidéos avec avatar IA.",
      en: "Choose it if you want to produce AI avatar videos.",
    },
    goals: ["avatar", "video", "social", "business"],
    budgets: ["low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "creative", "team"],
    price: "Free trial / Paid plans",
    rating: 4.3,
    bestFor: {
      fr: ["Avatars IA", "formation", "vidéos commerciales", "traduction vidéo"],
      en: ["AI avatars", "training", "sales videos", "video translation"],
    },
    limits: {
      fr: ["Rendu parfois artificiel", "Attention image/voix"],
      en: ["Can look artificial", "Image and voice rights matter"],
    },
    review: "/blog/heygen-review-2026",
    affiliate: "https://www.heygen.com/",
    logos: [fav("heygen.com"), icon("heygen")],
    fallback: "H",
    accent: "#7c3aed",
  },
  {
    id: "synthesia",
    name: "Synthesia",
    category: "AI avatar video",
    badge: "Enterprise",
    short: {
      fr: "Très solide pour vidéos corporate, formation et avatars pro.",
      en: "Very strong for corporate videos, training and professional avatars.",
    },
    desc: {
      fr: "Vise surtout les entreprises qui veulent produire des vidéos pédagogiques, commerciales ou internes propres.",
      en: "Aimed at companies producing clean training, educational, sales or internal videos.",
    },
    verdict: {
      fr: "À choisir pour formation, entreprise et vidéos d’équipe.",
      en: "Choose it for training, enterprise and team videos.",
    },
    goals: ["avatar", "video", "business", "presentation"],
    budgets: ["pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["team", "quality", "speed"],
    price: "Paid / Enterprise",
    rating: 4.3,
    bestFor: {
      fr: ["Formation", "avatars pro", "vidéos corporate", "équipes"],
      en: ["Training", "pro avatars", "corporate videos", "teams"],
    },
    limits: {
      fr: ["Moins fun pour créateurs solo", "Coût plus élevé"],
      en: ["Less fun for solo creators", "Higher cost"],
    },
    review: "/blog/synthesia-review-2026",
    affiliate: "https://www.synthesia.io/",
    logos: [fav("synthesia.io"), icon("synthesia")],
    fallback: "S",
    accent: "#3b82f6",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    category: "AI image",
    badge: "Pro Pick",
    short: {
      fr: "Excellent pour des visuels beaux, créatifs et premium.",
      en: "Excellent for beautiful, creative and premium visuals.",
    },
    desc: {
      fr: "Très fort pour visuels artistiques, concepts, thumbnails, moodboards, identités visuelles et images premium.",
      en: "A top choice for artistic visuals, concepts, thumbnails, moodboards, visual identities and premium images.",
    },
    verdict: {
      fr: "À choisir si l’esthétique visuelle est votre priorité.",
      en: "Choose it if visual aesthetics are your priority.",
    },
    goals: ["image", "social", "business"],
    budgets: ["low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["quality", "creative"],
    price: "Paid plans",
    rating: 4.7,
    bestFor: {
      fr: ["Images premium", "direction artistique", "thumbnails", "concept art"],
      en: ["Premium images", "art direction", "thumbnails", "concept art"],
    },
    limits: {
      fr: ["Moins adapté aux modifications précises", "Demande de bons prompts"],
      en: ["Less ideal for strict precision", "Needs good prompting"],
    },
    review: "/blog/midjourney-review-2026",
    affiliate: "https://www.midjourney.com/",
    logos: [fav("midjourney.com"), icon("midjourney")],
    fallback: "M",
    accent: "#7c3aed",
  },
  {
    id: "leonardo",
    name: "Leonardo AI",
    category: "AI image",
    badge: "Trending",
    short: {
      fr: "Très bon pour assets, images, jeux, concepts et visuels marketing.",
      en: "Great for assets, images, games, concepts and marketing visuals.",
    },
    desc: {
      fr: "Utile pour créateurs, jeux, assets visuels, produits et contenus marketing générés rapidement.",
      en: "Useful for creators, games, visual assets, products and fast marketing visuals.",
    },
    verdict: {
      fr: "À choisir si vous créez beaucoup d’assets visuels.",
      en: "Choose it if you create many visual assets.",
    },
    goals: ["image", "social", "business"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["creative", "quality", "price"],
    price: "Free / Paid plans",
    rating: 4.4,
    bestFor: {
      fr: ["Assets", "jeu vidéo", "concept art", "marketing"],
      en: ["Assets", "game art", "concept art", "marketing"],
    },
    limits: {
      fr: ["Moins mainstream que Midjourney", "Workflow à apprendre"],
      en: ["Less mainstream than Midjourney", "Workflow takes learning"],
    },
    review: "/blog/leonardo-ai-review-2026",
    affiliate: "https://leonardo.ai/",
    logos: [fav("leonardo.ai")],
    fallback: "L",
    accent: "#22c55e",
  },
  {
    id: "ideogram",
    name: "Ideogram",
    category: "AI image",
    badge: "Best Value",
    short: {
      fr: "Très utile pour images avec texte, logos et visuels marketing.",
      en: "Very useful for images with text, logos and marketing visuals.",
    },
    desc: {
      fr: "Intéressant quand le rendu texte dans l’image compte : affiches, logos, concepts et visuels promotionnels.",
      en: "Interesting when text rendering matters: posters, logos, concepts and promotional visuals.",
    },
    verdict: {
      fr: "À choisir si le texte dans l’image est important.",
      en: "Choose it if text inside images matters.",
    },
    goals: ["image", "social", "business"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate"],
    priorities: ["quality", "creative", "price"],
    price: "Free / Paid",
    rating: 4.3,
    bestFor: {
      fr: ["Texte dans image", "logos", "affiches", "visuels social"],
      en: ["Text in image", "logos", "posters", "social visuals"],
    },
    limits: {
      fr: ["Moins fort sur certains styles premium", "Contrôle variable"],
      en: ["Less strong on some premium styles", "Control varies"],
    },
    review: "/blog/ideogram-review-2026",
    affiliate: "https://ideogram.ai/",
    logos: [fav("ideogram.ai")],
    fallback: "I",
    accent: "#f43f5e",
  },
  {
    id: "canva",
    name: "Canva AI",
    category: "Design AI",
    badge: "Best Value",
    short: {
      fr: "Très bon pour design, réseaux sociaux et contenus marketing.",
      en: "Great for design, social media and marketing content.",
    },
    desc: {
      fr: "Efficace pour créateurs, freelances et petites équipes qui veulent produire vite des visuels propres.",
      en: "Effective for creators, freelancers and small teams that want clean visuals quickly.",
    },
    verdict: {
      fr: "À choisir pour créer du contenu visuel sans designer.",
      en: "Choose it for visual content without a designer.",
    },
    goals: ["image", "social", "business", "presentation"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "price", "creative", "team"],
    price: "Free / Pro / Teams",
    rating: 4.3,
    bestFor: {
      fr: ["Posts sociaux", "visuels marketing", "présentations", "templates"],
      en: ["Social posts", "marketing visuals", "presentations", "templates"],
    },
    limits: {
      fr: ["Moins premium que Midjourney en génération pure", "Templates parfois génériques"],
      en: ["Less premium than Midjourney for pure generation", "Templates can feel generic"],
    },
    review: "/blog/canva-ai-review-2026",
    affiliate: "https://www.canva.com/",
    logos: [fav("canva.com"), icon("canva")],
    fallback: "C",
    accent: "#00c4cc",
  },
  {
    id: "firefly",
    name: "Adobe Firefly",
    category: "Creative AI",
    badge: "Pro Pick",
    short: {
      fr: "Très pertinent pour les créatifs déjà dans l’écosystème Adobe.",
      en: "Very relevant for creatives already in the Adobe ecosystem.",
    },
    desc: {
      fr: "S’intègre aux workflows Adobe pour image, design, édition et production visuelle.",
      en: "Integrates with Adobe workflows for image, design, editing and visual production.",
    },
    verdict: {
      fr: "À choisir si vous travaillez déjà avec Adobe.",
      en: "Choose it if you already work with Adobe.",
    },
    goals: ["image", "business", "social"],
    budgets: ["low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["quality", "team", "creative"],
    price: "Free credits / Paid",
    rating: 4.2,
    bestFor: {
      fr: ["Créatifs Adobe", "édition image", "marketing", "production visuelle"],
      en: ["Adobe creatives", "image editing", "marketing", "visual production"],
    },
    limits: {
      fr: ["Moins fun que Midjourney", "Meilleur avec Adobe"],
      en: ["Less playful than Midjourney", "Best with Adobe"],
    },
    review: "/blog/adobe-firefly-review-2026",
    affiliate: "https://firefly.adobe.com/",
    logos: [fav("adobe.com"), icon("adobe")],
    fallback: "F",
    accent: "#ff0000",
  },
  {
    id: "gamma",
    name: "Gamma",
    category: "Presentation AI",
    badge: "Best Value",
    short: {
      fr: "Excellent pour créer des présentations modernes rapidement.",
      en: "Excellent for creating modern presentations quickly.",
    },
    desc: {
      fr: "Très utile pour decks, pages, documents visuels et présentations propres sans passer des heures sur le design.",
      en: "Useful for decks, pages, visual documents and clean presentations without spending hours on design.",
    },
    verdict: {
      fr: "À choisir pour des présentations rapides et propres.",
      en: "Choose it for fast, clean presentations.",
    },
    goals: ["presentation", "business", "writing", "social"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "creative", "price"],
    price: "Free / Plus / Pro",
    rating: 4.4,
    bestFor: {
      fr: ["Présentations", "pitch decks", "documents visuels", "landing pages simples"],
      en: ["Presentations", "pitch decks", "visual docs", "simple landing pages"],
    },
    limits: {
      fr: ["Moins puissant qu’un outil design complet", "Retouche finale parfois nécessaire"],
      en: ["Less powerful than full design tools", "May require final editing"],
    },
    review: "/blog/gamma-review-2026",
    affiliate: "https://gamma.app/",
    logos: [fav("gamma.app"), icon("gamma")],
    fallback: "G",
    accent: "#7c3aed",
  },
  {
    id: "tome",
    name: "Tome",
    category: "Presentation AI",
    badge: "Trending",
    short: {
      fr: "Bon outil pour storytelling, decks et présentations narratives.",
      en: "Good tool for storytelling, decks and narrative presentations.",
    },
    desc: {
      fr: "Utile pour transformer des idées en présentations plus narratives, visuelles et rapides à partager.",
      en: "Useful for turning ideas into more narrative, visual and shareable presentations.",
    },
    verdict: {
      fr: "À choisir pour raconter une idée clairement en deck.",
      en: "Choose it to tell an idea clearly in deck format.",
    },
    goals: ["presentation", "business", "writing"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "creative", "team"],
    price: "Free / Paid",
    rating: 4.1,
    bestFor: {
      fr: ["Storytelling", "decks", "pitch", "présentations rapides"],
      en: ["Storytelling", "decks", "pitching", "fast presentations"],
    },
    limits: {
      fr: ["Moins complet que PowerPoint/Canva", "Styles parfois limités"],
      en: ["Less complete than PowerPoint/Canva", "Styles can feel limited"],
    },
    review: "/blog/tome-review-2026",
    affiliate: "https://tome.app/",
    logos: [fav("tome.app")],
    fallback: "T",
    accent: "#8b5cf6",
  },
  {
    id: "make",
    name: "Make",
    category: "Automation",
    badge: "Best Value",
    short: {
      fr: "Le meilleur compromis no-code pour automatiser sans trop coder.",
      en: "The best no-code balance for automation without heavy coding.",
    },
    desc: {
      fr: "Très bon outil visuel pour connecter vos apps, automatiser des tâches et créer des workflows professionnels.",
      en: "A strong visual tool to connect apps, automate tasks and build professional workflows.",
    },
    verdict: {
      fr: "À choisir pour automatiser vite avec une interface visuelle.",
      en: "Choose it for fast automation with a visual builder.",
    },
    goals: ["automation", "business", "seo"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["speed", "price", "team"],
    price: "Free / Paid plans",
    rating: 4.4,
    bestFor: {
      fr: ["Workflows no-code", "business automation", "lead routing", "contenu"],
      en: ["No-code workflows", "business automation", "lead routing", "content workflows"],
    },
    limits: {
      fr: ["Scénarios complexes à structurer", "Debug parfois long"],
      en: ["Complex scenarios need structure", "Debugging can take practice"],
    },
    review: "/comparatifs/n8n-vs-make-vs-zapier-2026",
    affiliate: "https://www.make.com/",
    logos: [fav("make.com"), icon("make")],
    fallback: "M",
    accent: "#6366f1",
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Automation",
    badge: "Enterprise",
    short: {
      fr: "Très simple pour automatiser des apps populaires.",
      en: "Very simple for automating popular apps.",
    },
    desc: {
      fr: "Intéressant si vous voulez connecter rapidement des outils sans complexité technique.",
      en: "Useful if you want to connect tools quickly without technical complexity.",
    },
    verdict: {
      fr: "À choisir pour simplicité, intégrations et usage équipe.",
      en: "Choose it for simplicity, integrations and team usage.",
    },
    goals: ["automation", "business", "seo"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "team", "quality"],
    price: "Free / Paid / Team",
    rating: 4.2,
    bestFor: {
      fr: ["Connexions rapides", "apps SaaS", "PME", "workflows simples"],
      en: ["Quick connections", "SaaS apps", "SMBs", "simple workflows"],
    },
    limits: {
      fr: ["Moins flexible que n8n", "Peut coûter cher à volume"],
      en: ["Less flexible than n8n", "Can get expensive at scale"],
    },
    review: "/comparatifs/n8n-vs-make-vs-zapier-2026",
    affiliate: "https://zapier.com/",
    logos: [fav("zapier.com"), icon("zapier")],
    fallback: "Z",
    accent: "#ff4f00",
  },
  {
    id: "n8n",
    name: "n8n",
    category: "Advanced automation",
    badge: "Open Source",
    short: {
      fr: "Très fort pour les automatisations avancées et techniques.",
      en: "Very strong for advanced and technical automation.",
    },
    desc: {
      fr: "Parfait pour workflows API, automatisations IA, self-hosting, agents et profils plus techniques.",
      en: "Perfect for API workflows, advanced AI automation, self-hosting, agents and technical users.",
    },
    verdict: {
      fr: "À choisir si vous voulez contrôle, API, self-hosting et automatisations puissantes.",
      en: "Choose it if you want control, APIs, self-hosting and powerful automation.",
    },
    goals: ["automation", "coding", "business", "agents", "local"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["api", "privacy", "price"],
    price: "Free self-host / Cloud",
    rating: 4.5,
    bestFor: {
      fr: ["API workflows", "self-hosting", "agents IA", "équipes techniques"],
      en: ["API workflows", "self-hosting", "AI agents", "technical teams"],
    },
    limits: {
      fr: ["Courbe d’apprentissage plus haute", "Moins simple pour débuter"],
      en: ["Steeper learning curve", "Less beginner-friendly"],
    },
    review: "/comparatifs/n8n-vs-make-vs-zapier-2026",
    affiliate: "https://n8n.io/",
    logos: [fav("n8n.io"), icon("n8n")],
    fallback: "n",
    accent: "#ff4a00",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "AI voice",
    badge: "Pro Pick",
    short: {
      fr: "Le choix premium pour les voix IA réalistes.",
      en: "The premium pick for realistic AI voices.",
    },
    desc: {
      fr: "Très bon pour voiceovers, doublage, narration, podcasts, vidéos et intégrations audio via API.",
      en: "A strong platform for voiceovers, dubbing, narration, podcasts, videos and voice APIs.",
    },
    verdict: {
      fr: "À choisir pour une voix réaliste exploitable en production.",
      en: "Choose it for realistic voice output in production.",
    },
    goals: ["audio", "video", "social", "business", "avatar"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["quality", "creative", "api"],
    price: "Free / Paid plans",
    rating: 4.6,
    bestFor: {
      fr: ["Voiceover", "doublage", "narration", "audio IA"],
      en: ["Voiceovers", "dubbing", "narration", "AI audio"],
    },
    limits: {
      fr: ["Attention aux droits des voix", "Usage intensif coûteux"],
      en: ["Voice rights matter", "High usage may cost more"],
    },
    review: "/blog/elevenlabs-review-2026",
    affiliate: "https://elevenlabs.io/",
    logos: [fav("elevenlabs.io"), icon("elevenlabs")],
    fallback: "E",
    accent: "#22c55e",
  },
  {
    id: "suno",
    name: "Suno",
    category: "AI music",
    badge: "New",
    short: {
      fr: "Très fort pour créer rapidement des musiques avec IA.",
      en: "Very strong for quickly creating AI music.",
    },
    desc: {
      fr: "Permet de générer morceaux, idées musicales, jingles, démos et contenus audio créatifs à partir de prompts.",
      en: "Can generate songs, musical ideas, jingles, demos and creative audio content from prompts.",
    },
    verdict: {
      fr: "À choisir si votre besoin principal touche à la musique IA.",
      en: "Choose it if your main need is AI music.",
    },
    goals: ["audio", "social", "business"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate"],
    priorities: ["creative", "speed", "price"],
    price: "Free / Pro / Premier",
    rating: 4.4,
    bestFor: {
      fr: ["Musique IA", "jingles", "contenu social", "démos audio"],
      en: ["AI music", "jingles", "social content", "audio demos"],
    },
    limits: {
      fr: ["Droits à vérifier", "Contrôle musical limité"],
      en: ["Rights should be checked", "Limited musical control"],
    },
    review: "/blog/suno-review-2026",
    affiliate: "https://suno.com/",
    logos: [fav("suno.com"), icon("suno")],
    fallback: "S",
    accent: "#f97316",
  },
  {
    id: "udio",
    name: "Udio",
    category: "AI music",
    badge: "Trending",
    short: {
      fr: "Très bon pour expérimenter des morceaux et idées musicales IA.",
      en: "Very good for experimenting with AI songs and musical ideas.",
    },
    desc: {
      fr: "Utile pour générer des chansons, variations musicales, idées de démos et contenus audio créatifs.",
      en: "Useful for generating songs, musical variations, demo ideas and creative audio content.",
    },
    verdict: {
      fr: "À choisir si vous voulez explorer la création musicale IA.",
      en: "Choose it if you want to explore AI music creation.",
    },
    goals: ["audio", "social", "business"],
    budgets: ["free", "low", "pro"],
    levels: ["beginner", "intermediate"],
    priorities: ["creative", "quality", "speed"],
    price: "Free / Paid",
    rating: 4.2,
    bestFor: {
      fr: ["Musique", "créativité", "démos", "contenu social"],
      en: ["Music", "creativity", "demos", "social content"],
    },
    limits: {
      fr: ["Droits à vérifier", "Contrôle parfois limité"],
      en: ["Rights should be checked", "Control can be limited"],
    },
    review: "/blog/udio-review-2026",
    affiliate: "https://www.udio.com/",
    logos: [fav("udio.com")],
    fallback: "U",
    accent: "#facc15",
  },
  {
    id: "descript",
    name: "Descript",
    category: "Audio & video editing",
    badge: "Best Value",
    short: {
      fr: "Très pratique pour montage podcast, vidéo, transcription et clips.",
      en: "Very useful for podcast editing, video, transcription and clips.",
    },
    desc: {
      fr: "Aide à monter audio/vidéo comme un document texte, avec transcription, nettoyage et réutilisation de contenus.",
      en: "Helps edit audio/video like a text document, with transcription, cleanup and repurposing.",
    },
    verdict: {
      fr: "À choisir pour podcasts, vidéos parlées, transcription et repurposing.",
      en: "Choose it for podcasts, talking videos, transcription and repurposing.",
    },
    goals: ["audio", "video", "social", "business"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "team", "quality"],
    price: "Free / Paid plans",
    rating: 4.3,
    bestFor: {
      fr: ["Podcast", "transcription", "clips", "montage rapide"],
      en: ["Podcast", "transcription", "clips", "fast editing"],
    },
    limits: {
      fr: ["Moins spécialisé voix synthétique", "Coûts selon usage"],
      en: ["Less focused on synthetic voice", "Costs depend on usage"],
    },
    review: "/blog/descript-review-2026",
    affiliate: "https://www.descript.com/",
    logos: [fav("descript.com"), icon("descript")],
    fallback: "D",
    accent: "#6366f1",
  },
  {
    id: "jasper",
    name: "Jasper",
    category: "AI writing",
    badge: "Enterprise",
    short: {
      fr: "Orienté marketing, marque et workflows de contenu.",
      en: "Focused on marketing, brand and content workflows.",
    },
    desc: {
      fr: "Conçu pour équipes marketing qui veulent produire du contenu avec cohérence de marque et processus collaboratif.",
      en: "Built for marketing teams that need brand consistency and collaborative content workflows.",
    },
    verdict: {
      fr: "À choisir pour marketing d’équipe, campagnes et cohérence de marque.",
      en: "Choose it for team marketing, campaigns and brand consistency.",
    },
    goals: ["writing", "seo", "business", "social"],
    budgets: ["pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["team", "quality", "speed"],
    price: "Paid / Business",
    rating: 4.1,
    bestFor: {
      fr: ["Marketing", "brand voice", "campagnes", "équipes contenu"],
      en: ["Marketing", "brand voice", "campaigns", "content teams"],
    },
    limits: {
      fr: ["Moins utile en solo", "Prix plus élevé"],
      en: ["Less useful solo", "Higher price"],
    },
    review: "/blog/jasper-ai-review-2026",
    affiliate: "https://www.jasper.ai/",
    logos: [fav("jasper.ai"), icon("jasper")],
    fallback: "J",
    accent: "#8b5cf6",
  },
  {
    id: "copyai",
    name: "Copy.ai",
    category: "AI writing",
    badge: "Best Value",
    short: {
      fr: "Bon outil pour textes marketing, ventes et workflows GTM.",
      en: "Good tool for marketing copy, sales and GTM workflows.",
    },
    desc: {
      fr: "Intéressant pour générer des textes commerciaux, emails, séquences et contenus marketing rapidement.",
      en: "Useful for sales copy, emails, sequences and fast marketing content.",
    },
    verdict: {
      fr: "À choisir pour textes marketing et sales rapides.",
      en: "Choose it for fast marketing and sales copy.",
    },
    goals: ["writing", "seo", "business", "social"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "price", "team"],
    price: "Free / Paid",
    rating: 4.0,
    bestFor: {
      fr: ["Emails", "sales", "copywriting", "marketing"],
      en: ["Emails", "sales", "copywriting", "marketing"],
    },
    limits: {
      fr: ["Moins naturel que Claude", "Qualité variable selon prompts"],
      en: ["Less natural than Claude", "Quality varies with prompts"],
    },
    review: "/blog/copy-ai-review-2026",
    affiliate: "https://www.copy.ai/",
    logos: [fav("copy.ai")],
    fallback: "C",
    accent: "#f59e0b",
  },
  {
    id: "writesonic",
    name: "Writesonic",
    category: "AI writing",
    badge: "Best Value",
    short: {
      fr: "Bon choix pour contenu marketing, SEO et génération rapide.",
      en: "Good choice for marketing content, SEO and fast generation.",
    },
    desc: {
      fr: "Utile pour articles, landing pages, publicités, contenus SEO et génération marketing à volume.",
      en: "Useful for articles, landing pages, ads, SEO content and volume marketing generation.",
    },
    verdict: {
      fr: "À choisir pour produire rapidement des contenus marketing et SEO.",
      en: "Choose it for fast marketing and SEO content production.",
    },
    goals: ["writing", "seo", "business", "social"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["speed", "price", "quality"],
    price: "Free / Paid",
    rating: 4.1,
    bestFor: {
      fr: ["Articles", "SEO", "publicités", "landing pages"],
      en: ["Articles", "SEO", "ads", "landing pages"],
    },
    limits: {
      fr: ["Moins premium en ton long-form", "Nécessite relecture éditoriale"],
      en: ["Less premium for long-form tone", "Needs editorial review"],
    },
    review: "/blog/writesonic-review-2026",
    affiliate: "https://writesonic.com/",
    logos: [fav("writesonic.com")],
    fallback: "W",
    accent: "#4f46e5",
  },
  {
    id: "notion",
    name: "Notion AI",
    category: "Productivity AI",
    badge: "Best Value",
    short: {
      fr: "Très pratique pour notes, documents, wiki et productivité.",
      en: "Very useful for notes, docs, wikis and productivity.",
    },
    desc: {
      fr: "Pertinent si votre organisation repose déjà sur Notion pour documents, projets, bases et connaissances.",
      en: "Relevant if your organization already uses Notion for docs, projects, databases and knowledge.",
    },
    verdict: {
      fr: "À choisir si Notion est déjà au cœur de votre workflow.",
      en: "Choose it if Notion is already central to your workflow.",
    },
    goals: ["writing", "business", "research", "presentation"],
    budgets: ["low", "pro", "team"],
    levels: ["beginner", "intermediate"],
    priorities: ["team", "speed", "quality"],
    price: "Paid add-on / Business",
    rating: 4.2,
    bestFor: {
      fr: ["Docs", "wiki", "résumés", "organisation"],
      en: ["Docs", "wiki", "summaries", "organization"],
    },
    limits: {
      fr: ["Moins polyvalent que ChatGPT", "Dépend de Notion"],
      en: ["Less versatile than ChatGPT", "Depends on Notion"],
    },
    review: "/blog/notion-ai-review-2026",
    affiliate: "https://www.notion.so/product/ai",
    logos: [fav("notion.so"), icon("notion")],
    fallback: "N",
    accent: "#ffffff",
  },
  {
    id: "grammarly",
    name: "Grammarly",
    category: "Writing assistant",
    badge: "Enterprise",
    short: {
      fr: "Très bon pour correction, clarté et rédaction professionnelle.",
      en: "Great for correction, clarity and professional writing.",
    },
    desc: {
      fr: "Utile pour améliorer les textes anglais, la clarté, le ton et la cohérence dans un cadre professionnel.",
      en: "Useful for improving English writing, clarity, tone and consistency in professional contexts.",
    },
    verdict: {
      fr: "À choisir si vous écrivez beaucoup en anglais.",
      en: "Choose it if you write a lot in English.",
    },
    goals: ["writing", "business"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["beginner", "intermediate", "advanced"],
    priorities: ["quality", "team", "speed"],
    price: "Free / Pro / Business",
    rating: 4.2,
    bestFor: {
      fr: ["Correction", "anglais pro", "emails", "clarté"],
      en: ["Proofreading", "business English", "emails", "clarity"],
    },
    limits: {
      fr: ["Moins utile pour génération créative", "Surtout orienté anglais"],
      en: ["Less useful for creative generation", "Mostly English-focused"],
    },
    review: "/blog/grammarly-review-2026",
    affiliate: "https://www.grammarly.com/",
    logos: [fav("grammarly.com"), icon("grammarly")],
    fallback: "G",
    accent: "#15c39a",
  },
  {
    id: "semrush",
    name: "Semrush AI",
    category: "SEO",
    badge: "Enterprise",
    short: {
      fr: "Très fort pour SEO, audit, mots-clés et stratégie contenu.",
      en: "Very strong for SEO, audits, keywords and content strategy.",
    },
    desc: {
      fr: "Utile pour recherche SEO, analyse concurrentielle, audit et production de contenu assistée.",
      en: "Useful for SEO research, competitive analysis, audits and assisted content production.",
    },
    verdict: {
      fr: "À choisir pour un usage SEO sérieux et professionnel.",
      en: "Choose it for serious professional SEO usage.",
    },
    goals: ["seo", "business", "research", "writing"],
    budgets: ["pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["quality", "team", "api"],
    price: "Paid / Business",
    rating: 4.4,
    bestFor: {
      fr: ["SEO", "audit", "mots-clés", "analyse concurrentielle"],
      en: ["SEO", "audit", "keywords", "competitive analysis"],
    },
    limits: {
      fr: ["Coûteux pour petits projets", "Complexe au départ"],
      en: ["Expensive for small projects", "Complex at first"],
    },
    review: "/blog/semrush-ai-review-2026",
    affiliate: "https://www.semrush.com/",
    logos: [fav("semrush.com"), icon("semrush")],
    fallback: "S",
    accent: "#ff642d",
  },
  {
    id: "surferseo",
    name: "Surfer SEO",
    category: "SEO writing",
    badge: "Pro Pick",
    short: {
      fr: "Très bon pour optimiser les contenus SEO.",
      en: "Very good for optimizing SEO content.",
    },
    desc: {
      fr: "Aide à structurer et optimiser des articles pour viser de meilleures performances organiques.",
      en: "Helps structure and optimize articles for better organic performance.",
    },
    verdict: {
      fr: "À choisir si votre priorité est le contenu SEO.",
      en: "Choose it if your priority is SEO content.",
    },
    goals: ["seo", "writing", "business"],
    budgets: ["low", "pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["quality", "speed", "team"],
    price: "Paid plans",
    rating: 4.3,
    bestFor: {
      fr: ["Optimisation SEO", "briefs", "articles", "content score"],
      en: ["SEO optimization", "briefs", "articles", "content score"],
    },
    limits: {
      fr: ["Ne remplace pas l’expertise éditoriale", "Prix selon volume"],
      en: ["Does not replace editorial expertise", "Pricing depends on volume"],
    },
    review: "/blog/surfer-seo-review-2026",
    affiliate: "https://surferseo.com/",
    logos: [fav("surferseo.com")],
    fallback: "S",
    accent: "#22c55e",
  },
  {
    id: "frase",
    name: "Frase",
    category: "SEO writing",
    badge: "Best Value",
    short: {
      fr: "Bon outil pour briefs SEO, contenus et analyse SERP.",
      en: "Good tool for SEO briefs, content and SERP analysis.",
    },
    desc: {
      fr: "Pratique pour créer des briefs, analyser les concurrents et structurer des contenus optimisés.",
      en: "Useful for creating briefs, analyzing competitors and structuring optimized content.",
    },
    verdict: {
      fr: "À choisir pour des briefs SEO rapides et structurés.",
      en: "Choose it for fast and structured SEO briefs.",
    },
    goals: ["seo", "writing", "research"],
    budgets: ["low", "pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["speed", "quality", "price"],
    price: "Paid plans",
    rating: 4.1,
    bestFor: {
      fr: ["Briefs SEO", "SERP", "articles", "analyse concurrente"],
      en: ["SEO briefs", "SERP", "articles", "competitor analysis"],
    },
    limits: {
      fr: ["Moins complet que Semrush", "Nécessite stratégie éditoriale"],
      en: ["Less complete than Semrush", "Needs editorial strategy"],
    },
    review: "/blog/frase-review-2026",
    affiliate: "https://www.frase.io/",
    logos: [fav("frase.io")],
    fallback: "F",
    accent: "#06b6d4",
  },
  {
    id: "ollama",
    name: "Ollama",
    category: "Local AI",
    badge: "Open Source",
    short: {
      fr: "Excellent pour utiliser des modèles IA localement.",
      en: "Excellent for running AI models locally.",
    },
    desc: {
      fr: "Pour profils techniques qui veulent lancer des modèles localement, tester des LLM open source et garder plus de contrôle.",
      en: "For technical users who want to run models locally, test open-source LLMs and keep more control.",
    },
    verdict: {
      fr: "À choisir si confidentialité, local et contrôle technique sont prioritaires.",
      en: "Choose it if privacy, local usage and technical control are priorities.",
    },
    goals: ["local", "coding", "research", "automation"],
    budgets: ["free", "low"],
    levels: ["advanced"],
    priorities: ["privacy", "api", "price"],
    price: "Free / Open source",
    rating: 4.5,
    bestFor: {
      fr: ["LLM local", "confidentialité", "tests modèles", "développeurs"],
      en: ["Local LLMs", "privacy", "model testing", "developers"],
    },
    limits: {
      fr: ["Demande un bon matériel", "Pas pensé pour débutants"],
      en: ["Requires good hardware", "Not beginner-first"],
    },
    review: "/blog/ollama-review-2026",
    affiliate: "https://ollama.com/",
    logos: [fav("ollama.com"), icon("ollama")],
    fallback: "O",
    accent: "#ffffff",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "AI platform",
    badge: "Open Source",
    short: {
      fr: "Plateforme clé pour modèles, datasets et IA open source.",
      en: "Key platform for models, datasets and open-source AI.",
    },
    desc: {
      fr: "Incontournable pour développeurs, chercheurs et équipes IA qui veulent explorer modèles, datasets et déploiements.",
      en: "Essential for developers, researchers and AI teams exploring models, datasets and deployments.",
    },
    verdict: {
      fr: "À choisir pour explorer, tester et intégrer des modèles IA.",
      en: "Choose it to explore, test and integrate AI models.",
    },
    goals: ["local", "coding", "research", "agents"],
    budgets: ["free", "low", "pro", "team"],
    levels: ["intermediate", "advanced"],
    priorities: ["api", "privacy", "price"],
    price: "Free / Pro / Enterprise",
    rating: 4.6,
    bestFor: {
      fr: ["Modèles open source", "datasets", "API", "recherche IA"],
      en: ["Open-source models", "datasets", "API", "AI research"],
    },
    limits: {
      fr: ["Technique pour débutants", "Demande de choisir les bons modèles"],
      en: ["Technical for beginners", "Requires choosing the right models"],
    },
    review: "/blog/huggingface-review-2026",
    affiliate: "https://huggingface.co/",
    logos: [fav("huggingface.co"), icon("huggingface")],
    fallback: "HF",
    accent: "#facc15",
  },
];

const COPY = {
  fr: {
    nav: {
      aifinder: "AI-Finder",
      blog: "Blog",
      comparatifs: "Comparatifs",
      newsletter: "Newsletter",
      contact: "Contact",
      about: "À propos",
    },
    badge: "AI Finder gratuit · sans compte",
    heroSub:
      "Répondez à 4 questions. Neuriflux analyse votre usage, votre budget, votre niveau et votre priorité pour recommander les outils IA les plus pertinents.",
    heroCta: "Lancer le finder",
    secondaryCta: "Voir les comparatifs",
    proof1: "Sans compte",
    proof2: "Résultat instantané",
    proof3: "Méthode transparente",
    progress: "Progression",
    resultTitle: "Vos meilleurs outils IA",
    resultSub: "Classement personnalisé selon votre profil, avec score, limites et alternatives.",
    restart: "Recommencer",
    bestMatch: "Meilleur choix",
    alternatives: "Alternatives recommandées",
    why: "Pourquoi ce choix",
    limits: "À savoir",
    visit: "Visiter l’outil",
    review: "Lire l’avis",
    liveRanking: "Classement en direct",
    match: "compatibilité",
    rating: "Note Neuriflux",
    newToolsTitle: "Nouveautés & tendances",
    newToolsSub: "Des outils récents, populaires ou en forte croissance à surveiller selon votre profil.",
    methodologyTitle: "Méthode de recommandation",
    methodologyText:
      "Le score combine l’usage principal, le budget, le niveau, la priorité, la spécialisation réelle de l’outil, sa note éditoriale et quelques bonus contextuels. Le résultat n’est pas une vérité absolue : c’est un raccourci utile pour choisir plus vite.",
    independenceTitle: "Indépendance & affiliation",
    independenceText:
      "Certains liens peuvent être affiliés. Cela ne modifie pas le classement : Neuriflux privilégie l’utilité réelle, les limites concrètes, la facilité d’usage et le rapport qualité/prix.",
    seoTitle: "Pourquoi utiliser l’AI Finder de Neuriflux ?",
    seoText:
      "Le marché des outils IA est devenu illisible : assistants généralistes, générateurs vidéo, moteurs de recherche IA, outils SEO, automatisation, voix, image, code, agents, IA locale et outils open source. Cette page vous aide à choisir plus vite sans comparer manuellement des dizaines de solutions.",
    categoriesTitle: "Cas d’usage couverts",
    finalCtaTitle: "Vous voulez comparer en détail ?",
    finalCtaText:
      "Consultez nos comparatifs complets avec scores, limites, prix, cas d’usage réels et verdicts honnêtes.",
    faqTitle: "Questions fréquentes",
    menu: "Menu principal",
    closeMenu: "Fermer le menu",
    langSwitch: "Changer de langue",
    brandDisclaimer:
      "Neuriflux est indépendant. Les noms, logos et marques appartiennent à leurs propriétaires respectifs. Leur présence ne signifie pas affiliation, partenariat ou validation officielle.",
    scoreBreakdown: "Détail du score",
    faqs: [
      {
        q: "L’AI Finder est-il gratuit ?",
        a: "Oui. Vous pouvez l’utiliser sans compte, sans inscription et sans paiement.",
      },
      {
        q: "Comment les outils sont-ils recommandés ?",
        a: "Le classement utilise un score basé sur votre besoin principal, votre budget, votre niveau, votre priorité, la spécialisation de chaque outil et une note éditoriale Neuriflux.",
      },
      {
        q: "Puis-je utiliser cette page pour choisir une IA professionnelle ?",
        a: "Oui. Les résultats incluent des outils adaptés aux indépendants, créateurs, équipes marketing, développeurs et petites entreprises.",
      },
      {
        q: "Pourquoi les scores ne sont-ils pas tous à 100% ?",
        a: "Parce qu’un outil IA a presque toujours des compromis : prix, facilité, spécialisation, qualité, API, confidentialité ou travail en équipe.",
      },
    ],
  },
  en: {
    nav: {
      aifinder: "AI-Finder",
      blog: "Blog",
      comparatifs: "Comparisons",
      newsletter: "Newsletter",
      contact: "Contact",
      about: "About",
    },
    badge: "Free AI Finder · no account",
    heroSub:
      "Answer 4 questions. Neuriflux analyzes your use case, budget, skill level and top priority to recommend the most relevant AI tools.",
    heroCta: "Start the finder",
    secondaryCta: "View comparisons",
    proof1: "No account",
    proof2: "Instant result",
    proof3: "Transparent method",
    progress: "Progress",
    resultTitle: "Your best AI tools",
    resultSub: "Personalized ranking based on your profile, with score, limitations and alternatives.",
    restart: "Start over",
    bestMatch: "Best match",
    alternatives: "Recommended alternatives",
    why: "Why this tool",
    limits: "Good to know",
    visit: "Visit tool",
    review: "Read review",
    liveRanking: "Live ranking",
    match: "match",
    rating: "Neuriflux rating",
    newToolsTitle: "New & trending tools",
    newToolsSub: "Recent, popular or fast-growing tools worth watching depending on your profile.",
    methodologyTitle: "Recommendation method",
    methodologyText:
      "The score combines your main use case, budget, skill level, top priority, each tool’s real specialization, editorial rating and contextual bonuses. It is not an absolute truth: it is a practical shortcut to choose faster.",
    independenceTitle: "Independence & affiliation",
    independenceText:
      "Some links may be affiliate links. This does not change the ranking: Neuriflux prioritizes usefulness, real limitations, ease of use and value for money.",
    seoTitle: "Why use the Neuriflux AI Finder?",
    seoText:
      "The AI tools market has become hard to read: general assistants, AI video generators, AI search engines, SEO tools, automation, voice, images, coding assistants, agents, local AI and open-source tools. This page helps you choose faster without manually comparing dozens of products.",
    categoriesTitle: "Covered use cases",
    finalCtaTitle: "Want a deeper comparison?",
    finalCtaText:
      "Read our full comparisons with scores, limitations, pricing, real-world use cases and honest verdicts.",
    faqTitle: "Frequently asked questions",
    menu: "Main navigation",
    closeMenu: "Close menu",
    langSwitch: "Change language",
    brandDisclaimer:
      "Neuriflux is independent. Product names, logos and brands are property of their respective owners. Their presence does not imply affiliation, partnership or official endorsement.",
    scoreBreakdown: "Score breakdown",
    faqs: [
      {
        q: "Is the AI Finder free?",
        a: "Yes. You can use it without an account, signup or payment.",
      },
      {
        q: "How are tools recommended?",
        a: "The ranking uses a score based on your main goal, budget, skill level, top priority, each tool’s specialization and a Neuriflux editorial rating.",
      },
      {
        q: "Can I use this page to choose a professional AI tool?",
        a: "Yes. Results include tools for freelancers, creators, marketing teams, developers and small businesses.",
      },
      {
        q: "Why are the scores not all 100%?",
        a: "Because every AI tool has trade-offs: price, ease of use, specialization, quality, API access, privacy or team features.",
      },
    ],
  },
} as const;

function getSteps(lang: Lang) {
  const fr = lang === "fr";

  return [
    {
      id: "goal" as const,
      title: fr ? "Quel est votre besoin principal ?" : "What is your main goal?",
      subtitle: fr
        ? "Choisissez le cas d’usage le plus important pour vous."
        : "Choose the use case that matters most to you.",
      options: [
        ["writing", fr ? "Rédaction" : "Writing", fr ? "Articles, emails, scripts, contenus longs." : "Articles, emails, scripts, long-form content."],
        ["seo", "SEO", fr ? "Contenus Google, comparatifs, mots-clés." : "Google content, comparisons, keywords."],
        ["video", fr ? "Vidéo IA" : "AI video", fr ? "Clips, pubs, shorts, concepts vidéo." : "Clips, ads, shorts, video concepts."],
        ["image", "Image / Design", fr ? "Visuels, thumbnails, branding, concepts." : "Visuals, thumbnails, branding, concepts."],
        ["coding", fr ? "Code" : "Coding", fr ? "Développement, debug, architecture." : "Development, debugging, architecture."],
        ["research", fr ? "Recherche" : "Research", fr ? "Sources, veille, analyse, informations fraîches." : "Sources, monitoring, analysis, fresh info."],
        ["automation", fr ? "Automatisation" : "Automation", fr ? "Workflows, API, tâches répétitives." : "Workflows, APIs, repetitive tasks."],
        ["presentation", fr ? "Présentation" : "Presentation", fr ? "Slides, pitch deck, documents visuels." : "Slides, pitch decks, visual documents."],
        ["avatar", fr ? "Avatar vidéo" : "Video avatar", fr ? "Vidéos avec avatars IA, formation, vente." : "AI avatar videos, training, sales."],
        ["local", fr ? "IA locale" : "Local AI", fr ? "Modèles locaux, confidentialité, open source." : "Local models, privacy, open source."],
        ["agents", fr ? "Agents IA" : "AI agents", fr ? "Apps, automatisations avancées, agents." : "Apps, advanced automation, agents."],
        ["audio", fr ? "Voix / Audio" : "Voice / Audio", fr ? "Voiceover, musique, podcast, doublage." : "Voiceover, music, podcast, dubbing."],
      ],
    },
    {
      id: "budget" as const,
      title: fr ? "Quel budget voulez-vous mettre ?" : "What is your budget?",
      subtitle: fr ? "Le prix change beaucoup selon les outils." : "Pricing varies a lot between tools.",
      options: [
        ["free", fr ? "Gratuit" : "Free", fr ? "Je veux commencer sans payer." : "I want to start without paying."],
        ["low", "< $20/mo", fr ? "Budget raisonnable pour un outil utile." : "Reasonable budget for a useful tool."],
        ["pro", "Pro", fr ? "Je paie si le gain est réel." : "I pay if the value is clear."],
        ["team", fr ? "Équipe" : "Team", fr ? "Usage sérieux, équipe ou entreprise." : "Serious team or business usage."],
      ],
    },
    {
      id: "level" as const,
      title: fr ? "Quel est votre niveau ?" : "What is your skill level?",
      subtitle: fr ? "On évite de vous recommander un outil trop complexe." : "We avoid recommending a tool that is too complex.",
      options: [
        ["beginner", fr ? "Débutant" : "Beginner", fr ? "Je veux simple et rapide." : "I want simple and fast."],
        ["intermediate", fr ? "Intermédiaire" : "Intermediate", fr ? "Je peux configurer un minimum." : "I can configure a few things."],
        ["advanced", fr ? "Avancé" : "Advanced", fr ? "Je veux contrôle, API, workflows." : "I want control, APIs and workflows."],
      ],
    },
    {
      id: "priority" as const,
      title: fr ? "Votre priorité absolue ?" : "Your top priority?",
      subtitle: fr ? "C’est ce qui départage les outils proches." : "This breaks ties between close recommendations.",
      options: [
        ["quality", fr ? "Qualité" : "Quality", fr ? "Je veux les meilleurs résultats." : "I want the best output."],
        ["speed", fr ? "Rapidité" : "Speed", fr ? "Je veux gagner du temps vite." : "I want to save time fast."],
        ["price", fr ? "Prix" : "Price", fr ? "Je veux le meilleur rapport qualité/prix." : "I want the best value."],
        ["creative", fr ? "Créativité" : "Creativity", fr ? "Je veux des idées, visuels ou contenus forts." : "I want strong ideas, visuals or content."],
        ["privacy", fr ? "Confidentialité" : "Privacy", fr ? "Je manipule des données sensibles." : "I handle sensitive data."],
        ["team", fr ? "Collaboration" : "Team", fr ? "Je travaille avec une équipe." : "I work with a team."],
        ["api", "API", fr ? "Je veux intégrer l’IA dans mes outils." : "I want to integrate AI into my tools."],
      ],
    },
  ];
}

function starRating(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
}

function has<T extends string>(value: T | undefined, list: T[]) {
  return Boolean(value && list.includes(value));
}

function getContextualGoalBoost(tool: Tool, goal?: AnswerKey) {
  if (!goal) return 0;

  const map: Record<string, string[]> = {
    writing: ["chatgpt", "claude", "jasper", "copyai", "writesonic", "grammarly", "notion"],
    seo: ["semrush", "surferseo", "frase", "perplexity", "jasper", "copyai", "writesonic", "chatgpt", "claude"],
    video: ["runway", "kling", "pika", "luma", "heygen", "synthesia", "elevenlabs", "descript"],
    image: ["midjourney", "leonardo", "ideogram", "canva", "firefly", "gemini"],
    coding: ["cursor", "github-copilot", "replit", "bolt", "v0", "lovable", "chatgpt", "claude", "deepseek", "mistral"],
    research: ["perplexity", "gemini", "chatgpt", "claude", "deepseek", "grok", "mistral", "huggingface"],
    automation: ["make", "zapier", "n8n", "chatgpt"],
    business: ["chatgpt", "claude", "gemini", "copilot", "notion", "jasper", "make", "zapier", "canva"],
    social: ["canva", "pika", "suno", "udio", "descript", "midjourney", "heygen", "copyai", "writesonic"],
    audio: ["elevenlabs", "suno", "udio", "descript"],
    presentation: ["gamma", "tome", "canva", "copilot", "v0", "lovable", "synthesia"],
    avatar: ["heygen", "synthesia", "runway", "elevenlabs"],
    local: ["ollama", "huggingface", "n8n", "mistral"],
    agents: ["n8n", "replit", "bolt", "lovable", "chatgpt", "mistral", "huggingface"],
  };

  return map[String(goal)]?.includes(tool.id) ? 14 : 0;
}

function getBadgeBoost(badge?: ToolBadge) {
  if (badge === "Pro Pick") return 4;
  if (badge === "Best Value") return 3;
  if (badge === "Free Pick") return 3;
  if (badge === "Open Source") return 2;
  if (badge === "Trending") return 2;
  if (badge === "Enterprise") return 1;
  if (badge === "New") return 1;
  return 0;
}

function scoreTools(answers: Answers, lang: Lang): ScoredTool[] {
  const answered = Object.keys(answers).length;

  return TOOLS.map((tool) => {
    const reasons: string[] = [];

    const goalMatch = has(answers.goal as Goal | undefined, tool.goals);
    const budgetMatch = has(answers.budget as Budget | undefined, tool.budgets);
    const levelMatch = has(answers.level as Level | undefined, tool.levels);
    const priorityMatch = has(answers.priority as Priority | undefined, tool.priorities);

    const goalScore = !answers.goal ? 0 : goalMatch ? 38 : -7;
    const budgetScore = !answers.budget ? 0 : budgetMatch ? 18 : -10;
    const levelScore = !answers.level ? 0 : levelMatch ? 16 : -8;
    const priorityScore = !answers.priority ? 0 : priorityMatch ? 20 : -4;

    const contextBoost = getContextualGoalBoost(tool, answers.goal);
    const badgeBoost = getBadgeBoost(tool.badge);
    const ratingBoost = Math.round((tool.rating - 4) * 6);
    const authorityScore = contextBoost + badgeBoost + ratingBoost;

    if (goalMatch) reasons.push(lang === "fr" ? "Correspond à votre usage principal" : "Matches your main use case");
    if (budgetMatch) reasons.push(lang === "fr" ? "Compatible avec votre budget" : "Fits your budget");
    if (levelMatch) reasons.push(lang === "fr" ? "Adapté à votre niveau" : "Fits your skill level");
    if (priorityMatch) reasons.push(lang === "fr" ? "Aligné avec votre priorité" : "Matches your top priority");

    if (contextBoost > 0) {
      reasons.push(lang === "fr" ? "Très spécialisé pour ce cas d’usage" : "Highly specialized for this use case");
    }

    const base = answered === 0 ? 48 + Math.round(tool.rating * 6) + badgeBoost : 28;
    const rawScore = base + goalScore + budgetScore + levelScore + priorityScore + authorityScore;
    const score = Math.max(34, Math.min(98, rawScore));

    return {
      ...tool,
      score,
      reasons: reasons.length ? reasons.slice(0, 5) : [lang === "fr" ? "Bon outil généraliste à comparer" : "Good general tool to compare"],
      breakdown: {
        goal: Math.max(0, goalScore + contextBoost),
        budget: Math.max(0, budgetScore),
        level: Math.max(0, levelScore),
        priority: Math.max(0, priorityScore),
        authority: Math.max(0, badgeBoost + ratingBoost),
      },
    };
  }).sort((a, b) => b.score - a.score || b.rating - a.rating || a.name.localeCompare(b.name));
}

function ToolLogo({ tool }: { tool: Tool }) {
  const [index, setIndex] = useState(0);
  const src = tool.logos[index];

  return (
    <div className="toolLogo" style={{ ["--accent" as string]: tool.accent }}>
      {src ? (
        <img
          src={src}
          alt={`${tool.name} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setIndex((value) => value + 1)}
        />
      ) : (
        <span>{tool.fallback}</span>
      )}
    </div>
  );
}

function Badge({ value, accent }: { value?: ToolBadge; accent: string }) {
  if (!value) return null;

  return (
    <span className="toolBadge" style={{ ["--accent" as string]: accent }}>
      {value}
    </span>
  );
}

export default function AiFinderClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const rawMenuId = useId();
  const menuId = `menu-${rawMenuId.replace(/:/g, "")}`;

  const t = COPY[lang];
  const steps = useMemo(() => getSteps(lang), [lang]);

  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const results = useMemo(() => scoreTools(answers, lang), [answers, lang]);
  const finished = Object.keys(answers).length === steps.length;
  const progress = Math.round((Object.keys(answers).length / steps.length) * 100);
  const current = steps[stepIndex];
  const winner = results[0];

  const l = useCallback((p = "") => `/${lang}${p}`, [lang]);

  const switchLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;

      trackEvent("ai_finder_language_switch", { from: lang, to: next });

      const nextPath = pathname.startsWith(`/${lang}`)
        ? pathname.replace(`/${lang}`, `/${next}`)
        : `/${next}/ai-finder`;

      router.push(nextPath);
    },
    [lang, pathname, router]
  );

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    fn();

    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  const select = useCallback(
    (key: AnswerKey) => {
      const id = current.id;
      const next = { ...answers, [id]: key };

      setAnswers(next);

      trackEvent("ai_finder_answer", {
        step: id,
        value: key,
        lang,
        progress: Math.round((Object.keys(next).length / steps.length) * 100),
      });

      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      }
    },
    [answers, current.id, lang, stepIndex, steps.length]
  );

  const restart = useCallback(() => {
    setAnswers({});
    setStepIndex(0);
    trackEvent("ai_finder_restart", { lang });
  }, [lang]);

  const goBack = useCallback(() => {
    setStepIndex((value) => Math.max(0, value - 1));
    trackEvent("ai_finder_back", { lang, from_step: current.id });
  }, [current.id, lang]);

  const newTools = useMemo(
    () => TOOLS.filter((tool) => ["New", "Trending", "Open Source"].includes(tool.badge ?? "")).slice(0, 9),
    []
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Neuriflux AI Finder",
    url: `https://neuriflux.com/${lang}/ai-finder`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      lang === "fr"
        ? "Outil interactif gratuit pour trouver le meilleur outil IA selon votre besoin."
        : "Free interactive tool to find the best AI tool for your needs.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lang === "fr" ? "Outils IA recommandés par Neuriflux" : "AI tools recommended by Neuriflux",
    itemListElement: TOOLS.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: tool.affiliate,
    })),
  };

  return (
    <>
      <Script id="ai-finder-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Script id="ai-finder-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="ai-finder-itemlist-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,.075);--border2:rgba(0,230,190,.22);
          --cyan:#00e6be;--cyan2:#64ffe4;--text:#edf2f7;--muted:#8292a4;--dim:#425266;
          --font:'Syne',system-ui,sans-serif;--mono:'JetBrains Mono',monospace;
          --pad:clamp(1.15rem,5vw,4rem);--r:22px;
        }
        body{background:var(--bg);color:var(--text);font-family:var(--font);overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        button,a{-webkit-tap-highlight-color:transparent}
        button:focus-visible,a:focus-visible{outline:2px solid var(--cyan);outline-offset:3px}
        .page{min-height:100vh;background:radial-gradient(circle at 18% 4%,rgba(0,230,190,.16),transparent 30%),radial-gradient(circle at 82% 8%,rgba(168,85,247,.13),transparent 30%),linear-gradient(180deg,#080c10 0%,#0b1117 46%,#080c10 100%);position:relative;overflow:hidden}
        .page::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.72),transparent 70%)}
        .page::after{content:"";position:fixed;width:560px;height:560px;right:-200px;top:160px;background:radial-gradient(circle,rgba(0,230,190,.08),transparent 65%);pointer-events:none;filter:blur(3px)}
        .nav{position:sticky;top:0;z-index:20;backdrop-filter:blur(20px);background:rgba(8,12,16,.78);border-bottom:1px solid var(--border);transition:.22s ease}
        .nav.scrolled{background:rgba(8,12,16,.96);box-shadow:0 12px 38px rgba(0,0,0,.38)}
        .navin{max-width:1180px;margin:auto;height:68px;padding:0 var(--pad);display:flex;align-items:center;justify-content:space-between;gap:1rem}
        .logo{display:flex;align-items:center;gap:.55rem;font-weight:850;letter-spacing:-.04em}
        .dot{width:11px;height:11px;border-radius:50%;background:var(--cyan);box-shadow:0 0 24px rgba(0,230,190,.9)}
        .logo em{font-style:normal;color:var(--cyan)}
        .navlinks{display:flex;align-items:center;gap:1rem;font-family:var(--mono);font-size:.72rem;color:var(--muted);list-style:none}
        .navlinks a:hover,.navlinks a.active{color:var(--cyan)}
        .navRight{display:flex;align-items:center;gap:.65rem}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:3px;display:flex;gap:2px}
        .lb{font-family:var(--mono);font-size:.67rem;font-weight:700;padding:4px 9px;border-radius:6px;border:0;cursor:pointer;background:transparent;color:var(--muted)}
        .lb.on{background:var(--cyan);color:#080c10}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}
        .hero{max-width:1180px;margin:auto;padding:clamp(4rem,8vw,7.5rem) var(--pad) 2.8rem;text-align:center;position:relative}
        .heroPreview{position:absolute;inset:auto 0 0;height:220px;pointer-events:none;opacity:.56}
        .previewCard{position:absolute;border:1px solid rgba(0,230,190,.18);background:rgba(17,24,32,.66);backdrop-filter:blur(18px);border-radius:18px;padding:1rem;box-shadow:0 24px 80px rgba(0,0,0,.35);text-align:left}
        .previewMain{left:2%;bottom:10px;width:275px}.previewFloat{right:4%;bottom:58px;width:230px}
        .previewCard span{display:block;color:var(--cyan);font-family:var(--mono);font-size:.62rem;margin-bottom:.4rem}
        .previewCard strong{display:block;font-size:1.15rem;letter-spacing:-.035em}
        .previewCard small{display:block;color:var(--muted);font-family:var(--mono);font-size:.65rem;margin-top:.4rem;line-height:1.5}
        .badge{display:inline-flex;align-items:center;gap:.5rem;padding:7px 14px;border-radius:999px;border:1px solid var(--border2);background:rgba(0,230,190,.075);color:var(--cyan);font-family:var(--mono);font-size:.68rem;letter-spacing:.07em;text-transform:uppercase;margin-bottom:1.25rem;position:relative;z-index:1}
        .pulse{width:6px;height:6px;border-radius:50%;background:var(--cyan);box-shadow:0 0 18px rgba(0,230,190,.9);animation:pulse 1.8s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.82)}}
        h1{max-width:940px;margin:0 auto .95rem;font-size:clamp(2.45rem,6vw,5.35rem);line-height:.96;letter-spacing:-.07em;font-weight:900;position:relative;z-index:1}
        h1 span{color:var(--cyan);text-shadow:0 0 42px rgba(0,230,190,.24)}
        .sub{max-width:790px;margin:0 auto 1.55rem;font-family:var(--mono);font-size:clamp(.82rem,1.4vw,.96rem);line-height:1.85;color:var(--muted);position:relative;z-index:1}
        .heroactions{display:flex;justify-content:center;flex-wrap:wrap;gap:.8rem;margin-bottom:1.35rem;position:relative;z-index:1}
        .btn{border:1px solid var(--border);border-radius:12px;padding:13px 18px;font-weight:850;font-size:.82rem;cursor:pointer;transition:.18s ease;display:inline-flex;align-items:center;justify-content:center;gap:.45rem;background:transparent;font-family:var(--font)}
        .primary{background:var(--cyan);color:#06100e;border-color:var(--cyan);box-shadow:0 0 28px rgba(0,230,190,.22)}
        .primary:hover{transform:translateY(-2px);filter:brightness(1.08)}
        .secondary{background:rgba(255,255,255,.035);color:var(--text)}
        .secondary:hover{border-color:var(--border2);color:var(--cyan);transform:translateY(-2px)}
        .proof{display:flex;justify-content:center;flex-wrap:wrap;gap:.7rem;color:var(--muted);font-family:var(--mono);font-size:.68rem;position:relative;z-index:1}
        .proof span{padding:7px 11px;border:1px solid var(--border);border-radius:999px;background:rgba(255,255,255,.025)}
        .wrap{max-width:1180px;margin:auto;padding:1rem var(--pad) 5rem;position:relative;z-index:1}
        .finder{display:grid;grid-template-columns:minmax(0,1.1fr) 360px;gap:1rem;align-items:start}
        .panel{border:1px solid var(--border);border-radius:var(--r);background:linear-gradient(180deg,rgba(17,24,32,.92),rgba(10,15,21,.90));box-shadow:0 18px 70px rgba(0,0,0,.32);overflow:hidden;position:relative}
        .panel::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 30% 0%,rgba(0,230,190,.11),transparent 38%)}
        .question,.results{position:relative;z-index:1;padding:1.45rem}
        .topline{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.2rem}
        .mono{font-family:var(--mono);font-size:.7rem;color:var(--muted);letter-spacing:.04em}
        .backBtn{border:1px solid var(--border);background:rgba(255,255,255,.025);color:var(--muted);border-radius:999px;padding:6px 10px;font-family:var(--mono);font-size:.66rem;cursor:pointer}
        .backBtn:hover:not(:disabled){color:var(--cyan);border-color:var(--border2)}
        .backBtn:disabled{opacity:.35;cursor:not-allowed}
        .bar{height:8px;background:rgba(255,255,255,.055);border-radius:999px;overflow:hidden;margin-bottom:1.35rem}
        .bar i{display:block;height:100%;width:var(--w);background:linear-gradient(90deg,var(--cyan),var(--cyan2));box-shadow:0 0 22px rgba(0,230,190,.5);border-radius:999px;transition:.28s ease}
        .question h2{font-size:clamp(1.55rem,3vw,2.35rem);letter-spacing:-.045em;margin-bottom:.45rem}
        .question p,.results p{color:var(--muted);font-family:var(--mono);font-size:.78rem;line-height:1.7;margin-bottom:1.2rem}
        .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}
        .option{width:100%;text-align:left;border:1px solid var(--border);background:rgba(255,255,255,.028);color:var(--text);border-radius:15px;padding:1rem;cursor:pointer;transition:.18s ease;font-family:var(--font)}
        .option:hover{transform:translateY(-3px);border-color:var(--border2);background:rgba(0,230,190,.055);box-shadow:0 16px 40px rgba(0,0,0,.24)}
        .option b{display:block;font-size:.95rem;margin-bottom:.35rem}
        .option small{display:block;color:var(--muted);line-height:1.55;font-family:var(--mono);font-size:.68rem}
        .side{padding:1rem;position:sticky;top:88px}
        .side h3{font-size:1rem;letter-spacing:-.02em;margin-bottom:.8rem}
        .mini{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.75rem;border:1px solid var(--border);border-radius:13px;background:rgba(255,255,255,.025);margin-bottom:.55rem}
        .miniLeft{display:flex;align-items:center;gap:.65rem;flex:1;min-width:0}
        .miniIcon .toolLogo{width:26px;height:26px;border-radius:8px;box-shadow:none}
        .miniIcon .toolLogo img{width:15px;height:15px}
        .miniIcon .toolLogo span{font-size:.55rem}
        .mini strong{font-size:.82rem;display:block}
        .miniBadge{display:inline-flex;margin-left:.35rem;color:var(--cyan);font-family:var(--mono);font-size:.52rem;font-weight:700;vertical-align:middle}
        .miniBar{height:4px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden;margin-top:.38rem}
        .miniBar i{display:block;height:100%;width:var(--score);background:linear-gradient(90deg,var(--cyan),var(--cyan2));border-radius:999px}
        .mini span{font-family:var(--mono);font-size:.68rem;color:var(--cyan)}
        .resultsHead{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem}
        .results h2{font-size:clamp(1.65rem,3vw,2.55rem);letter-spacing:-.045em;margin-bottom:.35rem}
        .winnerCard{position:relative;margin-bottom:1rem;padding:1.35rem;border-radius:20px;border:1px solid color-mix(in srgb,var(--accent) 45%,transparent);background:radial-gradient(circle at 20% 0%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 40%),linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));box-shadow:0 0 60px color-mix(in srgb,var(--accent) 13%,transparent)}
        .winnerLabel{display:inline-flex;padding:5px 10px;border-radius:999px;background:var(--cyan);color:#06100e;font-family:var(--mono);font-weight:850;font-size:.62rem;margin-bottom:.75rem}
        .toolBadge{display:inline-flex;padding:4px 8px;border-radius:999px;font-family:var(--mono);font-size:.58rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#06100e;background:var(--accent);box-shadow:0 0 18px color-mix(in srgb,var(--accent) 22%,transparent);margin-left:.45rem}
        .winnerLayout{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
        .toolIdentity{display:flex;align-items:flex-start;gap:.9rem;min-width:0}
        .toolLogo{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:linear-gradient(145deg,color-mix(in srgb,var(--accent) 18%,transparent),rgba(255,255,255,.035));border:1px solid color-mix(in srgb,var(--accent) 36%,transparent);box-shadow:0 0 28px color-mix(in srgb,var(--accent) 18%,transparent);overflow:hidden}
        .toolLogo img{width:27px;height:27px;object-fit:contain}
        .toolLogo span{display:grid;place-items:center;width:100%;height:100%;font-weight:900;color:var(--accent);font-size:.78rem}
        .winnerMeta{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:.8rem}
        .ratingPill,.pricePill{border:1px solid var(--border);background:rgba(255,255,255,.03);border-radius:999px;padding:6px 10px;color:var(--muted);font-family:var(--mono);font-size:.66rem}
        .stars{color:#facc15;letter-spacing:.04em}
        .scoreBig{font-family:var(--mono);color:var(--cyan);border:1px solid rgba(0,230,190,.24);border-radius:14px;padding:.75rem;min-width:104px;text-align:center;background:rgba(0,230,190,.055)}
        .scoreBig strong{display:block;font-size:1.4rem}
        .scoreBig span{font-size:.62rem;color:var(--muted)}
        .breakdown{display:grid;grid-template-columns:repeat(5,1fr);gap:.45rem;margin-top:.9rem}
        .breakItem{border:1px solid var(--border);border-radius:10px;padding:.55rem;background:rgba(0,0,0,.12)}
        .breakItem small{display:block;color:var(--muted);font-family:var(--mono);font-size:.58rem;margin-bottom:.25rem}
        .breakItem strong{font-family:var(--mono);font-size:.72rem;color:var(--cyan)}
        .resultCard{border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,.03);padding:1rem;margin-bottom:.85rem;transition:.18s ease}
        .resultCard:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--accent) 35%,transparent);box-shadow:0 16px 46px rgba(0,0,0,.25)}
        .resultTop{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:.65rem}
        .tag{display:inline-flex;padding:5px 9px;border-radius:999px;background:rgba(0,230,190,.09);color:var(--cyan);border:1px solid rgba(0,230,190,.18);font-family:var(--mono);font-size:.63rem;margin-bottom:.55rem}
        .score{font-family:var(--mono);color:var(--cyan);font-size:.8rem;border:1px solid rgba(0,230,190,.22);border-radius:999px;padding:6px 9px;white-space:nowrap}
        .resultCard h3,.winnerCard h3{font-size:1.3rem;letter-spacing:-.035em;margin-bottom:.2rem}
        .resultCard p,.winnerCard p{color:var(--muted);font-family:var(--mono);font-size:.73rem;line-height:1.65}
        .cols{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-top:.9rem}
        .box{border:1px solid var(--border);border-radius:13px;padding:.75rem;background:rgba(0,0,0,.14)}
        .box b{display:block;font-size:.72rem;margin-bottom:.45rem;color:var(--text)}
        .box ul{list-style:none;display:grid;gap:.34rem}
        .box li{color:var(--muted);font-family:var(--mono);font-size:.66rem;line-height:1.45}
        .actions{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:.9rem}
        .smallbtn{font-size:.72rem;padding:9px 11px;border-radius:10px}
        .newTools,.methodCard,.seoCard,.faq,.finalCta{border:1px solid var(--border);border-radius:var(--r);background:rgba(255,255,255,.025);padding:1.25rem}
        .newTools{margin-top:1rem}
        .sectionHead{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1rem}
        .sectionHead p{color:var(--muted);font-family:var(--mono);font-size:.72rem;line-height:1.6;max-width:560px}
        .newGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
        .newTool{display:flex;align-items:center;gap:.75rem;border:1px solid color-mix(in srgb,var(--accent) 22%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--accent) 9%,transparent),rgba(255,255,255,.02));border-radius:15px;padding:.85rem;transition:.18s ease}
        .newTool:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(0,0,0,.24)}
        .newTool .toolLogo{width:38px;height:38px;border-radius:12px}
        .newTool .toolLogo img{width:22px;height:22px}
        .newTool strong{display:block;font-size:.82rem}
        .newTool span{display:block;margin-top:.2rem;color:var(--accent);font-family:var(--mono);font-size:.62rem}
        .method,.seo{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}
        .methodCard strong,.seoCard h2,.seoCard h3,.faq h2,.finalCta h2{letter-spacing:-.035em;margin-bottom:.65rem;display:block}
        .methodCard p,.seoCard p,.seoCard li,.finalCta p{color:var(--muted);font-family:var(--mono);font-size:.74rem;line-height:1.75}
        .seoCard ul{list-style:none;display:grid;gap:.45rem}
        .faq,.finalCta{margin-top:1rem}
        .faq h2{margin-bottom:.9rem}
        details{border-top:1px solid var(--border);padding:.9rem 0}
        details:first-of-type{border-top:0}
        summary{cursor:pointer;font-weight:850}
        details p{margin-top:.55rem;color:var(--muted);font-family:var(--mono);font-size:.74rem;line-height:1.7}
        .finalCta{text-align:center;background:radial-gradient(circle at 50% 0%,rgba(0,230,190,.12),transparent 45%),rgba(255,255,255,.025)}
        .finalCta p{max-width:640px;margin:0 auto 1rem}
        .brandDisclaimer{margin-top:1rem;font-family:var(--mono);font-size:.62rem;color:var(--dim);line-height:1.6}
        .footer{max-width:1180px;margin:auto;padding:2rem var(--pad);border-top:1px solid var(--border);color:var(--dim);font-family:var(--mono);font-size:.68rem;display:flex;justify-content:space-between;gap:1rem;position:relative;z-index:1}
        @media(max-width:980px){.finder{grid-template-columns:1fr}.side{position:relative;top:auto}.seo,.method{grid-template-columns:1fr}.heroPreview{display:none}.newGrid{grid-template-columns:1fr}.sectionHead{align-items:flex-start;flex-direction:column}.breakdown{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:720px){.hb{display:flex}.navlinks{display:none}.navlinks.open{display:flex;flex-direction:column;align-items:flex-start;position:fixed;top:68px;left:0;right:0;background:rgba(13,17,23,.98);border-bottom:1px solid var(--border);padding:1.2rem var(--pad) 1.4rem;gap:1rem;z-index:99}}
        @media(max-width:640px){.grid{grid-template-columns:1fr}.cols{grid-template-columns:1fr}.resultsHead,.winnerLayout,.resultTop{flex-direction:column}.scoreBig{width:100%;text-align:left}.footer{flex-direction:column}}
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
      `}</style>

      <main className="page">
        <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label={t.menu}>
          <div className="navin">
            <Link href={l("")} className="logo" onClick={() => trackEvent("ai_finder_nav_click", { location: "logo", lang })}>
              <span className="dot" />
              Neuri<em>flux</em>
            </Link>

            <ul id={menuId} className={`navlinks${menuOpen ? " open" : ""}`} role="list">
              <li><Link href={l("/aifinder")} className="active">{t.nav.aifinder}</Link></li>
              <li><Link href={l("/blog")}>{t.nav.blog}</Link></li>
              <li><Link href={l("/comparatifs")}>{t.nav.comparatifs}</Link></li>
              <li><Link href={l("/newsletter")}>{t.nav.newsletter}</Link></li>
              <li><Link href={l("/contact")}>{t.nav.contact}</Link></li>
              <li><Link href={l("/about")}>{t.nav.about}</Link></li>
            </ul>

            <div className="navRight">
              <div className="lt" aria-label={t.langSwitch}>
                <button className={`lb${lang === "fr" ? " on" : ""}`} aria-pressed={lang === "fr"} onClick={() => switchLang("fr")}>FR</button>
                <button className={`lb${lang === "en" ? " on" : ""}`} aria-pressed={lang === "en"} onClick={() => switchLang("en")}>EN</button>
              </div>

              <button
                className="hb"
                onClick={() => {
                  setMenuOpen((value) => !value);
                  trackEvent("ai_finder_menu_toggle", { lang, open: !menuOpen });
                }}
                aria-label={menuOpen ? t.closeMenu : t.menu}
                aria-expanded={menuOpen}
                aria-controls={menuId}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </nav>

        <section className="hero">
          <div className="heroPreview" aria-hidden="true">
            <div className="previewCard previewMain">
              <span>AI Finder</span>
              <strong>{TOOLS.length}+ AI tools</strong>
              <small>ChatGPT · Claude · Perplexity · Cursor · Runway · n8n</small>
            </div>

            <div className="previewCard previewFloat">
              <span>Profile</span>
              <strong>SEO + Research</strong>
              <small>No account required · instant result</small>
            </div>
          </div>

          <div className="badge"><span className="pulse" />{t.badge}</div>

          <h1>
            {lang === "fr" ? (
              <>Trouvez <span>l’outil IA</span> parfait pour votre besoin.</>
            ) : (
              <>Find the <span>perfect AI tool</span> for your workflow.</>
            )}
          </h1>

          <p className="sub">{t.heroSub}</p>

          <div className="heroactions">
            <a href="#finder" className="btn primary" onClick={() => trackEvent("ai_finder_start_click", { lang })}>
              {t.heroCta} →
            </a>

            <Link href={l("/comparatifs")} className="btn secondary">
              {t.secondaryCta}
            </Link>
          </div>

          <div className="proof">
            <span>✓ {t.proof1}</span>
            <span>✓ {t.proof2}</span>
            <span>✓ {t.proof3}</span>
          </div>
        </section>

        <section className="wrap" id="finder">
          <div className="finder">
            <div className="panel">
              {!finished ? (
                <div className="question">
                  <div className="topline">
                    <button type="button" className="backBtn" disabled={stepIndex === 0} onClick={goBack}>
                      ← {lang === "fr" ? "Retour" : "Back"}
                    </button>

                    <span className="mono">
                      {t.progress} · {progress}% · {stepIndex + 1}/{steps.length}
                    </span>
                  </div>

                  <div className="bar" style={{ ["--w" as string]: `${progress}%` }}>
                    <i />
                  </div>

                  <h2>{current.title}</h2>
                  <p>{current.subtitle}</p>

                  <div className="grid">
                    {current.options.map(([key, title, desc]) => (
                      <button key={key} className="option" onClick={() => select(key as AnswerKey)} type="button">
                        <b>{title}</b>
                        <small>{desc}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="results">
                  <div className="resultsHead">
                    <div>
                      <span className="tag">{t.bestMatch}</span>
                      <h2>{t.resultTitle}</h2>
                      <p>{t.resultSub}</p>
                    </div>

                    <button className="btn secondary smallbtn" onClick={restart} type="button">
                      {t.restart}
                    </button>
                  </div>

                  {winner && (
                    <article className="winnerCard" style={{ ["--accent" as string]: winner.accent }}>
                      <span className="winnerLabel">{t.bestMatch}</span>
                      <Badge value={winner.badge} accent={winner.accent} />

                      <div className="winnerLayout">
                        <div className="toolIdentity">
                          <ToolLogo tool={winner} />
                          <div>
                            <h3>{winner.name}</h3>
                            <p>{winner.desc[lang]}</p>

                            <div className="winnerMeta">
                              <span className="ratingPill">
                                <span className="stars">{starRating(winner.rating)}</span> {winner.rating}/5 · {t.rating}
                              </span>
                              <span className="pricePill">{winner.price}</span>
                            </div>
                          </div>
                        </div>

                        <div className="scoreBig">
                          <strong>{winner.score}%</strong>
                          <span>{t.match}</span>
                        </div>
                      </div>

                      <div className="breakdown" aria-label={t.scoreBreakdown}>
                        <div className="breakItem"><small>Use case</small><strong>+{winner.breakdown.goal}</strong></div>
                        <div className="breakItem"><small>Budget</small><strong>+{winner.breakdown.budget}</strong></div>
                        <div className="breakItem"><small>Level</small><strong>+{winner.breakdown.level}</strong></div>
                        <div className="breakItem"><small>Priority</small><strong>+{winner.breakdown.priority}</strong></div>
                        <div className="breakItem"><small>Signal</small><strong>+{winner.breakdown.authority}</strong></div>
                      </div>

                      <div className="cols">
                        <div className="box">
                          <b>{t.why}</b>
                          <ul>
                            {winner.reasons.concat(winner.bestFor[lang].slice(0, 2)).slice(0, 5).map((x) => (
                              <li key={x}>✓ {x}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="box">
                          <b>{t.limits}</b>
                          <ul>
                            {winner.limits[lang].map((x) => (
                              <li key={x}>• {x}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <p style={{ marginTop: ".9rem", marginBottom: 0 }}>{winner.verdict[lang]}</p>

                      <div className="actions">
                        <a
                          href={winner.affiliate}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="btn primary smallbtn"
                          onClick={() =>
                            trackEvent("ai_finder_affiliate_click", {
                              tool: winner.id,
                              tool_name: winner.name,
                              score: winner.score,
                              lang,
                              position: 1,
                            })
                          }
                        >
                          {t.visit}
                        </a>

                        <Link href={l(winner.review)} className="btn secondary smallbtn">
                          {t.review}
                        </Link>
                      </div>
                    </article>
                  )}

                  <span className="tag">{t.alternatives}</span>

                  {results.slice(1, 8).map((tool, index) => (
                    <article className="resultCard" key={tool.id} style={{ ["--accent" as string]: tool.accent }}>
                      <div className="resultTop">
                        <div className="toolIdentity">
                          <ToolLogo tool={tool} />
                          <div>
                            <span className="tag">{tool.category}</span>
                            <Badge value={tool.badge} accent={tool.accent} />
                            <h3>{tool.name}</h3>
                            <p>{tool.short[lang]}</p>
                          </div>
                        </div>

                        <span className="score">{tool.score}%</span>
                      </div>

                      <p>{tool.desc[lang]}</p>

                      <div className="cols">
                        <div className="box">
                          <b>{t.why}</b>
                          <ul>
                            {tool.bestFor[lang].map((x) => (
                              <li key={x}>✓ {x}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="box">
                          <b>{t.limits}</b>
                          <ul>
                            {tool.limits[lang].map((x) => (
                              <li key={x}>• {x}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="winnerMeta">
                        <span className="ratingPill">
                          <span className="stars">{starRating(tool.rating)}</span> {tool.rating}/5
                        </span>
                        <span className="pricePill">{tool.price}</span>
                      </div>

                      <div className="actions">
                        <a
                          href={tool.affiliate}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="btn primary smallbtn"
                          onClick={() =>
                            trackEvent("ai_finder_affiliate_click", {
                              tool: tool.id,
                              tool_name: tool.name,
                              score: tool.score,
                              lang,
                              position: index + 2,
                            })
                          }
                        >
                          {t.visit}
                        </a>

                        <Link href={l(tool.review)} className="btn secondary smallbtn">
                          {t.review}
                        </Link>
                      </div>
                    </article>
                  ))}

                  <p className="brandDisclaimer">{t.brandDisclaimer}</p>
                </div>
              )}
            </div>

            <aside className="panel side">
              <h3>{t.liveRanking}</h3>

              {results.slice(0, 9).map((tool) => (
                <div className="mini" key={tool.id}>
                  <div className="miniLeft">
                    <div className="miniIcon">
                      <ToolLogo tool={tool} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>
                        {tool.name}
                        {tool.badge && <small className="miniBadge">{tool.badge}</small>}
                      </strong>

                      <div className="miniBar" style={{ ["--score" as string]: `${tool.score}%` }}>
                        <i />
                      </div>
                    </div>
                  </div>

                  <span>{tool.score}%</span>
                </div>
              ))}
            </aside>
          </div>

          <section className="newTools">
            <div className="sectionHead">
              <span className="tag">{t.newToolsTitle}</span>
              <p>{t.newToolsSub}</p>
            </div>

            <div className="newGrid">
              {newTools.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.affiliate}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="newTool"
                  style={{ ["--accent" as string]: tool.accent }}
                  onClick={() => trackEvent("ai_finder_new_tool_click", { tool: tool.id, lang })}
                >
                  <ToolLogo tool={tool} />
                  <div>
                    <strong>{tool.name}</strong>
                    <span>{tool.badge}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <div className="method">
            <section className="methodCard">
              <strong>{t.methodologyTitle}</strong>
              <p>{t.methodologyText}</p>
            </section>

            <section className="methodCard">
              <strong>{t.independenceTitle}</strong>
              <p>{t.independenceText}</p>
            </section>
          </div>

          <div className="seo">
            <section className="seoCard">
              <h2>{t.seoTitle}</h2>
              <p>{t.seoText}</p>
            </section>

            <section className="seoCard">
              <h3>{t.categoriesTitle}</h3>
              <ul>
                <li>✓ AI writing tools</li>
                <li>✓ Best AI tools for SEO</li>
                <li>✓ AI video generators</li>
                <li>✓ AI image & design generators</li>
                <li>✓ AI coding assistants</li>
                <li>✓ AI automation tools</li>
                <li>✓ AI voice & music generators</li>
                <li>✓ AI presentation builders</li>
                <li>✓ Local AI / open-source workflows</li>
              </ul>
            </section>
          </div>

          <section className="faq">
            <h2>{t.faqTitle}</h2>

            {t.faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>

          <section className="finalCta">
            <h2>{t.finalCtaTitle}</h2>
            <p>{t.finalCtaText}</p>

            <Link href={l("/comparatifs")} className="btn primary">
              {t.secondaryCta} →
            </Link>
          </section>
        </section>

        <footer className="footer">
          <span>© 2026 Neuriflux</span>
          <span>Honest AI tools comparisons.</span>
        </footer>
      </main>
    </>
  );
}