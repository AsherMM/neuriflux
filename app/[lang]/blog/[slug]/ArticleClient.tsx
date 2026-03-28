"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getArticleBySlug } from "../../lib/articles";
import { useNewsletter } from "@/lib/useNewsletter";

type Lang = "fr" | "en";

// ─── Traductions ───────────────────────────────────────────────────────────────
const T = {
  fr: {
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
    badge: "Articles & Analyses",
    title: "Le blog", accent: "Neuriflux",
    subtitle: "Tests approfondis, analyses honnêtes et guides pratiques sur les meilleurs outils IA du marché.",
    search: "Rechercher un article...",
    all: "Tous", featured: "À la une", allLabel: "Tous les articles",
    readMore: "Lire →", readTime: "min",
    noResults: "Aucun article trouvé.",
  },
  en: {
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
    badge: "Articles & Analysis",
    title: "The", accent: "Neuriflux Blog",
    subtitle: "In-depth reviews, honest analysis and practical guides on the best AI tools on the market.",
    search: "Search articles...",
    all: "All", featured: "Featured", allLabel: "All articles",
    readMore: "Read →", readTime: "min",
    noResults: "No articles found.",
  },
};


// ─── Couleurs par tag ──────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", Rédaction: "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", Productivité: "#10b981",
  Productivity: "#10b981", Audio: "#ef4444", Video: "#a855f7", Vidéo: "#a855f7",
};
const getColor = (tag: string) => TAG_COLORS[tag] || "#00e6be";

