"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type Lang = "fr" | "en";
type PriceFilter = "all" | "free" | "paid" | "enterprise";
type SortMode = "score" | "trending" | "name";

type Tool = {
  id: string;
  name: string;
  company: string;
  category: string;
  logo: string;
  color: string;
  badge: string;
  price: string;
  score: number;
  trend: number;
  difficulty: "Easy" | "Beginner" | "Intermediate" | "Advanced" | "Expert";
  platforms: string[];
  flags: string[];
  best: string[];
  limits: string[];
  verdict: string;
  useCase: string;
};


type LogoMeta = { src: string; bg: string; mark?: string };
const si = (slug: string, hex = "FFFFFF") => `https://cdn.simpleicons.org/${slug}/${hex}`;
const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const LOGO_META: Record<string, LogoMeta> = {
  gpt5: { src: si("openai"), bg: "#050b0a", mark: "GPT" },
  gpt4o: { src: si("openai"), bg: "#050b0a", mark: "4o" },
  chatgpt: { src: si("openai"), bg: "#050b0a", mark: "GPT" },
  openaiapi: { src: si("openai"), bg: "#050b0a", mark: "API" },
  claude: { src: si("anthropic", "D97757"), bg: "#211713", mark: "Cl" },
  claudeopus: { src: si("anthropic", "D97757"), bg: "#211713", mark: "Op" },
  claudecode: { src: si("anthropic", "D97757"), bg: "#211713", mark: "CC" },
  cursor: { src: si("cursor"), bg: "#050505", mark: "Cu" },
  cline: { src: fav("cline.bot"), bg: "#071426", mark: "CL" },
  kilocode: { src: fav("kilocode.ai"), bg: "#160d27", mark: "KC" },
  copilot: { src: si("github"), bg: "#0d1117", mark: "GH" },
  codexcli: { src: si("openai"), bg: "#050b0a", mark: "CLI" },
  perplexity: { src: si("perplexity", "20B8CD"), bg: "#061b20", mark: "Px" },
  notebooklm: { src: si("googlegemini", "8E75FF"), bg: "#151225", mark: "NL" },
  gemini: { src: si("googlegemini", "8E75FF"), bg: "#151225", mark: "Ge" },
  geminiflash: { src: si("googlegemini", "8E75FF"), bg: "#151225", mark: "Fl" },
  grok: { src: si("x"), bg: "#050505", mark: "xAI" },
  deepseek: { src: si("deepseek", "4D6BFF"), bg: "#10182c", mark: "DS" },
  qwen: { src: fav("qwenlm.github.io"), bg: "#101827", mark: "Qw" },
  metaai: { src: si("meta", "0866FF"), bg: "#061223", mark: "Me" },
  mistral: { src: si("mistralai", "FF7000"), bg: "#241205", mark: "Mi" },
  huggingface: { src: si("huggingface", "FFD21E"), bg: "#211806", mark: "HF" },
  ollama: { src: fav("ollama.com"), bg: "#111827", mark: "Ol" },
  midjourney: { src: si("midjourney"), bg: "#090909", mark: "MJ" },
  flux: { src: fav("blackforestlabs.ai"), bg: "#0d0f19", mark: "Fx" },
  ideogram: { src: fav("ideogram.ai"), bg: "#251018", mark: "Id" },
  leonardo: { src: fav("leonardo.ai"), bg: "#0b1c14", mark: "Le" },
  firefly: { src: si("adobe", "FF0000"), bg: "#220606", mark: "Ad" },
  canva: { src: si("canva", "00C4CC"), bg: "#061e20", mark: "Ca" },
  runway: { src: si("runway"), bg: "#050505", mark: "Ry" },
  veo: { src: si("googlegemini", "8E75FF"), bg: "#151225", mark: "Veo" },
  kling: { src: fav("klingai.com"), bg: "#241008", mark: "Kl" },
  pika: { src: fav("pika.art"), bg: "#23113d", mark: "Pi" },
  luma: { src: fav("lumalabs.ai"), bg: "#061b20", mark: "Lu" },
  elevenlabs: { src: si("elevenlabs"), bg: "#050505", mark: "11" },
  cartesia: { src: fav("cartesia.ai"), bg: "#061b20", mark: "Ct" },
  suno: { src: fav("suno.com"), bg: "#241008", mark: "Su" },
  udio: { src: fav("udio.com"), bg: "#242006", mark: "Ud" },
  heygen: { src: fav("heygen.com"), bg: "#170c2b", mark: "Hy" },
  synthesia: { src: si("synthesia", "3B82F6"), bg: "#071426", mark: "Sy" },
  make: { src: si("make", "6D00CC"), bg: "#190b24", mark: "Mk" },
  zapier: { src: si("zapier", "FF4A00"), bg: "#241006", mark: "Za" },
  n8n: { src: si("n8n", "EA4B71"), bg: "#240b14", mark: "n8" },
  genspark: { src: fav("genspark.ai"), bg: "#0c1726", mark: "Gs" },
  manus: { src: fav("manus.im"), bg: "#111827", mark: "Ms" },
  replit: { src: si("replit", "F26207"), bg: "#241008", mark: "Re" },
  lovable: { src: si("lovable", "FF5A5F"), bg: "#271014", mark: "Lo" },
  bolt: { src: si("stackblitz", "1389FD"), bg: "#071426", mark: "Bo" },
  v0: { src: si("vercel"), bg: "#050505", mark: "v0" },
  gamma: { src: fav("gamma.app"), bg: "#160d27", mark: "Ga" },
  notion: { src: si("notion"), bg: "#050505", mark: "No" },
  jasper: { src: si("jasper", "8A3FFC"), bg: "#1b1230", mark: "Ja" },
  copyai: { src: fav("copy.ai"), bg: "#082018", mark: "Co" },
  semrush: { src: si("semrush", "FF642D"), bg: "#241006", mark: "Se" },
  surfer: { src: fav("surferseo.com"), bg: "#082018", mark: "Su" },
  adobeexpress: { src: si("adobe", "FF0000"), bg: "#220606", mark: "Ax" },
  napkin: { src: fav("napkin.ai"), bg: "#101827", mark: "Np" },
  otter: { src: fav("otter.ai"), bg: "#071426", mark: "Ot" },
  firecrawl: { src: fav("firecrawl.dev"), bg: "#241006", mark: "Fc" },
  gpt: { src: si("openai"), bg: "#050b0a", mark: "GPT" },
  groq: { src: fav("groq.com"), bg: "#1d0b0b", mark: "Gq" },
  cohere: { src: fav("cohere.com"), bg: "#111827", mark: "Co" },
  together: { src: fav("together.ai"), bg: "#101827", mark: "To" },
  replicate: { src: fav("replicate.com"), bg: "#050505", mark: "Rp" },
  fal: { src: fav("fal.ai"), bg: "#050505", mark: "Fa" },
  langchain: { src: fav("langchain.com"), bg: "#071426", mark: "LC" },
  pinecone: { src: fav("pinecone.io"), bg: "#071b18", mark: "Pc" },
  chroma: { src: fav("trychroma.com"), bg: "#111827", mark: "Ch" },
  weaviate: { src: fav("weaviate.io"), bg: "#102018", mark: "We" },
  phind: { src: fav("phind.com"), bg: "#071426", mark: "Ph" },
  poe: { src: fav("poe.com"), bg: "#111827", mark: "Po" },
  you: { src: fav("you.com"), bg: "#061b20", mark: "You" },
  arcsearch: { src: fav("arc.net"), bg: "#160d27", mark: "Arc" },
  devin: { src: fav("cognition.ai"), bg: "#111827", mark: "Dv" },
  augment: { src: fav("augmentcode.com"), bg: "#071426", mark: "Ag" },
  tabnine: { src: fav("tabnine.com"), bg: "#101827", mark: "T9" },
  codewhisperer: { src: si("amazonaws", "FF9900"), bg: "#241806", mark: "AWS" },
  aider: { src: fav("aider.chat"), bg: "#111827", mark: "Ai" },
  continue: { src: fav("continue.dev"), bg: "#071426", mark: "Ct" },
  windsurf: { src: si("codeium", "09B6A2"), bg: "#071c1a", mark: "Ws" },
  crewai: { src: fav("crewai.com"), bg: "#101827", mark: "Cr" },
  zapieragents: { src: si("zapier", "FF4A00"), bg: "#241006", mark: "ZA" },
  perplexitylabs: { src: si("perplexity", "20B8CD"), bg: "#061b20", mark: "Labs" },
  perplexitymax: { src: si("perplexity", "20B8CD"), bg: "#061b20", mark: "Max" },
  googleaio: { src: si("google", "4285F4"), bg: "#071426", mark: "AI" },
  copilot365: { src: si("microsoft", "00A4EF"), bg: "#061b20", mark: "365" },
  granola: { src: fav("granola.ai"), bg: "#211713", mark: "Gr" },
  fireflies: { src: fav("fireflies.ai"), bg: "#241806", mark: "Ff" },
  tlrdv: { src: fav("tldv.io"), bg: "#071426", mark: "tl" },
  descript: { src: fav("descript.com"), bg: "#111827", mark: "De" },
  playht: { src: fav("play.ht"), bg: "#251010", mark: "PH" },
  murf: { src: fav("murf.ai"), bg: "#101827", mark: "Mu" },
  stableaudio: { src: fav("stableaudio.com"), bg: "#111827", mark: "SA" },
  topaz: { src: fav("topazlabs.com"), bg: "#111827", mark: "Tz" },
  krea: { src: fav("krea.ai"), bg: "#160d27", mark: "Kr" },
  magnifi: { src: fav("magnific.ai"), bg: "#160d27", mark: "Mg" },
  vectorizer: { src: fav("vectorizer.ai"), bg: "#071426", mark: "Vz" },
  removebg: { src: fav("remove.bg"), bg: "#071426", mark: "RB" },
  seoai: { src: fav("frase.io"), bg: "#082018", mark: "Fr" },
  ahrefs: { src: si("ahrefs", "FF6B00"), bg: "#241006", mark: "Ah" },
  grammarly: { src: si("grammarly", "15C39A"), bg: "#071b18", mark: "Gy" },
  writesonic: { src: fav("writesonic.com"), bg: "#101827", mark: "Ws" },
  rytr: { src: fav("rytr.me"), bg: "#160d27", mark: "Ry" },
  beautifulai: { src: fav("beautiful.ai"), bg: "#061b20", mark: "Bf" },
  tome: { src: fav("tome.app"), bg: "#160d27", mark: "To" },
  slidesai: { src: fav("slidesai.io"), bg: "#071426", mark: "Sl" },
  scite: { src: fav("scite.ai"), bg: "#071426", mark: "Sc" },
  elicit: { src: fav("elicit.com"), bg: "#071426", mark: "El" },
  consensus: { src: fav("consensus.app"), bg: "#071426", mark: "Cs" },
  wolfram: { src: fav("wolframalpha.com"), bg: "#241006", mark: "Wα" },
  harvey: { src: fav("harvey.ai"), bg: "#111827", mark: "Hv" },
  intercom: { src: si("intercom", "FFFFFF"), bg: "#061b20", mark: "Ic" },
  zendeskai: { src: si("zendesk", "FFFFFF"), bg: "#071b18", mark: "Zd" },
  drift: { src: fav("drift.com"), bg: "#241806", mark: "Dr" },
};

function getLogoMeta(tool: Tool): LogoMeta {
  return LOGO_META[tool.id] ?? { src: tool.logo, bg: "#0d1117", mark: tool.name.slice(0, 2).toUpperCase() };
}

