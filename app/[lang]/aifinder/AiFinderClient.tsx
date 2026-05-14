"use client";

import Link from "next/link";
import Script from "next/script";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* ============================================================
 * Types
 * ============================================================ */

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
type Priority =
  | "quality"
  | "speed"
  | "price"
  | "creative"
  | "privacy"
  | "team"
  | "api";

type StepId = "goal" | "budget" | "level" | "priority";

type ToolBadge =
  | "New"
  | "Trending"
  | "Best Value"
  | "Pro Pick"
  | "Open Source"
  | "Enterprise"
  | "Free Pick";

/** Strictly-typed answers — one key per step, value typed exactly. */
type Answers = {
  goal?: Goal;
  budget?: Budget;
  level?: Level;
  priority?: Priority;
};

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
  tags?: string[];
  popularity?: number;
  setupMinutes?: number;
  alternatives?: string[];
  freePlan?: boolean;
  apiAvailable?: boolean;
};

type ScoredTool = Tool & {
  score: number;
  confidence: number;
  semanticTags: string[];
  reasons: string[];
  breakdown: {
    goal: number;
    budget: number;
    level: number;
    priority: number;
    authority: number;
  };
};

type StepOption<K extends string> = readonly [K, string, string];

type Step =
  | { id: "goal"; title: string; subtitle: string; options: ReadonlyArray<StepOption<Goal>> }
  | { id: "budget"; title: string; subtitle: string; options: ReadonlyArray<StepOption<Budget>> }
  | { id: "level"; title: string; subtitle: string; options: ReadonlyArray<StepOption<Level>> }
  | { id: "priority"; title: string; subtitle: string; options: ReadonlyArray<StepOption<Priority>> };

/** Utility type for CSS custom properties (avoids `["--x" as string]` casts). */
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

/* ============================================================
 * Constants
 * ============================================================ */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://neuriflux.com").replace(/\/$/, "");

const STORAGE_KEY = "neuriflux_aifinder_answers_v1";
const STORAGE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/** All scoring weights in one place. Tweak here to retune the recommendation. */
const SCORE = {
  goalHit: 38,
  goalMiss: -7,
  budgetHit: 18,
  budgetMiss: -10,
  levelHit: 16,
  levelMiss: -8,
  priorityHit: 20,
  priorityMiss: -4,
  baseAnswered: 28,
  baseUnanswered: 48,
  ratingFactor: 6,
  contextBoost: 14,
  min: 34,
  max: 100,
} as const;

const BADGE_BOOST: Record<ToolBadge, number> = {
  "Pro Pick": 4,
  "Best Value": 3,
  "Free Pick": 3,
  "Open Source": 2,
  Trending: 2,
  Enterprise: 1,
  New: 1,
};

const CONTEXTUAL_GOAL_BOOST: Readonly<Record<Goal, ReadonlyArray<string>>> = {
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


const GOAL_SEMANTIC_TAGS: Readonly<Record<Goal, readonly string[]>> = {
  writing: ["writing", "copywriting", "blog", "emails", "content", "summaries"],
  seo: ["seo", "keywords", "content marketing", "search intent", "serp", "affiliate"],
  video: ["video", "shorts", "ads", "editing", "avatar", "b-roll"],
  image: ["image", "design", "thumbnails", "branding", "illustration", "creative"],
  coding: ["coding", "developer", "debug", "apps", "typescript", "api"],
  research: ["research", "sources", "analysis", "monitoring", "fresh information"],
  automation: ["automation", "workflows", "integrations", "no-code", "api"],
  business: ["business", "productivity", "sales", "operations", "strategy"],
  social: ["social media", "short form", "creator", "viral", "content"],
  audio: ["voice", "audio", "music", "podcast", "dubbing"],
  presentation: ["presentation", "slides", "pitch deck", "visual documents"],
  avatar: ["avatar", "training", "sales video", "ai presenter"],
  local: ["local ai", "privacy", "open source", "offline", "self-hosted"],
  agents: ["agents", "automation", "apps", "orchestration", "tools"],
};

const PRIORITY_SEMANTIC_TAGS: Readonly<Record<Priority, readonly string[]>> = {
  quality: ["quality", "accuracy", "best output"],
  speed: ["speed", "fast", "productivity"],
  price: ["value", "free", "affordable"],
  creative: ["creative", "ideas", "visual"],
  privacy: ["privacy", "local", "open source"],
  team: ["team", "collaboration", "enterprise"],
  api: ["api", "developer", "integration"],
};

const CATEGORY_TAGS: ReadonlyArray<[string, readonly string[]]> = [
  ["video", ["video", "shorts", "avatar", "editing"]],
  ["image", ["image", "design", "creative", "thumbnail"]],
  ["code", ["coding", "developer", "apps", "api"]],
  ["search", ["research", "sources", "seo"]],
  ["automation", ["automation", "workflow", "integration"]],
  ["voice", ["voice", "audio", "music"]],
  ["presentation", ["presentation", "slides", "deck"]],
  ["agent", ["agents", "automation", "orchestration"]],
  ["all-in-one", ["assistant", "productivity", "writing", "research"]],
];

/* ============================================================
 * Analytics
 * ============================================================ */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

function trackEvent(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });

  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
}

/* ============================================================
 * Logo helpers
 * ============================================================ */

const icon = (slug: string) => `https://cdn.simpleicons.org/${slug}/FFFFFF`;
const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

/* ============================================================
 * Tools data
 *
 * NOTE: Bilingual content kept inline for simplicity. For further
 * bundle-size optimization, this could be split into TOOLS_FR /
 * TOOLS_EN and dynamically imported based on the active `lang`.
 * ============================================================ */

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

/* ============================================================
 * Pre-computed derived data (module-level, not re-created per render)
 * ============================================================ */

const NEW_TOOLS = TOOLS.filter((tool) =>
  ["New", "Trending", "Open Source"].includes(tool.badge ?? ""),
).slice(0, 9);

const TOOL_COUNT = TOOLS.length;
const AVG_RATING =
  Math.round((TOOLS.reduce((sum, t) => sum + t.rating, 0) / TOOL_COUNT) * 10) / 10;

/* ============================================================
 * i18n copy
 * ============================================================ */

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
    skipLink: "Aller au contenu",
    badge: "AI Finder gratuit · sans compte",
    h1a: "Trouvez l’outil",
    h1b: "IA parfait",
    h1c: "pour votre besoin.",
    heroSub:
      "Répondez à 4 questions. Neuriflux analyse votre usage, votre budget, votre niveau et votre priorité pour recommander les meilleurs outils IA 2026 — sans bullshit.",
    heroSeoExtra:
      "Comparez ChatGPT, Claude, Gemini, Midjourney, Runway, n8n, Make, Cursor, ElevenLabs et plus de 50 outils IA en quelques secondes.",
    heroCta: "Lancer le finder",
    secondaryCta: "Voir les comparatifs",
    proof1: "Sans compte",
    proof2: "Résultat instantané",
    proof3: "Méthode transparente",
    proofs: ["Sans compte", "Résultat instantané", "Méthode transparente"],
    progress: "Progression",
    back: "Retour",
    resultTitle: "Vos meilleurs outils IA",
    resultSub:
      "Classement personnalisé selon votre profil, avec score, limites concrètes et alternatives sérieuses.",
    restart: "Recommencer",
    restartConfirm: "Vraiment recommencer ? Vos réponses seront effacées.",
    shareLink: "Partager ce résultat",
    linkCopied: "Lien copié !",
    bestMatch: "Meilleur choix",
    alternatives: "Alternatives recommandées",
    why: "Pourquoi ce choix",
    limits: "À savoir",
    visit: "Visiter l’outil",
    review: "Lire l’avis",
    liveRanking: "Classement en direct",
    match: "compatibilité",
    rating: "Note Neuriflux",
    toolsAnalyzed: "outils analysés",
    newToolsTitle: "Nouveautés & tendances",
    newToolsSub:
      "Des outils récents, populaires ou en forte croissance à surveiller selon votre profil.",
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
    categories: [
      "Outils IA de rédaction",
      "Meilleurs outils IA pour le SEO",
      "Générateurs vidéo IA",
      "Générateurs image & design IA",
      "Assistants IA pour le code",
      "Outils d’automatisation IA",
      "Générateurs voix & musique IA",
      "Créateurs de présentations IA",
      "IA locale / workflows open source",
    ],
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
    scoreParts: {
      goal: "Usage",
      budget: "Budget",
      level: "Niveau",
      priority: "Priorité",
      authority: "Signal",
    },
    finderHeading: "Trouver mon outil IA",
    previewLabel: "AI Finder",
    previewTools: "outils IA",
    previewProfile: "Profil",
    previewExample: "SEO + Recherche",
    previewExtra: "Sans compte · résultat instantané",
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
      {
        q: "Mes réponses sont-elles enregistrées ?",
        a: "Oui, localement dans votre navigateur (pas envoyées à un serveur) pour que vous puissiez revenir sur vos résultats. Vous pouvez tout effacer avec le bouton « Recommencer ».",
      },
      {
        q: "À quelle fréquence la liste est-elle mise à jour ?",
        a: "Nous mettons la liste à jour à chaque sortie majeure d’un outil et au minimum chaque trimestre. Dernière mise à jour : avril 2026.",
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
    skipLink: "Skip to content",
    badge: "Free AI Finder · no account",
    h1a: "Find the",
    h1b: "perfect AI tool",
    h1c: "for your workflow.",
    heroSub:
      "Answer 4 questions. Neuriflux analyzes your use case, budget, skill level and top priority to recommend the best AI tools of 2026 — no bullshit.",
    heroSeoExtra:
      "Compare ChatGPT, Claude, Gemini, Midjourney, Runway, n8n, Make, Cursor, ElevenLabs and 50+ AI tools in seconds.",
    heroCta: "Start the finder",
    secondaryCta: "View comparisons",
    proof1: "No account",
    proof2: "Instant result",
    proof3: "Transparent method",
    proofs: ["No account", "Instant result", "Transparent method"],
    progress: "Progress",
    back: "Back",
    resultTitle: "Your best AI tools",
    resultSub:
      "Personalized ranking based on your profile, with score, real limitations and serious alternatives.",
    restart: "Start over",
    restartConfirm: "Really start over? Your answers will be cleared.",
    shareLink: "Share this result",
    linkCopied: "Link copied!",
    bestMatch: "Best match",
    alternatives: "Recommended alternatives",
    why: "Why this tool",
    limits: "Good to know",
    visit: "Visit tool",
    review: "Read review",
    liveRanking: "Live ranking",
    match: "match",
    rating: "Neuriflux rating",
    toolsAnalyzed: "AI tools analyzed",
    newToolsTitle: "New & trending tools",
    newToolsSub:
      "Recent, popular or fast-growing tools worth watching depending on your profile.",
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
    categories: [
      "AI writing tools",
      "Best AI tools for SEO",
      "AI video generators",
      "AI image & design generators",
      "AI coding assistants",
      "AI automation tools",
      "AI voice & music generators",
      "AI presentation builders",
      "Local AI / open-source workflows",
    ],
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
    scoreParts: {
      goal: "Use case",
      budget: "Budget",
      level: "Level",
      priority: "Priority",
      authority: "Signal",
    },
    finderHeading: "Find my AI tool",
    previewLabel: "AI Finder",
    previewTools: "AI tools",
    previewProfile: "Profile",
    previewExample: "SEO + Research",
    previewExtra: "No account · instant result",
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
      {
        q: "Are my answers stored?",
        a: "Yes, locally in your browser (not sent to a server) so you can come back to your results. You can clear everything with the “Start over” button.",
      },
      {
        q: "How often is the list updated?",
        a: "We update the list on every major tool release and at least every quarter. Last update: April 2026.",
      },
    ],
  },
} as const;


