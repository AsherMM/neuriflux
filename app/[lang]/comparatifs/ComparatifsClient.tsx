"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { COMPARATIFS, type Comparatif } from "../lib/comparatifs";
import { useNewsletter } from "../../../lib/useNewsletter";

type Lang = "fr" | "en";
type SortMode = "featured" | "score" | "newest";


type ToolLike = {
  name: string;
  color?: string;
  logo?: string;
};

const TOOL_LOGOS: Record<string, { src: string; bg?: string; label?: string }> = {
  "chatgpt": { src: "https://cdn.simpleicons.org/openai/ffffff", bg: "#111827", label: "ChatGPT" },
  "openai": { src: "https://cdn.simpleicons.org/openai/ffffff", bg: "#111827", label: "OpenAI" },
  "openai tts": { src: "https://cdn.simpleicons.org/openai/ffffff", bg: "#111827", label: "OpenAI" },
  "claude": { src: "https://cdn.simpleicons.org/anthropic/D97757", bg: "#2b211d", label: "Claude" },
  "claude code": { src: "https://cdn.simpleicons.org/anthropic/D97757", bg: "#2b211d", label: "Claude Code" },
  "anthropic": { src: "https://cdn.simpleicons.org/anthropic/D97757", bg: "#2b211d", label: "Anthropic" },
  "cline": { src: "https://cdn.simpleicons.org/visualstudiocode/3b82f6", bg: "#071426", label: "Cline" },
  "kilo code": { src: "https://www.google.com/s2/favicons?domain=kilo.ai&sz=128", bg: "#101827", label: "Kilo Code" },
  "kilocode": { src: "https://www.google.com/s2/favicons?domain=kilo.ai&sz=128", bg: "#101827", label: "Kilo Code" },
  "kilo": { src: "https://www.google.com/s2/favicons?domain=kilo.ai&sz=128", bg: "#101827", label: "Kilo Code" },
  "roo code": { src: "https://www.google.com/s2/favicons?domain=kilo.ai&sz=128", bg: "#101827", label: "Kilo Code" },
  "roocode": { src: "https://www.google.com/s2/favicons?domain=kilo.ai&sz=128", bg: "#101827", label: "Kilo Code" },
  "roo-code": { src: "https://www.google.com/s2/favicons?domain=kilo.ai&sz=128", bg: "#101827", label: "Kilo Code" },
  "gemini": { src: "https://cdn.simpleicons.org/googlegemini/8E75FF", bg: "#151225", label: "Gemini" },
  "google gemini": { src: "https://cdn.simpleicons.org/googlegemini/8E75FF", bg: "#151225", label: "Gemini" },
  "grok": { src: "https://cdn.simpleicons.org/x/ffffff", bg: "#050505", label: "Grok" },
  "deepseek": { src: "https://cdn.simpleicons.org/deepseek/4D6BFF", bg: "#11182c", label: "DeepSeek" },
  "perplexity": { src: "https://cdn.simpleicons.org/perplexity/20B8CD", bg: "#071b1e", label: "Perplexity" },
  "midjourney": { src: "https://cdn.simpleicons.org/midjourney/ffffff", bg: "#101010", label: "Midjourney" },
  "dall·e": { src: "https://cdn.simpleicons.org/openai/ffffff", bg: "#111827", label: "DALL·E" },
  "dall-e": { src: "https://cdn.simpleicons.org/openai/ffffff", bg: "#111827", label: "DALL·E" },
  "dalle": { src: "https://cdn.simpleicons.org/openai/ffffff", bg: "#111827", label: "DALL·E" },
  "dall·e 3": { src: "https://cdn.simpleicons.org/openai/ffffff", bg: "#111827", label: "DALL·E" },
  "stable diffusion": { src: "https://cdn.simpleicons.org/stablediffusion/7C3AED", bg: "#171126", label: "Stable Diffusion" },
  "stability ai": { src: "https://cdn.simpleicons.org/stabilityai/ffffff", bg: "#111827", label: "Stability AI" },
  "runway": { src: "https://cdn.simpleicons.org/runway/ffffff", bg: "#101010", label: "Runway" },
  "runway gen-4": { src: "https://cdn.simpleicons.org/runway/ffffff", bg: "#101010", label: "Runway" },
  "kling": { src: "https://cdn.simpleicons.org/kuaishou/FF4906", bg: "#241008", label: "Kling" },
  "kling 2.6": { src: "https://cdn.simpleicons.org/kuaishou/FF4906", bg: "#241008", label: "Kling" },
  "pika": { src: "https://cdn.simpleicons.org/pika/ffffff", bg: "#23113d", label: "Pika" },
  "pika 2.5": { src: "https://cdn.simpleicons.org/pika/ffffff", bg: "#23113d", label: "Pika" },
  "elevenlabs": { src: "https://cdn.simpleicons.org/elevenlabs/ffffff", bg: "#050505", label: "ElevenLabs" },
  "playht": { src: "https://cdn.simpleicons.org/playcanvas/ef4444", bg: "#251010", label: "PlayHT" },
  "jasper": { src: "https://cdn.simpleicons.org/jasper/8A3FFC", bg: "#1b1230", label: "Jasper" },
  "copy.ai": { src: "https://cdn.simpleicons.org/copydotai/10B981", bg: "#082018", label: "Copy.ai" },
  "copyai": { src: "https://cdn.simpleicons.org/copydotai/10B981", bg: "#082018", label: "Copy.ai" },
  "zapier": { src: "https://cdn.simpleicons.org/zapier/FF4A00", bg: "#241006", label: "Zapier" },
  "make": { src: "https://cdn.simpleicons.org/make/6D00CC", bg: "#190b24", label: "Make" },
  "n8n": { src: "https://cdn.simpleicons.org/n8n/EA4B71", bg: "#240b14", label: "n8n" },
  "github copilot": { src: "https://cdn.simpleicons.org/github/ffffff", bg: "#111827", label: "GitHub Copilot" },
  "copilot": { src: "https://cdn.simpleicons.org/github/ffffff", bg: "#111827", label: "Copilot" },
  "cursor": { src: "https://cdn.simpleicons.org/cursor/ffffff", bg: "#050505", label: "Cursor" },
  "windsurf": { src: "https://cdn.simpleicons.org/codeium/09B6A2", bg: "#071c1a", label: "Windsurf" },
  "codeium": { src: "https://cdn.simpleicons.org/codeium/09B6A2", bg: "#071c1a", label: "Codeium" },
  "lovable": { src: "https://cdn.simpleicons.org/lovable/FF5A5F", bg: "#271014", label: "Lovable" },
  "bolt.new": { src: "https://cdn.simpleicons.org/stackblitz/1389FD", bg: "#071426", label: "Bolt" },
  "bolt": { src: "https://cdn.simpleicons.org/stackblitz/1389FD", bg: "#071426", label: "Bolt" },
  "replit": { src: "https://cdn.simpleicons.org/replit/F26207", bg: "#241008", label: "Replit" },
  "v0": { src: "https://cdn.simpleicons.org/vercel/ffffff", bg: "#050505", label: "v0" },
};