const TOOLS: Tool[] = [
  {
    "id": "gpt5",
    "name": "GPT-5",
    "company": "OpenAI",
    "category": "Chatbots",
    "logo": "https://cdn.simpleicons.org/openai/FFFFFF",
    "color": "#00e6be",
    "badge": "Flagship",
    "price": "Paid / Team / Enterprise",
    "score": 9.8,
    "trend": 98,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "API",
      "Mobile",
      "Desktop"
    ],
    "flags": [
      "API",
      "Multimodal",
      "Agent-ready"
    ],
    "best": [
      "General intelligence",
      "reasoning",
      "writing",
      "coding",
      "business workflows"
    ],
    "limits": [
      "Premium features can be costly",
      "Not open source"
    ],
    "verdict": "The strongest default choice when you need one model that can handle almost everything at a high level.",
    "useCase": "Best all-round AI assistant for professionals, creators and teams."
  },
  {
    "id": "chatgpt",
    "name": "ChatGPT",
    "company": "OpenAI",
    "category": "Chatbots",
    "logo": "https://cdn.simpleicons.org/openai/FFFFFF",
    "color": "#00e6be",
    "badge": "Editor Choice",
    "price": "Free / Plus / Team",
    "score": 9.6,
    "trend": 96,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "iOS",
      "Android",
      "Desktop",
      "API"
    ],
    "flags": [
      "Multimodal",
      "Projects",
      "Voice",
      "API"
    ],
    "best": [
      "daily productivity",
      "writing",
      "analysis",
      "coding",
      "document work"
    ],
    "limits": [
      "Advanced limits vary by plan",
      "Requires careful prompting for complex tasks"
    ],
    "verdict": "The safest recommendation for most users because it combines power, usability and ecosystem depth.",
    "useCase": "Best starting point for almost any AI workflow."
  },
  {
    "id": "claude",
    "name": "Claude",
    "company": "Anthropic",
    "category": "Chatbots",
    "logo": "https://cdn.simpleicons.org/anthropic/D97757",
    "color": "#d97757",
    "badge": "Writing Pick",
    "price": "Free / Pro / Team",
    "score": 9.5,
    "trend": 92,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "API",
      "Mobile"
    ],
    "flags": [
      "Long context",
      "Writing",
      "Reasoning",
      "Team"
    ],
    "best": [
      "long-form writing",
      "analysis",
      "documents",
      "strategy",
      "natural tone"
    ],
    "limits": [
      "Less image/video focused",
      "Some usage limits on heavy workflows"
    ],
    "verdict": "The best pick when tone, nuance and long-context reasoning matter more than flashy features.",
    "useCase": "Best for writers, analysts and professionals who need thoughtful outputs."
  },
  {
    "id": "claudecode",
    "name": "Claude Code",
    "company": "Anthropic",
    "category": "Coding",
    "logo": "https://cdn.simpleicons.org/anthropic/D97757",
    "color": "#d97757",
    "badge": "Dev Power",
    "price": "Paid / Usage based",
    "score": 9.7,
    "trend": 99,
    "difficulty": "Expert",
    "platforms": [
      "CLI",
      "Terminal",
      "API"
    ],
    "flags": [
      "Agent",
      "Codebase",
      "MCP",
      "CLI"
    ],
    "best": [
      "large codebases",
      "agentic coding",
      "refactors",
      "debugging",
      "terminal workflows"
    ],
    "limits": [
      "More technical than editor assistants",
      "Costs can rise with heavy use"
    ],
    "verdict": "A top-tier coding agent for developers who want serious autonomous help inside real projects.",
    "useCase": "Best for advanced developers building or maintaining complex software."
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "company": "Anysphere",
    "category": "Coding",
    "logo": "https://cdn.simpleicons.org/cursor/FFFFFF",
    "color": "#ffffff",
    "badge": "Coding IDE",
    "price": "Free / Pro / Business",
    "score": 9.4,
    "trend": 94,
    "difficulty": "Intermediate",
    "platforms": [
      "Desktop",
      "IDE"
    ],
    "flags": [
      "IDE",
      "Codebase",
      "Autocomplete",
      "Agent"
    ],
    "best": [
      "VS Code-like workflows",
      "project editing",
      "autocomplete",
      "fast iteration"
    ],
    "limits": [
      "Requires developer review",
      "Not ideal for non-technical users"
    ],
    "verdict": "The most comfortable AI coding workspace for many developers because it keeps AI close to the editor.",
    "useCase": "Best AI editor for shipping code faster."
  },
  {
    "id": "cline",
    "name": "Cline",
    "company": "Cline",
    "category": "Coding",
    "logo": "https://www.google.com/s2/favicons?domain=cline.bot&sz=128",
    "color": "#3b82f6",
    "badge": "Open Agent",
    "price": "Open source / API costs",
    "score": 9.1,
    "trend": 91,
    "difficulty": "Advanced",
    "platforms": [
      "VS Code",
      "CLI"
    ],
    "flags": [
      "Open Source",
      "Agent",
      "MCP",
      "Local control"
    ],
    "best": [
      "open-source coding agent",
      "VS Code workflows",
      "custom models",
      "MCP"
    ],
    "limits": [
      "Needs configuration",
      "Quality depends on selected model"
    ],
    "verdict": "A powerful open coding agent for users who want control, transparency and model flexibility.",
    "useCase": "Best for technical users who want an open agent inside VS Code."
  },
  {
    "id": "kilocode",
    "name": "Kilo Code",
    "company": "Kilo",
    "category": "Coding",
    "logo": "https://www.google.com/s2/favicons?domain=kilo.ai&sz=128",
    "color": "#7c3aed",
    "badge": "Roo Successor",
    "price": "Open source / API costs",
    "score": 9.0,
    "trend": 90,
    "difficulty": "Advanced",
    "platforms": [
      "VS Code"
    ],
    "flags": [
      "Open Source",
      "Agent",
      "Multi-model",
      "Fork"
    ],
    "best": [
      "Roo Code replacement",
      "agentic code editing",
      "multi-model workflows",
      "custom automation"
    ],
    "limits": [
      "Newer ecosystem",
      "Requires technical setup"
    ],
    "verdict": "The better modern replacement for Roo Code if you want an open, model-flexible coding agent.",
    "useCase": "Best open-source agent for users who previously looked at Roo Code."
  },
  {
    "id": "copilot",
    "name": "GitHub Copilot",
    "company": "GitHub",
    "category": "Coding",
    "logo": "https://cdn.simpleicons.org/github/FFFFFF",
    "color": "#8b5cf6",
    "badge": "Enterprise",
    "price": "Paid / Business",
    "score": 8.9,
    "trend": 85,
    "difficulty": "Easy",
    "platforms": [
      "VS Code",
      "JetBrains",
      "GitHub"
    ],
    "flags": [
      "IDE",
      "Enterprise",
      "Autocomplete",
      "Team"
    ],
    "best": [
      "teams",
      "IDE autocomplete",
      "GitHub workflows",
      "enterprise adoption"
    ],
    "limits": [
      "Less agentic than newer tools",
      "Can feel conservative"
    ],
    "verdict": "Still one of the easiest coding tools to deploy across a professional development team.",
    "useCase": "Best for teams already using GitHub and traditional IDE workflows."
  },
  {
    "id": "codexcli",
    "name": "OpenAI Codex CLI",
    "company": "OpenAI",
    "category": "Coding",
    "logo": "https://cdn.simpleicons.org/openai/FFFFFF",
    "color": "#00e6be",
    "badge": "CLI Agent",
    "price": "API / Paid",
    "score": 9.2,
    "trend": 93,
    "difficulty": "Advanced",
    "platforms": [
      "CLI",
      "Terminal",
      "API"
    ],
    "flags": [
      "Agent",
      "CLI",
      "Code",
      "Automation"
    ],
    "best": [
      "terminal coding",
      "repo tasks",
      "automation",
      "developer workflows"
    ],
    "limits": [
      "Technical setup required",
      "Best with strong prompts and review"
    ],
    "verdict": "A serious CLI-native option for developers who want OpenAI models directly in terminal workflows.",
    "useCase": "Best for developers who prefer command-line workflows."
  },
  {
    "id": "perplexity",
    "name": "Perplexity",
    "company": "Perplexity AI",
    "category": "Research",
    "logo": "https://cdn.simpleicons.org/perplexity/20B8CD",
    "color": "#20b8cd",
    "badge": "Search Pick",
    "price": "Free / Pro / Max",
    "score": 9.2,
    "trend": 94,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "Mobile",
      "Browser"
    ],
    "flags": [
      "Citations",
      "Search",
      "Research",
      "Deep research"
    ],
    "best": [
      "sourced answers",
      "market research",
      "SEO research",
      "news monitoring"
    ],
    "limits": [
      "Not a full productivity suite",
      "Creative writing is not its core strength"
    ],
    "verdict": "The fastest way to get useful sourced answers without opening twenty tabs.",
    "useCase": "Best AI search engine for research-heavy users."
  },
  {
    "id": "notebooklm",
    "name": "NotebookLM",
    "company": "Google",
    "category": "Research",
    "logo": "https://cdn.simpleicons.org/googlegemini/8E75FF",
    "color": "#8e75ff",
    "badge": "Knowledge",
    "price": "Free / Google plans",
    "score": 9.0,
    "trend": 88,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Documents",
      "Audio overview",
      "Research",
      "Study"
    ],
    "best": [
      "document research",
      "study",
      "knowledge bases",
      "source-grounded summaries"
    ],
    "limits": [
      "Less general-purpose than ChatGPT",
      "Depends on uploaded sources"
    ],
    "verdict": "One of the most useful tools for turning documents into understandable knowledge.",
    "useCase": "Best for students, researchers and document-heavy workflows."
  },
  {
    "id": "gemini",
    "name": "Gemini",
    "company": "Google",
    "category": "Chatbots",
    "logo": "https://cdn.simpleicons.org/googlegemini/8E75FF",
    "color": "#8e75ff",
    "badge": "Google Stack",
    "price": "Free / Advanced",
    "score": 9.1,
    "trend": 90,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "Mobile",
      "Google Workspace"
    ],
    "flags": [
      "Multimodal",
      "Workspace",
      "Search",
      "Image"
    ],
    "best": [
      "Google ecosystem",
      "research",
      "multimodal analysis",
      "productivity"
    ],
    "limits": [
      "Writing tone can be less natural than Claude",
      "Feature availability varies"
    ],
    "verdict": "The best AI assistant if your work already lives inside Google products.",
    "useCase": "Best for Google Workspace users."
  },
  {
    "id": "grok",
    "name": "Grok",
    "company": "xAI",
    "category": "Research",
    "logo": "https://cdn.simpleicons.org/x/FFFFFF",
    "color": "#ffffff",
    "badge": "Realtime",
    "price": "Paid / X plans",
    "score": 8.4,
    "trend": 86,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "X",
      "Mobile"
    ],
    "flags": [
      "Realtime",
      "Social",
      "News"
    ],
    "best": [
      "X trends",
      "fast reactions",
      "social monitoring",
      "news context"
    ],
    "limits": [
      "Tone can be polarizing",
      "Less ideal for neutral enterprise docs"
    ],
    "verdict": "Useful when you care about live social context and current conversation velocity.",
    "useCase": "Best for realtime social and trend monitoring."
  },
  {
    "id": "deepseek",
    "name": "DeepSeek",
    "company": "DeepSeek",
    "category": "Chatbots",
    "logo": "https://cdn.simpleicons.org/deepseek/4D6BFF",
    "color": "#4d6bff",
    "badge": "Value",
    "price": "Free / API",
    "score": 8.8,
    "trend": 87,
    "difficulty": "Intermediate",
    "platforms": [
      "Web",
      "API"
    ],
    "flags": [
      "Reasoning",
      "Code",
      "API",
      "Value"
    ],
    "best": [
      "free reasoning",
      "coding tests",
      "technical tasks",
      "API experiments"
    ],
    "limits": [
      "Privacy and hosting should be evaluated",
      "Ecosystem is less polished"
    ],
    "verdict": "A strong value option for users who want capable reasoning without premium pricing.",
    "useCase": "Best for value-focused technical users."
  },
  {
    "id": "mistral",
    "name": "Mistral AI",
    "company": "Mistral",
    "category": "Models",
    "logo": "https://cdn.simpleicons.org/mistralai/FF7000",
    "color": "#ff7000",
    "badge": "EU Pick",
    "price": "Free / Pro / API",
    "score": 8.9,
    "trend": 84,
    "difficulty": "Advanced",
    "platforms": [
      "Web",
      "API",
      "Cloud"
    ],
    "flags": [
      "API",
      "European",
      "Open models",
      "Enterprise"
    ],
    "best": [
      "European AI stack",
      "API products",
      "agents",
      "enterprise workflows"
    ],
    "limits": [
      "Less mainstream for casual users",
      "More technical to exploit fully"
    ],
    "verdict": "A serious European AI platform for builders, teams and companies that care about API and sovereignty.",
    "useCase": "Best European AI model provider."
  },
  {
    "id": "huggingface",
    "name": "Hugging Face",
    "company": "Hugging Face",
    "category": "Models",
    "logo": "https://cdn.simpleicons.org/huggingface/FFD21E",
    "color": "#ffd21e",
    "badge": "Open Source",
    "price": "Free / Pro / Enterprise",
    "score": 9.0,
    "trend": 82,
    "difficulty": "Expert",
    "platforms": [
      "Web",
      "API",
      "Cloud",
      "Local"
    ],
    "flags": [
      "Open Source",
      "Models",
      "Datasets",
      "API"
    ],
    "best": [
      "open models",
      "datasets",
      "experiments",
      "model hosting",
      "AI research"
    ],
    "limits": [
      "Can be overwhelming",
      "Requires technical knowledge"
    ],
    "verdict": "The backbone of open AI experimentation and model discovery.",
    "useCase": "Best for AI builders, researchers and open-source workflows."
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "company": "Ollama",
    "category": "Local AI",
    "logo": "https://www.google.com/s2/favicons?domain=ollama.com&sz=128",
    "color": "#ffffff",
    "badge": "Local",
    "price": "Free",
    "score": 8.8,
    "trend": 86,
    "difficulty": "Advanced",
    "platforms": [
      "Desktop",
      "CLI",
      "Local"
    ],
    "flags": [
      "Local",
      "Open Source",
      "Privacy",
      "Models"
    ],
    "best": [
      "local LLMs",
      "privacy",
      "offline experiments",
      "developer workflows"
    ],
    "limits": [
      "Requires hardware",
      "Model quality depends on local setup"
    ],
    "verdict": "The simplest serious way to run many open models locally.",
    "useCase": "Best for local AI and privacy-first experimentation."
  },
  {
    "id": "midjourney",
    "name": "Midjourney",
    "company": "Midjourney",
    "category": "Image",
    "logo": "https://cdn.simpleicons.org/midjourney/FFFFFF",
    "color": "#ffffff",
    "badge": "Image Pro",
    "price": "Paid plans",
    "score": 9.4,
    "trend": 89,
    "difficulty": "Intermediate",
    "platforms": [
      "Web",
      "Discord"
    ],
    "flags": [
      "Image",
      "Art",
      "Creative",
      "Premium"
    ],
    "best": [
      "premium visuals",
      "concept art",
      "thumbnails",
      "art direction"
    ],
    "limits": [
      "Precision editing is not always ideal",
      "Paid-only for serious use"
    ],
    "verdict": "The image generator with the strongest visual taste for premium creative work.",
    "useCase": "Best for beautiful AI images and art direction."
  },
  {
    "id": "flux",
    "name": "FLUX",
    "company": "Black Forest Labs",
    "category": "Image",
    "logo": "https://www.google.com/s2/favicons?domain=blackforestlabs.ai&sz=128",
    "color": "#10b981",
    "badge": "Image Model",
    "price": "Free / API / Hosted",
    "score": 9.1,
    "trend": 91,
    "difficulty": "Intermediate",
    "platforms": [
      "Web",
      "API",
      "Local via ecosystem"
    ],
    "flags": [
      "Image",
      "Open weights",
      "API",
      "Creative"
    ],
    "best": [
      "realistic images",
      "open model workflows",
      "API image generation",
      "experimentation"
    ],
    "limits": [
      "Experience depends on host app",
      "Licensing varies by model/version"
    ],
    "verdict": "A major image model family for creators and builders who want strong outputs beyond closed tools.",
    "useCase": "Best modern image model for flexible workflows."
  },
  {
    "id": "ideogram",
    "name": "Ideogram",
    "company": "Ideogram",
    "category": "Image",
    "logo": "https://www.google.com/s2/favicons?domain=ideogram.ai&sz=128",
    "color": "#f43f5e",
    "badge": "Text Images",
    "price": "Free / Paid",
    "score": 8.7,
    "trend": 82,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Image",
      "Text rendering",
      "Logo",
      "Marketing"
    ],
    "best": [
      "images with text",
      "posters",
      "logos",
      "social visuals"
    ],
    "limits": [
      "Not always the best artistic taste",
      "Control can vary"
    ],
    "verdict": "The easiest recommendation when text inside the image actually matters.",
    "useCase": "Best for posters, logos and marketing visuals with text."
  },
  {
    "id": "leonardo",
    "name": "Leonardo AI",
    "company": "Leonardo",
    "category": "Image",
    "logo": "https://www.google.com/s2/favicons?domain=leonardo.ai&sz=128",
    "color": "#22c55e",
    "badge": "Assets",
    "price": "Free / Paid",
    "score": 8.6,
    "trend": 80,
    "difficulty": "Intermediate",
    "platforms": [
      "Web",
      "API"
    ],
    "flags": [
      "Image",
      "Assets",
      "Game art",
      "API"
    ],
    "best": [
      "game assets",
      "visual assets",
      "product shots",
      "creative variations"
    ],
    "limits": [
      "Workflow takes learning",
      "Not always as premium as Midjourney"
    ],
    "verdict": "A strong asset-focused image platform for creators who generate lots of production visuals.",
    "useCase": "Best for assets and creative production pipelines."
  },
  {
    "id": "firefly",
    "name": "Adobe Firefly",
    "company": "Adobe",
    "category": "Image",
    "logo": "https://cdn.simpleicons.org/adobe/FF0000",
    "color": "#ff0000",
    "badge": "Commercial",
    "price": "Free credits / Adobe plans",
    "score": 8.5,
    "trend": 78,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "Adobe apps"
    ],
    "flags": [
      "Commercial",
      "Image",
      "Adobe",
      "Design"
    ],
    "best": [
      "Adobe workflows",
      "brand-safe visuals",
      "image editing",
      "marketing design"
    ],
    "limits": [
      "Less playful than Midjourney",
      "Best inside Adobe ecosystem"
    ],
    "verdict": "The safest pick for Adobe users who need commercially oriented creative AI.",
    "useCase": "Best for Adobe-centric creative teams."
  },
  {
    "id": "canva",
    "name": "Canva AI",
    "company": "Canva",
    "category": "Design",
    "logo": "https://cdn.simpleicons.org/canva/00C4CC",
    "color": "#00c4cc",
    "badge": "Design Value",
    "price": "Free / Pro / Teams",
    "score": 8.6,
    "trend": 83,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "Mobile"
    ],
    "flags": [
      "Design",
      "Templates",
      "Team",
      "Social"
    ],
    "best": [
      "social posts",
      "presentations",
      "marketing visuals",
      "templates"
    ],
    "limits": [
      "Can feel generic",
      "Less premium for pure AI art"
    ],
    "verdict": "The easiest way for non-designers to ship clean visual content fast.",
    "useCase": "Best for marketers, creators and small teams."
  },
  {
    "id": "runway",
    "name": "Runway",
    "company": "Runway",
    "category": "Video",
    "logo": "https://cdn.simpleicons.org/runway/FFFFFF",
    "color": "#a855f7",
    "badge": "Video Pro",
    "price": "Free trial / Paid",
    "score": 9.1,
    "trend": 88,
    "difficulty": "Intermediate",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Video",
      "Editing",
      "Creative",
      "Team"
    ],
    "best": [
      "AI video generation",
      "editing workflows",
      "ads",
      "creative production"
    ],
    "limits": [
      "Can become expensive",
      "Requires iteration"
    ],
    "verdict": "The most mature AI video workflow for creators who need production control.",
    "useCase": "Best professional AI video platform."
  },
  {
    "id": "veo",
    "name": "Google Veo",
    "company": "Google",
    "category": "Video",
    "logo": "https://cdn.simpleicons.org/googlegemini/8E75FF",
    "color": "#4285f4",
    "badge": "Future Video",
    "price": "Limited / Premium",
    "score": 9.5,
    "trend": 97,
    "difficulty": "Intermediate",
    "platforms": [
      "Google ecosystem"
    ],
    "flags": [
      "Video",
      "Cinematic",
      "Multimodal",
      "Future"
    ],
    "best": [
      "cinematic generation",
      "complex motion",
      "high-end video",
      "future workflows"
    ],
    "limits": [
      "Access can be limited",
      "Production ecosystem still evolving"
    ],
    "verdict": "The most strategically important AI video model because of Google infrastructure and visual quality.",
    "useCase": "Best future-facing AI video model."
  },
  {
    "id": "kling",
    "name": "Kling AI",
    "company": "Kuaishou",
    "category": "Video",
    "logo": "https://www.google.com/s2/favicons?domain=klingai.com&sz=128",
    "color": "#38bdf8",
    "badge": "Viral Video",
    "price": "Free credits / Paid",
    "score": 9.2,
    "trend": 95,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "Mobile"
    ],
    "flags": [
      "Video",
      "Realism",
      "Motion",
      "Social"
    ],
    "best": [
      "viral clips",
      "realistic motion",
      "cinematic shots",
      "social video"
    ],
    "limits": [
      "Workflow less mature than Runway",
      "Control can vary"
    ],
    "verdict": "The AI video tool with one of the strongest immediate wow effects.",
    "useCase": "Best for visually impressive short AI videos."
  },
  {
    "id": "pika",
    "name": "Pika",
    "company": "Pika",
    "category": "Video",
    "logo": "https://www.google.com/s2/favicons?domain=pika.art&sz=128",
    "color": "#f97316",
    "badge": "Fast Video",
    "price": "Free / Paid",
    "score": 8.3,
    "trend": 78,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Video",
      "Social",
      "Fast",
      "Creative"
    ],
    "best": [
      "short videos",
      "quick creative tests",
      "social clips",
      "effects"
    ],
    "limits": [
      "Less premium than top video models",
      "Results vary"
    ],
    "verdict": "A fun, accessible video generator for rapid social content experiments.",
    "useCase": "Best for quick social video experiments."
  },
  {
    "id": "luma",
    "name": "Luma AI",
    "company": "Luma",
    "category": "Video",
    "logo": "https://www.google.com/s2/favicons?domain=lumalabs.ai&sz=128",
    "color": "#38bdf8",
    "badge": "Cinematic",
    "price": "Free / Paid",
    "score": 8.6,
    "trend": 83,
    "difficulty": "Intermediate",
    "platforms": [
      "Web",
      "Mobile"
    ],
    "flags": [
      "Video",
      "3D",
      "Cinematic",
      "Creative"
    ],
    "best": [
      "cinematic shots",
      "video experiments",
      "motion",
      "creative scenes"
    ],
    "limits": [
      "Control varies",
      "Needs multiple attempts"
    ],
    "verdict": "A strong creative video option when you want cinematic experimentation.",
    "useCase": "Best for cinematic AI video tests."
  },
  {
    "id": "elevenlabs",
    "name": "ElevenLabs",
    "company": "ElevenLabs",
    "category": "Audio",
    "logo": "https://cdn.simpleicons.org/elevenlabs/FFFFFF",
    "color": "#22c55e",
    "badge": "Voice Pro",
    "price": "Free / Paid",
    "score": 9.3,
    "trend": 89,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "API"
    ],
    "flags": [
      "Voice",
      "Dubbing",
      "API",
      "Audio"
    ],
    "best": [
      "voiceover",
      "dubbing",
      "narration",
      "voice API",
      "video audio"
    ],
    "limits": [
      "Voice rights matter",
      "Heavy usage costs more"
    ],
    "verdict": "The premium reference for realistic AI voice production.",
    "useCase": "Best AI voice generator for production use."
  },
  {
    "id": "cartesia",
    "name": "Cartesia",
    "company": "Cartesia",
    "category": "Audio",
    "logo": "https://www.google.com/s2/favicons?domain=cartesia.ai&sz=128",
    "color": "#06b6d4",
    "badge": "Realtime Voice",
    "price": "API / Paid",
    "score": 8.9,
    "trend": 87,
    "difficulty": "Advanced",
    "platforms": [
      "API",
      "Web"
    ],
    "flags": [
      "Voice",
      "Realtime",
      "API",
      "Agents"
    ],
    "best": [
      "realtime voice agents",
      "low-latency speech",
      "voice apps",
      "developer workflows"
    ],
    "limits": [
      "More developer-focused",
      "Needs integration"
    ],
    "verdict": "A strong voice AI platform for builders who care about realtime latency.",
    "useCase": "Best for realtime AI voice products."
  },
  {
    "id": "suno",
    "name": "Suno",
    "company": "Suno",
    "category": "Audio",
    "logo": "https://www.google.com/s2/favicons?domain=suno.com&sz=128",
    "color": "#f97316",
    "badge": "Music",
    "price": "Free / Pro",
    "score": 8.7,
    "trend": 86,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "Mobile"
    ],
    "flags": [
      "Music",
      "Songs",
      "Creative",
      "Social"
    ],
    "best": [
      "AI songs",
      "jingles",
      "music demos",
      "social audio"
    ],
    "limits": [
      "Rights should be checked",
      "Fine control is limited"
    ],
    "verdict": "The simplest way to generate full AI songs from prompts.",
    "useCase": "Best for AI music creation."
  },
  {
    "id": "udio",
    "name": "Udio",
    "company": "Udio",
    "category": "Audio",
    "logo": "https://www.google.com/s2/favicons?domain=udio.com&sz=128",
    "color": "#facc15",
    "badge": "Music",
    "price": "Free / Paid",
    "score": 8.5,
    "trend": 82,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Music",
      "Creative",
      "Songs"
    ],
    "best": [
      "music experiments",
      "song ideas",
      "demos",
      "creative audio"
    ],
    "limits": [
      "Rights and licensing need attention",
      "Control can vary"
    ],
    "verdict": "A strong alternative for AI music exploration and creative drafts.",
    "useCase": "Best for experimenting with AI-generated music."
  },
  {
    "id": "heygen",
    "name": "HeyGen",
    "company": "HeyGen",
    "category": "Avatar",
    "logo": "https://www.google.com/s2/favicons?domain=heygen.com&sz=128",
    "color": "#7c3aed",
    "badge": "Avatar",
    "price": "Free trial / Paid",
    "score": 8.8,
    "trend": 84,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Avatar",
      "Video",
      "Dubbing",
      "Marketing"
    ],
    "best": [
      "AI presenters",
      "sales videos",
      "training videos",
      "translation"
    ],
    "limits": [
      "Can look artificial",
      "Voice/image rights matter"
    ],
    "verdict": "One of the best tools for business-ready AI avatar videos.",
    "useCase": "Best for avatar videos and multilingual business content."
  },
  {
    "id": "synthesia",
    "name": "Synthesia",
    "company": "Synthesia",
    "category": "Avatar",
    "logo": "https://cdn.simpleicons.org/synthesia/3b82f6",
    "color": "#3b82f6",
    "badge": "Enterprise",
    "price": "Paid / Enterprise",
    "score": 8.6,
    "trend": 75,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Avatar",
      "Enterprise",
      "Training",
      "Team"
    ],
    "best": [
      "training videos",
      "corporate content",
      "internal comms",
      "team workflows"
    ],
    "limits": [
      "Less creator-fun than HeyGen",
      "More enterprise oriented"
    ],
    "verdict": "A very solid avatar platform for corporate and training content.",
    "useCase": "Best for enterprise avatar video."
  },
  {
    "id": "make",
    "name": "Make",
    "company": "Make",
    "category": "Automation",
    "logo": "https://cdn.simpleicons.org/make/6D00CC",
    "color": "#6366f1",
    "badge": "No-code",
    "price": "Free / Paid",
    "score": 8.8,
    "trend": 82,
    "difficulty": "Intermediate",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Automation",
      "No-code",
      "Integrations",
      "Workflows"
    ],
    "best": [
      "visual automations",
      "SaaS workflows",
      "marketing ops",
      "lead routing"
    ],
    "limits": [
      "Complex scenarios require structure",
      "Debugging takes practice"
    ],
    "verdict": "The best balance between power and accessibility for visual automation.",
    "useCase": "Best no-code automation builder."
  },
  {
    "id": "zapier",
    "name": "Zapier",
    "company": "Zapier",
    "category": "Automation",
    "logo": "https://cdn.simpleicons.org/zapier/FF4A00",
    "color": "#ff4f00",
    "badge": "Integrations",
    "price": "Free / Paid / Team",
    "score": 8.4,
    "trend": 74,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Automation",
      "Integrations",
      "Team",
      "No-code"
    ],
    "best": [
      "simple automations",
      "SaaS connections",
      "teams",
      "fast setup"
    ],
    "limits": [
      "Can get expensive at scale",
      "Less flexible than n8n"
    ],
    "verdict": "The easiest automation platform for connecting mainstream apps quickly.",
    "useCase": "Best for simple business automations."
  },
  {
    "id": "n8n",
    "name": "n8n",
    "company": "n8n",
    "category": "Automation",
    "logo": "https://cdn.simpleicons.org/n8n/EA4B71",
    "color": "#ea4b71",
    "badge": "Open Source",
    "price": "Free self-host / Cloud",
    "score": 9.0,
    "trend": 88,
    "difficulty": "Advanced",
    "platforms": [
      "Web",
      "Self-host",
      "Cloud"
    ],
    "flags": [
      "Open Source",
      "API",
      "Agents",
      "Self-host"
    ],
    "best": [
      "advanced workflows",
      "API automations",
      "AI agents",
      "self-hosting"
    ],
    "limits": [
      "Steeper learning curve",
      "Less beginner friendly"
    ],
    "verdict": "The best automation choice when control and technical flexibility matter.",
    "useCase": "Best advanced automation and AI agent workflow tool."
  },
  {
    "id": "genspark",
    "name": "Genspark",
    "company": "Genspark",
    "category": "Agents",
    "logo": "https://www.google.com/s2/favicons?domain=genspark.ai&sz=128",
    "color": "#06b6d4",
    "badge": "Agent Search",
    "price": "Free / Paid",
    "score": 8.6,
    "trend": 89,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Agents",
      "Search",
      "Research",
      "Pages"
    ],
    "best": [
      "agentic search",
      "research pages",
      "summaries",
      "multi-source exploration"
    ],
    "limits": [
      "Still evolving",
      "Quality depends on sources"
    ],
    "verdict": "A promising agentic research product for users who want structured answers and generated pages.",
    "useCase": "Best for agentic search experiences."
  },
  {
    "id": "manus",
    "name": "Manus AI",
    "company": "Manus",
    "category": "Agents",
    "logo": "https://www.google.com/s2/favicons?domain=manus.im&sz=128",
    "color": "#ffffff",
    "badge": "Agent",
    "price": "Limited / Paid",
    "score": 8.5,
    "trend": 90,
    "difficulty": "Intermediate",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Agent",
      "Automation",
      "Research",
      "Tasks"
    ],
    "best": [
      "general autonomous tasks",
      "research",
      "workflow execution",
      "multi-step jobs"
    ],
    "limits": [
      "Access and reliability can vary",
      "Needs supervision"
    ],
    "verdict": "Interesting for users testing the future of autonomous AI task execution.",
    "useCase": "Best for experimenting with general-purpose AI agents."
  },
  {
    "id": "replit",
    "name": "Replit Agent",
    "company": "Replit",
    "category": "Agents",
    "logo": "https://cdn.simpleicons.org/replit/F26207",
    "color": "#f26207",
    "badge": "App Agent",
    "price": "Free / Paid",
    "score": 8.7,
    "trend": 86,
    "difficulty": "Beginner",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Agent",
      "Coding",
      "Deploy",
      "Apps"
    ],
    "best": [
      "MVPs",
      "web apps",
      "prototype hosting",
      "browser coding"
    ],
    "limits": [
      "Less control than full local setup",
      "Big apps still need engineering"
    ],
    "verdict": "One of the easiest ways to go from app idea to running prototype in the browser.",
    "useCase": "Best for quick app prototyping with an AI agent."
  },
  {
    "id": "lovable",
    "name": "Lovable",
    "company": "Lovable",
    "category": "App Builder",
    "logo": "https://cdn.simpleicons.org/lovable/FF5A5F",
    "color": "#ff5a8a",
    "badge": "Vibe Coding",
    "price": "Free / Paid",
    "score": 8.4,
    "trend": 88,
    "difficulty": "Beginner",
    "platforms": [
      "Web"
    ],
    "flags": [
      "App Builder",
      "Frontend",
      "No-code",
      "Prototype"
    ],
    "best": [
      "landing pages",
      "MVPs",
      "simple apps",
      "non-technical founders"
    ],
    "limits": [
      "Not ideal for complex architecture",
      "Code needs review"
    ],
    "verdict": "A very accessible builder for turning product ideas into visible interfaces fast.",
    "useCase": "Best for founders and creators prototyping apps."
  },
  {
    "id": "bolt",
    "name": "Bolt.new",
    "company": "StackBlitz",
    "category": "App Builder",
    "logo": "https://cdn.simpleicons.org/stackblitz/1389FD",
    "color": "#facc15",
    "badge": "Web Builder",
    "price": "Free / Paid",
    "score": 8.5,
    "trend": 85,
    "difficulty": "Beginner",
    "platforms": [
      "Web"
    ],
    "flags": [
      "App Builder",
      "Browser IDE",
      "Frontend",
      "Prototype"
    ],
    "best": [
      "web prototypes",
      "React apps",
      "quick tests",
      "UI generation"
    ],
    "limits": [
      "Can struggle with larger apps",
      "Generated code needs cleanup"
    ],
    "verdict": "A fast browser-based AI builder for web prototypes and front-end experiments.",
    "useCase": "Best for quick browser-based web app prototypes."
  },
  {
    "id": "v0",
    "name": "v0",
    "company": "Vercel",
    "category": "App Builder",
    "logo": "https://cdn.simpleicons.org/vercel/FFFFFF",
    "color": "#ffffff",
    "badge": "UI Builder",
    "price": "Free / Premium",
    "score": 8.7,
    "trend": 84,
    "difficulty": "Intermediate",
    "platforms": [
      "Web"
    ],
    "flags": [
      "UI",
      "React",
      "Next.js",
      "Frontend"
    ],
    "best": [
      "React components",
      "landing pages",
      "UI systems",
      "frontend prototypes"
    ],
    "limits": [
      "Not a full backend builder",
      "Needs integration work"
    ],
    "verdict": "The cleanest AI UI generator for modern React and Next.js interfaces.",
    "useCase": "Best for polished UI generation."
  },
  {
    "id": "gamma",
    "name": "Gamma",
    "company": "Gamma",
    "category": "Productivity",
    "logo": "https://www.google.com/s2/favicons?domain=gamma.app&sz=128",
    "color": "#7c3aed",
    "badge": "Slides",
    "price": "Free / Paid",
    "score": 8.6,
    "trend": 79,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Presentation",
      "Docs",
      "Design",
      "Speed"
    ],
    "best": [
      "presentations",
      "pitch decks",
      "visual documents",
      "quick decks"
    ],
    "limits": [
      "Less precise than manual design",
      "Needs final polishing"
    ],
    "verdict": "One of the fastest ways to create clean AI-assisted presentations.",
    "useCase": "Best AI presentation builder."
  },
  {
    "id": "notion",
    "name": "Notion AI",
    "company": "Notion",
    "category": "Productivity",
    "logo": "https://cdn.simpleicons.org/notion/FFFFFF",
    "color": "#ffffff",
    "badge": "Workspace",
    "price": "Paid add-on / Business",
    "score": 8.3,
    "trend": 72,
    "difficulty": "Easy",
    "platforms": [
      "Web",
      "Desktop",
      "Mobile"
    ],
    "flags": [
      "Docs",
      "Workspace",
      "Team",
      "Knowledge"
    ],
    "best": [
      "workspace notes",
      "summaries",
      "docs",
      "team knowledge"
    ],
    "limits": [
      "Less powerful than dedicated assistants",
      "Best only if you use Notion"
    ],
    "verdict": "Useful when Notion is already the center of your team knowledge.",
    "useCase": "Best for Notion-based productivity."
  },
  {
    "id": "jasper",
    "name": "Jasper",
    "company": "Jasper",
    "category": "Marketing",
    "logo": "https://cdn.simpleicons.org/jasper/8A3FFC",
    "color": "#8b5cf6",
    "badge": "Marketing",
    "price": "Paid / Business",
    "score": 8.1,
    "trend": 67,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Writing",
      "Marketing",
      "Brand",
      "Team"
    ],
    "best": [
      "brand voice",
      "campaigns",
      "marketing teams",
      "content workflows"
    ],
    "limits": [
      "Less valuable for solo casual users",
      "Higher price"
    ],
    "verdict": "Best suited to teams that need consistent branded marketing content.",
    "useCase": "Best for marketing teams and brand workflows."
  },
  {
    "id": "copyai",
    "name": "Copy.ai",
    "company": "Copy.ai",
    "category": "Marketing",
    "logo": "https://www.google.com/s2/favicons?domain=copy.ai&sz=128",
    "color": "#10b981",
    "badge": "GTM",
    "price": "Free / Paid",
    "score": 7.9,
    "trend": 65,
    "difficulty": "Easy",
    "platforms": [
      "Web"
    ],
    "flags": [
      "Sales",
      "Marketing",
      "Writing",
      "Workflow"
    ],
    "best": [
      "sales copy",
      "emails",
      "GTM workflows",
      "marketing drafts"
    ],
    "limits": [
      "Quality depends on workflow setup",
      "Not best for deep reasoning"
    ],
    "verdict": "A practical option for sales and marketing copy workflows.",
    "useCase": "Best for quick GTM and copywriting workflows."
  },
  {
    "id": "semrush",
    "name": "Semrush AI",
    "company": "Semrush",
    "category": "SEO",
    "logo": "https://cdn.simpleicons.org/semrush/FF642D",
    "color": "#ff642d",
    "badge": "SEO Pro",
    "price": "Paid",
    "score": 8.4,
    "trend": 70,
    "difficulty": "Intermediate",
    "platforms": [
      "Web"
    ],
    "flags": [
      "SEO",
      "Marketing",
      "Research",
      "Competitive"
    ],
    "best": [
      "SEO research",
      "competitor analysis",
      "keyword work",
      "content strategy"
    ],
    "limits": [
      "Can be expensive",
      "AI features complement SEO data"
    ],
    "verdict": "Best when AI is combined with serious SEO and competitive data.",
    "useCase": "Best for professional SEO workflows."
  },
  {
    "id": "surfer",
    "name": "Surfer SEO",
    "company": "Surfer",
    "category": "SEO",
    "logo": "https://www.google.com/s2/favicons?domain=surferseo.com&sz=128",
    "color": "#22c55e",
    "badge": "SEO Content",
    "price": "Paid",
    "score": 8.2,
    "trend": 68,
    "difficulty": "Intermediate",
    "platforms": [
      "Web"
    ],
    "flags": [
      "SEO",
      "Content",
      "SERP",
      "Writing"
    ],
    "best": [
      "SEO content briefs",
      "optimization",
      "rank-focused writing",
      "content teams"
    ],
    "limits": [
      "Can lead to over-optimized writing",
      "Needs editorial judgment"
    ],
    "verdict": "A strong SEO content optimization tool when used with human editorial control.",
    "useCase": "Best for SEO content optimization."
  },
  {
    id: "gpt4o",
    name: "GPT-4o",
    company: "OpenAI",
    category: "Models",
    logo: "https://cdn.simpleicons.org/openai/FFFFFF",
    color: "#00e6be",
    badge: "Multimodal",
    price: "Free / Plus / API",
    score: 9.3,
    trend: 91,
    difficulty: "Easy",
    platforms: ["Web", "API", "Mobile", "Desktop"],
    flags: ["Multimodal", "Voice", "Vision", "API"],
    best: ["fast multimodal work", "voice", "vision", "daily productivity", "apps"],
    limits: ["Not open source", "Advanced usage depends on plan"],
    verdict: "A polished multimodal model for users who need speed, images, voice and practical daily assistance.",
    useCase: "Best for fast multimodal workflows when you do not need the absolute flagship model."
  },
  {
    id: "openaiapi",
    name: "OpenAI API",
    company: "OpenAI",
    category: "Models",
    logo: "https://cdn.simpleicons.org/openai/FFFFFF",
    color: "#00e6be",
    badge: "Developer Stack",
    price: "Usage based",
    score: 9.4,
    trend: 92,
    difficulty: "Advanced",
    platforms: ["API", "Cloud", "Apps"],
    flags: ["API", "Agents", "Responses", "Embeddings"],
    best: ["building AI products", "agents", "automation", "chat apps", "production APIs"],
    limits: ["Requires technical implementation", "Costs need monitoring"],
    verdict: "A core infrastructure choice for teams building serious AI products on top of OpenAI models.",
    useCase: "Best for developers who need production-grade AI APIs."
  },
  {
    id: "claudeopus",
    name: "Claude Opus",
    company: "Anthropic",
    category: "Models",
    logo: "https://cdn.simpleicons.org/anthropic/D97757",
    color: "#d97757",
    badge: "Reasoning",
    price: "Pro / API",
    score: 9.4,
    trend: 89,
    difficulty: "Intermediate",
    platforms: ["Web", "API"],
    flags: ["Reasoning", "Writing", "Long context", "API"],
    best: ["deep analysis", "long documents", "strategy", "writing", "complex reasoning"],
    limits: ["Can be slower than lighter models", "Premium usage costs more"],
    verdict: "One of the strongest premium choices for deep reasoning, writing quality and long-context work.",
    useCase: "Best for high-value thinking tasks, documents and expert workflows."
  },
  {
    id: "geminiflash",
    name: "Gemini Flash",
    company: "Google",
    category: "Models",
    logo: "https://cdn.simpleicons.org/googlegemini/8E75FF",
    color: "#8e75ff",
    badge: "Fast Model",
    price: "Free / API",
    score: 8.8,
    trend: 84,
    difficulty: "Easy",
    platforms: ["Web", "API", "Google"],
    flags: ["Fast", "Multimodal", "Google", "API"],
    best: ["fast responses", "high-volume tasks", "Google ecosystem", "multimodal tests"],
    limits: ["Not always the deepest model", "Feature access may vary"],
    verdict: "A strong fast model when latency and cost matter more than maximum reasoning depth.",
    useCase: "Best for fast and affordable multimodal AI tasks."
  },
  {
    id: "qwen",
    name: "Qwen",
    company: "Alibaba",
    category: "Models",
    logo: "https://www.google.com/s2/favicons?domain=qwenlm.github.io&sz=128",
    color: "#38bdf8",
    badge: "Open Models",
    price: "Open / API",
    score: 8.7,
    trend: 86,
    difficulty: "Advanced",
    platforms: ["API", "Local", "Cloud"],
    flags: ["Open weights", "Code", "Multilingual", "API"],
    best: ["open model workflows", "multilingual tasks", "coding", "self-hosting experiments"],
    limits: ["Requires technical setup for local use", "Ecosystem less mainstream than OpenAI/Anthropic"],
    verdict: "A serious open-model family for builders who want flexibility beyond closed ecosystems.",
    useCase: "Best for technical users exploring open models and multilingual workflows."
  },
  {
    id: "metaai",
    name: "Meta AI / Llama",
    company: "Meta",
    category: "Models",
    logo: "https://cdn.simpleicons.org/meta/0866FF",
    color: "#0866ff",
    badge: "Open Ecosystem",
    price: "Free / Open models",
    score: 8.6,
    trend: 84,
    difficulty: "Intermediate",
    platforms: ["Web", "API partners", "Local"],
    flags: ["Open models", "Research", "Local", "Developer"],
    best: ["open-source stacks", "local AI", "research", "custom assistants"],
    limits: ["Product experience varies", "Best results often need setup"],
    verdict: "A key pillar of the open AI ecosystem, especially for teams that want model control and flexibility.",
    useCase: "Best for open-model experimentation and self-hosted AI stacks."
  },
  {
    id: "adobeexpress",
    name: "Adobe Express AI",
    company: "Adobe",
    category: "Design",
    logo: "https://cdn.simpleicons.org/adobe/FF0000",
    color: "#ff0000",
    badge: "Design Suite",
    price: "Free / Premium",
    score: 8.3,
    trend: 76,
    difficulty: "Easy",
    platforms: ["Web", "Mobile"],
    flags: ["Design", "Templates", "Brand", "Marketing"],
    best: ["social graphics", "brand assets", "quick design", "creator workflows"],
    limits: ["Less specialized than Firefly or Midjourney", "Template-heavy results can feel generic"],
    verdict: "A practical design suite for creators and small teams who need polished assets quickly.",
    useCase: "Best for fast branded social and marketing visuals."
  },
  {
    id: "napkin",
    name: "Napkin AI",
    company: "Napkin",
    category: "Productivity",
    logo: "https://www.google.com/s2/favicons?domain=napkin.ai&sz=128",
    color: "#f59e0b",
    badge: "Visual Thinking",
    price: "Free / Paid",
    score: 8.2,
    trend: 79,
    difficulty: "Easy",
    platforms: ["Web"],
    flags: ["Diagrams", "Presentations", "Ideas", "Visuals"],
    best: ["turning text into visuals", "explanations", "presentations", "idea mapping"],
    limits: ["Not a full design suite", "Best for concept visuals rather than final artwork"],
    verdict: "A clever tool for turning rough ideas and text into visuals that make concepts easier to understand.",
    useCase: "Best for visual explanations, decks and concept diagrams."
  },
  {
    id: "otter",
    name: "Otter.ai",
    company: "Otter",
    category: "Productivity",
    logo: "https://www.google.com/s2/favicons?domain=otter.ai&sz=128",
    color: "#3b82f6",
    badge: "Meetings",
    price: "Free / Pro / Business",
    score: 8.1,
    trend: 72,
    difficulty: "Easy",
    platforms: ["Web", "Mobile", "Meetings"],
    flags: ["Transcription", "Meetings", "Notes", "Team"],
    best: ["meeting notes", "transcription", "summaries", "team follow-up"],
    limits: ["Accuracy depends on audio quality", "Not a general AI assistant"],
    verdict: "A reliable meeting transcription tool for people who spend their week in calls.",
    useCase: "Best for automatic meeting notes and follow-ups."
  },
  {
    id: "firecrawl",
    name: "Firecrawl",
    company: "Firecrawl",
    category: "Agents",
    logo: "https://www.google.com/s2/favicons?domain=firecrawl.dev&sz=128",
    color: "#ff6b35",
    badge: "AI Scraping",
    price: "Free / API",
    score: 8.5,
    trend: 83,
    difficulty: "Advanced",
    platforms: ["API", "Developer"],
    flags: ["API", "Scraping", "RAG", "Agents"],
    best: ["web data extraction", "RAG pipelines", "agent tools", "developer automations"],
    limits: ["Developer-oriented", "Needs proper data and compliance handling"],
    verdict: "A useful infrastructure layer for AI apps that need clean web data ingestion.",
    useCase: "Best for developers building RAG and agent workflows with web data."
  }