// ─── Slugify (ancres TOC) ─────────────────────────────────────────────────────
const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMd(md: string): string {
  let h = md.trim();
  h = h.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_, hd, body) => {
    const ths = hd.split("|").filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map((row: string) =>
      "<tr>" + row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join("") + "</tr>"
    ).join("");
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });
  h = h.replace(/```[\w]*\n?([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  h = h.replace(/^### (.+)$/gm, (_, t) => `<h3 id="${slugify(t)}">${t}</h3>`);
  h = h.replace(/^## (.+)$/gm, (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`);
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*(.+?)\*/g, "<em>$1</em>");
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
  h = h.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  h = h.replace(/(^- .+\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map(l => `<li>${l.replace(/^- /, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });
  h = h.replace(/(^[✅❌].+\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map(line => {
      const trimmed = line.trim();
      const emoji = trimmed.startsWith("✅") ? "✅" : "❌";
      const text = trimmed.slice(2).trim();
      return `<li class="emoji-${emoji === "✅" ? "yes" : "no"}"><span class="eli">${emoji}</span> ${text}</li>`;
    }).join("");
    return `<ul class="emoji-list">${items}</ul>`;
  });
  h = h.replace(/^(<strong>[^<]+<\/strong>:?)$/gm, '<p class="bold-title">$1</p>');
  h = h.replace(/(<\/h[23]>)\n(<ul|<ol)/g, "$1\n\n$2");
  h = h.split(/\n\n+/).map(block => {
    block = block.trim();
    if (!block) return "";
    if (/^<(h[123]|ul|ol|table|pre|blockquote|p)/.test(block)) return block;
    return `<p>${block.replace(/\n/g, " ")}</p>`;
  }).join("\n");
  h = h.replace(/<p>\s*<\/p>/g, "");
  return h;
}

// ─── Barre de progression lecture ─────────────────────────────────────────────
function ProgressBar({ color }: { color: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setP(el.scrollHeight - el.clientHeight > 0
        ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 300, background: "rgba(0,0,0,.4)" }}>
      <div style={{ height: "100%", width: `${p}%`, background: color, transition: "width .08s linear", boxShadow: `0 0 10px ${color}80` }} />
    </div>
  );
}

// ─── Hook TOC actif au scroll ─────────────────────────────────────────────────
function useActiveHeading(headings: string[]) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!headings.length) return;
    const ids = headings.map(slugify);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = ids.indexOf(e.target.id);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [headings]);
  return active;
}

// ─── CTA milieu d'article ─────────────────────────────────────────────────────
function MidCTA({ url, toolName, label, lang }: { url: string; toolName: string; label: string; lang: Lang }) {
  return (
    <div className="mid-cta">
      <div className="mid-cta-stripe" />
      <div className="mid-cta-inner">
        <div>
          <div className="mid-cta-eyebrow">{lang === "fr" ? "✦ Recommandé par Neuriflux" : "✦ Recommended by Neuriflux"}</div>
          <div className="mid-cta-tool">{toolName}</div>
          <div className="mid-cta-label">{label}</div>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer sponsored" className="mid-cta-btn">
          {lang === "fr" ? "Essayer gratuitement" : "Try for free"} →
        </a>
      </div>
      <div className="mid-cta-note">{lang === "fr" ? "Lien affilié" : "Affiliate link"}</div>
    </div>
  );
}

// ─── CTA fin d'article ────────────────────────────────────────────────────────
function EndCTA({ url, toolName, label, lang }: { url: string; toolName: string; label: string; lang: Lang }) {
  return (
    <div className="end-cta">
      <div className="end-cta-glow" />
      <div className="end-cta-stripe" />
      <div className="end-cta-eyebrow">
        <span className="end-cta-line" />
        {lang === "fr" ? "Notre recommandation" : "Our recommendation"}
      </div>
      <div className="end-cta-body">
        <div>
          <div className="end-cta-tool">{toolName}</div>
          <div className="end-cta-label">{label}</div>
        </div>
        <div className="end-cta-actions">
          <a href={url} target="_blank" rel="noopener noreferrer sponsored" className="end-cta-btn">
            {lang === "fr" ? "Essayer" : "Try"} {toolName} →
          </a>
          <span className="end-cta-note">{lang === "fr" ? "Lien affilié — sans coût supplémentaire" : "Affiliate link — no extra cost"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ArticleClient({ lang, slug }: { lang: Lang; slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const t = T[lang];

  useEffect(() => { setShareUrl(window.location.href); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const { status: nlStatus, subscribe } = useNewsletter("article-sidebar");
  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(nlEmail, lang);
  };

  const l = (path: string) => `/${lang}${path}`;
  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };

  const articleData = getArticleBySlug(slug);
  const article = articleData ? articleData[lang] : null;
  const color = articleData ? getColor(articleData.tag) : "#00e6be";
  const affiliate = articleData?.affiliate;

  const copy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const L = lang === "fr" ? {
    back: "← Blog", share: copied ? "Copié !" : "Copier",
    toc: "Dans cet article", related: "Articles similaires", readTime: "min",
    sub: "Je m'abonne", subLoading: "...", subDone: "✓ À lundi !",
    subError: "Erreur, réessayez.", placeholder: "votre@email.com",
    nlTitle: "Le radar IA · chaque lundi",
    nlText: "Les meilleurs outils, les comparatifs qui comptent. Gratuit.",
    shareLabel: "Partager",
    ourPick: "★ Notre choix", affLink: "Lien affilié", tryFree: "Essayer gratuitement",
    nav: { blog: "Blog", comparatifs: "Comparatifs", newsletter: "Newsletter", contact: "Contact", about: "À propos" },
  } : {
    back: "← Blog", share: copied ? "Copied!" : "Copy",
    toc: "In this article", related: "Related articles", readTime: "min",
    sub: "Subscribe", subLoading: "...", subDone: "✓ See you Monday!",
    subError: "Error, try again.", placeholder: "your@email.com",
    nlTitle: "The AI Radar · every Monday",
    nlText: "The best tools, comparisons that matter. Free.",
    shareLabel: "Share",
    ourPick: "★ Our pick", affLink: "Affiliate link", tryFree: "Try for free",
    nav: { blog: "Blog", comparatifs: "Comparisons", newsletter: "Newsletter", contact: "Contact", about: "About" },
  };

  const headings = article?.content.match(/^## .+$/gm)?.map(h => h.replace("## ", "")) || [];
  const activeHeading = useActiveHeading(headings);

  const splitContent = (content: string) => {
    const rendered = renderMd(content);
    const h2matches = [...rendered.matchAll(/<h2/g)];
    if (h2matches.length < 2) return { first: rendered, second: "" };
    const cutIndex = h2matches[Math.floor(h2matches.length / 2)].index ?? rendered.length;
    return { first: rendered.slice(0, cutIndex), second: rendered.slice(cutIndex) };
  };
  const { first, second } = article ? splitContent(article.content) : { first: "", second: "" };

  const articleUrl = `https://neuriflux.com/${lang}/blog/${slug}`;

  const schema = article && articleData ? {
    "@context": "https://schema.org", "@type": "Article",
    headline: article.title, description: article.desc,
    image: `https://neuriflux.com/og/${slug}.png`,
    author: { "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com" },
    publisher: { "@type": "Organization", name: "Neuriflux", logo: { "@type": "ImageObject", url: "https://neuriflux.com/logo.png", width: 200, height: 60 } },
    datePublished: articleData.date.en, dateModified: articleData.date.en,
    url: articleUrl, inLanguage: lang,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    wordCount: article.content.split(/\s+/).length,
    articleSection: articleData.tag,
  } : null;

  const breadcrumb = article ? {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Neuriflux", item: `https://neuriflux.com/${lang}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `https://neuriflux.com/${lang}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ]
  } : null;

  const faqMatches = article?.content.match(/^### (.+)\n\n([\s\S]+?)(?=\n###|\n##|$)/gm) || [];
  const faqSchema = faqMatches.length > 0 ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqMatches.slice(0, 8).map(block => {
      const lines = block.trim().split("\n\n");
      const q = lines[0].replace(/^### /, "");
      const a = lines.slice(1).join(" ").replace(/\*\*/g, "").replace(/\*/g, "").trim();
      return { "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } };
    })
  } : null;

  return (
    <>
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      {breadcrumb && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />}
      {faqSchema && faqSchema.mainEntity.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <style>{`
        /* ─────────────────────────────────────────────────────────
           RESET & VARIABLES
        ───────────────────────────────────────────────────────── */
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          /* Fonds */
          --bg:#080c10;
          --bg2:#0d1117;
          --bg3:#111820;
          /* Bordures */
          --border:rgba(255,255,255,.065);
          --glow:rgba(0,230,190,.2);
          /* Couleur accent */
          --cyan:#00e6be;
          --cdim:rgba(0,230,190,.09);
          /* Texte */
          --text:#edf2f7;
          --muted:#5a6a7a;
          --dim:#2a3a4a;
          /* Fonts */
          --d:'Syne',sans-serif;
          --m:'JetBrains Mono',monospace;
          --body:Georgia,'Times New Roman',serif;
          /* Utilitaires */
          --r:10px;
          --pad:clamp(1.5rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}

        /* ─────────────────────────────────────────────────────────
           FOND : GRILLE
        ───────────────────────────────────────────────────────── */
        .bg-grid{position:fixed;inset:0;
          background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);
          background-size:72px 72px;pointer-events:none;z-index:0}

        /* ─────────────────────────────────────────────────────────
           NAVIGATION — identique sur toutes les pages
        ───────────────────────────────────────────────────────── */
        nav{
          position:sticky;top:0;z-index:100;
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          background:rgba(8,12,16,.93);
          border-bottom:1px solid var(--border);
          padding:0 var(--pad);height:60px;
          display:flex;align-items:center;justify-content:space-between;
          transition:box-shadow .2s
        }
        nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.4)}
        .logo{
          font-family:var(--d);font-weight:800;font-size:1.15rem;
          letter-spacing:-.03em;color:var(--text);text-decoration:none;
          display:flex;align-items:center;gap:.45rem
        }
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{
          width:6px;height:6px;background:var(--cyan);border-radius:50%;
          box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite
        }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
        @media(max-width:720px){
          .nav-links{display:none}
          .nav-links.open{
            display:flex;flex-direction:column;
            position:fixed;top:60px;left:0;right:0;
            background:var(--bg2);border-bottom:1px solid var(--border);
            padding:1.25rem var(--pad);gap:1rem;z-index:99
          }
        }
        .nav-links a{font-family:var(--m);font-size:.74rem;color:var(--muted);text-decoration:none;letter-spacing:.03em;transition:color .15s}
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}
        .lb{font-family:var(--m);font-size:.67rem;font-weight:500;padding:4px 9px;border-radius:4px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s}
        .lb.on{background:var(--cyan);color:#080c10}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}
        @media(max-width:720px){.hb{display:flex}}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}

        /* ─────────────────────────────────────────────────────────
           LAYOUT — grille main + sidebar
        ───────────────────────────────────────────────────────── */
        .layout{position:relative;z-index:1;max-width:1160px;margin:0 auto;
          padding:3.5rem var(--pad) 7rem;
          display:grid;grid-template-columns:1fr 272px;gap:5rem;align-items:start}
        @media(max-width:960px){.layout{grid-template-columns:1fr;gap:0}.sidebar{display:none!important}}

        /* ─────────────────────────────────────────────────────────
           HEADER ARTICLE
        ───────────────────────────────────────────────────────── */
        .back{display:inline-flex;align-items:center;gap:.35rem;font-family:var(--m);
          font-size:.7rem;color:var(--muted);text-decoration:none;
          margin-bottom:2.25rem;transition:color .15s;letter-spacing:.03em}
        .back:hover{color:var(--cyan)}
        .art-header{position:relative;margin-bottom:3rem;padding:2rem 2.25rem;
          background:var(--bg2);border:1px solid var(--border);border-radius:14px;overflow:hidden}
        .art-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,transparent,var(--art-color,var(--cyan)) 30%,var(--art-color,var(--cyan)) 70%,transparent)}
        .art-header-glow{position:absolute;top:-40%;right:-10%;width:400px;height:300px;
          background:radial-gradient(ellipse,var(--art-glow,rgba(0,230,190,.07)) 0%,transparent 65%);pointer-events:none}
        .meta{display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;margin-bottom:1.25rem;position:relative;z-index:1}
        .tag-badge{font-family:var(--m);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:3px 10px;border-radius:100px}
        .art-date,.art-time{font-family:var(--m);font-size:.68rem;color:var(--muted)}
        .meta-sep{color:var(--dim);font-size:.6rem}
        .art-title{font-size:clamp(1.7rem,4vw,2.6rem);font-weight:800;letter-spacing:-.035em;line-height:1.1;margin-bottom:1.1rem;color:var(--text);position:relative;z-index:1}
        .art-desc{font-family:var(--m);font-size:.82rem;color:var(--muted);font-weight:300;line-height:1.8;padding:1rem 1.25rem;background:var(--bg3);border-left:2px solid var(--art-color,var(--cyan));border-radius:0 7px 7px 0;margin-bottom:1.75rem;position:relative;z-index:1}
        .author{display:flex;align-items:center;gap:.75rem;position:relative;z-index:1}
        .avatar{width:34px;height:34px;background:var(--cdim);border:1px solid rgba(0,230,190,.22);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0}
        .author-name{font-family:var(--m);font-size:.75rem;color:var(--text);font-weight:500}
        .author-sub{font-family:var(--m);font-size:.62rem;color:var(--dim);font-weight:300;margin-top:.08rem}

        /* ─────────────────────────────────────────────────────────
           PROSE
        ───────────────────────────────────────────────────────── */
        .prose{font-family:var(--body);font-size:1.03rem;line-height:1.9;color:#c8d5e0}
        .prose h2{font-family:var(--d);font-size:1.4rem;font-weight:800;letter-spacing:-.025em;color:var(--text);margin:3rem 0 0;padding:.65rem 0 .65rem 1rem;border-left:3px solid var(--art-color,var(--cyan));border-bottom:1px solid var(--border);scroll-margin-top:80px}
        .prose h2 + *{margin-top:.9rem}
        .prose h3{font-family:var(--d);font-size:1.05rem;font-weight:700;color:var(--text);margin:2rem 0 0;scroll-margin-top:80px}
        .prose h3 + ul,.prose h3 + ol,.prose h3 + p{margin-top:.75rem}
        .prose p{margin-bottom:1.35rem}
        .prose p:not(.bold-title):first-of-type::first-letter{font-size:3.2rem;font-weight:800;font-family:var(--d);float:left;line-height:.8;margin:.05em .12em 0 0;color:var(--art-color,var(--cyan));letter-spacing:-.04em}
        .prose p.bold-title::first-letter{font-size:inherit;font-weight:inherit;float:none;line-height:inherit;margin:0;color:inherit;letter-spacing:inherit}
        .prose strong{color:var(--text);font-weight:600;font-family:var(--d)}
        .prose em{color:var(--muted);font-style:italic}
        .prose ul,.prose ol{padding-left:1.4rem;margin-top:.75rem;margin-bottom:1.3rem}
        .prose p + ul,.prose p + ol{margin-top:.65rem}
        .prose ul.emoji-list{list-style:none;padding-left:0;margin-top:.75rem;margin-bottom:1.3rem}
        .prose ul.emoji-list li{display:flex;align-items:baseline;gap:.55rem;padding:.3rem 0;margin-bottom:0;border-bottom:1px solid var(--border);font-family:var(--body);font-size:1.02rem;line-height:1.65;color:#c8d5e0}
        .prose ul.emoji-list li:last-child{border-bottom:none}
        .eli{font-size:.95rem;flex-shrink:0;margin-top:.05rem}
        .prose p.bold-title{font-family:var(--d);font-size:1rem;font-weight:700;color:var(--text);letter-spacing:-.01em;margin-top:2rem;margin-bottom:.65rem;padding-left:.85rem;border-left:2px solid var(--art-color,var(--cyan))}
        .prose li{margin-bottom:.5rem;color:#c8d5e0;padding-left:.25rem}
        .prose li::marker{color:var(--art-color,var(--cyan));font-weight:700}
        .prose code{font-family:var(--m);font-size:.79rem;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--cyan)}
        .prose pre{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:1.25rem 1.5rem;margin:1.75rem 0;overflow-x:auto}
        .prose pre code{background:none;border:none;padding:0;color:#a8c0d6;font-size:.79rem;line-height:1.78}
        .prose a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(0,230,190,.28);transition:border-color .15s}
        .prose a:hover{border-color:var(--cyan)}
        .prose blockquote{border-left:3px solid var(--art-color,var(--cyan));padding:.8rem 1.25rem;background:var(--bg2);border-radius:0 8px 8px 0;margin:1.75rem 0;font-style:italic;color:var(--muted);font-family:var(--body)}
        .prose table{width:100%;border-collapse:collapse;margin:1.75rem 0;font-family:var(--m);font-size:.75rem}
        .prose th{padding:10px 14px;border:1px solid var(--border);color:var(--text);font-weight:600;background:var(--bg3);text-align:left}
        .prose td{padding:10px 14px;border:1px solid var(--border);color:var(--muted)}
        .prose tr:hover td{background:var(--bg2)}

        /* ─────────────────────────────────────────────────────────
           MID CTA
        ───────────────────────────────────────────────────────── */
        .mid-cta{margin:2.75rem 0;padding:1.5rem 1.75rem;background:linear-gradient(135deg,rgba(0,230,190,.07),rgba(0,230,190,.02));border:1px solid rgba(0,230,190,.2);border-radius:12px;position:relative;overflow:hidden}
        .mid-cta-stripe{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .mid-cta-inner{display:flex;align-items:center;justify-content:space-between;gap:1.25rem;flex-wrap:wrap}
        .mid-cta-eyebrow{font-family:var(--m);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cyan);margin-bottom:.35rem}
        .mid-cta-tool{font-family:var(--d);font-size:.98rem;font-weight:700;color:var(--text);letter-spacing:-.02em}
        .mid-cta-label{font-family:var(--m);font-size:.68rem;color:var(--muted);font-weight:300;margin-top:.2rem}
        .mid-cta-btn{display:inline-flex;align-items:center;gap:.4rem;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.82rem;padding:10px 20px;border-radius:8px;text-decoration:none;transition:all .18s;white-space:nowrap;flex-shrink:0}
        .mid-cta-btn:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,230,190,.28)}
        .mid-cta-note{font-family:var(--m);font-size:.52rem;color:var(--dim);text-align:right;margin-top:.5rem}

        /* ─────────────────────────────────────────────────────────
           END CTA
        ───────────────────────────────────────────────────────── */
        .end-cta{margin:3.5rem 0 0;padding:2rem 2.25rem;background:var(--bg2);border:1px solid rgba(0,230,190,.2);border-radius:16px;position:relative;overflow:hidden}
        .end-cta-glow{position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:500px;height:280px;background:radial-gradient(ellipse,rgba(0,230,190,.055),transparent 70%);pointer-events:none}
        .end-cta-stripe{position:absolute;top:0;left:50%;transform:translateX(-50%);width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .end-cta-eyebrow{font-family:var(--m);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:.85rem;display:flex;align-items:center;gap:.45rem;position:relative;z-index:1}
        .end-cta-line{display:inline-block;width:16px;height:1px;background:var(--cyan)}
        .end-cta-body{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;position:relative;z-index:1}
        .end-cta-tool{font-family:var(--d);font-size:1.22rem;font-weight:800;letter-spacing:-.03em;color:var(--text);margin-bottom:.4rem}
        .end-cta-label{font-family:var(--m);font-size:.75rem;color:var(--muted);font-weight:300;line-height:1.65}
        .end-cta-actions{display:flex;flex-direction:column;gap:.4rem;align-items:flex-end}
        .end-cta-btn{display:inline-flex;align-items:center;gap:.5rem;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.9rem;padding:12px 24px;border-radius:10px;text-decoration:none;white-space:nowrap;box-shadow:0 4px 20px rgba(0,230,190,.2);transition:all .18s}
        .end-cta-btn:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,230,190,.32)}
        .end-cta-note{font-family:var(--m);font-size:.55rem;color:var(--dim)}

        /* ─────────────────────────────────────────────────────────
           SHARE
        ───────────────────────────────────────────────────────── */
        .share{display:flex;align-items:center;gap:.55rem;margin-top:3.5rem;padding:1.25rem 1.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);flex-wrap:wrap}
        .share-label{font-family:var(--m);font-size:.62rem;color:var(--dim);letter-spacing:.09em;text-transform:uppercase;margin-right:.25rem}
        .sbtn{font-family:var(--m);font-size:.7rem;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;text-decoration:none;display:inline-flex;align-items:center;gap:.35rem}
        .sbtn:hover{border-color:rgba(0,230,190,.28);color:var(--cyan);background:var(--cdim)}
        .sbtn.done{background:var(--cdim);border-color:rgba(0,230,190,.28);color:var(--cyan)}

        /* ─────────────────────────────────────────────────────────
           ARTICLES SIMILAIRES
        ───────────────────────────────────────────────────────── */
        .related{margin-top:4.5rem;padding-top:2.5rem;border-top:1px solid var(--border)}
        .sec-tag{font-family:var(--m);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.4rem}
        .sec-tag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}
        .rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
        .rcard{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);text-decoration:none;transition:all .18s;overflow:hidden;display:flex;flex-direction:column}
        .rcard:hover{border-color:rgba(0,230,190,.2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)}
        .rcard-stripe{height:2px;width:100%;flex-shrink:0}
        .rcard-body{padding:1.1rem}
        .rcard-tag{font-family:var(--m);font-size:.57rem;letter-spacing:.09em;text-transform:uppercase;font-weight:600;margin-bottom:.5rem}
        .rcard-title{font-size:.85rem;font-weight:700;letter-spacing:-.01em;line-height:1.32;color:var(--text);margin-bottom:.6rem}
        .rcard-time{font-family:var(--m);font-size:.62rem;color:var(--dim)}

        /* ─────────────────────────────────────────────────────────
           SIDEBAR
        ───────────────────────────────────────────────────────── */
        .sidebar{position:sticky;top:76px;display:flex;flex-direction:column;gap:.8rem}
        .sbox{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
        .sbox-header{padding:.85rem 1.1rem;border-bottom:1px solid var(--border)}
        .sbox-title{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
        .sbox-body{padding:.85rem 1.1rem}
        .toc-list{list-style:none;display:flex;flex-direction:column;gap:0}
        .toc-item a{font-family:var(--m);font-size:.68rem;color:var(--muted);text-decoration:none;font-weight:300;line-height:1.45;transition:all .18s;display:block;padding:5px 10px 5px 12px;border-left:2px solid transparent;border-bottom:1px solid transparent}
        .toc-item a:hover{color:var(--text);background:var(--bg3)}
        .toc-item.active a{color:var(--cyan);border-left-color:var(--cyan);background:var(--cdim);font-weight:500}
        .sbox-aff{background:linear-gradient(160deg,rgba(0,230,190,.06),rgba(0,230,190,.02));border-color:rgba(0,230,190,.18)!important;position:relative}
        .sbox-aff .sbox-header{border-bottom-color:rgba(0,230,190,.12)}
        .sbox-aff::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .aff-tool{font-family:var(--d);font-size:.92rem;font-weight:800;color:var(--text);letter-spacing:-.02em;margin-bottom:.3rem}
        .aff-label{font-family:var(--m);font-size:.67rem;color:var(--muted);font-weight:300;line-height:1.55;margin-bottom:.9rem}
        .aff-btn{display:flex;align-items:center;justify-content:center;gap:.4rem;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.78rem;padding:9px;border-radius:7px;text-decoration:none;transition:all .18s;letter-spacing:-.01em}
        .aff-btn:hover{opacity:.88;transform:translateY(-1px)}
        .aff-note{font-family:var(--m);font-size:.53rem;color:var(--dim);text-align:center;margin-top:.4rem}
        .nl-title-s{font-family:var(--d);font-size:.85rem;font-weight:700;color:var(--text);letter-spacing:-.02em;margin-bottom:.3rem}
        .nl-text{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.65;font-weight:300;margin-bottom:.85rem}
        .nl-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 11px;color:var(--text);font-family:var(--m);font-size:.74rem;outline:none;margin-bottom:.45rem;transition:border-color .18s}
        .nl-input:focus{border-color:rgba(0,230,190,.3)}
        .nl-input::placeholder{color:var(--dim)}
        .nl-btn{width:100%;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.76rem;padding:9px;border-radius:6px;border:none;cursor:pointer;transition:opacity .18s;letter-spacing:-.01em}
        .nl-btn:hover{opacity:.9}.nl-btn:disabled{opacity:.55;cursor:not-allowed}
        .nl-status{text-align:center;font-family:var(--m);font-size:.74rem;padding:6px 0}

        /* ─────────────────────────────────────────────────────────
           404 + FOOTER
        ───────────────────────────────────────────────────────── */
        .nf{text-align:center;padding:8rem 2rem;position:relative;z-index:1}
        .nf h1{font-size:3rem;font-weight:800;margin-bottom:1rem}
        .nf p{font-family:var(--m);color:var(--muted);margin-bottom:2rem;font-size:.86rem}
        .btn-p{display:inline-flex;align-items:center;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.86rem;padding:11px 22px;border-radius:8px;text-decoration:none;transition:all .2s}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,230,190,.28)}
        .art-footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:1.75rem var(--pad);max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
        .ft-links{display:flex;gap:1.25rem;list-style:none}
        .ft-links a{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none;transition:color .15s}
        .ft-links a:hover{color:var(--muted)}
      `}</style>

      <ProgressBar color={color} />
      <div className="bg-grid" />
      

      {/* ── NAVIGATION ── */}
      <nav>
        <a href={l("")} className="logo">
          <div className="logo-dot" />
          Neuri<em>flux</em>
        </a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")} className="active">{t.nav.blog}</a></li>
          <li><a href={l("/comparatifs")}>{t.nav.comparatifs}</a></li>
          <li><a href={l("/newsletter")}>{t.nav.newsletter}</a></li>
          <li><a href={l("/contact")}>{t.nav.contact}</a></li>
          <li><a href={l("/about")}>{t.nav.about}</a></li>
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

      {/* ── CONTENU ── */}
      {!article || !articleData ? (
        <div className="nf">
          <h1>404</h1>
          <p>{lang === "fr" ? "Cet article n'existe pas encore." : "This article doesn't exist yet."}</p>
          <a href={l("/blog")} className="btn-p">{L.back}</a>
        </div>
      ) : (
        <div className="layout" style={{ "--art-color": color, "--art-glow": `${color}18` } as React.CSSProperties}>
          <main>
            <a href={l("/blog")} className="back">{L.back}</a>
            <div className="art-header" style={{ "--art-color": color } as React.CSSProperties}>
              <div className="art-header-glow" />
              <div className="meta">
                <span className="tag-badge" style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}>{articleData.tag}</span>
                <span className="meta-sep">·</span>
                <span className="art-date">{articleData.date[lang]}</span>
                <span className="meta-sep">·</span>
                <span className="art-time">⏱ {articleData.timeMin} {L.readTime}</span>
              </div>
              <h1 className="art-title">{article.title}</h1>
              <p className="art-desc">{article.desc}</p>
              <div className="author">
                <div className="avatar">⚡</div>
                <div>
                  <div className="author-name">Neuriflux</div>
                  <div className="author-sub">{lang === "fr" ? "Rédaction indépendante" : "Independent editorial"}</div>
                </div>
              </div>
            </div>

            <div className="prose" style={{ "--art-color": color } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: first }} />

            {affiliate && second && (
              <MidCTA url={affiliate.url} toolName={affiliate.toolName} label={affiliate.label[lang]} lang={lang} />
            )}

            {second && (
              <div className="prose" style={{ "--art-color": color } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: second }} />
            )}

            {affiliate && (
              <EndCTA url={affiliate.url} toolName={affiliate.toolName} label={affiliate.label[lang]} lang={lang} />
            )}

            <div className="share">
              <span className="share-label">{L.shareLabel}</span>
              <button className={`sbtn${copied ? " done" : ""}`} onClick={copy}>🔗 {L.share}</button>
              <a className="sbtn" href={shareUrl ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}` : "#"} target="_blank" rel="noopener noreferrer">𝕏 Twitter</a>
              <a className="sbtn" href={shareUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` : "#"} target="_blank" rel="noopener noreferrer">in LinkedIn</a>
            </div>

            {article.related.length > 0 && (
              <div className="related">
                <div className="sec-tag">{L.related}</div>
                <div className="rgrid">
                  {article.related.map(r => {
                    const rc = getColor(r.tag);
                    return (
                      <a key={r.slug} href={l(`/blog/${r.slug}`)} className="rcard">
                        <div className="rcard-stripe" style={{ background: rc }} />
                        <div className="rcard-body">
                          <div className="rcard-tag" style={{ color: rc }}>{r.tag}</div>
                          <div className="rcard-title">{r.title}</div>
                          <div className="rcard-time">⏱ {r.timeMin} {L.readTime}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </main>

          <aside className="sidebar">
            {headings.length > 0 && (
              <div className="sbox">
                <div className="sbox-header"><div className="sbox-title">{L.toc}</div></div>
                <ul className="toc-list">
                  {headings.map((h, i) => (
                    <li key={i} className={`toc-item${activeHeading === i ? " active" : ""}`}>
                      <a href={`#${slugify(h)}`}>{h}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {affiliate && (
              <div className="sbox sbox-aff">
                <div className="sbox-header"><div className="sbox-title" style={{ color: "var(--cyan)" }}>{L.ourPick}</div></div>
                <div className="sbox-body">
                  <div className="aff-tool">{affiliate.toolName}</div>
                  <div className="aff-label">{affiliate.label[lang]}</div>
                  <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored" className="aff-btn">{L.tryFree} →</a>
                  <div className="aff-note">{L.affLink}</div>
                </div>
              </div>
            )}
            <div className="sbox">
              <div className="sbox-header"><div className="sbox-title">Newsletter</div></div>
              <div className="sbox-body">
                <div className="nl-title-s">{L.nlTitle}</div>
                <p className="nl-text">{L.nlText}</p>
                {nlStatus === "success" ? (
                  <div className="nl-status" style={{ color: "var(--cyan)" }}>{L.subDone}</div>
                ) : nlStatus === "error" ? (
                  <div className="nl-status" style={{ color: "#ef4444" }}>{L.subError}</div>
                ) : (
                  <form onSubmit={handleNlSubmit}>
                    <input className="nl-input" type="email" placeholder={L.placeholder}
                      value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                      required disabled={nlStatus === "loading"} />
                    <button className="nl-btn" type="submit" disabled={nlStatus === "loading"}>
                      {nlStatus === "loading" ? L.subLoading : L.sub}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      <footer className="art-footer">
        <span className="ft-copy">© 2026 <em>Neuriflux</em>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</span>
        <ul className="ft-links">
          <li><a href={l("/blog")}>Blog</a></li>
          <li><a href={l("/comparatifs")}>{lang === "fr" ? "Comparatifs" : "Comparisons"}</a></li>
          <li><a href={l("/newsletter")}>Newsletter</a></li>
          <li><a href={l("/legal")}>{lang === "fr" ? "Mentions légales" : "Legal"}</a></li>
        </ul>
        <span className="ft-copy">{lang === "fr" ? "Fait avec" : "Made with"} <em>♥</em> {lang === "fr" ? "en France" : "in France"}</span>
      </footer>
    </>
  );
}