const TOOL_DOMAINS: Record<string, string> = {
  "chatgpt": "chatgpt.com",
  "openai": "openai.com",
  "openai tts": "openai.com",
  "claude": "claude.ai",
  "claude code": "claude.ai",
  "anthropic": "anthropic.com",
  "cline": "cline.bot",
  "kilo code": "kilo.ai",
  "kilocode": "kilo.ai",
  "kilo": "kilo.ai",
  "roo code": "kilo.ai",
  "roocode": "kilo.ai",
  "roo-code": "kilo.ai",
  "gemini": "gemini.google.com",
  "google gemini": "gemini.google.com",
  "grok": "x.ai",
  "deepseek": "deepseek.com",
  "perplexity": "perplexity.ai",
  "midjourney": "midjourney.com",
  "dall·e": "openai.com",
  "dall-e": "openai.com",
  "dalle": "openai.com",
  "dall·e 3": "openai.com",
  "stable diffusion": "stability.ai",
  "stability ai": "stability.ai",
  "runway": "runwayml.com",
  "runway gen-4": "runwayml.com",
  "kling": "klingai.com",
  "kling 2.6": "klingai.com",
  "pika": "pika.art",
  "pika 2.5": "pika.art",
  "elevenlabs": "elevenlabs.io",
  "playht": "play.ht",
  "jasper": "jasper.ai",
  "copy.ai": "copy.ai",
  "copyai": "copy.ai",
  "zapier": "zapier.com",
  "make": "make.com",
  "n8n": "n8n.io",
  "github copilot": "github.com",
  "copilot": "github.com",
  "cursor": "cursor.com",
  "windsurf": "windsurf.com",
  "codeium": "codeium.com",
  "lovable": "lovable.dev",
  "bolt.new": "bolt.new",
  "bolt": "bolt.new",
  "replit": "replit.com",
  "v0": "v0.dev",
};

function normalizeToolName(name: string) {
  return name
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s*\([^)]*\)\s*/g, "")
    .replace(/\s+(pro|max|team|teams|enterprise|preview|beta)$/g, "")
    .trim();
}

function isRooCodeName(name: string) {
  const normalized = normalizeToolName(name).replace(/[\s_-]/g, "");
  return normalized === "roocode";
}

function getDisplayToolName(name: string) {
  return isRooCodeName(name) ? "Kilo Code" : name;
}

function findMappedValue<T>(map: Record<string, T>, toolName: string): T | undefined {
  const normalized = normalizeToolName(toolName);
  if (map[normalized]) return map[normalized];
  const partial = Object.entries(map).find(([key]) => normalized.includes(key) || key.includes(normalized));
  return partial?.[1];
}

function getToolLogo(toolName: string) {
  return findMappedValue(TOOL_LOGOS, toolName);
}

function getToolDomain(toolName: string) {
  return findMappedValue(TOOL_DOMAINS, toolName);
}

function ToolLogo({ tool, size = 24, className = "" }: { tool: ToolLike; size?: number; className?: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const logo = getToolLogo(tool.name);
  const domain = getToolDomain(tool.name);
  const color = tool.color ?? "#00e6be";
  const explicitLogo = tool.logo && /^https?:\/\//.test(tool.logo) ? tool.logo : undefined;
  const sources = [
    explicitLogo,
    domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : undefined,
    logo?.src,
    domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : undefined,
  ].filter(Boolean) as string[];
  const src = sources[sourceIndex];
  const fallback = (logo?.label ?? getDisplayToolName(tool.name)).slice(0, 2).replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "AI";

  return (
    <span
      className={`tool-logo ${className}`}
      title={getDisplayToolName(tool.name)}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: logo?.bg ?? `${color}14`,
        borderColor: `${color}35`,
      }}
    >
      {src && sourceIndex < sources.length ? (
        <img
          src={src}
          alt=""
          width={Math.max(14, Math.round(size * 0.68))}
          height={Math.max(14, Math.round(size * 0.68))}
          loading="lazy"
          decoding="async"
          onError={() => setSourceIndex((current) => Math.min(current + 1, sources.length))}
        />
      ) : (
        <span style={{ color }}>{fallback}</span>
      )}
    </span>
  );
}

function NeurifluxLogoMark({ size = 22 }: { size?: number }) {
  return (
    <span className="nf-logo-mark" aria-hidden="true" style={{ width: size, height: size, minWidth: size }}>
      <span className="nf-logo-dot" />
      <span className="nf-logo-n">N</span>
    </span>
  );
}

const TAG_MAP: Record<string, { fr: string; en: string; color: string }> = {
  Chatbots:     { fr: "Chatbots",     en: "Chatbots",     color: "#00e6be" },
  Code:         { fr: "Code",         en: "Code",         color: "#3b82f6" },
  Rédaction:    { fr: "Rédaction",    en: "Writing",      color: "#f59e0b" },
  Writing:      { fr: "Rédaction",    en: "Writing",      color: "#f59e0b" },
  Image:        { fr: "Image",        en: "Image",        color: "#a855f7" },
  Productivité: { fr: "Productivité", en: "Productivity", color: "#10b981" },
  Productivity: { fr: "Productivité", en: "Productivity", color: "#10b981" },
  Audio:        { fr: "Audio",        en: "Audio",        color: "#ef4444" },
  Video:        { fr: "Vidéo",        en: "Video",        color: "#e11d48" },
  Vidéo:        { fr: "Vidéo",        en: "Video",        color: "#e11d48" },
};

const canonical = (tag: string): string => TAG_MAP[tag]?.fr ?? tag;
const gc = (tag: string): string => TAG_MAP[tag]?.color ?? "#00e6be";
const tagLabel = (tag: string, lang: Lang): string => TAG_MAP[tag]?.[lang] ?? tag;
const getAllCanonicalTags = (): string[] => {
  const seen = new Set<string>();
  COMPARATIFS.forEach(c => { const cv = canonical(c.tag); if (!seen.has(cv)) seen.add(cv); });
  return Array.from(seen);
};

const isNew = (d: string): boolean => {
  try { return (Date.now() - new Date(d).getTime()) / 86400000 <= 12; }
  catch { return false; }
};