,
  { id:"gpt", name:"GPT models", company:"OpenAI", category:"Models", logo:"https://cdn.simpleicons.org/openai/FFFFFF", color:"#00e6be", badge:"Model Family", price:"API / Product plans", score:9.7, trend:97, difficulty:"Intermediate", platforms:["API","Web","Apps"], flags:["Reasoning","Multimodal","API","Agents"], best:["general AI products","assistants","coding","automation","content"], limits:["Pricing varies by model and usage","Not open source"], verdict:"The reference model family for building and using broad AI workflows.", useCase:"Best for teams that want a flexible OpenAI model stack." },
  { id:"groq", name:"Groq", company:"Groq", category:"Infrastructure", logo:"https://www.google.com/s2/favicons?domain=groq.com&sz=128", color:"#f97316", badge:"Fast Inference", price:"Free / API", score:8.8, trend:90, difficulty:"Advanced", platforms:["API","Cloud"], flags:["Low latency","Open models","Developer"], best:["fast inference","chat apps","agent backends","prototypes"], limits:["Model availability changes","Developer-oriented"], verdict:"One of the strongest picks when inference speed matters more than all-in-one UI polish.", useCase:"Best for developers building fast AI apps." },
  { id:"cohere", name:"Cohere", company:"Cohere", category:"Models", logo:"https://www.google.com/s2/favicons?domain=cohere.com&sz=128", color:"#10b981", badge:"Enterprise RAG", price:"API / Enterprise", score:8.7, trend:78, difficulty:"Advanced", platforms:["API","Cloud","Enterprise"], flags:["RAG","Embeddings","Enterprise","API"], best:["enterprise search","RAG","classification","embeddings"], limits:["Less consumer-facing","Needs technical integration"], verdict:"A serious infrastructure option for companies building retrieval-heavy AI products.", useCase:"Best for enterprise RAG and AI search." },
  { id:"together", name:"Together AI", company:"Together", category:"Infrastructure", logo:"https://www.google.com/s2/favicons?domain=together.ai&sz=128", color:"#3b82f6", badge:"Open Model Cloud", price:"API", score:8.6, trend:84, difficulty:"Advanced", platforms:["API","Cloud"], flags:["Open models","Fine-tuning","Inference"], best:["serving open models","fine-tuning","AI infrastructure"], limits:["Technical setup required","Not a mainstream assistant"], verdict:"A flexible backend for teams that want open-model infrastructure without managing everything themselves.", useCase:"Best for open model inference and customization." },
  { id:"replicate", name:"Replicate", company:"Replicate", category:"Infrastructure", logo:"https://www.google.com/s2/favicons?domain=replicate.com&sz=128", color:"#ffffff", badge:"Model Hub", price:"Usage-based", score:8.4, trend:79, difficulty:"Advanced", platforms:["API","Cloud"], flags:["Models","Image","Video","API"], best:["running models","image/video APIs","experimentation"], limits:["Costs scale with usage","Quality depends on model"], verdict:"A practical playground and API layer for running many AI models without setting up GPUs.", useCase:"Best for prototyping with hosted AI models." },
  { id:"fal", name:"fal.ai", company:"fal", category:"Infrastructure", logo:"https://www.google.com/s2/favicons?domain=fal.ai&sz=128", color:"#ffffff", badge:"Media API", price:"Usage-based", score:8.5, trend:83, difficulty:"Advanced", platforms:["API","Cloud"], flags:["Image","Video","Fast","API"], best:["image APIs","video generation","creative apps"], limits:["Developer-first","Usage can become expensive"], verdict:"A strong backend choice for fast media generation apps.", useCase:"Best for developers building creative AI products." },
  { id:"langchain", name:"LangChain", company:"LangChain", category:"Agents", logo:"https://www.google.com/s2/favicons?domain=langchain.com&sz=128", color:"#00e6be", badge:"Agent Stack", price:"Open source / Cloud", score:8.7, trend:86, difficulty:"Expert", platforms:["Python","JS","Cloud"], flags:["Agents","RAG","Open source","Framework"], best:["agent apps","RAG pipelines","LLM orchestration"], limits:["Can be complex","Requires engineering discipline"], verdict:"A powerful framework when you need more than a simple prompt wrapper.", useCase:"Best for technical teams building agentic AI systems." },
  { id:"pinecone", name:"Pinecone", company:"Pinecone", category:"Data", logo:"https://www.google.com/s2/favicons?domain=pinecone.io&sz=128", color:"#10b981", badge:"Vector DB", price:"Free / Paid", score:8.6, trend:76, difficulty:"Advanced", platforms:["API","Cloud"], flags:["Vector DB","RAG","Search","Enterprise"], best:["semantic search","RAG","embeddings at scale"], limits:["Infrastructure layer, not an AI app","Requires architecture"], verdict:"A mature option for production-grade vector search and RAG.", useCase:"Best for teams building retrieval systems." },
  { id:"chroma", name:"Chroma", company:"Chroma", category:"Data", logo:"https://www.google.com/s2/favicons?domain=trychroma.com&sz=128", color:"#a855f7", badge:"Open Source", price:"Open source / Cloud", score:8.2, trend:72, difficulty:"Advanced", platforms:["Python","Cloud","Local"], flags:["Vector DB","Open source","RAG"], best:["local RAG","prototypes","developer workflows"], limits:["Less turnkey than SaaS products","Requires dev skills"], verdict:"A developer-friendly vector database for quick RAG experiments and local workflows.", useCase:"Best for local or prototype RAG stacks." },
  { id:"weaviate", name:"Weaviate", company:"Weaviate", category:"Data", logo:"https://www.google.com/s2/favicons?domain=weaviate.io&sz=128", color:"#22c55e", badge:"Vector Search", price:"Open source / Cloud", score:8.4, trend:74, difficulty:"Advanced", platforms:["Cloud","Self-host","API"], flags:["Vector DB","Hybrid search","Open source"], best:["enterprise RAG","hybrid search","semantic apps"], limits:["Needs planning","Not a consumer tool"], verdict:"A serious vector database for teams that want control and production options.", useCase:"Best for scalable semantic search." },
  { id:"phind", name:"Phind", company:"Phind", category:"Research", logo:"https://www.google.com/s2/favicons?domain=phind.com&sz=128", color:"#3b82f6", badge:"Dev Search", price:"Free / Pro", score:8.3, trend:75, difficulty:"Intermediate", platforms:["Web"], flags:["Search","Coding","Sources"], best:["developer questions","technical research","debugging help"], limits:["More niche than Perplexity","Not a full IDE"], verdict:"A useful AI search engine for developers who want quick technical answers.", useCase:"Best for coding-focused web research." },
  { id:"poe", name:"Poe", company:"Quora", category:"Chatbots", logo:"https://www.google.com/s2/favicons?domain=poe.com&sz=128", color:"#ffffff", badge:"Multi-model", price:"Free / Subscription", score:8.2, trend:73, difficulty:"Easy", platforms:["Web","Mobile"], flags:["Multiple models","Bots","Consumer"], best:["trying models","chatbots","quick comparisons"], limits:["Not the deepest pro workflow","Depends on model access"], verdict:"A convenient way to test many AI models from one chat interface.", useCase:"Best for users comparing model personalities." },
  { id:"you", name:"You.com", company:"You.com", category:"Research", logo:"https://www.google.com/s2/favicons?domain=you.com&sz=128", color:"#20b8cd", badge:"AI Search", price:"Free / Pro", score:8.1, trend:70, difficulty:"Easy", platforms:["Web"], flags:["Search","Sources","Chat"], best:["web answers","research","general search"], limits:["Less dominant than Perplexity","Quality varies by query"], verdict:"A solid AI search alternative with useful web-focused workflows.", useCase:"Best for everyday AI search." },
  { id:"devin", name:"Devin", company:"Cognition", category:"Coding", logo:"https://www.google.com/s2/favicons?domain=cognition.ai&sz=128", color:"#f59e0b", badge:"Agentic Dev", price:"Paid / Team", score:8.8, trend:88, difficulty:"Expert", platforms:["Web","Cloud"], flags:["Autonomous agent","Coding","Team"], best:["software tasks","agentic coding","engineering teams"], limits:["Requires supervision","Not for casual users"], verdict:"A high-ambition coding agent for teams that want autonomous software work, with human review.", useCase:"Best for agentic software engineering experiments." },
  { id:"augment", name:"Augment Code", company:"Augment", category:"Coding", logo:"https://www.google.com/s2/favicons?domain=augmentcode.com&sz=128", color:"#3b82f6", badge:"Enterprise Code", price:"Team / Enterprise", score:8.6, trend:80, difficulty:"Advanced", platforms:["IDE","Enterprise"], flags:["Codebase context","Team","Enterprise"], best:["large codebases","engineering teams","context-aware coding"], limits:["Not aimed at beginners","Pricing may be enterprise-first"], verdict:"A strong option when team-scale codebase understanding matters.", useCase:"Best for professional engineering organizations." },
  { id:"tabnine", name:"Tabnine", company:"Tabnine", category:"Coding", logo:"https://www.google.com/s2/favicons?domain=tabnine.com&sz=128", color:"#a855f7", badge:"Private Code", price:"Free / Pro / Enterprise", score:8.1, trend:68, difficulty:"Intermediate", platforms:["IDE","Enterprise"], flags:["Autocomplete","Privacy","Team"], best:["code completion","private deployments","enterprise coding"], limits:["Less agentic than newer tools","May feel conservative"], verdict:"A privacy-conscious coding assistant focused on completions and enterprise control.", useCase:"Best for teams with stricter code privacy needs." },
  { id:"windsurf", name:"Windsurf", company:"Codeium", category:"Coding", logo:"https://cdn.simpleicons.org/codeium/09B6A2", color:"#09b6a2", badge:"AI IDE", price:"Free / Pro / Team", score:8.9, trend:91, difficulty:"Intermediate", platforms:["Desktop","IDE"], flags:["AI IDE","Agents","Codebase"], best:["AI coding","project-wide edits","fast developer workflows"], limits:["Fast-changing product","Needs code review"], verdict:"One of the most competitive AI IDEs for developers who want an integrated coding assistant.", useCase:"Best for modern AI-assisted software development." },
  { id:"continue", name:"Continue", company:"Continue", category:"Coding", logo:"https://www.google.com/s2/favicons?domain=continue.dev&sz=128", color:"#3b82f6", badge:"Open Source", price:"Open source", score:8.2, trend:74, difficulty:"Advanced", platforms:["VS Code","JetBrains","Local"], flags:["Open source","Local models","IDE"], best:["custom coding assistants","local LLMs","team control"], limits:["Requires configuration","Less polished than Cursor"], verdict:"A strong open-source path for teams that want control over their AI coding workflow.", useCase:"Best for customizable IDE assistants." },
  { id:"aider", name:"Aider", company:"Open Source", category:"Coding", logo:"https://www.google.com/s2/favicons?domain=aider.chat&sz=128", color:"#00e6be", badge:"CLI Coding", price:"Open source", score:8.1, trend:76, difficulty:"Advanced", platforms:["CLI","Local","Git"], flags:["Open source","Terminal","Git"], best:["terminal coding","repo edits","lightweight workflows"], limits:["CLI-first","Needs developer comfort"], verdict:"A practical CLI coding assistant for developers who prefer terminal workflows.", useCase:"Best for repo edits from the command line." },
  { id:"crewai", name:"CrewAI", company:"CrewAI", category:"Agents", logo:"https://www.google.com/s2/favicons?domain=crewai.com&sz=128", color:"#f59e0b", badge:"Multi-agent", price:"Open source / Cloud", score:8.0, trend:78, difficulty:"Expert", platforms:["Python","Cloud"], flags:["Agents","Multi-agent","Framework"], best:["agent teams","research workflows","automation prototypes"], limits:["Needs technical design","Can be overkill"], verdict:"A useful framework for experimenting with multi-agent systems.", useCase:"Best for developers building coordinated AI agents." },
  { id:"zapieragents", name:"Zapier Agents", company:"Zapier", category:"Agents", logo:"https://cdn.simpleicons.org/zapier/FF4A00", color:"#ff4a00", badge:"No-code Agents", price:"Paid", score:8.2, trend:79, difficulty:"Beginner", platforms:["Web","SaaS"], flags:["Agents","No-code","Integrations"], best:["business automations","SaaS workflows","non-technical users"], limits:["Less flexible than custom code","Pricing depends on usage"], verdict:"A natural option for teams that already automate business workflows with Zapier.", useCase:"Best for no-code AI agents connected to SaaS tools." },
  { id:"perplexitymax", name:"Perplexity Max", company:"Perplexity", category:"Research", logo:"https://cdn.simpleicons.org/perplexity/20B8CD", color:"#20b8cd", badge:"Premium Search", price:"Premium", score:9.0, trend:92, difficulty:"Easy", platforms:["Web","Mobile"], flags:["Research","Sources","Deep Research"], best:["research","market scans","sourced answers","executive summaries"], limits:["Subscription cost","Not a creative suite"], verdict:"A premium research workflow for users who want fast, sourced answers with less manual searching.", useCase:"Best for high-volume research and decision support." },
  { id:"googleaio", name:"Google AI Overviews", company:"Google", category:"Research", logo:"https://cdn.simpleicons.org/google/4285F4", color:"#4285f4", badge:"Search Layer", price:"Free", score:8.0, trend:95, difficulty:"Easy", platforms:["Search","Web","Mobile"], flags:["Search","Consumer","Fresh info"], best:["quick answers","search discovery","general users"], limits:["Not a dedicated research workspace","Accuracy must be checked"], verdict:"A major AI layer for mainstream search, useful but not a replacement for deep research tools.", useCase:"Best for casual search and discovery." },
  { id:"copilot365", name:"Microsoft 365 Copilot", company:"Microsoft", category:"Productivity", logo:"https://cdn.simpleicons.org/microsoft/00A4EF", color:"#00a4ef", badge:"Enterprise", price:"Microsoft 365 add-on", score:8.8, trend:86, difficulty:"Beginner", platforms:["Microsoft 365","Teams","Office"], flags:["Enterprise","Documents","Meetings","Team"], best:["Office workflows","enterprise productivity","meetings","documents"], limits:["Best inside Microsoft ecosystem","Business pricing"], verdict:"The strongest AI layer for teams already living inside Microsoft 365.", useCase:"Best for enterprise productivity and Office workflows." },
  { id:"granola", name:"Granola", company:"Granola", category:"Meetings", logo:"https://www.google.com/s2/favicons?domain=granola.ai&sz=128", color:"#d97757", badge:"Meeting Notes", price:"Free / Pro", score:8.4, trend:82, difficulty:"Easy", platforms:["Mac","Meetings"], flags:["Notes","Meetings","Personal productivity"], best:["meeting notes","executive summaries","personal workflows"], limits:["Platform availability may vary","Meeting-specific"], verdict:"A polished meeting note tool for people who want lightweight, useful summaries.", useCase:"Best for personal meeting intelligence." },
  { id:"fireflies", name:"Fireflies.ai", company:"Fireflies", category:"Meetings", logo:"https://www.google.com/s2/favicons?domain=fireflies.ai&sz=128", color:"#f59e0b", badge:"Meetings", price:"Free / Pro / Business", score:8.2, trend:76, difficulty:"Easy", platforms:["Web","Meetings","Integrations"], flags:["Transcription","Search","Team"], best:["meeting recording","transcription","team knowledge"], limits:["Accuracy depends on audio","Privacy policies matter"], verdict:"A capable meeting intelligence tool for teams that need searchable call records.", useCase:"Best for meeting transcription and follow-up." },
  { id:"tlrdv", name:"tl;dv", company:"tl;dv", category:"Meetings", logo:"https://www.google.com/s2/favicons?domain=tldv.io&sz=128", color:"#3b82f6", badge:"Call Recaps", price:"Free / Pro / Business", score:8.0, trend:70, difficulty:"Easy", platforms:["Meetings","Web"], flags:["Recording","Summaries","Team"], best:["sales calls","user interviews","meeting highlights"], limits:["Meeting-specific","May overlap with other tools"], verdict:"A practical recorder and summarizer for teams that live in video calls.", useCase:"Best for call highlights and searchable recordings." },
  { id:"descript", name:"Descript", company:"Descript", category:"Audio", logo:"https://www.google.com/s2/favicons?domain=descript.com&sz=128", color:"#6366f1", badge:"Editing", price:"Free / Paid", score:8.5, trend:79, difficulty:"Beginner", platforms:["Desktop","Web"], flags:["Podcast","Video","Transcription","Editing"], best:["podcasts","talking videos","repurposing","transcription"], limits:["Less focused on generation","Heavy editing needs practice"], verdict:"A very practical editor for audio/video content workflows.", useCase:"Best for editing podcasts and talking-head videos." },
  { id:"playht", name:"PlayHT", company:"PlayHT", category:"Audio", logo:"https://www.google.com/s2/favicons?domain=play.ht&sz=128", color:"#ef4444", badge:"Voice AI", price:"Free / Paid", score:8.1, trend:70, difficulty:"Easy", platforms:["Web","API"], flags:["TTS","Voice","API"], best:["voiceovers","voice APIs","audio content"], limits:["Quality varies by voice","Rights must be handled"], verdict:"A solid voice generation alternative with API options.", useCase:"Best for AI voiceovers and TTS workflows." },
  { id:"murf", name:"Murf AI", company:"Murf", category:"Audio", logo:"https://www.google.com/s2/favicons?domain=murf.ai&sz=128", color:"#3b82f6", badge:"Voiceover", price:"Free / Paid", score:8.0, trend:68, difficulty:"Easy", platforms:["Web"], flags:["TTS","Voiceover","Business"], best:["presentations","voiceovers","training videos"], limits:["Less cutting-edge than ElevenLabs","Creative range varies"], verdict:"A practical voiceover tool for business and presentation content.", useCase:"Best for quick professional voiceovers." },
  { id:"krea", name:"Krea AI", company:"Krea", category:"Image", logo:"https://www.google.com/s2/favicons?domain=krea.ai&sz=128", color:"#a855f7", badge:"Creative", price:"Free / Pro", score:8.6, trend:86, difficulty:"Beginner", platforms:["Web"], flags:["Image","Realtime","Creative"], best:["concept art","visual exploration","creative iterations"], limits:["Not always predictable","Final quality depends on workflow"], verdict:"A fast and creative image workflow for visual exploration.", useCase:"Best for designers and creators exploring styles." },
  { id:"magnifi", name:"Magnific AI", company:"Magnific", category:"Image", logo:"https://www.google.com/s2/favicons?domain=magnific.ai&sz=128", color:"#a855f7", badge:"Upscale", price:"Paid", score:8.4, trend:75, difficulty:"Intermediate", platforms:["Web"], flags:["Upscale","Image enhancement","Creative"], best:["upscaling","image enhancement","detail generation"], limits:["Can hallucinate details","Paid workflow"], verdict:"A premium image enhancement tool when detail and upscale quality matter.", useCase:"Best for improving and upscaling AI images." },
  { id:"topaz", name:"Topaz Labs", company:"Topaz", category:"Image", logo:"https://www.google.com/s2/favicons?domain=topazlabs.com&sz=128", color:"#3b82f6", badge:"Enhance", price:"Paid", score:8.5, trend:72, difficulty:"Intermediate", platforms:["Desktop"], flags:["Upscale","Video enhance","Image enhance"], best:["photo enhancement","video upscale","professional cleanup"], limits:["Not a generator-first tool","Desktop workflow"], verdict:"A strong enhancement suite for creators who need cleaner final assets.", useCase:"Best for upscaling and restoring images/video." },
  { id:"seoai", name:"Frase", company:"Frase", category:"SEO", logo:"https://www.google.com/s2/favicons?domain=frase.io&sz=128", color:"#10b981", badge:"SEO Content", price:"Paid", score:8.0, trend:67, difficulty:"Intermediate", platforms:["Web"], flags:["SEO","Content briefs","SERP"], best:["content briefs","SEO writing","topic research"], limits:["Needs editorial judgment","Less broad than full SEO suites"], verdict:"A useful SEO content workflow for writers and marketers.", useCase:"Best for SEO briefs and content optimization." },
  { id:"ahrefs", name:"Ahrefs", company:"Ahrefs", category:"SEO", logo:"https://cdn.simpleicons.org/ahrefs/FF6B00", color:"#ff6b00", badge:"SEO Suite", price:"Paid", score:8.8, trend:78, difficulty:"Intermediate", platforms:["Web"], flags:["SEO","Backlinks","Keywords","Content"], best:["keyword research","backlinks","competitor analysis"], limits:["Can be expensive","Not an AI-only tool"], verdict:"One of the strongest SEO data platforms, increasingly useful alongside AI content workflows.", useCase:"Best for SEO research and competitive analysis." },
  { id:"grammarly", name:"Grammarly", company:"Grammarly", category:"Writing", logo:"https://cdn.simpleicons.org/grammarly/15C39A", color:"#15c39a", badge:"Writing Assistant", price:"Free / Pro / Business", score:8.2, trend:70, difficulty:"Easy", platforms:["Web","Desktop","Browser"], flags:["Writing","Grammar","Team"], best:["editing","tone","business writing"], limits:["Less creative than LLM assistants","Best for refinement"], verdict:"A dependable writing assistant for clarity, correctness and tone polishing.", useCase:"Best for editing and professional writing quality." },
  { id:"writesonic", name:"Writesonic", company:"Writesonic", category:"Marketing", logo:"https://www.google.com/s2/favicons?domain=writesonic.com&sz=128", color:"#4f46e5", badge:"Marketing", price:"Free / Paid", score:8.0, trend:69, difficulty:"Beginner", platforms:["Web"], flags:["SEO","Marketing","Writing"], best:["blog drafts","ads","landing pages","SEO content"], limits:["Needs editing","Not as nuanced as Claude"], verdict:"A practical marketing content generator for fast drafts and campaigns.", useCase:"Best for quick marketing and SEO content." },
  { id:"beautifulai", name:"Beautiful.ai", company:"Beautiful.ai", category:"Presentation", logo:"https://www.google.com/s2/favicons?domain=beautiful.ai&sz=128", color:"#20b8cd", badge:"Deck Design", price:"Paid", score:8.1, trend:66, difficulty:"Easy", platforms:["Web"], flags:["Slides","Design","Business"], best:["business decks","clean layouts","team presentations"], limits:["Less flexible than custom design","Not a general AI assistant"], verdict:"A polished deck builder for teams that need professional slides quickly.", useCase:"Best for clean business presentations." },
  { id:"slidesai", name:"SlidesAI", company:"SlidesAI", category:"Presentation", logo:"https://www.google.com/s2/favicons?domain=slidesai.io&sz=128", color:"#3b82f6", badge:"Slides", price:"Free / Paid", score:7.8, trend:64, difficulty:"Easy", platforms:["Google Slides","Web"], flags:["Slides","Presentation","Fast"], best:["quick slide drafts","education","simple decks"], limits:["Design quality can be basic","Needs editing"], verdict:"Useful for turning text into quick slide drafts without much friction.", useCase:"Best for fast first-draft presentations." },
  { id:"scite", name:"Scite", company:"Scite", category:"Research", logo:"https://www.google.com/s2/favicons?domain=scite.ai&sz=128", color:"#3b82f6", badge:"Academic", price:"Paid", score:8.3, trend:70, difficulty:"Intermediate", platforms:["Web"], flags:["Academic","Citations","Research"], best:["paper discovery","citation context","literature review"], limits:["Academic focus","Subscription may be needed"], verdict:"A strong research companion for understanding how papers are cited.", useCase:"Best for academic research validation." },
  { id:"elicit", name:"Elicit", company:"Elicit", category:"Research", logo:"https://www.google.com/s2/favicons?domain=elicit.com&sz=128", color:"#10b981", badge:"Research", price:"Free / Paid", score:8.2, trend:72, difficulty:"Intermediate", platforms:["Web"], flags:["Papers","Research","Summaries"], best:["literature reviews","paper summaries","research workflows"], limits:["Academic scope","Sources still need checking"], verdict:"A useful AI research tool for summarizing and navigating scientific papers.", useCase:"Best for literature review workflows." },
  { id:"consensus", name:"Consensus", company:"Consensus", category:"Research", logo:"https://www.google.com/s2/favicons?domain=consensus.app&sz=128", color:"#3b82f6", badge:"Evidence", price:"Free / Paid", score:8.1, trend:71, difficulty:"Easy", platforms:["Web"], flags:["Research","Evidence","Citations"], best:["evidence-based answers","science questions","quick literature checks"], limits:["Academic focus","Does not replace full reading"], verdict:"A good tool for quickly checking what research says about a question.", useCase:"Best for evidence-backed answers." },
  { id:"harvey", name:"Harvey", company:"Harvey", category:"Legal", logo:"https://www.google.com/s2/favicons?domain=harvey.ai&sz=128", color:"#ffffff", badge:"Legal AI", price:"Enterprise", score:8.5, trend:80, difficulty:"Expert", platforms:["Enterprise"], flags:["Legal","Enterprise","Documents"], best:["legal workflows","document analysis","law firms"], limits:["Enterprise-only orientation","Sensitive domain requires review"], verdict:"A serious vertical AI product for legal teams, not a casual assistant.", useCase:"Best for enterprise legal AI workflows." },
  { id:"intercom", name:"Intercom Fin", company:"Intercom", category:"Customer Support", logo:"https://cdn.simpleicons.org/intercom/FFFFFF", color:"#00a4ef", badge:"Support AI", price:"Paid / Enterprise", score:8.4, trend:78, difficulty:"Intermediate", platforms:["SaaS","Web"], flags:["Support","Chatbot","Knowledge base"], best:["customer support","help centers","ticket deflection"], limits:["Best inside Intercom ecosystem","Needs support content quality"], verdict:"A strong customer-support AI when your knowledge base and workflows are mature.", useCase:"Best for AI customer support at scale." },
  { id:"zendeskai", name:"Zendesk AI", company:"Zendesk", category:"Customer Support", logo:"https://cdn.simpleicons.org/zendesk/FFFFFF", color:"#10b981", badge:"Support", price:"Paid / Enterprise", score:8.2, trend:75, difficulty:"Intermediate", platforms:["SaaS","Enterprise"], flags:["Support","Tickets","Enterprise"], best:["ticket routing","support automation","customer service"], limits:["Zendesk ecosystem","Requires setup and data"], verdict:"A logical AI layer for companies already running support on Zendesk.", useCase:"Best for enterprise support automation." }


];
const CATEGORIES = ["Agents", "App Builder", "Audio", "Automation", "Avatar", "Chatbots", "Coding", "Customer Support", "Data", "Design", "Image", "Infrastructure", "Legal", "Local AI", "Marketing", "Meetings", "Models", "Presentation", "Productivity", "Research", "SEO", "Video", "Writing"];

