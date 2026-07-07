"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getArticleBySlug, ARTICLES, resolveRelated } from "../../lib/articles";
import { COMPARATIFS } from "../../lib/comparatifs";
import { useNewsletter } from "@/lib/useNewsletter";

type Lang = "fr" | "en";


type TocItem = {
  id: string;
  text: string;
};

type LocaleCopy = {
  back: string;
  share: string;
  shareDone: string;
  toc: string;
  tocProgress: (done: number, total: number) => string;
  related: string;
  readTime: string;
  sub: string;
  subLoading: string;
  subDone: string;
  subError: string;
  placeholder: string;
  nlTitle: string;
  nlText: string;
  shareLabel: string;
  ourPick: string;
  affLink: string;
  newBadge: string;
  publishedOn: string;
  lastUpdated: string;
  readCount: string;
  like: string;
  liked: string;
  likeCount: string;
  navCtaLabel: string;
  exitTitle: string;
  exitDesc: string;
  exitCta: string;
  mobileShare: string;
  nav: {
    aifinder: string;
    aitools: string;
    blog: string;
    comparatifs: string;
    newsletter: string;
    contact: string;
    about: string;
  };
};

type ExitRecommendation = {
  slug: string;
  title: string;
  tag: string;
  timeMin: string;
  image: string;
  alt: string;
};

const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be",
  Code: "#3b82f6",
  Rédaction: "#f59e0b",
  Writing: "#f59e0b",
  Image: "#a855f7",
  Productivité: "#10b981",
  Productivity: "#10b981",
  Audio: "#ef4444",
  Video: "#e11d48",
  Vidéo: "#e11d48",
};

const REVIEW_TAGS = [
  "Chatbots",
  "Code",
  "Image",
  "Audio",
  "Writing",
  "Rédaction",
  "Productivity",
  "Productivité",
  "Video",
  "Vidéo",
];

const COPY: Record<Lang, LocaleCopy> = {
  fr: {
    back: "← Blog",
    share: "🔗 Copier le lien",
    shareDone: "✓ Copié !",
    toc: "📋 Dans cet article",
    tocProgress: (done, total) => `${done}/${total} sections`,
    related: "Articles similaires",
    readTime: "min de lecture",
    sub: "Je m'abonne",
    subLoading: "...",
    subDone: "✓ À lundi !",
    subError: "Erreur, réessayez.",
    placeholder: "votre@email.com",
    nlTitle: "Le radar IA · chaque lundi",
    nlText: "Les meilleurs outils, les comparatifs qui comptent. Gratuit.",
    shareLabel: "Partager",
    ourPick: "★ Notre choix",
    affLink: "Lien affilié",
    newBadge: "Nouveau",
    publishedOn: "Publié le",
    lastUpdated: "Dernière mise à jour",
    readCount: "lecteurs",
    like: "J’aime",
    liked: "Aimé",
    likeCount: "likes",
    navCtaLabel: "Essayer",
    exitTitle: "Avant de partir...",
    exitDesc: "Vous n'avez pas encore vu la conclusion de l'article — le meilleur reste à lire.",
    exitCta: "Continuer la lecture →",
    mobileShare: "WhatsApp",
    nav: {
      aifinder: "Ai-Finder",
      aitools:"Ai-Tools",
      blog: "Blog",
      comparatifs: "Comparatifs",
      newsletter: "Newsletter",
      contact: "Contact",
      about: "À propos",
    },
  },
  en: {
    back: "← Blog",
    share: "🔗 Copy link",
    shareDone: "✓ Copied!",
    toc: "📋 In this article",
    tocProgress: (done, total) => `${done}/${total} sections`,
    related: "Related articles",
    readTime: "min read",
    sub: "Subscribe",
    subLoading: "...",
    subDone: "✓ See you Monday!",
    subError: "Error, try again.",
    placeholder: "your@email.com",
    nlTitle: "The AI Radar · every Monday",
    nlText: "The best tools, comparisons that matter. Free.",
    shareLabel: "Share",
    ourPick: "★ Our pick",
    affLink: "Affiliate link",
    newBadge: "New",
    publishedOn: "Published on",
    lastUpdated: "Last updated",
    readCount: "readers",
    like: "Like",
    liked: "Liked",
    likeCount: "likes",
    navCtaLabel: "Try it",
    exitTitle: "Before you leave...",
    exitDesc: "You haven't reached the conclusion yet — the best part is still ahead.",
    exitCta: "Keep reading →",
    mobileShare: "WhatsApp",
    nav: {
      aifinder: "Ai-Finder",
      aitools:"Ai-Tools",
      blog: "Blog",
      comparatifs: "Comparisons",
      newsletter: "Newsletter",
      contact: "Contact",
      about: "About",
    },
  },
};

const TOOL_TO_COMP: Record<string, string> = {
  chatgpt: "chatgpt-vs-claude-vs-gemini",
  claude: "chatgpt-vs-claude-vs-gemini",
  gemini: "chatgpt-vs-claude-vs-gemini",
  cursor: "cursor-vs-copilot-vs-codeium",
  copilot: "cursor-vs-copilot-vs-codeium",
  codeium: "cursor-vs-copilot-vs-codeium",
  midjourney: "midjourney-vs-dalle-vs-stable-diffusion",
  dalle: "midjourney-vs-dalle-vs-stable-diffusion",
  "stable diffusion": "midjourney-vs-dalle-vs-stable-diffusion",
  jasper: "jasper-vs-copyai-vs-claude",
  "copy.ai": "jasper-vs-copyai-vs-claude",
  elevenlabs: "elevenlabs-vs-openai-tts-vs-playht",
  runway: "runway-vs-kling-vs-pika-2026",
  kling: "runway-vs-kling-vs-pika-2026",
  pika: "runway-vs-kling-vs-pika-2026",
};

const DEFAULT_ARTICLE_IMAGE = "/images/articles/default-ai-cover.webp";

const getArticleImageSrc = (articleData: unknown) =>
  ((articleData as { image?: string } | null)?.image || DEFAULT_ARTICLE_IMAGE).trim();

const toAbsoluteImageUrl = (src: string) => {
  if (!src) return `https://neuriflux.com${DEFAULT_ARTICLE_IMAGE}`;
  if (/^https?:\/\//i.test(src)) return src;
  return `https://neuriflux.com${src.startsWith("/") ? src : `/${src}`}`;
};

const getRecommendationImageSrc = (item: unknown) => {
  const data = item as { image?: string; heroImage?: { src?: string } } | null;
  return (data?.heroImage?.src || data?.image || DEFAULT_ARTICLE_IMAGE).trim();
};

const getRecommendationAlt = (item: unknown, lang: Lang, fallbackTitle: string) => {
  const data = item as { heroImage?: { alt?: Partial<Record<Lang, string>> } } | null;
  return data?.heroImage?.alt?.[lang] || fallbackTitle;
};

const getColor = (tag: string) => TAG_COLORS[tag] || "#00e6be";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const estRead = (content: string) => Math.max(4, Math.ceil(content.split(/\s+/).length / 200));

const fakeViews = (slug: string) =>
  (slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1800) + 400;

type ArticleStats = {
  views: number;
  likes: number;
};

const EMPTY_STATS: ArticleStats = { views: 0, likes: 0 };

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const formatCompactNumber = (value: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(Math.max(0, Math.round(value)));

const getViewSessionKey = (canonicalSlug: string) => `nf_viewed_${canonicalSlug}`;
const getLikeStorageKey = (canonicalSlug: string) => `nf_liked_${canonicalSlug}`;

const readLocalLike = (canonicalSlug: string) => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(getLikeStorageKey(canonicalSlug)) === "1";
};

const writeLocalLike = (canonicalSlug: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getLikeStorageKey(canonicalSlug), "1");
};

const getRelatedComp = (slug: string, title: string): string | null => {
  const haystack = `${slug} ${title}`.toLowerCase();
  for (const [keyword, compSlug] of Object.entries(TOOL_TO_COMP)) {
    if (haystack.includes(keyword)) return compSlug;
  }
  return null;
};

const isNew = (rawDate?: string) => {
  if (!rawDate) return false;
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return false;
  return (Date.now() - parsed.getTime()) / 86400000 <= 12;
};


const trackNeurifluxEvent = (name: string, payload: Record<string, string | number | boolean | undefined> = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("neuriflux:analytics", { detail: { name, ...payload } }));

  const w = window as typeof window & {
    gtag?: (eventName: string, action: string, params?: Record<string, unknown>) => void;
    va?: (eventName: string, params?: Record<string, unknown>) => void;
  };

  w.gtag?.("event", name, payload);
  w.va?.(name, payload);
};

const getRecommendationReason = (sourceTag: string, targetTag: string, lang: Lang) => {
  if (sourceTag === targetTag) return lang === "fr" ? "Même univers" : "Same universe";
  if (targetTag === "Code") return lang === "fr" ? "Très utile pour les développeurs" : "Useful for developers";
  if (targetTag === "Chatbots") return lang === "fr" ? "À lire pour mieux choisir votre IA" : "Useful to choose your AI";
  if (targetTag === "Productivity" || targetTag === "Productivité") return lang === "fr" ? "Pour gagner du temps ensuite" : "To save time next";
  return lang === "fr" ? "Lecture complémentaire" : "Recommended follow-up";
};

const getRecommendationScore = (slugValue: string) =>
  82 + (slugValue.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 16);

const getSeenKey = (canonicalSlug: string) => `nf_article_retention_${canonicalSlug}`;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const hasRecentlySeenPrompt = (canonicalSlug: string) => {
  if (typeof window === "undefined") return true;
  const value = window.localStorage.getItem(getSeenKey(canonicalSlug));
  if (!value) return false;
  const timestamp = Number(value);
  return Number.isFinite(timestamp) && Date.now() - timestamp < ONE_DAY_MS;
};

