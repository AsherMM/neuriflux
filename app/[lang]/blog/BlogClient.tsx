"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ARTICLES, type Article } from "../lib/articles";

type Lang = "fr" | "en";
type Status = "idle" | "loading" | "success" | "error";

const TAG_MAP: Record<string, { fr: string; en: string; color: string }> = {
  Chatbots: { fr: "Chatbots", en: "Chatbots", color: "#00e6be" },
  Code: { fr: "Code", en: "Code", color: "#3b82f6" },
  Rédaction: { fr: "Rédaction", en: "Writing", color: "#f59e0b" },
  Writing: { fr: "Rédaction", en: "Writing", color: "#f59e0b" },
  Image: { fr: "Image", en: "Image", color: "#a855f7" },
  Productivité: { fr: "Productivité", en: "Productivity", color: "#10b981" },
  Productivity: { fr: "Productivité", en: "Productivity", color: "#10b981" },
  Audio: { fr: "Audio", en: "Audio", color: "#ef4444" },
  Video: { fr: "Vidéo", en: "Video", color: "#e11d48" },
  Vidéo: { fr: "Vidéo", en: "Video", color: "#e11d48" },
};

const canonical = (tag: string): string => TAG_MAP[tag]?.fr ?? tag;
const gc = (tag: string): string => TAG_MAP[tag]?.color ?? "#00e6be";
const tagLabel = (tag: string, lang: Lang): string => TAG_MAP[tag]?.[lang] ?? tag;

const ARTICLE_IMAGE_FALLBACK = "/articles/article00.png";

function articleImageSrc(article: Article): string {
  return article.heroImage?.src ?? ARTICLE_IMAGE_FALLBACK;
}

function articleImageAlt(article: Article, lang: Lang): string {
  return article.heroImage?.alt?.[lang] ?? article[lang].title;
}

const getAllCanonicalTags = (): string[] => {
  const seen = new Set<string>();

  ARTICLES.forEach((article) => {
    const value = canonical(article.tag);
    if (!seen.has(value)) seen.add(value);
  });

  return Array.from(seen);
};

const isNew = (date: string): boolean => {
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return false;
  return (Date.now() - time) / 86_400_000 <= 12;
};

type ArticleKind = "Review" | "Comparison" | "Guide" | "News" | "Tutorial" | "Analysis";
type Difficulty = "Beginner" | "Intermediate" | "Expert";

const TRENDING = new Set([
  "ia-2026",
  "prompts-ia-2026",
  "claude-mythos-next-anthropic-2026",
  "vibe-coding-tools-2026",
  "sora-fermeture-openai-2026",
  "perplexity-ai-review-2026",
  "grok-review-2026",
]);

const ENTITY_LOGOS: Record<string, { label: string; color: string; aliases: string[] }> = {
  chatgpt: { label: "ChatGPT", color: "#00e6be", aliases: ["chatgpt", "openai", "gpt", "dall", "sora", "codex"] },
  claude: { label: "Claude", color: "#d97757", aliases: ["claude", "anthropic", "opus", "sonnet", "haiku", "claude code"] },
  gemini: { label: "Gemini", color: "#8e75ff", aliases: ["gemini", "google ai", "veo", "imagen", "notebooklm"] },
  perplexity: { label: "Perplexity", color: "#20b8cd", aliases: ["perplexity"] },
  grok: { label: "Grok", color: "#ffffff", aliases: ["grok", "xai", "x.ai"] },
  deepseek: { label: "DeepSeek", color: "#4d6bff", aliases: ["deepseek"] },
  cursor: { label: "Cursor", color: "#ffffff", aliases: ["cursor"] },
  cline: { label: "Cline", color: "#3b82f6", aliases: ["cline"] },
  kilo: { label: "Kilo Code", color: "#22c55e", aliases: ["kilo code", "kilocode"] },
  runway: { label: "Runway", color: "#a855f7", aliases: ["runway"] },
  kling: { label: "Kling", color: "#38bdf8", aliases: ["kling"] },
  midjourney: { label: "Midjourney", color: "#a855f7", aliases: ["midjourney"] },
  elevenlabs: { label: "ElevenLabs", color: "#22c55e", aliases: ["elevenlabs", "voice", "tts"] },
  n8n: { label: "n8n", color: "#ff4a00", aliases: ["n8n"] },
  make: { label: "Make", color: "#6366f1", aliases: ["make"] },
  zapier: { label: "Zapier", color: "#ff4f00", aliases: ["zapier"] },
};

const readMinutes = (article: Article): number => {
  const value = Number(article.timeMin);
  return Number.isFinite(value) ? value : 0;
};

function articleSearchText(article: Article, lang: Lang) {
  return `${article.slug} ${article.tag} ${article[lang].title} ${article[lang].desc}`.toLowerCase();
}

function getArticleEntities(article: Article, lang: Lang) {
  const text = articleSearchText(article, lang);
  return Object.entries(ENTITY_LOGOS)
    .filter(([, entity]) => entity.aliases.some((alias) => text.includes(alias)))
    .map(([id, entity]) => ({ id, ...entity }))
    .slice(0, 5);
}

function getArticleKind(article: Article, lang: Lang): ArticleKind {
  const text = articleSearchText(article, lang);
  if (text.includes(" vs ") || text.includes("versus") || text.includes("comparatif") || text.includes("comparison")) return "Comparison";
  if (text.includes("review") || text.includes("avis")) return "Review";
  if (text.includes("guide") || text.includes("how to") || text.includes("comment ")) return "Guide";
  if (text.includes("fermeture") || text.includes("shutdown") || text.includes("news") || text.includes("annonce")) return "News";
  if (text.includes("prompt") || text.includes("tutorial") || text.includes("tutoriel")) return "Tutorial";
  return "Analysis";
}

function getDifficulty(article: Article, lang: Lang): Difficulty {
  const text = articleSearchText(article, lang);
  if (text.includes("api") || text.includes("code") || text.includes("developer") || text.includes("agent") || text.includes("mcp")) return "Expert";
  if (readMinutes(article) >= 14 || text.includes("comparatif") || text.includes("comparison")) return "Intermediate";
  return "Beginner";
}

function getArticleScore(article: Article, lang: Lang) {
  const kind = getArticleKind(article, lang);
  const entityCount = getArticleEntities(article, lang).length;
  const base = article.featured ? 9.15 : 8.55;
  const trend = TRENDING.has(article.slug) ? 0.2 : 0;
  const fresh = isNew(article.date.en) ? 0.18 : 0;
  const depth = Math.min(readMinutes(article) / 42, 0.35);
  const entityBoost = Math.min(entityCount * 0.07, 0.28);
  const kindBoost = kind === "Review" || kind === "Comparison" ? 0.22 : 0.08;
  return Math.min(9.9, base + trend + fresh + depth + entityBoost + kindBoost);
}