const T = {
  fr: {
    backHome: "Retour à l'accueil",
    eyebrow: "AI Tools Directory",
    title: "Le hub IA ultime",
    accent: "Neuriflux",
    subtitle: "Explore, filtre, compare et comprends les meilleurs outils IA du moment depuis une seule page. Scores, logos, cas d’usage, limites, plateformes, API, open source, prix et alternatives : tout est centralisé.",
    search: "Rechercher une IA, une catégorie, un cas d’usage...",
    all: "Toutes",
    price: "Prix",
    sort: "Tri",
    free: "Gratuit / freemium",
    paid: "Payant",
    enterprise: "Entreprise",
    score: "Score",
    trending: "Tendance",
    name: "Nom",
    results: "outils trouvés",
    compare: "Comparer",
    clear: "Réinitialiser",
    selected: "sélectionnés",
    bestFor: "Idéal pour",
    limits: "Limites",
    platforms: "Plateformes",
    details: "Détails",
    close: "Fermer",
    topPicks: "Sélections expertes",
    categories: "Catégories couvertes",
    methodology: "Méthode Neuriflux",
    methodText: "Le score combine qualité de sortie, maturité produit, clarté du pricing, profondeur de l’écosystème, utilité réelle, accessibilité, intégrations, confidentialité et vitesse d’adoption. Il ne s’agit pas d’un classement sponsorisé.",
    noResults: "Aucun outil ne correspond aux filtres.",
    updated: "Base enrichie 2026",
    quickCompare: "Comparaison rapide",
    choose: "Ajouter",
    remove: "Retirer",
    verdict: "Verdict Neuriflux",
    useCase: "Meilleur usage",
    footerTitle: "Tu ne sais pas quoi choisir ?",
    footerText: "Utilise les filtres, compare trois outils et lis les verdicts. Cette page est pensée comme la base centrale de Neuriflux pour choisir une IA sans perdre des heures.",
    langLabel: "Langue",
    logoNote: "Logos officiels ou favicons vérifiés avec fallback Neuriflux.",
    coverageTitle: "Ce que cette base couvre",
    coverageText: "Assistants, modèles, agents, code, image, vidéo, audio, SEO, recherche, automatisation, support client, data et infrastructure IA. Impossible de lister littéralement chaque micro-outil existant, mais cette page vise les outils réellement utiles, recherchés et maintenables.",
  },
  en: {
    backHome: "Back to homepage",
    eyebrow: "AI Tools Directory",
    title: "The ultimate",
    accent: "Neuriflux AI directory",
    subtitle: "Explore, filter, compare and understand the best AI tools from one single page. Scores, logos, use cases, limits, platforms, API, open source, pricing and alternatives are all centralized.",
    search: "Search an AI, category, use case...",
    all: "All",
    price: "Pricing",
    sort: "Sort",
    free: "Free / freemium",
    paid: "Paid",
    enterprise: "Enterprise",
    score: "Score",
    trending: "Trending",
    name: "Name",
    results: "tools found",
    compare: "Compare",
    clear: "Reset",
    selected: "selected",
    bestFor: "Best for",
    limits: "Limits",
    platforms: "Platforms",
    details: "Details",
    close: "Close",
    topPicks: "Expert picks",
    categories: "Covered categories",
    methodology: "Neuriflux methodology",
    methodText: "The score combines output quality, product maturity, pricing clarity, ecosystem depth, real-world utility, accessibility, integrations, privacy and adoption velocity. This is not a sponsored ranking.",
    noResults: "No tool matches your filters.",
    updated: "Expanded 2026 database",
    quickCompare: "Quick comparison",
    choose: "Add",
    remove: "Remove",
    verdict: "Neuriflux verdict",
    useCase: "Best use case",
    footerTitle: "Still not sure what to choose?",
    footerText: "Use filters, compare three tools and read the verdicts. This page is designed as Neuriflux's central database for choosing AI tools without wasting hours.",
    langLabel: "Language",
    logoNote: "Official logos or verified favicons with Neuriflux fallback.",
    coverageTitle: "What this database covers",
    coverageText: "Assistants, models, agents, coding, image, video, audio, SEO, research, automation, customer support, data and AI infrastructure. It cannot literally list every tiny AI tool ever created, but it focuses on tools that are useful, searched and worth maintaining.",
  },
} as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);
  return reduced;
}