/* ============================================================
 * Step definitions (i18n-aware, strictly typed)
 * ============================================================ */

function getSteps(lang: Lang): Step[] {
  const fr = lang === "fr";

  const goalOptions: ReadonlyArray<StepOption<Goal>> = [
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
  ];

  const budgetOptions: ReadonlyArray<StepOption<Budget>> = [
    ["free", fr ? "Gratuit" : "Free", fr ? "Je veux commencer sans payer." : "I want to start without paying."],
    ["low", "< $20/mo", fr ? "Budget raisonnable pour un outil utile." : "Reasonable budget for a useful tool."],
    ["pro", "Pro", fr ? "Je paie si le gain est réel." : "I pay if the value is clear."],
    ["team", fr ? "Équipe" : "Team", fr ? "Usage sérieux, équipe ou entreprise." : "Serious team or business usage."],
  ];

  const levelOptions: ReadonlyArray<StepOption<Level>> = [
    ["beginner", fr ? "Débutant" : "Beginner", fr ? "Je veux simple et rapide." : "I want simple and fast."],
    ["intermediate", fr ? "Intermédiaire" : "Intermediate", fr ? "Je peux configurer un minimum." : "I can configure a few things."],
    ["advanced", fr ? "Avancé" : "Advanced", fr ? "Je veux contrôle, API, workflows." : "I want control, APIs and workflows."],
  ];

  const priorityOptions: ReadonlyArray<StepOption<Priority>> = [
    ["quality", fr ? "Qualité" : "Quality", fr ? "Je veux les meilleurs résultats." : "I want the best output."],
    ["speed", fr ? "Rapidité" : "Speed", fr ? "Je veux gagner du temps vite." : "I want to save time fast."],
    ["price", fr ? "Prix" : "Price", fr ? "Je veux le meilleur rapport qualité/prix." : "I want the best value."],
    ["creative", fr ? "Créativité" : "Creativity", fr ? "Je veux des idées, visuels ou contenus forts." : "I want strong ideas, visuals or content."],
    ["privacy", fr ? "Confidentialité" : "Privacy", fr ? "Je manipule des données sensibles." : "I handle sensitive data."],
    ["team", fr ? "Collaboration" : "Team", fr ? "Je travaille avec une équipe." : "I work with a team."],
    ["api", "API", fr ? "Je veux intégrer l’IA dans mes outils." : "I want to integrate AI into my tools."],
  ];

  return [
    {
      id: "goal",
      title: fr ? "Quel est votre besoin principal ?" : "What is your main goal?",
      subtitle: fr
        ? "Choisissez le cas d’usage le plus important pour vous."
        : "Choose the use case that matters most to you.",
      options: goalOptions,
    },
    {
      id: "budget",
      title: fr ? "Quel budget voulez-vous mettre ?" : "What is your budget?",
      subtitle: fr ? "Le prix change beaucoup selon les outils." : "Pricing varies a lot between tools.",
      options: budgetOptions,
    },
    {
      id: "level",
      title: fr ? "Quel est votre niveau ?" : "What is your skill level?",
      subtitle: fr
        ? "On évite de vous recommander un outil trop complexe."
        : "We avoid recommending a tool that is too complex.",
      options: levelOptions,
    },
    {
      id: "priority",
      title: fr ? "Votre priorité absolue ?" : "Your top priority?",
      subtitle: fr ? "C’est ce qui départage les outils proches." : "This breaks ties between close recommendations.",
      options: priorityOptions,
    },
  ];
}

/* ============================================================
 * Helpers
 * ============================================================ */

/** Star rating display using full Unicode stars (no fractional glyphs). */
function starRating(rating: number): string {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(Math.max(0, 5 - rounded));
}

function has<T extends string>(value: T | undefined, list: readonly T[]): boolean {
  return Boolean(value && list.includes(value));
}

function getContextualGoalBoost(tool: Tool, goal: Goal | undefined): number {
  if (!goal) return 0;
  return CONTEXTUAL_GOAL_BOOST[goal]?.includes(tool.id) ? SCORE.contextBoost : 0;
}

function getBadgeBoost(badge?: ToolBadge): number {
  return badge ? (BADGE_BOOST[badge] ?? 0) : 0;
}

/** Pure scoring: only depends on `answers`. */
function computeScores(answers: Answers): Array<Omit<ScoredTool, "reasons"> & { _contextBoost: number; _matches: Record<StepId, boolean> }> {
  const answered = (Object.values(answers).filter(Boolean) as string[]).length;

  return TOOLS.map((tool) => {
    const goalMatch = has<Goal>(answers.goal, tool.goals);
    const budgetMatch = has<Budget>(answers.budget, tool.budgets);
    const levelMatch = has<Level>(answers.level, tool.levels);
    const priorityMatch = has<Priority>(answers.priority, tool.priorities);

    const goalScore = !answers.goal ? 0 : goalMatch ? SCORE.goalHit : SCORE.goalMiss;
    const budgetScore = !answers.budget ? 0 : budgetMatch ? SCORE.budgetHit : SCORE.budgetMiss;
    const levelScore = !answers.level ? 0 : levelMatch ? SCORE.levelHit : SCORE.levelMiss;
    const priorityScore = !answers.priority ? 0 : priorityMatch ? SCORE.priorityHit : SCORE.priorityMiss;

    const contextBoost = getContextualGoalBoost(tool, answers.goal);
    const badgeBoost = getBadgeBoost(tool.badge);
    const ratingBoost = Math.round((tool.rating - 4) * SCORE.ratingFactor);
    const authorityScore = contextBoost + badgeBoost + ratingBoost;

    const base = answered === 0 ? SCORE.baseUnanswered + Math.round(tool.rating * SCORE.ratingFactor) + badgeBoost : SCORE.baseAnswered;
    const rawScore = base + goalScore + budgetScore + levelScore + priorityScore + authorityScore;
    const score = Math.max(SCORE.min, Math.min(SCORE.max, rawScore));

    return {
      ...tool,
      score,
      confidence: Math.max(54, Math.min(98, Math.round(score - 3 + answered * 2))),
      semanticTags: getToolTags(tool),
      breakdown: {
        goal: Math.max(0, goalScore + contextBoost),
        budget: Math.max(0, budgetScore),
        level: Math.max(0, levelScore),
        priority: Math.max(0, priorityScore),
        authority: Math.max(0, badgeBoost + ratingBoost),
      },
      _contextBoost: contextBoost,
      _matches: { goal: goalMatch, budget: budgetMatch, level: levelMatch, priority: priorityMatch },
    };
  }).sort((a, b) => b.score - a.score || b.rating - a.rating || a.name.localeCompare(b.name));
}

