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
  navCtaLabel: string;
  exitTitle: string;
  exitDesc: string;
  exitCta: string;
  mobileShare: string;
  nav: {
    blog: string;
    comparatifs: string;
    newsletter: string;
    contact: string;
    about: string;
  };
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
  Video: "#a855f7",
  Vidéo: "#a855f7",
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
    navCtaLabel: "Essayer",
    exitTitle: "Avant de partir...",
    exitDesc: "Vous n'avez pas encore vu la conclusion de l'article — le meilleur reste à lire.",
    exitCta: "Continuer la lecture →",
    mobileShare: "WhatsApp",
    nav: {
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
    navCtaLabel: "Try it",
    exitTitle: "Before you leave...",
    exitDesc: "You haven't reached the conclusion yet — the best part is still ahead.",
    exitCta: "Keep reading →",
    mobileShare: "WhatsApp",
    nav: {
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
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
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
      setActive(0);
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
        setActive(0);
        return;
      }

      const marker = 140;
      const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
      const pageBottom = Math.ceil(window.scrollY + viewportBottom);
      const docBottom = document.documentElement.scrollHeight;

      if (window.scrollY <= 40) {
        setActive(0);
        return;
      }

      if (docBottom - pageBottom <= 24) {
        setActive(elements.length - 1);
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

      setActive(current);
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
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  const articleData = useMemo(() => getArticleBySlug(slug), [slug]);
  const article = articleData ? articleData[lang] : null;
  const color = articleData ? getColor(articleData.tag) : "#00e6be";
  const affiliate = articleData?.affiliate;
  const locale = COPY[lang];

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(window.location.href);
    setIsMobile(/iPhone|iPad|Android/i.test(window.navigator.userAgent));
  }, [slug, lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug, lang]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      setShowNavCta(window.scrollY > 340);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 8 && !exitShown) {
        setShowExit(true);
        setExitShown(true);
      }
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [exitShown]);

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

  const resolvedRelated = useMemo(() => {
    if (!articleData) return [];
    return resolveRelated(articleData[lang].related, lang);
  }, [articleData, lang]);

  const sameTagArticles = useMemo(() => {
    if (!articleData) return [];
    return ARTICLES.filter((entry) => entry.slug !== articleData.slug && entry.tag === articleData.tag).slice(0, 4);
  }, [articleData]);

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

  const canonicalSlug = articleData?.slug ?? slug;
  const articleUrl = `https://neuriflux.com/${lang}/blog/${canonicalSlug}`;
  const altLang: Lang = lang === "fr" ? "en" : "fr";
  const altUrl = `https://neuriflux.com/${altLang}/blog/${canonicalSlug}`;
  const minRead = articleData?.timeMin || estRead(article?.content || "").toString();
  const views = useMemo(() => fakeViews(canonicalSlug), [canonicalSlug]);
  const relatedCompSlug = useMemo(() => (articleData ? getRelatedComp(canonicalSlug, article?.title || "") : null), [articleData, canonicalSlug, article]);
  const isReview = articleData ? REVIEW_TAGS.includes(String(articleData.tag)) : false;
  const isFresh = articleData ? isNew(articleData.updatedAt?.en ?? articleData.date?.en) : false;
  const publishedLabel = articleData?.date?.[lang] ?? "";
  const updatedLabel = articleData?.updatedAt?.[lang] ?? publishedLabel;
  const heroImage = `https://neuriflux.com/og/${canonicalSlug}.png`;

  const articleSchema = article && articleData ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.desc,
    image: heroImage,
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
      <link rel="alternate" hrefLang={lang} href={articleUrl} />
      <link rel="alternate" hrefLang={altLang} href={altUrl} />

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
        .art-header{position:relative;margin-bottom:3rem;padding:2rem 2.25rem;background:var(--bg2);border:1px solid var(--border);border-radius:14px;overflow:hidden}.art-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,var(--ac,var(--cyan)) 30%,var(--ac,var(--cyan)) 70%,transparent)}
        .art-header-glow{position:absolute;top:-40%;right:-10%;width:400px;height:300px;background:radial-gradient(ellipse,var(--ag,rgba(0,230,190,.07)) 0%,transparent 65%);pointer-events:none}
        .meta{display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;margin-bottom:1.25rem;position:relative;z-index:1}.tag-badge{font-family:var(--m);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:3px 10px;border-radius:100px}.badge-new{font-family:var(--m);font-size:.58rem;color:#10b981;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);padding:3px 8px;border-radius:100px;font-weight:600}
        .art-date,.art-time,.art-views{font-family:var(--m);font-size:.68rem;color:var(--muted)}.meta-sep{color:var(--dim);font-size:.6rem}
        .art-title{font-size:clamp(1.7rem,4vw,2.6rem);font-weight:800;letter-spacing:-.035em;line-height:1.1;margin-bottom:1.1rem;color:var(--text);position:relative;z-index:1}.art-desc{font-family:var(--m);font-size:.82rem;color:var(--muted);font-weight:300;line-height:1.8;padding:1rem 1.25rem;background:var(--bg3);border-left:2px solid var(--ac,var(--cyan));border-radius:0 7px 7px 0;margin-bottom:1.75rem;position:relative;z-index:1}
        .author{display:flex;align-items:center;gap:.75rem;position:relative;z-index:1}.avatar{width:34px;height:34px;background:var(--cdim);border:1px solid rgba(0,230,190,.22);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0}.author-name{font-family:var(--m);font-size:.75rem;color:var(--text);font-weight:500}.author-sub{font-family:var(--m);font-size:.62rem;color:var(--dim);font-weight:300;margin-top:.08rem}
        .prose{font-family:var(--body);font-size:1.03rem;line-height:1.9;color:#c8d5e0}.prose h2{font-family:var(--d);font-size:1.4rem;font-weight:800;letter-spacing:-.025em;color:var(--text);margin:3rem 0 0;padding:.65rem 0 .65rem 1rem;border-left:3px solid var(--ac,var(--cyan));border-bottom:1px solid var(--border);scroll-margin-top:80px}.prose h3{font-family:var(--d);font-size:1.05rem;font-weight:700;color:var(--text);margin:2rem 0 0;scroll-margin-top:80px}.prose p{margin-bottom:1.35rem}.prose strong{color:var(--text);font-weight:600;font-family:var(--d)}.prose em{color:var(--muted);font-style:italic}.prose ul,.prose ol{padding-left:1.4rem;margin:.75rem 0 1.3rem}.prose ul.emoji-list{list-style:none;padding-left:0}.prose ul.emoji-list li{display:flex;align-items:baseline;gap:.55rem;padding:.3rem 0;border-bottom:1px solid var(--border)}.eli{font-size:.95rem;flex-shrink:0}.li-yes .eli{color:#10b981}.li-no .eli{color:#ef4444}.prose p.bold-title{font-family:var(--d);font-size:1rem;font-weight:700;color:var(--text);letter-spacing:-.01em;margin-top:2rem;margin-bottom:.65rem;padding-left:.85rem;border-left:2px solid var(--ac,var(--cyan))}.prose code{font-family:var(--m);font-size:.79rem;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--cyan)}.prose pre{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:1.25rem 1.5rem;margin:1.75rem 0;overflow-x:auto}.prose pre code{background:none;border:none;padding:0;color:#a8c0d6;font-size:.79rem;line-height:1.78}.prose a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(0,230,190,.28)}.prose table{width:100%;border-collapse:collapse;margin:1.75rem 0;font-family:var(--m);font-size:.75rem}.prose th,.prose td{padding:10px 14px;border:1px solid var(--border)}.prose th{color:var(--text);font-weight:600;background:var(--bg3);text-align:left}.prose td{color:var(--muted)}
        .share{display:flex;align-items:center;gap:.55rem;margin-top:3.5rem;padding:1.25rem 1.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:12px;flex-wrap:wrap}.share-label,.share-count,.sbtn{font-family:var(--m)}.share-label{font-size:.62rem;color:var(--dim);letter-spacing:.09em;text-transform:uppercase;margin-right:.25rem}.share-count{font-size:.65rem;color:var(--dim);margin-left:auto;display:flex;align-items:center;gap:.3rem;white-space:nowrap}.sbtn{font-size:.7rem;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:.35rem}.sbtn.done{background:var(--cdim);border-color:rgba(0,230,190,.28);color:var(--cyan)}
        .related{margin-top:4.5rem;padding-top:2.5rem;border-top:1px solid var(--border)}.sec-tag{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.4rem}.sec-tag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}.rcard{background:var(--bg2);border:1px solid var(--border);border-radius:12px;text-decoration:none;overflow:hidden;display:flex;flex-direction:column}.rcard-stripe{height:2px;width:100%;flex-shrink:0}.rcard-body{padding:1.1rem}.rcard-tag{font-family:var(--m);font-size:.57rem;letter-spacing:.09em;text-transform:uppercase;font-weight:600;margin-bottom:.5rem}.rcard-title{font-size:.85rem;font-weight:700;letter-spacing:-.01em;line-height:1.32;color:var(--text);margin-bottom:.6rem}.rcard-time{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .sidebar{position:sticky;top:76px;display:flex;flex-direction:column;gap:.8rem}.sbox{background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden}.sbox-header{padding:.85rem 1.1rem;border-bottom:1px solid var(--border)}.sbox-title{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}.sbox-body{padding:.85rem 1.1rem}.toc-list{list-style:none;display:flex;flex-direction:column}.toc-item a{font-family:var(--m);font-size:.67rem;color:var(--muted);text-decoration:none;font-weight:300;line-height:1.45;display:block;padding:5px 10px 5px 12px;border-left:2px solid transparent}.toc-item.active a{color:var(--cyan);border-left-color:var(--cyan);background:var(--cdim);font-weight:500}.toc-progress{font-family:var(--m);font-size:.6rem;color:var(--dim);padding:.5rem 1.1rem;border-top:1px solid var(--border)}.toc-progress-bar{height:2px;background:var(--bg3);border-radius:1px;margin-top:.35rem;overflow:hidden}.toc-progress-fill{height:100%;background:var(--cyan);border-radius:1px;transition:width .3s ease}
        .nl-title-s{font-family:var(--d);font-size:.85rem;font-weight:700;color:var(--text);letter-spacing:-.02em;margin-bottom:.3rem}.nl-text{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.65;font-weight:300;margin-bottom:.85rem}.nl-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 11px;color:var(--text);font-family:var(--m);font-size:.74rem;outline:none;margin-bottom:.45rem}.nl-btn{width:100%;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.76rem;padding:9px;border-radius:6px;border:none;cursor:pointer}.nl-status{text-align:center;font-family:var(--m);font-size:.74rem;padding:6px 0}
        .sticky-cta{display:none}@media(max-width:960px){.sticky-cta{display:flex;align-items:center;justify-content:space-between;gap:.75rem;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(8,12,16,.97);border-top:1px solid rgba(0,230,190,.2);padding:.9rem var(--pad);backdrop-filter:blur(20px)}.sticky-cta-tool{font-family:var(--d);font-size:.82rem;font-weight:700;color:var(--text)}.sticky-cta-label{font-family:var(--m);font-size:.6rem;color:var(--muted);font-weight:300}.sticky-cta-btn{display:inline-flex;align-items:center;gap:.35rem;font-family:var(--d);font-weight:800;font-size:.82rem;padding:10px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0;transition:all .18s;color:#080c10}}
        .exit-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:500;display:flex;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(4px)}.exit-modal{background:var(--bg2);border:1px solid rgba(0,230,190,.25);border-radius:20px;padding:2.5rem;max-width:420px;width:100%;position:relative;animation:exitIn .3s ease;box-shadow:0 32px 80px rgba(0,0,0,.7)}.exit-close{position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--dim);cursor:pointer;font-size:1.1rem;padding:4px}
        .art-footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:1.75rem var(--pad);max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}.ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}.ft-copy em{color:var(--cyan);font-style:normal}.ft-links{display:flex;gap:1.25rem;list-style:none}.ft-links a{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none}
      `}</style>

      <ProgressBar color={color} />
      <div className="bg-grid" />

      {showExit && (
        <div className="exit-overlay" onClick={() => setShowExit(false)}>
          <div className="exit-modal" onClick={(event) => event.stopPropagation()}>
            <button className="exit-close" onClick={() => setShowExit(false)}>✕</button>
            <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>📖</div>
            <div style={{ fontFamily: "var(--d)", fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", marginBottom: ".5rem", letterSpacing: "-.02em" }}>{locale.exitTitle}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: ".78rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "1.5rem" }}>{locale.exitDesc}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
              <button onClick={() => setShowExit(false)} style={{ background: color, color: "#080c10", border: "none", borderRadius: 10, padding: "12px", fontFamily: "var(--d)", fontWeight: 800, fontSize: ".88rem", cursor: "pointer" }}>{locale.exitCta}</button>
              {affiliate && (
                <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored" onClick={() => setShowExit(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color, border: `1px solid ${color}40`, borderRadius: 10, padding: "11px", fontFamily: "var(--d)", fontWeight: 700, fontSize: ".85rem", textDecoration: "none" }}>
                  🚀 {lang === "fr" ? `Essayer ${affiliate.toolName} →` : `Try ${affiliate.toolName} →`}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className={scrolled ? "scrolled" : ""}>
        <Link href={l("")} className="logo"><div className="logo-dot" />Neuri<em>flux</em></Link>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
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
            <div className="meta">
              <span className="tag-badge" style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}>{String(articleData.tag)}</span>
              {isFresh && <span className="badge-new">✦ {locale.newBadge}</span>}
              <span className="meta-sep">·</span>
              <span className="art-date">{locale.publishedOn} {publishedLabel}</span>
              <span className="meta-sep">·</span>
              <span className="art-date">{locale.lastUpdated} {updatedLabel}</span>
              <span className="meta-sep">·</span>
              <span className="art-time">⏱ {minRead} {locale.readTime}</span>
              <span className="art-views">↑ {views.toLocaleString()} {locale.readCount}</span>
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
          </div>

          {relatedCompSlug && <CompCrossLink compSlug={relatedCompSlug} lang={lang} l={l} color={color} />}

          <div ref={contentRef}>
            <div className="prose" style={{ "--ac": color } as CSSProperties} dangerouslySetInnerHTML={{ __html: splitContent.first }} />
            {affiliate && splitContent.second && <MidCTA url={affiliate.url} toolName={affiliate.toolName} label={affiliate.label[lang]} lang={lang} color={color} />}
            {splitContent.second && <div className="prose" style={{ "--ac": color } as CSSProperties} dangerouslySetInnerHTML={{ __html: splitContent.second }} />}
          </div>
          {affiliate && <EndCTA url={affiliate.url} toolName={affiliate.toolName} label={affiliate.label[lang]} lang={lang} color={color} />}

          <div className="share">
            <span className="share-label">{locale.shareLabel}</span>
            <button className={`sbtn${copied ? " done" : ""}`} onClick={copy}>{copied ? locale.shareDone : locale.share}</button>
            <a className="sbtn" href={shareUrl ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}&via=NeurifluxCom` : "#"} target="_blank" rel="noopener noreferrer">𝕏 Twitter</a>
            <a className="sbtn" href={shareUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` : "#"} target="_blank" rel="noopener noreferrer">in LinkedIn</a>
            <a className="sbtn" href={shareUrl ? `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}` : "#"} target="_blank" rel="noopener noreferrer">r/ Reddit</a>
            {isMobile && <a className="sbtn" href={shareUrl ? `https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}` : "#"} target="_blank" rel="noopener noreferrer">💬 {locale.mobileShare}</a>}
            <span className="share-count">↑ {views.toLocaleString()} {locale.readCount}</span>
          </div>

          {resolvedRelated.length > 0 && (
            <div className="related">
              <div className="sec-tag">{locale.related}</div>
              <div className="rgrid">
                {resolvedRelated.map((relatedArticle, index) => {
                  const relatedColor = getColor(relatedArticle.tag);
                  return (
                    <Link key={`${relatedArticle.slug}-${index}`} href={l(`/blog/${relatedArticle.slug}`)} className="rcard">
                      <div className="rcard-stripe" style={{ background: relatedColor }} />
                      <div className="rcard-body">
                        <div className="rcard-tag" style={{ color: relatedColor }}>{relatedArticle.tag}</div>
                        <div className="rcard-title">{relatedArticle.title}</div>
                        <div className="rcard-time">⏱ {relatedArticle.timeMin} {locale.readTime}</div>
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

      {affiliate && (
        <div className="sticky-cta">
          <div>
            <div className="sticky-cta-tool">{affiliate.toolName}</div>
            <div className="sticky-cta-label">{lang === "fr" ? "Version gratuite disponible" : "Free plan available"}</div>
          </div>
          <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored" className="sticky-cta-btn" style={{ background: color, boxShadow: `0 4px 16px ${color}30` }}>{lang === "fr" ? "Essayer gratuit" : "Try free"} →</a>
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