function useDebouncedValue<TValue>(value: TValue, delay = 120) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    const move = (event: PointerEvent) => {
      if (!ref.current) return;
      ref.current.style.setProperty("--x", `${event.clientX}px`);
      ref.current.style.setProperty("--y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced]);
  if (reduced) return null;
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

function scoreToPercent(score: number) {
  return Math.max(0, Math.min(100, Math.round(score * 10)));
}

function formatUpdated(lang: Lang) {
  return lang === "fr" ? "Vérifié cette semaine" : "Verified this week";
}

function isFree(tool: Tool) {
  const price = tool.price.toLowerCase();
  return price.includes("free") || price.includes("open source") || price.includes("open /") || price === "free";
}

function isEnterprise(tool: Tool) {
  const hay = `${tool.price} ${tool.flags.join(" ")} ${tool.badge}`.toLowerCase();
  return hay.includes("enterprise") || hay.includes("business") || hay.includes("team");
}

function hasSignal(tool: Tool, signal: string) {
  const hay = `${tool.name} ${tool.company} ${tool.category} ${tool.price} ${tool.badge} ${tool.difficulty} ${tool.platforms.join(" ")} ${tool.flags.join(" ")} ${tool.best.join(" ")} ${tool.limits.join(" ")} ${tool.verdict} ${tool.useCase}`.toLowerCase();
  return hay.includes(signal.toLowerCase());
}

function toolSlug(tool: Tool) {
  return tool.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

function officialUrl(tool: Tool) {
  const urls: Record<string, string> = {
    chatgpt: "https://chatgpt.com/",
    gpt5: "https://openai.com/",
    gpt4o: "https://openai.com/",
    openaiapi: "https://platform.openai.com/",
    claude: "https://claude.ai/",
    claudeopus: "https://claude.ai/",
    claudecode: "https://www.anthropic.com/claude-code",
    cursor: "https://cursor.com/",
    cline: "https://cline.bot/",
    kilocode: "https://kilocode.ai/",
    copilot: "https://github.com/features/copilot",
    perplexity: "https://www.perplexity.ai/",
    gemini: "https://gemini.google.com/",
    midjourney: "https://www.midjourney.com/",
    runway: "https://runwayml.com/",
    elevenlabs: "https://elevenlabs.io/",
    n8n: "https://n8n.io/",
    make: "https://www.make.com/",
    zapier: "https://zapier.com/",
  };
  return urls[tool.id] ?? `https://www.google.com/search?q=${encodeURIComponent(`${tool.name} AI official`)}`;
}

function reviewUrl(tool: Tool, lang: Lang) {
  const slug = `${toolSlug(tool)}-review-2026`;
  return `/${lang}/blog/${slug}`;
}

function compareUrl(tool: Tool, lang: Lang) {
  const byCategory: Record<string, string> = {
    Coding: "claude-code-vs-cline-vs-kilo-code-2026",
    Video: "kling-vs-veo-vs-runway-2026",
    Audio: "elevenlabs-vs-playht-vs-cartesia-2026",
    Automation: "n8n-vs-make-vs-zapier-2026",
    SEO: "semrush-vs-ahrefs-vs-surfer-seo-2026",
    Chatbots: "chatgpt-vs-claude-vs-gemini-2026",
    Models: "chatgpt-vs-claude-vs-gemini-2026",
    Image: "midjourney-vs-flux-vs-ideogram-2026",
  };
  return `/${lang}/comparatifs/${byCategory[tool.category] ?? "best-ai-tools-2026"}`;
}

function buildToolProfile(tool: Tool) {
  const quality = scoreToPercent(tool.score);
  const adoption = Math.max(45, Math.min(100, tool.trend));
  const access = isFree(tool) ? 94 : isEnterprise(tool) ? 68 : 78;
  const ecosystem = Math.min(100, 52 + tool.platforms.length * 7 + tool.flags.length * 5 + Math.round(tool.score * 2));
  const privacy = hasSignal(tool, "local") || hasSignal(tool, "open source") || hasSignal(tool, "self-host") ? 90 : hasSignal(tool, "enterprise") ? 82 : 70;
  const api = hasSignal(tool, "api") ? 96 : hasSignal(tool, "integrations") || hasSignal(tool, "automation") ? 82 : 58;
  const community = Math.min(100, Math.round((adoption + ecosystem) / 2));
  const maturity = Math.min(100, Math.round((quality + ecosystem + adoption) / 3));
  return { quality, adoption, access, ecosystem, privacy, api, community, maturity };
}

function certification(tool: Tool) {
  if (tool.score >= 9.4) return "Neuriflux Certified+";
  if (tool.score >= 8.8) return "Neuriflux Certified";
  if (tool.trend >= 88) return "Trending Watch";
  return "Listed";
}

function Logo({ tool, size = 42 }: { tool: Tool; size?: number }) {
  const meta = getLogoMeta(tool);
  const style: CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    borderColor: `${tool.color}55`,
    background: `radial-gradient(circle at 30% 18%, rgba(255,255,255,.22), transparent 34%), linear-gradient(145deg, ${meta.bg}, ${tool.color}16 75%)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,.16), 0 14px 34px ${tool.color}20, 0 0 0 1px rgba(255,255,255,.035)`,
  };
  return (
    <span className="logo-box luxury-logo" style={style} title={tool.name} aria-label={`${tool.name} logo`}>
      <span className="logo-shine" aria-hidden="true" />
      <span className="logo-fallback" style={{ color: tool.color }}>{meta.mark ?? tool.name.slice(0, 2).toUpperCase()}</span>
      <span className="logo-img" style={{ backgroundImage: `url(${meta.src})` }} aria-hidden="true" />
    </span>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const deg = Math.round((score / 10) * 360);
  return (
    <div className="score-ring" style={{ background: `conic-gradient(${color} ${deg}deg, rgba(255,255,255,.08) 0deg)` }}>
      <div>{score.toFixed(1)}</div>
    </div>
  );
}

function Pill({ children, color, active = false }: { children: ReactNode; color?: string; active?: boolean }) {
  return (
    <span
      className={active ? "pill active" : "pill"}
      style={{
        borderColor: color ? `${color}38` : undefined,
        color: color ?? undefined,
        background: color ? `${color}${active ? "22" : "10"}` : undefined,
      }}
    >
      {children}
    </span>
  );
}

function SignalBars({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const profile = buildToolProfile(tool);
  const metrics = [
    ["Quality", profile.quality],
    ["Access", profile.access],
    ["Privacy", profile.privacy],
    ["API", profile.api],
    ["Ecosystem", profile.ecosystem],
    ["Adoption", profile.adoption],
  ] as const;
  return (
    <div className={compact ? "signal-bars compact" : "signal-bars"}>
      {metrics.map(([label, value]) => (
        <div key={label} className="signal-row">
          <span>{label}</span>
          <div><i style={{ width: `${value}%`, background: `linear-gradient(90deg, ${tool.color}, rgba(255,255,255,.55))` }} /></div>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}

function LuxuryScore({ tool }: { tool: Tool }) {
  return (
    <div className="lux-score" style={{ borderColor: `${tool.color}33`, background: `${tool.color}0d` }}>
      <span>Neuriflux Score™</span>
      <strong style={{ color: tool.color }}>{tool.score.toFixed(1)}</strong>
    </div>
  );
}

function IntelligenceCard({ tool, lang }: { tool: Tool; lang: Lang }) {
  const profile = buildToolProfile(tool);
  const t = T[lang];
  return (
    <div className="intelligence-card">
      <div className="intel-head">
        <Logo tool={tool} size={54} />
        <div>
          <Pill color={tool.color}>{certification(tool)}</Pill>
          <h3>{tool.name}</h3>
          <p>{tool.company} · {tool.category}</p>
        </div>
        <ScoreRing score={tool.score} color={tool.color} />
      </div>
      <SignalBars tool={tool} />
      <div className="intel-grid">
        <div><b>{profile.maturity}</b><span>Maturity</span></div>
        <div><b>{hasSignal(tool, "MCP") ? "Yes" : "—"}</b><span>MCP</span></div>
        <div><b>{hasSignal(tool, "Local") ? "Yes" : "No"}</b><span>Local</span></div>
        <div><b>{hasSignal(tool, "API") ? "Yes" : "No"}</b><span>API</span></div>
      </div>
      <p className="intel-verdict"><strong>{t.verdict}:</strong> {tool.verdict}</p>
    </div>
  );
}

function RelatedTools({ tool, lang, openTool }: { tool: Tool; lang: Lang; openTool: (id: string) => void }) {
  const related = useMemo(() => {
    return TOOLS
      .filter((candidate) => candidate.id !== tool.id)
      .map((candidate) => {
        let score = 0;
        if (candidate.category === tool.category) score += 4;
        score += candidate.flags.filter((flag) => tool.flags.includes(flag)).length;
        score += candidate.platforms.filter((platform) => tool.platforms.includes(platform)).length * 0.5;
        return { candidate, score };
      })
      .sort((a, b) => b.score - a.score || b.candidate.score - a.candidate.score)
      .slice(0, 4)
      .map((item) => item.candidate);
  }, [tool]);
  return (
    <div className="related-tools">
      {related.map((item) => (
        <button key={item.id} type="button" className="related-pill" onClick={() => openTool(item.id)}>
          <Logo tool={item} size={24} />
          <span>{item.name}</span>
        </button>
      ))}
      <Link href={`/${lang}/aifinder`} className="related-pill ai-finder-pill">AI Finder →</Link>
    </div>
  );
}

function ToolCard({ tool, lang, selected, favorite, toggle, toggleFavorite, open }: { tool: Tool; lang: Lang; selected: boolean; favorite: boolean; toggle: () => void; toggleFavorite: () => void; open: () => void }) {
  const t = T[lang];
  const profile = buildToolProfile(tool);
  return (
    <article className={favorite ? "tool-card is-favorite" : "tool-card"} style={{ borderColor: selected ? `${tool.color}55` : undefined }}>
      <div className="card-topline" style={{ background: `linear-gradient(90deg, ${tool.color}, transparent)` }} />
      <div className="tool-head">
        <Logo tool={tool} />
        <div className="tool-title">
          <div className="tool-name">{tool.name}</div>
          <div className="tool-company">{tool.company} · {tool.category}</div>
        </div>
        <div className="tool-right">
          <button
            type="button"
            className={favorite ? "fav-btn active" : "fav-btn"}
            onClick={(event) => { event.stopPropagation(); toggleFavorite(); }}
            aria-label={favorite ? (lang === "fr" ? "Retirer des favoris" : "Remove from favorites") : (lang === "fr" ? "Ajouter aux favoris" : "Add to favorites")}
            aria-pressed={favorite}
            title={favorite ? (lang === "fr" ? "Retirer des favoris" : "Remove from favorites") : (lang === "fr" ? "Sauvegarder dans mes favoris" : "Save to favorites")}
          >
            <span className="fav-heart" aria-hidden="true">{favorite ? "♥" : "♡"}</span>
            <span className="fav-copy">{favorite ? (lang === "fr" ? "Stack" : "Stack") : (lang === "fr" ? "Favori" : "Save")}</span>
            <span className="fav-tooltip" aria-hidden="true">{favorite ? (lang === "fr" ? "Dans ta shortlist" : "In your shortlist") : (lang === "fr" ? "Ajouter à ta stack" : "Add to your stack")}</span>
          </button>
          <ScoreRing score={tool.score} color={tool.color} />
        </div>
      </div>

      <div className="badge-row">
        <Pill color={tool.color}>★ {tool.badge}</Pill>
        <Pill color={tool.score >= 9.2 ? "#00e6be" : undefined}>{certification(tool)}</Pill>
        <Pill>{tool.price}</Pill>
        <Pill>{tool.difficulty}</Pill>
      </div>

      <p className="use-case">{tool.useCase}</p>

      <LuxuryScore tool={tool} />
      <SignalBars tool={tool} compact />

      <div className="mini-section">
        <span>{t.bestFor}</span>
        <div className="tag-list">{tool.best.slice(0, 4).map((item) => <Pill key={item}>{item}</Pill>)}</div>
      </div>

      <div className="metric-grid">
        <div><strong>{tool.trend}</strong><span>Trend</span></div>
        <div><strong>{profile.privacy}</strong><span>Privacy</span></div>
        <div><strong>{hasSignal(tool, "API") ? "API" : hasSignal(tool, "Open Source") ? "OSS" : "AI"}</strong><span>Signal</span></div>
      </div>

      <div className="card-actions">
        <button type="button" onClick={open} className="secondary-btn">{t.details}</button>
        <button type="button" onClick={toggle} className={selected ? "main-btn selected" : "main-btn"}>{selected ? t.remove : t.choose}</button>
      </div>
    </article>
  );
}

function DetailPanel({ tool, lang, onClose, selected, favorite, toggle, toggleFavorite, openTool }: { tool: Tool | null; lang: Lang; onClose: () => void; selected: boolean; favorite: boolean; toggle: () => void; toggleFavorite: () => void; openTool: (id: string) => void }) {
  const t = T[lang];
  if (!tool) return null;
  const profile = buildToolProfile(tool);
  const dataRows = [
    ["Company", tool.company],
    ["Pricing", tool.price],
    ["Difficulty", tool.difficulty],
    ["Updated", formatUpdated(lang)],
    ["API", hasSignal(tool, "API") ? "Yes" : "No"],
    ["MCP", hasSignal(tool, "MCP") ? "Yes" : "No"],
    ["Open Source", hasSignal(tool, "Open Source") || hasSignal(tool, "Open") ? "Yes" : "No"],
    ["Local", hasSignal(tool, "Local") ? "Yes" : "No"],
  ];
  return (
    <div className="detail-backdrop" role="dialog" aria-modal="true" aria-label={tool.name} onClick={onClose}>
      <section className="detail-panel" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-btn" onClick={onClose}>×</button>
        <div className="detail-hero">
          <Logo tool={tool} size={70} />
          <div>
            <Pill color={tool.color}>{tool.category}</Pill>
            <h2>{tool.name}</h2>
            <p>{tool.company} · {tool.price} · {certification(tool)}</p>
          </div>
          <ScoreRing score={tool.score} color={tool.color} />
        </div>

        <IntelligenceCard tool={tool} lang={lang} />

        <div className="at-glance-grid">
          {dataRows.map(([label, value]) => (
            <div key={label} className="at-glance"><strong>{value}</strong><span>{label}</span></div>
          ))}
        </div>

        <div className="detail-grid">
          <div className="detail-box wide">
            <h3>{t.verdict}</h3>
            <p>{tool.verdict}</p>
          </div>
          <div className="detail-box">
            <h3>{t.useCase}</h3>
            <p>{tool.useCase}</p>
          </div>
          <div className="detail-box">
            <h3>{t.platforms}</h3>
            <div className="tag-list">{tool.platforms.map((x) => <Pill key={x}>{x}</Pill>)}</div>
          </div>
          <div className="detail-box">
            <h3>Who should use it</h3>
            <ul>{tool.best.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="detail-box">
            <h3>Who should not</h3>
            <ul>{tool.limits.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="detail-box wide">
            <h3>Signals & capabilities</h3>
            <div className="tag-list">{tool.flags.map((x) => <Pill key={x} color={tool.color}>{x}</Pill>)}</div>
          </div>
          <div className="detail-box wide">
            <h3>Related tools</h3>
            <RelatedTools tool={tool} lang={lang} openTool={openTool} />
          </div>
        </div>

        <div className="detail-actions">
          <button type="button" onClick={toggleFavorite} className={favorite ? "secondary-btn favorite-active favorite-action" : "secondary-btn favorite-action"}>
            <span>{favorite ? "♥" : "♡"}</span> {favorite ? (lang === "fr" ? "Dans mes favoris" : "Saved to favorites") : (lang === "fr" ? "Ajouter aux favoris" : "Add to favorites")}
          </button>
          <button type="button" onClick={toggle} className={selected ? "main-btn selected" : "main-btn"}>{selected ? t.remove : t.choose}</button>
          <Link className="secondary-btn" href={reviewUrl(tool, lang)}>Review</Link>
          <Link className="secondary-btn" href={compareUrl(tool, lang)}>Compare</Link>
          <a className="secondary-btn" href={officialUrl(tool)} target="_blank" rel="noreferrer">Official ↗</a>
        </div>
      </section>
    </div>
  );
}

function CompareDock({ tools, lang, clear, openTool }: { tools: Tool[]; lang: Lang; clear: () => void; openTool: (id: string) => void }) {
  const t = T[lang];
  if (!tools.length) return null;
  return (
    <div className="compare-dock" aria-live="polite">
      <div>
        <strong>{t.quickCompare}</strong>
        <span>{tools.length} {t.selected}</span>
      </div>
      <div className="dock-tools">
        {tools.map((tool) => (
          <button type="button" key={tool.id} onClick={() => openTool(tool.id)}>
            <Logo tool={tool} size={26} />
            <span>{tool.name}</span>
          </button>
        ))}
      </div>
      <button type="button" className="secondary-btn" onClick={clear}>{t.clear}</button>
    </div>
  );
}

function RecentlyViewed({ ids, lang, openTool }: { ids: string[]; lang: Lang; openTool: (id: string) => void }) {
  const tools = ids.map((id) => TOOLS.find((tool) => tool.id === id)).filter(Boolean) as Tool[];
  if (!tools.length) return null;
  return (
    <section>
      <h2 className="section-title">{lang === "fr" ? "Consultés récemment" : "Recently viewed"}</h2>
      <div className="recent-row">
        {tools.map((tool) => (
          <button type="button" key={tool.id} className="recent-card" onClick={() => openTool(tool.id)}>
            <Logo tool={tool} size={32} />
            <strong>{tool.name}</strong>
            <span>{tool.score.toFixed(1)}/10</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FavoritesHub({
  tools,
  lang,
  openTool,
  compareFavorites,
  clearFavorites,
  showOnly,
  toggleShowOnly,
}: {
  tools: Tool[];
  lang: Lang;
  openTool: (id: string) => void;
  compareFavorites: () => void;
  clearFavorites: () => void;
  showOnly: boolean;
  toggleShowOnly: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!tools.length) return null;

  const avgScore = tools.reduce((sum, tool) => sum + tool.score, 0) / tools.length;
  const topTool = [...tools].sort((a, b) => b.score - a.score)[0];
  const categoryCount = new Set(tools.map((tool) => tool.category)).size;
  const copyText = tools.map((tool) => `${tool.name} — ${tool.score.toFixed(1)}/10 — ${tool.category}`).join("\n");

  const copyFavorites = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="favorites-hub" aria-label={lang === "fr" ? "Favoris IA" : "AI favorites"}>
      <div className="favorites-head">
        <div>
          <span className="favorites-kicker">♥ {lang === "fr" ? "Stack sauvegardée" : "Saved stack"}</span>
          <h2>{lang === "fr" ? "Tes IA favorites" : "Your favorite AI tools"}</h2>
          <p>{lang === "fr" ? "Utilise les favoris comme une shortlist : filtre, compare, partage ou retrouve tes meilleurs outils sans refaire la recherche." : "Use favorites as a shortlist: filter, compare, share or reopen your best tools without searching again."}</p>
        </div>
        <div className="favorites-score">
          <strong>{avgScore.toFixed(1)}</strong>
          <span>{lang === "fr" ? "score moyen" : "avg score"}</span>
        </div>
      </div>

      <div className="favorite-insights">
        <div><strong>{tools.length}</strong><span>{lang === "fr" ? "favoris" : "favorites"}</span></div>
        <div><strong>{categoryCount}</strong><span>{lang === "fr" ? "catégories" : "categories"}</span></div>
        <div><strong>{topTool.name}</strong><span>{lang === "fr" ? "meilleur score" : "top score"}</span></div>
      </div>

      <div className="favorite-actions">
        <button type="button" className={showOnly ? "main-btn selected" : "secondary-btn"} onClick={toggleShowOnly}>
          {showOnly ? (lang === "fr" ? "Afficher tout" : "Show all") : (lang === "fr" ? "Voir favoris uniquement" : "Favorites only")}
        </button>
        <button type="button" className="secondary-btn" onClick={compareFavorites}>{lang === "fr" ? "Comparer le top 3" : "Compare top 3"}</button>
        <button type="button" className="secondary-btn" onClick={copyFavorites}>{copied ? (lang === "fr" ? "Copié ✓" : "Copied ✓") : (lang === "fr" ? "Copier la shortlist" : "Copy shortlist")}</button>
        <button type="button" className="danger-btn" onClick={clearFavorites}>{lang === "fr" ? "Vider" : "Clear"}</button>
      </div>

      <div className="favorite-grid">
        {tools.slice(0, 12).map((tool) => (
          <button key={tool.id} type="button" className="favorite-card" onClick={() => openTool(tool.id)} style={{ borderColor: `${tool.color}26` }}>
            <Logo tool={tool} size={34} />
            <div>
              <strong>{tool.name}</strong>
              <span>{tool.category} · {tool.score.toFixed(1)}/10</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function AiToolDirectoryClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [uiLang, setUiLang] = useState<Lang>(lang ?? "en");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 120);
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortMode>("score");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [advancedOnly, setAdvancedOnly] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => setUiLang(lang ?? "en"), [lang]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("neuriflux_ai_tools_favorites_v2");
      if (saved) setFavoriteIds(JSON.parse(saved) as string[]);
      const recent = window.localStorage.getItem("neuriflux_ai_tools_recent_v2");
      if (recent) setRecentIds(JSON.parse(recent) as string[]);
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("neuriflux_ai_tools_favorites_v2", JSON.stringify(favoriteIds.slice(0, 60))); } catch {}
  }, [favoriteIds]);

  useEffect(() => {
    try { window.localStorage.setItem("neuriflux_ai_tools_recent_v2", JSON.stringify(recentIds.slice(0, 8))); } catch {}
  }, [recentIds]);

  const t = T[uiLang];
  const CATEGORIES = useMemo(() => Array.from(new Set(TOOLS.map((tool) => tool.category))).sort(), []);
  const categoryStats = useMemo(() => CATEGORIES.map((cat) => ({ cat, count: TOOLS.filter((tool) => tool.category === cat).length })), [CATEGORIES]);
  const topTools = useMemo(() => [...TOOLS].sort((a, b) => b.score - a.score).slice(0, 6), []);
  const trendingTools = useMemo(() => [...TOOLS].sort((a, b) => b.trend - a.trend).slice(0, 8), []);
  const favoriteTools = useMemo(() => favoriteIds.map((id) => TOOLS.find((tool) => tool.id === id)).filter(Boolean) as Tool[], [favoriteIds]);
  const selectedTools = useMemo(() => selectedIds.map((id) => TOOLS.find((tool) => tool.id === id)).filter(Boolean) as Tool[], [selectedIds]);
  const detailTool = detailId ? TOOLS.find((tool) => tool.id === detailId) ?? null : null;

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const priceMatch = price === "all" || (price === "free" && isFree(tool)) || (price === "enterprise" && isEnterprise(tool)) || (price === "paid" && !isFree(tool));
      const catMatch = category === "all" || tool.category === category;
      const signalMatch = advancedOnly === "all" || hasSignal(tool, advancedOnly);
      const favoriteMatch = !showFavoritesOnly || favoriteIds.includes(tool.id);
      const queryMatch = !q || `${tool.name} ${tool.company} ${tool.category} ${tool.badge} ${tool.price} ${tool.difficulty} ${tool.platforms.join(" ")} ${tool.flags.join(" ")} ${tool.best.join(" ")} ${tool.limits.join(" ")} ${tool.verdict} ${tool.useCase}`.toLowerCase().includes(q);
      return priceMatch && catMatch && signalMatch && favoriteMatch && queryMatch;
    }).sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "trending") return b.trend - a.trend;
      return b.score - a.score;
    });
  }, [debouncedQuery, price, category, advancedOnly, showFavoritesOnly, favoriteIds, sort]);

  const openTool = (id: string) => {
    setDetailId(id);
    setRecentIds((current) => [id, ...current.filter((item) => item !== id)].slice(0, 8));
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current.slice(-2), id]);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [id, ...current].slice(0, 60));
  };

  const compareFavorites = () => {
    const next = favoriteTools.slice(0, 3).map((tool) => tool.id);
    if (next.length) setSelectedIds(next);
  };

  const clearFavorites = () => {
    setFavoriteIds([]);
    setShowFavoritesOnly(false);
  };

  const reset = () => { setQuery(""); setCategory("all"); setPrice("all"); setSort("score"); setAdvancedOnly("all"); setShowFavoritesOnly(false); };

  const switchLang = (next: Lang) => {
    setUiLang(next);
    const current = pathname || `/${uiLang}/ai-tools`;
    const nextPath = current.match(/^\/(fr|en)(\/|$)/) ? current.replace(/^\/(fr|en)/, `/${next}`) : `/${next}/ai-tools`;
    router.push(nextPath);
  };

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: uiLang === "fr" ? "Annuaire des outils IA Neuriflux" : "Neuriflux AI Tools Directory",
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.slice(0, 80).map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: tool.category,
        operatingSystem: tool.platforms.join(", "),
        aggregateRating: { "@type": "AggregateRating", ratingValue: tool.score, bestRating: 10, ratingCount: Math.max(12, tool.trend) },
      },
    })),
  }), [uiLang]);

  return (
    <main className="ai-dir">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        .ai-dir{min-height:100vh;background:#080c10;color:#edf2f7;font-family:Syne,system-ui,sans-serif;position:relative;overflow:hidden}
        .ai-dir::before{content:"";position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        .noise{position:fixed;inset:0;opacity:.045;pointer-events:none;z-index:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")}
        .cursor-glow{position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(560px circle at var(--x,50%) var(--y,20%),rgba(0,230,190,.075),transparent 42%);mix-blend-mode:screen}
        .container{position:relative;z-index:2;width:min(1280px,calc(100% - 32px));margin:0 auto}
        .nav{height:68px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07);backdrop-filter:blur(20px);position:relative}
        .nav::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:linear-gradient(90deg,transparent,rgba(0,230,190,.42),transparent)}
        .brand{display:flex;align-items:center;gap:.5rem;color:white;text-decoration:none;font-weight:900;letter-spacing:-.04em}
        .brand-dot{width:8px;height:8px;background:#00e6be;border-radius:50%;box-shadow:0 0 12px #00e6be}
        .home-btn,.main-btn,.secondary-btn{border:1px solid rgba(0,230,190,.3);border-radius:999px;padding:10px 15px;font-weight:800;font-family:JetBrains Mono,monospace;font-size:.72rem;text-decoration:none;cursor:pointer;transition:.18s;background:rgba(0,230,190,.1);color:#00e6be}
        .home-btn:hover,.secondary-btn:hover{transform:translateY(-1px);border-color:rgba(0,230,190,.55)}
        .main-btn{background:#00e6be;color:#06100e;border-color:#00e6be}.main-btn.selected{background:rgba(239,68,68,.12);color:#ef4444;border-color:rgba(239,68,68,.35)}
        .nav-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.lang-switch{display:flex;gap:3px;padding:3px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);border-radius:999px}
        .lang-btn{border:0;background:transparent;color:#7b8a9a;border-radius:999px;padding:7px 10px;font-family:JetBrains Mono,monospace;font-size:.68rem;font-weight:900;cursor:pointer}.lang-btn.active{background:#00e6be;color:#06100e}.lang-btn:hover{color:#edf2f7;background:rgba(255,255,255,.06)}
        .hero{padding:72px 0 30px;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(330px,.96fr);gap:36px;align-items:end}.eyebrow{display:inline-flex;color:#00e6be;background:rgba(0,230,190,.08);border:1px solid rgba(0,230,190,.18);border-radius:999px;padding:7px 13px;font-family:JetBrains Mono,monospace;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;margin-bottom:18px}
        h1{font-size:clamp(2.8rem,7vw,5.6rem);line-height:.92;letter-spacing:-.07em;margin:0 0 22px;font-weight:950}.accent{color:#00e6be;text-shadow:0 0 34px rgba(0,230,190,.18)}
        .subtitle{font-family:JetBrains Mono,monospace;color:#7b8a9a;line-height:1.75;font-size:.88rem;max-width:760px}.hero-panel,.tool-card,.control-box,.coverage-box,.compare-box,.method,.footer-cta,.expert-card,.intelligence-card{position:relative;border:1px solid rgba(255,255,255,.075);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));box-shadow:0 28px 90px rgba(0,0,0,.25)}
        .hero-panel{border-radius:28px;padding:22px}.hero-list{display:grid;gap:10px}.hero-pick{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:16px;background:rgba(0,0,0,.18);color:#edf2f7;text-align:left;cursor:pointer}.hero-pick span{font-family:JetBrains Mono,monospace;font-size:.63rem;color:#7b8a9a;margin-left:auto}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:28px 0}.stat{border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:16px;background:rgba(255,255,255,.025)}.stat strong{font-size:1.35rem;color:#00e6be}.stat span{display:block;margin-top:4px;color:#617183;font-family:JetBrains Mono,monospace;font-size:.65rem;text-transform:uppercase;letter-spacing:.08em}
        .hero-logo-cloud,.logo-cloud-large,.recent-row,.dock-tools{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:22px}.luxury-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:14px 0 28px}.luxury-strip div,.expert-card{border:1px solid rgba(255,255,255,.075);border-radius:20px;padding:16px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.016))}.luxury-strip strong,.expert-card strong{display:block;color:#edf2f7;font-size:.86rem}.luxury-strip span,.expert-card p{display:block;margin-top:5px;color:#617183;font-family:JetBrains Mono,monospace;font-size:.64rem;line-height:1.65}
        .expert-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0 30px}.coverage-box{margin:18px 0 28px;border-color:rgba(0,230,190,.16);border-radius:24px;padding:20px;background:linear-gradient(135deg,rgba(0,230,190,.06),rgba(59,130,246,.025));display:grid;grid-template-columns:.42fr 1fr;gap:16px;align-items:center}.coverage-box h2{margin:0;font-size:1.15rem}.coverage-box p{margin:0;color:#7b8a9a;font-family:JetBrains Mono,monospace;font-size:.74rem;line-height:1.75}
        .control-box{position:sticky;top:0;z-index:20;margin:20px 0 24px;padding:14px;border-radius:22px;background:rgba(8,12,16,.84);backdrop-filter:blur(24px)}.search{width:100%;border:1px solid rgba(255,255,255,.09);background:#0d1117;color:#edf2f7;border-radius:14px;padding:14px 16px;font-family:JetBrains Mono,monospace;outline:none}.search:focus{border-color:rgba(0,230,190,.45)}.controls{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;align-items:center}select{background:#111820;color:#edf2f7;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:10px 12px;font-family:JetBrains Mono,monospace;font-size:.72rem}.results-count{margin-left:auto;color:#617183;font-family:JetBrains Mono,monospace;font-size:.7rem}
        .section-title{margin:38px 0 14px;font-size:1.25rem;letter-spacing:-.04em}.category-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.cat-btn{text-align:left;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);border-radius:16px;color:#edf2f7;padding:14px;cursor:pointer;transition:.18s}.cat-btn:hover,.cat-btn.active{border-color:rgba(0,230,190,.35);background:rgba(0,230,190,.06);transform:translateY(-1px)}.cat-btn span{font-family:JetBrains Mono,monospace;font-size:.65rem;color:#617183}
        .tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(335px,1fr));gap:16px;margin:18px 0 40px;align-items:stretch}.tool-card{min-height:560px;overflow:hidden;border-radius:24px;padding:18px;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease}.tool-card:hover{transform:translateY(-4px);box-shadow:0 24px 70px rgba(0,0,0,.38)}.tool-card.is-favorite{border-color:rgba(239,68,68,.26)!important;background:radial-gradient(circle at 100% 0%,rgba(239,68,68,.105),transparent 34%),linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))}.tool-card.is-favorite::after{content:"Saved";position:absolute;right:18px;bottom:18px;font-family:JetBrains Mono,monospace;font-size:.54rem;font-weight:950;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,122,144,.22);pointer-events:none}.tool-card::before,.hero-panel::before,.control-box::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.08),transparent 38%,rgba(0,230,190,.035));pointer-events:none}.tool-card > *,.hero-panel > *,.control-box > *{position:relative;z-index:1}.card-topline{position:absolute;top:0;left:0;right:0;height:2px;opacity:.85}.fav-btn{position:relative;z-index:3;min-width:42px;height:36px;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(145deg,rgba(8,12,16,.76),rgba(255,255,255,.035));color:#aab7c4;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 12px;font-family:JetBrains Mono,monospace;font-size:.62rem;font-weight:900;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:transform .18s ease,border-color .18s ease,background .18s ease,color .18s ease,box-shadow .18s ease}.fav-heart{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;font-size:.88rem;line-height:1;background:rgba(255,255,255,.055);transition:transform .18s ease,background .18s ease}.fav-copy{display:none;white-space:nowrap}.fav-tooltip{position:absolute;right:0;top:calc(100% + 8px);white-space:nowrap;opacity:0;pointer-events:none;transform:translateY(-4px);border:1px solid rgba(255,255,255,.09);border-radius:999px;background:rgba(8,12,16,.94);color:#edf2f7;padding:7px 10px;font-size:.58rem;box-shadow:0 18px 50px rgba(0,0,0,.38);transition:.18s}.fav-btn:hover{transform:translateY(-2px);border-color:rgba(239,68,68,.45);color:#ff7a90;background:linear-gradient(145deg,rgba(239,68,68,.14),rgba(255,255,255,.035));box-shadow:0 12px 34px rgba(239,68,68,.14)}.fav-btn:hover .fav-heart{transform:scale(1.12);background:rgba(239,68,68,.14)}.fav-btn:hover .fav-tooltip{opacity:1;transform:translateY(0)}.fav-btn.active{color:#fff;border-color:rgba(239,68,68,.56);background:linear-gradient(135deg,rgba(239,68,68,.34),rgba(244,63,94,.16));box-shadow:0 0 0 1px rgba(239,68,68,.12),0 12px 34px rgba(239,68,68,.22)}.fav-btn.active .fav-heart{background:rgba(255,255,255,.14);color:#fff;animation:favPulse 1.8s ease-in-out infinite}.fav-btn.active .fav-copy{display:inline}.favorite-filter{border:1px solid rgba(239,68,68,.24);border-radius:999px;padding:9px 13px;font-weight:900;font-family:JetBrains Mono,monospace;font-size:.72rem;text-decoration:none;cursor:pointer;transition:.18s;background:linear-gradient(135deg,rgba(239,68,68,.10),rgba(255,255,255,.025));color:#ff6b81;display:inline-flex;align-items:center;gap:7px}.favorite-filter b{color:#fff}.favorite-filter em{font-style:normal;color:#aab7c4}.favorite-filter:hover:not(:disabled),.favorite-filter.selected{transform:translateY(-1px);border-color:rgba(239,68,68,.55);background:linear-gradient(135deg,rgba(239,68,68,.28),rgba(244,63,94,.12));box-shadow:0 12px 34px rgba(239,68,68,.14)}.favorite-filter:disabled{opacity:.45;cursor:not-allowed}.favorite-action{border-color:rgba(239,68,68,.24)!important;color:#ff7a90!important}.favorite-active,.favorite-action:hover{background:linear-gradient(135deg,rgba(239,68,68,.24),rgba(244,63,94,.10))!important;border-color:rgba(239,68,68,.45)!important}.danger-btn{border:1px solid rgba(239,68,68,.28);border-radius:999px;padding:10px 15px;font-weight:800;font-family:JetBrains Mono,monospace;font-size:.72rem;text-decoration:none;cursor:pointer;transition:.18s;background:rgba(239,68,68,.08);color:#ef4444}.danger-btn:hover{transform:translateY(-1px);border-color:rgba(239,68,68,.55)}@keyframes favPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 rgba(239,68,68,0)}50%{transform:scale(1.08);box-shadow:0 0 0 7px rgba(239,68,68,.08)}}
        .tool-head{display:flex;align-items:center;gap:12px}.tool-title{min-width:0;flex:1}.tool-right{display:flex;align-items:center;gap:10px;margin-left:auto;flex-shrink:0}.tool-name{font-weight:950;letter-spacing:-.04em;font-size:1.05rem}.tool-company{font-family:JetBrains Mono,monospace;font-size:.65rem;color:#617183;margin-top:2px}.logo-box{position:relative;display:inline-flex;align-items:center;justify-content:center;border:1px solid;border-radius:16px;overflow:hidden;isolation:isolate;transition:transform .2s, box-shadow .2s, border-color .2s}.logo-box:hover{transform:translateY(-2px) scale(1.03)}.logo-shine{position:absolute;inset:-60%;background:linear-gradient(120deg,transparent 35%,rgba(255,255,255,.20),transparent 65%);transform:translateX(-50%);opacity:.45;z-index:3;pointer-events:none}.logo-img{position:absolute;inset:22%;background-size:contain;background-position:center;background-repeat:no-repeat;z-index:2;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}.logo-fallback{position:relative;z-index:1;font-size:.58rem;font-weight:950;opacity:.55;letter-spacing:-.04em}
        .score-ring{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;padding:3px}.score-ring div{width:100%;height:100%;border-radius:50%;display:grid;place-items:center;background:#0d1117;font-weight:950;font-size:.82rem}.badge-row,.tag-list{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.pill{display:inline-flex;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);border-radius:999px;padding:5px 9px;font-family:JetBrains Mono,monospace;font-size:.62rem;color:#9aa7b4}.pill.active{font-weight:900}.use-case{font-family:JetBrains Mono,monospace;color:#a8b3bf;font-size:.74rem;line-height:1.65;margin:14px 0}.mini-section span{display:block;color:#617183;font-family:JetBrains Mono,monospace;font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;margin-bottom:7px}
        .lux-score{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid;border-radius:16px;padding:10px 12px;margin:6px 0 4px;box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}.lux-score span{font-family:JetBrains Mono,monospace;color:#8ea0b2;font-size:.58rem;text-transform:uppercase;letter-spacing:.12em}.lux-score strong{font-size:1.16rem;letter-spacing:-.04em}.signal-bars{display:grid;gap:7px;margin:12px 0 14px}.signal-bars.compact .signal-row:nth-child(n+5){display:none}.signal-row{display:grid;grid-template-columns:76px minmax(0,1fr) 28px;gap:8px;align-items:center;font-family:JetBrains Mono,monospace;font-size:.58rem;color:#617183}.signal-row div{height:5px;background:rgba(255,255,255,.055);border-radius:999px;overflow:hidden}.signal-row i{display:block;height:100%;border-radius:999px;box-shadow:0 0 10px rgba(255,255,255,.13)}.signal-row b{font-weight:800;color:#a8b3bf;text-align:right}
        .metric-grid,.intel-grid,.at-glance-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.metric-grid div,.intel-grid div,.at-glance{background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.055);border-radius:14px;padding:10px}.metric-grid strong,.intel-grid b,.at-glance strong{display:block;color:#00e6be}.metric-grid span,.intel-grid span,.at-glance span{font-family:JetBrains Mono,monospace;font-size:.58rem;color:#617183}.card-actions,.detail-actions{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:14px;flex-wrap:wrap}.compare-box{border-color:rgba(0,230,190,.18);border-radius:24px;padding:18px;background:linear-gradient(145deg,rgba(0,230,190,.07),rgba(59,130,246,.035));margin:24px 0}.compare-table{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:14px}.compare-col{border:1px solid rgba(255,255,255,.075);border-radius:18px;padding:14px;background:rgba(0,0,0,.18)}
        .intelligence-card{border-radius:22px;padding:16px;margin:14px 0}.intel-head{display:flex;gap:12px;align-items:center}.intel-head h3{margin:.3rem 0 0;font-size:1.3rem;letter-spacing:-.05em}.intel-head p,.intel-verdict{color:#9aa7b4;font-family:JetBrains Mono,monospace;font-size:.72rem;line-height:1.7}.related-tools{display:flex;gap:10px;flex-wrap:wrap}.related-pill,.recent-card{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.035);border-radius:999px;color:#edf2f7;text-decoration:none;padding:7px 10px;font-family:JetBrains Mono,monospace;font-size:.68rem;cursor:pointer}.ai-finder-pill{border-color:rgba(0,230,190,.28);color:#00e6be}.recent-card{border-radius:16px}.recent-card span{color:#617183}
        .favorites-hub{border:1px solid rgba(239,68,68,.16);border-radius:28px;padding:20px;margin:24px 0;background:radial-gradient(circle at 0% 0%,rgba(239,68,68,.12),transparent 38%),linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.018));box-shadow:0 28px 90px rgba(0,0,0,.22)}.favorites-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.favorites-kicker{display:inline-flex;color:#ef4444;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.22);border-radius:999px;padding:6px 10px;font-family:JetBrains Mono,monospace;font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.favorites-head h2{margin:10px 0 6px;font-size:1.8rem;letter-spacing:-.05em}.favorites-head p{font-family:JetBrains Mono,monospace;color:#8ea0b2;font-size:.74rem;line-height:1.7;max-width:760px}.favorites-score{min-width:110px;text-align:center;border:1px solid rgba(239,68,68,.2);border-radius:22px;padding:14px;background:rgba(239,68,68,.08)}.favorites-score strong{display:block;color:#ef4444;font-size:1.8rem;letter-spacing:-.06em}.favorites-score span{font-family:JetBrains Mono,monospace;font-size:.58rem;color:#9aa7b4;text-transform:uppercase;letter-spacing:.09em}.favorite-insights{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}.favorite-insights div{border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:12px;background:rgba(0,0,0,.16)}.favorite-insights strong{display:block;color:#edf2f7}.favorite-insights span{font-family:JetBrains Mono,monospace;font-size:.58rem;color:#617183;text-transform:uppercase;letter-spacing:.08em}.favorite-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.favorite-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin-top:14px}.favorite-card{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.075);border-radius:18px;background:rgba(255,255,255,.028);padding:10px;color:#edf2f7;text-align:left;cursor:pointer;transition:.18s}.favorite-card:hover{transform:translateY(-2px);background:rgba(255,255,255,.05)}.favorite-card strong{display:block;font-size:.82rem}.favorite-card span{font-family:JetBrains Mono,monospace;color:#7b8a9a;font-size:.62rem}.method{display:grid;grid-template-columns:.9fr 1.1fr;gap:18px;margin:38px 0;padding:24px;border-radius:26px;background:rgba(255,255,255,.025)}.method p{font-family:JetBrains Mono,monospace;color:#7b8a9a;line-height:1.75;font-size:.78rem}.method-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.method-card{border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:14px;background:rgba(0,0,0,.16)}.method-card strong{color:#00e6be}
        .detail-backdrop{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.72);backdrop-filter:blur(14px);display:grid;place-items:center;padding:18px}.detail-panel{width:min(1040px,100%);max-height:90vh;overflow:auto;border:1px solid rgba(255,255,255,.1);border-radius:28px;background:#0d1117;padding:22px;position:relative;box-shadow:0 40px 120px rgba(0,0,0,.55)}.close-btn{position:absolute;right:16px;top:16px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.06);color:white;border:1px solid rgba(255,255,255,.1);cursor:pointer}.detail-hero{display:flex;gap:16px;align-items:center;border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:18px;margin-bottom:18px}.detail-hero h2{margin:8px 0 4px;font-size:2rem;letter-spacing:-.06em}.detail-hero p{color:#7b8a9a;font-family:JetBrains Mono,monospace;font-size:.75rem}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.detail-box{border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:16px;background:rgba(255,255,255,.025)}.detail-box.wide{grid-column:1/-1}.detail-box h3{margin:0 0 10px;color:#00e6be;font-size:.85rem;text-transform:uppercase;letter-spacing:.1em}.detail-box p,.detail-box li{font-family:JetBrains Mono,monospace;color:#a8b3bf;font-size:.75rem;line-height:1.75}.detail-box ul{padding-left:18px}
        .footer-cta{margin:42px 0 90px;text-align:center;border-color:rgba(0,230,190,.18);border-radius:28px;padding:34px;background:radial-gradient(circle at 50% 0%,rgba(0,230,190,.12),transparent 42%),rgba(255,255,255,.025)}.compare-dock{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:55;width:min(920px,calc(100% - 24px));display:flex;align-items:center;gap:12px;justify-content:space-between;border:1px solid rgba(0,230,190,.22);background:rgba(8,12,16,.92);backdrop-filter:blur(22px);border-radius:22px;padding:12px 14px;box-shadow:0 22px 80px rgba(0,0,0,.45)}.compare-dock strong{display:block}.compare-dock span{font-family:JetBrains Mono,monospace;font-size:.62rem;color:#7b8a9a}.dock-tools{margin:0}.dock-tools button{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.075);color:#edf2f7;border-radius:999px;padding:6px 8px;cursor:pointer}
        @media(max-width:1120px){.container{padding:0 18px}.tools-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}.hero{gap:22px}.control-box{top:0}}
        @media(max-width:920px){.expert-grid,.hero,.method,.coverage-box{grid-template-columns:1fr}.hero{padding-top:44px;align-items:stretch}.hero-panel{order:2}.stats,.luxury-strip{grid-template-columns:repeat(2,1fr)}.results-count{margin-left:0}.detail-grid{grid-template-columns:1fr}.at-glance-grid{grid-template-columns:repeat(2,1fr)}.compare-dock{align-items:flex-start;flex-direction:column}.dock-tools{width:100%;overflow:auto;padding-bottom:2px;flex-wrap:nowrap}.controls select,.controls button{flex:1 1 165px}.search{font-size:16px}.favorites-head{align-items:stretch}.favorite-grid{grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}}
        @media(max-width:700px){.nav{height:auto;padding:12px 0;gap:12px;align-items:stretch;flex-direction:column}.nav-actions{justify-content:space-between;width:100%}.home-btn{flex:1;text-align:center}.lang-switch{justify-content:center}.hero-logo-cloud{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.hero-logo-cloud .related-pill{justify-content:flex-start;width:100%}.control-box{position:relative;top:auto;border-radius:20px}.controls{display:grid;grid-template-columns:1fr 1fr}.controls select,.controls button,.results-count{width:100%;min-width:0}.results-count{grid-column:1/-1;text-align:center;padding:8px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.025)}.favorite-filter{justify-content:center}.detail-backdrop{align-items:end;place-items:end center;padding:0}.detail-panel{width:100%;max-height:92vh;border-radius:26px 26px 0 0;padding:18px}.detail-actions{position:sticky;bottom:0;background:linear-gradient(180deg,rgba(13,17,23,0),#0d1117 18%);padding-top:18px}.footer-cta{margin-bottom:120px}}
        @media(max-width:560px){h1{font-size:clamp(2.35rem,13vw,3.1rem)}.subtitle{font-size:.8rem}.tools-grid{grid-template-columns:1fr;gap:12px}.stats,.luxury-strip,.metric-grid,.intel-grid,.at-glance-grid,.favorite-insights,.method-grid{grid-template-columns:1fr}.favorites-head{flex-direction:column}.favorites-score{width:100%;display:flex;align-items:center;justify-content:space-between}.tool-card{min-height:auto;border-radius:22px;padding:16px}.tool-head{padding-right:0;align-items:flex-start}.tool-right{flex-direction:column-reverse;align-items:flex-end;gap:8px}.fav-btn{width:38px;min-width:38px;height:38px;padding:0}.fav-copy,.fav-tooltip{display:none!important}.fav-heart{width:22px;height:22px;background:transparent;font-size:1rem}.detail-hero{align-items:flex-start;flex-direction:column}.detail-hero h2{font-size:1.65rem}.compare-dock{bottom:10px;width:calc(100% - 18px);border-radius:18px;padding:10px}.compare-dock .secondary-btn{width:100%;justify-content:center}.favorite-card{border-radius:16px}.section-title{font-size:1.25rem}.hero-pick{padding:10px}.category-grid{grid-template-columns:1fr}.card-actions,.detail-actions,.favorite-actions{display:grid;grid-template-columns:1fr;gap:9px}.main-btn,.secondary-btn,.danger-btn{justify-content:center;text-align:center}.logo-cloud-large{display:grid;grid-template-columns:repeat(2,1fr)}.recent-row{overflow:auto;flex-wrap:nowrap;padding-bottom:6px}.recent-card{min-width:170px}}
        @media(max-width:380px){.controls{grid-template-columns:1fr}.hero-logo-cloud,.logo-cloud-large{grid-template-columns:1fr}.brand{font-size:1rem}.tool-head{gap:10px}.tool-right{gap:6px}.score-ring{transform:scale(.92)}.fav-btn{width:36px;min-width:36px;height:36px}}
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.cursor-glow{display:none}}
      `}</style>
      <div className="noise" />
      <CursorGlow />
      <div className="container">
        <nav className="nav">
          <Link href={`/${uiLang}`} className="brand"><span className="brand-dot" />Neuri<span className="accent">flux</span></Link>
          <div className="nav-actions">
            <div className="lang-switch" aria-label={t.langLabel}>
              <button type="button" className={uiLang === "fr" ? "lang-btn active" : "lang-btn"} onClick={() => switchLang("fr")} aria-pressed={uiLang === "fr"}>FR</button>
              <button type="button" className={uiLang === "en" ? "lang-btn active" : "lang-btn"} onClick={() => switchLang("en")} aria-pressed={uiLang === "en"}>EN</button>
            </div>
            <Link href={`/${uiLang}`} className="home-btn">← {t.backHome}</Link>
          </div>
        </nav>

        <section className="hero">
          <div>
            <div className="eyebrow">{t.eyebrow} · {t.updated}</div>
            <h1>{t.title} <span className="accent">{t.accent}</span></h1>
            <p className="subtitle">{t.subtitle}</p>
            <div className="hero-logo-cloud">{topTools.slice(0, 10).map((tool) => <button type="button" className="related-pill" key={tool.id} onClick={() => openTool(tool.id)}><Logo tool={tool} size={30} /><span>{tool.name}</span></button>)}</div>
          </div>
          <aside className="hero-panel">
            <h2 className="section-title" style={{ marginTop: 0 }}>{t.topPicks}</h2>
            <div className="hero-list">
              {topTools.slice(0, 5).map((tool, index) => (
                <button key={tool.id} type="button" className="hero-pick" onClick={() => openTool(tool.id)}>
                  <Logo tool={tool} size={34} />
                  <strong>{index + 1}. {tool.name}</strong>
                  <span>{tool.score.toFixed(1)}/10</span>
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="stats" aria-label="Directory statistics">
          <div className="stat"><strong>{TOOLS.length}</strong><span>AI tools</span></div>
          <div className="stat"><strong>{CATEGORIES.length}</strong><span>Categories</span></div>
          <div className="stat"><strong>{trendingTools[0]?.name ?? "GPT"}</strong><span>Top trend</span></div>
          <div className="stat"><strong>100%</strong><span>On-page</span></div>
        </section>

        <section className="luxury-strip" aria-label="Neuriflux trust signals">
          <div><strong>{uiLang === "fr" ? "Indépendant" : "Independent"}</strong><span>{uiLang === "fr" ? "Aucun classement sponsorisé" : "No sponsored ordering"}</span></div>
          <div><strong>{uiLang === "fr" ? "Fiches profondes" : "Deep profiles"}</strong><span>Score, API, privacy, MCP, local, pricing</span></div>
          <div><strong>{uiLang === "fr" ? "Comparaison rapide" : "Quick compare"}</strong><span>{uiLang === "fr" ? "Jusqu’à 3 outils sans changer de page" : "Compare up to 3 tools without leaving"}</span></div>
          <div><strong>{uiLang === "fr" ? "Maintenable" : "Maintainable"}</strong><span>{uiLang === "fr" ? "Une base pour Blog, AI Finder et comparatifs" : "One base for Blog, AI Finder and comparisons"}</span></div>
        </section>

        <section className="expert-grid" aria-label="Expert directory features">
          <div className="expert-card"><strong>🧠 {uiLang === "fr" ? "Lecture experte" : "Expert reading"}</strong><p>{uiLang === "fr" ? "Chaque fiche combine usage réel, maturité produit, limites et signaux de confiance." : "Each profile combines real use, product maturity, limitations and trust signals."}</p></div>
          <div className="expert-card"><strong>⚔️ {uiLang === "fr" ? "Comparaison rapide" : "Quick comparison"}</strong><p>{uiLang === "fr" ? "Compare score, usage, prix, API, privacy et plateformes sans ouvrir une autre page." : "Compare score, use case, pricing, API, privacy and platforms without opening another page."}</p></div>
          <div className="expert-card"><strong>🔎 {uiLang === "fr" ? "Recherche profonde" : "Deep search"}</strong><p>{uiLang === "fr" ? "La recherche scanne nom, société, catégorie, usage, verdict, limites, plateformes et badges." : "Search scans name, company, category, use case, verdict, limits, platforms and badges."}</p></div>
        </section>

        <section className="coverage-box">
          <h2>{t.coverageTitle}</h2>
          <p>{t.coverageText}<br /><span style={{ color: "#00e6be" }}>{t.logoNote}</span></p>
        </section>

        <section className="control-box">
          <input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} type="search" aria-label={t.search} />
          <div className="controls">
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category"><option value="all">{t.all}</option>{CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
            <select value={price} onChange={(e) => setPrice(e.target.value as PriceFilter)} aria-label={t.price}><option value="all">{t.price}: {t.all}</option><option value="free">{t.free}</option><option value="paid">{t.paid}</option><option value="enterprise">{t.enterprise}</option></select>
            <select value={advancedOnly} onChange={(e) => setAdvancedOnly(e.target.value)} aria-label="Advanced filter"><option value="all">Signals: {t.all}</option><option value="API">API</option><option value="Open Source">Open Source</option><option value="MCP">MCP</option><option value="Local">Local</option><option value="Enterprise">Enterprise</option><option value="Agent">Agent</option><option value="Self-host">Self-host</option></select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} aria-label={t.sort}><option value="score">{t.score}</option><option value="trending">{t.trending}</option><option value="name">{t.name}</option></select>
            <button type="button" className={showFavoritesOnly ? "favorite-filter selected" : "favorite-filter"} onClick={() => setShowFavoritesOnly((value) => !value)} disabled={!favoriteTools.length} aria-pressed={showFavoritesOnly}>
              <span>♥</span><b>{favoriteTools.length}</b><em>{uiLang === "fr" ? "Favoris" : "Favorites"}</em>
            </button>
            <button type="button" className="secondary-btn" onClick={reset}>{t.clear}</button>
            <span className="results-count">{filtered.length} {t.results}</span>
          </div>
        </section>

        <section>
          <h2 className="section-title">{t.categories}</h2>
          <div className="category-grid">
            <button type="button" className={category === "all" ? "cat-btn active" : "cat-btn"} onClick={() => setCategory("all")}><strong>{t.all}</strong><span>{TOOLS.length} tools</span></button>
            {categoryStats.map((item) => <button type="button" key={item.cat} className={category === item.cat ? "cat-btn active" : "cat-btn"} onClick={() => setCategory(item.cat)}><strong>{item.cat}</strong><span>{item.count} tools</span></button>)}
          </div>
        </section>

        <RecentlyViewed ids={recentIds} lang={uiLang} openTool={openTool} />

        <FavoritesHub tools={favoriteTools} lang={uiLang} openTool={openTool} compareFavorites={compareFavorites} clearFavorites={clearFavorites} showOnly={showFavoritesOnly} toggleShowOnly={() => setShowFavoritesOnly((value) => !value)} />

        {selectedTools.length > 0 && (
          <section className="compare-box">
            <h2 className="section-title" style={{ marginTop: 0 }}>{t.quickCompare} · {selectedTools.length} {t.selected}</h2>
            <div className="compare-table">
              {selectedTools.map((tool) => <div className="compare-col" key={tool.id}><div className="tool-head"><Logo tool={tool} size={34} /><div><strong>{tool.name}</strong><div className="tool-company">{tool.category}</div></div><ScoreRing score={tool.score} color={tool.color} /></div><p className="use-case">{tool.verdict}</p><SignalBars tool={tool} compact /><div className="tag-list">{tool.flags.slice(0, 5).map((x) => <Pill key={x} color={tool.color}>{x}</Pill>)}</div></div>)}
            </div>
          </section>
        )}

        <section>
          <h2 className="section-title">{filtered.length ? t.results : t.noResults}</h2>
          <div className="tools-grid">
            {filtered.map((tool) => <ToolCard key={tool.id} tool={tool} lang={uiLang} selected={selectedIds.includes(tool.id)} favorite={favoriteIds.includes(tool.id)} toggle={() => toggleSelected(tool.id)} toggleFavorite={() => toggleFavorite(tool.id)} open={() => openTool(tool.id)} />)}
          </div>
        </section>

        <section className="method">
          <div><h2 className="section-title" style={{ marginTop: 0 }}>{t.methodology}</h2><p>{t.methodText}</p></div>
          <div className="method-grid">
            {["Output quality", "Pricing clarity", "Ecosystem", "Privacy", "API depth", "Adoption velocity", "Local / self-host", "Community"].map((x, i) => <div className="method-card" key={x}><strong>0{i + 1}</strong><p>{x}</p></div>)}
          </div>
        </section>

        <section className="footer-cta">
          <h2>{t.footerTitle}</h2>
          <p className="subtitle" style={{ margin: "0 auto 18px" }}>{t.footerText}</p>
          <div className="detail-actions" style={{ justifyContent: "center" }}>
            <Link href={`/${uiLang}/aifinder`} className="main-btn">AI Finder →</Link>
            <button type="button" className="secondary-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Explore tools ↑</button>
          </div>
        </section>
      </div>

      <CompareDock tools={selectedTools} lang={uiLang} clear={() => setSelectedIds([])} openTool={openTool} />
      <DetailPanel tool={detailTool} lang={uiLang} onClose={() => setDetailId(null)} selected={detailTool ? selectedIds.includes(detailTool.id) : false} favorite={detailTool ? favoriteIds.includes(detailTool.id) : false} toggle={() => detailTool && toggleSelected(detailTool.id)} toggleFavorite={() => detailTool && toggleFavorite(detailTool.id)} openTool={openTool} />
    </main>
  );
}
