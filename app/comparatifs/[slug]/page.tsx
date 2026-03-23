"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getComparatifBySlug, type ToolScore } from "../../lib/comparatifs";

// ─── Reading progress ─────────────────────────────────────────────────────────
function ProgressBar() {
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
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: "rgba(0,0,0,0.2)" }}>
      <div style={{ height: "100%", width: `${p}%`, background: "var(--cyan)", transition: "width 0.08s linear", boxShadow: "0 0 10px var(--cyan)" }} />
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ value, color, animated = true }: { value: number; color: string; animated?: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value * 10), animated ? 300 : 0);
    return () => clearTimeout(t);
  }, [value, animated]);
  const scoreColor = value >= 9 ? "#00e6be" : value >= 7.5 ? "#3b82f6" : value >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ flex: 1, height: 6, background: "var(--bg3)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 8px ${color}60` }} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700, color: scoreColor, minWidth: 28, textAlign: "right" as const }}>{value.toFixed(1)}</span>
    </div>
  );
}

// ─── Spider chart (SVG) ───────────────────────────────────────────────────────
function SpiderChart({ tools, criteria }: { tools: ToolScore[]; criteria: string[] }) {
  const N = criteria.length;
  const R = 100;
  const cx = 130, cy = 130;
  const angles = criteria.map((_, i) => (i / N) * 2 * Math.PI - Math.PI / 2);

  const levels = [0.25, 0.5, 0.75, 1];
  const getPoint = (r: number, angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const toolPolygon = (tool: ToolScore) =>
    tool.scores.map((s, i) => {
      const p = getPoint((s.value / 10) * R, angles[i]);
      return `${p.x},${p.y}`;
    }).join(" ");

  return (
    <svg viewBox="0 0 260 260" style={{ width: "100%", maxWidth: 260 }}>
      {/* Grid levels */}
      {levels.map(level => (
        <polygon key={level}
          points={angles.map(a => { const p = getPoint(level * R, a); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1}
        />
      ))}
      {/* Axes */}
      {angles.map((angle, i) => {
        const p = getPoint(R, angle);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}
      {/* Tool polygons */}
      {tools.map(tool => (
        <polygon key={tool.name}
          points={toolPolygon(tool)}
          fill={`${tool.color}20`}
          stroke={tool.color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}
      {/* Labels */}
      {criteria.map((label, i) => {
        const p = getPoint(R + 18, angles[i]);
        return (
          <text key={i} x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={8}
            fontFamily="JetBrains Mono, monospace"
          >{label}</text>
        );
      })}
    </svg>
  );
}

// ─── Tool card (side by side) ─────────────────────────────────────────────────
function ToolCard({ tool, lang, isWinner, proLabel, conLabel }: {
  tool: ToolScore;
  lang: "fr" | "en";
  isWinner: boolean;
  proLabel: string;
  conLabel: string;
}) {
  return (
    <div style={{
      background: "var(--bg2)",
      border: `1px solid ${isWinner ? tool.color + "40" : "var(--border)"}`,
      borderRadius: 16,
      padding: "1.75rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      position: "relative",
      overflow: "hidden",
      flex: 1,
      minWidth: 260,
    }}>
      {/* Top glow if winner */}
      {isWinner && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: tool.color, boxShadow: `0 0 20px ${tool.color}` }} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 44, height: 44, background: `${tool.color}20`, border: `2px solid ${tool.color}40`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
            {tool.logo}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--text)" }}>{tool.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 300 }}>{tool.price}</div>
          </div>
        </div>
        {/* Global score */}
        <div style={{ textAlign: "center" as const }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: tool.color, lineHeight: 1, letterSpacing: "-0.04em" }}>{tool.globalScore.toFixed(1)}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-dim)", letterSpacing: "0.06em" }}>/10</div>
        </div>
      </div>

      {/* Badge */}
      {tool.badge && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: tool.color, background: `${tool.color}15`, border: `1px solid ${tool.color}30`, borderRadius: 6, padding: "4px 10px", display: "inline-block", alignSelf: "flex-start" }}>
          {tool.badge[lang]}
        </div>
      )}

      {/* Scores */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {tool.scores.map(s => (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 300 }}>{s.label}</span>
            </div>
            <ScoreBar value={s.value} color={tool.color} />
          </div>
        ))}
      </div>

      {/* Pros */}
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#10b981", marginBottom: "0.5rem" }}>✓ {proLabel}</div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {tool.pros[lang].map((p, i) => (
            <li key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 300, display: "flex", gap: "0.5rem" }}>
              <span style={{ color: "#10b981", flexShrink: 0 }}>+</span>{p}
            </li>
          ))}
        </ul>
      </div>

      {/* Cons */}
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#ef4444", marginBottom: "0.5rem" }}>✗ {conLabel}</div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {tool.cons[lang].map((c, i) => (
            <li key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 300, display: "flex", gap: "0.5rem" }}>
              <span style={{ color: "#ef4444", flexShrink: 0 }}>−</span>{c}
            </li>
          ))}
        </ul>
      </div>

      {/* Verdict */}
      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.6, fontWeight: 300, fontStyle: "italic" }}>
        "{tool.verdict[lang]}"
      </div>

      {/* Affiliate CTA */}
      {tool.affiliate && (
        <a href={tool.affiliate} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
          background: isWinner ? tool.color : "transparent",
          color: isWinner ? "var(--bg)" : tool.color,
          border: `1px solid ${tool.color}`,
          borderRadius: 8, padding: "10px 16px",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem",
          textDecoration: "none", transition: "all 0.2s",
          letterSpacing: "-0.01em",
        }}>
          {lang === "fr" ? "Essayer" : "Try"} {tool.name} →
        </a>
      )}
    </div>
  );
}

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
    if (/^<(h[123]|ul|ol|table|pre)/.test(block)) return block;
    return `<p>${block.replace(/\n/g, " ")}</p>`;
  }).join("\n");
  return html;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ComparatifPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "analysis">("overview");

  useEffect(() => { setLang(navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en"); }, []);

  const data = getComparatifBySlug(slug);
  const comp = data ? data[lang] : null;

  const copy = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const L = {
    fr: { back: "← Comparatifs", share: copied ? "Copié !" : "Copier", winner: "🏆 Gagnant", pros: "Points forts", cons: "Points faibles", overview: "Vue d'ensemble", details: "Détails", analysis: "Analyse", verdict: "Notre verdict", readTime: "min de lecture", try: "Essayer", newsletter: "Newsletter", nlText: "Le radar IA chaque lundi. Gratuit.", sub: "S'abonner", subDone: "✓ À lundi !", placeholder: "votre@email.com", radar: "Radar des scores", compare: "Comparatif côte à côte", methodology: "Méthodologie & analyse" },
    en: { back: "← Comparisons", share: copied ? "Copied!" : "Copy link", winner: "🏆 Winner", pros: "Strengths", cons: "Weaknesses", overview: "Overview", details: "Details", analysis: "Analysis", verdict: "Our verdict", readTime: "min read", try: "Try", newsletter: "Newsletter", nlText: "The AI radar every Monday. Free.", sub: "Subscribe", subDone: "✓ See you Monday!", placeholder: "your@email.com", radar: "Score radar", compare: "Side by side", methodology: "Methodology & analysis" },
  }[lang];

  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);

  const TAG_COLORS: Record<string, string> = {
    Chatbots: "#00e6be", Code: "#3b82f6", "Rédaction": "#f59e0b",
    Writing: "#f59e0b", Image: "#a855f7", "Productivité": "#10b981",
    Productivity: "#10b981", Audio: "#ef4444",
  };

  if (!data || !comp) {
    return (
      <>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}:root{--bg:#080c10;--cyan:#00e6be;--text:#f0f4f8;--text-muted:#6b7a8d;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace}body{background:var(--bg);color:var(--text);font-family:var(--font-display);display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.nf h1{font-size:3rem;font-weight:800;margin-bottom:1rem}.nf p{font-family:var(--font-mono);color:var(--text-muted);margin-bottom:2rem}.btn{display:inline-flex;background:var(--cyan);color:var(--bg);font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none}`}</style>
        <div className="nf">
          <h1>404</h1>
          <p>{lang === "fr" ? "Ce comparatif n'existe pas." : "This comparison doesn't exist."}</p>
          <a href="/comparatifs" className="btn">{L.back}</a>
        </div>
      </>
    );
  }

  const winner = data.tools.find(t => t.name === data.winner);
  const tagColor = TAG_COLORS[data.tag] || "#00e6be";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#080c10;--bg2:#0d1117;--bg3:#111820;--border:rgba(255,255,255,0.07);--border-glow:rgba(0,230,190,0.25);--cyan:#00e6be;--cyan-dim:rgba(0,230,190,0.12);--text:#f0f4f8;--text-muted:#6b7a8d;--text-dim:#3d4f61;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace;--font-body:'Lora',serif}
        html{scroll-behavior:smooth}body{background:var(--bg);color:var(--text);font-family:var(--font-display);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .grid-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,230,190,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,190,0.02) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
        nav{position:sticky;top:3px;z-index:100;backdrop-filter:blur(20px);background:rgba(8,12,16,0.85);border-bottom:1px solid var(--border);padding:0 clamp(1.5rem,5vw,4rem);height:64px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-family:var(--font-display);font-weight:800;font-size:1.2rem;letter-spacing:-0.02em;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:.5rem}.logo span{color:var(--cyan)}
        .dot{width:7px;height:7px;background:var(--cyan);border-radius:50%;box-shadow:0 0 10px var(--cyan);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none}
        @media(max-width:768px){.nav-links{display:none}.nav-links.open{display:flex;flex-direction:column;position:fixed;top:67px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:1.5rem 2rem;gap:1.2rem}}
        .nav-links a{font-family:var(--font-mono);font-size:.78rem;color:var(--text-muted);text-decoration:none;transition:color .2s}.nav-links a:hover{color:var(--cyan)}
        .lt{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px;display:flex;gap:2px}
        .lb{font-family:var(--font-mono);font-size:.7rem;padding:4px 10px;border-radius:4px;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--text-muted)}.lb.active{background:var(--cyan);color:var(--bg);font-weight:600}
        .hb{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none}@media(max-width:768px){.hb{display:flex}}.hb span{display:block;width:20px;height:2px;background:var(--text-muted);border-radius:2px}
        /* LAYOUT */
        .layout{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:3rem clamp(1.5rem,5vw,4rem) 5rem;display:grid;grid-template-columns:1fr 260px;gap:4rem;align-items:start}
        @media(max-width:960px){.layout{grid-template-columns:1fr}.sidebar{display:none}}
        /* HEADER */
        .back{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);text-decoration:none;margin-bottom:1.5rem;transition:color .2s}.back:hover{color:var(--cyan)}
        .art-meta{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin-bottom:1.25rem}
        .tag-b{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;font-weight:500;padding:4px 12px;border-radius:100px}
        .art-title{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:1rem}
        .art-desc{font-family:var(--font-mono);font-size:.9rem;color:var(--text-muted);font-weight:300;line-height:1.7;padding:1.25rem 1.5rem;background:var(--bg2);border-left:3px solid var(--cyan);border-radius:0 8px 8px 0;margin-bottom:2rem}
        /* WINNER BANNER */
        .winner-banner{border-radius:12px;padding:1.25rem 1.5rem;display:flex;align-items:center;gap:1rem;margin-bottom:2.5rem;flex-wrap:wrap}
        .winner-avatar{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
        .winner-score{font-family:var(--font-display);font-size:2rem;font-weight:800;letter-spacing:-.04em;line-height:1}
        /* TABS */
        .tabs{display:flex;gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:2rem}
        .tab{flex:1;font-family:var(--font-mono);font-size:.75rem;padding:10px 16px;background:transparent;border:none;color:var(--text-muted);cursor:pointer;transition:all .2s;letter-spacing:.04em;text-align:center}
        .tab:not(:last-child){border-right:1px solid var(--border)}
        .tab:hover{background:var(--bg2);color:var(--text)}
        .tab.active{background:var(--cyan);color:var(--bg);font-weight:600}
        /* TOOLS GRID */
        .tools-grid{display:flex;gap:1.25rem;flex-wrap:wrap;margin-bottom:2.5rem}
        /* RADAR SECTION */
        .radar-section{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:2rem;margin-bottom:2.5rem}
        .section-label{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:1.25rem;display:flex;align-items:center;gap:.5rem}
        .section-label::before{content:'';display:inline-block;width:20px;height:1px;background:var(--cyan)}
        .radar-wrap{display:flex;flex-direction:column;align-items:center;gap:1.5rem}
        .radar-legend{display:flex;gap:1.5rem;flex-wrap:wrap;justify-content:center}
        .radar-legend-item{display:flex;align-items:center;gap:.4rem;font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted)}
        .radar-legend-dot{width:10px;height:10px;border-radius:50%}
        /* VERDICT */
        .verdict-box{background:var(--bg2);border:1px solid var(--border-glow);border-radius:16px;padding:2rem;margin-bottom:2.5rem;position:relative;overflow:hidden}
        .verdict-box::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
        .verdict-glow{position:absolute;top:-30%;left:50%;transform:translateX(-50%);width:400px;height:200px;background:radial-gradient(ellipse,rgba(0,230,190,0.06),transparent 70%);pointer-events:none}
        .verdict-text{font-family:var(--font-mono);font-size:.88rem;color:var(--text-muted);line-height:1.7;font-weight:300;position:relative;z-index:1}
        /* SHARE */
        .share{display:flex;align-items:center;gap:.75rem;margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);flex-wrap:wrap}
        .slabel{font-family:var(--font-mono);font-size:.72rem;color:var(--text-dim);letter-spacing:.06em;text-transform:uppercase}
        .sbtn{font-family:var(--font-mono);font-size:.75rem;padding:7px 14px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);cursor:pointer;transition:all .2s;text-decoration:none;display:inline-flex;align-items:center;gap:.4rem}
        .sbtn:hover{border-color:var(--border-glow);color:var(--cyan)}.sbtn.done{background:var(--cyan-dim);border-color:var(--border-glow);color:var(--cyan)}
        /* PROSE */
        .prose{font-family:var(--font-body);font-size:1rem;line-height:1.85;color:#d4dde8}
        .prose h2{font-family:var(--font-display);font-size:1.4rem;font-weight:800;letter-spacing:-.02em;color:var(--text);margin:2.5rem 0 1rem;padding-bottom:.5rem;border-bottom:1px solid var(--border)}
        .prose h3{font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--text);margin:2rem 0 .75rem}
        .prose strong{color:var(--text);font-weight:600}.prose em{color:var(--text-muted)}
        .prose code{font-family:var(--font-mono);font-size:.82rem;background:var(--bg3);border:1px solid var(--border);border-radius:4px;padding:2px 7px;color:var(--cyan)}
        .prose a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(0,230,190,.3)}.prose a:hover{border-color:var(--cyan)}
        .prose p{margin-bottom:1.25rem}.prose ul{padding-left:1.5rem;margin-bottom:1.25rem}.prose li{margin-bottom:.4rem;color:#d4dde8}
        .prose table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-family:var(--font-mono);font-size:.78rem}
        .prose th{padding:10px 14px;border:1px solid var(--border);color:var(--text);font-weight:600;background:var(--bg3);text-align:left}
        .prose td{padding:10px 14px;border:1px solid var(--border);color:var(--text-muted)}
        .prose tr:hover td{background:var(--bg2)}
        /* SIDEBAR */
        .sidebar{position:sticky;top:80px}
        .sbox{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:1.25rem;margin-bottom:1rem}
        .sbox-title{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:1rem}
        .toc-list{list-style:none;display:flex;flex-direction:column;gap:.5rem}
        .toc-item a{font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted);text-decoration:none;font-weight:300;transition:all .2s;display:block;padding:2px 0 2px 8px;border-left:2px solid transparent}
        .toc-item a:hover{color:var(--cyan);border-left-color:var(--cyan)}
        .nl-text{font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);line-height:1.6;font-weight:300;margin-bottom:1rem;text-align:center}
        .nl-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:9px 12px;color:var(--text);font-family:var(--font-mono);font-size:.78rem;outline:none;margin-bottom:.5rem;transition:border-color .2s}.nl-input:focus{border-color:var(--border-glow)}
        .nl-btn{width:100%;background:var(--cyan);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:.82rem;padding:10px;border-radius:6px;border:none;cursor:pointer}
        /* Scores summary in sidebar */
        .score-row{display:flex;align-items:center;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--border)}
        .score-row:last-child{border-bottom:none}
        footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:2rem clamp(1.5rem,5vw,4rem);max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
        .cp{font-family:var(--font-mono);font-size:.7rem;color:var(--text-dim)}.cp span{color:var(--cyan)}
      `}</style>

      <ProgressBar />
      <div className="grid-bg" />

      <nav>
        <a href="/" className="logo"><div className="dot" />Neuri<span>flux</span></a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li><a href="/blog">{lang === "fr" ? "Blog" : "Blog"}</a></li>
          <li><a href="/comparatifs">{lang === "fr" ? "Comparatifs" : "Comparisons"}</a></li>
          <li><a href="/outils">{lang === "fr" ? "Outils IA" : "AI Tools"}</a></li>
          <li><a href="/newsletter">Newsletter</a></li>
        </ul>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div className="lt">
            <button className={`lb${lang === "fr" ? " active" : ""}`} onClick={() => setLang("fr")}>FR</button>
            <button className={`lb${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
          </div>
          <button className="hb" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
        </div>
      </nav>

      <div className="layout">
        <main>
          <a href="/comparatifs" className="back">{L.back}</a>

          {/* Meta */}
          <div className="art-meta">
            <span className="tag-b" style={{ color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}30` }}>{data.tag}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>{data.date[lang]}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)" }}>⚔️ {data.tools.length} {lang === "fr" ? "outils" : "tools"}</span>
          </div>

          <h1 className="art-title">{comp.title}</h1>
          <p className="art-desc">{comp.intro}</p>

          {/* Winner banner */}
          {winner && (
            <div className="winner-banner" style={{ background: `${winner.color}10`, border: `1px solid ${winner.color}30` }}>
              <div className="winner-avatar" style={{ background: `${winner.color}20`, border: `2px solid ${winner.color}40` }}>{winner.logo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: winner.color, marginBottom: "0.3rem" }}>{L.winner}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>{winner.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 300, marginTop: "0.25rem" }}>{winner.verdict[lang]}</div>
              </div>
              <div style={{ textAlign: "center" as const }}>
                <div className="winner-score" style={{ color: winner.color }}>{winner.globalScore.toFixed(1)}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-dim)" }}>/10</div>
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

          {/* Tab: Overview — Radar + scores summary */}
          {activeTab === "overview" && (
            <div>
              <div className="radar-section">
                <div className="section-label">{L.radar}</div>
                <div className="radar-wrap">
                  <SpiderChart tools={data.tools} criteria={data.criteria} />
                  <div className="radar-legend">
                    {data.tools.map(tool => (
                      <div key={tool.name} className="radar-legend-item">
                        <div className="radar-legend-dot" style={{ background: tool.color }} />
                        {tool.name}
                        <span style={{ color: tool.color, fontWeight: 700 }}>{tool.globalScore.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scores table */}
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: "2.5rem" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                  <div className="section-label" style={{ marginBottom: 0 }}>{lang === "fr" ? "Scores détaillés" : "Detailed scores"}</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                    <thead>
                      <tr style={{ background: "var(--bg3)" }}>
                        <th style={{ padding: "10px 16px", textAlign: "left" as const, color: "var(--text-dim)", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.65rem" }}>{lang === "fr" ? "Critère" : "Criteria"}</th>
                        {data.tools.map(tool => (
                          <th key={tool.name} style={{ padding: "10px 16px", textAlign: "center" as const, color: tool.color, fontWeight: 700 }}>
                            {tool.logo} {tool.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.criteria.map((criterion, ci) => (
                        <tr key={criterion} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px 16px", color: "var(--text-muted)", fontWeight: 300 }}>{criterion}</td>
                          {data.tools.map(tool => {
                            const score = tool.scores[ci]?.value || 0;
                            const scoreColor = score >= 9 ? "#00e6be" : score >= 7.5 ? "#3b82f6" : score >= 6 ? "#f59e0b" : "#ef4444";
                            const best = Math.max(...data.tools.map(t => t.scores[ci]?.value || 0));
                            return (
                              <td key={tool.name} style={{ padding: "10px 16px", textAlign: "center" as const }}>
                                <span style={{ fontWeight: score === best ? 700 : 400, color: score === best ? scoreColor : "var(--text-muted)", background: score === best ? `${scoreColor}15` : "transparent", padding: "2px 8px", borderRadius: 4 }}>
                                  {score.toFixed(1)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid var(--border)", background: "var(--bg3)" }}>
                        <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 600, letterSpacing: "0.04em" }}>GLOBAL</td>
                        {data.tools.map(tool => {
                          const best = Math.max(...data.tools.map(t => t.globalScore));
                          return (
                            <td key={tool.name} style={{ padding: "12px 16px", textAlign: "center" as const }}>
                              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: tool.globalScore === best ? tool.color : "var(--text-muted)" }}>
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

              {/* Verdict */}
              <div className="verdict-box">
                <div className="verdict-glow" />
                <div className="section-label">{L.verdict}</div>
                <p className="verdict-text">{comp.verdict}</p>
              </div>
            </div>
          )}

          {/* Tab: Details — Side by side cards */}
          {activeTab === "details" && (
            <div>
              <div className="section-label" style={{ marginBottom: "1.5rem" }}>{L.compare}</div>
              <div className="tools-grid">
                {data.tools.map(tool => (
                  <ToolCard
                    key={tool.name}
                    tool={tool}
                    lang={lang}
                    isWinner={tool.name === data.winner}
                    proLabel={L.pros}
                    conLabel={L.cons}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab: Analysis — Full article */}
          {activeTab === "analysis" && (
            <div>
              <div className="section-label" style={{ marginBottom: "1.5rem" }}>{L.methodology}</div>
              <div className="prose" dangerouslySetInnerHTML={{ __html: renderMd(comp.content) }} />
            </div>
          )}

          {/* Share */}
          <div className="share">
            <span className="slabel">{lang === "fr" ? "Partager" : "Share"}</span>
            <button className={`sbtn${copied ? " done" : ""}`} onClick={copy}>🔗 {L.share}</button>
            <a className="sbtn" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(comp.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer">𝕏 Twitter</a>
            <a className="sbtn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer">in LinkedIn</a>
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="sidebar">
          {/* Scores recap */}
          <div className="sbox">
            <div className="sbox-title">{lang === "fr" ? "Scores globaux" : "Global scores"}</div>
            {data.tools.map(tool => (
              <div key={tool.name} className="score-row">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: tool.color, fontSize: "0.9rem" }}>{tool.logo}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: tool.name === data.winner ? "var(--text)" : "var(--text-muted)", fontWeight: tool.name === data.winner ? 600 : 300 }}>{tool.name}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, color: tool.color }}>{tool.globalScore.toFixed(1)}</span>
              </div>
            ))}
          </div>

          {/* Price recap */}
          <div className="sbox">
            <div className="sbox-title">{lang === "fr" ? "Tarifs" : "Pricing"}</div>
            {data.tools.map(tool => (
              <div key={tool.name} style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: tool.color, fontWeight: 600, marginBottom: "0.2rem" }}>{tool.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.5 }}>{tool.priceFull[lang]}</div>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="sbox">
            <div className="sbox-title">Newsletter</div>
            <p className="nl-text">{L.nlText}</p>
            {subbed ? (
              <div style={{ textAlign: "center" as const, fontFamily: "var(--font-mono)", fontSize: ".82rem", color: "var(--cyan)", padding: "8px 0" }}>{L.subDone}</div>
            ) : (
              <>
                <input className="nl-input" type="email" placeholder={L.placeholder} value={email} onChange={e => setEmail(e.target.value)} />
                <button className="nl-btn" onClick={() => email && setSubbed(true)}>{L.sub}</button>
              </>
            )}
          </div>
        </aside>
      </div>

      <footer>
        <p className="cp">© 2026 <span>Neuriflux</span>. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
        <p className="cp">{lang === "fr" ? "Fait avec" : "Made with"} <span>♥</span> {lang === "fr" ? "en France" : "in France"}</p>
      </footer>
    </>
  );
}