function getVerdict(article: Article, lang: Lang) {
  const kind = getArticleKind(article, lang);
  const main = getArticleEntities(article, lang)[0]?.label;
  if (lang === "fr") {
    if (kind === "Review" && main) return `Notre avis clair sur ${main}, ses limites et ses meilleurs cas d’usage.`;
    if (kind === "Comparison") return "Le choix le plus rationnel selon le prix, la qualité et le workflow réel.";
    if (kind === "Guide") return "Un guide pratique pour décider vite sans perdre des heures à tester.";
    if (kind === "News") return "Le contexte important, les conséquences et ce que ça change vraiment.";
    return "Analyse courte, utile et orientée décision.";
  }
  if (kind === "Review" && main) return `Our clear take on ${main}, its limits and best real use cases.`;
  if (kind === "Comparison") return "The most rational choice based on price, quality and real workflow.";
  if (kind === "Guide") return "A practical guide to decide faster without wasting hours testing.";
  if (kind === "News") return "The key context, consequences and what actually changes.";
  return "Short, useful analysis built for decisions.";
}

function kindLabel(kind: ArticleKind, lang: Lang) {
  if (lang === "en") return kind;
  return ({ Review: "Avis", Comparison: "Comparatif", Guide: "Guide", News: "Actu", Tutorial: "Tutoriel", Analysis: "Analyse" } as Record<ArticleKind, string>)[kind];
}

function difficultyLabel(level: Difficulty, lang: Lang) {
  if (lang === "en") return level;
  return ({ Beginner: "Facile", Intermediate: "Intermédiaire", Expert: "Expert" } as Record<Difficulty, string>)[level];
}

const T = {
  fr: {
    nav: {
      aifinder: "Ai-Finder",
      blog: "Blog",
      comparatifs: "Comparatifs",
      newsletter: "Newsletter",
      contact: "Contact",
      about: "À propos",
    },
    badge: "Articles & Analyses",
    title: "Le blog",
    accent: "Neuriflux",
    subtitle: "Tests approfondis, analyses honnêtes et guides pratiques sur les meilleurs outils IA du marché.",
    freshLabel: "✦ Mis à jour : avril 2026",
    search: "Rechercher un article...",
    all: "Tous",
    featured: "À la une",
    allLabel: "Tous les articles",
    readMore: "Lire →",
    readTime: "min",
    noResults: "Aucun article trouvé.",
    trending: "Tendance",
    new: "Nouveau",
    ctaTitle: "Zéro bruit. Que du signal.",
    ctaDesc: "Les meilleurs outils IA de la semaine, testés et résumés en 5 minutes. Rejoins 4 200+ lecteurs.",
    ctaPlaceholder: "ton@email.com",
    ctaCta: "Je m'abonne →",
    ctaSent: "✓ Bienvenue !",
    ctaErr: "Erreur. Réessayez.",
    ctaNo: "Sans spam. Résiliable en 1 clic.",
    statsArticles: "articles publiés",
    statsTools: "outils testés",
    statsReaders: "lecteurs",
    statsUpdated: "mis à jour",
    resultCount: "résultat(s)",
    ctaMiniText: "lecteurs reçoivent nos analyses chaque semaine.",
    ctaMiniBtn: "Rejoindre →",
    comparatifsLabel: "Voir les comparatifs →",
    comparatifsDesc: "Scores détaillés, verdicts clairs.",
    navCta: "Newsletter gratuite",
    views: "vues",
    aiFinderLabel: "Trouver mon outil IA →",
    aiFinderDesc: "Pas sûr du bon outil ? L’AI Finder recommande la meilleure IA selon votre usage.",
    editorPick: "Choix éditorial",
    popularSearchesTitle: "Recherches populaires",
    popularSearchesDesc: "Accédez rapidement aux sujets IA les plus demandés cette semaine.",
    popularSearches: [
      { label: "Meilleurs outils IA gratuits", href: "/blog/alternatives-gratuites-chatgpt" },
      { label: "ChatGPT vs Claude vs Gemini", href: "/blog/chatgpt-vs-claude-vs-gemini-2026" },
      { label: "Outils IA pour coder", href: "/blog/cursor-ai-review-2026" },
      { label: "IA vidéo", href: "/blog/sora-fermeture-openai-2026" },
      { label: "Prompts IA efficaces", href: "/blog/prompt-errors-2026" },
    ],
    editorialTitle: "Des articles conçus pour aider à choisir, pas juste informer",
    editorialDesc: "Chaque contenu combine analyse, limites concrètes, alternatives et cas d’usage. L’objectif est de transformer la veille IA en décisions utiles.",
    ftTagline: "Le média indépendant des outils IA.",
    ftContent: "Contenu",
    ftLegal: "Légal",
    ftLinks: [
      { l: "Blog", h: "/blog" },
      { l: "Comparatifs", h: "/comparatifs" },
      { l: "Newsletter", h: "/newsletter" },
      { l: "Contact", h: "/contact" },
      { l: "À propos", h: "/about" },
    ],
    ftLegal2: [
      { l: "Mentions légales", h: "/legal" },
      { l: "Confidentialité", h: "/privacy" },
      { l: "Cookies", h: "/cookies" },
    ],
    ftRights: "Tous droits réservés.",
    ftMade: "Fait avec ♥ en France",
  },
  en: {
    nav: {
      aifinder: "Ai-Finder",
      blog: "Blog",
      comparatifs: "Comparisons",
      newsletter: "Newsletter",
      contact: "Contact",
      about: "About",
    },
    badge: "Articles & Analysis",
    title: "The",
    accent: "Neuriflux Blog",
    subtitle: "In-depth reviews, honest analysis and practical guides on the best AI tools on the market.",
    freshLabel: "✦ Updated: April 2026",
    search: "Search articles...",
    all: "All",
    featured: "Featured",
    allLabel: "All articles",
    readMore: "Read →",
    readTime: "min",
    noResults: "No articles found.",
    trending: "Trending",
    new: "New",
    ctaTitle: "Zero noise. Pure signal.",
    ctaDesc: "The best AI tools of the week, tested and summarized in 5 minutes. Join 4,200+ readers.",
    ctaPlaceholder: "your@email.com",
    ctaCta: "Subscribe →",
    ctaSent: "✓ Welcome!",
    ctaErr: "Something went wrong.",
    ctaNo: "No spam. Unsubscribe in 1 click.",
    statsArticles: "articles published",
    statsTools: "tools tested",
    statsReaders: "readers",
    statsUpdated: "up to date",
    resultCount: "result(s)",
    ctaMiniText: "readers get our weekly AI tool analysis.",
    ctaMiniBtn: "Join now →",
    comparatifsLabel: "See comparisons →",
    comparatifsDesc: "Detailed scores, clear verdicts.",
    navCta: "Free newsletter",
    views: "views",
    aiFinderLabel: "Find my AI tool →",
    aiFinderDesc: "Not sure what to use? AI Finder recommends the best AI for your workflow.",
    editorPick: "Editor’s pick",
    popularSearchesTitle: "Popular searches",
    popularSearchesDesc: "Jump straight into the AI topics readers are searching for this week.",
    popularSearches: [
      { label: "Best free AI tools", href: "/blog/alternatives-gratuites-chatgpt" },
      { label: "ChatGPT vs Claude vs Gemini", href: "/blog/chatgpt-vs-claude-vs-gemini-2026" },
      { label: "AI tools for coding", href: "/blog/cursor-ai-review-2026" },
      { label: "AI video tools", href: "/blog/sora-fermeture-openai-2026" },
      { label: "Better AI prompts", href: "/blog/prompt-errors-2026" },
    ],
    editorialTitle: "Articles built to help you choose, not just read",
    editorialDesc: "Each piece combines analysis, concrete limits, alternatives and real use cases. The goal is to turn AI research into useful decisions.",
    ftTagline: "The independent AI tools media.",
    ftContent: "Content",
    ftLegal: "Legal",
    ftLinks: [
      { l: "Blog", h: "/blog" },
      { l: "Comparisons", h: "/comparatifs" },
      { l: "Newsletter", h: "/newsletter" },
      { l: "Contact", h: "/contact" },
      { l: "About", h: "/about" },
    ],
    ftLegal2: [
      { l: "Legal notice", h: "/legal" },
      { l: "Privacy", h: "/privacy" },
      { l: "Cookies", h: "/cookies" },
    ],
    ftRights: "All rights reserved.",
    ftMade: "Made with ♥ in France",
  },
} as const;