const T = {
  fr: {
    nav: { aifinder:"Ai-Finder", aitools:"Ai-Tools", blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "Comparatifs & Benchmarks",
    title: "Les comparatifs", accent: "Neuriflux",
    subtitle: "Tests approfondis, scoring transparent, verdicts sans compromis sur les meilleurs outils IA.",
    pain: "Arrêtez de payer des outils IA moyens juste parce que leur landing page est belle. Ici, on classe ce qui tient vraiment la route.",
    seoIntro: "Cette page regroupe nos comparatifs IA 2026 : chatbots, outils de code, génération d’images, vidéo IA, automatisation, rédaction et productivité. Chaque comparatif est pensé pour aider à choisir vite, sans sacrifier la précision.",
    sortFeatured: "Pertinence", sortScore: "Meilleur score", sortNewest: "Plus récent", clearFilters: "Réinitialiser", topPick: "Notre sélection",
    trust: [
      { icon: "🔬", t: "Tests en conditions réelles", d: "Jamais de démo ou de press kit" },
      { icon: "⚖️", t: "Méthode de scoring fixe", d: "Critères pondérés, appliqués partout" },
      { icon: "💰", t: "Affiliation transparente", d: "Chaque lien sponsorisé est signalé" },
    ],
    search: "Rechercher un comparatif ou un outil...",
    all: "Tous", featured: "À la une", allLabel: "Tous les comparatifs",
    vs: "vs", winner: "Gagnant", see: "Lire →",
    noResults: "Aucun comparatif ne correspond à votre recherche.",
    tools: "outils", new: "Nouveau", resultCount: "résultat(s)", readers: "lecteurs",
    ctaTitle: "Zéro bruit. Que du signal.",
    ctaDesc: "Les meilleurs outils IA de la semaine, testés et résumés en 5 minutes. Rejoins 4 200+ lecteurs.",
    ctaPlaceholder: "ton@email.com", ctaCta: "Je m'abonne →", ctaSent: "✓ Bienvenue !",
    ctaNo: "Sans spam. Résiliable en 1 clic.",
    ctaMiniText: "lecteurs suivent nos comparatifs chaque semaine.", ctaMiniBtn: "Rejoindre →",
    blogCtaLabel: "Vous cherchez une review solo ?", blogCta: "Voir tous les articles →",
    statsComps: "comparatifs", statsTools: "outils évalués", statsReaders: "lecteurs", statsYear: "mis à jour",
    methodTitle: "Comment nous scorons les outils IA",
    methodText: "Chaque comparatif utilise la même logique : tests en conditions réelles, cas d’usage concrets, limites visibles, rapport qualité/prix et stabilité. L’objectif n’est pas de sacrer l’outil le plus connu, mais celui qui répond le mieux au besoin réel.",
    methodItems: ["Qualité du résultat", "Facilité d’usage", "Prix", "Fiabilité", "Confidentialité", "API & intégrations"],
    quickTitle: "Explorer rapidement",
    quickLinks: ["Chatbots", "Code", "Image", "Vidéo", "Productivité", "Audio"],
    ftTagline: "Le média indépendant des outils IA.", ftContent: "Contenu", ftLegal: "Légal",
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
    nav: { aifinder:"Ai-Finder", aitools:"Ai-Tools", blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    badge: "Comparisons & Benchmarks",
    title: "Neuriflux", accent: "Comparisons",
    subtitle: "In-depth tests, transparent scoring, no-compromise verdicts on the best AI tools.",
    pain: "Stop paying for average AI tools just because their landing page looks good. We rank what actually holds up in real use.",
    seoIntro: "This page gathers our 2026 AI comparisons across chatbots, coding tools, AI image generation, AI video, automation, writing and productivity. Each benchmark is built to help you choose faster without losing precision.",
    sortFeatured: "Relevance", sortScore: "Best score", sortNewest: "Newest", clearFilters: "Clear filters", topPick: "Top pick",
    trust: [
      { icon: "🔬", t: "Real-world testing", d: "No demos, no press kits" },
      { icon: "⚖️", t: "Fixed scoring method", d: "Weighted criteria, applied consistently" },
      { icon: "💰", t: "Transparent affiliation", d: "Every sponsored link is disclosed" },
    ],
    search: "Search comparisons or tools...",
    all: "All", featured: "Featured", allLabel: "All comparisons",
    vs: "vs", winner: "Winner", see: "Read →",
    noResults: "No comparisons match your search.",
    tools: "tools", new: "New", resultCount: "result(s)", readers: "readers",
    ctaTitle: "Zero noise. Pure signal.",
    ctaDesc: "The best AI tools of the week, tested and summarized in 5 minutes. Join 4,200+ readers.",
    ctaPlaceholder: "your@email.com", ctaCta: "Subscribe →", ctaSent: "✓ Welcome!",
    ctaNo: "No spam. Unsubscribe in 1 click.",
    ctaMiniText: "readers follow our comparisons every week.", ctaMiniBtn: "Join now →",
    blogCtaLabel: "Looking for a solo review?", blogCta: "Browse all articles →",
    statsComps: "comparisons", statsTools: "tools evaluated", statsReaders: "readers", statsYear: "up to date",
    methodTitle: "How we score AI tools",
    methodText: "Every comparison follows the same logic: real-world testing, concrete workflows, visible limits, value for money and reliability. The goal is not to crown the most famous tool, but the tool that best matches the actual need.",
    methodItems: ["Output quality", "Ease of use", "Pricing", "Reliability", "Privacy", "API & integrations"],
    quickTitle: "Explore faster",
    quickLinks: ["Chatbots", "Code", "Image", "Video", "Productivity", "Audio"],
    ftTagline: "The independent AI tools media.", ftContent: "Content", ftLegal: "Legal",
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
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 300, background: "rgba(0,0,0,.5)" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#00e6be,#3b82f6,#e11d48)", transition: "width .08s linear", boxShadow: "0 0 12px rgba(0,230,190,.6)" }} />
    </div>
  );
}

function useDebouncedValue<T>(value: T, delay = 120) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

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

function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    const move = (e: PointerEvent) => {
      if (!ref.current) return;
      ref.current.style.setProperty("--mx", `${e.clientX}px`);
      ref.current.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced]);
  if (reduced) return null;
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

function getBestScore(c: Comparatif) {
  return Math.max(...c.tools.map((tool) => tool.globalScore));
}

function getWinnerTool(c: Comparatif) {
  const normalizedWinner = normalizeToolName(c.winner);
  return (
    c.tools.find((tool) => normalizeToolName(tool.name) === normalizedWinner) ??
    c.tools.find((tool) => normalizeToolName(tool.name).includes(normalizedWinner) || normalizedWinner.includes(normalizeToolName(tool.name))) ??
    [...c.tools].sort((a, b) => b.globalScore - a.globalScore)[0]
  );
}

function sortComparatifs(items: Comparatif[], sort: SortMode) {
  const copy = [...items];
  if (sort === "score") return copy.sort((a, b) => getBestScore(b) - getBestScore(a));
  if (sort === "newest") return copy.sort((a, b) => new Date(b.date.en).getTime() - new Date(a.date.en).getTime());
  return copy.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || getBestScore(b) - getBestScore(a));
}

function NeurifluxScore({ score, color, compact = false }: { score: number; color: string; compact?: boolean }) {
  return (
    <div className={`nf-score${compact ? " compact" : ""}`} style={{ borderColor: `${color}35`, background: `${color}0b` }}>
      <span className="nf-score-brand">
        <NeurifluxLogoMark size={compact ? 18 : 22} />
        <span className="nf-score-label">Neuriflux Score™</span>
      </span>
      <span className="nf-score-val" style={{ color }}>{score.toFixed(1)}</span>
    </div>
  );
}

function StatNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        if (reduced) { setVal(target); return; }
        const dur = 1200, t0 = Date.now();
        const tick = () => {
          const p = Math.min(1, (Date.now() - t0) / dur);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, reduced]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function MiniScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
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
    <div ref={ref} style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${w}%`, background: `linear-gradient(90deg,${color},${color}bb)`, borderRadius: 2, transition: "width 1s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 8px ${color}50` }} />
    </div>
  );
}