/** Adds localized `reasons` (depends only on `lang`). */
function attachReasons(
  scored: ReturnType<typeof computeScores>,
  lang: Lang,
): ScoredTool[] {
  return scored.map((tool) => {
    const reasons: string[] = [];

    if (tool._matches.goal)
      reasons.push(lang === "fr" ? "Correspond à votre usage principal" : "Matches your main use case");
    if (tool._matches.budget)
      reasons.push(lang === "fr" ? "Compatible avec votre budget" : "Fits your budget");
    if (tool._matches.level)
      reasons.push(lang === "fr" ? "Adapté à votre niveau" : "Fits your skill level");
    if (tool._matches.priority)
      reasons.push(lang === "fr" ? "Aligné avec votre priorité" : "Matches your top priority");
    if (tool._contextBoost > 0)
      reasons.push(lang === "fr" ? "Très spécialisé pour ce cas d’usage" : "Highly specialized for this use case");

    const finalReasons = reasons.length
      ? reasons.slice(0, 5)
      : [lang === "fr" ? "Bon outil généraliste à comparer" : "Good general tool to compare"];

    // Strip internal helpers before returning the public-facing ScoredTool.
    const { _contextBoost, _matches, ...publicTool } = tool;
    void _contextBoost;
    void _matches;
    return { ...publicTool, reasons: finalReasons };
  });
}

/** Safely escape `</script>` sequences in JSON-LD payloads. */
function safeJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/** Validate an `Answers` object loaded from URL or localStorage. */
function isAnswerKey<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

const ALL_GOALS: readonly Goal[] = [
  "writing", "seo", "video", "image", "coding", "research", "automation",
  "business", "social", "audio", "presentation", "avatar", "local", "agents",
];
const ALL_BUDGETS: readonly Budget[] = ["free", "low", "pro", "team"];
const ALL_LEVELS: readonly Level[] = ["beginner", "intermediate", "advanced"];
const ALL_PRIORITIES: readonly Priority[] = [
  "quality", "speed", "price", "creative", "privacy", "team", "api",
];

function sanitizeAnswers(raw: Partial<Record<StepId, unknown>>): Answers {
  const next: Answers = {};
  if (isAnswerKey(raw.goal, ALL_GOALS)) next.goal = raw.goal;
  if (isAnswerKey(raw.budget, ALL_BUDGETS)) next.budget = raw.budget;
  if (isAnswerKey(raw.level, ALL_LEVELS)) next.level = raw.level;
  if (isAnswerKey(raw.priority, ALL_PRIORITIES)) next.priority = raw.priority;
  return next;
}


/* ============================================================
 * Sub-components
 * ============================================================ */

function ToolLogo({ tool }: { tool: Tool }) {
  const [index, setIndex] = useState(0);
  const src = tool.logos[index];

  return (
    <div className="tool-logo" style={{ "--accent": tool.accent } as CSSVars}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={28}
          height={28}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setIndex((value) => value + 1)}
        />
      ) : (
        <span aria-hidden="true">{tool.fallback}</span>
      )}
    </div>
  );
}

function Badge({ value, accent }: { value?: ToolBadge; accent: string }) {
  if (!value) return null;
  return (
    <span className="tool-badge" style={{ "--accent": accent } as CSSVars}>
      {value}
    </span>
  );
}


function DisabledReviewButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn btn-s btn-small review-disabled" disabled aria-disabled="true">
      {label}
    </button>
  );
}

function getFreePlan(tool: Tool): boolean {
  return tool.freePlan ?? tool.budgets.includes("free") ?? /free/i.test(tool.price);
}

function getToolTags(tool: Pick<Tool, "tags" | "goals" | "priorities" | "category">): string[] {
  const fromCategory = CATEGORY_TAGS.find(([category]) => tool.category.toLowerCase().includes(category))?.[1] ?? [];
  const fromGoals = tool.goals.flatMap((goal) => GOAL_SEMANTIC_TAGS[goal] ?? []);
  const fromPriorities = tool.priorities.flatMap((priority) => PRIORITY_SEMANTIC_TAGS[priority] ?? []);
  return Array.from(new Set([...(tool.tags ?? []), ...fromCategory, ...fromGoals, ...fromPriorities]))
    .filter(Boolean)
    .slice(0, 8);
}

function getSmartAlternatives(tool: Tool, pool: Tool[] = TOOLS): string[] {
  if (tool.alternatives?.length) return tool.alternatives.slice(0, 4);
  return pool
    .filter((candidate) => candidate.id !== tool.id && candidate.category === tool.category)
    .slice(0, 4)
    .map((candidate) => candidate.name);
}