function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 300, background: "rgba(0,0,0,.4)" }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg,#00e6be,#3b82f6,#a855f7)",
          transition: "width .08s linear",
          boxShadow: "0 0 10px rgba(0,230,190,.5)",
        }}
      />
    </div>
  );
}

function StatNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    let raf = 0;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;

        done.current = true;
        const duration = 1100;
        const start = Date.now();

        const tick = () => {
          const progress = Math.min(1, (Date.now() - start) / duration);
          setVal(Math.round((1 - Math.pow(1 - progress, 3)) * target));
          if (progress < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    if (ref.current) obs.observe(ref.current);

    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        requestAnimationFrame(() => setVisible(true));
        ob.disconnect();
      },
      { threshold: 0.06 }
    );

    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(18px)",
        transition: `opacity .55s ${delay}ms ease, transform .55s ${delay}ms ease`,
      }}
    >
      {children}
    </div>
  );
}

function ToolLogoRow({ article, lang }: { article: Article; lang: Lang }) {
  const entities = getArticleEntities(article, lang);
  if (!entities.length) return null;

  return (
    <div className="tool-row" aria-label={lang === "fr" ? "Outils cités" : "Mentioned tools"}>
      {entities.map((entity) => (
        <span key={entity.id} className="tool-chip" style={{ borderColor: `${entity.color}30`, color: entity.color }} title={entity.label}>
          <span className="tool-dot" style={{ background: entity.color }} aria-hidden="true">
            {entity.label.slice(0, 1)}
          </span>
          <span>{entity.label}</span>
        </span>
      ))}
    </div>
  );
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

    let raf = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.setProperty("--mx", `${event.clientX}px`);
        ref.current.style.setProperty("--my", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, [reduced]);

  if (reduced) return null;
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

function EditorialTrustBar({ lang }: { lang: Lang }) {
  const items = lang === "fr"
    ? [
        ["✓", "Humain", "Analyses relues, pas de classement automatique."],
        ["⚖", "Indépendant", "Verdicts séparés des liens affiliés."],
        ["↻", "Mis à jour", "Articles conçus pour évoluer avec les outils IA."],
      ]
    : [
        ["✓", "Human-led", "Reviewed analysis, not automated rankings."],
        ["⚖", "Independent", "Verdicts stay separate from affiliate links."],
        ["↻", "Updated", "Articles are built to evolve with AI tools."],
      ];

  return (
    <section className="trust-lab" aria-label={lang === "fr" ? "Méthode éditoriale" : "Editorial method"}>
      {items.map(([icon, title, desc]) => (
        <div key={title} className="trust-lab-item">
          <span className="trust-lab-icon">{icon}</span>
          <div>
            <strong>{title}</strong>
            <p>{desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function ClearFiltersButton({ lang, onClick }: { lang: Lang; onClick: () => void }) {
  return (
    <button type="button" className="clear-filters" onClick={onClick}>
      {lang === "fr" ? "Réinitialiser" : "Clear filters"}
    </button>
  );
}

function ArticleIntelligence({ article, lang, compact = false }: { article: Article; lang: Lang; compact?: boolean }) {
  const kind = getArticleKind(article, lang);
  const difficulty = getDifficulty(article, lang);
  const score = getArticleScore(article, lang);
  const progress = Math.min(100, Math.max(30, readMinutes(article) * 6));

  return (
    <div className={`article-intel${compact ? " compact" : ""}`}>
      <div className="intel-top">
        <span className="kind-badge">{kindLabel(kind, lang)}</span>
        <span className={`difficulty ${difficulty.toLowerCase()}`}>{difficultyLabel(difficulty, lang)}</span>
        <span className="nf-mini-score"><span>Neuriflux</span><strong>{score.toFixed(1)}</strong></span>
      </div>
      <div className="read-meter" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <ToolLogoRow article={article} lang={lang} />
      {!compact && <p className="nf-verdict">{getVerdict(article, lang)}</p>}
    </div>
  );
}

function CardFeatured({ article, lang, t, l }: {
  article: Article;
  lang: Lang;
  t: (typeof T)[Lang];
  l: (p: string) => string;
}) {
  const a = article[lang];
  const color = gc(article.tag);
  const [hov, setHov] = useState(false);
  const fresh = isNew(article.date.en);
  const trend = TRENDING.has(article.slug);
  const cardStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    border: `1px solid ${hov ? `${color}40` : "var(--border)"}`,
    borderRadius: 14,
    padding: "1.85rem",
    display: "flex",
    flexDirection: "column",
    gap: ".85rem",
    textDecoration: "none",
    transition: "border-color .22s, transform .22s, box-shadow .22s, background .22s",
    transform: hov ? "translateY(-4px)" : "none",
    boxShadow: hov ? `0 20px 60px rgba(0,0,0,.55), 0 0 0 1px ${color}20` : "0 2px 12px rgba(0,0,0,.2)",
    background: hov ? `linear-gradient(145deg,${color}06,var(--bg2))` : "var(--bg2)",
  };

  return (
    <a href={l(`/blog/${article.slug}`)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={cardStyle}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: hov ? 1 : 0.5, transition: "opacity .25s" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top right,${color}10,transparent 65%)`, opacity: hov ? 1 : 0, transition: "opacity .3s", pointerEvents: "none" }} />

      <div className="card-image featured-image">
        <Image
          src={articleImageSrc(article)}
          alt={articleImageAlt(article, lang)}
          fill
          sizes="(max-width: 720px) 100vw, 520px"
          className="card-image-img"
          priority={article.featured}
        />
        <div className="card-image-shade" style={{ background: `linear-gradient(135deg,${color}25,transparent 58%)` }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap", position: "relative" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: ".62rem", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}30`, padding: "3px 10px", borderRadius: 100 }}>
          {tagLabel(article.tag, lang)}
        </span>

        {fresh && (
          <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", color: "#f59e0b", background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.25)", padding: "3px 9px", borderRadius: 100, fontWeight: 600 }}>
            ✦ {t.new}
          </span>
        )}

        {trend && !fresh && (
          <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", color: "#a855f7", background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.25)", padding: "3px 9px", borderRadius: 100, fontWeight: 600 }}>
            ↑ {t.trending}
          </span>
        )}
      </div>

      <div style={{ fontFamily: "var(--d)", fontSize: "1.06rem", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.3, color: "var(--text)", position: "relative" }}>
        {a.title}
      </div>

      <ArticleIntelligence article={article} lang={lang} />

      <div style={{ fontFamily: "var(--m)", fontSize: ".74rem", color: "var(--muted)", lineHeight: 1.7, fontWeight: 300, flex: 1, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 4, overflow: "hidden" }}>
        {a.desc}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ".85rem", borderTop: "1px solid var(--border)", marginTop: "auto", position: "relative", gap: ".9rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".63rem", color: "var(--dim)" }}>{article.date[lang]}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontFamily: "var(--m)", fontSize: ".65rem", color: "var(--dim)" }}>⏱ {article.timeMin} {t.readTime}</span>
          <span style={{ fontFamily: "var(--m)", fontSize: ".7rem", fontWeight: 700, color: hov ? "#080c10" : color, background: hov ? color : `${color}12`, border: `1px solid ${color}`, borderRadius: 6, padding: "4px 10px", transition: "all .2s" }}>
            {t.readMore}
          </span>
        </div>
      </div>
    </a>
  );
}

function Card({ article, lang, t, l, animDelay = 0 }: {
  article: Article;
  lang: Lang;
  t: (typeof T)[Lang];
  l: (p: string) => string;
  animDelay?: number;
}) {
  const a = article[lang];
  const color = gc(article.tag);
  const [hov, setHov] = useState(false);
  const fresh = isNew(article.date.en);
  const trend = TRENDING.has(article.slug);

  return (
    <a
      href={l(`/blog/${article.slug}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${hov ? `${color}35` : "var(--border)"}`,
        borderRadius: 12,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: ".7rem",
        textDecoration: "none",
        transition: "border-color .22s, transform .22s, box-shadow .22s, background .22s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 14px 40px rgba(0,0,0,.5), 0 0 0 1px ${color}15` : "0 2px 8px rgba(0,0,0,.18)",
        background: hov ? `linear-gradient(145deg,${color}06,var(--bg2))` : "var(--bg2)",
        animation: `fadeUp .5s ease ${animDelay}ms both`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: hov ? 1 : 0.35, transition: "opacity .25s" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top right,${color}07,transparent 70%)`, opacity: hov ? 1 : 0, transition: "opacity .3s", pointerEvents: "none" }} />

      <div className="card-image">
        <Image
          src={articleImageSrc(article)}
          alt={articleImageAlt(article, lang)}
          fill
          sizes="(max-width: 520px) 100vw, (max-width: 980px) 50vw, 360px"
          className="card-image-img"
        />
        <div className="card-image-shade" style={{ background: `linear-gradient(135deg,${color}22,transparent 62%)` }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap", position: "relative" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: ".58rem", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}30`, padding: "3px 9px", borderRadius: 100 }}>
          {tagLabel(article.tag, lang)}
        </span>

        {fresh && (
          <span style={{ fontFamily: "var(--m)", fontSize: ".56rem", color: "#f59e0b", background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.25)", padding: "3px 8px", borderRadius: 100, fontWeight: 600 }}>
            ✦ {t.new}
          </span>
        )}

        {trend && !fresh && (
          <span style={{ fontFamily: "var(--m)", fontSize: ".56rem", color: "#a855f7", background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.25)", padding: "3px 8px", borderRadius: 100, fontWeight: 600 }}>
            ↑ {t.trending}
          </span>
        )}

        <span style={{ fontFamily: "var(--m)", fontSize: ".56rem", color: "var(--dim)", background: "var(--bg3)", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: 100, marginLeft: "auto" }}>
          ⏱ {article.timeMin} {t.readTime}
        </span>
      </div>

      <div style={{ fontFamily: "var(--d)", fontSize: ".96rem", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.3, color: "var(--text)", position: "relative" }}>
        {a.title}
      </div>

      <ArticleIntelligence article={article} lang={lang} compact />

      <div style={{ fontFamily: "var(--m)", fontSize: ".72rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300, flex: 1, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3, overflow: "hidden" }}>
        {a.desc}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ".75rem", borderTop: "1px solid var(--border)", marginTop: "auto", position: "relative", gap: ".75rem" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: ".6rem", color: "var(--dim)" }}>{article.date[lang]}</span>
        <span style={{ fontFamily: "var(--m)", fontSize: ".68rem", fontWeight: 700, color: hov ? "#080c10" : color, background: hov ? color : `${color}10`, border: `1px solid ${color}`, borderRadius: 6, padding: "3px 9px", transition: "all .2s" }}>
          {t.readMore}
        </span>
      </div>
    </a>
  );
}

function NewsletterCTA({ t }: { t: (typeof T)[Lang]; }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const resetStatusLater = useCallback((delay: number) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), delay);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatus("error");
      resetStatusLater(3000);
      return;
    }

    setStatus("loading");

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("success");
      setEmail("");
      resetStatusLater(4000);
    } catch {
      setStatus("error");
      resetStatusLater(3500);
    }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(0,230,190,.07) 0%,rgba(59,130,246,.05) 100%)", border: "1px solid rgba(0,230,190,.2)", borderRadius: 16, padding: "clamp(1.75rem,4vw,2.5rem)", margin: "2.5rem 0 4rem" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,230,190,.5) 40%,rgba(0,230,190,.5) 60%,transparent)" }} />
      <div style={{ position: "absolute", top: "-60%", right: "-10%", width: 400, height: 320, background: "radial-gradient(ellipse,rgba(0,230,190,.08),transparent 65%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, background: "rgba(0,230,190,.1)", border: "1px solid rgba(0,230,190,.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>✉</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--d)", fontSize: "1.12rem", fontWeight: 700, letterSpacing: "-.02em", color: "var(--text)", marginBottom: ".3rem" }}>{t.ctaTitle}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: ".73rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300 }}>{t.ctaDesc}</div>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {status === "success" ? (
            <div role="status" style={{ fontFamily: "var(--m)", fontSize: ".78rem", color: "var(--cyan)", background: "var(--cdim)", border: "1px solid rgba(0,230,190,.25)", borderRadius: 8, padding: "10px 16px", display: "inline-block" }}>
              {t.ctaSent}
            </div>
          ) : (
            <>
              {status === "error" && (
                <div role="alert" style={{ fontFamily: "var(--m)", fontSize: ".74rem", color: "#ef4444", background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.22)", borderRadius: 8, padding: "8px 14px", marginBottom: ".5rem" }}>
                  {t.ctaErr}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t.ctaPlaceholder}
                  required
                  autoComplete="email"
                  inputMode="email"
                  disabled={status === "loading"}
                  aria-label={t.ctaPlaceholder}
                  style={{ flex: 1, minWidth: 180, background: "rgba(8,12,16,.7)", border: "1px solid rgba(0,230,190,.25)", borderRadius: 8, padding: "9px 13px", color: "var(--text)", fontFamily: "var(--m)", fontSize: ".78rem", outline: "none", transition: "border-color .18s" }}
                />

                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                  style={{ background: "var(--cyan)", color: "#080c10", border: "none", borderRadius: 8, padding: "9px 20px", fontFamily: "var(--d)", fontSize: ".78rem", fontWeight: 700, cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.65 : 1, whiteSpace: "nowrap", transition: "opacity .2s" }}
                >
                  {status === "loading" ? "..." : t.ctaCta}
                </button>
              </form>
            </>
          )}
        </div>

        <span style={{ fontFamily: "var(--m)", fontSize: ".62rem", color: "var(--dim)" }}>🔒 {t.ctaNo}</span>
      </div>
    </div>
  );
}