function ComparatifCard({ c, lang, t, l, isFeatured, animDelay }: {
  c: Comparatif; lang: Lang; t: typeof T["fr"]; l: (p: string) => string;
  isFeatured?: boolean; animDelay?: number;
}) {
  const [hov, setHov] = useState(false);
  const cl = c[lang];
  const tagColor = gc(c.tag);
  const winnerTool = getWinnerTool(c);
  const winnerScore = winnerTool?.globalScore ?? getBestScore(c);
  const sorted = [...c.tools].sort((a, b) => b.globalScore - a.globalScore);
  const _new = isNew(c.date.en);
  return (
    <a
      href={l(`/comparatifs/${c.slug}`)}
      aria-label={cl.title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `linear-gradient(145deg,${tagColor}07 0%,var(--bg2) 60%)` : "var(--bg2)",
        border: `1px solid ${hov ? tagColor + "38" : "var(--border)"}`,
        borderRadius: 18, padding: "1.85rem 2rem",
        display: "flex", flexDirection: "column" as const, gap: "1.35rem",
        textDecoration: "none",
        transition: "border-color .22s, transform .22s, box-shadow .22s, background .22s",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov
          ? `0 28px 64px rgba(0,0,0,.55), 0 0 0 1px ${tagColor}18, inset 0 1px 0 rgba(255,255,255,.04)`
          : "0 2px 16px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03)",
        position: "relative" as const, overflow: "hidden",
        animation: `fadeUp 0.5s ease ${animDelay || 0}ms both`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${tagColor},${tagColor}60,transparent 70%)`, opacity: hov ? 1 : isFeatured ? 0.75 : 0.4, transition: "opacity .25s" }} />
      <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 340, height: 240, background: `radial-gradient(ellipse,${tagColor}08,transparent 65%)`, opacity: hov ? 1 : 0, transition: "opacity .3s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-40%", left: "20%", width: 200, height: 180, background: `radial-gradient(ellipse,${tagColor}04,transparent 70%)`, opacity: hov ? 1 : 0, transition: "opacity .3s", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: ".4rem", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".35rem", flexWrap: "wrap" as const }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", letterSpacing: ".1em", textTransform: "uppercase" as const, fontWeight: 700, color: tagColor, background: `${tagColor}12`, border: `1px solid ${tagColor}28`, padding: "3px 10px", borderRadius: 100 }}>
            {tagLabel(c.tag, lang)}
          </span>
          {isFeatured && (
            <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#f59e0b", fontWeight: 700, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.22)", padding: "3px 8px", borderRadius: 100 }}>
              ★ {lang === "fr" ? "À la une" : "Featured"}
            </span>
          )}
          {_new && (
            <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#10b981", fontWeight: 700, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.22)", padding: "3px 8px", borderRadius: 100 }}>
              ✦ {t.new}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)" }}>{c.date[lang]}</span>
        </div>
      </div>

      <div style={{ fontFamily: "var(--d)", fontSize: isFeatured ? "1.1rem" : "1rem", fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1.22, color: "var(--text)", position: "relative" }}>
        {cl.title}
      </div>

      <NeurifluxScore score={winnerScore} color={tagColor} />

      <div style={{ fontFamily: "var(--m)", fontSize: ".74rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.68, display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: 2, overflow: "hidden", position: "relative" }}>
        {cl.desc}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".35rem", flexWrap: "wrap" as const, position: "relative" }}>
        {c.tools.map((tool, i) => (
          <span key={tool.name} style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: ".3rem",
              background: hov ? `${tool.color}10` : "var(--bg3)",
              border: `1px solid ${hov ? tool.color + "28" : "var(--border)"}`,
              borderRadius: 9, padding: "5px 10px 5px 7px",
              fontFamily: "var(--m)", fontSize: ".68rem",
              color: hov ? tool.color : "var(--muted)",
              transition: "all .2s",
              fontWeight: tool.name === c.winner ? 600 : 300,
            }}>
              <ToolLogo tool={tool} size={22} />
              {getDisplayToolName(tool.name)}
              {normalizeToolName(tool.name) === normalizeToolName(c.winner) && <span style={{ fontSize: ".65rem", color: tagColor }}>🏆</span>}
            </span>
            {i < c.tools.length - 1 && (
              <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", color: "var(--dim)", fontWeight: 600, letterSpacing: ".04em" }}>{t.vs}</span>
            )}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: ".5rem", position: "relative" }}>
        {sorted.map((tool, i) => (
          <div key={tool.name} style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <span style={{ fontFamily: "var(--m)", fontSize: ".63rem", color: tool.name === c.winner ? tool.color : "var(--muted)", fontWeight: tool.name === c.winner ? 700 : 300, minWidth: 68, lineHeight: 1 }}>
              {getDisplayToolName(tool.name)}
            </span>
            <MiniScoreBar score={tool.globalScore} color={tool.color} delay={i * 100} />
            <span style={{ fontFamily: "var(--m)", fontSize: ".7rem", fontWeight: 800, color: tool.color, minWidth: 30, textAlign: "right" as const }}>
              {tool.globalScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer winner + CTA
          FIX: on utilise border shorthand complet en expression ternaire
          au lieu de mixer border + borderColor séparément */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: "1.1rem",
        borderTop: `1px solid ${hov ? tagColor + "20" : "rgba(255,255,255,.05)"}`,
        marginTop: "auto", transition: "border-top-color .25s", position: "relative",
        flexWrap: "wrap" as const, gap: ".5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <div style={{
            width: 34, height: 34,
            background: hov ? `${tagColor}18` : `${tagColor}10`,
            border: hov ? `1px solid ${tagColor}40` : `1px solid ${tagColor}25`,
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.05rem", transition: "background .2s, border-color .2s",
          }}>
            {winnerTool ? <ToolLogo tool={winnerTool} size={28} /> : <NeurifluxLogoMark size={24} />}
          </div>
          <div>
            <div style={{ fontFamily: "var(--m)", fontSize: ".54rem", color: "var(--dim)", letterSpacing: ".1em", textTransform: "uppercase" as const, marginBottom: ".1rem" }}>
              🏆 {t.winner}
            </div>
            <div style={{ fontFamily: "var(--d)", fontSize: ".85rem", fontWeight: 800, color: tagColor, letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: ".3rem" }}>
              {getDisplayToolName(c.winner)}
              <span style={{ fontFamily: "var(--m)", fontSize: ".65rem", fontWeight: 700 }}>{winnerScore.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: ".35rem",
          fontFamily: "var(--m)", fontSize: ".7rem", fontWeight: 700,
          color: hov ? "#080c10" : tagColor,
          background: hov ? tagColor : `${tagColor}10`,
          border: `1px solid ${tagColor}`,
          borderRadius: 8, padding: "7px 14px",
          transition: "all .2s",
          boxShadow: hov ? `0 4px 16px ${tagColor}30` : "none",
        }}>
          {t.see} <span style={{ fontSize: ".75rem" }}>→</span>
        </div>
      </div>
    </a>
  );
}

function NewsletterCTA({ t, lang }: { t: typeof T["fr"]; lang: Lang }) {
  const [email, setEmail] = useState("");
  const { status, subscribe } = useNewsletter("comparatifs");
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || isLoading) return;
    await subscribe(email, lang);
    setEmail("");
  };
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(0,230,190,.07),rgba(59,130,246,.04))", border: "1px solid rgba(0,230,190,.18)", borderRadius: 18, padding: "clamp(2rem,4vw,2.75rem)", marginBottom: "5rem" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,230,190,.5) 40%,rgba(0,230,190,.5) 60%,transparent)" }} />
      <div style={{ position: "absolute", top: "-50%", right: "-8%", width: 420, height: 340, background: "radial-gradient(ellipse,rgba(0,230,190,.07),transparent 68%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" as const, gap: "1.35rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" as const }}>
          <div style={{ width: 46, height: 46, background: "rgba(0,230,190,.1)", border: "1px solid rgba(0,230,190,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>✉</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--d)", fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-.025em", color: "var(--text)", marginBottom: ".3rem" }}>{t.ctaTitle}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: ".75rem", color: "var(--muted)", lineHeight: 1.7, fontWeight: 300 }}>{t.ctaDesc}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" as const, maxWidth: 500 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.ctaPlaceholder} required
            style={{ flex: 1, minWidth: 200, background: "rgba(8,12,16,.8)", border: "1px solid rgba(0,230,190,.22)", borderRadius: 9, padding: "10px 14px", color: "var(--text)", fontFamily: "var(--m)", fontSize: ".78rem", outline: "none", transition: "border-color .18s" }} />
          <button type="submit" disabled={isLoading} style={{ background: isSuccess ? "#10b981" : "var(--cyan)", color: "#080c10", border: "none", borderRadius: 9, padding: "10px 22px", fontFamily: "var(--d)", fontSize: ".82rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" as const, transition: "all .2s", letterSpacing: "-.01em" }}>
            {isLoading ? "..." : isSuccess ? t.ctaSent : t.ctaCta}
          </button>
        </form>
        <span style={{ fontFamily: "var(--m)", fontSize: ".62rem", color: "var(--dim)" }}>{t.ctaNo}</span>
      </div>
    </div>
  );
}


function FeaturedComparisonHero({ c, lang, t, l }: { c?: Comparatif; lang: Lang; t: typeof T["fr"]; l: (p: string) => string }) {
  if (!c) return null;
  const tagColor = gc(c.tag);
  const winnerTool = getWinnerTool(c);
  const winnerScore = winnerTool?.globalScore ?? getBestScore(c);
  const cl = c[lang];
  const sorted = [...c.tools].sort((a, b) => b.globalScore - a.globalScore);

  return (
    <section className="featured-hero" style={{ borderColor: `${tagColor}26` }}>
      <div className="featured-hero-glow" style={{ background: `radial-gradient(ellipse,${tagColor}14,transparent 65%)` }} />
      <div className="featured-copy">
        <div className="sec-label">{t.topPick}</div>
        <h2>{cl.title}</h2>
        <p>{cl.desc}</p>
        <div className="featured-tools">
          {c.tools.map((tool, index) => (
            <span key={tool.name} className="featured-chip" style={{ borderColor: `${tool.color}26`, color: tool.color, background: `${tool.color}0d` }}>
              <ToolLogo tool={tool} size={22} />{getDisplayToolName(tool.name)}{index < c.tools.length - 1 ? <em>{t.vs}</em> : null}
            </span>
          ))}
        </div>
        <a className="featured-action" href={l(`/comparatifs/${c.slug}`)} aria-label={cl.title} style={{ background: tagColor }}>
          {t.see}
        </a>
      </div>
      <div className="featured-panel">
        <NeurifluxScore score={winnerScore} color={tagColor} />
        <div className="featured-winner">
          <span>🏆 {t.winner}</span>
          <strong style={{ color: tagColor }}>{getDisplayToolName(c.winner)}</strong>
        </div>
        <div className="featured-ranking">
          {sorted.map((tool, index) => (
            <div key={tool.name} className="featured-row">
              <span><ToolLogo tool={tool} size={18} />{index + 1}. {getDisplayToolName(tool.name)}</span>
              <MiniScoreBar score={tool.globalScore} color={tool.color} delay={index * 90} />
              <strong style={{ color: tool.color }}>{tool.globalScore.toFixed(1)}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodologyBlock({ t }: { t: typeof T["fr"] }) {
  return (
    <section className="method-block">
      <div>
        <div className="sec-label">Method</div>
        <h2>{t.methodTitle}</h2>
        <p>{t.methodText}</p>
      </div>
      <div className="method-grid">
        {t.methodItems.map((item, index) => (
          <div key={item} className="method-item">
            <span>0{index + 1}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ComparatifsClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 120);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavCta, setShowNavCta] = useState(false);
  const [toolbarSticky, setToolbarSticky] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarTop = useRef(0);

  const t = T[lang];
  const canonicalTags = useMemo(() => getAllCanonicalTags(), []);
  const l = useCallback((path: string) => `/${lang}${path}`, [lang]);

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 60);
      setShowNavCta(window.scrollY > 320);
      if (toolbarRef.current) {
        if (!toolbarTop.current) toolbarTop.current = toolbarRef.current.getBoundingClientRect().top + window.scrollY;
        setToolbarSticky(window.scrollY > toolbarTop.current - 62);
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const filtered = useMemo(() => {
    const base = COMPARATIFS.filter(c => {
      const matchTag = activeTag === "all" || canonical(c.tag) === activeTag;
      const matchSearch = !debouncedSearch ||
        c[lang].title.toLowerCase().includes(debouncedSearch) ||
        c[lang].desc.toLowerCase().includes(debouncedSearch) ||
        getDisplayToolName(c.winner).toLowerCase().includes(debouncedSearch) ||
        c.tools.some(tool => tool.name.toLowerCase().includes(debouncedSearch) || getDisplayToolName(tool.name).toLowerCase().includes(debouncedSearch));
      return matchTag && matchSearch;
    });
    return sortComparatifs(base, sortMode);
  }, [activeTag, debouncedSearch, lang, sortMode]);

  const featured = useMemo(() => filtered.filter(c => c.featured), [filtered]);
  const rest = useMemo(() => filtered.filter(c => !c.featured), [filtered]);
  const totalTools = useMemo(() => COMPARATIFS.reduce((acc, c) => acc + c.tools.length, 0), []);
  const topComparison = useMemo(() => COMPARATIFS.find(c => c.featured) ?? sortComparatifs(COMPARATIFS, "score")[0], []);
  const clearFilters = () => { setSearch(""); setActiveTag("all"); setSortMode("featured"); };

  const itemListSchema = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: lang === "fr" ? "Comparatifs IA 2026 — Neuriflux" : "AI Comparisons 2026 — Neuriflux",
    description: t.subtitle,
    url: `https://neuriflux.com/${lang}/comparatifs`,
    numberOfItems: COMPARATIFS.length,
    itemListElement: COMPARATIFS.map((c, i) => ({
      "@type": "ListItem", position: i + 1,
      name: c[lang].title,
      url: `https://neuriflux.com/${lang}/comparatifs/${c.slug}`,
      description: c[lang].desc,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: COMPARATIFS.slice(0, 5).map(c => {
      const w = c.tools.find(tool => tool.name === c.winner);
      return {
        "@type": "Question",
        name: lang === "fr"
          ? `Quel est le meilleur outil parmi ${c.tools.map(t => getDisplayToolName(t.name)).join(", ")} ?`
          : `Which is the best among ${c.tools.map(t => getDisplayToolName(t.name)).join(", ")}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: lang === "fr"
            ? `D'après nos tests, ${getDisplayToolName(c.winner)} est le meilleur avec ${w?.globalScore.toFixed(1)}/10. ${c[lang].verdict}`
            : `Based on our testing, ${getDisplayToolName(c.winner)} is the best with ${w?.globalScore.toFixed(1)}/10. ${c[lang].verdict}`,
        },
      };
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <link rel="alternate" hrefLang="fr" href="https://neuriflux.com/fr/comparatifs" />
      <link rel="alternate" hrefLang="en" href="https://neuriflux.com/en/comparatifs" />

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,.065);--glow:rgba(0,230,190,.2);
          --cyan:#00e6be;--cdim:rgba(0,230,190,.09);
          --text:#edf2f7;--muted:#5a6a7a;--dim:#2a3a4a;
          --d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;
          --pad:clamp(1.25rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.015) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-15%;left:50%;transform:translateX(-50%);width:1100px;height:750px;background:radial-gradient(ellipse,rgba(0,230,190,.045) 0%,transparent 65%);pointer-events:none;z-index:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
        nav{position:sticky;top:0;z-index:200;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(8,12,16,.95);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .25s}
        nav.scrolled{box-shadow:0 4px 32px rgba(0,0,0,.55)}

        .tool-logo{display:inline-flex;align-items:center;justify-content:center;border:1px solid;border-radius:8px;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.22);vertical-align:middle;flex-shrink:0;transition:transform .18s,border-color .18s,box-shadow .18s}
        .tool-logo img{display:block;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
        .tool-logo span{font-family:var(--d);font-weight:900;font-size:.48rem;letter-spacing:-.04em;line-height:1}
        a:hover .tool-logo,.featured-chip:hover .tool-logo{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 8px 22px rgba(0,0,0,.34)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite;flex-shrink:0}
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
        .nav-cta{display:flex;align-items:center;gap:.4rem;font-family:var(--d);font-weight:700;font-size:.73rem;padding:6px 14px;border-radius:7px;text-decoration:none;animation:slideDown .3s ease;white-space:nowrap;transition:all .18s;color:#080c10}
        .nav-cta:hover{transform:translateY(-1px);filter:brightness(1.12)}
        @media(max-width:560px){.nav-cta span{display:none}}
        .wrap{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:0 var(--pad)}
        .hero{padding:clamp(4rem,8vw,7rem) 0 0}
        .hero-eyebrow{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.68rem;letter-spacing:.08em;color:var(--cyan);background:var(--cdim);border:1px solid rgba(0,230,190,.2);border-radius:100px;padding:5px 14px;margin-bottom:1.6rem;animation:fadeUp .5s ease both}
        .hero-eyebrow-dot{width:5px;height:5px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite;flex-shrink:0}
        .hero h1{font-size:clamp(2.6rem,6.5vw,4.5rem);font-weight:800;letter-spacing:-.045em;line-height:.97;margin-bottom:1.25rem;animation:fadeUp .5s .08s ease both}
        .hero h1 .ac{color:var(--cyan)}
        .hero-sub{font-family:var(--m);font-size:.87rem;color:var(--muted);font-weight:300;line-height:1.72;max-width:500px;animation:fadeUp .5s .16s ease both}
        .hero-layout{display:grid;grid-template-columns:1fr 260px;gap:3rem;align-items:start;margin-bottom:2.5rem}
        @media(max-width:780px){.hero-layout{grid-template-columns:1fr}.hero-aside{display:none!important}}
        .hero-aside{display:flex;flex-direction:column;gap:.6rem;padding-top:.5rem}
        .hstat{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:1rem 1.25rem;transition:all .2s;cursor:default}
        .hstat:hover{border-color:rgba(0,230,190,.18);transform:translateX(-2px)}
        .hstat-val{font-family:var(--d);font-size:1.6rem;font-weight:800;letter-spacing:-.05em;color:var(--cyan);line-height:1;margin-bottom:.2rem}
        .hstat-lbl{font-family:var(--m);font-size:.58rem;color:var(--muted);font-weight:300;letter-spacing:.06em;text-transform:uppercase;line-height:1.4}
        .trust-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden;animation:fadeUp .5s .24s ease both}
        @media(max-width:640px){.trust-strip{grid-template-columns:1fr}}
        .trust-cell{background:var(--bg2);padding:1.1rem 1.4rem;display:flex;gap:.8rem;align-items:flex-start;transition:background .2s}
        .trust-cell:hover{background:var(--bg3)}
        .trust-icon{font-size:1.15rem;flex-shrink:0;margin-top:.05rem}
        .trust-t{font-family:var(--d);font-size:.78rem;font-weight:700;color:var(--text);margin-bottom:.12rem;letter-spacing:-.01em}
        .trust-d{font-family:var(--m);font-size:.64rem;color:var(--muted);font-weight:300;line-height:1.5}
        .stats-row{display:flex;gap:2.5rem;flex-wrap:wrap;padding:2rem 0 0;border-top:1px solid var(--border);margin-top:2rem;animation:fadeUp .5s .3s ease both}
        .stat-item{display:flex;flex-direction:column;gap:.2rem}
        .stat-num{font-family:var(--d);font-size:1.55rem;font-weight:800;letter-spacing:-.045em;color:var(--cyan)}
        .stat-label{font-family:var(--m);font-size:.6rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
        .toolbar-spacer{height:2.5rem}
        .toolbar{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:.85rem 0;transition:all .2s}
        .toolbar.sticky{position:sticky;top:60px;z-index:90;background:rgba(8,12,16,.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:.75rem var(--pad);margin:0 calc(-1 * var(--pad));box-shadow:0 6px 28px rgba(0,0,0,.45)}
        .search-wrap{position:relative;flex:1;min-width:220px;max-width:380px}
        .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none;font-size:.8rem}
        .search-input{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:9px 13px 9px 36px;color:var(--text);font-family:var(--m);font-size:.77rem;outline:none;transition:border-color .18s}
        .search-input:focus{border-color:rgba(0,230,190,.28)}
        .search-input::placeholder{color:var(--dim)}
        .result-count{font-family:var(--m);font-size:.67rem;color:var(--dim)}
        .filters{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center}
        .ftag{font-family:var(--m);font-size:.67rem;padding:5px 13px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;white-space:nowrap;display:flex;align-items:center;gap:.3rem}
        .ftag:hover{border-color:rgba(0,230,190,.28);color:var(--cyan);background:var(--cdim)}
        .ftag.on{background:var(--cyan);border-color:var(--cyan);color:#080c10;font-weight:700}
        .ftag-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
        .sec-label{font-family:var(--m);font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.4rem;display:flex;align-items:center;gap:.5rem}
        .sec-label::before{content:'';width:16px;height:1px;background:var(--cyan);display:inline-block}
        .grid-featured{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:1.5rem;margin-bottom:1rem}
        .grid-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.25rem;margin-bottom:3.5rem}
        @media(max-width:520px){.grid-featured,.grid-all{grid-template-columns:1fr}}
        .cta-mini{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.6rem;margin:1.5rem 0 3rem}
        .cta-mini-text{font-family:var(--m);font-size:.74rem;color:var(--muted)}
        .cta-mini-text strong{color:var(--cyan);font-weight:700}
        .cta-mini-btn{font-family:var(--m);font-size:.72rem;font-weight:700;color:#080c10;background:var(--cyan);border:none;border-radius:8px;padding:8px 18px;cursor:pointer;white-space:nowrap;text-decoration:none;transition:opacity .18s;display:inline-block}
        .cta-mini-btn:hover{opacity:.85}
        /* FIX 2 — hover blog-crosslink géré en CSS pur, zéro JS inline */
        .blog-crosslink{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;border:1px solid var(--border);border-radius:12px;padding:1.2rem 1.6rem;margin-bottom:3rem;background:var(--bg2);text-decoration:none;transition:border-color .2s,transform .2s}
        .blog-crosslink:hover{border-color:rgba(0,230,190,.2);transform:translateY(-1px)}
        .blog-crosslink-text{font-family:var(--m);font-size:.74rem;color:var(--muted)}
        .blog-crosslink-text strong{color:var(--text);font-weight:600}
        .blog-crosslink-btn{font-family:var(--m);font-size:.72rem;font-weight:600;color:var(--cyan);display:flex;align-items:center;gap:.35rem;white-space:nowrap}
        .no-results{text-align:center;padding:5rem 2rem;font-family:var(--m);color:var(--muted);font-size:.85rem;background:var(--bg2);border:1px solid var(--border);border-radius:18px;margin-bottom:4rem}
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.5rem var(--pad);max-width:1200px;margin:0 auto}
        .ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
        @media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
        .ft-tagline{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.65;max-width:210px;margin-top:.5rem}
        .ft-col-title{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
        .ft-ul{list-style:none;display:flex;flex-direction:column;gap:.45rem}
        .ft-ul a{font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;transition:color .15s;font-weight:300}
        .ft-ul a:hover{color:var(--cyan)}
        .ft-bot{margin-top:1.75rem;padding-top:1.1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}

        .cursor-glow{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(520px circle at var(--mx,50%) var(--my,20%),rgba(0,230,190,.055),transparent 44%);mix-blend-mode:screen}
        .bg-noise{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.055;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E")}
        .hero-sub strong{color:var(--text);font-weight:500}
        .seo-intro{font-family:var(--m);font-size:.7rem;color:var(--dim);line-height:1.8;max-width:860px;margin-top:1rem;animation:fadeUp .5s .2s ease both}
        .quick-row{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1.3rem;animation:fadeUp .5s .22s ease both}
        .quick-pill{font-family:var(--m);font-size:.65rem;color:var(--muted);text-decoration:none;border:1px solid var(--border);background:rgba(255,255,255,.025);border-radius:999px;padding:6px 11px;transition:all .18s}
        .quick-pill:hover{color:var(--cyan);border-color:rgba(0,230,190,.22);background:rgba(0,230,190,.055)}
        .featured-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:1.4rem;background:linear-gradient(145deg,rgba(17,24,32,.98),rgba(8,12,16,.96));border:1px solid var(--border);border-radius:24px;padding:clamp(1.25rem,3.5vw,2rem);margin:2.5rem 0 1.6rem;box-shadow:0 24px 80px rgba(0,0,0,.34);animation:fadeUp .5s .28s ease both}
        .featured-hero-glow{position:absolute;inset:-35% -15% auto auto;width:520px;height:360px;pointer-events:none}
        .featured-copy,.featured-panel{position:relative;z-index:1}
        .featured-copy h2{font-family:var(--d);font-size:clamp(1.35rem,3.4vw,2.35rem);line-height:1.04;letter-spacing:-.045em;margin-bottom:.75rem;color:var(--text)}
        .featured-copy p{font-family:var(--m);font-size:.78rem;line-height:1.75;color:var(--muted);max-width:720px;font-weight:300}
        .featured-tools{display:flex;gap:.45rem;flex-wrap:wrap;margin:1.2rem 0}
        .featured-chip{display:inline-flex;align-items:center;gap:.35rem;border:1px solid var(--border);border-radius:999px;padding:5px 10px;font-family:var(--m);font-size:.68rem;font-weight:600}
        .featured-chip em{font-style:normal;color:var(--dim);margin-left:.15rem}
        .featured-action{display:inline-flex;align-items:center;justify-content:center;border-radius:10px;padding:11px 18px;color:#071018;text-decoration:none;font-family:var(--d);font-size:.82rem;font-weight:850;box-shadow:0 12px 28px rgba(0,0,0,.28);transition:transform .18s,filter .18s}
        .featured-action:hover{transform:translateY(-2px);filter:brightness(1.08)}
        .featured-panel{border:1px solid var(--border);background:rgba(0,0,0,.18);border-radius:18px;padding:1rem;display:flex;flex-direction:column;gap:.85rem}
        .nf-score{display:flex;align-items:center;justify-content:space-between;gap:1rem;border:1px solid var(--border);border-radius:14px;padding:.85rem;background:rgba(255,255,255,.025);box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}
        .nf-score.compact{padding:.65rem .75rem;border-radius:12px}
        .nf-score-brand{display:flex;align-items:center;gap:.55rem;min-width:0}
        .nf-score-label{font-family:var(--m);font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);white-space:nowrap}
        .nf-score-val{font-family:var(--d);font-size:2rem;font-weight:900;letter-spacing:-.05em;line-height:1}
        .nf-logo-mark{display:inline-flex;align-items:center;justify-content:center;position:relative;border-radius:8px;background:linear-gradient(145deg,rgba(0,230,190,.16),rgba(59,130,246,.08));border:1px solid rgba(0,230,190,.28);box-shadow:0 0 18px rgba(0,230,190,.12),inset 0 1px 0 rgba(255,255,255,.08);overflow:hidden}
        .nf-logo-dot{position:absolute;top:5px;right:5px;width:4px;height:4px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite}
        .nf-logo-n{font-family:var(--d);font-weight:900;font-size:.72rem;letter-spacing:-.06em;color:var(--text)}
        .featured-winner{display:flex;align-items:center;justify-content:space-between;gap:1rem;font-family:var(--m);font-size:.68rem;color:var(--muted);border-top:1px solid var(--border);padding-top:.75rem}
        .featured-winner strong{font-family:var(--d);font-size:1rem;letter-spacing:-.02em}
        .featured-ranking{display:flex;flex-direction:column;gap:.55rem}
        .featured-row{display:flex;align-items:center;gap:.65rem}
        .featured-row span{font-family:var(--m);font-size:.64rem;color:var(--muted);min-width:100px;display:flex;align-items:center;gap:.35rem}.featured-row strong{font-family:var(--m);font-size:.68rem;min-width:28px;text-align:right}
        @media(max-width:820px){.featured-hero{grid-template-columns:1fr}.featured-panel{max-width:none}}
        .sort-select{background:var(--bg2);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:var(--m);font-size:.7rem;padding:9px 11px;outline:none;cursor:pointer}.sort-select:focus{border-color:rgba(0,230,190,.28)}
        .clear-btn{font-family:var(--m);font-size:.66rem;color:var(--cyan);background:rgba(0,230,190,.07);border:1px solid rgba(0,230,190,.2);border-radius:999px;padding:7px 11px;cursor:pointer;transition:all .18s}.clear-btn:hover{background:rgba(0,230,190,.13)}
        .method-block{display:grid;grid-template-columns:minmax(0,.9fr) minmax(300px,1.1fr);gap:1.4rem;align-items:start;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));border:1px solid var(--border);border-radius:20px;padding:clamp(1.4rem,3.5vw,2rem);margin:0 0 3rem}.method-block h2{font-size:clamp(1.25rem,2.5vw,1.75rem);letter-spacing:-.035em;line-height:1.08;margin-bottom:.65rem}.method-block p{font-family:var(--m);font-size:.74rem;color:var(--muted);line-height:1.75}.method-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem}.method-item{border:1px solid var(--border);border-radius:14px;background:rgba(8,12,16,.45);padding:.9rem}.method-item span{display:block;font-family:var(--m);font-size:.58rem;color:var(--cyan);letter-spacing:.12em;margin-bottom:.35rem}.method-item strong{font-size:.82rem;color:var(--text)}@media(max-width:760px){.method-block,.method-grid{grid-template-columns:1fr}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.ticker-track{animation:none!important}}
      `}</style>

      <ScrollProgress />
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-noise" />
      <CursorGlow />

      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/aifinder")}>{t.nav.aifinder}</a></li>
          <li><a href={l("/aitools")}>{t.nav.aitools}</a></li>
          <li><a href={l("/blog")}>{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")} className="active">{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/contact")}>{t.nav.contact}</a></li>
          <li><a href={l("/about")}>{t.nav.about}</a></li>
        </ul>
        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
          {showNavCta && (
            <a href={l("/newsletter")} className="nav-cta" style={{ background: "var(--cyan)" }}>
              <span>{lang === "fr" ? "Newsletter gratuite" : "Free newsletter"}</span> →
            </a>
          )}
          <div className="lt">
            <button className={`lb${lang === "fr" ? " on" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " on" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>

      <div className="wrap">
        <div className="hero">
          <div className="hero-layout">
            <div>
              <div className="hero-eyebrow"><div className="hero-eyebrow-dot" />{t.badge}</div>
              <h1>{t.title} <span className="ac">{t.accent}</span></h1>
              <p className="hero-sub">{t.subtitle}</p>
              <p className="hero-sub" style={{ marginTop: ".8rem" }}><strong>{t.pain}</strong></p>
              <p className="seo-intro">{t.seoIntro}</p>
              <div className="quick-row" aria-label={t.quickTitle}>
                {t.quickLinks.map((tag) => (
                  <button key={tag} className="quick-pill" onClick={() => setActiveTag(canonical(tag))}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="hero-aside">
              {[
                { val: COMPARATIFS.length, suffix: "+", label: t.statsComps },
                { val: totalTools, suffix: "", label: t.statsTools },
                { val: 4200, suffix: "+", label: t.statsReaders },
              ].map((s, i) => (
                <div key={i} className="hstat">
                  <div className="hstat-val"><StatNumber target={s.val} suffix={s.suffix} /></div>
                  <div className="hstat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="trust-strip">
            {t.trust.map((item, i) => (
              <div key={i} className="trust-cell">
                <div className="trust-icon">{item.icon}</div>
                <div><div className="trust-t">{item.t}</div><div className="trust-d">{item.d}</div></div>
              </div>
            ))}
          </div>
          <div className="stats-row">
            {[
              { target: COMPARATIFS.length, suffix: "+", label: t.statsComps },
              { target: totalTools, suffix: "", label: t.statsTools },
              { target: 4200, suffix: "+", label: t.statsReaders },
              { target: 2026, suffix: "", label: t.statsYear },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-num"><StatNumber target={s.target} suffix={s.suffix} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <FeaturedComparisonHero c={topComparison} lang={lang} t={t} l={l} />

        <div className="toolbar-spacer" />
        <div ref={toolbarRef} className={`toolbar${toolbarSticky ? " sticky" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flex: 1, flexWrap: "wrap" as const }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" type="text" placeholder={t.search}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(search || activeTag !== "all") && (
              <span className="result-count">{filtered.length} {t.resultCount}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".55rem", flexWrap: "wrap" as const }}>
            <select className="sort-select" value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} aria-label="Sort comparisons">
              <option value="featured">{t.sortFeatured}</option>
              <option value="score">{t.sortScore}</option>
              <option value="newest">{t.sortNewest}</option>
            </select>
            {(search || activeTag !== "all" || sortMode !== "featured") && <button className="clear-btn" onClick={clearFilters}>{t.clearFilters}</button>}
          </div>
          <div className="filters">
            <button aria-label={t.all} className={`ftag${activeTag === "all" ? " on" : ""}`} onClick={() => setActiveTag("all")}>{t.all}</button>
            {canonicalTags.map(canonTag => {
              const color = gc(canonTag);
              const label = tagLabel(canonTag, lang);
              const isActive = activeTag === canonTag;
              return (
                <button key={canonTag} aria-label={label} className={`ftag${isActive ? " on" : ""}`} onClick={() => setActiveTag(canonTag)}>
                  <span className="ftag-dot" style={{ background: isActive ? "#080c10" : color }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ height: "2rem" }} />

        {filtered.length === 0 ? (
          <div className="no-results">
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
            {t.noResults}
            <div style={{ marginTop: "1rem" }}><button className="clear-btn" onClick={clearFilters}>{t.clearFilters}</button></div>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section style={{ marginBottom: "3.5rem" }}>
                <div className="sec-label">{t.featured}</div>
                <div className="grid-featured">
                  {featured.map((c, i) => <ComparatifCard key={c.slug} c={c} lang={lang} t={t} l={l} isFeatured animDelay={i * 80} />)}
                </div>
              </section>
            )}
            {featured.length > 0 && rest.length > 0 && !search && activeTag === "all" && (
              <div className="cta-mini">
                <span className="cta-mini-text">
                  <strong>4{lang === "fr" ? "\u202f" : ","}200+</strong> {t.ctaMiniText}
                </span>
                <a href={l("/newsletter")} className="cta-mini-btn">{t.ctaMiniBtn}</a>
              </div>
            )}
            {rest.length > 0 && (
              <section>
                {featured.length > 0 && <div className="sec-label">{t.allLabel}</div>}
                <div className="grid-all">
                  {rest.map((c, i) => <ComparatifCard key={`${c.slug}-${i}`} c={c} lang={lang} t={t} l={l} animDelay={i * 60} />)}
                </div>
              </section>
            )}
            {!search && <MethodologyBlock t={t} />}
            {/* FIX 2 — aucun onMouseEnter/Leave, le hover est intégralement géré par .blog-crosslink:hover en CSS */}
            {!search && (
              <a href={l("/blog")} className="blog-crosslink">
                <span className="blog-crosslink-text">
                  {t.blogCtaLabel}{" "}
                  <strong>{lang === "fr" ? "Retrouvez nos reviews individuelles sur le blog." : "Find our individual tool reviews on the blog."}</strong>
                </span>
                <span className="blog-crosslink-btn">{t.blogCta} →</span>
              </a>
            )}
            {!search && <NewsletterCTA t={t} lang={lang} />}
          </>
        )}
      </div>

      <footer>
        <div className="ft">
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}><div className="logo-dot" />Neuri<em>flux</em></a>
            <p className="ft-tagline">{t.ftTagline}</p>
          </div>
          <div>
            <div className="ft-col-title">{t.ftContent}</div>
            <ul className="ft-ul">{t.ftLinks.map((x, i) => <li key={i}><a href={l(x.h)}>{x.l}</a></li>)}</ul>
          </div>
          <div>
            <div className="ft-col-title">{t.ftLegal}</div>
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