function ToolInsightRow({ tool, lang }: { tool: ScoredTool; lang: Lang }) {
  const tags = tool.semanticTags.slice(0, 6);
  const alternatives = getSmartAlternatives(tool).slice(0, 4);
  return (
    <div className="tool-insights" aria-label={lang === "fr" ? "Informations rapides" : "Quick insights"}>
      <div className="tool-badges-row">
        <span>{lang === "fr" ? "Score IA" : "AI score"}: {tool.score}/100</span>
        <span>{getFreePlan(tool) ? (lang === "fr" ? "Plan gratuit" : "Free plan") : (lang === "fr" ? "Payant" : "Paid")}</span>
        {tool.apiAvailable || tool.priorities.includes("api") ? <span>API</span> : null}
        {tool.setupMinutes ? <span>{tool.setupMinutes} min setup</span> : null}
      </div>
      {tags.length ? (
        <div className="tag-cloud" aria-label={lang === "fr" ? "Tags d’usage" : "Use case tags"}>
          {tags.map((tag) => <span key={`${tool.id}-${tag}`}>#{tag}</span>)}
        </div>
      ) : null}
      {alternatives.length ? (
        <p className="alt-line">
          <strong>{lang === "fr" ? "Alternatives" : "Alternatives"}:</strong> {alternatives.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function ComparisonTable({ tools, lang }: { tools: ScoredTool[]; lang: Lang }) {
  return (
    <section className="comparison-table" aria-labelledby="comparison-table-heading">
      <div className="section-head compact">
        <div>
          <div className="stag">{lang === "fr" ? "Comparatif rapide" : "Quick comparison"}</div>
          <h2 id="comparison-table-heading" className="stitle">
            {lang === "fr" ? "Résumé des meilleurs résultats" : "Top results summary"}
          </h2>
          <p className="ssub">
            {lang === "fr"
              ? "Une vue lisible pour comparer prix, usage, API et alternatives sans quitter la page."
              : "A readable view to compare price, use case, API and alternatives without leaving the page."}
          </p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{lang === "fr" ? "Outil" : "Tool"}</th>
              <th>{lang === "fr" ? "Score" : "Score"}</th>
              <th>{lang === "fr" ? "Plan gratuit" : "Free plan"}</th>
              <th>API</th>
              <th>{lang === "fr" ? "Idéal pour" : "Best for"}</th>
            </tr>
          </thead>
          <tbody>
            {tools.slice(0, 8).map((tool) => (
              <tr key={`table-${tool.id}`}>
                <td><strong>{tool.name}</strong><span>{tool.category}</span></td>
                <td>{tool.score}/100</td>
                <td>{getFreePlan(tool) ? "Yes" : "No"}</td>
                <td>{tool.apiAvailable || tool.priorities.includes("api") ? "Yes" : "—"}</td>
                <td>{tool.bestFor[lang].slice(0, 2).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PopularSearches({ lang }: { lang: Lang }) {
  const searches = lang === "fr"
    ? [
        ["/ai-tools-for-seo", "Outils IA pour SEO"],
        ["/ai-video-tools", "Outils IA vidéo"],
        ["/free-ai-tools", "Outils IA gratuits"],
        ["/ai-tools-for-developers", "IA pour développeurs"],
        ["/ai-tools-for-students", "Outils IA pour étudiants"],
        ["/local-ai-tools", "IA locale et privée"],
      ]
    : [
        ["/ai-tools-for-seo", "AI tools for SEO"],
        ["/ai-video-tools", "AI video tools"],
        ["/free-ai-tools", "Free AI tools"],
        ["/ai-tools-for-developers", "AI tools for developers"],
        ["/ai-tools-for-students", "AI tools for students"],
        ["/local-ai-tools", "Local and private AI"],
      ];

  return (
    <section className="popular-searches" aria-labelledby="popular-searches-heading">
      <div className="stag">{lang === "fr" ? "Recherches populaires" : "Popular searches"}</div>
      <h2 id="popular-searches-heading" className="stitle">
        {lang === "fr" ? "Pages IA à fort potentiel SEO" : "High-intent AI pages"}
      </h2>
      <p className="ssub">
        {lang === "fr"
          ? "Ces liens créent du maillage interne vers les intentions longues traînes les plus recherchées."
          : "These links build internal relevance around high-intent long-tail searches."}
      </p>
      <div className="search-pill-grid">
        {searches.map(([href, label]) => (
          <Link key={href} href={href} className="search-pill">
            {label} →
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
 * Main component
 * ============================================================ */

export default function AiFinderClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawMenuId = useId();
  const menuId = `menu-${rawMenuId.replace(/:/g, "")}`;

  // Defensive fallback so an invalid `lang` prop doesn't crash the page.
  const t = COPY[lang] ?? COPY.en;
  const steps = useMemo(() => getSteps(lang), [lang]);

  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const questionTitleRef = useRef<HTMLHeadingElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);

  /* --------- Two-stage memo: scoring is lang-independent --------- */
  const rawScored = useMemo(() => computeScores(answers), [answers]);
  const results = useMemo(() => attachReasons(rawScored, lang), [rawScored, lang]);

  const answeredCount = useMemo(
    () => (Object.values(answers).filter(Boolean) as string[]).length,
    [answers],
  );
  const finished = answeredCount === steps.length;
  const progress = Math.round((answeredCount / steps.length) * 100);
  const current = steps[stepIndex];
  const winner = results[0];

  const l = useCallback((p = "") => `/${lang}${p}`, [lang]);

  const closeMobileMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  /* --------- Hydrate from URL / localStorage on first mount --------- */
  useEffect(() => {
    let initial: Answers = {};

    // 1) Try URL params (shareable links).
    const fromUrl: Partial<Record<StepId, unknown>> = {
      goal: searchParams.get("goal") ?? undefined,
      budget: searchParams.get("budget") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
    };
    const urlSan = sanitizeAnswers(fromUrl);

    if (Object.keys(urlSan).length > 0) {
      initial = urlSan;
    } else {
      // 2) Fallback to localStorage if recent enough.
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { ts?: number; answers?: Partial<Record<StepId, unknown>> };
          if (parsed.ts && Date.now() - parsed.ts < STORAGE_TTL_MS && parsed.answers) {
            initial = sanitizeAnswers(parsed.answers);
          }
        }
      } catch {
        /* ignore corrupt storage */
      }
    }

    if (Object.keys(initial).length > 0) {
      setAnswers(initial);
      // Jump to first unanswered step (or stay at end if all answered).
      const order: StepId[] = ["goal", "budget", "level", "priority"];
      const firstMissing = order.findIndex((k) => !initial[k]);
      setStepIndex(firstMissing === -1 ? order.length - 1 : firstMissing);
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------- Persist answers to localStorage --------- */
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), answers }),
      );
    } catch {
      /* storage may be unavailable (private mode, quota) */
    }
  }, [answers, hydrated]);

  /* --------- Scroll listener for sticky nav shadow --------- */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* --------- Close mobile menu on route change --------- */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* --------- Mobile menu: scroll lock, Escape, focus trap --------- */
  useEffect(() => {
    if (!menuOpen) return;

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onEscape);

    // Move focus into the menu for keyboard users.
    const focusTimer = window.setTimeout(() => {
      firstMenuLinkRef.current?.focus();
    }, 30);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onEscape);
      window.clearTimeout(focusTimer);
    };
  }, [menuOpen]);

  /* --------- Focus management when step changes --------- */
  useEffect(() => {
    if (finished) return;
    // Move focus to the question heading so screen-reader users hear the new question.
    questionTitleRef.current?.focus();
  }, [stepIndex, finished]);

  /* --------- Handlers --------- */

  const switchLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      trackEvent("ai_finder_language_switch", { from: lang, to: next });

      // Anchored regex to swap only the leading locale segment.
      const nextPath = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), `/${next}`);
      const finalPath = nextPath.startsWith(`/${next}`) ? nextPath : `/${next}/aifinder`;
      router.push(finalPath);
    },
    [lang, pathname, router],
  );

  const select = useCallback(
    (key: Goal | Budget | Level | Priority) => {
      if (!current) return;
      const id = current.id;
      const next: Answers = { ...answers, [id]: key };

      setAnswers(next);

      trackEvent("ai_finder_answer", {
        step: id,
        value: key,
        lang,
        progress: Math.round(((Object.values(next).filter(Boolean) as string[]).length / steps.length) * 100),
      });

      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      }
    },
    [answers, current, lang, stepIndex, steps.length],
  );

  const restart = useCallback(() => {
    if (typeof window !== "undefined" && answeredCount > 0) {
      // Light confirmation to prevent accidental loss.
      if (!window.confirm(t.restartConfirm)) return;
    }
    setAnswers({});
    setStepIndex(0);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    trackEvent("ai_finder_restart", { lang });
  }, [answeredCount, lang, t.restartConfirm]);

  const goBack = useCallback(() => {
    setStepIndex((value) => Math.max(0, value - 1));
    if (current) trackEvent("ai_finder_back", { lang, from_step: current.id });
  }, [current, lang]);

  const shareResult = useCallback(async () => {
    const params = new URLSearchParams();
    (Object.keys(answers) as StepId[]).forEach((k) => {
      const v = answers[k];
      if (v) params.set(k, v);
    });

    const url = `${SITE_URL}/${lang}/aifinder?${params.toString()}`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* clipboard may be unavailable */
    }

    trackEvent("ai_finder_share", { lang, ...answers });
  }, [answers, lang]);

  const makeAffiliateClick = useCallback(
    (toolId: string, toolName: string, score: number, position: number) => () => {
      trackEvent("ai_finder_affiliate_click", {
        tool: toolId,
        tool_name: toolName,
        score,
        lang,
        position,
      });
    },
    [lang],
  );

  /* --------- JSON-LD schemas (memoized) --------- */

  const pageUrl = `${SITE_URL}/${lang}/aifinder`;

  const schema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${pageUrl}#webapp`,
      name: "Neuriflux AI Finder",
      url: pageUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      inLanguage: lang === "fr" ? "fr-FR" : "en-US",
      description:
        lang === "fr"
          ? "Outil interactif gratuit pour trouver le meilleur outil IA selon votre besoin, votre budget et votre niveau. Plus de 30 outils IA analysés."
          : "Free interactive tool to find the best AI tool for your needs, budget and skill level. Over 30 AI tools analyzed.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: AVG_RATING,
        bestRating: 5,
        worstRating: 1,
        ratingCount: TOOL_COUNT,
      },
      publisher: {
        "@type": "Organization",
        name: "Neuriflux",
        url: SITE_URL,
      },
    }),
    [lang, pageUrl],
  );

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
    [t.faqs],
  );

  const howToSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: lang === "fr" ? "Comment trouver le bon outil IA" : "How to find the right AI tool",
      description:
        lang === "fr"
          ? "Quatre questions rapides pour identifier l'outil IA le mieux adapté à votre besoin."
          : "Four quick questions to identify the AI tool that best fits your needs.",
      totalTime: "PT1M",
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.subtitle,
      })),
    }),
    [lang, steps],
  );

  const itemListSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: lang === "fr" ? "Outils IA recommandés par Neuriflux" : "AI tools recommended by Neuriflux",
      numberOfItems: TOOL_COUNT,
      itemListElement: TOOLS.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: tool.affiliate,
      })),
    }),
    [lang],
  );

  const breadcrumbSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Neuriflux", item: `${SITE_URL}/${lang}` },
        { "@type": "ListItem", position: 2, name: "AI Finder", item: pageUrl },
      ],
    }),
    [lang, pageUrl],
  );


  /* --------- Render --------- */

  return (
    <>
      <Script
        id="ai-finder-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: safeJson(schema) }}
      />
      <Script
        id="ai-finder-faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }}
      />
      <Script
        id="ai-finder-howto-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: safeJson(howToSchema) }}
      />
      <Script
        id="ai-finder-itemlist-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }}
      />
      <Script
        id="ai-finder-breadcrumb-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }}
      />

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        :root { --bg: #080c10; --bg2: #0d1117; --bg3: #111820; --bg4: #151e29; --border: rgba(255,255,255,.065); --glow: rgba(0,230,190,.2); --cyan: #00e6be; --cdim: rgba(0,230,190,.09); --text: #edf2f7; --muted: #7a8a9a; --dim: #405164; --d: 'Syne', sans-serif; --m: 'JetBrains Mono', monospace; --r: 14px; --pad: clamp(1.25rem, 5vw, 4rem); }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--d); -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        .sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }
        .skip-link { position: absolute; left: 12px; top: -100px; z-index: 500; background: var(--cyan); color: #071018; padding: 10px 14px; border-radius: 8px; font-family: var(--m); font-size: .72rem; font-weight: 700; text-decoration: none; transition: top .2s; }
        .skip-link:focus { top: 12px; }

        .bg-grid { position: fixed; inset: 0; background-image: linear-gradient(rgba(0,230,190,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,190,.018) 1px, transparent 1px); background-size: 72px 72px; pointer-events: none; z-index: 0; }
        .bg-glow { position: fixed; top: -20%; left: 50%; transform: translateX(-50%); width: min(900px, 92vw); height: 560px; background: radial-gradient(ellipse, rgba(0,230,190,.06) 0%, transparent 68%); pointer-events: none; z-index: 0; }

        .site-nav { position: sticky; top: 0; z-index: 200; backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); background: rgba(8,12,16,.9); border-bottom: 1px solid var(--border); padding: 0 var(--pad); height: 64px; display: flex; align-items: center; justify-content: space-between; transition: box-shadow .25s, background .25s; }
        .site-nav.scrolled { box-shadow: 0 8px 32px rgba(0,0,0,.42); background: rgba(8,12,16,.97); }
        .logo { font-family: var(--d); font-weight: 800; font-size: 1.15rem; letter-spacing: -.03em; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: .45rem; }
        .logo em { color: var(--cyan); font-style: normal; }
        .logo-dot { width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; box-shadow: 0 0 8px var(--cyan); animation: blink 2s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }

        .nav-links { display: flex; align-items: center; gap: 1.75rem; list-style: none; padding: 0; margin: 0; }
        .nav-links a { font-family: var(--m); font-size: .74rem; color: var(--muted); text-decoration: none; letter-spacing: .03em; transition: color .15s; }
        .nav-links a:hover, .nav-links a.active { color: var(--cyan); }
        .nav-links a.nav-ai { color: var(--cyan); font-weight: 700; }

        .nav-right { display: flex; align-items: center; gap: .65rem; }
        .lt { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 3px; display: flex; gap: 2px; }
        .lb { font-family: var(--m); font-size: .67rem; font-weight: 600; padding: 4px 9px; border-radius: 6px; border: none; cursor: pointer; background: transparent; color: var(--muted); transition: all .15s; }
        .lb.on { background: var(--cyan); color: #080c10; }
        .hb { display: none; flex-direction: column; gap: 4px; cursor: pointer; padding: 6px; background: none; border: none; }
        .hb span { display: block; width: 18px; height: 1.5px; background: var(--muted); border-radius: 2px; }

        @media (max-width: 720px) {
          .nav-links { display: none; }
          .nav-links.open { display: flex; flex-direction: column; align-items: flex-start; position: fixed; top: 64px; left: 0; right: 0; background: rgba(13,17,23,.98); border-bottom: 1px solid var(--border); padding: 1.2rem var(--pad) 1.4rem; gap: 1rem; z-index: 99; }
          .hb { display: flex; }
        }

        .page { min-height: 100vh; position: relative; }
        .hero { position: relative; z-index: 1; max-width: 1160px; margin: 0 auto; padding: clamp(3.5rem, 8vw, 6rem) var(--pad) clamp(2rem, 4vw, 3rem); display: flex; flex-direction: column; align-items: center; text-align: center; }
        .hero-wrap { max-width: 840px; width: 100%; display: flex; flex-direction: column; align-items: center; }

        .breadcrumbs { display: flex; gap: .4rem; align-items: center; font-family: var(--m); font-size: .62rem; color: var(--dim); margin-bottom: 1rem; letter-spacing: .05em; }
        .breadcrumbs a { color: var(--muted); text-decoration: none; transition: color .15s; }
        .breadcrumbs a:hover { color: var(--cyan); }
        .breadcrumbs .sep { color: var(--dim); }

        .hbadge { display: inline-flex; align-items: center; gap: .45rem; font-family: var(--m); font-size: .67rem; letter-spacing: .07em; color: var(--cyan); background: var(--cdim); border: 1px solid var(--glow); border-radius: 100px; padding: 6px 14px; margin-bottom: 1.35rem; }
        .hbadge .pulse { width: 5px; height: 5px; background: var(--cyan); border-radius: 50%; animation: blink 2s infinite; }

        h1 { font-size: clamp(2.15rem, 5.6vw, 4.1rem); font-weight: 800; line-height: 1.04; letter-spacing: -.045em; margin-bottom: .75rem; color: var(--text); }
        h1 em { color: var(--cyan); font-style: normal; position: relative; }
        h1 em::after { content: ''; position: absolute; bottom: 2px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--cyan), transparent); opacity: .45; border-radius: 2px; }

        .hero-sub { font-family: var(--m); font-size: .86rem; font-weight: 300; color: var(--muted); line-height: 1.85; max-width: 680px; margin-bottom: 1rem; text-align: center; }
        .hero-fresh { font-family: var(--m); font-size: .65rem; color: var(--dim); letter-spacing: .06em; margin-bottom: .85rem; }
        .ctas { display: flex; gap: .7rem; flex-wrap: wrap; margin-bottom: 1.2rem; justify-content: center; }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: .4rem; font-family: var(--d); font-weight: 700; font-size: .84rem; padding: 12px 22px; border-radius: 10px; text-decoration: none; transition: all .2s; letter-spacing: -.01em; border: none; cursor: pointer; }
        .btn-p { background: var(--cyan); color: var(--bg); }
        .btn-p:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,230,190,.26); }
        .btn-p:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-s { background: transparent; color: var(--text); border: 1px solid var(--border); }
        .btn-s:hover { border-color: var(--glow); background: var(--cdim); color: var(--cyan); }
        .btn-small { font-size: .72rem; padding: 9px 13px; border-radius: 8px; }

        .review-disabled,
        .review-disabled:hover,
        .review-disabled:disabled { opacity: .55; cursor: not-allowed; pointer-events: none; filter: grayscale(.15); border-color: rgba(255,255,255,.08); background: rgba(255,255,255,.04); color: rgba(255,255,255,.55); transform: none; box-shadow: none; }
        .tool-insights { margin-top: .75rem; display: grid; gap: .55rem; }
        .tool-badges-row { display: flex; flex-wrap: wrap; gap: .42rem; }
        .tool-badges-row span { font-family: var(--m); font-size: .61rem; font-weight: 700; color: var(--cyan); background: rgba(0,230,190,.07); border: 1px solid rgba(0,230,190,.13); border-radius: 999px; padding: 5px 9px; }
        .tag-cloud { display: flex; flex-wrap: wrap; gap: .38rem; }
        .tag-cloud span { font-family: var(--m); font-size: .58rem; color: var(--muted); background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.07); border-radius: 999px; padding: 4px 8px; }
        .alt-line { margin: 0; font-family: var(--m); font-size: .68rem; color: var(--muted); line-height: 1.65; }
        .alt-line strong { color: var(--text); }
        .comparison-table, .popular-searches { margin-top: 1.2rem; background: rgba(255,255,255,.025); border: 1px solid var(--border); border-radius: 18px; padding: clamp(1rem, 2vw, 1.4rem); }
        .section-head.compact { margin-bottom: .9rem; }
        .table-wrap { overflow-x: auto; border: 1px solid rgba(255,255,255,.06); border-radius: 14px; }
        table { width: 100%; border-collapse: collapse; min-width: 680px; }
        th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,.06); font-family: var(--m); font-size: .72rem; color: var(--muted); }
        th { color: var(--text); background: rgba(255,255,255,.035); font-weight: 800; }
        td strong { display: block; color: var(--text); font-family: var(--d); font-size: .82rem; margin-bottom: 2px; }
        td span { display: block; color: var(--dim); font-size: .63rem; }
        tr:last-child td { border-bottom: 0; }
        .search-pill-grid { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1rem; }
        .search-pill { display: inline-flex; align-items: center; border: 1px solid rgba(0,230,190,.14); background: rgba(0,230,190,.055); color: var(--cyan); text-decoration: none; border-radius: 999px; padding: 9px 13px; font-family: var(--m); font-size: .68rem; font-weight: 700; transition: transform .18s, background .18s; }
        .search-pill:hover { transform: translateY(-1px); background: rgba(0,230,190,.09); }


        .proof { display: flex; flex-wrap: wrap; gap: .55rem; justify-content: center; margin-bottom: 1.5rem; }
        .proof span { font-family: var(--m); font-size: .68rem; color: var(--cyan); background: rgba(0,230,190,.06); border: 1px solid rgba(0,230,190,.12); padding: 6px 12px; border-radius: 999px; }

        .section { position: relative; z-index: 1; max-width: 1160px; margin: 0 auto; padding: clamp(2rem, 4vw, 3rem) var(--pad); }
        .stag { font-family: var(--m); font-size: .62rem; letter-spacing: .14em; text-transform: uppercase; color: var(--cyan); margin-bottom: .45rem; display: flex; align-items: center; gap: .4rem; }
        .stag::before { content: ''; width: 14px; height: 1px; background: var(--cyan); display: inline-block; }
        .stitle { font-size: clamp(1.2rem, 2.6vw, 1.62rem); font-weight: 800; letter-spacing: -.03em; line-height: 1.1; color: var(--text); }
        .ssub { font-family: var(--m); font-size: .72rem; color: var(--muted); font-weight: 300; margin-top: .35rem; letter-spacing: .02em; line-height: 1.7; max-width: 580px; }

        /* Finder layout */
        .finder-grid { display: grid; grid-template-columns: 1.35fr .65fr; gap: 1.2rem; align-items: flex-start; }
        @media (max-width: 980px) { .finder-grid { grid-template-columns: 1fr; } }
        .panel { border: 1px solid var(--border); background: var(--bg2); border-radius: 16px; padding: clamp(1.25rem, 3vw, 1.8rem); }
        .panel.sticky { position: sticky; top: 84px; }
        @media (max-width: 980px) { .panel.sticky { position: relative; top: auto; } }

        .question h2 { font-size: clamp(1.4rem, 3vw, 2rem); letter-spacing: -.035em; line-height: 1.15; margin-bottom: .35rem; outline: none; }
        .question p { font-family: var(--m); font-size: .76rem; color: var(--muted); margin-bottom: 1.1rem; line-height: 1.7; }
        .topline { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: .8rem; }
        .topline .mono { font-family: var(--m); font-size: .65rem; color: var(--muted); letter-spacing: .06em; }
        .back-btn { background: transparent; color: var(--muted); border: 1px solid var(--border); border-radius: 8px; padding: 5px 11px; font-family: var(--m); font-size: .68rem; cursor: pointer; transition: all .15s; }
        .back-btn:hover:not(:disabled) { color: var(--cyan); border-color: rgba(0,230,190,.24); }
        .back-btn:disabled { opacity: .35; cursor: not-allowed; }
        .bar { position: relative; height: 4px; background: rgba(255,255,255,.06); border-radius: 999px; overflow: hidden; margin-bottom: 1.25rem; }
        .bar i { position: absolute; inset: 0 auto 0 0; width: var(--w); background: linear-gradient(90deg, var(--cyan), #64ffe4); border-radius: 999px; transition: width .35s ease; }

        .opt-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .65rem; }
        @media (max-width: 640px) { .opt-grid { grid-template-columns: 1fr; } }
        .opt { text-align: left; cursor: pointer; border: 1px solid var(--border); background: rgba(255,255,255,.025); border-radius: 12px; padding: .85rem .95rem; transition: all .18s; display: flex; flex-direction: column; gap: .25rem; }
        .opt:hover { border-color: rgba(0,230,190,.32); background: rgba(0,230,190,.04); transform: translateY(-1px); }
        .opt b { font-family: var(--d); font-weight: 700; font-size: .9rem; color: var(--text); letter-spacing: -.01em; }
        .opt small { font-family: var(--m); font-size: .66rem; color: var(--muted); line-height: 1.55; }

        /* Live ranking sidebar */
        .side h2 { font-size: 1rem; letter-spacing: -.02em; margin-bottom: .9rem; }
        .mini { display: flex; align-items: center; justify-content: space-between; gap: .8rem; padding: .7rem .8rem; border: 1px solid var(--border); border-radius: 12px; background: rgba(255,255,255,.022); margin-bottom: .5rem; }
        .mini-left { display: flex; align-items: center; gap: .6rem; flex: 1; min-width: 0; }
        .mini-icon .tool-logo { width: 26px; height: 26px; border-radius: 7px; box-shadow: none; }
        .mini-icon .tool-logo :global(img) { width: 14px; height: 14px; }
        .mini-icon .tool-logo :global(span) { font-size: .55rem; }
        .mini-body { flex: 1; min-width: 0; }
        .mini strong { font-size: .82rem; display: block; }
        .mini-bar { height: 4px; background: rgba(255,255,255,.06); border-radius: 999px; overflow: hidden; margin-top: .35rem; }
        .mini-bar i { display: block; height: 100%; width: var(--score); background: linear-gradient(90deg, var(--cyan), #64ffe4); border-radius: 999px; }
        .mini-score { font-family: var(--m); font-size: .68rem; color: var(--cyan); }

        /* Results */
        .results-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.1rem; }
        .results-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
        .results h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); letter-spacing: -.04em; margin-bottom: .35rem; }
        .results-sub { font-family: var(--m); font-size: .74rem; color: var(--muted); line-height: 1.7; }
        .meta-bar { font-family: var(--m); font-size: .65rem; color: var(--dim); margin-top: .3rem; letter-spacing: .04em; }

        .winner-card { position: relative; margin-bottom: 1rem; padding: 1.35rem; border-radius: 18px; border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); background: radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 40%), linear-gradient(145deg, rgba(255,255,255,.04), rgba(255,255,255,.015)); box-shadow: 0 0 60px color-mix(in srgb, var(--accent) 13%, transparent); }
        .winner-label { display: inline-flex; padding: 5px 10px; border-radius: 999px; background: var(--cyan); color: #06100e; font-family: var(--m); font-weight: 800; font-size: .6rem; letter-spacing: .06em; text-transform: uppercase; margin-bottom: .75rem; }
        .winner-layout { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; flex-wrap: wrap; }
        .tool-identity { display: flex; align-items: flex-start; gap: .9rem; min-width: 0; flex: 1; }
        .tool-logo { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 18%, transparent), rgba(255,255,255,.03)); border: 1px solid color-mix(in srgb, var(--accent) 36%, transparent); box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 16%, transparent); overflow: hidden; }
        .tool-logo :global(img) { width: 26px; height: 26px; object-fit: contain; }
        .tool-logo :global(span) { display: grid; place-items: center; width: 100%; height: 100%; font-weight: 900; color: var(--accent); font-size: .78rem; }
        .winner-meta { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .75rem; }
        .rating-pill, .price-pill { border: 1px solid var(--border); background: rgba(255,255,255,.025); border-radius: 999px; padding: 5px 10px; color: var(--muted); font-family: var(--m); font-size: .64rem; }
        .stars { color: #facc15; letter-spacing: .04em; }
        .score-big { font-family: var(--m); color: var(--cyan); border: 1px solid rgba(0,230,190,.24); border-radius: 14px; padding: .75rem; min-width: 96px; text-align: center; background: rgba(0,230,190,.05); }
        .score-big strong { display: block; font-size: 1.4rem; font-family: var(--m); }
        .score-big span { font-size: .6rem; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
        .tool-badge { display: inline-flex; padding: 4px 8px; border-radius: 999px; font-family: var(--m); font-size: .56rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #06100e; background: var(--accent); box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 22%, transparent); margin-left: .45rem; vertical-align: middle; }

        .breakdown { display: grid; grid-template-columns: repeat(5, 1fr); gap: .45rem; margin-top: .9rem; }
        @media (max-width: 640px) { .breakdown { grid-template-columns: repeat(2, 1fr); } }
        .break-item { border: 1px solid var(--border); border-radius: 10px; padding: .55rem; background: rgba(0,0,0,.12); }
        .break-item small { display: block; color: var(--muted); font-family: var(--m); font-size: .56rem; margin-bottom: .25rem; text-transform: uppercase; letter-spacing: .06em; }
        .break-item strong { font-family: var(--m); font-size: .72rem; color: var(--cyan); }

        .cols { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin-top: .9rem; }
        @media (max-width: 640px) { .cols { grid-template-columns: 1fr; } }
        .box { border: 1px solid var(--border); border-radius: 12px; padding: .8rem; background: rgba(0,0,0,.14); }
        .box b { display: block; font-size: .72rem; margin-bottom: .45rem; color: var(--text); font-family: var(--d); }
        .box ul { list-style: none; display: grid; gap: .34rem; padding: 0; margin: 0; }
        .box li { color: var(--muted); font-family: var(--m); font-size: .66rem; line-height: 1.55; }

        .verdict { margin-top: .9rem; font-family: var(--m); font-size: .76rem; color: var(--text); line-height: 1.75; padding-top: .9rem; border-top: 1px solid var(--border); }
        .card-actions { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: 1rem; }

        /* Alternative cards */
        .alt-card { border: 1px solid var(--border); border-radius: 14px; background: var(--bg2); padding: 1rem; margin-bottom: .85rem; transition: all .18s; }
        .alt-card:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--accent) 35%, transparent); box-shadow: 0 14px 38px rgba(0,0,0,.25); }
        .alt-top { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: .65rem; }
        .alt-card .tag { display: inline-flex; padding: 4px 8px; border-radius: 999px; background: rgba(0,230,190,.08); color: var(--cyan); border: 1px solid rgba(0,230,190,.16); font-family: var(--m); font-size: .58rem; margin-bottom: .45rem; letter-spacing: .06em; text-transform: uppercase; }
        .alt-card h3 { font-size: 1.05rem; letter-spacing: -.02em; margin-bottom: .25rem; line-height: 1.2; }
        .alt-card p { color: var(--muted); font-family: var(--m); font-size: .7rem; line-height: 1.65; }
        .alt-score { font-family: var(--m); color: var(--cyan); font-size: .75rem; border: 1px solid rgba(0,230,190,.22); border-radius: 999px; padding: 5px 10px; white-space: nowrap; }

        .alts-tag { display: inline-flex; padding: 5px 10px; border-radius: 999px; background: rgba(255,255,255,.04); color: var(--muted); border: 1px solid var(--border); font-family: var(--m); font-size: .6rem; margin: 1.25rem 0 .8rem; letter-spacing: .08em; text-transform: uppercase; }

        .brand-disclaimer { margin-top: 1.5rem; font-family: var(--m); font-size: .6rem; color: var(--dim); line-height: 1.7; }
        .copied-toast { display: inline-block; margin-left: .55rem; font-family: var(--m); font-size: .65rem; color: var(--cyan); }

        /* New tools section */
        .new-tools { border: 1px solid var(--border); border-radius: 16px; background: var(--bg2); padding: 1.5rem; margin-top: 2rem; }
        .section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: 1.1rem; flex-wrap: wrap; }
        .new-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .75rem; }
        @media (max-width: 900px) { .new-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .new-grid { grid-template-columns: 1fr; } }
        .new-tool { display: flex; align-items: center; gap: .8rem; border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent); background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 8%, transparent), rgba(255,255,255,.018)); border-radius: 14px; padding: .85rem; transition: all .18s; text-decoration: none; }
        .new-tool:hover { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(0,0,0,.24); }
        .new-tool .tool-logo { width: 36px; height: 36px; border-radius: 11px; }
        .new-tool .tool-logo :global(img) { width: 20px; height: 20px; }
        .new-tool strong { display: block; font-size: .85rem; color: var(--text); }
        .new-tool span { display: block; margin-top: .2rem; color: var(--accent); font-family: var(--m); font-size: .6rem; letter-spacing: .06em; text-transform: uppercase; }

        /* Method / SEO / FAQ / Final CTA */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem; }
        @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
        .method-card, .seo-card { border: 1px solid var(--border); border-radius: 16px; background: var(--bg2); padding: 1.4rem; }
        .method-card strong, .seo-card h2, .seo-card h3, .faq-block h2, .final-cta h2 { letter-spacing: -.03em; margin-bottom: .65rem; display: block; font-family: var(--d); font-weight: 800; }
        .method-card p, .seo-card p, .seo-card li { color: var(--muted); font-family: var(--m); font-size: .74rem; line-height: 1.8; }
        .seo-card ul { list-style: none; display: grid; gap: .5rem; padding: 0; margin: 0; }

        .faq-block { border: 1px solid var(--border); border-radius: 16px; background: var(--bg2); padding: 1.5rem; margin-top: 2rem; }
        .faq-block h2 { font-size: clamp(1.2rem, 2.6vw, 1.6rem); margin-bottom: 1rem; }
        .faq-list { display: flex; flex-direction: column; gap: .55rem; }
        .faq-item { border: 1px solid var(--border); border-radius: 12px; background: rgba(8,12,16,.4); overflow: hidden; transition: border-color .18s; }
        .faq-item[open] { border-color: rgba(0,230,190,.22); }
        .faq-item summary { cursor: pointer; padding: .9rem 1.1rem; font-family: var(--d); font-size: .88rem; font-weight: 700; color: var(--text); list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 1rem; transition: color .15s; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; color: var(--cyan); font-family: var(--m); font-size: 1rem; transition: transform .2s; flex-shrink: 0; }
        .faq-item[open] summary::after { content: '−'; }
        .faq-item summary:hover { color: var(--cyan); }
        .faq-item p { padding: 0 1.1rem 1rem; color: var(--muted); font-family: var(--m); font-size: .74rem; line-height: 1.8; }

        .final-cta { text-align: center; border: 1px solid var(--glow); border-radius: 16px; background: radial-gradient(circle at 50% 0%, rgba(0,230,190,.1), transparent 45%), var(--bg2); padding: 2rem 1.5rem; margin-top: 2rem; }
        .final-cta h2 { font-size: clamp(1.3rem, 2.8vw, 1.75rem); }
        .final-cta p { font-family: var(--m); font-size: .76rem; color: var(--muted); line-height: 1.8; max-width: 580px; margin: 0 auto 1rem; }

        footer { position: relative; z-index: 1; border-top: 1px solid var(--border); padding: 2rem var(--pad); max-width: 1160px; margin: 0 auto; display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; color: var(--dim); font-family: var(--m); font-size: .68rem; }

        button:focus-visible, a:focus-visible, summary:focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; border-radius: 6px; }
        h2:focus-visible { outline: none; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
        }
      `}</style>

      <a href="#main-content" className="skip-link">{t.skipLink}</a>
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <nav className={`site-nav${scrolled ? " scrolled" : ""}`} aria-label={t.menu}>
        <Link
          href={l("")}
          className="logo"
          onClick={() => trackEvent("ai_finder_nav_click", { location: "logo", lang })}
        >
          <span className="logo-dot" aria-hidden="true" />
          Neuri<em>flux</em>
        </Link>

        <ul id={menuId} className={`nav-links${menuOpen ? " open" : ""}`} role="list">
          <li>
            <Link
              ref={firstMenuLinkRef}
              href={l("/aifinder")}
              className="nav-ai active"
              aria-current="page"
              onClick={() => { closeMobileMenu(); trackEvent("ai_finder_nav_click", { location: "nav_aifinder", lang }); }}
            >
              {t.nav.aifinder}
            </Link>
          </li>
          <li><Link href={l("/blog")} onClick={() => { closeMobileMenu(); trackEvent("ai_finder_nav_click", { location: "nav_blog", lang }); }}>{t.nav.blog}</Link></li>
          <li><Link href={l("/comparatifs")} onClick={() => { closeMobileMenu(); trackEvent("ai_finder_nav_click", { location: "nav_comparatifs", lang }); }}>{t.nav.comparatifs}</Link></li>
          <li><Link href={l("/newsletter")} onClick={() => { closeMobileMenu(); trackEvent("ai_finder_nav_click", { location: "nav_newsletter", lang }); }}>{t.nav.newsletter}</Link></li>
          <li><Link href={l("/contact")} onClick={() => { closeMobileMenu(); trackEvent("ai_finder_nav_click", { location: "nav_contact", lang }); }}>{t.nav.contact}</Link></li>
          <li><Link href={l("/about")} onClick={() => { closeMobileMenu(); trackEvent("ai_finder_nav_click", { location: "nav_about", lang }); }}>{t.nav.about}</Link></li>
        </ul>

        <div className="nav-right">
          <div className="lt" role="group" aria-label={t.langSwitch}>
            <button
              type="button"
              className={`lb${lang === "fr" ? " on" : ""}`}
              aria-pressed={lang === "fr"}
              onClick={() => switchLang("fr")}
            >
              FR
            </button>
            <button
              type="button"
              className={`lb${lang === "en" ? " on" : ""}`}
              aria-pressed={lang === "en"}
              onClick={() => switchLang("en")}
            >
              EN
            </button>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="hb"
            onClick={() => {
              const next = !menuOpen;
              setMenuOpen(next);
              trackEvent("ai_finder_menu_toggle", { lang, open: next });
            }}
            aria-label={menuOpen ? t.closeMenu : t.menu}
            aria-expanded={menuOpen}
            aria-controls={menuId}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <main id="main-content" className="page" lang={lang}>
        <section className="hero" aria-labelledby="page-h1">
          <div className="hero-wrap">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link href={l("")}>Neuriflux</Link>
              <span className="sep" aria-hidden="true">/</span>
              <span aria-current="page">AI Finder</span>
            </nav>

            <div className="hbadge">
              <span className="pulse" aria-hidden="true" />
              {t.badge}
            </div>

            <h1 id="page-h1">
              {t.h1a} <em>{t.h1b}</em> {t.h1c}
            </h1>

            <div className="hero-fresh">✦ {lang === "fr" ? "Dernière mise à jour : avril 2026" : "Last updated: April 2026"}</div>
            <p className="hero-sub">{t.heroSub}</p>
            <p className="sr-only">{t.heroSeoExtra}</p>

            <div className="ctas">
              <a
                href="#finder"
                className="btn btn-p"
                onClick={() => trackEvent("ai_finder_start_click", { lang })}
              >
                {t.heroCta} →
              </a>
              <Link href={l("/comparatifs")} className="btn btn-s">
                {t.secondaryCta}
              </Link>
            </div>

            <div className="proof" role="list">
              {t.proofs.map((p) => (
                <span key={p} role="listitem">✓ {p}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="finder" className="section" aria-labelledby="finder-heading">
          <div className="stag">{t.finderHeading}</div>
          <h2 id="finder-heading" className="sr-only">{t.finderHeading}</h2>

          <div className="finder-grid">
            <div className="panel">
              {!finished ? (
                <div className="question">
                  <div className="topline">
                    <button
                      type="button"
                      className="back-btn"
                      disabled={stepIndex === 0}
                      onClick={goBack}
                    >
                      ← {t.back}
                    </button>
                    <span className="mono">
                      {t.progress} · {progress}% · {stepIndex + 1}/{steps.length}
                    </span>
                  </div>

                  <div className="bar" style={{ "--w": `${progress}%` } as CSSVars}>
                    <i />
                  </div>

                  {current && (
                    <>
                      <h2 ref={questionTitleRef} tabIndex={-1}>
                        {current.title}
                      </h2>
                      <p>{current.subtitle}</p>

                      <div className="opt-grid">
                        {current.options.map(([key, title, desc]) => (
                          <button
                            key={`${current.id}-${key}`}
                            className="opt"
                            type="button"
                            onClick={() => select(key)}
                            aria-label={`${title} — ${desc}`}
                          >
                            <b>{title}</b>
                            <small>{desc}</small>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="results">
                  <div className="results-head">
                    <div>
                      <div className="stag">{t.bestMatch}</div>
                      <h2>{t.resultTitle}</h2>
                      <p className="results-sub">{t.resultSub}</p>
                      <div className="meta-bar">
                        ✓ {TOOL_COUNT} {t.toolsAnalyzed}
                      </div>
                    </div>

                    <div className="results-actions">
                      <button
                        type="button"
                        className="btn btn-s btn-small"
                        onClick={shareResult}
                      >
                        {copied ? `✓ ${t.linkCopied}` : t.shareLink}
                      </button>
                      <button
                        type="button"
                        className="btn btn-s btn-small"
                        onClick={restart}
                      >
                        {t.restart}
                      </button>
                    </div>
                  </div>

                  {winner && (
                    <article
                      className="winner-card"
                      style={{ "--accent": winner.accent } as CSSVars}
                    >
                      <span className="winner-label">{t.bestMatch}</span>
                      <Badge value={winner.badge} accent={winner.accent} />

                      <div className="winner-layout">
                        <div className="tool-identity">
                          <ToolLogo tool={winner} />
                          <div>
                            <h3>{winner.name}</h3>
                            <p>{winner.desc[lang]}</p>

                            <div className="winner-meta">
                              <span className="rating-pill">
                                <span className="stars" aria-hidden="true">{starRating(winner.rating)}</span>{" "}
                                {winner.rating}/5 · {t.rating}
                              </span>
                              <span className="price-pill">{winner.price}</span>
                            </div>
                            <ToolInsightRow tool={winner} lang={lang} />
                          </div>
                        </div>

                        <div className="score-big" aria-label={`${winner.score}% ${t.match}`}>
                          <strong>{winner.score}%</strong>
                          <span>{t.match}</span>
                        </div>
                      </div>

                      <div className="breakdown" aria-label={t.scoreBreakdown}>
                        <div className="break-item">
                          <small>{t.scoreParts.goal}</small>
                          <strong>+{winner.breakdown.goal}</strong>
                        </div>
                        <div className="break-item">
                          <small>{t.scoreParts.budget}</small>
                          <strong>+{winner.breakdown.budget}</strong>
                        </div>
                        <div className="break-item">
                          <small>{t.scoreParts.level}</small>
                          <strong>+{winner.breakdown.level}</strong>
                        </div>
                        <div className="break-item">
                          <small>{t.scoreParts.priority}</small>
                          <strong>+{winner.breakdown.priority}</strong>
                        </div>
                        <div className="break-item">
                          <small>{t.scoreParts.authority}</small>
                          <strong>+{winner.breakdown.authority}</strong>
                        </div>
                      </div>

                      <div className="cols">
                        <div className="box">
                          <b>{t.why}</b>
                          <ul>
                            {[...winner.reasons, ...winner.bestFor[lang].slice(0, 2)]
                              .slice(0, 5)
                              .map((x, i) => (
                                <li key={`${winner.id}-why-${i}`}>✓ {x}</li>
                              ))}
                          </ul>
                        </div>

                        <div className="box">
                          <b>{t.limits}</b>
                          <ul>
                            {winner.limits[lang].map((x, i) => (
                              <li key={`${winner.id}-lim-${i}`}>• {x}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <p className="verdict">{winner.verdict[lang]}</p>

                      <div className="card-actions">
                        <a
                          href={winner.affiliate}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="btn btn-p btn-small"
                          data-tool-id={winner.id}
                          onClick={makeAffiliateClick(winner.id, winner.name, winner.score, 1)}
                        >
                          {t.visit} →
                        </a>
                        <DisabledReviewButton label={lang === "fr" ? "Avis bientôt disponible" : "Review coming soon"} />
                      </div>
                    </article>
                  )}

                  <div className="alts-tag">{t.alternatives}</div>

                  {results.slice(1, 8).map((tool, index) => (
                    <article
                      key={tool.id}
                      className="alt-card"
                      style={{ "--accent": tool.accent } as CSSVars}
                    >
                      <div className="alt-top">
                        <div className="tool-identity">
                          <ToolLogo tool={tool} />
                          <div>
                            <span className="tag">{tool.category}</span>
                            <Badge value={tool.badge} accent={tool.accent} />
                            <h3>{tool.name}</h3>
                            <p>{tool.short[lang]}</p>
                          </div>
                        </div>
                        <span className="alt-score">{tool.score}%</span>
                      </div>

                      <p>{tool.desc[lang]}</p>

                      <div className="cols">
                        <div className="box">
                          <b>{t.why}</b>
                          <ul>
                            {tool.bestFor[lang].map((x, i) => (
                              <li key={`${tool.id}-why-${i}`}>✓ {x}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="box">
                          <b>{t.limits}</b>
                          <ul>
                            {tool.limits[lang].map((x, i) => (
                              <li key={`${tool.id}-lim-${i}`}>• {x}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="winner-meta">
                        <span className="rating-pill">
                          <span className="stars" aria-hidden="true">{starRating(tool.rating)}</span>{" "}
                          {tool.rating}/5
                        </span>
                        <span className="price-pill">{tool.price}</span>
                      </div>
                      <ToolInsightRow tool={tool} lang={lang} />

                      <div className="card-actions">
                        <a
                          href={tool.affiliate}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="btn btn-p btn-small"
                          data-tool-id={tool.id}
                          onClick={makeAffiliateClick(tool.id, tool.name, tool.score, index + 2)}
                        >
                          {t.visit}
                        </a>
                        <DisabledReviewButton label={lang === "fr" ? "Avis bientôt disponible" : "Review coming soon"} />
                      </div>
                    </article>
                  ))}

                  <p className="brand-disclaimer">{t.brandDisclaimer}</p>
                </div>
              )}
            </div>

            <aside className="panel sticky side" aria-label={t.liveRanking}>
              <h2>{t.liveRanking}</h2>

              {results.slice(0, 9).map((tool) => (
                <div className="mini" key={tool.id}>
                  <div className="mini-left">
                    <div className="mini-icon">
                      <ToolLogo tool={tool} />
                    </div>
                    <div className="mini-body">
                      <strong>{tool.name}</strong>
                      <div
                        className="mini-bar"
                        style={{ "--score": `${tool.score}%` } as CSSVars}
                        aria-label={`${tool.score}%`}
                      >
                        <i />
                      </div>
                    </div>
                  </div>
                  <span className="mini-score">{tool.score}%</span>
                </div>
              ))}
            </aside>
          </div>

          <section className="new-tools" aria-labelledby="new-tools-heading">
            <div className="section-head">
              <div>
                <div className="stag">{t.newToolsTitle}</div>
                <h2 id="new-tools-heading" className="stitle">{t.newToolsTitle}</h2>
                <p className="ssub">{t.newToolsSub}</p>
              </div>
            </div>

            <div className="new-grid">
              {NEW_TOOLS.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.affiliate}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="new-tool"
                  style={{ "--accent": tool.accent } as CSSVars}
                  data-tool-id={tool.id}
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

          <ComparisonTable tools={results} lang={lang} />

          <PopularSearches lang={lang} />

          <div className="two-col">
            <section className="method-card" aria-labelledby="method-heading">
              <strong id="method-heading">{t.methodologyTitle}</strong>
              <p>{t.methodologyText}</p>
            </section>
            <section className="method-card" aria-labelledby="indep-heading">
              <strong id="indep-heading">{t.independenceTitle}</strong>
              <p>{t.independenceText}</p>
            </section>
          </div>

          <div className="two-col">
            <section className="seo-card" aria-labelledby="seo-heading">
              <h2 id="seo-heading">{t.seoTitle}</h2>
              <p>{t.seoText}</p>
            </section>
            <section className="seo-card" aria-labelledby="cat-heading">
              <h3 id="cat-heading">{t.categoriesTitle}</h3>
              <ul>
                {t.categories.map((c) => (
                  <li key={c}>✓ {c}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="faq-block" aria-labelledby="faq-heading">
            <h2 id="faq-heading">{t.faqTitle}</h2>
            <div className="faq-list">
              {t.faqs.map((f) => (
                <details
                  key={f.q}
                  className="faq-item"
                  onToggle={(e) => {
                    if ((e.currentTarget as HTMLDetailsElement).open) {
                      trackEvent("ai_finder_faq_open", { question: f.q, lang });
                    }
                  }}
                >
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="final-cta" aria-labelledby="final-cta-heading">
            <h2 id="final-cta-heading">{t.finalCtaTitle}</h2>
            <p>{t.finalCtaText}</p>
            <Link
              href={l("/comparatifs")}
              className="btn btn-p"
              onClick={() => trackEvent("ai_finder_final_cta_click", { lang })}
            >
              {t.secondaryCta} →
            </Link>
          </section>
        </section>

        <footer>
          <span>© 2026 Neuriflux</span>
          <span>{lang === "fr" ? "Comparatifs IA honnêtes et indépendants." : "Honest, independent AI comparisons."}</span>
        </footer>
      </main>
    </>
  );
}