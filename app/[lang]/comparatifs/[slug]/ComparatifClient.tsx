"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getComparatifBySlug, type ToolScore } from "../../lib/comparatifs";
import { useNewsletter } from "@/lib/useNewsletter";

type Lang = "fr" | "en";

const TAG_COLORS: Record<string, string> = {
  Chatbots: "#00e6be", Code: "#3b82f6", Rédaction: "#f59e0b",
  Writing: "#f59e0b", Image: "#a855f7", Productivité: "#10b981",
  Productivity: "#10b981", Audio: "#ef4444", Video: "#a855f7", Vidéo: "#a855f7",
};

// ─── Slugify ──────────────────────────────────────────────────────────────────
const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

// ─── Score bar animée ─────────────────────────────────────────────────────────
function ScoreBar({ value, color }: { value: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value * 10), 350);
    return () => clearTimeout(t);
  }, [value]);
  const sc = value >= 9 ? "#00e6be" : value >= 7.5 ? "#3b82f6" : value >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
      <div style={{ flex: 1, height: 5, background: "var(--bg3)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${w}%`, background: color, borderRadius: 3,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 8px ${color}45`,
        }} />
      </div>
      <span style={{ fontFamily: "var(--m)", fontSize: "0.72rem", fontWeight: 700, color: sc, minWidth: 26, textAlign: "right" as const }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Radar chart SVG ──────────────────────────────────────────────────────────
function RadarChart({ tools, criteria }: { tools: ToolScore[]; criteria: string[] }) {
  const N = criteria.length;
  const R = 95, cx = 130, cy = 130;
  const angles = criteria.map((_, i) => (i / N) * 2 * Math.PI - Math.PI / 2);
  const pt = (r: number, a: number) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  const poly = (tool: ToolScore) =>
    tool.scores.map((s, i) => { const p = pt((s.value / 10) * R, angles[i]); return `${p.x},${p.y}`; }).join(" ");
  return (
    <svg viewBox="0 0 260 260" style={{ width: "100%", maxWidth: 280 }}>
      {[0.25, 0.5, 0.75, 1].map(lv => (
        <polygon key={lv}
          points={angles.map(a => { const p = pt(lv * R, a); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth={1} />
      ))}
      {angles.map((a, i) => { const p = pt(R, a); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.055)" strokeWidth={1} />; })}
      {tools.map(tool => (
        <polygon key={tool.name} points={poly(tool)}
          fill={`${tool.color}15`} stroke={tool.color} strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {criteria.map((label, i) => {
        const p = pt(R + 20, angles[i]);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.35)" fontSize={7} fontFamily="JetBrains Mono,monospace">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Tool card ────────────────────────────────────────────────────────────────
function ToolCard({ tool, lang, isWinner, proLabel, conLabel }: {
  tool: ToolScore; lang: Lang; isWinner: boolean; proLabel: string; conLabel: string;
}) {
  return (
    <div style={{
      background: "var(--bg2)",
      border: `1px solid ${isWinner ? tool.color + "40" : "var(--border)"}`,
      borderRadius: 16, padding: "1.75rem",
      display: "flex", flexDirection: "column" as const, gap: "1.25rem",
      position: "relative" as const, overflow: "hidden", flex: 1, minWidth: 260,
      transition: "box-shadow .2s",
    }}>
      {isWinner && <>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: tool.color, boxShadow: `0 0 24px ${tool.color}` }} />
        <div style={{ position: "absolute", top: "-25%", right: "-8%", width: 280, height: 200, background: `radial-gradient(ellipse,${tool.color}09,transparent 68%)`, pointerEvents: "none" }} />
      </>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 46, height: 46, background: `${tool.color}18`, border: `2px solid ${tool.color}38`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", flexShrink: 0 }}>
            {tool.logo}
          </div>
          <div>
            <div style={{ fontFamily: "var(--d)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--text)" }}>{tool.name}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: "0.68rem", color: "var(--dim)", fontWeight: 300, marginTop: "0.1rem" }}>{tool.price}</div>
          </div>
        </div>
        <div style={{ textAlign: "center" as const }}>
          <div style={{ fontFamily: "var(--d)", fontSize: "2.1rem", fontWeight: 800, color: tool.color, lineHeight: 1, letterSpacing: "-0.04em" }}>{tool.globalScore.toFixed(1)}</div>
          <div style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: "var(--dim)", letterSpacing: "0.06em" }}>/10</div>
        </div>
      </div>

      {tool.badge && (
        <div style={{ fontFamily: "var(--m)", fontSize: "0.67rem", color: tool.color, background: `${tool.color}12`, border: `1px solid ${tool.color}28`, borderRadius: 6, padding: "4px 10px", display: "inline-block", alignSelf: "flex-start" as const }}>
          {tool.badge[lang]}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.65rem" }}>
        {tool.scores.map((s, i) => (
          <div key={i}>
            <span style={{ fontFamily: "var(--m)", fontSize: "0.67rem", color: "var(--muted)", fontWeight: 300, display: "block", marginBottom: "0.2rem" }}>{s[lang]}</span>
            <ScoreBar value={s.value} color={tool.color} />
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#10b981", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span>✓</span> {proLabel}
        </div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "0.32rem" }}>
          {tool.pros[lang].map((p, i) => (
            <li key={i} style={{ fontFamily: "var(--m)", fontSize: "0.73rem", color: "var(--muted)", fontWeight: 300, display: "flex", gap: "0.5rem", lineHeight: 1.5 }}>
              <span style={{ color: "#10b981", flexShrink: 0, marginTop: "0.05rem" }}>+</span>{p}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#ef4444", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span>✗</span> {conLabel}
        </div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "0.32rem" }}>
          {tool.cons[lang].map((c, i) => (
            <li key={i} style={{ fontFamily: "var(--m)", fontSize: "0.73rem", color: "var(--muted)", fontWeight: 300, display: "flex", gap: "0.5rem", lineHeight: 1.5 }}>
              <span style={{ color: "#ef4444", flexShrink: 0, marginTop: "0.05rem" }}>−</span>{c}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.8rem 1rem", fontFamily: "var(--m)", fontSize: "0.73rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300, fontStyle: "italic" }}>
        "{tool.verdict[lang]}"
      </div>

      {/* ─── ToolCard CTA — haute conversion ─── */}
      {tool.affiliate && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.4rem", marginTop: "auto" }}>
          {/* Badges de confiance pour le gagnant uniquement */}
          {isWinner && (
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.35rem", marginBottom: "0.25rem" }}>
              <span style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: tool.color, background: `${tool.color}10`, border: `1px solid ${tool.color}22`, borderRadius: 4, padding: "2px 7px" }}>
                ✓ {lang === "fr" ? "Version gratuite" : "Free plan"}
              </span>
              <span style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: tool.color, background: `${tool.color}10`, border: `1px solid ${tool.color}22`, borderRadius: 4, padding: "2px 7px" }}>
                ✓ {lang === "fr" ? "Sans carte" : "No card needed"}
              </span>
            </div>
          )}
          <a href={tool.affiliate} target="_blank" rel="noopener noreferrer sponsored" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
            background: isWinner ? tool.color : "transparent",
            color: isWinner ? "#080c10" : tool.color,
            border: `1px solid ${tool.color}`,
            borderRadius: 9, padding: isWinner ? "12px 16px" : "10px 16px",
            fontFamily: "var(--d)", fontWeight: 800, fontSize: isWinner ? "0.88rem" : "0.82rem",
            textDecoration: "none", transition: "all 0.2s", letterSpacing: "-0.01em",
            boxShadow: isWinner ? `0 4px 18px ${tool.color}35` : "none",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = isWinner ? `0 8px 28px ${tool.color}50` : "none"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "none"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = isWinner ? `0 4px 18px ${tool.color}35` : "none"; }}
          >
            {isWinner ? "🏆 " : ""}{lang === "fr" ? "Essayer" : "Try"} {tool.name} →
          </a>
          {isWinner && (
            <div style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: "var(--muted)", textAlign: "center" as const }}>
              {lang === "fr" ? "Accès immédiat · Sans engagement" : "Instant access · No commitment"}
            </div>
          )}
          <div style={{ fontFamily: "var(--m)", fontSize: "0.52rem", color: "var(--dim)", textAlign: "center" as const }}>
            {lang === "fr" ? "Lien affilié" : "Affiliate link"}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Winner CTA bloc — haute conversion ──────────────────────────────────────
function WinnerCTA({ winner, lang }: { winner: ToolScore; lang: Lang }) {
  if (!winner.affiliate) return null;
  return (
    <div style={{
      margin: "2.5rem 0", padding: "2.25rem 2.5rem",
      background: `linear-gradient(135deg,${winner.color}0a,${winner.color}02)`,
      border: `1px solid ${winner.color}35`,
      borderRadius: 18, position: "relative" as const, overflow: "hidden",
    }}>
      {/* Décorations */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${winner.color} 40%,${winner.color} 60%,transparent)` }} />
      <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: 500, height: 240, background: `radial-gradient(ellipse,${winner.color}07,transparent 68%)`, pointerEvents: "none" as const }} />

      {/* Eyebrow */}
      <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: winner.color, marginBottom: "1.1rem", display: "flex", alignItems: "center", gap: "0.4rem", position: "relative" as const, zIndex: 1 }}>
        <span style={{ display: "inline-block", width: 14, height: 1, background: winner.color }} />
        {lang === "fr" ? "🏆 Notre recommandation" : "🏆 Our recommendation"}
        <span style={{ marginLeft: "0.35rem", color: "#f59e0b", fontSize: "0.78rem", letterSpacing: "1px" }}>★★★★★</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" as const, position: "relative" as const, zIndex: 1 }}>
        {/* Infos outil */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 220 }}>
          <div style={{ width: 56, height: 56, background: `${winner.color}18`, border: `2px solid ${winner.color}35`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>
            {winner.logo}
          </div>
          <div>
            <div style={{ fontFamily: "var(--d)", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "0.2rem" }}>
              {winner.name}
              <span style={{ fontFamily: "var(--m)", fontSize: "0.95rem", fontWeight: 800, color: winner.color, marginLeft: "0.55rem" }}>{winner.globalScore.toFixed(1)}/10</span>
            </div>
            <div style={{ fontFamily: "var(--m)", fontSize: "0.73rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.6, marginBottom: "0.65rem" }}>{winner.verdict[lang]}</div>
            {/* Trust signals */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.4rem" }}>
              {[
                lang === "fr" ? "✓ Testé 3+ semaines" : "✓ Tested 3+ weeks",
                lang === "fr" ? "✓ Version gratuite" : "✓ Free plan",
                lang === "fr" ? "✓ Sans carte bancaire" : "✓ No credit card",
              ].map((badge, i) => (
                <span key={i} style={{ fontFamily: "var(--m)", fontSize: "0.6rem", color: winner.color, background: `${winner.color}10`, border: `1px solid ${winner.color}22`, borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.45rem", alignItems: "center", flexShrink: 0 }}>
          <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: winner.color, color: "#080c10",
            fontFamily: "var(--d)", fontWeight: 800, fontSize: "1rem",
            padding: "14px 28px", borderRadius: 11, textDecoration: "none",
            whiteSpace: "nowrap" as const,
            boxShadow: `0 6px 24px ${winner.color}32`,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 10px 36px ${winner.color}48`; (e.currentTarget as HTMLAnchorElement).style.background = "#00ffce"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "none"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 24px ${winner.color}32`; (e.currentTarget as HTMLAnchorElement).style.background = winner.color; }}
          >
            {lang === "fr" ? "Commencer gratuitement" : "Start for free"} →
          </a>
          <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", color: "var(--muted)", textAlign: "center" as const }}>
            {lang === "fr" ? "Accès immédiat · Sans engagement" : "Instant access · No commitment"}
          </div>
          <span style={{ fontFamily: "var(--m)", fontSize: "0.54rem", color: "var(--dim)" }}>
            {lang === "fr" ? "Lien affilié — aucun coût supplémentaire" : "Affiliate link — no extra cost to you"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMd(md: string, tagColor = "#00e6be"): string {
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

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ color }: { color: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setP(el.scrollHeight - el.clientHeight > 0 ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 300, background: "rgba(0,0,0,.45)" }}>
      <div style={{ height: "100%", width: `${p}%`, background: color, transition: "width 0.08s linear", boxShadow: `0 0 10px ${color}80` }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ComparatifClient({ lang, slug }: { lang: Lang; slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "analysis">("overview");
  const [nlEmail, setNlEmail] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setShareUrl(window.location.href); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const { status: nlStatus, subscribe } = useNewsletter("comparatif-sidebar");
  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(nlEmail, lang);
  };

  const l = (path: string) => `/${lang}${path}`;
  const switchLang = (next: Lang) => {
    if (next === lang) return;
    router.push(pathname.replace(/^\/(fr|en)/, `/${next}`));
  };
  const copy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const data = getComparatifBySlug(slug);
  const comp = data ? data[lang] : null;

  const L = lang === "fr" ? {
    back: "← Comparatifs", share: copied ? "Copié !" : "Copier",
    winner: "🏆 Gagnant", pros: "Points forts", cons: "Points faibles",
    overview: "Vue d'ensemble", details: "Détails", analysis: "Analyse",
    verdict: "Notre verdict", nlText: "Le radar IA chaque lundi. Gratuit.",
    nlTitle: "Le radar IA · chaque lundi",
    sub: "Je m'abonne", subLoading: "...", subDone: "✓ À lundi !", subError: "Erreur, réessayez.",
    placeholder: "votre@email.com",
    radar: "Radar des scores", compare: "Comparatif côte à côte", methodology: "Méthodologie & analyse",
    scores: "Scores", pricing: "Tarifs", criteria: "Critère", detailed: "Scores détaillés",
    contact: "Contact", ourPick: "🏆 Gagnant", affLink: "Lien affilié", tryFree: "Essayer gratuitement",
    tools: "outils",
  } : {
    back: "← Comparisons", share: copied ? "Copied!" : "Copy",
    winner: "🏆 Winner", pros: "Strengths", cons: "Weaknesses",
    overview: "Overview", details: "Details", analysis: "Analysis",
    verdict: "Our verdict", nlText: "The AI radar every Monday. Free.",
    nlTitle: "The AI Radar · every Monday",
    sub: "Subscribe", subLoading: "...", subDone: "✓ See you Monday!", subError: "Error, try again.",
    placeholder: "your@email.com",
    radar: "Score radar", compare: "Side by side", methodology: "Methodology & analysis",
    scores: "Scores", pricing: "Pricing", criteria: "Criteria", detailed: "Detailed scores",
    contact: "Contact", ourPick: "🏆 Winner", affLink: "Affiliate link", tryFree: "Try for free",
    tools: "tools",
  };

  if (!data || !comp) {
    return (
      <>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}:root{--bg:#080c10;--cyan:#00e6be;--text:#edf2f7;--muted:#5a6a7a;--d:'Syne',sans-serif;--m:'JetBrains Mono',monospace}body{background:var(--bg);color:var(--text);font-family:var(--d);display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.nf h1{font-size:3rem;font-weight:800;margin-bottom:1rem}.nf p{font-family:var(--m);color:var(--muted);margin-bottom:2rem;font-size:.85rem}.btn{background:var(--cyan);color:var(--bg);font-family:var(--d);font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-flex}`}</style>
        <div className="nf">
          <h1>404</h1>
          <p>{lang === "fr" ? "Ce comparatif n'existe pas." : "This comparison doesn't exist."}</p>
          <a href={l("/comparatifs")} className="btn">{L.back}</a>
        </div>
      </>
    );
  }

  const winner = data.tools.find(t => t.name === data.winner);
  const tagColor = TAG_COLORS[data.tag] || "#00e6be";
  const criteriaLabels = data.criteria[lang];
  const compUrl = `https://neuriflux.com/${lang}/comparatifs/${slug}`;

  const articleSchema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: comp.title, description: comp.intro,
    image: `https://neuriflux.com/og/${slug}.png`,
    author: { "@type": "Organization", name: "Neuriflux", url: "https://neuriflux.com" },
    publisher: { "@type": "Organization", name: "Neuriflux", logo: { "@type": "ImageObject", url: "https://neuriflux.com/logo.png", width: 200, height: 60 } },
    datePublished: data.date.en, dateModified: data.date.en,
    url: compUrl, inLanguage: lang,
    mainEntityOfPage: { "@type": "WebPage", "@id": compUrl },
    about: data.tools.map(t => ({
      "@type": "SoftwareApplication", name: t.name, applicationCategory: "WebApplication",
      offers: { "@type": "Offer", price: t.price, priceCurrency: "USD" },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Neuriflux", item: `https://neuriflux.com/${lang}` },
      { "@type": "ListItem", position: 2, name: lang === "fr" ? "Comparatifs" : "Comparisons", item: `https://neuriflux.com/${lang}/comparatifs` },
      { "@type": "ListItem", position: 3, name: comp.title, item: compUrl },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: comp.title, description: comp.intro, url: compUrl,
    numberOfItems: data.tools.length,
    itemListElement: [...data.tools]
      .sort((a, b) => b.globalScore - a.globalScore)
      .map((t, i) => ({
        "@type": "ListItem", position: i + 1, name: t.name,
        url: t.affiliate || compUrl,
      })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080c10;--bg2:#0d1117;--bg3:#111820;
          --border:rgba(255,255,255,.065);--glow:rgba(0,230,190,.2);
          --cyan:#00e6be;--cdim:rgba(0,230,190,.09);
          --text:#edf2f7;--muted:#5a6a7a;--dim:#2a3a4a;
          --d:'Syne',sans-serif;--m:'JetBrains Mono',monospace;
          --body:Georgia,'Times New Roman',serif;
          --r:10px;--pad:clamp(1.5rem,5vw,4rem)
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--d);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .bg-grid{position:fixed;inset:0;
          background-image:linear-gradient(rgba(0,230,190,.018) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,230,190,.018) 1px,transparent 1px);
          background-size:72px 72px;pointer-events:none;z-index:0}

        /* ─── NAVIGATION ────────────────────────────────────────── */
        nav{position:sticky;top:0;z-index:100;
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          background:rgba(8,12,16,.93);border-bottom:1px solid var(--border);
          padding:0 var(--pad);height:60px;display:flex;align-items:center;justify-content:space-between;
          transition:box-shadow .25s}
        nav.scrolled{box-shadow:0 4px 28px rgba(0,0,0,.5)}
        .logo{font-family:var(--d);font-weight:800;font-size:1.15rem;letter-spacing:-.03em;
          color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.45rem}
        .logo em{color:var(--cyan);font-style:normal}
        .logo-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;
          box-shadow:0 0 8px var(--cyan);animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        .nav-links{display:flex;align-items:center;gap:1.75rem;list-style:none}
        @media(max-width:720px){
          .nav-links{display:none}
          .nav-links.open{display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;
            background:var(--bg2);border-bottom:1px solid var(--border);
            padding:1.25rem var(--pad);gap:1rem;z-index:99}
        }
        .nav-links a{font-family:var(--m);font-size:.74rem;color:var(--muted);text-decoration:none;letter-spacing:.03em;transition:color .15s}
        .nav-links a:hover,.nav-links a.active{color:var(--cyan)}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px;display:flex;gap:2px}
        .lb{font-family:var(--m);font-size:.67rem;font-weight:500;padding:4px 9px;border-radius:4px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:all .15s}
        .lb.on{background:var(--cyan);color:#080c10}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:5px;background:none;border:none}
        @media(max-width:720px){.hb{display:flex}}
        .hb span{display:block;width:18px;height:1.5px;background:var(--muted);border-radius:2px}

        /* ─── LAYOUT ────────────────────────────────────────────── */
        .layout{position:relative;z-index:1;max-width:1160px;margin:0 auto;
          padding:3.5rem var(--pad) 7rem;
          display:grid;grid-template-columns:1fr 272px;gap:4.5rem;align-items:start}
        @media(max-width:960px){.layout{grid-template-columns:1fr;gap:0}.sidebar{display:none!important}}

        /* ─── HEADER PAGE ───────────────────────────────────────── */
        .back{display:inline-flex;align-items:center;gap:.35rem;font-family:var(--m);font-size:.7rem;
          color:var(--muted);text-decoration:none;margin-bottom:2rem;transition:color .15s;letter-spacing:.03em}
        .back:hover{color:var(--cyan)}
        .art-meta{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:1.1rem}
        .tag-b{font-family:var(--m);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:3px 10px;border-radius:100px}
        .art-title{font-size:clamp(1.75rem,4vw,2.7rem);font-weight:800;letter-spacing:-.035em;line-height:1.1;margin-bottom:1rem;color:var(--text)}
        .art-desc{font-family:var(--m);font-size:.83rem;color:var(--muted);font-weight:300;line-height:1.75;padding:1rem 1.4rem;border-radius:0 8px 8px 0;margin-bottom:2rem}

        /* ─── WINNER BANNER ─────────────────────────────────────── */
        .winner-banner{border-radius:12px;padding:1.3rem 1.6rem;display:flex;
          align-items:center;gap:1rem;margin-bottom:2.5rem;flex-wrap:wrap;position:relative;overflow:hidden}
        .winner-score{font-family:var(--d);font-size:2.1rem;font-weight:800;letter-spacing:-.04em;line-height:1}

        /* ─── TABS ──────────────────────────────────────────────── */
        .tabs{display:flex;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:2rem}
        .tab{flex:1;font-family:var(--m);font-size:.72rem;padding:11px 16px;background:transparent;
          border:none;color:var(--muted);cursor:pointer;transition:all .18s;letter-spacing:.04em;text-align:center}
        .tab:not(:last-child){border-right:1px solid var(--border)}
        .tab:hover{background:var(--bg2);color:var(--text)}
        .tab.active{background:var(--cyan);color:#080c10;font-weight:700}

        /* ─── SECTIONS ──────────────────────────────────────────── */
        .tools-grid{display:flex;gap:1.25rem;flex-wrap:wrap;margin-bottom:2.5rem}
        .radar-section{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:2rem;margin-bottom:2.5rem}
        .sec-tag{font-family:var(--m);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;
          color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.4rem}
        .sec-tag::before{content:'';width:14px;height:1px;background:var(--cyan);display:inline-block}
        .radar-wrap{display:flex;flex-direction:column;align-items:center;gap:1.5rem}
        .radar-legend{display:flex;gap:1.25rem;flex-wrap:wrap;justify-content:center}
        .radar-legend-item{display:flex;align-items:center;gap:.4rem;font-family:var(--m);font-size:.68rem;color:var(--muted)}
        .radar-legend-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}

        /* ─── VERDICT ───────────────────────────────────────────── */
        .verdict-box{background:var(--bg2);border:1px solid rgba(0,230,190,.18);border-radius:16px;padding:2rem 2.25rem;margin-bottom:2.5rem;position:relative;overflow:hidden}
        .verdict-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:55%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .verdict-glow{position:absolute;top:-35%;left:50%;transform:translateX(-50%);width:400px;height:200px;background:radial-gradient(ellipse,rgba(0,230,190,.055),transparent 70%);pointer-events:none}
        .verdict-text{font-family:var(--m);font-size:.85rem;color:var(--muted);line-height:1.75;font-weight:300;position:relative;z-index:1}

        /* ─── SHARE ─────────────────────────────────────────────── */
        .share{display:flex;align-items:center;gap:.55rem;margin-top:3.5rem;padding:1.25rem 1.5rem;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);flex-wrap:wrap}
        .share-label{font-family:var(--m);font-size:.62rem;color:var(--dim);letter-spacing:.09em;text-transform:uppercase;margin-right:.25rem}
        .sbtn{font-family:var(--m);font-size:.7rem;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;text-decoration:none;display:inline-flex;align-items:center;gap:.35rem}
        .sbtn:hover{border-color:rgba(0,230,190,.28);color:var(--cyan);background:var(--cdim)}
        .sbtn.done{background:var(--cdim);border-color:rgba(0,230,190,.28);color:var(--cyan)}

        /* ─── PROSE ─────────────────────────────────────────────── */
        .prose{font-family:var(--body);font-size:1.01rem;line-height:1.88;color:#c8d5e0}
        .prose h2{font-family:var(--d);font-size:1.35rem;font-weight:800;letter-spacing:-.025em;color:var(--text);margin:2.75rem 0 0;padding:.6rem 0 .6rem 1rem;border-left:3px solid var(--cyan);border-bottom:1px solid var(--border);scroll-margin-top:80px}
        .prose h2 + *{margin-top:.85rem}
        .prose h3{font-family:var(--d);font-size:1.05rem;font-weight:700;color:var(--text);margin:2rem 0 .7rem;scroll-margin-top:80px}
        .prose p{margin-bottom:1.25rem}
        .prose strong{color:var(--text);font-weight:600;font-family:var(--d)}
        .prose em{color:var(--muted);font-style:italic}
        .prose ul,.prose ol{padding-left:1.4rem;margin-top:.65rem;margin-bottom:1.2rem}
        .prose li{margin-bottom:.45rem;color:#c8d5e0;line-height:1.65}
        .prose li::marker{color:var(--cyan);font-weight:700}
        .prose a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(0,230,190,.28);transition:border-color .15s}
        .prose a:hover{border-color:var(--cyan)}
        .prose code{font-family:var(--m);font-size:.79rem;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--cyan)}
        .prose pre{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:1.25rem 1.5rem;margin:1.5rem 0;overflow-x:auto}
        .prose pre code{background:none;border:none;padding:0;color:#a8c0d6;font-size:.79rem;line-height:1.75}
        .prose blockquote{border-left:3px solid var(--cyan);padding:.8rem 1.25rem;background:var(--bg2);border-radius:0 8px 8px 0;margin:1.75rem 0;font-style:italic;color:var(--muted)}
        .prose table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-family:var(--m);font-size:.75rem}
        .prose th{padding:10px 14px;border:1px solid var(--border);color:var(--text);font-weight:600;background:var(--bg3);text-align:left}
        .prose td{padding:10px 14px;border:1px solid var(--border);color:var(--muted)}
        .prose tr:hover td{background:var(--bg2)}

        /* ─── SIDEBAR ───────────────────────────────────────────── */
        .sidebar{position:sticky;top:76px;display:flex;flex-direction:column;gap:.8rem}
        .sbox{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
        .sbox-hd{padding:.8rem 1.1rem;border-bottom:1px solid var(--border)}
        .sbox-title{font-family:var(--m);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
        .sbox-bd{padding:.85rem 1.1rem}
        .score-row{display:flex;align-items:center;justify-content:space-between;padding:.48rem 0;border-bottom:1px solid var(--border)}
        .score-row:last-child{border-bottom:none}

        /* ─── SIDEBAR WINNER — haute conversion ─────────────────── */
        .sbox-win{position:relative;overflow:hidden}
        .sbox-win::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--wc,var(--cyan)) 30%,var(--wc,var(--cyan)) 70%,transparent)}
        .win-checks{display:flex;flex-direction:column;gap:.22rem;margin:.55rem 0 .85rem}
        .win-check{font-family:var(--m);font-size:.62rem;color:var(--wc,var(--cyan));font-weight:500}
        /* Bouton winner sidebar — plus grand, avec shadow */
        .win-btn{display:flex;align-items:center;justify-content:center;gap:.4rem;
          width:100%;font-family:var(--d);font-weight:800;font-size:.82rem;
          padding:12px;border-radius:8px;text-decoration:none;
          transition:all .2s;letter-spacing:-.01em}
        .win-btn:hover{opacity:.87;transform:translateY(-2px)}
        .win-btn-sub{font-family:var(--m);font-size:.58rem;color:var(--muted);text-align:center;margin-top:.35rem}
        .aff-note{font-family:var(--m);font-size:.52rem;color:var(--dim);text-align:center;margin-top:.25rem}

        /* Newsletter */
        .nl-title-s{font-family:var(--d);font-size:.83rem;font-weight:700;color:var(--text);letter-spacing:-.02em;margin-bottom:.3rem}
        .nl-text{font-family:var(--m);font-size:.68rem;color:var(--muted);line-height:1.65;font-weight:300;margin-bottom:.85rem}
        .nl-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 11px;color:var(--text);font-family:var(--m);font-size:.74rem;outline:none;margin-bottom:.45rem;transition:border-color .18s}
        .nl-input:focus{border-color:rgba(0,230,190,.3)}
        .nl-input::placeholder{color:var(--dim)}
        .nl-btn{width:100%;background:var(--cyan);color:#080c10;font-family:var(--d);font-weight:700;font-size:.76rem;padding:9px;border-radius:6px;border:none;cursor:pointer;transition:opacity .18s;letter-spacing:-.01em}
        .nl-btn:hover{opacity:.9}.nl-btn:disabled{opacity:.55;cursor:not-allowed}
        .nl-status{text-align:center;font-family:var(--m);font-size:.74rem;padding:6px 0}

        /* ─── STICKY MOBILE CTA — nouveau ──────────────────────── */
        .sticky-win{display:none}
        @media(max-width:960px){
          .sticky-win{
            display:flex;align-items:center;justify-content:space-between;gap:.75rem;
            position:fixed;bottom:0;left:0;right:0;z-index:200;
            background:rgba(8,12,16,.97);border-top:1px solid rgba(0,230,190,.2);
            padding:.9rem var(--pad);backdrop-filter:blur(20px)
          }
          .sticky-win-info{display:flex;flex-direction:column;gap:.15rem}
          .sticky-win-name{font-family:var(--d);font-size:.85rem;font-weight:800;color:var(--text);letter-spacing:-.01em}
          .sticky-win-sub{font-family:var(--m);font-size:.6rem;color:var(--muted)}
          .sticky-win-btn{display:inline-flex;align-items:center;gap:.35rem;font-family:var(--d);font-weight:800;font-size:.82rem;padding:10px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;flex-shrink:0;transition:all .18s}
        }

        /* ─── FOOTER ────────────────────────────────────────────── */
        .comp-footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:1.75rem var(--pad);max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
        .ft-copy{font-family:var(--m);font-size:.62rem;color:var(--dim)}
        .ft-copy em{color:var(--cyan);font-style:normal}
        .ft-links{display:flex;gap:1.25rem;list-style:none}
        .ft-links a{font-family:var(--m);font-size:.62rem;color:var(--dim);text-decoration:none;transition:color .15s}
        .ft-links a:hover{color:var(--muted)}
      `}</style>

      <ProgressBar color={tagColor} />
      <div className="bg-grid" />

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href={l("")} className="logo">
          <div className="logo-dot" />
          Neuri<em>flux</em>
        </a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href={l("/blog")}>Blog</a></li>
          <li><a href={l("/comparatifs")} className="active">{lang === "fr" ? "Comparatifs" : "Comparisons"}</a></li>
          <li><a href={l("/newsletter")}>Newsletter</a></li>
          <li><a href={l("/contact")}>{L.contact}</a></li>
          <li><a href={l("/about")}>{lang === "fr" ? "À propos" : "About"}</a></li>
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

      <div className="layout">
        <main>
          <a href={l("/comparatifs")} className="back">{L.back}</a>

          <div className="art-meta">
            <span className="tag-b" style={{ color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}35` }}>{data.tag}</span>
            <span style={{ fontFamily: "var(--m)", fontSize: "0.68rem", color: "var(--muted)" }}>{data.date[lang]}</span>
            <span style={{ fontFamily: "var(--m)", fontSize: "0.68rem", color: "var(--dim)" }}>
              ⚔️ {data.tools.length} {L.tools}
            </span>
          </div>

          <h1 className="art-title">{comp.title}</h1>
          <p className="art-desc" style={{ borderLeft: `2px solid ${tagColor}` }}>{comp.intro}</p>

          {/* Winner banner */}
          {winner && (
            <div className="winner-banner" style={{ background: `${winner.color}0d`, border: `1px solid ${winner.color}30` }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${winner.color},transparent)` }} />
              <div style={{ width: 50, height: 50, background: `${winner.color}18`, border: `2px solid ${winner.color}35`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{winner.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--m)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: winner.color, marginBottom: "0.25rem" }}>{L.winner}</div>
                <div style={{ fontFamily: "var(--d)", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{winner.name}</div>
                <div style={{ fontFamily: "var(--m)", fontSize: "0.7rem", color: "var(--muted)", fontWeight: 300, marginTop: "0.2rem", lineHeight: 1.5 }}>{winner.verdict[lang]}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <div style={{ textAlign: "center" as const }}>
                  <div className="winner-score" style={{ color: winner.color }}>{winner.globalScore.toFixed(1)}</div>
                  <div style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: "var(--dim)" }}>/10</div>
                </div>
                {winner.affiliate && (
                  <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: winner.color, color: "#080c10", fontFamily: "var(--d)", fontWeight: 800, fontSize: "0.72rem", padding: "8px 16px", borderRadius: 7, textDecoration: "none", whiteSpace: "nowrap" as const, boxShadow: `0 3px 12px ${winner.color}30` }}>
                    {lang === "fr" ? "Essayer →" : "Try it →"}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs">
            {(["overview", "details", "analysis"] as const).map(tab => (
              <button key={tab} className={`tab${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab === "overview" ? L.overview : tab === "details" ? L.details : L.analysis}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div>
              <div className="radar-section">
                <div className="sec-tag">{L.radar}</div>
                <div className="radar-wrap">
                  <RadarChart tools={data.tools} criteria={criteriaLabels} />
                  <div className="radar-legend">
                    {data.tools.map(tool => (
                      <div key={tool.name} className="radar-legend-item">
                        <div className="radar-legend-dot" style={{ background: tool.color }} />
                        {tool.name}
                        <span style={{ color: tool.color, fontWeight: 700, marginLeft: ".2rem" }}>{tool.globalScore.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: "2.5rem" }}>
                <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                  <div className="sec-tag" style={{ marginBottom: 0 }}>{L.detailed}</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--m)", fontSize: "0.75rem" }}>
                    <thead>
                      <tr style={{ background: "var(--bg3)" }}>
                        <th style={{ padding: "10px 16px", textAlign: "left" as const, color: "var(--dim)", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.6rem" }}>{L.criteria}</th>
                        {data.tools.map(tool => (
                          <th key={tool.name} style={{ padding: "10px 16px", textAlign: "center" as const, color: tool.color, fontWeight: 700 }}>
                            {tool.logo} {tool.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {criteriaLabels.map((criterion, ci) => (
                        <tr key={criterion} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px 16px", color: "var(--muted)", fontWeight: 300 }}>{criterion}</td>
                          {data.tools.map(tool => {
                            const score = tool.scores[ci]?.value || 0;
                            const sc = score >= 9 ? "#00e6be" : score >= 7.5 ? "#3b82f6" : score >= 6 ? "#f59e0b" : "#ef4444";
                            const best = Math.max(...data.tools.map(t => t.scores[ci]?.value || 0));
                            return (
                              <td key={tool.name} style={{ padding: "10px 16px", textAlign: "center" as const }}>
                                <span style={{ fontWeight: score === best ? 700 : 400, color: score === best ? sc : "var(--muted)", background: score === best ? `${sc}15` : "transparent", padding: "2px 8px", borderRadius: 4, display: "inline-block" }}>
                                  {score.toFixed(1)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid var(--border)", background: "var(--bg3)" }}>
                        <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 700, fontFamily: "var(--m)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>GLOBAL</td>
                        {data.tools.map(tool => {
                          const best = Math.max(...data.tools.map(t => t.globalScore));
                          return (
                            <td key={tool.name} style={{ padding: "12px 16px", textAlign: "center" as const }}>
                              <span style={{ fontFamily: "var(--d)", fontSize: "1.15rem", fontWeight: 800, color: tool.globalScore === best ? tool.color : "var(--muted)" }}>
                                {tool.globalScore.toFixed(1)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="verdict-box">
                <div className="verdict-glow" />
                <div className="sec-tag">{L.verdict}</div>
                <p className="verdict-text">{comp.verdict}</p>
                {/* ── CTA inline dans le verdict ── */}
                {winner && winner.affiliate && (
                  <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: `1px solid ${winner.color}20`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "1rem", position: "relative", zIndex: 1 }}>
                    <div>
                      <div style={{ fontFamily: "var(--d)", fontSize: "0.88rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.2rem" }}>
                        {lang === "fr" ? `Notre verdict : ${winner.name} s'impose.` : `Our verdict: ${winner.name} wins.`}
                      </div>
                      <div style={{ fontFamily: "var(--m)", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 300 }}>
                        {lang === "fr" ? "Version gratuite disponible · Sans carte bancaire" : "Free plan available · No credit card needed"}
                      </div>
                    </div>
                    <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored" style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: winner.color, color: "#080c10",
                      fontFamily: "var(--d)", fontWeight: 800, fontSize: "0.85rem",
                      padding: "10px 22px", borderRadius: 9, textDecoration: "none",
                      whiteSpace: "nowrap" as const, boxShadow: `0 4px 16px ${winner.color}30`,
                      transition: "all 0.2s", flexShrink: 0,
                    }}>
                      {lang === "fr" ? "Essayer gratuitement" : "Try for free"} →
                    </a>
                  </div>
                )}
              </div>
              {winner && <WinnerCTA winner={winner} lang={lang} />}
            </div>
          )}

          {/* ── DETAILS ── */}
          {activeTab === "details" && (
            <div>
              <div className="sec-tag" style={{ marginBottom: "1.5rem" }}>{L.compare}</div>
              <div className="tools-grid">
                {data.tools.map(tool => (
                  <ToolCard key={tool.name} tool={tool} lang={lang}
                    isWinner={tool.name === data.winner} proLabel={L.pros} conLabel={L.cons} />
                ))}
              </div>

              {/* ── CTA "Choix de l'éditeur" entre les cards et le WinnerCTA ── */}
              {winner && winner.affiliate && (
                <div style={{
                  margin: "1.75rem 0",
                  padding: "1.35rem 1.75rem",
                  background: `linear-gradient(135deg,${winner.color}0c,${winner.color}03)`,
                  border: `1px solid ${winner.color}28`,
                  borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap" as const, gap: "1.25rem",
                  position: "relative" as const, overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${winner.color},transparent)` }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 200 }}>
                    <span style={{ fontSize: "1.5rem" }}>{winner.logo}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                        <span style={{ fontFamily: "var(--m)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: winner.color }}>
                          {lang === "fr" ? "Choix de l'éditeur" : "Editor's choice"}
                        </span>
                        <span style={{ color: "#f59e0b", fontSize: "0.65rem", letterSpacing: "1px" }}>★★★★★</span>
                      </div>
                      <div style={{ fontFamily: "var(--d)", fontSize: "0.95rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{winner.name}</div>
                      <div style={{ fontFamily: "var(--m)", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 300, marginTop: "0.15rem" }}>
                        {lang === "fr" ? `Score global : ${winner.globalScore.toFixed(1)}/10 · Version gratuite disponible` : `Overall score: ${winner.globalScore.toFixed(1)}/10 · Free plan available`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
                    <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored" style={{
                      display: "inline-flex", alignItems: "center", gap: "0.45rem",
                      background: winner.color, color: "#080c10",
                      fontFamily: "var(--d)", fontWeight: 800, fontSize: "0.88rem",
                      padding: "11px 24px", borderRadius: 9, textDecoration: "none",
                      whiteSpace: "nowrap" as const, boxShadow: `0 4px 16px ${winner.color}30`,
                      transition: "all 0.2s",
                    }}>
                      {lang === "fr" ? "Commencer gratuit" : "Start for free"} →
                    </a>
                    <div style={{ fontFamily: "var(--m)", fontSize: "0.58rem", color: "var(--dim)", textAlign: "center" as const }}>
                      {lang === "fr" ? "Accès immédiat · Lien affilié" : "Instant access · Affiliate link"}
                    </div>
                  </div>
                </div>
              )}

              {winner && <WinnerCTA winner={winner} lang={lang} />}
            </div>
          )}

          {/* ── ANALYSIS ── */}
          {activeTab === "analysis" && (
            <div>
              <div className="sec-tag" style={{ marginBottom: "1.5rem" }}>{L.methodology}</div>
              <div className="prose"
                style={{ "--art-color": tagColor } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: renderMd(comp.content, tagColor) }}
              />
              {winner && <WinnerCTA winner={winner} lang={lang} />}
            </div>
          )}

          <div className="share">
            <span className="share-label">{lang === "fr" ? "Partager" : "Share"}</span>
            <button className={`sbtn${copied ? " done" : ""}`} onClick={copy}>🔗 {L.share}</button>
            <a className="sbtn"
              href={shareUrl ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(comp.title)}&url=${encodeURIComponent(shareUrl)}` : "#"}
              target="_blank" rel="noopener noreferrer">𝕏 Twitter</a>
            <a className="sbtn"
              href={shareUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` : "#"}
              target="_blank" rel="noopener noreferrer">in LinkedIn</a>
          </div>
        </main>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">

          {/* Scores rapides */}
          <div className="sbox">
            <div className="sbox-hd"><div className="sbox-title">{L.scores}</div></div>
            <div className="sbox-bd">
              {[...data.tools].sort((a, b) => b.globalScore - a.globalScore).map(tool => (
                <div key={tool.name} className="score-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.9rem" }}>{tool.logo}</span>
                    <span style={{ fontFamily: "var(--m)", fontSize: "0.72rem", color: tool.name === data.winner ? "var(--text)" : "var(--muted)", fontWeight: tool.name === data.winner ? 600 : 300 }}>
                      {tool.name}
                    </span>
                    {tool.name === data.winner && <span style={{ fontSize: "0.6rem" }}>🏆</span>}
                  </div>
                  <span style={{ fontFamily: "var(--m)", fontSize: "0.78rem", fontWeight: 700, color: tool.color }}>
                    {tool.globalScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sidebar winner — haute conversion ── */}
          {winner && winner.affiliate && (
            <div className="sbox sbox-win"
              style={{ "--wc": winner.color, background: `linear-gradient(160deg,${winner.color}0a,${winner.color}02)`, border: `1px solid ${winner.color}28` } as React.CSSProperties}>
              <div className="sbox-hd" style={{ borderBottomColor: `${winner.color}15` }}>
                <div className="sbox-title" style={{ color: winner.color }}>{L.ourPick}</div>
              </div>
              <div className="sbox-bd">
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.35rem" }}>{winner.logo}</span>
                  <div>
                    <div style={{ fontFamily: "var(--d)", fontSize: "0.92rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{winner.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ color: "#f59e0b", fontSize: "0.62rem", letterSpacing: "1px" }}>★★★★★</span>
                      <span style={{ fontFamily: "var(--m)", fontSize: "0.62rem", color: winner.color, fontWeight: 700 }}>{winner.globalScore.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
                {/* Trust checks */}
                <div className="win-checks">
                  <span className="win-check">✓ {lang === "fr" ? "Testé par Neuriflux" : "Tested by Neuriflux"}</span>
                  <span className="win-check">✓ {lang === "fr" ? "Version gratuite dispo" : "Free plan available"}</span>
                  <span className="win-check">✓ {lang === "fr" ? "Sans carte bancaire" : "No credit card needed"}</span>
                </div>
                <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
                  className="win-btn" style={{ background: winner.color, color: "#080c10", boxShadow: `0 4px 16px ${winner.color}28` }}>
                  {lang === "fr" ? "Commencer gratuit" : "Start free"} →
                </a>
                <div className="win-btn-sub">{lang === "fr" ? "Accès immédiat · Sans engagement" : "Instant access · No commitment"}</div>
                <div className="aff-note">{L.affLink}</div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="sbox">
            <div className="sbox-hd"><div className="sbox-title">{L.pricing}</div></div>
            <div className="sbox-bd">
              {data.tools.map((tool, i) => (
                <div key={tool.name} style={{ marginBottom: i < data.tools.length - 1 ? "0.75rem" : 0, paddingBottom: i < data.tools.length - 1 ? "0.75rem" : 0, borderBottom: i < data.tools.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ fontFamily: "var(--m)", fontSize: "0.7rem", color: tool.color, fontWeight: 600, marginBottom: "0.2rem" }}>{tool.name}</div>
                  <div style={{ fontFamily: "var(--m)", fontSize: "0.69rem", color: "var(--muted)", fontWeight: 300, lineHeight: 1.55 }}>{tool.priceFull[lang]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="sbox">
            <div className="sbox-hd"><div className="sbox-title">Newsletter</div></div>
            <div className="sbox-bd">
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

      {/* ── STICKY MOBILE CTA ── */}
      {winner && winner.affiliate && (
        <div className="sticky-win">
          <div className="sticky-win-info">
            <div className="sticky-win-name">🏆 {winner.name}</div>
            <div className="sticky-win-sub">{lang === "fr" ? "Version gratuite disponible" : "Free plan available"}</div>
          </div>
          <a href={winner.affiliate} target="_blank" rel="noopener noreferrer sponsored"
            className="sticky-win-btn"
            style={{ background: winner.color, color: "#080c10", boxShadow: `0 4px 16px ${winner.color}30` }}>
            {lang === "fr" ? "Essayer gratuit" : "Try free"} →
          </a>
        </div>
      )}

      <footer className="comp-footer">
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