function AiFinderCrossLink({ t, l }: { t: (typeof T)[Lang]; l: (p: string) => string }) {
  return (
    <a href={l("/aifinder")} className="ai-finder-link">
      <div>
        <div className="cross-kicker">✦ AI Finder</div>
        <div className="cross-title">{t.aiFinderDesc}</div>
      </div>
      <span>{t.aiFinderLabel}</span>
    </a>
  );
}

function ComparatifsCrossLink({ t, l }: { t: (typeof T)[Lang]; l: (p: string) => string }) {
  const [hov, setHov] = useState(false);
  const accent = "#00e6be";

  return (
    <a
      href={l("/comparatifs")}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
        background: hov ? `linear-gradient(145deg,${accent}08,var(--bg2))` : "var(--bg2)",
        border: `1px solid ${hov ? `${accent}35` : "var(--border)"}`,
        borderRadius: 12,
        padding: "1.1rem 1.5rem",
        margin: "0 0 2.5rem",
        textDecoration: "none",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? `0 14px 40px rgba(0,0,0,.38), 0 0 0 1px ${accent}15` : "none",
        transition: "border-color .2s, transform .2s, box-shadow .2s, background .2s",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--m)", fontSize: ".62rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--cyan)", marginBottom: ".25rem" }}>
          ⚔️ Neuriflux Comparatifs
        </div>
        <div style={{ fontFamily: "var(--m)", fontSize: ".73rem", color: "var(--muted)" }}>{t.comparatifsDesc}</div>
      </div>

      <span style={{ fontFamily: "var(--m)", fontSize: ".73rem", fontWeight: 600, color: "var(--cyan)", whiteSpace: "nowrap" }}>
        {t.comparatifsLabel}
      </span>
    </a>
  );
}

