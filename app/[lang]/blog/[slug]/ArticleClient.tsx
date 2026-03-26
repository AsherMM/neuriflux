"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getArticleBySlug } from "../../lib/articles";
import { useNewsletter } from "@/lib/useNewsletter";

type Lang = "fr" | "en";

const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", "Rédaction": "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", "Productivité": "#10b981",
  Productivity: "#10b981", Audio: "#ef4444",
};
function getColor(tag: string) { return TAG_COLORS[tag] || "#00e6be"; }

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMd(md: string): string {
  let html = md.trim();
  html = html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_, header, body) => {
    const ths = header.split("|").filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map((row: string) =>
      "<tr>" + row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join("") + "</tr>"
    ).join("");
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/(^- .+\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map(l => `<li>${l.replace(/^- /, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });
  html = html.split(/\n\n+/).map(block => {
    block = block.trim();
    if (!block) return "";
    if (/^<(h[123]|ul|ol|table|pre|blockquote)/.test(block)) return block;
    return `<p>${block.replace(/\n/g, " ")}</p>`;
  }).join("\n");
  return html;
}

// ─── Reading progress bar ─────────────────────────────────────────────────────
function ProgressBar() {
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
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: "rgba(0,0,0,0.2)" }}>
      <div style={{ height: "100%", width: `${p}%`, background: "var(--cyan)", transition: "width 0.08s linear", boxShadow: "0 0 10px var(--cyan)" }} />
    </div>
  );
}

// ─── CTA Milieu d'article ─────────────────────────────────────────────────────
function MidCTA({ url, toolName, label, lang }: { url: string; toolName: string; label: string; lang: Lang }) {
  return (
    <div style={{ margin: "2.5rem 0", padding: "1.5rem 1.75rem", background: "linear-gradient(135deg,rgba(0,230,190,0.06),rgba(0,230,190,0.02))", border: "1px solid var(--border-glow)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.25rem", flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--cyan),transparent)" }} />
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--cyan)", marginBottom: "0.4rem" }}>
          {lang === "fr" ? "✦ Recommandé par Neuriflux" : "✦ Recommended by Neuriflux"}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{toolName}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem", fontWeight: 300 }}>{label}</div>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer sponsored" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--cyan)", color: "var(--bg)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", padding: "10px 20px", borderRadius: 8, textDecoration: "none", transition: "all 0.2s", whiteSpace: "nowrap" as const }}>
        {lang === "fr" ? "Essayer gratuitement" : "Try for free"} →
      </a>
      <div style={{ position: "absolute", bottom: 6, right: 12, fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-dim)" }}>
        {lang === "fr" ? "Lien affilié" : "Affiliate link"}
      </div>
    </div>
  );
}

// ─── CTA Fin d'article ────────────────────────────────────────────────────────
function EndCTA({ url, toolName, label, lang }: { url: string; toolName: string; label: string; lang: Lang }) {
  return (
    <div style={{ margin: "3rem 0 0", padding: "2rem", background: "var(--bg2)", border: "1px solid var(--border-glow)", borderRadius: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg,transparent,var(--cyan),transparent)" }} />
      <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: 400, height: 200, background: "radial-gradient(ellipse,rgba(0,230,190,0.06),transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--cyan)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ display: "inline-block", width: 20, height: 1, background: "var(--cyan)" }} />
        {lang === "fr" ? "Notre recommandation" : "Our recommendation"}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "0.5rem" }}>{toolName}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.6 }}>{label}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.5rem", alignItems: "flex-end" }}>
          <a href={url} target="_blank" rel="noopener noreferrer sponsored" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--cyan)", color: "var(--bg)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", padding: "12px 24px", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap" as const, boxShadow: "0 4px 20px rgba(0,230,190,0.25)" }}>
            {lang === "fr" ? "Essayer" : "Try"} {toolName} →
          </a>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-dim)" }}>
            {lang === "fr" ? "Lien affilié — sans coût supplémentaire pour vous" : "Affiliate link — no extra cost to you"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ArticleClient({ lang, slug }: { lang: Lang; slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nlEmail, setNlEmail] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => { setShareUrl(window.location.href); }, []);

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
  const color = articleData ? getColor(articleData.tag) : "var(--cyan)";
  const affiliate = articleData?.affiliate;

  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const L = {
    fr: {
      back: "← Retour au blog", share: copied ? "Copié !" : "Copier le lien",
      toc: "Sommaire", related: "Articles similaires", readTime: "min de lecture",
      sub: "S'abonner", subLoading: "...", subDone: "✓ À lundi !",
      subError: "Erreur, réessayez.", placeholder: "votre@email.com",
      nlText: "Le radar IA chaque lundi. Gratuit. Sans spam.", contact: "Contact",
    },
    en: {
      back: "← Back to blog", share: copied ? "Copied!" : "Copy link",
      toc: "Contents", related: "Related articles", readTime: "min read",
      sub: "Subscribe", subLoading: "...", subDone: "✓ See you Monday!",
      subError: "Error, try again.", placeholder: "your@email.com",
      nlText: "The AI radar every Monday. Free. No spam.", contact: "Contact",
    },
  }[lang];

  const headings = article?.content.match(/^## .+$/gm)?.map(h => h.replace("## ", "")) || [];

  const splitContent = (content: string) => {
    const rendered = renderMd(content);
    const h2matches = [...rendered.matchAll(/<h2>/g)];
    if (h2matches.length < 2) return { first: rendered, second: "" };
    const cutIndex = h2matches[1].index ?? rendered.length / 2;
    return { first: rendered.slice(0, cutIndex), second: rendered.slice(cutIndex) };
  };
  const { first, second } = article ? splitContent(article.content) : { first: "", second: "" };

  const articleSchema = article && articleData ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.desc,
    author: { "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com" },
    publisher: { "@type": "Organization", name: "Neuriflux", logo: { "@type": "ImageObject", url: "https://neuriflux.com/logo.png" } },
    datePublished: articleData.date.en,
    url: `https://neuriflux.com/${lang}/blog/${slug}`,
    inLanguage: lang,
  } : null;

  return (
    <>
      {articleSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      )}

      <style>{`
        /* ─── Pas de @import ici — fonts chargées en non-blocking via page.tsx ─ */
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,0.07);--border-glow:rgba(0,230,190,0.25);
          --cyan:#00e6be;--cyan-dim:rgba(0,230,190,0.12);
          --text:#f0f4f8;--text-muted:#6b7a8d;--text-dim:#3d4f61;
          --font-display:'Syne',sans-serif;
          --font-mono:'JetBrains Mono',monospace;
          /* ─── Lora remplacée par une font-stack serif système ─────────────
             Georgia → Times New Roman → serif générique
             Zéro requête réseau supplémentaire, rendu immédiat             */
          --font-body:Georgia,'Times New Roman',serif;
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--font-display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,0.02) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
        nav{position:sticky;top:3px;z-index:100;backdrop-filter:blur(20px);background:rgba(8,12,16,0.85);border-bottom:1px solid var(--border);padding:0 clamp(1.5rem,5vw,4rem);height:64px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:-0.02em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.5rem}.logo span{color:var(--cyan)}
        .dot{width:7px;height:7px;background:var(--cyan);border-radius:50%;box-shadow:0 0 10px var(--cyan);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none}
        @media(max-width:768px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:67px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.5rem 2rem;gap:1.2rem}}
        .nav-links a{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);text-decoration:none;transition:color .2s}.nav-links a:hover{color:var(--cyan)}
        .lang-toggle{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px;display:flex;gap:2px}
        .lb{font-family:var(--font-mono);font-size:.7rem;padding:4px 10px;border-radius:4px;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--text-muted)}.lb.active{background:var(--cyan);color:var(--bg);font-weight:600}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}@media(max-width:768px){.hb{display:flex}}.hb span{display:block;width:20px;height:2px;background:var(--text-muted);border-radius:2px}
        .layout{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:3rem clamp(1.5rem,5vw,4rem) 5rem;display:grid;grid-template-columns:1fr 260px;gap:4rem;align-items:start}
        @media(max-width:900px){.layout{grid-template-columns:1fr}.sidebar{display:none}}
        .back{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);text-decoration:none;margin-bottom:1.5rem;transition:color .2s}.back:hover{color:var(--cyan)}
        .meta{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin-bottom:1.25rem}
        .tag-badge{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;font-weight:500;padding:4px 12px;border-radius:100px}
        .art-date,.art-time{font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted)}
        .art-title{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:1rem}
        .art-desc{font-family:var(--font-mono);font-size:.9rem;color:var(--text-muted);font-weight:300;line-height:1.7;padding:1.25rem 1.5rem;background:var(--bg2);border-left:3px solid var(--cyan);border-radius:0 8px 8px 0;margin-bottom:1.5rem}
        .author{display:flex;align-items:center;gap:.75rem;padding:1rem 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:2.5rem}
        .avatar{width:36px;height:36px;background:var(--cyan-dim);border:1px solid var(--border-glow);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
        .author-name{font-family:var(--font-mono);font-size:.78rem;color:var(--text);font-weight:500}.author-sub{font-family:var(--font-mono);font-size:.68rem;color:var(--text-dim);font-weight:300}
        /* ─── Prose : Georgia au lieu de Lora — même rendu, 0 requête réseau ── */
        .prose{font-family:var(--font-body);font-size:1.02rem;line-height:1.85;color:#d4dde8}
        .prose h2{font-family:var(--font-display);font-size:1.5rem;font-weight:800;letter-spacing:-.02em;color:var(--text);margin:2.5rem 0 1rem;padding-bottom:.5rem;border-bottom:1px solid var(--border)}
        .prose h3{font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:var(--text);margin:2rem 0 .75rem}
        .prose strong{color:var(--text);font-weight:600}.prose em{color:var(--text-muted);font-style:italic}
        .prose code{font-family:var(--font-mono);font-size:.82rem;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 7px;color:var(--cyan)}
        .prose pre{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:1.25rem;margin:1.5rem 0;overflow-x:auto}
        .prose pre code{background:none;border:none;padding:0;color:#a8c0d6;font-size:.82rem;line-height:1.7}
        .prose a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(0,230,190,.3);transition:border-color .2s}.prose a:hover{border-color:var(--cyan)}
        .prose p{margin-bottom:1.25rem}.prose ul{padding-left:1.5rem;margin-bottom:1.25rem}.prose li{margin-bottom:.4rem;color:#d4dde8}
        .prose table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-family:var(--font-mono);font-size:.78rem}
        .prose th{padding:10px 14px;border:1px solid var(--border);color:var(--text);font-weight:600;background:var(--bg3);text-align:left}
        .prose td{padding:10px 14px;border:1px solid var(--border);color:var(--text-muted)}.prose tr:hover td{background:var(--bg2)}
        .share{display:flex;align-items:center;gap:.75rem;margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);flex-wrap:wrap}
        .share-label{font-family:var(--font-mono);font-size:.72rem;color:var(--text-dim);letter-spacing:.06em;text-transform:uppercase}
        .sbtn{font-family:var(--font-mono);font-size:.75rem;padding:7px 14px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);cursor:pointer;transition:all .2s;text-decoration:none;display:inline-flex;align-items:center;gap:.4rem}
        .sbtn:hover{border-color:var(--border-glow);color:var(--cyan)}.sbtn.done{background:var(--cyan-dim);border-color:var(--border-glow);color:var(--cyan)}
        .related{margin-top:4rem;padding-top:2rem;border-top:1px solid var(--border)}
        .stag{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.5rem}
        .stag::before{content:'';display:inline-block;width:20px;height:1px;background:var(--cyan)}
        .rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
        .rcard{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:1.25rem;text-decoration:none;transition:all .2s;display:block}.rcard:hover{border-color:var(--border-glow);transform:translateY(-2px)}
        .rcard-tag{font-family:var(--font-mono);font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:var(--cyan);margin-bottom:.5rem}
        .rcard-title{font-size:.9rem;font-weight:700;letter-spacing:-.01em;line-height:1.3;color:var(--text);margin-bottom:.5rem}
        .rcard-time{font-family:var(--font-mono);font-size:.68rem;color:var(--text-dim)}
        .sidebar{position:sticky;top:80px}
        .sbox{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:1.25rem;margin-bottom:1rem}
        .sbox-title{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:1rem}
        .toc-list{list-style:none;display:flex;flex-direction:column;gap:.5rem}
        .toc-item a{font-family:var(--font-mono);font-size:.73rem;color:var(--text-muted);text-decoration:none;font-weight:300;line-height:1.4;transition:all .2s;display:block;padding:2px 0 2px 8px;border-left:2px solid transparent}
        .toc-item a:hover{color:var(--cyan);border-left-color:var(--cyan)}
        .nl-text{font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);line-height:1.6;font-weight:300;margin-bottom:1rem;text-align:center}
        .nl-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:9px 12px;color:var(--text);font-family:var(--font-mono);font-size:.78rem;outline:none;margin-bottom:.5rem;transition:border-color .2s}.nl-input:focus{border-color:var(--border-glow)}
        .nl-btn{width:100%;background:var(--cyan);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:.82rem;padding:10px;border-radius:6px;border:none;cursor:pointer;transition:opacity .2s}.nl-btn:hover{opacity:.9}.nl-btn:disabled{opacity:.6;cursor:not-allowed}
        .nl-status{text-align:center;font-family:var(--font-mono);font-size:.78rem;padding:8px 0}
        .nf{text-align:center;padding:8rem 2rem;position:relative;z-index:1}
        .nf h1{font-size:3rem;font-weight:800;margin-bottom:1rem}
        .nf p{font-family:var(--font-mono);color:var(--text-muted);margin-bottom:2rem;font-size:.9rem}
        .btn-p{display:inline-flex;align-items:center;background:var(--cyan);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:.9rem;padding:12px 24px;border-radius:8px;text-decoration:none;transition:all .2s}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,230,190,.35)}
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2rem clamp(1.5rem,5vw,4rem);max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
        .cp{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim)}.cp span{color:var(--cyan)}
        .sbox-affiliate{background:linear-gradient(135deg,rgba(0,230,190,0.07),rgba(0,230,190,0.02));border:1px solid var(--border-glow) !important;position:relative;overflow:hidden}
        .sbox-affiliate::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .aff-tool{font-family:var(--font-display);font-size:1rem;font-weight:800;color:var(--text);letter-spacing:-.02em;margin-bottom:.35rem}
        .aff-label{font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted);font-weight:300;line-height:1.5;margin-bottom:1rem}
        .aff-btn{display:flex;align-items:center;justify-content:center;gap:.4rem;width:100%;background:var(--cyan);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:.82rem;padding:11px;border-radius:8px;text-decoration:none;transition:all .2s;letter-spacing:-.01em}
        .aff-btn:hover{opacity:.9;transform:translateY(-1px)}.aff-note{font-family:var(--font-mono);font-size:.58rem;color:var(--text-dim);text-align:center;margin-top:.5rem}
      `}</style>

      <ProgressBar />
      <div className="grid-bg" />

      <nav>
        <a href={l("")} className="logo"><div className="dot" />Neuri<span>flux</span></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>{lang === "fr" ? "Blog" : "Blog"}</a></li>
          <li><a href={l("/comparatifs")}>{lang === "fr" ? "Comparatifs" : "Comparisons"}</a></li>
          <li><a href={l("/newsletter")}>Newsletter</a></li>
          <li><a href={l("/contact")}>{L.contact}</a></li>
          <li><a href={l("/about")}>{lang === "fr" ? "À propos" : "About"}</a></li>
        </ul>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div className="lang-toggle">
            <button className={`lb${lang === "fr" ? " active" : ""}`} onClick={() => switchLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " active" : ""}`} onClick={() => switchLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
        </div>
      </nav>

      {!article || !articleData ? (
        <div className="nf">
          <h1>404</h1>
          <p>{lang === "fr" ? "Cet article n'existe pas encore." : "This article doesn't exist yet."}</p>
          <a href={l("/blog")} className="btn-p">{L.back}</a>
        </div>
      ) : (
        <div className="layout">
          <main>
            <a href={l("/blog")} className="back">{L.back}</a>
            <div className="meta">
              <span className="tag-badge" style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>{articleData.tag}</span>
              <span className="art-date">{articleData.date[lang]}</span>
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

            <div className="prose" dangerouslySetInnerHTML={{ __html: first }} />

            {affiliate && second && (
              <MidCTA url={affiliate.url} toolName={affiliate.toolName} label={affiliate.label[lang]} lang={lang} />
            )}

            {second && <div className="prose" dangerouslySetInnerHTML={{ __html: second }} />}

            {affiliate && (
              <EndCTA url={affiliate.url} toolName={affiliate.toolName} label={affiliate.label[lang]} lang={lang} />
            )}

            <div className="share">
              <span className="share-label">{lang === "fr" ? "Partager" : "Share"}</span>
              <button className={`sbtn${copied ? " done" : ""}`} onClick={copy}>🔗 {L.share}</button>
              <a className="sbtn" href={shareUrl ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}` : "#"} target="_blank" rel="noopener noreferrer">𝕏 Twitter</a>
              <a className="sbtn" href={shareUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` : "#"} target="_blank" rel="noopener noreferrer">in LinkedIn</a>
            </div>

            {article.related.length > 0 && (
              <div className="related">
                <div className="stag">{L.related}</div>
                <div className="rgrid">
                  {article.related.map(r => (
                    <a key={r.slug} href={l(`/blog/${r.slug}`)} className="rcard">
                      <div className="rcard-tag">{r.tag}</div>
                      <div className="rcard-title">{r.title}</div>
                      <div className="rcard-time">⏱ {r.timeMin} {L.readTime}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="sidebar">
            {headings.length > 0 && (
              <div className="sbox">
                <div className="sbox-title">{L.toc}</div>
                <ul className="toc-list">
                  {headings.map((h, i) => (
                    <li key={i} className="toc-item">
                      <a href={`#${h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>{h}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {affiliate && (
              <div className="sbox sbox-affiliate">
                <div className="sbox-title" style={{ color: "var(--cyan)" }}>
                  {lang === "fr" ? "★ Notre choix" : "★ Our pick"}
                </div>
                <div className="aff-tool">{affiliate.toolName}</div>
                <div className="aff-label">{affiliate.label[lang]}</div>
                <a href={affiliate.url} target="_blank" rel="noopener noreferrer sponsored" className="aff-btn">
                  {lang === "fr" ? "Essayer gratuitement" : "Try for free"} →
                </a>
                <div className="aff-note">{lang === "fr" ? "Lien affilié" : "Affiliate link"}</div>
              </div>
            )}

            <div className="sbox">
              <div className="sbox-title">Newsletter</div>
              <p className="nl-text">{L.nlText}</p>
              {nlStatus === "success" ? (
                <div className="nl-status" style={{ color: "var(--cyan)" }}>{L.subDone}</div>
              ) : nlStatus === "error" ? (
                <div className="nl-status" style={{ color: "#ef4444" }}>{L.subError}</div>
              ) : (
                <form onSubmit={handleNlSubmit}>
                  <input className="nl-input" type="email" placeholder={L.placeholder} value={nlEmail}
                    onChange={e => setNlEmail(e.target.value)} required disabled={nlStatus === "loading"} />
                  <button className="nl-btn" type="submit" disabled={nlStatus === "loading"}>
                    {nlStatus === "loading" ? L.subLoading : L.sub}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      )}

      <footer>
        <p className="cp">© 2026 <span>Neuriflux</span>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
        <p className="cp">{lang === "fr" ? "Fait avec" : "Made with"} <span>♥</span> {lang === "fr" ? "en France" : "in France"}</p>
      </footer>
    </>
  );
}