const markPromptAsSeen = (canonicalSlug: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getSeenKey(canonicalSlug), String(Date.now()));
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMd(md: string): string {
  let h = escapeHtml(md.trim());

  h = h.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_, hd, body) => {
    const ths = hd
      .split("|")
      .filter((c: string) => c.trim())
      .map((c: string) => `<th>${c.trim()}</th>`)
      .join("");
    const rows = body
      .trim()
      .split("\n")
      .map(
        (row: string) =>
          "<tr>" +
          row
            .split("|")
            .filter((c: string) => c.trim())
            .map((c: string) => `<td>${c.trim()}</td>`)
            .join("") +
          "</tr>",
      )
      .join("");
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  h = h.replace(/```[\w-]*\n?([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  h = h.replace(/^### (.+)$/gm, (_, title) => `<h3 id="${slugify(title)}">${title}</h3>`);
  h = h.replace(/^## (.+)$/gm, (_, title) => `<h2 id="${slugify(title)}">${title}</h2>`);
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*(.+?)\*/g, "<em>$1</em>");
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>");

  h = h.replace(/\[(.+?)\]\((.+?)\)/g, (_, label, href) => {
    const isInternal = String(href).startsWith("/");
    return isInternal
      ? `<a href="${href}">${label}</a>`
      : `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  h = h.replace(/(^[✅❌].+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line: string) => {
        const t = line.trim();
        const ok = t.startsWith("✅");
        return `<li class="${ok ? "li-yes" : "li-no"}"><span class="eli">${ok ? "✅" : "❌"}</span> ${t.slice(2).trim()}</li>`;
      })
      .join("");
    return `<ul class="emoji-list">${items}</ul>`;
  });

  h = h.replace(/(^- .+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line: string) => `<li>${line.replace(/^- /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  h = h.replace(/^(<strong>[^<]+<\/strong>:?)$/gm, '<p class="bold-title">$1</p>');

  h = h
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[123]|ul|ol|table|pre|blockquote|p)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n")
    .replace(/<p>\s*<\/p>/g, "");

  return h;
}

function ProgressBar({ color }: { color: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 300, background: "rgba(0,0,0,.4)" }}>
      <div style={{ height: "100%", width: `${progress}%`, background: color, transition: "width .08s linear", boxShadow: `0 0 10px ${color}80` }} />
    </div>
  );
}

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!ids.length || typeof window === "undefined") {
      return;
    }

    let frame = 0;

    const getElements = () =>
      ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));

    const updateActive = () => {
      const elements = getElements();
      if (!elements.length) {
        setActive((previous) => (previous === 0 ? previous : 0));
        return;
      }

      const marker = 140;
      const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
      const pageBottom = Math.ceil(window.scrollY + viewportBottom);
      const docBottom = document.documentElement.scrollHeight;

      if (window.scrollY <= 40) {
        setActive((previous) => (previous === 0 ? previous : 0));
        return;
      }

      if (docBottom - pageBottom <= 24) {
        setActive((previous) => (previous === elements.length - 1 ? previous : elements.length - 1));
        return;
      }

      let current = 0;

      for (let i = 0; i < elements.length; i += 1) {
        const rect = elements[i].getBoundingClientRect();
        if (rect.top - marker <= 0) {
          current = i;
        } else {
          break;
        }
      }

      setActive((previous) => (previous === current ? previous : current));
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActive);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [ids.join("|")]);

  return active;
}

function MidCTA({ url, toolName, label, lang, color }: { url: string; toolName: string; label: string; lang: Lang; color: string }) {
  return (
    <div style={{ margin: "2.75rem 0", padding: "1.65rem 1.85rem", background: `linear-gradient(135deg,${color}08,${color}02)`, border: `1px solid ${color}25`, borderRadius: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color} 40%,${color} 60%,transparent)` }} />
      <div style={{ position: "absolute", top: "-35%", right: "-5%", width: 300, height: 200, background: `radial-gradient(ellipse,${color}07,transparent 68%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".35rem", fontFamily: "var(--m)", fontSize: ".6rem", letterSpacing: ".1em", textTransform: "uppercase", color, marginBottom: ".5rem" }}>
            <span style={{ color: "#f59e0b" }}>★</span>
            {lang === "fr" ? "Testé et approuvé par Neuriflux" : "Tested & approved by Neuriflux"}
          </div>
          <div style={{ fontFamily: "var(--d)", fontSize: "1.05rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-.02em", marginBottom: ".3rem" }}>{toolName}</div>
          <div style={{ fontFamily: "var(--m)", fontSize: ".72rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.6, marginBottom: ".65rem" }}>{label}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
            {[lang === "fr" ? "✓ Version gratuite" : "✓ Free plan", lang === "fr" ? "✓ Sans carte" : "✓ No card needed"].map((badge, index) => (
              <span key={index} style={{ fontFamily: "var(--m)", fontSize: ".6rem", color, background: `${color}07`, border: `1px solid ${color}18`, borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".4rem", flexShrink: 0 }}>
          <a href={url} target="_blank" rel="noopener noreferrer sponsored" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: ".45rem", background: color, color: "#080c10", fontFamily: "var(--d)", fontWeight: 800, fontSize: ".92rem", padding: "13px 26px", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap", boxShadow: `0 4px 20px ${color}22` }}>
            {lang === "fr" ? "Essayer gratuitement" : "Try for free"} →
          </a>
          <div style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--muted)", textAlign: "center" }}>{lang === "fr" ? "Accès immédiat · Sans engagement" : "Instant access · No commitment"}</div>
          <div style={{ fontFamily: "var(--m)", fontSize: ".55rem", color: "var(--dim)", textAlign: "center" }}>{lang === "fr" ? "Lien affilié — sans coût pour vous" : "Affiliate link — no extra cost"}</div>
        </div>
      </div>
    </div>
  );
}

function EndCTA({ url, toolName, label, lang, color }: { url: string; toolName: string; label: string; lang: Lang; color: string }) {
  return (
    <div style={{ margin: "3.5rem 0 0", padding: "2.25rem 2.5rem", background: "var(--bg2)", border: `1px solid ${color}25`, borderRadius: 18, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: 600, height: 320, background: `radial-gradient(ellipse,${color}065,transparent 68%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", position: "relative", zIndex: 1, flexWrap: "wrap", gap: ".5rem" }}>
        <div style={{ fontFamily: "var(--m)", fontSize: ".62rem", letterSpacing: ".14em", textTransform: "uppercase", color, display: "flex", alignItems: "center", gap: ".4rem" }}>
          <span style={{ display: "inline-block", width: 14, height: 1, background: color }} />
          {lang === "fr" ? "Notre verdict" : "Our verdict"}
        </div>
        <div style={{ color: "#f59e0b", fontSize: ".85rem", letterSpacing: 2 }}>★★★★★</div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "var(--d)", fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-.035em", color: "var(--text)", marginBottom: ".4rem" }}>{toolName}</div>
          <div style={{ fontFamily: "var(--m)", fontSize: ".76rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.7, marginBottom: ".85rem" }}>{label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
            {[lang === "fr" ? "Testé 3+ semaines" : "Tested 3+ weeks", lang === "fr" ? "Version gratuite" : "Free plan", lang === "fr" ? "Sans engagement" : "No commitment"].map((badge, index) => (
              <span key={index} style={{ fontFamily: "var(--m)", fontSize: ".68rem", color, fontWeight: 500, display: "flex", alignItems: "center", gap: ".35rem" }}>✓ {badge}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", alignItems: "center", flexShrink: 0 }}>
          <a href={url} target="_blank" rel="noopener noreferrer sponsored" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: ".5rem", background: color, color: "#080c10", fontFamily: "var(--d)", fontWeight: 800, fontSize: "1rem", padding: "15px 32px", borderRadius: 11, textDecoration: "none", whiteSpace: "nowrap", boxShadow: `0 6px 24px ${color}28` }}>
            🚀 {lang === "fr" ? "Commencer gratuitement" : "Start for free"} →
          </a>
          <div style={{ fontFamily: "var(--m)", fontSize: ".62rem", color: "var(--muted)", textAlign: "center" }}>{lang === "fr" ? "Accès immédiat · Sans carte bancaire" : "Instant access · No credit card"}</div>
          <span style={{ fontFamily: "var(--m)", fontSize: ".55rem", color: "var(--dim)" }}>{lang === "fr" ? "Lien affilié — aucun coût supplémentaire" : "Affiliate link — no extra cost to you"}</span>
        </div>
      </div>
    </div>
  );
}

function CompCrossLink({ compSlug, lang, l, color }: { compSlug: string; lang: Lang; l: (p: string) => string; color: string }) {
  const comp = COMPARATIFS.find((entry) => entry.slug === compSlug);
  if (!comp) return null;

  return (
    <Link href={l(`/comparatifs/${compSlug}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", background: "var(--bg2)", border: `1px solid ${color}20`, borderRadius: 12, padding: "1rem 1.5rem", margin: "2rem 0", textDecoration: "none" }}>
      <div>
        <div style={{ fontFamily: "var(--m)", fontSize: ".6rem", letterSpacing: ".1em", textTransform: "uppercase", color, marginBottom: ".3rem" }}>
          ⚔️ {lang === "fr" ? "Comparatif associé" : "Related comparison"}
        </div>
        <div style={{ fontFamily: "var(--d)", fontSize: ".92rem", fontWeight: 700, color: "var(--text)" }}>{comp[lang].title}</div>
        <div style={{ fontFamily: "var(--m)", fontSize: ".68rem", color: "var(--muted)", marginTop: ".2rem" }}>
          {lang === "fr" ? `Gagnant : ${comp.winner} · ${comp.tools.length} outils testés` : `Winner: ${comp.winner} · ${comp.tools.length} tools tested`}
        </div>
      </div>
      <span style={{ fontFamily: "var(--m)", fontSize: ".72rem", fontWeight: 600, color, whiteSpace: "nowrap" }}>{lang === "fr" ? "Voir le comparatif →" : "See comparison →"}</span>
    </Link>
  );
}


function SmartArticleCard({
  item,
  lang,
  l,
  color,
  variant = "grid",
  context,
}: {
  item: ExitRecommendation;
  lang: Lang;
  l: (p: string) => string;
  color: string;
  variant?: "grid" | "compact" | "hero";
  context: string;
}) {
  const score = getRecommendationScore(item.slug);
  const isCompact = variant === "compact";
  const isHero = variant === "hero";

  return (
    <Link
      href={l(`/blog/${item.slug}`)}
      className={`smart-card smart-card-${variant}`}
      onClick={() => trackNeurifluxEvent("internal_recommendation_click", { slug: item.slug, context, lang })}
      style={{ "--card-ac": getColor(item.tag) || color } as CSSProperties}
    >
      <div className="smart-card-img">
        <Image src={item.image} alt={item.alt} fill sizes={isHero ? "(max-width: 960px) 100vw, 720px" : isCompact ? "72px" : "280px"} />
        {!isCompact && <span className="smart-card-score">{score}% match</span>}
      </div>
      <div className="smart-card-body">
        <div className="smart-card-kicker">{item.tag}</div>
        <div className="smart-card-title">{item.title}</div>
        <div className="smart-card-reason">{getRecommendationReason(String(item.tag), String(item.tag), lang)}</div>
        <div className="smart-card-meta">⏱ {item.timeMin} {lang === "fr" ? "min de lecture" : "min read"} · {lang === "fr" ? "Lire maintenant" : "Read now"}</div>
      </div>
    </Link>
  );
}

function RecommendationStrip({
  title,
  subtitle,
  items,
  lang,
  l,
  color,
  context,
}: {
  title: string;
  subtitle: string;
  items: ExitRecommendation[];
  lang: Lang;
  l: (p: string) => string;
  color: string;
  context: string;
}) {
  if (!items.length) return null;

  return (
    <section className="mid-read-block" style={{ "--ac": color } as CSSProperties}>
      <div className="mid-read-head">
        <div>
          <div className="mid-read-kicker">{lang === "fr" ? "Maillage intelligent" : "Smart reading path"}</div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span>{lang === "fr" ? "Après cette lecture" : "After this article"}</span>
      </div>
      <div className="mid-read-grid">
        {items.slice(0, 3).map((item) => (
          <SmartArticleCard key={`${context}-${item.slug}`} item={item} lang={lang} l={l} color={color} context={context} />
        ))}
      </div>
    </section>
  );
}

function EndNextArticleHero({
  item,
  extraItems,
  lang,
  l,
  color,
}: {
  item: ExitRecommendation | null;
  extraItems: ExitRecommendation[];
  lang: Lang;
  l: (p: string) => string;
  color: string;
}) {
  if (!item) return null;

  return (
    <section className="end-next" style={{ "--ac": color } as CSSProperties}>
      <div className="end-next-kicker">🔥 {lang === "fr" ? "Votre prochaine lecture" : "Your next read"}</div>
      <SmartArticleCard item={item} lang={lang} l={l} color={color} variant="hero" context="end_next_hero" />
      {extraItems.length > 0 && (
        <div className="end-next-more">
          <div className="end-next-more-title">{lang === "fr" ? "Vous pourriez aussi aimer" : "You may also like"}</div>
          <div className="end-next-more-grid">
            {extraItems.slice(0, 3).map((extra) => (
              <SmartArticleCard key={`end-extra-${extra.slug}`} item={extra} lang={lang} l={l} color={color} variant="compact" context="end_next_extra" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function NextReadDrawer({
  item,
  lang,
  l,
  color,
  onClose,
}: {
  item: ExitRecommendation | null;
  lang: Lang;
  l: (p: string) => string;
  color: string;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <aside className="next-drawer" style={{ "--ac": color } as CSSProperties} aria-live="polite">
      <button className="next-drawer-close" onClick={onClose} aria-label={lang === "fr" ? "Fermer" : "Close"}>✕</button>
      <div className="next-drawer-glow" />
      <Link
        href={l(`/blog/${item.slug}`)}
        className="next-drawer-card"
        onClick={() => trackNeurifluxEvent("drawer_next_click", { slug: item.slug, lang })}
      >
        <span className="next-drawer-img"><Image src={item.image} alt={item.alt} fill sizes="96px" /></span>
        <span className="next-drawer-info">
          <span className="next-drawer-kicker">{lang === "fr" ? "Lecture suivante" : "Next read"}</span>
          <strong>{item.title}</strong>
          <em>{item.tag} · ⏱ {item.timeMin} {lang === "fr" ? "min" : "min"} · {getRecommendationScore(item.slug)}% match</em>
        </span>
      </Link>
      <div className="next-drawer-actions">
        <Link
          href={l(`/blog/${item.slug}`)}
          className="next-drawer-cta"
          onClick={() => trackNeurifluxEvent("drawer_next_cta_click", { slug: item.slug, lang })}
        >
          {lang === "fr" ? "Lire →" : "Read →"}
        </Link>
        <button className="next-drawer-soft" onClick={onClose}>{lang === "fr" ? "Plus tard" : "Later"}</button>
      </div>
    </aside>
  );
}

export default function ArticleClient({ lang, slug }: { lang: Lang; slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showNavCta, setShowNavCta] = useState(false);
  const [exitShown, setExitShown] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showNextDrawer, setShowNextDrawer] = useState(false);
  const [completedPromptShown, setCompletedPromptShown] = useState(false);
  const [timeOnPageOk, setTimeOnPageOk] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [stats, setStats] = useState<ArticleStats>(EMPTY_STATS);
  const [statsReady, setStatsReady] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  const articleData = useMemo(() => getArticleBySlug(slug), [slug]);
  const article = articleData ? articleData[lang] : null;
  const color = articleData ? getColor(articleData.tag) : "#00e6be";
  const affiliate = articleData?.affiliate;
  const locale = COPY[lang];
  const canonicalSlug = articleData?.slug ?? slug;

  useEffect(() => {
    if (typeof window === "undefined" || !canonicalSlug) return;

    let cancelled = false;
    const viewKey = getViewSessionKey(canonicalSlug);
    const alreadyCountedThisSession = window.sessionStorage.getItem(viewKey) === "1";

    setStatsReady(false);
    setLiked(readLocalLike(canonicalSlug));

    const registerOrReadStats = async () => {
      try {
        const response = await fetch(`/api/articles/${canonicalSlug}/view`, {
          method: alreadyCountedThisSession ? "GET" : "POST",
          cache: "no-store",
        });

        const data = (await response.json()) as Partial<ArticleStats> & { ok?: boolean };

        if (!response.ok || !data.ok || cancelled) return;

        if (!alreadyCountedThisSession) {
          window.sessionStorage.setItem(viewKey, "1");
          trackNeurifluxEvent("article_view_registered", { slug: canonicalSlug, lang });
        }

        setStats({
          views: safeNumber(data.views),
          likes: safeNumber(data.likes),
        });
        setStatsReady(true);
      } catch {
        if (!cancelled) {
          setStats({ views: fakeViews(canonicalSlug), likes: 0 });
          setStatsReady(false);
        }
      }
    };

    registerOrReadStats();

    return () => {
      cancelled = true;
    };
  }, [canonicalSlug, lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const frame = window.requestAnimationFrame(() => {
      setShareUrl(window.location.href);
      setIsMobile(/iPhone|iPad|Android/i.test(window.navigator.userAgent));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [slug, lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug, lang]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = Math.max(1, el.scrollHeight - el.clientHeight);
      const progress = Math.min(100, Math.max(0, (window.scrollY / total) * 100));

      setScrolled(window.scrollY > 60);
      setShowNavCta(window.scrollY > 340);
      setReadProgress(progress);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setTimeOnPageOk(true), 18000);
    return () => window.clearTimeout(timer);
  }, [slug, lang]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    let isActive = true;
    const onVisibility = () => { isActive = document.visibilityState === "visible"; };
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => {
      if (isActive) setActiveSeconds((value) => value + 1);
    }, 1000);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [slug, lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const milestones = [25, 50, 75, 90];
    milestones.forEach((milestone) => {
      const key = `nf_scroll_${canonicalSlug}_${milestone}`;
      if (readProgress >= milestone && !window.sessionStorage.getItem(key)) {
        window.sessionStorage.setItem(key, "1");
        trackNeurifluxEvent("article_scroll_depth", { slug: canonicalSlug, depth: milestone, lang });
      }
    });
  }, [canonicalSlug, lang, readProgress]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canSuggest = timeOnPageOk && readProgress >= 22 && readProgress <= 88 && !exitShown && !hasRecentlySeenPrompt(canonicalSlug);
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 8 && canSuggest) {
        setShowExit(true);
        setExitShown(true);
        markPromptAsSeen(canonicalSlug);
        trackNeurifluxEvent("exit_popup_show", { slug: canonicalSlug, trigger: "exit_intent", lang });
      }
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [canonicalSlug, exitShown, lang, readProgress, timeOnPageOk]);

  useEffect(() => {
    if (!timeOnPageOk || completedPromptShown || hasRecentlySeenPrompt(canonicalSlug)) return;
    if (readProgress >= 92) {
      setShowNextDrawer(true);
      setCompletedPromptShown(true);
      markPromptAsSeen(canonicalSlug);
      trackNeurifluxEvent("next_drawer_show", { slug: canonicalSlug, trigger: "scroll_92", lang });
    }
  }, [canonicalSlug, completedPromptShown, lang, readProgress, timeOnPageOk]);

  useEffect(() => {
    if (!timeOnPageOk || exitShown || hasRecentlySeenPrompt(canonicalSlug)) return;
    if (activeSeconds >= 70 && readProgress >= 35 && readProgress < 88) {
      setShowNextDrawer(true);
      setExitShown(true);
      markPromptAsSeen(canonicalSlug);
      trackNeurifluxEvent("next_drawer_show", { slug: canonicalSlug, trigger: "active_time", lang });
    }
  }, [activeSeconds, canonicalSlug, exitShown, lang, readProgress, timeOnPageOk]);

  const { status: nlStatus, subscribe } = useNewsletter("article-sidebar");

  const handleNlSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await subscribe(nlEmail, lang);
  };

  const l = useCallback((path: string) => `/${lang}${path}`, [lang]);

  const switchLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
    },
    [lang, pathname, router],
  );

  const copy = useCallback(async () => {
    if (!shareUrl || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  const handleLike = useCallback(async () => {
    if (liked || likePending || !canonicalSlug) return;

    writeLocalLike(canonicalSlug);
    setLiked(true);
    setLikePending(true);
    setStats((previous) => ({ ...previous, likes: previous.likes + 1 }));
    trackNeurifluxEvent("article_like_click", { slug: canonicalSlug, lang });

    try {
      const response = await fetch(`/api/articles/${canonicalSlug}/like`, {
        method: "POST",
        cache: "no-store",
      });
      const data = (await response.json()) as Partial<ArticleStats> & { ok?: boolean };

      if (response.ok && data.ok) {
        setStats((previous) => ({
          views: safeNumber(data.views) || previous.views,
          likes: safeNumber(data.likes) || previous.likes,
        }));
      }
    } catch {
      // Optimistic like is kept locally to avoid punishing the user for a transient network error.
    } finally {
      setLikePending(false);
    }
  }, [canonicalSlug, lang, likePending, liked]);

  const resolvedRelated = useMemo(() => {
    if (!articleData) return [];
    return resolveRelated(articleData[lang].related, lang);
  }, [articleData, lang]);

  const sameTagArticles = useMemo(() => {
    if (!articleData) return [];
    return ARTICLES.filter((entry) => entry.slug !== articleData.slug && entry.tag === articleData.tag).slice(0, 4);
  }, [articleData]);

  const exitRecommendation = useMemo<ExitRecommendation | null>(() => {
    const related = resolvedRelated[0];
    if (related) {
      return {
        slug: related.slug,
        title: related.title,
        tag: related.tag,
        timeMin: String(related.timeMin),
        image: getRecommendationImageSrc(related),
        alt: getRecommendationAlt(related, lang, related.title),
      };
    }

    const sameTag = sameTagArticles[0];
    if (!sameTag) return null;

    return {
      slug: sameTag.slug,
      title: sameTag[lang].title,
      tag: String(sameTag.tag),
      timeMin: String(sameTag.timeMin),
      image: getRecommendationImageSrc(sameTag),
      alt: getRecommendationAlt(sameTag, lang, sameTag[lang].title),
    };
  }, [lang, resolvedRelated, sameTagArticles]);


  const smartRecommendations = useMemo<ExitRecommendation[]>(() => {
    const fromRelated = resolvedRelated.map((item) => ({
      slug: item.slug,
      title: item.title,
      tag: item.tag,
      timeMin: String(item.timeMin),
      image: getRecommendationImageSrc(item),
      alt: getRecommendationAlt(item, lang, item.title),
    }));

    const fromSameTag = sameTagArticles.map((item) => ({
      slug: item.slug,
      title: item[lang].title,
      tag: String(item.tag),
      timeMin: String(item.timeMin),
      image: getRecommendationImageSrc(item),
      alt: getRecommendationAlt(item, lang, item[lang].title),
    }));

    const seen = new Set<string>();
    return [...fromRelated, ...fromSameTag]
      .filter((item) => item.slug !== canonicalSlug)
      .filter((item) => {
        if (seen.has(item.slug)) return false;
        seen.add(item.slug);
        return true;
      })
      .sort((a, b) => getRecommendationScore(b.slug) - getRecommendationScore(a.slug))
      .slice(0, 8);
  }, [canonicalSlug, lang, resolvedRelated, sameTagArticles]);

  const primaryRecommendation = smartRecommendations[0] ?? exitRecommendation;
  const midArticleRecommendations = smartRecommendations.slice(0, 3);
  const endExtraRecommendations = smartRecommendations.slice(1, 4);

  const headingIds = useMemo(() => tocItems.map((item) => item.id), [tocItems]);
  const activeIdx = useActiveHeading(headingIds);
  const readCount = tocItems.length > 0 ? Math.min(activeIdx + 1, tocItems.length) : 0;

  const splitContent = useMemo(() => {
    if (!article) return { first: "", second: "" };
    const rendered = renderMd(article.content);
    const h2s = [...rendered.matchAll(/<h2/g)];
    if (h2s.length < 2) return { first: rendered, second: "" };
    const cutIdx = h2s[Math.floor(h2s.length / 2)].index ?? rendered.length;
    return { first: rendered.slice(0, cutIdx), second: rendered.slice(cutIdx) };
  }, [article]);

  useEffect(() => {
    if (!contentRef.current) return;

    const timer = window.setTimeout(() => {
      const headings = Array.from(
        contentRef.current?.querySelectorAll("h2") || [],
      ) as HTMLHeadingElement[];

      const items = headings.map((heading, index) => {
        let id = heading.id?.trim();

        if (!id) {
          id = slugify(heading.textContent || `section-${index + 1}`);
          heading.id = id;
        }

        return {
          id,
          text: heading.textContent?.trim() || `Section ${index + 1}`,
        };
      });

      setTocItems(items);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [article?.content, lang, slug, splitContent.first, splitContent.second]);

  const articleUrl = `https://neuriflux.com/${lang}/blog/${canonicalSlug}`;
  const altLang: Lang = lang === "fr" ? "en" : "fr";
  const altUrl = `https://neuriflux.com/${altLang}/blog/${canonicalSlug}`;
  const minRead = articleData?.timeMin || estRead(article?.content || "").toString();
  const views = stats.views || fakeViews(canonicalSlug);
  const likes = stats.likes;
  const displayViews = formatCompactNumber(views, lang);
  const displayLikes = formatCompactNumber(likes, lang);
  const viewsLabel = lang === "fr" ? "vues" : views === 1 ? "view" : "views";
  const likesLabel = lang === "fr" ? "likes" : likes === 1 ? "like" : "likes";
  const relatedCompSlug = useMemo(() => (articleData ? getRelatedComp(canonicalSlug, article?.title || "") : null), [articleData, canonicalSlug, article]);
  const isReview = articleData ? REVIEW_TAGS.includes(String(articleData.tag)) : false;
  const isFresh = articleData ? isNew(articleData.updatedAt?.en ?? articleData.date?.en) : false;
  const publishedLabel = articleData?.date?.[lang] ?? "";
  const updatedLabel = articleData?.updatedAt?.[lang] ?? publishedLabel;
  const articleHeroImage = getArticleImageSrc(articleData);
  const absoluteHeroImage = toAbsoluteImageUrl(articleHeroImage);
  const articleHeroAlt =
    articleData?.heroImage?.alt?.[lang] ??
    `${article?.title ?? (lang === "fr" ? "Article Neuriflux" : "Neuriflux article")} — ${
      lang === "fr" ? "illustration éditoriale Neuriflux" : "Neuriflux editorial illustration"
    }`;

  const articleSchema = article && articleData ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.desc,
    image: absoluteHeroImage,
    author: { "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com" },
    publisher: {
      "@type": "Organization",
      name: "Neuriflux",
      logo: { "@type": "ImageObject", url: "https://neuriflux.com/logo.png", width: 200, height: 60 },
    },
    datePublished: articleData.date?.en,
    dateModified: articleData.updatedAt?.en ?? articleData.date?.en,
    url: articleUrl,
    inLanguage: lang,
    timeRequired: `PT${minRead}M`,
    wordCount: article.content.split(/\s+/).length,
    articleSection: String(articleData.tag),
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    potentialAction: { "@type": "ReadAction", target: [articleUrl, altUrl] },
  } : null;

  const breadcrumbSchema = article && articleData ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Neuriflux", item: `https://neuriflux.com/${lang}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `https://neuriflux.com/${lang}/blog` },
      { "@type": "ListItem", position: 3, name: String(articleData.tag), item: `https://neuriflux.com/${lang}/blog?tag=${encodeURIComponent(String(articleData.tag))}` },
      { "@type": "ListItem", position: 4, name: article.title, item: articleUrl },
    ],
  } : null;

  const faqMatches = article?.content.match(/^### (.+)\n\n([\s\S]+?)(?=\n###|\n##|$)/gm) || [];
  const faqSchema = faqMatches.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqMatches.slice(0, 8).map((block) => {
      const lines = block.trim().split("\n\n");
      const question = lines[0].replace(/^### /, "");
      const answer = lines.slice(1).join(" ").replace(/\*\*/g, "").replace(/\*/g, "").trim();
      return { "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } };
    }),
  } : null;

  const productSchema = isReview && affiliate ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: affiliate.toolName,
    description: affiliate.label[lang],
    brand: { "@type": "Brand", name: affiliate.toolName },
    review: {
      "@type": "Review",
      author: { "@type": "Organization", name: "Neuriflux" },
      reviewRating: { "@type": "Rating", ratingValue: String(articleData?.rating ?? 4.5), bestRating: "10" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(articleData?.rating ?? 4.5),
      bestRating: "10",
      worstRating: "1",
      ratingCount: "1",
    },
  } : null;

  if (!article || !articleData) {
    return (
      <>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}:root{--bg:#080c10;--cyan:#00e6be;--text:#edf2f7;--muted:#5a6a7a;--d:'Syne',sans-serif;--m:'JetBrains Mono',monospace}body{background:var(--bg);color:var(--text);font-family:var(--d);display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.nf h1{font-size:3rem;font-weight:800;margin-bottom:1rem}.nf p{font-family:var(--m);color:var(--muted);margin-bottom:2rem;font-size:.86rem}.btn{display:inline-flex;align-items:center;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;padding:11px 22px;border-radius:8px;text-decoration:none}`}</style>
        <div className="nf">
          <h1>404</h1>
          <p>{lang === "fr" ? "Cet article n'existe pas encore." : "This article doesn't exist yet."}</p>
          <Link href={l("/blog")} className="btn">{locale.back}</Link>
        </div>
      </>
    );
  }

  const styleVars = { "--ac": color, "--ag": `${color}18` } as CSSProperties;

  return (
    <>
      {articleSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />}
      {breadcrumbSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />}
      {faqSchema && faqSchema.mainEntity.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {productSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />}
      {affiliate && <link rel="preconnect" href={(() => { try { return new URL(affiliate.url).origin; } catch { return ""; } })()} />}
      <link rel="canonical" href={articleUrl} />
      
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--border:rgba(255,255,255,.065);--cyan:#00e6be;--cdim:rgba(0,230,190,.09);--text:#edf2f7;--muted:#5a6a7a;--dim:#2a3a4a;--d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;--body:Georgia,'Times New Roman',serif;--pad:clamp(1.25rem,5vw,4rem)}
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.016) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes exitIn{from{opacity:0;transform:scale(.96) translateY(-8px)}to{opacity:1;transform:none}}
        nav{position:sticky;top:0;z-index:200;backdrop-filter:blur(24px);background:rgba(8,12,16,.95);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}.logo em{color:var(--cyan);font-style:normal}.logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite}
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}.nav-links a{font-family:var(--m);font-size:.74rem;color:var(--muted);text-decoration:none}.nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        @media(max-width:720px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.25rem var(--pad);gap:1rem;z-index:99}}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}.lb{font-family:var(--m);font-size:.67rem;font-weight:500;padding:4px 9px;border-radius:4px;border:none;cursor:pointer;background:transparent;color:var(--muted)}.lb.on{background:var(--cyan);color:#080c10}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}.hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}@media(max-width:720px){.hb{display:flex}}
        .nav-cta{display:flex;align-items:center;gap:.4rem;font-family:var(--d);font-weight:700;font-size:.75rem;padding:6px 14px;border-radius:7px;text-decoration:none;white-space:nowrap}@media(max-width:560px){.nav-cta-text{display:none}}
        .layout{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:3rem var(--pad) 7rem;display:grid;grid-template-columns:1fr 272px;gap:5rem;align-items:start}@media(max-width:960px){.layout{grid-template-columns:1fr;gap:0}.sidebar{display:none!important}}
        .breadcrumb{display:flex;align-items:center;gap:.4rem;font-family:var(--m);font-size:.67rem;color:var(--dim);flex-wrap:wrap;margin-bottom:1.5rem}.breadcrumb a{color:var(--dim);text-decoration:none}.breadcrumb-sep{color:var(--dim)}
        .art-header{position:relative;margin-bottom:3rem;padding:1.45rem 2.25rem 2rem;background:var(--bg2);border:1px solid var(--border);border-radius:14px;overflow:hidden}.art-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,var(--ac,var(--cyan)) 30%,var(--ac,var(--cyan)) 70%,transparent)}
        .article-top-actions{position:relative;z-index:5;display:flex;justify-content:flex-end;align-items:center;gap:.55rem;margin:0 0 1rem auto;max-width:100%;pointer-events:auto}.top-stat-pill,.top-like-btn{display:inline-flex;align-items:center;gap:.42rem;min-height:36px;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.028));backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 10px 28px rgba(0,0,0,.18);font-family:var(--m);white-space:nowrap}.top-stat-pill span,.top-like-btn span{font-size:.88rem;color:var(--ac,var(--cyan));line-height:1}.top-stat-pill strong,.top-like-btn strong{font-size:.76rem;color:var(--text);font-weight:850}.top-stat-pill em,.top-like-btn em{font-style:normal;font-size:.55rem;color:var(--dim);text-transform:uppercase;letter-spacing:.08em}.top-like-btn{cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,color .16s ease}.top-like-btn:hover:not(:disabled){transform:translateY(-1px);border-color:rgba(236,72,153,.42);background:linear-gradient(145deg,rgba(236,72,153,.14),rgba(255,255,255,.028))}.top-like-btn.liked{border-color:rgba(236,72,153,.46);background:linear-gradient(145deg,rgba(236,72,153,.16),rgba(255,255,255,.03))}.top-like-btn.liked span,.top-like-btn.liked strong{color:#fb7185}.top-like-btn:disabled{cursor:default}.like-btn.liked{border-color:rgba(236,72,153,.38)!important;background:rgba(236,72,153,.09)!important;color:#fb7185!important}@media(max-width:760px){.art-header{padding:1.25rem 1.25rem 1.55rem}.article-top-actions{justify-content:flex-start;margin-bottom:.9rem;flex-wrap:wrap}.top-stat-pill,.top-like-btn{min-height:34px;padding:7px 10px}.top-stat-pill em,.top-like-btn em{font-size:.5rem}}
        .art-header-glow{position:absolute;top:-40%;right:-10%;width:400px;height:300px;background:radial-gradient(ellipse,var(--ag,rgba(0,230,190,.07)) 0%,transparent 65%);pointer-events:none}
        .meta{display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;margin-bottom:1.25rem;position:relative;z-index:1}.tag-badge{font-family:var(--m);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:3px 10px;border-radius:100px}.badge-new{font-family:var(--m);font-size:.58rem;color:#10b981;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);padding:3px 8px;border-radius:100px;font-weight:600}
        .art-date,.art-time,.art-views{font-family:var(--m);font-size:.68rem;color:var(--muted)}.meta-sep{color:var(--dim);font-size:.6rem}
        .art-title{font-size:clamp(1.7rem,4vw,2.6rem);font-weight:800;letter-spacing:-.035em;line-height:1.1;margin-bottom:1.1rem;color:var(--text);position:relative;z-index:1}.art-desc{font-family:var(--m);font-size:.82rem;color:var(--muted);font-weight:300;line-height:1.8;padding:1rem 1.25rem;background:var(--bg3);border-left:2px solid var(--ac,var(--cyan));border-radius:0 7px 7px 0;margin-bottom:1.75rem;position:relative;z-index:1}
        .author{display:flex;align-items:center;gap:.75rem;position:relative;z-index:1}.avatar{width:34px;height:34px;background:var(--cdim);border:1px solid rgba(0,230,190,.22);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0}.author-name{font-family:var(--m);font-size:.75rem;color:var(--text);font-weight:500}.author-sub{font-family:var(--m);font-size:.62rem;color:var(--dim);font-weight:300;margin-top:.08rem}
        .hero-visual{position:relative;z-index:1;margin-top:1.75rem;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:linear-gradient(135deg,var(--bg3),rgba(255,255,255,.025));box-shadow:0 24px 70px rgba(0,0,0,.28)}.hero-visual::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,16,0) 48%,rgba(8,12,16,.78) 100%),radial-gradient(circle at 20% 0%,var(--ag,rgba(0,230,190,.12)),transparent 42%);z-index:2;pointer-events:none}.hero-image-wrap{position:relative;width:100%;aspect-ratio:1200/630;min-height:260px}.hero-image{object-fit:cover;object-position:center;transform:scale(1.01)}.hero-caption{position:absolute;left:1rem;right:1rem;bottom:1rem;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}.hero-caption span{font-family:var(--m);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(237,242,247,.72);background:rgba(8,12,16,.62);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(12px);border-radius:999px;padding:6px 10px}.hero-caption strong{font-family:var(--m);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ac,var(--cyan));font-weight:700}@media(max-width:720px){.hero-visual{margin-top:1.25rem;border-radius:12px}.hero-image-wrap{min-height:190px}.hero-caption{left:.75rem;right:.75rem;bottom:.75rem}.hero-caption span{font-size:.52rem;padding:5px 8px}}
        .prose{font-family:var(--body);font-size:1.03rem;line-height:1.9;color:#c8d5e0}.prose h2{font-family:var(--d);font-size:1.4rem;font-weight:800;letter-spacing:-.025em;color:var(--text);margin:3rem 0 0;padding:.65rem 0 .65rem 1rem;border-left:3px solid var(--ac,var(--cyan));border-bottom:1px solid var(--border);scroll-margin-top:80px}.prose h3{font-family:var(--d);font-size:1.05rem;font-weight:700;color:var(--text);margin:2rem 0 0;scroll-margin-top:80px}.prose p{margin-bottom:1.35rem}.prose strong{color:var(--text);font-weight:600;font-family:var(--d)}.prose em{color:var(--muted);font-style:italic}.prose ul,.prose ol{padding-left:1.4rem;margin:.75rem 0 1.3rem}.prose ul.emoji-list{list-style:none;padding-left:0}.prose ul.emoji-list li{display:flex;align-items:baseline;gap:.55rem;padding:.3rem 0;border-bottom:1px solid var(--border)}.eli{font-size:.95rem;flex-shrink:0}.li-yes .eli{color:#10b981}.li-no .eli{color:#ef4444}.prose p.bold-title{font-family:var(--d);font-size:1rem;font-weight:700;color:var(--text);letter-spacing:-.01em;margin-top:2rem;margin-bottom:.65rem;padding-left:.85rem;border-left:2px solid var(--ac,var(--cyan))}.prose code{font-family:var(--m);font-size:.79rem;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--cyan)}.prose pre{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:1.25rem 1.5rem;margin:1.75rem 0;overflow-x:auto}.prose pre code{background:none;border:none;padding:0;color:#a8c0d6;font-size:.79rem;line-height:1.78}.prose a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(0,230,190,.28)}.prose table{width:100%;border-collapse:collapse;margin:1.75rem 0;font-family:var(--m);font-size:.75rem}.prose th,.prose td{padding:10px 14px;border:1px solid var(--border)}.prose th{color:var(--text);font-weight:600;background:var(--bg3);text-align:left}.prose td{color:var(--muted)}
        .share{display:flex;align-items:center;gap:.55rem;margin-top:3.5rem;padding:1.25rem 1.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:12px;flex-wrap:wrap}.share-label,.share-count,.sbtn{font-family:var(--m)}.share-label{font-size:.62rem;color:var(--dim);letter-spacing:.09em;text-transform:uppercase;margin-right:.25rem}.share-count{font-size:.65rem;color:var(--dim);margin-left:auto;display:flex;align-items:center;gap:.3rem;white-space:nowrap}.sbtn{font-size:.7rem;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:.35rem}.sbtn.done,.sbtn.liked{background:var(--cdim);border-color:rgba(0,230,190,.28);color:var(--cyan)}.sbtn.like-btn{transition:transform .18s,border-color .18s,background .18s,color .18s}.sbtn.like-btn:not(:disabled):hover{transform:translateY(-1px);border-color:rgba(0,230,190,.32);color:var(--cyan)}.sbtn.like-btn:disabled{cursor:default;opacity:.88}
        .related{margin-top:4.5rem;padding-top:2.5rem;border-top:1px solid var(--border)}.sec-tag{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.4rem}.sec-tag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}.rcard{background:var(--bg2);border:1px solid var(--border);border-radius:12px;text-decoration:none;overflow:hidden;display:flex;flex-direction:column}.rcard-stripe{height:2px;width:100%;flex-shrink:0}.rcard-body{padding:1.1rem}.rcard-tag{font-family:var(--m);font-size:.57rem;letter-spacing:.09em;text-transform:uppercase;font-weight:600;margin-bottom:.5rem}.rcard-title{font-size:.85rem;font-weight:700;letter-spacing:-.01em;line-height:1.32;color:var(--text);margin-bottom:.6rem}.rcard-time{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .sidebar{position:sticky;top:76px;display:flex;flex-direction:column;gap:.8rem}.sbox{background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden}.sbox-header{padding:.85rem 1.1rem;border-bottom:1px solid var(--border)}.sbox-title{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}.sbox-body{padding:.85rem 1.1rem}.toc-list{list-style:none;display:flex;flex-direction:column}.toc-item a{font-family:var(--m);font-size:.67rem;color:var(--muted);text-decoration:none;font-weight:300;line-height:1.45;display:block;padding:5px 10px 5px 12px;border-left:2px solid transparent}.toc-item.active a{color:var(--cyan);border-left-color:var(--cyan);background:var(--cdim);font-weight:500}.toc-progress{font-family:var(--m);font-size:.6rem;color:var(--dim);padding:.5rem 1.1rem;border-top:1px solid var(--border)}.toc-progress-bar{height:2px;background:var(--bg3);border-radius:1px;margin-top:.35rem;overflow:hidden}.toc-progress-fill{height:100%;background:var(--cyan);border-radius:1px;transition:width .3s ease}
        .nl-title-s{font-family:var(--d);font-size:.85rem;font-weight:700;color:var(--text);letter-spacing:-.02em;margin-bottom:.3rem}.nl-text{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.65;font-weight:300;margin-bottom:.85rem}.nl-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 11px;color:var(--text);font-family:var(--m);font-size:.74rem;outline:none;margin-bottom:.45rem}.nl-btn{width:100%;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.76rem;padding:9px;border-radius:6px;border:none;cursor:pointer}.nl-status{text-align:center;font-family:var(--m);font-size:.74rem;padding:6px 0}
        .sticky-cta{display:none}@media(max-width:960px){.sticky-cta{display:flex;align-items:center;justify-content:space-between;gap:.75rem;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(8,12,16,.97);border-top:1px solid rgba(0,230,190,.2);padding:.9rem var(--pad);backdrop-filter:blur(20px)}.sticky-cta-tool{font-family:var(--d);font-size:.82rem;font-weight:700;color:var(--text)}.sticky-cta-label{font-family:var(--m);font-size:.6rem;color:var(--muted);font-weight:300}.sticky-cta-btn{display:inline-flex;align-items:center;gap:.35rem;font-family:var(--d);font-weight:800;font-size:.82rem;padding:10px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0;transition:all .18s;color:#080c10}}
        .exit-overlay{position:fixed;inset:0;background:radial-gradient(circle at 50% 20%,rgba(0,230,190,.08),transparent 32%),rgba(3,6,10,.72);z-index:500;display:flex;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(8px)}.exit-modal{background:linear-gradient(145deg,rgba(13,17,23,.985),rgba(8,12,16,.99));border:1px solid color-mix(in srgb,var(--ac,var(--cyan)) 30%,rgba(255,255,255,.09));border-radius:26px;padding:0;max-width:720px;width:100%;position:relative;animation:exitIn .28s ease;box-shadow:0 36px 110px rgba(0,0,0,.82);overflow:hidden}.exit-modal::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--ac,var(--cyan)) 28%,rgba(255,255,255,.4),var(--ac,var(--cyan)) 72%,transparent)}.exit-close{position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:999px;color:var(--muted);cursor:pointer;font-size:.95rem;width:34px;height:34px;display:flex;align-items:center;justify-content:center;z-index:6}.exit-close:hover{color:var(--text);border-color:rgba(255,255,255,.16)}.exit-content{display:grid;grid-template-columns:minmax(230px,44%) 1fr;gap:0;min-height:360px}.exit-visual{position:relative;min-height:360px;background:var(--bg3);overflow:hidden}.exit-visual img{object-fit:cover}.exit-visual::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,16,0) 20%,rgba(8,12,16,.78) 100%),radial-gradient(circle at 12% 10%,var(--ac,var(--cyan)),transparent 38%);opacity:.9}.exit-visual-badge{position:absolute;z-index:2;left:1rem;top:1rem;font-family:var(--m);font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;color:#080c10;background:var(--ac,var(--cyan));border-radius:999px;padding:6px 9px;font-weight:900}.exit-visual-meta{position:absolute;z-index:2;left:1rem;right:1rem;bottom:1rem;display:flex;gap:.45rem;flex-wrap:wrap}.exit-visual-meta span{font-family:var(--m);font-size:.58rem;color:rgba(237,242,247,.88);background:rgba(8,12,16,.62);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(12px);border-radius:999px;padding:6px 9px}.exit-copy{padding:2.15rem 2.2rem 1.85rem;display:flex;flex-direction:column;justify-content:center}.exit-kicker{font-family:var(--m);font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ac,var(--cyan));margin-bottom:.75rem;font-weight:850}.exit-title{font-family:var(--d);font-size:clamp(1.35rem,2.6vw,1.85rem);font-weight:950;color:var(--text);margin-bottom:.75rem;letter-spacing:-.045em;line-height:1.05}.exit-desc{font-family:var(--m);font-size:.75rem;color:var(--muted);line-height:1.75;margin-bottom:1.15rem}.exit-mini-card{display:block;text-decoration:none;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1rem;margin-bottom:1rem}.exit-mini-label{font-family:var(--m);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ac,var(--cyan));margin-bottom:.45rem;font-weight:800}.exit-mini-title{font-family:var(--d);font-size:1rem;font-weight:850;line-height:1.24;color:var(--text);letter-spacing:-.025em}.exit-actions{display:flex;flex-direction:column;gap:.65rem;margin-top:.1rem}.exit-primary,.exit-secondary{display:flex;align-items:center;justify-content:center;border-radius:13px;padding:13px 14px;font-family:var(--d);font-weight:900;font-size:.9rem;text-decoration:none;cursor:pointer}.exit-primary{background:var(--ac,var(--cyan));color:#080c10;border:none;box-shadow:0 10px 30px color-mix(in srgb,var(--ac,var(--cyan)) 24%,transparent)}.exit-secondary{background:rgba(255,255,255,.025);color:var(--muted);border:1px solid rgba(255,255,255,.075)}.exit-secondary:hover{color:var(--text);border-color:rgba(255,255,255,.16)}@media(max-width:680px){.exit-overlay{align-items:flex-end;padding:.75rem}.exit-modal{border-radius:22px;max-height:calc(100vh - 1.5rem);overflow:auto}.exit-content{grid-template-columns:1fr;min-height:0}.exit-visual{min-height:185px}.exit-copy{padding:1.35rem}.exit-title{font-size:1.35rem}.exit-desc{font-size:.72rem}}
        .smart-card{position:relative;display:flex;background:var(--bg2);border:1px solid var(--border);border-radius:16px;overflow:hidden;text-decoration:none;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.smart-card:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--card-ac,var(--cyan)) 34%,rgba(255,255,255,.08));box-shadow:0 18px 45px rgba(0,0,0,.28)}.smart-card-grid{flex-direction:column}.smart-card-img{position:relative;background:var(--bg3);overflow:hidden}.smart-card-grid .smart-card-img{aspect-ratio:16/9}.smart-card-compact{display:grid;grid-template-columns:62px 1fr;gap:.75rem;padding:.55rem;border-radius:12px}.smart-card-compact .smart-card-img{width:62px;height:62px;border-radius:9px}.smart-card-hero{display:grid;grid-template-columns:minmax(260px,42%) 1fr;min-height:250px}.smart-card-hero .smart-card-img{min-height:250px}.smart-card-img img{object-fit:cover;transition:transform .25s ease}.smart-card:hover .smart-card-img img{transform:scale(1.045)}.smart-card-score{position:absolute;top:.65rem;left:.65rem;font-family:var(--m);font-size:.56rem;text-transform:uppercase;letter-spacing:.08em;color:#080c10;background:var(--card-ac,var(--cyan));border-radius:999px;padding:5px 8px;font-weight:800}.smart-card-body{padding:1rem}.smart-card-compact .smart-card-body{padding:0;min-width:0}.smart-card-kicker{font-family:var(--m);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--card-ac,var(--cyan));font-weight:800;margin-bottom:.4rem}.smart-card-title{font-family:var(--d);font-size:.92rem;font-weight:850;line-height:1.24;color:var(--text);letter-spacing:-.025em;margin-bottom:.45rem}.smart-card-hero .smart-card-title{font-size:1.35rem}.smart-card-compact .smart-card-title{font-size:.72rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.smart-card-reason{font-family:var(--m);font-size:.63rem;color:var(--muted);line-height:1.5;margin-bottom:.45rem}.smart-card-compact .smart-card-reason{display:none}.smart-card-meta{font-family:var(--m);font-size:.6rem;color:var(--dim)}.mid-read-block{margin:3rem 0;padding:1.35rem;background:linear-gradient(135deg,var(--ag,rgba(0,230,190,.08)),rgba(255,255,255,.018));border:1px solid color-mix(in srgb,var(--ac,var(--cyan)) 28%,rgba(255,255,255,.05));border-radius:20px;position:relative;overflow:hidden}.mid-read-block::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 15% 0%,var(--ag),transparent 45%);pointer-events:none}.mid-read-head{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem}.mid-read-kicker,.end-next-kicker{font-family:var(--m);font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ac,var(--cyan));font-weight:800;margin-bottom:.35rem}.mid-read-head h2{font-family:var(--d);font-size:1.18rem;line-height:1.15;color:var(--text);letter-spacing:-.035em;margin:0}.mid-read-head p{font-family:var(--m);font-size:.7rem;line-height:1.6;color:var(--muted);margin:.35rem 0 0}.mid-read-head span{font-family:var(--m);font-size:.56rem;color:var(--dim);border:1px solid var(--border);border-radius:999px;padding:6px 9px;white-space:nowrap}.mid-read-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}.end-next{margin:3.2rem 0 0;padding:1.45rem;background:var(--bg2);border:1px solid var(--border);border-radius:22px;overflow:hidden}.end-next-more{margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)}.end-next-more-title{font-family:var(--m);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}.end-next-more-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem}.rcard-img{position:relative;aspect-ratio:16/9;background:var(--bg3);overflow:hidden}.rcard-img img{object-fit:cover;transition:transform .22s ease}.rcard:hover .rcard-img img{transform:scale(1.04)}.rcard-badge{position:absolute;top:.55rem;left:.55rem;font-family:var(--m);font-size:.52rem;color:#080c10;background:var(--text);border-radius:999px;padding:4px 7px;font-weight:800}.sidebar-smart-list{display:flex;flex-direction:column;gap:.55rem}.next-drawer{position:fixed;right:22px;bottom:22px;z-index:480;width:min(430px,calc(100vw - 28px));background:linear-gradient(145deg,rgba(13,17,23,.96),rgba(8,12,16,.985));border:1px solid color-mix(in srgb,var(--ac,var(--cyan)) 36%,rgba(255,255,255,.08));border-radius:22px;padding:.78rem;box-shadow:0 26px 80px rgba(0,0,0,.62),0 0 0 1px rgba(255,255,255,.018) inset;backdrop-filter:blur(22px);animation:exitIn .28s ease;overflow:hidden}.next-drawer::before{content:'';position:absolute;left:18px;right:18px;top:0;height:1px;background:linear-gradient(90deg,transparent,var(--ac,var(--cyan)),transparent)}.next-drawer-glow{position:absolute;right:-80px;top:-90px;width:220px;height:180px;background:radial-gradient(circle,var(--ac,var(--cyan)) 0%,transparent 62%);opacity:.12;pointer-events:none}.next-drawer-close{position:absolute;top:.55rem;right:.55rem;z-index:3;width:28px;height:28px;border-radius:999px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.035);color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center}.next-drawer-card{position:relative;z-index:1;display:grid;grid-template-columns:92px 1fr;align-items:center;gap:.85rem;text-decoration:none;padding:.15rem 2.1rem .15rem 0}.next-drawer-img{position:relative;width:92px;height:68px;border-radius:15px;overflow:hidden;background:var(--bg3);border:1px solid rgba(255,255,255,.07);box-shadow:0 10px 30px rgba(0,0,0,.28)}.next-drawer-img img{object-fit:cover}.next-drawer-info{display:flex;flex-direction:column;gap:.25rem;min-width:0}.next-drawer-kicker{font-family:var(--m);font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ac,var(--cyan));font-weight:850}.next-drawer-info strong{font-family:var(--d);font-size:.9rem;line-height:1.2;color:var(--text);letter-spacing:-.025em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.next-drawer-info em{font-family:var(--m);font-size:.58rem;color:var(--muted);font-style:normal;line-height:1.45}.next-drawer-actions{position:relative;z-index:1;display:grid;grid-template-columns:1fr auto;gap:.55rem;margin-top:.7rem}.next-drawer-cta,.next-drawer-soft{display:flex;align-items:center;justify-content:center;border-radius:12px;padding:10px 12px;font-family:var(--d);font-size:.78rem;font-weight:850;text-decoration:none}.next-drawer-cta{color:#080c10;background:var(--ac,var(--cyan));box-shadow:0 8px 24px color-mix(in srgb,var(--ac,var(--cyan)) 28%,transparent)}.next-drawer-soft{border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);color:var(--muted);cursor:pointer}.next-drawer-soft:hover{color:var(--text);border-color:rgba(255,255,255,.12)}@media(max-width:760px){.mid-read-grid,.end-next-more-grid{grid-template-columns:1fr}.smart-card-hero{grid-template-columns:1fr}.smart-card-hero .smart-card-img{min-height:180px}.next-drawer{left:12px;right:12px;bottom:78px;width:auto;border-radius:18px}.next-drawer-card{grid-template-columns:78px 1fr;padding-right:1.8rem}.next-drawer-img{width:78px;height:62px}.next-drawer-actions{grid-template-columns:1fr}.next-drawer-soft{display:none}.next-drawer-info strong{font-size:.82rem}}
                .art-footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:1.75rem var(--pad);max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}.ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}.ft-copy em{color:var(--cyan);font-style:normal}.ft-links{display:flex;gap:1.25rem;list-style:none}.ft-links a{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none}
      `}</style>

      <ProgressBar color={color} />
      <div className="bg-grid" />

      {showExit && (
        <div className="exit-overlay" onClick={() => setShowExit(false)}>
          <div className="exit-modal" onClick={(event) => event.stopPropagation()} style={{ "--ac": color } as CSSProperties}>
            <button className="exit-close" onClick={() => setShowExit(false)} aria-label={lang === "fr" ? "Fermer" : "Close"}>✕</button>
            <div className="exit-content">
              {primaryRecommendation && (
                <Link
                  href={l(`/blog/${primaryRecommendation.slug}`)}
                  className="exit-visual"
                  onClick={() => { trackNeurifluxEvent("exit_visual_click", { slug: primaryRecommendation.slug, lang }); setShowExit(false); }}
                >
                  <Image src={primaryRecommendation.image} alt={primaryRecommendation.alt} fill sizes="(max-width: 680px) 100vw, 320px" />
                  <span className="exit-visual-badge">{getRecommendationScore(primaryRecommendation.slug)}% match</span>
                  <div className="exit-visual-meta">
                    <span>{primaryRecommendation.tag}</span>
                    <span>⏱ {primaryRecommendation.timeMin} {locale.readTime}</span>
                  </div>
                </Link>
              )}

              <div className="exit-copy">
                <div className="exit-kicker">{lang === "fr" ? "Ne partez pas maintenant" : "Do not leave yet"}</div>
                <div className="exit-title">
                  {primaryRecommendation
                    ? (lang === "fr" ? "La meilleure suite de lecture est prête" : "Your best next read is ready")
                    : locale.exitTitle}
                </div>
                <div className="exit-desc">
                  {primaryRecommendation
                    ? (lang === "fr"
                        ? "On vous propose un seul article, choisi pour prolonger exactement ce que vous venez de lire. Pas une grille au hasard."
                        : "One article, selected to continue exactly what you were reading. Not a random list.")
                    : locale.exitDesc}
                </div>

                {primaryRecommendation && (
                  <Link
                    href={l(`/blog/${primaryRecommendation.slug}`)}
                    className="exit-mini-card"
                    onClick={() => { trackNeurifluxEvent("exit_recommendation_click", { slug: primaryRecommendation.slug, lang }); setShowExit(false); }}
                  >
                    <div className="exit-mini-label">{lang === "fr" ? "Article recommandé" : "Recommended article"}</div>
                    <div className="exit-mini-title">{primaryRecommendation.title}</div>
                  </Link>
                )}

                <div className="exit-actions">
                  {primaryRecommendation ? (
                    <Link href={l(`/blog/${primaryRecommendation.slug}`)} className="exit-primary" onClick={() => { trackNeurifluxEvent("exit_primary_click", { slug: primaryRecommendation.slug, lang }); setShowExit(false); }}>
                      {lang === "fr" ? "Lire cet article →" : "Read this article →"}
                    </Link>
                  ) : (
                    <button onClick={() => setShowExit(false)} className="exit-primary">{locale.exitCta}</button>
                  )}

                  <button onClick={() => setShowExit(false)} className="exit-secondary">
                    {lang === "fr" ? "Continuer l'article actuel" : "Keep reading this article"}
                  </button>

                  {affiliate && (
                    <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored" onClick={() => { trackNeurifluxEvent("exit_affiliate_click", { tool: affiliate.toolName, lang }); setShowExit(false); }} className="exit-secondary">
                      🚀 {lang === "fr" ? `Essayer ${affiliate.toolName} →` : `Try ${affiliate.toolName} →`}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNextDrawer && !showExit && (
        <NextReadDrawer item={primaryRecommendation} lang={lang} l={l} color={color} onClose={() => setShowNextDrawer(false)} />
      )}

      <nav className={scrolled ? "scrolled" : ""}>
        <Link href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></Link>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><Link href={l("/aifinder")}>{locale.nav.aifinder}</Link></li>
          <li><Link href={l("/aitools")}>{locale.nav.aitools}</Link></li>
          <li><Link href={l("/blog")} className="active">{locale.nav.blog}</Link></li>
          <li><Link href={l("/comparatifs")}>{locale.nav.comparatifs}</Link></li>
          <li><Link href={l("/newsletter")}>{locale.nav.newsletter}</Link></li>
          <li><Link href={l("/contact")}>{locale.nav.contact}</Link></li>
          <li><Link href={l("/about")}>{locale.nav.about}</Link></li>
        </ul>
        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
          {showNavCta && affiliate && (
            <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored" className="nav-cta" style={{ background: color, color: "#080c10", boxShadow: `0 3px 14px ${color}30` }}>
              <span className="nav-cta-text">{locale.navCtaLabel} {affiliate.toolName}</span> →
            </a>
          )}
          <div className="lt">
            <button className={`lb${lang === "fr" ? " on" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " on" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen((value) => !value)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>

      <div className="layout" style={styleVars}>
        <main>
          <nav aria-label="breadcrumb" className="breadcrumb">
            <Link href={l("")}>Neuriflux</Link>
            <span className="breadcrumb-sep">›</span>
            <Link href={l("/blog")}>Blog</Link>
            <span className="breadcrumb-sep">›</span>
            <Link href={l(`/blog?tag=${encodeURIComponent(String(articleData.tag))}`)} style={{ color }}>{String(articleData.tag)}</Link>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: "var(--muted)" }}>{article.title.slice(0, 45)}{article.title.length > 45 ? "…" : ""}</span>
          </nav>

          <div className="art-header" style={{ "--ac": color } as CSSProperties}>
            <div className="art-header-glow" />
            <div className="article-top-actions" aria-label={lang === "fr" ? "Statistiques de l’article" : "Article stats"}>
              <span
                className="top-stat-pill views-pill"
                title={statsReady ? undefined : (lang === "fr" ? "Estimation en attendant les statistiques" : "Estimated while stats load")}
              >
                <span aria-hidden="true">👁</span>
                <strong>{displayViews}</strong>
                <em>{viewsLabel}</em>
              </span>
              <button
                type="button"
                className={`top-like-btn${liked ? " liked" : ""}`}
                onClick={handleLike}
                disabled={liked || likePending}
                aria-pressed={liked}
                aria-label={liked ? locale.liked : locale.like}
                title={liked ? locale.liked : locale.like}
              >
                <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
                <strong>{displayLikes}</strong>
                <em>{likesLabel}</em>
              </button>
            </div>
            <div className="meta">
              <span className="tag-badge" style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}>{String(articleData.tag)}</span>
              {isFresh && <span className="badge-new">✦ {locale.newBadge}</span>}
              <span className="meta-sep">·</span>
              <span className="art-date">{locale.publishedOn} {publishedLabel}</span>
              <span className="meta-sep">·</span>
              <span className="art-date">{locale.lastUpdated} {updatedLabel}</span>
              <span className="meta-sep">·</span>
              <span className="art-time">⏱ {minRead} {locale.readTime}</span>
            </div>
            <h1 className="art-title">{article.title}</h1>
            <p className="art-desc">{article.desc}</p>
            <div className="author">
              <div className="avatar">⚡</div>
              <div>
                <div className="author-name">Neuriflux</div>
                <div className="author-sub">{lang === "fr" ? "Rédaction indépendante · Tests réels" : "Independent editorial · Real tests"}</div>
              </div>
            </div>

            <figure className="hero-visual" aria-label={articleHeroAlt}>
              <div className="hero-image-wrap">
                <Image
                  src={articleHeroImage}
                  alt={articleHeroAlt}
                  fill
                  priority
                  sizes="(max-width: 960px) calc(100vw - 2.5rem), 780px"
                  className="hero-image"
                />
                <figcaption className="hero-caption">
                  <span>{String(articleData.tag)}</span>
                  <strong>Neuriflux Editorial</strong>
                </figcaption>
              </div>
            </figure>
          </div>

          

          {relatedCompSlug && <CompCrossLink compSlug={relatedCompSlug} lang={lang} l={l} color={color} />}

          <div ref={contentRef}>
            <div className="prose" style={{ "--ac": color } as CSSProperties} dangerouslySetInnerHTML={{ __html: splitContent.first }} />
            {midArticleRecommendations.length > 0 && splitContent.second && (
              <RecommendationStrip
                title={lang === "fr" ? "À lire ensuite" : "Read next"}
                subtitle={lang === "fr" ? "Ces articles prolongent exactement le sujet que vous êtes en train de lire." : "These articles are the best follow-up to what you are reading."}
                items={midArticleRecommendations}
                lang={lang}
                l={l}
                color={color}
                context="mid_article"
              />
            )}
            {affiliate && splitContent.second && <MidCTA url={affiliate.url} toolName={affiliate.toolName} label={affiliate.label[lang]} lang={lang} color={color} />}
            {splitContent.second && <div className="prose" style={{ "--ac": color } as CSSProperties} dangerouslySetInnerHTML={{ __html: splitContent.second }} />}
          </div>
          {affiliate && <EndCTA url={affiliate.url} toolName={affiliate.toolName} label={affiliate.label[lang]} lang={lang} color={color} />}
          <EndNextArticleHero item={primaryRecommendation} extraItems={endExtraRecommendations} lang={lang} l={l} color={color} />

          <div className="share">
            <span className="share-label">{locale.shareLabel}</span>
            <button className={`sbtn${copied ? " done" : ""}`} onClick={copy}>{copied ? locale.shareDone : locale.share}</button>
            <button
              type="button"
              className={`sbtn like-btn${liked ? " liked" : ""}`}
              onClick={handleLike}
              disabled={liked || likePending}
              aria-pressed={liked}
              aria-label={liked ? locale.liked : locale.like}
            >
              {liked ? "♥" : "♡"} {liked ? locale.liked : locale.like} · {displayLikes}
            </button>
            <a className="sbtn" href={shareUrl ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}&via=NeurifluxCom` : "#"} target="_blank" rel="noopener noreferrer">𝕏 Twitter</a>
            <a className="sbtn" href={shareUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` : "#"} target="_blank" rel="noopener noreferrer">in LinkedIn</a>
            <a className="sbtn" href={shareUrl ? `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}` : "#"} target="_blank" rel="noopener noreferrer">r/ Reddit</a>
            {isMobile && <a className="sbtn" href={shareUrl ? `https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}` : "#"} target="_blank" rel="noopener noreferrer">💬 {locale.mobileShare}</a>}
          </div>

          {resolvedRelated.length > 0 && (
            <div className="related">
              <div className="sec-tag">{locale.related}</div>
              <div className="rgrid">
                {resolvedRelated.map((relatedArticle, index) => {
                  const relatedColor = getColor(relatedArticle.tag);
                  return (
                    <Link key={relatedArticle.slug} href={l(`/blog/${relatedArticle.slug}`)} className="rcard" onClick={() => trackNeurifluxEvent("related_card_click", { slug: relatedArticle.slug, position: index + 1, lang })}>
                      <div className="rcard-img">
                        <Image src={getRecommendationImageSrc(relatedArticle)} alt={getRecommendationAlt(relatedArticle, lang, relatedArticle.title)} fill sizes="260px" />
                        <span className="rcard-badge">{getRecommendationScore(relatedArticle.slug)}% match</span>
                      </div>
                      <div className="rcard-stripe" style={{ background: relatedColor }} />
                      <div className="rcard-body">
                        <div className="rcard-tag" style={{ color: relatedColor }}>{relatedArticle.tag}</div>
                        <div className="rcard-title">{relatedArticle.title}</div>
                        <div className="rcard-time">⏱ {relatedArticle.timeMin} {locale.readTime} · {lang === "fr" ? "Lire" : "Read"} →</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </main>

        <aside className="sidebar">
          {tocItems.length > 0 && (
            <div className="sbox">
              <div className="sbox-header"><div className="sbox-title">{locale.toc}</div></div>
              <ul className="toc-list">
                {tocItems.map((item, index) => (
                  <li key={item.id} className={`toc-item${activeIdx === index ? " active" : ""}`}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ul>
              <div className="toc-progress">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{locale.tocProgress(readCount, tocItems.length)}</span>
                  <span style={{ color: "var(--cyan)", fontSize: ".58rem" }}>{Math.round((readCount / Math.max(1, tocItems.length)) * 100)}%</span>
                </div>
                <div className="toc-progress-bar">
                  <div className="toc-progress-fill" style={{ width: `${(readCount / Math.max(1, tocItems.length)) * 100}%`, background: color }} />
                </div>
              </div>
            </div>
          )}

          {affiliate && (
            <div className="sbox" style={{ background: `linear-gradient(160deg,${color}09,${color}02)`, border: `1px solid ${color}28` }}>
              <div className="sbox-header" style={{ borderBottomColor: `${color}15` }}><div className="sbox-title" style={{ color }}>{locale.ourPick}</div></div>
              <div className="sbox-body">
                <div style={{ fontFamily: "var(--d)", fontSize: ".96rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-.02em", marginBottom: ".25rem" }}>{affiliate.toolName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".5rem" }}><span style={{ color: "#f59e0b", fontSize: ".72rem", letterSpacing: 1 }}>★★★★★</span><span style={{ fontFamily: "var(--m)", fontSize: ".58rem", color: "var(--muted)" }}>{lang === "fr" ? "Recommandé" : "Recommended"}</span></div>
                <div style={{ fontFamily: "var(--m)", fontSize: ".67rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.55, marginBottom: ".65rem" }}>{affiliate.label[lang]}</div>
                <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".4rem", background: color, color: "#080c10", fontFamily: "var(--d)", fontWeight: 800, fontSize: ".8rem", padding: 11, borderRadius: 8, textDecoration: "none" }}>🚀 {lang === "fr" ? "Commencer gratuitement" : "Start for free"} →</a>
                <div style={{ fontFamily: "var(--m)", fontSize: ".52rem", color: "var(--dim)", textAlign: "center", marginTop: ".45rem" }}>{locale.affLink}</div>
              </div>
            </div>
          )}

          {smartRecommendations.length > 0 && (
            <div className="sbox">
              <div className="sbox-header"><div className="sbox-title">{lang === "fr" ? "Populaire dans ce sujet" : "Popular in this topic"}</div></div>
              <div className="sbox-body sidebar-smart-list">
                {smartRecommendations.slice(0, 4).map((item) => (
                  <SmartArticleCard key={`sidebar-${item.slug}`} item={item} lang={lang} l={l} color={color} variant="compact" context="sidebar" />
                ))}
              </div>
            </div>
          )}

          <div className="sbox">
            <div className="sbox-header"><div className="sbox-title">Newsletter</div></div>
            <div className="sbox-body">
              <div className="nl-title-s">{locale.nlTitle}</div>
              <p className="nl-text">{locale.nlText}</p>
              {nlStatus === "success" ? (
                <div className="nl-status" style={{ color: "var(--cyan)" }}>{locale.subDone}</div>
              ) : nlStatus === "error" ? (
                <div className="nl-status" style={{ color: "#ef4444" }}>{locale.subError}</div>
              ) : (
                <form onSubmit={handleNlSubmit}>
                  <input className="nl-input" type="email" placeholder={locale.placeholder} value={nlEmail} onChange={(event) => setNlEmail(event.target.value)} required disabled={nlStatus === "loading"} />
                  <button className="nl-btn" type="submit" disabled={nlStatus === "loading"}>{nlStatus === "loading" ? locale.subLoading : locale.sub}</button>
                </form>
              )}
            </div>
          </div>

          <div className="sbox">
            <div className="sbox-header"><div className="sbox-title">{lang === "fr" ? `Plus sur ${String(articleData.tag)}` : `More on ${String(articleData.tag)}`}</div></div>
            <div className="sbox-body" style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
              {sameTagArticles.map((sameArticle) => (
                <Link key={sameArticle.slug} href={l(`/blog/${sameArticle.slug}`)} style={{ display: "flex", flexDirection: "column", gap: ".2rem", padding: ".5rem 0", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>
                  <span style={{ fontFamily: "var(--m)", fontSize: ".7rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.3 }}>{sameArticle[lang].title}</span>
                  <span style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)" }}>⏱ {sameArticle.timeMin} {locale.readTime}</span>
                </Link>
              ))}
              <Link href={l("/blog")} style={{ fontFamily: "var(--m)", fontSize: ".68rem", color: "var(--cyan)", textDecoration: "none", display: "flex", alignItems: "center", gap: ".3rem", paddingTop: ".4rem" }}>{lang === "fr" ? "Tous les articles →" : "All articles →"}</Link>
            </div>
          </div>
        </aside>
      </div>

      {(affiliate || primaryRecommendation) && (
        <div className="sticky-cta">
          <div>
            <div className="sticky-cta-tool">{affiliate ? affiliate.toolName : primaryRecommendation?.title}</div>
            <div className="sticky-cta-label">{affiliate ? (lang === "fr" ? "Version gratuite disponible" : "Free plan available") : (lang === "fr" ? "Votre prochaine lecture" : "Your next read")}</div>
          </div>
          {affiliate ? (
            <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored" className="sticky-cta-btn" style={{ background: color, boxShadow: `0 4px 16px ${color}30` }}>{lang === "fr" ? "Essayer gratuit" : "Try free"} →</a>
          ) : primaryRecommendation ? (
            <Link href={l(`/blog/${primaryRecommendation.slug}`)} className="sticky-cta-btn" style={{ background: color, boxShadow: `0 4px 16px ${color}30` }} onClick={() => trackNeurifluxEvent("mobile_sticky_next_click", { slug: primaryRecommendation.slug, lang })}>{lang === "fr" ? "Lire" : "Read"} →</Link>
          ) : null}
        </div>
      )}

      <footer className="art-footer">
        <span className="ft-copy">© 2026 <em>Neuriflux</em>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</span>
        <ul className="ft-links">
          <li><Link href={l("/blog")}>Blog</Link></li>
          <li><Link href={l("/comparatifs")}>{lang === "fr" ? "Comparatifs" : "Comparisons"}</Link></li>
          <li><Link href={l("/newsletter")}>Newsletter</Link></li>
          <li><Link href={l("/about")}>{lang === "fr" ? "À propos" : "About"}</Link></li>
        </ul>
        <span className="ft-copy">{lang === "fr" ? "Fait avec ♥ en France" : "Made with ♥ in France"}</span>
      </footer>
    </>
  );
}