export default function BlogClient({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavCta, setShowNavCta] = useState(false);
  const [filtersSticky, setFiltersSticky] = useState(false);

  const filtersRef = useRef<HTMLDivElement>(null);
  const filtersTop = useRef(0);

  const t = T[lang];
  const canonicalTags = useMemo(() => getAllCanonicalTags(), []);
  const l = useCallback((path: string) => `/${lang}${path}`, [lang]);

  const switchLang = useCallback((next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  }, [lang, pathname, router]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setActiveTag("all");
  }, []);

  useEffect(() => {
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const recalcFiltersTop = () => {
      if (!filtersRef.current) return;
      filtersTop.current = filtersRef.current.getBoundingClientRect().top + window.scrollY;
    };

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 60);
        setShowNavCta(y > 320);
        setFiltersSticky(filtersTop.current > 0 && y > filtersTop.current - 62);
      });
    };

    const handleResize = () => {
      recalcFiltersTop();
      update();
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    timeout = setTimeout(() => {
      recalcFiltersTop();
      update();
    }, 100);

    return () => {
      cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setMenuOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ARTICLES.filter((article) => {
      const matchTag = activeTag === "all" || canonical(article.tag) === activeTag;
      const matchSearch =
        !query ||
        article[lang].title.toLowerCase().includes(query) ||
        article[lang].desc.toLowerCase().includes(query) ||
        tagLabel(article.tag, lang).toLowerCase().includes(query);

      return matchTag && matchSearch;
    });
  }, [activeTag, lang, search]);

  const featured = useMemo(() => filtered.filter((article) => article.featured), [filtered]);
  const rest = useMemo(() => filtered.filter((article) => !article.featured), [filtered]);

  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: lang === "fr" ? "Blog Neuriflux — Outils IA 2026" : "Neuriflux Blog — AI Tools 2026",
    description: t.subtitle,
    url: `https://neuriflux.com/${lang}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Neuriflux",
      url: "https://neuriflux.com",
      logo: { "@type": "ImageObject", url: "https://neuriflux.com/logo.png" },
      sameAs: ["https://twitter.com/NeurifluxCom"],
    },
    blogPost: ARTICLES.slice(0, 10).map((article) => ({
      "@type": "BlogPosting",
      headline: article[lang].title,
      description: article[lang].desc,
      url: `https://neuriflux.com/${lang}/blog/${article.slug}`,
      datePublished: article.date.en,
      dateModified: article.date.en,
      inLanguage: lang,
      timeRequired: `PT${article.timeMin}M`,
      image: `https://neuriflux.com${articleImageSrc(article)}`,
      author: { "@type": "Organization", name: "Neuriflux" },
      publisher: { "@type": "Organization", name: "Neuriflux" },
    })),
  }), [lang, t.subtitle]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <link rel="canonical" href={`https://neuriflux.com/${lang}/blog`} />
      <link rel="alternate" hrefLang="fr" href="https://neuriflux.com/fr/blog" />
      <link rel="alternate" hrefLang="en" href="https://neuriflux.com/en/blog" />

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
        button,a{-webkit-tap-highlight-color:transparent}
        button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--cyan);outline-offset:3px}
        .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.016) 1px,transparent 1px);background-size:72px 72px;pointer-events:none;z-index:0}
        .bg-glow{position:fixed;top:-20%;left:50%;transform:translateX(-50%);width:1000px;height:700px;background:radial-gradient(ellipse,rgba(0,230,190,.05) 0%,transparent 68%);pointer-events:none;z-index:0}
        .bg-noise{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.055;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.42'/%3E%3C/svg%3E")}
        .cursor-glow{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(520px circle at var(--mx,50%) var(--my,18%),rgba(0,230,190,.075),transparent 42%),radial-gradient(340px circle at var(--mx,50%) var(--my,18%),rgba(59,130,246,.045),transparent 56%);mix-blend-mode:screen}

        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}

        nav{position:sticky;top:0;z-index:200;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(8,12,16,.94);border-bottom:1px solid var(--border);padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .2s,background .2s}
        nav.scrolled{box-shadow:0 4px 28px rgba(0,0,0,.45);background:rgba(8,12,16,.97)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite;flex-shrink:0}
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
        .nav-links a{font-family:var(--m);font-size:.74rem;color:var(--muted);text-decoration:none;letter-spacing:.03em;transition:color .15s}
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}
        .lb{font-family:var(--m);font-size:.67rem;font-weight:500;padding:4px 9px;border-radius:4px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s}
        .lb.on{background:var(--cyan);color:#080c10}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}
        .nav-cta{display:flex;align-items:center;gap:.35rem;font-family:var(--d);font-weight:700;font-size:.71rem;padding:5px 12px;border-radius:6px;text-decoration:none;white-space:nowrap;color:#080c10;background:var(--cyan);animation:slideDown .3s ease both;transition:all .18s}
        .nav-cta:hover{transform:translateY(-1px);filter:brightness(1.1)}
        .wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 var(--pad)}

        .hero{padding:clamp(3.5rem,7vw,6rem) 0 clamp(1.5rem,3vw,2rem)}
        .hero-badge{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--m);font-size:.7rem;letter-spacing:.08em;color:var(--cyan);background:var(--cdim);border:1px solid rgba(0,230,190,.22);border-radius:100px;padding:6px 14px;margin-bottom:1.2rem;animation:fadeUp .5s ease both}
        .hero-badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:blink 2s infinite;flex-shrink:0}
        .hero h1{font-size:clamp(2.2rem,5.5vw,3.8rem);font-weight:800;letter-spacing:-.03em;line-height:1.06;margin-bottom:.75rem;animation:fadeUp .5s .1s ease both}
        .ac{color:var(--cyan)}
        .hero-fresh{font-family:var(--m);font-size:.64rem;color:var(--dim);letter-spacing:.06em;margin-bottom:.9rem;animation:fadeUp .5s .15s ease both}
        .hero-sub{font-family:var(--m);font-size:.86rem;color:var(--muted);font-weight:300;line-height:1.75;max-width:520px;margin-bottom:2rem;animation:fadeUp .5s .2s ease both}

        .stats-strip{display:flex;gap:2.5rem;padding:.5rem 0 2rem;flex-wrap:wrap;border-top:1px solid var(--border)}
        .trust-lab{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:0 0 1.45rem;border:1px solid var(--border);border-radius:16px;overflow:hidden;background:var(--border);box-shadow:0 18px 60px rgba(0,0,0,.20)}
        .trust-lab-item{display:flex;gap:.8rem;align-items:flex-start;background:rgba(13,17,23,.82);padding:1rem 1.15rem;transition:background .18s,border-color .18s}
        .trust-lab-item:hover{background:rgba(17,24,32,.94)}
        .trust-lab-icon{width:25px;height:25px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:rgba(0,230,190,.09);border:1px solid rgba(0,230,190,.18);color:var(--cyan);font-family:var(--m);font-size:.7rem;flex-shrink:0}
        .trust-lab-item strong{display:block;font-family:var(--d);font-size:.78rem;letter-spacing:-.015em;color:var(--text);margin-bottom:.12rem}
        .trust-lab-item p{font-family:var(--m);font-size:.64rem;line-height:1.55;color:var(--muted)}
        .stat-item{display:flex;flex-direction:column;gap:.2rem;padding-top:1.25rem}
        .stat-num{font-family:var(--d);font-size:1.6rem;font-weight:800;letter-spacing:-.04em;color:var(--cyan)}
        .stat-label{font-family:var(--m);font-size:.62rem;color:var(--muted);letter-spacing:.05em;text-transform:uppercase}

        .toolbar{padding:.85rem 0;display:flex;flex-direction:column;gap:.8rem;transition:all .2s}
        .toolbar.sticky{position:sticky;top:60px;z-index:90;background:rgba(8,12,16,.96);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--border);padding:.7rem var(--pad);margin:0 calc(-1 * var(--pad));box-shadow:0 4px 24px rgba(0,0,0,.4)}
        .toolbar-row{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap}
        .search-wrap{position:relative;flex:1;max-width:380px;min-width:180px}
        .search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none;font-size:.82rem}
        .search-input{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 13px 9px 38px;color:var(--text);font-family:var(--m);font-size:.78rem;outline:none;transition:border-color .18s}
        .search-input:focus{border-color:rgba(0,230,190,.3)}
        .search-input::placeholder{color:var(--dim)}
        .result-count{font-family:var(--m);font-size:.67rem;color:var(--dim)}
        .clear-filters{font-family:var(--m);font-size:.67rem;color:var(--cyan);background:rgba(0,230,190,.06);border:1px solid rgba(0,230,190,.18);border-radius:999px;padding:6px 10px;cursor:pointer;transition:background .18s,border-color .18s,transform .18s}
        .clear-filters:hover{background:rgba(0,230,190,.10);border-color:rgba(0,230,190,.34);transform:translateY(-1px)}
        .filters{display:flex;gap:.4rem;flex-wrap:wrap}
        .ftag{font-family:var(--m);font-size:.69rem;padding:5px 13px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;white-space:nowrap;display:flex;align-items:center;gap:.3rem}
        .ftag:hover{border-color:rgba(0,230,190,.28);color:var(--cyan);background:var(--cdim)}
        .ftag.on{background:var(--cyan);border-color:var(--cyan);color:#080c10;font-weight:700}
        .ftag-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}


        .card-image{position:relative;aspect-ratio:1200/675;border-radius:11px;overflow:hidden;border:1px solid rgba(255,255,255,.075);background:linear-gradient(135deg,var(--bg3),var(--bg2));margin-bottom:.15rem}
        .featured-image{aspect-ratio:1200/560;border-radius:13px}
        .card-image-img{object-fit:cover;transition:transform .35s ease,filter .35s ease}
        .card-image-shade{position:absolute;inset:0;pointer-events:none}
        a:hover .card-image-img{transform:scale(1.035);filter:saturate(1.08)}
        .article-intel{position:relative;display:flex;flex-direction:column;gap:.55rem;padding:.72rem;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.025)}
        .article-intel.compact{padding:.58rem;gap:.45rem}
        .intel-top{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap}
        .kind-badge,.difficulty,.nf-mini-score{font-family:var(--m);font-size:.54rem;letter-spacing:.07em;text-transform:uppercase;border-radius:999px;padding:3px 7px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:var(--muted)}
        .kind-badge{color:var(--cyan);border-color:rgba(0,230,190,.22);background:rgba(0,230,190,.07)}
        .difficulty.beginner{color:#22c55e;border-color:rgba(34,197,94,.22);background:rgba(34,197,94,.07)}
        .difficulty.intermediate{color:#f59e0b;border-color:rgba(245,158,11,.22);background:rgba(245,158,11,.07)}
        .difficulty.expert{color:#ef4444;border-color:rgba(239,68,68,.22);background:rgba(239,68,68,.07)}
        .nf-mini-score{margin-left:auto;display:inline-flex;align-items:center;gap:.35rem;color:var(--text)}
        .nf-mini-score strong{color:var(--cyan);font-size:.66rem}
        .read-meter{height:3px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden}
        .read-meter span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--cyan),#3b82f6,#a855f7)}
        .tool-row{display:flex;flex-wrap:wrap;gap:.35rem}
        .tool-chip{display:inline-flex;align-items:center;gap:.3rem;font-family:var(--m);font-size:.58rem;border:1px solid;border-radius:999px;padding:3px 7px;background:rgba(255,255,255,.025)}
        .tool-dot{width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#081018;font-family:var(--d);font-size:.55rem;font-weight:900}
        .nf-verdict{font-family:var(--m);font-size:.66rem;line-height:1.55;color:var(--muted)}
        .ai-finder-link{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin:0 0 1.3rem;padding:1.05rem 1.2rem;border:1px solid rgba(0,230,190,.18);border-radius:16px;text-decoration:none;background:radial-gradient(circle at 0% 0%,rgba(0,230,190,.13),transparent 38%),linear-gradient(145deg,rgba(17,24,32,.96),rgba(8,12,16,.96));box-shadow:0 18px 54px rgba(0,0,0,.25);transition:transform .18s,border-color .18s,box-shadow .18s}
        .ai-finder-link:hover{transform:translateY(-2px);border-color:rgba(0,230,190,.34);box-shadow:0 24px 70px rgba(0,0,0,.34)}
        .cross-kicker{font-family:var(--m);font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:.25rem}
        .cross-title{font-family:var(--d);font-size:.95rem;font-weight:750;letter-spacing:-.025em;color:var(--text)}
        .ai-finder-link>span{font-family:var(--m);font-size:.7rem;font-weight:800;color:#081018;background:var(--cyan);border-radius:8px;padding:8px 13px;white-space:nowrap}
        .blog-intent{display:grid;grid-template-columns:.9fr 1.1fr;gap:1rem;align-items:center;margin:0 0 1.5rem;padding:1.2rem;border:1px solid rgba(255,255,255,.075);border-radius:16px;background:radial-gradient(circle at 12% 0%,rgba(0,230,190,.12),transparent 36%),rgba(255,255,255,.024)}
        .intent-kicker{font-family:var(--m);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:.45rem}
        .blog-intent h2{font-family:var(--d);font-size:clamp(1.05rem,2.1vw,1.45rem);letter-spacing:-.035em;line-height:1.12;color:var(--text);margin-bottom:.45rem}
        .blog-intent p{font-family:var(--m);font-size:.7rem;line-height:1.72;color:var(--muted);max-width:560px}
        .intent-links{display:flex;flex-wrap:wrap;gap:.55rem;justify-content:flex-end}
        .intent-links a{font-family:var(--m);font-size:.66rem;color:var(--cyan);text-decoration:none;border:1px solid rgba(0,230,190,.16);background:rgba(0,230,190,.055);border-radius:999px;padding:7px 10px;display:inline-flex;align-items:center;gap:.4rem;transition:border-color .18s,background .18s,transform .18s}
        .intent-links a:hover{border-color:rgba(0,230,190,.35);background:rgba(0,230,190,.09);transform:translateY(-1px)}
        @media(max-width:780px){.blog-intent{grid-template-columns:1fr}.intent-links{justify-content:flex-start}}
        @media(max-width:780px){.trust-lab{grid-template-columns:1fr}}

        .sec-tag{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.2rem;display:flex;align-items:center;gap:.45rem}
        .sec-tag::before{content:'';width:16px;height:1px;background:var(--cyan);display:inline-block}
        .grid-featured{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.5rem;margin-bottom:1rem}
        .grid-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.2rem;margin-bottom:3rem}
        .cta-mini{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:1rem 1.5rem;margin:1.5rem 0 3rem}
        .cta-mini-text{font-family:var(--m);font-size:.74rem;color:var(--muted)}
        .cta-mini-text strong{color:var(--cyan);font-weight:700}
        .cta-mini-btn{font-family:var(--m);font-size:.73rem;font-weight:700;color:#080c10;background:var(--cyan);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;white-space:nowrap;text-decoration:none;transition:opacity .18s;display:inline-block}
        .cta-mini-btn:hover{opacity:.85}
        .no-results{text-align:center;padding:4rem 2rem;font-family:var(--m);color:var(--muted);font-size:.85rem;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:3rem}

        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2.25rem var(--pad);max-width:1160px;margin:0 auto}
        .ft{display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem}
        .ft-tag{font-family:var(--m);font-size:.7rem;color:var(--muted);font-weight:300;line-height:1.65;max-width:210px;margin-top:.4rem}
        .ft-col{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
        .ft-ul{list-style:none;display:flex;flex-direction:column;gap:.45rem}
        .ft-ul a{font-family:var(--m);font-size:.7rem;color:var(--muted);text-decoration:none;transition:color .15s;font-weight:300}
        .ft-ul a:hover{color:var(--cyan)}
        .ft-bot{margin-top:1.75rem;padding-top:1.1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}

        @media(max-width:720px){
          .hb{display:flex}
          .nav-links{display:none}
          .nav-links.open{display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.25rem var(--pad);gap:1rem;z-index:99}
        }
        @media(max-width:600px){.ft{grid-template-columns:1fr;gap:1.5rem}}
        @media(max-width:560px){.nav-cta span{display:none}}
        @media(max-width:520px){.grid-featured,.grid-all{grid-template-columns:1fr}}
        @media(prefers-reduced-motion:reduce){
          html{scroll-behavior:auto}
          .logo-dot,.hero-badge-dot,.nav-cta{animation:none}
          .cursor-glow{display:none}
          *{transition-duration:.01ms!important;animation-duration:.01ms!important}
          a:hover .card-image-img{transform:none;filter:none}
        }
      `}</style>

      <ScrollProgress />
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-noise" />
      <CursorGlow />

      <nav className={scrolled ? "scrolled" : ""} aria-label={lang === "fr" ? "Menu principal" : "Main navigation"}>
        <a href={l("")} className="logo">
          <div className="logo-dot" aria-hidden="true" />
          Neuri<em>flux</em>
        </a>

        <ul className={`nav-links${menuOpen ? " open" : ""}`} role="list">
          <li><a href={l("/aifinder")}>{t.nav.aifinder}</a></li>
          <li><a href={l("/blog")} className="active">{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")}>{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/contact")}>{t.nav.contact}</a></li>
          <li><a href={l("/about")}>{t.nav.about}</a></li>
        </ul>

        <div style={{ display: "flex", gap: ".65rem", alignItems: "center" }}>
          {showNavCta && (
            <a href={l("/newsletter")} className="nav-cta">
              <span>{t.navCta}</span> →
            </a>
          )}

          <div className="lt" aria-label={lang === "fr" ? "Changer de langue" : "Switch language"}>
            <button className={`lb${lang === "fr" ? " on" : ""}`} aria-pressed={lang === "fr"} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " on" : ""}`} aria-pressed={lang === "en"} onClick={() => switchLang("en")}>EN</button>
          </div>

          <button
            className="hb"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? (lang === "fr" ? "Fermer le menu" : "Close menu") : (lang === "fr" ? "Menu principal" : "Main navigation")}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className="wrap">
        <div className="hero">
          <div className="hero-badge">
            <div className="hero-badge-dot" aria-hidden="true" />
            {t.badge}
          </div>

          <h1>{t.title} <span className="ac">{t.accent}</span></h1>
          <div className="hero-fresh" aria-label={lang === "fr" ? "Date de mise à jour" : "Last update"}>{t.freshLabel}</div>
          <p className="hero-sub">{t.subtitle}</p>

          <div className="stats-strip">
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={ARTICLES.length} /></span>
              <span className="stat-label">{t.statsArticles}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={42} /></span>
              <span className="stat-label">{t.statsTools}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={4200} suffix="+" /></span>
              <span className="stat-label">{t.statsReaders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-num"><StatNumber target={2026} /></span>
              <span className="stat-label">{t.statsUpdated}</span>
            </div>
          </div>
        </div>

        {!search && activeTag === "all" && (
          <FadeIn delay={20}>
            <EditorialTrustBar lang={lang} />
          </FadeIn>
        )}

        {!search && activeTag === "all" && (
          <FadeIn delay={40}>
            <section className="blog-intent" aria-labelledby="popular-searches-heading">
              <div>
                <div className="intent-kicker">{t.popularSearchesTitle}</div>
                <h2 id="popular-searches-heading">{t.editorialTitle}</h2>
                <p>{t.editorialDesc}</p>
              </div>
              <div className="intent-links" role="list">
                {t.popularSearches.map((item) => (
                  <a key={item.href} href={l(item.href)} role="listitem">
                    {item.label}
                    <span aria-hidden="true">→</span>
                  </a>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {!search && activeTag === "all" && (
          <FadeIn delay={70}>
            <AiFinderCrossLink t={t} l={l} />
          </FadeIn>
        )}

        <div ref={filtersRef} className={`toolbar${filtersSticky ? " sticky" : ""}`}>
          <div className="toolbar-row">
            <div className="search-wrap">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                className="search-input"
                type="search"
                placeholder={t.search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label={t.search}
              />
            </div>

            {(search || activeTag !== "all") && (
              <>
                <span className="result-count" aria-live="polite">{filtered.length} {t.resultCount}</span>
                <ClearFiltersButton lang={lang} onClick={clearFilters} />
              </>
            )}
          </div>

          <div className="filters" role="group" aria-label={lang === "fr" ? "Filtres par catégorie" : "Filter by category"}>
            <button className={`ftag${activeTag === "all" ? " on" : ""}`} onClick={() => setActiveTag("all")} aria-pressed={activeTag === "all"}>
              {t.all}
            </button>

            {canonicalTags.map((canonTag) => {
              const color = gc(canonTag);
              const label = tagLabel(canonTag, lang);
              const isActive = activeTag === canonTag;

              return (
                <button
                  key={canonTag}
                  className={`ftag${isActive ? " on" : ""}`}
                  onClick={() => setActiveTag(canonTag)}
                  aria-pressed={isActive}
                >
                  <span className="ftag-dot" style={{ background: isActive ? "#080c10" : color }} aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="no-results" role="status">
            <div style={{ fontSize: "1.5rem", marginBottom: ".75rem" }}>🔍</div>
            {t.noResults}
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <FadeIn delay={0}>
                <section style={{ marginBottom: "3rem" }} aria-labelledby="featured-heading">
                  <div className="sec-tag" id="featured-heading">{t.featured}</div>
                  <div className="grid-featured">
                    {featured.map((article) => (
                      <CardFeatured key={article.slug} article={article} lang={lang} t={t} l={l} />
                    ))}
                  </div>
                </section>
              </FadeIn>
            )}

            {featured.length > 0 && rest.length > 0 && !search && activeTag === "all" && (
              <FadeIn delay={80}>
                <div className="cta-mini">
                  <span className="cta-mini-text">
                    <strong>4{lang === "fr" ? "\u202f" : ","}200+</strong> {t.ctaMiniText}
                  </span>
                  <a href={l("/newsletter")} className="cta-mini-btn">{t.ctaMiniBtn}</a>
                </div>
              </FadeIn>
            )}

            {!search && activeTag === "all" && rest.length > 0 && (
              <FadeIn delay={100}>
                <ComparatifsCrossLink t={t} l={l} />
              </FadeIn>
            )}

            {rest.length > 0 && (
              <FadeIn delay={60}>
                <section aria-labelledby="all-articles-heading">
                  {featured.length > 0 && <div className="sec-tag" id="all-articles-heading">{t.allLabel}</div>}
                  <div className="grid-all">
                    {rest.map((article, index) => (
                      <Card key={article.slug} article={article} lang={lang} t={t} l={l} animDelay={Math.min(index * 50, 300)} />
                    ))}
                  </div>
                </section>
              </FadeIn>
            )}

            {!search && (
              <FadeIn delay={40}>
                <NewsletterCTA t={t} />
              </FadeIn>
            )}
          </>
        )}
      </div>

      <footer>
        <div className="ft">
          <div>
            <a href={l("")} className="logo" style={{ fontSize: ".93rem" }}>
              <div className="logo-dot" aria-hidden="true" />
              Neuri<em>flux</em>
            </a>
            <p className="ft-tag">{t.ftTagline}</p>
          </div>

          <div>
            <div className="ft-col">{t.ftContent}</div>
            <ul className="ft-ul">
              {t.ftLinks.map((item) => <li key={item.h}><a href={l(item.h)}>{item.l}</a></li>)}
            </ul>
          </div>

          <div>
            <div className="ft-col">{t.ftLegal}</div>
            <ul className="ft-ul">
              {t.ftLegal2.map((item) => <li key={item.h}><a href={l(item.h)}>{item.l}</a></li>)}
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